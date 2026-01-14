/**
 * 系统级新增和删除按钮功能审计脚本
 * 
 * 功能：
 * 1. 扫描所有组件中的新增和删除按钮
 * 2. 检查是否使用了正确的UI反馈机制
 * 3. 检查是否正确处理了进度提示
 * 4. 检查是否正确处理了数据刷新
 * 5. 生成详细的审计报告
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('🔍 系统级新增和删除按钮功能审计'));
console.log(chalk.blue('=' .repeat(60)));

// 审计配置
const auditConfig = {
  // 需要检查的关键模式
  patterns: {
    // 新增按钮相关
    addButton: {
      pattern: /handleAdd|simulateAdd|addNew|createNew/i,
      description: '新增按钮处理函数'
    },
    // 删除按钮相关
    deleteButton: {
      pattern: /handleDelete|simulateDelete|deleteRecord|removeRecord/i,
      description: '删除按钮处理函数'
    },
    // UI反馈
    uiFeedback: {
      pattern: /uiFeedback\.(setSaving|setLoading|setSuccess|setError|executeAsync)/,
      description: 'UI反馈系统使用'
    },
    // 数据刷新
    dataRefresh: {
      pattern: /refetch|DataService\.clearCache|reload/i,
      description: '数据刷新机制'
    },
    // 进度提示
    floatingProgress: {
      pattern: /FloatingProgress|ProgressIndicator/,
      description: '进度提示组件'
    },
    // Modal确认
    modalConfirm: {
      pattern: /Modal\.confirm|confirm\(/,
      description: 'Modal确认对话框'
    },
    // 消息提示
    messageAPI: {
      pattern: /safeMessage\.(success|error|warning|loading)|message\.(success|error|warning|loading)/,
      description: '消息提示API'
    }
  },
  
  // 需要检查的组件目录
  componentDirs: [
    'client/src/components/personnel',
    'client/src/components/production',
    'client/src/components/equipment',
    'client/src/components/quality',
    'client/src/components/inventory',
    'client/src/components/process',
    'client/src/components/scheduling',
    'client/src/components/settings'
  ]
};

// 审计结果
const auditResults = {
  totalComponents: 0,
  componentsWithAddButton: 0,
  componentsWithDeleteButton: 0,
  componentsWithUIFeedback: 0,
  componentsWithDataRefresh: 0,
  componentsWithFloatingProgress: 0,
  componentsWithModalConfirm: 0,
  componentsWithMessageAPI: 0,
  issues: [],
  components: []
};

// 扫描组件
function scanComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    const componentInfo = {
      file: filePath,
      fileName: fileName,
      hasAddButton: false,
      hasDeleteButton: false,
      hasUIFeedback: false,
      hasDataRefresh: false,
      hasFloatingProgress: false,
      hasModalConfirm: false,
      hasMessageAPI: false,
      issues: []
    };
    
    // 检查各个模式
    if (auditConfig.patterns.addButton.pattern.test(content)) {
      componentInfo.hasAddButton = true;
      auditResults.componentsWithAddButton++;
    }
    
    if (auditConfig.patterns.deleteButton.pattern.test(content)) {
      componentInfo.hasDeleteButton = true;
      auditResults.componentsWithDeleteButton++;
    }
    
    if (auditConfig.patterns.uiFeedback.pattern.test(content)) {
      componentInfo.hasUIFeedback = true;
      auditResults.componentsWithUIFeedback++;
    }
    
    if (auditConfig.patterns.dataRefresh.pattern.test(content)) {
      componentInfo.hasDataRefresh = true;
      auditResults.componentsWithDataRefresh++;
    }
    
    if (auditConfig.patterns.floatingProgress.pattern.test(content)) {
      componentInfo.hasFloatingProgress = true;
      auditResults.componentsWithFloatingProgress++;
    }
    
    if (auditConfig.patterns.modalConfirm.pattern.test(content)) {
      componentInfo.hasModalConfirm = true;
      auditResults.componentsWithModalConfirm++;
    }
    
    if (auditConfig.patterns.messageAPI.pattern.test(content)) {
      componentInfo.hasMessageAPI = true;
      auditResults.componentsWithMessageAPI++;
    }
    
    // 检查问题
    if (componentInfo.hasAddButton && !componentInfo.hasUIFeedback) {
      componentInfo.issues.push('新增按钮缺少UI反馈');
      auditResults.issues.push({
        file: filePath,
        issue: '新增按钮缺少UI反馈',
        severity: 'high'
      });
    }
    
    if (componentInfo.hasDeleteButton && !componentInfo.hasModalConfirm) {
      componentInfo.issues.push('删除按钮缺少确认对话框');
      auditResults.issues.push({
        file: filePath,
        issue: '删除按钮缺少确认对话框',
        severity: 'high'
      });
    }
    
    if ((componentInfo.hasAddButton || componentInfo.hasDeleteButton) && !componentInfo.hasDataRefresh) {
      componentInfo.issues.push('新增/删除按钮缺少数据刷新机制');
      auditResults.issues.push({
        file: filePath,
        issue: '新增/删除按钮缺少数据刷新机制',
        severity: 'high'
      });
    }
    
    if ((componentInfo.hasAddButton || componentInfo.hasDeleteButton) && !componentInfo.hasMessageAPI) {
      componentInfo.issues.push('新增/删除按钮缺少消息提示');
      auditResults.issues.push({
        file: filePath,
        issue: '新增/删除按钮缺少消息提示',
        severity: 'medium'
      });
    }
    
    if (componentInfo.hasAddButton || componentInfo.hasDeleteButton) {
      auditResults.components.push(componentInfo);
      auditResults.totalComponents++;
    }
    
    return componentInfo;
  } catch (error) {
    console.error(chalk.red(`扫描文件失败: ${filePath}`), error.message);
    return null;
  }
}

// 递归扫描目录
function scanDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        scanComponent(itemPath);
      }
    });
  } catch (error) {
    console.error(chalk.red(`扫描目录失败: ${dirPath}`), error.message);
  }
}

// 执行审计
console.log(chalk.yellow('\n📋 开始扫描组件...'));

auditConfig.componentDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  scanDirectory(fullPath);
});

// 生成报告
console.log(chalk.blue('\n' + '='.repeat(60)));
console.log(chalk.blue('📊 审计报告'));
console.log(chalk.blue('='.repeat(60)));

console.log(chalk.yellow('\n📈 统计信息:'));
console.log(chalk.gray(`  总组件数: ${auditResults.totalComponents}`));
console.log(chalk.gray(`  有新增按钮的组件: ${auditResults.componentsWithAddButton}`));
console.log(chalk.gray(`  有删除按钮的组件: ${auditResults.componentsWithDeleteButton}`));
console.log(chalk.gray(`  使用UI反馈的组件: ${auditResults.componentsWithUIFeedback}`));
console.log(chalk.gray(`  有数据刷新的组件: ${auditResults.componentsWithDataRefresh}`));
console.log(chalk.gray(`  有进度提示的组件: ${auditResults.componentsWithFloatingProgress}`));
console.log(chalk.gray(`  有Modal确认的组件: ${auditResults.componentsWithModalConfirm}`));
console.log(chalk.gray(`  有消息提示的组件: ${auditResults.componentsWithMessageAPI}`));

// 显示问题
if (auditResults.issues.length > 0) {
  console.log(chalk.red(`\n⚠️  发现 ${auditResults.issues.length} 个问题:`));
  
  const highSeverity = auditResults.issues.filter(i => i.severity === 'high');
  const mediumSeverity = auditResults.issues.filter(i => i.severity === 'medium');
  
  if (highSeverity.length > 0) {
    console.log(chalk.red(`\n🔴 高优先级问题 (${highSeverity.length}):`));
    highSeverity.forEach(issue => {
      console.log(chalk.red(`  - ${issue.file.replace(/.*components/, 'components')}`));
      console.log(chalk.red(`    问题: ${issue.issue}`));
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log(chalk.yellow(`\n🟡 中优先级问题 (${mediumSeverity.length}):`));
    mediumSeverity.forEach(issue => {
      console.log(chalk.yellow(`  - ${issue.file.replace(/.*components/, 'components')}`));
      console.log(chalk.yellow(`    问题: ${issue.issue}`));
    });
  }
} else {
  console.log(chalk.green('\n✅ 没有发现问题！'));
}

// 显示优化建议
console.log(chalk.blue('\n' + '='.repeat(60)));
console.log(chalk.blue('💡 优化建议'));
console.log(chalk.blue('='.repeat(60)));

console.log(chalk.gray(`
1. 新增按钮最佳实践：
   ✓ 使用 uiFeedback.setSaving() 显示加载状态
   ✓ 使用 safeMessage.success() 显示成功消息
   ✓ 使用 refetch() 刷新数据
   ✓ 使用 FloatingProgress 显示进度提示
   ✓ 使用 Modal 显示表单

2. 删除按钮最佳实践：
   ✓ 使用 Modal.confirm() 显示确认对话框
   ✓ 使用 uiFeedback.executeAsync() 执行删除操作
   ✓ 使用 safeMessage.success() 显示成功消息
   ✓ 使用 refetch() 刷新数据
   ✓ 使用 FloatingProgress 显示进度提示

3. 参考实现：
   - EmployeeManagement.js (员工管理) - 已优化
   - 其他组件应参照此实现进行优化
`));

// 保存详细报告
const reportFile = path.join(__dirname, '..', 'dev_log', `ADD_DELETE_BUTTONS_AUDIT_${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportFile, JSON.stringify(auditResults, null, 2));

console.log(chalk.blue('\n' + '='.repeat(60)));
console.log(chalk.green(`✅ 审计完成！详细报告已保存: ${reportFile}`));
console.log(chalk.blue('=' .repeat(60)));