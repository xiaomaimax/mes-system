import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Steps, Descriptions, Divider, Timeline, Upload } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ProcessChangeControl = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedChange, setSelectedChange] = useState(null);
  const [form] = Form.useForm();

  const changeData = [
    {
      key: '1',
      changeCode: 'CHG-001',
      changeName: '注塑温度参数调整',
      routeCode: 'RT-001',
      routeName: '塑料外壳A工艺路线',
      changeType: '参数变更',
      priority: '中',
      status: '待审批',
      reason: '提高产品质量，减少缺陷率',
      impact: '影响注塑工序，需要重新验证',
      applicant: '张工程师',
      applyDate: '2024-01-15',
      approver: '李主管',
      expectedDate: '2024-02-15',
      approvalSteps: [
        { step: 1, name: '技术审查', approver: '王技术员', status: '已通过', date: '2024-01-18' },
        { step: 2, name: '质量评估', approver: '质量部', status: '已通过', date: '2024-01-20' },
        { step: 3, name: '生产确认', approver: '生产部', status: '待审批', date: '' },
        { step: 4, name: '最终审批', approver: '李主管', status: '待审批', date: '' }
      ]
    },
    {
      key: '2',
      changeCode: 'CHG-002',
      changeName: '机加工序增加检验点',
      routeCode: 'RT-003',
      routeName: '机械零件C工艺路线',
      changeType: '流程变更',
      priority: '高',
      status: '已批准',
      reason: '提高产品质量控制',
      impact: '增加检验工序，延长生产周期5分钟',
      applicant: '王技术员',
      applyDate: '2024-01-10',
      approver: '李主管',
      expectedDate: '2024-01-25',
      approvalSteps: [
        { step: 1, name: '技术审查', approver: '赵工程师', status: '已通过', date: '2024-01-12' },
        { step: 2, name: '质量评估', approver: '质量部', status: '已通过', date: '2024-01-15' },
        { step: 3, name: '生产确认', approver: '生产部', status: '已通过', date: '2024-01-18' },
        { step: 4, name: '最终审批', approver: '李主管', status: '已通过', date: '2024-01-20' }
      ]
    },
    {
      key: '3',
      changeCode: 'CHG-003',
      changeName: '表面处理工艺优化',
      routeCode: 'RT-001',
      routeName: '塑料外壳A工艺路线',
      changeType: '工艺优化',
      priority: '低',
      status: '申请中',
      reason: '降低成本，提高效率',
      impact: '需要更换部分设备和材料',
      applicant: '赵工程师',
      applyDate: '2024-01-25',
      approver: '李主管',
      expectedDate: '2024-03-01',
      approvalSteps: [
        { step: 1, name: '技术审查', approver: '王技术员', status: '待审批', date: '' },
        { step: 2, name: '质量评估', approver: '质量部', status: '待审批', date: '' },
        { step: 3, name: '生产确认', approver: '生产部', status: '待审批', date: '' },
        { step: 4, name: '最终审批', approver: '李主管', status: '待审批', date: '' }
      ]
    }
  ];

  const columns = [
    {
      title: '变更编码',
      dataIndex: 'changeCode',
      key: 'changeCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '变更名称',
      dataIndex: 'changeName',
      key: 'changeName'
    },
    {
      title: '工艺路线',
      dataIndex: 'routeName',
      key: 'routeName'
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      key: 'changeType',
      render: (type) => (
        <Tag color={
          type === '参数变更' ? 'blue' : 
          type === '流程变更' ? 'green' : 
          type === '工艺优化' ? 'orange' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === '高' ? 'red' : 
          priority === '中' ? 'orange' : 'default'
        }>
          {priority}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '已批准' ? 'green' : 
          status === '待审批' ? 'blue' : 
          status === '申请中' ? 'orange' : 
          status === '已拒绝' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant'
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate'
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
    setSelectedChange(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存变更申请:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const getStepStatus = (status) => {
    switch (status) {
      case '已通过':
        return 'finish';
      case '待审批':
        return 'process';
      case '已拒绝':
        return 'error';
      default:
        return 'wait';
    }
  };

  const getCurrentStep = (steps) => {
    const currentIndex = steps.findIndex(step => step.status === '待审批');
    return currentIndex >= 0 ? currentIndex : steps.length;
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        safeMessage.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        safeMessage.error(`${info.file.name} 文件上传失败`);
      }
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索变更申请..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="变更类型" style={{ width: 120 }} allowClear>
              <Option value="参数变更">参数变更</Option>
              <Option value="流程变更">流程变更</Option>
              <Option value="工艺优化">工艺优化</Option>
            </Select>
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="申请中">申请中</Option>
              <Option value="待审批">待审批</Option>
              <Option value="已批准">已批准</Option>
              <Option value="已拒绝">已拒绝</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建变更申请
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={changeData}
          pagination={{
            total: changeData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑变更申请模态框 */}
      <Modal
        title={editingRecord ? '编辑变更申请' : '新建变更申请'}
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
                name="changeCode"
                label="变更编码"
                rules={[{ required: true, message: '请输入变更编码' }]}
              >
                <Input placeholder="请输入变更编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="changeName"
                label="变更名称"
                rules={[{ required: true, message: '请输入变更名称' }]}
              >
                <Input placeholder="请输入变更名称" />
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
                name="changeType"
                label="变更类型"
                rules={[{ required: true, message: '请选择变更类型' }]}
              >
                <Select placeholder="请选择变更类型">
                  <Option value="参数变更">参数变更</Option>
                  <Option value="流程变更">流程变更</Option>
                  <Option value="工艺优化">工艺优化</Option>
                  <Option value="设备变更">设备变更</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="高">高</Option>
                  <Option value="中">中</Option>
                  <Option value="低">低</Option>
                </Select>
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
            name="reason"
            label="变更原因"
            rules={[{ required: true, message: '请输入变更原因' }]}
          >
            <TextArea rows={3} placeholder="请详细说明变更原因" />
          </Form.Item>
          <Form.Item
            name="impact"
            label="影响分析"
            rules={[{ required: true, message: '请输入影响分析' }]}
          >
            <TextArea rows={3} placeholder="请分析变更对生产、质量、成本等方面的影响" />
          </Form.Item>
          <Form.Item
            name="attachments"
            label="相关附件"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 变更申请详情模态框 */}
      <Modal
        title="变更申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="approve" type="primary" style={{ backgroundColor: '#52c41a' }}>
            审批通过
          </Button>,
          <Button key="reject" danger>
            审批拒绝
          </Button>
        ]}
      >
        {selectedChange && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="变更编码">{selectedChange.changeCode}</Descriptions.Item>
              <Descriptions.Item label="变更名称">{selectedChange.changeName}</Descriptions.Item>
              <Descriptions.Item label="工艺路线">{selectedChange.routeName}</Descriptions.Item>
              <Descriptions.Item label="变更类型">
                <Tag color={
                  selectedChange.changeType === '参数变更' ? 'blue' : 
                  selectedChange.changeType === '流程变更' ? 'green' : 'orange'
                }>
                  {selectedChange.changeType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={
                  selectedChange.priority === '高' ? 'red' : 
                  selectedChange.priority === '中' ? 'orange' : 'default'
                }>
                  {selectedChange.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  selectedChange.status === '已批准' ? 'green' : 
                  selectedChange.status === '待审批' ? 'blue' : 'orange'
                }>
                  {selectedChange.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedChange.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedChange.applyDate}</Descriptions.Item>
              <Descriptions.Item label="预期完成">{selectedChange.expectedDate}</Descriptions.Item>
              <Descriptions.Item label="最终审批人">{selectedChange.approver}</Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card title="变更原因" size="small">
                  <p>{selectedChange.reason}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="影响分析" size="small">
                  <p>{selectedChange.impact}</p>
                </Card>
              </Col>
            </Row>

            <Divider>审批流程</Divider>
            <Row gutter={24}>
              <Col span={14}>
                <Card title="审批步骤" size="small">
                  <Steps
                    direction="vertical"
                    size="small"
                    current={getCurrentStep(selectedChange.approvalSteps)}
                    items={selectedChange.approvalSteps.map((step, index) => ({
                      title: `步骤${step.step}: ${step.name}`,
                      description: (
                        <div>
                          <div>审批人: {step.approver}</div>
                          {step.date && <div>审批时间: {step.date}</div>}
                        </div>
                      ),
                      status: getStepStatus(step.status),
                      icon: step.status === '已通过' ? <CheckCircleOutlined /> : 
                            step.status === '待审批' ? <ClockCircleOutlined /> : 
                            step.status === '已拒绝' ? <ExclamationCircleOutlined /> : 
                            <ClockCircleOutlined />
                    }))}
                  />
                </Card>
              </Col>
              <Col span={10}>
                <Card title="审批记录" size="small">
                  <Timeline>
                    {selectedChange.approvalSteps
                      .filter(step => step.status === '已通过')
                      .map((step, index) => (
                        <Timeline.Item key={index} color="green">
                          <div style={{ fontWeight: 'bold' }}>{step.name} - 已通过</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            审批人: {step.approver}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            审批时间: {step.date}
                          </div>
                        </Timeline.Item>
                      ))}
                    {selectedChange.approvalSteps
                      .filter(step => step.status === '待审批')
                      .slice(0, 1)
                      .map((step, index) => (
                        <Timeline.Item key={index} color="blue">
                          <div style={{ fontWeight: 'bold' }}>{step.name} - 待审批</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            审批人: {step.approver}
                          </div>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>

            <Divider>相关附件</Divider>
            <Card size="small">
              <Space>
                <Button icon={<FileTextOutlined />} size="small">
                  变更申请表.pdf
                </Button>
                <Button icon={<FileTextOutlined />} size="small">
                  影响分析报告.docx
                </Button>
                <Button icon={<FileTextOutlined />} size="small">
                  工艺参数对比表.xlsx
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcessChangeControl;