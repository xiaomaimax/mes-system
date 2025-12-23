import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Tag, Divider, Row, Col, Statistic, Progress } from 'antd';
import { SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InventoryCount = () => {
  const [countList, setCountList] = useState([
    {
      key: '1',
      countNo: 'IC20241218001',
      countName: '年度全面盘点',
      warehouse: '主仓库A',
      countType: 'full',
      planDate: '2024-12-20',
      status: 'planning',
      operator: '张三',
      totalItems: 456,
      countedItems: 0,
      differenceItems: 0,
      progress: 0
    },
    {
      key: '2',
      countNo: 'IC20241218002',
      countName: '备件专项盘点',
      warehouse: '维修仓库C',
      countType: 'category',
      planDate: '2024-12-19',
      status: 'counting',
      operator: '李四',
      totalItems: 128,
      countedItems: 85,
      differenceItems: 3,
      progress: 66
    },
    {
      key: '3',
      countNo: 'IC20241215001',
      countName: '原材料抽盘',
      warehouse: '主仓库A',
      countType: 'sample',
      planDate: '2024-12-15',
      status: 'completed',
      operator: '王五',
      totalItems: 50,
      countedItems: 50,
      differenceItems: 2,
      progress: 100
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCount, setEditingCount] = useState(null);
  const [form] = Form.useForm();

  const statusColors = {
    planning: 'blue',
    counting: 'orange',
    completed: 'green',
    cancelled: 'red'
  };

  const statusTexts = {
    planning: '计划中',
    counting: '盘点中',
    completed: '已完成',
    cancelled: '已取消'
  };

  const typeTexts = {
    full: '全面盘点',
    category: '分类盘点',
    sample: '抽样盘点',
    cycle: '循环盘点'
  };

  const columns = [
    {
      title: '盘点单号',
      dataIndex: 'countNo',
      key: 'countNo',
      width: 120,
    },
    {
      title: '盘点名称',
      dataIndex: 'countName',
      key: 'countName',
      width: 150,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
    },
    {
      title: '盘点类型',
      dataIndex: 'countType',
      key: 'countType',
      width: 100,
      render: (type) => typeTexts[type]
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
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
      title: '盘点进度',
      key: 'progress',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress 
            percent={record.progress} 
            size="small" 
            format={() => `${record.countedItems}/${record.totalItems}`}
          />
        </div>
      )
    },
    {
      title: '差异数',
      dataIndex: 'differenceItems',
      key: 'differenceItems',
      width: 80,
      render: (diff) => (
        <span style={{ color: diff > 0 ? '#ff4d4f' : '#52c41a' }}>
          {diff}
        </span>
      )
    },
    {
      title: '负责人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
            icon={<SearchOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          {record.status === 'planning' && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleStartCount(record.key)}
            >
              开始
            </Button>
          )}
          {record.status === 'counting' && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteCount(record.key)}
            >
              完成
            </Button>
          )}
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            disabled={record.status === 'counting'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingCount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCount(record);
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? new Date(record.planDate) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个盘点计划吗？',
      onOk: () => {
        setCountList(countList.filter(item => item.key !== key));
        message.success('删除成功');
      }
    });
  };

  const handleStartCount = (key) => {
    Modal.confirm({
      title: '开始盘点',
      content: '确定要开始执行这个盘点计划吗？',
      onOk: () => {
        setCountList(countList.map(item => 
          item.key === key ? { ...item, status: 'counting' } : item
        ));
        message.success('盘点已开始');
      }
    });
  };

  const handleCompleteCount = (key) => {
    Modal.confirm({
      title: '完成盘点',
      content: '确定要完成这次盘点吗？完成后将生成盘点报告。',
      onOk: () => {
        setCountList(countList.map(item => 
          item.key === key ? { 
            ...item, 
            status: 'completed',
            progress: 100,
            countedItems: item.totalItems
          } : item
        ));
        message.success('盘点完成');
      }
    });
  };

  const handleViewDetails = (record) => {
    Modal.info({
      title: '盘点详情',
      width: 600,
      content: (
        <div>
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>盘点单号：</strong>{record.countNo}</p>
              <p><strong>盘点名称：</strong>{record.countName}</p>
              <p><strong>盘点类型：</strong>{typeTexts[record.countType]}</p>
            </Col>
            <Col span={12}>
              <p><strong>仓库：</strong>{record.warehouse}</p>
              <p><strong>计划日期：</strong>{record.planDate}</p>
              <p><strong>负责人：</strong>{record.operator}</p>
            </Col>
          </Row>
          
          <Divider orientation="left">盘点进度</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="总物料数" value={record.totalItems} suffix="种" />
            </Col>
            <Col span={8}>
              <Statistic title="已盘点" value={record.countedItems} suffix="种" />
            </Col>
            <Col span={8}>
              <Statistic title="差异数" value={record.differenceItems} suffix="种" />
            </Col>
          </Row>
          <div style={{ marginTop: '16px' }}>
            <Progress percent={record.progress} />
          </div>
        </div>
      ),
    });
  };

  const handleSubmit = async (values) => {
    try {
      const countData = {
        ...values,
        planDate: values.planDate?.format('YYYY-MM-DD'),
        countNo: editingCount ? editingCount.countNo : `IC${Date.now()}`,
        operator: '当前用户',
        status: 'planning',
        totalItems: 0,
        countedItems: 0,
        differenceItems: 0,
        progress: 0
      };

      if (editingCount) {
        setCountList(countList.map(item => 
          item.key === editingCount.key ? { ...item, ...countData } : item
        ));
        message.success('盘点计划更新成功');
      } else {
        const newCount = {
          key: Date.now().toString(),
          ...countData
        };
        setCountList([...countList, newCount]);
        message.success('盘点计划创建成功');
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
          <h2 style={{ margin: 0 }}>库存盘点管理</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            定期盘点库存，确保账实一致，及时发现和处理差异
          </p>
        </div>
        <Space>
          <Button icon={<FileTextOutlined />}>
            盘点报告
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建盘点
          </Button>
        </Space>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="本月盘点"
              value={countList.filter(item => item.planDate?.startsWith('2024-12')).length}
              suffix="次"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="进行中"
              value={countList.filter(item => item.status === 'counting').length}
              suffix="次"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={countList.filter(item => item.status === 'completed').length}
              suffix="次"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="差异率"
              value={2.3}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 盘点列表 */}
      <Card title="盘点计划" size="small">
        <Table
          columns={columns}
          dataSource={countList}
          pagination={{
            total: countList.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1400 }}
          size="small"
        />
      </Card>

      {/* 新建/编辑盘点模态框 */}
      <Modal
        title={editingCount ? '编辑盘点计划' : '新建盘点计划'}
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
          <Form.Item
            name="countName"
            label="盘点名称"
            rules={[{ required: true, message: '请输入盘点名称' }]}
          >
            <Input placeholder="请输入盘点名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="盘点仓库"
                rules={[{ required: true, message: '请选择盘点仓库' }]}
              >
                <Select placeholder="请选择盘点仓库">
                  <Option value="主仓库A">主仓库A</Option>
                  <Option value="车间仓库B">车间仓库B</Option>
                  <Option value="维修仓库C">维修仓库C</Option>
                  <Option value="成品仓库D">成品仓库D</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="countType"
                label="盘点类型"
                rules={[{ required: true, message: '请选择盘点类型' }]}
              >
                <Select placeholder="请选择盘点类型">
                  <Option value="full">全面盘点</Option>
                  <Option value="category">分类盘点</Option>
                  <Option value="sample">抽样盘点</Option>
                  <Option value="cycle">循环盘点</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="planDate"
            label="计划日期"
            rules={[{ required: true, message: '请选择计划日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="盘点说明"
          >
            <TextArea
              rows={3}
              placeholder="请输入盘点说明"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCount ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryCount;