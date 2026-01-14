# 辅助排程模块 - 实现指南

## 1. 快速开始

### 1.1 数据库初始化

执行以下SQL脚本初始化排程模块的数据库表：

```bash
# 在MySQL中执行
mysql -u root -p mes_system < database/scheduling_schema.sql
```

或者在MySQL客户端中直接执行 `database/scheduling_schema.sql` 文件。

### 1.2 后端启动

```bash
# 安装依赖（如果还未安装）
npm install

# 启动服务器
npm run dev
```

服务器将在 `http://localhost:5000` 启动。

### 1.3 前端启动

```bash
# 进入客户端目录
cd client

# 安装依赖（如果还未安装）
npm install

# 启动前端
npm start
```

前端将在 `http://localhost:3000` 启动。

## 2. 模块结构

### 2.1 后端文件结构

```
server/
├── models/
│   ├── Material.js                    # 物料模型
│   ├── Device.js                      # 设备模型
│   ├── Mold.js                        # 模具模型
│   ├── ProductionPlan.js              # 计划单模型
│   ├── ProductionTask.js              # 任务单模型
│   ├── MaterialDeviceRelation.js      # 物料-设备关系模型
│   └── MaterialMoldRelation.js        # 物料-模具关系模型
├── services/
│   └── SchedulingEngine.js            # 排程算法引擎
└── routes/
    └── scheduling.js                  # 排程API路由
```

### 2.2 前端文件结构

```
client/src/components/scheduling/
├── SchedulingDashboard.js             # 主仪表板
├── MaterialManagement.js               # 物料管理
├── DeviceManagement.js                # 设备管理
├── MoldManagement.js                  # 模具管理
├── PlanManagement.js                  # 计划单管理
├── TaskManagement.js                  # 任务单管理
└── SchedulingResults.js               # 排程结果展示
```

## 3. API接口文档

### 3.1 物料管理接口

#### 查询物料列表
```
GET /api/scheduling/materials?page=1&limit=10&status=active
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "material_code": "MAT-001",
      "material_name": "塑料颗粒A",
      "material_type": "raw_material",
      "specifications": "直径5mm",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### 新增物料
```
POST /api/scheduling/materials
Content-Type: application/json

{
  "material_code": "MAT-001",
  "material_name": "塑料颗粒A",
  "material_type": "raw_material",
  "specifications": "直径5mm"
}
```

#### 编辑物料
```
PUT /api/scheduling/materials/:id
Content-Type: application/json

{
  "material_name": "塑料颗粒A",
  "material_type": "raw_material",
  "specifications": "直径5mm",
  "status": "active"
}
```

#### 删除物料
```
DELETE /api/scheduling/materials/:id
```

### 3.2 设备管理接口

#### 查询设备列表
```
GET /api/scheduling/devices?page=1&limit=10&status=normal
```

#### 新增设备
```
POST /api/scheduling/devices
Content-Type: application/json

{
  "device_code": "DEV-001",
  "device_name": "注塑机1号",
  "specifications": "注塑机-100T",
  "capacity_per_hour": 100
}
```

#### 编辑设备
```
PUT /api/scheduling/devices/:id
Content-Type: application/json

{
  "device_name": "注塑机1号",
  "specifications": "注塑机-100T",
  "status": "normal",
  "capacity_per_hour": 100
}
```

#### 删除设备
```
DELETE /api/scheduling/devices/:id
```

### 3.3 模具管理接口

#### 查询模具列表
```
GET /api/scheduling/molds?page=1&limit=10&status=normal
```

#### 新增模具
```
POST /api/scheduling/molds
Content-Type: application/json

{
  "mold_code": "MOLD-001",
  "mold_name": "产品A专用模具",
  "specifications": "规格100x50",
  "quantity": 2
}
```

#### 编辑模具
```
PUT /api/scheduling/molds/:id
Content-Type: application/json

{
  "mold_name": "产品A专用模具",
  "specifications": "规格100x50",
  "quantity": 2,
  "status": "normal"
}
```

#### 删除模具
```
DELETE /api/scheduling/molds/:id
```

### 3.4 关系配置接口

#### 查询物料-设备关系
```
GET /api/scheduling/material-device-relations?material_id=1&device_id=1
```

#### 新增物料-设备关系
```
POST /api/scheduling/material-device-relations
Content-Type: application/json

{
  "material_id": 1,
  "device_id": 1,
  "weight": 80
}
```

#### 编辑物料-设备关系
```
PUT /api/scheduling/material-device-relations/:id
Content-Type: application/json

{
  "weight": 90
}
```

#### 查询物料-模具关系
```
GET /api/scheduling/material-mold-relations?material_id=1&mold_id=1
```

#### 新增物料-模具关系
```
POST /api/scheduling/material-mold-relations
Content-Type: application/json

{
  "material_id": 1,
  "mold_id": 1,
  "weight": 90,
  "cycle_time": 30,
  "output_per_cycle": 4
}
```

#### 编辑物料-模具关系
```
PUT /api/scheduling/material-mold-relations/:id
Content-Type: application/json

{
  "weight": 95,
  "cycle_time": 30,
  "output_per_cycle": 4
}
```

### 3.5 计划单管理接口

#### 查询计划单列表
```
GET /api/scheduling/plans?page=1&limit=10&status=unscheduled&material_id=1
```

#### 新增计划单
```
POST /api/scheduling/plans
Content-Type: application/json

{
  "plan_number": "PLAN-001",
  "material_id": 1,
  "planned_quantity": 1000,
  "due_date": "2024-12-31T23:59:59Z"
}
```

#### 批量导入计划单
```
POST /api/scheduling/plans/import
Content-Type: application/json

{
  "plans": [
    {
      "plan_number": "PLAN-001",
      "material_id": 1,
      "planned_quantity": 1000,
      "due_date": "2024-12-31T23:59:59Z"
    },
    {
      "plan_number": "PLAN-002",
      "material_id": 2,
      "planned_quantity": 500,
      "due_date": "2024-12-31T23:59:59Z"
    }
  ]
}
```

#### 编辑计划单
```
PUT /api/scheduling/plans/:id
Content-Type: application/json

{
  "planned_quantity": 1000,
  "due_date": "2024-12-31T23:59:59Z",
  "status": "unscheduled"
}
```

#### 删除计划单
```
DELETE /api/scheduling/plans/:id
```

### 3.6 排程执行接口

#### 执行自动排产
```
POST /api/scheduling/execute
Content-Type: application/json
```

**响应示例：**
```json
{
  "success": true,
  "message": "成功排产 5 个任务单",
  "tasks": [
    {
      "id": 1,
      "task_number": "TASK-1234567890-123",
      "plan_id": 1,
      "device_id": 1,
      "mold_id": 1,
      "task_quantity": 1000,
      "is_overdue": false,
      "due_date": "2024-12-31T23:59:59Z",
      "planned_start_time": "2024-12-25T10:00:00Z",
      "planned_end_time": "2024-12-25T12:00:00Z",
      "status": "pending"
    }
  ]
}
```

### 3.7 任务单管理接口

#### 查询任务单列表
```
GET /api/scheduling/tasks?page=1&limit=10&status=pending&device_id=1&mold_id=1
```

#### 查询任务单详情
```
GET /api/scheduling/tasks/:id
```

#### 手动调整任务单
```
PUT /api/scheduling/tasks/:id
Content-Type: application/json

{
  "device_id": 2,
  "mold_id": 2,
  "planned_start_time": "2024-12-25T10:00:00Z",
  "planned_end_time": "2024-12-25T12:00:00Z",
  "status": "in_progress"
}
```

#### 导入ERP任务单
```
POST /api/scheduling/tasks/import-erp
Content-Type: application/json

{
  "tasks": [
    {
      "plan_id": 1,
      "erp_task_number": "ERP-001"
    },
    {
      "plan_id": 2,
      "erp_task_number": "ERP-002"
    }
  ]
}
```

### 3.8 排程结果展示接口

#### 查询排程结果（按设备分组）
```
GET /api/scheduling/results
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "device": {
        "id": 1,
        "device_code": "DEV-001",
        "device_name": "注塑机1号"
      },
      "tasks": [
        {
          "id": 1,
          "task_number": "TASK-001",
          "task_quantity": 1000,
          "is_overdue": false,
          "status": "pending"
        }
      ]
    }
  ]
}
```

## 4. 使用流程

### 4.1 基础配置流程

1. **进入排程模块** → 点击"物料管理"标签
2. **配置物料** → 新增物料信息（编号、名称、规格等）
3. **配置设备** → 点击"设备管理"标签，新增设备信息
4. **配置模具** → 点击"模具管理"标签，新增模具信息
5. **配置关系** → 在各管理页面中配置物料与设备、模具的关系及权重

### 4.2 计划单导入流程

1. **进入排程模块** → 点击"计划单管理"标签
2. **新增计划单** → 点击"新增计划单"按钮，填写计划单信息
3. **批量导入** → 点击"批量导入"按钮，上传Excel文件（可选）
4. **查看计划单** → 确认计划单状态为"未排产"

### 4.3 自动排产流程

1. **进入排程模块** → 点击"概览"标签
2. **执行排产** → 点击"执行自动排产"按钮
3. **确认排产** → 在弹出的确认对话框中点击"确定"
4. **查看结果** → 排产完成后，自动跳转到"排程结果"标签查看结果

### 4.4 任务单管理流程

1. **进入排程模块** → 点击"任务单管理"标签
2. **查看任务单** → 查看排产生成的任务单列表
3. **手动调整** → 点击"调整"按钮，修改设备、模具、时间等信息
4. **导出任务单** → 点击"导出Excel"按钮，导出任务单为Excel文件
5. **导入ERP** → 将任务单导入ERP系统，获取ERP任务单号
6. **关联ERP** → 点击"导入ERP"按钮，上传ERP导出的任务单文件，自动关联ERP任务单号

### 4.5 排程结果查看流程

1. **进入排程模块** → 点击"排程结果"标签
2. **查看统计** → 查看排程统计信息（总任务单数、超期任务单等）
3. **按设备筛选** → 在下拉框中选择设备，查看该设备的任务单
4. **查看时间轴** → 向下滚动查看时间轴视图，了解任务单的时间分布

## 5. 常见问题

### Q1: 排产后没有生成任务单？
**A:** 检查以下几点：
- 是否有未排产的计划单
- 计划单对应的物料是否配置了设备和模具关系
- 设备和模具的状态是否为"正常"

### Q2: 如何修改已排产的任务单？
**A:** 在"任务单管理"标签中，点击任务单的"调整"按钮，修改设备、模具、时间等信息。

### Q3: 如何导出任务单为Excel？
**A:** 在"任务单管理"标签中，点击"导出Excel"按钮，系统会自动生成Excel文件并下载。

### Q4: 如何导入ERP任务单？
**A:** 
1. 在ERP系统中导出任务单Excel文件
2. 在"任务单管理"标签中，点击"导入ERP"按钮
3. 上传ERP导出的Excel文件
4. 系统会自动匹配计划单号，关联ERP任务单号

### Q5: 如何处理超期任务单？
**A:** 
- 在"排程结果"标签中，可以看到超期任务单（红色标记）
- 点击"调整"按钮，修改设备或模具，重新安排生产时间
- 或者在"概览"标签中查看预警信息

## 6. 性能优化建议

1. **定期清理历史数据** - 定期删除已完成的任务单，保持数据库性能
2. **建立索引** - 在 `due_date`、`status` 等常用查询字段上建立索引
3. **缓存配置数据** - 在前端缓存物料、设备、模具等基础配置数据
4. **分页查询** - 使用分页查询大数据集，避免一次性加载所有数据
5. **异步排产** - 对于大量计划单的排产，考虑使用后台任务队列

## 7. 故障排查

### 问题：API返回404错误
**解决方案：**
- 检查服务器是否正确注册了排程路由
- 确认 `server/app.js` 中已添加 `app.use('/api/scheduling', schedulingRoutes);`

### 问题：数据库连接失败
**解决方案：**
- 检查MySQL服务是否启动
- 确认数据库连接配置正确
- 检查 `server/config/database.js` 中的连接参数

### 问题：前端无法加载排程模块
**解决方案：**
- 检查 `client/src/App.js` 中是否正确导入了 `SchedulingDashboard` 组件
- 确认路由配置正确
- 检查浏览器控制台是否有错误信息

## 8. 下一步

- 实现Excel导入导出功能
- 添加更多排程算法选项（如遗传算法、模拟退火等）
- 实现实时排程监控和预警
- 集成MES系统的其他模块（如生产执行、质量管理等）
- 添加排程历史记录和版本管理
