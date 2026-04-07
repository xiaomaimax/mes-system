/**
 * 数据库工具函数（修复版）
 * 提供表结构检测和动态 CRUD 操作功能
 */

const sequelize = require('../config/database');

/**
 * 获取表结构信息
 * @param {string} tableName - 表名
 * @returns {Array} 字段信息数组
 */
async function getTableColumns(tableName) {
  try {
    // 使用 SHOW COLUMNS 语句获取表结构（MySQL 兼容）
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM ${tableName}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    return columns.map(column => ({
      name: column.Field,
      type: column.Type,
      allowNull: column.Null === 'YES',
      defaultValue: column.Default,
      primaryKey: column.Key === 'PRI',
      extra: column.Extra
    }));
  } catch (error) {
    console.error(`获取表 ${tableName} 结构失败:`, error);
    throw error;
  }
}

/**
 * 过滤数据对象，只保留表中存在的字段
 * @param {Object} data - 原始数据对象
 * @param {Array} columns - 表字段信息
 * @returns {Object} 过滤后的数据对象
 */
function filterDataByColumns(data, columns) {
  const columnNames = new Set(columns.map(col => col.name));
  const filteredData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (columnNames.has(key)) {
      filteredData[key] = value;
    }
  }
  
  return filteredData;
}

/**
 * 生成插入语句和参数
 * @param {string} tableName - 表名
 * @param {Object} data - 数据对象
 * @param {number} userId - 用户ID
 * @param {Array} columns - 表字段信息
 * @returns {Object} 包含sql和replacements的对象
 */
function generateInsertQuery(tableName, data, userId, columns) {
  // 过滤数据，只保留存在的字段
  const filteredData = filterDataByColumns(data, columns);
  
  // 检查是否有 created_by 和 updated_by 字段
  const hasCreatedBy = columns.some(col => col.name === 'created_by');
  const hasUpdatedBy = columns.some(col => col.name === 'updated_by');
  
  // 构建字段列表和值列表
  const fieldNames = Object.keys(filteredData);
  const values = Object.values(filteredData);
  
  // 如果表有 created_by 字段，添加它
  if (hasCreatedBy) {
    fieldNames.push('created_by');
    values.push(userId);
  }
  
  // 如果表有 updated_by 字段，添加它
  if (hasUpdatedBy) {
    fieldNames.push('updated_by');
    values.push(userId);
  }
  
  // 添加时间戳字段
  fieldNames.push('created_at', 'updated_at');
  values.push(new Date(), new Date());
  
  const placeholders = fieldNames.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${tableName} (${fieldNames.join(', ')}) VALUES (${placeholders})`;
  
  return {
    sql,
    replacements: values
  };
}

/**
 * 生成更新语句和参数
 * @param {string} tableName - 表名
 * @param {Object} data - 数据对象
 * @param {number} userId - 用户ID
 * @param {Array} columns - 表字段信息
 * @param {number} id - 记录ID
 * @returns {Object} 包含sql和replacements的对象
 */
function generateUpdateQuery(tableName, data, userId, columns, id) {
  // 过滤数据，只保留存在的字段
  const filteredData = filterDataByColumns(data, columns);
  
  // 检查是否有 updated_by 字段
  const hasUpdatedBy = columns.some(col => col.name === 'updated_by');
  
  // 构建 SET 子句
  const setFields = Object.keys(filteredData);
  const values = Object.values(filteredData);
  
  // 如果表有 updated_by 字段，添加它
  if (hasUpdatedBy) {
    setFields.push('updated_by');
    values.push(userId);
  }
  
  // 添加更新时间
  setFields.push('updated_at');
  values.push(new Date());
  
  const setClause = setFields.map(field => `${field} = ?`).join(', ');
  
  const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
  values.push(id);
  
  return {
    sql,
    replacements: values
  };
}

module.exports = {
  getTableColumns,
  filterDataByColumns,
  generateInsertQuery,
  generateUpdateQuery
};