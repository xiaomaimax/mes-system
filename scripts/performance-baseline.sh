#!/bin/bash
#############################################
# MaxMES 性能基线测试脚本
# 功能：测试 API 响应时间、QPS、并发性能
#############################################

set -e

echo "======================================"
echo "📊 MaxMES 性能基线测试"
echo "======================================"
echo ""

# 配置
BASE_URL="http://192.168.100.6"
REPORT_FILE="/home/node/.openclaw/workspace/tests/performance/baseline-$(date +%Y%m%d_%H%M%S).md"
mkdir -p /home/node/.openclaw/workspace/tests/performance

# 初始化报告
cat > "$REPORT_FILE" << EOF
# MaxMES 性能基线测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试环境**: $BASE_URL
**测试工具**: curl, ab (Apache Bench)

---

## 测试结果

EOF

echo "1️⃣  测试健康检查 API..."
START=$(date +%s%N)
for i in {1..10}; do
    curl -s -o /dev/null -w "%{time_total}\n" "$BASE_URL/api/health" >> /tmp/health_times.txt
done
END=$(date +%s%N)
AVG_TIME=$(awk '{sum+=$1} END {print sum/NR}' /tmp/health_times.txt)
echo "   平均响应时间：${AVG_TIME}s"
echo "" >> "$REPORT_FILE"
echo "### 1. 健康检查 API" >> "$REPORT_FILE"
echo "- 请求次数：10" >> "$REPORT_FILE"
echo "- 平均响应时间：${AVG_TIME}s" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "2️⃣  测试 Dashboard API..."
START=$(date +%s%N)
for i in {1..10}; do
    curl -s -o /dev/null -w "%{time_total}\n" "$BASE_URL/api/dashboard/overview" >> /tmp/dashboard_times.txt
done
END=$(date +%s%N)
AVG_TIME=$(awk '{sum+=$1} END {print sum/NR}' /tmp/dashboard_times.txt)
echo "   平均响应时间：${AVG_TIME}s"
echo "" >> "$REPORT_FILE"
echo "### 2. Dashboard API" >> "$REPORT_FILE"
echo "- 请求次数：10" >> "$REPORT_FILE"
echo "- 平均响应时间：${AVG_TIME}s" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "3️⃣  测试首页加载..."
START=$(date +%s%N)
for i in {1..10}; do
    curl -s -o /dev/null -w "%{time_total}\n" "$BASE_URL/" >> /tmp/home_times.txt
done
END=$(date +%s%N)
AVG_TIME=$(awk '{sum+=$1} END {print sum/NR}' /tmp/home_times.txt)
echo "   平均响应时间：${AVG_TIME}s"
echo "" >> "$REPORT_FILE"
echo "### 3. 首页加载" >> "$REPORT_FILE"
echo "- 请求次数：10" >> "$REPORT_FILE"
echo "- 平均响应时间：${AVG_TIME}s" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 如果安装了 ab，进行压力测试
if command -v ab &> /dev/null; then
    echo "4️⃣  进行并发压力测试..."
    echo "" >> "$REPORT_FILE"
    echo "### 4. 并发压力测试" >> "$REPORT_FILE"
    
    # 10 并发，100 请求
    ab -n 100 -c 10 -q "$BASE_URL/api/health" > /tmp/ab_test.txt 2>&1
    REQ_PER_SEC=$(grep "Requests per second" /tmp/ab_test.txt | awk '{print $4}')
    AVG_TIME=$(grep "Time per request" /tmp/ab_test.txt | head -1 | awk '{print $4}')
    echo "   并发数：10" >> "$REPORT_FILE"
    echo "   请求总数：100" >> "$REPORT_FILE"
    echo "   QPS: $REQ_PER_SEC" >> "$REPORT_FILE"
    echo "   平均响应时间：${AVG_TIME}ms" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "   ✅ 压力测试完成"
else
    echo "⚠️  ab (Apache Bench) 未安装，跳过压力测试"
    echo "" >> "$REPORT_FILE"
    echo "### 4. 并发压力测试" >> "$REPORT_FILE"
    echo "⚠️  ab 未安装，跳过" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# 系统资源检查
echo ""
echo "5️⃣  检查系统资源..."
echo "" >> "$REPORT_FILE"
echo "### 5. 系统资源状态" >> "$REPORT_FILE"

# CPU 负载
LOAD=$(uptime | awk -F'load average:' '{print $2}' | xargs)
echo "   CPU 负载：$LOAD"
echo "- CPU 负载：$LOAD" >> "$REPORT_FILE"

# 内存使用
MEMORY=$(free -h | grep Mem | awk '{print $3 "/" $2 " (" $3/$2 * 100.0 "%)"}')
echo "   内存使用：$MEMORY"
echo "- 内存使用：$MEMORY" >> "$REPORT_FILE"

# 磁盘使用
DISK=$(df -h /opt/mes-system | awk 'NR==2 {print $5}')
echo "   磁盘使用：$DISK"
echo "- 磁盘使用：$DISK" >> "$REPORT_FILE"

echo ""
echo "======================================"
echo "✅ 性能基线测试完成！"
echo "======================================"
echo ""
echo "📄 测试报告：$REPORT_FILE"
echo ""
echo "📊 性能指标摘要:"
echo "  - 健康检查 API: $(awk '{sum+=$1} END {printf "%.3f", sum/NR}' /tmp/health_times.txt)s"
echo "  - Dashboard API: $(awk '{sum+=$1} END {printf "%.3f", sum/NR}' /tmp/dashboard_times.txt)s"
echo "  - 首页加载：$(awk '{sum+=$1} END {printf "%.3f", sum/NR}' /tmp/home_times.txt)s"
echo ""

# 清理临时文件
rm -f /tmp/health_times.txt /tmp/dashboard_times.txt /tmp/home_times.txt /tmp/ab_test.txt
