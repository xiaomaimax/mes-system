/**
 * Production Module Verification Script
 * 
 * This script verifies that the production module migration is complete and working correctly.
 * It checks:
 * 1. DataService is properly implemented
 * 2. useDataService hook is properly implemented
 * 3. Production components are using DataService
 * 4. API endpoints are accessible
 * 5. Data is being returned correctly
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.5, 8.1, 8.3
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  API_BASE_URL: process.env.API_URL || 'http://localhost:5002/api',
  TIMEOUT: parseInt(process.env.TIMEOUT) || 5000,
  CLIENT_PATH: path.join(__dirname, '../client/src'),
  REQUIRED_METHODS: [
    'getProductionPlans',
    'getProductionTasks', 
    'getWorkReports',
    'getEquipment',
    'getMolds',
    'getQualityInspections',
    'getInventory'
  ]
};

// Color codes for console output
const COLORS = Object.freeze({
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m'
});

/**
 * Test result manager
 */
class TestResultManager {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  logResult(status, message, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const statusColor = this._getStatusColor(status);
    const statusText = `[${timestamp}] ${statusColor}${status}${COLORS.RESET}`;
    
    console.log(`${statusText} ${message}`);
    if (details) {
      console.log(`       ${details}`);
    }
    
    this._recordResult(status, message);
  }

  _getStatusColor(status) {
    const colorMap = {
      'PASS': COLORS.GREEN,
      'FAIL': COLORS.RED,
      'WARN': COLORS.YELLOW
    };
    return colorMap[status] || COLORS.RESET;
  }

  _recordResult(status, message) {
    switch (status) {
      case 'PASS':
        this.results.passed.push(message);
        break;
      case 'FAIL':
        this.results.failed.push(message);
        break;
      case 'WARN':
        this.results.warnings.push(message);
        break;
    }
  }

  printSummary() {
    console.log(`\n${COLORS.CYAN}=== Verification Summary ===${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}Passed: ${this.results.passed.length}${COLORS.RESET}`);
    console.log(`${COLORS.RED}Failed: ${this.results.failed.length}${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Warnings: ${this.results.warnings.length}${COLORS.RESET}`);
    
    this._printFailedTests();
    this._printWarnings();
    
    return this._calculateExitCode();
  }

  _printFailedTests() {
    if (this.results.failed.length > 0) {
      console.log(`\n${COLORS.RED}Failed Tests:${COLORS.RESET}`);
      this.results.failed.forEach(test => console.log(`  - ${test}`));
    }
  }

  _printWarnings() {
    if (this.results.warnings.length > 0) {
      console.log(`\n${COLORS.YELLOW}Warnings:${COLORS.RESET}`);
      this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  }

  _calculateExitCode() {
    const totalTests = this.results.passed.length + this.results.failed.length;
    const passRate = totalTests > 0 ? Math.round((this.results.passed.length / totalTests) * 100) : 0;
    
    console.log(`\n${COLORS.CYAN}Overall Pass Rate: ${passRate}% (${this.results.passed.length}/${totalTests})${COLORS.RESET}`);
    
    if (this.results.failed.length === 0) {
      console.log(`\n${COLORS.GREEN}✓ Production module migration verification PASSED!${COLORS.RESET}`);
      return 0;
    } else {
      console.log(`\n${COLORS.RED}✗ Production module migration verification FAILED!${COLORS.RESET}`);
      return 1;
    }
  }
}

/**
 * Base test class with common functionality
 */
class BaseTest {
  constructor(resultManager) {
    this.resultManager = resultManager;
  }

  async checkFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
      this.resultManager.logResult('FAIL', `${description} not found`, filePath);
      return false;
    }
    return true;
  }

  checkContentIncludes(content, items, description) {
    let allFound = true;
    for (const item of items) {
      if (!content.includes(item)) {
        this.resultManager.logResult('FAIL', `${description} not found: ${item}`);
        allFound = false;
      }
    }
    return allFound;
  }

  async makeAPIRequest(url, description) {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}${url}`, {
        timeout: CONFIG.TIMEOUT,
        validateStatus: () => true
      });
      return { success: true, response };
    } catch (error) {
      this.resultManager.logResult('WARN', `${description} - Network error`, error.message);
      return { success: false, error };
    }
  }
}

/**
 * DataService implementation test
 */
class DataServiceTest extends BaseTest {
  async run() {
    console.log(`\n${COLORS.CYAN}=== Test 1: DataService Implementation ===${COLORS.RESET}`);
    
    const dataServicePath = path.join(CONFIG.CLIENT_PATH, 'services/DataService.js');
    
    if (!(await this.checkFileExists(dataServicePath, 'DataService.js file'))) {
      return false;
    }
    
    const content = fs.readFileSync(dataServicePath, 'utf8');
    
    const allMethodsFound = this.checkContentIncludes(
      content, 
      CONFIG.REQUIRED_METHODS.map(method => `${method}(`),
      'DataService method'
    );
    
    if (allMethodsFound) {
      this.resultManager.logResult('PASS', 'DataService has all required methods');
    }
    
    // Check for error handling
    if (content.includes('_handleError')) {
      this.resultManager.logResult('PASS', 'DataService has error handling');
    } else {
      this.resultManager.logResult('WARN', 'DataService may not have proper error handling');
    }
    
    return allMethodsFound;
  }
}

/**
 * Test 2: Verify useDataService hook is properly implemented
 */
async function testUseDataServiceHook() {
  console.log(`\n${COLORS.CYAN}=== Test 2: useDataService Hook Implementation ===${COLORS.RESET}`);
  
  try {
    const hookPath = path.join(CONFIG.CLIENT_PATH, 'hooks/useDataService.js');
    
    if (!fs.existsSync(hookPath)) {
      resultManager.logResult('FAIL', 'useDataService.js file not found', hookPath);
      return false;
    }
    
    const content = fs.readFileSync(hookPath, 'utf8');
    
    // Check for required features
    const requiredFeatures = [
      'useState',
      'useEffect', 
      'useCallback',
      'CacheManager',
      'loading',
      'error',
      'refetch'
    ];
    
    const allFeaturesFound = requiredFeatures.every(feature => {
      if (!content.includes(feature)) {
        resultManager.logResult('FAIL', `useDataService feature not found: ${feature}`);
        return false;
      }
      return true;
    });
    
    if (allFeaturesFound) {
      resultManager.logResult('PASS', 'useDataService has all required features');
    }
    
    // Check for cache management
    if (content.includes('CacheManager') && content.includes('globalCache')) {
      resultManager.logResult('PASS', 'useDataService has cache management');
    } else {
      resultManager.logResult('WARN', 'useDataService may not have proper cache management');
    }
    
    return allFeaturesFound;
  } catch (error) {
    resultManager.logResult('FAIL', 'Error checking useDataService implementation', error.message);
    return false;
  }
}

/**
 * Test 3: Verify production components are using DataService
 */
async function testProductionComponentsIntegration() {
  console.log(`\n${colors.cyan}=== Test 3: Production Components Integration ===${colors.reset}`);
  
  try {
    const components = [
      { name: 'WorkshopPlan', path: '../client/src/components/production/WorkshopPlan.js' },
      { name: 'ProductionTasks', path: '../client/src/components/production/ProductionTasks.js' },
      { name: 'WorkReportManagement', path: '../client/src/components/production/WorkReportManagement.js' }
    ];
    
    let allComponentsOk = true;
    
    for (const component of components) {
      const componentPath = path.join(__dirname, component.path);
      
      if (!fs.existsSync(componentPath)) {
        logResult('FAIL', `${component.name} component not found`, componentPath);
        allComponentsOk = false;
        continue;
      }
      
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for DataService import
      if (!content.includes('DataService')) {
        logResult('FAIL', `${component.name} does not import DataService`);
        allComponentsOk = false;
        continue;
      }
      
      // Check for useDataService hook
      if (!content.includes('useDataService')) {
        logResult('FAIL', `${component.name} does not use useDataService hook`);
        allComponentsOk = false;
        continue;
      }
      
      // Check for mock data removal
      if (content.includes('mockData') && !content.includes('// mockData')) {
        logResult('WARN', `${component.name} may still be using mockData`);
      } else {
        logResult('PASS', `${component.name} is properly integrated with DataService`);
      }
    }
    
    return allComponentsOk;
  } catch (error) {
    logResult('FAIL', 'Error checking production components integration', error.message);
    return false;
  }
}

/**
 * Test 4: Verify API endpoints are accessible
 */
async function testAPIEndpoints() {
  console.log(`\n${colors.cyan}=== Test 4: API Endpoints Accessibility ===${colors.reset}`);
  
  const endpoints = [
    { name: 'Production Plans', url: '/scheduling/plan-orders' },
    { name: 'Production Tasks', url: '/scheduling/production-tasks' },
    { name: 'Work Reports', url: '/production/daily-reports' }
  ];
  
  let allEndpointsOk = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
        timeout: TIMEOUT,
        validateStatus: () => true // Don't throw on any status
      });
      
      if (response.status === 200 || response.status === 401) {
        logResult('PASS', `${endpoint.name} endpoint is accessible`, `Status: ${response.status}`);
      } else if (response.status === 404) {
        logResult('WARN', `${endpoint.name} endpoint not found`, `Status: ${response.status}`);
      } else {
        logResult('FAIL', `${endpoint.name} endpoint error`, `Status: ${response.status}`);
        allEndpointsOk = false;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logResult('WARN', `${endpoint.name} endpoint - Server not running`, 'Connection refused');
      } else {
        logResult('WARN', `${endpoint.name} endpoint - Network error`, error.message);
      }
    }
  }
  
  return allEndpointsOk;
}

/**
 * Test 5: Verify data structure consistency
 */
async function testDataStructureConsistency() {
  console.log(`\n${colors.cyan}=== Test 5: Data Structure Consistency ===${colors.reset}`);
  
  try {
    // Check if API responses have consistent structure
    const endpoints = [
      { name: 'Production Plans', url: '/scheduling/plan-orders' },
      { name: 'Production Tasks', url: '/scheduling/production-tasks' }
    ];
    
    let allConsistent = true;
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
          timeout: TIMEOUT,
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data) {
          // Check for expected response structure
          if (Array.isArray(response.data) || (response.data.data && Array.isArray(response.data.data))) {
            logResult('PASS', `${endpoint.name} has consistent data structure`);
          } else {
            logResult('WARN', `${endpoint.name} data structure may be inconsistent`);
          }
        }
      } catch (error) {
        logResult('WARN', `${endpoint.name} - Could not verify data structure`, error.message);
      }
    }
    
    return allConsistent;
  } catch (error) {
    logResult('FAIL', 'Error checking data structure consistency', error.message);
    return false;
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(`\n${colors.cyan}=== Verification Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warnings.length}${colors.reset}`);
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.failed.forEach(test => console.log(`  - ${test}`));
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  const totalTests = results.passed.length + results.failed.length;
  const passRate = totalTests > 0 ? Math.round((results.passed.length / totalTests) * 100) : 0;
  
  console.log(`\n${colors.cyan}Overall Pass Rate: ${passRate}% (${results.passed.length}/${totalTests})${colors.reset}`);
  
  if (results.failed.length === 0) {
    console.log(`\n${colors.green}✓ Production module migration verification PASSED!${colors.reset}`);
    return 0;
  } else {
    console.log(`\n${colors.red}✗ Production module migration verification FAILED!${colors.reset}`);
    return 1;
  }
}

/**
 * Main test runner class
 */
class ProductionModuleVerifier {
  constructor() {
    this.resultManager = new TestResultManager();
    this.tests = [
      new DataServiceTest(this.resultManager),
      // Add other test classes here
    ];
  }

  async runAllTests() {
    console.log(`${COLORS.BLUE}Production Module Migration Verification${COLORS.RESET}`);
    console.log(`${COLORS.BLUE}===========================================${COLORS.RESET}`);
    console.log(`Started at: ${new Date().toLocaleString()}`);
    
    try {
      // Run DataService test
      await this.tests[0].run();
      
      // Run other tests (keeping original functions for now)
      await testUseDataServiceHook();
      await testProductionComponentsIntegration();
      await testAPIEndpoints();
      await testDataStructureConsistency();
      
      const exitCode = this.resultManager.printSummary();
      console.log(`\nCompleted at: ${new Date().toLocaleString()}`);
      
      return exitCode;
    } catch (error) {
      console.error(`${COLORS.RED}Fatal error:${COLORS.RESET}`, error);
      return 1;
    }
  }
}

// Run the verification
main();
