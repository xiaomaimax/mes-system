# 快速开始指南

## 🚀 环境要求

### 系统要求
- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **内存**: 最低 4GB，推荐 8GB+
- **硬盘**: 最低 10GB 可用空间
- **网络**: 稳定的网络连接

### 软件依赖
- **Node.js**: v16.0.0 或更高版本
- **npm**: v8.0.0 或更高版本
- **MySQL**: v8.0 或更高版本
- **Git**: 用于代码管理

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone https://github.com/your-org/mes-system.git
cd mes-system
```

### 2. 安装依赖
```bash
# 安装服务端依赖
npm install

# 安装客户端依赖
cd client
npm install
cd ..
```

### 3. 数据库配置
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始数据
mysql -u root -p mes_system < database/init.sql
```

### 4. 环境配置
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env
```

**环境变量配置**:
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mes_system
DB_USER=root
DB_PASSWORD=your_password

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret_key

# 邮件配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your_email@163.com
SMTP_PASS=your_email_password

# 企业微信配置
WECHAT_CORP_ID=your_corp_id
WECHAT_CORP_SECRET=your_corp_secret
WECHAT_AGENT_ID=your_agent_id
```

### 5. 启动服务

#### 开发模式
```bash
# 启动后端服务
npm run dev

# 新开终端，启动前端服务
cd client
npm start
```

#### 生产模式
```bash
# 构建前端
cd client
npm run build
cd ..

# 启动生产服务
npm start
```

## 🌐 访问系统

### 开发环境
- **前端地址**: http://localhost:3000
- **后端API**: http://localhost:3001

### 默认账号
- **管理员**: admin / admin123
- **操作员**: operator / operator123
- **查看员**: viewer / viewer123

## 🔧 常用命令

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 启动前端开发服务器
cd client && npm start

# 运行测试
npm test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 数据库命令
```bash
# 创建数据库
npm run db:create

# 重置数据库
npm run db:reset

# 备份数据库
npm run db:backup

# 恢复数据库
npm run db:restore
```

### 构建命令
```bash
# 构建前端
npm run build

# 构建Docker镜像
npm run docker:build

# 启动Docker容器
npm run docker:start
```

## 🐳 Docker 部署

### 使用 Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Docker Compose 配置
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: mes_system
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  mes-app:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: mes_system
      DB_USER: root
      DB_PASSWORD: root123

volumes:
  mysql_data:
```

## 🔍 故障排除

### 常见问题

#### 1. 端口占用
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 杀死进程 (Windows)
taskkill /PID <PID> /F

# 杀死进程 (Linux/macOS)
kill -9 <PID>
```

#### 2. 数据库连接失败
- 检查MySQL服务是否启动
- 验证数据库配置信息
- 确认防火墙设置
- 检查数据库用户权限

#### 3. 依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npm.taobao.org
```

#### 4. 前端构建失败
```bash
# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 或者在package.json中设置
"build": "NODE_OPTIONS='--max-old-space-size=4096' react-scripts build"
```

### 日志查看
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 查看访问日志
tail -f logs/access.log
```

## 📞 技术支持

### 获取帮助
- **文档中心**: [docs/README.md](../README.md)
- **问题反馈**: [GitHub Issues](https://github.com/your-org/mes-system/issues)
- **技术支持**: support@your-domain.com
- **在线文档**: https://docs.your-domain.com

### 社区资源
- **官方网站**: https://mes.your-domain.com
- **用户论坛**: https://forum.your-domain.com
- **技术博客**: https://blog.your-domain.com
- **视频教程**: https://video.your-domain.com

---

**更新时间**: 2024-12-22  
**文档版本**: v1.0.0