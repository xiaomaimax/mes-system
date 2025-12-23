// MES系统模拟测试数据
// 为各个模块提供完整的演示数据

// 基础数据
export const baseData = {
  // 产品信息
  products: [
    { id: 'P001', name: '智能手机主板', model: 'MB-5G-Pro', category: '电子产品', unit: '片' },
    { id: 'P002', name: '汽车控制器', model: 'ECU-V2.1', category: '汽车零部件', unit: '个' },
    { id: 'P003', name: '工业传感器', model: 'SEN-T400', category: '传感器', unit: '个' },
    { id: 'P004', name: '电源适配器', model: 'PSU-65W', category: '电源设备', unit: '个' },
    { id: 'P005', name: '显示屏模组', model: 'LCD-7inch', category: '显示设备', unit: '片' }
  ],

  // 生产线信息
  productionLines: [
    { id: 'LINE001', name: '生产线A', type: 'SMT贴片线', capacity: 1000, status: '运行中' },
    { id: 'LINE002', name: '生产线B', type: '组装线', capacity: 800, status: '运行中' },
    { id: 'LINE003', name: '生产线C', type: '测试线', capacity: 600, status: '维护中' },
    { id: 'LINE004', name: '生产线D', type: '包装线', capacity: 1200, status: '运行中' },
    { id: 'LINE005', name: '生产线E', type: '老化线', capacity: 400, status: '运行中' }
  ],

  // 设备信息
  equipment: [
    { id: 'EQ001', name: 'SMT贴片机A1', type: '贴片设备', line: 'LINE001', status: '运行中', utilization: 92 },
    { id: 'EQ002', name: 'SMT贴片机A2', type: '贴片设备', line: 'LINE001', status: '运行中', utilization: 88 },
    { id: 'EQ003', name: '回流焊炉B1', type: '焊接设备', line: 'LINE001', status: '运行中', utilization: 95 },
    { id: 'EQ004', name: 'AOI检测机C1', type: '检测设备', line: 'LINE002', status: '运行中', utilization: 87 },
    { id: 'EQ005', name: '组装机器人D1', type: '组装设备', line: 'LINE002', status: '维护中', utilization: 0 },
    { id: 'EQ006', name: '功能测试台E1', type: '测试设备', line: 'LINE003', status: '运行中', utilization: 78 },
    { id: 'EQ007', name: '包装机F1', type: '包装设备', line: 'LINE004', status: '运行中', utilization: 85 },
    { id: 'EQ008', name: '老化测试柜G1', type: '老化设备', line: 'LINE005', status: '运行中', utilization: 90 }
  ],

  // 物料信息
  materials: [
    { id: 'M001', name: 'PCB基板', spec: 'FR4-1.6mm', supplier: '华强电子', category: '基材', unit: '片' },
    { id: 'M002', name: '电阻0402', spec: '10KΩ±1%', supplier: '风华高科', category: '电子元件', unit: '个' },
    { id: 'M003', name: '电容0603', spec: '100nF±10%', supplier: '三星电机', category: '电子元件', unit: '个' },
    { id: 'M004', name: 'CPU芯片', spec: 'ARM-A78', supplier: '联发科', category: '芯片', unit: '个' },
    { id: 'M005', name: '连接器', spec: '40Pin-0.5mm', supplier: '富士康', category: '连接器', unit: '个' },
    { id: 'M006', name: '锡膏', spec: 'SAC305', supplier: '阿尔法', category: '辅料', unit: 'kg' },
    { id: 'M007', name: '包装盒', spec: '防静电盒', supplier: '包装厂', category: '包材', unit: '个' }
  ],

  // 员工信息
  employees: [
    { id: 'EMP001', name: '张三', department: '生产部', position: '生产主管', shift: '白班', skill: 'A级' },
    { id: 'EMP002', name: '李四', department: '生产部', position: '操作员', shift: '白班', skill: 'B级' },
    { id: 'EMP003', name: '王五', department: '质量部', position: '质检员', shift: '白班', skill: 'A级' },
    { id: 'EMP004', name: '赵六', department: '设备部', position: '维修工', shift: '夜班', skill: 'A级' },
    { id: 'EMP005', name: '钱七', department: '技术部', position: '工艺工程师', shift: '白班', skill: 'S级' },
    { id: 'EMP006', name: '孙八', department: '生产部', position: '操作员', shift: '夜班', skill: 'B级' },
    { id: 'EMP007', name: '周九', department: '质量部', position: '质量工程师', shift: '白班', skill: 'A级' },
    { id: 'EMP008', name: '吴十', department: '设备部', position: '设备工程师', shift: '白班', skill: 'A级' }
  ]
};

// 生产管理数据
export const productionData = {
  // 生产计划
  productionPlans: [
    {
      id: 'PLAN001',
      productId: 'P001',
      productName: '智能手机主板',
      planDate: '2024-12-22',
      planQty: 1000,
      actualQty: 950,
      status: '进行中',
      progress: 95,
      startTime: '08:00',
      endTime: '20:00',
      lineId: 'LINE001',
      lineName: '生产线A'
    },
    {
      id: 'PLAN002',
      productId: 'P002',
      productName: '汽车控制器',
      planDate: '2024-12-22',
      planQty: 500,
      actualQty: 520,
      status: '已完成',
      progress: 100,
      startTime: '08:00',
      endTime: '16:30',
      lineId: 'LINE002',
      lineName: '生产线B'
    },
    {
      id: 'PLAN003',
      productId: 'P003',
      productName: '工业传感器',
      planDate: '2024-12-23',
      planQty: 800,
      actualQty: 0,
      status: '计划中',
      progress: 0,
      startTime: '08:00',
      endTime: '18:00',
      lineId: 'LINE001',
      lineName: '生产线A'
    }
  ],

  // 生产任务
  productionTasks: [
    {
      id: 'TASK001',
      planId: 'PLAN001',
      taskName: 'SMT贴片',
      operator: '张三',
      status: '进行中',
      startTime: '2024-12-22 08:00:00',
      planEndTime: '2024-12-22 12:00:00',
      actualEndTime: null,
      progress: 80,
      equipment: 'EQ001'
    },
    {
      id: 'TASK002',
      planId: 'PLAN001',
      taskName: '回流焊接',
      operator: '李四',
      status: '等待中',
      startTime: null,
      planEndTime: '2024-12-22 14:00:00',
      actualEndTime: null,
      progress: 0,
      equipment: 'EQ003'
    },
    {
      id: 'TASK003',
      planId: 'PLAN002',
      taskName: '功能测试',
      operator: '王五',
      status: '已完成',
      startTime: '2024-12-22 08:00:00',
      planEndTime: '2024-12-22 16:00:00',
      actualEndTime: '2024-12-22 15:30:00',
      progress: 100,
      equipment: 'EQ006'
    }
  ],

  // 生产报工数据
  workReports: [
    {
      id: 'WR001',
      date: '2024-12-22',
      shift: '白班',
      line: 'LINE001',
      product: 'P001',
      operator: '张三',
      planQty: 500,
      actualQty: 480,
      qualifiedQty: 475,
      defectQty: 5,
      efficiency: 96,
      startTime: '08:00',
      endTime: '12:00'
    },
    {
      id: 'WR002',
      date: '2024-12-22',
      shift: '白班',
      line: 'LINE002',
      product: 'P002',
      operator: '李四',
      planQty: 300,
      actualQty: 310,
      qualifiedQty: 308,
      defectQty: 2,
      efficiency: 103,
      startTime: '08:00',
      endTime: '12:00'
    }
  ]
};

// 质量管理数据
export const qualityData = {
  // IQC检验数据
  iqcInspections: [
    {
      id: 'IQC001',
      date: '2024-12-22',
      materialId: 'M001',
      materialName: 'PCB基板',
      batchNo: 'B20241222001',
      supplier: '华强电子',
      inspector: '王五',
      sampleQty: 50,
      inspectedQty: 50,
      passedQty: 48,
      defectQty: 2,
      passRate: 96,
      status: '合格',
      defectTypes: ['尺寸偏差', '表面划伤']
    },
    {
      id: 'IQC002',
      date: '2024-12-22',
      materialId: 'M004',
      materialName: 'CPU芯片',
      batchNo: 'B20241222002',
      supplier: '联发科',
      inspector: '周九',
      sampleQty: 20,
      inspectedQty: 20,
      passedQty: 20,
      defectQty: 0,
      passRate: 100,
      status: '合格',
      defectTypes: []
    }
  ],

  // PQC检验数据
  pqcInspections: [
    {
      id: 'PQC001',
      date: '2024-12-22',
      productId: 'P001',
      productName: '智能手机主板',
      processStep: 'SMT贴片',
      inspector: '王五',
      sampleQty: 30,
      inspectedQty: 30,
      passedQty: 29,
      defectQty: 1,
      passRate: 96.7,
      status: '合格',
      defectTypes: ['元件偏移']
    }
  ],

  // FQC检验数据
  fqcInspections: [
    {
      id: 'FQC001',
      date: '2024-12-22',
      productId: 'P001',
      productName: '智能手机主板',
      batchNo: 'FG20241222001',
      inspector: '周九',
      sampleQty: 100,
      inspectedQty: 100,
      passedQty: 98,
      defectQty: 2,
      passRate: 98,
      status: '合格',
      defectTypes: ['功能异常', '外观缺陷']
    }
  ],

  // 不良品记录
  defectRecords: [
    {
      id: 'DEF001',
      date: '2024-12-22',
      productId: 'P001',
      batchNo: 'FG20241222001',
      defectType: '功能异常',
      defectCode: 'D001',
      defectDesc: '开机无显示',
      defectQty: 1,
      rootCause: '电源芯片虚焊',
      correctionAction: '返工重焊',
      preventiveAction: '加强焊接参数监控',
      responsible: '张三',
      status: '已处理'
    }
  ]
};

// 设备管理数据
export const equipmentData = {
  // 设备维护记录
  maintenanceRecords: [
    {
      id: 'MAINT001',
      equipmentId: 'EQ001',
      equipmentName: 'SMT贴片机A1',
      type: '预防性维护',
      planDate: '2024-12-22',
      actualDate: '2024-12-22',
      maintainer: '赵六',
      duration: 2,
      status: '已完成',
      items: ['清洁吸嘴', '校准精度', '更换滤芯'],
      cost: 500,
      nextMaintenanceDate: '2024-12-29'
    },
    {
      id: 'MAINT002',
      equipmentId: 'EQ005',
      equipmentName: '组装机器人D1',
      type: '故障维修',
      planDate: '2024-12-21',
      actualDate: '2024-12-21',
      maintainer: '吴十',
      duration: 4,
      status: '已完成',
      items: ['更换伺服电机', '调试程序'],
      cost: 2500,
      nextMaintenanceDate: '2024-12-28'
    }
  ],

  // 设备点检记录
  inspectionRecords: [
    {
      id: 'INSP001',
      equipmentId: 'EQ001',
      equipmentName: 'SMT贴片机A1',
      date: '2024-12-22',
      shift: '白班',
      inspector: '张三',
      items: [
        { name: '气压', standard: '0.6-0.8MPa', actual: '0.7MPa', result: '合格' },
        { name: '温度', standard: '20-25℃', actual: '23℃', result: '合格' },
        { name: '精度', standard: '±0.05mm', actual: '±0.03mm', result: '合格' }
      ],
      status: '正常',
      remarks: '设备运行正常'
    }
  ],

  // 设备故障记录
  faultRecords: [
    {
      id: 'FAULT001',
      equipmentId: 'EQ005',
      equipmentName: '组装机器人D1',
      faultDate: '2024-12-21',
      faultTime: '14:30',
      faultDesc: '机械臂无法正常移动',
      faultType: '机械故障',
      severity: '严重',
      reporter: '李四',
      repairStartTime: '2024-12-21 15:00',
      repairEndTime: '2024-12-21 19:00',
      repairer: '吴十',
      rootCause: '伺服电机损坏',
      solution: '更换伺服电机',
      status: '已修复',
      downtime: 4.5
    }
  ]
};

// 库存管理数据
export const inventoryData = {
  // 库存信息
  stockInfo: [
    {
      id: 'STK001',
      materialId: 'M001',
      materialName: 'PCB基板',
      currentStock: 1500,
      safetyStock: 500,
      maxStock: 3000,
      unit: '片',
      location: 'A01-01-01',
      lastUpdateTime: '2024-12-22 10:30:00',
      status: '正常'
    },
    {
      id: 'STK002',
      materialId: 'M002',
      materialName: '电阻0402',
      currentStock: 50000,
      safetyStock: 20000,
      maxStock: 100000,
      unit: '个',
      location: 'A01-02-01',
      lastUpdateTime: '2024-12-22 09:15:00',
      status: '正常'
    },
    {
      id: 'STK003',
      materialId: 'M006',
      materialName: '锡膏',
      currentStock: 15,
      safetyStock: 20,
      maxStock: 50,
      unit: 'kg',
      location: 'B01-01-01',
      lastUpdateTime: '2024-12-22 08:45:00',
      status: '库存不足'
    }
  ],

  // 入库记录
  inboundRecords: [
    {
      id: 'IN001',
      date: '2024-12-22',
      materialId: 'M001',
      materialName: 'PCB基板',
      supplier: '华强电子',
      batchNo: 'B20241222001',
      quantity: 1000,
      unit: '片',
      unitPrice: 25.5,
      totalAmount: 25500,
      operator: '库管员A',
      status: '已入库'
    },
    {
      id: 'IN002',
      date: '2024-12-21',
      materialId: 'M004',
      materialName: 'CPU芯片',
      supplier: '联发科',
      batchNo: 'B20241221001',
      quantity: 500,
      unit: '个',
      unitPrice: 120,
      totalAmount: 60000,
      operator: '库管员B',
      status: '已入库'
    }
  ],

  // 出库记录
  outboundRecords: [
    {
      id: 'OUT001',
      date: '2024-12-22',
      materialId: 'M001',
      materialName: 'PCB基板',
      workOrder: 'PLAN001',
      quantity: 500,
      unit: '片',
      recipient: '张三',
      purpose: '生产领料',
      operator: '库管员A',
      status: '已出库'
    }
  ]
};

// 人员管理数据
export const personnelData = {
  // 考勤记录
  attendanceRecords: [
    {
      id: 'ATT001',
      employeeId: 'EMP001',
      employeeName: '张三',
      date: '2024-12-22',
      shift: '白班',
      checkInTime: '07:55:00',
      checkOutTime: '17:05:00',
      workHours: 8.17,
      overtimeHours: 0.17,
      status: '正常',
      remarks: ''
    },
    {
      id: 'ATT002',
      employeeId: 'EMP002',
      employeeName: '李四',
      date: '2024-12-22',
      shift: '白班',
      checkInTime: '08:10:00',
      checkOutTime: '17:00:00',
      workHours: 7.83,
      overtimeHours: 0,
      status: '迟到',
      remarks: '迟到10分钟'
    }
  ],

  // 培训记录
  trainingRecords: [
    {
      id: 'TRAIN001',
      employeeId: 'EMP002',
      employeeName: '李四',
      trainingName: 'SMT操作技能培训',
      trainer: '钱七',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      duration: 16,
      status: '已完成',
      score: 85,
      result: '合格',
      certificate: 'CERT001'
    }
  ],

  // 绩效评估
  performanceRecords: [
    {
      id: 'PERF001',
      employeeId: 'EMP001',
      employeeName: '张三',
      period: '2024-12',
      productionScore: 92,
      qualityScore: 88,
      attendanceScore: 95,
      teamworkScore: 90,
      totalScore: 91.25,
      grade: 'A',
      evaluator: '部门主管',
      comments: '工作表现优秀，技能熟练'
    }
  ]
};

// 工艺管理数据
export const processData = {
  // 工艺路线
  processRoutes: [
    {
      id: 'ROUTE001',
      productId: 'P001',
      productName: '智能手机主板',
      version: 'V1.2',
      status: '有效',
      steps: [
        { stepNo: 10, stepName: '印刷锡膏', equipment: 'EQ001', standardTime: 30, description: '使用SAC305锡膏' },
        { stepNo: 20, stepName: 'SMT贴片', equipment: 'EQ002', standardTime: 120, description: '贴装所有SMT元件' },
        { stepNo: 30, stepName: '回流焊接', equipment: 'EQ003', standardTime: 45, description: '温度曲线按标准执行' },
        { stepNo: 40, stepName: 'AOI检测', equipment: 'EQ004', standardTime: 15, description: '检测贴装质量' },
        { stepNo: 50, stepName: '功能测试', equipment: 'EQ006', standardTime: 60, description: '全功能测试' }
      ]
    }
  ],

  // 工艺参数
  processParameters: [
    {
      id: 'PARAM001',
      processStep: '回流焊接',
      parameterName: '温度曲线',
      standardValue: '150-180-220-250℃',
      tolerance: '±5℃',
      unit: '℃',
      controlMethod: '自动控制',
      monitoringFreq: '每批次'
    },
    {
      id: 'PARAM002',
      processStep: 'SMT贴片',
      parameterName: '贴装精度',
      standardValue: '±0.05mm',
      tolerance: '±0.02mm',
      unit: 'mm',
      controlMethod: '视觉检测',
      monitoringFreq: '实时'
    }
  ]
};

// 系统集成数据
export const integrationData = {
  // 接口配置
  interfaceConfigs: [
    {
      id: 'API001',
      name: 'ERP系统接口',
      type: 'REST API',
      url: 'https://erp.company.com/api/v1',
      method: 'POST',
      status: '正常',
      lastSync: '2024-12-22 10:30:00',
      syncFreq: '每小时',
      description: '同步生产计划和物料需求'
    },
    {
      id: 'API002',
      name: 'WMS系统接口',
      type: 'SOAP',
      url: 'https://wms.company.com/service',
      method: 'SOAP',
      status: '正常',
      lastSync: '2024-12-22 10:25:00',
      syncFreq: '实时',
      description: '同步库存信息和出入库记录'
    }
  ],

  // 数据同步记录
  syncRecords: [
    {
      id: 'SYNC001',
      interfaceId: 'API001',
      interfaceName: 'ERP系统接口',
      syncTime: '2024-12-22 10:30:00',
      syncType: '生产计划',
      recordCount: 15,
      status: '成功',
      duration: 2.5,
      errorMsg: null
    },
    {
      id: 'SYNC002',
      interfaceId: 'API002',
      interfaceName: 'WMS系统接口',
      syncTime: '2024-12-22 10:25:00',
      syncType: '库存信息',
      recordCount: 150,
      status: '成功',
      duration: 1.8,
      errorMsg: null
    }
  ]
};

// 报表分析数据
export const reportData = {
  // KPI指标
  kpiMetrics: {
    production: {
      dailyOutput: 2850,
      dailyTarget: 3000,
      efficiency: 95,
      oee: 89.2,
      defectRate: 1.2
    },
    quality: {
      iqcPassRate: 98.5,
      pqcPassRate: 97.2,
      fqcPassRate: 99.1,
      oqcPassRate: 98.8,
      customerComplaint: 2
    },
    equipment: {
      utilization: 91.7,
      mtbf: 168,
      mttr: 2.5,
      availability: 96.5
    },
    inventory: {
      turnoverRate: 8.7,
      accuracy: 99.2,
      stockoutRate: 0.5,
      excessRate: 2.1
    }
  },

  // 趋势数据
  trendData: {
    production: [
      { date: '2024-12-16', output: 2750, target: 2800, efficiency: 92 },
      { date: '2024-12-17', output: 2820, target: 2900, efficiency: 94 },
      { date: '2024-12-18', output: 2680, target: 2800, efficiency: 89 },
      { date: '2024-12-19', output: 2950, target: 3000, efficiency: 96 },
      { date: '2024-12-20', output: 2880, target: 2900, efficiency: 95 },
      { date: '2024-12-21', output: 2920, target: 3000, efficiency: 94 },
      { date: '2024-12-22', output: 2850, target: 3000, efficiency: 95 }
    ],
    quality: [
      { date: '2024-12-16', passRate: 97.8, defectRate: 2.2 },
      { date: '2024-12-17', passRate: 98.2, defectRate: 1.8 },
      { date: '2024-12-18', passRate: 97.5, defectRate: 2.5 },
      { date: '2024-12-19', passRate: 98.8, defectRate: 1.2 },
      { date: '2024-12-20', passRate: 98.1, defectRate: 1.9 },
      { date: '2024-12-21', passRate: 98.5, defectRate: 1.5 },
      { date: '2024-12-22', passRate: 98.2, defectRate: 1.8 }
    ]
  }
};

// 导出所有数据
export default {
  baseData,
  productionData,
  qualityData,
  equipmentData,
  inventoryData,
  personnelData,
  processData,
  integrationData,
  reportData
};