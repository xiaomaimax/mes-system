/**
 * 通用Tab容器组件
 * 消除15个Simple*.js组件的重复代码
 * 
 * 使用示例:
 * <TabContainer
 *   title="生产管理"
 *   icon={<ProductionOutlined />}
 *   tabs={[
 *     { key: 'overview', label: '概览', icon: <DashboardOutlined />, component: <Overview /> },
 *     { key: 'orders', label: '订单', icon: <FileTextOutlined />, component: <Orders /> }
 *   ]}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Tabs, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const TabContainer = ({
  title,
  icon,
  tabs,
  onAddClick,
  activeKey,
  onTabChange,
  loading,
  extra,
  style
}) => {
  const [currentTab, setCurrentTab] = useState(activeKey || (tabs[0]?.key || 'overview'));

  const handleTabChange = (key) => {
    setCurrentTab(key);
    onTabChange?.(key);
  };

  // 构建tab项
  const tabItems = tabs.map(tab => ({
    key: tab.key,
    label: (
      <span>
        {tab.icon && <span style={{ marginRight: 8 }}>{tab.icon}</span>}
        {tab.label}
      </span>
    ),
    children: tab.component
  }));

  // 构建标题
  const cardTitle = (
    <Space>
      {icon}
      <span>{title}</span>
    </Space>
  );

  // 构建额外操作
  const cardExtra = (
    <Space>
      {extra}
      {onAddClick && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
          新建
        </Button>
      )}
    </Space>
  );

  return (
    <Card
      title={cardTitle}
      extra={cardExtra}
      loading={loading}
      style={style}
    >
      <Tabs
        activeKey={currentTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </Card>
  );
};

TabContainer.propTypes = {
  // 标题
  title: PropTypes.string.isRequired,
  // 标题图标
  icon: PropTypes.node,
  // Tab配置数组
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      component: PropTypes.node.isRequired
    })
  ).isRequired,
  // 新建按钮点击回调
  onAddClick: PropTypes.func,
  // 当前活跃tab
  activeKey: PropTypes.string,
  // Tab切换回调
  onTabChange: PropTypes.func,
  // 加载状态
  loading: PropTypes.bool,
  // 额外操作按钮
  extra: PropTypes.node,
  // 卡片样式
  style: PropTypes.object
};

TabContainer.defaultProps = {
  icon: null,
  onAddClick: null,
  activeKey: null,
  onTabChange: null,
  loading: false,
  extra: null,
  style: {}
};

export default TabContainer;
