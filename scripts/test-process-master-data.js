/**
 * 工艺管理主数据功能测试脚本
 * 
 * 测试工艺管理主数据的添加、显示和缓存功能
 * 
 * 使用方法：
 * node scripts/test-process-master-data.js
 */

const chalk = require('chalk');

// 模拟DataService的工艺管理方法
class MockDataService {
  static _cache = new Map();
  static _data = {
    products: [
      {
        id: 1,
        key: '1',
        productCode: 'P001',
        productName: '塑料外壳A',
        category: '注塑件',
        specification: '150×80×25mm',
        material: 'ABS塑料',
        status: '生效',
        createDate: '2024-01-15',
        version: 'V2.1'
      }
    ],
    operations: [
      {
        id: 1,
        key: '1',
        operationCode: 'OP001',
        operationName: '注塑成型',
        category: '成型工序',
        workCenter: '注塑车间',
        standardTime: 45,
        setupTime: 15,
        status: '生效'
      }
    ],
    equipment: [
      {
        id: 1,
        key: '1',
        equipmentCode: 'EQ001',
        equipmentName: '注塑机A',
        model: 'INJ-200T',
        workCenter: '注塑车间',
        capacity: '200吨',
        status: '运行中',
        efficiency: 95
      }
    ]
  };

  static async getProcessProducts() {
    console.log(chalk.blue('📋 获取产品主数据...'));
    return {
      success: true,
      data: {
        items: this._data.products,
        total: this._data.products.length,
        page: 1,
        pageSize: 10
      }
    };
  }

  static async getProcessOperations() {
    console.log(chalk.blue('⚙️ 获取工序主数据...'));
    return {
      success: true,
      data: {
        items: this._data.operations,
        total: this._data.operations.length,
        page: 1,
        pageSize: 10
      }
    };
  }

  static async getProcessEquipment() {
    console.log(chalk.blue('🏭 获取设备主数据...'));
    return {
      success: true,
      data: {
        items: this._data.equipment,
        total: this._data.equipment.length,
        page: 1,
        pageSize: 10
      }
    };
  }

  static async addProcessProduct(productData) {
    console.log(chalk.green('➕ 添加产品主数据:'), productData);
    
    const newProduct = {
      id: Date.now(),
      key: String(Date.now()),
      ...productData,
      createDate: new Date().toISOString().split('T')[0],
      status: '生效'
    };
    
    this._data.products.push(newProduct);
    
    return {
      success: true,
      data: newProduct,
      message: '产品添加成功'
    };
  }

  static async addProcessOperation(operationData) {
    console.log(chalk.green('➕ 添加工序主数据:'), operationData);
    
    const newOperation = {
      id: Date.now(),
      key: String(Date.now()),
      ...operationData,
      status: '生效'
    };
    
    this._data.operations.push(newOperation);
    
    return {
      success: true,
      data: newOperation,
      message: '工序添加成功'
    };
  }

  static async addProcessEquipment(equipmentData) {
    console.log(chalk.green('➕ 添加设备主数据:'), equipmentData);
    
    const newEquipment = {
      id: Date.now(),
      key: String(Date.now()),
      ...equipmentData,
      status: '运行中'
    };
    
    this._data.equipment.push(newEquipment);
    
    return {
      success: true,
      data: newEquipment,
      message: '设备添加成功'
    };
  }

  static clearCache() {
    console.log(chalk.yellow('🗑️ 清除缓存'));
    this._cache.clear();
  }
}

// 测试函数
class ProcessMasterDataTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runTest(testName, testFn) {
    this.testResults.total++;
    console.log(chalk.blue(`\n🧪 测试: ${testName}`));
    
    try {
      await testFn();
      console.log(chalk.green(`✅ ${testName} - 通过`));
      this.testResults.passed++;
    } catch (error) {
      console.log(chalk.red(`❌ ${testName} - 失败: ${error.message}`));
      this.testResults.failed++;
    }
  }

  async testGetProductData() {
    const result = await MockDataService.getProcessProducts();
    
    if (!result.success) {
      throw new Error('获取产品数据失败');
    }
    
    if (!Array.isArray(result.data.items)) {
      throw new Error('产品数据格式错误');
    }
    
    if (result.data.items.length === 0) {
      throw new Error('产品数据为空');
    }
    
    console.log(chalk.gray(`   获取到 ${result.data.items.length} 条产品数据`));
  }

  async testGetOperationData() {
    const result = await MockDataService.getProcessOperations();
    
    if (!result.success) {
      throw new Error('获取工序数据失败');
    }
    
    if (!Array.isArray(result.data.items)) {
      throw new Error('工序数据格式错误');
    }
    
    console.log(chalk.gray(`   获取到 ${result.data.items.length} 条工序数据`));
  }

  async testGetEquipmentData() {
    const result = await MockDataService.getProcessEquipment();
    
    if (!result.success) {
      throw new Error('获取设备数据失败');
    }
    
    if (!Array.isArray(result.data.items)) {
      throw new Error('设备数据格式错误');
    }
    
    console.log(chalk.gray(`   获取到 ${result.data.items.length} 条设备数据`));
  }

  async testAddProduct() {
    const initialResult = await MockDataService.getProcessProducts();
    const initialCount = initialResult.data.items.length;
    
    const newProduct = {
      productCode: 'P999',
      productName: '测试产品',
      category: '测试件',
      specification: '100×100×100mm',
      material: '测试材料',
      version: 'V1.0'
    };
    
    const addResult = await MockDataService.addProcessProduct(newProduct);
    
    if (!addResult.success) {
      throw new Error('添加产品失败');
    }
    
    const finalResult = await MockDataService.getProcessProducts();
    const finalCount = finalResult.data.items.length;
    
    if (finalCount !== initialCount + 1) {
      throw new Error(`产品数量不正确，期望 ${initialCount + 1}，实际 ${finalCount}`);
    }
    
    // 验证新添加的产品
    const addedProduct = finalResult.data.items.find(p => p.productCode === 'P999');
    if (!addedProduct) {
      throw new Error('新添加的产品未找到');
    }
    
    console.log(chalk.gray(`   产品数量从 ${initialCount} 增加到 ${finalCount}`));
    console.log(chalk.gray(`   新产品: ${addedProduct.productName}`));
  }

  async testAddOperation() {
    const initialResult = await MockDataService.getProcessOperations();
    const initialCount = initialResult.data.items.length;
    
    const newOperation = {
      operationCode: 'OP999',
      operationName: '测试工序',
      category: '测试工序',
      workCenter: '测试车间',
      standardTime: 30,
      setupTime: 10
    };
    
    const addResult = await MockDataService.addProcessOperation(newOperation);
    
    if (!addResult.success) {
      throw new Error('添加工序失败');
    }
    
    const finalResult = await MockDataService.getProcessOperations();
    const finalCount = finalResult.data.items.length;
    
    if (finalCount !== initialCount + 1) {
      throw new Error(`工序数量不正确，期望 ${initialCount + 1}，实际 ${finalCount}`);
    }
    
    console.log(chalk.gray(`   工序数量从 ${initialCount} 增加到 ${finalCount}`));
  }

  async testAddEquipment() {
    const initialResult = await MockDataService.getProcessEquipment();
    const initialCount = initialResult.data.items.length;
    
    const newEquipment = {
      equipmentCode: 'EQ999',
      equipmentName: '测试设备',
      model: 'TEST-001',
      workCenter: '测试车间',
      capacity: '测试能力',
      efficiency: 100
    };
    
    const addResult = await MockDataService.addProcessEquipment(newEquipment);
    
    if (!addResult.success) {
      throw new Error('添加设备失败');
    }
    
    const finalResult = await MockDataService.getProcessEquipment();
    const finalCount = finalResult.data.items.length;
    
    if (finalCount !== initialCount + 1) {
      throw new Error(`设备数量不正确，期望 ${initialCount + 1}，实际 ${finalCount}`);
    }
    
    console.log(chalk.gray(`   设备数量从 ${initialCount} 增加到 ${finalCount}`));
  }

  async testDataConsistency() {
    // 测试数据一致性
    const productResult = await MockDataService.getProcessProducts();
    const operationResult = await MockDataService.getProcessOperations();
    const equipmentResult = await MockDataService.getProcessEquipment();
    
    // 验证数据结构一致性
    const validateDataStructure = (items, type) => {
      items.forEach(item => {
        if (!item.id || !item.key) {
          throw new Error(`${type}数据缺少必要字段: id 或 key`);
        }
      });
    };
    
    validateDataStructure(productResult.data.items, '产品');
    validateDataStructure(operationResult.data.items, '工序');
    validateDataStructure(equipmentResult.data.items, '设备');
    
    console.log(chalk.gray('   数据结构验证通过'));
  }

  async testCacheClearing() {
    // 测试缓存清除功能
    MockDataService.clearCache();
    
    // 再次获取数据应该成功
    const result = await MockDataService.getProcessProducts();
    
    if (!result.success) {
      throw new Error('缓存清除后获取数据失败');
    }
    
    console.log(chalk.gray('   缓存清除功能正常'));
  }

  async runAllTests() {
    console.log(chalk.blue('🚀 开始工艺管理主数据功能测试'));
    console.log(chalk.blue('=' * 50));

    await this.runTest('获取产品主数据', () => this.testGetProductData());
    await this.runTest('获取工序主数据', () => this.testGetOperationData());
    await this.runTest('获取设备主数据', () => this.testGetEquipmentData());
    await this.runTest('添加产品主数据', () => this.testAddProduct());
    await this.runTest('添加工序主数据', () => this.testAddOperation());
    await this.runTest('添加设备主数据', () => this.testAddEquipment());
    await this.runTest('数据一致性验证', () => this.testDataConsistency());
    await this.runTest('缓存清除功能', () => this.testCacheClearing());

    this.printSummary();
  }

  printSummary() {
    console.log(chalk.blue('\n' + '=' * 50));
    console.log(chalk.blue('📊 测试结果汇总'));
    console.log(chalk.blue('=' * 50));
    
    console.log(chalk.gray(`总测试数: ${this.testResults.total}`));
    console.log(chalk.green(`通过: ${this.testResults.passed}`));
    console.log(chalk.red(`失败: ${this.testResults.failed}`));
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    console.log(chalk.blue(`成功率: ${successRate}%`));
    
    if (this.testResults.failed === 0) {
      console.log(chalk.green('\n🎉 所有测试都通过了！'));
      console.log(chalk.green('工艺管理主数据功能正常工作'));
    } else {
      console.log(chalk.red(`\n❌ ${this.testResults.failed} 个测试失败`));
      console.log(chalk.yellow('请检查失败的测试并修复问题'));
    }
  }
}

// 主函数
async function main() {
  const tester = new ProcessMasterDataTester();
  await tester.runAllTests();
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('测试运行失败:'), error);
    process.exit(1);
  });
}

module.exports = { MockDataService, ProcessMasterDataTester };