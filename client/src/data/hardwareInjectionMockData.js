/**
 * 五金注塑MES系统模拟数据
 * 涵盖完整的制造执行系统数据链路
 */

// ==================== 产品主数据 ====================
export const productMasterData = {
  // 五金产品
  hardware: [
    {
      productCode: 'HW-001',
      productName: '不锈钢门把手',
      category: '五金件',
      specification: '304不锈钢，长度150mm',
      unit: '个',
      weight: 0.35,
      material: '304不锈钢',
      surfaceTreatment: '拉丝处理',
      standardPrice: 28.50,
      customerCode: 'CUST-001',
      customerName: '华润置地',
      designDrawing: 'DWG-HW001-V2.1',
      qualityLevel: 'A级',
      shelfLife: 0, // 无保质期
      status: 'active'
    },
    {
      productCode: 'HW-002', 
      productName: '铝合金窗锁',
      category: '五金件',
      specification: '6063铝合金，表面阳极氧化',
      unit: '套',
      weight: 0.28,
      material: '6063铝合金',
      surfaceTreatment: '阳极氧化',
      standardPrice: 45.80,
      customerCode: 'CUST-002',
      customerName: '万科集团',
      designDrawing: 'DWG-HW002-V1.3',
      qualityLevel: 'A级',
      shelfLife: 0,
      status: 'active'
    },
    {
      productCode: 'HW-003',
      productName: '精密轴承座',
      category: '机械零件',
      specification: '45#钢，调质处理，公差±0.02mm',
      unit: '个',
      weight: 1.25,
      material: '45#钢',
      surfaceTreatment: '调质+镀锌',
      standardPrice: 85.60,
      customerCode: 'CUST-003',
      customerName: '三一重工',
      designDrawing: 'DWG-HW003-V3.0',
      qualityLevel: 'S级',
      shelfLife: 0,
      status: 'active'
    }
  ],
  
  // 注塑产品
  injection: [
    {
      productCode: 'INJ-001',
      productName: '汽车仪表盘外壳',
      category: '注塑件',
      specification: 'ABS+PC材料，UV防护',
      unit: '个',
      weight: 0.85,
      material: 'ABS+PC合金',
      surfaceTreatment: 'UV涂层',
      standardPrice: 125.00,
      customerCode: 'CUST-004',
      customerName: '比亚迪汽车',
      designDrawing: 'DWG-INJ001-V4.2',
      qualityLevel: 'A级',
      shelfLife: 0,
      status: 'active'
    },
    {
      productCode: 'INJ-002',
      productName: '家电控制面板',
      category: '注塑件', 
      specification: 'PC材料，阻燃V0级',
      unit: '个',
      weight: 0.15,
      material: 'PC阻燃料',
      surfaceTreatment: '丝印+UV',
      standardPrice: 18.50,
      customerCode: 'CUST-005',
      customerName: '美的集团',
      designDrawing: 'DWG-INJ002-V2.8',
      qualityLevel: 'A级',
      shelfLife: 0,
      status: 'active'
    },
    {
      productCode: 'INJ-003',
      productName: '医疗器械外壳',
      category: '注塑件',
      specification: '医用级PC材料，可高温消毒',
      unit: '个',
      weight: 0.45,
      material: '医用PC',
      surfaceTreatment: '抗菌涂层',
      standardPrice: 68.00,
      customerCode: 'CUST-006',
      customerName: '迈瑞医疗',
      designDrawing: 'DWG-INJ003-V1.5',
      qualityLevel: 'S级',
      shelfLife: 0,
      status: 'active'
    }
  ]
};

// ==================== 工艺路线数据 ====================
export const processRoutes = {
  // 五金工艺路线
  'HW-001': {
    routeCode: 'RT-HW001',
    routeName: '不锈钢门把手工艺路线',
    version: 'V2.1',
    operations: [
      {
        opCode: 'OP010',
        opName: '下料',
        workCenter: 'WC-001',
        equipment: '数控剪板机',
        standardTime: 5, // 分钟
        setupTime: 15,
        parameters: {
          material: '304不锈钢板 t=3mm',
          cuttingSpeed: '80mm/min',
          bladeGap: '0.1mm'
        }
      },
      {
        opCode: 'OP020', 
        opName: '冲压成型',
        workCenter: 'WC-002',
        equipment: '200T冲床',
        standardTime: 8,
        setupTime: 30,
        parameters: {
          pressure: '180T',
          strokeSpeed: '15次/分',
          lubricant: '冲压油'
        }
      },
      {
        opCode: 'OP030',
        opName: '精加工',
        workCenter: 'WC-003', 
        equipment: 'CNC加工中心',
        standardTime: 12,
        setupTime: 45,
        parameters: {
          spindleSpeed: '3000rpm',
          feedRate: '500mm/min',
          coolant: '水溶性切削液'
        }
      },
      {
        opCode: 'OP040',
        opName: '表面处理',
        workCenter: 'WC-004',
        equipment: '拉丝机',
        standardTime: 6,
        setupTime: 10,
        parameters: {
          grainSize: '320#',
          pressure: '0.3MPa',
          speed: '1200rpm'
        }
      },
      {
        opCode: 'OP050',
        opName: '质检包装',
        workCenter: 'WC-005',
        equipment: '检测台',
        standardTime: 4,
        setupTime: 5,
        parameters: {
          checkItems: ['尺寸', '表面质量', '功能测试'],
          packingType: '防护膜+纸盒'
        }
      }
    ]
  },

  // 注塑工艺路线
  'INJ-001': {
    routeCode: 'RT-INJ001',
    routeName: '汽车仪表盘外壳注塑工艺',
    version: 'V4.2',
    operations: [
      {
        opCode: 'OP010',
        opName: '原料准备',
        workCenter: 'WC-101',
        equipment: '干燥机',
        standardTime: 240, // 4小时
        setupTime: 30,
        parameters: {
          temperature: '80°C',
          time: '4小时',
          moisture: '<0.02%'
        }
      },
      {
        opCode: 'OP020',
        opName: '注塑成型',
        workCenter: 'WC-102',
        equipment: '350T注塑机',
        standardTime: 3.5,
        setupTime: 60,
        parameters: {
          injectionPressure: '120MPa',
          injectionSpeed: '50mm/s',
          moldTemperature: '60°C',
          cycleTime: '210秒'
        }
      },
      {
        opCode: 'OP030',
        opName: '去毛刺',
        workCenter: 'WC-103',
        equipment: '去毛刺工作台',
        standardTime: 2,
        setupTime: 5,
        parameters: {
          toolType: '精密刀具',
          checkPoints: '分型线、浇口'
        }
      },
      {
        opCode: 'OP040',
        opName: 'UV涂装',
        workCenter: 'WC-104',
        equipment: 'UV涂装线',
        standardTime: 8,
        setupTime: 20,
        parameters: {
          coatingThickness: '15-20μm',
          cureTime: '30秒',
          uvIntensity: '1000mJ/cm²'
        }
      },
      {
        opCode: 'OP050',
        opName: '最终检验',
        workCenter: 'WC-105',
        equipment: '三坐标测量机',
        standardTime: 5,
        setupTime: 15,
        parameters: {
          toleranceCheck: '±0.1mm',
          appearanceCheck: '无划伤、气泡',
          functionalTest: '装配测试'
        }
      }
    ]
  }
};

// ==================== 设备主数据 ====================
export const equipmentMasterData = [
  // 五金设备
  {
    equipmentCode: 'EQ-HW001',
    equipmentName: '数控剪板机',
    model: 'QC12Y-8×3200',
    manufacturer: '南通锻压',
    workCenter: 'WC-001',
    workshop: '五金车间',
    installDate: '2022-03-15',
    warrantyExpiry: '2025-03-15',
    maintenanceCycle: 30, // 天
    lastMaintenance: '2024-12-01',
    nextMaintenance: '2024-12-31',
    status: 'running',
    specifications: {
      maxThickness: '8mm',
      maxWidth: '3200mm',
      cuttingAccuracy: '±0.1mm',
      power: '7.5kW'
    }
  },
  {
    equipmentCode: 'EQ-HW002',
    equipmentName: '200T冲床',
    model: 'J23-200',
    manufacturer: '扬州锻压',
    workCenter: 'WC-002',
    workshop: '五金车间',
    installDate: '2021-08-20',
    warrantyExpiry: '2024-08-20',
    maintenanceCycle: 15,
    lastMaintenance: '2024-12-10',
    nextMaintenance: '2024-12-25',
    status: 'running',
    specifications: {
      nominalForce: '200T',
      strokeLength: '100mm',
      strokesPerMinute: '25次',
      power: '11kW'
    }
  },
  
  // 注塑设备
  {
    equipmentCode: 'EQ-INJ001',
    equipmentName: '350T注塑机',
    model: 'HTF350X2',
    manufacturer: '海天国际',
    workCenter: 'WC-102',
    workshop: '注塑车间',
    installDate: '2023-01-10',
    warrantyExpiry: '2026-01-10',
    maintenanceCycle: 7,
    lastMaintenance: '2024-12-18',
    nextMaintenance: '2024-12-25',
    status: 'running',
    specifications: {
      clampingForce: '350T',
      injectionVolume: '850cm³',
      screwDiameter: '50mm',
      power: '45kW'
    }
  },
  {
    equipmentCode: 'EQ-INJ002',
    equipmentName: 'UV涂装线',
    model: 'UV-LINE-2000',
    manufacturer: '东莞涂装',
    workCenter: 'WC-104',
    workshop: '注塑车间',
    installDate: '2022-11-05',
    warrantyExpiry: '2025-11-05',
    maintenanceCycle: 14,
    lastMaintenance: '2024-12-05',
    nextMaintenance: '2024-12-19',
    status: 'maintenance',
    specifications: {
      lineSpeed: '2m/min',
      cureIntensity: '1200mJ/cm²',
      workWidth: '500mm',
      power: '25kW'
    }
  }
];

// ==================== 原材料库存数据 ====================
export const materialInventory = [
  // 五金原材料
  {
    materialCode: 'MAT-SS304-001',
    materialName: '304不锈钢板',
    specification: '3mm×1500mm×3000mm',
    category: '金属材料',
    unit: '张',
    supplier: '宝钢不锈钢',
    unitPrice: 285.00,
    currentStock: 156,
    safetyStock: 50,
    maxStock: 300,
    location: 'A区-01-01',
    lastInbound: '2024-12-15',
    inboundQty: 80,
    qualityStatus: 'qualified'
  },
  {
    materialCode: 'MAT-AL6063-001',
    materialName: '6063铝合金型材',
    specification: '40mm×60mm×6000mm',
    category: '金属材料',
    unit: '根',
    supplier: '中铝集团',
    unitPrice: 45.60,
    currentStock: 89,
    safetyStock: 30,
    maxStock: 150,
    location: 'A区-02-03',
    lastInbound: '2024-12-12',
    inboundQty: 50,
    qualityStatus: 'qualified'
  },
  
  // 注塑原材料
  {
    materialCode: 'MAT-ABS-001',
    materialName: 'ABS+PC合金粒子',
    specification: 'Bayblend T65XF',
    category: '塑料粒子',
    unit: 'kg',
    supplier: '科思创',
    unitPrice: 28.50,
    currentStock: 2850,
    safetyStock: 500,
    maxStock: 5000,
    location: 'B区-01-05',
    lastInbound: '2024-12-18',
    inboundQty: 1000,
    qualityStatus: 'qualified'
  },
  {
    materialCode: 'MAT-PC-001',
    materialName: 'PC阻燃粒子',
    specification: 'Makrolon 2458',
    category: '塑料粒子',
    unit: 'kg',
    supplier: '拜耳材料',
    unitPrice: 35.80,
    currentStock: 1650,
    safetyStock: 300,
    maxStock: 3000,
    location: 'B区-02-08',
    lastInbound: '2024-12-16',
    inboundQty: 800,
    qualityStatus: 'qualified'
  }
];

// ==================== 生产计划数据 ====================
export const productionPlans = [
  {
    planCode: 'PLAN-2024122501',
    productCode: 'HW-001',
    productName: '不锈钢门把手',
    customerOrder: 'SO-CUST001-241220',
    planQty: 500,
    completedQty: 320,
    planStartDate: '2024-12-25',
    planEndDate: '2024-12-28',
    actualStartDate: '2024-12-25',
    priority: 'high',
    status: 'in_progress',
    workshop: '五金车间',
    productionLine: '生产线1',
    planManager: '张工程师'
  },
  {
    planCode: 'PLAN-2024122502',
    productCode: 'INJ-001',
    productName: '汽车仪表盘外壳',
    customerOrder: 'SO-CUST004-241218',
    planQty: 1000,
    completedQty: 0,
    planStartDate: '2024-12-26',
    planEndDate: '2024-12-30',
    actualStartDate: null,
    priority: 'medium',
    status: 'planned',
    workshop: '注塑车间',
    productionLine: '注塑线2',
    planManager: '李工程师'
  }
];

// ==================== 质量检验数据 ====================
export const qualityInspections = [
  // IQC来料检验
  {
    inspectionCode: 'IQC-2024122501',
    inspectionType: 'IQC',
    materialCode: 'MAT-SS304-001',
    materialName: '304不锈钢板',
    batchNo: 'BT20241215001',
    supplier: '宝钢不锈钢',
    inspectionDate: '2024-12-15',
    inspector: '王检验员',
    sampleQty: 5,
    totalQty: 80,
    result: 'qualified',
    defectRate: 0,
    inspectionItems: [
      { item: '化学成分', standard: 'GB/T 20878', result: '合格', value: 'Cr18.2%, Ni8.1%' },
      { item: '厚度', standard: '3.0±0.1mm', result: '合格', value: '3.02mm' },
      { item: '表面质量', standard: '无划伤、锈蚀', result: '合格', value: '表面光洁' }
    ]
  },
  
  // IPQC过程检验
  {
    inspectionCode: 'IPQC-2024122501',
    inspectionType: 'IPQC',
    productCode: 'HW-001',
    productName: '不锈钢门把手',
    workOrder: 'WO-2024122501',
    operation: 'OP030-精加工',
    inspectionDate: '2024-12-25',
    inspector: '刘检验员',
    sampleQty: 10,
    totalQty: 100,
    result: 'qualified',
    defectRate: 0,
    inspectionItems: [
      { item: '长度尺寸', standard: '150±0.5mm', result: '合格', value: '149.8mm' },
      { item: '孔径', standard: 'Φ8+0.1/-0', result: '合格', value: 'Φ8.05mm' },
      { item: '表面粗糙度', standard: 'Ra≤1.6', result: '合格', value: 'Ra1.2' }
    ]
  },
  
  // FQC成品检验
  {
    inspectionCode: 'FQC-2024122501',
    inspectionType: 'FQC',
    productCode: 'INJ-002',
    productName: '家电控制面板',
    workOrder: 'WO-2024122401',
    inspectionDate: '2024-12-24',
    inspector: '陈检验员',
    sampleQty: 20,
    totalQty: 200,
    result: 'qualified',
    defectRate: 1.5,
    inspectionItems: [
      { item: '外观质量', standard: '无气泡、划伤', result: '合格', value: '表面光滑' },
      { item: '尺寸精度', standard: '±0.1mm', result: '合格', value: '0.08mm' },
      { item: '阻燃等级', standard: 'V0级', result: '合格', value: 'V0' },
      { item: '按键手感', standard: '0.8-1.2N', result: '合格', value: '1.0N' }
    ]
  }
];

// ==================== 生产报工数据 ====================
export const workReports = [
  {
    reportCode: 'WR-2024122501',
    workOrder: 'WO-2024122501',
    productCode: 'HW-001',
    operation: 'OP020-冲压成型',
    operator: '张师傅',
    workCenter: 'WC-002',
    equipment: 'EQ-HW002',
    reportDate: '2024-12-25',
    shift: '白班',
    startTime: '08:00',
    endTime: '12:00',
    planQty: 100,
    completedQty: 95,
    qualifiedQty: 93,
    defectQty: 2,
    scrapQty: 0,
    efficiency: 95,
    defectRate: 2.1,
    defectReasons: [
      { reason: '毛刺过大', qty: 1 },
      { reason: '尺寸超差', qty: 1 }
    ]
  },
  {
    reportCode: 'WR-2024122502',
    workOrder: 'WO-2024122402',
    productCode: 'INJ-002',
    operation: 'OP020-注塑成型',
    operator: '李师傅',
    workCenter: 'WC-102',
    equipment: 'EQ-INJ001',
    reportDate: '2024-12-24',
    shift: '夜班',
    startTime: '20:00',
    endTime: '06:00',
    planQty: 200,
    completedQty: 198,
    qualifiedQty: 195,
    defectQty: 3,
    scrapQty: 0,
    efficiency: 99,
    defectRate: 1.5,
    defectReasons: [
      { reason: '气泡', qty: 2 },
      { reason: '缺料', qty: 1 }
    ]
  }
];

// ==================== 设备维护记录 ====================
export const maintenanceRecords = [
  {
    recordCode: 'MT-2024122001',
    equipmentCode: 'EQ-HW002',
    equipmentName: '200T冲床',
    maintenanceType: '预防性维护',
    planDate: '2024-12-20',
    actualDate: '2024-12-20',
    maintainer: '维修班组A',
    duration: 4, // 小时
    status: 'completed',
    workItems: [
      { item: '更换液压油', status: '完成', remark: '使用46#液压油' },
      { item: '检查模具导���', status: '完成', remark: '导向正常' },
      { item: '清洁润滑系统', status: '完成', remark: '已清洁并加注润滑脂' },
      { item: '校准压力表', status: '完成', remark: '压力表精度正常' }
    ],
    spareParts: [
      { partCode: 'SP-001', partName: '液压油', qty: 20, unit: 'L' },
      { partCode: 'SP-002', partName: '润滑脂', qty: 2, unit: 'kg' }
    ],
    cost: 850.00
  },
  {
    recordCode: 'MT-2024121801',
    equipmentCode: 'EQ-INJ001',
    equipmentName: '350T注塑机',
    maintenanceType: '日常保养',
    planDate: '2024-12-18',
    actualDate: '2024-12-18',
    maintainer: '维修班组B',
    duration: 2,
    status: 'completed',
    workItems: [
      { item: '检查螺杆磨损', status: '完成', remark: '磨损轻微，继续使用' },
      { item: '清洁料筒', status: '完成', remark: '已清洁，无异物' },
      { item: '检查加热圈', status: '完成', remark: '加热正常' },
      { item: '润滑导轨', status: '完成', remark: '已润滑' }
    ],
    spareParts: [
      { partCode: 'SP-003', partName: '清洁剂', qty: 1, unit: '瓶' }
    ],
    cost: 120.00
  }
];

// ==================== 库存流水记录 ====================
export const inventoryTransactions = [
  {
    transactionCode: 'IT-2024122501',
    materialCode: 'MAT-SS304-001',
    materialName: '304不锈钢板',
    transactionType: 'inbound',
    qty: 80,
    unit: '张',
    unitPrice: 285.00,
    totalAmount: 22800.00,
    supplier: '宝钢不锈钢',
    purchaseOrder: 'PO-2024121201',
    batchNo: 'BT20241215001',
    location: 'A区-01-01',
    operator: '仓管员A',
    transactionDate: '2024-12-15',
    remark: '来料检验合格入库'
  },
  {
    transactionCode: 'IT-2024122502',
    materialCode: 'MAT-SS304-001',
    materialName: '304不锈钢板',
    transactionType: 'outbound',
    qty: 15,
    unit: '张',
    workOrder: 'WO-2024122501',
    productCode: 'HW-001',
    location: 'A区-01-01',
    operator: '仓管员A',
    transactionDate: '2024-12-25',
    remark: '生产领料'
  }
];

// ==================== 报表数据汇总 ====================
export const reportSummary = {
  // 生产效率报表
  productionEfficiency: {
    date: '2024-12-25',
    workshops: [
      {
        workshop: '五金车间',
        planQty: 500,
        actualQty: 320,
        efficiency: 64.0,
        defectRate: 2.1,
        equipmentUtilization: 85.5
      },
      {
        workshop: '注塑车间',
        planQty: 800,
        actualQty: 750,
        efficiency: 93.8,
        defectRate: 1.8,
        equipmentUtilization: 92.3
      }
    ]
  },
  
  // 质量统计报表
  qualityStatistics: {
    period: '2024-12',
    totalInspections: 156,
    qualifiedRate: 97.8,
    defectAnalysis: [
      { defectType: '尺寸超差', count: 8, percentage: 35.2 },
      { defectType: '表面缺陷', count: 6, percentage: 26.4 },
      { defectType: '功能异常', count: 4, percentage: 17.6 },
      { defectType: '其他', count: 5, percentage: 20.8 }
    ]
  },
  
  // 设备OEE报表
  equipmentOEE: {
    period: '2024-12',
    equipments: [
      {
        equipmentCode: 'EQ-HW002',
        availability: 95.2,
        performance: 88.5,
        quality: 97.9,
        oee: 82.4
      },
      {
        equipmentCode: 'EQ-INJ001',
        availability: 98.1,
        performance: 94.2,
        quality: 98.5,
        oee: 91.0
      }
    ]
  },
  
  // 库存周转报表
  inventoryTurnover: {
    period: '2024-12',
    materials: [
      {
        materialCode: 'MAT-SS304-001',
        avgInventory: 180,
        consumption: 120,
        turnoverRate: 8.0,
        turnoverDays: 45.6
      },
      {
        materialCode: 'MAT-ABS-001',
        avgInventory: 2200,
        consumption: 1800,
        turnoverRate: 9.8,
        turnoverDays: 37.2
      }
    ]
  }
};

// 导出所有数据
export default {
  productMasterData,
  processRoutes,
  equipmentMasterData,
  materialInventory,
  productionPlans,
  qualityInspections,
  workReports,
  maintenanceRecords,
  inventoryTransactions,
  reportSummary
};