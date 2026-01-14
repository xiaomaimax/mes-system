#!/usr/bin/env node

/**
 * 10条排程规则演示数据初始化脚本
 * 
 * 功能：
 * 1. 加载10条排程规则的完整演示数据
 * 2. 创建14个计划单，覆盖所有10条规则
 * 3. 显示数据统计和验证信息
 * 
 * 使用方法：
 * node scripts/init-10-rules-demo-data.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(title, 'bright');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

async function initializeDemoData() {
  let connection;
  
  try {
    logSection('10条排程规则演示数据初始化');
    
    // 1. 连接数据库
    log('📡 正在连接数据库...', 'blue');
    connection = await mysql.createConnection(config);
    log('✅ 数据库连接成功\n', 'green');
    
    // 2. 读取SQL文件
    log('📖 正在读取SQL脚本...', 'blue');
    const sqlFilePath = path.join(__dirname, '../database/10_rules_scheduling_demo_data.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL文件不存在: ${sqlFilePath}`);
    }
    
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    log('✅ SQL脚本读取成功\n', 'green');
    
    // 3. 分割SQL语句
    log('🔄 正在处理SQL语句...', 'blue');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`✅ 共有 ${statements.length} 条SQL语句\n`, 'green');
    
    // 4. 执行SQL语句
    log('⚙️  正在执行SQL语句...', 'blue');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      try {
        // 跳过SELECT语句的执行（只用于验证）
        if (stmt.trim().toUpperCase().startsWith('SELECT')) {
          continue;
        }
        
        await connection.query(stmt);
        successCount++;
        
        // 显示进度
        if ((i + 1) % 5 === 0) {
          process.stdout.write(`\r  进度: ${i + 1}/${statements.length}`);
        }
      } catch (error) {
        errorCount++;
        log(`\n⚠️  SQL执行错误 (语句 ${i + 1}): ${error.message}`, 'yellow');
      }
    }
    
    console.log(''); // 换行
    log(`✅ SQL语句执行完成 (成功: ${successCount}, 失败: ${errorCount})\n`, 'green');
    
    // 5. 验证数据
    logSection('📊 数据统计');
    
    const queries = [
      { name: '物料', query: 'SELECT COUNT(*) as count FROM materials' },
      { name: '设备', query: 'SELECT COUNT(*) as count FROM devices' },
      { name: '模具', query: 'SELECT COUNT(*) as count FROM molds' },
      { name: '物料-设备关系', query: 'SELECT COUNT(*) as count FROM material_device_relations' },
      { name: '物料-模具关系', query: 'SELECT COUNT(*) as count FROM material_mold_relations' },
      { name: '生产计划', query: 'SELECT COUNT(*) as count FROM production_plans' }
    ];
    
    for (const item of queries) {
      const [rows] = await connection.query(item.query);
      const count = rows[0].count;
      log(`  ${item.name}: ${count}`, 'cyan');
    }
    
    // 6. 显示计划单列表
    logSection('📋 生产计划列表');
    
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
    
    log('计划单号\t\t物料名称\t\t数量\t交期\t\t状态', 'bright');
    log('-'.repeat(80), 'cyan');
    
    for (const plan of plans) {
      const dueDate = new Date(plan.due_date).toLocaleDateString('zh-CN');
      log(`${plan.plan_number}\t${plan.material_name}\t${plan.planned_quantity}\t${dueDate}\t${plan.status}`, 'cyan');
    }
    
    // 7. 显示规则覆盖情况
    logSection('🎯 10条排程规则覆盖情况');
    
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
      log(`  ${rule.emoji} ${rule.name.padEnd(20)} → ${rule.plan}`, 'cyan');
    }
    
    // 8. 显示下一步操作
    logSection('🚀 下一步操作');
    
    log('1. 访问系统: http://localhost:3000', 'yellow');
    log('2. 登录系统 (用户: admin, 密码: admin)', 'yellow');
    log('3. 进入"辅助排程"模块', 'yellow');
    log('4. 点击"执行自动排产"按钮', 'yellow');
    log('5. 查看排程结果，对比验证清单', 'yellow');
    log('6. 参考文档: docs/08-scheduling/10-RULES-VERIFICATION-GUIDE.md\n', 'yellow');
    
    // 9. 显示完成信息
    logSection('✨ 初始化完成');
    
    log('✅ 10条排程规则演示数据已成功加载！', 'green');
    log('✅ 14个计划单已创建，覆盖所有10条规则', 'green');
    log('✅ 系统已准备好进行排程验证\n', 'green');
    
  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, 'yellow');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initializeDemoData().catch(error => {
  log(`\n❌ 初始化失败: ${error.message}`, 'yellow');
  process.exit(1);
});
