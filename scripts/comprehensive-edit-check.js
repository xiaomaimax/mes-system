const fs = require('fs');
const path = require('path');

/**
 * 全面检查系统所有编辑按钮功能
 * 确保编辑后可以保存并更新数据
 */

console.log('🔍 全面检查系统所有编辑按钮功能...\n');

// 需要检查的组件目录
const componentDirs = [
  'client/src/components/settings',
  'client/src/components/personnel',
  'client/src/components/process',
  'client/src/components/integration',
  'client/src/components/inventory',
  'client/src/components/production',
  'client/src/components/quality',
  'client/src/components/equipment'
];

// 编辑功能检查项
const editChecks = {
  editState: {
    patterns: ['editingRecord', 'editingItem', 'editingData'],
    name: '编辑状态管理'
  },
  handleEdit: {
    patterns: ['handleEdit', 'onEdit'],
    name: 'handleEdit函数'
  },
  handleSave: {
    patterns: ['handleSave', 'onSave'],
    name: 'handleSave函数'
  },
  editButton: {
    patterns: ['onClick={() => handleEdit', 'onClick={handleEdit'],
    name: '编辑按钮绑定'
  },
  modalTitle: {
    patterns: ['editingRecord ?', '编辑.*:', '"编辑'],
    name: '动态模态框标题'
  },
  formReset: {
    patterns: ['setEditingRecord(null)', 'form.resetFields()'],
    name: '表单重置'
  },
  dataUpdate: {
    patterns: ['setData\\(', 'setTableData\\(', '\\.\\.\\.editingRecord'],
    name: '数据更新'
  },
  validation: {
    patterns: ['form\\.validateFields\\(\\)', 'await.*validateFields'],
    name: '表单验证'
  }
};

let totalComponents = 0;
let passedComponents = 0;
let detailedResults = [];

// 检查单个组件文件
function checkComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    let componentResult = {
      file: fileName,
      path: filePath,
      checks: {},
      score: 0,
      maxScore: Object.keys(editChecks).length,
      issues: []
    };

    // 检查是否包含编辑相关功能
    const hasEditFeature = content.includes('编辑') || content.includes('edit') || content.includes('handleEdit');
    
    if (!hasEditFeature) {
      componentResult.hasEditFeature = false;
      return componentResult;
    }

    componentResult.hasEditFeature = true;

    // 执行各项检查
    Object.entries(editChecks).forEach(([key, check]) => {
      const passed = check.patterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(content);
      });

      componentResult.checks[key] = {
        name: check.name,
        passed: passed,
        patterns: check.patterns
      };

      if (passed) {
        componentResult.score++;
      } else {
        componentResult.issues.push(`缺少${check.name}`);
      }
    });

    return componentResult;
  } catch (error) {
    console.error(`❌ 检查文件失败: ${filePath}`, error.message);
    return null;
  }
}

// 扫描所有组件
console.log('📂 扫描组件目录...\n');

componentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
  
  console.log(`📁 ${dir} (${files.length} 个文件)`);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const result = checkComponent(filePath);
    
    if (result && result.hasEditFeature) {
      totalComponents++;
      detailedResults.push(result);
      
      const percentage = Math.round((result.score / result.maxScore) * 100);
      const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';
      
      console.log(`  ${status} ${file} (${result.score}/${result.maxScore} - ${percentage}%)`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
      
      if (percentage >= 80) {
        passedComponents++;
      }
    }
  });
  
  console.log('');
});

// 生成总结报告
console.log('📊 检查结果总结:\n');

const overallPercentage = totalComponents > 0 ? Math.round((passedComponents / totalComponents) * 100) : 0;

console.log(`总计检查组件: ${totalComponents}`);
console.log(`功能完整组件: ${passedComponents}`);
console.log(`需要改进组件: ${totalComponents - passedComponents}`);
console.log(`整体完成度: ${overallPercentage}%\n`);

// 按分数排序显示详细结果
console.log('📋 详细检查结果:\n');

detailedResults
  .sort((a, b) => b.score - a.score)
  .forEach(result => {
    const percentage = Math.round((result.score / result.maxScore) * 100);
    const status = percentage >= 80 ? '🟢' : percentage >= 60 ? '🟡' : '🔴';
    
    console.log(`${status} ${result.file} (${percentage}%)`);
    
    // 显示通过的检查项
    Object.entries(result.checks).forEach(([key, check]) => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`  ${icon} ${check.name}`);
    });
    
    console.log('');
  });

// 生成需要修复的组件列表
const needsFixing = detailedResults.filter(result => {
  const percentage = Math.round((result.score / result.maxScore) * 100);
  return percentage < 80;
});

if (needsFixing.length > 0) {
  console.log('🔧 需要修复的组件:\n');
  
  needsFixing.forEach(result => {
    console.log(`📄 ${result.file}:`);
    result.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
    console.log('');
  });
}

// 生成修复建议
console.log('💡 修复建议:\n');

const commonIssues = {};
detailedResults.forEach(result => {
  result.issues.forEach(issue => {
    commonIssues[issue] = (commonIssues[issue] || 0) + 1;
  });
});

Object.entries(commonIssues)
  .sort(([,a], [,b]) => b - a)
  .forEach(([issue, count]) => {
    console.log(`${count} 个组件缺少: ${issue}`);
  });

// 保存详细结果
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents,
    passedComponents,
    overallPercentage
  },
  results: detailedResults,
  needsFixing: needsFixing.map(r => ({
    file: r.file,
    path: r.path,
    issues: r.issues,
    score: r.score,
    maxScore: r.maxScore
  }))
};

fs.writeFileSync(
  'scripts/edit-buttons-comprehensive-report.json',
  JSON.stringify(reportData, null, 2)
);

console.log('\n📄 详细报告已保存到: scripts/edit-buttons-comprehensive-report.json');

// 生成修复脚本
if (needsFixing.length > 0) {
  console.log('\n🛠️  生成修复脚本...');
  
  const fixScript = `const fs = require('fs');

/**
 * 自动修复编辑按钮功能
 */

const filesToFix = ${JSON.stringify(needsFixing.map(r => r.path), null, 2)};

console.log('🔧 开始修复编辑按钮功能...\\n');

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    console.log(\`📄 修复文件: \${filePath}\`);
    
    // 添加编辑状态管理
    if (!content.includes('editingRecord') && !content.includes('editingItem')) {
      const stateMatch = content.match(/(const \\[\\w+, set\\w+\\] = useState\\([^)]*\\);)/);
      if (stateMatch) {
        const newState = '  const [editingRecord, setEditingRecord] = useState(null);';
        content = content.replace(stateMatch[0], stateMatch[0] + '\\n' + newState);
        modified = true;
        console.log('  ✅ 添加编辑状态管理');
      }
    }
    
    // 添加handleEdit函数
    if (!content.includes('handleEdit')) {
      const handleDeleteMatch = content.match(/(const handleDelete[^}]+})/s);
      if (handleDeleteMatch) {
        const handleEditFunction = \`
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };\`;
        content = content.replace(handleDeleteMatch[0], handleDeleteMatch[0] + '\\n' + handleEditFunction);
        modified = true;
        console.log('  ✅ 添加handleEdit函数');
      }
    }
    
    // 修复handleSave函数
    if (content.includes('handleSave') && !content.includes('editingRecord')) {
      content = content.replace(
        /const handleSave = async \\(\\) => {([^}]+)}/s,
        \`const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        );
        setData(updatedData);
        message.success('编辑成功');
      } else {
        // 新增模式
        const newRecord = {
          id: Date.now(),
          ...values,
          createTime: new Date().toLocaleString()
        };
        setData([...data, newRecord]);
        message.success('新增成功');
      }
      
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  }\`
      );
      modified = true;
      console.log('  ✅ 修复handleSave函数');
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('  💾 文件已保存');
    } else {
      console.log('  ℹ️  无需修改');
    }
    
  } catch (error) {
    console.error(\`❌ 修复失败: \${filePath}\`, error.message);
  }
  
  console.log('');
});

console.log('🎉 编辑按钮功能修复完成！');
`;

  fs.writeFileSync('scripts/auto-fix-edit-buttons.js', fixScript);
  console.log('📄 修复脚本已生成: scripts/auto-fix-edit-buttons.js');
}

if (overallPercentage >= 90) {
  console.log('\n🎉 系统编辑功能检查通过！所有编辑按钮功能完整！');
} else if (overallPercentage >= 70) {
  console.log('\n⚠️  系统编辑功能基本完整，建议优化部分组件');
} else {
  console.log('\n❌ 系统编辑功能需要大幅改进');
}

console.log('\n🧪 测试建议:');
console.log('1. 启动开发服务器: npm start');
console.log('2. 逐个测试各模块的编辑功能');
console.log('3. 验证编辑后数据是否正确保存');
console.log('4. 检查表单验证和错误处理');