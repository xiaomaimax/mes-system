/**
 * 前端输入验证工具（P1-1 优化）
 * 提供统一的表单验证功能
 */

/**
 * 验证规则定义
 */
export const validationRules = {
  // 用户名验证
  username: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]{3,50}$/,
    message: '用户名必须是 3-50 个字符，只能包含字母、数字、下划线和连字符'
  },
  
  // 密码验证
  password: {
    required: true,
    minLength: 6,
    maxLength: 100,
    message: '密码必须至少 6 个字符'
  },
  
  // 邮箱验证
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  
  // 手机号验证
  phone: {
    required: false,
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码'
  },
  
  // 数字范围验证
  number: (min = 0, max = Infinity) => ({
    required: true,
    validate: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: `请输入${min}到${max}之间的数字`
  }),
  
  // 必填字段
  required: {
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message: '此字段为必填项'
  }
};

/**
 * 验证单个字段
 * @param {*} value - 字段值
 * @param {object} rule - 验证规则
 * @returns {{valid: boolean, message: string}}
 */
export function validateField(value, rule) {
  // 检查必填
  if (rule.required && (value === undefined || value === null || value === '')) {
    return { valid: false, message: rule.message || '此字段为必填项' };
  }

  // 如果不必填且为空，则跳过验证
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }

  // 自定义验证函数
  if (rule.validate && typeof rule.validate === 'function') {
    const isValid = rule.validate(value);
    return {
      valid: isValid,
      message: isValid ? '' : (rule.message || '验证失败')
    };
  }

  // 正则表达式验证
  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message || '格式不正确' };
  }

  // 最小长度验证
  if (rule.minLength && value.length < rule.minLength) {
    return { valid: false, message: `最少需要${rule.minLength}个字符` };
  }

  // 最大长度验证
  if (rule.maxLength && value.length > rule.maxLength) {
    return { valid: false, message: `最多${rule.maxLength}个字符` };
  }

  return { valid: true, message: '' };
}

/**
 * 验证整个表单
 * @param {object} formData - 表单数据
 * @param {object} rules - 验证规则对象
 * @returns {{valid: boolean, errors: object}}
 */
export function validateForm(formData, rules) {
  const errors = {};
  let valid = true;

  Object.keys(rules).forEach(fieldName => {
    const result = validateField(formData[fieldName], rules[fieldName]);
    if (!result.valid) {
      errors[fieldName] = result.message;
      valid = false;
    }
  });

  return { valid, errors };
}

/**
 * 表单验证 Hook（React）
 * @param {object} initialData - 初始表单数据
 * @param {object} rules - 验证规则
 * @returns {object} 验证器对象
 */
export function useFormValidation(initialData, rules) {
  const validate = (formData) => {
    return validateForm(formData, rules);
  };

  const validateField_single = (name, value) => {
    return validateField(value, rules[name]);
  };

  return {
    validate,
    validateField: validateField_single,
    rules
  };
}

/**
 * 常用验证组合
 */
export const commonValidations = {
  // 登录表单
  login: {
    username: validationRules.username,
    password: validationRules.password
  },
  
  // 注册表单
  register: {
    username: validationRules.username,
    password: validationRules.password,
    email: validationRules.email
  },
  
  // 生产订单
  productionOrder: {
    order_number: validationRules.required,
    product_code: validationRules.required,
    planned_quantity: validationRules.number(1)
  }
};

export default {
  validationRules,
  validateField,
  validateForm,
  useFormValidation,
  commonValidations
};
