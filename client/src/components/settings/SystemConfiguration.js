import { Card, Form, Input, Select, Switch, Button, Row, Col, message } from 'antd';
import { 
  DatabaseOutlined, 
  SaveOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SystemConfiguration = () => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存系统配置:', values);
      message.success('系统配置保存成功');
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  return (
    <div>
      <Card title="系统基础配置" style={{ marginBottom: '16px' }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="systemName"
                label="系统名称"
                initialValue="MES制造执行系统"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="systemVersion"
                label="系统版本"
                initialValue="v1.0.0"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="公司名称"
                initialValue="制造企业有限公司"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sessionTimeout"
                label="会话超时(分钟)"
                initialValue={30}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="systemDescription"
            label="系统描述"
            initialValue="智能制造执行系统，提供生产、质量、设备等全方位管理"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="enableAuditLog"
                label="启用审计日志"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="enableAutoBackup"
                label="启用自动备份"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="enableEmailNotification"
                label="启用邮件通知"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存配置
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemConfiguration;