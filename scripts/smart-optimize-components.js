#!/usr/bin/env node

/**
 * 智能优化组件脚本
 * 
 * 功能：
 * - 智能识别组件中的新增和删除按钮
 * - 为新增按钮添加UI反馈
 * - 为删除按钮添加Modal确认
 * - 添加数据刷新机制
 * - 添加FloatingProgress组件
 * 
 * 使用方法: node scripts/smart-optimize-components.js [component-path]
 */

const fs = require('fs');
const path = require('path');

// 需要优化的组件列表
const COMPONENTS_TO_OPTIMIZE = [
  'client/src/components/personnel/DepartmentManagement.js',
  'client/src/components/personnel/PerformanceManagement.js',
  'client/src/components/personnel/SkillCertification.js',
  'client/src/components/personnel/TrainingManagement.js',
  'client/src/components/personnel/WorkSchedule.js',
  'client/src/components/production/ProductionTasks.js',
  'client/src/components/production/WorkshopPlan.js',
  'client/src/components/equipment/EquipmentArchives.js',
  'client/src/components/quality/DefectRecords.js',
  'client/src/components/quality/QualityInspection.js',
  'client/src/components/inventory/InventoryCount.js',
  'client/src/components/inventory/InventoryTransfer.js',
  'client/src/components/process/ProcessChangeControl.js',
  'client/src/components/process/ProcessDocuments.js',
  'client/src/components/process/ProcessMasterData.js',
  'client/src/components/process/ProcessOptimization.js',
  'client/src/components/process/ProcessParameters.js',
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/process/ProcessSOP.js',
  'client/src/components/process/ProcessValidation.js',
  'client/src/components/scheduling/MoldManagement.js',
  'client/src/components/scheduling/PlanManagement.js',
  'client/src/components/scheduling/TaskManagement.js',
  'client/src/components/settings/DepartmentAccess.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/UserManagement.js'
];

// 需要添加Modal.confirm的删除按钮组件
const DELETE_BUTTON_COMPONENTS = [
  'client/src/components/personnel/SkillCertification.js',
  'client/src/components/personnel/TrainingManagement.js',
  'client/src/components/personnel/WorkSchedule.js',
  'client/src/components/production/EquipmentResponsibilityManagement.js',
  'client/src/components/production/LineMaterialsManagement.js',
  'client/src/components/production/MasterData.js',
  'client/src/components/production/ProductionMasterDataManagement.js',
  'client/src/components/production/ProductionTaskManagement.js',
  'client/src/components/production/ShiftScheduleManagement.js',
  'client/src/components/production/WorkshopPlanManagement.js',
  'client/src/components/production/WorkshopPlanManagementSafe.js',
  'client/src/components/quality/DefectReasons.js',
  'client/src/components/inventory/ExternalSpareParts.js',
  'client/src/components/inventory/InventoryMasterData.js',
  'client/src/components/inventory/InventoryMasterData.test.js',
  'client/src/components/inventory/InventoryInOut.test.js',
  'client/src/components/process/ProcessChangeControl.js',
  'client/src/components/process/ProcessDocuments.js',
  'client/src/components/process/ProcessMasterData.js',
  'client/src/components/process/ProcessOptimization.js',
  'client/src/components/process/ProcessParameters.js',
  'client/src/components/process/ProcessRouting.js',
  'client/src/components/process/ProcessSOP.js',
  'client/src/components/process/ProcessValidation.js',
  'client/src/components/scheduling/PlanManagement.js',
  'client/src/components/scheduling/TaskManagement.js',
  'client/src/components/settings/RoleManagement.js',
  'client/src/components/settings/SystemBackup.js'
];

const logs = [];
const errors = [];

function log(message) {
  console.log(message);
  logs.push(message);
}

function logError(message) {
  console.error(message);
  errors.push(message);
}

/**
 * 检查是否需要优化
 */
function needsOptimization(content, filePath) {
  const hasUIFeedback = content.includes('useUIFeedback');
  const hasFloatingProgress = content.includes('FloatingProgress');
  const hasModalConfirm = content.includes('Modal.confirm');
  
  const needsAddButtonOptimization = COMPONENTS_TO_OPTIMIZE.includes(filePath) && !hasUIFeedback;
  const needsDeleteButtonOptimization = DELETE_BUTTON_COMPONENTS.includes(filePath) && !hasModalConfirm;
  
  return needsAddButtonOptimization || needsDeleteButtonOptimization;
}

/**
 * 添加必要的导入
 */
function ensureImports(content, filePath) {
  const needsUIFeedback = COMPONENTS_TO_OPTIMIZE.includes(filePath);
  const needsModalConfirm = DELETE_BUTTON_COMPONENTS.includes(filePath);
  
  let modified = content;
  
  // 添加useUIFeedback导入
  if (needsUIFeedback && !content.includes('useUIFeedback')) {
    const importLine = "import useUIFeedback, { OPERATION_TYPES } from '../../hooks/useUIFeedback';";
    if (!content.includes(importLine)) {
      // 在最后一个import之后添加
      const lastImportMatch = content.match(/^import\s+.*?from\s+['"].*?['"];?$/m);
      if (lastImportMatch) {
        const insertPos = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        modified = modified.slice(0, insertPos) + '\n' + importLine + modified.slice(insertPos);
      }
    }
  }
  
  // 添加FloatingProgress导入
  if (needsUIFeedback && !content.includes('FloatingProgress')) {
    const importLine = "import { FloatingProgress, PROGRESS_STATUS } from '../common/ProgressIndicator';";
    if (!modified.includes(importLine)) {
      const lastImportMatch = modified.match(/^import\s+.*?from\s+['"].*?['"];?$/m);
      if (lastImportMatch) {
        const insertPos = modified.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        modified = modified.slice(0, insertPos) + '\n' + importLine + modified.slice(insertPos);
      }
    }
  }
  
  return modified;
}

/**
 * 添加uiFeedback初始化
 */
function ensureUIFeedbackInit(content, filePath) {
  if (!COMPONENTS_TO_OPTIMIZE.includes(filePath)) {
    return content;
  }
  
  if (content.includes('const uiFeedback = useUIFeedback')) {
    return content;
  }
  
  // 找到第一个useState
  const stateMatch = content.match(/const\s+\[\w+,\s*\w+\]\s*=\s*useState\(/);
  if (!stateMatch) {
    return content;
  }
  
  const insertPos = stateMatch.index + stateMatch[0].length - 1;
  const uiFeedbackCode = `

  // UI反馈状态管理
  const uiFeedback = useUIFeedback({
    autoHideSuccess: true,
    autoHideError: false,
    showMessages: true,
    trackProgress: true,
    trackDataSource: true
  });`;
  
  return content.slice(0, insertPos) + uiFeedbackCode + content.slice(insertPos);
}

/**
 * 为删除操作添加Modal.confirm
 */
function addModalConfirmToDelete(content, filePath) {
  if (!DELETE_BUTTON_COMPONENTS.includes(filePath)) {
    return content;
  }
  
  if (content.includes('Modal.confirm')) {
    return content;
  }
  
  // 查找handleDelete函数
  const deleteMatch = content.match(/const\s+handleDelete\s*=\s*\(([^)]*)\)\s*=>\s*\{/);
  if (!deleteMatch) {
    return content;
  }
  
  const recordParam = deleteMatch[1].trim();
  const insertPos = deleteMatch.index + deleteMatch[0].length;
  
  const modalCode = `
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 实现删除逻辑
          // await uiFeedback.executeAsync(
          //   async () => {
          //     const result = await DataService.deleteXXX(${recordParam}.id);
          //     if (result.success) {
          //       DataService.clearCache('xxx');
          //       await refetch();
          //       return result;
          //     } else {
          //       throw new Error(result.message || '删除失败');
          //     }
          //   },
          //   OPERATION_TYPES.DELETE,
          //   '正在删除...',
          //   '删除成功',
          //   '删除失败'
          // );
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
    });
  `;
  
  return content.slice(0, insertPos) + modalCode + content.slice(insertPos);
}

/**
 * 添加FloatingProgress组件
 */
function addFloatingProgress(content, filePath) {
  if (!COMPONENTS_TO_OPTIMIZE.includes(filePath)) {
    return content;
  }
  
  if (content.includes('<FloatingProgress')) {
    return content;
  }
  
  // 在return语句之前添加
  const returnMatch = content.match(/return\s*\(/);
  if (!returnMatch) {
    return content;
  }
  
  const floatingProgressCode = `{/* 浮动进度提示 */}
      <FloatingProgress
        visible={uiFeedback.isSaving || uiFeedback.isLoading || uiFeedback.isSuccess || uiFeedback.isError}
        operation={uiFeedback.operation}
        progress={uiFeedback.progress}
        status={uiFeedback.isError ? PROGRESS_STATUS.ERROR : 
                uiFeedback.isSuccess ? PROGRESS_STATUS.SUCCESS :
                PROGRESS_STATUS.RUNNING}
        message={uiFeedback.message}
        position="topRight"
        autoHide={true}
        hideDelay={2000}
      />

      `;
  
  const insertPos = returnMatch.index;
  return content.slice(0, insertPos) + floatingProgressCode + content.slice(insertPos);
}

/**
 * 优化单个组件
 */
function optimizeComponent(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      logError(`❌ 文件不存在: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    if (!needsOptimization(content, filePath)) {
      log(`⏭️  已优化或无需优化: ${filePath}`);
      return true;
    }
    
    // 应用优化
    content = ensureImports(content, filePath);
    content = ensureUIFeedbackInit(content, filePath);
    content = addModalConfirmToDelete(content, filePath);
    content = addFloatingProgress(content, filePath);
    
    // 写入文件
    fs.writeFileSync(fullPath, content, 'utf-8');
    log(`✅ 优化完成: ${filePath}`);
    return true;
    
  } catch (error) {
    logError(`❌ 优化失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  log('🚀 开始智能优化组件...\n');
  
  const allComponents = new Set([...COMPONENTS_TO_OPTIMIZE, ...DELETE_BUTTON_COMPONENTS]);
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const componentPath of allComponents) {
    if (optimizeComponent(componentPath)) {
      const fullPath = path.join(__dirname, '..', componentPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('useUIFeedback') || content.includes('Modal.confirm')) {
        successCount++;
      } else {
        skipCount++;
      }
    } else {
      errorCount++;
    }
  }
  
  log('\n📊 优化统计:');
  log(`✅ 成功优化: ${successCount} 个组件`);
  log(`⏭️  已优化: ${skipCount} 个组件`);
  log(`❌ 失败: ${errorCount} 个组件`);
  
  // 保存日志
  const logContent = `# 智能优化日志 - ${new Date().toISOString()}

## 统计
- 成功优化: ${successCount}
- 已优化: ${skipCount}
- 失败: ${errorCount}

## 详细日志
${logs.join('\n')}

## 错误日志
${errors.length > 0 ? errors.join('\n') : '无错误'}
`;
  
  const logPath = path.join(__dirname, '..', 'dev_log', `smart-optimize-log-${Date.now()}.md`);
  fs.writeFileSync(logPath, logContent, 'utf-8');
  log(`\n📝 日志已保存: ${logPath}`);
}

main();
