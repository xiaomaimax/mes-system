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
  // 连接池配置（P1-5 性能优化）
  pool: {
    max: 20,        // P1 优化：从 10 增加到 20，支持更高并发
    min: 5,         // P1 优化：从 2 增加到 5，保持最小连接数
    idle: 10000,
    acquire: 30000,
    evict: 1000     // P1 优化：添加空闲连接检查间隔
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

// 测试数据库连接（P1-5 性能优化）
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    // P1 优化：添加连接池状态监控
    setInterval(() => {
      const poolStatus = sequelize.pool;
      if (poolStatus) {
        logger.debug('数据库连接池状态', {
          available: poolStatus.available,
          using: poolStatus.using,
          size: poolStatus.size
        });
      }
    }, 60000); // 每分钟记录一次连接池状态
    
  } catch (error) {
    logger.error('数据库连接失败:', error);
    logger.security('DATABASE_CONNECTION_FAILED', { error: error.message }); // P0-2 安全事件
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;