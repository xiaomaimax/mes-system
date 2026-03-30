#!/bin/bash
#############################################
# MaxMES 自动化部署脚本
# 功能：自动拉取代码、构建、部署、验证
#############################################

set -e

echo "======================================"
echo "🚀 MaxMES 自动化部署"
echo "======================================"
echo ""

# 参数
ENV=${1:-production}  # staging 或 production
BRANCH=${2:-main}
SUDO_PASSWORD="xiaomai@2015"

echo "部署环境：$ENV"
echo "部署分支：$BRANCH"
echo ""

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
cd /opt/mes-system
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH
echo "✅ 代码拉取完成"
echo ""

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --production
echo "✅ 依赖安装完成"
echo ""

# 3. 构建前端
echo "🏗️  构建前端..."
cd /opt/mes-system/client
npm ci
npm run build
echo "✅ 前端构建完成"
echo ""

# 4. 数据库迁移（如果有）
echo "🗄️  数据库迁移..."
if [ -f "/opt/mes-system/scripts/db-migrate.sh" ]; then
    bash /opt/mes-system/scripts/db-migrate.sh
    echo "✅ 数据库迁移完成"
else
    echo "ℹ️  无需数据库迁移"
fi
echo ""

# 5. 重启服务
echo "🔄 重启服务..."
echo "$SUDO_PASSWORD" | sudo -S pm2 restart all
echo "✅ 服务重启完成"
echo ""

# 6. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10
echo "✅ 服务启动完成"
echo ""

# 7. 健康检查
echo "🏥 健康检查..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health)
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ 服务健康检查通过 (HTTP $HEALTH_STATUS)"
else
    echo "❌ 服务健康检查失败 (HTTP $HEALTH_STATUS)"
    echo "🔄 尝试回滚..."
    # 这里可以添加回滚逻辑
    exit 1
fi
echo ""

# 8. 运行 UAT 测试（生产环境）
if [ "$ENV" = "production" ]; then
    echo "🧪 运行生产环境 UAT 测试..."
    bash /opt/mes-system/scripts/maxmes-uat-auto.sh
    if [ $? -eq 0 ]; then
        echo "✅ UAT 测试通过"
    else
        echo "❌ UAT 测试失败"
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo ""
echo "📊 部署信息:"
echo "  环境：$ENV"
echo "  分支：$BRANCH"
echo "  时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🌐 访问地址:"
if [ "$ENV" = "production" ]; then
    echo "  生产环境：http://192.168.100.6"
else
    echo "  预发布环境：http://192.168.100.6:8080"
fi
echo ""
