/**
 * MES系统状态检查脚本
 * 检查前端和后端服务是否正常运行
 */

const fetch = require('node-fetch').default || require('node-fetch');

const BACKEND_URL = 'http://localhost:5002';
const FRONTEND_URL = 'http://localhost:3000';

async function checkBackendStatus() {
  try {
    console.log('🔍 检查后端服务状态...');
    
    // 检查基本连接
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 后端服务正常运行');
      console.log(`   - 端口: 5002`);
      console.log(`   - 状态: ${response.status}`);
      console.log(`   - 登录测试: 成功`);
      return { status: 'running', token: data.token };
    } else {
      console.log('⚠️  后端服务响应异常');
      console.log(`   - 状态码: ${response.status}`);
      return { status: 'error', error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ 后端服务连接失败');
    console.log(`   - 错误: ${error.message}`);
    return { status: 'offline', error: error.message };
  }
}

async function checkFrontendStatus() {
  try {
    console.log('🔍 检查前端服务状态...');
    
    const response = await fetch(FRONTEND_URL, {
      timeout: 5000
    });

    if (response.ok) {
      console.log('✅ 前端服务正常运行');
      console.log(`   - 端口: 3000`);
      console.log(`   - 状态: ${response.status}`);
      return { status: 'running' };
    } else {
      console.log('⚠️  前端服务响应异常');
      console.log(`   - 状态码: ${response.status}`);
      return { status: 'error', error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ 前端服务连接失败');
    console.log(`   - 错误: ${error.message}`);
    return { status: 'offline', error: error.message };
  }
}

async function checkDatabaseConnection(token) {
  try {
    console.log('🔍 检查数据库连接状态...');
    
    const response = await fetch(`${BACKEND_URL}/api/equipment-archives`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 数据库连接正常');
      console.log(`   - 设备档案数据: ${data.pagination?.total || 0} 条`);
      return { status: 'connected', recordCount: data.pagination?.total || 0 };
    } else {
      console.log('⚠️  数据库查询异常');
      return { status: 'error', error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ 数据库连接失败');
    console.log(`   - 错误: ${error.message}`);
    return { status: 'offline', error: error.message };
  }
}

async function checkSystemStatus() {
  console.log('🚀 MES系统状态检查\n');
  console.log('=' .repeat(50));
  
  const results = {
    backend: await checkBackendStatus(),
    frontend: await checkFrontendStatus(),
    database: null
  };

  // 如果后端正常，检查数据库
  if (results.backend.status === 'running' && results.backend.token) {
    results.database = await checkDatabaseConnection(results.backend.token);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 系统状态总结:');
  
  // 后端状态
  const backendIcon = results.backend.status === 'running' ? '🟢' : '🔴';
  console.log(`${backendIcon} 后端服务: ${results.backend.status}`);
  
  // 前端状态
  const frontendIcon = results.frontend.status === 'running' ? '🟢' : '🔴';
  console.log(`${frontendIcon} 前端服务: ${results.frontend.status}`);
  
  // 数据库状态
  if (results.database) {
    const dbIcon = results.database.status === 'connected' ? '🟢' : '🔴';
    console.log(`${dbIcon} 数据库: ${results.database.status}`);
  } else {
    console.log('🔴 数据库: 未检查 (后端服务异常)');
  }

  // 访问链接
  console.log('\n🔗 访问链接:');
  if (results.frontend.status === 'running') {
    console.log(`   前端应用: ${FRONTEND_URL}`);
  }
  if (results.backend.status === 'running') {
    console.log(`   后端API: ${BACKEND_URL}/api`);
  }

  // 系统就绪状态
  const allRunning = results.backend.status === 'running' && 
                    results.frontend.status === 'running' && 
                    results.database?.status === 'connected';

  console.log('\n🎯 系统状态:');
  if (allRunning) {
    console.log('✅ MES系统完全就绪，可以开始使用！');
  } else {
    console.log('⚠️  MES系统部分服务异常，请检查相关服务');
  }

  return results;
}

// 执行检查
if (require.main === module) {
  checkSystemStatus()
    .then((results) => {
      const allRunning = results.backend.status === 'running' && 
                        results.frontend.status === 'running' && 
                        results.database?.status === 'connected';
      
      console.log('\n🎉 系统状态检查完成！');
      process.exit(allRunning ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 系统检查失败:', error.message);
      process.exit(1);
    });
}

module.exports = { checkSystemStatus };