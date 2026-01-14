require('dotenv').config();
const sequelize = require('../server/config/database');

async function clearTasks() {
  try {
    console.log('开始清除任务单数据...');
    
    // 直接执行SQL删除任务单
    await sequelize.query('DELETE FROM production_tasks');
    console.log('✅ 任务单已清除');
    
    // 重置计划单状态为未排产
    await sequelize.query("UPDATE production_plans SET status = 'unscheduled'");
    console.log('✅ 计划单状态已重置为未排产');
    
    console.log('\n✨ 清除完成！现在可以重新执行排程');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 清除失败:', error.message);
    process.exit(1);
  }
}

clearTasks();
