require('dotenv').config();
const sequelize = require('../server/config/database');
const User = require('../server/models/User');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');

    // 定义用户密码映射
    const users = [
      { username: 'admin', password: 'admin123' },
      { username: 'inspector1', password: 'inspector123' },
      { username: 'operator1', password: 'operator123' }
    ];

    // 更新每个用户的密码
    for (const userData of users) {
      const user = await User.findOne({ where: { username: userData.username } });
      if (user) {
        // 直接设置密码，会触发 beforeUpdate hook 进行哈希
        user.password = userData.password;
        await user.save();
        console.log(`✓ 已更新用户 ${userData.username} 的密码`);
      } else {
        console.log(`✗ 用户 ${userData.username} 不存在`);
      }
    }

    console.log('\n✓ 所有密码已成功更新');
    process.exit(0);
  } catch (error) {
    console.error('✗ 错误:', error.message);
    process.exit(1);
  }
}

fixPasswords();
