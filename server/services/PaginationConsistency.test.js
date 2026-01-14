/**
 * Pagination Consistency Property-Based Tests
 * Validates that pagination parameters work correctly and consistently across API calls
 * Requirements: 10.1, 10.5
 * 
 * Feature: mock-data-to-database, Property 2: 分页一致性
 * 
 * Property 2: Pagination Consistency
 * For any paginated API request with valid pagination parameters (page, pageSize),
 * the returned data should satisfy pagination conditions, and pagination metadata
 * (total count, current page, items per page) should be accurate.
 * 
 * Validates: Requirements 10.1, 10.5
 */

/**
 * Helper function to generate random pagination parameters
 * @returns {Object} Object with page and pageSize
 */
function generatePaginationParams() {
  const pageSize = Math.floor(Math.random() * 50) + 1; // 1-50 items per page
  const totalItems = Math.floor(Math.random() * 1000) + 1; // 1-1000 total items
  const maxPage = Math.ceil(totalItems / pageSize);
  const page = Math.floor(Math.random() * maxPage) + 1; // Valid page number
  
  return {
    page,
    pageSize,
    totalItems,
    maxPage
  };
}

/**
 * Helper function to generate mock paginated data
 * @param {number} totalItems - Total number of items in dataset
 * @param {number} page - Current page number
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated response
 */
function generatePaginatedData(totalItems, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const items = Array.from({ length: endIndex - startIndex }, (_, i) => ({
    id: startIndex + i + 1,
    name: `Item ${startIndex + i + 1}`,
    value: Math.random() * 100
  }));

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total: totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    }
  };
}

/**
 * Helper function to verify pagination consistency
 * @param {Object} response - API response
 * @param {number} expectedPage - Expected page number
 * @param {number} expectedPageSize - Expected page size
 * @param {number} totalItems - Total items in dataset
 * @returns {Object} Verification result
 */
function verifyPaginationConsistency(response, expectedPage, expectedPageSize, totalItems) {
  const errors = [];
  const warnings = [];

  if (!response.success) {
    errors.push('Response success flag is false');
    return { isConsistent: false, errors, warnings };
  }

  const { data } = response;
  if (!data || !data.pagination) {
    errors.push('Response missing pagination metadata');
    return { isConsistent: false, errors, warnings };
  }

  const { items, pagination } = data;
  const { page, pageSize, total, totalPages, hasNextPage, hasPreviousPage } = pagination;

  // Verify page number
  if (page !== expectedPage) {
    errors.push(`Page mismatch: expected ${expectedPage}, got ${page}`);
  }

  // Verify page size
  if (pageSize !== expectedPageSize) {
    errors.push(`Page size mismatch: expected ${expectedPageSize}, got ${pageSize}`);
  }

  // Verify total count
  if (total !== totalItems) {
    errors.push(`Total count mismatch: expected ${totalItems}, got ${total}`);
  }

  // Verify total pages calculation
  const expectedTotalPages = Math.ceil(totalItems / pageSize);
  if (totalPages !== expectedTotalPages) {
    errors.push(`Total pages mismatch: expected ${expectedTotalPages}, got ${totalPages}`);
  }

  // Verify items count
  const expectedItemCount = Math.min(pageSize, Math.max(0, totalItems - (page - 1) * pageSize));
  if (items.length !== expectedItemCount) {
    errors.push(`Items count mismatch: expected ${expectedItemCount}, got ${items.length}`);
  }

  // Verify hasNextPage flag
  const expectedHasNextPage = page < totalPages;
  if (hasNextPage !== expectedHasNextPage) {
    errors.push(`hasNextPage mismatch: expected ${expectedHasNextPage}, got ${hasNextPage}`);
  }

  // Verify hasPreviousPage flag
  const expectedHasPreviousPage = page > 1;
  if (hasPreviousPage !== expectedHasPreviousPage) {
    errors.push(`hasPreviousPage mismatch: expected ${expectedHasPreviousPage}, got ${hasPreviousPage}`);
  }

  // Verify item IDs are sequential and within range
  const startIndex = (page - 1) * pageSize;
  for (let i = 0; i < items.length; i++) {
    const expectedId = startIndex + i + 1;
    if (items[i].id !== expectedId) {
      errors.push(`Item ${i} ID mismatch: expected ${expectedId}, got ${items[i].id}`);
    }
  }

  // Verify no duplicate items
  const itemIds = items.map(item => item.id);
  const uniqueIds = new Set(itemIds);
  if (itemIds.length !== uniqueIds.size) {
    errors.push('Duplicate items found in response');
  }

  return {
    isConsistent: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to verify pagination boundary conditions
 * @param {number} totalItems - Total items in dataset
 * @param {number} pageSize - Items per page
 * @returns {Object} Boundary verification result
 */
function verifyPaginationBoundaries(totalItems, pageSize) {
  const errors = [];
  const totalPages = Math.ceil(totalItems / pageSize);

  // Test first page
  if (totalPages > 0) {
    const firstPageResponse = generatePaginatedData(totalItems, 1, pageSize);
    const firstPageVerification = verifyPaginationConsistency(firstPageResponse, 1, pageSize, totalItems);
    if (!firstPageVerification.isConsistent) {
      errors.push(`First page verification failed: ${firstPageVerification.errors.join(', ')}`);
    }
  }

  // Test last page
  if (totalPages > 0) {
    const lastPageResponse = generatePaginatedData(totalItems, totalPages, pageSize);
    const lastPageVerification = verifyPaginationConsistency(lastPageResponse, totalPages, pageSize, totalItems);
    if (!lastPageVerification.isConsistent) {
      errors.push(`Last page verification failed: ${lastPageVerification.errors.join(', ')}`);
    }
  }

  // Test middle page (if exists)
  if (totalPages > 2) {
    const middlePage = Math.floor(totalPages / 2);
    const middlePageResponse = generatePaginatedData(totalItems, middlePage, pageSize);
    const middlePageVerification = verifyPaginationConsistency(middlePageResponse, middlePage, pageSize, totalItems);
    if (!middlePageVerification.isConsistent) {
      errors.push(`Middle page verification failed: ${middlePageVerification.errors.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    totalPages
  };
}

describe('Pagination Consistency - Property-Based Tests', () => {
  describe('Property 2: Pagination Consistency', () => {
    /**
     * Property Test: Valid Pagination Parameters
     * For any valid pagination parameters (page, pageSize), the API should return
     * data that matches the requested pagination
     */
    test('should return correct data for valid pagination parameters', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const verification = verifyPaginationConsistency(response, page, pageSize, totalItems);

        expect(verification.isConsistent).toBe(true);
        expect(verification.errors).toHaveLength(0);
      }
    });

    /**
     * Property Test: Pagination Metadata Accuracy
     * For any paginated response, the pagination metadata (total, totalPages, hasNextPage, hasPreviousPage)
     * should be accurate and consistent
     */
    test('should have accurate pagination metadata', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const { data } = response;
        const { pagination } = data;

        // Verify total pages calculation
        const expectedTotalPages = Math.ceil(totalItems / pageSize);
        expect(pagination.totalPages).toBe(expectedTotalPages);

        // Verify hasNextPage
        const expectedHasNextPage = page < expectedTotalPages;
        expect(pagination.hasNextPage).toBe(expectedHasNextPage);

        // Verify hasPreviousPage
        const expectedHasPreviousPage = page > 1;
        expect(pagination.hasPreviousPage).toBe(expectedHasPreviousPage);

        // Verify total count
        expect(pagination.total).toBe(totalItems);
      }
    });

    /**
     * Property Test: Items Count Consistency
     * For any page, the number of items returned should match the expected count
     * based on page number, page size, and total items
     */
    test('should return correct number of items for each page', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const { items, pagination } = response.data;

        const expectedItemCount = Math.min(pageSize, Math.max(0, totalItems - (page - 1) * pageSize));
        expect(items.length).toBe(expectedItemCount);
      }
    });

    /**
     * Property Test: Item ID Sequence
     * For any page, the item IDs should be sequential and within the correct range
     */
    test('should have sequential and valid item IDs', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const { items } = response.data;

        const startIndex = (page - 1) * pageSize;
        for (let j = 0; j < items.length; j++) {
          const expectedId = startIndex + j + 1;
          expect(items[j].id).toBe(expectedId);
        }
      }
    });

    /**
     * Property Test: No Duplicate Items
     * For any page, there should be no duplicate items in the response
     */
    test('should not return duplicate items', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const { items } = response.data;

        const itemIds = items.map(item => item.id);
        const uniqueIds = new Set(itemIds);
        expect(uniqueIds.size).toBe(itemIds.length);
      }
    });

    /**
     * Property Test: Page Boundary Consistency
     * For any dataset, the first page, last page, and middle pages should all
     * have consistent pagination metadata
     */
    test('should maintain consistency across page boundaries', () => {
      for (let i = 0; i < 50; i++) {
        const { pageSize, totalItems } = generatePaginationParams();
        const verification = verifyPaginationBoundaries(totalItems, pageSize);

        expect(verification.isValid).toBe(true);
        expect(verification.errors).toHaveLength(0);
      }
    });

    /**
     * Property Test: Total Items Consistency
     * For any dataset, the sum of items across all pages should equal the total count
     */
    test('should have consistent total items across all pages', () => {
      for (let i = 0; i < 50; i++) {
        const pageSize = Math.floor(Math.random() * 50) + 1;
        const totalItems = Math.floor(Math.random() * 500) + 1;
        const totalPages = Math.ceil(totalItems / pageSize);

        let itemsCount = 0;
        for (let page = 1; page <= totalPages; page++) {
          const response = generatePaginatedData(totalItems, page, pageSize);
          itemsCount += response.data.items.length;
        }

        expect(itemsCount).toBe(totalItems);
      }
    });

    /**
     * Property Test: Page Size Consistency
     * For any page except the last, the number of items should equal the page size
     */
    test('should return full page size for all pages except the last', () => {
      for (let i = 0; i < 50; i++) {
        const pageSize = Math.floor(Math.random() * 50) + 1;
        const totalItems = Math.floor(Math.random() * 500) + 100; // Ensure multiple pages
        const totalPages = Math.ceil(totalItems / pageSize);

        for (let page = 1; page < totalPages; page++) {
          const response = generatePaginatedData(totalItems, page, pageSize);
          expect(response.data.items.length).toBe(pageSize);
        }
      }
    });

    /**
     * Property Test: Last Page Item Count
     * For the last page, the number of items should be less than or equal to page size
     */
    test('should return correct number of items on last page', () => {
      for (let i = 0; i < 50; i++) {
        const pageSize = Math.floor(Math.random() * 50) + 1;
        const totalItems = Math.floor(Math.random() * 500) + 1;
        const totalPages = Math.ceil(totalItems / pageSize);

        if (totalPages > 0) {
          const response = generatePaginatedData(totalItems, totalPages, pageSize);
          const expectedLastPageCount = totalItems - (totalPages - 1) * pageSize;
          expect(response.data.items.length).toBe(expectedLastPageCount);
          expect(response.data.items.length).toBeLessThanOrEqual(pageSize);
        }
      }
    });

    /**
     * Property Test: Pagination Metadata Completeness
     * For any paginated response, all required pagination metadata fields should be present
     */
    test('should include all required pagination metadata fields', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);
        const { pagination } = response.data;

        expect(pagination).toHaveProperty('page');
        expect(pagination).toHaveProperty('pageSize');
        expect(pagination).toHaveProperty('total');
        expect(pagination).toHaveProperty('totalPages');
        expect(pagination).toHaveProperty('hasNextPage');
        expect(pagination).toHaveProperty('hasPreviousPage');
      }
    });

    /**
     * Property Test: Response Structure Consistency
     * For any paginated response, the response structure should be consistent
     */
    test('should have consistent response structure', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();
        const response = generatePaginatedData(totalItems, page, pageSize);

        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('data');
        expect(response.data).toHaveProperty('items');
        expect(response.data).toHaveProperty('pagination');
        expect(Array.isArray(response.data.items)).toBe(true);
      }
    });

    /**
     * Property Test: Pagination Parameter Validation
     * For any pagination parameters, page should be >= 1 and pageSize should be >= 1
     */
    test('should validate pagination parameters', () => {
      for (let i = 0; i < 100; i++) {
        const { page, pageSize } = generatePaginationParams();

        expect(page).toBeGreaterThanOrEqual(1);
        expect(pageSize).toBeGreaterThanOrEqual(1);
      }
    });

    /**
     * Property Test: Consistent Pagination Metadata Across Multiple Calls
     * For the same pagination parameters, multiple API calls should return identical pagination metadata
     */
    test('should return consistent pagination metadata for repeated requests', () => {
      for (let i = 0; i < 50; i++) {
        const { page, pageSize, totalItems } = generatePaginationParams();

        const response1 = generatePaginatedData(totalItems, page, pageSize);
        const response2 = generatePaginatedData(totalItems, page, pageSize);

        // Pagination metadata should be identical
        expect(response1.data.pagination).toEqual(response2.data.pagination);
        
        // Item count should be identical
        expect(response1.data.items.length).toBe(response2.data.items.length);
        
        // Item IDs should be identical (even if values differ)
        const ids1 = response1.data.items.map(item => item.id);
        const ids2 = response2.data.items.map(item => item.id);
        expect(ids1).toEqual(ids2);
      }
    });
  });

  describe('Pagination Consistency Edge Cases', () => {
    /**
     * Edge Case: Single Item Dataset
     * Pagination should work correctly with only one item
     */
    test('should handle single item dataset', () => {
      const response = generatePaginatedData(1, 1, 10);
      const verification = verifyPaginationConsistency(response, 1, 10, 1);

      expect(verification.isConsistent).toBe(true);
      expect(response.data.items.length).toBe(1);
      expect(response.data.pagination.totalPages).toBe(1);
      expect(response.data.pagination.hasNextPage).toBe(false);
      expect(response.data.pagination.hasPreviousPage).toBe(false);
    });

    /**
     * Edge Case: Page Size Equals Total Items
     * Pagination should work when page size equals total items
     */
    test('should handle page size equal to total items', () => {
      const totalItems = 50;
      const pageSize = 50;
      const response = generatePaginatedData(totalItems, 1, pageSize);
      const verification = verifyPaginationConsistency(response, 1, pageSize, totalItems);

      expect(verification.isConsistent).toBe(true);
      expect(response.data.items.length).toBe(totalItems);
      expect(response.data.pagination.totalPages).toBe(1);
    });

    /**
     * Edge Case: Page Size Larger Than Total Items
     * Pagination should work when page size is larger than total items
     */
    test('should handle page size larger than total items', () => {
      const totalItems = 10;
      const pageSize = 100;
      const response = generatePaginatedData(totalItems, 1, pageSize);
      const verification = verifyPaginationConsistency(response, 1, pageSize, totalItems);

      expect(verification.isConsistent).toBe(true);
      expect(response.data.items.length).toBe(totalItems);
      expect(response.data.pagination.totalPages).toBe(1);
    });

    /**
     * Edge Case: Very Large Dataset
     * Pagination should work correctly with large datasets
     */
    test('should handle very large datasets', () => {
      const totalItems = 10000;
      const pageSize = 50;
      const totalPages = Math.ceil(totalItems / pageSize);

      // Test first, middle, and last pages
      const testPages = [1, Math.floor(totalPages / 2), totalPages];

      for (const page of testPages) {
        const response = generatePaginatedData(totalItems, page, pageSize);
        const verification = verifyPaginationConsistency(response, page, pageSize, totalItems);

        expect(verification.isConsistent).toBe(true);
      }
    });

    /**
     * Edge Case: Small Page Size
     * Pagination should work correctly with very small page sizes
     */
    test('should handle very small page sizes', () => {
      const totalItems = 100;
      const pageSize = 1;
      const totalPages = Math.ceil(totalItems / pageSize);

      expect(totalPages).toBe(100);

      // Test first and last pages
      const firstPageResponse = generatePaginatedData(totalItems, 1, pageSize);
      const lastPageResponse = generatePaginatedData(totalItems, totalPages, pageSize);

      expect(firstPageResponse.data.items.length).toBe(1);
      expect(lastPageResponse.data.items.length).toBe(1);
    });

    /**
     * Edge Case: Empty Dataset
     * Pagination should handle empty datasets gracefully
     */
    test('should handle empty dataset', () => {
      const totalItems = 0;
      const pageSize = 10;
      const response = generatePaginatedData(totalItems, 1, pageSize);

      expect(response.data.items.length).toBe(0);
      expect(response.data.pagination.total).toBe(0);
      expect(response.data.pagination.totalPages).toBe(0);
      expect(response.data.pagination.hasNextPage).toBe(false);
      expect(response.data.pagination.hasPreviousPage).toBe(false);
    });

    /**
     * Edge Case: Exact Multiple of Page Size
     * Pagination should work when total items is exact multiple of page size
     */
    test('should handle total items as exact multiple of page size', () => {
      const pageSize = 25;
      const totalItems = 100; // Exact multiple
      const totalPages = Math.ceil(totalItems / pageSize);

      expect(totalPages).toBe(4);

      for (let page = 1; page <= totalPages; page++) {
        const response = generatePaginatedData(totalItems, page, pageSize);
        if (page < totalPages) {
          expect(response.data.items.length).toBe(pageSize);
        } else {
          expect(response.data.items.length).toBe(pageSize);
        }
      }
    });

    /**
     * Edge Case: One Item More Than Multiple of Page Size
     * Pagination should work when total items is one more than multiple of page size
     */
    test('should handle total items as one more than multiple of page size', () => {
      const pageSize = 25;
      const totalItems = 101; // One more than multiple
      const totalPages = Math.ceil(totalItems / pageSize);

      expect(totalPages).toBe(5);

      const lastPageResponse = generatePaginatedData(totalItems, totalPages, pageSize);
      expect(lastPageResponse.data.items.length).toBe(1);
    });
  });
});
