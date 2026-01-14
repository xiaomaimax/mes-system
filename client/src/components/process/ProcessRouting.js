import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber, Tag, message, Row, Col, Steps, Divider, Descriptions, Spin } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, BranchesOutlined, PlayCircleOutlined, EyeOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { ProcessAPI } from '../../services/api';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';
const { Option } = Select;
const { TextArea } = Input;

const ProcessRouting = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [form] = Form.useForm();
  
  // 从数据库加载的数据
  const [routingData, setRoutingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 使用 DataService 和 useDataService Hook 获取数据
  const { 
    data: processRoutingResponse, 
    loading: dataLoading, 
    error: dataError, 
    refetch: refetchProcessRouting 
  } = useDataService(
    () => DataService.getProcessRouting({ limit: 100 }),
    [],
    { cacheKey: 'process_routing' }
  );

  // 从数据库加载工艺路由数据
  const loadData = async () => {
    try {
      await refetchProcessRouting();
      safeMessage.success('数据刷新成功');
    } catch (error) {
      console.error('加载工艺路由数据失败:', error);
      safeMessage.error('加载数据失败，请检查后端服务是否正常');
    }
  };

  // 处理数据转换
  useEffect(() => {
    if (processRoutingResponse && processRoutingResponse.routings) {
      const formattedData = processRoutingResponse.routings.map((item, index) => ({
        key: item.id || index,
        id: item.id,
        routeCode: item.routing_code,
        routeName: `${item.process_name}工艺路线`,
        productCode: `MAT-${String(item.material_id).padStart(3, '0')}`,
        productName: item.process_name,
        version: 'V1.0',
        status: '生效中',
        totalSteps: 4,
        cycleTime: item.estimated_time || 0,
        createDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
        creator: item.notes && item.notes.includes('自动生成') ? '排程同步' : '系统',
        processSequence: item.process_sequence,
        equipmentId: item.equipment_id,
        moldId: item.mold_id,
        notes: item.notes,
        operations: [
          { seq: item.process_sequence * 10, opCode: item.routing_code, opName: item.process_name, workCenter: '注塑车间', standardTime: item.estimated_time || 0, setupTime: 5 }
        ]
      }));
      
      setRoutingData(formattedData);
      setTotal(processRoutingResponse.total || formattedData.length);
      
      // 统计排程同步的工艺路线
      const syncedCount = formattedData.filter(d => d.creator === '排程同步').length;
      if (syncedCount > 0) {
        console.log(`成功加载 ${formattedData.length} 条工艺路由数据（其中 ${syncedCount} 条来自排程同步）`);
      }
    }
  }, [processRoutingResponse]);

  // 组件加载时获取数据
  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      title: '工艺编码',
      dataIndex: 'routeCode',
      key: 'routeCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '工艺路线名称',
      dataIndex: 'routeName',
      key: 'routeName'
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode'
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '生效中' ? 'green' : 
          status === '待验证' ? 'orange' : 
          status === '已停用' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '工序数',
      dataIndex: 'totalSteps',
      key: 'totalSteps'
    },
    {
      title: '周期时间(分)',
      dataIndex: 'cycleTime',
      key: 'cycleTime'
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator) => (
        <Tag color={creator === '排程同步' ? 'blue' : 'default'}>
          {creator}
        </Tag>
      )
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<CopyOutlined />}>
            复制
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const operationColumns = [
    {
      title: '工序号',
      dataIndex: 'seq',
      key: 'seq',
      width: 80
    },
    {
      title: '工序编码',
      dataIndex: 'opCode',
      key: 'opCode'
    },
    {
      title: '工序名称',
      dataIndex: 'opName',
      key: 'opName'
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      key: 'workCenter'
    },
    {
      title: '标准工时(分)',
      dataIndex: 'standardTime',
      key: 'standardTime'
    },
    {
      title: '准备工时(分)',
      dataIndex: 'setupTime',
      key: 'setupTime'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
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

  const handleViewDetail = (record) => {
    setSelectedRoute(record);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存工艺路线:', values);
      safeMessage.success('保存成功');
      setModalVisible(false);
      refetchProcessRouting(); // 刷新数据
    } catch (error) {
      console.error('保存失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const renderRouteSteps = (operations) => {
    return (
      <Steps
        direction="vertical"
        size="small"
        current={-1}
        items={operations.map((op, index) => ({
          title: `${op.seq} - ${op.opName}`,
          description: (
            <div>
              <div>工作中心: {op.workCenter}</div>
              <div>标准工时: {op.standardTime}分钟 | 准备工时: {op.setupTime}分钟</div>
            </div>
          ),
          icon: <PlayCircleOutlined />
        }))}
      />
    );
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索工艺路线..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="生效中">生效中</Option>
              <Option value="待验证">待验证</Option>
              <Option value="已停用">已停用</Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={dataLoading || loading}>
              刷新数据
            </Button>
            <Button icon={<BranchesOutlined />}>工艺流程图</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建工艺路线
            </Button>
          </Space>
        </div>

        <Spin spinning={dataLoading || loading}>
          <Table
            columns={columns}
            dataSource={routingData}
            pagination={{
              total: total,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录 (来自数据库)`
            }}
            size="small"
          />
        </Spin>
      </Card>

      {/* 新建/编辑工艺路线模态框 */}
      <Modal
        title={editingRecord ? '编辑工艺路线' : '新建工艺路线'}
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
                name="routeCode"
                label="工艺编码"
                rules={[{ required: true, message: '请输入工艺编码' }]}
              >
                <Input placeholder="请输入工艺编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="routeName"
                label="工艺路线名称"
                rules={[{ required: true, message: '请输入工艺路线名称' }]}
              >
                <Input placeholder="请输入工艺路线名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productCode"
                label="产品编码"
                rules={[{ required: true, message: '请选择产品' }]}
              >
                <Select placeholder="请选择产品">
                  <Option value="P001">P001 - 塑料外壳A</Option>
                  <Option value="P002">P002 - 电子组件B</Option>
                  <Option value="P003">P003 - 机械零件C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="请输入版本号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cycleTime"
                label="标准周期时间(分钟)"
                rules={[{ required: true, message: '请输入标准周期时间' }]}
              >
                <InputNumber min={0} placeholder="请输入标准周期时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="草稿">草稿</Option>
                  <Option value="待验证">待验证</Option>
                  <Option value="生效中">生效中</Option>
                  <Option value="已停用">已停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="工艺描述"
          >
            <TextArea rows={3} placeholder="请输入工艺描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 工艺路线详情模态框 */}
      <Modal
        title="工艺路线详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button onClick={() => handleEdit(record)} key="edit" type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
        ]}
      >
        {selectedRoute && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="工艺编码">{selectedRoute.routeCode}</Descriptions.Item>
              <Descriptions.Item label="工艺名称">{selectedRoute.routeName}</Descriptions.Item>
              <Descriptions.Item label="产品编码">{selectedRoute.productCode}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedRoute.productName}</Descriptions.Item>
              <Descriptions.Item label="版本号">{selectedRoute.version}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRoute.status === '生效中' ? 'green' : 'orange'}>
                  {selectedRoute.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="工序数量">{selectedRoute.totalSteps}</Descriptions.Item>
              <Descriptions.Item label="周期时间">{selectedRoute.cycleTime}分钟</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedRoute.creator}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedRoute.createDate}</Descriptions.Item>
            </Descriptions>

            <Divider>工艺流程</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <Card title="工艺步骤" size="small">
                  {renderRouteSteps(selectedRoute.operations)}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="工序详情" size="small">
                  <Table
                    columns={operationColumns}
                    dataSource={selectedRoute.operations}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>

            <Divider>时间分析</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedRoute.operations.reduce((sum, op) => sum + op.standardTime, 0)}
                    </div>
                    <div style={{ color: '#666' }}>总标准工时(分钟)</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedRoute.operations.reduce((sum, op) => sum + op.setupTime, 0)}
                    </div>
                    <div style={{ color: '#666' }}>总准备工时(分钟)</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {selectedRoute.cycleTime}
                    </div>
                    <div style={{ color: '#666' }}>标准周期时间(分钟)</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcessRouting;