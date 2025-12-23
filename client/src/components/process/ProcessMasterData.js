import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, message, Tabs, Row, Col, Statistic, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, ImportOutlined, BookOutlined, SettingOutlined, BranchesOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const ProcessMasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 产品主数据
  const productData = [
    {
      key: '1',
      productCode: 'P001',
      productName: '塑料外壳A',
      category: '注塑件',
      specification: '150×80×25mm',
      material: 'ABS塑料',
      status: '生效',
      createDate: '2024-01-15',
      version: 'V2.1'
    },
    {
      key: '2',
      productCode: 'P002',
      productName: '电子组件B',
      category: '电子件',
      specification: '50×30×10mm',
      material: 'PCB板',
      status: '生效',
      createDate: '2024-02-20',
      version: 'V1.5'
    },
    {
      key: '3',
      productCode: 'P003',
      productName: '机械零件C',
      category: '机加件',
      specification: '100×50×20mm',
      material: '铝合金',
      status: '待审核',
      createDate: '2024-03-10',
      version: 'V1.0'
    }
  ];

  // 工序主数据
  const operationData = [
    {
      key: '1',
      operationCode: 'OP001',
      operationName: '注塑成型',
      category: '成型工序',
      workCenter: '注塑车间',
      standardTime: 45,
      setupTime: 15,
      status: '生效'
    },
    {
      key: '2',
      operationCode: 'OP002',
      operationName: '机械加工',
      category: '加工工序',
      workCenter: '机加车间',
      standardTime: 60,
      setupTime: 20,
      status: '生效'
    },
    {
      key: '3',
      operationCode: 'OP003',
      operationName: '表面处理',
      category: '后处理',
      workCenter: '表处车间',
      standardTime: 30,
      setupTime: 10,
      status: '生效'
    }
  ];

  // 设备主数据
  const equipmentData = [
    {
      key: '1',
      equipmentCode: 'EQ001',
      equipmentName: '注塑机A',
      model: 'INJ-200T',
      workCenter: '注塑车间',
      capacity: '200吨',
      status: '运行中',
      efficiency: 95
    },
    {
      key: '2',
      equipmentCode: 'EQ002',
      equipmentName: '数控机床B',
      model: 'CNC-500',
      workCenter: '机加车间',
      capacity: '500mm',
      status: '运行中',
      efficiency: 88
    },
    {
      key: '3',
      equipmentCode: 'EQ003',
      equipmentName: '喷涂线C',
      model: 'SPRAY-AUTO',
      workCenter: '表处车间',
      capacity: '100件/小时',
      status: '维护中',
      efficiency: 0
    }
  ];

  const productColumns = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '产品类别',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '主要材料',
      dataIndex: 'material',
      key: 'material'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : status === '待审核' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const operationColumns = [
    {
      title: '工序编码',
      dataIndex: 'operationCode',
      key: 'operationCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '工序名称',
      dataIndex: 'operationName',
      key: 'operationName'
    },
    {
      title: '工序类别',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      key: 'workCenter'
    },
    {
      title: '标准工时(分)',
      dataIndex: 'standardTime',
      key: 'standardTime'
    },
    {
      title: '准备工时(分)',
      dataIndex: 'setupTime',
      key: 'setupTime'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const equipmentColumns = [
    {
      title: '设备编码',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName'
    },
    {
      title: '设备型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      key: 'workCenter'
    },
    {
      title: '设备能力',
      dataIndex: 'capacity',
      key: 'capacity'
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '运行中' ? 'green' : status === '维护中' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '设备效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency) => (
        <div>
          <Progress percent={efficiency} size="small" />
          <span style={{ fontSize: '12px' }}>{efficiency}%</span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存数据:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'products',
      label: '产品主数据',
      icon: <BookOutlined />
    },
    {
      key: 'operations',
      label: '工序主数据',
      icon: <SettingOutlined />
    },
    {
      key: 'equipment',
      label: '设备主数据',
      icon: <BranchesOutlined />
    }
  ];

  const renderProductForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别">
              <Option value="注塑件">注塑件</Option>
              <Option value="电子件">电子件</Option>
              <Option value="机加件">机加件</Option>
              <Option value="装配件">装配件</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="specification"
            label="规格型号"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="material"
            label="主要材料"
            rules={[{ required: true, message: '请输入主要材料' }]}
          >
            <Input placeholder="请输入主要材料" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
          >
            <Input placeholder="请输入版本号" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="产品描述"
      >
        <TextArea rows={3} placeholder="请输入产品描述" />
      </Form.Item>
    </Form>
  );

  const renderOperationForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="operationCode"
            label="工序编码"
            rules={[{ required: true, message: '请输入工序编码' }]}
          >
            <Input placeholder="请输入工序编码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="operationName"
            label="工序名称"
            rules={[{ required: true, message: '请输入工序名称' }]}
          >
            <Input placeholder="请输入工序名称" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="工序类别"
            rules={[{ required: true, message: '请选择工序类别' }]}
          >
            <Select placeholder="请选择工序类别">
              <Option value="成型工序">成型工序</Option>
              <Option value="加工工序">加工工序</Option>
              <Option value="装配工序">装配工序</Option>
              <Option value="后处理">后处理</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="workCenter"
            label="工作中心"
            rules={[{ required: true, message: '请选择工作中心' }]}
          >
            <Select placeholder="请选择工作中心">
              <Option value="注塑车间">注塑车间</Option>
              <Option value="机加车间">机加车间</Option>
              <Option value="装配车间">装配车间</Option>
              <Option value="表处车间">表处车间</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="standardTime"
            label="标准工时(分钟)"
            rules={[{ required: true, message: '请输入标准工时' }]}
          >
            <InputNumber min={0} placeholder="请输入标准工时" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="setupTime"
            label="准备工时(分钟)"
            rules={[{ required: true, message: '请输入准备工时' }]}
          >
            <InputNumber min={0} placeholder="请输入准备工时" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="工序描述"
      >
        <TextArea rows={3} placeholder="请输入工序描述" />
      </Form.Item>
    </Form>
  );

  const renderEquipmentForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="equipmentCode"
            label="设备编码"
            rules={[{ required: true, message: '请输入设备编码' }]}
          >
            <Input placeholder="请输入设备编码" />
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
            name="model"
            label="设备型号"
            rules={[{ required: true, message: '请输入设备型号' }]}
          >
            <Input placeholder="请输入设备型号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="workCenter"
            label="工作中心"
            rules={[{ required: true, message: '请选择工作中心' }]}
          >
            <Select placeholder="请选择工作中心">
              <Option value="注塑车间">注塑车间</Option>
              <Option value="机加车间">机加车间</Option>
              <Option value="装配车间">装配车间</Option>
              <Option value="表处车间">表处车间</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="capacity"
            label="设备能力"
            rules={[{ required: true, message: '请输入设备能力' }]}
          >
            <Input placeholder="请输入设备能力" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="efficiency"
            label="设备效率(%)"
            rules={[{ required: true, message: '请输入设备效率' }]}
          >
            <InputNumber min={0} max={100} placeholder="请输入设备效率" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="设备描述"
      >
        <TextArea rows={3} placeholder="请输入设备描述" />
      </Form.Item>
    </Form>
  );

  const getModalTitle = () => {
    const titles = {
      products: editingRecord ? '编辑产品' : '新增产品',
      operations: editingRecord ? '编辑工序' : '新增工序',
      equipment: editingRecord ? '编辑设备' : '新增设备'
    };
    return titles[activeTab];
  };

  const getFormContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProductForm();
      case 'operations':
        return renderOperationForm();
      case 'equipment':
        return renderEquipmentForm();
      default:
        return renderProductForm();
    }
  };

  const getTableData = () => {
    switch (activeTab) {
      case 'products':
        return { columns: productColumns, data: productData };
      case 'operations':
        return { columns: operationColumns, data: operationData };
      case 'equipment':
        return { columns: equipmentColumns, data: equipmentData };
      default:
        return { columns: productColumns, data: productData };
    }
  };

  const { columns, data } = getTableData();

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="产品总数"
              value={productData.length}
              prefix={<BookOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="工序总数"
              value={operationData.length}
              prefix={<SettingOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="设备总数"
              value={equipmentData.length}
              prefix={<BranchesOutlined />}
              suffix="台"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
          </Space>
          <Space>
            <Button icon={<ImportOutlined />}>导入</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />

        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        {getFormContent()}
      </Modal>
    </div>
  );
};

export default ProcessMasterData;