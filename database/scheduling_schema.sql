-- 辅助排程模块数据库表结构

USE mes_system;

-- 物料信息表
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_name VARCHAR(200) NOT NULL,
    material_type VARCHAR(50),
    specifications VARCHAR(200),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_material_code (material_code),
    INDEX idx_status (status)
);

-- 设备信息表
CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(200) NOT NULL,
    specifications VARCHAR(200),
    status ENUM('normal', 'maintenance', 'idle', 'scrapped') DEFAULT 'normal',
    capacity_per_hour INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_code (device_code),
    INDEX idx_status (status)
);

-- 模具信息表
CREATE TABLE IF NOT EXISTS molds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mold_code VARCHAR(50) NOT NULL UNIQUE,
    mold_name VARCHAR(200) NOT NULL,
    specifications VARCHAR(200),
    quantity INT DEFAULT 1,
    status ENUM('normal', 'maintenance', 'idle', 'scrapped') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mold_code (mold_code),
    INDEX idx_status (status)
);

-- 物料设备关系表
CREATE TABLE IF NOT EXISTS material_device_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    device_id INT NOT NULL,
    weight INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_material_device (material_id, device_id),
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_material_id (material_id),
    INDEX idx_device_id (device_id)
);

-- 物料模具关系表
CREATE TABLE IF NOT EXISTS material_mold_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    mold_id INT NOT NULL,
    weight INT DEFAULT 50,
    cycle_time INT DEFAULT 0,
    output_per_cycle INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_material_mold (material_id, mold_id),
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
    INDEX idx_material_id (material_id),
    INDEX idx_mold_id (mold_id)
);

-- 计划单表
CREATE TABLE IF NOT EXISTS production_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_number VARCHAR(50) NOT NULL UNIQUE,
    material_id INT NOT NULL,
    planned_quantity INT NOT NULL,
    due_date DATETIME NOT NULL,
    status ENUM('unscheduled', 'scheduled', 'cancelled') DEFAULT 'unscheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    INDEX idx_plan_number (plan_number),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_material_id (material_id)
);

-- 任务单表
CREATE TABLE IF NOT EXISTS production_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_number VARCHAR(50) NOT NULL UNIQUE,
    plan_id INT NOT NULL,
    device_id INT NOT NULL,
    mold_id INT NOT NULL,
    task_quantity INT NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    due_date DATETIME NOT NULL,
    planned_start_time DATETIME,
    planned_end_time DATETIME,
    erp_task_number VARCHAR(50),
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    scheduling_reason VARCHAR(255) COMMENT '排程原因：说明应用了哪条核心逻辑规则',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
    INDEX idx_task_number (task_number),
    INDEX idx_plan_id (plan_id),
    INDEX idx_device_id (device_id),
    INDEX idx_mold_id (mold_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_erp_task_number (erp_task_number)
);

-- 排程调整记录表
CREATE TABLE IF NOT EXISTS scheduling_adjustments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    operator_id INT NOT NULL,
    adjustment_type VARCHAR(50),
    old_device_id INT,
    new_device_id INT,
    old_mold_id INT,
    new_mold_id INT,
    old_start_time DATETIME,
    new_start_time DATETIME,
    old_end_time DATETIME,
    new_end_time DATETIME,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES production_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_created_at (created_at)
);

-- 排程预警表
CREATE TABLE IF NOT EXISTS scheduling_warnings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    warning_type ENUM('overdue', 'urgent', 'resource_conflict') DEFAULT 'overdue',
    warning_level ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES production_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_warning_type (warning_type),
    INDEX idx_is_resolved (is_resolved)
);

-- 同模多物料关系表
CREATE TABLE IF NOT EXISTS multi_material_mold_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mold_id INT NOT NULL,
    material_ids JSON NOT NULL,
    sync_production BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
    INDEX idx_mold_id (mold_id)
);

-- 初始化数据

-- 插入物料数据
INSERT INTO materials (material_code, material_name, material_type, specifications, status) VALUES 
('MAT-001', '塑料颗粒A', 'raw_material', '直径5mm', 'active'),
('MAT-002', '塑料颗粒B', 'raw_material', '直径3mm', 'active'),
('MAT-003', '产品A', 'finished_product', '规格100x50', 'active'),
('MAT-004', '产品B', 'finished_product', '规格80x40', 'active'),
('MAT-005', '产品C', 'finished_product', '规格120x60', 'active');

-- 插入设备数据
INSERT INTO devices (device_code, device_name, specifications, status, capacity_per_hour) VALUES 
('DEV-001', '注塑机1号', '注塑机-100T', 'normal', 100),
('DEV-002', '注塑机2号', '注塑机-150T', 'normal', 150),
('DEV-003', '注塑机3号', '注塑机-80T', 'normal', 80),
('DEV-004', '包装机1号', '自动包装机', 'normal', 200);

-- 插入模具数据
INSERT INTO molds (mold_code, mold_name, specifications, quantity, status) VALUES 
('MOLD-001', '模具A', '产品A专用模具', 2, 'normal'),
('MOLD-002', '模具B', '产品B专用模具', 1, 'normal'),
('MOLD-003', '模具C', '产品C专用模具', 3, 'normal'),
('MOLD-004', '通用模具', '可生产A和B', 2, 'normal');

-- 插入物料设备关系
INSERT INTO material_device_relations (material_id, device_id, weight) VALUES 
(3, 1, 80),
(3, 2, 90),
(4, 1, 70),
(4, 2, 85),
(4, 3, 75),
(5, 2, 95),
(5, 3, 80);

-- 插入物料模具关系
INSERT INTO material_mold_relations (material_id, mold_id, weight, cycle_time, output_per_cycle) VALUES 
(3, 1, 90, 30, 4),
(3, 4, 70, 35, 3),
(4, 2, 85, 25, 5),
(4, 4, 75, 28, 4),
(5, 3, 95, 40, 3);

-- 插入同模多物料关系
INSERT INTO multi_material_mold_relations (mold_id, material_ids, sync_production) VALUES 
(4, '[3, 4]', TRUE);
