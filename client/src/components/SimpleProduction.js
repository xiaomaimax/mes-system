import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Tabs, Progress, Badge, List, Avatar, Divider, Alert, Table, Tag } from 'antd';
import { LineChartOutlined, ProjectOutlined, PlayCircleOutlined, FileTextOutlined, CalendarOutlined, SettingOutlined, ClockCircleOutlined, ShoppingCartOutlined, DatabaseOutlined, TrophyOutlined, TeamOutlined, AlertOutlined, CheckCircleOutlined, ExclamationCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { DataService, DataFormatter, DataCalculator } from '../utils/dataUtils';

// 逐步添加组件来找出问题
import ProductionMasterDataManagement from './production/ProductionMasterDataManagement';
import WorkshopPlanManagement from './production/WorkshopPlanManagement';
import ProductionTaskManagement from './production/ProductionTaskManagement';
import ProductionExecutionManagement from './production/ProductionExecutionManagement';
import WorkReportManagement from './production/WorkReportManagement';
import DailyReportSimple from './production/DailyReportSimple';
import EquipmentResponsibilityManagement from './production/EquipmentResponsibilityManagement';
import ShiftScheduleManagement from './production/ShiftScheduleManagement';
import LineMaterialsManagement from './production/LineMaterialsManagement';

const SimpleProductionFixed = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [productionData, setProductionData] = useState({
    plans: [],
    tasks: [],
    reports: [],
    equipment: [],
    employees: []
  });

  // 加载生产数据
  useEffect(() => {
    const loadData = () => {
      setProductionData({
        plans: DataService.getProductionPlans(),
        tasks: DataService.getProductionTasks(),
        reports: DataService.getWorkReports(),
        equipment: DataService.getEquipment(),
        employees: DataService.getEmployees()
      });
    };
    
    loadData();
  }, []);

  // 计算生产统计数据
  const calculateStats = () => {
    const { plans, tasks, reports } = productionData;
    
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.status === '已完成').length;
    const runningPlans = plans.filter(p => p.status === '进行中').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === '已完成').length;
    
    const totalPlanQty = plans.reduce((sum, p) => sum + p.planQty, 0);
    const totalActualQty = plans.reduce((sum, p) => sum + p.actualQty, 0);
    const overallEfficiency = totalPlanQty > 0 ? DataCalculator.calculateEfficiency(totalActualQty, totalPlanQty) : 0;
    
    return {
      totalPlans,
      completedPlans,
      runningPlans,
      totalTasks,
      completedTasks,
      totalPlanQty,
      totalActualQty,
      overallEfficiency
    };
  };

  const stats = calculateStats();

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <LineChartOutlined />
    },
    {
      key: 'master-data',
      label: '主数据',
      icon: <DatabaseOutlined />
    },
    {
      key: 'workshop-plan',
      label: '车间计划',
      icon: <CalendarOutlined />
    },
    {
      key: 'production-tasks',
      label: '生产任务',
      icon: <ProjectOutlined />
    },
    {
      key: 'production-execution',
      label: '生产执行',
      icon: <PlayCircleOutlined />
    },
    {
      key: 'work-report',
      label: '报工记录',
      icon: <FileTextOutlined />
    },
    {
      key: 'daily-report',
      label: '生产日报',
      icon: <CalendarOutlined />
    },
    {
      key: 'shift-schedule',
      label: '排班记录',
      icon: <ClockCircleOutlined />
    },
    {
      key: 'equipment-responsibility',
      label: '责任设备',
      icon: <SettingOutlined />
    },
    {
      key: 'line-materials',
      label: '线边物料',
      icon: <ShoppingCartOutlined />
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'master-data':
        return <ProductionMasterDataManagement />;
      case 'workshop-plan':
        return <WorkshopPlanManagement />;
      case 'production-tasks':
        return <ProductionTaskManagement />;
      case 'production-execution':
        return <ProductionExecutionManagement />;
      case 'work-report':
        return <WorkReportManagement />;
      case 'daily-report':
        return <DailyReportSimple />;
      case 'shift-schedule':
        return <ShiftScheduleManagement />;
      case 'equipment-responsibility':
        return <EquipmentResponsibilityManagement />;
      case 'line-materials':
        return <LineMaterialsManagement />;
      case 'overview':
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div>
      {/* 页面标题和快速操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>生产管理概览</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            实时监控生产状态，管理生产全流程
          </p>
        </div>
        <Space size="large">
          <Button type="primary" size="large" onClick={() => setActiveTab('production-tasks')}>
            新建生产任务
          </Button>
          <Button size="large" onClick={() => setActiveTab('master-data')}>
            主数据管理
          </Button>
        </Space>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="生产提醒"
        description={`当前有 ${stats.runningPlans} 个生产计划正在进行中，${productionData.tasks.filter(t => t.status === '等待中').length} 个任务等待执行！`}
        type="info"
        showIcon
        icon={<ExclamationCircleOutlined />}
        action={
          <Button size="small" type="link" onClick={() => setActiveTab('production-tasks')}>
            查看详情
          </Button>
        }
        style={{ marginBottom: '24px' }}
        closable
      />
      
      {/* 核心统计指标 - 使用真实数据 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日产量"
              value={stats.totalActualQty}
              suffix="件"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <RiseOutlined style={{ color: '#3f8600' }} /> 计划完成率 {DataFormatter.formatPercent(stats.overallEfficiency, 1)}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={productionData.tasks.filter(t => t.status === '进行中').length}
              suffix="个"
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress 
                percent={Math.round((stats.completedTasks / stats.totalTasks) * 100)} 
                size="small" 
                showInfo={false} 
              />
              <span style={{ fontSize: '12px', color: '#666' }}>
                总体进度 {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
              </span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="设备利用率"
              value={DataCalculator.calculateAverage(productionData.equipment.map(e => e.utilization))}
              precision={1}
              suffix="%"
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge 
                status="success" 
                text={`${productionData.equipment.filter(e => e.status === '运行中').length}台运行中`} 
              />
              <Badge 
                status="warning" 
                text={`${productionData.equipment.filter(e => e.status === '维护中').length}台维护中`} 
                style={{ marginLeft: '8px' }} 
              />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线员工"
              value={productionData.employees.filter(e => e.shift === '白班').length}
              suffix="人"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              白班: {productionData.employees.filter(e => e.shift === '白班').length}人 | 
              夜班: {productionData.employees.filter(e => e.shift === '夜班').length}人
            </div>
          </Card>
        </Col>
      </Row>

      {/* 生产计划列表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="今日生产计划" extra={<Button type="link">查看全部</Button>}>
            <Table
              dataSource={productionData.plans}
              columns={[
                {
                  title: '计划编号',
                  dataIndex: 'id',
                  key: 'id'
                },
                {
                  title: '产品名称',
                  dataIndex: 'productName',
                  key: 'productName'
                },
                {
                  title: '生产线',
                  dataIndex: 'lineName',
                  key: 'lineName'
                },
                {
                  title: '计划数量',
                  dataIndex: 'planQty',
                  key: 'planQty',
                  render: (qty) => `${qty} 件`
                },
                {
                  title: '实际数量',
                  dataIndex: 'actualQty',
                  key: 'actualQty',
                  render: (qty) => `${qty} 件`
                },
                {
                  title: '进度',
                  dataIndex: 'progress',
                  key: 'progress',
                  render: (progress) => (
                    <Progress percent={progress} size="small" />
                  )
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusConfig = DataFormatter.formatStatus(status);
                    return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
                  }
                }
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="设备状态" extra={<Button type="link">设备管理</Button>}>
            <List
              dataSource={productionData.equipment.slice(0, 5)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<SettingOutlined />} />}
                    title={item.name}
                    description={
                      <div>
                        <div>类型: {item.type}</div>
                        <div>
                          <Tag color={DataFormatter.formatStatus(item.status).color}>
                            {item.status}
                          </Tag>
                          <span style={{ marginLeft: '8px' }}>
                            利用率: {item.utilization}%
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 生产状态和快速入口 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="实时生产状态" extra={<Button type="link" onClick={() => setActiveTab('production-execution')}>查看详情</Button>}>
            <List
              size="small"
              dataSource={[
                { line: '生产线A', product: '塑料杯A型', status: 'running', progress: 85, target: 500, current: 425 },
                { line: '生产线B', product: '包装盒B型', status: 'running', progress: 92, target: 300, current: 276 },
                { line: '生产线C', product: '组装件C型', status: 'maintenance', progress: 0, target: 200, current: 0 },
                { line: '生产线D', product: '塑料杯D型', status: 'running', progress: 68, target: 400, current: 272 }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.status === 'running' ? <PlayCircleOutlined /> : <AlertOutlined />}
                        style={{ 
                          backgroundColor: item.status === 'running' ? '#52c41a' : '#faad14' 
                        }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.line}</span>
                        <Badge 
                          status={item.status === 'running' ? 'processing' : 'warning'} 
                          text={item.status === 'running' ? '运行中' : '维护中'} 
                        />
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>{item.product}</div>
                        {item.status === 'running' && (
                          <div>
                            <Progress 
                              percent={item.progress} 
                              size="small" 
                              format={() => `${item.current}/${item.target}`}
                            />
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 今日任务概览 */}
        <Col span={12}>
          <Card title="今日任务概览" extra={<Button type="link" onClick={() => setActiveTab('production-tasks')}>查看详情</Button>}>
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  title="已完成"
                  value={8}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  title="进行中"
                  value={15}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<PlayCircleOutlined />}
                />
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  title="待开始"
                  value={5}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={Math.round((8 / (8 + 15 + 5)) * 100)} 
                format={percent => `${percent}%\n完成率`}
                size={80}
              />
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        {/* 核心功能 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>
            <DatabaseOutlined /> 核心管理
          </h4>
          <Row gutter={16}>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('master-data')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<DatabaseOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title="生产主数据"
                  description="产品、工艺、工作中心、BOM管理"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('workshop-plan')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title="车间计划"
                  description="生产计划制定和资源安排"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('production-execution')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<PlayCircleOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                  title="生产执行"
                  description="实时生产监控和数据采集"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* 辅助功能 */}
        <div>
          <h4 style={{ color: '#faad14', marginBottom: '12px' }}>
            <SettingOutlined /> 辅助功能
          </h4>
          <Row gutter={16}>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('work-report')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                  title="报工记录"
                  description="工时统计"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('daily-report')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<TrophyOutlined />} size="small" />}
                  title="生产日报"
                  description="日报统计"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('shift-schedule')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<ClockCircleOutlined />} size="small" />}
                  title="排班记录"
                  description="班次管理"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('line-materials')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<ShoppingCartOutlined />} size="small" />}
                  title="线边物料"
                  description="物料管理"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <style>
        {`
          .compact-tabs .ant-tabs-nav {
            margin-bottom: 8px;
          }
          .compact-tabs .ant-tabs-tab {
            padding: 8px 12px !important;
            margin: 0 2px !important;
            font-size: 13px !important;
            min-width: auto !important;
          }
          .compact-tabs .ant-tabs-tab-btn {
            font-size: 14px !important;
            white-space: nowrap;
          }
          .compact-tabs .ant-tabs-tab .anticon {
            font-size: 14px !important;
            margin-right: 4px !important;
          }
          .compact-tabs .ant-tabs-nav-wrap {
            overflow: visible !important;
          }
          .compact-tabs .ant-tabs-nav-list {
            transform: none !important;
          }
        `}
      </style>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="compact-tabs"
        tabBarStyle={{
          marginBottom: '8px',
          fontSize: '14px'
        }}
      />
      <div style={{ marginTop: '16px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SimpleProductionFixed;