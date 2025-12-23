const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 获取生产报表数据
router.get('/production', authenticateToken, async (req, res) => {
  try {
    // 模拟数据，实际应从数据库获取
    const productionReport = {
      daily_output: [
        { date: '2024-01-15', output: 1200, target: 1000 },
        { date: '2024-01-16', output: 1350, target: 1000 }
      ],
      quality_stats: {
        qualified_rate: 98.5,
        defective_rate: 1.5
      }
    };

    res.json(productionReport);
  } catch (error) {
    console.error('获取生产报表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;