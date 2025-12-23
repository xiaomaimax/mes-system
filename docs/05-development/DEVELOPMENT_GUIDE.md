# MES系统开发指南

## 📋 目录

1. [开发环境搭建](#开发环境搭建)
2. [项目结构说明](#项目结构说明)
3. [技术栈介绍](#技术栈介绍)
4. [开发规范](#开发规范)
5. [调试和测试](#调试和测试)
6. [构建和部署](#构建和部署)
7. [常见问题](#常见问题)

---

## 开发环境搭建

### 系统要求

#### 操作系统
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+

#### 软件要求
- Node.js v16.0+ (推荐v18.x)
- npm v8.0+ 或 yarn v1.22+
- Git v2.30+
- MySQL 8.0+
- Redis 6.0+ (可选)

### 环境安装

#### 1. 安装Node.js
```bash
# 使用nvm安装 (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 或直接下载安装
# https://nodejs.org/
```

#### 2. 安装MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (使用Homebrew)
brew install mysql

# Windows
# 下载MySQL Installer: https://dev.mysql.com/downloads/installer/
```

#### 3. 配置MySQL
```sql
-- 创建数据库
CREATE DATABASE mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'mes_user'@'localhost' IDENTIFIED BY 'mes_password';
GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. 安装Redis (可选)
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Windows
# 下载Redis: https://github.com/microsoftarchive/redis/releases
```

### 项目初始化

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/mes-system.git
cd mes-system
```

#### 2. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

#### 3. 环境配置
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
vim .env
```

#### 4. 环境变量配置
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mes_system
DB_USER=mes_user
DB_PASSWORD=mes_password

# Redis配置 (可选)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=5000
NODE_ENV=development

# 前端配置
REACT_APP_API_URL=http://localhost:5000/api
```

#### 5. 初始化数据库
```bash
# 运行数据库初始化脚本
npm run db:init

# 或手动执行SQL文件
mysql -u mes_user -p mes_system < database/init.sql
```

#### 6. 启动开发服务
```bash
# 启动后端服务 (端口: 5000)
npm run dev

# 新开终端，启动前端服务 (端口: 3000)
cd client
npm start
```

#### 7. 验证安装
访问 http://localhost:3000，应该能看到MES系统登录页面。

---

## 项目结构说明

### 整体结构
```
mes-system/
├── client/                 # 前端React应用
├── server/                 # 后端Node.js应用 (如果存在)
├── database/               # 数据库相关文件
├── docs/                   # 项目文档
├── scripts/                # 构建和工具脚本
├── tests/                  # 测试文件
├── .env.example            # 环境变量模板
├── docker-compose.yml      # Docker配置
├── package.json            # 项目依赖和脚本
└── README.md              # 项目说明
```

### 前端结构 (client/)
```
client/
├── public/                 # 静态资源
│   ├── index.html         # HTML模板
│   ├── favicon.ico        # 网站图标
│   └── manifest.json      # PWA配置
├── src/                   # 源代码
│   ├── components/        # React组件
│   │   ├── Dashboard.js   # 首页仪表板
│   │   ├── Sidebar.js     # 侧边栏导航
│   │   ├── SimpleHeader.js # 顶部导航
│   │   ├── production/    # 生产管理组件
│   │   ├── quality/       # 质量管理组件
│   │   ├── equipment/     # 设备管理组件
│   │   ├── inventory/     # 库存管理组件
│   │   ├── personnel/     # 人员管理组件
│   │   ├── integration/   # 系统集成组件
│   │   ├── process/       # 工艺管理组件
│   │   └── settings/      # 系统设置组件
│   ├── utils/             # 工具函数
│   ├── styles/            # 样式文件
│   ├── App.js             # 应用主组件
│   └── index.js           # 应用入口
├── package.json           # 前端依赖
└── .gitignore            # Git忽略文件
```

### 组件分类

#### 1. 页面级组件 (Page Components)
- 对应路由的主要页面组件
- 命名格式: `Simple[ModuleName].js`
- 例如: `SimpleProduction.js`, `SimpleQuality.js`

#### 2. 业务组件 (Business Components)
- 具体业务功能的组件
- 按模块分目录存放
- 例如: `production/ProductionTasks.js`

#### 3. 通用组件 (Common Components)
- 可复用的UI组件
- 例如: `Sidebar.js`, `SimpleHeader.js`

#### 4. 工具组件 (Utility Components)
- 提供特定功能的组件
- 例如: 图表组件、表单组件

---

## 技术栈介绍

### 前端技术栈

#### 核心框架
```javascript
// React 18.2.0 - 现代化前端框架
import React from 'react';
import { createRoot } from 'react-dom/client';

// React Router 6.x - 单页应用路由
import { BrowserRouter, Routes, Route } from 'react-router-dom';
```

#### UI组件库
```javascript
// Ant Design 5.x - 企业级UI组件库
import { Button, Table, Form, Modal } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
```

#### 数据可视化
```javascript
// Recharts - React图表库
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
```

#### 状态管理
```javascript
// React Hooks - 内置状态管理
import { useState, useEffect, useContext, useReducer } from 'react';

// Context API - 全局状态共享
const AppContext = React.createContext();
```

#### HTTP客户端
```javascript
// Axios - HTTP请求库
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000
});
```

### 后端技术栈 (如果需要)

#### 核心框架
```javascript
// Node.js + Express
const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

#### 数据库
```javascript
// MySQL + mysql2
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

#### 身份认证
```javascript
// JWT + bcrypt
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 生成token
const token = jwt.sign({ userId }, process.env.JWT_SECRET);
```

---

## 开发规范

### 代码规范

#### 1. JavaScript/React规范
```javascript
// 使用ES6+语法
const [state, setState] = useState(initialValue);

// 组件命名使用PascalCase
const UserManagement = () => {
  // 组件逻辑
};

// 函数命名使用camelCase
const handleSubmit = (values) => {
  // 处理逻辑
};

// 常量使用UPPER_SNAKE_CASE
const API_ENDPOINTS = {
  USERS: '/api/users',
  ROLES: '/api/roles'
};
```

#### 2. 文件命名规范
```
组件文件: PascalCase.js
  ✅ UserManagement.js
  ❌ userManagement.js

工具文件: camelCase.js
  ✅ apiUtils.js
  ❌ api-utils.js

样式文件: kebab-case.css
  ✅ user-management.css
  ❌ UserManagement.css
```

#### 3. 目录结构规范
```
components/
├── [module]/              # 模块目录使用小写
│   ├── ComponentName.js   # 组件文件使用PascalCase
│   └── index.js          # 导出文件
└── common/               # 通用组件目录
```

### 组件开发规范

#### 1. 组件结构
```javascript
import React, { useState, useEffect } from 'react';
import { Card, Table, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserManagement = () => {
  // 1. 状态定义
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. 副作用处理
  useEffect(() => {
    fetchUsers();
  }, []);

  // 3. 事件处理函数
  const handleAdd = () => {
    // 处理逻辑
  };

  const handleEdit = (record) => {
    // 处理逻辑
  };

  // 4. 渲染函数
  const renderTable = () => {
    // 渲染逻辑
  };

  // 5. 主渲染
  return (
    <div>
      {/* JSX内容 */}
    </div>
  );
};

export default UserManagement;
```

#### 2. Props类型检查
```javascript
import PropTypes from 'prop-types';

const UserCard = ({ user, onEdit, onDelete }) => {
  // 组件逻辑
};

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

UserCard.defaultProps = {
  onEdit: () => {},
  onDelete: () => {}
};
```

#### 3. 样式规范
```javascript
// 内联样式使用对象
const styles = {
  container: {
    padding: '24px',
    background: '#f0f2f5'
  },
  header: {
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold'
  }
};

// 使用样式
<div style={styles.container}>
  <h2 style={styles.header}>标题</h2>
</div>
```

### API开发规范

#### 1. 接口设计
```javascript
// RESTful API设计
GET    /api/users          # 获取用户列表
POST   /api/users          # 创建用户
GET    /api/users/:id      # 获取单个用户
PUT    /api/users/:id      # 更新用户
DELETE /api/users/:id      # 删除用户
```

#### 2. 响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": {
    "users": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "message": "获取成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在"
  }
}
```

#### 3. 错误处理
```javascript
// 前端错误处理
const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await api.get('/users');
    setUsers(response.data.data.users);
  } catch (error) {
    console.error('获取用户失败:', error);
    message.error('获取用户失败');
  } finally {
    setLoading(false);
  }
};
```

### Git提交规范

#### 1. 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 2. 类型说明
```
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式调整
refactor: 代码重构
test:     测试相关
chore:    构建工具或辅助工具的变动
```

#### 3. 提交示例
```bash
git commit -m "feat(user): add user management module

- Add user list component
- Add user form component
- Add user API integration

Closes #123"
```

---

## 调试和测试

### 开发调试

#### 1. 浏览器调试
```javascript
// 使用console调试
console.log('调试信息:', data);
console.error('错误信息:', error);
console.table(arrayData);

// 使用debugger断点
const handleSubmit = (values) => {
  debugger; // 浏览器会在此处暂停
  // 处理逻辑
};
```

#### 2. React Developer Tools
- 安装浏览器扩展
- 查看组件树和状态
- 性能分析和优化

#### 3. 网络调试
- 使用浏览器Network面板
- 检查API请求和响应
- 分析请求性能

### 单元测试

#### 1. 测试环境配置
```javascript
// setupTests.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-testid' });
```

#### 2. 组件测试
```javascript
// UserManagement.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import UserManagement from './UserManagement';

describe('UserManagement', () => {
  test('renders user list', () => {
    render(<UserManagement />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });

  test('handles add user', () => {
    render(<UserManagement />);
    const addButton = screen.getByText('新增用户');
    fireEvent.click(addButton);
    // 断言
  });
});
```

#### 3. API测试
```javascript
// api.test.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchUsers } from './api';

const mock = new MockAdapter(axios);

describe('API Tests', () => {
  test('fetchUsers returns user data', async () => {
    const userData = { users: [{ id: 1, name: 'Test User' }] };
    mock.onGet('/api/users').reply(200, userData);

    const result = await fetchUsers();
    expect(result.users).toHaveLength(1);
  });
});
```

### 集成测试

#### 1. 端到端测试 (Cypress)
```javascript
// cypress/integration/user-management.spec.js
describe('User Management', () => {
  it('should create new user', () => {
    cy.visit('/users');
    cy.get('[data-testid=add-user-btn]').click();
    cy.get('[data-testid=user-name-input]').type('Test User');
    cy.get('[data-testid=submit-btn]').click();
    cy.contains('用户创建成功');
  });
});
```

#### 2. 运行测试
```bash
# 运行单元测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

---

## 构建和部署

### 开发构建

#### 1. 开发服务器
```bash
# 启动前端开发服务器
cd client
npm start

# 启动后端开发服务器
npm run dev
```

#### 2. 热重载配置
```javascript
// webpack.config.js (如果需要自定义)
module.exports = {
  devServer: {
    hot: true,
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
};
```

### 生产构建

#### 1. 前端构建
```bash
cd client
npm run build
```

#### 2. 构建优化
```javascript
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx serve -s build"
  }
}
```

#### 3. 环境变量
```env
# 生产环境配置
NODE_ENV=production
REACT_APP_API_URL=https://api.mes-system.com
```

### Docker部署

#### 1. Dockerfile
```dockerfile
# 前端构建
FROM node:18-alpine as build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# 生产镜像
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
      - database

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - database

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mes_system
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

#### 3. 部署命令
```bash
# 构建和启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 常见问题

### 开发环境问题

#### Q: npm install失败
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 使用淘宝镜像
npm config set registry https://registry.npm.taobao.org
```

#### Q: 端口被占用
```bash
# 查看端口占用
lsof -i :3000
netstat -ano | findstr :3000

# 杀死进程
kill -9 <PID>
taskkill /PID <PID> /F
```

#### Q: 数据库连接失败
```bash
# 检查MySQL服务状态
sudo systemctl status mysql
brew services list | grep mysql

# 重启MySQL服务
sudo systemctl restart mysql
brew services restart mysql
```

### 构建问题

#### Q: 内存不足
```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Q: 依赖版本冲突
```bash
# 查看依赖树
npm ls

# 强制解决冲突
npm install --force

# 使用yarn解决
yarn install
```

### 运行时问题

#### Q: 页面空白
- 检查浏览器控制台错误
- 确认API服务是否正常
- 检查路由配置是否正确

#### Q: API请求失败
- 检查网络连接
- 确认API地址配置
- 查看服务器日志

#### Q: 权限问题
- 确认用户角色配置
- 检查权限验证逻辑
- 查看JWT token是否有效

---

## 📞 技术支持

### 开发者资源
- **开发文档**: https://docs.mes-system.com
- **API文档**: https://api.mes-system.com/docs
- **代码仓库**: https://github.com/your-org/mes-system
- **问题跟踪**: https://github.com/your-org/mes-system/issues

### 社区支持
- **开发者论坛**: https://forum.mes-system.com
- **技术博客**: https://blog.mes-system.com
- **视频教程**: https://learn.mes-system.com

### 联系方式
- **技术支持**: dev-support@mes-system.com
- **开发团队**: dev-team@mes-system.com

---

**文档版本**: v1.0.0  
**最后更新**: 2024-12-22  
**维护团队**: MES开发组