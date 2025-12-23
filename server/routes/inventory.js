const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取库存列表
router.get('/', authenticateToken, async (req, res) => {
  try {
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

    res.json({ inventory });
  } catch (error) {
    console.error('获取库存列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;