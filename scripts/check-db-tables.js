require('dotenv').config();
const pool = require('../server/config/mysql');

(async () => {
  try {
    const [tables] = await pool.query('SHOW TABLES FROM mes_system');
    console.log('数据库中的表:');
    tables.forEach(t => console.log('-', Object.values(t)[0]));
  } catch (error) {
    console.error('错误:', error.message);
  }
  process.exit(0);
})();
