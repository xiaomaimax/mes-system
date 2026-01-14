import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Statistic, Progress, Timeline, Descriptions } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExperimentOutlined, TrophyOutlined, RiseOutlined, FallOutlined, LineChartOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;

const ProcessOptimization = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [form] = Form.useForm();

  const optimizationData = [
    {
      key: '1',
      projectCode: 'OPT-001',
      projectName: '注塑成型周期时间优化',
      productCode: 'P001',
      productName: '塑料外壳A',
      type: '效率提升',
      status: '进行中',
      priority: '高',
      currentValue: 45,
      targetValue: 38,
      improvement: 15.6,
      startDate: '2024-01-15',
      expectedDate: '2024-03-15',
      responsible: '张工程师',
      description: '通过优化注塑参数和模具设计，减少成型周期时间'
    },
    {
      key: '2',
      projectCode: 'OPT-002',
      projectName: '机加工精度提升项目',
      productCode: 'P003',
      productName: '机械零件C',
      type: '质量改善',
      status: '已完成',
      priority: '中',
      currentValue: 0.05,
      targetValue: 0.02,
      improvement: 60.0,
      startDate: '2024-02-01',
      expectedDate: '2024-02-28',
      responsible: '王技术员',
      description: '通过工艺参数优化，提高机加工精度'
    },
    {
      key: '3',
      projectCode: 'OPT-003',
      projectName: '表面处理成本降低',
      productCode: 'P001',
      productName: '塑料外壳A',
      type: '成本降低',
      status: '计划中',
      priority: '低',
      currentValue: 2.5,
      targetValue: 2.0,
      improvement: 20.0,
      startDate: '2024-04-01',
      expectedDate: '2024-06-01',
      responsible: '李主管',
      description: '优化表面处理工艺，降低材料和能源消耗'
    }
  ];

  const columns = [
    {
      title: '项目编码',
      dataIndex: 'projectCode',
      key: 'projectCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '优化项目',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '关联产品',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '优化类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={
          type === '效率提升' ? 'blue' : 
          type === '质量改善' ? 'green' : 
          type === '成本降低' ? 'orange' : 'default'
        }>
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
          status === '进行中' ? 'blue' : 
          status === '计划中' ? 'orange' : 'red'
        }>
          {status}
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
      title: '预期改善',
      dataIndex: 'improvement',
      key: 'improvement',
      render: (improvement) => (
        <span style={{ color: '#52c41a' }}>
          <RiseOutlined /> {improvement}%
        </span>
      )
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible'
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
    setSelectedOptimization(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存优化项目:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 统计数据
  const stats = {
    totalProjects: optimizationData.length,
    completedProjects: optimizationData.filter(item => item.status === '已完成').length,
    ongoingProjects: optimizationData.filter(item => item.status === '进行中').length,
    avgImprovement: Math.round(optimizationData.reduce((sum, item) => sum + item.improvement, 0) / optimizationData.length)
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="优化项目总数"
              value={stats.totalProjects}
              prefix={<ExperimentOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成项目"
              value={stats.completedProjects}
              prefix={<TrophyOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={Math.round((stats.completedProjects / stats.totalProjects) * 100)} 
              size="small" 
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={stats.ongoingProjects}
              prefix={<LineChartOutlined />}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress 
              percent={Math.round((stats.ongoingProjects / stats.totalProjects) * 100)} 
              size="small" 
              strokeColor="#fa8c16"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均改善幅度"
              value={stats.avgImprovement}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索优化项目..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="优化类型" style={{ width: 120 }} allowClear>
              <Option value="效率提升">效率提升</Option>
              <Option value="质量改善">质量改善</Option>
              <Option value="成本降低">成本降低</Option>
            </Select>
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="计划中">计划中</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已暂停">已暂停</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建优化项目
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={optimizationData}
          pagination={{
            total: optimizationData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新建/编辑优化项目模态框 */}
      <Modal
        title={editingRecord ? '编辑优化项目' : '新建优化项目'}
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
                name="projectCode"
                label="项目编码"
                rules={[{ required: true, message: '请输入项目编码' }]}
              >
                <Input placeholder="请输入项目编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productCode"
                label="关联产品"
                rules={[{ required: true, message: '请选择关联产品' }]}
              >
                <Select placeholder="请选择关联产品">
                  <Option value="P001">P001 - 塑料外壳A</Option>
                  <Option value="P002">P002 - 电子组件B</Option>
                  <Option value="P003">P003 - 机械零件C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="优化类型"
                rules={[{ required: true, message: '请选择优化类型' }]}
              >
                <Select placeholder="请选择优化类型">
                  <Option value="效率提升">效率提升</Option>
                  <Option value="质量改善">质量改善</Option>
                  <Option value="成本降低">成本降低</Option>
                  <Option value="安全改善">安全改善</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="currentValue"
                label="当前值"
                rules={[{ required: true, message: '请输入当前值' }]}
              >
                <Input placeholder="请输入当前值" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="targetValue"
                label="目标值"
                rules={[{ required: true, message: '请输入目标值' }]}
              >
                <Input placeholder="请输入目标值" />
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
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 优化项目详情模态框 */}
      <Modal
        title="优化项目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button onClick={() => handleEdit(record)} key="edit" type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
        ]}
      >
        {selectedOptimization && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="项目编码">{selectedOptimization.projectCode}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{selectedOptimization.projectName}</Descriptions.Item>
              <Descriptions.Item label="关联产品">{selectedOptimization.productName}</Descriptions.Item>
              <Descriptions.Item label="优化类型">
                <Tag color={
                  selectedOptimization.type === '效率提升' ? 'blue' : 
                  selectedOptimization.type === '质量改善' ? 'green' : 'orange'
                }>
                  {selectedOptimization.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  selectedOptimization.status === '已完成' ? 'green' : 
                  selectedOptimization.status === '进行中' ? 'blue' : 'orange'
                }>
                  {selectedOptimization.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={
                  selectedOptimization.priority === '高' ? 'red' : 
                  selectedOptimization.priority === '中' ? 'orange' : 'default'
                }>
                  {selectedOptimization.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedOptimization.responsible}</Descriptions.Item>
              <Descriptions.Item label="开始日期">{selectedOptimization.startDate}</Descriptions.Item>
              <Descriptions.Item label="预期完成">{selectedOptimization.expectedDate}</Descriptions.Item>
              <Descriptions.Item label="项目描述" span={2}>
                {selectedOptimization.description}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {selectedOptimization.currentValue}
                    </div>
                    <div style={{ color: '#666' }}>当前值</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedOptimization.targetValue}
                    </div>
                    <div style={{ color: '#666' }}>目标值</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedOptimization.improvement}%
                    </div>
                    <div style={{ color: '#666' }}>预期改善</div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="项目进展" size="small">
              <Timeline>
                <Timeline.Item color="green">
                  <div>项目启动</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{selectedOptimization.startDate}</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <div>需求分析完成</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>分析当前工艺状况和改善点</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <div>方案设计</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>制定优化方案和实施计划</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <div>方案实施中</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>正在执行优化措施</div>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <div>效果验证</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>验证优化效果</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcessOptimization;