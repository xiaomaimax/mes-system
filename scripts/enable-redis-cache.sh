#!/bin/bash
#############################################
# MaxMES Redis 缓存启用脚本
#############################################

set -e

echo "======================================"
echo "🔧 启用 Redis 缓存"
echo "======================================"
echo ""

# 1. 检查 Redis 配置
echo "1️⃣  检查 Redis 配置..."
cd /opt/mes-system/server

if [ -f ".env" ]; then
    if grep -q "REDIS_HOST" .env; then
        echo "   ✅ Redis 配置已存在"
        cat .env | grep -i redis
    else
        echo "   ⚠️  添加 Redis 配置..."
        cat >> .env << EOF

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=redis
REDIS_DB=0
EOF
        echo "   ✅ Redis 配置已添加"
    fi
else
    echo "   ❌ .env 文件不存在"
    exit 1
fi
echo ""

# 2. 检查缓存服务
echo "2️⃣  检查缓存服务..."
if [ -f "services/cacheService.js" ]; then
    echo "   ✅ 缓存服务存在"
    
    # 检查是否使用 Redis
    if grep -q "redis" services/cacheService.js; then
        echo "   ✅ Redis 集成已配置"
    else
        echo "   ⚠️  需要更新缓存服务"
    fi
else
    echo "   ❌ 缓存服务不存在"
fi
echo ""

# 3. 测试 Redis 连接
echo "3️⃣  测试 Redis 连接..."
if redis-cli -a redis --no-auth-warning ping > /dev/null 2>&1; then
    echo "   ✅ Redis 连接成功"
else
    echo "   ❌ Redis 连接失败"
    exit 1
fi
echo ""

# 4. 创建缓存测试脚本
echo "4️⃣  创建缓存测试脚本..."
cat > /opt/mes-system/scripts/test-cache.js << 'EOF'
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
EOF

echo "   ✅ 测试脚本已创建"
echo ""

# 5. 运行缓存测试
echo "5️⃣  运行缓存测试..."
cd /opt/mes-system
node scripts/test-cache.js
echo ""

# 6. 重启服务
echo "6️⃣  重启服务..."
echo 'xiaomai@2015' | sudo -S pm2 restart mes-api
sleep 5
echo 'xiaomai@2015' | sudo -S pm2 status
echo ""

# 7. 验证缓存
echo "7️⃣  验证缓存..."
sleep 3
redis-cli -a redis --no-auth-warning KEYS 'mes:*' | head -10
echo ""

echo "======================================"
echo "✅ Redis 缓存已启用！"
echo "======================================"
echo ""
echo "📊 验证方法:"
echo "  1. 查看缓存键：redis-cli -a redis --no-auth-warning KEYS 'mes:*'"
echo "  2. 查看日志：tail -f /opt/mes-system/logs/server.log | grep -i redis"
echo "  3. 测试 API: curl http://192.168.100.6:5001/api/dashboard/overview"
echo ""
