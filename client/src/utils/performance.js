/**
 * 性能监控工具（P1-10 性能优化）
 * 监控页面加载性能和资源使用
 */

// 性能指标收集
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observer = null;
  }

  // 初始化性能监控
  init() {
    this.collectWebVitals();
    this.monitorResourceLoading();
    this.monitorMemoryUsage();
    this.reportPerformance();
  }

  // 收集 Web Vitals 指标
  collectWebVitals() {
    // FCP (First Contentful Paint)
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      this.metrics.fcp = fcpEntry.startTime;
    }

    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            this.metrics.fid = entry.processingStart - entry.startTime;
          }
        }
      }).observe({ entryTypes: ['first-input'] });
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // 监控资源加载
  monitorResourceLoading() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(r => r.duration > 1000);

      if (slowResources.length > 0) {
        console.warn('⚠️ 加载缓慢的资源:', slowResources.map(r => ({
          name: r.name,
          duration: `${r.duration.toFixed(2)}ms`,
          type: r.initiatorType
        })));
      }

      this.metrics.totalResources = resources.length;
      this.metrics.slowResources = slowResources.length;
    });
  }

  // 监控内存使用
  monitorMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.memory = {
          usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        };

        // 内存使用率超过 80% 时警告
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usageRatio > 0.8) {
          console.warn('⚠️ 内存使用率过高:', (usageRatio * 100).toFixed(2) + '%');
        }
      }, 30000); // 每 30 秒检查一次
    }
  }

  // 报告性能数据
  reportPerformance() {
    // 页面卸载前报告
    window.addEventListener('beforeunload', () => {
      this.saveMetrics();
    });

    // 定期报告
    setInterval(() => {
      this.saveMetrics();
    }, 60000); // 每分钟报告一次
  }

  // 保存指标到本地存储
  saveMetrics() {
    const timestamp = new Date().toISOString();
    const metricsData = {
      timestamp,
      ...this.metrics
    };

    // 保存到 localStorage
    const performanceLogs = JSON.parse(localStorage.getItem('performanceLogs') || '[]');
    performanceLogs.push(metricsData);
    
    // 只保留最近 100 条记录
    localStorage.setItem('performanceLogs', JSON.stringify(performanceLogs.slice(-100)));
  }

  // 获取性能报告
  getReport() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

// 自动初始化
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

export default performanceMonitor;
export { PerformanceMonitor };
