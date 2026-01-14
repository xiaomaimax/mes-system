/**
 * 完整数据迁移协调脚本
 * 按顺序执行所有迁移脚本
 * 提供统一的迁移管理界面
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 迁移日志配置
const logDir = path.join(__dirname, '../migration-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const mainLogFile = path.join(logDir, `migration-${new Date().toISOString().split('T')[0]}.log`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(mainLogFile, logMessage + '\n');
}

function runScript(scriptPath, scriptName) {
  return new Promise((resolve, reject) => {
    log(`\n开始执行: ${scriptName}`);
    log('='.repeat(50));
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.dirname(scriptPath)
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✓ ${scriptName} 执行成功`);
        resolve(true);
      } else {
        log(`✗ ${scriptName} 执行失败 (退出码: ${code})`);
        reject(new Error(`${scriptName} 执行失败`));
      }
    });
    
    child.on('error', (error) => {
      log(`✗ ${scriptName} 执行出错: ${error.message}`);
      reject(error);
    });
  });
}

async function main() {
  try {
    log('========================================');
    log('MES系统数据迁移 - 完整流程');
    log('========================================');
    log(`开始时间: ${new Date().toISOString()}`);
    
    const scripts = [
      {
        path: path.join(__dirname, 'migrate-equipment-data.js'),
        name: '设备数据迁移'
      },
      {
        path: path.join(__dirname, 'migrate-material-data.js'),
        name: '物料数据迁移'
      },
      {
        path: path.join(__dirname, 'migrate-mold-data.js'),
        name: '模具数据迁移'
      }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];
    
    for (const script of scripts) {
      try {
        await runScript(script.path, script.name);
        successCount++;
        results.push({
          name: script.name,
          status: 'success'
        });
      } catch (error) {
        failureCount++;
        results.push({
          name: script.name,
          status: 'failed',
          error: error.message
        });
        
        // 如果迁移失败，询问是否继续
        log(`\n⚠ ${script.name} 失败，建议检查日志后重试`);
        log('可以使用 rollback-migration.js 脚本进行回滚');
      }
    }
    
    // 输出最终统计
    log('\n========================================');
    log('迁移完成统计');
    log('========================================');
    log(`成功: ${successCount}/${scripts.length}`);
    log(`失败: ${failureCount}/${scripts.length}`);
    
    results.forEach(result => {
      if (result.status === 'success') {
        log(`  ✓ ${result.name}`);
      } else {
        log(`  ✗ ${result.name}: ${result.error}`);
      }
    });
    
    log(`\n完成时间: ${new Date().toISOString()}`);
    log(`迁移日志已保存到: ${mainLogFile}`);
    log(`详细日志位置: ${logDir}`);
    
    if (failureCount > 0) {
      log('\n⚠ 部分迁移失败，请检查日志并重试');
      process.exit(1);
    } else {
      log('\n✓ 所有迁移成功完成');
      process.exit(0);
    }
  } catch (error) {
    log(`\n✗ 迁移过程出错: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

main();
