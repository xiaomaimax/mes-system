#!/bin/bash
# MaxMES 简化性能测试（无需 Chrome）
# 使用 curl 和基础工具进行性能分析

set -e

echo "🔍 MaxMES 简化性能测试"
echo "================================"
echo ""

SERVER="root@192.168.100.6"
REPORT_DIR="/opt/mes-system/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建报告目录
ssh $SERVER "mkdir -p $REPORT_DIR"

# 1. 响应时间测试
echo "📊 1. 响应时间测试"
echo "--------------------------------"

# 首次加载（无缓存）
echo "首次加载（清除缓存）:"
TIME_FIRST=$(curl -s -o /dev/null -w "%{time_total}" -H "Cache-Control: no-cache" http://192.168.100.6)
echo "  总时间：${TIME_FIRST}s"

# HTML 加载时间
TIME_HTML=$(curl -s -o /dev/null -w "%{time_total}" http://192.168.100.6/index.html)
echo "  HTML 加载：${TIME_HTML}s"

# DNS 解析时间
TIME_DNS=$(curl -s -o /dev/null -w "%{time_namelookup}" http://192.168.100.6)
echo "  DNS 解析：${TIME_DNS}s"

# TCP 连接时间
TIME_TCP=$(curl -s -o /dev/null -w "%{time_connect}" http://192.168.100.6)
echo "  TCP 连接：${TIME_TCP}s"

# TLS 握手时间（如果有 HTTPS）
TIME_TLS=$(curl -s -o /dev/null -w "%{time_appconnect}" http://192.168.100.6)
echo "  TLS 握手：${TIME_TLS}s"

# 开始传输时间
TIME_START=$(curl -s -o /dev/null -w "%{time_starttransfer}" http://192.168.100.6)
echo "  开始传输：${TIME_START}s"

echo ""

# 2. 资源大小分析
echo "📦 2. 资源大小分析"
echo "--------------------------------"

# 总构建体积
BUILD_SIZE=$(ssh $SERVER "du -sm /opt/mes-system/client/build | cut -f1")
echo "构建总体积：${BUILD_SIZE}MB"

# JS 文件
JS_FILES=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/js/*.js 2>/dev/null | wc -l")
JS_SIZE=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/js/*.js 2>/dev/null | awk '{sum += \$5} END {printf \"%.2fMB\", sum/1024/1024}'")
echo "JS 文件数：$JS_FILES"
echo "JS 总大小：$JS_SIZE"

# CSS 文件
CSS_FILES=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/css/*.css 2>/dev/null | wc -l")
CSS_SIZE=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/css/*.css 2>/dev/null | awk '{sum += \$5} END {printf \"%.2fMB\", sum/1024/1024}'")
echo "CSS 文件数：$CSS_FILES"
echo "CSS 总大小：$CSS_SIZE"

# 单个文件大小
echo ""
echo "主要文件详情:"
ssh $SERVER "ls -lh /opt/mes-system/client/build/static/js/*.js 2>/dev/null | awk '{print \"  \" \$9 \": \" \$5}'"
ssh $SERVER "ls -lh /opt/mes-system/client/build/static/css/*.css 2>/dev/null | awk '{print \"  \" \$9 \": \" \$5}'"

echo ""

# 3. HTTP 头分析
echo "📋 3. HTTP 头分析"
echo "--------------------------------"

# 检查响应头
echo "响应头信息:"
curl -sI http://192.168.100.6 | grep -E "Server|Content-Type|Content-Encoding|Cache-Control|ETag" | sed 's/^/  /'

echo ""

# 检查 Gzip 压缩
echo "Gzip 压缩检查:"
GZIP=$(curl -sI http://192.168.100.6 | grep -i "Content-Encoding" || echo "  未启用")
echo "  $GZIP"

# 检查缓存头
echo "缓存策略:"
CACHE=$(curl -sI http://192.168.100.6 | grep -i "Cache-Control" || echo "  未设置")
echo "  $CACHE"

echo ""

# 4. PWA 检查
echo "📱 4. PWA 检查"
echo "--------------------------------"

# 检查 manifest
MANIFEST=$(curl -s http://192.168.100.6/index.html | grep -o 'manifest.json' || echo "")
if [ ! -z "$MANIFEST" ]; then
    echo "  ✅ manifest.json 链接存在"
    # 验证 manifest 内容
    MANIFEST_VALID=$(curl -s http://192.168.100.6/manifest.json | grep -o '"name"' || echo "")
    if [ ! -z "$MANIFEST_VALID" ]; then
        echo "  ✅ manifest.json 可访问且有效"
    fi
else
    echo "  ❌ manifest.json 链接不存在"
fi

# 检查 Service Worker
SW=$(curl -s http://192.168.100.6/index.html | grep -o 'service-worker.js' || echo "")
if [ ! -z "$SW" ]; then
    echo "  ✅ Service Worker 注册代码存在"
    # 验证 SW 文件
    SW_VALID=$(curl -sI http://192.168.100.6/service-worker.js | grep "200" || echo "")
    if [ ! -z "$SW_VALID" ]; then
        echo "  ✅ Service Worker 文件可访问"
    fi
else
    echo "  ❌ Service Worker 注册代码不存在"
fi

echo ""

# 5. 性能预算检查
echo "🎯 5. 性能预算检查"
echo "--------------------------------"

# 构建体积预算
if [ "$BUILD_SIZE" -lt 5 ]; then
    echo "  ✅ 构建体积优秀（${BUILD_SIZE}MB < 5MB）"
elif [ "$BUILD_SIZE" -lt 10 ]; then
    echo "  ✅ 构建体积良好（${BUILD_SIZE}MB < 10MB）"
else
    echo "  ⚠️  构建体积偏大（${BUILD_SIZE}MB > 10MB）"
fi

# JS 体积预算
JS_SIZE_NUM=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/js/*.js 2>/dev/null | awk '{sum += \$5} END {print sum/1024/1024}'")
if (( $(echo "$JS_SIZE_NUM < 0.5" | bc -l) )); then
    echo "  ✅ JS 体积优秀（${JS_SIZE_NUM}MB < 0.5MB）"
elif (( $(echo "$JS_SIZE_NUM < 1.0" | bc -l) )); then
    echo "  ✅ JS 体积良好（${JS_SIZE_NUM}MB < 1.0MB）"
else
    echo "  ⚠️  JS 体积偏大（${JS_SIZE_NUM}MB > 1.0MB）"
fi

# 响应时间预算
TIME_FIRST_NUM=$(echo $TIME_FIRST | sed 's/s//')
if (( $(echo "$TIME_FIRST_NUM < 1.0" | bc -l) )); then
    echo "  ✅ 响应时间优秀（${TIME_FIRST_NUM}s < 1.0s）"
elif (( $(echo "$TIME_FIRST_NUM < 2.0" | bc -l) )); then
    echo "  ✅ 响应时间良好（${TIME_FIRST_NUM}s < 2.0s）"
else
    echo "  ⚠️  响应时间偏慢（${TIME_FIRST_NUM}s > 2.0s）"
fi

echo ""

# 6. 可访问性检查
echo "♿ 6. 基础可访问性检查"
echo "--------------------------------"

# 检查 HTML lang 属性
LANG=$(curl -s http://192.168.100.6/index.html | grep -o '<html[^>]*lang="[^"]*"' || echo "")
if [ ! -z "$LANG" ]; then
    echo "  ✅ HTML lang 属性存在：$LANG"
else
    echo "  ⚠️  HTML lang 属性缺失"
fi

# 检查 meta viewport
VIEWPORT=$(curl -s http://192.168.100.6/index.html | grep -o 'name="viewport"' || echo "")
if [ ! -z "$VIEWPORT" ]; then
    echo "  ✅ Viewport meta 标签存在"
else
    echo "  ⚠️  Viewport meta 标签缺失"
fi

# 检查 title
TITLE=$(curl -s http://192.168.100.6/index.html | grep -o '<title>[^<]*</title>' || echo "")
if [ ! -z "$TITLE" ]; then
    echo "  ✅ Title 标签存在：$TITLE"
else
    echo "  ❌ Title 标签缺失"
fi

echo ""

# 7. 生成报告
echo "📄 7. 生成测试报告"
echo "--------------------------------"

# 创建 JSON 报告
ssh $SERVER "cat > $REPORT_DIR/performance-report-$TIMESTAMP.json << 'EOFJSON'
{
  \"timestamp\": \"$TIMESTAMP\",
  \"url\": \"http://192.168.100.6\",
  \"metrics\": {
    \"firstLoad\": ${TIME_FIRST:-0},
    \"htmlLoad\": ${TIME_HTML:-0},
    \"dnsLookup\": ${TIME_DNS:-0},
    \"tcpConnect\": ${TIME_TCP:-0},
    \"buildSize\": ${BUILD_SIZE:-0},
    \"jsSize\": \"${JS_SIZE:-0}\",
    \"cssSize\": \"${CSS_SIZE:-0}\"
  },
  \"budgets\": {
    \"buildSize\": \"${BUILD_SIZE:-0}MB\",
    \"jsSize\": \"${JS_SIZE:-0}\",
    \"responseTime\": \"${TIME_FIRST:-0}s\"
  },
  \"checks\": {
    \"manifest\": $([ ! -z \"$MANIFEST\" ] && echo 'true' || echo 'false'),
    \"serviceWorker\": $([ ! -z \"$SW\" ] && echo 'true' || echo 'false'),
    \"gzip\": $([ ! -z \"$GZIP\" ] && echo 'true' || echo 'false')
  }
}
EOFJSON
"

echo "✅ JSON 报告已保存：$REPORT_DIR/performance-report-$TIMESTAMP.json"

echo ""
echo "================================"
echo "性能测试完成！"
echo ""
echo "📊 关键指标总结:"
echo "  首次加载：${TIME_FIRST}s"
echo "  构建体积：${BUILD_SIZE}MB"
echo "  JS 大小：$JS_SIZE"
echo "  CSS 大小：$CSS_SIZE"
echo ""
echo "📄 报告位置:"
echo "  $REPORT_DIR/performance-report-$TIMESTAMP.json"
