#!/usr/bin/env node

/**
 * 排程API测试脚本
 * 用于诊断排程模块的API是否正常工作
 */

const http = require('http');

const BASE_URL = 'http://localhost:5002';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAPIs() {
  console.log('\n🧪 开始测试排程API...\n');
  console.log(`📡 目标服务器: ${BASE_URL}\n`);

  const tests = [
    { name: '获取物料列表', path: '/api/scheduling/materials?limit=5' },
    { name: '获取设备列表', path: '/api/scheduling/devices?limit=5' },
    { name: '获取模具列表', path: '/api/scheduling/molds?limit=5' },
    { name: '获取计划单列表', path: '/api/scheduling/plans?limit=5' },
    { name: '获取任务单列表', path: '/api/scheduling/tasks?limit=5' },
    { name: '获取物料-设备关系', path: '/api/scheduling/material-device-relations' },
    { name: '获取物料-模具关系', path: '/api/scheduling/material-mold-relations' },
    { name: '获取排程结果', path: '/api/scheduling/results' }
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      console.log(`⏳ 测试: ${test.name}...`);
      const result = await makeRequest(test.path);
      
      if (result.status === 200) {
        const dataCount = Array.isArray(result.data.data) ? result.data.data.length : 
                         result.data.pagination ? result.data.pagination.total : 0;
        console.log(`   ✅ 成功 (状态码: ${result.status}, 数据: ${dataCount}条)\n`);
        passCount++;
      } else {
        console.log(`   ❌ 失败 (状态码: ${result.status})`);
        console.log(`   错误: ${result.data.message || JSON.stringify(result.data)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}\n`);
      failCount++;
    }
  }

  console.log(`\n📊 测试结果:`);
  console.log(`   ✅ 成功: ${passCount}`);
  console.log(`   ❌ 失败: ${failCount}`);
  console.log(`   总计: ${tests.length}\n`);

  if (failCount === 0) {
    console.log('🎉 所有API测试都通过了！\n');
  } else if (failCount === tests.length) {
    console.log('❌ 后端服务可能未运行。请执行: npm run server\n');
  } else {
    console.log('⚠️  部分API测试失败。请检查后端日志。\n');
  }
}

testAPIs().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
