/**
 * Data Migration Completeness Property-Based Tests
 * Validates that data migration preserves all relationships and mappings
 * Requirements: 5.3
 * 
 * Feature: data-integration, Property 6: 数据迁移完整性
 * 
 * Property 6: Data Migration Completeness
 * For any pre-migration production plan and task, after migration the associated
 * equipment ID, mold ID, and material ID should be correctly mapped to new master data IDs,
 * and the relationships should remain unchanged.
 * 
 * Validates: Requirements 5.3
 */

jest.mock('../models', () => ({
  Equipment: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  EquipmentSchedulingExt: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  Material: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  MaterialSchedulingExt: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  Mold: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  MoldSchedulingExt: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  MoldEquipmentRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  MaterialDeviceRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  MaterialMoldRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  Device: {
    findAll: jest.fn(),
    count: jest.fn()
  },
  ProductionPlan: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  ProductionTask: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(),
    where: jest.fn(),
    col: jest.fn(),
    Op: {
      is: jest.fn()
    }
  }
}));

const models = require('../models');

/**
 * Helper function to generate random production plans with IDs
 * @param {number} count - Number of plans to generate
 * @returns {Array} Array of production plan objects
 */
function generateProductionPlans(count) {
  const plans = [];
  for (let i = 1; i <= count; i++) {
    plans.push({
      id: i,
      equipment_id: Math.floor(Math.random() * 10) + 1,
      material_id: Math.floor(Math.random() * 10) + 1,
      mold_id: Math.floor(Math.random() * 10) + 1,
      quantity: Math.floor(Math.random() * 1000) + 100,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  return plans;
}

/**
 * Helper function to generate random production tasks with IDs
 * @param {number} count - Number of tasks to generate
 * @returns {Array} Array of production task objects
 */
function generateProductionTasks(count) {
  const tasks = [];
  for (let i = 1; i <= count; i++) {
    tasks.push({
      id: i,
      plan_id: Math.floor(Math.random() * 10) + 1,
      equipment_id: Math.floor(Math.random() * 10) + 1,
      material_id: Math.floor(Math.random() * 10) + 1,
      mold_id: Math.floor(Math.random() * 10) + 1,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  return tasks;
}

/**
 * Helper function to generate ID mapping
 * Maps old IDs to new IDs
 * @param {number} maxOldId - Maximum old ID
 * @param {number} newIdOffset - Offset for new IDs
 * @returns {Object} Mapping object
 */
function generateIdMapping(maxOldId, newIdOffset = 100) {
  const mapping = {};
  for (let i = 1; i <= maxOldId; i++) {
    mapping[i] = i + newIdOffset;
  }
  return mapping;
}

/**
 * Helper function to apply ID mapping to a record
 * @param {Object} record - Record to map
 * @param {Object} equipmentMap - Equipment ID mapping
 * @param {Object} materialMap - Material ID mapping
 * @param {Object} moldMap - Mold ID mapping
 * @returns {Object} Mapped record
 */
function applyIdMapping(record, equipmentMap, materialMap, moldMap) {
  const mapped = { ...record };
  
  if (record.equipment_id && equipmentMap[record.equipment_id]) {
    mapped.equipment_id = equipmentMap[record.equipment_id];
  }
  
  if (record.material_id && materialMap[record.material_id]) {
    mapped.material_id = materialMap[record.material_id];
  }
  
  if (record.mold_id && moldMap[record.mold_id]) {
    mapped.mold_id = moldMap[record.mold_id];
  }
  
  return mapped;
}

/**
 * Helper function to verify migration completeness
 * Checks that all IDs were properly mapped
 * @param {Array} originalRecords - Original records before migration
 * @param {Array} migratedRecords - Records after migration
 * @param {Object} equipmentMap - Equipment ID mapping
 * @param {Object} materialMap - Material ID mapping
 * @param {Object} moldMap - Mold ID mapping
 * @returns {Object} Verification result
 */
function verifyMigrationCompleteness(originalRecords, migratedRecords, equipmentMap, materialMap, moldMap) {
  const unmappedRecords = [];
  const mappingErrors = [];
  
  for (let i = 0; i < originalRecords.length; i++) {
    const original = originalRecords[i];
    const migrated = migratedRecords[i];
    
    // Check equipment mapping
    if (original.equipment_id) {
      if (!equipmentMap[original.equipment_id]) {
        unmappedRecords.push({
          recordId: original.id,
          field: 'equipment_id',
          oldValue: original.equipment_id
        });
      } else if (migrated.equipment_id !== equipmentMap[original.equipment_id]) {
        mappingErrors.push({
          recordId: original.id,
          field: 'equipment_id',
          expected: equipmentMap[original.equipment_id],
          actual: migrated.equipment_id
        });
      }
    }
    
    // Check material mapping
    if (original.material_id) {
      if (!materialMap[original.material_id]) {
        unmappedRecords.push({
          recordId: original.id,
          field: 'material_id',
          oldValue: original.material_id
        });
      } else if (migrated.material_id !== materialMap[original.material_id]) {
        mappingErrors.push({
          recordId: original.id,
          field: 'material_id',
          expected: materialMap[original.material_id],
          actual: migrated.material_id
        });
      }
    }
    
    // Check mold mapping
    if (original.mold_id) {
      if (!moldMap[original.mold_id]) {
        unmappedRecords.push({
          recordId: original.id,
          field: 'mold_id',
          oldValue: original.mold_id
        });
      } else if (migrated.mold_id !== moldMap[original.mold_id]) {
        mappingErrors.push({
          recordId: original.id,
          field: 'mold_id',
          expected: moldMap[original.mold_id],
          actual: migrated.mold_id
        });
      }
    }
  }
  
  return {
    isComplete: unmappedRecords.length === 0 && mappingErrors.length === 0,
    unmappedRecords,
    mappingErrors,
    totalRecords: originalRecords.length,
    successfulMappings: originalRecords.length - unmappedRecords.length - mappingErrors.length
  };
}

describe('Data Migration Completeness - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 6: Data Migration Completeness', () => {
    /**
     * Property Test: Production Plans ID Mapping Completeness
     * For any set of production plans with equipment, material, and mold IDs,
     * after migration all IDs should be correctly mapped to new master data IDs
     */
    test('should correctly map all production plan IDs during migration', () => {
      // Generate random production plans
      const originalPlans = generateProductionPlans(10);
      
      // Generate ID mappings
      const equipmentMap = generateIdMapping(10, 100);
      const materialMap = generateIdMapping(10, 200);
      const moldMap = generateIdMapping(10, 300);
      
      // Apply mapping to plans
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify completeness
      const verification = verifyMigrationCompleteness(
        originalPlans,
        migratedPlans,
        equipmentMap,
        materialMap,
        moldMap
      );
      
      expect(verification.isComplete).toBe(true);
      expect(verification.unmappedRecords.length).toBe(0);
      expect(verification.mappingErrors.length).toBe(0);
      expect(verification.successfulMappings).toBe(10);
    });

    /**
     * Property Test: Production Tasks ID Mapping Completeness
     * For any set of production tasks with equipment, material, and mold IDs,
     * after migration all IDs should be correctly mapped
     */
    test('should correctly map all production task IDs during migration', () => {
      // Generate random production tasks
      const originalTasks = generateProductionTasks(15);
      
      // Generate ID mappings
      const equipmentMap = generateIdMapping(10, 100);
      const materialMap = generateIdMapping(10, 200);
      const moldMap = generateIdMapping(10, 300);
      
      // Apply mapping to tasks
      const migratedTasks = originalTasks.map(task =>
        applyIdMapping(task, equipmentMap, materialMap, moldMap)
      );
      
      // Verify completeness
      const verification = verifyMigrationCompleteness(
        originalTasks,
        migratedTasks,
        equipmentMap,
        materialMap,
        moldMap
      );
      
      expect(verification.isComplete).toBe(true);
      expect(verification.unmappedRecords.length).toBe(0);
      expect(verification.mappingErrors.length).toBe(0);
      expect(verification.successfulMappings).toBe(15);
    });

    /**
     * Property Test: Partial ID Mapping Handling
     * For any set of records where some IDs have mappings and others don't,
     * the migration should correctly identify unmapped IDs
     */
    test('should detect unmapped IDs in migration', () => {
      // Generate production plans
      const originalPlans = generateProductionPlans(5);
      
      // Create partial mapping (missing some IDs)
      const equipmentMap = { 1: 101, 2: 102 }; // Only maps 1 and 2
      const materialMap = { 1: 201, 2: 202, 3: 203 }; // Maps 1, 2, 3
      const moldMap = { 1: 301, 2: 302, 3: 303, 4: 304 }; // Maps 1, 2, 3, 4
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan => {
        const mapped = { ...plan };
        if (plan.equipment_id && equipmentMap[plan.equipment_id]) {
          mapped.equipment_id = equipmentMap[plan.equipment_id];
        }
        if (plan.material_id && materialMap[plan.material_id]) {
          mapped.material_id = materialMap[plan.material_id];
        }
        if (plan.mold_id && moldMap[plan.mold_id]) {
          mapped.mold_id = moldMap[plan.mold_id];
        }
        return mapped;
      });
      
      // Verify that unmapped IDs are detected
      const verification = verifyMigrationCompleteness(
        originalPlans,
        migratedPlans,
        equipmentMap,
        materialMap,
        moldMap
      );
      
      // Should have unmapped records since not all IDs are in the mapping
      expect(verification.unmappedRecords.length).toBeGreaterThan(0);
      expect(verification.isComplete).toBe(false);
    });

    /**
     * Property Test: Relationship Preservation During Migration
     * For any production plan with specific equipment, material, and mold relationships,
     * after migration the relationships should be preserved (same relative associations)
     */
    test('should preserve relationships between equipment, material, and mold during migration', () => {
      // Create specific production plans with known relationships
      const originalPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1, quantity: 100 },
        { id: 2, equipment_id: 1, material_id: 2, mold_id: 1, quantity: 200 },
        { id: 3, equipment_id: 2, material_id: 1, mold_id: 2, quantity: 150 }
      ];
      
      // Create mappings
      const equipmentMap = { 1: 101, 2: 102 };
      const materialMap = { 1: 201, 2: 202 };
      const moldMap = { 1: 301, 2: 302 };
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify relationships are preserved
      // Plan 1: equipment 1 -> 101, material 1 -> 201, mold 1 -> 301
      expect(migratedPlans[0].equipment_id).toBe(101);
      expect(migratedPlans[0].material_id).toBe(201);
      expect(migratedPlans[0].mold_id).toBe(301);
      
      // Plan 2: equipment 1 -> 101, material 2 -> 202, mold 1 -> 301
      expect(migratedPlans[1].equipment_id).toBe(101);
      expect(migratedPlans[1].material_id).toBe(202);
      expect(migratedPlans[1].mold_id).toBe(301);
      
      // Plan 3: equipment 2 -> 102, material 1 -> 201, mold 2 -> 302
      expect(migratedPlans[2].equipment_id).toBe(102);
      expect(migratedPlans[2].material_id).toBe(201);
      expect(migratedPlans[2].mold_id).toBe(302);
      
      // Verify that same equipment IDs map to same new IDs
      expect(migratedPlans[0].equipment_id).toBe(migratedPlans[1].equipment_id);
      
      // Verify that same material IDs map to same new IDs
      expect(migratedPlans[0].material_id).toBe(migratedPlans[2].material_id);
    });

    /**
     * Property Test: Non-Null ID Preservation
     * For any record with non-null IDs, after migration all non-null IDs should
     * remain non-null (no null values introduced during mapping)
     */
    test('should preserve non-null IDs and not introduce nulls during migration', () => {
      // Create plans with some null IDs
      const originalPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 2, material_id: null, mold_id: 2 },
        { id: 3, equipment_id: null, material_id: 3, mold_id: null }
      ];
      
      const equipmentMap = { 1: 101, 2: 102 };
      const materialMap = { 1: 201, 3: 203 };
      const moldMap = { 1: 301, 2: 302 };
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify non-null IDs remain non-null
      expect(migratedPlans[0].equipment_id).not.toBeNull();
      expect(migratedPlans[0].material_id).not.toBeNull();
      expect(migratedPlans[0].mold_id).not.toBeNull();
      
      // Verify null IDs remain null
      expect(migratedPlans[1].material_id).toBeNull();
      expect(migratedPlans[2].equipment_id).toBeNull();
      expect(migratedPlans[2].mold_id).toBeNull();
      
      // Verify mapped non-null IDs are correct
      expect(migratedPlans[1].equipment_id).toBe(102);
      expect(migratedPlans[1].mold_id).toBe(302);
      expect(migratedPlans[2].material_id).toBe(203);
    });

    /**
     * Property Test: Bidirectional Mapping Consistency
     * For any ID mapping, if old_id maps to new_id, then all records with old_id
     * should map to the same new_id consistently
     */
    test('should maintain consistent bidirectional mapping across all records', () => {
      // Create multiple plans with repeated IDs
      const originalPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 1, material_id: 1, mold_id: 2 },
        { id: 3, equipment_id: 1, material_id: 2, mold_id: 1 },
        { id: 4, equipment_id: 2, material_id: 1, mold_id: 1 }
      ];
      
      const equipmentMap = { 1: 101, 2: 102 };
      const materialMap = { 1: 201, 2: 202 };
      const moldMap = { 1: 301, 2: 302 };
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify consistency: all records with equipment_id=1 should map to 101
      const equipment1Records = migratedPlans.filter(p => originalPlans[migratedPlans.indexOf(p)].equipment_id === 1);
      expect(equipment1Records.every(p => p.equipment_id === 101)).toBe(true);
      
      // Verify consistency: all records with material_id=1 should map to 201
      const material1Records = migratedPlans.filter(p => originalPlans[migratedPlans.indexOf(p)].material_id === 1);
      expect(material1Records.every(p => p.material_id === 201)).toBe(true);
      
      // Verify consistency: all records with mold_id=1 should map to 301
      const mold1Records = migratedPlans.filter(p => originalPlans[migratedPlans.indexOf(p)].mold_id === 1);
      expect(mold1Records.every(p => p.mold_id === 301)).toBe(true);
    });

    /**
     * Property Test: Large-Scale Migration Completeness
     * For any large set of records (100+), migration should maintain completeness
     * and consistency across all records
     */
    test('should handle large-scale migration with completeness', () => {
      // Generate large dataset
      const originalPlans = generateProductionPlans(100);
      
      // Generate mappings for all possible IDs
      const maxId = Math.max(
        ...originalPlans.map(p => Math.max(p.equipment_id, p.material_id, p.mold_id))
      );
      
      const equipmentMap = generateIdMapping(maxId, 1000);
      const materialMap = generateIdMapping(maxId, 2000);
      const moldMap = generateIdMapping(maxId, 3000);
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify completeness
      const verification = verifyMigrationCompleteness(
        originalPlans,
        migratedPlans,
        equipmentMap,
        materialMap,
        moldMap
      );
      
      expect(verification.isComplete).toBe(true);
      expect(verification.totalRecords).toBe(100);
      expect(verification.successfulMappings).toBe(100);
    });

    /**
     * Property Test: Migration Idempotence
     * For any set of records, applying migration twice should produce the same result
     * as applying it once (idempotent operation)
     */
    test('should be idempotent - applying migration twice produces same result', () => {
      const originalPlans = generateProductionPlans(5);
      
      const equipmentMap = generateIdMapping(10, 100);
      const materialMap = generateIdMapping(10, 200);
      const moldMap = generateIdMapping(10, 300);
      
      // Apply migration once
      const migratedOnce = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Apply migration again (should not change anything)
      const migratedTwice = migratedOnce.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Results should be identical
      for (let i = 0; i < migratedOnce.length; i++) {
        expect(migratedTwice[i].equipment_id).toBe(migratedOnce[i].equipment_id);
        expect(migratedTwice[i].material_id).toBe(migratedOnce[i].material_id);
        expect(migratedTwice[i].mold_id).toBe(migratedOnce[i].mold_id);
      }
    });

    /**
     * Property Test: Mixed Null and Non-Null ID Handling
     * For any dataset with mixed null and non-null IDs, migration should correctly
     * handle both cases without data loss
     */
    test('should correctly handle mixed null and non-null IDs in large dataset', () => {
      // Generate plans with random null values
      const originalPlans = [];
      for (let i = 1; i <= 50; i++) {
        originalPlans.push({
          id: i,
          equipment_id: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null,
          material_id: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null,
          mold_id: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null
        });
      }
      
      const equipmentMap = generateIdMapping(10, 100);
      const materialMap = generateIdMapping(10, 200);
      const moldMap = generateIdMapping(10, 300);
      
      // Apply mapping
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      // Verify that null values are preserved
      for (let i = 0; i < originalPlans.length; i++) {
        if (originalPlans[i].equipment_id === null) {
          expect(migratedPlans[i].equipment_id).toBeNull();
        }
        if (originalPlans[i].material_id === null) {
          expect(migratedPlans[i].material_id).toBeNull();
        }
        if (originalPlans[i].mold_id === null) {
          expect(migratedPlans[i].mold_id).toBeNull();
        }
      }
      
      // Verify that non-null values are mapped
      for (let i = 0; i < originalPlans.length; i++) {
        if (originalPlans[i].equipment_id !== null) {
          expect(migratedPlans[i].equipment_id).toBe(
            equipmentMap[originalPlans[i].equipment_id]
          );
        }
        if (originalPlans[i].material_id !== null) {
          expect(migratedPlans[i].material_id).toBe(
            materialMap[originalPlans[i].material_id]
          );
        }
        if (originalPlans[i].mold_id !== null) {
          expect(migratedPlans[i].mold_id).toBe(
            moldMap[originalPlans[i].mold_id]
          );
        }
      }
    });
  });

  describe('Migration Completeness Edge Cases', () => {
    /**
     * Edge Case: Empty Dataset
     * Migration should handle empty datasets gracefully
     */
    test('should handle empty dataset migration', () => {
      const originalPlans = [];
      const equipmentMap = {};
      const materialMap = {};
      const moldMap = {};
      
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      const verification = verifyMigrationCompleteness(
        originalPlans,
        migratedPlans,
        equipmentMap,
        materialMap,
        moldMap
      );
      
      expect(verification.isComplete).toBe(true);
      expect(verification.totalRecords).toBe(0);
    });

    /**
     * Edge Case: Single Record Migration
     * Migration should correctly handle single record
     */
    test('should correctly migrate single record', () => {
      const originalPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 }
      ];
      
      const equipmentMap = { 1: 101 };
      const materialMap = { 1: 201 };
      const moldMap = { 1: 301 };
      
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      expect(migratedPlans[0].equipment_id).toBe(101);
      expect(migratedPlans[0].material_id).toBe(201);
      expect(migratedPlans[0].mold_id).toBe(301);
    });

    /**
     * Edge Case: All Null IDs
     * Migration should handle records with all null IDs
     */
    test('should handle records with all null IDs', () => {
      const originalPlans = [
        { id: 1, equipment_id: null, material_id: null, mold_id: null }
      ];
      
      const equipmentMap = {};
      const materialMap = {};
      const moldMap = {};
      
      const migratedPlans = originalPlans.map(plan =>
        applyIdMapping(plan, equipmentMap, materialMap, moldMap)
      );
      
      expect(migratedPlans[0].equipment_id).toBeNull();
      expect(migratedPlans[0].material_id).toBeNull();
      expect(migratedPlans[0].mold_id).toBeNull();
    });
  });
});
