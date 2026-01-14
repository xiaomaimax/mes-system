/**
 * 测试质量管理API端点
 */

require('dotenv').config();

const API_BASE_URL = 'http://localhost:5002/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiLCJtYW5hZ2UiXSwiaWF0IjoxNzY3MTQ3ODk5LCJleHAiOjE3NjcyMzQyOTksImF1ZCI6Im1lcy1jbGllbnQiLCJpc3MiOiJtZXMtc3lzdGVtIn0.7duxEfXm0kFrxo-AzfvFCsoQdYhQ5-YQzWtEFpvINwU';

const testEndpoints = [
  '/quality/fqc-inspections',
  '/quality/pqc-inspections', 
  '/quality/oqc-inspections',
  '/quality/defect-reasons',
  '/quality/inspection-standards',
  '/quality/defect-records',
  '/quality/batch-tracing'
];

async function testAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint}: 成功 (${data.data?.length || 0} 条记录)`);
      return true;
    } else {
      console.log(`❌ ${endpoint}: 失败 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint}: 错误 - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 开始测试质量管理API端点...\n');
  
  let successCount = 0;
  
  for (const endpoint of testEndpoints) {
    const success = await testAPI(endpoint);
    if (success) successCount++;
  }
  
  console.log(`\n📊 测试结果: ${successCount}/${testEndpoints.length} 个端点正常`);
  
  if (successCount === testEndpoints.length) {
    console.log('🎉 所有API端点都正常工作！');
    console.log('\n💡 用户修复指令:');
    console.log('在浏览器控制台中运行:');
    console.log(`localStorage.setItem('token', '${TOKEN}');`);
    console.log('然后刷新页面即可。');
  } else {
    console.log('⚠️ 部分API端点有问题，请检查后端服务。');
  }
}

runTests();