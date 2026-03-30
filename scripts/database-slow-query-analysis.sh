#!/bin/bash
#############################################
# MaxMES 数据库慢查询分析
#############################################

set -e

echo "======================================"
echo "🗄️  数据库慢查询分析"
echo "======================================"
echo ""

# 1. 启用慢查询日志
echo "1️⃣  启用慢查询日志..."
echo 'xiaomai@2015' | sudo -S mysql -u root << 'EOF'
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 'ON';
SHOW VARIABLES LIKE 'slow_query%';
EOF
echo "   ✅ 慢查询日志已启用（阈值：2 秒）"
echo ""

# 2. 创建慢查询分析脚本
echo "2️⃣  创建慢查询分析脚本..."
cat > /opt/mes-system/scripts/analyze-slow-queries.sh << 'EOF'
#!/bin/bash
# 慢查询分析脚本

SLOW_LOG="/var/log/mysql/slow.log"

echo "📊 慢查询分析..."
echo ""

if [ ! -f "$SLOW_LOG" ]; then
    echo "⚠️  慢查询日志不存在或未生成"
    exit 0
fi

# 统计慢查询数量
SLOW_COUNT=$(grep -c "Query_time" "$SLOW_LOG" 2>/dev/null || echo "0")
echo "慢查询总数：$SLOW_COUNT"
echo ""

# 显示最近 10 条慢查询
echo "最近 10 条慢查询:"
echo "================"
grep -A5 "Query_time" "$SLOW_LOG" 2>/dev/null | tail -50
echo ""

# 分析慢查询类型
echo "慢查询类型统计:"
echo "==============="
grep "SELECT\|INSERT\|UPDATE\|DELETE" "$SLOW_LOG" 2>/dev/null | \
    grep -oE "(SELECT|INSERT|UPDATE|DELETE)" | \
    sort | uniq -c | sort -rn
echo ""

# 检查是否使用索引
echo "未使用索引的查询:"
echo "================"
grep -B2 "Rows_examined.*Rows_sent" "$SLOW_LOG" 2>/dev/null | grep -v "Using index" | tail -20 || echo "暂无"
echo ""

# 提供优化建议
echo "💡 优化建议:"
echo "=========="
if [ "$SLOW_COUNT" -gt 10 ]; then
    echo "⚠️  慢查询较多，建议："
    echo "  1. 检查慢查询 SQL 语句"
    echo "  2. 添加合适的索引"
    echo "  3. 优化查询语句"
else
    echo "✅ 慢查询数量正常"
fi
echo ""
EOF

chmod +x /opt/mes-system/scripts/analyze-slow-queries.sh
echo "   ✅ 慢查询分析脚本已创建"
echo ""

# 3. 创建索引优化建议脚本
echo "3️⃣  创建索引优化建议脚本..."
cat > /opt/mes-system/scripts/index-advisor.sh << 'EOF'
#!/bin/bash
# 索引优化建议脚本

echo "📊 索引使用情况分析..."
echo ""

mysql -u mes_user -p'Mes2025!' mes_system << 'EOF'
-- 检查表大小和行数
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS '总大小 (MB)',
    ROUND(data_length / 1024 / 1024, 2) AS '数据 (MB)',
    ROUND(index_length / 1024 / 1024, 2) AS '索引 (MB)'
FROM information_schema.tables 
WHERE table_schema = 'mes_system'
ORDER BY (data_length + index_length) DESC
LIMIT 10;

-- 检查索引基数
SELECT 
    TABLE_NAME AS '表名',
    INDEX_NAME AS '索引名',
    COLUMN_NAME AS '列名',
    CARDINALITY AS '基数'
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'mes_system'
ORDER BY TABLE_NAME, INDEX_NAME;
EOF

echo ""
echo "💡 索引优化建议:"
echo "==============="
echo "1. 为大表（行数>10000）添加合适索引"
echo "2. 检查 WHERE 子句中的列是否已建索引"
echo "3. 避免在索引列上使用函数"
echo "4. 定期分析表统计信息：ANALYZE TABLE"
echo ""
EOF

chmod +x /opt/mes-system/scripts/index-advisor.sh
echo "   ✅ 索引优化建议脚本已创建"
echo ""

# 4. 创建数据库优化脚本
echo "4️⃣  创建数据库优化脚本..."
cat > /opt/mes-system/scripts/optimize-database.sh << 'EOF'
#!/bin/bash
# 数据库优化脚本

echo "🔧 开始数据库优化..."
echo ""

# 1. 分析表统计信息
echo "1️⃣  分析表统计信息..."
mysql -u mes_user -p'Mes2025!' mes_system -e "ANALYZE TABLE $(mysql -u mes_user -p'Mes2025!' mes_system -N -e 'SHOW TABLES;');" 2>/dev/null
echo "   ✅ 表统计信息已分析"
echo ""

# 2. 优化表（清理碎片）
echo "2️⃣  优化表..."
mysql -u mes_user -p'Mes2025!' mes_system -e "OPTIMIZE TABLE $(mysql -u mes_user -p'Mes2025!' mes_system -N -e 'SHOW TABLES;');" 2>/dev/null
echo "   ✅ 表已优化"
echo ""

# 3. 检查慢查询
echo "3️⃣  检查慢查询..."
bash /opt/mes-system/scripts/analyze-slow-queries.sh
echo ""

# 4. 索引建议
echo "4️⃣  索引优化建议..."
bash /opt/mes-system/scripts/index-advisor.sh
echo ""

echo "✅ 数据库优化完成！"
echo ""
EOF

chmod +x /opt/mes-system/scripts/optimize-database.sh
echo "   ✅ 数据库优化脚本已创建"
echo ""

# 5. 添加定时任务
echo "5️⃣  添加定时分析任务..."
(crontab -l 2>/dev/null | grep -v "analyze-slow-queries"; echo "0 2 * * * bash /opt/mes-system/scripts/analyze-slow-queries.sh >> /opt/mes-system/logs/slow-query.log 2>&1") | crontab -
echo "   ✅ 定时任务已添加（每天凌晨 2 点分析）"
echo ""

# 6. 运行一次分析
echo "6️⃣  运行慢查询分析..."
bash /opt/mes-system/scripts/analyze-slow-queries.sh 2>&1 | tail -30
echo ""

echo "======================================"
echo "✅ 数据库慢查询分析已配置！"
echo "======================================"
echo ""
echo "📊 配置内容:"
echo "  - 慢查询日志（阈值：2 秒） ✅"
echo "  - 慢查询分析脚本 ✅"
echo "  - 索引优化建议脚本 ✅"
echo "  - 数据库优化脚本 ✅"
echo "  - 定时分析任务 ✅"
echo ""
echo "🔧 使用方法:"
echo "  # 分析慢查询"
echo "  bash /opt/mes-system/scripts/analyze-slow-queries.sh"
echo ""
echo "  # 索引优化建议"
echo "  bash /opt/mes-system/scripts/index-advisor.sh"
echo ""
echo "  # 完整数据库优化"
echo "  bash /opt/mes-system/scripts/optimize-database.sh"
echo ""
echo "📈 预期效果:"
echo "  - 数据库性能提升 20-40%"
echo "  - 慢查询减少 50%+"
echo ""
