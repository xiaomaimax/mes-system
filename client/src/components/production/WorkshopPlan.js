import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, message, Spin, Alert, Modal } from 'antd';

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
import { PlusOutlined, SearchOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';
import moment from 'moment';

const { Option } = Select;

const WorkshopPlan = () => {
  const [planData, setPlanData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tasksByPlanId, setTasksByPlanId] = useState({});

  // 使用 DataService 获取生产计划数据
  // Requirements: 2.1, 2.5
  const { 
    data: plansData, 
    loading: plansLoading, 
    error: plansError, 
    refetch: refetchPlans 
  } = useDataService(
    () => DataService.getProductionPlans(),
    [],
    { useCache: true, cacheKey: 'production_plans' }
  );

  // 使用 DataService 获取生产任务数据
  // Requirements: 2.1, 2.5
  const { 
    data: tasksData, 
    loading: tasksLoading, 
    error: tasksError 
  } = useDataService(
    () => DataService.getProductionTasks(),
    [],
    { useCache: true, cacheKey: 'production_tasks' }
  );

  // 处理数据转换
  useEffect(() => {
    if (plansData && Array.isArray(plansData)) {
      // 构建任务单映射，用于查询计划单对应的任务单
      const taskMap = {};
      if (tasksData && Array.isArray(tasksData)) {
        tasksData.forEach(task => {
          const planId = task.plan_id;
          if (!taskMap[planId]) {
            taskMap[planId] = [];
          }
          taskMap[planId].push(task);
        });
      }
      setTasksByPlanId(taskMap);

      // 转换排程计划单数据为车间计划格式
      const convertedPlans = plansData.map((plan, index) => {
        const material = plan.Material || {};

        // 根据任务单的超期字段判定优先级
        let priority = 'normal';
        const planTasks = taskMap[plan.id] || [];
        if (planTasks.length > 0) {
          // 如果有任何任务单超期，则优先级为高
          if (planTasks.some(task => task.is_overdue)) {
            priority = 'high';
          }
        }

        return {
          key: plan.id || index,
          planNumber: plan.plan_number || '-', // 计划单号
          materialCode: material.material_code || '-', // 物料编号
          materialName: material.material_name || '未知物料', // 物料名称
          plannedQuantity: plan.planned_quantity || 0, // 计划数量
          dueDate: plan.due_date || '-', // 交期
          processRouteNumber: plan.process_route_number || '-', // 工艺路线号
          orderNumber: plan.order_number || '-', // 订单编号
          customer: plan.customer || '-', // 客户
          workshopName: '注塑车间', // 车间名称（默认）
          priority: priority, // 优先级（根据任务单超期字段判定）
          progress: 0, // 进度（默认）
          status: plan.status || 'unscheduled', // 状态
          // 保存原始数据用于后续操作
          _originalPlan: plan
        };
      });

      setPlanData(convertedPlans);
      setFilteredData(convertedPlans);
    }
  }, [plansData, tasksData]);

  // 删除计划
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除计划单"${record.planNumber}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await DataService.deleteProductionPlan(record.key);
          if (result.success) {
            safeMessage.success('删除成功');
            refetchPlans();
          } else {
            safeMessage.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          safeMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  // 编辑计划
  const handleEdit = (record) => {
    try {
      // 这里可以添加编辑逻辑
      message.info('编辑功能开发中');
    } catch (error) {
      console.error('编辑失败:', error);
      safeMessage.error('编辑失败: ' + (error.message || '未知错误'));
    }
  };

  // 新建计划
  const handleAdd = () => {
    try {
      // 这里可以添加新建逻辑
      message.info('新建功能开发中');
    } catch (error) {
      console.error('新建失败:', error);
      safeMessage.error('新建失败: ' + (error.message || '未知错误'));
    }
  };

  // 搜索和过滤
  const handleSearch = () => {
    let filtered = planData;

    if (searchText) {
      filtered = filtered.filter(plan =>
        plan.planNumber.includes(searchText) ||
        plan.materialCode.includes(searchText) ||
        plan.materialName.includes(searchText)
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(plan => plan.status === selectedStatus);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedStatus(null);
    setFilteredData(planData);
  };

  // 监听过滤条件变化
  useEffect(() => {
    handleSearch();
  }, [searchText, selectedStatus, planData]);

  const columns = [
    {
      title: '计划单号',
      dataIndex: 'planNumber',
      key: 'planNumber',
      width: 120,
      fixed: 'left'
    },
    {
      title: '物料编号',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 150,
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '交期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date) => {
        if (!date || date === '-') return '-';
        return moment(date).format('YYYY-MM-DD HH:mm');
      }
    },
    {
      title: '工艺编码',
      dataIndex: 'processRouteNumber',
      key: 'processRouteNumber',
      width: 120,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '车间名称',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 100,
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
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 80,
      render: (progress) => `${progress}%`
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
          cancelled: { text: '已取消', color: 'error' },
          pending: { color: 'orange', text: '待开始' },
          in_progress: { color: 'blue', text: '进行中' },
          completed: { color: 'green', text: '已完成' }
        };
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const loading = plansLoading || tasksLoading;
  const error = plansError || tasksError;

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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建计划
          </Button>
        }
      >
        {/* 错误提示 */}
        {error && (
          <Alert
            message="数据加载失败"
            description={error.message || '获取生产计划数据失败，请稍后重试'}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={refetchPlans}>
                重试
              </Button>
            }
          />
        )}

        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索计划单号/物料编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select 
              placeholder="选择状态" 
              style={{ width: 120 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
            >
              <Option value="unscheduled">未排产</Option>
              <Option value="scheduled">已排产</Option>
              <Option value="cancelled">已取消</Option>
              <Option value="pending">待开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Spin spinning={loading}>
          {filteredData.length === 0 && !loading ? (
            <Alert
              message="暂无数据"
              description="当前没有生产计划数据"
              type="info"
              showIcon
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1400 }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default WorkshopPlan;