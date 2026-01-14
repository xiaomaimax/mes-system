# MES制造执行系统 - GitHub同步脚本
# 用途: 将项目代码同步到GitHub
# 使用: .\sync-to-github.ps1

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          MES制造执行系统 - GitHub同步脚本                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# 配置变量
$GITHUB_USERNAME = "xiaomaimax"
$REPO_NAME = "mes-system"
$GITHUB_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

Write-Host "📋 同步配置:" -ForegroundColor Cyan
Write-Host "  GitHub用户: $GITHUB_USERNAME"
Write-Host "  仓库名称: $REPO_NAME"
Write-Host "  仓库地址: $GITHUB_URL"
Write-Host ""

# 第1步：检查Git是否已安装
Write-Host "1️⃣ 检查Git环境..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✅ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Git未安装，请先安装Git" -ForegroundColor Red
    exit 1
}

# 第2步：检查本地更改
Write-Host ""
Write-Host "2️⃣ 检查本地更改..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "   ℹ️ 发现未提交的更改，正在提交..." -ForegroundColor Cyan
    git add -A
    git commit -m "自动同步: 项目更新"
    Write-Host "   ✅ 已提交本地更改" -ForegroundColor Green
} else {
    Write-Host "   ✅ 工作目录干净" -ForegroundColor Green
}

# 第3步：配置远程仓库
Write-Host ""
Write-Host "3️⃣ 配置远程仓库..." -ForegroundColor Yellow

# 检查是否已存在origin
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "   ℹ️ 已存在origin远程仓库: $existingRemote" -ForegroundColor Cyan
    Write-Host "   正在更新为: $GITHUB_URL" -ForegroundColor Cyan
    git remote set-url origin $GITHUB_URL
} else {
    Write-Host "   ℹ️ 添加新的origin远程仓库" -ForegroundColor Cyan
    git remote add origin $GITHUB_URL
}

Write-Host "   ✅ 远程仓库配置完成" -ForegroundColor Green

# 第4步：验证远程仓库
Write-Host ""
Write-Host "4️⃣ 验证远程仓库配置..." -ForegroundColor Yellow
git remote -v | ForEach-Object { Write-Host "   $_" }

# 第5步：推送到GitHub
Write-Host ""
Write-Host "5️⃣ 推送代码到GitHub..." -ForegroundColor Yellow
Write-Host "   正在推送main分支..." -ForegroundColor Cyan

try {
    git push -u origin main
    Write-Host "   ✅ main分支推送成功" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ 推送失败，可能需要认证" -ForegroundColor Yellow
    Write-Host "   请检查GitHub认证配置" -ForegroundColor Yellow
}

# 第6步：推送标签
Write-Host ""
Write-Host "6️⃣ 推送标签到GitHub..." -ForegroundColor Yellow
Write-Host "   正在推送所有标签..." -ForegroundColor Cyan

try {
    git push --tags
    Write-Host "   ✅ 标签推送成功" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ 标签推送失败" -ForegroundColor Yellow
}

# 第7步：验证同步结果
Write-Host ""
Write-Host "7️⃣ 验证同步结果..." -ForegroundColor Yellow

$remoteMain = git branch -r | Select-String "origin/main"
if ($remoteMain) {
    Write-Host "   ✅ origin/main分支已同步" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ origin/main分支未同步" -ForegroundColor Yellow
}

$tags = git tag -l
if ($tags) {
    Write-Host "   ✅ 标签已同步: $tags" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ 没有标签" -ForegroundColor Cyan
}

# 最终总结
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    同步完成！                                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 同步信息:" -ForegroundColor Cyan
Write-Host "  GitHub用户: $GITHUB_USERNAME"
Write-Host "  仓库名称: $REPO_NAME"
Write-Host "  仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
Write-Host ""

Write-Host "✅ 后续步骤:" -ForegroundColor Green
Write-Host "  1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
Write-Host "  2. 验证代码已上传"
Write-Host "  3. 检查提交历史和标签"
Write-Host ""

Write-Host "📝 常用命令:" -ForegroundColor Cyan
Write-Host "  git push origin main          # 推送main分支"
Write-Host "  git push --tags               # 推送所有标签"
Write-Host "  git pull origin main          # 拉取最新代码"
Write-Host "  git branch -r                 # 查看远程分支"
Write-Host ""

Write-Host "✨ 同步脚本执行完成！" -ForegroundColor Green
