# 辅助排程模块 - 技术设计文档

## 1. 系统概述

### 1.1 模块定位
辅助排程模块是MES系统的核心排程引擎，用于实现生产计划的自动化排产，支持计划员手工编制生产任务。

### 1.2 核心功能
- 基础配置管理（设备、模具、物料）
- 计划单管理（导入、编辑、查询）
- 自动排产引擎
- 任务单管理
- ERP系统数据交互
- 排程结果展示与调整

### 1.3 技术栈
- 后端：Node.js + Express + Sequelize + MySQL
- 前端：React + Ant Design
- 算法：优先级队列 + 贪心算法 + 冲突解决

## 2. 核心业务逻辑

### 2.1 排程优先级规则
```
优先级顺序：
1. 交期优先（Deadline First）
2. 设备权重 + 模具权重综合排序
3. 同物料生产一致性
4. 同模具生产一致性
5. 多模具灵活分配
```

### 2.2 资源约束
- **模具-设备独占性**：同一副模具同一时间只能分配至一台设备
- **模具-设备绑定**：单副模具的计划单必须分配至同一设备
- **计划单唯一性**：计划单不允许拆分至多个设备/模具
- **同模多物料同步**：使用同一模具的多物料计划单需同步生产

### 2.3 排程算法流程
```
输入：未排产计划单集合
处理步骤：
1. 按交期排序计划单
2. 对每个计划单：
   a. 获取可用设备和模具列表
   b. 按权重排序资源
   c. 检查资源冲突
   d. 分配最优资源
   e. 更新资源占用状态
3. 处理同模多物料同步
4. 生成任务单
输出：任务单集合
```

## 3. 数据模型设计

### 3.1 核心表结构

#### 物料信息表 (materials)
```
- id: 主键
- material_code: 物料编号（唯一）
- material_name: 物料名称
- material_type: 物料类型
- specifications: 规格型号
- status: 状态（正常/停用）
- created_at, updated_at
```

#### 设备信息表 (devices)
```
- id: 主键
- device_code: 设备编号（唯一）
- device_name: 设备名称
- specifications: 规格型号
- status: 状态（正常/维修/闲置/报废）
- capacity_per_hour: 每小时产能
- created_at, updated_at
```

#### 模具信息表 (molds)
```
- id: 主键
- mold_code: 模具编号（唯一）
- mold_name: 模具名称
- specifications: 规格型号
- quantity: 模具数量
- status: 状态（正常/维修/闲置/报废）
- created_at, updated_at
```

#### 物料设备关系表 (material_device_relations)
```
- id: 主键
- material_id: 物料ID
- device_id: 设备ID
- weight: 权重值（1-100）
- created_at, updated_at
```

#### 物料模具关系表 (material_mold_relations)
```
- id: 主键
- material_id: 物料ID
- mold_id: 模具ID
- weight: 权重值（1-100）
- cycle_time: 节拍（秒）
- output_per_cycle: 出模数
- created_at, updated_at
```

#### 计划单表 (production_plans)
```
- id: 主键
- plan_number: 计划单号（唯一）
- material_id: 物料ID
- planned_quantity: 计划数量
- due_date: 交期
- status: 状态（未排产/已排产/已取消）
- created_at, updated_at
```

#### 任务单表 (production_tasks)
```
- id: 主键
- task_number: 任务单号（唯一）
- plan_id: 计划单ID
- device_id: 设备ID
- mold_id: 模具ID
- task_quantity: 任务数量
- is_overdue: 是否超期
- due_date: 交期
- planned_start_time: 计划开始时间
- planned_end_time: 计划结束时间
- erp_task_number: ERP任务单号
- status: 状态（待执行/执行中/已完成/已取消）
- created_at, updated_at
```

### 3.2 表关系图
```
materials (1) ──── (N) material_device_relations ──── (N) devices
materials (1) ──── (N) material_mold_relations ──── (N) molds
materials (1) ──── (N) production_plans ──── (N) production_tasks
devices (1) ──── (N) production_tasks
molds (1) ──── (N) production_tasks
```

## 4. API接口设计

### 4.1 基础配置接口

#### 物料管理
- `GET /api/scheduling/materials` - 查询物料列表
- `POST /api/scheduling/materials` - 新增物料
- `PUT /api/scheduling/materials/:id` - 编辑物料
- `DELETE /api/scheduling/materials/:id` - 删除物料

#### 设备管理
- `GET /api/scheduling/devices` - 查询设备列表
- `POST /api/scheduling/devices` - 新增设备
- `PUT /api/scheduling/devices/:id` - 编辑设备
- `DELETE /api/scheduling/devices/:id` - 删除设备

#### 模具管理
- `GET /api/scheduling/molds` - 查询模具列表
- `POST /api/scheduling/molds` - 新增模具
- `PUT /api/scheduling/molds/:id` - 编辑模具
- `DELETE /api/scheduling/molds/:id` - 删除模具

#### 关系配置
- `GET /api/scheduling/material-device-relations` - 查询物料-设备关系
- `POST /api/scheduling/material-device-relations` - 新增关系
- `PUT /api/scheduling/material-device-relations/:id` - 编辑关系
- `GET /api/scheduling/material-mold-relations` - 查询物料-模具关系
- `POST /api/scheduling/material-mold-relations` - 新增关系
- `PUT /api/scheduling/material-mold-relations/:id` - 编辑关系

### 4.2 计划单接口
- `GET /api/scheduling/plans` - 查询计划单列表
- `POST /api/scheduling/plans` - 新增计划单
- `POST /api/scheduling/plans/import` - 批量导入计划单
- `PUT /api/scheduling/plans/:id` - 编辑计划单
- `DELETE /api/scheduling/plans/:id` - 删除计划单

### 4.3 排程接口
- `POST /api/scheduling/execute` - 执行自动排产
- `GET /api/scheduling/tasks` - 查询任务单列表
- `GET /api/scheduling/tasks/:id` - 查询任务单详情
- `PUT /api/scheduling/tasks/:id` - 手动调整任务单
- `POST /api/scheduling/tasks/export` - 导出任务单为Excel
- `POST /api/scheduling/tasks/import-erp` - 导入ERP任务单

### 4.4 展示接口
- `GET /api/scheduling/results` - 查询排程结果（按设备分组）
- `GET /api/scheduling/results/timeline` - 查询时间轴数据
- `GET /api/scheduling/warnings` - 查询预警信息

## 5. 前端组件设计

### 5.1 组件结构
```
SchedulingModule/
├── SchedulingDashboard.js (主页面)
├── Configuration/
│   ├── MaterialManagement.js
│   ├── DeviceManagement.js
│   ├── MoldManagement.js
│   └── RelationshipConfig.js
├── Planning/
│   ├── PlanManagement.js
│   └── PlanImport.js
├── Scheduling/
│   ├── AutoScheduling.js
│   ├── TaskManagement.js
│   ├── ManualAdjustment.js
│   └── SchedulingResults.js
├── Integration/
│   ├── TaskExport.js
│   └── ERPImport.js
└── Warnings/
    └── WarningCenter.js
```

### 5.2 主要页面
1. **排程仪表板** - 概览、快速操作
2. **基础配置** - 物料、设备、模具、关系管理
3. **计划单管理** - 导入、编辑、查询
4. **自动排产** - 执行排产、查看结果
5. **任务单管理** - 查询、导出、导入ERP
6. **排程结果展示** - 按设备分组、时间轴、筛选
7. **预警中心** - 超期、临期预警

## 6. 实现阶段

### Phase 1: 基础设施
- 数据库表结构
- Sequelize模型
- 基础CRUD API

### Phase 2: 核心算法
- 排程算法实现
- 资源冲突处理
- 同模多物料同步

### Phase 3: 前端UI
- 基础配置页面
- 计划单管理页面
- 排程结果展示

### Phase 4: 集成功能
- Excel导入导出
- ERP数据交互
- 预警系统

### Phase 5: 优化与测试
- 性能优化
- 完整测试
- 文档完善

## 7. 关键技术点

### 7.1 排程算法优化
- 使用优先级队列提高效率
- 缓存资源可用性信息
- 增量式排程支持

### 7.2 数据一致性
- 事务处理确保原子性
- 乐观锁处理并发
- 审计日志记录所有变更

### 7.3 性能指标
- 排产响应时间 < 5秒（1000计划单）
- 导入导出 < 10秒（10000条记录）
- 查询响应时间 < 2秒

## 8. 安全考虑

- 权限控制：仅计划员可执行排产
- 操作审计：记录所有排程操作
- 数据验证：严格校验导入数据
- 备份恢复：定期备份排程数据
