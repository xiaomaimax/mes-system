import { useEffect } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Token管理组件 - 处理认证失败和Token过期
 */
const TokenManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthFailed = (event) => {
      console.warn('认证失败事件:', event.detail);
      
      Modal.confirm({
        title: '登录已过期',
        content: '您的登录状态已过期，请重新登录以继续使用系统。',
        okText: '重新登录',
        cancelText: '取消',
        onOk: () => {
          // 清除本地存储的用户信息
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 跳转到登录页面
          navigate('/login');
        },
        onCancel: () => {
          message.info('请重新登录以获取完整功能');
        }
      });
    };

    // 监听认证失败事件
    window.addEventListener('authFailed', handleAuthFailed);

    return () => {
      window.removeEventListener('authFailed', handleAuthFailed);
    };
  }, [navigate]);

  return null; // 这是一个逻辑组件，不渲染任何UI
};

export default TokenManager;