const express = require('express');
const ProductionOrder = require('../models/ProductionOrder');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取生产订单列表
router.get('/orders', authenticateToken, async (req, res) => {
  try {
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

    res.json({
      orders: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取生产订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建生产订单
router.post('/orders', authenticateToken, async (req, res) => {
  try {
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

    if (!order_number || !product_code || !product_name || !planned_quantity || !production_line_id) {
      return res.status(400).json({ message: '必填字段不能为空' });
    }

    const existingOrder = await ProductionOrder.findOne({
      where: { order_number }
    });

    if (existingOrder) {
      return res.status(400).json({ message: '订单号已存在' });
    }

    const order = await ProductionOrder.create({
      order_number,
      product_code,
      product_name,
      planned_quantity,
      production_line_id,
      planned_start_time,
      planned_end_time,
      priority: priority || 'normal',
      notes,
      created_by: req.user.userId
    });

    res.status(201).json({
      message: '生产订单创建成功',
      order
    });
  } catch (error) {
    console.error('创建生产订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新生产订单
router.put('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await ProductionOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '生产订单不存在' });
    }

    await order.update(updateData);

    res.json({
      message: '生产订单更新成功',
      order
    });
  } catch (error) {
    console.error('更新生产订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 开始生产
router.post('/orders/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await ProductionOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '生产订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: '只能开始待生产的订单' });
    }

    await order.update({
      status: 'in_progress',
      actual_start_time: new Date()
    });

    res.json({
      message: '生产已开始',
      order
    });
  } catch (error) {
    console.error('开始生产错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 完成生产
router.post('/orders/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await ProductionOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '生产订单不存在' });
    }

    if (order.status !== 'in_progress') {
      return res.status(400).json({ message: '只能完成进行中的订单' });
    }

    await order.update({
      status: 'completed',
      actual_end_time: new Date()
    });

    res.json({
      message: '生产已完成',
      order
    });
  } catch (error) {
    console.error('完成生产错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新生产数量
router.post('/orders/:id/update-quantity', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { produced_quantity, qualified_quantity, defective_quantity } = req.body;

    const order = await ProductionOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '生产订单不存在' });
    }

    const updateData = {};
    if (produced_quantity !== undefined) updateData.produced_quantity = produced_quantity;
    if (qualified_quantity !== undefined) updateData.qualified_quantity = qualified_quantity;
    if (defective_quantity !== undefined) updateData.defective_quantity = defective_quantity;

    await order.update(updateData);

    res.json({
      message: '生产数量更新成功',
      order
    });
  } catch (error) {
    console.error('更新生产数量错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;