/**
 * useUIFeedback - UI反馈状态管理Hook
 * 
 * 功能：
 * - 管理加载、进度、错误等UI状态
 * - 提供统一的UI反馈接口
 * - 支持自动状态转换和清理
 * - 支持操作历史记录和撤销/重做
 * - 支持性能指标跟踪
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return message.success(content, duration);
      } else if (message && message.config && typeof message.config === 'function') {
        // Ant Design 5.x 的新API方式
        message.config({ top: 100 });
        return message.success(content, duration);
      } else {
        console.warn('message.success 不可用，使用console输出:', content);
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return message.error(content, duration);
      } else if (message && message.config && typeof message.config === 'function') {
        message.config({ top: 100 });
        return message.error(content, duration);
      } else {
        console.warn('message.error 不可用，使用console输出:', content);
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return message.warning(content, duration);
      } else if (message && message.config && typeof message.config === 'function') {
        message.config({ top: 100 });
        return message.warning(content, duration);
      } else {
        console.warn('message.warning 不可用，使用console输出:', content);
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return message.loading(content, duration);
      } else if (message && message.config && typeof message.config === 'function') {
        message.config({ top: 100 });
        return message.loading(content, duration);
      } else {
        console.warn('message.loading 不可用，使用console输出:', content);
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  },
  destroy: () => {
    try {
      if (message && typeof message.destroy === 'function') {
        return message.destroy();
      }
    } catch (error) {
      console.warn('调用message.destroy时出错:', error);
    }
  }
};

/**
 * UI反馈状态枚举
 */
export const UI_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SAVING: 'saving',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

/**
 * 操作类型枚举
 */
export const OPERATION_TYPES = {
  LOAD: 'load',
  SAVE: 'save',
  UPDATE: 'update',
  DELETE: 'delete',
  SYNC: 'sync',
  BATCH: 'batch',
  EXPORT: 'export',
  IMPORT: 'import'
};

/**
 * UI反馈Hook
 */
const useUIFeedback = (options = {}) => {
  const {
    autoHideSuccess = true,
    autoHideError = false,
    successDuration = 3000,
    errorDuration = 5000,
    showMessages = true,
    trackProgress = false,
    trackDataSource = false,
    trackHistory = true,
    maxHistorySize = 50,
    trackPerformance = true
  } = options;
  
  // 状态管理
  const [state, setState] = useState(UI_STATES.IDLE);
  const [operation, setOperation] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('local');
  const [syncStatus, setSyncStatus] = useState(null);
  
  // 操作历史记录
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 性能指标
  const [performanceMetrics, setPerformanceMetrics] = useState({
    lastOperationTime: 0,
    averageOperationTime: 0,
    operationCount: 0
  });
  
  // 定时器引用
  const timeoutRef = useRef(null);
  const progressRef = useRef(null);
  const operationStartTimeRef = useRef(null);
  
  // 清理定时器
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);
  
  // 记录操作到历史
  const recordOperation = useCallback((operationData) => {
    if (!trackHistory) return;
    
    setOperationHistory(prev => {
      // 如果当前不在历史末尾，删除后续的历史记录
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // 添加新操作
      newHistory.push({
        ...operationData,
        timestamp: new Date().toISOString(),
        id: `op_${Date.now()}_${Math.random()}`
      });
      
      // 限制历史记录大小
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => prev + 1);
  }, [trackHistory, historyIndex, maxHistorySize]);
  
  // 计算性能指标
  const updatePerformanceMetrics = useCallback((operationTime) => {
    if (!trackPerformance) return;
    
    setPerformanceMetrics(prev => {
      const newCount = prev.operationCount + 1;
      const newAverage = (prev.averageOperationTime * prev.operationCount + operationTime) / newCount;
      
      return {
        lastOperationTime: operationTime,
        averageOperationTime: Math.round(newAverage),
        operationCount: newCount
      };
    });
  }, [trackPerformance]);
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);
  
  // 重置状态
  const reset = useCallback(() => {
    clearTimers();
    setState(UI_STATES.IDLE);
    setOperation(null);
    setProgress(0);
    setMessage('');
    setDetail('');
    setError(null);
    setSyncStatus(null);
  }, [clearTimers]);
  
  // 设置加载状态
  const setLoading = useCallback((operationType = OPERATION_TYPES.LOAD, msg = '', src = 'local') => {
    clearTimers();
    setState(UI_STATES.LOADING);
    setOperation(operationType);
    setMessage(msg);
    setProgress(0);
    setError(null);
    
    if (trackDataSource) {
      setDataSource(src);
      setSyncStatus('pending');
    }
    
    if (showMessages && msg) {
      safeMessage.loading(msg, 0);
    }
  }, [clearTimers, showMessages, trackDataSource]);
  
  // 设置保存状态
  const setSaving = useCallback((msg = '保存中...', src = 'local') => {
    clearTimers();
    setState(UI_STATES.SAVING);
    setOperation(OPERATION_TYPES.SAVE);
    setMessage(msg);
    setProgress(0);
    setError(null);
    
    if (trackDataSource) {
      setDataSource(src);
      setSyncStatus('syncing');
    }
    
    if (showMessages) {
      safeMessage.loading(msg, 0);
    }
  }, [clearTimers, showMessages, trackDataSource]);
  
  // 设置同步状态
  const setSyncing = useCallback((msg = '同步中...') => {
    clearTimers();
    setState(UI_STATES.SYNCING);
    setOperation(OPERATION_TYPES.SYNC);
    setMessage(msg);
    setProgress(0);
    setError(null);
    
    if (trackDataSource) {
      setSyncStatus('syncing');
    }
    
    if (showMessages) {
      safeMessage.loading(msg, 0);
    }
  }, [clearTimers, showMessages, trackDataSource]);
  
  // 更新进度
  const updateProgress = useCallback((newProgress, newDetail = '') => {
    if (trackProgress) {
      setProgress(Math.min(100, Math.max(0, newProgress)));
      if (newDetail) {
        setDetail(newDetail);
      }
    }
  }, [trackProgress]);
  
  // 模拟进度更新
  const simulateProgress = useCallback((duration = 2000, steps = 20) => {
    if (!trackProgress) return;
    
    clearTimers();
    
    let currentProgress = 0;
    const increment = 100 / steps;
    const interval = duration / steps;
    
    progressRef.current = setInterval(() => {
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(progressRef.current);
        progressRef.current = null;
      } else {
        setProgress(currentProgress);
      }
    }, interval);
  }, [trackProgress, clearTimers]);
  
  // 设置成功状态
  const setSuccess = useCallback((msg = '操作成功', src = null) => {
    clearTimers();
    setState(UI_STATES.SUCCESS);
    setMessage(msg);
    setProgress(100);
    setError(null);
    
    if (trackDataSource && src) {
      setDataSource(src);
      setSyncStatus('synced');
    }
    
    if (showMessages) {
      // 安全地销毁之前的消息
      try {
        if (message.destroy && typeof message.destroy === 'function') {
          message.destroy();
        }
      } catch (error) {
        console.warn('销毁消息时出错:', error);
      }
      safeMessage.success(msg);
    }
    
    if (autoHideSuccess) {
      timeoutRef.current = setTimeout(() => {
        reset();
      }, successDuration);
    }
  }, [clearTimers, showMessages, autoHideSuccess, successDuration, reset, trackDataSource]);
  
  // 设置错误状态
  const setErrorState = useCallback((err, msg = '操作失败') => {
    clearTimers();
    setState(UI_STATES.ERROR);
    setMessage(msg);
    setError(err);
    setProgress(0);
    
    if (trackDataSource) {
      setSyncStatus('error');
    }
    
    if (showMessages) {
      // 安全地销毁之前的消息
      try {
        if (message.destroy && typeof message.destroy === 'function') {
          message.destroy();
        }
      } catch (error) {
        console.warn('销毁消息时出错:', error);
      }
      const errorMsg = err?.message || err || msg;
      safeMessage.error(errorMsg);
    }
    
    if (autoHideError) {
      timeoutRef.current = setTimeout(() => {
        reset();
      }, errorDuration);
    }
  }, [clearTimers, showMessages, autoHideError, errorDuration, reset, trackDataSource]);
  
  // 设置警告状态
  const setWarning = useCallback((msg = '操作警告', src = null) => {
    clearTimers();
    setState(UI_STATES.WARNING);
    setMessage(msg);
    setError(null);
    
    if (trackDataSource && src) {
      setDataSource(src);
      setSyncStatus('warning');
    }
    
    if (showMessages) {
      // 安全地销毁之前的消息
      try {
        if (message.destroy && typeof message.destroy === 'function') {
          message.destroy();
        }
      } catch (error) {
        console.warn('销毁消息时出错:', error);
      }
      safeMessage.warning(msg);
    }
    
    // 警告状态自动重置
    timeoutRef.current = setTimeout(() => {
      reset();
    }, 3000);
  }, [clearTimers, showMessages, reset, trackDataSource]);
  
  // 执行异步操作的包装器
  const executeAsync = useCallback(async (
    asyncFn, 
    operationType = OPERATION_TYPES.LOAD,
    loadingMsg = '',
    successMsg = '',
    errorMsg = ''
  ) => {
    try {
      // 记录操作开始时间
      operationStartTimeRef.current = Date.now();
      
      // 设置加载状态
      if (operationType === OPERATION_TYPES.SAVE) {
        setSaving(loadingMsg);
      } else if (operationType === OPERATION_TYPES.SYNC) {
        setSyncing(loadingMsg);
      } else if (operationType === OPERATION_TYPES.DELETE) {
        setSaving(loadingMsg);
      } else {
        setLoading(operationType, loadingMsg);
      }
      
      // 执行异步操作
      const result = await asyncFn();
      
      // 计算操作耗时
      const operationTime = Date.now() - operationStartTimeRef.current;
      updatePerformanceMetrics(operationTime);
      
      // 记录成功操作
      recordOperation({
        type: operationType,
        status: 'success',
        message: successMsg,
        duration: operationTime,
        result
      });
      
      // 设置成功状态
      setSuccess(successMsg || '操作成功');
      
      return result;
    } catch (err) {
      // 计算操作耗时
      const operationTime = Date.now() - operationStartTimeRef.current;
      updatePerformanceMetrics(operationTime);
      
      // 记录失败操作
      recordOperation({
        type: operationType,
        status: 'error',
        message: errorMsg,
        duration: operationTime,
        error: err.message
      });
      
      // 设置错误状态
      setErrorState(err, errorMsg || '操作失败');
      throw err;
    }
  }, [setLoading, setSaving, setSyncing, setSuccess, setErrorState, updatePerformanceMetrics, recordOperation]);
  
  // 批量操作包装器
  const executeBatch = useCallback(async (
    items,
    batchFn,
    options = {}
  ) => {
    const {
      batchSize = 10,
      loadingMsg = '批量处理中...',
      successMsg = '批量处理完成',
      errorMsg = '批量处理失败',
      onProgress = null
    } = options;
    
    try {
      setState(UI_STATES.LOADING);
      setOperation(OPERATION_TYPES.BATCH);
      setMessage(loadingMsg);
      setProgress(0);
      setError(null);
      
      if (showMessages) {
        safeMessage.loading(loadingMsg, 0);
      }
      
      const results = [];
      const total = items.length;
      
      for (let i = 0; i < total; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await batchFn(batch, i);
        results.push(...batchResults);
        
        const progress = Math.min(100, ((i + batch.length) / total) * 100);
        updateProgress(progress, `处理中: ${i + batch.length}/${total}`);
        
        if (onProgress) {
          onProgress(progress, i + batch.length, total);
        }
      }
      
      setSuccess(successMsg);
      return results;
      
    } catch (err) {
      setErrorState(err, errorMsg);
      throw err;
    }
  }, [showMessages, updateProgress, setSuccess, setErrorState]);
  
  // 获取当前状态信息
  const getStateInfo = useCallback(() => {
    return {
      state,
      operation,
      progress,
      message,
      detail,
      error,
      dataSource,
      syncStatus,
      isLoading: state === UI_STATES.LOADING,
      isSaving: state === UI_STATES.SAVING,
      isSyncing: state === UI_STATES.SYNCING,
      isSuccess: state === UI_STATES.SUCCESS,
      isError: state === UI_STATES.ERROR,
      isWarning: state === UI_STATES.WARNING,
      isIdle: state === UI_STATES.IDLE,
      isBusy: [UI_STATES.LOADING, UI_STATES.SAVING, UI_STATES.SYNCING].includes(state)
    };
  }, [state, operation, progress, message, detail, error, dataSource, syncStatus]);
  
  // 获取操作历史
  const getOperationHistory = useCallback(() => {
    return operationHistory;
  }, [operationHistory]);
  
  // 获取性能指标
  const getPerformanceMetrics = useCallback(() => {
    return performanceMetrics;
  }, [performanceMetrics]);
  
  // 清除操作历史
  const clearHistory = useCallback(() => {
    setOperationHistory([]);
    setHistoryIndex(-1);
  }, []);
  
  return {
    // 状态信息
    ...getStateInfo(),
    
    // 状态设置方法
    setLoading,
    setSaving,
    setSyncing,
    setSuccess,
    setError: setErrorState,
    setWarning,
    reset,
    
    // 进度管理
    updateProgress,
    simulateProgress,
    
    // 异步操作包装器
    executeAsync,
    executeBatch,
    
    // 操作历史管理
    getOperationHistory,
    clearHistory,
    
    // 性能指标
    getPerformanceMetrics,
    
    // 工具方法
    getStateInfo
  };
};

export default useUIFeedback;