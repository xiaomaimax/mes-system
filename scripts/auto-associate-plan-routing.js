/**
 * 自动关联计划单与工艺路线
 * 根据物料ID和计划单号的规律，自动关联到对应的工艺路线
 */

require('dotenv').config();
const sequelize = require('../server/config/database');
const ProductionPlan = require('../server/models/ProductionPlan');
const ProcessRouting = require('../server/models/ProcessRouting');
const Material = require('../server/models/Material');

async function autoAssociatePlanRouting() {
  try {
    console.log('开始自动关联计划单与工艺路线...\n');

    // 1. 获取所有计划单
    const plans = await ProductionPlan.findAll({
      include: [{ model: Material }]
    });
    console.log(`找到 ${plans.length} 个计划单\n`);

    // 2. 获取所有工艺路线
    const routings = await ProcessRouting.findAll();
    console.log(`找到 ${routings.length} 个工艺路线\n`);

    // 3. 创建物料ID到工艺路线的映射
    const materialRoutingMap = {};
    routings.forEach(r => {
      if (!materialRoutingMap[r.material_id]) {
        materialRoutingMap[r.material_id] = [];
      }
      materialRoutingMap[r.material_id].push(r);
    });

    console.log('物料与工艺路线的对应关系:');
    console.log('─'.repeat(80));
    Object.entries(materialRoutingMap).forEach(([materialId, routingList]) => {
      console.log(`物料ID ${materialId}: ${routingList.length} 个工艺路线`);
      routingList.forEach(r => {
        console.log(`  - ${r.routing_code}: ${r.process_name}`);
      });
    });
    console.log('─'.repeat(80) + '\n');

    // 4. 关联计划单与工艺路线
    let associatedCount = 0;
    let skippedCount = 0;

    for (const plan of plans) {
      const materialId = plan.material_id;
      const routingList = materialRoutingMap[materialId];

      if (routingList && routingList.length > 0) {
        // 选择第一个工艺路线（可以根据需要调整选择逻辑）
        const selectedRouting = routingList[0];
        
        if (plan.process_routing_id !== selectedRouting.id) {
          await plan.update({
            process_routing_id: selectedRouting.id,
            process_route_number: selectedRouting.routing_code
          });
          associatedCount++;
          console.log(`✓ 关联计划单 ${plan.plan_number} (物料ID: ${materialId}) → 工艺路线 ${selectedRouting.routing_code}`);
        }
      } else {
        skippedCount++;
        console.log(`⚠ 计划单 ${plan.plan_number} (物料ID: ${materialId}): 没有对应的工艺路线`);
      }
    }

    console.log('\n========== 关联完成 ==========');
    console.log(`已关联计划单: ${associatedCount} 个`);
    console.log(`跳过计划单: ${skippedCount} 个`);
    console.log(`总计: ${plans.length} 个计划单`);
    console.log('================================\n');

    // 5. 验证结果
    const updatedPlans = await ProductionPlan.findAll({
      include: [{ model: Material }]
    });
    console.log('关联后的计划单列表:');
    console.log('─'.repeat(100));
    updatedPlans.forEach((plan, index) => {
      const material = plan.Material ? plan.Material.material_name : 'N/A';
      console.log(`${index + 1}. 计划单号: ${plan.plan_number} | 物料: ${material} | 工艺路线编码: ${plan.process_route_number || '空'}`);
    });
    console.log('─'.repeat(100));

  } catch (error) {
    console.error('关联失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行关联
autoAssociatePlanRouting()
  .then(() => {
    console.log('✓ 计划单与工艺路线关联成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ 计划单与工艺路线关联失败:', error.message);
    process.exit(1);
  });
