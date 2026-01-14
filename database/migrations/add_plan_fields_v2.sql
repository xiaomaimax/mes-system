-- 添加计划单新字段的迁移脚本 v2
-- 添加关联字段

ALTER TABLE production_plans 
ADD COLUMN process_routing_id INT NULL,
ADD COLUMN production_order_id INT NULL;

