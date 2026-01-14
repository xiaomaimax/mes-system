const jwt = require('jsonwebtoken');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'mes_system_secret_key_change_in_production';
const JWT_EXPIRES_IN = '24h';

// 生成Token
function generateToken() {
  const payload = {
    userId: 1,
    username: 'admin',
    role: 'admin'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  console.log('🔑 新Token已生成:');
  console.log(token);
  console.log('');
  console.log('📝 使用方法:');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 切换到 Console 标签');
  console.log('3. 执行以下命令:');
  console.log(`localStorage.setItem('token', '${token}')`);
  console.log('4. 刷新页面即可正常使用');
  
  return token;
}

if (require.main === module) {
  generateToken();
}

module.exports = { generateToken };