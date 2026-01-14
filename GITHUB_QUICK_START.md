# GitHub快速同步 - 一页纸指南

## 🚀 3步完成GitHub同步

### 步骤1: 创建GitHub仓库
访问 https://github.com/new
- 仓库名: `maxmes`
- 描述: `MES制造执行系统 - Manufacturing Execution System`
- 选择: Public
- 点击: Create repository

### 步骤2: 运行同步脚本

**Windows (PowerShell)**:
```powershell
.\sync-to-github.ps1
```

**Linux/Mac (Bash)**:
```bash
bash sync-to-github.sh
```

### 步骤3: 验证同步
访问 https://github.com/xiaomaimax/maxmes
检查代码是否已上传 ✅

---

## 📝 手动同步命令

```bash
# 配置远程仓库
git remote add origin https://github.com/xiaomaimax/maxmes.git

# 推送代码
git push -u origin main

# 推送标签
git push --tags
```

---

## 🔐 GitHub认证

### 使用HTTPS (推荐)
首次推送时输入:
- 用户名: xiaomaimax
- 密码: Personal Access Token (从 https://github.com/settings/tokens 获取)

### 使用SSH (可选)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# 将公钥添加到 https://github.com/settings/keys
git remote set-url origin git@github.com:xiaomaimax/maxmes.git
```

---

## ✅ 同步检查清单

- [ ] GitHub仓库已创建
- [ ] 本地Git状态为clean
- [ ] 运行了同步脚本或手动命令
- [ ] 推送成功
- [ ] 访问GitHub仓库验证代码已上传

---

## 📊 项目信息

| 项目 | 内容 |
|------|------|
| 项目名称 | MES制造执行系统 |
| 项目版本 | v1.1.0 |
| 项目大小 | 140 MB |
| GitHub账户 | https://github.com/xiaomaimax |
| 仓库地址 | https://github.com/xiaomaimax/maxmes |

---

## 🎯 常用命令

```bash
# 查看远程仓库
git remote -v

# 查看分支
git branch -r

# 查看标签
git tag -l

# 查看提交历史
git log --oneline -5

# 拉取最新代码
git pull origin main

# 推送更新
git push origin main
```

---

## 💡 常见问题

**Q: 推送时出现"Permission denied"?**
A: 检查GitHub认证是否正确配置，使用Personal Access Token而不是密码

**Q: 推送时出现"rejected"?**
A: 运行 `git pull origin main` 拉取最新代码，然后重新推送

**Q: 如何修改仓库名称?**
A: 在GitHub仓库设置中修改，然后运行 `git remote set-url origin <新地址>`

---

## 📞 相关链接

- GitHub账户: https://github.com/xiaomaimax
- 创建仓库: https://github.com/new
- Personal Access Token: https://github.com/settings/tokens
- SSH密钥: https://github.com/settings/keys

---

**最后更新**: 2026-01-14

