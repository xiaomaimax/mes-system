import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Steps, Tag, message, Row, Col, Descriptions, Divider, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookOutlined, PlayCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ProcessSOP = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [form] = Form.useForm();

  const sopData = [
    {
      key: '1',
      sopCode: 'SOP-001',
      sopName: '注塑成型作业指导书',
      operationCode: 'OP001',
      operationName: '注塑成型',
      version: 'V2.1',
      status: '生效',
      createDate: '2024-01-15',
      creator: '张工程师',
      approver: '李主管',
      steps: [
        { seq: 1, title: '设备检查', content: '检查注塑机运行状态，确认设备正常', duration: 5, safety: '注意设备安全' },
        { seq: 2, title: '模具安装', content: '按照标准程序安装模具，调整参数', duration: 15, safety: '佩戴防护用品' },
        { seq: 3, title: '材料准备', content: '准备ABS塑料粒子，检查材料质量', duration: 10, safety: '避免材料污染' },
        { seq: 4, title: '参数设置', content: '设置注射温度220°C，压力80MPa', duration: 5, safety: '严格按参数执行' },
        { seq: 5, title: '试模调试', content: '进行试模，检查产品质量', duration: 20, safety: '注意高温安全' }
      ]
    },
    {
      key: '2',
      sopCode: 'SOP-002',
      sopName: '机械加工作业指导书',
      operationCode: 'OP011',
      operationName: '粗加工',
      version: 'V1.3',
      status: '生效',
      createDate: '2024-02-10',
      creator: '王技术员',
      approver: '李主管',
      steps: [
        { seq: 1, title: '工件装夹', content: '将工件正确装夹在机床上', duration: 8, safety: '确保装夹牢固' },
        { seq: 2, title: '刀具选择', content: '选择合适的切削刀具', duration: 5, safety: '检查刀具完好' },
        { seq: 3, title: '参数设置', content: '设置主轴转速1200rpm', duration: 3, safety: '严格按参数执行' },
        { seq: 4, title: '开始加工', content: '启动机床进行粗加工', duration: 45, safety: '注意切削安全' }
      ]
    }
  ];

  const columns = [
    {
      title: 'SOP编码',
      dataIndex: 'sopCode',
      key: 'sopCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: 'SOP名称',
      dataIndex: 'sopName',
      key: 'sopName'
    },
    {
      title: '关联工序',
      dataIndex: 'operationName',
      key: 'operationName'
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
        <Tag color={status === '生效' ? 'green' : status === '待审核' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    },
    {
      title: '审批人',
      dataIndex: 'approver',
      key: 'approver'
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
    setSelectedSOP(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存SOP:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const renderSOPSteps = (steps) => {
    return (
      <Steps
        direction="vertical"
        size="small"
        current={-1}
        items={steps.map((step, index) => ({
          title: `步骤${step.seq}: ${step.title}`,
          description: (
            <div>
              <div style={{ marginBottom: '8px' }}>{step.content}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <span>预计时间: {step.duration}分钟</span>
                <Divider type="vertical" />
                <span style={{ color: '#fa8c16' }}>安全提示: {step.safety}</span>
              </div>
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
              placeholder="搜索作业指导书..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="生效">生效</Option>
              <Option value="待审核">待审核</Option>
              <Option value="已停用">已停用</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建SOP
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={sopData}
          pagination={{
            total: sopData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑SOP模态框 */}
      <Modal
        title={editingRecord ? '编辑作业指导书' : '新建作业指导书'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sopCode"
                label="SOP编码"
                rules={[{ required: true, message: '请输入SOP编码' }]}
              >
                <Input placeholder="请输入SOP编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sopName"
                label="SOP名称"
                rules={[{ required: true, message: '请输入SOP名称' }]}
              >
                <Input placeholder="请输入SOP名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operationCode"
                label="关联工序"
                rules={[{ required: true, message: '请选择关联工序' }]}
              >
                <Select placeholder="请选择关联工序">
                  <Option value="OP001">OP001 - 注塑成型</Option>
                  <Option value="OP002">OP002 - 机械加工</Option>
                  <Option value="OP003">OP003 - 表面处理</Option>
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
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="草稿">草稿</Option>
              <Option value="待审核">待审核</Option>
              <Option value="生效">生效</Option>
              <Option value="已停用">已停用</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="SOP描述"
          >
            <TextArea rows={3} placeholder="请输入SOP描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* SOP详情模态框 */}
      <Modal
        title="作业指导书详情"
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
        {selectedSOP && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="SOP编码">{selectedSOP.sopCode}</Descriptions.Item>
              <Descriptions.Item label="SOP名称">{selectedSOP.sopName}</Descriptions.Item>
              <Descriptions.Item label="关联工序">{selectedSOP.operationName}</Descriptions.Item>
              <Descriptions.Item label="版本号">{selectedSOP.version}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedSOP.status === '生效' ? 'green' : 'orange'}>
                  {selectedSOP.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedSOP.creator}</Descriptions.Item>
              <Descriptions.Item label="审批人">{selectedSOP.approver}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedSOP.createDate}</Descriptions.Item>
            </Descriptions>

            <Divider>作业步骤</Divider>
            <Row gutter={24}>
              <Col span={14}>
                <Card title="操作步骤" size="small">
                  {renderSOPSteps(selectedSOP.steps)}
                </Card>
              </Col>
              <Col span={10}>
                <Card title="步骤汇总" size="small">
                  <List
                    size="small"
                    dataSource={selectedSOP.steps}
                    renderItem={(step, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar size="small">{step.seq}</Avatar>}
                          title={step.title}
                          description={
                            <div>
                              <div style={{ fontSize: '12px' }}>时间: {step.duration}分钟</div>
                              <div style={{ fontSize: '12px', color: '#fa8c16' }}>
                                <ExclamationCircleOutlined /> {step.safety}
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

            <Divider>时间统计</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedSOP.steps.reduce((sum, step) => sum + step.duration, 0)}
                    </div>
                    <div style={{ color: '#666' }}>总操作时间(分钟)</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedSOP.steps.length}
                    </div>
                    <div style={{ color: '#666' }}>操作步骤数</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {Math.round(selectedSOP.steps.reduce((sum, step) => sum + step.duration, 0) / selectedSOP.steps.length)}
                    </div>
                    <div style={{ color: '#666' }}>平均步骤时间(分钟)</div>
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

export default ProcessSOP;