#!/usr/bin/env node

/**
 * API集成测试脚本
 * 测试登录和API调用是否正常工作
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:5002/api';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 发送HTTP请求
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  log('\n========================================', 'cyan');
  log('MES系统 API集成测试', 'cyan');
  log('========================================\n', 'cyan');

  let token = null;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 测试1: 登录
    log('测试1: 用户登录', 'blue');
    log('发送请求: POST /auth/login', 'yellow');
    
    const loginResponse = await makeRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.status === 200 && loginResponse.body.success) {
      token = loginResponse.body.token;
      log(`✓ 登录成功`, 'green');
      log(`  Token: ${token.substring(0, 20)}...`, 'green');
      testsPassed++;
    } else {
      log(`✗ 登录失败: ${loginResponse.body.message}`, 'red');
      testsFailed++;
      throw new Error('登录失败，无法继续测试');
    }

    // 测试2: 获取工艺路由
    log('\n测试2: 获取工艺路由数据', 'blue');
    log('发送请求: GET /modules/process-routing', 'yellow');
    
    const routingResponse = await makeRequest('GET', '/modules/process-routing', null, {
      'Authorization': `Bearer ${token}`
    });

    if (routingResponse.status === 200 && routingResponse.body.success) {
      const count = routingResponse.body.data.routings.length;
      log(`✓ 获取工艺路由成功`, 'green');
      log(`  数据条数: ${count}`, 'green');
      testsPassed++;
    } else {
      log(`✗ 获取工艺路由失败: ${routingResponse.body.message}`, 'red');
      testsFailed++;
    }

    // 测试3: 获取库存数据
    log('\n测试3: 获取库存数据', 'blue');
    log('发送请求: GET /modules/inventory', 'yellow');
    
    const inventoryResponse = await makeRequest('GET', '/modules/inventory', null, {
      'Authorization': `Bearer ${token}`
    });

    if (inventoryResponse.status === 200 && inventoryResponse.body.success) {
      const count = inventoryResponse.body.data.inventory.length;
      log(`✓ 获取库存数据成功`, 'green');
      log(`  数据条数: ${count}`, 'green');
      testsPassed++;
    } else {
      log(`✗ 获取库存数据失败: ${inventoryResponse.body.message}`, 'red');
      testsFailed++;
    }

    // 测试4: 获取质量检验数据
    log('\n测试4: 获取质量检验数据', 'blue');
    log('发送请求: GET /modules/quality-inspections', 'yellow');
    
    const qualityResponse = await makeRequest('GET', '/modules/quality-inspections', null, {
      'Authorization': `Bearer ${token}`
    });

    if (qualityResponse.status === 200 && qualityResponse.body.success) {
      const count = qualityResponse.body.data.inspections.length;
      log(`✓ 获取质量检验数据成功`, 'green');
      log(`  数据条数: ${count}`, 'green');
      testsPassed++;
    } else {
      log(`✗ 获取质量检验数据失败: ${qualityResponse.body.message}`, 'red');
      testsFailed++;
    }

    // 测试5: 获取设备维护数据
    log('\n测试5: 获取设备维护数据', 'blue');
    log('发送请求: GET /modules/equipment-maintenance', 'yellow');
    
    const equipmentResponse = await makeRequest('GET', '/modules/equipment-maintenance', null, {
      'Authorization': `Bearer ${token}`
    });

    if (equipmentResponse.status === 200 && equipmentResponse.body.success) {
      const count = equipmentResponse.body.data.maintenance.length;
      log(`✓ 获取设备维护数据成功`, 'green');
      log(`  数据条数: ${count}`, 'green');
      testsPassed++;
    } else {
      log(`✗ 获取设备维护数据失败: ${equipmentResponse.body.message}`, 'red');
      testsFailed++;
    }

    // 测试6: 无效token测试
    log('\n测试6: 无效token处理', 'blue');
    log('发送请求: GET /modules/inventory (无效token)', 'yellow');
    
    const invalidTokenResponse = await makeRequest('GET', '/modules/inventory', null, {
      'Authorization': 'Bearer invalid_token'
    });

    if (invalidTokenResponse.status === 401) {
      log(`✓ 正确拒绝无效token`, 'green');
      testsPassed++;
    } else {
      log(`✗ 应该拒绝无效token`, 'red');
      testsFailed++;
    }

  } catch (error) {
    log(`\n✗ 测试出错: ${error.message}`, 'red');
    testsFailed++;
  }

  // 输出测试结果
  log('\n========================================', 'cyan');
  log('测试结果总结', 'cyan');
  log('========================================', 'cyan');
  log(`通过: ${testsPassed}`, 'green');
  log(`失败: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`总计: ${testsPassed + testsFailed}`, 'blue');
  
  if (testsFailed === 0) {
    log('\n✓ 所有测试通过！API集成正常工作', 'green');
    process.exit(0);
  } else {
    log('\n✗ 有测试失败，请检查后端服务', 'red');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  log(`\n✗ 测试脚本错误: ${error.message}`, 'red');
  process.exit(1);
});
