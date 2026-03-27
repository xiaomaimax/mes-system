const express = require('express');
const router = express.Router();
const PermissionService = require('../services/permissionService');
const { authenticateToken } = require('../routes/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const logger = require('../utils/logger');

/**
 * 权限管理 API
 */

// 获取所有权限
router.get('/',
  authenticateToken,
  authorize(['system.permission.read']),
  async (req, res) => {
    try {
      const permissions = await PermissionService.getAllPermissions();
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      logger.error('获取权限列表失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取权限树（按模块分组）
router.get('/tree',
  authenticateToken,
  authorize(['system.permission.read']),
  async (req, res) => {
    try {
      const tree = await PermissionService.getPermissionTree();
      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      logger.error('获取权限树失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 创建权限
router.post('/',
  authenticateToken,
  authorize(['system.permission.update']),
  auditLogger('PERMISSION_CREATE'),
  async (req, res) => {
    try {
      const { permission_code, permission_name, module, action_type, description } = req.body;
      
      const permission = await PermissionService.createPermission({
        permission_code,
        permission_name,
        module,
        action_type,
        description
      });
      
      res.status(201).json({
        success: true,
        message: '权限创建成功',
        data: permission
      });
    } catch (error) {
      logger.error('创建权限失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 更新权限
router.put('/:id',
  authenticateToken,
  authorize(['system.permission.update']),
  auditLogger('PERMISSION_UPDATE'),
  async (req, res) => {
    try {
      const permission = await PermissionService.updatePermission(req.params.id, req.body);
      
      res.json({
        success: true,
        message: '权限更新成功',
        data: permission
      });
    } catch (error) {
      logger.error('更新权限失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 删除权限
router.delete('/:id',
  authenticateToken,
  authorize(['system.permission.update']),
  auditLogger('PERMISSION_DELETE'),
  async (req, res) => {
    try {
      await PermissionService.deletePermission(req.params.id);
      
      res.json({
        success: true,
        message: '权限删除成功'
      });
    } catch (error) {
      logger.error('删除权限失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
