import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Progress, Timeline, Select, DatePicker, Alert } from 'antd';
import { SyncOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { RangePicker } = DatePicker;
const { Option } = Select;

const SyncMonitoring = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  // 同步日志数据
  const syncLogData = [
    {
      key: '1',
      syncTime: '2024-12-20 10:30:15',
      interfaceName: '生产订单接口',
      systemType: 'ERP',
      direction: '入站',
      recordCount: 25,
      status: '成功',
      duration: 1.2,
      errorMessage: ''
    },
    {
      key: '2',
      syncTime: '2024-12-20 10:25:08',
      interfaceName: '库存同步接口',
      systemType: 'WMS',
      direction: '双向',
      recordCount: 156,
      status: '成功',
      duration: 2.8,
      errorMessage: ''
    },
    {
      key: '3',
      syncTime: '2024-12-20 10:00:32',
      interfaceName: '工艺数据接口',
      systemType: 'PLM',
      direction: '入站',
      recordCount: 0,
      status: '失败',
      duration: 30.0,
      errorMessage: '连接超时'
    },
    {
      key: '4',
      syncTime: '2024-12-20 09:45:21',
      interfaceName: '质量数据接口',
      systemType: 'QMS',
      direction: '出站',
      recordCount: 12,
      status: '部分成功',
      duration: 3.5,
      errorMessage: '3条记录验证失败'
    }
  ];

  // 同步趋势数据
  const syncTrendData = [
    { time: '08:00', 成功: 45, 失败: 2, 总计: 47 },
    { time: '09:00', 成功: 52, 失败: 1, 总计: 53 },
    { time: '10:00', 成功: 38, 失败: 5, 总计: 43 },
    { time: '11:00', 成功: 61, 失败: 0, 总计: 61 },
    { time: '12:00', 成功: 28, 失败: 1, 总计: 29 },
    { time: '13:00', 成功: 35, 失败: 2, 总计: 37 },
    { time: '14:00', 成功: 42, 失败: 1, 总计: 43 }
  ];

  const columns = [
    {
      title: '同步时间',
      dataIndex: 'syncTime',
      key: 'syncTime',
      width: 150
    },
    {
      title: '接口名称',
      dataIndex: 'interfaceName',
      key: 'interfaceName'
    },
    {
      title: '系统类型',
      dataIndex: 'systemType',
      key: 'systemType',
      render: (type) => (
        <Tag color={
          type === 'ERP' ? 'blue' : 
          type === 'WMS' ? 'green' : 
          type === 'PLM' ? 'orange' : 'purple'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '数据方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={
          direction === '入站' ? 'cyan' : 
          direction === '出站' ? 'magenta' : 'geekblue'
        }>
          {direction}
        </Tag>
      )
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '成功' ? 'green' : 
          status === '失败' ? 'red' : 
          status === '部分成功' ? 'orange' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '耗时(秒)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      render: (text) => text || '-'
    }
  ];

  const syncStats = {
    todayTotal: 247,
    todaySuccess: 235,
    todayFailed: 12,
    successRate: 95.1
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日同步总数"
              value={syncStats.todayTotal}
              prefix={<SyncOutlined />}
              suffix="次"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="同步成功"
              value={syncStats.todaySuccess}
              prefix={<PlayCircleOutlined />}
              suffix="次"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={Math.round((syncStats.todaySuccess / syncStats.todayTotal) * 100)} 
              size="small" 
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="同步失败"
              value={syncStats.todayFailed}
              prefix={<PauseCircleOutlined />}
              suffix="次"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress 
              percent={Math.round((syncStats.todayFailed / syncStats.todayTotal) * 100)} 
              size="small" 
              strokeColor="#ff4d4f"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={syncStats.successRate}
              prefix={<SyncOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={syncStats.successRate} 
              size="small" 
              strokeColor="#722ed1"
            />
          </Card>
        </Col>
      </Row>

      {/* 同步趋势图表 */}
      <Card title="同步趋势分析" style={{ marginBottom: '24px' }}>
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#fafafa',
          border: '1px dashed #d9d9d9'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>📊 同步趋势图表</div>
            <div style={{ fontSize: '12px' }}>图表功能开发中，将显示同步成功率和失败率趋势</div>
          </div>
        </div>
      </Card>

      {/* 同步日志 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select 
              value={selectedTimeRange} 
              onChange={setSelectedTimeRange}
              style={{ width: 120 }}
            >
              <Option value="today">今天</Option>
              <Option value="yesterday">昨天</Option>
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
            </Select>
            <Select placeholder="系统类型" style={{ width: 120 }} allowClear>
              <Option value="ERP">ERP</Option>
              <Option value="WMS">WMS</Option>
              <Option value="PLM">PLM</Option>
              <Option value="QMS">QMS</Option>
            </Select>
            <Select placeholder="同步状态" style={{ width: 120 }} allowClear>
              <Option value="成功">成功</Option>
              <Option value="失败">失败</Option>
              <Option value="部分成功">部分成功</Option>
            </Select>
            <RangePicker showTime />
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button icon={<DownloadOutlined />}>导出日志</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={syncLogData}
          pagination={{
            total: syncLogData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SyncMonitoring;