import { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Table, Button, Space, Tag, Tree, Input } from 'antd';
import {   KeyOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  SettingOutlined
} from '@ant-design/icons';

const PermissionManagement = () => {
  // 权限数据
  const permissionData = [
    {
      key: '1',
      permissionCode: 'USER_VIEW',
      permissionName: '查看用户',
      module: '用户管理',
      description: '查看用户列表和基本信息',
      type: '查询',
      status: '启用'
    },
    {
      key: '2',
      permissionCode: 'USER_EDIT',
      permissionName: '编辑用户',
      module: '用户管理',
      description: '编辑用户信息和状态',
      type: '操作',
      status: '启用'
    },
    {
      key: '3',
      permissionCode: 'PROD_PLAN',
      permissionName: '生产计划',
      module: '生产管理',
      description: '制定和调整生产计划',
      type: '管理',
      status: '启用'
    },
    {
      key: '4',
      permissionCode: 'QUALITY_CHECK',
      permissionName: '质量检验',
      module: '质量管理',
      description: '执行质量检验操作',
      type: '操作',
      status: '启用'
    }
  ];

  const columns = [
    {
      title: '权限编码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
      width: 150
    },
    {
      title: '权限名称',
      dataIndex: 'permissionName',
      key: 'permissionName',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <KeyOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          {text}
        </div>
      )
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
      render: (module) => (
        <Tag color="blue">{module}</Tag>
      )
    },
    {
      title: '权限类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={
          type === '查询' ? 'green' :
          type === '操作' ? 'orange' :
          type === '管理' ? 'red' : 'default'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <Card title="权限列表">
        <div style={{ marginBottom: '16px' }}>
          <Input.Search
            placeholder="搜索权限名称或编码..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={permissionData}
          pagination={{
            total: permissionData.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PermissionManagement;