/**
 * 迁移回滚脚本
 * 备份迁移前数据
 * 提供回滚脚本
 * Requirements: 5.5
 */

const sequelize = require('../server/config/database');
const {
  Equipment,
  Material,
  Mold,
  EquipmentSchedulingExt,
  MaterialSchedulingExt,
  MoldSchedulingExt,
  MoldEquipmentRelation,
  MaterialDeviceRelation,
  MaterialMoldRelation
} = require('../server/models');
const fs = require('fs');
const path = require('path');

// 回滚日志配置
const logDir = path.join(__dirname, '../migration-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `rollback-${new Date().toISOString().split('T')[0]}.log`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function listAvailableBackups() {
  try {
    log('列出可用的备份文件...');
    
    const files = fs.readdirSync(logDir);
    const backupFiles = files.filter(f => f.startsWith('equipment-backup-') || 
                                          f.startsWith('material-backup-') || 
                                          f.startsWith('mold-backup-'));
    
    if (backupFiles.length === 0) {
      log('✗ 未找到备份文件');
      return [];
    }
    
    log(`找到 ${backupFiles.length} 个备份文件:`);
    backupFiles.forEach((file, index) => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      log(`  ${index + 1}. ${file} (${new Date(stats.mtime).toISOString()})`);
    });
    
    return backupFiles;
  } catch (error) {
    log(`✗ 列出备份文件失败: ${error.message}`);
    throw error;
  }
}

async function rollbackEquipmentData(backupFile) {
  try {
    log(`\n开始回滚设备数据...`);
    log(`使用备份文件: ${backupFile}`);
    
    const backupPath = path.join(logDir, backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    // 清理迁移后创建的排程扩展记录
    log('清理设备排程扩展记录...');
    const extensionsToDelete = await EquipmentSchedulingExt.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.extensions.map(e => e.id)
        }
      },
      raw: true
    });
    
    for (const ext of extensionsToDelete) {
      await EquipmentSchedulingExt.destroy({
        where: { id: ext.id }
      });
    }
    log(`  ✓ 删除了 ${extensionsToDelete.length} 条新增排程扩展记录`);
    
    // 清理迁移后创建的设备主表记录
    log('清理设备主表记录...');
    const equipmentsToDelete = await Equipment.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.equipments.map(e => e.id)
        }
      },
      raw: true
    });
    
    for (const eq of equipmentsToDelete) {
      await Equipment.destroy({
        where: { id: eq.id }
      });
    }
    log(`  ✓ 删除了 ${equipmentsToDelete.length} 条新增设备记录`);
    
    log('✓ 设备数据回滚完成');
    return {
      extensionsDeleted: extensionsToDelete.length,
      equipmentsDeleted: equipmentsToDelete.length
    };
  } catch (error) {
    log(`✗ 设备数据回滚失败: ${error.message}`);
    throw error;
  }
}

async function rollbackMaterialData(backupFile) {
  try {
    log(`\n开始回滚物料数据...`);
    log(`使用备份文件: ${backupFile}`);
    
    const backupPath = path.join(logDir, backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    // 清理迁移后创建的排程扩展记录
    log('清理物料排程扩展记录...');
    const extensionsToDelete = await MaterialSchedulingExt.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.extensions.map(e => e.id)
        }
      },
      raw: true
    });
    
    for (const ext of extensionsToDelete) {
      await MaterialSchedulingExt.destroy({
        where: { id: ext.id }
      });
    }
    log(`  ✓ 删除了 ${extensionsToDelete.length} 条新增排程扩展记录`);
    
    // 清理迁移后创建的物料-设备关系
    log('清理物料-设备关系...');
    const deviceRelationsToDelete = await MaterialDeviceRelation.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.deviceRelations.map(r => r.id)
        }
      },
      raw: true
    });
    
    for (const rel of deviceRelationsToDelete) {
      await MaterialDeviceRelation.destroy({
        where: { id: rel.id }
      });
    }
    log(`  ✓ 删除了 ${deviceRelationsToDelete.length} 条新增物料-设备关系`);
    
    // 清理迁移后创建的物料-模具关系
    log('清理物料-模具关系...');
    const moldRelationsToDelete = await MaterialMoldRelation.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.moldRelations.map(r => r.id)
        }
      },
      raw: true
    });
    
    for (const rel of moldRelationsToDelete) {
      await MaterialMoldRelation.destroy({
        where: { id: rel.id }
      });
    }
    log(`  ✓ 删除了 ${moldRelationsToDelete.length} 条新增物料-模具关系`);
    
    // 清理迁移后创建的物料记录
    log('清理物料记录...');
    const materialsToDelete = await Material.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.materials.map(m => m.id)
        }
      },
      raw: true
    });
    
    for (const mat of materialsToDelete) {
      await Material.destroy({
        where: { id: mat.id }
      });
    }
    log(`  ✓ 删除了 ${materialsToDelete.length} 条新增物料记录`);
    
    log('✓ 物料数据回滚完成');
    return {
      extensionsDeleted: extensionsToDelete.length,
      deviceRelationsDeleted: deviceRelationsToDelete.length,
      moldRelationsDeleted: moldRelationsToDelete.length,
      materialsDeleted: materialsToDelete.length
    };
  } catch (error) {
    log(`✗ 物料数据回滚失败: ${error.message}`);
    throw error;
  }
}

async function rollbackMoldData(backupFile) {
  try {
    log(`\n开始回滚模具数据...`);
    log(`使用备份文件: ${backupFile}`);
    
    const backupPath = path.join(logDir, backupFile);
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    // 清理迁移后创建的排程扩展记录
    log('清理模具排程扩展记录...');
    const extensionsToDelete = await MoldSchedulingExt.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.extensions.map(e => e.id)
        }
      },
      raw: true
    });
    
    for (const ext of extensionsToDelete) {
      await MoldSchedulingExt.destroy({
        where: { id: ext.id }
      });
    }
    log(`  ✓ 删除了 ${extensionsToDelete.length} 条新增排程扩展记录`);
    
    // 清理迁移后创建的模具-设备关系
    log('清理模具-设备关系...');
    const relationsToDelete = await MoldEquipmentRelation.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.relations.map(r => r.id)
        }
      },
      raw: true
    });
    
    for (const rel of relationsToDelete) {
      await MoldEquipmentRelation.destroy({
        where: { id: rel.id }
      });
    }
    log(`  ✓ 删除了 ${relationsToDelete.length} 条新增模具-设备关系`);
    
    // 清理迁移后创建的模具记录
    log('清理模具记录...');
    const moldsToDelete = await Mold.findAll({
      where: {
        id: {
          [sequelize.Op.notIn]: backup.molds.map(m => m.id)
        }
      },
      raw: true
    });
    
    for (const mold of moldsToDelete) {
      await Mold.destroy({
        where: { id: mold.id }
      });
    }
    log(`  ✓ 删除了 ${moldsToDelete.length} 条新增模具记录`);
    
    log('✓ 模具数据回滚完成');
    return {
      extensionsDeleted: extensionsToDelete.length,
      relationsDeleted: relationsToDelete.length,
      moldsDeleted: moldsToDelete.length
    };
  } catch (error) {
    log(`✗ 模具数据回滚失败: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    log('========================================');
    log('迁移回滚脚本');
    log('========================================');
    
    // 连接数据库
    await sequelize.authenticate();
    log('✓ 数据库连接成功');
    
    // 列出可用的备份
    const backups = await listAvailableBackups();
    
    if (backups.length === 0) {
      log('\n✗ 没有可用的备份文件，无法进行回滚');
      process.exit(1);
    }
    
    // 获取最新的备份文件
    const latestBackup = backups[backups.length - 1];
    log(`\n使用最新备份: ${latestBackup}`);
    
    // 根据备份文件类型执行回滚
    if (latestBackup.includes('equipment-backup')) {
      const result = await rollbackEquipmentData(latestBackup);
      log(`\n回滚统计:`);
      log(`  - 删除排程扩展: ${result.extensionsDeleted}`);
      log(`  - 删除设备记录: ${result.equipmentsDeleted}`);
    } else if (latestBackup.includes('material-backup')) {
      const result = await rollbackMaterialData(latestBackup);
      log(`\n回滚统计:`);
      log(`  - 删除排程扩展: ${result.extensionsDeleted}`);
      log(`  - 删除物料-设备关系: ${result.deviceRelationsDeleted}`);
      log(`  - 删除物料-模具关系: ${result.moldRelationsDeleted}`);
      log(`  - 删除物料记录: ${result.materialsDeleted}`);
    } else if (latestBackup.includes('mold-backup')) {
      const result = await rollbackMoldData(latestBackup);
      log(`\n回滚统计:`);
      log(`  - 删除排程扩展: ${result.extensionsDeleted}`);
      log(`  - 删除模具-设备关系: ${result.relationsDeleted}`);
      log(`  - 删除模具记录: ${result.moldsDeleted}`);
    }
    
    log('\n========================================');
    log('迁移回滚完成');
    log('========================================');
    log(`回滚日志已保存到: ${logFile}`);
    
    process.exit(0);
  } catch (error) {
    log(`\n✗ 回滚失败: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  listAvailableBackups,
  rollbackEquipmentData,
  rollbackMaterialData,
  rollbackMoldData
};
