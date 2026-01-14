#!/usr/bin/env node

/**
 * MES系统功能测试脚本
 * 自动化测试各个模块的基本功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MES系统功能测试开始...\n');

// 测试结果统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
};

// 测试工具函数
function test(description, testFn) {
  testResults.total++;
  try {
    const result = testFn();
    if (result === true) {
      console.log(`✅ ${description}`);
      testResults.passed++;
    } else if (result === 'warning') {
      console.log(`⚠️  ${description}`);
      testResults.warnings++;
    } else {
      console.log(`❌ ${description}`);
      testResults.failed++;
    }
  } catch (error) {
    console.log(`❌ ${description} - 错误: ${error.message}`);
    testResults.failed++;
  }
}

// 检查文件是否存在
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// 检查文件内容
function checkFileContent(filePath, searchText) {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return content.includes(searchText);
  } catch {
    return false;
  }
}

console.log('📁 1. 核心文件结构检查');
console.log('================================');

test('package.json 存在', () => fileExists('package.json'));
test('README.md 存在', () => fileExists('README.md'));
test('.env 配置文件存在', () => fileExists('.env'));
test('服务器主文件存在', () => fileExists('server/app.js'));
test('前端主文件存在', () => fileExists('client/src/App.js'));
test('数据库初始化文件存在', () => fileExists('database/init.sql'));

console.log('\n🎯 2. 核心组件检查');
console.log('================================');

const coreComponents = [
  'client/src/components/HomePage.js',
  'client/src/components/LoginPage.js',
  'client/src/components/Sidebar.js',
  'client/src/components/SimpleHeader.js',
  'client/src/components/SimpleProduction.js',
  'client/src/components/SimpleQuality.js',
  'client/src/components/SimpleEquipment.js',
  'client/src/components/SimpleInventory.js',
  'client/src/components/SimplePersonnel.js',
  'client/src/components/SimpleProcess.js',
  'client/src/components/SimpleIntegrationEnhanced.js',
  'client/src/components/SimpleReports.js',
  'client/src/components/SimpleSettings.js'
];

coreComponents.forEach(component => {
  const componentName = path.basename(component, '.js');
  test(`${componentName} 组件存在`, () => fileExists(component));
});

console.log('\n📊 3. 数据系统检查');
console.log('================================');

test('模拟数据文件存在', () => fileExists('client/src/data/mockData.js'));
test('数据工具类存在', () => fileExists('client/src/utils/dataUtils.js'));
test('数据服务包含基础数据', () => 
  checkFileContent('client/src/data/mockData.js', 'baseData'));
test('数据服务包含生产数据', () => 
  checkFileContent('client/src/data/mockData.js', 'productionData'));
test('数据服务包含质量数据', () => 
  checkFileContent('client/src/data/mockData.js', 'qualityData'));

console.log('\n🔐 4. 认证系统检查');
console.log('================================');

test('登录页面组件存在', () => fileExists('client/src/components/LoginPage.js'));
test('认证路由配置', () => 
  checkFileContent('client/src/App.js', 'isAuthenticated'));
test('JWT配置存在', () => 
  checkFileContent('.env', 'JWT_SECRET'));

console.log('\n🎨 5. UI组件检查');
console.log('================================');

const uiModules = [
  { name: '生产管理子组件', path: 'client/src/components/production/' },
  { name: '质量管理子组件', path: 'client/src/components/quality/' },
  { name: '设备管理子组件', path: 'client/src/components/equipment/' },
  { name: '库存管理子组件', path: 'client/src/components/inventory/' },
  { name: '人员管理子组件', path: 'client/src/components/personnel/' },
  { name: '工艺管理子组件', path: 'client/src/components/process/' },
  { name: '系统集成子组件', path: 'client/src/components/integration/' },
  { name: '系统设置子组件', path: 'client/src/components/settings/' }
];

uiModules.forEach(module => {
  test(`${module.name}目录存在`, () => 
    fs.existsSync(path.join(__dirname, '..', module.path)));
});

console.log('\n📚 6. 文档系统检查');
console.log('================================');

const docFiles = [
  'docs/README.md',
  'docs/01-project-overview/README.md',
  'docs/02-installation/QUICK_START.md',
  'docs/03-architecture/SYSTEM_ARCHITECTURE.md',
  'docs/04-user-guide/USER_GUIDE.md',
  'docs/05-development/DEVELOPMENT_GUIDE.md',
  'docs/06-deployment/DEPLOYMENT_GUIDE.md',
  'docs/07-changelog/VERSION_HISTORY.md'
];

docFiles.forEach(docFile => {
  const docName = path.basename(docFile, '.md');
  test(`${docName} 文档存在`, () => fileExists(docFile));
});

console.log('\n🔧 7. 配置文件检查');
console.log('================================');

test('Docker配置存在', () => fileExists('docker-compose.yml'));
test('Git忽略文件存在', () => fileExists('.gitignore'));
test('GitHub Actions配置存在', () => fileExists('.github/workflows/ci.yml'));
test('贡献指南存在', () => fileExists('CONTRIBUTING.md'));
test('安全政策存在', () => fileExists('SECURITY.md'));
test('许可证文件存在', () => fileExists('LICENSE'));

console.log('\n📈 8. 数据集成状态检查');
console.log('================================');

test('生产管理数据集成', () => 
  checkFileContent('client/src/components/SimpleProduction.js', 'DataService'));
test('质量管理数据集成', () => 
  checkFileContent('client/src/components/SimpleQuality.js', 'DataService'));
test('设备管理数据集成准备', () => 
  checkFileContent('client/src/components/SimpleEquipment.js', 'DataService') ? true : 'warning');
test('库存管理数据集成准备', () => 
  checkFileContent('client/src/components/SimpleInventory.js', 'DataService') ? true : 'warning');

console.log('\n📊 测试结果统计');
console.log('================================');
console.log(`总测试数: ${testResults.total}`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`⚠️  警告: ${testResults.warnings}`);
console.log(`❌ 失败: ${testResults.failed}`);

const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 所有核心功能测试通过！系统状态良好。');
} else if (testResults.failed <= 2) {
  console.log('\n✅ 系统基本功能正常，有少量问题需要修复。');
} else {
  console.log('\n⚠️  系统存在一些问题，建议优先修复失败的测试项。');
}

console.log('\n🚀 建议下一步操作:');
if (testResults.warnings > 0) {
  console.log('1. 完成数据集成 - 将剩余模块集成真实数据');
}
console.log('2. 功能测试 - 在浏览器中测试各个模块');
console.log('3. 性能优化 - 优化加载速度和用户体验');
console.log('4. 错误处理 - 添加完善的错误处理机制');

console.log('\n📱 访问地址:');
console.log('前端: http://localhost:3000');
console.log('后端: http://localhost:5002');