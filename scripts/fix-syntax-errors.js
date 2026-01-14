#!/usr/bin/env node

/**
 * 修复编辑按钮批量修复后的语法错误
 * 主要修复useState数组声明中缺少逗号的问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复语法错误...\n');

// 需要修复的文件列表（从错误信息中提取）
const filesToFix = [
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/equipment/EquipmentInspection.js',
  'client/src/components/equipment/EquipmentMaintenance.js',
  'client/src/components/equipment/EquipmentMasterData.js',
  'client/src/components/equipment/EquipmentRepair.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/inventory/InventoryMasterData.js',
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/personnel/EmployeeManagement.js',
  'client/src/components/personnel/DepartmentManagement.js',
  'client/src/components/personnel/PerformanceManagement.js',
  'client/src/components/personnel/SkillCertification.js',
  'client/src/components/personnel/TrainingManagement.js',
  'client/src/components/personnel/WorkSchedule.js',
  'client/src/components/process/ProcessChangeControl.js',
  'client/src/components/process/ProcessDocuments.js',
  'client/src/components/process/ProcessMasterData.js',
  'client/src/components/process/ProcessOptimization.js',
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/process/ProcessSOP.js',
  'client/src/components/process/ProcessValidation.js',
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/UserManagement.js',
  'client/src/components/integration/DataMapping.js',
  'client/src/components/integration/InterfaceManagement.js',
  'client/src/components/integration/SystemConfiguration.js'
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach((filePath, index) => {
  console.log(`🔧 修复文件 ${index + 1}/${filesToFix.length}: ${path.basename(filePath)}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ 文件不存在: ${filePath}`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 修复1: useState数组声明中缺少逗号的问题
    // 查找模式: } > 数字 | ];
    const patterns = [
      // 修复对象结尾缺少逗号的问题
      /(\s+}\s*>\s*\n\s*\];)/g,
      /(\s+}\s*>\s*\d+\s*\|?\s*\];)/g,
      /(\s+}\)\)\s*>\s*\n\s*\];)/g,
      /(\s+}\)\)\s*>\s*\d+\s*\|?\s*\];)/g
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          return match.replace('>', '');
        });
        modified = true;
      }
    });
    
    // 修复2: 处理useState数组中的语法问题
    // 查找并修复 const [data, setData] = useState([ ... } ]; 模式
    const useStateArrayPattern = /const\s+\[([^,]+),\s*([^\]]+)\]\s*=\s*useState\(\[\s*([\s\S]*?)\s*\]\s*\);/g;
    content = content.replace(useStateArrayPattern, (match, dataVar, setDataVar, arrayContent) => {
      // 清理数组内容中的语法错误
      let cleanedContent = arrayContent
        .replace(/}\s*>\s*\n/g, '},\n')  // 修复对象结尾
        .replace(/}\s*>\s*\d+\s*\|?/g, '}')  // 移除多余的符号
        .replace(/}\)\)\s*>\s*\n/g, '})),\n')  // 修复map结尾
        .replace(/}\)\)\s*>\s*\d+\s*\|?/g, '}))');  // 修复map结尾
      
      return `const [${dataVar}, ${setDataVar}] = useState([\n${cleanedContent}\n]);`;
    });
    
    // 修复3: 处理常规数组声明中的语法问题
    const arrayPattern = /const\s+(\w+)\s*=\s*\[\s*([\s\S]*?)\s*\];/g;
    content = content.replace(arrayPattern, (match, varName, arrayContent) => {
      // 跳过已经是useState的数组
      if (match.includes('useState')) {
        return match;
      }
      
      // 清理数组内容
      let cleanedContent = arrayContent
        .replace(/}\s*>\s*\n/g, '},\n')
        .replace(/}\s*>\s*\d+\s*\|?/g, '}')
        .replace(/}\)\)\s*>\s*\n/g, '})),\n')
        .replace(/}\)\)\s*>\s*\d+\s*\|?/g, '}))');
      
      return `const ${varName} = [\n${cleanedContent}\n];`;
    });
    
    // 修复4: 清理多余的符号和格式问题
    content = content
      .replace(/\s*>\s*\n\s*\];/g, '\n  ];')  // 清理数组结尾
      .replace(/\s*>\s*\d+\s*\|\s*\];/g, '\n  ];')  // 清理带数字的数组结尾
      .replace(/,\s*,/g, ',')  // 移除重复逗号
      .replace(/,\s*\]/g, '\n  ]');  // 清理数组结尾逗号
    
    if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ 修复完成`);
      fixedCount++;
    } else {
      console.log(`  ⚠️  无需修复`);
    }
    
  } catch (error) {
    console.log(`  ❌ 修复失败: ${error.message}`);
    errorCount++;
  }
});

console.log('\n📊 修复结果统计:');
console.log(`✅ 成功修复: ${fixedCount} 个文件`);
console.log(`❌ 修复失败: ${errorCount} 个文件`);
console.log(`📋 总计处理: ${filesToFix.length} 个文件`);

// 验证修复结果
console.log('\n🔍 验证修复结果...');
let syntaxErrors = 0;

filesToFix.forEach(filePath => {
  try {
    require('child_process').execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
  } catch (error) {
    console.log(`❌ 语法错误: ${path.basename(filePath)}`);
    syntaxErrors++;
  }
});

if (syntaxErrors === 0) {
  console.log('✅ 所有文件语法检查通过！');
} else {
  console.log(`❌ 还有 ${syntaxErrors} 个文件存在语法错误`);
}

console.log('\n🚀 下一步操作:');
if (syntaxErrors === 0) {
  console.log('1. 重启开发服务器: npm start');
  console.log('2. 测试编辑功能是否正常工作');
  console.log('3. 运行完整验证: node scripts/verify-edit-buttons.js');
} else {
  console.log('1. 手动检查剩余语法错误');
  console.log('2. 修复后重新运行此脚本');
}