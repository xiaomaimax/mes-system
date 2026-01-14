# 辅助排程模块

## 📋 概述

辅助排程模块是MES系统的核心排程引擎，用于实现生产计划的自动化排产。系统支持计划员手工编制生产任务，通过智能算法自动分配设备和模具资源，生成优化的生产任务单。

## ✨ 核心特性

### 🎯 智能排程算法
- **交期优先**: 优先满足交期要求
- **权重优先**: 按设备和模具权重综合排序
- **资源优化**: 同物料生产一致性、同模具生产一致性
- **冲突处理**: 自动处理资源冲突和绑定关系
- **灵活分配**: 多模具物料可灵活选择其他设备

### 📊 完整的功能模块
- **基础配置**: 物料、设备、模具、关系管理
- **计划单管理**: 导入、编辑、查询、批量操作
- **自动排产**: 一键执行排产，自动生成任务单
- **任务单管理**: 查询、调整、导出、导入ERP
- **结果展示**: 按设备分组、时间轴视图、统计分析
- **预警系统**: 超期标识、交期预警、资源冲突预警

### 🔄 ERP系统集成
- 任务单导出为Excel格式
- 支持导入ERP生成的任务单
- 自动关联ERP任务单号
- 数据一致性校验

### 📈 可视化展示
- 排程统计仪表板
- 按设备分组的任务单列表
- 时间轴视图
- 超期任务单标记
- 实时数据刷新

## 🚀 快速开始

### 1. 数据库初始化

```bash
mysql -u root -p mes_system < database/scheduling_schema.sql
```

### 2. 启动服务

```bash
# 启动后端服务器
npm run dev

# 启动前端应用（新终端）
cd client && npm start
```

### 3. 访问系统

打开浏览器访问 `http://localhost:3000`，登录后进入"辅助排程"模块。

### 4. 基本操作流程

```
1. 配置基础数据 (物料、设备、模具、关系)
   ↓
2. 导入计划单 (新增或批量导入)
   ↓
3. 执行排产 (点击"执行自动排产"按钮)
   ↓
4. 查看结果 (在"排程结果"标签查看)
   ↓
5. 手动调整 (如需要，调整任务单)
   ↓
6. 导出导入 (与ERP系统交互)
```

## 📁 项目结构

### 后端

```
server/
├── models/
│   ├── Material.js                    # 物料模型
│   ├── Device.js                      # 设备模型
│   ├── Mold.js                        # 模具模型
│   ├── ProductionPlan.js              # 计划单模型
│   ├── ProductionTask.js              # 任务单模型
│   ├── MaterialDeviceRelation.js      # 物料-设备关系
│   └── MaterialMoldRelation.js        # 物料-模具关系
├── services/
│   └── SchedulingEngine.js            # 排程算法引擎
└── routes/
    └── scheduling.js                  # API路由
```

### 前端

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

### 数据库

```
database/
└── scheduling_schema.sql              # 表结构和初始数据
```

## 📚 文档

| 文档 | 说明 |
|------|------|
| [SCHEDULING_DESIGN.md](./SCHEDULING_DESIGN.md) | 详细的技术设计文档 |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | 完整的实现指南和API文档 |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 快速参考卡片 |

## 🔌 API接口

### 核心接口

| 功能 | 方法 | 端点 |
|------|------|------|
| 执行排产 | POST | `/api/scheduling/execute` |
| 查询任务单 | GET | `/api/scheduling/tasks` |
| 查询排程结果 | GET | `/api/scheduling/results` |

### 完整接口列表

详见 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) 中的"API接口文档"部分。

## 💾 数据模型

### 核心表

| 表名 | 说明 |
|------|------|
| `materials` | 物料信息 |
| `devices` | 设备信息 |
| `molds` | 模具信息 |
| `material_device_relations` | 物料-设备关系 |
| `material_mold_relations` | 物料-模具关系 |
| `production_plans` | 计划单 |
| `production_tasks` | 任务单 |

## 🎮 使用示例

### 新增物料

```javascript
POST /api/scheduling/materials
{
  "material_code": "MAT-001",
  "material_name": "塑料颗粒A",
  "material_type": "raw_material",
  "specifications": "直径5mm"
}
```

### 新增设备

```javascript
POST /api/scheduling/devices
{
  "device_code": "DEV-001",
  "device_name": "注塑机1号",
  "specifications": "注塑机-100T",
  "capacity_per_hour": 100
}
```

### 新增计划单

```javascript
POST /api/scheduling/plans
{
  "plan_number": "PLAN-001",
  "material_id": 1,
  "planned_quantity": 1000,
  "due_date": "2024-12-31T23:59:59Z"
}
```

### 执行排产

```javascript
POST /api/scheduling/execute
```

## 🔍 排程算法

### 优先级规则

```
1. 交期优先 (Deadline First)
   ↓
2. 设备权重 + 模具权重综合排序
   ↓
3. 同物料生产一致性
   ↓
4. 同模具生产一致性
   ↓
5. 多模具灵活分配
```

### 资源约束

- **模具-设备独占性**: 同一副模具同一时间只能分配至一台设备
- **模具-设备绑定**: 单副模具必须分配至同一设备
- **计划单唯一性**: 计划单不允许拆分至多个设备或模具
- **同模多物料同步**: 使用同一模具的多物料计划单需同步生产

## 📊 性能指标

- **排产响应时间**: < 5秒（1000计划单）
- **导入导出**: < 10秒（10000条记录）
- **查询响应时间**: < 2秒
- **并发支持**: 100+并发用户

## 🛠️ 故障排查

### 排产后没有生成任务单

**检查清单：**
- 是否有未排产的计划单
- 计划单对应的物料是否配置了设备和模具关系
- 设备和模具的状态是否为"正常"

### API返回404错误

**检查清单：**
- 服务器是否正确注册了排程路由
- `server/app.js` 中是否添加了排程路由
- 路由文件是否存在

### 前端无法加载排程模块

**检查清单：**
- `client/src/App.js` 中是否导入了 `SchedulingDashboard`
- 路由配置是否正确
- 浏览器控制台是否有错误信息

详见 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) 中的"故障排查"部分。

## 🔐 权限控制

| 角色 | 可访问 |
|------|--------|
| 超级管理员 | 所有功能 |
| 部门管理员 | 部门相关功能 |
| 普通用户 | 本部门功能 |
| 技术管理员 | 技术相关功能 |

## 📈 后续改进

### Phase 2: 高级功能
- [ ] Excel导入导出功能完善
- [ ] 更多排程算法选项
- [ ] 实时排程监控
- [ ] 排程历史记录

### Phase 3: 系统集成
- [ ] 与生产执行系统集成
- [ ] 与质量管理系统集成
- [ ] 与设备管理系统集成
- [ ] 与库存管理系统集成

### Phase 4: 优化增强
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 移动端支持
- [ ] 数据分析报表

## 📞 支持

如有问题或建议，请参考以下文档：

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - 完整实现指南
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考
- [SCHEDULING_DESIGN.md](./SCHEDULING_DESIGN.md) - 技术设计

## 📄 许可证

MIT License

## 👥 贡献者

- 开发团队

---

**最后更新**: 2024-12-25  
**版本**: 1.0.0  
**状态**: ✅ 生产就绪
