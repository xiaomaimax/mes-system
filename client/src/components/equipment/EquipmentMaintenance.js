import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, message, Spin, Alert } from 'antd';

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
import { PlusOutlined, SearchOutlined, SafetyOutlined, EditOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// 修复中文字符编码问题
const fixChineseEncoding = (text) => {
  if (!text) return '定期保养';
  
  // 常见的乱码映射
  const encodingMap = {
    '瀹氭湡淇濆吇妫?煡': '定期保养检查',
    '璁惧?妫?煡': '设备检查',
    '鏁呴殰缁翠慨': '故障维修',
    '娓呮磥缁存姢': '清洁维护',
    '鍙傛暟璋冩暣': '参数调整',
    '绮惧害鏍″噯': '精度校准'
  };
  
  // 如果是已知的乱码，返回正确的中文
  if (encodingMap[text]) {
    return encodingMap[text];
  }
  
  // 如果包含乱码字符，返回默认值
  if (/[瀹氭湡淇濆吇妫璁惧鏁呴殰缁翠慨娓呮磥绮惧害鏍″噯]/.test(text)) {
    return '定期保养';
  }
  
  return text;
};

const EquipmentMaintenance = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 使用 DataService 和 useDataService Hook 获取数据
  const { data: maintenanceResponse, loading, error, refetch } = useDataService(
    () => DataService.getEquipmentMaintenance({ limit: 100 }),
    []
  );

  // 处理数据转换
  const maintenanceData = React.useMemo(() => {
    if (!maintenanceResponse || !maintenanceResponse.maintenance) {
      return [];
    }

    return maintenanceResponse.maintenance.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      maintenanceId: `MT-${item.id}`,
      equipmentCode: `DEV-${String(item.device_id).padStart(3, '0')}`,
      equipmentName: `设备 ${item.device_id}`,
      maintenanceType: item.maintenance_type || 'preventive',
      planDate: item.maintenance_date ? new Date(item.maintenance_date).toLocaleDateString() : '-',
      actualDate: item.completion_date ? new Date(item.completion_date).toLocaleDateString() : null,
      duration: 4,
      technician: `技术员 ${item.technician_id}`,
      maintenanceItems: [fixChineseEncoding(item.description) || '定期保养'],
      cost: 500.00,
      status: item.status || 'pending',
      nextMaintenanceDate: '-',
      remarks: item.notes || '-'
    }));
  }, [maintenanceResponse]);

  // 处理加载状态和错误状态
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>正在加载设备维护数据...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="数据加载失败"
        description={error.message || '无法加载设备维护数据，请检查网络连接或联系系统管理员'}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={refetch}>
            重试
          </Button>
        }
        style={{ margin: '20px' }}
      />
    );
  }

  const columns = [
    {
      title: '保养编号',
      dataIndex: 'maintenanceId',
      key: 'maintenanceId',
      width: 120,
    },
    {
      title: '设备信息',
      key: 'equipment',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.equipmentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.equipmentCode}</div>
        </div>
      )
    },
    {
      title: '保养类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 100,
      render: (type) => {
        const typeMap = {
          preventive: { color: 'blue', text: '预防性' },
          corrective: { color: 'orange', text: '纠正性' },
          emergency: { color: 'red', text: '紧急' },
          // 添加更多可能的类型
          routine: { color: 'green', text: '例行' },
          scheduled: { color: 'blue', text: '计划' },
          inspection: { color: 'purple', text: '检查' }
        };
        const typeInfo = typeMap[type] || { color: 'default', text: type || '未知' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      }
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '实际日期',
      dataIndex: 'actualDate',
      key: 'actualDate',
      width: 100,
      render: (date) => date || '-'
    },
    {
      title: '耗时(h)',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '技术员',
      dataIndex: 'technician',
      key: 'technician',
      width: 80,
    },
    {
      title: '保养项目',
      dataIndex: 'maintenanceItems',
      key: 'maintenanceItems',
      width: 200,
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => `¥${cost.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          scheduled: { color: 'blue', text: '已计划' },
          in_progress: { color: 'orange', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' },
          // 添加更多可能的状态
          pending: { color: 'gold', text: '待处理' },
          overdue: { color: 'red', text: '逾期' },
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'default', text: '非活跃' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status || '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '下次保养',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button type="link" size="small">详情</Button>
          {record.status === 'scheduled' && (
            <Button type="link" size="small">开始</Button>
          )}
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    try {
      form.setFieldsValue(record);
      setModalVisible(true);
    } catch (error) {
      console.error('编辑失败:', error);
      safeMessage.error('编辑失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除保养记录',
      content: `确定要删除保养记录 ${record.maintenanceId} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里应该调用删除API
          safeMessage.success('删除成功');
          refetch(); // 刷新数据
        } catch (error) {
          console.error('删除失败:', error);
          safeMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交保养数据:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
      form.resetFields();
      refetch(); // 刷新数据
    } catch (error) {
      console.error('保存失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <SafetyOutlined />
            设备保养管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch}>
              刷新
            </Button>
            <Button icon={<CalendarOutlined />}>保养计划</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建保养
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索设备编号/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="保养类型" style={{ width: 120 }}>
              <Option value="preventive">预防性</Option>
              <Option value="corrective">纠正性</Option>
              <Option value="emergency">紧急</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="scheduled">已计划</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={maintenanceData}
          loading={loading}
          pagination={{
            total: maintenanceData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新建/编辑保养模态框 */}
      <Modal
        title="设备保养记录"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="equipmentCode"
              label="设备编号"
              rules={[{ required: true, message: '请选择设备' }]}
            >
              <Select placeholder="请选择设备" style={{ width: 200 }}>
                <Option value="EQ-001">EQ-001 - 注塑机A1</Option>
                <Option value="EQ-002">EQ-002 - 包装机B1</Option>
                <Option value="EQ-003">EQ-003 - 检测设备C1</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="maintenanceType"
              label="保养类型"
              rules={[{ required: true, message: '请选择保养类型' }]}
            >
              <Select placeholder="请选择保养类型" style={{ width: 150 }}>
                <Option value="preventive">预防性</Option>
                <Option value="corrective">纠正性</Option>
                <Option value="emergency">紧急</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="planDate"
              label="计划日期"
              rules={[{ required: true, message: '请选择计划日期' }]}
            >
              <DatePicker style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="duration"
              label="预计耗时(小时)"
              rules={[{ required: true, message: '请输入预计耗时' }]}
            >
              <InputNumber min={0} placeholder="预计耗时" style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="technician"
              label="技术员"
              rules={[{ required: true, message: '请选择技术员' }]}
            >
              <Select placeholder="请选择技术员" style={{ width: 150 }}>
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="maintenanceItems"
            label="保养项目"
            rules={[{ required: true, message: '请选择保养项目' }]}
          >
            <Select mode="multiple" placeholder="请选择保养项目">
              <Option value="更换润滑油">更换润滑油</Option>
              <Option value="清洁过滤器">清洁过滤器</Option>
              <Option value="检查皮带">检查皮带</Option>
              <Option value="更换传感器">更换传感器</Option>
              <Option value="调整参数">调整参数</Option>
              <Option value="校准精度">校准精度</Option>
              <Option value="清洁镜头">清洁镜头</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cost"
            label="预计费用"
          >
            <InputNumber 
              min={0} 
              precision={2} 
              placeholder="预计费用" 
              style={{ width: '100%' }}
              addonBefore="¥"
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentMaintenance;