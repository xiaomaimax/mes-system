import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, Rate } from 'antd';
import { PlusOutlined, SearchOutlined, AuditOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const IQCInspection = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const iqcData = [
    {
      key: '1',
      inspectionId: 'IQC-2024-001',
      purchaseOrderNo: 'PO-2024-001',
      supplierName: '供应商A',
      materialCode: 'MAT-001',
      materialName: '原料A',
      batchNo: 'BATCH-001',
      deliveryDate: '2024-01-15',
      inspectionDate: '2024-01-15',
      inspector: '张三',
      sampleQuantity: 50,
      inspectedQuantity: 50,
      qualifiedQuantity: 48,
      defectiveQuantity: 2,
      qualityRate: 96.0,
      inspectionItems: [
        { item: '外观检查', result: 'pass', score: 5 },
        { item: '尺寸检测', result: 'pass', score: 4 },
        { item: '材质检验', result: 'fail', score: 2 }
      ],
      overallScore: 3.7,
      result: 'conditional_pass',
      defectTypes: ['尺寸偏差', '表面划痕'],
      remarks: '部分产品存在轻微划痕，可接收但需供应商改进',
      status: 'completed'
    },
    {
      key: '2',
      inspectionId: 'IQC-2024-002',
      purchaseOrderNo: 'PO-2024-002',
      supplierName: '供应商B',
      materialCode: 'MAT-002',
      materialName: '原料B',
      batchNo: 'BATCH-002',
      deliveryDate: '2024-01-16',
      inspectionDate: '2024-01-16',
      inspector: '李四',
      sampleQuantity: 30,
      inspectedQuantity: 30,
      qualifiedQuantity: 30,
      defectiveQuantity: 0,
      qualityRate: 100.0,
      inspectionItems: [
        { item: '外观检查', result: 'pass', score: 5 },
        { item: '尺寸检测', result: 'pass', score: 5 },
        { item: '材质检验', result: 'pass', score: 5 }
      ],
      overallScore: 5.0,
      result: 'pass',
      defectTypes: [],
      remarks: '质量优良，全部合格',
      status: 'completed'
    },
    {
      key: '3',
      inspectionId: 'IQC-2024-003',
      purchaseOrderNo: 'PO-2024-003',
      supplierName: '供应商C',
      materialCode: 'MAT-003',
      materialName: '包装材料',
      batchNo: 'BATCH-003',
      deliveryDate: '2024-01-17',
      inspectionDate: null,
      inspector: '王五',
      sampleQuantity: 100,
      inspectedQuantity: 0,
      qualifiedQuantity: 0,
      defectiveQuantity: 0,
      qualityRate: 0,
      inspectionItems: [],
      overallScore: 0,
      result: 'pending',
      defectTypes: [],
      remarks: '待检验',
      status: 'pending'
    }
  ];

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '采购订单',
      dataIndex: 'purchaseOrderNo',
      key: 'purchaseOrderNo',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 120,
    },
    {
      title: '物料信息',
      key: 'material',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.materialName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.materialCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>批次: {record.batchNo}</div>
        </div>
      )
    },
    {
      title: '到货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 100,
    },
    {
      title: '检验日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100,
      render: (date) => date || '-'
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 80,
    },
    {
      title: '检验数量',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <div>抽样: {record.sampleQuantity}</div>
          <div>检验: {record.inspectedQuantity}</div>
        </div>
      )
    },
    {
      title: '质量统计',
      key: 'qualityStats',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ color: '#52c41a' }}>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: '#ff4d4f' }}>不合格: {record.defectiveQuantity}</div>
          <div>合格率: {record.qualityRate}%</div>
        </div>
      )
    },
    {
      title: '综合评分',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 120,
      render: (score) => (
        <div>
          <Rate disabled value={score} allowHalf />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {score > 0 ? `${score.toFixed(1)} 分` : '未评分'}
          </div>
        </div>
      )
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const resultMap = {
          pass: { color: 'green', text: '合格', icon: <CheckCircleOutlined /> },
          conditional_pass: { color: 'orange', text: '让步接收', icon: <CheckCircleOutlined /> },
          fail: { color: 'red', text: '不合格', icon: <CloseCircleOutlined /> },
          pending: { color: 'blue', text: '待检验', icon: null }
        };
        const { color, text, icon } = resultMap[result];
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '缺陷类型',
      dataIndex: 'defectTypes',
      key: 'defectTypes',
      width: 150,
      render: (types) => (
        <div>
          {types.length > 0 ? (
            types.map((type, index) => (
              <Tag key={index} color="red" style={{ marginBottom: 2 }}>
                {type}
              </Tag>
            ))
          ) : (
            <Tag color="green">无缺陷</Tag>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待检验' },
          in_progress: { color: 'blue', text: '检验中' },
          completed: { color: 'green', text: '已完成' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small" 
              icon={<AuditOutlined />}
              onClick={() => handleInspect(record)}
            >
              开始检验
            </Button>
          )}
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button type="link" size="small">
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const handleInspect = (record) => {
    form.setFieldsValue({
      ...record,
      status: 'in_progress'
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('提交IQC检验数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <AuditOutlined />
            IQC来料质量检验
          </Space>
        }
        extra={
          <Space>
            <Button>检验报告</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建检验单
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索检验单号/物料"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="供应商" style={{ width: 150 }}>
              <Option value="supplier_a">供应商A</Option>
              <Option value="supplier_b">供应商B</Option>
              <Option value="supplier_c">供应商C</Option>
            </Select>
            <Select placeholder="检验结果" style={{ width: 120 }}>
              <Option value="pass">合格</Option>
              <Option value="conditional_pass">让步接收</Option>
              <Option value="fail">不合格</Option>
              <Option value="pending">待检验</Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={iqcData}
          loading={loading}
          pagination={{
            total: iqcData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* IQC检验模态框 */}
      <Modal
        title="IQC来料质量检验"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="purchaseOrderNo"
              label="采购订单号"
              rules={[{ required: true, message: '请输入采购订单号' }]}
            >
              <Input placeholder="请输入采购订单号" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="supplierName"
              label="供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select placeholder="请选择供应商" style={{ width: 200 }}>
                <Option value="供应商A">供应商A</Option>
                <Option value="供应商B">供应商B</Option>
                <Option value="供应商C">供应商C</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="materialCode"
              label="物料编码"
              rules={[{ required: true, message: '请选择物料' }]}
            >
              <Select placeholder="请选择物料" style={{ width: 200 }}>
                <Option value="MAT-001">MAT-001 - 原料A</Option>
                <Option value="MAT-002">MAT-002 - 原料B</Option>
                <Option value="MAT-003">MAT-003 - 包装材料</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="batchNo"
              label="批次号"
              rules={[{ required: true, message: '请输入批次号' }]}
            >
              <Input placeholder="请输入批次号" style={{ width: 200 }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="sampleQuantity"
              label="抽样数量"
              rules={[{ required: true, message: '请输入抽样数量' }]}
            >
              <InputNumber min={1} placeholder="抽样数量" style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="inspectedQuantity"
              label="检验数量"
              rules={[{ required: true, message: '请输入检验数量' }]}
            >
              <InputNumber min={1} placeholder="检验数量" style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="qualifiedQuantity"
              label="合格数量"
              rules={[{ required: true, message: '请输入合格数量' }]}
            >
              <InputNumber min={0} placeholder="合格数量" style={{ width: 150 }} />
            </Form.Item>
          </Space>

          {/* 检验项目 */}
          <Card title="检验项目" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span style={{ marginRight: 16 }}>外观检查:</span>
                <Select defaultValue="pass" style={{ width: 100, marginRight: 16 }}>
                  <Option value="pass">合格</Option>
                  <Option value="fail">不合格</Option>
                </Select>
                <span style={{ marginRight: 8 }}>评分:</span>
                <Rate />
              </div>
              <div>
                <span style={{ marginRight: 16 }}>尺寸检测:</span>
                <Select defaultValue="pass" style={{ width: 100, marginRight: 16 }}>
                  <Option value="pass">合格</Option>
                  <Option value="fail">不合格</Option>
                </Select>
                <span style={{ marginRight: 8 }}>评分:</span>
                <Rate />
              </div>
              <div>
                <span style={{ marginRight: 16 }}>材质检验:</span>
                <Select defaultValue="pass" style={{ width: 100, marginRight: 16 }}>
                  <Option value="pass">合格</Option>
                  <Option value="fail">不合格</Option>
                </Select>
                <span style={{ marginRight: 8 }}>评分:</span>
                <Rate />
              </div>
            </Space>
          </Card>

          <Form.Item
            name="result"
            label="检验结果"
            rules={[{ required: true, message: '请选择检验结果' }]}
          >
            <Select placeholder="请选择检验结果">
              <Option value="pass">合格</Option>
              <Option value="conditional_pass">让步接收</Option>
              <Option value="fail">不合格</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="defectTypes"
            label="缺陷类型"
          >
            <Select mode="multiple" placeholder="请选择缺陷类型">
              <Option value="尺寸偏差">尺寸偏差</Option>
              <Option value="表面划痕">表面划痕</Option>
              <Option value="材质不符">材质不符</Option>
              <Option value="包装破损">包装破损</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remarks"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入检验备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IQCInspection;