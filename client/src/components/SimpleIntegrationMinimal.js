import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Alert, Table, Tag } from 'antd';
import { 
  LinkOutlined, 
  ApiOutlined, 
  DatabaseOutlined, 
  SettingOutlined, 
  MonitorOutlined, 
  SyncOutlined,
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  PlusOutlined
} from '@ant-design/icons';

const SimpleIntegrationMinimal = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const integrationStats = {
    totalInterfaces: 24,
    activeInterfaces: 20,
    errorInterfaces: 2,
    syncSuccess: 98.5
  };

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

      {/* 功能说明 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <ApiOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>接口管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                接口配置和生命周期管理
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <DatabaseOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>数据映射</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                字段映射和数据转换规则
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <MonitorOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '8px' }} />
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>同步监控</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                实时同步状态和日志监控
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
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h3>接口管理功能</h3>
            <p>接口管理功能正在开发中...</p>
          </div>
        );
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

export default SimpleIntegrationMinimal;