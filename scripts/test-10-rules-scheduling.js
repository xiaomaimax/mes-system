require('dotenv').config();
const sequelize = require('../server/config/database');
const SchedulingEngine = require('../server/services/SchedulingEngine');
const ProductionTask = require('../server/models/ProductionTask');
const ProductionPlan = require('../server/models/ProductionPlan');

async function testScheduling() {
  try {
    console.log('🚀 开始测试10种排程规则...\n');

    // 执行排程
    console.log('执行排程...');
    const result = await SchedulingEngine.executeScheduling();
    
    if (!result.success) {
      console.error('❌ 排程失败:', result.message);
      process.exit(1);
    }

    console.log(`✅ 排程成功: ${result.message}\n`);

    // 查询所有任务单
    const tasks = await ProductionTask.findAll({
      include: [
        { model: ProductionPlan }
      ],
      order: [['created_at', 'ASC']]
    });

    console.log(`📊 排程结果统计 (共${tasks.length}个任务单):\n`);

    // 统计排程原因分布
    const reasonStats = {};
    tasks.forEach(task => {
      const reason = task.scheduling_reason || '未知';
      if (!reasonStats[reason]) {
        reasonStats[reason] = [];
      }
      reasonStats[reason].push(task);
    });

    // 显示详细结果
    console.log('排程原因分布:');
    console.log('─'.repeat(80));
    
    Object.entries(reasonStats).forEach(([reason, taskList]) => {
      console.log(`\n${reason}`);
      console.log(`数量: ${taskList.length}个`);
      taskList.forEach(task => {
        console.log(`  • ${task.ProductionPlan.plan_number}`);
      });
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n📈 规则覆盖情况:');
    
    const rules = [
      '1️⃣ 交期优先',
      '2️⃣ 设备权重优先',
      '3️⃣ 模具权重优先',
      '4️⃣ 模具-设备独占性',
      '5️⃣ 模具-设备绑定',
      '6️⃣ 同物料一致性',
      '7️⃣ 同模具一致性',
      '8️⃣ 计划单唯一性',
      '9️⃣ 同模多物料同步',
      '🔟 多模具灵活排程'
    ];

    rules.forEach(rule => {
      const count = Object.keys(reasonStats).filter(r => r.includes(rule.split(' ')[0])).reduce((sum, r) => sum + reasonStats[r].length, 0);
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${rule}: ${count}个`);
    });

    console.log('\n✨ 测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testScheduling();
