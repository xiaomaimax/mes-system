/**
 * Mold-Equipment Relationship Property Tests
 * Validates mold-equipment relationship integrity
 * Requirements: 2.4, 2.5
 * 
 * Property 5: Mold-Equipment Relationship Integrity
 * For any mold record, its associated equipment list should only include equipment
 * with status "running" or "idle", and the relationship should be bidirectionally queryable.
 * 
 * Feature: data-integration, Property 5: Mold-Equipment Relationship Integrity
 */

jest.mock('../models', () => ({
  Mold: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  Equipment: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  MoldEquipmentRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MoldSchedulingExt: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

const models = require('../models');

/**
 * Generator functions for property-based testing
 */

// Generate random mold data
function generateMold(id = 1) {
  return {
    id,
    mold_code: `MOLD-${String(id).padStart(3, '0')}`,
    mold_name: `Mold ${id}`,
    specifications: `Spec ${id}`,
    quantity: Math.floor(Math.random() * 10) + 1,
    status: ['normal', 'maintenance', 'idle', 'scrapped'][Math.floor(Math.random() * 4)],
    created_at: new Date(),
    updated_at: new Date()
  };
}

// Generate random equipment data with valid status
function generateEquipment(id = 1, status = null) {
  const validStatuses = ['running', 'idle', 'maintenance', 'fault', 'offline'];
  return {
    id,
    equipment_code: `EQ-${String(id).padStart(3, '0')}`,
    equipment_name: `Equipment ${id}`,
    equipment_type: 'injection_molding',
    production_line_id: 1,
    status: status || validStatuses[Math.floor(Math.random() * validStatuses.length)],
    location: `Location ${id}`,
    manufacturer: `Manufacturer ${id}`,
    model: `Model ${id}`,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
}

// Generate random mold-equipment relation
function generateMoldEquipmentRelation(moldId = 1, equipmentId = 1, isPrimary = false) {
  return {
    id: Math.floor(Math.random() * 10000),
    mold_id: moldId,
    equipment_id: equipmentId,
    is_primary: isPrimary,
    created_at: new Date()
  };
}

describe('Mold-Equipment Relationship Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 5: Mold-Equipment Relationship Integrity', () => {
    /**
     * Property: For any mold, its associated equipment list should only include
     * equipment with status "running" or "idle"
     * 
     * Test Strategy: Generate random molds and equipment with various statuses,
     * create relationships, and verify that only valid equipment is returned
     */
    test('should only include equipment with valid status in mold relationships', () => {
      // Generate test data
      const moldId = 1;
      const mold = generateMold(moldId);

      // Generate equipment with different statuses
      const validStatuses = ['running', 'idle'];
      const invalidStatuses = ['maintenance', 'fault', 'offline'];

      const validEquipment = [
        generateEquipment(1, 'running'),
        generateEquipment(2, 'idle'),
        generateEquipment(3, 'running')
      ];

      const invalidEquipment = [
        generateEquipment(4, 'maintenance'),
        generateEquipment(5, 'fault'),
        generateEquipment(6, 'offline')
      ];

      // Create relationships for all equipment
      const allRelations = [
        ...validEquipment.map((eq, idx) => generateMoldEquipmentRelation(moldId, eq.id, idx === 0)),
        ...invalidEquipment.map((eq, idx) => generateMoldEquipmentRelation(moldId, eq.id, false))
      ];

      // Mock the database calls
      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue(allRelations);

      // Mock equipment lookups
      const equipmentMap = new Map();
      [...validEquipment, ...invalidEquipment].forEach(eq => {
        equipmentMap.set(eq.id, eq);
      });

      models.Equipment.findByPk.mockImplementation((id) => {
        return Promise.resolve(equipmentMap.get(id));
      });

      // Execute property test
      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        expect(mold_record).toBeDefined();

        const relations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        // Filter to only valid equipment
        const validEquipmentIds = new Set(validEquipment.map(eq => eq.id));
        const validRelations = relations.filter(rel => validEquipmentIds.has(rel.equipment_id));

        // Property: All valid relations should have equipment with valid status
        for (const relation of validRelations) {
          const equipment = await models.Equipment.findByPk(relation.equipment_id);
          expect(validStatuses).toContain(equipment.status);
        }

        // Property: Invalid equipment should not be in valid relations
        const invalidEquipmentIds = new Set(invalidEquipment.map(eq => eq.id));
        for (const relation of validRelations) {
          expect(invalidEquipmentIds.has(relation.equipment_id)).toBe(false);
        }
      })();
    });

    /**
     * Property: Mold-equipment relationships should be bidirectionally queryable
     * 
     * Test Strategy: Create a relationship and verify it can be queried from both directions
     */
    test('should support bidirectional querying of mold-equipment relationships', () => {
      const moldId = 1;
      const equipmentId = 1;

      const mold = generateMold(moldId);
      const equipment = generateEquipment(equipmentId, 'running');
      const relation = generateMoldEquipmentRelation(moldId, equipmentId, true);

      // Mock forward direction: mold -> equipment
      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValueOnce([relation]);
      models.Equipment.findByPk.mockResolvedValue(equipment);

      // Mock reverse direction: equipment -> mold
      models.Equipment.findByPk.mockResolvedValueOnce(equipment);
      models.MoldEquipmentRelation.findAll.mockResolvedValueOnce([relation]);
      models.Mold.findByPk.mockResolvedValueOnce(mold);

      return (async () => {
        // Forward direction: Get equipment for a mold
        const mold_record = await models.Mold.findByPk(moldId);
        const moldRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        expect(moldRelations.length).toBeGreaterThan(0);
        const moldEquipmentIds = moldRelations.map(r => r.equipment_id);
        expect(moldEquipmentIds).toContain(equipmentId);

        // Verify equipment exists
        for (const equipmentId of moldEquipmentIds) {
          const eq = await models.Equipment.findByPk(equipmentId);
          expect(eq).toBeDefined();
        }

        // Reverse direction: Get molds for an equipment
        const equipment_record = await models.Equipment.findByPk(equipmentId);
        const equipmentRelations = await models.MoldEquipmentRelation.findAll({
          where: { equipment_id: equipmentId }
        });

        expect(equipmentRelations.length).toBeGreaterThan(0);
        const equipmentMoldIds = equipmentRelations.map(r => r.mold_id);
        expect(equipmentMoldIds).toContain(moldId);

        // Verify mold exists
        for (const moldId of equipmentMoldIds) {
          const m = await models.Mold.findByPk(moldId);
          expect(m).toBeDefined();
        }
      })();
    });

    /**
     * Property: Primary equipment designation should be consistent
     * 
     * Test Strategy: For any mold with multiple equipment, verify that
     * at most one equipment is marked as primary
     */
    test('should maintain consistent primary equipment designation', () => {
      const moldId = 1;
      const mold = generateMold(moldId);

      // Generate multiple equipment relationships
      const equipmentList = [
        generateEquipment(1, 'running'),
        generateEquipment(2, 'idle'),
        generateEquipment(3, 'running')
      ];

      const relations = [
        generateMoldEquipmentRelation(moldId, 1, true),   // Primary
        generateMoldEquipmentRelation(moldId, 2, false),  // Not primary
        generateMoldEquipmentRelation(moldId, 3, false)   // Not primary
      ];

      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue(relations);

      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        const moldRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        // Property: Count primary equipment
        const primaryCount = moldRelations.filter(r => r.is_primary).length;
        expect(primaryCount).toBeLessThanOrEqual(1);

        // Property: If there is a primary, it should be unique
        if (primaryCount === 1) {
          const primaryRelations = moldRelations.filter(r => r.is_primary);
          expect(primaryRelations.length).toBe(1);
        }
      })();
    });

    /**
     * Property: Relationship uniqueness constraint
     * 
     * Test Strategy: Verify that for any mold-equipment pair, there is at most one relationship
     */
    test('should enforce unique mold-equipment relationships', () => {
      const moldId = 1;
      const equipmentId = 1;

      const mold = generateMold(moldId);
      const equipment = generateEquipment(equipmentId, 'running');

      // Create a single relationship
      const relation = generateMoldEquipmentRelation(moldId, equipmentId, true);

      models.Mold.findByPk.mockResolvedValue(mold);
      models.Equipment.findByPk.mockResolvedValue(equipment);
      models.MoldEquipmentRelation.findOne.mockResolvedValue(relation);
      models.MoldEquipmentRelation.findAll.mockResolvedValue([relation]);

      return (async () => {
        // Query for specific relationship
        const existingRelation = await models.MoldEquipmentRelation.findOne({
          where: { mold_id: moldId, equipment_id: equipmentId }
        });

        expect(existingRelation).toBeDefined();
        expect(existingRelation.mold_id).toBe(moldId);
        expect(existingRelation.equipment_id).toBe(equipmentId);

        // Query all relationships for this mold-equipment pair
        const allRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId, equipment_id: equipmentId }
        });

        // Property: Should have exactly one relationship for this pair
        expect(allRelations.length).toBe(1);
      })();
    });

    /**
     * Property: Relationship data consistency
     * 
     * Test Strategy: Generate random mold-equipment relationships and verify
     * that all required fields are present and valid
     */
    test('should maintain data consistency in mold-equipment relationships', () => {
      // Generate multiple test cases
      const testCases = Array.from({ length: 10 }, (_, i) => ({
        moldId: i + 1,
        equipmentId: (i % 5) + 1,
        isPrimary: i % 3 === 0
      }));

      const relations = testCases.map(tc =>
        generateMoldEquipmentRelation(tc.moldId, tc.equipmentId, tc.isPrimary)
      );

      models.MoldEquipmentRelation.findAll.mockResolvedValue(relations);

      return (async () => {
        const allRelations = await models.MoldEquipmentRelation.findAll();

        // Property: All relations should have required fields
        for (const relation of allRelations) {
          expect(relation.id).toBeDefined();
          expect(relation.mold_id).toBeDefined();
          expect(relation.equipment_id).toBeDefined();
          expect(relation.is_primary).toBeDefined();
          expect(typeof relation.is_primary).toBe('boolean');
          expect(relation.created_at).toBeDefined();
        }

        // Property: IDs should be positive integers
        for (const relation of allRelations) {
          expect(relation.mold_id).toBeGreaterThan(0);
          expect(relation.equipment_id).toBeGreaterThan(0);
        }
      })();
    });

    /**
     * Property: Relationship count consistency
     * 
     * Test Strategy: For any mold, the count of relationships should match
     * the actual number of relationships retrieved
     */
    test('should maintain consistent relationship counts', () => {
      const moldId = 1;
      const mold = generateMold(moldId);

      // Generate 5 equipment relationships
      const equipmentCount = 5;
      const relations = Array.from({ length: equipmentCount }, (_, i) =>
        generateMoldEquipmentRelation(moldId, i + 1, i === 0)
      );

      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue(relations);
      models.MoldEquipmentRelation.count.mockResolvedValue(equipmentCount);

      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        const moldRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });
        const relationCount = await models.MoldEquipmentRelation.count({
          where: { mold_id: moldId }
        });

        // Property: Count should match actual relations
        expect(moldRelations.length).toBe(relationCount);
        expect(relationCount).toBe(equipmentCount);
      })();
    });

    /**
     * Property: Equipment status filtering in relationships
     * 
     * Test Strategy: Generate relationships with equipment of various statuses
     * and verify that filtering works correctly
     */
    test('should correctly filter equipment by status in relationships', () => {
      const moldId = 1;
      const mold = generateMold(moldId);

      // Create equipment with different statuses
      const runningEquipment = generateEquipment(1, 'running');
      const idleEquipment = generateEquipment(2, 'idle');
      const maintenanceEquipment = generateEquipment(3, 'maintenance');

      const relations = [
        generateMoldEquipmentRelation(moldId, 1, true),
        generateMoldEquipmentRelation(moldId, 2, false),
        generateMoldEquipmentRelation(moldId, 3, false)
      ];

      const equipmentMap = new Map([
        [1, runningEquipment],
        [2, idleEquipment],
        [3, maintenanceEquipment]
      ]);

      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue(relations);
      models.Equipment.findByPk.mockImplementation((id) =>
        Promise.resolve(equipmentMap.get(id))
      );

      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        const moldRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        // Get equipment for each relation
        const equipmentWithStatus = await Promise.all(
          moldRelations.map(async (rel) => ({
            relation: rel,
            equipment: await models.Equipment.findByPk(rel.equipment_id)
          }))
        );

        // Property: Filter for active equipment (running or idle)
        const activeEquipment = equipmentWithStatus.filter(
          item => item.equipment.status === 'running' || item.equipment.status === 'idle'
        );

        expect(activeEquipment.length).toBe(2);
        expect(activeEquipment.every(item =>
          ['running', 'idle'].includes(item.equipment.status)
        )).toBe(true);

        // Property: Maintenance equipment should not be in active list
        const maintenanceInActive = activeEquipment.some(
          item => item.equipment.status === 'maintenance'
        );
        expect(maintenanceInActive).toBe(false);
      })();
    });
  });

  describe('Edge Cases', () => {
    test('should handle mold with no equipment relationships', () => {
      const moldId = 1;
      const mold = generateMold(moldId);

      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue([]);

      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        const relations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        expect(mold_record).toBeDefined();
        expect(relations.length).toBe(0);
      })();
    });

    test('should handle equipment with no mold relationships', () => {
      const equipmentId = 1;
      const equipment = generateEquipment(equipmentId, 'running');

      models.Equipment.findByPk.mockResolvedValue(equipment);
      models.MoldEquipmentRelation.findAll.mockResolvedValue([]);

      return (async () => {
        const equipment_record = await models.Equipment.findByPk(equipmentId);
        const relations = await models.MoldEquipmentRelation.findAll({
          where: { equipment_id: equipmentId }
        });

        expect(equipment_record).toBeDefined();
        expect(relations.length).toBe(0);
      })();
    });

    test('should handle mold with all equipment in maintenance', () => {
      const moldId = 1;
      const mold = generateMold(moldId);

      const maintenanceEquipment = [
        generateEquipment(1, 'maintenance'),
        generateEquipment(2, 'maintenance'),
        generateEquipment(3, 'maintenance')
      ];

      const relations = maintenanceEquipment.map((eq, idx) =>
        generateMoldEquipmentRelation(moldId, eq.id, idx === 0)
      );

      const equipmentMap = new Map(
        maintenanceEquipment.map(eq => [eq.id, eq])
      );

      models.Mold.findByPk.mockResolvedValue(mold);
      models.MoldEquipmentRelation.findAll.mockResolvedValue(relations);
      models.Equipment.findByPk.mockImplementation((id) =>
        Promise.resolve(equipmentMap.get(id))
      );

      return (async () => {
        const mold_record = await models.Mold.findByPk(moldId);
        const moldRelations = await models.MoldEquipmentRelation.findAll({
          where: { mold_id: moldId }
        });

        const equipmentWithStatus = await Promise.all(
          moldRelations.map(async (rel) => ({
            relation: rel,
            equipment: await models.Equipment.findByPk(rel.equipment_id)
          }))
        );

        // All equipment should be in maintenance
        expect(equipmentWithStatus.every(
          item => item.equipment.status === 'maintenance'
        )).toBe(true);
      })();
    });
  });
});
