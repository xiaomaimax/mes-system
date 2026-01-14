const fs = require('fs');
const path = require('path');

/**
 * 最终修复编辑按钮功能 - 处理剩余的9个组件和所有按钮绑定问题
 */

console.log('🔧 最终修复编辑按钮功能...\n');

// 需要完整修复的9个组件
const componentsNeedingFullFix = [
  'client/src/components/integration/SecuritySettingsFixed.js',
  'client/src/components/integration/SecuritySettingsSimple.js',
  'client/src/components/production/ProductionTasks.js',
  'client/src/components/production/WorkshopPlan.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentRelationships.js',
  'client/src/components/settings/PermissionManagement.js'
];

// 需要修复按钮绑定的所有组件（47个高质量组件）
const componentsNeedingButtonFix = [
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

function addCompleteEditFunctionality(content) {
  let modified = false;

  // 1. 添加编辑状态管理
  if (!content.includes('editingRecord') && !content.includes('editingItem')) {
    const statePattern = /(const \[[\w\s,]+\] = useState\([^)]*\);)/;
    const match = content.match(statePattern);
    
    if (match) {
      const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
      content = content.replace(match[0], match[0] + '\n' + newState);
      modified = true;
    }
  }

  // 2. 添加handleEdit函数
  if (!content.includes('const handleEdit') && !content.includes('handleEdit =')) {
    const handleDeletePattern = /(const handleDelete[\s\S]*?};)/;
    const match = content.match(handleDeletePattern);

    if (match) {
      const handleEditFunction = `
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };`;

      content = content.replace(match[1], match[1] + handleEditFunction);
      modified = true;
    }
  }

  // 3. 添加handleSave函数
  if (!content.includes('const handleSave') && !content.includes('handleSave =')) {
    const functionPattern = /(const handle(?:Edit|Delete)[\s\S]*?};)/;
    const match = content.match(functionPattern);

    if (match) {
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

      content = content.replace(match[1], match[1] + handleSaveFunction);
      modified = true;
    }
  }

  return { content, modified };
}

function fixEditButtonBinding(content) {
  let modified = false;

  // 查找所有可能的编辑按钮模式
  const patterns = [
    // 标准编辑按钮
    {
      pattern: /(<Button[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
      name: '标准编辑按钮'
    },
    // 带图标的编辑按钮
    {
      pattern: /(<Button[^>]*icon={<EditOutlined[^>]*>[\s\S]*?<\/Button>)/g,
      name: '图标编辑按钮'
    },
    // 链接类型的编辑按钮
    {
      pattern: /(<Button[^>]*type="link"[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
      name: '链接编辑按钮'
    },
    // 操作列中的编辑按钮
    {
      pattern: /(<a[^>]*>[\s\S]*?编辑[\s\S]*?<\/a>)/g,
      name: '链接编辑按钮'
    }
  ];

  patterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // 检查是否已经有正确的onClick绑定
        if (match.includes('onClick={() => handleEdit(record)}') || 
            match.includes('onClick={handleEdit}') ||
            match.includes('onClick={() => handleEdit(text, record)}')) {
          return;
        }

        let newMatch = match;

        // 处理Button组件
        if (match.includes('<Button')) {
          if (match.includes('onClick=')) {
            // 替换现有的onClick
            newMatch = match.replace(/onClick={[^}]*}/, 'onClick={() => handleEdit(record)}');
          } else {
            // 添加新的onClick
            newMatch = match.replace('<Button', '<Button onClick={() => handleEdit(record)}');
          }
        }
        // 处理a标签
        else if (match.includes('<a')) {
          if (match.includes('onClick=')) {
            // 替换现有的onClick
            newMatch = match.replace(/onClick={[^}]*}/, 'onClick={() => handleEdit(record)}');
          } else {
            // 添加新的onClick
            newMatch = match.replace('<a', '<a onClick={() => handleEdit(record)}');
          }
        }

        if (newMatch !== match) {
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
    }
  });

  // 特殊处理：查找Table的columns定义中的render函数
  const columnPattern = /(render:\s*\([^)]*\)\s*=>\s*\([^)]*\))/g;
  content = content.replace(columnPattern, (match) => {
    if (match.includes('编辑') && !match.includes('handleEdit')) {
      // 在render函数中添加handleEdit调用
      const newMatch = match.replace(
        /(编辑[^<]*<\/[^>]*>)/,
        '$1'.replace(/onClick={[^}]*}/, 'onClick={() => handleEdit(record)}')
      );
      if (newMatch !== match) {
        modified = true;
        return newMatch;
      }
    }
    return match;
  });

  return { content, modified };
}

function fixModalTitle(content) {
  // 修复模态框标题为动态标题
  if (content.includes('editingRecord ?')) {
    return { content, modified: false };
  }

  // 查找Modal组件的title属性
  const modalTitlePattern = /(<Modal[^>]*title=")([^"]*)(")[^>]*>/;
  const match = content.match(modalTitlePattern);

  if (match) {
    const baseTitle = match[2];
    if (!baseTitle.includes('编辑') && !baseTitle.includes('新增')) {
      const newTitle = `{editingRecord ? '编辑${baseTitle}' : '新增${baseTitle}'}`;
      content = content.replace(match[0], match[0].replace(`title="${baseTitle}"`, `title=${newTitle}`));
      return { content, modified: true };
    }
  }

  return { content, modified: false };
}

// 处理需要完整修复的组件
console.log('🔧 修复需要完整编辑功能的组件...\n');

let fullFixCount = 0;
componentsNeedingFullFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    console.log(`📄 完整修复: ${path.basename(filePath)}`);

    // 添加完整的编辑功能
    const fullResult = addCompleteEditFunctionality(content);
    content = fullResult.content;
    if (fullResult.modified) {
      console.log('  ✅ 添加完整编辑功能');
      totalModified = true;
    }

    // 修复按钮绑定
    const buttonResult = fixEditButtonBinding(content);
    content = buttonResult.content;
    if (buttonResult.modified) {
      console.log('  ✅ 修复编辑按钮绑定');
      totalModified = true;
    }

    // 修复模态框标题
    const titleResult = fixModalTitle(content);
    content = titleResult.content;
    if (titleResult.modified) {
      console.log('  ✅ 修复动态模态框标题');
      totalModified = true;
    }

    if (totalModified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
      fullFixCount++;
    } else {
      console.log('  ℹ️  无需修改');
    }

  } catch (error) {
    console.error(`❌ 完整修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

// 处理需要按钮绑定修复的组件
console.log('🔧 修复编辑按钮绑定...\n');

let buttonFixCount = 0;
componentsNeedingButtonFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 按钮绑定修复: ${path.basename(filePath)}`);

    // 修复按钮绑定
    const buttonResult = fixEditButtonBinding(content);
    
    if (buttonResult.modified) {
      fs.writeFileSync(filePath, buttonResult.content);
      console.log('  ✅ 修复编辑按钮绑定');
      console.log('  💾 文件已保存');
      buttonFixCount++;
    } else {
      console.log('  ℹ️  按钮绑定已正确');
    }

  } catch (error) {
    console.error(`❌ 按钮绑定修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log(`🎉 最终修复完成！`);
console.log(`📊 完整功能修复: ${fullFixCount} 个组件`);
console.log(`🔗 按钮绑定修复: ${buttonFixCount} 个组件`);

console.log('\n🧪 建议测试步骤:');
console.log('1. 重新运行检查脚本: node scripts/comprehensive-edit-check.js');
console.log('2. 启动开发服务器: npm start');
console.log('3. 系统性测试所有模块的编辑功能');
console.log('4. 验证编辑按钮点击、数据保存、表单验证等功能');
console.log('5. 检查是否有语法错误或运行时错误');

console.log('\n🎯 预期结果:');
console.log('- 总体完成度应达到90%以上');
console.log('- 所有编辑按钮应能正确响应点击');
console.log('- 编辑后数据应能正确保存和更新');
console.log('- 表单验证和错误处理应正常工作');