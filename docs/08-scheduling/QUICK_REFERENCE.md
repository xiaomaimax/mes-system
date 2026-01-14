# 辅助排程模块 - 快速参考

## 系统启动

```bash
# 终端1: 启动后端
npm run dev

# 终端2: 启动前端
cd client && npm start
```

## 数据库初始化

```bash
mysql -u root -p mes_system < database/scheduling_schema.sql
```

## 核心API端点

| 功能 | 方法 | 端点 |
|------|------|------|
| 查询物料 | GET | `/api/scheduling/materials` |
| 新增物料 | POST | `/api/scheduling/materials` |
| 编辑物料 | PUT | `/api/scheduling/materials/:id` |
| 删除物料 | DELETE | `/api/scheduling/materials/:id` |
| 查询设备 | GET | `/api/scheduling/devices` |
| 新增设备 | POST | `/api/scheduling/devices` |
| 编辑设备 | PUT | `/api/scheduling/devices/:id` |
| 删除设备 | DELETE | `/api/scheduling/devices/:id` |
| 查询模具 | GET | `/api/scheduling/molds` |
| 新增模具 | POST | `/api/scheduling/molds` |
| 编辑模具 | PUT | `/api/scheduling/molds/:id` |
| 删除模具 | DELETE | `/api/scheduling/molds/:id` |
| 查询计划单 | GET | `/api/scheduling/plans` |
| 新增计划单 | POST | `/api/scheduling/plans` |
| 批量导入计划单 | POST | `/api/scheduling/plans/import` |
| 编辑计划单 | PUT | `/api/scheduling/plans/:id` |
| 删除计划单 | DELETE | `/api/scheduling/plans/:id` |
| **执行排产** | **POST** | **`/api/scheduling/execute`** |
| 查询任务单 | GET | `/api/scheduling/tasks` |
| 查询任务单详情 | GET | `/api/scheduling/tasks/:id` |
| 调整任务单 | PUT | `/api/scheduling/tasks/:id` |
| 导入ERP任务单 | POST | `/api/scheduling/tasks/import-erp` |
| 查询排程结果 | GET | `/api/scheduling/results` |

## 前端页面导航

| 页面 | 路由 | 功能 |
|------|------|------|
| 排程仪表板 | `/scheduling` | 概览、快速操作 |
| 物料管理 | `/scheduling` (标签) | 物料CRUD |
| 设备管理 | `/scheduling` (标签) | 设备CRUD |
| 模具管理 | `/scheduling` (标签) | 模具CRUD |
| 计划单管理 | `/scheduling` (标签) | 计划单CRUD、导入 |
| 任务单管理 | `/scheduling` (标签) | 任务单查询、调整、导出 |
| 排程结果 | `/scheduling` (标签) | 结果展示、时间轴 |

## 数据库表

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `materials` | 物料信息 | material_code, material_name, status |
| `devices` | 设备信息 | device_code, device_name, status |
| `molds` | 模具信息 | mold_code, mold_name, quantity, status |
| `material_device_relations` | 物料-设备关系 | material_id, device_id, weight |
| `material_mold_relations` | 物料-模具关系 | material_id, mold_id, weight, cycle_time |
| `production_plans` | 计划单 | plan_number, material_id, due_date, status |
| `production_tasks` | 任务单 | task_number, plan_id, device_id, mold_id, status |

## 排程算法流程

```
1. 获取所有未排产计划单
2. 按交期排序
3. 初始化资源占用状态
4. 对每个计划单：
   - 查找可用设备和模具
   - 按权重排序
   - 检查资源冲突
   - 分配最优资源
   - 计算计划时间
   - 更新资源占用
5. 处理同模多物料同步
6. 生成任务单
7. 更新计划单状态
```

## 关键概念

### 交期优先
- 计划单按交期从早到晚排序
- 优先满足交期要求

### 权重优先
- 物料-设备关系有权重（1-100）
- 物料-模具关系有权重（1-100）
- 权重越高，优先级越高

### 资源独占性
- 同一副模具同一时间只能分配到一台设备
- 单副模具必须绑定到同一设备

### 同模多物料
- 使用同一模具的多种物料
- 需要在同一时间段同步生产

### 超期标识
- 无法满足交期的任务单标记为"超期"
- 在排程结果中用红色标记

## 常用操作

### 新增物料
```
1. 进入"物料管理"标签
2. 点击"新增物料"按钮
3. 填写物料编号、名称、规格等
4. 点击"确定"
```

### 配置物料-设备关系
```
1. 进入"物料管理"标签
2. 在物料列表中找到目标物料
3. 点击"编辑"按钮
4. 在关系配置中添加设备和权重
5. 点击"确定"
```

### 执行排产
```
1. 进入"概览"标签
2. 点击"执行自动排产"按钮
3. 在确认对话框中点击"确定"
4. 等待排产完成
5. 查看排程结果
```

### 调整任务单
```
1. 进入"任务单管理"标签
2. 找到需要调整的任务单
3. 点击"调整"按钮
4. 修改设备、模具、时间等
5. 点击"确定"
```

### 导出任务单
```
1. 进入"任务单管理"标签
2. 点击"导出Excel"按钮
3. 系统自动生成并下载Excel文件
```

### 导入ERP任务单
```
1. 在ERP系统中导出任务单Excel
2. 进入"任务单管理"标签
3. 点击"导入ERP"按钮
4. 上传ERP导出的Excel文件
5. 系统自动关联ERP任务单号
```

## 状态值

### 物料/设备/模具状态
- `active` / `normal` - 正常
- `inactive` / `maintenance` - 维修
- `idle` - 闲置
- `scrapped` - 报废

### 计划单状态
- `unscheduled` - 未排产
- `scheduled` - 已排产
- `cancelled` - 已取消

### 任务单状态
- `pending` - 待执行
- `in_progress` - 执行中
- `completed` - 已完成
- `cancelled` - 已取消

## 权限控制

| 角色 | 可访问模块 |
|------|----------|
| 超级管理员 | 所有模块 |
| 部门管理员 | 部门相关模块 |
| 普通用户 | 本部门相关模块 |
| 技术管理员 | 技术相关模块 |

## 故障排查

### 问题：排产后没有生成任务单
**检查清单：**
- [ ] 是否有未排产的计划单
- [ ] 计划单对应的物料是否配置了设备和模具关系
- [ ] 设备和模具的状态是否为"正常"
- [ ] 是否有足够的设备产能

### 问题：API返回404错误
**检查清单：**
- [ ] 服务器是否正确注册了排程路由
- [ ] `server/app.js` 中是否添加了 `app.use('/api/scheduling', schedulingRoutes);`
- [ ] 路由文件是否存在

### 问题：前端无法加载排程模块
**检查清单：**
- [ ] `client/src/App.js` 中是否导入了 `SchedulingDashboard`
- [ ] 路由配置是否正确
- [ ] 浏览器控制台是否有错误信息

## 性能优化

- 使用分页查询大数据集
- 定期清理历史数据
- 在常用查询字段上建立索引
- 前端缓存基础配置数据
- 大量排产时使用后台任务队列

## 文件位置

| 文件 | 位置 |
|------|------|
| 设计文档 | `docs/08-scheduling/SCHEDULING_DESIGN.md` |
| 实现指南 | `docs/08-scheduling/IMPLEMENTATION_GUIDE.md` |
| 快速参考 | `docs/08-scheduling/QUICK_REFERENCE.md` |
| 数据库脚本 | `database/scheduling_schema.sql` |
| 后端模型 | `server/models/` |
| 排程引擎 | `server/services/SchedulingEngine.js` |
| API路由 | `server/routes/scheduling.js` |
| 前端组件 | `client/src/components/scheduling/` |

## 联系方式

如有问题或建议，请联系开发团队。

---

**最后更新**: 2024-12-25  
**版本**: 1.0.0
