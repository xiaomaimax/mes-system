const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/scheduling';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`)
};

async function initComprehensiveData() {
  try {
    log.info('开始初始化综合排程演示数据...');
    log.info('目标: 模拟10种排程核心逻辑规则');

    // 1. 创建物料
    log.info('\n[1/5] 创建物料数据...');
    const materials = await createMaterials();

    // 2. 创建设备
    log.info('\n[2/5] 创建设备数据...');
    const devices = await createDevices();

    // 3. 创建模具
    log.info('\n[3/5] 创建模具数据...');
    const molds = await createMolds();

    // 4. 创建关系配置
    log.info('\n[4/5] 创建物料-设备和物料-模具关系...');
    await createRelations(materials, devices, molds);

    // 5. 创建计划单
    log.info('\n[5/5] 创建计划单数据...');
    await createPlans(materials);

    log.success('\n✨ 综合排程演示数据初始化完成！');
    log.info('\n📊 数据统计:');
    log.info(`  - 物料: ${materials.length}个`);
    log.info(`  - 设备: ${devices.length}个`);
    log.info(`  - 模具: ${molds.length}个`);
    log.info(`  - 计划单: 已创建`);
    log.info('\n🎯 现在可以执行排程来查看10种规则的演示结果');
    log.info('📍 访问: http://localhost:3000 → 辅助排程 → 执行自动排产');

    process.exit(0);
  } catch (error) {
    log.error(`初始化失败: ${error.message}`);
    process.exit(1);
  }
}

async function createMaterials() {
  const materials = [
    // 基础物料
    { code: 'MAT-001', name: '手机壳A', type: 'finished_product', spec: '黑色' },
    { code: 'MAT-002', name: '手机壳B', type: 'finished_product', spec: '白色' },
    { code: 'MAT-003', name: '充电器', type: 'finished_product', spec: '5V2A' },
    { code: 'MAT-004', name: '电池盖板', type: 'finished_product', spec: '标准' },
    { code: 'MAT-005', name: '屏幕保护膜', type: 'finished_product', spec: '钢化膜' },
    
    // 用于演示同模多物料的物料
    { code: 'MAT-006', name: '手机壳C', type: 'finished_product', spec: '红色' },
    { code: 'MAT-007', name: '手机壳D', type: 'finished_product', spec: '蓝色' },
    
    // 用于演示权重优先的物料
    { code: 'MAT-008', name: '高端手机壳', type: 'finished_product', spec: '高端' },
    { code: 'MAT-009', name: '标准手机壳', type: 'finished_product', spec: '标准' },
    
    // 用于演示一致性的物料
    { code: 'MAT-010', name: '手机壳E', type: 'finished_product', spec: '绿色' },
    { code: 'MAT-011', name: '手机壳F', type: 'finished_product', spec: '黄色' }
  ];

  const createdMaterials = [];
  for (const mat of materials) {
    try {
      const response = await axios.post(`${API_BASE_URL}/materials`, {
        material_code: mat.code,
        material_name: mat.name,
        material_type: mat.type,
        specifications: mat.spec,
        status: 'active'
      });
      if (response.data.success) {
        createdMaterials.push(response.data.data);
        log.success(`创建物料: ${mat.name} (${mat.code})`);
      }
    } catch (error) {
      log.warn(`物料 ${mat.code} 可能已存在`);
    }
  }

  return createdMaterials;
}

async function createDevices() {
  const devices = [
    // 基础设备
    { code: 'DEV-001', name: '注塑机1号', spec: '100T', capacity: 100, weight: 90 },
    { code: 'DEV-002', name: '注塑机2号', spec: '150T', capacity: 150, weight: 95 },
    { code: 'DEV-003', name: '注塑机3号', spec: '80T', capacity: 80, weight: 70 },
    { code: 'DEV-004', name: '注塑机4号', spec: '120T', capacity: 120, weight: 85 },
    
    // 用于演示权重优先的设备
    { code: 'DEV-005', name: '高速注塑机', spec: '200T', capacity: 200, weight: 100 },
    { code: 'DEV-006', name: '标准注塑机', spec: '100T', capacity: 100, weight: 50 }
  ];

  const createdDevices = [];
  for (const dev of devices) {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices`, {
        device_code: dev.code,
        device_name: dev.name,
        specifications: dev.spec,
        capacity_per_hour: dev.capacity,
        status: 'normal'
      });
      if (response.data.success) {
        createdDevices.push(response.data.data);
        log.success(`创建设备: ${dev.name} (${dev.code})`);
      }
    } catch (error) {
      log.warn(`设备 ${dev.code} 可能已存在`);
    }
  }

  return createdDevices;
}

async function createMolds() {
  const molds = [
    // 基础模具
    { code: 'MOLD-001', name: '模具A', spec: '手机壳专用', quantity: 2, weight: 90 },
    { code: 'MOLD-002', name: '模具B', spec: '充电器专用', quantity: 1, weight: 85 },
    { code: 'MOLD-003', name: '模具C', spec: '电池盖板专用', quantity: 3, weight: 80 },
    { code: 'MOLD-004', name: '模具D', spec: '屏幕膜专用', quantity: 2, weight: 75 },
    
    // 用于演示同模多物料的模具
    { code: 'MOLD-005', name: '通用手机壳模具', spec: '可生产多种壳', quantity: 2, weight: 88 },
    
    // 用于演示权重优先的模具
    { code: 'MOLD-006', name: '高精度模具', spec: '高精度', quantity: 1, weight: 100 },
    { code: 'MOLD-007', name: '标准模具', spec: '标准', quantity: 2, weight: 50 },
    
    // 用于演示绑定的单副模具
    { code: 'MOLD-008', name: '单副绑定模具', spec: '单副', quantity: 1, weight: 92 }
  ];

  const createdMolds = [];
  for (const mold of molds) {
    try {
      const response = await axios.post(`${API_BASE_URL}/molds`, {
        mold_code: mold.code,
        mold_name: mold.name,
        specifications: mold.spec,
        quantity: mold.quantity,
        status: 'normal'
      });
      if (response.data.success) {
        createdMolds.push(response.data.data);
        log.success(`创建模具: ${mold.name} (${mold.code}) - 数量: ${mold.quantity}`);
      }
    } catch (error) {
      log.warn(`模具 ${mold.code} 可能已存在`);
    }
  }

  return createdMolds;
}

async function createRelations(materials, devices, molds) {
  // 物料-设备关系配置
  const deviceRelations = [
    // MAT-001 (手机壳A) - 演示设备权重优先
    { matCode: 'MAT-001', devCode: 'DEV-001', weight: 70 },
    { matCode: 'MAT-001', devCode: 'DEV-002', weight: 95 }, // 权重最高
    { matCode: 'MAT-001', devCode: 'DEV-003', weight: 60 },

    // MAT-002 (手机壳B)
    { matCode: 'MAT-002', devCode: 'DEV-001', weight: 80 },
    { matCode: 'MAT-002', devCode: 'DEV-002', weight: 85 },

    // MAT-003 (充电器)
    { matCode: 'MAT-003', devCode: 'DEV-003', weight: 90 },
    { matCode: 'MAT-003', devCode: 'DEV-004', weight: 75 },

    // MAT-004 (电池盖板)
    { matCode: 'MAT-004', devCode: 'DEV-002', weight: 88 },
    { matCode: 'MAT-004', devCode: 'DEV-004', weight: 80 },

    // MAT-005 (屏幕膜)
    { matCode: 'MAT-005', devCode: 'DEV-001', weight: 85 },

    // MAT-006 (手机壳C) - 用于同模多物料
    { matCode: 'MAT-006', devCode: 'DEV-001', weight: 80 },
    { matCode: 'MAT-006', devCode: 'DEV-002', weight: 90 },

    // MAT-007 (手机壳D) - 用于同模多物料
    { matCode: 'MAT-007', devCode: 'DEV-001', weight: 75 },
    { matCode: 'MAT-007', devCode: 'DEV-002', weight: 92 },

    // MAT-008 (高端手机壳) - 演示权重优先
    { matCode: 'MAT-008', devCode: 'DEV-005', weight: 100 }, // 权重最高
    { matCode: 'MAT-008', devCode: 'DEV-002', weight: 80 },

    // MAT-009 (标准手机壳) - 演示权重优先
    { matCode: 'MAT-009', devCode: 'DEV-006', weight: 50 },
    { matCode: 'MAT-009', devCode: 'DEV-001', weight: 70 },

    // MAT-010 (手机壳E) - 用于一致性演示
    { matCode: 'MAT-010', devCode: 'DEV-001', weight: 85 },
    { matCode: 'MAT-010', devCode: 'DEV-002', weight: 88 },

    // MAT-011 (手机壳F) - 用于一致性演示
    { matCode: 'MAT-011', devCode: 'DEV-001', weight: 82 },
    { matCode: 'MAT-011', devCode: 'DEV-002', weight: 90 }
  ];

  // 物料-模具关系配置
  const moldRelations = [
    // MAT-001 - 演示模具权重优先
    { matCode: 'MAT-001', moldCode: 'MOLD-001', weight: 85 },
    { matCode: 'MAT-001', moldCode: 'MOLD-005', weight: 95 }, // 权重最高

    // MAT-002
    { matCode: 'MAT-002', moldCode: 'MOLD-001', weight: 90 },
    { matCode: 'MAT-002', moldCode: 'MOLD-005', weight: 88 },

    // MAT-003
    { matCode: 'MAT-003', moldCode: 'MOLD-002', weight: 95 },

    // MAT-004
    { matCode: 'MAT-004', moldCode: 'MOLD-003', weight: 92 },

    // MAT-005
    { matCode: 'MAT-005', moldCode: 'MOLD-004', weight: 90 },

    // MAT-006 - 同模多物料
    { matCode: 'MAT-006', moldCode: 'MOLD-005', weight: 92 },

    // MAT-007 - 同模多物料
    { matCode: 'MAT-007', moldCode: 'MOLD-005', weight: 90 },

    // MAT-008 - 权重优先
    { matCode: 'MAT-008', moldCode: 'MOLD-006', weight: 100 }, // 权重最高
    { matCode: 'MAT-008', moldCode: 'MOLD-001', weight: 70 },

    // MAT-009 - 权重优先
    { matCode: 'MAT-009', moldCode: 'MOLD-007', weight: 50 },
    { matCode: 'MAT-009', moldCode: 'MOLD-001', weight: 75 },

    // MAT-010 - 一致性演示
    { matCode: 'MAT-010', moldCode: 'MOLD-001', weight: 88 },
    { matCode: 'MAT-010', moldCode: 'MOLD-005', weight: 85 },

    // MAT-011 - 一致性演示
    { matCode: 'MAT-011', moldCode: 'MOLD-001', weight: 90 },
    { matCode: 'MAT-011', moldCode: 'MOLD-005', weight: 87 },

    // 用于演示单副模具绑定
    { matCode: 'MAT-002', moldCode: 'MOLD-008', weight: 98 }
  ];

  // 创建设备关系
  for (const rel of deviceRelations) {
    try {
      const mat = materials.find(m => m.material_code === rel.matCode);
      const dev = devices.find(d => d.device_code === rel.devCode);
      if (mat && dev) {
        await axios.post(`${API_BASE_URL}/material-device-relations`, {
          material_id: mat.id,
          device_id: dev.id,
          weight: rel.weight
        });
        log.success(`关系: ${rel.matCode} → ${rel.devCode} (权重: ${rel.weight})`);
      }
    } catch (error) {
      log.warn(`关系 ${rel.matCode}-${rel.devCode} 可能已存在`);
    }
  }

  // 创建模具关系
  for (const rel of moldRelations) {
    try {
      const mat = materials.find(m => m.material_code === rel.matCode);
      const mold = molds.find(m => m.mold_code === rel.moldCode);
      if (mat && mold) {
        await axios.post(`${API_BASE_URL}/material-mold-relations`, {
          material_id: mat.id,
          mold_id: mold.id,
          weight: rel.weight
        });
        log.success(`关系: ${rel.matCode} → ${rel.moldCode} (权重: ${rel.weight})`);
      }
    } catch (error) {
      log.warn(`关系 ${rel.matCode}-${rel.moldCode} 可能已存在`);
    }
  }
}

async function createPlans(materials) {
  const now = new Date();
  
  const plans = [
    // 1️⃣ 交期优先 - 紧急订单
    {
      number: 'PL-URGENT-001',
      matCode: 'MAT-001',
      quantity: 5000,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2天后
      desc: '紧急订单 - 演示交期优先'
    },

    // 2️⃣ 设备权重优先
    {
      number: 'PL-DEV-WEIGHT-001',
      matCode: 'MAT-001',
      quantity: 3000,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      desc: '演示设备权重优先'
    },

    // 3️⃣ 模具权重优先
    {
      number: 'PL-MOLD-WEIGHT-001',
      matCode: 'MAT-008',
      quantity: 2000,
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      desc: '演示模具权重优先'
    },

    // 4️⃣ 模具-设备独占性
    {
      number: 'PL-EXCLUSIVE-001',
      matCode: 'MAT-003',
      quantity: 4000,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      desc: '演示模具-设备独占性'
    },

    // 5️⃣ 模具-设备绑定
    {
      number: 'PL-BIND-001',
      matCode: 'MAT-002',
      quantity: 2500,
      dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      desc: '演示模具-设备绑定 (第一个计划单)'
    },

    {
      number: 'PL-BIND-002',
      matCode: 'MAT-002',
      quantity: 1500,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      desc: '演示模具-设备绑定 (第二个计划单)'
    },

    // 6️⃣ 同物料一致性
    {
      number: 'PL-MAT-CONSIST-001',
      matCode: 'MAT-010',
      quantity: 3500,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      desc: '演示同物料一致性 (第一个)'
    },

    {
      number: 'PL-MAT-CONSIST-002',
      matCode: 'MAT-010',
      quantity: 2000,
      dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      desc: '演示同物料一致性 (第二个)'
    },

    // 7️⃣ 同模具一致性
    {
      number: 'PL-MOLD-CONSIST-001',
      matCode: 'MAT-001',
      quantity: 4000,
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      desc: '演示同模具一致性 (第一个)'
    },

    {
      number: 'PL-MOLD-CONSIST-002',
      matCode: 'MAT-002',
      quantity: 3000,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      desc: '演示同模具一致性 (第二个)'
    },

    // 8️⃣ 计划单唯一性
    {
      number: 'PL-UNIQUE-001',
      matCode: 'MAT-004',
      quantity: 2500,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      desc: '演示计划单唯一性'
    },

    // 9️⃣ 同模多物料同步
    {
      number: 'PL-MULTI-MAT-001',
      matCode: 'MAT-006',
      quantity: 3000,
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      desc: '演示同模多物料同步 (物料C)'
    },

    {
      number: 'PL-MULTI-MAT-002',
      matCode: 'MAT-007',
      quantity: 2500,
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      desc: '演示同模多物料同步 (物料D)'
    },

    // 🔟 多模具灵活排程
    {
      number: 'PL-FLEXIBLE-001',
      matCode: 'MAT-009',
      quantity: 1500,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      desc: '演示多模具灵活排程'
    }
  ];

  for (const plan of plans) {
    try {
      const mat = materials.find(m => m.material_code === plan.matCode);
      if (mat) {
        const response = await axios.post(`${API_BASE_URL}/plans`, {
          plan_number: plan.number,
          material_id: mat.id,
          planned_quantity: plan.quantity,
          due_date: plan.dueDate,
          status: 'unscheduled'
        });
        if (response.data.success) {
          log.success(`创建计划单: ${plan.number} - ${plan.desc}`);
        }
      }
    } catch (error) {
      log.warn(`计划单 ${plan.number} 可能已存在`);
    }
  }
}

// 运行初始化
initComprehensiveData();
