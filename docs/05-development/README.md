# 开发文档

## 🔧 开发指南导航

### 🚀 快速开始
- [开发环境搭建](./DEVELOPMENT_GUIDE.md) - 本地开发环境配置
- [项目结构](./PROJECT_STRUCTURE.md) - 代码组织和目录结构
- [编码规范](./CODING_STANDARDS.md) - 代码风格和规范要求

### 📚 技术文档
- [前端开发](./FRONTEND_DEVELOPMENT.md) - React组件开发指南
- [后端开发](./BACKEND_DEVELOPMENT.md) - Node.js API开发指南
- [数据库设计](./DATABASE_DESIGN.md) - 数据库表结构和关系
- [API接口](./API_REFERENCE.md) - RESTful API接口文档

### 🏗️ 架构设计
- [系统架构](../03-architecture/SYSTEM_ARCHITECTURE.md) - 整体架构设计
- [模块设计](./MODULE_DESIGN.md) - 业务模块设计说明
- [组件设计](./COMPONENT_DESIGN.md) - 前端组件设计规范
- [数据流设计](./DATA_FLOW_DESIGN.md) - 数据流转和状态管理

### 🔌 集成开发
- [第三方集成](./THIRD_PARTY_INTEGRATION.md) - 外部系统集成指南
- [设备接口](./DEVICE_INTERFACE.md) - 设备数据采集接口
- [消息推送](./MESSAGE_PUSH.md) - 企业微信和邮件推送
- [数据同步](./DATA_SYNC.md) - 数据同步机制

### 🧪 测试和调试
- [测试指南](./TESTING_GUIDE.md) - 单元测试和集成测试
- [调试技巧](./DEBUGGING_TIPS.md) - 常见问题调试方法
- [性能优化](./PERFORMANCE_OPTIMIZATION.md) - 系统性能优化
- [安全开发](./SECURITY_DEVELOPMENT.md) - 安全编码规范

### 📦 构建和部署
- [构建流程](./BUILD_PROCESS.md) - 项目构建和打包
- [版本管理](./VERSION_CONTROL.md) - Git工作流和版本发布
- [CI/CD](./CICD_PIPELINE.md) - 持续集成和部署
- [代码审查](./CODE_REVIEW.md) - 代码审查流程和标准

---

## 🛠️ 开发工具链

### 必需工具
- **Node.js**: v16.0+ (推荐v18.x)
- **npm**: v8.0+ 或 **yarn**: v1.22+
- **Git**: v2.30+
- **VS Code**: 推荐IDE

### 推荐插件
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### 开发依赖
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "eslint": "^8.25.0",
    "prettier": "^2.7.1",
    "husky": "^8.0.1",
    "lint-staged": "^13.0.3"
  }
}
```

---

## 🏃‍♂️ 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-org/mes-system.git
cd mes-system
```

### 2. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 3. 配置环境
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
vim .env
```

### 4. 启动开发服务
```bash
# 启动后端服务 (端口: 5000)
npm run dev

# 启动前端服务 (端口: 3000)
cd client
npm start
```

### 5. 访问系统
- 前端地址: http://localhost:3000
- 后端API: http://localhost:5000/api
- 数据库: MySQL (端口: 3306)

---

## 📁 项目结构

```
mes-system/
├── client/                 # 前端React应用
│   ├── public/            # 静态资源
│   ├── src/               # 源代码
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   ├── styles/        # 样式文件
│   │   └── App.js         # 应用入口
│   └── package.json       # 前端依赖
├── server/                # 后端Node.js应用
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   └── app.js            # 服务器入口
├── database/             # 数据库相关
│   ├── migrations/       # 数据库迁移
│   ├── seeds/           # 测试数据
│   └── init.sql         # 初始化脚本
├── docs/                # 项目文档
├── scripts/             # 构建脚本
├── tests/               # 测试文件
├── docker-compose.yml   # Docker配置
├── package.json         # 项目依赖
└── README.md           # 项目说明
```

---

## 🔄 开发流程

### 1. 功能开发流程
```
需求分析 → 设计方案 → 编码实现 → 单元测试 → 代码审查 → 集成测试 → 部署发布
```

### 2. Git工作流
```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发和提交
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature

# 创建Pull Request
# 代码审查和合并
```

### 3. 代码规范
- 使用ESLint和Prettier进行代码格式化
- 遵循Airbnb JavaScript Style Guide
- 组件命名使用PascalCase
- 文件命名使用kebab-case
- 提交信息遵循Conventional Commits

---

## 🧪 测试策略

### 测试类型
- **单元测试**: 组件和函数测试
- **集成测试**: API接口测试
- **端到端测试**: 用户流程测试
- **性能测试**: 系统性能测试

### 测试工具
- **Jest**: JavaScript测试框架
- **React Testing Library**: React组件测试
- **Supertest**: API接口测试
- **Cypress**: 端到端测试

### 测试命令
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

---

## 📈 性能优化

### 前端优化
- 代码分割和懒加载
- 组件缓存和memo
- 虚拟滚动优化
- 图片压缩和CDN

### 后端优化
- 数据库查询优化
- 缓存策略实施
- API响应压缩
- 连接池管理

### 数据库优化
- 索引优化
- 查询优化
- 分表分库
- 读写分离

---

## 🔒 安全开发

### 安全原则
- 输入验证和过滤
- 输出编码和转义
- 身份认证和授权
- 数据加密传输

### 安全措施
- JWT令牌认证
- RBAC权限控制
- SQL注入防护
- XSS攻击防护
- CSRF攻击防护

---

## 📞 开发支持

### 技术交流
- **开发者群组**: dev-team@mes-system.com
- **技术文档**: https://docs.mes-system.com
- **代码仓库**: https://github.com/your-org/mes-system
- **问题跟踪**: https://github.com/your-org/mes-system/issues

### 学习资源
- **React官方文档**: https://reactjs.org/docs
- **Node.js官方文档**: https://nodejs.org/docs
- **Ant Design组件库**: https://ant.design/docs/react
- **MySQL官方文档**: https://dev.mysql.com/doc

---

**文档版本**: v1.0.0  
**最后更新**: 2024-12-22  
**维护团队**: MES开发组