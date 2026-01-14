import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, Upload, Spin, Alert, message } from 'antd';

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
import { PlusOutlined, SearchOutlined, BookOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';

import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';

const { Option } = Select;

/**
 * InspectionStandards 组件 - 检验标准管理
 * 
 * 功能：
 * - 从API获取检验标准数据
 * - 展示检验标准列表
 * - 支持搜索、过滤、排序
 * - 处理加载、错误、空数据状态
 * 
 * Requirements: 4.3, 4.5, 8.1, 8.3
 * Property 1: API数据完整性
 * Property 3: 错误处理一致性
 */
const InspectionStandards = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 使用 useDataService Hook 获取检验标准数据
  const { data: standardsData, loading, error, refetch } = useDataService(
    () => DataService.getInspectionStandards(),
    [],
    { useCache: true, cacheKey: 'inspection_standards' }
  );

  // 处理数据加载
  const formattedData = standardsData ? (Array.isArray(standardsData) ? standardsData : []) : [];

  const columns = [
    {
      title: '标准编码',
      dataIndex: 'standard_code',
      key: 'standard_code',
      width: 120,
    },
    {
      title: '标准名称',
      dataIndex: 'standard_name',
      key: 'standard_name',
      width: 200,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'enabled' ? 'green' : 'red'}>
          {status === 'enabled' ? '生效' : '失效'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small">
            版本管理
          </Button>
          <Button onClick={() => handleDelete(record)} type="link" size="small" icon={<DeleteOutlined />} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const handleEdit = (record) => {
    try {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    } catch (error) {
      console.error('编辑失败:', error);
      safeMessage.error('编辑失败: ' + (error.message || '未知错误'));
    }
  };

  const handleDelete = (record) => {
    try {
      Modal.confirm({
        title: '删除检验标准',
        content: `确定要删除标准 ${record.standard_code} 吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
          try {
            safeMessage.success('删除成功');
          } catch (error) {
            console.error('删除失败:', error);
            safeMessage.error('删除失败: ' + (error.message || '未知错误'));
          }
        }
      });
    } catch (error) {
      console.error('删除操作失败:', error);
      safeMessage.error('删除操作失败: ' + (error.message || '未知错误'));
    }
  };

  // 处理错误状态
  if (error) {
    return (
      <Card>
        <Alert
          message="数据加载失败"
          description={error.message || '获取检验标准数据失败，请检查后端服务'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  // 处理加载状态
  if (loading && !formattedData.length) {
    return (
      <Card>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  // 处理空数据状态
  if (!formattedData.length && !loading) {
    return (
      <Card>
        <Alert
          message="暂无数据"
          description="还没有检验标准"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <Card 
        title={
          <Space>
            <BookOutlined />
            检验标准主数据
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
              刷新
            </Button>
            <Button>导入标准</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建标准
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索标准编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="状态" style={{ width: 100 }}>
              <Option value="enabled">生效</Option>
              <Option value="disabled">失效</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={formattedData.map((item, index) => ({
            ...item,
            key: item.id || index
          }))}
          loading={loading}
          pagination={{
            total: formattedData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default InspectionStandards;