/**
 * 辅助排程模块 - 注塑车间模拟数据初始化脚本
 * 包含完整的业务逻辑和冲突场景
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/scheduling';

// 注塑车间物料数据
const materials = [
  {
    material_code: 'MAT-INJ-001',
    material_name: '手机壳-黑色',
    material_type: 'finished_product',
    specifications: '100x50x10mm'
  },
  {
    material_code: 'MAT-INJ-002',
    material_name: '手机壳-白色',
    material_type: 'finished_product',
    specifications: '100x50x10mm'
  },
  {
    material_code: 'MAT-INJ-003',
    material_name: '手机壳-蓝色',
    material_type: 'finished_product',
    specifications: '100x50x10mm'
  },
  {
    material_code: 'MAT-INJ-004',
    material_name: '充电器外壳',
    material_type: 'finished_product',
    specifications: '80x40x20mm'
  },
  {
    material_code: 'MAT-INJ-005',
    material_name: '电池盖板',
    material_type: 'finished_product',
    specifications: '60x30x5mm'
  },
  {
    material_code: 'MAT-INJ-006',
    material_name: '屏幕支架',
    material_type: 'finished_product',
    specifications: '120x80x15mm'
  }
];

// 注塑车间设备数据
const devices = [
  {
    device_code: 'INJ-001',
    device_name: '注塑机1号',
    specifications: '注塑机-100T',
    status: 'normal',
    capacity_per_hour: 120
  },
  {
    device_code: 'INJ-002',
    device_name: '注塑机2号',
    specifications: '注塑机-150T',
    status: 'normal',
    capacity_per_hour: 150
  },
  {
    device_code: 'INJ-003',
    device_name: '注塑机3号',
    specifications: '注塑机-80T',
    status: 'normal',
    capacity_per_hour: 100
  },
  {
    device_code: 'INJ-004',
    device_name: '注塑机4号',
    specifications: '注塑机-120T',
    status: 'maintenance',
    capacity_per_hour: 130
  },
  {
    device_code: 'INJ-005',
    device_name: '注塑机5号',
    specifications: '注塑机-100T',
    status: 'normal',
    capacity_per_hour: 120
  }
];

// 注塑车间模具数据
const molds = [
  {
    mold_code: 'MOLD-INJ-001',
    mold_name: '手机壳模具-黑色',
    specifications: '手机壳专用',
    quantity: 2,
    status: 'normal'
  },
  {
    mold_code: 'MOLD-INJ-002',
    mold_name: '手机壳模具-白色',
    specifications: '手机壳专用',
    quantity: 2,
    status: 'normal'
  },
  {
    mold_code: 'MOLD-INJ-003',
    mold_name: '手机壳模具-蓝色',
    specifications: '手机壳专用',
    quantity: 1,
    status: 'normal'
  },
  {
    mold_code: 'MOLD-INJ-004',
    mold_name: '充电器外壳模具',
    specifications: '充电器专用',
    quantity: 2,
    status: 'normal'
  },
  {
    mold_code: 'MOLD-INJ-005',
    mold_name: '电池盖板模具',
    specifications: '电池盖板专用',
    quantity: 3,
    status: 'normal'
  },
  {
    mold_code: 'MOLD-INJ-006',
    mold_name: '屏幕支架模具',
    specifications: '屏幕支架专用',
    quantity: 1,
    status: 'maintenance'
  },
  {
    mold_code: 'MOLD-INJ-007',
    mold_name: '通用模具',
    specifications: '可生产手机壳和充电器',
    quantity: 2,
    status: 'normal'
  }
];

// 物料-设备关系（权重配置）
const materialDeviceRelations = [
  // 手机壳-黑色
  { material_code: 'MAT-INJ-001', device_code: 'INJ-001', weight: 90 },
  { material_code: 'MAT-INJ-001', device_code: 'INJ-002', weight: 85 },
  { material_code: 'MAT-INJ-001', device_code: 'INJ-003', weight: 70 },
  
  // 手机壳-白色
  { material_code: 'MAT-INJ-002', device_code: 'INJ-002', weight: 95 },
  { material_code: 'MAT-INJ-002', device_code: 'INJ-001', weight: 80 },
  { material_code: 'MAT-INJ-002', device_code: 'INJ-005', weight: 75 },
  
  // 手机壳-蓝色
  { material_code: 'MAT-INJ-003', device_code: 'INJ-003', weight: 90 },
  { material_code: 'MAT-INJ-003', device_code: 'INJ-005', weight: 85 },
  
  // 充电器外壳
  { material_code: 'MAT-INJ-004', device_code: 'INJ-002', weight: 90 },
  { material_code: 'MAT-INJ-004', device_code: 'INJ-001', weight: 75 },
  
  // 电池盖板
  { material_code: 'MAT-INJ-005', device_code: 'INJ-003', weight: 85 },
  { material_code: 'MAT-INJ-005', device_code: 'INJ-005', weight: 80 },
  
  // 屏幕支架
  { material_code: 'MAT-INJ-006', device_code: 'INJ-002', weight: 85 },
  { material_code: 'MAT-INJ-006', device_code: 'INJ-001', weight: 80 }
];

// 物料-模具关系（权重、节拍、出模数）
const materialMoldRelations = [
  // 手机壳-黑色
  { material_code: 'MAT-INJ-001', mold_code: 'MOLD-INJ-001', weight: 95, cycle_time: 30, output_per_cycle: 4 },
  { material_code: 'MAT-INJ-001', mold_code: 'MOLD-INJ-007', weight: 70, cycle_time: 35, output_per_cycle: 3 },
  
  // 手机壳-白色
  { material_code: 'MAT-INJ-002', mold_code: 'MOLD-INJ-002', weight: 95, cycle_time: 30, output_per_cycle: 4 },
  { material_code: 'MAT-INJ-002', mold_code: 'MOLD-INJ-007', weight: 70, cycle_time: 35, output_per_cycle: 3 },
  
  // 手机壳-蓝色
  { material_code: 'MAT-INJ-003', mold_code: 'MOLD-INJ-003', weight: 95, cycle_time: 30, output_per_cycle: 4 },
  
  // 充电器外壳
  { material_code: 'MAT-INJ-004', mold_code: 'MOLD-INJ-004', weight: 95, cycle_time: 25, output_per_cycle: 5 },
  { material_code: 'MAT-INJ-004', mold_code: 'MOLD-INJ-007', weight: 75, cycle_time: 28, output_per_cycle: 4 },
  
  // 电池盖板
  { material_code: 'MAT-INJ-005', mold_code: 'MOLD-INJ-005', weight: 90, cycle_time: 20, output_per_cycle: 6 },
  
  // 屏幕支架
  { material_code: 'MAT-INJ-006', mold_code: 'MOLD-INJ-006', weight: 95, cycle_time: 40, output_per_cycle: 3 }
];

// 计划单数据 - 包含业务逻辑和冲突场景
const productionPlans = [
  // 场景1: 手机壳黑色 - 紧急订单，交期最近
  {
    plan_number: 'PLAN-2024-001',
    material_code: 'MAT-INJ-001',
    planned_quantity: 5000,
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2天后
  },
  
  // 场景2: 手机壳白色 - 大订单，交期紧张
  {
    plan_number: 'PLAN-2024-002',
    material_code: 'MAT-INJ-002',
    planned_quantity: 8000,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3天后
  },
  
  // 场景3: 手机壳蓝色 - 中等订单，交期较宽松
  {
    plan_number: 'PLAN-2024-003',
    material_code: 'MAT-INJ-003',
    planned_quantity: 3000,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5天后
  },
  
  // 场景4: 充电器外壳 - 常规订单
  {
    plan_number: 'PLAN-2024-004',
    material_code: 'MAT-INJ-004',
    planned_quantity: 4000,
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4天后
  },
  
  // 场景5: 电池盖板 - 小订单
  {
    plan_number: 'PLAN-2024-005',
    material_code: 'MAT-INJ-005',
    planned_quantity: 2000,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3天后
  },
  
  // 场景6: 屏幕支架 - 特殊订单（模具在维修）
  {
    plan_number: 'PLAN-2024-006',
    material_code: 'MAT-INJ-006',
    planned_quantity: 1500,
    due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6天后
  },
  
  // 场景7: 手机壳黑色 - 追加订单（与PLAN-001同物料，测试同物料一致性）
  {
    plan_number: 'PLAN-2024-007',
    material_code: 'MAT-INJ-001',
    planned_quantity: 3000,
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4天后
  },
  
  // 场景8: 手机壳白色 - 追加订单（与PLAN-002同物料）
  {
    plan_number: 'PLAN-2024-008',
    material_code: 'MAT-INJ-002',
    planned_quantity: 2000,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5天后
  },
  
  // 场景9: 充电器外壳 - 追加订单
  {
    plan_number: 'PLAN-2024-009',
    material_code: 'MAT-INJ-004',
    planned_quantity: 3000,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3天后
  },
  
  // 场景10: 电池盖板 - 追加订单
  {
    plan_number: 'PLAN-2024-010',
    material_code: 'MAT-INJ-005',
    planned_quantity: 1500,
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4天后
  }
];

// 初始化函数
async function initializeData() {
  try {
    console.log('开始初始化注塑车间排程数据...\n');

    // 1. 初始化物料
    console.log('1. 初始化物料数据...');
    for (const material of materials) {
      try {
        await axios.post(`${API_BASE_URL}/materials`, material);
        console.log(`   ✓ 物料 ${material.material_code} 创建成功`);
      } catch (error) {
        console.log(`   ✗ 物料 ${material.material_code} 创建失败: ${error.response?.data?.message || error.message}`);
        if (error.response?.status === 404) {
          console.log(`      API 端点不存在，请确保后端服务已启动`);
        }
      }
    }

    // 2. 初始化设备
    console.log('\n2. 初始化设备数据...');
    for (const device of devices) {
      try {
        await axios.post(`${API_BASE_URL}/devices`, device);
        console.log(`   ✓ 设备 ${device.device_code} 创建成功`);
      } catch (error) {
        console.log(`   ✗ 设备 ${device.device_code} 创建失败: ${error.response?.data?.message || error.message}`);
      }
    }

    // 3. 初始化模具
    console.log('\n3. 初始化模具数据...');
    for (const mold of molds) {
      try {
        await axios.post(`${API_BASE_URL}/molds`, mold);
        console.log(`   ✓ 模具 ${mold.mold_code} 创建成功`);
      } catch (error) {
        console.log(`   ✗ 模具 ${mold.mold_code} 创建失败: ${error.response?.data?.message || error.message}`);
      }
    }

    // 获取所有物料、设备、模具的ID
    console.log('\n4. 获取资源ID映射...');
    const materialsRes = await axios.get(`${API_BASE_URL}/materials?limit=1000`);
    const devicesRes = await axios.get(`${API_BASE_URL}/devices?limit=1000`);
    const moldsRes = await axios.get(`${API_BASE_URL}/molds?limit=1000`);

    const materialMap = {};
    const deviceMap = {};
    const moldMap = {};

    materialsRes.data.data.forEach(m => {
      materialMap[m.material_code] = m.id;
    });
    devicesRes.data.data.forEach(d => {
      deviceMap[d.device_code] = d.id;
    });
    moldsRes.data.data.forEach(m => {
      moldMap[m.mold_code] = m.id;
    });

    // 4. 初始化物料-设备关系
    console.log('\n5. 初始化物料-设备关系...');
    for (const relation of materialDeviceRelations) {
      try {
        await axios.post(`${API_BASE_URL}/material-device-relations`, {
          material_id: materialMap[relation.material_code],
          device_id: deviceMap[relation.device_code],
          weight: relation.weight
        });
        console.log(`   ✓ 关系 ${relation.material_code} -> ${relation.device_code} 创建成功`);
      } catch (error) {
        console.log(`   ✗ 关系 ${relation.material_code} -> ${relation.device_code} 创建失败`);
      }
    }

    // 5. 初始化物料-模具关系
    console.log('\n6. 初始化物料-模具关系...');
    for (const relation of materialMoldRelations) {
      try {
        await axios.post(`${API_BASE_URL}/material-mold-relations`, {
          material_id: materialMap[relation.material_code],
          mold_id: moldMap[relation.mold_code],
          weight: relation.weight,
          cycle_time: relation.cycle_time,
          output_per_cycle: relation.output_per_cycle
        });
        console.log(`   ✓ 关系 ${relation.material_code} -> ${relation.mold_code} 创建成功`);
      } catch (error) {
        console.log(`   ✗ 关系 ${relation.material_code} -> ${relation.mold_code} 创建失败`);
      }
    }

    // 6. 初始化计划单
    console.log('\n7. 初始化计划单数据...');
    for (const plan of productionPlans) {
      try {
        await axios.post(`${API_BASE_URL}/plans`, {
          plan_number: plan.plan_number,
          material_id: materialMap[plan.material_code],
          planned_quantity: plan.planned_quantity,
          due_date: plan.due_date.toISOString()
        });
        console.log(`   ✓ 计划单 ${plan.plan_number} 创建成功 (交期: ${plan.due_date.toLocaleDateString()})`);
      } catch (error) {
        console.log(`   ✗ 计划单 ${plan.plan_number} 创建失败: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n✅ 注塑车间排程数据初始化完成！');
    console.log('\n📊 数据统计:');
    console.log(`   - 物料数: ${materials.length}`);
    console.log(`   - 设备数: ${devices.length}`);
    console.log(`   - 模具数: ${molds.length}`);
    console.log(`   - 物料-设备关系: ${materialDeviceRelations.length}`);
    console.log(`   - 物料-模具关系: ${materialMoldRelations.length}`);
    console.log(`   - 计划单数: ${productionPlans.length}`);
    console.log('\n🎯 业务场景说明:');
    console.log('   1. PLAN-001: 手机壳黑色 - 紧急订单 (2天交期)');
    console.log('   2. PLAN-002: 手机壳白色 - 大订单 (3天交期)');
    console.log('   3. PLAN-003: 手机壳蓝色 - 中等订单 (5天交期)');
    console.log('   4. PLAN-004: 充电器外壳 - 常规订单 (4天交期)');
    console.log('   5. PLAN-005: 电池盖板 - 小订单 (3天交期)');
    console.log('   6. PLAN-006: 屏幕支架 - 特殊订单 (模具维修中)');
    console.log('   7. PLAN-007: 手机壳黑色追加 - 测试同物料一致性');
    console.log('   8. PLAN-008: 手机壳白色追加 - 测试同物料一致性');
    console.log('   9. PLAN-009: 充电器外壳追加 - 测试资源冲突');
    console.log('   10. PLAN-010: 电池盖板追加 - 测试多模具灵活分配');
    console.log('\n💡 排程建议:');
    console.log('   - 注意设备4号在维修中，不能使用');
    console.log('   - 模具6号在维修中，PLAN-006可能无法按时完成');
    console.log('   - 同物料计划单应分配到同一设备和模具');
    console.log('   - 注意模具3号和6号只有1副，存在绑定关系');
    console.log('   - 通用模具7号可用于手机壳和充电器的灵活分配');

  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initializeData();
