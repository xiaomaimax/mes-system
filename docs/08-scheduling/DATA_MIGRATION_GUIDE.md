# MES系统数据迁移指南

## 概述

本指南说明如何使用数据迁移脚本将现有排程模块的设备、物料、模具数据迁移到统一的主数据管理体系。

## 迁移前准备

### 1. 备份数据库

在执行任何迁移操作前，**必须**备份生产数据库：

```bash
# MySQL备份示例
mysqldump -u root -p mes_system > mes_system_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 在测试环境验证

建议先在测试环境执行迁移，验证结果无误后再在生产环境执行。

### 3. 停止应用服务

迁移期间应停止MES应用服务，避免数据冲突：

```bash
# 停止应用
npm stop
# 或
pm2 stop all
```

## 迁移脚本说明

### 脚本列表

| 脚本 | 功能 | 说明 |
|------|------|------|
| `migrate-equipment-data.js` | 设备数据迁移 | 将排程设备映射到设备主表，创建排程扩展 |
| `migrate-material-data.js` | 物料数据迁移 | 将排程物料映射到物料主表，保留关系配置 |
| `migrate-mold-data.js` | 模具数据迁移 | 迁移模具数据，创建模具-设备关联 |
| `run-all-migrations.js` | 完整迁移 | 按顺序执行所有迁移脚本 |
| `rollback-migration.js` | 回滚迁移 | 恢复到迁移前状态 |

## 执行迁移

### 方式1：执行完整迁移（推荐）

```bash
cd scripts
node run-all-migrations.js
```

此方式会按顺序执行所有迁移脚本，并提供统一的日志输出。

### 方式2：分别执行各个迁移脚本

```bash
# 1. 迁移设备数据
node scripts/migrate-equipment-data.js

# 2. 迁移物料数据
node scripts/migrate-material-data.js

# 3. 迁移模具数据
node scripts/migrate-mold-data.js
```

### 方式3：使用npm脚本

在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "migrate:all": "node scripts/run-all-migrations.js",
    "migrate:equipment": "node scripts/migrate-equipment-data.js",
    "migrate:material": "node scripts/migrate-material-data.js",
    "migrate:mold": "node scripts/migrate-mold-data.js",
    "migrate:rollback": "node scripts/rollback-migration.js"
  }
}
```

然后执行：

```bash
npm run migrate:all
```

## 迁移过程详解

### 1. 设备数据迁移

**目标**：将排程模块的设备数据映射到设备管理模块

**过程**：
1. 备份现有设备数据
2. 遍历所有排程设备
3. 检查是否已存在相同编码的设备主表记录
4. 如果不存在，创建新的设备主表记录
5. 为每个设备创建排程扩展记录
6. 验证迁移结果

**输出**：
- 迁移日志：`migration-logs/equipment-migration-YYYY-MM-DD.log`
- 数据备份：`migration-logs/equipment-backup-YYYY-MM-DD-HH-MM-SS.json`

### 2. 物料数据迁移

**目标**：将排程模块的物料数据映射到库存管理模块，保留关系配置

**过程**：
1. 备份现有物料数据及关系配置
2. 遍历所有排程物料
3. 检查是否已存在相同编码的物料记录
4. 如果不存在，创建新的物料记录
5. 为每个物料创建排程扩展记录
6. 迁移物料-设备关系配置
7. 迁移物料-模具关系配置
8. 验证迁移结果

**输出**：
- 迁移日志：`migration-logs/material-migration-YYYY-MM-DD.log`
- 数据备份：`migration-logs/material-backup-YYYY-MM-DD-HH-MM-SS.json`

### 3. 模具数据迁移

**目标**：将模具数据迁移到设备管理模块，创建模具-设备关联

**过程**：
1. 备份现有模具数据及关联关系
2. 遍历所有模具
3. 检查是否已存在相同编码的模具记录
4. 如果不存在，创建新的模具记录
5. 为每个模具创建排程扩展记录
6. 迁移模具-设备关联关系
7. 验证迁移结果

**输出**：
- 迁移日志：`migration-logs/mold-migration-YYYY-MM-DD.log`
- 数据备份：`migration-logs/mold-backup-YYYY-MM-DD-HH-MM-SS.json`

## 迁移日志解读

### 日志位置

所有迁移日志保存在 `migration-logs/` 目录下：

```
migration-logs/
├── equipment-migration-2024-01-15.log
├── equipment-backup-2024-01-15-10-30-45.json
├── material-migration-2024-01-15.log
├── material-backup-2024-01-15-10-35-20.json
├── mold-migration-2024-01-15.log
├── mold-backup-2024-01-15-10-40-15.json
└── migration-2024-01-15.log
```

### 日志格式

```
[2024-01-15T10:30:45.123Z] ✓ 数据库连接成功
[2024-01-15T10:30:46.456Z] 开始备份设备数据...
[2024-01-15T10:30:47.789Z] ✓ 备份完成，文件: migration-logs/equipment-backup-2024-01-15-10-30-47.json
[2024-01-15T10:30:48.012Z]   - 设备数: 4
[2024-01-15T10:30:48.345Z]   - 设备主表数: 2
[2024-01-15T10:30:48.678Z]   - 排程扩展数: 2
```

### 常见日志符号

| 符号 | 含义 |
|------|------|
| ✓ | 操作成功 |
| ✗ | 操作失败 |
| ⊘ | 操作跳过 |
| → | 子操作 |
| ⚠ | 警告信息 |

## 迁移验证

### 自动验证

迁移脚本会自动验证迁移结果，检查项包括：

1. **数据完整性**
   - 所有设备/物料/模具都有排程扩展记录
   - 所有关系配置都被正确迁移

2. **数据一致性**
   - 没有孤立的关系记录
   - 所有外键引用都有效

3. **数据准确性**
   - 迁移前后数据总数一致
   - 关键属性值保持不变

### 手动验证

迁移完成后，可以手动验证数据：

```sql
-- 检查设备排程扩展
SELECT COUNT(*) FROM equipment_scheduling_ext;

-- 检查物料排程扩展
SELECT COUNT(*) FROM material_scheduling_ext;

-- 检查模具排程扩展
SELECT COUNT(*) FROM mold_scheduling_ext;

-- 检查模具-设备关联
SELECT COUNT(*) FROM mold_equipment_relations;

-- 检查物料-设备关系
SELECT COUNT(*) FROM material_device_relations;

-- 检查物料-模具关系
SELECT COUNT(*) FROM material_mold_relations;
```

## 迁移失败处理

### 常见问题

#### 1. 数据冲突

**症状**：迁移日志中出现 "冲突详情" 部分

**原因**：排程数据中存在重复的编码

**解决方案**：
1. 检查冲突详情
2. 手动修改排程数据中的重复编码
3. 重新执行迁移

#### 2. 外键约束错误

**症状**：迁移失败，错误信息包含 "FOREIGN KEY constraint"

**原因**：关联的设备/模具/物料不存在

**解决方案**：
1. 检查迁移日志中的详细错误
2. 清理孤立的关系记录
3. 重新执行迁移

#### 3. 数据库连接失败

**症状**：迁移立即失败，错误信息 "数据库连接失败"

**原因**：数据库服务未启动或连接配置错误

**解决方案**：
1. 确保MySQL服务已启动
2. 检查 `.env` 文件中的数据库配置
3. 验证数据库用户权限

### 回滚迁移

如果迁移失败或需要恢复到迁移前状态，使用回滚脚本：

```bash
node scripts/rollback-migration.js
```

**回滚过程**：
1. 列出所有可用的备份文件
2. 使用最新的备份文件
3. 删除迁移后创建的新记录
4. 恢复到迁移前状态

**注意**：回滚只能恢复迁移脚本创建的新记录，不能恢复迁移过程中修改的现有记录。

## 迁移后操作

### 1. 验证应用功能

迁移完成后，启动应用并验证以下功能：

- [ ] 排程模块能正常加载设备数据
- [ ] 排程模块能正常加载物料数据
- [ ] 排程模块能正常加载模具数据
- [ ] 设备管理模块能正常显示设备
- [ ] 库存管理模块能正常显示物料
- [ ] 排程计划能正常创建和执行

### 2. 更新应用配置

如果应用中有硬编码的数据ID，需要更新为新的ID：

```javascript
// 示例：更新设备ID映射
const deviceIdMap = {
  // 旧ID: 新ID
  1: 5,
  2: 6,
  3: 7
};
```

### 3. 清理旧数据

确认迁移成功后，可以清理排程模块中的旧数据表（如果不再需要）：

```sql
-- 注意：执行前请确保已备份数据
-- DROP TABLE devices;
-- DROP TABLE materials;
-- DROP TABLE molds;
```

### 4. 更新文档

更新系统文档，说明新的数据结构和API接口。

## 性能考虑

### 迁移时间估计

| 数据量 | 预计时间 |
|--------|---------|
| < 1000条 | < 1分钟 |
| 1000-10000条 | 1-5分钟 |
| 10000-100000条 | 5-30分钟 |
| > 100000条 | > 30分钟 |

### 优化建议

1. **在非业务高峰期执行迁移**
2. **关闭不必要的后台任务**
3. **增加数据库连接池大小**
4. **使用SSD存储以加快I/O操作**

## 常见问题

### Q: 迁移会影响现有数据吗？

A: 不会。迁移脚本只创建新记录和关联，不修改现有数据。所有操作都有备份。

### Q: 迁移失败后如何恢复？

A: 使用 `rollback-migration.js` 脚本恢复到迁移前状态。

### Q: 可以部分迁移吗？

A: 可以。可以分别执行各个迁移脚本，但建议按顺序执行以保证数据一致性。

### Q: 迁移后旧数据表还需要保留吗？

A: 建议保留一段时间作为备份，确认新系统运行正常后再删除。

### Q: 如何验证迁移是否成功？

A: 检查迁移日志中的统计信息，运行SQL查询验证数据总数，测试应用功能。

## 支持和反馈

如遇到迁移问题，请：

1. 检查迁移日志获取详细错误信息
2. 查看本指南的常见问题部分
3. 联系系统管理员或开发团队

## 相关文档

- [数据整合设计文档](.kiro/specs/data-integration/design.md)
- [数据整合需求文档](.kiro/specs/data-integration/requirements.md)
- [系统架构文档](../03-architecture/SYSTEM_ARCHITECTURE.md)
