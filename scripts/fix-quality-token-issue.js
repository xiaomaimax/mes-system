#!/usr/bin/env node

/**
 * 质量管理模块Token问题修复脚本
 * 用于诊断和修复质量管理模块的间歇性加载失败问题
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
 * 查找或创建管理员用户
 * @param {mysql.Connection} connection 数据库连接
 * @returns {Promise<Object>} 用户对象
 */
async function findOrCreateAdminUser(connection) {
  // 查找管理员用户
  const [users] = await connection.execute(
    'SELECT id, username, role FROM users WHERE role = ? OR username = ? LIMIT 1',
    [DEFAULT_ADMIN.role, DEFAULT_ADMIN.username]
  );
  
  if (users.length > 0) {
    return users[0];
  }
  
  console.log(`${CONSOLE_MESSAGES.WARNING} 未找到管理员用户，正在创建...`);
  
  // 生成安全的密码哈希
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  // 创建默认管理员用户
  const [result] = await connection.execute(
    'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
    [DEFAULT_ADMIN.username, hashedPassword, DEFAULT_ADMIN.role, DEFAULT_ADMIN.status]
  );
  
  const newUser = {
    id: result.insertId,
    username: DEFAULT_ADMIN.username,
    role: DEFAULT_ADMIN.role
  };
  
  console.log(`${CONSOLE_MESSAGES.SUCCESS} 管理员用户创建成功:`, newUser);
  return newUser;
}
  try {
    console.log('🔧 正在生成新的认证Token...');
    
    // 连接数据库
    const connection = await mysql.createConnection(dbConfig);
    
    // 查找管理员用户
    const [users] = await connection.execute(
      'SELECT id, username, role FROM users WHERE role = ? OR username = ? LIMIT 1',
      ['admin', 'admin']
    );
    
    if (users.length === 0) {
      console.log('❌ 未找到管理员用户，正在创建...');
      
      // 创建默认管理员用户
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        ['admin', 'admin123', 'admin', 'active'] // 简化密码处理
      );
      
      const newUser = {
        id: result.insertId,
        username: 'admin',
        role: 'admin'
      };
      
      console.log('✅ 管理员用户创建成功:', newUser);
      users.push(newUser);
    }
    
    const user = users[0];
    
    // 生成新Token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log('✅ 新Token生成成功!');
    console.log('📋 Token信息:');
    console.log(`   用户ID: ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   角色: ${user.role}`);
    console.log(`   有效期: ${JWT_EXPIRES_IN}`);
    console.log('');
    console.log('🔑 新Token (请复制到浏览器localStorage):');
    console.log(token);
    console.log('');
    console.log('📝 使用方法:');
    console.log('1. 打开浏览器开发者工具 (F12)');
    console.log('2. 切换到 Console 标签');
    console.log('3. 执行以下命令:');
    console.log(`   localStorage.setItem('token', '${token}')`);
    console.log('4. 刷新页面即可正常使用质量管理功能');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Token生成失败:', error.message);
    process.exit(1);
  }
}

async function testDatabaseConnection() {
  let connection = null;
  
  try {
    console.log(`${CONSOLE_MESSAGES.INFO} 测试数据库连接...`);
    
    connection = await createDatabaseConnection();
    
    // 测试连接
    await connection.execute('SELECT 1');
    console.log(`${CONSOLE_MESSAGES.SUCCESS} 数据库连接正常`);
    
    // 检查质量管理相关表
    for (const table of QUALITY_TABLES) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${CONSOLE_MESSAGES.SUCCESS} 表 ${table}: ${rows[0].count} 条记录`);
      } catch (error) {
        console.log(`${CONSOLE_MESSAGES.ERROR} 表 ${table}: 不存在或无法访问`);
      }
    }
    
  } catch (error) {
    console.error(`${CONSOLE_MESSAGES.ERROR} 数据库连接失败:`, error.message);
    console.log('');
    console.log('🔧 解决方案:');
    console.log('1. 检查数据库服务是否启动');
    console.log('2. 检查 .env 文件中的数据库配置');
    console.log('3. 确认数据库用户权限');
    process.exit(1);
  } finally {
    await closeDatabaseConnection(connection);
  }
}

async function main() {
  console.log(`${CONSOLE_MESSAGES.ROCKET} 质量管理模块诊断工具`);
  console.log('================================');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--test-db')) {
    await testDatabaseConnection();
  } else if (args.includes('--generate-token')) {
    await generateNewToken();
  } else {
    console.log('📋 可用命令:');
    console.log('  --test-db        测试数据库连接');
    console.log('  --generate-token 生成新的认证Token');
    console.log('');
    console.log('💡 建议执行顺序:');
    console.log('1. node scripts/fix-quality-token-issue.js --test-db');
    console.log('2. node scripts/fix-quality-token-issue.js --generate-token');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateNewToken,
  testDatabaseConnection
};