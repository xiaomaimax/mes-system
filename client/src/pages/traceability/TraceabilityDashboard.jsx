import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table, Tag, Button, Space, Input, Select, Modal, Form, Tabs, Timeline, Alert, Statistic, message, Breadcrumb } from 'antd';
import { SearchOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ArrowRightOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import './TraceabilityDashboard.css';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TraceabilityDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [batches, setBatches] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [traceResult, setTraceResult] = useState(null);
  const [qualityTraceModal, setQualityTraceModal] = useState(false);
  const [qualityTraceResult, setQualityTraceResult] = useState(null);
  const [form] = Form.useForm();

  // 状态映射
  const statusMap = {
    qualified: { label: '合格', color: 'green', icon: <CheckCircleOutlined /> },
    unqualified: { label: '不合格', color: 'red', icon: <CloseCircleOutlined /> },
    pending: { label: '待检', color: 'orange', icon: <ExclamationCircleOutlined /> }
  };

  // 加载批次列表
  const loadBatches = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get('/traceability/batches', { params });
      if (res.data.success) {
        setBatches(res.data.items);
      }
    } catch (error) {
      message.error('加载批次列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计
  const loadStatistics = async () => {
    try {
      const res = await axios.get('/traceability/statistics');
      if (res.data.success) {
        setStatistics(res.data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  useEffect(() => {
    loadBatches();
    loadStatistics();
  }, []);

  // 搜索批次
  const handleSearch = (value) => {
    if (value) {
      loadBatches({ batchNumber: value });
    } else {
      loadBatches();
    }
  };

  // 查询批次详情
  const handleViewBatch = async (batchNumber) => {
    try {
      const res = await axios.get(`/traceability/batch/${batchNumber}`);
      if (res.data.success) {
        setSelectedBatch(res.data.data);
      }
    } catch (error) {
      message.error('查询失败');
    }
  };

  // 正向追溯
  const handleForwardTrace = async (batchNumber) => {
    try {
      const res = await axios.get(`/traceability/forward/${batchNumber}`);
      if (res.data.success) {
        setTraceResult(res.data.data);
        setActiveTab('result');
      }
    } catch (error) {
      message.error('追溯失败');
    }
  };

  // 反向追溯
  const handleBackwardTrace = async (batchNumber) => {
    try {
      const res = await axios.get(`/traceability/backward/${batchNumber}`);
      if (res.data.success) {
        setTraceResult(res.data.data);
        setActiveTab('result');
      }
    } catch (error) {
      message.error('追溯失败');
    }
  };

  // 质量问题追溯
  const handleQualityTrace = async (values) => {
    try {
      const res = await axios.post('/traceability/quality-trace', values);
      if (res.data.success) {
        setQualityTraceResult(res.data.data);
        setQualityTraceModal(false);
        form.resetFields();
        setActiveTab('quality');
      }
    } catch (error) {
      message.error('追溯失败');
    }
  };

  // 表格列
  const columns = [
    {
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150
    },
    {
      title: '生产日期',
      dataIndex: 'production_date',
      key: 'production_date',
      width: 120
    },
    {
      title: '质检状态',
      dataIndex: 'overall_status',
      key: 'overall_status',
      width: 100,
      render: (status) => statusMap[status] ? (
        <Tag color={statusMap[status].color} icon={statusMap[status].icon}>
          {statusMap[status].label}
        </Tag>
      ) : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary" onClick={() => handleViewBatch(record.batch_number)}>
            查看详情
          </Button>
          <Button size="small" icon={<ArrowRightOutlined />} onClick={() => handleForwardTrace(record.batch_number)}>
            正向追溯
          </Button>
          <Button size="small" icon={<ArrowLeftOutlined />} onClick={() => handleBackwardTrace(record.batch_number)}>
            反向追溯
          </Button>
        </Space>
      )
    }
  ];

  // 渲染搜索页面
  const renderSearch = () => (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Search placeholder="输入批次号搜索" onSearch={handleSearch} style={{ width: 300 }} enterButton />
          <Select placeholder="按状态筛选" style={{ width: 120 }} allowClear onChange={(val) => loadBatches({ status: val })}>
            <Option value="qualified">合格</Option>
            <Option value="unqualified">不合格</Option>
            <Option value="pending">待检</Option>
          </Select>
          <Button type="primary" danger icon={<WarningOutlined />} onClick={() => setQualityTraceModal(true)}>
            质量问题追溯
          </Button>
        </Space>
      </Card>

      <Card title="📦 批次列表">
        <Table columns={columns} dataSource={batches} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );

  // 渲染追溯结果
  const renderResult = () => (
    <div>
      <Button onClick={() => setActiveTab('search')} style={{ marginBottom: 16 }}>
        返回搜索
      </Button>

      {traceResult && (
        <Card title={traceResult.type === 'forward' ? '🔍 正向追溯结果' : '🔍 反向追溯结果'}>
          {traceResult.type === 'forward' ? (
            <div>
              <Alert message={`物料批次 ${traceResult.sourceBatch} 被用于以下生产:`} type="info" showIcon style={{ marginBottom: 16 }} />
              <Timeline>
                {traceResult.usageList?.map((item, idx) => (
                  <Timeline.Item key={idx}>
                    <Tag color="blue">{item.used_in_batch}</Tag>
                    <span>{item.product_name}</span>
                    <br />
                    <small>生产日期: {item.production_date} | 使用量: {item.quantity_used}</small>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          ) : (
            <div>
              <Alert message={`产品 ${traceResult.productName} (批次: ${traceResult.targetBatch}) 使用了以下物料:`} type="info" showIcon style={{ marginBottom: 16 }} />
              <Table 
                dataSource={traceResult.materials} 
                rowKey={(r, idx) => idx}
                pagination={false}
                columns={[
                  { title: '物料批次', dataIndex: 'materialBatch', render: (t) => <Tag>{t}</Tag> },
                  { title: '物料名称', dataIndex: 'materialName' },
                  { title: '使用量', dataIndex: 'quantityUsed' },
                  { title: '单位', dataIndex: 'unit' },
                  { title: '供应商批次', dataIndex: 'supplierBatch' },
                  { title: 'IQC状态', dataIndex: 'iqcStatus', render: (s) => statusMap[s] ? <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> : s }
                ]}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // 渲染质量问题追溯
  const renderQuality = () => (
    <div>
      <Button onClick={() => setActiveTab('search')} style={{ marginBottom: 16 }}>
        返回搜索
      </Button>

      {qualityTraceResult && (
        <Card title="⚠️ 质量问题追溯与召回分析">
          <Alert message={`源批次: ${qualityTraceResult.sourceBatch}`} description={qualityTraceResult.issueDescription ? '问题: ' + qualityTraceResult.issueDescription : ''} type="warning" showIcon style={{ marginBottom: 16 }} />

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic title="受影响批次总数" value={qualityTraceResult.totalAffectedCount} valueStyle={{ color: '#f5222d' }} />
            </Col>
            <Col span={8}>
              <Statistic title="同生产线批次" value={qualityTraceResult.affectedBatches?.sameProductionLine?.length || 0} />
            </Col>
            <Col span={8}>
              <Statistic title="同物料批次" value={qualityTraceResult.affectedBatches?.sameMaterial?.length || 0} />
            </Col>
          </Row>

          {qualityTraceResult.recallRecommendation?.length > 0 && (
            <Card title="📋 召回建议" size="small" style={{ marginBottom: 16 }}>
              {qualityTraceResult.recallRecommendation.map((rec, idx) => (
                <Alert key={idx} message={rec.message} type={rec.level === 'high' ? 'error' : 'warning'} showIcon style={{ marginBottom: 8 }} />
              ))}
            </Card>
          )}

          {qualityTraceResult.affectedBatches?.sameProductionLine?.length > 0 && (
            <Card title="同生产线受影响批次" size="small" style={{ marginBottom: 16 }}>
              {qualityTraceResult.affectedBatches.sameProductionLine.map((b, idx) => (
                <Tag key={idx} color="red">{b.batch_number}</Tag>
              ))}
            </Card>
          )}
        </Card>
      )}
    </div>
  );

  return (
    <div className="traceability-dashboard">
      <div className="traceability-header">
        <h1>🔬 生产追溯系统</h1>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>质量管理</Breadcrumb.Item>
          <Breadcrumb.Item>生产追溯</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {statistics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card><Statistic title="总批次" value={statistics.summary.total} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="合格批次" value={statistics.summary.qualified} valueStyle={{ color: '#52c41a' }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="不合格批次" value={statistics.summary.unqualified} valueStyle={{ color: '#f5222d' }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="合格率" value={statistics.summary.qualificationRate + '%'} valueStyle={{ color: '#1890ff' }} /></Card>
          </Col>
        </Row>
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><SearchOutlined /> 批次查询</span>} key="search">
          {renderSearch()}
        </TabPane>
        <TabPane tab={<span><HistoryOutlined /> 追溯结果</span>} key="result" disabled={!traceResult}>
          {renderResult()}
        </TabPane>
        <TabPane tab={<span><WarningOutlined /> 质量问题追溯</span>} key="quality" disabled={!qualityTraceResult}>
          {renderQuality()}
        </TabPane>
      </Tabs>

      {/* 批次详情 Modal */}
      <Modal title="批次详情" open={!!selectedBatch} onCancel={() => setSelectedBatch(null)} footer={null} width={800}>
        {selectedBatch && (
          <div>
            <Row gutter={16}>
              <Col span={12}><p><strong>批次号:</strong> {selectedBatch.batch?.batch_number}</p></Col>
              <Col span={12}><p><strong>产品:</strong> {selectedBatch.batch?.product_name}</p></Col>
              <Col span={12}><p><strong>生产日期:</strong> {selectedBatch.batch?.production_date}</p></Col>
              <Col span={12}><p><strong>状态:</strong> {selectedBatch.batch?.overall_status}</p></Col>
            </Row>
            {selectedBatch.productionRecord && (
              <Alert message="生产记录" description={`生产线: ${selectedBatch.productionRecord.line_name} | 数量: ${selectedBatch.productionRecord.quantity}`} type="info" showIcon style={{ marginTop: 16 }} />
            )}
          </div>
        )}
      </Modal>

      {/* 质量问题追溯 Modal */}
      <Modal title="⚠️ 质量问题追溯" open={qualityTraceModal} onCancel={() => setQualityTraceModal(false)} footer={null}>
        <Form form={form} onFinish={handleQualityTrace} layout="vertical">
          <Form.Item name="batchNumber" label="问题批次号" rules={[{ required: true, message: '请输入批次号' }]}>
            <Input placeholder="输入问题批次号" />
          </Form.Item>
          <Form.Item name="issueDescription" label="问题描述">
            <Input.TextArea rows={3} placeholder="描述发现的质量问题..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">开始追溯</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TraceabilityDashboard;
