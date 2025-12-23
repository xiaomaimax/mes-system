import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Switch, TimePicker, DatePicker, Tabs, Descriptions, Divider, Timeline, Progress } from 'antd';
import { 
  ScheduleOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  SyncOutlined,
  SettingOutlined,
  HistoryOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SyncScheduler = () => {
  const [activeTab, setActiveTab] = useState('schedule-list');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  // 同步调度任务数据
  const scheduleData = [
    {
      key: '1',
      scheduleCode: 'SCH-ERP-001',
      scheduleName: 'ERP生产订单同步',
      interfaceCode: 'ERP-PO-001',
      scheduleType: '定时执行',
      cronExpression: '0 */5 * * * ?',
      nextRunTime: '2024-12-20 10:35:00',
      lastRunTime: '2024-12-20 10:30:00',
      lastRunResult: '成功',
      status: '运行中',
      priority: '高',
      timeout: 300,
      retryCount: 3,
      creator: '张工程师',
      createDate: '2024-01-15'
    },
    {
      key: '2',
      scheduleCode: 'SCH-WMS-001',
      scheduleName: 'WMS库存数据同步',
      interfaceCode: 'WMS-INV-001',
      scheduleType: '定时执行',
      cronExpression: '0 0 */1 * * ?',
      nextRunTime: '2024-12-20 11:00:00',
      lastRunTime: '2024-12-20 10:00:00',
      lastRunResult: '成功',
      status: '运行中',
      priority: '中',
      timeout: 600,
      retryCount: 5,
      creator: '李主管',
      createDate: '2024-02-10'
    },
    {
      key: '3',
      scheduleCode: 'SCH-PLM-001',
      scheduleName: 'PLM工艺数据同步',
      interfaceCode: 'PLM-PROC-001',
      scheduleType: '手动触发',
      cronExpression: '-',
      nextRunTime: '-',
      lastRunTime: '2024-12-20 09:30:00',
      lastRunResult: '失败',
      status: '已停用',
      priority: '低',
      timeout: 1800,
      retryCount: 3,
      creator: '王技术员',
      createDate: '2024-03-05'
    }
  ];

  // 执行历史数据
  const executionHistoryData = [
    {
      key: '1',
      executionTime: '2024-12-20 10:30:00',
      scheduleCode: 'SCH-ERP-001',
      scheduleName: 'ERP生产订单同步',
      duration: 45,
      recordCount: 25,
      result: '成功',
      errorMessage: ''
    },
    {
      key: '2',
      executionTime: '2024-12-20 10:25:00',
      scheduleCode: 'SCH-WMS-001',
      scheduleName: 'WMS库存数据同步',
      duration: 120,
      recordCount: 156,
      result: '成功',
      errorMessage: ''
    },
    {
      key: '3',
      executionTime: '2024-12-20 09:30:00',
      scheduleCode: 'SCH-PLM-001',
      scheduleName: 'PLM工艺数据同步',
      duration: 1800,
      recordCount: 0,
      result: '失败',
      errorMessage: '连接超时'
    }
  ];

  const scheduleColumns = [
    {
      title: '调度编码',
      dataIndex: 'scheduleCode',
      key: 'scheduleCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '调度名称',
      dataIndex: 'scheduleName',
      key: 'scheduleName'
    },
    {
      title: '关联接口',
      dataIndex: 'interfaceCode',
      key: 'interfaceCode'
    },
    {
      title: '调度类型',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      render: (type) => (
        <Tag color={type === '定时执行' ? 'blue' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression'
    },
    {
      title: '下次执行时间',
      dataIndex: 'nextRunTime',
      key: 'nextRunTime'
    },
    {
      title: '最后执行结果',
      dataIndex: 'lastRunResult',
      key: 'lastRunResult',
      render: (result) => (
        <Tag color={result === '成功' ? 'green' : result === '失败' ? 'red' : 'orange'}>
          {result}
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
        <Tag color={status === '运行中' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            size="small" 
            icon={record.status === '运行中' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '运行中' ? '停用' : '启用'}
          </Button>
          <Button type="link" size="small" icon={<ThunderboltOutlined />}>
            立即执行
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

  const historyColumns = [
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 150
    },
    {
      title: '调度名称',
      dataIndex: 'scheduleName',
      key: 'scheduleName'
    },
    {
      title: '执行时长(秒)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '处理记录数',
      dataIndex: 'recordCount',
      key: 'recordCount'
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) => (
        <Tag color={result === '成功' ? 'green' : 'red'}>
          {result}
        </Tag>
      )
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      render: (text) => text || '-'
    }
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      nextRunTime: record.nextRunTime !== '-' ? dayjs(record.nextRunTime) : null
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedSchedule(record);
    setDetailModalVisible(true);
  };

  const handleToggleStatus = (record) => {
    const newStatus = record.status === '运行中' ? '已停用' : '运行中';
    message.success(`调度任务已${newStatus === '运行中' ? '启用' : '停用'}`);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存调度配置:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'schedule-list',
      label: '调度列表',
      icon: <ScheduleOutlined />
    },
    {
      key: 'execution-history',
      label: '执行历史',
      icon: <HistoryOutlined />
    }
  ];

  const renderScheduleList = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索调度任务..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="调度类型" style={{ width: 120 }} allowClear>
            <Option value="定时执行">定时执行</Option>
            <Option value="手动触发">手动触发</Option>
          </Select>
          <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
            <Option value="运行中">运行中</Option>
            <Option value="已停用">已停用</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建调度
          </Button>
        </Space>
      </div>

      <Table
        columns={scheduleColumns}
        dataSource={scheduleData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );

  const renderExecutionHistory = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select placeholder="调度任务" style={{ width: 200 }} allowClear>
            <Option value="SCH-ERP-001">ERP生产订单同步</Option>
            <Option value="SCH-WMS-001">WMS库存数据同步</Option>
            <Option value="SCH-PLM-001">PLM工艺数据同步</Option>
          </Select>
          <Select placeholder="执行结果" style={{ width: 120 }} allowClear>
            <Option value="成功">成功</Option>
            <Option value="失败">失败</Option>
          </Select>
          <RangePicker showTime />
        </Space>
        <Space>
          <Button icon={<SyncOutlined />}>刷新</Button>
        </Space>
      </div>

      <Table
        columns={historyColumns}
        dataSource={executionHistoryData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
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
            children: item.key === 'schedule-list' ? renderScheduleList() : renderExecutionHistory()
          }))}
          size="small"
        />
      </Card>

      {/* 新建/编辑调度模态框 */}
      <Modal
        title={editingRecord ? '编辑调度任务' : '新建调度任务'}
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
                name="scheduleCode"
                label="调度编码"
                rules={[{ required: true, message: '请输入调度编码' }]}
              >
                <Input placeholder="请输入调度编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scheduleName"
                label="调度名称"
                rules={[{ required: true, message: '请输入调度名称' }]}
              >
                <Input placeholder="请输入调度名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="interfaceCode"
                label="关联接口"
                rules={[{ required: true, message: '请选择关联接口' }]}
              >
                <Select placeholder="请选择关联接口">
                  <Option value="ERP-PO-001">ERP-PO-001 - 生产订单接口</Option>
                  <Option value="WMS-INV-001">WMS-INV-001 - 库存同步接口</Option>
                  <Option value="PLM-PROC-001">PLM-PROC-001 - 工艺数据接口</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scheduleType"
                label="调度类型"
                rules={[{ required: true, message: '请选择调度类型' }]}
              >
                <Select placeholder="请选择调度类型">
                  <Option value="定时执行">定时执行</Option>
                  <Option value="手动触发">手动触发</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="cronExpression"
            label="Cron表达式"
            rules={[{ required: true, message: '请输入Cron表达式' }]}
          >
            <Input placeholder="例如: 0 */5 * * * ? (每5分钟执行一次)" />
          </Form.Item>
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
            label="调度描述"
          >
            <Input.TextArea rows={3} placeholder="请输入调度描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 调度详情模态框 */}
      <Modal
        title="调度任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="execute" type="primary" icon={<ThunderboltOutlined />}>
            立即执行
          </Button>
        ]}
      >
        {selectedSchedule && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="调度编码">{selectedSchedule.scheduleCode}</Descriptions.Item>
              <Descriptions.Item label="调度名称">{selectedSchedule.scheduleName}</Descriptions.Item>
              <Descriptions.Item label="关联接口">{selectedSchedule.interfaceCode}</Descriptions.Item>
              <Descriptions.Item label="调度类型">
                <Tag color={selectedSchedule.scheduleType === '定时执行' ? 'blue' : 'orange'}>
                  {selectedSchedule.scheduleType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cron表达式">{selectedSchedule.cronExpression}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={
                  selectedSchedule.priority === '高' ? 'red' : 
                  selectedSchedule.priority === '中' ? 'orange' : 'default'
                }>
                  {selectedSchedule.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="超时时间">{selectedSchedule.timeout}秒</Descriptions.Item>
              <Descriptions.Item label="重试次数">{selectedSchedule.retryCount}次</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedSchedule.status === '运行中' ? 'green' : 'red'}>
                  {selectedSchedule.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedSchedule.creator}</Descriptions.Item>
            </Descriptions>

            <Divider>执行时间信息</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="下次执行时间" size="small">
                  <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                    {selectedSchedule.nextRunTime}
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="最后执行时间" size="small">
                  <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    {selectedSchedule.lastRunTime}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <Tag color={selectedSchedule.lastRunResult === '成功' ? 'green' : 'red'}>
                      {selectedSchedule.lastRunResult}
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider>最近执行历史</Divider>
            <Timeline size="small">
              <Timeline.Item color="green">
                <div>2024-12-20 10:30:00 - 执行成功 (45秒, 25条记录)</div>
              </Timeline.Item>
              <Timeline.Item color="green">
                <div>2024-12-20 10:25:00 - 执行成功 (42秒, 23条记录)</div>
              </Timeline.Item>
              <Timeline.Item color="green">
                <div>2024-12-20 10:20:00 - 执行成功 (38秒, 28条记录)</div>
              </Timeline.Item>
              <Timeline.Item color="red">
                <div>2024-12-20 10:15:00 - 执行失败 (连接超时)</div>
              </Timeline.Item>
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SyncScheduler;