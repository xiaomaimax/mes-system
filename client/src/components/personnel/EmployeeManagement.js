import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Modal, Tag, Avatar, Descriptions, Upload, DatePicker, message } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const EmployeeManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();

  // 员工数据
  const employeeData = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      gender: '男',
      age: 28,
      department: '生产部',
      position: '生产主管',
      phone: '13800138001',
      email: 'zhangsan@company.com',
      status: '在职',
      joinDate: '2022-03-15',
      education: '本科',
      skillLevel: '高级',
      emergencyContact: '李女士 13900139001'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      gender: '女',
      age: 25,
      department: '质量部',
      position: '质检员',
      phone: '13800138002',
      email: 'lisi@company.com',
      status: '在职',
      joinDate: '2023-01-20',
      education: '大专',
      skillLevel: '中级',
      emergencyContact: '王先生 13900139002'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      gender: '男',
      age: 32,
      department: '设备部',
      position: '维修工程师',
      phone: '13800138003',
      email: 'wangwu@company.com',
      status: '请假',
      joinDate: '2021-08-10',
      education: '本科',
      skillLevel: '高级',
      emergencyContact: '赵女士 13900139003'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      gender: '男',
      age: 35,
      department: '技术部',
      position: '工艺工程师',
      phone: '13800138004',
      email: 'zhaoliu@company.com',
      status: '在职',
      joinDate: '2020-05-12',
      education: '硕士',
      skillLevel: '专家',
      emergencyContact: '孙女士 13900139004'
    },
    {
      key: '5',
      employeeId: 'EMP005',
      name: '孙七',
      gender: '女',
      age: 26,
      department: '生产部',
      position: '操作员',
      phone: '13800138005',
      email: 'sunqi@company.com',
      status: '在职',
      joinDate: '2023-06-01',
      education: '高中',
      skillLevel: '初级',
      emergencyContact: '周先生 13900139005'
    }
  ];

  const columns = [
    {
      title: '员工编号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {text}
        </Space>
      )
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 60
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 60
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Tag color={
          dept === '生产部' ? 'blue' : 
          dept === '质量部' ? 'green' : 
          dept === '设备部' ? 'orange' : 'purple'
        }>
          {dept}
        </Tag>
      )
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '在职' ? 'green' : status === '请假' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '技能等级',
      dataIndex: 'skillLevel',
      key: 'skillLevel',
      render: (level) => (
        <Tag color={
          level === '专家' ? 'gold' :
          level === '高级' ? 'blue' :
          level === '中级' ? 'green' : 'default'
        }>
          {level}
        </Tag>
      )
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedEmployee(record);
    setDetailModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除员工 ${record.name} 吗？`,
      onOk() {
        message.success('删除成功');
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存员工信息:', values);
      message.success(editingRecord ? '更新成功' : '添加成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索员工姓名、编号..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="部门" style={{ width: 120 }} allowClear>
              <Option value="生产部">生产部</Option>
              <Option value="质量部">质量部</Option>
              <Option value="设备部">设备部</Option>
              <Option value="技术部">技术部</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="在职">在职</Option>
              <Option value="请假">请假</Option>
              <Option value="离职">离职</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<UploadOutlined />}>批量导入</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增员工
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={employeeData}
          pagination={{
            total: employeeData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新增/编辑员工模态框 */}
      <Modal
        title={editingRecord ? '编辑员工信息' : '新增员工'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="员工编号"
                rules={[{ required: true, message: '请输入员工编号' }]}
              >
                <Input placeholder="请输入员工编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <Input type="number" placeholder="请输入年龄" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="education"
                label="学历"
                rules={[{ required: true, message: '请选择学历' }]}
              >
                <Select placeholder="请选择学历">
                  <Option value="高中">高中</Option>
                  <Option value="大专">大专</Option>
                  <Option value="本科">本科</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="博士">博士</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="生产部">生产部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="设备部">设备部</Option>
                  <Option value="技术部">技术部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="joinDate"
                label="入职日期"
                rules={[{ required: true, message: '请选择入职日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="skillLevel"
                label="技能等级"
                rules={[{ required: true, message: '请选择技能等级' }]}
              >
                <Select placeholder="请选择技能等级">
                  <Option value="初级">初级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="高级">高级</Option>
                  <Option value="专家">专家</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="emergencyContact"
            label="紧急联系人"
          >
            <Input placeholder="请输入紧急联系人信息" />
          </Form.Item>

          <Form.Item
            name="address"
            label="家庭住址"
          >
            <TextArea rows={2} placeholder="请输入家庭住址" />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 员工详情模态框 */}
      <Modal
        title="员工详细信息"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedEmployee && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={80} icon={<UserOutlined />} />
                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    {selectedEmployee.name}
                  </div>
                  <div style={{ color: '#666' }}>
                    {selectedEmployee.employeeId}
                  </div>
                </div>
              </Col>
              <Col span={18}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="部门" span={1}>
                    <Tag color="blue">{selectedEmployee.department}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="职位" span={1}>
                    {selectedEmployee.position}
                  </Descriptions.Item>
                  <Descriptions.Item label="状态" span={1}>
                    <Tag color={selectedEmployee.status === '在职' ? 'green' : 'orange'}>
                      {selectedEmployee.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="技能等级" span={1}>
                    <Tag color="gold">{selectedEmployee.skillLevel}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="入职日期" span={2}>
                    {selectedEmployee.joinDate}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Descriptions title="基本信息" column={2} size="small" bordered>
              <Descriptions.Item label={<><IdcardOutlined /> 性别</>}>
                {selectedEmployee.gender}
              </Descriptions.Item>
              <Descriptions.Item label="年龄">
                {selectedEmployee.age}岁
              </Descriptions.Item>
              <Descriptions.Item label="学历">
                {selectedEmployee.education}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>
                {selectedEmployee.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> 邮箱</>} span={2}>
                {selectedEmployee.email}
              </Descriptions.Item>
              <Descriptions.Item label="紧急联系人" span={2}>
                {selectedEmployee.emergencyContact}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeManagement;