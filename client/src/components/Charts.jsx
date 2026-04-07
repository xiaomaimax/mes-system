import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, Statistic, Row, Col } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

// 折线图组件
const LineChartComponent = ({ title, data, xField, yField, color = '#1890ff' }) => {
  return (
    <Card title={title} bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={yField}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 柱状图组件
const BarChartComponent = ({ title, data, xField, yField, color = '#52c41a' }) => {
  return (
    <Card title={title} bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yField} fill={color} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 饼图组件
const PieChartComponent = ({ title, data, nameField, valueField, colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'] }) => {
  return (
    <Card title={title} bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueField}
            nameKey={nameField}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, prefix, suffix, trend, trendValue, color = '#1890ff' }) => {
  const isUp = trend === 'up';
  const trendIcon = isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = isUp ? '#52c41a' : '#f5222d';
  const trendText = `${trendValue}% 较上周`;

  return (
    <Card bordered={false}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color, fontSize: 24, fontWeight: 600 }}
      />
      {trend && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: trendColor, display: 'flex', alignItems: 'center', gap: 4 }}>
            {trendIcon} {trendText}
          </span>
        </div>
      )}
    </Card>
  );
};

// 综合仪表盘组件
const Dashboard = ({ stats = {}, productionData = [], inventoryData = [], qualityData = [] }) => {
  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="今日产量"
            value={stats.todayProduction || 0}
            prefix={<DollarOutlined />}
            trend="up"
            trendValue={stats.productionTrend || 0}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="库存总量"
            value={stats.totalInventory || 0}
            prefix={<ShoppingOutlined />}
            trend="down"
            trendValue={stats.inventoryTrend || 0}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="合格率"
            value={stats.qualityRate || 0}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            trend="up"
            trendValue={stats.qualityTrend || 0}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="异常数"
            value={stats.issues || 0}
            prefix={<WarningOutlined />}
            color="#f5222d"
          />
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 生产趋势 */}
        <Col xs={24} lg={12}>
          <LineChartComponent
            title="生产趋势（近7天）"
            data={productionData}
            xField="date"
            yField="quantity"
            color="#1890ff"
          />
        </Col>

        {/* 库存分布 */}
        <Col xs={24} lg={12}>
          <BarChartComponent
            title="库存分布（按物料类型）"
            data={inventoryData}
            xField="type"
            yField="quantity"
            color="#52c41a"
          />
        </Col>

        {/* 质量分析 */}
        <Col xs={24} lg={12}>
          <PieChartComponent
            title="质量检验结果分布"
            data={qualityData}
            nameField="status"
            valueField="count"
          />
        </Col>

        {/* 设备利用率 */}
        <Col xs={24} lg={12}>
          <BarChartComponent
            title="设备利用率（%）"
            data={[
              { name: '生产线A', value: 85 },
              { name: '生产线B', value: 78 },
              { name: '生产线C', value: 92 },
              { name: '生产线D', value: 88 }
            ]}
            xField="name"
            yField="value"
            color="#722ed1"
          />
        </Col>
      </Row>
    </div>
  );
};

export { LineChartComponent, BarChartComponent, PieChartComponent, StatCard, Dashboard };
export default Dashboard;
