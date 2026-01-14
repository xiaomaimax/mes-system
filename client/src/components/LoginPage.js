import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return message.success(content, duration);
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
        return message.error(content, duration);
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
        return message.warning(content, duration);
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
        return message.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * LoginPage Component
 * 
 * Enhanced login page that uses the improved AuthContext.
 * Provides user authentication with proper error handling and loading states.
 * 
 * Requirements: 1.1, 1.2, 4.4, 5.3
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // 快速登录用户列表
  const quickLoginUsers = [
    { username: 'admin', password: 'admin123', name: '系统管理员' },
    { username: 'prod_manager', password: 'prod123', name: '生产主管' },
    { username: 'quality_user', password: 'quality123', name: '质量检验员' },
    { username: 'tech_engineer', password: 'tech123', name: '技术工程师' }
  ];

  /**
   * Handle login with form submission
   * Requirement 1.2: Establish user context before rendering authenticated components
   */
  const handleLogin = async (values) => {
    setLoading(true);
    
    try {
      // Use enhanced login from AuthContext
      const result = await login(values.username, values.password);

      if (result.success) {
        // 登录成功，立即导航
        setLoading(false);
        navigate('/dashboard', { replace: true });
      } else {
        safeMessage.error(result.message || '登录失败，请重试');
        setLoading(false);
      }
    } catch (error) {
      console.error('[LoginPage] Login error:', error);
      safeMessage.error('登录失败，请检查后端服务是否正常');
      setLoading(false);
    }
  };

  /**
   * Handle quick login
   * Requirement 1.2: Establish user context before rendering authenticated components
   */
  const handleQuickLogin = async (user) => {
    setLoading(true);
    
    try {
      // Use enhanced login from AuthContext
      const result = await login(user.username, user.password);

      if (result.success) {
        // 登录成功，立即导航
        setLoading(false);
        navigate('/dashboard', { replace: true });
      } else {
        safeMessage.error(result.message || '登录失败，请重试');
        setLoading(false);
      }
    } catch (error) {
      console.error('[LoginPage] Quick login error:', error);
      safeMessage.error('登录失败，请检查后端服务是否正常');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* 系统标题 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
            MES 制造执行系统
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Manufacturing Execution System - 智能制造，数字化管理
          </Text>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          {/* 登录表单 */}
          <Card 
            style={{ 
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '12px'
            }}
            title={
              <div style={{ textAlign: 'center' }}>
                <LoginOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
                <span style={{ fontSize: '18px' }}>用户登录</span>
              </div>
            }
          >
            <Form
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  style={{ width: '100%', height: '44px' }}
                >
                  登录系统
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                忘记密码？请联系系统管理员
              </Text>
            </div>
          </Card>

          {/* 快速登录 - 更紧凑的设计 */}
          <Card 
            style={{ 
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '12px'
            }}
            title={
              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                🚀 <span style={{ color: '#1890ff' }}>快速登录体验</span>
              </div>
            }
            size="small"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '6px',
              marginBottom: '12px'
            }}>
              {quickLoginUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => !loading && handleQuickLogin(user)}
                  style={{ 
                    height: '44px',
                    padding: '4px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    lineHeight: '1.1',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#fafafa',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#e6f7ff';
                      e.currentTarget.style.borderColor = '#1890ff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(24, 144, 255, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#fafafa';
                      e.currentTarget.style.borderColor = '#d9d9d9';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '1px' }}>
                    {user.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '9px' }}>
                    {user.department}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              fontSize: '9px', 
              color: '#999', 
              textAlign: 'center',
              lineHeight: '1.2',
              padding: '6px 0'
            }}>
              <div style={{ marginBottom: '2px', fontWeight: '500' }}>
                演示账号密码
              </div>
              <div>admin/admin123 • prod_manager/prod123</div>
              <div>quality_user/quality123 • tech_engineer/tech123</div>
            </div>
          </Card>
        </div>

        {/* 底部信息 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px'
        }}>
          <div>MES制造执行系统 v1.0.0</div>
          <div style={{ marginTop: '4px' }}>
            技术支持：系统管理员 | 联系邮箱：support@mes-system.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;