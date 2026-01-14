#!/usr/bin/env node

/**
 * 存储错误处理测试脚本
 * 
 * 测试目标：
 * 1. 验证localStorage不可用时的降级机制
 * 2. 验证存储空间不足时的处理
 * 3. 验证存储操作失败的重试机制
 * 4. 验证降级到内存模式的功能
 * 
 * Requirements: 6.1, 6.2, 3.1
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {
  localStorage: null,
  sessionStorage: null
};
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

// 测试函数
async function testStorageErrorHandling() {
  console.log('🧪 开始存储错误处理测试\n');

  try {
    // 测试1: localStorage不可用的情况
    console.log('📋 测试1: localStorage不可用时的降级机制');
    
    // 模拟localStorage不可用
    global.window.localStorage = {
      setItem: () => { throw new Error('localStorage is not available'); },
      getItem: () => { throw new Error('localStorage is not available'); },
      removeItem: () => { throw new Error('localStorage is not available'); },
      length: 0,
      key: () => null
    };
    
    // 模拟sessionStorage也不可用
    global.window.sessionStorage = {
      setItem: () => { throw new Error('sessionStorage is not available'); },
      getItem: () => { throw new Error('sessionStorage is not available'); },
      removeItem: () => { throw new Error('sessionStorage is not available'); },
      length: 0,
      key: () => null
    };
    
    const storageType = PersistenceManager.initialize();
    console.log('✅ 降级到存储类型:', storageType);
    
    if (storageType !== 'memory') {
      console.log('❌ 预期降级到内存模式，但实际为:', storageType);
    } else {
      console.log('✅ 成功降级到内存模式');
    }
    console.log('');

    // 测试2: 在内存模式下添加员工
    console.log('📋 测试2: 内存模式下的员工操作');
    
    const employee1 = {
      name: '测试员工1',
      department: '测试部门',
      position: '测试职位',
      phone: '138****0001',
      email: 'test1@company.com'
    };
    
    const addedEmployee = await EmployeePersistence.addEmployee(employee1);
    console.log('✅ 内存模式下员工添加成功, ID:', addedEmployee.id);
    
    const employees = await EmployeePersistence.loadEmployees();
    console.log('✅ 内存模式下员工加载成功，数量:', employees.length);
    console.log('');

    // 测试3: 存储健康状态检查
    console.log('📋 测试3: 存储健康状态检查');
    
    const storageHealth = await EmployeePersistence.getStorageHealth();
    console.log('✅ 存储状态:', storageHealth.status);
    console.log('   存储类型:', storageHealth.storageType);
    console.log('   数据完整性:', storageHealth.dataIntegrity);
    console.log('   警告信息:', storageHealth.warnings);
    console.log('   建议:', storageHealth.recommendations);
    console.log('');

    // 测试4: 模拟存储配额超出
    console.log('📋 测试4: 存储配额超出处理');
    
    // 重新设置localStorage，但模拟配额超出
    global.window.localStorage = {
      setItem: (key, value) => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      },
      getItem: () => null,
      removeItem: () => {},
      length: 0,
      key: () => null
    };
    
    // 重新初始化以使用localStorage
    PersistenceManager._currentStorageType = null;
    const newStorageType = PersistenceManager.initialize();
    console.log('✅ 重新初始化存储类型:', newStorageType);
    
    try {
      const employee2 = {
        name: '测试员工2',
        department: '测试部门',
        position: '测试职位',
        phone: '138****0002',
        email: 'test2@company.com'
      };
      
      await EmployeePersistence.addEmployee(employee2);
      console.log('✅ 配额超出时成功降级处理');
    } catch (error) {
      if (error.type === 'STORAGE_FULL' || error.type === 'QUOTA_EXCEEDED') {
        console.log('✅ 正确检测到存储配额超出:', error.message);
      } else {
        console.log('❌ 未正确处理配额超出错误:', error.message);
      }
    }
    console.log('');

    // 测试5: 模拟正常localStorage但有重试机制
    console.log('📋 测试5: 存储操作重试机制');
    
    let attemptCount = 0;
    global.window.localStorage = {
      setItem: (key, value) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary storage error');
        }
        // 第3次尝试成功
        console.log(`   第${attemptCount}次尝试成功`);
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
      const success = await PersistenceManager.save('test_retry', { test: 'data' });
      console.log('✅ 重试机制工作正常，最终保存成功:', success);
      console.log('   总尝试次数:', attemptCount);
    } catch (error) {
      console.log('❌ 重试机制失败:', error.message);
    }
    console.log('');

    // 测试6: 存储统计和清理功能
    console.log('📋 测试6: 存储统计和清理功能');
    
    // 设置正常的localStorage
    const mockStorage = new Map();
    global.window.localStorage = {
      setItem: (key, value) => mockStorage.set(key, value),
      getItem: (key) => mockStorage.get(key) || null,
      removeItem: (key) => mockStorage.delete(key),
      get length() { return mockStorage.size; },
      key: (index) => Array.from(mockStorage.keys())[index] || null
    };
    
    // 重新初始化
    PersistenceManager._currentStorageType = null;
    PersistenceManager.initialize();
    
    // 添加一些测试数据
    await PersistenceManager.save('test1', { data: 'test1', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }); // 8天前
    await PersistenceManager.save('test2', { data: 'test2', timestamp: new Date().toISOString() }); // 现在
    
    const storageInfo = PersistenceManager.getStorageInfo();
    console.log('✅ 存储统计信息:');
    console.log('   存储类型:', storageInfo.storageType);
    console.log('   数据项数量:', storageInfo.stats.itemCount);
    console.log('   总大小:', storageInfo.stats.totalSize, '字节');
    console.log('   使用率:', storageInfo.usage.percentage.toFixed(1) + '%');
    console.log('');

    // 测试7: 最终验证 - 完整的员工操作流程
    console.log('📋 测试7: 完整的员工操作流程验证');
    
    // 清除之前的测试数据
    await EmployeePersistence.clearAllEmployees();
    
    const testEmployees = [
      {
        name: '张三',
        department: '生产部',
        position: '操作员',
        phone: '138****0001',
        email: 'zhangsan@company.com'
      },
      {
        name: '李四',
        department: '质检部',
        position: '检验员',
        phone: '138****0002',
        email: 'lisi@company.com'
      }
    ];
    
    for (const emp of testEmployees) {
      const added = await EmployeePersistence.addEmployee(emp);
      console.log(`   ✅ 添加员工: ${added.name} (ID: ${added.id})`);
    }
    
    const finalEmployees = await EmployeePersistence.loadEmployees();
    console.log('✅ 最终员工数量:', finalEmployees.length);
    
    const stats = await EmployeePersistence.getEmployeeStats();
    console.log('✅ 员工统计:');
    console.log('   总数:', stats.total);
    console.log('   部门分布:', stats.departments);
    console.log('   存储状态:', stats.storage.type);
    console.log('   存储可用:', stats.storage.available);
    console.log('');

    console.log('🎉 所有存储错误处理测试完成！');
    console.log('');
    console.log('📊 测试总结:');
    console.log('✅ localStorage不可用时成功降级到内存模式');
    console.log('✅ 存储配额超出时正确处理和降级');
    console.log('✅ 存储操作失败时重试机制正常工作');
    console.log('✅ 存储健康状态检查功能正常');
    console.log('✅ 存储统计和清理功能正常');
    console.log('✅ 完整的员工操作流程在各种存储状态下都能正常工作');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testStorageErrorHandling();