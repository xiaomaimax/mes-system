# DataService使用指南

## 📋 概述

DataService是MES系统的统一前端数据服务层，负责处理所有与后端API的交互。它提供了缓存机制、错误处理、加载状态管理等功能，是前端组件获取数据的标准方式。

**文件位置**: `client/src/services/DataService.js`  
**设计模式**: 静态类方法  
**缓存策略**: 内存缓存 + TTL过期机制  

---

## 🚀 快速开始

### 基本使用

```javascript
import DataService from '../services/DataService';

// 获取生产计划数据
const fetchProductionPlans = async () => {
  const response = await DataService.getProductionPlans({
    page: 1,
    pageSize: 10,
    status: 'in_progress'
  });
  
  if (response.success) {
    console.log('数据:', response.data);
  } else {
    console.error('错误:', response.error.message);
  }
};
```

### 在React组件中使用

```javascript
import React, { useState, useEffect } from 'react';
import { Spin, Alert, Table } from 'antd';
import DataService from '../services/DataService';

const ProductionPlanList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DataService.getProductionPlans();
      if (response.success) {
        setData(response.data.items || []);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error} />;

  return <Table dataSource={data} />;
};
```

---

## 🔧 核心功能

### 1. 缓存机制

DataService内置了智能缓存系统，可以显著提升应用性能：

```javascript
// 第一次调用 - 从API获取数据并缓存
const data1 = await DataService.getProductionPlans();

// 第二次调用 - 从缓存获取数据（如果未过期）
const data2 = await DataService.getProductionPlans();

// 强制刷新缓存
const freshData = await DataService.getProductionPlans({}, true);
```

#### 缓存配置

```javascript
// 各模块的缓存过期时间
const cacheConfig = {
  production: 3 * 60 * 1000,    // 生产数据：3分钟
  equipment: 10 * 60 * 1000,    // 设备数据：10分钟
  quality: 2 * 60 * 1000,       // 质量数据：2分钟
  inventory: 1 * 60 * 1000,     // 库存数据：1分钟
  reports: 5 * 60 * 1000        // 报表数据：5分钟
};
```

#### 缓存管理

```javascript
// 清除特定模块的缓存
DataService.clearModuleCache('production');

// 清除所有缓存
DataService.clearAllCache();

// 获取缓存统计信息
const stats = DataService.getCacheStats();
console.log('缓存统计:', stats);
```

### 2. 错误处理

DataService提供统一的错误处理机制：

```javascript
const handleApiCall = async () => {
  const response = await DataService.getProductionPlans();
  
  if (!response.success) {
    // 统一的错误格式
    const { code, message } = response.error;
    
    switch (code) {
      case 'UNAUTHORIZED':
        // 处理未授权错误
        redirectToLogin();
        break;
      case 'VALIDATION_ERROR':
        // 处理参数验证错误
        showValidationError(message);
        break;
      default:
        // 处理其他错误
        showGenericError(message);
    }
  }
};
```

### 3. 数据验证

DataService提供数据完整性验证功能：

```javascript
// 验证API响应数据的完整性
const isValid = DataService.validateDataIntegrity(
  response.data.items,
  ['id', 'name', 'status'] // 必需字段
);

// 验证分页信息的一致性
const isPaginationValid = DataService.validatePaginationConsistency(
  response.data.pagination,
  response.data.items
);
```

---

## 📚 API方法详解

### 生产模块

#### getProductionPlans(params, forceRefresh)
获取生产计划列表

**参数**:
- `params` (Object): 查询参数
  - `page` (number): 页码，默认1
  - `pageSize` (number): 每页数量，默认10
  - `status` (string): 状态筛选
  - `sort` (string): 排序字段
- `forceRefresh` (boolean): 是否强制刷新缓存，默认false

**返回值**:
```javascript
{
  success: true,
  data: {
    items: [...],
    total: 100,
    page: 1,
    pageSize: 10
  }
}
```

#### getProductionTasks(params, forceRefresh)
获取生产任务列表

#### getWorkReports(params, forceRefresh)
获取工作报告列表

### 设备模块

#### getEquipment(params, forceRefresh)
获取设备列表

#### getMolds(params, forceRefresh)
获取模具列表

#### getEquipmentMaintenance(params, forceRefresh)
获取设备维护记录

### 质量模块

#### getQualityInspections(params, forceRefresh)
获取质量检验记录

#### getDefectRecords(params, forceRefresh)
获取缺陷记录

#### getInspectionStandards(params, forceRefresh)
获取检验标准

### 库存模块

#### getInventory(params, forceRefresh)
获取库存列表

#### getInventoryTransactions(params, forceRefresh)
获取出入库记录

#### getLocationManagement(params, forceRefresh)
获取库位管理数据

### 报表模块

#### getProductionReports(params, forceRefresh)
获取生产报表数据

#### getQualityReports(params, forceRefresh)
获取质量报表数据

#### getEquipmentReports(params, forceRefresh)
获取设备报表数据

---

## 🎯 最佳实践

### 1. 组件迁移模式

从mock数据迁移到DataService的标准模式：

```javascript
// 迁移前 - 使用mock数据
import { productionData } from '../data/mockData';

const OldComponent = () => {
  const [data, setData] = useState(productionData.plans);
  
  return <div>{/* 渲染数据 */}</div>;
};

// 迁移后 - 使用DataService
import DataService from '../services/DataService';
import { useDataService } from '../hooks/useDataService';

const NewComponent = () => {
  const { data, loading, error, refetch } = useDataService(
    () => DataService.getProductionPlans(),
    []
  );
  
  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  
  return <div>{/* 渲染数据 */}</div>;
};
```

### 2. 使用useDataService Hook

推荐使用自定义Hook来简化数据获取：

```javascript
import { useDataService } from '../hooks/useDataService';

const MyComponent = () => {
  // 基本用法
  const { data, loading, error, refetch } = useDataService(
    () => DataService.getProductionPlans(),
    [] // 依赖数组
  );
  
  // 带参数的用法
  const [params, setParams] = useState({ page: 1, pageSize: 10 });
  const { data: pagedData } = useDataService(
    () => DataService.getProductionPlans(params),
    [params] // 当params变化时重新获取数据
  );
  
  return (
    <div>
      {loading && <Spin />}
      {error && <Alert type="error" message={error} />}
      {data && <Table dataSource={data.items} />}
      <Button onClick={refetch}>刷新</Button>
    </div>
  );
};
```

### 3. 错误处理最佳实践

```javascript
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState(null);
  
  const handleApiError = (error) => {
    // 记录错误日志
    console.error('API调用失败:', error);
    
    // 根据错误类型显示不同的提示
    if (error.code === 'NETWORK_ERROR') {
      setError('网络连接失败，请检查网络设置');
    } else if (error.code === 'UNAUTHORIZED') {
      setError('登录已过期，请重新登录');
      // 跳转到登录页面
      window.location.href = '/login';
    } else {
      setError(error.message || '数据加载失败');
    }
  };
  
  const fetchData = async () => {
    try {
      const response = await DataService.getProductionPlans();
      if (!response.success) {
        handleApiError(response.error);
      }
    } catch (error) {
      handleApiError({ code: 'NETWORK_ERROR', message: '网络请求失败' });
    }
  };
  
  return (
    <div>
      {error && (
        <Alert 
          type="error" 
          message={error}
          action={<Button onClick={fetchData}>重试</Button>}
          closable
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};
```

### 4. 性能优化技巧

```javascript
// 1. 合理使用缓存
const OptimizedComponent = () => {
  // 对于不经常变化的数据，可以延长缓存时间
  const { data: masterData } = useDataService(
    () => DataService.getEquipment(), // 设备数据缓存10分钟
    []
  );
  
  // 对于实时性要求高的数据，可以强制刷新
  const refreshRealTimeData = () => {
    DataService.getInventory({}, true); // 强制刷新库存数据
  };
};

// 2. 分页数据处理
const PaginatedComponent = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  
  const { data, loading } = useDataService(
    () => DataService.getProductionPlans({
      page: pagination.page,
      pageSize: pagination.pageSize
    }),
    [pagination.page, pagination.pageSize]
  );
  
  useEffect(() => {
    if (data?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
    }
  }, [data]);
  
  return (
    <Table
      dataSource={data?.items}
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page, pageSize) => {
          setPagination({ page, pageSize, total: pagination.total });
        }
      }}
    />
  );
};

// 3. 条件查询优化
const SearchableComponent = () => {
  const [searchParams, setSearchParams] = useState({});
  const [debouncedParams, setDebouncedParams] = useState({});
  
  // 使用防抖避免频繁请求
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(searchParams);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchParams]);
  
  const { data, loading } = useDataService(
    () => DataService.getProductionPlans(debouncedParams),
    [debouncedParams]
  );
  
  return (
    <div>
      <Input
        placeholder="搜索..."
        onChange={(e) => setSearchParams({ search: e.target.value })}
      />
      <Table dataSource={data?.items} loading={loading} />
    </div>
  );
};
```

---

## 🔍 调试和监控

### 1. 开启调试模式

```javascript
// 在开发环境中开启详细日志
if (process.env.NODE_ENV === 'development') {
  // 监听所有API调用
  const originalCall = DataService._cachedApiCall;
  DataService._cachedApiCall = async function(...args) {
    console.log('API调用:', args[0], args[1], args[3]);
    const result = await originalCall.apply(this, args);
    console.log('API响应:', result);
    return result;
  };
}
```

### 2. 缓存监控

```javascript
// 定期检查缓存状态
const monitorCache = () => {
  const stats = DataService.getCacheStats();
  console.log('缓存统计:', {
    总数: stats.total,
    有效: stats.valid,
    过期: stats.expired,
    各模块: stats.modules
  });
};

// 每分钟检查一次缓存状态
setInterval(monitorCache, 60000);
```

### 3. 性能监控

```javascript
// 监控API响应时间
const monitorApiPerformance = async (apiCall) => {
  const startTime = performance.now();
  const result = await apiCall();
  const endTime = performance.now();
  
  console.log(`API响应时间: ${(endTime - startTime).toFixed(2)}ms`);
  
  // 如果响应时间过长，记录警告
  if (endTime - startTime > 2000) {
    console.warn('API响应时间过长，建议优化');
  }
  
  return result;
};

// 使用示例
const data = await monitorApiPerformance(
  () => DataService.getProductionPlans()
);
```

---

## 🚨 常见问题和解决方案

### 1. 缓存数据不一致

**问题**: 数据更新后，前端显示的还是旧数据

**解决方案**:
```javascript
// 在数据更新操作后清除相关缓存
const updateProductionPlan = async (planData) => {
  // 更新数据
  await updatePlanAPI(planData);
  
  // 清除相关缓存
  DataService.clearModuleCache('production');
  
  // 重新获取数据
  const freshData = await DataService.getProductionPlans({}, true);
};
```

### 2. 内存泄漏

**问题**: 长时间运行后内存占用过高

**解决方案**:
```javascript
// 定期清理过期缓存
const cleanupCache = () => {
  const stats = DataService.getCacheStats();
  if (stats.expired > 100) {
    // 如果过期缓存过多，清理所有缓存
    DataService.clearAllCache();
    console.log('已清理过期缓存');
  }
};

// 每10分钟清理一次
setInterval(cleanupCache, 10 * 60 * 1000);
```

### 3. 网络错误处理

**问题**: 网络不稳定时频繁报错

**解决方案**:
```javascript
// 实现重试机制
const apiCallWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// 使用示例
const data = await apiCallWithRetry(
  () => DataService.getProductionPlans()
);
```

---

## 📈 性能优化建议

### 1. 缓存策略优化

```javascript
// 根据数据特性调整缓存时间
const optimizedCacheConfig = {
  // 主数据缓存时间较长
  masterData: 30 * 60 * 1000,  // 30分钟
  
  // 实时数据缓存时间较短
  realTimeData: 30 * 1000,     // 30秒
  
  // 报表数据可以缓存较长时间
  reportData: 15 * 60 * 1000,  // 15分钟
};
```

### 2. 请求合并

```javascript
// 合并多个相关的API请求
const fetchDashboardData = async () => {
  const [plans, tasks, equipment] = await Promise.all([
    DataService.getProductionPlans(),
    DataService.getProductionTasks(),
    DataService.getEquipment()
  ]);
  
  return { plans, tasks, equipment };
};
```

### 3. 懒加载

```javascript
// 只在需要时加载数据
const LazyDataComponent = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  
  const { data, loading } = useDataService(
    () => shouldLoad ? DataService.getProductionPlans() : Promise.resolve(null),
    [shouldLoad]
  );
  
  return (
    <div>
      <Button onClick={() => setShouldLoad(true)}>
        加载数据
      </Button>
      {loading && <Spin />}
      {data && <Table dataSource={data.items} />}
    </div>
  );
};
```

---

## 📚 相关文档

- [API接口文档](./API_REFERENCE.md)
- [前端组件开发指南](./FRONTEND_DEVELOPMENT.md)
- [useDataService Hook文档](./USE_DATA_SERVICE_HOOK.md)
- [系统架构文档](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-12  
**维护团队**: MES开发组  
**联系方式**: dev-team@mes-system.com