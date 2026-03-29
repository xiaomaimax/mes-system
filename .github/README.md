# MaxMES CI/CD 自动化配置

本项目使用 CI/CD Automator 技能自动生成和管理持续集成/持续部署管道。

## 工作流说明

### 1. 主要 CI/CD 流水线
- **文件**: `.github/workflows/maxmes-cicd.yml`
- **触发**: 推送到 main 或 develop 分支时触发
- **功能**: 
  - 代码质量检查 (linting)
  - 单元测试运行
  - 应用构建
  - 安全扫描
  - 自动部署到预发布/生产环境

### 2. Docker 部署流水线
- **文件**: `.github/workflows/docker-deploy.yml`
- **触发**: 推送到 main 或 develop 分支时触发
- **功能**:
  - 构建 Docker 镜像
  - 推送到容器注册表
  - 自动部署到 Docker 环境

### 3. 数据库迁移流水线
- **文件**: `.github/workflows/db-migration.yml`
- **触发**: 当更改数据库相关文件时触发
- **功能**:
  - 在测试环境中运行数据库迁移
  - 部署到预发布/生产数据库

## 如何使用 CI/CD Automator 技能

### 检测项目栈
```bash
# 在项目根目录运行
python3 /home/node/.openclaw/workspace/ci-cd-scripts/stack_detector.py --repo . --format json > stack.json
```

### 生成新的工作流
```bash
# 生成 GitHub Actions 工作流
python3 /home/node/.openclaw/workspace/ci-cd-scripts/pipeline_generator.py \
  --input stack.json \
  --platform github \
  --output .github/workflows/new-workflow.yml
```

### 为新模块添加 CI/CD
当添加新模块到 MaxMES 时，可以使用以下命令生成相应的工作流：

```bash
# 检测特定模块的栈
python3 /home/node/.openclaw/workspace/ci-cd-scripts/stack_detector.py \
  --repo /path/to/module \
  --format json > module-stack.json

# 生成相应的工作流
python3 /home/node/.openclaw/workspace/ci-cd-scripts/pipeline_generator.py \
  --input module-stack.json \
  --platform github \
  --output .github/workflows/module-ci.yml
```

## 环境配置

### 环境变量
在 GitHub Secrets 中配置以下环境变量：

- `DB_HOST`: 数据库主机
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码
- `NODE_ENV`: 环境 (development/production)
- `JWT_SECRET`: JWT 密钥
- `REDIS_URL`: Redis 连接地址

### 部署环境
- **staging**: 预发布环境
- **production**: 生产环境

## 最佳实践

1. **分支策略**:
   - `main`: 生产分支，推送到此分支会触发生产部署
   - `develop`: 预发布分支，推送到此分支会触发预发布部署
   - 功能分支: 用于开发新功能

2. **代码质量**:
   - 所有 PR 必须通过 CI 检查
   - 代码覆盖率不得低于 80%
   - 无严重安全漏洞

3. **数据库迁移**:
   - 数据库更改必须通过迁移脚本
   - 所有迁移必须在测试环境中验证

## 故障排除

如果 CI/CD 管道出现问题：

1. 检查日志输出
2. 确认环境变量已正确配置
3. 验证依赖项兼容性
4. 联系开发团队

## 扩展性

CI/CD Automator 技能具有良好的扩展性，可以轻松为新模块或新平台生成工作流。如果需要支持其他 CI/CD 平台（如 GitLab CI、Jenkins 等），可以使用相同的检测逻辑生成相应配置。