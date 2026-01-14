import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Tree, Tabs, Descriptions, Divider } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DatabaseOutlined, SwapOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;

const DataMapping = () => {
  const [activeTab, setActiveTab] = useState('field-mapping');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [form] = Form.useForm();

  // 字段映射数据
  const fieldMappingData = [
    {
      key: '1',
      mappingCode: 'MAP-ERP-PO-001',
      mappingName: 'ERP生产订单映射',
      sourceSystem: 'ERP',
      targetSystem: 'MES',
      interfaceCode: 'ERP-PO-001',
      status: '生效',
      fieldCount: 15,
      createDate: '2024-01-15',
      creator: '张工程师'
    },
    {
      key: '2',
      mappingCode: 'MAP-WMS-INV-001',
      mappingName: 'WMS库存数据映射',
      sourceSystem: 'WMS',
      targetSystem: 'MES',
      interfaceCode: 'WMS-INV-001',
      status: '生效',
      fieldCount: 12,
      createDate: '2024-02-10',
      creator: '李主管'
    },
    {
      key: '3',
      mappingCode: 'MAP-PLM-PROC-001',
      mappingName: 'PLM工艺数据映射',
      sourceSystem: 'PLM',
      targetSystem: 'MES',
      interfaceCode: 'PLM-PROC-001',
      status: '待测试',
      fieldCount: 20,
      createDate: '2024-03-05',
      creator: '王技术员'
    }
  ];

  // 数据转换规则数据
  const transformRuleData = [
    {
      key: '1',
      ruleCode: 'RULE-001',
      ruleName: '日期格式转换',
      ruleType: '格式转换',
      sourceFormat: 'yyyy-MM-dd HH:mm:ss',
      targetFormat: 'yyyy/MM/dd HH:mm:ss',
      status: '生效',
      usage: 8
    },
    {
      key: '2',
      ruleCode: 'RULE-002',
      ruleName: '状态码映射',
      ruleType: '值映射',
      sourceFormat: '1,2,3,4',
      targetFormat: '待处理,进行中,已完成,已取消',
      status: '生效',
      usage: 5
    },
    {
      key: '3',
      ruleCode: 'RULE-003',
      ruleName: '数量单位转换',
      ruleType: '计算转换',
      sourceFormat: 'kg',
      targetFormat: 'g (*1000)',
      status: '生效',
      usage: 3
    }
  ];

  const fieldMappingColumns = [
    {
      title: '映射编码',
      dataIndex: 'mappingCode',
      key: 'mappingCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '映射名称',
      dataIndex: 'mappingName',
      key: 'mappingName'
    },
    {
      title: '源系统',
      dataIndex: 'sourceSystem',
      key: 'sourceSystem',
      render: (system) => (
        <Tag color="blue">{system}</Tag>
      )
    },
    {
      title: '目标系统',
      dataIndex: 'targetSystem',
      key: 'targetSystem',
      render: (system) => (
        <Tag color="green">{system}</Tag>
      )
    },
    {
      title: '关联接口',
      dataIndex: 'interfaceCode',
      key: 'interfaceCode'
    },
    {
      title: '字段数量',
      dataIndex: 'fieldCount',
      key: 'fieldCount'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : status === '待测试' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const transformRuleColumns = [
    {
      title: '规则编码',
      dataIndex: 'ruleCode',
      key: 'ruleCode'
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName'
    },
    {
      title: '规则类型',
      dataIndex: 'ruleType',
      key: 'ruleType',
      render: (type) => (
        <Tag color={
          type === '格式转换' ? 'blue' : 
          type === '值映射' ? 'green' : 
          type === '计算转换' ? 'orange' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '源格式',
      dataIndex: 'sourceFormat',
      key: 'sourceFormat'
    },
    {
      title: '目标格式',
      dataIndex: 'targetFormat',
      key: 'targetFormat'
    },
    {
      title: '使用次数',
      dataIndex: 'usage',
      key: 'usage'
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
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
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

  const handleViewDetail = (record) => {
    setSelectedMapping(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存数据映射:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 模拟字段映射详情数据
  const fieldMappingDetails = [
    {
      key: '1',
      sourceField: 'order_id',
      sourceType: 'VARCHAR(50)',
      targetField: 'production_order_no',
      targetType: 'VARCHAR(50)',
      required: true,
      transformRule: '无',
      description: '生产订单号'
    },
    {
      key: '2',
      sourceField: 'product_code',
      sourceType: 'VARCHAR(30)',
      targetField: 'product_id',
      targetType: 'VARCHAR(30)',
      required: true,
      transformRule: '无',
      description: '产品编码'
    },
    {
      key: '3',
      sourceField: 'quantity',
      sourceType: 'DECIMAL(10,2)',
      targetField: 'plan_quantity',
      targetType: 'DECIMAL(10,2)',
      required: true,
      transformRule: '无',
      description: '计划数量'
    },
    {
      key: '4',
      sourceField: 'due_date',
      sourceType: 'DATETIME',
      targetField: 'plan_finish_date',
      targetType: 'DATETIME',
      required: true,
      transformRule: 'RULE-001',
      description: '计划完成日期'
    },
    {
      key: '5',
      sourceField: 'status',
      sourceType: 'INT',
      targetField: 'order_status',
      targetType: 'VARCHAR(20)',
      required: true,
      transformRule: 'RULE-002',
      description: '订单状态'
    }
  ];

  const fieldDetailColumns = [
    {
      title: '源字段',
      dataIndex: 'sourceField',
      key: 'sourceField'
    },
    {
      title: '源类型',
      dataIndex: 'sourceType',
      key: 'sourceType'
    },
    {
      title: '目标字段',
      dataIndex: 'targetField',
      key: 'targetField'
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType'
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required) => (
        <Tag color={required ? 'red' : 'default'}>
          {required ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '转换规则',
      dataIndex: 'transformRule',
      key: 'transformRule'
    },
    {
      title: '字段描述',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  const tabItems = [
    {
      key: 'field-mapping',
      label: '字段映射',
      icon: <SwapOutlined />
    },
    {
      key: 'transform-rules',
      label: '转换规则',
      icon: <CodeOutlined />
    }
  ];

  const renderFieldMapping = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索映射配置..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="源系统" style={{ width: 120 }} allowClear>
            <Option value="ERP">ERP</Option>
            <Option value="WMS">WMS</Option>
            <Option value="PLM">PLM</Option>
            <Option value="QMS">QMS</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建映射
          </Button>
        </Space>
      </div>

      <Table
        columns={fieldMappingColumns}
        dataSource={fieldMappingData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );

  const renderTransformRules = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索转换规则..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="规则类型" style={{ width: 120 }} allowClear>
            <Option value="格式转换">格式转换</Option>
            <Option value="值映射">值映射</Option>
            <Option value="计算转换">计算转换</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建规则
          </Button>
        </Space>
      </div>

      <Table
        columns={transformRuleColumns}
        dataSource={transformRuleData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        size="small"
      />
    </div>
  );

  return (
    <div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: item.key === 'field-mapping' ? renderFieldMapping() : renderTransformRules()
          }))}
          size="small"
        />
      </Card>

      {/* 新建/编辑映射模态框 */}
      <Modal
        title={editingRecord ? '编辑数据映射' : '新建数据映射'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mappingCode"
                label="映射编码"
                rules={[{ required: true, message: '请输入映射编码' }]}
              >
                <Input placeholder="请输入映射编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mappingName"
                label="映射名称"
                rules={[{ required: true, message: '请输入映射名称' }]}
              >
                <Input placeholder="请输入映射名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceSystem"
                label="源系统"
                rules={[{ required: true, message: '请选择源系统' }]}
              >
                <Select placeholder="请选择源系统">
                  <Option value="ERP">ERP系统</Option>
                  <Option value="WMS">WMS系统</Option>
                  <Option value="PLM">PLM系统</Option>
                  <Option value="QMS">QMS系统</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetSystem"
                label="目标系统"
                rules={[{ required: true, message: '请选择目标系统' }]}
              >
                <Select placeholder="请选择目标系统">
                  <Option value="MES">MES系统</Option>
                  <Option value="ERP">ERP系统</Option>
                  <Option value="WMS">WMS系统</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="interfaceCode"
            label="关联接口"
            rules={[{ required: true, message: '请选择关联接口' }]}
          >
            <Select placeholder="请选择关联接口">
              <Option value="ERP-PO-001">ERP-PO-001 - 生产订单接口</Option>
              <Option value="WMS-INV-001">WMS-INV-001 - 库存同步接口</Option>
              <Option value="PLM-PROC-001">PLM-PROC-001 - 工艺数据接口</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="映射描述"
          >
            <TextArea rows={3} placeholder="请输入映射描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 映射详情模态框 */}
      <Modal
        title="数据映射详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button onClick={() => handleEdit(record)} key="edit" type="primary" icon={<EditOutlined />}>
            编辑映射
          </Button>
        ]}
      >
        {selectedMapping && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="映射编码">{selectedMapping.mappingCode}</Descriptions.Item>
              <Descriptions.Item label="映射名称">{selectedMapping.mappingName}</Descriptions.Item>
              <Descriptions.Item label="源系统">
                <Tag color="blue">{selectedMapping.sourceSystem}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="目标系统">
                <Tag color="green">{selectedMapping.targetSystem}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="关联接口">{selectedMapping.interfaceCode}</Descriptions.Item>
              <Descriptions.Item label="字段数量">{selectedMapping.fieldCount}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMapping.status === '生效' ? 'green' : 'orange'}>
                  {selectedMapping.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedMapping.creator}</Descriptions.Item>
            </Descriptions>

            <Divider>字段映射详情</Divider>
            <Table
              columns={fieldDetailColumns}
              dataSource={fieldMappingDetails}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataMapping;