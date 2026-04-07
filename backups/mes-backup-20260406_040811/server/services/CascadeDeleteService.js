/**
 * 级联删除服务
 * 处理设备、物料、模具删除时的关联数据清理
 * Requirements: 4.5, 4.6
 */
const {
  Equipment,
  EquipmentSchedulingExt,
  Material,
  MaterialSchedulingExt,
  Mold,
  MoldSchedulingExt,
  MoldEquipmentRelation,
  MaterialDeviceRelation,
  MaterialMoldRelation,
  sequelize
} = require('../models');

class CascadeDeleteService {
  /**
   * 删除设备时的级联清理
   * Requirements: 4.6 - 设备删除时自动清理相关关系配置
   * 
   * 清理内容:
   * 1. 物料-设备关系 (material_device_relations)
   * 2. 模具-设备关系 (mold_equipment_relations)
   * 3. 设备排程扩展数据 (equipment_scheduling_ext)
   * 
   * @param {number} equipmentId - 设备ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteEquipmentCascade(equipmentId) {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证设备是否存在
      const equipment = await Equipment.findByPk(equipmentId);
      if (!equipment) {
        throw new Error('设备不存在');
      }

      const deletedRelations = {
        materialDeviceRelations: 0,
        moldEquipmentRelations: 0,
        schedulingExt: 0
      };

      // 1. 清理物料-设备关系
      const materialDeviceCount = await MaterialDeviceRelation.destroy({
        where: { device_id: equipmentId },
        transaction
      });
      deletedRelations.materialDeviceRelations = materialDeviceCount;

      // 2. 清理模具-设备关系
      const moldEquipmentCount = await MoldEquipmentRelation.destroy({
        where: { equipment_id: equipmentId },
        transaction
      });
      deletedRelations.moldEquipmentRelations = moldEquipmentCount;

      // 3. 清理设备排程扩展数据
      const schedulingExtCount = await EquipmentSchedulingExt.destroy({
        where: { equipment_id: equipmentId },
        transaction
      });
      deletedRelations.schedulingExt = schedulingExtCount;

      // 4. 删除设备主数据
      await equipment.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        equipmentId,
        deletedRelations,
        message: '设备及相关数据删除成功'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除物料时的级联清理
   * Requirements: 4.5 - 物料删除时自动清理相关关系配置
   * 
   * 清理内容:
   * 1. 物料-设备关系 (material_device_relations)
   * 2. 物料-模具关系 (material_mold_relations)
   * 3. 物料排程扩展数据 (material_scheduling_ext)
   * 
   * @param {number} materialId - 物料ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteMaterialCascade(materialId) {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证物料是否存在
      const material = await Material.findByPk(materialId);
      if (!material) {
        throw new Error('物料不存在');
      }

      const deletedRelations = {
        materialDeviceRelations: 0,
        materialMoldRelations: 0,
        schedulingExt: 0
      };

      // 1. 清理物料-设备关系
      const materialDeviceCount = await MaterialDeviceRelation.destroy({
        where: { material_id: materialId },
        transaction
      });
      deletedRelations.materialDeviceRelations = materialDeviceCount;

      // 2. 清理物料-模具关系
      const materialMoldCount = await MaterialMoldRelation.destroy({
        where: { material_id: materialId },
        transaction
      });
      deletedRelations.materialMoldRelations = materialMoldCount;

      // 3. 清理物料排程扩展数据
      const schedulingExtCount = await MaterialSchedulingExt.destroy({
        where: { material_id: materialId },
        transaction
      });
      deletedRelations.schedulingExt = schedulingExtCount;

      // 4. 删除物料主数据
      await material.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        materialId,
        deletedRelations,
        message: '物料及相关数据删除成功'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除模具时的级联清理
   * Requirements: 4.5, 4.6 - 模具删除时自动清理相关关系配置
   * 
   * 清理内容:
   * 1. 物料-模具关系 (material_mold_relations)
   * 2. 模具-设备关系 (mold_equipment_relations)
   * 3. 模具排程扩展数据 (mold_scheduling_ext)
   * 
   * @param {number} moldId - 模具ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteMoldCascade(moldId) {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证模具是否存在
      const mold = await Mold.findByPk(moldId);
      if (!mold) {
        throw new Error('模具不存在');
      }

      const deletedRelations = {
        materialMoldRelations: 0,
        moldEquipmentRelations: 0,
        schedulingExt: 0
      };

      // 1. 清理物料-模具关系
      const materialMoldCount = await MaterialMoldRelation.destroy({
        where: { mold_id: moldId },
        transaction
      });
      deletedRelations.materialMoldRelations = materialMoldCount;

      // 2. 清理模具-设备关系
      const moldEquipmentCount = await MoldEquipmentRelation.destroy({
        where: { mold_id: moldId },
        transaction
      });
      deletedRelations.moldEquipmentRelations = moldEquipmentCount;

      // 3. 清理模具排程扩展数据
      const schedulingExtCount = await MoldSchedulingExt.destroy({
        where: { mold_id: moldId },
        transaction
      });
      deletedRelations.schedulingExt = schedulingExtCount;

      // 4. 删除模具主数据
      await mold.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        moldId,
        deletedRelations,
        message: '模具及相关数据删除成功'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取设备删除前的关联数据预览
   * 用于在删除前向用户展示将被清理的数据
   * 
   * @param {number} equipmentId - 设备ID
   * @returns {Promise<Object>} 关联数据预览
   */
  static async previewEquipmentDeleteCascade(equipmentId) {
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) {
      throw new Error('设备不存在');
    }

    const materialDeviceRelations = await MaterialDeviceRelation.count({
      where: { device_id: equipmentId }
    });

    const moldEquipmentRelations = await MoldEquipmentRelation.count({
      where: { equipment_id: equipmentId }
    });

    const schedulingExt = await EquipmentSchedulingExt.count({
      where: { equipment_id: equipmentId }
    });

    return {
      equipmentId,
      equipmentCode: equipment.equipment_code,
      equipmentName: equipment.equipment_name,
      relatedData: {
        materialDeviceRelations,
        moldEquipmentRelations,
        schedulingExt
      },
      totalRelatedRecords: materialDeviceRelations + moldEquipmentRelations + schedulingExt
    };
  }

  /**
   * 获取物料删除前的关联数据预览
   * 
   * @param {number} materialId - 物料ID
   * @returns {Promise<Object>} 关联数据预览
   */
  static async previewMaterialDeleteCascade(materialId) {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new Error('物料不存在');
    }

    const materialDeviceRelations = await MaterialDeviceRelation.count({
      where: { material_id: materialId }
    });

    const materialMoldRelations = await MaterialMoldRelation.count({
      where: { material_id: materialId }
    });

    const schedulingExt = await MaterialSchedulingExt.count({
      where: { material_id: materialId }
    });

    return {
      materialId,
      materialCode: material.material_code,
      materialName: material.material_name,
      relatedData: {
        materialDeviceRelations,
        materialMoldRelations,
        schedulingExt
      },
      totalRelatedRecords: materialDeviceRelations + materialMoldRelations + schedulingExt
    };
  }

  /**
   * 获取模具删除前的关联数据预览
   * 
   * @param {number} moldId - 模具ID
   * @returns {Promise<Object>} 关联数据预览
   */
  static async previewMoldDeleteCascade(moldId) {
    const mold = await Mold.findByPk(moldId);
    if (!mold) {
      throw new Error('模具不存在');
    }

    const materialMoldRelations = await MaterialMoldRelation.count({
      where: { mold_id: moldId }
    });

    const moldEquipmentRelations = await MoldEquipmentRelation.count({
      where: { mold_id: moldId }
    });

    const schedulingExt = await MoldSchedulingExt.count({
      where: { mold_id: moldId }
    });

    return {
      moldId,
      moldCode: mold.mold_code,
      moldName: mold.mold_name,
      relatedData: {
        materialMoldRelations,
        moldEquipmentRelations,
        schedulingExt
      },
      totalRelatedRecords: materialMoldRelations + moldEquipmentRelations + schedulingExt
    };
  }
}

module.exports = CascadeDeleteService;
