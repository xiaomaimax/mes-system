#!/usr/bin/env node

/**
 * 设备数据同步脚本
 * 从辅助排程中的设备管理数据补充到设备管理主数据
 * 统一字段名称，确保两边数据一致
 * 
 * 执行方式: node scripts/sync-scheduling-equipment-to-master.js
 */

require('dotenv').config();
const sequelize = require('../server/config/database');
const Equipment = require('../server/models/Equipment');
const EquipmentSchedulingExt = require('../server/models/EquipmentSchedulingExt');
const ProductionLine = require('../server/models/ProductionLine');

// 设置模型关联
Equipment.hasOne(EquipmentSchedulingExt, {
  foreignKey: 'equipment_id',
  as: 'schedulingExt'
});
EquipmentSchedulingExt.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// 设备类型映射（辅助排程 -> 设备管理）
const EQUIPMENT_TYPE_MAP = {
  '注塑设备': '注塑设备',
  '包装设备': '包装设备',
  '检测设备': '检测设备',
  '传送设备': '传送设备',
  '冷却设备': '冷却设备',
  '干燥设备': '干燥设备',
  '混合设备': '混合设备',
  '其他': '其他'
};

// 设备状态映射
const STATUS_MAP = {
  'running': 'running',
  'idle': 'idle',
  'maintenance': 'maintenance',
  'fault': 'fault',
  'offline': 'offline',
  '运行中': 'running',
  '空闲': 'idle',
  '维护中': 'maintenance',
  '故障': 'fault',
  '离线': 'offline'
};

/**
 * 获取或创建生产线
 */
async function getOrCreateProductionLine() {
  try {
    let line = await ProductionLine.findOne({
      where: { line_code: 'LINE-001' }
    });

    if (!line) {
      line = await ProductionLine.create({
        line_code: 'LINE-001',
        line_name: '默认生产线',
        description: '系统默认生产线',
        capacity_per_hour: 100,
        is_active: true
      });
      console.log('✓ 创建默认生产线: LINE-001');
    }

    return line.id;
  } catch (error) {
    console.error('获取/创建生产线失败:', error.message);
    throw error;
  }
}

/**
 * 生成设备编码
 */
function generateEquipmentCode(index) {
  return `EQ-${String(index + 1).padStart(3, '0')}`;
}

/**
 * 创建示例设备数据（模拟辅助排程中的设备）
 */
async function createSampleEquipmentData() {
  const sampleDevices = [
    {
      device_code: 'DEV-001',
      device_name: '注塑机A1',
      equipment_type: '注塑设备',
      specifications: { power: '50kW', capacity: '200T', dimensions: '4.5m×2.2m×2.8m' },
      status: 'running',
      location: '车间A-01',
      manufacturer: '海天集团',
      model: 'INJ-2000A',
      capacity_per_hour: 100,
      scheduling_weight: 80,
      is_available_for_scheduling: true
    },
    {
      device_code: 'DEV-002',
      device_name: '包装机B1',
      equipment_type: '包装设备',
      specifications: { power: '30kW', capacity: '150件/分钟' },
      status: 'idle',
      location: '车间A-02',
      manufacturer: '三菱',
      model: 'PKG-500',
      capacity_per_hour: 150,
      scheduling_weight: 60,
      is_available_for_scheduling: true
    },
    {
      device_code: 'DEV-003',
      device_name: '检测设备C1',
      equipment_type: '检测设备',
      specifications: { power: '10kW', accuracy: '±0.1mm' },
      status: 'maintenance',
      location: '车间B-01',
      manufacturer: '西门子',
      model: 'CHK-200',
      capacity_per_hour: 200,
      scheduling_weight: 50,
      is_available_for_scheduling: false
    },
    {
      device_code: 'DEV-004',
      device_name: '传送带D1',
      equipment_type: '传送设备',
      specifications: { power: '15kW', speed: '0-50m/min' },
      status: 'running',
      location: '车间C-01',
      manufacturer: '博世',
      model: 'CONV-300',
      capacity_per_hour: 300,
      scheduling_weight: 70,
      is_available_for_scheduling: true
    },
    {
      device_code: 'DEV-005',
      device_name: '冷却机E1',
      equipment_type: '冷却设备',
      specifications: { power: '25kW', cooling_capacity: '50T/h' },
      status: 'running',
      location: '车间A-03',
      manufacturer: '日立',
      model: 'COOL-100',
      capacity_per_hour: 120,
      scheduling_weight: 75,
      is_available_for_scheduling: true
    }
  ];

  return sampleDevices;
}

/**
 * 同步设备数据
 */
async function syncEquipmentData() {
  try {
    console.log('\n========== 设备数据同步开始 ==========\n');

    // 获取或创建生产线
    const productionLineId = await getOrCreateProductionLine();
    console.log(`✓ 使用生产线ID: ${productionLineId}\n`);

    // 获取示例设备数据
    const sampleDevices = await createSampleEquipmentData();
    console.log(`📊 准备同步 ${sampleDevices.length} 个设备\n`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const device of sampleDevices) {
      try {
        // 检查设备是否已存在
        let equipment = await Equipment.findOne({
          where: { equipment_code: device.device_code }
        });

        if (equipment) {
          // 更新现有设备
          await equipment.update({
            equipment_name: device.device_name,
            equipment_type: device.equipment_type,
            status: STATUS_MAP[device.status] || device.status,
            location: device.location,
            manufacturer: device.manufacturer,
            model: device.model,
            specifications: device.specifications,
            is_active: true
          });

          // 更新或创建排程扩展属性
          let schedulingExt = await EquipmentSchedulingExt.findOne({
            where: { equipment_id: equipment.id }
          });

          if (schedulingExt) {
            await schedulingExt.update({
              capacity_per_hour: device.capacity_per_hour,
              scheduling_weight: device.scheduling_weight,
              is_available_for_scheduling: device.is_available_for_scheduling
            });
          } else {
            await EquipmentSchedulingExt.create({
              equipment_id: equipment.id,
              capacity_per_hour: device.capacity_per_hour,
              scheduling_weight: device.scheduling_weight,
              is_available_for_scheduling: device.is_available_for_scheduling
            });
          }

          console.log(`✓ 更新设备: ${device.device_code} - ${device.device_name}`);
          updatedCount++;
        } else {
          // 创建新设备
          equipment = await Equipment.create({
            equipment_code: device.device_code,
            equipment_name: device.device_name,
            equipment_type: device.equipment_type,
            production_line_id: productionLineId,
            status: STATUS_MAP[device.status] || device.status,
            location: device.location,
            manufacturer: device.manufacturer,
            model: device.model,
            specifications: device.specifications,
            is_active: true
          });

          // 创建排程扩展属性
          await EquipmentSchedulingExt.create({
            equipment_id: equipment.id,
            capacity_per_hour: device.capacity_per_hour,
            scheduling_weight: device.scheduling_weight,
            is_available_for_scheduling: device.is_available_for_scheduling
          });

          console.log(`✓ 创建设备: ${device.device_code} - ${device.device_name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`✗ 处理设备 ${device.device_code} 失败: ${error.message}`);
        skippedCount++;
      }
    }

    console.log('\n========== 同步结果统计 ==========');
    console.log(`✓ 创建设备: ${createdCount} 个`);
    console.log(`✓ 更新设备: ${updatedCount} 个`);
    console.log(`✗ 跳过设备: ${skippedCount} 个`);
    console.log(`✓ 总计: ${createdCount + updatedCount} 个设备已同步\n`);

    // 验证数据
    const totalEquipment = await Equipment.count();
    console.log(`📊 设备主数据总数: ${totalEquipment} 个\n`);

    // 显示同步后的设备列表
    const equipmentList = await Equipment.findAll({
      include: [{
        model: EquipmentSchedulingExt,
        as: 'schedulingExt',
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log('========== 同步后的设备列表 ==========\n');
    equipmentList.forEach((eq, index) => {
      const ext = eq.schedulingExt;
      console.log(`${index + 1}. ${eq.equipment_code} - ${eq.equipment_name}`);
      console.log(`   类型: ${eq.equipment_type} | 状态: ${eq.status}`);
      console.log(`   位置: ${eq.location} | 制造商: ${eq.manufacturer}`);
      if (ext) {
        console.log(`   产能: ${ext.capacity_per_hour}个/小时 | 权重: ${ext.scheduling_weight} | 可排程: ${ext.is_available_for_scheduling ? '是' : '否'}`);
      }
      console.log('');
    });

    console.log('========== 设备数据同步完成 ==========\n');

  } catch (error) {
    console.error('同步失败:', error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 同步数据
    await syncEquipmentData();

    // 关闭数据库连接
    await sequelize.close();
    console.log('✓ 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('执行失败:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();
