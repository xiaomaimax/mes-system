import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Badge,
  Avatar,
  Calendar,
  List,
  Tooltip,
  Switch,
  Checkbox
} from 'antd';
import { 
  ClockCircleOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SwapOutlined,
  EyeOutlined,
  BellOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ShiftScheduleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [form] = Form.useForm();

  // 模拟排班数据
  const scheduleData = [
    {
      key: '1',
      date: '2024-01-15',
      workshop: '车间A',
      shift: '白班',
      shiftTime: '08:00-20:00',
      teamLeader: { id: 'OP001', name: '张三', phone: '138-0000-1111' },
      operators: [
        { id: 'OP002', name: '李四', position: '操作员', status: 'present' },
        { id: 'OP003', name: '王五', position: '操作员', status: 'present' },
        { id: 'OP004', name: '赵六', position: '技术员', status: 'late' }
      ],
      plannedCount: 3,
      actualCount: 3,
      absentCount: 0,
      lateCount: 1,
      overtimeCount: 0,
      status: 'in_progress',
      productionTarget: 1000,
      actualProduction: 750,
      remarks: '正常生产中'
    },
    {
      key: '2',
      date: '2024-01-15',
      workshop: '车间A',
      shift: '夜班',
      shiftTime: '20:00-08:00',
      teamLeader: { id: 'OP005', name: '钱七', phone: '138-0000-2222' },
      operators: [
        { id: 'OP006', name: '孙八', position: '操作员', status: 'scheduled' },
        { id: 'OP007', name: '周九', position: '操作员', status: 'scheduled' },
        { id: 'OP008', name: '吴十', position: '技术员', status: 'scheduled' }
      ],
      plannedCount: 3,
      actualCount: 0,
      absentCount: 0,
      lateCount: 0,
      overtimeCount: 0,
      status: 'scheduled',
      productionTarget: 800,
      actualProduction: 0,
      remarks: '待开始'
    }
  ];

  // 统计数据
  const summaryData = {
    totalShifts: 6,
    activeShifts: 2,
    totalOperators: 45,
    onDutyOperators: 18,
    absentOperators: 2,
    lateOperators: 3,
    avgAttendanceRate: 95.6,
    overtimeHours: 24
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      fixed: 'left'
    },
    {
      title: '车间',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 80
    },
    {
      title: '班次',
      key: 'shift',
      width: 150,
      render: (_, record) => (
        <div>
          <Tag color={record.shift === '白班' ? 'blue' : 'purple'}>
            {record.shift}
          </Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.shiftTime}
          </div>
        </div>
      )
    },
    {
      title: '班组长',
      key: 'teamLeader',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span>{record.teamLeader.name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.teamLeader.phone}
          </div>
        </div>
      )
    },
    {
      title: '人员配置',
      key: 'staffing',
      width: 120,
      render: (_, record) => (
        <div>
          <div>计划: {record.plannedCount}人</div>
          <div>实际: {record.actualCount}人</div>
          {record.absentCount > 0 && (
            <Tag color="red" size="small">缺勤{record.absentCount}</Tag>
          )}
          {record.lateCount > 0 && (
            <Tag color="orange" size="small">迟到{record.lateCount}</Tag>
          )}
        </div>
      )
    },
    {
      title: '班组成员',
      key: 'operators',
      width: 200,
      render: (_, record) => (
        <div>
          {record.operators.map((op, index) => (
            <Tag 
              key={index} 
              color={
                op.status === 'present' ? 'green' : 
                op.status === 'late' ? 'orange' : 
                op.status === 'absent' ? 'red' : 'default'
              }
              style={{ marginBottom: 2 }}
            >
              {op.name} - {op.position}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '生产目标',
      key: 'production',
      width: 120,
      render: (_, record) => (
        <div>
          <div>目标: {record.productionTarget}</div>
          <div>实际: {record.actualProduction}</div>
          {record.status === 'in_progress' && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              完成率: {((record.actualProduction / record.productionTarget) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          scheduled: { color: 'default', text: '已排班' },
          in_progress: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Badge status={color} text={text} />;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<SwapOutlined />}
          >
            调班
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交排班数据:', values);
      message.success('排班记录保存成功！');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="总班次"
            value={summaryData.totalShifts}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="进行中"
            value={summaryData.activeShifts}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="在岗人员"
            value={summaryData.onDutyOperators}
            suffix={`/${summaryData.totalOperators}`}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="缺勤人员"
            value={summaryData.absentOperators}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="出勤率"
            value={summaryData.avgAttendanceRate}
            suffix="%"
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="加班工时"
            value={summaryData.overtimeHours}
            suffix="h"
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      {renderSummaryCards()}

      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            排班记录管理
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => setCalendarModalVisible(true)}
            >
              日历视图
            </Button>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              新增排班
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <DatePicker 
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="选择日期"
            />
            <Select placeholder="车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="班次" style={{ width: 120 }}>
              <Option value="day">白班</Option>
              <Option value="night">夜班</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="scheduled">已排班</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={scheduleData}
          loading={loading}
          pagination={{
            total: scheduleData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新增/编辑排班模态框 */}
      <Modal
        title="排班记录"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="排班日期"
                rules={[{ required: true, message: '请选择排班日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="workshop"
                label="车间"
                rules={[{ required: true, message: '请选择车间' }]}
              >
                <Select placeholder="请选择车间">
                  <Option value="车间A">车间A</Option>
                  <Option value="车间B">车间B</Option>
                  <Option value="车间C">车间C</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shift"
                label="班次"
                rules={[{ required: true, message: '请选择班次' }]}
              >
                <Select placeholder="请选择班次">
                  <Option value="白班">白班 (08:00-20:00)</Option>
                  <Option value="夜班">夜班 (20:00-08:00)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teamLeader"
                label="班组长"
                rules={[{ required: true, message: '请选择班组长' }]}
              >
                <Select placeholder="请选择班组长">
                  <Option value="OP001">张三 - 高级操作员</Option>
                  <Option value="OP005">钱七 - 高级操作员</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="operators"
            label="班组成员"
            rules={[{ required: true, message: '请选择班组成员' }]}
          >
            <Select mode="multiple" placeholder="请选择班组成员">
              <Option value="OP002">李四 - 操作员</Option>
              <Option value="OP003">王五 - 操作员</Option>
              <Option value="OP004">赵六 - 技术员</Option>
              <Option value="OP006">孙八 - 操作员</Option>
              <Option value="OP007">周九 - 操作员</Option>
              <Option value="OP008">吴十 - 技术员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="productionTarget"
            label="生产目标"
          >
            <Input type="number" placeholder="请输入生产目标" suffix="件" />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 日历视图模态框 */}
      <Modal
        title="排班日历"
        open={calendarModalVisible}
        onCancel={() => setCalendarModalVisible(false)}
        footer={null}
        width={900}
      >
        <Calendar 
          fullscreen={false}
          onSelect={(date) => {
            setSelectedDate(date);
            message.info(`选择日期: ${date.format('YYYY-MM-DD')}`);
          }}
        />
      </Modal>
    </div>
  );
};

export default ShiftScheduleManagement;