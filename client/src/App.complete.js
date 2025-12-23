import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
import InventoryLayout from './components/inventory/InventoryLayout';
import SparePartsAlert from './components/inventory/SparePartsAlert';
import ExternalSpareParts from './components/inventory/ExternalSpareParts';
import SparePartsFlow from './components/inventory/SparePartsFlow';
import SimpleReports from './components/SimpleReports';
import SimpleProduction from './components/SimpleProduction';
import SimpleEquipment from './components/SimpleEquipment';
import SimpleQuality from './components/SimpleQuality';

const { Content } = Layout;

const SimpleDashboard = () => (
  <div style={{ padding: '24px' }}>
    <h1>MES 制造执行系统</h1>
    <p>欢迎使用MES系统！</p>
    <div style={{ marginTop: '20px' }}>
      <h3>系统功能模块：</h3>
      <ul>
        <li>✅ 监控面板 - 系统首页</li>
        <li>✅ 生产管理 - 生产计划和执行管理</li>
        <li>✅ 设备管理 - 设备维护和监控</li>
        <li>✅ 质量管理 - 质量检验和控制</li>
        <li>✅ 库存管理 - 备件管理和流水（新增功能）</li>
        <li>✅ 报表分析 - 数据报表和分析</li>
      </ul>
      <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
        <h4 style={{ color: '#0369a1', margin: '0 0 8px 0' }}>🎉 新增功能：库存管理</h4>
        <p style={{ margin: 0, color: '#0c4a6e' }}>
          点击左侧菜单"库存管理"可以体验新增的三个功能模块：备件寿命预警、库外备件管理、库外备件流水！
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <SimpleHeader />
        <Content style={{ margin: '16px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<SimpleDashboard />} />
            
            {/* 生产管理 - 所有子路由都指向同一个页面 */}
            <Route path="/production" element={<SimpleProduction />} />
            <Route path="/production/*" element={<SimpleProduction />} />
            
            {/* 设备管理 - 所有子路由都指向同一个页面 */}
            <Route path="/equipment" element={<SimpleEquipment />} />
            <Route path="/equipment/*" element={<SimpleEquipment />} />
            
            {/* 质量管理 - 所有子路由都指向同一个页面 */}
            <Route path="/quality" element={<SimpleQuality />} />
            <Route path="/quality/*" element={<SimpleQuality />} />
            
            {/* 库存管理路由 - 完整的二级菜单功能 */}
            <Route path="/inventory/*" element={<InventoryLayout />}>
              <Route index element={<Navigate to="spare-parts-alert" replace />} />
              <Route path="spare-parts-alert" element={<SparePartsAlert />} />
              <Route path="external-spare-parts" element={<ExternalSpareParts />} />
              <Route path="spare-parts-flow" element={<SparePartsFlow />} />
            </Route>
            
            <Route path="/reports" element={<SimpleReports />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
