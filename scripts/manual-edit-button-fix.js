const fs = require('fs');
const path = require('path');

/**
 * 手动修复剩余的编辑按钮问题
 * 针对具体的问题组件进行精确修复
 */

console.log('🔧 手动修复剩余的编辑按钮问题...\n');

// 需要手动修复的组件及其具体问题
const manualFixes = {
  'client/src/components/settings/PermissionManagement.js': {
    issues: ['缺少handleEdit函数', '缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: true
  },
  'client/src/components/integration/SecuritySettingsFixed.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/integration/SecuritySettingsSimple.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/production/ProductionTasks.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/production/WorkshopPlan.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/quality/FQCInspection.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/quality/OQCInspection.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/equipment/EquipmentArchives.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  },
  'client/src/components/equipment/EquipmentRelationships.js': {
    issues: ['缺少handleSave函数', '缺少编辑按钮绑定', '缺少表单重置', '缺少数据更新', '缺少表单验证'],
    needsComplete: false
  }
};

/**
 * 添加完整的handleSave函数
 */
function addHandleSaveFunction(content) {
  // 查找合适的位置插入handleSave函数
  const insertPoints = [
    /(const handleDelete[^}]+}[\s\S]*?};)/,
    /(const handleEdit[^}]+}[\s\S]*?};)/,
    /(const \[.*?\] = useState\([^)]*\);[\s\S]*?\n)/
  ];

  let insertPoint = null;
  let insertAfter = '';

  for (const pattern of insertPoints) {
    const match = content.match(pattern);
    if (match) {
      insertPoint = match[0];
      insertAfter = match[0];
      break;
    }
  }

  if (!insertPoint) {
    // 如果找不到合适的插入点，在组件开始处插入
    const componentMatch = content.match(/(const \w+ = \(\) => {[\s\S]*?\n)/);
    if (componentMatch) {
      insertAfter = componentMatch[0];
    }
  }

  if (insertAfter) {
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

    content = content.replace(insertAfter, insertAfter + handleSaveFunction);
    return { content, modified: true };
  }

  return { content, modified: false };
}

/**
 * 添加handleEdit函数
 */
function addHandleEditFunction(content) {
  // 查找合适的位置插入handleEdit函数
  const insertPoints = [
    /(const handleDelete[^}]+}[\s\S]*?};)/,
    /(const \[.*?\] = useState\([^)]*\);[\s\S]*?\n)/
  ];

  let insertAfter = '';

  for (const pattern of insertPoints) {
    const match = content.match(pattern);
    if (match) {
      insertAfter = match[0];
      break;
    }
  }

  if (insertAfter) {
    const handleEditFunction = `
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };`;

    content = content.replace(insertAfter, insertAfter + handleEditFunction);
    return { content, modified: true };
  }

  return { content, modified: false };
}

/**
 * 添加编辑状态管理
 */
function addEditingState(content) {
  // 查找useState声明的位置
  const statePattern = /(const \[data, setData\] = useState\([^)]*\);)/;
  const match = content.match(statePattern);

  if (match) {
    const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
    content = content.replace(match[0], match[0] + '\n' + newState);
    return { content, modified: true };
  }

  return { content, modified: false };
}

/**
 * 修复编辑按钮绑定
 */
function fixEditButtonBinding(content) {
  let modified = false;

  // 查找编辑按钮并添加onClick绑定
  const buttonPatterns = [
    /(<Button[^>]*>[\s\S]*?编辑[\s\S]*?<\/Button>)/g,
    /(<Button[^>]*icon={\s*<EditOutlined\s*\/>\s*}[^>]*>[\s\S]*?<\/Button>)/g
  ];

  buttonPatterns.forEach(pattern => {
    content = content.replace(pattern, (match) => {
      if (!match.includes('onClick=')) {
        const newMatch = match.replace('<Button', '<Button onClick={() => handleEdit(record)}');
        modified = true;
        return newMatch;
      }
      return match;
    });
  });

  return { content, modified };
}

/**
 * 修复模态框标题
 */
function fixModalTitle(content) {
  if (content.includes('title=') && !content.includes('editingRecord ?')) {
    content = content.replace(
      /title="[^"]*"/g,
      'title={editingRecord ? "编辑记录" : "新增记录"}'
    );
    return { content, modified: true };
  }
  return { content, modified: false };
}

let totalFixed = 0;

// 处理每个需要修复的文件
Object.entries(manualFixes).forEach(([filePath, config]) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    console.log(`📄 手动修复: ${path.basename(filePath)}`);
    console.log(`   问题: ${config.issues.join(', ')}`);

    // 1. 如果需要完整修复，先添加编辑状态
    if (config.needsComplete && !content.includes('editingRecord')) {
      const stateResult = addEditingState(content);
      content = stateResult.content;
      if (stateResult.modified) {
        console.log('  ✅ 添加编辑状态管理');
        totalModified = true;
      }
    }

    // 2. 添加handleEdit函数（如果缺少）
    if (config.issues.includes('缺少handleEdit函数') && !content.includes('const handleEdit')) {
      const editResult = addHandleEditFunction(content);
      content = editResult.content;
      if (editResult.modified) {
        console.log('  ✅ 添加handleEdit函数');
        totalModified = true;
      }
    }

    // 3. 添加handleSave函数（如果缺少）
    if (config.issues.includes('缺少handleSave函数') && !content.includes('const handleSave')) {
      const saveResult = addHandleSaveFunction(content);
      content = saveResult.content;
      if (saveResult.modified) {
        console.log('  ✅ 添加handleSave函数');
        totalModified = true;
      }
    }

    // 4. 修复编辑按钮绑定
    if (config.issues.includes('缺少编辑按钮绑定')) {
      const buttonResult = fixEditButtonBinding(content);
      content = buttonResult.content;
      if (buttonResult.modified) {
        console.log('  ✅ 修复编辑按钮绑定');
        totalModified = true;
      }
    }

    // 5. 修复模态框标题
    const titleResult = fixModalTitle(content);
    content = titleResult.content;
    if (titleResult.modified) {
      console.log('  ✅ 修复模态框标题');
      totalModified = true;
    }

    if (totalModified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
      totalFixed++;
    } else {
      console.log('  ℹ️  无需修改或修复失败');
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log(`🎉 手动修复完成！共修复 ${totalFixed} 个文件\n`);

console.log('🚀 建议下一步操作:');
console.log('1. 重新运行检查脚本验证修复结果');
console.log('2. 启动开发服务器测试功能');
console.log('3. 逐个测试编辑功能是否正常工作');

console.log('\n📋 如果还有问题，可能需要:');
console.log('- 手动检查文件结构和语法');
console.log('- 确保所有必要的import已添加');
console.log('- 验证表单和模态框组件的正确配置');