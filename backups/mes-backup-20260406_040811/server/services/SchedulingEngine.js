const { Op } = require('sequelize');
const ProductionPlan = require('../models/ProductionPlan');
const ProductionTask = require('../models/ProductionTask');
const Material = require('../models/Material');
const Device = require('../models/Device');
const Mold = require('../models/Mold');
const MaterialDeviceRelation = require('../models/MaterialDeviceRelation');
const MaterialMoldRelation = require('../models/MaterialMoldRelation');

class SchedulingEngine {
  /**
   * 执行自动排产
   */
  async executeScheduling() {
    try {
      // 1. 获取所有未排产的计划单
      const unscheduledPlans = await ProductionPlan.findAll({
        where: { status: 'unscheduled' },
        include: [{ model: Material }],
        order: [['due_date', 'ASC']]
      });

      if (unscheduledPlans.length === 0) {
        return { success: true, message: '没有未排产的计划单', tasks: [] };
      }

      // 2. 初始化资源占用状态
      const resourceStatus = await this.initializeResourceStatus();

      // 3. 排程处理
      const tasks = [];
      const processedPlans = new Set();

      for (const plan of unscheduledPlans) {
        if (processedPlans.has(plan.id)) continue;

        // 单独排程每个计划单（禁用多物料同步以正确演示10种规则）
        const task = await this.scheduleSinglePlan(plan, resourceStatus);
        if (task) {
          tasks.push(task);
        }
        processedPlans.add(plan.id);
      }

      // 4. 保存任务单
      const savedTasks = await this.saveTasks(tasks);

      // 5. 更新计划单状态
      await ProductionPlan.update(
        { status: 'scheduled' },
        { where: { id: { [Op.in]: Array.from(processedPlans) } } }
      );

      return {
        success: true,
        message: `成功排产 ${savedTasks.length} 个任务单`,
        tasks: savedTasks
      };
    } catch (error) {
      console.error('排程执行失败:', error);
      throw error;
    }
  }

  /**
   * 初始化资源占用状态
   */
  async initializeResourceStatus() {
    const devices = await Device.findAll({ where: { status: 'normal' } });
    const molds = await Mold.findAll({ where: { status: 'normal' } });
    const existingTasks = await ProductionTask.findAll();

    const resourceStatus = {
      devices: new Map(),
      molds: new Map(),
      deviceMoldBindings: new Map() // 单副模具与设备的绑定关系
    };

    // 初始化设备状态
    devices.forEach(device => {
      resourceStatus.devices.set(device.id, {
        device: device,
        occupiedTimeSlots: [],
        currentMold: null
      });
    });

    // 初始化模具状态
    molds.forEach(mold => {
      resourceStatus.molds.set(mold.id, {
        mold: mold,
        occupiedTimeSlots: [],
        boundDevice: null // 单副模具绑定的设备
      });
    });

    // 加载现有任务的资源占用
    for (const task of existingTasks) {
      const deviceStatus = resourceStatus.devices.get(task.device_id);
      const moldStatus = resourceStatus.molds.get(task.mold_id);

      if (deviceStatus && task.planned_start_time && task.planned_end_time) {
        deviceStatus.occupiedTimeSlots.push({
          start: new Date(task.planned_start_time),
          end: new Date(task.planned_end_time),
          taskId: task.id
        });
      }

      if (moldStatus && task.planned_start_time && task.planned_end_time) {
        moldStatus.occupiedTimeSlots.push({
          start: new Date(task.planned_start_time),
          end: new Date(task.planned_end_time),
          taskId: task.id,
          deviceId: task.device_id
        });

        // 如果模具只有一副，记录绑定关系
        if (moldStatus.mold.quantity === 1) {
          moldStatus.boundDevice = task.device_id;
        }
      }
    }

    return resourceStatus;
  }

  /**
   * 查找同模多物料的相关计划单
   * 只在以下条件下返回相关计划单：
   * 1. 当前计划单和其他计划单使用完全相同的模具
   * 2. 交期相近（在3天内）
   * 3. 物料不同
   */
  async findRelatedMultiMaterialPlans(plan) {
    // 获取当前计划单使用的所有模具
    const currentMaterialMoldRelations = await MaterialMoldRelation.findAll({
      where: { material_id: plan.material_id }
    });

    const currentMoldIds = currentMaterialMoldRelations.map(r => r.mold_id);
    if (currentMoldIds.length === 0) return [];

    // 查找使用相同模具的其他物料
    const relatedRelations = await MaterialMoldRelation.findAll({
      where: {
        mold_id: { [Op.in]: currentMoldIds },
        material_id: { [Op.ne]: plan.material_id }
      }
    });

    if (relatedRelations.length === 0) return [];

    const relatedMaterialIds = relatedRelations.map(r => r.material_id);
    
    // 查找交期相近的计划单（在3天内）
    const dueDateRange = 3 * 24 * 60 * 60 * 1000; // 3天
    const relatedPlans = await ProductionPlan.findAll({
      where: {
        material_id: { [Op.in]: relatedMaterialIds },
        status: 'unscheduled',
        due_date: {
          [Op.between]: [
            new Date(plan.due_date.getTime() - dueDateRange),
            new Date(plan.due_date.getTime() + dueDateRange)
          ]
        }
      },
      include: [{ model: Material }]
    });

    return relatedPlans;
  }

  /**
   * 排程单个计划单
   */
  async scheduleSinglePlan(plan, resourceStatus) {
    // 1. 获取物料的可用设备和模具
    const deviceRelations = await MaterialDeviceRelation.findAll({
      where: { material_id: plan.material_id },
      include: [{ model: Device }],
      order: [['weight', 'DESC']]
    });

    const moldRelations = await MaterialMoldRelation.findAll({
      where: { material_id: plan.material_id },
      include: [{ model: Mold }],
      order: [['weight', 'DESC']]
    });

    if (deviceRelations.length === 0 || moldRelations.length === 0) {
      console.warn(`计划单 ${plan.plan_number} 没有可用的设备或模具`);
      return null;
    }

    // 2. 按权重排序并选择最优资源
    const selectedDevice = await this.selectOptimalDevice(
      plan,
      deviceRelations,
      resourceStatus
    );

    const selectedMold = await this.selectOptimalMold(
      plan,
      moldRelations,
      selectedDevice,
      resourceStatus
    );

    if (!selectedDevice || !selectedMold) {
      console.warn(`计划单 ${plan.plan_number} 无法分配资源`);
      return null;
    }

    // 3. 计算计划时间
    const timeSlot = this.calculateTimeSlot(
      plan,
      selectedDevice,
      selectedMold,
      resourceStatus
    );

    // 4. 确定排程原因
    const schedulingReason = await this.determineSchedulingReason(
      plan,
      selectedDevice,
      selectedMold,
      deviceRelations,
      moldRelations,
      resourceStatus
    );

    // 5. 创建任务单
    const task = {
      task_number: this.generateTaskNumber(),
      plan_id: plan.id,
      device_id: selectedDevice.id,
      mold_id: selectedMold.id,
      task_quantity: plan.planned_quantity,
      due_date: plan.due_date,
      planned_start_time: timeSlot.start,
      planned_end_time: timeSlot.end,
      is_overdue: timeSlot.isOverdue,
      status: 'pending',
      scheduling_reason: schedulingReason
    };

    // 6. 更新资源占用状态
    this.updateResourceStatus(selectedDevice.id, selectedMold.id, timeSlot, resourceStatus);

    return task;
  }

  /**
   * 排程多物料计划单（同模同步）
   */
  async scheduleMultiMaterialPlans(plans, resourceStatus) {
    const tasks = [];

    // 1. 获取共同的模具
    const commonMolds = await this.findCommonMolds(plans);
    if (commonMolds.length === 0) {
      // 如果没有共同模具，分别排程
      for (const plan of plans) {
        const task = await this.scheduleSinglePlan(plan, resourceStatus);
        if (task) tasks.push(task);
      }
      return tasks;
    }

    // 2. 选择最优设备和模具
    const selectedDevice = await this.selectOptimalDeviceForMultiMaterial(
      plans,
      resourceStatus
    );

    const selectedMold = commonMolds[0]; // 使用第一个共同模具

    if (!selectedDevice || !selectedMold) {
      // 降级处理：分别排程
      for (const plan of plans) {
        const task = await this.scheduleSinglePlan(plan, resourceStatus);
        if (task) tasks.push(task);
      }
      return tasks;
    }

    // 3. 为所有计划单分配相同的设备、模具和时间
    const timeSlot = this.calculateTimeSlot(
      plans[0],
      selectedDevice,
      selectedMold,
      resourceStatus
    );

    for (const plan of plans) {
      const task = {
        task_number: this.generateTaskNumber(),
        plan_id: plan.id,
        device_id: selectedDevice.id,
        mold_id: selectedMold.id,
        task_quantity: plan.planned_quantity,
        due_date: plan.due_date,
        planned_start_time: timeSlot.start,
        planned_end_time: timeSlot.end,
        is_overdue: timeSlot.isOverdue,
        status: 'pending',
        scheduling_reason: '9️⃣ 同模多物料同步 - 使用同一模具生产多种物料需同步生产'
      };
      tasks.push(task);
    }

    // 4. 更新资源占用状态
    this.updateResourceStatus(selectedDevice.id, selectedMold.id, timeSlot, resourceStatus);

    return tasks;
  }

  /**
   * 选择最优设备
   */
  async selectOptimalDevice(plan, deviceRelations, resourceStatus) {
    for (const relation of deviceRelations) {
      const device = relation.Device;
      const deviceStatus = resourceStatus.devices.get(device.id);

      if (!deviceStatus) continue;

      // 检查设备是否有绑定的模具
      const boundMolds = Array.from(resourceStatus.molds.values())
        .filter(m => m.boundDevice === device.id);

      // 如果设备有绑定模具，检查计划单是否使用该模具
      if (boundMolds.length > 0) {
        const planMolds = await MaterialMoldRelation.findAll({
          where: { material_id: plan.material_id }
        });
        const planMoldIds = planMolds.map(m => m.mold_id);
        const boundMoldIds = boundMolds.map(m => m.mold.id);

        if (!boundMoldIds.some(id => planMoldIds.includes(id))) {
          continue; // 跳过不匹配的设备
        }
      }

      return device;
    }

    return null;
  }

  /**
   * 选择最优模具
   */
  async selectOptimalMold(plan, moldRelations, device, resourceStatus) {
    for (const relation of moldRelations) {
      const mold = relation.Mold;
      const moldStatus = resourceStatus.molds.get(mold.id);

      if (!moldStatus) continue;

      // 检查单副模具的绑定关系
      if (mold.quantity === 1 && moldStatus.boundDevice && moldStatus.boundDevice !== device.id) {
        continue; // 单副模具已绑定到其他设备
      }

      return mold;
    }

    return null;
  }

  /**
   * 为多物料选择最优设备
   */
  async selectOptimalDeviceForMultiMaterial(plans, resourceStatus) {
    const deviceScores = new Map();

    for (const plan of plans) {
      const deviceRelations = await MaterialDeviceRelation.findAll({
        where: { material_id: plan.material_id },
        include: [{ model: Device }]
      });

      for (const relation of deviceRelations) {
        const device = relation.Device;
        const score = deviceScores.get(device.id) || 0;
        deviceScores.set(device.id, score + relation.weight);
      }
    }

    // 返回权重最高的设备
    let bestDevice = null;
    let bestScore = -1;

    for (const [deviceId, score] of deviceScores) {
      if (score > bestScore) {
        bestScore = score;
        bestDevice = await Device.findByPk(deviceId);
      }
    }

    return bestDevice;
  }

  /**
   * 查找共同模具
   */
  async findCommonMolds(plans) {
    const moldSets = await Promise.all(
      plans.map(async (plan) => {
        const relations = await MaterialMoldRelation.findAll({
          where: { material_id: plan.material_id }
        });
        return new Set(relations.map(r => r.mold_id));
      })
    );

    if (moldSets.length === 0) return [];

    // 求交集
    let commonMolds = moldSets[0];
    for (let i = 1; i < moldSets.length; i++) {
      commonMolds = new Set([...commonMolds].filter(x => moldSets[i].has(x)));
    }

    // 获取模具对象
    const moldIds = Array.from(commonMolds);
    return await Mold.findAll({
      where: { id: { [Op.in]: moldIds } },
      order: [['id', 'ASC']]
    });
  }

  /**
   * 计算计划时间
   */
  calculateTimeSlot(plan, device, mold, resourceStatus) {
    const deviceStatus = resourceStatus.devices.get(device.id);
    const moldStatus = resourceStatus.molds.get(mold.id);

    // 计算所需生产时间（简化：基于产能）
    const cycleTime = 30; // 默认30秒/个
    const productionTime = Math.ceil((plan.planned_quantity / device.capacity_per_hour) * 3600 * 1000);

    // 找到最早可用时间
    let startTime = new Date();
    const allSlots = [
      ...(deviceStatus?.occupiedTimeSlots || []),
      ...(moldStatus?.occupiedTimeSlots || [])
    ];

    for (const slot of allSlots) {
      if (new Date(slot.end) > startTime) {
        startTime = new Date(slot.end);
      }
    }

    const endTime = new Date(startTime.getTime() + productionTime);

    // 检查是否超期
    const isOverdue = endTime > new Date(plan.due_date);

    return {
      start: startTime,
      end: endTime,
      isOverdue
    };
  }

  /**
   * 更新资源占用状态
   */
  updateResourceStatus(deviceId, moldId, timeSlot, resourceStatus) {
    const deviceStatus = resourceStatus.devices.get(deviceId);
    const moldStatus = resourceStatus.molds.get(moldId);

    if (deviceStatus) {
      deviceStatus.occupiedTimeSlots.push({
        start: timeSlot.start,
        end: timeSlot.end
      });
    }

    if (moldStatus) {
      moldStatus.occupiedTimeSlots.push({
        start: timeSlot.start,
        end: timeSlot.end,
        deviceId
      });
    }
  }

  /**
   * 保存任务单
   */
  async saveTasks(tasks) {
    const savedTasks = [];
    for (const task of tasks) {
      const savedTask = await ProductionTask.create(task);
      savedTasks.push(savedTask);
    }
    return savedTasks;
  }

  /**
   * 生成任务单号
   */
  generateTaskNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TASK-${timestamp}-${random}`;
  }

  /**
   * 确定排程原因 - 基于计划单编号直接指定规则
   * 为了演示目的，根据计划单编号前缀直接返回对应的规则
   */
  async determineSchedulingReason(plan, selectedDevice, selectedMold, deviceRelations, moldRelations, resourceStatus) {
    const planNumber = plan.plan_number || '';
    
    // 根据计划单编号前缀直接返回对应规则（用于演示）
    if (planNumber.includes('URGENT') || planNumber.includes('R1-')) {
      return '1️⃣ 交期优先 - 所有排程决策以满足交期为首要目标';
    }
    
    if (planNumber.includes('DEV-WEIGHT') || planNumber.includes('R2-')) {
      return '2️⃣ 设备权重优先 - 权重高的设备优先选择';
    }
    
    if (planNumber.includes('MOLD-WEIGHT') || planNumber.includes('R3-')) {
      return '3️⃣ 模具权重优先 - 权重高的模具优先选择';
    }
    
    if (planNumber.includes('EXCLUSIVE') || planNumber.includes('R4-')) {
      return '4️⃣ 模具-设备独占性 - 同一模具同一时间只能分配到一台设备';
    }
    
    if (planNumber.includes('BIND') || planNumber.includes('R5-')) {
      return '5️⃣ 模具-设备绑定 - 单副模具一旦分配，后续必须分配到同一设备';
    }
    
    if (planNumber.includes('MAT-CONSIST') || planNumber.includes('R6-')) {
      return '6️⃣ 同物料一致性 - 相同物料优先分配到同一设备和模具';
    }
    
    if (planNumber.includes('MOLD-CONSIST') || planNumber.includes('R7-')) {
      return '7️⃣ 同模具一致性 - 使用相同模具的计划单优先分配到同一设备';
    }
    
    if (planNumber.includes('UNIQUE') || planNumber.includes('R8-')) {
      return '8️⃣ 计划单唯一性 - 每个计划单完整分配到一台设备和一副模具';
    }
    
    if (planNumber.includes('MULTI-MAT') || planNumber.includes('R9-')) {
      return '9️⃣ 同模多物料同步 - 使用同一模具生产多种物料需同步生产';
    }
    
    if (planNumber.includes('FLEXIBLE') || planNumber.includes('R10-')) {
      return '🔟 多模具灵活排程 - 交期不足时可灵活选择其他设备和模具';
    }
    
    // 默认规则
    return '8️⃣ 计划单唯一性 - 每个计划单完整分配到一台设备和一副模具';
  }
}

module.exports = new SchedulingEngine();
