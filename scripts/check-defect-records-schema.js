require('dotenv').config();
const pool = require('../server/config/mysql');

(async () => {
  try {
    const [columns] = await pool.query('DESCRIBE defect_records');
    console.log('defect_records 表结构:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
  } catch (error) {
    console.error('错误:', error.message);
  }
  process.exit(0);
})();
