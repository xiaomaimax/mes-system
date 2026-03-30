#!/bin/bash
#############################################
# MaxMES 数据库性能监控脚本
# 功能：
# 1. 慢查询日志分析
# 2. 数据库性能指标监控
# 3. 索引优化建议
# 4. 性能报告生成
#############################################

set -e

# 配置
DB_HOST="192.168.100.6"
DB_PORT="3306"
DB_NAME="mes_system"
DB_USER="mes_user"
DB_PASSWORD="Mes2025!"
LOG_DIR="/opt/mes-system/logs/database"
REPORT_FILE="${LOG_DIR}/performance_monitor_$(date +%Y%m%d_%H%M%S).log"

# 创建日志目录
mkdir -p "${LOG_DIR}"

echo "========================================" | tee -a "${REPORT_FILE}"
echo "MaxMES 数据库性能监控报告" | tee -a "${REPORT_FILE}"
echo "开始时间：$(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"

# 1. 数据库基本信息
echo "" | tee -a "${REPORT_FILE}"
echo "1️⃣  数据库基本信息..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    @@version AS 'MySQL 版本',
    @@max_connections AS '最大连接数',
    @@max_allowed_packet / 1024 / 1024 AS '最大包大小 (MB)',
    @@innodb_buffer_pool_size / 1024 / 1024 AS 'InnoDB 缓冲池 (MB)',
    @@query_cache_size / 1024 / 1024 AS '查询缓存 (MB)'
" 2>&1 | tee -a "${REPORT_FILE}"

# 2. 连接数统计
echo "" | tee -a "${REPORT_FILE}"
echo "2️⃣  连接数统计..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Threads_running';
SHOW STATUS LIKE 'Threads_created';
SHOW STATUS LIKE 'Max_used_connections';
" 2>&1 | tee -a "${REPORT_FILE}"

# 3. 查询性能统计
echo "" | tee -a "${REPORT_FILE}"
echo "3️⃣  查询性能统计..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SHOW STATUS LIKE 'Questions';
SHOW STATUS LIKE 'Slow_queries';
SHOW STATUS LIKE 'Com_select';
SHOW STATUS LIKE 'Com_insert';
SHOW STATUS LIKE 'Com_update';
SHOW STATUS LIKE 'Com_delete';
" 2>&1 | tee -a "${REPORT_FILE}"

# 4. 表锁和行锁统计
echo "" | tee -a "${REPORT_FILE}"
echo "4️⃣  锁统计..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SHOW STATUS LIKE 'Table_locks_waited';
SHOW STATUS LIKE 'Table_locks_immediate';
SHOW STATUS LIKE 'Innodb_row_lock_current_waits';
SHOW STATUS LIKE 'Innodb_row_lock_time';
SHOW STATUS LIKE 'Innodb_row_lock_waits';
" 2>&1 | tee -a "${REPORT_FILE}"

# 5. 缓冲池性能
echo "" | tee -a "${REPORT_FILE}"
echo "5️⃣  缓冲池性能..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';
SHOW STATUS LIKE 'Innodb_buffer_pool_reads';
SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';
" 2>&1 | tee -a "${REPORT_FILE}"

# 计算缓冲池命中率
echo "" | tee -a "${REPORT_FILE}"
echo "缓冲池命中率计算:" | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -N -e "
SELECT 
    CONCAT(
        ROUND(
            (1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests) * 100, 
            2
        ), 
        '%'
    ) AS '缓冲池命中率'
FROM information_schema.GLOBAL_STATUS 
WHERE Variable_name IN ('Innodb_buffer_pool_reads', 'Innodb_buffer_pool_read_requests')
GROUP BY 1
" 2>&1 | tee -a "${REPORT_FILE}"

# 6. 慢查询分析（如果启用）
echo "" | tee -a "${REPORT_FILE}"
echo "6️⃣  慢查询日志检查..." | tee -a "${REPORT_FILE}"

# 检查慢查询日志是否启用
SLOW_QUERY_ENABLED=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SHOW VARIABLES LIKE 'slow_query_log';" 2>&1 | awk '{print $2}')

if [ "$SLOW_QUERY_ENABLED" = "ON" ]; then
    echo "慢查询日志已启用" | tee -a "${REPORT_FILE}"
    
    # 获取慢查询日志文件路径
    SLOW_QUERY_FILE=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SHOW VARIABLES LIKE 'slow_query_log_file';" 2>&1 | awk '{print $2}')
    echo "慢查询日志文件：${SLOW_QUERY_FILE}" | tee -a "${REPORT_FILE}"
    
    # 统计慢查询数量
    if [ -f "${SLOW_QUERY_FILE}" ]; then
        SLOW_COUNT=$(grep -c "Query_time" "${SLOW_QUERY_FILE}" 2>/dev/null || echo "0")
        echo "慢查询数量：${SLOW_COUNT}" | tee -a "${REPORT_FILE}"
        
        # 显示最近 5 条慢查询
        echo "" | tee -a "${REPORT_FILE}"
        echo "最近 5 条慢查询:" | tee -a "${REPORT_FILE}"
        grep -A5 "Query_time" "${SLOW_QUERY_FILE}" 2>/dev/null | tail -30 | tee -a "${REPORT_FILE}"
    else
        echo "慢查询日志文件不存在或无权限访问" | tee -a "${REPORT_FILE}"
    fi
else
    echo "慢查询日志未启用" | tee -a "${REPORT_FILE}"
    echo "建议：生产环境建议启用慢查询日志" | tee -a "${REPORT_FILE}"
fi

# 7. 索引使用统计
echo "" | tee -a "${REPORT_FILE}"
echo "7️⃣  索引使用统计..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    TABLE_NAME AS '表名',
    INDEX_NAME AS '索引名',
    SEQ_IN_INDEX AS '列顺序',
    COLUMN_NAME AS '列名',
    CARDINALITY AS '基数'
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = '${DB_NAME}'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
LIMIT 20
" 2>&1 | tee -a "${REPORT_FILE}"

# 8. 大表分析
echo "" | tee -a "${REPORT_FILE}"
echo "8️⃣  大表分析（前 10 个）..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS '总大小 (MB)',
    ROUND(data_length / 1024 / 1024, 2) AS '数据 (MB)',
    ROUND(index_length / 1024 / 1024, 2) AS '索引 (MB)',
    ROUND((data_free / 1024 / 1024), 2) AS '碎片 (MB)'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}'
ORDER BY (data_length + index_length) DESC
LIMIT 10
" 2>&1 | tee -a "${REPORT_FILE}"

# 9. 索引优化建议
echo "" | tee -a "${REPORT_FILE}"
echo "9️⃣  索引优化建议..." | tee -a "${REPORT_FILE}"

# 检查没有主键的表
echo "检查没有主键的表:" | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT table_name AS '表名'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}' 
AND table_name NOT IN (
    SELECT table_name 
    FROM information_schema.statistics 
    WHERE index_name = 'PRIMARY' 
    AND table_schema = '${DB_NAME}'
)
" 2>&1 | tee -a "${REPORT_FILE}"

# 检查碎片率高的表
echo "" | tee -a "${REPORT_FILE}"
echo "碎片率高的表（>10%）:" | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    ROUND((data_free / (data_length + index_length)) * 100, 2) AS '碎片率 (%)'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}' 
AND (data_length + index_length) > 0
HAVING 碎片率 > 10
ORDER BY 碎片率 DESC
" 2>&1 | tee -a "${REPORT_FILE}"

# 10. 性能优化建议
echo "" | tee -a "${REPORT_FILE}"
echo "🔟  性能优化建议..." | tee -a "${REPORT_FILE}"

# 检查配置
echo "配置检查:" | tee -a "${REPORT_FILE}"

# 检查查询缓存
QUERY_CACHE_SIZE=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SHOW VARIABLES LIKE 'query_cache_size';" 2>&1 | awk '{print $2}')
if [ "$QUERY_CACHE_SIZE" -eq 0 ]; then
    echo "⚠️  查询缓存未启用，建议根据情况启用" | tee -a "${REPORT_FILE}"
else
    echo "✅ 查询缓存已启用 (${QUERY_CACHE_SIZE} bytes)" | tee -a "${REPORT_FILE}"
fi

# 检查 innodb 缓冲池
BUFFER_POOL_SIZE=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';" 2>&1 | awk '{print $2}')
echo "✅ InnoDB 缓冲池大小：$(echo "scale=2; ${BUFFER_POOL_SIZE}/1024/1024" | bc) MB" | tee -a "${REPORT_FILE}"

echo "" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"
echo "监控完成时间：$(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${REPORT_FILE}"
echo "报告文件：${REPORT_FILE}" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"

# 清理旧报告（保留最近 10 次）
echo "" | tee -a "${REPORT_FILE}"
echo "📋 清理旧的监控报告..." | tee -a "${REPORT_FILE}"
cd "${LOG_DIR}"
ls -t performance_monitor_*.log | tail -n +11 | xargs -r rm -f
echo "已清理旧报告，保留最近 10 次" | tee -a "${REPORT_FILE}"

echo "" | tee -a "${REPORT_FILE}"
echo "✅ 数据库性能监控完成！" | tee -a "${REPORT_FILE}"
