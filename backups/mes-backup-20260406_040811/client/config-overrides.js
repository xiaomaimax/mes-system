const path = require('path');

module.exports = {
  webpack: (config, env) => {
    // 代码分割优化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          antd: {
            name: 'antd',
            test: /node_modules\/antd/,
            priority: 10,
            enforce: true,
          },
          vendors: {
            name: 'vendors',
            test: /node_modules/,
            priority: 5,
            enforce: true,
          },
        },
      },
    };

    return config;
  },
};
