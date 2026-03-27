const Role = require('../models/Role');
const Permission = require('../models/Permission');
const UserRole = require('../models/UserRole');
const RolePermission = require('../models/RolePermission');
const Department = require('../models/Department');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 权限管理服务
 */
class PermissionService {
  
  /**
   * 获取所有权限
   */
  static async getAllPermissions() {
    return await Permission.findAll({
      order: [['module', 'ASC'], ['action_type', 'ASC']]
    });
  }
  
  /**
   * 获取权限树（按模块分组）
   */
  static async getPermissionTree() {
    return await Permission.getPermissionTree();
  }
  
  /**
   * 创建权限
   */
  static async createPermission(data) {
    const { permission_code, permission_name, module, action_type, description } = data;
    
    // 检查是否已存在
    const existing = await Permission.findOne({ where: { permission_code } });
    if (existing) {
      throw new Error('权限代码已存在');
    }
    
    return await Permission.create({
      permission_code,
      permission_name,
      module,
      action_type,
      description
    });
  }
  
  /**
   * 更新权限
   */
  static async updatePermission(id, data) {
    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new Error('权限不存在');
    }
    
    return await permission.update(data);
  }
  
  /**
   * 删除权限
   */
  static async deletePermission(id) {
    const permission = await Permission.findByPk(id);
    if (!permission) {
      throw new Error('权限不存在');
    }
    
    // 检查是否被角色使用
    const roleCount = await RolePermission.count({ where: { permission_id: id } });
    if (roleCount > 0) {
      throw new Error('权限正在被使用，无法删除');
    }
    
    await permission.destroy();
  }
  
  /**
   * 获取所有角色
   */
  static async getAllRoles() {
    return await Role.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }],
      order: [['is_system', 'DESC'], ['role_name', 'ASC']]
    });
  }
  
  /**
   * 获取角色详情（含权限）
   */
  static async getRoleDetail(roleId) {
    return await Role.findByPk(roleId, {
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });
  }
  
  /**
   * 创建角色
   */
  static async createRole(data) {
    const { role_name, role_display_name, description, is_system } = data;
    
    // 检查是否已存在
    const existing = await Role.findOne({ where: { role_name } });
    if (existing) {
      throw new Error('角色代码已存在');
    }
    
    return await Role.create({
      role_name,
      role_display_name,
      description,
      is_system: is_system || false
    });
  }
  
  /**
   * 更新角色
   */
  static async updateRole(roleId, data) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('角色不存在');
    }
    
    // 系统角色不能修改代码
    if (role.is_system && data.role_name) {
      throw new Error('系统角色不能修改代码');
    }
    
    return await role.update(data);
  }
  
  /**
   * 删除角色
   */
  static async deleteRole(roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('角色不存在');
    }
    
    // 系统角色不能删除
    if (role.is_system) {
      throw new Error('系统角色不能删除');
    }
    
    // 检查是否有用户使用
    const userCount = await UserRole.count({ where: { role_id: roleId } });
    if (userCount > 0) {
      throw new Error('角色正在被用户使用，无法删除');
    }
    
    await role.destroy();
  }
  
  /**
   * 为角色分配权限
   */
  static async assignPermissionsToRole(roleId, permissionIds) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('角色不存在');
    }
    
    // 删除现有权限
    await RolePermission.destroy({ where: { role_id: roleId } });
    
    // 添加新权限
    if (permissionIds && permissionIds.length > 0) {
      const assignments = permissionIds.map(id => ({
        role_id: roleId,
        permission_id: id
      }));
      
      await RolePermission.bulkCreate(assignments);
    }
    
    // 清除相关用户的权限缓存
    await this.clearRolePermissionCache(roleId);
    
    return { success: true };
  }
  
  /**
   * 为用户分配角色
   */
  static async assignRolesToUser(userId, roleIds) {
    // 删除现有角色
    await UserRole.destroy({ where: { user_id: userId } });
    
    // 添加新角色
    if (roleIds && roleIds.length > 0) {
      const assignments = roleIds.map(id => ({
        user_id: userId,
        role_id: id
      }));
      
      await UserRole.bulkCreate(assignments);
    }
    
    // 清除用户权限缓存
    const { clearUserPermissionCache } = require('../middleware/authorize');
    await clearUserPermissionCache(userId);
    
    return { success: true };
  }
  
  /**
   * 获取用户角色
   */
  static async getUserRoles(userId) {
    const userRoles = await UserRole.findAll({
      where: { user_id: userId },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'role_name', 'role_display_name']
      }]
    });
    
    return userRoles.map(ur => ur.role);
  }
  
  /**
   * 获取用户权限
   */
  static async getUserPermissions(userId) {
    const { getUserPermissions } = require('../middleware/authorize');
    return await getUserPermissions(userId);
  }
  
  /**
   * 清除角色相关的权限缓存
   */
  static async clearRolePermissionCache(roleId) {
    const userRoles = await UserRole.findAll({ where: { role_id: roleId } });
    const userIds = userRoles.map(ur => ur.user_id);
    
    const { clearUserPermissionCache } = require('../middleware/authorize');
    for (const userId of userIds) {
      await clearUserPermissionCache(userId);
    }
  }
  
  /**
   * 获取所有部门树
   */
  static async getDepartmentTree() {
    return await Department.getTree();
  }
  
  /**
   * 创建部门
   */
  static async createDepartment(data) {
    return await Department.create(data);
  }
  
  /**
   * 更新部门
   */
  static async updateDepartment(id, data) {
    const dept = await Department.findByPk(id);
    if (!dept) {
      throw new Error('部门不存在');
    }
    
    return await dept.update(data);
  }
  
  /**
   * 删除部门
   */
  static async deleteDepartment(id) {
    const dept = await Department.findByPk(id);
    if (!dept) {
      throw new Error('部门不存在');
    }
    
    // 检查是否有子部门
    const childCount = await Department.count({ where: { parent_id: id } });
    if (childCount > 0) {
      throw new Error('部门下有子部门，无法删除');
    }
    
    // 检查是否有用户
    const userCount = await require('../models/User').count({ where: { department_id: id } });
    if (userCount > 0) {
      throw new Error('部门下有用户，无法删除');
    }
    
    await dept.destroy();
  }
}

module.exports = PermissionService;
