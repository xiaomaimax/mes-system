#!/usr/bin/env node

/**
 * 批量修复所有编辑按钮功能
 * 确保编辑后可以保存并更新数据
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 批量修复所有编辑按钮功能...\n');

// 读取需要修复的组件列表
const fixListPath = 'scripts/edit-buttons-fix-list.json';
if (!fs.existsSync(fixListPath)) {
  console.log('❌ 请先运行 node scripts/check-all-edit-buttons.js 生成修复清单');
  process.exit(1);
}

const fixList = JSON.parse(fs.readFileSync(fixListPath, 'utf8'));

console.log(`📋 需要修复 ${fixList.length} 个组件\n`);

let fixedCount = 0;
let errorCount = 0;

fixList.forEach((component, index) => {
  console.log(`🔧 修复组件 ${index + 1}/${fixList.length}: ${component.name}`);
  
  try {
    const filePath = component.path;
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ 文件不存在: ${filePath}`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. 添加状态管理
    if (component.issues.includes('缺少状态管理')) {
      if (!content.includes('useState') || !content.includes('setData')) {
        // 查找现有数据数组定义
        const dataArrayMatch = content.match(/const\s+(\w+Data|\w+List|\w+Records)\s*=\s*\[/);
        if (dataArrayMatch) {
          const dataVarName = dataArrayMatch[1];
          const stateVarName = dataVarName.replace(/Data$|List$|Records$/, '') + 'Data';
          
          // 替换静态数据为状态管理
          content = content.replace(
            new RegExp(`const\\s+${dataVarName}\\s*=\\s*\\[`, 'g'),
            `const [${stateVarName}, set${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}] = useState([`
          );
          
          // 更新表格数据源引用
          content = content.replace(
            new RegExp(`dataSource={${dataVarName}}`, 'g'),
            `dataSource={${stateVarName}}`
          );
          
          modified = true;
        }
      }
    }
    
    // 2. 添加编辑状态跟踪
    if (component.issues.includes('缺少编辑状态跟踪')) {
      if (!content.includes('editingRecord') && !content.includes('editingItem')) {
        // 在useState导入后添加编辑状态
        const useStateMatch = content.match(/const\s+\[.*?\]\s*=\s*useState\([^)]*\);/);
        if (useStateMatch) {
          const insertPos = content.indexOf(useStateMatch[0]) + useStateMatch[0].length;
          content = content.slice(0, insertPos) + 
            '\n  const [editingRecord, setEditingRecord] = useState(null);' +
            content.slice(insertPos);
          modified = true;
        }
      }
    }
    
    // 3. 添加handleEdit函数
    if (component.issues.includes('缺少handleEdit函数')) {
      if (!content.includes('const handleEdit') && !content.includes('function handleEdit')) {
        // 查找其他handle函数的位置
        const handleFunctionMatch = content.match(/const\s+handle\w+\s*=\s*[^;]+;/);
        if (handleFunctionMatch) {
          const insertPos = content.indexOf(handleFunctionMatch[0]) + handleFunctionMatch[0].length;
          const editFunction = `
  
  // 编辑处理函数
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      // 处理日期字段
      ...(record.date && { date: dayjs(record.date) }),
      ...(record.startDate && { startDate: dayjs(record.startDate) }),
      ...(record.endDate && { endDate: dayjs(record.endDate) }),
      ...(record.planDate && { planDate: dayjs(record.planDate) }),
      ...(record.inspectionDate && { inspectionDate: dayjs(record.inspectionDate) })
    });
    setModalVisible(true);
  };`;
          
          content = content.slice(0, insertPos) + editFunction + content.slice(insertPos);
          modified = true;
        }
      }
    }
    
    // 4. 添加数据更新逻辑
    if (component.issues.includes('缺少数据更新逻辑')) {
      // 查找handleSubmit函数并修改
      const submitFunctionMatch = content.match(/const\s+handleSubmit\s*=\s*async\s*\([^)]*\)\s*=>\s*{/);
      if (submitFunctionMatch) {
        // 查找函数体结束位置
        let braceCount = 1;
        let pos = content.indexOf(submitFunctionMatch[0]) + submitFunctionMatch[0].length;
        let functionEnd = pos;
        
        while (braceCount > 0 && pos < content.length) {
          if (content[pos] === '{') braceCount++;
          if (content[pos] === '}') braceCount--;
          if (braceCount === 0) functionEnd = pos;
          pos++;
        }
        
        // 查找数据状态变量名
        const stateMatch = content.match(/const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState/);
        if (stateMatch) {
          const dataVar = stateMatch[1];
          const setDataVar = 'set' + stateMatch[2];
          
          const updateLogic = `
      
      // 处理日期格式
      const submitData = {
        ...values,
        ...(values.date && { date: values.date.format ? values.date.format('YYYY-MM-DD') : values.date }),
        ...(values.startDate && { startDate: values.startDate.format ? values.startDate.format('YYYY-MM-DD') : values.startDate }),
        ...(values.endDate && { endDate: values.endDate.format ? values.endDate.format('YYYY-MM-DD') : values.endDate }),
        ...(values.planDate && { planDate: values.planDate.format ? values.planDate.format('YYYY-MM-DD') : values.planDate }),
        ...(values.inspectionDate && { inspectionDate: values.inspectionDate.format ? values.inspectionDate.format('YYYY-MM-DD') : values.inspectionDate })
      };
      
      if (editingRecord) {
        // 编辑模式 - 更新现有记录
        ${setDataVar}(prevData => 
          prevData.map(item => 
            item.key === editingRecord.key 
              ? { ...item, ...submitData }
              : item
          )
        );
        message.success(\`记录更新成功！\`);
      } else {
        // 新增模式 - 添加新记录
        const newRecord = {
          key: submitData.id || submitData.code || \`\${Date.now()}\`,
          ...submitData
        };
        ${setDataVar}(prevData => [...prevData, newRecord]);
        message.success(\`记录创建成功！\`);
      }
      
      // 关闭模态框并重置状态
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();`;
          
          // 在函数结束前插入更新逻辑
          const beforeEnd = content.lastIndexOf('} catch', functionEnd);
          if (beforeEnd > 0) {
            content = content.slice(0, beforeEnd) + updateLogic + '\n      ' + content.slice(beforeEnd);
          } else {
            // 如果没有try-catch，在函数结束前插入
            content = content.slice(0, functionEnd) + updateLogic + '\n    ' + content.slice(functionEnd);
          }
          modified = true;
        }
      }
    }
    
    // 5. 添加表单数据填充
    if (component.issues.includes('缺少表单数据填充')) {
      // 这个已经在handleEdit函数中处理了
    }
    
    // 6. 添加模态框控制
    if (component.issues.includes('缺少模态框控制')) {
      if (!content.includes('setModalVisible') && !content.includes('setVisible')) {
        // 在useState后添加模态框状态
        const useStateMatch = content.match(/const\s+\[.*?\]\s*=\s*useState\([^)]*\);/);
        if (useStateMatch) {
          const insertPos = content.indexOf(useStateMatch[0]) + useStateMatch[0].length;
          content = content.slice(0, insertPos) + 
            '\n  const [modalVisible, setModalVisible] = useState(false);' +
            content.slice(insertPos);
          modified = true;
        }
      }
    }
    
    // 7. 确保导入dayjs（如果需要处理日期）
    if (modified && content.includes('dayjs(') && !content.includes("import dayjs from 'dayjs'")) {
      const importMatch = content.match(/import.*from\s+['"][^'"]+['"];/);
      if (importMatch) {
        const lastImport = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, lastImport) + 
          "\nimport dayjs from 'dayjs';" +
          content.slice(lastImport);
      }
    }
    
    // 8. 更新模态框标题为动态
    if (modified && content.includes('editingRecord')) {
      content = content.replace(
        /title="([^"]+)"/g,
        'title={editingRecord ? "编辑$1" : "新增$1"}'
      );
    }
    
    // 9. 更新模态框onCancel处理
    if (modified && content.includes('onCancel={() => {')) {
      content = content.replace(
        /onCancel={\(\) => {\s*setModalVisible\(false\);\s*form\.resetFields\(\);\s*}}/g,
        `onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}`
      );
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ 修复完成`);
      fixedCount++;
    } else {
      console.log(`  ⚠️  无需修复或修复失败`);
    }
    
  } catch (error) {
    console.log(`  ❌ 修复失败: ${error.message}`);
    errorCount++;
  }
  
  console.log('');
});

console.log('\n📊 修复结果统计:');
console.log(`✅ 成功修复: ${fixedCount} 个组件`);
console.log(`❌ 修复失败: ${errorCount} 个组件`);
console.log(`📋 总计处理: ${fixList.length} 个组件`);

if (fixedCount > 0) {
  console.log('\n🎉 批量修复完成！');
  console.log('\n💡 修复内容包括:');
  console.log('1. ✅ 添加状态管理 - 将静态数据转换为React状态');
  console.log('2. ✅ 添加编辑状态跟踪 - editingRecord状态管理');
  console.log('3. ✅ 实现handleEdit函数 - 设置编辑状态和表单数据');
  console.log('4. ✅ 实现数据更新逻辑 - 支持新增和编辑模式');
  console.log('5. ✅ 添加表单数据填充 - form.setFieldsValue');
  console.log('6. ✅ 添加模态框控制 - modalVisible状态');
  console.log('7. ✅ 日期字段处理 - dayjs格式转换');
  console.log('8. ✅ 动态模态框标题 - 区分新增/编辑');
  
  console.log('\n🚀 下一步操作:');
  console.log('1. 重启开发服务器: npm start');
  console.log('2. 测试各模块的编辑功能');
  console.log('3. 运行验证脚本: node scripts/verify-edit-buttons.js');
} else {
  console.log('\n⚠️  没有组件被修复，请检查修复逻辑');
}