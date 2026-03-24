/**
 * 错误边界组件（P1-3 错误处理优化）
 * 捕获并处理 React 组件树中的错误
 */

import React, { Component } from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染显示降级 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误日志
    console.error('❌ [ErrorBoundary] 捕获到错误:', error, errorInfo);
    
    // 可以发送到错误监控服务
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  // 错误日志服务（可扩展）
  logErrorToService = (error, errorInfo) => {
    // TODO: 集成错误监控服务（如 Sentry）
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // 本地存储错误日志
    const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errorLogs.push(errorLog);
    localStorage.setItem('errorLogs', JSON.stringify(errorLogs.slice(-10))); // 只保留最近 10 条
  };

  // 重置错误状态
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 渲染自定义错误 UI
      return (
        <Result
          status="500"
          title="页面出错了"
          subTitle="抱歉，发生了一个错误。请尝试刷新页面或返回主页。"
          extra={
            <>
              <Button type="primary" onClick={this.handleReset}>
                刷新页面
              </Button>
              <Button onClick={() => window.history.back()}>
                返回上一页
              </Button>
            </>
          }
          style={{
            marginTop: '100px'
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
