const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  charset: 'utf8mb4'
});

// 测试连接
pool.getConnection()
  .then(connection => {
    logger.info('MySQL连接池创建成功');
    connection.release();
  })
  .catch(error => {
    logger.error('MySQL连接池创建失败:', error);
    process.exit(1);
  });

module.exports = pool;
