/**
 * MES系统数据源审计脚本
 * 检查所有模块是否从数据库读取真实数据
 */

const fs = require('fs');
const path = require('path');

// 要检查的组件目录
const componentsDir = path.join(__dirname, '../client/src/components');

// 数据源标记
const DATA_SOURCES = {
  MOCK_DATA: '模拟数据',
  API_CALL: 'API调用',
  HARDCODED: '硬编码数据',
  UNKNOWN: '未知'
};

// 检查文件中的数据源
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    const results = {
      file: fileName,
      path: filePath,
      dataSource: DATA_SOURCES.UNKNOWN,
      indicators: [],
      issues: []
    };

    // 检查是否使用API调用
    if (content.includes('fetch(') || content.includes('axios') || content.includes('QualityAPI') || 
        content.includes('EquipmentAPI') || content.includes('ProductionAPI') || 
        content.includes('InventoryAPI') || content.includes('SchedulingAPI')) {
      results.dataSource = DATA_SOURCES.API_CALL;
      results.indicators.push('✅ 使用API调用');
    }

    // 检查是否使用模拟数据
    if (content.includes('mockData') || content.includes('const.*Data.*=.*\\[') || 
        content.includes('const.*=.*\\[\\s*{') || content.includes('// 模拟数据')) {
      if (results.dataSource === DATA_SOURCES.API_CALL) {
        results.issues.push('⚠️  同时包含模拟数据和API调用');
      } else {
        results.dataSource = DATA_SOURCES.MOCK_DATA;
        results.indicators.push('❌ 使用模拟数据');
      }
    }

    // 检查是否有硬编码数据
    if (content.match(/const\s+\w+Data\s*=\s*\[\s*{/)) {
      results.indicators.push('⚠️  包含硬编码数据');
      if (results.dataSource === DATA_SOURCES.UNKNOWN) {
        results.dataSource = DATA_SOURCES.HARDCODED;
      }
    }

    // 检查useEffect中的数据加载
    if (content.includes('useEffect') && !content.includes('fetch') && !content.includes('API')) {
      results.issues.push('⚠️  useEffect中没有数据加载逻辑');
    }

    // 检查是否有loading状态
    if (content.includes('useState.*loading') || content.includes('setLoading')) {
      results.indicators.push('✅ 有loading状态管理');
    }

    return results;
  } catch (error) {
    return {
      file: path.basename(filePath),
      path: filePath,
      error: error.message
    };
  }
}

// 递归扫描目录
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过node_modules等目录
      if (!file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.js') && !file.includes('test')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 主审计函数
async function auditDataSources() {
  console.log('🔍 MES系统数据源审计\n');
  console.log('=' .repeat(80));

  // 扫描所有组件文件
  const componentFiles = scanDirectory(componentsDir);
  
  console.log(`📋 找到 ${componentFiles.length} 个组件文件\n`);

  // 分析每个文件
  const results = componentFiles.map(file => analyzeFile(file));

  // 统计数据源分布
  const sourceStats = {};
  const apiComponents = [];
  const mockComponents = [];
  const issueComponents = [];

  results.forEach(result => {
    if (result.error) return;
    
    const source = result.dataSource;
    sourceStats[source] = (sourceStats[source] || 0) + 1;

    if (source === DATA_SOURCES.API_CALL) {
      apiComponents.push(result);
    } else if (source === DATA_SOURCES.MOCK_DATA) {
      mockComponents.push(result);
    }

    if (result.issues.length > 0) {
      issueComponents.push(result);
    }
  });

  // 显示统计信息
  console.log('📊 数据源分布统计:');
  console.log('─' .repeat(80));
  Object.entries(sourceStats).forEach(([source, count]) => {
    const percentage = ((count / results.length) * 100).toFixed(1);
    const icon = source === DATA_SOURCES.API_CALL ? '✅' : 
                 source === DATA_SOURCES.MOCK_DATA ? '❌' : '⚠️ ';
    console.log(`${icon} ${source}: ${count} 个 (${percentage}%)`);
  });

  // 显示使用API的组件
  console.log('\n✅ 使用API调用的组件 (' + apiComponents.length + '):');
  console.log('─' .repeat(80));
  apiComponents.slice(0, 10).forEach(comp => {
    console.log(`  ✓ ${comp.file}`);
  });
  if (apiComponents.length > 10) {
    console.log(`  ... 还有 ${apiComponents.length - 10} 个`);
  }

  // 显示使用模拟数据的组件
  if (mockComponents.length > 0) {
    console.log('\n❌ 使用模拟数据的组件 (' + mockComponents.length + '):');
    console.log('─' .repeat(80));
    mockComponents.forEach(comp => {
      console.log(`  ✗ ${comp.file}`);
    });
  }

  // 显示有问题的组件
  if (issueComponents.length > 0) {
    console.log('\n⚠️  有问题的组件 (' + issueComponents.length + '):');
    console.log('─' .repeat(80));
    issueComponents.forEach(comp => {
      console.log(`  ${comp.file}:`);
      comp.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
    });
  }

  // 总体评分
  console.log('\n' + '=' .repeat(80));
  console.log('🎯 数据源审计总结:');
  
  const apiPercentage = ((apiComponents.length / results.length) * 100).toFixed(1);
  const mockPercentage = ((mockComponents.length / results.length) * 100).toFixed(1);

  console.log(`   API调用组件: ${apiComponents.length}/${results.length} (${apiPercentage}%)`);
  console.log(`   模拟数据组件: ${mockComponents.length}/${results.length} (${mockPercentage}%)`);
  console.log(`   问题组件: ${issueComponents.length}/${results.length}`);

  // 系统就绪状态
  if (apiPercentage >= 90) {
    console.log('\n✅ 系统数据源状态: 优秀 - 大部分组件使用真实数据');
  } else if (apiPercentage >= 70) {
    console.log('\n⚠️  系统数据源状态: 良好 - 需要继续迁移模拟数据');
  } else {
    console.log('\n❌ 系统数据源状态: 需要改进 - 仍有大量模拟数据');
  }

  return {
    total: results.length,
    apiComponents: apiComponents.length,
    mockComponents: mockComponents.length,
    issueComponents: issueComponents.length,
    sourceStats
  };
}

// 执行审计
if (require.main === module) {
  auditDataSources()
    .then((summary) => {
      console.log('\n🎉 数据源审计完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 审计失败:', error.message);
      process.exit(1);
    });
}

module.exports = { auditDataSources };