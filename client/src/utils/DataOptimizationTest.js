/**
 * 数据压缩和优化功能测试
 * 
 * 测试任务10的实现：
 * - 数据压缩功能
 * - 批量操作性能
 * - 大数据量处理
 * - 数据清理和维护
 */

import PersistenceManager from './PersistenceManager.js';
import EmployeePersistence from './EmployeePersistence.js';

class DataOptimizationTest {
  /**
   * 运行所有测试
   */
  static async runAllTests() {
    console.log('=== 开始数据压缩和优化功能测试 ===');
    
    try {
      // 初始化
      PersistenceManager.initialize();
      EmployeePersistence.initialize();
      
      // 测试1: 数据压缩功能
      await this.testDataCompression();
      
      // 测试2: 批量操作性能
      await this.testBatchOperations();
      
      // 测试3: 大数据量处理
      await this.testLargeDataHandling();
      
      // 测试4: 数据清理和维护
      await this.testDataMaintenance();
      
      // 测试5: 优化搜索功能
      await this.testOptimizedSearch();
      
      console.log('=== 所有测试完成 ===');
      
    } catch (error) {
      console.error('测试执行失败:', error);
    } finally {
      // 清理
      EmployeePersistence.cleanup();
    }
  }

  /**
   * 测试数据压缩功能
   */
  static async testDataCompression() {
    console.log('\n--- 测试1: 数据压缩功能 ---');
    
    try {
      // 创建大量测试数据
      const largeData = this.generateLargeTestData(1000);
      
      console.log('原始数据大小:', JSON.stringify(largeData).length, '字节');
      
      // 测试保存（会触发压缩）
      const saveResult = await PersistenceManager.save('test_compression', largeData);
      console.log('压缩保存结果:', saveResult);
      
      // 测试加载（会触发解压缩）
      const loadedData = await PersistenceManager.load('test_compression');
      console.log('解压缩加载成功:', loadedData !== null);
      
      // 验证数据完整性
      const isDataIntact = JSON.stringify(largeData) === JSON.stringify(loadedData);
      console.log('数据完整性验证:', isDataIntact ? '通过' : '失败');
      
      // 获取存储统计
      const storageInfo = PersistenceManager.getStorageInfo();
      console.log('存储统计:', {
        类型: storageInfo.storageType,
        使用率: `${storageInfo.usage.percentage.toFixed(1)}%`,
        压缩启用: storageInfo.config.compressionEnabled
      });
      
    } catch (error) {
      console.error('数据压缩测试失败:', error);
    }
  }

  /**
   * 测试批量操作性能
   */
  static async testBatchOperations() {
    console.log('\n--- 测试2: 批量操作性能 ---');
    
    try {
      // 生成批量员工数据
      const batchEmployees = this.generateEmployeeTestData(500);
      
      console.log('开始批量添加', batchEmployees.length, '个员工...');
      
      const startTime = performance.now();
      
      // 测试优化批量添加
      const batchResult = await EmployeePersistence.batchAddEmployees(batchEmployees, {
        chunkSize: 50,
        validateAll: true,
        skipDuplicates: true,
        optimizeStorage: true,
        progressCallback: (progress, data) => {
          if (progress % 25 === 0) {
            console.log(`批量添加进度: ${progress.toFixed(1)}%`, data.phase || '');
          }
        }
      });
      
      const duration = performance.now() - startTime;
      
      console.log('批量添加结果:', {
        成功: batchResult.results.success,
        失败: batchResult.results.failed,
        跳过: batchResult.results.skipped,
        总耗时: `${duration.toFixed(2)}ms`,
        平均每个: `${(duration / batchEmployees.length).toFixed(2)}ms`
      });
      
      console.log('性能统计:', batchResult.results.performance);
      
    } catch (error) {
      console.error('批量操作测试失败:', error);
    }
  }

  /**
   * 测试大数据量处理
   */
  static async testLargeDataHandling() {
    console.log('\n--- 测试3: 大数据量处理 ---');
    
    try {
      // 测试分页加载
      console.log('测试分页加载...');
      
      const pageResult = await EmployeePersistence.loadEmployeesPaginated({
        page: 1,
        pageSize: 50,
        filter: (emp) => emp.department === '生产部',
        sort: (a, b) => a.name.localeCompare(b.name)
      });
      
      console.log('分页加载结果:', {
        当前页: pageResult.data.pagination.page,
        页大小: pageResult.data.pagination.pageSize,
        总数: pageResult.data.pagination.total,
        总页数: pageResult.data.pagination.totalPages,
        数据项: pageResult.data.items.length
      });
      
      // 测试优化搜索
      console.log('测试优化搜索...');
      
      const searchStart = performance.now();
      const searchResults = await EmployeePersistence.searchEmployees({
        keyword: '张',
        department: '生产部',
        useIndices: true,
        fuzzySearch: true,
        sortBy: 'name',
        limit: 20
      });
      const searchDuration = performance.now() - searchStart;
      
      console.log('搜索结果:', {
        找到: searchResults.length,
        耗时: `${searchDuration.toFixed(2)}ms`
      });
      
    } catch (error) {
      console.error('大数据量处理测试失败:', error);
    }
  }

  /**
   * 测试数据清理和维护
   */
  static async testDataMaintenance() {
    console.log('\n--- 测试4: 数据清理和维护 ---');
    
    try {
      // 测试增强数据优化
      console.log('开始增强数据优化...');
      
      const optimizeResult = await EmployeePersistence.optimizeData({
        deepCleanup: true,
        compressData: true,
        defragmentStorage: true,
        optimizeIndices: true,
        progressCallback: (progress, data) => {
          if (progress % 20 === 0) {
            console.log(`优化进度: ${progress.toFixed(1)}% - ${data.phase || ''}`);
          }
        }
      });
      
      console.log('优化结果:', {
        成功: optimizeResult.success,
        员工数量: optimizeResult.employeeCount,
        节省空间: optimizeResult.spaceSaved,
        总耗时: `${optimizeResult.performance?.totalDuration?.toFixed(2)}ms`
      });
      
      console.log('优化阶段详情:');
      optimizeResult.phases?.forEach(phase => {
        console.log(`  ${phase.phase}: ${phase.duration?.toFixed(2)}ms`);
      });
      
      // 测试PersistenceManager维护
      console.log('测试存储维护...');
      
      const maintenanceResult = await PersistenceManager.performMaintenance({
        cleanExpired: true,
        cleanCorrupted: true,
        optimizeStorage: true,
        compactData: true,
        defragmentStorage: true,
        aggressiveCleanup: false
      });
      
      console.log('维护结果:', {
        成功: maintenanceResult.success,
        清理过期: maintenanceResult.results.expiredCleaned,
        清理损坏: maintenanceResult.results.corruptedCleaned,
        压缩项目: maintenanceResult.results.compactedItems,
        节省空间: maintenanceResult.results.spaceSaved,
        耗时: `${maintenanceResult.duration.toFixed(2)}ms`
      });
      
    } catch (error) {
      console.error('数据维护测试失败:', error);
    }
  }

  /**
   * 测试优化搜索功能
   */
  static async testOptimizedSearch() {
    console.log('\n--- 测试5: 优化搜索功能 ---');
    
    try {
      // 比较传统搜索和索引搜索的性能
      const searchOptions = {
        keyword: '李',
        department: '技术部',
        limit: 50
      };
      
      // 传统搜索
      const traditionalStart = performance.now();
      const traditionalResults = await EmployeePersistence.searchEmployees({
        ...searchOptions,
        useIndices: false
      });
      const traditionalDuration = performance.now() - traditionalStart;
      
      // 索引搜索
      const indexedStart = performance.now();
      const indexedResults = await EmployeePersistence.searchEmployees({
        ...searchOptions,
        useIndices: true
      });
      const indexedDuration = performance.now() - indexedStart;
      
      console.log('搜索性能对比:', {
        传统搜索: {
          结果数: traditionalResults.length,
          耗时: `${traditionalDuration.toFixed(2)}ms`
        },
        索引搜索: {
          结果数: indexedResults.length,
          耗时: `${indexedDuration.toFixed(2)}ms`
        },
        性能提升: `${((traditionalDuration / indexedDuration - 1) * 100).toFixed(1)}%`
      });
      
      // 测试模糊搜索
      const fuzzyResults = await EmployeePersistence.searchEmployees({
        keyword: '张伟',
        fuzzySearch: true,
        limit: 10
      });
      
      console.log('模糊搜索结果:', fuzzyResults.length, '个匹配项');
      
    } catch (error) {
      console.error('优化搜索测试失败:', error);
    }
  }

  /**
   * 生成大量测试数据
   */
  static generateLargeTestData(size) {
    const data = {
      items: [],
      metadata: {
        generated: new Date().toISOString(),
        size: size,
        type: 'test_data'
      }
    };
    
    for (let i = 0; i < size; i++) {
      data.items.push({
        id: i,
        name: `测试项目_${i}`,
        description: `这是第${i}个测试项目的详细描述，包含一些重复的文本内容用于测试压缩效果。`,
        category: `分类_${i % 10}`,
        tags: [`标签1`, `标签2`, `标签${i % 5}`],
        data: {
          value1: Math.random() * 1000,
          value2: `字符串值_${i}`,
          value3: i % 2 === 0,
          nested: {
            prop1: `嵌套属性_${i}`,
            prop2: new Date().toISOString(),
            prop3: Array(10).fill(`重复内容_${i % 3}`)
          }
        }
      });
    }
    
    return data;
  }

  /**
   * 生成员工测试数据
   */
  static generateEmployeeTestData(count) {
    const departments = ['技术部', '生产部', '销售部', '人事部', '财务部'];
    const positions = ['工程师', '经理', '主管', '专员', '助理'];
    const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
    
    const employees = [];
    
    for (let i = 0; i < count; i++) {
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      
      employees.push({
        employeeId: `EMP${String(i + 1000).padStart(4, '0')}`,
        name: `${surname}${name}${i > 100 ? i : ''}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `emp${i + 1000}@company.com`,
        gender: Math.random() > 0.5 ? '男' : '女',
        age: 22 + Math.floor(Math.random() * 38),
        status: Math.random() > 0.1 ? '在职' : '离职',
        createDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0]
      });
    }
    
    return employees;
  }

  /**
   * 性能基准测试
   */
  static async performanceBenchmark() {
    console.log('\n--- 性能基准测试 ---');
    
    const testSizes = [100, 500, 1000, 2000];
    
    for (const size of testSizes) {
      console.log(`\n测试数据量: ${size}`);
      
      const employees = this.generateEmployeeTestData(size);
      
      // 测试批量添加性能
      const addStart = performance.now();
      await EmployeePersistence.batchAddEmployees(employees, {
        chunkSize: Math.min(100, size),
        optimizeStorage: true
      });
      const addDuration = performance.now() - addStart;
      
      // 测试搜索性能
      const searchStart = performance.now();
      await EmployeePersistence.searchEmployees({
        keyword: '张',
        useIndices: true
      });
      const searchDuration = performance.now() - searchStart;
      
      // 测试优化性能
      const optimizeStart = performance.now();
      await EmployeePersistence.optimizeData({
        deepCleanup: false,
        compressData: true
      });
      const optimizeDuration = performance.now() - optimizeStart;
      
      console.log(`结果 (${size}条记录):`, {
        批量添加: `${addDuration.toFixed(2)}ms (${(addDuration/size).toFixed(2)}ms/条)`,
        搜索: `${searchDuration.toFixed(2)}ms`,
        优化: `${optimizeDuration.toFixed(2)}ms`
      });
      
      // 清理数据
      await EmployeePersistence.clearAllEmployees();
    }
  }
}

// 导出测试类
export default DataOptimizationTest;

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined' && window.location.search.includes('test=optimization')) {
  DataOptimizationTest.runAllTests();
}