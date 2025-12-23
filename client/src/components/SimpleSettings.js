import { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Alert, Table, Tag, Avatar, Timeline } from 'antd';
import { 
  SettingOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  DatabaseOutlined,
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  PlusOutlined,
  AuditOutlined,
  KeyOutlined,
  MessageOutlined,
  GlobalOutlined,
  LockOutlined
} from '@ant-design/icons';

// 导入子组件
import UserManagement from './settings/UserManagement';
import RoleManagement from './settings/RoleManagement';
import PermissionManagement from './settings/PermissionManagement';
import DepartmentAccess from './settings/DepartmentAccess';
import SystemConfiguration from './settings/SystemConfiguration';
import SecuritySettings from './settings/SecuritySettings';
import AuditLogs from './settings/AuditLogs';
import SystemBackup from './settings/SystemBackup';
import MessagePushSettings from './settings/MessagePushSettings';

const SimpleSettings = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalRoles: 12,
    onlineUsers: 28
  };

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      title: '新用户注册',
      time: '2小时前',
      user: '系统管理员',
      details: '为生产部新增用户：李小明'
    },
    {
      id: 2,
      type: 'warning',
      title: '权限变更',
      time: '4小时前',
      user: '张主管',
      details: '修改质量部角色权限配置'
    },
    {
      id: 3,
      type: 'info',
      title: '系统配置更新',
      time: '6小时前',
      user: '系统管理员',
      details: '更新系统安全策略配置'
    },
    {
      id: 4,
      type: 'error',
      title: '登录异常',
      time: '8小时前',
      user: '未知用户',
      details: '检测到异常登录尝试'
    }
  ];

  const userList = [
    {
      key: '1',
      userId: 'USR001',
      username: 'admin',
      realName: '系统管理员',
      department: '信息部',
      role: '超级管理员',
      status: '正常',
      lastLogin: '2024-12-22 10:30:15',
      loginCount: 1250
    },
    {
      key: '2',
      userId: 'USR002',
      username: 'prod_manager',
      realName: '张主管',
      department: '生产部',
      role: '部门管理员',
      status: '正常',
      lastLogin: '2024-12-22 09:45:20',
      loginCount: 890
    },
    {
      key: '3',
      userId: 'USR003',
      username: 'quality_user',
      realName: '李检验员',
      department: '质量部',
      role: '普通用户',
      status: '锁定',
      lastLogin: '2024-12-21 16:20:30',
      loginCount: 456
    },
    {
      key: '4',
      userId: 'USR004',
      username: 'tech_engineer',
      realName: '王工程师',
      department: '技术部',
      role: '技术管理员',
      status: '正常',
      lastLogin: '2024-12-22 08:15:10',
      loginCount: 678
    }
  ];

  const departmentAccess = [
    {
      department: '生产部',
      allowedModules: ['生产管理', '设备管理', '库存管理', '报表分析'],
      userCount: 45,
      accessLevel: '部门级'
    },
    {
      department: '质量部',
      allowedModules: ['质量管理', '工艺管理', '报表分析'],
      userCount: 18,
      accessLevel: '部门级'
    },
    {
      department: '技术部',
      allowedModules: ['工艺管理', '设备管理', '系统集成', '报表分析'],
      userCount: 28,
      accessLevel: '部门级'
    },
    {
      department: '信息部',
      allowedModules: ['全部模块'],
      userCount: 8,
      accessLevel: '系统级'
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <SettingOutlined />
    },
    {
      key: 'user-management',
      label: '用户管理',
      icon: <UserOutlined />
    },
    {
      key: 'role-management',
      label: '角色管理',
      icon: <SafetyCertificateOutlined />
    },
    {
      key: 'permission-management',
      label: '权限管理',
      icon: <KeyOutlined />
    },
    {
      key: 'department-access',
      label: '部门权限',
      icon: <TeamOutlined />
    },
    {
      key: 'system-config',
      label: '系统配置',
      icon: <DatabaseOutlined />
    },
    {
      key: 'security-settings',
      label: '安全设置',
      icon: <LockOutlined />
    },
    {
      key: 'message-push',
      label: '消息推送',
      icon: <MessageOutlined />
    },
    {
      key: 'audit-logs',
      label: '审计日志',
      icon: <AuditOutlined />
    },
    {
      key: 'system-backup',
      label: '系统备份',
      icon: <GlobalOutlined />
    }
  ];

  const renderOverview = () => (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>系统设置概览</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              用户账号、权限管理和系统配置，确保系统安全和高效运行
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新增用户
            </Button>
            <Button icon={<SettingOutlined />}>
              系统配置
            </Button>
          </Space>
        </div>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="系统安全提醒"
        description="检测到3次异常登录尝试，建议检查系统安全设置。有2个用户账号长期未登录，建议及时清理。"
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
              title="用户总数"
              value={systemStats.totalUsers}
              prefix={<UserOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" status="active" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                许可证使用率: 91% (目标: &lt;95%)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={systemStats.activeUsers}
              prefix={<CheckCircleOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={91} size="small" strokeColor="#52c41a" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                活跃率: 91% (正常范围)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={systemStats.onlineUsers}
              prefix={<ExclamationCircleOutlined />}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={18} size="small" strokeColor="#fa8c16" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                在线率: 18% (当前时段正常)
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色数量"
              value={systemStats.totalRoles}
              prefix={<SafetyCertificateOutlined />}
              suffix="个"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={60} size="small" strokeColor="#722ed1" />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                配置完整度: 60%
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门权限配置和最近活动 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title="部门权限配置" extra={<Button type="link">查看全部</Button>}>
            <Row gutter={16}>
              {departmentAccess.map((dept, index) => (
                <Col span={12} key={index} style={{ marginBottom: '16px' }}>
                  <Card size="small" style={{ 
                    background: dept.accessLevel === '系统级' ? '#f6ffed' : '#f0f5ff',
                    border: `1px solid ${dept.accessLevel === '系统级' ? '#b7eb8f' : '#adc6ff'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold' }}>{dept.department}</div>
                      <Tag color={dept.accessLevel === '系统级' ? 'green' : 'blue'}>
                        {dept.accessLevel}
                      </Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>用户数: {dept.userCount}人</div>
                      <div>可访问模块: {dept.allowedModules.join('、')}</div>
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
                      {activity.user} · {activity.time}
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

      {/* 用户状态 */}
      <Card title="用户状态" style={{ marginBottom: '24px' }}>
        <Table 
          columns={[
            {
              title: '用户ID',
              dataIndex: 'userId',
              key: 'userId'
            },
            {
              title: '用户名',
              dataIndex: 'username',
              key: 'username'
            },
            {
              title: '真实姓名',
              dataIndex: 'realName',
              key: 'realName'
            },
            {
              title: '部门',
              dataIndex: 'department',
              key: 'department',
              render: (dept) => (
                <Tag color={
                  dept === '信息部' ? 'gold' : 
                  dept === '生产部' ? 'blue' : 
                  dept === '质量部' ? 'green' : 'purple'
                }>
                  {dept}
                </Tag>
              )
            },
            {
              title: '角色',
              dataIndex: 'role',
              key: 'role'
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === '正常' ? 'green' : 'red'}>
                  {status}
                </Tag>
              )
            },
            {
              title: '最后登录',
              dataIndex: 'lastLogin',
              key: 'lastLogin'
            },
            {
              title: '登录次数',
              dataIndex: 'loginCount',
              key: 'loginCount'
            }
          ]}
          dataSource={userList}
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
              onClick={() => setActiveTab('user-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                <UserOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>用户管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                用户账号和基本信息管理
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('role-management')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}>
                <SafetyCertificateOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>角色管理</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                角色定义和权限分配
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('department-access')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#722ed1', marginBottom: '8px' }}>
                <TeamOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>部门权限</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                部门级别的模块访问控制
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              hoverable 
              size="small" 
              onClick={() => setActiveTab('security-settings')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#faad14', marginBottom: '8px' }}>
                <LockOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>安全设置</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                系统安全策略和配置
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
      case 'user-management':
        return <UserManagement />;
      case 'role-management':
        return <RoleManagement />;
      case 'permission-management':
        return <PermissionManagement />;
      case 'department-access':
        return <DepartmentAccess />;
      case 'system-config':
        return <SystemConfiguration />;
      case 'security-settings':
        return <SecuritySettings />;
      case 'message-push':
        return <MessagePushSettings />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'system-backup':
        return <SystemBackup />;
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

export default SimpleSettings;