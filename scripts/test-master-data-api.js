#!/usr/bin/env node

/**
 * 统一主数据API测试脚本
 * 验证设备、物料、模具的统一查询API是否正常工作
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
 */

const http = require('http');

// 配置
const API_BASE = 'http://localhost:5000';
let authToken = null;

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// HTTP请求工具函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试函数
async function test(description, testFn) {
  testResults.total++;
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`✅ ${description}`);
      testResults.passed++;
    } else {
      console.log(`❌ ${description}`);
      console.log(`   原因: ${result.reason}`);
      testResults.failed++;
      testResults.errors.push({ test: description, reason: result.reason });
    }
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   错误: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: description, reason: error.message });
  }
}

// 登录获取token
async function login() {
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      return true;
    }
    return false;
  } catch (error) {
    console.log('登录失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🔍 统一主数据API测试开始...\n');
  console.log('================================');
  
  // 首先尝试登录
  console.log('\n📋 0. 认证测试');
  console.log('--------------------------------');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('⚠️  无法登录，将跳过需要认证的测试');
    console.log('   请确保服务器正在运行且有admin用户');
  } else {
    console.log('✅ 登录成功，获取到认证token');
  }

  // 测试设备API
  console.log('\n📋 1. 设备统一查询API测试');
  console.log('--------------------------------');

  await test('GET /api/master-data/equipment - 基本查询', async () => {
    const response = await makeRequest('GET', '/api/master-data/equipment');
    if (response.status === 200 && response.data.success !== undefined) {
      return { success: true };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/equipment - 分页参数', async () => {
    const response = await makeRequest('GET', '/api/master-data/equipment?page=1&limit=5');
    if (response.status === 200 && response.data.pagination) {
      const { pagination } = response.data;
      if (pagination.page === 1 && pagination.limit === 5) {
        return { success: true };
      }
      return { success: false, reason: '分页参数未正确返回' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/equipment - 响应包含scheduling属性', async () => {
    const response = await makeRequest('GET', '/api/master-data/equipment');
    if (response.status === 200 && response.data.data) {
      // 检查响应结构是否正确
      const hasCorrectStructure = response.data.data.length === 0 || 
        response.data.data.every(item => 'scheduling' in item);
      if (hasCorrectStructure) {
        return { success: true };
      }
      return { success: false, reason: '响应数据缺少scheduling属性' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  // 测试物料API
  console.log('\n📋 2. 物料统一查询API测试');
  console.log('--------------------------------');

  await test('GET /api/master-data/materials - 基本查询', async () => {
    const response = await makeRequest('GET', '/api/master-data/materials');
    if (response.status === 200 && response.data.success !== undefined) {
      return { success: true };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/materials - 分页参数', async () => {
    const response = await makeRequest('GET', '/api/master-data/materials?page=1&limit=5');
    if (response.status === 200 && response.data.pagination) {
      const { pagination } = response.data;
      if (pagination.page === 1 && pagination.limit === 5) {
        return { success: true };
      }
      return { success: false, reason: '分页参数未正确返回' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/materials - 响应包含scheduling和关系数据', async () => {
    const response = await makeRequest('GET', '/api/master-data/materials');
    if (response.status === 200 && response.data.data) {
      const hasCorrectStructure = response.data.data.length === 0 || 
        response.data.data.every(item => 
          'scheduling' in item && 
          item.scheduling && 
          'device_relations' in item.scheduling &&
          'mold_relations' in item.scheduling
        );
      if (hasCorrectStructure) {
        return { success: true };
      }
      return { success: false, reason: '响应数据缺少scheduling或关系数据' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  // 测试模具API
  console.log('\n📋 3. 模具统一查询API测试');
  console.log('--------------------------------');

  await test('GET /api/master-data/molds - 基本查询', async () => {
    const response = await makeRequest('GET', '/api/master-data/molds');
    if (response.status === 200 && response.data.success !== undefined) {
      return { success: true };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/molds - 分页参数', async () => {
    const response = await makeRequest('GET', '/api/master-data/molds?page=1&limit=5');
    if (response.status === 200 && response.data.pagination) {
      const { pagination } = response.data;
      if (pagination.page === 1 && pagination.limit === 5) {
        return { success: true };
      }
      return { success: false, reason: '分页参数未正确返回' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  await test('GET /api/master-data/molds - 响应包含equipment_relations', async () => {
    const response = await makeRequest('GET', '/api/master-data/molds');
    if (response.status === 200 && response.data.data) {
      const hasCorrectStructure = response.data.data.length === 0 || 
        response.data.data.every(item => 'equipment_relations' in item);
      if (hasCorrectStructure) {
        return { success: true };
      }
      return { success: false, reason: '响应数据缺少equipment_relations属性' };
    }
    return { success: false, reason: `状态码: ${response.status}` };
  });

  // 输出测试结果
  console.log('\n================================');
  console.log('📊 测试结果统计');
  console.log('================================');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`\n🎯 成功率: ${successRate}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 所有API测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，详情:');
    testResults.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.test}: ${err.reason}`);
    });
  }

  return testResults.failed === 0;
}

// 检查服务器是否运行
async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// 主入口
async function main() {
  console.log('🔍 检查服务器状态...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('\n⚠️  服务器未运行！');
    console.log('请先启动服务器: npm run dev');
    console.log('\n📝 API实现状态检查 (静态分析):');
    console.log('--------------------------------');
    
    // 静态检查API文件是否存在
    const fs = require('fs');
    const path = require('path');
    
    const apiFile = path.join(__dirname, '..', 'server/routes/masterData.js');
    if (fs.existsSync(apiFile)) {
      console.log('✅ masterData.js API路由文件存在');
      
      const content = fs.readFileSync(apiFile, 'utf8');
      
      // 检查关键API端点
      const endpoints = [
        { pattern: "router.get\\('/equipment'", name: 'GET /equipment' },
        { pattern: "router.get\\('/equipment/:id'", name: 'GET /equipment/:id' },
        { pattern: "router.put\\('/equipment/:id/scheduling'", name: 'PUT /equipment/:id/scheduling' },
        { pattern: "router.get\\('/materials'", name: 'GET /materials' },
        { pattern: "router.get\\('/materials/:id'", name: 'GET /materials/:id' },
        { pattern: "router.put\\('/materials/:id/scheduling'", name: 'PUT /materials/:id/scheduling' },
        { pattern: "router.get\\('/molds'", name: 'GET /molds' },
        { pattern: "router.get\\('/molds/:id'", name: 'GET /molds/:id' },
        { pattern: "router.put\\('/molds/:id/scheduling'", name: 'PUT /molds/:id/scheduling' },
        { pattern: "router.post\\('/molds/:id/equipment'", name: 'POST /molds/:id/equipment' },
        { pattern: "router.delete\\('/molds/:id/equipment/:equipmentId'", name: 'DELETE /molds/:id/equipment/:equipmentId' }
      ];
      
      endpoints.forEach(ep => {
        if (new RegExp(ep.pattern).test(content)) {
          console.log(`✅ ${ep.name} 端点已实现`);
        } else {
          console.log(`❌ ${ep.name} 端点未找到`);
        }
      });
      
      // 检查关键功能
      console.log('\n📝 关键功能检查:');
      console.log('--------------------------------');
      
      if (content.includes('pagination')) {
        console.log('✅ 分页功能已实现');
      } else {
        console.log('❌ 分页功能未找到');
      }
      
      if (content.includes('schedulingExt')) {
        console.log('✅ 排程扩展属性关联已实现');
      } else {
        console.log('❌ 排程扩展属性关联未找到');
      }
      
      if (content.includes('equipmentRelations')) {
        console.log('✅ 模具-设备关联查询已实现');
      } else {
        console.log('❌ 模具-设备关联查询未找到');
      }
      
      if (content.includes('device_relations') && content.includes('mold_relations')) {
        console.log('✅ 物料关系配置查询已实现');
      } else {
        console.log('❌ 物料关系配置查询未找到');
      }
      
      console.log('\n✅ API实现静态检查完成');
      console.log('   要进行完整的运行时测试，请启动服务器后重新运行此脚本');
    } else {
      console.log('❌ masterData.js API路由文件不存在');
    }
    
    return;
  }
  
  const success = await runTests();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
