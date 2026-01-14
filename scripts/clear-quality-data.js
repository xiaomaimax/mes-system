/**
 * 清空质量检验相关的表数据
 */

require('dotenv').config();
const pool = require('../server/config/mysql');

async function clearQualityData() {
  try {
    console.log('开始清空质量检验数据...\n');

    const tables = [
      'fqc_inspections',
      'pqc_inspections',
      'oqc_inspections',
      'defect_reasons',
      'inspection_standards',
      'batch_tracing'
    ];

    for (const table of tables) {
      await pool.query(`DELETE FROM ${table}`);
      console.log(`✓ 清空 ${table} 表`);
    }

    console.log('\n✅ 所有质量检验数据清空完成！');

  } catch (error) {
    console.error('❌ 清空数据失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

clearQualityData();
