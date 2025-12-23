# MES系统部署指南

## 📋 目录

1. [部署概述](#部署概述)
2. [环境准备](#环境准备)
3. [Docker部署](#docker部署)
4. [传统部署](#传统部署)
5. [云平台部署](#云平台部署)
6. [配置管理](#配置管理)
7. [安全配置](#安全配置)
8. [性能优化](#性能优化)
9. [监控告警](#监控告警)
10. [故障排除](#故障排除)

---

## 部署概述

### 部署方案对比

| 部署方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| Docker部署 | 环境一致、快速部署、易于扩展 | 需要Docker知识 | 推荐方案，适合所有环境 |
| 传统部署 | 直接控制、性能最优 | 环境配置复杂 | 对性能要求极高的场景 |
| 云平台部署 | 弹性扩展、高可用 | 成本较高 | 大规模生产环境 |

### 系统架构

#### 单机架构
```
Internet
    ↓
Nginx (80/443)
    ↓
React App (3000)
    ↓
Node.js API (5000)
    ↓
MySQL (3306)
```

#### 集群架构
```
Internet
    ↓
Load Balancer
    ↓
┌─────────┬─────────┬─────────┐
│ Web1    │ Web2    │ Web3    │
│ (3000)  │ (3000)  │ (3000)  │
└─────────┴─────────┴─────────┘
    ↓
┌─────────┬─────────┬─────────┐
│ API1    │ API2    │ API3    │
│ (5000)  │ (5000)  │ (5000)  │
└─────────┴─────────┴─────────┘
    ↓
MySQL Cluster
```

---

## 环境准备

### 服务器要求

#### 硬件配置
```bash
# 开发环境
CPU: 2核心
内存: 4GB
存储: 50GB SSD
网络: 100Mbps

# 测试环境
CPU: 4核心
内存: 8GB
存储: 100GB SSD
网络: 1Gbps

# 生产环境
CPU: 8核心+
内存: 16GB+
存储: 500GB SSD+
网络: 10Gbps
```

#### 操作系统
```bash
# Ubuntu (推荐)
Ubuntu 20.04 LTS
Ubuntu 22.04 LTS

# CentOS
CentOS 8+
Rocky Linux 8+

# 其他
Debian 11+
RHEL 8+
```

### 软件依赖

#### 基础软件安装
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget git vim htop

# CentOS/RHEL
sudo yum update
sudo yum install -y curl wget git vim htop
```

#### Node.js安装
```bash
# 使用NodeSource仓库 (推荐)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### MySQL安装
```bash
# Ubuntu/Debian
sudo apt install -y mysql-server mysql-client

# CentOS/RHEL
sudo yum install -y mysql-server mysql

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### Nginx安装
```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Docker部署

### Docker环境准备

#### 安装Docker
```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 验证安装
```bash
docker --version
docker-compose --version
```

### 项目部署

#### 1. 获取项目代码
```bash
# 克隆项目
git clone https://github.com/your-org/mes-system.git
cd mes-system

# 切换到指定版本 (可选)
git checkout v1.0.0
```

#### 2. 配置环境变量
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
vim .env
```

#### 3. 环境变量配置
```env
# 应用配置
NODE_ENV=production
PORT=5000

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=your_secure_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Redis配置 (可选)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# 前端配置
REACT_APP_API_URL=http://localhost:5000/api
```

#### 4. Docker Compose配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    env_file:
      - .env
    depends_on:
      - mysql
      - redis
    restart: unless-stopped
    volumes:
     