/**
 * 数据压缩和优化功能测试
 * 
 * 测试内容：
 * - 数据压缩功能
 * - 批量操作性能
 * - 大数据量处理
 * - 数据清理和维护
 * 
 * Requirements: 3.4, 5.3, 5.1, 5.2
 */

import PersistenceManager from './PersistenceManager.js';
import EmployeePersistence from './EmployeePersistence.js';

describe('数据压缩和优化功能测试', () => {
  beforeEach(() => {
    // 清理测试环境
    PersistenceManager.clear();
    EmployeePersistence._cache = null;
    EmployeePersistence._lastUpdate = null;
  });

  afterEach(() => {
    // 清理测试环境
    PersistenceManager.clear();
  });

  describe('数据压缩功能', () => {
    test('应该能够压缩大型数据', async () => {
      // 创建大型测试数据
      const largeData = {
        employees: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `员工${i + 1}`,
          department: `部门${(i % 5) + 1}`,
          position: `职位${(i % 3) + 1}`,
          phone: `138${String(i).padStart(8, '0')}`,
          email: `employee${i + 1}@company.com`,
          description: '这是一个很长的描述文本，用于测试数据压缩功能。'.repeat(10)
        }))
      };

      // 保存数据并检查压缩
      const success = await PersistenceManager.save('large_test_data', largeData);
      expect(success).toBe(true);

      // 加载数据并验证完整性
      const loadedData = await PersistenceManager.load('large_test_data');
      expect(loadedData).toEqual(largeData);
      expect(loadedData.employees).toHaveLength(100);
    });

    test('应该能够处理压缩失败的情况', async () => {
      // 创建不适合压缩的数据
      const randomData = {
        data: Math.random().toString(36).repeat(100)
      };

      // 保存数据
      const success = await PersistenceManager.save('random_test_data', randomData);
      expect(success).toBe(true);

      // 加载数据并验证
      const loadedData = await PersistenceManager.load('random_test_data');
      expect(loadedData).toEqual(randomData);
    });
  });

  describe('批量操作功能', () => {
    test('应该能够批量添加员工', async () => {
      const employeesData = Array.from({ length: 50 }, (_, i) => ({
        name: `批量员工${i + 1}`,
        department: '测试部门',
        position: '测试职位',
        phone: `139${String(i).padStart(8, '0')}`,
        email: `batch${i + 1}@test.com`
      }));

      const result = await EmployeePersistence.batchAddEmployees(employeesData);
      
      expect(result.success).toBe(true);
      expect(result.results.success).toBe(50);
      expect(result.results.failed).toBe(0);
      expect(result.results.addedEmployees).toHaveLength(50);

      // 验证数据已保存
      const allEmployees = await EmployeePersistence.loadEmployees();
      expect(allEmployees).toHaveLength(50);
    });

    test('应该能够批量更新员工', async () => {
      // 先添加一些员工
      const employeesData = Array.from({ length: 10 }, (_, i) => ({
        name: `员工${i + 1}`,
        department: '原部门',
        position: '原职位'
      }));

      const addResult = await EmployeePersistence.batchAddEmployees(employeesData);
      expect(addResult.success).toBe(true);

      // 准备更新数据
      const updates = addResult.results.addedEmployees.map(emp => ({
        id: emp.id,
        data: {
          department: '新部门',
          position: '新职位'
        }
      }));

      const updateResult = await EmployeePersistence.batchUpdateEmployees(updates);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.results.success).toBe(10);
      expect(updateResult.results.failed).toBe(0);

      // 验证更新结果
      const updatedEmployees = await EmployeePersistence.loadEmployees();
      updatedEmployees.forEach(emp => {
        expect(emp.department).toBe('新部门');
        expect(emp.position).toBe('新职位');
      });
    });

    test('应该能够批量删除员工', async () => {
      // 先添加一些员工
      const employeesData = Array.from({ length: 15 }, (_, i) => ({
        name: `待删除员工${i + 1}`,
        department: '测试部门',
        position: '测试职位'
      }));

      const addResult = await EmployeePersistence.batchAddEmployees(employeesData);
      expect(addResult.success).toBe(true);

      // 删除前5个员工
      const idsToDelete = addResult.results.addedEmployees.slice(0, 5).map(emp => emp.id);
      
      const deleteResult = await EmployeePersistence.batchDeleteEmployees(idsToDelete);
      
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.results.success).toBe(5);
      expect(deleteResult.results.failed).toBe(0);

      // 验证删除结果
      const remainingEmployees = await EmployeePersistence.loadEmployees();
      expect(remainingEmployees).toHaveLength(10);
      
      // 确保被删除的员工不存在
      const remainingIds = remainingEmployees.map(emp => emp.id);
      idsToDelete.forEach(id => {
        expect(remainingIds).not.toContain(id);
      });
    });
  });

  describe('大数据量处理性能', () => {
    test('应该能够处理大量员工数据', async () => {
      const startTime = performance.now();
      
      // 创建大量员工数据
      const largeEmployeeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `大数据员工${i + 1}`,
        department: `部门${(i % 20) + 1}`,
        position: `职位${(i % 10) + 1}`,
        phone: `150${String(i).padStart(8, '0')}`,
        email: `large${i + 1}@company.com`,
        status: i % 2 === 0 ? '在职' : '离职'
      }));

      const result = await EmployeePersistence.batchAddEmployees(largeEmployeeData);
      
      const duration = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(result.results.success).toBe(1000);
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成

      console.log(`大数据量处理耗时: ${duration.toFixed(2)}ms`);
    });

    test('应该能够高效分页加载数据', async () => {
      // 先添加大量数据
      const employeesData = Array.from({ length: 200 }, (_, i) => ({
        name: `分页员工${i + 1}`,
        department: `部门${(i % 5) + 1}`,
        position: `职位${(i % 3) + 1}`
      }));

      await EmployeePersistence.batchAddEmployees(employeesData);

      const startTime = performance.now();
      
      // 测试分页加载
      const pageResult = await EmployeePersistence.loadEmployeesPaginated({
        page: 2,
        pageSize: 20
      });
      
      const duration = performance.now() - startTime;
      
      expect(pageResult.success).toBe(true);
      expect(pageResult.data.items).toHaveLength(20);
      expect(pageResult.data.pagination.page).toBe(2);
      expect(pageResult.data.pagination.total).toBe(200);
      expect(duration).toBeLessThan(100); // 分页应该很快

      console.log(`分页加载耗时: ${duration.toFixed(2)}ms`);
    });

    test('应该能够高效搜索员工', async () => {
      // 先添加测试数据
      const employeesData = Array.from({ length: 100 }, (_, i) => ({
        name: i < 10 ? `张${i + 1}` : `员工${i + 1}`,
        department: i < 20 ? '技术部' : '其他部门',
        position: '工程师'
      }));

      await EmployeePersistence.batchAddEmployees(employeesData);

      const startTime = performance.now();
      
      // 测试搜索
      const searchResult = await EmployeePersistence.searchEmployees({
        keyword: '张',
        department: '技术部',
        limit: 50
      });
      
      const duration = performance.now() - startTime;
      
      expect(searchResult).toHaveLength(10); // 应该找到10个张姓员工
      expect(duration).toBeLessThan(50); // 搜索应该很快

      console.log(`搜索耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('数据清理和维护功能', () => {
    test('应该能够执行数据维护', async () => {
      // 添加一些测试数据
      const testData = Array.from({ length: 20 }, (_, i) => ({
        name: `维护测试员工${i + 1}`,
        department: '测试部门',
        position: '测试职位'
      }));

      await EmployeePersistence.batchAddEmployees(testData);

      // 执行数据维护
      const maintenanceResult = await PersistenceManager.performMaintenance({
        cleanExpired: true,
        cleanCorrupted: true,
        optimizeStorage: true,
        compactData: true
      });

      expect(maintenanceResult.success).toBe(true);
      expect(maintenanceResult.results).toBeDefined();
      expect(maintenanceResult.duration).toBeGreaterThan(0);
    });

    test('应该能够优化员工数据', async () => {
      // 添加测试数据
      const testData = Array.from({ length: 30 }, (_, i) => ({
        name: `优化测试员工${i + 1}`,
        department: '测试部门',
        position: '测试职位',
        description: '这是一个用于测试数据优化的长描述。'.repeat(5)
      }));

      await EmployeePersistence.batchAddEmployees(testData);

      // 执行数据优化
      const optimizeResult = await EmployeePersistence.optimizeData();

      expect(optimizeResult.success).toBe(true);
      expect(optimizeResult.employeeCount).toBe(30);
      expect(optimizeResult.duration).toBeGreaterThan(0);

      // 验证数据仍然完整
      const employees = await EmployeePersistence.loadEmployees();
      expect(employees).toHaveLength(30);
    });

    test('应该能够获取性能统计信息', async () => {
      // 添加一些数据
      const testData = Array.from({ length: 10 }, (_, i) => ({
        name: `统计测试员工${i + 1}`,
        department: `部门${(i % 3) + 1}`,
        position: `职位${(i % 2) + 1}`
      }));

      await EmployeePersistence.batchAddEmployees(testData);

      // 获取性能统计
      const performanceStats = PersistenceManager.getPerformanceStats();
      
      expect(performanceStats).toBeDefined();
      expect(performanceStats.storageType).toBeDefined();
      expect(performanceStats.stats).toBeDefined();
      expect(performanceStats.config).toBeDefined();

      // 获取优化的员工统计
      const employeeStats = await EmployeePersistence.getEmployeeStatsOptimized();
      
      expect(employeeStats.total).toBe(10);
      expect(employeeStats.departments).toBeDefined();
      expect(employeeStats.positions).toBeDefined();
      expect(employeeStats.performance).toBeDefined();
    });
  });

  describe('错误处理和边界情况', () => {
    test('应该正确处理批量操作中的部分失败', async () => {
      const mixedData = [
        { name: '有效员工1', department: '部门1', position: '职位1' },
        { name: '', department: '部门2', position: '职位2' }, // 无效：姓名为空
        { name: '有效员工3', department: '部门3', position: '职位3' },
        { department: '部门4', position: '职位4' }, // 无效：缺少姓名
        { name: '有效员工5', department: '部门5', position: '职位5' }
      ];

      const result = await EmployeePersistence.batchAddEmployees(mixedData);
      
      expect(result.success).toBe(true); // 部分成功也算成功
      expect(result.results.success).toBe(3); // 3个有效员工
      expect(result.results.failed).toBe(2); // 2个无效员工
      expect(result.results.errors).toHaveLength(2);
    });

    test('应该正确处理空数据的批量操作', async () => {
      const emptyResult = await EmployeePersistence.batchAddEmployees([]);
      
      expect(emptyResult.success).toBe(false);
      expect(emptyResult.results.success).toBe(0);
    });

    test('应该正确处理压缩失败的情况', async () => {
      // 模拟压缩失败的情况
      const originalCompress = PersistenceManager._compressData;
      PersistenceManager._compressData = () => {
        throw new Error('压缩失败');
      };

      try {
        const testData = { test: 'data'.repeat(1000) };
        const success = await PersistenceManager.save('compress_fail_test', testData);
        
        // 即使压缩失败，保存应该仍然成功（使用原始数据）
        expect(success).toBe(true);
        
        const loadedData = await PersistenceManager.load('compress_fail_test');
        expect(loadedData).toEqual(testData);
      } finally {
        // 恢复原始方法
        PersistenceManager._compressData = originalCompress;
      }
    });
  });
});