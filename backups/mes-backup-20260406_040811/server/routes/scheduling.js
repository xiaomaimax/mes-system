const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Material = require('../models/Material');
const Device = require('../models/Device');
const Mold = require('../models/Mold');
const ProductionPlan = require('../models/ProductionPlan');
const ProductionTask = require('../models/ProductionTask');
const MaterialDeviceRelation = require('../models/MaterialDeviceRelation');
const MaterialMoldRelation = require('../models/MaterialMoldRelation');
const ProcessRouting = require('../models/ProcessRouting');
const ProductionOrder = require('../models/ProductionOrder');
const SchedulingEngine = require('../services/SchedulingEngine');
const logger = require('../utils/logger');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { withTransaction } = require('../utils/transaction');

// ==================== 工艺路线管理 ====================

// 查询工艺路线列表
router.get('/process-routings', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { count, rows } = await ProcessRouting.findAndCountAll({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 生产订单管理 ====================

// 查询生产订单列表
router.get('/production-orders', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { count, rows } = await ProductionOrder.findAndCountAll({
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 物料管理 ====================

// 查询物料列表
router.get('/materials', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = status ? { status } : {};

    const { count, rows } = await Material.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增物料
router.post('/materials', async (req, res) => {
  try {
    const { material_code, material_name, material_type, specifications } = req.body;

    const material = await Material.create({
      material_code,
      material_name,
      material_type,
      specifications,
      status: 'active'
    });

    res.json({ success: true, data: material, message: '物料创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 编辑物料
router.put('/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { material_name, material_type, specifications, status } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({ success: false, message: '物料不存在' });
    }

    await material.update({
      material_name,
      material_type,
      specifications,
      status
    });

    res.json({ success: true, data: material, message: '物料更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除物料
router.delete('/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id);

    if (!material) {
      return res.status(404).json({ success: false, message: '物料不存在' });
    }

    await material.destroy();
    res.json({ success: true, message: '物料删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 设备管理 ====================

// 查询设备列表
router.get('/devices', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = status ? { status } : {};

    const { count, rows } = await Device.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增设备
router.post('/devices', async (req, res) => {
  try {
    const { device_code, device_name, specifications, capacity_per_hour } = req.body;

    const device = await Device.create({
      device_code,
      device_name,
      specifications,
      capacity_per_hour,
      status: 'normal'
    });

    res.json({ success: true, data: device, message: '设备创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 编辑设备
router.put('/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { device_name, specifications, status, capacity_per_hour } = req.body;

    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ success: false, message: '设备不存在' });
    }

    await device.update({
      device_name,
      specifications,
      status,
      capacity_per_hour
    });

    res.json({ success: true, data: device, message: '设备更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除设备
router.delete('/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ success: false, message: '设备不存在' });
    }

    await device.destroy();
    res.json({ success: true, message: '设备删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 模具管理 ====================

// 查询模具列表
router.get('/molds', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = status ? { status } : {};

    const { count, rows } = await Mold.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增模具
router.post('/molds', async (req, res) => {
  try {
    const { mold_code, mold_name, specifications, quantity } = req.body;

    const mold = await Mold.create({
      mold_code,
      mold_name,
      specifications,
      quantity: quantity || 1,
      status: 'normal'
    });

    res.json({ success: true, data: mold, message: '模具创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 编辑模具
router.put('/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mold_name, specifications, quantity, status } = req.body;

    const mold = await Mold.findByPk(id);
    if (!mold) {
      return res.status(404).json({ success: false, message: '模具不存在' });
    }

    await mold.update({
      mold_name,
      specifications,
      quantity,
      status
    });

    res.json({ success: true, data: mold, message: '模具更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除模具
router.delete('/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mold = await Mold.findByPk(id);

    if (!mold) {
      return res.status(404).json({ success: false, message: '模具不存在' });
    }

    await mold.destroy();
    res.json({ success: true, message: '模具删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 关系配置 ====================

// 查询物料-设备关系
router.get('/material-device-relations', async (req, res) => {
  try {
    const { material_id, device_id } = req.query;
    const where = {};
    if (material_id) where.material_id = material_id;
    if (device_id) where.device_id = device_id;

    const relations = await MaterialDeviceRelation.findAll({
      where,
      include: [
        { model: Material },
        { model: Device }
      ]
    });

    res.json({ success: true, data: relations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增物料-设备关系
router.post('/material-device-relations', async (req, res) => {
  try {
    const { material_id, device_id, weight } = req.body;

    const relation = await MaterialDeviceRelation.create({
      material_id,
      device_id,
      weight: weight || 50
    });

    res.json({ success: true, data: relation, message: '关系创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 编辑物料-设备关系
router.put('/material-device-relations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight } = req.body;

    const relation = await MaterialDeviceRelation.findByPk(id);
    if (!relation) {
      return res.status(404).json({ success: false, message: '关系不存在' });
    }

    await relation.update({ weight });
    res.json({ success: true, data: relation, message: '关系更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 查询物料-模具关系
router.get('/material-mold-relations', async (req, res) => {
  try {
    const { material_id, mold_id } = req.query;
    const where = {};
    if (material_id) where.material_id = material_id;
    if (mold_id) where.mold_id = mold_id;

    const relations = await MaterialMoldRelation.findAll({
      where,
      include: [
        { model: Material },
        { model: Mold }
      ]
    });

    res.json({ success: true, data: relations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增物料-模具关系
router.post('/material-mold-relations', async (req, res) => {
  try {
    const { material_id, mold_id, weight, cycle_time, output_per_cycle } = req.body;

    const relation = await MaterialMoldRelation.create({
      material_id,
      mold_id,
      weight: weight || 50,
      cycle_time: cycle_time || 0,
      output_per_cycle: output_per_cycle || 1
    });

    res.json({ success: true, data: relation, message: '关系创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 编辑物料-模具关系
router.put('/material-mold-relations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, cycle_time, output_per_cycle } = req.body;

    const relation = await MaterialMoldRelation.findByPk(id);
    if (!relation) {
      return res.status(404).json({ success: false, message: '关系不存在' });
    }

    await relation.update({
      weight,
      cycle_time,
      output_per_cycle
    });

    res.json({ success: true, data: relation, message: '关系更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 计划单管理 ====================

// 查询计划单列表
router.get('/plans', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, material_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (material_id) where.material_id = material_id;

    const { count, rows } = await ProductionPlan.findAndCountAll({
      where,
      include: [{ model: Material }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['due_date', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 新增计划单
router.post('/plans', async (req, res) => {
  try {
    const { plan_number, material_id, planned_quantity, due_date, process_route_number, order_number, customer } = req.body;

    const plan = await ProductionPlan.create({
      plan_number,
      material_id,
      planned_quantity,
      due_date,
      process_route_number,
      order_number,
      customer,
      status: 'unscheduled'
    });

    res.json({ success: true, data: plan, message: '计划单创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量导入计划单 - 使用事务处理
router.post('/plans/import', asyncHandler(async (req, res) => {
  const { plans } = req.body;

  if (!Array.isArray(plans) || plans.length === 0) {
    throw new ValidationError('计划单数据为空', ['请提供有效的计划单数据']);
  }

  const result = await withTransaction(async (transaction) => {
    const createdPlans = [];
    
    for (const plan of plans) {
      const created = await ProductionPlan.create({
        plan_number: plan.plan_number,
        material_id: plan.material_id,
        planned_quantity: plan.planned_quantity,
        due_date: plan.due_date,
        process_route_number: plan.process_route_number,
        order_number: plan.order_number,
        customer: plan.customer,
        status: 'unscheduled'
      }, { transaction });
      
      createdPlans.push(created);
    }

    logger.info('批量导入计划单成功', {
      count: createdPlans.length
    });

    return createdPlans;
  });

  res.json({
    success: true,
    data: result,
    message: `成功导入 ${result.length} 个计划单`
  });
}));

// 编辑计划单
router.put('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { planned_quantity, due_date, status, process_route_number, order_number, customer } = req.body;

    const plan = await ProductionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: '计划单不存在' });
    }

    await plan.update({
      planned_quantity,
      due_date,
      status,
      process_route_number,
      order_number,
      customer
    });

    res.json({ success: true, data: plan, message: '计划单更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除计划单
router.delete('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ProductionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ success: false, message: '计划单不存在' });
    }

    await plan.destroy();
    res.json({ success: true, message: '计划单删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 排程执行 ====================

// 执行自动排产
router.post('/execute', async (req, res) => {
  try {
    const result = await SchedulingEngine.executeScheduling();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 重置排程结果 - 使用事务处理
router.post('/reset', asyncHandler(async (req, res) => {
  const result = await withTransaction(async (transaction) => {
    // 删除所有任务单
    const deletedTasks = await ProductionTask.destroy({ 
      where: {},
      transaction 
    });
    
    // 重置所有计划单状态为未排产
    const updatedPlans = await ProductionPlan.update(
      { status: 'unscheduled' },
      { where: {}, transaction }
    );

    logger.info('排程结果重置成功', {
      deletedTasks,
      updatedPlans: updatedPlans[0]
    });

    return { deletedTasks, updatedPlans: updatedPlans[0] };
  });

  res.json({
    success: true,
    message: '排程结果已重置，所有计划单恢复到未排产状态',
    data: result
  });
}));

// ==================== 任务单管理 ====================

// 查询任务单列表
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, device_id, mold_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (device_id) where.device_id = device_id;
    if (mold_id) where.mold_id = mold_id;

    const { count, rows } = await ProductionTask.findAndCountAll({
      where,
      include: [
        { model: ProductionPlan, include: [{ model: Material }] },
        { model: Device },
        { model: Mold }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['due_date', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 查询任务单详情
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await ProductionTask.findByPk(id, {
      include: [
        { model: ProductionPlan, include: [{ model: Material }] },
        { model: Device },
        { model: Mold }
      ]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务单不存在' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 手动调整任务单
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { device_id, mold_id, planned_start_time, planned_end_time, status } = req.body;

    const task = await ProductionTask.findByPk(id);
    if (!task) {
      return res.status(404).json({ success: false, message: '任务单不存在' });
    }

    await task.update({
      device_id: device_id || task.device_id,
      mold_id: mold_id || task.mold_id,
      planned_start_time: planned_start_time || task.planned_start_time,
      planned_end_time: planned_end_time || task.planned_end_time,
      status: status || task.status
    });

    res.json({ success: true, data: task, message: '任务单更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除任务单 - 使用事务处理
router.delete('/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await withTransaction(async (transaction) => {
    const task = await ProductionTask.findByPk(id, { transaction });

    if (!task) {
      throw new NotFoundError('任务单不存在');
    }

    // 获取关联的计划单ID
    const planId = task.plan_id;

    await task.destroy({ transaction });

    // 如果该计划单没有其他任务单了，将计划单状态改回未排产
    if (planId) {
      const remainingTasks = await ProductionTask.count({ 
        where: { plan_id: planId },
        transaction 
      });
      
      if (remainingTasks === 0) {
        await ProductionPlan.update(
          { status: 'unscheduled' },
          { where: { id: planId }, transaction }
        );
      }
    }

    logger.info('任务单删除成功', {
      taskId: id,
      planId
    });

    return { id, planId };
  });

  res.json({ 
    success: true, 
    message: '任务单删除成功',
    data: result 
  });
}));

// 导入ERP任务单 - 使用事务处理
router.post('/tasks/import-erp', asyncHandler(async (req, res) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new ValidationError('任务单数据为空', ['请提供有效的任务单数据']);
  }

  const result = await withTransaction(async (transaction) => {
    let updatedCount = 0;
    const results = [];

    for (const taskData of tasks) {
      const task = await ProductionTask.findOne({
        where: { plan_id: taskData.plan_id },
        transaction
      });

      if (task) {
        await task.update({
          erp_task_number: taskData.erp_task_number
        }, { transaction });
        
        updatedCount++;
        results.push({ plan_id: taskData.plan_id, success: true });
      } else {
        results.push({ plan_id: taskData.plan_id, success: false });
      }
    }

    logger.info('ERP任务单导入成功', {
      totalCount: tasks.length,
      updatedCount
    });

    return { updatedCount, results };
  });

  res.json({
    success: true,
    message: `成功更新 ${result.updatedCount} 个任务单的ERP任务单号`,
    data: result
  });
}));

// ==================== 排程结果展示 ====================

// 查询排程结果（按设备分组）
router.get('/results', async (req, res) => {
  try {
    const tasks = await ProductionTask.findAll({
      include: [
        { model: ProductionPlan, include: [{ model: Material }] },
        { model: Device },
        { model: Mold }
      ],
      order: [['device_id', 'ASC'], ['planned_start_time', 'ASC']]
    });

    // 按设备分组
    const groupedByDevice = {};
    tasks.forEach(task => {
      const deviceId = task.device_id;
      if (!groupedByDevice[deviceId]) {
        groupedByDevice[deviceId] = {
          device: task.Device,
          tasks: []
        };
      }
      groupedByDevice[deviceId].tasks.push(task);
    });

    res.json({
      success: true,
      data: Object.values(groupedByDevice)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
