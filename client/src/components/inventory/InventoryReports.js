import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Select, DatePicker, Table, Statistic, Progress, Divider, Tag } from 'antd';
import { BarChartOutlined, DownloadOutlined, PrinterOutlined, FileExcelOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryReports = () => {
  const [reportType, setReportType] = useState('inventory-summary');
  const [dateRange, setDateRange] = useState(null);
  const [warehouse, setWarehouse] = useState('all');

  // 库存汇总报表数据
  const inventorySummaryData = [
    {
      key: '1',
      category: '原材料',
      totalValue: 1200000,
      totalQuantity: 15680,
      avgCost: 76.53,
      turnoverRate: 4.2,
      stockDays: 87,
      status: 'normal'
    },
    {
      key: '2',
      category: '半成品',
      totalValue: 450000,
      totalQuantity: 3200,
      avgCost: 140.63,
      turnoverRate: 6.8,
      stockDays: 54,
      status: 'good'
    },
    {
      key: '3',
      category: '成品',
      totalValue: 680000,
      totalQuantity: 2150,
      avgCost: 316.28,
      turnoverRate: 8.5,
      stockDays: 43,
      status: 'good'
    },
    {
      key: '4',
      category: '备件',
      totalValue: 520000,
      totalQuantity: 8900,
      avgCost: 58.43,
      turnoverRate: 2.1,
      stockDays: 174,
      status: 'warning'
    }
  ];

  // 库存周转报表数据
  const turnoverData = [
    {
      key: '1',
      materialCode: 'M001',
      materialName: '轴承6205',
      beginStock: 100,
      inQuantity: 200,
      outQuantity: 180,
      endStock: 120,
      avgStock: 110,
      turnoverRate: 1.64,
      stockDays: 223
    },
    {
      key: '2',
      materialCode: 'M002',
      materialName: '密封圈',
      beginStock: 500,
      inQuantity: 800,
      outQuantity: 750,
      endStock: 550,
      avgStock: 525,
      turnoverRate: 1.43,
      stockDays: 255
    }
  ];

  // 库存预警报表数据
  const alertData = [
    {
      key: '1',
      materialCode: 'M003',
      materialName: '液压油',
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      alertType: 'low',
      lastInDate: '2024-12-10',
      avgConsumption: 2.5
    },
    {
      key: '2',
      materialCode: 'M004',
      materialName: '滤芯',
      currentStock: 2,
      minStock: 5,
      maxStock: 20,
      alertType: 'critical',
      lastInDate: '2024-12-08',
      avgConsumption: 1.2
    }
  ];

  const summaryColumns = [
    {
      title: '物料类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '库存总值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value) => `¥${(value / 10000).toFixed(1)}万`,
      sorter: (a, b) => a.totalValue - b.totalValue,
    },
    {
      title: '库存数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: '平均成本',
      dataIndex: 'avgCost',
      key: 'avgCost',
      render: (value) => `¥${value.toFixed(2)}`,
      sorter: (a, b) => a.avgCost - b.avgCost,
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (value) => `${value}次/年`,
      sorter: (a, b) => a.turnoverRate - b.turnoverRate,
    },
    {
      title: '库存天数',
      dataIndex: 'stockDays',
      key: 'stockDays',
      render: (value) => `${value}天`,
      sorter: (a, b) => a.stockDays - b.stockDays,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          good: 'green',
          normal: 'blue',
          warning: 'orange',
          critical: 'red'
        };
        const texts = {
          good: '良好',
          normal: '正常',
          warning: '预警',
          critical: '紧急'
        };
        return <Tag color={colors[status]}>{texts[status]}</Tag>;
      }
    }
  ];

  const turnoverColumns = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '期初库存',
      dataIndex: 'beginStock',
      key: 'beginStock',
    },
    {
      title: '入库数量',
      dataIndex: 'inQuantity',
      key: 'inQuantity',
    },
    {
      title: '出库数量',
      dataIndex: 'outQuantity',
      key: 'outQuantity',
    },
    {
      title: '期末库存',
      dataIndex: 'endStock',
      key: 'endStock',
    },
    {
      title: '平均库存',
      dataIndex: 'avgStock',
      key: 'avgStock',
    },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (value) => `${value}次`,
      sorter: (a, b) => a.turnoverRate - b.turnoverRate,
    },
    {
      title: '库存天数',
      dataIndex: 'stockDays',
      key: 'stockDays',
      render: (value) => `${value}天`,
      sorter: (a, b) => a.stockDays - b.stockDays,
    }
  ];

  const alertColumns = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
    },
    {
      title: '最低库存',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: '最高库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      render: (type) => {
        const colors = {
          low: 'orange',
          critical: 'red',
          high: 'blue'
        };
        const texts = {
          low: '库存不足',
          critical: '紧急缺货',
          high: '库存过多'
        };
        return <Tag color={colors[type]}>{texts[type]}</Tag>;
      }
    },
    {
      title: '最后入库',
      dataIndex: 'lastInDate',
      key: 'lastInDate',
    },
    {
      title: '日均消耗',
      dataIndex: 'avgConsumption',
      key: 'avgConsumption',
      render: (value) => `${value}/天`,
    }
  ];

  const handleExport = (format) => {
    console.log(`导出${format}格式报表`);
    // 这里实现导出逻辑
  };

  const handlePrint = () => {
    console.log('打印报表');
    // 这里实现打印逻辑
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'inventory-summary':
        return (
          <Card title="库存汇总报表" size="small">
            <Table
              columns={summaryColumns}
              dataSource={inventorySummaryData}
              pagination={false}
              size="small"
            />
          </Card>
        );
      case 'turnover-analysis':
        return (
          <Card title="库存周转分析" size="small">
            <Table
              columns={turnoverColumns}
              dataSource={turnoverData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              size="small"
            />
          </Card>
        );
      case 'stock-alert':
        return (
          <Card title="库存预警报表" size="small">
            <Table
              columns={alertColumns}
              dataSource={alertData}
              pagination={false}
              size="small"
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0 }}>库存报表分析</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            库存数据分析，支持多维度报表查询和导出
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}>
            刷新数据
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            打印
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
            导出Excel
          </Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
            导出PDF
          </Button>
        </Space>
      </div>

      {/* 查询条件 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space>
              <span>报表类型：</span>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 200 }}
              >
                <Option value="inventory-summary">库存汇总报表</Option>
                <Option value="turnover-analysis">库存周转分析</Option>
                <Option value="stock-alert">库存预警报表</Option>
                <Option value="abc-analysis">ABC分析报表</Option>
                <Option value="aging-analysis">库龄分析报表</Option>
              </Select>
            </Space>
          </Col>
          <Col span={6}>
            <Space>
              <span>仓库：</span>
              <Select
                value={warehouse}
                onChange={setWarehouse}
                style={{ width: 150 }}
              >
                <Option value="all">全部仓库</Option>
                <Option value="main">主仓库A</Option>
                <Option value="workshop">车间仓库B</Option>
                <Option value="maintenance">维修仓库C</Option>
                <Option value="finished">成品仓库D</Option>
              </Select>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <span>日期范围：</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 240 }}
              />
            </Space>
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<BarChartOutlined />}>
              生成报表
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 关键指标概览 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="库存总值"
              value={2850000}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={85} size="small" showInfo={false} />
              <span style={{ fontSize: '12px', color: '#666' }}>预算执行率 85%</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="平均周转率"
              value={4.8}
              precision={1}
              suffix="次/年"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={96} size="small" showInfo={false} strokeColor="#52c41a" />
              <span style={{ fontSize: '12px', color: '#666' }}>目标达成率 96%</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="库存准确率"
              value={98.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={98.5} size="small" showInfo={false} strokeColor="#722ed1" />
              <span style={{ fontSize: '12px', color: '#666' }}>行业领先水平</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="预警物料"
              value={8}
              suffix="种"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="red">紧急 3种</Tag>
              <Tag color="orange">一般 5种</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 报表内容 */}
      {renderReportContent()}

      {/* 报表说明 */}
      <Card title="报表说明" size="small" style={{ marginTop: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <h4>指标说明：</h4>
            <ul style={{ fontSize: '12px', color: '#666' }}>
              <li><strong>库存周转率：</strong>年度出库总额 ÷ 平均库存金额</li>
              <li><strong>库存天数：</strong>365天 ÷ 库存周转率</li>
              <li><strong>库存准确率：</strong>盘点准确数量 ÷ 盘点总数量 × 100%</li>
              <li><strong>预警类型：</strong>根据最低库存和最高库存设置的预警规则</li>
            </ul>
          </Col>
          <Col span={12}>
            <h4>分析建议：</h4>
            <ul style={{ fontSize: '12px', color: '#666' }}>
              <li>周转率低于2次/年的物料需要重点关注，考虑减少采购量</li>
              <li>库存天数超过180天的物料可能存在呆滞风险</li>
              <li>紧急预警物料需要立即补充，避免影响生产</li>
              <li>定期进行ABC分析，优化库存结构和管理策略</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InventoryReports;