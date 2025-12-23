import React from 'react';
import { Card, Row, Col, DatePicker, Button, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { RangePicker } = DatePicker;

const Reports = () => {
  const productionData = [
    { name: '周一', output: 1200, target: 1000 },
    { name: '周二', output: 1350, target: 1000 },
    { name: '周三', output: 980, target: 1000 },
    { name: '周四', output: 1180, target: 1000 },
    { name: '周五', output: 1420, target: 1000 },
    { name: '周六', output: 800, target: 800 },
    { name: '周日', output: 600, target: 600 }
  ];

  const qualityData = [
    { name: '合格品', value: 95, color: '#52c41a' },
    { name: '不良品', value: 3, color: '#ff4d4f' },
    { name: '返工品', value: 2, color: '#faad14' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>报表分析</h1>
      
      <Card style={{ marginBottom: '16px' }}>
        <Space>
          <RangePicker />
          <Button type="primary">查询</Button>
          <Button>导出Excel</Button>
          <Button>导出PDF</Button>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="生产产量分析" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="target" fill="#d9d9d9" name="目标产量" />
                <Bar dataKey="output" fill="#1890ff" name="实际产量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="质量分析" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;