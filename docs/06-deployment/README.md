# 部署运维文档

## 🚀 部署指南导航

### 📦 部署方式
- [部署概述](./DEPLOYMENT_GUIDE.md) - 部署方案和环境要求
- [Docker部署](./DOCKER_DEPLOYMENT.md) - 容器化部署方案
- [传统部署](./TRADITIONAL_DEPLOYMENT.md) - 传统服务器部署
- [云平台部署](./CLOUD_DEPLOYMENT.md) - 云服务器部署指南

### ⚙️ 配置管理
- [环境配置](./CONFIGURATION.md) - 系统配置参数说明
- [数据库配置](./DATABASE_CONFIG.md) - 数据库安装和配置
- [Web服务器配置](./WEBSERVER_CONFIG.md) - Nginx/Apache配置
- [SSL证书配置](./SSL_CONFIG.md) - HTTPS安全配置

### 📊 监控运维
- [系统监控](./MONITORING.md) - 性能监控和告警
- [日志管理](./LOG_MANAGEMENT.md) - 日志收集和分析
- [备份恢复](./BACKUP_RECOVERY.md) - 数据备份和恢复
- [故障排除](./TROUBLESHOOTING.md) - 常见问题诊断

### 🔧 维护管理
- [版本升级](./VERSION_UPGRADE.md) - 系统版本升级指南
- [性能优化](./PERFORMANCE_TUNING.md) - 系统性能调优
- [安全加固](./SECURITY_HARDENING.md) - 系统安全配置
- [容量规划](./CAPACITY_PLANNING.md) - 资源容量规划

### 🔄 CI/CD
- [持续集成](./CONTINUOUS_INTEGRATION.md) - CI/CD流水线配置
- [自动化部署](./AUTOMATED_DEPLOYMENT.md) - 自动化部署脚本
- [环境管理](./ENVIRONMENT_MANAGEMENT.md) - 多环境管理策略
- [发布流程](./RELEASE_PROCESS.md) - 版本发布流程

---

## 🏗️ 部署架构

### 单机部署架构
```
┌─────────────────────────────────────┐
│            Load Balancer            │
│              (Nginx)                │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│          Web Server                 │
│     (React + Node.js)               │
├─────────────────────────────────────┤
│         Database                    │
│          (MySQL)                    │
└─────────────────────────────────────┘
```

### 集群部署架构
```
                    ┌─────────────┐
                    │Load Balancer│
                    │   (Nginx)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │Web App 1│        │Web App 2│        │Web App 3│
   │(Node.js)│        │(Node.js)│        │(Node.js)│
   └─────────┘        └─────────┘        └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Database  │
                    │   Cluster   │
                    │   (MySQL)   │
                    └─────────────┘
```

---

## 🛠️ 环境要求

### 硬件要求

#### 最小配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 50GB SSD
- **网络**: 100Mbps

#### 推荐配置
- **CPU**: 4核心以上
- **内存**: 8GB RAM以上
- **存储**: 100GB SSD以上
- **网络**: 1Gbps

#### 生产环境配置
- **CPU**: 8核心以上
- **内存**: 16GB RAM以上
- **存储**: 500GB SSD以上
- **网络**: 10Gbps
- **冗余**: 双机热备

### 软件要求

#### 操作系统
- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- **Windows**: Windows Server 2019+
- **容器**: Docker 20.10+, Kubernetes 1.20+

#### 运行环境
- **Node.js**: v16.0+ (推荐v18.x)
- **MySQL**: v8.0+
- **Redis**: v6.0+ (可选)
- **Nginx**: v1.18+

#### 浏览器支持
- **Chrome**: v90+
- **Firefox**: v88+
- **Safari**: v14+
- **Edge**: v90+

---

## 🚀 快速部署

### Docker一键部署
```bash
# 克隆项目
git clone https://github.com/your-org/mes-system.git
cd mes-system

# 配置环境变量
cp .env.example .env
vim .env

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps
```

### 传统部署
```bash
# 安装依赖
npm install
cd client && npm install && cd ..

# 构建前端
cd client && npm run build && cd ..

# 配置数据库
mysql -u root -p < database/init.sql

# 启动服务
npm start
```

---

## 📋 部署检查清单

### 部署前检查
- [ ] 服务器资源充足
- [ ] 网络连接正常
- [ ] 域名DNS解析配置
- [ ] SSL证书准备就绪
- [ ] 数据库安装配置
- [ ] 备份策略制定

### 部署过程检查
- [ ] 代码部署成功
- [ ] 数据库初始化完成
- [ ] 环境变量配置正确
- [ ] 服务启动正常
- [ ] 端口访问正常
- [ ] 日志输出正常

### 部署后验证
- [ ] 系统功能正常
- [ ] 用户登录正常
- [ ] 数据操作正常
- [ ] 性能指标正常
- [ ] 监控告警配置
- [ ] 备份任务运行

---

## 🔧 运维工具

### 监控工具
- **系统监控**: Prometheus + Grafana
- **应用监控**: New Relic, DataDog
- **日志监控**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **网络监控**: Zabbix, Nagios

### 部署工具
- **容器化**: Docker, Kubernetes
- **配置管理**: Ansible, Puppet
- **CI/CD**: Jenkins, GitLab CI, GitHub Actions
- **版本控制**: Git, GitLab, GitHub

### 备份工具
- **数据库备份**: mysqldump, Percona XtraBackup
- **文件备份**: rsync, tar
- **云备份**: AWS S3, 阿里云OSS
- **自动化备份**: cron, systemd timer

---

## 📞 运维支持

### 技术支持
- **运维手册**: https://ops.mes-system.com
- **监控面板**: https://monitor.mes-system.com
- **日志中心**: https://logs.mes-system.com
- **备份中心**: https://backup.mes-system.com

### 应急联系
- **运维团队**: ops-team@mes-system.com
- **技术支持**: support@mes-system.com
- **紧急热线**: +86-400-xxx-xxxx
- **在线支持**: https://support.mes-system.com

### 服务等级协议 (SLA)
- **系统可用性**: 99.9%
- **响应时间**: < 2秒
- **故障恢复**: < 4小时
- **数据备份**: 每日备份，保留30天

---

**文档版本**: v1.0.0  
**最后更新**: 2024-12-22  
**维护团队**: MES运维组