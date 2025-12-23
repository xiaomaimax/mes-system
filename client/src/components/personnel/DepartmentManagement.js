import { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Modal, Tag, Statistic, Tree, message } from 'antd';
import { 
  TeamOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  BranchesOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const DepartmentManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 部门数据
  const departmentData = [
    {
      key: '1',
      departmentId: 'DEPT001',
      departmentName: '生产部',
      parentDepartment: '制造中心',
      manager: '张主管',
      managerPhone: '13800138001',
      employeeCount: 45,
      description: '负责产品生产制造',
      status: '正常',
      createDate: '2020-01-15',
      attendanceRate: 97.2,
      budget: 500000
    },
    {
      key: '2',
      departmentId: 'DEPT002',
      departmentName: '质量部',
      parentDepartment: '制造中心',
      manager: '李经理',
      managerPhone: '13800138002',
      employeeCount: 18,
      description: '负责产品质量控制和检验',
      status: '正常',
      createDate: '2020-01-15',
      attendanceRate: 98.5,
      budget: 200000
    },
    {
      key: '3',
      departmentId: 'DEPT003',
      departmentName: '设备部',
      parentDepartment: '制造中心',
      manager: '王工程师',
      managerPhone: '13800138003',
      employeeCount: 22,
      description: '负责设备维护和管理',
      status: '关注',
      createDate: '2020-01-15',
      attendanceRate: 94.8,
      budget: 300000
    },
    {
      key: '4',
      departmentId: 'DEPT004',
      departmentName: '技术部',
      parentDepartment: '研发中心',
      manager: '陈总监',
      managerPhone: '13800138004',
      employeeCount: 28,
      description: '负责技术研发和工艺改进',
      status: '正常',
      createDate: '2020-01-15',
      attendanceRate: 96.1,
      budget: 800000
    },
    {
      key: '5',
      departmentId: 'DEPT005',
      departmentName: '人事部',
      parentDepartment: '管理中心',
      manager: '刘主任',
      managerPhone: '13800138005',
      employeeCount: 8,
      description: '负责人力资源管理',
      status: '正常',
      createDate: '2020-01-15',
      attendanceRate: 99.2,
      budget: 150000
    }
  ];

  // 组织架构树数据
  const orgTreeData = [
    {
      title: '公司总部',
      key: '0',
      children: [
        {
          title: '制造中心',
          key: '0-0',
          children: [
            { title: '生产部 (45人)', key: '0-0-0' },
            { title: '质量部 (18人)', key: '0-0-1' },
            { title: '设备部 (22人)', key: '0-0-2' }
          ]
        },
        {
          title: '研发中心',
          key: '0-1',
          children: [
            { title: '技术部 (28人)', key: '0-1-0' },
            { title: '工艺部 (15人)', key: '0-1-1' }
          ]
        },
        {
          title: '管理中心',
          key: '0-2',
          children: [
            { title: '人事部 (8人)', key: '0-2-0' },
            { title: '财务部 (6人)', key: '0-2-1' },
            { title: '行政部 (4人)', key: '0-2-2' }
          ]
        }
      ]
    }
  ];

  const columns = [
    {
      title: '部门编号',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 100
    },
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text) => (
        <Space>
          <TeamOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '上级部门',
      dataIndex: 'parentDepartment',
      key: 'parentDepartment'
    },
    {
      title: '部门负责人',
      dataIndex: 'manager',
      key: 'manager'
    },
    {
      title: '联系电话',
      dataIndex: 'managerPhone',
      key: 'managerPhone'
    },
    {
      title: '员工数量',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      render: (count) => (
        <Tag color="blue">{count}人</Tag>
      )
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: (rate) => (
        <Tag color={rate >= 95 ? 'green' : 'orange'}>
          {rate}%
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<UserOutlined />}>
            员工
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

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 ${record.departmentName} 吗？`,
      onOk() {
        message.success('删除成功');
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存部门信息:', values);
      message.success(editingRecord ? '更新成功' : '添加成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        {/* 部门统计 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="部门总数"
              value={departmentData.length}
              prefix={<TeamOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总员工数"
              value={departmentData.reduce((sum, dept) => sum + dept.employeeCount, 0)}
              prefix={<UserOutlined />}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均出勤率"
              value={(departmentData.reduce((sum, dept) => sum + dept.attendanceRate, 0) / departmentData.length).toFixed(1)}
              prefix={<SettingOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预算"
              value={(departmentData.reduce((sum, dept) => sum + dept.budget, 0) / 10000).toFixed(0)}
              prefix={<BranchesOutlined />}
              suffix="万元"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="部门列表">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Input.Search
                  placeholder="搜索部门名称..."
                  style={{ width: 300 }}
                  onSearch={(value) => console.log('搜索:', value)}
                />
                <Select placeholder="上级部门" style={{ width: 150 }} allowClear>
                  <Option value="制造中心">制造中心</Option>
                  <Option value="研发中心">研发中心</Option>
                  <Option value="管理中心">管理中心</Option>
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增部门
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={departmentData}
              pagination={{
                total: departmentData.length,
                pageSize: 8,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              size="small"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="组织架构">
            <Tree
              showLine
              defaultExpandAll
              treeData={orgTreeData}
              style={{ background: '#fafafa', padding: '16px', borderRadius: '6px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑部门模态框 */}
      <Modal
        title={editingRecord ? '编辑部门信息' : '新增部门'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="部门编号"
                rules={[{ required: true, message: '请输入部门编号' }]}
              >
                <Input placeholder="请输入部门编号" />
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
            name="parentDepartment"
            label="上级部门"
            rules={[{ required: true, message: '请选择上级部门' }]}
          >
            <Select placeholder="请选择上级部门">
              <Option value="制造中心">制造中心</Option>
              <Option value="研发中心">研发中心</Option>
              <Option value="管理中心">管理中心</Option>
            </Select>
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
                name="managerPhone"
                label="负责人电话"
                rules={[{ required: true, message: '请输入负责人电话' }]}
              >
                <Input placeholder="请输入负责人电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="部门预算(元)"
                rules={[{ required: true, message: '请输入部门预算' }]}
              >
                <Input type="number" placeholder="请输入部门预算" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="部门状态"
                rules={[{ required: true, message: '请选择部门状态' }]}
              >
                <Select placeholder="请选择部门状态">
                  <Option value="正常">正常</Option>
                  <Option value="关注">关注</Option>
                  <Option value="暂停">暂停</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="部门职责"
            rules={[{ required: true, message: '请输入部门职责' }]}
          >
            <TextArea rows={4} placeholder="请输入部门职责描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;