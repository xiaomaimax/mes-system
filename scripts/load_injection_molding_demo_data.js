#!/usr/bin/env node

/**
 * 注塑工艺完整模拟数据加载脚本
 * 
 * 功能：
 * 1. 清空所有历史数据
 * 2. 创建完整的注塑工艺演示数据
 * 3. 包括：工艺、设备、质量、物料、生产订单、库存等
 * 
 * 使用方法：
 * node scripts/load_injection_molding_demo_data.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function loadDemoData() {
  let connection;
  
  try {
    console.log('📊 开始加载注塑工艺完整模拟数据...\n');
    
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, '../database/injection_molding_demo_data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 准备执行 ${statements.length} 条SQL语句\n`);
    
    // 执行SQL语句
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        // 显示进度
        const progress = Math.round((i + 1) / statements.length * 100);
        process.stdout.write(`\r⏳ 执行进度: ${progress}% (${i + 1}/${statements.length})`);
        
        // 执行语句
        await connection.query(stmt);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`\n❌ 执行失败 (语句 ${i + 1}): ${error.message}`);
        console.error(`   SQL: ${stmt.substring(0, 100)}...`);
      }
    }
    
    console.log(`\n\n✅ 数据加载完成！\n`);
    console.log(`📊 执行统计:`);
    console.log(`   ✅ 成功: ${successCount} 条`);
    console.log(`   ❌ 失败: ${errorCount} 条`);
    
    // 显示数据统计
    console.log(`\n📈 数据统计:`);
    
    const tables = [
      { name: 'users', label: '用户' },
      { name: 'production_lines', label: '生产线' },
      { name: 'equipment', label: '设备' },
      { name: 'inventory', label: '物料' },
      { name: 'production_orders', label: '生产订单' },
      { name: 'quality_inspections', label: '质量检验' },
      { name: 'inventory_transactions', label: '库存变动' }
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = rows[0].count;
        console.log(`   ${table.label}: ${count} 条`);
      } catch (error) {
        console.log(`   ${table.label}: 查询失败`);
      }
    }
    
    console.log(`\n🎉 注塑工艺完整模拟数据加载成功！`);
    console.log(`\n📋 演示数据包括:`);
    console.log(`   ✅ 9个用户（管理员、经理、操作员、检验员）`);
    console.log(`   ✅ 4条生产线（注塑线、包装线）`);
    console.log(`   ✅ 15台设备（注塑机、干燥机、冷却塔、检测设备等）`);
    console.log(`   ✅ 40种物料（原料、模具、包装材料、半成品、成品）`);
    console.log(`   ✅ 8个生产订单（进行中、已完成）`);
    console.log(`   ✅ 15条质量检验记录（进料、过程、最终检验）`);
    console.log(`   ✅ 24条库存变动记录（入库、出库、销售）`);
    
    console.log(`\n🚀 系统已准备好进行业务测试！`);
    
  } catch (error) {
    console.error('❌ 加载失败:', error.message);
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
