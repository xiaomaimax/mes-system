import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Badge,
  Avatar,
  Descriptions,
  Alert,
  Timeline,
  Transfer,
  List,
  Tooltip
} from 'antd';
import { 
  SettingOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UserOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EquipmentResponsibilityManagement = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  // 模拟责任设备数据
  const responsibilityData = [
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      equipmentType: '注塑设备',
      workshop: '车间A',
      productionLine: '生产线1',
      primaryResponsible: {
        id: 'OP001',
        name: '张三',
        phone: '138-0000-1111',
        email: 'zhangsan@company.com',
        department: '生产部',
        position: '设备操作员',
        level: '高级'
      },
      backupResponsible: {
        id: 'OP002',
        name: '李四',
        phone: '138-0000-2222',
        email: 'lisi@company.com',
        department: '生产部',
        position: '设备操作员',
        level: '中级'
      },
      assignDate: '2024-01-01',
      effectiveDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'active',
      equipmentStatus: 'running',
      lastMaintenanceDate: '2024-01-10',
      nextMaintenanceDate: '2024-02-10',
      responsibilityScope: ['日常操作', '基础维护', '异常报告', '清洁保养'],
      performanceScore: 95,
      incidentCount: 2,
      maintenanceCount: 8,
      remarks: '设备运行正常，责任人表现优秀'
    },
    {
      key: '2',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      equipmentType: '包装设备',
      workshop: '车间B',
      productionLine: '生产线2',
      primaryResponsible: {
        id: 'OP003',
        name: '王五',
        phone: '138-0000-3333',
        email: 'wangwu@company.com',
        department: '生产部',
        position: '设备操作员',
        level: '中级'
      },
      backupResponsible: {
        id: 'OP004',
        name: '赵六',
        phone: '138-0000-4444',
        email: 'zhaoliu@company.com',
        department: '生产部',
        position: '设备操作员',
        level: '初级'
      },
      assignDate: '2024-01-05',
      effectiveDate: '2024-01-05',
      expiryDate: '2024-12-31',
      status: 'active',
      equipmentStatus: 'maintenance',
      lastMaintenanceDate: '2024-01-12',
      nextMaintenanceDate: '2024-02-12',
      responsibilityScope: ['日常操作', '基础维护', '异常报告'],
      performanceScore: 88,
      incidentCount: 1,
      maintenanceCount: 5,
      remarks: '设备维护中，责任人配合良好'
    }
  ];

  // 可用操作员列表
  const availableOperators = [
    { key: 'OP001', name: '张三', department: '生产部', level: '高级', status: 'available' },
    { key: 'OP002', name: '李四', department: '生产部', level: '中级', status: 'assigned' },
    { key: 'OP005', name: '钱七', department: '生产部', level: '高级', status: 'available' },
    { key: 'OP006', name: '孙八', department: '生产部', level: '中级', status: 'available' },
    { key: 'OP007', name: '周九', department: '维修部', level: '高级', status: 'available' },
    { key: 'OP008', name: '吴十', department: '维修部', level: '中级', status: 'available' }
  ];

  // 可用设备列表
  const availableEquipment = [
    { key: 'EQ-003', name: '检测设备C1', type: '检测设备', workshop: '车间C', status: 'unassigned' },
    { key: 'EQ-004', name: '切割机D1', type: '加工设备', workshop: '车间A', status: 'unassigned' },
    { key: 'EQ-005', name: '焊接机E1', type: '焊接设备', workshop: '车间B', status: 'unassigned' }
  ];

  // 统计数据
  const summaryData = {
    totalEquipment: 25,
    assignedEquipment: 22,
    unassignedEquipment: 3,
    totalOperators: 18,
    assignedOperators: 15,
    availableOperators: 3,
    avgPerformanceScore: 91.5,
    totalIncidents: 8
  };

  const columns = [
    {
      title: '设备信息',
      key: 'equipment',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.equipmentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.equipmentCode}</div>
          <Tag color="blue" size="small">{record.equipmentType}</Tag>
        </div>
      )
    },
    {
      title: '位置',
      key: 'location',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.workshop}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '主责任人',
      key: 'primaryResponsible',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span style={{ fontWeight: 'bold' }}>{record.primaryResponsible.name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.primaryResponsible.department} | {record.primaryResponsible.level}
          </div>
          <div style={{ fontSize: '12px' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.primaryResponsible.phone}
          </div>
        </div>
      )
    },
    {
      title: '备用责任人',
      key: 'backupResponsible',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span>{record.backupResponsible.name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.backupResponsible.department} | {record.backupResponsible.level}
          </div>
        </div>
      )
    },
    {
      title: '责任范围',
      dataIndex: 'responsibilityScope',
      key: 'responsibilityScope',
      width: 200,
      render: (scope) => (
        <div>
          {scope.map((item, index) => (
            <Tag key={index} size="small" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '设备状态',
      dataIndex: 'equipmentStatus',
      key: 'equipmentStatus',
      width: 100,
      render: (status) => {
        const statusMap = {
          running: { color: 'success', text: '运行中' },
          maintenance: { color: 'warning', text: '维护中' },
          fault: { color: 'error', text: '故障' },
          idle: { color: 'default', text: '空闲' }
        };
        const { color, text } = statusMap[status];
        return <Badge status={color} text={text} />;
      }
    },
    {
      title: '绩效评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      width: 100,
      render: (score) => (
        <div>
          <div style={{ 
            color: score >= 95 ? '#52c41a' : score >= 85 ? '#faad14' : '#ff4d4f',
            fontWeight: 'bold'
          }}>
            {score}分
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {score >= 95 ? '优秀' : score >= 85 ? '良好' : '需改进'}
          </div>
        </div>
      )
    },
    {
      title: '有效期',
      key: 'validity',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.effectiveDate}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>至 {record.expiryDate}</div>
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
          active: { color: 'green', text: '生效中' },
          expired: { color: 'red', text: '已过期' },
          pending: { color: 'orange', text: '待生效' },
          suspended: { color: 'gray', text: '已暂停' }
        };
        const { color, text } = statusMap[status];
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
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<SwapOutlined />}
            onClick={() => handleReassign(record)}
          >
            重新分配
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
    });
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleReassign = (record) => {
    setSelectedRecord(record);
    setAssignModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交责任设备数据:', values);
      message.success('责任设备信息保存成功！');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="设备总数"
            value={summaryData.totalEquipment}
            prefix={<ToolOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="已分配设备"
            value={summaryData.assignedEquipment}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="未分配设备"
            value={summaryData.unassignedEquipment}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="责任人总数"
            value={summaryData.totalOperators}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="平均绩效"
            value={summaryData.avgPerformanceScore}
            suffix="分"
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="异常事件"
            value={summaryData.totalIncidents}
            suffix="次"
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderDetailModal = () => (
    <Modal
      title={`设备责任详情 - ${selectedRecord?.equipmentName}`}
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
        <Tabs
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="设备信息" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="设备编码">{selectedRecord.equipmentCode}</Descriptions.Item>
                        <Descriptions.Item label="设备名称">{selectedRecord.equipmentName}</Descriptions.Item>
                        <Descriptions.Item label="设备类型">{selectedRecord.equipmentType}</Descriptions.Item>
                        <Descriptions.Item label="所在车间">{selectedRecord.workshop}</Descriptions.Item>
                        <Descriptions.Item label="生产线">{selectedRecord.productionLine}</Descriptions.Item>
                        <Descriptions.Item label="设备状态">
                          <Badge 
                            status={selectedRecord.equipmentStatus === 'running' ? 'success' : 'warning'} 
                            text={selectedRecord.equipmentStatus === 'running' ? '运行中' : '维护中'} 
                          />
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="责任信息" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="分配日期">{selectedRecord.assignDate}</Descriptions.Item>
                        <Descriptions.Item label="生效日期">{selectedRecord.effectiveDate}</Descriptions.Item>
                        <Descriptions.Item label="到期日期">{selectedRecord.expiryDate}</Descriptions.Item>
                        <Descriptions.Item label="责任状态">
                          <Tag color="green">{selectedRecord.status === 'active' ? '生效中' : '其他'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="绩效评分">
                          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            {selectedRecord.performanceScore}分
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'responsible',
              label: '责任人信息',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="主责任人" size="small">
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <div style={{ marginTop: 8, fontWeight: 'bold', fontSize: '16px' }}>
                          {selectedRecord.primaryResponsible.name}
                        </div>
                        <Tag color="blue">{selectedRecord.primaryResponsible.level}</Tag>
                      </div>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="工号">{selectedRecord.primaryResponsible.id}</Descriptions.Item>
                        <Descriptions.Item label="部门">{selectedRecord.primaryResponsible.department}</Descriptions.Item>
                        <Descriptions.Item label="职位">{selectedRecord.primaryResponsible.position}</Descriptions.Item>
                        <Descriptions.Item label="电话">{selectedRecord.primaryResponsible.phone}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{selectedRecord.primaryResponsible.email}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="备用责任人" size="small">
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <div style={{ marginTop: 8, fontWeight: 'bold', fontSize: '16px' }}>
                          {selectedRecord.backupResponsible.name}
                        </div>
                        <Tag color="orange">{selectedRecord.backupResponsible.level}</Tag>
                      </div>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="工号">{selectedRecord.backupResponsible.id}</Descriptions.Item>
                        <Descriptions.Item label="部门">{selectedRecord.backupResponsible.department}</Descriptions.Item>
                        <Descriptions.Item label="职位">{selectedRecord.backupResponsible.position}</Descriptions.Item>
                        <Descriptions.Item label="电话">{selectedRecord.backupResponsible.phone}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{selectedRecord.backupResponsible.email}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'performance',
              label: '绩效统计',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="绩效指标" size="small">
                      <Descriptions column={1}>
                        <Descriptions.Item label="绩效评分">
                          <div style={{ fontSize: '24px', color: '#52c41a', fontWeight: 'bold' }}>
                            {selectedRecord.performanceScore}分
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="异常事件">{selectedRecord.incidentCount}次</Descriptions.Item>
                        <Descriptions.Item label="维护次数">{selectedRecord.maintenanceCount}次</Descriptions.Item>
                        <Descriptions.Item label="上次维护">{selectedRecord.lastMaintenanceDate}</Descriptions.Item>
                        <Descriptions.Item label="下次维护">{selectedRecord.nextMaintenanceDate}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="责任范围" size="small">
                      <List
                        size="small"
                        dataSource={selectedRecord.responsibilityScope}
                        renderItem={item => (
                          <List.Item>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      )}
    </Modal>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计面板 */}
      {renderSummaryCards()}

      <Card 
        title={
          <Space>
            <SettingOutlined />
            责任设备管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              新增分配
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索设备编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="设备类型" style={{ width: 120 }}>
              <Option value="injection">注塑设备</Option>
              <Option value="packaging">包装设备</Option>
              <Option value="inspection">检测设备</Option>
            </Select>
            <Select placeholder="责任状态" style={{ width: 120 }}>
              <Option value="active">生效中</Option>
              <Option value="expired">已过期</Option>
              <Option value="pending">待生效</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 责任设备表格 */}
        <Table
          columns={columns}
          dataSource={responsibilityData}
          loading={loading}
          pagination={{
            total: responsibilityData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title="责任设备分配"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentCode"
                label="设备"
                rules={[{ required: true, message: '请选择设备' }]}
              >
                <Select placeholder="请选择设备">
                  {availableEquipment.map(eq => (
                    <Option key={eq.key} value={eq.key}>
                      {eq.name} ({eq.key})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="primaryResponsible"
                label="主责任人"
                rules={[{ required: true, message: '请选择主责任人' }]}
              >
                <Select placeholder="请选择主责任人">
                  {availableOperators.map(op => (
                    <Option key={op.key} value={op.key}>
                      {op.name} - {op.department} ({op.level})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="backupResponsible"
                label="备用责任人"
              >
                <Select placeholder="请选择备用责任人">
                  {availableOperators.map(op => (
                    <Option key={op.key} value={op.key}>
                      {op.name} - {op.department} ({op.level})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsibilityScope"
                label="责任范围"
                rules={[{ required: true, message: '请选择责任范围' }]}
              >
                <Select mode="multiple" placeholder="请选择责任范围">
                  <Option value="日常操作">日常操作</Option>
                  <Option value="基础维护">基础维护</Option>
                  <Option value="异常报告">异常报告</Option>
                  <Option value="清洁保养">清洁保养</Option>
                  <Option value="安全检查">安全检查</Option>
                  <Option value="记录填写">记录填写</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="effectiveDate"
                label="生效日期"
                rules={[{ required: true, message: '请选择生效日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="到期日期"
                rules={[{ required: true, message: '请选择到期日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 详情模态框 */}
      {renderDetailModal()}
    </div>
  );
};

export default EquipmentResponsibilityManagement;