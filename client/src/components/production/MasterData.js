import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber } from 'antd';

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
import { PlusOutlined, SearchOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const MasterData = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('products');
  const [form] = Form.useForm();

  // 产品主数据
  const productData = [
    {
      key: '1',
      productCode: 'PROD-A001',
      productName: '产品A',
      category: '电子产品',
      specification: '规格A-标准版',
      unit: '个',
      standardCost: 25.50,
      standardTime: 120,
      qualityStandard: 'GB/T 19001',
      status: 'active',
      createDate: '2024-01-01',
      remarks: '主力产品'
    },
    {
      key: '2',
      productCode: 'PROD-B001',
      productName: '产品B',
      category: '机械产品',
      specification: '规格B-增强版',
      unit: '个',
      standardCost: 45.80,
      standardTime: 180,
      qualityStandard: 'ISO 9001',
      status: 'active',
      createDate: '2024-01-02',
      remarks: '新产品'
    }
  ];

  // 工艺路线数据
  const processData = [
    {
      key: '1',
      processCode: 'PROC-001',
      processName: '注塑工艺',
      productCode: 'PROD-A001',
      stepNumber: 1,
      operationName: '注塑成型',
      standardTime: 60,
      equipmentType: '注塑机',
      skillRequirement: '中级操作员',
      qualityCheckPoint: '外观检查',
      status: 'active'
    },
    {
      key: '2',
      processCode: 'PROC-001',
      processName: '注塑工艺',
      productCode: 'PROD-A001',
      stepNumber: 2,
      operationName: '质量检验',
      standardTime: 30,
      equipmentType: '检测设备',
      skillRequirement: '质检员',
      qualityCheckPoint: '尺寸检查',
      status: 'active'
    }
  ];

  // BOM数据
  const bomData = [
    {
      key: '1',
      bomCode: 'BOM-A001',
      productCode: 'PROD-A001',
      materialCode: 'MAT-001',
      materialName: '原料A',
      quantity: 2.5,
      unit: 'kg',
      scrapRate: 5.0,
      supplier: '供应商A',
      cost: 10.20,
      status: 'active'
    },
    {
      key: '2',
      bomCode: 'BOM-A001',
      productCode: 'PROD-A001',
      materialCode: 'MAT-002',
      materialName: '原料B',
      quantity: 1.0,
      unit: 'kg',
      scrapRate: 3.0,
      supplier: '供应商B',
      cost: 15.30,
      status: 'active'
    }
  ];

  const productColumns = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '产品类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '标准成本',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 100,
      render: (cost) => `¥${cost}`
    },
    {
      title: '标准工时(分)',
      dataIndex: 'standardTime',
      key: 'standardTime',
      width: 120,
    },
    {
      title: '质量标准',
      dataIndex: 'qualityStandard',
      key: 'qualityStandard',
      width: 120,
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
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const processColumns = [
    {
      title: '工艺编码',
      dataIndex: 'processCode',
      key: 'processCode',
      width: 120,
    },
    {
      title: '工艺名称',
      dataIndex: 'processName',
      key: 'processName',
      width: 120,
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '工序号',
      dataIndex: 'stepNumber',
      key: 'stepNumber',
      width: 80,
    },
    {
      title: '操作名称',
      dataIndex: 'operationName',
      key: 'operationName',
      width: 120,
    },
    {
      title: '标准工时(分)',
      dataIndex: 'standardTime',
      key: 'standardTime',
      width: 120,
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      width: 120,
    },
    {
      title: '技能要求',
      dataIndex: 'skillRequirement',
      key: 'skillRequirement',
      width: 120,
    },
    {
      title: '质检点',
      dataIndex: 'qualityCheckPoint',
      key: 'qualityCheckPoint',
      width: 120,
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
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const bomColumns = [
    {
      title: 'BOM编码',
      dataIndex: 'bomCode',
      key: 'bomCode',
      width: 120,
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 150,
    },
    {
      title: '用量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '损耗率(%)',
      dataIndex: 'scrapRate',
      key: 'scrapRate',
      width: 100,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
      width: 80,
      render: (cost) => `¥${cost}`
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
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" icon={<DeleteOutlined />} danger>删除</Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      console.log('提交主数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

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
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };


  return (
    <div>
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            生产主数据管理
          </Space>
        }
      >
        <Tabs 
          activeKey={currentTab} 
          onChange={setCurrentTab}
          tabBarExtraContent={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建数据
            </Button>
          }
        >
          <TabPane tab="产品信息" key="products">
            {renderSearchArea()}
            <Table
              columns={productColumns}
              dataSource={productData}
              loading={loading}
              pagination={{
                total: productData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="工艺路线" key="process">
            {renderSearchArea()}
            <Table
              columns={processColumns}
              dataSource={processData}
              loading={loading}
              pagination={{
                total: processData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="BOM清单" key="bom">
            {renderSearchArea()}
            <Table
              columns={bomColumns}
              dataSource={bomData}
              loading={loading}
              pagination={{
                total: bomData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新建/编辑主数据模态框 */}
      <Modal
        title={`${currentTab === 'products' ? '产品信息' : currentTab === 'process' ? '工艺路线' : 'BOM清单'}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {currentTab === 'products' && (
            <>
              <Form.Item
                name="productCode"
                label="产品编码"
                rules={[{ required: true, message: '请输入产品编码' }]}
              >
                <Input placeholder="请输入产品编码" />
              </Form.Item>
              <Form.Item
                name="productName"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
              <Space style={{ width: '100%' }} size="large">
                <Form.Item
                  name="category"
                  label="产品类别"
                  rules={[{ required: true, message: '请选择产品类别' }]}
                >
                  <Select placeholder="请选择产品类别" style={{ width: 200 }}>
                    <Option value="电子产品">电子产品</Option>
                    <Option value="机械产品">机械产品</Option>
                    <Option value="化工产品">化工产品</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="unit"
                  label="单位"
                  rules={[{ required: true, message: '请选择单位' }]}
                >
                  <Select placeholder="请选择单位" style={{ width: 100 }}>
                    <Option value="个">个</Option>
                    <Option value="件">件</Option>
                    <Option value="套">套</Option>
                  </Select>
                </Form.Item>
              </Space>
              <Form.Item
                name="specification"
                label="规格型号"
              >
                <Input placeholder="请输入规格型号" />
              </Form.Item>
              <Space style={{ width: '100%' }} size="large">
                <Form.Item
                  name="standardCost"
                  label="标准成本"
                >
                  <InputNumber min={0} precision={2} placeholder="标准成本" />
                </Form.Item>
                <Form.Item
                  name="standardTime"
                  label="标准工时(分)"
                >
                  <InputNumber min={0} placeholder="标准工时" />
                </Form.Item>
              </Space>
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

export default MasterData;