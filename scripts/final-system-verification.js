#!/usr/bin/env node

/**
 * Final System Verification Script
 * 
 * This script performs comprehensive end-to-end testing to verify that:
 * 1. All demo data is properly initialized in the database
 * 2. All API endpoints are working correctly
 * 3. All frontend components can load data from APIs
 * 4. Data consistency between database and frontend
 * 5. Performance requirements are met
 */

const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mes_system'
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  database: {},
  api: {},
  frontend: {},
  performance: {},
  overall: { passed: 0, failed: 0, errors: [] }
};

/**
 * Database verification tests
 */
async function verifyDatabase() {
  console.log('\n🔍 Verifying Database...');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // Test 1: Check if all required tables exist
    const tables = [
      'production_lines', 'production_plans', 'production_tasks', 'production_orders',
      'equipment_master', 'molds', 'equipment_maintenance',
      'quality_inspections', 'defect_records', 'inspection_standards',
      'materials_master', 'inventory', 'inventory_transactions', 'storage_locations'
    ];
    
    const existingTables = [];
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        existingTables.push({ table, count: rows[0].count });
        console.log(`✅ Table ${table}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`❌ Table ${table}: Missing or error - ${error.message}`);
        testResults.overall.errors.push(`Database table ${table} missing or inaccessible`);
        testResults.overall.failed++;
      }
    }
    
    testResults.database.tables = existingTables;
    
    // Test 2: Verify minimum data requirements
    const minRequirements = {
      production_lines: 4,
      equipment_master: 6,
      molds: 8,
      materials_master: 11,
      production_plans: 10,
      production_tasks: 20,
      quality_inspections: 15,
      inventory: 20,
      inventory_transactions: 30
    };
    
    let dataRequirementsMet = true;
    for (const [table, minCount] of Object.entries(minRequirements)) {
      const tableData = existingTables.find(t => t.table === table);
      if (!tableData || tableData.count < minCount) {
        console.log(`❌ ${table}: Expected at least ${minCount}, found ${tableData?.count || 0}`);
        testResults.overall.errors.push(`${table} has insufficient data: ${tableData?.count || 0} < ${minCount}`);
        dataRequirementsMet = false;
      } else {
        console.log(`✅ ${table}: ${tableData.count} >= ${minCount} (requirement met)`);
      }
    }
    
    if (dataRequirementsMet) {
      testResults.overall.passed++;
      console.log('✅ Database data requirements met');
    } else {
      testResults.overall.failed++;
    }
    
    // Test 3: Check data relationships
    try {
      const [planTasks] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM production_tasks pt 
        JOIN production_plans pp ON pt.plan_id = pp.id
      `);
      
      const [equipmentMolds] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM molds m 
        JOIN equipment_master em ON m.equipment_id = em.id
      `);
      
      console.log(`✅ Data relationships: ${planTasks[0].count} plan-task links, ${equipmentMolds[0].count} equipment-mold links`);
      testResults.database.relationships = {
        planTasks: planTasks[0].count,
        equipmentMolds: equipmentMolds[0].count
      };
      testResults.overall.passed++;
    } catch (error) {
      console.log(`❌ Data relationship check failed: ${error.message}`);
      testResults.overall.errors.push(`Data relationship verification failed: ${error.message}`);
      testResults.overall.failed++;
    }
    
    await connection.end();
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    testResults.overall.errors.push(`Database connection failed: ${error.message}`);
    testResults.overall.failed++;
  }
}

/**
 * API endpoint verification tests
 */
async function verifyAPI() {
  console.log('\n🌐 Verifying API Endpoints...');
  
  const endpoints = [
    // Production module
    { path: '/api/production/plans', module: 'production' },
    { path: '/api/production/tasks', module: 'production' },
    { path: '/api/production/work-reports', module: 'production' },
    
    // Equipment module
    { path: '/api/equipment', module: 'equipment' },
    { path: '/api/equipment/molds', module: 'equipment' },
    { path: '/api/equipment/maintenance', module: 'equipment' },
    
    // Quality module
    { path: '/api/quality/inspections', module: 'quality' },
    { path: '/api/quality/defects', module: 'quality' },
    { path: '/api/quality/standards', module: 'quality' },
    
    // Inventory module
    { path: '/api/inventory', module: 'inventory' },
    { path: '/api/inventory/transactions', module: 'inventory' },
    { path: '/api/inventory/locations', module: 'inventory' },
    
    // Reports module
    { path: '/api/reports/production', module: 'reports' },
    { path: '/api/reports/quality', module: 'reports' },
    { path: '/api/reports/equipment', module: 'reports' }
  ];
  
  testResults.api.endpoints = [];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}${endpoint.path}`, {
        timeout: 5000,
        params: { page: 1, pageSize: 10 }
      });
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200 && response.data.success) {
        console.log(`✅ ${endpoint.path}: ${response.status} (${responseTime}ms)`);
        testResults.api.endpoints.push({
          path: endpoint.path,
          module: endpoint.module,
          status: 'success',
          responseTime,
          dataCount: response.data.data?.items?.length || response.data.data?.length || 0
        });
        testResults.overall.passed++;
      } else {
        console.log(`❌ ${endpoint.path}: Invalid response format`);
        testResults.api.endpoints.push({
          path: endpoint.path,
          module: endpoint.module,
          status: 'invalid_format',
          responseTime
        });
        testResults.overall.errors.push(`API ${endpoint.path} returned invalid format`);
        testResults.overall.failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.path}: ${error.message}`);
      testResults.api.endpoints.push({
        path: endpoint.path,
        module: endpoint.module,
        status: 'error',
        error: error.message
      });
      testResults.overall.errors.push(`API ${endpoint.path} failed: ${error.message}`);
      testResults.overall.failed++;
    }
  }
}

/**
 * Performance verification tests
 */
async function verifyPerformance() {
  console.log('\n⚡ Verifying Performance...');
  
  const performanceTests = [
    { path: '/api/production/plans', name: 'Production Plans' },
    { path: '/api/equipment', name: 'Equipment List' },
    { path: '/api/quality/inspections', name: 'Quality Inspections' },
    { path: '/api/inventory', name: 'Inventory List' }
  ];
  
  testResults.performance.tests = [];
  
  for (const test of performanceTests) {
    try {
      const times = [];
      
      // Run 5 requests to get average response time
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await axios.get(`${API_BASE_URL}${test.path}`, {
          timeout: 5000,
          params: { page: 1, pageSize: 50 }
        });
        times.push(Date.now() - startTime);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      const passed = avgTime < 2000; // Requirement: < 2 seconds
      
      console.log(`${passed ? '✅' : '❌'} ${test.name}: Avg ${avgTime.toFixed(0)}ms, Max ${maxTime}ms`);
      
      testResults.performance.tests.push({
        name: test.name,
        path: test.path,
        avgTime: Math.round(avgTime),
        maxTime,
        passed
      });
      
      if (passed) {
        testResults.overall.passed++;
      } else {
        testResults.overall.failed++;
        testResults.overall.errors.push(`Performance test failed for ${test.name}: ${avgTime.toFixed(0)}ms > 2000ms`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: Performance test failed - ${error.message}`);
      testResults.performance.tests.push({
        name: test.name,
        path: test.path,
        error: error.message,
        passed: false
      });
      testResults.overall.failed++;
      testResults.overall.errors.push(`Performance test error for ${test.name}: ${error.message}`);
    }
  }
}

/**
 * Data consistency verification
 */
async function verifyDataConsistency() {
  console.log('\n🔄 Verifying Data Consistency...');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // Test 1: Compare production plans count
    const [dbPlans] = await connection.execute('SELECT COUNT(*) as count FROM production_plans');
    const apiPlans = await axios.get(`${API_BASE_URL}/api/production/plans?pageSize=1000`);
    
    const dbCount = dbPlans[0].count;
    const apiCount = apiPlans.data.data?.total || apiPlans.data.data?.items?.length || 0;
    
    if (dbCount === apiCount) {
      console.log(`✅ Production plans consistency: DB=${dbCount}, API=${apiCount}`);
      testResults.overall.passed++;
    } else {
      console.log(`❌ Production plans inconsistency: DB=${dbCount}, API=${apiCount}`);
      testResults.overall.errors.push(`Production plans count mismatch: DB=${dbCount}, API=${apiCount}`);
      testResults.overall.failed++;
    }
    
    // Test 2: Compare equipment count
    const [dbEquipment] = await connection.execute('SELECT COUNT(*) as count FROM equipment_master');
    const apiEquipment = await axios.get(`${API_BASE_URL}/api/equipment?pageSize=1000`);
    
    const dbEqCount = dbEquipment[0].count;
    const apiEqCount = apiEquipment.data.data?.total || apiEquipment.data.data?.items?.length || 0;
    
    if (dbEqCount === apiEqCount) {
      console.log(`✅ Equipment consistency: DB=${dbEqCount}, API=${apiEqCount}`);
      testResults.overall.passed++;
    } else {
      console.log(`❌ Equipment inconsistency: DB=${dbEqCount}, API=${apiEqCount}`);
      testResults.overall.errors.push(`Equipment count mismatch: DB=${dbEqCount}, API=${apiEqCount}`);
      testResults.overall.failed++;
    }
    
    testResults.database.consistency = {
      productionPlans: { db: dbCount, api: apiCount, consistent: dbCount === apiCount },
      equipment: { db: dbEqCount, api: apiEqCount, consistent: dbEqCount === apiEqCount }
    };
    
    await connection.end();
    
  } catch (error) {
    console.log(`❌ Data consistency check failed: ${error.message}`);
    testResults.overall.errors.push(`Data consistency verification failed: ${error.message}`);
    testResults.overall.failed++;
  }
}

/**
 * Frontend component verification (basic check)
 */
async function verifyFrontend() {
  console.log('\n🖥️  Verifying Frontend Components...');
  
  // Check if key component files exist and don't import mockData
  const componentFiles = [
    'client/src/components/production/WorkshopPlan.js',
    'client/src/components/production/ProductionTasks.js',
    'client/src/components/equipment/EquipmentManagement.js',
    'client/src/components/quality/QualityInspection.js',
    'client/src/components/inventory/InventoryManagement.js',
    'client/src/components/reports/ProductionReports.js'
  ];
  
  testResults.frontend.components = [];
  
  for (const filePath of componentFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check if component still imports mockData
      const hasMockDataImport = content.includes('mockData') || content.includes('../data/mockData');
      
      // Check if component uses DataService
      const usesDataService = content.includes('DataService') || content.includes('useDataService');
      
      const migrated = !hasMockDataImport && usesDataService;
      
      console.log(`${migrated ? '✅' : '❌'} ${path.basename(filePath)}: ${migrated ? 'Migrated' : 'Not migrated'}`);
      
      testResults.frontend.components.push({
        file: filePath,
        migrated,
        hasMockDataImport,
        usesDataService
      });
      
      if (migrated) {
        testResults.overall.passed++;
      } else {
        testResults.overall.failed++;
        testResults.overall.errors.push(`Component ${filePath} not properly migrated`);
      }
      
    } catch (error) {
      console.log(`❌ ${filePath}: File not found or error reading`);
      testResults.frontend.components.push({
        file: filePath,
        error: error.message,
        migrated: false
      });
      testResults.overall.failed++;
      testResults.overall.errors.push(`Component file ${filePath} not accessible: ${error.message}`);
    }
  }
  
  // Check if DataService exists
  try {
    const dataServiceContent = await fs.readFile('client/src/services/DataService.js', 'utf8');
    const hasAllModules = ['production', 'equipment', 'quality', 'inventory', 'reports']
      .every(module => dataServiceContent.includes(module));
    
    if (hasAllModules) {
      console.log('✅ DataService: All modules implemented');
      testResults.overall.passed++;
    } else {
      console.log('❌ DataService: Missing some modules');
      testResults.overall.failed++;
      testResults.overall.errors.push('DataService missing some module implementations');
    }
    
    testResults.frontend.dataService = { exists: true, hasAllModules };
    
  } catch (error) {
    console.log('❌ DataService: Not found or error reading');
    testResults.frontend.dataService = { exists: false, error: error.message };
    testResults.overall.failed++;
    testResults.overall.errors.push(`DataService not accessible: ${error.message}`);
  }
}

/**
 * Generate comprehensive test report
 */
async function generateReport() {
  console.log('\n📊 Generating Test Report...');
  
  const reportPath = 'logs/final-system-verification-report.json';
  const summaryPath = 'logs/final-system-verification-summary.md';
  
  // Ensure logs directory exists
  try {
    await fs.mkdir('logs', { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  // Save detailed JSON report
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  
  // Generate markdown summary
  const summary = `# Final System Verification Report

Generated: ${testResults.timestamp}

## Overall Results
- ✅ **Passed**: ${testResults.overall.passed}
- ❌ **Failed**: ${testResults.overall.failed}
- 📊 **Success Rate**: ${((testResults.overall.passed / (testResults.overall.passed + testResults.overall.failed)) * 100).toFixed(1)}%

## Database Verification
${testResults.database.tables ? `
### Tables Status
${testResults.database.tables.map(t => `- ${t.table}: ${t.count} records`).join('\n')}
` : ''}

${testResults.database.consistency ? `
### Data Consistency
- Production Plans: DB=${testResults.database.consistency.productionPlans.db}, API=${testResults.database.consistency.productionPlans.api} ${testResults.database.consistency.productionPlans.consistent ? '✅' : '❌'}
- Equipment: DB=${testResults.database.consistency.equipment.db}, API=${testResults.database.consistency.equipment.api} ${testResults.database.consistency.equipment.consistent ? '✅' : '❌'}
` : ''}

## API Verification
${testResults.api.endpoints ? `
### Endpoint Status
${testResults.api.endpoints.map(e => `- ${e.path}: ${e.status === 'success' ? `✅ ${e.responseTime}ms` : `❌ ${e.status}`}`).join('\n')}
` : ''}

## Performance Results
${testResults.performance.tests ? `
${testResults.performance.tests.map(t => `- ${t.name}: ${t.passed ? '✅' : '❌'} Avg ${t.avgTime}ms`).join('\n')}
` : ''}

## Frontend Migration Status
${testResults.frontend.components ? `
${testResults.frontend.components.map(c => `- ${path.basename(c.file)}: ${c.migrated ? '✅ Migrated' : '❌ Not migrated'}`).join('\n')}
` : ''}

${testResults.frontend.dataService ? `
### DataService
- Exists: ${testResults.frontend.dataService.exists ? '✅' : '❌'}
- All Modules: ${testResults.frontend.dataService.hasAllModules ? '✅' : '❌'}
` : ''}

## Issues Found
${testResults.overall.errors.length > 0 ? 
  testResults.overall.errors.map(error => `- ❌ ${error}`).join('\n') : 
  '✅ No issues found!'
}

## Recommendations
${testResults.overall.failed > 0 ? `
⚠️  **Action Required**: ${testResults.overall.failed} test(s) failed. Please review and fix the issues above before considering the migration complete.

### Next Steps:
1. Fix any database data issues
2. Resolve API endpoint problems
3. Complete component migrations
4. Re-run this verification script
` : `
🎉 **Migration Complete**: All tests passed! The system has been successfully migrated from mock data to database.

### System is ready for:
- Production use
- User acceptance testing
- Performance monitoring
- Further development
`}

---
*Report generated by final-system-verification.js*
`;
  
  await fs.writeFile(summaryPath, summary);
  
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log(`📋 Summary report saved to: ${summaryPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Final System Verification...');
  console.log('='.repeat(50));
  
  try {
    await verifyDatabase();
    await verifyAPI();
    await verifyPerformance();
    await verifyDataConsistency();
    await verifyFrontend();
    await generateReport();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL RESULTS:');
    console.log(`✅ Passed: ${testResults.overall.passed}`);
    console.log(`❌ Failed: ${testResults.overall.failed}`);
    console.log(`📈 Success Rate: ${((testResults.overall.passed / (testResults.overall.passed + testResults.overall.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.overall.failed > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      testResults.overall.errors.forEach(error => console.log(`   - ${error}`));
      console.log('\n❌ Migration verification FAILED. Please fix the issues above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration verification PASSED! System is ready for production.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n💥 Verification script failed:', error.message);
    testResults.overall.errors.push(`Script execution error: ${error.message}`);
    await generateReport();
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  main();
}

module.exports = { main, testResults };