#!/bin/bash

# MES制造执行系统 - GitHub同步脚本
# 用途: 将项目代码同步到GitHub
# 使用: bash sync-to-github.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          MES制造执行系统 - GitHub同步脚本                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 配置变量
GITHUB_USERNAME="xiaomaimax"
REPO_NAME="mes-system"
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo "📋 同步配置:"
echo "  GitHub用户: $GITHUB_USERNAME"
echo "  仓库名称: $REPO_NAME"
echo "  仓库地址: $GITHUB_URL"
echo ""

# 第1步：检查Git是否已安装
echo "1️⃣ 检查Git环境..."
if ! command -v git &> /dev/null; then
    echo "   ❌ Git未安装，请先安装Git"
    exit 1
fi
GIT_VERSION=$(git --version)
echo "   ✅ Git已安装: $GIT_VERSION"

# 第2步：检查本地更改
echo ""
echo "2️⃣ 检查本地更改..."
STATUS=$(git status --porcelain)
if [ -n "$STATUS" ]; then
    echo "   ℹ️ 发现未提交的更改，正在提交..."
    git add -A
    git commit -m "自动同步: 项目更新"
    echo "   ✅ 已提交本地更改"
else
    echo "   ✅ 工作目录干净"
fi

# 第3步：配置远程仓库
echo ""
echo "3️⃣ 配置远程仓库..."

EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -n "$EXISTING_REMOTE" ]; then
    echo "   ℹ️ 已存在origin远程仓库: $EXISTING_REMOTE"
    echo "   正在更新为: $GITHUB_URL"
    git remote set-url origin "$GITHUB_URL"
else
    echo "   ℹ️ 添加新的origin远程仓库"
    git remote add origin "$GITHUB_URL"
fi
echo "   ✅ 远程仓库配置完成"

# 第4步：验证远程仓库
echo ""
echo "4️⃣ 验证远程仓库配置..."
git remote -v | sed 's/^/   /'

# 第5步：推送到GitHub
echo ""
echo "5️⃣ 推送代码到GitHub..."
echo "   正在推送main分支..."

if git push -u origin main; then
    echo "   ✅ main分支推送成功"
else
    echo "   ⚠️ 推送失败，可能需要认证"
    echo "   请检查GitHub认证配置"
fi

# 第6步：推送标签
echo ""
echo "6️⃣ 推送标签到GitHub..."
echo "   正在推送所有标签..."

if git push --tags; then
    echo "   ✅ 标签推送成功"
else
    echo "   ⚠️ 标签推送失败"
fi

# 第7步：验证同步结果
echo ""
echo "7️⃣ 验证同步结果..."

if git branch -r | grep -q "origin/main"; then
    echo "   ✅ origin/main分支已同步"
else
    echo "   ⚠️ origin/main分支未同步"
fi

TAGS=$(git tag -l)
if [ -n "$TAGS" ]; then
    echo "   ✅ 标签已同步: $TAGS"
else
    echo "   ℹ️ 没有标签"
fi

# 最终总结
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    同步完成！                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 同步信息:"
echo "  GitHub用户: $GITHUB_USERNAME"
echo "  仓库名称: $REPO_NAME"
echo "  仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

echo "✅ 后续步骤:"
echo "  1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "  2. 验证代码已上传"
echo "  3. 检查提交历史和标签"
echo ""

echo "📝 常用命令:"
echo "  git push origin main          # 推送main分支"
echo "  git push --tags               # 推送所有标签"
echo "  git pull origin main          # 拉取最新代码"
echo "  git branch -r                 # 查看远程分支"
echo ""

echo "✨ 同步脚本执行完成！"
