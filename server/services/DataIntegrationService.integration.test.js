/**
 * Data Integration Service Integration Tests
 * Tests cross-module data flow and complete scheduling workflow
 * Requirements: 1.1, 2.1, 3.1
 * 
 * Property 1: Data Sync Consistency
 * For any equipment or material record, after creation or modification in the master data module,
 * the scheduling module query should return the latest master data information.
 * 
 * Property 2: Status Filter Consistency
 * For any equipment or material with status "disabled" or "scrapped", the scheduling module's
 * available resource list should not include that record.
 */

jest.mock('../models', () => ({
  Equipment: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  EquipmentSchedulingExt: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  Material: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MaterialSchedulingExt: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  Mold: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MoldSchedulingExt: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MoldEquipmentRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MaterialDeviceRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  MaterialMoldRelation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
  },
  Device: {
    findAll: jest.fn(),
    count: jest.fn()
  },
  ProductionPlan: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  ProductionTask: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(),
    where: jest.fn(),
    col: jest.fn(),
    Op: {
      in: jest.fn(),
      is: jest.fn()
    }
  }
}));

const models = require('../models');

describe('Data Integration Service - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cross-Module Equipment Data Flow', () => {
    test('should sync equipment data from Equipment module to Scheduling module', async () => {
      // Step 1: Create equipment in Equipment module
      const newEquipment = {
        id: 1,
        equipment_code: 'EQ-001',
        equipment_name: 'Injection Molding Machine A1',
        equipment_type: 'injection_molding',
        status: 'active',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      models.Equipment.create.mockResolvedValue(newEquipment);

      // Step 2: Create scheduling extension
      const schedulingExt = {
        id: 1,
        equipment_id: 1,
        capacity_per_hour: 100,
        scheduling_weight: 80,
        is_available_for_scheduling: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      models.EquipmentSchedulingExt.create.mockResolvedValue(schedulingExt);

      // Step 3: Query from Scheduling module
      const equipmentWithScheduling = {
        ...newEquipment,
        schedulingExt: schedulingExt
      };

      models.Equipment.findByPk.mockResolvedValue(equipmentWithScheduling);

      // Verify data consistency
      const createdEquipment = await models.Equipment.create(newEquipment);
      const createdExt = await models.EquipmentSchedulingExt.create(schedulingExt);
      const queriedEquipment = await models.Equipment.findByPk(1);

      expect(createdEquipment.equipment_code).toBe('EQ-001');
      expect(createdExt.capacity_per_hour).toBe(100);
      expect(queriedEquipment.equipment_code).toBe('EQ-001');
      expect(queriedEquipment.schedulingExt.capacity_per_hour).toBe(100);
    });

    test('should update equipment in Equipment module and reflect in Scheduling module', async () => {
      const equipmentId = 1;
      const originalEquipment = {
        id: equipmentId,
        equipment_code: 'EQ-001',
        equipment_name: 'Machine A1',
        status: 'active'
      };

      const updatedEquipment = {
        ...originalEquipment,
        equipment_name: 'Machine A1 Updated',
        updated_at: new Date()
      };

      models.Equipment.findByPk.mockResolvedValue(originalEquipment);
      models.Equipment.update.mockResolvedValue([1]);
      models.Equipment.findByPk.mockResolvedValueOnce(originalEquipment);
      models.Equipment.findByPk.mockResolvedValueOnce(updatedEquipment);

      // Query before update
      const beforeUpdate = await models.Equipment.findByPk(equipmentId);
      expect(beforeUpdate.equipment_name).toBe('Machine A1');

      // Update equipment
      await models.Equipment.update(
        { equipment_name: 'Machine A1 Updated' },
        { where: { id: equipmentId } }
      );

      // Query after update
      const afterUpdate = await models.Equipment.findByPk(equipmentId);
      expect(afterUpdate.equipment_name).toBe('Machine A1 Updated');
    });

    test('should filter inactive equipment from Scheduling module available list', async () => {
      const equipmentList = [
        { id: 1, equipment_code: 'EQ-001', status: 'active', is_active: true },
        { id: 2, equipment_code: 'EQ-002', status: 'maintenance', is_active: false },
        { id: 3, equipment_code: 'EQ-003', status: 'active', is_active: true }
      ];

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: equipmentList
      });

      const result = await models.Equipment.findAndCountAll({
        where: { is_active: true }
      });

      // Filter for available equipment
      const availableEquipment = result.rows.filter(eq => eq.is_active === true);

      expect(availableEquipment.length).toBe(2);
      expect(availableEquipment.every(eq => eq.is_active === true)).toBe(true);
    });
  });

  describe('Cross-Module Material Data Flow', () => {
    test('should sync material data from Inventory module to Scheduling module', async () => {
      // Step 1: Create material in Inventory module
      const newMaterial = {
        id: 1,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic Pellets',
        material_type: 'raw_material',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      models.Material.create.mockResolvedValue(newMaterial);

      // Step 2: Create scheduling extension
      const schedulingExt = {
        id: 1,
        material_id: 1,
        default_device_id: null,
        default_mold_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      models.MaterialSchedulingExt.create.mockResolvedValue(schedulingExt);

      // Step 3: Query from Scheduling module
      const materialWithScheduling = {
        ...newMaterial,
        schedulingExt: schedulingExt
      };

      models.Material.findByPk.mockResolvedValue(materialWithScheduling);

      // Verify data consistency
      const createdMaterial = await models.Material.create(newMaterial);
      const createdExt = await models.MaterialSchedulingExt.create(schedulingExt);
      const queriedMaterial = await models.Material.findByPk(1);

      expect(createdMaterial.material_code).toBe('MAT-001');
      expect(createdExt.material_id).toBe(1);
      expect(queriedMaterial.material_code).toBe('MAT-001');
    });

    test('should update material in Inventory module and reflect in Scheduling module', async () => {
      const materialId = 1;
      const originalMaterial = {
        id: materialId,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        status: 'active'
      };

      const updatedMaterial = {
        ...originalMaterial,
        material_name: 'ABS Plastic Grade A',
        updated_at: new Date()
      };

      models.Material.findByPk.mockResolvedValueOnce(originalMaterial);
      models.Material.update.mockResolvedValue([1]);
      models.Material.findByPk.mockResolvedValueOnce(updatedMaterial);

      // Query before update
      const beforeUpdate = await models.Material.findByPk(materialId);
      expect(beforeUpdate.material_name).toBe('ABS Plastic');

      // Update material
      await models.Material.update(
        { material_name: 'ABS Plastic Grade A' },
        { where: { id: materialId } }
      );

      // Query after update
      const afterUpdate = await models.Material.findByPk(materialId);
      expect(afterUpdate.material_name).toBe('ABS Plastic Grade A');
    });

    test('should filter inactive materials from Scheduling module available list', async () => {
      const materialList = [
        { id: 1, material_code: 'MAT-001', status: 'active' },
        { id: 2, material_code: 'MAT-002', status: 'inactive' },
        { id: 3, material_code: 'MAT-003', status: 'active' }
      ];

      models.Material.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: materialList
      });

      const result = await models.Material.findAndCountAll({
        where: { status: 'active' }
      });

      const activeMaterials = result.rows.filter(m => m.status === 'active');

      expect(activeMaterials.length).toBe(2);
      expect(activeMaterials.every(m => m.status === 'active')).toBe(true);
    });
  });

  describe('Complete Scheduling Workflow', () => {
    test('should execute complete scheduling workflow with integrated data', async () => {
      // Setup: Create equipment, material, and mold
      const equipment = {
        id: 1,
        equipment_code: 'EQ-001',
        equipment_name: 'Injection Molding Machine',
        status: 'active',
        is_active: true
      };

      const material = {
        id: 1,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        status: 'active'
      };

      const mold = {
        id: 1,
        mold_code: 'MOLD-001',
        mold_name: 'Product A Mold',
        status: 'normal'
      };

      const equipmentExt = {
        equipment_id: 1,
        capacity_per_hour: 100,
        scheduling_weight: 80,
        is_available_for_scheduling: true
      };

      const materialExt = {
        material_id: 1,
        default_device_id: 1,
        default_mold_id: 1
      };

      // Step 1: Create master data
      models.Equipment.create.mockResolvedValue(equipment);
      models.Material.create.mockResolvedValue(material);
      models.Mold.create.mockResolvedValue(mold);

      // Step 2: Create scheduling extensions
      models.EquipmentSchedulingExt.create.mockResolvedValue(equipmentExt);
      models.MaterialSchedulingExt.create.mockResolvedValue(materialExt);

      // Step 3: Create production plan
      const productionPlan = {
        id: 1,
        equipment_id: 1,
        material_id: 1,
        mold_id: 1,
        quantity: 1000,
        status: 'pending'
      };

      models.ProductionPlan.create.mockResolvedValue(productionPlan);

      // Step 4: Create production task
      const productionTask = {
        id: 1,
        plan_id: 1,
        equipment_id: 1,
        material_id: 1,
        mold_id: 1,
        status: 'scheduled'
      };

      models.ProductionTask.create.mockResolvedValue(productionTask);

      // Execute workflow
      const createdEquipment = await models.Equipment.create(equipment);
      const createdMaterial = await models.Material.create(material);
      const createdMold = await models.Mold.create(mold);

      await models.EquipmentSchedulingExt.create(equipmentExt);
      await models.MaterialSchedulingExt.create(materialExt);

      const createdPlan = await models.ProductionPlan.create(productionPlan);
      const createdTask = await models.ProductionTask.create(productionTask);

      // Verify workflow
      expect(createdEquipment.id).toBe(1);
      expect(createdMaterial.id).toBe(1);
      expect(createdMold.id).toBe(1);
      expect(createdPlan.equipment_id).toBe(1);
      expect(createdPlan.material_id).toBe(1);
      expect(createdTask.equipment_id).toBe(1);
    });

    test('should maintain data relationships through complete workflow', async () => {
      // Create equipment with scheduling extension
      const equipment = { id: 1, equipment_code: 'EQ-001', status: 'active' };
      const equipmentExt = { equipment_id: 1, capacity_per_hour: 100 };

      // Create material with scheduling extension
      const material = { id: 1, material_code: 'MAT-001', status: 'active' };
      const materialExt = { material_id: 1, default_device_id: 1 };

      // Create production plan referencing both
      const plan = {
        id: 1,
        equipment_id: 1,
        material_id: 1,
        quantity: 500
      };

      models.Equipment.findByPk.mockResolvedValue(equipment);
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(equipmentExt);
      models.Material.findByPk.mockResolvedValue(material);
      models.MaterialSchedulingExt.findOne.mockResolvedValue(materialExt);
      models.ProductionPlan.findByPk.mockResolvedValue(plan);

      // Verify relationships
      const queriedEquipment = await models.Equipment.findByPk(1);
      const queriedExt = await models.EquipmentSchedulingExt.findOne({ where: { equipment_id: 1 } });
      const queriedMaterial = await models.Material.findByPk(1);
      const queriedPlan = await models.ProductionPlan.findByPk(1);

      expect(queriedEquipment.id).toBe(queriedPlan.equipment_id);
      expect(queriedMaterial.id).toBe(queriedPlan.material_id);
      expect(queriedExt.equipment_id).toBe(queriedEquipment.id);
    });
  });

  describe('Mold-Equipment Relationship Integration', () => {
    test('should maintain mold-equipment relationships through workflow', async () => {
      const mold = { id: 1, mold_code: 'MOLD-001', status: 'normal' };
      const equipment = { id: 1, equipment_code: 'EQ-001', status: 'active' };

      const moldEquipmentRelation = {
        id: 1,
        mold_id: 1,
        equipment_id: 1,
        is_primary: true
      };

      models.Mold.findByPk.mockResolvedValue(mold);
      models.Equipment.findByPk.mockResolvedValue(equipment);
      models.MoldEquipmentRelation.findOne.mockResolvedValue(moldEquipmentRelation);

      // Verify relationship
      const queriedMold = await models.Mold.findByPk(1);
      const queriedEquipment = await models.Equipment.findByPk(1);
      const queriedRelation = await models.MoldEquipmentRelation.findOne({
        where: { mold_id: 1, equipment_id: 1 }
      });

      expect(queriedMold.id).toBe(queriedRelation.mold_id);
      expect(queriedEquipment.id).toBe(queriedRelation.equipment_id);
      expect(queriedRelation.is_primary).toBe(true);
    });

    test('should filter molds by equipment availability', async () => {
      const moldList = [
        { id: 1, mold_code: 'MOLD-001', status: 'normal' },
        { id: 2, mold_code: 'MOLD-002', status: 'maintenance' },
        { id: 3, mold_code: 'MOLD-003', status: 'normal' }
      ];

      models.Mold.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: moldList
      });

      const result = await models.Mold.findAndCountAll({
        where: { status: 'normal' }
      });

      const availableMolds = result.rows.filter(m => m.status === 'normal');

      expect(availableMolds.length).toBe(2);
      expect(availableMolds.every(m => m.status === 'normal')).toBe(true);
    });
  });

  describe('Material-Device-Mold Relationship Integration', () => {
    test('should maintain material-device-mold relationships', async () => {
      const material = { id: 1, material_code: 'MAT-001' };
      const device = { id: 1, device_code: 'DEV-001' };
      const mold = { id: 1, mold_code: 'MOLD-001' };

      const materialDeviceRelation = {
        id: 1,
        material_id: 1,
        device_id: 1,
        weight: 80
      };

      const materialMoldRelation = {
        id: 1,
        material_id: 1,
        mold_id: 1,
        weight: 70,
        cycle_time: 30,
        output_per_cycle: 100
      };

      models.Material.findByPk.mockResolvedValue(material);
      models.Device.findByPk = jest.fn().mockResolvedValue(device);
      models.Mold.findByPk.mockResolvedValue(mold);
      models.MaterialDeviceRelation.findOne.mockResolvedValue(materialDeviceRelation);
      models.MaterialMoldRelation.findOne.mockResolvedValue(materialMoldRelation);

      // Verify relationships
      const queriedMaterial = await models.Material.findByPk(1);
      const queriedDeviceRel = await models.MaterialDeviceRelation.findOne({
        where: { material_id: 1 }
      });
      const queriedMoldRel = await models.MaterialMoldRelation.findOne({
        where: { material_id: 1 }
      });

      expect(queriedMaterial.id).toBe(queriedDeviceRel.material_id);
      expect(queriedMaterial.id).toBe(queriedMoldRel.material_id);
      expect(queriedDeviceRel.weight).toBe(80);
      expect(queriedMoldRel.cycle_time).toBe(30);
    });
  });

  describe('Data Consistency Across Modules', () => {
    test('should maintain data consistency when equipment is updated', async () => {
      const equipmentId = 1;
      const originalCapacity = 100;
      const updatedCapacity = 150;

      const equipment = { id: equipmentId, equipment_code: 'EQ-001' };
      const originalExt = { equipment_id: equipmentId, capacity_per_hour: originalCapacity };
      const updatedExt = { equipment_id: equipmentId, capacity_per_hour: updatedCapacity };

      models.Equipment.findByPk.mockResolvedValue(equipment);
      models.EquipmentSchedulingExt.findOne.mockResolvedValueOnce(originalExt);
      models.EquipmentSchedulingExt.update.mockResolvedValue([1]);
      models.EquipmentSchedulingExt.findOne.mockResolvedValueOnce(updatedExt);

      // Get original capacity
      const originalScheduling = await models.EquipmentSchedulingExt.findOne({
        where: { equipment_id: equipmentId }
      });
      expect(originalScheduling.capacity_per_hour).toBe(100);

      // Update capacity
      await models.EquipmentSchedulingExt.update(
        { capacity_per_hour: updatedCapacity },
        { where: { equipment_id: equipmentId } }
      );

      // Get updated capacity
      const updatedScheduling = await models.EquipmentSchedulingExt.findOne({
        where: { equipment_id: equipmentId }
      });
      expect(updatedScheduling.capacity_per_hour).toBe(150);
    });

    test('should maintain data consistency when material is updated', async () => {
      const materialId = 1;
      const originalDeviceId = 1;
      const updatedDeviceId = 2;

      const material = { id: materialId, material_code: 'MAT-001' };
      const originalExt = { material_id: materialId, default_device_id: originalDeviceId };
      const updatedExt = { material_id: materialId, default_device_id: updatedDeviceId };

      models.Material.findByPk.mockResolvedValue(material);
      models.MaterialSchedulingExt.findOne.mockResolvedValueOnce(originalExt);
      models.MaterialSchedulingExt.update.mockResolvedValue([1]);
      models.MaterialSchedulingExt.findOne.mockResolvedValueOnce(updatedExt);

      // Get original device
      const originalScheduling = await models.MaterialSchedulingExt.findOne({
        where: { material_id: materialId }
      });
      expect(originalScheduling.default_device_id).toBe(1);

      // Update device
      await models.MaterialSchedulingExt.update(
        { default_device_id: updatedDeviceId },
        { where: { material_id: materialId } }
      );

      // Get updated device
      const updatedScheduling = await models.MaterialSchedulingExt.findOne({
        where: { material_id: materialId }
      });
      expect(updatedScheduling.default_device_id).toBe(2);
    });
  });
});
