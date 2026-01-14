/**
 * 数据压缩和优化功能测试
 * 验证任务10的实现
 */

import PersistenceManager from './PersistenceManager.js';
import EmployeePersistence from './EmployeePersistence.js';

// 测试数据压缩功能
async function testDataCompression() {
  console.log('=== 测试数据压缩功能 ===');
  
  try {
    // 初始化
    PersistenceManager.initialize();
    
    // 创建大量重复数据用于测试压缩
    const testData = {
      employees: [],
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        description: '这是一个用于测试数据压缩功能的大型数据集，包含大量重复内容以验证压缩算法的有效性。'
      }
    };
    
    // 生成重复数据
    for (let i = 0; i < 100; i++) {
      testData.employees.push({
        id: i,
        name: `员工${i}`,
        department: i % 5 === 0 ? '技术部' : i % 3 === 0 ? '销售部' : '生产部',
        position: i % 2 === 0 ? '工程师' : '专员',
        description: '这是一个标准的员工描述模板，用于测试数据压缩效果。包含重复的文本内容。',
        skills: ['技能1', '技能2', '技能3', '通用技能', '基础技能'],
        projects: Array(5).fill('标准项目模板描述'),
        notes: '备注信息：' + '重复内容 '.repeat(10)
      });
    }
    
    const originalSize = JSON.stringify(testData).length;
    console.log('原始数据大小:', originalSize, '字节');
    
    // 测试保存（触发压缩）
    const saveStart = performance.now();
    const saveResult = await PersistenceManager.save('compression_test', testData);
    const saveDuration = performance.now() - saveStart;
    
    console.log('保存结果:', saveResult);
    console.log('保存耗时:', saveDuration.toFixed(2), 'ms');
    
    // 获取存储信息
    const storageInfo = PersistenceManager.getStorageInfo();
    console.log('存储信息:', {
      类型: storageInfo.storageType,
      压缩启用: storageInfo.config.compressionEnabled,
      使用率: storageInfo.usage.percentage.toFixed(1) + '%'
    });
    
    // 测试加载（触发解压缩）
    const loadStart = performance.now();
    const loadedData = await PersistenceManager.load('compression_test');
    const loadDuration = performance.now() - loadStart;
    
    console.log('加载耗时:', loadDuration.toFixed(2), 'ms');
    
    // 验证数据完整性
    const loadedSize = JSON.stringify(loadedData).length;
    const dataIntact = originalSize === loadedSize;
    
    console.log('数据完整性:', dataIntact ? '✓ 通过' : '✗ 失败');
    console.log('加载数据大小:', loadedSize, '字节');
    
    return { success: saveResult && dataIntact, originalSize, loadedSize };
    
  } catch (error) {
    console.error('数据压缩测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试批量操作性能
async function testBatchOperations() {
  console.log('\n=== 测试批量操作性能 ===');
  
  try {
    // 生成测试员工数据
    const employees = [];
    for (let i = 0; i < 200; i++) {
      employees.push({
        employeeId: `EMP${String(i + 1000).padStart(4, '0')}`,
        name: `测试员工${i}`,
        department: ['技术部', '销售部', '生产部', '人事部'][i % 4],
        position: ['工程师', '经理', '专员', '助理'][i % 4],
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `test${i}@company.com`,
        status: '在职'
      });
    }
    
    console.log('准备批量添加', employees.length, '个员工');
    
    // 测试批量添加
    const batchStart = performance.now();
    const batchResult = await EmployeePersistence.batchAddEmployees(employees);
    const batchDuration = performance.now() - batchStart;
    
    console.log('批量添加结果:', {
      成功: batchResult.results.success,
      失败: batchResult.results.failed,
      总耗时: batchDuration.toFixed(2) + 'ms',
      平均每个: (batchDuration / employees.length).toFixed(2) + 'ms'
    });
    
    // 测试搜索性能
    const searchStart = performance.now();
    const searchResults = await EmployeePersistence.searchEmployees({
      keyword: '测试',
      department: '技术部',
      limit: 50
    });
    const searchDuration = performance.now() - searchStart;
    
    console.log('搜索性能:', {
      找到: searchResults.length,
      耗时: searchDuration.toFixed(2) + 'ms'
    });
    
    return { 
      success: batchResult.success, 
      batchDuration, 
      searchDuration,
      employeesAdded: batchResult.results.success
    };
    
  } catch (error) {
    console.error('批量操作测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试数据维护和清理
async function testDataMaintenance() {
  console.log('\n=== 测试数据维护和清理 ===');
  
  try {
    // 获取维护前的存储信息
    const beforeMaintenance = PersistenceManager.getStorageInfo();
    console.log('维护前存储使用:', beforeMaintenance.usage.percentage.toFixed(1) + '%');
    
    // 执行数据维护
    const maintenanceStart = performance.now();
    const maintenanceResult = await PersistenceManager.performMaintenance({
      cleanExpired: true,
      cleanCorrupted: true,
      optimizeStorage: true,
      compactData: true
    });
    const maintenanceDuration = performance.now() - maintenanceStart;
    
    console.log('维护结果:', {
      成功: maintenanceResult.success,
      清理过期: maintenanceResult.results.expiredCleaned,
      清理损坏: maintenanceResult.results.corruptedCleaned,
      压缩项目: maintenanceResult.results.compactedItems,
      节省空间: maintenanceResult.results.spaceSaved + '字节',
      耗时: maintenanceDuration.toFixed(2) + 'ms'
    });
    
    // 获取维护后的存储信息
    const afterMaintenance = PersistenceManager.getStorageInfo();
    console.log('维护后存储使用:', afterMaintenance.usage.percentage.toFixed(1) + '%');
    
    // 测试员工数据优化
    const optimizeStart = performance.now();
    const optimizeResult = await EmployeePersistence.optimizeData();
    const optimizeDuration = performance.now() - optimizeStart;
    
    console.log('员工数据优化:', {
      成功: optimizeResult.success,
      员工数量: optimizeResult.employeeCount,
      耗时: optimizeDuration.toFixed(2) + 'ms'
    });
    
    return { 
      success: maintenanceResult.success && optimizeResult.success,
      maintenanceDuration,
      optimizeDuration,
      spaceSaved: maintenanceResult.results.spaceSaved
    };
    
  } catch (error) {
    console.error('数据维护测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始数据压缩和优化功能测试...\n');
  
  const results = {
    compression: null,
    batchOps: null,
    maintenance: null
  };
  
  try {
    // 初始化
    EmployeePersistence.initialize();
    
    // 运行测试
    results.compression = await testDataCompression();
    results.batchOps = await testBatchOperations();
    results.maintenance = await testDataMaintenance();
    
    // 汇总结果
    console.log('\n=== 测试结果汇总 ===');
    console.log('数据压缩:', results.compression.success ? '✓ 通过' : '✗ 失败');
    console.log('批量操作:', results.batchOps.success ? '✓ 通过' : '✗ 失败');
    console.log('数据维护:', results.maintenance.success ? '✓ 通过' : '✗ 失败');
    
    const allPassed = results.compression.success && 
                     results.batchOps.success && 
                     results.maintenance.success;
    
    console.log('\n总体结果:', allPassed ? '✓ 所有测试通过' : '✗ 部分测试失败');
    
    return allPassed;
    
  } catch (error) {
    console.error('测试执行失败:', error);
    return false;
  } finally {
    // 清理
    EmployeePersistence.cleanup();
  }
}

// 导出测试函数
export { 
  testDataCompression, 
  testBatchOperations, 
  testDataMaintenance, 
  runAllTests 
};

// 如果在浏览器中直接运行
if (typeof window !== 'undefined') {
  window.testOptimization = {
    testDataCompression,
    testBatchOperations,
    testDataMaintenance,
    runAllTests
  };
  
  console.log('数据优化测试函数已加载到 window.testOptimization');
  console.log('运行 window.testOptimization.runAllTests() 开始测试');
}