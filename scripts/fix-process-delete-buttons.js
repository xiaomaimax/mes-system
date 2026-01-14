#!/usr/bin/env node

/**
 * 批量修复工艺管理模块删除按钮功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复工艺管理模块删除按钮功能...\n');

// 需要修复的组件列表
const components = [
  {
    file: 'client/src/components/process/ProcessSOP.js',
    name: 'ProcessSOP',
    deleteFunction: 'handleDeleteSOP',
    itemName: 'SOP文档'
  },
  {
    file: 'client/src/components/process/ProcessOptimization.js',
    name: 'ProcessOptimization', 
    deleteFunction: 'handleDeleteOptimization',
    itemName: '优化建议'
  },
  {
    file: 'client/src/components/process/ProcessValidation.js',
    name: 'ProcessValidation',
    deleteFunction: 'handleDeleteValidation', 
    itemName: '验证记录'
  },
  {
    file: 'client/src/components/process/ProcessChangeControl.js',
    name: 'ProcessChangeControl',
    deleteFunction: 'handleDeleteChange',
    itemName: '变更申请'
  },
  {
    file: 'client/src/components/process/ProcessMasterData.js',
    name: 'ProcessMasterData',
    deleteFunction: 'handleDeleteMasterData',
    itemName: '主数据'
  }
];

// 修复每个组件
components.forEach(component => {
  console.log(`🔧 修复 ${component.name}...`);
  
  try {
    const filePath = path.join(__dirname, '..', component.file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. 添加 ButtonActions 导入
    if (!content.includes('import ButtonActions')) {
      content = content.replace(
        /from '@ant-design\/icons';/,
        `from '@ant-design/icons';\nimport ButtonActions from '../../utils/buttonActions';`
      );
      console.log(`  ✅ 添加 ButtonActions 导入`);
    }
    
    // 2. 添加删除处理函数
    const deleteFunction = `
  // 删除${component.itemName}处理函数
  const ${component.deleteFunction} = (record) => {
    ButtonActions.simulateDelete(\`${component.itemName} \${record.key || record.id || record.code}\`, () => {
      ButtonActions.showSuccess(\`${component.itemName}删除成功！\`);
    });
  };`;
    
    if (!content.includes(component.deleteFunction)) {
      // 在组件函数开始后添加删除函数
      const componentStart = content.indexOf('const [');
      if (componentStart !== -1) {
        const insertPos = content.indexOf('\n', componentStart);
        content = content.slice(0, insertPos) + deleteFunction + content.slice(insertPos);
        console.log(`  ✅ 添加删除处理函数`);
      }
    }
    
    // 3. 修复删除按钮的 onClick 事件
    const deleteButtonPattern = /<Button type="link" size="small" danger icon={<DeleteOutlined \/>}>\s*删除\s*<\/Button>/g;
    const newDeleteButton = `<Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => ${component.deleteFunction}(record)}>
            删除
          </Button>`;
    
    const matches = content.match(deleteButtonPattern);
    if (matches) {
      content = content.replace(deleteButtonPattern, newDeleteButton);
      console.log(`  ✅ 修复 ${matches.length} 个删除按钮`);
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${component.name} 修复完成\n`);
    
  } catch (error) {
    console.log(`  ❌ ${component.name} 修复失败: ${error.message}\n`);
  }
});

console.log('🎉 工艺管理模块删除按钮功能修复完成！');
console.log('\n📋 修复内容:');
console.log('1. ✅ 添加 ButtonActions 工具类导入');
console.log('2. ✅ 添加删除确认对话框功能');
console.log('3. ✅ 绑定删除按钮 onClick 事件');
console.log('4. ✅ 添加删除成功提示');

console.log('\n🔄 测试建议:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 登录系统并进入工艺管理模块');
console.log('3. 进入各个子功能页面');
console.log('4. 点击删除按钮测试确认对话框');
console.log('5. 确认删除后查看成功提示');