const fs = require('fs');
const path = require('path');

/**
 * 修复编辑按钮绑定和数据更新逻辑
 */

console.log('🔧 修复编辑按钮绑定和数据更新逻辑...\n');

// 需要修复的文件列表（从检查报告中获取）
const filesToFix = [
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
  'client/src/components/integration/SystemConfiguration.js'
];

function fixEditButtonBinding(content) {
  // 查找编辑按钮并修复绑定
  const editButtonPatterns = [
    // 查找现有的编辑按钮
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

function fixDataUpdate(content) {
  // 修复handleSave函数中的数据更新逻辑
  let modified = false;

  // 查找handleSave函数
  const handleSavePattern = /(const handleSave = async \(\) => {[\s\S]*?})/;
  const match = content.match(handleSavePattern);

  if (match) {
    const originalFunction = match[1];
    
    // 检查是否已经有正确的数据更新逻辑
    if (originalFunction.includes('editingRecord') && 
        originalFunction.includes('setData') &&
        originalFunction.includes('map')) {
      return { content, modified: false };
    }

    // 生成新的handleSave函数
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
  }`;

    content = content.replace(originalFunction, newHandleSave);
    modified = true;
  }

  return { content, modified };
}

function addMissingHandleSave(content) {
  // 如果没有handleSave函数，添加一个
  if (content.includes('const handleSave')) {
    return { content, modified: false };
  }

  // 查找handleDelete函数的位置，在其后添加handleSave
  const handleDeletePattern = /(const handleDelete[\s\S]*?};)/;
  const match = content.match(handleDeletePattern);

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

// 处理每个文件
filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    console.log(`📄 处理文件: ${path.basename(filePath)}`);

    // 1. 修复编辑按钮绑定
    const buttonResult = fixEditButtonBinding(content);
    content = buttonResult.content;
    if (buttonResult.modified) {
      console.log('  ✅ 修复编辑按钮绑定');
      totalModified = true;
    }

    // 2. 修复数据更新逻辑
    const dataResult = fixDataUpdate(content);
    content = dataResult.content;
    if (dataResult.modified) {
      console.log('  ✅ 修复数据更新逻辑');
      totalModified = true;
    }

    // 3. 添加缺失的handleSave函数
    const saveResult = addMissingHandleSave(content);
    content = saveResult.content;
    if (saveResult.modified) {
      console.log('  ✅ 添加handleSave函数');
      totalModified = true;
    }

    if (totalModified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
    } else {
      console.log('  ℹ️  无需修改');
    }

  } catch (error) {
    console.error(`❌ 处理失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log('🎉 编辑按钮绑定和数据更新修复完成！');
console.log('\n🧪 建议测试步骤:');
console.log('1. 启动开发服务器: npm start');
console.log('2. 测试各模块的编辑功能');
console.log('3. 验证编辑按钮点击后是否正确打开模态框');
console.log('4. 验证编辑后保存是否正确更新数据');
console.log('5. 检查表单验证和错误处理');