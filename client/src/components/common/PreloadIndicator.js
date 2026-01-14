/**
 * PreloadIndicator - 预加载状态指示器
 * 
 * 功能：
 * - 显示数据预加载进度
 * - 提供预加载控制
 * - 显示预加载统计信息
 * 
 * Requirements: 10.5
 */

import React, { useState } from 'react';
import { Progress, Tooltip, Button, Popover, Space, Tag, Typography } from 'antd';
import { 
  CloudDownloadOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import useDataPreloader from '../../hooks/useDataPreloader';
import './PreloadIndicator.css';

const { Text } = Typography;

/**
 * 预加载状态指示器组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 是否显示指示器
 * @param {string} props.position - 显示位置 ('top-right', 'bottom-right', 'bottom-left')
 * @param {boolean} props.showProgress - 是否显示进度条
 * @param {boolean} props.showStats - 是否显示统计信息
 * @param {Function} props.onPreloadComplete - 预加载完成回调
 */
const PreloadIndicator = ({
  visible = true,
  position = 'top-right',
  showProgress = true,
  showStats = true,
  onPreloadComplete
}) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  // 必须在组件顶部调用钩子，不能在条件渲染之后
  const {
    preloadStats,
    isPreloading,
    preloadStatus,
    startPreload,
    getPreloadProgress,
    clearPreloadStatus
  } = useDataPreloader();

  const progress = getPreloadProgress();
  const { total, success, error, loading } = preloadStats;

  // 预加载完成回调
  React.useEffect(() => {
    if (progress === 100 && onPreloadComplete) {
      onPreloadComplete();
    }
  }, [progress, onPreloadComplete]);

  // 如果不显示或没有预加载任务，则不渲染
  if (!visible || total === 0) {
    return null;
  }

  // 获取状态图标
  const getStatusIcon = () => {
    if (isPreloading) {
      return <LoadingOutlined spin />;
    }
    if (error > 0) {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
    if (progress === 100) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    return <CloudDownloadOutlined />;
  };

  // 获取状态文本
  const getStatusText = () => {
    if (isPreloading) {
      return '预加载中...';
    }
    if (error > 0) {
      return `预加载完成 (${error} 个失败)`;
    }
    if (progress === 100) {
      return '预加载完成';
    }
    return '数据预加载';
  };

  // 渲染详细信息
  const renderDetails = () => (
    <div className="preload-details">
      <div className="preload-details-header">
        <Text strong>数据预加载状态</Text>
      </div>
      
      <div className="preload-details-stats">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="preload-stat-item">
            <Text>总任务数:</Text>
            <Tag>{total}</Tag>
          </div>
          <div className="preload-stat-item">
            <Text>成功:</Text>
            <Tag color="green">{success}</Tag>
          </div>
          <div className="preload-stat-item">
            <Text>失败:</Text>
            <Tag color="red">{error}</Tag>
          </div>
          <div className="preload-stat-item">
            <Text>进行中:</Text>
            <Tag color="blue">{loading}</Tag>
          </div>
        </Space>
      </div>

      {showProgress && (
        <div className="preload-details-progress">
          <Progress
            percent={progress}
            size="small"
            status={error > 0 ? 'exception' : 'normal'}
            showInfo={true}
          />
        </div>
      )}

      <div className="preload-details-actions">
        <Space>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => startPreload({ background: true })}
            loading={isPreloading}
          >
            重新预加载
          </Button>
          <Button
            size="small"
            onClick={clearPreloadStatus}
            disabled={isPreloading}
          >
            清除状态
          </Button>
        </Space>
      </div>

      {Object.keys(preloadStatus).length > 0 && (
        <div className="preload-details-tasks">
          <Text strong style={{ fontSize: '12px' }}>任务详情:</Text>
          <div className="preload-task-list">
            {Object.entries(preloadStatus).map(([task, status]) => (
              <div key={task} className="preload-task-item">
                <Text style={{ fontSize: '11px' }}>{task}</Text>
                <Tag 
                  size="small" 
                  color={
                    status === 'success' ? 'green' :
                    status === 'error' ? 'red' :
                    status === 'loading' ? 'blue' : 'default'
                  }
                >
                  {status}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`preload-indicator preload-indicator-${position}`}>
      <Popover
        content={renderDetails()}
        title={null}
        trigger="click"
        open={detailsVisible}
        onOpenChange={setDetailsVisible}
        placement={position.includes('right') ? 'leftTop' : 'rightTop'}
        overlayClassName="preload-indicator-popover"
      >
        <div className="preload-indicator-trigger">
          <Tooltip title={getStatusText()}>
            <Button
              type="text"
              size="small"
              icon={getStatusIcon()}
              className={`preload-indicator-button ${isPreloading ? 'preload-indicator-loading' : ''}`}
            >
              {showStats && (
                <span className="preload-indicator-text">
                  {success}/{total}
                </span>
              )}
            </Button>
          </Tooltip>
          
          {showProgress && progress < 100 && (
            <div className="preload-indicator-progress">
              <Progress
                percent={progress}
                size="small"
                showInfo={false}
                strokeWidth={2}
                status={error > 0 ? 'exception' : 'normal'}
              />
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default PreloadIndicator;