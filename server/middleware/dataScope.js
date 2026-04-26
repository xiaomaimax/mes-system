const DataPermission = require('../models/DataPermission');
const Department = require('../models/Department');
const logger = require('../utils/logger');

/**
 * 数据范围过滤中间件
 * 自动根据用户的数据权限过滤查询结果
 * 
 * 用法：
 * router.get('/api/orders',
 *   authenticateToken,
 *   authorize(['production.order.read']),
 *   applyDataScope('production_order'),
 *   orderController.list
 * );
 */
function applyDataScope(resourceType) {
  return async (req, res, next) => {
    let userId;
    try {
      userId = req.user.userId;
      const userRole = req.user.role;
      
      // 超级管理员不限制数据范围
      if (userRole === 'admin') {
        req.dataScope = { scope_type: 'ALL' };
        return next();
      }
      
      // 获取用户数据权限
      const dataScope = await DataPermission.getUserDataScope(userId, resourceType);
      req.dataScope = dataScope;
      
      // 创建数据范围过滤函数
      req.applyDataScopeToQuery = (queryBuilder) => {
        return DataPermission.applyScope(queryBuilder, dataScope, userId);
      };
      
      logger.debug('数据范围已应用', {
        userId,
        resourceType,
        scope: dataScope.scope_type
      });
      
      next();
    } catch (error) {
      logger.error('数据范围过滤异常', { error: error.message, resourceType });
      // 出错时降级为仅查看自己的数据
      req.dataScope = { scope_type: 'SELF' };
      req.applyDataScopeToQuery = (queryBuilder) => {
        return queryBuilder.where({ created_by: userId });
      };
      next();
    }
  };
}

/**
 * 手动应用数据范围过滤到 Sequelize 查询
 * 
 * 用法：
 * const orders = await Order.findAll({
 *   where: { status: 'pending' }
 * });
 * const filteredOrders = applyDataScopeFilter(orders, req.dataScope, req.user.userId);
 */
function applyDataScopeFilter(records, dataScope, userId) {
  if (!dataScope || dataScope.scope_type === 'ALL') {
    return records;
  }
  
  switch (dataScope.scope_type) {
    case 'DEPARTMENT':
      // 过滤本部门数据
      return records.filter(r => r.department_id === dataScope.department_id);
      
    case 'SELF':
      // 过滤自己的数据
      return records.filter(r => r.created_by === userId);
      
    case 'CUSTOM':
      // 自定义过滤逻辑
      if (dataScope.scope_value) {
        // 根据自定义条件过滤
        return records.filter(r => {
          // 这里需要根据具体的 scope_value 实现过滤逻辑
          return true;
        });
      }
      return records.filter(r => r.created_by === userId);
      
    default:
      return records.filter(r => r.created_by === userId);
  }
}

/**
 * 获取用户可访问的部门 ID 列表
 */
async function getUserDepartmentIds(userId) {
  const user = await require('../models/User').findByPk(userId, {
    attributes: ['department_id']
  });
  
  if (!user || !user.department_id) {
    return [userId]; // 没有部门，只返回自己
  }
  
  // 获取部门及所有子部门 ID
  const deptIds = await Department.getSubDepartmentIds(user.department_id);
  return deptIds;
}

module.exports = {
  applyDataScope,
  applyDataScopeFilter,
  getUserDepartmentIds
};
