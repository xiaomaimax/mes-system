import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Progress, Select, Input, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, ProjectOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const ProductionTasks = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const taskData = [
    {
      key: '1',
      taskId: 'PT-2024-001',
      taskName: '产品A生产任务',
      orderNumber: 'PO-2024-001',
      productCode: 'PROD-A001',
      productName: '产品A',
      planQuantity: 1000,
      completedQuantity: 750,
      qualifiedQuantity: 740,
      defectiveQuantity: 10,
      workshopName: '车间A',
      productionLine: '生产线1',
      assignedWorker: '张三',
      startTime: '2024-01-15 08:00',
      endTime: '2024-01-15 18:00',
      status: 'in_progress',
      priority: 'high'
    },
    {
      key: '2',
      taskId: 'PT-2024-002',
      taskName: '产品B生产任务',
      orderNumber: 'PO-2024-002',
      productCode: 'PROD-B001',
      productName: '产品B',
      planQuantity: 500,
      completedQuantity: 0,
      qualifiedQuantity: 0,
      defectiveQuantity: 0,
      workshopName: '车间B',
      productionLine: '生产线2',
      assignedWorker: '李四',
      startTime: '2024-01-16 08:00',
      endTime: '2024-01-16 16:00',
      status: 'pending',
      priority: 'normal'
    }
  ];

  const columns = [
    {
      title: '任务编号',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150,
    },
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: '产品信息',
      key: 'product',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
        </div>
      )
    },
    {
      title: '生产进度',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const progress = Math.round((record.completedQuantity / record.planQuantity) * 100);
        return (
          <div>
            <Progress percent={progress} size="small" />
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {record.completedQuantity}/{record.planQuantity}
            </div>
          </div>
        );
      }
    },
    {
      title: '质量统计',
      key: 'quality',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ color: '#52c41a' }}>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: '#ff4d4f' }}>不良: {record.defectiveQuantity}</div>
        </div>
      )
    },
    {
      title: '车间/产线',
      key: 'workshop',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.workshopName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '负责人',
      dataIndex: 'assignedWorker',
      key: 'assignedWorker',
      width: 80,
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
          paused: { color: 'yellow', text: '已暂停' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}>
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button type="link" size="small" icon={<PauseCircleOutlined />}>
              暂停
            </Button>
          )}
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <ProjectOutlined />
            生产任务管理
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建任务
          </Button>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索任务编号"
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
              <Option value="paused">已暂停</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <Select placeholder="优先级" style={{ width: 100 }}>
              <Option value="high">高</Option>
              <Option value="normal">中</Option>
              <Option value="low">低</Option>
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
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default ProductionTasks;