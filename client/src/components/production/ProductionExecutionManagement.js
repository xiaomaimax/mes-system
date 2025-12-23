import React, { useState, useEffect } from 'react';
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
  message,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
  Timeline,
  Badge,
  Descriptions,
  Tabs
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined, 
  SearchOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ProductionExecutionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        currentProduction: Math.floor(Math.random() * 100) + 1200,
        efficiency: (Math.random() * 10 + 85).toFixed(1),
        defectRate: (Math.random() * 2 + 1).toFixed(2),
        equipmentStatus: Math.random() > 0.8 ? 'warning' : 'normal'
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 模拟生产执行数据
  const executionData = [
    {
      key: '1',
      taskNumber: 'PT-2024-001',
      productName: '产品A',
      materialNumber: 'MAT-001',
      planQuantity: 1000,
      completedQuantity: 750,
      qualifiedQuantity: 735,
      defectQuantity: 15,
      workshop: '车间A',
      productionLine: '生产线1',
      operator: '张三',
      startTime: '2024-01-15 08:00',
      endTime: null,
      status: 'in_progress',
      progress: 75,
      efficiency: 92.5,
      remarks: '正常生产中',
      equipment: ['设备A1', '设备A2'],
      processStep: '工序3/5'
    },
    {
      key: '2',
      taskNumber: 'PT-2024-002',
      productName: '产品B',
      materialNumber: 'MAT-002',
      planQuantity: 500,
      completedQuantity: 500,
      qualifiedQuantity: 485,
      defectQuantity: 15,
      workshop: '车间B',
      productionLine: '生产线2',
      operator: '李四',
      startTime: '2024-01-14 09:00',
      endTime: '2024-01-15 17:30',
      status: 'completed',
      progress: 100,
      efficiency: 97.0,
      remarks: '已完成',
      equipment: ['设备B1', '设备B2'],
      processStep: '已完成'
    },
    {
      key: '3',
      taskNumber: 'PT-2024-003',
      productName: '产品C',
      materialNumber: 'MAT-003',
      planQuantity: 800,
      completedQuantity: 0,
      qualifiedQuantity: 0,
      defectQuantity: 0,
      workshop: '车间A',
      productionLine: '生产线3',
      operator: '王五',
      startTime: null,
      endTime: null,
      status: 'pending',
      progress: 0,
      efficiency: 0,
      remarks: '等待开始',
      equipment: ['设备A3', '设备A4'],
      processStep: '未开始'
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
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '物料编号',
      dataIndex: 'materialNumber',
      key: 'materialNumber',
      width: 120,
    },
    {
      title: '生产进度',
      key: 'progress',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span>{record.completedQuantity}/{record.planQuantity}</span>
            <span style={{ float: 'right' }}>{record.progress}%</span>
          </div>
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.status === 'completed' ? 'success' : record.status === 'in_progress' ? 'active' : 'normal'}
          />
        </div>
      )
    },
    {
      title: '质量情况',
      key: 'quality',
      width: 150,
      render: (_, record) => (
        <div>
          <div>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: record.defectQuantity > 0 ? '#ff4d4f' : '#52c41a' }}>
            不良: {record.defectQuantity}
          </div>
        </div>
      )
    },
    {
      title: '车间/产线',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.workshop}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '工序进度',
      dataIndex: 'processStep',
      key: 'processStep',
      width: 100,
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency) => (
        <span style={{ 
          color: efficiency >= 95 ? '#52c41a' : efficiency >= 85 ? '#faad14' : '#ff4d4f' 
        }}>
          {efficiency}%
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'default', text: '待开始' },
          in_progress: { color: 'processing', text: '进行中' },
          paused: { color: 'warning', text: '暂停' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' }
        };
        const { color, text } = statusMap[status];
        return <Badge status={color} text={text} />;
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140,
      render: (time) => time || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record)}
            >
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <>
              <Button 
                size="small" 
                icon={<PauseCircleOutlined />}
                onClick={() => handlePause(record)}
              >
                暂停
              </Button>
              <Button 
                size="small" 
                icon={<StopOutlined />}
                onClick={() => handleComplete(record)}
              >
                完成
              </Button>
            </>
          )}
          {record.status === 'paused' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleResume(record)}
            >
              继续
            </Button>
          )}
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const handleStart = (record) => {
    message.success(`任务 ${record.taskNumber} 开始执行`);
    // 这里可以调用API开始生产任务
  };

  const handlePause = (record) => {
    message.warning(`任务 ${record.taskNumber} 已暂停`);
    // 这里可以调用API暂停生产任务
  };

  const handleComplete = (record) => {
    message.success(`任务 ${record.taskNumber} 已完成`);
    // 这里可以调用API完成生产任务
  };

  const handleResume = (record) => {
    message.success(`任务 ${record.taskNumber} 继续执行`);
    // 这里可以调用API恢复生产任务
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 实时监控数据
  const realTimeStats = [
    {
      title: '当前产量',
      value: realTimeData.currentProduction || 1280,
      suffix: '件',
      prefix: <BarChartOutlined />,
      valueStyle: { color: '#3f8600' }
    },
    {
      title: '生产效率',
      value: realTimeData.efficiency || 87.5,
      suffix: '%',
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: '不良率',
      value: realTimeData.defectRate || 1.5,
      suffix: '%',
      prefix: <ExclamationCircleOutlined />,
      valueStyle: { color: '#ff4d4f' }
    },
    {
      title: '设备状态',
      value: '正常',
      prefix: <CheckCircleOutlined />,
      valueStyle: { 
        color: realTimeData.equipmentStatus === 'warning' ? '#faad14' : '#52c41a' 
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 实时监控面板 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {realTimeStats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                valueStyle={stat.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card 
        title={
          <Space>
            <PlayCircleOutlined />
            生产执行管理
            <Button 
              icon={<ReloadOutlined />} 
              size="small"
              onClick={() => message.info('数据已刷新')}
            >
              刷新
            </Button>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SettingOutlined />}>
              执行设置
            </Button>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索任务单号/产品名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="生产线" style={{ width: 120 }}>
              <Option value="line_1">生产线1</Option>
              <Option value="line_2">生产线2</Option>
              <Option value="line_3">生产线3</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="pending">待开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="paused">暂停</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 执行任务表格 */}
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
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 生产执行详情模态框 */}
      <Modal
        title="生产执行详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedRecord && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="任务单号">{selectedRecord.taskNumber}</Descriptions.Item>
                    <Descriptions.Item label="产品名称">{selectedRecord.productName}</Descriptions.Item>
                    <Descriptions.Item label="物料编号">{selectedRecord.materialNumber}</Descriptions.Item>
                    <Descriptions.Item label="计划数量">{selectedRecord.planQuantity} 件</Descriptions.Item>
                    <Descriptions.Item label="完成数量">{selectedRecord.completedQuantity} 件</Descriptions.Item>
                    <Descriptions.Item label="合格数量">{selectedRecord.qualifiedQuantity} 件</Descriptions.Item>
                    <Descriptions.Item label="不良数量">{selectedRecord.defectQuantity} 件</Descriptions.Item>
                    <Descriptions.Item label="生产效率">{selectedRecord.efficiency}%</Descriptions.Item>
                    <Descriptions.Item label="车间">{selectedRecord.workshop}</Descriptions.Item>
                    <Descriptions.Item label="生产线">{selectedRecord.productionLine}</Descriptions.Item>
                    <Descriptions.Item label="操作员">{selectedRecord.operator}</Descriptions.Item>
                    <Descriptions.Item label="工序进度">{selectedRecord.processStep}</Descriptions.Item>
                    <Descriptions.Item label="开始时间">{selectedRecord.startTime || '未开始'}</Descriptions.Item>
                    <Descriptions.Item label="结束时间">{selectedRecord.endTime || '进行中'}</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'progress',
                label: '进度跟踪',
                children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Progress 
                        percent={selectedRecord.progress} 
                        status={selectedRecord.status === 'completed' ? 'success' : 'active'}
                        strokeWidth={10}
                      />
                    </div>
                    <Timeline
                      items={[
                        {
                          color: 'green',
                          children: '任务创建 - 2024-01-15 08:00'
                        },
                        {
                          color: selectedRecord.status === 'pending' ? 'gray' : 'green',
                          children: '开始生产 - ' + (selectedRecord.startTime || '待开始')
                        },
                        {
                          color: selectedRecord.progress > 50 ? 'green' : 'gray',
                          children: '工序进度 - ' + selectedRecord.processStep
                        },
                        {
                          color: selectedRecord.status === 'completed' ? 'green' : 'gray',
                          children: '任务完成 - ' + (selectedRecord.endTime || '进行中')
                        }
                      ]}
                    />
                  </div>
                )
              },
              {
                key: 'equipment',
                label: '设备信息',
                children: (
                  <div>
                    <h4>使用设备：</h4>
                    {selectedRecord.equipment.map((eq, index) => (
                      <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                        {eq}
                      </Tag>
                    ))}
                    <div style={{ marginTop: 16 }}>
                      <h4>设备状态：</h4>
                      <p>所有设备运行正常</p>
                    </div>
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductionExecutionManagement;