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
  message,
  Spin,
  Alert
} from 'antd';
import { PlusOutlined, PlayCircleOutlined, CheckCircleOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import DataService from '../services/DataService';
import { useDataService } from '../hooks/useDataService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProductionOrders = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 使用 DataService 获取生产订单数据
  const { data: ordersData, loading, error, refetch } = useDataService(
    () => DataService.getProductionPlans(),
    [],
    { useCache: true, cacheTTL: 2 * 60 * 1000 }
  );

  // 格式化订单数据用于表格显示
  const formatOrdersData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      orderNumber: item.planCode || `PO-${String(item.id).padStart(6, '0')}`,
      productCode: item.productCode || 'PROD-001',
      productName: item.productName || '未知产品',
      plannedQuantity: item.planQty || 0,
      producedQuantity: item.actualQty || 0,
      qualifiedQuantity: Math.max(0, (item.actualQty || 0) - 10), // 模拟合格数量
      defectiveQuantity: Math.min(10, item.actualQty || 0), // 模拟不良数量
      status: item.status === '进行中' ? 'in_progress' : 
              item.status === '已完成' ? 'completed' : 
              item.status === '等待中' ? 'pending' : 'pending',
      priority: item.priority === '高' ? 'high' : 
                item.priority === '中' ? 'normal' : 
                item.priority === '低' ? 'low' : 'normal',
      productionLineId: 1,
      plannedStartTime: item.startDate ? `${item.startDate} 08:00:00` : '2026-01-15 08:00:00',
      plannedEndTime: item.endDate ? `${item.endDate} 18:00:00` : '2026-01-15 18:00:00',
      actualStartTime: item.actualStartTime || null,
      workshop: item.workshop || '车间A',
      equipment: item.equipment || '设备A',
      createdBy: 'admin'
    }));
  };

  const orders = formatOrdersData(ordersData?.items || []);

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
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleStartProduction = async (id) => {
    try {
      // 这里应该调用实际的API来开始生产
      console.log('开始生产订单:', id);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      safeMessage.success('生产已开始');
      refetch(); // 刷新数据
    } catch (error) {
      console.error('开始生产失败:', error);
      safeMessage.error('开始生产失败: ' + (error.message || '未知错误'));
    }
  };

  const handleCompleteProduction = async (id) => {
    try {
      // 这里应该调用实际的API来完成生产
      console.log('完成生产订单:', id);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      safeMessage.success('生产已完成');
      refetch(); // 刷新数据
    } catch (error) {
      console.error('完成生产失败:', error);
      safeMessage.error('完成生产失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      form.setFieldsValue({
        orderNumber: record.orderNumber,
        productCode: record.productCode,
        productName: record.productName,
        plannedQuantity: record.plannedQuantity,
        priority: record.priority,
        productionLineId: record.productionLineId,
        plannedTime: [
          moment(record.plannedStartTime),
          moment(record.plannedEndTime)
        ]
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('编辑操作失败:', error);
      safeMessage.error('编辑操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除生产订单"${record.orderNumber}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await DataService.deleteProductionPlan(record.id);
          if (result.success) {
            safeMessage.success('删除成功');
            refetch(); // 刷新数据
          }
        } catch (error) {
          console.error('删除失败:', error);
          safeMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  const handleCreateOrder = () => {
    try {
      setEditingRecord(null);
      form.resetFields();
      setIsModalVisible(true);
    } catch (error) {
      console.error('创建订单操作失败:', error);
      safeMessage.error('创建订单操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const orderData = {
        planCode: values.orderNumber,
        productName: values.productName,
        productCode: values.productCode,
        planQty: values.plannedQuantity,
        priority: values.priority === 'high' ? '高' : 
                  values.priority === 'normal' ? '中' : '低',
        startDate: values.plannedTime[0].format('YYYY-MM-DD'),
        endDate: values.plannedTime[1].format('YYYY-MM-DD'),
        workshop: '车间A',
        equipment: '设备A',
        status: '等待中'
      };

      let result;
      if (editingRecord) {
        result = await DataService.updateProductionPlan(editingRecord.id, orderData);
      } else {
        result = await DataService.addProductionPlan(orderData);
      }

      if (result.success) {
        safeMessage.success(editingRecord ? '生产订单更新成功' : '生产订单创建成功');
        setIsModalVisible(false);
        form.resetFields();
        setEditingRecord(null);
        refetch(); // 刷新数据
      }
    } catch (error) {
      console.error('保存订单失败:', error);
      safeMessage.error('保存订单失败: ' + (error.message || '未知错误'));
    }
  };

  const handleModalCancel = () => {
    try {
      setIsModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      console.error('取消操作失败:', error);
      safeMessage.error('取消操作失败: ' + (error.message || '未知错误'));
    }
  };

  // 处理加载和错误状态
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <h1>生产订单管理</h1>
        </div>
        <Alert
          message="数据加载失败"
          description={error.message || '无法加载生产订单数据，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <h1>生产订单管理</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              try {
                refetch();
                safeMessage.success('数据刷新成功');
              } catch (error) {
                console.error('刷新失败:', error);
                safeMessage.error('刷新失败: ' + (error.message || '未知错误'));
              }
            }}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateOrder}
          >
            新建订单
          </Button>
        </Space>
      </div>

      <Spin spinning={loading} tip="加载中...">
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
          locale={{ emptyText: '暂无生产订单数据' }}
        />
      </Spin>

      <Modal
        title={editingRecord ? "编辑生产订单" : "新建生产订单"}
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