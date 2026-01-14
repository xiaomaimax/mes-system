const fs = require('fs');
const path = require('path');

/**
 * 修复剩余组件的编辑功能
 */

console.log('🔧 修复剩余组件的编辑功能...\n');

// 需要修复的剩余文件
const remainingFiles = [
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/inventory/InventoryCount.js',
  'client/src/components/inventory/InventoryMasterData.js',
  'client/src/components/inventory/InventoryTransfer.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentRepair.js'
];

function addCompleteEditFunctionality(content) {
  let modified = false;
  
  // 1. 添加handleSave函数（如果不存在）
  if (!content.includes('const handleSave')) {
    // 查找handleDelete函数的位置
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
      modified = true;
    }
  }

  // 2. 修复编辑按钮绑定
  const editButtonPatterns = [
    /(<Button[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
    /(<Button[^>]*icon={<EditOutlined \/>}[^>]*>[\s\S]*?<\/Button>)/g
  ];

  editButtonPatterns.forEach(pattern => {
    content = content.replace(pattern, (match) => {
      if (!match.includes('onClick={() => handleEdit(record)}') && 
          !match.includes('onClick={handleEdit}')) {
        if (match.includes('onClick=')) {
          const newMatch = match.replace(/onClick={[^}]*}/, 'onClick={() => handleEdit(record)}');
          modified = true;
          return newMatch;
        } else {
          const newMatch = match.replace('<Button', '<Button onClick={() => handleEdit(record)}');
          modified = true;
          return newMatch;
        }
      }
      return match;
    });
  });

  // 3. 确保Modal的onOk绑定到handleSave
  if (content.includes('<Modal') && !content.includes('onOk={handleSave}')) {
    content = content.replace(/(<Modal[^>]*onOk={)[^}]*}/, '$1handleSave}');
    modified = true;
  }

  return { content, modified };
}

// 处理每个文件
remainingFiles.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 处理文件: ${path.basename(filePath)}`);

    const result = addCompleteEditFunctionality(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log('  ✅ 添加完整编辑功能');
      console.log('  💾 文件已保存');
    } else {
      console.log('  ℹ️  无需修改');
    }

  } catch (error) {
    console.error(`❌ 处理失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log('🎉 剩余组件编辑功能修复完成！');

// 现在再次运行检查脚本验证修复结果
console.log('\n🔍 重新检查修复结果...');