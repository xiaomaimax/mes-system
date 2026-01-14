import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, Statistic, Progress, Table } from 'antd';
import { 
  LineChartOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ToolOutlined 
} from '@ant-design/icons';

const Dashboard = () => {
  console.log('Dashboard组件正在渲染...');
  
  // 模拟数据
  const recentOrders = [
    {
      key: '1',
      orderNumber: 'PO-2024-001',
      product: '产品A',
      status: '进行中',
      progress: 75
    },
    {
      key: '2',
      orderNumber: 'PO-2024-002',
      product: '产品B',
      status: '待开始',
      progress: 0
    },
    {
      key: '3',
      orderNumber: 'PO-2024-003',
      product: '产品C',
      status: '已完成',
      progress: 100
    }
  ];

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '产品',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <h1 style={{ marginBottom: '24px' }}>生产监控面板</h1>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日产量"
              value={1280}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合格率"
              value={98.5}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="设备利用率"
              value={87.2}
              precision={1}
              suffix="%"
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常数量"
              value={3}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 生产趋势图 */}
        <Col span={16}>
          <Card title="今日生产趋势" style={{ height: '400px' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>生产趋势图（图表组件暂时禁用）</p>
              <div style={{ background: '#f0f0f0', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                图表区域
              </div>
            </div>
          </Card>
        </Col>

        {/* 最近订单 */}
        <Col span={8}>
          <Card title="最近订单" style={{ height: '400px' }}>
            <Table
              columns={columns}
              dataSource={recentOrders}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

Dashboard.propTypes = {
  // Dashboard是独立组件，不接收props
};

Dashboard.defaultProps = {
};

export default Dashboard;