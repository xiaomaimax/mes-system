import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';

const AuthContext = createContext();

/**
 * useAuth Hook
 * Provides access to authentication context
 * Requirement 1.5: Provide consistent authentication state across all components
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * 
 * Enhanced authentication context with improved state management.
 * Provides explicit loading states, error handling, and recovery mechanisms.
 * 
 * Requirements: 1.4, 1.5, 4.3
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const logoutTimeoutRef = useRef(null);

  /**
   * Clear error state
   * Requirement 4.3: Reset to a known good state when authentication is inconsistent
   */
  const clearError = useCallback(() => {
    if (mountedRef.current) {
      setError(null);
    }
  }, []);

  /**
   * Check authentication status
   * Requirement 1.2: Establish user context before rendering authenticated components
   */
  const checkAuthStatus = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const storedToken = localStorage.getItem('token');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (storedToken && storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          
          if (!mountedRef.current) return;

          setToken(storedToken);
          setUser(userInfo);
          setIsAuthenticated(true);
          setError(null);
        } catch (parseErr) {
          // JSON 解析失败，清除无效数据
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          
          if (!mountedRef.current) return;

          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
        }
      } else {
        if (!mountedRef.current) return;

        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
      }
    } catch (err) {
      console.error('[AuthContext] Error checking authentication status:', err);
      
      if (!mountedRef.current) return;

      setError('Failed to check authentication status');
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Fetch user information from API
   */
  const fetchUser = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await axios.get('/api/auth/me');
      
      if (!mountedRef.current) return;

      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('[AuthContext] Error fetching user:', err);
      
      if (!mountedRef.current) return;

      setError('Failed to fetch user information');
      await logout();
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Login method
   * Requirement 1.1: Clear all user data and reset component states on logout
   * 暂时简化版本：不使用后端API，直接模拟登录成功
   */
  const login = useCallback(async (username, password) => {
    // 立即设置 loading 状态
    setIsLoading(true);
    setError(null);

    // 使用 setTimeout 模拟异步操作，但立即完成
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // 模拟用户数据
          const mockUser = {
            id: 1,
            username: username,
            name: username === 'admin' ? '系统管理员' : username,
            email: `${username}@mes-system.com`,
            department: '管理部',
            role: '超级管理员'
          };
          
          const mockToken = 'mock-token-' + Date.now();
          
          // Store authentication data
          localStorage.setItem('token', mockToken);
          localStorage.setItem('userInfo', JSON.stringify(mockUser));

          // Update state - 确保 isLoading 被设置为 false
          if (mountedRef.current) {
            setToken(mockToken);
            setUser(mockUser);
            setIsAuthenticated(true);
            setError(null);
            setIsLoading(false);
          }

          resolve({ success: true });
        } catch (err) {
          console.error('[AuthContext] Login error:', err);
          
          if (mountedRef.current) {
            setError('Login failed');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }

          resolve({
            success: false,
            message: 'Login failed'
          });
        }
      }, 0);
    });
  }, []);

  /**
   * Logout method
   * Requirement 1.1: Clear all user data and reset component states on logout
   * Requirement 2.4: Complete cleanup operations during logout
   * 优化：移除不必要的 console.log，使用 flushSync 确保同步更新
   */
  const logout = useCallback(() => {
    return new Promise((resolve) => {
      if (!mountedRef.current) {
        resolve();
        return;
      }

      try {
        // 清除存储中的认证数据（立即执行）
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];

        // 使用 flushSync 强制同步更新状态
        flushSync(() => {
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
        });

        // 分发存储事件用于跨标签页登出
        window.dispatchEvent(new Event('logout'));
        
        // 立即 resolve，因为状态已经同步更新
        resolve();
      } catch (err) {
        console.error('[AuthContext] Logout error:', err);
        
        if (!mountedRef.current) {
          resolve();
          return;
        }

        setError('Failed to logout properly');
        resolve();
      }
    });
  }, []);

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    if (!mountedRef.current) return { success: false };

    try {
      const response = await axios.post('/api/auth/refresh');
      
      if (!mountedRef.current) return { success: false };

      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);

      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Token refresh error:', err);
      
      if (!mountedRef.current) return { success: false };

      // 清除认证数据而不调用 logout 以避免循环依赖
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return { success: false };
    }
  }, []);

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    checkAuthStatus();

    // Listen for logout events from other tabs
    const handleLogout = () => {
      if (mountedRef.current) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, [checkAuthStatus]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token,

    // Actions
    login,
    logout,
    clearError,

    // Utilities
    checkAuthStatus,
    fetchUser,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};