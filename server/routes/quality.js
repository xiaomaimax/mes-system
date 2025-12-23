const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取质量检验记录
router.get('/inspections', authenticateToken, async (req, res) => {
  try {
    // 模拟数据，实际应从数据库获取
    const inspections = [
      {
        id: 1,
        order_number: 'PO-2024-001',
        product_name: '产品A',
        inspected_quantity: 1000,
        qualified_quantity: 985,
        defective_quantity: 15,
        quality_rate: 98.5,
        inspector: '张三',
        inspection_date: '2024-01-15'
      }
    ];

    res.json({ inspections });
  } catch (error) {
    console.error('获取质量检验记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;