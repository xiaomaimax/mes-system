import { Card, Button, Table, Tag, Progress, Space, message } from 'antd';

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
import ButtonActions from '../../utils/buttonActions';
import {   GlobalOutlined, 
  DownloadOutlined,
  PlayCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const SystemBackup = () => {
  // 备份记录数据
  const backupData = [
    {
      key: '1',
      backupId: 'BK20241222001',
      backupTime: '2024-12-22 02:00:00',
      backupType: '自动备份',
      fileSize: '2.5GB',
      status: '成功',
      description: '每日自动备份'
    },
    {
      key: '2',
      backupId: 'BK20241221001',
      backupTime: '2024-12-21 02:00:00',
      backupType: '自动备份',
      fileSize: '2.4GB',
      status: '成功',
      description: '每日自动备份'
    },
    {
      key: '3',
      backupId: 'BK20241220002',
      backupTime: '2024-12-20 15:30:00',
      backupType: '手动备份',
      fileSize: '2.3GB',
      status: '成功',
      description: '系统升级前备份'
    }
  ];

  const columns = [
    {
      title: '备份ID',
      dataIndex: 'backupId',
      key: 'backupId'
    },
    {
      title: '备份时间',
      dataIndex: 'backupTime',
      key: 'backupTime'
    },
    {
      title: '备份类型',
      dataIndex: 'backupType',
      key: 'backupType',
      render: (type) => (
        <Tag color={type === '自动备份' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '成功' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button onClick={() => ButtonActions.simulateDelete('记录 ' + record.id, () => { safeMessage.success('删除成功'); })} type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleBackup = () => {
    safeMessage.success('备份任务已启动');
  };

  return (
    <div>
      <Card title="备份操作" style={{ marginBottom: '16px' }}>
        <Space>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleBackup}>
            立即备份
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出配置
          </Button>
        </Space>
      </Card>

      <Card title="备份记录">
        <Table
          columns={columns}
          dataSource={backupData}
          pagination={{
            total: backupData.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default SystemBackup;