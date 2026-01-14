-- MES系统数据整合模块数据库表结构
-- 用于统一设备、模具、物料的主数据管理
-- Requirements: 1.1, 2.1, 3.1

USE mes_system;

-- ============================================
-- 设备排程扩展表 (equipment_scheduling_ext)
-- 存储排程模块特有的设备属性
-- Requirements: 1.5
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_scheduling_ext (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL UNIQUE,
    capacity_per_hour INT DEFAULT 0 COMMENT '每小时产能',
    scheduling_weight INT DEFAULT 50 COMMENT '排程权重 (1-100)',
    is_available_for_scheduling BOOLEAN DEFAULT TRUE COMMENT '是否可用于排程',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_is_available (is_available_for_scheduling),
    CONSTRAINT chk_scheduling_weight CHECK (scheduling_weight >= 1 AND scheduling_weight <= 100)
) COMMENT='设备排程扩展表';

-- ============================================
-- 模具-设备关联表 (mold_equipment_relations)
-- 记录模具与设备的多对多关系
-- Requirements: 2.4
-- ============================================
CREATE TABLE IF NOT EXISTS mold_equipment_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mold_id INT NOT NULL COMMENT '关联模具ID',
    equipment_id INT NOT NULL COMMENT '关联设备ID',
    is_primary BOOLEAN DEFAULT FALSE COMMENT '是否为主要设备',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mold_equipment (mold_id, equipment_id),
    FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_mold_id (mold_id),
    INDEX idx_equipment_id (equipment_id)
) COMMENT='模具-设备关联表';

-- ============================================
-- 模具排程扩展表 (mold_scheduling_ext)
-- 存储排程模块特有的模具属性
-- Requirements: 2.3
-- ============================================
CREATE TABLE IF NOT EXISTS mold_scheduling_ext (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mold_id INT NOT NULL UNIQUE COMMENT '关联模具ID',
    scheduling_weight INT DEFAULT 50 COMMENT '排程权重 (1-100)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
    INDEX idx_mold_id (mold_id),
    CONSTRAINT chk_mold_scheduling_weight CHECK (scheduling_weight >= 1 AND scheduling_weight <= 100)
) COMMENT='模具排程扩展表';

-- ============================================
-- 物料排程扩展表 (material_scheduling_ext)
-- 存储排程模块特有的物料属性
-- Requirements: 3.5
-- ============================================
CREATE TABLE IF NOT EXISTS material_scheduling_ext (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL UNIQUE COMMENT '关联物料主表ID',
    default_device_id INT NULL COMMENT '默认设备ID',
    default_mold_id INT NULL COMMENT '默认模具ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (default_device_id) REFERENCES devices(id) ON DELETE SET NULL,
    FOREIGN KEY (default_mold_id) REFERENCES molds(id) ON DELETE SET NULL,
    INDEX idx_material_id (material_id),
    INDEX idx_default_device_id (default_device_id),
    INDEX idx_default_mold_id (default_mold_id)
) COMMENT='物料排程扩展表';

-- ============================================
-- 初始化数据 - 为现有设备创建排程扩展记录
-- ============================================
INSERT INTO equipment_scheduling_ext (equipment_id, capacity_per_hour, scheduling_weight, is_available_for_scheduling)
SELECT id, 100, 50, TRUE FROM equipment WHERE id NOT IN (SELECT equipment_id FROM equipment_scheduling_ext);

-- ============================================
-- 初始化数据 - 为现有模具创建排程扩展记录
-- ============================================
INSERT INTO mold_scheduling_ext (mold_id, scheduling_weight)
SELECT id, 50 FROM molds WHERE id NOT IN (SELECT mold_id FROM mold_scheduling_ext);

-- ============================================
-- 初始化数据 - 为现有物料创建排程扩展记录
-- ============================================
INSERT INTO material_scheduling_ext (material_id, default_device_id, default_mold_id)
SELECT id, NULL, NULL FROM materials WHERE id NOT IN (SELECT material_id FROM material_scheduling_ext);

-- ============================================
-- 初始化数据 - 创建模具-设备关联示例数据
-- ============================================
-- 模具1关联到注塑机1号和2号
INSERT INTO mold_equipment_relations (mold_id, equipment_id, is_primary) VALUES 
(1, 1, TRUE),
(1, 2, FALSE)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- 模具2关联到注塑机2号
INSERT INTO mold_equipment_relations (mold_id, equipment_id, is_primary) VALUES 
(2, 2, TRUE)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- 模具3关联到注塑机3号
INSERT INTO mold_equipment_relations (mold_id, equipment_id, is_primary) VALUES 
(3, 3, TRUE)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- 通用模具关联到多台设备
INSERT INTO mold_equipment_relations (mold_id, equipment_id, is_primary) VALUES 
(4, 1, FALSE),
(4, 2, TRUE),
(4, 3, FALSE)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);
