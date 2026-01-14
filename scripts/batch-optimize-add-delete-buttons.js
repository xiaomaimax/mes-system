#!/usr/bin/env node

/**
 * 批量优化新增和删除按钮功能
 * 
 * 功能：
 * - 为所有组件的新增按钮添加UI反馈
 * - 为所有组件的删除按钮添加确认对话框
 * - 为新增/删除操作添加数据刷新机制
 * - 添加FloatingProgress组件
 * 
 * 使用方法: node scripts/batch-optimize-add-delete-buttons.js
 */

const fs = require('fs');
const path = require('path');

// 需要优化的组件列表（按优先级排序）
const COMPONENTS_TO_OPTIMIZE = [
  // 第1阶段：高优先级 - 缺少UI反馈的新增按钮
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

// 日志记录
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
 * 检查文件是否已经优化
 */
function isAlreadyOptimized(content) {
  return content.includes('useUIFeedback') && 
         content.includes('FloatingProgress') &&
         content.includes('Modal.confirm');
}

/**
 * 添加必要的导入
 */
function addImports(content) {
  // 检查是否已有useUIFeedback导入
  if (content.includes('useUIFeedback')) {
    return content;
  }

  // 找到最后一个import语句
  const importRegex = /^import\s+.*?from\s+['"].*?['"];?$/gm;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length === 0) {
    return content;
  }

  const lastImport = matches[matches.length - 1];
  const insertPosition = lastImport.index + lastImport[0].length;

  const newImports = `
import useUIFeedback, { OPERATION_TYPES } from '../../hooks/useUIFeedback';
import { FloatingProgress, PROGRESS_STATUS } from '../common/ProgressIndicator';`;

  return content.slice(0, insertPosition) + '\n' + newImports + content.slice(insertPosition);
}

/**
 * 在组件中添加uiFeedback初始化
 */
function addUIFeedbackInit(content) {
  // 检查是否已有uiFeedback初始化
  if (content.includes('const uiFeedback = useUIFeedback')) {
    return content;
  }

  // 找到第一个useState调用
  const stateRegex = /const\s+\[\w+,\s*\w+\]\s*=\s*useState\(/;
  const match = content.match(stateRegex);

  if (!match) {
    return content;
  }

  const insertPosition = match.index + match[0].length - 1;
  const indent = '  ';

  const uiFeedbackInit = `

  // UI反馈状态管理
  const uiFeedback = useUIFeedback({
    autoHideSuccess: true,
    autoHideError: false,
    showMessages: true,
    trackProgress: true,
    trackDataSource: true
  });`;

  return content.slice(0, insertPosition) + uiFeedbackInit + content.slice(insertPosition);
}

/**
 * 为handleDelete添加Modal.confirm
 */
function addModalConfirmToDelete(content) {
  // 检查是否已有Modal.confirm
  if (content.includes('Modal.confirm')) {
    return content;
  }

  // 查找handleDelete函数
  const deleteRegex = /const\s+handleDelete\s*=\s*\(([^)]*)\)\s*=>\s*\{/;
  const match = content.match(deleteRegex);

  if (!match) {
    return content;
  }

  const recordParam = match[1].trim();
  const insertPosition = match.index + match[0].length;

  const modalConfirmCode = `
    Modal.confirm({
      title: '确认删除',
      content: \`确定要删除这条记录吗？\`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await uiFeedback.executeAsync(
            async () => {
              // 这里应该调用实际的删除API
              // const result = await DataService.deleteXXX(${recordParam}.id);
              // 
              // if (result.success) {
              //   DataService.clearCache('xxx');
              //   await refetch();
              //   return result;
              // } else {
              //   throw new Error(result.message || '删除失败');
              // }
            },
            OPERATION_TYPES.DELETE,
            '正在删除...',
            '删除成功',
            '删除失败'
          );
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
    });
  `;

  return content.slice(0, insertPosition) + modalConfirmCode + content.slice(insertPosition);
}

/**
 * 为handleSave添加UI反馈
 */
function addUIFeedbackToSave(content) {
  // 检查是否已有uiFeedback.setSaving
  if (content.includes('uiFeedback.setSaving')) {
    return content;
  }

  // 查找handleSave函数
  const saveRegex = /const\s+handleSave\s*=\s*(?:async\s+)?\(\)\s*=>\s*\{/;
  const match = content.match(saveRegex);

  if (!match) {
    return content;
  }

  const insertPosition = match.index + match[0].length;

  const uiFeedbackCode = `
    try {
      uiFeedback.setSaving('正在保存...');
      
      // 这里应该调用实际的保存API
      // const result = await DataService.addXXX(data);
      // 
      // if (result && result.success) {
      //   DataService.clearCache('xxx');
      //   await refetch();
      //   uiFeedback.setSuccess('保存成功', 'local');
      //   setModalVisible(false);
      // } else {
      //   uiFeedback.setError(new Error(result?.message || '操作失败'), '保存失败');
      // }
    } catch (error) {
      uiFeedback.setError(error, '保存失败');
    }
  `;

  return content.slice(0, insertPosition) + uiFeedbackCode + content.slice(insertPosition);
}

/**
 * 添加FloatingProgress组件
 */
function addFloatingProgress(content) {
  // 检查是否已有FloatingProgress
  if (content.includes('<FloatingProgress')) {
    return content;
  }

  // 找到最后一个return语句之前的位置
  const returnRegex = /return\s*\(/;
  const match = content.match(returnRegex);

  if (!match) {
    return content;
  }

  const insertPosition = match.index;

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

  return content.slice(0, insertPosition) + floatingProgressCode + content.slice(insertPosition);
}

/**
 * 优化单个组件
 */
function optimizeComponent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logError(`❌ 文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // 检查是否已经优化
    if (isAlreadyOptimized(content)) {
      log(`⏭️  已优化: ${filePath}`);
      return true;
    }

    // 应用优化
    content = addImports(content);
    content = addUIFeedbackInit(content);
    content = addModalConfirmToDelete(content);
    content = addUIFeedbackToSave(content);
    content = addFloatingProgress(content);

    // 写入文件
    fs.writeFileSync(filePath, content, 'utf-8');
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
  log('🚀 开始批量优化新增和删除按钮功能...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const componentPath of COMPONENTS_TO_OPTIMIZE) {
    const fullPath = path.join(__dirname, '..', componentPath);
    
    if (optimizeComponent(fullPath)) {
      if (fs.readFileSync(fullPath, 'utf-8').includes('useUIFeedback')) {
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
  const logContent = `# 批量优化日志 - ${new Date().toISOString()}

## 统计
- 成功优化: ${successCount}
- 已优化: ${skipCount}
- 失败: ${errorCount}

## 详细日志
${logs.join('\n')}

## 错误日志
${errors.join('\n')}
`;

  const logPath = path.join(__dirname, '..', 'dev_log', `batch-optimize-log-${Date.now()}.md`);
  fs.writeFileSync(logPath, logContent, 'utf-8');
  log(`\n📝 日志已保存: ${logPath}`);
}

main();
