#!/bin/bash
# MaxMES Lighthouse 性能测试脚本
# 自动运行 Lighthouse 审计并生成报告

set -e

echo "🔍 MaxMES Lighthouse 性能测试"
echo "================================"
echo ""

SERVER="root@192.168.100.6"
REPORT_DIR="/opt/mes-system/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 检查是否安装 Lighthouse
echo "检查 Lighthouse..."
if ! command -v lighthouse &> /dev/null; then
    echo "❌ Lighthouse 未安装，正在安装..."
    npm install -g lighthouse
fi

# 创建报告目录
ssh $SERVER "mkdir -p $REPORT_DIR"

# 测试开发环境
echo ""
echo "📊 测试开发环境 (http://192.168.100.6:3000)"
echo "--------------------------------"
lighthouse http://192.168.100.6:3000 \
  --output=html \
  --output=json \
  --output-path=$REPORT_DIR/lighthouse-dev-$TIMESTAMP \
  --quiet \
  --chrome-flags="--headless"

echo "✅ 开发环境测试完成"
echo "📄 报告位置：$REPORT_DIR/lighthouse-dev-$TIMESTAMP.html"

# 测试生产环境
echo ""
echo "📊 测试生产环境 (http://192.168.100.6)"
echo "--------------------------------"
lighthouse http://192.168.100.6 \
  --output=html \
  --output=json \
  --output-path=$REPORT_DIR/lighthouse-prod-$TIMESTAMP \
  --quiet \
  --chrome-flags="--headless"

echo "✅ 生产环境测试完成"
echo "📄 报告位置：$REPORT_DIR/lighthouse-prod-$TIMESTAMP.html"

# 提取关键指标
echo ""
echo "📈 关键性能指标"
echo "================================"

# 从 JSON 中提取分数（如果有）
if [ -f "$REPORT_DIR/lighthouse-prod-$TIMESTAMP.report.json" ]; then
    echo "生产环境 Lighthouse 分数:"
    cat "$REPORT_DIR/lighthouse-prod-$TIMESTAMP.report.json" | \
      grep -E '"performance"|"accessibility"|"best-practices"|"seo"' | \
      head -8
fi

# 性能预算检查
echo ""
echo "🎯 性能预算检查"
echo "--------------------------------"

# 检查构建体积
BUILD_SIZE=$(ssh $SERVER "du -sm /opt/mes-system/client/build | cut -f1")
echo "构建体积：${BUILD_SIZE}MB"

if [ "$BUILD_SIZE" -gt 10 ]; then
    echo "⚠️  警告：构建体积超过 10MB（当前：${BUILD_SIZE}MB）"
else
    echo "✅ 构建体积正常（${BUILD_SIZE}MB）"
fi

# 检查 JS 文件大小
JS_SIZE=$(ssh $SERVER "ls -lh /opt/mes-system/client/build/static/js/*.js 2>/dev/null | awk '{sum += \$5} END {print sum/1024/1024 \"MB\"}'")
echo "JS 总大小：$JS_SIZE"

echo ""
echo "================================"
echo "Lighthouse 测试完成！"
echo ""
echo "📊 查看报告:"
echo "  开发环境：file://$REPORT_DIR/lighthouse-dev-$TIMESTAMP.html"
echo "  生产环境：file://$REPORT_DIR/lighthouse-prod-$TIMESTAMP.html"
echo ""
echo "💡 目标分数:"
echo "  - Performance: 85+"
echo "  - Accessibility: 90+"
echo "  - Best Practices: 90+"
echo "  - SEO: 90+"
