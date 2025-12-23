import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Statistic, Row, Col } from 'antd';
import { SearchOutlined, HistoryOutlined, ExclamationCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const DefectRecords = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const defectRecordsData = [
    {
      key: '1',
      recordId: 'DEF-2024-001',
      inspectionId: 'IQC-2024-001',
      inspectionType: 'IQC',
      productCode: 'PROD-A001',
      productName: '产品A',
      batchNo: 'BATCH-001',
      defectType: '尺寸偏差',
      defectDescription: '长度超出公差范围+0.5mm',
      defectQuantity: 2,
      totalQuantity: 50,
      defectRate: 4.0,
      severity: 'medium',
      rootCause: '模具磨损',
      correctionAction: '更换模具',
      responsiblePerson: '张三',
      occurredDate: '2024-01-15',
      resolvedDate: '2024-01-16',
      status: 'resolved',
      cost: 500.00
    }
  ];

  // 统计数据
  const summaryData = {
    totalDefects: 25,
    resolvedDefects: 20,
    pendingDefects: 5,
    totalCost: 12500.00,
    avgResolutionTime: 1.5
  };

  const columns = [
    {
      title: '记录编号',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 120,
    },
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
    },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 80,
      render: (type) => {
        const typeMap = {
          IQC: { color: 'blue', text: 'IQC' },
          PQC: { color: 'green', text: 'PQC' },
          FQC: { color: 'orange', text: 'FQC' },
          OQC: { color: 'purple', text: 'OQC' }
        };
        const { color, text } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '产品信息',
      key: 'product',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>批次: {record.batchNo}</div>
        </div>
      )
    },
    {
      title: '缺陷类型',
      dataIndex: 'defectType',
      key: 'defectType',
      width: 120,
    },
    {
      title: '缺陷描述',
      dataIndex: 'defectDescription',
      key: 'defectDescription',
      width: 200,
    },
    {
      title: '缺陷统计',
      key: 'defectStats',
      width: 120,
      render: (_, record) => (
        <div>
          <div>缺陷: {record.defectQuantity}</div>
          <div>总数: {record.totalQuantity}</div>
          <div style={{ color: '#ff4d4f' }}>缺陷率: {record.defectRate}%</div>
        </div>
      )
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const severityMap = {
          high: { color: 'red', text: '高' },
          medium: { color: 'orange', text: '中' },
          low: { color: 'green', text: '低' }
        };
        const { color, text } = severityMap[severity];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '根本原因',
      dataIndex: 'rootCause',
      key: 'rootCause',
      width: 120,
    },
    {
      title: '纠正措施',
      dataIndex: 'correctionAction',
      key: 'correctionAction',
      width: 120,
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      width: 80,
    },
    {
      title: '发生日期',
      dataIndex: 'occurredDate',
      key: 'occurredDate',
      width: 100,
    },
    {
      title: '解决日期',
      dataIndex: 'resolvedDate',
      key: 'resolvedDate',
      width: 100,
      render: (date) => date || '-'
    },
    {
      title: '损失成本',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => `¥${cost.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          in_progress: { color: 'blue', text: '处理中' },
          resolved: { color: 'green', text: '已解决' },
          closed: { color: 'gray', text: '已关闭' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button type="link" size="small">
            处理
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总缺陷数"
              value={summaryData.totalDefects}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已解决"
              value={summaryData.resolvedDefects}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="待处理"
              value={summaryData.pendingDefects}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="总损失成本"
              value={summaryData.totalCost}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均解决时间"
              value={summaryData.avgResolutionTime}
              suffix="天"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Button 
              type="primary" 
              icon={<BarChartOutlined />} 
              style={{ width: '100%' }}
            >
              缺陷分析报告
            </Button>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <HistoryOutlined />
            次品记录管理
          </Space>
        }
        extra={
          <Space>
            <Button>导出报告</Button>
            <Button type="primary">
              缺陷趋势分析
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索记录编号/产品"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="检验类型" style={{ width: 100 }}>
              <Option value="IQC">IQC</Option>
              <Option value="PQC">PQC</Option>
              <Option value="FQC">FQC</Option>
              <Option value="OQC">OQC</Option>
            </Select>
            <Select placeholder="缺陷类型" style={{ width: 120 }}>
              <Option value="尺寸偏差">尺寸偏差</Option>
              <Option value="表面划痕">表面划痕</Option>
              <Option value="功能失效">功能失效</Option>
            </Select>
            <Select placeholder="严重程度" style={{ width: 100 }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 100 }}>
              <Option value="pending">待处理</Option>
              <Option value="in_progress">处理中</Option>
              <Option value="resolved">已解决</Option>
              <Option value="closed">已关闭</Option>
            </Select>
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={defectRecordsData}
          loading={loading}
          pagination={{
            total: defectRecordsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>
    </div>
  );
};

export default DefectRecords;