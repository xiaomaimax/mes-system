/**
 * 事务处理工具
 * 为多步骤数据库操作提供原子性保证
 */

const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const logger = require('./logger');
const { DatabaseError } = require('../middleware/errorHandler');

/**
 * 执行事务操作
 * @param {Function} callback - 事务回调函数，接收transaction参数
 * @param {Object} options - 事务选项
 * @returns {Promise} 事务执行结果
 * 
 * 使用示例:
 * const result = await withTransaction(async (transaction) => {
 *   const order = await ProductionOrder.create({...}, { transaction });
 *   const task = await ProductionTask.create({...}, { transaction });
 *   return { order, task };
 * });
 */
async function withTransaction(callback, options = {}) {
  const transaction = await sequelize.transaction({
    isolationLevel: options.isolationLevel || Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    ...options
  });

  try {
    logger.debug('事务开始', { transactionId: transaction.id });
    
    const result = await callback(transaction);
    
    await transaction.commit();
    logger.debug('事务提交成功', { transactionId: transaction.id });
    
    return result;
  } catch (error) {
    await transaction.rollback();
    logger.error('事务回滚', {
      transactionId: transaction.id,
      error: error.message,
      stack: error.stack
    });
    
    throw new DatabaseError(`事务执行失败: ${error.message}`, error);
  }
}

/**
 * 执行多个操作的事务
 * @param {Array} operations - 操作数组，每个操作是一个函数
 * @returns {Promise} 所有操作的结果数组
 * 
 * 使用示例:
 * const results = await withMultipleOperations([
 *   async (t) => await Order.create({...}, { transaction: t }),
 *   async (t) => await Task.create({...}, { transaction: t }),
 *   async (t) => await Log.create({...}, { transaction: t })
 * ]);
 */
async function withMultipleOperations(operations) {
  return withTransaction(async (transaction) => {
    const results = [];
    
    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await operations[i](transaction);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
        throw error; // 任何操作失败都会导致整个事务回滚
      }
    }
    
    return results;
  });
}

/**
 * 条件事务执行
 * 根据条件决定是否使用事务
 * @param {Boolean} useTransaction - 是否使用事务
 * @param {Function} callback - 回调函数
 * @returns {Promise}
 */
async function conditionalTransaction(useTransaction, callback) {
  if (!useTransaction) {
    return callback(null);
  }
  
  return withTransaction(callback);
}

/**
 * 重试事务
 * 在事务失败时自动重试
 * @param {Function} callback - 事务回调
 * @param {Number} maxRetries - 最大重试次数
 * @param {Number} retryDelay - 重试延迟(毫秒)
 * @returns {Promise}
 */
async function withRetry(callback, maxRetries = 3, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`事务执行尝试 ${attempt}/${maxRetries}`);
      return await withTransaction(callback);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        logger.warn(`事务执行失败，${retryDelay}ms后重试`, {
          attempt,
          error: error.message
        });
        
        // 延迟后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  logger.error(`事务执行失败，已达最大重试次数`, {
    maxRetries,
    error: lastError.message
  });
  
  throw lastError;
}

/**
 * 嵌套事务处理
 * 处理嵌套事务的情况
 * @param {Function} callback - 事务回调
 * @param {Object} parentTransaction - 父事务
 * @returns {Promise}
 */
async function withNestedTransaction(callback, parentTransaction) {
  if (parentTransaction) {
    // 如果已有父事务，直接使用
    return callback(parentTransaction);
  }
  
  // 否则创建新事务
  return withTransaction(callback);
}

/**
 * 事务装饰器
 * 为异步函数自动添加事务支持
 * @param {Function} fn - 要装饰的函数
 * @returns {Function} 装饰后的函数
 * 
 * 使用示例:
 * const createOrder = transactionDecorator(async (data, transaction) => {
 *   return await ProductionOrder.create(data, { transaction });
 * });
 */
function transactionDecorator(fn) {
  return async function(...args) {
    return withTransaction(async (transaction) => {
      return fn(...args, transaction);
    });
  };
}

/**
 * 保存点处理
 * 在事务中创建保存点，允许部分回滚
 * @param {Object} transaction - 事务对象
 * @param {String} name - 保存点名称
 * @param {Function} callback - 回调函数
 * @returns {Promise}
 */
async function withSavepoint(transaction, name, callback) {
  const savepoint = await transaction.sequelize.query(
    `SAVEPOINT ${name}`,
    { transaction }
  );
  
  try {
    return await callback();
  } catch (error) {
    await transaction.sequelize.query(
      `ROLLBACK TO SAVEPOINT ${name}`,
      { transaction }
    );
    throw error;
  }
}

module.exports = {
  withTransaction,
  withMultipleOperations,
  conditionalTransaction,
  withRetry,
  withNestedTransaction,
  transactionDecorator,
  withSavepoint
};
