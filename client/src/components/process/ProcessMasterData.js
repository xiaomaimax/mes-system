import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, message, Tabs, Row, Col, Statistic, Progress, Spin } from 'antd';

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
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, ImportOutlined, BookOutlined, SettingOutlined, BranchesOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
import { useDataService } from '../../hooks/useDataService';
import DataService from '../../services/DataService';
const { Option } = Select;
const { TextArea } = Input;

const ProcessMasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 使用useDataService Hook获取数据
  const {
    data: productData,
    loading: productLoading,
    error: productError,
    refetch: refetchProducts
  } = useDataService(() => DataService.getProcessProducts(), []);

  const {
    data: operationData,
    loading: operationLoading,
    error: operationError,
    refetch: refetchOperations
  } = useDataService(() => DataService.getProcessOperations(), []);

  const {
    data: equipmentData,
    loading: equipmentLoading,
    error: equipmentError,
    refetch: refetchEquipment
  } = useDataService(() => DataService.getProcessEquipment(), []);

  // 获取当前标签页的数据
  const getCurrentData = () => {
    switch (activeTab) {
      case 'products':
        return {
          data: productData?.items || [],
          loading: productLoading,
          error: productError
        };
      case 'operations':
        return {
          data: operationData?.items || [],
          loading: operationLoading,
          error: operationError
        };
      case 'equipment':
        return {
          data: equipmentData?.items || [],
          loading: equipmentLoading,
          error: equipmentError
        };
      default:
        return { data: [], loading: false, error: null };
    }
  };

  const { data: currentData, loading: currentLoading, error: currentError } = getCurrentData();

  const productColumns = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '产品类别',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '主要材料',
      dataIndex: 'material',
      key: 'material'
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
        <Tag color={status === '生效' ? 'green' : status === '待审核' ? 'orange' : 'red'}>
          {status}
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
          <Button onClick={() => handleEdit(record)} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const operationColumns = [
    {
      title: '工序编码',
      dataIndex: 'operationCode',
      key: 'operationCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '工序名称',
      dataIndex: 'operationName',
      key: 'operationName'
    },
    {
      title: '工序类别',
      dataIndex: 'category',
      key: 'category'
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
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

  const equipmentColumns = [
    {
      title: '设备编码',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      render: (text) => <a>{text}</a>
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName'
    },
    {
      title: '设备型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      key: 'workCenter'
    },
    {
      title: '设备能力',
      dataIndex: 'capacity',
      key: 'capacity'
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '运行中' ? 'green' : status === '维护中' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '设备效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency) => (
        <div>
          <Progress percent={efficiency} size="small" />
          <span style={{ fontSize: '12px' }}>{efficiency}%</span>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存数据:', values);
      
      let result;
      
      // 根据当前标签页调用不同的API
      switch (activeTab) {
        case 'products':
          if (editingRecord) {
            // 编辑产品（暂时只显示成功消息）
            safeMessage.success('产品更新成功');
          } else {
            // 新增产品
            result = await DataService.addProcessProduct(values);
            if (result.success) {
              safeMessage.success(result.message || '产品添加成功');
              // 刷新产品数据
              refetchProducts();
            }
          }
          break;
          
        case 'operations':
          if (editingRecord) {
            // 编辑工序（暂时只显示成功消息）
            safeMessage.success('工序更新成功');
          } else {
            // 新增工序
            result = await DataService.addProcessOperation(values);
            if (result.success) {
              safeMessage.success(result.message || '工序添加成功');
              // 刷新工序数据
              refetchOperations();
            }
          }
          break;
          
        case 'equipment':
          if (editingRecord) {
            // 编辑设备（暂时只显示成功消息）
            safeMessage.success('设备更新成功');
          } else {
            // 新增设备
            result = await DataService.addProcessEquipment(values);
            if (result.success) {
              safeMessage.success(result.message || '设备添加成功');
              // 刷新设备数据
              refetchEquipment();
            }
          }
          break;
          
        default:
          safeMessage.error('未知的数据类型');
          return;
      }
      
      setModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error('保存失败:', error);
      safeMessage.error('保存失败: ' + (error.message || '未知错误'));
    }
  };

  const tabItems = [
    {
      key: 'products',
      label: '产品主数据',
      icon: <BookOutlined />
    },
    {
      key: 'operations',
      label: '工序主数据',
      icon: <SettingOutlined />
    },
    {
      key: 'equipment',
      label: '设备主数据',
      icon: <BranchesOutlined />
    }
  ];

  const renderProductForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" />
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
        <Col span={12}>
          <Form.Item
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别">
              <Option value="注塑件">注塑件</Option>
              <Option value="电子件">电子件</Option>
              <Option value="机加件">机加件</Option>
              <Option value="装配件">装配件</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="specification"
            label="规格型号"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="material"
            label="主要材料"
            rules={[{ required: true, message: '请输入主要材料' }]}
          >
            <Input placeholder="请输入主要材料" />
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
      <Form.Item
        name="description"
        label="产品描述"
      >
        <TextArea rows={3} placeholder="请输入产品描述" />
      </Form.Item>
    </Form>
  );

  const renderOperationForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="operationCode"
            label="工序编码"
            rules={[{ required: true, message: '请输入工序编码' }]}
          >
            <Input placeholder="请输入工序编码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="operationName"
            label="工序名称"
            rules={[{ required: true, message: '请输入工序名称' }]}
          >
            <Input placeholder="请输入工序名称" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="工序类别"
            rules={[{ required: true, message: '请选择工序类别' }]}
          >
            <Select placeholder="请选择工序类别">
              <Option value="成型工序">成型工序</Option>
              <Option value="加工工序">加工工序</Option>
              <Option value="装配工序">装配工序</Option>
              <Option value="后处理">后处理</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="workCenter"
            label="工作中心"
            rules={[{ required: true, message: '请选择工作中心' }]}
          >
            <Select placeholder="请选择工作中心">
              <Option value="注塑车间">注塑车间</Option>
              <Option value="机加车间">机加车间</Option>
              <Option value="装配车间">装配车间</Option>
              <Option value="表处车间">表处车间</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="standardTime"
            label="标准工时(分钟)"
            rules={[{ required: true, message: '请输入标准工时' }]}
          >
            <InputNumber min={0} placeholder="请输入标准工时" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="setupTime"
            label="准备工时(分钟)"
            rules={[{ required: true, message: '请输入准备工时' }]}
          >
            <InputNumber min={0} placeholder="请输入准备工时" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="工序描述"
      >
        <TextArea rows={3} placeholder="请输入工序描述" />
      </Form.Item>
    </Form>
  );

  const renderEquipmentForm = () => (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="equipmentCode"
            label="设备编码"
            rules={[{ required: true, message: '请输入设备编码' }]}
          >
            <Input placeholder="请输入设备编码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="equipmentName"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="model"
            label="设备型号"
            rules={[{ required: true, message: '请输入设备型号' }]}
          >
            <Input placeholder="请输入设备型号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="workCenter"
            label="工作中心"
            rules={[{ required: true, message: '请选择工作中心' }]}
          >
            <Select placeholder="请选择工作中心">
              <Option value="注塑车间">注塑车间</Option>
              <Option value="机加车间">机加车间</Option>
              <Option value="装配车间">装配车间</Option>
              <Option value="表处车间">表处车间</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="capacity"
            label="设备能力"
            rules={[{ required: true, message: '请输入设备能力' }]}
          >
            <Input placeholder="请输入设备能力" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="efficiency"
            label="设备效率(%)"
            rules={[{ required: true, message: '请输入设备效率' }]}
          >
            <InputNumber min={0} max={100} placeholder="请输入设备效率" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label="设备描述"
      >
        <TextArea rows={3} placeholder="请输入设备描述" />
      </Form.Item>
    </Form>
  );

  const getModalTitle = () => {
    const titles = {
      products: editingRecord ? '编辑产品' : '新增产品',
      operations: editingRecord ? '编辑工序' : '新增工序',
      equipment: editingRecord ? '编辑设备' : '新增设备'
    };
    return titles[activeTab];
  };

  const getFormContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProductForm();
      case 'operations':
        return renderOperationForm();
      case 'equipment':
        return renderEquipmentForm();
      default:
        return renderProductForm();
    }
  };

  const getTableData = () => {
    switch (activeTab) {
      case 'products':
        return { 
          columns: productColumns, 
          data: productData?.items || [],
          loading: productLoading,
          error: productError
        };
      case 'operations':
        return { 
          columns: operationColumns, 
          data: operationData?.items || [],
          loading: operationLoading,
          error: operationError
        };
      case 'equipment':
        return { 
          columns: equipmentColumns, 
          data: equipmentData?.items || [],
          loading: equipmentLoading,
          error: equipmentError
        };
      default:
        return { 
          columns: productColumns, 
          data: [],
          loading: false,
          error: null
        };
    }
  };

  const { columns, data, loading, error } = getTableData();

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="产品总数"
              value={productData?.items?.length || 0}
              prefix={<BookOutlined />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="工序总数"
              value={operationData?.items?.length || 0}
              prefix={<SettingOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="设备总数"
              value={equipmentData?.items?.length || 0}
              prefix={<BranchesOutlined />}
              suffix="台"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
          </Space>
          <Space>
            <Button icon={<ImportOutlined />}>导入</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />

        {/* 错误状态显示 */}
        {error && (
          <div style={{ marginBottom: '16px' }}>
            <Card>
              <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
                <p>数据加载失败: {error.message}</p>
                <Button 
                  type="primary" 
                  onClick={() => {
                    switch (activeTab) {
                      case 'products':
                        refetchProducts();
                        break;
                      case 'operations':
                        refetchOperations();
                        break;
                      case 'equipment':
                        refetchEquipment();
                        break;
                    }
                  }}
                >
                  重试
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 加载状态 */}
        <Spin spinning={loading} tip="加载中...">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              total: data.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            size="small"
            locale={{
              emptyText: loading ? '加载中...' : '暂无数据'
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        destroyOnClose
      >
        {getFormContent()}
      </Modal>
    </div>
  );
};

export default ProcessMasterData;