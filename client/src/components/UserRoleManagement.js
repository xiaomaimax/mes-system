import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Modal, Transfer, Space, Tag, Select } from 'antd';
import { UsergroupAdd, User } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const UserRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [targetRoles, setTargetRoles] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE + '/users', {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      setUsers(response.data.data || []);
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await axios.get(API_BASE + '/roles', {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      setRoles(response.data.data || []);
    } catch (error) {
      message.error('加载角色列表失败');
    }
  };

  const openModal = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.get(API_BASE + '/user-roles/user/' + user.id + '/roles', {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      const assignedRoles = response.data.data || [];
      setUserRoles(assignedRoles.map(r => r.id));
      setTargetRoles(assignedRoles.map(r => r.id));
    } catch (error) {
      setUserRoles([]);
      setTargetRoles([]);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(API_BASE + '/user-roles/user/' + selectedUser.id + '/roles', {
        roleIds: targetRoles
      }, {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      message.success('角色分配成功');
      setModalVisible(false);
    } catch (error) {
      message.error('分配失败');
    }
  };

  const roleColumns = [
    { title: '角色代码', dataIndex: 'role_name', key: 'role_name' },
    { title: '角色名称', dataIndex: 'role_display_name', key: 'role_display_name' }
  ];

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '姓名', dataIndex: 'full_name', key: 'full_name', width: 150 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
    {
      title: '当前角色', key: 'roles', width: 200,
      render: (_, record) => {
        const userRecord = users.find(u => u.id === record.id);
        return userRecord ? <UserTag userId={userRecord.id} /> : null;
      }
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, record) => (
        <Button type="primary" icon={<UsergroupAdd />} onClick={() => openModal(record)}>
          分配角色
        </Button>
      )
    }
  ];

  const UserTag = ({ userId }) => {
    const [userRoleList, setUserRoleList] = useState([]);
    
    useEffect(() => {
      const load = async () => {
        try {
          const res = await axios.get(API_BASE + '/user-roles/user/' + userId + '/roles', {
            headers: { Authorization: 'Bearer ' + getToken() }
          });
          setUserRoleList(res.data.data || []);
        } catch (e) {}
      };
      load();
    }, [userId]);
    
    return (
      <Space wrap>
        {userRoleList.map(r => <Tag key={r.id} color="blue">{r.role_display_name}</Tag>)}
      </Space>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={<Space><User />用户角色分配</Space>}>
        <Table columns={columns} dataSource={users} loading={loading} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title=分配角色 -  + (selectedUser?.full_name || '')
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>用户：</strong>{selectedUser?.username} ({selectedUser?.full_name}) - {selectedUser?.department}
        </div>
        <Transfer
          dataSource={roles}
          titles={['可选角色', '已选角色']}
          targetKeys={targetRoles}
          onChange={setTargetRoles}
          render={item => item.role_display_name}
          rowKey={item => item.id}
          showSearch
          filterOption={(input, option) => option.role_display_name.includes(input)}
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
};

export default UserRoleManagement;
