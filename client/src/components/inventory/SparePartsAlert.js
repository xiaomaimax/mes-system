import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Progress, Alert, Select, Input, Row, Col, Statistic } from 'antd';
import { SearchOutlined, AlertOutlined, ExclamationCircleOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;

const SparePartsAlert = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const alertData = [
    {
      key: '1',
      partCode: 'SP-001',
      partName: '温度传感器',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      currentUsageHours: 8500,
      expectedLifeHours: 10000,
      remainingHours: 1500,
      usageRate: 85.0,
      installDate: '2023-06-15',
      expectedReplaceDate: '2024-02-15',
      alertLevel: 'warning',
      supplier: '传感器公司A',
      unitPrice: 350.00,
      stockQuantity: 3,
      minStockLevel: 2,
      status: 'in_use',
      remarks: '需要关注，建议提前采购'
    },
    {
      key: '2',
      partCode: 'SP-002',
      partName: '液压油封',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      currentUsageHours: 9800,
      expectedLifeHours: 10000,
      remainingHours: 200,
      usageRate: 98.0,
      installDate: '2023-01-10',
      expectedReplaceDate: '2024-01-20',
      alertLevel: 'critical',
      supplier: '密封件公司B',
      unitPrice: 120.00,
      stockQuantity: 0,
      minStockLevel: 1,
      status: 'in_use',
      remarks: '紧急！立即采购更换'
    },
    {
      key: '3',
      partCode: 'SP-003',
      partName: '轴承',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      currentUsageHours: 7200,
      expectedLifeHours: 12000,
      remainingHours: 4800,
      usageRate: 60.0,
      installDate: '2023-08-20',
      expectedReplaceDate: '2024-08-20',
      alertLevel: 'normal',
      supplier: '轴承公司C',
      unitPrice: 280.00,
      stockQuantity: 5,
      minStockLevel: 2,
      status: 'in_use',
      remarks: '状态良好'
    }
  ];

  // 统计数据
  const summaryData = {
    totalParts: 25,
    criticalAlerts: 3,
    warningAlerts: 8,
    normalParts: 14,
    totalValue: 125000.00
  };

  const columns = [
    {
      title: '备件编码',
      dataIndex: 'partCode',
      key: 'partCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '备件名称',
      dataIndex: 'partName',
      key: 'partName',
      width: 150,
    },
    {
      title: '设备信息',
      key: 'equipment',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.equipmentName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.equipmentCode}</div>
        </div>
      )
    },
    {
      title: '使用寿命',
      key: 'lifespan',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <span>已使用: {record.currentUsageHours}h</span>
            <span style={{ marginLeft: 16 }}>预期: {record.expectedLifeHours}h</span>
          </div>
          <Progress 
            percent={record.usageRate} 
            size="small" 
            status={record.usageRate > 90 ? 'exception' : record.usageRate > 80 ? 'active' : 'success'}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            剩余: {record.remainingHours}h
          </div>
        </div>
      )
    },
    {
      title: '安装日期',
      dataIndex: 'installDate',
      key: 'installDate',
      width: 100,
    },
    {
      title: '预计更换',
      dataIndex: 'expectedReplaceDate',
      key: 'expectedReplaceDate',
      width: 100,
    },
    {
      title: '预警等级',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: 100,
      render: (level) => {
        const levelMap = {
          critical: { color: 'red', text: '紧急', icon: <ExclamationCircleOutlined /> },
          warning: { color: 'orange', text: '警告', icon: <WarningOutlined /> },
          normal: { color: 'green', text: '正常', icon: null }
        };
        const { color, text, icon } = levelMap[level];
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 120,
      render: (_, record) => (
        <div>
          <div>库存: {record.stockQuantity}</div>
          <div style={{ fontSize: '12px', color: record.stockQuantity <= record.minStockLevel ? '#ff4d4f' : '#666' }}>
            最低: {record.minStockLevel}
          </div>
          {record.stockQuantity <= record.minStockLevel && (
            <Tag color="red" size="small">库存不足</Tag>
          )}
        </div>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            更换计划
          </Button>
          <Button type="link" size="small">
            采购申请
          </Button>
          <Button type="link" size="small">
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总备件数"
              value={summaryData.totalParts}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="紧急预警"
              value={summaryData.criticalAlerts}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="警告预警"
              value={summaryData.warningAlerts}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="正常状态"
              value={summaryData.normalParts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="总价值"
              value={summaryData.totalValue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Button 
              type="primary" 
              danger
              style={{ width: '100%' }}
            >
              生成采购计划
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 预警提示 */}
      <Alert
        message="备件寿命预警"
        description={`当前有 ${summaryData.criticalAlerts} 个备件需要紧急更换，${summaryData.warningAlerts} 个备件需要关注！`}
        type="warning"
        icon={<AlertOutlined />}
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Card 
        title={
          <Space>
            <AlertOutlined />
            备件寿命预警管理
          </Space>
        }
        extra={
          <Space>
            <Button>导出预警报告</Button>
            <Button type="primary">
              预警设置
            </Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索备件编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="预警等级" style={{ width: 120 }}>
              <Option value="critical">紧急</Option>
              <Option value="warning">警告</Option>
              <Option value="normal">正常</Option>
            </Select>
            <Select placeholder="设备类型" style={{ width: 150 }}>
              <Option value="injection">注塑设备</Option>
              <Option value="packaging">包装设备</Option>
              <Option value="inspection">检测设备</Option>
            </Select>
            <Select placeholder="供应商" style={{ width: 150 }}>
              <Option value="supplier_a">传感器公司A</Option>
              <Option value="supplier_b">密封件公司B</Option>
              <Option value="supplier_c">轴承公司C</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button>重置</Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={alertData}
          loading={loading}
          pagination={{
            total: alertData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
          rowClassName={(record) => {
            if (record.alertLevel === 'critical') return 'row-critical';
            if (record.alertLevel === 'warning') return 'row-warning';
            return '';
          }}
        />
      </Card>

      <style jsx>{`
        .row-critical {
          background-color: #fff2f0;
        }
        .row-warning {
          background-color: #fff7e6;
        }
      `}</style>
    </div>
  );
};

export default SparePartsAlert;