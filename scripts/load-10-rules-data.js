#!/usr/bin/env node

/**
 * 加载10条排程规则演示数据脚本
 * 直接执行SQL文件中的所有语句
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
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true
};

async function loadDemoData() {
  let connection;
  
  try {
    console.log('\n🚀 开始加载10条排程规则演示数据...\n');
    
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');
    
    // 读取SQL文件
    console.log('📂 读取SQL脚本...');
    const sqlPath = path.join(__dirname, '../database/10_rules_scheduling_demo_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL脚本读取成功\n');
    
    // 执行SQL
    console.log('⚙️  执行SQL语句...');
    const results = await connection.query(sqlContent);
    console.log('✅ SQL执行完成\n');
    
    // 获取统计信息
    console.log('📊 数据统计:');
    
    const queries = [
      { name: '物料', query: 'SELECT COUNT(*) as count FROM materials' },
      { name: '设备', query: 'SELECT COUNT(*) as count FROM devices' },
      { name: '模具', query: 'SELECT COUNT(*) as count FROM molds' },
      { name: '物料-设备关系', query: 'SELECT COUNT(*) as count FROM material_device_relations' },
      { name: '物料-模具关系', query: 'SELECT COUNT(*) as count FROM material_mold_relations' },
      { name: '生产计划', query: 'SELECT COUNT(*) as count FROM production_plans' },
      { name: '生产任务', query: 'SELECT COUNT(*) as count FROM production_tasks' }
    ];
    
    for (const item of queries) {
      try {
        const [rows] = await connection.query(item.query);
        const count = rows[0].count;
        console.log(`   ${item.name}: ${count} 条`);
      } catch (error) {
        console.log(`   ${item.name}: 表不存在或查询失败`);
      }
    }
    
    // 显示计划单列表
    console.log('\n📋 生产计划列表:');
    
    try {
      const [plans] = await connection.query(`
        SELECT 
          pp.plan_number,
          m.material_name,
          pp.planned_quantity,
          pp.due_date,
          pp.status
        FROM production_plans pp
        JOIN materials m ON pp.material_id = m.id
        ORDER BY pp.due_date ASC
      `);
      
      if (plans.length > 0) {
        console.log('\n计划单号\t\t物料名称\t\t数量\t交期\t\t状态');
        console.log('-'.repeat(80));
        
        for (const plan of plans) {
          const dueDate = new Date(plan.due_date).toLocaleDateString('zh-CN');
          console.log(`${plan.plan_number}\t${plan.material_name}\t${plan.planned_quantity}\t${dueDate}\t${plan.status}`);
        }
      } else {
        console.log('   (无计划单数据)');
      }
    } catch (error) {
      console.log('   (无法获取计划单列表)');
    }
    
    // 显示规则覆盖情况
    console.log('\n🎯 10条排程规则覆盖情况:');
    
    const rules = [
      { emoji: '1️⃣', name: '交期优先', plan: 'PL-URGENT-001' },
      { emoji: '2️⃣', name: '设备权重优先', plan: 'PL-DEV-WEIGHT-001' },
      { emoji: '3️⃣', name: '模具权重优先', plan: 'PL-MOLD-WEIGHT-001' },
      { emoji: '4️⃣', name: '模具-设备独占性', plan: 'PL-EXCLUSIVE-001' },
      { emoji: '5️⃣', name: '模具-设备绑定', plan: 'PL-BIND-001/002' },
      { emoji: '6️⃣', name: '同物料一致性', plan: 'PL-MAT-CONSIST-001/002' },
      { emoji: '7️⃣', name: '同模具一致性', plan: 'PL-MOLD-CONSIST-001/002' },
      { emoji: '8️⃣', name: '计划单唯一性', plan: 'PL-UNIQUE-001' },
      { emoji: '9️⃣', name: '同模多物料同步', plan: 'PL-MULTI-MAT-001/002' },
      { emoji: '🔟', name: '多模具灵活排程', plan: 'PL-FLEXIBLE-001' }
    ];
    
    for (const rule of rules) {
      console.log(`  ${rule.emoji} ${rule.name.padEnd(20)} → ${rule.plan}`);
    }
    
    // 显示下一步操作
    console.log('\n🚀 下一步操作:');
    console.log('1. 启动系统: npm run server (后端) 和 npm run client (前端)');
    console.log('2. 访问系统: http://localhost:3000');
    console.log('3. 登录系统: 用户 admin, 密码 password');
    console.log('4. 进入"辅助排程"模块');
    console.log('5. 点击"执行自动排产"按钮');
    console.log('6. 查看排程结果，对比验证清单\n');
    
    console.log('✨ 演示数据加载完成！系统已准备好进行用户测试！\n');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
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
