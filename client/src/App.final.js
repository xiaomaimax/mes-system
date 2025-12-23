import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import SimpleHeader from './components/SimpleHeader';
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
import EquipmentLayout from './components/equipment/EquipmentLayout';
import EquipmentMaintenance from './components/equipment/EquipmentMaintenance';
import EquipmentInspection from './components/equipment/EquipmentInspection';
import EquipmentRepair from './components/equipment/EquipmentRepair';
import EquipmentArchives from './components/equipment/EquipmentArchives';
import EquipmentRelationships from './components/equipment/EquipmentRelationships';
import EquipmentMasterData from './components/equipment/EquipmentMasterData';
import QualityLayout from './components/quality/QualityLayout';
import IQCInspection from './components/quality/IQCInspection';
import PQCInspection from './components/quality/PQCInspection';
import FQCInspection from './components/quality/FQCInspection';
import OQCInspection from './components/quality/OQCInspection';
import DefectReasons from './components/quality/DefectReasons';
import InspectionStandards from './components/quality/InspectionStandards';
import DefectRecords from './components/quality/DefectRecords';
import BatchTracing from './components/quality/BatchTracing';
import InventoryLayout from './components/inventory/InventoryLayout';
import SparePartsAlert from './components/inventory/SparePartsAlert';
import ExternalSpareParts from './components/inventory/ExternalSpareParts';
import SparePartsFlow from './components/inventory/SparePartsFlow';
import SimpleReports from './components/SimpleReports';

const Content = Layout.Content;

const SimpleDashboard = () => (
  <div style={{ padding: '24px' }}>
    <h1>MES 制造执行系统</h1>
    <p>欢迎使用MES系统！</p>
    <div style={{ marginTop: '20px' }}>
      <h3>系统功能模块：</h3>
      <ul>
        <li>生产管理 - 车间计划、生产任务、生产执行等</li>
        <li>设备管理 - 设备保养、点检、维修等</li>
        <li>质量管理 - IQC/PQC/FQC/OQC检验等</li>
        <li>库存管理 - 备件寿命预警、库外备件管理、备件流水（新增）</li>
        <li>报表分析 - 各类数据报表和分析</li>
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
            <Route path="/equipment/*" element={<EquipmentLayout />}>
              <Route index element={<Navigate to="maintenance" replace />} />
              <Route path="maintenance" element={<EquipmentMaintenance />} />
              <Route path="inspection" element={<EquipmentInspection />} />
              <Route path="repair" element={<EquipmentRepair />} />
              <Route path="archives" element={<EquipmentArchives />} />
              <Route path="relationships" element={<EquipmentRelationships />} />
              <Route path="master-data" element={<EquipmentMasterData />} />
            </Route>
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
