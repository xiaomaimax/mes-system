import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, DatePicker, InputNumber, Row, Col, message, Spin } from 'antd';

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
import { PlusOutlined, SearchOutlined, FolderOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import moment from 'moment';

import ButtonActions from '../../utils/buttonActions';
import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';
const { Option } = Select;
const { TextArea } = Input;

const EquipmentArchives = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({});

  // 使用useDataService Hook获取设备档案数据
  const {
    data: archiveData,
    loading: archiveLoading,
    error: archiveError,
    refetch: refetchArchives
  } = useDataService(() => DataService.getEquipmentArchives(searchParams), [searchParams]);

  // 格式化数据
  const formattedData = archiveData?.items?.map((archive, index) => ({
    key: archive.id?.toString() || index,
    id: archive.id,
    equipmentCode: archive.equipment_code || archive.equipmentCode || `EQ-${String(archive.id || index).padStart(3, '0')}`,
    equipmentName: archive.equipment_name || archive.equipmentName || `设备 ${archive.id || index}`,
    category: archive.category || '注塑设备',
    model: archive.model || 'Model-001',
    manufacturer: archive.manufacturer || '制造商A',
    purchaseDate: archive.purchase_date || archive.purchaseDate || '2023-01-01',
    warrantyEndDate: archive.warranty_end_date || archive.warrantyEndDate || '2025-01-01',
    originalValue: archive.original_value || archive.originalValue || 100000,
    currentValue: archive.current_value || archive.currentValue || 80000,
    location: archive.location || '车间A',
    status: archive.status || 'running',
    technicalSpecs: archive.technical_specs || archive.technicalSpecs || {},
    documents: archive.documents || [],
    maintenanceRecords: archive.maintenance_records || archive.maintenanceRecords || 0,
    repairRecords: archive.repair_records || archive.repairRecords || 0,
    remarks: archive.remarks || ''
  })) || [];

  // 新增档案
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑档案
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? moment(record.purchaseDate) : null,
      warrantyEndDate: record.warrantyEndDate ? moment(record.warrantyEndDate) : null
    });
    setModalVisible(true);
  };

  // 删除档案
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备档案"${record.equipmentName}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await DataService.deleteEquipmentArchive(record.id);
          if (result.success) {
            safeMessage.success('删除成功');
            refetchArchives();
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

  // 搜索处理
  const handleSearch = (values) => {
    setSearchParams(values);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
  };

  // 保存处理（新增/编辑）
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式
        const result = await DataService.updateEquipmentArchive(editingRecord.id, values);
        if (result.success) {
          safeMessage.success('设备档案更新成功');
          refetchArchives();
          setModalVisible(false);
          form.resetFields();
        } else {
          safeMessage.error(result.message || '更新失败');
        }
      } else {
        // 新增模式
        const result = await DataService.addEquipmentArchive(values);
        if (result.success) {
          safeMessage.success('设备档案添加成功');
          refetchArchives();
          setModalVisible(false);
          form.resetFields();
        } else {
          safeMessage.error(result.message || '添加失败');
        }
      }
    } catch (error) {
      console.error('保存设备档案失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '设备类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '型号规格',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 100,
    },
    {
      title: '保修期至',
      dataIndex: 'warrantyEndDate',
      key: 'warrantyEndDate',
      width: 100,
    },
    {
      title: '原值/现值',
      key: 'value',
      width: 150,
      render: (_, record) => (
        <div>
          <div>原值: ¥{record.originalValue.toLocaleString()}</div>
          <div style={{ color: '#666' }}>现值: ¥{record.currentValue.toLocaleString()}</div>
        </div>
      )
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          running: { color: 'green', text: '运行中' },
          idle: { color: 'blue', text: '空闲' },
          maintenance: { color: 'orange', text: '维护中' },
          fault: { color: 'red', text: '故障' },
          scrapped: { color: 'gray', text: '报废' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status || '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '维护/维修记录',
      key: 'records',
      width: 120,
      render: (_, record) => (
        <div>
          <div>维护: {record.maintenanceRecords}次</div>
          <div>维修: {record.repairRecords}次</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看档案
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
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <FolderOutlined />
            设备档案管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>导入档案</Button>
            <Button icon={<ExportOutlined />}>导出档案</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建档案
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f0f9ff', borderRadius: 4, border: '1px solid #bae7ff' }}>
            <span style={{ color: '#1890ff' }}>
              💡 设备档案数据已从主数据同步，包含所有设备的完整档案信息
            </span>
          </div>
          <Space wrap>
            <Input
              placeholder="搜索设备编号/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setSearchParams({ ...searchParams, equipmentCode: e.target.value })}
              value={searchParams.equipmentCode || ''}
            />
            <Select 
              placeholder="设备类别" 
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setSearchParams({ ...searchParams, category: value })}
              value={searchParams.category}
            >
              <Option value="注塑设备">注塑设备</Option>
              <Option value="包装设备">包装设备</Option>
              <Option value="检测设备">检测设备</Option>
              <Option value="传送设备">传送设备</Option>
              <Option value="冷却设备">冷却设备</Option>
            </Select>
            <Select 
              placeholder="设备状态" 
              style={{ width: 120 }}
              allowClear
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
              value={searchParams.status}
            >
              <Option value="running">运行中</Option>
              <Option value="idle">空闲</Option>
              <Option value="maintenance">维护中</Option>
              <Option value="fault">故障</Option>
              <Option value="scrapped">报废</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchParams)}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        {/* 错误状态显示 */}
        {archiveError && (
          <div style={{ marginBottom: '16px' }}>
            <Card>
              <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
                <p>数据加载失败: {archiveError.message}</p>
                <Button 
                  type="primary" 
                  onClick={() => refetchArchives()}
                >
                  重试
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 表格 */}
        <Spin spinning={archiveLoading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={formattedData}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1600 }}
            locale={{
              emptyText: archiveLoading ? '加载中...' : '暂无数据'
            }}
          />
        </Spin>
      </Card>

      {/* 新增/编辑对话框 */}
      <Modal
        title={editingRecord ? '编辑设备档案' : '新建设备档案'}
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
                name="equipmentCode"
                label="设备编号"
                rules={[{ required: true, message: '请输入设备编号' }]}
              >
                <Input placeholder="请输入设备编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipmentName"
                label="设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="设备类别"
                rules={[{ required: true, message: '请选择设备类别' }]}
              >
                <Select placeholder="请选择设备类别">
                  <Option value="注塑设备">注塑设备</Option>
                  <Option value="包装设备">包装设备</Option>
                  <Option value="检测设备">检测设备</Option>
                  <Option value="传送设备">传送设备</Option>
                  <Option value="冷却设备">冷却设备</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="型号规格"
                rules={[{ required: true, message: '请输入型号规格' }]}
              >
                <Input placeholder="请输入型号规格" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="制造商"
                rules={[{ required: true, message: '请输入制造商' }]}
              >
                <Input placeholder="请输入制造商" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="存放位置"
                rules={[{ required: true, message: '请输入存放位置' }]}
              >
                <Input placeholder="请输入存放位置" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="购买日期"
                rules={[{ required: true, message: '请选择购买日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择购买日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warrantyEndDate"
                label="保修期至"
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择保修期结束日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="originalValue"
                label="原值(元)"
                rules={[{ required: true, message: '请输入设备原值' }]}
              >
                <InputNumber 
                  min={0} 
                  precision={2}
                  placeholder="请输入设备原值" 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currentValue"
                label="现值(元)"
              >
                <InputNumber 
                  min={0} 
                  precision={2}
                  placeholder="请输入设备现值" 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="status"
                label="设备状态"
                rules={[{ required: true, message: '请选择设备状态' }]}
              >
                <Select placeholder="请选择设备状态">
                  <Option value="running">运行中</Option>
                  <Option value="idle">空闲</Option>
                  <Option value="maintenance">维护中</Option>
                  <Option value="fault">故障</Option>
                  <Option value="scrapped">报废</Option>
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

export default EquipmentArchives;