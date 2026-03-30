#!/bin/bash
#############################################
# MaxMES 备份与回退脚本
# 功能：备份代码、数据库、配置，支持快速回退
#############################################

set -e

echo "======================================"
echo "💾 MaxMES 系统备份"
echo "======================================"
echo ""

# 配置
BACKUP_DIR="/opt/mes-system/backups/pre-optimization-$(date +%Y%m%d_%H%M%S)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SUDO_PASSWORD="xiaomai@2015"

echo "备份目录：$BACKUP_DIR"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"/{code,database,config,logs}

# 1. 备份代码
echo "1️⃣  备份代码..."
cd /opt/mes-system
git status --short > "$BACKUP_DIR/code/git-status.txt"
git log --oneline -10 > "$BACKUP_DIR/code/git-log.txt"
git diff > "$BACKUP_DIR/code/git-diff.txt"
echo "   ✅ Git 状态已保存"

# 保存当前分支
git rev-parse --abbrev-ref HEAD > "$BACKUP_DIR/code/current-branch.txt"
CURRENT_BRANCH=$(cat "$BACKUP_DIR/code/current-branch.txt")
echo "   当前分支：$CURRENT_BRANCH"

# 保存当前 commit
git rev-parse HEAD > "$BACKUP_DIR/code/current-commit.txt"
CURRENT_COMMIT=$(cat "$BACKUP_DIR/code/current-commit.txt")
echo "   当前 commit: $CURRENT_COMMIT"

# 创建代码快照
tar -czf "$BACKUP_DIR/code/code-snapshot.tar.gz" \
    --exclude='node_modules' \
    --exclude='backups' \
    --exclude='logs' \
    .
echo "   ✅ 代码快照已创建"
echo ""

# 2. 备份数据库
echo "2️⃣  备份数据库..."
mysqldump -u root -p'Mes2025!' mes_system > "$BACKUP_DIR/database/mes_system_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/database/mes_system_$TIMESTAMP.sql"
echo "   ✅ 数据库已备份"
echo "   文件：mes_system_$TIMESTAMP.sql.gz"
echo ""

# 3. 备份配置
echo "3️⃣  备份配置文件..."
if [ -f "/opt/mes-system/server/.env" ]; then
    cp /opt/mes-system/server/.env "$BACKUP_DIR/config/"
    echo "   ✅ .env 已备份"
fi

if [ -f "/opt/mes-system/package.json" ]; then
    cp /opt/mes-system/package.json "$BACKUP_DIR/config/"
    echo "   ✅ package.json 已备份"
fi

if [ -f "/opt/mes-system/package-lock.json" ]; then
    cp /opt/mes-system/package-lock.json "$BACKUP_DIR/config/"
    echo "   ✅ package-lock.json 已备份"
fi

# 备份 PM2 配置
echo "$SUDO_PASSWORD" | sudo -S pm2 save 2>/dev/null || true
if [ -f "/root/.pm2/dump.pm2" ]; then
    echo "$SUDO_PASSWORD" | sudo -S cp /root/.pm2/dump.pm2 "$BACKUP_DIR/config/"
    echo "   ✅ PM2 配置已备份"
fi
echo ""

# 4. 备份当前日志
echo "4️⃣  备份当前日志..."
if [ -d "/opt/mes-system/logs" ]; then
    tar -czf "$BACKUP_DIR/logs/logs-backup.tar.gz" /opt/mes-system/logs/ 2>/dev/null || true
    echo "   ✅ 日志已备份"
fi
echo ""

# 5. 创建备份清单
cat > "$BACKUP_DIR/BACKUP_INFO.md" << EOF
# MaxMES 备份信息

**备份时间**: $(date '+%Y-%m-%d %H:%M:%S')
**备份目录**: $BACKUP_DIR

## 备份内容

### 代码
- Git 状态：code/git-status.txt
- Git 日志：code/git-log.txt
- Git 差异：code/git-diff.txt
- 代码快照：code/code-snapshot.tar.gz
- 当前分支：$CURRENT_BRANCH
- 当前 commit: $CURRENT_COMMIT

### 数据库
- 数据库备份：database/mes_system_$TIMESTAMP.sql.gz

### 配置
- .env 文件
- package.json
- package-lock.json
- PM2 配置

### 日志
- 日志备份：logs/logs-backup.tar.gz

## 回退方法

### 方法 1: 快速回退（Git）
\`\`\`bash
cd /opt/mes-system
git reset --hard $CURRENT_COMMIT
npm install
echo '$SUDO_PASSWORD' | sudo -S pm2 restart all
\`\`\`

### 方法 2: 数据库回退
\`\`\`bash
gunzip /opt/mes-system/backups/pre-optimization-*/database/mes_system_$TIMESTAMP.sql.gz
mysql -u root -p'Mes2025!' mes_system < /opt/mes-system/backups/pre-optimization-*/database/mes_system_$TIMESTAMP.sql
\`\`\`

### 方法 3: 完整回退
\`\`\`bash
# 1. 停止服务
echo '$SUDO_PASSWORD' | sudo -S pm2 stop all

# 2. 恢复代码
cd /opt/mes-system
git reset --hard $CURRENT_COMMIT
npm install

# 3. 恢复数据库
gunzip $BACKUP_DIR/database/mes_system_$TIMESTAMP.sql.gz
mysql -u root -p'Mes2025!' mes_system < $BACKUP_DIR/database/mes_system_$TIMESTAMP.sql

# 4. 恢复配置
cp $BACKUP_DIR/config/.env /opt/mes-system/server/.env
cp $BACKUP_DIR/config/package.json /opt/mes-system/

# 5. 重启服务
echo '$SUDO_PASSWORD' | sudo -S pm2 restart all
\`\`\`

## 测试验证

回退后执行以下测试：
1. 访问首页：http://192.168.100.6
2. 访问 API: http://192.168.100.6/api/health
3. 检查 PM2 状态：pm2 status
4. 查看日志：tail -50 /opt/mes-system/logs/server.log

---

**备份者**: MaxMES Backup Script
**联系方式**: admin@example.com
EOF

echo "5️⃣  备份清单已创建"
echo ""

# 6. 显示备份摘要
echo "======================================"
echo "✅ 备份完成！"
echo "======================================"
echo ""
echo "📦 备份位置：$BACKUP_DIR"
echo ""
echo "📊 备份内容:"
echo "  - 代码快照 ✅"
echo "  - Git 状态 ✅"
echo "  - 数据库备份 ✅"
echo "  - 配置文件 ✅"
echo "  - 日志备份 ✅"
echo "  - 备份清单 ✅"
echo ""
echo "📋 当前状态:"
echo "  - 分支：$CURRENT_BRANCH"
echo "  - Commit: $CURRENT_COMMIT"
echo ""
echo "🔄 回退方法:"
echo "  1. 快速回退：git reset --hard $CURRENT_COMMIT"
echo "  2. 查看清单：cat $BACKUP_DIR/BACKUP_INFO.md"
echo ""
echo "📄 详细信息：$BACKUP_DIR/BACKUP_INFO.md"
echo ""
