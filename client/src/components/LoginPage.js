import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const safeMessage = {
  success: (content) => { try { message.success(content); } catch (e) { console.log('✅', content); } },
  error: (content) => { try { message.error(content); } catch (e) { console.error('❌', content); } }
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const quickLoginUsers = [
    { username: 'admin', password: 'admin123', name: '系统管理员', department: 'IT' },
    { username: 'prod_manager', password: 'prod123', name: '生产主管', department: '生产部' },
    { username: 'quality_user', password: 'quality123', name: '质量检验员', department: '质量部' },
    { username: 'tech_engineer', password: 'tech123', name: '技术工程师', department: '技术部' }
  ];

  const handleLogin = async (values) => {
    console.log('[LoginPage] 开始登录:', values.username);
    setLoading(true);
    
    try {
      const result = await login(values.username, values.password);
      console.log('[LoginPage] 登录结果:', result);

      if (result && result.success) {
        console.log('[LoginPage] 登录成功，准备跳转');
        setLoading(false);
        navigate('/dashboard', { replace: true });
      } else {
        console.log('[LoginPage] 登录失败:', result?.message);
        safeMessage.error(result?.message || '登录失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('[LoginPage] 登录异常:', error);
      safeMessage.error('登录失败，请检查后端服务');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user) => {
    console.log('[LoginPage] 快速登录:', user.username);
    setLoading(true);
    
    try {
      const result = await login(user.username, user.password);
      console.log('[LoginPage] 快速登录结果:', result);

      if (result && result.success) {
        setLoading(false);
        navigate('/dashboard', { replace: true });
      } else {
        safeMessage.error(result?.message || '登录失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('[LoginPage] 快速登录异常:', error);
      safeMessage.error('登录失败');
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
            MES 制造执行系统
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
            Manufacturing Execution System
          </Text>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <Card 
            style={{ width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: '12px' }}
            title={
              <div style={{ textAlign: 'center' }}>
                <LoginOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
                <span style={{ fontSize: '18px' }}>用户登录</span>
              </div>
            }
          >
            <Form name="login" onFinish={handleLogin} autoComplete="off" size="large">
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '44px' }}>
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

          <Card 
            style={{ width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', borderRadius: '12px' }}
            title={<div style={{ textAlign: 'center', fontSize: '14px' }}>🚀 快速登录</div>}
            size="small"
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {quickLoginUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => !loading && handleQuickLogin(user)}
                  style={{ 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: '#fafafa',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{user.name}</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>{user.department}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
              admin/admin123 • prod_manager/prod123
            </div>
          </Card>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          <div>MES制造执行系统 v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
