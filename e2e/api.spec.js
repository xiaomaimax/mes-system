const { test, expect, request } = require("@playwright/test");

const API_BASE = "http://192.168.100.6:5001";

/**
 * API 详细测试
 */

test.describe("健康检查 API", () => {
  test("GET /api/health 返回 200", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test("健康检查返回正确字段", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    const body = await response.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("uptime");
    expect(body).toHaveProperty("environment");
    expect(body).toHaveProperty("version");
  });

  test("健康检查包含性能指标", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    const body = await response.json();
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThan(0);
  });
});

test.describe("认证 API", () => {
  test("未认证请求应返回 401", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/inventory`);
    expect(response.status()).toBe(401);
  });

  test("无效 token 应返回认证错误", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/inventory`, {
      headers: { "Authorization": "Bearer invalid_token" }
    });
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

test.describe("CORS 测试", () => {
  test("OPTIONS 请求应该支持", async ({ request }) => {
    const response = await request.fetch(`${API_BASE}/api/health`, {
      method: "OPTIONS"
    });
    // CORS 相关头部
    console.log("CORS Headers:", response.headers());
  });
});

test.describe("错误处理 API", () => {
  test("不存在的路由应返回 404", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test("404 响应应包含错误信息", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/nonexistent`);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body).toHaveProperty("code", "NOT_FOUND");
  });
});

test.describe("响应时间测试", () => {
  test("健康检查响应时间应小于 500ms", async ({ request }) => {
    const start = Date.now();
    await request.get(`${API_BASE}/api/health`);
    const duration = Date.now() - start;
    console.log(`健康检查响应时间: ${duration}ms`);
    expect(duration).toBeLessThan(500);
  });
});

test.describe("数据格式测试", () => {
  test("健康检查应返回 JSON", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("JSON 响应应格式正确", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    const body = await response.json();
    // 验证 JSON 可解析
    expect(JSON.stringify(body)).toBeTruthy();
  });
});

test.describe("边界测试", () => {
  test("空路径应返回 404", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api`);
    expect(response.status()).toBe(404);
  });

  test("特殊字符路径应被拒绝", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/../etc/passwd`);
    expect(response.status()).toBe(404);
  });
});
