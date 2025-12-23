import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, TimePicker } from 'antd';
import { PlusOutlined, SearchOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ShiftSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const scheduleData = [
    {
      key: '1',
      scheduleId: 'SS-2024-001',
      workshopName: '车间A',
      productionLine: '生产线1',
      shiftDate: '2024-01-15',
      shiftType: '白班',
      startTime: '08:00',
      endTime: '16:00',
      teamLeader: '张三',
      operators: ['李四', '王五', '赵六'],
      maintenanceStaff: '孙八',
      qualityInspector: '钱七',
      plannedTasks: ['PT-2024-001', 'PT-2024-002'],
      status: 'scheduled',
      remarks: '正常排班'
    },
    {
      key: '2',
      scheduleId: 'SS-2024-002',
      workshopName: '车间A',
      productionLine: '生产线1',
      shiftDate: '2024-01-15',
      shiftType: '夜班',
      startTime: '20:00',
      endTime: '04:00',
      teamLeader: '李四',
      operators: ['王五', '赵六'],
      maintenanceStaff: '孙八',
      qualityInspector: '周九',
      plannedTasks: ['PT-2024-003'],
      status: 'in_progress',
      remarks: '夜班生产'
    }
  ];

  const columns = [
    {
      title: '排班编号',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: 120,
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
      title: '日期',
      dataIndex: 'shiftDate',
      key: 'shiftDate',
      width: 100,
    },
    {
      title: '班次',
      dataIndex: 'shiftType',
      key: 'shiftType',
      width: 80,
      render: (shiftType) => (
        <Tag color={shiftType === '白班' ? 'blue' : shiftType === '夜班' ? 'purple' : 'orange'}>
          {shiftType}
        </Tag>
      )
    },
    {
      title: '时间段',
      key: 'timeRange',
      width: 120,
      render: (_, record) => `${record.startTime}-${record.endTime}`
    },
    {
      title: '班长',
      dataIndex: 'teamLeader',
      key: 'teamLeader',
      width: 80,
    },
    {
      title: '操作员',
      dataIndex: 'operators',
      key: 'operators',
      width: 200,
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
      title: '维修员',
      dataIndex: 'maintenanceStaff',
      key: 'maintenanceStaff',
      width: 80,
    },
    {
      title: '质检员',
      dataIndex: 'qualityInspector',
      key: 'qualityInspector',
      width: 80,
    },
    {
      title: '计划任务',
      dataIndex: 'plannedTasks',
      key: 'plannedTasks',
      width: 200,
      render: (tasks) => (
        <div>
          {tasks.map((task, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 2 }}>
              {task}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          scheduled: { color: 'blue', text: '已排班' },
          in_progress: { color: 'green', text: '进行中' },
          completed: { color: 'gray', text: '已完成' },
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
      width: 150,
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
            <Button type="link" size="small" danger>取消</Button>
          )}
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      shiftDate: moment(record.shiftDate),
      timeRange: [moment(record.startTime, 'HH:mm'), moment(record.endTime, 'HH:mm')]
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交排班数据:', values);
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
            <ClockCircleOutlined />
            排班记录管理
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建排班
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索排班编号"
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
          dataSource={scheduleData}
          loading={loading}
          pagination={{
            total: scheduleData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新建/编辑排班模态框 */}
      <Modal
        title="排班记录"
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
              name="workshopName"
              label="车间"
              rules={[{ required: true, message: '请选择车间' }]}
            >
              <Select placeholder="请选择车间" style={{ width: 150 }}>
                <Option value="车间A">车间A</Option>
                <Option value="车间B">车间B</Option>
                <Option value="车间C">车间C</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="productionLine"
              label="生产线"
              rules={[{ required: true, message: '请选择生产线' }]}
            >
              <Select placeholder="请选择生产线" style={{ width: 150 }}>
                <Option value="生产线1">生产线1</Option>
                <Option value="生产线2">生产线2</Option>
                <Option value="生产线3">生产线3</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="shiftDate"
              label="排班日期"
              rules={[{ required: true, message: '请选择排班日期' }]}
            >
              <DatePicker style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="shiftType"
              label="班次"
              rules={[{ required: true, message: '请选择班次' }]}
            >
              <Select placeholder="请选择班次" style={{ width: 120 }}>
                <Option value="白班">白班</Option>
                <Option value="夜班">夜班</Option>
                <Option value="中班">中班</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="timeRange"
              label="时间段"
              rules={[{ required: true, message: '请选择时间段' }]}
            >
              <TimePicker.RangePicker 
                format="HH:mm" 
                style={{ width: 200 }}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="teamLeader"
            label="班长"
            rules={[{ required: true, message: '请选择班长' }]}
          >
            <Select placeholder="请选择班长">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="operators"
            label="操作员"
            rules={[{ required: true, message: '请选择操作员' }]}
          >
            <Select mode="multiple" placeholder="请选择操作员">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
              <Option value="赵六">赵六</Option>
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="maintenanceStaff"
              label="维修员"
            >
              <Select placeholder="请选择维修员" style={{ width: 200 }}>
                <Option value="孙八">孙八</Option>
                <Option value="周九">周九</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="qualityInspector"
              label="质检员"
            >
              <Select placeholder="请选择质检员" style={{ width: 200 }}>
                <Option value="钱七">钱七</Option>
                <Option value="周九">周九</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="plannedTasks"
            label="计划任务"
          >
            <Select mode="multiple" placeholder="请选择计划任务">
              <Option value="PT-2024-001">PT-2024-001</Option>
              <Option value="PT-2024-002">PT-2024-002</Option>
              <Option value="PT-2024-003">PT-2024-003</Option>
            </Select>
          </Form.Item>

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

export default ShiftSchedule;