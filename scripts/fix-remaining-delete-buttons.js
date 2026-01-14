#!/usr/bin/env node

/**
 * 修复剩余的多行格式删除按钮
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复剩余的多行格式删除按钮...\n');

// 需要手动修复的组件
const components = [
  {
    file: 'client/src/components/production/ProductionMasterDataManagement.js',
    replacements: [
      {
        old: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>`,
        new: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteData(record)}
          >
            删除
          </Button>`
      }
    ]
  },
  {
    file: 'client/src/components/production/LineMaterialsManagement.js',
    replacements: [
      {
        old: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>`,
        new: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteMaterial(record)}
          >
            删除
          </Button>`
      }
    ]
  },
  {
    file: 'client/src/components/production/EquipmentResponsibilityManagement.js',
    replacements: [
      {
        old: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>`,
        new: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteResponsibility(record)}
          >
            删除
          </Button>`
      }
    ]
  },
  {
    file: 'client/src/components/inventory/InventoryMasterData.js',
    replacements: [
      {
        old: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>`,
        new: `            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteInventory(record)}
          >
            删除
          </Button>`
      }
    ]
  },
  {
    file: 'client/src/components/settings/SystemBackup.js',
    replacements: [
      {
        old: `          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>`,
        new: `          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteBackup(record)}>
            删除
          </Button>`
      }
    ]
  },
  {
    file: 'client/src/components/settings/RoleManagement.js',
    replacements: [
      {
        old: `            size="small" 
            danger 
            icon={<DeleteOutlined />}
            disabled={record.isSystem || record.userCount > 0}
          >
            删除
          </Button>`,
        new: `            size="small" 
            danger 
            icon={<DeleteOutlined />}
            disabled={record.isSystem || record.userCount > 0}
            onClick={() => handleDeleteRole(record)}
          >
            删除
          </Button>`
      }
    ]
  }
];

let successCount = 0;
let failCount = 0;

components.forEach(component => {
  console.log(`🔧 修复 ${path.basename(component.file)}...`);
  
  try {
    const filePath = path.join(__dirname, '..', component.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  文件不存在: ${component.file}`);
      failCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    component.replacements.forEach((replacement, index) => {
      if (content.includes(replacement.old)) {
        content = content.replace(replacement.old, replacement.new);
        console.log(`  ✅ 修复删除按钮 ${index + 1}`);
        modified = true;
      } else {
        console.log(`  ⚠️  未找到目标代码片段 ${index + 1}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 修复完成\n`);
      successCount++;
    } else {
      console.log(`  ℹ️  无需修复\n`);
      successCount++;
    }
    
  } catch (error) {
    console.log(`  ❌ 修复失败: ${error.message}\n`);
    failCount++;
  }
});

console.log('📊 修复结果统计');
console.log('================================');
console.log(`总组件数: ${components.length}`);
console.log(`✅ 成功: ${successCount}`);
console.log(`❌ 失败: ${failCount}`);

const successRate = ((successCount / components.length) * 100).toFixed(1);
console.log(`\n🎯 成功率: ${successRate}%`);

if (failCount === 0) {
  console.log('\n🎉 剩余删除按钮修复完成！');
} else {
  console.log('\n⚠️  部分组件修复失败，请手动检查。');
}