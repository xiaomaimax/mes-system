import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  TimePicker,
  Radio,
  Checkbox,
  Divider,
  Alert,
  Steps,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';
import ButtonActions from '../../utils/buttonActions';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const WorkReportManagement = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportType, setReportType] = useState('production'); // production, quality, exception, maintenance
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  // 使用 DataService 获取工作报告数据
  // Requirements: 2.3, 2.5
  const { 
    data: workReportsData, 
    loading, 
    error, 
    refetch 
  } = useDataService(
    () => DataService.getWorkReports(),
    [],
    { useCache: true, cacheKey: 'work_reports' }
  );

  // 处理数据转换
  const [workReportData, setWorkReportData] = useState([]);
  useEffect(() => {
    if (workReportsData && Array.isArray(workReportsData)) {
      // 转换API数据为表格格式
      const convertedReports = workReportsData.map((report, index) => ({
        key: report.id || index,
        reportId: report.report_id || `WR-${report.id}`,
        reportType: report.report_type || 'production',
        taskNumber: report.task_number || '-',
        productName: report.product_name || '-',
        operator: report.operator_name || '-',
        operatorId: report.operator_id || '-',
        workshop: report.workshop || '-',
        workstation: report.workstation || '-',
        shift: report.shift || '-',
        reportDate: report.report_date || '-',
        startTime: report.start_time || '-',
        endTime: report.end_time || '-',
        workHours: report.work_hours || 0,
        planQuantity: report.plan_quantity || 0,
        actualQuantity: report.actual_quantity || 0,
        qualifiedQuantity: report.qualified_quantity || 0,
        defectQuantity: report.defect_quantity || 0,
        efficiency: report.efficiency || 0,
        status: report.status || 'pending',
        remarks: report.remarks || '',
        submitTime: report.submit_time || '-',
        approver: report.approver_name || null,
        approveTime: report.approve_time || null,
        exceptionType: report.exception_type || '',
        downtime: report.downtime || 0,
        _originalReport: report
      }));
      setWorkReportData(convertedReports);
    }
  }, [workReportsData]);

  const columns = [
    {
      title: '报工单号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '报工类型',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 100,
      render: (type) => {
        const typeMap = {
          production: { color: 'blue', text: '生产报工' },
          quality: { color: 'green', text: '质量报工' },
          exception: { color: 'red', text: '异常报工' },
          maintenance: { color: 'orange', text: '维修报工' }
        };
        const { color, text } = typeMap[type];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '任务单号',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '操作员',
      key: 'operatorInfo',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.operator}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.operatorId}</div>
        </div>
      )
    },
    {
      title: '车间/工位',
      key: 'location',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.workshop}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.workstation}</div>
        </div>
      )
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 80,
    },
    {
      title: '工作时间',
      key: 'workTime',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.startTime} - {record.endTime}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.workHours}h</div>
        </div>
      )
    },
    {
      title: '产量情况',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <div>实际: {record.actualQuantity}/{record.planQuantity}</div>
          <div style={{ fontSize: '12px', color: record.defectQuantity > 0 ? '#ff4d4f' : '#52c41a' }}>
            合格: {record.qualifiedQuantity} 不良: {record.defectQuantity}
          </div>
        </div>
      )
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency) => (
        <span style={{ 
          color: efficiency >= 95 ? '#52c41a' : efficiency >= 85 ? '#faad14' : '#ff4d4f' 
        }}>
          {efficiency}%
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          draft: { color: 'default', text: '草稿' },
          pending: { color: 'processing', text: '待审批' },
          approved: { color: 'success', text: '已审批' },
          rejected: { color: 'error', text: '已驳回' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 140,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleApprove(record)}
            >
              审批
            </Button>
          )}
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleEdit = (record) => {
    setReportType(record.reportType);
    form.setFieldsValue({
      ...record,
      reportDate: record.reportDate && record.reportDate !== '-' ? dayjs(record.reportDate) : null,
      workTime: record.startTime && record.endTime && record.startTime !== '-' ? [
        dayjs(record.startTime, 'HH:mm'),
        dayjs(record.endTime, 'HH:mm')
      ] : null,
    });
    setModalVisible(true);
  };

  const handleApprove = (record) => {
    Modal.confirm({
      title: '审批确认',
      content: `确认审批报工单 ${record.reportId}？`,
      onOk: () => {
        safeMessage.success('审批成功');
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);

      // 处理时间数据
      const submitData = {
        ...values,
        reportType,
        reportDate: values.reportDate ? values.reportDate.format('YYYY-MM-DD') : null,
        startTime: values.workTime ? values.workTime[0].format('HH:mm') : null,
        endTime: values.workTime ? values.workTime[1].format('HH:mm') : null,
        workHours: values.workTime ?
          values.workTime[1].diff(values.workTime[0], 'hour', true) : 0,
        submitTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      console.log('提交报工数据:', submitData);
      safeMessage.success('报工记录保存成功！');
      setModalVisible(false);
      form.resetFields();
      setCurrentStep(0);
      // 刷新数据
      refetch();
    } catch (error) {
      console.error('提交失败:', error);
      safeMessage.error('保存失败，请重试！');
    } finally {
      setSubmitLoading(false);
    }
  };

  const reportTypeOptions = [
    { label: '生产报工', value: 'production', icon: <BarChartOutlined /> },
    { label: '质量报工', value: 'quality', icon: <CheckCircleOutlined /> },
    { label: '异常报工', value: 'exception', icon: <ExclamationCircleOutlined /> },
    { label: '维修报工', value: 'maintenance', icon: <ClockCircleOutlined /> }
  ];

  const renderReportForm = () => {
    const steps = [
      { title: '基本信息', description: '选择报工类型和基本信息' },
      { title: '工作详情', description: '填写工作时间和产量信息' },
      { title: '确认提交', description: '确认信息并提交报工' }
    ];

    return (
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
        
        {currentStep === 0 && (
          <div>
            <Form.Item label="报工类型" required>
              <Radio.Group 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%' }}
              >
                <Row gutter={16}>
                  {reportTypeOptions.map(option => (
                    <Col span={6} key={option.value}>
                      <Radio.Button 
                        value={option.value} 
                        style={{ width: '100%', textAlign: 'center', height: '60px', lineHeight: '60px' }}
                      >
                        <div>
                          {option.icon}
                          <div>{option.label}</div>
                        </div>
                      </Radio.Button>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="taskNumber"
                  label="任务单号"
                  rules={[{ required: true, message: '请选择任务单号' }]}
                >
                  <Select placeholder="请选择任务单号">
                    <Option value="PT-2024-001">PT-2024-001 - 产品A</Option>
                    <Option value="PT-2024-002">PT-2024-002 - 产品B</Option>
                    <Option value="PT-2024-003">PT-2024-003 - 产品C</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="operatorId"
                  label="操作员工号"
                  rules={[{ required: true, message: '请输入操作员工号' }]}
                >
                  <Input placeholder="请输入操作员工号" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="workshop"
                  label="车间"
                  rules={[{ required: true, message: '请选择车间' }]}
                >
                  <Select placeholder="请选择车间">
                    <Option value="车间A">车间A</Option>
                    <Option value="车间B">车间B</Option>
                    <Option value="车间C">车间C</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="workstation"
                  label="工位"
                  rules={[{ required: true, message: '请选择工位' }]}
                >
                  <Select placeholder="请选择工位">
                    <Option value="工位A1">工位A1</Option>
                    <Option value="工位A2">工位A2</Option>
                    <Option value="工位B1">工位B1</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="shift"
                  label="班次"
                  rules={[{ required: true, message: '请选择班次' }]}
                >
                  <Select placeholder="请选择班次">
                    <Option value="白班">白班 (08:00-20:00)</Option>
                    <Option value="夜班">夜班 (20:00-08:00)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="reportDate"
                  label="报工日期"
                  rules={[{ required: true, message: '请选择报工日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="workTime"
                  label="工作时间"
                  rules={[{ required: true, message: '请选择工作时间' }]}
                >
                  <TimePicker.RangePicker 
                    style={{ width: '100%' }}
                    format="HH:mm"
                  />
                </Form.Item>
              </Col>
            </Row>

            {reportType === 'production' && (
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="planQuantity"
                    label="计划产量"
                    rules={[{ required: true, message: '请输入计划产量' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="计划产量"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="actualQuantity"
                    label="实际产量"
                    rules={[{ required: true, message: '请输入实际产量' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="实际产量"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="qualifiedQuantity"
                    label="合格数量"
                    rules={[{ required: true, message: '请输入合格数量' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="合格数量"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {reportType === 'exception' && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="exceptionType"
                    label="异常类型"
                    rules={[{ required: true, message: '请选择异常类型' }]}
                  >
                    <Select placeholder="请选择异常类型">
                      <Option value="设备故障">设备故障</Option>
                      <Option value="物料短缺">物料短缺</Option>
                      <Option value="质量问题">质量问题</Option>
                      <Option value="人员缺勤">人员缺勤</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="downtime"
                    label="停机时间(小时)"
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      min={0}
                      step={0.5}
                      placeholder="停机时间"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item
              name="remarks"
              label="备注说明"
            >
              <TextArea 
                rows={4} 
                placeholder="请详细描述工作情况、遇到的问题或需要说明的事项"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <Alert
              message="请确认报工信息"
              description="提交后将进入审批流程，请仔细核对所有信息"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card title="报工信息确认" size="small">
              <p><strong>报工类型：</strong>{reportTypeOptions.find(opt => opt.value === reportType)?.label}</p>
              <p><strong>任务单号：</strong>{form.getFieldValue('taskNumber')}</p>
              <p><strong>操作员：</strong>{form.getFieldValue('operatorId')}</p>
              <p><strong>工作地点：</strong>{form.getFieldValue('workshop')} - {form.getFieldValue('workstation')}</p>
              <p><strong>班次：</strong>{form.getFieldValue('shift')}</p>
              {reportType === 'production' && (
                <p><strong>产量：</strong>实际 {form.getFieldValue('actualQuantity')} / 计划 {form.getFieldValue('planQuantity')}</p>
              )}
            </Card>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                上一步
              </Button>
            )}
            <Button onClick={() => {
              setModalVisible(false);
              form.resetFields();
              setCurrentStep(0);
            }}>
              取消
            </Button>
            {currentStep < 2 ? (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                提交报工
              </Button>
            )}
          </Space>
        </div>
      </Form>
    );
  };

  // 计算统计数据
  const summaryData = {
    todayReports: workReportData.length,
    pendingApproval: workReportData.filter(r => r.status === 'pending').length,
    totalWorkHours: workReportData.reduce((sum, r) => sum + (r.workHours || 0), 0),
    averageEfficiency: workReportData.length > 0 
      ? (workReportData.reduce((sum, r) => sum + (r.efficiency || 0), 0) / workReportData.length).toFixed(1)
      : 0,
    totalOutput: workReportData.reduce((sum, r) => sum + (r.actualQuantity || 0), 0),
    qualifiedRate: workReportData.length > 0
      ? ((workReportData.reduce((sum, r) => sum + (r.qualifiedQuantity || 0), 0) / 
          workReportData.reduce((sum, r) => sum + (r.actualQuantity || 0), 0)) * 100).toFixed(1)
      : 0
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据加载失败"
          description={error.message || '获取工作报告数据失败，请稍后重试'}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      )}

      {/* 统计面板 */}
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="今日报工"
                value={summaryData.todayReports}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="待审批"
                value={summaryData.pendingApproval}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="总工时"
                value={summaryData.totalWorkHours}
                suffix="h"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="平均效率"
                value={summaryData.averageEfficiency}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="总产量"
                value={summaryData.totalOutput}
                suffix="件"
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="合格率"
                value={summaryData.qualifiedRate}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Card 
        title={
          <Space>
            <FileTextOutlined />
            报工记录管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              新增报工
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索报工单号/任务单号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="报工类型" style={{ width: 120 }}>
              <Option value="production">生产报工</Option>
              <Option value="quality">质量报工</Option>
              <Option value="exception">异常报工</Option>
              <Option value="maintenance">维修报工</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }}>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已审批</Option>
              <Option value="rejected">已驳回</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 报工记录表格 */}
        <Spin spinning={loading}>
          {workReportData.length === 0 && !loading ? (
            <Alert
              message="暂无数据"
              description="当前没有工作报告数据"
              type="info"
              showIcon
            />
          ) : (
            <Table
              columns={columns}
              dataSource={workReportData}
              loading={loading}
              pagination={{
                total: workReportData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1800 }}
            />
          )}
        </Spin>
      </Card>

      {/* 新增/编辑报工模态框 */}
      <Modal
        title="报工记录"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setCurrentStep(0);
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {renderReportForm()}
      </Modal>
    </div>
  );
};

export default WorkReportManagement;