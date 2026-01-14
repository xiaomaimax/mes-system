import React, { useState } from 'react';
import { Card, Input, Button, message, Space, Alert } from 'antd';

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
import { KeyOutlined } from '@ant-design/icons';

const TokenSetter = () => {
  const [token, setToken] = useState('');
  const [currentToken, setCurrentToken] = useState(localStorage.getItem('token') || '');

  const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiLCJtYW5hZ2UiXSwiaWF0IjoxNzY3MTQ3ODk5LCJleHAiOjE3NjcyMzQyOTksImF1ZCI6Im1lcy1jbGllbnQiLCJpc3MiOiJtZXMtc3lzdGVtIn0.7duxEfXm0kFrxo-AzfvFCsoQdYhQ5-YQzWtEFpvINwU';

  const handleSetToken = () => {
    const tokenToSet = token || defaultToken;
    localStorage.setItem('token', tokenToSet);
    setCurrentToken(tokenToSet);
    safeMessage.success('Token已更新，请刷新页面');
  };

  const handleClearToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setCurrentToken('');
    message.info('Token已清除');
  };

  const handleUseDefault = () => {
    setToken(defaultToken);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <KeyOutlined />
            Token管理 (临时调试工具)
          </Space>
        }
      >
        <Alert
          message="认证Token过期"
          description="由于认证token已过期，需要设置新的token才能访问API。这是一个临时的调试工具。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <h4>当前Token状态:</h4>
          <Input.TextArea
            value={currentToken}
            readOnly
            rows={3}
            placeholder="未设置token"
            style={{ marginBottom: 8 }}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {currentToken ? '✅ Token已设置' : '❌ 未设置Token'}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>设置新Token:</h4>
          <Input.TextArea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            placeholder="请输入新的token，或点击"使用默认Token"按钮"
            style={{ marginBottom: 8 }}
          />
        </div>

        <Space>
          <Button type="primary" onClick={handleSetToken}>
            设置Token
          </Button>
          <Button onClick={handleUseDefault}>
            使用默认Token
          </Button>
          <Button danger onClick={handleClearToken}>
            清除Token
          </Button>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </Space>

        <Alert
          message="使用说明"
          description={
            <div>
              <p>1. 点击"使用默认Token"按钮自动填入有效的token</p>
              <p>2. 点击"设置Token"保存token到浏览器</p>
              <p>3. 点击"刷新页面"重新加载应用</p>
              <p>4. 现在可以正常访问质量管理模块了</p>
            </div>
          }
          type="info"
          style={{ marginTop: 16 }}
        />
      </Card>
    </div>
  );
};

export default TokenSetter;