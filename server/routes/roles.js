const express = require('express');
const router = express.Router();
const PermissionService = require('../services/permissionService');
const { authenticateToken } = require('../routes/auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const logger = require('../utils/logger');

/**
 * 角色管理 API
 */

// 获取所有角色
router.get('/',
  authenticateToken,
  authorize(['system.role.read']),
  async (req, res) => {
    try {
      const roles = await PermissionService.getAllRoles();
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      logger.error('获取角色列表失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取角色详情
router.get('/:id',
  authenticateToken,
  authorize(['system.role.read']),
  async (req, res) => {
    try {
      const role = await PermissionService.getRoleDetail(req.params.id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: '角色不存在'
        });
      }
      
      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      logger.error('获取角色详情失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 创建角色
router.post('/',
  authenticateToken,
  authorize(['system.role.create']),
  auditLogger('ROLE_CREATE'),
  async (req, res) => {
    try {
      const { role_name, role_display_name, description, is_system } = req.body;
      
      const role = await PermissionService.createRole({
        role_name,
        role_display_name,
        description,
        is_system
      });
      
      res.status(201).json({
        success: true,
        message: '角色创建成功',
        data: role
      });
    } catch (error) {
      logger.error('创建角色失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 更新角色
router.put('/:id',
  authenticateToken,
  authorize(['system.role.update']),
  auditLogger('ROLE_UPDATE'),
  async (req, res) => {
    try {
      const role = await PermissionService.updateRole(req.params.id, req.body);
      
      res.json({
        success: true,
        message: '角色更新成功',
        data: role
      });
    } catch (error) {
      logger.error('更新角色失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 删除角色
router.delete('/:id',
  authenticateToken,
  authorize(['system.role.delete']),
  auditLogger('ROLE_DELETE'),
  async (req, res) => {
    try {
      await PermissionService.deleteRole(req.params.id);
      
      res.json({
        success: true,
        message: '角色删除成功'
      });
    } catch (error) {
      logger.error('删除角色失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 为角色分配权限
router.put('/:id/permissions',
  authenticateToken,
  authorize(['system.permission.update']),
  auditLogger('ROLE_PERMISSION_ASSIGN'),
  async (req, res) => {
    try {
      const { permissionIds } = req.body;
      
      await PermissionService.assignPermissionsToRole(req.params.id, permissionIds);
      
      res.json({
        success: true,
        message: '权限分配成功'
      });
    } catch (error) {
      logger.error('分配权限失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 获取角色的权限列表
router.get('/:id/permissions',
  authenticateToken,
  authorize(['system.role.read']),
  async (req, res) => {
    try {
      const role = await PermissionService.getRoleDetail(req.params.id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: '角色不存在'
        });
      }
      
      res.json({
        success: true,
        data: role.permissions
      });
    } catch (error) {
      logger.error('获取角色权限失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
