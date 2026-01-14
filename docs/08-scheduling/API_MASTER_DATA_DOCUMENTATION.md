# Unified Master Data API Documentation

## Overview

This document describes the unified master data API endpoints that integrate equipment, material, and mold data across the MES system. These APIs provide a single source of truth for master data while maintaining scheduling-specific extensions.

**Base URL:** `/api/master-data`

**Authentication:** All endpoints require Bearer token authentication via `Authorization` header.

## Table of Contents

1. [Equipment API](#equipment-api)
2. [Material API](#material-api)
3. [Mold API](#mold-api)
4. [Cascade Delete API](#cascade-delete-api)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Equipment API

### GET /equipment

Retrieve unified equipment data with scheduling extensions.

**Requirements:** 6.1, 6.5, 6.6

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Records per page (max: 100) |
| status | string | - | Filter by status: `active`, `maintenance`, `idle`, `offline` |
| equipment_type | string | - | Filter by equipment type |
| is_active | boolean | - | Filter by active status |
| is_available_for_scheduling | boolean | - | Filter by scheduling availability |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "equipment_code": "EQ-001",
      "equipment_name": "Injection Molding Machine A1",
      "equipment_type": "injection_molding",
      "status": "active",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "scheduling": {
        "capacity_per_hour": 100,
        "scheduling_weight": 80,
        "is_available_for_scheduling": true
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

---

### GET /equipment/:id

Retrieve single equipment detail with scheduling extensions.

**Requirements:** 6.1

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "equipment_code": "EQ-001",
    "equipment_name": "Injection Molding Machine A1",
    "equipment_type": "injection_molding",
    "status": "active",
    "is_active": true,
    "scheduling": {
      "capacity_per_hour": 100,
      "scheduling_weight": 80,
      "is_available_for_scheduling": true
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Equipment not found
- `401 Unauthorized` - Missing or invalid authentication token

---

### PUT /equipment/:id/scheduling

Update equipment scheduling extension properties only (does not modify master data).

**Requirements:** 7.6

**Request Body:**

```json
{
  "capacity_per_hour": 120,
  "scheduling_weight": 85,
  "is_available_for_scheduling": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Equipment scheduling properties updated successfully",
  "data": {
    "equipment_id": 1,
    "scheduling": {
      "capacity_per_hour": 120,
      "scheduling_weight": 85,
      "is_available_for_scheduling": true
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Equipment not found
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid authentication token

---

## Material API

### GET /materials

Retrieve unified material data with scheduling extensions and relationship configurations.

**Requirements:** 6.2, 6.5, 6.6

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Records per page (max: 100) |
| status | string | - | Filter by status: `active`, `inactive` |
| material_type | string | - | Filter by material type |
| include_relations | boolean | true | Include device and mold relationships |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "material_code": "MAT-001",
      "material_name": "ABS Plastic Pellets",
      "material_type": "raw_material",
      "specifications": "Grade A",
      "unit": "kg",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "scheduling": {
        "default_device_id": 1,
        "default_mold_id": 1,
        "default_device": {
          "id": 1,
          "device_code": "DEV-001",
          "device_name": "Injection Machine A",
          "status": "normal"
        },
        "default_mold": {
          "id": 1,
          "mold_code": "MOLD-001",
          "mold_name": "Product A Mold",
          "status": "normal"
        },
        "device_relations": [
          {
            "device_id": 1,
            "device_code": "DEV-001",
            "device_name": "Injection Machine A",
            "device_status": "normal",
            "weight": 80
          }
        ],
        "mold_relations": [
          {
            "mold_id": 1,
            "mold_code": "MOLD-001",
            "mold_name": "Product A Mold",
            "mold_status": "normal",
            "weight": 70,
            "cycle_time": 30,
            "output_per_cycle": 100
          }
        ]
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

---

### GET /materials/:id

Retrieve single material detail with scheduling extensions and relationships.

**Requirements:** 6.2

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "material_code": "MAT-001",
    "material_name": "ABS Plastic Pellets",
    "material_type": "raw_material",
    "status": "active",
    "scheduling": {
      "default_device_id": 1,
      "default_mold_id": 1,
      "device_relations": [...],
      "mold_relations": [...]
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Material not found
- `401 Unauthorized` - Missing or invalid authentication token

---

### PUT /materials/:id/scheduling

Update material scheduling extension properties only.

**Requirements:** 7.6

**Request Body:**

```json
{
  "default_device_id": 2,
  "default_mold_id": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Material scheduling properties updated successfully",
  "data": {
    "material_id": 1,
    "scheduling": {
      "default_device_id": 2,
      "default_mold_id": 2
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Material not found
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid authentication token

---

## Mold API

### GET /molds

Retrieve unified mold data with equipment associations and scheduling extensions.

**Requirements:** 6.3, 6.5, 6.6

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Records per page (max: 100) |
| status | string | - | Filter by status: `normal`, `maintenance`, `idle`, `scrapped` |
| include_equipment | boolean | true | Include equipment association data |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "mold_code": "MOLD-001",
      "mold_name": "Product A Mold",
      "specifications": "Standard",
      "quantity": 5,
      "status": "normal",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "equipment_relations": [
        {
          "equipment_id": 1,
          "equipment_code": "EQ-001",
          "equipment_name": "Injection Molding Machine A1",
          "equipment_type": "injection_molding",
          "equipment_status": "active",
          "is_active": true,
          "is_primary": true
        }
      ],
      "scheduling": {
        "scheduling_weight": 70
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server error

---

### GET /molds/:id

Retrieve single mold detail with equipment associations.

**Requirements:** 6.3

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "mold_code": "MOLD-001",
    "mold_name": "Product A Mold",
    "status": "normal",
    "equipment_relations": [...],
    "scheduling": {
      "scheduling_weight": 70
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Mold not found
- `401 Unauthorized` - Missing or invalid authentication token

---

### PUT /molds/:id/scheduling

Update mold scheduling extension properties only.

**Requirements:** 7.6

**Request Body:**

```json
{
  "scheduling_weight": 75
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mold scheduling properties updated successfully",
  "data": {
    "mold_id": 1,
    "scheduling": {
      "scheduling_weight": 75
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Mold not found
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid authentication token

---

### POST /molds/:id/equipment

Create mold-equipment association.

**Requirements:** 2.4

**Request Body:**

```json
{
  "equipment_id": 1,
  "is_primary": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mold-equipment association created successfully",
  "data": {
    "id": 1,
    "mold_id": 1,
    "equipment_id": 1,
    "is_primary": true
  }
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Association already exists or invalid data
- `404 Not Found` - Mold or equipment not found
- `401 Unauthorized` - Missing or invalid authentication token

---

### DELETE /molds/:id/equipment/:equipmentId

Delete mold-equipment association.

**Response:**

```json
{
  "success": true,
  "message": "Mold-equipment association deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Association not found
- `401 Unauthorized` - Missing or invalid authentication token

---

## Cascade Delete API

### GET /equipment/:id/delete-preview

Preview equipment deletion impact (related data that will be deleted).

**Requirements:** 4.6

**Response:**

```json
{
  "success": true,
  "data": {
    "equipmentId": 1,
    "equipmentCode": "EQ-001",
    "equipmentName": "Injection Molding Machine A1",
    "relatedData": {
      "materialDeviceRelations": 3,
      "moldEquipmentRelations": 2,
      "schedulingExt": 1
    },
    "totalRelatedRecords": 6
  }
}
```

---

### DELETE /equipment/:id

Delete equipment and cascade delete all related data.

**Requirements:** 4.6

**Response:**

```json
{
  "success": true,
  "message": "Equipment and related data deleted successfully",
  "data": {
    "equipmentId": 1,
    "deletedRelations": {
      "materialDeviceRelations": 3,
      "moldEquipmentRelations": 2,
      "schedulingExt": 1
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Equipment not found
- `401 Unauthorized` - Missing or invalid authentication token

---

### GET /materials/:id/delete-preview

Preview material deletion impact.

**Requirements:** 4.5

**Response:**

```json
{
  "success": true,
  "data": {
    "materialId": 1,
    "materialCode": "MAT-001",
    "materialName": "ABS Plastic",
    "relatedData": {
      "materialDeviceRelations": 2,
      "materialMoldRelations": 3,
      "schedulingExt": 1
    },
    "totalRelatedRecords": 6
  }
}
```

---

### DELETE /materials/:id

Delete material and cascade delete all related data.

**Requirements:** 4.5

**Response:**

```json
{
  "success": true,
  "message": "Material and related data deleted successfully",
  "data": {
    "materialId": 1,
    "deletedRelations": {
      "materialDeviceRelations": 2,
      "materialMoldRelations": 3,
      "schedulingExt": 1
    }
  }
}
```

---

### GET /molds/:id/delete-preview

Preview mold deletion impact.

**Requirements:** 4.5, 4.6

**Response:**

```json
{
  "success": true,
  "data": {
    "moldId": 1,
    "moldCode": "MOLD-001",
    "moldName": "Product A Mold",
    "relatedData": {
      "materialMoldRelations": 2,
      "moldEquipmentRelations": 1,
      "schedulingExt": 1
    },
    "totalRelatedRecords": 4
  }
}
```

---

### DELETE /molds/:id

Delete mold and cascade delete all related data.

**Requirements:** 4.5, 4.6

**Response:**

```json
{
  "success": true,
  "message": "Mold and related data deleted successfully",
  "data": {
    "moldId": 1,
    "deletedRelations": {
      "materialMoldRelations": 2,
      "moldEquipmentRelations": 1,
      "schedulingExt": 1
    }
  }
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Error Codes:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Examples

### Example 1: Get Active Equipment for Scheduling

```bash
curl -X GET "http://localhost:3000/api/master-data/equipment?status=active&is_available_for_scheduling=true&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "equipment_code": "EQ-001",
      "equipment_name": "Injection Molding Machine A1",
      "status": "active",
      "scheduling": {
        "capacity_per_hour": 100,
        "scheduling_weight": 80,
        "is_available_for_scheduling": true
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### Example 2: Get Material with All Relationships

```bash
curl -X GET "http://localhost:3000/api/master-data/materials/1?include_relations=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "material_code": "MAT-001",
    "material_name": "ABS Plastic Pellets",
    "status": "active",
    "scheduling": {
      "default_device_id": 1,
      "default_mold_id": 1,
      "device_relations": [
        {
          "device_id": 1,
          "device_code": "DEV-001",
          "weight": 80
        }
      ],
      "mold_relations": [
        {
          "mold_id": 1,
          "mold_code": "MOLD-001",
          "weight": 70,
          "cycle_time": 30,
          "output_per_cycle": 100
        }
      ]
    }
  }
}
```

---

### Example 3: Update Equipment Scheduling Properties

```bash
curl -X PUT "http://localhost:3000/api/master-data/equipment/1/scheduling" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capacity_per_hour": 120,
    "scheduling_weight": 85,
    "is_available_for_scheduling": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Equipment scheduling properties updated successfully",
  "data": {
    "equipment_id": 1,
    "scheduling": {
      "capacity_per_hour": 120,
      "scheduling_weight": 85,
      "is_available_for_scheduling": true
    }
  }
}
```

---

### Example 4: Create Mold-Equipment Association

```bash
curl -X POST "http://localhost:3000/api/master-data/molds/1/equipment" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": 1,
    "is_primary": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Mold-equipment association created successfully",
  "data": {
    "id": 1,
    "mold_id": 1,
    "equipment_id": 1,
    "is_primary": true
  }
}
```

---

### Example 5: Preview and Delete Equipment

```bash
# First, preview what will be deleted
curl -X GET "http://localhost:3000/api/master-data/equipment/1/delete-preview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "equipmentId": 1,
    "equipmentCode": "EQ-001",
    "equipmentName": "Injection Molding Machine A1",
    "relatedData": {
      "materialDeviceRelations": 3,
      "moldEquipmentRelations": 2,
      "schedulingExt": 1
    },
    "totalRelatedRecords": 6
  }
}
```

```bash
# Then delete the equipment
curl -X DELETE "http://localhost:3000/api/master-data/equipment/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Equipment and related data deleted successfully",
  "data": {
    "equipmentId": 1,
    "deletedRelations": {
      "materialDeviceRelations": 3,
      "moldEquipmentRelations": 2,
      "schedulingExt": 1
    }
  }
}
```

---

## Integration Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination uses 1-based indexing
- Maximum limit per request is 100 records
- Scheduling extension properties are optional and can be null
- Cascade delete operations are atomic (all-or-nothing)
- Status filters are case-sensitive

---

## Requirements Mapping

| Requirement | Endpoints |
|------------|-----------|
| 6.1 | GET /equipment, GET /equipment/:id |
| 6.2 | GET /materials, GET /materials/:id |
| 6.3 | GET /molds, GET /molds/:id |
| 6.5 | All GET endpoints with filtering |
| 6.6 | All GET endpoints with pagination |
| 7.6 | PUT /equipment/:id/scheduling, PUT /materials/:id/scheduling, PUT /molds/:id/scheduling |
| 4.5 | DELETE /materials/:id, GET /materials/:id/delete-preview |
| 4.6 | DELETE /equipment/:id, DELETE /molds/:id, GET /equipment/:id/delete-preview, GET /molds/:id/delete-preview |
| 2.4 | POST /molds/:id/equipment, DELETE /molds/:id/equipment/:equipmentId |

