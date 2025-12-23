import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Select, DatePicker, Tabs, Statistic, Progress } from 'antd';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PersonnelReports = () => {
  const [activeTab, setActiveTab] = useState('attendance-report');

  // 考勤报表数据
  const attendanceReportData = [
    {
      key: '1',
      department: '生产部',
      totalEmployees: 45,
      presentDays: 1350,
      lateDays: 15,
      absentDays: 8,
      overtimeHours: 120,
      attendanceRate: 97.2
    },
    {
      key: '2',
      department: '质量部',
      totalEmployees: 18,
      presentDays: 540,
      lateDays: 3,
      absentDays: 2,
      overtimeHours: 45,
      attendanceRate: 98.5
    },
    {
      key: '3',
      department: '设备部',
      totalEmployees: 22,
      presentDays: 660,
      lateDays: 12,
      absentDays: 6,
      overtimeHours: 85,
      attendanceRate: 94.8
    },
    {
      key: '4',
      department: '技术部',
      totalEmployees: 28,
      presentDays: 840,
      lateDays: 8,
      absentDays: 4,
      overtimeHours: 95,
      attendanceRate: 96.1
    }
  ];

  // 培训报表数据
  const trainingReportData = [
    {
      key: '1',
      department: '生产部',
      totalEmployees: 45,
      trainedEmployees: 42,
      trainingHours: 336,
      avgScore: 88.5,
      certificationCount: 38,
      trainingCost: 15000
    },
    {
      key: '2',
      department: '质量部',
      totalEmployees: 18,
      trainedEmployees: 18,
      trainingHours: 144,
      avgScore: 92.3,
      certificationCount: 16,
      trainingCost: 8000
    },
    {
      key: '3',
      department: '设备部',
      totalEmployees: 22,
      trainedEmployees: 20,
      trainingHours: 160,
      avgScore: 85.7,
      certificationCount: 18,
      trainingCost: 12000
    },
    {
      key: '4',
      department: '技术部',
      totalEmployees: 28,
      trainedEmployees: 26,
      trainingHours: 208,
      avgScore: 94.2,
      certificationCount: 24,
      trainingCost: 20000
    }
  ];

  // 绩效报表数据
  const performanceReportData = [
    {
      key: '1',
      department: '生产部',
      totalEmployees: 45,
      avgScore: 86.8,
      excellentCount: 8,
      goodCount: 25,
      normalCount: 10,
      improvementCount: 2,
      totalBonus: 65000
    },
    {
      key: '2',
      department: '质量部',
      totalEmployees: 18,
      avgScore: 89.5,
      excellentCount: 5,
      goodCount: 10,
      normalCount: 3,
      improvementCount: 0,
      totalBonus: 32000
    },
    {
      key: '3',
      department: '设备部',
      totalEmployees: 22,
      avgScore: 84.2,
      excellentCount: 3,
      goodCount: 12,
      normalCount: 6,
      improvementCount: 1,
      totalBonus: 38000
    },
    {
      key: '4',
      department: '技术部',
      totalEmployees: 28,
      avgScore: 91.3,
      excellentCount: 8,
      goodCount: 15,
      normalCount: 4,
      improvementCount: 1,
      totalBonus: 58000
    }
  ];

  const attendanceColumns = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '员工总数',
      dataIndex: 'totalEmployees',
      key: 'totalEmployees'
    },
    {
      title: '出勤天数',
      dataIndex: 'presentDays',
      key: 'presentDays'
    },
    {
      title: '迟到次数',
      dataIndex: 'lateDays',
      key: 'lateDays'
    },
    {
      title: '缺勤天数',
      dataIndex: 'absentDays',
      key: 'absentDays'
    },
    {
      title: '加班时长',
      dataIndex: 'overtimeHours',
      key: 'overtimeHours',
      render: (hours) => `${hours}小时`
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: (rate) => (
        <div>
          <Progress percent={rate} size="small" />
          <span style={{ fontSize: '12px' }}>{rate}%</span>
        </div>
      )
    }
  ];

  const trainingColumns = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '员工总数',
      dataIndex: 'totalEmployees',
      key: 'totalEmployees'
    },
    {
      title: '参训人数',
      dataIndex: 'trainedEmployees',
      key: 'trainedEmployees'
    },
    {
      title: '培训时长',
      dataIndex: 'trainingHours',
      key: 'trainingHours',
      render: (hours) => `${hours}小时`
    },
    {
      title: '平均成绩',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score) => `${score}分`
    },
    {
      title: '获证人数',
      dataIndex: 'certificationCount',
      key: 'certificationCount'
    },
    {
      title: '培训费用',
      dataIndex: 'trainingCost',
      key: 'trainingCost',
      render: (cost) => `¥${cost.toLocaleString()}`
    }
  ];

  const performanceColumns = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '员工总数',
      dataIndex: 'totalEmployees',
      key: 'totalEmployees'
    },
    {
      title: '平均得分',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score) => `${score}分`
    },
    {
      title: '优秀',
      dataIndex: 'excellentCount',
      key: 'excellentCount'
    },
    {
      title: '良好',
      dataIndex: 'goodCount',
      key: 'goodCount'
    },
    {
      title: '合格',
      dataIndex: 'normalCount',
      key: 'normalCount'
    },
    {
      title: '待改进',
      dataIndex: 'improvementCount',
      key: 'improvementCount'
    },
    {
      title: '奖金总额',
      dataIndex: 'totalBonus',
      key: 'totalBonus',
      render: (bonus) => `¥${bonus.toLocaleString()}`
    }
  ];

  const tabItems = [
    {
      key: 'attendance-report',
      label: '考勤报表',
      icon: <ClockCircleOutlined />
    },
    {
      key: 'training-report',
      label: '培训报表',
      icon: <BarChartOutlined />
    },
    {
      key: 'performance-report',
      label: '绩效报表',
      icon: <TrophyOutlined />
    },
    {
      key: 'summary-report',
      label: '综合报表',
      icon: <PieChartOutlined />
    }
  ];

  const renderAttendanceReport = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select placeholder="部门" style={{ width: 120 }} allowClear>
            <Option value="生产部">生产部</Option>
            <Option value="质量部">质量部</Option>
            <Option value="设备部">设备部</Option>
            <Option value="技术部">技术部</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
        </Space>
        <Space>
          <Button icon={<FileExcelOutlined />}>导出Excel</Button>
          <Button icon={<PrinterOutlined />}>打印</Button>
        </Space>
      </div>

      <Table
        columns={attendanceColumns}
        dataSource={attendanceReportData}
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell>合计</Table.Summary.Cell>
            <Table.Summary.Cell>
              {attendanceReportData.reduce((sum, item) => sum + item.totalEmployees, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {attendanceReportData.reduce((sum, item) => sum + item.presentDays, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {attendanceReportData.reduce((sum, item) => sum + item.lateDays, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {attendanceReportData.reduce((sum, item) => sum + item.absentDays, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {attendanceReportData.reduce((sum, item) => sum + item.overtimeHours, 0)}小时
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {(attendanceReportData.reduce((sum, item) => sum + item.attendanceRate, 0) / attendanceReportData.length).toFixed(1)}%
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );

  const renderTrainingReport = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select placeholder="部门" style={{ width: 120 }} allowClear>
            <Option value="生产部">生产部</Option>
            <Option value="质量部">质量部</Option>
            <Option value="设备部">设备部</Option>
            <Option value="技术部">技术部</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
        </Space>
        <Space>
          <Button icon={<FileExcelOutlined />}>导出Excel</Button>
          <Button icon={<PrinterOutlined />}>打印</Button>
        </Space>
      </div>

      <Table
        columns={trainingColumns}
        dataSource={trainingReportData}
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell>合计</Table.Summary.Cell>
            <Table.Summary.Cell>
              {trainingReportData.reduce((sum, item) => sum + item.totalEmployees, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {trainingReportData.reduce((sum, item) => sum + item.trainedEmployees, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {trainingReportData.reduce((sum, item) => sum + item.trainingHours, 0)}小时
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {(trainingReportData.reduce((sum, item) => sum + item.avgScore, 0) / trainingReportData.length).toFixed(1)}分
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {trainingReportData.reduce((sum, item) => sum + item.certificationCount, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              ¥{trainingReportData.reduce((sum, item) => sum + item.trainingCost, 0).toLocaleString()}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );

  const renderPerformanceReport = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Select placeholder="部门" style={{ width: 120 }} allowClear>
            <Option value="生产部">生产部</Option>
            <Option value="质量部">质量部</Option>
            <Option value="设备部">设备部</Option>
            <Option value="技术部">技术部</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
        </Space>
        <Space>
          <Button icon={<FileExcelOutlined />}>导出Excel</Button>
          <Button icon={<PrinterOutlined />}>打印</Button>
        </Space>
      </div>

      <Table
        columns={performanceColumns}
        dataSource={performanceReportData}
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell>合计</Table.Summary.Cell>
            <Table.Summary.Cell>
              {performanceReportData.reduce((sum, item) => sum + item.totalEmployees, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {(performanceReportData.reduce((sum, item) => sum + item.avgScore, 0) / performanceReportData.length).toFixed(1)}分
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {performanceReportData.reduce((sum, item) => sum + item.excellentCount, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {performanceReportData.reduce((sum, item) => sum + item.goodCount, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {performanceReportData.reduce((sum, item) => sum + item.normalCount, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              {performanceReportData.reduce((sum, item) => sum + item.improvementCount, 0)}
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              ¥{performanceReportData.reduce((sum, item) => sum + item.totalBonus, 0).toLocaleString()}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );

  const renderSummaryReport = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="人员结构统计" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="员工总数"
                value={113}
                prefix={<UserOutlined />}
                suffix="人"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="部门数量"
                value={4}
                prefix={<TeamOutlined />}
                suffix="个"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>生产部</span>
              <span>45人 (39.8%)</span>
            </div>
            <Progress percent={39.8} size="small" strokeColor="#1890ff" />
            
            <div style={{ marginBottom: '8px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>技术部</span>
              <span>28人 (24.8%)</span>
            </div>
            <Progress percent={24.8} size="small" strokeColor="#52c41a" />
            
            <div style={{ marginBottom: '8px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>设备部</span>
              <span>22人 (19.5%)</span>
            </div>
            <Progress percent={19.5} size="small" strokeColor="#fa8c16" />
            
            <div style={{ marginBottom: '8px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>质量部</span>
              <span>18人 (15.9%)</span>
            </div>
            <Progress percent={15.9} size="small" strokeColor="#722ed1" />
          </div>
        </Card>
      </Col>
      
      <Col span={12}>
        <Card title="关键指标汇总" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f6ffed', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>96.7%</div>
                <div style={{ color: '#666' }}>平均出勤率</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f0f5ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>88.1分</div>
                <div style={{ color: '#666' }}>平均绩效得分</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#fff7e6', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>93.8%</div>
                <div style={{ color: '#666' }}>培训参与率</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f9f0ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>96人</div>
                <div style={{ color: '#666' }}>持证人数</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: 
              item.key === 'attendance-report' ? renderAttendanceReport() :
              item.key === 'training-report' ? renderTrainingReport() :
              item.key === 'performance-report' ? renderPerformanceReport() :
              renderSummaryReport()
          }))}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PersonnelReports;