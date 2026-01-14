-- ============================================================================
-- MES系统完整演示数据 - 基于排程数据扩展
-- ============================================================================
-- 本脚本基于现有的排程数据（物料、设备、模具、计划单）
-- 为工艺、生产、设备、质量、库存等模块补充完整的演示数据

USE mes_system;

-- ============================================================================
-- 1. 生产线数据 (Production Lines)
-- ============================================================================

INSERT INTO production_lines (line_code, line_name, description, capacity_per_hour) VALUES 
('LINE-INJECT-001', '注塑生产线1', '主要注塑生产线，用于手机壳生产', 500),
('LINE-INJECT-002', '注塑生产线2', '辅助注塑生产线，用于配件生产', 400),
('LINE-PACK-001', '包装生产线1', '产品包装和质检生产线', 600),
('LINE-ASSEM-001', '组装生产线1', '产品组装和测试生产线', 300)
ON DUPLICATE KEY UPDATE line_name=VALUES(line_name);

-- ============================================================================
-- 2. 工艺路由数据 (Process Routing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_routing (
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
);

INSERT INTO process_routing (routing_code, material_id, process_sequence, process_name, equipment_id, mold_id, estimated_time) VALUES 
('ROUTE-MAT-001-001', 1, 1, '注塑成型', 1, 1, 45),
('ROUTE-MAT-001-002', 1, 2, '冷却脱模', 1, 1, 30),
('ROUTE-MAT-001-003', 1, 3, '质量检验', NULL, NULL, 20),
('ROUTE-MAT-001-004', 1, 4, '包装', NULL, NULL, 15),

('ROUTE-MAT-002-001', 2, 1, '注塑成型', 2, 2, 50),
('ROUTE-MAT-002-002', 2, 2, '冷却脱模', 2, 2, 35),
('ROUTE-MAT-002-003', 2, 3, '质量检验', NULL, NULL, 20),
('ROUTE-MAT-002-004', 2, 4, '包装', NULL, NULL, 15),

('ROUTE-MAT-003-001', 3, 1, '注塑成型', 3, 3, 40),
('ROUTE-MAT-003-002', 3, 2, '冷却脱模', 3, 3, 25),
('ROUTE-MAT-003-003', 3, 3, '质量检验', NULL, NULL, 20),
('ROUTE-MAT-003-004', 3, 4, '包装', NULL, NULL, 15),

('ROUTE-MAT-004-001', 4, 1, '注塑成型', 4, 4, 55),
('ROUTE-MAT-004-002', 4, 2, '冷却脱模', 4, 4, 40),
('ROUTE-MAT-004-003', 4, 3, '质量检验', NULL, NULL, 20),
('ROUTE-MAT-004-004', 4, 4, '包装', NULL, NULL, 15),

('ROUTE-MAT-005-001', 5, 1, '注塑成型', 5, 5, 48),
('ROUTE-MAT-005-002', 5, 2, '冷却脱模', 5, 5, 32),
('ROUTE-MAT-005-003', 5, 3, '质量检验', NULL, NULL, 20),
('ROUTE-MAT-005-004', 5, 4, '包装', NULL, NULL, 15)
ON DUPLICATE KEY UPDATE process_name=VALUES(process_name);

-- ============================================================================
-- 3. 工艺参数数据 (Process Parameters)
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_parameters (
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
);

INSERT INTO process_parameters (routing_id, parameter_name, parameter_value, unit, min_value, max_value) VALUES 
(1, '注塑温度', '220', '℃', 210, 230),
(1, '注塑压力', '80', 'MPa', 70, 90),
(1, '注塑速度', '50', 'mm/s', 40, 60),
(2, '冷却温度', '25', '℃', 20, 30),
(2, '冷却时间', '30', 's', 25, 35),
(5, '注塑温度', '225', '℃', 215, 235),
(5, '注塑压力', '85', 'MPa', 75, 95),
(5, '注塑速度', '55', 'mm/s', 45, 65),
(9, '注塑温度', '215', '℃', 205, 225),
(9, '注塑压力', '75', 'MPa', 65, 85),
(9, '注塑速度', '45', 'mm/s', 35, 55)
ON DUPLICATE KEY UPDATE parameter_value=VALUES(parameter_value);

-- ============================================================================
-- 4. 生产订单数据 (Production Orders)
-- ============================================================================

INSERT INTO production_orders (order_number, product_code, product_name, planned_quantity, produced_quantity, qualified_quantity, defective_quantity, status, priority, production_line_id, planned_start_time, planned_end_time, created_by) VALUES 
('PO-2025-001', 'MAT-001', '手机壳A', 5000, 4800, 4700, 100, 'in_progress', 'urgent', 1, '2025-12-26 08:00:00', '2025-12-28 20:00:00', 1),
('PO-2025-002', 'MAT-002', '手机壳B', 2500, 2300, 2250, 50, 'in_progress', 'high', 1, '2025-12-27 08:00:00', '2026-01-02 20:00:00', 1),
('PO-2025-003', 'MAT-003', '充电器', 4000, 3500, 3400, 100, 'pending', 'high', 2, '2025-12-28 08:00:00', '2025-12-30 20:00:00', 1),
('PO-2025-004', 'MAT-004', '手机壳C', 3000, 2800, 2750, 50, 'in_progress', 'normal', 1, '2025-12-26 16:00:00', '2025-12-30 16:00:00', 1),
('PO-2025-005', 'MAT-005', '手机壳D', 2500, 2400, 2350, 50, 'in_progress', 'normal', 1, '2025-12-26 16:00:00', '2025-12-30 16:00:00', 1),
('PO-2025-006', 'MAT-006', '手机壳E', 3500, 3200, 3100, 100, 'pending', 'normal', 2, '2025-12-29 08:00:00', '2026-01-03 20:00:00', 1),
('PO-2025-007', 'MAT-007', '高端手机壳', 2000, 1800, 1750, 50, 'pending', 'high', 2, '2025-12-30 08:00:00', '2026-01-01 20:00:00', 1),
('PO-2025-008', 'MAT-008', '电池盖板', 2500, 2200, 2150, 50, 'pending', 'normal', 1, '2026-01-01 08:00:00', '2026-01-05 20:00:00', 1),
('PO-2025-009', 'MAT-009', '标准手机壳', 1500, 1400, 1350, 50, 'pending', 'normal', 1, '2025-12-27 08:00:00', '2025-12-29 20:00:00', 1),
('PO-2025-010', 'MAT-010', '屏幕保护膜', 5000, 4500, 4400, 100, 'pending', 'normal', 3, '2025-12-28 08:00:00', '2026-01-02 20:00:00', 1)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ============================================================================
-- 5. 库存数据 (Inventory)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    warehouse_location VARCHAR(100),
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT '个',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

INSERT INTO inventory (material_id, warehouse_location, current_stock, min_stock, max_stock, unit) VALUES 
(1, '仓库A-01', 8000, 2000, 15000, '个'),
(2, '仓库A-02', 5000, 1500, 10000, '个'),
(3, '仓库A-03', 4000, 1000, 8000, '个'),
(4, '仓库B-01', 6000, 1500, 12000, '个'),
(5, '仓库B-02', 5500, 1500, 11000, '个'),
(6, '仓库B-03', 4500, 1000, 9000, '个'),
(7, '仓库C-01', 3000, 800, 6000, '个'),
(8, '仓库C-02', 3500, 1000, 7000, '个'),
(9, '仓库C-03', 2500, 500, 5000, '个'),
(10, '仓库D-01', 10000, 3000, 20000, '个'),
(11, '仓库D-02', 8000, 2000, 16000, '个')
ON DUPLICATE KEY UPDATE current_stock=VALUES(current_stock);

-- ============================================================================
-- 6. 库存交易记录 (Inventory Transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    transaction_type ENUM('in', 'out', 'adjust') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('purchase', 'production', 'sale', 'adjustment') NOT NULL,
    reference_id VARCHAR(50),
    operator_id INT NOT NULL,
    notes TEXT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
);

INSERT INTO inventory_transactions (material_id, transaction_type, quantity, reference_type, reference_id, operator_id, notes) VALUES 
(1, 'in_stock', 5000, 'purchase', 'PUR-001', 1, '原料采购入库'),
(1, 'out_stock', 4800, 'production', 'PO-2025-001', 1, '生产订单消耗'),
(2, 'in_stock', 3000, 'purchase', 'PUR-002', 1, '原料采购入库'),
(2, 'out_stock', 2300, 'production', 'PO-2025-002', 1, '生产订单消耗'),
(3, 'in_stock', 4500, 'purchase', 'PUR-003', 1, '原料采购入库'),
(3, 'out_stock', 3500, 'production', 'PO-2025-003', 1, '生产订单消耗'),
(4, 'in_stock', 6500, 'purchase', 'PUR-004', 1, '原料采购入库'),
(4, 'out_stock', 2800, 'production', 'PO-2025-004', 1, '生产订单消耗'),
(5, 'in_stock', 6000, 'purchase', 'PUR-005', 1, '原料采购入库'),
(5, 'out_stock', 2400, 'production', 'PO-2025-005', 1, '生产订单消耗'),
(6, 'in_stock', 5000, 'purchase', 'PUR-006', 1, '原料采购入库'),
(7, 'in_stock', 3500, 'purchase', 'PUR-007', 1, '原料采购入库'),
(8, 'in_stock', 4000, 'purchase', 'PUR-008', 1, '原料采购入库'),
(9, 'in_stock', 3000, 'purchase', 'PUR-009', 1, '原料采购入库'),
(10, 'in_stock', 12000, 'purchase', 'PUR-010', 1, '原料采购入库'),
(11, 'in_stock', 10000, 'purchase', 'PUR-011', 1, '原料采购入库')
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- ============================================================================
-- 7. 质量检验数据 (Quality Inspections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quality_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_order_id INT NOT NULL,
    inspection_type ENUM('incoming', 'in_process', 'final') NOT NULL,
    inspected_quantity INT NOT NULL,
    qualified_quantity INT NOT NULL,
    defective_quantity INT NOT NULL,
    quality_rate DECIMAL(5,2),
    inspector_id INT NOT NULL,
    inspection_date DATETIME NOT NULL,
    defect_types JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
);

INSERT INTO quality_inspections (production_order_id, inspection_type, inspected_quantity, qualified_quantity, defective_quantity, quality_rate, inspector_id, inspection_date, defect_types, notes) VALUES 
(1, 'in_process', 4800, 4700, 100, 97.92, 1, '2025-12-27 10:00:00', '["表面划伤", "尺寸偏差"]', '注塑成型阶段检验'),
(1, 'final', 4700, 4700, 0, 100.00, 1, '2025-12-28 18:00:00', '[]', '最终质量检验'),
(2, 'in_process', 2300, 2250, 50, 97.83, 1, '2025-12-28 10:00:00', '["颜色不均", "气泡"]', '注塑成型阶段检验'),
(3, 'incoming', 4500, 4400, 100, 97.78, 1, '2025-12-28 08:00:00', '["材料杂质"]', '原料入库检验'),
(4, 'in_process', 2800, 2750, 50, 98.21, 1, '2025-12-27 14:00:00', '["表面缺陷"]', '注塑成型阶段检验'),
(5, 'in_process', 2400, 2350, 50, 97.92, 1, '2025-12-27 14:00:00', '["尺寸偏差"]', '注塑成型阶段检验'),
(6, 'incoming', 5000, 4900, 100, 98.00, 1, '2025-12-29 08:00:00', '["材料杂质"]', '原料入库检验'),
(7, 'incoming', 3500, 3400, 100, 97.14, 1, '2025-12-30 08:00:00', '["材料杂质"]', '原料入库检验'),
(8, 'incoming', 4000, 3900, 100, 97.50, 1, '2026-01-01 08:00:00', '["材料杂质"]', '原料入库检验'),
(9, 'incoming', 3000, 2900, 100, 96.67, 1, '2025-12-27 08:00:00', '["材料杂质"]', '原料入库检验'),
(10, 'incoming', 12000, 11700, 300, 97.50, 1, '2025-12-28 08:00:00', '["材料杂质"]', '原料入库检验')
ON DUPLICATE KEY UPDATE quality_rate=VALUES(quality_rate);

-- ============================================================================
-- 8. 设备维护记录 (Equipment Maintenance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    maintenance_type ENUM('preventive', 'corrective', 'inspection') NOT NULL,
    maintenance_date DATETIME NOT NULL,
    completion_date DATETIME,
    description TEXT,
    technician_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
);

INSERT INTO equipment_maintenance (device_id, maintenance_type, maintenance_date, completion_date, description, technician_id, status, notes) VALUES 
(1, 'preventive', '2025-12-20 08:00:00', '2025-12-20 12:00:00', '定期保养检查', 1, 'completed', '更换液压油，检查螺栓'),
(2, 'preventive', '2025-12-22 08:00:00', '2025-12-22 10:00:00', '定期保养检查', 1, 'completed', '清洁传送带，检查轴承'),
(3, 'corrective', '2025-12-25 14:00:00', '2025-12-26 10:00:00', '故障维修', 1, 'completed', '更换损坏的传感器'),
(4, 'preventive', '2025-12-27 08:00:00', NULL, '定期保养检查', 1, 'pending', '计划进行定期保养'),
(5, 'inspection', '2025-12-28 08:00:00', NULL, '设备检查', 1, 'pending', '计划进行设备检查'),
(6, 'preventive', '2025-12-29 08:00:00', NULL, '定期保养检查', 1, 'pending', '计划进行定期保养')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ============================================================================
-- 9. 班次计划 (Shift Schedule)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shift_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_code VARCHAR(50) NOT NULL UNIQUE,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO shift_schedule (shift_code, shift_name, start_time, end_time, capacity, description) VALUES 
('SHIFT-001', '早班', '08:00:00', '16:00:00', 50, '早班生产班次'),
('SHIFT-002', '中班', '16:00:00', '00:00:00', 50, '中班生产班次'),
('SHIFT-003', '晚班', '00:00:00', '08:00:00', 50, '晚班生产班次')
ON DUPLICATE KEY UPDATE shift_name=VALUES(shift_name);

-- ============================================================================
-- 10. 员工班次分配 (Employee Shift Assignment)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_shift_assignment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    status ENUM('assigned', 'completed', 'cancelled') DEFAULT 'assigned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shift_schedule(id)
);

INSERT INTO employee_shift_assignment (user_id, shift_id, assignment_date, status) VALUES 
(1, 1, '2025-12-26', 'assigned'),
(1, 2, '2025-12-27', 'assigned'),
(1, 3, '2025-12-28', 'assigned')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ============================================================================
-- 11. 生产日报 (Daily Production Report)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_production_report (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE NOT NULL,
    production_line_id INT NOT NULL,
    shift_id INT NOT NULL,
    planned_quantity INT,
    actual_quantity INT,
    qualified_quantity INT,
    defective_quantity INT,
    downtime_minutes INT DEFAULT 0,
    downtime_reason TEXT,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_line_id) REFERENCES production_lines(id),
    FOREIGN KEY (shift_id) REFERENCES shift_schedule(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO daily_production_report (report_date, production_line_id, shift_id, planned_quantity, actual_quantity, qualified_quantity, defective_quantity, downtime_minutes, downtime_reason, created_by) VALUES 
('2025-12-26', 1, 1, 1000, 950, 930, 20, 30, '设备调试', 1),
('2025-12-26', 1, 2, 1000, 980, 960, 20, 15, '换模具', 1),
('2025-12-26', 2, 1, 800, 750, 730, 20, 45, '原料问题', 1),
('2025-12-27', 1, 1, 1000, 1000, 980, 20, 0, '', 1),
('2025-12-27', 1, 2, 1000, 950, 930, 20, 30, '设备维护', 1),
('2025-12-27', 2, 1, 800, 800, 780, 20, 0, '', 1),
('2025-12-28', 1, 1, 1000, 980, 960, 20, 20, '换模具', 1),
('2025-12-28', 1, 2, 1000, 1000, 980, 20, 0, '', 1),
('2025-12-28', 2, 1, 800, 750, 730, 20, 45, '原料问题', 1)
ON DUPLICATE KEY UPDATE actual_quantity=VALUES(actual_quantity);

-- ============================================================================
-- 12. 缺陷记录 (Defect Records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS defect_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    defect_code VARCHAR(50) NOT NULL UNIQUE,
    defect_name VARCHAR(100) NOT NULL,
    defect_category VARCHAR(50),
    severity ENUM('minor', 'major', 'critical') DEFAULT 'minor',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO defect_records (defect_code, defect_name, defect_category, severity, description) VALUES 
('DEF-001', '表面划伤', '外观缺陷', 'minor', '产品表面有划伤'),
('DEF-002', '尺寸偏差', '尺寸缺陷', 'major', '产品尺寸超出公差范围'),
('DEF-003', '颜色不均', '外观缺陷', 'minor', '产品颜色分布不均匀'),
('DEF-004', '气泡', '内部缺陷', 'major', '产品内部有气泡'),
('DEF-005', '材料杂质', '材料缺陷', 'critical', '原料中含有杂质'),
('DEF-006', '表面缺陷', '外观缺陷', 'minor', '产品表面有缺陷'),
('DEF-007', '变形', '形状缺陷', 'major', '产品发生变形')
ON DUPLICATE KEY UPDATE defect_name=VALUES(defect_name);

-- ============================================================================
-- 13. 生产任务详情 (Production Task Details)
-- ============================================================================

CREATE TABLE IF NOT EXISTS production_task_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    device_id INT NOT NULL,
    mold_id INT NOT NULL,
    planned_start_time DATETIME,
    planned_end_time DATETIME,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES production_tasks(id),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (mold_id) REFERENCES molds(id)
);

-- ============================================================================
-- 14. 设备运行状态 (Equipment Status History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS equipment_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    status_time DATETIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

INSERT INTO equipment_status_history (device_id, status, status_time, reason) VALUES 
(1, 'running', '2025-12-26 08:00:00', '开始生产'),
(1, 'idle', '2025-12-26 16:00:00', '班次结束'),
(1, 'running', '2025-12-27 08:00:00', '开始生产'),
(2, 'idle', '2025-12-26 08:00:00', '待命'),
(2, 'running', '2025-12-26 14:00:00', '开始生产'),
(3, 'maintenance', '2025-12-25 14:00:00', '故障维修'),
(3, 'idle', '2025-12-26 10:00:00', '维修完成'),
(4, 'running', '2025-12-26 08:00:00', '开始生产'),
(5, 'idle', '2025-12-26 08:00:00', '待命'),
(6, 'idle', '2025-12-26 08:00:00', '待命')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ============================================================================
-- 完成标记
-- ============================================================================

SELECT '✅ 完整演示数据加载完成' AS status;
SELECT COUNT(*) as process_routing_count FROM process_routing;
SELECT COUNT(*) as process_parameters_count FROM process_parameters;
SELECT COUNT(*) as production_orders_count FROM production_orders;
SELECT COUNT(*) as inventory_count FROM inventory;
SELECT COUNT(*) as inventory_transactions_count FROM inventory_transactions;
SELECT COUNT(*) as quality_inspections_count FROM quality_inspections;
SELECT COUNT(*) as equipment_maintenance_count FROM equipment_maintenance;
SELECT COUNT(*) as shift_schedule_count FROM shift_schedule;
SELECT COUNT(*) as daily_production_report_count FROM daily_production_report;
SELECT COUNT(*) as defect_records_count FROM defect_records;
SELECT COUNT(*) as equipment_status_history_count FROM equipment_status_history;
