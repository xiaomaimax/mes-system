/**
 * MES系统常量定义文件
 * 
 * 注意：本文件已从mock数据迁移为常量定义
 * 实际数据现在通过DataService从API获取
 * 
 * 迁移完成日期：2026-01-12
 * 迁移说明：所有组件已从使用mock数据转换为使用DataService调用API
 */

// ============================================================================
// 系统常量定义
// ============================================================================

// 状态常量
export const STATUS_CONSTANTS = {
  // 生产状态
  PRODUCTION_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress', 
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // 设备状态
  EQUIPMENT_STATUS: {
    RUNNING: 'running',
    IDLE: 'idle',
    MAINTENANCE: 'maintenance',
    FAULT: 'fault'
  },
  
  // 质量检验状态
  INSPECTION_STATUS: {
    PASS: 'pass',
    FAIL: 'fail',
    PENDING: 'pending'
  },
  
  // 库存状态
  INVENTORY_STATUS: {
    NORMAL: 'normal',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
  }
};

// 优先级常量
export const PRIORITY_CONSTANTS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// 班次常量
export const SHIFT_CONSTANTS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night'
};

// 检验类型常量
export const INSPECTION_TYPES = {
  IQC: 'IQC', // 进料检验
  PQC: 'PQC', // 过程检验
  FQC: 'FQC', // 成品检验
  OQC: 'OQC'  // 出货检验
};

// 缺陷严重程度常量
export const DEFECT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// 维护类型常量
export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  EMERGENCY: 'emergency'
};

// ============================================================================
// UI显示映射
// ============================================================================

// 状态显示映射
export const STATUS_DISPLAY_MAP = {
  // 生产状态显示
  [STATUS_CONSTANTS.PRODUCTION_STATUS.PENDING]: '待开始',
  [STATUS_CONSTANTS.PRODUCTION_STATUS.IN_PROGRESS]: '进行中',
  [STATUS_CONSTANTS.PRODUCTION_STATUS.COMPLETED]: '已完成',
  [STATUS_CONSTANTS.PRODUCTION_STATUS.CANCELLED]: '已取消',
  
  // 设备状态显示
  [STATUS_CONSTANTS.EQUIPMENT_STATUS.RUNNING]: '运行中',
  [STATUS_CONSTANTS.EQUIPMENT_STATUS.IDLE]: '空闲',
  [STATUS_CONSTANTS.EQUIPMENT_STATUS.MAINTENANCE]: '维护中',
  [STATUS_CONSTANTS.EQUIPMENT_STATUS.FAULT]: '故障',
  
  // 检验状态显示
  [STATUS_CONSTANTS.INSPECTION_STATUS.PASS]: '合格',
  [STATUS_CONSTANTS.INSPECTION_STATUS.FAIL]: '不合格',
  [STATUS_CONSTANTS.INSPECTION_STATUS.PENDING]: '待检验'
};

// 优先级显示映射
export const PRIORITY_DISPLAY_MAP = {
  [PRIORITY_CONSTANTS.LOW]: '低',
  [PRIORITY_CONSTANTS.NORMAL]: '普通',
  [PRIORITY_CONSTANTS.HIGH]: '高',
  [PRIORITY_CONSTANTS.URGENT]: '紧急'
};

// 班次显示映射
export const SHIFT_DISPLAY_MAP = {
  [SHIFT_CONSTANTS.MORNING]: '早班',
  [SHIFT_CONSTANTS.AFTERNOON]: '中班',
  [SHIFT_CONSTANTS.NIGHT]: '晚班'
};

// ============================================================================
// 颜色主题配置
// ============================================================================

// 状态颜色配置
export const STATUS_COLORS = {
  // 生产状态颜色
  PRODUCTION: {
    [STATUS_CONSTANTS.PRODUCTION_STATUS.PENDING]: '#faad14',
    [STATUS_CONSTANTS.PRODUCTION_STATUS.IN_PROGRESS]: '#1890ff',
    [STATUS_CONSTANTS.PRODUCTION_STATUS.COMPLETED]: '#52c41a',
    [STATUS_CONSTANTS.PRODUCTION_STATUS.CANCELLED]: '#f5222d'
  },
  
  // 设备状态颜色
  EQUIPMENT: {
    [STATUS_CONSTANTS.EQUIPMENT_STATUS.RUNNING]: '#52c41a',
    [STATUS_CONSTANTS.EQUIPMENT_STATUS.IDLE]: '#faad14',
    [STATUS_CONSTANTS.EQUIPMENT_STATUS.MAINTENANCE]: '#1890ff',
    [STATUS_CONSTANTS.EQUIPMENT_STATUS.FAULT]: '#f5222d'
  },
  
  // 质量状态颜色
  QUALITY: {
    [STATUS_CONSTANTS.INSPECTION_STATUS.PASS]: '#52c41a',
    [STATUS_CONSTANTS.INSPECTION_STATUS.FAIL]: '#f5222d',
    [STATUS_CONSTANTS.INSPECTION_STATUS.PENDING]: '#faad14'
  }
};

// 优先级颜色配置
export const PRIORITY_COLORS = {
  [PRIORITY_CONSTANTS.LOW]: '#52c41a',
  [PRIORITY_CONSTANTS.NORMAL]: '#1890ff',
  [PRIORITY_CONSTANTS.HIGH]: '#faad14',
  [PRIORITY_CONSTANTS.URGENT]: '#f5222d'
};

// ============================================================================
// 表格列配置
// ============================================================================

// 通用表格列配置
export const COMMON_COLUMNS = {
  // 操作列
  ACTION: {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  },
  
  // 状态列
  STATUS: {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  
  // 创建时间列
  CREATED_AT: {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  
  // 更新时间列
  UPDATED_AT: {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180
  }
};

// ============================================================================
// 表单验证规则
// ============================================================================

// 通用验证规则
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此字段为必填项' },
  EMAIL: { type: 'email', message: '请输入有效的邮箱地址' },
  PHONE: { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
  NUMBER: { type: 'number', message: '请输入有效的数字' },
  POSITIVE_NUMBER: { 
    type: 'number', 
    min: 0, 
    message: '请输入大于等于0的数字' 
  }
};

// ============================================================================
// 分页配置
// ============================================================================

// 默认分页配置
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
};

// ============================================================================
// 日期时间格式
// ============================================================================

// 日期时间格式常量
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
};

// ============================================================================
// API配置常量
// ============================================================================

// API端点常量
export const API_ENDPOINTS = {
  PRODUCTION: '/api/production',
  EQUIPMENT: '/api/equipment',
  QUALITY: '/api/quality',
  INVENTORY: '/api/inventory',
  REPORTS: '/api/reports'
};

// ============================================================================
// 导出默认配置
// ============================================================================

// 向后兼容的默认导出（已废弃，建议使用具名导出）
export default {
  STATUS_CONSTANTS,
  PRIORITY_CONSTANTS,
  SHIFT_CONSTANTS,
  INSPECTION_TYPES,
  DEFECT_SEVERITY,
  MAINTENANCE_TYPES,
  STATUS_DISPLAY_MAP,
  PRIORITY_DISPLAY_MAP,
  SHIFT_DISPLAY_MAP,
  STATUS_COLORS,
  PRIORITY_COLORS,
  COMMON_COLUMNS,
  VALIDATION_RULES,
  DEFAULT_PAGINATION,
  DATE_FORMATS,
  API_ENDPOINTS
};

// ============================================================================
// 迁移说明注释
// ============================================================================

/**
 * 数据迁移完成说明
 * 
 * 以下数据已从mock数据迁移到数据库，现在通过DataService获取：
 * 
 * 1. 生产管理数据 (productionData)
 *    - 生产计划/订单 → DataService.getProductionPlans()
 *    - 生产任务 → DataService.getProductionTasks()
 *    - 工作报告 → DataService.getWorkReports()
 *    - 班次计划 → 已集成到生产计划中
 * 
 * 2. 质量管理数据 (qualityData)
 *    - IQC/PQC/FQC检验数据 → DataService.getQualityInspections()
 *    - 缺陷记录 → DataService.getDefectRecords()
 *    - 检验标准 → DataService.getInspectionStandards()
 * 
 * 3. 设备管理数据 (equipmentData)
 *    - 设备信息 → DataService.getEquipment()
 *    - 模具信息 → DataService.getMolds()
 *    - 维护记录 → DataService.getEquipmentMaintenance()
 *    - 点检记录、故障记录 → 已集成到维护记录中
 * 
 * 4. 库存管理数据 (inventoryData)
 *    - 库存信息 → DataService.getInventory()
 *    - 出入库记录 → DataService.getInventoryTransactions()
 *    - 库位管理 → DataService.getLocationManagement()
 * 
 * 5. 报表数据 (reportData)
 *    - 生产报表 → DataService.getProductionReports()
 *    - 质量报表 → DataService.getQualityReports()
 *    - 设备报表 → DataService.getEquipmentReports()
 *    - KPI指标和趋势数据 → 已集成到各报表API中
 * 
 * 6. 其他数据
 *    - 人员管理数据 (personnelData) → 暂时保留，待后续迁移
 *    - 工艺管理数据 (processData) → 暂时保留，待后续迁移
 *    - 系统集成数据 (integrationData) → 暂时保留，待后续迁移
 * 
 * 迁移完成的组件：
 * - 生产模块：WorkshopPlan.js, ProductionTasks.js, WorkReportManagement.js
 * - 设备模块：EquipmentManagement.js, MoldManagement.js, EquipmentMaintenance.js
 * - 质量模块：QualityInspection.js, DefectRecords.js, InspectionStandards.js
 * - 库存模块：InventoryManagement.js, InventoryTransactions.js, LocationManagement.js
 * - 报表模块：ProductionReports.js, QualityReports.js, EquipmentReports.js
 * 
 * 使用方法：
 * 1. 导入DataService：import DataService from '../services/DataService';
 * 2. 调用相应方法：const data = await DataService.getProductionPlans();
 * 3. 处理响应：if (data.success) { setData(data.data.items); }
 * 
 * 注意事项：
 * - 所有API调用都支持缓存，可以通过第二个参数强制刷新
 * - 错误处理已统一，检查response.success判断是否成功
 * - 分页参数格式：{ page: 1, pageSize: 10, status: 'filter' }
 */

// ============================================================================
// 已迁移数据说明
// ============================================================================

/**
 * 质量管理数据已迁移到数据库
 * 
 * 原有数据：
 * - qualityData.iqcInspections → 现在通过 DataService.getQualityInspections({ type: 'IQC' }) 获取
 * - qualityData.pqcInspections → 现在通过 DataService.getQualityInspections({ type: 'PQC' }) 获取  
 * - qualityData.fqcInspections → 现在通过 DataService.getQualityInspections({ type: 'FQC' }) 获取
 * - qualityData.defectRecords → 现在通过 DataService.getDefectRecords() 获取
 * 
 * 迁移完成日期：2026-01-12
 */

// ============================================================================
// 已迁移数据说明
// ============================================================================

/**
 * 设备管理数据已迁移到数据库
 * 
 * 原有数据：
 * - equipmentData.maintenanceRecords → 现在通过 DataService.getEquipmentMaintenance() 获取
 * - equipmentData.inspectionRecords → 已集成到维护记录中
 * - equipmentData.faultRecords → 已集成到维护记录中
 * - equipmentData.statusHistory → 已集成到设备状态中
 * 
 * 迁移完成日期：2026-01-12
 */

// ============================================================================
// 已迁移数据说明
// ============================================================================

/**
 * 库存管理数据已迁移到数据库
 * 
 * 原有数据：
 * - inventoryData.stockInfo → 现在通过 DataService.getInventory() 获取
 * - inventoryData.inboundRecords → 现在通过 DataService.getInventoryTransactions({ type: 'inbound' }) 获取
 * - inventoryData.outboundRecords → 现在通过 DataService.getInventoryTransactions({ type: 'outbound' }) 获取
 * 
 * 迁移完成日期：2026-01-12
 */

// 人员管理数据 - 暂时保留，待后续迁移
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

// 工艺管理数据 - 暂时保留，待后续迁移
export const processData = {
  // 工艺路线
  processRoutes: [
    {
      id: 'ROUTE-MAT-001',
      productId: 'MAT-001',
      productName: '手机壳A',
      version: 'V1.0',
      status: '有效',
      steps: [
        { stepNo: 1, stepName: '注塑成型', equipment: 'DEV-001', mold: 'MOLD-001', standardTime: 45, description: '使用海天注塑机进行注塑成型' },
        { stepNo: 2, stepName: '冷却脱模', equipment: 'DEV-001', mold: 'MOLD-001', standardTime: 30, description: '冷却后脱模' },
        { stepNo: 3, stepName: '质量检验', equipment: null, mold: null, standardTime: 20, description: '外观和尺寸检验' },
        { stepNo: 4, stepName: '包装', equipment: null, mold: null, standardTime: 15, description: '产品包装' }
      ]
    },
    {
      id: 'ROUTE-MAT-002',
      productId: 'MAT-002',
      productName: '手机壳B',
      version: 'V1.0',
      status: '有效',
      steps: [
        { stepNo: 1, stepName: '注塑成型', equipment: 'DEV-002', mold: 'MOLD-002', standardTime: 50, description: '使用海天注塑机进行注塑成型' },
        { stepNo: 2, stepName: '冷却脱模', equipment: 'DEV-002', mold: 'MOLD-002', standardTime: 35, description: '冷却后脱模' },
        { stepNo: 3, stepName: '质量检验', equipment: null, mold: null, standardTime: 20, description: '外观和尺寸检验' },
        { stepNo: 4, stepName: '包装', equipment: null, mold: null, standardTime: 15, description: '产品包装' }
      ]
    },
    {
      id: 'ROUTE-MAT-003',
      productId: 'MAT-003',
      productName: '充电器',
      version: 'V1.0',
      status: '有效',
      steps: [
        { stepNo: 1, stepName: '注塑成型', equipment: 'DEV-003', mold: 'MOLD-003', standardTime: 40, description: '使用震雄注塑机进行注塑成型' },
        { stepNo: 2, stepName: '冷却脱模', equipment: 'DEV-003', mold: 'MOLD-003', standardTime: 25, description: '冷却后脱模' },
        { stepNo: 3, stepName: '质量检验', equipment: null, mold: null, standardTime: 20, description: '外观和尺寸检验' },
        { stepNo: 4, stepName: '包装', equipment: null, mold: null, standardTime: 15, description: '产品包装' }
      ]
    },
    {
      id: 'ROUTE-MAT-004',
      productId: 'MAT-004',
      productName: '手机壳C',
      version: 'V1.0',
      status: '有效',
      steps: [
        { stepNo: 1, stepName: '注塑成型', equipment: 'DEV-004', mold: 'MOLD-004', standardTime: 55, description: '使用震雄注塑机进行注塑成型' },
        { stepNo: 2, stepName: '冷却脱模', equipment: 'DEV-004', mold: 'MOLD-004', standardTime: 40, description: '冷却后脱模' },
        { stepNo: 3, stepName: '质量检验', equipment: null, mold: null, standardTime: 20, description: '外观和尺寸检验' },
        { stepNo: 4, stepName: '包装', equipment: null, mold: null, standardTime: 15, description: '产品包装' }
      ]
    },
    {
      id: 'ROUTE-MAT-005',
      productId: 'MAT-005',
      productName: '手机壳D',
      version: 'V1.0',
      status: '有效',
      steps: [
        { stepNo: 1, stepName: '注塑成型', equipment: 'DEV-001', mold: 'MOLD-001', standardTime: 48, description: '使用海天注塑机进行注塑成型' },
        { stepNo: 2, stepName: '冷却脱模', equipment: 'DEV-001', mold: 'MOLD-001', standardTime: 32, description: '冷却后脱模' },
        { stepNo: 3, stepName: '质量检验', equipment: null, mold: null, standardTime: 20, description: '外观和尺寸检验' },
        { stepNo: 4, stepName: '包装', equipment: null, mold: null, standardTime: 15, description: '产品包装' }
      ]
    }
  ],

  // 工艺参数
  processParameters: [
    {
      id: 'PARAM001',
      routingId: 'ROUTE-MAT-001',
      processStep: '注塑成型',
      parameterName: '注塑温度',
      standardValue: '220',
      tolerance: '±10',
      unit: '℃',
      minValue: 210,
      maxValue: 230,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM002',
      routingId: 'ROUTE-MAT-001',
      processStep: '注塑成型',
      parameterName: '注塑压力',
      standardValue: '80',
      tolerance: '±10',
      unit: 'MPa',
      minValue: 70,
      maxValue: 90,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM003',
      routingId: 'ROUTE-MAT-001',
      processStep: '注塑成型',
      parameterName: '注塑速度',
      standardValue: '50',
      tolerance: '±10',
      unit: 'mm/s',
      minValue: 40,
      maxValue: 60,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM004',
      routingId: 'ROUTE-MAT-001',
      processStep: '冷却脱模',
      parameterName: '冷却温度',
      standardValue: '25',
      tolerance: '±5',
      unit: '℃',
      minValue: 20,
      maxValue: 30,
      controlMethod: '自动控制',
      monitoringFreq: '每批次'
    },
    {
      id: 'PARAM005',
      routingId: 'ROUTE-MAT-001',
      processStep: '冷却脱模',
      parameterName: '冷却时间',
      standardValue: '30',
      tolerance: '±5',
      unit: 's',
      minValue: 25,
      maxValue: 35,
      controlMethod: '自动控制',
      monitoringFreq: '每批次'
    },
    {
      id: 'PARAM006',
      routingId: 'ROUTE-MAT-002',
      processStep: '注塑成型',
      parameterName: '注塑温度',
      standardValue: '225',
      tolerance: '±10',
      unit: '℃',
      minValue: 215,
      maxValue: 235,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM007',
      routingId: 'ROUTE-MAT-002',
      processStep: '注塑成型',
      parameterName: '注塑压力',
      standardValue: '85',
      tolerance: '±10',
      unit: 'MPa',
      minValue: 75,
      maxValue: 95,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM008',
      routingId: 'ROUTE-MAT-002',
      processStep: '注塑成型',
      parameterName: '注塑速度',
      standardValue: '55',
      tolerance: '±10',
      unit: 'mm/s',
      minValue: 45,
      maxValue: 65,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM009',
      routingId: 'ROUTE-MAT-003',
      processStep: '注塑成型',
      parameterName: '注塑温度',
      standardValue: '215',
      tolerance: '±10',
      unit: '℃',
      minValue: 205,
      maxValue: 225,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM010',
      routingId: 'ROUTE-MAT-003',
      processStep: '注塑成型',
      parameterName: '注塑压力',
      standardValue: '75',
      tolerance: '±10',
      unit: 'MPa',
      minValue: 65,
      maxValue: 85,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    },
    {
      id: 'PARAM011',
      routingId: 'ROUTE-MAT-003',
      processStep: '注塑成型',
      parameterName: '注塑速度',
      standardValue: '45',
      tolerance: '±10',
      unit: 'mm/s',
      minValue: 35,
      maxValue: 55,
      controlMethod: '自动控制',
      monitoringFreq: '实时'
    }
  ]
};

// 系统集成数据 - 暂时保留，待后续迁移
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

// 报表分析数据 - 暂时保留，待后续迁移
export const reportData = {
  // KPI指标
  kpiMetrics: {
    production: {
      dailyOutput: 5680,
      dailyTarget: 6000,
      efficiency: 94.7,
      oee: 89.2,
      defectRate: 2.1
    },
    quality: {
      iqcPassRate: 97.5,
      pqcPassRate: 97.9,
      fqcPassRate: 100.0,
      oqcPassRate: 98.8,
      customerComplaint: 0
    },
    equipment: {
      utilization: 87.2,
      mtbf: 168,
      mttr: 4.5,
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
      { date: '2025-12-22', output: 5200, target: 5500, efficiency: 94.5 },
      { date: '2025-12-23', output: 5400, target: 5500, efficiency: 98.2 },
      { date: '2025-12-24', output: 5100, target: 5500, efficiency: 92.7 },
      { date: '2025-12-25', output: 5600, target: 6000, efficiency: 93.3 },
      { date: '2025-12-26', output: 5680, target: 6000, efficiency: 94.7 },
      { date: '2025-12-27', output: 5750, target: 6000, efficiency: 95.8 },
      { date: '2025-12-28', output: 5730, target: 6000, efficiency: 95.5 }
    ],
    quality: [
      { date: '2025-12-22', passRate: 97.2, defectRate: 2.8 },
      { date: '2025-12-23', passRate: 97.8, defectRate: 2.2 },
      { date: '2025-12-24', passRate: 97.5, defectRate: 2.5 },
      { date: '2025-12-25', passRate: 98.0, defectRate: 2.0 },
      { date: '2025-12-26', passRate: 97.9, defectRate: 2.1 },
      { date: '2025-12-27', passRate: 98.2, defectRate: 1.8 },
      { date: '2025-12-28', passRate: 98.0, defectRate: 2.0 }
    ]
  }
};

// ============================================================================
// 导出配置 - 向后兼容
// ============================================================================

// 注意：已迁移数据现在通过 DataService 获取，此处仅保留常量和待迁移数据