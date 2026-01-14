import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, Transfer } from 'antd';
import { PlusOutlined, SearchOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;

const EquipmentResponsibility = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const responsibilityData = [
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      workshopName: '车间A',
      productionLine: '生产线1',
      primaryOperator: '张三',
      secondaryOperators: ['李四', '王五'],
      maintenanceStaff: '赵六',
      qualityInspector: '钱七',
      shift: '白班',
      status: 'active',
      assignDate: '2024-01-01',
      remarks: '主要负责产品A生产'
    },
    {
      key: '2',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      workshopName: '车间A',
      productionLine: '生产线1',
      primaryOperator: '李四',
      secondaryOperators: ['张三'],
      maintenanceStaff: '赵六',
      qualityInspector: '钱七',
      shift: '白班',
      status: 'active',
      assignDate: '2024-01-01',
      remarks: '负责产品包装工序'
    }
  ];

  // 可选人员数据
  const staffOptions = [
    { key: 'zhang_san', title: '张三', description: '操作员' },
    { key: 'li_si', title: '李四', description: '操作员' },
    { key: 'wang_wu', title: '王五', description: '操作员' },
    { key: 'zhao_liu', title: '赵六', description: '维修员' },
    { key: 'qian_qi', title: '钱七', description: '质检员' },
  ];

  const columns = [
    {
      title: '设备编号',
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
      title: '车间/产线',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.workshopName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '主操作员',
      dataIndex: 'primaryOperator',
      key: 'primaryOperator',
      width: 100,
    },
    {
      title: '副操作员',
      dataIndex: 'secondaryOperators',
      key: 'secondaryOperators',
      width: 150,
      render: (operators) => (
        <div>
          {operators.map((operator, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
              {operator}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '维修负责人',
      dataIndex: 'maintenanceStaff',
      key: 'maintenanceStaff',
      width: 100,
    },
    {
      title: '质检负责人',
      dataIndex: 'qualityInspector',
      key: 'qualityInspector',
      width: 100,
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 80,
      render: (shift) => (
        <Tag color={shift === '白班' ? 'blue' : shift === '夜班' ? 'purple' : 'orange'}>
          {shift}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '生效' : '失效'}
        </Tag>
      )
    },
    {
      title: '分配日期',
      dataIndex: 'assignDate',
      key: 'assignDate',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
          <Button type="link" size="small">详情</Button>
          <Button type="link" size="small" danger>删除</Button>
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
      console.log('提交责任分配数据:', values);
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
            <SettingOutlined />
            设备责任分配
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建分配
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索设备编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择车间" style={{ width: 150 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="选择班次" style={{ width: 120 }}>
              <Option value="day">白班</Option>
              <Option value="night">夜班</Option>
              <Option value="middle">中班</Option>
            </Select>
            <Select placeholder="选择状态" style={{ width: 120 }}>
              <Option value="active">生效</Option>
              <Option value="inactive">失效</Option>
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
          dataSource={responsibilityData}
          loading={loading}
          pagination={{
            total: responsibilityData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新建/编辑责任分配模态框 */}
      <Modal
        title="设备责任分配"
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
              name="equipmentCode"
              label="设备编号"
              rules={[{ required: true, message: '请选择设备' }]}
            >
              <Select placeholder="请选择设备" style={{ width: 200 }}>
                <Option value="EQ-001">EQ-001 - 注塑机A1</Option>
                <Option value="EQ-002">EQ-002 - 包装机B1</Option>
                <Option value="EQ-003">EQ-003 - 检测设备C1</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="shift"
              label="班次"
              rules={[{ required: true, message: '请选择班次' }]}
            >
              <Select placeholder="请选择班次" style={{ width: 150 }}>
                <Option value="白班">白班</Option>
                <Option value="夜班">夜班</Option>
                <Option value="中班">中班</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="primaryOperator"
            label="主操作员"
            rules={[{ required: true, message: '请选择主操作员' }]}
          >
            <Select placeholder="请选择主操作员">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="secondaryOperators"
            label="副操作员"
          >
            <Select mode="multiple" placeholder="请选择副操作员">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="maintenanceStaff"
              label="维修负责人"
              rules={[{ required: true, message: '请选择维修负责人' }]}
            >
              <Select placeholder="请选择维修负责人" style={{ width: 200 }}>
                <Option value="赵六">赵六</Option>
                <Option value="孙八">孙八</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="qualityInspector"
              label="质检负责人"
              rules={[{ required: true, message: '请选择质检负责人' }]}
            >
              <Select placeholder="请选择质检负责人" style={{ width: 200 }}>
                <Option value="钱七">钱七</Option>
                <Option value="周九">周九</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentResponsibility;