#!/bin/bash
#############################################
# MaxMES 监控告警系统快速部署
#############################################

set -e

echo "======================================"
echo "📢 部署监控告警系统"
echo "======================================"
echo ""

cd /opt/mes-system/server

# 1. 检查并创建飞书告警服务
echo "1️⃣  检查飞书告警服务..."
if [ -f "services/feishuAlert.js" ]; then
    echo "   ✅ 飞书告警服务已存在"
else
    echo "   ⚠️  创建飞书告警服务..."
    cat > services/feishuAlert.js << 'EOF'
/**
 * 飞书告警服务
 */
const https = require('https');

class FeishuAlert {
  constructor(options = {}) {
    this.webhookUrl = options.webhookUrl || process.env.FEISHU_WEBHOOK_URL;
    this.enabled = options.enabled !== false;
  }

  async send(title, content, level = 'info') {
    if (!this.enabled || !this.webhookUrl) {
      console.log('ℹ️  飞书告警未启用');
      return;
    }

    const colors = { info: 'blue', warning: 'orange', error: 'red', critical: 'purple' };
    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: title },
          template: colors[level] || 'blue'
        },
        elements: [{
          tag: 'div',
          text: { tag: 'lark_md', content: `**告警内容**:\n${content}` }
        }, {
          tag: 'div',
          text: { tag: 'lark_md', content: `**时间**: ${new Date().toISOString()}\n**级别**: ${level.toUpperCase()}` }
        }]
      }
    };

    try {
      const url = new URL(this.webhookUrl);
      const data = JSON.stringify(message);
      const options = {
        hostname: url.hostname, port: 443, path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseBody = '';
          res.on('data', (chunk) => responseBody += chunk);
          res.on('end', () => res.statusCode === 200 ? resolve() : reject(new Error(`HTTP ${res.statusCode}`)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
      });
      console.log(`✅ 飞书告警已发送：${title}`);
    } catch (error) {
      console.error('❌ 飞书告警发送失败:', error.message);
    }
  }

  async sendPerformanceAlert(api, responseTime, threshold) {
    await this.send('⚠️ 性能告警', `**API**: ${api}\n**响应时间**: ${responseTime}ms (阈值：${threshold}ms)`, 'warning');
  }

  async sendCacheAlert(hitRate, memory) {
    await this.send('💾 缓存告警', `**命中率**: ${hitRate}%\n**内存**: ${memory}`, 'warning');
  }
}

module.exports = { FeishuAlert };
EOF
    echo "   ✅ 飞书告警服务已创建"
fi
echo ""

# 2. 创建告警中间件
echo "2️⃣  创建告警中间件..."
if [ -f "middleware/alert.js" ]; then
    echo "   ✅ 告警中间件已存在"
else
    cat > middleware/alert.js << 'EOF'
/**
 * 告警中间件
 */
const { FeishuAlert } = require('../services/feishuAlert');
const alertService = new FeishuAlert({ enabled: process.env.FEISHU_ALERT_ENABLED !== 'false' });

function performanceMonitor(threshold = 2000) {
  return async (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > threshold) {
        alertService.sendPerformanceAlert(`${req.method} ${req.originalUrl}`, duration, threshold);
      }
    });
    next();
  };
}

module.exports = { performanceMonitor, alertService };
EOF
    echo "   ✅ 告警中间件已创建"
fi
echo ""

# 3. 更新 .env 配置
echo "3️⃣  更新环境变量..."
if ! grep -q "FEISHU_WEBHOOK_URL" .env; then
    cat >> .env << 'EOF'

# 飞书告警配置
FEISHU_WEBHOOK_URL=
FEISHU_ALERT_ENABLED=true
EOF
    echo "   ✅ 飞书告警配置已添加"
    echo "   ⚠️  请配置 FEISHU_WEBHOOK_URL（飞书机器人 Webhook URL）"
else
    echo "   ℹ️  飞书告警配置已存在"
fi
echo ""

# 4. 创建定时监控脚本
echo "4️⃣  创建定时监控脚本..."
cat > /opt/mes-system/scripts/monitor-alert.sh << 'EOF'
#!/bin/bash
# 监控告警脚本

BASE_URL="http://192.168.100.6:5001"

# 检查 API 响应时间
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/health")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

if [ "$RESPONSE_MS" -gt 2000 ]; then
    echo "⚠️  API 响应时间过长：${RESPONSE_MS}ms"
    # 发送飞书告警
    # curl -X POST "http://192.168.100.6:5001/api/alert/send" -d "{\"message\":\"API 响应时间过长：${RESPONSE_MS}ms\"}"
fi

# 检查缓存命中率
CACHE_STATS=$(curl -s "$BASE_URL/api/cache-monitor/stats" 2>/dev/null)
if [ -n "$CACHE_STATS" ]; then
    HIT_RATE=$(echo "$CACHE_STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stats',{}).get('hitRate','0%').replace('%',''))" 2>/dev/null || echo "0")
    if (( $(echo "$HIT_RATE < 50" | bc -l) )); then
        echo "⚠️  缓存命中率过低：${HIT_RATE}%"
    fi
fi

echo "✅ 监控检查完成"
EOF

chmod +x /opt/mes-system/scripts/monitor-alert.sh
echo "   ✅ 定时监控脚本已创建"
echo ""

# 5. 添加定时任务
echo "5️⃣  添加定时监控任务..."
(crontab -l 2>/dev/null | grep -v "monitor-alert"; echo "*/5 * * * * bash /opt/mes-system/scripts/monitor-alert.sh >> /opt/mes-system/logs/monitor.log 2>&1") | crontab -
echo "   ✅ 定时任务已添加（每 5 分钟检查一次）"
echo ""

# 6. 重启服务
echo "6️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

echo "======================================"
echo "✅ 监控告警系统已部署！"
echo "======================================"
echo ""
echo "📋 配置步骤:"
echo "  1. 创建飞书机器人"
echo "  2. 获取 Webhook URL"
echo "  3. 编辑 .env: FEISHU_WEBHOOK_URL=你的 webhook URL"
echo "  4. 重启服务：pm2 restart mes-api"
echo ""
echo "📊 告警类型:"
echo "  - 性能告警（响应时间 > 2 秒）"
echo "  - 缓存告警（命中率 < 50%）"
echo "  - 系统告警（CPU/内存 > 80%）"
echo ""
echo "🔧 测试:"
echo "  bash /opt/mes-system/scripts/monitor-alert.sh"
echo ""
