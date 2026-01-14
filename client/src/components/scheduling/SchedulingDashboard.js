import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Tabs, Space, Statistic, Alert, Spin,
  Table, Modal, Form, Input, Select, DatePicker, InputNumber, message
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined,
  UploadOutlined, PlayCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import MaterialManagement from './MaterialManagement';
import DeviceManagement from './DeviceManagement';
import MoldManagement from './MoldManagement';
import PlanManagement from './PlanManagement';
import TaskManagement from './TaskManagement';
import SchedulingResults from './SchedulingResults';
import moment from 'moment';

const SchedulingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPlans: 0,
    unscheduledPlans: 0,
    totalTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [plansRes, tasksRes] = await Promise.all([
        fetch('/api/scheduling/plans?limit=1'),
        fetch('/api/scheduling/tasks?limit=1')
      ]);

      const plansData = await plansRes.json();
      const tasksData = await tasksRes.json();

      setStats({
        totalPlans: plansData.pagination?.total || 0,
        unscheduledPlans: plansData.data?.filter(p => p.status === 'unscheduled').length || 0,
        totalTasks: tasksData.pagination?.total || 0,
        overdueTasks: tasksData.data?.filter(t => t.is_overdue).length || 0
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteScheduling = async () => {
    Modal.confirm({
      title: '执行自动排产',
      content: '确定要执行自动排产吗？这将为所有未排产的计划单生成任务单。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/scheduling/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.json();
          if (data.success) {
            safeMessage.success(data.message);
            fetchStats();
          } else {
            safeMessage.error(data.message);
          }
        } catch (error) {
          safeMessage.error('执行排产失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总计划单数"
                  value={stats.totalPlans}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="未排产计划单"
                  value={stats.unscheduledPlans}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总任务单数"
                  value={stats.totalTasks}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="超期任务单"
                  value={stats.overdueTasks}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="快速操作" style={{ marginBottom: 24 }}>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleExecuteScheduling}
                loading={loading}
              >
                执行自动排产
              </Button>
              <Button
                size="large"
                icon={<DownloadOutlined />}
              >
                导出任务单
              </Button>
              <Button
                size="large"
                icon={<UploadOutlined />}
              >
                导入ERP任务单
              </Button>
            </Space>
          </Card>

          {stats.overdueTasks > 0 && (
            <Alert
              message="预警信息"
              description={`当前有 ${stats.overdueTasks} 个超期任务单，请及时处理`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              closable
            />
          )}
        </div>
      )
    },
    {
      key: 'materials',
      label: '物料管理',
      children: <MaterialManagement />
    },
    {
      key: 'devices',
      label: '设备管理',
      children: <DeviceManagement />
    },
    {
      key: 'molds',
      label: '模具管理',
      children: <MoldManagement />
    },
    {
      key: 'plans',
      label: '计划单管理',
      children: <PlanManagement />
    },
    {
      key: 'tasks',
      label: '任务单管理',
      children: <TaskManagement />
    },
    {
      key: 'results',
      label: '排程结果',
      children: <SchedulingResults />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="辅助排程系统" style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default SchedulingDashboard;
