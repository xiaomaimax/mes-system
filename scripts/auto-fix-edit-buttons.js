const fs = require('fs');

/**
 * 自动修复编辑按钮功能
 */

const filesToFix = [
  "client\\src\\components\\settings\\PermissionManagement.js"
];

console.log('🔧 开始修复编辑按钮功能...\n');

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    console.log(`📄 修复文件: ${filePath}`);
    
    // 添加编辑状态管理
    if (!content.includes('editingRecord') && !content.includes('editingItem')) {
      const stateMatch = content.match(/(const \[\w+, set\w+\] = useState\([^)]*\);)/);
      if (stateMatch) {
        const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
        content = content.replace(stateMatch[0], stateMatch[0] + '\n' + newState);
        modified = true;
        console.log('  ✅ 添加编辑状态管理');
      }
    }
    
    // 添加handleEdit函数
    if (!content.includes('handleEdit')) {
      const handleDeleteMatch = content.match(/(const handleDelete[^}]+})/s);
      if (handleDeleteMatch) {
        const handleEditFunction = `
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };`;
        content = content.replace(handleDeleteMatch[0], handleDeleteMatch[0] + '\n' + handleEditFunction);
        modified = true;
        console.log('  ✅ 添加handleEdit函数');
      }
    }
    
    // 修复handleSave函数
    if (content.includes('handleSave') && !content.includes('editingRecord')) {
      content = content.replace(
        /const handleSave = async \(\) => {([^}]+)}/s,
        `const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        );
        setData(updatedData);
        message.success('编辑成功');
      } else {
        // 新增模式
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
  }`
      );
      modified = true;
      console.log('  ✅ 修复handleSave函数');
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
    } else {
      console.log('  ℹ️  无需修改');
    }
    
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
  
  console.log('');
});

console.log('🎉 编辑按钮功能修复完成！');
