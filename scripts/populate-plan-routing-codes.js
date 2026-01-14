/**
 * 填充现有计划单的工艺路线编码
 * 根据工艺路线ID查找对应的工艺路线编码，填充到计划单中
 */

require('dotenv').config();
const sequelize = require('../server/config/database');
const ProductionPlan = require('../server/models/ProductionPlan');
const ProcessRouting = require('../server/models/ProcessRouting');

async function populatePlanRoutingCodes() {
  try {
    console.log('开始填充计划单的工艺路线编码...\n');

    // 1. 获取所有计划单
    const plans = await ProductionPlan.findAll();
    console.log(`找到 ${plans.length} 个计划单\n`);

    if (plans.length === 0) {
      console.log('没有计划单数据');
      return;
    }

    // 2. 获取所有工艺路线
    const routings = await ProcessRouting.findAll();
    console.log(`找到 ${routings.length} 个工艺路线\n`);

    // 创建工艺路线编码映射
    const routingMap = {};
    routings.forEach(r => {
      routingMap[r.id] = r.routing_code;
    });

    // 3. 填充计划单的工艺路线编码
    let updatedCount = 0;
    let emptyCount = 0;

    for (const plan of plans) {
      if (plan.process_routing_id && routingMap[plan.process_routing_id]) {
        const routingCode = routingMap[plan.process_routing_id];
        
        if (plan.process_route_number !== routingCode) {
          await plan.update({
            process_route_number: routingCode
          });
          updatedCount++;
          console.log(`✓ 更新计划单 ${plan.plan_number}: 工艺路线编码 = ${routingCode}`);
        }
      } else if (!plan.process_routing_id) {
        emptyCount++;
        console.log(`⚠ 计划单 ${plan.plan_number}: 没有关联工艺路线ID`);
      }
    }

    console.log('\n========== 填充完成 ==========');
    console.log(`已更新计划单: ${updatedCount} 个`);
    console.log(`空工艺路线ID: ${emptyCount} 个`);
    console.log(`总计: ${plans.length} 个计划单`);
    console.log('================================\n');

    // 4. 验证结果
    const updatedPlans = await ProductionPlan.findAll();
    console.log('更新后的计划单列表:');
    console.log('─'.repeat(80));
    updatedPlans.forEach((plan, index) => {
      console.log(`${index + 1}. 计划单号: ${plan.plan_number} | 工艺路线编码: ${plan.process_route_number || '空'}`);
    });
    console.log('─'.repeat(80));

  } catch (error) {
    console.error('填充失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行填充
populatePlanRoutingCodes()
  .then(() => {
    console.log('✓ 工艺路线编码填充成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ 工艺路线编码填充失败:', error.message);
    process.exit(1);
  });
