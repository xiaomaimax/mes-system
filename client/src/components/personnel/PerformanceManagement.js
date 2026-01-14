import { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, DatePicker, Modal, Tag, Progress, Rate, Statistic } from 'antd';
import {   TrophyOutlined, 
  EditOutlined, 
  EyeOutlined, 
  PlusOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { MonthPicker } = DatePicker;

const PerformanceManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // 绩效数据
  const performanceData = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      position: '生产主管',
      period: '2024-11',
      workQuality: 95,
      workEfficiency: 92,
      teamwork: 88,
      innovation: 85,
      totalScore: 90,
      rating: '优秀',
      bonus: 2000,
      status: '已确认'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      position: '质检员',
      period: '2024-11',
      workQuality: 88,
      workEfficiency: 85,
      teamwork: 90,
      innovation: 75,
      totalScore: 84.5,
      rating: '良好',
      bonus: 1500,
      status: '已确认'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      department: '设备部',
      position: '维修工程师',
      period: '2024-11',
      workQuality: 92,
      workEfficiency: 88,
      teamwork: 85,
      innovation: 90,
      totalScore: 88.75,
      rating: '优秀',
      bonus: 1800,
      status: '待确认'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      position: '工艺工程师',
      period: '2024-11',
      workQuality: 96,
      workEfficiency: 94,
      teamwork: 92,
      innovation: 95,
      totalScore: 94.25,
      rating: '卓越',
      bonus: 3000,
      status: '已确认'
    },
    {
      key: '5',
      employeeId: 'EMP005',
      name: '孙七',
      department: '生产部',
      position: '操作员',
      period: '2024-11',
      workQuality: 78,
      workEfficiency: 80,
      teamwork: 82,
      innovation: 70,
      totalScore: 77.5,
      rating: '合格',
      bonus: 800,
      status: '已确认'
    }
  ];

  const columns = [
    {
      title: '员工编号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Tag color={
          dept === '生产部' ? 'blue' : 
          dept === '质量部' ? 'green' : 
          dept === '设备部' ? 'orange' : 'purple'
        }>
          {dept}
        </Tag>
      )
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '考核期间',
      dataIndex: 'period',
      key: 'period'
    },
    {
      title: '工作质量',
      dataIndex: 'workQuality',
      key: 'workQuality',
      render: (score) => (
        <div>
          <Progress percent={score} size="small" />
          <span style={{ fontSize: '12px' }}>{score}分</span>
        </div>
      )
    },
    {
      title: '工作效率',
      dataIndex: 'workEfficiency',
      key: 'workEfficiency',
      render: (score) => (
        <div>
          <Progress percent={score} size="small" strokeColor="#52c41a" />
          <span style={{ fontSize: '12px' }}>{score}分</span>
        </div>
      )
    },
    {
      title: '综合得分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (score) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {score}分
        </div>
      )
    },
    {
      title: '绩效等级',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const colorMap = {
          '卓越': 'gold',
          '优秀': 'green',
          '良好': 'blue',
          '合格': 'orange',
          '待改进': 'red'
        };
        return <Tag color={colorMap[rating]}>{rating}</Tag>;
      }
    },
    {
      title: '绩效奖金',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (bonus) => `¥${bonus}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已确认' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
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

  const handleView = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 计算总分
      const totalScore = (
        (values.workQuality + values.workEfficiency + values.teamwork + values.innovation) / 4
      ).toFixed(2);
      
      // 根据总分确定等级
      let rating = '待改进';
      if (totalScore >= 95) rating = '卓越';
      else if (totalScore >= 85) rating = '优秀';
      else if (totalScore >= 75) rating = '良好';
      else if (totalScore >= 60) rating = '合格';
      
      console.log('保存绩效评估:', { ...values, totalScore, rating });
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 绩效统计
  const performanceStats = {
    avgScore: 86.8,
    excellentCount: 15,
    goodCount: 28,
    normalCount: 12,
    improvementCount: 3
  };

  return (
    <div>
      {/* 绩效统计 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均得分"
              value={performanceStats.avgScore}
              prefix={<TrophyOutlined />}
              suffix="分"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="优秀员工"
              value={performanceStats.excellentCount}
              prefix={<StarOutlined />}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="良好员工"
              value={performanceStats.goodCount}
              prefix={<RiseOutlined />}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="合格员工"
              value={performanceStats.normalCount}
              prefix={<UserOutlined />}
              suffix="人"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="待改进员工"
              value={performanceStats.improvementCount}
              prefix={<FallOutlined />}
              suffix="人"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
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
            <Select placeholder="绩效等级" style={{ width: 120 }} allowClear>
              <Option value="卓越">卓越</Option>
              <Option value="优秀">优秀</Option>
              <Option value="良好">良好</Option>
              <Option value="合格">合格</Option>
              <Option value="待改进">待改进</Option>
            </Select>
            <MonthPicker placeholder="考核期间" />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增绩效评估
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={performanceData}
          pagination={{
            total: performanceData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新增/编辑绩效评估模态框 */}
      <Modal
        title={editingRecord ? '编辑绩效评估' : '新增绩效评估'}
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
                name="employeeId"
                label="员工编号"
                rules={[{ required: true, message: '请输入员工编号' }]}
              >
                <Input placeholder="请输入员工编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="period"
                label="考核期间"
                rules={[{ required: true, message: '请选择考核期间' }]}
              >
                <MonthPicker style={{ width: '100%' }} placeholder="请选择考核期间" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="workQuality"
                label="工作质量 (0-100分)"
                rules={[{ required: true, message: '请输入工作质量得分' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入工作质量得分" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="workEfficiency"
                label="工作效率 (0-100分)"
                rules={[{ required: true, message: '请输入工作效率得分' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入工作效率得分" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teamwork"
                label="团队协作 (0-100分)"
                rules={[{ required: true, message: '请输入团队协作得分' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入团队协作得分" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="innovation"
                label="创新能力 (0-100分)"
                rules={[{ required: true, message: '请输入创新能力得分' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入创新能力得分" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bonus"
            label="绩效奖金(元)"
            rules={[{ required: true, message: '请输入绩效奖金' }]}
          >
            <Input type="number" placeholder="请输入绩效奖金" />
          </Form.Item>

          <Form.Item
            name="comment"
            label="评价意见"
          >
            <TextArea rows={4} placeholder="请输入评价意见" />
          </Form.Item>

          <Form.Item
            name="improvement"
            label="改进建议"
          >
            <TextArea rows={3} placeholder="请输入改进建议" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 绩效详情模态框 */}
      <Modal
        title="绩效评估详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="员工信息"
                    value={selectedRecord.name}
                    prefix={<UserOutlined />}
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    <div>编号: {selectedRecord.employeeId}</div>
                    <div>部门: {selectedRecord.department}</div>
                    <div>职位: {selectedRecord.position}</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="综合得分"
                    value={selectedRecord.totalScore}
                    suffix="分"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="gold" style={{ fontSize: '14px' }}>
                      {selectedRecord.rating}
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="各项得分" size="small" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>工作质量</span>
                      <span>{selectedRecord.workQuality}分</span>
                    </div>
                    <Progress percent={selectedRecord.workQuality} size="small" />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>工作效率</span>
                      <span>{selectedRecord.workEfficiency}分</span>
                    </div>
                    <Progress percent={selectedRecord.workEfficiency} size="small" strokeColor="#52c41a" />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>团队协作</span>
                      <span>{selectedRecord.teamwork}分</span>
                    </div>
                    <Progress percent={selectedRecord.teamwork} size="small" strokeColor="#722ed1" />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>创新能力</span>
                      <span>{selectedRecord.innovation}分</span>
                    </div>
                    <Progress percent={selectedRecord.innovation} size="small" strokeColor="#fa8c16" />
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="奖励信息" size="small">
              <div style={{ fontSize: '14px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>绩效奖金:</strong> ¥{selectedRecord.bonus}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>考核期间:</strong> {selectedRecord.period}
                </div>
                <div>
                  <strong>确认状态:</strong> 
                  <Tag color={selectedRecord.status === '已确认' ? 'green' : 'orange'} style={{ marginLeft: '8px' }}>
                    {selectedRecord.status}
                  </Tag>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PerformanceManagement;