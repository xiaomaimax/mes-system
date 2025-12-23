import { Card, Row, Col, Button, Typography, Statistic, Progress } from 'antd';
import { 
  LineChartOutlined, 
  ToolOutlined, 
  CheckCircleOutlined, 
  InboxOutlined, 
  BarChartOutlined,
  RightOutlined,
  TrophyOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  // 获取当前用户信息
  const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return {
      role: '超级管理员',
      department: '信息部',
      username: 'admin'
    };
  };

  const currentUser = getCurrentUser();

  // 定义角色权限配置（与Sidebar保持一致）
  const rolePermissions = {
    '超级管理员': {
      allowedMenus: [
        '/dashboard', '/process', '/production', '/equipment', 
        '/quality', '/inventory', '/personnel', '/integration', 
        '/reports', '/settings'
      ]
    },
    '部门管理员': {
      生产部: ['/dashboard', '/production', '/equipment', '/inventory', '/reports'],
      质量部: ['/dashboard', '/quality', '/process', '/reports'],
      技术部: ['/dashboard', '/process', '/equipment', '/integration', '/reports'],
      信息部: ['/dashboard', '/integration', '/settings', '/reports']
    },
    '普通用户': {
      生产部: ['/dashboard', '/production', '/reports'],
      质量部: ['/dashboard', '/quality', '/reports'],
      技术部: ['/dashboard', '/process', '/reports'],
      信息部: ['/dashboard', '/reports']
    },
    '技术管理员': {
      allowedMenus: ['/dashboard', '/process', '/equipment', '/integration', '/reports']
    }
  };

  // 获取用户可访问的菜单
  const getUserAllowedMenus = () => {
    const { role, department } = currentUser;
    
    if (role === '超级管理员') {
      return rolePermissions['超级管理员'].allowedMenus;
    }
    
    if (role === '技术管理员') {
      return rolePermissions['技术管理员'].allowedMenus;
    }
    
    if (role === '部门管理员' && rolePermissions['部门管理员'][department]) {
      return rolePermissions['部门管理员'][department];
    }
    
    if (role === '普通用户' && rolePermissions['普通用户'][department]) {
      return rolePermissions['普通用户'][department];
    }
    
    return ['/dashboard', '/reports'];
  };

  // 管理层关键指标数据
  const kpiData = {
    todayProduction: 2850,
    productionTarget: 3000,
    oee: 89.2,
    qualityRate: 97.8,
    equipmentUtilization: 91.7,
    onTimeDelivery: 98.5
  };

  // 生产趋势数据
  const productionTrendData = [
    { name: '周一', 产量: 2400, 目标: 2500 },
    { name: '周二', 产量: 2210, 目标: 2300 },
    { name: '周三', 产量: 2290, 目标: 2400 },
    { name: '周四', 产量: 2000, 目标: 2200 },
    { name: '周五', 产量: 2181, 目标: 2300 },
    { name: '周六', 产量: 2500, 目标: 2600 },
    { name: '周日', 产量: 2100, 目标: 2400 }
  ];

  // 部门绩效数据
  const departmentData = [
    { name: '生产部', 绩效: 92, fill: '#8884d8' },
    { name: '质量部', 绩效: 88, fill: '#82ca9d' },
    { name: '设备部', 绩效: 95, fill: '#ffc658' },
    { name: '物流部', 绩效: 87, fill: '#ff7300' }
  ];

  const modules = [
    {
      key: 'process',
      title: '工艺管理',
      icon: <NodeIndexOutlined style={{ fontSize: '36px', color: '#13c2c2' }} />,
      description: 'MES系统核心基础模块，工艺路线、参数、文件的全生命周期管理',
      features: [
        '工艺路线设计：标准化工艺流程，确保生产一致性',
        '工艺参数管理：精确控制工艺参数，保证产品质量',
        '工艺文件管理：版本化文档管理，支持变更追溯',
        '作业指导书：标准化操作指导，降低操作风险'
      ],
      benefits: '生产标准化率提升95%，工艺一致性提高30%，新员工培训时间缩短50%',
      path: '/process',
      color: '#e6fffb'
    },
    {
      key: 'production',
      title: '生产管理',
      icon: <LineChartOutlined style={{ fontSize: '36px', color: '#1890ff' }} />,
      description: '全面的生产执行管理系统，实现生产过程数字化、透明化管理',
      features: [
        '车间计划管理：制定和调整生产计划，优化资源配置',
        '生产任务执行：实时跟踪任务进度，确保按时完成',
        '报工数据采集：自动化数据收集，提高数据准确性',
        '排班与人员管理：灵活排班，合理配置人力资源'
      ],
      benefits: '提升生产效率15%，降低生产成本8%，缩短交付周期20%',
      path: '/production',
      color: '#e6f7ff'
    },
    {
      key: 'equipment',
      title: '设备管理',
      icon: <ToolOutlined style={{ fontSize: '36px', color: '#52c41a' }} />,
      description: '基于TPM理念的设备全生命周期管理，提高设备综合效率',
      features: [
        '预防性保养：制定保养计划，延长设备使用寿命',
        '设备点检管理：日常巡检记录，及时发现潜在问题',
        '故障维修管理：快速响应机制，最小化停机时间',
        '设备档案管理：完整的设备履历，支持决策分析'
      ],
      benefits: '设备利用率提升12%，故障率降低25%，维护成本节约18%',
      path: '/equipment',
      color: '#f6ffed'
    },
    {
      key: 'quality',
      title: '质量管理',
      icon: <CheckCircleOutlined style={{ fontSize: '36px', color: '#722ed1' }} />,
      description: '全流程质量控制体系，从供应商到客户的端到端质量保证',
      features: [
        'IQC进料检验：严格把控原材料质量，源头控制',
        'PQC过程检验：生产过程实时监控，及时纠偏',
        'FQC成品检验：出厂前最后把关，确保产品质量',
        'OQC出货检验：客户满意度保障，维护品牌形象'
      ],
      benefits: '产品合格率提升至99.2%，客户投诉减少40%，返工率降低60%',
      path: '/quality',
      color: '#f9f0ff'
    },
    {
      key: 'inventory',
      title: '库存管理',
      icon: <InboxOutlined style={{ fontSize: '36px', color: '#fa8c16' }} />,
      description: '智能化库存管理系统，优化库存结构，降低库存成本',
      features: [
        '智能预警系统：基于历史数据的需求预测和库存预警',
        '出入库管理：标准化流程，提高库存准确性',
        '盘点管理：定期盘点，确保账实一致',
        '库存分析：ABC分析、周转率分析，优化库存结构'
      ],
      benefits: '库存周转率提升30%，库存准确率达99.5%，库存成本降低22%',
      path: '/inventory',
      color: '#fff7e6'
    },
    {
      key: 'personnel',
      title: '人员管理',
      icon: <UserOutlined style={{ fontSize: '36px', color: '#f759ab' }} />,
      description: '全面的人力资源管理系统，员工全生命周期管理和绩效优化',
      features: [
        '员工档案管理：完整的员工信息和组织架构管理',
        '考勤管理：智能考勤统计，出勤率实时监控',
        '培训管理：培训计划制定，技能提升跟踪',
        '绩效管理：科学绩效评估，激励机制优化'
      ],
      benefits: '人员效率提升20%，培训成本降低30%，员工满意度提高25%',
      path: '/personnel',
      color: '#fff0f6'
    },
    {
      key: 'integration',
      title: '系统集成',
      icon: <LinkOutlined style={{ fontSize: '36px', color: '#597ef7' }} />,
      description: 'MES与外部系统的数据互通平台，实现信息流畅通和数据一致性',
      features: [
        '接口管理：统一的API接口管理和生命周期控制',
        '数据映射：灵活的字段映射和数据转换规则',
        '系统配置：外部系统连接参数和认证配置',
        '同步监控：实时监控数据同步状态和异常处理'
      ],
      benefits: '数据同步效率提升40%，系统集成成本降低35%，数据一致性达98%',
      path: '/integration',
      color: '#f0f5ff'
    },
    {
      key: 'reports',
      title: '报表分析',
      icon: <BarChartOutlined style={{ fontSize: '36px', color: '#eb2f96' }} />,
      description: '多维度数据分析平台，为管理决策提供科学依据',
      features: [
        '实时数据看板：关键指标实时监控，支持移动端查看',
        '生产分析报表：产量、效率、OEE等生产指标分析',
        '质量分析报表：合格率、CPK、不良率趋势分析',
        'KPI绩效分析：部门绩效对比，目标达成情况'
      ],
      benefits: '决策效率提升50%，数据准确性达98%，报表生成时间缩短80%',
      path: '/reports',
      color: '#fff0f6'
    },
    {
      key: 'settings',
      title: '系统设置',
      icon: <SettingOutlined style={{ fontSize: '36px', color: '#13c2c2' }} />,
      description: '用户账号、权限管理和系统配置，确保系统安全和高效运行',
      features: [
        '用户管理：用户账号、密码和基本信息管理',
        '权限控制：基于角色和部门的权限访问控制',
        '部门权限：不同部门用户看到不同的功能模块',
        '系统配置：安全策略、审计日志和系统参数'
      ],
      benefits: '安全性提升50%，管理效率提高35%，权限控制精确度达99%',
      path: '/settings',
      color: '#e6fffb'
    }
  ];

  // 根据用户权限过滤模块
  const allowedMenus = getUserAllowedMenus();
  const filteredModules = modules.filter(module => allowedMenus.includes(module.path));

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 欢迎区域 - 极简版 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 24px',
        borderRadius: '6px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <Title level={3} style={{ color: 'white', marginBottom: '6px' }}>
          MES 制造执行系统 - {currentUser.name}
        </Title>
        <Paragraph style={{ fontSize: '14px', color: 'white', marginBottom: 0, opacity: 0.9 }}>
          Manufacturing Execution System - {currentUser.department} {currentUser.role}
        </Paragraph>
      </div>

      {/* 系统特点 - 极简版 */}
      <Row gutter={8} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <div style={{ 
            textAlign: 'center', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>📊</div>
            <Text style={{ fontSize: '11px', color: '#666' }}>实时监控</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ 
            textAlign: 'center', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>🔄</div>
            <Text style={{ fontSize: '11px', color: '#666' }}>流程优化</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ 
            textAlign: 'center', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>✅</div>
            <Text style={{ fontSize: '11px', color: '#666' }}>质量保证</Text>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ 
            textAlign: 'center', 
            padding: '8px', 
            background: 'white', 
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>📈</div>
            <Text style={{ fontSize: '11px', color: '#666' }}>数据分析</Text>
          </div>
        </Col>
      </Row>

      {/* 管理层关键指标看板 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            <span>管理层关键指标看板</span>
            <Button 
              type="link" 
              size="small" 
              onClick={() => navigate('/reports')}
              style={{ marginLeft: 'auto' }}
            >
              查看详细报表 <RightOutlined />
            </Button>
          </div>
        }
        style={{ marginBottom: '16px' }}
        size="small"
      >
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
              <Statistic
                title="今日产量"
                value={kpiData.todayProduction}
                suffix={`/ ${kpiData.productionTarget}`}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
              />
              <Progress 
                percent={Math.round((kpiData.todayProduction / kpiData.productionTarget) * 100)} 
                size="small" 
                status="active"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff' }}>
              <Statistic
                title="整体OEE"
                value={kpiData.oee}
                suffix="%"
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
              />
              <Progress 
                percent={kpiData.oee} 
                size="small" 
                strokeColor="#1890ff"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f9f0ff' }}>
              <Statistic
                title="质量合格率"
                value={kpiData.qualityRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              />
              <Progress 
                percent={kpiData.qualityRate} 
                size="small" 
                strokeColor="#722ed1"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
              <Statistic
                title="交付及时率"
                value={kpiData.onTimeDelivery}
                suffix="%"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
              />
              <Progress 
                percent={kpiData.onTimeDelivery} 
                size="small" 
                strokeColor="#fa8c16"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="本周生产趋势" size="small">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={productionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="产量" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="目标" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="部门绩效对比" size="small">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="绩效" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Card>



      {/* 功能模块卡片 - 动态布局 */}
      <Row gutter={[12, 12]}>
        {filteredModules.map((module) => (
          <Col 
            span={filteredModules.length <= 3 ? 8 : filteredModules.length <= 6 ? 8 : 8} 
            key={module.key}
          >
            <Card 
              hoverable
              size="small"
              style={{ 
                height: '100%',
                background: module.color,
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ marginRight: '12px', marginTop: '4px' }}>
                  {module.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ marginBottom: '4px' }}>
                    {module.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    {module.description}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '13px' }}>核心功能：</Text>
                <div style={{ marginTop: '6px' }}>
                  {module.features.map((feature, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <Text style={{ fontSize: '12px', color: '#666' }}>• {feature}</Text>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.6)', borderRadius: '4px' }}>
                <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>预期效益：</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '11px', color: '#666' }}>{module.benefits}</Text>
                </div>
              </div>
              
              <Button 
                type="primary" 
                size="small"
                icon={<RightOutlined />}
                onClick={() => navigate(module.path)}
                style={{ width: '100%' }}
              >
                进入{module.title}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 底部信息 - 极简版 */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'white', 
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          MES制造执行系统 v1.0 | 技术支持：系统管理员 | 联系邮箱：support@mes-system.com
        </Text>
      </div>
    </div>
  );
};

export default HomePage;