#!/usr/bin/env node
/**
 * MaxMES P3-2 权限增强 - 数据库迁移脚本
 * 使用 Sequelize 执行数据库迁移
 */

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'mes_system',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  timezone: '+08:00',
  logging: console.log
});

async function runMigration() {
  const sqlPath = path.join(__dirname, 'p3-2-permission-migration.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ 迁移文件不存在:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  try {
    console.log('🔌 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('🚀 开始执行 P3-2 权限增强迁移...');
    
    // 直接执行整个 SQL 文件（多语句模式）
    await sequelize.query(sql, { 
      multipleStatements: true,
      logging: (msg) => {
        if (msg.includes('Executing')) console.log(msg);
      }
    });
    
    console.log('✅ SQL 执行完成');

    // 等待一下让表创建完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 执行统计查询
    const [roles] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    const [permissions] = await sequelize.query('SELECT COUNT(*) as count FROM permissions');
    const [departments] = await sequelize.query('SELECT COUNT(*) as count FROM departments');
    const [menus] = await sequelize.query('SELECT COUNT(*) as count FROM menu_permissions');

    console.log('\n===========================================');
    console.log('✅ P3-2 权限增强数据库迁移完成！');
    console.log('===========================================');
    console.log(`📊 角色数量：${roles[0].count}`);
    console.log(`📊 权限数量：${permissions[0].count}`);
    console.log(`📊 部门数量：${departments[0].count}`);
    console.log(`📊 菜单数量：${menus[0].count}`);
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 运行迁移
runMigration();
