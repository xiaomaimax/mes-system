import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Badge, List, Avatar, Alert, Timeline, Divider, Table, Tag } from 'antd';
import { 
  NodeIndexOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  BookOutlined, 
  BranchesOutlined, 
  ExperimentOutlined,
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined
} from '@ant-design/icons';

// 导入子组件
import ProcessRouting from './process/ProcessRouting';
import ProcessParameters from './process/ProcessParameters';
import ProcessDocuments from './process/ProcessDocuments';
import ProcessSOP from './process/ProcessSOP';
import ProcessOptimization from './process/ProcessOptimization';
import ProcessValidation from './process/ProcessValidation';
import ProcessChangeControl from './process/ProcessChangeControl';
import ProcessMasterData from './process/ProcessMasterData';
import { processData } from '../data/mockData';

const SimpleProcess = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const processStats = {
    totalRoutes: 156,
    activeRoutes: 142,
    pendingValidation: 8,
    changeRequests: 6
  };

  const recentActivities = [
    {
      id: 1,
      type: 'validation',
      title: '产品A工艺路线验证完成',
      time: '2小时前',
      status: 'success',
      operator: '张工程师'
    },
    {
      id: 2,
      type: 'change',
      title: '产品B工艺参数变更申请',
      time: '4小时前',
      status: 'pending',
      operator: '李主管'
    },
    {
      id: 3,
      type: 'optimization',
      title: '生产线C工艺优化建议',
      time: '6小时前',
      status: 'processing',
      operator: '王技术员'
    },
    {
      id: 4,
      type: 'document',
      title: '新产品D工艺文件上传',
      time: '1天前',
      status: 'success',
      operator: '赵工程师'
    }
  ];

  const processRoutes = [
    {
      key: '1',
      routeCode: 'RT-001',
      productName: '塑料外壳A',
      version: 'V2.1',
      status: '生效中',
      steps: 8,
      cycleTime: '45分钟',
      lastUpdate: '2024-12-20'
    },
    {
      key: '2',
      routeCode: 'RT-002',
      productName: '电子组件B',
      version: 'V1.5',
      status: '待验证',
      steps: 12,
      cycleTime: '78分钟',
      lastUpdate: '2024-12-19'
    },
    {
      key: '3',
      routeCode: 'RT-003',
      productName: '机械零件C',
      version: 'V3.0',
      status: '生效中',
      steps: 6,
      cycleTime: '32分钟',
      lastUpdate: '2024-12-18'
    }
  ];

  const routeColumns = [
    {
      title: '工艺编码',
      dataIndex: 'routeCode',
      key: 'routeCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效中' ? 'green' : status === '待验证' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '工序数',
      dataIndex: 'steps',
      key: 'steps'
    },
    {
      title: '周期时间',
      dataIndex: 'cycleTime',
      key: 'cycleTime'
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate'
    }
  ];

  const renderOverview = () => (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>工艺管理概览</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              工艺路线、参数、文件的全生命周期管理，确保生产标准化和一致性
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新建工艺路线
            </Button>
            <Button icon={<EditOutlined />}>
              工艺变更
            </Button>
          </Space>
        </div>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="工艺管理提醒"
        description="当前有8个工艺路线待验证，6个变更申请待审批。请及时处理以确保生产正常进行。"
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Space>
            <Button size="small" type="text">
              查看详情
            </Button>
            <Button size="small" type="text" danger>
              立即处理
            </Button>
          </Space>
        }
      />

      {/* 核心统计指标 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="工艺路线总数"
              value={processStats.totalRoutes}
              prefix={<BranchesOutlined />}
              suffix="条"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" status="active" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                覆盖率: 91% (目标: 95%)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生效中路线"
              value={processStats.activeRoutes}
              prefix={<CheckCircleOutlined />}
              suffix="条"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" strokeColor="#52c41a" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                生效率: 91% (正常范围)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待验证路线"
              value={processStats.pendingValidation}
              prefix={<ExclamationCircleOutlined />}
              suffix="条"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={5} size="small" strokeColor="#fa8c16" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                需要关注 (建议&lt;10条)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="变更申请"
              value={processStats.changeRequests}
              prefix={<EditOutlined />}
              suffix="个"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={4} size="small" strokeColor="#722ed1" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                待处理 (平均处理时间: 2天)
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 工艺路线状态和最近活动 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="工艺路线状态" extra={<Button type="link">查看全部</Button>}>
            <Table 
              columns={routeColumns} 
              dataSource={processRoutes} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最近活动" extra={<Button type="link">查看更多</Button>}>
            <Timeline size="small">
              {recentActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  color={
                    activity.status === 'success' ? 'green' :
                    activity.status === 'pending' ? 'orange' :
                    activity.status === 'processing' ? 'blue' : 'gray'
                  }
                >
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {activity.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {activity.operator} · {activity.time}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 工艺管理工作站状态 */}
      <Card title="工艺管理工作站" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
              <div style={{ marginBottom: '8px' }}>
                <BranchesOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺设计</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                设计中: 3个工艺路线
              </div>
              <Progress percent={75} size="small" strokeColor="#52c41a" />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                负责人: 张工程师
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff' }}>
              <div style={{ marginBottom: '8px' }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺验证</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                验证中: 2个工艺路线
              </div>
              <Progress percent={60} size="small" strokeColor="#1890ff" />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                负责人: 李主管
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
              <div style={{ marginBottom: '8px' }}>
                <EditOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>变更控制</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                审批中: 6个变更申请
              </div>
              <Progress percent={40} size="small" strokeColor="#fa8c16" />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                负责人: 王技术员
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f9f0ff' }}>
              <div style={{ marginBottom: '8px' }}>
                <ExperimentOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺优化</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                优化中: 4个改善项目
              </div>
              <Progress percent={85} size="small" strokeColor="#722ed1" />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                负责人: 赵工程师
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('routing')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                <BranchesOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺路线</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺路线设计和管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('parameters')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}>
                <SettingOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺参数</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺参数设置和控制
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('documents')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#fa8c16', marginBottom: '8px' }}>
                <FileTextOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺文件</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺文件管理和版本控制
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('sop')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#722ed1', marginBottom: '8px' }}>
                <BookOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>作业指导</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                标准作业指导书管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('optimization')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#13c2c2', marginBottom: '8px' }}>
                <ExperimentOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺优化</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺改善和优化分析
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('validation')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#eb2f96', marginBottom: '8px' }}>
                <CheckCircleOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>工艺验证</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺验证和确认管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('change-control')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#f5222d', marginBottom: '8px' }}>
                <EditOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>变更控制</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺变更申请和审批
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('master-data')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#faad14', marginBottom: '8px' }}>
                <BookOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>主数据</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                工艺基础数据管理
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <NodeIndexOutlined />,
      children: renderOverview()
    },
    {
      key: 'master-data',
      label: '主数据',
      icon: <BookOutlined />,
      children: <ProcessMasterData />
    },
    {
      key: 'routing',
      label: '工艺路线',
      icon: <BranchesOutlined />,
      children: <ProcessRouting />
    },
    {
      key: 'parameters',
      label: '工艺参数',
      icon: <SettingOutlined />,
      children: <ProcessParameters />
    },
    {
      key: 'documents',
      label: '工艺文件',
      icon: <FileTextOutlined />,
      children: <ProcessDocuments />
    },
    {
      key: 'sop',
      label: '作业指导',
      icon: <BookOutlined />,
      children: <ProcessSOP />
    },
    {
      key: 'optimization',
      label: '工艺优化',
      icon: <ExperimentOutlined />,
      children: <ProcessOptimization />
    },
    {
      key: 'validation',
      label: '工艺验证',
      icon: <CheckCircleOutlined />,
      children: <ProcessValidation />
    },
    {
      key: 'change-control',
      label: '变更控制',
      icon: <EditOutlined />,
      children: <ProcessChangeControl />
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
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
    </div>
  );
};

export default SimpleProcess;