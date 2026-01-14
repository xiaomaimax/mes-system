-- 辅助排程模块演示数据
-- 包括：物料、设备、模具、计划单、任务单等

USE mes_system;

-- ==================== 排程模块数据 ====================

-- 如果表不存在，创建表
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_name VARCHAR(200) NOT NULL,
    material_type VARCHAR(50),
    specifications TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(200) NOT NULL,
    specifications TEXT,
    capacity_per_hour INT,
    status ENUM('normal', 'maintenance', 'fault') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS molds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mold_code VARCHAR(50) NOT NULL UNIQUE,
    mold_name VARCHAR(200) NOT NULL,
    specifications TEXT,
    quantity INT DEFAULT 1,
    status ENUM('normal', 'maintenance', 'fault') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_device_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    device_id INT NOT NULL,
    weight INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    UNIQUE KEY unique_relation (material_id, device_id)
);

CREATE TABLE IF NOT EXISTS material_mold_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    mold_id INT NOT NULL,
    weight INT DEFAULT 50,
    cycle_time INT DEFAULT 0,
    output_per_cycle INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (mold_id) REFERENCES molds(id),
    UNIQUE KEY unique_relation (material_id, mold_id)
);

CREATE TABLE IF NOT EXISTS production_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_number VARCHAR(50) NOT NULL UNIQUE,
    material_id INT NOT NULL,
    planned_quantity INT NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('unscheduled', 'scheduled', 'in_progress', 'completed') DEFAULT 'unscheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE TABLE IF NOT EXISTS production_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_number VARCHAR(50) NOT NULL UNIQUE,
    plan_id INT NOT NULL,
    device_id INT,
    mold_id INT,
    planned_start_time DATETIME,
    planned_end_time DATETIME,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    erp_task_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES production_plans(id),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (mold_id) REFERENCES molds(id)
);

-- ==================== 插入物料数据 ====================

INSERT INTO materials (material_code, material_name, material_type, specifications, status) VALUES 
('MAT-PHONE-SHELL-A', '手机壳A', '塑料件', '尺寸: 150x80x10mm, 重量: 25g', 'active'),
('MAT-PHONE-SHELL-B', '手机壳B', '塑料件', '尺寸: 160x85x12mm, 重量: 30g', 'active'),
('MAT-AUTO-PART', '汽车配件', '塑料件', '尺寸: 200x100x50mm, 重量: 150g', 'active'),
('MAT-HOME-PART', '家电配件', '塑料件', '尺寸: 180x120x40mm, 重量: 120g', 'active'),
('MAT-CONNECTOR', '连接器', '塑料件', '尺寸: 50x30x20mm, 重量: 5g', 'active'),
('MAT-BRACKET', '支架', '塑料件', '尺寸: 100x80x30mm, 重量: 40g', 'active');

-- ==================== 插入设备数据 ====================

INSERT INTO devices (device_code, device_name, specifications, capacity_per_hour, status) VALUES 
('DEV-INJ-001', '注塑机1号', '280T海天注塑机', 500, 'normal'),
('DEV-INJ-002', '注塑机2号', '280T海天注塑机', 500, 'normal'),
('DEV-INJ-003', '注塑机3号', '180T震雄注塑机', 300, 'normal'),
('DEV-INJ-004', '注塑机4号', '180T震雄注塑机', 300, 'maintenance'),
('DEV-INJ-005', '注塑机5号', '650T伊之密注塑机', 150, 'normal'),
('DEV-COOL-001', '冷却塔1号', '50kW冷却塔', 0, 'normal'),
('DEV-COOL-002', '冷却塔2号', '50kW冷却塔', 0, 'normal'),
('DEV-DRY-001', '干燥机1号', '100kg干燥机', 0, 'normal'),
('DEV-DRY-002', '干燥机2号', '80kg干燥机', 0, 'normal');

-- ==================== 插入模具数据 ====================

INSERT INTO molds (mold_code, mold_name, specifications, quantity, status) VALUES 
('MOLD-PHONE-A', '手机壳A模具', '2腔模具，周期时间: 45秒', 2, 'normal'),
('MOLD-PHONE-B', '手机壳B模具', '2腔模具，周期时间: 50秒', 1, 'normal'),
('MOLD-AUTO', '汽车配件模具', '1腔模具，周期时间: 120秒', 1, 'normal'),
('MOLD-HOME', '家电配件模具', '1腔模具，周期时间: 100秒', 2, 'normal'),
('MOLD-CONNECTOR', '连接器模具', '8腔模具，周期时间: 30秒', 2, 'normal'),
('MOLD-BRACKET', '支架模具', '4腔模具，周期时间: 60秒', 1, 'normal');

-- ==================== 插入物料-设备关系 ====================

INSERT INTO material_device_relations (material_id, device_id, weight) VALUES 
(1, 1, 80),  -- 手机壳A 优先用设备1
(1, 2, 70),  -- 手机壳A 次优先用设备2
(2, 1, 70),  -- 手机壳B 优先用设备1
(2, 2, 80),  -- 手机壳B 次优先用设备2
(3, 3, 90),  -- 汽车配件 优先用设备3
(3, 5, 60),  -- 汽车配件 次优先用设备5
(4, 3, 80),  -- 家电配件 优先用设备3
(4, 4, 70),  -- 家电配件 次优先用设备4
(5, 2, 85),  -- 连接器 优先用设备2
(6, 1, 75);  -- 支架 优先用设备1

-- ==================== 插入物料-模具关系 ====================

INSERT INTO material_mold_relations (material_id, mold_id, weight, cycle_time, output_per_cycle) VALUES 
(1, 1, 90, 45, 2),    -- 手机壳A 用模具1，周期45秒，每周期2个
(2, 2, 85, 50, 2),    -- 手机壳B 用模具2，周期50秒，每周期2个
(3, 3, 95, 120, 1),   -- 汽车配件 用模具3，周期120秒，每周期1个
(4, 4, 90, 100, 1),   -- 家电配件 用模具4，周期100秒，每周期1个
(5, 5, 88, 30, 8),    -- 连接器 用模具5，周期30秒，每周期8个
(6, 6, 85, 60, 4);    -- 支架 用模具6，周期60秒，每周期4个

-- ==================== 插入生产计划 ====================

INSERT INTO production_plans (plan_number, material_id, planned_quantity, due_date, status) VALUES 
-- 进行中的计划
('PLAN-2024-12-001', 1, 5000, '2024-12-26', 'scheduled'),
('PLAN-2024-12-002', 2, 3000, '2024-12-26', 'scheduled'),
('PLAN-2024-12-003', 3, 2000, '2024-12-26', 'scheduled'),
('PLAN-2024-12-004', 4, 4000, '2024-12-27', 'unscheduled'),

-- 已完成的计划
('PLAN-2024-12-005', 1, 5000, '2024-12-25', 'completed'),
('PLAN-2024-12-006', 2, 3000, '2024-12-25', 'completed'),
('PLAN-2024-12-007', 3, 2000, '2024-12-24', 'completed'),
('PLAN-2024-12-008', 4, 4000, '2024-12-24', 'completed'),

-- 未来的计划
('PLAN-2024-12-009', 5, 10000, '2024-12-28', 'unscheduled'),
('PLAN-2024-12-010', 6, 8000, '2024-12-28', 'unscheduled');

-- ==================== 插入生产任务 ====================

INSERT INTO production_tasks (task_number, plan_id, device_id, mold_id, planned_start_time, planned_end_time, actual_start_time, actual_end_time, status, erp_task_number) VALUES 

-- 进行中的任务
('TASK-2024-12-001', 1, 1, 1, '2024-12-26 08:00:00', '2024-12-26 12:00:00', '2024-12-26 08:15:00', NULL, 'in_progress', 'ERP-001'),
('TASK-2024-12-002', 1, 2, 1, '2024-12-26 12:30:00', '2024-12-26 16:30:00', NULL, NULL, 'pending', 'ERP-002'),
('TASK-2024-12-003', 2, 1, 2, '2024-12-26 10:00:00', '2024-12-26 13:00:00', '2024-12-26 10:30:00', NULL, 'in_progress', 'ERP-003'),
('TASK-2024-12-004', 3, 3, 3, '2024-12-26 09:00:00', '2024-12-26 16:00:00', '2024-12-26 09:20:00', NULL, 'in_progress', 'ERP-004'),

-- 已完成的任务
('TASK-2024-12-005', 5, 1, 1, '2024-12-25 08:00:00', '2024-12-25 12:00:00', '2024-12-25 08:10:00', '2024-12-25 11:50:00', 'completed', 'ERP-005'),
('TASK-2024-12-006', 5, 2, 1, '2024-12-25 12:30:00', '2024-12-25 16:30:00', '2024-12-25 12:40:00', '2024-12-25 16:20:00', 'completed', 'ERP-006'),
('TASK-2024-12-007', 6, 1, 2, '2024-12-25 17:00:00', '2024-12-26 01:00:00', '2024-12-25 17:15:00', '2024-12-26 00:45:00', 'completed', 'ERP-007'),
('TASK-2024-12-008', 7, 3, 3, '2024-12-24 08:00:00', '2024-12-24 16:00:00', '2024-12-24 08:20:00', '2024-12-24 15:40:00', 'completed', 'ERP-008'),
('TASK-2024-12-009', 8, 3, 4, '2024-12-24 17:00:00', '2024-12-25 01:00:00', '2024-12-24 17:10:00', '2024-12-25 00:50:00', 'completed', 'ERP-009');

-- ==================== 验证数据 ====================

SELECT '=== 排程模块数据统计 ===' as info;
SELECT CONCAT('物料: ', COUNT(*)) as count FROM materials;
SELECT CONCAT('设备: ', COUNT(*)) as count FROM devices;
SELECT CONCAT('模具: ', COUNT(*)) as count FROM molds;
SELECT CONCAT('物料-设备关系: ', COUNT(*)) as count FROM material_device_relations;
SELECT CONCAT('物料-模具关系: ', COUNT(*)) as count FROM material_mold_relations;
SELECT CONCAT('生产计划: ', COUNT(*)) as count FROM production_plans;
SELECT CONCAT('生产任务: ', COUNT(*)) as count FROM production_tasks;
