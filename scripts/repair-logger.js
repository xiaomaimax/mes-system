/**
 * 数据修复日志记录器
 * 
 * 功能：
 * 1. 记录所有修复操作
 * 2. 提供详细的操作日志
 * 3. 支持日志查询和分析
 * 4. 生成修复报告
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class RepairLogger {
  constructor(logDir = 'logs') {
    this.logDir = path.join(__dirname, '..', logDir);
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      operations: [],
      summary: {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    this.ensureLogDirectory();
  }

  /**
   * 确保日志目录存在
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录修复操作开始
   */
  logOperationStart(operation) {
    const logEntry = {
      operationId: this.generateOperationId(),
      timestamp: new Date().toISOString(),
      type: 'operation_start',
      module: operation.module,
      checkName: operation.checkName,
      action: operation.action,
      description: operation.description,
      status: 'started'
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    console.log(chalk.blue(`[${logEntry.timestamp}] 开始修复: ${operation.module} - ${operation.checkName}`));
    
    return logEntry.operationId;
  }

  /**
   * 记录修复操作完成
   */
  logOperationComplete(operationId, result) {
    const logEntry = {
      operationId,
      timestamp: new Date().toISOString(),
      type: 'operation_complete',
      status: result.success ? 'success' : 'failed',
      result: result.result,
      error: result.error,
      duration: result.duration,
      affectedRecords: result.affectedRecords || 0
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    // 更新摘要
    this.currentSession.summary.total++;
    if (result.success) {
      this.currentSession.summary.success++;
      console.log(chalk.green(`[${logEntry.timestamp}] 修复完成: ${operationId}`));
    } else {
      this.currentSession.summary.failed++;
      console.log(chalk.red(`[${logEntry.timestamp}] 修复失败: ${operationId} - ${result.error}`));
    }
  }

  /**
   * 记录修复操作跳过
   */
  logOperationSkipped(operationId, reason) {
    const logEntry = {
      operationId,
      timestamp: new Date().toISOString(),
      type: 'operation_skipped',
      status: 'skipped',
      reason
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    this.currentSession.summary.total++;
    this.currentSession.summary.skipped++;
    
    console.log(chalk.yellow(`[${logEntry.timestamp}] 修复跳过: ${operationId} - ${reason}`));
  }

  /**
   * 记录SQL执行
   */
  logSqlExecution(operationId, sql, result) {
    const logEntry = {
      operationId,
      timestamp: new Date().toISOString(),
      type: 'sql_execution',
      sql: sql.length > 500 ? sql.substring(0, 500) + '...' : sql,
      success: result.success,
      affectedRows: result.affectedRows,
      error: result.error
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    if (result.success) {
      console.log(chalk.gray(`[${logEntry.timestamp}] SQL执行成功: 影响 ${result.affectedRows} 行`));
    } else {
      console.log(chalk.red(`[${logEntry.timestamp}] SQL执行失败: ${result.error}`));
    }
  }

  /**
   * 记录备份操作
   */
  logBackupOperation(backupPath, tables, success, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'backup_operation',
      backupPath,
      tables,
      success,
      error
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    if (success) {
      console.log(chalk.green(`[${logEntry.timestamp}] 备份创建成功: ${backupPath}`));
    } else {
      console.log(chalk.red(`[${logEntry.timestamp}] 备份创建失败: ${error}`));
    }
  }

  /**
   * 记录警告信息
   */
  logWarning(message, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'warning',
      message,
      details
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    console.log(chalk.yellow(`[${logEntry.timestamp}] 警告: ${message}`));
  }

  /**
   * 记录信息
   */
  logInfo(message, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'info',
      message,
      details
    };

    this.currentSession.operations.push(logEntry);
    this.writeLogEntry(logEntry);
    
    console.log(chalk.blue(`[${logEntry.timestamp}] 信息: ${message}`));
  }

  /**
   * 生成操作ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * 写入日志条目
   */
  writeLogEntry(entry) {
    const logFile = path.join(this.logDir, `repair-${this.currentSession.sessionId}.log`);
    const logLine = JSON.stringify(entry) + '\n';
    
    fs.appendFileSync(logFile, logLine);
  }

  /**
   * 完成修复会话
   */
  completeSession() {
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime);
    
    // 保存完整的会话日志
    const sessionFile = path.join(this.logDir, `repair-session-${this.currentSession.sessionId}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(this.currentSession, null, 2));
    
    // 生成修复报告
    this.generateRepairReport();
    
    console.log(chalk.green(`\n修复会话完成: ${this.currentSession.sessionId}`));
    console.log(chalk.gray(`会话日志: ${sessionFile}`));
  }

  /**
   * 生成修复报告
   */
  generateRepairReport() {
    const reportFile = path.join(this.logDir, `repair-report-${this.currentSession.sessionId}.md`);
    
    let report = `# 数据修复报告\n\n`;
    report += `**会话ID:** ${this.currentSession.sessionId}\n`;
    report += `**开始时间:** ${this.currentSession.startTime}\n`;
    report += `**结束时间:** ${this.currentSession.endTime}\n`;
    report += `**总耗时:** ${Math.round(this.currentSession.duration / 1000)} 秒\n\n`;
    
    report += `## 修复摘要\n\n`;
    report += `- 总操作数: ${this.currentSession.summary.total}\n`;
    report += `- 成功: ${this.currentSession.summary.success}\n`;
    report += `- 失败: ${this.currentSession.summary.failed}\n`;
    report += `- 跳过: ${this.currentSession.summary.skipped}\n\n`;
    
    // 按模块分组操作
    const moduleOperations = {};
    this.currentSession.operations
      .filter(op => op.type === 'operation_start')
      .forEach(op => {
        if (!moduleOperations[op.module]) {
          moduleOperations[op.module] = [];
        }
        moduleOperations[op.module].push(op);
      });
    
    if (Object.keys(moduleOperations).length > 0) {
      report += `## 按模块分类的操作\n\n`;
      
      for (const [module, operations] of Object.entries(moduleOperations)) {
        report += `### ${module}\n\n`;
        
        operations.forEach(op => {
          const completeOp = this.currentSession.operations.find(
            o => o.operationId === op.operationId && o.type === 'operation_complete'
          );
          
          const status = completeOp ? completeOp.status : 'unknown';
          const statusIcon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '⏭️';
          
          report += `- ${statusIcon} **${op.checkName}**\n`;
          report += `  - 操作: ${op.action}\n`;
          report += `  - 描述: ${op.description}\n`;
          
          if (completeOp) {
            if (completeOp.status === 'success') {
              report += `  - 结果: ${completeOp.result}\n`;
              if (completeOp.affectedRecords) {
                report += `  - 影响记录数: ${completeOp.affectedRecords}\n`;
              }
            } else {
              report += `  - 错误: ${completeOp.error}\n`;
            }
            report += `  - 耗时: ${completeOp.duration}ms\n`;
          }
          
          report += `\n`;
        });
      }
    }
    
    // 失败操作详情
    const failedOperations = this.currentSession.operations.filter(
      op => op.type === 'operation_complete' && op.status === 'failed'
    );
    
    if (failedOperations.length > 0) {
      report += `## 失败操作详情\n\n`;
      
      failedOperations.forEach((op, index) => {
        const startOp = this.currentSession.operations.find(
          o => o.operationId === op.operationId && o.type === 'operation_start'
        );
        
        report += `### ${index + 1}. ${startOp ? startOp.checkName : op.operationId}\n\n`;
        report += `- **模块:** ${startOp ? startOp.module : '未知'}\n`;
        report += `- **错误:** ${op.error}\n`;
        report += `- **时间:** ${op.timestamp}\n\n`;
      });
    }
    
    // SQL执行记录
    const sqlOperations = this.currentSession.operations.filter(op => op.type === 'sql_execution');
    
    if (sqlOperations.length > 0) {
      report += `## SQL执行记录\n\n`;
      
      sqlOperations.forEach((op, index) => {
        const statusIcon = op.success ? '✅' : '❌';
        report += `### ${index + 1}. ${statusIcon} SQL执行\n\n`;
        report += `- **时间:** ${op.timestamp}\n`;
        report += `- **操作ID:** ${op.operationId}\n`;
        
        if (op.success) {
          report += `- **影响行数:** ${op.affectedRows}\n`;
        } else {
          report += `- **错误:** ${op.error}\n`;
        }
        
        report += `- **SQL:**\n\`\`\`sql\n${op.sql}\n\`\`\`\n\n`;
      });
    }
    
    // 备份记录
    const backupOperations = this.currentSession.operations.filter(op => op.type === 'backup_operation');
    
    if (backupOperations.length > 0) {
      report += `## 备份记录\n\n`;
      
      backupOperations.forEach((op, index) => {
        const statusIcon = op.success ? '✅' : '❌';
        report += `- ${statusIcon} **备份 ${index + 1}**\n`;
        report += `  - 时间: ${op.timestamp}\n`;
        report += `  - 路径: ${op.backupPath}\n`;
        report += `  - 表: ${op.tables.join(', ')}\n`;
        
        if (!op.success) {
          report += `  - 错误: ${op.error}\n`;
        }
        
        report += `\n`;
      });
    }
    
    // 警告和信息
    const warnings = this.currentSession.operations.filter(op => op.type === 'warning');
    const infos = this.currentSession.operations.filter(op => op.type === 'info');
    
    if (warnings.length > 0 || infos.length > 0) {
      report += `## 其他记录\n\n`;
      
      if (warnings.length > 0) {
        report += `### ⚠️ 警告\n\n`;
        warnings.forEach(op => {
          report += `- **${op.timestamp}:** ${op.message}\n`;
          if (op.details) {
            report += `  - 详情: ${JSON.stringify(op.details)}\n`;
          }
        });
        report += `\n`;
      }
      
      if (infos.length > 0) {
        report += `### ℹ️ 信息\n\n`;
        infos.forEach(op => {
          report += `- **${op.timestamp}:** ${op.message}\n`;
          if (op.details) {
            report += `  - 详情: ${JSON.stringify(op.details)}\n`;
          }
        });
        report += `\n`;
      }
    }
    
    report += `## 建议\n\n`;
    
    if (this.currentSession.summary.failed > 0) {
      report += `- ⚠️ 有 ${this.currentSession.summary.failed} 个操作失败，请检查失败原因并重新尝试\n`;
      report += `- 建议在修复失败的问题后重新运行数据一致性检查\n`;
    }
    
    if (this.currentSession.summary.success > 0) {
      report += `- ✅ 成功修复了 ${this.currentSession.summary.success} 个问题\n`;
      report += `- 建议运行数据一致性检查验证修复效果\n`;
    }
    
    if (backupOperations.some(op => op.success)) {
      report += `- 💾 已创建数据备份，如需回滚可使用备份文件\n`;
    }
    
    report += `- 📊 建议定期运行数据一致性检查以预防问题\n`;
    
    fs.writeFileSync(reportFile, report);
    
    console.log(chalk.green(`修复报告已生成: ${reportFile}`));
  }

  /**
   * 获取会话摘要
   */
  getSessionSummary() {
    return {
      sessionId: this.currentSession.sessionId,
      startTime: this.currentSession.startTime,
      summary: this.currentSession.summary,
      operationCount: this.currentSession.operations.length
    };
  }

  /**
   * 显示实时摘要
   */
  displayLiveSummary() {
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue('修复进度摘要'));
    console.log(chalk.blue('='.repeat(50)));
    console.log(chalk.gray(`会话ID: ${this.currentSession.sessionId}`));
    console.log(chalk.gray(`开始时间: ${this.currentSession.startTime}`));
    console.log(chalk.gray(`总操作数: ${this.currentSession.summary.total}`));
    console.log(chalk.green(`成功: ${this.currentSession.summary.success}`));
    console.log(chalk.red(`失败: ${this.currentSession.summary.failed}`));
    console.log(chalk.yellow(`跳过: ${this.currentSession.summary.skipped}`));
    console.log(chalk.blue('='.repeat(50)));
  }
}

module.exports = RepairLogger;