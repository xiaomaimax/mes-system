import { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, Progress, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, ExperimentOutlined, EditOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';

import { QualityAPI } from '../../services/api';
import { useQualityData } from '../../hooks/useQualityData';
import { transformPQCData, INSPECTION_RESULT_MAP, INSPECTION_STATUS_MAP } from '../../utils/qualityDataTransformers';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const PQCInspection = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 使用自定义hook管理数据
  const { data: pqcData, loading, pagination, loadData, handlePaginationChange } = useQualityData(
    (params) => QualityAPI.getPQCInspections(params),
    transformPQCData
  );

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
      fixed: 'left'
    },
    {
      title: '生产订单',
      dataIndex: 'productionOrderNo',
      key: 'productionOrderNo',
      width: 120,
    },
    {
      title: '产品信息',
      key: 'product',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '工序',
      dataIndex: 'processStep',
      key: 'processStep',
      width: 100,
    },
    {
      title: '检验时间',
      dataIndex: 'inspectionTime',
      key: 'inspectionTime',
      width: 140,
      render: (time) => time || '-'
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 80,
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 60,
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
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#52c41a' }}>合格: {record.qualifiedQuantity}</span>
            <span style={{ marginLeft: 8, color: '#ff4d4f' }}>不合格: {record.defectiveQuantity}</span>
          </div>
          <Progress 
            percent={record.qualityRate} 
            size="small" 
            status={record.qualityRate < 95 ? 'exception' : 'success'}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            合格率: {record.qualityRate}%
          </div>
        </div>
      )
    },
    {
      title: '工艺参数',
      dataIndex: 'processParameters',
      key: 'processParameters',
      width: 200,
      render: (params) => (
        <div>
          {Object.entries(params).map(([key, value], index) => (
            <div key={index} style={{ fontSize: '12px' }}>
              {key}: {value}
            </div>
          ))}
        </div>
      )
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const { color, text } = INSPECTION_RESULT_MAP[result] || { color: 'default', text: result };
        return <Tag color={color}>{text}</Tag>;
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
        const { color, text } = INSPECTION_STATUS_MAP[status] || { color: 'default', text: status };
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
              icon={<PlayCircleOutlined />}
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
      console.log('提交PQC检验数据:', values);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <div>
      {/* 连接状态提示 */}
      {!loading && pqcData.length === 0 && (
        <Alert
          message="数据加载提示"
          description="如果数据长时间无法加载，请检查：1) 网络连接状态 2) 后端服务是否正常运行 3) 登录状态是否有效"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={loadData}>
              重试加载
            </Button>
          }
        />
      )}

      <Card 
        title={
          <Space>
            <ExperimentOutlined />
            PQC过程质量检验
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
            <Button>质量趋势</Button>
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
              placeholder="搜索检验单号/产品"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="生产线" style={{ width: 120 }}>
              <Option value="line_1">生产线1</Option>
              <Option value="line_2">生产线2</Option>
              <Option value="line_3">生产线3</Option>
            </Select>
            <Select placeholder="工序" style={{ width: 120 }}>
              <Option value="injection">注塑成型</Option>
              <Option value="assembly">组装</Option>
              <Option value="packaging">包装</Option>
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
          dataSource={pqcData}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePaginationChange
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* PQC检验模态框 */}
      <Modal
        title="PQC过程质量检验"
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
              name="productionOrderNo"
              label="生产订单号"
              rules={[{ required: true, message: '请输入生产订单号' }]}
            >
              <Input placeholder="请输入生产订单号" style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="productCode"
              label="产品编码"
              rules={[{ required: true, message: '请选择产品' }]}
            >
              <Select placeholder="请选择产品" style={{ width: 200 }}>
                <Option value="PROD-A001">PROD-A001 - 产品A</Option>
                <Option value="PROD-B001">PROD-B001 - 产品B</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="productionLine"
              label="生产线"
              rules={[{ required: true, message: '请选择生产线' }]}
            >
              <Select placeholder="请选择生产线" style={{ width: 150 }}>
                <Option value="生产线1">生产线1</Option>
                <Option value="生产线2">生产线2</Option>
                <Option value="生产线3">生产线3</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="processStep"
              label="工序"
              rules={[{ required: true, message: '请选择工序' }]}
            >
              <Select placeholder="请选择工序" style={{ width: 150 }}>
                <Option value="注塑成型">注塑成型</Option>
                <Option value="组装">组装</Option>
                <Option value="包装">包装</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="shift"
              label="班次"
              rules={[{ required: true, message: '请选择班次' }]}
            >
              <Select placeholder="请选择班次" style={{ width: 100 }}>
                <Option value="白班">白班</Option>
                <Option value="夜班">夜班</Option>
                <Option value="中班">中班</Option>
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="sampleQuantity"
              label="抽样数量"
              rules={[{ required: true, message: '请输入抽样数量' }]}
            >
              <InputNumber min={1} placeholder="抽样数量" style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="inspectedQuantity"
              label="检验数量"
              rules={[{ required: true, message: '请输入检验数量' }]}
            >
              <InputNumber min={1} placeholder="检验数量" style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="qualifiedQuantity"
              label="合格数量"
              rules={[{ required: true, message: '请输入合格数量' }]}
            >
              <InputNumber min={0} placeholder="合格数量" style={{ width: 120 }} />
            </Form.Item>
          </Space>

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
              <Option value="表面气泡">表面气泡</Option>
              <Option value="颜色不均">颜色不均</Option>
              <Option value="装配不良">装配不良</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="correctionActions"
            label="纠正措施"
          >
            <Select mode="multiple" placeholder="请选择纠正措施">
              <Option value="调整温度参数">调整温度参数</Option>
              <Option value="检查模具">检查模具</Option>
              <Option value="更换原料">更换原料</Option>
              <Option value="重新培训操作员">重新培训操作员</Option>
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

export default PQCInspection;