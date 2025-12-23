import { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Alert, Table, Tag, Avatar, Timeline } from 'antd';
import { 
  LinkOutlined, 
  ApiOutlined, 
  DatabaseOutlined, 
  SettingOutlined, 
  SyncOutlined,
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  PlusOutlined,
  SecurityScanOutlined,
  BugOutlined
} from '@ant-design/icons';

// 导入子组件
import InterfaceManagement from './integration/InterfaceManagement';
import DataMapping from './integration/DataMapping';
import SystemConfiguration from './integration/SystemConfiguration';
import APIDocumentation from './integration/APIDocumentation';
import ErrorHandling from './integration/ErrorHandling';
import SecuritySettingsFixed from './integration/SecuritySettingsFixed';

const SimpleIntegrationEnhanced = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const integrationStats = {
    totalInterfaces: 24,
    activeInterfaces: 20,
    errorInterfaces: 2,
    syncSuccess: 98.5
  };

  const systemConnections = [
    {
      id: 1,
      systemName: 'ERP系统',
      systemType: 'ERP',
      status: '正常',
      lastSync: '2分钟前',
      syncCount: 1250,
      errorCount: 0,
      responseTime: 120
    },
    {
      id: 2,
      systemName: 'WMS仓储系统',
      systemType: 'WMS',
      status: '正常',
      lastSync: '5分钟前',
      syncCount: 890,
      errorCount: 1,
      responseTime: 85
    },
    {
      id: 3,
      systemName: 'PLM产品管理',
      systemType: 'PLM',
      status: '异常',
      lastSync: '30分钟前',
      syncCount: 456,
      errorCount: 5,
      responseTime: 0
    },
    {
      id: 4,
      systemName: 'CRM客户管理',
      systemType: 'CRM',
      status: '正常',
      lastSync: '1分钟前',
      syncCount: 678,
      errorCount: 0,
      responseTime: 95
    }
  ];

  const recentSyncActivities = [
    {
      id: 1,
      type: 'success',
      title: 'ERP生产订单同步成功',
      time: '2分钟前',
      system: 'ERP系统',
      records: 25
    },
    {
      id: 2,
      type: 'success',
      title: 'WMS库存数据同步成功',
      time: '5分钟前',
      system: 'WMS系统',
      records: 156
    },
    {
      id: 3,
      type: 'error',
      title: 'PLM工艺数据同步失败',
      time: '30分钟前',
      system: 'PLM系统',
      records: 0
    },
    {
      id: 4,
      type: 'warning',
      title: 'CRM客户信息部分同步',
      time: '1小时前',
      system: 'CRM系统',
      records: 12
    }
  ];

  const interfaceList = [
    {
      key: '1',
      interfaceName: '生产订单接口',
      systemType: 'ERP',
      method: 'REST API',
      status: '运行中',
      frequency: '实时',
      lastCall: '2分钟前',
      successRate: 99.8
    },
    {
      key: '2',
      interfaceName: '库存同步接口',
      systemType: 'WMS',
      method: 'SOAP',
      status: '运行中',
      frequency: '5分钟',
      lastCall: '5分钟前',
      successRate: 98.5
    },
    {
      key: '3',
      interfaceName: '工艺数据接口',
      systemType: 'PLM',
      method: 'REST API',
      status: '异常',
      frequency: '30分钟',
      lastCall: '30分钟前',
      successRate: 85.2
    },
    {
      key: '4',
      interfaceName: '质量数据接口',
      systemType: 'QMS',
      method: 'REST API',
      status: '运行中',
      frequency: '15分钟',
      lastCall: '10分钟前',
      successRate: 97.3
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <LinkOutlined />
    },
    {
      key: 'interface-management',
      label: '接口管理',
      icon: <ApiOutlined />
    },
    {
      key: 'data-mapping',
      label: '数据映射',
      icon: <DatabaseOutlined />
    },
    {
      key: 'system-config',
      label: '系统配置',
      icon: <SettingOutlined />
    },
    {
      key: 'api-docs',
      label: 'API文档',
      icon: <DatabaseOutlined />
    },
    {
      key: 'error-handling',
      label: '异常处理',
      icon: <BugOutlined />
    },
    {
      key: 'security',
      label: '安全设置',
      icon: <SecurityScanOutlined />
    }
  ];

  const renderOverview = () => (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>系统集成概览</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              MES系统与外部系统的数据互通管理，确保信息流畅通和数据一致性
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新建接口
            </Button>
            <Button icon={<SyncOutlined />}>
              全量同步
            </Button>
          </Space>
        </div>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="系统集成状态提醒"
        description="PLM系统连接异常，已影响工艺数据同步30分钟。建议立即检查网络连接和接口配置。"
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Space>
            <Button size="small" type="text">
              查看详情
            </Button>
            <Button size="small" type="text" danger>
              立即修复
            </Button>
          </Space>
        }
      />

      {/* 核心统计指标 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="接口总数"
              value={integrationStats.totalInterfaces}
              prefix={<ApiOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={83} size="small" status="active" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                覆盖率: 83% (目标: 90%)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中接口"
              value={integrationStats.activeInterfaces}
              prefix={<CheckCircleOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={83} size="small" strokeColor="#52c41a" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                运行率: 83% (正常范围)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常接口"
              value={integrationStats.errorInterfaces}
              prefix={<ExclamationCircleOutlined />}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={8} size="small" strokeColor="#fa8c16" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                需要关注 (建议&lt;5%)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="同步成功率"
              value={integrationStats.syncSuccess}
              prefix={<SyncOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={98.5} size="small" strokeColor="#722ed1" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                优秀 (目标: &gt;95%)
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统连接状态和最近同步活动 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="系统连接状态" extra={<Button type="link">查看全部</Button>}>
            <Row gutter={16}>
              {systemConnections.map(system => (
                <Col span={12} key={system.id} style={{ marginBottom: '16px' }}>
                  <Card size="small" style={{ 
                    background: system.status === '正常' ? '#f6ffed' : '#fff2e8',
                    border: `1px solid ${system.status === '正常' ? '#b7eb8f' : '#ffbb96'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold' }}>{system.systemName}</div>
                      <Tag color={system.status === '正常' ? 'green' : 'orange'}>
                        {system.status}
                      </Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>类型: {system.systemType} | 响应时间: {system.responseTime}ms</div>
                      <div>同步次数: {system.syncCount} | 错误次数: {system.errorCount}</div>
                      <div>最后同步: {system.lastSync}</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最近同步活动" extra={<Button type="link">查看更多</Button>}>
            <Timeline size="small">
              {recentSyncActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  color={
                    activity.type === 'success' ? 'green' :
                    activity.type === 'error' ? 'red' :
                    activity.type === 'warning' ? 'orange' : 'blue'
                  }
                >
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {activity.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {activity.system} · {activity.time}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      记录数: {activity.records}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 接口运行状态 */}
      <Card title="接口运行状态" style={{ marginBottom: '24px' }}>
        <Table 
          columns={[
            {
              title: '接口名称',
              dataIndex: 'interfaceName',
              key: 'interfaceName'
            },
            {
              title: '系统类型',
              dataIndex: 'systemType',
              key: 'systemType',
              render: (type) => (
                <Tag color={
                  type === 'ERP' ? 'blue' : 
                  type === 'WMS' ? 'green' : 
                  type === 'PLM' ? 'orange' : 'purple'
                }>
                  {type}
                </Tag>
              )
            },
            {
              title: '调用方式',
              dataIndex: 'method',
              key: 'method'
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === '运行中' ? 'green' : 'red'}>
                  {status}
                </Tag>
              )
            },
            {
              title: '同步频率',
              dataIndex: 'frequency',
              key: 'frequency'
            },
            {
              title: '最后调用',
              dataIndex: 'lastCall',
              key: 'lastCall'
            },
            {
              title: '成功率',
              dataIndex: 'successRate',
              key: 'successRate',
              render: (rate) => (
                <div>
                  <Progress percent={rate} size="small" />
                  <span style={{ fontSize: '12px' }}>{rate}%</span>
                </div>
              )
            }
          ]}
          dataSource={interfaceList}
          pagination={false}
          size="small"
        />
      </Card>

      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('interface-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                <ApiOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>接口管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                接口配置和生命周期管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('data-mapping')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}>
                <DatabaseOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>数据映射</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                字段映射和数据转换规则
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('system-config')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#722ed1', marginBottom: '8px' }}>
                <SettingOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>系统配置</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                外部系统连接参数配置
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('security')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#faad14', marginBottom: '8px' }}>
                <SecurityScanOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>安全设置</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                认证授权和安全策略配置
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'interface-management':
        return <InterfaceManagement />;
      case 'data-mapping':
        return <DataMapping />;
      case 'system-config':
        return <SystemConfiguration />;
      case 'api-docs':
        return <APIDocumentation />;
      case 'error-handling':
        return <ErrorHandling />;
      case 'security':
        return <SecuritySettingsFixed />;
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems.map(item => ({
          ...item,
          children: renderTabContent()
        }))}
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

export default SimpleIntegrationEnhanced;