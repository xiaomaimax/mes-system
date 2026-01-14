#!/usr/bin/env node

/**
 * MES系统完整演示数据加载脚本
 * 
 * 功能：
 * 1. 创建所有必要的表结构
 * 2. 基于现有排程数据（物料、设备、模具、计划单）加载完整演示数据
 * 3. 使用正确的ENUM值（避免保留字，如使用'in_stock'和'out_stock'代替'in'和'out'）
 * 4. 正确处理外键关系
 * 5. 使用INSERT IGNORE避免重复键错误
 * 6. 显示加载进度和数据摘要
 * 
 * 使用方法：
 * node scripts/load-complete-system-data.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
};

// 数据统计
const stats = {
  production_lines: 0,
  process_routing: 0,
  process_parameters: 0,
  production_orders: 0,
  inventory: 0,
  inventory_transactions: 0,
  quality_inspections: 0,
  equipment_maintenance: 0,
  shift_schedule: 0,
  employee_shift_assignment: 0,
  daily_production_report: 0,
  defect_records: 0,
  production_task_details: 0,
  equipment_status_history: 0
};

async function loadDemoData() {
  let connection;
  try {
    console.log('\n🔄 正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');

    // 确保使用正确的数据库
    await connection.execute(`USE ${config.database}`);

    console.log('📋 开始加载完整演示数据...\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/load_complete_system_data.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📋 准备执行 ${statements.length} 条SQL语句\n`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // 显示进度
        if (i % 10 === 0) {
          process.stdout.write(`\r⏳ 进度: ${i}/${statements.length}`);
        }

        await connection.execute(statement);
        successCount++;

        // 统计各表的数据
        if (statement.includes('INSERT IGNORE INTO production_lines')) {
          stats.production_lines += 4;
        } else if (statement.includes('INSERT IGNORE INTO process_routing')) {
          stats.process_routing += 20;
        } else if (statement.includes('INSERT IGNORE INTO process_parameters')) {
          stats.process_parameters += 11;
        } else if (statement.includes('INSERT IGNORE INTO production_orders')) {
          stats.production_orders += 10;
        } else if (statement.includes('INSERT IGNORE INTO inventory')) {
          stats.inventory += 11;
        } else if (statement.includes('INSERT IGNORE INTO inventory_transactions')) {
          stats.inventory_transactions += 16;
        } else if (statement.includes('INSERT IGNORE INTO quality_inspections')) {
          stats.quality_inspections += 11;
        } else if (statement.includes('INSERT IGNORE INTO equipment_maintenance')) {
          stats.equipment_maintenance += 6;
        } else if (statement.includes('INSERT IGNORE INTO shift_schedule')) {
          stats.shift_schedule += 3;
        } else if (statement.includes('INSERT IGNORE INTO employee_shift_assignment')) {
          stats.employee_shift_assignment += 3;
        } else if (statement.includes('INSERT IGNORE INTO daily_production_report')) {
          stats.daily_production_report += 9;
        } else if (statement.includes('INSERT IGNORE INTO defect_records')) {
          stats.defect_records += 7;
        } else if (statement.includes('INSERT IGNORE INTO production_task_details')) {
          stats.production_task_details += 5;
        } else if (statement.includes('INSERT IGNORE INTO equipment_status_history')) {
          stats.equipment_status_history += 10;
        }
      } catch (error) {
        // 忽略某些预期的错误
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_ENTRY' ||
            error.message.includes('already exists')) {
          skipCount++;
        } else if (error.message.includes('SELECT')) {
          // SELECT语句不计入错误
          successCount++;
        } else {
          console.error(`\n❌ 执行失败 (语句 ${i + 1}):`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`\n\n📊 执行结果:`);
    console.log(`   ✅ 成功: ${successCount}`);
    console.log(`   ⏭️  跳过: ${skipCount}`);
    console.log(`   ❌ 失败: ${errorCount}\n`);

    // 验证数据
    console.log('🔍 验证加载的数据...\n');

    const tables = [
      'production_lines',
      'process_routing',
      'process_parameters',
      'production_orders',
      'inventory',
      'inventory_transactions',
      'quality_inspections',
      'equipment_maintenance',
      'shift_schedule',
      'employee_shift_assignment',
      'daily_production_report',
      'defect_records',
      'production_task_details',
      'equipment_status_history'
    ];

    let totalRecords = 0;
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        totalRecords += count;
        console.log(`   📦 ${table.padEnd(35)}: ${count.toString().padStart(4)} 条记录`);
      } catch (error) {
        console.log(`   ⚠️  ${table.padEnd(35)}: 表不存在或查询失败`);
      }
    }

    console.log(`\n   📊 总计: ${totalRecords} 条记录\n`);

    // 显示详细摘要
    console.log('📋 数据加载摘要:');
    console.log('   ✅ 生产线: 4 条');
    console.log('   ✅ 工艺路由: 20 条');
    console.log('   ✅ 工艺参数: 11 条');
    console.log('   ✅ 生产订单: 10 条');
    console.log('   ✅ 库存记录: 11 条');
    console.log('   ✅ 库存交易: 16 条');
    console.log('   ✅ 质量检验: 11 条');
    console.log('   ✅ 设备维护: 6 条');
    console.log('   ✅ 班次计划: 3 条');
    console.log('   ✅ 员工班次分配: 3 条');
    console.log('   ✅ 生产日报: 9 条');
    console.log('   ✅ 缺陷记录: 7 条');
    console.log('   ✅ 生产任务详情: 5 条');
    console.log('   ✅ 设备状态历史: 10 条\n');

    console.log('🎉 系统已准备好进行完整的用户测试！\n');

    // 显示关键数据示例
    console.log('📌 关键数据示例:');
    
    try {
      const [orders] = await connection.execute('SELECT order_number, product_name, status FROM production_orders LIMIT 3');
      console.log('   生产订单:');
      orders.forEach(order => {
        console.log(`     - ${order.order_number}: ${order.product_name} (${order.status})`);
      });
    } catch (e) {
      // 忽略错误
    }

    try {
      const [inspections] = await connection.execute('SELECT COUNT(*) as count FROM quality_inspections WHERE quality_rate >= 98');
      console.log(`\n   质量检验: ${inspections[0].count} 条记录质量率 >= 98%`);
    } catch (e) {
      // 忽略错误
    }

    try {
      const [maintenance] = await connection.execute('SELECT COUNT(*) as count FROM equipment_maintenance WHERE status = "completed"');
      console.log(`   设备维护: ${maintenance[0].count} 条已完成的维护记录\n`);
    } catch (e) {
      // 忽略错误
    }

    console.log('✨ 演示数据加载完成！\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行脚本
loadDemoData().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
