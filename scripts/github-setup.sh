#!/bin/bash

# MES系统GitHub仓库设置脚本
# 使用方法: ./scripts/github-setup.sh <your-github-username> <repository-name>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查参数
if [ $# -ne 2 ]; then
    print_error "使用方法: $0 <github-username> <repository-name>"
    print_error "示例: $0 myusername mes-system"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

print_message "开始设置MES系统GitHub仓库..."
print_message "GitHub用户名: ${GITHUB_USERNAME}"
print_message "仓库名称: ${REPO_NAME}"
print_message "仓库URL: ${REPO_URL}"

# 检查是否已经是git仓库
if [ -d ".git" ]; then
    print_warning "检测到现有的git仓库，将重新配置..."
    read -p "是否继续？这将重置现有的git配置 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message "操作已取消"
        exit 0
    fi
    rm -rf .git
fi

# 步骤1: 初始化git仓库
print_step "1. 初始化Git仓库"
git init
print_message "Git仓库初始化完成"

# 步骤2: 更新README.md中的链接
print_step "2. 更新README.md中的GitHub链接"
if [ -f "README.md" ]; then
    # 使用sed替换GitHub链接
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-username/${GITHUB_USERNAME}/g" README.md
        sed -i '' "s/mes-system/${REPO_NAME}/g" README.md
    else
        # Linux
        sed -i "s/your-username/${GITHUB_USERNAME}/g" README.md
        sed -i "s/mes-system/${REPO_NAME}/g" README.md
    fi
    print_message "README.md链接已更新"
else
    print_warning "README.md文件不存在"
fi

# 步骤3: 更新package.json中的仓库信息
print_step "3. 更新package.json中的仓库信息"
if [ -f "package.json" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-username/${GITHUB_USERNAME}/g" package.json
        sed -i '' "s/\"mes-system\"/\"${REPO_NAME}\"/g" package.json
    else
        # Linux
        sed -i "s/your-username/${GITHUB_USERNAME}/g" package.json
        sed -i "s/\"mes-system\"/\"${REPO_NAME}\"/g" package.json
    fi
    print_message "package.json仓库信息已更新"
else
    print_warning "package.json文件不存在"
fi

# 步骤4: 添加所有文件到git
print_step "4. 添加文件到Git"
git add .
print_message "所有文件已添加到Git暂存区"

# 步骤5: 创建初始提交
print_step "5. 创建初始提交"
git commit -m "🎉 Initial commit: MES Manufacturing Execution System v1.1.0

✨ Features:
- Complete MES system with 9 core modules
- Mock data system with real business scenarios
- Role-based access control (RBAC)
- Responsive UI design with Ant Design
- Docker containerization support

🏭 Modules:
- Process Management - 工艺管理
- Production Management - 生产管理  
- Equipment Management - 设备管理
- Quality Management - 质量管理
- Inventory Management - 库存管理
- Personnel Management - 人员管理
- System Integration - 系统集成
- Reports & Analytics - 报表分析
- System Settings - 系统设置

🔧 Tech Stack:
- Frontend: React 18 + Ant Design 5.x
- Backend: Node.js + Express + MySQL
- Data: Complete mock data system with 1000+ records
- Tools: DataService, DataCalculator, DataFormatter

📚 Documentation:
- Complete user guide and development docs
- API documentation and deployment guide
- Data integration examples and best practices"

print_message "初始提交已创建"

# 步骤6: 设置远程仓库
print_step "6. 设置远程仓库"
git remote add origin $REPO_URL
print_message "远程仓库已设置: ${REPO_URL}"

# 步骤7: 创建并切换到main分支
print_step "7. 设置主分支"
git branch -M main
print_message "已切换到main分支"

# 步骤8: 推送到GitHub
print_step "8. 推送到GitHub"
print_warning "即将推送到GitHub，请确保："
print_warning "1. 你已经在GitHub上创建了仓库: ${GITHUB_USERNAME}/${REPO_NAME}"
print_warning "2. 你已经配置了Git凭据 (git config user.name 和 user.email)"
print_warning "3. 你有推送权限到该仓库"

read -p "是否继续推送到GitHub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "正在推送到GitHub..."
    if git push -u origin main; then
        print_message "✅ 成功推送到GitHub!"
    else
        print_error "❌ 推送失败，请检查："
        print_error "1. 仓库是否存在: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
        print_error "2. 是否有推送权限"
        print_error "3. Git凭据是否正确配置"
        print_message "你可以稍后手动推送: git push -u origin main"
    fi
else
    print_message "跳过推送步骤"
    print_message "你可以稍后手动推送: git push -u origin main"
fi

# 步骤9: 显示后续步骤
print_step "9. 后续步骤建议"
echo
print_message "🎉 GitHub仓库设置完成!"
echo
print_message "📋 后续建议步骤:"
echo "1. 访问你的仓库: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "2. 设置仓库描述和标签"
echo "3. 启用GitHub Pages (如果需要)"
echo "4. 设置分支保护规则"
echo "5. 配置GitHub Actions secrets (如果需要)"
echo "6. 邀请协作者"
echo "7. 创建第一个Release"
echo
print_message "📚 有用的Git命令:"
echo "git status                 # 查看仓库状态"
echo "git log --oneline         # 查看提交历史"
echo "git remote -v             # 查看远程仓库"
echo "git branch -a             # 查看所有分支"
echo
print_message "🔗 仓库链接:"
echo "仓库主页: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "Issues: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/issues"
echo "Pull Requests: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/pulls"
echo "Actions: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/actions"
echo
print_message "✨ 享受你的MES系统开发之旅!"