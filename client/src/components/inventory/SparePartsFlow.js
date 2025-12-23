import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Statistic, Row, Col } from 'antd';
import { SearchOutlined, TransactionOutlined, DownloadOutlined, FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SparePartsFlow = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const flowData = [
    {
      key: '1',
      flowId: 'FLOW-2024-001',
      partCode: 'EXT-SP-001',
      partName: '高精度轴承',
      supplier: '外部供应商A',
      transactionType: 'purchase',
      quantity: 20,
      unitPrice: 450.00,
      totalAmount: 9000.00,
      transactionDate: '2024-01-10',
      orderNumber: 'PO-2024-001',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      operator: '张三',
      department: '采购部',
      approver: '李经理',
      deliveryDate: '2024-01-17',
      invoiceNumber: 'INV-2024-001',
      paymentStatus: 'paid',
      qualityStatus: 'qualified',
      storageLocation: '外部仓库A',
      remarks: '正常采购，质量合格'
    },
    {
      key: '2',
      flowId: 'FLOW-2024-002',
      partCode: 'EXT-SP-002',
      partName: '进口密封圈',
      supplier: '外部供应商B',
      transactionType: 'return',
      quantity: 5,
      unitPrice: 85.00,
      totalAmount: 425.00,
      transactionDate: '2024-01-12',
      orderNumber: 'RET-2024-001',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      operator: '李四',
      department: '生产部',
      approver: '王主管',
      deliveryDate: '2024-01-15',
      invoiceNumber: 'RET-INV-001',
      paymentStatus: 'refunded',
      qualityStatus: 'defective',
      storageLocation: '退货区',
      remarks: '质量问题退货'
    },
    {
      key: '3',
      flowId: 'FLOW-2024-003',
      partCode: 'EXT-SP-001',
      partName: '高精度轴承',
      supplier: '外部供应商A',
      transactionType: 'usage',
      quantity: 2,
      unitPrice: 450.00,
      totalAmount: 900.00,
      transactionDate: '2024-01-15',
      orderNumber: 'USE-2024-001',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      operator: '王五',
      department: '维修部',
      approver: '赵工程师',
      deliveryDate: '2024-01-15',
      invoiceNumber: '-',
      paymentStatus: '-',
      qualityStatus: 'used',
      storageLocation: '设备现场',
      remarks: '设备维修使用'
    },
    {
      key: '4',
      flowId: 'FLOW-2024-004',
      partCode: 'EXT-SP-003',
      partName: '特殊传感器',
      supplier: '外部供应商C',
      transactionType: 'inquiry',
      quantity: 10,
      unitPrice: 1200.00,
      totalAmount: 12000.00,
      transactionDate: '2024-01-18',
      orderNumber: 'INQ-2024-001',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      operator: '钱七',
      department: '采购部',
      approver: '孙经理',
      deliveryDate: '2024-02-08',
      invoiceNumber: '-',
      paymentStatus: 'pending',
      qualityStatus: 'pending',
      storageLocation: '待确认',
      remarks: '询价中，等待报价'
    }
  ];

  // 统计数据
  const summaryData = {
    totalTransactions: 156,
    totalPurchaseAmount: 285000.00,
    totalReturnAmount: 12500.00,
    totalUsageAmount: 45000.00,
    pendingOrders: 8
  };

  const columns = [
    {
      title: '流水编号',
      dataIndex: 'flowId',
      key: 'flowId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '备件信息',
      key: 'partInfo',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.partName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.partCode}</div>
        </div>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type) => {
        const typeMap = {
          purchase: { color: 'green', text: '采购' },
          return: { color: 'red', text: '退货' },
          usage: { color: 'blue', text: '使用' },
          inquiry: { color: 'orange', text: '询价' },
          transfer: { color: 'purple', text: '调拨' }
        };
        const { color, text } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '交易日期',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 100,
    },
    {
      title: '单据号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: '关联设备',
      key: 'equipment',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.equipmentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.equipmentCode}</div>
        </div>
      )
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 80,
    },
    {
      title: '审批人',
      dataIndex: 'approver',
      key: 'approver',
      width: 80,
    },
    {
      title: '交货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 100,
    },
    {
      title: '发票号',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 120,
      render: (invoice) => invoice || '-'
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status) => {
        if (!status || status === '-') return '-';
        const statusMap = {
          paid: { color: 'green', text: '已付款' },
          pending: { color: 'orange', text: '待付款' },
          refunded: { color: 'blue', text: '已退款' },
          overdue: { color: 'red', text: '逾期' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '质量状态',
      dataIndex: 'qualityStatus',
      key: 'qualityStatus',
      width: 100,
      render: (status) => {
        if (!status || status === '-') return '-';
        const statusMap = {
          qualified: { color: 'green', text: '合格' },
          defective: { color: 'red', text: '不合格' },
          used: { color: 'blue', text: '已使用' },
          pending: { color: 'orange', text: '待检验' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '存放位置',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      width: 120,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<FileTextOutlined />}>
            详情
          </Button>
          <Button type="link" size="small">
            打印
          </Button>
          {record.transactionType === 'inquiry' && (
            <Button type="link" size="small" icon={<ShoppingCartOutlined />}>
              下单
            </Button>
          )}
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
              title="总交易笔数"
              value={summaryData.totalTransactions}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="采购总金额"
              value={summaryData.totalPurchaseAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="退货总金额"
              value={summaryData.totalReturnAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="使用总金额"
              value={summaryData.totalUsageAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="待处理订单"
              value={summaryData.pendingOrders}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <TransactionOutlined />
            库外备件流水管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>
              导出流水
            </Button>
            <Button type="primary">
              生成报表
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索流水编号/备件"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="交易类型" style={{ width: 120 }}>
              <Option value="purchase">采购</Option>
              <Option value="return">退货</Option>
              <Option value="usage">使用</Option>
              <Option value="inquiry">询价</Option>
              <Option value="transfer">调拨</Option>
            </Select>
            <Select placeholder="供应商" style={{ width: 150 }}>
              <Option value="supplier_a">外部供应商A</Option>
              <Option value="supplier_b">外部供应商B</Option>
              <Option value="supplier_c">外部供应商C</Option>
            </Select>
            <Select placeholder="付款状态" style={{ width: 120 }}>
              <Option value="paid">已付款</Option>
              <Option value="pending">待付款</Option>
              <Option value="refunded">已退款</Option>
              <Option value="overdue">逾期</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={flowData}
          loading={loading}
          pagination={{
            total: flowData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 2200 }}
        />
      </Card>
    </div>
  );
};

export default SparePartsFlow;