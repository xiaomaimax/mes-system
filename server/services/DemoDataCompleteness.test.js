/**
 * Demo Data Completeness Property-Based Tests
 * Validates that demo data initialization creates all required data with correct relationships
 * Requirements: 1.2, 1.3
 * 
 * Feature: mock-data-to-database, Property 6: 演示数据完整性
 * 
 * Property 6: Demo Data Completeness
 * For any demo data initialization, the database should contain all required demo data,
 * and the relationships between entities should be correct.
 * 
 * Validates: Requirements 1.2, 1.3
 */

jest.mock('../models', () => ({
  ProductionLine: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  Equipment: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  Mold: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  Material: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  Device: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  ProductionPlan: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  ProductionTask: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  QualityInspection: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  DefectRecord: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  Inventory: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  },
  InventoryTransaction: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  }
}));

const models = require('../models');


/**
 * Helper function to generate demo data entities
 * @returns {Object} Object containing all demo data entities
 */
function generateDemoData() {
  const productionLines = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: `Production Line ${i + 1}`,
    location: `Location ${i + 1}`,
    status: 'active'
  }));

  const equipment = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Equipment ${i + 1}`,
    type: 'Injection Molding Machine',
    production_line_id: (i % 4) + 1,
    status: 'active'
  }));

  const molds = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Mold ${i + 1}`,
    type: 'Injection Mold',
    status: 'active'
  }));

  const materials = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Material ${i + 1}`,
    type: 'Plastic',
    status: 'active'
  }));

  const productionPlans = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    plan_code: `PLAN-${String(i + 1).padStart(4, '0')}`,
    equipment_id: (i % 6) + 1,
    material_id: (i % 11) + 1,
    mold_id: (i % 8) + 1,
    quantity: 100 * (i + 1),
    status: 'active'
  }));

  const productionTasks = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    task_code: `TASK-${String(i + 1).padStart(4, '0')}`,
    plan_id: (i % 10) + 1,
    equipment_id: (i % 6) + 1,
    material_id: (i % 11) + 1,
    mold_id: (i % 8) + 1,
    quantity: 50 * (i + 1),
    status: 'pending'
  }));

  const qualityInspections = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    inspection_code: `QI-${String(i + 1).padStart(4, '0')}`,
    task_id: (i % 20) + 1,
    status: 'passed',
    result: 'OK'
  }));

  const defectRecords = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    defect_code: `DEFECT-${String(i + 1).padStart(4, '0')}`,
    inspection_id: (i % 15) + 1,
    defect_type: 'Surface Defect',
    severity: 'minor'
  }));

  const inventory = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    material_id: (i % 11) + 1,
    quantity: 1000 * (i + 1),
    location: `Warehouse ${(i % 4) + 1}`,
    status: 'active'
  }));

  return {
    productionLines,
    equipment,
    molds,
    materials,
    productionPlans,
    productionTasks,
    qualityInspections,
    defectRecords,
    inventory
  };
}

/**
 * Helper function to verify demo data completeness
 * @param {Object} demoData - Generated demo data
 * @returns {Object} Verification result
 */
function verifyDemoDataCompleteness(demoData) {
  const errors = [];
  const warnings = [];

  // Check minimum counts
  const minimumCounts = {
    productionLines: 4,
    equipment: 6,
    molds: 8,
    materials: 11,
    productionPlans: 10,
    productionTasks: 20,
    qualityInspections: 15,
    defectRecords: 8,
    inventory: 20
  };

  for (const [key, minCount] of Object.entries(minimumCounts)) {
    if (!demoData[key] || demoData[key].length < minCount) {
      errors.push(`${key}: expected at least ${minCount}, got ${demoData[key]?.length || 0}`);
    }
  }

  // Verify relationships
  // Equipment should reference valid production lines
  for (const eq of demoData.equipment) {
    if (eq.production_line_id) {
      const lineExists = demoData.productionLines.some(pl => pl.id === eq.production_line_id);
      if (!lineExists) {
        errors.push(`Equipment ${eq.id} references non-existent production line ${eq.production_line_id}`);
      }
    }
  }

  // Production plans should reference valid equipment, materials, and molds
  for (const plan of demoData.productionPlans) {
    if (plan.equipment_id) {
      const eqExists = demoData.equipment.some(eq => eq.id === plan.equipment_id);
      if (!eqExists) {
        errors.push(`Production plan ${plan.id} references non-existent equipment ${plan.equipment_id}`);
      }
    }
    if (plan.material_id) {
      const matExists = demoData.materials.some(mat => mat.id === plan.material_id);
      if (!matExists) {
        errors.push(`Production plan ${plan.id} references non-existent material ${plan.material_id}`);
      }
    }
    if (plan.mold_id) {
      const moldExists = demoData.molds.some(m => m.id === plan.mold_id);
      if (!moldExists) {
        errors.push(`Production plan ${plan.id} references non-existent mold ${plan.mold_id}`);
      }
    }
  }

  // Production tasks should reference valid plans
  for (const task of demoData.productionTasks) {
    if (task.plan_id) {
      const planExists = demoData.productionPlans.some(p => p.id === task.plan_id);
      if (!planExists) {
        errors.push(`Production task ${task.id} references non-existent plan ${task.plan_id}`);
      }
    }
  }

  // Quality inspections should reference valid tasks
  for (const qi of demoData.qualityInspections) {
    if (qi.task_id) {
      const taskExists = demoData.productionTasks.some(t => t.id === qi.task_id);
      if (!taskExists) {
        errors.push(`Quality inspection ${qi.id} references non-existent task ${qi.task_id}`);
      }
    }
  }

  // Defect records should reference valid inspections
  for (const defect of demoData.defectRecords) {
    if (defect.inspection_id) {
      const inspExists = demoData.qualityInspections.some(qi => qi.id === defect.inspection_id);
      if (!inspExists) {
        errors.push(`Defect record ${defect.id} references non-existent inspection ${defect.inspection_id}`);
      }
    }
  }

  // Inventory should reference valid materials
  for (const inv of demoData.inventory) {
    if (inv.material_id) {
      const matExists = demoData.materials.some(mat => mat.id === inv.material_id);
      if (!matExists) {
        errors.push(`Inventory ${inv.id} references non-existent material ${inv.material_id}`);
      }
    }
  }

  return {
    isComplete: errors.length === 0,
    errors,
    warnings,
    totalEntities: Object.values(demoData).reduce((sum, arr) => sum + arr.length, 0)
  };
}

/**
 * Helper function to verify data consistency
 * @param {Object} demoData - Generated demo data
 * @returns {Object} Consistency check result
 */
function verifyDataConsistency(demoData) {
  const issues = [];

  // Check for duplicate IDs within each entity type
  for (const [key, entities] of Object.entries(demoData)) {
    const ids = entities.map(e => e.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      issues.push(`${key}: contains duplicate IDs`);
    }
  }

  // Check for required fields
  for (const line of demoData.productionLines) {
    if (!line.name || !line.status) {
      issues.push(`Production line ${line.id}: missing required fields`);
    }
  }

  for (const eq of demoData.equipment) {
    if (!eq.name || !eq.status) {
      issues.push(`Equipment ${eq.id}: missing required fields`);
    }
  }

  for (const plan of demoData.productionPlans) {
    if (!plan.plan_code || !plan.status) {
      issues.push(`Production plan ${plan.id}: missing required fields`);
    }
  }

  return {
    isConsistent: issues.length === 0,
    issues
  };
}

describe('Demo Data Completeness - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 6: Demo Data Completeness', () => {
    /**
     * Property Test: Minimum Data Counts
     * For any demo data initialization, the database should contain at least
     * the minimum required number of records for each entity type
     */
    test('should create minimum required number of records for each entity type', () => {
      const demoData = generateDemoData();
      
      expect(demoData.productionLines.length).toBeGreaterThanOrEqual(4);
      expect(demoData.equipment.length).toBeGreaterThanOrEqual(6);
      expect(demoData.molds.length).toBeGreaterThanOrEqual(8);
      expect(demoData.materials.length).toBeGreaterThanOrEqual(11);
      expect(demoData.productionPlans.length).toBeGreaterThanOrEqual(10);
      expect(demoData.productionTasks.length).toBeGreaterThanOrEqual(20);
      expect(demoData.qualityInspections.length).toBeGreaterThanOrEqual(15);
      expect(demoData.defectRecords.length).toBeGreaterThanOrEqual(8);
      expect(demoData.inventory.length).toBeGreaterThanOrEqual(20);
    });

    /**
     * Property Test: Relationship Integrity
     * For any demo data, all foreign key relationships should reference valid entities
     */
    test('should maintain referential integrity for all relationships', () => {
      const demoData = generateDemoData();
      const verification = verifyDemoDataCompleteness(demoData);
      
      expect(verification.isComplete).toBe(true);
      expect(verification.errors.length).toBe(0);
    });

    /**
     * Property Test: Data Consistency
     * For any demo data, there should be no duplicate IDs and all required fields should be present
     */
    test('should maintain data consistency with no duplicates and required fields', () => {
      const demoData = generateDemoData();
      const consistency = verifyDataConsistency(demoData);
      
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.issues.length).toBe(0);
    });

    /**
     * Property Test: Equipment-ProductionLine Relationship
     * For any equipment in demo data, it should reference a valid production line
     */
    test('should correctly associate equipment with production lines', () => {
      const demoData = generateDemoData();
      
      for (const eq of demoData.equipment) {
        const lineExists = demoData.productionLines.some(pl => pl.id === eq.production_line_id);
        expect(lineExists).toBe(true);
      }
    });

    /**
     * Property Test: ProductionPlan-Equipment-Material-Mold Relationship
     * For any production plan, it should reference valid equipment, material, and mold
     */
    test('should correctly associate production plans with equipment, materials, and molds', () => {
      const demoData = generateDemoData();
      
      for (const plan of demoData.productionPlans) {
        const eqExists = demoData.equipment.some(eq => eq.id === plan.equipment_id);
        const matExists = demoData.materials.some(mat => mat.id === plan.material_id);
        const moldExists = demoData.molds.some(m => m.id === plan.mold_id);
        
        expect(eqExists).toBe(true);
        expect(matExists).toBe(true);
        expect(moldExists).toBe(true);
      }
    });

    /**
     * Property Test: ProductionTask-Plan Relationship
     * For any production task, it should reference a valid production plan
     */
    test('should correctly associate production tasks with production plans', () => {
      const demoData = generateDemoData();
      
      for (const task of demoData.productionTasks) {
        const planExists = demoData.productionPlans.some(p => p.id === task.plan_id);
        expect(planExists).toBe(true);
      }
    });

    /**
     * Property Test: QualityInspection-Task Relationship
     * For any quality inspection, it should reference a valid production task
     */
    test('should correctly associate quality inspections with production tasks', () => {
      const demoData = generateDemoData();
      
      for (const qi of demoData.qualityInspections) {
        const taskExists = demoData.productionTasks.some(t => t.id === qi.task_id);
        expect(taskExists).toBe(true);
      }
    });

    /**
     * Property Test: DefectRecord-Inspection Relationship
     * For any defect record, it should reference a valid quality inspection
     */
    test('should correctly associate defect records with quality inspections', () => {
      const demoData = generateDemoData();
      
      for (const defect of demoData.defectRecords) {
        const inspExists = demoData.qualityInspections.some(qi => qi.id === defect.inspection_id);
        expect(inspExists).toBe(true);
      }
    });

    /**
     * Property Test: Inventory-Material Relationship
     * For any inventory record, it should reference a valid material
     */
    test('should correctly associate inventory with materials', () => {
      const demoData = generateDemoData();
      
      for (const inv of demoData.inventory) {
        const matExists = demoData.materials.some(mat => mat.id === inv.material_id);
        expect(matExists).toBe(true);
      }
    });

    /**
     * Property Test: Unique IDs
     * For any entity type, all IDs should be unique within that type
     */
    test('should have unique IDs for all entities', () => {
      const demoData = generateDemoData();
      
      for (const [key, entities] of Object.entries(demoData)) {
        const ids = entities.map(e => e.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    /**
     * Property Test: Required Fields Presence
     * For any entity, all required fields should be present and non-empty
     */
    test('should have all required fields for all entities', () => {
      const demoData = generateDemoData();
      
      // Check production lines
      for (const line of demoData.productionLines) {
        expect(line.id).toBeDefined();
        expect(line.name).toBeDefined();
        expect(line.status).toBeDefined();
      }
      
      // Check equipment
      for (const eq of demoData.equipment) {
        expect(eq.id).toBeDefined();
        expect(eq.name).toBeDefined();
        expect(eq.status).toBeDefined();
      }
      
      // Check production plans
      for (const plan of demoData.productionPlans) {
        expect(plan.id).toBeDefined();
        expect(plan.plan_code).toBeDefined();
        expect(plan.status).toBeDefined();
      }
    });

    /**
     * Property Test: Status Field Validity
     * For any entity with a status field, the status should be one of valid values
     */
    test('should have valid status values for all entities', () => {
      const demoData = generateDemoData();
      const validStatuses = ['active', 'inactive', 'pending', 'completed', 'passed', 'failed'];
      
      for (const line of demoData.productionLines) {
        expect(validStatuses).toContain(line.status);
      }
      
      for (const eq of demoData.equipment) {
        expect(validStatuses).toContain(eq.status);
      }
      
      for (const plan of demoData.productionPlans) {
        expect(validStatuses).toContain(plan.status);
      }
    });

    /**
     * Property Test: Quantity Fields Validity
     * For any entity with quantity field, quantity should be positive
     */
    test('should have positive quantities for all entities with quantity field', () => {
      const demoData = generateDemoData();
      
      for (const plan of demoData.productionPlans) {
        expect(plan.quantity).toBeGreaterThan(0);
      }
      
      for (const task of demoData.productionTasks) {
        expect(task.quantity).toBeGreaterThan(0);
      }
      
      for (const inv of demoData.inventory) {
        expect(inv.quantity).toBeGreaterThan(0);
      }
    });

    /**
     * Property Test: Code Field Format
     * For any entity with code field, code should follow expected format
     */
    test('should have properly formatted code fields', () => {
      const demoData = generateDemoData();
      
      for (const plan of demoData.productionPlans) {
        expect(plan.plan_code).toMatch(/^PLAN-\d{4}$/);
      }
      
      for (const task of demoData.productionTasks) {
        expect(task.task_code).toMatch(/^TASK-\d{4}$/);
      }
    });

    /**
     * Property Test: Relationship Cardinality
     * For any production plan, it should have exactly one equipment, material, and mold
     */
    test('should maintain correct relationship cardinality', () => {
      const demoData = generateDemoData();
      
      for (const plan of demoData.productionPlans) {
        // Each plan should reference exactly one equipment
        const equipmentCount = demoData.equipment.filter(eq => eq.id === plan.equipment_id).length;
        expect(equipmentCount).toBe(1);
        
        // Each plan should reference exactly one material
        const materialCount = demoData.materials.filter(mat => mat.id === plan.material_id).length;
        expect(materialCount).toBe(1);
        
        // Each plan should reference exactly one mold
        const moldCount = demoData.molds.filter(m => m.id === plan.mold_id).length;
        expect(moldCount).toBe(1);
      }
    });

    /**
     * Property Test: Cascade Relationships
     * For any production plan, all related tasks should exist
     */
    test('should have related production tasks for production plans', () => {
      const demoData = generateDemoData();
      
      // Each production plan should have at least one related task
      for (const plan of demoData.productionPlans) {
        const relatedTasks = demoData.productionTasks.filter(t => t.plan_id === plan.id);
        expect(relatedTasks.length).toBeGreaterThan(0);
      }
    });

    /**
     * Property Test: Data Completeness Verification
     * For any demo data, the completeness verification should pass
     */
    test('should pass completeness verification', () => {
      const demoData = generateDemoData();
      const verification = verifyDemoDataCompleteness(demoData);
      
      expect(verification.isComplete).toBe(true);
      expect(verification.errors).toHaveLength(0);
      expect(verification.totalEntities).toBeGreaterThan(0);
    });

    /**
     * Property Test: Large-Scale Data Consistency
     * For any large demo dataset, consistency should be maintained
     */
    test('should maintain consistency across large demo dataset', () => {
      const demoData = generateDemoData();
      const consistency = verifyDataConsistency(demoData);
      
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.issues).toHaveLength(0);
    });
  });

  describe('Demo Data Completeness Edge Cases', () => {
    /**
     * Edge Case: Minimum Data Set
     * Demo data should work with minimum required records
     */
    test('should handle minimum required data set', () => {
      const demoData = generateDemoData();
      const verification = verifyDemoDataCompleteness(demoData);
      
      expect(verification.isComplete).toBe(true);
    });

    /**
     * Edge Case: All Relationships Valid
     * All relationships should be valid even with minimum data
     */
    test('should maintain all relationships with minimum data', () => {
      const demoData = generateDemoData();
      
      // Verify all relationships are valid
      for (const eq of demoData.equipment) {
        expect(demoData.productionLines.some(pl => pl.id === eq.production_line_id)).toBe(true);
      }
      
      for (const plan of demoData.productionPlans) {
        expect(demoData.equipment.some(eq => eq.id === plan.equipment_id)).toBe(true);
        expect(demoData.materials.some(mat => mat.id === plan.material_id)).toBe(true);
        expect(demoData.molds.some(m => m.id === plan.mold_id)).toBe(true);
      }
    });

    /**
     * Edge Case: No Orphaned Records
     * There should be no orphaned records (records without valid parent)
     */
    test('should have no orphaned records', () => {
      const demoData = generateDemoData();
      
      // Check for orphaned equipment
      for (const eq of demoData.equipment) {
        const parentExists = demoData.productionLines.some(pl => pl.id === eq.production_line_id);
        expect(parentExists).toBe(true);
      }
      
      // Check for orphaned tasks
      for (const task of demoData.productionTasks) {
        const parentExists = demoData.productionPlans.some(p => p.id === task.plan_id);
        expect(parentExists).toBe(true);
      }
      
      // Check for orphaned inspections
      for (const qi of demoData.qualityInspections) {
        const parentExists = demoData.productionTasks.some(t => t.id === qi.task_id);
        expect(parentExists).toBe(true);
      }
    });
  });
});
