# MES制造执行系统

<div align="center">

![MES Logo](https://img.shields.io/badge/MES-制造执行系统-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.x-0170fe?style=flat-square&logo=ant-design)](https://ant.design/)

**现代化的制造执行管理平台**

[🚀 快速开始](#-快速开始) • [📖 文档](#-文档) • [✨ 特性](#-核心特性) • [🛠️ 技术栈](#️-技术栈) • [📞 支持](#-技术支持)

</div>

---

## 📋 项目简介

MES制造执行系统是一个基于React + Node.js开发的现代化制造执行管理平台，为制造企业提供全面的生产过程管理、质量控制、设备管理和数据分析功能。

### 🎯 核心价值
- **🏭 生产效率提升 15-25%**
- **📊 实时数据可视化**
- **🔍 全程质量追溯**
- **⚙️ 设备智能管理**
- **📈 数据驱动决策**

## ✨ 核心特性

<table>
<tr>
<td width="50%">

### 🏭 生产管理
- 生产计划制定与执行
- 实时生产监控
- 工单管理与跟踪
- 生产效率分析

### 🔧 工艺管理  
- 工艺路线标准化
- 工艺参数控制
- 工艺文件管理
- 持续改进优化

### 🏗️ 设备管理
- 设备档案管理
- 预防性维护
- 故障管理分析
- OEE效率统计

### 🔍 质量管理
- 全流程质量控制
- 检验标准管理
- 不良品追溯
- 质量数据分析

</td>
<td width="50%">

### 📦 库存管理
- 物料全生命周期管理
- 智能出入库控制
- 库存盘点优化
- 成本分析报表

### 👥 人员管理
- 员工档案管理
- 考勤培训管理
- 绩效评估体系
- 技能认证追踪

### 🔗 系统集成
- ERP/WMS系统对接
- 设备数据采集
- 第三方接口集成
- 消息推送服务

### 📊 报表分析
- 实时数据看板
- 专业分析报表
- 自定义报表设计
- KPI指标监控

</td>
</tr>
</table>

## 🛠️ 技术栈

### 前端技术
```
React 18 + Ant Design + React Router + Recharts
```

### 后端技术  
```
Node.js + Express + MySQL + JWT + WebSocket
```

### 开发工具
```
Git + ESLint + Prettier + Jest + Docker
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 8.0+

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-org/mes-system.git
cd mes-system

# 2. 安装依赖
npm install
cd client && npm install && cd ..

# 3. 配置环境
cp .env.example .env
# 编辑 .env 文件配置数据库等信息

# 4. 初始化数据库
mysql -u root -p mes_system < database/init.sql

# 5. 启动服务
npm run dev          # 后端服务
cd client && npm start  # 前端服务 (新终端)
```

### 访问系统
- **前端地址**: http://localhost:3000
- **默认账号**: admin / admin123

详细安装指南请参考 [快速开始文档](./docs/02-installation/QUICK_START.md)

## 📖 文档

### 📚 完整文档
- [📋 项目概述](./docs/01-project-overview/README.md)
- [🚀 快速安装](./docs/02-installation/QUICK_START.md)  
- [🏗️ 系统架构](./docs/03-architecture/SYSTEM_ARCHITECTURE.md)
- [📖 用户手册](./docs/04-user-guide/USER_GUIDE.md)
- [🔧 开发指南](./docs/05-development/DEVELOPMENT_GUIDE.md)
- [🚀 部署运维](./docs/06-deployment/DEPLOYMENT_GUIDE.md)

### 📝 开发文档
- [API接口文档](./docs/05-development/API_REFERENCE.md)
- [组件开发指南](./docs/05-development/COMPONENTS.md)
- [数据库设计](./docs/05-development/DATABASE_DESIGN.md)

## 🖼️ 系统截图

<details>
<summary>点击查看系统界面</summary>

### 首页概览
![首页](./docs/images/homepage.png)

### 生产管理
![生产管理](./docs/images/production.png)

### 质量管理  
![质量管理](./docs/images/quality.png)

### 数据看板
![数据看板](./docs/images/dashboard.png)

</details>

## 📊 项目结构

```
mes-system/
├── 📁 client/                 # 前端应用
│   ├── 📁 public/            # 静态资源
│   └── 📁 src/
│       ├── 📁 components/    # React组件
│       ├── 📁 services/      # API服务
│       ├── 📁 utils/         # 工具函数
│       └── 📄 App.js         # 应用入口
├── 📁 server/                # 后端应用  
│   ├── 📁 controllers/       # 控制器
│   ├── 📁 models/           # 数据模型
│   ├── 📁 routes/           # 路由定义
│   └── 📄 app.js            # 服务入口
├── 📁 database/             # 数据库脚本
├── 📁 docs/                 # 项目文档
├── 📁 scripts/              # 工具脚本
├── 📄 package.json          # 项目配置
├── 📄 docker-compose.yml    # Docker配置
└── 📄 README.md             # 项目说明
```

## 🚀 部署方式

### Docker 部署 (推荐)
```bash
# 使用 Docker Compose 一键部署
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 传统部署
```bash
# 构建前端
cd client && npm run build

# 启动生产服务
npm start
```

详细部署指南请参考 [部署文档](./docs/06-deployment/DEPLOYMENT_GUIDE.md)

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行前端测试
cd client && npm test

# 运行后端测试  
npm run test:server

# 生成测试覆盖率报告
npm run test:coverage
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式
1. 🍴 Fork 项目
2. 🌟 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送分支 (`git push origin feature/AmazingFeature`)
5. 🔀 创建 Pull Request

### 开发规范
- 遵循 ESLint 代码规范
- 编写单元测试
- 更新相关文档
- 提交信息使用约定式提交

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 许可证。

## 📞 技术支持

### 获取帮助
- 📧 **邮件支持**: support@your-domain.com
- 💬 **在线客服**: https://chat.your-domain.com
- 📖 **文档中心**: https://docs.your-domain.com
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-org/mes-system/issues)

### 社区资源
- 🌐 **官方网站**: https://mes.your-domain.com
- 📺 **视频教程**: https://video.your-domain.com
- 💬 **用户论坛**: https://forum.your-domain.com
- 📝 **技术博客**: https://blog.your-domain.com

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/mes-system&type=Date)](https://star-history.com/#your-org/mes-system&Date)

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐ Star！**

Made with ❤️ by [MES开发团队](https://github.com/your-org)

</div>