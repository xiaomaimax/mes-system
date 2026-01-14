import React, { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Switch, Modal, Tag, Alert, Tabs, Divider, List, Avatar, Progress, Statistic } from 'antd';
import {   SecurityScanOutlined, 
  KeyOutlined, 
  UserOutlined, 
  LockOutlined, 
  ShieldOutlined, 
  SafetyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  SettingOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SecuritySettings = () => {
  const [activeTab, setActiveTab] = useState('auth-config');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 认证配置数据
  const authConfigData = [
    {
      key: '1',
      systemName: 'ERP系统',
      authType: 'OAuth 2.0',
      tokenExpiry: 3600,
      refreshEnabled: true,
      lastUpdate: '2024-12-20 10:30:15',
      status: '正常'
    },
    {
      key: '2',
      systemName: 'WMS系统',
      authType: 'API Key',
      tokenExpiry: 0,
      refreshEnabled: false,
      lastUpdate: '2024-12-19 15:20:30',
      status: '正常'
    },
    {
      key: '3',
      systemName: 'PLM系统',
      authType: 'Basic Auth',
      tokenExpiry: 0,
      refreshEnabled: false,
      lastUpdate: '2024-12-18 09:45:12',
      status: '异常'
    }
  ];

  // 访问控制数据
  const accessControlData = [
    {
      key: '1',
      roleName: '系统管理员',
      permissions: ['接口管理', '系统配置', '用户管理', '日志查看'],
      userCount: 3,
      status: '启用'
    },
    {
      key: '2',
      roleName: '集成工程师',
      permissions: ['接口管理', '数据映射', '同步监控'],
      userCount: 8,
      status: '启用'
    },
    {
      key: '3',
      roleName: '运维人员',
      permissions: ['同步监控', '异常处理', '性能监控'],
      userCount: 5,
      status: '启用'
    },
    {
      key: '4',
      roleName: '业务用户',
      permissions: ['同步监控'],
      userCount: 15,
      status: '启用'
    }
  ];

  // 安全审计日志数据
  const auditLogData = [
    {
      key: '1',
      timestamp: '2024-12-20 10:30:15',
      user: '张工程师',
      action: '修改接口配置',
      resource: 'ERP-PO-001',
      result: '成功',
      ipAddress: '192.168.1.100'
    },
    {
      key: '2',
      timestamp: '2024-12-20 10:25:08',
      user: '李主管',
      action: '查看系统配置',
      resource: 'WMS-SYS-001',
      result: '成功',
      ipAddress: '192.168.1.101'
    },
    {
      key: '3',
      timestamp: '2024-12-20 10:00:32',
      user: '未知用户',
      action: '尝试访问接口',
      resource: 'PLM-PROC-001',
      result: '失败',
      ipAddress: '192.168.1.200'
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
          type === 'API Key' ? 'green' : 
          type === 'Basic Auth' ? 'orange' : 'default'
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
      title: '自动刷新',
      dataIndex: 'refreshEnabled',
      key: 'refreshEnabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate'
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
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<KeyOutlined />}>
            重置密钥
          </Button>
        </Space>
      )
    }
  ];

  const accessColumns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName'
    },
    {
      title: '权限列表',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <div>
          {permissions.map(permission => (
            <Tag key={permission} color="blue" style={{ marginBottom: '4px' }}>
              {permission}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<UserOutlined />}>
            管理用户
          </Button>
        </Space>
      )
    }
  ];

  const auditColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource'
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) => (
        <Tag color={result === '成功' ? 'green' : 'red'}>
          {result}
        </Tag>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    }
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存安全配置:', values);
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'auth-config',
      label: '认证配置',
      icon: <KeyOutlined />
    },
    {
      key: 'access-control',
      label: '访问控制',
      icon: <ShieldOutlined />
    },
    {
      key: 'security-policy',
      label: '安全策略',
      icon: <SafetyOutlined />
    },
    {
      key: 'audit-log',
      label: '审计日志',
      icon: <AuditOutlined />
    }
  ];

  const renderAuthConfig = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索系统..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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

  const renderAccessControl = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索角色..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建角色
          </Button>
        </Space>
      </div>

      <Table
        columns={accessColumns}
        dataSource={accessControlData}
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

      <Row gutter={16}>
        <Col span={12}>
          <Card title="IP访问控制" size="small">
            <Form layout="vertical" size="small">
              <Form.Item label="白名单IP">
                <TextArea rows={4} defaultValue="192.168.1.0/24&#10;10.0.0.0/8" />
              </Form.Item>
              <Form.Item label="黑名单IP">
                <TextArea rows={4} placeholder="输入禁止访问的IP地址..." />
              </Form.Item>
              <Form.Item>
                <Switch /> 启用IP白名单模式
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="API安全策略" size="small">
            <Form layout="vertical" size="small">
              <Form.Item label="API调用频率限制(次/分钟)">
                <Input defaultValue="1000" />
              </Form.Item>
              <Form.Item label="Token有效期(小时)">
                <Input defaultValue="24" />
              </Form.Item>
              <Form.Item label="加密算法">
                <Select defaultValue="AES-256">
                  <Option value="AES-128">AES-128</Option>
                  <Option value="AES-256">AES-256</Option>
                  <Option value="RSA-2048">RSA-2048</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Switch defaultChecked /> 启用HTTPS强制
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

  const renderAuditLog = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select placeholder="操作类型" style={{ width: 120 }} allowClear>
            <Option value="登录">登录</Option>
            <Option value="修改配置">修改配置</Option>
            <Option value="查看数据">查看数据</Option>
            <Option value="删除数据">删除数据</Option>
          </Select>
          <Select placeholder="操作结果" style={{ width: 120 }} allowClear>
            <Option value="成功">成功</Option>
            <Option value="失败">失败</Option>
          </Select>
          <Input placeholder="用户名" style={{ width: 150 }} />
        </Space>
        <Space>
          <Button icon={<DownloadOutlined />}>导出日志</Button>
        </Space>
      </div>

      <Table
        columns={auditColumns}
        dataSource={auditLogData}
        pagination={{
          total: auditLogData.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
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
              item.key === 'access-control' ? renderAccessControl() :
              item.key === 'security-policy' ? renderSecurityPolicy() :
              renderAuditLog()
          }))}
          size="small"
        />
      </Card>

      {/* 编辑认证配置模态框 */}
      <Modal
        title={editingRecord ? '编辑认证配置' : '新建认证配置'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="systemName"
            label="系统名称"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>
          <Form.Item
            name="authType"
            label="认证类型"
            rules={[{ required: true, message: '请选择认证类型' }]}
          >
            <Select placeholder="请选择认证类型">
              <Option value="OAuth 2.0">OAuth 2.0</Option>
              <Option value="API Key">API Key</Option>
              <Option value="Basic Auth">Basic Auth</Option>
              <Option value="JWT">JWT</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tokenExpiry"
            label="Token有效期(秒)"
            rules={[{ required: true, message: '请输入Token有效期' }]}
          >
            <Input type="number" placeholder="0表示永久有效" />
          </Form.Item>
          <Form.Item name="refreshEnabled" label="自动刷新" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SecuritySettings;