import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, InputNumber, DatePicker } from 'antd';

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
import { PlusOutlined, SearchOutlined, ShopOutlined, EditOutlined, DeleteOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { TextArea } = Input;

const ExternalSpareParts = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const externalPartsData = [
    {
      key: '1',
      partCode: 'EXT-SP-001',
      partName: '高精度轴承',
      specification: 'SKF 6205-2RS',
      supplier: '外部供应商A',
      contactPerson: '张经理',
      contactPhone: '138-0000-1111',
      unitPrice: 450.00,
      currency: 'CNY',
      leadTime: 7,
      minOrderQuantity: 10,
      qualityCertification: 'ISO 9001',
      warrantyPeriod: 24,
      applicableEquipment: ['EQ-001', 'EQ-003'],
      lastOrderDate: '2024-01-10',
      lastOrderQuantity: 20,
      evaluationScore: 4.5,
      status: 'active',
      remarks: '质量稳定，交期准时'
    },
    {
      key: '2',
      partCode: 'EXT-SP-002',
      partName: '进口密封圈',
      specification: 'NOK O-Ring 50x3',
      supplier: '外部供应商B',
      contactPerson: '李总',
      contactPhone: '139-0000-2222',
      unitPrice: 85.00,
      currency: 'CNY',
      leadTime: 14,
      minOrderQuantity: 50,
      qualityCertification: 'CE认证',
      warrantyPeriod: 12,
      applicableEquipment: ['EQ-002'],
      lastOrderDate: '2024-01-05',
      lastOrderQuantity: 100,
      evaluationScore: 4.2,
      status: 'active',
      remarks: '价格合理，质量良好'
    },
    {
      key: '3',
      partCode: 'EXT-SP-003',
      partName: '特殊传感器',
      specification: 'Siemens 6ES7',
      supplier: '外部供应商C',
      contactPerson: '王工程师',
      contactPhone: '137-0000-3333',
      unitPrice: 1200.00,
      currency: 'CNY',
      leadTime: 21,
      minOrderQuantity: 5,
      qualityCertification: 'UL认证',
      warrantyPeriod: 36,
      applicableEquipment: ['EQ-001', 'EQ-002', 'EQ-003'],
      lastOrderDate: '2023-12-20',
      lastOrderQuantity: 10,
      evaluationScore: 4.8,
      status: 'inactive',
      remarks: '高端产品，技术支持好'
    }
  ];

  const columns = [
    {
      title: '备件编码',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 120,
      fixed: 'left'
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
      width: 150,
    },
    {
      title: '供应商信息',
      key: 'supplierInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.supplier}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            联系人: {record.contactPerson}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            电话: {record.contactPhone}
          </div>
        </div>
      )
    },
    {
      title: '价格信息',
      key: 'priceInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div>单价: ¥{record.unitPrice.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            最小订量: {record.minOrderQuantity}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            交期: {record.leadTime}天
          </div>
        </div>
      )
    },
    {
      title: '质量认证',
      dataIndex: 'qualityCertification',
      key: 'qualityCertification',
      width: 120,
      render: (cert) => <Tag color="blue">{cert}</Tag>
    },
    {
      title: '保修期',
      dataIndex: 'warrantyPeriod',
      key: 'warrantyPeriod',
      width: 80,
      render: (period) => `${period}个月`
    },
    {
      title: '适用设备',
      dataIndex: 'applicableEquipment',
      key: 'applicableEquipment',
      width: 150,
      render: (equipment) => (
        <div>
          {equipment.map((eq, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 2 }}>
              {eq}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '最近订单',
      key: 'lastOrder',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.lastOrderDate}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            数量: {record.lastOrderQuantity}
          </div>
        </div>
      )
    },
    {
      title: '评价评分',
      dataIndex: 'evaluationScore',
      key: 'evaluationScore',
      width: 100,
      render: (score) => (
        <div>
          <div style={{ color: score >= 4.5 ? '#52c41a' : score >= 4.0 ? '#faad14' : '#ff4d4f' }}>
            ★ {score.toFixed(1)}
          </div>
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button type="link" size="small">
            询价
          </Button>
          <Button type="link" size="small">
            下单
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" 
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
      console.log('提交库外备件数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <ShopOutlined />
            库外备件管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ImportOutlined />}>
              导入备件
            </Button>
            <Button icon={<ExportOutlined />}>
              导出数据
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建备件
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索备件编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="供应商" style={{ width: 150 }}>
              <Option value="supplier_a">外部供应商A</Option>
              <Option value="supplier_b">外部供应商B</Option>
              <Option value="supplier_c">外部供应商C</Option>
            </Select>
            <Select placeholder="质量认证" style={{ width: 120 }}>
              <Option value="iso9001">ISO 9001</Option>
              <Option value="ce">CE认证</Option>
              <Option value="ul">UL认证</Option>
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
          dataSource={externalPartsData}
          loading={loading}
          pagination={{
            total: externalPartsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* 新建/编辑库外备件模态框 */}
      <Modal
        title="库外备件信息"
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
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="partCode"
              label="备件编码"
              rules={[{ required: true, message: '请输入备件编码' }]}
            >
              <Input placeholder="请输入备件编码" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="partName"
              label="备件名称"
              rules={[{ required: true, message: '请输入备件名称' }]}
            >
              <Input placeholder="请输入备件名称" style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="specification"
            label="规格型号"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="supplier"
              label="供应商"
              rules={[{ required: true, message: '请输入供应商' }]}
            >
              <Input placeholder="请输入供应商" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="contactPerson"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入联系人" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="unitPrice"
              label="单价"
              rules={[{ required: true, message: '请输入单价' }]}
            >
              <InputNumber 
                min={0} 
                precision={2} 
                placeholder="单价" 
                style={{ width: 150 }}
                addonBefore="¥"
              />
            </Form.Item>
            <Form.Item
              name="leadTime"
              label="交货期(天)"
              rules={[{ required: true, message: '请输入交货期' }]}
            >
              <InputNumber min={1} placeholder="交货期" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              name="minOrderQuantity"
              label="最小订量"
              rules={[{ required: true, message: '请输入最小订量' }]}
            >
              <InputNumber min={1} placeholder="最小订量" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item
              name="warrantyPeriod"
              label="保修期(月)"
            >
              <InputNumber min={0} placeholder="保修期" style={{ width: 120 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="qualityCertification"
            label="质量认证"
          >
            <Select placeholder="请选择质量认证">
              <Option value="ISO 9001">ISO 9001</Option>
              <Option value="CE认证">CE认证</Option>
              <Option value="UL认证">UL认证</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="applicableEquipment"
            label="适用设备"
          >
            <Select mode="multiple" placeholder="请选择适用设备">
              <Option value="EQ-001">EQ-001 - 注塑机A1</Option>
              <Option value="EQ-002">EQ-002 - 包装机B1</Option>
              <Option value="EQ-003">EQ-003 - 检测设备C1</Option>
            </Select>
          </Form.Item>

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

export default ExternalSpareParts;