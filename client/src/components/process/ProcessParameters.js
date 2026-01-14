import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber, Tag, message, Row, Col, Tabs, Slider, Switch } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, ExperimentOutlined, MonitorOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { processData } from '../../data/mockData';
const { Option } = Select;
const { TextArea } = Input;

const ProcessParameters = () => {
  const [activeTab, setActiveTab] = useState('injection');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 注塑工艺参数
  const injectionParams = [
    {
      key: '1',
      paramCode: 'INJ-001',
      paramName: '注射温度',
      category: '温度参数',
      unit: '°C',
      standardValue: 220,
      tolerance: '±5',
      minValue: 210,
      maxValue: 230,
      status: '生效'
    },
    {
      key: '2',
      paramCode: 'INJ-002',
      paramName: '注射压力',
      category: '压力参数',
      unit: 'MPa',
      standardValue: 80,
      tolerance: '±10',
      minValue: 70,
      maxValue: 90,
      status: '生效'
    }
  ];

  // 机加工艺参数
  const machiningParams = [
    {
      key: '1',
      paramCode: 'MAC-001',
      paramName: '主轴转速',
      category: '切削参数',
      unit: 'rpm',
      standardValue: 1200,
      tolerance: '±100',
      minValue: 1100,
      maxValue: 1300,
      status: '生效'
    }
  ];

  const columns = [
    {
      title: '参数编码',
      dataIndex: 'paramCode',
      key: 'paramCode'
    },
    {
      title: '参数名称',
      dataIndex: 'paramName',
      key: 'paramName'
    },
    {
      title: '参数类别',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: '标准值',
      dataIndex: 'standardValue',
      key: 'standardValue'
    },
    {
      title: '公差',
      dataIndex: 'tolerance',
      key: 'tolerance'
    },
    {
      title: '最小值',
      dataIndex: 'minValue',
      key: 'minValue'
    },
    {
      title: '最大值',
      dataIndex: 'maxValue',
      key: 'maxValue'
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
      console.log('保存工艺参数:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const tabItems = [
    {
      key: 'injection',
      label: '注塑参数',
      icon: <SettingOutlined />
    },
    {
      key: 'machining',
      label: '机加参数',
      icon: <ExperimentOutlined />
    },
    {
      key: 'assembly',
      label: '装配参数',
      icon: <MonitorOutlined />
    }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'injection':
        return injectionParams;
      case 'machining':
        return machiningParams;
      case 'assembly':
        return [];
      default:
        return injectionParams;
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索工艺参数..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增参数
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
          dataSource={getCurrentData()}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑工艺参数' : '新增工艺参数'}
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
                name="paramCode"
                label="参数编码"
                rules={[{ required: true, message: '请输入参数编码' }]}
              >
                <Input placeholder="请输入参数编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paramName"
                label="参数名称"
                rules={[{ required: true, message: '请输入参数名称' }]}
              >
                <Input placeholder="请输入参数名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="参数类别"
                rules={[{ required: true, message: '请选择参数类别' }]}
              >
                <Select placeholder="请选择参数类别">
                  <Option value="温度参数">温度参数</Option>
                  <Option value="压力参数">压力参数</Option>
                  <Option value="速度参数">速度参数</Option>
                  <Option value="时间参数">时间参数</Option>
                  <Option value="切削参数">切削参数</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="请输入单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="standardValue"
                label="标准值"
                rules={[{ required: true, message: '请输入标准值' }]}
              >
                <InputNumber placeholder="标准值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minValue"
                label="最小值"
                rules={[{ required: true, message: '请输入最小值' }]}
              >
                <InputNumber placeholder="最小值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxValue"
                label="最大值"
                rules={[{ required: true, message: '请输入最大值' }]}
              >
                <InputNumber placeholder="最大值" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tolerance"
            label="公差范围"
          >
            <Input placeholder="例如: ±5" />
          </Form.Item>
          <Form.Item
            name="description"
            label="参数描述"
          >
            <TextArea rows={3} placeholder="请输入参数描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProcessParameters;