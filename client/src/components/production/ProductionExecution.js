import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Progress, Space, Select, Input } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;

const ProductionExecution = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 实时生产数据
  const realTimeData = {
    currentTask: 'PT-2024-001',
    productName: '产品A',
    targetQuantity: 1000,
    completedQuantity: 750,
    qualifiedQuantity: 740,
    defectiveQuantity: 10,
    efficiency: 87.5,
    status: 'running'
  };

  // 执行记录数据
  const executionData = [
    {
      key: '1',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '张三',
      startTime: '08:00:00',
      endTime: '12:00:00',
      quantity: 200,
      qualifiedQty: 198,
      defectiveQty: 2,
      efficiency: 99.0,
      status: 'completed'
    },
    {
      key: '2',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '李四',
      startTime: '13:00:00',
      endTime: '17:00:00',
      quantity: 180,
      qualifiedQty: 175,
      defectiveQty: 5,
      efficiency: 97.2,
      status: 'completed'
    },
    {
      key: '3',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '王五',
      startTime: '18:00:00',
      endTime: '-',
      quantity: 370,
      qualifiedQty: 367,
      defectiveQty: 3,
      efficiency: 99.2,
      status: 'in_progress'
    }
  ];

  const columns = [
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
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
    },
    {
      title: '生产数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQty',
      key: 'qualifiedQty',
      width: 100,
      render: (qty) => <span style={{ color: '#52c41a' }}>{qty} 件</span>
    },
    {
      title: '不良数量',
      dataIndex: 'defectiveQty',
      key: 'defectiveQty',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          in_progress: { color: 'blue', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          paused: { color: 'orange', text: '已暂停' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  const progress = Math.round((realTimeData.completedQuantity / realTimeData.targetQuantity) * 100);
  const qualityRate = Math.round((realTimeData.qualifiedQuantity / realTimeData.completedQuantity) * 100);

  return (
    <div>
      {/* 实时生产状态 */}
      <Card 
        title={
          <Space>
            <PlayCircleOutlined />
            实时生产执行
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlayCircleOutlined />}>开始生产</Button>
            <Button icon={<PauseCircleOutlined />}>暂停</Button>
            <Button danger icon={<StopOutlined />}>停止</Button>
            <Button icon={<ReloadOutlined />}>刷新</Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="当前任务"
                value={realTimeData.currentTask}
                valueStyle={{ fontSize: '16px' }}
              />
              <div style={{ marginTop: 8, color: '#666' }}>
                {realTimeData.productName}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="生产进度"
                value={progress}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress 
                percent={progress} 
                size="small" 
                style={{ marginTop: 8 }}
              />
              <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                {realTimeData.completedQuantity}/{realTimeData.targetQuantity} 件
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="合格率"
                value={qualityRate}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px' }}>
                <span style={{ color: '#52c41a' }}>合格: {realTimeData.qualifiedQuantity}</span>
                <span style={{ marginLeft: 16, color: '#ff4d4f' }}>不良: {realTimeData.defectiveQuantity}</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="生产效率"
                value={realTimeData.efficiency}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={realTimeData.status === 'running' ? 'green' : 'orange'}>
                  {realTimeData.status === 'running' ? '运行中' : '已停止'}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 执行记录 */}
      <Card 
        title="生产执行记录"
        extra={
          <Space>
            <Input
              placeholder="搜索任务编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择操作员" style={{ width: 120 }}>
              <Option value="zhang_san">张三</Option>
              <Option value="li_si">李四</Option>
              <Option value="wang_wu">王五</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={executionData}
          loading={loading}
          pagination={{
            total: executionData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default ProductionExecution;