# MES系统完整演示数据加载指南

## 概述

本指南说明如何使用 `load-complete-system-data.js` 脚本为MES系统加载完整的演示数据。该脚本会为所有14个核心表加载演示数据，包括：

1. **生产线** (Production Lines) - 4条记录
2. **工艺路由** (Process Routing) - 20条记录
3. **工艺参数** (Process Parameters) - 11条记录
4. **生产订单** (Production Orders) - 10条记录
5. **库存** (Inventory) - 11条记录
6. **库存交易** (Inventory Transactions) - 16条记录
7. **质量检验** (Quality Inspections) - 11条记录
8. **设备维护** (Equipment Maintenance) - 6条记录
9. **班次计划** (Shift Schedule) - 3条记录
10. **员工班次分配** (Employee Shift Assignment) - 3条记录
11. **生产日报** (Daily Production Report) - 9条记录
12. **缺陷记录** (Defect Records) - 7条记录
13. **生产任务详情** (Production Task Details) - 5条记录
14. **设备状态历史** (Equipment Status History) - 10条记录

**总计：116条演示数据记录**

## 前置条件

### 1. 数据库环境
- MySQL 5.7+ 或 MySQL 8.0+
- 数据库已创建：`mes_system`
- 所有基础表已创建（users, materials, devices, molds, production_plans, production_tasks等）

### 2. Node.js环境
- Node.js 12.0+
- npm 或 yarn 包管理器
- 已安装依赖：`mysql2/promise`

### 3. 环境配置
确保 `.env` 文件中配置了数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mes_system
```

## 使用方法

### 方法1：直接运行脚本

```bash
# 在项目根目录执行
node scripts/load-complete-system-data.js
```

### 方法2：使用npm脚本

在 `package.json` 中添加脚本命令：

```json
{
  "scripts": {
    "load-demo-data": "node scripts/load-complete-system-data.js"
  }
}
```

然后执行：

```bash
npm run load-demo-data
```

### 方法3：使用SQL文件直接加载

如果需要直接使用SQL文件：

```bash
mysql -h localhost -u root -p mes_system < database/load_complete_system_data.sql
```

## 脚本功能

### 1. 数据库连接
- 自动连接到配置的MySQL数据库
- 支持连接池管理
- 自动处理连接超时

### 2. 数据加载
- 使用 `INSERT IGNORE` 避免重复键错误
- 正确处理外键关系
- 使用正确的ENUM值（如 `in_stock` 和 `out_stock` 代替 `in` 和 `out`）

### 3. 进度显示
- 实时显示加载进度
- 显示成功、跳过和失败的统计
- 验证加载的数据

### 4. 数据验证
- 加载完成后验证每个表的记录数
- 显示关键数据示例
- 生成详细的数据摘要

## 输出示例

```
🔄 正在连接数据库...
✅ 数据库连接成功

📋 开始加载完整演示数据...

📋 准备执行 XX 条SQL语句

⏳ 进度: 100/100

📊 执行结果:
   ✅ 成功: 95
   ⏭️  跳过: 5
   ❌ 失败: 0

🔍 验证加载的数据...

   📦 production_lines              :    4 条记录
   📦 process_routing               :   20 条记录
   📦 process_parameters            :   11 条记录
   📦 production_orders             :   10 条记录
   📦 inventory                     :   11 条记录
   📦 inventory_transactions        :   16 条记录
   📦 quality_inspections           :   11 条记录
   📦 equipment_maintenance         :    6 条记录
   📦 shift_schedule                :    3 条记录
   📦 employee_shift_assignment     :    3 条记录
   📦 daily_production_report       :    9 条记录
   📦 defect_records                :    7 条记录
   📦 production_task_details       :    5 条记录
   📦 equipment_status_history      :   10 条记录

   📊 总计: 116 条记录

📋 数据加载摘要:
   ✅ 生产线: 4 条
   ✅ 工艺路由: 20 条
   ✅ 工艺参数: 11 条
   ✅ 生产订单: 10 条
   ✅ 库存记录: 11 条
   ✅ 库存交易: 16 条
   ✅ 质量检验: 11 条
   ✅ 设备维护: 6 条
   ✅ 班次计划: 3 条
   ✅ 员工班次分配: 3 条
   ✅ 生产日报: 9 条
   ✅ 缺陷记录: 7 条
   ✅ 生产任务详情: 5 条
   ✅ 设备状态历史: 10 条

🎉 系统已准备好进行完整的用户测试！
```

## 数据说明

### 生产线数据
- **LINE-INJECT-001**: 注塑生产线1 (容量: 500/小时)
- **LINE-INJECT-002**: 注塑生产线2 (容量: 400/小时)
- **LINE-PACK-001**: 包装生产线1 (容量: 600/小时)
- **LINE-ASSEM-001**: 组装生产线1 (容量: 300/小时)

### 生产订单数据
- 10个生产订单，涵盖不同优先级（urgent, high, normal）
- 订单状态包括：pending, in_progress
- 订单数量范围：1500-5000个

### 库存数据
- 11个物料库存记录
- 库存位置分布在不同仓库（A、B、C、D）
- 包含最小库存和最大库存设置

### 质量检验数据
- 11条质量检验记录
- 检验类型：incoming, in_process, final
- 质量率范围：96.67% - 100%

### 设备维护数据
- 6条维护记录
- 维护类型：preventive, corrective, inspection
- 维护状态：completed, pending

### 班次计划数据
- 3个班次：早班(08:00-16:00), 中班(16:00-00:00), 晚班(00:00-08:00)
- 每班容量：50人

## 常见问题

### Q1: 脚本执行失败，提示"表不存在"
**A**: 确保所有基础表已创建。运行以下命令创建表结构：
```bash
mysql -h localhost -u root -p mes_system < database/create_complete_tables.sql
```

### Q2: 脚本执行失败，提示"连接被拒绝"
**A**: 检查以下内容：
1. MySQL服务是否运行
2. `.env` 文件中的数据库配置是否正确
3. 数据库用户名和密码是否正确

### Q3: 脚本执行成功但数据未加载
**A**: 这可能是因为使用了 `INSERT IGNORE`，重复的数据被跳过。检查：
1. 数据库中是否已存在相同的数据
2. 运行脚本前是否清空了表

### Q4: 如何清空所有演示数据？
**A**: 运行以下SQL命令：
```sql
DELETE FROM equipment_status_history;
DELETE FROM production_task_details;
DELETE FROM defect_records;
DELETE FROM daily_production_report;
DELETE FROM employee_shift_assignment;
DELETE FROM shift_schedule;
DELETE FROM equipment_maintenance;
DELETE FROM quality_inspections;
DELETE FROM inventory_transactions;
DELETE FROM inventory;
DELETE FROM production_orders;
DELETE FROM process_parameters;
DELETE FROM process_routing;
DELETE FROM production_lines;
```

### Q5: 如何只加载特定表的数据？
**A**: 编辑 `database/load_complete_system_data.sql` 文件，注释掉不需要的INSERT语句，然后运行脚本。

## 数据关系

### 外键关系
```
production_orders
  ├─ production_line_id → production_lines(id)
  └─ created_by → users(id)

process_routing
  ├─ material_id → materials(id)
  ├─ equipment_id → devices(id)
  └─ mold_id → molds(id)

process_parameters
  └─ routing_id → process_routing(id)

inventory
  └─ material_id → materials(id)

inventory_transactions
  ├─ material_id → materials(id)
  └─ operator_id → users(id)

quality_inspections
  ├─ production_order_id → production_orders(id)
  └─ inspector_id → users(id)

equipment_maintenance
  ├─ device_id → devices(id)
  └─ technician_id → users(id)

employee_shift_assignment
  ├─ user_id → users(id)
  └─ shift_id → shift_schedule(id)

daily_production_report
  ├─ production_line_id → production_lines(id)
  ├─ shift_id → shift_schedule(id)
  └─ created_by → users(id)

production_task_details
  ├─ task_id → production_tasks(id)
  ├─ device_id → devices(id)
  └─ mold_id → molds(id)

equipment_status_history
  └─ device_id → devices(id)
```

## ENUM值说明

### 避免保留字
脚本使用以下ENUM值以避免MySQL保留字：
- `in_stock` 代替 `in`
- `out_stock` 代替 `out`

### 其他ENUM值
- **production_orders.status**: pending, in_progress, completed, cancelled
- **production_orders.priority**: low, normal, high, urgent
- **inventory_transactions.transaction_type**: in_stock, out_stock, adjust
- **inventory_transactions.reference_type**: purchase, production, sale, adjustment
- **quality_inspections.inspection_type**: incoming, in_process, final
- **equipment_maintenance.maintenance_type**: preventive, corrective, inspection
- **equipment_maintenance.status**: pending, in_progress, completed, cancelled
- **employee_shift_assignment.status**: assigned, completed, cancelled
- **production_task_details.status**: pending, in_progress, completed, cancelled
- **defect_records.severity**: minor, major, critical

## 性能考虑

### 加载时间
- 116条记录的加载通常在 1-5 秒内完成
- 具体时间取决于数据库性能和网络延迟

### 数据库影响
- 脚本使用 `INSERT IGNORE` 避免重复插入
- 不会修改或删除现有数据
- 支持多次运行（幂等性）

## 后续步骤

加载演示数据后，您可以：

1. **验证数据**: 在Web界面中查看各个模块的数据
2. **测试功能**: 测试生产、库存、质量等模块的功能
3. **生成报表**: 使用演示数据生成各类报表
4. **性能测试**: 使用演示数据进行性能测试

## 相关文件

- **脚本**: `scripts/load-complete-system-data.js`
- **SQL文件**: `database/load_complete_system_data.sql`
- **表结构**: `database/create_complete_tables.sql`
- **调度数据**: `database/scheduling_demo_data.sql`

## 支持

如有问题，请检查：
1. 脚本输出的错误信息
2. MySQL错误日志
3. 数据库连接配置
4. 表结构是否完整

## 版本历史

- **v1.0** (2025-12-26): 初始版本，支持14个表的完整数据加载
