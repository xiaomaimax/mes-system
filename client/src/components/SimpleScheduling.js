import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Tabs, Alert, Table, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm, Tooltip } from 'antd';

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
import { CalendarOutlined, DatabaseOutlined, ProjectOutlined, PlayCircleOutlined, FileTextOutlined, DownloadOutlined, UploadOutlined, EditOutlined, DeleteOutlined, PlusOutlined, WarningOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

const SimpleScheduling = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [materials, setMaterials] = useState([]);
  const [devices, setDevices] = useState([]);
  const [molds, setMolds] = useState([]);
  const [plans, setPlans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // 任务调整相关状态
  const [isTaskAdjustModalVisible, setIsTaskAdjustModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskAdjustForm] = Form.useForm();

  // 甘特图数据计算 (移到顶层以符合React Hooks规则)
  const ganttData = useMemo(() => {
    if (tasks.length === 0) return { deviceGroups: [], minTime: null, maxTime: null, totalHours: 0 };
    
    let minTime = null;
    let maxTime = null;
    
    tasks.forEach(task => {
      if (task.planned_start_time) {
        const start = moment(task.planned_start_time);
        if (!minTime || start.isBefore(minTime)) minTime = start.clone();
      }
      if (task.planned_end_time) {
        const end = moment(task.planned_end_time);
        if (!maxTime || end.isAfter(maxTime)) maxTime = end.clone();
      }
    });
    
    // 如果没有时间数据，使用默认范围
    if (!minTime) minTime = moment().startOf('day');
    if (!maxTime) maxTime = moment().add(7, 'days').endOf('day');
    
    // 扩展时间范围
    minTime = minTime.clone().subtract(2, 'hours');
    maxTime = maxTime.clone().add(2, 'hours');
    
    const totalHours = maxTime.diff(minTime, 'hours');
    
    // 按设备分组任务
    const deviceGroups = {};
    tasks.forEach(task => {
      const deviceId = task.device_id;
      const deviceName = task.Device?.device_name || `设备${deviceId}`;
      if (!deviceGroups[deviceId]) {
        deviceGroups[deviceId] = {
          deviceId,
          deviceName,
          tasks: []
        };
      }
      deviceGroups[deviceId].tasks.push(task);
    });
    
    return {
      deviceGroups: Object.values(deviceGroups),
      minTime,
      maxTime,
      totalHours
    };
  }, [tasks]);

  // 加载数据
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        safeMessage.error('认证失败，请重新登录');
        return;
      }
      
      // 加载物料
      const materialsRes = await fetch('/api/scheduling/materials?limit=1000');
      const materialsData = await materialsRes.json();
      if (materialsData.success) {
        setMaterials(materialsData.data || []);
      }
      
      // 加载设备 - 使用统一API
      const devicesRes = await fetch('/api/master-data/equipment?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const devicesData = await devicesRes.json();
      if (devicesData.success) {
        setDevices(devicesData.data || []);
      }
      
      // 加载模具
      const moldsRes = await fetch('/api/scheduling/molds?limit=1000');
      const moldsData = await moldsRes.json();
      if (moldsData.success) {
        setMolds(moldsData.data || []);
      }
      
      // 加载计划单
      const plansRes = await fetch(`/api/scheduling/plans?page=${pagination.current}&limit=${pagination.pageSize}`);
      const plansData = await plansRes.json();
      if (plansData.success) {
        setPlans(plansData.data || []);
        setPagination({ ...pagination, total: plansData.pagination?.total || 0 });
      }
      
      // 加载任务单
      const tasksRes = await fetch(`/api/scheduling/tasks?page=${pagination.current}&limit=${pagination.pageSize}`);
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setTasks(tasksData.data || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      safeMessage.error('加载数据失败，请检查后端服务是否运行');
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = () => {
    const totalPlans = plans.length;
    const unscheduledPlans = plans.filter(p => p.status === 'unscheduled').length;
    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(t => t.is_overdue).length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return {
      totalPlans,
      unscheduledPlans,
      totalTasks,
      overdueTasks,
      completedTasks
    };
  };

  const stats = calculateStats();

  // 执行排产
  const handleExecuteScheduling = async () => {
    Modal.confirm({
      title: '执行自动排产',
      content: '确定要执行自动排产吗？这将为所有未排产的计划单生成任务单。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/scheduling/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.json();
          if (data.success) {
            safeMessage.success(data.message);
            loadAllData();
          } else {
            safeMessage.error(data.message);
          }
        } catch (error) {
          safeMessage.error('执行排产失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 重置排程结果
  const handleResetScheduling = async () => {
    Modal.confirm({
      title: '重置排程结果',
      content: '确定要重置所有排程结果吗？这将删除所有任务单，并将计划单恢复到未排产状态。此操作不可撤销！',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/scheduling/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.json();
          if (data.success) {
            safeMessage.success(data.message);
            loadAllData();
          } else {
            safeMessage.error(data.message);
          }
        } catch (error) {
          safeMessage.error('重置排程失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 打开任务调整弹窗
  const handleOpenTaskAdjustModal = (task) => {
    setEditingTask(task);
    taskAdjustForm.setFieldsValue({
      device_id: task.device_id,
      mold_id: task.mold_id,
      task_quantity: task.task_quantity,
      planned_time: task.planned_start_time && task.planned_end_time 
        ? [moment(task.planned_start_time), moment(task.planned_end_time)]
        : null,
      status: task.status
    });
    setIsTaskAdjustModalVisible(true);
  };

  // 提交任务调整
  const handleTaskAdjustSubmit = async () => {
    try {
      const values = await taskAdjustForm.validateFields();
      setLoading(true);
      
      const updateData = {
        device_id: values.device_id,
        mold_id: values.mold_id,
        status: values.status
      };
      
      if (values.planned_time && values.planned_time.length === 2) {
        updateData.planned_start_time = values.planned_time[0].format('YYYY-MM-DD HH:mm:ss');
        updateData.planned_end_time = values.planned_time[1].format('YYYY-MM-DD HH:mm:ss');
      }
      
      const response = await fetch(`/api/scheduling/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      if (data.success) {
        safeMessage.success('任务单调整成功');
        setIsTaskAdjustModalVisible(false);
        setEditingTask(null);
        taskAdjustForm.resetFields();
        loadAllData();
      } else {
        safeMessage.error(data.message || '调整失败');
      }
    } catch (error) {
      safeMessage.error('调整失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除任务单
  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scheduling/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        safeMessage.success('任务单删除成功');
        loadAllData();
      } else {
        safeMessage.error(data.message || '删除失败');
      }
    } catch (error) {
      safeMessage.error('删除失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <CalendarOutlined />
    },
    {
      key: 'materials',
      label: '物料管理',
      icon: <DatabaseOutlined />
    },
    {
      key: 'devices',
      label: '设备管理',
      icon: <ProjectOutlined />
    },
    {
      key: 'molds',
      label: '模具管理',
      icon: <ProjectOutlined />
    },
    {
      key: 'plans',
      label: '计划单管理',
      icon: <FileTextOutlined />
    },
    {
      key: 'tasks',
      label: '任务单管理',
      icon: <CheckCircleOutlined />
    },
    {
      key: 'results',
      label: '排程结果',
      icon: <DownloadOutlined />
    },
    {
      key: 'gantt',
      label: '甘特图',
      icon: <BarChartOutlined />
    }
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    // 切换标签页时重新加载数据
    setTimeout(() => loadAllData(), 100);
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'materials':
        return renderMaterialsTab();
      case 'devices':
        return renderDevicesTab();
      case 'molds':
        return renderMoldsTab();
      case 'plans':
        return renderPlansTab();
      case 'tasks':
        return renderTasksTab();
      case 'results':
        return renderResultsTab();
      case 'gantt':
        return renderGanttTab();
      case 'overview':
      default:
        return renderOverview();
    }
  };

  // 概览页面
  const renderOverview = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>辅助排程概览</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            智能排程引擎，优化生产资源分配
          </p>
        </div>
        <Space size="large">
          <Button onClick={loadAllData} loading={loading}>
            刷新数据
          </Button>
          <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={handleExecuteScheduling} loading={loading}>
            执行自动排产
          </Button>
          <Button danger size="large" onClick={handleResetScheduling} loading={loading}>
            重置排程结果
          </Button>
          <Button size="large" icon={<DownloadOutlined />}>
            导出任务单
          </Button>
          <Button size="large" icon={<UploadOutlined />}>
            导入ERP
          </Button>
        </Space>
      </div>

      {stats.unscheduledPlans > 0 && (
        <Alert
          message="排程提醒"
          description={`当前有 ${stats.unscheduledPlans} 个未排产的计划单，${stats.overdueTasks} 个超期任务单需要处理！`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="link" onClick={() => setActiveTab('plans')}>
              查看详情
            </Button>
          }
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总计划单数"
              value={stats.totalPlans}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="未排产计划单"
              value={stats.unscheduledPlans}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务单数"
              value={stats.totalTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="超期任务单"
              value={stats.overdueTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="🎯 排程核心逻辑 (10条规则)" style={{ marginBottom: '24px', backgroundColor: '#fafafa' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px', borderLeft: '4px solid #1890ff' }}>
              <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>1️⃣ 交期优先</div>
              <div style={{ fontSize: '12px', color: '#666' }}>所有排程决策以满足交期为首要目标</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#f6ffed', borderRadius: '4px', borderLeft: '4px solid #52c41a' }}>
              <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>2️⃣ 设备权重优先</div>
              <div style={{ fontSize: '12px', color: '#666' }}>权重高的设备优先选择</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#fff7e6', borderRadius: '4px', borderLeft: '4px solid #faad14' }}>
              <div style={{ fontWeight: 'bold', color: '#faad14', marginBottom: '4px' }}>3️⃣ 模具权重优先</div>
              <div style={{ fontSize: '12px', color: '#666' }}>权重高的模具优先选择</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#f9f0ff', borderRadius: '4px', borderLeft: '4px solid #722ed1' }}>
              <div style={{ fontWeight: 'bold', color: '#722ed1', marginBottom: '4px' }}>4️⃣ 模具-设备独占性</div>
              <div style={{ fontSize: '12px', color: '#666' }}>同一模具同一时间只能分配到一台设备</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#fff1f0', borderRadius: '4px', borderLeft: '4px solid #f5222d' }}>
              <div style={{ fontWeight: 'bold', color: '#f5222d', marginBottom: '4px' }}>5️⃣ 模具-设备绑定</div>
              <div style={{ fontSize: '12px', color: '#666' }}>单副模具一旦分配，后续必须分配到同一设备</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#e6f4ff', borderRadius: '4px', borderLeft: '4px solid #1677dd' }}>
              <div style={{ fontWeight: 'bold', color: '#1677dd', marginBottom: '4px' }}>6️⃣ 同物料一致性</div>
              <div style={{ fontSize: '12px', color: '#666' }}>相同物料优先分配到同一设备和模具</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '4px', borderLeft: '4px solid #2f54eb' }}>
              <div style={{ fontWeight: 'bold', color: '#2f54eb', marginBottom: '4px' }}>7️⃣ 同模具一致性</div>
              <div style={{ fontSize: '12px', color: '#666' }}>使用相同模具的计划单优先分配到同一设备</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#fffbe6', borderRadius: '4px', borderLeft: '4px solid #fadb14' }}>
              <div style={{ fontWeight: 'bold', color: '#fadb14', marginBottom: '4px' }}>8️⃣ 计划单唯一性</div>
              <div style={{ fontSize: '12px', color: '#666' }}>每个计划单完整分配到一台设备和一副模具</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '4px', borderLeft: '4px solid #13c2c2' }}>
              <div style={{ fontWeight: 'bold', color: '#13c2c2', marginBottom: '4px' }}>9️⃣ 同模多物料同步</div>
              <div style={{ fontSize: '12px', color: '#666' }}>使用同一模具生产多种物料需同步生产</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <div style={{ padding: '12px', backgroundColor: '#f6f8fb', borderRadius: '4px', borderLeft: '4px solid #1890ff' }}>
              <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>🔟 多模具灵活排程</div>
              <div style={{ fontSize: '12px', color: '#666' }}>交期不足时可灵活选择其他设备和模具</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="最近计划单" style={{ height: '400px', overflow: 'auto' }}>
            <Table
              columns={[
                { title: '计划单号', dataIndex: 'plan_number', key: 'plan_number' },
                { title: '物料', dataIndex: ['Material', 'material_name'], key: 'material_name' },
                { title: '数量', dataIndex: 'planned_quantity', key: 'planned_quantity' },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusMap = {
                      unscheduled: { text: '未排产', color: 'warning' },
                      scheduled: { text: '已排产', color: 'success' },
                      cancelled: { text: '已取消', color: 'error' }
                    };
                    const s = statusMap[status] || { text: status, color: 'default' };
                    return <Tag color={s.color}>{s.text}</Tag>;
                  }
                }
              ]}
              dataSource={plans.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近任务单" style={{ height: '400px', overflow: 'auto' }}>
            <Table
              columns={[
                { title: '任务单号', dataIndex: 'task_number', key: 'task_number' },
                { title: '设备', dataIndex: ['Device', 'device_name'], key: 'device_name' },
                { title: '数量', dataIndex: 'task_quantity', key: 'task_quantity' },
                {
                  title: '超期',
                  dataIndex: 'is_overdue',
                  key: 'is_overdue',
                  render: (isOverdue) => (
                    <Tag color={isOverdue ? 'red' : 'green'}>
                      {isOverdue ? '是' : '否'}
                    </Tag>
                  )
                }
              ]}
              dataSource={tasks.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // 物料管理标签页
  const renderMaterialsTab = () => (
    <Card title="物料管理" extra={<Button type="primary" icon={<PlusOutlined />}>新增物料</Button>}>
      <Table
        columns={[
          { title: '物料编号', dataIndex: 'material_code', key: 'material_code' },
          { title: '物料名称', dataIndex: 'material_name', key: 'material_name' },
          { title: '物料类型', dataIndex: 'material_type', key: 'material_type' },
          { title: '规格型号', dataIndex: 'specifications', key: 'specifications' },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
              <Tag color={status === 'active' ? 'green' : 'red'}>
                {status === 'active' ? '正常' : '停用'}
              </Tag>
            )
          },
          {
            title: '操作',
            key: 'action',
            render: () => (
              <Space size="small">
                <Button type="primary" size="small" icon={<EditOutlined />}>编辑</Button>
                <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
              </Space>
            )
          }
        ]}
        dataSource={materials}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  // 设备管理标签页
  const renderDevicesTab = () => (
    <Card title="设备管理" extra={<Button type="primary" icon={<PlusOutlined />}>新增设备</Button>}>
      <Table
        columns={[
          { title: '设备编号', dataIndex: 'equipment_code', key: 'equipment_code' },
          { title: '设备名称', dataIndex: 'equipment_name', key: 'equipment_name' },
          { title: '规格型号', dataIndex: 'model', key: 'model' },
          { title: '产能/小时', dataIndex: ['scheduling', 'capacity_per_hour'], key: 'capacity_per_hour' },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
              const statusMap = {
                running: { text: '运行中', color: 'green' },
                idle: { text: '空闲', color: 'blue' },
                maintenance: { text: '维护中', color: 'orange' },
                fault: { text: '故障', color: 'red' },
                offline: { text: '离线', color: 'default' },
                // 兼容旧状态
                normal: { text: '正常', color: 'green' },
                scrapped: { text: '报废', color: 'red' }
              };
              const s = statusMap[status] || { text: status, color: 'default' };
              return <Tag color={s.color}>{s.text}</Tag>;
            }
          },
          {
            title: '操作',
            key: 'action',
            render: () => (
              <Space size="small">
                <Button type="primary" size="small" icon={<EditOutlined />}>编辑</Button>
                <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
              </Space>
            )
          }
        ]}
        dataSource={devices}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  // 模具管理标签页
  const renderMoldsTab = () => (
    <Card title="模具管理" extra={<Button type="primary" icon={<PlusOutlined />}>新增模具</Button>}>
      <Table
        columns={[
          { title: '模具编号', dataIndex: 'mold_code', key: 'mold_code' },
          { title: '模具名称', dataIndex: 'mold_name', key: 'mold_name' },
          { title: '规格型号', dataIndex: 'specifications', key: 'specifications' },
          { title: '数量', dataIndex: 'quantity', key: 'quantity' },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
              const statusMap = {
                normal: { text: '正常', color: 'green' },
                maintenance: { text: '维修', color: 'orange' },
                idle: { text: '闲置', color: 'blue' },
                scrapped: { text: '报废', color: 'red' }
              };
              const s = statusMap[status] || { text: status, color: 'default' };
              return <Tag color={s.color}>{s.text}</Tag>;
            }
          },
          {
            title: '操作',
            key: 'action',
            render: () => (
              <Space size="small">
                <Button type="primary" size="small" icon={<EditOutlined />}>编辑</Button>
                <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
              </Space>
            )
          }
        ]}
        dataSource={molds}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  // 计划单管理标签页
  const renderPlansTab = () => (
    <Card title="计划单管理" extra={
      <Space>
        <Button type="primary" icon={<PlusOutlined />}>新增计划单</Button>
        <Button icon={<UploadOutlined />}>批量导入</Button>
      </Space>
    }>
      <Table
        columns={[
          { title: '计划单号', dataIndex: 'plan_number', key: 'plan_number', width: 120 },
          { title: '物料编号', dataIndex: ['Material', 'material_code'], key: 'material_code', width: 120 },
          { title: '物料名称', dataIndex: ['Material', 'material_name'], key: 'material_name', width: 150 },
          { title: '计划数量', dataIndex: 'planned_quantity', key: 'planned_quantity', width: 100 },
          {
            title: '交期',
            dataIndex: 'due_date',
            key: 'due_date',
            width: 150,
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
          },
          {
            title: '工艺编码',
            dataIndex: 'process_route_number',
            key: 'process_route_number',
            width: 120
          },
          {
            title: '订单编号',
            dataIndex: 'order_number',
            key: 'order_number',
            width: 120
          },
          {
            title: '客户',
            dataIndex: 'customer',
            key: 'customer',
            width: 100
          },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
              const statusMap = {
                unscheduled: { text: '未排产', color: 'warning' },
                scheduled: { text: '已排产', color: 'success' },
                cancelled: { text: '已取消', color: 'error' }
              };
              const s = statusMap[status] || { text: status, color: 'default' };
              return <Tag color={s.color}>{s.text}</Tag>;
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            render: () => (
              <Space size="small">
                <Button type="primary" size="small" icon={<EditOutlined />}>编辑</Button>
                <Popconfirm title="确定删除?" okText="是" cancelText="否">
                  <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={plans}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize, total: pagination.total });
          }
        }}
        scroll={{ x: 1600 }}
      />
    </Card>
  );

  // 任务单管理标签页
  const renderTasksTab = () => (
    <Card title="任务单管理" extra={
      <Space>
        <Button icon={<DownloadOutlined />}>导出Excel</Button>
        <Button icon={<UploadOutlined />}>导入ERP</Button>
      </Space>
    }>
      <Table
        columns={[
          { title: '任务单号', dataIndex: 'task_number', key: 'task_number' },
          { title: '计划单号', dataIndex: ['ProductionPlan', 'plan_number'], key: 'plan_number' },
          { title: '物料', dataIndex: ['ProductionPlan', 'Material', 'material_name'], key: 'material_name' },
          { title: '设备', dataIndex: ['Device', 'device_name'], key: 'device_name' },
          { title: '模具', dataIndex: ['Mold', 'mold_name'], key: 'mold_name' },
          { title: '数量', dataIndex: 'task_quantity', key: 'task_quantity' },
          {
            title: '超期',
            dataIndex: 'is_overdue',
            key: 'is_overdue',
            render: (isOverdue) => (
              <Tag color={isOverdue ? 'red' : 'green'}>
                {isOverdue ? '是' : '否'}
              </Tag>
            )
          },
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Space size="small">
                <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleOpenTaskAdjustModal(record)}>调整</Button>
                <Popconfirm title="确定删除?" okText="是" cancelText="否" onConfirm={() => handleDeleteTask(record.id)}>
                  <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize, total: pagination.total });
          }
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  // 排程结果标签页
  const renderResultsTab = () => (
    <Card title="排程结果展示">
      <Alert
        message="排程结果统计"
        description={`总任务单数: ${stats.totalTasks} | 超期任务单: ${stats.overdueTasks} | 已完成: ${stats.completedTasks}`}
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      <Table
        columns={[
          { title: '任务单号', dataIndex: 'task_number', key: 'task_number' },
          { title: '设备', dataIndex: ['Device', 'device_name'], key: 'device_name' },
          { title: '模具', dataIndex: ['Mold', 'mold_name'], key: 'mold_name' },
          {
            title: '计划开始',
            dataIndex: 'planned_start_time',
            key: 'planned_start_time',
            render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'
          },
          {
            title: '计划结束',
            dataIndex: 'planned_end_time',
            key: 'planned_end_time',
            render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-'
          },
          {
            title: '排程原因',
            dataIndex: 'scheduling_reason',
            key: 'scheduling_reason',
            render: (reason) => (
              <div style={{ fontSize: '12px', color: '#666', maxWidth: '250px', wordWrap: 'break-word' }}>
                {reason || '8️⃣ 计划单唯一性 - 每个计划单完整分配到一台设备和一副模具'}
              </div>
            )
          },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
              const statusMap = {
                pending: { text: '待执行', color: 'default' },
                in_progress: { text: '执行中', color: 'processing' },
                completed: { text: '已完成', color: 'success' },
                cancelled: { text: '已取消', color: 'error' }
              };
              const s = statusMap[status] || { text: status, color: 'default' };
              return <Tag color={s.color}>{s.text}</Tag>;
            }
          }
        ]}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );

  // 甘特图标签页
  const renderGanttTab = () => {
    const { deviceGroups, minTime, maxTime, totalHours } = ganttData;

    // 生成时间刻度
    const timeMarkers = [];
    if (minTime && totalHours > 0) {
      const step = totalHours > 48 ? 12 : totalHours > 24 ? 6 : 2;
      for (let i = 0; i <= totalHours; i += step) {
        timeMarkers.push(minTime.clone().add(i, 'hours'));
      }
    }

    // 计算任务条位置和宽度
    const getTaskStyle = (task) => {
      if (!task.planned_start_time || !task.planned_end_time || !minTime || totalHours === 0) {
        return { left: '0%', width: '10%' };
      }
      
      const start = moment(task.planned_start_time);
      const end = moment(task.planned_end_time);
      const startOffset = start.diff(minTime, 'hours', true);
      const duration = end.diff(start, 'hours', true);
      
      const left = (startOffset / totalHours) * 100;
      const width = (duration / totalHours) * 100;
      
      return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.max(2, Math.min(width, 100 - left))}%`
      };
    };

    // 获取任务颜色
    const getTaskColor = (task) => {
      if (task.is_overdue) return '#ff4d4f';
      if (task.status === 'completed') return '#52c41a';
      if (task.status === 'in_progress') return '#1890ff';
      return '#1890ff';
    };

    return (
      <Card title="排程甘特图" extra={
        <Space>
          <Button onClick={loadAllData} loading={loading}>刷新</Button>
          <Button type="primary" onClick={() => setActiveTab('tasks')}>返回任务列表</Button>
        </Space>
      }>
        {tasks.length === 0 ? (
          <Alert
            message="暂无排程数据"
            description="请先执行自动排产生成任务单，然后查看甘特图"
            type="info"
            showIcon
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* 时间轴头部 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', marginBottom: '8px' }}>
              <div style={{ width: '150px', flexShrink: 0, padding: '8px', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                设备
              </div>
              <div style={{ flex: 1, position: 'relative', height: '40px', backgroundColor: '#fafafa' }}>
                {timeMarkers.map((time, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${(index / (timeMarkers.length - 1 || 1)) * 100}%`,
                      transform: 'translateX(-50%)',
                      fontSize: '11px',
                      color: '#666',
                      whiteSpace: 'nowrap',
                      padding: '8px 0'
                    }}
                  >
                    {time.format('MM-DD HH:mm')}
                  </div>
                ))}
              </div>
            </div>

            {/* 设备行 */}
            {deviceGroups.map((group) => (
              <div key={group.deviceId} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: '50px' }}>
                <div style={{ 
                  width: '150px', 
                  flexShrink: 0, 
                  padding: '8px', 
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500
                }}>
                  {group.deviceName}
                </div>
                <div style={{ flex: 1, position: 'relative', padding: '4px 0' }}>
                  {/* 背景网格线 */}
                  {timeMarkers.map((_, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        left: `${(index / (timeMarkers.length - 1 || 1)) * 100}%`,
                        top: 0,
                        bottom: 0,
                        borderLeft: '1px dashed #e8e8e8'
                      }}
                    />
                  ))}
                  
                  {/* 任务条 */}
                  {group.tasks.map((task) => {
                    const style = getTaskStyle(task);
                    const color = getTaskColor(task);
                    return (
                      <Tooltip
                        key={task.id}
                        title={
                          <div>
                            <div><strong>{task.task_number}</strong></div>
                            <div>物料: {task.ProductionPlan?.Material?.material_name || '-'}</div>
                            <div>模具: {task.Mold?.mold_name || '-'}</div>
                            <div>数量: {task.task_quantity}</div>
                            <div>开始: {task.planned_start_time ? moment(task.planned_start_time).format('MM-DD HH:mm') : '-'}</div>
                            <div>结束: {task.planned_end_time ? moment(task.planned_end_time).format('MM-DD HH:mm') : '-'}</div>
                            <div>排程原因: {task.scheduling_reason || '-'}</div>
                          </div>
                        }
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: style.left,
                            width: style.width,
                            top: '4px',
                            height: '36px',
                            backgroundColor: color,
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '2px 6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onClick={() => handleOpenTaskAdjustModal(task)}
                        >
                          {task.task_number}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 图例 */}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
              <Space size="large">
                <span><span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#1890ff', borderRadius: '2px', marginRight: '4px', verticalAlign: 'middle' }}></span> 待执行</span>
                <span><span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#52c41a', borderRadius: '2px', marginRight: '4px', verticalAlign: 'middle' }}></span> 已完成</span>
                <span><span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#ff4d4f', borderRadius: '2px', marginRight: '4px', verticalAlign: 'middle' }}></span> 超期</span>
              </Space>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                提示: 点击任务条可以调整任务
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: '0' }}>
      <Card style={{ marginBottom: '0' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          style={{ marginTop: '-16px' }}
        />
        <div style={{ marginTop: '24px' }}>
          {renderTabContent()}
        </div>
      </Card>

      {/* 任务调整弹窗 */}
      <Modal
        title="调整任务单"
        open={isTaskAdjustModalVisible}
        onOk={handleTaskAdjustSubmit}
        onCancel={() => {
          setIsTaskAdjustModalVisible(false);
          setEditingTask(null);
          taskAdjustForm.resetFields();
        }}
        confirmLoading={loading}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        {editingTask && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div><strong>任务单号:</strong> {editingTask.task_number}</div>
                <div><strong>计划单号:</strong> {editingTask.ProductionPlan?.plan_number || '-'}</div>
              </Col>
              <Col span={12}>
                <div><strong>物料:</strong> {editingTask.ProductionPlan?.Material?.material_name || '-'}</div>
                <div><strong>数量:</strong> {editingTask.task_quantity}</div>
              </Col>
            </Row>
          </div>
        )}
        <Form
          form={taskAdjustForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="device_id"
                label="分配设备"
                rules={[{ required: true, message: '请选择设备' }]}
              >
                <Select placeholder="选择设备">
                  {devices.filter(d => d.is_active).map(device => (
                    <Select.Option key={device.id} value={device.id}>
                      {device.equipment_name} ({device.equipment_code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mold_id"
                label="分配模具"
                rules={[{ required: true, message: '请选择模具' }]}
              >
                <Select placeholder="选择模具">
                  {molds.filter(m => m.status === 'normal').map(mold => (
                    <Select.Option key={mold.id} value={mold.id}>
                      {mold.mold_name} ({mold.mold_code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="planned_time"
            label="计划时间"
          >
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder={['计划开始时间', '计划结束时间']}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="任务状态"
          >
            <Select placeholder="选择状态">
              <Select.Option value="pending">待执行</Select.Option>
              <Select.Option value="in_progress">执行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SimpleScheduling;
