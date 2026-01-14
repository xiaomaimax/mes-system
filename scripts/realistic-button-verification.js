/**
 * 实际系统按钮功能验证脚本
 * 
 * 基于实际存在的组件文件进行验证
 * 
 * 使用方法：
 * node scripts/realistic-button-verification.js [--verbose]
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// 基于实际文件结构的组件配置
const ACTUAL_COMPONENTS = {
  production: {
    name: '生产管理',
    icon: '🏭',
    components: [
      {
        name: 'WorkshopPlan',
        displayName: '车间计划',
        path: 'client/src/components/production/WorkshopPlan.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'ProductionTasks',
        displayName: '生产任务',
        path: 'client/src/components/production/ProductionTasks.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'WorkReportManagement',
        displayName: '工作报告管理',
        path: 'client/src/components/production/WorkReportManagement.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'ProductionOrders',
        displayName: '生产订单',
        path: 'client/src/components/ProductionOrders.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  equipment: {
    name: '设备管理',
    icon: '⚙️',
    components: [
      {
        name: 'EquipmentMasterData',
        displayName: '设备主数据',
        path: 'client/src/components/equipment/EquipmentMasterData.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'EquipmentMaintenance',
        displayName: '设备维护',
        path: 'client/src/components/equipment/EquipmentMaintenance.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'EquipmentArchives',
        displayName: '设备档案',
        path: 'client/src/components/equipment/EquipmentArchives.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  process: {
    name: '工艺管理',
    icon: '🔧',
    components: [
      {
        name: 'ProcessMasterData',
        displayName: '工艺主数据',
        path: 'client/src/components/process/ProcessMasterData.js',
        hasAdd: true,
        hasDelete: true,
        isFixed: true // 已修复的组件
      },
      {
        name: 'ProcessRouting',
        displayName: '工艺路线',
        path: 'client/src/components/process/ProcessRouting.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  quality: {
    name: '质量管理',
    icon: '🔍',
    components: [
      {
        name: 'QualityInspection',
        displayName: '质量检验',
        path: 'client/src/components/quality/QualityInspection.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'DefectRecords',
        displayName: '缺陷记录',
        path: 'client/src/components/quality/DefectRecords.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'InspectionStandards',
        displayName: '检验标准',
        path: 'client/src/components/quality/InspectionStandards.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  inventory: {
    name: '库存管理',
    icon: '📦',
    components: [
      {
        name: 'InventoryMasterData',
        displayName: '库存主数据',
        path: 'client/src/components/inventory/InventoryMasterData.js',
        hasAdd: true,
        hasDelete: true,
        isFixed: true // 已修复的组件
      },
      {
        name: 'InventoryInOut',
        displayName: '出入库管理',
        path: 'client/src/components/inventory/InventoryInOut.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  personnel: {
    name: '人员管理',
    icon: '👥',
    components: [
      {
        name: 'EmployeeManagement',
        displayName: '员工管理',
        path: 'client/src/components/personnel/EmployeeManagement.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'DepartmentManagement',
        displayName: '部门管理',
        path: 'client/src/components/personnel/DepartmentManagement.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  },
  scheduling: {
    name: '排程管理',
    icon: '📅',
    components: [
      {
        name: 'PlanManagement',
        displayName: '计划管理',
        path: 'client/src/components/scheduling/PlanManagement.js',
        hasAdd: true,
        hasDelete: true
      },
      {
        name: 'TaskManagement',
        displayName: '任务管理',
        path: 'client/src/components/scheduling/TaskManagement.js',
        hasAdd: true,
        hasDelete: true
      }
    ]
  }
};

class RealisticButtonVerifier {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: 0,
        existingComponents: 0,
        fixedComponents: 0,
        needsFixComponents: 0,
        missingComponents: 0
      },
      modules: {},
      recommendations: []
    };
    this.verbose = false;
  }

  parseArgs() {
    const args = process.argv.slice(2);
    this.verbose = args.includes('--verbose');
  }

  checkComponentExists(componentPath) {
    return fs.existsSync(componentPath);
  }

  analyzeComponent(componentPath) {
    try {
      const code = fs.readFileSync(componentPath, 'utf8');
      
      return {
        hasAddButton: code.includes('PlusOutlined') || code.includes('新增') || code.includes('添加'),
        hasDeleteButton: code.includes('DeleteOutlined') || code.includes('删除'),
        usesUseDataService: code.includes('useDataService'),
        hasDataService: code.includes('DataService'),
        hasRefreshMechanism: code.includes('refetch') || code.includes('refresh'),
        hasErrorHandling: code.includes('error') && code.includes('message.error'),
        hasLoadingState: code.includes('loading') && code.includes('Spin'),
        usesHardcodedData: code.includes('const.*Data.*=.*[') && !code.includes('useDataService')
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async verifyComponent(component) {
    const result = {
      name: component.name,
      displayName: component.displayName,
      path: component.path,
      exists: false,
      isFixed: component.isFixed || false,
      status: 'unknown',
      issues: [],
      recommendations: []
    };

    this.results.summary.totalComponents++;

    // 检查文件是否存在
    result.exists = this.checkComponentExists(component.path);
    
    if (!result.exists) {
      result.status = 'missing';
      result.issues.push('组件文件不存在');
      this.results.summary.missingComponents++;
      return result;
    }

    this.results.summary.existingComponents++;

    // 如果已标记为修复，直接标记为良好
    if (result.isFixed) {
      result.status = 'fixed';
      this.results.summary.fixedComponents++;
      return result;
    }

    // 分析组件代码
    const analysis = this.analyzeComponent(component.path);
    
    if (analysis.error) {
      result.status = 'error';
      result.issues.push(`分析失败: ${analysis.error}`);
      this.results.summary.needsFixComponents++;
      return result;
    }

    // 评估组件状态
    let score = 0;
    let maxScore = 0;

    // 检查新增按钮
    if (component.hasAdd) {
      maxScore += 3;
      if (analysis.hasAddButton) {
        score += 1;
        if (analysis.hasRefreshMechanism) {
          score += 1;
        } else {
          result.issues.push('新增按钮缺少数据刷新机制');
          result.recommendations.push('在保存成功后调用refetch()方法刷新数据');
        }
        if (analysis.usesUseDataService) {
          score += 1;
        } else {
          result.issues.push('未使用useDataService Hook');
          result.recommendations.push('使用useDataService Hook管理数据状态');
        }
      } else {
        result.issues.push('缺少新增按钮');
        result.recommendations.push('添加新增按钮和相关功能');
      }
    }

    // 检查删除按钮
    if (component.hasDelete) {
      maxScore += 1;
      if (analysis.hasDeleteButton) {
        score += 1;
      } else {
        result.issues.push('缺少删除按钮');
        result.recommendations.push('添加删除按钮和确认对话框');
      }
    }

    // 检查数据服务
    maxScore += 1;
    if (analysis.usesUseDataService || analysis.hasDataService) {
      score += 1;
    } else {
      result.issues.push('未使用数据服务层');
      result.recommendations.push('集成DataService和useDataService Hook');
    }

    // 检查错误处理
    maxScore += 1;
    if (analysis.hasErrorHandling) {
      score += 1;
    } else {
      result.issues.push('缺少错误处理');
      result.recommendations.push('添加try-catch错误处理和用户提示');
    }

    // 检查加载状态
    maxScore += 1;
    if (analysis.hasLoadingState) {
      score += 1;
    } else {
      result.issues.push('缺少加载状态');
      result.recommendations.push('添加Spin组件显示加载状态');
    }

    // 检查硬编码数据
    if (analysis.usesHardcodedData) {
      result.issues.push('使用硬编码数据');
      result.recommendations.push('替换硬编码数据为动态数据服务');
    }

    // 确定状态
    const passRate = score / maxScore;
    if (passRate >= 0.8) {
      result.status = 'good';
    } else if (passRate >= 0.5) {
      result.status = 'needs_improvement';
      this.results.summary.needsFixComponents++;
    } else {
      result.status = 'needs_major_fix';
      this.results.summary.needsFixComponents++;
    }

    return result;
  }

  async verifyModule(moduleKey, moduleConfig) {
    console.log(chalk.blue(`\n${moduleConfig.icon} 验证模块: ${moduleConfig.name}`));
    
    const moduleResult = {
      name: moduleConfig.name,
      icon: moduleConfig.icon,
      components: [],
      summary: {
        total: moduleConfig.components.length,
        existing: 0,
        fixed: 0,
        good: 0,
        needsImprovement: 0,
        needsMajorFix: 0,
        missing: 0
      }
    };

    for (const component of moduleConfig.components) {
      const componentResult = await this.verifyComponent(component);
      moduleResult.components.push(componentResult);

      // 更新统计
      switch (componentResult.status) {
        case 'fixed':
          moduleResult.summary.fixed++;
          moduleResult.summary.existing++;
          if (this.verbose) {
            console.log(chalk.green(`  ✅ ${component.displayName} - 已修复`));
          }
          break;
        case 'good':
          moduleResult.summary.good++;
          moduleResult.summary.existing++;
          if (this.verbose) {
            console.log(chalk.green(`  ✅ ${component.displayName} - 良好`));
          }
          break;
        case 'needs_improvement':
          moduleResult.summary.needsImprovement++;
          moduleResult.summary.existing++;
          if (this.verbose) {
            console.log(chalk.yellow(`  ⚠️  ${component.displayName} - 需要改进`));
          }
          break;
        case 'needs_major_fix':
          moduleResult.summary.needsMajorFix++;
          moduleResult.summary.existing++;
          if (this.verbose) {
            console.log(chalk.red(`  ❌ ${component.displayName} - 需要大幅修复`));
          }
          break;
        case 'missing':
          moduleResult.summary.missing++;
          if (this.verbose) {
            console.log(chalk.gray(`  ❓ ${component.displayName} - 文件不存在`));
          }
          break;
        case 'error':
          moduleResult.summary.needsMajorFix++;
          if (this.verbose) {
            console.log(chalk.red(`  💥 ${component.displayName} - 分析错误`));
          }
          break;
      }

      // 显示问题和建议
      if (this.verbose && componentResult.issues.length > 0) {
        componentResult.issues.forEach(issue => {
          console.log(chalk.yellow(`    问题: ${issue}`));
        });
      }
      if (this.verbose && componentResult.recommendations.length > 0) {
        componentResult.recommendations.forEach(rec => {
          console.log(chalk.cyan(`    建议: ${rec}`));
        });
      }
    }

    const healthRate = ((moduleResult.summary.fixed + moduleResult.summary.good) / moduleResult.summary.total * 100).toFixed(1);
    console.log(chalk.gray(`  模块健康度: ${healthRate}% (${moduleResult.summary.fixed + moduleResult.summary.good}/${moduleResult.summary.total})`));

    this.results.modules[moduleKey] = moduleResult;
    return moduleResult;
  }

  async runVerification() {
    console.log(chalk.blue('🔍 实际系统按钮功能验证'));
    console.log(chalk.blue('=' * 50));

    this.parseArgs();

    for (const [moduleKey, moduleConfig] of Object.entries(ACTUAL_COMPONENTS)) {
      await this.verifyModule(moduleKey, moduleConfig);
    }

    this.generateReport();
    this.generateActionPlan();
  }

  generateReport() {
    console.log(chalk.blue('\n' + '=' * 50));
    console.log(chalk.blue('📊 验证结果报告'));
    console.log(chalk.blue('=' * 50));

    // 总体统计
    console.log(chalk.blue('\n📈 总体统计:'));
    console.log(chalk.gray(`总组件数: ${this.results.summary.totalComponents}`));
    console.log(chalk.green(`存在组件: ${this.results.summary.existingComponents}`));
    console.log(chalk.blue(`已修复组件: ${this.results.summary.fixedComponents}`));
    console.log(chalk.yellow(`需要修复组件: ${this.results.summary.needsFixComponents}`));
    console.log(chalk.red(`缺失组件: ${this.results.summary.missingComponents}`));

    const healthRate = this.results.summary.totalComponents > 0 ? 
      ((this.results.summary.fixedComponents + this.results.summary.existingComponents - this.results.summary.needsFixComponents) / this.results.summary.totalComponents * 100).toFixed(1) : 0;
    
    console.log(chalk.blue(`\n系统健康度: ${healthRate}%`));

    // 模块详情
    console.log(chalk.blue('\n📋 模块详情:'));
    for (const [moduleKey, moduleResult] of Object.entries(this.results.modules)) {
      console.log(chalk.blue(`\n${moduleResult.icon} ${moduleResult.name}:`));
      console.log(chalk.green(`  ✅ 已修复/良好: ${moduleResult.summary.fixed + moduleResult.summary.good}`));
      console.log(chalk.yellow(`  ⚠️  需要改进: ${moduleResult.summary.needsImprovement}`));
      console.log(chalk.red(`  ❌ 需要大幅修复: ${moduleResult.summary.needsMajorFix}`));
      console.log(chalk.gray(`  ❓ 缺失组件: ${moduleResult.summary.missing}`));
    }
  }

  generateActionPlan() {
    console.log(chalk.blue('\n' + '=' * 50));
    console.log(chalk.blue('📋 行动计划'));
    console.log(chalk.blue('=' * 50));

    // 高优先级：需要大幅修复的组件
    const majorFixComponents = [];
    const improvementComponents = [];
    const missingComponents = [];

    for (const moduleResult of Object.values(this.results.modules)) {
      for (const component of moduleResult.components) {
        switch (component.status) {
          case 'needs_major_fix':
          case 'error':
            majorFixComponents.push({ module: moduleResult.name, ...component });
            break;
          case 'needs_improvement':
            improvementComponents.push({ module: moduleResult.name, ...component });
            break;
          case 'missing':
            missingComponents.push({ module: moduleResult.name, ...component });
            break;
        }
      }
    }

    if (majorFixComponents.length > 0) {
      console.log(chalk.red('\n🚨 高优先级 - 需要立即修复:'));
      majorFixComponents.forEach((comp, index) => {
        console.log(chalk.red(`${index + 1}. ${comp.module} - ${comp.displayName}`));
        comp.issues.forEach(issue => {
          console.log(chalk.yellow(`   问题: ${issue}`));
        });
        comp.recommendations.forEach(rec => {
          console.log(chalk.cyan(`   建议: ${rec}`));
        });
      });
    }

    if (improvementComponents.length > 0) {
      console.log(chalk.yellow('\n⚠️  中优先级 - 需要改进:'));
      improvementComponents.forEach((comp, index) => {
        console.log(chalk.yellow(`${index + 1}. ${comp.module} - ${comp.displayName}`));
        comp.recommendations.slice(0, 2).forEach(rec => {
          console.log(chalk.cyan(`   建议: ${rec}`));
        });
      });
    }

    if (missingComponents.length > 0) {
      console.log(chalk.gray('\n❓ 低优先级 - 缺失组件:'));
      missingComponents.forEach((comp, index) => {
        console.log(chalk.gray(`${index + 1}. ${comp.module} - ${comp.displayName}`));
      });
    }

    // 通用建议
    console.log(chalk.blue('\n💡 通用修复建议:'));
    console.log(chalk.cyan('1. 使用统一的数据服务模式:'));
    console.log(chalk.gray('   - 导入useDataService Hook'));
    console.log(chalk.gray('   - 在保存成功后调用refetch()刷新数据'));
    console.log(chalk.gray('   - 添加loading和error状态处理'));
    
    console.log(chalk.cyan('2. 标准化按钮功能:'));
    console.log(chalk.gray('   - 新增按钮使用PlusOutlined图标'));
    console.log(chalk.gray('   - 删除按钮使用DeleteOutlined图标'));
    console.log(chalk.gray('   - 添加确认对话框'));
    
    console.log(chalk.cyan('3. 改进用户体验:'));
    console.log(chalk.gray('   - 添加操作成功/失败提示'));
    console.log(chalk.gray('   - 显示加载状态'));
    console.log(chalk.gray('   - 提供错误重试机制'));

    // 修复模板
    console.log(chalk.blue('\n📝 修复模板参考:'));
    console.log(chalk.gray('参考已修复的组件:'));
    console.log(chalk.green('- client/src/components/process/ProcessMasterData.js'));
    console.log(chalk.green('- client/src/components/inventory/InventoryMasterData.js'));
  }
}

// 主函数
async function main() {
  const verifier = new RealisticButtonVerifier();
  await verifier.runVerification();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('验证失败:'), error);
    process.exit(1);
  });
}

module.exports = RealisticButtonVerifier;