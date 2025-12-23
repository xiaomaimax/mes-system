import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Steps, Timeline, Row, Col, Descriptions } from 'antd';
import { SearchOutlined, NodeIndexOutlined, HistoryOutlined, InfoCircleOutlined } from '@ant-design/icons';

const BatchTracing = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // 模拟数据
  const batchData = [
    {
      key: '1',
      batchNo: 'BATCH-A001-20240115',
      productCode: 'PROD-A001',
      productName: '产品A',
      productionDate: '2024-01-15',
      productionLine: '生产线1',
      quantity: 1000,
      qualifiedQuantity: 980,
      defectiveQuantity: 20,
      qualityRate: 98.0,
      status: 'shipped',
      customerName: '客户A',
      shipmentDate: '2024-01-20'
    }
  ];

  // 批次追溯详细信息
  const traceDetails = {
    batchInfo: {
      batchNo: 'BATCH-A001-20240115',
      productCode: 'PROD-A001',
      productName: '产品A',
      productionDate: '2024-01-15',
      productionLine: '生产线1',
      operator: '张三',
      shift: '白班',
      quantity: 1000
    },
    materials: [
      {
        materialCode: 'MAT-001',
        materialName: '原料A',
        batchNo: 'MAT-BATCH-001',
        supplier: '供应商A',
        quantity: 500,
        unit: 'kg'
      },
      {
        materialCode: 'MAT-002',
        materialName: '原料B',
        batchNo: 'MAT-BATCH-002',
        supplier: '供应商B',
        quantity: 200,
        unit: 'kg'
      }
    ],
    processSteps: [
      {
        step: 1,
        processName: '原料投入',
        startTime: '2024-01-15 08:00',
        endTime: '2024-01-15 08:30',
        operator: '张三',
        equipment: 'EQ-001',
        parameters: { temperature: '25°C', humidity: '60%' },
        result: 'pass'
      },
      {
        step: 2,
        processName: '注塑成型',
        startTime: '2024-01-15 08:30',
        endTime: '2024-01-15 14:00',
        operator: '李四',
        equipment: 'EQ-001',
        parameters: { temperature: '180°C', pressure: '150MPa', cycleTime: '45s' },
        result: 'pass'
      },
      {
        step: 3,
        processName: '质量检验',
        startTime: '2024-01-15 14:00',
        endTime: '2024-01-15 15:00',
        operator: '王五',
        equipment: 'EQ-003',
        parameters: { sampleSize: '50', qualifiedQty: '48' },
        result: 'conditional_pass'
      },
      {
        step: 4,
        processName: '包装',
        startTime: '2024-01-15 15:00',
        endTime: '2024-01-15 16:00',
        operator: '赵六',
        equipment: 'EQ-002',
        parameters: { packingType: '标准包装' },
        result: 'pass'
      }
    ],
    qualityRecords: [
      {
        inspectionType: 'PQC',
        inspectionTime: '2024-01-15 12:00',
        inspector: '王五',
        result: 'pass',
        sampleQty: 20,
        qualifiedQty: 20,
        defectiveQty: 0
      },
      {
        inspectionType: 'FQC',
        inspectionTime: '2024-01-15 15:30',
        inspector: '钱七',
        result: 'conditional_pass',
        sampleQty: 50,
        qualifiedQty: 48,
        defectiveQty: 2
      }
    ],
    shipmentInfo: {
      shipmentNo: 'SHIP-2024-001',
      customerName: '客户A',
      shipmentDate: '2024-01-20',
      quantity: 980,
      deliveryAddress: '上海市浦东新区xxx路xxx号'
    }
  };

  const columns = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 180,
    },
    {
      title: '产品信息',
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
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 100,
    },
    {
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 100,
    },
    {
      title: '数量统计',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <div>
          <div>总数: {record.quantity}</div>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          production: { color: 'blue', text: '生产中' },
          inspection: { color: 'orange', text: '检验中' },
          inventory: { color: 'green', text: '库存中' },
          shipped: { color: 'purple', text: '已出货' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '出货日期',
      dataIndex: 'shipmentDate',
      key: 'shipmentDate',
      width: 100,
      render: (date) => date || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => setSelectedBatch(record)}
          >
            追溯详情
          </Button>
          <Button type="link" size="small">
            质量报告
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16}>
        {/* 左侧批次列表 */}
        <Col span={selectedBatch ? 10 : 24}>
          <Card 
            title={
              <Space>
                <NodeIndexOutlined />
                批次追溯查询
              </Space>
            }
            extra={
              <Button type="primary">
                导出追溯报告
              </Button>
            }
          >
            {/* 搜索区域 */}
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Input
                  placeholder="搜索批次号/产品编码"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                />
                <Button type="primary" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button>重置</Button>
              </Space>
            </div>

            {/* 表格 */}
            <Table
              columns={columns}
              dataSource={batchData}
              loading={loading}
              pagination={{
                total: batchData.length,
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>

        {/* 右侧追溯详情 */}
        {selectedBatch && (
          <Col span={14}>
            <Card 
              title={
                <Space>
                  <HistoryOutlined />
                  批次追溯详情
                  <Tag color="blue">{selectedBatch.batchNo}</Tag>
                </Space>
              }
              extra={
                <Button onClick={() => setSelectedBatch(null)}>
                  关闭
                </Button>
              }
            >
              {/* 基本信息 */}
              <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="批次号">{traceDetails.batchInfo.batchNo}</Descriptions.Item>
                  <Descriptions.Item label="产品名称">{traceDetails.batchInfo.productName}</Descriptions.Item>
                  <Descriptions.Item label="生产日期">{traceDetails.batchInfo.productionDate}</Descriptions.Item>
                  <Descriptions.Item label="生产线">{traceDetails.batchInfo.productionLine}</Descriptions.Item>
                  <Descriptions.Item label="操作员">{traceDetails.batchInfo.operator}</Descriptions.Item>
                  <Descriptions.Item label="班次">{traceDetails.batchInfo.shift}</Descriptions.Item>
                  <Descriptions.Item label="生产数量">{traceDetails.batchInfo.quantity}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 原料追溯 */}
              <Card title="原料追溯" size="small" style={{ marginBottom: 16 }}>
                <Table
                  size="small"
                  columns={[
                    { title: '物料编码', dataIndex: 'materialCode', width: 100 },
                    { title: '物料名称', dataIndex: 'materialName', width: 120 },
                    { title: '批次号', dataIndex: 'batchNo', width: 120 },
                    { title: '供应商', dataIndex: 'supplier', width: 100 },
                    { title: '用量', key: 'quantity', render: (_, record) => `${record.quantity} ${record.unit}` }
                  ]}
                  dataSource={traceDetails.materials}
                  pagination={false}
                />
              </Card>

              {/* 工艺流程 */}
              <Card title="工艺流程" size="small" style={{ marginBottom: 16 }}>
                <Steps
                  direction="vertical"
                  size="small"
                  current={traceDetails.processSteps.length}
                  items={traceDetails.processSteps.map((step, index) => ({
                    title: step.processName,
                    description: (
                      <div>
                        <div>时间: {step.startTime} - {step.endTime}</div>
                        <div>操作员: {step.operator} | 设备: {step.equipment}</div>
                        <div>参数: {Object.entries(step.parameters).map(([key, value]) => `${key}: ${value}`).join(', ')}</div>
                        <Tag color={step.result === 'pass' ? 'green' : 'orange'}>
                          {step.result === 'pass' ? '合格' : '让步接收'}
                        </Tag>
                      </div>
                    ),
                    status: step.result === 'pass' ? 'finish' : 'error'
                  }))}
                />
              </Card>

              {/* 质量记录 */}
              <Card title="质量记录" size="small" style={{ marginBottom: 16 }}>
                <Timeline
                  items={traceDetails.qualityRecords.map((record, index) => ({
                    children: (
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{record.inspectionType} 检验</div>
                        <div>检验时间: {record.inspectionTime}</div>
                        <div>检验员: {record.inspector}</div>
                        <div>抽样: {record.sampleQty} | 合格: {record.qualifiedQty} | 不合格: {record.defectiveQty}</div>
                        <Tag color={record.result === 'pass' ? 'green' : 'orange'}>
                          {record.result === 'pass' ? '合格' : '让步接收'}
                        </Tag>
                      </div>
                    )
                  }))}
                />
              </Card>

              {/* 出货信息 */}
              {traceDetails.shipmentInfo && (
                <Card title="出货信息" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="出货单号">{traceDetails.shipmentInfo.shipmentNo}</Descriptions.Item>
                    <Descriptions.Item label="客户名称">{traceDetails.shipmentInfo.customerName}</Descriptions.Item>
                    <Descriptions.Item label="出货日期">{traceDetails.shipmentInfo.shipmentDate}</Descriptions.Item>
                    <Descriptions.Item label="出货数量">{traceDetails.shipmentInfo.quantity}</Descriptions.Item>
                    <Descriptions.Item label="交货地址" span={2}>{traceDetails.shipmentInfo.deliveryAddress}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BatchTracing;