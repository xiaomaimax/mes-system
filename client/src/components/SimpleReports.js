import React, { useState, useEffect } from 'react';
import { Tabs, Card, Row, Col, Button, Space, Table, DatePicker, Select, Statistic, Progress, Tooltip, Modal, Form, Input, Upload, List, Tag, message, Alert, Avatar, Spin } from 'antd';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return safeMessage.success(content, duration);
      } else {
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return safeMessage.error(content, duration);
      } else {
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return safeMessage.warning(content, duration);
      } else {
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return safeMessage.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
import { 
  BarChartOutlined, 
  FileTextOutlined, 
  DownloadOutlined, 
  DashboardOutlined,
  TrophyOutlined,
  ToolOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import DataService from '../services/DataService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SimpleReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // 报表数据加载状态
  const [productionReportLoading, setProductionReportLoading] = useState(false);
  const [productionReportError, setProductionReportError] = useState(null);
  const [productionReportData, setProductionReportData] = useState([]);
  
  const [qualityReportLoading, setQualityReportLoading] = useState(false);
  const [qualityReportError, setQualityReportError] = useState(null);
  const [qualityReportData, setQualityReportData] = useState([]);
  
  const [equipmentReportLoading, setEquipmentReportLoading] = useState(false);
  const [equipmentReportError, setEquipmentReportError] = useState(null);
  const [equipmentReportData, setEquipmentReportData] = useState([]);
  
  // 自定义报表相关状态
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [designerModalVisible, setDesignerModalVisible] = useState(false);
  const [myReportsModalVisible, setMyReportsModalVisible] = useState(false);
  const [createReportModalVisible, setCreateReportModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customReports, setCustomReports] = useState([
    {
      id: 1,
      name: '生产效率周报',
      type: '生产报表',
      creator: '张三',
      createTime: '2024-12-20',
      status: '已发布'
    },
    {
      id: 2,
      name: '质量月度分析',
      type: '质量报表',
      creator: '李四',
      createTime: '2024-12-18',
      status: '草稿'
    },
    {
      id: 3,
      name: '设备维护统计',
      type: '设备报表',
      creator: '王五',
      createTime: '2024-12-15',
      status: '已发布'
    }
  ]);
  const [form] = Form.useForm();

  // 加载生产报表数据
  useEffect(() => {
    const loadProductionReports = async () => {
      setProductionReportLoading(true);
      setProductionReportError(null);
      try {
        const result = await DataService.getProductionReports();
        if (result.success && result.data) {
          setProductionReportData(Array.isArray(result.data) ? result.data : []);
        } else {
          setProductionReportError(result.error?.message || '加载生产报表失败');
          setProductionReportData([]);
        }
      } catch (error) {
        setProductionReportError(error.message || '加载生产报表失败');
        setProductionReportData([]);
      } finally {
        setProductionReportLoading(false);
      }
    };
    
    if (activeTab === 'production') {
      loadProductionReports();
    }
  }, [activeTab]);

  // 加载质量报表数据
  useEffect(() => {
    const loadQualityReports = async () => {
      setQualityReportLoading(true);
      setQualityReportError(null);
      try {
        const result = await DataService.getQualityReports();
        if (result.success && result.data) {
          setQualityReportData(Array.isArray(result.data) ? result.data : []);
        } else {
          setQualityReportError(result.error?.message || '加载质量报表失败');
          setQualityReportData([]);
        }
      } catch (error) {
        setQualityReportError(error.message || '加载质量报表失败');
        setQualityReportData([]);
      } finally {
        setQualityReportLoading(false);
      }
    };
    
    if (activeTab === 'quality') {
      loadQualityReports();
    }
  }, [activeTab]);

  // 加载设备报表数据
  useEffect(() => {
    const loadEquipmentReports = async () => {
      setEquipmentReportLoading(true);
      setEquipmentReportError(null);
      try {
        const result = await DataService.getEquipmentReports();
        if (result.success && result.data) {
          setEquipmentReportData(Array.isArray(result.data) ? result.data : []);
        } else {
          setEquipmentReportError(result.error?.message || '加载设备报表失败');
          setEquipmentReportData([]);
        }
      } catch (error) {
        setEquipmentReportError(error.message || '加载设备报表失败');
        setEquipmentReportData([]);
      } finally {
        setEquipmentReportLoading(false);
      }
    };
    
    if (activeTab === 'equipment') {
      loadEquipmentReports();
    }
  }, [activeTab]);

  // 报表模板数据
  const reportTemplates = [
    {
      id: 1,
      name: '生产日报模板',
      description: '包含当日产量、效率、OEE等关键指标',
      category: '生产报表',
      fields: ['产量', '效率', 'OEE', '不良率'],
      preview: '日期 | 生产线 | 产量 | 效率 | OEE'
    },
    {
      id: 2,
      name: '质量周报模板',
      description: '质量检验数据汇总，包含各阶段合格率',
      category: '质量报表',
      fields: ['IQC合格率', 'PQC合格率', 'FQC合格率', 'OQC合格率'],
      preview: '周次 | 产品 | IQC | PQC | FQC | OQC'
    },
    {
      id: 3,
      name: '设备月报模板',
      description: '设备运行状态、维护记录、故障统计',
      category: '设备报表',
      fields: ['利用率', 'MTBF', 'MTTR', '维护次数'],
      preview: '月份 | 设备 | 利用率 | MTBF | MTTR'
    },
    {
      id: 4,
      name: '库存分析模板',
      description: '库存周转、ABC分析、呆滞库存统计',
      category: '库存报表',
      fields: ['周转率', 'ABC分类', '呆滞率', '准确率'],
      preview: '物料 | 库存 | 周转率 | ABC | 呆滞率'
    },
    {
      id: 5,
      name: 'KPI综合模板',
      description: '各部门KPI指标汇总分析',
      category: 'KPI报表',
      fields: ['生产达成率', '质量合格率', '设备利用率', '成本控制'],
      preview: '部门 | 生产达成 | 质量合格 | 设备利用'
    }
  ];

  // 自定义报表处理函数
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(false);
    setCreateReportModalVisible(true);
    form.setFieldsValue({
      name: `${template.name}_${new Date().getMonth() + 1}月`,
      type: template.category,
      template: template.name
    });
  };

  const handleCreateReport = (values) => {
    const newReport = {
      id: customReports.length + 1,
      name: values.name,
      type: values.type,
      creator: '当前用户',
      createTime: new Date().toISOString().split('T')[0],
      status: '草稿'
    };
    setCustomReports([...customReports, newReport]);
    setCreateReportModalVisible(false);
    form.resetFields();
    safeMessage.success('报表创建成功！');
  };

  const handleDeleteReport = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个报表吗？',
      onOk: () => {
        setCustomReports(customReports.filter(report => report.id !== id));
        safeMessage.success('报表删除成功！');
      }
    });
  };

  const handlePublishReport = (id) => {
    setCustomReports(customReports.map(report => 
      report.id === id ? { ...report, status: '已发布' } : report
    ));
    safeMessage.success('报表发布成功！');
  };

  // 模拟图表数据
  const productionTrendData = [
    { name: '1月', 产量: 2400, 目标: 2500, OEE: 85 },
    { name: '2月', 产量: 2210, 目标: 2300, OEE: 88 },
    { name: '3月', 产量: 2290, 目标: 2400, OEE: 92 },
    { name: '4月', 产量: 2000, 目标: 2200, OEE: 87 },
    { name: '5月', 产量: 2181, 目标: 2300, OEE: 89 },
    { name: '6月', 产量: 2500, 目标: 2600, OEE: 91 },
    { name: '7月', 产量: 2100, 目标: 2400, OEE: 86 }
  ];

  const qualityChartData = [
    { name: 'IQC', value: 98.5, color: '#8884d8' },
    { name: 'PQC', value: 97.2, color: '#82ca9d' },
    { name: 'FQC', value: 99.1, color: '#ffc658' },
    { name: 'OQC', value: 98.8, color: '#ff7300' }
  ];

  const equipmentUtilizationData = [
    { name: '设备001', 利用率: 92, 故障时间: 8 },
    { name: '设备002', 利用率: 88, 故障时间: 12 },
    { name: '设备003', 利用率: 95, 故障时间: 5 },
    { name: '设备004', 利用率: 87, 故障时间: 15 },
    { name: '设备005', 利用率: 91, 故障时间: 9 }
  ];

  const inventoryTurnoverData = [
    { name: '原料A', 周转率: 12, ABC: 'A' },
    { name: '原料B', 周转率: 8, ABC: 'B' },
    { name: '原料C', 周转率: 6, ABC: 'C' },
    { name: '原料D', 周转率: 15, ABC: 'A' },
    { name: '原料E', 周转率: 4, ABC: 'C' }
  ];

  const kpiTrendData = [
    { month: '1月', 生产达成率: 95, 质量合格率: 97, 设备利用率: 89, 库存周转: 8.5 },
    { month: '2月', 生产达成率: 92, 质量合格率: 98, 设备利用率: 91, 库存周转: 9.2 },
    { month: '3月', 生产达成率: 98, 质量合格率: 96, 设备利用率: 93, 库存周转: 8.8 },
    { month: '4月', 生产达成率: 94, 质量合格率: 99, 设备利用率: 88, 库存周转: 9.5 },
    { month: '5月', 生产达成率: 96, 质量合格率: 97, 设备利用率: 92, 库存周转: 8.9 },
    { month: '6月', 生产达成率: 99, 质量合格率: 98, 设备利用率: 94, 库存周转: 9.8 }
  ];

  // 部门绩效计算公式说明
  const departmentKPIFormulas = {
    生产部: {
      title: "生产部绩效计算",
      formula: "生产部绩效 = (产量达成率 × 0.4) + (生产效率 × 0.3) + (OEE × 0.3)",
      details: [
        "产量达成率 = 实际产量 / 计划产量 × 100%",
        "生产效率 = 标准工时 / 实际工时 × 100%",
        "OEE = 可用率 × 性能率 × 质量率",
        "权重分配：产量达成率40%，生产效率30%，OEE30%"
      ]
    },
    质量部: {
      title: "质量部绩效计算", 
      formula: "质量部绩效 = (合格率 × 0.5) + (客户投诉处理率 × 0.3) + (检验及时率 × 0.2)",
      details: [
        "合格率 = 合格品数量 / 总检验数量 × 100%",
        "客户投诉处理率 = 及时处理投诉数 / 总投诉数 × 100%",
        "检验及时率 = 按时完成检验数 / 总检验任务数 × 100%",
        "权重分配：合格率50%，投诉处理30%，检验及时率20%"
      ]
    },
    设备部: {
      title: "设备部绩效计算",
      formula: "设备部绩效 = (设备利用率 × 0.4) + (故障响应时间 × 0.3) + (预防维护完成率 × 0.3)",
      details: [
        "设备利用率 = 设备运行时间 / 计划运行时间 × 100%",
        "故障响应时间得分 = (标准响应时间 / 实际响应时间) × 100%",
        "预防维护完成率 = 完成维护项目数 / 计划维护项目数 × 100%",
        "权重分配：设备利用率40%，故障响应30%，预防维护30%"
      ]
    },
    物流部: {
      title: "物流部绩效计算",
      formula: "物流部绩效 = (交付及时率 × 0.4) + (库存准确率 × 0.3) + (成本控制率 × 0.3)",
      details: [
        "交付及时率 = 按时交付订单数 / 总订单数 × 100%",
        "库存准确率 = 盘点准确数量 / 盘点总数量 × 100%",
        "成本控制率 = 预算成本 / 实际成本 × 100%",
        "权重分配：交付及时率40%，库存准确率30%，成本控制30%"
      ]
    }
  };

  const DepartmentKPITooltip = ({ department, children }) => (
    <Tooltip
      title={
        <div style={{ maxWidth: '350px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {departmentKPIFormulas[department].title}
          </div>
          <div style={{ marginBottom: '8px', color: '#1890ff', fontSize: '12px' }}>
            {departmentKPIFormulas[department].formula}
          </div>
          {departmentKPIFormulas[department].details.map((detail, index) => (
            <div key={index} style={{ fontSize: '11px', marginBottom: '4px' }}>
              • {detail}
            </div>
          ))}
        </div>
      }
      placement="top"
    >
      {children}
    </Tooltip>
  );

  // 模拟表格数据
  const productionData = [
    { key: '1', line: '生产线A', target: 1000, actual: 950, efficiency: '95%', oee: '87%' },
    { key: '2', line: '生产线B', target: 800, actual: 820, efficiency: '102.5%', oee: '92%' },
    { key: '3', line: '生产线C', target: 1200, actual: 1150, efficiency: '95.8%', oee: '89%' },
  ];

  const qualityData = [
    { key: '1', product: '产品A', inspected: 500, passed: 485, defectRate: '3%', cpk: 1.33 },
    { key: '2', product: '产品B', inspected: 300, passed: 295, defectRate: '1.7%', cpk: 1.67 },
    { key: '3', product: '产品C', inspected: 400, passed: 392, defectRate: '2%', cpk: 1.45 },
  ];

  const equipmentData = [
    { key: '1', equipment: '设备001', utilization: '92%', mtbf: '168h', mttr: '2.5h', status: '运行' },
    { key: '2', equipment: '设备002', utilization: '88%', mtbf: '145h', mttr: '3.2h', status: '运行' },
    { key: '3', equipment: '设备003', utilization: '95%', mtbf: '180h', mttr: '2.1h', status: '维护' },
  ];

  const inventoryData = [
    { key: '1', material: '原料A', stock: 1500, safety: 500, turnover: '12次/年', abc: 'A' },
    { key: '2', material: '原料B', stock: 800, safety: 200, turnover: '8次/年', abc: 'B' },
    { key: '3', material: '原料C', stock: 300, safety: 100, turnover: '6次/年', abc: 'C' },
  ];

  // 计算公式说明
  const formulaTooltips = {
    OEE: {
      title: "OEE (整体设备效率)",
      formula: "OEE = 可用率 × 性能率 × 质量率",
      details: [
        "可用率 = 运行时间 / 计划时间",
        "性能率 = 实际产量 / 理论产量", 
        "质量率 = 合格品数量 / 总产量",
        "作用：衡量设备综合效率，是TPM的核心指标"
      ]
    },
    CPK: {
      title: "CPK (过程能力指数)",
      formula: "CPK = min(CPU, CPL)",
      details: [
        "CPU = (USL - μ) / (3σ)",
        "CPL = (μ - LSL) / (3σ)",
        "USL: 规格上限, LSL: 规格下限",
        "μ: 过程均值, σ: 过程标准差",
        "作用：评估过程满足规格要求的能力"
      ]
    },
    MTBF: {
      title: "MTBF (平均故障间隔时间)",
      formula: "MTBF = 总运行时间 / 故障次数",
      details: [
        "单位：小时(h)",
        "计算周期：通常为月度或年度",
        "作用：衡量设备可靠性，值越大越好"
      ]
    },
    MTTR: {
      title: "MTTR (平均修复时间)",
      formula: "MTTR = 总修复时间 / 故障次数",
      details: [
        "单位：小时(h)",
        "包含：故障诊断+维修+测试时间",
        "作用：衡量维修效率，值越小越好"
      ]
    }
  };

  const FormulaTooltip = ({ type, children }) => (
    <Tooltip
      title={
        <div style={{ maxWidth: '300px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {formulaTooltips[type].title}
          </div>
          <div style={{ marginBottom: '8px', color: '#1890ff' }}>
            {formulaTooltips[type].formula}
          </div>
          {formulaTooltips[type].details.map((detail, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
              {detail}
            </div>
          ))}
        </div>
      }
      placement="top"
    >
      {children}
    </Tooltip>
  );

  // 表格列定义
  const productionColumns = [
    { title: '生产线', dataIndex: 'line', key: 'line' },
    { title: '目标产量', dataIndex: 'target', key: 'target' },
    { title: '实际产量', dataIndex: 'actual', key: 'actual' },
    { title: '生产效率', dataIndex: 'efficiency', key: 'efficiency' },
    { title: 'OEE', dataIndex: 'oee', key: 'oee' },
  ];

  const qualityColumns = [
    { title: '产品', dataIndex: 'product', key: 'product' },
    { title: '检验数量', dataIndex: 'inspected', key: 'inspected' },
    { title: '合格数量', dataIndex: 'passed', key: 'passed' },
    { title: '不良率', dataIndex: 'defectRate', key: 'defectRate' },
    { title: 'CPK值', dataIndex: 'cpk', key: 'cpk' },
  ];

  const equipmentColumns = [
    { title: '设备编号', dataIndex: 'equipment', key: 'equipment' },
    { title: '利用率', dataIndex: 'utilization', key: 'utilization' },
    { title: 'MTBF', dataIndex: 'mtbf', key: 'mtbf' },
    { title: 'MTTR', dataIndex: 'mttr', key: 'mttr' },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ];

  const inventoryColumns = [
    { title: '物料名称', dataIndex: 'material', key: 'material' },
    { title: '当前库存', dataIndex: 'stock', key: 'stock' },
    { title: '安全库存', dataIndex: 'safety', key: 'safety' },
    { title: '周转率', dataIndex: 'turnover', key: 'turnover' },
    { title: 'ABC分类', dataIndex: 'abc', key: 'abc' },
  ];

  // 渲染函数
  const renderOverview = () => (
    <div>
      {/* 页面标题和快速操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>报表分析概览</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            全面的数据分析和报表管理，为决策提供数据支持
          </p>
        </div>
        <Space size="large">
          <Button type="primary" size="large" onClick={() => setActiveTab('custom')}>
            创建自定义报表
          </Button>
          <Button size="large" onClick={() => setActiveTab('dashboard')}>
            综合看板
          </Button>
        </Space>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="报表提醒"
        description="系统已自动生成今日生产报表，请及时查看关键指标变化。"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* 关键指标卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日报表数量"
              value={28}
              suffix="份"
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 已生成 25份
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据更新率"
              value={98.5}
              suffix="%"
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              实时数据同步正常
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常报警"
              value={3}
              suffix="项"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              需要关注的指标异常
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="自定义报表"
              value={12}
              suffix="个"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              用户创建的报表模板
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快速访问功能模块 */}
      <Card title="快速访问" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('dashboard')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#1890ff', marginBottom: '8px' }}>
                <DashboardOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>综合看板</div>
              <div style={{ fontSize: '12px', color: '#666' }}>实时数据监控</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('production')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}>
                <TrophyOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>生产报表</div>
              <div style={{ fontSize: '12px', color: '#666' }}>生产数据分析</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('quality')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#722ed1', marginBottom: '8px' }}>
                <CheckCircleOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>质量报表</div>
              <div style={{ fontSize: '12px', color: '#666' }}>质量数据统计</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('equipment')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#faad14', marginBottom: '8px' }}>
                <ToolOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>设备报表</div>
              <div style={{ fontSize: '12px', color: '#666' }}>设备运行分析</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('inventory')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#13c2c2', marginBottom: '8px' }}>
                <InboxOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>库存报表</div>
              <div style={{ fontSize: '12px', color: '#666' }}>库存数据管理</div>
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              size="small"
              hoverable
              onClick={() => setActiveTab('kpi')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <Avatar size={48} style={{ backgroundColor: '#eb2f96', marginBottom: '8px' }}>
                <BarChartOutlined />
              </Avatar>
              <div style={{ fontWeight: 'bold' }}>KPI分析</div>
              <div style={{ fontSize: '12px', color: '#666' }}>关键指标分析</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日产量"
              value={2920}
              prefix={<TrophyOutlined />}
              suffix="件"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="整体OEE"
              value={89.2}
              prefix={<DashboardOutlined />}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质量合格率"
              value={97.8}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="设备利用率"
              value={91.7}
              prefix={<ToolOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="生产趋势分析" extra={<Button type="link">详细</Button>}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={productionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="产量" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="目标" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="质量检验合格率" extra={<Button type="link">详细</Button>}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={qualityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderProduction = () => (
    <div>
      <Card title="生产报表" style={{ marginBottom: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <RangePicker />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部生产线</Option>
            <Option value="lineA">生产线A</Option>
            <Option value="lineB">生产线B</Option>
            <Option value="lineC">生产线C</Option>
          </Select>
          <Button type="primary" icon={<FileTextOutlined />}>生成报表</Button>
          <Button icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
        
        {productionReportError && (
          <Alert 
            type="error" 
            message="加载失败" 
            description={productionReportError}
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button size="small" onClick={() => {
                setProductionReportLoading(true);
                DataService.getProductionReports().then(result => {
                  if (result.success) {
                    setProductionReportData(result.data);
                    setProductionReportError(null);
                  } else {
                    setProductionReportError(result.error?.message);
                  }
                  setProductionReportLoading(false);
                });
              }}>
                重试
              </Button>
            }
          />
        )}
        
        {productionReportLoading ? (
          <Spin tip="加载中..." style={{ display: 'flex', justifyContent: 'center', padding: '50px' }} />
        ) : productionReportData.length === 0 ? (
          <Alert type="info" message="暂无生产报表数据" showIcon />
        ) : (
          <Table 
            dataSource={productionReportData.map((item, index) => ({ ...item, key: index }))} 
            columns={productionColumns}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card title="产量达成率">
            <Progress percent={95} status="active" />
            <p style={{ marginTop: '8px' }}>目标: 3000件 | 实际: 2850件</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="生产效率">
            <Progress percent={92} strokeColor="#52c41a" />
            <p style={{ marginTop: '8px' }}>平均效率: 92%</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="OEE指标">
            <Progress percent={89} strokeColor="#1890ff" />
            <p style={{ marginTop: '8px' }}>综合设备效率: 89%</p>
          </Card>
        </Col>
      </Row>

      <Card title="OEE趋势分析">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={productionTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey="OEE" stackId="1" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderQuality = () => (
    <div>
      <Card title="质量报表" style={{ marginBottom: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <RangePicker />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部产品</Option>
            <Option value="productA">产品A</Option>
            <Option value="productB">产品B</Option>
            <Option value="productC">产品C</Option>
          </Select>
          <Button type="primary" icon={<FileTextOutlined />}>生成报表</Button>
          <Button icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
        
        {qualityReportError && (
          <Alert 
            type="error" 
            message="加载失败" 
            description={qualityReportError}
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button size="small" onClick={() => {
                setQualityReportLoading(true);
                DataService.getQualityReports().then(result => {
                  if (result.success) {
                    setQualityReportData(result.data);
                    setQualityReportError(null);
                  } else {
                    setQualityReportError(result.error?.message);
                  }
                  setQualityReportLoading(false);
                });
              }}>
                重试
              </Button>
            }
          />
        )}
        
        {qualityReportLoading ? (
          <Spin tip="加载中..." style={{ display: 'flex', justifyContent: 'center', padding: '50px' }} />
        ) : qualityReportData.length === 0 ? (
          <Alert type="info" message="暂无质量报表数据" showIcon />
        ) : (
          <Table 
            dataSource={qualityReportData.map((item, index) => ({ ...item, key: index }))} 
            columns={qualityColumns}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card title="IQC合格率">
            <Progress percent={98.5} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="PQC合格率">
            <Progress percent={97.2} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="FQC合格率">
            <Progress percent={99.1} strokeColor="#722ed1" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="OQC合格率">
            <Progress percent={98.8} strokeColor="#fa8c16" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="CPK能力指数分析">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: '产品A', CPK: 1.33, 目标: 1.33 },
                { name: '产品B', CPK: 1.67, 目标: 1.33 },
                { name: '产品C', CPK: 1.45, 目标: 1.33 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="CPK" fill="#8884d8" />
                <Bar dataKey="目标" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="质量趋势分析">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { month: '1月', 合格率: 97.5, 不良率: 2.5 },
                { month: '2月', 合格率: 98.1, 不良率: 1.9 },
                { month: '3月', 合格率: 97.8, 不良率: 2.2 },
                { month: '4月', 合格率: 98.5, 不良率: 1.5 },
                { month: '5月', 合格率: 97.9, 不良率: 2.1 },
                { month: '6月', 合格率: 98.8, 不良率: 1.2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="合格率" stroke="#52c41a" strokeWidth={2} />
                <Line type="monotone" dataKey="不良率" stroke="#ff4d4f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderEquipment = () => (
    <div>
      <Card title="设备报表" style={{ marginBottom: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <RangePicker />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部设备</Option>
            <Option value="production">生产设备</Option>
            <Option value="auxiliary">辅助设备</Option>
          </Select>
          <Button type="primary" icon={<FileTextOutlined />}>生成报表</Button>
          <Button icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
        
        {equipmentReportError && (
          <Alert 
            type="error" 
            message="加载失败" 
            description={equipmentReportError}
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button size="small" onClick={() => {
                setEquipmentReportLoading(true);
                DataService.getEquipmentReports().then(result => {
                  if (result.success) {
                    setEquipmentReportData(result.data);
                    setEquipmentReportError(null);
                  } else {
                    setEquipmentReportError(result.error?.message);
                  }
                  setEquipmentReportLoading(false);
                });
              }}>
                重试
              </Button>
            }
          />
        )}
        
        {equipmentReportLoading ? (
          <Spin tip="加载中..." style={{ display: 'flex', justifyContent: 'center', padding: '50px' }} />
        ) : equipmentReportData.length === 0 ? (
          <Alert type="info" message="暂无设备报表数据" showIcon />
        ) : (
          <Table 
            dataSource={equipmentReportData.map((item, index) => ({ ...item, key: index }))} 
            columns={equipmentColumns}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card title="设备利用率" extra={<ToolOutlined />}>
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={91.7} />
              <p style={{ marginTop: '16px' }}>平均利用率</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="故障统计" extra={<WarningOutlined />}>
            <Statistic title="本月故障次数" value={8} suffix="次" />
            <Statistic title="平均修复时间" value={2.6} suffix="小时" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="维护计划" extra={<ClockCircleOutlined />}>
            <Statistic title="计划维护" value={12} suffix="项" />
            <Statistic title="完成率" value={91.7} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="设备利用率分析">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={equipmentUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="利用率" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="MTBF/MTTR分析">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { month: '1月', MTBF: 145, MTTR: 3.2 },
                { month: '2月', MTBF: 158, MTTR: 2.8 },
                { month: '3月', MTBF: 168, MTTR: 2.5 },
                { month: '4月', MTBF: 172, MTTR: 2.3 },
                { month: '5月', MTBF: 180, MTTR: 2.1 },
                { month: '6月', MTBF: 185, MTTR: 1.9 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="MTBF" stroke="#52c41a" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="MTTR" stroke="#ff4d4f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderInventory = () => (
    <div>
      <Card title="库存报表" style={{ marginBottom: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <RangePicker />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部物料</Option>
            <Option value="raw">原材料</Option>
            <Option value="semi">半成品</Option>
            <Option value="finished">成品</Option>
          </Select>
          <Button type="primary" icon={<FileTextOutlined />}>生成报表</Button>
          <Button icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
        <Table dataSource={inventoryData} columns={inventoryColumns} />
      </Card>

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card title="库存周转率">
            <Progress percent={75} strokeColor="#1890ff" />
            <p style={{ marginTop: '8px' }}>年平均周转: 8.7次</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="库存准确率">
            <Progress percent={99.2} strokeColor="#52c41a" />
            <p style={{ marginTop: '8px' }}>盘点准确率: 99.2%</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="呆滞库存">
            <Progress percent={15} strokeColor="#ff4d4f" />
            <p style={{ marginTop: '8px' }}>呆滞比例: 15%</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="库存周转率分析">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={inventoryTurnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="周转率" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="ABC分类分析">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'A类物料', value: 35, fill: '#8884d8' },
                    { name: 'B类物料', value: 40, fill: '#82ca9d' },
                    { name: 'C类物料', value: 25, fill: '#ffc658' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'A类物料', value: 35, fill: '#8884d8' },
                    { name: 'B类物料', value: 40, fill: '#82ca9d' },
                    { name: 'C类物料', value: 25, fill: '#ffc658' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderKPI = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="KPI仪表板">
            <Row gutter={16}>
              <Col span={4}>
                <Statistic title="生产达成率" value={95.2} suffix="%" />
              </Col>
              <Col span={4}>
                <Statistic title="质量合格率" value={97.8} suffix="%" />
              </Col>
              <Col span={4}>
                <Statistic title="设备利用率" value={91.7} suffix="%" />
              </Col>
              <Col span={4}>
                <Statistic title="库存周转率" value={8.7} suffix="次/年" />
              </Col>
              <Col span={4}>
                <Statistic title="交付及时率" value={98.5} suffix="%" />
              </Col>
              <Col span={4}>
                <Statistic title="成本控制率" value={102.3} suffix="%" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="月度KPI趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="生产达成率" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="质量合格率" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="设备利用率" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={
            <DepartmentKPITooltip department="生产部">
              <span style={{ cursor: 'help' }}>
                部门绩效对比 <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#1890ff' }} />
              </span>
            </DepartmentKPITooltip>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: '生产部', 绩效得分: 92, 目标: 90 },
                { name: '质量部', 绩效得分: 88, 目标: 85 },
                { name: '设备部', 绩效得分: 95, 目标: 90 },
                { name: '物流部', 绩效得分: 87, 目标: 85 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const department = label;
                      const score = payload.find(p => p.dataKey === '绩效得分')?.value;
                      const target = payload.find(p => p.dataKey === '目标')?.value;
                      
                      return (
                        <div style={{ 
                          backgroundColor: 'white', 
                          padding: '10px', 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {departmentKPIFormulas[department]?.title || `${department}绩效`}
                          </div>
                          <div style={{ marginBottom: '4px' }}>
                            绩效得分: {score}分
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            目标: {target}分
                          </div>
                          {departmentKPIFormulas[department] && (
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              <div style={{ marginBottom: '4px', color: '#1890ff' }}>
                                {departmentKPIFormulas[department].formula}
                              </div>
                              {departmentKPIFormulas[department].details.slice(0, 2).map((detail, index) => (
                                <div key={index} style={{ marginBottom: '2px' }}>
                                  • {detail}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="绩效得分" fill="#8884d8" />
                <Bar dataKey="目标" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderCustom = () => (
    <div>
      <Card title="自定义报表" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card title="报表模板" hoverable>
              <p>选择预定义的报表模板快速生成报表</p>
              <Button 
                type="primary" 
                block 
                onClick={() => setTemplateModalVisible(true)}
              >
                选择模板
              </Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="报表设计器" hoverable>
              <p>使用可视化设计器创建个性化报表</p>
              <Button 
                type="primary" 
                block 
                onClick={() => setDesignerModalVisible(true)}
              >
                打开设计器
              </Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="我的报表" hoverable>
              <p>管理已创建的自定义报表</p>
              <Button 
                type="primary" 
                block 
                onClick={() => setMyReportsModalVisible(true)}
              >
                查看报表
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="常用报表模板">
        <Row gutter={16}>
          <Col span={6}>
            <Button 
              type="dashed" 
              block 
              style={{ height: '80px' }}
              onClick={() => handleTemplateSelect(reportTemplates[0])}
            >
              <div>
                <FileTextOutlined style={{ fontSize: '24px', display: 'block' }} />
                生产日报
              </div>
            </Button>
          </Col>
          <Col span={6}>
            <Button 
              type="dashed" 
              block 
              style={{ height: '80px' }}
              onClick={() => handleTemplateSelect(reportTemplates[1])}
            >
              <div>
                <FileTextOutlined style={{ fontSize: '24px', display: 'block' }} />
                质量周报
              </div>
            </Button>
          </Col>
          <Col span={6}>
            <Button 
              type="dashed" 
              block 
              style={{ height: '80px' }}
              onClick={() => handleTemplateSelect(reportTemplates[2])}
            >
              <div>
                <FileTextOutlined style={{ fontSize: '24px', display: 'block' }} />
                设备月报
              </div>
            </Button>
          </Col>
          <Col span={6}>
            <Button 
              type="dashed" 
              block 
              style={{ height: '80px' }}
              onClick={() => handleTemplateSelect(reportTemplates[3])}
            >
              <div>
                <FileTextOutlined style={{ fontSize: '24px', display: 'block' }} />
                库存分析
              </div>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 报表模板选择模态框 */}
      <Modal
        title="选择报表模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={16}>
          {reportTemplates.map(template => (
            <Col span={12} key={template.id} style={{ marginBottom: '16px' }}>
              <Card 
                hoverable
                actions={[
                  <Button 
                    type="primary" 
                    onClick={() => handleTemplateSelect(template)}
                  >
                    使用模板
                  </Button>
                ]}
              >
                <Card.Meta
                  title={template.name}
                  description={
                    <div>
                      <p>{template.description}</p>
                      <Tag color="blue">{template.category}</Tag>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        预览: {template.preview}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* 报表设计器模态框 */}
      <Modal
        title="报表设计器"
        open={designerModalVisible}
        onCancel={() => setDesignerModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setDesignerModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary">
            保存设计
          </Button>
        ]}
      >
        <div style={{ padding: '20px', textAlign: 'center', minHeight: '400px' }}>
          <div style={{ border: '2px dashed #d9d9d9', padding: '40px', borderRadius: '6px' }}>
            <PlusOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <div style={{ marginTop: '16px', color: '#666' }}>
              <h3>可视化报表设计器</h3>
              <p>拖拽组件来设计您的报表</p>
              <p>支持图表、表格、文本等多种组件</p>
              <Button type="primary" style={{ marginTop: '16px' }}>
                开始设计
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 我的报表模态框 */}
      <Modal
        title="我的报表"
        open={myReportsModalVisible}
        onCancel={() => setMyReportsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setMyReportsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <List
          dataSource={customReports}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => message.info('预览报表功能')}
                >
                  预览
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => message.info('编辑报表功能')}
                >
                  编辑
                </Button>,
                item.status === '草稿' && (
                  <Button 
                    type="link" 
                    onClick={() => handlePublishReport(item.id)}
                  >
                    发布
                  </Button>
                ),
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteReport(item.id)}
                >
                  删除
                </Button>
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <div>
                    <Tag color={item.status === '已发布' ? 'green' : 'orange'}>
                      {item.status}
                    </Tag>
                    <span style={{ marginLeft: '8px' }}>
                      类型: {item.type} | 创建者: {item.creator} | 创建时间: {item.createTime}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 创建报表模态框 */}
      <Modal
        title="创建报表"
        open={createReportModalVisible}
        onCancel={() => {
          setCreateReportModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReport}
        >
          <Form.Item
            name="name"
            label="报表名称"
            rules={[{ required: true, message: '请输入报表名称' }]}
          >
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="报表类型"
            rules={[{ required: true, message: '请选择报表类型' }]}
          >
            <Select placeholder="请选择报表类型">
              <Select.Option value="生产报表">生产报表</Select.Option>
              <Select.Option value="质量报表">质量报表</Select.Option>
              <Select.Option value="设备报表">设备报表</Select.Option>
              <Select.Option value="库存报表">库存报表</Select.Option>
              <Select.Option value="KPI报表">KPI报表</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="template"
            label="基于模板"
          >
            <Input disabled placeholder="选择的模板" />
          </Form.Item>
          <Form.Item
            name="description"
            label="报表描述"
          >
            <Input.TextArea rows={3} placeholder="请输入报表描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // 标签页配置
  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <DashboardOutlined />
    },
    {
      key: 'dashboard',
      label: '综合看板',
      icon: <DashboardOutlined />
    },
    {
      key: 'production',
      label: '生产报表',
      icon: <TrophyOutlined />
    },
    {
      key: 'quality',
      label: '质量报表',
      icon: <CheckCircleOutlined />
    },
    {
      key: 'equipment',
      label: '设备报表',
      icon: <ToolOutlined />
    },
    {
      key: 'inventory',
      label: '库存报表',
      icon: <InboxOutlined />
    },
    {
      key: 'kpi',
      label: 'KPI分析',
      icon: <BarChartOutlined />
    },
    {
      key: 'custom',
      label: '自定义',
      icon: <FileTextOutlined />
    }
  ];

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'dashboard':
        return renderDashboard();
      case 'production':
        return renderProduction();
      case 'quality':
        return renderQuality();
      case 'equipment':
        return renderEquipment();
      case 'inventory':
        return renderInventory();
      case 'kpi':
        return renderKPI();
      case 'custom':
        return renderCustom();
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <style>
        {`
          .compact-tabs .ant-tabs-nav {
            margin-bottom: 8px;
          }
          .compact-tabs .ant-tabs-tab {
            padding: 8px 12px !important;
            margin: 0 2px !important;
            font-size: 14px !important;
            min-width: auto !important;
          }
          .compact-tabs .ant-tabs-tab-btn {
            font-size: 14px !important;
            white-space: nowrap;
          }
          .compact-tabs .ant-tabs-tab .anticon {
            font-size: 14px !important;
            margin-right: 4px !important;
          }
          .compact-tabs .ant-tabs-nav-wrap {
            overflow: visible !important;
          }
          .compact-tabs .ant-tabs-nav-list {
            transform: none !important;
          }
        `}
      </style>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="compact-tabs"
        tabBarStyle={{
          marginBottom: '8px',
          fontSize: '14px'
        }}
      />
      <div style={{ marginTop: '16px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SimpleReports;