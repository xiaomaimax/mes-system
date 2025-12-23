require('dotenv').config();
const sequelize = require('../server/config/database');
const User = require('../server/models/User');
const ProductionOrder = require('../server/models/ProductionOrder');
const Equipment = require('../server/models/Equipment');

async function setupDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 同步数据库表结构
    await sequelize.sync({ force: true });
    console.log('数据库表结构同步完成');
    
    // 创建默认管理员用户
    await User.create({
      username: 'admin',
      password: '123456',
      email: 'admin@mes.com',
      full_name: '系统管理员',
      role: 'admin',
      department: 'IT部门'
    });
    console.log('默认管理员用户创建完成');
    
    // 创建测试用户
    await User.create({
      username: 'operator',
      password: '123456',
      email: 'operator@mes.com',
      full_name: '操作员',
      role: 'operator',
      department: '生产部门'
    });
    console.log('测试用户创建完成');
    
    // 创建测试设备
    await Equipment.bulkCreate([
      {
        equipment_code: 'EQ-001',
        equipment_name: '注塑机A1',
        equipment_type: '注塑设备',
        production_line_id: 1,
        status: 'running',
        location: '车间A-01'
      },
      {
        equipment_code: 'EQ-002',
        equipment_name: '包装机B1',
        equipment_type: '包装设备',
        production_line_id: 1,
        status: 'idle',
        location: '车间A-02'
      },
      {
        equipment_code: 'EQ-003',
        equipment_name: '检测设备C1',
        equipment_type: '检测设备',
        production_line_id: 2,
        status: 'maintenance',
        location: '车间B-01'
      }
    ]);
    console.log('测试设备创建完成');
    
    // 创建测试生产订单
    await ProductionOrder.bulkCreate([
      {
        order_number: 'PO-2024-001',
        product_code: 'PROD-A001',
        product_name: '产品A',
        planned_quantity: 1000,
        produced_quantity: 750,
        qualified_quantity: 740,
        defective_quantity: 10,
        status: 'in_progress',
        priority: 'high',
        production_line_id: 1,
        planned_start_time: new Date('2024-01-15 08:00:00'),
        planned_end_time: new Date('2024-01-15 18:00:00'),
        actual_start_time: new Date('2024-01-15 08:15:00'),
        created_by: 1
      },
      {
        order_number: 'PO-2024-002',
        product_code: 'PROD-B001',
        product_name: '产品B',
        planned_quantity: 500,
        status: 'pending',
        priority: 'normal',
        production_line_id: 2,
        planned_start_time: new Date('2024-01-16 08:00:00'),
        planned_end_time: new Date('2024-01-16 16:00:00'),
        created_by: 1
      }
    ]);
    console.log('测试生产订单创建完成');
    
    console.log('数据库初始化完成！');
    console.log('默认登录账号:');
    console.log('管理员 - 用户名: admin, 密码: 123456');
    console.log('操作员 - 用户名: operator, 密码: 123456');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();