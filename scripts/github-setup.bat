@echo off
setlocal enabledelayedexpansion

REM MES系统GitHub仓库设置脚本 (Windows版本)
REM 使用方法: github-setup.bat <your-github-username> <repository-name>

echo.
echo ========================================
echo    MES系统GitHub仓库设置脚本
echo ========================================
echo.

REM 检查参数
if "%~2"=="" (
    echo [错误] 使用方法: %0 ^<github-username^> ^<repository-name^>
    echo [错误] 示例: %0 myusername mes-system
    pause
    exit /b 1
)

set GITHUB_USERNAME=%1
set REPO_NAME=%2
set REPO_URL=https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo [信息] GitHub用户名: %GITHUB_USERNAME%
echo [信息] 仓库名称: %REPO_NAME%
echo [信息] 仓库URL: %REPO_URL%
echo.

REM 检查是否已经是git仓库
if exist ".git" (
    echo [警告] 检测到现有的git仓库，将重新配置...
    set /p "continue=是否继续？这将重置现有的git配置 (y/N): "
    if /i not "!continue!"=="y" (
        echo [信息] 操作已取消
        pause
        exit /b 0
    )
    rmdir /s /q .git
)

echo.
echo [步骤 1] 初始化Git仓库
git init
if errorlevel 1 (
    echo [错误] Git初始化失败，请确保已安装Git
    pause
    exit /b 1
)
echo [信息] Git仓库初始化完成

echo.
echo [步骤 2] 更新README.md中的GitHub链接
if exist "README.md" (
    powershell -Command "(Get-Content README.md) -replace 'your-username', '%GITHUB_USERNAME%' -replace 'mes-system', '%REPO_NAME%' | Set-Content README.md"
    echo [信息] README.md链接已更新
) else (
    echo [警告] README.md文件不存在
)

echo.
echo [步骤 3] 更新package.json中的仓库信息
if exist "package.json" (
    powershell -Command "(Get-Content package.json) -replace 'your-username', '%GITHUB_USERNAME%' -replace '\"mes-system\"', '\"%REPO_NAME%\"' | Set-Content package.json"
    echo [信息] package.json仓库信息已更新
) else (
    echo [警告] package.json文件不存在
)

echo.
echo [步骤 4] 添加文件到Git
git add .
if errorlevel 1 (
    echo [错误] 添加文件到Git失败
    pause
    exit /b 1
)
echo [信息] 所有文件已添加到Git暂存区

echo.
echo [步骤 5] 创建初始提交
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

if errorlevel 1 (
    echo [错误] 创建提交失败
    pause
    exit /b 1
)
echo [信息] 初始提交已创建

echo.
echo [步骤 6] 设置远程仓库
git remote add origin %REPO_URL%
if errorlevel 1 (
    echo [错误] 设置远程仓库失败
    pause
    exit /b 1
)
echo [信息] 远程仓库已设置: %REPO_URL%

echo.
echo [步骤 7] 设置主分支
git branch -M main
if errorlevel 1 (
    echo [错误] 设置主分支失败
    pause
    exit /b 1
)
echo [信息] 已切换到main分支

echo.
echo [步骤 8] 推送到GitHub
echo [警告] 即将推送到GitHub，请确保：
echo [警告] 1. 你已经在GitHub上创建了仓库: %GITHUB_USERNAME%/%REPO_NAME%
echo [警告] 2. 你已经配置了Git凭据 (git config user.name 和 user.email)
echo [警告] 3. 你有推送权限到该仓库
echo.
set /p "push=是否继续推送到GitHub? (y/N): "
if /i "!push!"=="y" (
    echo [信息] 正在推送到GitHub...
    git push -u origin main
    if errorlevel 1 (
        echo [错误] ❌ 推送失败，请检查：
        echo [错误] 1. 仓库是否存在: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
        echo [错误] 2. 是否有推送权限
        echo [错误] 3. Git凭据是否正确配置
        echo [信息] 你可以稍后手动推送: git push -u origin main
    ) else (
        echo [信息] ✅ 成功推送到GitHub!
    )
) else (
    echo [信息] 跳过推送步骤
    echo [信息] 你可以稍后手动推送: git push -u origin main
)

echo.
echo [步骤 9] 后续步骤建议
echo.
echo ========================================
echo    🎉 GitHub仓库设置完成!
echo ========================================
echo.
echo 📋 后续建议步骤:
echo 1. 访问你的仓库: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. 设置仓库描述和标签
echo 3. 启用GitHub Pages (如果需要)
echo 4. 设置分支保护规则
echo 5. 配置GitHub Actions secrets (如果需要)
echo 6. 邀请协作者
echo 7. 创建第一个Release
echo.
echo 📚 有用的Git命令:
echo git status                 # 查看仓库状态
echo git log --oneline         # 查看提交历史
echo git remote -v             # 查看远程仓库
echo git branch -a             # 查看所有分支
echo.
echo 🔗 仓库链接:
echo 仓库主页: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo Issues: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/issues
echo Pull Requests: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/pulls
echo Actions: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/actions
echo.
echo ✨ 享受你的MES系统开发之旅!
echo.
pause