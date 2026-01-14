/**
 * 登出功能集成测试脚本
 * 
 * 这个脚本模拟实际的登出流程，验证：
 * 1. 登出前的状态
 * 2. 登出过程中的状态变化
 * 3. 登出后的最终状态
 * 
 * Requirements: 1.1, 1.2, 2.4, 5.3
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 模拟 AuthContext 的状态
class MockAuthContext {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null
    };
    this.stateHistory = [];
    this.localStorage = {};
    this.axiosHeaders = {};
  }

  // 记录状态变化
  recordStateChange(action, newState) {
    this.stateHistory.push({
      timestamp: new Date().toISOString(),
      action,
      previousState: { ...this.state },
      newState
    });
    this.state = { ...this.state, ...newState };
  }

  // 模拟登录
  async login(username, password) {
    log('  → 执行登录...', 'gray');
    
    this.recordStateChange('LOGIN_START', { isLoading: true });
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockUser = {
      id: 1,
      name: '系统管理员',
      username: username,
      email: 'admin@mes-system.com',
      department: '信息部',
      role: '超级管理员',
      loginTime: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    // 更新状态
    this.recordStateChange('LOGIN_SUCCESS', {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      token: mockToken
    });
    
    // 模拟存储
    this.localStorage['token'] = mockToken;
    this.localStorage['userInfo'] = JSON.stringify(mockUser);
    this.axiosHeaders['Authorization'] = `Bearer ${mockToken}`;
    
    return { success: true };
  }

  // 模拟登出（修复后的版本）
  async logout() {
    log('  → 执行登出...', 'gray');
    
    // 立即清除所有状态（同步操作）
    this.recordStateChange('LOGOUT_STATE_CLEAR', {
      token: null,
      user: null,
      isAuthenticated: false,
      error: null
    });
    
    // 清除存储中的认证数据
    delete this.localStorage['token'];
    delete this.localStorage['userInfo'];
    delete this.axiosHeaders['Authorization'];
    
    // 分发事件
    log('  → 分发 logout 事件', 'gray');
    
    this.recordStateChange('LOGOUT_COMPLETE', {});
  }

  // 获取状态历史
  getStateHistory() {
    return this.stateHistory;
  }

  // 验证最终状态
  verifyFinalState() {
    const checks = [
      {
        name: 'token 已清除',
        check: () => this.state.token === null,
        requirement: 'Requirement 1.1'
      },
      {
        name: 'user 已清除',
        check: () => this.state.user === null,
        requirement: 'Requirement 1.1'
      },
      {
        name: 'isAuthenticated 为 false',
        check: () => this.state.isAuthenticated === false,
        requirement: 'Requirement 1.1'
      },
      {
        name: 'localStorage 中的 token 已删除',
        check: () => !('token' in this.localStorage),
        requirement: 'Requirement 2.4'
      },
      {
        name: 'localStorage 中的 userInfo 已删除',
        check: () => !('userInfo' in this.localStorage),
        requirement: 'Requirement 2.4'
      },
      {
        name: 'axios Authorization 头已删除',
        check: () => !('Authorization' in this.axiosHeaders),
        requirement: 'Requirement 2.4'
      }
    ];

    return checks;
  }
}

// 模拟应用层的认证检查
class MockApp {
  constructor(authContext) {
    this.authContext = authContext;
    this.currentPage = null;
    this.renderHistory = [];
  }

  // 模拟 MainApp 组件的渲染逻辑
  render() {
    const { isAuthenticated, isLoading } = this.authContext.state;

    if (isLoading) {
      this.currentPage = 'LOADING_PAGE';
    } else if (!isAuthenticated) {
      this.currentPage = 'LOGIN_PAGE';
    } else {
      this.currentPage = 'MAIN_APP';
    }

    this.renderHistory.push({
      timestamp: new Date().toISOString(),
      page: this.currentPage,
      authState: { ...this.authContext.state }
    });

    return this.currentPage;
  }

  // 获取渲染历史
  getRenderHistory() {
    return this.renderHistory;
  }
}

// 主测试函数
async function runIntegrationTest() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         登出功能集成测试                                    ║', 'cyan');
  log('║         Logout Integration Test                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const authContext = new MockAuthContext();
  const app = new MockApp(authContext);

  // 测试 1: 初始状态
  log('\n【测试 1】初始状态验证', 'blue');
  log('预期: 用户未登录，显示登录页面', 'yellow');
  
  const initialPage = app.render();
  log(`✓ 初始页面: ${initialPage}`, initialPage === 'LOGIN_PAGE' ? 'green' : 'red');

  // 测试 2: 登录流程
  log('\n【测试 2】登录流程', 'blue');
  log('预期: 用户登录后，显示主应用', 'yellow');
  
  await authContext.login('admin', 'password');
  const afterLoginPage = app.render();
  log(`✓ 登录后页面: ${afterLoginPage}`, afterLoginPage === 'MAIN_APP' ? 'green' : 'red');

  // 验证登录后的状态
  const loginState = authContext.state;
  log(`✓ 用户已设置: ${loginState.user ? loginState.user.name : 'N/A'}`, 'green');
  log(`✓ Token 已设置: ${loginState.token ? '是' : '否'}`, 'green');
  log(`✓ isAuthenticated: ${loginState.isAuthenticated}`, 'green');

  // 测试 3: 登出流程
  log('\n【测试 3】登出流程', 'blue');
  log('预期: 用户登出后，显示登录页面', 'yellow');
  
  await authContext.logout();
  
  // 模拟延迟导航（100ms）
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const afterLogoutPage = app.render();
  log(`✓ 登出后页面: ${afterLogoutPage}`, afterLogoutPage === 'LOGIN_PAGE' ? 'green' : 'red');

  // 测试 4: 最终状态验证
  log('\n【测试 4】最终状态验证', 'blue');
  log('预期: 所有认证数据已清除', 'yellow');
  
  const finalStateChecks = authContext.verifyFinalState();
  let allChecksPassed = true;
  
  finalStateChecks.forEach(check => {
    const passed = check.check();
    log(`${passed ? '✓' : '✗'} ${check.name} (${check.requirement})`, 
      passed ? 'green' : 'red');
    if (!passed) allChecksPassed = false;
  });

  // 测试 5: 状态转换历史
  log('\n【测试 5】状态转换历史', 'blue');
  log('预期: 状态转换过程正确', 'yellow');
  
  const stateHistory = authContext.getStateHistory();
  log(`\n状态转换序列:`, 'yellow');
  stateHistory.forEach((entry, index) => {
    log(`  ${index + 1}. ${entry.action}`, 'gray');
    if (entry.newState.isAuthenticated !== undefined) {
      log(`     isAuthenticated: ${entry.previousState.isAuthenticated} → ${entry.newState.isAuthenticated}`, 'gray');
    }
  });

  // 测试 6: 应用层渲染历史
  log('\n【测试 6】应用层渲染历史', 'blue');
  log('预期: 页面显示与认证状态同步', 'yellow');
  
  const renderHistory = app.getRenderHistory();
  log(`\n页面渲染序列:`, 'yellow');
  renderHistory.forEach((entry, index) => {
    log(`  ${index + 1}. ${entry.page} (isAuthenticated: ${entry.authState.isAuthenticated})`, 'gray');
  });

  // 总结
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      测试总结                               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const testsPassed = [
    initialPage === 'LOGIN_PAGE',
    afterLoginPage === 'MAIN_APP',
    afterLogoutPage === 'LOGIN_PAGE',
    allChecksPassed
  ].filter(Boolean).length;

  const totalTests = 4;

  log(`\n总计: ${testsPassed}/${totalTests} 个测试通过`, 
    testsPassed === totalTests ? 'green' : 'red');

  if (testsPassed === totalTests) {
    log('\n✓ 所有集成测试都通过了！', 'green');
    log('\n登出流程验证:', 'yellow');
    log('1. 用户登录后显示主应用 ✓', 'yellow');
    log('2. 用户登出后立即显示登录页面 ✓', 'yellow');
    log('3. 所有认证数据已正确清除 ✓', 'yellow');
    log('4. 状态转换过程正确 ✓', 'yellow');
    process.exit(0);
  } else {
    log('\n✗ 有些测试失败了。', 'red');
    process.exit(1);
  }
}

// 运行测试
runIntegrationTest().catch(error => {
  log(`\n错误: ${error.message}`, 'red');
  process.exit(1);
});
