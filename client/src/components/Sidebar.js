import { useState } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  LineChartOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  BarChartOutlined,
  NodeIndexOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前用户信息
  const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return {
      role: '超级管理员',
      department: '信息部',
      username: 'admin'
    };
  };

  const currentUser = getCurrentUser();

  // 定义角色权限配置
  const rolePermissions = {
    'admin': {
      // 系统管理员可以访问所有模块
      allowedMenus: [
        '/dashboard', '/process', '/production', '/scheduling', '/equipment', 
        '/quality', '/inventory', '/personnel', '/integration', 
        '/reports', '/settings'
      ]
    },
    '超级管理员': {
      // 系统管理员可以访问所有模块
      allowedMenus: [
        '/dashboard', '/process', '/production', '/scheduling', '/equipment', 
        '/quality', '/inventory', '/personnel', '/integration', 
        '/reports', '/settings'
      ]
    },
    'manager': {
      // 部门管理员根据部门不同有不同权限
      生产部: ['/dashboard', '/production', '/scheduling', '/equipment', '/inventory', '/reports'],
      质量部: ['/dashboard', '/quality', '/process', '/reports'],
      技术部: ['/dashboard', '/process', '/equipment', '/integration', '/reports'],
      信息部: ['/dashboard', '/integration', '/settings', '/reports']
    },
    '部门管理员': {
      // 部门管理员根据部门不同有不同权限
      生产部: ['/dashboard', '/production', '/scheduling', '/equipment', '/inventory', '/reports'],
      质量部: ['/dashboard', '/quality', '/process', '/reports'],
      技术部: ['/dashboard', '/process', '/equipment', '/integration', '/reports'],
      信息部: ['/dashboard', '/integration', '/settings', '/reports']
    },
    'operator': {
      // 普通用户权限最小，只能访问本部门相关模块
      生产部: ['/dashboard', '/production', '/scheduling', '/reports'],
      质量部: ['/dashboard', '/quality', '/reports'],
      技术部: ['/dashboard', '/process', '/reports'],
      信息部: ['/dashboard', '/reports']
    },
    '普通用户': {
      // 普通用户权限最小，只能访问本部门相关模块
      生产部: ['/dashboard', '/production', '/scheduling', '/reports'],
      质量部: ['/dashboard', '/quality', '/reports'],
      技术部: ['/dashboard', '/process', '/reports'],
      信息部: ['/dashboard', '/reports']
    },
    'quality_inspector': {
      // 质量检验员有质量相关的权限
      allowedMenus: ['/dashboard', '/quality', '/process', '/reports']
    },
    '技术管理员': {
      // 技术管理员有技术相关的全部权限
      allowedMenus: ['/dashboard', '/process', '/equipment', '/integration', '/reports']
    }
  };

  // 获取用户可访问的菜单
  const getUserAllowedMenus = () => {
    const { role, department } = currentUser;
    
    // 检查是否是管理员角色
    if (role === 'admin' || role === '超级管理员') {
      return rolePermissions['admin'].allowedMenus;
    }
    
    // 检查是否是质量检验员
    if (role === 'quality_inspector') {
      return rolePermissions['quality_inspector'].allowedMenus;
    }
    
    // 检查是否是部门管理员
    if ((role === 'manager' || role === '部门管理员') && rolePermissions['manager'][department]) {
      return rolePermissions['manager'][department];
    }
    
    // 检查是否是普通用户
    if ((role === 'operator' || role === '普通用户') && rolePermissions['operator'][department]) {
      return rolePermissions['operator'][department];
    }
    
    // 默认只能访问首页和报表
    return ['/dashboard', '/reports'];
  };

  // 所有菜单项定义
  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页'
    },
    {
      key: '/process',
      icon: <NodeIndexOutlined />,
      label: '工艺管理'
    },
    {
      key: '/scheduling',
      icon: <CalendarOutlined />,
      label: '辅助排程'
    },
    {
      key: '/production',
      icon: <LineChartOutlined />,
      label: '生产管理'
    },
    {
      key: '/equipment',
      icon: <ToolOutlined />,
      label: '设备管理'
    },
    {
      key: '/quality',
      icon: <CheckCircleOutlined />,
      label: '质量管理'
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: '库存管理'
    },
    {
      key: '/personnel',
      icon: <UserOutlined />,
      label: '人员管理'
    },
    {
      key: '/integration',
      icon: <LinkOutlined />,
      label: '系统集成'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '报表分析'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  // 根据用户权限过滤菜单项
  const allowedMenus = getUserAllowedMenus();
  const menuItems = allMenuItems.filter(item => allowedMenus.includes(item.key));

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/process')) {
      return ['/process'];
    }
    if (pathname.startsWith('/production')) {
      return ['/production'];
    }
    if (pathname.startsWith('/scheduling')) {
      return ['/scheduling'];
    }
    if (pathname.startsWith('/equipment')) {
      return ['/equipment'];
    }
    if (pathname.startsWith('/quality')) {
      return ['/quality'];
    }
    if (pathname.startsWith('/inventory')) {
      return ['/inventory'];
    }
    if (pathname.startsWith('/personnel')) {
      return ['/personnel'];
    }
    if (pathname.startsWith('/integration')) {
      return ['/integration'];
    }
    if (pathname.startsWith('/settings')) {
      return ['/settings'];
    }
    return [pathname];
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      width={220}
      collapsedWidth={80}
      style={{
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        zIndex: 100,
        position: 'relative',
        height: '100vh',
        overflow: 'auto',
        flexShrink: 0
      }}
    >
      {/* Logo区域 */}
      <div style={{
        height: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: collapsed ? '14px' : '18px',
        fontWeight: '600',
        letterSpacing: '1px',
        borderBottom: '1px solid #303030',
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        transition: 'all 0.3s ease',
        padding: '8px'
      }}>
        <div style={{ fontSize: collapsed ? '16px' : '20px', marginBottom: collapsed ? '0' : '4px' }}>
          {collapsed ? 'MES' : 'MES 制造执行系统'}
        </div>
        {!collapsed && (
          <div style={{ 
            fontSize: '11px', 
            opacity: 0.8, 
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            {currentUser.department} - {currentUser.role}
          </div>
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          borderRight: 0,
          fontSize: '15px',
          fontWeight: '500'
        }}
        className="custom-sidebar-menu"
      />
      
      {/* 自定义样式 */}
      <style jsx global>{`
        .custom-sidebar-menu .ant-menu-item {
          height: 48px !important;
          line-height: 48px !important;
          margin: 4px 8px !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .custom-sidebar-menu .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          transform: translateX(2px);
        }
        
        .custom-sidebar-menu .ant-menu-item-selected {
          background-color: #1890ff !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3) !important;
        }
        
        .custom-sidebar-menu .ant-menu-item-selected:after {
          display: none !important;
        }
        
        .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          font-size: 16px !important;
          margin-right: 12px !important;
        }
        
        .custom-sidebar-menu .ant-menu-item .ant-menu-title-content {
          font-size: 15px !important;
          font-weight: 500 !important;
          letter-spacing: 0.5px !important;
        }
        
        /* 折叠状态下的样式 */
        .ant-layout-sider-collapsed .custom-sidebar-menu .ant-menu-item {
          padding: 0 20px !important;
        }
        
        .ant-layout-sider-collapsed .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          font-size: 18px !important;
          margin-right: 0 !important;
        }
        
        /* 滚动条样式 */
        .ant-layout-sider::-webkit-scrollbar {
          width: 6px;
        }
        
        .ant-layout-sider::-webkit-scrollbar-track {
          background: #2f2f2f;
        }
        
        .ant-layout-sider::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 3px;
        }
        
        .ant-layout-sider::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </Sider>
  );
};

Sidebar.propTypes = {
  // Sidebar是独立组件，不接收props
};

Sidebar.defaultProps = {
};

export default Sidebar;