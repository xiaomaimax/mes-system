const express = require('express');
const Equipment = require('../models/Equipment');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取设备列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, production_line_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_active: true };
    if (status) whereClause.status = status;
    if (production_line_id) whereClause.production_line_id = production_line_id;

    const { count, rows } = await Equipment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      equipment: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取设备列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新设备状态
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: '设备不存在' });
    }

    await equipment.update({ status });

    res.json({
      message: '设备状态更新成功',
      equipment
    });
  } catch (error) {
    console.error('更新设备状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;