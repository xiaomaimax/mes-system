import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, TreeSelect } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const DefectReasons = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const defectReasonsData = [
    {
      key: '1',
      reasonCode: 'DR-001',
      reasonName: '尺寸偏差',
      category: '尺寸问题',
      parentCategory: '质量缺陷',
      severity: 'medium',
      description: '产品尺寸超出公差范围',
      possibleCauses: ['模具磨损', '工艺参数不当', '原料收缩率异常'],
      correctionActions: ['检查模具', '调整工艺参数', '更换原料批次'],
      preventiveActions: ['定期模具保养', '工艺参数监控', '原料检验'],
      occurrenceFrequency: 15,
      status: 'active',
      createDate: '2024-01-01'
    },
    {
      key: '2',
      reasonCode: 'DR-002',
      reasonName: '表面划痕',
      category: '外观问题',
      parentCategory: '质量缺陷',
      severity: 'low',
      description: '产品表面存在划痕或刮伤',
      possibleCauses: ['搬运不当', '包装材料粗糙', '设备表面粗糙'],
      correctionActions: ['改进搬运方式', '更换包装材料', '抛光设备表面'],
      preventiveActions: ['操作培训', '包装材料检验', '设备维护'],
      occurrenceFrequency: 8,
      status: 'active',
      createDate: '2024-01-02'
    },
    {
      key: '3',
      reasonCode: 'DR-003',
      reasonName: '功能失效',
      category: '功能问题',
      parentCategory: '质量缺陷',
      severity: 'high',
      description: '产品功能无法正常使用',
      possibleCauses: ['组装错误', '零件缺陷', '设计问题'],
      correctionActions: ['重新组装', '更换零件', '设计改进'],
      preventiveActions: ['组装培训', '零件检验', '设计评审'],
      occurrenceFrequency: 3,
      status: 'active',
      createDate: '2024-01-03'
    }
  ];

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
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<DeleteOutlined />} danger>
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