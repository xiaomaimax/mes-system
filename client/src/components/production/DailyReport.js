import React, { useState } from 'react';
import { Card, Table, Button, Space, DatePicker, Select, Row, Col, Statistic } from 'antd';
import { SearchOutlined, FileDoneOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';

import ButtonActions from '../../utils/buttonActions';
const { Option } = Select;

const DailyReport = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // 模拟数据 - 日报汇总
  const dailySummary = {
    totalTasks: 8,
    completedTasks: 6,
    inProgressTasks: 2,
    totalOutput: 1850,
    qualifiedOutput: 1820,
    defectiveOutput: 30,
    qualityRate: 98.4,
    efficiency: 92.5
  };

  // 模拟数据 - 详细记录
  const dailyData = [
    {
      key: '1',
      workshopName: '车间A',
      productionLine: '生产线1',
      taskId: 'PT-2024-001',
      productName: '产品A',
      operator: '张三',
      shift: '白班',
      planQuantity: 500,
      actualQuantity: 480,
      qualifiedQuantity: 475,
      defectiveQuantity: 5,
      efficiency: 96.0,
      qualityRate: 99.0,
      startTime: '08:00',
      endTime: '16:00',
      workHours: 8,
      remarks: '正常生产'
    },
    {
      key: '2',
      workshopName: '车间A',
      productionLine: '生产线2',
      taskId: 'PT-2024-002',
      productName: '产品B',
      operator: '李四',
      shift: '白班',
      planQuantity: 400,
      actualQuantity: 380,
      qualifiedQuantity: 375,
      defectiveQuantity: 5,
      efficiency: 95.0,
      qualityRate: 98.7,
      startTime: '08:00',
      endTime: '16:00',
      workHours: 8,
      remarks: '设备维护30分钟'
    },
    {
      key: '3',
      workshopName: '车间B',
      productionLine: '生产线3',
      taskId: 'PT-2024-003',
      productName: '产品C',
      operator: '王五',
      shift: '夜班',
      planQuantity: 600,
      actualQuantity: 590,
      qualifiedQuantity: 585,
      defectiveQuantity: 5,
      efficiency: 98.3,
      qualityRate: 99.2,
      startTime: '20:00',
      endTime: '04:00',
      workHours: 8,
      remarks: '正常生产'
    }
  ];

  const columns = [
    {
      title: '车间',
      dataIndex: 'workshopName',
      key: 'workshopName',
      width: 80,
    },
    {
      title: '产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 100,
    },
    {
      title: '任务编号',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      width: 60,
    },
    {
      title: '计划产量',
      dataIndex: 'planQuantity',
      key: 'planQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '实际产量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
      render: (quantity) => `${quantity} 件`
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 100,
      render: (qty) => <span style={{ color: '#52c41a' }}>{qty} 件</span>
    },
    {
      title: '不良数量',
      dataIndex: 'defectiveQuantity',
      key: 'defectiveQuantity',
      width: 100,
      render: (qty) => <span style={{ color: '#ff4d4f' }}>{qty} 件</span>
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 80,
      render: (efficiency) => `${efficiency}%`
    },
    {
      title: '合格率',
      dataIndex: 'qualityRate',
      key: 'qualityRate',
      width: 80,
      render: (rate) => `${rate}%`
    },
    {
      title: '工作时间',
      key: 'workTime',
      width: 120,
      render: (_, record) => `${record.startTime}-${record.endTime}`
    },
    {
      title: '工时',
      dataIndex: 'workHours',
      key: 'workHours',
      width: 60,
      render: (hours) => `${hours}h`
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
    }
  ];

  return (
    <div>
      {/* 日报汇总 */}
      <Card 
        title={
          <Space>
            <FileDoneOutlined />
            生产日报汇总
          </Space>
        }
        extra={
          <Space>
            <DatePicker 
              placeholder="选择日期" 
              onChange={setSelectedDate}
            />
            <Select placeholder="选择车间" style={{ width: 120 }}>
              <Option value="workshop_a">车间A</Option>
              <Option value="workshop_b">车间B</Option>
              <Option value="all">全部车间</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={3}>
            <Statistic
              title="总任务数"
              value={dailySummary.totalTasks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="完成任务"
              value={dailySummary.completedTasks}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="进行中"
              value={dailySummary.inProgressTasks}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="总产量"
              value={dailySummary.totalOutput}
              suffix="件"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="合格产量"
              value={dailySummary.qualifiedOutput}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="不良产量"
              value={dailySummary.defectiveOutput}
              suffix="件"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="合格率"
              value={dailySummary.qualityRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={3}>
            <Statistic
              title="综合效率"
              value={dailySummary.efficiency}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 详细记录 */}
      <Card 
        title="生产详细记录"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>
              导出Excel
            </Button>
            <Button icon={<PrinterOutlined />}>
              打印报表
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dailyData}
          loading={loading}
          pagination={{
            total: dailyData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1600 }}
          summary={(pageData) => {
            let totalPlan = 0;
            let totalActual = 0;
            let totalQualified = 0;
            let totalDefective = 0;

            pageData.forEach(({ planQuantity, actualQuantity, qualifiedQuantity, defectiveQuantity }) => {
              totalPlan += planQuantity;
              totalActual += actualQuantity;
              totalQualified += qualifiedQuantity;
              totalDefective += defectiveQuantity;
            });

            const avgEfficiency = totalPlan > 0 ? ((totalActual / totalPlan) * 100).toFixed(1) : 0;
            const avgQualityRate = totalActual > 0 ? ((totalQualified / totalActual) * 100).toFixed(1) : 0;

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <strong>合计</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <strong>{totalPlan} 件</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <strong>{totalActual} 件</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                  <strong style={{ color: '#52c41a' }}>{totalQualified} 件</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9}>
                  <strong style={{ color: '#ff4d4f' }}>{totalDefective} 件</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={10}>
                  <strong>{avgEfficiency}%</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={11}>
                  <strong>{avgQualityRate}%</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={12} colSpan={3}>
                  -
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default DailyReport;