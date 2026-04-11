import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, DatePicker, Select, Table, Progress, Tag, Statistic, Spin, Alert, Space, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import moment from 'moment';
import './OEEDashboard.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const OEEDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [oeeData, setOeeData] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);

  const fetchOEEData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      };
      
      const response = await axios.get('/api/oee/overview', { params });
      
      if (response.data.success) {
        setOeeData(response.data);
      } else {
        setError(response.data.message || '获取 OEE 数据失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOEEData();
  }, []);

  const handleDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
    }
  };

  const onRefreshClick = () => {
    fetchOEEData();
  };

  const getOEEColor = (oee) => {
    if (oee >= 85) return '#52c41a';
    if (oee >= 70) return '#1890ff';
    if (oee >= 50) return '#faad14';
    return '#f5222d';
  };

  const getOEELabel = (oee) => {
    if (oee >= 85) return '世界级';
    if (oee >= 70) return '良好';
    if (oee >= 50) return '一般';
    return '需改进';
  };

  const equipmentColumns = [
    {
      title: '设备ID',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 80,
    },
    {
      title: 'OEE',
      dataIndex: 'oee',
      key: 'oee',
      width: 150,
      render: (oee) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={oee}
            size="small"
            strokeColor={getOEEColor(oee)}
            style={{ width: 80 }}
          />
          <Text strong style={{ color: getOEEColor(oee) }}>{oee}%</Text>
        </div>
      ),
      sorter: (a, b) => a.oee - b.oee,
    },
    {
      title: '可用率 (A)',
      dataIndex: 'availability',
      key: 'availability',
      width: 100,
      render: (val) => <Text type={val >= 90 ? 'success' : 'warning'}>{val}%</Text>,
    },
    {
      title: '性能率 (P)',
      dataIndex: 'performance',
      key: 'performance',
      width: 100,
      render: (val) => <Text type={val >= 95 ? 'success' : 'warning'}>{val}%</Text>,
    },
    {
      title: '质量率 (Q)',
      dataIndex: 'quality',
      key: 'quality',
      width: 100,
      render: (val) => <Text type={val >= 99 ? 'success' : 'warning'}>{val}%</Text>,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = record.oee >= 85 ? 'success' : record.oee >= 70 ? 'processing' : record.oee >= 50 ? 'exception' : 'error';
        return <Tag color={status}>{getOEELabel(record.oee)}</Tag>;
      },
    },
  ];

  if (loading && !oeeData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="加载 OEE 数据..." />
      </div>
    );
  }

  return (
    <div className="oee-dashboard">
      <div className="oee-header">
        <div>
          <h1>📊 OEE 监控看板</h1>
          <Text type="secondary">
            Overall Equipment Effectiveness - 设备综合效率
          </Text>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            allowClear={false}
          />
          <Select
            defaultValue="day"
            style={{ width: 100 }}
            options={[
              { value: 'day', label: '按天' },
              { value: 'week', label: '按周' },
              { value: 'month', label: '按月' },
            ]}
          />
        </Space>
      </div>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {oeeData && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card bordered>
                <Statistic
                  title="平均 OEE"
                  value={oeeData.summary.avgOEE}
                  suffix="%"
                  valueStyle={{ 
                    color: getOEEColor(oeeData.summary.avgOEE),
                    fontSize: 36
                  }}
                  prefix={<span style={{ fontSize: 24 }}>🎯</span>}
                />
                <div style={{ marginTop: 8 }}>
                  <Progress
                    percent={oeeData.summary.avgOEE}
                    showInfo={false}
                    strokeColor={getOEEColor(oeeData.summary.avgOEE)}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    世界级标准: 85%
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered>
                <Statistic
                  title="平均可用率 (A)"
                  value={oeeData.summary.avgAvailability}
                  suffix="%"
                  valueStyle={{ color: '#1890ff', fontSize: 36 }}
                  prefix={<span style={{ fontSize: 24 }}>⚡</span>}
                />
                <Text type="secondary">
                  运行时间 / 计划时间
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered>
                <Statistic
                  title="平均性能率 (P)"
                  value={oeeData.summary.avgPerformance}
                  suffix="%"
                  valueStyle={{ color: '#722ed1', fontSize: 36 }}
                  prefix={<span style={{ fontSize: 24 }}>🚀</span>}
                />
                <Text type="secondary">
                  实际产量 / 理论产量
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered>
                <Statistic
                  title="平均质量率 (Q)"
                  value={oeeData.summary.avgQuality}
                  suffix="%"
                  valueStyle={{ color: '#52c41a', fontSize: 36 }}
                  prefix={<span style={{ fontSize: 24 }}>✅</span>}
                />
                <Text type="secondary">
                  合格品 / 总检验数
                </Text>
              </Card>
            </Col>
          </Row>

          <Card 
            title="📐 OEE 计算公式" 
            size="small" 
            style={{ marginBottom: 24 }}
            extra={<Tag color="blue">OEE = A × P × Q</Tag>}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Text><Text strong>可用率 (Availability)</Text> = 运行时间 / 计划时间</Text>
                <br />
                <Text type="secondary">反映设备停机造成的损失</Text>
              </Col>
              <Col span={8}>
                <Text><Text strong>性能率 (Performance)</Text> = 实际产量 / 理论产量</Text>
                <br />
                <Text type="secondary">反映设备速度降低造成的损失</Text>
              </Col>
              <Col span={8}>
                <Text><Text strong>质量率 (Quality)</Text> = 合格品 / 总产量</Text>
                <br />
                <Text type="secondary">反映产品不良造成的损失</Text>
              </Col>
            </Row>
          </Card>

          <Card 
            title="🏭 设备 OEE 明细" 
            extra={
              <a onClick={onRefreshClick}>刷新</a>
            }
          >
            <Table
              columns={equipmentColumns}
              dataSource={oeeData.equipment}
              rowKey="equipmentId"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>

          <Card title="📋 OEE 等级标准" size="small" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" style={{ background: '#f6ffed', borderColor: '#52c41a' }}>
                  <Tag color="#52c41a">≥ 85%</Tag>
                  <Text strong>世界级</Text>
                  <br />
                  <Text type="secondary">最佳实践水平</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ background: '#e6f7ff', borderColor: '#1890ff' }}>
                  <Tag color="#1890ff">70-84%</Tag>
                  <Text strong>良好</Text>
                  <br />
                  <Text type="secondary">高于平均水平</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ background: '#fffbe6', borderColor: '#faad14' }}>
                  <Tag color="#faad14">50-69%</Tag>
                  <Text strong>一般</Text>
                  <br />
                  <Text type="secondary">需要改进</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ background: '#fff1f0', borderColor: '#f5222d' }}>
                  <Tag color="#f5222d">≤ 50%</Tag>
                  <Text strong>需改进</Text>
                  <br />
                  <Text type="secondary">严重问题</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default OEEDashboard;
