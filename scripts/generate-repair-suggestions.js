/**
 * 数据修复建议生成器
 * 
 * 功能：
 * 1. 分析数据一致性问题
 * 2. 生成具体的修复建议
 * 3. 提供修复脚本模板
 * 
 * 使用方法：
 * node scripts/generate-repair-suggestions.js --report=path/to/report.json
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class RepairSuggestionGenerator {
  constructor() {
    this.suggestions = [];
  }

  /**
   * 加载一致性检查报告
   */
  loadReport(reportPath) {
    try {
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      return JSON.parse(reportContent);
    } catch (error) {
      console.error(chalk.red('加载报告失败:'), error.message);
      throw error;
    }
  }

  /**
   * 生成修复建议
   */
  generateSuggestions(report) {
    console.log(chalk.blue('分析数据一致性问题并生成修复建议...'));

    for (const [moduleName, moduleData] of Object.entries(report.modules)) {
      if (!moduleData.checks) continue;

      for (const check of moduleData.checks) {
        if (!check.passed) {
          const suggestion = this.createRepairSuggestion(moduleName, check);
          if (suggestion) {
            this.suggestions.push(suggestion);
          }
        }
      }
    }

    return this.suggestions;
  }

  /**
   * 创建修复建议
   */
  createRepairSuggestion(module, check) {
    const suggestion = {
      id: `${module}_${check.name}_${Date.now()}`,
      module,
      checkName: check.name,
      issues: check.issues || [],
      error: check.error,
      priority: this.determinePriority(check),
      category: this.determineCategory(check),
      repairSteps: [],
      sqlScripts: [],
      apiChanges: [],
      risks: [],
      estimatedTime: '未知'
    };

    // 根据不同类型的问题生成具体建议
    if (check.issues) {
      for (const issue of check.issues) {
        this.addSpecificSuggestions(suggestion, issue);
      }
    }

    if (check.error) {
      this.addErrorSuggestions(suggestion, check.error);
    }

    return suggestion;
  }

  /**
   * 确定优先级
   */
  determinePriority(check) {
    if (check.error) return 'critical';
    if (check.issues && check.issues.some(issue => issue.includes('缺少'))) return 'high';
    if (check.issues && check.issues.some(issue => issue.includes('不一致'))) return 'medium';
    return 'low';
  }

  /**
   * 确定类别
   */
  determineCategory(check) {
    if (check.error) return 'error';
    if (check.issues && check.issues.some(issue => issue.includes('数量'))) return 'count_mismatch';
    if (check.issues && check.issues.some(issue => issue.includes('不一致'))) return 'data_mismatch';
    return 'other';
  }

  /**
   * 添加具体建议
   */
  addSpecificSuggestions(suggestion, issue) {
    // 数据数量不一致
    if (issue.includes('数据数量不一致')) {
      const match = issue.match(/数据库 (\d+) 条, API (\d+) 条/);
      if (match) {
        const dbCount = parseInt(match[1]);
        const apiCount = parseInt(match[2]);
        
        if (dbCount > apiCount) {
          suggestion.repairSteps.push(
            '1. 检查API查询条件是否正确',
            '2. 验证API分页参数设置',
            '3. 检查数据库中是否有软删除的记录',
            '4. 确认API返回数据的过滤逻辑'
          );
          
          suggestion.apiChanges.push(
            '检查API路由中的查询条件',
            '验证分页逻辑的实现',
            '确认数据过滤条件'
          );
          
          suggestion.risks.push(
            '可能影响前端数据显示',
            '用户可能看不到完整数据'
          );
          
          suggestion.estimatedTime = '30-60分钟';
        } else {
          suggestion.repairSteps.push(
            '1. 检查API是否返回了重复数据',
            '2. 验证数据库查询是否有JOIN导致的重复',
            '3. 检查API响应数据的去重逻辑'
          );
          
          suggestion.risks.push(
            '可能存在数据重复显示',
            '影响数据统计准确性'
          );
          
          suggestion.estimatedTime = '15-30分钟';
        }
      }
    }

    // 字段值不一致
    if (issue.includes('不一致') && !issue.includes('数量')) {
      suggestion.repairSteps.push(
        '1. 确定哪个数据源是准确的（数据库 vs API）',
        '2. 检查数据转换逻辑是否正确',
        '3. 验证字段映射关系',
        '4. 同步不一致的字段值'
      );
      
      suggestion.sqlScripts.push(
        '-- 检查字段值差异',
        '-- SELECT * FROM table_name WHERE field != expected_value;',
        '',
        '-- 修复字段值（请根据实际情况修改）',
        '-- UPDATE table_name SET field = correct_value WHERE condition;'
      );
      
      suggestion.risks.push(
        '可能覆盖重要的业务数据',
        '需要确认数据修改的业务影响'
      );
      
      suggestion.estimatedTime = '45-90分钟';
    }

    // API缺少数据
    if (issue.includes('API缺少')) {
      suggestion.repairSteps.push(
        '1. 检查API查询的WHERE条件',
        '2. 验证数据库中记录的状态字段',
        '3. 检查是否有软删除逻辑影响',
        '4. 确认API的JOIN关系是否正确'
      );
      
      suggestion.apiChanges.push(
        '修改API查询条件',
        '检查关联表的JOIN逻辑',
        '验证数据过滤条件'
      );
      
      suggestion.risks.push(
        '可能影响核心业务功能',
        '用户无法访问应有的数据'
      );
      
      suggestion.estimatedTime = '60-120分钟';
    }
  }

  /**
   * 添加错误建议
   */
  addErrorSuggestions(suggestion, error) {
    suggestion.repairSteps.push(
      '1. 检查数据库连接状态',
      '2. 验证API服务是否正常运行',
      '3. 检查网络连接',
      '4. 查看详细错误日志'
    );
    
    suggestion.risks.push(
      '系统功能可能完全不可用',
      '需要立即处理以恢复服务'
    );
    
    suggestion.estimatedTime = '15-30分钟';
  }

  /**
   * 生成修复脚本
   */
  generateRepairScript(suggestion) {
    let script = `-- 修复脚本: ${suggestion.checkName}\n`;
    script += `-- 模块: ${suggestion.module}\n`;
    script += `-- 优先级: ${suggestion.priority}\n`;
    script += `-- 预估时间: ${suggestion.estimatedTime}\n\n`;
    
    if (suggestion.sqlScripts.length > 0) {
      script += `-- SQL 修复脚本\n`;
      script += suggestion.sqlScripts.join('\n') + '\n\n';
    }
    
    script += `-- 修复步骤:\n`;
    suggestion.repairSteps.forEach((step, index) => {
      script += `-- ${step}\n`;
    });
    
    if (suggestion.risks.length > 0) {
      script += `\n-- 风险提示:\n`;
      suggestion.risks.forEach(risk => {
        script += `-- ⚠️  ${risk}\n`;
      });
    }
    
    return script;
  }

  /**
   * 保存修复建议
   */
  saveSuggestions(outputDir = 'repair-suggestions') {
    const suggestionsDir = path.join(__dirname, '..', outputDir);
    
    if (!fs.existsSync(suggestionsDir)) {
      fs.mkdirSync(suggestionsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 保存完整的建议报告
    const reportFile = path.join(suggestionsDir, `repair-suggestions-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.suggestions, null, 2));
    
    // 生成可读的修复指南
    const guideFile = path.join(suggestionsDir, `repair-guide-${timestamp}.md`);
    const guide = this.generateRepairGuide();
    fs.writeFileSync(guideFile, guide);
    
    // 为每个建议生成单独的修复脚本
    this.suggestions.forEach((suggestion, index) => {
      const scriptFile = path.join(suggestionsDir, `repair-${index + 1}-${suggestion.module}.sql`);
      const script = this.generateRepairScript(suggestion);
      fs.writeFileSync(scriptFile, script);
    });
    
    console.log(chalk.green(`\n修复建议已保存到: ${suggestionsDir}`));
    console.log(chalk.gray(`- 完整报告: ${reportFile}`));
    console.log(chalk.gray(`- 修复指南: ${guideFile}`));
    console.log(chalk.gray(`- 修复脚本: ${this.suggestions.length} 个文件`));
    
    return suggestionsDir;
  }

  /**
   * 生成修复指南
   */
  generateRepairGuide() {
    let guide = `# 数据一致性修复指南\n\n`;
    guide += `生成时间: ${new Date().toISOString()}\n\n`;
    
    // 按优先级分组
    const priorityGroups = {
      critical: this.suggestions.filter(s => s.priority === 'critical'),
      high: this.suggestions.filter(s => s.priority === 'high'),
      medium: this.suggestions.filter(s => s.priority === 'medium'),
      low: this.suggestions.filter(s => s.priority === 'low')
    };
    
    guide += `## 修复概览\n\n`;
    guide += `- 🔴 严重问题: ${priorityGroups.critical.length} 个\n`;
    guide += `- 🟠 高优先级: ${priorityGroups.high.length} 个\n`;
    guide += `- 🟡 中优先级: ${priorityGroups.medium.length} 个\n`;
    guide += `- 🟢 低优先级: ${priorityGroups.low.length} 个\n\n`;
    
    for (const [priority, items] of Object.entries(priorityGroups)) {
      if (items.length === 0) continue;
      
      const emoji = priority === 'critical' ? '🔴' : 
                   priority === 'high' ? '🟠' : 
                   priority === 'medium' ? '🟡' : '🟢';
      
      guide += `## ${emoji} ${priority.toUpperCase()} 优先级\n\n`;
      
      items.forEach((suggestion, index) => {
        guide += `### ${index + 1}. ${suggestion.module} - ${suggestion.checkName}\n\n`;
        
        if (suggestion.issues.length > 0) {
          guide += `**问题描述:**\n`;
          suggestion.issues.forEach(issue => {
            guide += `- ${issue}\n`;
          });
          guide += `\n`;
        }
        
        if (suggestion.error) {
          guide += `**错误信息:** ${suggestion.error}\n\n`;
        }
        
        guide += `**预估修复时间:** ${suggestion.estimatedTime}\n\n`;
        
        guide += `**修复步骤:**\n`;
        suggestion.repairSteps.forEach(step => {
          guide += `${step}\n`;
        });
        guide += `\n`;
        
        if (suggestion.apiChanges.length > 0) {
          guide += `**API 修改建议:**\n`;
          suggestion.apiChanges.forEach(change => {
            guide += `- ${change}\n`;
          });
          guide += `\n`;
        }
        
        if (suggestion.risks.length > 0) {
          guide += `**⚠️ 风险提示:**\n`;
          suggestion.risks.forEach(risk => {
            guide += `- ${risk}\n`;
          });
          guide += `\n`;
        }
        
        guide += `---\n\n`;
      });
    }
    
    guide += `## 修复建议总结\n\n`;
    guide += `1. **优先处理严重和高优先级问题**，这些问题可能影响核心功能\n`;
    guide += `2. **在修复前创建数据备份**，避免数据丢失\n`;
    guide += `3. **在测试环境先验证修复方案**，确保不会引入新问题\n`;
    guide += `4. **逐个模块进行修复**，便于问题定位和回滚\n`;
    guide += `5. **修复后重新运行一致性检查**，验证问题是否解决\n\n`;
    
    return guide;
  }

  /**
   * 显示建议摘要
   */
  displaySummary() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('修复建议摘要'));
    console.log(chalk.blue('='.repeat(60)));
    
    const priorityCounts = {
      critical: this.suggestions.filter(s => s.priority === 'critical').length,
      high: this.suggestions.filter(s => s.priority === 'high').length,
      medium: this.suggestions.filter(s => s.priority === 'medium').length,
      low: this.suggestions.filter(s => s.priority === 'low').length
    };
    
    console.log(chalk.gray(`总建议数: ${this.suggestions.length}`));
    console.log(chalk.red(`🔴 严重: ${priorityCounts.critical}`));
    console.log(chalk.yellow(`🟠 高: ${priorityCounts.high}`));
    console.log(chalk.blue(`🟡 中: ${priorityCounts.medium}`));
    console.log(chalk.green(`🟢 低: ${priorityCounts.low}`));
    
    if (priorityCounts.critical > 0) {
      console.log(chalk.red('\n⚠️  发现严重问题，建议立即处理！'));
    } else if (priorityCounts.high > 0) {
      console.log(chalk.yellow('\n⚠️  发现高优先级问题，建议优先处理'));
    } else {
      console.log(chalk.green('\n✓ 没有发现严重问题'));
    }
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  let reportPath = null;
  
  for (const arg of args) {
    if (arg.startsWith('--report=')) {
      reportPath = arg.split('=')[1];
    }
  }
  
  if (!reportPath) {
    console.error(chalk.red('请提供一致性检查报告路径: --report=path/to/report.json'));
    process.exit(1);
  }
  
  const generator = new RepairSuggestionGenerator();
  
  try {
    const report = generator.loadReport(reportPath);
    const suggestions = generator.generateSuggestions(report);
    
    generator.displaySummary();
    generator.saveSuggestions();
    
  } catch (error) {
    console.error(chalk.red('生成修复建议失败:'), error.message);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = RepairSuggestionGenerator;