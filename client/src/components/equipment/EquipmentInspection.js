import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, Radio, Rate } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { equipmentData } from '../../data/mockData';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const EquipmentInspection = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const inspectionData = [
    {
      key: '1',
      inspectionId: 'INS-2024-001',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      inspectionType: 'daily',
      inspectionDate: '2024-01-15',
      inspector: '张三',
      shift: '白班',
      checkItems: [
        { item: '温度检查', result: 'normal', score: 5 },
        { item: '压力检查', result: 'normal', score: 5 },
        { item: '噪音检查', result: 'abnormal', score: 3 },
        { item: '振动检查', result: 'normal', score: 4 }
      ],
      overallScore: 4.25,
      status: 'completed',
      issues: ['噪音略大，需要关注'],
      nextInspectionDate: '2024-01-16',
      remarks: '整体状态良好，噪音需要跟进'
    },
    {
      key: '2',
      inspectionId: 'INS-2024-002',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      inspectionType: 'weekly',
      inspectionDate: '2024-01-15',
      inspector: '李四',
      shift: '白班',
      checkItems: [
        { item: '传送带检查', result: 'normal', score: 5 },
        { item: '封口温度', result: 'normal', score: 5 },
        { item: '计数准确性', result: 'normal', score: 5 }
      ],
      overallScore: 5.0,
      status: 'completed',
      issues: [],
      nextInspectionDate: '2024-01-22',
      remarks: '设备运行正常'
    },
    {
      key: '3',
      inspectionId: 'INS-2024-003',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      inspectionType: 'monthly',
      inspectionDate: '2024-01-16',
      inspector: '王五',
      shift: '白班',
      checkItems: [
        { item: '精度校准', result: 'pending', score: 0 },
        { item: '镜头清洁度', result: 'pending', score: 0 }
      ],
      overallScore: 0,
      status: 'pending',
      issues: [],
      nextInspectionDate: '2024-02-16',
      remarks: '待执行月度点检'
    }
  ];

  const columns = [
    {
      title: '点检编号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
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
      title: '点检类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 100,
      render: (type) => {
        const typeMap = {
          daily: { color: 'blue', text: '日检' },
          weekly: { color: 'green', text: '周检' },
          monthly: { color: 'orange', text: '月检' }
        };
        const typeInfo = typeMap[type] || { color: 'default', text: type || '未知' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      }
    },
    {
      title: '点检日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100,
    },
    {
      title: '点检员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 80,
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 60,
    },
    {
      title: '综合评分',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 120,
      render: (score) => (
        <div>
          <Rate disabled value={score} allowHalf />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {score > 0 ? `${score.toFixed(1)} 分` : '未评分'}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待点检' },
          in_progress: { color: 'blue', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          overdue: { color: 'red', text: '已逾期' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status || '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '异常项目',
      dataIndex: 'issues',
      key: 'issues',
      width: 200,
      render: (issues) => (
        <div>
          {issues.length > 0 ? (
            issues.map((issue, index) => (
              <Tag key={index} color="red" style={{ marginBottom: 2 }}>
                {issue}
              </Tag>
            ))
          ) : (
            <Tag color="green">无异常</Tag>
          )}
        </div>
      )
    },
    {
      title: '下次点检',
      dataIndex: 'nextInspectionDate',
      key: 'nextInspectionDate',
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
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleInspect(record)}
            >
              点检
            </Button>
          )}
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleInspect = (record) => {
    form.setFieldsValue({
      ...record,
      status: 'in_progress'
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交点检数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <EyeOutlined />
            设备点检管理
          </Space>
        }
        extra={
          <Space>
            <Button>点检计划</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建点检
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
            <Select placeholder="点检类型" style={{ width: 120 }}>
              <Option value="daily">日检</Option>
              <Option value="weekly">周检</Option>
              <Option value="monthly">月检</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="pending">待点检</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="overdue">已逾期</Option>
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
          dataSource={inspectionData}
          loading={loading}
          pagination={{
            total: inspectionData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 点检模态框 */}
      <Modal
        title="设备点检记录"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
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
              name="inspectionType"
              label="点检类型"
              rules={[{ required: true, message: '请选择点检类型' }]}
            >
              <Select placeholder="请选择点检类型" style={{ width: 120 }}>
                <Option value="daily">日检</Option>
                <Option value="weekly">周检</Option>
                <Option value="monthly">月检</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="shift"
              label="班次"
              rules={[{ required: true, message: '请选择班次' }]}
            >
              <Select placeholder="请选择班次" style={{ width: 120 }}>
                <Option value="白班">白班</Option>
                <Option value="夜班">夜班</Option>
                <Option value="中班">中班</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="inspectionDate"
            label="点检日期"
            rules={[{ required: true, message: '请选择点检日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {/* 点检项目 */}
          <Card title="点检项目" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span style={{ marginRight: 16 }}>温度检查:</span>
                <Radio.Group>
                  <Radio value="normal">正常</Radio>
                  <Radio value="abnormal">异常</Radio>
                </Radio.Group>
                <span style={{ marginLeft: 16 }}>评分:</span>
                <Rate style={{ marginLeft: 8 }} />
              </div>
              <div>
                <span style={{ marginRight: 16 }}>压力检查:</span>
                <Radio.Group>
                  <Radio value="normal">正常</Radio>
                  <Radio value="abnormal">异常</Radio>
                </Radio.Group>
                <span style={{ marginLeft: 16 }}>评分:</span>
                <Rate style={{ marginLeft: 8 }} />
              </div>
              <div>
                <span style={{ marginRight: 16 }}>噪音检查:</span>
                <Radio.Group>
                  <Radio value="normal">正常</Radio>
                  <Radio value="abnormal">异常</Radio>
                </Radio.Group>
                <span style={{ marginLeft: 16 }}>评分:</span>
                <Rate style={{ marginLeft: 8 }} />
              </div>
            </Space>
          </Card>

          <Form.Item
            name="issues"
            label="发现问题"
          >
            <TextArea rows={3} placeholder="请描述发现的问题" />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentInspection;