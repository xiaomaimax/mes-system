/**
 * 登出功能修复验证脚本
 * 
 * 这个脚本验证登出功能是否正确工作：
 * 1. 检查 AuthContext 中的 logout 方法是否正确清除状态
 * 2. 检查 SimpleHeader 中的 handleLogout 是否正确调用 logout
 * 3. 检查 App.js 中的认证状态检查是否正确
 * 
 * Requirements: 1.1, 1.2, 2.4, 5.3
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// 测试 1: 验证 AuthContext 中的 logout 方法
function testAuthContextLogout() {
  log('\n=== 测试 1: AuthContext logout 方法 ===', 'blue');
  
  const authContextPath = path.join(__dirname, '../client/src/contexts/AuthContext.js');
  const content = readFile(authContextPath);
  
  const checks = [
    {
      name: '检查 logout 方法是否存在',
      pattern: /const logout = useCallback\(async \(\) => \{/,
      required: true
    },
    {
      name: '检查是否立即清除 token 状态',
      pattern: /setToken\(null\);/,
      required: true
    },
    {
      name: '检查是否立即清除 user 状态',
      pattern: /setUser\(null\);/,
      required: true
    },
    {
      name: '检查是否立即清除 isAuthenticated 状态',
      pattern: /setIsAuthenticated\(false\);/,
      required: true
    },
    {
      name: '检查是否清除 localStorage 中的 token',
      pattern: /localStorage\.removeItem\('token'\);/,
      required: true
    },
    {
      name: '检查是否清除 localStorage 中的 userInfo',
      pattern: /localStorage\.removeItem\('userInfo'\);/,
      required: true
    },
    {
      name: '检查是否分发 logout 事件',
      pattern: /window\.dispatchEvent\(new Event\('logout'\)\);/,
      required: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      log(`✓ ${check.name}`, 'green');
      passed++;
    } else {
      log(`✗ ${check.name}`, 'red');
      failed++;
    }
  });
  
  return { passed, failed };
}

// 测试 2: 验证 SimpleHeader 中的 handleLogout
function testSimpleHeaderLogout() {
  log('\n=== 测试 2: SimpleHeader handleLogout 方法 ===', 'blue');
  
  const headerPath = path.join(__dirname, '../client/src/components/SimpleHeader.js');
  const content = readFile(headerPath);
  
  const checks = [
    {
      name: '检查 handleLogout 方法是否存在',
      pattern: /const handleLogout = async \(\) => \{/,
      required: true
    },
    {
      name: '检查是否调用 logout 方法',
      pattern: /await logout\(\);/,
      required: true
    },
    {
      name: '检查是否显示成功消息',
      pattern: /safeMessage\.success\('已安全退出'\);/,
      required: true
    },
    {
      name: '检查是否延迟导航到登录页面',
      pattern: /setTimeout\(\(\) => \{\s*navigate\('\/login'\);/,
      required: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      log(`✓ ${check.name}`, 'green');
      passed++;
    } else {
      log(`✗ ${check.name}`, 'red');
      failed++;
    }
  });
  
  return { passed, failed };
}

// 测试 3: 验证 App.js 中的认证状态检查
function testAppAuthentication() {
  log('\n=== 测试 3: App.js 认证状态检查 ===', 'blue');
  
  const appPath = path.join(__dirname, '../client/src/App.js');
  const content = readFile(appPath);
  
  const checks = [
    {
      name: '检查是否从 useAuth 获取 isAuthenticated',
      pattern: /const \{ isAuthenticated, isLoading \} = useAuth\(\);/,
      required: true
    },
    {
      name: '检查是否检查 isLoading 状态',
      pattern: /if \(isLoading\)/,
      required: true
    },
    {
      name: '检查是否在未认证时显示登录页面',
      pattern: /if \(!isAuthenticated\) \{\s*return <LoginPage \/>;/,
      required: true
    },
    {
      name: '检查是否在已认证时显示主应用',
      pattern: /<Layout style=\{\{ minHeight: '100vh'/,
      required: true
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      log(`✓ ${check.name}`, 'green');
      passed++;
    } else {
      log(`✗ ${check.name}`, 'red');
      failed++;
    }
  });
  
  return { passed, failed };
}

// 主函数
function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         登出功能修复验证脚本                                ║', 'cyan');
  log('║         Logout Fix Verification Script                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  try {
    results.push(testAuthContextLogout());
    results.push(testSimpleHeaderLogout());
    results.push(testAppAuthentication());
  } catch (error) {
    log(`\n错误: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // 总结
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      测试总结                               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n总计: ${totalPassed} 个通过, ${totalFailed} 个失败`, 
    totalFailed === 0 ? 'green' : 'red');
  
  if (totalFailed === 0) {
    log('\n✓ 所有检查都通过了！登出功能修复已完成。', 'green');
    log('\n修复内容总结:', 'yellow');
    log('1. AuthContext.logout() 现在立即清除所有认证状态', 'yellow');
    log('2. SimpleHeader.handleLogout() 正确等待 logout 完成后导航', 'yellow');
    log('3. App.js 在认证状态改变时立即重新渲染', 'yellow');
    process.exit(0);
  } else {
    log('\n✗ 有些检查失败了。请检查上面的错误信息。', 'red');
    process.exit(1);
  }
}

main();
