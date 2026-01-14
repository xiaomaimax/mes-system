#!/usr/bin/env node

/**
 * 加载完整演示数据脚本
 * 创建所有必要的表并加载演示数据
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mes_system'
};

const SQL_STATEMENTS = [
  // 生产线表
  `CREATE TABLE IF NOT EXISTS production_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    line_code VARCHAR(50) NOT NULL UNIQUE,
    line_name VARCHAR(200) NOT NULL,
    description TEXT,
    capacity_per_hour INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // 工艺路由表
  `CREATE TABLE IF NOT EXISTS process_routing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    routing_code VARCHAR(50) NOT NULL UNIQUE,
    material_id INT NOT NULL,
    process_sequence INT NOT NULL,
    process_name VARCHAR(100) NOT NULL,
    equipment_id INT,
    mold_id INT,
    estimated_time INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (equipment_id) REFERENCES devices(id),
    FOREIGN KEY (mold_id) REFERENCES molds(id)
  )`,

  // 工艺参数表
  `CREATE TABLE IF NOT EXISTS process_parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    routing_id INT NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value VARCHAR(200) NOT NULL,
    unit VARCHAR(50),
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (routing_id) REFERENCES process_routing(id)
  )`,
];

async function loadData() {
  let connection;
  try {
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');

    console.log('📋 创建表结构...\n');
    for (const sql of SQL_STATEMENTS) {
      try {
        await connection.execute(sql);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ 错误:', error.message);
        }
      }
    }

    console.log('✅ 表结构创建完成\n');

    // 插入生产线数据
    console.log('📦 加载生产线数据...');
    await connection.execute(`
      INSERT IGNORE INTO production_lines (line_code, line_name, description, capacity_per_hour) VALUES 
      ('LINE-INJECT-001', '注塑生产线1', '主要注塑生产线，用于手机壳生产', 500),
      ('LINE-INJECT-002', '注塑生产线2', '辅助注塑生产线，用于配件生产', 400),
      ('LINE-PACK-001', '包装生产线1', '产品包装和质检生产线', 600),
      ('LINE-ASSEM-001', '组装生产线1', '产品组装和测试生产线', 300)
    `);
    console.log('✅ 生产线数据加载完成\n');

    // 插入工艺路由数据
    console.log('📦 加载工艺路由数据...');
    const routingData = [
      [1, 1, 1, '注塑成型', 1, 1, 45],
      [1, 1, 2, '冷却脱模', 1, 1, 30],
      [1, 1, 3, '质量检验', null, null, 20],
      [1, 1, 4, '包装', null, null, 15],
      [2, 2, 1, '注塑成型', 2, 2, 50],
      [2, 2, 2, '冷却脱模', 2, 2, 35],
      [2, 2, 3, '质量检验', null, null, 20],
      [2, 2, 4, '包装', null, null, 15],
      [3, 3, 1, '注塑成型', 3, 3, 40],
      [3, 3, 2, '冷却脱模', 3, 3, 25],
      [3, 3, 3, '质量检验', null, null, 20],
      [3, 3, 4, '包装', null, null, 15],
      [4, 4, 1, '注塑成型', 4, 4, 55],
      [4, 4, 2, '冷却脱模', 4, 4, 40],
      [4, 4, 3, '质量检验', null, null, 20],
      [4, 4, 4, '包装', null, null, 15],
      [5, 5, 1, '注塑成型', 5, 5, 48],
      [5, 5, 2, '冷却脱模', 5, 5, 32],
      [5, 5, 3, '质量检验', null, null, 20],
      [5, 5, 4, '包装', null, null, 15],
    ];

    for (const [code, matId, seq, name, eqId, moldId, time] of routingData) {
      await connection.execute(
        `INSERT IGNORE INTO process_routing (routing_code, material_id, process_sequence, process_name, equipment_id, mold_id, estimated_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`ROUTE-MAT-${String(matId).padStart(3, '0')}-${String(seq).padStart(3, '0')}`, matId, seq, name, eqId, moldId, time]
      );
    }
    console.log('✅ 工艺路由数据加载完成\n');

    console.log('🎉 所有演示数据加载完成！\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

loadData();
