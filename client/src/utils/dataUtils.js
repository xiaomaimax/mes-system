// 数据工具类
// 提供数据获取、格式化、计算等功能

import mockData from '../data/mockData';

// 数据获取工具
export class DataService {
  // 获取基础数据
  static getProducts() {
    return mockData.baseData.products;
  }

  static getProductionLines() {
    return mockData.baseData.productionLines;
  }

  static getEquipment() {
    return mockData.baseData.equipment;
  }

  static getMaterials() {
    return mockData.baseData.materials;
  }

  static getEmployees() {
    return mockData.baseData.employees;
  }

  // 生产管理数据
  static getProductionPlans(status = null) {
    const plans = mockData.productionData.productionPlans;
    return status ? plans.filter(plan => plan.status === status) : plans;
  }

  static getProductionTasks(status = null) {
    const tasks = mockData.productionData.productionTasks;
    return status ? tasks.filter(task => task.status === status) : tasks;
  }

  static getWorkReports(date = null) {
    const reports = mockData.productionData.workReports;
    return date ? reports.filter(report => report.date === date) : reports;
  }

  // 质量管理数据
  static getIQCInspections(date = null) {
    const inspections = mockData.qualityData.iqcInspections;
    return date ? inspections.filter(item => item.date === date) : inspections;
  }

  static getPQCInspections(date = null) {
    const inspections = mockData.qualityData.pqcInspections;
    return date ? inspections.filter(item => item.date === date) : inspections;
  }

  static getFQCInspections(date = null) {
    const inspections = mockData.qualityData.fqcInspections;
    return date ? inspections.filter(item => item.date === date) : inspections;
  }

  static getDefectRecords(date = null) {
    const records = mockData.qualityData.defectRecords;
    return date ? records.filter(record => record.date === date) : records;
  }

  // 设备管理数据
  static getMaintenanceRecords(equipmentId = null) {
    const records = mockData.equipmentData.maintenanceRecords;
    return equipmentId ? records.filter(record => record.equipmentId === equipmentId) : records;
  }

  static getInspectionRecords(equipmentId = null) {
    const records = mockData.equipmentData.inspectionRecords;
    return equipmentId ? records.filter(record => record.equipmentId === equipmentId) : records;
  }

  static getFaultRecords(equipmentId = null) {
    const records = mockData.equipmentData.faultRecords;
    return equipmentId ? records.filter(record => record.equipmentId === equipmentId) : records;
  }

  // 库存管理数据
  static getStockInfo(status = null) {
    const stocks = mockData.inventoryData.stockInfo;
    return status ? stocks.filter(stock => stock.status === status) : stocks;
  }

  static getInboundRecords(date = null) {
    const records = mockData.inventoryData.inboundRecords;
    return date ? records.filter(record => record.date === date) : records;
  }

  static getOutboundRecords(date = null) {
    const records = mockData.inventoryData.outboundRecords;
    return date ? records.filter(record => record.date === date) : records;
  }

  // 人员管理数据
  static getAttendanceRecords(date = null, employeeId = null) {
    let records = mockData.personnelData.attendanceRecords;
    if (date) records = records.filter(record => record.date === date);
    if (employeeId) records = records.filter(record => record.employeeId === employeeId);
    return records;
  }

  static getTrainingRecords(employeeId = null) {
    const records = mockData.personnelData.trainingRecords;
    return employeeId ? records.filter(record => record.employeeId === employeeId) : records;
  }

  static getPerformanceRecords(employeeId = null) {
    const records = mockData.personnelData.performanceRecords;
    return employeeId ? records.filter(record => record.employeeId === employeeId) : records;
  }

  // 工艺管理数据
  static getProcessRoutes(productId = null) {
    const routes = mockData.processData.processRoutes;
    return productId ? routes.filter(route => route.productId === productId) : routes;
  }

  static getProcessParameters(processStep = null) {
    const params = mockData.processData.processParameters;
    return processStep ? params.filter(param => param.processStep === processStep) : params;
  }

  // 系统集成数据
  static getInterfaceConfigs(status = null) {
    const configs = mockData.integrationData.interfaceConfigs;
    return status ? configs.filter(config => config.status === status) : configs;
  }

  static getSyncRecords(interfaceId = null) {
    const records = mockData.integrationData.syncRecords;
    return interfaceId ? records.filter(record => record.interfaceId === interfaceId) : records;
  }

  // 报表数据
  static getKPIMetrics() {
    return mockData.reportData.kpiMetrics;
  }

  static getTrendData(type = null) {
    const data = mockData.reportData.trendData;
    return type ? data[type] : data;
  }
}

// 数据格式化工具
export class DataFormatter {
  // 格式化日期
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM-DD':
        return `${month}-${day}`;
      case 'YYYY年MM月DD日':
        return `${year}年${month}月${day}日`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // 格式化时间
  static formatTime(time) {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  }

  // 格式化数字
  static formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '';
    return Number(num).toFixed(decimals);
  }

  // 格式化百分比
  static formatPercent(num, decimals = 1) {
    if (num === null || num === undefined) return '';
    return `${Number(num).toFixed(decimals)}%`;
  }

  // 格式化金额
  static formatCurrency(amount, currency = '¥') {
    if (amount === null || amount === undefined) return '';
    return `${currency}${Number(amount).toLocaleString()}`;
  }

  // 格式化状态
  static formatStatus(status) {
    const statusMap = {
      '正常': { color: 'green', text: '正常' },
      '异常': { color: 'red', text: '异常' },
      '运行中': { color: 'blue', text: '运行中' },
      '维护中': { color: 'orange', text: '维护中' },
      '停机': { color: 'red', text: '停机' },
      '进行中': { color: 'blue', text: '进行中' },
      '已完成': { color: 'green', text: '已完成' },
      '计划中': { color: 'gray', text: '计划中' },
      '合格': { color: 'green', text: '合格' },
      '不合格': { color: 'red', text: '不合格' },
      '库存不足': { color: 'red', text: '库存不足' },
      '库存充足': { color: 'green', text: '库存充足' }
    };
    
    return statusMap[status] || { color: 'default', text: status };
  }
}

// 数据计算工具
export class DataCalculator {
  // 计算生产效率
  static calculateEfficiency(actual, target) {
    if (!target || target === 0) return 0;
    return Math.round((actual / target) * 100 * 100) / 100;
  }

  // 计算合格率
  static calculatePassRate(passed, total) {
    if (!total || total === 0) return 0;
    return Math.round((passed / total) * 100 * 100) / 100;
  }

  // 计算OEE
  static calculateOEE(availability, performance, quality) {
    return Math.round(availability * performance * quality / 10000 * 100) / 100;
  }

  // 计算库存周转率
  static calculateTurnoverRate(consumption, avgStock) {
    if (!avgStock || avgStock === 0) return 0;
    return Math.round((consumption / avgStock) * 100) / 100;
  }

  // 计算设备利用率
  static calculateUtilization(runTime, totalTime) {
    if (!totalTime || totalTime === 0) return 0;
    return Math.round((runTime / totalTime) * 100 * 100) / 100;
  }

  // 计算平均值
  static calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  // 计算同比增长率
  static calculateGrowthRate(current, previous) {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }
}

// 数据生成工具（用于生成更多测试数据）
export class DataGenerator {
  // 生成随机日期范围内的数据
  static generateDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  }

  // 生成随机数值
  static generateRandomValue(min, max, decimals = 0) {
    const value = Math.random() * (max - min) + min;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  // 生成趋势数据
  static generateTrendData(baseValue, days = 7, variance = 0.1) {
    const data = [];
    const dates = this.generateDateRange(
      new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    dates.forEach((date, index) => {
      const trend = Math.sin(index * 0.5) * 0.1; // 添加趋势
      const random = (Math.random() - 0.5) * variance; // 添加随机波动
      const value = baseValue * (1 + trend + random);
      
      data.push({
        date,
        value: Math.round(value * 100) / 100
      });
    });

    return data;
  }
}

// 导出所有工具类
export default {
  DataService,
  DataFormatter,
  DataCalculator,
  DataGenerator
};