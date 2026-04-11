import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table, Tag, Button, Space, Modal, Form, Select, Input, message, Alert, Statistic, Badge, Tabs, Timeline } from 'antd';
import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, SoundOutlined } from '@ant-design/icons';
import socket from 'socket.io-client';
import moment from 'moment';
import './AndonDashboard.css';

const { TextArea } = Input;
const { TabPane } = Tabs;

const AndonDashboard = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [activeCalls, setActiveCalls] = useState([]);
  const [allCalls, setAllCalls] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [productionLines, setProductionLines] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [form] = Form.useForm();
  const socketRef = useRef(null);

  // 呼叫类型映射
  const callTypeMap = {
    equipment: { label: '设备故障', color: 'red' },
    quality: { label: '质量异常', color: 'orange' },
    material: { label: '物料短缺', color: 'blue' },
    safety: { label: '安全问题', color: 'purple' },
    other: { label: '其他', color: 'default' }
  };

  // 优先级映射
  const priorityMap = {
    normal: { label: '一般', color: 'green', icon: '⚪' },
    urgent: { label: '紧急', color: 'orange', icon: '🟠' },
    critical: { label: '停线', color: 'red', icon: '🔴' }
  };

  // 状态映射
  const statusMap = {
    pending: { label: '待确认', color: 'red', icon: <AlertOutlined /> },
    acknowledged: { label: '已确认', color: 'orange', icon: <ClockCircleOutlined /> },
    in_progress: { label: '处理中', color: 'processing', icon: <ExclamationCircleOutlined /> },
    resolved: { label: '已解决', color: 'green', icon: <CheckCircleOutlined /> }
  };

  // 连接 Socket.IO
  useEffect(() => {
    const socket = socket.io('http://192.168.100.6:5001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join_andon');
    });

    socket.on('andon:new', (call) => {
      setActiveCalls(prev => [call, ...prev]);
      message.info(`新呼叫: ${callTypeMap[call.call_type]?.label} - ${call.station || '未知工位'}`);
    });

    socket.on('andon:update', (call) => {
      setActiveCalls(prev => prev.map(c => c.id === call.id ? call : c));
    });

    socket.on('andon:resolved', (call) => {
      setActiveCalls(prev => prev.filter(c => c.id !== call.id));
      message.success(`呼叫已解决: ${call.call_code}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 加载数据
  const loadData = async () => {
    try {
      const [activeRes, statsRes, linesRes] = await Promise.all([
        axios.get('/andon/active'),
        axios.get('/andon/statistics'),
        axios.get('/andon/lines')
      ]);

      if (activeRes.data.success) {
        setActiveCalls(activeRes.data.data);
      }
      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }
      if (linesRes.data.success) {
        setProductionLines(linesRes.data.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 加载所有呼叫记录
  const loadAllCalls = async () => {
    try {
      const res = await axios.get('/andon/calls', { params: { limit: 50 } });
      if (res.data.success) {
        setAllCalls(res.data.items);
      }
    } catch (error) {
      console.error('加载呼叫记录失败:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadAllCalls();
    }
  }, [activeTab]);

  // 创建呼叫
  const handleCreateCall = async (values) => {
    try {
      const res = await axios.post('/andon/calls', values);
      if (res.data.success) {
        message.success('呼叫已发送');
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error('发送呼叫失败');
    }
  };

  // 确认呼叫
  const handleAcknowledge = async (callId) => {
    try {
      await axios.put(`/andon/calls/${callId}/acknowledge`);
      message.success('已确认呼叫');
    } catch (error) {
      message.error('确认失败');
    }
  };

  // 开始处理
  const handleStartProcess = async (callId) => {
    try {
      await axios.put(`/andon/calls/${callId}/start`);
      message.success('开始处理');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 解决呼叫
  const handleResolve = async (callId) => {
    try {
      await axios.put(`/andon/calls/${callId}/resolve`);
      message.success('已解决呼叫');
    } catch (error) {
      message.error('解决失败');
    }
  };

  // 格式化时间
  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  // 表格列
  const columns = [
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Badge status={statusMap[record.status]?.color} text={statusMap[record.status]?.label} />
      )
    },
    {
      title: '类型',
      dataIndex: 'call_type',
      key: 'call_type',
      width: 100,
      render: (type) => (
        <Tag color={callTypeMap[type]?.color}>{callTypeMap[type]?.label}</Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (p) => (
        <span>{priorityMap[p]?.icon} {priorityMap[p]?.label}</span>
      )
    },
    {
      title: '生产线',
      dataIndex: ['productionLine', 'line_name'],
      key: 'line_name',
      width: 120
    },
    {
      title: '工位',
      dataIndex: 'station',
      key: 'station',
      width: 100
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '持续时间',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        if (record.status === 'resolved') {
          return formatDuration(record.resolution_time_seconds);
        }
        const duration = Math.floor((Date.now() - new Date(record.created_at)) / 1000);
        return formatDuration(duration);
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => handleAcknowledge(record.id)}>
              确认
            </Button>
          )}
          {record.status === 'acknowledged' && (
            <Button size="small" type="primary" onClick={() => handleStartProcess(record.id)}>
              开始处理
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="small" type="primary" onClick={() => handleResolve(record.id)}>
              解决
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Andon 看板视图
  const renderBoard = () => (
    <div className="andon-board">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="活跃呼叫" 
              value={activeCalls.length} 
              valueStyle={{ color: activeCalls.length > 0 ? '#f5222d' : '#52c41a' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="今日呼叫" 
              value={statistics?.total || 0}
              prefix={<SoundOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="平均响应时间" 
              value={formatDuration(statistics?.avgResponseTimeSeconds || 0)}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="平均解决时间" 
              value={formatDuration(statistics?.avgResolutionTimeSeconds || 0)}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速呼叫按钮 */}
      <Card title="📢 快速呼叫" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Select 
              placeholder="选择生产线" 
              style={{ width: '100%' }}
              onChange={(value) => setSelectedLine(value)}
              options={productionLines.map(l => ({ value: l.id, label: l.line_name }))}
            />
          </Col>
          <Col span={4}>
            <Input placeholder="工位" id="andon-station" />
          </Col>
          <Col span={16}>
            <Space>
              <Button type="danger" icon={<AlertOutlined />} onClick={() => {
                const station = document.getElementById('andon-station')?.value;
                if (!selectedLine) { message.warning('请选择生产线'); return; }
                handleCreateCall({ call_type: 'equipment', priority: 'critical', production_line_id: selectedLine, station, description: '设备故障-停线' });
              }}>设备故障</Button>
              <Button type="orange" icon={<AlertOutlined />} onClick={() => {
                const station = document.getElementById('andon-station')?.value;
                if (!selectedLine) { message.warning('请选择生产线'); return; }
                handleCreateCall({ call_type: 'quality', priority: 'urgent', production_line_id: selectedLine, station, description: '质量异常' });
              }}>质量异常</Button>
              <Button type="blue" icon={<AlertOutlined />} onClick={() => {
                const station = document.getElementById('andon-station')?.value;
                if (!selectedLine) { message.warning('请选择生产线'); return; }
                handleCreateCall({ call_type: 'material', priority: 'normal', production_line_id: selectedLine, station, description: '物料短缺' });
              }}>物料短缺</Button>
              <Button type="link" onClick={() => setIsModalVisible(true)}>+ 更多呼叫</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 活跃呼叫列表 */}
      <Card title="🚨 活跃呼叫">
        {activeCalls.length === 0 ? (
          <Alert message="暂无活跃呼叫，系统运行正常" type="success" showIcon />
        ) : (
          <Table 
            columns={columns} 
            dataSource={activeCalls} 
            rowKey="id"
            pagination={false}
            rowClassName={(record) => `priority-${record.priority}`}
          />
        )}
      </Card>

      {/* 统计信息 */}
      {statistics && (
        <Card title="📊 今日统计" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div>按类型: {Object.entries(statistics.byType || {}).map(([k, v]) => `${callTypeMap[k]?.label} ${v}次`).join(', ')}</div>
            </Col>
            <Col span={8}>
              <div>按状态: {Object.entries(statistics.byStatus || {}).map(([k, v]) => `${statusMap[k]?.label} ${v}次`).join(', ')}</div>
            </Col>
            <Col span={8}>
              <div>解决率: {statistics.total > 0 ? Math.round(statistics.resolved / statistics.total * 100) : 0}%</div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );

  // 历史记录视图
  const renderHistory = () => (
    <Card title="📋 呼叫历史">
      <Table 
        columns={columns} 
        dataSource={allCalls} 
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );

  return (
    <div className="andon-dashboard">
      <div className="andon-header">
        <h1>🚨 Andon 呼叫系统</h1>
        <Button type="primary" danger icon={<AlertOutlined />} onClick={() => setIsModalVisible(true)}>
          新建呼叫
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><AlertOutlined /> Andon 看板</span>} key="board">
          {renderBoard()}
        </TabPane>
        <TabPane tab={<span><ClockCircleOutlined /> 历史记录</span>} key="history">
          {renderHistory()}
        </TabPane>
      </Tabs>

      {/* 新建呼叫 Modal */}
      <Modal
        title="📢 新建呼叫"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateCall} layout="vertical">
          <Form.Item name="production_line_id" label="生产线" rules={[{ required: true }]}>
            <Select 
              placeholder="选择生产线"
              options={productionLines.map(l => ({ value: l.id, label: l.line_name }))}
            />
          </Form.Item>
          
          <Form.Item name="call_type" label="呼叫类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              <Option value="equipment">设备故障</Option>
              <Option value="quality">质量异常</Option>
              <Option value="material">物料短缺</Option>
              <Option value="safety">安全问题</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select placeholder="选择优先级">
              <Option value="normal">一般</Option>
              <Option value="urgent">紧急</Option>
              <Option value="critical">停线</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="station" label="工位">
            <Input placeholder="输入工位" />
          </Form.Item>
          
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="详细描述问题..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">发送呼叫</Button>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AndonDashboard;
