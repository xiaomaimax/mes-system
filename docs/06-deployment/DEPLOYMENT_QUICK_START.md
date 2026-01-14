# MES系统部署 - 快速开始指南

## 🚀 5分钟快速部署

### 前置条件
- Ubuntu 20.04 LTS 或 Ubuntu 22.04 LTS
- 至少4GB内存
- 至少50GB磁盘空间
- 网络连接正常

### 一键部署

```bash
# 1. 下载部署脚本
wget https://your-repo/deploy.sh
chmod +x deploy.sh

# 2. 运行部署脚本
./deploy.sh

# 3. 按照提示输入必要信息
# - MySQL root密码
# - MES数据库用户密码
# - 服务器IP或域名
```

### 手动部署（分步骤）

#### 第1步：系统准备（5分钟）

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git build-essential
```

#### 第2步：安装Node.js（3分钟）

```bash
# 添加NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装Node.js
sudo apt install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 8.x.x 或更高
```

#### 第3步：安装MySQL（5分钟）

```bash
# 安装MySQL
sudo apt install -y mysql-server

# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p << EOF
CREATE DATABASE mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mes_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

#### 第4步：部署应用（10分钟）

```bash
# 克隆项目
git clone https://github.com/xiaomaimax/maxmes.git mes-system
cd mes-system

# 配置环境变量
cp .env.example .env

# 编辑.env文件
nano .env

# 关键配置项：
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=mes_system
# DB_USER=mes_user
# DB_PASSWORD=your_strong_password
# JWT_SECRET=your_jwt_secret_key
# NODE_ENV=production
# PORT=5000

# 安装依赖
npm install
cd client && npm install && cd ..

# 初始化数据库
mysql -u mes_user -p mes_system < database/init.sql

# 构建前端
npm run build
```

#### 第5步：启动应用（5分钟）

```bash
# 安装PM2
sudo npm install -g pm2

# 启动应用
pm2 start server/app.js --name "mes-api"

# 配置开机自启
pm2 startup
pm2 save

# 验证应用运行
curl http://localhost:5000/api/health
```

#### 第6步：配置Nginx（5分钟）

```bash
# 安装Nginx
sudo apt install -y nginx

# 创建Nginx配置
sudo nano /etc/nginx/sites-available/mes-system

# 复制以下内容到配置文件：
```

```nginx
server {
    listen 80;
    server_name your_server_ip_or_domain;

    location / {
        root /home/mesapp/mes-system/client/build;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/mes-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## ✅ 部署验证

部署完成后，按照以下步骤验证：

### 1. 检查服务状态

```bash
# 检查PM2应用
pm2 status

# 检查Nginx
sudo systemctl status nginx

# 检查MySQL
sudo systemctl status mysql
```

### 2. 测试API

```bash
# 健康检查
curl http://localhost:5000/api/health

# 预期输出：
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","uptime":123.45,"environment":"production"}
```

### 3. 访问前端

```
在浏览器中打开：
http://your_server_ip
或
http://your_domain
```

### 4. 测试数据库

```bash
# 连接数据库
mysql -u mes_user -p mes_system

# 查看表
SHOW TABLES;

# 查看用户表
SELECT COUNT(*) FROM users;

# 退出
EXIT;
```

---

## 📊 常用命令

### PM2命令

```bash
# 启动应用
pm2 start server/app.js --name "mes-api"

# 停止应用
pm2 stop mes-api

# 重启应用
pm2 restart mes-api

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs mes-api

# 查看应用详情
pm2 show mes-api

# 删除应用
pm2 delete mes-api

# 监控应用
pm2 monit
```

### Nginx命令

```bash
# 启动Nginx
sudo systemctl start nginx

# 停止Nginx
sudo systemctl stop nginx

# 重启Nginx
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 查看日志
sudo tail -f /var/log/nginx/error.log
```

### MySQL命令

```bash
# 启动MySQL
sudo systemctl start mysql

# 停止MySQL
sudo systemctl stop mysql

# 重启MySQL
sudo systemctl restart mysql

# 连接数据库
mysql -u mes_user -p mes_system

# 备份数据库
mysqldump -u mes_user -p mes_system > backup.sql

# 恢复数据库
mysql -u mes_user -p mes_system < backup.sql
```

---

## 🔧 常见问题

### Q1: 部署脚本执行失败

**A**: 检查以下几点：
- 确保有sudo权限
- 检查网络连接
- 查看错误日志：`cat /var/log/syslog`

### Q2: 数据库连接失败

**A**: 执行以下命令排查：
```bash
# 检查MySQL是否运行
sudo systemctl status mysql

# 测试连接
mysql -u mes_user -p mes_system -e "SELECT 1;"

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log
```

### Q3: 前端无法访问

**A**: 执行以下命令排查：
```bash
# 检查Nginx是否运行
sudo systemctl status nginx

# 测试Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查前端构建文件
ls -la client/build/
```

### Q4: API响应缓慢

**A**: 执行以下命令排查：
```bash
# 查看应用日志
pm2 logs mes-api

# 查看系统资源
htop

# 查看数据库连接
mysql -u mes_user -p mes_system -e "SHOW PROCESSLIST;"
```

### Q5: 内存不足

**A**: 执行以下命令处理：
```bash
# 查看内存使用
free -h

# 查看进程内存占用
ps aux --sort=-%mem | head -10

# 增加PM2内存限制
pm2 start server/app.js --max-memory-restart 1G
```

---

## 📈 性能优化

### 1. 启用集群模式

```bash
# 编辑ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mes-api',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G'
  }]
};
EOF

# 使用配置文件启动
pm2 start ecosystem.config.js
```

### 2. 启用Gzip压缩

```bash
# 编辑Nginx配置
sudo nano /etc/nginx/nginx.conf

# 添加以下配置
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;

# 重启Nginx
sudo systemctl restart nginx
```

### 3. 优化MySQL

```bash
# 编辑MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加以下配置
[mysqld]
max_connections = 1000
innodb_buffer_pool_size = 2G
query_cache_size = 256M
```

---

## 🔐 安全建议

### 1. 配置防火墙

```bash
# 启用UFW
sudo ufw enable

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP
sudo ufw allow 80/tcp

# 允许HTTPS
sudo ufw allow 443/tcp

# 查看规则
sudo ufw status
```

### 2. 配置SSL证书

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --nginx -d your_domain

# 自动续期
sudo systemctl enable certbot.timer
```

### 3. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新Node.js依赖
npm update

# 检查安全漏洞
npm audit
```

---

## 📞 获取帮助

- 查看详细文档：`UBUNTU_DEPLOYMENT_GUIDE.md`
- 查看项目README：`README.md`
- 查看API文档：`docs/API.md`
- 提交问题：https://github.com/xiaomaimax/maxmes/issues

---

## 📋 部署检查清单

- [ ] 系统已更新
- [ ] Node.js已安装
- [ ] MySQL已安装并启动
- [ ] 数据库已创建
- [ ] 项目代码已克隆
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 数据库已初始化
- [ ] 前端已构建
- [ ] PM2已启动应用
- [ ] Nginx已配置并启动
- [ ] API健康检查通过
- [ ] 前端可以访问
- [ ] 防火墙已配置
- [ ] 备份脚本已配置

---

**部署完成！祝你使用愉快！** 🎉
