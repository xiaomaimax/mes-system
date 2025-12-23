import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber, Upload } from 'antd';
import { PlusOutlined, SearchOutlined, BookOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

const InspectionStandards = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const standardsData = [
    {
      key: '1',
      standardCode: 'STD-001',
      standardName: '产品A外观检验标准',
      productCode: 'PROD-A001',
      productName: '产品A',
      inspectionType: 'appearance',
      version: 'V1.2',
      effectiveDate: '2024-01-01',
      expiryDate: '2025-01-01',
      approver: '质量经理',
      status: 'active',
      inspectionItems: [
        { item: '表面光洁度', standard: '≤Ra1.6', method: '目视检查' },
        { item: '颜色一致性', standard: '色差≤2', method: '色差仪检测' },
        { item: '划痕深度', standard: '≤0.1mm', method: '深度规测量' }
      ],
      documents: ['检验标准文件.pdf', '检验作业指导书.pdf']
    }
  ];

  const columns = [
    {
      title: '标准编码',
      dataIndex: 'standardCode',
      key: 'standardCode',
      width: 120,
    },
    {
      title: '标准名称',
      dataIndex: 'standardName',
      key: 'standardName',
      width: 200,
    },
    {
      title: '适用产品',
      key: 'product',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
        </div>
      )
    },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 120,
      render: (type) => {
        const typeMap = {
          appearance: { color: 'blue', text: '外观检验' },
          dimension: { color: 'green', text: '尺寸检验' },
          function: { color: 'orange', text: '功能检验' },
          performance: { color: 'purple', text: '性能检验' }
        };
        const { color, text } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 100,
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 100,
    },
    {
      title: '批准人',
      dataIndex: 'approver',
      key: 'approver',
      width: 100,
    },
    {
      title: '检验项目数',
      dataIndex: 'inspectionItems',
      key: 'inspectionItems',
      width: 100,
      render: (items) => `${items.length} 项`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '生效' : '失效'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small">
            版本管理
          </Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <BookOutlined />
            检验标准主数据
          </Space>
        }
        extra={
          <Space>
            <Button>导入标准</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建标准
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索标准编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="检验类型" style={{ width: 120 }}>
              <Option value="appearance">外观检验</Option>
              <Option value="dimension">尺寸检验</Option>
              <Option value="function">功能检验</Option>
              <Option value="performance">性能检验</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 100 }}>
              <Option value="active">生效</Option>
              <Option value="inactive">失效</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={standardsData}
          loading={loading}
          pagination={{
            total: standardsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default InspectionStandards;