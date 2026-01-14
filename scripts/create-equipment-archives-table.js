/**
 * 创建设备档案表并同步数据
 * 为设备管理中的设备档案功能创建专门的数据表
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mes_system',
  charset: 'utf8mb4'
};

async function createEquipmentArchivesTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    // 创建设备档案表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS equipment_archives (
        id INT PRIMARY KEY AUTO_INCREMENT,
        equipment_code VARCHAR(50) NOT NULL UNIQUE,
        equipment_name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        model VARCHAR(100),
        manufacturer VARCHAR(100),
        purchase_date DATE,
        warranty_end_date DATE,
        original_value DECIMAL(12,2),
        current_value DECIMAL(12,2),
        location VARCHAR(100),
        status ENUM('running', 'idle', 'maintenance', 'fault', 'scrapped') DEFAULT 'running',
        technical_specs JSON,
        documents JSON,
        maintenance_records INT DEFAULT 0,
        repair_records INT DEFAULT 0,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_equipment_code (equipment_code),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备档案表'
    `;

    await connection.execute(createTableSQL);
    console.log('✅ 设备档案表创建成功');

    // 从设备主数据表获取所有设备
    const [equipmentRows] = await connection.execute(`
      SELECT 
        equipment_code,
        equipment_name,
        equipment_type as category,
        model,
        manufacturer,
        purchase_date,
        warranty_end_date,
        location,
        status,
        specifications
      FROM equipment 
      WHERE is_active = 1
      ORDER BY equipment_code
    `);

    console.log(`📋 找到 ${equipmentRows.length} 个设备需要创建档案`);

    // 为每个设备创建档案记录
    for (const equipment of equipmentRows) {
      // 检查档案是否已存在
      const [existingArchive] = await connection.execute(
        'SELECT id FROM equipment_archives WHERE equipment_code = ?',
        [equipment.equipment_code]
      );

      if (existingArchive.length > 0) {
        console.log(`⚠️  设备 ${equipment.equipment_code} 档案已存在，跳过`);
        continue;
      }

      // 根据设备类型设置默认值
      const archiveData = generateArchiveData(equipment);

      const insertSQL = `
        INSERT INTO equipment_archives (
          equipment_code, equipment_name, category, model, manufacturer,
          purchase_date, warranty_end_date, original_value, current_value,
          location, status, technical_specs, documents, maintenance_records,
          repair_records, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertSQL, [
        equipment.equipment_code,
        equipment.equipment_name,
        equipment.category,
        equipment.model || archiveData.model,
        equipment.manufacturer || archiveData.manufacturer,
        equipment.purchase_date || archiveData.purchase_date,
        equipment.warranty_end_date || archiveData.warranty_end_date,
        archiveData.original_value,
        archiveData.current_value,
        equipment.location || archiveData.location,
        equipment.status,
        JSON.stringify(archiveData.technical_specs),
        JSON.stringify(archiveData.documents),
        archiveData.maintenance_records,
        archiveData.repair_records,
        archiveData.remarks
      ]);

      console.log(`✅ 设备 ${equipment.equipment_code} (${equipment.equipment_name}) 档案创建成功`);
    }

    // 查询并显示结果
    const [archiveCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM equipment_archives'
    );
    
    const [archiveList] = await connection.execute(`
      SELECT equipment_code, equipment_name, category, manufacturer, original_value
      FROM equipment_archives 
      ORDER BY equipment_code
    `);

    console.log('\n📊 设备档案创建完成统计:');
    console.log(`总档案数: ${archiveCount[0].count}`);
    console.log('\n设备档案列表:');
    archiveList.forEach(archive => {
      console.log(`  ${archive.equipment_code} - ${archive.equipment_name} (${archive.category}) - ¥${archive.original_value?.toLocaleString() || '0'}`);
    });

  } catch (error) {
    console.error('❌ 创建设备档案表失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 根据设备信息生成档案数据
 */
function generateArchiveData(equipment) {
  const baseData = {
    purchase_date: '2023-01-15',
    warranty_end_date: '2026-01-15',
    maintenance_records: Math.floor(Math.random() * 20) + 5,
    repair_records: Math.floor(Math.random() * 5) + 1
  };

  // 根据设备类型设置特定数据
  switch (equipment.category) {
    case '注塑设备':
      return {
        ...baseData,
        model: equipment.model || 'INJ-2000A',
        manufacturer: equipment.manufacturer || '海天集团',
        original_value: 350000.00,
        current_value: 280000.00,
        location: equipment.location || '车间A-01',
        technical_specs: {
          power: '50kW',
          capacity: '200T',
          dimensions: '4.5m×2.2m×2.8m',
          injection_pressure: '180MPa',
          clamping_force: '2000kN'
        },
        documents: [
          { name: '设备说明书', type: 'manual' },
          { name: '质保书', type: 'warranty' },
          { name: '验收报告', type: 'acceptance' },
          { name: '安装调试报告', type: 'installation' }
        ],
        remarks: '主力生产设备，用于注塑成型'
      };

    case '包装设备':
      return {
        ...baseData,
        model: equipment.model || 'PKG-500',
        manufacturer: equipment.manufacturer || '三菱',
        original_value: 180000.00,
        current_value: 150000.00,
        location: equipment.location || '车间A-02',
        technical_specs: {
          power: '15kW',
          capacity: '500件/小时',
          dimensions: '3.2m×1.8m×2.1m',
          packaging_speed: '500pcs/h'
        },
        documents: [
          { name: '设备说明书', type: 'manual' },
          { name: '质保书', type: 'warranty' },
          { name: '验收报告', type: 'acceptance' }
        ],
        remarks: '自动包装设备，效率高'
      };

    case '检测设备':
      return {
        ...baseData,
        model: equipment.model || 'CHK-200',
        manufacturer: equipment.manufacturer || '西门子',
        original_value: 220000.00,
        current_value: 180000.00,
        location: equipment.location || '车间B-01',
        technical_specs: {
          power: '8kW',
          accuracy: '±0.01mm',
          dimensions: '2.5m×1.5m×1.8m',
          detection_speed: '200件/小时'
        },
        documents: [
          { name: '设备说明书', type: 'manual' },
          { name: '质保书', type: 'warranty' },
          { name: '验收报告', type: 'acceptance' },
          { name: '校准证书', type: 'calibration' }
        ],
        remarks: '高精度检测设备，质量控制关键设备'
      };

    case '传送设备':
      return {
        ...baseData,
        model: equipment.model || 'CONV-300',
        manufacturer: equipment.manufacturer || '博世',
        original_value: 80000.00,
        current_value: 65000.00,
        location: equipment.location || '车间C-01',
        technical_specs: {
          power: '5kW',
          speed: '30m/min',
          dimensions: '10m×0.8m×1.2m',
          load_capacity: '500kg'
        },
        documents: [
          { name: '设备说明书', type: 'manual' },
          { name: '质保书', type: 'warranty' },
          { name: '验收报告', type: 'acceptance' }
        ],
        remarks: '物料传送设备，连接各工序'
      };

    case '冷却设备':
      return {
        ...baseData,
        model: equipment.model || 'COOL-100',
        manufacturer: equipment.manufacturer || '日立',
        original_value: 120000.00,
        current_value: 95000.00,
        location: equipment.location || '车间A-03',
        technical_specs: {
          power: '12kW',
          cooling_capacity: '100kW',
          dimensions: '2.8m×1.5m×2.0m',
          temperature_range: '5-35°C'
        },
        documents: [
          { name: '设备说明书', type: 'manual' },
          { name: '质保书', type: 'warranty' },
          { name: '验收报告', type: 'acceptance' }
        ],
        remarks: '冷却系统，保证生产温度'
      };

    default:
      return {
        ...baseData,
        model: equipment.model || 'UNKNOWN',
        manufacturer: equipment.manufacturer || '未知厂商',
        original_value: 100000.00,
        current_value: 80000.00,
        location: equipment.location || '未知位置',
        technical_specs: {
          power: '未知',
          dimensions: '未知'
        },
        documents: [
          { name: '设备说明书', type: 'manual' }
        ],
        remarks: '设备档案待完善'
      };
  }
}

// 执行脚本
if (require.main === module) {
  createEquipmentArchivesTable()
    .then(() => {
      console.log('\n🎉 设备档案表创建和数据同步完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 脚本执行失败:', error.message);
      process.exit(1);
    });
}

module.exports = { createEquipmentArchivesTable };