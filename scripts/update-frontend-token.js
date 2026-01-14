/**
 * 前端Token管理工具
 * 提供安全的token更新和验证功能
 */

// 配置常量
const CONFIG = {
  TOKEN_KEY: 'token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5分钟缓冲时间
  DEFAULT_TOKEN: process.env.MES_DEFAULT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiLCJtYW5hZ2UiXSwiaWF0IjoxNzY3MTQ3ODk5LCJleHAiOjE3NjcyMzQyOTksImF1ZCI6Im1lcy1jbGllbnQiLCJpc3MiOiJtZXMtc3lzdGVtIn0.7duxEfXm0kFrxo-AzfvFCsoQdYhQ5-YQzWtEFpvINwU'
};

/**
 * Token管理类
 */
class TokenManager {
  /**
   * 验证JWT token格式
   * @param {string} token - JWT token
   * @returns {boolean} 是否为有效格式
   */
  static isValidJWTFormat(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * 解析JWT token payload
   * @param {string} token - JWT token
   * @returns {object|null} 解析后的payload或null
   */
  static parseTokenPayload(token) {
    try {
      if (!this.isValidJWTFormat(token)) return null;
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Token解析失败:', error);
      return null;
    }
  }

  /**
   * 检查token是否过期
   * @param {string} token - JWT token
   * @returns {boolean} 是否过期
   */
  static isTokenExpired(token) {
    const payload = this.parseTokenPayload(token);
    if (!payload || !payload.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expiry = payload.exp - Math.floor(CONFIG.TOKEN_EXPIRY_BUFFER / 1000);
    return now >= expiry;
  }

  /**
   * 更新localStorage中的token
   * @param {string} newToken - 新的token
   * @returns {boolean} 更新是否成功
   */
  static updateToken(newToken) {
    try {
      if (!this.isValidJWTFormat(newToken)) {
        throw new Error('无效的JWT token格式');
      }

      if (this.isTokenExpired(newToken)) {
        throw new Error('Token已过期');
      }

      localStorage.setItem(CONFIG.TOKEN_KEY, newToken);
      console.log('✅ Token更新成功');
      return true;
    } catch (error) {
      console.error('❌ Token更新失败:', error.message);
      return false;
    }
  }

  /**
   * 获取当前token信息
   * @returns {object} token信息
   */
  static getCurrentTokenInfo() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
      return { exists: false, message: '未找到token' };
    }

    const payload = this.parseTokenPayload(token);
    if (!payload) {
      return { exists: true, valid: false, message: 'Token格式无效' };
    }

    const isExpired = this.isTokenExpired(token);
    const expiryDate = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : '未知';

    return {
      exists: true,
      valid: !isExpired,
      expired: isExpired,
      user: payload.username || '未知',
      role: payload.role || '未知',
      permissions: payload.permissions || [],
      expiryDate,
      message: isExpired ? 'Token已过期' : 'Token有效'
    };
  }

  /**
   * 显示使用说明
   */
  static showUsageInstructions() {
    console.log(`
🔧 MES系统Token管理工具

=== 使用方法 ===

1. 更新Token:
   TokenManager.updateToken('your-new-jwt-token-here');

2. 检查当前Token状态:
   TokenManager.getCurrentTokenInfo();

3. 使用默认Token (仅开发环境):
   TokenManager.useDefaultToken();

4. 清除Token:
   TokenManager.clearToken();

=== 当前Token状态 ===`);
    
    const info = this.getCurrentTokenInfo();
    console.table(info);
  }

  /**
   * 使用默认token (仅开发环境)
   */
  static useDefaultToken() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ 生产环境不允许使用默认token');
      return false;
    }
    return this.updateToken(CONFIG.DEFAULT_TOKEN);
  }

  /**
   * 清除token
   */
  static clearToken() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    console.log('🗑️ Token已清除');
  }
}

// 如果在浏览器环境中运行，显示使用说明
if (typeof window !== 'undefined') {
  // 将TokenManager暴露到全局作用域以便在控制台中使用
  window.TokenManager = TokenManager;
  TokenManager.showUsageInstructions();
} else {
  // Node.js环境，导出模块
  module.exports = TokenManager;
}