import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Spin, Alert, message, Modal, Form, InputNumber, Row, Col } from 'antd';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return safeMessage.success(content, duration);
      } else {
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return safeMessage.error(content, duration);
      } else {
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return safeMessage.warning(content, duration);
      } else {
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return safeMessage.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
import { SearchOutlined, AuditOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

/**
 * QualityInspection 组件 - 质量检验管理
 * 
 * 功能：
 * - 从API获取质量检验数据
 * - 展示质量检验列表
 * - 支持搜索、过滤、排序
 * - 处理加载、错误、空数据状态
 * 
 * Requirements: 4.1, 4.5, 8.1, 8.3
 * Property 1: API数据完整性
 * Property 3: 错误处理一致性
 */
const QualityInspection = () => {
  const [filters, setFilters] = useState({
    inspectionType: undefined,
    status: undefined,
    dateRange: undefined
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 使用 useDataService Hook 获取质量检验数据
  const { data: inspectionData, loading, error, refetch } = useDataService(
    () => DataService.getQualityInspections(),
    [],
    { useCache: true, cacheKey: 'quality_inspections' }
  );

  // 处理数据加载
  const formattedData = inspectionData?.data?.items || inspectionData || [];

  // 新增检验单
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑检验单
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      inspectionDate: record.inspectionDate ? moment(record.inspectionDate) : null
    });
    setModalVisible(true);
  };

  // 删除检验单
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除检验单"${record.inspectionCode || `QI-${String(record.id).padStart(4, '0')}`}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await DataService.deleteQualityInspection(record.id);
          if (result.success) {
            safeMessage.success('删除成功');
            refetch();
          } else {
            safeMessage.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          safeMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  // 保存处理（新增/编辑）
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式
        const result = await DataService.updateQualityInspection(editingRecord.id, values);
        if (result.success) {
          safeMessage.success('质量检验更新成功');
          refetch();
          setModalVisible(false);
          form.resetFields();
        } else {
          safeMessage.error(result.message || '更新失败');
        }
      } else {
        // 新增模式
        const result = await DataService.addQualityInspection(values);
        if (result.success) {
          safeMessage.success('质量检验添加成功');
          refetch();
          setModalVisible(false);
          form.resetFields();
        } else {
          safeMessage.error(result.message || '添加失败');
        }
      }
    } catch (error) {
      console.error('保存质量检验失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => `QI-${String(id).padStart(4, '0')}`
    },
    {
      title: '检验类型',
      dataIndex: 'inspection_type',
      key: 'inspection_type',
      width: 100,
      render: (type) => {
        const typeMap = {
          incoming: { color: 'blue', text: 'IQC' },
          process: { color: 'green', text: 'PQC' },
          final: { color: 'orange', text: 'FQC' },
          outgoing: { color: 'purple', text: 'OQC' }
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '检验日期',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '检验员',
      dataIndex: 'inspector_id',
      key: 'inspector_id',
      width: 100,
      render: (id) => `检验员 ${id}`
    },
    {
      title: '检验数量',
      dataIndex: 'inspected_quantity',
      key: 'inspected_quantity',
      width: 100
    },
    {
      title: '合格数量',
      dataIndex: 'qualified_quantity',
      key: 'qualified_quantity',
      width: 100
    },
    {
      title: '合格率',
      dataIndex: 'quality_rate',
      key: 'quality_rate',
      width: 100,
      render: (rate) => `${rate || 0}%`
    },
    {
      title: '检验结果',
      dataIndex: 'quality_rate',
      key: 'result',
      width: 100,
      render: (rate) => {
        if (rate >= 95) {
          return <Tag color="green">合格</Tag>;
        } else if (rate >= 90) {
          return <Tag color="orange">让步接收</Tag>;
        } else {
          return <Tag color="red">不合格</Tag>;
        }
      }
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (notes) => notes || '-'
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
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 处理错误状态
  if (error) {
    return (
      <Card>
        <Alert
          message="数据加载失败"
          description={error.message || '获取质量检验数据失败，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  // 处理加载状态
  if (loading && !formattedData.length) {
    return (
      <Card>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  // 处理空数据状态
  if (!formattedData.length && !loading) {
    return (
      <Card>
        <Alert
          message="暂无数据"
          description="还没有质量检验记录"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <AuditOutlined />
            质量检验管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建检验单
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索检验单号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select
              placeholder="检验类型"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, inspectionType: value })}
            >
              <Option value="incoming">IQC</Option>
              <Option value="process">PQC</Option>
              <Option value="final">FQC</Option>
              <Option value="outgoing">OQC</Option>
            </Select>
            <Select
              placeholder="检验结果"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="pass">合格</Option>
              <Option value="conditional_pass">让步接收</Option>
              <Option value="fail">不合格</Option>
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
          dataSource={formattedData.map((item, index) => ({
            ...item,
            key: item.id || index
          }))}
          loading={loading}
          pagination={{
            total: formattedData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑对话框 */}
      <Modal
        title={editingRecord ? '编辑质量检验' : '新建质量检验'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inspectionCode"
                label="检验单号"
                rules={[{ required: true, message: '请输入检验单号' }]}
              >
                <Input placeholder="请输入检验单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="检验类型"
                rules={[{ required: true, message: '请选择检验类型' }]}
              >
                <Select placeholder="请选择检验类型">
                  <Option value="IQC">来料检验(IQC)</Option>
                  <Option value="PQC">过程检验(PQC)</Option>
                  <Option value="FQC">成品检验(FQC)</Option>
                  <Option value="OQC">出货检验(OQC)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="batchNumber"
                label="批次号"
                rules={[{ required: true, message: '请输入批次号' }]}
              >
                <Input placeholder="请输入批次号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inspectionDate"
                label="检验日期"
                rules={[{ required: true, message: '请选择检验日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择检验日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inspector"
                label="检验员"
                rules={[{ required: true, message: '请输入检验员' }]}
              >
                <Input placeholder="请输入检验员" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="sampleSize"
                label="抽样数量"
                rules={[{ required: true, message: '请输入抽样数量' }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="请输入抽样数量" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="defectCount"
                label="缺陷数量"
                rules={[{ required: true, message: '请输入缺陷数量' }]}
              >
                <InputNumber 
                  min={0} 
                  placeholder="请输入缺陷数量" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="passRate"
                label="合格率(%)"
              >
                <InputNumber 
                  min={0} 
                  max={100}
                  precision={1}
                  placeholder="自动计算" 
                  style={{ width: '100%' }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="result"
                label="检验结果"
                rules={[{ required: true, message: '请选择检验结果' }]}
              >
                <Select placeholder="请选择检验结果">
                  <Option value="合格">合格</Option>
                  <Option value="不合格">不合格</Option>
                  <Option value="让步接收">让步接收</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="已完成">已完成</Option>
                  <Option value="进行中">进行中</Option>
                  <Option value="待审核">待审核</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityInspection;
