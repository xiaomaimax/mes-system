# MES制造执行系统 - Ubuntu部署完整方案总结

## 📌 项目概述

**MES制造执行系统** 是一个基于React + Node.js + MySQL的现代化制造管理平台，专为注塑车间设计。

**系统特点**:
- 前端：React 18 + Ant Design
- 后端：Node.js + Express
- 数据库：MySQL 8.0
- 部署：Docker或传统部署

---

## 🎯 部署方案总结

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Ubuntu服务器                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Nginx (反向代理)                     │   │
│  │  - 监听80/443端口                                │   │
│  │  - 提供前端静态文件                              │   │
│  │  - 代理API请求到后端                            │   │
│  │  - 支持WebSocket                                │   │
│  └──────────────────────────────────────────────────┘   │
│                        ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Node.js应用 (PM2管理)                    │   │
│  │  - 监听5000端口                                 │   │
│  │  - 提供REST API                                 │   │
│  │  - 处理业务逻辑                                 │   │
│  │  - 集群模式运行                                 │   │
│  └──────────────────────────────────────────────────┘   │
│                        ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         MySQL数据库                              │   │
│  │  - 监听3306端口                                 │   │
│  │  - 存储所有业务数据                             │   │
│  │  - 自动备份                                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 生成的部署文档

### 1. **UBUNTU_DEPLOYMENT_GUIDE.md** (完整指南)
- **大小**: ~50KB
- **内容**: 详细的分步部署指南
- **适用**: 首次部署、需要详细了解
- **阅读时间**: 30-45分钟

**主要章节**:
- 系统要求
- 前置准备
- 环境安装（Node.js、MySQL、PM2、Nginx）
- 项目部署
- 数据库配置
- 应用启动
- Nginx反向代理
- 系统监控
- 备份与恢复
- 故障排查
- 性能优化
- 安全建议

---

### 2. **DEPLOYMENT_QUICK_START.md** (快速指南)
- **大小**: ~30KB
- **内容**: 快速部署步骤和命令速查表
- **适用**: 快速部署、有经验的人
- **阅读时间**: 10-15分钟

**主要章节**:
- 5分钟快速部署
- 分步骤手动部署
- 常用命令速查表
- 常见问题快速解答
- 性能优化建议
- 安全配置建议

---

### 3. **MAINTENANCE_GUIDE.md** (维护指南)
- **大小**: ~40KB
- **内容**: 日常维护、监控、备份、故障排查
- **适用**: 系统已部署、需要日常维护
- **阅读时间**: 20-30分钟

**主要章节**:
- 日常维护任务
- 监控和告警
- 备份和恢复
- 性能调优
- 常见问题详细解答
- 应急处理

---

### 4. **DEPLOYMENT_CHECKLIST.md** (检查清单)
- **大小**: ~20KB
- **内容**: 部署过程中的检查清单
- **适用**: 部署过程中逐项检查
- **阅读时间**: 15-20分钟

**主要章节**:
- 部署前准备检查
- 环境安装检查
- 数据库配置检查
- 应用部署检查
- 功能验证检查
- 安全配置检查
- 部署完成确认

---

### 5. **deploy.sh** (自动部署脚本)
- **大小**: ~15KB
- **功能**: 一键自动部署
- **适用**: 首次部署、快速部署
- **执行时间**: 15-20分钟

**功能**:
- 自动检查系统环境
- 自动安装所有软件
- 自动配置数据库
- 自动部署应用
- 自动启动服务
- 自动验证部署

---

### 6. **DEPLOYMENT_DOCUMENTATION_INDEX.md** (文档索引)
- **大小**: ~15KB
- **内容**: 所有文档的索引和使用指南
- **适用**: 快速查找相关文档
- **阅读时间**: 5-10分钟

---

## 🚀 三种部署方案对比

| 方案 | 时间 | 难度 | 自动化 | 可定制 | 适用人群 |
|------|------|------|--------|--------|---------|
| **一键部署** | 15-20分钟 | ⭐ | 100% | 0% | 新手 |
| **快速部署** | 20-30分钟 | ⭐⭐ | 50% | 50% | 有经验的人 |
| **详细部署** | 45-60分钟 | ⭐⭐⭐ | 0% | 100% | 想深入学习的人 |

---

## 📋 部署步骤概览

### 一键部署（推荐新手）

```bash
# 1. 下载脚本
wget https://your-repo/deploy.sh
chmod +x deploy.sh

# 2. 运行脚本
./deploy.sh

# 3. 按照提示输入信息
# 完成！
```

### 快速部署（推荐有经验的人）

```bash
# 1. 系统准备
sudo apt update && sudo apt upgrade -y

# 2. 安装软件
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx
sudo npm install -g pm2

# 3. 配置数据库
sudo mysql -u root -p << EOF
CREATE DATABASE mes_system CHARACTER SET utf8mb4;
CREATE USER 'mes_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 4. 部署应用
git clone https://github.com/xiaomaimax/maxmes.git mes-system
cd mes-system
cp .env.example .env
# 编辑.env文件
npm install && cd client && npm install && cd ..
mysql -u mes_user -p mes_system < database/init.sql
npm run build

# 5. 启动应用
pm2 start server/app.js --name "mes-api"
pm2 save

# 6. 配置Nginx
# 编辑/etc/nginx/sites-available/mes-system
sudo systemctl restart nginx

# 完成！
```

### 详细部署（推荐深入学习）

- 阅读 `UBUNTU_DEPLOYMENT_GUIDE.md`
- 按照指南逐步部署
- 理解每个步骤的原理

---

## ✅ 部署验证

部署完成后，按照以下步骤验证：

```bash
# 1. 检查服务状态
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# 2. 测试API
curl http://localhost:5000/api/health

# 3. 访问前端
# 在浏览器中打开：http://your_server_ip

# 4. 测试数据库
mysql -u mes_user -p mes_system -e "SELECT COUNT(*) FROM users;"
```

---

## 🔧 关键配置文件

### 1. .env 文件

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=your_password

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 服务器配置
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://your_server_ip
```

### 2. ecosystem.config.js 文件

```javascript
module.exports = {
  apps: [{
    name: 'mes-api',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G'
  }]
};
```

### 3. Nginx 配置文件

```nginx
server {
    listen 80;
    server_name your_domain;

    location / {
        root /home/mesapp/mes-system/client/build;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 系统要求

### 硬件要求
- **CPU**: 2核或以上
- **内存**: 4GB或以上（建议8GB）
- **磁盘**: 50GB或以上

### 软件要求
- **操作系统**: Ubuntu 20.04 LTS 或 22.04 LTS
- **Node.js**: v18.0 或以上
- **MySQL**: 8.0 或以上
- **Nginx**: 最新稳定版本

---

## 🔐 安全建议

### 1. 防火墙配置
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 2. 文件权限
```bash
sudo chown -R mesapp:mesapp /home/mesapp/mes-system
sudo chmod 600 /home/mesapp/mes-system/.env
```

### 3. SSL证书
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your_domain
```

### 4. 定期更新
```bash
sudo apt update && sudo apt upgrade -y
npm update
npm audit fix
```

---

## 📈 性能优化

### 1. Node.js优化
- 使用集群模式
- 增加内存限制
- 启用缓存

### 2. MySQL优化
- 增加缓冲池大小
- 启用查询缓存
- 创建索引

### 3. Nginx优化
- 启用Gzip压缩
- 配置缓存
- 优化连接数

---

## 📞 常见问题快速解答

### Q1: 部署脚本执行失败
**A**: 检查网络连接，确保有sudo权限，查看错误日志

### Q2: 数据库连接失败
**A**: 检查MySQL是否运行，验证用户名和密码，检查防火墙

### Q3: 前端无法访问
**A**: 检查Nginx是否运行，验证前端构建文件，检查防火墙

### Q4: API响应缓慢
**A**: 查看应用日志，检查系统资源，优化数据库查询

### Q5: 内存占用过高
**A**: 查看进程内存占用，增加内存限制，清理日志文件

---

## 📚 文档使用流程

```
开始
  ↓
选择部署方案
  ├─ 新手 → 一键部署 → deploy.sh
  ├─ 有经验 → 快速部署 → DEPLOYMENT_QUICK_START.md
  └─ 深入学习 → 详细部署 → UBUNTU_DEPLOYMENT_GUIDE.md
  ↓
部署应用
  ↓
使用检查清单验证 → DEPLOYMENT_CHECKLIST.md
  ↓
部署完成
  ↓
日常维护 → MAINTENANCE_GUIDE.md
  ↓
遇到问题 → 查看维护指南中的故障排查部分
```

---

## 🎯 部署完成后的下一步

### 1. 系统配置
- [ ] 修改默认密码
- [ ] 配置用户权限
- [ ] 设置系统参数

### 2. 数据初始化
- [ ] 导入演示数据
- [ ] 配置生产线
- [ ] 配置设备信息

### 3. 日常维护
- [ ] 配置自动备份
- [ ] 配置监控告警
- [ ] 配置日志轮转

### 4. 用户培训
- [ ] 培训系统管理员
- [ ] 培训普通用户
- [ ] 编写使用手册

---

## 📞 获取帮助

### 文档问题
- 查看相关文档的"常见问题"部分
- 查看维护指南中的"故障排查"部分

### 技术问题
- 查看项目README
- 提交问题到GitHub：https://github.com/xiaomaimax/maxmes/issues

### 紧急支持
- 查看维护指南中的"应急处理"部分
- 联系系统管理员

---

## 📋 部署文档清单

- [x] 完整部署指南 (UBUNTU_DEPLOYMENT_GUIDE.md)
- [x] 快速开始指南 (DEPLOYMENT_QUICK_START.md)
- [x] 维护和故障排查指南 (MAINTENANCE_GUIDE.md)
- [x] 部署检查清单 (DEPLOYMENT_CHECKLIST.md)
- [x] 自动部署脚本 (deploy.sh)
- [x] 文档索引 (DEPLOYMENT_DOCUMENTATION_INDEX.md)
- [x] 部署总结 (DEPLOYMENT_SUMMARY.md - 本文档)

---

## 🎉 开始部署

现在你已经拥有完整的部署方案！

**立即开始**:

1. **快速部署** → 运行 `./deploy.sh`
2. **详细部署** → 阅读 `UBUNTU_DEPLOYMENT_GUIDE.md`
3. **快速参考** → 阅读 `DEPLOYMENT_QUICK_START.md`

**部署完成后**:

1. 使用 `DEPLOYMENT_CHECKLIST.md` 验证部署
2. 阅读 `MAINTENANCE_GUIDE.md` 了解日常维护

---

## 📝 文档版本

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2024-01-15 | 初始版本，包含完整的部署方案 |

---

## ✨ 特别感谢

感谢所有为MES系统做出贡献的开发者和维护者！

---

**祝你部署顺利！** 🚀

**最后更新**: 2024-01-15
**维护者**: MES系统团队
**联系方式**: admin@example.com
