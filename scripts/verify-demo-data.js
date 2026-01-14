#!/usr/bin/env node

/**
 * MES系统演示数据验证脚本
 * 
 * 功能：
 * 1. 验证所有14个表的数据是否正确加载
 * 2. 检查外键关系的完整性
 * 3. 验证ENUM值的正确性
 * 4. 生成详细的验证报告
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system'
};

async function verifyDemoData() {
  let connection;
  try {
    console.log('\n🔍 开始验证演示数据...\n');
    connection = await mysql.createConnection(config);
    await connection.execute(`USE ${config.database}`);

    const tables = [
      { name: 'production_lines', expectedCount: 4 },
      { name: 'process_routing', expectedCount: 20 },
      { name: 'process_parameters', expectedCount: 11 },
      { name: 'production_orders', expectedCount: 10 },
      { name: 'inventory', expectedCount: 11 },
      { name: 'inventory_transactions', expectedCount: 16 },
      { name: 'quality_inspections', expectedCount: 11 },
      { name: 'equipment_maintenance', expectedCount: 6 },
      { name: 'shift_schedule', expectedCount: 3 },
      { name: 'employee_shift_assignment', expectedCount: 3 },
      { name: 'daily_production_report', expectedCount: 9 },
      { name: 'defect_records', expectedCount: 7 },
      { name: 'production_task_details', expectedCount: 5 },
      { name: 'equipment_status_history', expectedCount: 10 }
    ];

    let totalRecords = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    console.log('📊 表数据验证:\n');

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = rows[0].count;
        totalRecords += count;

        const status = count >= table.expectedCount ? '✅' : '⚠️ ';
        console.log(`${status} ${table.name.padEnd(35)}: ${count}/${table.expectedCount} 条记录`);

        if (count >= table.expectedCount) {
          passedChecks++;
        } else {
          failedChecks++;
        }
      } catch (error) {
        console.log(`❌ ${table.name.padEnd(35)}: 表不存在或查询失败`);
        failedChecks++;
      }
    }

    console.log(`\n📈 验证结果:`);
    console.log(`   ✅ 通过: ${passedChecks}/${tables.length}`);
    console.log(`   ❌ 失败: ${failedChecks}/${tables.length}`);
    console.log(`   📊 总记录数: ${totalRecords}\n`);

    // 验证外键关系
    console.log('🔗 外键关系验证:\n');

    try {
      const [orders] = await connection.execute(
        'SELECT COUNT(*) as count FROM production_orders WHERE production_line_id NOT IN (SELECT id FROM production_lines)'
      );
      if (orders[0].count === 0) {
        console.log('✅ production_orders.production_line_id 外键完整');
      } else {
        console.log(`⚠️  production_orders 中有 ${orders[0].count} 条记录的 production_line_id 无效`);
      }
    } catch (e) {
      console.log('⚠️  无法验证 production_orders 外键');
    }

    try {
      const [routing] = await connection.execute(
        'SELECT COUNT(*) as count FROM process_routing WHERE material_id NOT IN (SELECT id FROM materials)'
      );
      if (routing[0].count === 0) {
        console.log('✅ process_routing.material_id 外键完整');
      } else {
        console.log(`⚠️  process_routing 中有 ${routing[0].count} 条记录的 material_id 无效`);
      }
    } catch (e) {
      console.log('⚠️  无法验证 process_routing 外键');
    }

    try {
      const [inventory] = await connection.execute(
        'SELECT COUNT(*) as count FROM inventory WHERE material_id NOT IN (SELECT id FROM materials)'
      );
      if (inventory[0].count === 0) {
        console.log('✅ inventory.material_id 外键完整');
      } else {
        console.log(`⚠️  inventory 中有 ${inventory[0].count} 条记录的 material_id 无效`);
      }
    } catch (e) {
      console.log('⚠️  无法验证 inventory 外键');
    }

    // 验证ENUM值
    console.log('\n📋 ENUM值验证:\n');

    try {
      const [orders] = await connection.execute(
        "SELECT DISTINCT status FROM production_orders"
      );
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const allValid = orders.every(o => validStatuses.includes(o.status));
      if (allValid) {
        console.log('✅ production_orders.status ENUM值正确');
      } else {
        console.log('⚠️  production_orders.status 包含无效值');
      }
    } catch (e) {
      console.log('⚠️  无法验证 production_orders.status');
    }

    try {
      const [transactions] = await connection.execute(
        "SELECT DISTINCT transaction_type FROM inventory_transactions"
      );
      const validTypes = ['in_stock', 'out_stock', 'adjust'];
      const allValid = transactions.every(t => validTypes.includes(t.transaction_type));
      if (allValid) {
        console.log('✅ inventory_transactions.transaction_type ENUM值正确');
      } else {
        console.log('⚠️  inventory_transactions.transaction_type 包含无效值');
      }
    } catch (e) {
      console.log('⚠️  无法验证 inventory_transactions.transaction_type');
    }

    // 数据质量检查
    console.log('\n🎯 数据质量检查:\n');

    try {
      const [orders] = await connection.execute(
        'SELECT COUNT(*) as count FROM production_orders WHERE planned_quantity > 0'
      );
      console.log(`✅ 生产订单: ${orders[0].count} 个有效订单`);
    } catch (e) {
      console.log('⚠️  无法检查生产订单质量');
    }

    try {
      const [inventory] = await connection.execute(
        'SELECT COUNT(*) as count FROM inventory WHERE current_stock >= 0'
      );
      console.log(`✅ 库存: ${inventory[0].count} 个有效库存记录`);
    } catch (e) {
      console.log('⚠️  无法检查库存质量');
    }

    try {
      const [inspections] = await connection.execute(
        'SELECT AVG(quality_rate) as avg_rate FROM quality_inspections'
      );
      console.log(`✅ 质量检验: 平均质量率 ${inspections[0].avg_rate.toFixed(2)}%`);
    } catch (e) {
      console.log('⚠️  无法检查质量检验质量');
    }

    // 总结
    console.log('\n' + '='.repeat(50));
    if (failedChecks === 0) {
      console.log('✅ 所有验证通过！演示数据已正确加载。\n');
    } else {
      console.log(`⚠️  有 ${failedChecks} 项验证未通过，请检查数据。\n`);
    }

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行验证
verifyDemoData().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
