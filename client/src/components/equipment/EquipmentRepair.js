import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, Steps, Upload, Descriptions, Row, Col, Statistic, Timeline, Progress, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, ToolOutlined, EditOutlined, EyeOutlined, UploadOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const EquipmentRepair = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // 模拟数据
  const repairData = [
    {
      key: '1',
      repairId: 'RP-2024-001',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      faultDescription: '温度控制异常，无法达到设定温度',
      priority: 'high',
      reportDate: '2024-01-15 08:30',
      reportPerson: '张三',
      assignedTechnician: '李四',
      startTime: '2024-01-15 09:00',
      endTime: '2024-01-15 15:00',
      repairDuration: 6,
      faultCause: '温度传感器老化失效',
      repairActions: ['更换温度传感器', '重新校准参数', '测试运行'],
      spareParts: [
        { name: '温度传感器', partCode: 'SP-001', quantity: 1, unitCost: 350, totalCost: 350 },
        { name: '密封圈', partCode: 'SP-002', quantity: 2, unitCost: 25, totalCost: 50 }
      ],
      laborCost: 200,
      totalCost: 600.00,
      status: 'completed',
      currentStep: 4,
      repairSteps: [
        { step: '故障报告', time: '2024-01-15 08:30', person: '张三', status: 'completed' },
        { step: '派工分配', time: '2024-01-15 08:45', person: '维修主管', status: 'completed' },
        { step: '维修执行', time: '2024-01-15 09:00', person: '李四', status: 'completed' },
        { step: '质量验收', time: '2024-01-15 15:30', person: '质检员', status: 'completed' }
      ],
      remarks: '维修完成，设备恢复正常运行，建议3个月后进行预防性保养'
    },
    {
      key: '2',
      repairId: 'RP-2024-002',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      faultDescription: '传送带打滑，包装效率下降',
      priority: 'medium',
      reportDate: '2024-01-16 10:15',
      reportPerson: '王五',
      assignedTechnician: '赵六',
      startTime: '2024-01-16 14:00',
      endTime: null,
      repairDuration: 0,
      faultCause: '传送带张力不足',
      repairActions: ['调整传送带张力', '更换磨损部件'],
      spareParts: [
        { name: '传送带', partCode: 'SP-003', quantity: 1, unitCost: 800, totalCost: 800 }
      ],
      laborCost: 150,
      totalCost: 950.00,
      status: 'in_progress',
      currentStep: 2,
      repairSteps: [
        { step: '故障报告', time: '2024-01-16 10:15', person: '王五', status: 'completed' },
        { step: '派工分配', time: '2024-01-16 10:30', person: '维修主管', status: 'completed' },
        { step: '维修执行', time: '2024-01-16 14:00', person: '赵六', status: 'in_progress' },
        { step: '质量验收', time: null, person: null, status: 'pending' }
      ],
      remarks: '正在进行维修，预计今日完成'
    },
    {
      key: '3',
      repairId: 'RP-2024-003',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      faultDescription: '检测精度偏差超标',
      priority: 'urgent',
      reportDate: '2024-01-17 07:00',
      reportPerson: '刘七',
      assignedTechnician: null,
      startTime: null,
      endTime: null,
      repairDuration: 0,
      faultCause: '待诊断',
      repairActions: [],
      spareParts: [],
      laborCost: 0,
      totalCost: 0,
      status: 'pending',
      currentStep: 0,
      repairSteps: [
        { step: '故障报告', time: '2024-01-17 07:00', person: '刘七', status: 'completed' },
        { step: '派工分配', time: null, person: null, status: 'pending' },
        { step: '维修执行', time: null, person: null, status: 'pending' },
        { step: '质量验收', time: null, person: null, status: 'pending' }
      ],
      remarks: '紧急故障，等待技术员分配'
    }
  ];

  const columns = [
    {
      title: '维修单号',
      dataIndex: 'repairId',
      key: 'repairId',
      width: 120,
      fixed: 'left'
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
      title: '故障描述',
      dataIndex: 'faultDescription',
      key: 'faultDescription',
      width: 200,
      ellipsis: true
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityMap = {
          urgent: { color: 'red', text: '紧急', icon: <ExclamationCircleOutlined /> },
          high: { color: 'orange', text: '高', icon: <WarningOutlined /> },
          medium: { color: 'blue', text: '中', icon: <ClockCircleOutlined /> },
          low: { color: 'green', text: '低', icon: <CheckCircleOutlined /> }
        };
        const priorityInfo = priorityMap[priority] || { color: 'default', text: priority || '未知', icon: null };
        return (
          <Tag color={priorityInfo.color} icon={priorityInfo.icon}>
            {priorityInfo.text}
          </Tag>
        );
      }
    },
    {
      title: '报告时间',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 140,
      render: (date) => date.replace(' ', '\n')
    },
    {
      title: '报告人',
      dataIndex: 'reportPerson',
      key: 'reportPerson',
      width: 80
    },
    {
      title: '维修技师',
      dataIndex: 'assignedTechnician',
      key: 'assignedTechnician',
      width: 100,
      render: (technician) => technician || '待分配'
    },
    {
      title: '维修进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const progressMap = {
          pending: { percent: 0, status: 'exception', text: '待处理' },
          assigned: { percent: 25, status: 'active', text: '已分配' },
          in_progress: { percent: 50, status: 'active', text: '维修中' },
          completed: { percent: 100, status: 'success', text: '已完成' },
          cancelled: { percent: 0, status: 'exception', text: '已取消' }
        };
        const { percent, status, text } = progressMap[record.status];
        return (
          <div>
            <Progress percent={percent} status={status} size="small" />
            <div style={{ fontSize: '12px', marginTop: '2px' }}>{text}</div>
          </div>
        );
      }
    },
    {
      title: '维修耗时',
      dataIndex: 'repairDuration',
      key: 'repairDuration',
      width: 100,
      render: (duration) => duration > 0 ? `${duration}小时` : '-'
    },
    {
      title: '维修费用',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 100,
      render: (cost) => cost > 0 ? `¥${cost.toFixed(2)}` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          assigned: { color: 'blue', text: '已分配' },
          in_progress: { color: 'processing', text: '维修中' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status || '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleAssign(record)}
            >
              分配
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleAssign = (record) => {
    // 处理分配逻辑
    console.log('分配维修任务:', record);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交维修数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={1}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="维修中"
              value={1}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月完成"
              value={15}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均耗时"
              value={4.2}
              precision={1}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <ToolOutlined />
            设备维修管理
          </Space>
        }
        extra={
          <Space>
            <Button>维修统计</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              故障报修
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索维修单号/设备"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="优先级" style={{ width: 120 }}>
              <Option value="urgent">紧急</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="pending">待处理</Option>
              <Option value="assigned">已分配</Option>
              <Option value="in_progress">维修中</Option>
              <Option value="completed">已完成</Option>
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
          dataSource={repairData}
          loading={loading}
          pagination={{
            total: repairData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* 新建/编辑维修单模态框 */}
      <Modal
        title="设备维修单"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentCode"
                label="设备编号"
                rules={[{ required: true, message: '请选择设备' }]}
              >
                <Select placeholder="请选择设备">
                  <Option value="EQ-001">EQ-001 - 注塑机A1</Option>
                  <Option value="EQ-002">EQ-002 - 包装机B1</Option>
                  <Option value="EQ-003">EQ-003 - 检测设备C1</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="urgent">紧急</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="faultDescription"
            label="故障描述"
            rules={[{ required: true, message: '请输入故障描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述设备故障现象" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reportPerson"
                label="报告人"
                rules={[{ required: true, message: '请输入报告人' }]}
              >
                <Input placeholder="请输入报告人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignedTechnician"
                label="指定技师"
              >
                <Select placeholder="请选择维修技师">
                  <Option value="李四">李四</Option>
                  <Option value="赵六">赵六</Option>
                  <Option value="孙八">孙八</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item
            name="attachments"
            label="故障图片"
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={5}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 维修详情模态框 */}
      <Modal
        title={`维修详情 - ${selectedRecord?.repairId}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedRecord && (
          <div>
            {/* 基本信息 */}
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="维修单号">{selectedRecord.repairId}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{selectedRecord.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="设备编号">{selectedRecord.equipmentCode}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={selectedRecord.priority === 'urgent' ? 'red' : selectedRecord.priority === 'high' ? 'orange' : 'blue'}>
                  {selectedRecord.priority === 'urgent' ? '紧急' : selectedRecord.priority === 'high' ? '高' : '中'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="报告时间">{selectedRecord.reportDate}</Descriptions.Item>
              <Descriptions.Item label="报告人">{selectedRecord.reportPerson}</Descriptions.Item>
              <Descriptions.Item label="维修技师">{selectedRecord.assignedTechnician || '待分配'}</Descriptions.Item>
              <Descriptions.Item label="维修状态">
                <Tag color={selectedRecord.status === 'completed' ? 'green' : selectedRecord.status === 'in_progress' ? 'blue' : 'orange'}>
                  {selectedRecord.status === 'completed' ? '已完成' : selectedRecord.status === 'in_progress' ? '维修中' : '待处理'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 故障信息 */}
            <Card title="故障信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="故障描述">{selectedRecord.faultDescription}</Descriptions.Item>
                <Descriptions.Item label="故障原因">{selectedRecord.faultCause}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 维修进度 */}
            <Card title="维修进度" size="small" style={{ marginBottom: 16 }}>
              <Timeline>
                {selectedRecord.repairSteps.map((step, index) => (
                  <Timeline.Item
                    key={index}
                    color={step.status === 'completed' ? 'green' : step.status === 'in_progress' ? 'blue' : 'gray'}
                    dot={step.status === 'completed' ? <CheckCircleOutlined /> : step.status === 'in_progress' ? <ClockCircleOutlined /> : <UserOutlined />}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{step.step}</div>
                      {step.time && <div style={{ fontSize: '12px', color: '#666' }}>时间: {step.time}</div>}
                      {step.person && <div style={{ fontSize: '12px', color: '#666' }}>执行人: {step.person}</div>}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {/* 维修费用 */}
            {selectedRecord.spareParts.length > 0 && (
              <Card title="费用明细" size="small" style={{ marginBottom: 16 }}>
                <Table
                  size="small"
                  columns={[
                    { title: '备件名称', dataIndex: 'name', key: 'name' },
                    { title: '备件编号', dataIndex: 'partCode', key: 'partCode' },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    { title: '单价', dataIndex: 'unitCost', key: 'unitCost', render: (cost) => `¥${cost}` },
                    { title: '小计', dataIndex: 'totalCost', key: 'totalCost', render: (cost) => `¥${cost}` }
                  ]}
                  dataSource={selectedRecord.spareParts}
                  pagination={false}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}><strong>备件费用合计</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>¥{selectedRecord.spareParts.reduce((sum, part) => sum + part.totalCost, 0)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}><strong>人工费用</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}><strong>¥{selectedRecord.laborCost}</strong></Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}><strong>总费用</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong style={{ color: '#1890ff' }}>¥{selectedRecord.totalCost.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </Card>
            )}

            {/* 备注信息 */}
            {selectedRecord.remarks && (
              <Card title="备注信息" size="small">
                <p>{selectedRecord.remarks}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentRepair;