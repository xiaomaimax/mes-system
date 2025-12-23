# MES系统快速启动指南

## 方式一：本地开发环境

### 1. 环境准备
确保已安装：
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 2. 快速启动
```bash
# 1. 进入项目目录
cd mes-system

# 2. 安装所有依赖
npm run install-all

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息

# 4. 初始化数据库（可选，如果数据库为空）
npm run setup

# 5. 启动开发服务器（前后端同时启动）
npm run dev:full
```

### 3. 访问系统
- 前端界面：http://localhost:3000
- 后端API：http://localhost:5000

### 4. 默认登录账号
- 管理员：admin / 123456
- 操作员：operator / 123456

## 方式二：Docker部署

### 1. 使用Docker Compose（推荐）
```bash
# 1. 进入项目目录
cd mes-system

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f mes-app
```

### 2. 访问系统
- 系统地址：http://localhost:5000
- 默认账号：admin / 123456

### 3. 停止服务
```bash
docker-compose down
```

## 方式三：生产环境部署

### 1. 构建生产版本
```bash
# 安装依赖
npm run install-all

# 构建前端
npm run build

# 启动生产服务器
npm start
```

### 2. 使用PM2管理进程
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server/app.js --name mes-system

# 查看状态
pm2 status

# 查看日志
pm2 logs mes-system
```

## 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否启动
- 确认数据库连接配置正确
- 检查防火墙设置

### 2. 前端无法访问后端API
- 确认后端服务已启动（端口5000）
- 检查代理配置（package.json中的proxy设置）

### 3. 权限问题
- 确保数据库用户有足够权限
- 检查文件系统权限

### 4. 端口冲突
- 修改.env文件中的PORT配置
- 或者停止占用端口的其他服务

## 系统功能概览

1. **监控面板** - 实时生产数据展示
2. **生产管理** - 生产订单创建和跟踪
3. **设备管理** - 设备状态监控
4. **质量管理** - 质量检验记录
5. **库存管理** - 物料库存跟踪
6. **报表分析** - 生产数据分析

## 技术支持

如遇到问题，请检查：
1. 系统日志
2. 浏览器控制台
3. 网络连接
4. 数据库状态

更多详细信息请参考 README.md 文档。