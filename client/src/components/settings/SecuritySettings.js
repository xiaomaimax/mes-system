import { Card, Form, Input, Select, Switch, Button, Row, Col, message } from 'antd';
import { 
  LockOutlined, 
  SaveOutlined
} from '@ant-design/icons';

const { Option } = Select;

const SecuritySettings = () => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存安全配置:', values);
      message.success('安全配置保存成功');
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="密码策略" style={{ marginBottom: '16px' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="minPasswordLength"
                label="最小密码长度"
                initialValue={8}
              >
                <Input type="number" min={6} max={20} />
              </Form.Item>
              
              <Form.Item
                name="passwordComplexity"
                label="密码复杂度"
                initialValue="medium"
              >
                <Select>
                  <Option value="low">低 (仅数字或字母)</Option>
                  <Option value="medium">中 (数字+字母)</Option>
                  <Option value="high">高 (数字+字母+特殊字符)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="passwordExpireDays"
                label="密码有效期(天)"
                initialValue={90}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="forcePasswordChange"
                label="强制定期更换密码"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="登录安全" style={{ marginBottom: '16px' }}>
            <Form layout="vertical">
              <Form.Item
                name="maxLoginAttempts"
                label="最大登录尝试次数"
                initialValue={5}
              >
                <Input type="number" min={3} max={10} />
              </Form.Item>

              <Form.Item
                name="lockoutDuration"
                label="锁定时长(分钟)"
                initialValue={30}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="enableCaptcha"
                label="启用验证码"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="enableTwoFactor"
                label="启用双因子认证"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存安全配置
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;