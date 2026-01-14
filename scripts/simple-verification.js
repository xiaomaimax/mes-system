/**
 * 简化验证脚本 - 不依赖后端服务
 * 
 * 直接验证组件文件的代码质量和结构
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class SimpleVerifier {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      components: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        successRate: 0
      }
    };
  }

  checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  analyzeComponent(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      
      const analysis = {
        hasAddButton: code.includes('PlusOutlined') || code.includes('新增'),
        hasDeleteButton: code.includes('DeleteOutlined') || code.includes('删除'),
        usesDataService: code.includes('DataService') || code.includes('useDataService'),
        hasErrorHandling: code.includes('try') && code.includes('catch'),
        hasLoadingState: code.includes('loading') && code.includes('Spin'),
        hasSuccessMessage: code.includes('message.success'),
        hasRefreshMechanism: code.includes('refetch') || code.includes('refresh'),
        usesHardcodedData: code.includes('const.*Data.*=.*\\[') && !code.includes('useDataService'),
        hasFormValidation: code.includes('rules') && code.includes('required'),
        hasModalDialog: code.includes('Modal') && code.includes('visible')
      };
      
      return analysis;
    } catch (error) {
      return { error: error.message };
    }
  }

  scoreComponent(analysis) {
    if (analysis.error) return 0;
    
    let score = 0;
    let maxScore = 10;
    
    // 基础功能 (4分)
    if (analysis.hasAddButton) score += 1;
    if (analysis.hasDeleteButton) score += 1;
    if (analysis.hasModalDialog) score += 1;
    if (analysis.hasFormValidation) score += 1;
    
    // 数据处理 (3分)
    if (analysis.usesDataService) score += 1.5;
    if (analysis.hasRefreshMechanism) score += 1;
    if (!analysis.usesHardcodedData) score += 0.5;
    
    // 用户体验 (3分)
    if (analysis.hasLoadingState) score += 1;
    if (analysis.hasErrorHandling) score += 1;
    if (analysis.hasSuccessMessage) score += 1;
    
    return (score / maxScore) * 100;
  }

  getComponentStatus(score) {
    if (score >= 90) return { status: 'excellent', icon: '🟢', label: '优秀' };
    if (score >= 75) return { status: 'good', icon: '✅', label: '良好' };
    if (score >= 60) return { status: 'fair', icon: '🟡', label: '一般' };
    if (score >= 40) return { status: 'poor', icon: '🟠', label: '较差' };
    return { status: 'bad', icon: '🔴', label: '很差' };
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.hasAddButton) {
      recommendations.push('添加新增按钮 (PlusOutlined)');
    }
    if (!analysis.hasDeleteButton) {
      recommendations.push('添加删除按钮 (DeleteOutlined)');
    }
    if (!analysis.usesDataService) {
      recommendations.push('集成DataService和useDataService Hook');
    }
    if (!analysis.hasRefreshMechanism) {
      recommendations.push('添加数据刷新机制 (refetch)');
    }
    if (!analysis.hasErrorHandling) {
      recommendations.push('添加错误处理 (try-catch)');
    }
    if (!analysis.hasLoadingState) {
      recommendations.push('添加加载状态 (Spin组件)');
    }
    if (!analysis.hasSuccessMessage) {
      recommendations.push('添加成功提示 (message.success)');
    }
    if (analysis.usesHardcodedData) {
      recommendations.push('替换硬编码数据为动态数据');
    }
    
    return recommendations;
  }

  verifyComponent(config) {
    console.log(chalk.blue(`🔍 验证: ${config.name}`));
    
    const result = {
      name: config.name,
      path: config.path,
      exists: false,
      score: 0,
      status: 'unknown',
      analysis: {},
      recommendations: [],
      isFixed: config.isFixed || false
    };
    
    // 检查文件是否存在
    result.exists = this.checkFileExists(config.path);
    
    if (!result.exists) {
      result.status = 'missing';
      result.recommendations.push('创建组件文件');
      console.log(chalk.red(`  ❌ 文件不存在: ${config.path}`));
      return result;
    }
    
    // 分析组件代码
    result.analysis = this.analyzeComponent(config.path);
    
    if (result.analysis.error) {
      result.status = 'error';
      result.recommendations.push('修复文件读取错误');
      console.log(chalk.red(`  ❌ 分析失败: ${result.analysis.error}`));
      return result;
    }
    
    // 计算分数
    result.score = this.scoreComponent(result.analysis);
    const statusInfo = this.getComponentStatus(result.score);
    result.status = statusInfo.status;
    
    // 生成建议
    result.recommendations = this.generateRecommendations(result.analysis);
    
    console.log(chalk.gray(`  ${statusInfo.icon} ${statusInfo.label} (${result.score.toFixed(1)}分)`));
    
    if (result.recommendations.length > 0) {
      console.log(chalk.yellow(`  建议: ${result.recommendations.slice(0, 2).join(', ')}`));
    }
    
    return result;
  }

  async runStage1() {
    console.log(chalk.blue('\n🎯 阶段1: 已修复组件验证'));
    
    const components = [
      {
        name: '工艺管理-主数据',
        path: 'client/src/components/process/ProcessMasterData.js',
        isFixed: true
      },
      {
        name: '库存管理-主数据',
        path: 'client/src/components/inventory/InventoryMasterData.js',
        isFixed: true
      }
    ];
    
    for (const component of components) {
      const result = this.verifyComponent(component);
      this.results.components.push(result);
      this.results.summary.total++;
      
      if (result.score >= 70) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
    }
  }

  async runStage2() {
    console.log(chalk.blue('\n🎯 阶段2: 良好组件验证'));
    
    const components = [
      {
        name: '生产管理-工作报告管理',
        path: 'client/src/components/production/WorkReportManagement.js'
      },
      {
        name: '设备管理-设备主数据',
        path: 'client/src/components/equipment/EquipmentMasterData.js'
      },
      {
        name: '质量管理-检验标准',
        path: 'client/src/components/quality/InspectionStandards.js'
      }
    ];
    
    for (const component of components) {
      const result = this.verifyComponent(component);
      this.results.components.push(result);
      this.results.summary.total++;
      
      if (result.score >= 70) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
    }
  }

  async runStage3() {
    console.log(chalk.blue('\n🎯 阶段3: 需要改进组件验证'));
    
    const components = [
      {
        name: '生产管理-车间计划',
        path: 'client/src/components/production/WorkshopPlan.js'
      },
      {
        name: '生产管理-生产任务',
        path: 'client/src/components/production/ProductionTasks.js'
      },
      {
        name: '设备管理-设备维护',
        path: 'client/src/components/equipment/EquipmentMaintenance.js'
      },
      {
        name: '工艺管理-工艺路线',
        path: 'client/src/components/process/ProcessRouting.js'
      },
      {
        name: '库存管理-出入库管理',
        path: 'client/src/components/inventory/InventoryInOut.js'
      }
    ];
    
    for (const component of components) {
      const result = this.verifyComponent(component);
      this.results.components.push(result);
      this.results.summary.total++;
      
      if (result.score >= 70) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
    }
  }

  async runStage4() {
    console.log(chalk.blue('\n🎯 阶段4: 严重问题组件验证'));
    
    const components = [
      {
        name: '生产管理-生产订单',
        path: 'client/src/components/ProductionOrders.js'
      },
      {
        name: '设备管理-设备档案',
        path: 'client/src/components/equipment/EquipmentArchives.js'
      },
      {
        name: '质量管理-质量检验',
        path: 'client/src/components/quality/QualityInspection.js'
      },
      {
        name: '质量管理-缺陷记录',
        path: 'client/src/components/quality/DefectRecords.js'
      },
      {
        name: '人员管理-员工管理',
        path: 'client/src/components/personnel/EmployeeManagement.js'
      },
      {
        name: '人员管理-部门管理',
        path: 'client/src/components/personnel/DepartmentManagement.js'
      },
      {
        name: '排程管理-计划管理',
        path: 'client/src/components/scheduling/PlanManagement.js'
      },
      {
        name: '排程管理-任务管理',
        path: 'client/src/components/scheduling/TaskManagement.js'
      }
    ];
    
    for (const component of components) {
      const result = this.verifyComponent(component);
      this.results.components.push(result);
      this.results.summary.total++;
      
      if (result.score >= 70) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
    }
  }

  generateReport() {
    this.results.summary.successRate = this.results.summary.total > 0 ? 
      (this.results.summary.passed / this.results.summary.total * 100).toFixed(1) : 0;
    
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 简化验证报告'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log(chalk.blue('\n📈 总体统计:'));
    console.log(chalk.gray(`验证时间: ${this.results.timestamp}`));
    console.log(chalk.gray(`总组件数: ${this.results.summary.total}`));
    console.log(chalk.green(`通过组件: ${this.results.summary.passed}`));
    console.log(chalk.red(`失败组件: ${this.results.summary.failed}`));
    console.log(chalk.blue(`成功率: ${this.results.summary.successRate}%`));
    
    console.log(chalk.blue('\n📋 组件详情:'));
    for (const component of this.results.components) {
      const statusInfo = this.getComponentStatus(component.score);
      console.log(`${statusInfo.icon} ${component.name} (${component.score.toFixed(1)}分)`);
      
      if (component.recommendations.length > 0) {
        component.recommendations.slice(0, 3).forEach(rec => {
          console.log(chalk.yellow(`  • ${rec}`));
        });
      }
    }
    
    // 总体建议
    console.log(chalk.blue('\n💡 总体建议:'));
    if (this.results.summary.successRate >= 80) {
      console.log(chalk.green('✅ 系统状态良好，可以进行手动验证'));
    } else if (this.results.summary.successRate >= 60) {
      console.log(chalk.yellow('⚠️ 系统有改进空间，建议优先修复高分组件'));
    } else {
      console.log(chalk.red('❌ 系统需要大幅改进，建议先修复基础功能'));
    }
    
    // 保存报告
    const reportPath = `simple-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(chalk.blue(`\n📄 详细报告已保存到: ${reportPath}`));
    
    return this.results;
  }

  async run(stage = null) {
    console.log(chalk.blue('🔍 简化组件验证 (代码分析模式)'));
    console.log(chalk.blue('=' * 50));
    
    try {
      if (stage === 1) {
        await this.runStage1();
      } else if (stage === 2) {
        await this.runStage2();
      } else if (stage === 3) {
        await this.runStage3();
      } else if (stage === 4) {
        await this.runStage4();
      } else {
        await this.runStage1();
        await this.runStage2();
        await this.runStage3();
        await this.runStage4();
      }
      
      const report = this.generateReport();
      
      console.log(chalk.green('\n🎉 简化验证完成！'));
      
      return report;
      
    } catch (error) {
      console.error(chalk.red(`❌ 验证失败: ${error.message}`));
      throw error;
    }
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const stageArg = args.find(arg => arg.startsWith('--stage='));
  return stageArg ? parseInt(stageArg.split('=')[1]) : null;
}

// 主函数
async function main() {
  const stage = parseArgs();
  const verifier = new SimpleVerifier();
  
  try {
    await verifier.run(stage);
  } catch (error) {
    console.error(chalk.red('简化验证失败:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleVerifier;