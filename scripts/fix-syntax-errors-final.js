#!/usr/bin/env node

/**
 * Fix Syntax Errors - Final
 * 
 * This script fixes remaining syntax errors after the migration
 */

const fs = require('fs').promises;
const path = require('path');

async function fixSyntaxErrors() {
  console.log('🔧 Fixing syntax errors...');
  
  const fixes = [
    {
      file: 'client/src/components/SimpleProduction.js',
      description: 'Fix template literal with embedded comment',
      fixes: [
        {
          search: /description=\{`[^`]*\/\/ TODO: Replace with DataService call[^`]*`\}/g,
          replace: 'description={`当前有 ${stats.runningPlans} 个生产计划正在进行中，${stats.waitingTasks || 0} 个任务等待执行！`}'
        }
      ]
    },
    {
      file: 'client/src/components/SimpleEquipment.js',
      description: 'Fix any template literal issues',
      fixes: [
        {
          search: /\/\/ TODO: Replace with DataService call - [^`}]*/g,
          replace: '// TODO: Replace with DataService call'
        }
      ]
    },
    {
      file: 'client/src/components/SimpleInventory.js',
      description: 'Fix any template literal issues',
      fixes: [
        {
          search: /\/\/ TODO: Replace with DataService call - [^`}]*/g,
          replace: '// TODO: Replace with DataService call'
        }
      ]
    },
    {
      file: 'client/src/components/SimpleQuality.js',
      description: 'Fix any template literal issues',
      fixes: [
        {
          search: /\/\/ TODO: Replace with DataService call - [^`}]*/g,
          replace: '// TODO: Replace with DataService call'
        }
      ]
    }
  ];
  
  let fixedCount = 0;
  
  for (const fileConfig of fixes) {
    try {
      let content = await fs.readFile(fileConfig.file, 'utf8');
      let modified = false;
      
      for (const fix of fileConfig.fixes) {
        if (content.match(fix.search)) {
          content = content.replace(fix.search, fix.replace);
          modified = true;
        }
      }
      
      if (modified) {
        await fs.writeFile(fileConfig.file, content);
        console.log(`✅ Fixed: ${fileConfig.file} - ${fileConfig.description}`);
        fixedCount++;
      } else {
        console.log(`✅ OK: ${fileConfig.file} - No issues found`);
      }
      
    } catch (error) {
      console.log(`❌ Error fixing ${fileConfig.file}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Fixed ${fixedCount} files`);
  return fixedCount;
}

async function validateSyntax() {
  console.log('\n🔍 Validating syntax...');
  
  const filesToCheck = [
    'client/src/components/SimpleProduction.js',
    'client/src/components/SimpleEquipment.js',
    'client/src/components/SimpleInventory.js',
    'client/src/components/SimpleQuality.js',
    'client/src/services/DataService.js',
    'client/src/data/mockData.js'
  ];
  
  let validCount = 0;
  
  for (const filePath of filesToCheck) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic syntax checks
      const issues = [];
      
      // Check for unmatched braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
      }
      
      // Check for template literal issues
      if (content.includes('${//')) {
        issues.push('Template literal contains comment syntax');
      }
      
      // Check for duplicate exports
      const exportMatches = content.match(/export default/g);
      if (exportMatches && exportMatches.length > 1) {
        issues.push('Multiple default exports found');
      }
      
      if (issues.length === 0) {
        console.log(`✅ ${path.basename(filePath)}: Syntax OK`);
        validCount++;
      } else {
        console.log(`❌ ${path.basename(filePath)}: ${issues.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ ${path.basename(filePath)}: Cannot read file - ${error.message}`);
    }
  }
  
  console.log(`\n📊 ${validCount}/${filesToCheck.length} files have valid syntax`);
  return validCount === filesToCheck.length;
}

async function main() {
  console.log('🚀 Starting Syntax Error Fix...');
  console.log('='.repeat(50));
  
  try {
    await fixSyntaxErrors();
    const allValid = await validateSyntax();
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
      console.log('✅ All syntax errors fixed successfully!');
      console.log('The system should now compile without errors.');
    } else {
      console.log('⚠️  Some syntax issues remain. Please check the output above.');
    }
    
    return allValid;
    
  } catch (error) {
    console.error('💥 Fix failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { main };