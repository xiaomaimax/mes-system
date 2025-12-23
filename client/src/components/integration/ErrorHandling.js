import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Row, Col, Statistic, Alert, Select, DatePicker, Modal, Descriptions } from 'antd';
import { BugOutlined, ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, ReloadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ErrorHandling = () => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  // 错误日志数据
  const errorLogData = [
    {
      key: '1',
      errorTime: '2024-12-20 10:00:32',
      interfaceName: '工艺数据接口',
      systemType: 'PLM',
      errorLevel: '严重',
      errorCode: 'CONN_TIMEOUT',
      errorMessage: '连接超时：无法连接到PLM服务器',
      retryCount: 3,
      status: '未解决',
      operator: '系统自动'
    },
    {
      key: '2',
      errorTime: '2024-12-20 09:45:21',
      interfaceName: '质量数据接口',
      systemType: 'QMS',
      errorLevel: '警告',
      errorCode: 'DATA_VALIDATION',
      errorMessage: '数据验证失败：3条记录格式不正确',
      retryCount: 1,
      status: '已解决',
      operator: '张工程师'
    },
    {
      key: '3',
      errorTime: '2024-12-20 09:30:15',
      interfaceName: '库存同步接口',
      systemType: 'WMS',
      errorLevel: '信息',
      errorCode: 'PARTIAL_SUCCESS',
      errorMessage: '部分数据同步成功：156条成功，4条失败',
      retryCount: 0,
      status: '已解决',
      operator: '李主管'
    },
    {
      key: '4',
      errorTime: '2024-12-20 08:15:42',
      interfaceName: '生产订单接口',
      systemType: 'ERP',
      errorLevel: '错误',
      errorCode: 'AUTH_FAILED',
      errorMessage: '认证失败：Token已过期',
      retryCount: 2,
      status: '已解决',
      operator: '王技术员'
    }
  ];

  const columns = [
    {
      title: '发生时间',
      dataIndex: 'errorTime',
      key: 'errorTime',
      width: 150
    },
    {
      title: '接口名称',
      dataIndex: 'interfaceName',
      key: 'interfaceName'
    },
    {
      title: '系统类型',
      dataIndex: 'systemType',
      key: 'systemType',
      render: (type) => (
        <Tag color={
          type === 'ERP' ? 'blue' : 
          type === 'WMS' ? 'green' : 
          type === 'PLM' ? 'orange' : 'purple'
        }>
          {type}
        </Tag>
      )
    },
    {
      title: '错误级别',
      dataIndex: 'errorLevel',
      key: 'errorLevel',
      render: (level) => (
        <Tag color={
          level === '严重' ? 'red' : 
          level === '错误' ? 'orange' : 
          level === '警告' ? 'yellow' : 'blue'
        }>
          {level}
        </Tag>
      )
    },
    {
      title: '错误代码',
      dataIndex: 'errorCode',
      key: 'errorCode'
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true
    },
    {
      title: '重试次数',
      dataIndex: 'retryCount',
      key: 'retryCount'
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已解决' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === '未解决' && (
            <Button type="link" size="small" icon={<ReloadOutlined />}>
              重试
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleViewDetail = (record) => {
    setSelectedError(record);
    setDetailModalVisible(true);
  };

  // 错误统计数据
  const errorStats = {
    todayTotal: 15,
    todayResolved: 12,
    todayUnresolved: 3,
    resolveRate: 80.0
  };

  return (
    <div>
      {/* 错误统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日错误总数"
              value={errorStats.todayTotal}
              prefix={<BugOutlined />}
              suffix="个"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解决"
              value={errorStats.todayResolved}
              prefix={<ExclamationCircleOutlined />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="未解决"
              value={errorStats.todayUnresolved}
              prefix={<WarningOutlined />}
              suffix="个"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="解决率"
              value={errorStats.resolveRate}
              prefix={<InfoCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 未解决错误提醒 */}
      {errorStats.todayUnresolved > 0 && (
        <Alert
          message="未解决错误提醒"
          description={`当前有 ${errorStats.todayUnresolved} 个未解决的错误，其中包含严重级别错误，请及时处理。`}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" danger>
              立即处理
            </Button>
          }
        />
      )}

      {/* 错误日志列表 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select placeholder="错误级别" style={{ width: 120 }} allowClear>
              <Option value="严重">严重</Option>
              <Option value="错误">错误</Option>
              <Option value="警告">警告</Option>
              <Option value="信息">信息</Option>
            </Select>
            <Select placeholder="系统类型" style={{ width: 120 }} allowClear>
              <Option value="ERP">ERP</Option>
              <Option value="WMS">WMS</Option>
              <Option value="PLM">PLM</Option>
              <Option value="QMS">QMS</Option>
            </Select>
            <Select placeholder="处理状态" style={{ width: 120 }} allowClear>
              <Option value="已解决">已解决</Option>
              <Option value="未解决">未解决</Option>
            </Select>
            <RangePicker showTime />
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button icon={<DownloadOutlined />}>导出日志</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={errorLogData}
          pagination={{
            total: errorLogData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 错误详情模态框 */}
      <Modal
        title="错误详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedError?.status === '未解决' && (
            <Button key="retry" type="primary" icon={<ReloadOutlined />}>
              重试处理
            </Button>
          )
        ]}
      >
        {selectedError && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="发生时间">{selectedError.errorTime}</Descriptions.Item>
              <Descriptions.Item label="接口名称">{selectedError.interfaceName}</Descriptions.Item>
              <Descriptions.Item label="系统类型">
                <Tag color={
                  selectedError.systemType === 'ERP' ? 'blue' : 
                  selectedError.systemType === 'WMS' ? 'green' : 'orange'
                }>
                  {selectedError.systemType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="错误级别">
                <Tag color={
                  selectedError.errorLevel === '严重' ? 'red' : 
                  selectedError.errorLevel === '错误' ? 'orange' : 'yellow'
                }>
                  {selectedError.errorLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="错误代码">{selectedError.errorCode}</Descriptions.Item>
              <Descriptions.Item label="重试次数">{selectedError.retryCount}</Descriptions.Item>
              <Descriptions.Item label="处理状态">
                <Tag color={selectedError.status === '已解决' ? 'green' : 'red'}>
                  {selectedError.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="处理人员">{selectedError.operator}</Descriptions.Item>
            </Descriptions>

            <Card title="错误信息" size="small" style={{ marginBottom: '16px' }}>
              <pre style={{ background: '#f5f5f5', padding: '12px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {selectedError.errorMessage}
              </pre>
            </Card>

            <Card title="堆栈跟踪" size="small" style={{ marginBottom: '16px' }}>
              <pre style={{ background: '#f5f5f5', padding: '12px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
{`java.net.ConnectException: Connection timed out: connect
    at java.net.DualStackPlainSocketImpl.connect0(Native Method)
    at java.net.DualStackPlainSocketImpl.socketConnect(DualStackPlainSocketImpl.java:79)
    at java.net.AbstractPlainSocketImpl.doConnect(AbstractPlainSocketImpl.java:350)
    at java.net.AbstractPlainSocketImpl.connectToAddress(AbstractPlainSocketImpl.java:206)
    at java.net.AbstractPlainSocketImpl.connect(AbstractPlainSocketImpl.java:188)
    at java.net.PlainSocketImpl.connect(PlainSocketImpl.java:172)
    at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:392)
    at java.net.Socket.connect(Socket.java:589)
    at com.mes.integration.PLMConnector.connect(PLMConnector.java:45)`}
              </pre>
            </Card>

            <Card title="解决建议" size="small">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>检查PLM服务器网络连接状态</li>
                <li>验证防火墙设置是否阻止连接</li>
                <li>确认PLM服务是否正常运行</li>
                <li>检查连接超时参数配置</li>
                <li>联系PLM系统管理员确认服务状态</li>
              </ul>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ErrorHandling;