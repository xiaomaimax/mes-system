#!/usr/bin/env node

/**
 * 初始化equipment_scheduling_ext表
 */

require('dotenv').config();
const sequelize = require('../server/config/database');

async function initTable() {
  try {
    console.log('正在初始化equipment_scheduling_ext表...\n');

    // 执行原始SQL创建表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS equipment_scheduling_ext (
        id INT PRIMARY KEY AUTO_INCREMENT,
        equipment_id INT NOT NULL UNIQUE,
        capacity_per_hour INT DEFAULT 0,
        scheduling_weight INT DEFAULT 50,
        is_available_for_scheduling BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
      )
    `);

    console.log('✓ equipment_scheduling_ext表创建成功\n');

    // 验证表是否存在
    const result = await sequelize.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'mes_system' AND TABLE_NAME = 'equipment_scheduling_ext'
    `);

    if (result[0].length > 0) {
      console.log('✓ 表验证成功\n');
    }

    await sequelize.close();
    console.log('✓ 初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

initTable();
