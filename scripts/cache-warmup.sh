#!/bin/bash
# 缓存预热脚本

echo "🔥 开始缓存预热..."

BASE_URL="http://192.168.100.6:5001"

# 预热 Dashboard 数据
echo "  - Dashboard 概览..."
curl -s "$BASE_URL/api/dashboard/overview" > /dev/null

# 预热监控数据
echo "  - 监控指标..."
curl -s "$BASE_URL/api/monitor/metrics" > /dev/null

# 预热物料数据
echo "  - 物料列表..."
curl -s "$BASE_URL/api/materials" > /dev/null

# 预热生产订单数据
echo "  - 生产订单..."
curl -s "$BASE_URL/api/production-orders" > /dev/null

echo "✅ 缓存预热完成！"
echo ""
echo "检查缓存键:"
redis-cli -a redis --no-auth-warning KEYS 'mes:*' | head -10
