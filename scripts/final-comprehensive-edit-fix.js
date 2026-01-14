const fs = require('fs');
const path = require('path');

/**
 * 最终全面修复所有编辑按钮功能
 * 1. 修复47个高质量组件的按钮绑定问题
 * 2. 完善9个低完成度组件的完整功能
 */

console.log('🚀 最终全面修复所有编辑按钮功能...\n');

// 47个高质量组件（88%完成度，只需修复按钮绑定）
const highQualityComponents = [
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/UserManagement.js',
  'client/src/components/personnel/DepartmentManagement.js',
  'client/src/components/personnel/EmployeeManagement.js',
  'client/src/components/personnel/PerformanceManagement.js',
  'client/src/components/personnel/SkillCertification.js',
  'client/src/components/personnel/TrainingManagement.js',
  'client/src/components/personnel/WorkSchedule.js',
  'client/src/components/process/ProcessChangeControl.js',
  'client/src/components/process/ProcessDocuments.js',
  'client/src/components/process/ProcessMasterData.js',
  'client/src/components/process/ProcessOptimization.js',
  'client/src/components/process/ProcessParameters.js',
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/process/ProcessSOP.js',
  'client/src/components/process/ProcessValidation.js',
  'client/src/components/integration/DataMapping.js',
  'client/src/components/integration/DataTransformEngine.js',
  'client/src/components/integration/InterfaceManagement.js',
  'client/src/components/integration/SecuritySettings.js',
  'client/src/components/integration/SyncScheduler.js',
  'client/src/components/integration/SystemConfiguration.js',
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/inventory/InventoryCount.js',
  'client/src/components/inventory/InventoryMasterData.js',
  'client/src/components/inventory/InventoryTransfer.js',
  'client/src/components/production/EquipmentResponsibility.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/MasterData.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ShiftSchedule.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/WorkReport.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/production/WorkshopPlanManagementSafe.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentMasterData.js',
  'client/src/components/equipment/EquipmentRepair.js'
];

// 9个需要完整修复的组件
const lowQualityComponents = [
  'client/src/components/settings/PermissionManagement.js',
  'client/src/components/integration/SecuritySettingsFixed.js',
  'client/src/components/integration/SecuritySettingsSimple.js',
  'client/src/components/production/ProductionTasks.js',
  'client/src/components/production/WorkshopPlan.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentRelationships.js'
];

/**
 * 修复编辑按钮绑定（用于高质量组件）
 */
function fixEditButtonBinding(content) {
  let modified = false;

  // 查找表格中的编辑按钮并修复绑定
  const patterns = [
    // 模式1: <Button>编辑</Button>
    /(<Button[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
    // 模式2: <Button icon={<EditOutlined />}>
    /(<Button[^>]*icon={\s*<EditOutlined\s*\/>\s*}[^>]*>[\s\S]*?<\/Button>)/g,
    // 模式3: type="link" 的编辑按钮
    /(<Button[^>]*type="link"[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
    // 模式4: 只有图标的编辑按钮
    /(<Button[^>]*><EditOutlined[^>]*\/><\/Button>)/g
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern, (match) => {
      // 检查是否已经有正确的onClick绑定
      if (match.includes('onClick={() => handleEdit(record)}') || 
          match.includes('onClick={handleEdit}') ||
          match.includes('onClick={() => handleEdit')) {
        return match;
      }

      // 添加或替换onClick绑定
      if (match.includes('onClick=')) {
        // 替换现有的onClick
        const newMatch = match.replace(/onClick=\{[^}]*\}/, 'onClick={() => handleEdit(record)}');
        modified = true;
        return newMatch;
      } else {
        // 添加新的onClick
        const newMatch = match.replace('<Button', '<Button onClick={() => handleEdit(record)}');
        modified = true;
        return newMatch;
      }
    });
  });

  return { content, modified };
}

/**
 * 完整修复组件功能（用于低质量组件）
 */
function addCompleteEditFunctionality(content) {
  let modified = false;

  // 1. 添加编辑状态管理
  if (!content.includes('editingRecord') && !content.includes('editingItem')) {
    const stateMatch = content.match(/(const \[data, setData\] = useState\([^)]*\);)/);
    if (stateMatch) {
      const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
      content = content.replace(stateMatch[0], stateMatch[0] + '\n' + newState);
      modified = true;
    }
  }

  // 2. 添加handleEdit函数
  if (!content.includes('const handleEdit')) {
    const handleDeleteMatch = content.match(/(const handleDelete[^}]+}[\s\S]*?};)/);
    if (handleDeleteMatch) {
      const handleEditFunction = `
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };`;
      content = content.replace(handleDeleteMatch[0], handleDeleteMatch[0] + handleEditFunction);
      modified = true;
    }
  }

  // 3. 添加或修复handleSave函数
  if (!content.includes('const handleSave')) {
    // 添加新的handleSave函数
    const handleEditMatch = content.match(/(const handleEdit[^}]+}[\s\S]*?};)/);
    if (handleEditMatch) {
      const handleSaveFunction = `
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式 - 更新现有记录
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        );
        setData(updatedData);
        message.success('编辑成功');
      } else {
        // 新增模式 - 添加新记录
        const newRecord = {
          id: Date.now(),
          ...values,
          createTime: new Date().toLocaleString()
        };
        setData([...data, newRecord]);
        message.success('新增成功');
      }
      
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };`;
      content = content.replace(handleEditMatch[0], handleEditMatch[0] + handleSaveFunction);
      modified = true;
    }
  } else {
    // 修复现有的handleSave函数
    const handleSavePattern = /(const handleSave = async \(\) => {[\s\S]*?}[\s\S]*?};)/;
    const match = content.match(handleSavePattern);
    
    if (match && !match[1].includes('editingRecord')) {
      const newHandleSave = `const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式 - 更新现有记录
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        );
        setData(updatedData);
        message.success('编辑成功');
      } else {
        // 新增模式 - 添加新记录
        const newRecord = {
          id: Date.now(),
          ...values,
          createTime: new Date().toLocaleString()
        };
        setData([...data, newRecord]);
        message.success('新增成功');
      }
      
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };`;
      content = content.replace(match[1], newHandleSave);
      modified = true;
    }
  }

  // 4. 修复模态框标题
  if (!content.includes('editingRecord ?')) {
    content = content.replace(
      /title="[^"]*"/g,
      'title={editingRecord ? "编辑记录" : "新增记录"}'
    );
    modified = true;
  }

  return { content, modified };
}

let totalFixed = 0;
let buttonBindingFixed = 0;
let completelyFixed = 0;

console.log('📋 第一阶段：修复47个高质量组件的按钮绑定\n');

// 处理高质量组件（只需修复按钮绑定）
highQualityComponents.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 修复按钮绑定: ${path.basename(filePath)}`);

    const result = fixEditButtonBinding(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log('  ✅ 修复编辑按钮绑定');
      console.log('  💾 文件已保存');
      buttonBindingFixed++;
      totalFixed++;
    } else {
      console.log('  ℹ️  按钮绑定已正确');
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log(`\n📋 第二阶段：完整修复9个低质量组件\n`);

// 处理低质量组件（需要完整功能修复）
lowQualityComponents.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    console.log(`📄 完整修复: ${path.basename(filePath)}`);

    // 1. 添加完整编辑功能
    const completeResult = addCompleteEditFunctionality(content);
    content = completeResult.content;
    if (completeResult.modified) {
      console.log('  ✅ 添加完整编辑功能');
      totalModified = true;
    }

    // 2. 修复按钮绑定
    const buttonResult = fixEditButtonBinding(content);
    content = buttonResult.content;
    if (buttonResult.modified) {
      console.log('  ✅ 修复编辑按钮绑定');
      totalModified = true;
    }

    if (totalModified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
      completelyFixed++;
      totalFixed++;
    } else {
      console.log('  ℹ️  无需修改');
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log('🎉 最终全面修复完成！\n');

console.log('📊 修复统计:');
console.log(`- 按钮绑定修复: ${buttonBindingFixed} 个组件`);
console.log(`- 完整功能修复: ${completelyFixed} 个组件`);
console.log(`- 总计修复: ${totalFixed} 个组件`);

console.log('\n🚀 建议下一步操作:');
console.log('1. 重新运行检查脚本: node scripts/comprehensive-edit-check.js');
console.log('2. 启动开发服务器: npm start');
console.log('3. 逐模块测试编辑功能');
console.log('4. 验证编辑按钮点击响应');
console.log('5. 验证数据保存和更新');

console.log('\n🧪 重点测试项目:');
console.log('- 编辑按钮点击后模态框正确打开');
console.log('- 表单数据正确预填充');
console.log('- 编辑保存后数据正确更新');
console.log('- 新增保存后数据正确添加');
console.log('- 表单验证和错误处理');

console.log('\n📋 如果还有问题，请检查:');
console.log('- 编辑按钮的onClick事件绑定');
console.log('- handleEdit和handleSave函数的实现');
console.log('- 编辑状态管理（editingRecord）');
console.log('- 数据更新逻辑（setData调用）');