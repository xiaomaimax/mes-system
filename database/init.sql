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

-- 设备排程扩展表
CREATE TABLE IF NOT EXISTS equipment_scheduling_ext (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL UNIQUE,
    capacity_per_hour INT DEFAULT 0,
    scheduling_weight INT DEFAULT 50,
    is_available_for_scheduling BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
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

-- IQC检验表 (来料检验)
CREATE TABLE IF NOT EXISTS iqc_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id VARCHAR(50) NOT NULL UNIQUE,
    purchase_order VARCHAR(50) NOT NULL,
    supplier VARCHAR(200) NOT NULL,
    material_info VARCHAR(200) NOT NULL,
    arrival_date DATE NOT NULL,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    inspection_qty INT NOT NULL,
    qualified_qty INT NOT NULL,
    defect_type VARCHAR(200),
    comprehensive_score DECIMAL(5,2),
    inspection_result ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
    status ENUM('completed', 'in_progress', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PQC检验表 (过程检验)
CREATE TABLE IF NOT EXISTS pqc_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id VARCHAR(50) NOT NULL UNIQUE,
    production_order VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    inspection_qty INT NOT NULL,
    qualified_qty INT NOT NULL,
    pass_rate DECIMAL(5,2),
    inspection_result ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
    status ENUM('completed', 'in_progress', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- FQC检验表 (成品检验)
CREATE TABLE IF NOT EXISTS fqc_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id VARCHAR(50) NOT NULL UNIQUE,
    batch_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    inspection_qty INT NOT NULL,
    qualified_qty INT NOT NULL,
    pass_rate DECIMAL(5,2),
    inspection_result ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
    status ENUM('completed', 'in_progress', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- OQC检验表 (出货检验)
CREATE TABLE IF NOT EXISTS oqc_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id VARCHAR(50) NOT NULL UNIQUE,
    batch_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    inspection_qty INT NOT NULL,
    qualified_qty INT NOT NULL,
    pass_rate DECIMAL(5,2),
    inspection_result ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
    status ENUM('completed', 'in_progress', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 次品原因表
CREATE TABLE IF NOT EXISTS defect_reasons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reason_id VARCHAR(50) NOT NULL UNIQUE,
    reason_code VARCHAR(50) NOT NULL UNIQUE,
    reason_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 检验标准表
CREATE TABLE IF NOT EXISTS inspection_standards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    standard_id VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    standard_code VARCHAR(50) NOT NULL,
    standard_name VARCHAR(200) NOT NULL,
    version VARCHAR(50),
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 次品记录表
CREATE TABLE IF NOT EXISTS defect_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_id VARCHAR(50) NOT NULL UNIQUE,
    batch_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    defect_date DATE NOT NULL,
    defect_reason VARCHAR(200),
    defect_qty INT NOT NULL,
    severity ENUM('minor', 'normal', 'critical') DEFAULT 'normal',
    status ENUM('resolved', 'in_progress', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 批次追溯表
CREATE TABLE IF NOT EXISTS batch_tracing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    production_date DATE,
    iqc_status VARCHAR(50),
    pqc_status VARCHAR(50),
    fqc_status VARCHAR(50),
    oqc_status VARCHAR(50),
    overall_status ENUM('qualified', 'unqualified', 'pending') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入初始数据

-- 插入默认管理员用户
INSERT INTO users (username, password, email, full_name, role, department) VALUES 
('admin', '$2a$10$GBAuRAiqWsJXlkqWliiWfOv1GZTrdyamumfKRjFEjDk2.cbyGgwGa', 'admin@mes.com', '系统管理员', 'admin', 'IT部门');

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

-- 生产线数据
INSERT INTO production_lines (line_code, line_name, description, capacity_per_hour) VALUES 
('LINE-001', '生产线1', '主要生产线，用于产品A生产', 100),
('LINE-002', '生产线2', '辅助生产线，用于产品B生产', 80),
('LINE-003', '生产线3', '包装生产线', 150);

-- 设备数据
INSERT INTO equipment (equipment_code, equipment_name, equipment_type, production_line_id, status, location) VALUES 
('EQ-001', '注塑机A1', '注塑设备', 1, 'running', '车间A-01'),
('EQ-002', '包装机B1', '包装设备', 1, 'idle', '车间A-02'),
('EQ-003', '检测设备C1', '检测设备', 2, 'maintenance', '车间B-01'),
('EQ-004', '传送带D1', '传送设备', 3, 'running', '车间C-01');

-- 库存数据
INSERT INTO inventory (material_code, material_name, material_type, current_stock, min_stock, max_stock, unit, location) VALUES 
('MAT-001', '原料A', 'raw_material', 1500, 500, 3000, 'kg', '仓库A-01'),
('MAT-002', '原料B', 'raw_material', 800, 300, 2000, 'kg', '仓库A-02'),
('MAT-003', '包装材料', 'raw_material', 2000, 1000, 5000, '个', '仓库B-01'),
('PROD-A001', '产品A', 'finished_product', 500, 100, 1000, '个', '成品仓库-01'),
('PROD-B001', '产品B', 'finished_product', 300, 50, 800, '个', '成品仓库-02');

-- IQC检验数据
INSERT INTO iqc_inspections (inspection_id, purchase_order, supplier, material_info, arrival_date, inspection_date, inspector, inspection_qty, qualified_qty, defect_type, comprehensive_score, inspection_result, status) VALUES 
('IQC-2024-001', 'PO-2024-001', 'Supplier A', 'Raw Material A', '2024-12-28', '2024-12-28', 'Inspector Zhang', 100, 98, 'Size deviation', 95.0, 'qualified', 'completed'),
('IQC-2024-002', 'PO-2024-002', 'Supplier B', 'Raw Material B', '2024-12-27', '2024-12-27', 'Inspector Li', 150, 148, 'Surface scratch', 98.0, 'qualified', 'completed'),
('IQC-2024-003', 'PO-2024-003', 'Supplier C', 'Packaging Material', '2024-12-26', '2024-12-26', 'Inspector Wang', 500, 495, 'Defect', 99.0, 'qualified', 'completed');

-- PQC检验数据
INSERT INTO pqc_inspections (inspection_id, production_order, product_name, inspection_date, inspector, inspection_qty, qualified_qty, pass_rate, inspection_result, status) VALUES 
('PQC-2024-001', 'PO-2025-001', 'Phone Case A', '2024-12-28', 'Inspector Li', 500, 490, 98.0, 'qualified', 'completed'),
('PQC-2024-002', 'PO-2025-002', 'Phone Case B', '2024-12-27', 'Inspector Wang', 600, 594, 99.0, 'qualified', 'completed'),
('PQC-2024-003', 'PO-2025-003', 'Charger', '2024-12-26', 'Inspector Zhao', 400, 396, 99.0, 'qualified', 'completed');

-- FQC检验数据
INSERT INTO fqc_inspections (inspection_id, batch_number, product_name, inspection_date, inspector, inspection_qty, qualified_qty, pass_rate, inspection_result, status) VALUES 
('FQC-2024-001', 'B20241228001', 'Phone Case A', '2024-12-28', 'Inspector Wang', 1000, 990, 99.0, 'qualified', 'completed'),
('FQC-2024-002', 'B20241227001', 'Phone Case B', '2024-12-27', 'Inspector Zhao', 1200, 1188, 99.0, 'qualified', 'completed'),
('FQC-2024-003', 'B20241226001', 'Charger', '2024-12-26', 'Inspector Sun', 800, 792, 99.0, 'qualified', 'completed');

-- OQC检验数据
INSERT INTO oqc_inspections (inspection_id, batch_number, product_name, inspection_date, inspector, inspection_qty, qualified_qty, pass_rate, inspection_result, status) VALUES 
('OQC-2024-001', 'B20241228001', 'Phone Case A', '2024-12-28', 'Inspector Zhao', 1000, 988, 98.8, 'qualified', 'completed'),
('OQC-2024-002', 'B20241227001', 'Phone Case B', '2024-12-27', 'Inspector Sun', 1200, 1176, 98.0, 'qualified', 'completed'),
('OQC-2024-003', 'B20241226001', 'Charger', '2024-12-26', 'Inspector Zhou', 800, 784, 98.0, 'qualified', 'completed');

-- 次品原因数据
INSERT INTO defect_reasons (reason_id, reason_code, reason_name, category, description, status) VALUES 
('DR-001', 'DR001', 'Size deviation', 'Process issue', 'Product size does not meet specification', 'enabled'),
('DR-002', 'DR002', 'Surface scratch', 'Appearance issue', 'Product surface has scratches', 'enabled'),
('DR-003', 'DR003', 'Function abnormal', 'Function issue', 'Product function is abnormal', 'enabled'),
('DR-004', 'DR004', 'Color mismatch', 'Appearance issue', 'Product color does not match specification', 'enabled'),
('DR-005', 'DR005', 'Assembly error', 'Assembly issue', 'Product assembly is incorrect', 'enabled');

-- 检验标准数据
INSERT INTO inspection_standards (standard_id, product_name, standard_code, standard_name, version, status) VALUES 
('STD-001', 'Phone Case A', 'STD-001', 'Phone Case A Inspection Standard', 'V2.1', 'enabled'),
('STD-002', 'Charger', 'STD-002', 'Charger Inspection Standard', 'V1.0', 'enabled'),
('STD-003', 'Phone Case B', 'STD-003', 'Phone Case B Inspection Standard', 'V1.5', 'enabled'),
('STD-004', 'Raw Material A', 'STD-004', 'Raw Material A Inspection Standard', 'V3.0', 'enabled');

-- 次品记录数据
INSERT INTO defect_records (record_id, batch_number, product_name, defect_date, defect_reason, defect_qty, severity, status) VALUES 
('DEF-001', 'B20241218001', 'Plastic Cup Type A', '2024-12-18', 'Size deviation', 50, 'critical', 'resolved'),
('DEF-002', 'B20241218002', 'Box Type B', '2024-12-18', 'Surface scratch', 20, 'minor', 'resolved'),
('DEF-003', 'B20241217001', 'Phone Case A', '2024-12-17', 'Color mismatch', 15, 'normal', 'resolved'),
('DEF-004', 'B20241216001', 'Charger', '2024-12-16', 'Function abnormal', 8, 'critical', 'resolved');

-- 批次追溯数据
INSERT INTO batch_tracing (batch_number, product_name, production_date, iqc_status, pqc_status, fqc_status, oqc_status, overall_status) VALUES 
('B20241228001', 'Phone Case A', '2024-12-28', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified'),
('B20241227001', 'Phone Case B', '2024-12-27', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified'),
('B20241226001', 'Charger', '2024-12-26', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified'),
('B20241225001', 'Plastic Cup Type A', '2024-12-25', 'qualified', 'unqualified', 'unqualified', 'unqualified', 'unqualified');
