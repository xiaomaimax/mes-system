import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input } from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined } from '@ant-design/icons';

const OQCInspection = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const oqcData = [
    {
      key: '1',
      inspectionId: 'OQC-2024-001',
      shipmentNo: 'SHIP-2024-001',
      customerName: '客户A',
      productCode: 'PROD-A001',
      productName: '产品A',
      batchNo: 'BATCH-A001',
      shipmentQuantity: 500,
      sampleQuantity: 25,
      qualifiedQuantity: 25,
      defectiveQuantity: 0,
      qualityRate: 100.0,
      inspectionDate: '2024-01-15',
      inspector: '李四',
      result: 'pass',
      status: 'completed'
    }
  ];

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
    },
    {
      title: '出货单号',
      dataIndex: 'shipmentNo',
      key: 'shipmentNo',
      width: 120,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '产品信息',
      key: 'product',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>批次: {record.batchNo}</div>
        </div>
      )
    },
    {
      title: '出货数量',
      dataIndex: 'shipmentQuantity',
      key: 'shipmentQuantity',
      width: 100,
    },
    {
      title: '抽样数量',
      dataIndex: 'sampleQuantity',
      key: 'sampleQuantity',
      width: 100,
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 100,
      render: (rate) => `${rate}%`
    },
    {
      title: '检验日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100,
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 80,
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const resultMap = {
          pass: { color: 'green', text: '合格' },
          fail: { color: 'red', text: '不合格' },
          pending: { color: 'blue', text: '待检验' }
        };
        const { color, text } = resultMap[result];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <ExportOutlined />
            OQC出货质量检验
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建检验单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={oqcData}
          loading={loading}
          pagination={{
            total: oqcData.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default OQCInspection;