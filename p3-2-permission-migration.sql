-- ============================================
-- MaxMES P3-2 权限增强 - 数据库迁移脚本
-- ============================================
-- 版本：v1.3.0-p3-2
-- 日期：2026-03-26
-- 说明：创建 RBAC 权限管理相关数据表
-- 数据库：mes_system
-- ============================================

-- ============================================
-- 1. 角色表
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色代码',
  role_display_name VARCHAR(100) NOT NULL COMMENT '角色显示名称',
  description TEXT COMMENT '角色描述',
  is_system BOOLEAN DEFAULT FALSE COMMENT '系统角色不可删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================
-- 2. 权限表
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  permission_code VARCHAR(100) UNIQUE NOT NULL COMMENT '权限代码',
  permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
  module VARCHAR(50) COMMENT '所属模块',
  action_type VARCHAR(20) COMMENT '操作类型',
  description TEXT COMMENT '权限描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_module (module),
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ============================================
-- 3. 角色权限关联表
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- ============================================
-- 4. 部门表
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dept_code VARCHAR(50) UNIQUE NOT NULL COMMENT '部门代码',
  dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
  parent_id INT COMMENT '父部门 ID',
  manager_id INT COMMENT '部门负责人 ID',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_dept_code (dept_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- ============================================
-- 5. 用户角色关联表（支持多角色）
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- ============================================
-- 6. 数据权限表
-- ============================================
CREATE TABLE IF NOT EXISTS data_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  resource_type VARCHAR(50) NOT NULL COMMENT '资源类型',
  scope_type ENUM('ALL', 'DEPARTMENT', 'SELF', 'CUSTOM') NOT NULL COMMENT '数据范围类型',
  scope_value TEXT COMMENT '数据范围值（JSON 格式）',
  can_view BOOLEAN DEFAULT TRUE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_export BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY uk_role_resource (role_id, resource_type),
  INDEX idx_role_id (role_id),
  INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限表';

-- ============================================
-- 7. 审计日志表
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT '操作类型',
  resource_type VARCHAR(50) COMMENT '资源类型',
  resource_id INT COMMENT '资源 ID',
  ip_address VARCHAR(50) COMMENT 'IP 地址',
  user_agent TEXT COMMENT '用户代理',
  request_data JSON COMMENT '请求数据',
  response_status INT COMMENT '响应状态',
  error_message TEXT COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- ============================================
-- 8. 菜单权限表
-- ============================================
CREATE TABLE IF NOT EXISTS menu_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  menu_code VARCHAR(100) UNIQUE NOT NULL COMMENT '菜单代码',
  menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
  parent_code VARCHAR(100) COMMENT '父菜单代码',
  icon VARCHAR(50) COMMENT '图标',
  sort_order INT DEFAULT 0 COMMENT '排序',
  path VARCHAR(200) COMMENT '前端路由',
  is_visible BOOLEAN DEFAULT TRUE COMMENT '是否可见',
  permission_code VARCHAR(100) COMMENT '关联权限代码',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_code (parent_code),
  INDEX idx_menu_code (menu_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单权限表';

-- ============================================
-- 9. 角色菜单关联表
-- ============================================
CREATE TABLE IF NOT EXISTS role_menus (
  role_id INT NOT NULL,
  menu_id INT NOT NULL,
  can_view BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, menu_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menu_permissions(id) ON DELETE CASCADE,
  INDEX idx_role_id (role_id),
  INDEX idx_menu_id (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- ============================================
-- 10. 修改 users 表 - 添加 department_id
-- ============================================
-- 检查并添加列
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'department_id'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN department_id INT AFTER department',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加外键
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND CONSTRAINT_NAME = 'fk_users_department'
);
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 11. 初始化数据 - 系统角色
-- ============================================
INSERT INTO roles (role_name, role_display_name, description, is_system) VALUES
('admin', '超级管理员', '拥有系统全部权限', TRUE),
('manager', '部门经理', '管理部门，查看本部门所有数据', TRUE),
('supervisor', '主管', '查看和编辑本部门数据', TRUE),
('operator', '操作员', '基础操作权限', TRUE),
('quality_inspector', '质检员', '质量管理相关权限', TRUE),
('warehouse_keeper', '仓管员', '库存管理相关权限', TRUE),
('maintenance', '维修工', '设备维护相关权限', TRUE),
('viewer', '只读用户', '仅查看权限，不可编辑', TRUE);

-- ============================================
-- 12. 初始化数据 - 权限
-- ============================================
INSERT INTO permissions (permission_code, permission_name, module, action_type, description) VALUES
-- 生产模块
('production.order.read', '查看生产工单', 'production', 'READ', '查看生产工单列表和详情'),
('production.order.create', '创建生产工单', 'production', 'CREATE', '创建新的生产工单'),
('production.order.update', '修改生产工单', 'production', 'UPDATE', '修改生产工单信息'),
('production.order.delete', '删除生产工单', 'production', 'DELETE', '删除生产工单'),
('production.order.export', '导出生产工单', 'production', 'EXPORT', '导出生产工单数据'),
('production.order.approve', '审批生产工单', 'production', 'APPROVE', '审批生产工单'),
('production.task.read', '查看生产任务', 'production', 'READ', '查看生产任务'),
('production.task.update', '更新生产任务', 'production', 'UPDATE', '更新生产任务状态'),
('production.task.complete', '完成生产任务', 'production', 'UPDATE', '标记生产任务为完成'),

-- 质量模块
('quality.inspection.read', '查看质量检验', 'quality', 'READ', '查看质量检验记录'),
('quality.inspection.create', '创建质量检验', 'quality', 'CREATE', '创建质量检验记录'),
('quality.inspection.update', '更新质量检验', 'quality', 'UPDATE', '更新质量检验记录'),
('quality.inspection.approve', '审批质量检验', 'quality', 'APPROVE', '审批质量检验结果'),
('quality.defect.read', '查看缺陷记录', 'quality', 'READ', '查看缺陷记录'),
('quality.defect.create', '创建缺陷记录', 'quality', 'CREATE', '创建缺陷记录'),
('quality.defect.analyze', '缺陷分析', 'quality', 'UPDATE', '进行缺陷分析'),

-- 设备模块
('equipment.read', '查看设备信息', 'equipment', 'READ', '查看设备档案'),
('equipment.create', '创建设备', 'equipment', 'CREATE', '创建设备档案'),
('equipment.update', '更新设备', 'equipment', 'UPDATE', '更新设备信息'),
('equipment.maintenance.create', '创建维护记录', 'equipment', 'CREATE', '创建设备维护记录'),
('equipment.maintenance.approve', '审批维护申请', 'equipment', 'APPROVE', '审批设备维护申请'),

-- 库存模块
('inventory.read', '查看库存', 'inventory', 'READ', '查看库存信息'),
('inventory.inout.create', '创建出入库', 'inventory', 'CREATE', '创建出入库记录'),
('inventory.inout.approve', '审批出入库', 'inventory', 'APPROVE', '审批出入库申请'),
('inventory.transfer', '库存调拨', 'inventory', 'UPDATE', '执行库存调拨'),
('inventory.export', '导出库存', 'inventory', 'EXPORT', '导出库存数据'),

-- 报表模块
('report.production', '查看生产报表', 'report', 'READ', '查看生产报表'),
('report.quality', '查看质量报表', 'report', 'READ', '查看质量报表'),
('report.equipment', '查看设备报表', 'report', 'READ', '查看设备报表'),
('report.export', '导出报表', 'report', 'EXPORT', '导出各类报表'),

-- 系统管理
('system.user.read', '查看用户', 'system', 'READ', '查看用户列表'),
('system.user.create', '创建用户', 'system', 'CREATE', '创建新用户'),
('system.user.update', '修改用户', 'system', 'UPDATE', '修改用户信息'),
('system.user.delete', '删除用户', 'system', 'DELETE', '删除用户'),
('system.role.read', '查看角色', 'system', 'READ', '查看角色列表'),
('system.role.create', '创建角色', 'system', 'CREATE', '创建新角色'),
('system.role.update', '修改角色', 'system', 'UPDATE', '修改角色权限'),
('system.role.delete', '删除角色', 'system', 'DELETE', '删除角色'),
('system.permission.read', '查看权限', 'system', 'READ', '查看权限列表'),
('system.permission.update', '修改权限', 'system', 'UPDATE', '修改权限配置'),
('system.audit.read', '查看审计日志', 'system', 'READ', '查看审计日志'),
('system.config.update', '修改系统配置', 'system', 'UPDATE', '修改系统配置');

-- ============================================
-- 13. 初始化数据 - 部门
-- ============================================
INSERT INTO departments (dept_code, dept_name, parent_id, is_active, sort_order) VALUES
('HQ', '总部', NULL, TRUE, 0),
('PROD', '生产部', 1, TRUE, 1),
('QUALITY', '质量部', 1, TRUE, 2),
('WAREHOUSE', '仓库', 1, TRUE, 3),
('MAINTENANCE', '设备部', 1, TRUE, 4),
('IT', 'IT 部', 1, TRUE, 5),
('PROD_LINE1', '一车间', 2, TRUE, 1),
('PROD_LINE2', '二车间', 2, TRUE, 2);

-- ============================================
-- 14. 初始化数据 - 菜单权限
-- ============================================
INSERT INTO menu_permissions (menu_code, menu_name, parent_code, icon, sort_order, path, permission_code) VALUES
-- 一级菜单
('dashboard', '仪表盘', NULL, 'dashboard', 0, '/dashboard', NULL),
('production', '生产管理', NULL, 'production', 1, '/production', NULL),
('quality', '质量管理', NULL, 'quality-check', 2, '/quality', NULL),
('equipment', '设备管理', NULL, 'setting', 3, '/equipment', NULL),
('inventory', '库存管理', NULL, 'inventory', 4, '/inventory', NULL),
('report', '报表分析', NULL, 'chart', 5, '/reports', NULL),
('system', '系统管理', NULL, 'setting', 6, '/system', NULL),

-- 生产管理子菜单
('production.order', '生产工单', 'production', 'file-text', 1, '/production/orders', 'production.order.read'),
('production.task', '生产任务', 'production', 'task', 2, '/production/tasks', 'production.task.read'),
('production.plan', '生产计划', 'production', 'calendar', 3, '/production/plans', 'production.order.read'),

-- 质量管理子菜单
('quality.inspection', '质量检验', 'quality', 'check-square', 1, '/quality/inspections', 'quality.inspection.read'),
('quality.defect', '缺陷记录', 'quality', 'alert-circle', 2, '/quality/defects', 'quality.defect.read'),

-- 设备管理子菜单
('equipment.archive', '设备档案', 'equipment', 'database', 1, '/equipment/archives', 'equipment.read'),
('equipment.maintenance', '维护记录', 'equipment', 'tool', 2, '/equipment/maintenance', 'equipment.read'),

-- 库存管理子菜单
('inventory.stock', '库存查询', 'inventory', 'package', 1, '/inventory/stock', 'inventory.read'),
('inventory.inout', '出入库', 'inventory', 'arrow-right-left', 2, '/inventory/inout', 'inventory.inout.create'),
('inventory.transfer', '调拨', 'inventory', 'truck', 3, '/inventory/transfer', 'inventory.transfer'),

-- 报表分析子菜单
('report.production', '生产报表', 'report', 'bar-chart', 1, '/reports/production', 'report.production'),
('report.quality', '质量报表', 'report', 'pie-chart', 2, '/reports/quality', 'report.quality'),
('report.equipment', '设备报表', 'report', 'line-chart', 3, '/reports/equipment', 'report.equipment'),

-- 系统管理子菜单
('system.user', '用户管理', 'system', 'users', 1, '/system/users', 'system.user.read'),
('system.role', '角色权限', 'system', 'shield', 2, '/system/roles', 'system.role.read'),
('system.dept', '部门管理', 'system', 'building', 3, '/system/departments', 'system.user.read'),
('system.audit', '审计日志', 'system', 'file-text', 4, '/system/audit', 'system.audit.read'),
('system.config', '系统配置', 'system', 'settings', 5, '/system/config', 'system.config.update');

-- ============================================
-- 15. 初始化数据 - 角色权限（admin 拥有全部权限）
-- ============================================
-- admin 角色拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.role_name = 'admin';

-- 为其他角色分配基础权限（示例）
-- operator: 基础操作权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'operator' 
AND p.action_type IN ('READ', 'CREATE', 'UPDATE')
AND p.module NOT IN ('system', 'report');

-- quality_inspector: 质量模块全部权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'quality_inspector' 
AND p.module = 'quality';

-- warehouse_keeper: 库存模块全部权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'warehouse_keeper' 
AND p.module = 'inventory';

-- maintenance: 设备维护权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'maintenance' 
AND p.module = 'equipment';

-- manager: 查看 + 审批权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'manager' 
AND p.action_type IN ('READ', 'APPROVE', 'EXPORT');

-- ============================================
-- 16. 初始化数据 - 角色菜单
-- ============================================
-- admin 可以看到所有菜单
INSERT INTO role_menus (role_id, menu_id, can_view)
SELECT r.id, m.id, TRUE FROM roles r, menu_permissions m WHERE r.role_name = 'admin';

-- 为其他角色分配基础菜单（示例）
-- operator 可以看到生产、质量、设备、库存的操作菜单
INSERT INTO role_menus (role_id, menu_id, can_view)
SELECT r.id, m.id, TRUE FROM roles r, menu_permissions m
WHERE r.role_name = 'operator'
AND m.menu_code IN (
  'dashboard', 'production.order', 'production.task',
  'quality.inspection', 'equipment.archive', 'equipment.maintenance',
  'inventory.stock', 'inventory.inout'
);

-- ============================================
-- 17. 迁移现有用户数据
-- ============================================
-- 将现有用户的 role 字段迁移到 user_roles 表
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.role_name = u.role;

-- 注意：部门数据迁移需要手动处理（字符集问题）
-- 可以后续在系统中手动配置部门

-- ============================================
-- 完成提示
-- ============================================
SELECT '✅ P3-2 权限增强数据库迁移完成！' AS status;
SELECT '角色数量：' || COUNT(*) FROM roles;
SELECT '权限数量：' || COUNT(*) FROM permissions;
SELECT '部门数量：' || COUNT(*) FROM departments;
SELECT '菜单数量：' || COUNT(*) FROM menu_permissions;
