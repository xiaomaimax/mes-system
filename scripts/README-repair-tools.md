# 数据一致性修复工具

本目录包含了一套完整的数据一致性检查和修复工具，用于确保MES系统中数据库和API之间的数据一致性。

## 工具概览

### 1. 数据一致性检查工具 (`verify-data-consistency.js`)
- 检查数据库和API之间的数据一致性
- 生成详细的检查报告
- 支持按模块检查（生产、设备、质量、库存）

### 2. 数据修复工具 (`repair-data-consistency.js`)
- 基于检查报告执行数据修复
- 支持多种修复策略（自动、手动、预览）
- 提供数据备份和回滚功能

### 3. 修复建议生成器 (`generate-repair-suggestions.js`)
- 分析一致性问题并生成修复建议
- 提供详细的修复步骤和风险评估
- 生成可执行的修复脚本

### 4. 修复日志记录器 (`repair-logger.js`)
- 记录所有修复操作的详细日志
- 生成修复报告和操作摘要
- 支持操作追踪和审计

## 使用流程

### 步骤1: 运行数据一致性检查

```bash
# 检查所有模块
node scripts/verify-data-consistency.js

# 检查特定模块
node scripts/verify-data-consistency.js --module=production

# 详细模式
node scripts/verify-data-consistency.js --detailed
```

### 步骤2: 生成修复建议

```bash
# 基于检查报告生成建议
node scripts/generate-repair-suggestions.js --report=logs/data-consistency-report.json
```

### 步骤3: 执行数据修复

```bash
# 预览模式（查看将要执行的操作）
node scripts/repair-data-consistency.js --strategy=preview

# 手动模式（逐个确认修复操作）
node scripts/repair-data-consistency.js --strategy=manual --backup

# 自动模式（自动执行可修复的问题）
node scripts/repair-data-consistency.js --strategy=auto --backup

# 使用指定的检查报告
node scripts/repair-data-consistency.js --report=logs/report.json --strategy=manual
```

## 修复策略说明

### 自动修复 (auto)
- 自动执行所有可以安全修复的问题
- 适用于字段值同步等低风险操作
- 建议在测试环境中先验证

### 手动修复 (manual)
- 逐个显示修复项目，用户确认后执行
- 提供详细的风险说明和修复步骤
- 推荐用于生产环境

### 预览模式 (preview)
- 只显示将要执行的修复操作，不实际执行
- 用于评估修复影响和制定修复计划
- 安全的评估模式

## 配置说明

### 数据库配置
工具使用以下环境变量进行数据库连接：
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=mes_system
```

### API配置
```bash
API_URL=http://localhost:5000
```

## 安全特性

### 数据备份
- 修复前自动创建数据备份
- 备份文件保存在 `backups/` 目录
- 支持基于备份的数据回滚

### 操作日志
- 记录所有修复操作的详细日志
- 包含操作时间、影响范围、执行结果
- 支持操作审计和问题追踪

### 风险评估
- 为每个修复操作提供风险等级
- 详细说明潜在影响和注意事项
- 建议在测试环境中先验证

## 输出文件

### 检查报告
- `logs/data-consistency-report-{timestamp}.json` - 完整的检查报告
- 包含所有模块的检查结果和不一致问题

### 修复建议
- `repair-suggestions/repair-suggestions-{timestamp}.json` - 完整的修复建议
- `repair-suggestions/repair-guide-{timestamp}.md` - 可读的修复指南
- `repair-suggestions/repair-{n}-{module}.sql` - 具体的修复脚本

### 修复日志
- `logs/repair-log-{timestamp}.json` - 修复操作日志
- `logs/repair-report-{timestamp}.md` - 修复报告
- `logs/repair-{sessionId}.log` - 实时操作日志

### 数据备份
- `backups/backup-{timestamp}.sql` - 数据备份文件

## 常见问题

### Q: 如何回滚修复操作？
A: 使用备份文件恢复数据：
```bash
mysql -u root -p mes_system < backups/backup-{timestamp}.sql
```

### Q: 修复失败怎么办？
A: 
1. 查看修复日志了解失败原因
2. 检查数据库连接和API服务状态
3. 根据错误信息调整修复策略
4. 必要时使用备份恢复数据

### Q: 如何验证修复效果？
A: 修复完成后重新运行一致性检查：
```bash
node scripts/verify-data-consistency.js
```

### Q: 可以在生产环境中使用吗？
A: 
1. 建议先在测试环境中验证
2. 使用手动模式逐个确认操作
3. 确保创建数据备份
4. 在业务低峰期执行

## 示例演示

运行示例演示了解工具使用：
```bash
# 完整工作流程演示
node scripts/repair-example.js

# 日志记录器演示
node scripts/repair-example.js --logger-demo

# 显示使用帮助
node scripts/repair-example.js --help
```

## 最佳实践

1. **定期检查**: 建议每周运行一次数据一致性检查
2. **测试先行**: 在生产环境使用前，先在测试环境验证
3. **备份优先**: 始终在修复前创建数据备份
4. **逐步修复**: 优先处理高优先级问题，逐个模块修复
5. **验证结果**: 修复后重新检查确认问题已解决
6. **保留日志**: 保留修复日志用于审计和问题追踪

## 技术支持

如果在使用过程中遇到问题：
1. 查看详细的错误日志
2. 检查数据库和API服务状态
3. 验证配置参数是否正确
4. 参考修复建议中的风险提示

## 更新日志

- v1.0.0: 初始版本，包含基本的检查和修复功能
- 支持生产、设备、质量、库存四个模块
- 提供自动、手动、预览三种修复策略
- 包含完整的日志记录和报告生成功能