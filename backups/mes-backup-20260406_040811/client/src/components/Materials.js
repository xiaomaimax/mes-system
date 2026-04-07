import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { TokenManager } from '../utils/auth';

const { Option } = Select;

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form] = Form.useForm();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://192.168.100.6:5001/api';

  // 物料类型映射
  const materialTypes = {
    raw_material: '原材料',
    semi_finished: '半成品',
    finished: '成品',
    auxiliary: '辅料',
    packaging: '包材'
  };

  // 加载物料列表
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_BASE}/master-data/materials?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMaterials(response.data.data || []);
      } else {
        message.error('加载物料失败：' + response.data.message);
      }
    } catch (error) {
      console.error('加载物料失败:', error);
      message.error('网络错误：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // 打开创建模态框
  const handleCreate = () => {
    setEditingMaterial(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      unit: 'PCS'
    });
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (record) => {
    setEditingMaterial(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 保存物料
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = TokenManager.getToken();
      const url = editingMaterial
        ? `${API_BASE}/master-data/materials/${editingMaterial.id}`
        : `${API_BASE}/master-data/materials`;

      const method = editingMaterial ? 'put' : 'post';
      const response = await axios[method](url, values, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        message.success(editingMaterial ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadMaterials();
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error.message.includes('Validation')) {
        message.error('操作失败：' + error.message);
      }
    }
  };

  // 删除物料
  const handleDelete = async (id) => {
    try {
      const token = TokenManager.getToken();
      const response = await axios.delete(`${API_BASE}/master-data/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        message.success('删除成功');
        loadMaterials();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败：' + error.message);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '物料编码',
      dataIndex: 'material_code',
      key: 'material_code',
      width: 150
    },
    {
      title: '物料名称',
      dataIndex: 'material_name',
      key: 'material_name',
      width: 200
    },
    {
      title: '类型',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 100,
      render: (type) => materialTypes[type] || type
    },
    {
      title: '规格型号',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 150
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      default: 'PCS'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个物料吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="物料管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadMaterials}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建物料
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={materials}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingMaterial ? '编辑物料' : '新建物料'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            unit: 'PCS'
          }}
        >
          <Form.Item
            name="material_code"
            label="物料编码"
            rules={[
              { required: true, message: '请输入物料编码' },
              { max: 50, message: '最多 50 个字符' }
            ]}
          >
            <Input placeholder="例如：MAT-001" disabled={!!editingMaterial} />
          </Form.Item>

          <Form.Item
            name="material_name"
            label="物料名称"
            rules={[
              { required: true, message: '请输入物料名称' },
              { max: 200, message: '最多 200 个字符' }
            ]}
          >
            <Input placeholder="例如：不锈钢板" />
          </Form.Item>

          <Form.Item
            name="material_type"
            label="物料类型"
            rules={[{ required: true, message: '请选择物料类型' }]}
          >
            <Select placeholder="请选择">
              <Option value="raw_material">原材料</Option>
              <Option value="semi_finished">半成品</Option>
              <Option value="finished">成品</Option>
              <Option value="auxiliary">辅料</Option>
              <Option value="packaging">包材</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="specifications"
            label="规格型号"
          >
            <Input placeholder="例如：2mm*1220*2440" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ max: 20, message: '最多 20 个字符' }]}
          >
            <Input placeholder="例如：PCS, KG, 张" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Materials;
