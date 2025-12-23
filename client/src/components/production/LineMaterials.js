import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Progress, Alert } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const LineMaterials = () => {
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const materialData = [
    {
      key: '1',
      materialCode: 'MAT-001',
      materialName: '原料A',
      specification: '规格A-100kg',
      workshopName: '车间A',
      productionLine: '生产线1',
      currentStock: 150,
      minStock: 100,
      maxStock: 500,
      unit: 'kg',
      location: 'A区-01货位',
      supplier: '供应商A',
      lastReplenishDate: '2024-01-14',
      nextReplenishDate: '2024-01-16',
      status: 'normal',
      usageRate: 25.5,
      remarks: '正常消耗'
    },
    {
      key: '2',
      materialCode: 'MAT-002',
      materialName: '原料B',
      specification: '规格B-50kg',
      workshopName: '车间A',
      productionLine: '生产线1',
      currentStock: 80,
      minStock: 100,
      maxStock: 300,
      unit: 'kg',
      location: 'A区-02货位',
      supplier: '供应商B',
      lastReplenishDate: '2024-01-13',
      nextReplenishDate: '2024-01-15',
      status: 'low',
      usageRate: 30.2,
      remarks: '库存不足，需要补料'
    },
    {
      key: '3',
      materialCode: 'MAT-003',
      materialName: '包装材料',
      specification: '标准包装盒',
      workshopName: '车间A',
      productionLine: '生产线2',
      currentStock: 2000,
      minStock: 1000,
      maxStock: 5000,
      unit: '个',
      location: 'B区-01货位',
      supplier: '供应商C',
      lastReplenishDate: '2024-01-12',
      nextReplenishDate: '2024-01-18',
      status: 'normal',
      usageRate: 15.8,
      remarks: '正常库存'
    }
  ];

  const columns = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
    },
    {
      title: '车间/产线',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.workshopName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productionLine}</div>
        </div>
      )
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 200,
      render: (_, record) => {
        const percentage = Math.round((record.currentStock / record.maxStock) * 100);
        const isLow = record.currentStock <= record.minStock;
        
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: isLow ? '#ff4d4f' : '#52c41a' }}>
                {record.currentStock} {record.unit}
              </span>
              <span style={{ color: '#666', marginLeft: 8 }}>
                / {record.maxStock} {record.unit}
              </span>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={isLow ? 'exception' : 'normal'}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
              最低库存: {record.minStock} {record.unit}
            </div>
          </div>
        );
      }
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'storageLocation',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: '上次补料',
      dataIndex: 'lastReplenishDate',
      key: 'lastReplenishDate',
      width: 100,
    },
    {
      title: '下次补料',
      dataIndex: 'nextReplenishDate',
      key: 'nextReplenishDate',
      width: 100,
    },
    {
      title: '消耗速率',
      dataIndex: 'usageRate',
      key: 'usageRate',
      width: 100,
      render: (rate) => `${rate} ${rate > 0 ? '件/h' : ''}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          normal: { color: 'green', text: '正常' },
          low: { color: 'orange', text: '库存不足' },
          out: { color: 'red', text: '缺料' },
          excess: { color: 'blue', text: '库存过多' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">补料申请</Button>
          <Button type="link" size="small">调拨</Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  // 统计低库存物料
  const lowStockCount = materialData.filter(item => item.status === 'low' || item.status === 'out').length;

  return (
    <div>
      {/* 库存预警 */}
      {lowStockCount > 0 && (
        <Alert
          message={`库存预警`}
          description={`当前有 ${lowStockCount} 种物料库存不足，请及时补料！`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card 
        title={
          <Space>
            <ShoppingCartOutlined />
            线边物料管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />}>刷新库存</Button>
            <Button type="primary">补料申请</Button>
          </Space>
        }
      >
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索物料编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择车间" style={{ width: 150 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="workshop_c">车间C</Option>
            </Select>
            <Select placeholder="选择产线" style={{ width: 150 }}>
              <Option value="line_1">生产线1</Option>
              <Option value="line_2">生产线2</Option>
              <Option value="line_3">生产线3</Option>
            </Select>
            <Select placeholder="库存状态" style={{ width: 120 }}>
              <Option value="normal">正常</Option>
              <Option value="low">库存不足</Option>
              <Option value="out">缺料</Option>
              <Option value="excess">库存过多</Option>
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
          dataSource={materialData}
          loading={loading}
          pagination={{
            total: materialData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1800 }}
          rowClassName={(record) => {
            if (record.status === 'low') return 'row-warning';
            if (record.status === 'out') return 'row-error';
            return '';
          }}
        />
      </Card>

      <style jsx>{`
        .row-warning {
          background-color: #fff7e6;
        }
        .row-error {
          background-color: #fff2f0;
        }
      `}</style>
    </div>
  );
};

export default LineMaterials;