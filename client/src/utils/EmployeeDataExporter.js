/**
 * EmployeeDataExporter - 员工数据导入导出工具
 * 
 * 功能：
 * - 导出员工数据为JSON/CSV格式
 * - 从文件导入员工数据
 * - 数据格式验证和转换
 * - 批量操作支持
 * 
 * Requirements: 4.2, 7.4, 7.5
 */

import EmployeePersistence from './EmployeePersistence.js';

/**
 * 导出配置
 */
const EXPORT_CONFIG = {
  // 支持的导出格式
  FORMATS: {
    JSON: 'json',
    CSV: 'csv',
    EXCEL: 'xlsx'
  },
  
  // CSV字段映射
  CSV_FIELDS: [
    { key: 'id', label: 'ID' },
    { key: 'employeeId', label: '员工编号' },
    { key: 'name', label: '姓名' },
    { key: 'department', label: '部门' },
    { key: 'position', label: '职位' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'gender', label: '性别' },
    { key: 'age', label: '年龄' },
    { key: 'education', label: '学历' },
    { key: 'skillLevel', label: '技能等级' },
    { key: 'joinDate', label: '入职日期' },
    { key: 'emergencyContact', label: '紧急联系人' },
    { key: 'address', label: '地址' },
    { key: 'shift', label: '班次' },
    { key: 'status', label: '状态' },
    { key: 'remark', label: '备注' }
  ],
  
  // 文件名模板
  FILENAME_TEMPLATE: 'employees_export_{timestamp}',
  
  // 最大导出数量
  MAX_EXPORT_COUNT: 10000
};

/**
 * 员工数据导入导出器
 */
class EmployeeDataExporter {
  
  /**
   * 导出员工数据
   * @param {string} format - 导出格式 ('json', 'csv')
   * @param {Object} options - 导出选项
   * @returns {Promise<Object>} 导出结果
   */
  static async exportEmployees(format = 'json', options = {}) {
    try {
      console.log(`[EmployeeDataExporter] 开始导出员工数据，格式: ${format}`);
      
      // 获取员工数据
      const employees = await EmployeePersistence.loadEmployees();
      
      if (employees.length === 0) {
        throw new Error('没有员工数据可以导出');
      }
      
      if (employees.length > EXPORT_CONFIG.MAX_EXPORT_COUNT) {
        throw new Error(`员工数据过多，最多支持导出 ${EXPORT_CONFIG.MAX_EXPORT_COUNT} 条记录`);
      }
      
      // 根据格式导出
      let exportData;
      let mimeType;
      let fileExtension;
      
      switch (format.toLowerCase()) {
        case EXPORT_CONFIG.FORMATS.JSON:
          exportData = this._exportToJSON(employees, options);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
          
        case EXPORT_CONFIG.FORMATS.CSV:
          exportData = this._exportToCSV(employees, options);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        default:
          throw new Error(`不支持的导出格式: ${format}`);
      }
      
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${EXPORT_CONFIG.FILENAME_TEMPLATE.replace('{timestamp}', timestamp)}.${fileExtension}`;
      
      // 创建下载
      const result = await this._createDownload(exportData, filename, mimeType);
      
      console.log(`[EmployeeDataExporter] 员工数据导出成功，文件: ${filename}, 记录数: ${employees.length}`);
      
      return {
        success: true,
        filename,
        recordCount: employees.length,
        format,
        size: exportData.length,
        downloadUrl: result.downloadUrl
      };
      
    } catch (error) {
      console.error('[EmployeeDataExporter] 导出员工数据失败:', error);
      throw new Error(`导出失败: ${error.message}`);
    }
  }

  /**
   * 导入员工数据
   * @param {File} file - 导入文件
   * @param {Object} options - 导入选项
   * @returns {Promise<Object>} 导入结果
   */
  static async importEmployees(file, options = {}) {
    try {
      console.log(`[EmployeeDataExporter] 开始导入员工数据，文件: ${file.name}`);
      
      // 验证文件
      this._validateImportFile(file);
      
      // 读取文件内容
      const fileContent = await this._readFile(file);
      
      // 根据文件类型解析数据
      let employees;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      switch (fileExtension) {
        case 'json':
          employees = this._parseJSONImport(fileContent, options);
          break;
          
        case 'csv':
          employees = this._parseCSVImport(fileContent, options);
          break;
          
        default:
          throw new Error(`不支持的文件格式: ${fileExtension}`);
      }
      
      // 验证导入数据
      const validationResult = this._validateImportData(employees);
      if (!validationResult.valid) {
        throw new Error(`数据验证失败: ${validationResult.errors.join(', ')}`);
      }
      
      // 处理导入策略
      const importResult = await this._processImport(employees, options);
      
      console.log(`[EmployeeDataExporter] 员工数据导入成功，处理记录数: ${importResult.processed}`);
      
      return {
        success: true,
        filename: file.name,
        totalRecords: employees.length,
        processed: importResult.processed,
        skipped: importResult.skipped,
        errors: importResult.errors,
        warnings: importResult.warnings
      };
      
    } catch (error) {
      console.error('[EmployeeDataExporter] 导入员工数据失败:', error);
      throw new Error(`导入失败: ${error.message}`);
    }
  }

  /**
   * 获取导出模板
   * @param {string} format - 模板格式
   * @returns {Promise<Object>} 模板下载信息
   */
  static async getExportTemplate(format = 'csv') {
    try {
      console.log(`[EmployeeDataExporter] 生成导出模板，格式: ${format}`);
      
      // 创建示例数据
      const sampleEmployee = {
        id: '',
        employeeId: 'EMP001',
        name: '张三',
        department: '生产部',
        position: '操作员',
        phone: '13800138000',
        email: 'zhangsan@company.com',
        gender: '男',
        age: 30,
        education: '大专',
        skillLevel: '中级',
        joinDate: '2024-01-15',
        emergencyContact: '李四 13900139000',
        address: '北京市朝阳区',
        shift: '白班',
        status: '在职',
        remark: '示例员工数据'
      };
      
      let templateData;
      let mimeType;
      let fileExtension;
      
      switch (format.toLowerCase()) {
        case EXPORT_CONFIG.FORMATS.JSON:
          templateData = this._exportToJSON([sampleEmployee], { template: true });
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
          
        case EXPORT_CONFIG.FORMATS.CSV:
          templateData = this._exportToCSV([sampleEmployee], { template: true });
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        default:
          throw new Error(`不支持的模板格式: ${format}`);
      }
      
      const filename = `employee_template.${fileExtension}`;
      const result = await this._createDownload(templateData, filename, mimeType);
      
      console.log(`[EmployeeDataExporter] 模板生成成功: ${filename}`);
      
      return {
        success: true,
        filename,
        format,
        downloadUrl: result.downloadUrl
      };
      
    } catch (error) {
      console.error('[EmployeeDataExporter] 生成模板失败:', error);
      throw new Error(`模板生成失败: ${error.message}`);
    }
  }

  // ============================================================================
  // 私有方法 - 导出功能
  // ============================================================================

  /**
   * 导出为JSON格式
   * @private
   */
  static _exportToJSON(employees, options) {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        recordCount: employees.length,
        format: 'json'
      },
      employees: employees.map(emp => {
        // 移除内部字段
        const { _persistence, ...cleanEmployee } = emp;
        return cleanEmployee;
      })
    };
    
    return JSON.stringify(exportData, null, options.pretty ? 2 : 0);
  }

  /**
   * 导出为CSV格式
   * @private
   */
  static _exportToCSV(employees, options) {
    const fields = EXPORT_CONFIG.CSV_FIELDS;
    
    // 生成CSV头部
    const headers = fields.map(field => field.label).join(',');
    
    // 生成CSV数据行
    const rows = employees.map(employee => {
      return fields.map(field => {
        const value = employee[field.key] || '';
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [headers, ...rows].join('\n');
  }

  /**
   * 创建下载
   * @private
   */
  static _createDownload(data, filename, mimeType) {
    return new Promise((resolve) => {
      try {
        // 创建Blob对象
        const blob = new Blob([data], { type: mimeType });
        
        // 创建下载URL
        const downloadUrl = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 1000);
        
        resolve({
          success: true,
          downloadUrl,
          filename
        });
        
      } catch (error) {
        console.error('[EmployeeDataExporter] 创建下载失败:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  // ============================================================================
  // 私有方法 - 导入功能
  // ============================================================================

  /**
   * 验证导入文件
   * @private
   */
  static _validateImportFile(file) {
    if (!file) {
      throw new Error('请选择要导入的文件');
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`文件过大，最大支持 ${maxSize / 1024 / 1024}MB`);
    }
    
    const allowedExtensions = ['json', 'csv'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`不支持的文件格式，支持的格式: ${allowedExtensions.join(', ')}`);
    }
  }

  /**
   * 读取文件内容
   * @private
   */
  static _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(new Error('文件读取失败: ' + error.message));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 解析JSON导入数据
   * @private
   */
  static _parseJSONImport(content, options) {
    try {
      const data = JSON.parse(content);
      
      // 支持多种JSON格式
      if (data.employees && Array.isArray(data.employees)) {
        // 标准导出格式
        return data.employees;
      } else if (Array.isArray(data)) {
        // 简单数组格式
        return data;
      } else {
        throw new Error('无效的JSON格式，期望包含employees数组');
      }
      
    } catch (error) {
      throw new Error(`JSON解析失败: ${error.message}`);
    }
  }

  /**
   * 解析CSV导入数据
   * @private
   */
  static _parseCSVImport(content, options) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV文件至少需要包含标题行和一行数据');
      }
      
      // 解析标题行
      const headers = this._parseCSVLine(lines[0]);
      
      // 创建字段映射
      const fieldMap = this._createFieldMapping(headers);
      
      // 解析数据行
      const employees = [];
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this._parseCSVLine(lines[i]);
          if (values.length === 0) continue; // 跳过空行
          
          const employee = {};
          values.forEach((value, index) => {
            const fieldKey = fieldMap[index];
            if (fieldKey) {
              employee[fieldKey] = this._convertCSVValue(value, fieldKey);
            }
          });
          
          if (employee.name) { // 至少需要有姓名
            employees.push(employee);
          }
          
        } catch (error) {
          console.warn(`[EmployeeDataExporter] 跳过第${i + 1}行，解析失败:`, error.message);
        }
      }
      
      return employees;
      
    } catch (error) {
      throw new Error(`CSV解析失败: ${error.message}`);
    }
  }

  /**
   * 解析CSV行
   * @private
   */
  static _parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // 添加最后一个字段
    values.push(current.trim());
    
    return values;
  }

  /**
   * 创建字段映射
   * @private
   */
  static _createFieldMapping(headers) {
    const fieldMap = {};
    
    headers.forEach((header, index) => {
      // 查找匹配的字段
      const field = EXPORT_CONFIG.CSV_FIELDS.find(f => 
        f.label === header || f.key === header
      );
      
      if (field) {
        fieldMap[index] = field.key;
      }
    });
    
    return fieldMap;
  }

  /**
   * 转换CSV值
   * @private
   */
  static _convertCSVValue(value, fieldKey) {
    if (!value || value === '') return '';
    
    // 数字字段
    if (fieldKey === 'age' || fieldKey === 'id') {
      const num = parseInt(value);
      return isNaN(num) ? null : num;
    }
    
    // 日期字段
    if (fieldKey === 'joinDate') {
      // 尝试解析日期
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
    }
    
    return value.toString().trim();
  }

  /**
   * 验证导入数据
   * @private
   */
  static _validateImportData(employees) {
    const errors = [];
    const warnings = [];
    
    if (!Array.isArray(employees)) {
      errors.push('导入数据必须是数组格式');
      return { valid: false, errors, warnings };
    }
    
    if (employees.length === 0) {
      errors.push('导入数据不能为空');
      return { valid: false, errors, warnings };
    }
    
    if (employees.length > EXPORT_CONFIG.MAX_EXPORT_COUNT) {
      errors.push(`导入数据过多，最多支持 ${EXPORT_CONFIG.MAX_EXPORT_COUNT} 条记录`);
      return { valid: false, errors, warnings };
    }
    
    // 验证每条员工数据
    employees.forEach((employee, index) => {
      const rowNum = index + 1;
      
      if (!employee.name || employee.name.trim() === '') {
        errors.push(`第${rowNum}行：员工姓名不能为空`);
      }
      
      if (!employee.department || employee.department.trim() === '') {
        warnings.push(`第${rowNum}行：建议填写部门信息`);
      }
      
      if (!employee.position || employee.position.trim() === '') {
        warnings.push(`第${rowNum}行：建议填写职位信息`);
      }
      
      if (employee.email && !this._isValidEmail(employee.email)) {
        warnings.push(`第${rowNum}行：邮箱格式不正确`);
      }
      
      if (employee.phone && !this._isValidPhone(employee.phone)) {
        warnings.push(`第${rowNum}行：电话格式不正确`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 处理导入
   * @private
   */
  static async _processImport(employees, options) {
    const strategy = options.strategy || 'merge'; // merge, replace, skip
    let processed = 0;
    let skipped = 0;
    const errors = [];
    const warnings = [];
    
    try {
      if (strategy === 'replace') {
        // 替换模式：清除现有数据
        await EmployeePersistence.clearAllEmployees();
        console.log('[EmployeeDataExporter] 已清除现有员工数据');
      }
      
      // 获取现有员工数据（用于合并模式）
      const existingEmployees = strategy === 'merge' ? await EmployeePersistence.loadEmployees() : [];
      const existingIds = new Set(existingEmployees.map(emp => emp.employeeId || emp.id));
      
      // 处理每个员工
      for (const employee of employees) {
        try {
          const employeeId = employee.employeeId || employee.id;
          
          if (strategy === 'merge' && employeeId && existingIds.has(employeeId)) {
            if (options.skipDuplicates) {
              skipped++;
              warnings.push(`跳过重复员工: ${employee.name} (${employeeId})`);
              continue;
            } else {
              // 更新现有员工
              const existingEmployee = existingEmployees.find(emp => 
                (emp.employeeId || emp.id) === employeeId
              );
              if (existingEmployee) {
                await EmployeePersistence.updateEmployee(existingEmployee.id, employee);
                processed++;
                continue;
              }
            }
          }
          
          // 添加新员工
          await EmployeePersistence.addEmployee(employee);
          processed++;
          
        } catch (error) {
          errors.push(`处理员工 ${employee.name} 失败: ${error.message}`);
          console.error('[EmployeeDataExporter] 处理员工失败:', error);
        }
      }
      
      console.log(`[EmployeeDataExporter] 导入处理完成，成功: ${processed}, 跳过: ${skipped}, 错误: ${errors.length}`);
      
      return {
        processed,
        skipped,
        errors,
        warnings
      };
      
    } catch (error) {
      console.error('[EmployeeDataExporter] 导入处理失败:', error);
      throw new Error(`导入处理失败: ${error.message}`);
    }
  }

  /**
   * 验证邮箱格式
   * @private
   */
  static _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证电话格式
   * @private
   */
  static _isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }
}

export default EmployeeDataExporter;
export { EXPORT_CONFIG };