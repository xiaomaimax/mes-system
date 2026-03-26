/**
 * API服务 - 从后端获取数据库中的真实数据
 */

// 配置常量
const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api',
  TOKEN_STORAGE_KEY: 'token',
  SESSION_TOKEN_KEY: 'token'
};

// 错误类型定义
class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

class AuthenticationError extends APIError {
  constructor(message, status) {
    super(message, status);
    this.name = 'AuthenticationError';
  }
}

// Token管理器
class TokenManager {
  static getToken() {
    return localStorage.getItem(CONFIG.TOKEN_STORAGE_KEY) || 
           sessionStorage.getItem(CONFIG.SESSION_TOKEN_KEY);
  }

  static setToken(token, persistent = true) {
    if (persistent) {
      localStorage.setItem(CONFIG.TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.setItem(CONFIG.SESSION_TOKEN_KEY, token);
    }
  }

  static clearToken() {
    localStorage.removeItem(CONFIG.TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(CONFIG.SESSION_TOKEN_KEY);
  }

  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

// 熔断器模式实现
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new APIError('服务暂时不可用，请稍后重试', 503);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// HTTP客户端
class HTTPClient {
  constructor(baseURL = CONFIG.API_BASE_URL) {
    this.baseURL = baseURL;
    this.circuitBreaker = new CircuitBreaker();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      retryableErrors: ['TypeError', 'NetworkError', 'TimeoutError']
    };
  }

  async request(endpoint, options = {}) {
    return this.circuitBreaker.execute(() => 
      this._requestWithRetry(endpoint, options, 0)
    );
  }

  async _requestWithRetry(endpoint, options, retryCount) {
    const token = TokenManager.getToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      // 添加默认超时时间
      signal: AbortSignal.timeout(options.timeout || 30000)
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
      
      // 检查是否需要重试的HTTP状态码
      if (!response.ok && this._shouldRetryStatus(response.status) && retryCount < this.retryConfig.maxRetries) {
        console.warn(`HTTP ${response.status} 错误，正在重试 (${retryCount + 1}/${this.retryConfig.maxRetries})...`);
        await this._delay(retryCount);
        return this._requestWithRetry(endpoint, options, retryCount + 1);
      }
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
        // handleErrorResponse会抛出错误，不会执行到这里
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // 检查是否为可重试的网络错误
      if (this._shouldRetryError(error) && retryCount < this.retryConfig.maxRetries) {
        console.warn(`网络请求失败，正在重试 (${retryCount + 1}/${this.retryConfig.maxRetries}): ${error.message}`);
        await this._delay(retryCount);
        return this._requestWithRetry(endpoint, options, retryCount + 1);
      }
      
      // 网络连接错误
      if (this._isNetworkError(error)) {
        throw new APIError('无法连接到服务器，请检查网络连接或后端服务状态', 0);
      }
      
      throw new APIError(`网络请求失败: ${error.message}`, 0);
    }
  }

  /**
   * 判断HTTP状态码是否应该重试
   */
  _shouldRetryStatus(status) {
    return this.retryConfig.retryableStatuses.includes(status);
  }

  /**
   * 判断错误是否应该重试
   */
  _shouldRetryError(error) {
    return this.retryConfig.retryableErrors.some(errorType => 
      error.name === errorType || error.message.includes(errorType.toLowerCase())
    );
  }

  /**
   * 判断是否为网络错误
   */
  _isNetworkError(error) {
    return error.name === 'TypeError' && error.message.includes('fetch');
  }

  /**
   * 计算重试延迟时间（指数退避 + 抖动）
   */
  _delay(retryCount) {
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% 抖动
    const delay = Math.min(exponentialDelay + jitter, this.retryConfig.maxDelay);
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async handleErrorResponse(response) {
    const isAuthError = response.status === 401 || response.status === 403;
    
    if (isAuthError) {
      console.error('🚨 认证失败 - Token已过期');
      
      // 清除过期的token
      TokenManager.clearToken();
      
      // 触发认证失败事件，让应用处理重新登录
      const authFailedEvent = new CustomEvent('authFailed', {
        detail: { status: response.status, message: 'Token已过期' }
      });
      window.dispatchEvent(authFailedEvent);
      
      // 开发环境下显示修复指令
      if (process.env.NODE_ENV === 'development') {
        console.log(`
🔧 开发环境 Token 修复指南:
请联系系统管理员获取新的认证令牌，或重新登录系统。
        `);
      }
      
      throw new AuthenticationError('认证失败 - Token已过期，请重新登录', response.status);
    }
    
    let errorMessage = `API请求失败: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 忽略解析错误，使用默认消息
    }
    
    throw new APIError(errorMessage, response.status, response);
  }
}

// 创建HTTP客户端实例
const httpClient = new HTTPClient();

// 基础API服务类
class BaseAPIService {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async request(endpoint, options = {}) {
    return httpClient.request(`${this.basePath}${endpoint}`, options);
  }

  // 通用CRUD操作
  async getList(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(query ? `?${query}` : '');
  }

  async getById(id) {
    return this.request(`/${id}`);
  }

  async create(data) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id, data) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }
}

// ============================================================================
// 工艺模块 API
// ============================================================================

class ProcessAPIService extends BaseAPIService {
  constructor() {
    super('/modules');
  }

  async getProcessRouting(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/process-routing${query ? `?${query}` : ''}`);
  }

  async getProcessParameters(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/process-parameters${query ? `?${query}` : ''}`);
  }
}

export const ProcessAPI = new ProcessAPIService();

// ============================================================================
// 生产模块 API
// ============================================================================

class ProductionAPIService extends BaseAPIService {
  constructor() {
    super('/modules');
  }

  async getProductionLines() {
    return this.request('/production-lines');
  }

  async getDailyProductionReport(params = {}) {
    return this.request(`/daily-production-report${this._buildQuery(params)}`);
  }

  async getShiftSchedule() {
    return this.request('/shift-schedule');
  }

  _buildQuery(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }
}

export const ProductionAPI = new ProductionAPIService();

// ============================================================================
// 库存模块 API
// ============================================================================

class InventoryAPIService extends BaseAPIService {
  constructor() {
    super('/modules');
  }

  async getInventory(params = {}) {
    return this.request(`/inventory${this._buildQuery(params)}`);
  }

  async getInventoryTransactions(params = {}) {
    return this.request(`/inventory-transactions${this._buildQuery(params)}`);
  }

  _buildQuery(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }
}

export const InventoryAPI = new InventoryAPIService();

// ============================================================================
// 质量模块 API
// ============================================================================

class QualityAPIService extends BaseAPIService {
  constructor() {
    super('/quality');
  }

  // IQC检验
  async getIQCInspections(params = {}) {
    return this.request(`/iqc-inspections${this._buildQuery(params)}`);
  }

  async createIQCInspection(data) {
    return this.request('/iqc-inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PQC检验
  async getPQCInspections(params = {}) {
    return this.request(`/pqc-inspections${this._buildQuery(params)}`);
  }

  async createPQCInspection(data) {
    return this.request('/pqc-inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // FQC检验
  async getFQCInspections(params = {}) {
    return this.request(`/fqc-inspections${this._buildQuery(params)}`);
  }

  async createFQCInspection(data) {
    return this.request('/fqc-inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // OQC检验
  async getOQCInspections(params = {}) {
    return this.request(`/oqc-inspections${this._buildQuery(params)}`);
  }

  async createOQCInspection(data) {
    return this.request('/oqc-inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 次品原因
  async getDefectReasons() {
    return this.request('/defect-reasons');
  }

  async createDefectReason(data) {
    return this.request('/defect-reasons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 检验标准
  async getInspectionStandards() {
    return this.request('/inspection-standards');
  }

  async createInspectionStandard(data) {
    return this.request('/inspection-standards', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 次品记录
  async getDefectRecords(params = {}) {
    return this.request(`/defect-records${this._buildQuery(params)}`);
  }

  async createDefectRecord(data) {
    return this.request('/defect-records', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 批次追溯
  async getBatchTracing(params = {}) {
    return this.request(`/batch-tracing${this._buildQuery(params)}`);
  }

  async getBatchTracingDetail(batchNumber) {
    return this.request(`/batch-tracing/${batchNumber}`);
  }

  async createBatchTracing(data) {
    return this.request('/batch-tracing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 兼容旧API
  async getQualityInspections(params = {}) {
    return httpClient.request(`/modules/quality-inspections${this._buildQuery(params)}`);
  }

  async getDefectRecordsLegacy() {
    return httpClient.request('/modules/defect-records');
  }

  // 私有辅助方法
  _buildQuery(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }
}

export const QualityAPI = new QualityAPIService();

// ============================================================================
// 设备模块 API
// ============================================================================

class EquipmentAPIService extends BaseAPIService {
  constructor() {
    super('/modules');
  }

  async getEquipmentMaintenance(params = {}) {
    return this.request(`/equipment-maintenance${this._buildQuery(params)}`);
  }

  _buildQuery(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }
}

export const EquipmentAPI = new EquipmentAPIService();

// ============================================================================
// 统计数据 API
// ============================================================================

class StatisticsAPIService extends BaseAPIService {
  constructor() {
    super('/modules/statistics');
  }

  async getOverview() {
    return this.request('/overview');
  }
}

export const StatisticsAPI = new StatisticsAPIService();

// ============================================================================
// 排程模块 API
// ============================================================================

class SchedulingAPIService extends BaseAPIService {
  constructor() {
    super('/scheduling');
  }

  async getMaterials() {
    return this.request('/materials');
  }

  async getDevices() {
    return this.request('/devices');
  }

  async getMolds() {
    return this.request('/molds');
  }

  async getPlanOrders() {
    return this.request('/plans');
  }

  async getProductionTasks(params = {}) {
    return this.request(`/tasks${this._buildQuery(params)}`);
  }

  async getProductionTaskDetail(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async updateProductionTask(taskId, data) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProductionTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  _buildQuery(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }
}

export const SchedulingAPI = new SchedulingAPIService();

// ============================================================================
// 导出所有API服务
// ============================================================================

export default {
  ProcessAPI,
  ProductionAPI,
  InventoryAPI,
  QualityAPI,
  EquipmentAPI,
  StatisticsAPI,
  SchedulingAPI,
  // 导出工具类供高级用户使用
  TokenManager,
  HTTPClient,
  APIError,
  AuthenticationError
};
