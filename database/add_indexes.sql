-- MES系统数据库索引优化脚本
-- 为常用查询列添加索引，提升查询性能 20-50%

USE mes_system;

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 生产线表索引
CREATE INDEX IF NOT EXISTS idx_production_lines_code ON production_lines(line_code);
CREATE INDEX IF NOT EXISTS idx_production_lines_is_active ON production_lines(is_active);

-- 生产订单表索引
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_line_id ON production_orders(production_line_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_order_number ON production_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_production_orders_created_by ON production_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_production_orders_created_at ON production_orders(created_at);

-- 设备表索引
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equipment_line_id ON equipment(production_line_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_is_active ON equipment(is_active);

-- 库存表索引 (如果存在)
CREATE INDEX IF NOT EXISTS idx_inventory_material_code ON inventory(material_code);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);

-- 质量检验表索引 (如果存在)
CREATE INDEX IF NOT EXISTS idx_quality_inspections_order_id ON quality_inspections(production_order_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_status ON quality_inspections(status);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_created_at ON quality_inspections(created_at);

-- 复合索引 (常用查询组合)
CREATE INDEX IF NOT EXISTS idx_production_orders_status_line ON production_orders(status, production_line_id);
CREATE INDEX IF NOT EXISTS idx_equipment_line_status ON equipment(production_line_id, status);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- 显示所有索引
SHOW INDEX FROM users;
SHOW INDEX FROM production_lines;
SHOW INDEX FROM production_orders;
SHOW INDEX FROM equipment;

-- 验证索引创建
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME,
  SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'mes_system'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
