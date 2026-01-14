import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';


// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return safeMessage.success(content, duration);
      } else {
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
        return safeMessage.error(content, duration);
      } else {
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
        return safeMessage.warning(content, duration);
      } else {
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
        return safeMessage.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
/**
 * Custom hook for managing quality inspection data
 * 改进的错误处理和重试机制
 */
export const useQualityData = (apiFunction, transformer, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 使用 useRef 来存储 API 函数，避免依赖项变化导致的无限循环
  const apiFunctionRef = useRef(apiFunction);
  const transformerRef = useRef(transformer);

  // 当 API 函数或转换器改变时，更新 ref
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
    transformerRef.current = transformer;
  }, [apiFunction, transformer]);

  const loadData = useCallback(async (pageNum = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // 检查Token是否存在
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('未找到认证Token，请重新登录');
      }

      // 检查apiFunction是否存在
      if (!apiFunctionRef.current || typeof apiFunctionRef.current !== 'function') {
        throw new Error('API函数未定义或不是有效的函数');
      }

      const response = await apiFunctionRef.current({
        page: pageNum,
        limit: pageSize
      });
      
      // 检查响应状态
      if (!response) {
        throw new Error('服务器无响应');
      }

      // 只在真正的认证失败时才触发 authFailed 事件
      if (response.code === 401 || response.code === 403) {
        throw new Error('认证失败，请重新登录');
      }

      if (response.success === false) {
        throw new Error(response.message || '数据加载失败');
      }

      if (response.code !== 200 && response.code !== undefined) {
        throw new Error(response.message || '数据加载失败');
      }

      // 安全地处理数据
      const responseData = response.data || [];
      
      // 验证数据是否为数组
      if (!Array.isArray(responseData)) {
        console.warn('API返回的数据不是数组:', responseData);
        setData([]);
        return;
      }

      // 转换数据
      let formattedData = [];
      try {
        formattedData = transformerRef.current(responseData);
      } catch (transformError) {
        console.error('数据转换失败:', transformError);
        console.error('转换错误堆栈:', transformError.stack);
        safeMessage.error('数据格式异常，请联系管理员');
        setData([]);
        return;
      }

      setData(formattedData);
      
      // 更新分页信息
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          pageSize: pageSize,
          total: response.pagination.total || 0
        }));
      } else {
        // 即使没有分页信息，也要更新当前页码
        setPagination(prev => ({
          ...prev,
          current: pageNum,
          pageSize: pageSize
        }));
      }
      
      // 只在有数据时显示成功消息
      if (formattedData.length > 0) {
        safeMessage.success(`成功加载 ${formattedData.length} 条检验数据`);
      }
    } catch (error) {
      console.error('加载检验数据失败:', error);
      console.error('错误堆栈:', error.stack);
      setError(error.message);
      setData([]);
      
      // 根据错误类型提供更具体的错误信息
      // 只在真正的认证失败时才触发 authFailed 事件
      if (error.message === '认证失败，请重新登录' || error.message === '未找到认证Token，请重新登录') {
        safeMessage.error('登录已过期，请重新登录');
        // 触发重新登录
        window.dispatchEvent(new CustomEvent('authFailed'));
      } else if (error.message.includes('网络')) {
        safeMessage.error('网络连接失败，请检查网络状态');
      } else if (error.message.includes('无响应')) {
        safeMessage.error('服务器无响应，请检查后端服务是否正常运行');
      } else {
        safeMessage.error(error.message || '加载数据失败，请检查后端服务');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时加载数据（仅一次）
  useEffect(() => {
    loadData(1, 10);
  }, []);

  const handlePaginationChange = (page, pageSize) => {
    loadData(page, pageSize);
  };

  return {
    data,
    loading,
    error,
    pagination,
    loadData,
    handlePaginationChange
  };
};
