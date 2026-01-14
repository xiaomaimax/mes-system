# MES系统部署检查清单

## 📋 部署前准备

### 系统环境检查
- [ ] 操作系统为Ubuntu 20.04 LTS或22.04 LTS
- [ ] 系统已更新：`sudo apt update && sudo apt upgrade -y`
- [ ] 至少4GB内存可用：`free -h`
- [ ] 至少50GB磁盘空间：`df -h`
- [ ] 网络连接正常：`ping 8.8.8.8`
- [ ] 已创建专用应用用户：`sudo useradd -m -s /bin/bash mesapp`

### 必要工具检查
- [ ] 已安装curl：`curl --version`
- [ ] 已安装wget：`wget --version`
- [ ] 已安装git：`git --version`
- [ ] 已安装build-essential：`gcc --version`

---

## 🔧 环境安装检查

### Node.js安装
- [ ] Node.js已安装：`node --version` (应为v18.x或更高)
- [ ] npm已安装：`npm --version` (应为8.x或更高)
- [ ] npm已更新到最新版本：`sudo npm install -g npm@latest`
- [ ] 全局npm包目录权限正确

### MySQL安装
- [ ] MySQL已安装：`mysql --version`
- [ ] MySQL服务已启动：`sudo systemctl status mysql`
- [ ] MySQL已设置开机自启：`sudo systemctl is-enabled mysql`
- [ ] MySQL安全配置已完成：`sudo mysql_secure_installation`
- [ ] MySQL root密码已设置
- [ ] MySQL监听端口正确：`sudo netstat -tlnp | grep mysql`

### PM2安装
- [ ] PM2已全局安装：`pm2 --version`
- [ ] PM2已配置开机自启：`sudo pm2 startup`
- [ ] PM2配置已保存：`pm2 save`

### Nginx安装
- [ ] Nginx已安装：`nginx -v`
- [ ] Nginx服务已启动：`sudo systemctl status nginx`
- [ ] Nginx已设置开机自启：`sudo systemctl is-enabled nginx`
- [ ] Nginx监听端口正确：`sudo netstat -tlnp | grep nginx`

---

## 📦 数据库配置检查

### 数据库和用户创建
- [ ] 数据库已创建：`mysql -u root -p -e "SHOW DATABASES;" | grep mes_system`
- [ ] 数据库字符集正确：`mysql -u root -p -e "SHOW CREATE DATABASE mes_system;"`
- [ ] 数据库用户已创建：`mysql -u root -p -e "SELECT user FROM mysql.user;" | grep mes_user`
- [ ] 用户权限已授予：`mysql -u root -p -e "SHOW GRANTS FOR 'mes_user'@'localhost';"`
- [ ] 用户可以连接数据库：`mysql -u mes_user -p mes_system -e "SELECT 1;"`

### 数据库初始化
- [ ] 初始化脚本已执行：`mysql -u mes_user -p mes_system < database/init.sql`
- [ ] 数据库表已创建：`mysql -u mes_user -p mes_system -e "SHOW TABLES;" | wc -l`
- [ ] 用户表已创建：`mysql -u mes_user -p mes_system -e "DESCRIBE users;"`
- [ ] 初始数据已加载（如需要）

---

## 🚀 应用部署检查

### 项目代码
- [ ] 项目代码已克隆：`ls -la /home/mesapp/mes-system`
- [ ] 项目目录权限正确：`ls -ld /home/mesapp/mes-system`
- [ ] .git目录存在：`ls -la /home/mesapp/mes-system/.git`

### 环境配置
- [ ] .env文件已创建：`ls -la /home/mesapp/mes-system/.env`
- [ ] .env文件权限正确：`ls -l /home/mesapp/mes-system/.env | grep 600`
- [ ] DB_HOST配置正确：`grep "DB_HOST" /home/mesapp/mes-system/.env`
- [ ] DB_PORT配置正确：`grep "DB_PORT" /home/mesapp/mes-system/.env`
- [ ] DB_NAME配置正确：`grep "DB_NAME" /home/mesapp/mes-system/.env`
- [ ] DB_USER配置正确：`grep "DB_USER" /home/mesapp/mes-system/.env`
- [ ] DB_PASSWORD配置正确：`grep "DB_PASSWORD" /home/mesapp/mes-system/.env`
- [ ] JWT_SECRET已设置：`grep "JWT_SECRET" /home/mesapp/mes-system/.env`
- [ ] NODE_ENV设置为production：`grep "NODE_ENV=production" /home/mesapp/mes-system/.env`
- [ ] PORT设置为5000：`grep "PORT=5000" /home/mesapp/mes-system/.env`

### 依赖安装
- [ ] 后端依赖已安装：`ls -la /home/mesapp/mes-system/node_modules | head -5`
- [ ] 前端依赖已安装：`ls -la /home/mesapp/mes-system/client/node_modules | head -5`
- [ ] package-lock.json存在：`ls -la /home/mesapp/mes-system/package-lock.json`
- [ ] 依赖安装无错误：`npm list --depth=0`

### 前端构建
- [ ] 前端已构建：`ls -la /home/mesapp/mes-system/client/build`
- [ ] 构建文件完整：`ls -la /home/mesapp/mes-system/client/build/index.html`
- [ ] 静态资源已生成：`ls -la /home/mesapp/mes-system/client/build/static`

---

## ▶️ 应用启动检查

### PM2配置
- [ ] ecosystem.config.js已创建：`ls -la /home/mesapp/mes-system/ecosystem.config.js`
- [ ] 配置文件内容正确：`cat /home/mesapp/mes-system/ecosystem.config.js | grep "mes-api"`

### 应用启动
- [ ] 应用已启动：`pm2 status | grep mes-api`
- [ ] 应用状态为online：`pm2 status | grep "online"`
- [ ] 应用进程数正确：`pm2 status | grep "mes-api" | awk '{print $3}'`
- [ ] 应用内存占用正常：`pm2 status | grep "mes-api" | awk '{print $5}'`

### 应用日志
- [ ] 应用日志目录已创建：`ls -la /home/mesapp/mes-system/logs`
- [ ] 应用日志文件已生成：`ls -la /home/mesapp/mes-system/logs/*.log`
- [ ] 日志中无错误信息：`pm2 logs mes-api --err | head -5`

---

## 🌐 Nginx配置检查

### Nginx配置文件
- [ ] 配置文件已创建：`ls -la /etc/nginx/sites-available/mes-system`
- [ ] 配置文件已启用：`ls -la /etc/nginx/sites-enabled/mes-system`
- [ ] 配置文件语法正确：`sudo nginx -t`
- [ ] 配置中包含前端路径：`grep "client/build" /etc/nginx/sites-available/mes-system`
- [ ] 配置中包含API代理：`grep "proxy_pass" /etc/nginx/sites-available/mes-system`
- [ ] 配置中包含WebSocket支持：`grep "socket.io" /etc/nginx/sites-available/mes-system`

### Nginx服务
- [ ] Nginx已启动：`sudo systemctl status nginx | grep active`
- [ ] Nginx已设置开机自启：`sudo systemctl is-enabled nginx`
- [ ] Nginx监听80端口：`sudo netstat -tlnp | grep nginx`
- [ ] Nginx日志目录已创建：`ls -la /var/log/nginx/`

---

## ✅ 功能验证检查

### API验证
- [ ] API健康检查通过：`curl http://localhost:5000/api/health`
- [ ] API返回正确的JSON：`curl http://localhost:5000/api/health | grep "status"`
- [ ] API响应时间正常：`time curl http://localhost:5000/api/health`

### 前端验证
- [ ] 前端可以访问：`curl http://localhost | grep -o "<title>"`
- [ ] 前端返回HTML：`curl http://localhost | head -20`
- [ ] 前端资源加载正常：`curl http://localhost/static/js/*.js | head -5`

### 数据库验证
- [ ] 数据库连接正常：`mysql -u mes_user -p mes_system -e "SELECT 1;"`
- [ ] 用户表可以查询：`mysql -u mes_user -p mes_system -e "SELECT COUNT(*) FROM users;"`
- [ ] 数据库表数量正确：`mysql -u mes_user -p mes_system -e "SHOW TABLES;" | wc -l`

### 集成验证
- [ ] 前端可以加载API数据
- [ ] 用户可以登录系统
- [ ] 可以查看生产管理模块
- [ ] 可以查看质量管理模块
- [ ] 可以查看设备管理模块
- [ ] 可以查看库存管理模块

---

## 🔐 安全配置检查

### 防火墙配置
- [ ] UFW已启用：`sudo ufw status | grep active`
- [ ] SSH端口已允许：`sudo ufw status | grep 22`
- [ ] HTTP端口已允许：`sudo ufw status | grep 80`
- [ ] HTTPS端口已允许：`sudo ufw status | grep 443`
- [ ] MySQL端口已限制：`sudo ufw status | grep 3306`

### 文件权限
- [ ] 应用目录权限正确：`ls -ld /home/mesapp/mes-system | grep "drwxr"`
- [ ] .env文件权限正确：`ls -l /home/mesapp/mes-system/.env | grep "600"`
- [ ] 备份目录权限正确：`ls -ld /home/mesapp/backups | grep "drwxr"`
- [ ] 日志目录权限正确：`ls -ld /home/mesapp/mes-system/logs | grep "drwxr"`

### 密钥配置
- [ ] JWT_SECRET已设置为强密钥
- [ ] MySQL密码已设置为强密码
- [ ] 数据库用户密码已更改
- [ ] 敏感信息未提交到Git

### SSL证书（如使用HTTPS）
- [ ] SSL证书已获取：`ls -la /etc/letsencrypt/live/`
- [ ] SSL证书已配置到Nginx
- [ ] SSL证书自动续期已配置：`sudo systemctl status certbot.timer`

---

## 📊 监控和备份检查

### 监控配置
- [ ] 监控脚本已创建：`ls -la /home/mesapp/monitor.sh`
- [ ] 监控脚本已添加到crontab：`crontab -l | grep monitor`
- [ ] 日志轮转已配置：`ls -la /etc/logrotate.d/mes-system`

### 备份配置
- [ ] 备份脚本已创建：`ls -la /home/mesapp/backup-database.sh`
- [ ] 备份脚本已添加到crontab：`crontab -l | grep backup`
- [ ] 备份目录已创建：`ls -la /home/mesapp/backups`
- [ ] 首次备份已完成：`ls -la /home/mesapp/backups/*.sql.gz | head -1`

### 日志配置
- [ ] 应用日志已生成：`ls -la /home/mesapp/mes-system/logs/`
- [ ] Nginx日志已生成：`ls -la /var/log/nginx/`
- [ ] MySQL日志已生成：`ls -la /var/log/mysql/`

---

## 📈 性能检查

### 系统资源
- [ ] CPU使用率正常：`top -bn1 | grep "Cpu(s)"`
- [ ] 内存使用率正常：`free -h | grep Mem`
- [ ] 磁盘使用率正常：`df -h | grep -E "/$|/home"`
- [ ] 网络连接正常：`ping 8.8.8.8`

### 应用性能
- [ ] API响应时间 < 500ms：`time curl http://localhost:5000/api/health`
- [ ] 前端加载时间 < 2s
- [ ] 数据库查询时间 < 100ms
- [ ] 内存占用 < 1GB

### 数据库性能
- [ ] 数据库连接数正常：`mysql -u mes_user -p mes_system -e "SHOW PROCESSLIST;" | wc -l`
- [ ] 数据库查询缓存已启用：`mysql -u mes_user -p mes_system -e "SHOW VARIABLES LIKE 'query_cache%';"`
- [ ] 数据库索引已创建：`mysql -u mes_user -p mes_system -e "SHOW INDEXES FROM users;"`

---

## 📝 文档检查

- [ ] 部署指南已阅读：`UBUNTU_DEPLOYMENT_GUIDE.md`
- [ ] 快速开始指南已阅读：`DEPLOYMENT_QUICK_START.md`
- [ ] 维护指南已阅读：`MAINTENANCE_GUIDE.md`
- [ ] 项目README已阅读：`README.md`
- [ ] API文档已查看（如存在）

---

## 🎯 部署完成确认

### 最终检查
- [ ] 所有检查项都已完成
- [ ] 所有服务都已启动并运行正常
- [ ] 所有功能都已验证
- [ ] 所有安全配置都已完成
- [ ] 所有监控和备份都已配置

### 部署签字

| 项目 | 内容 |
|------|------|
| 部署日期 | _________________ |
| 部署人员 | _________________ |
| 服务器IP | _________________ |
| 服务器域名 | _________________ |
| 数据库密码 | _________________ |
| JWT密钥 | _________________ |
| 备份位置 | _________________ |
| 备注 | _________________ |

---

## 📞 部署后支持

### 常见问题
- 查看维护指南中的"常见问题"部分
- 查看故障排查指南

### 获取帮助
- 项目GitHub：https://github.com/xiaomaimax/maxmes
- 提交问题：https://github.com/xiaomaimax/maxmes/issues
- 联系管理员：admin@example.com

### 定期维护
- 每日检查：运行daily-check.sh脚本
- 每周维护：更新系统包，清理日志
- 每月维护：检查安全漏洞，优化数据库
- 每季度维护：检查备份完整性，更新依赖

---

**部署完成日期**: _______________
**部署完成人**: _______________
**审核人**: _______________

---

**最后更新**: 2024-01-15
