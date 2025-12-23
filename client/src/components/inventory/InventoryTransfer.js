import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Tag, Divider, Row, Col, Statistic } from 'antd';
import { TransactionOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InventoryTransfer = () => {
  const [transferList, setTransferList] = useState([
    {
      key: '1',
      transferNo: 'TF20241218001',
      materialCode: 'M001',
      materialName: '轴承6205',
      fromWarehouse: '主仓库A',
      toWarehouse: '车间仓库B',
      quantity: 10,
      unit: '个',
      transferDate: '2024-12-18',
      operator: '张三',
      status: 'completed',
      reason: '生产需要'
    },
    {
      key: '2',
      transferNo: 'TF20241218002',
      materialCode: 'M002',
      materialName: '密封圈',
      fromWarehouse: '主仓库A',
      toWarehouse: '维修仓库C',
      quantity: 50,
      unit: '个',
      transferDate: '2024-12-18',
      operator: '李四',
      status: 'pending',
      reason: '设备维修'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [form] = Form.useForm();

  const statusColors = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  const statusTexts = {
    pending: '待执行',
    completed: '已完成',
    cancelled: '已取消'
  };

  const columns = [
    {
      title: '调拨单号',
      dataIndex: 'transferNo',
      key: 'transferNo',
      width: 120,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 100,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 120,
    },
    {
      title: '调出仓库',
      dataIndex: 'fromWarehouse',
      key: 'fromWarehouse',
      width: 120,
    },
    {
      title: '调入仓库',
      dataIndex: 'toWarehouse',
      key: 'toWarehouse',
      width: 120,
    },
    {
      title: '调拨数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity, record) => `${quantity} ${record.unit}`
    },
    {
      title: '调拨日期',
      dataIndex: 'transferDate',
      key: 'transferDate',
      width: 100,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      )
    },
    {
      title: '调拨原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'completed'}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            disabled={record.status === 'completed'}
          >
            删除
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.key)}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTransfer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTransfer(record);
    form.setFieldsValue({
      ...record,
      transferDate: record.transferDate ? new Date(record.transferDate) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条调拨记录吗？',
      onOk: () => {
        setTransferList(transferList.filter(item => item.key !== key));
        message.success('删除成功');
      }
    });
  };

  const handleComplete = (key) => {
    Modal.confirm({
      title: '确认完成',
      content: '确定要完成这次调拨吗？',
      onOk: () => {
        setTransferList(transferList.map(item => 
          item.key === key ? { ...item, status: 'completed' } : item
        ));
        message.success('调拨完成');
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      const transferData = {
        ...values,
        transferDate: values.transferDate?.format('YYYY-MM-DD'),
        transferNo: editingTransfer ? editingTransfer.transferNo : `TF${Date.now()}`,
        operator: '当前用户',
        status: 'pending'
      };

      if (editingTransfer) {
        setTransferList(transferList.map(item => 
          item.key === editingTransfer.key ? { ...item, ...transferData } : item
        ));
        message.success('调拨单更新成功');
      } else {
        const newTransfer = {
          key: Date.now().toString(),
          ...transferData
        };
        setTransferList([...transferList, newTransfer]);
        message.success('调拨单创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0 }}>库存调拨管理</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            管理库间调拨、库位调整等库存转移操作
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建调拨
        </Button>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="今日调拨"
              value={transferList.filter(item => item.transferDate === '2024-12-18').length}
              suffix="笔"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="待执行"
              value={transferList.filter(item => item.status === 'pending').length}
              suffix="笔"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={transferList.filter(item => item.status === 'completed').length}
              suffix="笔"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="调拨总量"
              value={transferList.reduce((sum, item) => sum + item.quantity, 0)}
              suffix="件"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 调拨列表 */}
      <Card title="调拨记录" size="small">
        <Table
          columns={columns}
          dataSource={transferList}
          pagination={{
            total: transferList.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* 新建/编辑调拨模态框 */}
      <Modal
        title={editingTransfer ? '编辑调拨' : '新建调拨'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="materialCode"
                label="物料编码"
                rules={[{ required: true, message: '请输入物料编码' }]}
              >
                <Input placeholder="请输入物料编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="materialName"
                label="物料名称"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input placeholder="请输入物料名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fromWarehouse"
                label="调出仓库"
                rules={[{ required: true, message: '请选择调出仓库' }]}
              >
                <Select placeholder="请选择调出仓库">
                  <Option value="主仓库A">主仓库A</Option>
                  <Option value="车间仓库B">车间仓库B</Option>
                  <Option value="维修仓库C">维修仓库C</Option>
                  <Option value="成品仓库D">成品仓库D</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="toWarehouse"
                label="调入仓库"
                rules={[{ required: true, message: '请选择调入仓库' }]}
              >
                <Select placeholder="请选择调入仓库">
                  <Option value="主仓库A">主仓库A</Option>
                  <Option value="车间仓库B">车间仓库B</Option>
                  <Option value="维修仓库C">维修仓库C</Option>
                  <Option value="成品仓库D">成品仓库D</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="调拨数量"
                rules={[{ required: true, message: '请输入调拨数量' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="请输入数量"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select placeholder="请选择单位">
                  <Option value="个">个</Option>
                  <Option value="件">件</Option>
                  <Option value="kg">kg</Option>
                  <Option value="m">m</Option>
                  <Option value="套">套</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="transferDate"
                label="调拨日期"
                rules={[{ required: true, message: '请选择调拨日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="调拨原因"
            rules={[{ required: true, message: '请输入调拨原因' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入调拨原因"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTransfer ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryTransfer;