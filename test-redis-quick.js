const redis = require('redis');

async function test() {
  console.log('测试 Redis 连接：192.168.100.6:6379\n');
  
  // 尝试仅使用密码（Redis 6+ ACL 之前的方式）
  const client = redis.createClient({
    socket: {
      host: '192.168.100.6',
      port: 6379
    },
    password: 'redis'
  });
  
  client.on('error', e => console.log('错误:', e.message));
  
  try {
    console.log('正在连接...');
    await client.connect();
    console.log('✅ 连接成功！');
    
    const ping = await client.ping();
    console.log(`PING: ${ping}`);
    
    await client.set('test', 'value', { EX: 5 });
    const val = await client.get('test');
    console.log(`SET/GET: ${val}`);
    
    await client.quit();
  } catch (e) {
    console.log('❌ 失败:', e.message);
  }
}

test();
