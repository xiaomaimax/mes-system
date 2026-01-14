/**
 * 员工管理数据流测试脚本
 * 
 * 测试目标：
 * 1. 验证DataService的员工CRUD操作
 * 2. 验证内存存储机制
 * 3. 验证缓存清除机制
 */

// 模拟DataService
class TestDataService {
  static _cache = new Map();
  static _memoryStore = { employees: [] };
  static _cacheConfig = {
    defaultTTL: 5 * 60 * 1000,
    moduleTTL: { production: 2 * 60 * 1000 }
  };

  static _generateCacheKey(module, method, params) {
    const paramStr = JSON.stringify(params);
    return `${module}_${method}_${btoa(paramStr)}`;
  }

  static _getFromCache(key) {
    const cached = this._cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  static _setToCache(key, data, ttl) {
    this._cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  static clearCache(module = null) {
    if (module) {
      for (const key of this._cache.keys()) {
        if (key.startsWith(`${module}_`)) {
          this._cache.delete(key);
        }
      }
    } else {
      this._cache.clear();
    }
  }

  static _generateMockEmployees() {
    const baseMockData = [
      { id: 1, name: '张师傅', shift: '白班', department: '生产部', position: '操作员' },
      { id: 2, name: '李师傅', shift: '白班', department: '生产部', position: '操作员' },
      { id: 3, name: '王师傅', shift: '夜班', department: '生产部', position: '操作员' }
    ];
    return [...baseMockData, ...this._memoryStore.employees];
  }

  static async getEmployees(params = {}, forceRefresh = false) {
    console.log('[TestDataService.getEmployees] 开始获取员工数据');
    
    const cacheKey = this._generateCacheKey('production', 'getEmployees', params);
    
    if (!forceRefresh) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[TestDataService.getEmployees] 使用缓存数据, 员工数量:', cached.data?.items?.length);
        return cached;
      }
    }

    const mockData = this._generateMockEmployees();
    console.log('[TestDataService.getEmployees] 生成员工数据, 总数:', mockData.length);
    console.log('[TestDataService.getEmployees] 内存存储中的员工数:', this._memoryStore.employees.length);
    
    const result = {
      success: true,
      data: {
        items: mockData,
        total: mockData.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    };

    const ttl = this._cacheConfig.moduleTTL.production || this._cacheConfig.defaultTTL;
    this._setToCache(cacheKey, result, ttl);
    
    return result;
  }

  static async addEmployee(employeeData) {
    console.log('[TestDataService.addEmployee] 添加员工:', employeeData);
    
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      createDate: new Date().toISOString().split('T')[0],
      status: '在职'
    };

    this._memoryStore.employees.push(newEmployee);
    console.log('[TestDataService.addEmployee] 员工已添加到内存存储，当前总数:', this._memoryStore.employees.length);
    
    this.clearCache('production');
    console.log('[TestDataService.addEmployee] 缓存已清除');
    
    return {
      success: true,
      data: newEmployee,
      message: '员工添加成功'
    };
  }
}

// 测试函数
async function testEmployeeDataFlow() {
  console.log('🧪 开始员工管理数据流测试\n');

  try {
    // 测试1: 初始获取员工数据
    console.log('📋 测试1: 初始获取员工数据');
    const initialData = await TestDataService.getEmployees();
    console.log('✅ 初始员工数量:', initialData.data.items.length);
    console.log('   员工列表:', initialData.data.items.map(emp => emp.name).join(', '));
    console.log('');

    // 测试2: 再次获取（应该使用缓存）
    console.log('📋 测试2: 再次获取员工数据（测试缓存）');
    const cachedData = await TestDataService.getEmployees();
    console.log('✅ 缓存员工数量:', cachedData.data.items.length);
    console.log('');

    // 测试3: 添加新员工
    console.log('📋 测试3: 添加新员工');
    const newEmployeeData = {
      employeeId: 'EMP004',
      name: '赵师傅',
      department: '生产部',
      position: '操作员',
      phone: '138****8004',
      email: 'zhao@company.com'
    };
    
    const addResult = await TestDataService.addEmployee(newEmployeeData);
    console.log('✅ 添加结果:', addResult.success ? '成功' : '失败');
    console.log('   新员工ID:', addResult.data.id);
    console.log('');

    // 测试4: 添加后重新获取数据
    console.log('📋 测试4: 添加后重新获取员工数据');
    const updatedData = await TestDataService.getEmployees();
    console.log('✅ 更新后员工数量:', updatedData.data.items.length);
    console.log('   员工列表:', updatedData.data.items.map(emp => emp.name).join(', '));
    console.log('');

    // 测试5: 强制刷新获取数据
    console.log('📋 测试5: 强制刷新获取员工数据');
    const refreshedData = await TestDataService.getEmployees({}, true);
    console.log('✅ 刷新后员工数量:', refreshedData.data.items.length);
    console.log('   员工列表:', refreshedData.data.items.map(emp => emp.name).join(', '));
    console.log('');

    // 验证结果
    const expectedCount = 4; // 3个基础 + 1个新增
    const actualCount = refreshedData.data.items.length;
    
    if (actualCount === expectedCount) {
      console.log('🎉 测试通过！员工数据流工作正常');
      console.log(`   预期员工数: ${expectedCount}, 实际员工数: ${actualCount}`);
    } else {
      console.log('❌ 测试失败！员工数据流存在问题');
      console.log(`   预期员工数: ${expectedCount}, 实际员工数: ${actualCount}`);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testEmployeeDataFlow();