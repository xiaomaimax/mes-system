const fs = require('fs');
const path = require('path');

/**
 * 紧急修复语法错误 - 主要是数组定义中缺少逗号的问题
 */

console.log('🚨 紧急修复语法错误...\n');

// 需要修复的文件列表（从错误信息中提取）
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
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/UserManagement.js'
];

function fixSyntaxErrors(content) {
  let modified = false;
  
  // 修复数组定义中缺少逗号的问题
  // 模式1: } > 换行 ];
  content = content.replace(/}\s*>\s*\n\s*\];/g, (match) => {
    modified = true;
    return match.replace('>', ',');
  });
  
  // 模式2: } > 换行 空格 ];
  content = content.replace(/}\s*>\s*\n\s+\];/g, (match) => {
    modified = true;
    return match.replace('>', ',');
  });
  
  // 模式3: 处理其他可能的语法错误
  content = content.replace(/}\s*>\s*$/gm, (match) => {
    modified = true;
    return match.replace('>', ',');
  });
  
  // 修复 ProcessParameters.js 中的特殊错误
  if (content.includes('} catch (error) {') && content.includes('message.error(\'保存失败\');')) {
    content = content.replace(
      /message\.error\('保存失败'\);\s*}\s*>\s*} catch \(error\) {/,
      "message.error('保存失败');\n    }\n  } catch (error) {"
    );
    modified = true;
  }
  
  return { content, modified };
}

let totalFixed = 0;

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 修复文件: ${path.basename(filePath)}`);

    const result = fixSyntaxErrors(content);
    
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
  }
  
  console.log('');
});

console.log(`🎉 语法错误修复完成！共修复 ${totalFixed} 个文件`);

// 特殊处理 ProcessParameters.js 的复杂语法错误
const processParametersPath = 'client/src/components/process/ProcessParameters.js';
if (fs.existsSync(processParametersPath)) {
  console.log('\n🔧 特殊处理 ProcessParameters.js...');
  
  try {
    let content = fs.readFileSync(processParametersPath, 'utf8');
    
    // 查找并修复复杂的语法错误
    if (content.includes('} catch (error) {') && content.includes('message.error(\'保存失败\');')) {
      // 修复错误的 try-catch 结构
      content = content.replace(
        /message\.error\('保存失败'\);\s*}\s*} catch \(error\) {/g,
        "message.error('保存失败');\n    }\n  } catch (error) {"
      );
      
      fs.writeFileSync(processParametersPath, content);
      console.log('  ✅ 修复 ProcessParameters.js 特殊语法错误');
    }
  } catch (error) {
    console.error('❌ ProcessParameters.js 修复失败:', error.message);
  }
}

console.log('\n🚀 建议下一步操作:');
console.log('1. 重新启动开发服务器');
console.log('2. 检查编译是否成功');
console.log('3. 测试编辑功能是否正常工作');