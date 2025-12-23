import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber, Row, Col, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined, AppstoreOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InventoryMasterData = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [form] = Form.useForm();

  // 物料主数据
  const materialsData = [
    {
      key: '1',
      materialCode: 'MAT-001',
      materialName: 'ABS塑料粒子',
      specification: 'ABS-750A',
      category: '原材料',
      unit: 'kg',
      supplier: '塑料公司A',
      unitPrice: 12.50,
      safetyStock: 500,
      currentStock: 1200,
      maxStock: 2000,
      storageLocation: 'A区-01-01',
      shelfLife: 365,
      status: 'active',
      remarks: '主要原材料'
    },
    {
      key: '2',
      materialCode: 'MAT-002',
      materialName: '包装纸箱',
      specification: '40x30x20cm',
      category: '包装材料',
      unit: '个',
      supplier: '包装公司B',
      unitPrice: 2.80,
      safetyStock: 200,
      currentStock: 150,
      maxStock: 500,
      storageLocation: 'B区-02-05',
      shelfLife: 730,
      status: 'active',
      remarks: '库存不足'
    }
  ];

  // 库位主数据
  const locationsData = [
    {
      key: '1',
      locationCode: 'A区-01-01',
      locationName: '原材料区1号位',
      warehouse: '主仓库',
      area: 'A区',
      row: '01',
      column: '01',
      level: '1',
      capacity: 2000,
      currentUsage: 1200,
      usageRate: 60,
      materialType: '原材料',
      temperature: '常温',
      humidity: '干燥',
      status: 'active',
      remarks: '主要存放塑料原料'
    },
    {
      key: '2',
      locationCode: 'B区-02-05',
      locationName: '包装材料区5号位',
      warehouse: '主仓库',
      area: 'B区',
      row: '02',
      column: '05',
      level: '1',
      capacity: 500,
      currentUsage: 150,
      usageRate: 30,
      materialType: '包装材料',
      temperature: '常温',
      humidity: '干燥',
      status: 'active',
      remarks: '包装材料专用区域'
    }
  ];

  const materialColumns = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '物料类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        const colorMap = {
          '原材料': 'blue',
          '半成品': 'orange',
          '成品': 'green',
          '包装材料': 'purple',
          '备件': 'red'
        };
        return <Tag color={colorMap[category]}>{category}</Tag>;
      }
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 80,
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '库存信息',
      key: 'stockInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div>当前: {record.currentStock} {record.unit}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            安全: {record.safetyStock} | 最大: {record.maxStock}
          </div>
          {record.currentStock <= record.safetyStock && (
            <Tag color="red" size="small">库存不足</Tag>
          )}
        </div>
      )
    },
    {
      title: '存储位置',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      width: 120,
    },
    {
      title: '保质期(天)',
      dataIndex: 'shelfLife',
      key: 'shelfLife',
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
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button type="link" size="small">
            库存
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const locationColumns = [
    {
      title: '库位编码',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '库位名称',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 150,
    },
    {
      title: '仓库信息',
      key: 'warehouseInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.warehouse}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.area}-{record.row}-{record.column}-{record.level}层
          </div>
        </div>
      )
    },
    {
      title: '容量使用',
      key: 'capacityUsage',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.currentUsage} / {record.capacity}</div>
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '6px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '3px',
                marginRight: '8px'
              }}>
                <div style={{
                  width: `${record.usageRate}%`,
                  height: '100%',
                  backgroundColor: record.usageRate > 80 ? '#ff4d4f' : record.usageRate > 60 ? '#faad14' : '#52c41a',
                  borderRadius: '3px'
                }} />
              </div>
              <span style={{ fontSize: '12px' }}>{record.usageRate}%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '物料类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '存储条件',
      key: 'storageCondition',
      width: 120,
      render: (_, record) => (
        <div>
          <div>温度: {record.temperature}</div>
          <div>湿度: {record.humidity}</div>
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
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Button type="link" size="small">
            库存
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交主数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'materials',
      label: '物料主数据',
      icon: <AppstoreOutlined />
    },
    {
      key: 'locations',
      label: '库位主数据',
      icon: <EnvironmentOutlined />
    }
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            库存主数据管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>
              导入数据
            </Button>
            <Button icon={<ExportOutlined />}>
              导出数据
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建{activeTab === 'materials' ? '物料' : '库位'}
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder={`搜索${activeTab === 'materials' ? '物料编码/名称' : '库位编码/名称'}`}
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            {activeTab === 'materials' ? (
              <>
                <Select placeholder="物料类别" style={{ width: 120 }}>
                  <Option value="raw">原材料</Option>
                  <Option value="semi">半成品</Option>
                  <Option value="finished">成品</Option>
                  <Option value="packaging">包装材料</Option>
                  <Option value="spare">备件</Option>
                </Select>
                <Select placeholder="供应商" style={{ width: 150 }}>
                  <Option value="supplier_a">塑料公司A</Option>
                  <Option value="supplier_b">包装公司B</Option>
                </Select>
              </>
            ) : (
              <>
                <Select placeholder="仓库" style={{ width: 120 }}>
                  <Option value="main">主仓库</Option>
                  <Option value="spare">备件仓库</Option>
                </Select>
                <Select placeholder="区域" style={{ width: 100 }}>
                  <Option value="A">A区</Option>
                  <Option value="B">B区</Option>
                  <Option value="C">C区</Option>
                </Select>
              </>
            )}
            <Select placeholder="状态" style={{ width: 100 }}>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={activeTab === 'materials' ? materialColumns : locationColumns}
          dataSource={activeTab === 'materials' ? materialsData : locationsData}
          loading={loading}
          pagination={{
            total: activeTab === 'materials' ? materialsData.length : locationsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新建/编辑模态框 */}
      <Modal
        title={`${activeTab === 'materials' ? '物料' : '库位'}信息`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {activeTab === 'materials' ? (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="materialCode"
                    label="物料编码"
                    rules={[{ required: true, message: '请输入物料编码' }]}
                  >
                    <Input placeholder="请输入物料编码" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="materialName"
                    label="物料名称"
                    rules={[{ required: true, message: '请输入物料名称' }]}
                  >
                    <Input placeholder="请输入物料名称" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="specification"
                    label="规格型号"
                  >
                    <Input placeholder="请输入规格型号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="物料类别"
                    rules={[{ required: true, message: '请选择物料类别' }]}
                  >
                    <Select placeholder="请选择物料类别">
                      <Option value="原材料">原材料</Option>
                      <Option value="半成品">半成品</Option>
                      <Option value="成品">成品</Option>
                      <Option value="包装材料">包装材料</Option>
                      <Option value="备件">备件</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="unit"
                    label="单位"
                    rules={[{ required: true, message: '请输入单位' }]}
                  >
                    <Input placeholder="如：kg、个、米" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="unitPrice"
                    label="单价"
                  >
                    <InputNumber 
                      min={0} 
                      precision={2} 
                      placeholder="单价" 
                      style={{ width: '100%' }}
                      addonBefore="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="shelfLife"
                    label="保质期(天)"
                  >
                    <InputNumber min={0} placeholder="保质期" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="locationCode"
                    label="库位编码"
                    rules={[{ required: true, message: '请输入库位编码' }]}
                  >
                    <Input placeholder="请输入库位编码" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="locationName"
                    label="库位名称"
                    rules={[{ required: true, message: '请输入库位名称' }]}
                  >
                    <Input placeholder="请输入库位名称" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="warehouse"
                    label="仓库"
                    rules={[{ required: true, message: '请选择仓库' }]}
                  >
                    <Select placeholder="请选择仓库">
                      <Option value="主仓库">主仓库</Option>
                      <Option value="备件仓库">备件仓库</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="area"
                    label="区域"
                  >
                    <Input placeholder="如：A区" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="capacity"
                    label="容量"
                  >
                    <InputNumber min={0} placeholder="容量" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          
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

export default InventoryMasterData;