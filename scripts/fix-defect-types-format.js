/**
 * 修复defect_types字段格式
 * 将PostgreSQL数组格式转换为JSON数组格式
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

async function fixDefectTypesFormat() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 开始修复defect_types字段格式...\n');

    // 查询所有质量检验记录
    const [rows] = await connection.execute(`
      SELECT id, defect_types
      FROM quality_inspections
      WHERE defect_types IS NOT NULL AND defect_types != ''
      ORDER BY id
    `);

    console.log(`📋 找到 ${rows.length} 条需要检查的记录`);

    let fixedCount = 0;

    for (const row of rows) {
      let defectTypes = String(row.defect_types || '');
      let needsUpdate = false;
      let newValue = '';

      console.log(`🔍 ID ${row.id}: 当前值 = "${defectTypes}"`);

      // 检查是否是PostgreSQL数组格式 {item1,item2}
      if (defectTypes.startsWith('{') && defectTypes.endsWith('}')) {
        // 转换PostgreSQL数组格式为JSON数组
        const content = defectTypes.slice(1, -1); // 移除 { }
        if (content.trim()) {
          const items = content.split(',').map(item => item.trim());
          newValue = JSON.stringify(items);
        } else {
          newValue = '[]';
        }
        needsUpdate = true;
      } else {
        // 尝试解析为JSON
        try {
          JSON.parse(defectTypes);
          console.log(`   ✅ 已经是有效JSON格式`);
        } catch (e) {
          // 不是有效JSON，尝试修复
          if (defectTypes.includes('材料杂质')) {
            newValue = '["材料杂质"]';
          } else if (defectTypes.includes('外观缺陷')) {
            newValue = '["外观缺陷"]';
          } else if (defectTypes.includes('尺寸偏差')) {
            newValue = '["尺寸偏差"]';
          } else if (defectTypes.includes('表面划痕')) {
            newValue = '["表面划痕"]';
          } else {
            newValue = '["其他缺陷"]';
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await connection.execute(
          'UPDATE quality_inspections SET defect_types = ? WHERE id = ?',
          [newValue, row.id]
        );
        fixedCount++;
        console.log(`   🔧 已修复为: ${newValue}`);
      }
    }

    console.log('\n📊 修复统计:');
    console.log(`   总记录数: ${rows.length}`);
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
    let allValid = true;
    verifyRows.forEach(row => {
      try {
        const parsed = JSON.parse(row.defect_types);
        console.log(`   ID ${row.id}: ${row.defect_types} ✅ (解析为: ${JSON.stringify(parsed)})`);
      } catch (e) {
        console.log(`   ID ${row.id}: ${row.defect_types} ❌ (解析失败)`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log('\n🎉 所有记录的JSON格式都正确！');
    } else {
      console.log('\n⚠️  仍有记录需要手动修复');
    }

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
  fixDefectTypesFormat()
    .then(() => {
      console.log('\n🎉 defect_types字段格式修复完成！');
      console.log('💡 现在IQC页面应该可以正常加载数据了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 修复失败:', error.message);
      process.exit(1);
    });
}

module.exports = { fixDefectTypesFormat };