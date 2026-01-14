import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  DatePicker, 
  Select, 
  Input, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Spin,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CheckSquareOutlined, 
  EditOutlined, 
  ReloadOutlined,
  EyeOutlined,
  ExportOutlined
} from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { QualityAPI } from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Constants for better maintainability
const INSPECTION_RESULTS = {
  PASS: 'pass',
  FAIL: 'fail',
  PENDING: 'pending'
};

const INSPECTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
};

const RESULT_MAP = {
  [INSPECTION_RESULTS.PASS]: { color: 'green', text: '合格' },
  [INSPECTION_RESULTS.FAIL]: { color: 'red', text: '不合格' },
  [INSPECTION_RESULTS.PENDING]: { color: 'blue', text: '待检验' }
};

const STATUS_MAP = {
  [INSPECTION_STATUS.PENDING]: { color: 'orange', text: '待检验' },
  [INSPECTION_STATUS.COMPLETED]: { color: 'green', text: '已完成' }
};

const FQCInspection = () => {
  // State management
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [fqcData, setFqcData] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // API calls with error handling
  const fetchFQCInspections = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await QualityAPI.getFQCInspections({
        ...searchParams,
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        setFqcData(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0
        }));
      } else {
        safeMessage.error('获取FQC检验数据失败');
      }
    } catch (error) {
      console.error('获取FQC检验数据失败:', error);
      safeMessage.error('获取数据失败，请稍后重试');
      // Fallback to mock data for development
      setFqcData([{
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
        result: INSPECTION_RESULTS.PASS,
        status: INSPECTION_STATUS.COMPLETED
      }]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, pagination.current, pagination.pageSize]);

  // Initial data load
  useEffect(() => {
    fetchFQCInspections();
  }, [fetchFQCInspections]);

  // Event handlers
  const handleEdit = useCallback((record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      inspectionDate: record.inspectionDate ? new Date(record.inspectionDate) : null
    });
    setModalVisible(true);
  }, [form]);

  const handleViewDetail = useCallback((record) => {
    setEditingRecord(record);
    setDetailModalVisible(true);
  }, []);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const handleDetailModalCancel = useCallback(() => {
    setDetailModalVisible(false);
    setEditingRecord(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingRecord) {
        // Update existing record
        await QualityAPI.updateFQCInspection?.(editingRecord.key, values);
        safeMessage.success('FQC检验记录更新成功');
      } else {
        // Create new record
        await QualityAPI.createFQCInspection(values);
        safeMessage.success('FQC检验记录创建成功');
      }
      
      handleModalCancel();
      fetchFQCInspections();
    } catch (error) {
      console.error('保存FQC检验记录失败:', error);
      safeMessage.error('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [form, editingRecord, fetchFQCInspections, handleModalCancel]);

  const handleSearch = useCallback(async () => {
    try {
      const values = await searchForm.validateFields();
      setSearchParams(values);
      setPagination(prev => ({ ...prev, current: 1 }));
    } catch (error) {
      console.error('搜索参数验证失败:', error);
    }
  }, [searchForm]);

  const handleReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [searchForm]);

  const handleRefresh = useCallback(() => {
    fetchFQCInspections();
  }, [fetchFQCInspections]);

  const handleExport = useCallback(() => {
    ButtonActions.simulateExport('FQC检验记录');
  }, []);

  const handleTableChange = useCallback((paginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
  }, []);

  // Memoized table columns for performance
  const columns = useMemo(() => [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
      fixed: 'left',
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
      render: (rate) => (
        <span style={{ 
          color: rate >= 95 ? '#52c41a' : rate >= 90 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {rate}%
        </span>
      )
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const { color, text } = RESULT_MAP[result] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const { color, text } = STATUS_MAP[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            onClick={() => handleEdit(record)} 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Button 
            onClick={() => handleViewDetail(record)}
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ], [handleEdit, handleViewDetail]);

  // Search form component
  const SearchForm = useMemo(() => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form form={searchForm} layout="inline">
        <Row gutter={16} style={{ width: '100%' }}>
          <Col span={6}>
            <Form.Item name="inspectionId" label="检验单号">
              <Input placeholder="请输入检验单号" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="productionOrderNo" label="生产订单">
              <Input placeholder="请输入生产订单号" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="result" label="检验结果">
              <Select placeholder="请选择检验结果" allowClear>
                <Option value={INSPECTION_RESULTS.PASS}>合格</Option>
                <Option value={INSPECTION_RESULTS.FAIL}>不合格</Option>
                <Option value={INSPECTION_RESULTS.PENDING}>待检验</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="dateRange" label="检验日期">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  ), [searchForm, handleSearch, handleReset, handleRefresh, handleExport]);

  return (
    <div>
      {SearchForm}
      
      <Card 
        title={
          <Space>
            <CheckSquareOutlined />
            FQC成品质量检验
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建检验单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={fqcData}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingRecord ? '编辑FQC检验记录' : '新建FQC检验记录'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleModalCancel}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="inspectionId" label="检验单号" rules={[{ required: true }]}>
                <Input placeholder="请输入检验单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productionOrderNo" label="生产订单" rules={[{ required: true }]}>
                <Input placeholder="请输入生产订单号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="productCode" label="产品编码" rules={[{ required: true }]}>
                <Input placeholder="请输入产品编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productName" label="产品名称" rules={[{ required: true }]}>
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="batchNo" label="批次号" rules={[{ required: true }]}>
                <Input placeholder="请输入批次号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="inspector" label="检验员" rules={[{ required: true }]}>
                <Input placeholder="请输入检验员" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalQuantity" label="总数量" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sampleQuantity" label="抽样数量" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qualifiedQuantity" label="合格数量" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="result" label="检验结果" rules={[{ required: true }]}>
                <Select placeholder="请选择检验结果">
                  <Option value={INSPECTION_RESULTS.PASS}>合格</Option>
                  <Option value={INSPECTION_RESULTS.FAIL}>不合格</Option>
                  <Option value={INSPECTION_RESULTS.PENDING}>待检验</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select placeholder="请选择状态">
                  <Option value={INSPECTION_STATUS.PENDING}>待检验</Option>
                  <Option value={INSPECTION_STATUS.COMPLETED}>已完成</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="FQC检验记录详情"
        open={detailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button key="close" onClick={handleDetailModalCancel}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {editingRecord && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>检验单号:</strong> {editingRecord.inspectionId}</p>
                <p><strong>生产订单:</strong> {editingRecord.productionOrderNo}</p>
                <p><strong>产品编码:</strong> {editingRecord.productCode}</p>
                <p><strong>产品名称:</strong> {editingRecord.productName}</p>
              </Col>
              <Col span={12}>
                <p><strong>批次号:</strong> {editingRecord.batchNo}</p>
                <p><strong>检验日期:</strong> {editingRecord.inspectionDate}</p>
                <p><strong>检验员:</strong> {editingRecord.inspector}</p>
                <p><strong>合格率:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{editingRecord.qualityRate}%</span></p>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={6}>
                <p><strong>总数量:</strong> {editingRecord.totalQuantity}</p>
              </Col>
              <Col span={6}>
                <p><strong>抽样数量:</strong> {editingRecord.sampleQuantity}</p>
              </Col>
              <Col span={6}>
                <p><strong>合格数量:</strong> <span style={{ color: '#52c41a' }}>{editingRecord.qualifiedQuantity}</span></p>
              </Col>
              <Col span={6}>
                <p><strong>不合格数量:</strong> <span style={{ color: '#ff4d4f' }}>{editingRecord.defectiveQuantity}</span></p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FQCInspection;