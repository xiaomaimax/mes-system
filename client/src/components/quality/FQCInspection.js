import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, CheckSquareOutlined, EditOutlined } from '@ant-design/icons';

const FQCInspection = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const fqcData = [
    {
      key: '1',
      inspectionId: 'FQC-2024-001',
      productionOrderNo: 'PO-2024-001',
      productCode: 'PROD-A001',
      productName: '产品A',
      batchNo: 'BATCH-A001',
      inspectionDate: '2024-01-15',
      inspector: '张三',
      totalQuantity: 1000,
      sampleQuantity: 50,
      qualifiedQuantity: 48,
      defectiveQuantity: 2,
      qualityRate: 96.0,
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
      title: '生产订单',
      dataIndex: 'productionOrderNo',
      key: 'productionOrderNo',
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
      title: '数量统计',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <div>
          <div>总数: {record.totalQuantity}</div>
          <div>抽样: {record.sampleQuantity}</div>
          <div style={{ color: '#52c41a' }}>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: '#ff4d4f' }}>不合格: {record.defectiveQuantity}</div>
        </div>
      )
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 100,
      render: (rate) => `${rate}%`
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待检验' },
          completed: { color: 'green', text: '已完成' }
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
            <CheckSquareOutlined />
            FQC成品质量检验
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
          dataSource={fqcData}
          loading={loading}
          pagination={{
            total: fqcData.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default FQCInspection;