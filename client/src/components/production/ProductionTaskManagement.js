import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Upload, 
  message,
  Tag,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined,
  ProjectOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const ProductionTaskManagement = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // 模拟数据
  const taskData = [
    {
      key: '1',
      taskNumber: 'PT-2024-001',
      materialNumber: 'MAT-001',
      taskQuantity: 500,
      cleanNumber: 'CLN-001',
      processRouteNumber: 'PR-001',
      workshop: '车间A',
      orderNumber: 'ORD-001',
      customer: '客户A',
      taskType: '生产任务',
      priority: '高',
      processRoute: '工艺路线A',
      planDate: '2024-01-20',
      issueTime: '2024-01-15 10:00',
      status: 'pending',
      remarks: '紧急生产任务，优先安排'
    },
    {
      key: '2',
      taskNumber: 'PT-2024-002',
      materialNumber: 'MAT-002',
      taskQuantity: 300,
      cleanNumber: 'CLN-002',
      processRouteNumber: 'PR-002',
      workshop: '车间B',
      orderNumber: 'ORD-002',
      customer: '客户B',
      taskType: '生产任务',
      priority: '中',
      processRoute: '工艺路线B',
      planDate: '2024-01-25',
      issueTime: '2024-01-18 14:30',
      status: 'in_progress',
      remarks: '常规生产任务'
    }
  ];

  const columns = [
    {
      title: '任务单号',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120,
      fixed: 'left'
    },
    {
      title: '物料编号',
      dataIndex: 'materialNumber',
      key: 'materialNumber',
      width: 120,
    },
    {
      title: '任务数量',
      dataIndex: 'taskQuantity',
      key: 'taskQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '清单编号',
      dataIndex: 'cleanNumber',
      key: 'cleanNumber',
      width: 120,
    },
    {
      title: '工艺路线号',
      dataIndex: 'processRouteNumber',
      key: 'processRouteNumber',
      width: 120,
    },
    {
      title: '工序',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 100,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const colorMap = {
          '高': 'red',
          '中': 'orange',
          '低': 'green'
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      }
    },
    {
      title: '计划交期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '发货时间',
      dataIndex: 'issueTime',
      key: 'issueTime',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待执行' },
          in_progress: { color: 'blue', text: '执行中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
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
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
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
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : null,
      issueTime: record.issueTime ? dayjs(record.issueTime) : null,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // 处理日期格式
      const submitData = {
        ...values,
        planDate: values.planDate ? values.planDate.format('YYYY-MM-DD') : null,
        issueTime: values.issueTime ? values.issueTime.format('YYYY-MM-DD HH:mm') : null,
        attachments: fileList.map(file => file.name)
      };
      
      console.log('提交生产任务数据:', submitData);
      message.success('生产任务保存成功！');
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false, // 阻止自动上传
    multiple: true,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <ProjectOutlined />
            生产任务管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              新增任务
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索任务单号/物料编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="任务类型" style={{ width: 120 }}>
              <Option value="production">生产任务</Option>
              <Option value="maintenance">维护任务</Option>
              <Option value="test">测试任务</Option>
            </Select>
            <Select placeholder="优先级" style={{ width: 100 }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="pending">待执行</Option>
              <Option value="in_progress">执行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
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
          dataSource={taskData}
          loading={loading}
          pagination={{
            total: taskData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* 新增/编辑生产任务模态框 */}
      <Modal
        title="生产任务新增"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* 基本信息 */}
          <Title level={5} style={{ color: '#666', marginBottom: '16px' }}>基本信息</Title>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 左列 */}
            <div>
              <Form.Item
                name="taskNumber"
                label={<span><span style={{ color: 'red' }}>*</span> 任务单号</span>}
                rules={[{ required: true, message: '请输入任务单号' }]}
              >
                <Input 
                  placeholder="请输入" 
                  suffix={
                    <span style={{ color: '#999', fontSize: '12px' }}>0/50</span>
                  }
                  addonAfter={
                    <Button type="link" size="small" style={{ padding: 0 }}>
                      自动生成
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item
                name="materialNumber"
                label={<span><span style={{ color: 'red' }}>*</span> 物料编号</span>}
                rules={[{ required: true, message: '请输入物料编号' }]}
              >
                <Input 
                  placeholder="请输入" 
                  suffix={
                    <Button type="link" size="small" style={{ padding: 0 }}>
                      选择
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item
                name="taskQuantity"
                label={<span><span style={{ color: 'red' }}>*</span> 任务数量</span>}
                rules={[{ required: true, message: '请输入任务数量' }]}
              >
                <Input 
                  placeholder="请输入" 
                  suffix={
                    <span style={{ color: '#999', fontSize: '12px' }}>0/10</span>
                  }
                />
              </Form.Item>

              <Form.Item
                name="cleanNumber"
                label={<span><span style={{ color: 'red' }}>*</span> 清单编号</span>}
                rules={[{ required: true, message: '请选择清单编号' }]}
              >
                <Select placeholder="系统自动关联">
                  <Option value="CLN-001">CLN-001</Option>
                  <Option value="CLN-002">CLN-002</Option>
                  <Option value="CLN-003">CLN-003</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="processRouteNumber"
                label={<span><span style={{ color: 'red' }}>*</span> 工艺路线编号</span>}
                rules={[{ required: true, message: '请选择工艺路线编号' }]}
              >
                <Select placeholder="请选择">
                  <Option value="PR-001">PR-001</Option>
                  <Option value="PR-002">PR-002</Option>
                  <Option value="PR-003">PR-003</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="workshop"
                label={<span><span style={{ color: 'red' }}>*</span> 工序</span>}
                rules={[{ required: true, message: '请输入工序' }]}
              >
                <Input placeholder="请输入工序" />
              </Form.Item>

              <Form.Item
                name="orderNumber"
                label="订单编号"
              >
                <Input 
                  placeholder="请输入" 
                  suffix={
                    <span style={{ color: '#999', fontSize: '12px' }}>0/50</span>
                  }
                />
              </Form.Item>

              <Form.Item
                name="customer"
                label="客户"
              >
                <Select placeholder="请选择">
                  <Option value="客户A">客户A</Option>
                  <Option value="客户B">客户B</Option>
                  <Option value="客户C">客户C</Option>
                </Select>
              </Form.Item>
            </div>

            {/* 右列 */}
            <div>
              <Form.Item
                name="taskType"
                label={<span><span style={{ color: 'red' }}>*</span> 任务类型</span>}
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="生产任务">生产任务</Option>
                  <Option value="维护任务">维护任务</Option>
                  <Option value="测试任务">测试任务</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="materialDescription"
                label="物料描述"
              >
                <Input placeholder="物料描述" disabled />
              </Form.Item>

              <Form.Item
                name="priority"
                label={<span><span style={{ color: 'red' }}>*</span> 优先级</span>}
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="低">
                  <Option value="高">高</Option>
                  <Option value="中">中</Option>
                  <Option value="低">低</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="workshopName"
                label="车间"
              >
                <Input placeholder="车间" />
              </Form.Item>

              <Form.Item
                name="processRoute"
                label="工艺路线"
              >
                <Input placeholder="工艺路线" />
              </Form.Item>

              <Form.Item
                name="planDate"
                label={<span><span style={{ color: 'red' }}>*</span> 计划交期</span>}
                rules={[{ required: true, message: '请选择计划交期' }]}
              >
                <DatePicker 
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>

              <Form.Item
                name="issueTime"
                label="发货时间"
              >
                <DatePicker 
                  showTime
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              <Form.Item
                name="remarks"
                label="备注"
              >
                <TextArea 
                  rows={2} 
                  placeholder="请输入备注信息" 
                  maxLength={50}
                  showCount
                />
              </Form.Item>
            </div>
          </div>

          <Divider orientation="left">附件上传</Divider>
          
          <Form.Item
            name="attachments"
            label="文件名称"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                暂无数据
              </Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductionTaskManagement;