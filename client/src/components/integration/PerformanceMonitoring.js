import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space, Tag } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined, TrophyOutlined, WarningOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { RangePicker } = DatePicker;
const { Option } = Select;

const PerformanceMonitoring = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  // 性能数据
  const performanceData = [
    {
      key: '1',
      interfaceName: '生产订单接口',
      systemType: 'ERP',
      avgResponseTime: 120,
      maxResponseTime: 350,
      minResponseTime: 85,
      throughput: 450,
      errorRate: 0.2,
      availability: 99.8
    },
    {
      key: '2',
      interfaceName: '库存同步接口',
      systemType: 'WMS',
      avgResponseTime: 85,
      maxResponseTime: 200,
      minResponseTime: 60,
      throughput: 320,
      errorRate: 1.5,
      availability: 98.5
    },
    {
      key: '3',
      interfaceName: '工艺数据接口',
      systemType: 'PLM',
      avgResponseTime: 2500,
      maxResponseTime: 8000,
      minResponseTime: 1200,
      throughput: 45,
      errorRate: 15.2,
      availability: 85.0
    },
    {
      key: '4',
      interfaceName: '质量数据接口',
      systemType: 'QMS',
      avgResponseTime: 180,
      maxResponseTime: 450,
      minResponseTime: 120,
      throughput: 180,
      errorRate: 2.7,
      availability: 97.3
    }
  ];

  // 响应时间趋势数据
  const responseTimeTrendData = [
    { time: '08:00', ERP: 110, WMS: 80, PLM: 2200, QMS: 160 },
    { time: '09:00', ERP: 125, WMS: 85, PLM: 2800, QMS: 175 },
    { time: '10:00', ERP: 140, WMS: 90, PLM: 3500, QMS: 190 },
    { time: '11:00', ERP: 115, WMS: 75, PLM: 2100, QMS: 165 },
    { time: '12:00', ERP: 105, WMS: 70, PLM: 1800, QMS: 155 },
    { time: '13:00', ERP: 130, WMS: 95, PLM: 2600, QMS: 185 },
    { time: '14:00', ERP: 120, WMS: 85, PLM: 2300, QMS: 170 }
  ];

  // 吞吐量数据
  const throughputData = [
    { time: '08:00', 请求数: 380, 成功数: 375, 失败数: 5 },
    { time: '09:00', 请求数: 420, 成功数: 410, 失败数: 10 },
    { time: '10:00', 请求数: 350, 成功数: 335, 失败数: 15 },
    { time: '11:00', 请求数: 480, 成功数: 470, 失败数: 10 },
    { time: '12:00', 请求数: 280, 成功数: 275, 失败数: 5 },
    { time: '13:00', 请求数: 320, 成功数: 310, 失败数: 10 },
    { time: '14:00', 请求数: 390, 成功数: 380, 失败数: 10 }
  ];

  const columns = [
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
      title: '平均响应时间(ms)',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      render: (time) => (
        <span style={{ color: time > 1000 ? '#ff4d4f' : time > 500 ? '#fa8c16' : '#52c41a' }}>
          {time}
        </span>
      )
    },
    {
      title: '最大响应时间(ms)',
      dataIndex: 'maxResponseTime',
      key: 'maxResponseTime'
    },
    {
      title: '最小响应时间(ms)',
      dataIndex: 'minResponseTime',
      key: 'minResponseTime'
    },
    {
      title: '吞吐量(次/小时)',
      dataIndex: 'throughput',
      key: 'throughput'
    },
    {
      title: '错误率(%)',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate) => (
        <span style={{ color: rate > 5 ? '#ff4d4f' : rate > 2 ? '#fa8c16' : '#52c41a' }}>
          {rate}%
        </span>
      )
    },
    {
      title: '可用性(%)',
      dataIndex: 'availability',
      key: 'availability',
      render: (availability) => (
        <span style={{ color: availability < 95 ? '#ff4d4f' : availability < 98 ? '#fa8c16' : '#52c41a' }}>
          {availability}%
        </span>
      )
    }
  ];

  // 性能统计数据
  const performanceStats = {
    avgResponseTime: 721,
    maxThroughput: 450,
    avgErrorRate: 4.9,
    avgAvailability: 95.2
  };

  return (
    <div>
      {/* 性能统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={performanceStats.avgResponseTime}
              prefix={<ClockCircleOutlined />}
              suffix="ms"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最大吞吐量"
              value={performanceStats.maxThroughput}
              prefix={<ThunderboltOutlined />}
              suffix="次/小时"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均错误率"
              value={performanceStats.avgErrorRate}
              prefix={<WarningOutlined />}
              suffix="%"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均可用性"
              value={performanceStats.avgAvailability}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能趋势图表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="响应时间趋势">
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#fafafa',
              border: '1px dashed #d9d9d9'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>📈 响应时间趋势</div>
                <div style={{ fontSize: '12px' }}>显示各系统接口的响应时间变化趋势</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="吞吐量分析">
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#fafafa',
              border: '1px dashed #d9d9d9'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>📊 吞吐量分析</div>
                <div style={{ fontSize: '12px' }}>显示请求处理成功率和失败率统计</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 性能详情表格 */}
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
            <RangePicker showTime />
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button icon={<DownloadOutlined />}>导出报告</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={performanceData}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PerformanceMonitoring;