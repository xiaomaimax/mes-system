const { test, expect } = require('@playwright/test');

test.describe('API 测试', () => {
  test('后端 API 应该正常响应', async ({ request }) => {
    const response = await request.get('http://192.168.100.6:5001/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('前端页面应该正常加载', async ({ page }) => {
    const response = await page.goto('http://192.168.100.6');
    expect(response.status()).toBeLessThan(400);
  });
});

test.describe('响应式测试', () => {
  test('桌面端应该正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
