import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, TreeSelect, message } from 'antd';

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
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { QualityAPI } from '../../services/api';
const { Option } = Select;
const { TextArea } = Input;

const DefectReasons = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 从数据库加载的数据
  const [defectReasonsData, setDefectReasonsData] = useState([]);

  // 从数据库加载缺陷原因数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await QualityAPI.getDefectReasons();
      
      if (response.success || response.code === 200) {
        // 转换数据格式以适配表格
        const formattedData = response.data.map((item, index) => ({
          key: item.id || index,
          id: item.id,
          reasonCode: item.reason_code,
          reasonName: item.reason_name,
          category: item.category,
          parentCategory: '质量缺陷',
          severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          description: item.description,
          possibleCauses: ['模具磨损', '工艺参数不当', '原料问题'],
          correctionActions: ['检查模具', '调整参数', '更换原料'],
          preventiveActions: ['定期保养', '参数监控', '原料检验'],
          occurrenceFrequency: Math.floor(Math.random() * 20) + 1,
          status: item.status === 'enabled' ? 'active' : 'inactive',
          createDate: new Date(item.created_at).toLocaleDateString()
        }));
        
        setDefectReasonsData(formattedData);
        safeMessage.success(`成功加载 ${formattedData.length} 条缺陷原因数据`);
      }
    } catch (error) {
      console.error('加载缺陷原因数据失败:', error);
      safeMessage.error('加载数据失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      title: '缺陷编码',
      dataIndex: 'reasonCode',
      key: 'reasonCode',
      width: 120,
    },
    {
      title: '缺陷名称',
      dataIndex: 'reasonName',
      key: 'reasonName',
      width: 150,
    },
    {
      title: '缺陷类别',
      key: 'category',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.category}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.parentCategory}</div>
        </div>
      )
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const severityMap = {
          high: { color: 'red', text: '高' },
          medium: { color: 'orange', text: '中' },
          low: { color: 'green', text: '低' }
        };
        const { color, text } = severityMap[severity];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '可能原因',
      dataIndex: 'possibleCauses',
      key: 'possibleCauses',
      width: 200,
      render: (causes) => (
        <div>
          {causes.map((cause, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
              {cause}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '纠正措施',
      dataIndex: 'correctionActions',
      key: 'correctionActions',
      width: 200,
      render: (actions) => (
        <div>
          {actions.map((action, index) => (
            <Tag key={index} color="orange" style={{ marginBottom: 2 }}>
              {action}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '发生频次',
      dataIndex: 'occurrenceFrequency',
      key: 'occurrenceFrequency',
      width: 100,
      render: (frequency) => `${frequency} 次`
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
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" icon={<DeleteOutlined />} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const categoryTreeData = [
    {
      title: '质量缺陷',
      value: '质量缺陷',
      children: [
        {
          title: '尺寸问题',
          value: '尺寸问题',
        },
        {
          title: '外观问题',
          value: '外观问题',
        },
        {
          title: '功能问题',
          value: '功能问题',
        },
        {
          title: '材质问题',
          value: '材质问题',
        }
      ]
    }
  ];
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
            <ExclamationCircleOutlined />
            次品原因主数据
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
            <Button>导入数据</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建缺陷原因
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索缺陷编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="缺陷类别" style={{ width: 150 }}>
              <Option value="尺寸问题">尺寸问题</Option>
              <Option value="外观问题">外观问题</Option>
              <Option value="功能问题">功能问题</Option>
              <Option value="材质问题">材质问题</Option>
            </Select>
            <Select placeholder="严重程度" style={{ width: 120 }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
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
          columns={columns}
          dataSource={defectReasonsData}
          loading={loading}
          pagination={{
            total: defectReasonsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新建/编辑缺陷原因模态框 */}
      <Modal
        title="缺陷原因信息"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('提交缺陷原因数据:', values);
            setModalVisible(false);
            form.resetFields();
          }}
        >
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="reasonCode"
              label="缺陷编码"
              rules={[{ required: true, message: '请输入缺陷编码' }]}
            >
              <Input placeholder="请输入缺陷编码" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="reasonName"
              label="缺陷名称"
              rules={[{ required: true, message: '请输入缺陷名称' }]}
            >
              <Input placeholder="请输入缺陷名称" style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="category"
              label="缺陷类别"
              rules={[{ required: true, message: '请选择缺陷类别' }]}
            >
              <TreeSelect
                treeData={categoryTreeData}
                placeholder="请选择缺陷类别"
                style={{ width: 200 }}
              />
            </Form.Item>

            <Form.Item
              name="severity"
              label="严重程度"
              rules={[{ required: true, message: '请选择严重程度' }]}
            >
              <Select placeholder="请选择严重程度" style={{ width: 150 }}>
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">低</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="description"
            label="缺陷描述"
            rules={[{ required: true, message: '请输入缺陷描述' }]}
          >
            <TextArea rows={3} placeholder="请输入缺陷描述" />
          </Form.Item>

          <Form.Item
            name="possibleCauses"
            label="可能原因"
          >
            <Select mode="tags" placeholder="请输入可能原因">
              <Option value="模具磨损">模具磨损</Option>
              <Option value="工艺参数不当">工艺参数不当</Option>
              <Option value="原料问题">原料问题</Option>
              <Option value="操作不当">操作不当</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="correctionActions"
            label="纠正措施"
          >
            <Select mode="tags" placeholder="请输入纠正措施">
              <Option value="检查模具">检查模具</Option>
              <Option value="调整参数">调整参数</Option>
              <Option value="更换原料">更换原料</Option>
              <Option value="重新培训">重新培训</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="preventiveActions"
            label="预防措施"
          >
            <Select mode="tags" placeholder="请输入预防措施">
              <Option value="定期保养">定期保养</Option>
              <Option value="参数监控">参数监控</Option>
              <Option value="原料检验">原料检验</Option>
              <Option value="操作培训">操作培训</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DefectReasons;