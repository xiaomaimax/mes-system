const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'mes_system',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // 仅在开发环境记录SQL日志
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  timezone: '+08:00',
  // 连接池配置
  pool: {
    max: 10,
    min: 2,
    idle: 10000,
    acquire: 30000
  },
  // 方言选项
  dialectOptions: {
    connectTimeout: 5000,
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  // 重试配置
  retry: {
    max: 3,
    backoff: 1000
  },
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;