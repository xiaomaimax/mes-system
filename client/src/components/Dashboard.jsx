import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dashboard as DashboardCharts } from './Charts';
import { Spin, Card, Button, DatePicker, Space, message } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [productionData, setProductionData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟数据 - 实际应该从后端 API 获取
      setStats({
        todayProduction: 1250,
        productionTrend: 8.5,
        totalInventory: 85420,
        inventoryTrend: -3.2,
        qualityRate: 98.7,
        qualityTrend: 1.2,
        issues: 23
      });

      setProductionData([
        { date: '04-01', quantity: 1100 },
        { date: '04-02', quantity: 1180 },
        { date: '04-03', quantity: 1050 },
        { date: '04-04', quantity: 1250 },
        { date: '04-05', quantity: 1320 },
        { date: '04-06', quantity: 980 },
        { date: '04-07', quantity: 1250 }
      ]);

      setInventoryData([
        { type: '原材料', quantity: 45230 },
        { type: '半成品', quantity: 23450 },
        { type: '成品', quantity: 16740 }
      ]);

      setQualityData([
        { status: '合格', count: 4850 },
        { status: '返工', count: 78 },
        { status: '报废', count: 52 }
      ]);

    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // 导出仪表盘数据
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/dashboard/export', {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard_export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 初始加载
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 日期范围变化时重新加载数据
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载仪表盘数据..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        background: '#fff',
        padding: '16px 24px',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
          📊 MaxMES 数据仪表盘
        </h1>

        <Space>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['开始日期', '结束日期']}
            allowClear={false}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            type="primary"
          >
            导出报表
          </Button>
        </Space>
      </div>

      {/* 图表内容 */}
      <DashboardCharts
        stats={stats}
        productionData={productionData}
        inventoryData={inventoryData}
        qualityData={qualityData}
      />
    </div>
  );
};

export default Dashboard;
