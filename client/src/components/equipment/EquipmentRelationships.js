import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Tree, Row, Col } from 'antd';
import { SearchOutlined, LinkOutlined, ApartmentOutlined, ToolOutlined } from '@ant-design/icons';

const { Option } = Select;

const EquipmentRelationships = () => {
  const [loading, setLoading] = useState(false);

  // 设备层级树数据
  const treeData = [
    {
      title: '车间A',
      key: 'workshop-a',
      icon: <ApartmentOutlined />,
      children: [
        {
          title: '生产线1',
          key: 'line-1',
          children: [
            {
              title: 'EQ-001 注塑机A1',
              key: 'eq-001',
              icon: <ToolOutlined />,
              isLeaf: true
            },
            {
              title: 'EQ-002 包装机B1',
              key: 'eq-002',
              icon: <ToolOutlined />,
              isLeaf: true
            }
          ]
        },
        {
          title: '生产线2',
          key: 'line-2',
          children: [
            {
              title: 'EQ-003 检测设备C1',
              key: 'eq-003',
              icon: <ToolOutlined />,
              isLeaf: true
            }
          ]
        }
      ]
    },
    {
      title: '车间B',
      key: 'workshop-b',
      icon: <ApartmentOutlined />,
      children: [
        {
          title: '生产线3',
          key: 'line-3',
          children: [
            {
              title: 'EQ-004 传送带D1',
              key: 'eq-004',
              icon: <ToolOutlined />,
              isLeaf: true
            }
          ]
        }
      ]
    }
  ];

  // 设备关系数据
  const relationshipData = [
    {
      key: '1',
      equipmentCode: 'EQ-001',
      equipmentName: '注塑机A1',
      workshopName: '车间A',
      productionLine: '生产线1',
      position: '01号位',
      upstreamEquipment: '-',
      downstreamEquipment: 'EQ-002',
      relatedEquipment: ['EQ-005 冷却塔', 'EQ-006 空压机'],
      processFlow: '原料投入 → 注塑成型 → 产品输出',
      status: 'active'
    },
    {
      key: '2',
      equipmentCode: 'EQ-002',
      equipmentName: '包装机B1',
      workshopName: '车间A',
      productionLine: '生产线1',
      position: '02号位',
      upstreamEquipment: 'EQ-001',
      downstreamEquipment: 'EQ-003',
      relatedEquipment: ['EQ-007 封口机'],
      processFlow: '产品接收 → 包装处理 → 成品输出',
      status: 'active'
    },
    {
      key: '3',
      equipmentCode: 'EQ-003',
      equipmentName: '检测设备C1',
      workshopName: '车间A',
      productionLine: '生产线2',
      position: '01号位',
      upstreamEquipment: 'EQ-002',
      downstreamEquipment: '-',
      relatedEquipment: ['EQ-008 标签机'],
      processFlow: '成品接收 → 质量检测 → 合格品输出',
      status: 'active'
    }
  ];

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
    },
    {
      title: '所属车间',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 100,
    },
    {
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      width: 80,
    },
    {
      title: '上游设备',
      dataIndex: 'upstreamEquipment',
      key: 'upstreamEquipment',
      width: 120,
      render: (equipment) => equipment === '-' ? '-' : <Tag color="blue">{equipment}</Tag>
    },
    {
      title: '下游设备',
      dataIndex: 'downstreamEquipment',
      key: 'downstreamEquipment',
      width: 120,
      render: (equipment) => equipment === '-' ? '-' : <Tag color="green">{equipment}</Tag>
    },
    {
      title: '关联设备',
      dataIndex: 'relatedEquipment',
      key: 'relatedEquipment',
      width: 200,
      render: (equipment) => (
        <div>
          {equipment.map((item, index) => (
            <Tag key={index} color="orange" style={{ marginBottom: 2 }}>
              {item}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '工艺流程',
      dataIndex: 'processFlow',
      key: 'processFlow',
      width: 250,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            编辑关系
          </Button>
          <Button type="link" size="small">
            查看流程图
          </Button>
        </Space>
      ),
    },
  ];

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  return (
    <div>
      <Row gutter={16}>
        {/* 左侧设备树 */}
        <Col span={6}>
          <Card 
            title="设备层级结构" 
            size="small"
            style={{ height: '600px', overflow: 'auto' }}
          >
            <Tree
              showIcon
              defaultExpandAll
              onSelect={onSelect}
              treeData={treeData}
            />
          </Card>
        </Col>

        {/* 右侧关系表格 */}
        <Col span={18}>
          <Card 
            title={
              <Space>
                <LinkOutlined />
                设备对应关系
              </Space>
            }
            extra={
              <Space>
                <Button>流程图视图</Button>
                <Button type="primary">
                  配置关系
                </Button>
              </Space>
            }
          >
            {/* 搜索区域 */}
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Input
                  placeholder="搜索设备编号/名称"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                />
                <Select placeholder="选择车间" style={{ width: 120 }}>
                  <Option value="workshop_a">车间A</Option>
                  <Option value="workshop_b">车间B</Option>
                </Select>
                <Select placeholder="选择产线" style={{ width: 120 }}>
                  <Option value="line_1">生产线1</Option>
                  <Option value="line_2">生产线2</Option>
                  <Option value="line_3">生产线3</Option>
                </Select>
                <Button type="primary" icon={<SearchOutlined />}>
                  搜索
                </Button>
              </Space>
            </div>

            {/* 表格 */}
            <Table
              columns={columns}
              dataSource={relationshipData}
              loading={loading}
              pagination={{
                total: relationshipData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EquipmentRelationships;