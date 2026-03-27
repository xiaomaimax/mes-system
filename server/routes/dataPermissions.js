const express = require('express');
const router = express.Router();
const DataPermission = require('../models/DataPermission');
const Role = require('../models/Role');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const { authorize } = require('../middleware/authorize');
const { auditLogger } = require('../middleware/auditLogger');
const logger = require('../utils/logger');

// 获取资源的数据权限配置
router.get('/:resourceType',
  authenticateToken,
  authorize(['system.permission.read']),
  async (req, res) => {
    try {
      const permissions = await DataPermission.findAll({
        where: { resource_type: req.params.resourceType },
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'role_name', 'role_display_name']
        }],
        order: [['role_id', 'ASC']]
      });
      
      res.json({ success: true, data: permissions });
    } catch (error) {
      logger.error('获取数据权限失败', { error: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 创建/更新数据权限
router.post('/',
  authenticateToken,
  authorize(['system.permission.update']),
  auditLogger('DATA_PERMISSION_UPDATE'),
  async (req, res) => {
    try {
      const { role_id, resource_type, scope_type, scope_value, can_view, can_edit, can_delete, can_export } = req.body;
      
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(404).json({ success: false, message: '角色不存在' });
      }
      
      const [permission, created] = await DataPermission.findOrCreate({
        where: { role_id, resource_type },
        defaults: { scope_type, scope_value, can_view, can_edit, can_delete, can_export }
      });
      
      if (!created) {
        await permission.update({ scope_type, scope_value, can_view, can_edit, can_delete, can_export });
      }
      
      res.json({ success: true, message: '配置成功', data: permission });
    } catch (error) {
      logger.error('配置数据权限失败', { error: error.message });
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// 获取用户的数据范围
router.get('/user/:userId/scope/:resourceType',
  authenticateToken,
  authorize(['system.role.read']),
  async (req, res) => {
    try {
      const dataScope = await DataPermission.getUserDataScope(req.params.userId, req.params.resourceType);
      res.json({ success: true, data: dataScope });
    } catch (error) {
      logger.error('获取用户数据范围失败', { error: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
