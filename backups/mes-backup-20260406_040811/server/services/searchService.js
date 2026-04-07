const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

class SearchService {
  async globalSearch(keyword, options = {}) {
    const { limit = 20 } = options;
    const results = {};
    
    try {
      const searchResults = await sequelize.query(
        'SELECT * FROM production_orders WHERE order_number LIKE :keyword LIMIT :limit',
        {
          replacements: { keyword: '%' + keyword + '%', limit: parseInt(limit) },
          type: QueryTypes.SELECT
        }
      );
      
      if (searchResults.length > 0) {
        results.production_orders = {
          label: '生产订单',
          count: searchResults.length,
          data: searchResults
        };
      }
    } catch (error) {
      logger.warn('搜索失败', { error: error.message });
    }
    
    return {
      keyword,
      total: Object.values(results).reduce((sum, r) => sum + r.count, 0),
      results
    };
  }
  
  async getSuggestions(keyword) {
    return [];
  }
}

module.exports = new SearchService();
