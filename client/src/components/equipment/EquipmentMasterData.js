import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const EquipmentMasterData = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('equipment');
  const [form] = Form.useForm();

  // 设备基础数据
  const equipmentData = [
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      category: '注塑设备',
      model: 'INJ-2000A',
      manufacturer: '海天集团',
      specifications: {
        power: '50kW',
        capacity: '200T',
        dimensions: '4.5m×2.2m×2.8m'
      },
      status: 'active',
      createDate: '2023-01-15'
    }
  ];

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
      title: '设备编码',
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
      title: '技术参数',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 200,
      render: (specs) => (
        <div>
          <div>功率: {specs.power}</div>
          <div>产能: {specs.capacity}</div>
          <div>尺寸: {specs.dimensions}</div>
        </div>
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
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
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
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
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
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

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
            <Button type="primary" icon={<PlusOutlined />}>
              新建数据
            </Button>
          }
        >
          <TabPane tab="设备信息" key="equipment">
            {renderSearchArea()}
            <Table
              columns={equipmentColumns}
              dataSource={equipmentData}
              loading={loading}
              pagination={{
                total: equipmentData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="设备类别" key="category">
            {renderSearchArea()}
            <Table
              columns={categoryColumns}
              dataSource={categoryData}
              loading={loading}
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
              loading={loading}
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