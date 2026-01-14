const fs = require('fs');
const path = require('path');

/**
 * 最终修复所有语法错误 - 处理所有缺少逗号的问题
 */

console.log('🚨 最终修复所有语法错误...\n');

// 从错误信息中提取的所有有问题的文件
const filesToFix = [
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentMasterData.js',
  'client/src/components/equipment/EquipmentRepair.js',
  'client/src/components/integration/DataMapping.js',
  'client/src/components/integration/InterfaceManagement.js',
  'client/src/components/integration/SystemConfiguration.js',
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/inventory/InventoryMasterData.js',
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
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/UserManagement.js'
];

function fixAllSyntaxErrors(content) {
  let modified = false;
  let originalContent = content;

  // 1. 修复数组定义中缺少逗号的问题 - 模式: } > 换行 ];
  content = content.replace(/}\s*>\s*\n\s*\];/g, (match) => {
    modified = true;
    return match.replace('>', ',');
  });

  // 2. 修复数组定义中缺少逗号的问题 - 模式: } > 换行 空格 ];
  content = content.replace(/}\s*>\s*\n\s+\];/g, (match) => {
    modified = true;
    return match.replace('>', ',');
  });

  // 3. 修复对象末尾缺少逗号 - 模式: } > 换行 }
  content = content.replace(/}\s*>\s*\n\s*}/g, (match) => {
    modified = true;
    return match.replace('>', ',');
  });

  // 4. 修复数组中对象缺少逗号 - 更通用的模式
  content = content.replace(/}\s*>\s*$/gm, (match) => {
    modified = true;
    return match.replace('>', ',');
  });

  // 5. 修复 ProcessParameters.js 中的特殊错误 - JSX 属性错误
  if (content.includes('<Tag color={status === \'生效\' ? \'green\' : \'red\'},')) {
    content = content.replace(
      /<Tag color={status === '生效' \? 'green' : 'red'},/g,
      "<Tag color={status === '生效' ? 'green' : 'red'}>"
    );
    modified = true;
  }

  // 6. 修复其他可能的JSX语法错误
  content = content.replace(/color={[^}]+},\s*$/gm, (match) => {
    if (match.includes('color=')) {
      modified = true;
      return match.replace(/,$/, '>');
    }
    return match;
  });

  // 7. 修复特殊的try-catch语法错误
  if (content.includes('} catch (error) {') && content.includes('message.error(\'保存失败\');')) {
    content = content.replace(
      /message\.error\('保存失败'\);\s*}\s*>\s*} catch \(error\) {/g,
      "message.error('保存失败');\n    }\n  } catch (error) {"
    );
    modified = true;
  }

  // 8. 修复数组中最后一个元素后的错误符号
  content = content.replace(/([^,\s])\s*>\s*\n\s*\]/g, (match, p1) => {
    modified = true;
    return p1 + '\n  ]';
  });

  // 9. 修复对象中最后一个属性后的错误符号
  content = content.replace(/([^,\s])\s*>\s*\n\s*}/g, (match, p1) => {
    modified = true;
    return p1 + '\n  }';
  });

  return { content, modified };
}

let totalFixed = 0;
let errorFiles = [];

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 修复文件: ${path.basename(filePath)}`);

    const result = fixAllSyntaxErrors(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log('  ✅ 修复语法错误');
      console.log('  💾 文件已保存');
      totalFixed++;
    } else {
      console.log('  ℹ️  无语法错误');
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
    errorFiles.push(filePath);
  }
  
  console.log('');
});

console.log(`🎉 语法错误修复完成！共修复 ${totalFixed} 个文件`);

if (errorFiles.length > 0) {
  console.log(`\n❌ 修复失败的文件 (${errorFiles.length}个):`);
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

// 特殊处理 ProcessParameters.js 的JSX语法错误
const processParametersPath = 'client/src/components/process/ProcessParameters.js';
if (fs.existsSync(processParametersPath)) {
  console.log('\n🔧 特殊处理 ProcessParameters.js JSX语法错误...');
  
  try {
    let content = fs.readFileSync(processParametersPath, 'utf8');
    let modified = false;
    
    // 修复JSX Tag属性语法错误
    if (content.includes('color={status === \'生效\' ? \'green\' : \'red\'},')) {
      content = content.replace(
        /color={status === '生效' \? 'green' : 'red'},/g,
        "color={status === '生效' ? 'green' : 'red'}>"
      );
      modified = true;
    }

    // 修复其他可能的JSX语法问题
    content = content.replace(
      /<Tag color={[^}]+},\s*\n/g,
      (match) => match.replace(',', '>')
    );

    if (modified) {
      fs.writeFileSync(processParametersPath, content);
      console.log('  ✅ 修复 ProcessParameters.js JSX语法错误');
    } else {
      console.log('  ℹ️  ProcessParameters.js 无JSX语法错误');
    }
  } catch (error) {
    console.error('❌ ProcessParameters.js 修复失败:', error.message);
  }
}

console.log('\n🚀 建议下一步操作:');
console.log('1. 重新启动开发服务器');
console.log('2. 检查编译是否成功');
console.log('3. 运行编辑功能检查脚本');
console.log('4. 测试编辑功能是否正常工作');

console.log('\n📋 如果还有语法错误，请检查:');
console.log('- 数组定义中是否有 } > 而不是 },');
console.log('- 对象定义中是否有 } > 而不是 },');
console.log('- JSX标签属性是否正确闭合');
console.log('- try-catch语句是否正确格式化');