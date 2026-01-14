import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Avatar, Space, Typography, Dropdown, Button, Modal, message } from 'antd';
import { UserOutlined, LogoutOutlined, SwapOutlined, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HelpPanel from './HelpPanel';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return message.success(content, duration);
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
        return message.error(content, duration);
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
        return message.warning(content, duration);
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
        return message.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};

const { Header: AntHeader } = Layout;
const { Text } = Typography;

/**
 * SimpleHeader Component
 * 
 * Enhanced header component that uses the improved AuthContext.
 * Provides user information display and logout functionality.
 * 
 * Requirements: 1.1, 1.2, 4.4, 5.3
 */
const SimpleHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 获取当前用户信息
  const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return {
      name: '系统管理员',
      username: 'admin',
      email: 'admin@mes-system.com',
      department: '信息部',
      role: '超级管理员'
    };
  };

  const currentUser = getCurrentUser();

  /**
   * Handle switching user
   * Requirement 1.1: Clear all user data and reset component states on logout
   */
  const handleSwitchUser = async () => {
    try {
      // Use enhanced logout from AuthContext
      await logout();
      safeMessage.success('已切换用户，请重新登录');
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('[SimpleHeader] Error switching user:', error);
      safeMessage.error('切换用户失败');
    }
  };

  /**
   * Handle logout
   * Requirement 1.1: Clear all user data and reset component states on logout
   * Requirement 2.4: Complete cleanup operations during logout
   */
  const handleLogout = async () => {
    try {
      // 立即清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 调用 logout 方法（会清除状态）
      logout();
      
      // 显示成功消息
      safeMessage.success('已安全退出');
      
      // 使用硬重定向确保页面完全重新加载
      // 这样可以确保所有状态都被重置
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('[SimpleHeader] Error logging out:', error);
      safeMessage.error('退出登录失败');
      // 即使出错也尝试导航到登录页面
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0', minWidth: '200px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{currentUser.name}</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {currentUser.department} - {currentUser.role}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
            {currentUser.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            登录时间: {currentUser.loginTime ? new Date(currentUser.loginTime).toLocaleString() : '刚刚'}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'switch',
      label: (
        <div onClick={(e) => {
          e.stopPropagation();
          handleSwitchUser();
        }}>
          <SwapOutlined style={{ marginRight: '8px' }} />
          切换用户
        </div>
      )
    },
    {
      key: 'logout',
      label: (
        <div onClick={(e) => {
          e.stopPropagation();
          handleLogout();
        }}>
          <LogoutOutlined style={{ marginRight: '8px' }} />
          退出登录
        </div>
      )
    }
  ];
  
  return (
    <AntHeader style={{
      background: '#fff',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div>
        <Text type="secondary">
          MES 制造执行系统
        </Text>
      </div>
      
      <Space>
        <HelpPanel moduleKey="dashboard" />
        <Button 
          type="text" 
          danger 
          onClick={handleLogout}
          style={{ height: 'auto', padding: '4px 8px' }}
        >
          <LogoutOutlined style={{ marginRight: '4px' }} />
          退出登录
        </Button>
      </Space>
    </AntHeader>
  );
};

SimpleHeader.propTypes = {
  // SimpleHeader是独立组件，不接收props
};

SimpleHeader.defaultProps = {
};

export default SimpleHeader;