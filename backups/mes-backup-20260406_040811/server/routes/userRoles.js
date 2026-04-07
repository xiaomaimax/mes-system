const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * 用户角色管理 API
 */

// 获取用户的角色列表
router.get('/user/:userId/roles',
  authenticateToken,
  authorize(['system.role.read']),
  async (req, res) => {
    try {
      const userRoles = await UserRole.findAll({
        where: { user_id: req.params.userId }
      });
      
      const roleIds = userRoles.map(ur => ur.role_id);
      const roles = await Role.findAll({
        where: { id: roleIds }
      });
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      logger.error('获取用户角色失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 给用户分配角色
router.post('/user/:userId/roles',
  authenticateToken,
  authorize(['system.role.update']),
  auditLogger('USER_ROLE_ASSIGN'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;
      
      if (!Array.isArray(roleIds) || roleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供角色 ID 列表'
        });
      }
      
      // 验证用户存在
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 删除旧的角色关联
      await UserRole.destroy({ where: { user_id: userId } });
      
      // 添加新的角色关联
      const userRoles = await UserRole.bulkCreate(
        roleIds.map(roleId => ({ user_id: userId, role_id: roleId }))
      );
      
      logger.info('用户角色分配成功', { userId, roleIds });
      
      res.json({
        success: true,
        message: '角色分配成功',
        data: { userId, roleIds }
      });
    } catch (error) {
      logger.error('分配用户角色失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 移除用户的角色
router.delete('/user/:userId/roles/:roleId',
  authenticateToken,
  authorize(['system.role.update']),
  auditLogger('USER_ROLE_REMOVE'),
  async (req, res) => {
    try {
      const { userId, roleId } = req.params;
      
      const deleted = await UserRole.destroy({
        where: { user_id: userId, role_id: roleId }
      });
      
      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          message: '用户角色关联不存在'
        });
      }
      
      logger.info('用户角色移除成功', { userId, roleId });
      
      res.json({
        success: true,
        message: '角色移除成功'
      });
    } catch (error) {
      logger.error('移除用户角色失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
