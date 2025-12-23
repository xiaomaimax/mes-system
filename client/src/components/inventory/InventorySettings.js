import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Space, Divider, Row, Col, Select, message, Tabs } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, BellOutlined, DatabaseOutlined, SecurityScanOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InventorySettings = () => {
  const [form] = Form.useForm();
  const [alertForm] = Form.useForm();
  const [systemForm] = Form.useForm();

  const [settings, setSettings] = useState({
    // 基础设置
    defaultWarehouse: 'main',
    autoApproval: false,
    batchTracking: true,
    serialTracking: false,
    locationTracking: true,
    
    // 预警设置
    lowStockAlert: true,
    highStockAlert: false,
    expiryAlert: true,
    alertDays: 30,
    alertEmail: 'admin@company.com',
    
    // 系统设置
    autoBackup: true,
    backupInterval: 24,
    dataRetention: 365,
    auditLog: true
  });

  const handleBasicSave = (values) => {
    setSettings({ ...settings, ...values });
    message.success('基础设置保存成功');
  };

  const handleAlertSave = (values) => {
    setSettings({ ...settings, ...values });
    message.success('预警设置保存成功');
  };

  const handleSystemSave = (values) => {
    setSettings({ ...settings, ...values });
    message.success('系统设置保存成功');
  };

  const resetSettings = () => {
    form.resetFields();
    alertForm.resetFields();
    systemForm.resetFields();
    message.info('设置已重置');
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基础设置',
      icon: <DatabaseOutlined />,
      children: (
        <Card size="small">
          <Form
            form={form}
            layout="vertical"
            initialValues={settings}
            onFinish={handleBasicSave}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="defaultWarehouse"
                  label="默认仓库"
                  tooltip="新建出入库单时的默认仓库"
                >
                  <Select>
                    <Option value="main">主仓库A</Option>
                    <Option value="workshop">车间仓库B</Option>
                    <Option value="maintenance">维修仓库C</Option>
                    <Option value="finished">成品仓库D</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defaultUnit"
                  label="默认单位"
                  tooltip="新建物料时的默认计量单位"
                >
                  <Select>
                    <Option value="pcs">个</Option>
                    <Option value="kg">千克</Option>
                    <Option value="m">米</Option>
                    <Option value="set">套</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">业务流程设置</Divider>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="autoApproval"
                  label="自动审批"
                  valuePropName="checked"
                  tooltip="小额出入库单是否自动审批"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="batchTracking"
                  label="批次跟踪"
                  valuePropName="checked"
                  tooltip="是否启用批次号跟踪功能"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="serialTracking"
                  label="序列号跟踪"
                  valuePropName="checked"
                  tooltip="是否启用序列号跟踪功能"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="locationTracking"
                  label="库位跟踪"
                  valuePropName="checked"
                  tooltip="是否启用精确库位跟踪"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="qualityControl"
                  label="质量控制"
                  valuePropName="checked"
                  tooltip="入库时是否需要质量检验"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="costTracking"
                  label="成本跟踪"
                  valuePropName="checked"
                  tooltip="是否启用移动平均成本法"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">审批设置</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="approvalAmount"
                  label="审批金额阈值"
                  tooltip="超过此金额的出入库单需要审批"
                >
                  <InputNumber
                    min={0}
                    max={1000000}
                    step={1000}
                    formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/¥\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="approvalQuantity"
                  label="审批数量阈值"
                  tooltip="超过此数量的出库单需要审批"
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'alert',
      label: '预警设置',
      icon: <BellOutlined />,
      children: (
        <Card size="small">
          <Form
            form={alertForm}
            layout="vertical"
            initialValues={settings}
            onFinish={handleAlertSave}
          >
            <Divider orientation="left">库存预警</Divider>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="lowStockAlert"
                  label="低库存预警"
                  valuePropName="checked"
                  tooltip="当库存低于最低库存时发送预警"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="highStockAlert"
                  label="高库存预警"
                  valuePropName="checked"
                  tooltip="当库存高于最高库存时发送预警"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="zeroStockAlert"
                  label="零库存预警"
                  valuePropName="checked"
                  tooltip="当库存为零时发送预警"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="expiryAlert"
                  label="到期预警"
                  valuePropName="checked"
                  tooltip="物料即将到期时发送预警"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="alertDays"
                  label="预警天数"
                  tooltip="提前多少天发送到期预警"
                >
                  <InputNumber
                    min={1}
                    max={365}
                    addonAfter="天"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="slowMovingAlert"
                  label="呆滞预警"
                  valuePropName="checked"
                  tooltip="长期无出库的物料预警"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">通知设置</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="alertEmail"
                  label="预警邮箱"
                  tooltip="接收预警通知的邮箱地址"
                  rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                >
                  <Input placeholder="请输入邮箱地址" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="alertPhone"
                  label="预警手机"
                  tooltip="接收预警短信的手机号码"
                >
                  <Input placeholder="请输入手机号码" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="emailAlert"
                  label="邮件通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="smsAlert"
                  label="短信通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="systemAlert"
                  label="系统通知"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => alertForm.resetFields()}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'system',
      label: '系统设置',
      icon: <SecurityScanOutlined />,
      children: (
        <Card size="small">
          <Form
            form={systemForm}
            layout="vertical"
            initialValues={settings}
            onFinish={handleSystemSave}
          >
            <Divider orientation="left">数据管理</Divider>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="autoBackup"
                  label="自动备份"
                  valuePropName="checked"
                  tooltip="是否启用自动数据备份"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="backupInterval"
                  label="备份间隔"
                  tooltip="自动备份的时间间隔"
                >
                  <InputNumber
                    min={1}
                    max={168}
                    addonAfter="小时"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dataRetention"
                  label="数据保留期"
                  tooltip="历史数据保留天数"
                >
                  <InputNumber
                    min={30}
                    max={3650}
                    addonAfter="天"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">安全设置</Divider>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="auditLog"
                  label="审计日志"
                  valuePropName="checked"
                  tooltip="是否记录所有操作日志"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dataEncryption"
                  label="数据加密"
                  valuePropName="checked"
                  tooltip="是否启用敏感数据加密"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="accessControl"
                  label="访问控制"
                  valuePropName="checked"
                  tooltip="是否启用严格的访问控制"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">性能优化</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="cacheSize"
                  label="缓存大小"
                  tooltip="系统缓存大小设置"
                >
                  <Select>
                    <Option value="small">小 (128MB)</Option>
                    <Option value="medium">中 (256MB)</Option>
                    <Option value="large">大 (512MB)</Option>
                    <Option value="xlarge">超大 (1GB)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="queryTimeout"
                  label="查询超时"
                  tooltip="数据库查询超时时间"
                >
                  <InputNumber
                    min={5}
                    max={300}
                    addonAfter="秒"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="systemNotes"
              label="系统备注"
              tooltip="系统配置相关的备注信息"
            >
              <TextArea
                rows={4}
                placeholder="请输入系统配置备注"
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => systemForm.resetFields()}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0 }}>库存系统设置</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            配置库存管理系统的各项参数和业务规则
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={resetSettings}>
            重置所有设置
          </Button>
          <Button type="primary" icon={<SettingOutlined />}>
            导入配置
          </Button>
        </Space>
      </div>

      {/* 设置选项卡 */}
      <Tabs
        items={tabItems}
        size="small"
        tabPosition="top"
      />

      {/* 设置说明 */}
      <Card title="设置说明" size="small" style={{ marginTop: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <h4>基础设置：</h4>
            <ul style={{ fontSize: '12px', color: '#666' }}>
              <li>配置系统默认参数和业务流程</li>
              <li>设置审批阈值和跟踪规则</li>
              <li>启用或禁用特定功能模块</li>
            </ul>
          </Col>
          <Col span={8}>
            <h4>预警设置：</h4>
            <ul style={{ fontSize: '12px', color: '#666' }}>
              <li>配置各类库存预警规则</li>
              <li>设置通知方式和接收人</li>
              <li>调整预警触发条件</li>
            </ul>
          </Col>
          <Col span={8}>
            <h4>系统设置：</h4>
            <ul style={{ fontSize: '12px', color: '#666' }}>
              <li>配置数据备份和安全策略</li>
              <li>优化系统性能参数</li>
              <li>管理审计日志和访问控制</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InventorySettings;