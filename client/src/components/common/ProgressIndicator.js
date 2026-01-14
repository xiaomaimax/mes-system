/**
 * ProgressIndicator - 数据保存进度指示器组件
 * 
 * 功能：
 * - 显示数据保存、加载、同步等操作的进度
 * - 支持多种进度显示模式
 * - 提供操作状态的实时反馈
 * - 支持平滑动画过渡
 * - 支持操作历史记录显示
 * 
 * Requirements: 7.1, 7.2
 */

import React, { useState, useEffect } from 'react';
import { Progress, Spin, Alert, Button, Space, Typography, Card, Tooltip, Collapse, Empty } from 'antd';
import { 
  LoadingOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  HistoryOutlined,
  ClearOutlined
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * 操作类型配置
 */
const OPERATION_CONFIG = {
  save: {
    label: '保存数据',
    icon: <SaveOutlined />,
    color: '#1890ff',
    successMessage: '数据保存成功',
    errorMessage: '数据保存失败'
  },
  load: {
    label: '加载数据',
    icon: <DatabaseOutlined />,
    color: '#52c41a',
    successMessage: '数据加载成功',
    errorMessage: '数据加载失败'
  },
  sync: {
    label: '同步数据',
    icon: <SyncOutlined />,
    color: '#fa8c16',
    successMessage: '数据同步成功',
    errorMessage: '数据同步失败'
  },
  upload: {
    label: '上传数据',
    icon: <CloudUploadOutlined />,
    color: '#722ed1',
    successMessage: '数据上传成功',
    errorMessage: '数据上传失败'
  },
  batch: {
    label: '批量处理',
    icon: <LoadingOutlined />,
    color: '#13c2c2',
    successMessage: '批量处理完成',
    errorMessage: '批量处理失败'
  }
};

/**
 * 进度状态枚举
 */
const PROGRESS_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

/**
 * 基础进度指示器组件
 */
const ProgressIndicator = ({
  visible = false,
  operation = 'save',
  progress = 0,
  status = PROGRESS_STATUS.IDLE,
  message = '',
  detail = '',
  showPercentage = true,
  showIcon = true,
  showMessage = true,
  showDetail = false,
  showRetry = false,
  size = 'default',
  type = 'line', // line | circle | dashboard
  onRetry = null,
  onCancel = null,
  style = {},
  className = ''
}) => {
  const config = OPERATION_CONFIG[operation] || OPERATION_CONFIG.save;
  
  if (!visible) {
    return null;
  }
  
  // 根据状态确定进度条状态
  let progressStatus = 'active';
  let progressColor = config.color;
  
  if (status === PROGRESS_STATUS.SUCCESS) {
    progressStatus = 'success';
    progressColor = '#52c41a';
  } else if (status === PROGRESS_STATUS.ERROR) {
    progressStatus = 'exception';
    progressColor = '#ff4d4f';
  } else if (status === PROGRESS_STATUS.WARNING) {
    progressStatus = 'active';
    progressColor = '#fa8c16';
  }
  
  // 渲染图标
  const renderIcon = () => {
    if (!showIcon) return null;
    
    let icon = config.icon;
    let iconColor = config.color;
    
    if (status === PROGRESS_STATUS.SUCCESS) {
      icon = <CheckCircleOutlined />;
      iconColor = '#52c41a';
    } else if (status === PROGRESS_STATUS.ERROR) {
      icon = <CloseCircleOutlined />;
      iconColor = '#ff4d4f';
    } else if (status === PROGRESS_STATUS.WARNING) {
      icon = <ExclamationCircleOutlined />;
      iconColor = '#fa8c16';
    } else if (status === PROGRESS_STATUS.RUNNING) {
      icon = <LoadingOutlined spin />;
    }
    
    return (
      <span style={{ color: iconColor, marginRight: '8px', fontSize: '16px' }}>
        {icon}
      </span>
    );
  };
  
  // 渲染消息
  const renderMessage = () => {
    if (!showMessage) return null;
    
    let displayMessage = message;
    if (!displayMessage) {
      if (status === PROGRESS_STATUS.SUCCESS) {
        displayMessage = config.successMessage;
      } else if (status === PROGRESS_STATUS.ERROR) {
        displayMessage = config.errorMessage;
      } else {
        displayMessage = config.label;
      }
    }
    
    return (
      <Text style={{ 
        color: status === PROGRESS_STATUS.ERROR ? '#ff4d4f' : 
               status === PROGRESS_STATUS.SUCCESS ? '#52c41a' : '#666'
      }}>
        {displayMessage}
      </Text>
    );
  };
  
  // 渲详细信息
  const renderDetail = () => {
    if (!showDetail || !detail) return null;
    
    return (
      <div style={{ marginTop: '4px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {detail}
        </Text>
      </div>
    );
  };
  
  // 渲染操作按钮
  const renderActions = () => {
    if (status !== PROGRESS_STATUS.ERROR || (!showRetry && !onCancel)) {
      return null;
    }
    
    return (
      <div style={{ marginTop: '8px' }}>
        <Space size="small">
          {showRetry && onRetry && (
            <Button 
              size="small" 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={onRetry}
            >
              重试
            </Button>
          )}
          {onCancel && (
            <Button 
              size="small" 
              onClick={onCancel}
            >
              取消
            </Button>
          )}
        </Space>
      </div>
    );
  };
  
  return (
    <div 
      className={`progress-indicator ${className}`}
      style={{
        padding: size === 'small' ? '8px' : '12px',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        {renderIcon()}
        {renderMessage()}
        {showPercentage && status === PROGRESS_STATUS.RUNNING && (
          <Text style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
            {Math.round(progress)}%
          </Text>
        )}
      </div>
      
      {status === PROGRESS_STATUS.RUNNING && (
        <Progress
          percent={progress}
          status={progressStatus}
          strokeColor={progressColor}
          size={size}
          type={type}
          showInfo={false}
        />
      )}
      
      {renderDetail()}
      {renderActions()}
    </div>
  );
};

/**
 * 浮动进度提示组件 - 支持多个并发操作
 */
export const FloatingProgress = ({
  visible = false,
  operation = 'save',
  progress = 0,
  status = PROGRESS_STATUS.IDLE,
  message = '',
  position = 'topRight', // topLeft | topRight | bottomLeft | bottomRight
  autoHide = true,
  hideDelay = 3000,
  onClose = null,
  operations = null, // 支持多个操作数组
  showHistory = false,
  operationHistory = []
}) => {
  const [show, setShow] = useState(visible);
  const [adaptivePosition, setAdaptivePosition] = useState(position);
  
  useEffect(() => {
    setShow(visible);
    
    // 自动隐藏逻辑
    if (visible && autoHide && (status === PROGRESS_STATUS.SUCCESS || status === PROGRESS_STATUS.ERROR)) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, hideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [visible, status, autoHide, hideDelay, onClose]);
  
  // 智能位置自适应
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // 如果视口高度小于800px，使用底部位置
      if (viewportHeight < 800) {
        setAdaptivePosition(position.includes('top') ? position.replace('top', 'bottom') : position);
      } else {
        setAdaptivePosition(position);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);
  
  if (!show) return null;
  
  // 位置样式
  const positionStyles = {
    topLeft: { top: '20px', left: '20px' },
    topRight: { top: '20px', right: '20px' },
    bottomLeft: { bottom: '20px', left: '20px' },
    bottomRight: { bottom: '20px', right: '20px' }
  };
  
  // 渲染单个操作
  const renderSingleOperation = () => (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <ProgressIndicator
        visible={true}
        operation={operation}
        progress={progress}
        status={status}
        message={message}
        showPercentage={true}
        showIcon={true}
        showMessage={true}
        size="small"
      />
    </Card>
  );
  
  // 渲染多个操作
  const renderMultipleOperations = () => (
    <Card size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '400px' }}>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {operations && operations.map((op, index) => (
          <div key={index} style={{ marginBottom: index < operations.length - 1 ? '12px' : 0 }}>
            <ProgressIndicator
              visible={true}
              operation={op.operation}
              progress={op.progress}
              status={op.status}
              message={op.message}
              showPercentage={true}
              showIcon={true}
              showMessage={true}
              size="small"
            />
          </div>
        ))}
      </div>
    </Card>
  );
  
  // 渲染操作历史
  const renderOperationHistory = () => {
    if (!showHistory || !operationHistory || operationHistory.length === 0) {
      return null;
    }
    
    return (
      <Card 
        size="small" 
        style={{ 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
          maxWidth: '400px',
          marginTop: '12px'
        }}
        title={<><HistoryOutlined /> 操作历史</>}
      >
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {operationHistory.slice(-10).reverse().map((op, index) => (
            <div 
              key={op.id || index} 
              style={{ 
                padding: '8px',
                borderBottom: index < Math.min(10, operationHistory.length) - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {op.status === 'success' && <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />}
                  {op.status === 'error' && <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />}
                  {op.message}
                </span>
                <Tooltip title={`耗时: ${op.duration}ms`}>
                  <Text type="secondary">{op.duration}ms</Text>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[adaptivePosition],
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {operations ? renderMultipleOperations() : renderSingleOperation()}
      {renderOperationHistory()}
    </div>
  );
};

/**
 * 内联进度组件
 */
export const InlineProgress = ({
  visible = false,
  operation = 'save',
  progress = 0,
  status = PROGRESS_STATUS.IDLE,
  message = '',
  compact = false
}) => {
  if (!visible) return null;
  
  const config = OPERATION_CONFIG[operation] || OPERATION_CONFIG.save;
  
  if (compact) {
    return (
      <Space size="small" style={{ fontSize: '12px' }}>
        {status === PROGRESS_STATUS.RUNNING && <Spin size="small" />}
        {status === PROGRESS_STATUS.SUCCESS && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
        {status === PROGRESS_STATUS.ERROR && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        <Text type="secondary">{message || config.label}</Text>
        {status === PROGRESS_STATUS.RUNNING && (
          <Text type="secondary">{Math.round(progress)}%</Text>
        )}
      </Space>
    );
  }
  
  return (
    <ProgressIndicator
      visible={true}
      operation={operation}
      progress={progress}
      status={status}
      message={message}
      showPercentage={true}
      showIcon={true}
      showMessage={true}
      size="small"
      style={{ 
        backgroundColor: '#fafafa', 
        border: '1px solid #d9d9d9',
        borderRadius: '4px'
      }}
    />
  );
};

/**
 * 批量操作进度组件
 */
export const BatchProgress = ({
  visible = false,
  operation = 'batch',
  totalItems = 0,
  processedItems = 0,
  successItems = 0,
  failedItems = 0,
  currentItem = '',
  status = PROGRESS_STATUS.IDLE,
  onCancel = null
}) => {
  if (!visible) return null;
  
  const progress = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;
  
  return (
    <Card title="批量操作进度" size="small" style={{ minWidth: '400px' }}>
      <ProgressIndicator
        visible={true}
        operation={operation}
        progress={progress}
        status={status}
        message={`处理中: ${processedItems}/${totalItems}`}
        detail={currentItem}
        showPercentage={true}
        showIcon={true}
        showMessage={true}
        showDetail={true}
        onCancel={onCancel}
      />
      
      <div style={{ marginTop: '12px' }}>
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
          <Text type="success">成功: {successItems}</Text>
          <Text type="danger">失败: {failedItems}</Text>
          <Text type="secondary">剩余: {totalItems - processedItems}</Text>
        </Space>
      </div>
    </Card>
  );
};

// 导出进度状态常量
export { PROGRESS_STATUS };

export default ProgressIndicator;