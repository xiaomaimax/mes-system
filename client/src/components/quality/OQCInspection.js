import { useState } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';

import { QualityAPI } from '../../services/api';
import { useQualityData } from '../../hooks/useQualityData';
import { transformOQCData, INSPECTION_RESULT_MAP } from '../../utils/qualityDataTransformers';

const OQCInspection = () => {
  const [editingRecord, setEditingRecord] = useState(null);

  // 使用自定义hook管理数据
  const { data: oqcData, loading, pagination, loadData, handlePaginationChange } = useQualityData(
    (params) => QualityAPI.getOQCInspections(params),
    transformOQCData
  );

  const handleEdit = (record) => {
    setEditingRecord(record);
    console.log('编辑记录:', record);
  };

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
    },
    {
      title: '出货单号',
      dataIndex: 'shipmentNo',
      key: 'shipmentNo',
      width: 120,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
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
          <div style={{ fontSize: '12px', color: '#666' }}>批次: {record.batchNo}</div>
        </div>
      )
    },
    {
      title: '出货数量',
      dataIndex: 'shipmentQuantity',
      key: 'shipmentQuantity',
      width: 100,
    },
    {
      title: '抽样数量',
      dataIndex: 'sampleQuantity',
      key: 'sampleQuantity',
      width: 100,
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 100,
      render: (rate) => `${rate}%`
    },
    {
      title: '检验日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100,
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 80,
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
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 连接状态提示 */}
      {!loading && oqcData.length === 0 && (
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
            <ExportOutlined />
            OQC出货质量检验
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建检验单
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={oqcData}
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
        />
      </Card>
    </div>
  );
};

export default OQCInspection;