import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, Rate, message, Spin } from 'antd';

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
import { PlusOutlined, SearchOutlined, AuditOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { QualityAPI } from '../../services/api';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const IQCInspection = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 从数据库加载的数据
  const [iqcData, setIqcData] = useState([]);
  const [total, setTotal] = useState(0);

  // 从数据库加载质量检验数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await QualityAPI.getQualityInspections({ inspection_type: 'incoming', limit: 100 });
      if (response.success) {
        // 转换数据格式以适配表格
        const formattedData = response.data.inspections.map((item, index) => ({
          key: item.id || index,
          id: item.id,
          inspectionId: `IQC-${item.id}`,
          purchaseOrderNo: `PO-${item.production_order_id}`,
          supplierName: '供应商',
          materialCode: `MAT-${String(item.production_order_id).padStart(3, '0')}`,
          materialName: `物料 ${item.production_order_id}`,
          batchNo: `BATCH-${item.id}`,
          deliveryDate: item.inspection_date ? new Date(item.inspection_date).toLocaleDateString() : '-',
          inspectionDate: item.inspection_date ? new Date(item.inspection_date).toLocaleDateString() : '-',
          inspector: `检验员 ${item.inspector_id}`,
          sampleQuantity: item.inspected_quantity || 0,
          inspectedQuantity: item.inspected_quantity || 0,
          qualifiedQuantity: item.qualified_quantity || 0,
          defectiveQuantity: item.defective_quantity || 0,
          qualityRate: item.quality_rate || 0,
          inspectionItems: [],
          overallScore: (item.quality_rate || 0) / 20,
          result: item.quality_rate >= 95 ? 'pass' : item.quality_rate >= 90 ? 'conditional_pass' : 'fail',
          defectTypes: item.defect_types ? (
            (() => {
              try {
                return JSON.parse(item.defect_types);
              } catch (e) {
                console.warn('JSON解析失败，使用默认值:', item.defect_types);
                return [];
              }
            })()
          ) : [],
          remarks: item.notes || '-',
          status: 'completed'
        }));
        setIqcData(formattedData);
        setTotal(response.data.total);
        safeMessage.success(`成功加载 ${formattedData.length} 条IQC检验数据`);
      }
    } catch (error) {
      console.error('加载IQC检验数据失败:', error);
      safeMessage.error('加载数据失败，请检查后端服务是否正常');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadData();
  }, []);

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
          <Button type="link" 
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