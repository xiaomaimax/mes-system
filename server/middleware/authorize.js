const Role = require('../models/Role');
const Permission = require('../models/Permission');
const logger = require('../utils/logger');

/**
 * 权限验证中间件
 * 用于验证用户是否有所需的权限
 * 
 * 用法：
 * router.get('/api/resource',
 *   authenticateToken,
 *   authorize(['resource.read']),
 *   resourceController.list
 * );
 */
function authorize(requiredPermissions) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        logger.warn('权限验证失败 - 用户未认证', { path: req.path });
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }
      
      // 超级管理员跳过权限检查
      if (user.role === 'admin') {
        logger.debug('超级管理员跳过权限检查', { 
          userId: user.userId, 
          path: req.path 
        });
        return next();
      }
      
      // 获取用户权限
      const userPermissions = await getUserPermissions(user.userId);
      
      // 检查是否有所需权限
      const hasPermission = requiredPermissions.every(perm => 
        userPermissions.includes(perm)
      );
      
      if (!hasPermission) {
        logger.warn('权限不足', { 
          userId: user.userId,
          username: user.username,
          required: requiredPermissions,
          has: userPermissions,
          path: req.path 
        });
        
        return res.status(403).json({
          success: false,
          message: '权限不足，无法访问此资源',
          required: requiredPermissions
        });
      }
      
      logger.debug('权限验证通过', { 
        userId: user.userId, 
        permissions: requiredPermissions,
        path: req.path 
      });
      
      next();
    } catch (error) {
      logger.error('权限验证异常', { error: error.message, path: req.path });
      return res.status(500).json({
        success: false,
        message: '权限验证失败'
      });
    }
  };
}

/**
 * 获取用户权限列表
 */
async function getUserPermissions(userId) {
  const cacheKey = `user_permissions:${userId}`;
  
  // 尝试从缓存获取
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 从数据库查询
  const UserRole = require('../models/UserRole');
  const Role = require('../models/Role');
  const Permission = require('../models/Permission');
  
  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    include: [{
      model: Role,
      as: 'role',
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    }]
  });
  
  // 提取权限代码
  const permissions = new Set();
  userRoles.forEach(ur => {
    if (ur.role && ur.role.permissions) {
      ur.role.permissions.forEach(p => {
        permissions.add(p.permission_code);
      });
    }
  });
  
  // 检查是否有 admin 角色
  const userRoleNames = userRoles.map(ur => ur.role?.role_name);
  if (userRoleNames.includes('admin')) {
    // admin 拥有所有权限
    const allPermissions = await Permission.findAll();
    return allPermissions.map(p => p.permission_code);
  }
  
  const permissionList = Array.from(permissions);
  
  // 缓存 5 分钟
  await setCache(cacheKey, permissionList, 300);
  
  return permissionList;
}

/**
 * 清除用户权限缓存（当角色权限变更时调用）
 */
async function clearUserPermissionCache(userId) {
  const cacheKey = `user_permissions:${userId}`;
  await deleteFromCache(cacheKey);
}

// 简单的内存缓存（生产环境建议用 Redis）
const permissionCache = new Map();

function getFromCache(key) {
  const item = permissionCache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expires) {
    permissionCache.delete(key);
    return null;
  }
  
  return item.value;
}

function setCache(key, value, ttlSeconds) {
  permissionCache.set(key, {
    value,
    expires: Date.now() + (ttlSeconds * 1000)
  });
}

function deleteFromCache(key) {
  permissionCache.delete(key);
}

// 导出
module.exports = {
  authorize,
  getUserPermissions,
  clearUserPermissionCache
};
