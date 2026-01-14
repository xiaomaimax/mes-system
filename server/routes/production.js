const express = require('express');
const ProductionOrder = require('../models/ProductionOrder');
const ProductionTask = require('../models/ProductionTask');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');
const { asyncHandler, ValidationError, NotFoundError, DatabaseError } = require('../middleware/errorHandler');
const { createValidationMiddleware, validationRules } = require('../middleware/validation');
const { withTransaction } = require('../utils/transaction');

const router = express.Router();

// 获取生产订单列表
router.get('/orders', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, production_line_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (production_line_id) whereClause.production_line_id = production_line_id;

    const { count, rows } = await ProductionOrder.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    logger.info('获取生产订单列表', { 
      userId: req.user.userId,
      count,
      page,
      limit
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  })
);

// 创建生产订单 - 使用事务处理
router.post('/orders',
  authenticateToken,
  createValidationMiddleware({
    order_number: validationRules.order_number,
    product_code: validationRules.product_code,
    planned_quantity: validationRules.planned_quantity
  }),
  asyncHandler(async (req, res) => {
    const {
      order_number,
      product_code,
      product_name,
      planned_quantity,
      production_line_id,
      planned_start_time,
      planned_end_time,
      priority,
      notes
    } = req.body;

    // 使用事务确保数据一致性
    const result = await withTransaction(async (transaction) => {
      // 检查订单号是否已存在
      const existingOrder = await ProductionOrder.findOne({
        where: { order_number },
        transaction
      });

      if (existingOrder) {
        logger.warn('创建订单失败 - 订单号已存在', { 
          order_number,
          userId: req.user.userId
        });
        throw new ValidationError('订单号已存在', ['该订单号已被使用']);
      }

      // 创建生产订单
      const newOrder = await ProductionOrder.create({
        order_number,
        product_code,
        product_name,
        planned_quantity,
        production_line_id,
        planned_start_time,
        planned_end_time,
        priority: priority || 'normal',
        notes,
        created_by: req.user.userId,
        status: 'pending'
      }, { transaction });

      // 创建初始任务记录
      await ProductionTask.create({
        order_id: newOrder.id,
        task_number: `${order_number}-001`,
        status: 'pending',
        created_by: req.user.userId
      }, { transaction });

      logger.info('生产订单创建成功', {
        orderId: newOrder.id,
        orderNumber: order_number,
        userId: req.user.userId
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: result
    });
  })
);

// 更新生产订单状态 - 使用事务处理
router.put('/orders/:id/status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('状态不能为空', ['status字段必填']);
    }

    const result = await withTransaction(async (transaction) => {
      const order = await ProductionOrder.findByPk(id, { transaction });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      // 更新订单状态
      await order.update({ status }, { transaction });

      // 如果订单完成，更新相关任务
      if (status === 'completed') {
        await ProductionTask.update(
          { status: 'completed' },
          { where: { order_id: id }, transaction }
        );
      }

      logger.info('订单状态更新成功', {
        orderId: id,
        newStatus: status,
        userId: req.user.userId
      });

      return order;
    });

    res.json({
      success: true,
      message: '订单状态更新成功',
      data: result
    });
  })
);

// 删除生产订单 - 使用事务处理
router.delete('/orders/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await withTransaction(async (transaction) => {
      const order = await ProductionOrder.findByPk(id, { transaction });

      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      // 删除相关任务
      await ProductionTask.destroy({
        where: { order_id: id },
        transaction
      });

      // 删除订单
      await order.destroy({ transaction });

      logger.info('订单删除成功', {
        orderId: id,
        orderNumber: order.order_number,
        userId: req.user.userId
      });

      return { id, orderNumber: order.order_number };
    });

    res.json({
      success: true,
      message: '订单删除成功',
      data: result
    });
  })
);

module.exports = router;