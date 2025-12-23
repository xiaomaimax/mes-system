import { useState } from 'react';
import { Card, Form, Input, Button, Switch, Row, Col, message, Tabs, Space, Alert, Divider, Tag, Modal } from 'antd';
import { 
  MessageOutlined, 
  WechatOutlined, 
  MailOutlined, 
  ExperimentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;

const MessagePushSettings = () => {
  const [form] = Form.useForm();
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testType, setTestType] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    wechat: 'unknown',
    email: 'unknown'
  });

  // 企业微信配置
  const [wechatConfig, setWechatConfig] = useState({
    enabled: true,
    corpId: 'ww1234567890abcdef',
    corpSecret: 'your_corp_secret_here',
    agentId: '1000001',
    webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key',
    proxyUrl: '',
    timeout: 30
  });

  // 邮件配置
  const [emailConfig, setEmailConfig] = useState({
    enabled: true,
    smtpHost: 'smtp.163.com',
    smtpPort: 465,
    username: 'mes_system@163.com',
    password: 'your_email_password',
    fromName: 'MES制造执行系统',
    ssl: true,
    timeout: 30
  });

  // 测试企业微信连接
  const testWechatConnection = async () => {
    setTestLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟测试结果
      const success = Math.random() > 0.3;
      if (success) {
        setConnectionStatus(prev => ({ ...prev, wechat: 'success' }));
        message.success('企业微信连接测试成功！');
      } else {
        setConnectionStatus(prev => ({ ...prev, wechat: 'error' }));
        message.error('企业微信连接测试失败，请检查配置参数');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, wechat: 'error' }));
      message.error('测试过程中发生错误');
    } finally {
      setTestLoading(false);
    }
  };

  // 测试邮件连接
  const testEmailConnection = async () => {
    setTestLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟测试结果
      const success = Math.random() > 0.3;
      if (success) {
        setConnectionStatus(prev => ({ ...prev, email: 'success' }));
        message.success('邮件服务连接测试成功！');
      } else {
        setConnectionStatus(prev => ({ ...prev, email: 'error' }));
        message.error('邮件服务连接测试失败，请检查SMTP配置');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, email: 'error' }));
      message.error('测试过程中发生错误');
    } finally {
      setTestLoading(false);
    }
  };

  // 发送测试消息
  const sendTestMessage = async (values) => {
    setTestLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.2;
      if (success) {
        message.success(`${testType === 'wechat' ? '企业微信' : '邮件'}测试消息发送成功！`);
        setTestModalVisible(false);
      } else {
        message.error('测试消息发送失败，请检查配置');
      }
    } catch (error) {
      message.error('发送测试消息时发生错误');
    } finally {
      setTestLoading(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('消息推送配置保存成功！');
    } catch (error) {
      message.error('保存配置失败');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'success':
        return <Tag color="success" icon={<CheckCircleOutlined />}>连接正常</Tag>;
      case 'error':
        return <Tag color="error" icon={<ExclamationCircleOutlined />}>连接失败</Tag>;
      default:
        return <Tag color="default">未测试</Tag>;
    }
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <MessageOutlined />
            消息推送设置
          </Space>
        }
        extra={
          <Button type="primary" icon={<SettingOutlined />} onClick={handleSave}>
            保存配置
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="wechat">
            <TabPane 
              tab={
                <Space>
                  <WechatOutlined />
                  企业微信配置
                  {getStatusTag(connectionStatus.wechat)}
                </Space>
              } 
              key="wechat"
            >
              <Alert
                message="企业微信推送配置"
                description="配置企业微信机器人或应用推送参数，用于发送系统通知、报警信息等。"
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="启用企业微信推送"
                    name="wechatEnabled"
                    valuePropName="checked"
                    initialValue={wechatConfig.enabled}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="连接超时(秒)"
                    name="wechatTimeout"
                    initialValue={wechatConfig.timeout}
                  >
                    <Input type="number" min={10} max={120} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="企业ID (CorpId)"
                    name="corpId"
                    rules={[{ required: true, message: '请输入企业ID' }]}
                    initialValue={wechatConfig.corpId}
                  >
                    <Input placeholder="请输入企业微信CorpId" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="应用Secret"
                    name="corpSecret"
                    rules={[{ required: true, message: '请输入应用Secret' }]}
                    initialValue={wechatConfig.corpSecret}
                  >
                    <Input.Password placeholder="请输入应用Secret" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="应用ID (AgentId)"
                    name="agentId"
                    rules={[{ required: true, message: '请输入应用ID' }]}
                    initialValue={wechatConfig.agentId}
                  >
                    <Input placeholder="请输入应用AgentId" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="代理服务器"
                    name="proxyUrl"
                    initialValue={wechatConfig.proxyUrl}
                  >
                    <Input placeholder="可选，如需要请输入代理地址" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Webhook地址"
                name="webhookUrl"
                initialValue={wechatConfig.webhookUrl}
              >
                <Input placeholder="企业微信机器人Webhook地址（可选）" />
              </Form.Item>

              <Divider />

              <Space>
                <Button 
                  type="primary" 
                  icon={<ExperimentOutlined />}
                  loading={testLoading}
                  onClick={testWechatConnection}
                >
                  测试连接
                </Button>
                <Button 
                  icon={<SendOutlined />}
                  onClick={() => {
                    setTestType('wechat');
                    setTestModalVisible(true);
                  }}
                >
                  发送测试消息
                </Button>
              </Space>
            </TabPane>

            <TabPane 
              tab={
                <Space>
                  <MailOutlined />
                  邮件配置
                  {getStatusTag(connectionStatus.email)}
                </Space>
              } 
              key="email"
            >
              <Alert
                message="邮件服务配置"
                description="配置SMTP邮件服务参数，用于发送系统通知、报表、异常报警等邮件。"
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="启用邮件推送"
                    name="emailEnabled"
                    valuePropName="checked"
                    initialValue={emailConfig.enabled}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="连接超时(秒)"
                    name="emailTimeout"
                    initialValue={emailConfig.timeout}
                  >
                    <Input type="number" min={10} max={120} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="SMTP服务器"
                    name="smtpHost"
                    rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
                    initialValue={emailConfig.smtpHost}
                  >
                    <Input placeholder="如: smtp.163.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="SMTP端口"
                    name="smtpPort"
                    rules={[{ required: true, message: '请输入SMTP端口' }]}
                    initialValue={emailConfig.smtpPort}
                  >
                    <Input type="number" placeholder="如: 465 (SSL) 或 587 (TLS)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="邮箱账号"
                    name="emailUsername"
                    rules={[
                      { required: true, message: '请输入邮箱账号' },
                      { type: 'email', message: '请输入正确的邮箱格式' }
                    ]}
                    initialValue={emailConfig.username}
                  >
                    <Input placeholder="发送邮件的邮箱账号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="邮箱密码/授权码"
                    name="emailPassword"
                    rules={[{ required: true, message: '请输入邮箱密码或授权码' }]}
                    initialValue={emailConfig.password}
                  >
                    <Input.Password placeholder="邮箱密码或第三方授权码" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="发件人名称"
                    name="fromName"
                    initialValue={emailConfig.fromName}
                  >
                    <Input placeholder="邮件显示的发件人名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="启用SSL/TLS"
                    name="emailSsl"
                    valuePropName="checked"
                    initialValue={emailConfig.ssl}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Space>
                <Button 
                  type="primary" 
                  icon={<ExperimentOutlined />}
                  loading={testLoading}
                  onClick={testEmailConnection}
                >
                  测试连接
                </Button>
                <Button 
                  icon={<SendOutlined />}
                  onClick={() => {
                    setTestType('email');
                    setTestModalVisible(true);
                  }}
                >
                  发送测试邮件
                </Button>
              </Space>
            </TabPane>
          </Tabs>
        </Form>
      </Card>

      {/* 测试消息发送模态框 */}
      <Modal
        title={`发送${testType === 'wechat' ? '企业微信' : '邮件'}测试消息`}
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form onFinish={sendTestMessage} layout="vertical">
          {testType === 'email' && (
            <Form.Item
              label="收件人邮箱"
              name="recipient"
              rules={[
                { required: true, message: '请输入收件人邮箱' },
                { type: 'email', message: '请输入正确的邮箱格式' }
              ]}
            >
              <Input placeholder="请输入测试邮件的收件人邮箱" />
            </Form.Item>
          )}

          <Form.Item
            label="消息标题"
            name="title"
            rules={[{ required: true, message: '请输入消息标题' }]}
            initialValue="MES系统测试消息"
          >
            <Input placeholder="请输入测试消息标题" />
          </Form.Item>

          <Form.Item
            label="消息内容"
            name="content"
            rules={[{ required: true, message: '请输入消息内容' }]}
            initialValue={`这是一条来自MES制造执行系统的测试消息。\n\n发送时间: ${new Date().toLocaleString()}\n系统版本: v1.0.0\n\n如果您收到此消息，说明${testType === 'wechat' ? '企业微信' : '邮件'}推送配置正常。`}
          >
            <TextArea rows={6} placeholder="请输入测试消息内容" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setTestModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={testLoading}>
                发送测试消息
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagePushSettings;