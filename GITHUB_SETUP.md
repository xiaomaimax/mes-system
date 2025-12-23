# GitHub仓库设置指南

本指南将帮助你将MES系统项目上传到GitHub。

## 🚀 快速开始

### 方法一：使用自动化脚本（推荐）

#### Windows用户
```bash
# 在项目根目录运行
scripts\github-setup.bat <你的GitHub用户名> <仓库名称>

# 示例
scripts\github-setup.bat myusername mes-system
```

#### Linux/macOS用户
```bash
# 在项目根目录运行
chmod +x scripts/github-setup.sh
./scripts/github-setup.sh <你的GitHub用户名> <仓库名称>

# 示例
./scripts/github-setup.sh myusername mes-system
```

### 方法二：手动设置

#### 1. 在GitHub上创建仓库
1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `mes-system` (或你喜欢的名称)
   - Description: `现代化制造执行系统 - 集成生产管理、质量控制、设备维护等核心功能`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

#### 2. 本地Git设置
```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "🎉 Initial commit: MES Manufacturing Execution System v1.1.0"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名称.git

# 设置主分支
git branch -M main

# 推送到GitHub
git push -u origin main
```

#### 3. 更新项目链接
手动编辑以下文件中的GitHub链接：

**README.md**
```markdown
# 将所有 "your-username" 替换为你的GitHub用户名
# 将所有 "mes-system" 替换为你的仓库名称
```

**package.json**
```json
{
  "homepage": "https://github.com/你的用户名/仓库名称#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/你的用户名/仓库名称.git"
  },
  "bugs": {
    "url": "https://github.com/你的用户名/仓库名称/issues"
  }
}
```

## 📋 前置要求

### 1. 安装Git
- **Windows**: 下载 [Git for Windows](https://git-scm.com/download/win)
- **macOS**: `brew install git` 或从 [官网](https://git-scm.com/download/mac) 下载
- **Linux**: `sudo apt install git` (Ubuntu/Debian) 或 `sudo yum install git` (CentOS/RHEL)

### 2. 配置Git
```bash
# 设置用户名和邮箱
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱@example.com"

# 验证配置
git config --list
```

### 3. GitHub账户
- 注册 [GitHub账户](https://github.com/join)
- 设置SSH密钥（推荐）或使用HTTPS认证

## 🔐 认证设置

### 方法一：SSH密钥（推荐）
```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 添加到SSH代理
ssh-add ~/.ssh/id_ed25519

# 复制公钥到剪贴板
cat ~/.ssh/id_ed25519.pub
```

然后在GitHub设置中添加SSH密钥：
1. 进入 GitHub → Settings → SSH and GPG keys
2. 点击 "New SSH key"
3. 粘贴公钥内容

### 方法二：Personal Access Token
1. 进入 GitHub → Settings → Developer settings → Personal access tokens
2. 点击 "Generate new token"
3. 选择适当的权限范围
4. 复制生成的token
5. 在Git推送时使用token作为密码

## 📁 项目结构说明

上传到GitHub的项目包含以下主要文件和目录：

```
mes-system/
├── README.md                    # 项目说明文档
├── LICENSE                      # MIT许可证
├── CHANGELOG.md                 # 更新日志
├── CONTRIBUTING.md              # 贡献指南
├── SECURITY.md                  # 安全政策
├── .gitignore                   # Git忽略文件
├── package.json                 # 项目配置
├── docker-compose.yml           # Docker配置
├── .github/                     # GitHub配置
│   ├── workflows/ci.yml         # CI/CD流水线
│   ├── ISSUE_TEMPLATE/          # Issue模板
│   └── pull_request_template.md # PR模板
├── client/                      # 前端React应用
├── server/                      # 后端Node.js应用
├── database/                    # 数据库脚本
├── docs/                        # 项目文档
├── scripts/                     # 构建脚本
└── dev_log/                     # 开发日志
```

## 🎯 推荐的仓库设置

### 1. 仓库描述和标签
在GitHub仓库页面设置：
- **Description**: `现代化制造执行系统 - 集成生产管理、质量控制、设备维护等核心功能`
- **Website**: 你的演示网站URL（如果有）
- **Topics**: `mes`, `manufacturing`, `react`, `nodejs`, `mysql`, `industrial`, `erp`, `scada`

### 2. 分支保护规则
为main分支设置保护规则：
1. 进入 Settings → Branches
2. 添加规则保护main分支
3. 启用 "Require pull request reviews before merging"
4. 启用 "Require status checks to pass before merging"

### 3. GitHub Pages（可选）
如果要部署文档站点：
1. 进入 Settings → Pages
2. 选择源分支（通常是main分支的docs文件夹）
3. 保存设置

### 4. Issues和Projects
- 启用Issues用于bug报告和功能请求
- 创建Project看板管理开发进度
- 设置Issue标签分类

## 🔧 常见问题

### Q: 推送时提示认证失败
**A**: 检查以下几点：
1. 确认GitHub用户名和密码/token正确
2. 如果使用SSH，确认SSH密钥已添加到GitHub
3. 检查仓库URL是否正确

### Q: 文件太大无法推送
**A**: 
1. 检查.gitignore是否正确配置
2. 移除node_modules等大文件夹
3. 使用Git LFS处理大文件

### Q: 推送被拒绝
**A**:
1. 先拉取远程更改：`git pull origin main`
2. 解决冲突后重新推送
3. 或者强制推送：`git push -f origin main`（谨慎使用）

### Q: 如何更新已上传的项目
**A**:
```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到GitHub
git push origin main
```

## 📞 获取帮助

如果遇到问题，可以：
1. 查看 [Git官方文档](https://git-scm.com/doc)
2. 查看 [GitHub帮助文档](https://docs.github.com/)
3. 在项目Issues中提问
4. 联系项目维护者

---

**祝你成功上传MES系统到GitHub！** 🎉