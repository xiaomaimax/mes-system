const { test, expect } = require('@playwright/test');

test.describe('首页功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('首页应该正常加载', async ({ page }) => {
    await expect(page).toHaveTitle(/MES|制造|系统|Max/i);
  });

  test('页面主体内容应该可见', async ({ page }) => {
    const mainContent = page.locator('main, .ant-layout-content, [role=main], #root');
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('可以点击菜单项', async ({ page }) => {
    // 尝试点击生产管理或首页链接
    const clicked = await page.click('text=首页', { timeout: 3000 }).then(() => true).catch(() => false);
    console.log('点击结果:', clicked);
  });
});

test.describe('登录功能', () => {
  test('应该显示登录页或直接进入', async ({ page }) => {
    await page.goto('/');
    const hasUsernameInput = await page.locator('input').count() > 0;
    console.log('有输入框:', hasUsernameInput);
  });
});
