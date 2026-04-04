/**
 * MaxMES PWA 自动化测试
 * 使用 Puppeteer 验证 PWA 功能和离线访问
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://192.168.100.6';
const REPORT_DIR = '/opt/mes-system/reports';

async function testPWA() {
  console.log('🧪 MaxMES PWA 自动化测试\n');
  console.log('================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
  };

  try {
    // 测试 1: 页面加载
    console.log('📊 测试 1: 页面加载');
    console.log('--------------------------------');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    const title = await page.title();
    console.log(`✅ 页面标题：${title}`);
    results.tests.push({
      name: '页面加载',
      passed: true,
      details: title,
    });
    results.passed++;

    // 测试 2: Manifest 检查
    console.log('\n📊 测试 2: Manifest 检查');
    console.log('--------------------------------');
    const manifestLink = await page.$('link[rel="manifest"]');
    if (manifestLink) {
      const href = await manifestLink.evaluate(el => el.href);
      console.log(`✅ Manifest 链接存在：${href}`);
      results.tests.push({
        name: 'Manifest 链接',
        passed: true,
        details: href,
      });
      results.passed++;
    } else {
      console.log('❌ Manifest 链接不存在');
      results.tests.push({ name: 'Manifest 链接', passed: false });
      results.failed++;
    }

    // 测试 3: Service Worker 注册
    console.log('\n📊 测试 3: Service Worker 注册');
    console.log('--------------------------------');
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    if (swRegistration) {
      console.log('✅ Service Worker 已注册');
      results.tests.push({
        name: 'Service Worker 注册',
        passed: true,
      });
      results.passed++;
    } else {
      console.log('❌ Service Worker 未注册');
      results.tests.push({ name: 'Service Worker 注册', passed: false });
      results.failed++;
    }

    // 等待 Service Worker 激活
    console.log('\n等待 Service Worker 激活...');
    await page.waitForFunction(
      () => {
        return navigator.serviceWorker.controller !== null;
      },
      { timeout: 10000 }
    );
    console.log('✅ Service Worker 已激活');

    // 测试 4: 缓存检查
    console.log('\n📊 测试 4: 缓存检查');
    console.log('--------------------------------');
    const cacheNames = await page.evaluate(async () => {
      if ('caches' in window) {
        return await caches.keys();
      }
      return [];
    });

    console.log('缓存列表:', cacheNames);
    if (cacheNames.length > 0) {
      console.log('✅ 缓存已创建');
      results.tests.push({
        name: '缓存检查',
        passed: true,
        details: cacheNames,
      });
      results.passed++;
    } else {
      console.log('⚠️  缓存未创建（可能需要首次完整加载）');
      results.tests.push({
        name: '缓存检查',
        passed: false,
        details: '缓存列表为空',
      });
      results.failed++;
    }

    // 测试 5: 离线访问
    console.log('\n📊 测试 5: 离线访问测试');
    console.log('--------------------------------');
    
    // 先确保页面已加载
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // 启用离线模式
    await page.setOfflineMode(true);
    console.log('🔌 已启用离线模式');

    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
      const offlineTitle = await page.title();
      console.log(`✅ 离线模式页面可访问，标题：${offlineTitle}`);
      results.tests.push({
        name: '离线访问',
        passed: true,
        details: offlineTitle,
      });
      results.passed++;
    } catch (error) {
      console.log('❌ 离线模式无法访问页面');
      results.tests.push({
        name: '离线访问',
        passed: false,
        details: error.message,
      });
      results.failed++;
    }

    // 禁用离线模式
    await page.setOfflineMode(false);
    console.log('🔌 已禁用离线模式');

    // 测试 6: 截图
    console.log('\n📊 测试 6: 页面截图');
    console.log('--------------------------------');
    const screenshotPath = path.join(REPORT_DIR, `pwa-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 截图已保存：${screenshotPath}`);
    results.tests.push({
      name: '页面截图',
      passed: true,
      details: screenshotPath,
    });
    results.passed++;

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    results.tests.push({
      name: '测试异常',
      passed: false,
      details: error.message,
    });
    results.failed++;
  }

  // 生成报告
  console.log('\n================================');
  console.log('📈 测试结果汇总');
  console.log('================================');
  console.log(`总测试数：${results.tests.length}`);
  console.log(`✅ 通过：${results.passed}`);
  console.log(`❌ 失败：${results.failed}`);
  console.log(`成功率：${((results.passed / results.tests.length) * 100).toFixed(1)}%`);

  // 保存 JSON 报告
  const reportPath = path.join(REPORT_DIR, `pwa-test-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 报告已保存：${reportPath}`);

  await browser.close();

  // 返回退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行测试
testPWA().catch(console.error);
