/**
 * 模具数据迁移脚本
 * 将现有模具数据迁移到设备管理模块
 * 创建模具-设备关联
 * 创建模具排程扩展记录
 * Requirements: 5.1, 5.2
 */

const sequelize = require('../server/config/database');
const {
  Mold,
  MoldSchedulingExt,
  MoldEquipmentRelation,
  Device,
  Equipment
} = require('../server/models');
const fs = require('fs');
const path = require('path');

// 迁移日志配置
const logDir = path.join(__dirname, '../migration-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `mold-migration-${new Date().toISOString().split('T')[0]}.log`);
const backupFile = path.join(logDir, `mold-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function backupData() {
  try {
    log('开始备份模具数据...');
    
    const molds = await Mold.findAll({ raw: true });
    const extensions = await MoldSchedulingExt.findAll({ raw: true });
    const relations = await MoldEquipmentRelation.findAll({ raw: true });
    
    const backup = {
      timestamp: new Date().toISOString(),
      molds,
      extensions,
      relations,
      summary: {
        moldCount: molds.length,
        extensionCount: extensions.length,
        relationCount: relations.length
      }
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    log(`✓ 备份完成，文件: ${backupFile}`);
    log(`  - 模具数: ${molds.length}`);
    log(`  - 排程扩展数: ${extensions.length}`);
    log(`  - 模具-设备关系数: ${relations.length}`);
    
    return backup;
  } catch (error) {
    log(`✗ 备份失败: ${error.message}`);
    throw error;
  }
}

async function migrateMoldData() {
  try {
    log('开始迁移模具数据...');
    
    // 获取所有模具
    const molds = await Mold.findAll({ raw: true });
    log(`找到 ${molds.length} 条模具记录`);
    
    let successCount = 0;
    let skipCount = 0;
    const conflicts = [];
    const moldIdMap = {}; // 用于映射旧ID到新ID
    
    for (const mold of molds) {
      try {
        // 检查是否已存在相同编码的模具记录
        const existingMold = await Mold.findOne({
          where: { mold_code: mold.mold_code },
          raw: true
        });
        
        if (existingMold && existingMold.id !== mold.id) {
          log(`  ⊘ 跳过: 模具编码 ${mold.mold_code} 已存在 (ID: ${existingMold.id})`);
          skipCount++;
          moldIdMap[mold.id] = existingMold.id;
          
          // 检查是否需要创建排程扩展记录
          const existingExt = await MoldSchedulingExt.findOne({
            where: { mold_id: existingMold.id },
            raw: true
          });
          
          if (!existingExt) {
            await MoldSchedulingExt.create({
              mold_id: existingMold.id,
              scheduling_weight: 50
            });
            log(`    → 为模具 ${mold.mold_code} 创建排程扩展记录`);
            successCount++;
          }
          continue;
        }
        
        // 模具已存在，只需创建排程扩展记录
        if (existingMold) {
          const existingExt = await MoldSchedulingExt.findOne({
            where: { mold_id: existingMold.id },
            raw: true
          });
          
          if (!existingExt) {
            await MoldSchedulingExt.create({
              mold_id: existingMold.id,
              scheduling_weight: 50
            });
            log(`  ✓ 为模具 ${mold.mold_code} 创建排程扩展记录`);
            successCount++;
          } else {
            log(`  ⊘ 模具 ${mold.mold_code} 已有排程扩展记录`);
            skipCount++;
          }
          
          moldIdMap[mold.id] = existingMold.id;
          continue;
        }
        
        // 创建新的模具记录
        const newMold = await Mold.create({
          mold_code: mold.mold_code,
          mold_name: mold.mold_name,
          specifications: mold.specifications,
          quantity: mold.quantity || 1,
          status: mold.status || 'normal'
        });
        
        // 创建排程扩展记录
        await MoldSchedulingExt.create({
          mold_id: newMold.id,
          scheduling_weight: 50
        });
        
        moldIdMap[mold.id] = newMold.id;
        log(`  ✓ 迁移成功: ${mold.mold_code} (新ID: ${newMold.id})`);
        successCount++;
      } catch (error) {
        log(`  ✗ 迁移失败: ${mold.mold_code} - ${error.message}`);
        conflicts.push({
          mold_code: mold.mold_code,
          error: error.message
        });
      }
    }
    
    log(`\n模具迁移统计:`);
    log(`  - 成功: ${successCount}`);
    log(`  - 跳过: ${skipCount}`);
    log(`  - 失败: ${conflicts.length}`);
    
    return { successCount, skipCount, conflicts, moldIdMap };
  } catch (error) {
    log(`✗ 迁移过程出错: ${error.message}`);
    throw error;
  }
}

async function migrateMoldEquipmentRelations(moldIdMap) {
  try {
    log('\n开始迁移模具-设备关联...');
    
    // 获取所有现有的模具-设备关系
    const relations = await MoldEquipmentRelation.findAll({ raw: true });
    log(`找到 ${relations.length} 条模具-设备关系`);
    
    let relationCount = 0;
    let skipCount = 0;
    
    for (const relation of relations) {
      try {
        const newMoldId = moldIdMap[relation.mold_id];
        if (!newMoldId) {
          log(`  ⊘ 跳过关系: 模具ID ${relation.mold_id} 未找到映射`);
          skipCount++;
          continue;
        }
        
        // 检查关系是否已存在
        const existingRelation = await MoldEquipmentRelation.findOne({
          where: {
            mold_id: newMoldId,
            equipment_id: relation.equipment_id
          },
          raw: true
        });
        
        if (!existingRelation) {
          await MoldEquipmentRelation.create({
            mold_id: newMoldId,
            equipment_id: relation.equipment_id,
            is_primary: relation.is_primary || false
          });
          relationCount++;
        } else {
          skipCount++;
        }
      } catch (error) {
        log(`  ✗ 迁移模具-设备关系失败: ${error.message}`);
      }
    }
    
    log(`  ✓ 模具-设备关系迁移: ${relationCount} 条`);
    log(`  ⊘ 跳过: ${skipCount} 条`);
    
    return relationCount;
  } catch (error) {
    log(`✗ 关系迁移过程出错: ${error.message}`);
    throw error;
  }
}

async function verifyMigration() {
  try {
    log('\n开始验证迁移结果...');
    
    const moldCount = await Mold.count();
    const extensionCount = await MoldSchedulingExt.count();
    const relationCount = await MoldEquipmentRelation.count();
    
    log(`模具总数: ${moldCount}`);
    log(`排程扩展总数: ${extensionCount}`);
    log(`模具-设备关系总数: ${relationCount}`);
    
    // 检查是否所有模具都有排程扩展
    const moldsWithoutExt = await Mold.findAll({
      include: [{
        model: MoldSchedulingExt,
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
    
    if (moldsWithoutExt.length > 0) {
      log(`⚠ 警告: 有 ${moldsWithoutExt.length} 个模具缺少排程扩展记录`);
      moldsWithoutExt.forEach(mold => {
        log(`  - ${mold.mold_code}`);
      });
    } else {
      log(`✓ 所有模具都有排程扩展记录`);
    }
    
    // 检查模具-设备关系的有效性
    const invalidRelations = await MoldEquipmentRelation.findAll({
      include: [
        {
          model: Mold,
          as: 'mold',
          required: true
        },
        {
          model: Equipment,
          as: 'equipment',
          required: false
        }
      ],
      where: sequelize.where(
        sequelize.col('equipment.id'),
        sequelize.Op.is,
        null
      ),
      raw: true
    });
    
    if (invalidRelations.length > 0) {
      log(`⚠ 警告: 有 ${invalidRelations.length} 个模具-设备关系指向不存在的设备`);
    } else {
      log(`✓ 所有模具-设备关系都有效`);
    }
    
    return {
      moldCount,
      extensionCount,
      relationCount,
      missingExtensions: moldsWithoutExt.length,
      invalidRelations: invalidRelations.length
    };
  } catch (error) {
    log(`✗ 验证失败: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    log('========================================');
    log('模具数据迁移脚本开始');
    log('========================================');
    
    // 连接数据库
    await sequelize.authenticate();
    log('✓ 数据库连接成功');
    
    // 备份数据
    await backupData();
    
    // 执行迁移
    const migrationResult = await migrateMoldData();
    
    // 迁移模具-设备关联
    const relationCount = await migrateMoldEquipmentRelations(migrationResult.moldIdMap);
    
    // 验证迁移
    const verificationResult = await verifyMigration();
    
    log('\n========================================');
    log('模具数据迁移完成');
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
