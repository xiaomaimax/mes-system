const express = require('express');
const router = express.Router();
const MenuPermission = require('../models/MenuPermission');
const { authenticateToken } = require('../routes/auth');
const logger = require('../utils/logger');

/**
 * 菜单 API
 */

// 获取用户可见菜单树
router.get('/tree',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const menuTree = await MenuPermission.getUserMenuTree(userId);
      
      res.json({
        success: true,
        data: menuTree
      });
    } catch (error) {
      logger.error('获取菜单树失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取所有菜单（管理员用）
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      // 检查是否是 admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }
      
      const menus = await MenuPermission.findAll({
        order: [['sort_order', 'ASC']]
      });
      
      res.json({
        success: true,
        data: menus
      });
    } catch (error) {
      logger.error('获取菜单列表失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
