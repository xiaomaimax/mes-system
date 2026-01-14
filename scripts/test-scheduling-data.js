/**
 * 辅助排程模块 - 数据验证脚本
 * 验证所有导入的数据是否可以通过API正确访问
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/scheduling';

async function testSchedulingData() {
  console.log('🧪 开始测试辅助排程数据...\n');

  try {
    // 1. 测试物料数据
    console.log('1️⃣  测试物料数据...');
    const materialsRes = await axios.get(`${API_BASE_URL}/materials?limit=100`);
    console.log(`   ✓ 物料总数: ${materialsRes.data.data.length}`);
    materialsRes.data.data.forEach(m => {
      console.log(`     - ${m.material_code}: ${m.material_name}`);
    });

    // 2. 测试设备数据
    console.log('\n2️⃣  测试设备数据...');
    const devicesRes = await axios.get(`${API_BASE_URL}/devices?limit=100`);
    console.log(`   ✓ 设备总数: ${devicesRes.data.data.length}`);
    devicesRes.data.data.forEach(d => {
      console.log(`     - ${d.device_code}: ${d.device_name} (状态: ${d.status})`);
    });

    // 3. 测试模具数据
    console.log('\n3️⃣  测试模具数据...');
    const moldsRes = await axios.get(`${API_BASE_URL}/molds?limit=100`);
    console.log(`   ✓ 模具总数: ${moldsRes.data.data.length}`);
    moldsRes.data.data.forEach(m => {
      console.log(`     - ${m.mold_code}: ${m.mold_name} (数量: ${m.quantity}, 状态: ${m.status})`);
    });

    // 4. 测试物料-设备关系
    console.log('\n4️⃣  测试物料-设备关系...');
    const mdRelationsRes = await axios.get(`${API_BASE_URL}/material-device-relations`);
    console.log(`   ✓ 物料-设备关系总数: ${mdRelationsRes.data.data.length}`);
    console.log(`     示例关系:`);
    mdRelationsRes.data.data.slice(0, 5).forEach(r => {
      console.log(`     - ${r.Material?.material_code} -> ${r.Device?.device_code} (权重: ${r.weight})`);
    });

    // 5. 测试物料-模具关系
    console.log('\n5️⃣  测试物料-模具关系...');
    const mmRelationsRes = await axios.get(`${API_BASE_URL}/material-mold-relations`);
    console.log(`   ✓ 物料-模具关系总数: ${mmRelationsRes.data.data.length}`);
    console.log(`     示例关系:`);
    mmRelationsRes.data.data.slice(0, 5).forEach(r => {
      console.log(`     - ${r.Material?.material_code} -> ${r.Mold?.mold_code} (权重: ${r.weight}, 节拍: ${r.cycle_time}s, 出模数: ${r.output_per_cycle})`);
    });

    // 6. 测试计划单数据
    console.log('\n6️⃣  测试计划单数据...');
    const plansRes = await axios.get(`${API_BASE_URL}/plans?limit=100`);
    console.log(`   ✓ 计划单总数: ${plansRes.data.pagination?.total || plansRes.data.data.length}`);
    console.log(`     计划单列表:`);
    plansRes.data.data.forEach(p => {
      const daysUntilDue = Math.ceil((new Date(p.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`     - ${p.plan_number}: ${p.Material?.material_name} (数量: ${p.planned_quantity}, 交期: ${daysUntilDue}天, 状态: ${p.status})`);
    });

    // 7. 测试任务单数据
    console.log('\n7️⃣  测试任务单数据...');
    const tasksRes = await axios.get(`${API_BASE_URL}/tasks?limit=100`);
    console.log(`   ✓ 任务单总数: ${tasksRes.data.pagination?.total || tasksRes.data.data.length}`);
    if (tasksRes.data.data.length > 0) {
      console.log(`     任务单列表:`);
      tasksRes.data.data.slice(0, 5).forEach(t => {
        console.log(`     - ${t.task_number}: ${t.ProductionPlan?.plan_number} (状态: ${t.status})`);
      });
    } else {
      console.log(`     (暂无任务单，需要执行排程后生成)`);
    }

    // 8. 数据完整性检查
    console.log('\n8️⃣  数据完整性检查...');
    const checks = [
      { name: '物料数据', pass: materialsRes.data.data.length >= 6 },
      { name: '设备数据', pass: devicesRes.data.data.length >= 5 },
      { name: '模具数据', pass: moldsRes.data.data.length >= 7 },
      { name: '物料-设备关系', pass: mdRelationsRes.data.data.length >= 14 },
      { name: '物料-模具关系', pass: mmRelationsRes.data.data.length >= 9 },
      { name: '计划单数据', pass: plansRes.data.data.length >= 10 }
    ];

    checks.forEach(check => {
      console.log(`   ${check.pass ? '✓' : '✗'} ${check.name}`);
    });

    const allPassed = checks.every(c => c.pass);

    // 9. 业务逻辑验证
    console.log('\n9️⃣  业务逻辑验证...');
    
    // 检查是否有维修中的设备
    const maintenanceDevices = devicesRes.data.data.filter(d => d.status === 'maintenance');
    console.log(`   ${maintenanceDevices.length > 0 ? '✓' : '✗'} 维修中的设备: ${maintenanceDevices.length}台`);
    
    // 检查是否有维修中的模具
    const maintenanceMolds = moldsRes.data.data.filter(m => m.status === 'maintenance');
    console.log(`   ${maintenanceMolds.length > 0 ? '✓' : '✗'} 维修中的模具: ${maintenanceMolds.length}副`);
    
    // 检查是否有单副模具
    const singleMolds = moldsRes.data.data.filter(m => m.quantity === 1);
    console.log(`   ${singleMolds.length > 0 ? '✓' : '✗'} 单副模具: ${singleMolds.length}副`);
    
    // 检查是否有不同交期的计划单
    const dueDates = new Set(plansRes.data.data.map(p => new Date(p.due_date).toDateString()));
    console.log(`   ${dueDates.size > 1 ? '✓' : '✗'} 多个交期: ${dueDates.size}个不同交期`);
    
    // 检查是否有同物料的多个计划单
    const materialCounts = {};
    plansRes.data.data.forEach(p => {
      const code = p.Material?.material_code;
      materialCounts[code] = (materialCounts[code] || 0) + 1;
    });
    const multiMaterialPlans = Object.values(materialCounts).filter(c => c > 1).length;
    console.log(`   ${multiMaterialPlans > 0 ? '✓' : '✗'} 同物料多计划单: ${multiMaterialPlans}种物料有多个计划单`);

    // 总结
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('✅ 所有数据验证通过！');
      console.log('\n📊 数据摘要:');
      console.log(`   - 物料: ${materialsRes.data.data.length}个`);
      console.log(`   - 设备: ${devicesRes.data.data.length}台`);
      console.log(`   - 模具: ${moldsRes.data.data.length}副`);
      console.log(`   - 物料-设备关系: ${mdRelationsRes.data.data.length}条`);
      console.log(`   - 物料-模具关系: ${mmRelationsRes.data.data.length}条`);
      console.log(`   - 计划单: ${plansRes.data.data.length}个`);
      console.log(`   - 任务单: ${tasksRes.data.data.length}个`);
      console.log('\n🎯 系统已准备好进行排程测试！');
      console.log('   1. 访问 http://localhost:3000');
      console.log('   2. 导航到"辅助排程"模块');
      console.log('   3. 查看各标签页的数据');
      console.log('   4. 点击"执行排程"按钮进行排程测试');
    } else {
      console.log('❌ 部分数据验证失败，请检查数据导入过程');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response?.status === 404) {
      console.error('   API端点不存在，请确保后端服务已启动');
    }
    process.exit(1);
  }
}

// 运行测试
testSchedulingData();
