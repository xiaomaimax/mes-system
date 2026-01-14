/**
 * 设备数据迁移脚本
 * 将现有排程设备数据映射到设备主数据
 * 创建设备排程扩展记录
 * Requirements: 5.1
 */

const sequelize = require('../server/config/database');
const {
  Equipment,
  Device,
  EquipmentSchedulingExt,
  MoldEquipmentRelation,
  Mold
} = require('../server/models');
const fs = require('fs');
const path = require('path');

// 迁移日志配置
const logDir = path.join(__dirname, '../migration-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `equipment-migration-${new Date().toISOString().split('T')[0]}.log`);
const backupFile = path.join(logDir, `equipment-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function backupData() {
  try {
    log('开始备份设备数据...');
    
    const devices = await Device.findAll({ raw: true });
    const equipments = await Equipment.findAll({ raw: true });
    const extensions = await EquipmentSchedulingExt.findAll({ raw: true });
    
    const backup = {
      timestamp: new Date().toISOString(),
      devices,
      equipments,
      extensions,
      summary: {
        deviceCount: devices.length,
        equipmentCount: equipments.length,
        extensionCount: extensions.length
      }
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    log(`✓ 备份完成，文件: ${backupFile}`);
    log(`  - 设备数: ${devices.length}`);
    log(`  - 设备主表数: ${equipments.length}`);
    log(`  - 排程扩展数: ${extensions.length}`);
    
    return backup;
  } catch (error) {
    log(`✗ 备份失败: ${error.message}`);
    throw error;
  }
}

async function migrateEquipmentData() {
  try {
    log('开始迁移设备数据...');
    
    // 获取所有排程设备
    const devices = await Device.findAll({ raw: true });
    log(`找到 ${devices.length} 条排程设备记录`);
    
    let successCount = 0;
    let skipCount = 0;
    const conflicts = [];
    
    for (const device of devices) {
      try {
        // 检查是否已存在相同编码的设备主表记录
        const existingEquipment = await Equipment.findOne({
          where: { equipment_code: device.device_code },
          raw: true
        });
        
        if (existingEquipment) {
          log(`  ⊘ 跳过: 设备编码 ${device.device_code} 已存在于设备主表 (ID: ${existingEquipment.id})`);
          skipCount++;
          
          // 检查是否需要创建排程扩展记录
          const existingExt = await EquipmentSchedulingExt.findOne({
            where: { equipment_id: existingEquipment.id },
            raw: true
          });
          
          if (!existingExt) {
            await EquipmentSchedulingExt.create({
              equipment_id: existingEquipment.id,
              capacity_per_hour: device.capacity_per_hour || 0,
              scheduling_weight: 50,
              is_available_for_scheduling: device.status === 'normal'
            });
            log(`    → 为设备 ${device.device_code} 创建排程扩展记录`);
            successCount++;
          }
          continue;
        }
        
        // 创建新的设备主表记录
        const newEquipment = await Equipment.create({
          equipment_code: device.device_code,
          equipment_name: device.device_name,
          equipment_type: 'scheduling_device',
          production_line_id: 1, // 默认生产线
          status: device.status === 'normal' ? 'idle' : 'offline',
          location: `排程迁移-${device.device_code}`,
          model: device.specifications || 'N/A',
          is_active: device.status !== 'scrapped'
        });
        
        // 创建排程扩展记录
        await EquipmentSchedulingExt.create({
          equipment_id: newEquipment.id,
          capacity_per_hour: device.capacity_per_hour || 0,
          scheduling_weight: 50,
          is_available_for_scheduling: device.status === 'normal'
        });
        
        log(`  ✓ 迁移成功: ${device.device_code} (新ID: ${newEquipment.id})`);
        successCount++;
      } catch (error) {
        log(`  ✗ 迁移失败: ${device.device_code} - ${error.message}`);
        conflicts.push({
          device_code: device.device_code,
          error: error.message
        });
      }
    }
    
    log(`\n迁移统计:`);
    log(`  - 成功: ${successCount}`);
    log(`  - 跳过: ${skipCount}`);
    log(`  - 失败: ${conflicts.length}`);
    
    if (conflicts.length > 0) {
      log(`\n冲突详情:`);
      conflicts.forEach(conflict => {
        log(`  - ${conflict.device_code}: ${conflict.error}`);
      });
    }
    
    return { successCount, skipCount, conflicts };
  } catch (error) {
    log(`✗ 迁移过程出错: ${error.message}`);
    throw error;
  }
}

async function verifyMigration() {
  try {
    log('\n开始验证迁移结果...');
    
    const equipmentCount = await Equipment.count();
    const extensionCount = await EquipmentSchedulingExt.count();
    
    log(`设备主表总数: ${equipmentCount}`);
    log(`排程扩展总数: ${extensionCount}`);
    
    // 检查是否所有设备都有排程扩展
    const equipmentsWithoutExt = await Equipment.findAll({
      include: [{
        model: EquipmentSchedulingExt,
        as: 'schedulingExt',
        required: false
      }],
      where: sequelize.where(
        sequelize.col('schedulingExt.id'),
        sequelize.Op.is,
        null
      ),
      raw: true
    });
    
    if (equipmentsWithoutExt.length > 0) {
      log(`⚠ 警告: 有 ${equipmentsWithoutExt.length} 个设备缺少排程扩展记录`);
      equipmentsWithoutExt.forEach(eq => {
        log(`  - ${eq.equipment_code}`);
      });
    } else {
      log(`✓ 所有设备都有排程扩展记录`);
    }
    
    return {
      equipmentCount,
      extensionCount,
      missingExtensions: equipmentsWithoutExt.length
    };
  } catch (error) {
    log(`✗ 验证失败: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    log('========================================');
    log('设备数据迁移脚本开始');
    log('========================================');
    
    // 连接数据库
    await sequelize.authenticate();
    log('✓ 数据库连接成功');
    
    // 备份数据
    await backupData();
    
    // 执行迁移
    const migrationResult = await migrateEquipmentData();
    
    // 验证迁移
    const verificationResult = await verifyMigration();
    
    log('\n========================================');
    log('设备数据迁移完成');
    log('========================================');
    log(`迁移日志已保存到: ${logFile}`);
    log(`数据备份已保存到: ${backupFile}`);
    
    process.exit(0);
  } catch (error) {
    log(`\n✗ 迁移失败: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

main();
