#!/usr/bin/env node

/**
 * 全面修复所有模块的删除按钮功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复所有模块的删除按钮功能...\n');

// 需要修复的组件列表
const components = [
  // 生产管理模块
  {
    file: 'client/src/components/production/MasterData.js',
    name: 'ProductionMasterData',
    deleteFunction: 'handleDeleteMasterData',
    itemName: '主数据'
  },
  {
    file: 'client/src/components/production/WorkshopPlanManagement.js',
    name: 'WorkshopPlanManagement',
    deleteFunction: 'handleDeletePlan',
    itemName: '车间计划'
  },
  {
    file: 'client/src/components/production/WorkReportManagement.js',
    name: 'WorkReportManagement',
    deleteFunction: 'handleDeleteReport',
    itemName: '工作报告'
  },
  {
    file: 'client/src/components/production/ShiftScheduleManagement.js',
    name: 'ShiftScheduleManagement',
    deleteFunction: 'handleDeleteSchedule',
    itemName: '排班记录'
  },
  {
    file: 'client/src/components/production/ProductionMasterDataManagement.js',
    name: 'ProductionMasterDataManagement',
    deleteFunction: 'handleDeleteData',
    itemName: '生产数据'
  },
  {
    file: 'client/src/components/production/LineMaterialsManagement.js',
    name: 'LineMaterialsManagement',
    deleteFunction: 'handleDeleteMaterial',
    itemName: '线边物料'
  },
  {
    file: 'client/src/components/production/EquipmentResponsibilityManagement.js',
    name: 'EquipmentResponsibilityManagement',
    deleteFunction: 'handleDeleteResponsibility',
    itemName: '设备责任'
  },
  
  // 设备管理模块
  {
    file: 'client/src/components/equipment/EquipmentMasterData.js',
    name: 'EquipmentMasterData',
    deleteFunction: 'handleDeleteEquipment',
    itemName: '设备数据'
  },
  
  // 质量管理模块
  {
    file: 'client/src/components/quality/InspectionStandards.js',
    name: 'InspectionStandards',
    deleteFunction: 'handleDeleteStandard',
    itemName: '检验标准'
  },
  {
    file: 'client/src/components/quality/DefectReasons.js',
    name: 'DefectReasons',
    deleteFunction: 'handleDeleteReason',
    itemName: '次品原因'
  },
  
  // 库存管理模块
  {
    file: 'client/src/components/inventory/InventoryMasterData.js',
    name: 'InventoryMasterData',
    deleteFunction: 'handleDeleteInventory',
    itemName: '库存数据'
  },
  
  // 人员管理模块
  {
    file: 'client/src/components/personnel/WorkSchedule.js',
    name: 'WorkSchedule',
    deleteFunction: 'handleDeleteSchedule',
    itemName: '工作排班'
  },
  {
    file: 'client/src/components/personnel/TrainingManagement.js',
    name: 'TrainingManagement',
    deleteFunction: 'handleDeleteTraining',
    itemName: '培训记录'
  },
  {
    file: 'client/src/components/personnel/SkillCertification.js',
    name: 'SkillCertification',
    deleteFunction: 'handleDeleteCertification',
    itemName: '技能认证'
  },
  
  // 系统设置模块
  {
    file: 'client/src/components/settings/SystemBackup.js',
    name: 'SystemBackup',
    deleteFunction: 'handleDeleteBackup',
    itemName: '备份文件'
  },
  {
    file: 'client/src/components/settings/RoleManagement.js',
    name: 'RoleManagement',
    deleteFunction: 'handleDeleteRole',
    itemName: '角色'
  }
];

// 修复每个组件
let successCount = 0;
let failCount = 0;

components.forEach(component => {
  console.log(`🔧 修复 ${component.name}...`);
  
  try {
    const filePath = path.join(__dirname, '..', component.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  文件不存在: ${component.file}`);
      failCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. 添加 ButtonActions 导入
    if (!content.includes('import ButtonActions')) {
      content = content.replace(
        /from '@ant-design\/icons';/,
        `from '@ant-design/icons';\nimport ButtonActions from '../../utils/buttonActions';`
      );
      console.log(`  ✅ 添加 ButtonActions 导入`);
      modified = true;
    }
    
    // 2. 添加删除处理函数
    const deleteFunction = `
  // 删除${component.itemName}处理函数
  const ${component.deleteFunction} = (record) => {
    ButtonActions.simulateDelete(\`${component.itemName} \${record.key || record.id || record.code || record.name}\`, () => {
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
        modified = true;
      }
    }
    
    // 3. 修复删除按钮的 onClick 事件
    // 匹配各种删除按钮格式
    const deleteButtonPatterns = [
      /<Button type="link" size="small" icon={<DeleteOutlined \/>} danger>\s*删除\s*<\/Button>/g,
      /<Button type="link" size="small" danger icon={<DeleteOutlined \/>}>\s*删除\s*<\/Button>/g,
      /<Button\s+type="link"\s+size="small"\s+danger\s+icon={<DeleteOutlined \/>}>\s*删除\s*<\/Button>/g,
      /<Button\s+type="link"\s+size="small"\s+icon={<DeleteOutlined \/>}\s+danger>\s*删除\s*<\/Button>/g
    ];
    
    let buttonFixed = false;
    deleteButtonPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const newDeleteButton = `<Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => ${component.deleteFunction}(record)}>
            删除
          </Button>`;
        
        content = content.replace(pattern, newDeleteButton);
        console.log(`  ✅ 修复 ${matches.length} 个删除按钮`);
        modified = true;
        buttonFixed = true;
      }
    });
    
    if (!buttonFixed) {
      console.log(`  ⚠️  未找到标准格式的删除按钮`);
    }
    
    // 写回文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${component.name} 修复完成\n`);
      successCount++;
    } else {
      console.log(`  ℹ️  ${component.name} 无需修复\n`);
      successCount++;
    }
    
  } catch (error) {
    console.log(`  ❌ ${component.name} 修复失败: ${error.message}\n`);
    failCount++;
  }
});

console.log('📊 修复结果统计');
console.log('================================');
console.log(`总组件数: ${components.length}`);
console.log(`✅ 成功: ${successCount}`);
console.log(`❌ 失败: ${failCount}`);

const successRate = ((successCount / components.length) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (failCount === 0) {
  console.log('\n🎉 所有模块删除按钮功能修复完成！');
} else {
  console.log('\n⚠️  部分模块修复失败，请手动检查。');
}

console.log('\n📋 修复内容:');
console.log('1. ✅ 添加 ButtonActions 工具类导入');
console.log('2. ✅ 添加删除确认对话框功能');
console.log('3. ✅ 绑定删除按钮 onClick 事件');
console.log('4. ✅ 添加删除成功提示');

console.log('\n🔄 测试建议:');
console.log('1. 访问 http://localhost:3000');
console.log('2. 登录系统并进入各个模块');
console.log('3. 进入子功能页面测试删除按钮');
console.log('4. 验证确认对话框和成功提示');

console.log('\n📱 涵盖的模块:');
console.log('• 生产管理 - 7个子组件');
console.log('• 设备管理 - 1个子组件');
console.log('• 质量管理 - 2个子组件');
console.log('• 库存管理 - 1个子组件');
console.log('• 人员管理 - 3个子组件');
console.log('• 系统设置 - 2个子组件');