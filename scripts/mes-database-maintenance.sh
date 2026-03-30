#!/bin/bash
#############################################
# MaxMES 数据库索引维护脚本
# 功能：每周自动优化数据库索引和表
# 最佳实践：
# 1. 分析表统计信息
# 2. 优化表（重建索引、清理碎片）
# 3. 检查慢查询日志
# 4. 生成维护报告
#############################################

set -e

# 配置
DB_HOST="192.168.100.6"
DB_PORT="3306"
DB_NAME="mes_system"
DB_USER="mes_user"
DB_PASSWORD="Mes2025!"
LOG_DIR="/opt/mes-system/logs/database"
REPORT_FILE="${LOG_DIR}/index_maintenance_$(date +%Y%m%d_%H%M%S).log"
SLOW_QUERY_LOG="/var/log/mysql/slow.log"

# 创建日志目录
mkdir -p "${LOG_DIR}"

echo "========================================" | tee -a "${REPORT_FILE}"
echo "MaxMES 数据库索引维护报告" | tee -a "${REPORT_FILE}"
echo "开始时间：$(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"

# 1. 分析所有表的统计信息
echo "" | tee -a "${REPORT_FILE}"
echo "1️⃣  分析表统计信息..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS '总大小 (MB)',
    ROUND(data_length / 1024 / 1024, 2) AS '数据大小 (MB)',
    ROUND(index_length / 1024 / 1024, 2) AS '索引大小 (MB)',
    ROUND((data_free / 1024 / 1024), 2) AS '碎片大小 (MB)'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}'
ORDER BY (data_length + index_length) DESC;
" 2>&1 | tee -a "${REPORT_FILE}"

# 2. 分析并优化每个表
echo "" | tee -a "${REPORT_FILE}"
echo "2️⃣  分析并优化表..." | tee -a "${REPORT_FILE}"

# 获取所有表名
TABLES=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES;" | grep -v "Tables_in")

for TABLE in ${TABLES}; do
    echo "" | tee -a "${REPORT_FILE}"
    echo "处理表：${TABLE}" | tee -a "${REPORT_FILE}"
    
    # 分析表
    echo "  - 分析表统计信息..." | tee -a "${REPORT_FILE}"
    mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "ANALYZE TABLE ${TABLE};" 2>&1 | tee -a "${REPORT_FILE}"
    
    # 优化表（重建索引、清理碎片）
    echo "  - 优化表（重建索引）..." | tee -a "${REPORT_FILE}"
    mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "OPTIMIZE TABLE ${TABLE};" 2>&1 | tee -a "${REPORT_FILE}"
done

# 3. 检查索引使用情况
echo "" | tee -a "${REPORT_FILE}"
echo "3️⃣  检查索引统计信息..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    TABLE_NAME AS '表名',
    INDEX_NAME AS '索引名',
    SEQ_IN_INDEX AS '列顺序',
    COLUMN_NAME AS '列名',
    CARDINALITY AS '基数',
    INDEX_TYPE AS '索引类型'
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = '${DB_NAME}'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
" 2>&1 | tee -a "${REPORT_FILE}"

# 4. 检查未使用的索引（需要 performance_schema 支持）
echo "" | tee -a "${REPORT_FILE}"
echo "4️⃣  检查索引使用情况（如果支持）..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    OBJECT_NAME AS '表名',
    INDEX_NAME AS '索引名',
    COUNT_READ AS '读取次数',
    COUNT_WRITE AS '写入次数'
FROM performance_schema.table_io_waits_summary_by_index_usage 
WHERE OBJECT_SCHEMA = '${DB_NAME}' 
AND COUNT_READ = 0 
AND COUNT_WRITE > 0
ORDER BY COUNT_WRITE DESC;
" 2>&1 | tee -a "${REPORT_FILE}" || echo "performance_schema 未启用或无权限" | tee -a "${REPORT_FILE}"

# 5. 检查慢查询（如果存在）
echo "" | tee -a "${REPORT_FILE}"
echo "5️⃣  慢查询日志检查..." | tee -a "${REPORT_FILE}"
if [ -f "${SLOW_QUERY_LOG}" ]; then
    echo "慢查询日志文件：${SLOW_QUERY_LOG}" | tee -a "${REPORT_FILE}"
    echo "最近 10 条慢查询：" | tee -a "${REPORT_FILE}"
    tail -100 "${SLOW_QUERY_LOG}" | grep -A5 "Query_time" | tail -30 | tee -a "${REPORT_FILE}" || echo "无慢查询记录" | tee -a "${REPORT_FILE}"
else
    echo "慢查询日志未启用或文件不存在" | tee -a "${REPORT_FILE}"
fi

# 6. 优化后统计
echo "" | tee -a "${REPORT_FILE}"
echo "6️⃣  优化后统计..." | tee -a "${REPORT_FILE}"
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS '总大小 (MB)',
    ROUND(data_free / 1024 / 1024, 2) AS '碎片大小 (MB)',
    ROUND((data_free / (data_length + index_length)) * 100, 2) AS '碎片率 (%)'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}'
ORDER BY (data_free) DESC
LIMIT 10;
" 2>&1 | tee -a "${REPORT_FILE}"

# 7. 清理旧的维护报告（保留最近 10 次）
echo "" | tee -a "${REPORT_FILE}"
echo "7️⃣  清理旧的维护报告..." | tee -a "${REPORT_FILE}"
cd "${LOG_DIR}"
ls -t index_maintenance_*.log | tail -n +11 | xargs -r rm -f
echo "已清理旧报告，保留最近 10 次" | tee -a "${REPORT_FILE}"

echo "" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"
echo "维护完成时间：$(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${REPORT_FILE}"
echo "报告文件：${REPORT_FILE}" | tee -a "${REPORT_FILE}"
echo "========================================" | tee -a "${REPORT_FILE}"

# 发送通知（可选）
echo "" | tee -a "${REPORT_FILE}"
echo "✅ 数据库索引维护完成！" | tee -a "${REPORT_FILE}"
