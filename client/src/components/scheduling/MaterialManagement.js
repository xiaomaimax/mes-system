import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Tooltip, InputNumber, Tabs
} from 'antd';
import { LinkOutlined, SettingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * 物料管理组件 - 排程模块
 * 从统一API获取物料数据，保留排程扩展属性的编辑功能
 * Requirements: 3.1, 3.2, 3.3, 7.2, 7.4, 7.5, 7.6
 */
const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSchedulingModalVisible, setIsSchedulingModalVisible] = useState(false);
  const [isRelationModalVisible, setIsRelationModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [schedulingForm] = Form.useForm();
  const [relationForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  const [devices, setDevices] = useState([]);
  const [molds, setMolds] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    fetchMaterials();
    fetchDevices();
    fetchMolds();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  /**
   * 从统一API获取物料数据
   * Requirements: 3.1 - 使用库存管理模块的物料主数据作为唯一数据源
   */
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let url = `/api/master-data/materials?page=${pagination.current}&limit=${pagination.pageSize}&include_relations=true`;
      
      // 添加状态过滤
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // 转换数据格式以适配表格显示
        const formattedMaterials = data.data.map(material => ({
          id: material.id,
          material_code: material.material_code,
          material_name: material.material_name,
          material_type: material.material_type,
          specifications: material.specifications,
          unit: material.unit,
          status: material.status,
          // 排程扩展属性
          default_device_id: material.scheduling?.default_device_id,
          default_mold_id: material.scheduling?.default_mold_id,
          default_device: material.scheduling?.default_device,
          default_mold: material.scheduling?.default_mold,
          device_relations: material.scheduling?.device_relations || [],
          mold_relations: material.scheduling?.mold_relations || []
        }));
        
        setMaterials(formattedMaterials);
        setPagination({
          ...pagination,
          total: data.pagination.total
        });
      } else {
        safeMessage.error(data.message || '获取物料列表失败');
      }
    } catch (error) {
      safeMessage.error('获取物料列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取设备列表（用于关系配置）
   */
  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/master-data/equipment?limit=1000&is_available_for_scheduling=true');
      const data = await response.json();
      if (data.success) {
        setDevices(data.data.map(eq => ({
          id: eq.id,
          device_code: eq.equipment_code,
          device_name: eq.equipment_name,
          status: eq.status
        })));
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
    }
  };

  /**
   * 获取模具列表（用于关系配置）
   */
  const fetchMolds = async () => {
    try {
      const response = await fetch('/api/master-data/molds?limit=1000&status=normal');
      const data = await response.json();
      if (data.success) {
        setMolds(data.data);
      }
    } catch (error) {
      console.error('获取模具列表失败:', error);
    }
  };

  /**
   * 跳转到库存管理模块新增物料
   * Requirements: 7.4 - 点击"新增物料"跳转到库存管理模块
   */
  const handleGoToInventoryModule = () => {
    window.location.href = '/inventory?tab=master-data&action=add';
  };

  /**
   * 编辑排程扩展属性
   * Requirements: 7.6 - 仅更新扩展属性，不影响主数据
   */
  const handleEditScheduling = (record) => {
    setEditingMaterial(record);
    schedulingForm.setFieldsValue({
      default_device_id: record.default_device_id,
      default_mold_id: record.default_mold_id
    });
    setIsSchedulingModalVisible(true);
  };

  /**
   * 提交排程扩展属性更新
   */
  const handleSchedulingSubmit = async (values) => {
    try {
      const response = await fetch(`/api/master-data/materials/${editingMaterial.id}/scheduling`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        safeMessage.success('排程属性更新成功');
        setIsSchedulingModalVisible(false);
        fetchMaterials();
      } else {
        safeMessage.error(data.message || '更新失败');
      }
    } catch (error) {
      safeMessage.error('操作失败: ' + error.message);
    }
  };

  /**
   * 查看/编辑物料关系配置
   */
  const handleViewRelations = (record) => {
    setEditingMaterial(record);
    setIsRelationModalVisible(true);
  };

  /**
   * 状态映射
   */
  const getStatusDisplay = (status) => {
    const statusMap = {
      active: { text: '正常', color: 'green' },
      inactive: { text: '停用', color: 'default' }
    };
    const s = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    {
      title: '物料编号',
      dataIndex: 'material_code',
      key: 'material_code',
      width: 120
    },
    {
      title: '物料名称',
      dataIndex: 'material_name',
      key: 'material_name',
      width: 180
    },
    {
      title: '物料类型',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 100
    },
    {
      title: '规格型号',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 120,
      ellipsis: true
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => getStatusDisplay(status)
    },
    {
      title: '默认设备',
      dataIndex: 'default_device',
      key: 'default_device',
      width: 120,
      render: (device) => device ? (
        <Tooltip title={`设备编号: ${device.device_code}`}>
          <Tag color="blue">{device.device_name}</Tag>
        </Tooltip>
      ) : <span style={{ color: '#999' }}>未设置</span>
    },
    {
      title: '默认模具',
      dataIndex: 'default_mold',
      key: 'default_mold',
      width: 120,
      render: (mold) => mold ? (
        <Tooltip title={`模具编号: ${mold.mold_code}`}>
          <Tag color="purple">{mold.mold_name}</Tag>
        </Tooltip>
      ) : <span style={{ color: '#999' }}>未设置</span>
    },
    {
      title: '关系配置',
      key: 'relations',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={`设备关系: ${record.device_relations?.length || 0}, 模具关系: ${record.mold_relations?.length || 0}`}>
            <Button
              size="small"
              onClick={() => handleViewRelations(record)}
            >
              查看({(record.device_relations?.length || 0) + (record.mold_relations?.length || 0)})
            </Button>
          </Tooltip>
        </Space>
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

  // 关系配置弹窗中的设备关系表格列
  const deviceRelationColumns = [
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
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'device_status',
      key: 'device_status',
      width: 80,
      render: (status) => {
        const statusMap = {
          running: { text: '运行中', color: 'green' },
          idle: { text: '空闲', color: 'blue' },
          maintenance: { text: '维护中', color: 'orange' },
          fault: { text: '故障', color: 'red' },
          offline: { text: '离线', color: 'default' }
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 80
    }
  ];

  // 关系配置弹窗中的模具关系表格列
  const moldRelationColumns = [
    {
      title: '模具编号',
      dataIndex: 'mold_code',
      key: 'mold_code',
      width: 120
    },
    {
      title: '模具名称',
      dataIndex: 'mold_name',
      key: 'mold_name',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'mold_status',
      key: 'mold_status',
      width: 80,
      render: (status) => {
        const statusMap = {
          normal: { text: '正常', color: 'green' },
          maintenance: { text: '维修', color: 'orange' },
          idle: { text: '闲置', color: 'blue' },
          scrapped: { text: '报废', color: 'red' }
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 60
    },
    {
      title: '周期时间(秒)',
      dataIndex: 'cycle_time',
      key: 'cycle_time',
      width: 100
    },
    {
      title: '每周期产出',
      dataIndex: 'output_per_cycle',
      key: 'output_per_cycle',
      width: 100
    }
  ];

  return (
    <Card
      title="物料管理"
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
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="inactive">停用</Select.Option>
          </Select>
          <Tooltip title="前往库存管理模块新增物料">
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={handleGoToInventoryModule}
            >
              前往库存管理
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
        <span style={{ color: '#666' }}>
          💡 物料主数据由库存管理模块维护，此处仅可编辑排程相关属性（默认设备、默认模具等）
        </span>
      </div>
      
      <Table
        columns={columns}
        dataSource={materials}
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
        scroll={{ x: 1200 }}
      />

      {/* 排程属性编辑弹窗 */}
      <Modal
        title={`编辑排程属性 - ${editingMaterial?.material_name || ''}`}
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
            label="默认设备"
            name="default_device_id"
            extra="生产该物料时优先使用的设备"
          >
            <Select
              allowClear
              placeholder="选择默认设备"
              showSearch
              optionFilterProp="children"
            >
              {devices.map(device => (
                <Select.Option key={device.id} value={device.id}>
                  {device.device_code} - {device.device_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="默认模具"
            name="default_mold_id"
            extra="生产该物料时优先使用的模具"
          >
            <Select
              allowClear
              placeholder="选择默认模具"
              showSearch
              optionFilterProp="children"
            >
              {molds.map(mold => (
                <Select.Option key={mold.id} value={mold.id}>
                  {mold.mold_code} - {mold.mold_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 关系配置查看弹窗 */}
      <Modal
        title={`关系配置 - ${editingMaterial?.material_name || ''}`}
        open={isRelationModalVisible}
        onCancel={() => setIsRelationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsRelationModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <Tabs
          items={[
            {
              key: 'device',
              label: `设备关系 (${editingMaterial?.device_relations?.length || 0})`,
              children: (
                <Table
                  columns={deviceRelationColumns}
                  dataSource={editingMaterial?.device_relations || []}
                  rowKey="device_id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: '暂无设备关系配置' }}
                />
              )
            },
            {
              key: 'mold',
              label: `模具关系 (${editingMaterial?.mold_relations?.length || 0})`,
              children: (
                <Table
                  columns={moldRelationColumns}
                  dataSource={editingMaterial?.mold_relations || []}
                  rowKey="mold_id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: '暂无模具关系配置' }}
                />
              )
            }
          ]}
        />
      </Modal>
    </Card>
  );
};

export default MaterialManagement;
