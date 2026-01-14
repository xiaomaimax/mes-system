/**
 * EnhancedLoading - 增强的加载状态组件
 * 
 * 功能：
 * - 提供多种加载状态显示
 * - 支持加载进度和状态信息
 * - 优化用户等待体验
 * 
 * Requirements: 7.1, 7.3
 */

import React, { useState, useEffect } from 'react';
import { Spin, Skeleton, Card, Space, Typography, Progress, Alert } from 'antd';
import { 
  LoadingOutlined, 
  DatabaseOutlined,
  CloudOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import DataSourceIndicator from './DataSourceIndicator';

const { Text } = Typography;

/**
 * 加载状态类型
 */
const LOADING_TYPES = {
  SPIN: 'spin',
  SKELETON: 'skeleton',
  PROGRESS: 'progress',
  CUSTOM: 'custom'
};

/**
 * 加载阶段配置
 */
const LOADING_PHASES = {
  initializing: {
    label: '初始化中...',
    icon: <LoadingOutlined />,
    color: '#1890ff'
  },
  loading: {
    label: '加载数据中...',
    icon: <DatabaseOutlined />,
    color: '#52c41a'
  },
  syncing: {
    label: '同步数据中...',
    icon: <SyncOutlined spin />,
    color: '#fa8c16'
  },
  processing: {
    label: '处理数据中...',
    icon: <LoadingOutlined spin />,
    color: '#722ed1'
  },
  finalizing: {
    label: '完成中...',
    icon: <LoadingOutlined />,
    color: '#13c2c2'
  }
};

/**
 * 增强的加载组件
 */
const EnhancedLoading = ({
  loading = false,
  type = LOADING_TYPES.SPIN,
  phase = 'loading',
  progress = 0,
  message = '',
  detail = '',
  dataSource = null,
  showDataSource = false,
  showProgress = false,
  showSkeleton = false,
  skeletonRows = 3,
  size = 'default',
  tip = '',
  delay = 0,
  minDuration = 0,
  style = {},
  className = '',
  children = null
}) => {
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  // 处理延迟显示和最小持续时间
  useEffect(() => {
    let delayTimer = null;
    let minTimer = null;
    
    if (loading) {
      if (delay > 0) {
        delayTimer = setTimeout(() => {
          setVisible(true);
          setStartTime(Date.now());
        }, delay);
      } else {
        setVisible(true);
        setStartTime(Date.now());
      }
    } else {
      if (visible && minDuration > 0 && startTime) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minDuration) {
          minTimer = setTimeout(() => {
            setVisible(false);
            setStartTime(null);
          }, minDuration - elapsed);
        } else {
          setVisible(false);
          setStartTime(null);
        }
      } else {
        setVisible(false);
        setStartTime(null);
      }
    }
    
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (minTimer) clearTimeout(minTimer);
    };
  }, [loading, delay, minDuration, visible, startTime]);
  
  // 如果不显示加载状态，直接返回子组件
  if (!visible) {
    return children || null;
  }
  
  const phaseConfig = LOADING_PHASES[phase] || LOADING_PHASES.loading;
  const displayMessage = message || tip || phaseConfig.label;
  
  // 渲染数据源指示器
  const renderDataSource = () => {
    if (!showDataSource || !dataSource) return null;
    
    return (
      <div style={{ marginTop: '8px' }}>
        <DataSourceIndicator 
          source={dataSource}
          showLabel={true}
          showTooltip={true}
          size="small"
        />
      </div>
    );
  };
  
  // 渲染进度信息
  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div style={{ marginTop: '12px', minWidth: '200px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {detail || '处理中...'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {Math.round(progress)}%
          </Text>
        </div>
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor={phaseConfig.color}
          showInfo={false}
        />
      </div>
    );
  };
  
  // 渲染骨架屏
  const renderSkeleton = () => {
    if (!showSkeleton) return null;
    
    return (
      <div style={{ marginTop: '16px' }}>
        <Skeleton 
          active 
          paragraph={{ rows: skeletonRows }}
          title={{ width: '60%' }}
        />
      </div>
    );
  };
  
  // 根据类型渲染不同的加载组件
  const renderLoadingContent = () => {
    switch (type) {
      case LOADING_TYPES.SKELETON:
        return (
          <div style={style} className={className}>
            <Skeleton 
              active 
              paragraph={{ rows: skeletonRows }}
              title={{ width: '60%' }}
            />
          </div>
        );
        
      case LOADING_TYPES.PROGRESS:
        return (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '20px',
              ...style 
            }} 
            className={className}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ fontSize: '16px', color: phaseConfig.color }}>
                {phaseConfig.icon}
              </div>
              
              <Text>{displayMessage}</Text>
              
              {renderProgress()}
              {renderDataSource()}
            </Space>
          </div>
        );
        
      case LOADING_TYPES.CUSTOM:
        return (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '20px',
              ...style 
            }} 
            className={className}
          >
            <Space direction="vertical" size="middle">
              <div style={{ fontSize: '24px', color: phaseConfig.color }}>
                {phaseConfig.icon}
              </div>
              
              <div>
                <Text style={{ fontSize: '16px' }}>{displayMessage}</Text>
                {detail && (
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {detail}
                    </Text>
                  </div>
                )}
              </div>
              
              {renderProgress()}
              {renderDataSource()}
              {renderSkeleton()}
            </Space>
          </div>
        );
        
      default: // LOADING_TYPES.SPIN
        return (
          <Spin 
            spinning={true}
            tip={displayMessage}
            size={size}
            indicator={phaseConfig.icon}
            style={style}
            className={className}
          >
            <div style={{ minHeight: children ? 'auto' : '100px' }}>
              {children}
              {renderDataSource()}
              {renderProgress()}
              {renderSkeleton()}
            </div>
          </Spin>
        );
    }
  };
  
  return renderLoadingContent();
};

/**
 * 数据加载包装器组件
 */
export const DataLoadingWrapper = ({
  loading = false,
  error = null,
  empty = false,
  emptyText = '暂无数据',
  errorText = '加载失败',
  retryText = '重试',
  onRetry = null,
  dataSource = 'local',
  showDataSource = true,
  loadingProps = {},
  children
}) => {
  // 错误状态
  if (error) {
    return (
      <Alert
        message={errorText}
        description={error.message || error}
        type="error"
        showIcon
        action={onRetry && (
          <button onClick={onRetry} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1890ff', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            {retryText}
          </button>
        )}
      />
    );
  }
  
  // 加载状态
  if (loading) {
    return (
      <EnhancedLoading
        loading={true}
        dataSource={dataSource}
        showDataSource={showDataSource}
        {...loadingProps}
      >
        {children}
      </EnhancedLoading>
    );
  }
  
  // 空数据状态
  if (empty) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        <DatabaseOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
        <div>{emptyText}</div>
        {showDataSource && (
          <div style={{ marginTop: '8px' }}>
            <DataSourceIndicator 
              source={dataSource}
              showLabel={true}
              showTooltip={true}
              size="small"
            />
          </div>
        )}
      </div>
    );
  }
  
  // 正常状态
  return children;
};

/**
 * 表格加载状态组件
 */
export const TableLoadingState = ({
  loading = false,
  columns = [],
  rowCount = 5,
  showHeader = true
}) => {
  if (!loading) return null;
  
  return (
    <div>
      {showHeader && (
        <div style={{ 
          display: 'flex', 
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          {columns.map((col, index) => (
            <div 
              key={index}
              style={{ 
                flex: col.width ? `0 0 ${col.width}px` : 1,
                marginRight: index < columns.length - 1 ? '16px' : 0
              }}
            >
              <Skeleton.Input 
                active 
                size="small" 
                style={{ width: '80%', height: '14px' }} 
              />
            </div>
          ))}
        </div>
      )}
      
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          style={{ 
            display: 'flex', 
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          {columns.map((col, colIndex) => (
            <div 
              key={colIndex}
              style={{ 
                flex: col.width ? `0 0 ${col.width}px` : 1,
                marginRight: colIndex < columns.length - 1 ? '16px' : 0
              }}
            >
              <Skeleton.Input 
                active 
                size="small" 
                style={{ 
                  width: Math.random() * 40 + 60 + '%', 
                  height: '14px' 
                }} 
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// 导出加载类型常量
export { LOADING_TYPES };

export default EnhancedLoading;