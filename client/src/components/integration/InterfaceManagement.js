import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Switch, Descriptions, Divider, Steps, Timeline } from 'antd';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return safeMessage.success(content, duration);
      } else {
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return safeMessage.error(content, duration);
      } else {
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return safeMessage.warning(content, duration);
      } else {
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return safeMessage.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, ApiOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;

const InterfaceManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedInterface, setSelectedInterface] = useState(null);
  const [form] = Form.useForm();

  const interfaceData = [
    {
      key: '1',
      interfaceCode: 'ERP-PO-001',
      interfaceName: '生产订单接口',
      systemType: 'ERP',
      direction: '入站',
      method: 'REST API',
      endpoint: '/api/v1/production-orders',
      status: '运行中',
      frequency: '实时',
      timeout: 30,
      retryCount: 3,
      createDate: '2024-01-15',
      creator: '张工程师',
      lastTest: '2024-12-20 10:30',
      testResult: '成功'
    },
    {
      key: '2',
      interfaceCode: 'WMS-INV-001',
      interfaceName: '库存同步接口',
      systemType: 'WMS',
      direction: '双向',
      method: 'SOAP',
      endpoint: '/soap/inventory-service',
      status: '运行中',
      frequency: '5分钟',
      timeout: 60,
      retryCount: 5,
      createDate: '2024-02-10',
      creator: '李主管',
      lastTest: '2024-12-20 10:25',
      testResult: '成功'
    },
    {
      key: '3',
      interfaceCode: 'PLM-PROC-001',
      interfaceName: '工艺数据接口',
      systemType: 'PLM',
      direction: '入站',
      method: 'REST API',
      endpoint: '/api/process-data',
      status: '异常',
      frequency: '30分钟',
      timeout: 45,
      retryCount: 3,
      createDate: '2024-03-05',
      creator: '王技术员',
      lastTest: '2024-12-20 09:45',
      testResult: '失败'
    },
    {
      key: '4',
      interfaceCode: 'QMS-QUAL-001',
      interfaceName: '质量数据接口',
      systemType: 'QMS',
      direction: '出站',
      method: 'REST API',
      endpoint: '/api/quality-data',
      status: '运行中',
      frequency: '15分钟',
      timeout: 30,
      retryCount: 2,
      createDate: '2024-03-20',
      creator: '赵工程师',
      lastTest: '2024-12-20 10:15',
      testResult: '成功'
    }
  ];

  const columns = [
    {
      title: '接口编码',
      dataIndex: 'interfaceCode',
      key: 'interfaceCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
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
          type === 'PLM' ? 'orange' : 
          type === 'QMS' ? 'purple' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '数据方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={
          direction === '入站' ? 'cyan' : 
          direction === '出站' ? 'magenta' : 'geekblue'
        }>
          {direction}
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
        <Tag color={status === '运行中' ? 'green' : status === '已停用' ? 'red' : 'orange'}>
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
      title: '最后测试',
      dataIndex: 'testResult',
      key: 'testResult',
      render: (result) => (
        <Tag color={result === '成功' ? 'green' : 'red'}>
          {result}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => handleTest(record)}>
            测试
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={record.status === '运行中' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '运行中' ? '停用' : '启用'}
          </Button>
        </Space>
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

  const handleViewDetail = (record) => {
    setSelectedInterface(record);
    setDetailModalVisible(true);
  };

  const handleTest = (record) => {
    setSelectedInterface(record);
    setTestModalVisible(true);
  };

  const handleToggleStatus = (record) => {
    const newStatus = record.status === '运行中' ? '已停用' : '运行中';
    safeMessage.success(`接口已${newStatus === '运行中' ? '启用' : '停用'}`);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存接口配置:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleTestInterface = () => {
    safeMessage.loading('正在测试接口连接...', 2);
    setTimeout(() => {
      safeMessage.success('接口测试成功');
      setTestModalVisible(false);
    }, 2000);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索接口..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="系统类型" style={{ width: 120 }} allowClear>
              <Option value="ERP">ERP</Option>
              <Option value="WMS">WMS</Option>
              <Option value="PLM">PLM</Option>
              <Option value="QMS">QMS</Option>
              <Option value="CRM">CRM</Option>
            </Select>
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="运行中">运行中</Option>
              <Option value="已停用">已停用</Option>
              <Option value="异常">异常</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ExperimentOutlined />}>批量测试</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建接口
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={interfaceData}
          pagination={{
            total: interfaceData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑接口模态框 */}
      <Modal
        title={editingRecord ? '编辑接口' : '新建接口'}
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
                name="interfaceCode"
                label="接口编码"
                rules={[{ required: true, message: '请输入接口编码' }]}
              >
                <Input placeholder="请输入接口编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="interfaceName"
                label="接口名称"
                rules={[{ required: true, message: '请输入接口名称' }]}
              >
                <Input placeholder="请输入接口名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="direction"
                label="数据方向"
                rules={[{ required: true, message: '请选择数据方向' }]}
              >
                <Select placeholder="请选择数据方向">
                  <Option value="入站">入站</Option>
                  <Option value="出站">出站</Option>
                  <Option value="双向">双向</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="method"
                label="调用方式"
                rules={[{ required: true, message: '请选择调用方式' }]}
              >
                <Select placeholder="请选择调用方式">
                  <Option value="REST API">REST API</Option>
                  <Option value="SOAP">SOAP</Option>
                  <Option value="GraphQL">GraphQL</Option>
                  <Option value="WebSocket">WebSocket</Option>
                  <Option value="FTP">FTP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="endpoint"
            label="接口地址"
            rules={[{ required: true, message: '请输入接口地址' }]}
          >
            <Input placeholder="请输入接口地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="frequency"
                label="同步频率"
                rules={[{ required: true, message: '请选择同步频率' }]}
              >
                <Select placeholder="请选择同步频率">
                  <Option value="实时">实时</Option>
                  <Option value="1分钟">1分钟</Option>
                  <Option value="5分钟">5分钟</Option>
                  <Option value="15分钟">15分钟</Option>
                  <Option value="30分钟">30分钟</Option>
                  <Option value="1小时">1小时</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="timeout"
                label="超时时间(秒)"
                rules={[{ required: true, message: '请输入超时时间' }]}
              >
                <Input type="number" placeholder="请输入超时时间" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="retryCount"
                label="重试次数"
                rules={[{ required: true, message: '请输入重试次数' }]}
              >
                <Input type="number" placeholder="请输入重试次数" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="接口描述"
          >
            <TextArea rows={3} placeholder="请输入接口描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 接口详情模态框 */}
      <Modal
        title="接口详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="test" icon={<ExperimentOutlined />} onClick={() => handleTest(selectedInterface)}>
            测试接口
          </Button>,
          <Button onClick={() => handleEdit(record)} key="edit" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(selectedInterface)}>
            编辑
          </Button>
        ]}
      >
        {selectedInterface && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="接口编码">{selectedInterface.interfaceCode}</Descriptions.Item>
              <Descriptions.Item label="接口名称">{selectedInterface.interfaceName}</Descriptions.Item>
              <Descriptions.Item label="系统类型">
                <Tag color={
                  selectedInterface.systemType === 'ERP' ? 'blue' : 
                  selectedInterface.systemType === 'WMS' ? 'green' : 'orange'
                }>
                  {selectedInterface.systemType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="数据方向">
                <Tag color={
                  selectedInterface.direction === '入站' ? 'cyan' : 
                  selectedInterface.direction === '出站' ? 'magenta' : 'geekblue'
                }>
                  {selectedInterface.direction}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="调用方式">{selectedInterface.method}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedInterface.status === '运行中' ? 'green' : 'red'}>
                  {selectedInterface.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="接口地址" span={2}>{selectedInterface.endpoint}</Descriptions.Item>
              <Descriptions.Item label="同步频率">{selectedInterface.frequency}</Descriptions.Item>
              <Descriptions.Item label="超时时间">{selectedInterface.timeout}秒</Descriptions.Item>
              <Descriptions.Item label="重试次数">{selectedInterface.retryCount}次</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedInterface.creator}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedInterface.createDate}</Descriptions.Item>
              <Descriptions.Item label="最后测试">{selectedInterface.lastTest}</Descriptions.Item>
            </Descriptions>

            <Divider>接口配置</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="请求配置" size="small">
                  <div style={{ fontSize: '12px' }}>
                    <div><strong>Content-Type:</strong> application/json</div>
                    <div><strong>Accept:</strong> application/json</div>
                    <div><strong>Authorization:</strong> Bearer Token</div>
                    <div><strong>User-Agent:</strong> MES-System/1.0</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="响应配置" size="small">
                  <div style={{ fontSize: '12px' }}>
                    <div><strong>成功状态码:</strong> 200, 201</div>
                    <div><strong>错误处理:</strong> 自动重试</div>
                    <div><strong>数据格式:</strong> JSON</div>
                    <div><strong>编码格式:</strong> UTF-8</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 接口测试模态框 */}
      <Modal
        title="接口测试"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>
            关闭
          </Button>,
          <Button key="test" type="primary" icon={<ExperimentOutlined />} onClick={handleTestInterface}>
            开始测试
          </Button>
        ]}
      >
        {selectedInterface && (
          <div>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="接口名称">{selectedInterface.interfaceName}</Descriptions.Item>
              <Descriptions.Item label="接口地址">{selectedInterface.endpoint}</Descriptions.Item>
              <Descriptions.Item label="调用方式">{selectedInterface.method}</Descriptions.Item>
            </Descriptions>
            
            <Card title="测试参数" size="small" style={{ marginBottom: '16px' }}>
              <Form layout="vertical" size="small">
                <Form.Item label="请求头">
                  <TextArea rows={3} defaultValue='{"Content-Type": "application/json", "Authorization": "Bearer xxx"}' />
                </Form.Item>
                <Form.Item label="请求体">
                  <TextArea rows={4} defaultValue='{"timestamp": "2024-12-20T10:30:00Z", "data": {}}' />
                </Form.Item>
              </Form>
            </Card>

            <Card title="测试结果" size="small">
              <div style={{ fontSize: '12px', color: '#666' }}>
                点击"开始测试"按钮执行接口测试...
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterfaceManagement;