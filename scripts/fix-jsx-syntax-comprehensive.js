#!/usr/bin/env node

/**
 * Fix JSX Syntax Issues - Comprehensive
 * 
 * This script fixes JSX syntax errors caused by comments inside JSX expressions
 */

const fs = require('fs').promises;
const path = require('path');

async function fixJSXSyntaxErrors() {
  console.log('🔧 Fixing JSX syntax errors...');
  
  const componentsToFix = [
    'client/src/components/SimpleProduction.js',
    'client/src/components/SimpleEquipment.js',
    'client/src/components/SimpleInventory.js',
    'client/src/components/SimpleQuality.js'
  ];
  
  let fixedCount = 0;
  
  for (const filePath of componentsToFix) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      
      // Fix 1: Comments inside JSX attribute values
      const attributeCommentRegex = /(\w+)=\{\/\/ TODO: Replace with DataService call - ([^}]+)\}/g;
      if (content.match(attributeCommentRegex)) {
        content = content.replace(attributeCommentRegex, (match, attr, comment) => {
          // Generate a safe default value based on the attribute name
          let defaultValue = '0';
          if (attr === 'dataSource') {
            defaultValue = '[]';
          } else if (comment.includes('.length')) {
            defaultValue = '0';
          } else if (comment.includes('.map')) {
            defaultValue = '[]';
          }
          
          return `${attr}={${defaultValue} /* TODO: Replace with actual data */}`;
        });
        modified = true;
      }
      
      // Fix 2: Comments inside template literals in JSX
      const templateCommentRegex = /\$\{\/\/ TODO: Replace with DataService call - ([^}]+)\}/g;
      if (content.match(templateCommentRegex)) {
        content = content.replace(templateCommentRegex, '${0 /* TODO: Replace with actual data */}');
        modified = true;
      }
      
      // Fix 3: Comments inside JSX expressions
      const jsxCommentRegex = /\{\/\/ TODO: Replace with DataService call - ([^}]+)\}/g;
      if (content.match(jsxCommentRegex)) {
        content = content.replace(jsxCommentRegex, (match, comment) => {
          // Generate appropriate default based on context
          if (comment.includes('.length')) {
            return '{0 /* TODO: Replace with actual data */}';
          } else if (comment.includes('.filter')) {
            return '{0 /* TODO: Replace with actual data */}';
          } else if (comment.includes('.map')) {
            return '{[] /* TODO: Replace with actual data */}';
          } else {
            return '{null /* TODO: Replace with actual data */}';
          }
        });
        modified = true;
      }
      
      if (modified) {
        await fs.writeFile(filePath, content);
        console.log(`✅ Fixed: ${path.basename(filePath)}`);
        fixedCount++;
      } else {
        console.log(`✅ OK: ${path.basename(filePath)} - No JSX syntax issues found`);
      }
      
    } catch (error) {
      console.log(`❌ Error fixing ${path.basename(filePath)}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Fixed ${fixedCount} files`);
  return fixedCount;
}

async function validateJSXSyntax() {
  console.log('\n🔍 Validating JSX syntax...');
  
  const filesToCheck = [
    'client/src/components/SimpleProduction.js',
    'client/src/components/SimpleEquipment.js',
    'client/src/components/SimpleInventory.js',
    'client/src/components/SimpleQuality.js'
  ];
  
  let validCount = 0;
  
  for (const filePath of filesToCheck) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check for JSX syntax issues
      const issues = [];
      
      // Check for comments inside JSX expressions
      if (content.includes('={// TODO')) {
        issues.push('Comments inside JSX attribute values');
      }
      
      if (content.includes('${// TODO')) {
        issues.push('Comments inside template literals in JSX');
      }
      
      if (content.includes('{// TODO') && !content.includes('{/* TODO')) {
        issues.push('Unescaped comments in JSX expressions');
      }
      
      if (issues.length === 0) {
        console.log(`✅ ${path.basename(filePath)}: JSX syntax OK`);
        validCount++;
      } else {
        console.log(`❌ ${path.basename(filePath)}: ${issues.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ ${path.basename(filePath)}: Cannot read file - ${error.message}`);
    }
  }
  
  console.log(`\n📊 ${validCount}/${filesToCheck.length} files have valid JSX syntax`);
  return validCount === filesToCheck.length;
}

async function main() {
  console.log('🚀 Starting JSX Syntax Fix...');
  console.log('='.repeat(50));
  
  try {
    await fixJSXSyntaxErrors();
    const allValid = await validateJSXSyntax();
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
      console.log('✅ All JSX syntax errors fixed successfully!');
      console.log('The React components should now compile without JSX syntax errors.');
    } else {
      console.log('⚠️  Some JSX syntax issues remain. Please check the output above.');
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