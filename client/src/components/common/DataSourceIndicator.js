/**
 * DataSourceIndicator - 数据来源可视化指示器组件
 * 
 * 功能：
 * - 显示数据来源（本地存储、服务器、缓存等）
 * - 提供数据状态的可视化反馈
 * - 支持不同的显示模式和样式
 * 
 * Requirements: 7.2, 7.3
 */

import React from 'react';
import { Tag, Tooltip, Badge } from 'antd';
import { 
  CloudOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

/**
 * 数据来源类型配置
 */
const DATA_SOURCE_CONFIG = {
  server: {
    label: '服务器',
    color: 'blue',
    icon: <CloudOutlined />,
    description: '数据来自服务器API'
  },
  local: {
    label: '本地存储',
    color: 'green',
    icon: <DatabaseOutlined />,
    description: '数据来自浏览器本地存储'
  },
  cache: {
    label: '缓存',
    color: 'orange',
    icon: <ThunderboltOutlined />,
    description: '数据来自内存缓存'
  },
  memory: {
    label: '内存模式',
    color: 'red',
    icon: <ExclamationCircleOutlined />,
    description: '存储不可用，使用内存模式'
  },
  syncing: {
    label: '同步中',
    color: 'processing',
    icon: <SyncOutlined spin />,
    description: '正在与服务器同步数据'
  },
  synced: {
    label: '已同步',
    color: 'success',
    icon: <CheckCircleOutlined />,
    description: '数据已与服务器同步'
  },
  pending: {
    label: '待同步',
    color: 'warning',
    icon: <ClockCircleOutlined />,
    description: '数据等待同步到服务器'
  }
};

/**
 * 数据来源指示器组件
 */
const DataSourceIndicator = ({ 
  source = 'local', 
  syncStatus = null,
  lastUpdate = null,
  count = 0,
  size = 'default',
  showLabel = true,
  showTooltip = true,
  showCount = false,
  showLastUpdate = false,
  style = {},
  className = ''
}) => {
  // 获取主要数据源配置
  const sourceConfig = DATA_SOURCE_CONFIG[source] || DATA_SOURCE_CONFIG.local;
  
  // 获取同步状态配置
  const syncConfig = syncStatus ? DATA_SOURCE_CONFIG[syncStatus] : null;
  
  // 构建标签内容
  const renderTag = (config, isSync = false) => {
    const tagProps = {
      color: config.color,
      icon: config.icon,
      style: { 
        ...style,
        fontSize: size === 'small' ? '12px' : '14px',
        ...(isSync && { marginLeft: '4px' })
      },
      className: className
    };
    
    const content = (
      <Tag {...tagProps}>
        {showLabel && config.label}
        {showCount && !isSync && count > 0 && ` (${count})`}
      </Tag>
    );
    
    if (showTooltip) {
      let tooltipTitle = config.description;
      
      if (!isSync && showLastUpdate && lastUpdate) {
        const updateTime = new Date(lastUpdate).toLocaleString('zh-CN');
        tooltipTitle += `\n最后更新: ${updateTime}`;
      }
      
      if (!isSync && showCount && count > 0) {
        tooltipTitle += `\n数据条数: ${count}`;
      }
      
      return (
        <Tooltip title={tooltipTitle} key={isSync ? 'sync' : 'source'}>
          {content}
        </Tooltip>
      );
    }
    
    return content;
  };
  
  return (
    <div className="data-source-indicator" style={{ display: 'inline-flex', alignItems: 'center' }}>
      {renderTag(sourceConfig, false)}
      {syncConfig && renderTag(syncConfig, true)}
      
      {showLastUpdate && lastUpdate && (
        <span style={{ 
          marginLeft: '8px', 
          fontSize: '12px', 
          color: '#666',
          whiteSpace: 'nowrap'
        }}>
          {new Date(lastUpdate).toLocaleString('zh-CN')}
        </span>
      )}
    </div>
  );
};

/**
 * 数据状态徽章组件
 */
export const DataStatusBadge = ({ 
  source = 'local',
  syncStatus = null,
  count = 0,
  showCount = true,
  size = 'default'
}) => {
  const sourceConfig = DATA_SOURCE_CONFIG[source] || DATA_SOURCE_CONFIG.local;
  const syncConfig = syncStatus ? DATA_SOURCE_CONFIG[syncStatus] : null;
  
  // 确定徽章状态和颜色
  let badgeStatus = 'default';
  let badgeColor = sourceConfig.color;
  
  if (syncConfig) {
    if (syncStatus === 'syncing') {
      badgeStatus = 'processing';
    } else if (syncStatus === 'synced') {
      badgeStatus = 'success';
    } else if (syncStatus === 'pending') {
      badgeStatus = 'warning';
    }
    badgeColor = syncConfig.color;
  }
  
  if (source === 'memory') {
    badgeStatus = 'error';
  }
  
  return (
    <Badge 
      count={showCount ? count : 0}
      status={badgeStatus}
      color={badgeColor}
      size={size}
      showZero={false}
      style={{ 
        backgroundColor: badgeColor === 'processing' ? '#1890ff' : undefined
      }}
    />
  );
};

/**
 * 简化的数据来源图标
 */
export const DataSourceIcon = ({ 
  source = 'local',
  syncStatus = null,
  size = 16,
  style = {}
}) => {
  const sourceConfig = DATA_SOURCE_CONFIG[source] || DATA_SOURCE_CONFIG.local;
  const syncConfig = syncStatus ? DATA_SOURCE_CONFIG[syncStatus] : null;
  
  const iconStyle = {
    fontSize: size,
    color: sourceConfig.color === 'blue' ? '#1890ff' : 
           sourceConfig.color === 'green' ? '#52c41a' :
           sourceConfig.color === 'orange' ? '#fa8c16' :
           sourceConfig.color === 'red' ? '#ff4d4f' : '#666',
    ...style
  };
  
  // 如果有同步状态，优先显示同步图标
  const displayIcon = syncConfig ? syncConfig.icon : sourceConfig.icon;
  
  return (
    <span style={iconStyle}>
      {displayIcon}
    </span>
  );
};

export default DataSourceIndicator;