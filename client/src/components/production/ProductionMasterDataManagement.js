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
  InputNumber,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Tree,
  Upload,
  Switch,
  Descriptions,
  Divider,
  List,
  Avatar
} from 'antd';
import { 
  DatabaseOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  AppstoreOutlined,
  PartitionOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  CopyOutlined,
  DownOutlined
} from '@ant-design/icons';const
 { Option } = Select;
const { TextArea } = Input;

const ProductionMasterDataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  // 产品主数据
  const productData = [
    {
      key: '1',
      productCode: 'PROD-001',
      productName: '塑料杯A型',
      productType: '注塑产品',
      category: '日用品',
      specification: '500ml 透明',
      unit: '个',
      standardCost: 2.50,
      sellingPrice: 5.00,
      leadTime: 2,
      minOrderQuantity: 100,
      status: 'active',
      version: 'V1.2',
      designer: '张工程师',
      approver: '李经理',
      createDate: '2024-01-01',
      updateDate: '2024-01-10',
      remarks: '主力产品，销量稳定'
    },
    {
      key: '2',
      productCode: 'PROD-002',
      productName: '包装盒B型',
      productType: '包装产品',
      category: '包装材料',
      specification: '200x150x80mm',
      unit: '个',
      standardCost: 1.20,
      sellingPrice: 2.50,
      leadTime: 1,
      minOrderQuantity: 500,
      status: 'active',
      version: 'V2.0',
      designer: '王工程师',
      approver: '李经理',
      createDate: '2024-01-05',
      updateDate: '2024-01-12',
      remarks: '新产品，市场反响良好'
    }
  ];

  // 工艺路线数据
  const processRouteData = [
    {
      key: '1',
      routeCode: 'PR-001',
      routeName: '塑料杯生产工艺',
      productCode: 'PROD-001',
      productName: '塑料杯A型',
      version: 'V1.0',
      totalTime: 45,
      processSteps: [
        { step: 1, name: '原料准备', workCenter: 'WC-001', standardTime: 5, setupTime: 10 },
        { step: 2, name: '注塑成型', workCenter: 'WC-002', standardTime: 25, setupTime: 15 },
        { step: 3, name: '冷却脱模', workCenter: 'WC-003', standardTime: 10, setupTime: 5 },
        { step: 4, name: '质量检验', workCenter: 'WC-004', standardTime: 3, setupTime: 2 },
        { step: 5, name: '包装入库', workCenter: 'WC-005', standardTime: 2, setupTime: 3 }
      ],
      status: 'active',
      createDate: '2024-01-01',
      updateDate: '2024-01-08'
    }
  ];

  // 工作中心数据
  const workCenterData = [
    {
      key: '1',
      centerCode: 'WC-001',
      centerName: '原料准备中心',
      centerType: '准备工序',
      workshop: '车间A',
      capacity: 100,
      efficiency: 95,
      costPerHour: 50,
      operatorCount: 2,
      equipmentList: ['设备A1', '设备A2'],
      skills: ['原料配比', '质量检验'],
      status: 'active',
      manager: '张主管',
      remarks: '负责原料准备和配比'
    },
    {
      key: '2',
      centerCode: 'WC-002',
      centerName: '注塑成型中心',
      centerType: '加工工序',
      workshop: '车间A',
      capacity: 80,
      efficiency: 92,
      costPerHour: 120,
      operatorCount: 3,
      equipmentList: ['注塑机A1', '注塑机A2'],
      skills: ['注塑操作', '模具调试'],
      status: 'active',
      manager: '李主管',
      remarks: '核心生产工序'
    }
  ];

  // BOM数据
  const bomData = [
    {
      key: '1',
      bomCode: 'BOM-001',
      productCode: 'PROD-001',
      productName: '塑料杯A型',
      version: 'V1.0',
      components: [
        { code: 'MAT-001', name: 'PP塑料粒子', quantity: 0.05, unit: 'kg', cost: 0.15 },
        { code: 'MAT-002', name: '色母粒', quantity: 0.002, unit: 'kg', cost: 0.02 },
        { code: 'MAT-003', name: '标签', quantity: 1, unit: '张', cost: 0.05 }
      ],
      totalCost: 0.22,
      status: 'active',
      effectiveDate: '2024-01-01',
      createDate: '2024-01-01'
    }
  ];

  const productColumns = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150
    },
    {
      title: '成本信息',
      key: 'cost',
      width: 120,
      render: (_, record) => (
        <div>
          <div>成本: ¥{record.standardCost}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            售价: ¥{record.sellingPrice}
          </div>
        </div>
      )
    },
    {
      title: '交期',
      dataIndex: 'leadTime',
      key: 'leadTime',
      width: 80,
      render: (time) => `${time}天`
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '设计师',
      dataIndex: 'designer',
      key: 'designer',
      width: 100
    },
    {
      title: '更新日期',
      dataIndex: 'updateDate',
      key: 'updateDate',
      width: 100
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
            icon={<CopyOutlined />}
          >
            复制
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

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleViewProcessRoute = (record) => {
    Modal.info({
      title: `工艺路线详情 - ${record.routeName}`,
      width: 800,
      content: (
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="工艺编码">{record.routeCode}</Descriptions.Item>
            <Descriptions.Item label="工艺名称">{record.routeName}</Descriptions.Item>
            <Descriptions.Item label="产品编码">{record.productCode}</Descriptions.Item>
            <Descriptions.Item label="产品名称">{record.productName}</Descriptions.Item>
            <Descriptions.Item label="版本">{record.version}</Descriptions.Item>
            <Descriptions.Item label="总工时">{record.totalTime}分钟</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={record.status === 'active' ? 'green' : 'red'}>
                {record.status === 'active' ? '启用' : '停用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="工序数量">{record.processSteps.length}道工序</Descriptions.Item>
          </Descriptions>
          <h4>工艺步骤</h4>
          <Table
            columns={[
              { title: '步骤', dataIndex: 'step', key: 'step', width: 60 },
              { title: '工序名称', dataIndex: 'name', key: 'name' },
              { title: '工作中心', dataIndex: 'workCenter', key: 'workCenter' },
              { title: '标准工时', dataIndex: 'standardTime', key: 'standardTime', render: (time) => `${time}分钟` },
              { title: '准备工时', dataIndex: 'setupTime', key: 'setupTime', render: (time) => `${time}分钟` }
            ]}
            dataSource={record.processSteps}
            pagination={false}
            size="small"
          />
        </div>
      ),
    });
  };

  const handleViewWorkCenter = (record) => {
    Modal.info({
      title: `工作中心详情 - ${record.centerName}`,
      width: 800,
      content: (
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="中心编码">{record.centerCode}</Descriptions.Item>
            <Descriptions.Item label="中心名称">{record.centerName}</Descriptions.Item>
            <Descriptions.Item label="中心类型">{record.centerType}</Descriptions.Item>
            <Descriptions.Item label="所属车间">{record.workshop}</Descriptions.Item>
            <Descriptions.Item label="产能">{record.capacity}/小时</Descriptions.Item>
            <Descriptions.Item label="效率">{record.efficiency}%</Descriptions.Item>
            <Descriptions.Item label="小时成本">¥{record.costPerHour}</Descriptions.Item>
            <Descriptions.Item label="操作员数量">{record.operatorCount}人</Descriptions.Item>
            <Descriptions.Item label="负责人">{record.manager}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={record.status === 'active' ? 'green' : 'red'}>
                {record.status === 'active' ? '运行中' : '停用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{record.remarks}</Descriptions.Item>
          </Descriptions>
          <Row gutter={16}>
            <Col span={12}>
              <h4>设备列表</h4>
              <List
                size="small"
                dataSource={record.equipmentList}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<SettingOutlined />} />}
                      title={item}
                      description="设备状态: 正常运行"
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={12}>
              <h4>技能要求</h4>
              <div>
                {record.skills.map((skill, index) => (
                  <Tag key={index} color="green" style={{ marginBottom: 4, marginRight: 4 }}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      ),
    });
  };

  const handleViewBOM = (record) => {
    Modal.info({
      title: `BOM详情 - ${record.productName}`,
      width: 900,
      content: (
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="BOM编码">{record.bomCode}</Descriptions.Item>
            <Descriptions.Item label="产品编码">{record.productCode}</Descriptions.Item>
            <Descriptions.Item label="产品名称">{record.productName}</Descriptions.Item>
            <Descriptions.Item label="版本">{record.version}</Descriptions.Item>
            <Descriptions.Item label="组件数量">{record.components.length}个</Descriptions.Item>
            <Descriptions.Item label="总成本">
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                ¥{record.totalCost.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">{record.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={record.status === 'active' ? 'green' : 'red'}>
                {record.status === 'active' ? '生效' : '失效'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          <h4>BOM组件明细</h4>
          <Table
            columns={[
              { title: '物料编码', dataIndex: 'code', key: 'code', width: 120 },
              { title: '物料名称', dataIndex: 'name', key: 'name', width: 200 },
              { title: '用量', dataIndex: 'quantity', key: 'quantity', width: 80 },
              { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
              { 
                title: '单价', 
                dataIndex: 'cost', 
                key: 'cost', 
                width: 80,
                render: (cost) => `¥${cost.toFixed(2)}`
              },
              { 
                title: '小计', 
                key: 'subtotal', 
                width: 80,
                render: (_, item) => `¥${(item.quantity * item.cost).toFixed(2)}`
              }
            ]}
            dataSource={record.components}
            pagination={false}
            size="small"
            summary={(pageData) => {
              let totalCost = 0;
              pageData.forEach(({ quantity, cost }) => {
                totalCost += quantity * cost;
              });
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>合计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong style={{ color: '#1890ff' }}>¥{totalCost.toFixed(2)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      ),
    });
  };

  const generateProductCode = (productType) => {
    const typePrefix = {
      '注塑产品': 'INJ',
      '包装产品': 'PKG', 
      '组装产品': 'ASM'
    };
    const prefix = typePrefix[productType] || 'PROD';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const validateProductCode = (code) => {
    const pattern = /^[A-Z]{3}-\d{6}$/;
    return pattern.test(code);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 验证产品编码格式
      if (values.productCode && !validateProductCode(values.productCode)) {
        message.error('产品编码格式不正确，应为：XXX-XXXXXX（如：INJ-123456）');
        return;
      }

      // 验证成本和价格
      if (values.standardCost && values.sellingPrice && values.standardCost >= values.sellingPrice) {
        message.warning('销售价格应大于标准成本');
      }

      // 验证库存设置
      if (values.safetyStock && values.maxStock && values.safetyStock >= values.maxStock) {
        message.error('安全库存不能大于等于最大库存');
        return;
      }

      console.log('提交主数据:', values);
      message.success('主数据保存成功！');
      setModalVisible(false);
      form.resetFields();
      setSelectedRecord(null);
    } catch (error) {
      console.error('提交失败:', error);
      message.error('保存失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProductsTab();
      case 'process-routes':
        return renderProcessRoutesTab();
      case 'work-centers':
        return renderWorkCentersTab();
      case 'bom':
        return renderBOMTab();
      default:
        return renderProductsTab();
    }
  };

  const renderProductsTab = () => (
    <Card 
      title="产品主数据"
      extra={
        <Space>
          <Button icon={<UploadOutlined />}>
            导入产品
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            新增产品
          </Button>
        </Space>
      }
    >
      {/* 搜索和筛选区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索产品编码/名称"
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select placeholder="产品类型" allowClear style={{ width: '100%' }}>
            <Option value="注塑产品">注塑产品</Option>
            <Option value="包装产品">包装产品</Option>
            <Option value="组装产品">组装产品</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select placeholder="产品分类" allowClear style={{ width: '100%' }}>
            <Option value="日用品">日用品</Option>
            <Option value="包装材料">包装材料</Option>
            <Option value="工业用品">工业用品</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select placeholder="状态" allowClear style={{ width: '100%' }}>
            <Option value="active">启用</Option>
            <Option value="inactive">停用</Option>
            <Option value="draft">草稿</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
            <Button icon={<FileTextOutlined />}>
              导出
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={productColumns}
        dataSource={productData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
        }}
        scroll={{ x: 1400 }}
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedRows) => {
            console.log('选中的产品:', selectedRows);
          },
        }}
      />
    </Card>
  );

  const renderProcessRoutesTab = () => {
    const processRouteColumns = [
      {
        title: '工艺编码',
        dataIndex: 'routeCode',
        key: 'routeCode',
        width: 120,
        fixed: 'left'
      },
      {
        title: '工艺名称',
        dataIndex: 'routeName',
        key: 'routeName',
        width: 180
      },
      {
        title: '产品信息',
        key: 'product',
        width: 200,
        render: (_, record) => (
          <div>
            <div>{record.productCode}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.productName}
            </div>
          </div>
        )
      },
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        width: 80
      },
      {
        title: '总工时',
        dataIndex: 'totalTime',
        key: 'totalTime',
        width: 100,
        render: (time) => `${time}分钟`
      },
      {
        title: '工序数量',
        key: 'stepCount',
        width: 100,
        render: (_, record) => `${record.processSteps.length}道工序`
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '启用' : '停用'}
          </Tag>
        )
      },
      {
        title: '更新日期',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 100
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
              icon={<EyeOutlined />}
              onClick={() => handleViewProcessRoute(record)}
            >
              详情
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<CopyOutlined />}
            >
              复制
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

    return (
      <Card 
        title="工艺路线管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
          >
            新增工艺路线
          </Button>
        }
      >
        <Table
          columns={processRouteColumns}
          dataSource={processRouteData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <h4>工艺步骤详情</h4>
                <Table
                  columns={[
                    { title: '步骤', dataIndex: 'step', key: 'step', width: 60 },
                    { title: '工序名称', dataIndex: 'name', key: 'name', width: 150 },
                    { title: '工作中心', dataIndex: 'workCenter', key: 'workCenter', width: 120 },
                    { title: '标准工时', dataIndex: 'standardTime', key: 'standardTime', width: 100, render: (time) => `${time}分钟` },
                    { title: '准备工时', dataIndex: 'setupTime', key: 'setupTime', width: 100, render: (time) => `${time}分钟` }
                  ]}
                  dataSource={record.processSteps}
                  pagination={false}
                  size="small"
                />
              </div>
            ),
            rowExpandable: (record) => record.processSteps && record.processSteps.length > 0,
          }}
        />
      </Card>
    );
  };

  const renderWorkCentersTab = () => {
    const workCenterColumns = [
      {
        title: '中心编码',
        dataIndex: 'centerCode',
        key: 'centerCode',
        width: 120,
        fixed: 'left'
      },
      {
        title: '中心名称',
        dataIndex: 'centerName',
        key: 'centerName',
        width: 180
      },
      {
        title: '类型',
        dataIndex: 'centerType',
        key: 'centerType',
        width: 120,
        render: (type) => <Tag color="blue">{type}</Tag>
      },
      {
        title: '车间',
        dataIndex: 'workshop',
        key: 'workshop',
        width: 100
      },
      {
        title: '产能信息',
        key: 'capacity',
        width: 120,
        render: (_, record) => (
          <div>
            <div>产能: {record.capacity}/h</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              效率: {record.efficiency}%
            </div>
          </div>
        )
      },
      {
        title: '成本',
        dataIndex: 'costPerHour',
        key: 'costPerHour',
        width: 100,
        render: (cost) => `¥${cost}/h`
      },
      {
        title: '操作员',
        dataIndex: 'operatorCount',
        key: 'operatorCount',
        width: 80,
        render: (count) => `${count}人`
      },
      {
        title: '负责人',
        dataIndex: 'manager',
        key: 'manager',
        width: 100
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '运行中' : '停用'}
          </Tag>
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
              icon={<EyeOutlined />}
              onClick={() => handleViewWorkCenter(record)}
            >
              详情
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<SettingOutlined />}
            >
              配置
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

    return (
      <Card 
        title="工作中心管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
          >
            新增工作中心
          </Button>
        }
      >
        <Table
          columns={workCenterColumns}
          dataSource={workCenterData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <h4>设备列表</h4>
                    <List
                      size="small"
                      dataSource={record.equipmentList}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<SettingOutlined />} />}
                            title={item}
                            description="设备状态: 正常"
                          />
                        </List.Item>
                      )}
                    />
                  </Col>
                  <Col span={12}>
                    <h4>技能要求</h4>
                    <div>
                      {record.skills.map((skill, index) => (
                        <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                          {skill}
                        </Tag>
                      ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <strong>备注:</strong> {record.remarks}
                    </div>
                  </Col>
                </Row>
              </div>
            ),
          }}
        />
      </Card>
    );
  };

  const renderBOMTab = () => {
    const bomColumns = [
      {
        title: 'BOM编码',
        dataIndex: 'bomCode',
        key: 'bomCode',
        width: 120,
        fixed: 'left'
      },
      {
        title: '产品信息',
        key: 'product',
        width: 200,
        render: (_, record) => (
          <div>
            <div>{record.productCode}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.productName}
            </div>
          </div>
        )
      },
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        width: 80
      },
      {
        title: '组件数量',
        key: 'componentCount',
        width: 100,
        render: (_, record) => `${record.components.length}个组件`
      },
      {
        title: '总成本',
        dataIndex: 'totalCost',
        key: 'totalCost',
        width: 100,
        render: (cost) => (
          <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
            ¥{cost.toFixed(2)}
          </span>
        )
      },
      {
        title: '生效日期',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: 100
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '生效' : '失效'}
          </Tag>
        )
      },
      {
        title: '创建日期',
        dataIndex: 'createDate',
        key: 'createDate',
        width: 100
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
              icon={<EyeOutlined />}
              onClick={() => handleViewBOM(record)}
            >
              详情
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<CopyOutlined />}
            >
              复制
            </Button>
            <Button 
              type="link" 
              size="small" 
              icon={<FileTextOutlined />}
            >
              导出
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

    return (
      <Card 
        title="BOM物料清单管理"
        extra={
          <Space>
            <Button icon={<UploadOutlined />}>
              导入BOM
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
            >
              新增BOM
            </Button>
          </Space>
        }
      >
        <Table
          columns={bomColumns}
          dataSource={bomData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <h4>BOM组件明细</h4>
                <Table
                  columns={[
                    { title: '物料编码', dataIndex: 'code', key: 'code', width: 120 },
                    { title: '物料名称', dataIndex: 'name', key: 'name', width: 200 },
                    { title: '用量', dataIndex: 'quantity', key: 'quantity', width: 100 },
                    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
                    { 
                      title: '单价', 
                      dataIndex: 'cost', 
                      key: 'cost', 
                      width: 100,
                      render: (cost) => `¥${cost.toFixed(2)}`
                    },
                    { 
                      title: '小计', 
                      key: 'subtotal', 
                      width: 100,
                      render: (_, item) => `¥${(item.quantity * item.cost).toFixed(2)}`
                    }
                  ]}
                  dataSource={record.components}
                  pagination={false}
                  size="small"
                  summary={(pageData) => {
                    let totalCost = 0;
                    pageData.forEach(({ quantity, cost }) => {
                      totalCost += quantity * cost;
                    });
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={5}>
                          <strong>合计</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong style={{ color: '#1890ff' }}>¥{totalCost.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </div>
            ),
            rowExpandable: (record) => record.components && record.components.length > 0,
          }}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品总数"
              value={25}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              启用: 22 | 停用: 3
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工艺路线"
              value={18}
              prefix={<PartitionOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              有效: 16 | 待审核: 2
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="工作中心"
              value={12}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              运行中: 10 | 维护中: 2
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="BOM清单"
              value={25}
              prefix={<NodeIndexOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              生效: 23 | 失效: 2
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            生产主数据管理
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'products',
              label: '产品管理',
              icon: <AppstoreOutlined />
            },
            {
              key: 'process-routes',
              label: '工艺路线',
              icon: <PartitionOutlined />
            },
            {
              key: 'work-centers',
              label: '工作中心',
              icon: <SettingOutlined />
            },
            {
              key: 'bom',
              label: 'BOM管理',
              icon: <NodeIndexOutlined />
            }
          ]}
        />
        
        <div style={{ marginTop: 16 }}>
          {renderTabContent()}
        </div>
      </Card>

      {/* 新增/编辑产品模态框 */}
      <Modal
        title="产品信息"
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
                name="productCode"
                label="产品编码"
                rules={[
                  { required: true, message: '请输入产品编码' },
                  { 
                    pattern: /^[A-Z]{3}-\d{6}$/, 
                    message: '编码格式：XXX-XXXXXX（如：INJ-123456）' 
                  }
                ]}
              >
                <Input 
                  placeholder="请输入产品编码或点击自动生成" 
                  addonAfter={
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => {
                        const productType = form.getFieldValue('productType');
                        if (productType) {
                          const code = generateProductCode(productType);
                          form.setFieldsValue({ productCode: code });
                        } else {
                          message.warning('请先选择产品类型');
                        }
                      }}
                    >
                      生成
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="productType"
                label="产品类型"
                rules={[{ required: true, message: '请选择产品类型' }]}
              >
                <Select 
                  placeholder="请选择产品类型"
                  onChange={(value) => {
                    // 产品类型变化时，可以自动设置一些默认值
                    const defaults = {
                      '注塑产品': { leadTime: 3, minOrderQuantity: 100 },
                      '包装产品': { leadTime: 1, minOrderQuantity: 500 },
                      '组装产品': { leadTime: 5, minOrderQuantity: 50 }
                    };
                    if (defaults[value]) {
                      form.setFieldsValue(defaults[value]);
                    }
                  }}
                >
                  <Option value="注塑产品">注塑产品</Option>
                  <Option value="包装产品">包装产品</Option>
                  <Option value="组装产品">组装产品</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="产品分类"
              >
                <Select placeholder="请选择产品分类">
                  <Option value="日用品">日用品</Option>
                  <Option value="包装材料">包装材料</Option>
                  <Option value="工业用品">工业用品</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select placeholder="请选择单位">
                  <Option value="个">个</Option>
                  <Option value="套">套</Option>
                  <Option value="kg">千克</Option>
                  <Option value="m">米</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="specification"
            label="规格说明"
          >
            <Input placeholder="请输入规格说明" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="standardCost"
                label="标准成本"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="标准成本"
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sellingPrice"
                label="销售价格"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="销售价格"
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leadTime"
                label="生产周期"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="生产周期"
                  addonAfter="天"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="minOrderQuantity"
                label="最小订量"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="最小订量"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="safetyStock"
                label="安全库存"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="安全库存"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStock"
                label="最大库存"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="最大库存"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="designer"
                label="设计师"
              >
                <Select placeholder="请选择设计师">
                  <Option value="张工程师">张工程师</Option>
                  <Option value="王工程师">王工程师</Option>
                  <Option value="李工程师">李工程师</Option>
                  <Option value="赵工程师">赵工程师</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="approver"
                label="审批人"
              >
                <Select placeholder="请选择审批人">
                  <Option value="李经理">李经理</Option>
                  <Option value="王经理">王经理</Option>
                  <Option value="张经理">张经理</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">启用</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="draft">草稿</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="version"
                label="产品版本"
                initialValue="V1.0"
              >
                <Input placeholder="请输入产品版本" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualityLevel"
                label="质量等级"
              >
                <Select placeholder="请选择质量等级">
                  <Option value="A级">A级 - 优等品</Option>
                  <Option value="B级">B级 - 一等品</Option>
                  <Option value="C级">C级 - 合格品</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productImage"
                label="产品图片"
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="technicalDoc"
                label="技术文档"
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={3}
                >
                  <Button icon={<UploadOutlined />}>上传技术文档</Button>
                </Upload>
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  支持PDF、DOC、DOCX格式，最多3个文件
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息" />
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

      {/* 详情模态框 */}
      <Modal
        title={`产品详情 - ${selectedRecord?.productName}`}
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
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="产品编码">{selectedRecord.productCode}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedRecord.productName}</Descriptions.Item>
              <Descriptions.Item label="产品类型">
                <Tag color="blue">{selectedRecord.productType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="产品分类">
                <Tag color="green">{selectedRecord.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="规格说明">{selectedRecord.specification}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="版本">{selectedRecord.version}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRecord.status === 'active' ? 'green' : 'red'}>
                  {selectedRecord.status === 'active' ? '启用' : '停用'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card size="small" title="成本信息">
                  <Statistic
                    title="标准成本"
                    value={selectedRecord.standardCost}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#cf1322' }}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Statistic
                    title="销售价格"
                    value={selectedRecord.sellingPrice}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Statistic
                    title="利润率"
                    value={((selectedRecord.sellingPrice - selectedRecord.standardCost) / selectedRecord.sellingPrice * 100)}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="生产参数">
                  <Statistic
                    title="生产周期"
                    value={selectedRecord.leadTime}
                    suffix="天"
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <Statistic
                    title="最小订量"
                    value={selectedRecord.minOrderQuantity}
                    suffix="个"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="责任人信息">
                  <div style={{ marginBottom: 8 }}>
                    <strong>设计师:</strong> {selectedRecord.designer}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>审批人:</strong> {selectedRecord.approver}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>创建日期:</strong> {selectedRecord.createDate}
                  </div>
                  <div>
                    <strong>更新日期:</strong> {selectedRecord.updateDate}
                  </div>
                </Card>
              </Col>
            </Row>

            {selectedRecord.remarks && (
              <Card size="small" title="备注信息">
                <p>{selectedRecord.remarks}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductionMasterDataManagement;