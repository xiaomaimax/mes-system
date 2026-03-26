/**
 * 数据压缩和优化功能演示组件
 * 展示任务10的实现效果
 */

import React, { useState, useEffect } from 'react';
import PersistenceManager from '../utils/PersistenceManager.js';
import EmployeePersistence from '../utils/EmployeePersistence.js';

const DataOptimizationDemo = () => {
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  useEffect(() => {
    // 初始化
    try {
      PersistenceManager.initialize();
      EmployeePersistence.initialize();
    } catch (error) {
      console.warn('初始化警告:', error.message);
    }
    
    return () => {
      try {
        EmployeePersistence.cleanup();
      } catch (error) {
        console.warn('清理警告:', error.message);
      }
    };
  }, []);

  // 生成测试数据
  const generateTestData = (size) => {
    const data = { items: [], metadata: { size, generated: new Date().toISOString() } };
    
    for (let i = 0; i < size; i++) {
      data.items.push({
        id: i,
        name: `测试项目_${i}`,
        description: `这是第${i}个测试项目的详细描述，包含重复内容用于测试压缩效果。`.repeat(3),
        category: `分类_${i % 5}`,
        tags: ['标签1', '标签2', `标签${i % 3}`],
        data: {
          value: Math.random() * 1000,
          text: `重复文本内容_${i % 10}`.repeat(5),
          nested: { prop: `嵌套属性_${i}`.repeat(2) }
        }
      });
    }
    
    return data;
  };

  // 生成员工测试数据
  const generateEmployees = (count) => {
    const departments = ['技术部', '销售部', '生产部', '人事部'];
    const positions = ['工程师', '经理', '专员', '助理'];
    
    return Array.from({ length: count }, (_, i) => ({
      employeeId: `EMP${String(i + 1000).padStart(4, '0')}`,
      name: `员工${i}`,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `emp${i}@company.com`,
      status: '在职'
    }));
  };

  // 测试数据压缩
  const testCompression = async () => {
    setCurrentTest('数据压缩测试');
    setProgress(10);
    
    const testData = generateTestData(200);
    const originalSize = JSON.stringify(testData).length;
    
    setProgress(30);
    
    const saveStart = performance.now();
    await PersistenceManager.save('demo_compression', testData);
    const saveDuration = performance.now() - saveStart;
    
    setProgress(60);
    
    const loadStart = performance.now();
    const loadedData = await PersistenceManager.load('demo_compression');
    const loadDuration = performance.now() - loadStart;
    
    setProgress(80);
    
    const storageInfo = PersistenceManager.getStorageInfo();
    const dataIntact = JSON.stringify(testData) === JSON.stringify(loadedData);
    
    setProgress(100);
    
    return {
      originalSize,
      saveDuration: saveDuration.toFixed(2),
      loadDuration: loadDuration.toFixed(2),
      dataIntact,
      compressionEnabled: storageInfo.config.compressionEnabled,
      storageType: storageInfo.storageType
    };
  };

  // 测试批量操作
  const testBatchOperations = async () => {
    setCurrentTest('批量操作测试');
    setProgress(10);
    
    const employees = generateEmployees(100);
    
    setProgress(30);
    
    const batchStart = performance.now();
    const batchResult = await EmployeePersistence.batchAddEmployees(employees, {
      chunkSize: 25,
      optimizeStorage: true,
      progressCallback: (prog) => setProgress(30 + (prog * 0.5))
    });
    const batchDuration = performance.now() - batchStart;
    
    setProgress(90);
    
    const searchStart = performance.now();
    const searchResults = await EmployeePersistence.searchEmployees({
      keyword: '员工',
      limit: 20
    });
    const searchDuration = performance.now() - searchStart;
    
    setProgress(100);
    
    return {
      employeesAdded: batchResult.results.success,
      batchDuration: batchDuration.toFixed(2),
      searchResults: searchResults.length,
      searchDuration: searchDuration.toFixed(2),
      avgPerEmployee: (batchDuration / employees.length).toFixed(2)
    };
  };

  // 测试数据维护
  const testMaintenance = async () => {
    setCurrentTest('数据维护测试');
    setProgress(10);
    
    const beforeInfo = PersistenceManager.getStorageInfo();
    
    setProgress(30);
    
    const maintenanceStart = performance.now();
    const maintenanceResult = await PersistenceManager.performMaintenance({
      cleanExpired: true,
      cleanCorrupted: true,
      optimizeStorage: true,
      compactData: true,
      progressCallback: (prog) => setProgress(30 + (prog * 0.4))
    });
    const maintenanceDuration = performance.now() - maintenanceStart;
    
    setProgress(80);
    
    const optimizeStart = performance.now();
    const optimizeResult = await EmployeePersistence.optimizeData({
      deepCleanup: true,
      compressData: true
    });
    const optimizeDuration = performance.now() - optimizeStart;
    
    setProgress(100);
    
    const afterInfo = PersistenceManager.getStorageInfo();
    
    return {
      beforeUsage: beforeInfo.usage.percentage.toFixed(1),
      afterUsage: afterInfo.usage.percentage.toFixed(1),
      maintenanceDuration: maintenanceDuration.toFixed(2),
      optimizeDuration: optimizeDuration.toFixed(2),
      spaceSaved: maintenanceResult.results.spaceSaved,
      employeeCount: optimizeResult.employeeCount,
      success: maintenanceResult.success && optimizeResult.success
    };
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunning(true);
    setResults({});
    
    try {
      const compression = await testCompression();
      setResults(prev => ({ ...prev, compression }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const batchOps = await testBatchOperations();
      setResults(prev => ({ ...prev, batchOps }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const maintenance = await testMaintenance();
      setResults(prev => ({ ...prev, maintenance }));
      
      setCurrentTest('测试完成');
      
    } catch (error) {
      console.error('测试失败:', error);
      setResults(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>数据压缩和优化功能演示</h2>
      <p>此演示展示了任务10的实现效果：数据压缩、批量操作、大数据处理和数据维护功能。</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '测试进行中...' : '开始测试'}
        </button>
      </div>

      {isRunning && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>当前测试：</strong> {currentTest}
          </div>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                width: `${progress}%`,
                height: '20px',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            {progress.toFixed(0)}%
          </div>
        </div>
      )}

      {results.compression && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>📦 数据压缩测试结果</h3>
          <ul>
            <li><strong>原始数据大小：</strong> {results.compression.originalSize.toLocaleString()} 字节</li>
            <li><strong>保存耗时：</strong> {results.compression.saveDuration} ms</li>
            <li><strong>加载耗时：</strong> {results.compression.loadDuration} ms</li>
            <li><strong>数据完整性：</strong> {results.compression.dataIntact ? '✅ 通过' : '❌ 失败'}</li>
            <li><strong>压缩启用：</strong> {results.compression.compressionEnabled ? '✅ 是' : '❌ 否'}</li>
            <li><strong>存储类型：</strong> {results.compression.storageType}</li>
          </ul>
        </div>
      )}

      {results.batchOps && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>⚡ 批量操作测试结果</h3>
          <ul>
            <li><strong>成功添加员工：</strong> {results.batchOps.employeesAdded} 个</li>
            <li><strong>批量添加耗时：</strong> {results.batchOps.batchDuration} ms</li>
            <li><strong>平均每个员工：</strong> {results.batchOps.avgPerEmployee} ms</li>
            <li><strong>搜索结果：</strong> {results.batchOps.searchResults} 个</li>
            <li><strong>搜索耗时：</strong> {results.batchOps.searchDuration} ms</li>
          </ul>
        </div>
      )}

      {results.maintenance && (
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>🔧 数据维护测试结果</h3>
          <ul>
            <li><strong>维护前使用率：</strong> {results.maintenance.beforeUsage}%</li>
            <li><strong>维护后使用率：</strong> {results.maintenance.afterUsage}%</li>
            <li><strong>维护耗时：</strong> {results.maintenance.maintenanceDuration} ms</li>
            <li><strong>优化耗时：</strong> {results.maintenance.optimizeDuration} ms</li>
            <li><strong>节省空间：</strong> {results.maintenance.spaceSaved.toLocaleString()} 字节</li>
            <li><strong>员工数量：</strong> {results.maintenance.employeeCount} 个</li>
            <li><strong>维护状态：</strong> {results.maintenance.success ? '✅ 成功' : '❌ 失败'}</li>
          </ul>
        </div>
      )}

      {results.error && (
        <div style={{ 
          border: '1px solid #dc3545', 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h3>❌ 测试错误</h3>
          <p>{results.error}</p>
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '4px' 
      }}>
        <h3>📋 功能说明</h3>
        <ul>
          <li><strong>数据压缩：</strong> 使用多层压缩算法（LZ77、字典压缩、模式压缩）自动压缩大数据</li>
          <li><strong>批量操作：</strong> 支持分块处理、并行操作、进度回调的高性能批量数据处理</li>
          <li><strong>大数据处理：</strong> 分页加载、索引搜索、模糊匹配等优化技术</li>
          <li><strong>数据维护：</strong> 自动清理过期数据、修复损坏数据、存储碎片整理</li>
        </ul>
      </div>
    </div>
  );
};

export default DataOptimizationDemo;