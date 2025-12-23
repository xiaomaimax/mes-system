import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, SafetyOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const EquipmentMaintenance = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const maintenanceData = [
    {
      key: '1',
      maintenanceId: 'MT-2024-001',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      maintenanceType: 'preventive',
      planDate: '2024-01-15',
      actualDate: '2024-01-15',
      duration: 4,
      technician: '张三',
      maintenanceItems: ['更换润滑油', '清洁过滤器', '检查皮带'],
      cost: 350.00,
      status: 'completed',
      nextMaintenanceDate: '2024-04-15',
      remarks: '保养正常完成'
    },
    {
      key: '2',
      maintenanceId: 'MT-2024-002',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      maintenanceType: 'corrective',
      planDate: '2024-01-16',
      actualDate: null,
      duration: 6,
      technician: '李四',
      maintenanceItems: ['更换传感器', '调整参数'],
      cost: 800.00,
      status: 'scheduled',
      nextMaintenanceDate: '2024-07-16',
      remarks: '计划维修传感器故障'
    },
    {
      key: '3',
      maintenanceId: 'MT-2024-003',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      maintenanceType: 'preventive',
      planDate: '2024-01-18',
      actualDate: '2024-01-18',
      duration: 3,
      technician: '王五',
      maintenanceItems: ['校准精度', '清洁镜头'],
      cost: 200.00,
      status: 'in_progress',
      nextMaintenanceDate: '2024-04-18',
      remarks: '定期校准保养'
    }
  ];

  const columns = [
    {
      title: '保养编号',
      dataIndex: 'maintenanceId',
      key: 'maintenanceId',
      width: 120,
    },
    {
      title: '设备信息',
      key: 'equipment',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.equipmentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.equipmentCode}</div>
        </div>
      )
    },
    {
      title: '保养类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 100,
      render: (type) => {
        const typeMap = {
          preventive: { color: 'blue', text: '预防性' },
          corrective: { color: 'orange', text: '纠正性' },
          emergency: { color: 'red', text: '紧急' }
        };
        const { color, text } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '实际日期',
      dataIndex: 'actualDate',
      key: 'actualDate',
      width: 100,
      render: (date) => date || '-'
    },
    {
      title: '耗时(h)',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '技术员',
      dataIndex: 'technician',
      key: 'technician',
      width: 80,
    },
    {
      title: '保养项目',
      dataIndex: 'maintenanceItems',
      key: 'maintenanceItems',
      width: 200,
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => `¥${cost.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          scheduled: { color: 'blue', text: '已计划' },
          in_progress: { color: 'orange', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '下次保养',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      width: 100,
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
          <Button type="link" size="small">详情</Button>
          {record.status === 'scheduled' && (
            <Button type="link" size="small">开始</Button>
          )}
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
      console.log('提交保养数据:', values);
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
            <SafetyOutlined />
            设备保养管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<CalendarOutlined />}>保养计划</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建保养
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索设备编号/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="保养类型" style={{ width: 120 }}>
              <Option value="preventive">预防性</Option>
              <Option value="corrective">纠正性</Option>
              <Option value="emergency">紧急</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="scheduled">已计划</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={maintenanceData}
          loading={loading}
          pagination={{
            total: maintenanceData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新建/编辑保养模态框 */}
      <Modal
        title="设备保养记录"
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
              name="maintenanceType"
              label="保养类型"
              rules={[{ required: true, message: '请选择保养类型' }]}
            >
              <Select placeholder="请选择保养类型" style={{ width: 150 }}>
                <Option value="preventive">预防性</Option>
                <Option value="corrective">纠正性</Option>
                <Option value="emergency">紧急</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="planDate"
              label="计划日期"
              rules={[{ required: true, message: '请选择计划日期' }]}
            >
              <DatePicker style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="预计耗时(小时)"
              rules={[{ required: true, message: '请输入预计耗时' }]}
            >
              <InputNumber min={0} placeholder="预计耗时" style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="technician"
              label="技术员"
              rules={[{ required: true, message: '请选择技术员' }]}
            >
              <Select placeholder="请选择技术员" style={{ width: 150 }}>
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="maintenanceItems"
            label="保养项目"
            rules={[{ required: true, message: '请选择保养项目' }]}
          >
            <Select mode="multiple" placeholder="请选择保养项目">
              <Option value="更换润滑油">更换润滑油</Option>
              <Option value="清洁过滤器">清洁过滤器</Option>
              <Option value="检查皮带">检查皮带</Option>
              <Option value="更换传感器">更换传感器</Option>
              <Option value="调整参数">调整参数</Option>
              <Option value="校准精度">校准精度</Option>
              <Option value="清洁镜头">清洁镜头</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cost"
            label="预计费用"
          >
            <InputNumber 
              min={0} 
              precision={2} 
              placeholder="预计费用" 
              style={{ width: '100%' }}
              addonBefore="¥"
            />
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

export default EquipmentMaintenance;