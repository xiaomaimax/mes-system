import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, message } from 'antd';

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
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import ButtonActions from '../../utils/buttonActions';

const { Option } = Select;

const WorkshopPlanManagementSafe = () => {
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // 删除车间计划处理函数
  const handleDeletePlan = (record) => {
    ButtonActions.simulateDelete(`车间计划 ${record.key || record.id || record.code || record.name}

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRecord) {
        // 编辑模式 - 更新现有记录
        const updatedData = data.map(item => 
          item.id === editingRecord.id ? { ...item, ...values } : item
        );
        setData(updatedData);
        safeMessage.success('编辑成功');
      } else {
        // 新增模式 - 添加新记录
        const newRecord = {
          id: Date.now(),
          ...values,
          createTime: new Date().toLocaleString()
        };
        setData([...data, newRecord]);
        safeMessage.success('新增成功');
      }
      
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      safeMessage.error('保存失败');
    }
  };`, () => {
      ButtonActions.showSuccess(`车间计划删除成功！`);
    });
  };

  // 安全的静态数据，避免依赖复杂的mockData结构
  const planData = [
    {
      key: 'PLAN-001',
      planNumber: 'PLAN-001',
      materialNumber: 'HW001',
      planQuantity: 500,
      cleanNumber: 'CLN-001',
      processRouteNumber: 'RT-HW001',
      orderNumber: 'SO-001',
      customer: '华润置地',
      planType: '生产计划',
      priority: '高',
      workshop: '五金车间',
      planDate: '2024-12-28',
      issueTime: '2024-12-25 08:00',
      status: 'in_progress',
      remarks: '不锈钢门把手生产计划'
    },
    {
      key: 'PLAN-002',
      planNumber: 'PLAN-002',
      materialNumber: 'INJ001',
      planQuantity: 1000,
      cleanNumber: 'CLN-002',
      processRouteNumber: 'RT-INJ001',
      orderNumber: 'SO-002',
      customer: '比亚迪汽车',
      planType: '生产计划',
      priority: '中',
      workshop: '注塑车间',
      planDate: '2024-12-30',
      issueTime: '2024-12-26 08:00',
      status: 'pending',
      remarks: '汽车仪表盘外壳生产计划'
    }
  ];

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
      dataIndex: 'materialNumber',
      key: 'materialNumber',
      width: 120,
    },
    {
      title: '计划数量',
      dataIndex: 'planQuantity',
      key: 'planQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '清单编号',
      dataIndex: 'cleanNumber',
      key: 'cleanNumber',
      width: 120,
    },
    {
      title: '工艺路线号',
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
      title: '计划类型',
      dataIndex: 'planType',
      key: 'planType',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>},
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const colorMap = {
          '高': 'red',
          '中': 'orange',
          '低': 'green'
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      }
    },
    {
      title: '车间',
      dataIndex: 'workshop',
      key: 'workshop',
      width: 100,
    },
    {
      title: '计划交期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '发货时间',
      dataIndex: 'issueTime',
      key: 'issueTime',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待执行' },
          in_progress: { color: 'blue', text: '执行中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeletePlan(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            车间计划管理 (安全版本)
          </Space>}
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => message.info('新增功能开发中')}
            >
              新增计划
            </Button>
          </Space>}
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索计划单号/物料编号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="计划类型" style={{ width: 120 }}>
              <Option value="production">生产计划</Option>
              <Option value="maintenance">维护计划</Option>
              <Option value="test">测试计划</Option>
            </Select>
            <Select placeholder="优先级" style={{ width: 100 }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="pending">待执行</Option>
              <Option value="in_progress">执行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={planData}
          loading={loading}
          pagination={{
            total: planData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>
    </div>
  );
};

export default WorkshopPlanManagementSafe;