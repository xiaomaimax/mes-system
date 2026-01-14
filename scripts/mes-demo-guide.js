#!/usr/bin/env node

/**
 * MES系统五金注塑演示指南
 * 提供交互式的系统功能演示和学习路径
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏭 欢迎使用MES系统五金注塑演示指南！\n');

const demoScenarios = {
  '1': {
    title: '五金制造全流程演示',
    description: '不锈钢门把手从订单到交付的完整流程',
    steps: [
      '1. 查看产品主数据 (HW-001 不锈钢门把手)',
      '2. 了解工艺路线 (下料→冲压→精加工→表面处理→检验)',
      '3. 检查设备状态 (200T冲床、CNC加工中心)',
      '4. 查看原材料库存 (304不锈钢板)',
      '5. 分析生产计划执行情况',
      '6. 查看质量检验记录 (IQC→IPQC→FQC)',
      '7. 统计生产报工数据',
      '8. 分析生产效率报表'
    ],
    navigation: [
      '生产管理 → 生产主数据管理 → 搜索"HW-001"',
      '工艺管理 → 工艺路线 → 查看"RT-HW001"',
      '设备管理 → 设备主数据 → 筛选"五金车间"',
      '库存管理 → 库存主数据 → 搜索"304不锈钢"',
      '生产管理 → 车间计划管理 → 查看"PLAN-2024122501"',
      '质量管理 → IQC检验/IPQC检验/FQC检验',
      '生产管理 → 工作报告管理 → 查看"WR-2024122501"',
      '报表分析 → 生产效率报表'
    ]
  },
  '2': {
    title: '注塑制造全流程演示',
    description: '汽车仪表盘外壳的注塑制造过程',
    steps: [
      '1. 查看产品主数据 (INJ-001 汽车仪表盘外壳)',
      '2. 了解注塑工艺路线 (原料准备→注塑成型→去毛刺→UV涂装→检验)',
      '3. 检查注塑设备状态 (350T注塑机、UV涂装线)',
      '4. 查看塑料原料库存 (ABS+PC合金粒子)',
      '5. 分析生产计划安排',
      '6. 查看注塑质量控制',
      '7. 统计注塑生产数据',
      '8. 分析设备OEE指标'
    ],
    navigation: [
      '生产管理 → 生产主数据管理 → 搜索"INJ-001"',
      '工艺管理 → 工艺路线 → 查看"RT-INJ001"',
      '设备管理 → 设备主数据 → 筛选"注塑车间"',
      '库存管理 → 库存主数据 → 搜索"ABS+PC"',
      '生产管理 → 车间计划管理 → 查看"PLAN-2024122502"',
      '质量管理 → 各检验模块',
      '生产管理 → 工作报告管理 → 查看注塑报工',
      '报表分析 → 设备OEE报表'
    ]
  },
  '3': {
    title: '质量管理体系演示',
    description: '三级质量检验体系的完整应用',
    steps: [
      '1. IQC来料检验 (304不锈钢板化学成分检验)',
      '2. IPQC过程检验 (冲压工序尺寸检验)',
      '3. FQC成品检验 (最终产品功能检验)',
      '4. 不良品分析统计',
      '5. 质量追溯查询',
      '6. 供应商质量评价',
      '7. 质量改进措施',
      '8. 质量报表分析'
    ],
    navigation: [
      '质量管理 → IQC检验 → 查看"IQC-2024122501"',
      '质量管理 → IPQC检验 → 查看"IPQC-2024122501"',
      '质量管理 → FQC检验 → 查看"FQC-2024122501"',
      '质量管理 → 次品原因 → 统计分析',
      '质量管理 → 批次追溯',
      '质量管理 → 检验标准',
      '质量管理 → 质量改进',
      '报表分析 → 质量统计报表'
    ]
  },
  '4': {
    title: '设备管理演示',
    description: '设备全生命周期管理',
    steps: [
      '1. 设备档案管理 (技术参数、维护记录)',
      '2. 预防性维护计划',
      '3. 设备故障处理',
      '4. 备件库存管理',
      '5. 设备效率分析 (OEE)',
      '6. 维护成本统计',
      '7. 设备改进建议',
      '8. 设备状态监控'
    ],
    navigation: [
      '设备管理 → 设备主数据',
      '设备管理 → 设备维护 → 维护计划',
      '设备管理 → 设备维修',
      '库存管理 → 备件管理',
      '报表分析 → 设备OEE报表',
      '设备管理 → 维护成本',
      '设备管理 → 设备优化',
      '设备管理 → 实时监控'
    ]
  },
  '5': {
    title: '库存管理演示',
    description: '原材料和成品库存的全面管理',
    steps: [
      '1. 原材料入库管理',
      '2. 生产领料流程',
      '3. 安全库存预警',
      '4. 库存周转分析',
      '5. 呆滞料处理',
      '6. 供应商管理',
      '7. 成本分析',
      '8. 库存优化建议'
    ],
    navigation: [
      '库存管理 → 库存出入库 → 入库记录',
      '库存管理 → 库存出入库 → 出库记录',
      '库存管理 → 库存主数据 → 安全库存',
      '报表分析 → 库存周转报表',
      '库存管理 → 呆滞料管理',
      '库存管理 → 供应商评价',
      '库存管理 → 成本分析',
      '库存管理 → 优化建议'
    ]
  }
};

function showMainMenu() {
  console.log('📋 请选择演示场景:\n');
  Object.keys(demoScenarios).forEach(key => {
    const scenario = demoScenarios[key];
    console.log(`${key}. ${scenario.title}`);
    console.log(`   ${scenario.description}\n`);
  });
  console.log('0. 退出演示\n');
}

function showScenarioDetails(scenarioKey) {
  const scenario = demoScenarios[scenarioKey];
  if (!scenario) {
    console.log('❌ 无效的选择，请重新选择。\n');
    return;
  }

  console.log(`\n🎯 ${scenario.title}`);
  console.log(`📝 ${scenario.description}\n`);
  
  console.log('📋 演示步骤:');
  scenario.steps.forEach((step, index) => {
    console.log(`   ${step}`);
  });
  
  console.log('\n🧭 系统导航路径:');
  scenario.navigation.forEach((nav, index) => {
    console.log(`   ${index + 1}. ${nav}`);
  });
  
  console.log('\n💡 操作提示:');
  console.log('   • 请先确保系统正在运行 (http://localhost:3000)');
  console.log('   • 使用 admin/admin123 登录系统');
  console.log('   • 按照导航路径逐步操作');
  console.log('   • 注意观察数据间的关联关系');
  console.log('   • 可以尝试修改和删除操作(模拟数据)');
  
  if (scenarioKey === '1') {
    console.log('\n🔍 五金制造关键观察点:');
    console.log('   • 工艺参数: 冲压压力180T, 切削速度3000rpm');
    console.log('   • 质量控制: 尺寸公差±0.1mm, 表面粗糙度Ra≤1.6');
    console.log('   • 生产效率: 标准工时35分钟, 实际效率95%');
    console.log('   • 设备状态: 200T冲床维护周期15天');
  } else if (scenarioKey === '2') {
    console.log('\n🔍 注塑制造关键观察点:');
    console.log('   • 工艺参数: 注射压力120MPa, 模具温度60°C');
    console.log('   • 质量控制: 涂层厚度15-20μm, 阻燃等级V0');
    console.log('   • 生产效率: 周期时间210秒, 设备OEE 91%');
    console.log('   • 原料管理: 干燥4小时, 水分<0.02%');
  }
  
  console.log('\n');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🎓 MES系统学习目标:');
  console.log('   • 理解制造执行系统的核心功能');
  console.log('   • 掌握五金和注塑制造的业务流程');
  console.log('   • 学会使用MES系统进行生产管理');
  console.log('   • 培养数据分析和问题解决能力\n');
  
  while (true) {
    showMainMenu();
    
    const choice = await askQuestion('请输入您的选择 (0-5): ');
    
    if (choice === '0') {
      console.log('\n👋 感谢使用MES系统演示指南！');
      console.log('📚 更多学习资源请查看: docs/MES_LEARNING_GUIDE.md');
      console.log('🔗 系统访问地址: http://localhost:3000');
      break;
    }
    
    if (demoScenarios[choice]) {
      showScenarioDetails(choice);
      
      const continueChoice = await askQuestion('按回车键继续，输入 "menu" 返回主菜单: ');
      if (continueChoice.toLowerCase() === 'menu') {
        console.log('\n');
        continue;
      }
    } else {
      console.log('❌ 无效的选择，请输入 0-5 之间的数字。\n');
    }
  }
  
  rl.close();
}

// 显示系统状态检查
console.log('🔧 系统状态检查:');
console.log('   • 前端服务: http://localhost:3000 (请确保正在运行)');
console.log('   • 后端服务: http://localhost:5002 (请确保正在运行)');
console.log('   • 数据状态: 五金注塑数据已导入');
console.log('   • 登录信息: admin / admin123\n');

main().catch(console.error);