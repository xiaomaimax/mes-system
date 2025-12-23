require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    console.log('正在创建数据库...');
    
    // 连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    // 创建数据库
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'mes_system'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`数据库 ${process.env.DB_NAME || 'mes_system'} 创建成功！`);
    
    await connection.end();
    
  } catch (error) {
    console.error('创建数据库失败:', error);
  }
}

createDatabase();