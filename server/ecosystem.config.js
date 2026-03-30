module.exports = {
  apps: [{
    name: 'mes-api',
    script: './cluster.js',
    instances: 1, // 集群模式由 cluster.js 管理
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '../logs/pm2-err.log',
    out_file: '../logs/pm2-out.log',
    log_file: '../logs/pm2-combined.log',
    time: true
  }]
};
