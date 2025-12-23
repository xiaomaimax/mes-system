import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  message 
} from 'antd';
import { PlusOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProductionOrders = () => {
  const [orders, setOrders] = useState([
    {
      key: '1',
      id: 1,
      orderNumber: 'PO-2024-001',
      productCode: 'PROD-A001',
      productName: '产品A',
      plannedQuantity: 1000,
      producedQuantity: 750,
      qualifiedQuantity: 740,
      defectiveQuantity: 10,
      status: 'in_progress',
      priority: 'high',
      productionLineId: 1,
      plannedStartTime: '2024-01-15 08:00:00',
      plannedEndTime: '2024-01-15 18:00:00',
      actualStartTime: '2024-01-15 08:15:00',
      createdBy: 'admin'
    },
    {
      key: '2',
      id: 2,
      orderNumber: 'PO-2024-002',
      productCode: 'PROD-B001',
      productName: '产品B',
      plannedQuantity: 500,
      producedQuantity: 0,
      qualifiedQuantity: 0,
      defectiveQuantity: 0,
      status: 'pending',
      priority: 'normal',
      productionLineId: 2,
      plannedStartTime: '2024-01-16 08:00:00',
      plannedEndTime: '2024-01-16 16:00:00',
      createdBy: 'manager'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const statusColors = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  };

  const statusLabels = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };

  const priorityColors = {
    low: 'default',
    normal: 'blue',
    high: 'orange',
    urgent: 'red'
  };

  const priorityLabels = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: '产品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productCode}
          </div>
        </div>
      )
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
    },
    {
      title: '生产进度',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <div>已生产: {record.producedQuantity}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            合格: {record.qualifiedQuantity} | 不良: {record.defectiveQuantity}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag color={priorityColors[priority]}>
          {priorityLabels[priority]}
        </Tag>
      )
    },
    {
      title: '计划时间',
      key: 'plannedTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{moment(record.plannedStartTime).format('MM-DD HH:mm')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            至 {moment(record.plannedEndTime).format('MM-DD HH:mm')}
          </div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartProduction(record.id)}
            >
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteProduction(record.id)}
            >
              完成
            </Button>
          )}
          <Button size="small">编辑</Button>
          <Button size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const handleStartProduction = (id) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { 
            ...order, 
            status: 'in_progress',
            actualStartTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }
        : order
    ));
    message.success('生产已开始');
  };

  const handleCompleteProduction = (id) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { 
            ...order, 
            status: 'completed',
            actualEndTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }
        : order
    ));
    message.success('生产已完成');
  };

  const handleCreateOrder = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newOrder = {
        key: String(orders.length + 1),
        id: orders.length + 1,
        orderNumber: values.orderNumber,
        productCode: values.productCode,
        productName: values.productName,
        plannedQuantity: values.plannedQuantity,
        producedQuantity: 0,
        qualifiedQuantity: 0,
        defectiveQuantity: 0,
        status: 'pending',
        priority: values.priority,
        productionLineId: values.productionLineId,
        plannedStartTime: values.plannedTime[0].format('YYYY-MM-DD HH:mm:ss'),
        plannedEndTime: values.plannedTime[1].format('YYYY-MM-DD HH:mm:ss'),
        createdBy: 'current_user'
      };
      
      setOrders([...orders, newOrder]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('生产订单创建成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <h1>生产订单管理</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateOrder}
        >
          新建订单
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="新建生产订单"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'normal',
            productionLineId: 1
          }}
        >
          <Form.Item
            name="orderNumber"
            label="订单号"
            rules={[{ required: true, message: '请输入订单号' }]}
          >
            <Input placeholder="请输入订单号" />
          </Form.Item>

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

          <Form.Item
            name="plannedQuantity"
            label="计划数量"
            rules={[{ required: true, message: '请输入计划数量' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="请输入计划数量"
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="normal">普通</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="productionLineId"
            label="生产线"
            rules={[{ required: true, message: '请选择生产线' }]}
          >
            <Select>
              <Option value={1}>生产线1</Option>
              <Option value={2}>生产线2</Option>
              <Option value={3}>生产线3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="plannedTime"
            label="计划时间"
            rules={[{ required: true, message: '请选择计划时间' }]}
          >
            <RangePicker
              showTime
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductionOrders;