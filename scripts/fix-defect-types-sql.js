/**
 * 使用SQL直接修复defect_types字段
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  charset: 'utf8mb4'
};

async function fixDefectTypesSQL() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 使用SQL直接修复defect_types字段...\n');

    // 批量更新所有记录，将字符串转换为JSON数组
    const updateSQL = `
      UPDATE quality_inspections 
      SET defect_types = CASE 
        WHEN defect_types = '材料杂质' THEN '["材料杂质"]'
        WHEN defect_types = '外观缺陷' THEN '["外观缺陷"]'
        WHEN defect_types = '尺寸偏差' THEN '["尺寸偏差"]'
        WHEN defect_types = '表面划痕' THEN '["表面划痕"]'
        WHEN defect_types = '包装破损' THEN '["包装破损"]'
        WHEN defect_types = '颜色不均' THEN '["颜色不均"]'
        WHEN defect_types = '气泡' THEN '["气泡"]'
        WHEN defect_types = '' OR defect_types IS NULL THEN '[]'
        ELSE CONCAT('["', defect_types, '"]')
      END
      WHERE defect_types IS NOT NULL
    `;

    const [result] = await connection.execute(updateSQL);
    console.log(`✅ 批量更新完成，影响 ${result.affectedRows} 条记录`);

    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const [verifyRows] = await connection.execute(`
      SELECT id, defect_types
      FROM quality_inspections
      WHERE defect_types IS NOT NULL
      ORDER BY id
      LIMIT 10
    `);

    console.log('📋 前10条记录的defect_types字段:');
    let allValid = true;
    verifyRows.forEach(row => {
      try {
        const parsed = JSON.parse(row.defect_types);
        console.log(`   ID ${row.id}: ${row.defect_types} ✅`);
      } catch (e) {
        console.log(`   ID ${row.id}: ${row.defect_types} ❌`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log('\n🎉 所有记录的JSON格式都正确！');
    } else {
      console.log('\n⚠️  仍有记录格式不正确');
    }

    // 统计不同缺陷类型的数量
    const [statsRows] = await connection.execute(`
      SELECT defect_types, COUNT(*) as count
      FROM quality_inspections
      WHERE defect_types IS NOT NULL AND defect_types != ''
      GROUP BY defect_types
      ORDER BY count DESC
    `);

    console.log('\n📊 缺陷类型统计:');
    statsRows.forEach(row => {
      console.log(`   ${row.defect_types}: ${row.count} 条`);
    });

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
if (require.main === module) {
  fixDefectTypesSQL()
    .then(() => {
      console.log('\n🎉 SQL修复完成！');
      console.log('💡 现在IQC页面应该可以正常加载数据了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 修复失败:', error.message);
      process.exit(1);
    });
}

module.exports = { fixDefectTypesSQL };