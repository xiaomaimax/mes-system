import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Switch, Tag, Alert, Tabs, Statistic, Progress } from 'antd';
import { 
  SecurityScanOutlined, 
  KeyOutlined, 
  UserOutlined, 
  SafetyOutlined,
  EditOutlined,
  PlusOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Option } = Select;

const SecuritySettingsFixed = () => {
  const [activeTab, setActiveTab] = useState('auth-config');

  // 认证配置数据
  const authConfigData = [
    {
      key: '1',
      systemName: 'ERP系统',
      authType: 'OAuth 2.0',
      tokenExpiry: 3600,
      status: '正常'
    },
    {
      key: '2',
      systemName: 'WMS系统',
      authType: 'API Key',
      tokenExpiry: 0,
      status: '正常'
    },
    {
      key: '3',
      systemName: 'PLM系统',
      authType: 'Basic Auth',
      tokenExpiry: 0,
      status: '异常'
    }
  ];

  const authColumns = [
    {
      title: '系统名称',
      dataIndex: 'systemName',
      key: 'systemName'
    },
    {
      title: '认证类型',
      dataIndex: 'authType',
      key: 'authType',
      render: (type) => (
        <Tag color={
          type === 'OAuth 2.0' ? 'blue' : 
          type === 'API Key' ? 'green' : 'orange'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: 'Token有效期(秒)',
      dataIndex: 'tokenExpiry',
      key: 'tokenExpiry',
      render: (expiry) => expiry === 0 ? '永久' : expiry
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'auth-config',
      label: '认证配置',
      icon: <KeyOutlined />
    },
    {
      key: 'security-policy',
      label: '安全策略',
      icon: <SafetyOutlined />
    }
  ];

  const renderAuthConfig = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索系统..."
            style={{ width: 300 }}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建认证
          </Button>
        </Space>
      </div>

      <Table
        columns={authColumns}
        dataSource={authConfigData}
        pagination={false}
        size="small"
      />
    </div>
  );

  const renderSecurityPolicy = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="密码策略" size="small" style={{ marginBottom: '16px' }}>
            <Form layout="vertical" size="small">
              <Form.Item label="最小长度">
                <Input defaultValue="8" />
              </Form.Item>
              <Form.Item label="密码复杂度">
                <Select defaultValue="medium">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
              <Form.Item label="密码有效期(天)">
                <Input defaultValue="90" />
              </Form.Item>
              <Form.Item>
                <Switch defaultChecked /> 强制定期更换密码
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="会话策略" size="small" style={{ marginBottom: '16px' }}>
            <Form layout="vertical" size="small">
              <Form.Item label="会话超时(分钟)">
                <Input defaultValue="30" />
              </Form.Item>
              <Form.Item label="最大并发会话">
                <Input defaultValue="5" />
              </Form.Item>
              <Form.Item label="登录失败锁定次数">
                <Input defaultValue="5" />
              </Form.Item>
              <Form.Item>
                <Switch defaultChecked /> 启用单点登录
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Button type="primary" size="large">
          保存安全策略
        </Button>
      </div>
    </div>
  );

  // 安全统计数据
  const securityStats = {
    totalUsers: 31,
    activeTokens: 28,
    failedLogins: 5,
    securityScore: 85
  };

  return (
    <div>
      {/* 安全概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={securityStats.totalUsers}
              prefix={<UserOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃Token"
              value={securityStats.activeTokens}
              prefix={<KeyOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日登录失败"
              value={securityStats.failedLogins}
              prefix={<WarningOutlined />}
              suffix="次"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="安全评分"
              value={securityStats.securityScore}
              prefix={<SecurityScanOutlined />}
              suffix="分"
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={securityStats.securityScore} 
              size="small" 
              strokeColor="#722ed1"
            />
          </Card>
        </Col>
      </Row>

      {/* 安全提醒 */}
      <Alert
        message="安全提醒"
        description="检测到5次登录失败尝试，建议检查是否存在异常访问。PLM系统认证配置异常，请及时处理。"
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Button size="small" type="text">
            查看详情
          </Button>
        }
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: 
              item.key === 'auth-config' ? renderAuthConfig() :
              renderSecurityPolicy()
          }))}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SecuritySettingsFixed;