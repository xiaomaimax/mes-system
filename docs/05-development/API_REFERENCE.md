# API接口文档

## 📋 概述

本文档记录了MES系统中所有的RESTful API接口，包括在Mock数据到数据库集成项目中新增和更新的接口。

**基础URL**: `http://localhost:3001/api`  
**API版本**: v1.0  
**认证方式**: JWT Bearer Token  
**数据格式**: JSON  

---

## 🔐 认证接口

### 健康检查
```http
GET /api/health
```

**描述**: 检查服务器运行状态

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### 用户登录
```http
POST /api/auth/login
```

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "administrator"
    }
  }
}
```

---

## 🏭 生产模块API

### 获取生产计划列表
```http
GET /api/production/plans
```

**查询参数**:
- `page` (number, 可选): 页码，默认为1
- `pageSize` (number, 可选): 每页数量，默认为10
- `status` (string, 可选): 状态筛选 (`pending`, `in_progress`, `completed`)
- `sort` (string, 可选): 排序字段，默认为`-created_at`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "planCode": "PLAN-2026-001",
        "productName": "产品A",
        "quantity": 1000,
        "status": "in_progress",
        "startDate": "2026-01-10",
        "endDate": "2026-01-15",
        "progress": 65.5,
        "createdAt": "2026-01-10T08:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

### 获取生产任务列表
```http
GET /api/production/tasks
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `planId` (number, 可选): 生产计划ID筛选
- `status` (string, 可选): 任务状态筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "taskCode": "TASK-2026-001",
        "planId": 1,
        "workstation": "工位A",
        "operator": "张三",
        "quantity": 100,
        "completedQuantity": 65,
        "status": "in_progress",
        "startTime": "2026-01-12T08:00:00.000Z",
        "estimatedEndTime": "2026-01-12T16:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取工作报告列表
```http
GET /api/production/work-reports
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `dateFrom` (string, 可选): 开始日期 (YYYY-MM-DD)
- `dateTo` (string, 可选): 结束日期 (YYYY-MM-DD)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "reportDate": "2026-01-12",
        "shift": "白班",
        "workstation": "工位A",
        "operator": "张三",
        "plannedQuantity": 100,
        "actualQuantity": 95,
        "qualifiedQuantity": 92,
        "defectQuantity": 3,
        "efficiency": 95.0,
        "createdAt": "2026-01-12T16:30:00.000Z"
      }
    ],
    "total": 30,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## ⚙️ 设备模块API

### 获取设备列表
```http
GET /api/equipment
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `status` (string, 可选): 设备状态 (`running`, `idle`, `maintenance`, `fault`)
- `type` (string, 可选): 设备类型筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "equipmentCode": "EQ-001",
        "equipmentName": "注塑机A",
        "type": "injection_molding",
        "status": "running",
        "location": "车间A",
        "model": "XYZ-2000",
        "manufacturer": "制造商A",
        "installDate": "2025-06-01",
        "lastMaintenanceDate": "2026-01-01",
        "nextMaintenanceDate": "2026-04-01",
        "efficiency": 85.5,
        "runningHours": 2400
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取模具列表
```http
GET /api/equipment/molds
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `status` (string, 可选): 模具状态 (`available`, `in_use`, `maintenance`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "moldCode": "MOLD-001",
        "moldName": "产品A模具",
        "status": "in_use",
        "cavities": 4,
        "material": "钢材",
        "weight": 500.5,
        "currentEquipment": "EQ-001",
        "totalShots": 50000,
        "maxShots": 100000,
        "lastMaintenanceDate": "2025-12-15",
        "nextMaintenanceDate": "2026-03-15"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取设备维护记录
```http
GET /api/equipment/maintenance
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `equipmentId` (number, 可选): 设备ID筛选
- `type` (string, 可选): 维护类型 (`preventive`, `corrective`, `emergency`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "equipmentId": 1,
        "equipmentName": "注塑机A",
        "type": "preventive",
        "description": "定期保养",
        "maintenanceDate": "2026-01-01",
        "duration": 4,
        "cost": 1500.00,
        "technician": "李四",
        "status": "completed",
        "notes": "更换了滤芯和润滑油"
      }
    ],
    "total": 40,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 🔍 质量模块API

### 获取质量检验记录
```http
GET /api/quality/inspections
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `type` (string, 可选): 检验类型 (`IQC`, `PQC`, `FQC`, `OQC`)
- `result` (string, 可选): 检验结果 (`pass`, `fail`, `pending`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "inspectionCode": "QC-2026-001",
        "type": "PQC",
        "productName": "产品A",
        "batchNumber": "BATCH-001",
        "inspectionDate": "2026-01-12",
        "inspector": "王五",
        "sampleSize": 50,
        "passedQuantity": 48,
        "failedQuantity": 2,
        "result": "pass",
        "defectRate": 4.0,
        "notes": "整体质量良好"
      }
    ],
    "total": 60,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取缺陷记录
```http
GET /api/quality/defects
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `severity` (string, 可选): 严重程度 (`low`, `medium`, `high`, `critical`)
- `status` (string, 可选): 处理状态 (`open`, `in_progress`, `resolved`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "defectCode": "DEF-2026-001",
        "productName": "产品A",
        "defectType": "尺寸偏差",
        "severity": "medium",
        "description": "长度超出公差范围",
        "foundDate": "2026-01-12",
        "foundBy": "王五",
        "rootCause": "设备参数偏移",
        "correctiveAction": "调整设备参数",
        "status": "resolved",
        "resolvedDate": "2026-01-12",
        "resolvedBy": "张三"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取检验标准
```http
GET /api/quality/standards
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "standardCode": "STD-001",
        "standardName": "产品A检验标准",
        "productType": "塑料制品",
        "version": "v1.2",
        "effectiveDate": "2026-01-01",
        "parameters": [
          {
            "name": "长度",
            "unit": "mm",
            "minValue": 99.5,
            "maxValue": 100.5,
            "targetValue": 100.0
          },
          {
            "name": "重量",
            "unit": "g",
            "minValue": 49.5,
            "maxValue": 50.5,
            "targetValue": 50.0
          }
        ]
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 📦 库存模块API

### 获取库存列表
```http
GET /api/inventory
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `category` (string, 可选): 物料类别
- `lowStock` (boolean, 可选): 是否只显示低库存物料

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "materialCode": "MAT-001",
        "materialName": "ABS塑料粒",
        "category": "原材料",
        "unit": "kg",
        "currentStock": 500.5,
        "minStock": 100.0,
        "maxStock": 1000.0,
        "unitPrice": 12.50,
        "totalValue": 6256.25,
        "location": "仓库A-01",
        "supplier": "供应商A",
        "lastUpdateDate": "2026-01-12T10:30:00.000Z"
      }
    ],
    "total": 80,
    "page": 1,
    "pageSize": 10
  }
}
```

### 获取出入库记录
```http
GET /api/inventory/transactions
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `type` (string, 可选): 交易类型 (`in`, `out`)
- `dateFrom` (string, 可选): 开始日期
- `dateTo` (string, 可选): 结束日期

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "transactionCode": "TXN-2026-001",
        "type": "in",
        "materialCode": "MAT-001",
        "materialName": "ABS塑料粒",
        "quantity": 100.0,
        "unit": "kg",
        "unitPrice": 12.50,
        "totalAmount": 1250.00,
        "transactionDate": "2026-01-12",
        "operator": "赵六",
        "supplier": "供应商A",
        "notes": "采购入库"
      }
    ],
    "total": 120,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 📊 报表模块API

### 获取生产报表
```http
GET /api/reports/production
```

**查询参数**:
- `dateFrom` (string, 必需): 开始日期 (YYYY-MM-DD)
- `dateTo` (string, 必需): 结束日期 (YYYY-MM-DD)
- `groupBy` (string, 可选): 分组方式 (`day`, `week`, `month`)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPlannedQuantity": 5000,
      "totalActualQuantity": 4750,
      "totalQualifiedQuantity": 4560,
      "overallEfficiency": 95.0,
      "defectRate": 4.0
    },
    "details": [
      {
        "date": "2026-01-12",
        "plannedQuantity": 500,
        "actualQuantity": 475,
        "qualifiedQuantity": 456,
        "efficiency": 95.0,
        "defectRate": 4.0
      }
    ]
  }
}
```

### 获取质量报表
```http
GET /api/reports/quality
```

**查询参数**:
- `dateFrom` (string, 必需): 开始日期
- `dateTo` (string, 必需): 结束日期
- `type` (string, 可选): 检验类型筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInspections": 100,
      "passedInspections": 95,
      "failedInspections": 5,
      "passRate": 95.0,
      "averageDefectRate": 2.5
    },
    "byType": [
      {
        "type": "IQC",
        "count": 20,
        "passRate": 98.0
      },
      {
        "type": "PQC",
        "count": 50,
        "passRate": 94.0
      }
    ]
  }
}
```

### 获取设备报表
```http
GET /api/reports/equipment
```

**查询参数**:
- `dateFrom` (string, 必需): 开始日期
- `dateTo` (string, 必需): 结束日期
- `equipmentId` (number, 可选): 设备ID筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEquipment": 15,
      "runningEquipment": 12,
      "idleEquipment": 2,
      "faultEquipment": 1,
      "averageEfficiency": 85.5,
      "totalRunningHours": 2880
    },
    "details": [
      {
        "equipmentId": 1,
        "equipmentName": "注塑机A",
        "runningHours": 192,
        "efficiency": 85.5,
        "faultCount": 2,
        "maintenanceCount": 1
      }
    ]
  }
}
```

---

## 📅 调度模块API

### 获取调度计划
```http
GET /api/scheduling/plans
```

**查询参数**:
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量
- `dateFrom` (string, 可选): 开始日期
- `dateTo` (string, 可选): 结束日期

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "planCode": "SCH-2026-001",
        "productName": "产品A",
        "quantity": 1000,
        "equipmentId": 1,
        "equipmentName": "注塑机A",
        "moldId": 1,
        "moldName": "产品A模具",
        "scheduledStartTime": "2026-01-13T08:00:00.000Z",
        "scheduledEndTime": "2026-01-13T16:00:00.000Z",
        "priority": "high",
        "status": "scheduled"
      }
    ],
    "total": 30,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 🔧 主数据API

### 获取设备主数据
```http
GET /api/master-data/equipment
```

### 获取物料主数据
```http
GET /api/master-data/materials
```

### 获取模具主数据
```http
GET /api/master-data/molds
```

---

## ❌ 错误响应格式

所有API在发生错误时都会返回统一的错误格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  },
  "data": null
}
```

### 常见错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 请求参数验证失败 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `DATABASE_ERROR` | 500 | 数据库操作失败 |

---

## 📝 使用示例

### JavaScript/Axios示例

```javascript
// 使用DataService调用API
import DataService from '../services/DataService';

// 获取生产计划
const getProductionPlans = async () => {
  try {
    const response = await DataService.getProductionPlans({
      page: 1,
      pageSize: 10,
      status: 'in_progress'
    });
    
    if (response.success) {
      console.log('生产计划数据:', response.data);
    } else {
      console.error('获取失败:', response.error.message);
    }
  } catch (error) {
    console.error('请求异常:', error);
  }
};

// 强制刷新缓存
const refreshData = async () => {
  const response = await DataService.getProductionPlans({}, true);
  return response;
};
```

### cURL示例

```bash
# 获取生产计划
curl -X GET "http://localhost:3001/api/production/plans?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 获取设备列表
curl -X GET "http://localhost:3001/api/equipment?status=running" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🚀 性能优化

### 缓存机制
- 所有GET请求都支持缓存
- 缓存时间根据数据类型配置：
  - 生产数据：3分钟
  - 设备数据：10分钟
  - 质量数据：2分钟
  - 库存数据：1分钟
  - 报表数据：5分钟

### 分页优化
- 默认每页10条记录
- 最大每页100条记录
- 支持基于游标的分页（大数据量场景）

### 查询优化
- 支持字段筛选：`?fields=id,name,status`
- 支持排序：`?sort=-created_at,name`
- 支持搜索：`?search=关键词`

---

## 📚 相关文档

- [DataService使用指南](./DATA_SERVICE_GUIDE.md)
- [前端组件开发指南](./FRONTEND_DEVELOPMENT.md)
- [数据库设计文档](./DATABASE_DESIGN.md)
- [系统架构文档](../03-architecture/SYSTEM_ARCHITECTURE.md)

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-12  
**维护团队**: MES开发组  
**联系方式**: dev-team@mes-system.com