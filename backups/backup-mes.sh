#!/bin/bash
# MaxMES 每日自动备份脚本
# 执行时间: 每天 04:00

BACKUP_DIR="/opt/mes-system/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mes_p2"
DB_USER="root"
DB_PASS="root123"
KEEP_DAYS=7

echo "[$(date)] 开始 MaxMES 备份..."

# 1. 数据库备份
echo "[1/3] 备份数据库..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME 2>/dev/null | gzip > $BACKUP_DIR/database/mes_p2_${DATE}.sql.gz
if [ $? -eq 0 ]; then
    echo "  ✓ 数据库备份成功: mes_p2_${DATE}.sql.gz"
else
    echo "  ✗ 数据库备份失败"
fi

# 2. 源代码备份
echo "[2/3] 备份源代码..."
cd /opt/mes-system
tar -czf $BACKUP_DIR/mes-source-${DATE}.tar.gz client server     --exclude='node_modules'     --exclude='.git'     --exclude='build'     --exclude='.next' 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✓ 源代码备份成功: mes-source-${DATE}.tar.gz"
else
    echo "  ✗ 源代码备份失败"
fi

# 3. 清理旧备份（保留最近7天）
echo "[3/3] 清理旧备份（保留 $KEEP_DAYS 天）..."
find $BACKUP_DIR -name 'mes_p2_*.sql.gz' -mtime +$KEEP_DAYS -delete 2>/dev/null
find $BACKUP_DIR -name 'mes-source-*.tar.gz' -mtime +$KEEP_DAYS -delete 2>/dev/null
echo "  ✓ 清理完成"

# 显示备份结果
echo ""
echo "=== 备份完成 ==="
ls -lh $BACKUP_DIR/database/mes_p2_${DATE}.sql.gz 2>/dev/null
ls -lh $BACKUP_DIR/mes-source-${DATE}.tar.gz 2>/dev/null
echo "[$(date)] 备份任务完成"
