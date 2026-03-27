/**
 * 统一主数据API路由
 * 提供设备、物料、模具的统一查询接口，合并主数据和排程扩展属性
 * Requirements: 4.5, 4.6, 6.1, 6.2, 6.3, 6.5, 6.6
 */
const express = require('express');
const { Op } = require('sequelize');
const { authenticateToken } = require('./auth');

// 导入模型
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
  Device
} = require('../models');

// 导入级联删除服务
const CascadeDeleteService = require('../services/CascadeDeleteService');

const router = express.Router();

/**
 * GET /api/master-data/equipment
 * 统一设备查询API - 返回设备主数据 + 排程扩展属性
 * Requirements: 6.1, 6.5, 6.6
 * 
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 10)
 * - status: 设备状态过滤 (running, idle, maintenance, fault, offline)
 * - equipment_type: 设备类型过滤
 * - is_active: 是否激活 (true/false)
 * - is_available_for_scheduling: 是否可用于排程 (true/false)
 */
router.get('/equipment', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      equipment_type,
      is_active,
      is_available_for_scheduling
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

    // 构建设备主表查询条件
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (equipment_type) {
      whereClause.equipment_type = equipment_type;
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // 查询设备数据，包含排程扩展属性
    const { count, rows } = await Equipment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: EquipmentSchedulingExt,
          as: 'schedulingExt',
          required: false,
          where: is_available_for_scheduling !== undefined
            ? { is_available_for_scheduling: is_available_for_scheduling === 'true' }
            : undefined
        }
      ],
      limit: pageSize,
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    // 格式化响应数据
    const formattedData = rows.map(equipment => {
      const equipmentData = equipment.toJSON();
      const schedulingExt = equipmentData.schedulingExt;
      delete equipmentData.schedulingExt;

      return {
        ...equipmentData,
        scheduling: schedulingExt ? {
          capacity_per_hour: schedulingExt.capacity_per_hour,
          scheduling_weight: schedulingExt.scheduling_weight,
          is_available_for_scheduling: schedulingExt.is_available_for_scheduling
        } : null
      };
    });

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('获取统一设备数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});


/**
 * GET /api/master-data/equipment/:id
 * 获取单个设备详情，包含排程扩展属性
 */
router.get('/equipment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: EquipmentSchedulingExt,
          as: 'schedulingExt',
          required: false
        }
      ]
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    const equipmentData = equipment.toJSON();
    const schedulingExt = equipmentData.schedulingExt;
    delete equipmentData.schedulingExt;

    res.json({
      success: true,
      data: {
        ...equipmentData,
        scheduling: schedulingExt ? {
          capacity_per_hour: schedulingExt.capacity_per_hour,
          scheduling_weight: schedulingExt.scheduling_weight,
          is_available_for_scheduling: schedulingExt.is_available_for_scheduling
        } : null
      }
    });
  } catch (error) {
    console.error('获取设备详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * PUT /api/master-data/equipment/:id/scheduling
 * 更新设备排程扩展属性
 * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
 */
router.put('/equipment/:id/scheduling', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity_per_hour, scheduling_weight, is_available_for_scheduling } = req.body;

    // 验证设备是否存在
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    // 查找或创建排程扩展记录
    let schedulingExt = await EquipmentSchedulingExt.findOne({
      where: { equipment_id: id }
    });

    const updateData = {};
    if (capacity_per_hour !== undefined) updateData.capacity_per_hour = capacity_per_hour;
    if (scheduling_weight !== undefined) updateData.scheduling_weight = scheduling_weight;
    if (is_available_for_scheduling !== undefined) updateData.is_available_for_scheduling = is_available_for_scheduling;

    if (schedulingExt) {
      await schedulingExt.update(updateData);
    } else {
      schedulingExt = await EquipmentSchedulingExt.create({
        equipment_id: id,
        ...updateData
      });
    }

    res.json({
      success: true,
      message: '设备排程属性更新成功',
      data: {
        equipment_id: id,
        scheduling: {
          capacity_per_hour: schedulingExt.capacity_per_hour,
          scheduling_weight: schedulingExt.scheduling_weight,
          is_available_for_scheduling: schedulingExt.is_available_for_scheduling
        }
      }
    });
  } catch (error) {
    console.error('更新设备排程属性错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});


/**
 * GET /api/master-data/materials
 * 统一物料查询API - 返回物料主数据 + 排程扩展属性 + 关系配置数据
 * Requirements: 6.2, 6.5, 6.6
 * 
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 10)
 * - status: 物料状态过滤 (active, inactive)
 * - material_type: 物料类型过滤
 * - include_relations: 是否包含关系配置数据 (true/false, 默认: true)
 */
router.get('/materials', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      material_type,
      include_relations = 'true'
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

    // 构建物料主表查询条件
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (material_type) {
      whereClause.material_type = material_type;
    }

    // 查询物料数据，包含排程扩展属性
    const { count, rows } = await Material.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MaterialSchedulingExt,
          as: 'schedulingExt',
          required: false,
          include: include_relations === 'true' ? [
            {
              model: Device,
              as: 'defaultDevice',
              required: false,
              attributes: ['id', 'device_code', 'device_name', 'status']
            },
            {
              model: Mold,
              as: 'defaultMold',
              required: false,
              attributes: ['id', 'mold_code', 'mold_name', 'status']
            }
          ] : []
        }
      ],
      limit: pageSize,
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    // 如果需要包含关系配置数据，额外查询
    let deviceRelationsMap = {};
    let moldRelationsMap = {};

    if (include_relations === 'true' && rows.length > 0) {
      const materialIds = rows.map(m => m.id);

      // 查询物料-设备关系
      const deviceRelations = await MaterialDeviceRelation.findAll({
        where: { material_id: { [Op.in]: materialIds } },
        include: [
          {
            model: Device,
            attributes: ['id', 'device_code', 'device_name', 'status']
          }
        ]
      });

      // 查询物料-模具关系
      const moldRelations = await MaterialMoldRelation.findAll({
        where: { material_id: { [Op.in]: materialIds } },
        include: [
          {
            model: Mold,
            attributes: ['id', 'mold_code', 'mold_name', 'status']
          }
        ]
      });

      // 构建关系映射
      deviceRelations.forEach(rel => {
        if (!deviceRelationsMap[rel.material_id]) {
          deviceRelationsMap[rel.material_id] = [];
        }
        deviceRelationsMap[rel.material_id].push({
          device_id: rel.device_id,
          device_code: rel.Device?.device_code,
          device_name: rel.Device?.device_name,
          device_status: rel.Device?.status,
          weight: rel.weight
        });
      });

      moldRelations.forEach(rel => {
        if (!moldRelationsMap[rel.material_id]) {
          moldRelationsMap[rel.material_id] = [];
        }
        moldRelationsMap[rel.material_id].push({
          mold_id: rel.mold_id,
          mold_code: rel.Mold?.mold_code,
          mold_name: rel.Mold?.mold_name,
          mold_status: rel.Mold?.status,
          weight: rel.weight,
          cycle_time: rel.cycle_time,
          output_per_cycle: rel.output_per_cycle
        });
      });
    }

    // 格式化响应数据
    const formattedData = rows.map(material => {
      const materialData = material.toJSON();
      const schedulingExt = materialData.schedulingExt;
      delete materialData.schedulingExt;

      return {
        ...materialData,
        scheduling: schedulingExt ? {
          default_device_id: schedulingExt.default_device_id,
          default_mold_id: schedulingExt.default_mold_id,
          default_device: schedulingExt.defaultDevice || null,
          default_mold: schedulingExt.defaultMold || null,
          device_relations: deviceRelationsMap[material.id] || [],
          mold_relations: moldRelationsMap[material.id] || []
        } : {
          default_device_id: null,
          default_mold_id: null,
          default_device: null,
          default_mold: null,
          device_relations: deviceRelationsMap[material.id] || [],
          mold_relations: moldRelationsMap[material.id] || []
        }
      };
    });

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('获取统一物料数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});


/**
 * GET /api/master-data/materials/:id
 * 获取单个物料详情，包含排程扩展属性和关系配置
 */
router.get('/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [
        {
          model: MaterialSchedulingExt,
          as: 'schedulingExt',
          required: false,
          include: [
            {
              model: Device,
              as: 'defaultDevice',
              required: false,
              attributes: ['id', 'device_code', 'device_name', 'status']
            },
            {
              model: Mold,
              as: 'defaultMold',
              required: false,
              attributes: ['id', 'mold_code', 'mold_name', 'status']
            }
          ]
        }
      ]
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    // 查询关系配置
    const deviceRelations = await MaterialDeviceRelation.findAll({
      where: { material_id: id },
      include: [
        {
          model: Device,
          attributes: ['id', 'device_code', 'device_name', 'status']
        }
      ]
    });

    const moldRelations = await MaterialMoldRelation.findAll({
      where: { material_id: id },
      include: [
        {
          model: Mold,
          attributes: ['id', 'mold_code', 'mold_name', 'status']
        }
      ]
    });

    const materialData = material.toJSON();
    const schedulingExt = materialData.schedulingExt;
    delete materialData.schedulingExt;

    res.json({
      success: true,
      data: {
        ...materialData,
        scheduling: {
          default_device_id: schedulingExt?.default_device_id || null,
          default_mold_id: schedulingExt?.default_mold_id || null,
          default_device: schedulingExt?.defaultDevice || null,
          default_mold: schedulingExt?.defaultMold || null,
          device_relations: deviceRelations.map(rel => ({
            device_id: rel.device_id,
            device_code: rel.Device?.device_code,
            device_name: rel.Device?.device_name,
            device_status: rel.Device?.status,
            weight: rel.weight
          })),
          mold_relations: moldRelations.map(rel => ({
            mold_id: rel.mold_id,
            mold_code: rel.Mold?.mold_code,
            mold_name: rel.Mold?.mold_name,
            mold_status: rel.Mold?.status,
            weight: rel.weight,
            cycle_time: rel.cycle_time,
            output_per_cycle: rel.output_per_cycle
          }))
        }
      }
    });
  } catch (error) {
    console.error('获取物料详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * PUT /api/master-data/materials/:id/scheduling
 * 更新物料排程扩展属性
 * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
 */
router.put('/materials/:id/scheduling', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { default_device_id, default_mold_id } = req.body;

    // 验证物料是否存在
    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    // 查找或创建排程扩展记录
    let schedulingExt = await MaterialSchedulingExt.findOne({
      where: { material_id: id }
    });

    const updateData = {};
    if (default_device_id !== undefined) updateData.default_device_id = default_device_id;
    if (default_mold_id !== undefined) updateData.default_mold_id = default_mold_id;

    if (schedulingExt) {
      await schedulingExt.update(updateData);
    } else {
      schedulingExt = await MaterialSchedulingExt.create({
        material_id: id,
        ...updateData
      });
    }

    res.json({
      success: true,
      message: '物料排程属性更新成功',
      data: {
        material_id: id,
        scheduling: {
          default_device_id: schedulingExt.default_device_id,
          default_mold_id: schedulingExt.default_mold_id
        }
      }
    });
  } catch (error) {
    console.error('更新物料排程属性错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});


/**
 * GET /api/master-data/molds
 * 统一模具查询API - 返回模具数据 + 设备关联 + 排程扩展属性
 * Requirements: 6.3, 6.5, 6.6
 * 
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 10)
 * - status: 模具状态过滤 (normal, maintenance, idle, scrapped)
 * - include_equipment: 是否包含设备关联数据 (true/false, 默认: true)
 */
router.get('/molds', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      include_equipment = 'true'
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit)));

    // 构建模具主表查询条件
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    // 构建include配置
    const includeConfig = [
      {
        model: MoldSchedulingExt,
        as: 'schedulingExt',
        required: false
      }
    ];

    // 如果需要包含设备关联
    if (include_equipment === 'true') {
      includeConfig.push({
        model: MoldEquipmentRelation,
        as: 'equipmentRelations',
        required: false,
        include: [
          {
            model: Equipment,
            as: 'equipment',
            required: false,
            attributes: ['id', 'equipment_code', 'equipment_name', 'equipment_type', 'status', 'is_active']
          }
        ]
      });
    }

    // 查询模具数据
    const { count, rows } = await Mold.findAndCountAll({
      where: whereClause,
      include: includeConfig,
      limit: pageSize,
      offset: offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // 格式化响应数据
    const formattedData = rows.map(mold => {
      const moldData = mold.toJSON();
      const schedulingExt = moldData.schedulingExt;
      const equipmentRelations = moldData.equipmentRelations || [];
      delete moldData.schedulingExt;
      delete moldData.equipmentRelations;

      return {
        ...moldData,
        equipment_relations: equipmentRelations.map(rel => ({
          equipment_id: rel.equipment_id,
          equipment_code: rel.equipment?.equipment_code,
          equipment_name: rel.equipment?.equipment_name,
          equipment_type: rel.equipment?.equipment_type,
          equipment_status: rel.equipment?.status,
          is_active: rel.equipment?.is_active,
          is_primary: rel.is_primary
        })),
        scheduling: schedulingExt ? {
          scheduling_weight: schedulingExt.scheduling_weight
        } : null
      };
    });

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('获取统一模具数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * GET /api/master-data/molds/:id
 * 获取单个模具详情，包含设备关联和排程扩展属性
 */
router.get('/molds/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const mold = await Mold.findByPk(id, {
      include: [
        {
          model: MoldSchedulingExt,
          as: 'schedulingExt',
          required: false
        },
        {
          model: MoldEquipmentRelation,
          as: 'equipmentRelations',
          required: false,
          include: [
            {
              model: Equipment,
              as: 'equipment',
              required: false,
              attributes: ['id', 'equipment_code', 'equipment_name', 'equipment_type', 'status', 'is_active']
            }
          ]
        }
      ]
    });

    if (!mold) {
      return res.status(404).json({
        success: false,
        message: '模具不存在'
      });
    }

    const moldData = mold.toJSON();
    const schedulingExt = moldData.schedulingExt;
    const equipmentRelations = moldData.equipmentRelations || [];
    delete moldData.schedulingExt;
    delete moldData.equipmentRelations;

    res.json({
      success: true,
      data: {
        ...moldData,
        equipment_relations: equipmentRelations.map(rel => ({
          equipment_id: rel.equipment_id,
          equipment_code: rel.equipment?.equipment_code,
          equipment_name: rel.equipment?.equipment_name,
          equipment_type: rel.equipment?.equipment_type,
          equipment_status: rel.equipment?.status,
          is_active: rel.equipment?.is_active,
          is_primary: rel.is_primary
        })),
        scheduling: schedulingExt ? {
          scheduling_weight: schedulingExt.scheduling_weight
        } : null
      }
    });
  } catch (error) {
    console.error('获取模具详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * PUT /api/master-data/molds/:id/scheduling
 * 更新模具排程扩展属性
 * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
 */
router.put('/molds/:id/scheduling', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduling_weight } = req.body;

    // 验证模具是否存在
    const mold = await Mold.findByPk(id);
    if (!mold) {
      return res.status(404).json({
        success: false,
        message: '模具不存在'
      });
    }

    // 查找或创建排程扩展记录
    let schedulingExt = await MoldSchedulingExt.findOne({
      where: { mold_id: id }
    });

    const updateData = {};
    if (scheduling_weight !== undefined) updateData.scheduling_weight = scheduling_weight;

    if (schedulingExt) {
      await schedulingExt.update(updateData);
    } else {
      schedulingExt = await MoldSchedulingExt.create({
        mold_id: id,
        ...updateData
      });
    }

    res.json({
      success: true,
      message: '模具排程属性更新成功',
      data: {
        mold_id: id,
        scheduling: {
          scheduling_weight: schedulingExt.scheduling_weight
        }
      }
    });
  } catch (error) {
    console.error('更新模具排程属性错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * POST /api/master-data/molds/:id/equipment
 * 添加模具-设备关联
 * Requirements: 2.4 - 模具与设备建立关联时记录绑定关系
 */
router.post('/molds/:id/equipment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_id, is_primary = false } = req.body;

    // 验证模具是否存在
    const mold = await Mold.findByPk(id);
    if (!mold) {
      return res.status(404).json({
        success: false,
        message: '模具不存在'
      });
    }

    // 验证设备是否存在
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    // 检查关联是否已存在
    const existingRelation = await MoldEquipmentRelation.findOne({
      where: { mold_id: id, equipment_id }
    });

    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: '该模具-设备关联已存在'
      });
    }

    // 创建关联
    const relation = await MoldEquipmentRelation.create({
      mold_id: id,
      equipment_id,
      is_primary
    });

    res.json({
      success: true,
      message: '模具-设备关联创建成功',
      data: {
        id: relation.id,
        mold_id: id,
        equipment_id,
        is_primary
      }
    });
  } catch (error) {
    console.error('创建模具-设备关联错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * DELETE /api/master-data/molds/:id/equipment/:equipmentId
 * 删除模具-设备关联
 */
router.delete('/molds/:id/equipment/:equipmentId', authenticateToken, async (req, res) => {
  try {
    const { id, equipmentId } = req.params;

    const relation = await MoldEquipmentRelation.findOne({
      where: { mold_id: id, equipment_id: equipmentId }
    });

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: '模具-设备关联不存在'
      });
    }

    await relation.destroy();

    res.json({
      success: true,
      message: '模具-设备关联删除成功'
    });
  } catch (error) {
    console.error('删除模具-设备关联错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});


// ============================================
// 级联删除API
// Requirements: 4.5, 4.6
// ============================================

/**
 * GET /api/master-data/equipment/:id/delete-preview
 * 获取设备删除前的关联数据预览
 * Requirements: 4.6
 */
router.get('/equipment/:id/delete-preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await CascadeDeleteService.previewEquipmentDeleteCascade(id);
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('获取设备删除预览错误:', error);
    
    if (error.message === '设备不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * DELETE /api/master-data/equipment/:id
 * 删除设备及其关联数据（级联删除）
 * Requirements: 4.6 - 设备删除时自动清理相关关系配置
 * 
 * 清理内容:
 * - 物料-设备关系 (material_device_relations)
 * - 模具-设备关系 (mold_equipment_relations)
 * - 设备排程扩展数据 (equipment_scheduling_ext)
 */
router.delete('/equipment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CascadeDeleteService.deleteEquipmentCascade(id);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        equipmentId: result.equipmentId,
        deletedRelations: result.deletedRelations
      }
    });
  } catch (error) {
    console.error('删除设备错误:', error);
    
    if (error.message === '设备不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * GET /api/master-data/materials/:id/delete-preview
 * 获取物料删除前的关联数据预览
 * Requirements: 4.5
 */
router.get('/materials/:id/delete-preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await CascadeDeleteService.previewMaterialDeleteCascade(id);
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('获取物料删除预览错误:', error);
    
    if (error.message === '物料不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * DELETE /api/master-data/materials/:id
 * 删除物料及其关联数据（级联删除）
 * Requirements: 4.5 - 物料删除时自动清理相关关系配置
 * 
 * 清理内容:
 * - 物料-设备关系 (material_device_relations)
 * - 物料-模具关系 (material_mold_relations)
 * - 物料排程扩展数据 (material_scheduling_ext)
 */
router.delete('/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CascadeDeleteService.deleteMaterialCascade(id);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        materialId: result.materialId,
        deletedRelations: result.deletedRelations
      }
    });
  } catch (error) {
    console.error('删除物料错误:', error);
    
    if (error.message === '物料不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * GET /api/master-data/molds/:id/delete-preview
 * 获取模具删除前的关联数据预览
 * Requirements: 4.5, 4.6
 */
router.get('/molds/:id/delete-preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await CascadeDeleteService.previewMoldDeleteCascade(id);
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('获取模具删除预览错误:', error);
    
    if (error.message === '模具不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * DELETE /api/master-data/molds/:id
 * 删除模具及其关联数据（级联删除）
 * Requirements: 4.5, 4.6 - 模具删除时自动清理相关关系配置
 * 
 * 清理内容:
 * - 物料-模具关系 (material_mold_relations)
 * - 模具-设备关系 (mold_equipment_relations)
 * - 模具排程扩展数据 (mold_scheduling_ext)
 */
router.delete('/molds/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CascadeDeleteService.deleteMoldCascade(id);
    
    res.json({
      success: true,
      message: result.message,
      data: {
        moldId: result.moldId,
        deletedRelations: result.deletedRelations
      }
    });
  } catch (error) {
    console.error('删除模具错误:', error);
    
    if (error.message === '模具不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;
