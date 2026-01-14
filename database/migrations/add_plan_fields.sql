-- 添加计划单新字段的迁移脚本
-- 如果表存在，添加新列

ALTER TABLE production_plans 
ADD COLUMN process_routing_id INT NULL,
ADD COLUMN process_route_number VARCHAR(50) NULL,
ADD COLUMN production_order_id INT NULL,
ADD COLUMN order_number VARCHAR(50) NULL,
ADD COLUMN customer VARCHAR(100) NULL;

-- 添加外键约束（如果需要）
-- ALTER TABLE production_plans 
-- ADD CONSTRAINT fk_process_routing FOREIGN KEY (process_routing_id) REFERENCES process_routing(id),
-- ADD CONSTRAINT fk_production_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id);

