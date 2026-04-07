/**
 * Master Data API Property-Based Tests
 * Validates API data completeness and consistency
 * Requirements: 6.1, 6.2, 6.3, 6.5, 6.6
 * 
 * Property 4: API Data Completeness
 * For any unified API query request, the returned data should simultaneously include
 * both master data attributes and scheduling extension attributes, and the two should be consistent.
 * 
 * Feature: data-integration, Property 4: API数据完整性
 * Validates: Requirements 6.1
 */

const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');

// Mock models
jest.mock('../models', () => ({
  Equipment: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn()
  },
  EquipmentSchedulingExt: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  Material: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn()
  },
  MaterialSchedulingExt: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  Mold: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn()
  },
  MoldSchedulingExt: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  MoldEquipmentRelation: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  MaterialDeviceRelation: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  MaterialMoldRelation: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  Device: {
    findByPk: jest.fn()
  }
}));

// Mock auth middleware
jest.mock('./auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, username: 'testuser' };
    next();
  }
}));

const models = require('../models');
const masterDataRouter = require('./masterData');

describe('Master Data API - Property 4: API Data Completeness', () => {
  let app;
  let mockToken = 'Bearer test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Express app with router
    app = express();
    app.use(express.json());
    app.use('/api/master-data', masterDataRouter);
  });

  describe('Equipment API - Data Completeness Property', () => {
    /**
     * Property 4: API Data Completeness
     * For any equipment record, the API response should include both:
     * 1. Master data attributes (equipment_code, equipment_name, status, etc.)
     * 2. Scheduling extension attributes (capacity_per_hour, scheduling_weight, is_available_for_scheduling)
     * 
     * The property holds for all valid equipment records regardless of whether
     * scheduling extension data exists or not.
     */
    test('should return equipment with both master data and scheduling extension attributes', async () => {
      const equipmentId = 1;
      const mockEquipment = {
        id: equipmentId,
        equipment_code: 'EQ-001',
        equipment_name: 'Injection Molding Machine A1',
        equipment_type: 'Injection Molding',
        status: 'running',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: {
              id: 1,
              equipment_id: equipmentId,
              capacity_per_hour: 100,
              scheduling_weight: 80,
              is_available_for_scheduling: true
            }
          };
        }
      };

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockEquipment]
      });

      const response = await request(app)
        .get('/api/master-data/equipment')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const equipment = response.body.data[0];
      
      // Verify master data attributes are present
      expect(equipment).toHaveProperty('id', equipmentId);
      expect(equipment).toHaveProperty('equipment_code', 'EQ-001');
      expect(equipment).toHaveProperty('equipment_name', 'Injection Molding Machine A1');
      expect(equipment).toHaveProperty('equipment_type', 'Injection Molding');
      expect(equipment).toHaveProperty('status', 'running');
      expect(equipment).toHaveProperty('is_active', true);
      
      // Verify scheduling extension attributes are present
      expect(equipment).toHaveProperty('scheduling');
      expect(equipment.scheduling).not.toBeNull();
      expect(equipment.scheduling).toHaveProperty('capacity_per_hour', 100);
      expect(equipment.scheduling).toHaveProperty('scheduling_weight', 80);
      expect(equipment.scheduling).toHaveProperty('is_available_for_scheduling', true);
    });

    /**
     * Property 4 Edge Case: Equipment without scheduling extension
     * When an equipment record has no scheduling extension data,
     * the API should still return the master data with scheduling set to null
     */
    test('should return equipment with null scheduling when no extension exists', async () => {
      const equipmentId = 2;
      const mockEquipment = {
        id: equipmentId,
        equipment_code: 'EQ-002',
        equipment_name: 'Injection Molding Machine A2',
        equipment_type: 'Injection Molding',
        status: 'idle',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: null
          };
        }
      };

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockEquipment]
      });

      const response = await request(app)
        .get('/api/master-data/equipment')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const equipment = response.body.data[0];
      
      // Verify master data attributes are present
      expect(equipment).toHaveProperty('equipment_code', 'EQ-002');
      expect(equipment).toHaveProperty('equipment_name', 'Injection Molding Machine A2');
      
      // Verify scheduling is null but present
      expect(equipment).toHaveProperty('scheduling');
      expect(equipment.scheduling).toBeNull();
    });

    /**
     * Property 4: Multiple Equipment Records
     * For any collection of equipment records, each record should have
     * both master data and scheduling extension attributes
     */
    test('should return multiple equipment records with complete data', async () => {
      const mockEquipments = [
        {
          id: 1,
          equipment_code: 'EQ-001',
          equipment_name: 'Machine A1',
          equipment_type: 'Injection',
          status: 'running',
          is_active: true,
          toJSON: function() {
            return {
              id: this.id,
              equipment_code: this.equipment_code,
              equipment_name: this.equipment_name,
              equipment_type: this.equipment_type,
              status: this.status,
              is_active: this.is_active,
              schedulingExt: {
                capacity_per_hour: 100,
                scheduling_weight: 80,
                is_available_for_scheduling: true
              }
            };
          }
        },
        {
          id: 2,
          equipment_code: 'EQ-002',
          equipment_name: 'Machine A2',
          equipment_type: 'Injection',
          status: 'idle',
          is_active: true,
          toJSON: function() {
            return {
              id: this.id,
              equipment_code: this.equipment_code,
              equipment_name: this.equipment_name,
              equipment_type: this.equipment_type,
              status: this.status,
              is_active: this.is_active,
              schedulingExt: {
                capacity_per_hour: 80,
                scheduling_weight: 60,
                is_available_for_scheduling: false
              }
            };
          }
        }
      ];

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockEquipments
      });

      const response = await request(app)
        .get('/api/master-data/equipment')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      
      // Verify each equipment has complete data
      response.body.data.forEach((equipment, index) => {
        expect(equipment).toHaveProperty('id');
        expect(equipment).toHaveProperty('equipment_code');
        expect(equipment).toHaveProperty('equipment_name');
        expect(equipment).toHaveProperty('equipment_type');
        expect(equipment).toHaveProperty('status');
        expect(equipment).toHaveProperty('is_active');
        expect(equipment).toHaveProperty('scheduling');
        
        if (equipment.scheduling) {
          expect(equipment.scheduling).toHaveProperty('capacity_per_hour');
          expect(equipment.scheduling).toHaveProperty('scheduling_weight');
          expect(equipment.scheduling).toHaveProperty('is_available_for_scheduling');
        }
      });
    });

    /**
     * Property 4: Pagination Consistency
     * For any paginated API response, each equipment record should have
     * both master data and scheduling extension attributes
     */
    test('should maintain data completeness across paginated results', async () => {
      const mockEquipment = {
        id: 1,
        equipment_code: 'EQ-001',
        equipment_name: 'Machine A1',
        equipment_type: 'Injection',
        status: 'running',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: {
              capacity_per_hour: 100,
              scheduling_weight: 80,
              is_available_for_scheduling: true
            }
          };
        }
      };

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: [mockEquipment]
      });

      const response = await request(app)
        .get('/api/master-data/equipment?page=1&limit=10')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toHaveProperty('total', 50);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('totalPages', 5);
      
      // Verify data completeness in paginated response
      response.body.data.forEach(equipment => {
        expect(equipment).toHaveProperty('equipment_code');
        expect(equipment).toHaveProperty('scheduling');
      });
    });

    /**
     * Property 4: Status Filtering Consistency
     * When filtering by status, all returned equipment records should have
     * both master data and scheduling extension attributes
     */
    test('should maintain data completeness when filtering by status', async () => {
      const mockEquipment = {
        id: 1,
        equipment_code: 'EQ-001',
        equipment_name: 'Machine A1',
        equipment_type: 'Injection',
        status: 'running',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: {
              capacity_per_hour: 100,
              scheduling_weight: 80,
              is_available_for_scheduling: true
            }
          };
        }
      };

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockEquipment]
      });

      const response = await request(app)
        .get('/api/master-data/equipment?status=running')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const equipment = response.body.data[0];
      expect(equipment.status).toBe('running');
      expect(equipment).toHaveProperty('scheduling');
      expect(equipment.scheduling).toHaveProperty('capacity_per_hour');
    });

    /**
     * Property 4: Scheduling Availability Filtering
     * When filtering by scheduling availability, all returned equipment records
     * should have both master data and scheduling extension attributes
     */
    test('should maintain data completeness when filtering by scheduling availability', async () => {
      const mockEquipment = {
        id: 1,
        equipment_code: 'EQ-001',
        equipment_name: 'Machine A1',
        equipment_type: 'Injection',
        status: 'running',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: {
              capacity_per_hour: 100,
              scheduling_weight: 80,
              is_available_for_scheduling: true
            }
          };
        }
      };

      models.Equipment.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockEquipment]
      });

      const response = await request(app)
        .get('/api/master-data/equipment?is_available_for_scheduling=true')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const equipment = response.body.data[0];
      expect(equipment.scheduling.is_available_for_scheduling).toBe(true);
      expect(equipment).toHaveProperty('equipment_code');
      expect(equipment).toHaveProperty('equipment_name');
    });
  });

  describe('Equipment Detail API - Data Completeness', () => {
    /**
     * Property 4: Single Equipment Detail
     * When retrieving a single equipment by ID, the response should include
     * both master data and scheduling extension attributes
     */
    test('should return single equipment with complete data', async () => {
      const equipmentId = 1;
      const mockEquipment = {
        id: equipmentId,
        equipment_code: 'EQ-001',
        equipment_name: 'Machine A1',
        equipment_type: 'Injection',
        status: 'running',
        is_active: true,
        toJSON: function() {
          return {
            id: this.id,
            equipment_code: this.equipment_code,
            equipment_name: this.equipment_name,
            equipment_type: this.equipment_type,
            status: this.status,
            is_active: this.is_active,
            schedulingExt: {
              capacity_per_hour: 100,
              scheduling_weight: 80,
              is_available_for_scheduling: true
            }
          };
        }
      };

      models.Equipment.findByPk.mockResolvedValue(mockEquipment);

      const response = await request(app)
        .get(`/api/master-data/equipment/${equipmentId}`)
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', equipmentId);
      expect(response.body.data).toHaveProperty('equipment_code', 'EQ-001');
      expect(response.body.data).toHaveProperty('scheduling');
      expect(response.body.data.scheduling).toHaveProperty('capacity_per_hour', 100);
      expect(response.body.data.scheduling).toHaveProperty('scheduling_weight', 80);
    });

    /**
     * Property 4: Equipment Not Found
     * When equipment is not found, the API should return a 404 error
     */
    test('should return 404 when equipment not found', async () => {
      models.Equipment.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/master-data/equipment/99999')
        .set('Authorization', mockToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('设备不存在');
    });
  });

  describe('Equipment Scheduling Update - Data Consistency', () => {
    /**
     * Property 4: Update Scheduling Extension
     * After updating scheduling extension attributes, the API should return
     * both master data and updated scheduling extension attributes
     */
    test('should return complete data after updating scheduling extension', async () => {
      const equipmentId = 1;
      const mockSchedulingExt = {
        id: 1,
        equipment_id: equipmentId,
        capacity_per_hour: 150,
        scheduling_weight: 90,
        is_available_for_scheduling: true,
        update: jest.fn().mockResolvedValue(true)
      };

      models.Equipment.findByPk.mockResolvedValue({ id: equipmentId });
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(mockSchedulingExt);

      const response = await request(app)
        .put(`/api/master-data/equipment/${equipmentId}/scheduling`)
        .set('Authorization', mockToken)
        .send({
          capacity_per_hour: 150,
          scheduling_weight: 90
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('equipment_id');
      expect(parseInt(response.body.data.equipment_id)).toBe(equipmentId);
      expect(response.body.data).toHaveProperty('scheduling');
      expect(response.body.data.scheduling).toHaveProperty('capacity_per_hour', 150);
      expect(response.body.data.scheduling).toHaveProperty('scheduling_weight', 90);
      expect(response.body.data.scheduling).toHaveProperty('is_available_for_scheduling', true);
    });

    /**
     * Property 4: Create Scheduling Extension
     * When creating a new scheduling extension for equipment without one,
     * the API should return complete data with the new extension
     */
    test('should create and return complete data for new scheduling extension', async () => {
      const equipmentId = 2;
      const mockSchedulingExt = {
        id: 2,
        equipment_id: equipmentId,
        capacity_per_hour: 100,
        scheduling_weight: 75,
        is_available_for_scheduling: true
      };

      models.Equipment.findByPk.mockResolvedValue({ id: equipmentId });
      models.EquipmentSchedulingExt.findOne.mockResolvedValue(null);
      models.EquipmentSchedulingExt.create.mockResolvedValue(mockSchedulingExt);

      const response = await request(app)
        .put(`/api/master-data/equipment/${equipmentId}/scheduling`)
        .set('Authorization', mockToken)
        .send({
          capacity_per_hour: 100,
          scheduling_weight: 75,
          is_available_for_scheduling: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('equipment_id');
      expect(parseInt(response.body.data.equipment_id)).toBe(equipmentId);
      expect(response.body.data.scheduling).toHaveProperty('capacity_per_hour', 100);
      expect(response.body.data.scheduling).toHaveProperty('scheduling_weight', 75);
    });
  });

  describe('Materials API - Data Completeness Property', () => {
    /**
     * Property 4: API Data Completeness for Materials
     * For any material record, the API response should include both:
     * 1. Master data attributes (material_code, material_name, status, etc.)
     * 2. Scheduling extension attributes (default_device_id, default_mold_id, device_relations, mold_relations)
     * 
     * The property holds for all valid material records regardless of whether
     * scheduling extension data exists or not.
     * 
     * Feature: data-integration, Property 4: API数据完整性
     * Validates: Requirements 6.2
     */
    test('should return material with both master data and scheduling extension attributes', async () => {
      const materialId = 1;
      const mockMaterial = {
        id: materialId,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic Pellets',
        material_type: 'raw_material',
        specifications: 'Grade A',
        unit: 'kg',
        category: 'plastic',
        status: 'active',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            specifications: this.specifications,
            unit: this.unit,
            category: this.category,
            status: this.status,
            schedulingExt: {
              id: 1,
              material_id: materialId,
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: {
                id: 1,
                device_code: 'DEV-001',
                device_name: 'Device A',
                status: 'active'
              },
              defaultMold: {
                id: 1,
                mold_code: 'MOLD-001',
                mold_name: 'Mold A',
                status: 'normal'
              }
            }
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          device_id: 1,
          weight: 80,
          Device: {
            id: 1,
            device_code: 'DEV-001',
            device_name: 'Device A',
            status: 'active'
          }
        }
      ]);

      models.MaterialMoldRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          mold_id: 1,
          weight: 70,
          cycle_time: 30,
          output_per_cycle: 100,
          Mold: {
            id: 1,
            mold_code: 'MOLD-001',
            mold_name: 'Mold A',
            status: 'normal'
          }
        }
      ]);

      const response = await request(app)
        .get('/api/master-data/materials')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const material = response.body.data[0];
      
      // Verify master data attributes are present
      expect(material).toHaveProperty('id', materialId);
      expect(material).toHaveProperty('material_code', 'MAT-001');
      expect(material).toHaveProperty('material_name', 'ABS Plastic Pellets');
      expect(material).toHaveProperty('material_type', 'raw_material');
      expect(material).toHaveProperty('status', 'active');
      expect(material).toHaveProperty('unit', 'kg');
      expect(material).toHaveProperty('category', 'plastic');
      
      // Verify scheduling extension attributes are present
      expect(material).toHaveProperty('scheduling');
      expect(material.scheduling).not.toBeNull();
      expect(material.scheduling).toHaveProperty('default_device_id', 1);
      expect(material.scheduling).toHaveProperty('default_mold_id', 1);
      expect(material.scheduling).toHaveProperty('device_relations');
      expect(material.scheduling).toHaveProperty('mold_relations');
      
      // Verify relationship data is included
      expect(Array.isArray(material.scheduling.device_relations)).toBe(true);
      expect(Array.isArray(material.scheduling.mold_relations)).toBe(true);
      expect(material.scheduling.device_relations.length).toBeGreaterThan(0);
      expect(material.scheduling.mold_relations.length).toBeGreaterThan(0);
    });

    /**
     * Property 4 Edge Case: Material without scheduling extension
     * When a material record has no scheduling extension data,
     * the API should still return the master data with scheduling set to default values
     */
    test('should return material with default scheduling when no extension exists', async () => {
      const materialId = 2;
      const mockMaterial = {
        id: materialId,
        material_code: 'MAT-002',
        material_name: 'PP Plastic Pellets',
        material_type: 'raw_material',
        specifications: 'Grade B',
        unit: 'kg',
        category: 'plastic',
        status: 'active',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            specifications: this.specifications,
            unit: this.unit,
            category: this.category,
            status: this.status,
            schedulingExt: null
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([]);
      models.MaterialMoldRelation.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/master-data/materials')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const material = response.body.data[0];
      
      // Verify master data attributes are present
      expect(material).toHaveProperty('material_code', 'MAT-002');
      expect(material).toHaveProperty('material_name', 'PP Plastic Pellets');
      
      // Verify scheduling has default values
      expect(material).toHaveProperty('scheduling');
      expect(material.scheduling).toHaveProperty('default_device_id', null);
      expect(material.scheduling).toHaveProperty('default_mold_id', null);
      expect(material.scheduling).toHaveProperty('device_relations');
      expect(material.scheduling).toHaveProperty('mold_relations');
      expect(material.scheduling.device_relations).toEqual([]);
      expect(material.scheduling.mold_relations).toEqual([]);
    });

    /**
     * Property 4: Multiple Material Records
     * For any collection of material records, each record should have
     * both master data and scheduling extension attributes
     */
    test('should return multiple material records with complete data', async () => {
      const mockMaterials = [
        {
          id: 1,
          material_code: 'MAT-001',
          material_name: 'ABS Plastic',
          material_type: 'raw_material',
          status: 'active',
          unit: 'kg',
          category: 'plastic',
          toJSON: function() {
            return {
              id: this.id,
              material_code: this.material_code,
              material_name: this.material_name,
              material_type: this.material_type,
              status: this.status,
              unit: this.unit,
              category: this.category,
              schedulingExt: {
                default_device_id: 1,
                default_mold_id: 1,
                defaultDevice: null,
                defaultMold: null
              }
            };
          }
        },
        {
          id: 2,
          material_code: 'MAT-002',
          material_name: 'PP Plastic',
          material_type: 'raw_material',
          status: 'active',
          unit: 'kg',
          category: 'plastic',
          toJSON: function() {
            return {
              id: this.id,
              material_code: this.material_code,
              material_name: this.material_name,
              material_type: this.material_type,
              status: this.status,
              unit: this.unit,
              category: this.category,
              schedulingExt: {
                default_device_id: 2,
                default_mold_id: 2,
                defaultDevice: null,
                defaultMold: null
              }
            };
          }
        }
      ];

      models.Material.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockMaterials
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([]);
      models.MaterialMoldRelation.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/master-data/materials')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      
      // Verify each material has complete data
      response.body.data.forEach((material, index) => {
        expect(material).toHaveProperty('id');
        expect(material).toHaveProperty('material_code');
        expect(material).toHaveProperty('material_name');
        expect(material).toHaveProperty('material_type');
        expect(material).toHaveProperty('status');
        expect(material).toHaveProperty('unit');
        expect(material).toHaveProperty('category');
        expect(material).toHaveProperty('scheduling');
        
        if (material.scheduling) {
          expect(material.scheduling).toHaveProperty('default_device_id');
          expect(material.scheduling).toHaveProperty('default_mold_id');
          expect(material.scheduling).toHaveProperty('device_relations');
          expect(material.scheduling).toHaveProperty('mold_relations');
        }
      });
    });

    /**
     * Property 4: Pagination Consistency for Materials
     * For any paginated API response, each material record should have
     * both master data and scheduling extension attributes
     */
    test('should maintain data completeness across paginated material results', async () => {
      const mockMaterial = {
        id: 1,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        material_type: 'raw_material',
        status: 'active',
        unit: 'kg',
        category: 'plastic',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            status: this.status,
            unit: this.unit,
            category: this.category,
            schedulingExt: {
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: null,
              defaultMold: null
            }
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([]);
      models.MaterialMoldRelation.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/master-data/materials?page=1&limit=10')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toHaveProperty('total', 50);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('totalPages', 5);
      
      // Verify data completeness in paginated response
      response.body.data.forEach(material => {
        expect(material).toHaveProperty('material_code');
        expect(material).toHaveProperty('scheduling');
        expect(material.scheduling).toHaveProperty('device_relations');
        expect(material.scheduling).toHaveProperty('mold_relations');
      });
    });

    /**
     * Property 4: Status Filtering Consistency for Materials
     * When filtering by status, all returned material records should have
     * both master data and scheduling extension attributes
     */
    test('should maintain data completeness when filtering materials by status', async () => {
      const mockMaterial = {
        id: 1,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        material_type: 'raw_material',
        status: 'active',
        unit: 'kg',
        category: 'plastic',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            status: this.status,
            unit: this.unit,
            category: this.category,
            schedulingExt: {
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: null,
              defaultMold: null
            }
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([]);
      models.MaterialMoldRelation.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/master-data/materials?status=active')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const material = response.body.data[0];
      expect(material.status).toBe('active');
      expect(material).toHaveProperty('scheduling');
      expect(material.scheduling).toHaveProperty('default_device_id');
      expect(material.scheduling).toHaveProperty('device_relations');
    });

    /**
     * Property 4: Material Type Filtering Consistency
     * When filtering by material type, all returned material records
     * should have both master data and scheduling extension attributes
     */
    test('should maintain data completeness when filtering materials by type', async () => {
      const mockMaterial = {
        id: 1,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        material_type: 'raw_material',
        status: 'active',
        unit: 'kg',
        category: 'plastic',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            status: this.status,
            unit: this.unit,
            category: this.category,
            schedulingExt: {
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: null,
              defaultMold: null
            }
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([]);
      models.MaterialMoldRelation.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/master-data/materials?material_type=raw_material')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const material = response.body.data[0];
      expect(material.material_type).toBe('raw_material');
      expect(material).toHaveProperty('scheduling');
      expect(material.scheduling).toHaveProperty('device_relations');
      expect(material.scheduling).toHaveProperty('mold_relations');
    });

    /**
     * Property 4: Material with Multiple Device and Mold Relations
     * When a material has multiple device and mold relations,
     * all relations should be included in the scheduling extension
     */
    test('should include all device and mold relations in material scheduling data', async () => {
      const materialId = 1;
      const mockMaterial = {
        id: materialId,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        material_type: 'raw_material',
        status: 'active',
        unit: 'kg',
        category: 'plastic',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            status: this.status,
            unit: this.unit,
            category: this.category,
            schedulingExt: {
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: null,
              defaultMold: null
            }
          };
        }
      };

      models.Material.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockMaterial]
      });

      models.MaterialDeviceRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          device_id: 1,
          weight: 80,
          Device: {
            id: 1,
            device_code: 'DEV-001',
            device_name: 'Device A',
            status: 'active'
          }
        },
        {
          material_id: materialId,
          device_id: 2,
          weight: 60,
          Device: {
            id: 2,
            device_code: 'DEV-002',
            device_name: 'Device B',
            status: 'active'
          }
        }
      ]);

      models.MaterialMoldRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          mold_id: 1,
          weight: 70,
          cycle_time: 30,
          output_per_cycle: 100,
          Mold: {
            id: 1,
            mold_code: 'MOLD-001',
            mold_name: 'Mold A',
            status: 'normal'
          }
        },
        {
          material_id: materialId,
          mold_id: 2,
          weight: 50,
          cycle_time: 40,
          output_per_cycle: 80,
          Mold: {
            id: 2,
            mold_code: 'MOLD-002',
            mold_name: 'Mold B',
            status: 'normal'
          }
        }
      ]);

      const response = await request(app)
        .get('/api/master-data/materials')
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      
      const material = response.body.data[0];
      expect(material.scheduling.device_relations).toHaveLength(2);
      expect(material.scheduling.mold_relations).toHaveLength(2);
      
      // Verify all relation data is present
      material.scheduling.device_relations.forEach(rel => {
        expect(rel).toHaveProperty('device_id');
        expect(rel).toHaveProperty('device_code');
        expect(rel).toHaveProperty('device_name');
        expect(rel).toHaveProperty('device_status');
        expect(rel).toHaveProperty('weight');
      });

      material.scheduling.mold_relations.forEach(rel => {
        expect(rel).toHaveProperty('mold_id');
        expect(rel).toHaveProperty('mold_code');
        expect(rel).toHaveProperty('mold_name');
        expect(rel).toHaveProperty('mold_status');
        expect(rel).toHaveProperty('weight');
        expect(rel).toHaveProperty('cycle_time');
        expect(rel).toHaveProperty('output_per_cycle');
      });
    });
  });

  describe('Material Detail API - Data Completeness', () => {
    /**
     * Property 4: Single Material Detail
     * When retrieving a single material by ID, the response should include
     * both master data and scheduling extension attributes
     */
    test('should return single material with complete data', async () => {
      const materialId = 1;
      const mockMaterial = {
        id: materialId,
        material_code: 'MAT-001',
        material_name: 'ABS Plastic',
        material_type: 'raw_material',
        status: 'active',
        unit: 'kg',
        category: 'plastic',
        toJSON: function() {
          return {
            id: this.id,
            material_code: this.material_code,
            material_name: this.material_name,
            material_type: this.material_type,
            status: this.status,
            unit: this.unit,
            category: this.category,
            schedulingExt: {
              default_device_id: 1,
              default_mold_id: 1,
              defaultDevice: {
                id: 1,
                device_code: 'DEV-001',
                device_name: 'Device A',
                status: 'active'
              },
              defaultMold: {
                id: 1,
                mold_code: 'MOLD-001',
                mold_name: 'Mold A',
                status: 'normal'
              }
            }
          };
        }
      };

      models.Material.findByPk.mockResolvedValue(mockMaterial);

      models.MaterialDeviceRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          device_id: 1,
          weight: 80,
          Device: {
            id: 1,
            device_code: 'DEV-001',
            device_name: 'Device A',
            status: 'active'
          }
        }
      ]);

      models.MaterialMoldRelation.findAll.mockResolvedValue([
        {
          material_id: materialId,
          mold_id: 1,
          weight: 70,
          cycle_time: 30,
          output_per_cycle: 100,
          Mold: {
            id: 1,
            mold_code: 'MOLD-001',
            mold_name: 'Mold A',
            status: 'normal'
          }
        }
      ]);

      const response = await request(app)
        .get(`/api/master-data/materials/${materialId}`)
        .set('Authorization', mockToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', materialId);
      expect(response.body.data).toHaveProperty('material_code', 'MAT-001');
      expect(response.body.data).toHaveProperty('scheduling');
      expect(response.body.data.scheduling).toHaveProperty('default_device_id', 1);
      expect(response.body.data.scheduling).toHaveProperty('default_mold_id', 1);
      expect(response.body.data.scheduling).toHaveProperty('device_relations');
      expect(response.body.data.scheduling).toHaveProperty('mold_relations');
    });

    /**
     * Property 4: Material Not Found
     * When material is not found, the API should return a 404 error
     */
    test('should return 404 when material not found', async () => {
      models.Material.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/master-data/materials/99999')
        .set('Authorization', mockToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('物料不存在');
    });
  });

  describe('Material Scheduling Update - Data Consistency', () => {
    /**
     * Property 4: Update Material Scheduling Extension
     * After updating scheduling extension attributes, the API should return
     * both master data and updated scheduling extension attributes
     */
    test('should return complete data after updating material scheduling extension', async () => {
      const materialId = 1;
      const mockSchedulingExt = {
        id: 1,
        material_id: materialId,
        default_device_id: 2,
        default_mold_id: 2,
        update: jest.fn().mockResolvedValue(true)
      };

      models.Material.findByPk.mockResolvedValue({ id: materialId });
      models.MaterialSchedulingExt.findOne.mockResolvedValue(mockSchedulingExt);

      const response = await request(app)
        .put(`/api/master-data/materials/${materialId}/scheduling`)
        .set('Authorization', mockToken)
        .send({
          default_device_id: 2,
          default_mold_id: 2
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('material_id');
      expect(parseInt(response.body.data.material_id)).toBe(materialId);
      expect(response.body.data).toHaveProperty('scheduling');
      expect(response.body.data.scheduling).toHaveProperty('default_device_id', 2);
      expect(response.body.data.scheduling).toHaveProperty('default_mold_id', 2);
    });

    /**
     * Property 4: Create Material Scheduling Extension
     * When creating a new scheduling extension for material without one,
     * the API should return complete data with the new extension
     */
    test('should create and return complete data for new material scheduling extension', async () => {
      const materialId = 2;
      const mockSchedulingExt = {
        id: 2,
        material_id: materialId,
        default_device_id: 1,
        default_mold_id: 1
      };

      models.Material.findByPk.mockResolvedValue({ id: materialId });
      models.MaterialSchedulingExt.findOne.mockResolvedValue(null);
      models.MaterialSchedulingExt.create.mockResolvedValue(mockSchedulingExt);

      const response = await request(app)
        .put(`/api/master-data/materials/${materialId}/scheduling`)
        .set('Authorization', mockToken)
        .send({
          default_device_id: 1,
          default_mold_id: 1
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('material_id');
      expect(parseInt(response.body.data.material_id)).toBe(materialId);
      expect(response.body.data.scheduling).toHaveProperty('default_device_id', 1);
      expect(response.body.data.scheduling).toHaveProperty('default_mold_id', 1);
    });
  });
});
