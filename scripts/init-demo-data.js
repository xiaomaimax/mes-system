/**
 * 演示数据初始化脚本
 * 用于初始化MES系统的完整演示数据集
 * 
 * 使用方法:
 * node scripts/init-demo-data.js
 */

require('dotenv').config();

const sequelize = require('../server/config/database');
const logger = require('../server/utils/logger');
const { withTransaction } = require('../server/utils/transaction');

// 导入所有模型
const {
  ProductionLine,
  Equipment,
  Mold,
  Material,
  Device,
  User,
  ProductionOrder,
  ProductionPlan,
  ProductionTask,
  ProcessRouting,
  ProcessParameters,
  DailyProductionReport,
  QualityInspection,
  DefectRecord,
  Inventory,
  InventoryTransaction,
  EquipmentMaintenance,
  MoldEquipmentRelation
} = require('../server/models');

/**
 * 初始化统计信息
 */
const stats = {
  productionLines: 0,
  equipment: 0,
  molds: 0,
  materials: 0,
  productionPlans: 0,
  productionTasks: 0,
  qualityInspections: 0,
  defectRecords: 0,
  inventory: 0,
  inventoryTransactions: 0,
  equipmentMaintenance: 0,
  moldEquipmentRelations: 0
};

/**
 * 清空现有数据（可选）
 */
async function clearExistingData(transaction) {
  logger.info('开始清空现有数据...');
  
  try {
    // 禁用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
    
    // 按照外键依赖关系的逆序删除
    await InventoryTransaction.destroy({ where: {}, transaction });
    await Inventory.destroy({ where: {}, transaction });
    await EquipmentMaintenance.destroy({ where: {}, transaction });
    await DefectRecord.destroy({ where: {}, transaction });
    await QualityInspection.destroy({ where: {}, transaction });
    await ProductionTask.destroy({ where: {}, transaction });
    await ProductionPlan.destroy({ where: {}, transaction });
    await ProcessParameters.destroy({ where: {}, transaction });
    await ProcessRouting.destroy({ where: {}, transaction });
    await DailyProductionReport.destroy({ where: {}, transaction });
    
    // 尝试删除MoldEquipmentRelation，如果表不存在则跳过
    try {
      await MoldEquipmentRelation.destroy({ where: {}, transaction });
    } catch (error) {
      if (!error.message.includes("doesn't exist")) {
        logger.warn('MoldEquipmentRelation删除失败', { error: error.message });
      }
    }
    
    await Mold.destroy({ where: {}, transaction });
    await Equipment.destroy({ where: {}, transaction });
    await Material.destroy({ where: {}, transaction });
    await ProductionLine.destroy({ where: {}, transaction });
    await ProductionOrder.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });
    await Device.destroy({ where: {}, transaction });
    
    // 重新启用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
    
    logger.info('现有数据清空完成');
  } catch (error) {
    logger.error('清空数据失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化生产线数据
 */
async function initProductionLines(transaction) {
  logger.info('开始初始化生产线数据...');
  
  const productionLines = [
    {
      line_code: 'PL001',
      line_name: '注塑生产线1号',
      description: '用于小型塑料件的注塑生产',
      capacity_per_hour: 500,
      is_active: true
    },
    {
      line_code: 'PL002',
      line_name: '注塑生产线2号',
      description: '用于中型塑料件的注塑生产',
      capacity_per_hour: 400,
      is_active: true
    },
    {
      line_code: 'PL003',
      line_name: '注塑生产线3号',
      description: '用于大型塑料件的注塑生产',
      capacity_per_hour: 300,
      is_active: true
    },
    {
      line_code: 'PL004',
      line_name: '组装生产线',
      description: '用于产品组装和包装',
      capacity_per_hour: 600,
      is_active: true
    }
  ];
  
  try {
    const created = await ProductionLine.bulkCreate(productionLines, { transaction });
    stats.productionLines = created.length;
    logger.info(`生产线数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('生产线数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化设备数据
 */
async function initEquipment(productionLines, transaction) {
  logger.info('开始初始化设备数据...');
  
  const equipment = [
    {
      equipment_code: 'EQ001',
      equipment_name: '注塑机1',
      equipment_type: '注塑机',
      production_line_id: productionLines[0].id,
      model: 'JSM-500',
      manufacturer: '海天集团',
      purchase_date: new Date('2022-01-15'),
      is_active: true
    },
    {
      equipment_code: 'EQ002',
      equipment_name: '注塑机2',
      equipment_type: '注塑机',
      production_line_id: productionLines[0].id,
      model: 'JSM-500',
      manufacturer: '海天集团',
      purchase_date: new Date('2022-02-20'),
      is_active: true
    },
    {
      equipment_code: 'EQ003',
      equipment_name: '注塑机3',
      equipment_type: '注塑机',
      production_line_id: productionLines[1].id,
      model: 'JSM-800',
      manufacturer: '海天集团',
      purchase_date: new Date('2022-03-10'),
      is_active: true
    },
    {
      equipment_code: 'EQ004',
      equipment_name: '冷却塔',
      equipment_type: '冷却设备',
      production_line_id: productionLines[1].id,
      model: 'CT-100',
      manufacturer: '冷王',
      purchase_date: new Date('2021-12-01'),
      is_active: true
    },
    {
      equipment_code: 'EQ005',
      equipment_name: '干燥机',
      equipment_type: '干燥设备',
      production_line_id: productionLines[2].id,
      model: 'DRY-50',
      manufacturer: '烘干王',
      purchase_date: new Date('2022-01-05'),
      is_active: true
    },
    {
      equipment_code: 'EQ006',
      equipment_name: '包装机',
      equipment_type: '包装设备',
      production_line_id: productionLines[3].id,
      model: 'PKG-200',
      manufacturer: '包装通',
      purchase_date: new Date('2022-04-01'),
      is_active: true
    }
  ];
  
  try {
    const created = await Equipment.bulkCreate(equipment, { transaction });
    stats.equipment = created.length;
    logger.info(`设备数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('设备数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化模具数据
 */
async function initMolds(transaction) {
  logger.info('开始初始化模具数据...');
  
  const molds = [
    {
      mold_code: 'MD001',
      mold_name: '手机壳模具A',
      specifications: '4腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD002',
      mold_name: '手机壳模具B',
      specifications: '4腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD003',
      mold_name: '电池盖模具',
      specifications: '8腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD004',
      mold_name: '屏幕框模具',
      specifications: '2腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD005',
      mold_name: '按键模具',
      specifications: '16腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD006',
      mold_name: '连接器模具',
      specifications: '6腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD007',
      mold_name: '支架模具',
      specifications: '4腔',
      quantity: 1,
      status: 'normal'
    },
    {
      mold_code: 'MD008',
      mold_name: '垫片模具',
      specifications: '12腔',
      quantity: 1,
      status: 'normal'
    }
  ];
  
  try {
    const created = await Mold.bulkCreate(molds, { transaction });
    stats.molds = created.length;
    logger.info(`模具数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('模具数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化物料数据
 */
async function initMaterials(transaction) {
  logger.info('开始初始化物料数据...');
  
  const materials = [
    {
      material_code: 'MAT001',
      material_name: 'ABS黑色',
      material_type: '工程塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT002',
      material_name: 'ABS白色',
      material_type: '工程塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT003',
      material_name: 'PC透明',
      material_type: '工程塑料',
      specifications: '光学级',
      status: 'active'
    },
    {
      material_code: 'MAT004',
      material_name: 'POM黑色',
      material_type: '工程塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT005',
      material_name: 'PA6玻纤',
      material_type: '工程塑料',
      specifications: '30%玻纤',
      status: 'active'
    },
    {
      material_code: 'MAT006',
      material_name: 'TPE黑色',
      material_type: '弹性体',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT007',
      material_name: 'PMMA透明',
      material_type: '工程塑料',
      specifications: '光学级',
      status: 'active'
    },
    {
      material_code: 'MAT008',
      material_name: 'PP白色',
      material_type: '通用塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT009',
      material_name: 'PE黑色',
      material_type: '通用塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT010',
      material_name: 'PVC灰色',
      material_type: '通用塑料',
      specifications: '标准级',
      status: 'active'
    },
    {
      material_code: 'MAT011',
      material_name: '色母粒',
      material_type: '辅助材料',
      specifications: '通用',
      status: 'active'
    }
  ];
  
  try {
    const created = await Material.bulkCreate(materials, { transaction });
    stats.materials = created.length;
    logger.info(`物料数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('物料数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 建立模具与设备的关联
 */
async function createMoldEquipmentRelations(molds, equipment, transaction) {
  logger.info('开始建立模具与设备的关联...');
  
  try {
    const relations = [];
    
    // 模具MD001-MD003与注塑机EQ001-EQ003关联
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        relations.push({
          mold_id: molds[i].id,
          equipment_id: equipment[j].id,
          is_primary: i === j
        });
      }
    }
    
    // 模具MD004-MD008与注塑机EQ001-EQ003关联
    for (let i = 3; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        relations.push({
          mold_id: molds[i].id,
          equipment_id: equipment[j].id,
          is_primary: (i - 3) === j
        });
      }
    }
    
    const created = await MoldEquipmentRelation.bulkCreate(relations, { transaction });
    stats.moldEquipmentRelations = created.length;
    logger.info(`模具与设备关联创建完成，共创建 ${created.length} 条关联`);
  } catch (error) {
    if (error.message.includes("doesn't exist")) {
      logger.warn('MoldEquipmentRelation表不存在，跳过关联创建');
      stats.moldEquipmentRelations = 0;
    } else {
      logger.error('模具与设备关联创建失败', { error: error.message });
      throw error;
    }
  }
}

/**
 * 初始化设备数据（Device表）
 */
async function initDevices(transaction) {
  logger.info('开始初始化设备数据（Device表）...');
  
  const devices = [
    {
      device_code: 'DEV001',
      device_name: '注塑机1',
      specifications: '500T',
      status: 'normal',
      capacity_per_hour: 500
    },
    {
      device_code: 'DEV002',
      device_name: '注塑机2',
      specifications: '500T',
      status: 'normal',
      capacity_per_hour: 500
    },
    {
      device_code: 'DEV003',
      device_name: '注塑机3',
      specifications: '800T',
      status: 'normal',
      capacity_per_hour: 400
    }
  ];
  
  try {
    const created = await Device.bulkCreate(devices, { transaction });
    logger.info(`设备数据（Device表）初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('设备数据（Device表）初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化生产计划数据
 */
async function initProductionPlans(materials, transaction) {
  logger.info('开始初始化生产计划数据...');
  
  const plans = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 10; i++) {
    const planDate = new Date(baseDate);
    planDate.setDate(planDate.getDate() + i);
    
    plans.push({
      plan_number: `PLAN${String(i + 1).padStart(4, '0')}`,
      material_id: materials[i % materials.length].id,
      planned_quantity: 1000 + i * 100,
      due_date: planDate,
      status: i < 3 ? 'scheduled' : i < 6 ? 'scheduled' : 'unscheduled'
    });
  }
  
  try {
    const created = await ProductionPlan.bulkCreate(plans, { transaction });
    stats.productionPlans = created.length;
    logger.info(`生产计划数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('生产计划数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化生产任务数据
 */
async function initProductionTasks(plans, devices, molds, transaction) {
  logger.info('开始初始化生产任务数据...');
  
  const tasks = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < plans.length; i++) {
    for (let j = 0; j < 2; j++) {
      const taskDate = new Date(baseDate);
      taskDate.setDate(taskDate.getDate() + i);
      
      tasks.push({
        task_number: `TASK${String(i * 2 + j + 1).padStart(5, '0')}`,
        plan_id: plans[i].id,
        device_id: devices[j % devices.length].id,
        mold_id: molds[j % molds.length].id,
        task_quantity: 500 + j * 50,
        due_date: taskDate,
        status: i < 3 ? 'completed' : i < 6 ? 'in_progress' : 'pending'
      });
    }
  }
  
  try {
    const created = await ProductionTask.bulkCreate(tasks, { transaction });
    stats.productionTasks = created.length;
    logger.info(`生产任务数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('生产任务数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化用户数据
 */
async function initUsers(transaction) {
  logger.info('开始初始化用户数据...');
  
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      email: 'admin@mes.com',
      full_name: '系统管理员',
      role: 'admin',
      department: '管理部',
      is_active: true
    },
    {
      username: 'inspector1',
      password: 'inspector123',
      email: 'inspector1@mes.com',
      full_name: '质检员1',
      role: 'quality_inspector',
      department: '质检部',
      is_active: true
    },
    {
      username: 'operator1',
      password: 'operator123',
      email: 'operator1@mes.com',
      full_name: '操作员1',
      role: 'operator',
      department: '生产部',
      is_active: true
    }
  ];
  
  try {
    const created = await User.bulkCreate(users, { transaction });
    logger.info(`用户数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('用户数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化生产订单数据
 */
async function initProductionOrders(productionLines, users, transaction) {
  logger.info('开始初始化生产订单数据...');
  
  const orders = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 5; i++) {
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + i * 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);
    
    orders.push({
      order_number: `ORD${String(i + 1).padStart(5, '0')}`,
      product_code: `PROD${String(i + 1).padStart(3, '0')}`,
      product_name: `产品${i + 1}`,
      planned_quantity: 5000 + i * 500,
      produced_quantity: i < 2 ? 5000 + i * 500 : i < 4 ? 2500 + i * 250 : 0,
      qualified_quantity: i < 2 ? 4900 + i * 490 : i < 4 ? 2450 + i * 245 : 0,
      defective_quantity: i < 2 ? 100 + i * 10 : i < 4 ? 50 + i * 5 : 0,
      status: i < 2 ? 'completed' : i < 4 ? 'in_progress' : 'pending',
      priority: ['low', 'normal', 'high', 'urgent'][i % 4],
      production_line_id: productionLines[i % productionLines.length].id,
      planned_start_time: startDate,
      planned_end_time: endDate,
      actual_start_time: i < 2 ? startDate : null,
      actual_end_time: i < 2 ? new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
      created_by: users[0].id,
      notes: `生产订单${i + 1}`
    });
  }
  
  try {
    const created = await ProductionOrder.bulkCreate(orders, { transaction });
    logger.info(`生产订单数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('生产订单数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化质量检验数据
 */
async function initQualityInspections(productionOrders, users, transaction) {
  logger.info('开始初始化质量检验数据...');
  
  const inspections = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 15; i++) {
    const inspectionDate = new Date(baseDate);
    inspectionDate.setDate(inspectionDate.getDate() + Math.floor(i / 3));
    
    const inspectedQty = 100;
    const qualifiedQty = i % 2 === 0 ? 100 : 98;
    const defectiveQty = inspectedQty - qualifiedQty;
    
    inspections.push({
      production_order_id: productionOrders[i % productionOrders.length].id,
      inspection_type: ['incoming', 'in_process', 'final'][i % 3],
      inspected_quantity: inspectedQty,
      qualified_quantity: qualifiedQty,
      defective_quantity: defectiveQty,
      quality_rate: (qualifiedQty / inspectedQty * 100).toFixed(2),
      inspector_id: users[1].id,
      inspection_date: inspectionDate,
      notes: `质量检验记录${i + 1}`
    });
  }
  
  try {
    const created = await QualityInspection.bulkCreate(inspections, { transaction });
    stats.qualityInspections = created.length;
    logger.info(`质量检验数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('质量检验数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化缺陷记录数据
 */
async function initDefectRecords(transaction) {
  logger.info('开始初始化缺陷记录数据...');
  
  const defects = [
    {
      defect_code: 'DEF001',
      defect_name: '表面划伤',
      defect_category: '表面缺陷',
      severity: 'minor',
      description: '产品表面有划伤'
    },
    {
      defect_code: 'DEF002',
      defect_name: '尺寸超差',
      defect_category: '尺寸不符',
      severity: 'major',
      description: '产品尺寸超出公差范围'
    },
    {
      defect_code: 'DEF003',
      defect_name: '功能异常',
      defect_category: '功能异常',
      severity: 'critical',
      description: '产品功能不正常'
    },
    {
      defect_code: 'DEF004',
      defect_name: '装配错误',
      defect_category: '装配错误',
      severity: 'major',
      description: '产品装配有误'
    },
    {
      defect_code: 'DEF005',
      defect_name: '颜色不符',
      defect_category: '外观缺陷',
      severity: 'minor',
      description: '产品颜色与要求不符'
    },
    {
      defect_code: 'DEF006',
      defect_name: '缺少零件',
      defect_category: '装配错误',
      severity: 'critical',
      description: '产品缺少必要零件'
    },
    {
      defect_code: 'DEF007',
      defect_name: '毛刺',
      defect_category: '表面缺陷',
      severity: 'minor',
      description: '产品有毛刺'
    },
    {
      defect_code: 'DEF008',
      defect_name: '变形',
      defect_category: '外观缺陷',
      severity: 'major',
      description: '产品变形'
    }
  ];
  
  try {
    const created = await DefectRecord.bulkCreate(defects, { transaction });
    stats.defectRecords = created.length;
    logger.info(`缺陷记录数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('缺陷记录数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化库存数据
 */
async function initInventory(materials, transaction) {
  logger.info('开始初始化库存数据...');
  
  const inventory = [];
  
  for (let i = 0; i < 20; i++) {
    inventory.push({
      material_id: materials[i % materials.length].id,
      warehouse_location: `A${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
      current_stock: 1000 + i * 100,
      min_stock: 500,
      max_stock: 5000,
      unit: 'kg'
    });
  }
  
  try {
    const created = await Inventory.bulkCreate(inventory, { transaction });
    stats.inventory = created.length;
    logger.info(`库存数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('库存数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化出入库记录数据
 */
async function initInventoryTransactions(materials, users, transaction) {
  logger.info('开始初始化出入库记录数据...');
  
  const transactions = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 30; i++) {
    const transactionDate = new Date(baseDate);
    transactionDate.setDate(transactionDate.getDate() + Math.floor(i / 3));
    
    transactions.push({
      material_id: materials[i % materials.length].id,
      transaction_type: i % 2 === 0 ? 'in_stock' : 'out_stock',
      quantity: 100 + i * 10,
      reference_type: i % 2 === 0 ? 'purchase' : 'production',
      reference_id: `REF${String(i + 1).padStart(5, '0')}`,
      operator_id: users[2].id,
      transaction_date: transactionDate,
      notes: i % 2 === 0 ? '采购入库' : '生产领用'
    });
  }
  
  try {
    const created = await InventoryTransaction.bulkCreate(transactions, { transaction });
    stats.inventoryTransactions = created.length;
    logger.info(`出入库记录数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('出入库记录数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 初始化设备维护数据
 */
async function initEquipmentMaintenance(devices, users, transaction) {
  logger.info('开始初始化设备维护数据...');
  
  const maintenance = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 10; i++) {
    const maintenanceDate = new Date(baseDate);
    maintenanceDate.setDate(maintenanceDate.getDate() + i);
    
    const completionDate = i < 5 ? new Date(maintenanceDate.getTime() + 24 * 60 * 60 * 1000) : null;
    
    maintenance.push({
      device_id: devices[i % devices.length].id,
      maintenance_type: ['preventive', 'corrective', 'inspection'][i % 3],
      maintenance_date: maintenanceDate,
      completion_date: completionDate,
      description: `设备维护记录${i + 1}`,
      technician_id: users[0].id,
      status: i < 5 ? 'completed' : 'pending',
      notes: `维护备注${i + 1}`
    });
  }
  
  try {
    const created = await EquipmentMaintenance.bulkCreate(maintenance, { transaction });
    stats.equipmentMaintenance = created.length;
    logger.info(`设备维护数据初始化完成，共创建 ${created.length} 条记录`);
    return created;
  } catch (error) {
    logger.error('设备维护数据初始化失败', { error: error.message });
    throw error;
  }
}

/**
 * 主初始化函数
 */
async function initializeDemoData() {
  logger.info('========== 演示数据初始化开始 ==========');
  
  try {
    // 使用事务确保数据一致性
    await withTransaction(async (transaction) => {
      // 清空现有数据
      await clearExistingData(transaction);
      
      // 初始化基础数据
      const productionLines = await initProductionLines(transaction);
      const equipment = await initEquipment(productionLines, transaction);
      const molds = await initMolds(transaction);
      const materials = await initMaterials(transaction);
      const devices = await initDevices(transaction);
      const users = await initUsers(transaction);
      
      // 建立关联关系
      await createMoldEquipmentRelations(molds, equipment, transaction);
      
      // 初始化业务数据
      const plans = await initProductionPlans(materials, transaction);
      await initProductionTasks(plans, devices, molds, transaction);
      const productionOrders = await initProductionOrders(productionLines, users, transaction);
      
      // 初始化质量和库存数据
      await initQualityInspections(productionOrders, users, transaction);
      await initDefectRecords(transaction);
      await initInventory(materials, transaction);
      try {
        await initInventoryTransactions(materials, users, transaction);
      } catch (error) {
        logger.warn('出入库记录初始化失败，跳过', { error: error.message });
      }
      await initEquipmentMaintenance(devices, users, transaction);
    });
    
    // 输出统计信息
    logger.info('========== 演示数据初始化完成 ==========');
    logger.info('初始化统计信息:', stats);
    
    console.log('\n========== 演示数据初始化统计 ==========');
    console.log(`生产线: ${stats.productionLines} 条`);
    console.log(`设备: ${stats.equipment} 条`);
    console.log(`模具: ${stats.molds} 条`);
    console.log(`物料: ${stats.materials} 条`);
    console.log(`生产计划: ${stats.productionPlans} 条`);
    console.log(`生产任务: ${stats.productionTasks} 条`);
    console.log(`质量检验: ${stats.qualityInspections} 条`);
    console.log(`缺陷记录: ${stats.defectRecords} 条`);
    console.log(`库存: ${stats.inventory} 条`);
    console.log(`出入库记录: ${stats.inventoryTransactions} 条`);
    console.log(`设备维护: ${stats.equipmentMaintenance} 条`);
    console.log(`模具设备关联: ${stats.moldEquipmentRelations} 条`);
    console.log('=====================================\n');
    
    process.exit(0);
  } catch (error) {
    logger.error('演示数据初始化失败', { error: error.message, stack: error.stack });
    console.error('\n演示数据初始化失败:', error.message);
    process.exit(1);
  }
}

// 执行初始化
initializeDemoData();
