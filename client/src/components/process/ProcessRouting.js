import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber, Tag, message, Row, Col, Steps, Divider, Tree, Descriptions, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BranchesOutlined, PlayCircleOutlined, EyeOutlined, CopyOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ProcessRouting = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [form] = Form.useForm();

  // 工艺路线数据
  const routingData = [
    {
      key: '1',
      routeCode: 'RT-001',
      routeName: '塑料外壳A工艺路线',
      productCode: 'P001',
      productName: '塑料外壳A',
      version: 'V2.1',
      status: '生效中',
      totalSteps: 8,
      cycleTime: 45,
      createDate: '2024-01-15',
      creator: '张工程师',
      operations: [
        { seq: 10, opCode: 'OP001', opName: '注塑成型', workCenter: '注塑车间', standardTime: 15, setupTime: 5 },
        { seq: 20, opCode: 'OP002', opName: '去毛刺', workCenter: '后处理', standardTime: 8, setupTime: 2 },
        { seq: 30, opCode: 'OP003', opName: '表面处理', workCenter: '表处车间', standardTime: 12, setupTime: 3 },
        { seq: 40, opCode: 'OP004', opName: '质量检验', workCenter: '质检区', standardTime: 5, setupTime: 1 },
        { seq: 50, opCode: 'OP005', opName: '包装', workCenter: '包装区', standardTime: 5, setupTime: 1 }
      ]
    },
    {
      key: '2',
      routeCode: 'RT-002',
      routeName: '电子组件B工艺路线',
      productCode: 'P002',
      productName: '电子组件B',
      version: 'V1.5',
      status: '待验证',
      totalSteps: 12,
      cycleTime: 78,
      createDate: '2024-02-20',
      creator: '李主管',
      operations: [
        { seq: 10, opCode: 'OP006', opName: 'PCB贴片', workCenter: 'SMT车间', standardTime: 25, setupTime: 10 },
        { seq: 20, opCode: 'OP007', opName: '回流焊接', workCenter: 'SMT车间', standardTime: 15, setupTime: 5 },
        { seq: 30, opCode: 'OP008', opName: '功能测试', workCenter: '测试区', standardTime: 20, setupTime: 8 },
        { seq: 40, opCode: 'OP009', opName: '老化测试', workCenter: '测试区', standardTime: 180, setupTime: 15 },
        { seq: 50, opCode: 'OP010', opName: '最终检验', workCenter: '质检区', standardTime: 8, setupTime: 2 }
      ]
    },
    {
      key: '3',
      routeCode: 'RT-003',
      routeName: '机械零件C工艺路线',
      productCode: 'P003',
      productName: '机械零件C',
      version: 'V3.0',
      status: '生效中',
      totalSteps: 6,
      cycleTime: 32,
      createDate: '2024-03-10',
      creator: '王技术员',
      operations: [
        { seq: 10, opCode: 'OP011', opName: '粗加工', workCenter: '机加车间', standardTime: 15, setupTime: 8 },
        { seq: 20, opCode: 'OP012', opName: '精加工', workCenter: '机加车间', standardTime: 12, setupTime: 5 },
        { seq: 30, opCode: 'OP013', opName: '热处理', workCenter: '热处理', standardTime: 60, setupTime: 20 },
        { seq: 40, opCode: 'OP014', opName: '精密加工', workCenter: '精加工', standardTime: 8, setupTime: 3 }
      ]
    }
  ];

  const columns = [
    {
      title: '工艺编码',
      dataIndex: 'routeCode',
      key: 'routeCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '工艺路线名称',
      dataIndex: 'routeName',
      key: 'routeName'
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode'
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
        <Tag color={
          status === '生效中' ? 'green' : 
          status === '待验证' ? 'orange' : 
          status === '已停用' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '工序数',
      dataIndex: 'totalSteps',
      key: 'totalSteps'
    },
    {
      title: '周期时间(分)',
      dataIndex: 'cycleTime',
      key: 'cycleTime'
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<CopyOutlined />}>
            复制
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const operationColumns = [
    {
      title: '工序号',
      dataIndex: 'seq',
      key: 'seq',
      width: 80
    },
    {
      title: '工序编码',
      dataIndex: 'opCode',
      key: 'opCode'
    },
    {
      title: '工序名称',
      dataIndex: 'opName',
      key: 'opName'
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      key: 'workCenter'
    },
    {
      title: '标准工时(分)',
      dataIndex: 'standardTime',
      key: 'standardTime'
    },
    {
      title: '准备工时(分)',
      dataIndex: 'setupTime',
      key: 'setupTime'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
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
    setSelectedRoute(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存工艺路线:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const renderRouteSteps = (operations) => {
    return (
      <Steps
        direction="vertical"
        size="small"
        current={-1}
        items={operations.map((op, index) => ({
          title: `${op.seq} - ${op.opName}`,
          description: (
            <div>
              <div>工作中心: {op.workCenter}</div>
              <div>标准工时: {op.standardTime}分钟 | 准备工时: {op.setupTime}分钟</div>
            </div>
          ),
          icon: <PlayCircleOutlined />
        }))}
      />
    );
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索工艺路线..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="生效中">生效中</Option>
              <Option value="待验证">待验证</Option>
              <Option value="已停用">已停用</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<BranchesOutlined />}>工艺流程图</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建工艺路线
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={routingData}
          pagination={{
            total: routingData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑工艺路线模态框 */}
      <Modal
        title={editingRecord ? '编辑工艺路线' : '新建工艺路线'}
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
                name="routeCode"
                label="工艺编码"
                rules={[{ required: true, message: '请输入工艺编码' }]}
              >
                <Input placeholder="请输入工艺编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="routeName"
                label="工艺路线名称"
                rules={[{ required: true, message: '请输入工艺路线名称' }]}
              >
                <Input placeholder="请输入工艺路线名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productCode"
                label="产品编码"
                rules={[{ required: true, message: '请选择产品' }]}
              >
                <Select placeholder="请选择产品">
                  <Option value="P001">P001 - 塑料外壳A</Option>
                  <Option value="P002">P002 - 电子组件B</Option>
                  <Option value="P003">P003 - 机械零件C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="请输入版本号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cycleTime"
                label="标准周期时间(分钟)"
                rules={[{ required: true, message: '请输入标准周期时间' }]}
              >
                <InputNumber min={0} placeholder="请输入标准周期时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="草稿">草稿</Option>
                  <Option value="待验证">待验证</Option>
                  <Option value="生效中">生效中</Option>
                  <Option value="已停用">已停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="工艺描述"
          >
            <TextArea rows={3} placeholder="请输入工艺描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 工艺路线详情模态框 */}
      <Modal
        title="工艺路线详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
        ]}
      >
        {selectedRoute && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="工艺编码">{selectedRoute.routeCode}</Descriptions.Item>
              <Descriptions.Item label="工艺名称">{selectedRoute.routeName}</Descriptions.Item>
              <Descriptions.Item label="产品编码">{selectedRoute.productCode}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedRoute.productName}</Descriptions.Item>
              <Descriptions.Item label="版本号">{selectedRoute.version}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRoute.status === '生效中' ? 'green' : 'orange'}>
                  {selectedRoute.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="工序数量">{selectedRoute.totalSteps}</Descriptions.Item>
              <Descriptions.Item label="周期时间">{selectedRoute.cycleTime}分钟</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedRoute.creator}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedRoute.createDate}</Descriptions.Item>
            </Descriptions>

            <Divider>工艺流程</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <Card title="工艺步骤" size="small">
                  {renderRouteSteps(selectedRoute.operations)}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="工序详情" size="small">
                  <Table
                    columns={operationColumns}
                    dataSource={selectedRoute.operations}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>

            <Divider>时间分析</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedRoute.operations.reduce((sum, op) => sum + op.standardTime, 0)}
                    </div>
                    <div style={{ color: '#666' }}>总标准工时(分钟)</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedRoute.operations.reduce((sum, op) => sum + op.setupTime, 0)}
                    </div>
                    <div style={{ color: '#666' }}>总准备工时(分钟)</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {selectedRoute.cycleTime}
                    </div>
                    <div style={{ color: '#666' }}>标准周期时间(分钟)</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcessRouting;