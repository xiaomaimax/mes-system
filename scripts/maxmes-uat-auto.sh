#!/bin/bash
#############################################
# MaxMES 自动化 UAT 测试脚本
# 功能：自动执行所有 UAT 阶段并生成汇总报告
#############################################

set -e

echo "======================================"
echo "🧪 MaxMES 自动化 UAT 测试"
echo "======================================"
echo ""

# 配置
MES_URL="http://localhost:3000"
REPORT_DIR="tests/maxmes-uat/auto-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"

echo "测试环境：$MES_URL"
echo "报告目录：$REPORT_DIR"
echo ""

# 执行所有阶段
echo "📋 执行 UAT 测试..."
echo ""

echo "阶段 1: 页面加载测试..."
if bash scripts/maxmes-uat-test.sh > "$REPORT_DIR/stage1.log" 2>&1; then
    echo "✅ 阶段 1 通过"
else
    echo "❌ 阶段 1 失败"
fi

echo "阶段 2: 交互功能测试..."
if bash scripts/maxmes-uat-stage2.sh > "$REPORT_DIR/stage2.log" 2>&1; then
    echo "✅ 阶段 2 通过"
else
    echo "❌ 阶段 2 失败"
fi

echo "阶段 3: 深度交互测试..."
if bash scripts/maxmes-uat-stage3.sh > "$REPORT_DIR/stage3.log" 2>&1; then
    echo "✅ 阶段 3 通过"
else
    echo "❌ 阶段 3 失败"
fi

echo "阶段 4: 业务流程测试..."
if bash scripts/maxmes-uat-stage4.sh > "$REPORT_DIR/stage4.log" 2>&1; then
    echo "✅ 阶段 4 通过"
else
    echo "❌ 阶段 4 失败"
fi

echo ""

# 生成汇总报告
cat > "$REPORT_DIR/summary.md" << EOF
# UAT 自动化测试汇总报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试环境**: $MES_URL

## 测试结果

EOF

for i in 1 2 3 4; do
    if grep -q "✅ 通过\|通过率：100%" "$REPORT_DIR/stage$i.log"; then
        echo "- 阶段$i: ✅ 通过" >> "$REPORT_DIR/summary.md"
    else
        echo "- 阶段$i: ❌ 失败" >> "$REPORT_DIR/summary.md"
    fi
done

echo "" >> "$REPORT_DIR/summary.md"
echo "## 详细日志" >> "$REPORT_DIR/summary.md"
echo "" >> "$REPORT_DIR/summary.md"
echo "查看各阶段日志文件：" >> "$REPORT_DIR/summary.md"
echo "- [阶段 1]($REPORT_DIR/stage1.log)" >> "$REPORT_DIR/summary.md"
echo "- [阶段 2]($REPORT_DIR/stage2.log)" >> "$REPORT_DIR/summary.md"
echo "- [阶段 3]($REPORT_DIR/stage3.log)" >> "$REPORT_DIR/summary.md"
echo "- [阶段 4]($REPORT_DIR/stage4.log)" >> "$REPORT_DIR/summary.md"

# 检查是否全部通过
echo ""
if grep -q "❌ 失败" "$REPORT_DIR/summary.md"; then
    echo "======================================"
    echo "❌ UAT 测试失败"
    echo "======================================"
    echo ""
    echo "📄 查看汇总报告：$REPORT_DIR/summary.md"
    exit 1
else
    echo "======================================"
    echo "✅ UAT 测试全部通过"
    echo "======================================"
    echo ""
    echo "📄 查看汇总报告：$REPORT_DIR/summary.md"
    exit 0
fi
