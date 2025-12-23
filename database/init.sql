-- MES系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mes_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'operator', 'quality_inspector') DEFAULT 'operator',
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 生产线表
CREATE TABLE IF NOT EXISTS production_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    line_code VARCHAR(50) NOT NULL UNIQUE,
    line_name VARCHAR(200) NOT NULL,
    description TEXT,
    capacity_per_hour INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 生产订单表
CREATE TABLE IF NOT EXISTS production_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    planned_quantity INT NOT NULL,
    produced_quantity INT DEFAULT 0,
    qualified_quantity INT DEFAULT 0,
    defective_quantity INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    production_line_id INT NOT NULL,
    planned_start_time DATETIME NOT NULL,
    planned_end_time DATETIME NOT NULL,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_line_id) REFERENCES production_lines(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 设备表
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_code VARCHAR(50) NOT NULL UNIQUE,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    production_line_id INT NOT NULL,
    status ENUM('running', 'idle', 'maintenance', 'fault', 'offline') DEFAULT 'idle',
    location VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    warranty_end_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    specifications JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_line_id) REFERENCES production_lines(id)
);

-- 质量检验表
CREATE TABLE IF NOT EXISTS quality_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_order_id INT NOT NULL,
    inspection_type ENUM('incoming', 'in_process', 'final') NOT NULL,
    inspected_quantity INT NOT NULL,
    qualified_quantity INT NOT NULL,
    defective_quantity INT NOT NULL,
    quality_rate DECIMAL(5,2) GENERATED ALWAYS AS (qualified_quantity / inspected_quantity * 100) STORED,
    inspector_id INT NOT NULL,
    inspection_date DATETIME NOT NULL,
    defect_types JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- 库存表
CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_name VARCHAR(200) NOT NULL,
    material_type ENUM('raw_material', 'semi_finished', 'finished_product') NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2),
    location VARCHAR(100),
    supplier VARCHAR(200),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 库存变动记录表
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    transaction_type ENUM('in', 'out', 'adjust') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reference_type ENUM('purchase', 'production', 'sale', 'adjustment') NOT NULL,
    reference_id INT,
    operator_id INT NOT NULL,
    notes TEXT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES inventory(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
);

-- 插入初始数据

-- 插入默认管理员用户
INSERT INTO users (username, password, email, full_name, role, department) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@mes.com', '系统管理员', 'admin', 'IT部门');

-- 插入生产线数据
INSERT INTO production_lines (line_code, line_name, description, capacity_per_hour) VALUES 
('LINE-001', '生产线1', '主要生产线，用于产品A生产', 100),
('LINE-002', '生产线2', '辅助生产线，用于产品B生产', 80),
('LINE-003', '生产线3', '包装生产线', 150);

-- 插入设备数据
INSERT INTO equipment (equipment_code, equipment_name, equipment_type, production_line_id, status, location) VALUES 
('EQ-001', '注塑机A1', '注塑设备', 1, 'running', '车间A-01'),
('EQ-002', '包装机B1', '包装设备', 1, 'idle', '车间A-02'),
('EQ-003', '检测设备C1', '检测设备', 2, 'maintenance', '车间B-01'),
('EQ-004', '传送带D1', '传送设备', 3, 'running', '车间C-01');

-- 插入库存数据
INSERT INTO inventory (material_code, material_name, material_type, current_stock, min_stock, max_stock, unit, location) VALUES 
('MAT-001', '原料A', 'raw_material', 1500, 500, 3000, 'kg', '仓库A-01'),
('MAT-002', '原料B', 'raw_material', 800, 300, 2000, 'kg', '仓库A-02'),
('MAT-003', '包装材料', 'raw_material', 2000, 1000, 5000, '个', '仓库B-01'),
('PROD-A001', '产品A', 'finished_product', 500, 100, 1000, '个', '成品仓库-01'),
('PROD-B001', '产品B', 'finished_product', 300, 50, 800, '个', '成品仓库-02');