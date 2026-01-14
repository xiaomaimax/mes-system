/**
 * 测试重置排程功能
 * 验证重置排程结果API是否正常工作
 */

const fetch = require('node-fetch').default || require('node-fetch');

const API_BASE_URL = 'http://localhost:5002/api';

// 获取认证token
async function getAuthToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (data.success) {
      return data.token;
    } else {
      throw new Error('登录失败');
    }
  } catch (error) {
    console.error('获取token失败:', error.message);
    throw error;
  }
}

// 测试重置排程
async function testResetScheduling() {
  console.log('🔍 开始测试重置排程功能...\n');

  try {
    // 1. 获取token
    console.log('📡 步骤1: 获取认证token...');
    const token = await getAuthToken();
    console.log('✅ 成功获取token\n');

    // 2. 调用重置排程API
    console.log('📡 步骤2: 调用重置排程API...');
    const resetResponse = await fetch(`${API_BASE_URL}/scheduling/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resetResponse.ok) {
      throw new Error(`API返回错误: ${resetResponse.status} ${resetResponse.statusText}`);
    }

    const resetData = await resetResponse.json();
    console.log('✅ 重置排程API调用成功');
    console.log(`   - 删除的任务单: ${resetData.data.deletedTasks}`);
    console.log(`   - 更新的计划单: ${resetData.data.updatedPlans}\n`);

    // 3. 验证排程结果
    console.log('📡 步骤3: 验证排程结果...');
    const tasksResponse = await fetch(`${API_BASE_URL}/scheduling/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const tasksData = await tasksResponse.json();
    console.log(`✅ 任务单查询成功`);
    console.log(`   - 当前任务单数: ${tasksData.data.length}`);
    console.log(`   - 总数: ${tasksData.pagination.total}\n`);

    // 4. 查询计划单状态
    console.log('📡 步骤4: 查询计划单状态...');
    const plansResponse = await fetch(`${API_BASE_URL}/scheduling/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const plansData = await plansResponse.json();
    console.log(`✅ 计划单查询成功`);
    console.log(`   - 总计划单数: ${plansData.data.length}`);
    
    // 统计各状态的计划单
    const statusStats = {};
    plansData.data.forEach(plan => {
      statusStats[plan.status] = (statusStats[plan.status] || 0) + 1;
    });
    
    console.log('   - 状态分布:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`     ${status}: ${count} 个`);
    });

    console.log('\n🎯 测试结果: 所有测试通过！');
    console.log('✅ 重置排程功能正常工作');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('🔍 错误详情:', error);
    
    console.log('\n🔧 调试建议:');
    console.log('1. 检查后端服务是否正在运行 (http://localhost:5002)');
    console.log('2. 检查数据库连接是否正常');
    console.log('3. 查看服务器日志获取更多信息');
    
    process.exit(1);
  }
}

// 执行测试
if (require.main === module) {
  testResetScheduling()
    .then(() => {
      console.log('\n🎉 重置排程功能测试完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试执行失败:', error.message);
      process.exit(1);
    });
}

module.exports = { testResetScheduling };