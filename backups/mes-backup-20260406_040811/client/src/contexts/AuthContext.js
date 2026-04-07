import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';

// 配置axios基础URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const mountedRef = useRef(true);
  const logoutTimeoutRef = useRef(null);

  const clearError = useCallback(() => {
    if (mountedRef.current) {
      setError(null);
    }
  }, []);

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
        console.log("SET_LOADING_FALSE"); setIsLoading(false);
      }
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await axios.get('/auth/me');
      
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
        console.log("SET_LOADING_FALSE"); setIsLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (username, password) => {
    console.log('[AuthContext] login 开始, mountedRef:', mountedRef.current);
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] 发送登录请求...');
      const response = await axios.post('/auth/login', {
        username,
        password
      });

      console.log('[AuthContext] 登录响应:', response.data);
      console.log('[AuthContext] mountedRef.current:', mountedRef.current);
      
      if (!mountedRef.current) {
        console.log('[AuthContext] 组件已卸载，返回 false');
        return { success: false };
      }

      const authToken = response.data.token;
      const userData = response.data.user;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + authToken;

      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
      console.log("SET_LOADING_FALSE"); setIsLoading(false);

      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      
      if (!mountedRef.current) {
        return { success: false, message: '登录失败' };
      }

      const errorMessage = err.response?.data?.message || err.message || '登录失败，请检查后端服务是否正常';
      
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      console.log("SET_LOADING_FALSE"); setIsLoading(false);

      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  const logout = useCallback(() => {
    return new Promise((resolve) => {
      if (!mountedRef.current) {
        resolve();
        return;
      }

      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];

        flushSync(() => {
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
        });

        window.dispatchEvent(new Event('logout'));
        
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

  const refreshToken = useCallback(async () => {
    if (!mountedRef.current) return { success: false };

    try {
      const response = await axios.post('/auth/refresh');
      
      if (!mountedRef.current) return { success: false };

      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      setToken(newToken);

      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Token refresh error:', err);
      
      if (!mountedRef.current) return { success: false };

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

  useEffect(() => {
    // React 18 Strict Mode: 重置 mountedRef
    mountedRef.current = true;
    checkAuthStatus();

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

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    login,
    logout,
    clearError,
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
