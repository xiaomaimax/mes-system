#!/bin/bash
#############################################
# MaxMES 快速回退脚本
# 功能：快速回退到备份状态
#############################################

set -e

echo "======================================"
echo "🔄 MaxMES 系统回退"
echo "======================================"
echo ""

# 查找最新备份
LATEST_BACKUP=$(ls -td /opt/mes-system/backups/pre-optimization-* | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 未找到备份"
    exit 1
fi

echo "使用备份：$LATEST_BACKUP"
echo ""

# 读取备份信息
CURRENT_BRANCH=$(cat "$LATEST_BACKUP/code/current-branch.txt" 2>/dev/null || echo "main")
CURRENT_COMMIT=$(cat "$LATEST_BACKUP/code/current-commit.txt" 2>/dev/null || echo "")

echo "📋 回退目标:"
echo "  分支：$CURRENT_BRANCH"
echo "  Commit: $CURRENT_COMMIT"
echo ""

# 确认回退
read -p "⚠️  确定要回退吗？(yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ 回退已取消"
    exit 0
fi

# 1. 停止服务
echo "1️⃣  停止服务..."
echo 'xiaomai@2015' | sudo -S pm2 stop all
echo "   ✅ 服务已停止"
echo ""

# 2. 回退代码
echo "2️⃣  回退代码..."
cd /opt/mes-system
git reset --hard "$CURRENT_COMMIT"
echo "   ✅ 代码已回退到 $CURRENT_COMMIT"
echo ""

# 3. 恢复依赖
echo "3️⃣  恢复依赖..."
npm install
echo "   ✅ 依赖已恢复"
echo ""

# 4. 恢复数据库（可选）
echo "4️⃣  恢复数据库..."
read -p "是否恢复数据库备份？(yes/no): " -r
echo
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    DB_BACKUP=$(ls "$LATEST_BACKUP/database/"*.sql.gz 2>/dev/null | head -1)
    if [ -n "$DB_BACKUP" ]; then
        gunzip -k "$DB_BACKUP"
        DB_SQL="${DB_BACKUP%.gz}"
        mysql -u mes_user -p'Mes2025!' mes_system < "$DB_SQL"
        echo "   ✅ 数据库已恢复"
    else
        echo "   ⚠️  未找到数据库备份"
    fi
else
    echo "   ⏭️  跳过数据库恢复"
fi
echo ""

# 5. 恢复配置（可选）
echo "5️⃣  恢复配置..."
read -p "是否恢复配置文件？(yes/no): " -r
echo
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    if [ -f "$LATEST_BACKUP/config/.env" ]; then
        cp "$LATEST_BACKUP/config/.env" /opt/mes-system/server/.env
        echo "   ✅ .env 已恢复"
    fi
    if [ -f "$LATEST_BACKUP/config/package.json" ]; then
        cp "$LATEST_BACKUP/config/package.json" /opt/mes-system/
        echo "   ✅ package.json 已恢复"
    fi
else
    echo "   ⏭️  跳过配置恢复"
fi
echo ""

# 6. 重启服务
echo "6️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart all
sleep 5
echo "   ✅ 服务已重启"
echo ""

# 7. 验证
echo "7️⃣  验证..."
echo "   检查服务状态..."
echo 'xiaomai@2015' | sudo -S pm2 status

echo ""
echo "   检查 API..."
curl -s http://localhost:5001/api/health | python3 -m json.tool | head -10

echo ""
echo "======================================"
echo "✅ 回退完成！"
echo "======================================"
echo ""
echo "📊 回退状态:"
echo "  - 代码：✅ 已回退"
echo "  - 服务：✅ 已重启"
echo "  - 数据库：${REPLY:+✅ 已恢复}⏭️ 已跳过"
echo ""
echo "🔍 验证方法:"
echo "  1. 访问：http://192.168.100.6"
echo "  2. API: http://192.168.100.6/api/health"
echo "  3. 日志：tail -50 /opt/mes-system/logs/server.log"
echo ""
