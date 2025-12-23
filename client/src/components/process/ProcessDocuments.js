import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Upload, Tag, message, Row, Col, Descriptions, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const ProcessDocuments = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [form] = Form.useForm();

  const documentData = [
    {
      key: '1',
      docCode: 'DOC-001',
      docName: '塑料外壳A工艺卡片',
      docType: '工艺卡片',
      version: 'V2.1',
      fileType: 'PDF',
      fileSize: '2.5MB',
      productCode: 'P001',
      productName: '塑料外壳A',
      status: '生效',
      createDate: '2024-01-15',
      creator: '张工程师',
      approver: '李主管',
      approveDate: '2024-01-20'
    },
    {
      key: '2',
      docCode: 'DOC-002',
      docName: '注塑工艺参数表',
      docType: '工艺参数',
      version: 'V1.3',
      fileType: 'Excel',
      fileSize: '1.2MB',
      productCode: 'P001',
      productName: '塑料外壳A',
      status: '生效',
      createDate: '2024-02-10',
      creator: '王技术员',
      approver: '李主管',
      approveDate: '2024-02-15'
    },
    {
      key: '3',
      docCode: 'DOC-003',
      docName: '产品技术图纸',
      docType: '技术图纸',
      version: 'V2.0',
      fileType: 'CAD',
      fileSize: '5.8MB',
      productCode: 'P002',
      productName: '电子组件B',
      status: '待审核',
      createDate: '2024-03-05',
      creator: '赵工程师',
      approver: '',
      approveDate: ''
    }
  ];

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'excel':
      case 'xlsx':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'image':
      case 'jpg':
      case 'png':
        return <FileImageOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileTextOutlined style={{ color: '#666' }} />;
    }
  };

  const columns = [
    {
      title: '文档编码',
      dataIndex: 'docCode',
      key: 'docCode',
      render: (text, record) => (
        <a onClick={() => handlePreview(record)}>{text}</a>
      )
    },
    {
      title: '文档名称',
      dataIndex: 'docName',
      key: 'docName',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.fileType)}
          {text}
        </Space>
      )
    },
    {
      title: '文档类型',
      dataIndex: 'docType',
      key: 'docType'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType'
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize'
    },
    {
      title: '关联产品',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '生效' ? 'green' : 
          status === '待审核' ? 'orange' : 
          status === '已停用' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
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
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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

  const handlePreview = (record) => {
    setSelectedDoc(record);
    setPreviewModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存工艺文档:', values);
      message.success('保存成功');
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索工艺文档..."
              style={{ width: 300 }}
              onSearch={(value) => console.log('搜索:', value)}
            />
            <Select placeholder="文档类型" style={{ width: 120 }} allowClear>
              <Option value="工艺卡片">工艺卡片</Option>
              <Option value="工艺参数">工艺参数</Option>
              <Option value="技术图纸">技术图纸</Option>
              <Option value="作业指导">作业指导</Option>
            </Select>
            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
              <Option value="生效">生效</Option>
              <Option value="待审核">待审核</Option>
              <Option value="已停用">已停用</Option>
            </Select>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              上传文档
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={documentData}
          pagination={{
            total: documentData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 上传/编辑文档模态框 */}
      <Modal
        title={editingRecord ? '编辑工艺文档' : '上传工艺文档'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="docCode"
                label="文档编码"
                rules={[{ required: true, message: '请输入文档编码' }]}
              >
                <Input placeholder="请输入文档编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="docName"
                label="文档名称"
                rules={[{ required: true, message: '请输入文档名称' }]}
              >
                <Input placeholder="请输入文档名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="docType"
                label="文档类型"
                rules={[{ required: true, message: '请选择文档类型' }]}
              >
                <Select placeholder="请选择文档类型">
                  <Option value="工艺卡片">工艺卡片</Option>
                  <Option value="工艺参数">工艺参数</Option>
                  <Option value="技术图纸">技术图纸</Option>
                  <Option value="作业指导">作业指导</Option>
                  <Option value="检验标准">检验标准</Option>
                </Select>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productCode"
                label="关联产品"
                rules={[{ required: true, message: '请选择关联产品' }]}
              >
                <Select placeholder="请选择关联产品">
                  <Option value="P001">P001 - 塑料外壳A</Option>
                  <Option value="P002">P002 - 电子组件B</Option>
                  <Option value="P003">P003 - 机械零件C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="草稿">草稿</Option>
                  <Option value="待审核">待审核</Option>
                  <Option value="生效">生效</Option>
                  <Option value="已停用">已停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="file"
            label="上传文件"
            rules={[{ required: !editingRecord, message: '请上传文件' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="文档描述"
          >
            <TextArea rows={3} placeholder="请输入文档描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 文档预览模态框 */}
      <Modal
        title="文档预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            下载
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedDoc && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="文档编码">{selectedDoc.docCode}</Descriptions.Item>
              <Descriptions.Item label="文档名称">{selectedDoc.docName}</Descriptions.Item>
              <Descriptions.Item label="文档类型">{selectedDoc.docType}</Descriptions.Item>
              <Descriptions.Item label="版本号">{selectedDoc.version}</Descriptions.Item>
              <Descriptions.Item label="文件类型">{selectedDoc.fileType}</Descriptions.Item>
              <Descriptions.Item label="文件大小">{selectedDoc.fileSize}</Descriptions.Item>
              <Descriptions.Item label="关联产品">{selectedDoc.productName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedDoc.status === '生效' ? 'green' : 'orange'}>
                  {selectedDoc.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedDoc.creator}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedDoc.createDate}</Descriptions.Item>
              <Descriptions.Item label="审批人">{selectedDoc.approver || '未审批'}</Descriptions.Item>
              <Descriptions.Item label="审批日期">{selectedDoc.approveDate || '未审批'}</Descriptions.Item>
            </Descriptions>

            <Divider>文档内容</Divider>
            <div style={{ 
              height: '400px', 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fafafa'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                {getFileIcon(selectedDoc.fileType)}
                <div style={{ marginTop: '8px' }}>
                  文档预览功能开发中...
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  请点击下载按钮查看完整文档
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcessDocuments;