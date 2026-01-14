# 组件迁移最佳实践指南

## 📋 概述

本文档详细说明了如何将MES系统的前端组件从使用mock数据迁移到使用DataService获取真实API数据。这是Mock数据到数据库集成项目的核心内容。

**迁移目标**: 将所有前端组件从依赖`mockData.js`转换为使用`DataService`调用API  
**迁移原则**: 保持UI和交互逻辑不变，只改变数据来源  
**迁移范围**: 生产、设备、质量、库存、报表等所有业务模块  

---

## 🎯 迁移策略

### 迁移顺序
1. **生产模块** - 核心业务模块，优先迁移
2. **设备模块** - 基础数据模块
3. **质量模块** - 质量管控模块
4. **库存模块** - 物料管理模块
5. **报表模块** - 数据展示模块

### 迁移原则
- **渐进式迁移**: 逐个模块、逐个组件进行迁移
- **向后兼容**: 迁移过程中保持系统可用性
- **充分测试**: 每个组件迁移后都要进行功能测试
- **性能优化**: 利用缓存机制提升用户体验

---

## 🔄 标准迁移模式

### 迁移前的组件结构

```javascript
// 旧组件 - 使用mock数据
import React, { useState, useEffect } from 'react';
import { Table, Card, Spin } from 'antd';
import { productionData } from '../data/mockData';

const OldProductionPlanComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟异步加载
    setTimeout(() => {
      setData(productionData.plans);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { title: '计划编号', dataIndex: 'planCode', key: 'planCode' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '状态', dataIndex: 'status', key: 'status' }
  ];

  return (
    <Card title="生产计划">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default OldProductionPlanComponent;
```

### 迁移后的组件结构

```javascript
// 新组件 - 使用DataService
import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import DataService from '../services/DataService';

const NewProductionPlanComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取数据的函数
  const fetchData = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await DataService.getProductionPlans({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      });

      if (response.success) {
        setData(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      console.error('获取生产计划失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  // 刷新数据
  const handleRefresh = () => {
    fetchData();
  };

  // 分页变化处理
  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const columns = [
    { title: '计划编号', dataIndex: 'planCode', key: 'planCode' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          'pending': '待开始',
          'in_progress': '进行中',
          'completed': '已完成'
        };
        return statusMap[status] || status;
      }
    }
  ];

  return (
    <Card 
      title="生产计划"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
        >
          刷新
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default NewProductionPlanComponent;
```

---

## 🎣 使用useDataService Hook简化迁移

为了简化迁移过程，推荐使用`useDataService` Hook：

### Hook的实现

```javascript
// client/src/hooks/useDataService.js
import { useState, useEffect, useCallback } from 'react';

/**
 * 数据服务Hook
 * @param {Function} fetchFn - 数据获取函数
 * @param {Array} dependencies - 依赖数组
 * @param {Object} options - 配置选项
 */
export const useDataService = (fetchFn, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    immediate = true,  // 是否立即执行
    onSuccess,         // 成功回调
    onError           // 错误回调
  } = options;

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(...args);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMsg = response.error?.message || '数据加载失败';
        setError(errorMsg);
        onError?.(response.error);
      }
    } catch (err) {
      const errorMsg = err.message || '网络请求失败';
      setError(errorMsg);
      onError?.(err);
      console.error('数据获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
    setError
  };
};
```

### 使用Hook简化组件

```javascript
// 使用Hook的简化组件
import React from 'react';
import { Table, Card, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useDataService } from '../hooks/useDataService';
import DataService from '../services/DataService';

const SimplifiedProductionPlanComponent = () => {
  const { data, loading, error, refetch } = useDataService(
    () => DataService.getProductionPlans(),
    [] // 依赖数组为空，只在组件挂载时获取一次
  );

  const columns = [
    { title: '计划编号', dataIndex: 'planCode', key: 'planCode' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '状态', dataIndex: 'status', key: 'status' }
  ];

  return (
    <Card 
      title="生产计划"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refetch}
          loading={loading}
        >
          刷新
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          message={error}
          action={<Button size="small" onClick={refetch}>重试</Button>}
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Table
        columns={columns}
        dataSource={data?.items || []}
        loading={loading}
        rowKey="id"
        pagination={{
          total: data?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />
    </Card>
  );
};

export default SimplifiedProductionPlanComponent;
```

---

## 📋 分模块迁移指南

### 1. 生产模块迁移

#### 涉及组件
- `WorkshopPlan.js` - 车间计划
- `ProductionTasks.js` - 生产任务
- `WorkReportManagement.js` - 工作报告

#### 迁移要点
```javascript
// 生产计划组件迁移示例
const WorkshopPlan = () => {
  const { data, loading, error, refetch } = useDataService(
    () => DataService.getProductionPlans(),
    []
  );

  // 处理状态筛选
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: filteredData } = useDataService(
    () => DataService.getProductionPlans({ 
      status: statusFilter === 'all' ? undefined : statusFilter 
    }),
    [statusFilter]
  );

  return (
    <div>
      <Select 
        value={statusFilter} 
        onChange={setStatusFilter}
        style={{ marginBottom: 16 }}
      >
        <Option value="all">全部</Option>
        <Option value="pending">待开始</Option>
        <Option value="in_progress">进行中</Option>
        <Option value="completed">已完成</Option>
      </Select>
      
      {/* 表格组件 */}
    </div>
  );
};
```

### 2. 设备模块迁移

#### 涉及组件
- `EquipmentManagement.js` - 设备管理
- `MoldManagement.js` - 模具管理
- `EquipmentMaintenance.js` - 设备维护

#### 迁移要点
```javascript
// 设备管理组件迁移示例
const EquipmentManagement = () => {
  const { data: equipmentData, loading, error } = useDataService(
    () => DataService.getEquipment(),
    []
  );

  // 设备状态统计
  const statusStats = useMemo(() => {
    if (!equipmentData?.items) return {};
    
    return equipmentData.items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [equipmentData]);

  return (
    <div>
      {/* 状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="运行中" value={statusStats.running || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="空闲" value={statusStats.idle || 0} />
          </Card>
        </Col>
      </Row>
      
      {/* 设备列表 */}
      <Table dataSource={equipmentData?.items} loading={loading} />
    </div>
  );
};
```

### 3. 质量模块迁移

#### 涉及组件
- `QualityInspection.js` - 质量检验
- `DefectRecords.js` - 缺陷记录
- `InspectionStandards.js` - 检验标准

#### 迁移要点
```javascript
// 质量检验组件迁移示例
const QualityInspection = () => {
  const [inspectionType, setInspectionType] = useState('all');
  
  const { data, loading, error } = useDataService(
    () => DataService.getQualityInspections({
      type: inspectionType === 'all' ? undefined : inspectionType
    }),
    [inspectionType]
  );

  // 合格率计算
  const passRate = useMemo(() => {
    if (!data?.items?.length) return 0;
    
    const passedCount = data.items.filter(item => item.result === 'pass').length;
    return ((passedCount / data.items.length) * 100).toFixed(1);
  }, [data]);

  return (
    <div>
      <Card title={`质量检验 (合格率: ${passRate}%)`}>
        <Radio.Group 
          value={inspectionType} 
          onChange={(e) => setInspectionType(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="IQC">来料检验</Radio.Button>
          <Radio.Button value="PQC">过程检验</Radio.Button>
          <Radio.Button value="FQC">成品检验</Radio.Button>
          <Radio.Button value="OQC">出货检验</Radio.Button>
        </Radio.Group>
        
        <Table dataSource={data?.items} loading={loading} />
      </Card>
    </div>
  );
};
```

### 4. 库存模块迁移

#### 涉及组件
- `InventoryManagement.js` - 库存管理
- `InventoryTransactions.js` - 出入库记录
- `LocationManagement.js` - 库位管理

#### 迁移要点
```javascript
// 库存管理组件迁移示例
const InventoryManagement = () => {
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { data, loading, error } = useDataService(
    () => DataService.getInventory({ lowStock: showLowStock }),
    [showLowStock]
  );

  // 库存预警统计
  const lowStockCount = useMemo(() => {
    if (!data?.items) return 0;
    return data.items.filter(item => 
      item.currentStock <= item.minStock
    ).length;
  }, [data]);

  return (
    <div>
      <Card title="库存概览">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="总物料数" value={data?.total || 0} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="低库存预警" 
              value={lowStockCount}
              valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Col>
        </Row>
        
        <Switch
          checked={showLowStock}
          onChange={setShowLowStock}
          checkedChildren="显示低库存"
          unCheckedChildren="显示全部"
          style={{ marginTop: 16 }}
        />
      </Card>
      
      <Table 
        dataSource={data?.items} 
        loading={loading}
        rowClassName={(record) => 
          record.currentStock <= record.minStock ? 'low-stock-row' : ''
        }
      />
    </div>
  );
};
```

### 5. 报表模块迁移

#### 涉及组件
- `ProductionReports.js` - 生产报表
- `QualityReports.js` - 质量报表
- `EquipmentReports.js` - 设备报表

#### 迁移要点
```javascript
// 生产报表组件迁移示例
const ProductionReports = () => {
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);

  const { data, loading, error } = useDataService(
    () => DataService.getProductionReports({
      dateFrom: dateRange[0].format('YYYY-MM-DD'),
      dateTo: dateRange[1].format('YYYY-MM-DD')
    }),
    [dateRange]
  );

  return (
    <div>
      <Card title="生产报表">
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          style={{ marginBottom: 16 }}
        />
        
        {data?.summary && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic 
                title="计划产量" 
                value={data.summary.totalPlannedQuantity} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="实际产量" 
                value={data.summary.totalActualQuantity} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="合格产量" 
                value={data.summary.totalQualifiedQuantity} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="整体效率" 
                value={data.summary.overallEfficiency}
                suffix="%" 
              />
            </Col>
          </Row>
        )}
        
        {/* 图表组件 */}
        <Chart data={data?.details} loading={loading} />
      </Card>
    </div>
  );
};
```

---

## 🧪 测试策略

### 1. 单元测试

```javascript
// 组件测试示例
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductionPlanComponent from '../ProductionPlanComponent';
import DataService from '../../services/DataService';

// Mock DataService
jest.mock('../../services/DataService');

describe('ProductionPlanComponent', () => {
  beforeEach(() => {
    DataService.getProductionPlans.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 1, planCode: 'PLAN-001', productName: '产品A', quantity: 100 }
        ],
        total: 1
      }
    });
  });

  test('应该正确显示生产计划数据', async () => {
    render(<ProductionPlanComponent />);
    
    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText('PLAN-001')).toBeInTheDocument();
      expect(screen.getByText('产品A')).toBeInTheDocument();
    });
  });

  test('应该处理API错误', async () => {
    DataService.getProductionPlans.mockResolvedValue({
      success: false,
      error: { message: '数据加载失败' }
    });

    render(<ProductionPlanComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('数据加载失败')).toBeInTheDocument();
    });
  });

  test('刷新按钮应该重新获取数据', async () => {
    render(<ProductionPlanComponent />);
    
    const refreshButton = screen.getByText('刷新');
    await userEvent.click(refreshButton);
    
    expect(DataService.getProductionPlans).toHaveBeenCalledTimes(2);
  });
});
```

### 2. 集成测试

```javascript
// 集成测试示例
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductionModule from '../ProductionModule';

describe('ProductionModule Integration', () => {
  test('应该正确集成所有生产相关组件', async () => {
    render(
      <BrowserRouter>
        <ProductionModule />
      </BrowserRouter>
    );

    // 验证各个子组件都正确渲染
    await waitFor(() => {
      expect(screen.getByText('生产计划')).toBeInTheDocument();
      expect(screen.getByText('生产任务')).toBeInTheDocument();
      expect(screen.getByText('工作报告')).toBeInTheDocument();
    });
  });
});
```

---

## 🚨 常见问题和解决方案

### 1. 数据格式不匹配

**问题**: API返回的数据格式与mock数据格式不一致

**解决方案**:
```javascript
// 在DataService中进行数据转换
const transformProductionPlanData = (apiData) => {
  return apiData.map(item => ({
    ...item,
    // 转换日期格式
    startDate: moment(item.start_date).format('YYYY-MM-DD'),
    endDate: moment(item.end_date).format('YYYY-MM-DD'),
    // 转换状态值
    status: item.plan_status,
    // 添加计算字段
    progress: item.completed_quantity / item.total_quantity * 100
  }));
};
```

### 2. 加载状态处理

**问题**: 用户体验不佳，加载时间过长

**解决方案**:
```javascript
// 使用骨架屏提升用户体验
const ProductionPlanComponent = () => {
  const { data, loading, error } = useDataService(
    () => DataService.getProductionPlans(),
    []
  );

  if (loading) {
    return (
      <Card title="生产计划">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  // 其他渲染逻辑...
};
```

### 3. 错误边界处理

**问题**: 组件错误导致整个页面崩溃

**解决方案**:
```javascript
// 创建错误边界组件
class DataErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          type="error"
          message="组件加载失败"
          description="请刷新页面重试，如果问题持续存在请联系技术支持"
          action={
            <Button onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

// 使用错误边界包装组件
const SafeProductionPlanComponent = () => (
  <DataErrorBoundary>
    <ProductionPlanComponent />
  </DataErrorBoundary>
);
```

---

## 📈 性能优化建议

### 1. 组件级缓存

```javascript
// 使用React.memo优化组件渲染
const ProductionPlanComponent = React.memo(({ filters }) => {
  const { data, loading, error } = useDataService(
    () => DataService.getProductionPlans(filters),
    [filters]
  );

  return (
    // 组件内容
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters);
});
```

### 2. 虚拟滚动

```javascript
// 对于大量数据的列表，使用虚拟滚动
import { FixedSizeList as List } from 'react-window';

const VirtualizedProductionList = ({ data }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductionPlanItem data={data[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={data.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 3. 懒加载

```javascript
// 使用React.lazy实现组件懒加载
const LazyProductionReports = React.lazy(() => 
  import('./ProductionReports')
);

const ProductionModule = () => (
  <div>
    <Suspense fallback={<Spin size="large" />}>
      <LazyProductionReports />
    </Suspense>
  </div>
);
```

---

## 📚 相关文档

- [DataService使用指南](./DATA_SERVICE_GUIDE.md)
- [API接口文档](./API_REFERENCE.md)
- [useDataService Hook文档](./USE_DATA_SERVICE_HOOK.md)
- [前端开发规范](./FRONTEND_DEVELOPMENT.md)

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-12  
**维护团队**: MES开发组  
**联系方式**: dev-team@mes-system.com