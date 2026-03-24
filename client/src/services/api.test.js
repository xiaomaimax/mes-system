/**
 * API 服务单元测试（P1-9 单元测试）
 */

import API, { TokenManager, CircuitBreaker } from './api';

describe('API Service', () => {
  describe('TokenManager', () => {
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    test('设置和获取 Token', () => {
      const token = 'test.jwt.token';
      TokenManager.setToken(token, true);
      expect(TokenManager.getToken()).toBe(token);
    });

    test('清除 Token', () => {
      TokenManager.setToken('test.token');
      TokenManager.clearToken();
      expect(TokenManager.getToken()).toBeNull();
    });

    test('Token 过期检查 - 有效 Token', () => {
      // 创建一个未来过期的 token
      const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      expect(TokenManager.isTokenExpired(token)).toBe(false);
    });

    test('Token 过期检查 - 过期 Token', () => {
      // 创建一个已过期的 token
      const payload = { exp: Math.floor(Date.now() / 1000) - 3600 };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      expect(TokenManager.isTokenExpired(token)).toBe(true);
    });
  });

  describe('CircuitBreaker', () => {
    test('正常执行', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await breaker.execute(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('失败达到阈值后打开熔断器', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      // 失败 3 次
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(operation);
        } catch (e) {
          // 忽略错误
        }
      }

      // 第 4 次应该直接抛出熔断器错误
      await expect(breaker.execute(operation)).rejects.toThrow('服务暂时不可用');
    });

    test('熔断器超时后恢复', async () => {
      const breaker = new CircuitBreaker(1, 100); // 1 次失败就打开，100ms 后恢复
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      // 失败 1 次，打开熔断器
      try {
        await breaker.execute(operation);
      } catch (e) {}

      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 150));

      // 应该可以再次执行
      expect(breaker.state).toBe('OPEN');
    });
  });
});
