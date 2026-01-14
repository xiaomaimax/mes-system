-- 注塑工艺完整模拟数据脚本
-- 包括：工艺、设备、质量、物料、辅助排程、生产管理全流程
-- 执行前会清空所有历史数据

USE mes_system;

-- ==================== 第1步：清空历史数据 ====================

-- 禁用外键约束
SET FOREIGN_KEY_CHECKS = 0;

-- 清空所有表
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE quality_inspections;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE equipment;
TRUNCATE TABLE production_lines;
TRUNCATE TABLE inventory;
TRUNCATE TABLE users;

-- 重新启用外键约束
SET FOREIGN_KEY_CHECKS = 1;

-- ==================== 第2步：创建用户数据 ====================

INSERT INTO users (username, password, email, full_name, role, department, is_active) VALUES 
-- 管理员
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@mes.com', '系统管理员', 'admin', '信息部', TRUE),

-- 生产经理
('manager_prod', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager.prod@mes.com', '生产经理', 'manager', '生产部', TRUE),
('manager_quality', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager.quality@mes.com', '质量经理', 'manager', '质量部', TRUE),

-- 操作员
('operator_01', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator01@mes.com', '操作员张三', 'operator', '生产部', TRUE),
('operator_02', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator02@mes.com', '操作员李四', 'operator', '生产部', TRUE),
('operator_03', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator03@mes.com', '操作员王五', 'operator', '生产部', TRUE),

-- 质量检验员
('inspector_01', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'inspector01@mes.com', '检验员赵六', 'quality_inspector', '质量部', TRUE),
('inspector_02', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'inspector02@mes.com', '检验员孙七', 'quality_inspector', '质量部', TRUE);

-- ==================== 第3步：创建生产线数据 ====================

INSERT INTO production_lines (line_code, line_name, description, capacity_per_hour, is_active) VALUES 
('INJ-LINE-001', '注塑生产线1号', '高速注塑生产线，主要生产小型塑料件', 500, TRUE),
('INJ-LINE-002', '注塑生产线2号', '中速注塑生产线，生产中型塑料件', 300, TRUE),
('INJ-LINE-003', '注塑生产线3号', '低速注塑生产线，生产大型或复杂塑料件', 150, TRUE),
('PACK-LINE-001', '包装生产线1号', '自动包装生产线', 800, TRUE);

-- ==================== 第4步：创建设备数据 ====================

INSERT INTO equipment (equipment_code, equipment_name, equipment_type, production_line_id, status, location, manufacturer, model, purchase_date, warranty_end_date, last_maintenance_date, next_maintenance_date, specifications, is_active) VALUES 

-- 注塑机
('INJ-MACH-001', '注塑机1号', '注塑机', 1, 'running', '车间A-01', '海天集团', 'HTF-280', '2022-01-15', '2025-01-15', '2024-12-01', '2025-01-01', '{"clamping_force": "280T", "injection_volume": "280cc", "max_speed": "150mm/s"}', TRUE),
('INJ-MACH-002', '注塑机2号', '注塑机', 1, 'running', '车间A-02', '海天集团', 'HTF-280', '2022-03-20', '2025-03-20', '2024-11-15', '2024-12-15', '{"clamping_force": "280T", "injection_volume": "280cc", "max_speed": "150mm/s"}', TRUE),
('INJ-MACH-003', '注塑机3号', '注塑机', 2, 'idle', '车间B-01', '震雄集团', 'SE-180', '2021-06-10', '2024-06-10', '2024-10-20', '2024-11-20', '{"clamping_force": "180T", "injection_volume": "180cc", "max_speed": "120mm/s"}', TRUE),
('INJ-MACH-004', '注塑机4号', '注塑机', 2, 'maintenance', '车间B-02', '震雄集团', 'SE-180', '2021-08-05', '2024-08-05', '2024-09-01', '2024-12-01', '{"clamping_force": "180T", "injection_volume": "180cc", "max_speed": "120mm/s"}', TRUE),
('INJ-MACH-005', '注塑机5号', '注塑机', 3, 'running', '车间C-01', '伊之密', 'IMD-650', '2020-11-12', '2023-11-12', '2024-08-15', '2025-02-15', '{"clamping_force": "650T", "injection_volume": "650cc", "max_speed": "100mm/s"}', TRUE),

-- 辅助设备
('AUX-DRYER-001', '干燥机1号', '干燥设备', 1, 'running', '车间A-03', '宝玛', 'DRY-100', '2022-05-01', '2025-05-01', '2024-11-01', '2025-01-01', '{"capacity": "100kg", "temperature_range": "40-120°C"}', TRUE),
('AUX-DRYER-002', '干燥机2号', '干燥设备', 2, 'running', '车间B-03', '宝玛', 'DRY-80', '2022-07-15', '2025-07-15', '2024-10-15', '2024-12-15', '{"capacity": "80kg", "temperature_range": "40-120°C"}', TRUE),
('AUX-COOL-001', '冷却塔1号', '冷却设备', 1, 'running', '车间A-04', '冷王', 'COOL-50', '2021-09-20', '2024-09-20', '2024-09-20', '2025-03-20', '{"cooling_capacity": "50kW", "water_flow": "100L/min"}', TRUE),
('AUX-COOL-002', '冷却塔2号', '冷却设备', 2, 'running', '车间B-04', '冷王', 'COOL-50', '2021-10-10', '2024-10-10', '2024-10-10', '2025-04-10', '{"cooling_capacity": "50kW", "water_flow": "100L/min"}', TRUE),

-- 检测设备
('QC-MEAS-001', '三坐标测量机', '检测设备', 1, 'running', '车间A-QC', '蔡司', 'ACCURA', '2022-02-28', '2025-02-28', '2024-11-28', '2025-01-28', '{"accuracy": "±0.003mm", "measurement_range": "1000x1000x800"}', TRUE),
('QC-MEAS-002', '投影仪', '检测设备', 2, 'running', '车间B-QC', '尼康', 'V-12B', '2021-12-15', '2024-12-15', '2024-11-15', '2024-12-15', '{"magnification": "10-100x", "measurement_range": "1200x900"}', TRUE),
('QC-SCALE-001', '精密天平', '检测设备', 1, 'running', '车间A-QC', '梅特勒', 'XS205', '2022-04-10', '2025-04-10', '2024-10-10', '2025-04-10', '{"capacity": "200g", "accuracy": "±0.1mg"}', TRUE),

-- 包装设备
('PACK-MACH-001', '自动包装机1号', '包装机', 4, 'running', '车间D-01', '博世', 'BOSCH-PKG', '2022-08-20', '2025-08-20', '2024-10-20', '2024-12-20', '{"speed": "60packs/min", "film_width": "200mm"}', TRUE),
('PACK-MACH-002', '自动包装机2号', '包装机', 4, 'idle', '车间D-02', '博世', 'BOSCH-PKG', '2022-09-15', '2025-09-15', '2024-09-15', '2024-11-15', '{"speed": "60packs/min", "film_width": "200mm"}', TRUE),

-- 传送设备
('CONV-BELT-001', '传送带1号', '传送设备', 1, 'running', '车间A-05', '西门子', 'SIEMENS-CONV', '2021-07-01', '2024-07-01', '2024-10-01', '2025-04-01', '{"speed": "0-2m/s", "width": "1000mm"}', TRUE),
('CONV-BELT-002', '传送带2号', '传送设备', 2, 'running', '车间B-05', '西门子', 'SIEMENS-CONV', '2021-08-15', '2024-08-15', '2024-09-15', '2025-03-15', '{"speed": "0-2m/s", "width": "1000mm"}', TRUE);


-- ==================== 第5步：创建物料数据 ====================

INSERT INTO inventory (material_code, material_name, material_type, current_stock, min_stock, max_stock, unit, unit_price, location, supplier, is_active) VALUES 

-- 原料
('RAW-ABS-001', 'ABS塑料粒子', 'raw_material', 5000, 1000, 10000, 'kg', 25.50, '原料仓库-01', '中石化', TRUE),
('RAW-ABS-002', 'ABS塑料粒子(黑色)', 'raw_material', 3000, 500, 8000, 'kg', 26.00, '原料仓库-01', '中石化', TRUE),
('RAW-PP-001', 'PP塑料粒子', 'raw_material', 4000, 800, 9000, 'kg', 18.50, '原料仓库-02', '中石化', TRUE),
('RAW-PE-001', 'PE塑料粒子', 'raw_material', 3500, 700, 8000, 'kg', 15.00, '原料仓库-02', '中石化', TRUE),
('RAW-PVC-001', 'PVC塑料粒子', 'raw_material', 2000, 400, 5000, 'kg', 22.00, '原料仓库-03', '中石化', TRUE),
('RAW-ADDITIVE-001', '色母粒(黑)', 'raw_material', 500, 100, 1000, 'kg', 80.00, '原料仓库-04', '颜料公司', TRUE),
('RAW-ADDITIVE-002', '色母粒(红)', 'raw_material', 300, 50, 800, 'kg', 85.00, '原料仓库-04', '颜料公司', TRUE),
('RAW-ADDITIVE-003', '阻燃剂', 'raw_material', 200, 50, 500, 'kg', 120.00, '原料仓库-04', '阻燃剂供应商', TRUE),
('RAW-ADDITIVE-004', '增塑剂', 'raw_material', 150, 30, 400, 'kg', 95.00, '原料仓库-04', '增塑剂供应商', TRUE),

-- 模具
('MOLD-001', '手机壳模具A', 'raw_material', 2, 1, 5, '套', 50000.00, '模具库-01', '模具厂', TRUE),
('MOLD-002', '手机壳模具B', 'raw_material', 1, 1, 3, '套', 45000.00, '模具库-01', '模具厂', TRUE),
('MOLD-003', '汽车配件模具', 'raw_material', 1, 1, 2, '套', 80000.00, '模具库-02', '模具厂', TRUE),
('MOLD-004', '家电配件模具', 'raw_material', 2, 1, 4, '套', 35000.00, '模具库-02', '模具厂', TRUE),

-- 包装材料
('PKG-BOX-001', '纸箱(小)', 'raw_material', 10000, 2000, 20000, '个', 0.50, '包装材料库-01', '包装公司', TRUE),
('PKG-BOX-002', '纸箱(中)', 'raw_material', 8000, 1500, 15000, '个', 0.80, '包装材料库-01', '包装公司', TRUE),
('PKG-BOX-003', '纸箱(大)', 'raw_material', 5000, 1000, 10000, '个', 1.20, '包装材料库-01', '包装公司', TRUE),
('PKG-FILM-001', '包装膜(PE)', 'raw_material', 50000, 10000, 100000, 'm', 0.05, '包装材料库-02', '膜材公司', TRUE),
('PKG-LABEL-001', '标签纸', 'raw_material', 20000, 5000, 50000, '张', 0.02, '包装材料库-03', '标签公司', TRUE),
('PKG-TAPE-001', '胶带', 'raw_material', 500, 100, 1000, '卷', 2.00, '包装材料库-03', '胶带公司', TRUE),

-- 半成品
('SEMI-PROD-001', '注塑件(未检验)', 'semi_finished', 2000, 500, 5000, '个', 5.00, '半成品库-01', '内部', TRUE),
('SEMI-PROD-002', '注塑件(已检验)', 'semi_finished', 1500, 300, 4000, '个', 5.50, '半成品库-02', '内部', TRUE),

-- 成品
('FIN-PROD-001', '手机壳A(黑)', 'finished_product', 3000, 500, 8000, '个', 8.50, '成品库-01', '内部', TRUE),
('FIN-PROD-002', '手机壳B(红)', 'finished_product', 2000, 300, 6000, '个', 9.00, '成品库-01', '内部', TRUE),
('FIN-PROD-003', '汽车配件', 'finished_product', 1000, 200, 3000, '个', 15.00, '成品库-02', '内部', TRUE),
('FIN-PROD-004', '家电配件', 'finished_product', 1500, 300, 4000, '个', 12.00, '成品库-02', '内部', TRUE);


-- ==================== 第6步：创建生产订单数据 ====================

INSERT INTO production_orders (order_number, product_code, product_name, planned_quantity, produced_quantity, qualified_quantity, defective_quantity, status, priority, production_line_id, planned_start_time, planned_end_time, actual_start_time, actual_end_time, created_by, notes) VALUES 

-- 进行中的订单
('PO-2024-12-001', 'PROD-001', '手机壳A(黑色)', 5000, 4800, 4700, 100, 'in_progress', 'high', 1, '2024-12-26 08:00:00', '2024-12-26 16:00:00', '2024-12-26 08:15:00', NULL, 1, '紧急订单，客户要求12月26日完成'),
('PO-2024-12-002', 'PROD-002', '手机壳B(红色)', 3000, 2800, 2750, 50, 'in_progress', 'normal', 1, '2024-12-26 10:00:00', '2024-12-26 18:00:00', '2024-12-26 10:30:00', NULL, 1, '常规订单'),
('PO-2024-12-003', 'PROD-003', '汽车配件', 2000, 1500, 1480, 20, 'in_progress', 'high', 2, '2024-12-26 09:00:00', '2024-12-26 17:00:00', '2024-12-26 09:20:00', NULL, 1, '汽车厂订单，质量要求高'),
('PO-2024-12-004', 'PROD-004', '家电配件', 4000, 0, 0, 0, 'pending', 'normal', 2, '2024-12-27 08:00:00', '2024-12-27 16:00:00', NULL, NULL, 1, '明天开始生产'),

-- 已完成的订单
('PO-2024-12-005', 'PROD-001', '手机壳A(黑色)', 5000, 5000, 4950, 50, 'completed', 'normal', 1, '2024-12-25 08:00:00', '2024-12-25 16:00:00', '2024-12-25 08:10:00', '2024-12-25 15:50:00', 1, '已完成'),
('PO-2024-12-006', 'PROD-002', '手机壳B(红色)', 3000, 3000, 2950, 50, 'completed', 'normal', 1, '2024-12-25 17:00:00', '2024-12-26 01:00:00', '2024-12-25 17:15:00', '2024-12-26 00:45:00', 1, '已完成'),
('PO-2024-12-007', 'PROD-003', '汽车配件', 2000, 2000, 1980, 20, 'completed', 'high', 2, '2024-12-24 08:00:00', '2024-12-24 16:00:00', '2024-12-24 08:20:00', '2024-12-24 15:40:00', 1, '已完成'),
('PO-2024-12-008', 'PROD-004', '家电配件', 4000, 4000, 3950, 50, 'completed', 'normal', 2, '2024-12-24 17:00:00', '2024-12-25 01:00:00', '2024-12-24 17:10:00', '2024-12-25 00:50:00', 1, '已完成');

-- ==================== 第7步：创建质量检验数据 ====================

INSERT INTO quality_inspections (production_order_id, inspection_type, inspected_quantity, qualified_quantity, defective_quantity, inspector_id, inspection_date, defect_types, notes) VALUES 

-- 进行中订单的检验
(1, 'incoming', 5000, 4900, 100, 2, '2024-12-26 08:30:00', '{"surface_defect": 50, "size_error": 30, "color_error": 20}', '原料检验，发现表面缺陷'),
(1, 'in_process', 4800, 4750, 50, 2, '2024-12-26 12:00:00', '{"injection_defect": 30, "gate_mark": 20}', '过程检验，注塑缺陷'),
(2, 'incoming', 3000, 2950, 50, 2, '2024-12-26 10:45:00', '{"color_error": 50}', '原料检验，颜色偏差'),
(3, 'incoming', 2000, 1950, 50, 2, '2024-12-26 09:30:00', '{"size_error": 30, "surface_defect": 20}', '原料检验'),
(3, 'in_process', 1500, 1480, 20, 2, '2024-12-26 14:00:00', '{"injection_defect": 20}', '过程检验'),

-- 已完成订单的检验
(5, 'incoming', 5000, 4900, 100, 2, '2024-12-25 08:45:00', '{"surface_defect": 60, "size_error": 40}', '原料检验'),
(5, 'in_process', 5000, 4950, 50, 2, '2024-12-25 12:30:00', '{"injection_defect": 50}', '过程检验'),
(5, 'final', 5000, 4950, 50, 2, '2024-12-25 15:30:00', '{"surface_defect": 30, "injection_defect": 20}', '最终检验，合格率99%'),
(6, 'incoming', 3000, 2950, 50, 2, '2024-12-25 17:30:00', '{"color_error": 50}', '原料检验'),
(6, 'in_process', 3000, 2980, 20, 2, '2024-12-25 21:00:00', '{"injection_defect": 20}', '过程检验'),
(6, 'final', 3000, 2950, 50, 2, '2024-12-26 00:30:00', '{"surface_defect": 30, "color_error": 20}', '最终检验，合格率98.3%'),
(7, 'incoming', 2000, 1950, 50, 2, '2024-12-24 08:30:00', '{"size_error": 50}', '原料检验'),
(7, 'in_process', 2000, 1990, 10, 2, '2024-12-24 12:00:00', '{"injection_defect": 10}', '过程检验'),
(7, 'final', 2000, 1980, 20, 2, '2024-12-24 15:30:00', '{"surface_defect": 15, "injection_defect": 5}', '最终检验，合格率99%'),
(8, 'incoming', 4000, 3950, 50, 2, '2024-12-24 17:30:00', '{"surface_defect": 50}', '原料检验'),
(8, 'in_process', 4000, 3980, 20, 2, '2024-12-24 21:00:00', '{"injection_defect": 20}', '过程检验'),
(8, 'final', 4000, 3950, 50, 2, '2024-12-25 00:30:00', '{"surface_defect": 30, "injection_defect": 20}', '最终检验，合格率98.75%');

-- ==================== 第8步：创建库存变动记录 ====================

INSERT INTO inventory_transactions (material_id, transaction_type, quantity, reference_type, reference_id, operator_id, notes, transaction_date) VALUES 

-- 原料入库
(1, 'in', 5000, 'purchase', 1, 1, 'ABS塑料粒子采购入库', '2024-12-20 10:00:00'),
(2, 'in', 3000, 'purchase', 2, 1, 'ABS塑料粒子(黑色)采购入库', '2024-12-20 11:00:00'),
(3, 'in', 4000, 'purchase', 3, 1, 'PP塑料粒子采购入库', '2024-12-21 09:00:00'),
(4, 'in', 3500, 'purchase', 4, 1, 'PE塑料粒子采购入库', '2024-12-21 10:00:00'),

-- 原料出库(用于生产)
(1, 'out', 5000, 'production', 1, 2, '用于订单PO-2024-12-001生产', '2024-12-26 08:00:00'),
(2, 'out', 3000, 'production', 2, 2, '用于订单PO-2024-12-002生产', '2024-12-26 10:00:00'),
(3, 'out', 2000, 'production', 3, 2, '用于订单PO-2024-12-003生产', '2024-12-26 09:00:00'),

-- 成品入库
(21, 'in', 5000, 'production', 5, 2, '订单PO-2024-12-005生产完成入库', '2024-12-25 16:00:00'),
(22, 'in', 3000, 'production', 6, 2, '订单PO-2024-12-006生产完成入库', '2024-12-26 01:00:00'),
(23, 'in', 2000, 'production', 7, 2, '订单PO-2024-12-007生产完成入库', '2024-12-24 16:00:00'),
(24, 'in', 4000, 'production', 8, 2, '订单PO-2024-12-008生产完成入库', '2024-12-25 01:00:00'),

-- 成品出库(销售)
(21, 'out', 2000, 'sale', 1, 3, '销售订单出库', '2024-12-25 17:00:00'),
(22, 'out', 1500, 'sale', 2, 3, '销售订单出库', '2024-12-26 02:00:00'),
(23, 'out', 1000, 'sale', 3, 3, '销售订单出库', '2024-12-24 17:00:00'),
(24, 'out', 2000, 'sale', 4, 3, '销售订单出库', '2024-12-25 02:00:00');
