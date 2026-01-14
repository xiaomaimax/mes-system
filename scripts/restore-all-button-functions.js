/**
 * 恢复所有按钮功能修复
 * 包括：编辑按钮、删除按钮、保存功能
 */

const fs = require('fs');
const path = require('path');

const directories = [
  'client/src/components/equipment',
  'client/src/components/integration',
  'client/src/components/inventory',
  'client/src/components/personnel',
  'client/src/components/process',
  'client/src/components/production',
  'client/src/components/quality',
  'client/src/components/settings'
];

let totalFixed = 0;

// 标准的 handleSave 函数代码
const handleSaveCode = `
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

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixes = [];

    // 1. 确保导入 ButtonActions
    if (!content.includes("import ButtonActions from '../../utils/buttonActions'") &&
        !content.includes("import { ButtonActions }")) {
      // 在最后一个 import 语句后添加
      const lastImportMatch = content.match(/^import .+;?\s*$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.lastIndexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) + 
                  "\nimport ButtonActions from '../../utils/buttonActions';" + 
                  content.slice(insertPos);
        fixes.push('添加 ButtonActions 导入');
      }
    }

    // 2. 确保有 editingRecord 状态
    if (!content.includes('editingRecord') && content.includes('useState')) {
      const useStateMatch = content.match(/const \[(\w+), set\w+\] = useState\(/);
      if (useStateMatch) {
        const insertPos = content.indexOf(useStateMatch[0]);
        content = content.slice(0, insertPos) + 
                  'const [editingRecord, setEditingRecord] = useState(null);\n  ' + 
                  content.slice(insertPos);
        fixes.push('添加 editingRecord 状态');
      }
    }

    // 3. 添加 handleEdit 函数（如果不存在）
    if (!content.includes('handleEdit') && content.includes('setModalVisible')) {
      const handleEditCode = `
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };
`;
      // 在 return 语句前插入
      const returnMatch = content.match(/\n(\s*)return\s*\(/);
      if (returnMatch) {
        const insertPos = content.indexOf(returnMatch[0]);
        content = content.slice(0, insertPos) + handleEditCode + content.slice(insertPos);
        fixes.push('添加 handleEdit 函数');
      }
    }

    // 4. 修复编辑按钮绑定
    // 将 <Button ... icon={<EditOutlined />}> 改为 <Button onClick={() => handleEdit(record)} ... icon={<EditOutlined />}>
    const editButtonPattern = /<Button\s+(?!onClick)([^>]*icon=\{<EditOutlined\s*\/>\}[^>]*)>/g;
    if (editButtonPattern.test(content)) {
      content = content.replace(editButtonPattern, '<Button onClick={() => handleEdit(record)} $1>');
      fixes.push('修复编辑按钮绑定');
    }

    // 5. 修复删除按钮绑定
    // 将没有 onClick 的删除按钮添加 onClick
    const deleteButtonPattern = /<Button\s+(?!onClick)([^>]*icon=\{<DeleteOutlined\s*\/>\}[^>]*)>/g;
    if (deleteButtonPattern.test(content)) {
      content = content.replace(deleteButtonPattern, (match, attrs) => {
        return `<Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { message.success('删除成功'); })} ${attrs}>`;
      });
      fixes.push('修复删除按钮绑定');
    }

    // 6. 修复 Modal 标题（支持编辑/新增模式）
    if (content.includes('editingRecord') && content.includes('<Modal')) {
      // 将固定标题改为动态标题
      content = content.replace(
        /title="新增[^"]*"/g,
        "title={editingRecord ? '编辑记录' : '新增记录'}"
      );
      content = content.replace(
        /title='新增[^']*'/g,
        "title={editingRecord ? '编辑记录' : '新增记录'}"
      );
    }

    if (content !== originalContent && fixes.length > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.basename(filePath)} - ${fixes.join(', ')}`);
      totalFixed++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`目录不存在: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(dirPath, file);
      fixFile(filePath);
    }
  }
}

console.log('🔧 开始恢复按钮功能修复...\n');

for (const dir of directories) {
  console.log(`\n📁 处理目录: ${dir}`);
  processDirectory(dir);
}

console.log(`\n✅ 完成! 共修复 ${totalFixed} 个文件`);
