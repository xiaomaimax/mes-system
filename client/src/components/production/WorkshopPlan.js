import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input } from 'antd';
import { PlusOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const WorkshopPlan = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const planData = [
    {
      key: '1',
      planId: 'WP-2024-001',
      workshopName: '车间A',
      productName: '产品A',
      planQuantity: 1000,
      planStartDate: '2024-01-15',
      planEndDate: '2024-01-20',
      status: 'pending',
      priority: 'high',
      progress: 0
    },
    {
      key: '2',
      planId: 'WP-2024-002',
      workshopName: '车间B',
      productName: '产品B',
      planQuantity: 800,
      planStartDate: '2024-01-16',
      planEndDate: '2024-01-22',
      status: 'in_progress',
      priority: 'normal',
      progress: 45
    },
    {
      key: '3',
      planId: 'WP-2024-003',
      workshopName: '车间A',
      productName: '产品C',
      planQuantity: 1200,
      planStartDate: '2024-01-18',
      planEndDate: '2024-01-25',
      status: 'completed',
      priority: 'low',
      progress: 100
    }
  ];

  const columns = [
    {
      title: '计划编号',
      dataIndex: 'planId',
      key: 'planId',
      width: 120,
    },
    {
      title: '车间名称',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 100,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '计划数量',
      dataIndex: 'planQuantity',
      key: 'planQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '计划开始',
      dataIndex: 'planStartDate',
      key: 'planStartDate',
      width: 120,
    },
    {
      title: '计划结束',
      dataIndex: 'planEndDate',
      key: 'planEndDate',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const colorMap = {
          high: 'red',
          normal: 'blue',
          low: 'green'
        };
        const textMap = {
          high: '高',
          normal: '中',
          low: '低'
        };
        return <Tag color={colorMap[priority]}>{textMap[priority]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待开始' },
          in_progress: { color: 'blue', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 80,
      render: (progress) => `${progress}%`
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">详情</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            车间计划管理
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建计划
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索计划编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择车间" style={{ width: 150 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="选择状态" style={{ width: 120 }}>
              <Option value="pending">待开始</Option>
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
          dataSource={planData}
          loading={loading}
          pagination={{
            total: planData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default WorkshopPlan;