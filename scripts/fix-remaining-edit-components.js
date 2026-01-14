const fs = require('fs');
const path = require('path');

/**
 * 修复剩余需要编辑功能的组件
 */

console.log('🔧 修复剩余需要编辑功能的组件...\n');

// 需要修复的文件列表（从检查报告中获取低完成度的组件）
const filesToFix = [
  // 50%完成度的组件 - 缺少handleSave、按钮绑定、数据更新、表单验证
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/production/EquipmentResponsibility.js',
  'client/src/components/production/MasterData.js',
  'client/src/components/production/ShiftSchedule.js',
  'client/src/components/production/WorkReport.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentRepair.js',
  
  // 38%完成度的组件 - 缺少handleSave、按钮绑定、表单重置、数据更新、表单验证
  'client/src/components/production/WorkshopPlanManagementSafe.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/equipment/EquipmentMasterData.js',
  
  // 25%完成度的组件 - 缺少handleEdit、handleSave、按钮绑定、表单重置、数据更新、表单验证
  'client/src/components/integration/SecuritySettingsFixed.js',
  'client/src/components/integration/SecuritySettingsSimple.js',
  'client/src/components/production/ProductionTasks.js',
  'client/src/components/production/WorkshopPlan.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentRelationships.js',
  
  // 0%完成度的组件 - 需要完整的编辑功能
  'client/src/components/settings/PermissionManagement.js'
];

function addEditState(content) {
  // 检查是否已有编辑状态
  if (content.includes('editingRecord') || content.includes('editingItem')) {
    return { content, modified: false };
  }

  // 查找useState的位置，添加编辑状态
  const statePattern = /(const \[[\w\s,]+\] = useState\([^)]*\);)/;
  const match = content.match(statePattern);
  
  if (match) {
    const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
    content = content.replace(match[0], match[0] + '\n' + newState);
    return { content, modified: true };
  }
  
  return { content, modified: false };
}

function addHandleEdit(content) {
  // 检查是否已有handleEdit函数
  if (content.includes('const handleEdit') || content.includes('handleEdit =')) {
    return { content, modified: false };
  }

  // 查找handleDelete函数的位置，在其后添加handleEdit
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
    return { content, modified: true };
  }

  return { content, modified: false };
}

function addHandleSave(content) {
  // 检查是否已有handleSave函数
  if (content.includes('const handleSave') || content.includes('handleSave =')) {
    return { content, modified: false };
  }

  // 查找handleEdit或handleDelete函数的位置，在其后添加handleSave
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
    return { content, modified: true };
  }

  return { content, modified: false };
}

function fixEditButtonBinding(content) {
  // 查找编辑按钮并修复绑定
  const editButtonPatterns = [
    /(<Button[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
    /(<Button[^>]*icon={<EditOutlined \/>}[^>]*>[\s\S]*?<\/Button>)/g,
    /(<Button[^>]*type="link"[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g
  ];

  let modified = false;

  editButtonPatterns.forEach(pattern => {
    content = content.replace(pattern, (match) => {
      // 检查是否已经有正确的onClick绑定
      if (match.includes('onClick={() => handleEdit(record)}') || 
          match.includes('onClick={handleEdit}')) {
        return match;
      }

      // 添加正确的onClick绑定
      if (match.includes('onClick=')) {
        // 替换现有的onClick
        const newMatch = match.replace(/onClick={[^}]*}/, 'onClick={() => handleEdit(record)}');
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
    const newTitle = `{editingRecord ? '编辑${baseTitle}' : '新增${baseTitle}'}`;
    content = content.replace(match[0], match[0].replace(`title="${baseTitle}"`, `title=${newTitle}`));
    return { content, modified: true };
  }

  return { content, modified: false };
}

function fixFormReset(content) {
  // 确保handleSave函数中有表单重置逻辑
  if (content.includes('form.resetFields()') && content.includes('setEditingRecord(null)')) {
    return { content, modified: false };
  }

  // 在handleSave函数中添加表单重置逻辑
  const handleSavePattern = /(const handleSave = async \(\) => {[\s\S]*?)(}\s*;)/;
  const match = content.match(handleSavePattern);

  if (match && !match[1].includes('form.resetFields()')) {
    const resetLogic = `
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();`;
    
    content = content.replace(match[2], resetLogic + '\n    } catch (error) {\n      console.error(\'保存失败:\', error);\n      message.error(\'保存失败\');\n    }\n  };');
    return { content, modified: true };
  }

  return { content, modified: false };
}

// 处理每个文件
let totalFixed = 0;

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    console.log(`📄 处理文件: ${path.basename(filePath)}`);

    // 1. 添加编辑状态管理
    const stateResult = addEditState(content);
    content = stateResult.content;
    if (stateResult.modified) {
      console.log('  ✅ 添加编辑状态管理');
      totalModified = true;
    }

    // 2. 添加handleEdit函数
    const editResult = addHandleEdit(content);
    content = editResult.content;
    if (editResult.modified) {
      console.log('  ✅ 添加handleEdit函数');
      totalModified = true;
    }

    // 3. 添加handleSave函数
    const saveResult = addHandleSave(content);
    content = saveResult.content;
    if (saveResult.modified) {
      console.log('  ✅ 添加handleSave函数');
      totalModified = true;
    }

    // 4. 修复编辑按钮绑定
    const buttonResult = fixEditButtonBinding(content);
    content = buttonResult.content;
    if (buttonResult.modified) {
      console.log('  ✅ 修复编辑按钮绑定');
      totalModified = true;
    }

    // 5. 修复模态框标题
    const titleResult = fixModalTitle(content);
    content = titleResult.content;
    if (titleResult.modified) {
      console.log('  ✅ 修复动态模态框标题');
      totalModified = true;
    }

    // 6. 修复表单重置
    const resetResult = fixFormReset(content);
    content = resetResult.content;
    if (resetResult.modified) {
      console.log('  ✅ 修复表单重置逻辑');
      totalModified = true;
    }

    if (totalModified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
      totalFixed++;
    } else {
      console.log('  ℹ️  无需修改');
    }

  } catch (error) {
    console.error(`❌ 处理失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log(`🎉 剩余组件编辑功能修复完成！共修复 ${totalFixed} 个文件`);

console.log('\n🧪 建议测试步骤:');
console.log('1. 重新运行检查脚本: node scripts/comprehensive-edit-check.js');
console.log('2. 启动开发服务器: npm start');
console.log('3. 逐个测试修复的组件编辑功能');
console.log('4. 验证编辑按钮点击、数据保存、表单验证等功能');
console.log('5. 检查是否有语法错误或运行时错误');