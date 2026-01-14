/**
 * 测试IQC API调用
 * 验证前端API调用是否正常工作
 */

// 模拟浏览器环境的fetch
const fetch = require('node-fetch').default || require('node-fetch');

const API_BASE_URL = 'http://localhost:5002/api';

// 获取认证token
const getAuthToken = () => {
  // 使用之前获取的token
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjY5OTA1NjAsImV4cCI6MTc2NzAxOTM2MH0.ZLAzwK3z_cRaO94TCXEjNVDVbKJZ2LxTnPAGKaSXiLY';
};

// 通用请求方法（模拟前端的request函数）
const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};

// 模拟QualityAPI.getQualityInspections
const getQualityInspections = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/modules/quality-inspections${query ? `?${query}` : ''}`);
};

async function testIQCAPI() {
  console.log('🔍 开始测试IQC API调用...\n');

  try {
    // 测试API调用
    console.log('📡 调用API: /modules/quality-inspections');
    const response = await getQualityInspections({ 
      inspection_type: 'incoming', 
      limit: 100 
    });

    console.log('✅ API调用成功');
    console.log(`📊 返回数据统计:`);
    console.log(`   success: ${response.success}`);
    console.log(`   total: ${response.data.total}`);
    console.log(`   inspections: ${response.data.inspections.length} 条`);

    if (response.data.inspections.length > 0) {
      console.log('\n📋 前3条检验数据:');
      response.data.inspections.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ID: ${item.id}, 类型: ${item.inspection_type}, 质量率: ${item.quality_rate}%`);
      });
    }

    // 测试数据转换（模拟前端的数据处理）
    console.log('\n🔄 测试数据转换...');
    const formattedData = response.data.inspections.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      inspectionId: `IQC-${item.id}`,
      purchaseOrderNo: `PO-${item.production_order_id}`,
      supplierName: '供应商',
      materialCode: `MAT-${String(item.production_order_id).padStart(3, '0')}`,
      materialName: `物料 ${item.production_order_id}`,
      batchNo: `BATCH-${item.id}`,
      deliveryDate: item.inspection_date ? new Date(item.inspection_date).toLocaleDateString() : '-',
      inspectionDate: item.inspection_date ? new Date(item.inspection_date).toLocaleDateString() : '-',
      inspector: `检验员 ${item.inspector_id}`,
      sampleQuantity: item.inspected_quantity || 0,
      inspectedQuantity: item.inspected_quantity || 0,
      qualifiedQuantity: item.qualified_quantity || 0,
      defectiveQuantity: item.defective_quantity || 0,
      qualityRate: item.quality_rate || 0,
      inspectionItems: [],
      overallScore: (item.quality_rate || 0) / 20,
      result: item.quality_rate >= 95 ? 'pass' : item.quality_rate >= 90 ? 'conditional_pass' : 'fail',
      defectTypes: item.defect_types ? (
        (() => {
          try {
            return JSON.parse(item.defect_types);
          } catch (e) {
            console.warn('JSON解析失败，使用默认值:', item.defect_types);
            return [];
          }
        })()
      ) : [],
      remarks: item.notes || '-',
      status: 'completed'
    }));

    console.log('✅ 数据转换成功');
    console.log(`📊 转换后数据: ${formattedData.length} 条`);

    if (formattedData.length > 0) {
      console.log('\n📋 转换后的前3条数据:');
      formattedData.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.inspectionId} - ${item.materialName} - 质量率: ${item.qualityRate}%`);
      });
    }

    console.log('\n🎯 测试结果: 所有测试通过！');
    console.log('💡 前端API调用应该正常工作');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.error('🔍 错误详情:', error);
    
    // 提供调试建议
    console.log('\n🔧 调试建议:');
    console.log('1. 检查服务器是否正在运行 (http://localhost:5002)');
    console.log('2. 检查token是否有效');
    console.log('3. 检查网络连接');
    console.log('4. 查看服务器日志');
  }
}

// 执行测试
if (require.main === module) {
  testIQCAPI()
    .then(() => {
      console.log('\n🎉 IQC API测试完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试执行失败:', error.message);
      process.exit(1);
    });
}

module.exports = { testIQCAPI };