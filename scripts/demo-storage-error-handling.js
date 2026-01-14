#!/usr/bin/env node

/**
 * 存储错误处理功能演示脚本
 * 
 * 演示内容：
 * 1. 正常存储操作
 * 2. 存储不可用时的降级处理
 * 3. 存储空间管理
 * 4. 错误恢复机制
 * 
 * Requirements: 6.1, 6.2, 3.1
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {};
global.document = {
  readyState: 'complete',
  addEventListener: () => {}
};
global.performance = {
  now: () => Date.now()
};

// 导入模块
const PersistenceManager = require('../client/src/utils/PersistenceManager.js').default;
const EmployeePersistence = require('../client/src/utils/EmployeePersistence.js').default;

// 演示函数
async function demonstrateStorageErrorHandling() {
  console.log('🎯 存储错误处理功能演示\n');

  // 演示1: 正常存储操作
  console.log('📋 演示1: 正常存储操作');
  
  // 设置正常的localStorage
  const normalStorage = new Map();
  global.window.localStorage = {
    setItem: (key, value) => normalStorage.set(key, value),
    getItem: (key) => normalStorage.get(key) || null,
    removeItem: (key) => normalStorage.delete(key),
    get length() { return normalStorage.size; },
    key: (index) => Array.from(normalStorage.keys())[index] || null
  };
  
  PersistenceManager.initialize();
  
  const employee = {
    name: '王师傅',
    department: '生产部',
    position: '操作员',
    phone: '138****0001',
    email: 'wang@company.com'
  };
  
  const addedEmployee = await EmployeePersistence.addEmployee(employee);
  console.log('✅ 正常模式下员工添加成功:', addedEmployee.name);
  
  const storageHealth = await EmployeePersistence.getStorageHealth();
  console.log('✅ 存储健康状态:', storageHealth.status);
  console.log('   存储类型:', storageHealth.storageType);
  console.log('');

  // 演示2: localStorage不可用时的降级处理
  console.log('📋 演示2: localStorage不可用时的降级处理');
  
  // 模拟localStorage不可用
  global.window.localStorage = {
    setItem: () => { throw new Error('localStorage is not available'); },
    getItem: () => { throw new Error('localStorage is not available'); },
    removeItem: () => { throw new Error('localStorage is not available'); },
    length: 0,
    key: () => null
  };
  
  global.window.sessionStorage = {
    setItem: () => { throw new Error('sessionStorage is not available'); },
    getItem: () => { throw new Error('sessionStorage is not available'); },
    removeItem: () => { throw new Error('sessionStorage is not available'); },
    length: 0,
    key: () => null
  };
  
  // 重新初始化以触发降级
  PersistenceManager._currentStorageType = null;
  const degradedStorageType = PersistenceManager.initialize();
  
  console.log('⚠️  检测到存储不可用，已降级到:', degradedStorageType);
  
  const employee2 = {
    name: '赵师傅',
    department: '质检部',
    position: '检验员',
    phone: '138****0002',
    email: 'zhao@company.com'
  };
  
  const addedEmployee2 = await EmployeePersistence.addEmployee(employee2);
  console.log('✅ 降级模式下员工添加成功:', addedEmployee2.name);
  
  const degradedHealth = await EmployeePersistence.getStorageHealth();
  console.log('⚠️  降级后存储健康状态:', degradedHealth.status);
  console.log('   警告信息:', degradedHealth.warnings[0]);
  console.log('   建议:', degradedHealth.recommendations[0]);
  console.log('');

  // 演示3: 存储配额超出处理
  console.log('📋 演示3: 存储配额超出处理');
  
  // 模拟配额超出
  global.window.localStorage = {
    setItem: (key, value) => {
      const error = new Error('QuotaExceededError: Storage quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    },
    getItem: () => null,
    removeItem: () => {},
    length: 0,
    key: () => null
  };
  
  // 重新初始化
  PersistenceManager._currentStorageType = null;
  PersistenceManager.initialize();
  
  try {
    const employee3 = {
      name: '孙师傅',
      department: '维修部',
      position: '维修工',
      phone: '138****0003',
      email: 'sun@company.com'
    };
    
    await EmployeePersistence.addEmployee(employee3);
    console.log('✅ 配额超出时成功处理并降级');
  } catch (error) {
    if (error.type === 'STORAGE_FULL') {
      console.log('⚠️  检测到存储配额超出:', error.message);
      console.log('   系统已自动尝试清理和降级处理');
    }
  }
  console.log('');

  // 演示4: 存储统计和监控
  console.log('📋 演示4: 存储统计和监控');
  
  // 恢复正常存储以演示统计功能
  const statsStorage = new Map();
  global.window.localStorage = {
    setItem: (key, value) => statsStorage.set(key, value),
    getItem: (key) => statsStorage.get(key) || null,
    removeItem: (key) => statsStorage.delete(key),
    get length() { return statsStorage.size; },
    key: (index) => Array.from(statsStorage.keys())[index] || null
  };
  
  PersistenceManager._currentStorageType = null;
  PersistenceManager.initialize();
  
  // 添加一些测试数据
  await EmployeePersistence.clearAllEmployees();
  
  const testEmployees = [
    { name: '员工A', department: '生产部', position: '操作员' },
    { name: '员工B', department: '质检部', position: '检验员' },
    { name: '员工C', department: '维修部', position: '维修工' }
  ];
  
  for (const emp of testEmployees) {
    await EmployeePersistence.addEmployee(emp);
  }
  
  const storageInfo = PersistenceManager.getStorageInfo();
  const employeeStats = await EmployeePersistence.getEmployeeStats();
  
  console.log('📊 存储统计信息:');
  console.log('   存储类型:', storageInfo.storageType);
  console.log('   数据项数量:', storageInfo.stats.itemCount);
  console.log('   总大小:', storageInfo.stats.totalSize, '字节');
  console.log('   使用率:', storageInfo.usage.percentage.toFixed(2) + '%');
  console.log('   是否接近限制:', storageInfo.usage.isNearLimit ? '是' : '否');
  
  console.log('👥 员工统计信息:');
  console.log('   总员工数:', employeeStats.total);
  console.log('   部门分布:', employeeStats.departments);
  console.log('   存储可用性:', employeeStats.storage.available ? '可用' : '不可用');
  console.log('');

  // 演示5: 错误恢复和数据完整性
  console.log('📋 演示5: 错误恢复和数据完整性');
  
  // 模拟数据损坏情况
  const corruptedStorage = new Map();
  corruptedStorage.set('mes_system_employees', '{"invalid": "json"'); // 损坏的JSON
  
  global.window.localStorage = {
    setItem: (key, value) => corruptedStorage.set(key, value),
    getItem: (key) => corruptedStorage.get(key) || null,
    removeItem: (key) => corruptedStorage.delete(key),
    get length() { return corruptedStorage.size; },
    key: (index) => Array.from(corruptedStorage.keys())[index] || null
  };
  
  // 清除缓存以强制从存储加载
  EmployeePersistence._cache = null;
  
  try {
    const employees = await EmployeePersistence.loadEmployees();
    console.log('✅ 数据损坏时成功恢复，员工数量:', employees.length);
    console.log('   系统自动使用了降级策略（返回空数组）');
  } catch (error) {
    console.log('⚠️  数据恢复失败:', error.message);
  }
  
  const finalHealth = await EmployeePersistence.getStorageHealth();
  console.log('📋 最终存储健康检查:');
  console.log('   状态:', finalHealth.status);
  console.log('   数据完整性:', finalHealth.dataIntegrity);
  console.log('');

  console.log('🎉 存储错误处理功能演示完成！');
  console.log('');
  console.log('📝 功能总结:');
  console.log('✅ 自动检测存储可用性并降级到内存模式');
  console.log('✅ 处理存储配额超出和空间不足问题');
  console.log('✅ 提供存储操作失败的重试机制');
  console.log('✅ 实现多层数据恢复策略');
  console.log('✅ 提供存储健康状态监控');
  console.log('✅ 支持存储统计和使用情况分析');
  console.log('✅ 确保在各种错误情况下系统仍能正常工作');
}

// 运行演示
demonstrateStorageErrorHandling().catch(error => {
  console.error('演示过程中发生错误:', error);
  process.exit(1);
});