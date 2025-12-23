import React, { useState } from 'react';
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
  Badge,
  Progress,
  Alert,
  Timeline,
  List,
  Tooltip,
  Descriptions
} from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TruckOutlined,
  InboxOutlined,
  BellOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';const { 
Option } = Select;
const { RangePicker } = DatePicker;

const LineMaterialsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [deliveryForm] = Form.useForm();

  // 模拟线边物料数据
  const lineMaterialsData = [
    {
      key: '1',
      materialCode: 'MAT-001',
      materialName: '塑料粒子A',
      specification: 'PP-H1500',
      unit: 'kg',
      productionLine: '生产线1',
      workshop: '车间A',
      currentStock: 150,
      minStock: 200,
      maxStock: 500,
      safetyStock: 180,
      dailyConsumption: 45,
      estimatedDays: 3.3,
      status: 'low_stock',
      supplier: '供应商A',
      lastDeliveryDate: '2024-01-14',
      lastDeliveryQuantity: 300,
      nextDeliveryDate: '2024-01-16',
      plannedDeliveryQuantity: 350,
      location: 'A1-001',
      batchNumber: 'B20240114001',
      expiryDate: '2024-07-14',
      qualityStatus: 'qualified',
      remarks: '库存偏低，需要补料'
    },
    {
      key: '2',
      materialCode: 'MAT-002',
      materialName: '包装膜',
      specification: 'PE-0.05mm',
      unit: 'm',
      productionLine: '生产线2',
      workshop: '车间B',
      currentStock: 2800,
      minStock: 1000,
      maxStock: 5000,
      safetyStock: 1200,
      dailyConsumption: 320,
      estimatedDays: 8.8,
      status: 'normal',
      supplier: '供应商B',
      lastDeliveryDate: '2024-01-12',
      lastDeliveryQuantity: 2000,
      nextDeliveryDate: '2024-01-20',
      plannedDeliveryQuantity: 2000,
      location: 'B2-003',
      batchNumber: 'B20240112002',
      expiryDate: '2025-01-12',
      qualityStatus: 'qualified',
      remarks: '库存正常'
    },
    {
      key: '3',
      materialCode: 'MAT-003',
      materialName: '标签纸',
      specification: '80x60mm',
      unit: '张',
      productionLine: '生产线3',
      workshop: '车间A',
      currentStock: 50,
      minStock: 100,
      maxStock: 1000,
      safetyStock: 120,
      dailyConsumption: 80,
      estimatedDays: 0.6,
      status: 'urgent',
      supplier: '供应商C',
      lastDeliveryDate: '2024-01-10',
      lastDeliveryQuantity: 500,
      nextDeliveryDate: '2024-01-15',
      plannedDeliveryQuantity: 800,
      location: 'A3-005',
      batchNumber: 'B20240110003',
      expiryDate: '2026-01-10',
      qualityStatus: 'qualified',
      remarks: '紧急补料！库存严重不足'
    }
  ];

  // 统计数据
  const summaryData = {
    totalMaterials: 25,
    normalStock: 15,
    lowStock: 7,
    urgentStock: 3,
    totalValue: 285000,
    pendingDeliveries: 8,
    todayConsumption: 1250,
    avgTurnoverDays: 12.5
  };

  // 物料消耗趋势（最近7天）
  const consumptionTrend = [
    { date: '01-09', consumption: 1180 },
    { date: '01-10', consumption: 1220 },
    { date: '01-11', consumption: 1350 },
    { date: '01-12', consumption: 1280 },
    { date: '01-13', consumption: 1150 },
    { date: '01-14', consumption: 1320 },
    { date: '01-15', consumption: 1250 }
  ];

  const columns = [
    {
      title: '物料信息',
      key: 'material',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.materialName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.materialCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.specification}</div>
        </div>
      )
    },
    {
      title: '位置',
      key: 'location',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.workshop}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>位置: {record.location}</div>
        </div>
      )
    },
    {
      title: '库存状态',
      key: 'stock',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 'bold' }}>当前: {record.currentStock} {record.unit}</span>
          </div>
          <Progress 
            percent={Math.min((record.currentStock / record.maxStock) * 100, 100)}
            size="small"
            status={
              record.currentStock <= record.minStock ? 'exception' : 
              record.currentStock <= record.safetyStock ? 'active' : 'success'
            }
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            最小: {record.minStock} | 安全: {record.safetyStock}
          </div>
        </div>
      )
    },
    {
      title: '消耗情况',
      key: 'consumption',
      width: 120,
      render: (_, record) => (
        <div>
          <div>日消耗: {record.dailyConsumption} {record.unit}</div>
          <div style={{ 
            fontSize: '12px', 
            color: record.estimatedDays <= 1 ? '#ff4d4f' : record.estimatedDays <= 3 ? '#faad14' : '#52c41a' 
          }}>
            可用: {record.estimatedDays.toFixed(1)}天
          </div>
        </div>
      )
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          normal: { color: 'success', text: '正常' },
          low_stock: { color: 'warning', text: '库存偏低' },
          urgent: { color: 'error', text: '紧急补料' },
          overstocked: { color: 'default', text: '库存过多' }
        };
        const { color, text } = statusMap[status];
        return <Badge status={color} text={text} />;
      }
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100
    },
    {
      title: '下次配送',
      key: 'nextDelivery',
      width: 120,
      render: (_, record) => (
        <div>
          <div>{record.nextDeliveryDate}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.plannedDeliveryQuantity} {record.unit}
          </div>
        </div>
      )
    },
    {
      title: '批次信息',
      key: 'batch',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>批次: {record.batchNumber}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            到期: {record.expiryDate}
          </div>
          <Tag color="green" size="small">{record.qualityStatus === 'qualified' ? '合格' : '待检'}</Tag>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<TruckOutlined />}
            onClick={() => handleDelivery(record)}
          >
            配送
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
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
            icon={<DeleteOutlined />} 
            danger
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleDelivery = (record) => {
    deliveryForm.setFieldsValue({
      materialCode: record.materialCode,
      materialName: record.materialName,
      currentStock: record.currentStock,
      recommendedQuantity: record.maxStock - record.currentStock
    });
    setSelectedRecord(record);
    setDeliveryModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交线边物料数据:', values);
      message.success('线边物料信息保存成功！');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (values) => {
    try {
      setLoading(true);
      console.log('提交配送申请:', values);
      message.success('配送申请提交成功！');
      setDeliveryModalVisible(false);
      deliveryForm.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="物料总数"
            value={summaryData.totalMaterials}
            prefix={<InboxOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="库存正常"
            value={summaryData.normalStock}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="库存偏低"
            value={summaryData.lowStock}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="紧急补料"
            value={summaryData.urgentStock}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="今日消耗"
            value={summaryData.todayConsumption}
            suffix="kg"
            prefix={<BarChartOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="待配送"
            value={summaryData.pendingDeliveries}
            suffix="项"
            prefix={<TruckOutlined />}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      {renderSummaryCards()}

      {/* 紧急补料提醒 */}
      {summaryData.urgentStock > 0 && (
        <Alert
          message="紧急补料提醒"
          description={`当前有 ${summaryData.urgentStock} 种物料库存严重不足，请立即安排补料！`}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card 
        title={
          <Space>
            <ShoppingCartOutlined />
            线边物料管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<BellOutlined />}>
              补料提醒
            </Button>
            <Button icon={<SearchOutlined />}>
              查询
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
            >
              新增物料
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索物料编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="生产线" style={{ width: 120 }}>
              <Option value="line_1">生产线1</Option>
              <Option value="line_2">生产线2</Option>
              <Option value="line_3">生产线3</Option>
            </Select>
            <Select placeholder="库存状态" style={{ width: 120 }}>
              <Option value="normal">正常</Option>
              <Option value="low_stock">库存偏低</Option>
              <Option value="urgent">紧急补料</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={lineMaterialsData}
          loading={loading}
          pagination={{
            total: lineMaterialsData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新增/编辑物料模态框 */}
      <Modal
        title="线边物料信息"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="materialCode"
                label="物料编码"
                rules={[{ required: true, message: '请输入物料编码' }]}
              >
                <Input placeholder="请输入物料编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="materialName"
                label="物料名称"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input placeholder="请输入物料名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="specification"
                label="规格型号"
              >
                <Input placeholder="请输入规格型号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select placeholder="请选择单位">
                  <Option value="kg">千克(kg)</Option>
                  <Option value="g">克(g)</Option>
                  <Option value="m">米(m)</Option>
                  <Option value="张">张</Option>
                  <Option value="个">个</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplier"
                label="供应商"
              >
                <Select placeholder="请选择供应商">
                  <Option value="供应商A">供应商A</Option>
                  <Option value="供应商B">供应商B</Option>
                  <Option value="供应商C">供应商C</Option>
                </Select>
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
                name="productionLine"
                label="生产线"
                rules={[{ required: true, message: '请选择生产线' }]}
              >
                <Select placeholder="请选择生产线">
                  <Option value="生产线1">生产线1</Option>
                  <Option value="生产线2">生产线2</Option>
                  <Option value="生产线3">生产线3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="location"
                label="存放位置"
              >
                <Input placeholder="请输入存放位置" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="currentStock"
                label="当前库存"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="当前库存" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="minStock"
                label="最小库存"
                rules={[{ required: true, message: '请输入最小库存' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="最小库存" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="safetyStock"
                label="安全库存"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="安全库存" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="maxStock"
                label="最大库存"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="最大库存" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 配送申请模态框 */}
      <Modal
        title="物料配送申请"
        open={deliveryModalVisible}
        onCancel={() => {
          setDeliveryModalVisible(false);
          deliveryForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={deliveryForm} layout="vertical" onFinish={handleDeliverySubmit}>
          <Form.Item
            name="materialCode"
            label="物料编码"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="materialName"
            label="物料名称"
          >
            <Input disabled />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="currentStock"
                label="当前库存"
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recommendedQuantity"
                label="建议配送量"
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="requestQuantity"
            label="申请配送量"
            rules={[{ required: true, message: '请输入申请配送量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="请输入申请配送量" />
          </Form.Item>

          <Form.Item
            name="urgencyLevel"
            label="紧急程度"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Select placeholder="请选择紧急程度">
              <Option value="normal">正常</Option>
              <Option value="urgent">紧急</Option>
              <Option value="critical">非常紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expectedDate"
            label="期望配送时间"
            rules={[{ required: true, message: '请选择期望配送时间' }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>

          <Form.Item
            name="reason"
            label="申请原因"
          >
            <Input.TextArea rows={3} placeholder="请输入申请原因" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setDeliveryModalVisible(false);
                deliveryForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交申请
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 物料详情模态框 */}
      <Modal
        title={`物料详情 - ${selectedRecord?.materialName}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="物料编码">{selectedRecord.materialCode}</Descriptions.Item>
                    <Descriptions.Item label="物料名称">{selectedRecord.materialName}</Descriptions.Item>
                    <Descriptions.Item label="规格型号">{selectedRecord.specification}</Descriptions.Item>
                    <Descriptions.Item label="单位">{selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="供应商">{selectedRecord.supplier}</Descriptions.Item>
                    <Descriptions.Item label="存放位置">{selectedRecord.location}</Descriptions.Item>
                    <Descriptions.Item label="当前库存">{selectedRecord.currentStock} {selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="最小库存">{selectedRecord.minStock} {selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="安全库存">{selectedRecord.safetyStock} {selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="最大库存">{selectedRecord.maxStock} {selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="日消耗量">{selectedRecord.dailyConsumption} {selectedRecord.unit}</Descriptions.Item>
                    <Descriptions.Item label="可用天数">{selectedRecord.estimatedDays.toFixed(1)} 天</Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'delivery',
                label: '配送记录',
                children: (
                  <Timeline
                    items={[
                      {
                        color: 'green',
                        children: (
                          <div>
                            <div style={{ fontWeight: 'bold' }}>最近配送 - {selectedRecord.lastDeliveryDate}</div>
                            <div>配送数量: {selectedRecord.lastDeliveryQuantity} {selectedRecord.unit}</div>
                            <div>批次号: {selectedRecord.batchNumber}</div>
                          </div>
                        )
                      },
                      {
                        color: 'blue',
                        children: (
                          <div>
                            <div style={{ fontWeight: 'bold' }}>计划配送 - {selectedRecord.nextDeliveryDate}</div>
                            <div>计划数量: {selectedRecord.plannedDeliveryQuantity} {selectedRecord.unit}</div>
                            <div>状态: 待配送</div>
                          </div>
                        )
                      }
                    ]}
                  />
                )
              },
              {
                key: 'consumption',
                label: '消耗趋势',
                children: (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <h4>近7天消耗趋势</h4>
                      <div style={{ height: 200, display: 'flex', alignItems: 'end', justifyContent: 'space-around' }}>
                        {consumptionTrend.map((item, index) => (
                          <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ 
                              height: (item.consumption / 1500) * 150, 
                              backgroundColor: '#1890ff', 
                              marginBottom: 8,
                              borderRadius: '2px'
                            }}></div>
                            <div style={{ fontSize: '12px' }}>
                              <div>{item.date}</div>
                              <div>{item.consumption}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default LineMaterialsManagement;