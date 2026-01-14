#!/usr/bin/env node

/**
 * 质量管理模块Token问题修复脚本
 * 用于诊断和修复质量管理模块的间歇性加载失败问题
 * 
 * 改进版本 - 包含以下优化:
 * - 更好的错误处理和资源管理
 * - 安全的密码哈希处理
 * - 模块化的函数设计
 * - 常量提取和配置管理
 * - 改进的日志记录
 */

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system'
};

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 常量定义
const QUALITY_TABLES = [
  'pqc_inspections',
  'iqc_inspections', 
  'fqc_inspections',
  'oqc_inspections',
  'defect_records'
];

const DEFAULT_ADMIN = {
  username: 'admin',
  role: 'admin',
  status: 'active'
};

const CONSOLE_MESSAGES = {
  SUCCESS: '✅',
  ERROR: '❌',
  INFO: '🔍',
  WARNING: '⚠️',
  TOOL: '🔧',
  KEY: '🔑',
  ROCKET: '🚀'
};

const EXIT_CODES = {
  SUCCESS: 0,
  DATABASE_ERROR: 1,
  TOKEN_ERROR: 2,
  VALIDATION_ERROR: 3
};

/**
 * 创建数据库连接的工厂函数
 * @returns {Promise<mysql.Connection>} 数据库连接
 */
async function createDatabaseConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} 数据库连接失败:`, error.message);
    throw error;
  }
}

/**
 * 安全关闭数据库连接
 * @param {mysql.Connection} connection 数据库连接
 */
async function closeDatabaseConnection(connection) {
  if (connection) {
    try {
      await connection.end();
    } catch (error) {
      console.warn(`${CONSOLE_MESSAGES.WARNING} 关闭数据库连接时出现警告:`, error.message);
    }
  }
}

/**
 * 验证环境配置
 * @returns {boolean} 配置是否有效
 */
function validateEnvironmentConfig() {
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`${CONSOLE_MESSAGES.ERROR} 缺少必要的环境变量: ${missingVars.join(', ')}`);
    console.log('请检查 .env 文件配置');
    return false;
  }
  
  if (JWT_SECRET === 'your-secret-key') {
    console.warn(`${CONSOLE_MESSAGES.WARNING} 使用默认JWT密钥，建议在生产环境中更改`);
  }
  
  return true;
}

/**
 * 查找或创建管理员用户
 * @param {mysql.Connection} connection 数据库连接
 * @returns {Promise<Object>} 用户对象
 */
async function findOrCreateAdminUser(connection) {
  try {
    // 查找管理员用户
    const [users] = await connection.execute(
      'SELECT id, username, role FROM users WHERE role = ? OR username = ? LIMIT 1',
      [DEFAULT_ADMIN.role, DEFAULT_ADMIN.username]
    );
    
    if (users.length > 0) {
      console.log(`${CONSOLE_MESSAGES.SUCCESS} 找到现有管理员用户: ${users[0].username}`);
      return users[0];
    }
    
    console.log(`${CONSOLE_MESSAGES.WARNING} 未找到管理员用户，正在创建...`);
    
    // 生成安全的密码哈希
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12); // 使用更高的salt rounds
    
    // 创建默认管理员用户
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, role, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [DEFAULT_ADMIN.username, hashedPassword, DEFAULT_ADMIN.role, DEFAULT_ADMIN.status]
    );
    
    const newUser = {
      id: result.insertId,
      username: DEFAULT_ADMIN.username,
      role: DEFAULT_ADMIN.role
    };
    
    console.log(`${CONSOLE_MESSAGES.SUCCESS} 管理员用户创建成功:`, newUser);
    console.log(`${CONSOLE_MESSAGES.INFO} 默认密码: ${defaultPassword} (请及时修改)`);
    
    return newUser;
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} 用户操作失败:`, error.message);
    throw error;
  }
}

/**
 * 生成JWT Token
 * @param {Object} user 用户对象
 * @returns {string} JWT Token
 */
function createJWTToken(user) {
  try {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000) // 添加签发时间
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'mes-system',
      audience: 'mes-client'
    });
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} Token生成失败:`, error.message);
    throw error;
  }
}

/**
 * 验证生成的Token
 * @param {string} token JWT Token
 * @returns {boolean} Token是否有效
 */
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`${CONSOLE_MESSAGES.SUCCESS} Token验证通过`);
    return true;
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} Token验证失败:`, error.message);
    return false;
  }
}

/**
 * 显示Token使用说明
 * @param {string} token JWT Token
 * @param {Object} user 用户对象
 */
function displayTokenInstructions(token, user) {
  console.log(`${CONSOLE_MESSAGES.SUCCESS} 新Token生成成功!`);
  console.log('📋 Token信息:');
  console.log(`   用户ID: ${user.id}`);
  console.log(`   用户名: ${user.username}`);
  console.log(`   角色: ${user.role}`);
  console.log(`   有效期: ${JWT_EXPIRES_IN}`);
  console.log(`   长度: ${token.length} 字符`);
  console.log('');
  console.log(`${CONSOLE_MESSAGES.KEY} 新Token (请复制到浏览器localStorage):`);
  console.log(token);
  console.log('');
  console.log('📝 使用方法:');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 切换到 Console 标签');
  console.log('3. 执行以下命令:');
  console.log(`   localStorage.setItem('token', '${token}')`);
  console.log('4. 刷新页面即可正常使用质量管理功能');
  console.log('');
  console.log('💡 提示: Token将在24小时后过期，请及时更新');
}

/**
 * 检查表是否存在并返回记录数
 * @param {mysql.Connection} connection 数据库连接
 * @param {string} tableName 表名
 * @returns {Promise<Object>} 表信息
 */
async function checkTableStatus(connection, tableName) {
  try {
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    return {
      exists: true,
      count: rows[0].count,
      status: 'accessible'
    };
  } catch (error) {
    return {
      exists: false,
      count: 0,
      status: error.code === 'ER_NO_SUCH_TABLE' ? 'not_exists' : 'access_denied',
      error: error.message
    };
  }
}

/**
 * 生成新的认证Token
 */
async function generateNewToken() {
  let connection = null;
  
  try {
    console.log(`${CONSOLE_MESSAGES.TOOL} 正在生成新的认证Token...`);
    
    // 验证环境配置
    if (!validateEnvironmentConfig()) {
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }
    
    connection = await createDatabaseConnection();
    console.log(`${CONSOLE_MESSAGES.SUCCESS} 数据库连接成功`);
    
    const user = await findOrCreateAdminUser(connection);
    const token = createJWTToken(user);
    
    // 验证生成的Token
    if (!validateToken(token)) {
      throw new Error('生成的Token验证失败');
    }
    
    displayTokenInstructions(token, user);
    
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} Token生成失败:`, error.message);
    console.log('');
    console.log('🔧 可能的解决方案:');
    console.log('1. 检查数据库连接配置');
    console.log('2. 确认users表是否存在');
    console.log('3. 检查数据库用户权限');
    console.log('4. 验证JWT_SECRET配置');
    process.exit(EXIT_CODES.TOKEN_ERROR);
  } finally {
    await closeDatabaseConnection(connection);
  }
}

/**
 * 测试数据库连接和表状态
 */
async function testDatabaseConnection() {
  let connection = null;
  
  try {
    console.log(`${CONSOLE_MESSAGES.INFO} 测试数据库连接...`);
    
    connection = await createDatabaseConnection();
    
    // 测试基本连接
    await connection.execute('SELECT 1');
    console.log(`${CONSOLE_MESSAGES.SUCCESS} 数据库连接正常`);
    
    // 检查数据库版本
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    console.log(`${CONSOLE_MESSAGES.INFO} MySQL版本: ${versionRows[0].version}`);
    
    // 检查质量管理相关表
    console.log('');
    console.log('📊 质量管理表状态:');
    
    for (const table of QUALITY_TABLES) {
      const status = await checkTableStatus(connection, table);
      
      if (status.exists) {
        console.log(`${CONSOLE_MESSAGES.SUCCESS} 表 ${table}: ${status.count} 条记录`);
      } else {
        console.log(`${CONSOLE_MESSAGES.ERROR} 表 ${table}: ${status.status}`);
        if (status.error) {
          console.log(`   错误详情: ${status.error}`);
        }
      }
    }
    
    // 检查users表
    console.log('');
    console.log('👥 用户表状态:');
    const userTableStatus = await checkTableStatus(connection, 'users');
    if (userTableStatus.exists) {
      console.log(`${CONSOLE_MESSAGES.SUCCESS} users表: ${userTableStatus.count} 个用户`);
      
      // 检查管理员用户
      const [adminUsers] = await connection.execute(
        'SELECT username, role, status FROM users WHERE role = ? OR username = ?',
        ['admin', 'admin']
      );
      
      if (adminUsers.length > 0) {
        console.log(`${CONSOLE_MESSAGES.SUCCESS} 管理员用户存在: ${adminUsers[0].username} (${adminUsers[0].status})`);
      } else {
        console.log(`${CONSOLE_MESSAGES.WARNING} 未找到管理员用户`);
      }
    } else {
      console.log(`${CONSOLE_MESSAGES.ERROR} users表: ${userTableStatus.status}`);
    }
    
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} 数据库连接失败:`, error.message);
    console.log('');
    console.log('🔧 解决方案:');
    console.log('1. 检查数据库服务是否启动');
    console.log('2. 检查 .env 文件中的数据库配置');
    console.log('3. 确认数据库用户权限');
    console.log('4. 验证数据库名称是否正确');
    process.exit(EXIT_CODES.DATABASE_ERROR);
  } finally {
    await closeDatabaseConnection(connection);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`${CONSOLE_MESSAGES.ROCKET} 质量管理模块诊断工具`);
  console.log('================================');
  console.log('');
  console.log('📋 可用命令:');
  console.log('  --test-db        测试数据库连接和表状态');
  console.log('  --generate-token 生成新的认证Token');
  console.log('  --help           显示帮助信息');
  console.log('');
  console.log('💡 建议执行顺序:');
  console.log('1. node scripts/fix-quality-token-issue-improved.js --test-db');
  console.log('2. node scripts/fix-quality-token-issue-improved.js --generate-token');
  console.log('');
  console.log('🔧 环境变量配置:');
  console.log('  DB_HOST              数据库主机地址');
  console.log('  DB_PORT              数据库端口 (默认: 3306)');
  console.log('  DB_USER              数据库用户名');
  console.log('  DB_PASSWORD          数据库密码');
  console.log('  DB_NAME              数据库名称');
  console.log('  JWT_SECRET           JWT签名密钥');
  console.log('  JWT_EXPIRES_IN       Token过期时间 (默认: 24h)');
  console.log('  DEFAULT_ADMIN_PASSWORD 默认管理员密码 (默认: admin123)');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (args.includes('--test-db')) {
    await testDatabaseConnection();
  } else if (args.includes('--generate-token')) {
    await generateNewToken();
  } else {
    console.log(`${CONSOLE_MESSAGES.ERROR} 未知命令: ${args.join(' ')}`);
    console.log('使用 --help 查看可用命令');
    process.exit(EXIT_CODES.VALIDATION_ERROR);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error(`${CONSOLE_MESSAGES.ERROR} 未处理的Promise拒绝:`, reason);
  process.exit(EXIT_CODES.TOKEN_ERROR);
});

process.on('uncaughtException', (error) => {
  console.error(`${CONSOLE_MESSAGES.ERROR} 未捕获的异常:`, error);
  process.exit(EXIT_CODES.TOKEN_ERROR);
});

// 模块入口点
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateNewToken,
  testDatabaseConnection,
  createJWTToken,
  validateToken,
  findOrCreateAdminUser,
  createDatabaseConnection,
  closeDatabaseConnection
};