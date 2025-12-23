import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, TimePicker } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const WorkReport = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const reportData = [
    {
      key: '1',
      reportId: 'WR-2024-001',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '张三',
      workDate: '2024-01-15',
      startTime: '08:00',
      endTime: '12:00',
      workHours: 4,
      planQuantity: 200,
      actualQuantity: 198,
      qualifiedQuantity: 196,
      defectiveQuantity: 2,
      efficiency: 99.0,
      qualityRate: 99.0,
      remarks: '正常生产',
      status: 'approved'
    },
    {
      key: '2',
      reportId: 'WR-2024-002',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '李四',
      workDate: '2024-01-15',
      startTime: '13:00',
      endTime: '17:00',
      workHours: 4,
      planQuantity: 200,
      actualQuantity: 180,
      qualifiedQuantity: 175,
      defectiveQuantity: 5,
      efficiency: 90.0,
      qualityRate: 97.2,
      remarks: '设备故障影响30分钟',
      status: 'pending'
    }
  ];

  const columns = [
    {
      title: '报工编号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
    },
    {
      title: '任务编号',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '工作日期',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 100,
    },
    {
      title: '工作时间',
      key: 'workTime',
      width: 120,
      render: (_, record) => `${record.startTime}-${record.endTime}`
    },
    {
      title: '工时(h)',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 80,
    },
    {
      title: '计划数量',
      dataIndex: 'planQuantity',
      key: 'planQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 100,
      render: (qty) => <span style={{ color: '#52c41a' }}>{qty} 件</span>
    },
    {
      title: '不良数量',
      dataIndex: 'defectiveQuantity',
      key: 'defectiveQuantity',
      width: 100,
      render: (qty) => <span style={{ color: '#ff4d4f' }}>{qty} 件</span>
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency) => `${efficiency}%`
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 80,
      render: (rate) => `${rate}%`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已审核' },
          rejected: { color: 'red', text: '已驳回' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
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
          {record.status === 'pending' && (
            <Button type="link" size="small" danger>删除</Button>
          )}
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      workTime: [moment(record.startTime, 'HH:mm'), moment(record.endTime, 'HH:mm')],
      workDate: moment(record.workDate)
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交报工数据:', values);
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
            <FileTextOutlined />
            报工记录管理
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建报工
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索报工编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择操作员" style={{ width: 120 }}>
              <Option value="zhang_san">张三</Option>
              <Option value="li_si">李四</Option>
              <Option value="wang_wu">王五</Option>
            </Select>
            <Select placeholder="选择状态" style={{ width: 120 }}>
              <Option value="pending">待审核</Option>
              <Option value="approved">已审核</Option>
              <Option value="rejected">已驳回</Option>
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
          dataSource={reportData}
          loading={loading}
          pagination={{
            total: reportData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新建/编辑报工模态框 */}
      <Modal
        title="报工记录"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="taskId"
            label="任务编号"
            rules={[{ required: true, message: '请输入任务编号' }]}
          >
            <Input placeholder="请输入任务编号" />
          </Form.Item>

          <Form.Item
            name="workDate"
            label="工作日期"
            rules={[{ required: true, message: '请选择工作日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="workTime"
            label="工作时间"
            rules={[{ required: true, message: '请选择工作时间' }]}
          >
            <TimePicker.RangePicker 
              format="HH:mm" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="planQuantity"
              label="计划数量"
              rules={[{ required: true, message: '请输入计划数量' }]}
            >
              <InputNumber min={0} placeholder="计划数量" />
            </Form.Item>

            <Form.Item
              name="actualQuantity"
              label="实际数量"
              rules={[{ required: true, message: '请输入实际数量' }]}
            >
              <InputNumber min={0} placeholder="实际数量" />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="qualifiedQuantity"
              label="合格数量"
              rules={[{ required: true, message: '请输入合格数量' }]}
            >
              <InputNumber min={0} placeholder="合格数量" />
            </Form.Item>

            <Form.Item
              name="defectiveQuantity"
              label="不良数量"
              rules={[{ required: true, message: '请输入不良数量' }]}
            >
              <InputNumber min={0} placeholder="不良数量" />
            </Form.Item>
          </Space>

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

export default WorkReport;