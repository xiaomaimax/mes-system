import React, { useState } from 'react';
import { Card, Tabs, Button, Table, Tag, Row, Col, Statistic } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined, InboxOutlined, SendOutlined } from '@ant-design/icons';

const InventoryInOut = () => {
  const [activeTab, setActiveTab] = useState('in');

  const sampleData = [
    {
      key: '1',
      documentNo: 'IN-001',
      materialName: '示例物料',
      quantity: 100,
      unit: '个',
      date: '2024-12-18',
      status: 'completed'
    }
  ];

  const columns = [
    { title: '单号', dataIndex: 'documentNo', key: 'documentNo' },
    { title: '物料名称', dataIndex: 'materialName', key: 'materialName' },
    { title: '数量', key: 'quantity', render: (_, record) => `${record.quantity} ${record.unit}` },
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="green">已完成</Tag>
    }
  ];

  const tabItems = [
    {
      key: 'in',
      label: '入库管理',
      icon: <ImportOutlined />,
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="今日入库" value={28} suffix="笔" prefix={<InboxOutlined />} />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>新建入库单</Button>
          </div>
          <Card size="small">
            <Table columns={columns} dataSource={sampleData} pagination={false} size="small" />
          </Card>
        </div>
      )
    },
    {
      key: 'out',
      label: '出库管理',
      icon: <ExportOutlined />,
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="今日出库" value={45} suffix="笔" prefix={<SendOutlined />} />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}>新建出库单</Button>
          </div>
          <Card size="small">
            <Table columns={columns} dataSource={sampleData} pagination={false} size="small" />
          </Card>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>出入库管理</h2>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>管理物料的入库、出库操作</p>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="small" />
    </div>
  );
};

export default InventoryInOut;