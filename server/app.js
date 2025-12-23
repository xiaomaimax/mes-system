require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const { router: authRoutes } = require('./routes/auth');
const productionRoutes = require('./routes/production');
const equipmentRoutes = require('./routes/equipment');
const qualityRoutes = require('./routes/quality');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 (仅在生产环境)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('join_production_line', (lineId) => {
    socket.join(`line_${lineId}`);
    console.log(`用户 ${socket.id} 加入生产线 ${lineId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 404处理 (仅在生产环境)
if (process.env.NODE_ENV === 'production') {
  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
} else {
  // 开发环境下的404处理
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'API路由未找到' });
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MES系统服务器运行在端口 ${PORT}`);
});

module.exports = { app, io };