/**
 * Redis 缓存测试脚本
 */

const redis = require('redis');

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    password: 'redis'
});

client.on('error', (err) => {
    console.error('Redis 错误:', err);
    process.exit(1);
});

async function testCache() {
    try {
        await client.connect();
        console.log('✅ Redis 连接成功');
        
        // 测试写入
        await client.set('mes:test:key', 'test_value', { EX: 60 });
        console.log('✅ 写入缓存成功');
        
        // 测试读取
        const value = await client.get('mes:test:key');
        console.log('✅ 读取缓存成功:', value);
        
        // 测试删除
        await client.del('mes:test:key');
        console.log('✅ 删除缓存成功');
        
        // 查看缓存键
        const keys = await client.keys('mes:*');
        console.log('📋 当前缓存键:', keys);
        
        await client.quit();
        console.log('\n✅ Redis 缓存测试完成！');
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

testCache();
