#!/bin/bash
set -e

BACKUP_BASE="/opt/mes-system/backups"
BACKUP_DIR="${BACKUP_BASE}/mes-backup-$(date +%Y%m%d_%H%M%S)"
DB_BACKUP_DIR="${BACKUP_BASE}/database"

# 数据库配置
DB_HOST='192.168.100.6'
DB_USER='mes_user'
DB_PASSWORD='Mes2025!'
DB_NAME='mes_system'

echo "========================================"
echo "🔄 MaxMES 系统每日备份"
echo "========================================"
echo "开始时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 创建备份目录
echo "[1/4] 创建备份目录..."
mkdir -p "$BACKUP_DIR"
mkdir -p "$DB_BACKUP_DIR"

# 备份数据库
echo "[2/4] 备份数据库..."
DB_FILE="${DB_BACKUP_DIR}/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers \
  "$DB_NAME" | gzip > "$DB_FILE"
echo "✅ 数据库备份：$DB_FILE"

# 备份源代码和配置
echo "[3/4] 备份源代码和配置..."
cp -r /opt/mes-system/client "$BACKUP_DIR/"
cp -r /opt/mes-system/server "$BACKUP_DIR/"
cp /opt/mes-system/.env "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/mes-system/package.json "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/mes-system/docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true

# 创建备份信息文件
cat > "$BACKUP_DIR/backup-info.txt" << INFO
MaxMES 系统备份
备份时间：$(date '+%Y-%m-%d %H:%M:%S')
备份内容：
- client/ (前端源代码)
- server/ (后端源代码)
- .env (配置文件)
- package.json
- docker-compose.yml
数据库备份：$DB_FILE
INFO

echo "✅ 源代码备份：$BACKUP_DIR"

# 清理旧备份（保留最近 7 个）
echo "[4/4] 清理旧备份..."
cd "$BACKUP_BASE"
ls -dt mes-backup-* 2>/dev/null | tail -n +8 | xargs -r rm -rf
echo "✅ 保留最近 7 个备份"

# 清理 30 天前的数据库备份
find "$DB_BACKUP_DIR" -name '*.sql.gz' -mtime +30 -delete 2>/dev/null || true

echo ""
echo "========================================"
echo "✅ 备份完成"
echo "========================================"
echo "结束时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "备份位置：$BACKUP_DIR"
echo "数据库备份：$DB_FILE"
echo ""

# 显示备份大小
du -sh "$BACKUP_DIR" 2>/dev/null || true
du -sh "$DB_FILE" 2>/dev/null || true
