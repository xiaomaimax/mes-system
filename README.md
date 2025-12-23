# MES制造执行系统

[![Version](https://img.shields.io/badge/version-v1.1.0-blue.svg)](https://github.com/xiaomaimax/maxmes)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1.svg)](https://www.mysql.com/)

> 🏭 现代化的制造执行系统，集成生产管理、质量控制、设备维护等核心功能，助力制造企业数字化转型。

## ✨ 系统特色

### 🎯 核心功能
- **📊 数据驱动** - 完整的模拟数据系统，真实业务场景演示
- **🔧 全流程管理** - 从工艺设计到生产执行的完整闭环
- **📈 实时监控** - 生产状态、设备运行、质量指标实时展示
- **👥 权限管控** - 基于角色和部门的精细化权限管理
- **🔗 系统集成** - 支持ERP、WMS等外部系统数据对接

### 🚀 技术亮点
- **现代化架构** - React 18 + Ant Design 5.x 响应式设计
- **数据工具** - 完整的数据服务层和计算工具类
- **性能优化** - 组件懒加载、数据缓存、虚拟滚动
- **容器化部署** - Docker支持，一键部署
- **文档完善** - 详细的开发和使用文档

## 🏗️ 系统架构

```
MES制造执行系统
├── 工艺管理 - 工艺路线、参数、文档管理
├── 生产管理 - 计划、任务、执行、报工
├── 设备管理 - 维护、点检、维修、档案
├── 质量管理 - IQC/PQC/FQC/OQC检验
├── 库存管理 - 出入库、调拨、盘点、预警
├── 人员管理 - 员工、考勤、培训、绩效
├── 系统集成 - 接口管理、数据同步
├── 报表分析 - 生产报表、质量分析
└── 系统设置 - 用户管理、权限配置
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/xiaomaimax/maxmes.git
cd maxmes
```

2. **安装依赖**
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

3. **配置数据库**
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑数据库配置
# 修改 .env 文件中的数据库连接信息
```

4. **初始化数据库**
```bash
# 创建数据库和表
npm run setup-db
```

5. **启动服务**
```bash
# 启动后端服务
npm run server

# 启动前端服务（新终端）
npm run client

# 或者同时启动前后端
npm run dev
```

6. **访问系统**
- 前端地址: http://localhost:3000
- 后端API: http://localhost:5000

### 默认账户
- 超级管理员: admin / admin123
- 部门管理员: manager / manager123
- 技术管理员: tech / tech123
- 普通用户: user / user123

## 📱 系统截图

### 登录界面
![登录界面](docs/images/login.png)

### 系统首页
![系统首页](docs/images/dashboard.png)

### 生产管理
![生产管理](docs/images/production.png)

### 质量管理
![质量管理](docs/images/quality.png)

## 🔧 技术栈

### 前端技术
- **React 18.2.0** - 用户界面框架
- **Ant Design 5.x** - UI组件库
- **React Router** - 路由管理
- **Axios** - HTTP客户端
- **Day.js** - 日期处理

### 后端技术
- **Node.js** - 运行环境
- **Express** - Web框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcrypt** - 密码加密

### 开发工具
- **Docker** - 容器化部署
- **ESLint** - 代码规范
- **Prettier** - 代码格式化

## 📚 文档

- [📖 用户手册](docs/04-user-guide/USER_GUIDE.md)
- [🔧 开发指南](docs/05-development/DEVELOPMENT_GUIDE.md)
- [🏗️ 部署指南](docs/06-deployment/DEPLOYMENT_GUIDE.md)
- [📝 API文档](docs/05-development/API_REFERENCE.md)
- [🔄 版本历史](docs/07-changelog/VERSION_HISTORY.md)

## 🎯 功能模块

### 1. 工艺管理
- 工艺路线设计
- 工艺参数管理
- 工艺文档管理
- 工艺变更控制

### 2. 生产管理
- 生产计划制定
- 生产任务分配
- 生产执行监控
- 生产报工统计

### 3. 设备管理
- 设备档案管理
- 设备维护计划
- 设备故障处理
- 设备点检记录

### 4. 质量管理
- IQC进料检验
- PQC过程检验
- FQC成品检验
- OQC出货检验

### 5. 库存管理
- 物料主数据
- 出入库管理
- 库存调拨
- 库存盘点

### 6. 人员管理
- 员工信息管理
- 考勤管理
- 培训管理
- 绩效评估

### 7. 系统集成
- 数据接口管理
- 系统配置
- 数据同步监控
- API文档管理

### 8. 报表分析
- 生产报表
- 质量分析
- 设备分析
- 自定义报表

### 9. 系统设置
- 用户管理
- 角色权限
- 部门配置
- 系统参数

## 🔐 权限管理

系统采用RBAC（基于角色的访问控制）模型：

- **超级管理员** - 全系统访问权限
- **部门管理员** - 部门级管理权限
- **技术管理员** - 技术相关模块权限
- **普通用户** - 基础操作权限

## 🐳 Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 📧 邮箱: 10044750@qq.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/xiaomaimax/maxmes/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/xiaomaimax/maxmes/discussions)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xiaomaimax/maxmes&type=Date)](https://star-history.com/#xiaomaimax/maxmes&Date)

---

**如果这个项目对你有帮助，请给它一个 ⭐️！**