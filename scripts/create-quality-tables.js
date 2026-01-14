/**
 * 创建质量检验相关的表
 */

require('dotenv').config();
const pool = require('../server/config/mysql');

async function createQualityTables() {
  try {
    console.log('开始创建质量检验表...\n');

    // ==================== FQC检验表 ====================
    console.log('1. 创建FQC检验表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fqc_inspections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inspection_id VARCHAR(50) NOT NULL UNIQUE,
        batch_number VARCHAR(50) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        inspection_date DATE NOT NULL,
        inspector VARCHAR(100),
        inspection_qty INT NOT NULL,
        qualified_qty INT NOT NULL,
        pass_rate DECIMAL(5, 2),
        inspection_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ FQC检验表创建成功\n');

    // ==================== PQC检验表 ====================
    console.log('2. 创建PQC检验表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pqc_inspections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inspection_id VARCHAR(50) NOT NULL UNIQUE,
        production_order VARCHAR(50) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        inspection_date DATE NOT NULL,
        inspector VARCHAR(100),
        inspection_qty INT NOT NULL,
        qualified_qty INT NOT NULL,
        pass_rate DECIMAL(5, 2),
        inspection_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ PQC检验表创建成功\n');

    // ==================== OQC检验表 ====================
    console.log('3. 创建OQC检验表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oqc_inspections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inspection_id VARCHAR(50) NOT NULL UNIQUE,
        batch_number VARCHAR(50) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        inspection_date DATE NOT NULL,
        inspector VARCHAR(100),
        inspection_qty INT NOT NULL,
        qualified_qty INT NOT NULL,
        pass_rate DECIMAL(5, 2),
        inspection_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ OQC检验表创建成功\n');

    // ==================== 缺陷原因表 ====================
    console.log('4. 创建缺陷原因表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS defect_reasons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reason_id VARCHAR(50) NOT NULL UNIQUE,
        reason_code VARCHAR(50) NOT NULL,
        reason_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        status ENUM('enabled', 'disabled') DEFAULT 'enabled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ 缺陷原因表创建成功\n');

    // ==================== 检验标准表 ====================
    console.log('5. 创建检验标准表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspection_standards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        standard_id VARCHAR(50) NOT NULL UNIQUE,
        product_name VARCHAR(200) NOT NULL,
        standard_code VARCHAR(50) NOT NULL,
        standard_name VARCHAR(200) NOT NULL,
        version VARCHAR(20),
        status ENUM('enabled', 'disabled') DEFAULT 'enabled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ 检验标准表创建成功\n');

    // ==================== 批次追溯表 ====================
    console.log('6. 创建批次追溯表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS batch_tracing (
        id INT PRIMARY KEY AUTO_INCREMENT,
        batch_number VARCHAR(50) NOT NULL UNIQUE,
        product_name VARCHAR(200) NOT NULL,
        production_date DATE NOT NULL,
        iqc_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        pqc_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        fqc_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        oqc_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        overall_status ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ 批次追溯表创建成功\n');

    console.log('✅ 所有质量检验表创建完成！');

  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createQualityTables();
