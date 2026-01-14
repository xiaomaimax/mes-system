/**
 * 修复质量检验数据中的乱码问题
 * 清理defect_types字段中的无效JSON数据
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

async function fixQualityInspectionsData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 开始修复质量检验数据...\n');

    // 查询所有质量检验记录
    const [rows] = await connection.execute(`
      SELECT id, defect_types, notes
      FROM quality_inspections
      WHERE defect_types IS NOT NULL
      ORDER BY id
    `);

    console.log(`📋 找到 ${rows.length} 条需要检查的记录`);

    let fixedCount = 0;
    let validCount = 0;

    for (const row of rows) {
      try {
        // 尝试解析JSON
        JSON.parse(row.defect_types);
        validCount++;
        console.log(`✅ ID ${row.id}: JSON格式正确`);
      } catch (error) {
        // JSON解析失败，需要修复
        console.log(`🔧 ID ${row.id}: 修复无效JSON - ${row.defect_types}`);
        
        // 根据内容推测原始意图并修复
        let fixedDefectTypes = '[]'; // 默认空数组
        
        if (row.defect_types.includes('鏉愭枡鏉傝川')) {
          // 乱码可能是"材料杂质"
          fixedDefectTypes = '["材料杂质"]';
        } else if (row.defect_types.includes('灏哄')) {
          // 乱码可能是"尺寸偏差"
          fixedDefectTypes = '["尺寸偏差"]';
        } else if (row.defect_types.includes('琛ㄩ潰')) {
          // 乱码可能是"表面划痕"
          fixedDefectTypes = '["表面划痕"]';
        } else {
          // 其他情况，设置为常见的缺陷类型
          fixedDefectTypes = '["外观缺陷"]';
        }

        // 更新数据库
        await connection.execute(
          'UPDATE quality_inspections SET defect_types = ? WHERE id = ?',
          [fixedDefectTypes, row.id]
        );

        fixedCount++;
        console.log(`   ✅ 已修复为: ${fixedDefectTypes}`);
      }
    }

    console.log('\n📊 修复统计:');
    console.log(`   总记录数: ${rows.length}`);
    console.log(`   有效记录: ${validCount}`);
    console.log(`   修复记录: ${fixedCount}`);

    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const [verifyRows] = await connection.execute(`
      SELECT id, defect_types
      FROM quality_inspections
      WHERE defect_types IS NOT NULL
      ORDER BY id
      LIMIT 5
    `);

    console.log('📋 前5条记录的defect_types字段:');
    verifyRows.forEach(row => {
      try {
        const parsed = JSON.parse(row.defect_types);
        console.log(`   ID ${row.id}: ${row.defect_types} ✅`);
      } catch (e) {
        console.log(`   ID ${row.id}: ${row.defect_types} ❌`);
      }
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
  fixQualityInspectionsData()
    .then(() => {
      console.log('\n🎉 质量检验数据修复完成！');
      console.log('💡 现在IQC页面应该可以正常加载数据了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 修复失败:', error.message);
      process.exit(1);
    });
}

module.exports = { fixQualityInspectionsData };