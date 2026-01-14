/**
 * Quality module constants
 */

// Production lines
export const PRODUCTION_LINES = [
  { value: '生产线1', label: '生产线1' },
  { value: '生产线2', label: '生产线2' },
  { value: '生产线3', label: '生产线3' }
];

// Process steps
export const PROCESS_STEPS = [
  { value: '注塑成型', label: '注塑成型' },
  { value: '组装', label: '组装' },
  { value: '包装', label: '包装' }
];

// Shifts
export const SHIFTS = [
  { value: '白班', label: '白班' },
  { value: '夜班', label: '夜班' },
  { value: '中班', label: '中班' }
];

// Inspection results
export const INSPECTION_RESULTS = [
  { value: 'pass', label: '合格' },
  { value: 'conditional_pass', label: '让步接收' },
  { value: 'fail', label: '不合格' },
  { value: 'pending', label: '待检验' }
];

// Defect types
export const DEFECT_TYPES = [
  { value: '尺寸偏差', label: '尺寸偏差' },
  { value: '表面气泡', label: '表面气泡' },
  { value: '颜色不均', label: '颜色不均' },
  { value: '装配不良', label: '装配不良' }
];

// Correction actions
export const CORRECTION_ACTIONS = [
  { value: '调整温度参数', label: '调整温度参数' },
  { value: '检查模具', label: '检查模具' },
  { value: '更换原料', label: '更换原料' },
  { value: '重新培训操作员', label: '重新培训操作员' }
];

// Table column widths
export const COLUMN_WIDTHS = {
  INSPECTION_ID: 120,
  PRODUCTION_ORDER: 120,
  PRODUCT_INFO: 180,
  PROCESS_STEP: 100,
  INSPECTION_TIME: 140,
  INSPECTOR: 80,
  SHIFT: 60,
  QUANTITY: 120,
  QUALITY_STATS: 150,
  PROCESS_PARAMETERS: 200,
  RESULT: 100,
  DEFECT_TYPES: 150,
  STATUS: 100,
  ACTION: 150
};