import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { LinkOutlined, ApiOutlined } from '@ant-design/icons';

const SimpleIntegrationDebug = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <LinkOutlined />
    },
    {
      key: 'interface-management',
      label: '接口管理',
      icon: <ApiOutlined />
    }
  ];

  const renderOverview = () => (
    <div>
      <Card title="系统集成概览">
        <p>这是一个简化的集成模块测试版本</p>
        <p>如果你能看到这个内容，说明基础组件工作正常</p>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'interface-management':
        return <div>接口管理功能开发中...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems.map(item => ({
          ...item,
          children: renderTabContent()
        }))}
        size="small"
      />
    </div>
  );
};

export default SimpleIntegrationDebug;