import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Modal, Tag, Tree, Switch, message } from 'antd';
import { 
  SafetyCertificateOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const RoleManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 角色数据
  const roleData = [
    {
      key: '1',
      roleId: 'ROLE001',
      roleName: '超级管理员',
      roleCode: 'SUPER_ADMIN',
      description: '系统最高权限，可访问所有功能',
      userCount: 2,
      permissions: ['ALL'],
      status: '启用',
      createTime: '2020-01-15 09:00:00',
      isSystem: true
    },
    {
      key: '2',
      roleId: 'ROLE002',
      roleName: '部门管理员',
      roleCode: 'DEPT_ADMIN',
      description: '部门级管理权限，可管理本部门相关功能',
      userCount: 8,
      permissions: ['USER_VIEW', 'USER_EDIT', 'REPORT_VIEW', 'DATA_EXPORT'],
      status: '启用',
      createTime: '2020-01-15 09:30:00',
      isSystem: false
    },
    {
      key: '3',
      roleId: 'ROLE003',
      roleName: '技术管理员',
      roleCode: 'TECH_ADMIN',
      description: '技术模块管理权限，可管理工艺和设备相关功能',
      userCount: 5,
      permissions: ['PROCESS_MANAGE', 'EQUIPMENT_MANAGE', 'INTEGRATION_MANAGE'],
      status: '启用',
      createTime: '2021-03-20 14:15:00',
      isSystem: false
    },
    {
      key: '4',
      roleId: 'ROLE004',
      roleName: '普通用户',
      roleCode: 'NORMAL_USER',
      description: '基础操作权限，只能查看和录入数据',
      userCount: 120,
      permissions: ['DATA_VIEW', 'DATA_INPUT', 'REPORT_VIEW'],
      status: '启用',
      createTime: '2020-01-15 10:00:00',
      isSystem: true
    },
    {
      key: '5',
      roleId: 'ROLE005',
      roleName: '质量检验员',
      roleCode: 'QC_USER',
      description: '质量检验相关权限',
      userCount: 15,
      permissions: ['QUALITY_CHECK', 'DATA_INPUT', 'REPORT_VIEW'],
      status: '启用',
      createTime: '2022-06-10 11:30:00',
      isSystem: false
    }
  ];

  // 权限树数据
  const permissionTreeData = [
    {
      title: '用户管理',
      key: 'user',
      children: [
        { title: '查看用户', key: 'USER_VIEW' },
        { title: '编辑用户', key: 'USER_EDIT' },
        { title: '删除用户', key: 'USER_DELETE' },
        { title: '重置密码', key: 'USER_RESET_PWD' }
      ]
    },
    {
      title: '生产管理',
      key: 'production',
      children: [
        { title: '生产计划', key: 'PROD_PLAN' },
        { title: '任务执行', key: 'PROD_EXECUTE' },
        { title: '数据录入', key: 'DATA_INPUT' },
        { title: '生产报表', key: 'PROD_REPORT' }
      ]
    },
    {
      title: '工艺管理',
      key: 'process',
      children: [
        { title: '工艺查看', key: 'PROCESS_VIEW' },
        { title: '工艺编辑', key: 'PROCESS_EDIT' },
        { title: '工艺管理', key: 'PROCESS_MANAGE' }
      ]
    },
    {
      title: '设备管理',
      key: 'equipment',
      children: [
        { title: '设备查看', key: 'EQUIPMENT_VIEW' },
        { title: '设备维护', key: 'EQUIPMENT_MAINTAIN' },
        { title: '设备管理', key: 'EQUIPMENT_MANAGE' }
      ]
    },
    {
      title: '质量管理',
      key: 'quality',
      children: [
        { title: '质量检验', key: 'QUALITY_CHECK' },
        { title: '质量分析', key: 'QUALITY_ANALYSIS' },
        { title: '质量管理', key: 'QUALITY_MANAGE' }
      ]
    },
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '系统配置', key: 'SYSTEM_CONFIG' },
        { title: '数据导出', key: 'DATA_EXPORT' },
        { title: '系统集成', key: 'INTEGRATION_MANAGE' }
      ]
    },
    {
      title: '报表分析',
      key: 'report',
      children: [
        { title: '查看报表', key: 'REPORT_VIEW' },
        { title: '导出报表', key: 'REPORT_EXPORT' },
        { title: '自定义报表', key: 'REPORT_CUSTOM' }
      ]
    }
  ];

  const columns = [
    {
      title: '角色ID',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 100
    },
    {
      title: '角色信息',
      key: 'roleInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
            {record.roleName}
            {record.isSystem && (
              <Tag color="red" style={{ marginLeft: '8px' }}>系统</Tag>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {record.roleCode}
          </div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => (
        <Tag color="blue" icon={<UserOutlined />}>
          {count}人
        </Tag>
      )
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 100,
      render: (permissions) => (
        <Tag color="green">
          {permissions.includes('ALL') ? '全部' : `${permissions.length}项`}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            disabled={record.isSystem}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            disabled={record.isSystem || record.userCount > 0}
          >
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
    form.setFieldsValue({
      ...record,
      permissions: record.permissions
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存角色信息:', values);
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
              placeholder="搜索角色名称..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="启用">启用</Option>
              <Option value="禁用">禁用</Option>
            </Select>
            <Select placeholder="类型" style={{ width: 120 }} allowClear>
              <Option value="system">系统角色</Option>
              <Option value="custom">自定义角色</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={roleData}
          pagination={{
            total: roleData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新增/编辑角色模态框 */}
      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
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
                name="roleId"
                label="角色ID"
                rules={[{ required: true, message: '请输入角色ID' }]}
              >
                <Input placeholder="请输入角色ID" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleCode"
                label="角色编码"
                rules={[{ required: true, message: '请输入角色编码' }]}
              >
                <Input placeholder="请输入角色编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="启用">启用</Option>
                  <Option value="禁用">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="权限配置"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Tree
              checkable
              defaultExpandAll
              treeData={permissionTreeData}
              style={{ 
                background: '#fafafa', 
                padding: '16px', 
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                maxHeight: '300px',
                overflow: 'auto'
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;