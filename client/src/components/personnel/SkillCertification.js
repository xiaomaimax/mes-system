import { useState } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, DatePicker, Modal, Tag, Progress, Badge, Alert } from 'antd';

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
import {   SafetyCertificateOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SkillCertification = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 技能认证数据
  const certificationData = [
    {
      key: '1',
      employeeId: 'EMP001',
      name: '张三',
      department: '生产部',
      certificationName: 'PLC编程认证',
      certificationLevel: '高级',
      issueDate: '2023-06-15',
      expiryDate: '2025-06-15',
      status: '有效',
      score: 95,
      issuingOrg: '工业自动化协会',
      certificateNo: 'PLC2023001'
    },
    {
      key: '2',
      employeeId: 'EMP002',
      name: '李四',
      department: '质量部',
      certificationName: 'ISO9001质量管理',
      certificationLevel: '中级',
      issueDate: '2023-08-20',
      expiryDate: '2025-08-20',
      status: '有效',
      score: 88,
      issuingOrg: '质量认证中心',
      certificateNo: 'ISO2023002'
    },
    {
      key: '3',
      employeeId: 'EMP003',
      name: '王五',
      department: '设备部',
      certificationName: '电工操作证',
      certificationLevel: '高级',
      issueDate: '2022-12-10',
      expiryDate: '2024-12-10',
      status: '即将到期',
      score: 92,
      issuingOrg: '安全生产监督局',
      certificateNo: 'ELE2022003'
    },
    {
      key: '4',
      employeeId: 'EMP004',
      name: '赵六',
      department: '技术部',
      certificationName: '工艺工程师认证',
      certificationLevel: '专家',
      issueDate: '2023-03-25',
      expiryDate: '2026-03-25',
      status: '有效',
      score: 96,
      issuingOrg: '工程师协会',
      certificateNo: 'ENG2023004'
    },
    {
      key: '5',
      employeeId: 'EMP005',
      name: '孙七',
      department: '生产部',
      certificationName: '安全生产培训证',
      certificationLevel: '初级',
      issueDate: '2023-01-15',
      expiryDate: '2024-01-15',
      status: '已过期',
      score: 78,
      issuingOrg: '安全培训中心',
      certificateNo: 'SAF2023005'
    }
  ];

  // 认证类型统计
  const certificationTypes = [
    { type: 'PLC编程认证', count: 12, level: '技术类' },
    { type: 'ISO9001质量管理', count: 18, level: '质量类' },
    { type: '电工操作证', count: 25, level: '安全类' },
    { type: '工艺工程师认证', count: 8, level: '技术类' },
    { type: '安全生产培训证', count: 45, level: '安全类' }
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
      key: 'name'
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
      title: '认证名称',
      dataIndex: 'certificationName',
      key: 'certificationName'
    },
    {
      title: '认证等级',
      dataIndex: 'certificationLevel',
      key: 'certificationLevel',
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
      title: '获得日期',
      dataIndex: 'issueDate',
      key: 'issueDate'
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          '有效': { color: 'green', icon: <CheckCircleOutlined /> },
          '即将到期': { color: 'orange', icon: <ExclamationCircleOutlined /> },
          '已过期': { color: 'red', icon: <ClockCircleOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', icon: null };
        return (
          <Badge 
            status={config.color === 'green' ? 'success' : config.color === 'orange' ? 'warning' : 'error'} 
            text={status} 
          />
        );
      }
    },
    {
      title: '考试成绩',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <div>
          <Progress percent={score} size="small" />
          <span style={{ fontSize: '12px' }}>{score}分</span>
        </div>
      )
    },
    {
      title: '证书编号',
      dataIndex: 'certificateNo',
      key: 'certificateNo'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存技能认证:', values);
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 统计即将到期的认证
  const expiringCerts = certificationData.filter(cert => cert.status === '即将到期').length;
  const expiredCerts = certificationData.filter(cert => cert.status === '已过期').length;

  return (
    <div>
      {/* 到期提醒 */}
      {(expiringCerts > 0 || expiredCerts > 0) && (
        <Alert
          message="认证到期提醒"
          description={`有 ${expiringCerts} 个认证即将到期，${expiredCerts} 个认证已过期，请及时安排复训或续证。`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button size="small" type="text">
              查看详情
            </Button>
          }
        />
      )}

      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={18}>
          <Card>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Input.Search
                  placeholder="搜索员工姓名或认证名称..."
                  style={{ width: 300 }}
                  onSearch={(value) => console.log('搜索:', value)}
                />
                <Select placeholder="部门" style={{ width: 120 }} allowClear>
                  <Option value="生产部">生产部</Option>
                  <Option value="质量部">质量部</Option>
                  <Option value="设备部">设备部</Option>
                  <Option value="技术部">技术部</Option>
                </Select>
                <Select placeholder="认证状态" style={{ width: 120 }} allowClear>
                  <Option value="有效">有效</Option>
                  <Option value="即将到期">即将到期</Option>
                  <Option value="已过期">已过期</Option>
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增认证
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={certificationData}
              pagination={{
                total: certificationData.length,
                pageSize: 8,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              size="small"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card title="认证类型统计" style={{ marginBottom: '16px' }}>
            <div>
              {certificationTypes.map((item, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px' }}>{item.type}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.count}人</span>
                  </div>
                  <Progress 
                    percent={(item.count / 50 * 100).toFixed(0)} 
                    size="small" 
                    strokeColor={item.level === '技术类' ? '#1890ff' : item.level === '质量类' ? '#52c41a' : '#fa8c16'}
                  />
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {item.level}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="认证状态概览">
            <Row gutter={8}>
              <Col span={24} style={{ marginBottom: '12px' }}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#f6ffed', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                    {certificationData.filter(cert => cert.status === '有效').length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>有效认证</div>
                </div>
              </Col>
              <Col span={12} style={{ marginBottom: '8px' }}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fff7e6', borderRadius: '4px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {expiringCerts}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>即将到期</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fff2f0', borderRadius: '4px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5222d' }}>
                    {expiredCerts}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>已过期</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 新增/编辑认证模态框 */}
      <Modal
        title={editingRecord ? '编辑技能认证' : '新增技能认证'}
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
                name="certificationName"
                label="认证名称"
                rules={[{ required: true, message: '请输入认证名称' }]}
              >
                <Select placeholder="请选择认证名称">
                  <Option value="PLC编程认证">PLC编程认证</Option>
                  <Option value="ISO9001质量管理">ISO9001质量管理</Option>
                  <Option value="电工操作证">电工操作证</Option>
                  <Option value="工艺工程师认证">工艺工程师认证</Option>
                  <Option value="安全生产培训证">安全生产培训证</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="certificationLevel"
                label="认证等级"
                rules={[{ required: true, message: '请选择认证等级' }]}
              >
                <Select placeholder="请选择认证等级">
                  <Option value="初级">初级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="高级">高级</Option>
                  <Option value="专家">专家</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issueDate"
                label="获得日期"
                rules={[{ required: true, message: '请选择获得日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择获得日期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="到期日期"
                rules={[{ required: true, message: '请选择到期日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择到期日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="score"
                label="考试成绩"
                rules={[{ required: true, message: '请输入考试成绩' }]}
              >
                <Input type="number" min={0} max={100} placeholder="请输入考试成绩" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="certificateNo"
                label="证书编号"
                rules={[{ required: true, message: '请输入证书编号' }]}
              >
                <Input placeholder="请输入证书编号" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="issuingOrg"
            label="颁发机构"
            rules={[{ required: true, message: '请输入颁发机构' }]}
          >
            <Input placeholder="请输入颁发机构" />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillCertification;