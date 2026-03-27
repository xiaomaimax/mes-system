#!/bin/bash
set -e

DB_HOST='192.168.100.6'
DB_USER='mes_user'
DB_PASSWORD='Mes2025!'
DB_NAME='mes_system'
BACKUP_DIR='/opt/mes-system/backups/database'
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "[$(date)] 开始备份数据库..."

mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD"   --single-transaction --routines --triggers   "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "[$(date)] ✅ 备份完成：$BACKUP_FILE"

# 清理 30 天前的备份
find "$BACKUP_DIR" -name '*.sql.gz' -mtime +30 -delete
