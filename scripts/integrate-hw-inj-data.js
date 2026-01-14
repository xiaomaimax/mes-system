/**
 * 为所有组件集成五金(HW)和注塑(INJ)模拟数据
 */

const fs = require('fs');
const path = require('path');

// 需要集成数据的组件及其数据类型
const componentsToUpdate = {
  'client/src/components/SimpleProduction.js': {
    imports: ['productionData', 'baseData'],
    dataUsage: 'productionPlans, equipment, productionLines'
  },
  'client/src/components/SimpleProcess.js': {
    imports: ['processData'],
    dataUsage: 'processRoutes, processParameters'
  },
  'client/src/components/SimpleEquipment.js': {
    imports: ['baseData'],
    dataUsage: 'equipment'
  },
  'client/src/components/SimpleQuality.js': {
    imports: ['qualityData'],
    dataUsage: 'iqcInspections, pqcInspections, fqcInspections, defectRecords'
  },
  'client/src/components/SimpleInventory.js': {
    imports: ['inventoryData', 'baseData'],
    dataUsage: 'stockInfo, materials'
  },
  'client/src/components/production/ProductionMasterDataManagement.js': {
    imports: ['baseData', 'productionData'],
    dataUsage: 'products, productionLines, equipment'
  },
  'client/src/components/production/WorkshopPlanManagement.js': {
    imports: ['productionData', 'baseData'],
    dataUsage: 'productionPlans, productionLines'
  },
  'client/src/components/production/ProductionTaskManagement.js': {
    imports: ['productionData'],
    dataUsage: 'productionTasks'
  },
  'client/src/components/production/WorkReportManagement.js': {
    imports: ['productionData'],
    dataUsage: 'workReports'
  },
  'client/src/components/process/ProcessMasterData.js': {
    imports: ['processData', 'baseData'],
    dataUsage: 'processRoutes, equipment'
  },
  'client/src/components/process/ProcessRouting.js': {
    imports: ['processData'],
    dataUsage: 'processRoutes'
  },
  'client/src/components/process/ProcessParameters.js': {
    imports: ['processData'],
    dataUsage: 'processParameters'
  },
  'client/src/components/equipment/EquipmentMasterData.js': {
    imports: ['baseData'],
    dataUsage: 'equipment, productionLines'
  },
  'client/src/components/equipment/EquipmentMaintenance.js': {
    imports: ['equipmentData'],
    dataUsage: 'maintenanceRecords'
  },
  'client/src/components/equipment/EquipmentInspection.js': {
    imports: ['equipmentData'],
    dataUsage: 'inspectionRecords'
  },
  'client/src/components/quality/IQCInspection.js': {
    imports: ['qualityData'],
    dataUsage: 'iqcInspections'
  },
  'client/src/components/quality/PQCInspection.js': {
    imports: ['qualityData'],
    dataUsage: 'pqcInspections'
  },
  'client/src/components/quality/FQCInspection.js': {
    imports: ['qualityData'],
    dataUsage: 'fqcInspections'
  },
  'client/src/components/quality/DefectReasons.js': {
    imports: ['qualityData'],
    dataUsage: 'defectRecords'
  },
  'client/src/components/inventory/InventoryMasterData.js': {
    imports: ['baseData', 'inventoryData'],
    dataUsage: 'materials, stockInfo'
  },
  'client/src/components/inventory/InventoryInOut.js': {
    imports: ['inventoryData'],
    dataUsage: 'inboundRecords, outboundRecords'
  },
  'client/src/components/inventory/InventoryCount.js': {
    imports: ['inventoryData'],
    dataUsage: 'stockInfo'
  },
  'client/src/components/HomePage.js': {
    imports: ['baseData', 'productionData', 'qualityData', 'equipmentData', 'inventoryData'],
    dataUsage: 'all'
  }
};

let totalUpdated = 0;

function updateComponent(filePath, imports) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 检查是否已经导入了 mockData
    if (content.includes("from '../data/mockData'") || content.includes("from '../../data/mockData'")) {
      console.log(`⏭️ 跳过: ${path.basename(filePath)} (已导入 mockData)`);
      return false;
    }

    // 确定导入路径
    const depth = filePath.split('/').length - 3; // 计算相对深度
    const importPath = depth === 1 ? '../data/mockData' : '../../data/mockData';

    // 构建导入语句
    const importStatement = `import { ${imports.join(', ')} } from '${importPath}';`;

    // 找到最后一个 import 语句
    const lastImportMatch = content.match(/^import .+;$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertPos = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 更新: ${path.basename(filePath)} - 导入 [${imports.join(', ')}]`);
      totalUpdated++;
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ 错误: ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('🔧 开始集成五金和注塑模拟数据...\n');

for (const [filePath, config] of Object.entries(componentsToUpdate)) {
  updateComponent(filePath, config.imports);
}

console.log(`\n✅ 完成! 共更新 ${totalUpdated} 个组件`);
console.log('\n📝 下一步: 各组件需要在 useState 中使用导入的数据');
console.log('   例如: const [data, setData] = useState(productionPlans);');
