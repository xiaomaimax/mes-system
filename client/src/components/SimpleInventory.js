// MIGRATION STATUS: Partially migrated - mockData imports removed, DataService imported
// TODO: Replace mockData usage with actual DataService calls

import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Badge, List, Avatar, Alert, Timeline, Divider } from 'antd';
import { InboxOutlined, AlertOutlined, ShopOutlined, TransactionOutlined, DatabaseOutlined, BarChartOutlined, SettingOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined, ClockCircleOutlined, UserOutlined, TruckOutlined, SafetyOutlined } from '@ant-design/icons';

// 导入子组件
import SparePartsAlert from './inventory/SparePartsAlert';
import ExternalSpareParts from './inventory/ExternalSpareParts';
import SparePartsFlow from './inventory/SparePartsFlow';
import InventoryMasterData from './inventory/InventoryMasterData';
import InventoryInOut from './inventory/InventoryInOut';
import InventoryTransfer from './inventory/InventoryTransfer';
import InventoryCount from './inventory/InventoryCount';
import InventoryReports from './inventory/InventoryReports';
import InventorySettings from './inventory/InventorySettings';

import { DataService } from '../services/DataService';
import { useDataService } from '../hooks/useDataService';
const SimpleInventory = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <InboxOutlined />
    },
    {
      key: 'master-data',
      label: '主数据',
      icon: <DatabaseOutlined />
    },
    {
      key: 'in-out',
      label: '出入库',
      icon: <TruckOutlined />
    },
    {
      key: 'transfer',
      label: '调拨',
      icon: <TransactionOutlined />
    },
    {
      key: 'count',
      label: '盘点',
      icon: <SafetyOutlined />
    },
    {
      key: 'spare-parts-alert',
      label: '备件预警',
      icon: <AlertOutlined />
    },
    {
      key: 'external-spare-parts',
      label: '外部备件',
      icon: <ShopOutlined />
    },
    {
      key: 'spare-parts-flow',
      label: '备件流水',
      icon: <TransactionOutlined />
    },
    {
      key: 'reports',
      label: '报表',
      icon: <BarChartOutlined />
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'master-data':
        return <InventoryMasterData />;
      case 'in-out':
        return <InventoryInOut />;
      case 'transfer':
        return <InventoryTransfer />;
      case 'count':
        return <InventoryCount />;
      case 'spare-parts-alert':
        return <SparePartsAlert />;
      case 'external-spare-parts':
        return <ExternalSpareParts />;
      case 'spare-parts-flow':
        return <SparePartsFlow />;
      case 'reports':
        return <InventoryReports />;
      case 'settings':
        return <InventorySettings />;
      case 'overview':
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div>
      {/* 页面标题和快速操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>库存管理概览</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            全面管理库存物料，优化库存结构，降低库存成本
          </p>
        </div>
        <Space size="large">
          <Button type="primary" size="large" onClick={() => setActiveTab('in-out')}>
            出入库操作
          </Button>
          <Button size="large" onClick={() => setActiveTab('spare-parts-alert')}>
            备件预警
          </Button>
        </Space>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="库存提醒"
        description="当前有 5 种物料库存不足，3 种备件即将到期！建议及时补充库存。"
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        action={
          <Button size="small" type="link" onClick={() => setActiveTab('spare-parts-alert')}>
            查看详情
          </Button>
        }
        style={{ marginBottom: '24px' }}
        closable
      />
      
      {/* 核心统计指标 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存总价值"
              value={2850000}
              precision={0}
              prefix="¥"
              suffix=""
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 较上月增长 3.2%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存周转率"
              value={4.2}
              precision={1}
              suffix="次/年"
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={84} size="small" showInfo={false} />
              <span style={{ fontSize: '12px', color: '#666' }}>目标 5.0次/年</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="缺料预警"
              value={8}
              suffix="种"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status="error" text="紧急 3种" />
              <Badge status="warning" text="一般 5种" style={{ marginLeft: '8px' }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在库物料种类"
              value={1256}
              suffix="种"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              原材料: 456种 | 备件: 800种
            </div>
          </Card>
        </Col>
      </Row>

      {/* 库存状态和出入库动态 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {/* 库存状态监控 */}
        <Col span={12}>
          <Card title="库存状态监控" extra={<Button type="link" onClick={() => setActiveTab('master-data')}>查看详情</Button>}>
            <List
              size="small"
              dataSource={[
                { category: '原材料', total: 456, normal: 420, warning: 28, critical: 8, value: 1200000 },
                { category: '半成品', total: 128, normal: 115, warning: 10, critical: 3, value: 450000 },
                { category: '成品', total: 89, normal: 82, warning: 5, critical: 2, value: 680000 },
                { category: '备件', total: 583, normal: 545, warning: 32, critical: 6, value: 520000 }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<DatabaseOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.category}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          ¥{(item.value / 10000).toFixed(0)}万
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>
                          总计: {item.total}种 | 正常: {item.normal}种
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Progress 
                            percent={Math.round((item.normal / item.total) * 100)} 
                            size="small" 
                            showInfo={false}
                            strokeColor={item.critical > 0 ? '#ff4d4f' : item.warning > 0 ? '#faad14' : '#52c41a'}
                          />
                          <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                            {item.warning > 0 && <Badge status="warning" text={`预警${item.warning}`} />}
                            {item.critical > 0 && <Badge status="error" text={`紧急${item.critical}`} />}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 出入库动态 */}
        <Col span={12}>
          <Card title="今日出入库动态" extra={<Button type="link" onClick={() => setActiveTab('in-out')}>查看详情</Button>}>
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="入库"
                    value={28}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<TruckOutlined />}
                    suffix="笔"
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="出库"
                    value={45}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<TruckOutlined />}
                    suffix="笔"
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="调拨"
                    value={12}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<TransactionOutlined />}
                    suffix="笔"
                  />
                </Col>
              </Row>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Timeline size="small">
              <Timeline.Item color="green" dot={<TruckOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>入库 - 原材料A型</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    时间: 14:30 | 数量: 500kg | 供应商: 材料公司A
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue" dot={<TruckOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>出库 - 备件轴承</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    时间: 13:15 | 数量: 2个 | 用途: 设备维修
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="purple" dot={<TransactionOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>调拨 - 包装材料</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    时间: 11:45 | 数量: 100个 | 从仓库A到仓库B
                  </div>
                </div>
              </Timeline.Item>
              <Timeline.Item color="orange" dot={<AlertOutlined />}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>预警 - 密封圈库存不足</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    时间: 10:20 | 当前库存: 5个 | 最低库存: 10个
                  </div>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
      
      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        {/* 核心库存管理 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>
            <DatabaseOutlined /> 核心库存管理
          </h4>
          <Row gutter={16}>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('master-data')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<DatabaseOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title="库存主数据"
                  description="物料信息、库位管理"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('in-out')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<TruckOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title="出入库管理"
                  description="入库、出库、退库操作"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('transfer')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<TransactionOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                  title="库存调拨"
                  description="库间调拨、库位调整"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('count')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                  title="库存盘点"
                  description="定期盘点、差异处理"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* 备件专项管理 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#faad14', marginBottom: '12px' }}>
            <AlertOutlined /> 备件专项管理
          </h4>
          <Row gutter={16}>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('spare-parts-alert')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<AlertOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                  title="备件预警"
                  description="寿命预警、库存预警"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('external-spare-parts')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title="外部备件"
                  description="外部供应商备件管理"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('spare-parts-flow')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<TransactionOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title="备件流水"
                  description="备件交易流水记录"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* 分析与设置 */}
        <div>
          <h4 style={{ color: '#722ed1', marginBottom: '12px' }}>
            <BarChartOutlined /> 分析与设置
          </h4>
          <Row gutter={16}>
            <Col span={12}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('reports')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<BarChartOutlined />} size="small" />}
                  title="库存报表"
                  description="库存分析、周转率报表"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('settings')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<SettingOutlined />} size="small" />}
                  title="库存设置"
                  description="预警参数、库存策略"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <style>
        {`
          .compact-tabs .ant-tabs-nav {
            margin-bottom: 8px;
          }
          .compact-tabs .ant-tabs-tab {
            padding: 8px 10px !important;
            margin: 0 2px !important;
            font-size: 13px !important;
            min-width: auto !important;
          }
          .compact-tabs .ant-tabs-tab-btn {
            font-size: 14px !important;
            white-space: nowrap;
          }
          .compact-tabs .ant-tabs-tab .anticon {
            font-size: 14px !important;
            margin-right: 4px !important;
          }
          .compact-tabs .ant-tabs-nav-wrap {
            overflow: visible !important;
          }
          .compact-tabs .ant-tabs-nav-list {
            transform: none !important;
          }
        `}
      </style>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="compact-tabs"
        tabBarStyle={{
          marginBottom: '8px',
          fontSize: '14px'
        }}
      />
      <div style={{ marginTop: '16px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SimpleInventory;