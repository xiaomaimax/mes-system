# GitHub 同步指南

**同步日期**: 2026-01-14  
**项目**: MES制造执行系统  
**GitHub账户**: https://github.com/xiaomaimax

---

## 📋 同步前准备

### 1. 检查当前Git状态

```bash
# 查看当前分支
git branch -a

# 查看远程仓库
git remote -v

# 查看未推送的提交
git log --oneline -5
```

**当前状态**:
- 当前分支: main
- 最新提交: 项目优化完成（删除依赖包和构建文件）
- 未推送提交: 1个

---

## 🚀 同步步骤

### 方案A: 更新现有远程仓库（推荐）

如果你已经在GitHub上创建了仓库，使用此方案：

#### 步骤1: 更新远程仓库地址

```bash
# 查看当前远程仓库
git remote -v

# 移除旧的远程仓库（如果需要）
git remote remove origin

# 添加新的远程仓库
git remote add origin https://github.com/xiaomaimax/mes-system.git

# 验证
git remote -v
```

#### 步骤2: 推送到GitHub

```bash
# 推送main分支
git push -u origin main

# 推送所有标签
git push --tags

# 验证
git log --oneline -5
```

---

### 方案B: 创建新仓库并推送

如果你还没有在GitHub上创建仓库，使用此方案：

#### 步骤1: 在GitHub上创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息:
   - **Repository name**: mes-system (或其他名称)
   - **Description**: MES制造执行系统 - Manufacturing Execution System
   - **Public/Private**: 选择Public或Private
   - **Initialize this repository with**: 不勾选（因为我们已有本地仓库）
3. 点击 "Create repository"

#### 步骤2: 配置本地仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/xiaomaimax/mes-system.git

# 验证
git remote -v
```

#### 步骤3: 推送到GitHub

```bash
# 推送main分支
git push -u origin main

# 推送所有标签
git push --tags
```

---

## 🔐 GitHub认证配置

### 使用HTTPS（推荐新手）

```bash
# 首次推送时会提示输入凭证
git push -u origin main

# 输入GitHub用户名和密码（或Personal Access Token）
```

**获取Personal Access Token**:
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择权限: repo, workflow
4. 生成token并复制
5. 推送时使用token作为密码

### 使用SSH（推荐高级用户）

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加SSH密钥到ssh-agent
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 在GitHub上添加SSH密钥
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴公钥

# 测试连接
ssh -T git@github.com

# 使用SSH地址
git remote set-url origin git@github.com:xiaomaimax/mes-system.git
```

---

## 📝 完整同步命令

### 快速同步（一键完成）

```bash
# 1. 配置远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/xiaomaimax/mes-system.git

# 2. 推送到GitHub
git push -u origin main
git push --tags

# 3. 验证
git remote -v
git log --oneline -5
```

### 详细同步步骤

```bash
# 1. 检查状态
git status
git log --oneline -5

# 2. 配置远程仓库
git remote -v
git remote add origin https://github.com/xiaomaimax/mes-system.git

# 3. 推送分支
git push -u origin main

# 4. 推送标签
git push --tags

# 5. 验证
git remote -v
git branch -r
git log --oneline -5
```

---

## ✅ 同步验证

### 验证步骤

```bash
# 1. 检查远程仓库
git remote -v
# 应该显示: origin  https://github.com/xiaomaimax/mes-system.git (fetch)
#          origin  https://github.com/xiaomaimax/mes-system.git (push)

# 2. 检查分支
git branch -r
# 应该显示: origin/main

# 3. 检查标签
git tag -l
# 应该显示: v1.1.0

# 4. 查看提交日志
git log --oneline -5
```

### 在GitHub上验证

1. 访问 https://github.com/xiaomaimax/mes-system
2. 检查以下内容:
   - ✅ 代码已上传
   - ✅ 分支显示为main
   - ✅ 提交历史显示
   - ✅ 标签显示为v1.1.0
   - ✅ README.md显示正确

---

## 🔄 后续同步

### 定期推送更新

```bash
# 提交本地更改
git add .
git commit -m "描述你的更改"

# 推送到GitHub
git push origin main

# 推送新标签
git push --tags
```

### 从GitHub拉取更新

```bash
# 拉取最新代码
git pull origin main

# 拉取所有标签
git fetch --tags
```

---

## 📊 项目信息

### 项目统计
- **项目名称**: MES制造执行系统
- **项目版本**: v1.1.0
- **项目大小**: ~140 MB (优化后)
- **代码行数**: ~20,000行
- **文档文件**: ~50个
- **主要分支**: main

### 项目内容
- ✅ 完整的源代码 (server/, client/src/)
- ✅ 完整的配置文件 (package.json, docker-compose.yml等)
- ✅ 完整的文档 (docs/, README.md等)
- ✅ 完整的脚本 (scripts/, database/)
- ✅ Git提交历史

---

## 🎯 同步检查清单

### 推送前检查
- [ ] 所有本地更改已提交
- [ ] Git状态为clean
- [ ] 远程仓库地址正确
- [ ] GitHub认证已配置

### 推送执行
- [ ] 执行 `git push -u origin main`
- [ ] 执行 `git push --tags`
- [ ] 等待推送完成

### 推送后验证
- [ ] 访问GitHub仓库页面
- [ ] 检查代码已上传
- [ ] 检查分支显示正确
- [ ] 检查提交历史显示
- [ ] 检查标签显示正确

---

## 💡 常见问题

### Q1: 推送时出现"fatal: remote origin already exists"

**解决方案**:
```bash
# 移除旧的远程仓库
git remote remove origin

# 添加新的远程仓库
git remote add origin https://github.com/xiaomaimax/mes-system.git
```

### Q2: 推送时出现"Permission denied"

**解决方案**:
- 检查GitHub认证是否正确配置
- 使用Personal Access Token而不是密码
- 检查SSH密钥是否正确添加到GitHub

### Q3: 推送时出现"rejected"错误

**解决方案**:
```bash
# 拉取最新代码
git pull origin main

# 解决冲突（如果有）
# 然后重新推送
git push origin main
```

### Q4: 如何推送到不同的分支

**解决方案**:
```bash
# 创建新分支
git checkout -b develop

# 推送新分支
git push -u origin develop

# 切换回main
git checkout main
```

---

## 📞 相关链接

- **GitHub账户**: https://github.com/xiaomaimax
- **GitHub文档**: https://docs.github.com
- **Git文档**: https://git-scm.com/doc
- **Personal Access Token**: https://github.com/settings/tokens
- **SSH密钥**: https://github.com/settings/keys

---

## ✨ 同步完成

按照上述步骤完成后，你的项目将被成功同步到GitHub！

**推荐步骤**:
1. 在GitHub上创建新仓库 (如果还没有)
2. 配置本地Git远程仓库地址
3. 推送main分支和标签
4. 在GitHub上验证

---

**最后更新**: 2026-01-14  
**维护者**: MES系统团队

