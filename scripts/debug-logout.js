/**
 * 登出功能调试脚本
 * 
 * 这个脚本用于调试登出功能，检查：
 * 1. logout 方法是否被正确调用
 * 2. localStorage 是否被正确清除
 * 3. 认证状态是否被正确更新
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
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

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// 检查 logout 方法是否正确实现
function checkLogoutImplementation() {
  log('\n=== 检查 logout 方法实现 ===', 'blue');
  
  const authContextPath = path.join(__dirname, '../client/src/contexts/AuthContext.js');
  const content = readFile(authContextPath);
  
  // 检查 logout 方法是否存在
  if (!content.includes('const logout = useCallback(async () => {')) {
    log('✗ logout 方法不存在或格式不正确', 'red');
    return false;
  }
  log('✓ logout 方法存在', 'green');
  
  // 检查是否清除了 token
  if (!content.includes("localStorage.removeItem('token')")) {
    log('✗ 没有清除 localStorage 中的 token', 'red');
    return false;
  }
  log('✓ 清除了 localStorage 中的 token', 'green');
  
  // 检查是否清除了 userInfo
  if (!content.includes("localStorage.removeItem('userInfo')")) {
    log('✗ 没有清除 localStorage 中的 userInfo', 'red');
    return false;
  }
  log('✓ 清除了 localStorage 中的 userInfo', 'green');
  
  // 检查是否设置了 isAuthenticated = false
  if (!content.includes('setIsAuthenticated(false)')) {
    log('✗ 没有设置 isAuthenticated = false', 'red');
    return false;
  }
  log('✓ 设置了 isAuthenticated = false', 'green');
  
  return true;
}

// 检查 SimpleHeader 中的 handleLogout 是否正确调用 logout
function checkHandleLogout() {
  log('\n=== 检查 SimpleHeader 中的 handleLogout ===', 'blue');
  
  const headerPath = path.join(__dirname, '../client/src/components/SimpleHeader.js');
  const content = readFile(headerPath);
  
  // 检查是否调用了 logout
  if (!content.includes('await logout()')) {
    log('✗ 没有调用 logout 方法', 'red');
    return false;
  }
  log('✓ 调用了 logout 方法', 'green');
  
  // 检查是否有延迟导航
  if (!content.includes('setTimeout(() => {')) {
    log('✗ 没有延迟导航', 'red');
    return false;
  }
  log('✓ 有延迟导航', 'green');
  
  // 检查延迟时间
  if (!content.includes('}, 100)')) {
    log('⚠ 延迟时间可能不是 100ms', 'yellow');
  } else {
    log('✓ 延迟时间为 100ms', 'green');
  }
  
  return true;
}

// 检查 App.js 中的认证检查
function checkAppAuthentication() {
  log('\n=== 检查 App.js 中的认证检查 ===', 'blue');
  
  const appPath = path.join(__dirname, '../client/src/App.js');
  const content = readFile(appPath);
  
  // 检查是否检查了 isAuthenticated
  if (!content.includes('if (!isAuthenticated)')) {
    log('✗ 没有检查 isAuthenticated', 'red');
    return false;
  }
  log('✓ 检查了 isAuthenticated', 'green');
  
  // 检查是否返回了 LoginPage
  if (!content.includes('return <LoginPage />')) {
    log('✗ 没有返回 LoginPage', 'red');
    return false;
  }
  log('✓ 返回了 LoginPage', 'green');
  
  return true;
}

// 主函数
function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         登出功能调试脚本                                    ║', 'cyan');
  log('║         Logout Debug Script                                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  try {
    results.push(checkLogoutImplementation());
    results.push(checkHandleLogout());
    results.push(checkAppAuthentication());
  } catch (error) {
    log(`\n错误: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // 总结
  const allPassed = results.every(r => r);
  
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      调试总结                               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  if (allPassed) {
    log('\n✓ 所有检查都通过了！代码实现看起来是正确的。', 'green');
    log('\n可能的问题:', 'yellow');
    log('1. logout 方法可能没有被正确调用（检查 Modal.confirm 的 onOk 回调）', 'yellow');
    log('2. 可能存在 React 状态更新的延迟问题', 'yellow');
    log('3. 可能需要检查浏览器控制台的错误信息', 'yellow');
    log('4. 可能需要检查网络请求是否有问题', 'yellow');
  } else {
    log('\n✗ 有些检查失败了。请检查上面的错误信息。', 'red');
  }
}

main();
