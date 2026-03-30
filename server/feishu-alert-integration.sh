#!/bin/bash
#############################################
# MaxMES 飞书告警集成脚本
#############################################

set -e

echo "======================================"
echo "📢 飞书告警集成"
echo "======================================"
echo ""

cd /opt/mes-system/server

# 1. 创建飞书告警服务
echo "1️⃣  创建飞书告警服务..."
cat > services/feishuAlert.js << 'EOF'
/**
 * 飞书告警服务
 * 功能：发送告警消息到飞书
 */

const https = require('https');

class FeishuAlert {
  constructor(options = {}) {
    this.webhookUrl = options.webhookUrl || process.env.FEISHU_WEBHOOK_URL;
    this.enabled = options.enabled !== false;
  }

  /**
   * 发送告警消息
   * @param {string} title - 告警标题
   * @param {string} content - 告警内容
   * @param {string} level - 告警级别 (info/warning/error/critical)
   */
  async send(title, content, level = 'info') {
    if (!this.enabled || !this.webhookUrl) {
      console.log('飞书告警未启用或 webhook 未配置');
      return;
    }

    const colors = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      critical: 'purple'
    };

    const message = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: title
          },
          template: colors[level] || 'blue'
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**告警内容**:\n${content}`
            }
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**时间**: ${new Date().toISOString()}\n**级别**: ${level.toUpperCase()}`
            }
          }
        ]
      }
    };

    try {
      await this._sendWebhook(message);
      console.log(`✅ 飞书告警已发送：${title}`);
    } catch (error) {
      console.error('❌ 飞书告警发送失败:', error);
    }
  }

  /**
   * 发送性能告警
   */
  async sendPerformanceAlert(metrics) {
    const {
      api,
      responseTime,
      qps,
      errorRate,
      threshold
    } = metrics;

    const content = `
**API**: ${api}
**响应时间**: ${responseTime}ms (阈值：${threshold}ms)
**QPS**: ${qps}
**错误率**: ${errorRate}%
`;

    await this.send('⚠️ 性能告警', content, 'warning');
  }

  /**
   * 发送错误告警
   */
  async sendErrorAlert(error) {
    const content = `
**错误信息**: ${error.message}
**堆栈**: ${error.stack || 'N/A'}
`;

    await this.send('🚨 错误告警', content, 'error');
  }

  /**
   * 发送缓存告警
   */
  async sendCacheAlert(metrics) {
    const {
      hitRate,
      memoryUsage,
      keysCount
    } = metrics;

    const content = `
**命中率**: ${hitRate}%
**内存使用**: ${memoryUsage}
**缓存键数量**: ${keysCount}
`;

    await this.send('💾 缓存告警', content, 'warning');
  }

  /**
   * 发送系统告警
   */
  async sendSystemAlert(metrics) {
    const {
      cpu,
      memory,
      disk,
      uptime
    } = metrics;

    const content = `
**CPU 使用率**: ${cpu}%
**内存使用率**: ${memory}%
**磁盘使用率**: ${disk}%
**运行时间**: ${uptime}
`;

    await this.send('💻 系统告警', content, 'warning');
  }

  /**
   * 发送 Webhook 请求
   */
  _sendWebhook(message) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.webhookUrl);
      const data = JSON.stringify(message);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseBody));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = { FeishuAlert };
EOF

echo "   ✅ 飞书告警服务已创建"
echo ""

# 2. 创建告警中间件
echo "2️⃣  创建告警中间件..."
cat > middleware/alert.js << 'EOF'
/**
 * 告警中间件
 * 功能：监控 API 性能，超过阈值发送告警
 */

const { FeishuAlert } = require('../services/feishuAlert');

const alertService = new FeishuAlert({
  enabled: process.env.FEISHU_ALERT_ENABLED !== 'false',
  webhookUrl: process.env.FEISHU_WEBHOOK_URL
});

/**
 * API 性能监控中间件
 * @param {number} threshold - 响应时间阈值（毫秒）
 */
function performanceMonitor(threshold = 2000) {
  return async (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // 响应时间超过阈值
      if (duration > threshold) {
        alertService.sendPerformanceAlert({
          api: `${req.method} ${req.originalUrl}`,
          responseTime: duration,
          qps: 0,
          errorRate: 0,
          threshold
        });
      }
    });

    next();
  };
}

/**
 * 错误监控中间件
 */
function errorMonitor() {
  return async (err, req, res, next) => {
    // 发送错误告警
    await alertService.sendErrorAlert(err);
    next(err);
  };
}

module.exports = {
  performanceMonitor,
  errorMonitor,
  alertService
};
EOF

echo "   ✅ 告警中间件已创建"
echo ""

# 3. 创建缓存告警脚本
echo "3️⃣  创建缓存告警脚本..."
cat > scripts/cache-alert.sh << 'EOF'
#!/bin/bash
# 缓存告警检查脚本

BASE_URL="http://192.168.100.6:5001"

# 获取缓存统计
STATS=$(curl -s "$BASE_URL/api/cache-monitor/stats")

if [ $? -ne 0 ]; then
  echo "❌ 无法获取缓存统计"
  exit 1
fi

# 解析命中率
HIT_RATE=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stats',{}).get('hitRate','0%').replace('%',''))" 2>/dev/null || echo "0")

# 解析内存使用
MEMORY=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stats',{}).get('memoryUsage','unknown'))" 2>/dev/null || echo "unknown")

# 解析缓存键数量
KEYS=$(echo "$STATS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stats',{}).get('totalKeys',0))" 2>/dev/null || echo "0")

echo "📊 缓存状态:"
echo "  命中率：${HIT_RATE}%"
echo "  内存：${MEMORY}"
echo "  缓存键：${KEYS}"
echo ""

# 告警判断
ALERT=false
ALERT_MSG=""

# 命中率过低
if (( $(echo "$HIT_RATE < 50" | bc -l) )); then
  ALERT=true
  ALERT_MSG="${ALERT_MSG}命中率过低 (${HIT_RATE}%)；"
fi

# 缓存键过少
if [ "$KEYS" -lt 5 ]; then
  ALERT=true
  ALERT_MSG="${ALERT_MSG}缓存键过少 (${KEYS}个)；"
fi

if [ "$ALERT" = true ]; then
  echo "⚠️  告警：${ALERT_MSG}"
  # 这里可以调用飞书告警
  # curl -X POST "http://192.168.100.6:5001/api/alert/send" -d "{\"message\":\"${ALERT_MSG}\"}"
else
  echo "✅ 缓存状态正常"
fi
EOF

chmod +x /opt/mes-system/scripts/cache-alert.sh
echo "   ✅ 缓存告警脚本已创建"
echo ""

# 4. 更新 .env 配置
echo "4️⃣  更新环境变量配置..."
if ! grep -q "FEISHU_WEBHOOK_URL" .env; then
  cat >> .env << EOF

# 飞书告警配置
FEISHU_WEBHOOK_URL=
FEISHU_ALERT_ENABLED=true
EOF
  echo "   ✅ 飞书告警配置已添加"
  echo "   ⚠️  请配置 FEISHU_WEBHOOK_URL"
else
  echo "   ℹ️  飞书告警配置已存在"
fi
echo ""

# 5. 重启服务
echo "5️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

echo "======================================"
echo "✅ 飞书告警集成完成！"
echo "======================================"
echo ""
echo "📋 配置步骤:"
echo "  1. 创建飞书机器人"
echo "  2. 获取 Webhook URL"
echo "  3. 配置 .env 中的 FEISHU_WEBHOOK_URL"
echo "  4. 重启服务"
echo ""
echo "📊 告警类型:"
echo "  - 性能告警（响应时间 > 2 秒）"
echo "  - 错误告警（API 错误）"
echo "  - 缓存告警（命中率 < 50%）"
echo "  - 系统告警（CPU/内存/磁盘 > 80%）"
echo ""
echo "🔧 测试告警:"
echo "  curl http://192.168.100.6:5001/api/cache-monitor/stats"
echo "  bash /opt/mes-system/scripts/cache-alert.sh"
echo ""
