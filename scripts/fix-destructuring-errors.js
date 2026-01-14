#!/usr/bin/env node

/**
 * 修复React组件中statusMap/typeMap等解构赋值错误
 * 将 const { color, text } = statusMap[status]; 
 * 替换为 const statusInfo = statusMap[status] || { color: 'default', text: status || '未知' };
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'client/src/components/quality/PQCInspection.js',
  'client/src/components/quality/OQCInspection.js',
  'client/src/components/quality/IQCInspection.js',
  'client/src/components/quality/InspectionStandards.js',
  'client/src/components/quality/FQCInspection.js',
  'client/src/components/quality/DefectRecords.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/quality/BatchTracing.js',
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/production/WorkReportManagement.js',
  'client/src/components/production/WorkReport.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/ShiftSchedule.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ProductionExecutionManagement.js',
  'client/src/components/production/ProductionExecution.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/LineMaterials.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/DailyReportManagement.js',
  'client/src/components/inventory/SparePartsFlow.js',
  'client/src/components/inventory/SparePartsAlert.js'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复 statusMap 解构赋值
    const statusMapRegex = /const\s*{\s*color,\s*text\s*}\s*=\s*statusMap\[([^\]]+)\];/g;
    if (statusMapRegex.test(content)) {
      content = content.replace(statusMapRegex, (match, variable) => {
        modified = true;
        return `const statusInfo = statusMap[${variable}] || { color: 'default', text: ${variable} || '未知' };`;
      });
      
      // 替换对应的使用
      content = content.replace(/color={color}/g, 'color={statusInfo.color}');
      content = content.replace(/>{text}</g, '>{statusInfo.text}<');
      content = content.replace(/text={text}/g, 'text={statusInfo.text}');
    }

    // 修复 typeMap 解构赋值
    const typeMapRegex = /const\s*{\s*color,\s*text\s*}\s*=\s*typeMap\[([^\]]+)\];/g;
    if (typeMapRegex.test(content)) {
      content = content.replace(typeMapRegex, (match, variable) => {
        modified = true;
        return `const typeInfo = typeMap[${variable}] || { color: 'default', text: ${variable} || '未知' };`;
      });
      
      // 替换对应的使用
      content = content.replace(/color={color}/g, 'color={typeInfo.color}');
      content = content.replace(/>{text}</g, '>{typeInfo.text}<');
      content = content.replace(/text={text}/g, 'text={typeInfo.text}');
    }

    // 修复 resultMap 解构赋值
    const resultMapRegex = /const\s*{\s*color,\s*text\s*}\s*=\s*resultMap\[([^\]]+)\];/g;
    if (resultMapRegex.test(content)) {
      content = content.replace(resultMapRegex, (match, variable) => {
        modified = true;
        return `const resultInfo = resultMap[${variable}] || { color: 'default', text: ${variable} || '未知' };`;
      });
      
      // 替换对应的使用
      content = content.replace(/color={color}/g, 'color={resultInfo.color}');
      content = content.replace(/>{text}</g, '>{resultInfo.text}<');
      content = content.replace(/text={text}/g, 'text={resultInfo.text}');
    }

    // 修复 severityMap 解构赋值
    const severityMapRegex = /const\s*{\s*color,\s*text\s*}\s*=\s*severityMap\[([^\]]+)\];/g;
    if (severityMapRegex.test(content)) {
      content = content.replace(severityMapRegex, (match, variable) => {
        modified = true;
        return `const severityInfo = severityMap[${variable}] || { color: 'default', text: ${variable} || '未知' };`;
      });
      
      // 替换对应的使用
      content = content.replace(/color={color}/g, 'color={severityInfo.color}');
      content = content.replace(/>{text}</g, '>{severityInfo.text}<');
      content = content.replace(/text={text}/g, 'text={severityInfo.text}');
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复完成: ${filePath}`);
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

console.log('开始批量修复解构赋值错误...\n');

filesToFix.forEach(filePath => {
  fixFile(filePath);
});

console.log('\n批量修复完成！');