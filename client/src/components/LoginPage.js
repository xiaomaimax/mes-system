import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 模拟用户数据
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      role: '超级管理员',
      department: '信息部',
      email: 'admin@mes-system.com'
    },
    {
      username: 'prod_manager',
      password: 'prod123',
      name: '张主管',
      role: '部门管理员',
      department: '生产部',
      email: 'zhang@mes-system.com'
    },
    {
      username: 'quality_user',
      password: 'quality123',
      name: '李检验员',
      role: '普通用户',
      department: '质量部',
      email: 'li@mes-system.com'
    },
    {
      username: 'tech_engineer',
      password: 'tech123',
      name: '王工程师',
      role: '技术管理员',
      department: '技术部',
      email: 'wang@mes-system.com'
    }
  ];

  const handleLogin = async (values) => {
    setLoading(true);
    
    // 模拟登录验证
    setTimeout(() => {
      const user = users.find(u => u.username === values.username && u.password === values.password);
      
      if (user) {
        // 保存用户信息到localStorage
        const userInfo = {
          ...user,
          loginTime: new Date().toISOString(),
          token: `token_${user.username}_${Date.now()}`
        };
        
        localStorage.setItem('userToken', userInfo.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        message.success(`欢迎回来，${user.name}！`);
        
        // 跳转到首页
        navigate('/dashboard');
      } else {
        message.error('用户名或密码错误，请重试');
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (user) => {
    setLoading(true);
    
    setTimeout(() => {
      const userInfo = {
        ...user,
        loginTime: new Date().toISOString(),
        token: `token_${user.username}_${Date.now()}`
      };
      
      localStorage.setItem('userToken', userInfo.token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      message.success(`欢迎，${user.name}！`);
      navigate('/dashboard');
      setLoading(false);
    }, 800);
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
              {users.map((user, index) => (
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