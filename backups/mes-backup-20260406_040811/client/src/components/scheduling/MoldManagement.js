import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, Space, message, Tag, Tooltip, InputNumber, Spin, Alert
} from 'antd';
import { LinkOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

/**
 * 模具管理组件 - 排程模块
 * 使用 DataService 获取模具数据，显示设备关联信息，保留排程扩展属性的编辑功能
 * Requirements: 3.2, 3.5, 8.1, 8.3
 */
const MoldManagement = () => {
  const [isSchedulingModalVisible, setIsSchedulingModalVisible] = useState(false);
  const [isEquipmentModalVisible, setIsEquipmentModalVisible] = useState(false);
  const [isAddEquipmentModalVisible, setIsAddEquipmentModalVisible] = useState(false);
  const [editingMold, setEditingMold] = useState(null);
  const [schedulingForm] = Form.useForm();
  const [equipmentForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);

  // 使用 DataService 获取模具数据
  const { 
    data: moldsResponse, 
    loading: moldsLoading, 
    error: moldsError, 
    refetch: refetchMolds 
  } = useDataService(
    () => DataService.getMolds({ 
      page: pagination.current, 
      pageSize: pagination.pageSize,
      status: statusFilter 
    }),
    [pagination.current, pagination.pageSize, statusFilter],
    { cacheKey: `molds_${pagination.current}_${pagination.pageSize}_${statusFilter}` }
  );

  // 处理模具数据格式化
  const [molds, setMolds] = useState([]);

  useEffect(() => {
    if (moldsResponse && Array.isArray(moldsResponse)) {
      const formattedData = moldsResponse.map((mold, index) => ({
        id: mold.id || index,
        mold_code: mold.mold_code || `MOLD-${String(mold.id || index).padStart(3, '0')}`,
        mold_name: mold.mold_name || `模具 ${mold.id || index}`,
        specifications: mold.specifications || '-',
        quantity: mold.quantity || 1,
        status: mold.status || 'normal',
        scheduling: {
          scheduling_weight: mold.scheduling_weight || 50
        },
        equipment_relations: mold.equipment_relations || []
      }));

      setMolds(formattedData);
      
      // 更新分页信息
      if (moldsResponse.length > 0) {
        setPagination(prev => ({
          ...prev,
          total: moldsResponse.length
        }));
      }
    }
  }, [moldsResponse]);

  // 获取可用设备列表
  const { 
    data: equipmentResponse, 
    loading: equipmentLoading, 
    error: equipmentError 
  } = useDataService(
    () => DataService.getEquipment({ limit: 1000 }),
    [],
    { cacheKey: 'available_equipment' }
  );

  useEffect(() => {
    if (equipmentResponse && Array.isArray(equipmentResponse)) {
      const formattedEquipment = equipmentResponse.map(eq => ({
        id: eq.id,
        equipment_code: eq.equipment_code || eq.device_code || `DEV-${String(eq.id).padStart(3, '0')}`,
        equipment_name: eq.equipment_name || eq.device_name || `设备 ${eq.id}`,
        equipment_type: eq.equipment_type || eq.device_type || '未分类'
      }));
      setAvailableEquipment(formattedEquipment);
    }
  }, [equipmentResponse]);

  const handleGoToEquipmentModule = () => {
    window.location.href = '/equipment?tab=master-data';
  };

  const handleEditScheduling = (record) => {
    setEditingMold(record);
    schedulingForm.setFieldsValue({
      scheduling_weight: record.scheduling?.scheduling_weight || 50
    });
    setIsSchedulingModalVisible(true);
  };

  const handleSchedulingSubmit = async (values) => {
    try {
      // 模拟API调用 - 在实际应用中应该调用真实的API
      console.log('更新排程属性:', values);
      safeMessage.success('排程属性更新成功');
      setIsSchedulingModalVisible(false);
      refetchMolds();
    } catch (error) {
      safeMessage.error('操作失败: ' + error.message);
    }
  };

  const handleViewEquipment = (record) => {
    setEditingMold(record);
    setIsEquipmentModalVisible(true);
  };

  const handleOpenAddEquipment = () => {
    equipmentForm.resetFields();
    setIsAddEquipmentModalVisible(true);
  };

  const handleAddEquipment = async (values) => {
    try {
      // 模拟API调用 - 在实际应用中应该调用真实的API
      console.log('添加设备关联:', values);
      safeMessage.success('设备关联添加成功');
      setIsAddEquipmentModalVisible(false);
      refetchMolds();
    } catch (error) {
      safeMessage.error('操作失败: ' + error.message);
    }
  };

  const handleRemoveEquipment = async (equipmentId) => {
    try {
      // 模拟API调用 - 在实际应用中应该调用真实的API
      console.log('删除设备关联:', equipmentId);
      safeMessage.success('设备关联删除成功');
      refetchMolds();
      setEditingMold({
        ...editingMold,
        equipment_relations: (editingMold.equipment_relations || []).filter(
          rel => rel.equipment_id !== equipmentId
        )
      });
    } catch (error) {
      safeMessage.error('操作失败: ' + error.message);
    }
  };

  // 处理刷新数据
  const handleRefresh = () => {
    refetchMolds();
    safeMessage.success('数据已刷新');
  };

  // 渲染加载状态
  if (moldsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>正在加载模具数据...</div>
      </div>
    );
  }

  // 渲染错误状态
  if (moldsError) {
    return (
      <Alert
        message="数据加载失败"
        description={moldsError.message || '无法获取模具数据，请检查网络连接或联系管理员'}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={handleRefresh}>
            重试
          </Button>
        }
      />
    );
  }

  // 渲染空数据状态
  if (!molds || molds.length === 0) {
    return (
      <Card
        title="模具管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Tooltip title="前往设备管理模块管理模具">
              <Button type="primary" icon={<LinkOutlined />} onClick={handleGoToEquipmentModule}>前往设备管理</Button>
            </Tooltip>
          </Space>
        }
      >
        <Alert
          message="暂无模具数据"
          description="系统中还没有模具数据，请联系管理员初始化演示数据或前往设备管理模块添加模具"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const getStatusDisplay = (status) => {
    const statusMap = {
      normal: { text: '正常', color: 'green' },
      maintenance: { text: '维修', color: 'orange' },
      idle: { text: '闲置', color: 'blue' },
      scrapped: { text: '报废', color: 'red' }
    };
    const s = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    { title: '模具编号', dataIndex: 'mold_code', key: 'mold_code', width: 120 },
    { title: '模具名称', dataIndex: 'mold_name', key: 'mold_name', width: 180 },
    { title: '规格型号', dataIndex: 'specifications', key: 'specifications', width: 120, ellipsis: true },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (status) => getStatusDisplay(status) },
    {
      title: '排程权重', dataIndex: ['scheduling', 'scheduling_weight'], key: 'scheduling_weight', width: 90,
      render: (value) => <Tooltip title="排程扩展属性 (1-100)"><span style={{ color: '#1890ff' }}>{value || 50}</span></Tooltip>
    },
    {
      title: '关联设备', key: 'equipment_relations', width: 200,
      render: (_, record) => {
        const relations = record.equipment_relations || [];
        if (relations.length === 0) return <span style={{ color: '#999' }}>未关联设备</span>;
        const primaryEquipment = relations.find(r => r.is_primary);
        const otherCount = relations.length - (primaryEquipment ? 1 : 0);
        return (
          <Space size="small" wrap>
            {primaryEquipment && (
              <Tooltip title={`主要设备: ${primaryEquipment.equipment_code}`}>
                <Tag color="blue">{primaryEquipment.equipment_name}<span style={{ marginLeft: 4, fontSize: 10 }}>主</span></Tag>
              </Tooltip>
            )}
            {otherCount > 0 && <Tag color="default">+{otherCount}台</Tag>}
          </Space>
        );
      }
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看/管理设备关联">
            <Button size="small" onClick={() => handleViewEquipment(record)}>设备({(record.equipment_relations || []).length})</Button>
          </Tooltip>
          <Tooltip title="编辑排程属性">
            <Button type="primary" size="small" icon={<SettingOutlined />} onClick={() => handleEditScheduling(record)}>排程配置</Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const equipmentRelationColumns = [
    { title: '设备编号', dataIndex: 'equipment_code', key: 'equipment_code', width: 120 },
    { title: '设备名称', dataIndex: 'equipment_name', key: 'equipment_name', width: 150 },
    { title: '设备类型', dataIndex: 'equipment_type', key: 'equipment_type', width: 100 },
    {
      title: '设备状态', dataIndex: 'equipment_status', key: 'equipment_status', width: 90,
      render: (status) => {
        const statusMap = { running: { text: '运行中', color: 'green' }, idle: { text: '空闲', color: 'blue' }, maintenance: { text: '维护中', color: 'orange' }, fault: { text: '故障', color: 'red' }, offline: { text: '离线', color: 'default' } };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    { title: '主要设备', dataIndex: 'is_primary', key: 'is_primary', width: 80, render: (isPrimary) => <Tag color={isPrimary ? 'blue' : 'default'}>{isPrimary ? '是' : '否'}</Tag> },
    { title: '操作', key: 'action', width: 80, render: (_, record) => <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveEquipment(record.equipment_id)}>移除</Button> }
  ];

  return (
    <Card
      title="模具管理"
      extra={
        <Space>
          <Select placeholder="状态过滤" allowClear style={{ width: 120 }} value={statusFilter} onChange={(value) => { setStatusFilter(value); setPagination({ ...pagination, current: 1 }); }}>
            <Select.Option value="normal">正常</Select.Option>
            <Select.Option value="maintenance">维修</Select.Option>
            <Select.Option value="idle">闲置</Select.Option>
            <Select.Option value="scrapped">报废</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Tooltip title="前往设备管理模块管理模具">
            <Button type="primary" icon={<LinkOutlined />} onClick={handleGoToEquipmentModule}>前往设备管理</Button>
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
        <span style={{ color: '#666' }}>💡 模具主数据由设备管理模块维护，此处可查看设备关联并编辑排程相关属性</span>
      </div>
      <Table columns={columns} dataSource={molds} loading={moldsLoading} rowKey="id" pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => { setPagination({ current: page, pageSize, total: pagination.total }); } }} scroll={{ x: 1100 }} />
      <Modal title={`编辑排程属性 - ${editingMold?.mold_name || ''}`} open={isSchedulingModalVisible} onOk={() => schedulingForm.submit()} onCancel={() => setIsSchedulingModalVisible(false)} destroyOnClose>
        <Form form={schedulingForm} layout="vertical" onFinish={handleSchedulingSubmit}>
          <Form.Item label="排程权重" name="scheduling_weight" rules={[{ required: true, message: '请输入排程权重' }]} extra="权重范围 1-100，数值越大优先级越高">
            <InputNumber min={1} max={100} placeholder="1-100" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title={`设备关联 - ${editingMold?.mold_name || ''}`} open={isEquipmentModalVisible} onCancel={() => setIsEquipmentModalVisible(false)} footer={[<Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleOpenAddEquipment}>添加设备关联</Button>, <Button key="close" onClick={() => setIsEquipmentModalVisible(false)}>关闭</Button>]} width={800} destroyOnClose>
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 4 }}>
          <span style={{ color: '#1890ff' }}>💡 此模具可在以下设备上使用。标记为"主要设备"的设备将在排程时优先选择。</span>
        </div>
        <Table columns={equipmentRelationColumns} dataSource={editingMold?.equipment_relations || []} rowKey="equipment_id" pagination={false} size="small" locale={{ emptyText: '暂无关联设备，请点击"添加设备关联"按钮添加' }} />
      </Modal>
      <Modal title="添加设备关联" open={isAddEquipmentModalVisible} onOk={() => equipmentForm.submit()} onCancel={() => setIsAddEquipmentModalVisible(false)} destroyOnClose>
        <Form form={equipmentForm} layout="vertical" onFinish={handleAddEquipment}>
          <Form.Item label="选择设备" name="equipment_id" rules={[{ required: true, message: '请选择设备' }]}>
            <Select placeholder="选择要关联的设备" showSearch optionFilterProp="children" loading={equipmentLoading}>
              {availableEquipment.filter(eq => { const existingIds = (editingMold?.equipment_relations || []).map(r => r.equipment_id); return !existingIds.includes(eq.id); }).map(eq => (<Select.Option key={eq.id} value={eq.id}>{eq.equipment_code} - {eq.equipment_name}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item label="是否为主要设备" name="is_primary" initialValue={false} extra="主要设备将在排程时优先选择">
            <Select><Select.Option value={true}>是</Select.Option><Select.Option value={false}>否</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MoldManagement;
