/**
 * 从排程模块数据反向补齐工艺管理中的工艺路线
 * 用途：根据排程计划单和任务单的数据，自动创建对应的工艺路线记录
 * 这样用户可以看到完整的数据流：排程数据 → 工艺路线
 */

require('dotenv').config();
const sequelize = require('../server/config/database');
const ProductionPlan = require('../server/models/ProductionPlan');
const ProductionTask = require('../server/models/ProductionTask');
const ProcessRouting = require('../server/models/ProcessRouting');
const Material = require('../server/models/Material');
const Device = require('../server/models/Device');
const Mold = require('../server/models/Mold');

async function syncSchedulingToProcess() {
  try {
    console.log('开始从排程数据同步到工艺管理...\n');

    // 1. 获取所有计划单
    const plans = await ProductionPlan.findAll({
      include: [{ model: Material }],
      raw: false
    });

    console.log(`找到 ${plans.length} 个计划单\n`);

    if (plans.length === 0) {
      console.log('没有计划单数据，无法同步');
      return;
    }

    // 2. 获取所有任务单
    const tasks = await ProductionTask.findAll({
      include: [
        { model: ProductionPlan, include: [{ model: Material }] },
        { model: Device },
        { model: Mold }
      ],
      raw: false
    });

    console.log(`找到 ${tasks.length} 个任务单\n`);

    // 3. 按工艺路线编码分组任务单
    const tasksByRouting = {};
    tasks.forEach(task => {
      const plan = task.ProductionPlan;
      const routingCode = plan.process_route_number;
      
      // 如果没有工艺路线编码，则根据物料ID生成一个
      const finalRoutingCode = routingCode || `PR-${String(plan.material_id).padStart(3, '0')}`;
      
      if (finalRoutingCode) {
        if (!tasksByRouting[finalRoutingCode]) {
          tasksByRouting[finalRoutingCode] = [];
        }
        tasksByRouting[finalRoutingCode].push({
          ...task.toJSON(),
          routingCode: finalRoutingCode
        });
      }
    });

    console.log(`找到 ${Object.keys(tasksByRouting).length} 个不同的工艺路线编码\n`);

    // 4. 为每个工艺路线编码创建或更新工艺路线记录
    let createdCount = 0;
    let updatedCount = 0;

    for (const [routingCode, routingTasks] of Object.entries(tasksByRouting)) {
      // 获取该工艺路线的第一个任务单作为参考
      const firstTask = routingTasks[0];
      const plan = firstTask.ProductionPlan;
      const material = plan.Material;

      // 检查工艺路线是否已存在
      let processRouting = await ProcessRouting.findOne({
        where: { routing_code: routingCode }
      });

      if (processRouting) {
        // 更新现有工艺路线
        await processRouting.update({
          material_id: material.id,
          process_name: material.material_name,
          equipment_id: firstTask.device_id,
          mold_id: firstTask.mold_id,
          estimated_time: firstTask.estimated_time || 0,
          notes: `从排程数据同步 - 关联 ${routingTasks.length} 个任务单`
        });
        updatedCount++;
        console.log(`✓ 更新工艺路线: ${routingCode} (${material.material_name})`);
      } else {
        // 创建新的工艺路线
        processRouting = await ProcessRouting.create({
          routing_code: routingCode,
          material_id: material.id,
          process_sequence: 1,
          process_name: material.material_name,
          equipment_id: firstTask.device_id,
          mold_id: firstTask.mold_id,
          estimated_time: firstTask.estimated_time || 0,
          notes: `从排程数据自动生成 - 关联 ${routingTasks.length} 个任务单`
        });
        createdCount++;
        console.log(`✓ 创建工艺路线: ${routingCode} (${material.material_name})`);
      }

      // 打印该工艺路线的任务单信息
      console.log(`  └─ 关联任务单数: ${routingTasks.length}`);
      routingTasks.forEach((task, index) => {
        console.log(`     ${index + 1}. 任务单: ${task.task_number} | 设备: ${task.Device?.device_name || 'N/A'} | 模具: ${task.Mold?.mold_name || 'N/A'}`);
      });
      console.log('');
    }

    console.log('\n========== 同步完成 ==========');
    console.log(`新建工艺路线: ${createdCount} 个`);
    console.log(`更新工艺路线: ${updatedCount} 个`);
    console.log(`总计: ${createdCount + updatedCount} 个工艺路线`);
    console.log('================================\n');

    // 5. 验证同步结果
    const allRoutings = await ProcessRouting.findAll({
      raw: false
    });

    console.log('工艺管理中的工艺路线列表:');
    console.log('─'.repeat(80));
    allRoutings.forEach((routing, index) => {
      console.log(`${index + 1}. 编码: ${routing.routing_code} | 名称: ${routing.process_name} | 物料ID: ${routing.material_id}`);
    });
    console.log('─'.repeat(80));

  } catch (error) {
    console.error('同步失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行同步
syncSchedulingToProcess()
  .then(() => {
    console.log('✓ 数据同步成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ 数据同步失败:', error.message);
    process.exit(1);
  });
