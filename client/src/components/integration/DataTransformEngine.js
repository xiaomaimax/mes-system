import React, { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Tabs, Descriptions, Divider, Tree } from 'antd';

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
import {   FunctionOutlined, 
  CodeOutlined, 
  BranchesOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  PlayCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BugOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const DataTransformEngine = () => {
  const [activeTab, setActiveTab] = useState('transform-rules');
  const [modalVisible, setModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [form] = Form.useForm();

  // 转换规则数据
  const transformRuleData = [
    {
      key: '1',
      ruleCode: 'TRANS-001',
      ruleName: '日期格式标准化',
      ruleType: '格式转换',
      sourceFormat: 'yyyy-MM-dd HH:mm:ss',
      targetFormat: 'yyyy/MM/dd HH:mm:ss',
      transformLogic: 'DATE_FORMAT_CONVERT',
      status: '生效',
      usage: 15,
      priority: '高',
      creator: '张工程师',
      createDate: '2024-01-15'
    },
    {
      key: '2',
      ruleCode: 'TRANS-002',
      ruleName: '订单状态映射',
      ruleType: '值映射',
      sourceFormat: '1,2,3,4,5',
      targetFormat: '待处理,进行中,已完成,已取消,已暂停',
      transformLogic: 'VALUE_MAPPING',
      status: '生效',
      usage: 8,
      priority: '高',
      creator: '李主管',
      createDate: '2024-02-10'
    },
    {
      key: '3',
      ruleCode: 'TRANS-003',
      ruleName: '数量单位换算',
      ruleType: '计算转换',
      sourceFormat: 'kg',
      targetFormat: 'g',
      transformLogic: 'MULTIPLY_1000',
      status: '生效',
      usage: 12,
      priority: '中',
      creator: '王技术员',
      createDate: '2024-03-05'
    },
    {
      key: '4',
      ruleCode: 'TRANS-004',
      ruleName: '产品编码规范化',
      ruleType: '字符串处理',
      sourceFormat: '任意格式',
      targetFormat: 'P-XXXXXX',
      transformLogic: 'PRODUCT_CODE_NORMALIZE',
      status: '测试中',
      usage: 3,
      priority: '低',
      creator: '赵工程师',
      createDate: '2024-03-20'
    }
  ];

  // 转换模板数据
  const transformTemplateData = [
    {
      key: '1',
      templateCode: 'TPL-ERP-PO',
      templateName: 'ERP生产订单转换模板',
      sourceSystem: 'ERP',
      targetSystem: 'MES',
      fieldCount: 15,
      ruleCount: 8,
      status: '生效',
      version: 'v1.2'
    },
    {
      key: '2',
      templateCode: 'TPL-WMS-INV',
      templateName: 'WMS库存数据转换模板',
      sourceSystem: 'WMS',
      targetSystem: 'MES',
      fieldCount: 12,
      ruleCount: 5,
      status: '生效',
      version: 'v1.0'
    },
    {
      key: '3',
      templateCode: 'TPL-PLM-PROC',
      templateName: 'PLM工艺数据转换模板',
      sourceSystem: 'PLM',
      targetSystem: 'MES',
      fieldCount: 20,
      ruleCount: 12,
      status: '待测试',
      version: 'v0.8'
    }
  ];

  const ruleColumns = [
    {
      title: '规则编码',
      dataIndex: 'ruleCode',
      key: 'ruleCode',
      render: (text, record) => (
        <a onClick={() => handleViewRule(record)}>{text}</a>
      )
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
          type === '计算转换' ? 'orange' : 
          type === '字符串处理' ? 'purple' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '源格式',
      dataIndex: 'sourceFormat',
      key: 'sourceFormat',
      ellipsis: true
    },
    {
      title: '目标格式',
      dataIndex: 'targetFormat',
      key: 'targetFormat',
      ellipsis: true
    },
    {
      title: '使用次数',
      dataIndex: 'usage',
      key: 'usage'
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={
          priority === '高' ? 'red' : 
          priority === '中' ? 'orange' : 'default'
        }>
          {priority}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : status === '测试中' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleTestRule(record)}>
            测试
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

  const templateColumns = [
    {
      title: '模板编码',
      dataIndex: 'templateCode',
      key: 'templateCode'
    },
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName'
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
      title: '字段数量',
      dataIndex: 'fieldCount',
      key: 'fieldCount'
    },
    {
      title: '规则数量',
      dataIndex: 'ruleCount',
      key: 'ruleCount'
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
        <Tag color={status === '生效' ? 'green' : status === '待测试' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<PlayCircleOutlined />}>
            测试
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

  const handleViewRule = (record) => {
    setSelectedRule(record);
    // 这里可以打开规则详情页面
  };

  const handleTestRule = (record) => {
    setSelectedRule(record);
    setTestModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存转换规则:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleTestTransform = () => {
    safeMessage.loading('正在执行转换测试...', 2);
    setTimeout(() => {
      safeMessage.success('转换测试成功');
    }, 2000);
  };

  const tabItems = [
    {
      key: 'transform-rules',
      label: '转换规则',
      icon: <FunctionOutlined />
    },
    {
      key: 'transform-templates',
      label: '转换模板',
      icon: <FileTextOutlined />
    },
    {
      key: 'rule-engine',
      label: '规则引擎',
      icon: <SettingOutlined />
    }
  ];

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
            <Option value="字符串处理">字符串处理</Option>
          </Select>
          <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
            <Option value="生效">生效</Option>
            <Option value="测试中">测试中</Option>
            <Option value="已停用">已停用</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建规则
          </Button>
        </Space>
      </div>

      <Table
        columns={ruleColumns}
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

  const renderTransformTemplates = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="搜索转换模板..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Select placeholder="源系统" style={{ width: 120 }} allowClear>
            <Option value="ERP">ERP</Option>
            <Option value="WMS">WMS</Option>
            <Option value="PLM">PLM</Option>
          </Select>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建模板
          </Button>
        </Space>
      </div>

      <Table
        columns={templateColumns}
        dataSource={transformTemplateData}
        pagination={false}
        size="small"
      />
    </div>
  );

  const renderRuleEngine = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="规则引擎配置" size="small" style={{ marginBottom: '16px' }}>
            <Form layout="vertical" size="small">
              <Form.Item label="执行模式">
                <Select defaultValue="sequential">
                  <Option value="sequential">顺序执行</Option>
                  <Option value="parallel">并行执行</Option>
                  <Option value="conditional">条件执行</Option>
                </Select>
              </Form.Item>
              <Form.Item label="错误处理策略">
                <Select defaultValue="continue">
                  <Option value="continue">继续执行</Option>
                  <Option value="stop">停止执行</Option>
                  <Option value="retry">重试执行</Option>
                </Select>
              </Form.Item>
              <Form.Item label="最大执行时间(秒)">
                <Input defaultValue="300" />
              </Form.Item>
              <Form.Item label="日志级别">
                <Select defaultValue="info">
                  <Option value="debug">调试</Option>
                  <Option value="info">信息</Option>
                  <Option value="warn">警告</Option>
                  <Option value="error">错误</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="性能监控" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>1,245</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>今日执行次数</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>98.5%</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>执行成功率</div>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>125ms</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>平均执行时间</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#722ed1' }}>18</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>活跃规则数</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="规则执行流程" size="small">
        <div style={{ padding: '16px', background: '#fafafa' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            数据转换执行流程：
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            1. 数据输入验证 → 2. 规则匹配 → 3. 转换执行 → 4. 结果验证 → 5. 输出数据
          </div>
        </div>
      </Card>
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
            children: 
              item.key === 'transform-rules' ? renderTransformRules() :
              item.key === 'transform-templates' ? renderTransformTemplates() :
              renderRuleEngine()
          }))}
          size="small"
        />
      </Card>

      {/* 新建/编辑转换规则模态框 */}
      <Modal
        title={editingRecord ? '编辑转换规则' : '新建转换规则'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ruleCode"
                label="规则编码"
                rules={[{ required: true, message: '请输入规则编码' }]}
              >
                <Input placeholder="请输入规则编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ruleName"
                label="规则名称"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="请输入规则名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ruleType"
                label="规则类型"
                rules={[{ required: true, message: '请选择规则类型' }]}
              >
                <Select placeholder="请选择规则类型">
                  <Option value="格式转换">格式转换</Option>
                  <Option value="值映射">值映射</Option>
                  <Option value="计算转换">计算转换</Option>
                  <Option value="字符串处理">字符串处理</Option>
                  <Option value="条件判断">条件判断</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="高">高</Option>
                  <Option value="中">中</Option>
                  <Option value="低">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceFormat"
                label="源格式"
                rules={[{ required: true, message: '请输入源格式' }]}
              >
                <Input placeholder="请输入源格式" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetFormat"
                label="目标格式"
                rules={[{ required: true, message: '请输入目标格式' }]}
              >
                <Input placeholder="请输入目标格式" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="transformLogic"
            label="转换逻辑"
            rules={[{ required: true, message: '请输入转换逻辑' }]}
          >
            <Select placeholder="请选择转换逻辑">
              <Option value="DATE_FORMAT_CONVERT">日期格式转换</Option>
              <Option value="VALUE_MAPPING">值映射</Option>
              <Option value="MULTIPLY_1000">乘以1000</Option>
              <Option value="DIVIDE_1000">除以1000</Option>
              <Option value="UPPER_CASE">转大写</Option>
              <Option value="LOWER_CASE">转小写</Option>
              <Option value="CUSTOM_SCRIPT">自定义脚本</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="规则描述"
          >
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则测试模态框 */}
      <Modal
        title="转换规则测试"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>
            关闭
          </Button>,
          <Button key="test" type="primary" icon={<ThunderboltOutlined />} onClick={handleTestTransform}>
            执行测试
          </Button>
        ]}
      >
        {selectedRule && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="规则名称">{selectedRule.ruleName}</Descriptions.Item>
              <Descriptions.Item label="规则类型">{selectedRule.ruleType}</Descriptions.Item>
              <Descriptions.Item label="源格式">{selectedRule.sourceFormat}</Descriptions.Item>
              <Descriptions.Item label="目标格式">{selectedRule.targetFormat}</Descriptions.Item>
            </Descriptions>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card title="测试输入" size="small">
                  <TextArea 
                    rows={6} 
                    placeholder="请输入测试数据..."
                    defaultValue={`{
  "date": "2024-12-20 10:30:15",
  "status": "1",
  "quantity": "100.5",
  "productCode": "p001"
}`}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="转换结果" size="small">
                  <div style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    minHeight: '140px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    <div style={{ color: '#666' }}>点击"执行测试"查看转换结果...</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataTransformEngine;