require('dotenv').config();
const sequelize = require('../server/config/database');
const ProductionTask = require('../server/models/ProductionTask');

async function addSchedulingReasonColumn() {
  try {
    console.log('开始添加 scheduling_reason 列...');
    
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    
    console.log('✅ scheduling_reason 列已成功添加到 production_tasks 表');
    console.log('✅ 数据库迁移完成');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加列失败:', error);
    process.exit(1);
  }
}

addSchedulingReasonColumn();
