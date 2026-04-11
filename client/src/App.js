import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
import HomePage from './components/HomePage';
import SimpleProduction from './components/SimpleProduction';
import SimpleScheduling from './components/SimpleScheduling';
import SimpleProcess from './components/SimpleProcess';
import SimpleEquipment from './components/SimpleEquipment';
import SimpleQuality from './components/SimpleQuality';
import SimpleInventory from './components/SimpleInventory';
import SimplePersonnel from './components/SimplePersonnel';
import SimpleIntegrationEnhanced from './components/SimpleIntegrationEnhanced';
import SimpleSettings from './components/SimpleSettings';
import SystemDocs from './components/SystemDocs';
import SimpleReports from './components/SimpleReports';
import OEEDashboard from './pages/oee/OEEDashboard';
import AndonDashboard from './pages/andon/AndonDashboard';
import TraceabilityDashboard from './pages/traceability/TraceabilityDashboard';
import RoleManagement from './components/RoleManagement';
import UserRoleManagement from './components/UserRoleManagement';
import Dashboard from './components/Dashboard';


// 懒加载组件（P3-2 性能优化）
const MonitoringDashboard = React.lazy(() => import('./components/MonitoringDashboard'));
const { Content } = Layout;

/**
 * 主应用组件 - 带完整功能
 * 确保认证状态改变时立即重新渲染，显示正确的页面
 */
function MainApp() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // 监听认证状态变化，当登出时自动重定向到登录页面
  useEffect(() => {
    // 只在初始化完成且认证状态改变时才导航
    if (!isLoading) {
      const currentPath = window.location.pathname;
      // 如果在登录页且已认证，导航到 dashboard
      if (currentPath === '/login' && isAuthenticated) {
        navigate('/dashboard', { replace: true });
      }
      // 如果在非登录页且未认证，导航到登录页
      if (currentPath !== '/login' && !isAuthenticated && !localStorage.getItem('token')) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // 简化加载状态 - 只在初始化时显示，不要在登录后显示
  if (isLoading && !isAuthenticated && !localStorage.getItem('token')) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f2f5'
      }}>
        <div style={{
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#1890ff', marginBottom: '16px' }}>
            MES 制造执行系统
          </h1>
          <p style={{ color: '#666' }}>
            正在初始化...
          </p>
        </div>
      </div>
    );
  }
  
  // 未登录显示登录页面
  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <LoginPage />;
  }
  
  // 已登录或有有效 token 显示主应用
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <Sidebar />
      <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SimpleHeader />
        <Content style={{ 
          margin: '16px', 
          background: '#fff',
          flex: 1,
          overflow: 'auto'
        }}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">加载中...</div></div>}>
      <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/monitoring" element={<MonitoringDashboard />} />
            
            {/* 工艺管理 */}
            <Route path="/process" element={<SimpleProcess />} />
            <Route path="/process/*" element={<SimpleProcess />} />
            
            {/* 辅助排程 */}
            <Route path="/scheduling" element={<SimpleScheduling />} />
            <Route path="/scheduling/*" element={<SimpleScheduling />} />
            
            {/* 生产管理 */}
            <Route path="/production" element={<SimpleProduction />} />
            <Route path="/production/*" element={<SimpleProduction />} />
            
            {/* 设备管理 */}
            <Route path="/equipment" element={<SimpleEquipment />} />
            <Route path="/equipment/*" element={<SimpleEquipment />} />
            
            {/* 质量管理 */}
            <Route path="/quality" element={<SimpleQuality />} />
            <Route path="/quality/*" element={<SimpleQuality />} />
            
            {/* 库存管理 */}
            <Route path="/inventory" element={<SimpleInventory />} />
            <Route path="/inventory/*" element={<SimpleInventory />} />
            
            {/* 人员管理 */}
            <Route path="/personnel" element={<SimplePersonnel />} />
            <Route path="/personnel/*" element={<SimplePersonnel />} />
            
            {/* 系统集成 */}
            <Route path="/integration" element={<SimpleIntegrationEnhanced />} />
            <Route path="/integration/*" element={<SimpleIntegrationEnhanced />} />
            
            {/* 系统设置 */}
            <Route path="/settings" element={<SimpleSettings />} />
            <Route path="/docs" element={<SystemDocs />} />
            <Route path="/settings/*" element={<SimpleSettings />} />
            {/* P3 权限管理 */}
            <Route path="/system/roles" element={<RoleManagement />} />
            <Route path="/system/user-roles" element={<UserRoleManagement />} />

            
            {/* 报表管理 */}
            <Route path="/reports" element={<SimpleReports />} />
            <Route path="/oee" element={<OEEDashboard />} />
            <Route path="/andon" element={<AndonDashboard />} />
            <Route path="/traceability" element={<TraceabilityDashboard />} />

            {/* 数据仪表盘 */}
            <Route path="/dashboard-new" element={<Dashboard />} />

            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
    </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}

/**
 * 根应用组件
 */
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
