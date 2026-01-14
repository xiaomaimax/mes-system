/**
 * 物料数据迁移脚本
 * 将现有排程物料数据映射到物料主数据
 * 创建物料排程扩展记录
 * 保留关系配置数据
 * Requirements: 5.2
 */

const sequelize = require('../server/config/database');
const {
  Material,
  MaterialSchedulingExt,
  MaterialDeviceRelation,
  MaterialMoldRelation,
  Device,
  Mold
} = require('../server/models');
const fs = require('fs');
const path = require('path');

// 迁移日志配置
const logDir = path.join(__dirname, '../migration-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `material-migration-${new Date().toISOString().split('T')[0]}.log`);
const backupFile = path.join(logDir, `material-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function backupData() {
  try {
    log('开始备份物料数据...');
    
    const materials = await Material.findAll({ raw: true });
    const extensions = await MaterialSchedulingExt.findAll({ raw: true });
    const deviceRelations = await MaterialDeviceRelation.findAll({ raw: true });
    const moldRelations = await MaterialMoldRelation.findAll({ raw: true });
    
    const backup = {
      timestamp: new Date().toISOString(),
      materials,
      extensions,
      deviceRelations,
      moldRelations,
      summary: {
        materialCount: materials.length,
        extensionCount: extensions.length,
        deviceRelationCount: deviceRelations.length,
        moldRelationCount: moldRelations.length
      }
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    log(`✓ 备份完成，文件: ${backupFile}`);
    log(`  - 物料数: ${materials.length}`);
    log(`  - 排程扩展数: ${extensions.length}`);
    log(`  - 物料-设备关系数: ${deviceRelations.length}`);
    log(`  - 物料-模具关系数: ${moldRelations.length}`);
    
    return backup;
  } catch (error) {
    log(`✗ 备份失败: ${error.message}`);
    throw error;
  }
}

async function migrateMaterialData() {
  try {
    log('开始迁移物料数据...');
    
    // 获取所有排程物料
    const materials = await Material.findAll({ raw: true });
    log(`找到 ${materials.length} 条排程物料记录`);
    
    let successCount = 0;
    let skipCount = 0;
    const conflicts = [];
    const materialIdMap = {}; // 用于映射旧ID到新ID
    
    for (const material of materials) {
      try {
        // 检查是否已存在相同编码的物料记录
        const existingMaterial = await Material.findOne({
          where: { material_code: material.material_code },
          raw: true
        });
        
        if (existingMaterial && existingMaterial.id !== material.id) {
          log(`  ⊘ 跳过: 物料编码 ${material.material_code} 已存在 (ID: ${existingMaterial.id})`);
          skipCount++;
          materialIdMap[material.id] = existingMaterial.id;
          
          // 检查是否需要创建排程扩展记录
          const existingExt = await MaterialSchedulingExt.findOne({
            where: { material_id: existingMaterial.id },
            raw: true
          });
          
          if (!existingExt) {
            await MaterialSchedulingExt.create({
              material_id: existingMaterial.id,
              default_device_id: null,
              default_mold_id: null
            });
            log(`    → 为物料 ${material.material_code} 创建排程扩展记录`);
            successCount++;
          }
          continue;
        }
        
        // 物料已存在，只需创建排程扩展记录
        if (existingMaterial) {
          const existingExt = await MaterialSchedulingExt.findOne({
            where: { material_id: existingMaterial.id },
            raw: true
          });
          
          if (!existingExt) {
            await MaterialSchedulingExt.create({
              material_id: existingMaterial.id,
              default_device_id: null,
              default_mold_id: null
            });
            log(`  ✓ 为物料 ${material.material_code} 创建排程扩展记录`);
            successCount++;
          } else {
            log(`  ⊘ 物料 ${material.material_code} 已有排程扩展记录`);
            skipCount++;
          }
          
          materialIdMap[material.id] = existingMaterial.id;
          continue;
        }
        
        // 创建新的物料记录
        const newMaterial = await Material.create({
          material_code: material.material_code,
          material_name: material.material_name,
          material_type: material.material_type || 'raw_material',
          specifications: material.specifications,
          status: material.status || 'active'
        });
        
        // 创建排程扩展记录
        await MaterialSchedulingExt.create({
          material_id: newMaterial.id,
          default_device_id: null,
          default_mold_id: null
        });
        
        materialIdMap[material.id] = newMaterial.id;
        log(`  ✓ 迁移成功: ${material.material_code} (新ID: ${newMaterial.id})`);
        successCount++;
      } catch (error) {
        log(`  ✗ 迁移失败: ${material.material_code} - ${error.message}`);
        conflicts.push({
          material_code: material.material_code,
          error: error.message
        });
      }
    }
    
    log(`\n物料迁移统计:`);
    log(`  - 成功: ${successCount}`);
    log(`  - 跳过: ${skipCount}`);
    log(`  - 失败: ${conflicts.length}`);
    
    return { successCount, skipCount, conflicts, materialIdMap };
  } catch (error) {
    log(`✗ 迁移过程出错: ${error.message}`);
    throw error;
  }
}

async function migrateRelationships(materialIdMap) {
  try {
    log('\n开始迁移物料关系配置...');
    
    // 迁移物料-设备关系
    const deviceRelations = await MaterialDeviceRelation.findAll({ raw: true });
    log(`找到 ${deviceRelations.length} 条物料-设备关系`);
    
    let deviceRelationCount = 0;
    for (const relation of deviceRelations) {
      try {
        const newMaterialId = materialIdMap[relation.material_id];
        if (!newMaterialId) {
          log(`  ⊘ 跳过物料-设备关系: 物料ID ${relation.material_id} 未找到映射`);
          continue;
        }
        
        // 检查关系是否已存在
        const existingRelation = await MaterialDeviceRelation.findOne({
          where: {
            material_id: newMaterialId,
            device_id: relation.device_id
          },
          raw: true
        });
        
        if (!existingRelation) {
          await MaterialDeviceRelation.create({
            material_id: newMaterialId,
            device_id: relation.device_id,
            weight: relation.weight || 50
          });
          deviceRelationCount++;
        }
      } catch (error) {
        log(`  ✗ 迁移物料-设备关系失败: ${error.message}`);
      }
    }
    log(`  ✓ 物料-设备关系迁移: ${deviceRelationCount} 条`);
    
    // 迁移物料-模具关系
    const moldRelations = await MaterialMoldRelation.findAll({ raw: true });
    log(`找到 ${moldRelations.length} 条物料-模具关系`);
    
    let moldRelationCount = 0;
    for (const relation of moldRelations) {
      try {
        const newMaterialId = materialIdMap[relation.material_id];
        if (!newMaterialId) {
          log(`  ⊘ 跳过物料-模具关系: 物料ID ${relation.material_id} 未找到映射`);
          continue;
        }
        
        // 检查关系是否已存在
        const existingRelation = await MaterialMoldRelation.findOne({
          where: {
            material_id: newMaterialId,
            mold_id: relation.mold_id
          },
          raw: true
        });
        
        if (!existingRelation) {
          await MaterialMoldRelation.create({
            material_id: newMaterialId,
            mold_id: relation.mold_id,
            weight: relation.weight || 50,
            cycle_time: relation.cycle_time || 0,
            output_per_cycle: relation.output_per_cycle || 1
          });
          moldRelationCount++;
        }
      } catch (error) {
        log(`  ✗ 迁移物料-模具关系失败: ${error.message}`);
      }
    }
    log(`  ✓ 物料-模具关系迁移: ${moldRelationCount} 条`);
    
    return { deviceRelationCount, moldRelationCount };
  } catch (error) {
    log(`✗ 关系迁移过程出错: ${error.message}`);
    throw error;
  }
}

async function verifyMigration() {
  try {
    log('\n开始验证迁移结果...');
    
    const materialCount = await Material.count();
    const extensionCount = await MaterialSchedulingExt.count();
    const deviceRelationCount = await MaterialDeviceRelation.count();
    const moldRelationCount = await MaterialMoldRelation.count();
    
    log(`物料总数: ${materialCount}`);
    log(`排程扩展总数: ${extensionCount}`);
    log(`物料-设备关系总数: ${deviceRelationCount}`);
    log(`物料-模具关系总数: ${moldRelationCount}`);
    
    // 检查是否所有物料都有排程扩展
    const materialsWithoutExt = await Material.findAll({
      include: [{
        model: MaterialSchedulingExt,
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
    
    if (materialsWithoutExt.length > 0) {
      log(`⚠ 警告: 有 ${materialsWithoutExt.length} 个物料缺少排程扩展记录`);
      materialsWithoutExt.forEach(mat => {
        log(`  - ${mat.material_code}`);
      });
    } else {
      log(`✓ 所有物料都有排程扩展记录`);
    }
    
    return {
      materialCount,
      extensionCount,
      deviceRelationCount,
      moldRelationCount,
      missingExtensions: materialsWithoutExt.length
    };
  } catch (error) {
    log(`✗ 验证失败: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    log('========================================');
    log('物料数据迁移脚本开始');
    log('========================================');
    
    // 连接数据库
    await sequelize.authenticate();
    log('✓ 数据库连接成功');
    
    // 备份数据
    await backupData();
    
    // 执行迁移
    const migrationResult = await migrateMaterialData();
    
    // 迁移关系配置
    const relationshipResult = await migrateRelationships(migrationResult.materialIdMap);
    
    // 验证迁移
    const verificationResult = await verifyMigration();
    
    log('\n========================================');
    log('物料数据迁移完成');
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
