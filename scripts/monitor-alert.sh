#!/bin/bash
# 监控告警脚本

BASE_URL="http://192.168.100.6:5001"

# 检查 API 响应时间
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/health")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

if [ "$RESPONSE_MS" -gt 2000 ]; then
    echo "⚠️  API 响应时间过长：${RESPONSE_MS}ms"
    # 发送飞书告警
    # curl -X POST "http://192.168.100.6:5001/api/alert/send" -d "{\"message\":\"API 响应时间过长：${RESPONSE_MS}ms\"}"
fi

# 检查缓存命中率
CACHE_STATS=$(curl -s "$BASE_URL/api/cache-monitor/stats" 2>/dev/null)
if [ -n "$CACHE_STATS" ]; then
    HIT_RATE=$(echo "$CACHE_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stats',{}).get('hitRate','0%').replace('%',''))" 2>/dev/null || echo "0")
    if (( $(echo "$HIT_RATE < 50" | bc -l) )); then
        echo "⚠️  缓存命中率过低：${HIT_RATE}%"
    fi
fi

echo "✅ 监控检查完成"
