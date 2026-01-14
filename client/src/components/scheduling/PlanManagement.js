import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, DatePicker, InputNumber, Spin, Alert
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [processRoutings, setProcessRoutings] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 使用 DataService 和 useDataService Hook 获取数据
  const { 
    data: plansResponse, 
    loading: plansLoading, 
    error: plansError, 
    refetch: refetchPlans 
  } = useDataService(
    () => DataService.getSchedulingPlans({ 
      page: pagination.current, 
      limit: pagination.pageSize 
    }),
    [pagination.current, pagination.pageSize],
    { cacheKey: `scheduling_plans_${pagination.current}_${pagination.pageSize}` }
  );

  const { 
    data: materialsResponse, 
    loading: materialsLoading, 
    refetch: refetchMaterials 
  } = useDataService(
    () => DataService.getMaterials({ limit: 1000 }),
    [],
    { cacheKey: 'materials_for_scheduling' }
  );

  const { 
    data: routingsResponse, 
    loading: routingsLoading, 
    refetch: refetchRoutings 
  } = useDataService(
    () => DataService.getProcessRouting({ limit: 1000 }),
    [],
    { cacheKey: 'process_routings_for_scheduling' }
  );

  const { 
    data: ordersResponse, 
    loading: ordersLoading, 
    refetch: refetchOrders 
  } = useDataService(
    () => DataService.getProductionOrders({ limit: 1000 }),
    [],
    { cacheKey: 'production_orders_for_scheduling' }
  );

  // 处理数据转换
  useEffect(() => {
    if (plansResponse && plansResponse.data) {
      setPlans(plansResponse.data);
      setPagination(prev => ({
        ...prev,
        total: plansResponse.pagination?.total || plansResponse.data.length
      }));
    }
  }, [plansResponse]);

  useEffect(() => {
    if (materialsResponse && Array.isArray(materialsResponse)) {
      setMaterials(materialsResponse);
    }
  }, [materialsResponse]);

  useEffect(() => {
    if (routingsResponse && routingsResponse.routings) {
      setProcessRoutings(routingsResponse.routings);
    }
  }, [routingsResponse]);

  useEffect(() => {
    if (ordersResponse && Array.isArray(ordersResponse)) {
      setProductionOrders(ordersResponse);
    }
  }, [ordersResponse]);

  // 刷新所有数据
  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchPlans(),
        refetchMaterials(),
        refetchRoutings(),
        refetchOrders()
      ]);
      safeMessage.success('数据刷新成功');
    } catch (error) {
      console.error('刷新数据失败:', error);
      safeMessage.error('刷新数据失败: ' + (error.message || '未知错误'));
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      plan_number: record.plan_number,
      material_id: record.material_id,
      planned_quantity: record.planned_quantity,
      due_date: moment(record.due_date),
      process_routing_id: record.process_routing_id,
      production_order_id: record.production_order_id,
      order_number: record.order_number,
      customer: record.customer
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/scheduling/plans/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        safeMessage.success('计划单删除成功');
        refetchPlans(); // 使用新的刷新方法
      } else {
        safeMessage.error(data.message);
      }
    } catch (error) {
      console.error('删除失败:', error);
      safeMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingId
        ? `/api/scheduling/plans/${editingId}`
        : '/api/scheduling/plans';

      const method = editingId ? 'PUT' : 'POST';

      // 从选中的工艺路线获取工艺路线编码
      const selectedRouting = processRoutings.find(r => r.id === values.process_routing_id);
      const routingCode = selectedRouting ? selectedRouting.routing_code : '';

      const payload = {
        plan_number: values.plan_number,
        material_id: values.material_id,
        planned_quantity: values.planned_quantity,
        due_date: values.due_date.toISOString(),
        process_routing_id: values.process_routing_id,
        process_route_number: routingCode,
        production_order_id: values.production_order_id,
        order_number: values.order_number,
        customer: values.customer
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        safeMessage.success(editingId ? '计划单更新成功' : '计划单创建成功');
        setIsModalVisible(false);
        refetchPlans(); // 使用新的刷新方法
      } else {
        safeMessage.error(data.message);
      }
    } catch (error) {
      console.error('操作失败:', error);
      safeMessage.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '计划单号',
      dataIndex: 'plan_number',
      key: 'plan_number',
      width: 100
    },
    {
      title: '物料编号',
      dataIndex: ['Material', 'material_code'],
      key: 'material_code',
      width: 90
    },
    {
      title: '物料名称',
      dataIndex: ['Material', 'material_name'],
      key: 'material_name',
      width: 120
    },
    {
      title: '计划数量',
      dataIndex: 'planned_quantity',
      key: 'planned_quantity',
      width: 80
    },
    {
      title: '交期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 140,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '工艺编码',
      dataIndex: 'process_route_number',
      key: 'process_route_number',
      width: 110
    },
    {
      title: '订单编号',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 100
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 90
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusMap = {
          unscheduled: { text: '未排产', color: '#faad14' },
          scheduled: { text: '已排产', color: '#52c41a' },
          cancelled: { text: '已取消', color: '#f5222d' }
        };
        const s = statusMap[status] || { text: status, color: '#000' };
        return <span style={{ color: s.color }}>{s.text}</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status !== 'unscheduled'}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理加载状态和错误状态
  const isLoading = plansLoading || materialsLoading || routingsLoading || ordersLoading;
  
  if (plansError) {
    return (
      <Card>
        <Alert
          message="数据加载失败"
          description={plansError.message || '获取计划单数据失败，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetchPlans}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title="计划单管理"
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshAll}
            loading={isLoading}
          >
            刷新数据
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增计划单
          </Button>
          <Button
            icon={<UploadOutlined />}
          >
            批量导入
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={plans}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize, total: pagination.total });
          }
        }}
        scroll={{ x: 2200 }}
        size="small"
        style={{ fontSize: '12px' }}
      />

      <Modal
        title={editingId ? '编辑计划单' : '新增计划单'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="计划单号"
            name="plan_number"
            rules={[{ required: true, message: '请输入计划单号' }]}
          >
            <Input placeholder="如: PLAN-001" disabled={!!editingId} />
          </Form.Item>

          <Form.Item
            label="物料"
            name="material_id"
            rules={[{ required: true, message: '请选择物料' }]}
          >
            <Select placeholder="选择物料">
              {materials.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  {m.material_code} - {m.material_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="计划数量"
            name="planned_quantity"
            rules={[{ required: true, message: '请输入计划数量' }]}
          >
            <InputNumber min={1} placeholder="单位: 个" />
          </Form.Item>

          <Form.Item
            label="交期"
            name="due_date"
            rules={[{ required: true, message: '请选择交期' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="工艺路线"
            name="process_routing_id"
            rules={[{ required: true, message: '请选择工艺路线' }]}
          >
            <Select 
              placeholder="选择工艺路线" 
              allowClear
              onChange={(value) => {
                // 当选择工艺路线时，自动填充工艺路线编码
                const selectedRouting = processRoutings.find(r => r.id === value);
                if (selectedRouting) {
                  form.setFieldsValue({
                    process_route_number: selectedRouting.routing_code
                  });
                } else {
                  form.setFieldsValue({
                    process_route_number: ''
                  });
                }
              }}
            >
              {processRoutings.map(pr => (
                <Select.Option key={pr.id} value={pr.id}>
                  {pr.routing_code} - {pr.process_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="生产订单"
            name="production_order_id"
          >
            <Select placeholder="选择生产订单（可选）" allowClear>
              {productionOrders.map(po => (
                <Select.Option key={po.id} value={po.id}>
                  {po.order_number} - {po.product_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="工艺编码"
            name="process_route_number"
          >
            <Input placeholder="自动从工艺路线填充" disabled />
          </Form.Item>

          <Form.Item
            label="订单编号"
            name="order_number"
          >
            <Input placeholder="如: ORD-001（自动填充或手动输入）" />
          </Form.Item>

          <Form.Item
            label="客户"
            name="customer"
          >
            <Input placeholder="如: 客户A（自动填充或手动输入）" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PlanManagement;
