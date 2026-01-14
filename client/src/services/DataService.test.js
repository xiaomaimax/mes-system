/**
 * DataService Unit Tests
 * 
 * Tests for:
 * - API call correctness
 * - Data transformation logic
 * - Error handling
 * 
 * Requirements: 7.1, 7.2
 */

// Mock browser APIs
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock the API modules before importing DataService
jest.mock('./api', () => ({
  ProductionAPI: {
    getDailyProductionReport: jest.fn()
  },
  InventoryAPI: {
    getInventory: jest.fn(),
    getInventoryTransactions: jest.fn()
  },
  QualityAPI: {
    getQualityInspections: jest.fn(),
    getDefectRecords: jest.fn(),
    getInspectionStandards: jest.fn()
  },
  EquipmentAPI: {
    getEquipmentMaintenance: jest.fn()
  },
  SchedulingAPI: {
    getPlanOrders: jest.fn(),
    getProductionTasks: jest.fn(),
    getDevices: jest.fn(),
    getMolds: jest.fn()
  }
}));

const DataService = require('./DataService');
const api = require('./api');

describe('DataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error to avoid test output pollution
  });

  // ============================================================================
  // 生产模块 API 测试
  // ============================================================================

  describe('Production Module', () => {
    describe('getProductionPlans', () => {
      test('should return production plans with correct structure', async () => {
        const mockData = [
          { id: 1, plan_code: 'PLAN-001', status: 'pending' },
          { id: 2, plan_code: 'PLAN-002', status: 'in_progress' }
        ];

        api.SchedulingAPI.getPlanOrders.mockResolvedValue({
          data: mockData,
          pagination: { total: 2 }
        });

        const result = await DataService.getProductionPlans();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(result.pagination.total).toBe(2);
        expect(api.SchedulingAPI.getPlanOrders).toHaveBeenCalled();
      });

      test('should handle empty production plans', async () => {
        api.SchedulingAPI.getPlanOrders.mockResolvedValue({
          data: [],
          pagination: { total: 0 }
        });

        const result = await DataService.getProductionPlans();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
        expect(result.pagination.total).toBe(0);
      });

      test('should handle API error gracefully', async () => {
        const error = new Error('API Error');
        api.SchedulingAPI.getPlanOrders.mockRejectedValue(error);

        const result = await DataService.getProductionPlans();

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error.message).toBe('API Error');
        expect(result.data).toBeNull();
      });

      test('should handle missing data field', async () => {
        api.SchedulingAPI.getPlanOrders.mockResolvedValue({
          pagination: { total: 0 }
        });

        const result = await DataService.getProductionPlans();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });
    });

    describe('getProductionTasks', () => {
      test('should return production tasks with correct structure', async () => {
        const mockData = [
          { id: 1, task_code: 'TASK-001', status: 'pending' },
          { id: 2, task_code: 'TASK-002', status: 'completed' }
        ];

        api.SchedulingAPI.getProductionTasks.mockResolvedValue({
          data: mockData,
          pagination: { total: 2 }
        });

        const result = await DataService.getProductionTasks({ page: 1 });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(api.SchedulingAPI.getProductionTasks).toHaveBeenCalledWith({ page: 1 });
      });

      test('should pass parameters to API', async () => {
        api.SchedulingAPI.getProductionTasks.mockResolvedValue({
          data: [],
          pagination: { total: 0 }
        });

        const params = { page: 2, pageSize: 20, status: 'pending' };
        await DataService.getProductionTasks(params);

        expect(api.SchedulingAPI.getProductionTasks).toHaveBeenCalledWith(params);
      });

      test('should handle API error for production tasks', async () => {
        const error = new Error('Network Error');
        api.SchedulingAPI.getProductionTasks.mockRejectedValue(error);

        const result = await DataService.getProductionTasks();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Network Error');
      });
    });

    describe('getWorkReports', () => {
      test('should return work reports with correct structure', async () => {
        const mockData = [
          { id: 1, report_date: '2025-01-01', status: 'submitted' }
        ];

        api.ProductionAPI.getDailyProductionReport.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getWorkReports();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(api.ProductionAPI.getDailyProductionReport).toHaveBeenCalled();
      });

      test('should handle API error for work reports', async () => {
        const error = new Error('Server Error');
        api.ProductionAPI.getDailyProductionReport.mockRejectedValue(error);

        const result = await DataService.getWorkReports();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Server Error');
      });
    });
  });

  // ============================================================================
  // 设备模块 API 测试
  // ============================================================================

  describe('Equipment Module', () => {
    describe('getEquipment', () => {
      test('should return equipment list with correct structure', async () => {
        const mockData = [
          { id: 1, equipment_code: 'EQ-001', equipment_name: 'Machine A' },
          { id: 2, equipment_code: 'EQ-002', equipment_name: 'Machine B' }
        ];

        api.SchedulingAPI.getDevices.mockResolvedValue({
          data: mockData,
          pagination: { total: 2 }
        });

        const result = await DataService.getEquipment();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(result.data.length).toBe(2);
      });

      test('should handle empty equipment list', async () => {
        api.SchedulingAPI.getDevices.mockResolvedValue({
          data: [],
          pagination: { total: 0 }
        });

        const result = await DataService.getEquipment();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });

      test('should handle API error for equipment', async () => {
        const error = new Error('Equipment API Error');
        api.SchedulingAPI.getDevices.mockRejectedValue(error);

        const result = await DataService.getEquipment();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Equipment API Error');
      });
    });

    describe('getMolds', () => {
      test('should return molds list with correct structure', async () => {
        const mockData = [
          { id: 1, mold_code: 'MOLD-001', mold_name: 'Mold A' }
        ];

        api.SchedulingAPI.getMolds.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getMolds();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for molds', async () => {
        const error = new Error('Molds API Error');
        api.SchedulingAPI.getMolds.mockRejectedValue(error);

        const result = await DataService.getMolds();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Molds API Error');
      });

      test('should handle empty molds list', async () => {
        api.SchedulingAPI.getMolds.mockResolvedValue({
          data: [],
          pagination: { total: 0 }
        });

        const result = await DataService.getMolds();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
        expect(result.pagination.total).toBe(0);
      });
    });

    describe('getEquipmentMaintenance', () => {
      test('should return equipment maintenance records', async () => {
        const mockData = [
          { id: 1, equipment_id: 1, maintenance_date: '2025-01-01' }
        ];

        api.EquipmentAPI.getEquipmentMaintenance.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getEquipmentMaintenance();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for equipment maintenance', async () => {
        const error = new Error('Maintenance API Error');
        api.EquipmentAPI.getEquipmentMaintenance.mockRejectedValue(error);

        const result = await DataService.getEquipmentMaintenance();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Maintenance API Error');
      });
    });
  });

  // ============================================================================
  // 质量模块 API 测试
  // ============================================================================

  describe('Quality Module', () => {
    describe('getQualityInspections', () => {
      test('should return quality inspections with correct structure', async () => {
        const mockData = [
          { id: 1, inspection_code: 'IQC-001', status: 'passed' }
        ];

        api.QualityAPI.getQualityInspections.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getQualityInspections();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for quality inspections', async () => {
        const error = new Error('Quality API Error');
        api.QualityAPI.getQualityInspections.mockRejectedValue(error);

        const result = await DataService.getQualityInspections();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Quality API Error');
      });
    });

    describe('getDefectRecords', () => {
      test('should return defect records with correct structure', async () => {
        const mockData = [
          { id: 1, defect_code: 'DEF-001', defect_type: 'scratch' }
        ];

        api.QualityAPI.getDefectRecords.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getDefectRecords();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for defect records', async () => {
        const error = new Error('Defect API Error');
        api.QualityAPI.getDefectRecords.mockRejectedValue(error);

        const result = await DataService.getDefectRecords();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Defect API Error');
      });
    });

    describe('getInspectionStandards', () => {
      test('should return inspection standards with correct structure', async () => {
        const mockData = [
          { id: 1, standard_code: 'STD-001', standard_name: 'Standard A' }
        ];

        api.QualityAPI.getInspectionStandards.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getInspectionStandards();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for inspection standards', async () => {
        const error = new Error('Standards API Error');
        api.QualityAPI.getInspectionStandards.mockRejectedValue(error);

        const result = await DataService.getInspectionStandards();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Standards API Error');
      });
    });
  });

  // ============================================================================
  // 库存模块 API 测试
  // ============================================================================

  describe('Inventory Module', () => {
    describe('getInventory', () => {
      test('should return inventory with correct structure', async () => {
        const mockData = [
          { id: 1, material_code: 'MAT-001', quantity: 100 }
        ];

        api.InventoryAPI.getInventory.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getInventory();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should pass parameters to inventory API', async () => {
        api.InventoryAPI.getInventory.mockResolvedValue({
          data: [],
          pagination: { total: 0 }
        });

        const params = { page: 1, pageSize: 10 };
        await DataService.getInventory(params);

        expect(api.InventoryAPI.getInventory).toHaveBeenCalledWith(params);
      });

      test('should handle API error for inventory', async () => {
        const error = new Error('Inventory API Error');
        api.InventoryAPI.getInventory.mockRejectedValue(error);

        const result = await DataService.getInventory();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Inventory API Error');
      });
    });

    describe('getInventoryTransactions', () => {
      test('should return inventory transactions with correct structure', async () => {
        const mockData = [
          { id: 1, transaction_code: 'TXN-001', type: 'in' }
        ];

        api.InventoryAPI.getInventoryTransactions.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getInventoryTransactions();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for inventory transactions', async () => {
        const error = new Error('Transaction API Error');
        api.InventoryAPI.getInventoryTransactions.mockRejectedValue(error);

        const result = await DataService.getInventoryTransactions();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Transaction API Error');
      });
    });

    describe('getLocationManagement', () => {
      test('should return location management data', async () => {
        const mockData = [
          { id: 1, location_code: 'LOC-001', location_name: 'Shelf A' }
        ];

        api.InventoryAPI.getInventory.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getLocationManagement();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for location management', async () => {
        const error = new Error('Location API Error');
        api.InventoryAPI.getInventory.mockRejectedValue(error);

        const result = await DataService.getLocationManagement();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Location API Error');
      });
    });
  });

  // ============================================================================
  // 报表模块 API 测试
  // ============================================================================

  describe('Reports Module', () => {
    describe('getProductionReports', () => {
      test('should return production reports with correct structure', async () => {
        const mockData = [
          { id: 1, report_date: '2025-01-01', total_output: 1000 }
        ];

        api.ProductionAPI.getDailyProductionReport.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getProductionReports();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for production reports', async () => {
        const error = new Error('Production Report API Error');
        api.ProductionAPI.getDailyProductionReport.mockRejectedValue(error);

        const result = await DataService.getProductionReports();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Production Report API Error');
      });
    });

    describe('getQualityReports', () => {
      test('should return quality reports with correct structure', async () => {
        const mockData = [
          { id: 1, report_date: '2025-01-01', defect_rate: 0.05 }
        ];

        api.QualityAPI.getDefectRecords.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getQualityReports();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for quality reports', async () => {
        const error = new Error('Quality Report API Error');
        api.QualityAPI.getDefectRecords.mockRejectedValue(error);

        const result = await DataService.getQualityReports();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Quality Report API Error');
      });
    });

    describe('getEquipmentReports', () => {
      test('should return equipment reports with correct structure', async () => {
        const mockData = [
          { id: 1, equipment_id: 1, maintenance_count: 5 }
        ];

        api.EquipmentAPI.getEquipmentMaintenance.mockResolvedValue({
          data: mockData,
          pagination: { total: 1 }
        });

        const result = await DataService.getEquipmentReports();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
      });

      test('should handle API error for equipment reports', async () => {
        const error = new Error('Equipment Report API Error');
        api.EquipmentAPI.getEquipmentMaintenance.mockRejectedValue(error);

        const result = await DataService.getEquipmentReports();

        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Equipment Report API Error');
      });
    });
  });

  // ============================================================================
  // 数据验证方法测试
  // ============================================================================

  describe('Data Validation Methods', () => {
    describe('validateDataIntegrity', () => {
      test('should validate single object with all required fields', () => {
        const data = { id: 1, name: 'Test', status: 'active' };
        const requiredFields = ['id', 'name', 'status'];

        const result = DataService.validateDataIntegrity(data, requiredFields);

        expect(result).toBe(true);
      });

      test('should fail validation when required field is missing', () => {
        const data = { id: 1, name: 'Test' };
        const requiredFields = ['id', 'name', 'status'];

        const result = DataService.validateDataIntegrity(data, requiredFields);

        expect(result).toBe(false);
      });

      test('should validate array of objects with all required fields', () => {
        const data = [
          { id: 1, name: 'Test1' },
          { id: 2, name: 'Test2' }
        ];
        const requiredFields = ['id', 'name'];

        const result = DataService.validateDataIntegrity(data, requiredFields);

        expect(result).toBe(true);
      });

      test('should fail validation when array item is missing required field', () => {
        const data = [
          { id: 1, name: 'Test1' },
          { id: 2 } // Missing 'name'
        ];
        const requiredFields = ['id', 'name'];

        const result = DataService.validateDataIntegrity(data, requiredFields);

        expect(result).toBe(false);
      });

      test('should return false for null data', () => {
        const result = DataService.validateDataIntegrity(null, ['id']);

        expect(result).toBe(false);
      });

      test('should return true for empty required fields', () => {
        const data = { id: 1, name: 'Test' };

        const result = DataService.validateDataIntegrity(data, []);

        expect(result).toBe(true);
      });

      test('should return true for empty array with empty required fields', () => {
        const data = [];

        const result = DataService.validateDataIntegrity(data, []);

        expect(result).toBe(true);
      });
    });

    describe('validatePaginationConsistency', () => {
      test('should validate correct pagination info', () => {
        const pagination = { page: 1, pageSize: 10, total: 100 };
        const items = Array(10).fill({});

        const result = DataService.validatePaginationConsistency(pagination, items);

        expect(result).toBe(true);
      });

      test('should validate last page with fewer items', () => {
        const pagination = { page: 10, pageSize: 10, total: 95 };
        const items = Array(5).fill({});

        const result = DataService.validatePaginationConsistency(pagination, items);

        expect(result).toBe(true);
      });

      test('should fail validation when items exceed pageSize', () => {
        const pagination = { page: 1, pageSize: 10, total: 100 };
        const items = Array(15).fill({});

        const result = DataService.validatePaginationConsistency(pagination, items);

        expect(result).toBe(false);
      });

      test('should fail validation when page is less than 1', () => {
        const pagination = { page: 0, pageSize: 10, total: 100 };
        const items = Array(10).fill({});

        const result = DataService.validatePaginationConsistency(pagination, items);

        expect(result).toBe(false);
      });

      test('should fail validation when pageSize is less than 1', () => {
        const pagination = { page: 1, pageSize: 0, total: 100 };
        const items = Array(10).fill({});

        const result = DataService.validatePaginationConsistency(pagination, items);

        expect(result).toBe(false);
      });

      test('should return true when pagination is null', () => {
        const items = Array(10).fill({});

        const result = DataService.validatePaginationConsistency(null, items);

        expect(result).toBe(true);
      });

      test('should return true when pagination is undefined', () => {
        const items = Array(10).fill({});

        const result = DataService.validatePaginationConsistency(undefined, items);

        expect(result).toBe(true);
      });
    });
  });

  // ============================================================================
  // 错误处理测试
  // ============================================================================

  describe('Error Handling', () => {
    test('should handle error with status code', async () => {
      const error = new Error('Not Found');
      error.status = 404;
      api.SchedulingAPI.getPlanOrders.mockRejectedValue(error);

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(404);
      expect(result.error.message).toBe('Not Found');
    });

    test('should handle error without status code', async () => {
      const error = new Error('Unknown Error');
      api.SchedulingAPI.getPlanOrders.mockRejectedValue(error);

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNKNOWN_ERROR');
      expect(result.error.message).toBe('Unknown Error');
    });

    test('should use default error message when error message is empty', async () => {
      const error = new Error();
      api.SchedulingAPI.getPlanOrders.mockRejectedValue(error);

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('获取生产计划失败');
    });

    test('should handle all API methods with consistent error format', async () => {
      const error = new Error('API Error');
      api.SchedulingAPI.getProductionTasks.mockRejectedValue(error);
      api.EquipmentAPI.getEquipmentMaintenance.mockRejectedValue(error);
      api.QualityAPI.getQualityInspections.mockRejectedValue(error);

      const result1 = await DataService.getProductionTasks();
      const result2 = await DataService.getEquipmentMaintenance();
      const result3 = await DataService.getQualityInspections();

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);

      expect(result1.error).toBeDefined();
      expect(result2.error).toBeDefined();
      expect(result3.error).toBeDefined();

      expect(result1.data).toBeNull();
      expect(result2.data).toBeNull();
      expect(result3.data).toBeNull();
    });
  });

  // ============================================================================
  // 数据转换测试
  // ============================================================================

  describe('Data Transformation', () => {
    test('should transform API response with pagination', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      api.SchedulingAPI.getPlanOrders.mockResolvedValue({
        data: mockData,
        pagination: { total: 2, page: 1, pageSize: 10 }
      });

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.pagination).toEqual({ total: 2, page: 1, pageSize: 10 });
    });

    test('should handle response without pagination field', async () => {
      const mockData = [{ id: 1, name: 'Item 1' }];

      api.SchedulingAPI.getPlanOrders.mockResolvedValue({
        data: mockData
      });

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.pagination).toEqual({ total: 0 });
    });

    test('should handle response with null data field', async () => {
      api.SchedulingAPI.getPlanOrders.mockResolvedValue({
        data: null,
        pagination: { total: 0 }
      });

      const result = await DataService.getProductionPlans();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('should preserve data structure during transformation', async () => {
      const mockData = [
        {
          id: 1,
          code: 'TEST-001',
          name: 'Test Item',
          metadata: { key: 'value' },
          nested: { deep: { value: 123 } }
        }
      ];

      api.SchedulingAPI.getPlanOrders.mockResolvedValue({
        data: mockData,
        pagination: { total: 1 }
      });

      const result = await DataService.getProductionPlans();

      expect(result.data[0]).toEqual(mockData[0]);
      expect(result.data[0].metadata).toEqual({ key: 'value' });
      expect(result.data[0].nested.deep.value).toBe(123);
    });
  });
});
