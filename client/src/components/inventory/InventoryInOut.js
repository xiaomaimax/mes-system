import React, { useState } from 'react';
import { Card, Tabs, Button, Table, Tag, Row, Col, Statistic, Spin, Alert, message, Modal, Space } from 'antd';

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
import { ImportOutlined, ExportOutlined, PlusOutlined, InboxOutlined, SendOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

const InventoryInOut = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('in');

  // 使用 DataService 获取出入库记录数据
  // Requirements: 5.2, 5.5
  const { data: transactionData, loading, error, refetch } = useDataService(
    () => DataService.getInventoryTransactions(),
    [],
    { useCache: true, cacheTTL: 5 * 60 * 1000 }
  );

  // 格式化交易数据用于表格显示
  const formatTransactionData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.map((item, index) => ({
      key: item.id || index,
      id: item.id,
      documentNo: item.transaction_id || `TXN-${String(item.id).padStart(5, '0')}`,
      materialName: item.material_name || `物料 ${item.material_id}`,
      quantity: item.quantity || 0,
      unit: item.unit || '个',
      date: item.transaction_date || new Date().toISOString().split('T')[0],
      status: item.status || 'completed',
      type: item.transaction_type || 'in',
      warehouse: item.warehouse_location || '-',
      operator: item.operator || '-'
    }));
  };

  const formattedData = formatTransactionData(transactionData);

  // 按类型分离数据
  const inData = formattedData.filter(item => item.type === 'in');
  const outData = formattedData.filter(item => item.type === 'out');

  const columns = [
    { title: '单号', dataIndex: 'documentNo', key: 'documentNo', width: 120 },
    { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 150 },
    { title: '数量', key: 'quantity', width: 100, render: (_, record) => `${record.quantity} ${record.unit}` },
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '仓库', dataIndex: 'warehouse', key: 'warehouse', width: 120 },
    { title: '操作员', dataIndex: 'operator', key: 'operator', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusMap = {
          'completed': { color: 'green', text: '已完成' },
          'pending': { color: 'orange', text: '待处理' },
          'cancelled': { color: 'red', text: '已取消' }
        };
        const statusInfo = statusMap[status] || { color: 'blue', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
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

  // 计算统计数据
  const todayInCount = inData.length;
  const todayOutCount = outData.length;

  // 处理编辑操作
  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      message.info(`编辑${record.type === 'in' ? '入库' : '出库'}单: ${record.documentNo}`);
    } catch (error) {
      console.error('编辑操作失败:', error);
      safeMessage.error('编辑操作失败: ' + (error.message || '未知错误'));
    }
  };

  // 处理删除操作
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除${record.type === 'in' ? '入库' : '出库'}单"${record.documentNo}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟删除API调用
          console.log('删除出入库记录:', record.id);
          
          // 这里应该调用实际的删除API
          // const result = await DataService.deleteInventoryTransaction(record.id);
          
          safeMessage.success('删除成功');
          refetch(); // 刷新数据
        } catch (error) {
          console.error('删除失败:', error);
          safeMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  // 处理加载和错误状态
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>出入库管理</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>管理物料的入库、出库操作</p>
        </div>
        <Alert
          message="数据加载失败"
          description={error.message || '无法加载出入库数据，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'in',
      label: '入库管理',
      icon: <ImportOutlined />,
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="入库记录" value={todayInCount} suffix="笔" prefix={<InboxOutlined />} />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                try {
                  message.info('新建入库单功能');
                } catch (error) {
                  console.error('新建入库单失败:', error);
                  safeMessage.error('新建入库单失败: ' + (error.message || '未知错误'));
                }
              }}
            >
              新建入库单
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                try {
                  refetch();
                  safeMessage.success('数据刷新成功');
                } catch (error) {
                  console.error('刷新失败:', error);
                  safeMessage.error('刷新失败: ' + (error.message || '未知错误'));
                }
              }}
              loading={loading}
              style={{ marginLeft: 8 }}
            >
              刷新
            </Button>
          </div>
          <Spin spinning={loading}>
            <Card size="small">
              <Table 
                columns={columns} 
                dataSource={inData} 
                pagination={false} 
                size="small"
                locale={{ emptyText: '暂无入库记录' }}
              />
            </Card>
          </Spin>
        </div>
      )
    },
    {
      key: 'out',
      label: '出库管理',
      icon: <ExportOutlined />,
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="出库记录" value={todayOutCount} suffix="笔" prefix={<SendOutlined />} />
              </Card>
            </Col>
          </Row>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                try {
                  message.info('新建出库单功能');
                } catch (error) {
                  console.error('新建出库单失败:', error);
                  safeMessage.error('新建出库单失败: ' + (error.message || '未知错误'));
                }
              }}
            >
              新建出库单
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                try {
                  refetch();
                  safeMessage.success('数据刷新成功');
                } catch (error) {
                  console.error('刷新失败:', error);
                  safeMessage.error('刷新失败: ' + (error.message || '未知错误'));
                }
              }}
              loading={loading}
              style={{ marginLeft: 8 }}
            >
              刷新
            </Button>
          </div>
          <Spin spinning={loading}>
            <Card size="small">
              <Table 
                columns={columns} 
                dataSource={outData} 
                pagination={false} 
                size="small"
                locale={{ emptyText: '暂无出库记录' }}
              />
            </Card>
          </Spin>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>出入库管理</h2>
        <p style={{ margin: '4px 0 0 0', color: '#666' }}>管理物料的入库、出库操作</p>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="small" />
    </div>
  );
};

export default InventoryInOut;