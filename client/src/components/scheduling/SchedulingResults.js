import React, { useState, useEffect } from 'react';
import {
  Card, Table, Row, Col, Statistic, Empty, Spin, Tag, Timeline, Space, Button, Select
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

const SchedulingResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchResults();
    fetchDevices();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scheduling/results');
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('获取排程结果失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/scheduling/devices?limit=1000');
      const data = await response.json();
      if (data.success) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
    }
  };

  const getTaskColumns = () => [
    {
      title: '任务单号',
      dataIndex: 'task_number',
      key: 'task_number',
      width: 120
    },
    {
      title: '计划单号',
      dataIndex: ['ProductionPlan', 'plan_number'],
      key: 'plan_number',
      width: 120
    },
    {
      title: '物料',
      dataIndex: ['ProductionPlan', 'Material', 'material_name'],
      key: 'material_name',
      width: 150
    },
    {
      title: '模具',
      dataIndex: ['Mold', 'mold_name'],
      key: 'mold_name',
      width: 150
    },
    {
      title: '数量',
      dataIndex: 'task_quantity',
      key: 'task_quantity',
      width: 80
    },
    {
      title: '计划开始',
      dataIndex: 'planned_start_time',
      key: 'planned_start_time',
      width: 150,
      render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '计划结束',
      dataIndex: 'planned_end_time',
      key: 'planned_end_time',
      width: 150,
      render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '交期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '超期',
      dataIndex: 'is_overdue',
      key: 'is_overdue',
      width: 80,
      render: (isOverdue) => (
        <Tag color={isOverdue ? 'red' : 'green'}>
          {isOverdue ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { text: '待执行', color: 'default' },
          in_progress: { text: '执行中', color: 'processing' },
          completed: { text: '已完成', color: 'success' },
          cancelled: { text: '已取消', color: 'error' }
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    }
  ];

  const filteredResults = selectedDevice
    ? results.filter(r => r.device?.id === parseInt(selectedDevice))
    : results;

  if (loading) {
    return <Spin />;
  }

  if (results.length === 0) {
    return (
      <Card title="排程结果展示">
        <Empty description="暂无排程结果" />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="排程结果统计"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchResults}
          >
            刷新
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="设备总数"
              value={results.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="总任务单数"
              value={results.reduce((sum, r) => sum + r.tasks.length, 0)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="超期任务单"
              value={results.reduce((sum, r) => sum + r.tasks.filter(t => t.is_overdue).length, 0)}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="已完成任务单"
              value={results.reduce((sum, r) => sum + r.tasks.filter(t => t.status === 'completed').length, 0)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="按设备分组展示"
        extra={
          <Select
            placeholder="选择设备"
            style={{ width: 200 }}
            allowClear
            onChange={setSelectedDevice}
          >
            {devices.map(d => (
              <Select.Option key={d.id} value={d.id}>
                {d.device_code} - {d.device_name}
              </Select.Option>
            ))}
          </Select>
        }
      >
        {filteredResults.map((deviceGroup, index) => (
          <Card
            key={index}
            title={`${deviceGroup.device?.device_code} - ${deviceGroup.device?.device_name}`}
            style={{ marginBottom: 16 }}
            type="inner"
          >
            <Table
              columns={getTaskColumns()}
              dataSource={deviceGroup.tasks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        ))}
      </Card>

      <Card
        title="时间轴视图"
        style={{ marginTop: 24 }}
      >
        <Timeline>
          {results.flatMap(deviceGroup =>
            deviceGroup.tasks
              .sort((a, b) => new Date(a.planned_start_time) - new Date(b.planned_start_time))
              .map((task, idx) => (
                <Timeline.Item
                  key={idx}
                  color={task.is_overdue ? 'red' : 'green'}
                >
                  <p>
                    <strong>{task.task_number}</strong> - {task.ProductionPlan?.Material?.material_name}
                  </p>
                  <p>
                    设备: {deviceGroup.device?.device_name} | 模具: {task.Mold?.mold_name}
                  </p>
                  <p>
                    {moment(task.planned_start_time).format('YYYY-MM-DD HH:mm')} ~
                    {moment(task.planned_end_time).format('YYYY-MM-DD HH:mm')}
                  </p>
                  <p>
                    交期: {moment(task.due_date).format('YYYY-MM-DD HH:mm')}
                    {task.is_overdue && <Tag color="red" style={{ marginLeft: 8 }}>超期</Tag>}
                  </p>
                </Timeline.Item>
              ))
          )}
        </Timeline>
      </Card>
    </div>
  );
};

export default SchedulingResults;
