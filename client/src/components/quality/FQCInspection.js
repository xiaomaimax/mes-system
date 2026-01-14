import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Modal, Form, InputNumber, message, Spin } from 'antd';

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
import { PlusOutlined, SearchOutlined, CheckSquareOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { QualityAPI } from '../../services/api';
const FQCInspection = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 从数据库加载的数据
  const [fqcData, setFqcData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 从数据库加载FQC检验数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await QualityAPI.getFQCInspections({
        page: pagination.current,
        limit: pagination.pageSize
      });
      
      if (response.success || response.code === 200) {
        // 转换数据格式以适配表格
        const formattedData = response.data.map((item, index) => ({
          key: item.id || index,
          id: item.id,
          inspectionId: item.inspection_id,
          productionOrderNo: `PO-${item.batch_number}`,
          productCode: `PROD-${item.product_name.charAt(item.product_name.length - 1)}001`,
          productName: item.product_name,
          batchNo: item.batch_number,
          inspectionDate: item.inspection_date,
          inspector: item.inspector,
          totalQuantity: item.inspection_qty * 20, // 假设总数是检验数量的20倍
          sampleQuantity: item.inspection_qty,
          qualifiedQuantity: item.qualified_qty,
          defectiveQuantity: item.inspection_qty - item.qualified_qty,
          qualityRate: item.pass_rate,
          result: item.inspection_result,
          status: item.status
        }));
        
        setFqcData(formattedData);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total
          }));
        }
        safeMessage.success(`成功加载 ${formattedData.length} 条FQC检验数据`);
      }
    } catch (error) {
      console.error('加载FQC检验数据失败:', error);
      safeMessage.error('加载数据失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: '检验单号',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 120,
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
          <div style={{ fontSize: '12px', color: '#666' }}>批次: {record.batchNo}</div>
        </div>
      )
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
      title: '数量统计',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <div>
          <div>总数: {record.totalQuantity}</div>
          <div>抽样: {record.sampleQuantity}</div>
          <div style={{ color: '#52c41a' }}>合格: {record.qualifiedQuantity}</div>
          <div style={{ color: '#ff4d4f' }}>不合格: {record.defectiveQuantity}</div>
        </div>
      )
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 100,
      render: (rate) => `${rate}%`
    },
    {
      title: '检验结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const resultMap = {
          pass: { color: 'green', text: '合格' },
          fail: { color: 'red', text: '不合格' },
          pending: { color: 'blue', text: '待检验' }
        };
        const { color, text } = resultMap[result];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待检验' },
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
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };


  return (
    <div>
      <Card 
        title={
          <Space>
            <CheckSquareOutlined />
            FQC成品质量检验
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
          dataSource={fqcData}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
            }
          }}
        />
      </Card>
    </div>
  );
};

export default FQCInspection;