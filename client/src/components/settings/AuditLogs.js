import { Card, Table, Button, Space, Tag, DatePicker, Select, Input } from 'antd';
import ButtonActions from '../../utils/buttonActions';
import {   AuditOutlined, 
  DownloadOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  // 审计日志数据
  const auditLogData = [
    {
      key: '1',
      timestamp: '2024-12-22 10:30:15',
      user: '系统管理员',
      action: '用户登录',
      resource: '系统',
      result: '成功',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      key: '2',
      timestamp: '2024-12-22 10:25:08',
      user: '张主管',
      action: '修改用户信息',
      resource: 'USR003',
      result: '成功',
      ipAddress: '192.168.1.101',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      key: '3',
      timestamp: '2024-12-22 10:00:32',
      user: '未知用户',
      action: '尝试登录',
      resource: '系统',
      result: '失败',
      ipAddress: '192.168.1.200',
      userAgent: 'Unknown'
    }
  ];

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource'
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) => (
        <Tag color={result === '成功' ? 'green' : 'red'}>
          {result}
        </Tag>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    },
    {
      title: '用户代理',
      dataIndex: 'userAgent',
      key: 'userAgent',
      ellipsis: true
    }
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Input.Search
              placeholder="搜索用户或操作..."
              style={{ width: 200 }}
            />
            <Select placeholder="操作类型" style={{ width: 120 }} allowClear>
              <Option value="登录">登录</Option>
              <Option value="修改">修改</Option>
              <Option value="删除">删除</Option>
              <Option value="查看">查看</Option>
            </Select>
            <Select placeholder="结果" style={{ width: 100 }} allowClear>
              <Option value="成功">成功</Option>
              <Option value="失败">失败</Option>
            </Select>
            <RangePicker />
          </Space>
          <Button icon={<DownloadOutlined />}>
            导出日志
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={auditLogData}
          pagination={{
            total: auditLogData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default AuditLogs;