# MES制造执行系统 - Ubuntu服务器部署指南

## 📋 目录

1. [系统要求](#系统要求)
2. [前置准备](#前置准备)
3. [环境安装](#环境安装)
4. [项目部署](#项目部署)
5. [数据库配置](#数据库配置)
6. [应用启动](#应用启动)
7. [Nginx反向代理](#nginx反向代理)
8. [系统监控](#系统监控)
9. [备份与恢复](#备份与恢复)
10. [故障排查](#故障排查)

---

## 系统要求

### 硬件要求
- **CPU**: 2核或以上
- **内存**: 4GB或以上（建议8GB）
- **磁盘**: 50GB或以上（根据数据量调整）
- **网络**: 稳定的网络连接

### 软件要求
- **操作系统**: Ubuntu 20.04 LTS 或 Ubuntu 22.04 LTS
- **Node.js**: v18.0 或以上
- **MySQL**: 8.0 或以上
- **Nginx**: 最新稳定版本（可选，用于反向代理）

### 系统用户
建议创建专用用户运行应用，而不是使用root用户

---

## 前置准备

### 1. 更新系统包

```bash
# 更新包管理器
sudo apt update
sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git build-essential
```

### 2. 创建应用用户

```bash
# 创建专用用户（推荐）mesapp/mesapp
sudo useradd -m -s /bin/bash mesapp
sudo passwd mesapp


# 为用户添加sudo权限（可选）
sudo usermod -aG sudo mesapp

# 切换到新用户
sudo su - mesapp
```

### 3. 配置SSH密钥（可选但推荐）

```bash
# 生成SSH密钥对
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# 配置SSH免密登录（在本地机器上执行）
ssh-copy-id -i ~/.ssh/id_rsa.pub mesapp@your_server_ip
```

---

## 环境安装

### 1. 安装Node.js

```bash
# 方法一：使用NodeSource官方仓库（推荐）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 更新npm到最新版本
sudo npm install -g npm@latest
```

### 2. 安装MySQL 8.0

```bash
# 安装MySQL服务器
sudo apt install -y mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 验证MySQL运行状态
sudo systemctl status mysql

# 初始化MySQL（安全配置）
sudo mysql_secure_installation
```

**MySQL安全配置步骤**：
```
- 设置root密码：输入 y，然后设置强密码

# 使用sudo免密登录
sudo mysql -u root

# 在MySQL命令行中执行：
ALTER USER 'root'@'localhost' IDENTIFIED BY 'maxmes';
FLUSH PRIVILEGES;
exit;

#验证
mysql -u root -p 然后输入新密码测试

- 移除匿名用户：输入 y
- 禁用root远程登录：输入 N
- 移除测试数据库：输入 y
- 重新加载权限表：输入 y
```

### 3. 创建MySQL用户和数据库

```bash
# 登录MySQL
sudo mysql -u root -p

# 在MySQL命令行中执行以下命令
CREATE DATABASE mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'maxmes'@'localhost' IDENTIFIED BY 'xiaomai@2015';

GRANT ALL PRIVILEGES ON mes_system.* TO 'maxmes'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

**注意**: 将 `strong_password_here` 替换为强密码

### 4. 安装Nginx（可选，用于反向代理）

```bash
# 安装Nginx
sudo apt install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证Nginx运行状态
sudo systemctl status nginx
```

### 5. 安装PM2（进程管理工具）

```bash
# 全局安装PM2
sudo npm install -g pm2

# 配置PM2开机自启
sudo pm2 startup
sudo pm2 save

# 验证PM2安装
pm2 --version
```

---




## 项目部署

### 1. 克隆项目代码

```bash
# 进入应用目录
cd /home/mesapp

# 克隆项目（使用HTTPS）
git clone https://github.com/xiaomaimax/maxmes.git mes-system

# 进入项目目录
cd mes-system

# 查看项目结构
ls -la
```

### 2. 配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑环境配置
nano .env
```

**编辑 `.env` 文件内容**：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=strong_password_here

# JWT密钥（生成强密钥）
JWT_SECRET=your_very_long_random_secret_key_here_change_this_in_production

# 服务器配置
PORT=5000
NODE_ENV=production

# CORS配置（前端地址）
CORS_ORIGIN=http://your_server_ip:3000

# 日志级别
LOG_LEVEL=info
```

**生成强JWT密钥**：
```bash
# 使用openssl生成
openssl rand -base64 32
```

### 3. 安装项目依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 验证依赖安装
npm list --depth=0
```

### 4. 初始化数据库

```bash
# 导入数据库初始化脚本
mysql -u mes_user -p mes_system < database/init.sql

# 输入MySQL用户密码后，等待脚本执行完成

# 验证数据库初始化
mysql -u mes_user -p mes_system -e "SHOW TABLES;"
```

### 5. 构建前端应用

```bash
# 构建React前端应用
npm run build

# 验证构建结果
ls -la client/build/
```

---

## 数据库配置

### 1. 验证数据库连接

```bash
# 测试MySQL连接
mysql -h localhost -u mes_user -p mes_system -e "SELECT VERSION();"

# 查看数据库中的表
mysql -u mes_user -p mes_system -e "SHOW TABLES;"
```

### 2. 创建数据库备份用户

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建备份用户
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'backup_password';

# 授予备份权限
GRANT SELECT, LOCK TABLES ON mes_system.* TO 'backup_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

### 3. 配置MySQL远程访问（如需要）

```bash
# 编辑MySQL配置文件
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 找到 bind-address 行，修改为：
# bind-address = 0.0.0.0

# 重启MySQL
sudo systemctl restart mysql

# 创建远程访问用户
sudo mysql -u root -p

CREATE USER 'mes_user'@'%' IDENTIFIED BY 'strong_password_here';

GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'%';

FLUSH PRIVILEGES;

EXIT;
```

---

## 应用启动

### 1. 使用PM2启动应用

```bash
# 进入项目目录
cd /home/mesapp/mes-system

# 使用PM2启动应用
pm2 start server/app.js --name "mes-api" --env production

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs mes-api

# 保存PM2配置
pm2 save
```

### 2. 创建PM2配置文件（推荐）

```bash
# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mes-api',
      script: './server/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'client/build', 'logs']
    }
  ]
};
EOF

# 使用配置文件启动
pm2 start ecosystem.config.js

# 保存配置
pm2 save
```

### 3. 验证应用运行

```bash
# 检查应用状态
pm2 status

# 查看应用日志
pm2 logs mes-api --lines 50

# 测试API健康检查
curl http://localhost:5000/api/health

# 预期输出：
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","uptime":123.45,"environment":"production"}
```

### 4. 配置开机自启

```bash
# 生成PM2启动脚本
sudo pm2 startup systemd -u mesapp --hp /home/mesapp

# 保存PM2配置
pm2 save

# 验证开机自启配置
sudo systemctl status pm2-mesapp
```

---

## Nginx反向代理

### 1. 创建Nginx配置文件

```bash
# 创建MES系统的Nginx配置
sudo nano /etc/nginx/sites-available/mes-system
```

**配置文件内容**：

```nginx
# HTTP重定向到HTTPS（可选）
server {
    listen 80;
    server_name your_domain_or_ip;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name your_domain_or_ip;

    # SSL证书配置（如使用HTTPS）
    # ssl_certificate /etc/letsencrypt/live/your_domain/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your_domain/privkey.pem;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;

    # 日志配置
    access_log /var/log/nginx/mes-access.log;
    error_log /var/log/nginx/mes-error.log;

    # 客户端上传文件大小限制
    client_max_body_size 100M;

    # 前端静态文件
    location / {
        root /home/mesapp/mes-system/client/build;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # 代理头配置
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲配置
        proxy_buffering off;
    }

    # WebSocket支持
    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
```

### 2. 启用Nginx配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/mes-system /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 验证Nginx状态
sudo systemctl status nginx
```

### 3. 配置SSL证书（使用Let's Encrypt）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot certonly --nginx -d your_domain

# 自动续期配置
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 验证续期配置
sudo systemctl status certbot.timer
```

---

## 系统监控

### 1. 配置日志收集

```bash
# 创建日志目录
mkdir -p /home/mesapp/mes-system/logs

# 设置日志权限
chmod 755 /home/mesapp/mes-system/logs

# 查看应用日志
pm2 logs mes-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/mes-access.log
sudo tail -f /var/log/nginx/mes-error.log
```

### 2. 配置日志轮转

```bash
# 创建logrotate配置
sudo nano /etc/logrotate.d/mes-system
```

**配置内容**：

```
/home/mesapp/mes-system/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 mesapp mesapp
    sharedscripts
    postrotate
        pm2 reload mes-api > /dev/null 2>&1 || true
    endscript
}

/var/log/nginx/mes-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 3. 监控系统资源

```bash
# 安装系统监控工具
sudo apt install -y htop iotop

# 实时监控系统资源
htop

# 监控磁盘I/O
sudo iotop

# 查看磁盘使用情况
df -h

# 查看内存使用情况
free -h

# 查看进程信息
ps aux | grep node
```

### 4. 配置告警脚本（可选）

```bash
# 创建监控脚本
cat > /home/mesapp/check-health.sh << 'EOF'
#!/bin/bash

# 检查API健康状态
API_STATUS=$(curl -s http://localhost:5000/api/health | grep -o '"status":"ok"')

if [ -z "$API_STATUS" ]; then
    echo "警告：API服务不可用"
    # 可以在这里添加邮件通知或其他告警方式
    pm2 restart mes-api
fi

# 检查MySQL连接
mysql -u mes_user -p'password' -e "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "警告：MySQL连接失败"
    # 可以在这里添加邮件通知或其他告警方式
fi

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $DISK_USAGE -gt 90 ]; then
    echo "警告：磁盘使用率超过90%"
    # 可以在这里添加邮件通知或其他告警方式
fi
EOF

# 添加执行权限
chmod +x /home/mesapp/check-health.sh

# 添加到crontab定时执行（每5分钟检查一次）
crontab -e

# 在crontab中添加以下行：
# */5 * * * * /home/mesapp/check-health.sh
```

---

## 备份与恢复

### 1. 数据库备份

```bash
# 创建备份目录
mkdir -p /home/mesapp/backups

# 手动备份数据库
mysqldump -u mes_user -p mes_system > /home/mesapp/backups/mes_system_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件
gzip /home/mesapp/backups/mes_system_*.sql
```

### 2. 自动备份脚本

```bash
# 创建自动备份脚本
cat > /home/mesapp/backup-database.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/mesapp/backups"
DB_USER="mes_user"
DB_PASSWORD="your_password"
DB_NAME="mes_system"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mes_system_$BACKUP_DATE.sql"

# 创建备份
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "备份完成：$BACKUP_FILE.gz"
EOF

# 添加执行权限
chmod +x /home/mesapp/backup-database.sh

# 添加到crontab定时执行（每天凌晨2点备份）
crontab -e

# 在crontab中添加以下行：
# 0 2 * * * /home/mesapp/backup-database.sh
```

### 3. 数据库恢复

```bash
# 列出备份文件
ls -lh /home/mesapp/backups/

# 解压备份文件
gunzip /home/mesapp/backups/mes_system_20240115_020000.sql.gz

# 恢复数据库
mysql -u mes_user -p mes_system < /home/mesapp/backups/mes_system_20240115_020000.sql

# 验证恢复
mysql -u mes_user -p mes_system -e "SELECT COUNT(*) FROM users;"
```

### 4. 应用代码备份

```bash
# 备份应用代码
tar -czf /home/mesapp/backups/mes-system-code-$(date +%Y%m%d).tar.gz \
    /home/mesapp/mes-system \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=client/build \
    --exclude=logs

# 验证备份
tar -tzf /home/mesapp/backups/mes-system-code-*.tar.gz | head -20
```

---

## 故障排查

### 1. 应用无法启动

```bash
# 查看PM2日志
pm2 logs mes-api --err

# 查看应用错误
pm2 show mes-api

# 检查端口占用
sudo lsof -i :5000

# 检查Node.js进程
ps aux | grep node

# 重启应用
pm2 restart mes-api

# 如果仍然无法启动，查看详细错误
node server/app.js
```

### 2. 数据库连接失败

```bash
# 测试MySQL连接
mysql -h localhost -u mes_user -p mes_system -e "SELECT 1;"

# 检查MySQL服务状态
sudo systemctl status mysql

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log

# 重启MySQL
sudo systemctl restart mysql

# 检查MySQL监听端口
sudo netstat -tlnp | grep mysql
```

### 3. 前端无法访问

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 测试Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查前端构建文件
ls -la /home/mesapp/mes-system/client/build/

# 重新构建前端
cd /home/mesapp/mes-system
npm run build

# 重启Nginx
sudo systemctl restart nginx
```

### 4. 内存不足

```bash
# 查看内存使用情况
free -h

# 查看进程内存占用
ps aux --sort=-%mem | head -10

# 查看PM2应用内存占用
pm2 monit

# 增加PM2应用内存限制
pm2 start server/app.js --max-memory-restart 1G

# 清理系统缓存
sudo sync; sudo echo 3 > /proc/sys/vm/drop_caches
```

### 5. 磁盘空间不足

```bash
# 查看磁盘使用情况
df -h

# 查看各目录大小
du -sh /home/mesapp/*

# 清理日志文件
sudo rm -rf /var/log/nginx/*.log*
sudo rm -rf /home/mesapp/mes-system/logs/*

# 清理npm缓存
npm cache clean --force

# 清理旧的备份文件
find /home/mesapp/backups -name "*.sql.gz" -mtime +30 -delete
```

### 6. API响应缓慢

```bash
# 查看应用日志
pm2 logs mes-api

# 检查数据库查询性能
mysql -u mes_user -p mes_system -e "SHOW PROCESSLIST;"

# 查看MySQL慢查询日志
sudo tail -f /var/log/mysql/slow.log

# 检查系统资源
htop

# 增加Node.js进程数
pm2 start ecosystem.config.js -i max

# 优化MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

---

## 性能优化建议

### 1. Node.js优化

```bash
# 在ecosystem.config.js中配置集群模式
instances: 'max',  # 使用所有CPU核心
exec_mode: 'cluster',  # 集群模式

# 增加内存限制
max_memory_restart: '1G'
```

### 2. MySQL优化

```bash
# 编辑MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加以下优化配置
[mysqld]
max_connections = 1000
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
query_cache_size = 256M
query_cache_type = 1
```

### 3. Nginx优化

```bash
# 编辑Nginx配置
sudo nano /etc/nginx/nginx.conf

# 添加以下优化配置
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css text/javascript application/json;
```

---

## 安全建议

### 1. 防火墙配置

```bash
# 启用UFW防火墙
sudo ufw enable

# 允许SSH连接
sudo ufw allow 22/tcp

# 允许HTTP
sudo ufw allow 80/tcp

# 允许HTTPS
sudo ufw allow 443/tcp

# 允许MySQL（仅本地）
sudo ufw allow from 127.0.0.1 to any port 3306

# 查看防火墙规则
sudo ufw status
```

### 2. 文件权限

```bash
# 设置应用目录权限
sudo chown -R mesapp:mesapp /home/mesapp/mes-system
sudo chmod -R 755 /home/mesapp/mes-system

# 设置敏感文件权限
sudo chmod 600 /home/mesapp/mes-system/.env
sudo chmod 600 /home/mesapp/backups/*
```

### 3. 定期更新

```bash
# 更新系统包
sudo apt update
sudo apt upgrade -y

# 更新Node.js依赖
npm update

# 检查安全漏洞
npm audit

# 修复安全漏洞
npm audit fix
```

---

## 常用命令速查表

| 操作 | 命令 |
|------|------|
| 启动应用 | `pm2 start ecosystem.config.js` |
| 停止应用 | `pm2 stop mes-api` |
| 重启应用 | `pm2 restart mes-api` |
| 查看应用状态 | `pm2 status` |
| 查看应用日志 | `pm2 logs mes-api` |
| 启动Nginx | `sudo systemctl start nginx` |
| 重启Nginx | `sudo systemctl restart nginx` |
| 查看Nginx状态 | `sudo systemctl status nginx` |
| 启动MySQL | `sudo systemctl start mysql` |
| 重启MySQL | `sudo systemctl restart mysql` |
| 查看MySQL状态 | `sudo systemctl status mysql` |
| 备份数据库 | `mysqldump -u mes_user -p mes_system > backup.sql` |
| 恢复数据库 | `mysql -u mes_user -p mes_system < backup.sql` |
| 查看系统资源 | `htop` |
| 查看磁盘使用 | `df -h` |
| 查看内存使用 | `free -h` |

---

## 部署检查清单

部署完成后，请按照以下清单进行检查：

- [ ] Node.js已安装并验证版本
- [ ] MySQL已安装并启动
- [ ] 数据库和用户已创建
- [ ] 项目代码已克隆
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 数据库已初始化
- [ ] 前端已构建
- [ ] PM2已配置并启动应用
- [ ] Nginx已配置并启动
- [ ] API健康检查通过
- [ ] 前端可以访问
- [ ] 数据库备份脚本已配置
- [ ] 日志轮转已配置
- [ ] 防火墙已配置
- [ ] SSL证书已配置（如使用HTTPS）
- [ ] 监控脚本已配置
- [ ] 开机自启已配置

---

## 获取帮助

如遇到问题，请按照以下步骤排查：

1. 查看应用日志：`pm2 logs mes-api`
2. 查看Nginx日志：`sudo tail -f /var/log/nginx/error.log`
3. 查看MySQL日志：`sudo tail -f /var/log/mysql/error.log`
4. 检查系统资源：`htop`
5. 测试API连接：`curl http://localhost:5000/api/health`
6. 查看本文档的"故障排查"部分

---

## 更新日志

- **v1.0** (2024-01-15): 初始版本，包含完整的部署指南

---

**最后更新**: 2024-01-15
**维护者**: MES系统团队
