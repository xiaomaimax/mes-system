import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TestPage from './components/TestPage';
import ProductionOrders from './components/ProductionOrders';
import Equipment from './components/Equipment';
import Quality from './components/Quality';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
// 质量管理子页面
import QualityLayout from './components/quality/QualityLayout';
import IQCInspection from './components/quality/IQCInspection';
import PQCInspection from './components/quality/PQCInspection';
import FQCInspection from './components/quality/FQCInspection';
import OQCInspection from './components/quality/OQCInspection';
import DefectReasons from './components/quality/DefectReasons';
import InspectionStandards from './components/quality/InspectionStandards';
import DefectRecords from './components/quality/DefectRecords';
import BatchTracing from './components/quality/BatchTracing';
// 库存管理子页面
import InventoryLayout from './components/inventory/InventoryLayout';
import SparePartsAlert from './components/inventory/SparePartsAlert';
import ExternalSpareParts from './components/inventory/ExternalSpareParts';
import SparePartsFlow from './components/inventory/SparePartsFlow';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const { Content } = Layout;

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px' }}>加载中...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '16px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/test" replace />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
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
            
            {/* 质量管理路由 */}
            <Route path="/quality/*" element={<QualityLayout />}>
              <Route index element={<Navigate to="iqc" replace />} />
              <Route path="iqc" element={<IQCInspection />} />
              <Route path="pqc" element={<PQCInspection />} />
              <Route path="fqc" element={<FQCInspection />} />
              <Route path="oqc" element={<OQCInspection />} />
              <Route path="defect-reasons" element={<DefectReasons />} />
              <Route path="inspection-standards" element={<InspectionStandards />} />
              <Route path="defect-records" element={<DefectRecords />} />
              <Route path="batch-tracing" element={<BatchTracing />} />
            </Route>
            
            {/* 库存管理路由 */}
            <Route path="/inventory/*" element={<InventoryLayout />}>
              <Route index element={<Navigate to="spare-parts-alert" replace />} />
              <Route path="spare-parts-alert" element={<SparePartsAlert />} />
              <Route path="external-spare-parts" element={<ExternalSpareParts />} />
              <Route path="spare-parts-flow" element={<SparePartsFlow />} />
            </Route>
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;