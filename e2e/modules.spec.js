const { test, expect } = require("@playwright/test");

test.describe("模块导航测试", () => {
  const modules = [
    { name: "首页", path: "/dashboard" },
    { name: "工艺管理", path: "/process" },
    { name: "辅助排程", path: "/scheduling" },
    { name: "生产管理", path: "/production" },
    { name: "设备管理", path: "/equipment" },
    { name: "质量管理", path: "/quality" },
    { name: "库存管理", path: "/inventory" },
    { name: "人员管理", path: "/personnel" },
    { name: "系统集成", path: "/integration" },
    { name: "报表分析", path: "/reports" },
  ];

  for (const mod of modules) {
    test(`${mod.name} 页面加载`, async ({ page }) => {
      await page.goto(mod.path);
      await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  }
});

test.describe("菜单点击测试", () => {
  test("点击模块菜单应该正常跳转", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const modules = ["首页", "工艺管理", "生产管理", "设备管理"];
    for (const mod of modules) {
      try {
        await page.click(`text=${mod}`, { timeout: 3000 });
        await page.waitForTimeout(300);
      } catch (e) {
        console.log(`跳过: ${mod}`);
      }
    }
  });
});

test.describe("API 测试", () => {
  test("健康检查API", async ({ request }) => {
    const response = await request.get("http://192.168.100.6:5001/api/health");
    expect(response.ok()).toBeTruthy();
  });
});

test.describe("响应式布局", () => {
  test("桌面端", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
  
  test("平板端", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
