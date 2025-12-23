import React from 'react';
import { Card, Row, Col, Statistic, Table, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const Quality = () => {
  const qualityData = [
    {
      key: '1',
      orderNumber: 'PO-2024-001',
      productName: '产品A',
      inspectedQuantity: 1000,
      qualifiedQuantity: 985,
      defectiveQuantity: 15,
      qualityRate: 98.5,
      inspector: '张三',
      inspectionDate: '2024-01-15'
    },
    {
      key: '2',
      orderNumber: 'PO-2024-002',
      productName: '产品B',
      inspectedQuantity: 500,
      qualifiedQuantity: 490,
      defectiveQuantity: 10,
      qualityRate: 98.0,
      inspector: '李四',
      inspectionDate: '2024-01-14'
    }
  ];

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '检验数量',
      dataIndex: 'inspectedQuantity',
      key: 'inspectedQuantity',
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
    },
    {
      title: '不良数量',
      dataIndex: 'defectiveQuantity',
      key: 'defectiveQuantity',
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 95 ? 'success' : rate >= 90 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
    },
    {
      title: '检验日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>质量管理</h1>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日合格率"
              value={98.2}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="不良品数量"
              value={25}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="待检验数量"
              value={150}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="质量检验记录">
        <Table
          columns={columns}
          dataSource={qualityData}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>
    </div>
  );
};

export default Quality;