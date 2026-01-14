import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Steps, Descriptions, Divider, Timeline, Progress } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ProcessValidation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [form] = Form.useForm();

  const validationData = [
    {
      key: '1',
      validationCode: 'VAL-001',
      validationName: '塑料外壳A工艺验证',
      routeCode: 'RT-001',
      routeName: '塑料外壳A工艺路线',
      type: '新工艺验证',
      status: '验证中',
      progress: 75,
      startDate: '2024-01-20',
      expectedDate: '2024-02-20',
      responsible: '张工程师',
      validator: '李主管',
      validationSteps: [
        { step: 1, name: '工艺文件审查', status: '已完成', date: '2024-01-22' },
        { step: 2, name: '设备能力确认', status: '已完成', date: '2024-01-25' },
        { step: 3, name: '试生产验证', status: '进行中', date: '' },
        { step: 4, name: '质量确认', status: '待开始', date: '' },
        { step: 5, name: '最终审批', status: '待开始', date: '' }
      ]
    },
    {
      key: '2',
      validationCode: 'VAL-002',
      validationName: '电子组件B工艺验证',
      routeCode: 'RT-002',
      routeName: '电子组件B工艺路线',
      type: '工艺变更验证',
      status: '待开始',
      progress: 0,
      startDate: '2024-02-01',
      expectedDate: '2024-03-01',
      responsible: '王技术员',
      validator: '李主管',
      validationSteps: [
        { step: 1, name: '变更影响分析', status: '待开始', date: '' },
        { step: 2, name: '风险评估', status: '待开始', date: '' },
        { step: 3, name: '试验验证', status: '待开始', date: '' },
        { step: 4, name: '数据分析', status: '待开始', date: '' },
        { step: 5, name: '验证报告', status: '待开始', date: '' }
      ]
    },
    {
      key: '3',
      validationCode: 'VAL-003',
      validationName: '机械零件C工艺验证',
      routeCode: 'RT-003',
      routeName: '机械零件C工艺路线',
      type: '新工艺验证',
      status: '已完成',
      progress: 100,
      startDate: '2024-01-01',
      expectedDate: '2024-01-31',
      responsible: '赵工程师',
      validator: '李主管',
      validationSteps: [
        { step: 1, name: '工艺文件审查', status: '已完成', date: '2024-01-03' },
        { step: 2, name: '设备能力确认', status: '已完成', date: '2024-01-08' },
        { step: 3, name: '试生产验证', status: '已完成', date: '2024-01-20' },
        { step: 4, name: '质量确认', status: '已完成', date: '2024-01-28' },
        { step: 5, name: '最终审批', status: '已完成', date: '2024-01-31' }
      ]
    }
  ];

  const columns = [
    {
      title: '验证编码',
      dataIndex: 'validationCode',
      key: 'validationCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '验证名称',
      dataIndex: 'validationName',
      key: 'validationName'
    },
    {
      title: '工艺路线',
      dataIndex: 'routeName',
      key: 'routeName'
    },
    {
      title: '验证类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === '新工艺验证' ? 'blue' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '已完成' ? 'green' : 
          status === '验证中' ? 'blue' : 
          status === '待开始' ? 'orange' : 'red'
        }>
          {status}
        </Tag>
      )
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
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible'
    },
    {
      title: '验证人',
      dataIndex: 'validator',
      key: 'validator'
    },
    {
      title: '预期完成',
      dataIndex: 'expectedDate',
      key: 'expectedDate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
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
    setSelectedValidation(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存工艺验证:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const getStepStatus = (status) => {
    switch (status) {
      case '已完成':
        return 'finish';
      case '进行中':
        return 'process';
      case '待开始':
        return 'wait';
      default:
        return 'wait';
    }
  };

  const getCurrentStep = (steps) => {
    const currentIndex = steps.findIndex(step => step.status === '进行中');
    return currentIndex >= 0 ? currentIndex : steps.findIndex(step => step.status === '待开始');
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索工艺验证..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="验证类型" style={{ width: 140 }} allowClear>
              <Option value="新工艺验证">新工艺验证</Option>
              <Option value="工艺变更验证">工艺变更验证</Option>
              <Option value="定期验证">定期验证</Option>
            </Select>
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="待开始">待开始</Option>
              <Option value="验证中">验证中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已暂停">已暂停</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建验证
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={validationData}
          pagination={{
            total: validationData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑工艺验证模态框 */}
      <Modal
        title={editingRecord ? '编辑工艺验证' : '新建工艺验证'}
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
                name="validationCode"
                label="验证编码"
                rules={[{ required: true, message: '请输入验证编码' }]}
              >
                <Input placeholder="请输入验证编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="validationName"
                label="验证名称"
                rules={[{ required: true, message: '请输入验证名称' }]}
              >
                <Input placeholder="请输入验证名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="routeCode"
                label="工艺路线"
                rules={[{ required: true, message: '请选择工艺路线' }]}
              >
                <Select placeholder="请选择工艺路线">
                  <Option value="RT-001">RT-001 - 塑料外壳A工艺路线</Option>
                  <Option value="RT-002">RT-002 - 电子组件B工艺路线</Option>
                  <Option value="RT-003">RT-003 - 机械零件C工艺路线</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="验证类型"
                rules={[{ required: true, message: '请选择验证类型' }]}
              >
                <Select placeholder="请选择验证类型">
                  <Option value="新工艺验证">新工艺验证</Option>
                  <Option value="工艺变更验证">工艺变更验证</Option>
                  <Option value="定期验证">定期验证</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="responsible"
                label="负责人"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="validator"
                label="验证人"
                rules={[{ required: true, message: '请输入验证人' }]}
              >
                <Input placeholder="请输入验证人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedDate"
                label="预期完成日期"
                rules={[{ required: true, message: '请选择预期完成日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="验证描述"
          >
            <TextArea rows={3} placeholder="请输入验证描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 工艺验证详情模态框 */}
      <Modal
        title="工艺验证详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button onClick={() => handleEdit(record)} key="edit" type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
        ]}
      >
        {selectedValidation && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="验证编码">{selectedValidation.validationCode}</Descriptions.Item>
              <Descriptions.Item label="验证名称">{selectedValidation.validationName}</Descriptions.Item>
              <Descriptions.Item label="工艺路线">{selectedValidation.routeName}</Descriptions.Item>
              <Descriptions.Item label="验证类型">
                <Tag color={selectedValidation.type === '新工艺验证' ? 'blue' : 'orange'}>
                  {selectedValidation.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  selectedValidation.status === '已完成' ? 'green' : 
                  selectedValidation.status === '验证中' ? 'blue' : 'orange'
                }>
                  {selectedValidation.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedValidation.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedValidation.responsible}</Descriptions.Item>
              <Descriptions.Item label="验证人">{selectedValidation.validator}</Descriptions.Item>
              <Descriptions.Item label="开始日期">{selectedValidation.startDate}</Descriptions.Item>
              <Descriptions.Item label="预期完成">{selectedValidation.expectedDate}</Descriptions.Item>
            </Descriptions>

            <Divider>验证流程</Divider>
            <Row gutter={24}>
              <Col span={14}>
                <Card title="验证步骤" size="small">
                  <Steps
                    direction="vertical"
                    size="small"
                    current={getCurrentStep(selectedValidation.validationSteps)}
                    items={selectedValidation.validationSteps.map((step, index) => ({
                      title: `步骤${step.step}: ${step.name}`,
                      description: step.date ? `完成时间: ${step.date}` : '未开始',
                      status: getStepStatus(step.status),
                      icon: step.status === '已完成' ? <CheckCircleOutlined /> : 
                            step.status === '进行中' ? <PlayCircleOutlined /> : 
                            <ClockCircleOutlined />
                    }))}
                  />
                </Card>
              </Col>
              <Col span={10}>
                <Card title="验证进展" size="small">
                  <Timeline>
                    {selectedValidation.validationSteps
                      .filter(step => step.status === '已完成')
                      .map((step, index) => (
                        <Timeline.Item key={index} color="green">
                          <div style={{ fontWeight: 'bold' }}>{step.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            完成时间: {step.date}
                          </div>
                        </Timeline.Item>
                      ))}
                    {selectedValidation.validationSteps
                      .filter(step => step.status === '进行中')
                      .map((step, index) => (
                        <Timeline.Item key={index} color="blue">
                          <div style={{ fontWeight: 'bold' }}>{step.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            正在进行中...
                          </div>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>

            <Divider>验证统计</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedValidation.validationSteps.filter(step => step.status === '已完成').length}
                    </div>
                    <div style={{ color: '#666' }}>已完成步骤</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedValidation.validationSteps.filter(step => step.status === '进行中').length}
                    </div>
                    <div style={{ color: '#666' }}>进行中步骤</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {selectedValidation.validationSteps.filter(step => step.status === '待开始').length}
                    </div>
                    <div style={{ color: '#666' }}>待开始步骤</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {selectedValidation.progress}%
                    </div>
                    <div style={{ color: '#666' }}>总体进度</div>
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

export default ProcessValidation;