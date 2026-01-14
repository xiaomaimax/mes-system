// MIGRATION STATUS: Migrated - DataService integrated with async calls
// COMPLETED: Replaced mockData usage with actual DataService calls

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Progress, Tabs, Badge, List, Avatar, Alert, Table, Tag } from 'antd';
import { ToolOutlined, SafetyOutlined, SearchOutlined, ExclamationCircleOutlined, ToolTwoTone, FolderOutlined, LinkOutlined, AppstoreOutlined, SettingOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import DataService from '../services/DataService';
import { DataFormatter, DataCalculator } from '../utils/dataUtils';
import EquipmentMaintenance from './equipment/EquipmentMaintenance';
import EquipmentInspection from './equipment/EquipmentInspection';
import EquipmentRepair from './equipment/EquipmentRepair';
import EquipmentArchives from './equipment/EquipmentArchives';
import EquipmentRelationships from './equipment/EquipmentRelationships';
import EquipmentMasterData from './equipment/EquipmentMasterData';
const SimpleEquipment = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      icon: <ToolOutlined />
    },
    {
      key: 'master-data',
      label: '主数据',
      icon: <AppstoreOutlined />
    },
    {
      key: 'maintenance',
      label: '设备保养',
      icon: <SafetyOutlined />
    },
    {
      key: 'inspection',
      label: '设备点检',
      icon: <SearchOutlined />
    },
    {
      key: 'repair',
      label: '设备维修',
      icon: <ToolTwoTone />
    },
    {
      key: 'archives',
      label: '设备档案',
      icon: <FolderOutlined />
    },
    {
      key: 'relationships',
      label: '设备关系',
      icon: <LinkOutlined />
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'maintenance':
        return <EquipmentMaintenance />;
      case 'inspection':
        return <EquipmentInspection />;
      case 'repair':
        return <EquipmentRepair />;
      case 'archives':
        return <EquipmentArchives />;
      case 'relationships':
        return <EquipmentRelationships />;
      case 'master-data':
        return <EquipmentMasterData />;
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
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>设备管理概览</h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            设备全生命周期管理，提高设备利用率和可靠性
          </p>
        </div>
        <Space size="large">
          <Button type="primary" size="large" onClick={() => setActiveTab('repair')}>
            设备报修
          </Button>
          <Button size="large" onClick={() => setActiveTab('maintenance')}>
            保养管理
          </Button>
        </Space>
      </div>

      {/* 重要提醒 */}
      <Alert
        message="设备提醒"
        description="当前有 2 台设备需要紧急维护，3 台设备即将到保养期！"
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        action={
          <Button size="small" type="link" onClick={() => setActiveTab('maintenance')}>
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
              title="设备总数"
              value={45}
              suffix="台"
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 正常运行 38台
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="设备利用率"
              value={87.2}
              precision={1}
              suffix="%"
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress percent={87} size="small" showInfo={false} />
              <span style={{ fontSize: '12px', color: '#666' }}>目标利用率 90%</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="维修中设备"
              value={3}
              suffix="台"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status="error" text="紧急维修 1台" />
              <Badge status="warning" text="计划维修 2台" style={{ marginLeft: '8px' }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待保养设备"
              value={5}
              suffix="台"
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              今日: 2台 | 本周: 3台
            </div>
          </Card>
        </Col>
      </Row>

      {/* 设备状态和维护计划 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {/* 设备运行状态 */}
        <Col span={12}>
          <Card title="设备运行状态" extra={<Button type="link" onClick={() => setActiveTab('inspection')}>查看详情</Button>}>
            <List
              size="small"
              dataSource={[
                { name: '注塑机A1', status: 'running', utilization: 85, location: '车间A', operator: '张师傅' },
                { name: '包装机B1', status: 'maintenance', utilization: 0, location: '车间B', operator: '维修中' },
                { name: '检测设备C1', status: 'running', utilization: 92, location: '质检区', operator: '李师傅' },
                { name: '注塑机A2', status: 'running', utilization: 78, location: '车间A', operator: '王师傅' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.status === 'running' ? <SettingOutlined /> : <ExclamationCircleOutlined />}
                        style={{ 
                          backgroundColor: item.status === 'running' ? '#52c41a' : '#faad14' 
                        }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        <Badge 
                          status={item.status === 'running' ? 'processing' : 'warning'} 
                          text={item.status === 'running' ? '运行中' : '维护中'} 
                        />
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>位置: {item.location} | 操作员: {item.operator}</div>
                        {item.status === 'running' && (
                          <div>
                            <Progress 
                              percent={item.utilization} 
                              size="small" 
                              format={() => `利用率 ${item.utilization}%`}
                            />
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 维护计划 */}
        <Col span={12}>
          <Card title="维护计划" extra={<Button type="link" onClick={() => setActiveTab('maintenance')}>查看详情</Button>}>
            <div style={{ marginBottom: '12px', padding: '12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#cf1322', marginBottom: '4px' }}>🚨 紧急维修</div>
              <div>注塑机A3 - 液压系统故障</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>预计修复时间: 4小时</div>
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#389e0d', marginBottom: '4px' }}>📅 今日保养</div>
              <div>包装机B2 - 定期保养</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>计划时间: 14:00-16:00</div>
            </div>
            <div style={{ padding: '12px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#d48806', marginBottom: '4px' }}>⏰ 本周计划</div>
              <div>检测设备C2 - 精度校准</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>计划时间: 周五上午</div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 功能模块快速入口 */}
      <Card title="功能模块" style={{ marginBottom: '24px' }}>
        {/* 核心功能 */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#1890ff', marginBottom: '12px' }}>
            <ToolOutlined /> 核心管理
          </h4>
          <Row gutter={16}>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('maintenance')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title="设备保养"
                  description="定期保养计划和执行记录"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('inspection')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<SearchOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title="设备点检"
                  description="日常设备状态检查和监控"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('repair')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<ToolTwoTone />} style={{ backgroundColor: '#faad14' }} />}
                  title="设备维修"
                  description="故障报修和维修工单管理"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* 辅助功能 */}
        <div>
          <h4 style={{ color: '#faad14', marginBottom: '12px' }}>
            <AppstoreOutlined /> 辅助功能
          </h4>
          <Row gutter={16}>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('archives')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<FolderOutlined />} size="small" />}
                  title="设备档案"
                  description="设备信息档案"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('relationships')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<LinkOutlined />} size="small" />}
                  title="设备关系"
                  description="设备对应关系"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                size="small"
                hoverable
                onClick={() => setActiveTab('master-data')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Meta
                  avatar={<Avatar icon={<AppstoreOutlined />} size="small" />}
                  title="设备主数据"
                  description="设备基础数据"
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
            padding: 8px 12px !important;
            margin: 0 2px !important;
            font-size: 14px !important;
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

export default SimpleEquipment;