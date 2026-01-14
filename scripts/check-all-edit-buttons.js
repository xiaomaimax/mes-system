#!/usr/bin/env node

/**
 * 检查系统所有编辑按钮功能
 * 确保编辑后可以保存并更新数据
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 检查系统所有编辑按钮功能...\n');

// 需要检查的组件列表
const componentsToCheck = [
  // 生产管理
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ProductionExecutionManagement.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/production/DailyReportManagement.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  
  // 设备管理
  'client/src/components/equipment/EquipmentMasterData.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentRepair.js',
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentRelationships.js',
  
  // 质量管理
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/quality/DefectRecords.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/quality/BatchTracing.js',
  
  // 库存管理
  'client/src/components/inventory/InventoryMasterData.js',
  'client/src/components/inventory/InventoryInOut.js',
  'client/src/components/inventory/InventoryTransfer.js',
  'client/src/components/inventory/InventoryCount.js',
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/inventory/SparePartsFlow.js',
  'client/src/components/inventory/SparePartsAlert.js',
  
  // 工艺管理
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/process/ProcessParameters.js',
  'client/src/components/process/ProcessDocuments.js',
  'client/src/components/process/ProcessSOP.js',
  'client/src/components/process/ProcessOptimization.js',
  'client/src/components/process/ProcessValidation.js',
  'client/src/components/process/ProcessChangeControl.js',
  'client/src/components/process/ProcessMasterData.js',
  
  // 人员管理
  'client/src/components/personnel/EmployeeManagement.js',
  'client/src/components/personnel/DepartmentManagement.js',
  'client/src/components/personnel/AttendanceManagement.js',
  'client/src/components/personnel/TrainingManagement.js',
  'client/src/components/personnel/PerformanceManagement.js',
  'client/src/components/personnel/SkillCertification.js',
  'client/src/components/personnel/WorkSchedule.js',
  
  // 系统设置
  'client/src/components/settings/UserManagement.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/PermissionManagement.js',
  'client/src/components/settings/SystemConfiguration.js',
  'client/src/components/settings/SecuritySettings.js',
  'client/src/components/settings/AuditLogs.js',
  'client/src/components/settings/MessagePushSettings.js',
  
  // 集成管理
  'client/src/components/integration/InterfaceManagement.js',
  'client/src/components/integration/DataMapping.js',
  'client/src/components/integration/SyncMonitoring.js',
  'client/src/components/integration/SystemConfiguration.js',
  'client/src/components/integration/SecuritySettings.js',
  'client/src/components/integration/SyncScheduler.js',
  'client/src/components/integration/DataTransformEngine.js',
  'client/src/components/integration/ErrorHandling.js',
  'client/src/components/integration/PerformanceMonitoring.js',
  'client/src/components/integration/APIDocumentation.js'
];

let totalComponents = 0;
let componentsWithEditButtons = 0;
let componentsWithProperEditFunction = 0;
let componentsWithStateManagement = 0;
let componentsWithDataUpdate = 0;
let componentsNeedingFix = [];

console.log('📊 检查结果统计:\n');

componentsToCheck.forEach(componentPath => {
  if (!fs.existsSync(componentPath)) {
    return;
  }
  
  totalComponents++;
  const content = fs.readFileSync(componentPath, 'utf8');
  const componentName = path.basename(componentPath, '.js');
  
  // 检查是否有编辑按钮
  const hasEditButton = content.includes('EditOutlined') && content.includes('编辑');
  if (!hasEditButton) {
    return;
  }
  
  componentsWithEditButtons++;
  console.log(`🔍 检查组件: ${componentName}`);
  
  let issues = [];
  
  // 检查是否有handleEdit函数
  const hasHandleEdit = content.includes('const handleEdit') || content.includes('function handleEdit');
  if (!hasHandleEdit) {
    issues.push('缺少handleEdit函数');
  }
  
  // 检查是否有状态管理
  const hasStateManagement = content.includes('useState') && (
    content.includes('setData') || 
    content.includes('setPlanData') || 
    content.includes('setTableData') ||
    content.includes('setRecords') ||
    content.includes('setItems')
  );
  if (hasStateManagement) {
    componentsWithStateManagement++;
  } else {
    issues.push('缺少状态管理');
  }
  
  // 检查是否有编辑状态跟踪
  const hasEditingState = content.includes('editingRecord') || content.includes('editingItem') || content.includes('isEditing');
  if (!hasEditingState) {
    issues.push('缺少编辑状态跟踪');
  }
  
  // 检查是否有数据更新逻辑
  const hasDataUpdate = content.includes('map(item =>') && content.includes('key ===') && content.includes('...item');
  if (hasDataUpdate) {
    componentsWithDataUpdate++;
  } else {
    issues.push('缺少数据更新逻辑');
  }
  
  // 检查是否有表单填充
  const hasFormFill = content.includes('form.setFieldsValue') && content.includes('record');
  if (!hasFormFill) {
    issues.push('缺少表单数据填充');
  }
  
  // 检查是否有模态框控制
  const hasModalControl = content.includes('setModalVisible') || content.includes('setVisible');
  if (!hasModalControl) {
    issues.push('缺少模态框控制');
  }
  
  if (hasHandleEdit) {
    componentsWithProperEditFunction++;
  }
  
  if (issues.length > 0) {
    componentsNeedingFix.push({
      name: componentName,
      path: componentPath,
      issues: issues
    });
    console.log(`  ❌ 问题: ${issues.join(', ')}`);
  } else {
    console.log(`  ✅ 编辑功能完整`);
  }
  
  console.log('');
});

console.log('\n📈 统计结果:');
console.log(`总组件数: ${totalComponents}`);
console.log(`有编辑按钮的组件: ${componentsWithEditButtons}`);
console.log(`有编辑函数的组件: ${componentsWithProperEditFunction}`);
console.log(`有状态管理的组件: ${componentsWithStateManagement}`);
console.log(`有数据更新的组件: ${componentsWithDataUpdate}`);
console.log(`需要修复的组件: ${componentsNeedingFix.length}`);

if (componentsNeedingFix.length > 0) {
  console.log('\n🔧 需要修复的组件:');
  componentsNeedingFix.forEach(component => {
    console.log(`\n📋 ${component.name}:`);
    console.log(`   路径: ${component.path}`);
    console.log(`   问题: ${component.issues.join(', ')}`);
  });
  
  console.log('\n💡 修复建议:');
  console.log('1. 添加状态管理: const [data, setData] = useState([...])');
  console.log('2. 添加编辑状态: const [editingRecord, setEditingRecord] = useState(null)');
  console.log('3. 实现handleEdit函数: 设置编辑状态和表单数据');
  console.log('4. 实现数据更新逻辑: 在提交时更新状态数据');
  console.log('5. 添加表单填充: form.setFieldsValue(record)');
  console.log('6. 添加模态框控制: setModalVisible(true)');
}

console.log('\n🎯 下一步操作:');
if (componentsNeedingFix.length > 0) {
  console.log('运行修复脚本来批量修复编辑功能问题');
  console.log('node scripts/fix-all-edit-buttons.js');
} else {
  console.log('所有编辑按钮功能正常！');
}

// 输出需要修复的组件列表到文件
if (componentsNeedingFix.length > 0) {
  const fixList = componentsNeedingFix.map(c => ({
    name: c.name,
    path: c.path,
    issues: c.issues
  }));
  
  fs.writeFileSync(
    'scripts/edit-buttons-fix-list.json',
    JSON.stringify(fixList, null, 2)
  );
  
  console.log('\n📄 修复清单已保存到: scripts/edit-buttons-fix-list.json');
}