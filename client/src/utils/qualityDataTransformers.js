/**
 * Quality inspection data transformation utilities
 */

/**
 * Transform raw API data to table format for PQC inspections
 */
export const transformPQCData = (apiData) => {
  // 安全检查
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('PQC数据格式异常:', apiData);
    return [];
  }

  return apiData.map((item, index) => {
    try {
      // 安全地访问属性，提供默认值
      const qualifiedQty = item.qualified_qty || 0;
      const inspectionQty = item.inspection_qty || 1;
      const passRate = item.pass_rate || 0;

      return {
        key: item.id || index,
        id: item.id,
        inspectionId: item.inspection_id || `PQC-${index}`,
        productionOrderNo: item.production_order || '-',
        productCode: `PROD-${(item.product_name || 'Unknown').charAt(0)}001`,
        productName: item.product_name || '未知产品',
        productionLine: `生产线${Math.floor(Math.random() * 3) + 1}`,
        processStep: ['注塑成型', '组装', '包装'][Math.floor(Math.random() * 3)],
        inspectionTime: item.inspection_date || '-',
        inspector: item.inspector || '-',
        shift: ['白班', '夜班', '中班'][Math.floor(Math.random() * 3)],
        sampleQuantity: inspectionQty,
        inspectedQuantity: inspectionQty,
        qualifiedQuantity: qualifiedQty,
        defectiveQuantity: Math.max(0, inspectionQty - qualifiedQty),
        qualityRate: passRate,
        processParameters: {
          temperature: '180°C',
          pressure: '150MPa',
          cycleTime: '45s'
        },
        defectTypes: (inspectionQty - qualifiedQty) > 0 ? ['尺寸偏差'] : [],
        correctionActions: (inspectionQty - qualifiedQty) > 0 ? ['调整温度参数'] : [],
        result: item.inspection_result || 'pending',
        status: item.status || 'pending',
        remarks: item.notes || '检验完成'
      };
    } catch (error) {
      console.error('转换PQC数据项失败:', error, item);
      return null;
    }
  }).filter(item => item !== null);
};

/**
 * Transform raw API data to table format for OQC inspections
 */
export const transformOQCData = (apiData) => {
  // 安全检查
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('OQC数据格式异常:', apiData);
    return [];
  }

  return apiData.map((item, index) => {
    try {
      const qualifiedQty = item.qualified_qty || 0;
      const inspectionQty = item.inspection_qty || 1;
      const passRate = item.pass_rate || 0;

      return {
        key: item.id || index,
        id: item.id,
        inspectionId: item.inspection_id || `OQC-${index}`,
        shipmentNo: `SHIP-${item.batch_number || 'Unknown'}`,
        customerName: `客户${(item.product_name || 'Unknown').charAt(0)}`,
        productCode: `PROD-${(item.product_name || 'Unknown').charAt(0)}001`,
        productName: item.product_name || '未知产品',
        batchNo: item.batch_number || '-',
        shipmentQuantity: (inspectionQty * 10) || 0,
        sampleQuantity: inspectionQty,
        qualifiedQuantity: qualifiedQty,
        defectiveQuantity: Math.max(0, inspectionQty - qualifiedQty),
        qualityRate: passRate,
        inspectionDate: item.inspection_date || '-',
        inspector: item.inspector || '-',
        result: item.inspection_result || 'pending',
        status: item.status || 'pending'
      };
    } catch (error) {
      console.error('转换OQC数据项失败:', error, item);
      return null;
    }
  }).filter(item => item !== null);
};

/**
 * Common result status mapping
 */
export const INSPECTION_RESULT_MAP = {
  pass: { color: 'green', text: '合格' },
  conditional_pass: { color: 'orange', text: '让步接收' },
  fail: { color: 'red', text: '不合格' },
  pending: { color: 'blue', text: '待检验' }
};

/**
 * Common status mapping
 */
export const INSPECTION_STATUS_MAP = {
  pending: { color: 'orange', text: '待检验' },
  in_progress: { color: 'blue', text: '检验中' },
  completed: { color: 'green', text: '已完成' }
};