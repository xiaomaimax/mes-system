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
