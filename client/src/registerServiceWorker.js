// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('🚀 Service Worker 注册成功:', registration);
        
        // 检查更新
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ 有新内容可用，请刷新页面');
              // 可以在这里显示更新提示
              if (confirm('发现新版本，是否立即刷新？')) {
                window.location.reload();
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('❌ Service Worker 注册失败:', error);
      });
  });
}

// 导出用于手动注册
export function registerSW() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register('/service-worker.js');
  }
  return Promise.reject(new Error('Service Worker 不支持'));
}

// 导出于动注销
export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
