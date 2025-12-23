import { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Alert, Table, Tag, Avatar, Timeline } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  IdcardOutlined, 
  ScheduleOutlined, 
  SafetyCertificateOutlined,
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  PlusOutlined,
  SettingOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined
} from '@ant-design/icons';

// 导入子组件
import EmployeeManagement from './personnel/EmployeeManagement';
import DepartmentManagement from './personnel/DepartmentManagement';
import AttendanceManagement from './personnel/AttendanceManagement';
import TrainingManagement from './personnel/TrainingManagement';
import PerformanceManagement from './personnel/PerformanceManagement';
import SkillCertification from './personnel/SkillCertification';
import WorkSchedule from './personnel/WorkSchedule';
import PersonnelReports from './personnel/PersonnelReports';

const SimplePersonnel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const personnelStats = {
    totalEmployees: 156,
    activeEmployees: 142,
    onLeaveEmployees: 8,
    attendanceRate: 96.5
  };

  const departmentData = [
    {
      id: 1,
      departmentName: '生产部',
      employeeCount: 45,
      attendanceRate: 97.2,
      manager: '张主管',
      status: '正常'
    },
    {
      id: 2,
      departmentName: '质量部',
      employeeCount: 18,
      attendanceRate: 98.5,
      manager: '李经理',
      status: '正常'
    },
    {
      id: 3,
      departmentName: '设备部',
      employeeCount: 22,
      attendanceRate: 94.8,
      manager: '王工程师',
      status: '关注'
    },
    {
      id: 4,
      departmentName: '技术部',
      employeeCount: 28,
      attendanceRate: 96.1,
      manager: '陈总监',
      status: '正常'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      title: '新员工入职完成',
      time: '2小时前',
      department: '生产部',
      details: '李小明完成入职手续'
    },
    {
      id: 2,
      type: 'info',
      title: '培训计划更新',
      time: '4小时前',
      department: '技术部',
      details: 'PLC编程培训计划已发布'
    },
    {
      id: 3,
      type: 'warning',
      title: '考勤异常提醒',
      time: '6小时前',
      department: '设备部',
      details: '3名员工迟到超过15分钟'
    },
    {
      id: 4,
      type: 'success',
      title: '技能认证通过',
      time: '1天前',
      department: '质量部',
      details: '5名员工通过ISO质量体系认证'
    }
  ];

  const employeeList = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      position: '生产主管',
      status: '在职',
      attendanceRate: 98.5,
      skillLevel: '高级',
      joinDate: '2022-03-15'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      position: '质检员',
      status: '在职',
      attendanceRate: 97.2,
      skillLevel: '中级',
      joinDate: '2023-01-20'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      department: '设备部',
      position: '维修工程师',
      status: '请假',
      attendanceRate: 95.8,
      skillLevel: '高级',
      joinDate: '2021-08-10'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      position: '工艺工程师',
      status: '在职',
      attendanceRate: 99.1,
      skillLevel: '专家',
      joinDate: '2020-05-12'
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <UserOutlined />
    },
    {
      key: 'employee-management',
      label: '员工管理',
      icon: <IdcardOutlined />
    },
    {
      key: 'department-management',
      label: '部门管理',
      icon: <TeamOutlined />
    },
    {
      key: 'attendance-management',
      label: '考勤管理',
      icon: <ClockCircleOutlined />
    },
    {
      key: 'training-management',
      label: '培训管理',
      icon: <BookOutlined />
    },
    {
      key: 'performance-management',
      label: '绩效管理',
      icon: <TrophyOutlined />
    },
    {
      key: 'skill-certification',
      label: '技能认证',
      icon: <SafetyCertificateOutlined />
    },
    {
      key: 'work-schedule',
      label: '排班管理',
      icon: <ScheduleOutlined />
    },
    {
      key: 'personnel-reports',
      label: '人事报表',
      icon: <AuditOutlined />
    }
  ];

  const renderOverview = () => (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>人员管理概览</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              员工信息、考勤、培训、绩效等人力资源管理，提升团队效率和能力
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新增员工
            </Button>
            <Button icon={<SettingOutlined />}>
              系统设置
            </Button>
          </Space>
        </div>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="人员管理提醒"
        description="设备部考勤率低于95%，建议关注员工出勤情况。本月有5名员工技能认证即将到期，请及时安排复训。"
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Space>
            <Button size="small" type="text">
              查看详情
            </Button>
            <Button size="small" type="text" danger>
              立即处理
            </Button>
          </Space>
        }
      />

      {/* 核心统计指标 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={personnelStats.totalEmployees}
              prefix={<UserOutlined />}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" status="active" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                编制使用率: 91% (目标: 85-95%)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在职员工"
              value={personnelStats.activeEmployees}
              prefix={<CheckCircleOutlined />}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" strokeColor="#52c41a" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                在职率: 91% (正常范围)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="请假人数"
              value={personnelStats.onLeaveEmployees}
              prefix={<ExclamationCircleOutlined />}
              suffix="人"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={5} size="small" strokeColor="#fa8c16" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                请假率: 5% (正常范围)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="出勤率"
              value={personnelStats.attendanceRate}
              prefix={<ClockCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={96.5} size="small" strokeColor="#722ed1" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                优秀 (目标: &gt;95%)
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门状态和最近活动 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="部门状态" extra={<Button type="link">查看全部</Button>}>
            <Row gutter={16}>
              {departmentData.map(dept => (
                <Col span={12} key={dept.id} style={{ marginBottom: '16px' }}>
                  <Card size="small" style={{ 
                    background: dept.status === '正常' ? '#f6ffed' : '#fff7e6',
                    border: `1px solid ${dept.status === '正常' ? '#b7eb8f' : '#ffd591'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold' }}>{dept.departmentName}</div>
                      <Tag color={dept.status === '正常' ? 'green' : 'orange'}>
                        {dept.status}
                      </Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>员工数: {dept.employeeCount}人 | 出勤率: {dept.attendanceRate}%</div>
                      <div>负责人: {dept.manager}</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最近活动" extra={<Button type="link">查看更多</Button>}>
            <Timeline size="small">
              {recentActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  color={
                    activity.type === 'success' ? 'green' :
                    activity.type === 'warning' ? 'orange' :
                    activity.type === 'info' ? 'blue' : 'red'
                  }
                >
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {activity.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {activity.department} · {activity.time}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {activity.details}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* 员工状态 */}
      <Card title="员工状态" style={{ marginBottom: '24px' }}>
        <Table 
          columns={[
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
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === '在职' ? 'green' : 'orange'}>
                  {status}
                </Tag>
              )
            },
            {
              title: '出勤率',
              dataIndex: 'attendanceRate',
              key: 'attendanceRate',
              render: (rate) => (
                <div>
                  <Progress percent={rate} size="small" />
                  <span style={{ fontSize: '12px' }}>{rate}%</span>
                </div>
              )
            },
            {
              title: '技能等级',
              dataIndex: 'skillLevel',
              key: 'skillLevel',
              render: (level) => (
                <Tag color={
                  level === '专家' ? 'gold' :
                  level === '高级' ? 'blue' :
                  level === '中级' ? 'green' : 'default'
                }>
                  {level}
                </Tag>
              )
            },
            {
              title: '入职日期',
              dataIndex: 'joinDate',
              key: 'joinDate'
            }
          ]}
          dataSource={employeeList}
          pagination={false}
          size="small"
        />
      </Card>

      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('employee-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                <IdcardOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>员工管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                员工档案和基本信息管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('attendance-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}>
                <ClockCircleOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>考勤管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                出勤记录和考勤统计分析
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('training-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#722ed1', marginBottom: '8px' }}>
                <BookOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>培训管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                培训计划和技能提升管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('skill-certification')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#faad14', marginBottom: '8px' }}>
                <SafetyCertificateOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>技能认证</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                技能等级和资质认证管理
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'employee-management':
        return <EmployeeManagement />;
      case 'department-management':
        return <DepartmentManagement />;
      case 'attendance-management':
        return <AttendanceManagement />;
      case 'training-management':
        return <TrainingManagement />;
      case 'performance-management':
        return <PerformanceManagement />;
      case 'skill-certification':
        return <SkillCertification />;
      case 'work-schedule':
        return <WorkSchedule />;
      case 'personnel-reports':
        return <PersonnelReports />;
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems.map(item => ({
          ...item,
          children: renderTabContent()
        }))}
        size="small"
        className="compact-tabs"
        tabBarStyle={{
          marginBottom: '8px',
          fontSize: '14px'
        }}
      />
    </div>
  );
};

export default SimplePersonnel;