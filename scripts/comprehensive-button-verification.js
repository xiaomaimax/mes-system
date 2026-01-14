/**
 * 系统按钮功能全面验证脚本
 * 
 * 验证整个MES系统所有模块的新增、删除按钮功能
 * 包括：生产管理、设备管理、工艺管理、质量管理、库存管理、人员管理等
 * 
 * 使用方法：
 * node scripts/comprehensive-button-verification.js [--module=all|production|equipment|process|quality|inventory|personnel] [--action=all|add|delete] [--verbose]
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// 系统模块配置
const SYSTEM_MODULES = {
  production: {
    name: '生产管理',
    icon: '🏭',
    components: [
      {
        name: 'WorkshopPlan',
        displayName: '车间计划',
        path: 'client/src/components/production/WorkshopPlan.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getProductionPlans',
        addService: 'addProductionPlan'
      },
      {
        name: 'ProductionTasks',
        displayName: '生产任务',
        path: 'client/src/components/production/ProductionTasks.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getProductionTasks',
        addService: 'addProductionTask'
      },
      {
        name: 'WorkReportManagement',
        displayName: '工作报告',
        path: 'client/src/components/production/WorkReportManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getWorkReports',
        addService: 'addWorkReport'
      },
      {
        name: 'ProductionOrders',
        displayName: '生产订单',
        path: 'client/src/components/ProductionOrders.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getProductionOrders',
        addService: 'addProductionOrder'
      }
    ]
  },
  equipment: {
    name: '设备管理',
    icon: '⚙️',
    components: [
      {
        name: 'EquipmentManagement',
        displayName: '设备管理',
        path: 'client/src/components/equipment/EquipmentManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getEquipment',
        addService: 'addEquipment'
      },
      {
        name: 'MoldManagement',
        displayName: '模具管理',
        path: 'client/src/components/equipment/MoldManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getMolds',
        addService: 'addMold'
      },
      {
        name: 'EquipmentMaintenance',
        displayName: '设备维护',
        path: 'client/src/components/equipment/EquipmentMaintenance.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getEquipmentMaintenance',
        addService: 'addEquipmentMaintenance'
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
        dataService: 'getProcessProducts',
        addService: 'addProcessProduct',
        multiTab: true,
        tabs: [
          { key: 'products', name: '产品主数据', dataService: 'getProcessProducts', addService: 'addProcessProduct' },
          { key: 'operations', name: '工序主数据', dataService: 'getProcessOperations', addService: 'addProcessOperation' },
          { key: 'equipment', name: '设备主数据', dataService: 'getProcessEquipment', addService: 'addProcessEquipment' }
        ]
      },
      {
        name: 'ProcessRouting',
        displayName: '工艺路线',
        path: 'client/src/components/process/ProcessRouting.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getProcessRouting',
        addService: 'addProcessRouting'
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
        hasDelete: true,
        dataService: 'getQualityInspections',
        addService: 'addQualityInspection'
      },
      {
        name: 'DefectRecords',
        displayName: '缺陷记录',
        path: 'client/src/components/quality/DefectRecords.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getDefectRecords',
        addService: 'addDefectRecord'
      },
      {
        name: 'InspectionStandards',
        displayName: '检验标准',
        path: 'client/src/components/quality/InspectionStandards.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getInspectionStandards',
        addService: 'addInspectionStandard'
      }
    ]
  },
  inventory: {
    name: '库存管理',
    icon: '📦',
    components: [
      {
        name: 'InventoryManagement',
        displayName: '库存管理',
        path: 'client/src/components/inventory/InventoryManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getInventory',
        addService: 'addInventoryItem'
      },
      {
        name: 'InventoryTransactions',
        displayName: '出入库管理',
        path: 'client/src/components/inventory/InventoryTransactions.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getInventoryTransactions',
        addService: 'addInventoryTransaction'
      },
      {
        name: 'LocationManagement',
        displayName: '库位管理',
        path: 'client/src/components/inventory/LocationManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getLocationManagement',
        addService: 'addLocation'
      },
      {
        name: 'InventoryMasterData',
        displayName: '库存主数据',
        path: 'client/src/components/inventory/InventoryMasterData.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getInventory',
        addService: 'addInventoryMasterData',
        multiTab: true,
        tabs: [
          { key: 'materials', name: '物料主数据', dataService: 'getInventory', addService: 'addMaterial' },
          { key: 'locations', name: '库位主数据', dataService: 'getLocationManagement', addService: 'addLocation' }
        ]
      }
    ]
  },
  personnel: {
    name: '人员管理',
    icon: '👥',
    components: [
      {
        name: 'PersonnelManagement',
        displayName: '人员管理',
        path: 'client/src/components/personnel/PersonnelManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getEmployees',
        addService: 'addEmployee'
      },
      {
        name: 'ShiftManagement',
        displayName: '班次管理',
        path: 'client/src/components/personnel/ShiftManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getShifts',
        addService: 'addShift'
      }
    ]
  },
  scheduling: {
    name: '排程管理',
    icon: '📅',
    components: [
      {
        name: 'SchedulingManagement',
        displayName: '排程管理',
        path: 'client/src/components/scheduling/SchedulingManagement.js',
        hasAdd: true,
        hasDelete: true,
        dataService: 'getSchedulingPlans',
        addService: 'addSchedulingPlan'
      }
    ]
  }
};

class ButtonVerificationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      modules: {},
      summary: {
        totalComponents: 0,
        passedComponents: 0,
        failedComponents: 0,
        totalButtons: 0,
        passedButtons: 0,
        failedButtons: 0,
        issues: []
      }
    };
    this.verbose = false;
  }

  /**
   * 解析命令行参数
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      module: 'all',
      action: 'all',
      verbose: false
    };

    for (const arg of args) {
      if (arg.startsWith('--module=')) {
        options.module = arg.split('=')[1];
      } else if (arg.startsWith('--action=')) {
        options.action = arg.split('=')[1];
      } else if (arg === '--verbose') {
        options.verbose = true;
        this.verbose = true;
      }
    }

    return options;
  }

  /**
   * 检查组件文件是否存在
   */
  checkComponentExists(componentPath) {
    return fs.existsSync(componentPath);
  }

  /**
   * 分析组件代码，检查按钮功能
   */
  analyzeComponentCode(componentPath) {
    try {
      const code = fs.readFileSync(componentPath, 'utf8');
      
      const analysis = {
        hasAddButton: false,
        hasDeleteButton: false,
        hasDataService: false,
        hasRefreshMechanism: false,
        usesUseDataService: false,
        hasErrorHandling: false,
        hasLoadingState: false,
        issues: []
      };

      // 检查新增按钮
      if (code.includes('PlusOutlined') || code.includes('新增') || code.includes('添加')) {
        analysis.hasAddButton = true;
      }

      // 检查删除按钮
      if (code.includes('DeleteOutlined') || code.includes('删除')) {
        analysis.hasDeleteButton = true;
      }

      // 检查是否使用DataService
      if (code.includes('DataService') || code.includes('import.*DataService')) {
        analysis.hasDataService = true;
      }

      // 检查是否使用useDataService Hook
      if (code.includes('useDataService')) {
        analysis.usesUseDataService = true;
      }

      // 检查刷新机制
      if (code.includes('refetch') || code.includes('refresh') || code.includes('reload')) {
        analysis.hasRefreshMechanism = true;
      }

      // 检查错误处理
      if (code.includes('error') && (code.includes('message.error') || code.includes('catch'))) {
        analysis.hasErrorHandling = true;
      }

      // 检查加载状态
      if (code.includes('loading') && (code.includes('Spin') || code.includes('Loading'))) {
        analysis.hasLoadingState = true;
      }

      // 检查潜在问题
      if (analysis.hasAddButton && !analysis.hasRefreshMechanism) {
        analysis.issues.push('有新增按钮但缺少数据刷新机制');
      }

      if (analysis.hasAddButton && !analysis.usesUseDataService && !analysis.hasDataService) {
        analysis.issues.push('有新增按钮但未使用数据服务层');
      }

      if (!analysis.hasErrorHandling) {
        analysis.issues.push('缺少错误处理机制');
      }

      if (!analysis.hasLoadingState) {
        analysis.issues.push('缺少加载状态指示');
      }

      // 检查是否使用硬编码数据
      if (code.includes('const.*Data.*=.*[') && !analysis.usesUseDataService) {
        analysis.issues.push('可能使用硬编码数据而非动态数据');
      }

      return analysis;
    } catch (error) {
      return {
        error: error.message,
        issues: [`无法分析组件代码: ${error.message}`]
      };
    }
  }

  /**
   * 验证单个组件
   */
  async verifyComponent(moduleKey, component) {
    const result = {
      name: component.name,
      displayName: component.displayName,
      path: component.path,
      exists: false,
      analysis: null,
      score: 0,
      maxScore: 0,
      status: 'failed',
      issues: []
    };

    this.results.summary.totalComponents++;

    // 检查文件是否存在
    result.exists = this.checkComponentExists(component.path);
    if (!result.exists) {
      result.issues.push('组件文件不存在');
      this.results.summary.failedComponents++;
      return result;
    }

    // 分析组件代码
    result.analysis = this.analyzeComponentCode(component.path);
    
    if (result.analysis.error) {
      result.issues.push(result.analysis.error);
      this.results.summary.failedComponents++;
      return result;
    }

    // 计算得分
    let score = 0;
    let maxScore = 0;

    // 新增按钮检查
    if (component.hasAdd) {
      maxScore += 2;
      if (result.analysis.hasAddButton) {
        score += 1;
        if (result.analysis.hasRefreshMechanism) {
          score += 1;
        } else {
          result.issues.push('新增按钮缺少数据刷新机制');
        }
      } else {
        result.issues.push('缺少新增按钮');
      }
    }

    // 删除按钮检查
    if (component.hasDelete) {
      maxScore += 1;
      if (result.analysis.hasDeleteButton) {
        score += 1;
      } else {
        result.issues.push('缺少删除按钮');
      }
    }

    // 数据服务检查
    maxScore += 2;
    if (result.analysis.usesUseDataService) {
      score += 2;
    } else if (result.analysis.hasDataService) {
      score += 1;
      result.issues.push('使用DataService但未使用useDataService Hook');
    } else {
      result.issues.push('未使用数据服务层');
    }

    // 错误处理检查
    maxScore += 1;
    if (result.analysis.hasErrorHandling) {
      score += 1;
    } else {
      result.issues.push('缺少错误处理');
    }

    // 加载状态检查
    maxScore += 1;
    if (result.analysis.hasLoadingState) {
      score += 1;
    } else {
      result.issues.push('缺少加载状态指示');
    }

    // 添加分析中发现的其他问题
    result.issues.push(...(result.analysis.issues || []));

    result.score = score;
    result.maxScore = maxScore;
    result.status = score === maxScore ? 'passed' : (score > maxScore * 0.6 ? 'warning' : 'failed');

    if (result.status === 'passed') {
      this.results.summary.passedComponents++;
    } else {
      this.results.summary.failedComponents++;
    }

    // 统计按钮数量
    if (component.hasAdd) {
      this.results.summary.totalButtons++;
      if (result.analysis.hasAddButton && result.analysis.hasRefreshMechanism) {
        this.results.summary.passedButtons++;
      } else {
        this.results.summary.failedButtons++;
      }
    }

    if (component.hasDelete) {
      this.results.summary.totalButtons++;
      if (result.analysis.hasDeleteButton) {
        this.results.summary.passedButtons++;
      } else {
        this.results.summary.failedButtons++;
      }
    }

    return result;
  }

  /**
   * 验证模块
   */
  async verifyModule(moduleKey, moduleConfig) {
    console.log(chalk.blue(`\n${moduleConfig.icon} 验证模块: ${moduleConfig.name}`));
    
    const moduleResult = {
      name: moduleConfig.name,
      icon: moduleConfig.icon,
      components: [],
      summary: {
        total: moduleConfig.components.length,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    for (const component of moduleConfig.components) {
      if (this.verbose) {
        console.log(chalk.gray(`  检查组件: ${component.displayName}`));
      }

      const componentResult = await this.verifyComponent(moduleKey, component);
      moduleResult.components.push(componentResult);

      // 更新模块统计
      switch (componentResult.status) {
        case 'passed':
          moduleResult.summary.passed++;
          if (this.verbose) {
            console.log(chalk.green(`    ✅ ${component.displayName} - 通过`));
          }
          break;
        case 'warning':
          moduleResult.summary.warnings++;
          if (this.verbose) {
            console.log(chalk.yellow(`    ⚠️  ${component.displayName} - 警告`));
          }
          break;
        case 'failed':
          moduleResult.summary.failed++;
          if (this.verbose) {
            console.log(chalk.red(`    ❌ ${component.displayName} - 失败`));
          }
          break;
      }

      // 显示问题
      if (componentResult.issues.length > 0 && this.verbose) {
        componentResult.issues.forEach(issue => {
          console.log(chalk.yellow(`      - ${issue}`));
        });
      }
    }

    // 显示模块总结
    const passRate = ((moduleResult.summary.passed / moduleResult.summary.total) * 100).toFixed(1);
    console.log(chalk.gray(`  模块总结: ${moduleResult.summary.passed}/${moduleResult.summary.total} 通过 (${passRate}%)`));

    this.results.modules[moduleKey] = moduleResult;
    return moduleResult;
  }

  /**
   * 运行验证
   */
  async runVerification(options) {
    console.log(chalk.blue('🔍 开始系统按钮功能全面验证'));
    console.log(chalk.blue('=' * 60));
    console.log(chalk.gray(`验证范围: ${options.module === 'all' ? '所有模块' : options.module}`));
    console.log(chalk.gray(`验证操作: ${options.action === 'all' ? '所有操作' : options.action}`));
    console.log(chalk.gray(`详细输出: ${options.verbose ? '是' : '否'}`));

    const modulesToVerify = options.module === 'all' ? 
      Object.keys(SYSTEM_MODULES) : 
      [options.module].filter(m => SYSTEM_MODULES[m]);

    if (modulesToVerify.length === 0) {
      console.log(chalk.red('❌ 未找到要验证的模块'));
      return;
    }

    // 验证每个模块
    for (const moduleKey of modulesToVerify) {
      await this.verifyModule(moduleKey, SYSTEM_MODULES[moduleKey]);
    }

    // 生成报告
    this.generateReport();
    this.saveReport();
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log(chalk.blue('\n' + '=' * 60));
    console.log(chalk.blue('📊 验证结果报告'));
    console.log(chalk.blue('=' * 60));

    // 总体统计
    console.log(chalk.blue('\n📈 总体统计:'));
    console.log(chalk.gray(`验证时间: ${this.results.timestamp}`));
    console.log(chalk.gray(`总组件数: ${this.results.summary.totalComponents}`));
    console.log(chalk.green(`通过组件: ${this.results.summary.passedComponents}`));
    console.log(chalk.red(`失败组件: ${this.results.summary.failedComponents}`));
    console.log(chalk.gray(`总按钮数: ${this.results.summary.totalButtons}`));
    console.log(chalk.green(`正常按钮: ${this.results.summary.passedButtons}`));
    console.log(chalk.red(`异常按钮: ${this.results.summary.failedButtons}`));

    const componentPassRate = this.results.summary.totalComponents > 0 ? 
      ((this.results.summary.passedComponents / this.results.summary.totalComponents) * 100).toFixed(1) : 0;
    const buttonPassRate = this.results.summary.totalButtons > 0 ? 
      ((this.results.summary.passedButtons / this.results.summary.totalButtons) * 100).toFixed(1) : 0;

    console.log(chalk.blue(`组件通过率: ${componentPassRate}%`));
    console.log(chalk.blue(`按钮正常率: ${buttonPassRate}%`));

    // 模块详情
    console.log(chalk.blue('\n📋 模块详情:'));
    for (const [moduleKey, moduleResult] of Object.entries(this.results.modules)) {
      const modulePassRate = ((moduleResult.summary.passed / moduleResult.summary.total) * 100).toFixed(1);
      console.log(chalk.blue(`\n${moduleResult.icon} ${moduleResult.name}:`));
      console.log(chalk.gray(`  总计: ${moduleResult.summary.total} 个组件`));
      console.log(chalk.green(`  通过: ${moduleResult.summary.passed} 个`));
      console.log(chalk.yellow(`  警告: ${moduleResult.summary.warnings} 个`));
      console.log(chalk.red(`  失败: ${moduleResult.summary.failed} 个`));
      console.log(chalk.blue(`  通过率: ${modulePassRate}%`));

      // 显示失败的组件
      const failedComponents = moduleResult.components.filter(c => c.status === 'failed');
      if (failedComponents.length > 0) {
        console.log(chalk.red(`  失败组件:`));
        failedComponents.forEach(component => {
          console.log(chalk.red(`    - ${component.displayName}`));
          component.issues.forEach(issue => {
            console.log(chalk.yellow(`      • ${issue}`));
          });
        });
      }

      // 显示警告的组件
      const warningComponents = moduleResult.components.filter(c => c.status === 'warning');
      if (warningComponents.length > 0) {
        console.log(chalk.yellow(`  警告组件:`));
        warningComponents.forEach(component => {
          console.log(chalk.yellow(`    - ${component.displayName} (${component.score}/${component.maxScore})`));
          component.issues.forEach(issue => {
            console.log(chalk.yellow(`      • ${issue}`));
          });
        });
      }
    }

    // 建议和总结
    console.log(chalk.blue('\n💡 建议和总结:'));
    
    if (this.results.summary.failedComponents === 0) {
      console.log(chalk.green('🎉 所有组件都通过了验证！'));
      console.log(chalk.green('系统按钮功能正常工作。'));
    } else {
      console.log(chalk.red(`❌ ${this.results.summary.failedComponents} 个组件需要修复`));
      console.log(chalk.yellow('建议优先修复以下问题：'));
      console.log(chalk.yellow('1. 确保所有新增按钮都有数据刷新机制'));
      console.log(chalk.yellow('2. 使用useDataService Hook管理数据状态'));
      console.log(chalk.yellow('3. 添加完整的错误处理和加载状态'));
      console.log(chalk.yellow('4. 避免使用硬编码数据'));
    }

    console.log(chalk.blue('\n' + '=' * 60));
  }

  /**
   * 保存验证报告
   */
  saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(__dirname, '..', 'logs', `button-verification-report-${timestamp}.json`);
    
    const logsDir = path.dirname(reportFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(chalk.green(`\n📄 详细报告已保存: ${reportFile}`));

    // 同时保存最新报告
    const latestReportFile = path.join(logsDir, 'latest-button-verification-report.json');
    fs.writeFileSync(latestReportFile, JSON.stringify(this.results, null, 2));
  }

  /**
   * 显示帮助信息
   */
  static showHelp() {
    console.log(chalk.blue('系统按钮功能验证工具'));
    console.log(chalk.gray('验证MES系统所有模块的新增、删除按钮功能'));
    
    console.log(chalk.blue('\n使用方法:'));
    console.log('  node scripts/comprehensive-button-verification.js [选项]');
    
    console.log(chalk.blue('\n选项:'));
    console.log('  --module=MODULE   验证指定模块 (all|production|equipment|process|quality|inventory|personnel|scheduling)');
    console.log('  --action=ACTION   验证指定操作 (all|add|delete)');
    console.log('  --verbose         显示详细输出');
    console.log('  --help            显示帮助信息');
    
    console.log(chalk.blue('\n可用模块:'));
    Object.entries(SYSTEM_MODULES).forEach(([key, module]) => {
      console.log(`  ${key}: ${module.icon} ${module.name} (${module.components.length} 个组件)`);
    });
    
    console.log(chalk.blue('\n示例:'));
    console.log('  node scripts/comprehensive-button-verification.js --verbose');
    console.log('  node scripts/comprehensive-button-verification.js --module=production');
    console.log('  node scripts/comprehensive-button-verification.js --module=process --verbose');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    ButtonVerificationTester.showHelp();
    return;
  }

  const tester = new ButtonVerificationTester();
  const options = tester.parseArgs();
  
  try {
    await tester.runVerification(options);
    
    // 根据验证结果设置退出码
    const exitCode = tester.results.summary.failedComponents > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error(chalk.red('验证过程中出错:'), error);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = ButtonVerificationTester;