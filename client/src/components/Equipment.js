import React, { useState } from 'react';
import { Table, Tag, Card, Row, Col, Statistic, Button, Space } from 'antd';
import { 
  ToolOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const Equipment = () => {
  const [equipmentList] = useState([
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      equipmentType: '注塑设备',
      productionLineId: 1,
      status: 'running',
      location: '车间A-01',
      lastMaintenanceDate: '2024-01-01',
      nextMaintenanceDate: '2024-04-01'
    },
    {
      key: '2',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      equipmentType: '包装设备',
      productionLineId: 1,
      status: 'maintenance',
      location: '车间A-02',
      lastMaintenanceDate: '2024-01-10',
      nextMaintenanceDate: '2024-04-10'
    },
    {
      key: '3',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      equipmentType: '检测设备',
      productionLineId: 2,
      status: 'fault',
      location: '车间B-01',
      lastMaintenanceDate: '2023-12-15',
      nextMaintenanceDate: '2024-03-15'
    }
  ]);

  const statusColors = {
    running: 'green',
    idle: 'blue',
    maintenance: 'orange',
    fault: 'red',
    offline: 'default'
  };

  const statusLabels = {
    running: '运行中',
    idle: '空闲',
    maintenance: '维护中',
    fault: '故障',
    offline: '离线'
  };

  const columns = [
    {
      title: '设备编码',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button size="small">详情</Button>
          <Button size="small">维护</Button>
          <Button size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  const getStatusCount = (status) => {
    return equipmentList.filter(eq => eq.status === status).length;
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>设备管理</h1>
      
      {/* 设备状态统计 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行设备"
              value={getStatusCount('running')}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="维护设备"
              value={getStatusCount('maintenance')}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="故障设备"
              value={getStatusCount('fault')}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="空闲设备"
              value={getStatusCount('idle')}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="设备列表">
        <Table
          columns={columns}
          dataSource={equipmentList}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 台设备`
          }}
        />
      </Card>
    </div>
  );
};

export default Equipment;