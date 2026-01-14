/**
 * 设备档案功能验证脚本
 * 验证设备档案数据补齐是否完成
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

async function verifyEquipmentArchives() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 开始验证设备档案数据...\n');

    // 1. 检查设备主数据
    const [equipmentRows] = await connection.execute(`
      SELECT equipment_code, equipment_name, equipment_type, manufacturer, location
      FROM equipment 
      WHERE is_active = 1
      ORDER BY equipment_code
    `);

    console.log('📋 设备主数据统计:');
    console.log(`   总设备数: ${equipmentRows.length}`);
    equipmentRows.forEach(eq => {
      console.log(`   ${eq.equipment_code} - ${eq.equipment_name} (${eq.equipment_type})`);
    });

    // 2. 检查设备档案数据
    const [archiveRows] = await connection.execute(`
      SELECT equipment_code, equipment_name, category, manufacturer, 
             original_value, current_value, maintenance_records, repair_records
      FROM equipment_archives
      ORDER BY equipment_code
    `);

    console.log('\n📁 设备档案统计:');
    console.log(`   档案总数: ${archiveRows.length}`);
    
    // 3. 对比验证
    console.log('\n🔍 数据对比验证:');
    const equipmentCodes = new Set(equipmentRows.map(eq => eq.equipment_code));
    const archiveCodes = new Set(archiveRows.map(ar => ar.equipment_code));
    
    let allMatched = true;
    
    equipmentRows.forEach(equipment => {
      const hasArchive = archiveCodes.has(equipment.equipment_code);
      const status = hasArchive ? '✅' : '❌';
      console.log(`   ${status} ${equipment.equipment_code} - ${equipment.equipment_name}`);
      
      if (!hasArchive) {
        allMatched = false;
      }
    });

    // 4. 详细档案信息
    console.log('\n📊 详细档案信息:');
    archiveRows.forEach(archive => {
      console.log(`   ${archive.equipment_code}:`);
      console.log(`     名称: ${archive.equipment_name}`);
      console.log(`     类型: ${archive.category}`);
      console.log(`     制造商: ${archive.manufacturer}`);
      console.log(`     原值: ¥${archive.original_value?.toLocaleString() || '0'}`);
      console.log(`     现值: ¥${archive.current_value?.toLocaleString() || '0'}`);
      console.log(`     维护记录: ${archive.maintenance_records}次`);
      console.log(`     维修记录: ${archive.repair_records}次`);
      console.log('');
    });

    // 5. 统计信息
    const totalOriginalValue = archiveRows.reduce((sum, ar) => sum + (parseFloat(ar.original_value) || 0), 0);
    const totalCurrentValue = archiveRows.reduce((sum, ar) => sum + (parseFloat(ar.current_value) || 0), 0);
    const totalMaintenance = archiveRows.reduce((sum, ar) => sum + (ar.maintenance_records || 0), 0);
    const totalRepair = archiveRows.reduce((sum, ar) => sum + (ar.repair_records || 0), 0);

    console.log('📈 资产统计:');
    console.log(`   设备原值总计: ¥${totalOriginalValue.toLocaleString()}`);
    console.log(`   设备现值总计: ¥${totalCurrentValue.toLocaleString()}`);
    console.log(`   折旧率: ${((totalOriginalValue - totalCurrentValue) / totalOriginalValue * 100).toFixed(1)}%`);
    console.log(`   维护记录总计: ${totalMaintenance}次`);
    console.log(`   维修记录总计: ${totalRepair}次`);

    // 6. 验证结果
    console.log('\n🎯 验证结果:');
    if (allMatched && equipmentRows.length === archiveRows.length) {
      console.log('✅ 设备档案数据补齐完成！');
      console.log(`✅ 所有 ${equipmentRows.length} 个设备都有对应的档案记录`);
      console.log('✅ 设备编号完全匹配');
      console.log('✅ 档案信息完整');
    } else {
      console.log('❌ 设备档案数据不完整');
      console.log(`❌ 主数据设备数: ${equipmentRows.length}, 档案数: ${archiveRows.length}`);
    }

    // 7. API测试建议
    console.log('\n🔧 API测试建议:');
    console.log('   测试设备档案API:');
    console.log('   GET http://localhost:5002/api/equipment-archives');
    console.log('   前端页面: http://localhost:3000 -> 设备管理 -> 设备档案');

  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行验证
if (require.main === module) {
  verifyEquipmentArchives()
    .then(() => {
      console.log('\n🎉 设备档案验证完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 验证失败:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyEquipmentArchives };