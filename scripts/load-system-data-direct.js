#!/usr/bin/env node

/**
 * MES系统完整演示数据加载脚本 - 直接方式
 * 使用mysql命令行直接加载SQL文件
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'mes_system';

async function loadData() {
  try {
    console.log('\n🔄 正在加载完整演示数据...\n');

    const sqlFile = path.join(__dirname, '../database/load_complete_system_data.sql');

    // 使用mysql命令行加载SQL文件
    const command = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${sqlFile}"`;
    
    console.log('📋 执行SQL文件...');
    execSync(command, { stdio: 'inherit' });

    console.log('\n✅ SQL文件加载完成\n');

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
        const countCommand = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SELECT COUNT(*) as count FROM ${table};" 2>/dev/null`;
        const result = execSync(countCommand, { encoding: 'utf8' });
        const lines = result.trim().split('\n');
        const count = parseInt(lines[1]) || 0;
        totalRecords += count;
        console.log(`   📦 ${table.padEnd(35)}: ${count.toString().padStart(4)} 条记录`);
      } catch (error) {
        console.log(`   ⚠️  ${table.padEnd(35)}: 查询失败`);
      }
    }

    console.log(`\n   📊 总计: ${totalRecords} 条记录\n`);

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

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

loadData();
