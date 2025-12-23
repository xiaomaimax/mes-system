import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Switch, Tabs, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, ExperimentOutlined, EyeOutlined, KeyOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SystemConfiguration = () => {
  const [activeTab, setActiveTab] = useState('system-config');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 系统配置数据
  const systemConfigData = [
    {
      key: '1',
      systemCode: 'ERP-SYS-001',
      systemName: 'SAP ERP系统',
      systemType: 'ERP',
      serverUrl: 'http://erp.company.com:8080',
      database: 'SAP_PROD',
      username: 'mes_user',
      status: '已连接',
      lastConnect: '2024-12-20 10:30:15',
      responseTime: 120
    },
    {
      key: '2',
      systemCode: 'WMS-SYS-001',
      systemName: 'Oracle WMS系统',
      systemType: 'WMS',
      serverUrl: 'http://wms.company.com:9090',
      database: 'WMS_PROD',
      username: 'wms_integration',
      status: '已连接',
      lastConnect: '2024-12-20 10:25:08',
      responseTime: 85
    },
    {
      key: '3',
      systemCode: 'PLM-SYS-001',
      systemName: 'Teamcenter PLM',
      systemType: 'PLM',
      serverUrl: 'http://plm.company.com:7001',
      database: 'TC_PROD',
      username: 'tc_mes',
      status: '连接异常',
      lastConnect: '2024-12-20 09:45:21',
      responseTime: 0
    }
  ];

  // 连接参数配置数据
  const connectionConfigData = [
    {
      key: '1',
      paramName: '连接超时时间',
      paramKey: 'connection.timeout',
      paramValue: '30000',
      paramUnit: '毫秒',
      description: '数据库连接超时时间'
    },
    {
      key: '2',
      paramName: '最大连接数',
      paramKey: 'connection.pool.max',
      paramValue: '20',
      paramUnit: '个',
      description: '连接池最大连接数'
    },
    {
      key: '3',
      paramName: '重试次数',
      paramKey: 'retry.count',
      paramValue: '3',
      paramUnit: '次',
      description: '连接失败重试次数'
    },
    {
      key: '4',
      paramName: '心跳检测间隔',
      paramKey: 'heartbeat.interval',
      paramValue: '60',
      paramUnit: '秒',
      description: '连接心跳检测间隔'
    }
  ];

  const systemColumns = [
    {
      title: '系统编码',
      dataIndex: 'systemCode',
      key: 'systemCode'
    },
    {
      title: '系统名称',
      dataIndex: 'systemName',
      key: 'systemName'
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
      title: '服务器地址',
      dataIndex: 'serverUrl',
      key: 'serverUrl'
    },
    {
      title: '数据库',
      dataIndex: 'database',
      key: 'database'
    },
    {
      title: '连接状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已连接' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time) => `${time}ms`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<ExperimentOutlined />}>
            测试连接
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const paramColumns = [
    {
      title: '参数名称',
      dataIndex: 'paramName',
      key: 'paramName'
    },
    {
      title: '参数键',
      dataIndex: 'paramKey',
      key: 'paramKey'
    },
    {
      title: '参数值',
      dataIndex: 'paramValue',
      key: 'paramValue'
    },
    {
      title: '单位',
      dataIndex: 'paramUnit',
      key: 'paramUnit'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small" icon={<EditOutlined />}>
          编辑
        </Button>
      )
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
      console.log('保存系统配置:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'system-config',
      label: '系统配置',
      icon: <DatabaseOutlined />
    },
    {
      key: 'connection-params',
      label: '连接参数',
      icon: <SettingOutlined />
    }
  ];

  const renderSystemConfig = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索系统配置..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="系统类型" style={{ width: 120 }} allowClear>
            <Option value="ERP">ERP</Option>
            <Option value="WMS">WMS</Option>
            <Option value="PLM">PLM</Option>
            <Option value="QMS">QMS</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建系统
          </Button>
        </Space>
      </div>

      <Table
        columns={systemColumns}
        dataSource={systemConfigData}
        pagination={false}
        size="small"
      />
    </div>
  );

  const renderConnectionParams = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索参数..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建参数
          </Button>
        </Space>
      </div>

      <Table
        columns={paramColumns}
        dataSource={connectionConfigData}
        pagination={false}
        size="small"
      />
    </div>
  );

  return (
    <div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: item.key === 'system-config' ? renderSystemConfig() : renderConnectionParams()
          }))}
          size="small"
        />
      </Card>

      {/* 新建/编辑系统配置模态框 */}
      <Modal
        title={editingRecord ? '编辑系统配置' : '新建系统配置'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="systemCode"
                label="系统编码"
                rules={[{ required: true, message: '请输入系统编码' }]}
              >
                <Input placeholder="请输入系统编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="systemName"
                label="系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input placeholder="请输入系统名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="systemType"
                label="系统类型"
                rules={[{ required: true, message: '请选择系统类型' }]}
              >
                <Select placeholder="请选择系统类型">
                  <Option value="ERP">ERP系统</Option>
                  <Option value="WMS">WMS系统</Option>
                  <Option value="PLM">PLM系统</Option>
                  <Option value="QMS">QMS系统</Option>
                  <Option value="CRM">CRM系统</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="database"
                label="数据库名称"
                rules={[{ required: true, message: '请输入数据库名称' }]}
              >
                <Input placeholder="请输入数据库名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="serverUrl"
            label="服务器地址"
            rules={[{ required: true, message: '请输入服务器地址' }]}
          >
            <Input placeholder="请输入服务器地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="系统描述"
          >
            <TextArea rows={3} placeholder="请输入系统描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfiguration;