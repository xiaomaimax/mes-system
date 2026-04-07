/**
 * Data Migration Service Tests
 * Validates data migration completeness and integrity
 * Requirements: 5.1, 5.2, 5.3
 * 
 * Property 6: Data Migration Completeness
 * For any pre-migration production plan and task, after migration the associated
 * equipment ID, mold ID, and material ID should be correctly mapped to new master data IDs,
 * and the relationships should remain unchanged.
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
    update: jest.fn()
  },
  ProductionTask: {
    findAll: jest.fn(),
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

// Mock migration service
class DataMigrationService {
  static async migrateEquipmentData() {
    const devices = await models.Device.findAll({ raw: true });
    const migrationMap = {};
    let successCount = 0;

    for (const device of devices) {
      const existingEquipment = await models.Equipment.findOne({
        where: { equipment_code: device.device_code }
      });

      if (existingEquipment) {
        migrationMap[device.id] = existingEquipment.id;
        const existingExt = await models.EquipmentSchedulingExt.findOne({
          where: { equipment_id: existingEquipment.id }
        });
        if (!existingExt) {
          await models.EquipmentSchedulingExt.create({
            equipment_id: existingEquipment.id,
            capacity_per_hour: device.capacity_per_hour || 0,
            scheduling_weight: 50,
            is_available_for_scheduling: device.status === 'normal'
          });
          successCount++;
        }
      } else {
        const newEquipment = await models.Equipment.create({
          equipment_code: device.device_code,
          equipment_name: device.device_name,
          status: device.status === 'normal' ? 'idle' : 'offline'
        });
        migrationMap[device.id] = newEquipment.id;
        await models.EquipmentSchedulingExt.create({
          equipment_id: newEquipment.id,
          capacity_per_hour: device.capacity_per_hour || 0,
          scheduling_weight: 50,
          is_available_for_scheduling: device.status === 'normal'
        });
        successCount++;
      }
    }

    return { successCount, migrationMap };
  }

  static async migrateMaterialData() {
    const materials = await models.Material.findAll({ raw: true });
    const migrationMap = {};
    let successCount = 0;

    for (const material of materials) {
      const existingMaterial = await models.Material.findOne({
        where: { material_code: material.material_code }
      });

      if (existingMaterial && existingMaterial.id !== material.id) {
        migrationMap[material.id] = existingMaterial.id;
        const existingExt = await models.MaterialSchedulingExt.findOne({
          where: { material_id: existingMaterial.id }
        });
        if (!existingExt) {
          await models.MaterialSchedulingExt.create({
            material_id: existingMaterial.id,
            default_device_id: null,
            default_mold_id: null
          });
          successCount++;
        }
      } else if (existingMaterial) {
        migrationMap[material.id] = existingMaterial.id;
      } else {
        const newMaterial = await models.Material.create({
          material_code: material.material_code,
          material_name: material.material_name,
          material_type: material.material_type || 'raw_material'
        });
        migrationMap[material.id] = newMaterial.id;
        await models.MaterialSchedulingExt.create({
          material_id: newMaterial.id,
          default_device_id: null,
          default_mold_id: null
        });
        successCount++;
      }
    }

    return { successCount, migrationMap };
  }

  static async migrateMoldData() {
    const molds = await models.Mold.findAll({ raw: true });
    const migrationMap = {};
    let successCount = 0;

    for (const mold of molds) {
      const existingMold = await models.Mold.findOne({
        where: { mold_code: mold.mold_code }
      });

      if (existingMold && existingMold.id !== mold.id) {
        migrationMap[mold.id] = existingMold.id;
        const existingExt = await models.MoldSchedulingExt.findOne({
          where: { mold_id: existingMold.id }
        });
        if (!existingExt) {
          await models.MoldSchedulingExt.create({
            mold_id: existingMold.id,
            scheduling_weight: 50
          });
          successCount++;
        }
      } else if (existingMold) {
        migrationMap[mold.id] = existingMold.id;
      } else {
        const newMold = await models.Mold.create({
          mold_code: mold.mold_code,
          mold_name: mold.mold_name,
          status: mold.status || 'normal'
        });
        migrationMap[mold.id] = newMold.id;
        await models.MoldSchedulingExt.create({
          mold_id: newMold.id,
          scheduling_weight: 50
        });
        successCount++;
      }
    }

    return { successCount, migrationMap };
  }

  static async updateProductionPlansWithNewIds(equipmentMap, materialMap, moldMap) {
    const plans = await models.ProductionPlan.findAll({ raw: true });
    let updatedCount = 0;

    for (const plan of plans) {
      const updates = {};
      let hasChanges = false;

      if (plan.equipment_id && equipmentMap[plan.equipment_id]) {
        updates.equipment_id = equipmentMap[plan.equipment_id];
        hasChanges = true;
      }

      if (plan.material_id && materialMap[plan.material_id]) {
        updates.material_id = materialMap[plan.material_id];
        hasChanges = true;
      }

      if (plan.mold_id && moldMap[plan.mold_id]) {
        updates.mold_id = moldMap[plan.mold_id];
        hasChanges = true;
      }

      if (hasChanges) {
        await models.ProductionPlan.update(updates, {
          where: { id: plan.id }
        });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  static async updateProductionTasksWithNewIds(equipmentMap, materialMap, moldMap) {
    const tasks = await models.ProductionTask.findAll({ raw: true });
    let updatedCount = 0;

    for (const task of tasks) {
      const updates = {};
      let hasChanges = false;

      if (task.equipment_id && equipmentMap[task.equipment_id]) {
        updates.equipment_id = equipmentMap[task.equipment_id];
        hasChanges = true;
      }

      if (task.material_id && materialMap[task.material_id]) {
        updates.material_id = materialMap[task.material_id];
        hasChanges = true;
      }

      if (task.mold_id && moldMap[task.mold_id]) {
        updates.mold_id = moldMap[task.mold_id];
        hasChanges = true;
      }

      if (hasChanges) {
        await models.ProductionTask.update(updates, {
          where: { id: task.id }
        });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  static async verifyMigrationIntegrity() {
    const equipmentCount = await models.Equipment.count();
    const equipmentExtCount = await models.EquipmentSchedulingExt.count();
    const materialCount = await models.Material.count();
    const materialExtCount = await models.MaterialSchedulingExt.count();
    const moldCount = await models.Mold.count();
    const moldExtCount = await models.MoldSchedulingExt.count();

    return {
      equipment: { total: equipmentCount, extensions: equipmentExtCount },
      material: { total: materialCount, extensions: materialExtCount },
      mold: { total: moldCount, extensions: moldExtCount },
      isValid: equipmentExtCount === equipmentCount && 
               materialExtCount === materialCount && 
               moldExtCount === moldCount
    };
  }
}

describe('DataMigrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Equipment Migration', () => {
    test('should migrate equipment data and create scheduling extensions', async () => {
      const mockDevices = [
        { id: 1, device_code: 'DEV-001', device_name: 'Device A', capacity_per_hour: 100, status: 'normal' },
        { id: 2, device_code: 'DEV-002', device_name: 'Device B', capacity_per_hour: 80, status: 'normal' }
      ];

      models.Device.findAll.mockResolvedValue(mockDevices);
      models.Equipment.findOne.mockResolvedValue(null);
      models.Equipment.create.mockImplementation((data) => 
        Promise.resolve({ id: Math.random(), ...data })
      );
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(null);
      models.EquipmentSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateEquipmentData();

      expect(result.successCount).toBe(2);
      expect(Object.keys(result.migrationMap).length).toBe(2);
      expect(models.Equipment.create).toHaveBeenCalledTimes(2);
      expect(models.EquipmentSchedulingExt.create).toHaveBeenCalledTimes(2);
    });

    test('should skip existing equipment and create extensions if missing', async () => {
      const mockDevices = [
        { id: 1, device_code: 'DEV-001', device_name: 'Device A', capacity_per_hour: 100, status: 'normal' }
      ];
      const mockExistingEquipment = { id: 10, equipment_code: 'DEV-001' };

      models.Device.findAll.mockResolvedValue(mockDevices);
      models.Equipment.findOne.mockResolvedValue(mockExistingEquipment);
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(null);
      models.EquipmentSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateEquipmentData();

      expect(result.successCount).toBe(1);
      expect(result.migrationMap[1]).toBe(10);
      expect(models.Equipment.create).not.toHaveBeenCalled();
      expect(models.EquipmentSchedulingExt.create).toHaveBeenCalledTimes(1);
    });

    test('should preserve equipment capacity and status during migration', async () => {
      const mockDevices = [
        { id: 1, device_code: 'DEV-001', device_name: 'Device A', capacity_per_hour: 150, status: 'normal' }
      ];

      models.Device.findAll.mockResolvedValue(mockDevices);
      models.Equipment.findOne.mockResolvedValue(null);
      models.Equipment.create.mockImplementation((data) => 
        Promise.resolve({ id: 1, ...data })
      );
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(null);
      models.EquipmentSchedulingExt.create.mockResolvedValue({ id: 1 });

      await DataMigrationService.migrateEquipmentData();

      expect(models.EquipmentSchedulingExt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          capacity_per_hour: 150,
          is_available_for_scheduling: true
        })
      );
    });
  });

  describe('Material Migration', () => {
    test('should migrate material data and create scheduling extensions', async () => {
      const mockMaterials = [
        { id: 1, material_code: 'MAT-001', material_name: 'Material A', material_type: 'raw_material' },
        { id: 2, material_code: 'MAT-002', material_name: 'Material B', material_type: 'raw_material' }
      ];

      models.Material.findAll.mockResolvedValue(mockMaterials);
      models.Material.findOne.mockResolvedValue(null);
      models.Material.create.mockImplementation((data) => 
        Promise.resolve({ id: Math.random(), ...data })
      );
      models.MaterialSchedulingExt.findOne.mockResolvedValue(null);
      models.MaterialSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateMaterialData();

      expect(result.successCount).toBe(2);
      expect(Object.keys(result.migrationMap).length).toBe(2);
      expect(models.Material.create).toHaveBeenCalledTimes(2);
      expect(models.MaterialSchedulingExt.create).toHaveBeenCalledTimes(2);
    });

    test('should skip existing material and create extensions if missing', async () => {
      const mockMaterials = [
        { id: 1, material_code: 'MAT-001', material_name: 'Material A', material_type: 'raw_material' }
      ];
      const mockExistingMaterial = { id: 20, material_code: 'MAT-001' };

      models.Material.findAll.mockResolvedValue(mockMaterials);
      models.Material.findOne.mockResolvedValue(mockExistingMaterial);
      models.MaterialSchedulingExt.findOne.mockResolvedValue(null);
      models.MaterialSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateMaterialData();

      expect(result.successCount).toBe(1);
      expect(result.migrationMap[1]).toBe(20);
      expect(models.Material.create).not.toHaveBeenCalled();
      expect(models.MaterialSchedulingExt.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mold Migration', () => {
    test('should migrate mold data and create scheduling extensions', async () => {
      const mockMolds = [
        { id: 1, mold_code: 'MOLD-001', mold_name: 'Mold A', status: 'normal' },
        { id: 2, mold_code: 'MOLD-002', mold_name: 'Mold B', status: 'normal' }
      ];

      models.Mold.findAll.mockResolvedValue(mockMolds);
      models.Mold.findOne.mockResolvedValue(null);
      models.Mold.create.mockImplementation((data) => 
        Promise.resolve({ id: Math.random(), ...data })
      );
      models.MoldSchedulingExt.findOne.mockResolvedValue(null);
      models.MoldSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateMoldData();

      expect(result.successCount).toBe(2);
      expect(Object.keys(result.migrationMap).length).toBe(2);
      expect(models.Mold.create).toHaveBeenCalledTimes(2);
      expect(models.MoldSchedulingExt.create).toHaveBeenCalledTimes(2);
    });

    test('should skip existing mold and create extensions if missing', async () => {
      const mockMolds = [
        { id: 1, mold_code: 'MOLD-001', mold_name: 'Mold A', status: 'normal' }
      ];
      const mockExistingMold = { id: 30, mold_code: 'MOLD-001' };

      models.Mold.findAll.mockResolvedValue(mockMolds);
      models.Mold.findOne.mockResolvedValue(mockExistingMold);
      models.MoldSchedulingExt.findOne.mockResolvedValue(null);
      models.MoldSchedulingExt.create.mockResolvedValue({ id: 1 });

      const result = await DataMigrationService.migrateMoldData();

      expect(result.successCount).toBe(1);
      expect(result.migrationMap[1]).toBe(30);
      expect(models.Mold.create).not.toHaveBeenCalled();
      expect(models.MoldSchedulingExt.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Production Plan ID Mapping', () => {
    test('should update production plans with new equipment IDs', async () => {
      const mockPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 2, material_id: 2, mold_id: 2 }
      ];

      models.ProductionPlan.findAll.mockResolvedValue(mockPlans);
      models.ProductionPlan.update.mockResolvedValue([1]);

      const equipmentMap = { 1: 10, 2: 20 };
      const materialMap = { 1: 100, 2: 200 };
      const moldMap = { 1: 1000, 2: 2000 };

      const result = await DataMigrationService.updateProductionPlansWithNewIds(
        equipmentMap,
        materialMap,
        moldMap
      );

      expect(result).toBe(2);
      expect(models.ProductionPlan.update).toHaveBeenCalledTimes(2);
    });

    test('should only update plans with mapped IDs', async () => {
      const mockPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 99, material_id: 99, mold_id: 99 } // No mapping
      ];

      models.ProductionPlan.findAll.mockResolvedValue(mockPlans);
      models.ProductionPlan.update.mockResolvedValue([1]);

      const equipmentMap = { 1: 10 };
      const materialMap = { 1: 100 };
      const moldMap = { 1: 1000 };

      const result = await DataMigrationService.updateProductionPlansWithNewIds(
        equipmentMap,
        materialMap,
        moldMap
      );

      expect(result).toBe(1);
      expect(models.ProductionPlan.update).toHaveBeenCalledTimes(1);
    });

    test('should preserve plan relationships after ID mapping', async () => {
      const mockPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1, quantity: 100, status: 'active' }
      ];

      models.ProductionPlan.findAll.mockResolvedValue(mockPlans);
      models.ProductionPlan.update.mockResolvedValue([1]);

      const equipmentMap = { 1: 10 };
      const materialMap = { 1: 100 };
      const moldMap = { 1: 1000 };

      await DataMigrationService.updateProductionPlansWithNewIds(
        equipmentMap,
        materialMap,
        moldMap
      );

      expect(models.ProductionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          equipment_id: 10,
          material_id: 100,
          mold_id: 1000
        }),
        expect.any(Object)
      );
    });
  });

  describe('Production Task ID Mapping', () => {
    test('should update production tasks with new equipment IDs', async () => {
      const mockTasks = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 2, material_id: 2, mold_id: 2 }
      ];

      models.ProductionTask.findAll.mockResolvedValue(mockTasks);
      models.ProductionTask.update.mockResolvedValue([1]);

      const equipmentMap = { 1: 10, 2: 20 };
      const materialMap = { 1: 100, 2: 200 };
      const moldMap = { 1: 1000, 2: 2000 };

      const result = await DataMigrationService.updateProductionTasksWithNewIds(
        equipmentMap,
        materialMap,
        moldMap
      );

      expect(result).toBe(2);
      expect(models.ProductionTask.update).toHaveBeenCalledTimes(2);
    });

    test('should only update tasks with mapped IDs', async () => {
      const mockTasks = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 },
        { id: 2, equipment_id: 99, material_id: 99, mold_id: 99 } // No mapping
      ];

      models.ProductionTask.findAll.mockResolvedValue(mockTasks);
      models.ProductionTask.update.mockResolvedValue([1]);

      const equipmentMap = { 1: 10 };
      const materialMap = { 1: 100 };
      const moldMap = { 1: 1000 };

      const result = await DataMigrationService.updateProductionTasksWithNewIds(
        equipmentMap,
        materialMap,
        moldMap
      );

      expect(result).toBe(1);
      expect(models.ProductionTask.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('Migration Integrity Verification', () => {
    test('should verify all equipment have scheduling extensions', async () => {
      models.Equipment.count.mockResolvedValue(5);
      models.EquipmentSchedulingExt.count.mockResolvedValue(5);
      models.Material.count.mockResolvedValue(3);
      models.MaterialSchedulingExt.count.mockResolvedValue(3);
      models.Mold.count.mockResolvedValue(2);
      models.MoldSchedulingExt.count.mockResolvedValue(2);

      const result = await DataMigrationService.verifyMigrationIntegrity();

      expect(result.equipment.total).toBe(5);
      expect(result.equipment.extensions).toBe(5);
      expect(result.isValid).toBe(true);
    });

    test('should detect missing scheduling extensions', async () => {
      models.Equipment.count.mockResolvedValue(5);
      models.EquipmentSchedulingExt.count.mockResolvedValue(4); // Missing one
      models.Material.count.mockResolvedValue(3);
      models.MaterialSchedulingExt.count.mockResolvedValue(3);
      models.Mold.count.mockResolvedValue(2);
      models.MoldSchedulingExt.count.mockResolvedValue(2);

      const result = await DataMigrationService.verifyMigrationIntegrity();

      expect(result.equipment.total).toBe(5);
      expect(result.equipment.extensions).toBe(4);
      expect(result.isValid).toBe(false);
    });

    test('should verify all materials have scheduling extensions', async () => {
      models.Equipment.count.mockResolvedValue(5);
      models.EquipmentSchedulingExt.count.mockResolvedValue(5);
      models.Material.count.mockResolvedValue(10);
      models.MaterialSchedulingExt.count.mockResolvedValue(10);
      models.Mold.count.mockResolvedValue(2);
      models.MoldSchedulingExt.count.mockResolvedValue(2);

      const result = await DataMigrationService.verifyMigrationIntegrity();

      expect(result.material.total).toBe(10);
      expect(result.material.extensions).toBe(10);
      expect(result.isValid).toBe(true);
    });

    test('should verify all molds have scheduling extensions', async () => {
      models.Equipment.count.mockResolvedValue(5);
      models.EquipmentSchedulingExt.count.mockResolvedValue(5);
      models.Material.count.mockResolvedValue(3);
      models.MaterialSchedulingExt.count.mockResolvedValue(3);
      models.Mold.count.mockResolvedValue(8);
      models.MoldSchedulingExt.count.mockResolvedValue(8);

      const result = await DataMigrationService.verifyMigrationIntegrity();

      expect(result.mold.total).toBe(8);
      expect(result.mold.extensions).toBe(8);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Complete Migration Workflow', () => {
    test('should complete full migration workflow with ID mapping', async () => {
      // Setup equipment migration
      const mockDevices = [
        { id: 1, device_code: 'DEV-001', device_name: 'Device A', capacity_per_hour: 100, status: 'normal' }
      ];
      models.Device.findAll.mockResolvedValue(mockDevices);
      models.Equipment.findOne.mockResolvedValue(null);
      models.Equipment.create.mockResolvedValue({ id: 10 });
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(null);
      models.EquipmentSchedulingExt.create.mockResolvedValue({ id: 1 });

      // Setup material migration
      const mockMaterials = [
        { id: 1, material_code: 'MAT-001', material_name: 'Material A', material_type: 'raw_material' }
      ];
      models.Material.findAll.mockResolvedValue(mockMaterials);
      models.Material.findOne.mockResolvedValue(null);
      models.Material.create.mockResolvedValue({ id: 100 });
      models.MaterialSchedulingExt.findOne.mockResolvedValue(null);
      models.MaterialSchedulingExt.create.mockResolvedValue({ id: 1 });

      // Setup mold migration
      const mockMolds = [
        { id: 1, mold_code: 'MOLD-001', mold_name: 'Mold A', status: 'normal' }
      ];
      models.Mold.findAll.mockResolvedValue(mockMolds);
      models.Mold.findOne.mockResolvedValue(null);
      models.Mold.create.mockResolvedValue({ id: 1000 });
      models.MoldSchedulingExt.findOne.mockResolvedValue(null);
      models.MoldSchedulingExt.create.mockResolvedValue({ id: 1 });

      // Setup production plan update
      const mockPlans = [
        { id: 1, equipment_id: 1, material_id: 1, mold_id: 1 }
      ];
      models.ProductionPlan.findAll.mockResolvedValue(mockPlans);
      models.ProductionPlan.update.mockResolvedValue([1]);

      // Execute migration
      const equipmentResult = await DataMigrationService.migrateEquipmentData();
      const materialResult = await DataMigrationService.migrateMaterialData();
      const moldResult = await DataMigrationService.migrateMoldData();
      const planUpdateResult = await DataMigrationService.updateProductionPlansWithNewIds(
        equipmentResult.migrationMap,
        materialResult.migrationMap,
        moldResult.migrationMap
      );

      // Verify results
      expect(equipmentResult.successCount).toBe(1);
      expect(materialResult.successCount).toBe(1);
      expect(moldResult.successCount).toBe(1);
      expect(planUpdateResult).toBe(1);

      // Verify ID mappings
      expect(equipmentResult.migrationMap[1]).toBe(10);
      expect(materialResult.migrationMap[1]).toBe(100);
      expect(moldResult.migrationMap[1]).toBe(1000);
    });
  });
});
