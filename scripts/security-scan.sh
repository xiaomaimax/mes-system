#!/bin/bash
#############################################
# MaxMES 安全扫描脚本
# 功能：检查依赖安全、代码安全、配置安全
#############################################

set -e

echo "======================================"
echo "🔒 MaxMES 安全扫描"
echo "======================================"
echo ""

REPORT_FILE="/home/node/.openclaw/workspace/tests/security/scan-$(date +%Y%m%d_%H%M%S).md"
mkdir -p /home/node/.openclaw/workspace/tests/security

# 初始化报告
cat > "$REPORT_FILE" << EOF
# MaxMES 安全扫描报告

**扫描时间**: $(date '+%Y-%m-%d %H:%M:%S')
**扫描范围**: 依赖安全、代码安全、配置安全

---

## 扫描结果

EOF

echo "1️⃣  检查 npm 依赖安全..."
cd /opt/mes-system
npm audit --audit-level high > /tmp/npm_audit.txt 2>&1 || true
HIGH_VULN=$(grep -c "high" /tmp/npm_audit.txt || echo "0")
CRITICAL_VULN=$(grep -c "critical" /tmp/npm_audit.txt || echo "0")

if [ "$HIGH_VULN" -gt 0 ] || [ "$CRITICAL_VULN" -gt 0 ]; then
    echo "   ⚠️  发现高危漏洞："
    echo "   - 高危：$HIGH_VULN"
    echo "   - 严重：$CRITICAL_VULN"
    echo "" >> "$REPORT_FILE"
    echo "### 1. npm 依赖安全" >> "$REPORT_FILE"
    echo "⚠️  **发现漏洞**" >> "$REPORT_FILE"
    echo "- 高危漏洞：$HIGH_VULN" >> "$REPORT_FILE"
    echo "- 严重漏洞：$CRITICAL_VULN" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/npm_audit.txt >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    echo "   ✅ npm 依赖安全检查通过"
    echo "" >> "$REPORT_FILE"
    echo "### 1. npm 依赖安全" >> "$REPORT_FILE"
    echo "✅ 检查通过，未发现高危漏洞" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

echo "2️⃣  检查敏感信息泄露..."
SENSITIVE_FOUND=0

# 检查硬编码密码
if grep -r "password.*=.*['\"]" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -5; then
    echo "   ⚠️  可能包含硬编码密码"
    SENSITIVE_FOUND=1
fi

# 检查 API Key
if grep -r "api_key.*=.*['\"]" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -5; then
    echo "   ⚠️  可能包含硬编码 API Key"
    SENSITIVE_FOUND=1
fi

# 检查 Token
if grep -r "token.*=.*['\"]" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | grep -v "req.headers" | head -5; then
    echo "   ⚠️  可能包含硬编码 Token"
    SENSITIVE_FOUND=1
fi

if [ "$SENSITIVE_FOUND" -eq 0 ]; then
    echo "   ✅ 未发现敏感信息泄露"
fi

echo "" >> "$REPORT_FILE"
echo "### 2. 敏感信息泄露检查" >> "$REPORT_FILE"
if [ "$SENSITIVE_FOUND" -eq 0 ]; then
    echo "✅ 未发现敏感信息泄露" >> "$REPORT_FILE"
else
    echo "⚠️  发现潜在敏感信息，请检查上述输出" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "3️⃣  检查 SQL 注入风险..."
SQL_INJECTION_FOUND=0

# 检查直接拼接 SQL
if grep -r "query.*+.*req\." /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -5; then
    echo "   ⚠️  可能存在 SQL 注入风险（直接拼接 SQL）"
    SQL_INJECTION_FOUND=1
fi

# 检查 eval 使用
if grep -r "eval(" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -5; then
    echo "   ⚠️  使用 eval()，可能存在代码注入风险"
    SQL_INJECTION_FOUND=1
fi

if [ "$SQL_INJECTION_FOUND" -eq 0 ]; then
    echo "   ✅ 未发现明显 SQL 注入风险"
fi

echo "" >> "$REPORT_FILE"
echo "### 3. SQL 注入风险检查" >> "$REPORT_FILE"
if [ "$SQL_INJECTION_FOUND" -eq 0 ]; then
    echo "✅ 未发现明显风险" >> "$REPORT_FILE"
else
    echo "⚠️  发现潜在风险，请检查上述输出" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "4️⃣  检查 XSS 风险..."
XSS_FOUND=0

# 检查直接输出用户输入
if grep -r "res\.send.*req\." /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -5; then
    echo "   ⚠️  可能存在 XSS 风险（直接输出用户输入）"
    XSS_FOUND=1
fi

if [ "$XSS_FOUND" -eq 0 ]; then
    echo "   ✅ 未发现明显 XSS 风险"
fi

echo "" >> "$REPORT_FILE"
echo "### 4. XSS 风险检查" >> "$REPORT_FILE"
if [ "$XSS_FOUND" -eq 0 ]; then
    echo "✅ 未发现明显风险" >> "$REPORT_FILE"
else
    echo "⚠️  发现潜在风险，请检查上述输出" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "5️⃣  检查文件权限..."
PERM_ISSUES=0

# 检查敏感文件权限
if [ -f "/opt/mes-system/server/.env" ]; then
    ENV_PERM=$(stat -c %a /opt/mes-system/server/.env 2>/dev/null || stat -f %A /opt/mes-system/server/.env 2>/dev/null)
    if [ "$ENV_PERM" != "600" ]; then
        echo "   ⚠️  .env 文件权限不当：$ENV_PERM (应该是 600)"
        PERM_ISSUES=1
    else
        echo "   ✅ .env 文件权限正确"
    fi
fi

if [ "$PERM_ISSUES" -eq 0 ]; then
    echo "   ✅ 文件权限检查通过"
fi

echo "" >> "$REPORT_FILE"
echo "### 5. 文件权限检查" >> "$REPORT_FILE"
if [ "$PERM_ISSUES" -eq 0 ]; then
    echo "✅ 检查通过" >> "$REPORT_FILE"
else
    echo "⚠️  发现权限问题" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "6️⃣  检查安全配置..."
echo "" >> "$REPORT_FILE"
echo "### 6. 安全配置检查" >> "$REPORT_FILE"

# 检查 CORS 配置
if grep -r "cors.*origin.*\*" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -1; then
    echo "   ⚠️  CORS 配置为允许所有来源（*）"
    echo "- CORS: ⚠️  允许所有来源" >> "$REPORT_FILE"
else
    echo "   ✅ CORS 配置合理"
    echo "- CORS: ✅ 已配置" >> "$REPORT_FILE"
fi

# 检查 Helmet 使用
if grep -r "helmet()" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -1; then
    echo "   ✅ 使用 Helmet 安全中间件"
    echo "- Helmet: ✅ 已启用" >> "$REPORT_FILE"
else
    echo "   ⚠️  未使用 Helmet 安全中间件"
    echo "- Helmet: ⚠️  未启用" >> "$REPORT_FILE"
fi

# 检查 rate-limit 使用
if grep -r "rateLimit" /opt/mes-system/server --include="*.js" 2>/dev/null | grep -v node_modules | head -1; then
    echo "   ✅ 使用请求限流"
    echo "- 请求限流: ✅ 已配置" >> "$REPORT_FILE"
else
    echo "   ⚠️  未配置请求限流"
    echo "- 请求限流: ⚠️  未配置" >> "$REPORT_FILE"
fi

echo ""
echo "======================================"
echo "✅ 安全扫描完成！"
echo "======================================"
echo ""
echo "📄 扫描报告：$REPORT_FILE"
echo ""

# 总结
echo "📊 安全状态总结:"
if [ "$HIGH_VULN" -eq 0 ] && [ "$CRITICAL_VULN" -eq 0 ] && [ "$SENSITIVE_FOUND" -eq 0 ] && [ "$SQL_INJECTION_FOUND" -eq 0 ] && [ "$XSS_FOUND" -eq 0 ] && [ "$PERM_ISSUES" -eq 0 ]; then
    echo "  ✅ 整体安全状态：良好"
else
    echo "  ⚠️  发现安全问题，请查看报告"
fi
echo ""

# 清理临时文件
rm -f /tmp/npm_audit.txt
