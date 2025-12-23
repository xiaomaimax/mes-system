import React from 'react';
import { Layout, Avatar, Space, Typography, Dropdown, Button, Modal, message } from 'antd';
import { UserOutlined, LogoutOutlined, SwapOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const SimpleHeader = () => {
  const navigate = useNavigate();

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

  // 处理切换用户
  const handleSwitchUser = () => {
    Modal.confirm({
      title: '切换用户',
      content: '确定要切换到其他用户账号吗？当前会话将被清除。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 清除用户信息
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        message.success('已切换用户，请重新登录');
        // 跳转到登录页面
        navigate('/login');
      }
    });
  };

  // 处理退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        // 清除用户信息
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        message.success('已安全退出');
        // 跳转到登录页面
        navigate('/login');
      }
    });
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
      label: '切换用户',
      icon: <SwapOutlined />,
      onClick: handleSwitchUser
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout
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
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{currentUser.name}</span>
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default SimpleHeader;