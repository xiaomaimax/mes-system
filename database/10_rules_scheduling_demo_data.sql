-- 10条排程规则完整演示数据
-- 包含14个计划单，覆盖所有10条排程规则
-- 执行前会清空排程相关表

USE mes_system;

-- ==================== 第1步：清空排程相关表 ====================

SET FOREIGN_KEY_CHECKS = 0;

-- 删除表中的数据而不是TRUNCATE，避免外键约束问题
DELETE FROM production_tasks;
DELETE FROM production_plans;
DELETE FROM material_mold_relations;
DELETE FROM material_device_relations;
DELETE FROM molds;
DELETE FROM devices;
DELETE FROM materials;

SET FOREIGN_KEY_CHECKS = 1;

-- ==================== 第2步：创建排程物料数据 ====================
-- 11种物料，用于演示10条规则

INSERT INTO materials (material_code, material_name, material_type, specifications, status, created_at, updated_at) VALUES 
('MAT-001', '手机壳A', '塑料件', '尺寸: 150x80x10mm, 重量: 25g', 'active', NOW(), NOW()),
('MAT-002', '手机壳B', '塑料件', '尺寸: 160x85x12mm, 重量: 30g', 'active', NOW(), NOW()),
('MAT-003', '充电器', '塑料件', '尺寸: 100x60x30mm, 重量: 50g', 'active', NOW(), NOW()),
('MAT-004', '电池盖板', '塑料件', '尺寸: 80x50x5mm, 重量: 10g', 'active', NOW(), NOW()),
('MAT-005', '屏幕保护框', '塑料件', '尺寸: 160x80x3mm, 重量: 15g', 'active', NOW(), NOW()),
('MAT-006', '手机壳C', '塑料件', '尺寸: 155x82x11mm, 重量: 27g', 'active', NOW(), NOW()),
('MAT-007', '手机壳D', '塑料件', '尺寸: 158x84x11mm, 重量: 28g', 'active', NOW(), NOW()),
('MAT-008', '高端手机壳', '塑料件', '尺寸: 160x85x12mm, 重量: 32g, 高精度', 'active', NOW(), NOW()),
('MAT-009', '标准手机壳', '塑料件', '尺寸: 152x80x10mm, 重量: 26g', 'active', NOW(), NOW()),
('MAT-010', '手机壳E', '塑料件', '尺寸: 154x81x10mm, 重量: 26g', 'active', NOW(), NOW()),
('MAT-011', '手机壳F', '塑料件', '尺寸: 156x83x11mm, 重量: 27g', 'active', NOW(), NOW());

-- ==================== 第3步：创建排程设备数据 ====================
-- 6台设备，具有不同的权重和能力

INSERT INTO devices (device_code, device_name, specifications, capacity_per_hour, status, created_at, updated_at) VALUES 
('DEV-001', '注塑机1号', '280T海天注塑机', 500, 'normal', NOW(), NOW()),
('DEV-002', '注塑机2号', '280T海天注塑机', 500, 'normal', NOW(), NOW()),
('DEV-003', '注塑机3号', '180T震雄注塑机', 300, 'normal', NOW(), NOW()),
('DEV-004', '注塑机4号', '180T震雄注塑机', 300, 'normal', NOW(), NOW()),
('DEV-005', '注塑机5号', '650T伊之密注塑机', 150, 'normal', NOW(), NOW()),
('DEV-006', '注塑机6号', '100T小型注塑机', 200, 'normal', NOW(), NOW());

-- ==================== 第4步：创建排程模具数据 ====================
-- 8套模具，包括单副和多副模具

INSERT INTO molds (mold_code, mold_name, specifications, quantity, status, created_at, updated_at) VALUES 
('MOLD-001', '手机壳A模具', '2腔模具，周期时间: 45秒', 2, 'normal', NOW(), NOW()),
('MOLD-002', '充电器模具', '1腔单副模具，周期时间: 60秒', 1, 'normal', NOW(), NOW()),
('MOLD-003', '手机壳A备用模具', '2腔模具，周期时间: 45秒', 1, 'normal', NOW(), NOW()),
('MOLD-004', '电池盖板模具', '4腔模具，周期时间: 30秒', 2, 'normal', NOW(), NOW()),
('MOLD-005', '手机壳C/D通用模具', '2腔通用模具，周期时间: 50秒', 2, 'normal', NOW(), NOW()),
('MOLD-006', '高精度模具', '1腔高精度模具，周期时间: 55秒', 1, 'normal', NOW(), NOW()),
('MOLD-007', '标准手机壳模具', '2腔模具，周期时间: 48秒', 1, 'normal', NOW(), NOW()),
('MOLD-008', '手机壳B单副绑定模具', '1腔单副模具，周期时间: 50秒', 1, 'normal', NOW(), NOW());

-- ==================== 第5步：创建物料-设备关系 ====================
-- 定义物料可以在哪些设备上生产，以及权重

INSERT INTO material_device_relations (material_id, device_id, weight, created_at) VALUES 
-- MAT-001 (手机壳A) - 可用设备: DEV-001(权重70), DEV-002(权重95), DEV-003(权重60)
(1, 1, 70, NOW()),
(1, 2, 95, NOW()),
(1, 3, 60, NOW()),

-- MAT-002 (手机壳B) - 可用设备: DEV-001(权重80), DEV-002(权重75)
(2, 1, 80, NOW()),
(2, 2, 75, NOW()),

-- MAT-003 (充电器) - 可用设备: DEV-004(权重85)
(3, 4, 85, NOW()),

-- MAT-004 (电池盖板) - 可用设备: DEV-003(权重90), DEV-006(权重70)
(4, 3, 90, NOW()),
(4, 6, 70, NOW()),

-- MAT-005 (屏幕保护框) - 可用设备: DEV-002(权重80)
(5, 2, 80, NOW()),

-- MAT-006 (手机壳C) - 可用设备: DEV-002(权重85), DEV-005(权重65)
(6, 2, 85, NOW()),
(6, 5, 65, NOW()),

-- MAT-007 (手机壳D) - 可用设备: DEV-005(权重80), DEV-002(权重75)
(7, 5, 80, NOW()),
(7, 2, 75, NOW()),

-- MAT-008 (高端手机壳) - 可用设备: DEV-002(权重95)
(8, 2, 95, NOW()),

-- MAT-009 (标准手机壳) - 可用设备: DEV-006(权重50), DEV-001(权重70)
(9, 6, 50, NOW()),
(9, 1, 70, NOW()),

-- MAT-010 (手机壳E) - 可用设备: DEV-002(权重90), DEV-001(权重80)
(10, 2, 90, NOW()),
(10, 1, 80, NOW()),

-- MAT-011 (手机壳F) - 可用设备: DEV-001(权重85)
(11, 1, 85, NOW());

-- ==================== 第6步：创建物料-模具关系 ====================
-- 定义物料可以用哪些模具，以及权重

INSERT INTO material_mold_relations (material_id, mold_id, weight, cycle_time, output_per_cycle, created_at) VALUES 
-- MAT-001 (手机壳A) - 可用模具: MOLD-001(权重90), MOLD-003(权重70)
(1, 1, 90, 45, 2, NOW()),
(1, 3, 70, 45, 2, NOW()),

-- MAT-002 (手机壳B) - 可用模具: MOLD-008(权重95, 单副绑定)
(2, 8, 95, 50, 2, NOW()),

-- MAT-003 (充电器) - 可用模具: MOLD-002(权重100, 单副)
(3, 2, 100, 60, 1, NOW()),

-- MAT-004 (电池盖板) - 可用模具: MOLD-004(权重85)
(4, 4, 85, 30, 4, NOW()),

-- MAT-005 (屏幕保护框) - 可用模具: MOLD-001(权重75)
(5, 1, 75, 45, 2, NOW()),

-- MAT-006 (手机壳C) - 可用模具: MOLD-005(权重85)
(6, 5, 85, 50, 2, NOW()),

-- MAT-007 (手机壳D) - 可用模具: MOLD-005(权重85, 同一模具)
(7, 5, 85, 50, 2, NOW()),

-- MAT-008 (高端手机壳) - 可用模具: MOLD-006(权重100, 高精度)
(8, 6, 100, 55, 1, NOW()),

-- MAT-009 (标准手机壳) - 可用模具: MOLD-007(权重50), MOLD-001(权重75)
(9, 7, 50, 48, 2, NOW()),
(9, 1, 75, 45, 2, NOW()),

-- MAT-010 (手机壳E) - 可用模具: MOLD-001(权重80)
(10, 1, 80, 45, 2, NOW()),

-- MAT-011 (手机壳F) - 可用模具: MOLD-001(权重75)
(11, 1, 75, 45, 2, NOW());

-- ==================== 第7步：创建生产计划 ====================
-- 14个计划单，覆盖10条排程规则

INSERT INTO production_plans (plan_number, material_id, planned_quantity, due_date, status, created_at, updated_at) VALUES 

-- 1️⃣ 交期优先 - PL-URGENT-001
('PL-URGENT-001', 1, 5000, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'unscheduled', NOW(), NOW()),

-- 2️⃣ 设备权重优先 - PL-DEV-WEIGHT-001
('PL-DEV-WEIGHT-001', 1, 3000, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'unscheduled', NOW(), NOW()),

-- 3️⃣ 模具权重优先 - PL-MOLD-WEIGHT-001
('PL-MOLD-WEIGHT-001', 8, 2000, DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'unscheduled', NOW(), NOW()),

-- 4️⃣ 模具-设备独占性 - PL-EXCLUSIVE-001
('PL-EXCLUSIVE-001', 3, 4000, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'unscheduled', NOW(), NOW()),

-- 5️⃣ 模具-设备绑定 - PL-BIND-001, PL-BIND-002
('PL-BIND-001', 2, 2500, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'unscheduled', NOW(), NOW()),
('PL-BIND-002', 2, 1500, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'unscheduled', NOW(), NOW()),

-- 6️⃣ 同物料一致性 - PL-MAT-CONSIST-001, PL-MAT-CONSIST-002
('PL-MAT-CONSIST-001', 10, 3500, DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'unscheduled', NOW(), NOW()),
('PL-MAT-CONSIST-002', 10, 2000, DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'unscheduled', NOW(), NOW()),

-- 7️⃣ 同模具一致性 - PL-MOLD-CONSIST-001, PL-MOLD-CONSIST-002
('PL-MOLD-CONSIST-001', 1, 4000, DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'unscheduled', NOW(), NOW()),
('PL-MOLD-CONSIST-002', 2, 3000, DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'unscheduled', NOW(), NOW()),

-- 8️⃣ 计划单唯一性 - PL-UNIQUE-001
('PL-UNIQUE-001', 4, 2500, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'unscheduled', NOW(), NOW()),

-- 9️⃣ 同模多物料同步 - PL-MULTI-MAT-001, PL-MULTI-MAT-002
('PL-MULTI-MAT-001', 6, 3000, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'unscheduled', NOW(), NOW()),
('PL-MULTI-MAT-002', 7, 2500, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'unscheduled', NOW(), NOW()),

-- 🔟 多模具灵活排程 - PL-FLEXIBLE-001
('PL-FLEXIBLE-001', 9, 1500, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'unscheduled', NOW(), NOW());

-- ==================== 验证数据 ====================

SELECT '=== 10条排程规则演示数据统计 ===' as info;
SELECT CONCAT('物料: ', COUNT(*)) as count FROM materials;
SELECT CONCAT('设备: ', COUNT(*)) as count FROM devices;
SELECT CONCAT('模具: ', COUNT(*)) as count FROM molds;
SELECT CONCAT('物料-设备关系: ', COUNT(*)) as count FROM material_device_relations;
SELECT CONCAT('物料-模具关系: ', COUNT(*)) as count FROM material_mold_relations;
SELECT CONCAT('生产计划: ', COUNT(*)) as count FROM production_plans;

-- 显示所有计划单
SELECT '=== 生产计划列表 ===' as info;
SELECT 
  pp.plan_number,
  m.material_name,
  pp.planned_quantity,
  pp.due_date,
  pp.status
FROM production_plans pp
JOIN materials m ON pp.material_id = m.id
ORDER BY pp.due_date ASC;
