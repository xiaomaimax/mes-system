import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Modal, Form, Input, Select, Space, Tag, Popconfirm } from 'antd';
import { Plus, Edit, Delete, Shield, User } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('token');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE + '/roles', {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      setRoles(response.data.data || []);
    } catch (error) {
      message.error('加载角色列表失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const openModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue(role);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRole) {
        await axios.put(API_BASE + '/roles/' + editingRole.id, values, {
          headers: { Authorization: 'Bearer ' + getToken() }
        });
        message.success('角色更新成功');
      } else {
        await axios.post(API_BASE + '/roles', values, {
          headers: { Authorization: 'Bearer ' + getToken() }
        });
        message.success('角色创建成功');
      }
      setModalVisible(false);
      loadRoles();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (roleId) => {
    try {
      await axios.delete(API_BASE + '/roles/' + roleId, {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      message.success('角色删除成功');
      loadRoles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '角色代码', dataIndex: 'role_name', key: 'role_name', width: 150 },
    { title: '角色名称', dataIndex: 'role_display_name', key: 'role_display_name', width: 150 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '类型', dataIndex: 'is_system', key: 'is_system', width: 100,
      render: (isSystem) => (<Tag color={isSystem ? 'red' : 'blue'}>{isSystem ? '系统角色' : '自定义'}</Tag>)
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<User />} onClick={() => window.location.href = '/system/user-roles?roleId=' + record.id}>分配用户</Button>
          {!record.is_system && (
            <>
              <Button type="link" icon={<Edit />} onClick={() => openModal(record)}>编辑</Button>
              <Popconfirm title="确定删除这个角色吗？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger icon={<Delete />}>删除</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<Space><Shield />角色管理</Space>}
        extra={<Button type="primary" icon={<Plus />} onClick={() => openModal()}>新建角色</Button>}
      >
        <Table columns={columns} dataSource={roles} loading={loading} rowKey=id pagination={{ pageSize: 20 }} />
      </Card>
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout=vertical onFinish={handleSubmit}>
          <Form.Item name=role_name label=角色代码 rules={[{ required: true, message: '请输入角色代码' }]} extra=英文字母和下划线>
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name=role_display_name label=角色名称 rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder=如：部门经理 />
          </Form.Item>
          <Form.Item name=description label=描述>
            <TextArea rows={3} placeholder=角色描述 />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
