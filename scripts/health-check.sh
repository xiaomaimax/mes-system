#!/bin/bash
#############################################
# MaxMES 健康检查脚本
# 功能：检查服务状态、API 可用性、PM2 状态
#############################################

set -e

echo "======================================"
echo "🏥 MaxMES 健康检查"
echo "======================================"
echo ""

# 配置
API_URL="http://localhost:5001"
WEB_URL="http://localhost:80"
MAX_RETRIES=5
RETRY_INTERVAL=10
SUDO_PASSWORD="xiaomai@2015"

# 检查 API
echo "1️⃣  检查 API 服务..."
for i in $(seq 1 $MAX_RETRIES); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
    if [ "$STATUS" = "200" ]; then
        echo "✅ API 服务正常 (HTTP $STATUS)"
        break
    else
        echo "⚠️ API 服务检查失败，重试 $i/$MAX_RETRIES"
        if [ $i -eq $MAX_RETRIES ]; then
            echo "❌ API 服务检查失败，达到最大重试次数"
            exit 1
        fi
        sleep $RETRY_INTERVAL
    fi
done
echo ""

# 检查 Web 服务
echo "2️⃣  检查 Web 服务..."
for i in $(seq 1 $MAX_RETRIES); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL")
    if [ "$STATUS" = "200" ]; then
        echo "✅ Web 服务正常 (HTTP $STATUS)"
        break
    else
        echo "⚠️ Web 服务检查失败，重试 $i/$MAX_RETRIES"
        if [ $i -eq $MAX_RETRIES ]; then
            echo "❌ Web 服务检查失败，达到最大重试次数"
            exit 1
        fi
        sleep $RETRY_INTERVAL
    fi
done
echo ""

# 检查 PM2 服务
echo "3️⃣  检查 PM2 服务..."
echo "$SUDO_PASSWORD" | sudo -S pm2 status > /tmp/pm2-status.txt
if grep -q "online" /tmp/pm2-status.txt; then
    echo "✅ PM2 服务正常"
    echo "$SUDO_PASSWORD" | sudo -S pm2 status | grep -E "mes-api|mes-p2"
else
    echo "❌ PM2 服务异常"
    exit 1
fi
echo ""

# 检查磁盘空间
echo "4️⃣  检查磁盘空间..."
DISK_USAGE=$(df -h /opt/mes-system | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ 磁盘空间正常 (使用率：${DISK_USAGE}%)"
else
    echo "⚠️ 磁盘空间不足 (使用率：${DISK_USAGE}%)"
fi
echo ""

# 检查内存使用
echo "5️⃣  检查内存使用..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
    echo "✅ 内存使用正常 (使用率：${MEMORY_USAGE}%)"
else
    echo "⚠️ 内存使用过高 (使用率：${MEMORY_USAGE}%)"
fi
echo ""

echo "======================================"
echo "✅ 健康检查完成"
echo "======================================"
echo ""
