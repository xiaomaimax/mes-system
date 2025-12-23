import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
import SimpleInventory from './components/SimpleInventory';
import SimpleReports from './components/SimpleReports';
import SimpleProduction from './components/SimpleProduction';
import SimpleProcess from './components/SimpleProcess';
import SimpleIntegrationEnhanced from './components/SimpleIntegrationEnhanced';
import SimpleEquipment from './components/SimpleEquipment';
import SimpleQuality from './components/SimpleQuality';
import SimplePersonnel from './components/SimplePersonnel';
import SimpleSettings from './components/SimpleSettings';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';

const { Content } = Layout;

function App() {
  const location = useLocation();
  
  // 检查用户是否已登录
  const isAuthenticated = () => {
    const token = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    return token && userInfo;
  };

  // 如果在登录页面，显示登录页面
  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  // 如果未登录且不在登录页面，重定向到登录页面
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 已登录用户显示主应用界面
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <SimpleHeader />
        <Content style={{ margin: '16px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<HomePage />} />
            
            {/* 工艺管理 - 所有子路由都指向同一个页面 */}
            <Route path="/process" element={<SimpleProcess />} />
            <Route path="/process/*" element={<SimpleProcess />} />
            
            {/* 生产管理 - 所有子路由都指向同一个页面 */}
            <Route path="/production" element={<SimpleProduction />} />
            <Route path="/production/*" element={<SimpleProduction />} />
            
            {/* 设备管理 - 所有子路由都指向同一个页面 */}
            <Route path="/equipment" element={<SimpleEquipment />} />
            <Route path="/equipment/*" element={<SimpleEquipment />} />
            
            {/* 质量管理 - 所有子路由都指向同一个页面 */}
            <Route path="/quality" element={<SimpleQuality />} />
            <Route path="/quality/*" element={<SimpleQuality />} />
            
            {/* 库存管理 - 所有子路由都指向同一个页面 */}
            <Route path="/inventory" element={<SimpleInventory />} />
            <Route path="/inventory/*" element={<SimpleInventory />} />
            
            {/* 人员管理 - 所有子路由都指向同一个页面 */}
            <Route path="/personnel" element={<SimplePersonnel />} />
            <Route path="/personnel/*" element={<SimplePersonnel />} />
            
            {/* 系统集成 - 所有子路由都指向同一个页面 */}
            <Route path="/integration" element={<SimpleIntegrationEnhanced />} />
            <Route path="/integration/*" element={<SimpleIntegrationEnhanced />} />
            
            {/* 系统设置 - 所有子路由都指向同一个页面 */}
            <Route path="/settings" element={<SimpleSettings />} />
            <Route path="/settings/*" element={<SimpleSettings />} />
            
            <Route path="/reports" element={<SimpleReports />} />
            
            {/* 登录页面路由 */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
