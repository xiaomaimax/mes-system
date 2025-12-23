import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Modal, Tag, Avatar, Descriptions, DatePicker, Switch, message } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const UserManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // 用户数据
  const userData = [
    {
      key: '1',
      userId: 'USR001',
      username: 'admin',
      realName: '系统管理员',
      email: 'admin@company.com',
      phone: '13800138001',
      department: '信息部',
      role: '超级管理员',
      status: '正常',
      createTime: '2020-01-15 09:00:00',
      lastLogin: '2024-12-22 10:30:15',
      loginCount: 1250,
      isOnline: true,
      remark: '系统超级管理员账号'
    },
    {
      key: '2',
      userId: 'USR002',
      username: 'prod_manager',
      realName: '张主管',
      email: 'zhang@company.com',
      phone: '13800138002',
      department: '生产部',
      role: '部门管理员',
      status: '正常',
      createTime: '2022-03-20 14:30:00',
      lastLogin: '2024-12-22 09:45:20',
      loginCount: 890,
      isOnline: true,
      remark: '生产部门负责人'
    },
    {
      key: '3',
      userId: 'USR003',
      username: 'quality_user',
      realName: '李检验员',
      email: 'li@company.com',
      phone: '13800138003',
      department: '质量部',
      role: '普通用户',
      status: '锁定',
      createTime: '2023-01-10 11:15:00',
      lastLogin: '2024-12-21 16:20:30',
      loginCount: 456,
      isOnline: false,
      remark: '质量检验员，因违规操作被锁定'
    },
    {
      key: '4',
      userId: 'USR004',
      username: 'tech_engineer',
      realName: '王工程师',
      email: 'wang@company.com',
      phone: '13800138004',
      department: '技术部',
      role: '技术管理员',
      status: '正常',
      createTime: '2021-08-05 16:45:00',
      lastLogin: '2024-12-22 08:15:10',
      loginCount: 678,
      isOnline: false,
      remark: '技术部工艺工程师'
    },
    {
      key: '5',
      userId: 'USR005',
      username: 'warehouse_user',
      realName: '赵仓管',
      email: 'zhao@company.com',
      phone: '13800138005',
      department: '仓储部',
      role: '普通用户',
      status: '正常',
      createTime: '2023-06-12 10:20:00',
      lastLogin: '2024-12-22 07:30:45',
      loginCount: 234,
      isOnline: false,
      remark: '仓储管理员'
    }
  ];

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80
    },
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.isOnline ? '#52c41a' : '#d9d9d9',
              marginRight: '8px'
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.realName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            <PhoneOutlined /> {record.phone}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <MailOutlined /> {record.email}
          </div>
        </div>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Tag color={
          dept === '信息部' ? 'gold' : 
          dept === '生产部' ? 'blue' : 
          dept === '质量部' ? 'green' : 
          dept === '技术部' ? 'purple' : 'orange'
        }>
          {dept}
        </Tag>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={
          role === '超级管理员' ? 'red' :
          role === '部门管理员' ? 'orange' :
          role === '技术管理员' ? 'blue' : 'default'
        }>
          {role}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={status === '正常' ? 'green' : 'red'}>
            {status}
          </Tag>
          {record.isOnline && (
            <Tag color="blue" style={{ marginTop: '2px' }}>在线</Tag>
          )}
        </div>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 140
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 80
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
          {record.status === '正常' ? (
            <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleLock(record)}>
              锁定
            </Button>
          ) : (
            <Button type="link" size="small" icon={<UnlockOutlined />} onClick={() => handleUnlock(record)}>
              解锁
            </Button>
          )}
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => handleResetPassword(record)}>
            重置密码
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
    setSelectedUser(record);
    setDetailModalVisible(true);
  };

  const handleLock = (record) => {
    Modal.confirm({
      title: '确认锁定用户',
      content: `确定要锁定用户 ${record.realName} 吗？锁定后该用户将无法登录系统。`,
      onOk() {
        message.success('用户已锁定');
      }
    });
  };

  const handleUnlock = (record) => {
    Modal.confirm({
      title: '确认解锁用户',
      content: `确定要解锁用户 ${record.realName} 吗？`,
      onOk() {
        message.success('用户已解锁');
      }
    });
  };

  const handleResetPassword = (record) => {
    Modal.confirm({
      title: '确认重置密码',
      content: `确定要重置用户 ${record.realName} 的密码吗？新密码将通过邮件发送给用户。`,
      onOk() {
        message.success('密码重置成功，新密码已发送至用户邮箱');
      }
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.realName} 吗？此操作不可恢复。`,
      onOk() {
        message.success('删除成功');
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存用户信息:', values);
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
              placeholder="搜索用户名、姓名..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="部门" style={{ width: 120 }} allowClear>
              <Option value="信息部">信息部</Option>
              <Option value="生产部">生产部</Option>
              <Option value="质量部">质量部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="仓储部">仓储部</Option>
            </Select>
            <Select placeholder="角色" style={{ width: 120 }} allowClear>
              <Option value="超级管理员">超级管理员</Option>
              <Option value="部门管理员">部门管理员</Option>
              <Option value="技术管理员">技术管理员</Option>
              <Option value="普通用户">普通用户</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="正常">正常</Option>
              <Option value="锁定">锁定</Option>
              <Option value="禁用">禁用</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={userData}
          pagination={{
            total: userData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={editingRecord ? '编辑用户信息' : '新增用户'}
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
                name="userId"
                label="用户ID"
                rules={[{ required: true, message: '请输入用户ID' }]}
              >
                <Input placeholder="请输入用户ID" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="信息部">信息部</Option>
                  <Option value="生产部">生产部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="仓储部">仓储部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="超级管理员">超级管理员</Option>
                  <Option value="部门管理员">部门管理员</Option>
                  <Option value="技术管理员">技术管理员</Option>
                  <Option value="普通用户">普通用户</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="正常">正常</Option>
                  <Option value="锁定">锁定</Option>
                  <Option value="禁用">禁用</Option>
                </Select>
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

          {!editingRecord && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="初始密码"
                  rules={[{ required: true, message: '请输入初始密码' }]}
                >
                  <Input.Password placeholder="请输入初始密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情模态框 */}
      <Modal
        title="用户详细信息"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedUser && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: selectedUser.isOnline ? '#52c41a' : '#d9d9d9'
                    }}
                  />
                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    {selectedUser.realName}
                  </div>
                  <div style={{ color: '#666' }}>
                    {selectedUser.userId}
                  </div>
                  {selectedUser.isOnline && (
                    <Tag color="green" style={{ marginTop: '4px' }}>在线</Tag>
                  )}
                </div>
              </Col>
              <Col span={18}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="用户名" span={1}>
                    {selectedUser.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="部门" span={1}>
                    <Tag color="blue">{selectedUser.department}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="角色" span={1}>
                    <Tag color="orange">{selectedUser.role}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="状态" span={1}>
                    <Tag color={selectedUser.status === '正常' ? 'green' : 'red'}>
                      {selectedUser.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间" span={2}>
                    {selectedUser.createTime}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Descriptions title="联系信息" column={2} size="small" bordered>
              <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>
                {selectedUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> 邮箱地址</>}>
                {selectedUser.email}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="登录统计" column={2} size="small" bordered style={{ marginTop: '16px' }}>
              <Descriptions.Item label="最后登录时间">
                {selectedUser.lastLogin}
              </Descriptions.Item>
              <Descriptions.Item label="累计登录次数">
                {selectedUser.loginCount} 次
              </Descriptions.Item>
            </Descriptions>

            {selectedUser.remark && (
              <Descriptions title="备注信息" column={1} size="small" bordered style={{ marginTop: '16px' }}>
                <Descriptions.Item label="备注">
                  {selectedUser.remark}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;