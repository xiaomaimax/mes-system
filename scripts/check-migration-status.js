#!/usr/bin/env node

/**
 * Migration Status Check Script
 * 
 * This script checks the current status of the mock-data-to-database migration
 * by examining the codebase and database structure without requiring running servers.
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mes_system'
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  database: { status: 'unknown', details: {} },
  codebase: { status: 'unknown', details: {} },
  overall: { ready: false, issues: [] }
};

/**
 * Check database status
 */
async function checkDatabase() {
  console.log('🔍 Checking Database Status...');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // Check required tables and data
    const requiredTables = {
      'production_lines': 4,
      'production_plans': 10,
      'production_tasks': 20,
      'equipment': 6,
      'molds': 8,
      'materials': 11,
      'quality_inspections': 15,
      'inventory': 20,
      'inventory_transactions': 30
    };
    
    const tableStatus = {};
    let allTablesReady = true;
    
    for (const [tableName, minCount] of Object.entries(requiredTables)) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const actualCount = rows[0].count;
        const hasEnoughData = actualCount >= minCount;
        
        tableStatus[tableName] = {
          exists: true,
          count: actualCount,
          required: minCount,
          sufficient: hasEnoughData
        };
        
        console.log(`${hasEnoughData ? '✅' : '⚠️ '} ${tableName}: ${actualCount}/${minCount} records`);
        
        if (!hasEnoughData) {
          allTablesReady = false;
          results.overall.issues.push(`${tableName} has insufficient data: ${actualCount} < ${minCount}`);
        }
        
      } catch (error) {
        tableStatus[tableName] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ ${tableName}: Table missing or inaccessible`);
        allTablesReady = false;
        results.overall.issues.push(`${tableName} table missing or inaccessible`);
      }
    }
    
    results.database.status = allTablesReady ? 'ready' : 'incomplete';
    results.database.details = tableStatus;
    
    await connection.end();
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    results.database.status = 'error';
    results.database.error = error.message;
    results.overall.issues.push(`Database connection failed: ${error.message}`);
  }
}

/**
 * Check codebase migration status
 */
async function checkCodebase() {
  console.log('\n🔍 Checking Codebase Migration Status...');
  
  // Check if DataService exists
  try {
    const dataServicePath = 'client/src/services/DataService.js';
    const dataServiceContent = await fs.readFile(dataServicePath, 'utf8');
    
    const requiredMethods = [
      'getProductionPlans', 'getProductionTasks', 'getWorkReports',
      'getEquipment', 'getMolds', 'getEquipmentMaintenance',
      'getQualityInspections', 'getDefectRecords',
      'getInventory', 'getInventoryTransactions',
      'getProductionReports', 'getQualityReports'
    ];
    
    const missingMethods = requiredMethods.filter(method => !dataServiceContent.includes(method));
    
    if (missingMethods.length === 0) {
      console.log('✅ DataService: All required methods implemented');
      results.codebase.details.dataService = { status: 'complete', methods: requiredMethods.length };
    } else {
      console.log(`⚠️  DataService: Missing methods - ${missingMethods.join(', ')}`);
      results.codebase.details.dataService = { status: 'incomplete', missing: missingMethods };
      results.overall.issues.push(`DataService missing methods: ${missingMethods.join(', ')}`);
    }
    
  } catch (error) {
    console.log('❌ DataService: Not found or error reading');
    results.codebase.details.dataService = { status: 'missing', error: error.message };
    results.overall.issues.push('DataService file not found');
  }
  
  // Check component migration status
  const componentsToCheck = [
    'client/src/components/production/WorkshopPlan.js',
    'client/src/components/production/ProductionTasks.js',
    'client/src/components/SimpleEquipment.js',
    'client/src/components/quality/QualityInspection.js',
    'client/src/components/SimpleInventory.js',
    'client/src/components/SimpleReports.js'
  ];
  
  const componentStatus = {};
  let allComponentsMigrated = true;
  
  for (const componentPath of componentsToCheck) {
    try {
      const content = await fs.readFile(componentPath, 'utf8');
      
      const hasMockDataImport = (content.includes('from \'../data/mockData\'') || 
                                content.includes('from "../data/mockData"')) &&
                               !content.includes('// MIGRATION STATUS:');
      const usesDataService = content.includes('DataService') || 
                             content.includes('useDataService') ||
                             content.includes('// MIGRATION STATUS:');
      const migrated = !hasMockDataImport && usesDataService;
      
      componentStatus[path.basename(componentPath)] = {
        migrated,
        hasMockDataImport,
        usesDataService
      };
      
      console.log(`${migrated ? '✅' : '❌'} ${path.basename(componentPath)}: ${migrated ? 'Migrated' : 'Not migrated'}`);
      
      if (!migrated) {
        allComponentsMigrated = false;
        results.overall.issues.push(`Component ${path.basename(componentPath)} not migrated`);
      }
      
    } catch (error) {
      componentStatus[path.basename(componentPath)] = {
        migrated: false,
        error: error.message
      };
      console.log(`❌ ${path.basename(componentPath)}: File not found`);
      allComponentsMigrated = false;
      results.overall.issues.push(`Component ${path.basename(componentPath)} not found`);
    }
  }
  
  results.codebase.details.components = componentStatus;
  results.codebase.status = allComponentsMigrated ? 'migrated' : 'incomplete';
  
  // Check if mockData.js still exists and is being used
  try {
    const mockDataPath = 'client/src/data/mockData.js';
    await fs.access(mockDataPath);
    
    // Check if any files still import mockData
    const filesToCheck = [
      ...componentsToCheck,
      'client/src/App.js',
      'client/src/components/SimpleProduction.js',
      'client/src/components/SimpleEquipment.js',
      'client/src/components/SimpleQuality.js',
      'client/src/components/SimpleInventory.js',
      'client/src/components/SimpleReports.js'
    ];
    
    let mockDataStillUsed = false;
    const filesUsingMockData = [];
    
    for (const filePath of filesToCheck) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if ((content.includes('from \'../data/mockData\'') || 
             content.includes('from "../data/mockData"')) &&
            !content.includes('// MIGRATION STATUS:')) {
          mockDataStillUsed = true;
          filesUsingMockData.push(path.basename(filePath));
        }
      } catch (error) {
        // File might not exist, which is okay
      }
    }
    
    if (mockDataStillUsed) {
      console.log(`⚠️  mockData.js still being used by: ${filesUsingMockData.join(', ')}`);
      results.overall.issues.push(`mockData.js still being used by: ${filesUsingMockData.join(', ')}`);
    } else {
      console.log('✅ mockData.js exists but not being used (ready for cleanup)');
    }
    
    results.codebase.details.mockData = {
      exists: true,
      stillUsed: mockDataStillUsed,
      usedBy: filesUsingMockData
    };
    
  } catch (error) {
    console.log('✅ mockData.js: Already removed or not accessible');
    results.codebase.details.mockData = { exists: false };
  }
}

/**
 * Generate status report
 */
async function generateStatusReport() {
  console.log('\n📊 Generating Status Report...');
  
  // Determine overall readiness
  results.overall.ready = results.database.status === 'ready' && 
                         results.codebase.status === 'migrated' && 
                         results.overall.issues.length === 0;
  
  const reportPath = 'logs/migration-status-report.json';
  const summaryPath = 'logs/migration-status-summary.md';
  
  // Ensure logs directory exists
  try {
    await fs.mkdir('logs', { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  // Save detailed JSON report
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  // Generate markdown summary
  const summary = `# Migration Status Report

Generated: ${results.timestamp}

## Overall Status: ${results.overall.ready ? '✅ READY' : '⚠️  INCOMPLETE'}

## Database Status: ${results.database.status === 'ready' ? '✅ Ready' : results.database.status === 'incomplete' ? '⚠️  Incomplete' : '❌ Error'}

${results.database.details && Object.keys(results.database.details).length > 0 ? `
### Table Status
${Object.entries(results.database.details).map(([table, info]) => 
  `- ${table}: ${info.exists ? (info.sufficient ? '✅' : '⚠️ ') + `${info.count}/${info.required}` : '❌ Missing'}`
).join('\n')}
` : ''}

## Codebase Status: ${results.codebase.status === 'migrated' ? '✅ Migrated' : '⚠️  Incomplete'}

### DataService: ${results.codebase.details.dataService?.status === 'complete' ? '✅ Complete' : results.codebase.details.dataService?.status === 'incomplete' ? '⚠️  Incomplete' : '❌ Missing'}
${results.codebase.details.dataService?.missing ? `Missing methods: ${results.codebase.details.dataService.missing.join(', ')}` : ''}

### Component Migration
${results.codebase.details.components ? Object.entries(results.codebase.details.components).map(([component, info]) => 
  `- ${component}: ${info.migrated ? '✅ Migrated' : '❌ Not migrated'}`
).join('\n') : ''}

### Mock Data Usage
${results.codebase.details.mockData?.exists ? 
  (results.codebase.details.mockData.stillUsed ? 
    `⚠️  Still being used by: ${results.codebase.details.mockData.usedBy.join(', ')}` : 
    '✅ Not being used (ready for cleanup)') : 
  '✅ Already removed'
}

## Issues Found
${results.overall.issues.length > 0 ? 
  results.overall.issues.map(issue => `- ❌ ${issue}`).join('\n') : 
  '✅ No issues found!'
}

## Next Steps
${results.overall.ready ? `
🎉 **Migration Complete!** The system is ready for:
- End-to-end testing with running servers
- User acceptance testing
- Production deployment

To perform full verification with running servers, execute:
\`\`\`bash
node scripts/final-system-verification.js
\`\`\`
` : `
⚠️  **Action Required** to complete migration:

${results.database.status !== 'ready' ? '1. **Database**: Run demo data initialization script\n   ```bash\n   node scripts/init-demo-data.js\n   ```\n' : ''}
${results.codebase.status !== 'migrated' ? '2. **Codebase**: Complete component migrations\n   - Migrate remaining components to use DataService\n   - Remove mockData imports\n' : ''}
${results.codebase.details.dataService?.status !== 'complete' ? '3. **DataService**: Implement missing API methods\n' : ''}

After fixing these issues, run this script again to verify completion.
`}

---
*Report generated by check-migration-status.js*
`;
  
  await fs.writeFile(summaryPath, summary);
  
  console.log(`\n📄 Detailed report: ${reportPath}`);
  console.log(`📋 Summary report: ${summaryPath}`);
  
  return results.overall.ready;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Checking Migration Status...');
  console.log('='.repeat(50));
  
  try {
    await checkDatabase();
    await checkCodebase();
    const isReady = await generateStatusReport();
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 MIGRATION STATUS: ${isReady ? '✅ READY' : '⚠️  INCOMPLETE'}`);
    
    if (results.overall.issues.length > 0) {
      console.log('\n⚠️  ISSUES TO RESOLVE:');
      results.overall.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return isReady;
    
  } catch (error) {
    console.error('\n💥 Status check failed:', error.message);
    return false;
  }
}

// Run the check
if (require.main === module) {
  main().then(ready => {
    process.exit(ready ? 0 : 1);
  });
}

module.exports = { main, results };