/**
 * 初始化数据库表结构
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  try {
    // 创建连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'mes_system',
      multipleStatements: true,
      charset: 'utf8mb4'
    });

    console.log('✓ 数据库连接成功\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/scheduling_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 执行SQL
    console.log('开始创建表结构...\n');
    await connection.query(sql);
    console.log('✓ 表结构创建成功\n');

    // 验证表是否创建
    const tables = [
      'materials',
      'devices',
      'molds',
      'material_device_relations',
      'material_mold_relations',
      'production_plans',
      'production_tasks',
      'scheduling_adjustments',
      'scheduling_warnings',
      'multi_material_mold_relations'
    ];

    console.log('验证表结构...\n');
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✓ 表 ${table} 已创建`);
      } else {
        console.log(`✗ 表 ${table} 创建失败`);
      }
    }

    console.log('\n✅ 数据库初始化完成！');
    await connection.end();

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// 加载环境变量
require('dotenv').config();

// 运行初始化
initializeDatabase();
