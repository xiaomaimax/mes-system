# MES系统 - 维护和故障排查指南

## 📋 目录

1. [日常维护](#日常维护)
2. [监控和告警](#监控和告警)
3. [备份和恢复](#备份和恢复)
4. [性能调优](#性能调优)
5. [常见问题](#常见问题)
6. [应急处理](#应急处理)

---

## 日常维护

### 1. 每日检查清单

```bash
#!/bin/bash
# 每日检查脚本 - daily-check.sh

echo "=== MES系统每日检查 ==="
echo ""

# 检查应用状态
echo "1. 检查应用状态..."
pm2 status

# 检查系统资源
echo ""
echo "2. 检查系统资源..."
echo "内存使用："
free -h | grep Mem
echo "磁盘使用："
df -h | grep -E "/$|/home"

# 检查服务状态
echo ""
echo "3. 检查服务状态..."
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "MySQL: $(sudo systemctl is-active mysql)"

# 检查API
echo ""
echo "4. 检查API健康状态..."
curl -s http://localhost:5000/api/health | grep -o '"status":"[^"]*"'

# 检查错误日志
echo ""
echo "5. 检查错误日志..."
echo "应用错误数："
pm2 logs mes-api --err | wc -l
echo "Nginx错误数："
sudo grep -c "error" /var/log/nginx/error.log 2>/dev/null || echo "0"

echo ""
echo "=== 检查完成 ==="
```

### 2. 每周维护任务

```bash
# 每周一次的维护任务

# 1. 更新系统包
sudo apt update && sudo apt upgrade -y

# 2. 清理日志
sudo journalctl --vacuum=7d
sudo find /var/log -type f -name "*.log" -mtime +7 -delete

# 3. 清理npm缓存
npm cache clean --force

# 4. 检查磁盘碎片
sudo fstrim -v /

# 5. 验证备份
ls -lh /home/mesapp/backups/ | tail -5
```

### 3. 每月维护任务

```bash
# 每月一次的维护任务

# 1. 更新依赖包
npm update
cd client && npm update && cd ..

# 2. 检查安全漏洞
npm audit

# 3. 优化数据库
mysql -u mes_user -p mes_system << EOF
OPTIMIZE TABLE users;
OPTIMIZE TABLE production_orders;
OPTIMIZE TABLE quality_inspections;
OPTIMIZE TABLE equipment;
EOF

# 4. 检查磁盘使用
du -sh /home/mesapp/*

# 5. 验证备份完整性
tar -tzf /home/mesapp/backups/mes-system-code-*.tar.gz | head -20
```

---

## 监控和告警

### 1. 实时监控脚本

```bash
#!/bin/bash
# 实时监控脚本 - monitor.sh

ALERT_EMAIL="admin@example.com"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=80
ALERT_THRESHOLD_DISK=90

# 检查CPU使用率
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2)}')
if [ $CPU_USAGE -gt $ALERT_THRESHOLD_CPU ]; then
    echo "警告：CPU使用率过高 ($CPU_USAGE%)" | mail -s "MES系统告警" $ALERT_EMAIL
fi

# 检查内存使用率
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt $ALERT_THRESHOLD_MEM ]; then
    echo "警告：内存使用率过高 ($MEM_USAGE%)" | mail -s "MES系统告警" $ALERT_EMAIL
fi

# 检查磁盘使用率
DISK_USAGE=$(df / | awk 'NR==2 {print int($5)}')
if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
    echo "警告：磁盘使用率过高 ($DISK_USAGE%)" | mail -s "MES系统告警" $ALERT_EMAIL
fi

# 检查应用状态
if ! curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "警告：API服务不可用" | mail -s "MES系统告警" $ALERT_EMAIL
    pm2 restart mes-api
fi

# 检查MySQL连接
if ! mysql -u mes_user -p'password' -e "SELECT 1" > /dev/null 2>&1; then
    echo "警告：MySQL连接失败" | mail -s "MES系统告警" $ALERT_EMAIL
fi
```

### 2. 配置Crontab定时任务

```bash
# 编辑crontab
crontab -e

# 添加以下任务：

# 每5分钟检查一次系统健康状态
*/5 * * * * /home/mesapp/monitor.sh

# 每天凌晨2点备份数据库
0 2 * * * /home/mesapp/backup-database.sh

# 每周一凌晨3点备份应用代码
0 3 * * 1 /home/mesapp/backup-code.sh

# 每天早上8点检查系统
0 8 * * * /home/mesapp/daily-check.sh

# 每月1号检查更新
0 0 1 * * sudo apt update && sudo apt upgrade -y
```

### 3. 日志监控

```bash
# 实时查看应用日志
pm2 logs mes-api

# 查看最后100行日志
pm2 logs mes-api --lines 100

# 查看错误日志
pm2 logs mes-api --err

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MySQL日志
sudo tail -f /var/log/mysql/error.log

# 搜索特定错误
grep "ERROR" /home/mesapp/mes-system/logs/*.log
```

---

## 备份和恢复

### 1. 数据库备份

```bash
#!/bin/bash
# 数据库备份脚本 - backup-database.sh

BACKUP_DIR="/home/mesapp/backups"
DB_USER="mes_user"
DB_PASSWORD="your_password"
DB_NAME="mes_system"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mes_system_$BACKUP_DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 记录备份日志
echo "$(date): 备份完成 - $BACKUP_FILE.gz" >> $BACKUP_DIR/backup.log

# 验证备份
if [ -f "$BACKUP_FILE.gz" ]; then
    echo "备份成功"
else
    echo "备份失败" | mail -s "MES系统备份失败" admin@example.com
fi
```

### 2. 应用代码备份

```bash
#!/bin/bash
# 代码备份脚本 - backup-code.sh

BACKUP_DIR="/home/mesapp/backups"
PROJECT_DIR="/home/mesapp/mes-system"
BACKUP_DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/mes-system-code-$BACKUP_DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
tar -czf $BACKUP_FILE \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=client/build \
    --exclude=logs \
    --exclude=.env \
    -C /home/mesapp mes-system

# 删除30天前的备份
find $BACKUP_DIR -name "mes-system-code-*.tar.gz" -mtime +30 -delete

# 记录备份日志
echo "$(date): 代码备份完成 - $BACKUP_FILE" >> $BACKUP_DIR/backup.log

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    echo "备份成功"
else
    echo "备份失败" | mail -s "MES系统代码备份失败" admin@example.com
fi
```

### 3. 数据库恢复

```bash
# 列出备份文件
ls -lh /home/mesapp/backups/

# 解压备份
gunzip /home/mesapp/backups/mes_system_20240115_020000.sql.gz

# 恢复数据库
mysql -u mes_user -p mes_system < /home/mesapp/backups/mes_system_20240115_020000.sql

# 验证恢复
mysql -u mes_user -p mes_system -e "SELECT COUNT(*) FROM users;"

# 恢复后重启应用
pm2 restart mes-api
```

### 4. 应用代码恢复

```bash
# 列出备份文件
ls -lh /home/mesapp/backups/mes-system-code-*.tar.gz

# 备份当前代码
mv /home/mesapp/mes-system /home/mesapp/mes-system.backup

# 解压备份
tar -xzf /home/mesapp/backups/mes-system-code-20240115.tar.gz -C /home/mesapp

# 重新安装依赖
cd /home/mesapp/mes-system
npm install
cd client && npm install && cd ..

# 重新构建前端
npm run build

# 重启应用
pm2 restart mes-api
```

---

## 性能调优

### 1. Node.js优化

```bash
# 编辑ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mes-api',
      script: './server/app.js',
      instances: 'max',  // 使用所有CPU核心
      exec_mode: 'cluster',  // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        NODE_OPTIONS: '--max-old-space-size=2048'  // 增加内存限制
      },
      max_memory_restart: '1G',  // 内存超过1G时重启
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'client/build', 'logs']
    }
  ]
};
EOF

# 应用配置
pm2 start ecosystem.config.js
```

### 2. MySQL优化

```bash
# 编辑MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加以下优化配置
[mysqld]
# 连接配置
max_connections = 1000
max_allowed_packet = 256M

# 缓冲池配置
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M

# 查询缓存
query_cache_size = 256M
query_cache_type = 1

# 其他优化
tmp_table_size = 256M
max_heap_table_size = 256M
sort_buffer_size = 4M
bulk_insert_buffer_size = 16M

# 重启MySQL
sudo systemctl restart mysql
```

### 3. Nginx优化

```bash
# 编辑Nginx配置
sudo nano /etc/nginx/nginx.conf

# 添加以下优化配置
user www-data;
worker_processes auto;  # 自动检测CPU核心数
worker_rlimit_nofile 65535;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # 基本配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout invalid_header updating;

    # 重启Nginx
    # sudo systemctl restart nginx
}
```

### 4. 数据库查询优化

```bash
# 查看慢查询日志
sudo tail -f /var/log/mysql/slow.log

# 启用慢查询日志
sudo mysql -u root -p << EOF
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
EOF

# 分析查询性能
mysql -u mes_user -p mes_system << EOF
EXPLAIN SELECT * FROM production_orders WHERE status = 'in_progress';
EOF

# 创建索引优化查询
mysql -u mes_user -p mes_system << EOF
CREATE INDEX idx_status ON production_orders(status);
CREATE INDEX idx_created_at ON production_orders(created_at);
EOF
```

---

## 常见问题

### Q1: 应用无法启动

**症状**: PM2显示应用已停止或崩溃

**排查步骤**:
```bash
# 1. 查看错误日志
pm2 logs mes-api --err

# 2. 直接运行应用查看错误
node server/app.js

# 3. 检查环境变量
cat .env

# 4. 检查依赖
npm list

# 5. 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

**解决方案**:
- 检查.env文件配置是否正确
- 检查数据库连接是否正常
- 检查端口是否被占用
- 查看应用日志中的具体错误信息

### Q2: 数据库连接失败

**症状**: 应用日志显示"Cannot connect to database"

**排查步骤**:
```bash
# 1. 检查MySQL服务
sudo systemctl status mysql

# 2. 测试连接
mysql -h localhost -u mes_user -p mes_system -e "SELECT 1;"

# 3. 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log

# 4. 检查MySQL监听端口
sudo netstat -tlnp | grep mysql

# 5. 检查防火墙规则
sudo ufw status
```

**解决方案**:
- 启动MySQL服务：`sudo systemctl start mysql`
- 检查数据库用户和密码是否正确
- 检查数据库是否存在
- 检查防火墙是否阻止了连接

### Q3: 前端无法访问

**症状**: 浏览器无法打开应用或显示错误

**排查步骤**:
```bash
# 1. 检查Nginx状态
sudo systemctl status nginx

# 2. 测试Nginx配置
sudo nginx -t

# 3. 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 4. 检查前端构建文件
ls -la client/build/

# 5. 测试API连接
curl http://localhost:5000/api/health
```

**解决方案**:
- 启动Nginx：`sudo systemctl start nginx`
- 重新构建前端：`npm run build`
- 检查Nginx配置中的路径是否正确
- 检查防火墙是否阻止了80/443端口

### Q4: 内存占用过高

**症状**: 系统变慢，PM2显示内存占用接近限制

**排查步骤**:
```bash
# 1. 查看内存使用
free -h

# 2. 查看进程内存占用
ps aux --sort=-%mem | head -10

# 3. 查看PM2应用内存
pm2 monit

# 4. 查看数据库内存占用
mysql -u mes_user -p mes_system -e "SHOW PROCESSLIST;"
```

**解决方案**:
- 增加PM2内存限制：`pm2 start server/app.js --max-memory-restart 2G`
- 优化数据库查询
- 清理日志文件
- 增加服务器内存

### Q5: 磁盘空间不足

**症状**: 应用无法写入日志，数据库无法写入数据

**排查步骤**:
```bash
# 1. 查看磁盘使用
df -h

# 2. 查看各目录大小
du -sh /home/mesapp/*

# 3. 查看日志文件大小
du -sh /var/log/*
du -sh /home/mesapp/mes-system/logs/*
```

**解决方案**:
- 清理旧日志：`sudo rm -rf /var/log/nginx/*.log*`
- 清理备份文件：`find /home/mesapp/backups -mtime +30 -delete`
- 清理npm缓存：`npm cache clean --force`
- 扩展磁盘空间

---

## 应急处理

### 1. 应用崩溃恢复

```bash
# 立即重启应用
pm2 restart mes-api

# 如果仍然无法启动，查看详细错误
pm2 logs mes-api --err

# 回滚到上一个版本
cd /home/mesapp
rm -rf mes-system
tar -xzf backups/mes-system-code-*.tar.gz

# 重新启动
cd mes-system
npm install
npm run build
pm2 start ecosystem.config.js
```

### 2. 数据库故障恢复

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 重启MySQL
sudo systemctl restart mysql

# 如果仍然无法启动，查看错误日志
sudo tail -f /var/log/mysql/error.log

# 从备份恢复
mysql -u mes_user -p mes_system < backups/mes_system_latest.sql

# 验证数据
mysql -u mes_user -p mes_system -e "SELECT COUNT(*) FROM users;"
```

### 3. 磁盘满恢复

```bash
# 紧急清理
sudo rm -rf /var/log/nginx/*.log*
sudo rm -rf /var/log/mysql/*.log*
sudo rm -rf /home/mesapp/mes-system/logs/*

# 清理旧备份
find /home/mesapp/backups -mtime +7 -delete

# 清理npm缓存
npm cache clean --force

# 检查磁盘空间
df -h
```

### 4. 内存溢出恢复

```bash
# 查看内存占用
free -h

# 杀死占用内存最多的进程
ps aux --sort=-%mem | head -5
kill -9 <PID>

# 重启应用
pm2 restart mes-api

# 增加内存限制
pm2 start server/app.js --max-memory-restart 2G
```

### 5. 网络故障恢复

```bash
# 检查网络连接
ping 8.8.8.8

# 检查DNS
nslookup google.com

# 重启网络
sudo systemctl restart networking

# 检查防火墙
sudo ufw status

# 重启Nginx
sudo systemctl restart nginx
```

---

## 📞 获取帮助

- 查看详细部署指南：`UBUNTU_DEPLOYMENT_GUIDE.md`
- 查看快速开始指南：`DEPLOYMENT_QUICK_START.md`
- 查看项目README：`README.md`
- 提交问题：https://github.com/xiaomaimax/maxmes/issues

---

**最后更新**: 2024-01-15
**维护者**: MES系统团队
