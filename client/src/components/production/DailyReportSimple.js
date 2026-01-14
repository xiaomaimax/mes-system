import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  DatePicker, 
  Row,
  Col,
  Statistic,
  Tag,
  Progress
} from 'antd';
import { 
  CalendarOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ButtonActions from '../../utils/buttonActions';
const DailyReportSimple = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [reportDate, setReportDate] = useState(dayjs());

  // 简化的日报数据
  const reportData = [
    {
      key: '1',
      workshop: '车间A',
      shift: '白班',
      planQuantity: 1000,
      actualQuantity: 950,
      completionRate: 95.0,
      qualifiedRate: 96.8,
      efficiency: 92.5
    },
    {
      key: '2',
      workshop: '车间B', 
      shift: '夜班',
      planQuantity: 800,
      actualQuantity: 720,
      completionRate: 90.0,
      qualifiedRate: 97.2,
      efficiency: 88.0
    }
  ];

  const columns = [
    {
      title: '车间',
      dataIndex: 'workshop',
      key: 'workshop'
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => (
        <Tag color={shift === '白班' ? 'blue' : 'purple'}>{shift}</Tag>
      )
    },
    {
      title: '产量完成',
      key: 'production',
      render: (_, record) => (
        <div>
          <div>{record.actualQuantity}/{record.planQuantity}</div>
          <Progress percent={record.completionRate} size="small" />
        </div>
      )
    },
    {
      title: '合格率',
      dataIndex: 'qualifiedRate',
      key: 'qualifiedRate',
      render: (rate) => `${rate}%`
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency) => (
        <span style={{ 
          color: efficiency >= 95 ? '#52c41a' : efficiency >= 85 ? '#faad14' : '#ff4d4f' 
        }}>
          {efficiency}%
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CalendarOutlined />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>生产日报</span>
              <DatePicker 
                value={reportDate}
                onChange={setReportDate}
                format="YYYY-MM-DD"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="计划产量"
              value={1800}
              suffix="件"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="实际产量"
              value={1670}
              suffix="件"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={92.8}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合格率"
              value={97.0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="生产日报详情">
        <Table
          columns={columns}
          dataSource={reportData}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DailyReportSimple;