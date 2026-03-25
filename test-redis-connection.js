/**
 * Redis 连接测试脚本
 * 测试生产环境 Redis 连接
 */

const { createClient } = require('redis');

async function testRedisConnection() {
  console.log('🔍 开始测试 Redis 连接...\n');
  
  // 生产环境配置
  const config = {
    host: '192.168.100.6',
    port: 6379,
    password: 'redis',
    username: '1Panel-redis-G3NU'
  };
  
  console.log('📋 连接配置:');
  console.log(`  主机：${config.host}:${config.port}`);
  console.log(`  用户名：${config.username}`);
  console.log(`  密码：${'*'.repeat(config.password.length)}\n`);
  
  const client = createClient({
    url: `redis://${config.username}:${config.password}@${config.host}:${config.port}`
  });
  
  client.on('error', (err) => {
    console.error('❌ Redis 错误:', err.message);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis 连接成功！\n');
  });
  
  try {
    console.log('⏳ 正在连接...\n');
    await client.connect();
    
    // 测试 PING
    console.log('📡 测试 PING 命令...');
    const pingResult = await client.ping();
    console.log(`  PING 响应：${pingResult}\n`);
    
    // 测试 SET
    console.log('💾 测试 SET 命令...');
    const testKey = 'mes:test:connection';
    const testValue = `Connection test at ${new Date().toISOString()}`;
    await client.set(testKey, testValue, { EX: 60 });
    console.log(`  SET ${testKey} = ${testValue}\n`);
    
    // 测试 GET
    console.log('📥 测试 GET 命令...');
    const getValue = await client.get(testKey);
    console.log(`  GET ${testKey} = ${getValue}\n`);
    
    // 测试 INFO
    console.log('📊 获取 Redis 信息...');
    const info = await client.info('server');
    const lines = info.split('\n').filter(line => 
      line.includes('redis_version') || 
      line.includes('tcp_port') ||
      line.includes('uptime')
    );
    console.log('  Redis 信息:');
    lines.forEach(line => console.log(`    ${line}`));
    console.log('');
    
    // 清理测试数据
    console.log('🧹 清理测试数据...');
    await client.del(testKey);
    console.log(`  已删除 ${testKey}\n`);
    
    console.log('✅ 所有测试通过！Redis 连接正常\n');
    
    await client.quit();
    return true;
    
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    console.error('错误详情:', error);
    
    try {
      await client.quit();
    } catch (e) {
      // 忽略关闭错误
    }
    
    return false;
  }
}

// 运行测试
testRedisConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
