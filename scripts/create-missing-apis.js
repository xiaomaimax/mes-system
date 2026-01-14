#!/usr/bin/env node

/**
 * 创建缺失的API模型和路由
 * 为工艺、生产、库存、质量、设备等模块创建必要的模型和API
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../server/models');
const routesDir = path.join(__dirname, '../server/routes');

console.log('🔄 开始创建缺失的API模型和路由...\n');

// 1. 创建 ProcessRouting 模型
const processRoutingModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessRouting = sequelize.define('ProcessRouting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routing_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  process_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  process_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  equipment_id: {
    type: DataTypes.INTEGER
  },
  mold_id: {
    type: DataTypes.INTEGER
  },
  estimated_time: {
    type: DataTypes.INTEGER
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'process_routing',
  timestamps: true,
  underscored: true
});

module.exports = ProcessRouting;
`;

// 2. 创建 ProcessParameters 模型
const processParametersModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessParameters = sequelize.define('ProcessParameters', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routing_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parameter_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  parameter_value: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(50)
  },
  min_value: {
    type: DataTypes.DECIMAL(10, 2)
  },
  max_value: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'process_parameters',
  timestamps: true,
  underscored: true
});

module.exports = ProcessParameters;
`;

// 3. 创建 ProductionLine 模型
const productionLineModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionLine = sequelize.define('ProductionLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  line_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  line_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  capacity_per_hour: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'production_lines',
  timestamps: true,
  underscored: true
});

module.exports = ProductionLine;
`;

// 4. 创建 Inventory 模型
const inventoryModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  warehouse_location: {
    type: DataTypes.STRING(100)
  },
  current_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  min_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: '个'
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  underscored: true
});

module.exports = Inventory;
`;

// 5. 创建 InventoryTransaction 模型
const inventoryTransactionModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.ENUM('in_stock', 'out_stock', 'adjust'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reference_type: {
    type: DataTypes.ENUM('purchase', 'production', 'sale', 'adjustment'),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.STRING(50)
  },
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_transactions',
  timestamps: true,
  underscored: true
});

module.exports = InventoryTransaction;
`;

// 6. 创建 QualityInspection 模型
const qualityInspectionModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualityInspection = sequelize.define('QualityInspection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspection_type: {
    type: DataTypes.ENUM('incoming', 'in_process', 'final'),
    allowNull: false
  },
  inspected_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qualified_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defective_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quality_rate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  inspector_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inspection_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  defect_types: {
    type: DataTypes.JSON
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quality_inspections',
  timestamps: true,
  underscored: true
});

module.exports = QualityInspection;
`;

// 7. 创建 DefectRecord 模型
const defectRecordModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DefectRecord = sequelize.define('DefectRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  defect_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  defect_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  defect_category: {
    type: DataTypes.STRING(50)
  },
  severity: {
    type: DataTypes.ENUM('minor', 'major', 'critical'),
    defaultValue: 'minor'
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'defect_records',
  timestamps: true,
  underscored: true
});

module.exports = DefectRecord;
`;

// 8. 创建 EquipmentMaintenance 模型
const equipmentMaintenanceModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipmentMaintenance = sequelize.define('EquipmentMaintenance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'inspection'),
    allowNull: false
  },
  maintenance_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completion_date: {
    type: DataTypes.DATE
  },
  description: {
    type: DataTypes.TEXT
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'equipment_maintenance',
  timestamps: true,
  underscored: true
});

module.exports = EquipmentMaintenance;
`;

// 9. 创建 ShiftSchedule 模型
const shiftScheduleModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShiftSchedule = sequelize.define('ShiftSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shift_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  shift_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'shift_schedule',
  timestamps: true,
  underscored: true
});

module.exports = ShiftSchedule;
`;

// 10. 创建 DailyProductionReport 模型
const dailyProductionReportModel = `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyProductionReport = sequelize.define('DailyProductionReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  production_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  shift_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  planned_quantity: {
    type: DataTypes.INTEGER
  },
  actual_quantity: {
    type: DataTypes.INTEGER
  },
  qualified_quantity: {
    type: DataTypes.INTEGER
  },
  defective_quantity: {
    type: DataTypes.INTEGER
  },
  downtime_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downtime_reason: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'daily_production_report',
  timestamps: true,
  underscored: true
});

module.exports = DailyProductionReport;
`;

// 写入模型文件
const models = [
  { name: 'ProcessRouting.js', content: processRoutingModel },
  { name: 'ProcessParameters.js', content: processParametersModel },
  { name: 'ProductionLine.js', content: productionLineModel },
  { name: 'Inventory.js', content: inventoryModel },
  { name: 'InventoryTransaction.js', content: inventoryTransactionModel },
  { name: 'QualityInspection.js', content: qualityInspectionModel },
  { name: 'DefectRecord.js', content: defectRecordModel },
  { name: 'EquipmentMaintenance.js', content: equipmentMaintenanceModel },
  { name: 'ShiftSchedule.js', content: shiftScheduleModel },
  { name: 'DailyProductionReport.js', content: dailyProductionReportModel }
];

console.log('📝 创建模型文件...\n');
models.forEach(model => {
  const filePath = path.join(modelsDir, model.name);
  fs.writeFileSync(filePath, model.content);
  console.log(`   ✅ ${model.name}`);
});

console.log('\n✅ 所有模型文件创建完成！\n');
console.log('📌 下一步：');
console.log('   1. 更新 server/models/index.js 导入这些新模型');
console.log('   2. 创建相应的API路由文件');
console.log('   3. 在 server/app.js 中注册这些路由\n');
