# MaxMES 测试指南 - 快速开始

## 🚀 一键测试命令

### 1. PWA 文件验证（推荐先执行）
```bash
ssh root@192.168.100.6 "bash /opt/mes-system/scripts/pwa-verify.sh"
```

**预期时间**: 30 秒  
**输出**: 文件存在性检查、manifest 验证、SW 验证

---

### 2. Lighthouse 性能测试
```bash
# 需要先安装 Lighthouse
npm install -g lighthouse

# 运行测试
ssh root@192.168.100.6 "bash /opt/mes-system/scripts/lighthouse-test.sh"
```

**预期时间**: 2-3 分钟  
**输出**: HTML 报告 + JSON 数据

---

### 3. Puppeteer 自动化测试
```bash
# 需要先安装 Puppeteer
ssh root@192.168.100.6 "npm install -g puppeteer"

# 运行测试
ssh root@192.168.100.6 "node /opt/mes-system/scripts/pwa-test-automated.js"
```

**预期时间**: 1-2 分钟  
**输出**: JSON 报告 + 截图

---

## 📱 Chrome DevTools 手动测试

### 快速验证流程（5 分钟）

#### 步骤 1: 打开应用
```
http://192.168.100.6
```

#### 步骤 2: 打开 DevTools
```
F12 或 Ctrl+Shift+I
```

#### 步骤 3: 检查 Service Worker
```
Application → Service Workers
- 状态应该是 "activated"
- 点击 "Update" 强制更新
```

✅ **通过标准**: Status = activated

#### 步骤 4: 检查缓存
```
Application → Cache Storage → maxmes-static-v1
- 展开查看缓存的资源
```

✅ **通过标准**: 存在 index.html、main.js、antd.js

#### 步骤 5: 检查 Manifest
```
Application → Manifest
- 查看应用信息
```

✅ **通过标准**: 
- Name: MaxMES 制造执行系统
- Display: standalone
- Theme color: #3b82f6

#### 步骤 6: 离线测试 ⭐
```
1. Network 面板 → 勾选 "Offline"
2. 刷新页面（Ctrl+R）
3. 观察页面是否正常显示
4. 取消 "Offline" 勾选
```

✅ **通过标准**: 离线模式下页面可访问

#### 步骤 7: 添加到主屏幕（可选）
```
1. 地址栏右侧出现安装图标 ⬇️
2. 点击安装
3. 从主屏幕启动
```

✅ **通过标准**: 独立窗口运行，无浏览器 UI

---

## 📊 Lighthouse 测试目标

### 最低要求
| 类别 | 分数 | 状态 |
|------|------|------|
| Performance | 85+ | ⭐⭐⭐ |
| Accessibility | 90+ | ⭐⭐ |
| Best Practices | 90+ | ⭐⭐ |
| SEO | 90+ | ⭐ |
| PWA | 100 | ⭐⭐⭐ |

### 关键指标
- **FCP**: < 1.5s ✅
- **LCP**: < 2.5s ✅
- **CLS**: < 0.1 ✅
- **离线访问**: 支持 ✅

---

## 🐛 常见问题排查

### Q1: Service Worker 未注册
**原因**: 
- service-worker.js 文件不存在
- index.html 缺少注册代码
- HTTPS 问题（生产环境需要 HTTPS）

**解决**:
```bash
# 检查文件是否存在
ssh root@192.168.100.6 "ls -la /opt/mes-system/client/public/service-worker.js"

# 重新部署
cat service-worker.js | ssh root@192.168.100.6 "tee /opt/mes-system/client/public/service-worker.js"
```

### Q2: 离线模式无法访问
**原因**:
- Service Worker 未正确缓存资源
- 缓存策略配置错误

**解决**:
```bash
# 检查 Service Worker 代码
ssh root@192.168.100.6 "cat /opt/mes-system/client/public/service-worker.js | grep -A 10 'STATIC_ASSETS'"

# 清除缓存后重试
# DevTools → Application → Service Workers → Unregister
# 刷新页面
```

### Q3: Manifest 解析失败
**原因**:
- manifest.json 格式错误
- 路径配置错误

**解决**:
```bash
# 验证 JSON 格式
ssh root@192.168.100.6 "cat /opt/mes-system/client/public/manifest.json | jq ."

# 检查 index.html 中的链接
ssh root@192.168.100.6 "grep manifest /opt/mes-system/client/public/index.html"
```

---

## 📈 性能优化建议

### 如果 Performance < 85

1. **减少 JS 体积**
```bash
# 检查构建体积
ssh root@192.168.100.6 "du -sh /opt/mes-system/client/build/"
```

2. **启用 CDN**
- 参考 `MaxMES-CDN-配置指南.md`

3. **优化图片**
```bash
# 转换 WebP 格式
ssh root@192.168.100.6 "bash /opt/mes-system/scripts/convert-to-webp.sh"
```

4. **启用 Gzip/Brotli**
- 部署 Nginx 性能配置

---

## ✅ 测试清单

### 基础验证
- [ ] PWA 文件验证通过
- [ ] Service Worker 激活
- [ ] Manifest 解析成功
- [ ] 缓存创建成功

### 功能测试
- [ ] 离线模式可访问
- [ ] 添加到主屏幕正常
- [ ] 独立窗口运行
- [ ] 推送通知（如实现）

### 性能测试
- [ ] Lighthouse Performance ≥ 85
- [ ] Lighthouse PWA = 100
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Chrome 移动版
- [ ] Safari（iOS）
- [ ] Firefox（可选）

---

## 📞 需要帮助？

**文档位置**:
- `/opt/mes-system/docs/`
- PWA 验证报告
- 性能测试报告
- CDN 配置指南

**测试脚本**:
- `/opt/mes-system/scripts/`
- pwa-verify.sh
- lighthouse-test.sh
- pwa-test-automated.js

---

*小虾 🦐 | 2026-04-04 10:55*
