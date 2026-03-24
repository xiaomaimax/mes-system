/**
 * 输入验证工具单元测试（P1-9 单元测试）
 */

import { validateField, validateForm, validationRules } from './validation';

describe('Input Validation', () => {
  describe('validateField', () => {
    test('用户名验证 - 有效输入', () => {
      const result = validateField('test_user123', validationRules.username);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
    });

    test('用户名验证 - 无效格式', () => {
      const result = validateField('test@user', validationRules.username);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('用户名必须是');
    });

    test('用户名验证 - 太短', () => {
      const result = validateField('ab', validationRules.username);
      expect(result.valid).toBe(false);
    });

    test('密码验证 - 有效输入', () => {
      const result = validateField('password123', validationRules.password);
      expect(result.valid).toBe(true);
    });

    test('密码验证 - 太短', () => {
      const result = validateField('12345', validationRules.password);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('至少 6 个字符');
    });

    test('邮箱验证 - 有效输入', () => {
      const result = validateField('test@example.com', validationRules.email);
      expect(result.valid).toBe(true);
    });

    test('邮箱验证 - 无效格式', () => {
      const result = validateField('invalid-email', validationRules.email);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('有效的邮箱地址');
    });

    test('非必填字段 - 空值', () => {
      const result = validateField('', validationRules.phone);
      expect(result.valid).toBe(true); // 非必填，空值应该通过
    });
  });

  describe('validateForm', () => {
    test('表单验证 - 全部有效', () => {
      const formData = {
        username: 'test_user',
        password: 'password123'
      };
      const rules = {
        username: validationRules.username,
        password: validationRules.password
      };

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('表单验证 - 部分无效', () => {
      const formData = {
        username: 'ab', // 太短
        password: 'password123'
      };
      const rules = {
        username: validationRules.username,
        password: validationRules.password
      };

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(false);
      expect(result.errors.username).toBeDefined();
      expect(result.errors.password).toBeUndefined();
    });
  });
});
