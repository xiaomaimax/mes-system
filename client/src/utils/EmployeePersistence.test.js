/**
 * EmployeePersistence 备份和恢复功能测试
 * 
 * 测试内容：
 * - 数据备份机制
 * - 数据恢复功能
 * - 数据导入导出
 * - 完整性校验
 */

import EmployeePersistence from './EmployeePersistence.js';
import PersistenceManager from './PersistenceManager.js';

// 模拟浏览器环境
global.window = {
  localStorage: {
    data: {},
    setItem(key, value) { this.data[key] = value; },
    getItem(key) { return this.data[key] || null; },
    removeItem(key) { delete this.data[key]; },
    get length() { return Object.keys(this.data).length; },
    key(index) { return Object.keys(this.data)[index] || null; }
  },
  sessionStorage: {
    data: {},
    setItem(key, value) { this.data[key] = value; },
    getItem(key) { return this.data[key] || null; },
    removeItem(key) { delete this.data[key]; },
    get length() { return Object.keys(this.data).length; },
    key(index) { return Object.keys(this.data)[index] || null; }
  }
};

global.document = {
  readyState: 'complete',
  addEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn()
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn();
global.FileReader = jest.fn();

describe('EmployeePersistence 备份和恢复功能', () => {
  beforeEach(async () => {
    // 清理存储
    window.localStorage.data = {};
    window.sessionStorage.data = {};
    
    // 初始化管理器
    PersistenceManager.initialize();
    EmployeePersistence.cleanup(); // 清理之前的定时器
    
    // 重置缓存
    EmployeePersistence._cache = null;
    EmployeePersistence._lastUpdate = null;
    EmployeePersistence._backupHistory = [];
  });

  afterEach(() => {
    EmployeePersistence.cleanup();
  });

  describe('数据备份机制', () => {
    test('应该能够创建手动备份', async () => {
      // 准备测试数据
      const testEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师',
          phone: '13800138001',
          email: 'zhangsan@test.com'
        },
        {
          id: 2,
          name: '李四',
          department: '人事部',
          position: '专员',
          phone: '13800138002',
          email: 'lisi@test.com'
        }
      ];

      // 保存测试数据
      await EmployeePersistence.saveEmployees(testEmployees);

      // 创建备份
      const backupResult = await EmployeePersistence.createBackup(false);

      expect(backupResult.success).toBe(true);
      expect(backupResult.count).toBe(2);
      expect(backupResult.type).toBe('manual');
      expect(backupResult.backupId).toBeDefined();
    });

    test('应该能够获取备份列表', async () => {
      // 准备测试数据
      const testEmployees = [
        { id: 1, name: '张三', department: '技术部', position: '工程师' }
      ];

      await EmployeePersistence.saveEmployees(testEmployees);

      // 创建多个备份
      const backup1 = await EmployeePersistence.createBackup(false);
      const backup2 = await EmployeePersistence.createBackup(true);

      // 获取备份列表
      const backupList = await EmployeePersistence.getBackupList();

      expect(backupList.length).toBe(2);
      expect(backupList[0].valid).toBe(true);
      expect(backupList[1].valid).toBe(true);
    });

    test('应该能够从备份恢复数据', async () => {
      // 准备测试数据
      const originalEmployees = [
        { id: 1, name: '张三', department: '技术部', position: '工程师' },
        { id: 2, name: '李四', department: '人事部', position: '专员' }
      ];

      await EmployeePersistence.saveEmployees(originalEmployees);

      // 创建备份
      const backupResult = await EmployeePersistence.createBackup(false);
      expect(backupResult.success).toBe(true);

      // 修改数据
      const modifiedEmployees = [
        { id: 3, name: '王五', department: '财务部', position: '会计' }
      ];
      await EmployeePersistence.saveEmployees(modifiedEmployees);

      // 从备份恢复
      const restoreResult = await EmployeePersistence.restoreFromBackup(backupResult.backupId);
      expect(restoreResult.success).toBe(true);
      expect(restoreResult.count).toBe(2);

      // 验证恢复的数据
      const restoredEmployees = await EmployeePersistence.loadEmployees();
      expect(restoredEmployees.length).toBe(2);
      expect(restoredEmployees[0].name).toBe('张三');
      expect(restoredEmployees[1].name).toBe('李四');
    });
  });

  describe('数据完整性校验', () => {
    test('应该能够检测数据完整性', async () => {
      // 准备正常数据
      const testEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师',
          createDate: '2024-01-01',
          updateDate: '2024-01-02'
        }
      ];

      await EmployeePersistence.saveEmployees(testEmployees);

      // 执行完整性检查
      const integrityResult = await EmployeePersistence.performIntegrityCheck();

      expect(integrityResult.status).toBe('healthy');
      expect(integrityResult.issues.length).toBe(0);
      expect(integrityResult.statistics).toBeDefined();
    });

    test('应该能够检测数据不一致问题', async () => {
      // 准备有问题的数据
      const problematicEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师',
          createDate: '2024-01-02', // 创建日期晚于更新日期
          updateDate: '2024-01-01'
        }
      ];

      await EmployeePersistence.saveEmployees(problematicEmployees);

      // 执行完整性检查
      const integrityResult = await EmployeePersistence.performIntegrityCheck();

      expect(integrityResult.status).toBe('warning');
      expect(integrityResult.issues.length).toBeGreaterThan(0);
      
      const dateIssue = integrityResult.issues.find(issue => 
        issue.type === 'data_inconsistency'
      );
      expect(dateIssue).toBeDefined();
    });

    test('应该能够自动修复数据问题', async () => {
      // 准备有问题的数据
      const problematicEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师',
          createDate: '2024-01-02',
          updateDate: '2024-01-01'
        }
      ];

      await EmployeePersistence.saveEmployees(problematicEmployees);

      // 执行完整性检查
      const integrityResult = await EmployeePersistence.performIntegrityCheck();
      expect(integrityResult.status).toBe('warning');

      // 自动修复
      const repairResult = await EmployeePersistence.autoRepairData(integrityResult);

      expect(repairResult.repaired.length).toBeGreaterThan(0);
      expect(repairResult.failed.length).toBe(0);

      // 验证修复结果
      const repairedEmployees = await EmployeePersistence.loadEmployees();
      expect(repairedEmployees[0].updateDate).toBe(repairedEmployees[0].createDate);
    });
  });

  describe('数据导入导出功能', () => {
    test('应该能够导出JSON格式数据', async () => {
      // 准备测试数据
      const testEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师',
          phone: '13800138001',
          email: 'zhangsan@test.com'
        }
      ];

      await EmployeePersistence.saveEmployees(testEmployees);

      // 导出数据
      const exportResult = await EmployeePersistence.exportEmployeeData({
        format: 'json',
        includeMetadata: true
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.count).toBe(1);
      expect(exportResult.format).toBe('json');
      expect(exportResult.filename).toContain('.json');
    });

    test('应该能够导出CSV格式数据', async () => {
      // 准备测试数据
      const testEmployees = [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          position: '工程师'
        }
      ];

      await EmployeePersistence.saveEmployees(testEmployees);

      // 导出数据
      const exportResult = await EmployeePersistence.exportEmployeeData({
        format: 'csv'
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.count).toBe(1);
      expect(exportResult.format).toBe('csv');
      expect(exportResult.filename).toContain('.csv');
    });

    test('应该能够导入JSON格式数据', async () => {
      // 准备导入数据
      const importData = JSON.stringify({
        employees: [
          {
            id: 1,
            name: '张三',
            department: '技术部',
            position: '工程师'
          },
          {
            id: 2,
            name: '李四',
            department: '人事部',
            position: '专员'
          }
        ]
      });

      // 导入数据
      const importResult = await EmployeePersistence.importEmployeeData(importData, {
        format: 'json',
        validate: true
      });

      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(2);
      expect(importResult.total).toBe(2);

      // 验证导入的数据
      const employees = await EmployeePersistence.loadEmployees();
      expect(employees.length).toBe(2);
      expect(employees[0].name).toBe('张三');
      expect(employees[1].name).toBe('李四');
    });

    test('应该能够合并导入数据', async () => {
      // 准备现有数据
      const existingEmployees = [
        { id: 1, name: '张三', department: '技术部', position: '工程师' }
      ];
      await EmployeePersistence.saveEmployees(existingEmployees);

      // 准备导入数据
      const importData = JSON.stringify({
        employees: [
          { id: 2, name: '李四', department: '人事部', position: '专员' }
        ]
      });

      // 合并导入
      const importResult = await EmployeePersistence.importEmployeeData(importData, {
        format: 'json',
        merge: true
      });

      expect(importResult.success).toBe(true);
      expect(importResult.imported).toBe(1);
      expect(importResult.total).toBe(2);
      expect(importResult.merged).toBe(true);

      // 验证合并结果
      const employees = await EmployeePersistence.loadEmployees();
      expect(employees.length).toBe(2);
    });
  });

  describe('错误处理', () => {
    test('应该处理空数据备份', async () => {
      // 清除所有员工数据
      await EmployeePersistence.clearAllEmployees();
      
      // 尝试备份空数据
      const backupResult = await EmployeePersistence.createBackup(false);

      expect(backupResult.success).toBe(false);
      expect(backupResult.reason).toBe('no_data');
    });

    test('应该处理无效的导入数据', async () => {
      // 尝试导入无效数据
      const importResult = await EmployeePersistence.importEmployeeData('invalid json', {
        format: 'json'
      });

      expect(importResult.success).toBe(false);
      expect(importResult.reason).toBe('error');
    });

    test('应该处理备份不存在的情况', async () => {
      // 尝试从不存在的备份恢复
      const restoreResult = await EmployeePersistence.restoreFromBackup('nonexistent_backup');

      expect(restoreResult.success).toBe(false);
      expect(restoreResult.reason).toBe('no_backup');
    });
  });

  describe('审计日志功能', () => {
    test('应该记录员工添加操作的审计日志', async () => {
      // 添加员工
      const employee = {
        name: '张三',
        department: '技术部',
        position: '工程师',
        phone: '13800138001',
        email: 'zhangsan@test.com'
      };

      await EmployeePersistence.addEmployee(employee);

      // 获取审计日志
      const auditLogs = await EmployeePersistence.getAuditLogs({ action: 'ADD_EMPLOYEE' });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('ADD_EMPLOYEE');
      expect(auditLogs[0].details.name).toBe('张三');
      expect(auditLogs[0].details.success).toBe(true);
    });

    test('应该记录员工更新操作的审计日志', async () => {
      // 先添加员工
      const employee = {
        name: '李四',
        department: '人事部',
        position: '专员'
      };

      const addedEmployee = await EmployeePersistence.addEmployee(employee);

      // 更新员工
      await EmployeePersistence.updateEmployee(addedEmployee.id, {
        department: '财务部'
      });

      // 获取审计日志
      const auditLogs = await EmployeePersistence.getAuditLogs({ action: 'UPDATE_EMPLOYEE' });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('UPDATE_EMPLOYEE');
      expect(auditLogs[0].details.employeeId).toBe(addedEmployee.id);
      expect(auditLogs[0].details.success).toBe(true);
    });

    test('应该记录员工删除操作的审计日志', async () => {
      // 先添加员工
      const employee = {
        name: '王五',
        department: '技术部',
        position: '工程师'
      };

      const addedEmployee = await EmployeePersistence.addEmployee(employee);

      // 删除员工
      await EmployeePersistence.deleteEmployee(addedEmployee.id);

      // 获取审计日志
      const auditLogs = await EmployeePersistence.getAuditLogs({ action: 'DELETE_EMPLOYEE' });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('DELETE_EMPLOYEE');
      expect(auditLogs[0].details.employeeId).toBe(addedEmployee.id);
      expect(auditLogs[0].details.success).toBe(true);
    });

    test('应该能够按时间范围过滤审计日志', async () => {
      // 添加一些测试数据
      await EmployeePersistence.addEmployee({
        name: '测试员工1',
        department: '技术部',
        position: '工程师'
      });

      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1); // 1小时前

      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 1); // 1小时后

      // 获取时间范围内的审计日志
      const auditLogs = await EmployeePersistence.getAuditLogs({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      auditLogs.forEach(log => {
        const logTime = new Date(log.timestamp);
        expect(logTime.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(logTime.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('启动检查功能', () => {
    test('应该在初始化时设置启动标记', async () => {
      // 重新初始化
      EmployeePersistence.cleanup();
      EmployeePersistence.initialize();

      // 检查启动标记是否设置
      const startupFlag = await PersistenceManager.load('employees_startup_flag');
      
      expect(startupFlag).toBeDefined();
      expect(startupFlag.active).toBe(true);
      expect(startupFlag.timestamp).toBeDefined();
    });

    test('应该在清理时清除启动标记', async () => {
      // 初始化后清理
      EmployeePersistence.initialize();
      EmployeePersistence.cleanup();

      // 检查启动标记是否清除
      const startupFlag = await PersistenceManager.load('employees_startup_flag');
      
      expect(startupFlag).toBeDefined();
      expect(startupFlag.active).toBe(false);
    });

    test('应该检测异常退出并执行完整性检查', async () => {
      // 模拟异常退出：设置活跃的启动标记
      await PersistenceManager.save('employees_startup_flag', {
        active: true,
        timestamp: new Date(Date.now() - 60000).toISOString() // 1分钟前
      });

      // 准备一些测试数据
      await EmployeePersistence.saveEmployees([
        { id: 1, name: '张三', department: '技术部', position: '工程师' }
      ]);

      // 重新初始化，应该检测到异常退出
      EmployeePersistence.cleanup();
      EmployeePersistence.initialize();

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 检查审计日志中是否有异常退出记录
      const auditLogs = await EmployeePersistence.getAuditLogs({ 
        action: 'ABNORMAL_EXIT_DETECTED' 
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('ABNORMAL_EXIT_DETECTED');
    });
  });
});