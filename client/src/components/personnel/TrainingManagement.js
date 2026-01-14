import { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, DatePicker, Modal, Tag, Progress, Tabs, List, Avatar } from 'antd';

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
import {   BookOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const TrainingManagement = () => {
  const [activeTab, setActiveTab] = useState('training-plans');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 培训计划数据
  const trainingPlans = [
    {
      key: '1',
      planId: 'TRAIN001',
      planName: 'PLC编程基础培训',
      category: '技术培训',
      instructor: '陈工程师',
      department: '技术部',
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      duration: 24,
      maxParticipants: 20,
      currentParticipants: 15,
      status: '报名中',
      cost: 5000,
      description: 'PLC编程基础知识和实操培训'
    },
    {
      key: '2',
      planId: 'TRAIN002',
      planName: '质量管理体系培训',
      category: '质量培训',
      instructor: '李经理',
      department: '质量部',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      duration: 16,
      maxParticipants: 25,
      currentParticipants: 22,
      status: '进行中',
      cost: 3000,
      description: 'ISO9001质量管理体系培训'
    },
    {
      key: '3',
      planId: 'TRAIN003',
      planName: '安全生产培训',
      category: '安全培训',
      instructor: '王主管',
      department: '生产部',
      startDate: '2024-12-15',
      endDate: '2024-12-16',
      duration: 8,
      maxParticipants: 50,
      currentParticipants: 45,
      status: '已完成',
      cost: 2000,
      description: '生产安全规范和应急处理培训'
    }
  ];

  // 培训记录数据
  const trainingRecords = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      planName: '安全生产培训',
      startDate: '2024-12-15',
      endDate: '2024-12-16',
      attendance: '100%',
      score: 95,
      status: '通过',
      certificate: '是'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      planName: '质量管理体系培训',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      attendance: '90%',
      score: 88,
      status: '进行中',
      certificate: '否'
    },
    {
      key: '3',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      planName: 'PLC编程基础培训',
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      attendance: '-',
      score: 0,
      status: '已报名',
      certificate: '否'
    }
  ];

  const planColumns = [
    {
      title: '培训编号',
      dataIndex: 'planId',
      key: 'planId',
      width: 100
    },
    {
      title: '培训名称',
      dataIndex: 'planName',
      key: 'planName',
      render: (text) => (
        <Space>
          <BookOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '培训类别',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={
          category === '技术培训' ? 'blue' : 
          category === '质量培训' ? 'green' : 
          category === '安全培训' ? 'red' : 'orange'
        }>
          {category}
        </Tag>
      )
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor'
    },
    {
      title: '负责部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '培训时间',
      key: 'trainingTime',
      render: (_, record) => (
        <div>
          <div>{record.startDate}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>至 {record.endDate}</div>
        </div>
      )
    },
    {
      title: '时长(小时)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '报名情况',
      key: 'participants',
      render: (_, record) => (
        <div>
          <Progress 
            percent={(record.currentParticipants / record.maxParticipants * 100).toFixed(0)} 
            size="small" 
          />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {record.currentParticipants}/{record.maxParticipants}人
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '报名中': 'blue',
          '进行中': 'orange',
          '已完成': 'green',
          '已取消': 'red'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: '费用(元)',
      dataIndex: 'cost',
      key: 'cost'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<UserOutlined />}>
            学员
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const recordColumns = [
    {
      title: '员工编号',
      dataIndex: 'employeeId',
      key: 'employeeId'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '培训项目',
      dataIndex: 'planName',
      key: 'planName'
    },
    {
      title: '培训时间',
      key: 'trainingTime',
      render: (_, record) => `${record.startDate} 至 ${record.endDate}`
    },
    {
      title: '出勤率',
      dataIndex: 'attendance',
      key: 'attendance'
    },
    {
      title: '考试成绩',
      dataIndex: 'score',
      key: 'score',
      render: (score) => score > 0 ? score : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '通过': 'green',
          '不通过': 'red',
          '进行中': 'orange',
          '已报名': 'blue'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: '证书',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (cert) => (
        <Tag color={cert === '是' ? 'green' : 'default'}>
          {cert}
        </Tag>
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
      console.log('保存培训计划:', values);
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'training-plans',
      label: '培训计划',
      icon: <CalendarOutlined />
    },
    {
      key: 'training-records',
      label: '培训记录',
      icon: <CheckCircleOutlined />
    },
    {
      key: 'training-stats',
      label: '培训统计',
      icon: <TrophyOutlined />
    }
  ];

  const renderTrainingPlans = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索培训名称..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="培训类别" style={{ width: 120 }} allowClear>
            <Option value="技术培训">技术培训</Option>
            <Option value="质量培训">质量培训</Option>
            <Option value="安全培训">安全培训</Option>
            <Option value="管理培训">管理培训</Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            <Option value="报名中">报名中</Option>
            <Option value="进行中">进行中</Option>
            <Option value="已完成">已完成</Option>
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建培训计划
        </Button>
      </div>

      <Table
        columns={planColumns}
        dataSource={trainingPlans}
        pagination={{
          total: trainingPlans.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );

  const renderTrainingRecords = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索员工姓名..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="部门" style={{ width: 120 }} allowClear>
            <Option value="生产部">生产部</Option>
            <Option value="质量部">质量部</Option>
            <Option value="设备部">设备部</Option>
            <Option value="技术部">技术部</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
        </Space>
      </div>

      <Table
        columns={recordColumns}
        dataSource={trainingRecords}
        pagination={{
          total: trainingRecords.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );

  const renderTrainingStats = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="培训完成情况" style={{ marginBottom: '16px' }}>
          <List
            itemLayout="horizontal"
            dataSource={[
              { name: '技术培训', completed: 45, total: 50, rate: 90 },
              { name: '质量培训', completed: 38, total: 40, rate: 95 },
              { name: '安全培训', completed: 156, total: 156, rate: 100 },
              { name: '管理培训', completed: 12, total: 15, rate: 80 }
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<BookOutlined />} />}
                  title={item.name}
                  description={
                    <div>
                      <Progress percent={item.rate} size="small" />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {item.completed}/{item.total}人完成
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="部门培训统计" style={{ marginBottom: '16px' }}>
          <List
            itemLayout="horizontal"
            dataSource={[
              { dept: '生产部', trainings: 8, hours: 64, avgScore: 92 },
              { dept: '质量部', trainings: 6, hours: 48, avgScore: 95 },
              { dept: '设备部', trainings: 5, hours: 40, avgScore: 88 },
              { dept: '技术部', trainings: 10, hours: 80, avgScore: 96 }
            ]}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.dept}
                  description={
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>培训项目: {item.trainings}个</div>
                      <div>培训时长: {item.hours}小时</div>
                      <div>平均成绩: {item.avgScore}分</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: 
              item.key === 'training-plans' ? renderTrainingPlans() :
              item.key === 'training-records' ? renderTrainingRecords() :
              renderTrainingStats()
          }))}
          size="small"
        />
      </Card>

      {/* 新增/编辑培训计划模态框 */}
      <Modal
        title={editingRecord ? '编辑培训计划' : '新建培训计划'}
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
                name="planId"
                label="培训编号"
                rules={[{ required: true, message: '请输入培训编号' }]}
              >
                <Input placeholder="请输入培训编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="planName"
                label="培训名称"
                rules={[{ required: true, message: '请输入培训名称' }]}
              >
                <Input placeholder="请输入培训名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="培训类别"
                rules={[{ required: true, message: '请选择培训类别' }]}
              >
                <Select placeholder="请选择培训类别">
                  <Option value="技术培训">技术培训</Option>
                  <Option value="质量培训">质量培训</Option>
                  <Option value="安全培训">安全培训</Option>
                  <Option value="管理培训">管理培训</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="instructor"
                label="培训讲师"
                rules={[{ required: true, message: '请输入培训讲师' }]}
              >
                <Input placeholder="请输入培训讲师" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="department"
                label="负责部门"
                rules={[{ required: true, message: '请选择负责部门' }]}
              >
                <Select placeholder="请选择负责部门">
                  <Option value="生产部">生产部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="设备部">设备部</Option>
                  <Option value="技术部">技术部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trainingTime"
                label="培训时间"
                rules={[{ required: true, message: '请选择培训时间' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="duration"
                label="培训时长(小时)"
                rules={[{ required: true, message: '请输入培训时长' }]}
              >
                <Input type="number" placeholder="请输入培训时长" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="maxParticipants"
                label="最大人数"
                rules={[{ required: true, message: '请输入最大人数' }]}
              >
                <Input type="number" placeholder="请输入最大人数" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cost"
            label="培训费用(元)"
            rules={[{ required: true, message: '请输入培训费用' }]}
          >
            <Input type="number" placeholder="请输入培训费用" />
          </Form.Item>

          <Form.Item
            name="description"
            label="培训内容"
            rules={[{ required: true, message: '请输入培训内容' }]}
          >
            <TextArea rows={4} placeholder="请输入培训内容描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingManagement;