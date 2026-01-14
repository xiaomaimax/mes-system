/**
 * Cascade Delete Service Tests
 * Validates cascade delete logic for equipment, materials, and molds
 * Requirements: 4.5, 4.6
 * 
 * Property 3: Cascade Delete Consistency
 * For any deleted equipment or material, all related relationship configurations
 * in the scheduling module should be automatically cleaned up
 */

jest.mock('../models', () => ({
  Equipment: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  EquipmentSchedulingExt: {
    destroy: jest.fn()
  },
  Material: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  MaterialSchedulingExt: {
    destroy: jest.fn()
  },
  Mold: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  MoldSchedulingExt: {
    destroy: jest.fn()
  },
  MoldEquipmentRelation: {
    destroy: jest.fn()
  },
  MaterialDeviceRelation: {
    destroy: jest.fn()
  },
  MaterialMoldRelation: {
    destroy: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

const CascadeDeleteService = require('./CascadeDeleteService');
const models = require('../models');

describe('CascadeDeleteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    models.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('deleteEquipmentCascade', () => {
    test('should delete equipment and all related material-device relationships', async () => {
      const equipmentId = 1;
      const mockEquipment = { id: equipmentId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(1);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(0);
      models.EquipmentSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteEquipmentCascade(equipmentId);

      expect(result.success).toBe(true);
      expect(result.equipmentId).toBe(equipmentId);
      expect(result.deletedRelations.materialDeviceRelations).toBe(1);
      expect(result.deletedRelations.moldEquipmentRelations).toBe(0);
      expect(result.deletedRelations.schedulingExt).toBe(0);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete equipment and all related mold-equipment relationships', async () => {
      const equipmentId = 2;
      const mockEquipment = { id: equipmentId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(0);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(2);
      models.EquipmentSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteEquipmentCascade(equipmentId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.moldEquipmentRelations).toBe(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete equipment and its scheduling extension data', async () => {
      const equipmentId = 3;
      const mockEquipment = { id: equipmentId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(0);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(0);
      models.EquipmentSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteEquipmentCascade(equipmentId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should clean up all related data in a single transaction', async () => {
      const equipmentId = 4;
      const mockEquipment = { id: equipmentId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(3);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(2);
      models.EquipmentSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteEquipmentCascade(equipmentId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.materialDeviceRelations).toBe(3);
      expect(result.deletedRelations.moldEquipmentRelations).toBe(2);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should throw error when equipment does not exist', async () => {
      models.Equipment.findByPk.mockResolvedValue(null);
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      models.sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        CascadeDeleteService.deleteEquipmentCascade(99999)
      ).rejects.toThrow('设备不存在');
      
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteMaterialCascade', () => {
    test('should delete material and all related material-device relationships', async () => {
      const materialId = 1;
      const mockMaterial = { id: materialId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(2);
      models.MaterialMoldRelation.destroy.mockResolvedValue(0);
      models.MaterialSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteMaterialCascade(materialId);

      expect(result.success).toBe(true);
      expect(result.materialId).toBe(materialId);
      expect(result.deletedRelations.materialDeviceRelations).toBe(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete material and all related material-mold relationships', async () => {
      const materialId = 2;
      const mockMaterial = { id: materialId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(0);
      models.MaterialMoldRelation.destroy.mockResolvedValue(3);
      models.MaterialSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteMaterialCascade(materialId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.materialMoldRelations).toBe(3);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete material and its scheduling extension data', async () => {
      const materialId = 3;
      const mockMaterial = { id: materialId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(0);
      models.MaterialMoldRelation.destroy.mockResolvedValue(0);
      models.MaterialSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteMaterialCascade(materialId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should clean up all related data in a single transaction', async () => {
      const materialId = 4;
      const mockMaterial = { id: materialId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialDeviceRelation.destroy.mockResolvedValue(2);
      models.MaterialMoldRelation.destroy.mockResolvedValue(1);
      models.MaterialSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteMaterialCascade(materialId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.materialDeviceRelations).toBe(2);
      expect(result.deletedRelations.materialMoldRelations).toBe(1);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should throw error when material does not exist', async () => {
      models.Material.findByPk.mockResolvedValue(null);
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      models.sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        CascadeDeleteService.deleteMaterialCascade(99999)
      ).rejects.toThrow('物料不存在');
      
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteMoldCascade', () => {
    test('should delete mold and all related material-mold relationships', async () => {
      const moldId = 1;
      const mockMold = { id: moldId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Mold.findByPk.mockResolvedValue(mockMold);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialMoldRelation.destroy.mockResolvedValue(2);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(0);
      models.MoldSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteMoldCascade(moldId);

      expect(result.success).toBe(true);
      expect(result.moldId).toBe(moldId);
      expect(result.deletedRelations.materialMoldRelations).toBe(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete mold and all related mold-equipment relationships', async () => {
      const moldId = 2;
      const mockMold = { id: moldId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Mold.findByPk.mockResolvedValue(mockMold);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialMoldRelation.destroy.mockResolvedValue(0);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(3);
      models.MoldSchedulingExt.destroy.mockResolvedValue(0);

      const result = await CascadeDeleteService.deleteMoldCascade(moldId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.moldEquipmentRelations).toBe(3);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should delete mold and its scheduling extension data', async () => {
      const moldId = 3;
      const mockMold = { id: moldId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Mold.findByPk.mockResolvedValue(mockMold);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialMoldRelation.destroy.mockResolvedValue(0);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(0);
      models.MoldSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteMoldCascade(moldId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should clean up all related data in a single transaction', async () => {
      const moldId = 4;
      const mockMold = { id: moldId, destroy: jest.fn().mockResolvedValue(true) };
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };

      models.Mold.findByPk.mockResolvedValue(mockMold);
      models.sequelize.transaction.mockResolvedValue(mockTransaction);
      models.MaterialMoldRelation.destroy.mockResolvedValue(1);
      models.MoldEquipmentRelation.destroy.mockResolvedValue(2);
      models.MoldSchedulingExt.destroy.mockResolvedValue(1);

      const result = await CascadeDeleteService.deleteMoldCascade(moldId);

      expect(result.success).toBe(true);
      expect(result.deletedRelations.materialMoldRelations).toBe(1);
      expect(result.deletedRelations.moldEquipmentRelations).toBe(2);
      expect(result.deletedRelations.schedulingExt).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should throw error when mold does not exist', async () => {
      models.Mold.findByPk.mockResolvedValue(null);
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      models.sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        CascadeDeleteService.deleteMoldCascade(99999)
      ).rejects.toThrow('模具不存在');
      
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('Preview Methods', () => {
    test('previewEquipmentDeleteCascade should return preview of related data', async () => {
      const equipmentId = 1;
      const mockEquipment = {
        id: equipmentId,
        equipment_code: 'EQ-001',
        equipment_name: 'Injection Molding Machine A1'
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);
      models.MaterialDeviceRelation.count = jest.fn().mockResolvedValue(2);
      models.MoldEquipmentRelation.count = jest.fn().mockResolvedValue(1);
      models.EquipmentSchedulingExt.count = jest.fn().mockResolvedValue(1);

      const preview = await CascadeDeleteService.previewEquipmentDeleteCascade(equipmentId);

      expect(preview.equipmentId).toBe(equipmentId);
      expect(preview.equipmentCode).toBe('EQ-001');
      expect(preview.equipmentName).toBe('Injection Molding Machine A1');
      expect(preview.relatedData.materialDeviceRelations).toBe(2);
      expect(preview.relatedData.moldEquipmentRelations).toBe(1);
      expect(preview.relatedData.schedulingExt).toBe(1);
      expect(preview.totalRelatedRecords).toBe(4);
    });

    test('previewMaterialDeleteCascade should return preview of related data', async () => {
      const materialId = 1;
      const mockMaterial = {
        id: materialId,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic'
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);
      models.MaterialDeviceRelation.count = jest.fn().mockResolvedValue(1);
      models.MaterialMoldRelation.count = jest.fn().mockResolvedValue(2);
      models.MaterialSchedulingExt.count = jest.fn().mockResolvedValue(1);

      const preview = await CascadeDeleteService.previewMaterialDeleteCascade(materialId);

      expect(preview.materialId).toBe(materialId);
      expect(preview.materialCode).toBe('MAT-001');
      expect(preview.materialName).toBe('ABS Plastic');
      expect(preview.relatedData.materialDeviceRelations).toBe(1);
      expect(preview.relatedData.materialMoldRelations).toBe(2);
      expect(preview.relatedData.schedulingExt).toBe(1);
      expect(preview.totalRelatedRecords).toBe(4);
    });

    test('previewMoldDeleteCascade should return preview of related data', async () => {
      const moldId = 1;
      const mockMold = {
        id: moldId,
        mold_code: 'MOLD-001',
        mold_name: 'Product A Mold'
      };

      models.Mold.findByPk.mockResolvedValue(mockMold);
      models.MaterialMoldRelation.count = jest.fn().mockResolvedValue(2);
      models.MoldEquipmentRelation.count = jest.fn().mockResolvedValue(1);
      models.MoldSchedulingExt.count = jest.fn().mockResolvedValue(1);

      const preview = await CascadeDeleteService.previewMoldDeleteCascade(moldId);

      expect(preview.moldId).toBe(moldId);
      expect(preview.moldCode).toBe('MOLD-001');
      expect(preview.moldName).toBe('Product A Mold');
      expect(preview.relatedData.materialMoldRelations).toBe(2);
      expect(preview.relatedData.moldEquipmentRelations).toBe(1);
      expect(preview.relatedData.schedulingExt).toBe(1);
      expect(preview.totalRelatedRecords).toBe(4);
    });
  });
});
