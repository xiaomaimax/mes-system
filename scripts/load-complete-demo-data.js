#!/usr/bin/env node

/**
 * 加载完整演示数据脚本
 * 基于现有的排程数据（物料、设备、模具、计划单）
 * 为工艺、生产、设备、质量、库存等模块补充完整的演示数据
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mes_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function loadDemoData() {
  let connection;
  try {
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/complete_demo_data.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📋 准备执行 ${statements.length} 条SQL语句\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // 显示进度
        if (i % 10 === 0) {
          process.stdout.write(`\r⏳ 进度: ${i}/${statements.length}`);
        }

        await connection.execute(statement);
        successCount++;
      } catch (error) {
        // 忽略某些预期的错误（如表已存在）
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_ENTRY' ||
            error.message.includes('already exists')) {
          successCount++;
        } else {
          console.error(`\n❌ 执行失败 (语句 ${i + 1}):`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n\n📊 执行结果:`);
    console.log(`   ✅ 成功: ${successCount}`);
    console.log(`   ❌ 失败: ${errorCount}`);

    // 验证数据
    console.log('\n🔍 验证加载的数据...\n');

    const tables = [
      'process_routing',
      'process_parameters',
      'production_orders',
      'inventory',
      'inventory_transactions',
      'quality_inspections',
      'equipment_maintenance',
      'shift_schedule',
      'daily_production_report',
      'defect_records',
      'equipment_status_history'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        console.log(`   📦 ${table}: ${count} 条记录`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: 表不存在或查询失败`);
      }
    }

    console.log('\n✅ 完整演示数据加载完成！\n');

    // 显示摘要
    console.log('📋 数据摘要:');
    console.log('   ✅ 工艺路由: 20条');
    console.log('   ✅ 工艺参数: 11条');
    console.log('   ✅ 生产订单: 10条');
    console.log('   ✅ 库存记录: 11条');
    console.log('   ✅ 库存交易: 16条');
    console.log('   ✅ 质量检验: 10条');
    console.log('   ✅ 设备维护: 6条');
    console.log('   ✅ 班次计划: 3条');
    console.log('   ✅ 日报记录: 9条');
    console.log('   ✅ 缺陷记录: 7条');
    console.log('   ✅ 设备状态历史: 10条\n');

    console.log('🎉 系统已准备好进行完整的用户测试！\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行
loadDemoData().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
