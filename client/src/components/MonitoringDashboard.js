import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Button, Typography, Alert, Spin, Empty } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ServerOutlined,
  DatabaseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const MonitoringDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 获取 Dashboard 数据
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get('http://192.168.100.6:5001/api/dashboard/overview', config);
      setData(response.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 初始加载和定时刷新（30 秒）
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载监控数据中..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!data) {
    return <Empty description="暂无数据" />;
  }

  const { summary, performance, cache, system } = data;

  // 状态标签颜色
  const getStatusColor = (status) => {
    if (status === 'healthy' || status === 'ok') return 'success';
    if (status === 'warning') return 'warning';
    return 'error';
  };

  return (
    <div style={{ padding: '12px' }}>
      {/* 标题栏 */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={3} style={{ margin: 0 }}>
          <DashboardOutlined /> 系统监控
        </Title>
        <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
          最后更新：{lastUpdate.toLocaleTimeString()}
          <Button 
            type="link" 
            icon={<ReloadOutlined />} 
            onClick={fetchDashboardData}
            style={{ marginLeft: '16px' }}
          >
            刷新
          </Button>
        </Text>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="QPS (每秒请求数)"
              value={summary.qps?.current || 0}
              suffix="次/秒"
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
              峰值：{summary.qps?.peak || 0} 次/秒
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均响应时间"
              value={summary.avgResponseTime || 0}
              suffix="ms"
              valueStyle={{ color: summary.avgResponseTime > 200 ? '#faad14' : '#52c41a' }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
              目标：{'<'} 200ms
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="错误率"
              value={parseFloat(summary.errorRate) || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: parseFloat(summary.errorRate) > 1 ? '#ff4d4f' : '#52c41a' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
              目标：{'<'} 1%
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="缓存命中率"
              value={parseFloat(summary.cacheHitRate) || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: parseFloat(summary.cacheHitRate) < 70 ? '#faad14' : '#52c41a' }}
              prefix={<DatabaseOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
              目标：> 70%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统状态和性能统计 */}
      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
        <Col span={12}>
          <Card size="small" title="性能统计" bordered={false} style={{ height: "100%" }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>总请求数</Text>
                <Text strong>{(performance.totalRequests || 0).toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <Text type="success">成功：{(performance.successfulRequests || 0).toLocaleString()}</Text>
                <Text type="danger">失败：{(performance.failedRequests || 0).toLocaleString()}</Text>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>响应时间</Text>
                <Text>
                  {(performance.responseTime?.min || 0)}ms - {(performance.responseTime?.max || 0)}ms
                </Text>
              </div>
              <Progress
                percent={Math.min((performance.responseTime?.avg || 0) / 5, 100)}
                strokeColor={performance.responseTime?.avg > 200 ? '#faad14' : '#52c41a'}
                format={() => `平均：${performance.responseTime?.avg || 0}ms`}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>成功率</Text>
                <Text strong>{performance.successRate || '0%'}</Text>
              </div>
              <Progress
                percent={parseFloat(performance.successRate) || 0}
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="缓存统计" bordered={false} style={{ height: "100%" }}>
            <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {cache.hitRate || '0%'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>命中率</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {cache.memoryCacheSize || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>缓存键数量</div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                    {(cache.hits || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px' }}>命中次数</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center', background: '#fff1f0' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {(cache.misses || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px' }}>未命中次数</div>
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>缓存性能</Text>
                <Text>{cache.hitRate || '0%'}</Text>
              </div>
              <Progress
                percent={parseFloat(cache.hitRate) || 0}
                strokeColor={parseFloat(cache.hitRate) > 70 ? '#52c41a' : '#faad14'}
                format={(percent) => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统健康状态 */}
      <Card size="small" title="系统健康状态" bordered={false} style={{ marginBottom: '12px' }}>
        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                textAlign: 'center', 
                background: system.checks?.api === 'ok' ? '#f6ffed' : '#fff1f0' 
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {system.checks?.api === 'ok' ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: system.checks?.api === 'ok' ? '#52c41a' : '#ff4d4f' }}>
                {system.checks?.api === 'ok' ? '正常' : '异常'}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>API 服务</div>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                textAlign: 'center', 
                background: system.checks?.database === 'ok' ? '#f6ffed' : '#fff1f0' 
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {system.checks?.database === 'ok' ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: system.checks?.database === 'ok' ? '#52c41a' : '#ff4d4f' }}>
                {system.checks?.database === 'ok' ? '正常' : '异常'}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>数据库</div>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                textAlign: 'center', 
                background: system.checks?.cache ? '#f6ffed' : '#fffbe6' 
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {system.checks?.cache ? '✅' : '⚠️'}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: system.checks?.cache ? '#52c41a' : '#faad14' }}>
                {system.checks?.cache ? '正常' : '未启用'}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>缓存服务</div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 错误警告 */}
      {performance.failedRequests > 0 && (
        <Alert
          message="发现失败请求"
          description={`检测到 ${performance.failedRequests} 个失败请求，请查看日志获取详细信息`}
          type="warning"
          showIcon
          closable
        />
      )}
    </div>
  );
};

export default MonitoringDashboard;
