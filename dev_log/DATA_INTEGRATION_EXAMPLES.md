# MES系统数据集成示例

## 📋 概述

本文档展示如何在MES系统的各个模块中集成和使用模拟测试数据，让系统演示更加真实和完整。

## 🔧 集成步骤

### 1. 导入数据服务
```javascript
import { DataService, DataFormatter, DataCalculator } from '../utils/dataUtils';
```

### 2. 在组件中使用数据
```javascript
const [data, setData] = useState({});

useEffect(() => {
  const loadData = () => {
    setData({
      // 根据模块需求加载相应数据
      plans: DataService.getProductionPlans(),
      equipment: DataService.getEquipment(),
      // ... 其他数据
    });
  };
  
  loadData();
}, []);
```

## 📊 各模块集成示例

### 1. 生产管理模块

#### 数据加载
```javascript
const [productionData, setProductionData] = useState({
  plans: [],
  tasks: [],
  reports: [],
  equipment: [],
  employees: []
});

useEffect(() => {
  setProductionData({
    plans: DataService.getProductionPlans(),
    tasks: DataService.getProductionTasks(),
    reports: DataService.getWorkReports(),
    equipment: DataService.getEquipment(),
    employees: DataService.getEmployees()
  });
}, []);
```

#### 统计计算
```javascript
const calculateStats = () => {
  const { plans, tasks } = productionData;
  
  const totalPlans = plans.length;
  const completedPlans = plans.filter(p => p.status === '已完成').length;
  const totalPlanQty = plans.reduce((sum, p) => sum + p.planQty, 0);
  const totalActualQty = plans.reduce((sum, p) => sum + p.actualQty, 0);
  const overallEfficiency = DataCalculator.calculateEfficiency(totalActualQty, totalPlanQty);
  
  return { totalPlans, completedPlans, totalPlanQty, totalActualQty, overallEfficiency };
};
```

#### 表格展示
```javascript
<Table
  dataSource={productionData.plans}
  columns={[
    { title: '计划编号', dataIndex: 'id', key: 'id' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '生产线', dataIndex: 'lineName', key: 'lineName' },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = DataFormatter.formatStatus(status);
        return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
      }
    }
  ]}
/>
```

### 2. 质量管理模块

#### 数据加载
```javascript
const [qualityData, setQualityData] = useState({
  iqcInspections: [],
  pqcInspections: [],
  fqcInspections: [],
  defectRecords: []
});

useEffect(() => {
  setQualityData({
    iqcInspections: DataService.getIQCInspections(),
    pqcInspections: DataService.getPQCInspections(),
    fqcInspections: DataService.getFQCInspections(),
    defectRecords: DataService.getDefectRecords()
  });
}, []);
```

#### 质量指标计算
```javascript
const calculateQualityMetrics = () => {
  const { iqcInspections, pqcInspections, fqcInspections } = qualityData;
  
  const iqcPassRate = DataCalculator.calculateAverage(
    iqcInspections.map(item => item.passRate)
  );
  const pqcPassRate = DataCalculator.calculateAverage(
    pqcInspections.map(item => item.passRate)
  );
  const fqcPassRate = DataCalculator.calculateAverage(
    fqcInspections.map(item => item.passRate)
  );
  
  return { iqcPassRate, pqcPassRate, fqcPassRate };
};
```

### 3. 设备管理模块

#### 数据加载
```javascript
const [equipmentData, setEquipmentData] = useState({
  equipment: [],
  maintenanceRecords: [],
  faultRecords: [],
  inspectionRecords: []
});

useEffect(() => {
  setEquipmentData({
    equipment: DataService.getEquipment(),
    maintenanceRecords: DataService.getMaintenanceRecords(),
    faultRecords: DataService.getFaultRecords(),
    inspectionRecords: DataService.getInspectionRecords()
  });
}, []);
```

#### 设备状态统计
```javascript
const calculateEquipmentStats = () => {
  const { equipment, faultRecords } = equipmentData;
  
  const totalEquipment = equipment.length;
  const runningEquipment = equipment.filter(e => e.status === '运行中').length;
  const maintenanceEquipment = equipment.filter(e => e.status === '维护中').length;
  const avgUtilization = DataCalculator.calculateAverage(
    equipment.map(e => e.utilization)
  );
  const totalFaults = faultRecords.length;
  
  return { totalEquipment, runningEquipment, maintenanceEquipment, avgUtilization, totalFaults };
};
```

### 4. 库存管理模块

#### 数据加载
```javascript
const [inventoryData, setInventoryData] = useState({
  stockInfo: [],
  inboundRecords: [],
  outboundRecords: [],
  materials: []
});

useEffect(() => {
  setInventoryData({
    stockInfo: DataService.getStockInfo(),
    inboundRecords: DataService.getInboundRecords(),
    outboundRecords: DataService.getOutboundRecords(),
    materials: DataService.getMaterials()
  });
}, []);
```

#### 库存预警
```javascript
const getStockAlerts = () => {
  const { stockInfo } = inventoryData;
  
  return stockInfo.filter(stock => {
    const stockRate = stock.currentStock / stock.safetyStock;
    return stockRate < 1; // 低于安全库存
  });
};
```

### 5. 人员管理模块

#### 数据加载
```javascript
const [personnelData, setPersonnelData] = useState({
  employees: [],
  attendanceRecords: [],
  trainingRecords: [],
  performanceRecords: []
});

useEffect(() => {
  setPersonnelData({
    employees: DataService.getEmployees(),
    attendanceRecords: DataService.getAttendanceRecords(),
    trainingRecords: DataService.getTrainingRecords(),
    performanceRecords: DataService.getPerformanceRecords()
  });
}, []);
```

#### 考勤统计
```javascript
const calculateAttendanceStats = () => {
  const { attendanceRecords, employees } = personnelData;
  
  const totalEmployees = employees.length;
  const presentEmployees = attendanceRecords.filter(r => r.status === '正常').length;
  const lateEmployees = attendanceRecords.filter(r => r.status === '迟到').length;
  const attendanceRate = DataCalculator.calculatePassRate(presentEmployees, totalEmployees);
  
  return { totalEmployees, presentEmployees, lateEmployees, attendanceRate };
};
```

## 🎨 数据可视化示例

### 1. 趋势图表
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);
```

### 2. 饼图统计
```javascript
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StatusPieChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

### 3. 柱状图对比
```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ComparisonBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="actual" fill="#8884d8" />
      <Bar dataKey="target" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
);
```

## 📱 实时数据更新

### 1. 定时刷新
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    // 模拟实时数据更新
    const updatedData = DataService.getProductionPlans();
    setProductionData(prev => ({
      ...prev,
      plans: updatedData
    }));
  }, 30000); // 30秒刷新一次

  return () => clearInterval(interval);
}, []);
```

### 2. 手动刷新
```javascript
const handleRefresh = () => {
  setLoading(true);
  
  setTimeout(() => {
    const newData = {
      plans: DataService.getProductionPlans(),
      tasks: DataService.getProductionTasks(),
      // ... 其他数据
    };
    
    setProductionData(newData);
    setLoading(false);
    message.success('数据刷新成功');
  }, 1000);
};
```

## 🔍 数据筛选和搜索

### 1. 状态筛选
```javascript
const [statusFilter, setStatusFilter] = useState('all');

const filteredData = useMemo(() => {
  if (statusFilter === 'all') return productionData.plans;
  return productionData.plans.filter(plan => plan.status === statusFilter);
}, [productionData.plans, statusFilter]);
```

### 2. 日期范围筛选
```javascript
const [dateRange, setDateRange] = useState([]);

const filteredByDate = useMemo(() => {
  if (!dateRange.length) return data;
  
  const [startDate, endDate] = dateRange;
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}, [data, dateRange]);
```

## 📊 性能优化建议

### 1. 数据分页
```javascript
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0
});

const paginatedData = useMemo(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return data.slice(start, end);
}, [data, pagination]);
```

### 2. 虚拟滚动
```javascript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {/* 渲染单个项目 */}
        {data[index].name}
      </div>
    )}
  </List>
);
```

### 3. 数据缓存
```javascript
const [cache, setCache] = useState(new Map());

const getCachedData = (key) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = DataService.getDataByKey(key);
  setCache(prev => new Map(prev).set(key, data));
  return data;
};
```

## 🎯 最佳实践

1. **数据结构一致性**: 确保所有模块使用统一的数据结构
2. **错误处理**: 添加数据加载失败的处理逻辑
3. **加载状态**: 显示数据加载中的状态提示
4. **数据验证**: 对关键数据进行有效性验证
5. **性能监控**: 监控数据加载和渲染性能

通过这些示例和最佳实践，可以在MES系统的各个模块中有效地集成和使用模拟测试数据，提供完整真实的系统演示体验。