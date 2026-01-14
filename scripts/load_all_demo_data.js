#!/usr/bin/env node

/**
 * 完整演示数据加载脚本
 * 
 * 功能：
 * 1. 加载注塑工艺完整模拟数据
 * 2. 加载排程模块演示数据
 * 3. 加载10条排程规则演示数据（可选）
 * 4. 清空所有历史数据
 * 5. 创建完整的业务流程数据
 * 
 * 使用方法：
 * node scripts/load_all_demo_data.js              (加载所有数据)
 * node scripts/load_all_demo_data.js --rules-only (仅加载10条规则数据)
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

async function loadSQLFile(connection, filePath, fileName) {
  try {
    console.log(`\n📂 加载 ${fileName}...`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   📝 准备执行 ${statements.length} 条SQL语句`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        const progress = Math.round((i + 1) / statements.length * 100);
        process.stdout.write(`\r   ⏳ 进度: ${progress}% (${i + 1}/${statements.length})`);
        
        await connection.query(stmt);
        successCount++;
      } catch (error) {
        errorCount++;
        if (errorCount <= 3) {  // 只显示前3个错误
          console.error(`\n   ❌ 错误: ${error.message}`);
        }
      }
    }
    
    console.log(`\n   ✅ 完成: ${successCount} 成功, ${errorCount} 失败`);
    return { successCount, errorCount };
    
  } catch (error) {
    console.error(`❌ 加载失败: ${error.message}`);
    throw error;
  }
}

async function getTableStats(connection) {
  const tables = [
    { name: 'users', label: '用户' },
    { name: 'production_lines', label: '生产线' },
    { name: 'equipment', label: '设备' },
    { name: 'inventory', label: '物料' },
    { name: 'production_orders', label: '生产订单' },
    { name: 'quality_inspections', label: '质量检验' },
    { name: 'inventory_transactions', label: '库存变动' },
    { name: 'materials', label: '排程物料' },
    { name: 'devices', label: '排程设备' },
    { name: 'molds', label: '排程模具' },
    { name: 'production_plans', label: '生产计划' },
    { name: 'production_tasks', label: '生产任务' }
  ];
  
  console.log(`\n📊 数据统计:`);
  
  for (const table of tables) {
    try {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table.name}`);
      const count = rows[0].count;
      console.log(`   ${table.label}: ${count} 条`);
    } catch (error) {
      // 表可能不存在，跳过
    }
  }
}

async function loadAllDemoData() {
  let connection;
  
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    const rulesOnly = args.includes('--rules-only');
    
    console.log('🚀 开始加载完整演示数据...\n');
    console.log('═'.repeat(50));
    
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');
    
    if (rulesOnly) {
      // 仅加载10条规则数据
      console.log('📌 模式: 仅加载10条排程规则演示数据\n');
      const rulesPath = path.join(__dirname, '../database/10_rules_scheduling_demo_data.sql');
      const rulesStats = await loadSQLFile(connection, rulesPath, '10条排程规则演示数据');
      
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`\n🎉 10条排程规则演示数据加载完成！\n`);
      
      console.log(`📈 加载统计:`);
      console.log(`   10条规则数据: ${rulesStats.successCount} 成功, ${rulesStats.errorCount} 失败`);
      
      console.log(`\n📋 演示数据包括:`);
      console.log(`   ✅ 11种物料`);
      console.log(`   ✅ 6台设备`);
      console.log(`   ✅ 8套模具`);
      console.log(`   ✅ 15条物料-设备关系`);
      console.log(`   ✅ 12条物料-模具关系`);
      console.log(`   ✅ 14个生产计划（覆盖10条规则）`);
      
    } else {
      // 加载所有数据
      console.log('📌 模式: 加载所有演示数据\n');
      
      // 加载注塑工艺数据
      const injectionPath = path.join(__dirname, '../database/injection_molding_demo_data.sql');
      const injectionStats = await loadSQLFile(connection, injectionPath, '注塑工艺演示数据');
      
      // 加载排程数据
      const schedulingPath = path.join(__dirname, '../database/scheduling_demo_data.sql');
      const schedulingStats = await loadSQLFile(connection, schedulingPath, '排程模块演示数据');
      
      // 获取统计信息
      await getTableStats(connection);
      
      // 显示完成信息
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`\n🎉 演示数据加载完成！\n`);
      
      console.log(`📈 加载统计:`);
      console.log(`   注塑工艺数据: ${injectionStats.successCount} 成功, ${injectionStats.errorCount} 失败`);
      console.log(`   排程模块数据: ${schedulingStats.successCount} 成功, ${schedulingStats.errorCount} 失败`);
      
      console.log(`\n📋 演示数据包括:`);
      console.log(`   ✅ 9个用户（管理员、经理、操作员、检验员）`);
      console.log(`   ✅ 4条生产线（注塑线、包装线）`);
      console.log(`   ✅ 15台设备（注塑机、干燥机、冷却塔、检测设备等）`);
      console.log(`   ✅ 40种物料（原料、模具、包装材料、半成品、成品）`);
      console.log(`   ✅ 8个生产订单（进行中、已完成）`);
      console.log(`   ✅ 15条质量检验记录（进料、过程、最终检验）`);
      console.log(`   ✅ 24条库存变动记录（入库、出库、销售）`);
      console.log(`   ✅ 6种排程物料`);
      console.log(`   ✅ 9台排程设备`);
      console.log(`   ✅ 6套排程模具`);
      console.log(`   ✅ 10个生产计划`);
      console.log(`   ✅ 9个生产任务`);
    }
    
    console.log(`\n🔐 默认用户信息:`);
    console.log(`   用户名: admin`);
    console.log(`   密码: password`);
    console.log(`   角色: 管理员`);
    
    console.log(`\n🚀 系统已准备好进行业务测试！`);
    console.log(`\n💡 建议测试流程:`);
    console.log(`   1. 登录系统 (admin/password)`);
    console.log(`   2. 查看生产订单和进度`);
    console.log(`   3. 查看设备状态和维护计划`);
    console.log(`   4. 查看质量检验记录`);
    console.log(`   5. 查看库存和库存变动`);
    console.log(`   6. 执行排程计算`);
    console.log(`   7. 查看生产报表`);
    
    console.log(`\n📚 更多信息请参考:`);
    console.log(`   - INJECTION_MOLDING_DEMO_DATA_GUIDE.md`);
    console.log(`   - SCHEDULING_10_RULES_COMPLETE.md`);
    console.log(`   - docs/08-scheduling/10-RULES-VERIFICATION-GUIDE.md\n`);
    
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
loadAllDemoData().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
