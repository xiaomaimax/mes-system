import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber, Tag, Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, SettingOutlined } from '@ant-design/icons';

/**
 * 设备管理组件 - 排程模块
 * 从统一API获取设备数据，保留排程扩展属性的编辑功能
 * Requirements: 1.1, 1.2, 1.3, 7.1, 7.3, 7.5, 7.6
 */
const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSchedulingModalVisible, setIsSchedulingModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [schedulingForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  /**
   * 从统一API获取设备数据
   * Requirements: 1.1 - 使用设备管理模块的设备主数据作为唯一数据源
   */
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        safeMessage.error('认证失败，请重新登录');
        return;
      }

      let url = `/api/master-data/equipment?page=${pagination.current}&limit=${pagination.pageSize}`;
      
      // 添加状态过滤
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        // 转换数据格式以适配表格显示
        const formattedDevices = data.data.map(equipment => ({
          id: equipment.id,
          device_code: equipment.equipment_code,
          device_name: equipment.equipment_name,
          model: equipment.model || '-',
          specifications: equipment.specifications,
          equipment_type: equipment.equipment_type,
          status: equipment.status,
          is_active: equipment.is_active,
          // 排程扩展属性
          capacity_per_hour: equipment.scheduling?.capacity_per_hour || 0,
          scheduling_weight: equipment.scheduling?.scheduling_weight || 50,
          is_available_for_scheduling: equipment.scheduling?.is_available_for_scheduling ?? true
        }));
        
        setDevices(formattedDevices);
        setPagination({
          ...pagination,
          total: data.pagination.total
        });
      } else {
        safeMessage.error(data.message || '获取设备列表失败');
      }
    } catch (error) {
      safeMessage.error('获取设备列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 跳转到设备管理模块新增设备
   * Requirements: 7.3 - 点击"新增设备"跳转到设备管理模块
   */
  const handleGoToEquipmentModule = () => {
    // 跳转到设备管理模块
    window.location.href = '/equipment?tab=master-data&action=add';
  };

  /**
   * 编辑排程扩展属性
   * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
   */
  const handleEditScheduling = (record) => {
    setEditingDevice(record);
    schedulingForm.setFieldsValue({
      capacity_per_hour: record.capacity_per_hour || 0,
      scheduling_weight: record.scheduling_weight || 50,
      is_available_for_scheduling: record.is_available_for_scheduling ?? true
    });
    setIsSchedulingModalVisible(true);
  };

  /**
   * 提交排程扩展属性更新
   * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
   */
  const handleSchedulingSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        safeMessage.error('认证失败，请重新登录');
        return;
      }

      const response = await fetch(`/api/master-data/equipment/${editingDevice.id}/scheduling`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        safeMessage.success('排程属性更新成功');
        setIsSchedulingModalVisible(false);
        fetchDevices();
      } else {
        safeMessage.error(data.message || '更新失败');
      }
    } catch (error) {
      safeMessage.error('操作失败: ' + error.message);
    }
  };

  /**
   * 状态映射
   */
  const getStatusDisplay = (status) => {
    const statusMap = {
      running: { text: '运行中', color: 'green' },
      idle: { text: '空闲', color: 'blue' },
      maintenance: { text: '维护中', color: 'orange' },
      fault: { text: '故障', color: 'red' },
      offline: { text: '离线', color: 'default' },
      // 兼容旧状态
      normal: { text: '正常', color: 'green' },
      scrapped: { text: '报废', color: 'red' }
    };
    const s = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'device_code',
      key: 'device_code',
      width: 120
    },
    {
      title: '设备名称',
      dataIndex: 'device_name',
      key: 'device_name',
      width: 180
    },
    {
      title: '设备类型',
      dataIndex: 'equipment_type',
      key: 'equipment_type',
      width: 100
    },
    {
      title: '规格型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => getStatusDisplay(status)
    },
    {
      title: '每小时产能',
      dataIndex: 'capacity_per_hour',
      key: 'capacity_per_hour',
      width: 100,
      render: (value) => (
        <Tooltip title="排程扩展属性">
          <span style={{ color: '#1890ff' }}>{value || 0}</span>
        </Tooltip>
      )
    },
    {
      title: '排程权重',
      dataIndex: 'scheduling_weight',
      key: 'scheduling_weight',
      width: 90,
      render: (value) => (
        <Tooltip title="排程扩展属性 (1-100)">
          <span style={{ color: '#1890ff' }}>{value || 50}</span>
        </Tooltip>
      )
    },
    {
      title: '可排程',
      dataIndex: 'is_available_for_scheduling',
      key: 'is_available_for_scheduling',
      width: 80,
      render: (value) => (
        <Tag color={value ? 'green' : 'default'}>
          {value ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑排程属性">
            <Button
              type="primary"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleEditScheduling(record)}
            >
              排程配置
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="设备管理"
      extra={
        <Space>
          <Select
            placeholder="状态过滤"
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPagination({ ...pagination, current: 1 });
            }}
          >
            <Select.Option value="running">运行中</Select.Option>
            <Select.Option value="idle">空闲</Select.Option>
            <Select.Option value="maintenance">维护中</Select.Option>
            <Select.Option value="fault">故障</Select.Option>
            <Select.Option value="offline">离线</Select.Option>
          </Select>
          <Tooltip title="前往设备管理模块新增设备">
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={handleGoToEquipmentModule}
            >
              前往设备管理
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
        <span style={{ color: '#666' }}>
          💡 设备主数据由设备管理模块维护，此处仅可编辑排程相关属性（产能、权重等）
        </span>
      </div>
      
      <Table
        columns={columns}
        dataSource={devices}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize, total: pagination.total });
          }
        }}
        scroll={{ x: 1100 }}
      />

      {/* 排程属性编辑弹窗 */}
      <Modal
        title={`编辑排程属性 - ${editingDevice?.device_name || ''}`}
        open={isSchedulingModalVisible}
        onOk={() => schedulingForm.submit()}
        onCancel={() => setIsSchedulingModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={schedulingForm}
          layout="vertical"
          onFinish={handleSchedulingSubmit}
        >
          <Form.Item
            label="每小时产能"
            name="capacity_per_hour"
            rules={[{ required: true, message: '请输入每小时产能' }]}
          >
            <InputNumber 
              min={0} 
              placeholder="单位: 个/小时" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="排程权重"
            name="scheduling_weight"
            rules={[{ required: true, message: '请输入排程权重' }]}
            extra="权重范围 1-100，数值越大优先级越高"
          >
            <InputNumber 
              min={1} 
              max={100} 
              placeholder="1-100" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="是否可用于排程"
            name="is_available_for_scheduling"
            valuePropName="checked"
          >
            <Select>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DeviceManagement;
