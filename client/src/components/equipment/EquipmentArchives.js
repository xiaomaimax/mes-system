import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Modal, Form, DatePicker, Upload } from 'antd';
import { PlusOutlined, SearchOutlined, FolderOutlined, EditOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const EquipmentArchives = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const archiveData = [
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      category: '注塑设备',
      model: 'INJ-2000A',
      manufacturer: '海天集团',
      purchaseDate: '2023-01-15',
      warrantyEndDate: '2026-01-15',
      originalValue: 350000.00,
      currentValue: 280000.00,
      location: '车间A-01',
      status: 'running',
      technicalSpecs: {
        power: '50kW',
        capacity: '200T',
        dimensions: '4.5m×2.2m×2.8m'
      },
      documents: [
        { name: '设备说明书', type: 'manual' },
        { name: '质保书', type: 'warranty' },
        { name: '验收报告', type: 'acceptance' }
      ],
      maintenanceRecords: 15,
      repairRecords: 3,
      remarks: '主力生产设备'
    }
  ];

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '设备类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '型号规格',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 100,
    },
    {
      title: '保修期至',
      dataIndex: 'warrantyEndDate',
      key: 'warrantyEndDate',
      width: 100,
    },
    {
      title: '原值/现值',
      key: 'value',
      width: 150,
      render: (_, record) => (
        <div>
          <div>原值: ¥{record.originalValue.toLocaleString()}</div>
          <div style={{ color: '#666' }}>现值: ¥{record.currentValue.toLocaleString()}</div>
        </div>
      )
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          running: { color: 'green', text: '运行中' },
          idle: { color: 'blue', text: '空闲' },
          maintenance: { color: 'orange', text: '维护中' },
          fault: { color: 'red', text: '故障' },
          scrapped: { color: 'gray', text: '报废' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '维护/维修记录',
      key: 'records',
      width: 120,
      render: (_, record) => (
        <div>
          <div>维护: {record.maintenanceRecords}次</div>
          <div>维修: {record.repairRecords}次</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看档案
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" size="small">
            文档管理
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <FolderOutlined />
            设备档案管理
          </Space>
        }
        extra={
          <Space>
            <Button>导入档案</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              新建档案
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索设备编号/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="设备类别" style={{ width: 150 }}>
              <Option value="注塑设备">注塑设备</Option>
              <Option value="包装设备">包装设备</Option>
              <Option value="检测设备">检测设备</Option>
            </Select>
            <Select placeholder="设备状态" style={{ width: 120 }}>
              <Option value="running">运行中</Option>
              <Option value="idle">空闲</Option>
              <Option value="maintenance">维护中</Option>
              <Option value="fault">故障</Option>
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
          dataSource={archiveData}
          loading={loading}
          pagination={{
            total: archiveData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </div>
  );
};

export default EquipmentArchives;