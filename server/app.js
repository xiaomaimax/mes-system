require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const logger = require('./utils/logger');
const { sanitizeRequest, createValidationMiddleware } = require('./middleware/validation');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

const { router: authRoutes } = require('./routes/auth');
const productionRoutes = require('./routes/production');
const equipmentRoutes = require('./routes/equipment');
const qualityRoutes = require('./routes/quality');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const schedulingRoutes = require('./routes/scheduling');
const masterDataRoutes = require('./routes/masterData');
const modulesRoutes = require('./routes/modules');
const equipmentArchivesRoutes = require('./routes/equipmentArchives');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// 中间件 - 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// 中间件 - CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// 中间件 - 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 中间件 - 输入清理
app.use(sanitizeRequest);

// 静态文件服务 (仅在生产环境)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/devices', equipmentRoutes); // 兼容 /api/devices 端点
app.use('/api/quality', qualityRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/equipment-archives', equipmentArchivesRoutes);

// WebSocket连接处理
io.on('connection', (socket) => {
  logger.info('用户连接', { socketId: socket.id });
  
  socket.on('join_production_line', (lineId) => {
    socket.join(`line_${lineId}`);
    logger.info(`用户加入生产线`, { socketId: socket.id, lineId });
  });
  
  socket.on('disconnect', () => {
    logger.info('用户断开连接', { socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('WebSocket错误', { socketId: socket.id, error: error.message });
  });
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理 (必须在最后)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`MES系统服务器启动成功`, { port: PORT, env: process.env.NODE_ENV });
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，开始优雅关闭');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，开始优雅关闭');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', { error: error.message, stack: error.stack });
  process.exit(1);
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝', { reason, promise });
});

module.exports = { app, io };