import { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Select, Modal, Tag, Tree, Switch, message, Alert, Descriptions, Input } from 'antd';

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
import {   TeamOutlined, 
  EditOutlined, 
  EyeOutlined, 
  PlusOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Option } = Select;

const DepartmentAccess = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form] = Form.useForm();

  // 系统模块定义
  const systemModules = [
    {
      key: 'process',
      title: '工艺管理',
      description: '工艺路线、参数、文件管理',
      category: '核心模块'
    },
    {
      key: 'production',
      title: '生产管理',
      description: '生产计划、任务执行、报工管理',
      category: '核心模块'
    },
    {
      key: 'equipment',
      title: '设备管理',
      description: '设备维护、点检、档案管理',
      category: '核心模块'
    },
    {
      key: 'quality',
      title: '质量管理',
      description: '质量检验、追溯、分析',
      category: '核心模块'
    },
    {
      key: 'inventory',
      title: '库存管理',
      description: '库存控制、出入库、盘点',
      category: '核心模块'
    },
    {
      key: 'personnel',
      title: '人员管理',
      description: '员工档案、考勤、培训管理',
      category: '管理模块'
    },
    {
      key: 'integration',
      title: '系统集成',
      description: '外部系统接口和数据同步',
      category: '技术模块'
    },
    {
      key: 'reports',
      title: '报表分析',
      description: '数据分析和报表生成',
      category: '分析模块'
    },
    {
      key: 'settings',
      title: '系统设置',
      description: '用户管理、权限配置',
      category: '管理模块'
    }
  ];

  // 部门权限配置数据
  const departmentAccessData = [
    {
      key: '1',
      departmentId: 'DEPT001',
      departmentName: '生产部',
      description: '负责产品生产制造',
      userCount: 45,
      allowedModules: ['production', 'equipment', 'inventory', 'reports'],
      accessLevel: '部门级',
      manager: '张主管',
      status: '启用',
      lastUpdate: '2024-12-20 10:30:00'
    },
    {
      key: '2',
      departmentId: 'DEPT002',
      departmentName: '质量部',
      description: '负责产品质量控制和检验',
      userCount: 18,
      allowedModules: ['quality', 'process', 'reports'],
      accessLevel: '部门级',
      manager: '李经理',
      status: '启用',
      lastUpdate: '2024-12-19 14:20:00'
    },
    {
      key: '3',
      departmentId: 'DEPT003',
      departmentName: '技术部',
      description: '负责技术研发和工艺改进',
      userCount: 28,
      allowedModules: ['process', 'equipment', 'integration', 'reports'],
      accessLevel: '部门级',
      manager: '王总监',
      status: '启用',
      lastUpdate: '2024-12-18 16:45:00'
    },
    {
      key: '4',
      departmentId: 'DEPT004',
      departmentName: '仓储部',
      description: '负责物料和成品仓储管理',
      userCount: 12,
      allowedModules: ['inventory', 'reports'],
      accessLevel: '部门级',
      manager: '赵主任',
      status: '启用',
      lastUpdate: '2024-12-17 11:30:00'
    },
    {
      key: '5',
      departmentId: 'DEPT005',
      departmentName: '信息部',
      description: '负责信息系统管理和维护',
      userCount: 8,
      allowedModules: ['process', 'production', 'equipment', 'quality', 'inventory', 'personnel', 'integration', 'reports', 'settings'],
      accessLevel: '系统级',
      manager: '陈经理',
      status: '启用',
      lastUpdate: '2024-12-22 09:15:00'
    }
  ];

  // 模块树数据
  const moduleTreeData = [
    {
      title: '核心模块',
      key: 'core',
      children: [
        { title: '工艺管理', key: 'process' },
        { title: '生产管理', key: 'production' },
        { title: '设备管理', key: 'equipment' },
        { title: '质量管理', key: 'quality' },
        { title: '库存管理', key: 'inventory' }
      ]
    },
    {
      title: '管理模块',
      key: 'management',
      children: [
        { title: '人员管理', key: 'personnel' },
        { title: '系统设置', key: 'settings' }
      ]
    },
    {
      title: '技术模块',
      key: 'technical',
      children: [
        { title: '系统集成', key: 'integration' }
      ]
    },
    {
      title: '分析模块',
      key: 'analysis',
      children: [
        { title: '报表分析', key: 'reports' }
      ]
    }
  ];

  const columns = [
    {
      title: '部门ID',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 100
    },
    {
      title: '部门信息',
      key: 'departmentInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ marginRight: '8px' }} />
            {record.departmentName}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 100
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 80,
      render: (count) => (
        <Tag color="blue">{count}人</Tag>
      )
    },
    {
      title: '访问级别',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 100,
      render: (level) => (
        <Tag color={level === '系统级' ? 'red' : 'green'}>
          {level}
        </Tag>
      )
    },
    {
      title: '可访问模块',
      dataIndex: 'allowedModules',
      key: 'allowedModules',
      render: (modules) => (
        <div>
          {modules.length > 3 ? (
            <div>
              {modules.slice(0, 3).map(moduleKey => {
                const module = systemModules.find(m => m.key === moduleKey);
                return module ? (
                  <Tag key={moduleKey} color="blue" style={{ marginBottom: '2px' }}>
                    {module.title}
                  </Tag>
                ) : null;
              })}
              <Tag color="default">+{modules.length - 3}个</Tag>
            </div>
          ) : (
            modules.map(moduleKey => {
              const module = systemModules.find(m => m.key === moduleKey);
              return module ? (
                <Tag key={moduleKey} color="blue" style={{ marginBottom: '2px' }}>
                  {module.title}
                </Tag>
              ) : null;
            })
          )}
        </div>
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
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 140
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<SettingOutlined />}>
            配置
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
      allowedModules: record.allowedModules
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedDepartment(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存部门权限配置:', values);
      safeMessage.success(editingRecord ? '更新成功' : '添加成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      {/* 权限配置说明 */}
      <Alert
        message="部门权限配置说明"
        description="通过配置部门可访问的模块，实现基于部门的菜单访问控制。不同部门的用户登录后只能看到被授权的功能模块。"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select placeholder="部门" style={{ width: 150 }} allowClear>
              <Option value="生产部">生产部</Option>
              <Option value="质量部">质量部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="仓储部">仓储部</Option>
              <Option value="信息部">信息部</Option>
            </Select>
            <Select placeholder="访问级别" style={{ width: 120 }} allowClear>
              <Option value="系统级">系统级</Option>
              <Option value="部门级">部门级</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="启用">启用</Option>
              <Option value="禁用">禁用</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增部门权限
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={departmentAccessData}
          pagination={{
            total: departmentAccessData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 新增/编辑部门权限模态框 */}
      <Modal
        title={editingRecord ? '编辑部门权限' : '新增部门权限'}
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
                name="departmentId"
                label="部门ID"
                rules={[{ required: true, message: '请输入部门ID' }]}
              >
                <Input placeholder="请输入部门ID" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="departmentName"
                label="部门名称"
                rules={[{ required: true, message: '请输入部门名称' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="部门描述"
            rules={[{ required: true, message: '请输入部门描述' }]}
          >
            <Input placeholder="请输入部门描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="部门负责人"
                rules={[{ required: true, message: '请输入部门负责人' }]}
              >
                <Input placeholder="请输入部门负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accessLevel"
                label="访问级别"
                rules={[{ required: true, message: '请选择访问级别' }]}
              >
                <Select placeholder="请选择访问级别">
                  <Option value="部门级">部门级</Option>
                  <Option value="系统级">系统级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allowedModules"
            label="可访问模块"
            rules={[{ required: true, message: '请选择可访问模块' }]}
          >
            <Tree
              checkable
              defaultExpandAll
              treeData={moduleTreeData}
              style={{ 
                background: '#fafafa', 
                padding: '16px', 
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}
            />
          </Form.Item>

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
        </Form>
      </Modal>

      {/* 部门权限详情模态框 */}
      <Modal
        title="部门权限详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedDepartment && (
          <div>
            <Descriptions title="基本信息" column={2} size="small" bordered>
              <Descriptions.Item label="部门ID">
                {selectedDepartment.departmentId}
              </Descriptions.Item>
              <Descriptions.Item label="部门名称">
                {selectedDepartment.departmentName}
              </Descriptions.Item>
              <Descriptions.Item label="部门描述" span={2}>
                {selectedDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="部门负责人">
                {selectedDepartment.manager}
              </Descriptions.Item>
              <Descriptions.Item label="用户数量">
                {selectedDepartment.userCount}人
              </Descriptions.Item>
              <Descriptions.Item label="访问级别">
                <Tag color={selectedDepartment.accessLevel === '系统级' ? 'red' : 'green'}>
                  {selectedDepartment.accessLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedDepartment.status === '启用' ? 'green' : 'red'}>
                  {selectedDepartment.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="可访问模块" size="small" style={{ marginTop: '16px' }}>
              <Row gutter={[8, 8]}>
                {selectedDepartment.allowedModules.map(moduleKey => {
                  const module = systemModules.find(m => m.key === moduleKey);
                  return module ? (
                    <Col span={8} key={moduleKey}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <AppstoreOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {module.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {module.description}
                        </div>
                        <Tag color="blue" style={{ marginTop: '4px' }}>
                          {module.category}
                        </Tag>
                      </Card>
                    </Col>
                  ) : null;
                })}
              </Row>
            </Card>

            <Descriptions title="更新信息" column={1} size="small" bordered style={{ marginTop: '16px' }}>
              <Descriptions.Item label="最后更新时间">
                {selectedDepartment.lastUpdate}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentAccess;