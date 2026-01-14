# MES制造执行系统 - Ubuntu部署文档

## 📌 快速导航

本项目包含完整的Ubuntu服务器部署文档和自动化脚本。请根据你的需求选择相应的文档。

---

## 🚀 快速开始（3种方式）

### 方式1️⃣: 一键自动部署（最快，15-20分钟）

**适合**: 新手、想快速部署

```bash
# 1. 下载部署脚本
wget https://your-repo/deploy.sh
chmod +x deploy.sh

# 2. 运行脚本
./deploy.sh

# 3. 按照提示输入信息
# 完成！
```

**文档**: 查看 `deploy.sh` 脚本中的注释

---

### 方式2️⃣: 快速手动部署（中等，20-30分钟）

**适合**: 有Linux经验的人、想快速参考

```bash
# 1. 阅读快速开始指南
cat DEPLOYMENT_QUICK_START.md

# 2. 按照指南逐步执行命令
# 3. 使用检查清单验证部署
cat DEPLOYMENT_CHECKLIST.md
```

**文档**: `DEPLOYMENT_QUICK_START.md`

---

### 方式3️⃣: 详细学习部署（深入，45-60分钟）

**适合**: 想深入了解系统、需要自定义配置

```bash
# 1. 阅读完整部署指南
cat UBUNTU_DEPLOYMENT_GUIDE.md

# 2. 理解每个步骤的原理
# 3. 根据指南逐步部署
# 4. 使用检查清单验证部署
cat DEPLOYMENT_CHECKLIST.md
```

**文档**: `UBUNTU_DEPLOYMENT_GUIDE.md`

---

## 📚 文档说明

### 📖 UBUNTU_DEPLOYMENT_GUIDE.md
**完整的分步部署指南**

- 系统要求和前置准备
- 环境安装详细步骤
- 项目部署和配置
- 数据库配置
- 应用启动和PM2配置
- Nginx反向代理配置
- 系统监控和日志管理
- 备份和恢复策略
- 故障排查指南
- 性能优化建议
- 安全配置建议

**何时使用**: 首次部署、需要详细了解每个步骤

**阅读时间**: 30-45分钟

---

### ⚡ DEPLOYMENT_QUICK_START.md
**快速部署指南和命令速查表**

- 5分钟快速部署步骤
- 分步骤的手动部署
- 常用命令速查表
- 常见问题快速解答
- 性能优化快速建议
- 安全配置快速建议

**何时使用**: 快速部署、需要命令参考

**阅读时间**: 10-15分钟

---

### 🔧 MAINTENANCE_GUIDE.md
**日常维护和故障排查指南**

- 日常维护任务（每日、每周、每月）
- 监控和告警配置
- 备份和恢复脚本
- 性能调优方法
- 常见问题详细解答
- 应急处理流程

**何时使用**: 系统已部署、需要日常维护或遇到问题

**阅读时间**: 20-30分钟

---

### ✅ DEPLOYMENT_CHECKLIST.md
**部署检查清单**

- 部署前准备检查
- 环境安装检查
- 数据库配置检查
- 应用部署检查
- 应用启动检查
- Nginx配置检查
- 功能验证检查
- 安全配置检查
- 监控和备份检查
- 性能检查
- 部署完成确认

**何时使用**: 部署过程中逐项检查、部署完成后的最终验证

**阅读时间**: 15-20分钟

---

### 🤖 deploy.sh
**自动部署脚本**

一键自动完成所有部署步骤：
- 检查系统环境
- 安装所有必要软件
- 配置数据库
- 部署应用
- 启动服务
- 验证部署

**何时使用**: 首次部署、想快速部署

**执行时间**: 15-20分钟

```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 📑 DEPLOYMENT_DOCUMENTATION_INDEX.md
**文档索引和使用指南**

- 所有文档的概览
- 文档使用建议
- 部署流程指南
- 文档关系图

**何时使用**: 快速查找相关文档

**阅读时间**: 5-10分钟

---

### 📋 DEPLOYMENT_SUMMARY.md
**部署方案总结**

- 项目概述
- 系统架构
- 三种部署方案对比
- 部署步骤概览
- 关键配置文件
- 系统要求
- 安全建议
- 性能优化
- 常见问题快速解答

**何时使用**: 了解整体部署方案

**阅读时间**: 10-15分钟

---

## 🎯 选择你的部署方案

### 我是新手，想快速部署
👉 **推荐**: 运行 `./deploy.sh` 脚本

### 我有Linux经验，想快速部署
👉 **推荐**: 阅读 `DEPLOYMENT_QUICK_START.md`

### 我想深入了解系统
👉 **推荐**: 阅读 `UBUNTU_DEPLOYMENT_GUIDE.md`

### 我需要验证部署是否完整
👉 **推荐**: 使用 `DEPLOYMENT_CHECKLIST.md`

### 系统已部署，我需要日常维护
👉 **推荐**: 阅读 `MAINTENANCE_GUIDE.md`

### 系统出现问题，我需要排查
👉 **推荐**: 查看 `MAINTENANCE_GUIDE.md` 中的故障排查部分

---

## 📊 部署时间和难度对比

| 方案 | 时间 | 难度 | 自动化 | 可定制 | 适用人群 |
|------|------|------|--------|--------|---------|
| 一键部署 | 15-20分钟 | ⭐ | 100% | 0% | 新手 |
| 快速部署 | 20-30分钟 | ⭐⭐ | 50% | 50% | 有经验的人 |
| 详细部署 | 45-60分钟 | ⭐⭐⭐ | 0% | 100% | 想深入学习的人 |

---

## ✅ 部署前检查清单

- [ ] 操作系统为Ubuntu 20.04 LTS或22.04 LTS
- [ ] 至少4GB内存可用
- [ ] 至少50GB磁盘空间
- [ ] 网络连接正常
- [ ] 已创建专用应用用户（可选但推荐）

---

## 🔍 部署后验证

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

# 4. 查看应用日志
pm2 logs mes-api
```

---

## 📞 获取帮助

### 遇到部署问题
1. 查看相关文档的"常见问题"部分
2. 查看 `MAINTENANCE_GUIDE.md` 中的"故障排查"部分
3. 查看应用日志：`pm2 logs mes-api`

### 需要技术支持
- 查看项目README
- 提交问题到GitHub：https://github.com/xiaomaimax/maxmes/issues
- 联系系统管理员

### 需要性能优化
- 查看 `UBUNTU_DEPLOYMENT_GUIDE.md` 中的"性能优化"部分
- 查看 `MAINTENANCE_GUIDE.md` 中的"性能调优"部分

---

## 📝 文档版本

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2024-01-15 | 初始版本，包含完整的部署文档 |

---

## 🎉 开始部署

现在你已经准备好部署MES系统了！

**选择你的部署方案**:

1. **快速部署** → 运行 `./deploy.sh`
2. **快速参考** → 阅读 `DEPLOYMENT_QUICK_START.md`
3. **详细学习** → 阅读 `UBUNTU_DEPLOYMENT_GUIDE.md`

**部署完成后**:

1. 使用 `DEPLOYMENT_CHECKLIST.md` 验证部署
2. 阅读 `MAINTENANCE_GUIDE.md` 了解日常维护

---

## 📚 文档列表

```
部署文档/
├── DEPLOYMENT_README.md (本文件)
├── DEPLOYMENT_SUMMARY.md (部署方案总结)
├── DEPLOYMENT_DOCUMENTATION_INDEX.md (文档索引)
├── UBUNTU_DEPLOYMENT_GUIDE.md (完整部署指南)
├── DEPLOYMENT_QUICK_START.md (快速开始指南)
├── MAINTENANCE_GUIDE.md (维护和故障排查指南)
├── DEPLOYMENT_CHECKLIST.md (部署检查清单)
└── deploy.sh (自动部署脚本)
```

---

## 🌟 特别提示

### 安全建议
- 修改所有默认密码
- 配置防火墙
- 启用SSL证书
- 定期更新系统

### 性能建议
- 使用集群模式运行Node.js
- 启用Gzip压缩
- 配置数据库缓存
- 定期优化数据库

### 维护建议
- 配置自动备份
- 配置监控告警
- 定期检查日志
- 定期更新依赖

---

## 💡 常见问题

### Q: 部署需要多长时间？
A: 取决于你选择的方案：
- 一键部署：15-20分钟
- 快速部署：20-30分钟
- 详细部署：45-60分钟

### Q: 我是新手，应该选择哪个方案？
A: 推荐选择一键部署（运行 `./deploy.sh`），最快最简单。

### Q: 部署失败了怎么办？
A: 查看 `MAINTENANCE_GUIDE.md` 中的"故障排查"部分。

### Q: 部署完成后需要做什么？
A: 使用 `DEPLOYMENT_CHECKLIST.md` 验证部署，然后阅读 `MAINTENANCE_GUIDE.md` 了解日常维护。

### Q: 如何备份数据？
A: 查看 `MAINTENANCE_GUIDE.md` 中的"备份和恢复"部分。

---

## 🚀 立即开始

```bash
# 方式1: 一键部署（推荐新手）
chmod +x deploy.sh
./deploy.sh

# 方式2: 快速部署（推荐有经验的人）
cat DEPLOYMENT_QUICK_START.md

# 方式3: 详细部署（推荐深入学习）
cat UBUNTU_DEPLOYMENT_GUIDE.md
```

---

**祝你部署顺利！** 🎉

**最后更新**: 2024-01-15
**维护者**: MES系统团队
**联系方式**: admin@example.com
