#!/usr/bin/env node

/**
 * 文档整理脚本
 * 将项目根目录下的零散文档移动到规范的docs目录结构中
 */

const fs = require('fs');
const path = require('path');

// 文档映射配置
const docMappings = {
  // 功能实现文档 -> 开发文档
  'INTEGRATION_MODULE_IMPLEMENTATION.md': 'docs/05-development/modules/integration-module.md',
  'PERSONNEL_MANAGEMENT_IMPLEMENTATION.md': 'docs/05-development/modules/personnel-module.md',
  'PROCESS_MANAGEMENT_IMPLEMENTATION.md': 'docs/05-development/modules/process-module.md',
  'SYSTEM_SETTINGS_IMPLEMENTATION.md': 'docs/05-development/modules/system-settings.md',
  'MESSAGE_PUSH_IMPLEMENTATION.md': 'docs/05-development/modules/message-push.md',
  
  // 功能测试文档 -> 测试文档
  'INTEGRATION_MODULE_TEST.md': 'docs/08-testing/integration-module-test.md',
  'INVENTORY_FUNCTIONALITY_TEST.md': 'docs/08-testing/inventory-functionality-test.md',
  'INVENTORY_IMPORT_TEST.md': 'docs/08-testing/inventory-import-test.md',
  'SYSTEM_SETTINGS_TEST_SUMMARY.md': 'docs/08-testing/system-settings-test.md',
  
  // 优化文档 -> 变更记录
  'BACKGROUND_COLOR_UNIFICATION.md': 'docs/07-changelog/ui-optimizations/background-color-unification.md',
  'TAB_FONT_UNIFICATION.md': 'docs/07-changelog/ui-optimizations/tab-font-unification.md',
  'REPORTS_MODULE_STANDARDIZATION.md': 'docs/07-changelog/ui-optimizations/reports-module-standardization.md',
  'SIDEBAR_NAVIGATION_OPTIMIZATION.md': 'docs/07-changelog/ui-optimizations/sidebar-navigation-optimization.md',
  
  // 功能总结文档 -> 用户指南
  'QUALITY_MANAGEMENT_SUMMARY.md': 'docs/04-user-guide/modules/quality-management.md',
  'EQUIPMENT_MANAGEMENT_SUMMARY.md': 'docs/04-user-guide/modules/equipment-management.md',
  'INVENTORY_FEATURE_SUMMARY.md': 'docs/04-user-guide/modules/inventory-management.md',
  'PRODUCTION_MASTER_DATA_SUMMARY.md': 'docs/04-user-guide/modules/production-management.md',
  
  // 页面优化文档 -> 变更记录
  'HOMEPAGE_ENHANCEMENT.md': 'docs/07-changelog/feature-updates/homepage-enhancement.md',
  'HOMEPAGE_MODULES_UPDATE.md': 'docs/07-changelog/feature-updates/homepage-modules-update.md',
  'HOMEPAGE_OPTIMIZATION_SUMMARY.md': 'docs/07-changelog/feature-updates/homepage-optimization.md',
  
  // 报表相关文档 -> 用户指南
  'CUSTOM_REPORTS_IMPLEMENTATION.md': 'docs/04-user-guide/features/custom-reports.md',
  'REPORTS_MODULE_OPTIMIZATION.md': 'docs/07-changelog/feature-updates/reports-optimization.md',
  'REPORTS_CHART_FIX.md': 'docs/07-changelog/bug-fixes/reports-chart-fix.md',
  'REPORTS_UI_CLEANUP.md': 'docs/07-changelog/ui-optimizations/reports-ui-cleanup.md',
  
  // 库存相关文档 -> 用户指南
  'INVENTORY_MANAGEMENT_OPTIMIZATION.md': 'docs/07-changelog/feature-updates/inventory-optimization.md',
  'INVENTORY_INOUT_FIX.md': 'docs/07-changelog/bug-fixes/inventory-inout-fix.md',
  'INVENTORY_TESTING_CHECKLIST.md': 'docs/08-testing/inventory-testing-checklist.md',
  
  // 生产相关文档 -> 用户指南
  'PRODUCTION_OVERVIEW_OPTIMIZATION.md': 'docs/07-changelog/ui-optimizations/production-overview-optimization.md',
  'PRODUCTION_MENU_OPTIMIZATION.md': 'docs/07-changelog/ui-optimizations/production-menu-optimization.md',
  
  // 系统相关文档 -> 运维文档
  'SYSTEM_STARTUP_SUCCESS.md': 'docs/06-deployment/system-startup-guide.md',
  'SYSTEM_RESTART_SUMMARY.md': 'docs/06-deployment/system-restart-guide.md',
  
  // 错误修复文档 -> 变更记录
  'FORM_ERROR_FIX.md': 'docs/07-changelog/bug-fixes/form-error-fix.md',
  'SECURITY_SETTINGS_FIX.md': 'docs/07-changelog/bug-fixes/security-settings-fix.md',
  'SYSTEM_SETTINGS_FIX.md': 'docs/07-changelog/bug-fixes/system-settings-fix.md',
  
  // UI优化文档 -> 变更记录
  'TAB_FONT_SIZE_ADJUSTMENT.md': 'docs/07-changelog/ui-optimizations/tab-font-size-adjustment.md',
  'TAB_NAVIGATION_OPTIMIZATION.md': 'docs/07-changelog/ui-optimizations/tab-navigation-optimization.md',
  'DEPARTMENT_KPI_TOOLTIP.md': 'docs/07-changelog/ui-optimizations/department-kpi-tooltip.md',
  
  // 进度总结文档 -> 项目管理
  'TODAY_PROGRESS_SUMMARY.md': 'docs/09-project-management/daily-progress/2024-12-22.md',
};

// 创建目录的函数
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    console.log(`✅ 创建目录: ${dirname}`);
  }
}

// 移动文件的函数
function moveFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      ensureDirectoryExists(destination);
      
      // 读取源文件内容
      const content = fs.readFileSync(source, 'utf8');
      
      // 在文件开头添加迁移说明
      const migratedContent = `<!-- 此文档已从 ${source} 迁移 -->\n<!-- 迁移时间: ${new Date().toISOString()} -->\n\n${content}`;
      
      // 写入目标文件
      fs.writeFileSync(destination, migratedContent, 'utf8');
      
      // 删除源文件
      fs.unlinkSync(source);
      
      console.log(`📄 移动文档: ${source} -> ${destination}`);
      return true;
    } else {
      console.log(`⚠️  源文件不存在: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 移动文件失败: ${source} -> ${destination}`, error.message);
    return false;
  }
}

// 创建必要的目录结构
function createDirectoryStructure() {
  const directories = [
    'docs/04-user-guide/modules',
    'docs/04-user-guide/features',
    'docs/05-development/modules',
    'docs/06-deployment',
    'docs/07-changelog/feature-updates',
    'docs/07-changelog/bug-fixes',
    'docs/07-changelog/ui-optimizations',
    'docs/08-testing',
    'docs/09-project-management/daily-progress'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录: ${dir}`);
    }
  });
}

// 主函数
function main() {
  console.log('🚀 开始整理项目文档...\n');
  
  // 创建目录结构
  createDirectoryStructure();
  
  let movedCount = 0;
  let totalCount = Object.keys(docMappings).length;
  
  // 移动文档
  for (const [source, destination] of Object.entries(docMappings)) {
    if (moveFile(source, destination)) {
      movedCount++;
    }
  }
  
  console.log(`\n📊 文档整理完成:`);
  console.log(`   总计文档: ${totalCount}`);
  console.log(`   成功移动: ${movedCount}`);
  console.log(`   跳过文件: ${totalCount - movedCount}`);
  
  // 创建文档索引
  createDocumentIndex();
  
  console.log('\n✅ 文档整理完成！');
  console.log('📖 查看文档中心: docs/README.md');
}

// 创建文档索引
function createDocumentIndex() {
  const indexContent = `# 文档索引

本文档由脚本自动生成，记录了所有已整理的文档位置。

## 📁 目录结构

### 用户指南 (docs/04-user-guide/)
- 模块说明文档
- 功能使用指南
- 操作手册

### 开发文档 (docs/05-development/)
- 模块实现文档
- API接口文档
- 组件开发指南

### 部署运维 (docs/06-deployment/)
- 系统部署指南
- 启动配置说明
- 运维操作手册

### 变更记录 (docs/07-changelog/)
- 功能更新记录
- 错误修复记录
- UI优化记录

### 测试文档 (docs/08-testing/)
- 功能测试用例
- 测试检查清单
- 测试报告

### 项目管理 (docs/09-project-management/)
- 日常进度记录
- 项目里程碑
- 开发计划

## 📝 文档迁移记录

生成时间: ${new Date().toISOString()}
迁移文档数量: ${Object.keys(docMappings).length}

## 🔗 相关链接

- [项目概述](./01-project-overview/README.md)
- [快速开始](./02-installation/QUICK_START.md)
- [系统架构](./03-architecture/SYSTEM_ARCHITECTURE.md)
- [版本历史](./07-changelog/VERSION_HISTORY.md)
`;

  fs.writeFileSync('docs/DOCUMENT_INDEX.md', indexContent, 'utf8');
  console.log('📋 创建文档索引: docs/DOCUMENT_INDEX.md');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { moveFile, createDirectoryStructure };