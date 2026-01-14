/**
 * StorageStatsDisplay - 存储统计信息显示组件
 * 
 * 功能：
 * - 显示存储空间使用情况
 * - 展示数据统计信息
 * - 提供存储管理操作
 * 
 * Requirements: 7.5, 3.1, 3.2
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Progress, 
  Statistic, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tooltip, 
  Alert,
  Descriptions,
  Tag,
  Modal,
  message
} from 'antd';
import { 
  DatabaseOutlined,
  CloudOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  ClearOutlined,
  WarningOutlined
} from '@ant-design/icons';

import DataSourceIndicator from './DataSourceIndicator';
import EmployeePersistence from '../../utils/EmployeePersistence';
import PersistenceManager from '../../utils/PersistenceManager';

/**
 * 存储统计信息显示组件
 */
const StorageStatsDisplay = ({
  refreshInterval = 30000, // 30秒自动刷新
  showActions = true,
  showDetails = true,
  compact = false,
  onDataChange = null
}) => {
  const [stats, setStats] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // 加载统计信息
  const loadStats = async (showLoading = false) => {
    try {
      if (showLoading) setRefreshing(true);
      
      // 获取员工统计信息
      const employeeStats = await EmployeePersistence.getEmployeeStatsOptimized();
      
      // 获取存储信息
      const storage = PersistenceManager.getStorageInfo();
      
      // 获取存储健康状态
      const health = await EmployeePersistence.getStorageHealth();
      
      setStats(employeeStats);
      setStorageInfo({ ...storage, health });
      
      if (onDataChange) {
        onDataChange({ stats: employeeStats, storage, health });
      }
      
    } catch (error) {
      console.error('[StorageStatsDisplay] 加载统计信息失败:', error);
      safeMessage.error('加载存储统计信息失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // 初始加载和定时刷新
  useEffect(() => {
    loadStats();
    
    if (refreshInterval > 0) {
      const timer = setInterval(() => {
        loadStats();
      }, refreshInterval);
      
      return () => clearInterval(timer);
    }
  }, [refreshInterval]);
  
  // 清理存储数据
  const handleClearStorage = () => {
    Modal.confirm({
      title: '确认清理存储数据',
      content: '这将删除所有本地存储的员工数据，此操作不可恢复。确定要继续吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定清理',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const success = await EmployeePersistence.clearAllEmployees();
          if (success) {
            safeMessage.success('存储数据清理成功');
            await loadStats(true);
          } else {
            safeMessage.error('存储数据清理失败');
          }
        } catch (error) {
          console.error('[StorageStatsDisplay] 清理存储失败:', error);
          safeMessage.error('清理存储失败: ' + error.message);
        }
      }
    });
  };
  
  // 优化存储
  const handleOptimizeStorage = async () => {
    try {
      setRefreshing(true);
      safeMessage.loading('正在优化存储...', 0);
      
      const result = await EmployeePersistence.optimizeData({
        deepCleanup: true,
        compressData: true,
        defragmentStorage: true
      });
      
      // 安全地销毁之前的消息
      try {
        if (message.destroy && typeof message.destroy === 'function') {
          message.destroy();
        }
      } catch (error) {
        console.warn('销毁消息时出错:', error);
      }
      
      if (result.success) {
        safeMessage.success(`存储优化完成，节省空间 ${result.spaceSaved || 0} 字节`);
        await loadStats();
      } else {
        safeMessage.error('存储优化失败: ' + result.error);
      }
    } catch (error) {
      // 安全地销毁之前的消息
      try {
        if (message.destroy && typeof message.destroy === 'function') {
          message.destroy();
        }
      } catch (error) {
        console.warn('销毁消息时出错:', error);
      }
      console.error('[StorageStatsDisplay] 优化存储失败:', error);
      safeMessage.error('优化存储失败: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };
  
  // 渲染存储使用情况
  const renderStorageUsage = () => {
    if (!storageInfo) return null;
    
    const { usage, health } = storageInfo;
    const percentage = usage.percentage || 0;
    
    // 确定进度条颜色
    let strokeColor = '#52c41a'; // 绿色
    if (percentage > 80) {
      strokeColor = '#ff4d4f'; // 红色
    } else if (percentage > 60) {
      strokeColor = '#fa8c16'; // 橙色
    }
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>存储使用率</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {usage.used || 0} / {usage.total || 0} KB
          </span>
        </div>
        
        <Progress
          percent={percentage}
          strokeColor={strokeColor}
          size="small"
          showInfo={true}
        />
        
        {usage.isNearLimit && (
          <Alert
            message="存储空间不足"
            description="建议清理数据或优化存储以释放空间"
            type="warning"
            size="small"
            showIcon
            style={{ marginTop: '8px' }}
          />
        )}
        
        {health.status === 'degraded' && (
          <Alert
            message="存储状态异常"
            description="当前使用内存模式，数据可能在页面刷新后丢失"
            type="error"
            size="small"
            showIcon
            style={{ marginTop: '8px' }}
          />
        )}
      </div>
    );
  };
  
  // 渲染数据统计
  const renderDataStats = () => {
    if (!stats) return null;
    
    return (
      <Row gutter={[16, 16]}>
        <Col span={compact ? 24 : 8}>
          <Statistic
            title="员工总数"
            value={stats.total}
            prefix={<DatabaseOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        
        <Col span={compact ? 12 : 8}>
          <Statistic
            title="部门数量"
            value={Object.keys(stats.departments || {}).length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        
        <Col span={compact ? 12 : 8}>
          <Statistic
            title="职位数量"
            value={Object.keys(stats.positions || {}).length}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
      </Row>
    );
  };
  
  // 渲染操作按钮
  const renderActions = () => {
    if (!showActions) return null;
    
    return (
      <Space>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          loading={refreshing}
          onClick={() => loadStats(true)}
        >
          刷新
        </Button>
        
        <Button
          size="small"
          icon={<ClearOutlined />}
          onClick={handleOptimizeStorage}
          loading={refreshing}
        >
          优化
        </Button>
        
        <Button
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => setShowDetailModal(true)}
        >
          详情
        </Button>
        
        <Button
          size="small"
          icon={<DeleteOutlined />}
          danger
          onClick={handleClearStorage}
        >
          清理
        </Button>
      </Space>
    );
  };
  
  // 渲染详细信息模态框
  const renderDetailModal = () => {
    if (!stats || !storageInfo) return null;
    
    return (
      <Modal
        title="存储详细信息"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="存储类型">
            <DataSourceIndicator 
              source={storageInfo.storageType} 
              showLabel={true}
              showTooltip={false}
            />
          </Descriptions.Item>
          
          <Descriptions.Item label="数据状态">
            <Tag color={storageInfo.health.status === 'healthy' ? 'green' : 'red'}>
              {storageInfo.health.status === 'healthy' ? '正常' : '异常'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="员工总数">
            {stats.total}
          </Descriptions.Item>
          
          <Descriptions.Item label="最后更新">
            {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleString('zh-CN') : '未知'}
          </Descriptions.Item>
          
          <Descriptions.Item label="缓存状态">
            <Tag color={stats.cacheStatus === 'cached' ? 'blue' : 'default'}>
              {stats.cacheStatus === 'cached' ? '已缓存' : '未缓存'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="存储使用">
            {storageInfo.usage.used || 0} KB / {storageInfo.usage.total || 0} KB
          </Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: '16px' }}>
          <h4>部门分布</h4>
          <Space wrap>
            {Object.entries(stats.departments || {}).map(([dept, count]) => (
              <Tag key={dept} color="blue">
                {dept}: {count}
              </Tag>
            ))}
          </Space>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <h4>职位分布</h4>
          <Space wrap>
            {Object.entries(stats.positions || {}).map(([pos, count]) => (
              <Tag key={pos} color="green">
                {pos}: {count}
              </Tag>
            ))}
          </Space>
        </div>
        
        {storageInfo.health.warnings && storageInfo.health.warnings.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4>警告信息</h4>
            {storageInfo.health.warnings.map((warning, index) => (
              <Alert
                key={index}
                message={warning}
                type="warning"
                size="small"
                showIcon
                style={{ marginBottom: '8px' }}
              />
            ))}
          </div>
        )}
        
        {storageInfo.health.recommendations && storageInfo.health.recommendations.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4>建议</h4>
            {storageInfo.health.recommendations.map((rec, index) => (
              <Alert
                key={index}
                message={rec}
                type="info"
                size="small"
                showIcon
                style={{ marginBottom: '8px' }}
              />
            ))}
          </div>
        )}
      </Modal>
    );
  };
  
  if (loading) {
    return (
      <Card loading={true} size="small">
        <div style={{ height: '100px' }} />
      </Card>
    );
  }
  
  if (compact) {
    return (
      <div>
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
          <span>
            <DatabaseOutlined style={{ marginRight: '4px' }} />
            {stats?.total || 0} 员工
          </span>
          
          <DataSourceIndicator 
            source={storageInfo?.storageType || 'local'}
            syncStatus={storageInfo?.health?.status === 'healthy' ? 'synced' : 'pending'}
            showLabel={false}
            showTooltip={true}
            size="small"
          />
          
          {storageInfo?.usage?.isNearLimit && (
            <Tooltip title="存储空间不足">
              <WarningOutlined style={{ color: '#fa8c16' }} />
            </Tooltip>
          )}
        </Space>
        
        {renderDetailModal()}
      </div>
    );
  }
  
  return (
    <Card
      title={
        <Space>
          <DatabaseOutlined />
          存储统计
          <DataSourceIndicator 
            source={storageInfo?.storageType || 'local'}
            syncStatus={storageInfo?.health?.status === 'healthy' ? 'synced' : 'pending'}
            showLabel={true}
            showTooltip={true}
            size="small"
          />
        </Space>
      }
      extra={renderActions()}
      size="small"
    >
      {renderDataStats()}
      
      {showDetails && (
        <div style={{ marginTop: '16px' }}>
          {renderStorageUsage()}
        </div>
      )}
      
      {renderDetailModal()}
    </Card>
  );
};

/**
 * 简化的存储状态指示器
 */
export const StorageStatusIndicator = ({ 
  showLabel = true,
  showStats = false,
  onClick = null 
}) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const loadInfo = async () => {
      try {
        const storage = PersistenceManager.getStorageInfo();
        const health = await EmployeePersistence.getStorageHealth();
        const employeeStats = await EmployeePersistence.getEmployeeStatsOptimized();
        
        setStorageInfo({ ...storage, health });
        setStats(employeeStats);
      } catch (error) {
        console.error('[StorageStatusIndicator] 加载信息失败:', error);
      }
    };
    
    loadInfo();
  }, []);
  
  if (!storageInfo) {
    return <span>加载中...</span>;
  }
  
  const handleClick = () => {
    if (onClick) {
      onClick({ storageInfo, stats });
    }
  };
  
  return (
    <Space 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      <DataSourceIndicator 
        source={storageInfo.storageType}
        syncStatus={storageInfo.health.status === 'healthy' ? 'synced' : 'pending'}
        showLabel={showLabel}
        showTooltip={true}
        showCount={showStats}
        count={stats?.total || 0}
        size="small"
      />
      
      {storageInfo.usage?.isNearLimit && (
        <Tooltip title="存储空间不足">
          <WarningOutlined style={{ color: '#fa8c16' }} />
        </Tooltip>
      )}
    </Space>
  );
};

export default StorageStatsDisplay;