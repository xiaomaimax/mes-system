import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, DatePicker, Modal, Tag, Statistic, Calendar, Badge } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { RangePicker } = DatePicker;

const AttendanceManagement = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('list'); // list, calendar

  // 考勤数据
  const attendanceData = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      date: '2024-12-22',
      checkInTime: '08:00:00',
      checkOutTime: '17:30:00',
      workHours: 8.5,
      status: '正常',
      overtime: 0.5,
      remark: ''
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      date: '2024-12-22',
      checkInTime: '08:15:00',
      checkOutTime: '17:30:00',
      workHours: 8.25,
      status: '迟到',
      overtime: 0,
      remark: '迟到15分钟'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      department: '设备部',
      date: '2024-12-22',
      checkInTime: '',
      checkOutTime: '',
      workHours: 0,
      status: '请假',
      overtime: 0,
      remark: '病假'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      date: '2024-12-22',
      checkInTime: '07:55:00',
      checkOutTime: '18:30:00',
      workHours: 9.5,
      status: '正常',
      overtime: 1.5,
      remark: '加班1.5小时'
    },
    {
      key: '5',
      employeeId: 'EMP005',
      name: '孙七',
      department: '生产部',
      date: '2024-12-22',
      checkInTime: '08:30:00',
      checkOutTime: '16:30:00',
      workHours: 7,
      status: '早退',
      overtime: 0,
      remark: '早退1小时'
    }
  ];

  // 考勤统计
  const attendanceStats = {
    totalEmployees: 156,
    presentEmployees: 142,
    lateEmployees: 8,
    absentEmployees: 6,
    attendanceRate: 91.0
  };

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
      title: '上班时间',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time) => time || '-'
    },
    {
      title: '下班时间',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time) => time || '-'
    },
    {
      title: '工作时长',
      dataIndex: 'workHours',
      key: 'workHours',
      render: (hours) => `${hours}小时`
    },
    {
      title: '加班时长',
      dataIndex: 'overtime',
      key: 'overtime',
      render: (hours) => hours > 0 ? `${hours}小时` : '-'
    },
    {
      title: '考勤状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '正常': 'green',
          '迟到': 'orange',
          '早退': 'orange',
          '请假': 'blue',
          '旷工': 'red'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (remark) => remark || '-'
    }
  ];

  // 日历数据处理
  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayAttendance = attendanceData.filter(item => item.date === dateStr);
    
    return dayAttendance.map(item => ({
      type: item.status === '正常' ? 'success' : 
            item.status === '请假' ? 'processing' : 'warning',
      content: `${item.name} - ${item.status}`
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
      {/* 考勤统计 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={5}>
          <Card>
            <Statistic
              title="应到人数"
              value={attendanceStats.totalEmployees}
              prefix={<UserOutlined />}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="实到人数"
              value={attendanceStats.presentEmployees}
              prefix={<CheckCircleOutlined />}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="迟到人数"
              value={attendanceStats.lateEmployees}
              prefix={<ExclamationCircleOutlined />}
              suffix="人"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="缺勤人数"
              value={attendanceStats.absentEmployees}
              prefix={<CloseCircleOutlined />}
              suffix="人"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="出勤率"
              value={attendanceStats.attendanceRate}
              prefix={<ClockCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
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
          </Space>
          <Space>
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
            <Select placeholder="考勤状态" style={{ width: 120 }} allowClear>
              <Option value="正常">正常</Option>
              <Option value="迟到">迟到</Option>
              <Option value="早退">早退</Option>
              <Option value="请假">请假</Option>
              <Option value="旷工">旷工</Option>
            </Select>
            <RangePicker />
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        </div>

        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={attendanceData}
            pagination={{
              total: attendanceData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
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

      {/* 考勤规则说明 */}
      <Card title="考勤规则" style={{ marginTop: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <h4>工作时间</h4>
            <ul>
              <li>标准工作时间：08:00 - 17:30</li>
              <li>午休时间：12:00 - 13:00</li>
              <li>标准工作时长：8小时</li>
            </ul>
          </Col>
          <Col span={12}>
            <h4>考勤规则</h4>
            <ul>
              <li>迟到：超过08:15视为迟到</li>
              <li>早退：17:00前离开视为早退</li>
              <li>旷工：未打卡且无请假记录</li>
              <li>加班：超过17:30的工作时间</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AttendanceManagement;