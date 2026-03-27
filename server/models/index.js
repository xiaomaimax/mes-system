/**
 * 模型索引文件 - 设置所有模型关联关系
 * 用于数据整合功能
 */
const sequelize = require('../config/database');

// 导入所有模型
const Equipment = require('./Equipment');
const Mold = require('./Mold');
const Material = require('./Material');
const Device = require('./Device');
const MaterialDeviceRelation = require('./MaterialDeviceRelation');
const MaterialMoldRelation = require('./MaterialMoldRelation');
const ProductionOrder = require('./ProductionOrder');
const ProductionPlan = require('./ProductionPlan');
const ProductionTask = require('./ProductionTask');
const User = require('./User');

// 导入排程扩展模型
const EquipmentSchedulingExt = require('./EquipmentSchedulingExt');
const MoldEquipmentRelation = require('./MoldEquipmentRelation');
const MoldSchedulingExt = require('./MoldSchedulingExt');
const MaterialSchedulingExt = require('./MaterialSchedulingExt');

// 导入新增模型
const ProcessRouting = require('./ProcessRouting');
const ProcessParameters = require('./ProcessParameters');
const ProductionLine = require('./ProductionLine');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const QualityInspection = require('./QualityInspection');
const DefectRecord = require('./DefectRecord');
const EquipmentMaintenance = require('./EquipmentMaintenance');
const ShiftSchedule = require('./ShiftSchedule');
const DailyProductionReport = require('./DailyProductionReport');
// RBAC 权限管理模型
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');
const Department = require('./Department');
const DataPermission = require('./DataPermission');
const AuditLog = require('./AuditLog');
const MenuPermission = require('./MenuPermission');
const RoleMenu = require('./RoleMenu');


// 设置关联关系

// Equipment <-> EquipmentSchedulingExt (一对一)
Equipment.hasOne(EquipmentSchedulingExt, {
  foreignKey: 'equipment_id',
  as: 'schedulingExt',
  onDelete: 'CASCADE'
});
EquipmentSchedulingExt.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// Mold <-> Equipment (多对多，通过 MoldEquipmentRelation)
Mold.belongsToMany(Equipment, {
  through: MoldEquipmentRelation,
  foreignKey: 'mold_id',
  otherKey: 'equipment_id',
  as: 'equipments'
});
Equipment.belongsToMany(Mold, {
  through: MoldEquipmentRelation,
  foreignKey: 'equipment_id',
  otherKey: 'mold_id',
  as: 'molds'
});

// 直接关联到关系表以便查询详细信息
Mold.hasMany(MoldEquipmentRelation, {
  foreignKey: 'mold_id',
  as: 'equipmentRelations'
});
MoldEquipmentRelation.belongsTo(Mold, {
  foreignKey: 'mold_id',
  as: 'mold'
});

Equipment.hasMany(MoldEquipmentRelation, {
  foreignKey: 'equipment_id',
  as: 'moldRelations'
});
MoldEquipmentRelation.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// Mold <-> MoldSchedulingExt (一对一)
Mold.hasOne(MoldSchedulingExt, {
  foreignKey: 'mold_id',
  as: 'schedulingExt',
  onDelete: 'CASCADE'
});
MoldSchedulingExt.belongsTo(Mold, {
  foreignKey: 'mold_id',
  as: 'mold'
});

// Material <-> MaterialSchedulingExt (一对一)
Material.hasOne(MaterialSchedulingExt, {
  foreignKey: 'material_id',
  as: 'schedulingExt',
  onDelete: 'CASCADE'
});
MaterialSchedulingExt.belongsTo(Material, {
  foreignKey: 'material_id',
  as: 'material'
});

// MaterialSchedulingExt -> Device (默认设备)
MaterialSchedulingExt.belongsTo(Device, {
  foreignKey: 'default_device_id',
  as: 'defaultDevice'
});

// MaterialSchedulingExt -> Mold (默认模具)
MaterialSchedulingExt.belongsTo(Mold, {
  foreignKey: 'default_mold_id',
  as: 'defaultMold'
});


// RBAC 关联关系
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

Role.belongsToMany(MenuPermission, {
  through: RoleMenu,
  foreignKey: 'role_id',
  otherKey: 'menu_id',
  as: 'menus'
});
MenuPermission.belongsToMany(Role, {
  through: RoleMenu,
  foreignKey: 'menu_id',
  otherKey: 'role_id',
  as: 'roles'
});

Department.hasMany(User, {
  foreignKey: 'department_id',
  as: 'users'
});
User.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'dept'
});


User.hasMany(AuditLog, {
  foreignKey: 'user_id',
  as: 'auditLogs'
});
AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

RolePermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});
Permission.hasMany(RolePermission, {
  foreignKey: 'permission_id',
  as: 'rolePermissions'
});

UserRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});
User.hasMany(UserRole, {
  foreignKey: 'user_id',
  as: 'userRoles'
});

UserRole.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});
Role.hasMany(UserRole, {
  foreignKey: 'role_id',
  as: 'userRoles'
});

module.exports = {
  sequelize,
  Equipment,
  Mold,
  Material,
  Device,
  MaterialDeviceRelation,
  MaterialMoldRelation,
  ProductionOrder,
  ProductionPlan,
  ProductionTask,
  User,
  EquipmentSchedulingExt,
  MoldEquipmentRelation,
  MoldSchedulingExt,
  MaterialSchedulingExt,
  ProcessRouting,
  ProcessParameters,
  ProductionLine,
  Inventory,
  InventoryTransaction,
  QualityInspection,
  DefectRecord,
  EquipmentMaintenance,
  ShiftSchedule,
  DailyProductionReport,
  // RBAC 模型
  Role,
  Permission,
  UserRole,
  RolePermission,
  Department,
  DataPermission,
  AuditLog,
  MenuPermission,
  RoleMenu
};
