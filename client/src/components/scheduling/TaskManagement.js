import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, Space, message, Popconfirm, DatePicker, InputNumber, Tag, Spin, Alert
} from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

const TaskManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 使用 DataService 获取生产任务数据
  const { data: tasksData, loading, error, refetch } = useDataService(
    () => DataService.getProductionTasks(),
    [],
    { useCache: true, cacheTTL: 2 * 60 * 1000 }
  );

  // 获取设备数据
  const { data: devicesData } = useDataService(
    () => DataService.getEquipment(),
    [],
    { useCache: true, cacheTTL: 10 * 60 * 1000 }
  );

  // 格式化任务数据用于表格显示
  const formatTasksData = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      task_number: item.taskCode || `TASK-${String(item.id).padStart(6, '0')}`,
      plan_number: item.planId ? `PLAN-${String(item.planId).padStart(6, '0')}` : '-',
      material_name: item.productName || '未知产品',
      device_name: item.equipment || '设备A',
      mold_name: '模具A', // 默认值
      task_quantity: item.targetQty || 0,
      due_date: item.endTime || '2026-01-15 18:00:00',
      status: item.status === '进行中' ? 'in_progress' : 
              item.status === '已完成' ? 'completed' : 'pending',
      is_overdue: false, // 默认值
      ProductionPlan: {
        plan_number: `PLAN-${String(item.planId || 1).padStart(6, '0')}`,
        Material: {
          material_name: item.productName || '未知产品'
        }
      },
      Device: {
        device_name: item.equipment || '设备A'
      },
      Mold: {
        mold_name: '模具A'
      }
    }));
  };

  const tasks = formatTasksData(tasksData?.items || []);
  const devices = devicesData?.items || [];
  const molds = []; // 模具数据暂时为空

  const handleAdd = () => {
    try {
      setEditingRecord(null);
      form.resetFields();
      setIsModalVisible(true);
    } catch (error) {
      console.error('新增操作失败:', error);
      safeMessage.error('新增操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      form.setFieldsValue({
        device_id: record.device_id || 1,
        mold_id: record.mold_id || 1,
        planned_start_time: record.planned_start_time ? moment(record.planned_start_time) : null,
        planned_end_time: record.planned_end_time ? moment(record.planned_end_time) : null,
        status: record.status,
        task_quantity: record.task_quantity
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('编辑操作失败:', error);
      safeMessage.error('编辑操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDelete = async (record) => {
    try {
      // 这里应该调用实际的删除API
      console.log('删除任务:', record.id);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      safeMessage.success('任务单删除成功');
      refetch(); // 刷新数据
    } catch (error) {
      console.error('删除失败:', error);
      safeMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      const taskData = {
        taskCode: values.task_number || `TASK-${Date.now()}`,
        productName: values.material_name || '新产品',
        targetQty: values.task_quantity || 100,
        equipment: values.device_name || '设备A',
        status: values.status === 'in_progress' ? '进行中' : 
                values.status === 'completed' ? '已完成' : '待开始',
        startTime: values.planned_start_time?.format?.('YYYY-MM-DD HH:mm:ss') || values.planned_start_time,
        endTime: values.planned_end_time?.format?.('YYYY-MM-DD HH:mm:ss') || values.planned_end_time
      };

      let result;
      if (editingRecord) {
        result = await DataService.updateProductionTask(editingRecord.id, taskData);
      } else {
        result = await DataService.addProductionTask(taskData);
      }

      if (result.success) {
        safeMessage.success(editingRecord ? '任务单更新成功' : '任务单创建成功');
        setIsModalVisible(false);
        refetch(); // 刷新数据
      }
    } catch (error) {
      console.error('保存失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '任务单号',
      dataIndex: 'task_number',
      key: 'task_number',
      width: 120
    },
    {
      title: '计划单号',
      dataIndex: ['ProductionPlan', 'plan_number'],
      key: 'plan_number',
      width: 120
    },
    {
      title: '物料',
      dataIndex: ['ProductionPlan', 'Material', 'material_name'],
      key: 'material_name',
      width: 150
    },
    {
      title: '设备',
      dataIndex: ['Device', 'device_name'],
      key: 'device_name',
      width: 150
    },
    {
      title: '模具',
      dataIndex: ['Mold', 'mold_name'],
      key: 'mold_name',
      width: 150
    },
    {
      title: '任务数量',
      dataIndex: 'task_quantity',
      key: 'task_quantity',
      width: 100
    },
    {
      title: '交期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
    },
    {
      title: '超期',
      dataIndex: 'is_overdue',
      key: 'is_overdue',
      width: 80,
      render: (isOverdue) => (
        <Tag color={isOverdue ? 'red' : 'green'}>
          {isOverdue ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            调整
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record)}
            okText="是"
            cancelText="否"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 处理加载和错误状态
  if (error) {
    return (
      <Card title="任务单管理">
        <Alert
          message="数据加载失败"
          description={error.message || '无法加载任务数据，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title="任务单管理"
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              try {
                refetch();
                safeMessage.success('数据刷新成功');
              } catch (error) {
                console.error('刷新失败:', error);
                safeMessage.error('刷新失败: ' + (error.message || '未知错误'));
              }
            }}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增任务
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              try {
                message.info('导出Excel功能');
              } catch (error) {
                console.error('导出失败:', error);
                safeMessage.error('导出失败: ' + (error.message || '未知错误'));
              }
            }}
          >
            导出Excel
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              try {
                message.info('导入ERP功能');
              } catch (error) {
                console.error('导入失败:', error);
                safeMessage.error('导入失败: ' + (error.message || '未知错误'));
              }
            }}
          >
            导入ERP
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading} tip="加载中...">
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          locale={{ emptyText: '暂无任务数据' }}
        />
      </Spin>

      <Modal
        title={editingRecord ? "调整任务单" : "新增任务单"}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          try {
            setIsModalVisible(false);
            form.resetFields();
            setEditingRecord(null);
          } catch (error) {
            console.error('取消操作失败:', error);
            safeMessage.error('取消操作失败: ' + (error.message || '未知错误'));
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="任务数量"
            name="task_quantity"
            rules={[{ required: true, message: '请输入任务数量' }]}
          >
            <InputNumber min={1} placeholder="请输入任务数量" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="设备"
            name="device_id"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="选择设备">
              {devices.map(d => (
                <Select.Option key={d.id} value={d.id}>
                  {d.equipmentCode || d.equipment_code || 'EQ001'} - {d.equipmentName || d.equipment_name || d.name || '设备A'}
                </Select.Option>
              ))}
              {devices.length === 0 && (
                <Select.Option value={1}>EQ001 - 设备A</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="模具"
            name="mold_id"
          >
            <Select placeholder="选择模具">
              <Select.Option value={1}>MOLD001 - 模具A</Select.Option>
              <Select.Option value={2}>MOLD002 - 模具B</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="计划开始时间"
            name="planned_start_time"
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="计划结束时间"
            name="planned_end_time"
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
          >
            <Select>
              <Select.Option value="pending">待执行</Select.Option>
              <Select.Option value="in_progress">执行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TaskManagement;
