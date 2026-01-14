#!/usr/bin/env node

/**
 * 性能优化验证脚本
 * 验证任务17中实现的性能优化是否正常工作
 */

const fs = require('fs');
const path = require('path');

class PerformanceOptimizationValidator {
  constructor() {
    this.validationResults = {
      cacheImplementation: false,
      virtualScrolling: false,
      dataPreloading: false,
      overallScore: 0,
      issues: [],
      recommendations: []
    };
  }

  // 验证数据缓存机制实现
  validateCacheImplementation() {
    console.log('🔍 验证数据缓存机制实现...');
    
    const dataServicePath = 'client/src/services/DataService.js';
    const hookPath = 'client/src/hooks/useDataService.js';
    
    let cacheScore = 0;
    
    // 检查 DataService 是否存在
    if (fs.existsSync(dataServicePath)) {
      const dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');
      
      // 检查缓存相关代码
      const cacheFeatures = [
        { pattern: /cache|Cache/, description: '缓存变量或方法' },
        { pattern: /localStorage|sessionStorage/, description: '本地存储缓存' },
        { pattern: /Map|WeakMap/, description: '内存缓存' },
        { pattern: /expire|ttl|timeout/, description: '缓存过期机制' },
        { pattern: /clear.*cache|refresh.*cache/i, description: '缓存清理机制' }
      ];
      
      console.log('   检查 DataService.js:');
      cacheFeatures.forEach(feature => {
        if (feature.pattern.test(dataServiceContent)) {
          console.log(`   ✅ 发现 ${feature.description}`);
          cacheScore += 20;
        } else {
          console.log(`   ❌ 缺少 ${feature.description}`);
          this.validationResults.issues.push(`DataService 缺少 ${feature.description}`);
        }
      });
    } else {
      console.log('   ❌ DataService.js 文件不存在');
      this.validationResults.issues.push('DataService.js 文件不存在');
    }
    
    // 检查 useDataService Hook
    if (fs.existsSync(hookPath)) {
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      
      console.log('   检查 useDataService.js:');
      const hookFeatures = [
        { pattern: /useState.*cache/i, description: '缓存状态管理' },
        { pattern: /useEffect.*cache/i, description: '缓存效果处理' },
        { pattern: /useMemo|useCallback/, description: '性能优化 Hooks' }
      ];
      
      hookFeatures.forEach(feature => {
        if (feature.pattern.test(hookContent)) {
          console.log(`   ✅ 发现 ${feature.description}`);
          cacheScore += 10;
        } else {
          console.log(`   ⚠️ 建议添加 ${feature.description}`);
          this.validationResults.recommendations.push(`建议在 useDataService 中添加 ${feature.description}`);
        }
      });
    } else {
      console.log('   ❌ useDataService.js 文件不存在');
      this.validationResults.issues.push('useDataService.js 文件不存在');
    }
    
    this.validationResults.cacheImplementation = cacheScore >= 60;
    console.log(`   缓存实现评分: ${cacheScore}/100 ${this.validationResults.cacheImplementation ? '✅' : '❌'}`);
    
    return this.validationResults.cacheImplementation;
  }

  // 验证虚拟滚动实现
  validateVirtualScrolling() {
    console.log('\n🔍 验证虚拟滚动实现...');
    
    const componentPaths = [
      'client/src/components/production',
      'client/src/components/equipment',
      'client/src/components/quality',
      'client/src/components/inventory',
      'client/src/components/reports'
    ];
    
    let virtualScrollScore = 0;
    let totalComponents = 0;
    
    componentPaths.forEach(componentPath => {
      if (fs.existsSync(componentPath)) {
        const files = fs.readdirSync(componentPath).filter(file => file.endsWith('.js'));
        
        files.forEach(file => {
          const filePath = path.join(componentPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          totalComponents++;
          
          // 检查虚拟滚动相关代码
          const virtualScrollFeatures = [
            /react-window|react-virtualized/,
            /FixedSizeList|VariableSizeList/,
            /virtual.*scroll/i,
            /window.*height|item.*height/i
          ];
          
          const hasVirtualScroll = virtualScrollFeatures.some(pattern => pattern.test(content));
          
          if (hasVirtualScroll) {
            console.log(`   ✅ ${file} 实现了虚拟滚动`);
            virtualScrollScore += 25;
          } else if (content.includes('Table') || content.includes('List')) {
            console.log(`   ⚠️ ${file} 包含列表但未实现虚拟滚动`);
            this.validationResults.recommendations.push(`建议在 ${file} 中实现虚拟滚动`);
          }
        });
      }
    });
    
    this.validationResults.virtualScrolling = virtualScrollScore >= 50;
    console.log(`   虚拟滚动实现评分: ${virtualScrollScore}/100 ${this.validationResults.virtualScrolling ? '✅' : '❌'}`);
    
    return this.validationResults.virtualScrolling;
  }

  // 验证数据预加载实现
  validateDataPreloading() {
    console.log('\n🔍 验证数据预加载实现...');
    
    const appPath = 'client/src/App.js';
    const indexPath = 'client/src/index.js';
    
    let preloadScore = 0;
    
    // 检查 App.js
    if (fs.existsSync(appPath)) {
      const appContent = fs.readFileSync(appPath, 'utf8');
      
      console.log('   检查 App.js:');
      const preloadFeatures = [
        { pattern: /useEffect.*\[\]/, description: '应用启动时的数据加载' },
        { pattern: /preload|prefetch/i, description: '预加载机制' },
        { pattern: /Promise\.all|Promise\.allSettled/, description: '并行数据加载' },
        { pattern: /background.*load|idle.*load/i, description: '后台加载' }
      ];
      
      preloadFeatures.forEach(feature => {
        if (feature.pattern.test(appContent)) {
          console.log(`   ✅ 发现 ${feature.description}`);
          preloadScore += 25;
        } else {
          console.log(`   ⚠️ 建议添加 ${feature.description}`);
          this.validationResults.recommendations.push(`建议在 App.js 中添加 ${feature.description}`);
        }
      });
    } else {
      console.log('   ❌ App.js 文件不存在');
      this.validationResults.issues.push('App.js 文件不存在');
    }
    
    // 检查是否有专门的预加载服务
    const preloadServicePath = 'client/src/services/PreloadService.js';
    if (fs.existsSync(preloadServicePath)) {
      console.log('   ✅ 发现专门的预加载服务');
      preloadScore += 25;
    } else {
      console.log('   ⚠️ 建议创建专门的预加载服务');
      this.validationResults.recommendations.push('建议创建 PreloadService.js 来管理数据预加载');
    }
    
    this.validationResults.dataPreloading = preloadScore >= 50;
    console.log(`   数据预加载实现评分: ${preloadScore}/100 ${this.validationResults.dataPreloading ? '✅' : '❌'}`);
    
    return this.validationResults.dataPreloading;
  }

  // 验证性能监控实现
  validatePerformanceMonitoring() {
    console.log('\n🔍 验证性能监控实现...');
    
    const monitoringPaths = [
      'client/src/utils/performance.js',
      'client/src/hooks/usePerformance.js',
      'client/src/services/MonitoringService.js'
    ];
    
    let monitoringScore = 0;
    
    monitoringPaths.forEach(monitoringPath => {
      if (fs.existsSync(monitoringPath)) {
        const content = fs.readFileSync(monitoringPath, 'utf8');
        
        console.log(`   ✅ 发现性能监控文件: ${path.basename(monitoringPath)}`);
        monitoringScore += 30;
        
        // 检查监控功能
        const monitoringFeatures = [
          { pattern: /performance\.now|Date\.now/, description: '时间测量' },
          { pattern: /memory|heap/, description: '内存监控' },
          { pattern: /network|fetch.*time/, description: '网络性能监控' },
          { pattern: /render.*time|component.*time/, description: '渲染性能监控' }
        ];
        
        monitoringFeatures.forEach(feature => {
          if (feature.pattern.test(content)) {
            console.log(`     ✅ 包含 ${feature.description}`);
            monitoringScore += 5;
          }
        });
      }
    });
    
    if (monitoringScore === 0) {
      console.log('   ⚠️ 未发现性能监控实现');
      this.validationResults.recommendations.push('建议添加性能监控功能');
    }
    
    console.log(`   性能监控实现评分: ${monitoringScore}/100`);
    
    return monitoringScore >= 50;
  }

  // 检查package.json中的性能相关依赖
  validatePerformanceDependencies() {
    console.log('\n🔍 验证性能相关依赖...');
    
    const packagePath = 'client/package.json';
    
    if (!fs.existsSync(packagePath)) {
      console.log('   ❌ client/package.json 不存在');
      return false;
    }
    
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
    
    const performanceDeps = [
      { name: 'react-window', description: '虚拟滚动' },
      { name: 'react-virtualized', description: '虚拟滚动' },
      { name: 'lodash', description: '工具函数优化' },
      { name: 'memoize-one', description: '记忆化优化' },
      { name: 'web-vitals', description: '性能指标监控' }
    ];
    
    let depScore = 0;
    
    performanceDeps.forEach(dep => {
      if (dependencies[dep.name]) {
        console.log(`   ✅ 已安装 ${dep.name} (${dep.description})`);
        depScore += 20;
      } else {
        console.log(`   ⚠️ 建议安装 ${dep.name} (${dep.description})`);
        this.validationResults.recommendations.push(`建议安装 ${dep.name} 来提升 ${dep.description}`);
      }
    });
    
    console.log(`   性能依赖评分: ${depScore}/100`);
    
    return depScore >= 40;
  }

  // 生成验证报告
  generateValidationReport() {
    console.log('\n📋 性能优化验证报告');
    console.log('='.repeat(50));
    
    // 计算总体评分
    const scores = [
      this.validationResults.cacheImplementation ? 25 : 0,
      this.validationResults.virtualScrolling ? 25 : 0,
      this.validationResults.dataPreloading ? 25 : 0,
      this.validatePerformanceMonitoring() ? 25 : 0
    ];
    
    this.validationResults.overallScore = scores.reduce((sum, score) => sum + score, 0);
    
    console.log(`总体评分: ${this.validationResults.overallScore}/100`);
    
    // 各项检查结果
    console.log('\n📊 各项检查结果:');
    console.log(`   数据缓存机制: ${this.validationResults.cacheImplementation ? '✅ 已实现' : '❌ 未实现'}`);
    console.log(`   虚拟滚动: ${this.validationResults.virtualScrolling ? '✅ 已实现' : '❌ 未实现'}`);
    console.log(`   数据预加载: ${this.validationResults.dataPreloading ? '✅ 已实现' : '❌ 未实现'}`);
    console.log(`   性能监控: ${this.validatePerformanceMonitoring() ? '✅ 已实现' : '❌ 未实现'}`);
    
    // 问题列表
    if (this.validationResults.issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      this.validationResults.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // 优化建议
    if (this.validationResults.recommendations.length > 0) {
      console.log('\n💡 优化建议:');
      this.validationResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    // 性能等级评估
    console.log('\n🏆 性能等级评估:');
    if (this.validationResults.overallScore >= 80) {
      console.log('   🥇 优秀 - 性能优化实现完善');
    } else if (this.validationResults.overallScore >= 60) {
      console.log('   🥈 良好 - 大部分性能优化已实现');
    } else if (this.validationResults.overallScore >= 40) {
      console.log('   🥉 一般 - 部分性能优化已实现');
    } else {
      console.log('   ❌ 需要改进 - 性能优化实现不足');
    }
    
    // 下一步行动建议
    console.log('\n🚀 下一步行动建议:');
    if (this.validationResults.overallScore >= 80) {
      console.log('   1. 进行实际性能测试验证优化效果');
      console.log('   2. 监控生产环境性能指标');
      console.log('   3. 持续优化和改进');
    } else {
      console.log('   1. 优先解决发现的问题');
      console.log('   2. 实现缺失的性能优化功能');
      console.log('   3. 重新运行验证测试');
    }
    
    // 保存报告
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore: this.validationResults.overallScore,
      results: this.validationResults,
      summary: {
        cacheImplementation: this.validationResults.cacheImplementation,
        virtualScrolling: this.validationResults.virtualScrolling,
        dataPreloading: this.validationResults.dataPreloading,
        performanceMonitoring: this.validatePerformanceMonitoring()
      }
    };
    
    // 确保logs目录存在
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }
    
    fs.writeFileSync(
      'logs/performance-optimization-validation.json',
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n📄 验证报告已保存到: logs/performance-optimization-validation.json');
    
    return reportData;
  }

  // 运行所有验证
  async runValidation() {
    console.log('🚀 开始性能优化验证...\n');
    
    this.validateCacheImplementation();
    this.validateVirtualScrolling();
    this.validateDataPreloading();
    this.validatePerformanceDependencies();
    
    const report = this.generateValidationReport();
    
    return {
      success: this.validationResults.overallScore >= 60,
      score: this.validationResults.overallScore,
      report
    };
  }
}

// 主函数
async function main() {
  const validator = new PerformanceOptimizationValidator();
  
  try {
    const result = await validator.runValidation();
    
    if (result.success) {
      console.log('\n🎉 性能优化验证通过！');
      console.log(`总体评分: ${result.score}/100`);
    } else {
      console.log('\n⚠️ 性能优化需要进一步完善。');
      console.log(`总体评分: ${result.score}/100`);
      console.log('请按照报告中的建议进行改进。');
    }
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 性能优化验证失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { PerformanceOptimizationValidator };