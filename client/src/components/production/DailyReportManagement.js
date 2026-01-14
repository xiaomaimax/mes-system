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
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Progress,
  Descriptions,
  Alert,
  Timeline,
  Divider,
  List,
  Avatar
} from 'antd';
import { 
  CalendarOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  PrinterOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;
const { RangePicker } = DatePicker;

const DailyReportManagement = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDate, setReportDate] = useState(dayjs());

  // 模拟生产日报数据
  const dailyReportData = [
    {
      key: '1',
      reportDate: '2024-01-15',
      workshop: '车间A',
      shift: '白班',
      planQuantity: 1000,
      actualQuantity: 950,
      qualifiedQuantity: 920,
      defectQuantity: 30,
      completionRate: 95.0,
      qualifiedRate: 96.8,
      efficiency: 92.5,
      workHours: 480,
      actualWorkHours: 456,
      downtime: 24,
      downtimeRate: 5.0,
      operatorCount: 12,
      equipmentCount: 8,
      runningEquipment: 7,
      maintenanceEquipment: 1,
      exceptionCount: 3,
      status: 'completed',
      reportBy: '张主管',
      reportTime: '2024-01-15 18:30',
      approveBy: '李经理',
      approveTime: '2024-01-15 19:15'
    },
    {
      key: '2',
      reportDate: '2024-01-15',
      workshop: '车间B',
      shift: '夜班',
      planQuantity: 800,
      actualQuantity: 720,
      qualifiedQuantity: 700,
      defectQuantity: 20,
      completionRate: 90.0,
      qualifiedRate: 97.2,
      efficiency: 88.0,
      workHours: 480,
      actualWorkHours: 432,
      downtime: 48,
      downtimeRate: 10.0,
      operatorCount: 10,
      equipmentCount: 6,
      runningEquipment: 5,
      maintenanceEquipment: 1,
      exceptionCount: 2,
      status: 'pending',
      reportBy: '王主管',
      reportTime: '2024-01-16 06:30',
      approveBy: null,
      approveTime: null
    }
  ];

  // 今日汇总数据
  const todaySummary = {
    totalPlan: 1800,
    totalActual: 1670,
    totalQualified: 1620,
    totalDefect: 50,
    avgCompletionRate: 92.8,
    avgQualifiedRate: 97.0,
    avgEfficiency: 90.3,
    totalWorkHours: 960,
    totalDowntime: 72,
    totalOperators: 22,
    totalEquipment: 14,
    runningEquipment: 12,
    totalExceptions: 5
  };

  // 异常事件数据
  const exceptionEvents = [
    {
      time: '09:30',
      workshop: '车间A',
      type: '设备故障',
      description: '注塑机A1液压系统故障',
      duration: '1.5小时',
      impact: '影响产量50件',
      status: '已解决'
    },
    {
      time: '14:20',
      workshop: '车间B',
      type: '物料短缺',
      description: '原料B库存不足',
      duration: '2小时',
      impact: '影响产量80件',
      status: '已解决'
    },
    {
      time: '22:15',
      workshop: '车间A',
      type: '质量异常',
      description: '产品尺寸超差',
      duration: '0.5小时',
      impact: '返工20件',
      status: '处理中'
    }
  ];

  // 产量趋势数据（最近7天）
  const productionTrend = [
    { date: '01-09', plan: 1800, actual: 1750, qualified: 1715 },
    { date: '01-10', plan: 1800, actual: 1680, qualified: 1645 },
    { date: '01-11', plan: 1800, actual: 1820, qualified: 1780 },
    { date: '01-12', plan: 1800, actual: 1760, qualified: 1720 },
    { date: '01-13', plan: 1800, actual: 1690, qualified: 1650 },
    { date: '01-14', plan: 1800, actual: 1780, qualified: 1740 },
    { date: '01-15', plan: 1800, actual: 1670, qualified: 1620 }
  ];

  const columns = [
    {
      title: '日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 100,
      fixed: 'left'
    },
    {
      title: '车间',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 80,
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 80,
      render: (shift) => (
        <Tag color={shift === '白班' ? 'blue' : 'purple'}>{shift}</Tag>
      )
    },
    {
      title: '产量完成',
      key: 'production',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.actualQuantity}/{record.planQuantity}</div>
          <Progress 
            percent={record.completionRate} 
            size="small" 
            status={record.completionRate >= 95 ? 'success' : record.completionRate >= 85 ? 'active' : 'exception'}
          />
        </div>
      )
    },
    {
      title: '质量情况',
      key: 'quality',
      width: 120,
      render: (_, record) => (
        <div>
          <div>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: record.defectQuantity > 20 ? '#ff4d4f' : '#52c41a' }}>
            不良: {record.defectQuantity}
          </div>
          <div style={{ fontSize: '12px' }}>
            合格率: {record.qualifiedRate}%
          </div>
        </div>
      )
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
      title: '工时统计',
      key: 'workTime',
      width: 120,
      render: (_, record) => (
        <div>
          <div>实际: {record.actualWorkHours}h</div>
          <div>停机: {record.downtime}h</div>
          <div style={{ fontSize: '12px' }}>
            利用率: {((record.actualWorkHours / record.workHours) * 100).toFixed(1)}%
          </div>
        </div>
      )
    },
    {
      title: '人员设备',
      key: 'resources',
      width: 120,
      render: (_, record) => (
        <div>
          <div>人员: {record.operatorCount}人</div>
          <div>设备: {record.runningEquipment}/{record.equipmentCount}</div>
        </div>
      )
    },
    {
      title: '异常',
      dataIndex: 'exceptionCount',
      key: 'exceptionCount',
      width: 80,
      render: (count) => (
        <Tag color={count === 0 ? 'green' : count <= 2 ? 'orange' : 'red'}>
          {count}次
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          draft: { color: 'default', text: '草稿' },
          pending: { color: 'processing', text: '待审批' },
          completed: { color: 'success', text: '已完成' },
          rejected: { color: 'error', text: '已驳回' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '报告人',
      dataIndex: 'reportBy',
      key: 'reportBy',
      width: 100,
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
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DownloadOutlined />}
          >
            导出
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<PrinterOutlined />}
          >
            打印
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedReport(record);
    setDetailModalVisible(true);
  };

  const handleGenerateReport = () => {
    safeMessage.success('生产日报生成成功！');
  };

  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="计划产量"
            value={todaySummary.totalPlan}
            suffix="件"
            prefix={<BarChartOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="实际产量"
            value={todaySummary.totalActual}
            suffix="件"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="完成率"
            value={todaySummary.avgCompletionRate}
            suffix="%"
            prefix={todaySummary.avgCompletionRate >= 95 ? <TrendingUpOutlined /> : <TrendingDownOutlined />}
            valueStyle={{ 
              color: todaySummary.avgCompletionRate >= 95 ? '#52c41a' : '#faad14' 
            }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="合格率"
            value={todaySummary.avgQualifiedRate}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="设备利用率"
            value={((todaySummary.runningEquipment / todaySummary.totalEquipment) * 100).toFixed(1)}
            suffix="%"
            prefix={<SettingOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="异常事件"
            value={todaySummary.totalExceptions}
            suffix="次"
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderDetailModal = () => (
    <Modal
      title={`生产日报详情 - ${selectedReport?.reportDate} ${selectedReport?.workshop} ${selectedReport?.shift}`}
      open={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={[
        <Button key="print" icon={<PrinterOutlined />}>
          打印
        </Button>,
        <Button key="export" icon={<DownloadOutlined />}>
          导出
        </Button>,
        <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
          关闭
        </Button>
      ]}
      width={1000}
    >
      {selectedReport && (
        <Tabs
          items={[
            {
              key: 'summary',
              label: '生产汇总',
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Card size="small" title="产量统计">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="计划产量">{selectedReport.planQuantity} 件</Descriptions.Item>
                          <Descriptions.Item label="实际产量">{selectedReport.actualQuantity} 件</Descriptions.Item>
                          <Descriptions.Item label="完成率">{selectedReport.completionRate}%</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="质量统计">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="合格数量">{selectedReport.qualifiedQuantity} 件</Descriptions.Item>
                          <Descriptions.Item label="不良数量">{selectedReport.defectQuantity} 件</Descriptions.Item>
                          <Descriptions.Item label="合格率">{selectedReport.qualifiedRate}%</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="效率统计">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="生产效率">{selectedReport.efficiency}%</Descriptions.Item>
                          <Descriptions.Item label="设备利用率">{((selectedReport.runningEquipment / selectedReport.equipmentCount) * 100).toFixed(1)}%</Descriptions.Item>
                          <Descriptions.Item label="停机率">{selectedReport.downtimeRate}%</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Card size="small" title="资源配置">
                    <Descriptions bordered column={4}>
                      <Descriptions.Item label="操作人员">{selectedReport.operatorCount} 人</Descriptions.Item>
                      <Descriptions.Item label="设备总数">{selectedReport.equipmentCount} 台</Descriptions.Item>
                      <Descriptions.Item label="运行设备">{selectedReport.runningEquipment} 台</Descriptions.Item>
                      <Descriptions.Item label="维修设备">{selectedReport.maintenanceEquipment} 台</Descriptions.Item>
                      <Descriptions.Item label="计划工时">{selectedReport.workHours} 小时</Descriptions.Item>
                      <Descriptions.Item label="实际工时">{selectedReport.actualWorkHours} 小时</Descriptions.Item>
                      <Descriptions.Item label="停机时间">{selectedReport.downtime} 小时</Descriptions.Item>
                      <Descriptions.Item label="异常次数">{selectedReport.exceptionCount} 次</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              )
            },
            {
              key: 'exceptions',
              label: '异常事件',
              children: (
                <div>
                  <Alert
                    message={`今日共发生 ${exceptionEvents.length} 起异常事件`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    itemLayout="horizontal"
                    dataSource={exceptionEvents}
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ 
                                backgroundColor: item.status === '已解决' ? '#52c41a' : '#faad14' 
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          }
                          title={
                            <Space>
                              <Tag color="red">{item.type}</Tag>
                              <span>{item.time}</span>
                              <span>{item.workshop}</span>
                            </Space>
                          }
                          description={
                            <div>
                              <p>{item.description}</p>
                              <p>持续时间: {item.duration} | 影响: {item.impact}</p>
                              <Tag color={item.status === '已解决' ? 'green' : 'orange'}>
                                {item.status}
                              </Tag>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )
            },
            {
              key: 'trend',
              label: '趋势分析',
              children: (
                <div>
                  <Card title="近7天产量趋势" style={{ marginBottom: 16 }}>
                    <div style={{ height: 200, display: 'flex', alignItems: 'end', justifyContent: 'space-around' }}>
                      {productionTrend.map((item, index) => (
                        <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ 
                              height: (item.actual / 2000) * 150, 
                              backgroundColor: '#1890ff', 
                              marginBottom: 2,
                              borderRadius: '2px'
                            }}></div>
                            <div style={{ 
                              height: (item.qualified / 2000) * 150, 
                              backgroundColor: '#52c41a',
                              borderRadius: '2px'
                            }}></div>
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <div>{item.date}</div>
                            <div>实际: {item.actual}</div>
                            <div>合格: {item.qualified}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="关键指标对比" size="small">
                        <Descriptions column={1}>
                          <Descriptions.Item label="完成率">
                            <Progress percent={selectedReport.completionRate} />
                          </Descriptions.Item>
                          <Descriptions.Item label="合格率">
                            <Progress percent={selectedReport.qualifiedRate} />
                          </Descriptions.Item>
                          <Descriptions.Item label="效率">
                            <Progress percent={selectedReport.efficiency} />
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="改进建议" size="small">
                        <Timeline
                          items={[
                            {
                              children: '加强设备预防性维护，减少故障停机时间'
                            },
                            {
                              children: '优化生产工艺，提高生产效率'
                            },
                            {
                              children: '加强质量控制，降低不良品率'
                            },
                            {
                              children: '完善物料配送，避免缺料停产'
                            }
                          ]}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            }
          ]}
        />
      )}
    </Modal>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* 日期选择和汇总统计 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CalendarOutlined />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>生产日报</span>
              <DatePicker 
                value={reportDate}
                onChange={setReportDate}
                format="YYYY-MM-DD"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileTextOutlined />} onClick={handleGenerateReport}>
                生成日报
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出汇总
              </Button>
              <Button type="primary" icon={<PrinterOutlined />}>
                打印日报
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 汇总统计卡片 */}
      {renderSummaryCards()}

      {/* 异常事件快览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="今日异常事件" size="small">
            <Timeline
              items={exceptionEvents.slice(0, 3).map(event => ({
                color: event.status === '已解决' ? 'green' : 'red',
                children: (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {event.time} {event.workshop} - {event.type}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {event.description} | {event.impact}
                    </div>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="关键指标" size="small">
            <div style={{ marginBottom: 12 }}>
              <div>完成率</div>
              <Progress percent={todaySummary.avgCompletionRate} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div>合格率</div>
              <Progress percent={todaySummary.avgQualifiedRate} />
            </div>
            <div>
              <div>设备利用率</div>
              <Progress percent={((todaySummary.runningEquipment / todaySummary.totalEquipment) * 100)} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <CalendarOutlined />
            生产日报管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Select placeholder="车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="班次" style={{ width: 120 }}>
              <Option value="day">白班</Option>
              <Option value="night">夜班</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 日报列表 */}
        <Table
          columns={columns}
          dataSource={dailyReportData}
          loading={loading}
          pagination={{
            total: dailyReportData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情模态框 */}
      {renderDetailModal()}
    </div>
  );
};

export default DailyReportManagement;