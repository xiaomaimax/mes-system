import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
// 库存管理子页面
import InventoryLayout from './components/inventory/InventoryLayout';
import SparePartsAlert from './components/inventory/SparePartsAlert';
import ExternalSpareParts from './components/inventory/ExternalSpareParts';
import SparePartsFlow from './components/inventory/SparePartsFlow';

const { Content } = Layout;

// 简单的Dashboard组件
const SimpleDashboard = () => (
  <div style={{ padding: '24px' }}>
    <h1>MES 制造执行系统</h1>
    <p>欢迎使用MES系统！</p>
    <div style={{ marginTop: '20px' }}>
      <h3>新增功能：库存管理</h3>
      <p>请点击左侧菜单中的"库存管理"查看新功能：</p>
      <ul>
        <li>备件寿命预警</li>
        <li>库外备件管理</li>
        <li>库外备件流水</li>
      </ul>
    </div>
  </div>
);

// 简单的AuthProvider
const SimpleAuthProvider = ({ children }) => {
  return children;
};

function App() {
  return (
    <SimpleAuthProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <SimpleHeader />
          <Content style={{ margin: '16px', background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<SimpleDashboard />} />
              
              {/* 库存管理路由 */}
              <Route path="/inventory/*" element={<InventoryLayout />}>
                <Route index element={<Navigate to="spare-parts-alert" replace />} />
                <Route path="spare-parts-alert" element={<SparePartsAlert />} />
                <Route path="external-spare-parts" element={<ExternalSpareParts />} />
                <Route path="spare-parts-flow" element={<SparePartsFlow />} />
              </Route>
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </SimpleAuthProvider>
  );
}

export default App;