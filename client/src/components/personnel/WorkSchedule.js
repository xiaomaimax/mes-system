import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, DatePicker, Modal, Tag, Calendar, Badge } from 'antd';

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
import { 
  ScheduleOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { RangePicker } = DatePicker;

const WorkSchedule = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, calendar
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 排班数据
  const scheduleData = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      date: '2024-12-22',
      shift: '早班',
      startTime: '08:00',
      endTime: '16:00',
      workHours: 8,
      status: '正常',
      position: '生产线A'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      date: '2024-12-22',
      shift: '中班',
      startTime: '16:00',
      endTime: '00:00',
      workHours: 8,
      status: '正常',
      position: '质检岗位'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      department: '设备部',
      date: '2024-12-22',
      shift: '夜班',
      startTime: '00:00',
      endTime: '08:00',
      workHours: 8,
      status: '请假',
      position: '设备维护'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      date: '2024-12-22',
      shift: '白班',
      startTime: '09:00',
      endTime: '17:30',
      workHours: 8,
      status: '正常',
      position: '技术支持'
    },
    {
      key: '5',
      employeeId: 'EMP005',
      name: '孙七',
      department: '生产部',
      date: '2024-12-22',
      shift: '早班',
      startTime: '08:00',
      endTime: '16:00',
      workHours: 8,
      status: '加班',
      position: '生产线B'
    }
  ];

  // 班次模板
  const shiftTemplates = [
    { name: '早班', startTime: '08:00', endTime: '16:00', color: '#1890ff' },
    { name: '中班', startTime: '16:00', endTime: '00:00', color: '#52c41a' },
    { name: '夜班', startTime: '00:00', endTime: '08:00', color: '#722ed1' },
    { name: '白班', startTime: '09:00', endTime: '17:30', color: '#fa8c16' }
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
      title: '日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => {
        const template = shiftTemplates.find(t => t.name === shift);
        return (
          <Tag color={template?.color || 'default'}>
            {shift}
          </Tag>
        );
      }
    },
    {
      title: '工作时间',
      key: 'workTime',
      render: (_, record) => `${record.startTime} - ${record.endTime}`
    },
    {
      title: '工作时长',
      dataIndex: 'workHours',
      key: 'workHours',
      render: (hours) => `${hours}小时`
    },
    {
      title: '工作岗位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '正常': 'green',
          '请假': 'orange',
          '加班': 'blue',
          '调班': 'purple'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存排班信息:', values);
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 日历数据处理
  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const daySchedules = scheduleData.filter(item => item.date === dateStr);
    
    return daySchedules.map(item => ({
      type: item.status === '正常' ? 'success' : 
            item.status === '请假' ? 'warning' : 
            item.status === '加班' ? 'processing' : 'error',
      content: `${item.name} - ${item.shift}`
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} style={{ fontSize: '12px' }} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={18}>
          <Card>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button 
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  列表视图
                </Button>
                <Button 
                  type={viewMode === 'calendar' ? 'primary' : 'default'}
                  onClick={() => setViewMode('calendar')}
                  icon={<CalendarOutlined />}
                >
                  日历视图
                </Button>
                <Input.Search
                  placeholder="搜索员工..."
                  style={{ width: 200 }}
                  onSearch={(value) => console.log('搜索:', value)}
                />
                <Select placeholder="部门" style={{ width: 120 }} allowClear>
                  <Option value="生产部">生产部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="设备部">设备部</Option>
                  <Option value="技术部">技术部</Option>
                </Select>
                <Select placeholder="班次" style={{ width: 120 }} allowClear>
                  <Option value="早班">早班</Option>
                  <Option value="中班">中班</Option>
                  <Option value="夜班">夜班</Option>
                  <Option value="白班">白班</Option>
                </Select>
                <RangePicker />
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增排班
              </Button>
            </div>

            {viewMode === 'table' ? (
              <Table
                columns={columns}
                dataSource={scheduleData}
                pagination={{
                  total: scheduleData.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                size="small"
              />
            ) : (
              <Calendar 
                dateCellRender={dateCellRender}
                value={selectedDate}
                onSelect={setSelectedDate}
              />
            )}
          </Card>
        </Col>

        <Col span={6}>
          <Card title="班次模板" style={{ marginBottom: '16px' }}>
            <div>
              {shiftTemplates.map((template, index) => (
                <div key={index} style={{ 
                  marginBottom: '12px', 
                  padding: '8px', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '4px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={template.color}>{template.name}</Tag>
                    <Button type="link" size="small">使用</Button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {template.startTime} - {template.endTime}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="今日排班统计">
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>早班人数:</span>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  {scheduleData.filter(s => s.shift === '早班').length}人
                </span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>中班人数:</span>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                  {scheduleData.filter(s => s.shift === '中班').length}人
                </span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>夜班人数:</span>
                <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
                  {scheduleData.filter(s => s.shift === '夜班').length}人
                </span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>白班人数:</span>
                <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>
                  {scheduleData.filter(s => s.shift === '白班').length}人
                </span>
              </div>
              <div style={{ marginTop: '16px', padding: '8px', background: '#f6ffed', borderRadius: '4px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    {scheduleData.filter(s => s.status === '正常').length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>正常出勤</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑排班模态框 */}
      <Modal
        title={editingRecord ? '编辑排班信息' : '新增排班'}
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
                name="employeeId"
                label="员工编号"
                rules={[{ required: true, message: '请输入员工编号' }]}
              >
                <Input placeholder="请输入员工编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="排班日期"
                rules={[{ required: true, message: '请选择排班日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择排班日期" />
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
                  <Option value="早班">早班</Option>
                  <Option value="中班">中班</Option>
                  <Option value="夜班">夜班</Option>
                  <Option value="白班">白班</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="工作岗位"
                rules={[{ required: true, message: '请输入工作岗位' }]}
              >
                <Input placeholder="请输入工作岗位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请输入开始时间' }]}
              >
                <Input placeholder="请输入开始时间 (如: 08:00)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请输入结束时间' }]}
              >
                <Input placeholder="请输入结束时间 (如: 16:00)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="workHours"
                label="工作时长(小时)"
                rules={[{ required: true, message: '请输入工作时长' }]}
              >
                <Input type="number" placeholder="请输入工作时长" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="正常">正常</Option>
                  <Option value="请假">请假</Option>
                  <Option value="加班">加班</Option>
                  <Option value="调班">调班</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkSchedule;