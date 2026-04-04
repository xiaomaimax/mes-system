#!/bin/bash
# MaxMES PWA 离线功能验证脚本

set -e

echo "🧪 MaxMES PWA 离线功能验证"
echo "================================"
echo ""

SERVER="root@192.168.100.6"
CLIENT_DIR="/opt/mes-system/client"

# 1. 检查 PWA 文件是否存在
echo "1️⃣ 检查 PWA 文件"
echo "--------------------------------"

check_file() {
    if ssh $SERVER "test -f $1 && echo '✅' || echo '❌'"; then
        echo "✅ $1"
    else
        echo "❌ $1 (缺失)"
    fi
}

check_file "$CLIENT_DIR/public/manifest.json"
check_file "$CLIENT_DIR/public/service-worker.js"
check_file "$CLIENT_DIR/src/registerServiceWorker.js"

# 检查 index.html 是否包含 PWA 代码
echo ""
echo "检查 index.html PWA 配置..."
ssh $SERVER "grep -q 'manifest' $CLIENT_DIR/public/index.html && echo '✅ manifest 链接存在' || echo '❌ manifest 链接缺失'"
ssh $SERVER "grep -q 'serviceWorker' $CLIENT_DIR/public/index.html && echo '✅ Service Worker 注册代码存在' || echo '❌ Service Worker 注册代码缺失'"
ssh $SERVER "grep -q 'theme-color' $CLIENT_DIR/public/index.html && echo '✅ theme-color 存在' || echo '❌ theme-color 缺失'"

# 2. 验证 manifest.json 内容
echo ""
echo "2️⃣ 验证 manifest.json"
echo "--------------------------------"
ssh $SERVER "cat $CLIENT_DIR/public/manifest.json | head -20"

# 3. 验证 Service Worker
echo ""
echo "3️⃣ 验证 Service Worker"
echo "--------------------------------"
echo "Service Worker 文件大小:"
ssh $SERVER "wc -l $CLIENT_DIR/public/service-worker.js"

echo ""
echo "检查缓存配置:"
ssh $SERVER "grep -E 'CACHE_NAME|STATIC_ASSETS|fetch' $CLIENT_DIR/public/service-worker.js | head -10"

# 4. 构建验证
echo ""
echo "4️⃣ 构建验证"
echo "--------------------------------"
echo "检查构建目录..."
ssh $SERVER "ls -lh $CLIENT_DIR/build/ 2>/dev/null | head -10 || echo '需要重新构建'"

# 5. 手动测试指南
echo ""
echo "5️⃣ 手动测试指南"
echo "================================"
echo ""
echo "📱 Chrome DevTools 测试步骤:"
echo ""
echo "1. 打开应用 (http://192.168.100.6)"
echo "2. F12 打开 DevTools"
echo "3. Application → Service Workers"
echo "   - 检查 Status: activated"
echo "   - 检查 Resources: 缓存的文件列表"
echo ""
echo "4. Application → Cache Storage"
echo "   - 检查 maxmes-static-v1 缓存"
echo "   - 查看缓存的资源列表"
echo ""
echo "5. Application → Manifest"
echo "   - 检查 manifest 解析状态"
echo "   - 查看应用信息（名称、图标等）"
echo ""
echo "6. 离线测试:"
echo "   - Network 面板 → 勾选 'Offline'"
echo "   - 刷新页面"
echo "   - 验证页面是否正常显示"
echo "   - 检查 Console 中的 Service Worker 日志"
echo ""
echo "7. 添加到主屏幕测试:"
echo "   - Chrome: 地址栏右侧出现安装图标"
echo "   - 点击安装，验证应用名称和图标"
echo "   - 从主屏幕启动，验证独立窗口运行"
echo ""

# 6. 自动化测试（如果安装了 Puppeteer）
echo "6️⃣ 自动化测试（可选）"
echo "================================"
echo ""
echo "如需自动化测试，请安装 Puppeteer:"
echo ""
echo "npm install -g puppeteer"
echo ""
echo "然后运行:"
echo "node scripts/pwa-test-automated.js"
echo ""

echo "================================"
echo "PWA 验证完成！"
echo ""
echo "📊 预期结果:"
echo "  ✅ manifest.json 存在且有效"
echo "  ✅ Service Worker 注册成功"
echo "  ✅ 静态资源缓存正常"
echo "  ✅ 离线模式可访问"
echo "  ✅ 可添加到主屏幕"
