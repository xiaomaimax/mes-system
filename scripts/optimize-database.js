/**
 * 数据库性能优化脚本（方案 5）
 */
const sequelize = require('../config/database');
const logger = require('../utils/logger');

async function optimizeDatabase() {
  console.log('🔧 开始数据库优化...');
  
  const indexes = [
    // 生产订单索引
    { table: 'production_orders', name: 'idx_order_status', sql: 'CREATE INDEX idx_order_status ON production_orders(status)' },
    { table: 'production_orders', name: 'idx_order_created', sql: 'CREATE INDEX idx_order_created ON production_orders(created_at)' },
    
    // 设备索引
    { table: 'equipment', name: 'idx_equipment_code', sql: 'CREATE INDEX idx_equipment_code ON equipment(equipment_code)' },
    
    // 库存索引
    { table: 'inventory', name: 'idx_material_code', sql: 'CREATE INDEX idx_material_code ON inventory(material_code)' },
    { table: 'inventory', name: 'idx_batch_number', sql: 'CREATE INDEX idx_batch_number ON inventory(batch_number)' },
    
    // 检验记录索引
    { table: 'iqc_inspections', name: 'idx_iqc_date', sql: 'CREATE INDEX idx_iqc_date ON iqc_inspections(inspection_date)' },
    { table: 'pqc_inspections', name: 'idx_pqc_date', sql: 'CREATE INDEX idx_pqc_date ON pqc_inspections(inspection_date)' },
    { table: 'fqc_inspections', name: 'idx_fqc_date', sql: 'CREATE INDEX idx_fqc_date ON fqc_inspections(inspection_date)' }
  ];
  
  for (const idx of indexes) {
    try {
      await sequelize.query(idx.sql);
      console.log('✅ 创建索引:', idx.name);
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        console.log('⚠️  索引已存在:', idx.name);
      } else {
        console.log('❌ 创建索引失败:', idx.name, error.message);
      }
    }
  }
  
  console.log('\n✅ 数据库优化完成！');
}

optimizeDatabase().catch(console.error);
