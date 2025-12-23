import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';

const Inventory = () => {
  const inventoryData = [
    {
      key: '1',
      materialCode: 'MAT-001',
      materialName: '原料A',
      currentStock: 1500,
      minStock: 500,
      maxStock: 3000,
      unit: 'kg',
      location: '仓库A-01',
      status: 'normal'
    },
    {
      key: '2',
      materialCode: 'MAT-002',
      materialName: '原料B',
      currentStock: 300,
      minStock: 500,
      maxStock: 2000,
      unit: 'kg',
      location: '仓库A-02',
      status: 'low'
    },
    {
      key: '3',
      materialCode: 'MAT-003',
      materialName: '包装材料',
      currentStock: 2800,
      minStock: 1000,
      maxStock: 3000,
      unit: '个',
      location: '仓库B-01',
      status: 'high'
    }
  ];

  const statusColors = {
    normal: 'green',
    low: 'red',
    high: 'orange'
  };

  const statusLabels = {
    normal: '正常',
    low: '库存不足',
    high: '库存过多'
  };

  const columns = [
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
      render: (stock, record) => `${stock} ${record.unit}`
    },
    {
      title: '最小库存',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (stock, record) => `${stock} ${record.unit}`
    },
    {
      title: '最大库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      render: (stock, record) => `${stock} ${record.unit}`
    },
    {
      title: '存储位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button size="small">入库</Button>
          <Button size="small">出库</Button>
          <Button size="small">调整</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>库存管理</h1>
      
      <Card title="库存列表">
        <Table
          columns={columns}
          dataSource={inventoryData}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 种物料`
          }}
        />
      </Card>
    </div>
  );
};

export default Inventory;