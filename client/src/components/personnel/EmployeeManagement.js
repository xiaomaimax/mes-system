import { useState, useEffect } from 'react';
import ButtonActions from '../../utils/buttonActions';
import { Card, Row, Col, Button, Space, Table, Form, Input, Select, Modal, Tag, Avatar, Descriptions, Upload, DatePicker, message, Spin, Alert, Drawer } from 'antd';

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
import {   UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  ReloadOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import moment from 'moment';

import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';
import useUIFeedback, { OPERATION_TYPES } from '../../hooks/useUIFeedback';
import DataSourceIndicator from '../common/DataSourceIndicator';
import ProgressIndicator, { FloatingProgress, PROGRESS_STATUS } from '../common/ProgressIndicator';
import StorageStatsDisplay, { StorageStatusIndicator } from '../common/StorageStatsDisplay';
import EnhancedLoading, { DataLoadingWrapper } from '../common/EnhancedLoading';

const { Option } = Select;
const { TextArea } = Input;

const EmployeeManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showStorageStats, setShowStorageStats] = useState(false);
  const [form] = Form.useForm();

  // UI反馈状态管理
  const uiFeedback = useUIFeedback({
    autoHideSuccess: true,
    autoHideError: false,
    showMessages: true,
    trackProgress: true,
    trackDataSource: true
  });

  // 使用 DataService 获取员工数据
  const { data: employeesData, loading, error, refetch } = useDataService(
    () => DataService.getEmployees(),
    [],
    { useCache: true, cacheTTL: 5 * 60 * 1000 }
  );

  // 监听数据变化以更新数据源状态
  useEffect(() => {
    if (employeesData && !loading && !error) {
      // 检测数据来源
      const dataSource = employeesData.fromMock ? 'memory' : 'local';
      uiFeedback.setSuccess('数据加载成功', dataSource);
    } else if (error) {
      uiFeedback.setError(error, '数据加载失败');
    }
  }, [employeesData, loading, error]);

  // 格式化员工数据用于表格显示
  const formatEmployeeData = (employees) => {
    if (!employees || !Array.isArray(employees)) return [];
    
    return employees.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      employeeId: item.employeeId || `EMP${String(item.id).padStart(3, '0')}`,
      name: item.name || '未知员工',
      gender: item.gender || '未设置', // 使用实际数据，无默认值
      age: item.age || '未设置', // 使用实际数据，无默认值
      department: item.department || '未设置',
      position: item.position || '未设置',
      phone: item.phone || '未设置', // 使用实际数据，无默认值
      email: item.email || '未设置',
      status: item.status || '未设置',
      joinDate: item.joinDate || '未设置', // 使用实际数据，无默认值
      education: item.education || '未设置', // 使用实际数据，无默认值
      skillLevel: item.skillLevel || '未设置', // 使用实际数据，无默认值
      emergencyContact: item.emergencyContact || '未设置', // 使用实际数据，无默认值
      shift: item.shift || '未设置',
      address: item.address || '未设置',
      remark: item.remark || ''
    }));
  };

  const employeeData = formatEmployeeData(employeesData?.items || []);

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
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            查看
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
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    try {
      setEditingRecord(null);
      form.resetFields();
      setModalVisible(true);
    } catch (error) {
      console.error('新增操作失败:', error);
      safeMessage.error('新增操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        joinDate: record.joinDate ? moment(record.joinDate) : null
      });
      setModalVisible(true);
    } catch (error) {
      console.error('编辑操作失败:', error);
      safeMessage.error('编辑操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleView = (record) => {
    try {
      setSelectedEmployee(record);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('查看操作失败:', error);
      safeMessage.error('查看操作失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除员工 ${record.name} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 使用UI反馈包装器执行删除操作
          await uiFeedback.executeAsync(
            async () => {
              const result = await DataService.deleteEmployee(record.id);
              
              if (result.success) {
                // 清除DataService的缓存
                DataService.clearCache('production');
                
                // 刷新useDataService的数据
                await refetch();
                
                return result;
              } else {
                throw new Error(result.message || '删除失败');
              }
            },
            OPERATION_TYPES.DELETE,
            '正在删除员工...',
            '员工删除成功',
            '员工删除失败'
          );
        } catch (error) {
          console.error('删除失败:', error);
          // 错误已经在executeAsync中处理
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      console.log('开始保存员工信息...');
      
      // 设置保存状态
      uiFeedback.setSaving('正在保存员工信息...');
      
      const values = await form.validateFields();
      console.log('表单验证通过，表单数据:', values);
      
      const employeeData = {
        employeeId: values.employeeId,
        name: values.name,
        department: values.department,
        position: values.position,
        phone: values.phone,
        email: values.email,
        gender: values.gender,
        age: values.age,
        education: values.education,
        skillLevel: values.skillLevel,
        joinDate: values.joinDate?.format?.('YYYY-MM-DD') || values.joinDate,
        emergencyContact: values.emergencyContact,
        address: values.address,
        remark: values.remark
      };

      console.log('准备发送的员工数据:', employeeData);

      // 模拟保存进度
      uiFeedback.simulateProgress(1500);

      let result;
      if (editingRecord) {
        console.log('执行更新员工操作, ID:', editingRecord.id);
        uiFeedback.updateProgress(30, '更新员工信息...');
        result = await DataService.updateEmployee(editingRecord.id, employeeData);
      } else {
        console.log('执行添加新员工操作');
        uiFeedback.updateProgress(30, '添加新员工...');
        result = await DataService.addEmployee(employeeData);
      }

      console.log('API调用结果:', result);

      if (result && result.success) {
        uiFeedback.updateProgress(70, '清除缓存...');
        
        // 清除DataService的缓存
        console.log('清除DataService缓存...');
        DataService.clearCache('production');
        
        uiFeedback.updateProgress(90, '刷新数据...');
        
        // 刷新useDataService的数据（这会清除useDataService的缓存并重新加载）
        console.log('开始刷新数据...');
        await refetch();
        console.log('数据刷新完成');
        
        // 设置成功状态
        const successMsg = editingRecord ? '员工信息更新成功' : '员工添加成功';
        const dataSource = result.warning ? 'memory' : 'local';
        uiFeedback.setSuccess(successMsg, dataSource);
        
        setModalVisible(false);
        
        // 如果有警告，显示额外提示
        if (result.warning) {
          safeMessage.warning(result.message, 5);
        }
      } else {
        console.error('API返回失败结果:', result);
        uiFeedback.setError(new Error(result?.message || '操作失败'), '保存失败');
      }
    } catch (error) {
      console.error('保存过程中发生错误:', error);
      console.error('错误堆栈:', error.stack);
      uiFeedback.setError(error, '保存失败');
    }
  };

  // 处理加载和错误状态
  if (error) {
    return (
      <div>
        <Card>
          <Alert
            message="数据加载失败"
            description={error.message || '无法加载员工数据，请检查后端服务'}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={refetch}>
                重试
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索员工姓名、编号..."
              style={{ width: 300 }}
              onSearch={(value) => {
                try {
                  console.log('搜索:', value);
                  // 这里应该实现实际的搜索功能
                } catch (error) {
                  console.error('搜索失败:', error);
                  safeMessage.error('搜索失败: ' + (error.message || '未知错误'));
                }
              }}
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
            {/* 数据来源指示器 */}
            <DataSourceIndicator 
              source={employeesData?.fromMock ? 'memory' : 'local'}
              syncStatus={uiFeedback.syncStatus}
              lastUpdate={uiFeedback.message}
              count={employeeData.length}
              showLabel={true}
              showTooltip={true}
              showCount={true}
              size="small"
            />
            
            {/* 存储统计指示器 */}
            <StorageStatusIndicator 
              showLabel={false}
              showStats={true}
              onClick={() => setShowStorageStats(true)}
            />
            
            <Button 
              icon={<ReloadOutlined />}
              onClick={async () => {
                try {
                  await uiFeedback.executeAsync(
                    async () => {
                      // 清除DataService的缓存
                      DataService.clearCache('production');
                      // 刷新useDataService的数据
                      await refetch();
                    },
                    OPERATION_TYPES.LOAD,
                    '正在刷新数据...',
                    '数据刷新成功',
                    '数据刷新失败'
                  );
                } catch (error) {
                  console.error('刷新失败:', error);
                }
              }}
              loading={uiFeedback.isLoading}
            >
              刷新
            </Button>
            <Button icon={<UploadOutlined />}>批量导入</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增员工
            </Button>
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => setShowStorageStats(true)}
            >
              统计
            </Button>
          </Space>
        </div>

        {/* 数据加载包装器 */}
        <DataLoadingWrapper
          loading={loading}
          error={error}
          empty={!loading && employeeData.length === 0}
          emptyText="暂无员工数据"
          dataSource={employeesData?.fromMock ? 'memory' : 'local'}
          showDataSource={true}
          loadingProps={{
            type: 'skeleton',
            showSkeleton: true,
            skeletonRows: 5,
            message: '正在加载员工数据...',
            dataSource: 'local'
          }}
        >
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
            locale={{ emptyText: '暂无员工数据' }}
          />
        </DataLoadingWrapper>
      </Card>

      {/* 浮动进度提示 */}
      <FloatingProgress
        visible={uiFeedback.isSaving || uiFeedback.isLoading || uiFeedback.isSuccess || uiFeedback.isError}
        operation={uiFeedback.operation}
        progress={uiFeedback.progress}
        status={uiFeedback.isError ? PROGRESS_STATUS.ERROR : 
                uiFeedback.isSuccess ? PROGRESS_STATUS.SUCCESS :
                PROGRESS_STATUS.RUNNING}
        message={uiFeedback.message}
        position="topRight"
        autoHide={true}
        hideDelay={2000}
      />

      {/* 存储统计抽屉 */}
      <Drawer
        title="存储统计信息"
        placement="right"
        width={500}
        open={showStorageStats}
        onClose={() => setShowStorageStats(false)}
      >
        <StorageStatsDisplay
          refreshInterval={10000}
          showActions={true}
          showDetails={true}
          compact={false}
        />
      </Drawer>

      {/* 新增/编辑员工模态框 */}
      <Modal
        title={editingRecord ? '编辑员工信息' : '新增员工'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
        confirmLoading={uiFeedback.isSaving}
        okText={uiFeedback.isSaving ? '保存中...' : '保存'}
      >
        {/* 保存进度指示器 */}
        {uiFeedback.isSaving && (
          <div style={{ marginBottom: '16px' }}>
            <ProgressIndicator
              visible={true}
              operation="save"
              progress={uiFeedback.progress}
              status={PROGRESS_STATUS.RUNNING}
              message={uiFeedback.message}
              detail={uiFeedback.detail}
              showPercentage={true}
              showIcon={true}
              showMessage={true}
              showDetail={true}
              size="small"
            />
          </div>
        )}
        
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