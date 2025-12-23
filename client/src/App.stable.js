import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
import SimpleReports from './components/SimpleReports';
// 生产管理子页面
import ProductionLayout from './components/production/ProductionLayout';
import WorkshopPlan from './components/production/WorkshopPlan';
import ProductionTasks from './components/production/ProductionTasks';
import ProductionExecution from './components/production/ProductionExecution';
import WorkReport from './components/production/WorkReport';
import DailyReport from './components/production/DailyReport';
import EquipmentResponsibility from './components/production/EquipmentResponsibility';
import ShiftSchedule from './components/production/ShiftSchedule';
import LineMaterials from './components/production/LineMaterials';
import MasterData from './components/production/MasterData';
// 设备管理子页面
import EquipmentLayout from './components/equipment/EquipmentLayout';
import EquipmentMaintenance from './components/equipment/EquipmentMaintenance';
import EquipmentInspection from './components/equipment/EquipmentInspection';
import EquipmentRepair from './components/equipment/EquipmentRepair';
import EquipmentArchives from './components/equipment/EquipmentArchives';
import EquipmentRelationships from './components/equipment/EquipmentRelationships';
import EquipmentMasterData from './components/equipment/EquipmentMasterData';
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
      <h3>系统功能模块：</h3>
      <ul>
        <li>✅ 生产管理 - 车间计划、生产任务、生产执行等（9个子功能）</li>
        <li>✅ 设备管理 - 设备保养、点检、维修等（6个子功能）</li>
        <li>⚠️ 质量管理 - 暂时禁用（存在兼容性问题）</li>
        <li>✅ 库存管理 - 备件寿命预警、库外备件管理、备件流水（3个子功能，新增）</li>
        <li>✅ 报表分析 - 各类数据报表和分析</li>
      </ul>
      <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
        <h4 style={{ color: '#0369a1', margin: '0 0 8px 0' }}>🎉 新增功能：库存管理</h4>
        <p style={{ margin: 0, color: '#0c4a6e' }}>
          点击左侧菜单"库存管理"可以体验新增的三个功能模块！
        </p>
      </div>
    </div>
  </div>
);

// 简单的质量管理页面（避免组件问题）
const SimpleQuality = () => (
  <div style={{ padding: '24px' }}>
    <h1>质量管理</h1>
    <p>质量管理功能正在优化中，敬请期待...</p>
    <div style={{ marginTop: '20px' }}>
      <h3>计划功能：</h3>
      <ul>
        <li>IQC质量检验</li>
        <li>PQC质量检验</li>
        <li>FQC质量检验</li>
        <li>OQC质量检验</li>
        <li>次品原因主数据</li>
        <li>检验标准主数据</li>
        <li>次品记录</li>
        <li>批次追溯</li>
      </ul>
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
            
            {/* 生产管理路由 */}
            <Route path="/production/*" element={<ProductionLayout />}>
              <Route index element={<Navigate to="workshop-plan" replace />} />
              <Route path="workshop-plan" element={<WorkshopPlan />} />
              <Route path="tasks" element={<ProductionTasks />} />
              <Route path="execution" element={<ProductionExecution />} />
              <Route path="work-report" element={<WorkReport />} />
              <Route path="daily-report" element={<DailyReport />} />
              <Route path="equipment-responsibility" element={<EquipmentResponsibility />} />
              <Route path="shift-schedule" element={<ShiftSchedule />} />
              <Route path="line-materials" element={<LineMaterials />} />
              <Route path="master-data" element={<MasterData />} />
            </Route>
            
            {/* 设备管理路由 */}
            <Route path="/equipment/*" element={<EquipmentLayout />}>
              <Route index element={<Navigate to="maintenance" replace />} />
              <Route path="maintenance" element={<EquipmentMaintenance />} />
              <Route path="inspection" element={<EquipmentInspection />} />
              <Route path="repair" element={<EquipmentRepair />} />
              <Route path="archives" element={<EquipmentArchives />} />
              <Route path="relationships" element={<EquipmentRelationships />} />
              <Route path="master-data" element={<EquipmentMasterData />} />
            </Route>
            
            {/* 质量管理路由 - 使用简化版本 */}
            <Route path="/quality" element={<SimpleQuality />} />
            
            {/* 库存管理路由 */}
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