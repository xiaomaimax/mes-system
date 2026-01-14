/**
 * 生成临时的JWT token用于测试
 * 
 * 使用方法:
 * node scripts/generate-token.js [role] [username] [expiry]
 * 
 * 示例:
 * node scripts/generate-token.js admin testuser 1h
 * node scripts/generate-token.js operator worker1 2d
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

// 配置常量
const DEFAULT_EXPIRY = '24h';
const VALID_ROLES = ['admin', 'operator', 'inspector', 'manager'];

/**
 * 验证JWT密钥是否存在
 * @returns {string} JWT密钥
 * @throws {Error} 如果密钥不存在
 */
function validateJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET环境变量未设置，请检查.env文件');
  }
  return jwtSecret;
}

/**
 * 解析命令行参数
 * @returns {Object} 解析后的参数对象
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const role = args[0] || 'admin';
  const username = args[1] || 'admin';
  const expiry = args[2] || DEFAULT_EXPIRY;

  // 验证角色
  if (!VALID_ROLES.includes(role)) {
    console.warn(`警告: 角色 '${role}' 不在有效角色列表中: ${VALID_ROLES.join(', ')}`);
  }

  return { role, username, expiry };
}

/**
 * 生成测试用户数据
 * @param {string} username - 用户名
 * @param {string} role - 用户角色
 * @returns {Object} 用户数据对象
 */
function createTestUser(username, role) {
  const roleIdMap = {
    admin: 1,
    manager: 2,
    inspector: 3,
    operator: 4
  };

  return {
    userId: roleIdMap[role] || 1,
    username,
    role,
    permissions: getPermissionsByRole(role),
    iat: Math.floor(Date.now() / 1000)
  };
}

/**
 * 根据角色获取权限
 * @param {string} role - 用户角色
 * @returns {Array} 权限数组
 */
function getPermissionsByRole(role) {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage'],
    manager: ['read', 'write', 'manage'],
    inspector: ['read', 'write'],
    operator: ['read']
  };
  
  return permissions[role] || ['read'];
}

/**
 * 生成JWT token
 * @param {Object} userData - 用户数据
 * @param {string} secret - JWT密钥
 * @param {string} expiry - 过期时间
 * @returns {string} JWT token
 */
function generateToken(userData, secret, expiry) {
  try {
    return jwt.sign(userData, secret, { 
      expiresIn: expiry,
      issuer: 'mes-system',
      audience: 'mes-client'
    });
  } catch (error) {
    throw new Error(`Token生成失败: ${error.message}`);
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
使用方法:
  node scripts/generate-token.js [role] [username] [expiry]

参数说明:
  role     - 用户角色 (${VALID_ROLES.join(', ')}) [默认: admin]
  username - 用户名 [默认: admin]
  expiry   - 过期时间 (如: 1h, 2d, 30m) [默认: 24h]

示例:
  node scripts/generate-token.js
  node scripts/generate-token.js operator worker1 2h
  node scripts/generate-token.js inspector qc_user 1d
  `);
}

/**
 * 主函数
 */
function main() {
  try {
    // 检查是否需要显示帮助
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showHelp();
      return;
    }

    // 验证环境变量
    const jwtSecret = validateJwtSecret();
    
    // 解析参数
    const { role, username, expiry } = parseArguments();
    
    // 创建测试用户
    const testUser = createTestUser(username, role);
    
    // 生成token
    const token = generateToken(testUser, jwtSecret, expiry);
    
    // 输出结果
    console.log('✅ JWT Token生成成功!');
    console.log('\n📋 用户信息:');
    console.log(`   用户名: ${testUser.username}`);
    console.log(`   角色: ${testUser.role}`);
    console.log(`   权限: ${testUser.permissions.join(', ')}`);
    console.log(`   过期时间: ${expiry}`);
    
    console.log('\n🔑 生成的Token:');
    console.log(token);
    
    console.log('\n💾 浏览器存储命令:');
    console.log(`localStorage.setItem('token', '${token}');`);
    
    console.log('\n📝 cURL测试命令:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/test`);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();