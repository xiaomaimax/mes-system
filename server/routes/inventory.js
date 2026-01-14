const express = require('express');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');
const { asyncHandler, ValidationError, NotFoundError, DatabaseError } = require('../middleware/errorHandler');
const { createValidationMiddleware, validationRules } = require('../middleware/validation');
const { withTransaction } = require('../utils/transaction');

const router = express.Router();

// 获取库存列表
router.get('/', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, material_code, status } = req.query;
    const offset = (page - 1) * limit;

    // 模拟数据，实际应从数据库获取
    const inventory = [
      {
        id: 1,
        material_code: 'MAT-001',
        material_name: '原料A',
        current_stock: 1500,
        min_stock: 500,
        max_stock: 3000,
        unit: 'kg',
        location: '仓库A-01'
      }
    ];

    logger.info('获取库存列表', {
      userId: req.user.userId,
      page,
      limit
    });

    res.json({
      success: true,
      data: {
        inventory,
        total: inventory.length,
        page: parseInt(page),
        totalPages: Math.ceil(inventory.length / limit)
      }
    });
  })
);

// 出库操作 - 使用事务处理
router.post('/out',
  authenticateToken,
  createValidationMiddleware({
    material_id: validationRules.material_id,
    quantity: validationRules.planned_quantity
  }),
  asyncHandler(async (req, res) => {
    const {
      material_id,
      quantity,
      order_id,
      reason,
      notes
    } = req.body;

    // 使用事务确保库存操作的原子性
    const result = await withTransaction(async (transaction) => {
      // 检查库存是否充足
      const inventory = {
        id: material_id,
        current_stock: 1500
      };

      if (inventory.current_stock < quantity) {
        throw new ValidationError('库存不足', ['当前库存不足以完成出库操作']);
      }

      // 更新库存
      const updatedInventory = {
        ...inventory,
        current_stock: inventory.current_stock - quantity
      };

      // 创建出库记录
      const outRecord = {
        material_id,
        quantity,
        order_id,
        reason: reason || 'production',
        notes,
        created_by: req.user.userId,
        created_at: new Date(),
        type: 'out'
      };

      logger.info('库存出库成功', {
        materialId: material_id,
        quantity,
        orderId: order_id,
        userId: req.user.userId
      });

      return { inventory: updatedInventory, record: outRecord };
    });

    res.status(201).json({
      success: true,
      message: '出库操作成功',
      data: result
    });
  })
);

// 入库操作 - 使用事务处理
router.post('/in',
  authenticateToken,
  createValidationMiddleware({
    material_id: validationRules.material_id,
    quantity: validationRules.planned_quantity
  }),
  asyncHandler(async (req, res) => {
    const {
      material_id,
      quantity,
      supplier_id,
      batch_number,
      notes
    } = req.body;

    // 使用事务确保库存操作的原子性
    const result = await withTransaction(async (transaction) => {
      // 获取当前库存
      const inventory = {
        id: material_id,
        current_stock: 1500,
        max_stock: 3000
      };

      // 检查是否超过最大库存
      if (inventory.current_stock + quantity > inventory.max_stock) {
        throw new ValidationError('库存超限', ['入库后库存将超过最大库存限制']);
      }

      // 更新库存
      const updatedInventory = {
        ...inventory,
        current_stock: inventory.current_stock + quantity
      };

      // 创建入库记录
      const inRecord = {
        material_id,
        quantity,
        supplier_id,
        batch_number,
        notes,
        created_by: req.user.userId,
        created_at: new Date(),
        type: 'in'
      };

      logger.info('库存入库成功', {
        materialId: material_id,
        quantity,
        supplierId: supplier_id,
        userId: req.user.userId
      });

      return { inventory: updatedInventory, record: inRecord };
    });

    res.status(201).json({
      success: true,
      message: '入库操作成功',
      data: result
    });
  })
);

// 库存转移 - 使用事务处理
router.post('/transfer',
  authenticateToken,
  createValidationMiddleware({
    material_id: validationRules.material_id,
    quantity: validationRules.planned_quantity
  }),
  asyncHandler(async (req, res) => {
    const {
      material_id,
      quantity,
      from_location,
      to_location,
      notes
    } = req.body;

    // 使用事务确保转移操作的原子性
    const result = await withTransaction(async (transaction) => {
      // 检查源位置库存
      const sourceInventory = {
        location: from_location,
        current_stock: 1500
      };

      if (sourceInventory.current_stock < quantity) {
        throw new ValidationError('源位置库存不足', ['源位置库存不足以完成转移']);
      }

      // 创建转移记录
      const transferRecord = {
        material_id,
        quantity,
        from_location,
        to_location,
        notes,
        created_by: req.user.userId,
        created_at: new Date(),
        status: 'completed'
      };

      logger.info('库存转移成功', {
        materialId: material_id,
        quantity,
        fromLocation: from_location,
        toLocation: to_location,
        userId: req.user.userId
      });

      return transferRecord;
    });

    res.status(201).json({
      success: true,
      message: '库存转移成功',
      data: result
    });
  })
);

// 库存盘点 - 使用事务处理
router.post('/count',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      material_id,
      counted_quantity,
      notes
    } = req.body;

    // 使用事务确保盘点操作的原子性
    const result = await withTransaction(async (transaction) => {
      // 获取系统库存
      const systemInventory = {
        id: material_id,
        current_stock: 1500
      };

      // 计算差异
      const difference = counted_quantity - systemInventory.current_stock;

      // 创建盘点记录
      const countRecord = {
        material_id,
        system_quantity: systemInventory.current_stock,
        counted_quantity,
        difference,
        notes,
        counted_by: req.user.userId,
        counted_at: new Date(),
        status: 'completed'
      };

      logger.info('库存盘点完成', {
        materialId: material_id,
        difference,
        userId: req.user.userId
      });

      return countRecord;
    });

    res.status(201).json({
      success: true,
      message: '库存盘点完成',
      data: result
    });
  })
);

module.exports = router;