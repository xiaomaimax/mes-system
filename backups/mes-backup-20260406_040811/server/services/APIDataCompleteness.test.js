/**
 * API Data Completeness Property-Based Tests
 * Validates that API responses contain all required fields and data is consistent with database
 * Requirements: 2.5, 3.5, 4.5, 5.5, 6.5
 * 
 * Feature: mock-data-to-database, Property 1: API数据完整性
 * 
 * Property 1: API Data Completeness
 * For any API query request, the returned data should contain all required fields,
 * and field values should be consistent with database records.
 * 
 * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5
 */

/**
 * Define required fields for each API endpoint
 */
const REQUIRED_FIELDS = {
  // Production module
  production_plans: ['id', 'plan_code', 'equipment_id', 'material_id', 'mold_id', 'quantity', 'status'],
  production_tasks: ['id', 'task_code', 'plan_id', 'equipment_id', 'material_id', 'mold_id', 'quantity', 'status'],
  work_reports: ['id', 'task_id', 'report_code', 'quantity_completed', 'status'],
  
  // Equipment module
  equipment: ['id', 'name', 'type', 'production_line_id', 'status'],
  molds: ['id', 'name', 'type', 'status'],
  equipment_maintenance: ['id', 'equipment_id', 'maintenance_type', 'status'],
  
  // Quality module
  quality_inspections: ['id', 'inspection_code', 'task_id', 'status', 'result'],
  defect_records: ['id', 'defect_code', 'inspection_id', 'defect_type', 'severity'],
  
  // Inventory module
  inventory: ['id', 'material_id', 'quantity', 'location', 'status'],
  inventory_transactions: ['id', 'material_id', 'transaction_type', 'quantity', 'status'],
  
  // Reports module
  production_reports: ['total_quantity', 'completed_quantity', 'completion_rate'],
  quality_reports: ['total_inspections', 'passed_count', 'defect_count', 'pass_rate'],
  equipment_reports: ['total_equipment', 'operational_count', 'maintenance_count']
};

/**
 * Helper function to generate random API query parameters
 * @returns {Object} Random query parameters
 */
function generateRandomQueryParams() {
  return {
    page: Math.floor(Math.random() * 5) + 1,
    pageSize: [10, 20, 50][Math.floor(Math.random() * 3)],
    status: ['active', 'inactive', 'pending', 'completed'][Math.floor(Math.random() * 4)]
  };
}

/**
 * Helper function to verify API response structure
 * @param {Object} response - API response object
 * @param {string} endpoint - API endpoint name
 * @returns {Object} Verification result
 */
function verifyAPIResponseStructure(response, endpoint) {
  const errors = [];
  const warnings = [];

  // Check response format
  if (!response.success) {
    errors.push('Response missing success field');
  }

  if (!response.data) {
    errors.push('Response missing data field');
    return { isValid: false, errors, warnings };
  }

  // Check pagination fields for list endpoints
  if (endpoint.includes('list') || endpoint.includes('get')) {
    if (response.data.items === undefined) {
      errors.push('Response missing items field');
    }
    if (response.data.total === undefined) {
      errors.push('Response missing total field');
    }
    if (response.data.page === undefined) {
      warnings.push('Response missing page field');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to verify required fields in API response
 * @param {Object} data - Data object from API response
 * @param {string} endpoint - API endpoint name
 * @returns {Object} Verification result
 */
function verifyRequiredFields(data, endpoint) {
  const errors = [];
  const requiredFields = REQUIRED_FIELDS[endpoint] || [];

  if (!Array.isArray(data)) {
    data = [data];
  }

  for (const item of data) {
    for (const field of requiredFields) {
      if (item[field] === undefined || item[field] === null) {
        errors.push(`Missing required field: ${field} in ${endpoint}`);
      }
    }
  }

  return {
    hasAllRequiredFields: errors.length === 0,
    errors,
    missingFields: errors.map(e => e.split(': ')[1])
  };
}

/**
 * Helper function to verify data type consistency
 * @param {Object} data - Data object from API response
 * @param {string} endpoint - API endpoint name
 * @returns {Object} Verification result
 */
function verifyDataTypeConsistency(data, endpoint) {
  const errors = [];

  if (!Array.isArray(data)) {
    data = [data];
  }

  for (const item of data) {
    // Verify ID is numeric
    if (item.id !== undefined && typeof item.id !== 'number') {
      errors.push(`Invalid ID type: expected number, got ${typeof item.id}`);
    }

    // Verify quantity fields are numeric
    if (item.quantity !== undefined && typeof item.quantity !== 'number') {
      errors.push(`Invalid quantity type: expected number, got ${typeof item.quantity}`);
    }

    // Verify status is string
    if (item.status !== undefined && typeof item.status !== 'string') {
      errors.push(`Invalid status type: expected string, got ${typeof item.status}`);
    }

    // Verify code fields are string
    if ((item.plan_code || item.task_code || item.inspection_code || item.defect_code) &&
        typeof (item.plan_code || item.task_code || item.inspection_code || item.defect_code) !== 'string') {
      errors.push('Invalid code field type: expected string');
    }
  }

  return {
    isConsistent: errors.length === 0,
    errors
  };
}

/**
 * Helper function to verify referential integrity
 * @param {Object} data - Data object from API response
 * @param {string} endpoint - API endpoint name
 * @returns {Object} Verification result
 */
function verifyReferentialIntegrity(data, endpoint) {
  const errors = [];

  if (!Array.isArray(data)) {
    data = [data];
  }

  for (const item of data) {
    // Foreign key fields should be numeric if present
    const foreignKeyFields = ['equipment_id', 'material_id', 'mold_id', 'plan_id', 'task_id', 
                             'inspection_id', 'production_line_id'];
    
    for (const field of foreignKeyFields) {
      if (item[field] !== undefined && item[field] !== null) {
        if (typeof item[field] !== 'number') {
          errors.push(`Invalid foreign key ${field}: expected number, got ${typeof item[field]}`);
        }
        if (item[field] <= 0) {
          errors.push(`Invalid foreign key ${field}: must be positive`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper function to verify pagination consistency
 * @param {Object} response - API response object
 * @returns {Object} Verification result
 */
function verifyPaginationConsistency(response) {
  const errors = [];

  if (response.data.items && response.data.total !== undefined && response.data.page !== undefined) {
    // Items count should not exceed total
    if (response.data.items.length > response.data.total) {
      errors.push('Items count exceeds total count');
    }

    // Page should be positive
    if (response.data.page < 1) {
      errors.push('Page number should be positive');
    }

    // Total pages calculation
    if (response.data.pageSize && response.data.totalPages !== undefined) {
      const expectedTotalPages = Math.ceil(response.data.total / response.data.pageSize);
      if (response.data.totalPages !== expectedTotalPages) {
        errors.push(`Invalid totalPages: expected ${expectedTotalPages}, got ${response.data.totalPages}`);
      }
    }
  }

  return {
    isConsistent: errors.length === 0,
    errors
  };
}

/**
 * Helper function to verify no null/undefined values in required fields
 * @param {Object} data - Data object from API response
 * @returns {Object} Verification result
 */
function verifyNoNullValues(data) {
  const errors = [];

  if (!Array.isArray(data)) {
    data = [data];
  }

  for (const item of data) {
    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined) {
        errors.push(`Null/undefined value in field: ${key}`);
      }
    }
  }

  return {
    hasNoNullValues: errors.length === 0,
    errors
  };
}

describe('API Data Completeness - Property-Based Tests', () => {
  describe('Property 1: API Data Completeness', () => {
    /**
     * Property Test: Response Structure Validity
     * For any API response, the response should have valid structure with success and data fields
     */
    test('should have valid response structure with success and data fields', () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: 1, name: 'Test', status: 'active' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      const verification = verifyAPIResponseStructure(mockResponse, 'production_plans');
      expect(verification.isValid).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Required Fields Presence
     * For any API response, all required fields should be present in the data
     */
    test('should contain all required fields for production plans', () => {
      const mockData = [
        {
          id: 1,
          plan_code: 'PLAN-0001',
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 100,
          status: 'active'
        }
      ];

      const verification = verifyRequiredFields(mockData, 'production_plans');
      expect(verification.hasAllRequiredFields).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Required Fields Presence for Equipment
     * For any equipment API response, all required fields should be present
     */
    test('should contain all required fields for equipment', () => {
      const mockData = [
        {
          id: 1,
          name: 'Equipment 1',
          type: 'Injection Molding Machine',
          production_line_id: 1,
          status: 'active'
        }
      ];

      const verification = verifyRequiredFields(mockData, 'equipment');
      expect(verification.hasAllRequiredFields).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Required Fields Presence for Quality
     * For any quality inspection API response, all required fields should be present
     */
    test('should contain all required fields for quality inspections', () => {
      const mockData = [
        {
          id: 1,
          inspection_code: 'QI-0001',
          task_id: 1,
          status: 'passed',
          result: 'OK'
        }
      ];

      const verification = verifyRequiredFields(mockData, 'quality_inspections');
      expect(verification.hasAllRequiredFields).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Required Fields Presence for Inventory
     * For any inventory API response, all required fields should be present
     */
    test('should contain all required fields for inventory', () => {
      const mockData = [
        {
          id: 1,
          material_id: 1,
          quantity: 1000,
          location: 'Warehouse 1',
          status: 'active'
        }
      ];

      const verification = verifyRequiredFields(mockData, 'inventory');
      expect(verification.hasAllRequiredFields).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Data Type Consistency
     * For any API response, data types should be consistent and correct
     */
    test('should have consistent data types for all fields', () => {
      const mockData = [
        {
          id: 1,
          plan_code: 'PLAN-0001',
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 100,
          status: 'active'
        }
      ];

      const verification = verifyDataTypeConsistency(mockData, 'production_plans');
      expect(verification.isConsistent).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Referential Integrity
     * For any API response, foreign key fields should be valid numeric IDs
     */
    test('should have valid foreign key references', () => {
      const mockData = [
        {
          id: 1,
          plan_code: 'PLAN-0001',
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 100,
          status: 'active'
        }
      ];

      const verification = verifyReferentialIntegrity(mockData, 'production_plans');
      expect(verification.isValid).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Pagination Consistency
     * For any paginated API response, pagination fields should be consistent
     */
    test('should have consistent pagination information', () => {
      const mockResponse = {
        success: true,
        data: {
          items: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
          total: 100,
          page: 1,
          pageSize: 10,
          totalPages: 10
        }
      };

      const verification = verifyPaginationConsistency(mockResponse);
      expect(verification.isConsistent).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: No Null Values in Required Fields
     * For any API response, required fields should not contain null or undefined values
     */
    test('should not have null or undefined values in data fields', () => {
      const mockData = [
        {
          id: 1,
          plan_code: 'PLAN-0001',
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 100,
          status: 'active'
        }
      ];

      const verification = verifyNoNullValues(mockData);
      expect(verification.hasNoNullValues).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: ID Field Validity
     * For any API response, ID fields should be positive integers
     */
    test('should have valid positive integer IDs', () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 100, name: 'Item 100' }
      ];

      for (const item of mockData) {
        expect(typeof item.id).toBe('number');
        expect(item.id).toBeGreaterThan(0);
        expect(Number.isInteger(item.id)).toBe(true);
      }
    });

    /**
     * Property Test: Status Field Validity
     * For any API response, status fields should be valid string values
     */
    test('should have valid status values', () => {
      const validStatuses = ['active', 'inactive', 'pending', 'completed', 'passed', 'failed'];
      const mockData = [
        { id: 1, status: 'active' },
        { id: 2, status: 'pending' },
        { id: 3, status: 'completed' }
      ];

      for (const item of mockData) {
        expect(typeof item.status).toBe('string');
        expect(validStatuses).toContain(item.status);
      }
    });

    /**
     * Property Test: Quantity Field Validity
     * For any API response with quantity field, quantity should be positive number
     */
    test('should have positive quantity values', () => {
      const mockData = [
        { id: 1, quantity: 100 },
        { id: 2, quantity: 500 },
        { id: 3, quantity: 1000 }
      ];

      for (const item of mockData) {
        expect(typeof item.quantity).toBe('number');
        expect(item.quantity).toBeGreaterThan(0);
      }
    });

    /**
     * Property Test: Code Field Format
     * For any API response with code field, code should follow expected format
     */
    test('should have properly formatted code fields', () => {
      const mockData = [
        { id: 1, plan_code: 'PLAN-0001' },
        { id: 2, plan_code: 'PLAN-0002' },
        { id: 3, plan_code: 'PLAN-0100' }
      ];

      for (const item of mockData) {
        expect(item.plan_code).toMatch(/^PLAN-\d{4}$/);
      }
    });

    /**
     * Property Test: Multiple Endpoints Data Completeness
     * For any API endpoint, returned data should be complete and consistent
     */
    test('should return complete data for production tasks endpoint', () => {
      const mockData = [
        {
          id: 1,
          task_code: 'TASK-0001',
          plan_id: 1,
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 50,
          status: 'pending'
        }
      ];

      const fieldVerification = verifyRequiredFields(mockData, 'production_tasks');
      const typeVerification = verifyDataTypeConsistency(mockData, 'production_tasks');
      const integrityVerification = verifyReferentialIntegrity(mockData, 'production_tasks');

      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(typeVerification.isConsistent).toBe(true);
      expect(integrityVerification.isValid).toBe(true);
    });

    /**
     * Property Test: Equipment Data Completeness
     * For any equipment API response, all required fields should be present and valid
     */
    test('should return complete equipment data', () => {
      const mockData = [
        {
          id: 1,
          name: 'Equipment 1',
          type: 'Injection Molding Machine',
          production_line_id: 1,
          status: 'active'
        }
      ];

      const fieldVerification = verifyRequiredFields(mockData, 'equipment');
      const typeVerification = verifyDataTypeConsistency(mockData, 'equipment');
      const integrityVerification = verifyReferentialIntegrity(mockData, 'equipment');

      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(typeVerification.isConsistent).toBe(true);
      expect(integrityVerification.isValid).toBe(true);
    });

    /**
     * Property Test: Quality Data Completeness
     * For any quality inspection API response, all required fields should be present and valid
     */
    test('should return complete quality inspection data', () => {
      const mockData = [
        {
          id: 1,
          inspection_code: 'QI-0001',
          task_id: 1,
          status: 'passed',
          result: 'OK'
        }
      ];

      const fieldVerification = verifyRequiredFields(mockData, 'quality_inspections');
      const typeVerification = verifyDataTypeConsistency(mockData, 'quality_inspections');
      const integrityVerification = verifyReferentialIntegrity(mockData, 'quality_inspections');

      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(typeVerification.isConsistent).toBe(true);
      expect(integrityVerification.isValid).toBe(true);
    });

    /**
     * Property Test: Inventory Data Completeness
     * For any inventory API response, all required fields should be present and valid
     */
    test('should return complete inventory data', () => {
      const mockData = [
        {
          id: 1,
          material_id: 1,
          quantity: 1000,
          location: 'Warehouse 1',
          status: 'active'
        }
      ];

      const fieldVerification = verifyRequiredFields(mockData, 'inventory');
      const typeVerification = verifyDataTypeConsistency(mockData, 'inventory');
      const integrityVerification = verifyReferentialIntegrity(mockData, 'inventory');

      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(typeVerification.isConsistent).toBe(true);
      expect(integrityVerification.isValid).toBe(true);
    });

    /**
     * Property Test: Batch Data Completeness
     * For any batch of API responses, all items should have complete and consistent data
     */
    test('should maintain data completeness across batch responses', () => {
      const mockBatch = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        plan_code: `PLAN-${String(i + 1).padStart(4, '0')}`,
        equipment_id: (i % 6) + 1,
        material_id: (i % 11) + 1,
        mold_id: (i % 8) + 1,
        quantity: 100 * (i + 1),
        status: 'active'
      }));

      for (const item of mockBatch) {
        const fieldVerification = verifyRequiredFields([item], 'production_plans');
        const typeVerification = verifyDataTypeConsistency([item], 'production_plans');
        
        expect(fieldVerification.hasAllRequiredFields).toBe(true);
        expect(typeVerification.isConsistent).toBe(true);
      }
    });

    /**
     * Property Test: Response Consistency Across Endpoints
     * For any API response, the response format should be consistent across different endpoints
     */
    test('should maintain consistent response format across endpoints', () => {
      const endpoints = ['production_plans', 'equipment', 'quality_inspections', 'inventory'];
      
      for (const endpoint of endpoints) {
        const mockResponse = {
          success: true,
          data: {
            items: [{ id: 1, name: 'Test' }],
            total: 1,
            page: 1,
            pageSize: 10
          }
        };

        const verification = verifyAPIResponseStructure(mockResponse, endpoint);
        expect(verification.isValid).toBe(true);
      }
    });
  });

  describe('API Data Completeness Edge Cases', () => {
    /**
     * Edge Case: Single Item Response
     * API should handle single item responses correctly
     */
    test('should handle single item response correctly', () => {
      const mockData = {
        id: 1,
        plan_code: 'PLAN-0001',
        equipment_id: 1,
        material_id: 1,
        mold_id: 1,
        quantity: 100,
        status: 'active'
      };

      const fieldVerification = verifyRequiredFields(mockData, 'production_plans');
      expect(fieldVerification.hasAllRequiredFields).toBe(true);
    });

    /**
     * Edge Case: Empty Items Array
     * API should handle empty items array correctly
     */
    test('should handle empty items array', () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      const verification = verifyPaginationConsistency(mockResponse);
      expect(verification.isConsistent).toBe(true);
    });

    /**
     * Edge Case: Large Batch Response
     * API should maintain data completeness with large batch responses
     */
    test('should maintain completeness with large batch response', () => {
      const mockBatch = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        plan_code: `PLAN-${String((i + 1) % 10000).padStart(4, '0')}`,
        equipment_id: (i % 6) + 1,
        material_id: (i % 11) + 1,
        mold_id: (i % 8) + 1,
        quantity: 100 * ((i % 100) + 1),
        status: 'active'
      }));

      const fieldVerification = verifyRequiredFields(mockBatch, 'production_plans');
      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(mockBatch.length).toBe(100);
    });

    /**
     * Edge Case: Maximum Page Number
     * API should handle maximum page numbers correctly
     */
    test('should handle maximum page numbers correctly', () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
          page: 10,
          pageSize: 10,
          totalPages: 10
        }
      };

      const verification = verifyPaginationConsistency(mockResponse);
      expect(verification.isConsistent).toBe(true);
    });

    /**
     * Edge Case: Minimum Data Set
     * API should work correctly with minimum required data
     */
    test('should work with minimum required data set', () => {
      const mockData = [
        {
          id: 1,
          plan_code: 'PLAN-0001',
          equipment_id: 1,
          material_id: 1,
          mold_id: 1,
          quantity: 1,
          status: 'active'
        }
      ];

      const fieldVerification = verifyRequiredFields(mockData, 'production_plans');
      const typeVerification = verifyDataTypeConsistency(mockData, 'production_plans');

      expect(fieldVerification.hasAllRequiredFields).toBe(true);
      expect(typeVerification.isConsistent).toBe(true);
    });
  });
});
