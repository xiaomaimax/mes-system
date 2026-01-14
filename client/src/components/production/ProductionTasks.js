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
import { PlusOutlined, SearchOutlined, ProjectOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';

const { Option } = Select;

const ProductionTasks = () => {
  const [taskData, setTaskData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);

  // 使用 DataService 获取生产任务数据
  // Requirements: 2.2, 2.5
  const { 
    data: tasksData, 
    loading, 
    error, 
    refetch 
  } = useDataService(
    () => DataService.getProductionTasks(),
    [],
    { useCache: true, cacheKey: 'production_tasks' }
  );

  // 处理数据转换
  useEffect(() => {
    if (tasksData && Array.isArray(tasksData)) {
      // 转换排程任务数据为生产任务格式（与任务单管理字段保持一致）
      const convertedTasks = tasksData.map((task, index) => {
        const material = task.ProductionPlan?.Material || {};
        const device = task.Device || {};
        const mold = task.Mold || {};

        // 根据超期字段判定优先级
        let priority = 'normal';
        if (task.is_overdue) {
          priority = 'high';
        }

        return {
          key: task.id || index,
          taskNumber: task.task_number || `PT-${task.id}`, // 任务单号
          planNumber: task.ProductionPlan?.plan_number || '-', // 计划单号
          productInfo: `${material.material_name || '未知产品'} (${material.material_code || 'N/A'})`, // 产品信息&物料
          device: device.device_name || '-', // 设备
          mold: mold.mold_name || '-', // 模具
          quantity: task.task_quantity || task.ProductionPlan?.planned_quantity || 0, // 数量
          isOverdue: task.is_overdue || false, // 超期
          plannedStartTime: task.planned_start_time || '-',
          plannedEndTime: task.planned_end_time || '-',
          status: task.status || 'pending',
          priority: priority,
          // 保存原始数据用于后续操作
          _originalTask: task
        };
      });

      setTaskData(convertedTasks);
      setFilteredData(convertedTasks);
    }
  }, [tasksData]);

  // 删除任务
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务单"${record.taskNumber}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await DataService.deleteProductionTask(record.key);
          if (result.success) {
            safeMessage.success('删除成功');
            refetch();
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

  // 编辑任务
  const handleEdit = (record) => {
    try {
      // 这里可以添加编辑逻辑
      message.info('编辑功能开发中');
    } catch (error) {
      console.error('编辑失败:', error);
      safeMessage.error('编辑失败: ' + (error.message || '未知错误'));
    }
  };

  // 新建任务
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
    let filtered = taskData;

    if (searchText) {
      filtered = filtered.filter(task =>
        task.taskNumber.includes(searchText) ||
        task.planNumber.includes(searchText) ||
        task.productInfo.includes(searchText)
      );
    }

    if (selectedWorkshop) {
      filtered = filtered.filter(task => task.device === selectedWorkshop);
    }

    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedWorkshop(null);
    setSelectedStatus(null);
    setSelectedPriority(null);
    setFilteredData(taskData);
  };

  // 监听过滤条件变化
  useEffect(() => {
    handleSearch();
  }, [searchText, selectedWorkshop, selectedStatus, selectedPriority, taskData]);

  const columns = [
    {
      title: '任务单号',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120,
      fixed: 'left'
    },
    {
      title: '计划单号',
      dataIndex: 'planNumber',
      key: 'planNumber',
      width: 120,
    },
    {
      title: '产品信息&物料',
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 180,
    },
    {
      title: '设备',
      dataIndex: 'device',
      key: 'device',
      width: 120,
    },
    {
      title: '模具',
      dataIndex: 'mold',
      key: 'mold',
      width: 120,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '超期',
      dataIndex: 'isOverdue',
      key: 'isOverdue',
      width: 80,
      render: (isOverdue) => (
        <Tag color={isOverdue ? 'red' : 'green'}>
          {isOverdue ? '是' : '否'}
        </Tag>
      )
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
          cancelled: { color: 'red', text: '已取消' },
          unscheduled: { color: 'default', text: '未排产' },
          scheduled: { color: 'cyan', text: '已排产' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建任务
          </Button>
        }
      >
        {/* 错误提示 */}
        {error && (
          <Alert
            message="数据加载失败"
            description={error.message || '获取生产任务数据失败，请稍后重试'}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={refetch}>
                重试
              </Button>
            }
          />
        )}

        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索任务单号/计划单号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select 
              placeholder="选择设备" 
              style={{ width: 150 }}
              value={selectedWorkshop}
              onChange={setSelectedWorkshop}
              allowClear
            >
              <Option value="注塑机1号">注塑机1号</Option>
              <Option value="注塑机2号">注塑机2号</Option>
              <Option value="注塑机4号">注塑机4号</Option>
              <Option value="注塑机5号">注塑机5号</Option>
            </Select>
            <Select 
              placeholder="选择状态" 
              style={{ width: 120 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
            >
              <Option value="pending">待开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="paused">已暂停</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
              <Option value="scheduled">已排产</Option>
              <Option value="unscheduled">未排产</Option>
            </Select>
            <Select 
              placeholder="优先级" 
              style={{ width: 100 }}
              value={selectedPriority}
              onChange={setSelectedPriority}
              allowClear
            >
              <Option value="high">高</Option>
              <Option value="normal">中</Option>
              <Option value="low">低</Option>
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
              description="当前没有生产任务数据"
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

export default ProductionTasks;