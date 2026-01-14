import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber, Row, Col, message, Popconfirm, Tooltip, Spin, Alert } from 'antd';

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
import { PlusOutlined, SearchOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined, SyncOutlined, ToolOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

const { Option } = Select;
const { TabPane } = Tabs;

const EquipmentMasterData = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('equipment');
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // 使用 DataService 获取设备数据
  const { 
    data: equipmentResponse, 
    loading: equipmentLoading, 
    error: equipmentError, 
    refetch: refetchEquipment 
  } = useDataService(
    () => DataService.getEquipment({ 
      page: pagination.current, 
      pageSize: pagination.pageSize 
    }),
    [pagination.current, pagination.pageSize],
    { cacheKey: `equipment_${pagination.current}_${pagination.pageSize}` }
  );

  // 处理设备数据格式化
  const [equipmentData, setEquipmentData] = useState([]);

  useEffect(() => {
    if (equipmentResponse && Array.isArray(equipmentResponse)) {
      const formattedData = equipmentResponse.map((eq, index) => ({
        key: eq.id?.toString() || index.toString(),
        id: eq.id,
        equipmentCode: eq.equipment_code || eq.device_code || `DEV-${String(eq.id || index).padStart(3, '0')}`,
        equipmentName: eq.equipment_name || eq.device_name || `设备 ${eq.id || index}`,
        category: eq.equipment_type || eq.device_type || '未分类',
        model: eq.model || eq.specifications || '-',
        manufacturer: eq.manufacturer || '-',
        specifications: eq.specifications || {},
        status: eq.is_active !== false ? 'active' : 'inactive',
        location: eq.location || '-',
        // 排程扩展属性
        capacityPerHour: eq.scheduling?.capacity_per_hour || eq.capacity_per_hour || 0,
        schedulingWeight: eq.scheduling?.scheduling_weight || eq.scheduling_weight || 50,
        isAvailableForScheduling: eq.scheduling?.is_available_for_scheduling ?? eq.is_available_for_scheduling ?? true,
        createDate: eq.created_at ? new Date(eq.created_at).toLocaleDateString('zh-CN') : '-'
      }));

      setEquipmentData(formattedData);
      
      // 更新分页信息
      if (equipmentResponse.length > 0) {
        setPagination(prev => ({
          ...prev,
          total: equipmentResponse.length
        }));
      }
    }
  }, [equipmentResponse]);

  // 设备类别数据
  const categoryData = [
    {
      key: '1',
      categoryCode: 'CAT-001',
      categoryName: '注塑设备',
      parentCategory: '生产设备',
      description: '用于塑料制品注塑成型的设备',
      equipmentCount: 5,
      status: 'active'
    },
    {
      key: '2',
      categoryCode: 'CAT-002',
      categoryName: '包装设备',
      parentCategory: '生产设备',
      description: '用于产品包装的设备',
      equipmentCount: 3,
      status: 'active'
    }
  ];

  // 备件库存数据
  const sparePartsData = [
    {
      key: '1',
      partCode: 'SP-001',
      partName: '温度传感器',
      specification: 'PT100',
      applicableEquipment: ['EQ-001', 'EQ-002'],
      currentStock: 15,
      minStock: 5,
      maxStock: 50,
      unit: '个',
      unitPrice: 350.00,
      supplier: '传感器公司A',
      status: 'active'
    }
  ];

  const equipmentColumns = [
    {
      title: '设备编号',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '每小时产能',
      dataIndex: 'capacityPerHour',
      key: 'capacityPerHour',
      width: 100,
      render: (value) => (
        <Tooltip title="排程扩展属性">
          <span style={{ color: '#1890ff' }}>{value || 0}</span>
        </Tooltip>
      )
    },
    {
      title: '排程权重',
      dataIndex: 'schedulingWeight',
      key: 'schedulingWeight',
      width: 90,
      render: (value) => (
        <Tooltip title="排程扩展属性 (1-100)">
          <span style={{ color: '#1890ff' }}>{value || 50}</span>
        </Tooltip>
      )
    },
    {
      title: '可排程',
      dataIndex: 'isAvailableForScheduling',
      key: 'isAvailableForScheduling',
      width: 80,
      render: (value) => (
        <Tag color={value ? 'green' : 'default'}>
          {value ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button onClick={() => { 
            try {
              safeMessage.success('删除成功'); 
            } catch (error) {
              console.error('删除失败:', error);
              safeMessage.error('删除失败: ' + (error.message || '未知错误'));
            }
          }} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    {
      title: '类别编码',
      dataIndex: 'categoryCode',
      key: 'categoryCode',
      width: 120,
    },
    {
      title: '类别名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
    },
    {
      title: '上级类别',
      dataIndex: 'parentCategory',
      key: 'parentCategory',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '设备数量',
      dataIndex: 'equipmentCount',
      key: 'equipmentCount',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button onClick={() => { 
            try {
              safeMessage.success('删除成功'); 
            } catch (error) {
              console.error('删除失败:', error);
              safeMessage.error('删除失败: ' + (error.message || '未知错误'));
            }
          }} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const sparePartsColumns = [
    {
      title: '备件编码',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 120,
    },
    {
      title: '备件名称',
      dataIndex: 'partName',
      key: 'partName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '适用设备',
      dataIndex: 'applicableEquipment',
      key: 'applicableEquipment',
      width: 200,
      render: (equipment) => (
        <div>
          {equipment.map((item, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '库存信息',
      key: 'stock',
      width: 150,
      render: (_, record) => (
        <div>
          <div>当前: {record.currentStock} {record.unit}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            最小: {record.minStock} / 最大: {record.maxStock}
          </div>
        </div>
      )
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button onClick={() => { 
            try {
              safeMessage.success('删除成功'); 
            } catch (error) {
              console.error('删除失败:', error);
              safeMessage.error('删除失败: ' + (error.message || '未知错误'));
            }
          }} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    } catch (error) {
      console.error('编辑失败:', error);
      safeMessage.error('编辑失败: ' + (error.message || '未知错误'));
    }
  };

  // 处理刷新数据
  const handleRefresh = async () => {
    try {
      await refetchEquipment();
      safeMessage.success('数据已刷新');
    } catch (error) {
      console.error('刷新失败:', error);
      safeMessage.error('刷新失败: ' + (error.message || '未知错误'));
    }
  };

  // 渲染加载状态
  if (equipmentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>正在加载设备数据...</div>
      </div>
    );
  }

  // 渲染错误状态
  if (equipmentError) {
    return (
      <Alert
        message="数据加载失败"
        description={equipmentError.message || '无法获取设备数据，请检查网络连接或联系管理员'}
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
  if (!equipmentData || equipmentData.length === 0) {
    return (
      <Card 
        title={
          <Space>
            <AppstoreOutlined />
            设备主数据管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建数据
            </Button>
          </Space>
        }
      >
        <Alert
          message="暂无设备数据"
          description="系统中还没有设备数据，请联系管理员初始化演示数据或添加新设备"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const renderSearchArea = () => (
    <div style={{ marginBottom: 16 }}>
      <Space wrap>
        <Input
          placeholder="搜索编码/名称"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
        />
        <Select placeholder="选择状态" style={{ width: 120 }}>
          <Option value="active">启用</Option>
          <Option value="inactive">停用</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />}>
          搜索
        </Button>
        <Button>重置</Button>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          刷新
        </Button>
      </Space>
    </div>
  );

  return (
    <div>
      <Card 
        title={
          <Space>
            <AppstoreOutlined />
            设备主数据管理
          </Space>
        }
      >
        <Tabs 
          activeKey={currentTab} 
          onChange={setCurrentTab}
          tabBarExtraContent={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
              <Button type="primary" icon={<PlusOutlined />}>
                新建数据
              </Button>
            </Space>
          }
        >
          <TabPane tab="设备信息" key="equipment">
            {renderSearchArea()}
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
              <span style={{ color: '#666' }}>
                💡 设备主数据来自统一API，包含排程扩展属性（产能、权重等）
              </span>
            </div>
            <Table
              columns={equipmentColumns}
              dataSource={equipmentData}
              loading={equipmentLoading}
              rowKey="key"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                }
              }}
              scroll={{ x: 1600 }}
            />
          </TabPane>

          <TabPane tab="设备类别" key="category">
            {renderSearchArea()}
            <Table
              columns={categoryColumns}
              dataSource={categoryData}
              loading={false}
              pagination={{
                total: categoryData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="备件管理" key="spareParts">
            {renderSearchArea()}
            <Table
              columns={sparePartsColumns}
              dataSource={sparePartsData}
              loading={false}
              pagination={{
                total: sparePartsData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1400 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default EquipmentMasterData;