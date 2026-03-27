/**
 * 认证工具函数
 * 提供统一的认证相关功能
 */

import axios from 'axios';

// API 基础 URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Token 存储键名
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

/**
 * Token 管理器
 */
export class TokenManager {
  /**
   * 获取存储的 token
   */
  static getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * 保存 token
   * @param {string} token - JWT token
   * @param {boolean} persistent - 是否持久化存储（localStorage vs sessionStorage）
   */
  static setToken(token, persistent = true) {
    if (persistent) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    
    // 设置 axios 默认请求头
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * 清除 token
   */
  static clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * 检查 token 是否过期
   * @param {string} token - JWT token
   * @returns {boolean} - 是否过期
   */
  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * 获取 token 过期时间
   * @param {string} token - JWT token
   * @returns {number|null} - 过期时间戳（毫秒）
   */
  static getTokenExpiry(token) {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }
}

/**
 * 用户信息管理器
 */
export class UserManager {
  /**
   * 获取存储的用户信息
   */
  static getUserInfo() {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * 保存用户信息
   * @param {Object} user - 用户信息对象
   */
  static setUserInfo(user) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  }

  /**
   * 清除用户信息
   */
  static clearUserInfo() {
    localStorage.removeItem(USER_INFO_KEY);
  }
}

/**
 * 认证 API 调用
 */
export const authAPI = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 登录结果
   */
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });

      const { token, user } = response.data;
      
      // 保存认证信息
      TokenManager.setToken(token);
      UserManager.setUserInfo(user);

      return {
        success: true,
        data: { token, user }
      };
    } catch (error) {
      console.error('[AuthAPI] Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || '登录失败，请检查用户名和密码',
        error
      };
    }
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户注册信息
   * @returns {Promise<Object>} - 注册结果
   */
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[AuthAPI] Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || '注册失败',
        errors: error.response?.data?.errors || [],
        error
      };
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      return {
        success: true,
        data: response.data.user
      };
    } catch (error) {
      console.error('[AuthAPI] Get current user failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || '获取用户信息失败',
        error
      };
    }
  },

  /**
   * 登出
   */
  logout() {
    TokenManager.clearToken();
    UserManager.clearUserInfo();
  }
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
export function isAuthenticated() {
  const token = TokenManager.getToken();
  if (!token) return false;
  
  return !TokenManager.isTokenExpired(token);
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null} - 用户信息
 */
export function getCurrentUser() {
  return UserManager.getUserInfo();
}

/**
 * 获取授权头
 * @returns {Object} - 授权头对象
 */
export function getAuthHeader() {
  const token = TokenManager.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 配置 axios 拦截器
 */
export function setupAxiosInterceptors() {
  // 请求拦截器
  axios.interceptors.request.use(
    (config) => {
      const token = TokenManager.getToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 未授权，清除认证信息并重定向到登录页
      if (error.response?.status === 401) {
        TokenManager.clearToken();
        UserManager.clearUserInfo();
        
        // 如果不是登录请求，则重定向到登录页
        if (!error.config.url.includes('/auth/login')) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
}

export default {
  TokenManager,
  UserManager,
  authAPI,
  isAuthenticated,
  getCurrentUser,
  getAuthHeader,
  setupAxiosInterceptors
};
