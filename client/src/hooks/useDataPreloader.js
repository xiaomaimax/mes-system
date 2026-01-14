/**
 * useDataPreloader - 数据预加载Hook
 * 
 * 功能：
 * - 管理数据预加载状态
 * - 提供预加载控制方法
 * - 监控预加载进度
 * 
 * Requirements: 10.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dataPreloader from '../services/DataPreloader';

/**
 * 数据预加载Hook
 * @param {Object} options - 配置选项
 * @param {boolean} options.autoStart - 是否自动开始预加载
 * @param {Array} options.modules - 要预加载的模块列表
 * @param {Object} options.userContext - 用户上下文
 * @returns {Object} 预加载状态和控制方法
 */
const useDataPreloader = (options = {}) => {
  const {
    autoStart = false,
    modules = null,
    userContext = {}
  } = options;

  const [preloadStatus, setPreloadStatus] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadStats, setPreloadStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    loading: 0,
    not_started: 0
  });

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // 更新预加载状态
  const updatePreloadStatus = useCallback(() => {
    if (!mountedRef.current) return;
    
    const status = dataPreloader.getAllPreloadStatus();
    const stats = dataPreloader.getPreloadStats();
    
    setPreloadStatus(status);
    setPreloadStats(stats);
    setIsPreloading(dataPreloader.isPreloading);
  }, []);

  // 开始预加载
  const startPreload = useCallback(async (preloadOptions = {}) => {
    const options = {
      modules,
      background: true,
      ...preloadOptions
    };
    
    setIsPreloading(true);
    
    try {
      await dataPreloader.startPreload(options);
    } catch (error) {
      console.error('[useDataPreloader] 预加载失败:', error);
    }
    
    updatePreloadStatus();
  }, [modules, updatePreloadStatus]);

  // 预加载特定模块
  const preloadModule = useCallback(async (module, preloadOptions = {}) => {
    try {
      await dataPreloader.preloadModule(module, preloadOptions);
      updatePreloadStatus();
    } catch (error) {
      console.error(`[useDataPreloader] 模块 ${module} 预加载失败:`, error);
    }
  }, [updatePreloadStatus]);

  // 智能预加载
  const smartPreload = useCallback(async (context = userContext) => {
    try {
      await dataPreloader.smartPreload(context);
      updatePreloadStatus();
    } catch (error) {
      console.error('[useDataPreloader] 智能预加载失败:', error);
    }
  }, [userContext, updatePreloadStatus]);

  // 清除预加载状态
  const clearPreloadStatus = useCallback(() => {
    dataPreloader.clearPreloadStatus();
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  // 获取特定任务的预加载状态
  const getTaskStatus = useCallback((module, method) => {
    return dataPreloader.getPreloadStatus(module, method);
  }, []);

  // 检查模块是否已预加载
  const isModulePreloaded = useCallback((module) => {
    const moduleConfig = dataPreloader.preloadConfig.modules[module];
    if (!moduleConfig) return false;
    
    return moduleConfig.methods.every(method => {
      const status = getTaskStatus(module, method);
      return status === 'success';
    });
  }, [getTaskStatus]);

  // 获取预加载进度
  const getPreloadProgress = useCallback(() => {
    const { total, success, error } = preloadStats;
    if (total === 0) return 0;
    
    const completed = success + error;
    return Math.round((completed / total) * 100);
  }, [preloadStats]);

  // 自动开始预加载
  useEffect(() => {
    if (autoStart) {
      startPreload();
    }
  }, [autoStart, startPreload]);

  // 定期更新状态
  useEffect(() => {
    intervalRef.current = setInterval(updatePreloadStatus, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updatePreloadStatus]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 初始状态更新
  useEffect(() => {
    updatePreloadStatus();
  }, [updatePreloadStatus]);

  return {
    // 状态
    preloadStatus,
    preloadStats,
    isPreloading,
    
    // 控制方法
    startPreload,
    preloadModule,
    smartPreload,
    clearPreloadStatus,
    
    // 查询方法
    getTaskStatus,
    isModulePreloaded,
    getPreloadProgress,
    
    // 工具方法
    updatePreloadStatus
  };
};

export default useDataPreloader;