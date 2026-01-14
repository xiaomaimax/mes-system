# Quality Data Hook Improvements

## Overview

The `useQualityData` custom hook has been enhanced with improved error handling, authentication validation, and data safety mechanisms. These changes ensure more robust data loading for quality inspection modules (IQC, OQC, FQC, PQC).

## What Changed

### 1. Pagination Parameter Refactoring (Latest)
- `loadData()` now accepts `pageNum` and `pageSize` parameters directly
- Pagination state is updated within `loadData()` instead of requiring separate state management
- `handlePaginationChange()` now directly calls `loadData()` with new pagination values
- Removed pagination state from dependency array to prevent infinite loops
- Cleaner API: components call `loadData(page, pageSize)` directly

```javascript
// Before: Pagination state managed separately
const handlePaginationChange = (page, pageSize) => {
  setPagination(prev => ({
    ...prev,
    current: page,
    pageSize: pageSize
  }));
};

// After: Pagination passed directly to loadData
const handlePaginationChange = (page, pageSize) => {
  loadData(page, pageSize);
};

// Initial load with default pagination
useEffect(() => {
  loadData(1, 10);
}, [loadData]);
```

### 2. Enhanced Error State Management
- Added `error` state to track and expose error messages
- Error state is cleared on each new data load attempt
- Errors are returned as part of the hook's return value

```javascript
const [error, setError] = useState(null);

// Usage in components
const { data, loading, error, loadData } = useQualityData(...);
```

### 3. Authentication Token Validation
- Validates token existence before making API calls
- Checks both `localStorage` and `sessionStorage` for tokens
- Throws clear error if token is missing
- Triggers `authFailed` event for automatic re-login handling

```javascript
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (!token) {
  throw new Error('未找到认证Token，请重新登录');
}
```

### 4. API Function Validation
- Validates that the `apiFunction` parameter is provided and is a valid function
- Prevents runtime errors from undefined or invalid API functions
- Throws clear error if API function is missing or invalid
- Ensures data loading fails gracefully with informative error message

```javascript
if (!apiFunction || typeof apiFunction !== 'function') {
  throw new Error('API函数未定义或不是有效的函数');
}
```

### 5. Improved Response Validation
- Validates response object existence
- Checks for authentication errors (401, 403 status codes)
- Validates response code and message
- Provides specific error messages for different failure scenarios

```javascript
if (!response) {
  throw new Error('服务器无响应');
}

if (response.success === false || response.code === 401 || response.code === 403) {
  throw new Error('认证失败，请重新登录');
}
```

### 6. Data Type Safety
- Validates that API response data is an array
- Prevents crashes from malformed data
- Logs warnings for non-array responses
- Safely handles empty data sets

```javascript
if (!Array.isArray(responseData)) {
  console.warn('API返回的数据不是数组:', responseData);
  setData([]);
  return;
}
```

### 7. Data Transformation Error Handling
- Wraps transformer function in try-catch
- Catches and logs transformation errors
- Prevents partial/corrupted data from being displayed
- Shows user-friendly error message

```javascript
try {
  formattedData = transformer(responseData);
} catch (transformError) {
  console.error('数据转换失败:', transformError);
  message.error('数据格式异常，请联系管理员');
  setData([]);
  return;
}
```

### 8. Context-Aware Error Messages
- Provides specific error messages based on error type
- Handles token/authentication errors
- Handles network errors
- Handles server response errors
- Dispatches custom events for authentication failures

```javascript
if (error.message.includes('Token') || error.message.includes('认证')) {
  message.error('登录已过期，请重新登录');
  window.dispatchEvent(new CustomEvent('authFailed'));
} else if (error.message.includes('网络')) {
  message.error('网络连接失败，请检查网络状态');
} else if (error.message.includes('无响应')) {
  message.error('服务器无响应，请检查后端服务是否正常运行');
}
```

### 9. Pagination Safety
- Safely handles missing pagination data
- Defaults to 0 if total is undefined
- Prevents pagination errors
- Pagination parameters are now passed directly to `loadData()` for cleaner state management

```javascript
if (response.pagination) {
  setPagination(prev => ({
    ...prev,
    current: pageNum,
    pageSize: pageSize,
    total: response.pagination.total || 0
  }));
} else {
  // Even without pagination info, update current page and size
  setPagination(prev => ({
    ...prev,
    current: pageNum,
    pageSize: pageSize
  }));
}
```

## Impact on Components

### Affected Quality Modules
- IQC Inspection (IQCInspection.js)
- OQC Inspection (OQCInspection.js)
- FQC Inspection (FQCInspection.js)
- PQC Inspection (PQCInspection.js)

### Component Usage
Components using this hook now have access to error information:

```javascript
const { data, loading, error, pagination, loadData, handlePaginationChange } = useQualityData(
  QualityAPI.getPQCInspections,
  transformPQCData
);

// Components can now display error state
{error && <Alert message="Error" description={error} type="error" />}
```

## Benefits

1. **Improved Reliability**: Comprehensive error handling prevents crashes
2. **Better User Experience**: Clear, actionable error messages
3. **Enhanced Security**: Token validation before API calls
4. **API Function Safety**: Validates API functions before execution
5. **Data Integrity**: Type checking and transformation validation
6. **Easier Debugging**: Detailed console logging for troubleshooting
7. **Automatic Recovery**: Auth failure triggers re-login flow
8. **Cleaner Pagination**: Pagination parameters passed directly to `loadData()` eliminates complex state management
9. **Prevents Infinite Loops**: Removed pagination state from dependency array, reducing re-render cycles
10. **Simpler Component Code**: Components no longer need separate pagination state handlers

## Migration Guide

### For Existing Components
If you're using `useQualityData` in existing components, update them to use the new pagination parameter approach:

```javascript
// Before (old approach with separate pagination state)
const { data, loading, pagination, loadData, handlePaginationChange } = useQualityData(...);

const handlePaginationChange = (page, pageSize) => {
  setPagination(prev => ({
    ...prev,
    current: page,
    pageSize: pageSize
  }));
};

// After (new approach - cleaner)
const { data, loading, pagination, loadData, handlePaginationChange } = useQualityData(...);

// handlePaginationChange now directly calls loadData with pagination params
// No need for separate pagination state management
```

### Updated Component Pattern
```javascript
const PQCInspection = () => {
  const { data: pqcData, loading, pagination, loadData, handlePaginationChange } = useQualityData(
    (params) => QualityAPI.getPQCInspections(params),
    transformPQCData
  );

  // Pagination table will call handlePaginationChange(page, pageSize)
  // which internally calls loadData(page, pageSize)
  return (
    <Table
      dataSource={pqcData}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handlePaginationChange
      }}
    />
  );
};
```

### For Existing Components (Optional Error Handling)
You can optionally update them to handle the new `error` state:

```javascript
// Before
const { data, loading, pagination, loadData } = useQualityData(...);

// After (optional enhancement)
const { data, loading, error, pagination, loadData } = useQualityData(...);

// Display error if needed
{error && (
  <Alert
    message="数据加载失败"
    description={error}
    type="error"
    showIcon
    style={{ marginBottom: 16 }}
  />
)}
```

## Testing Recommendations

1. **Test Token Validation**
   - Clear localStorage/sessionStorage and verify error handling
   - Verify `authFailed` event is dispatched

2. **Test API Function Validation**
   - Pass undefined as apiFunction and verify error handling
   - Pass non-function values and verify error handling
   - Verify error message is clear and actionable

3. **Test Error Scenarios**
   - Mock API responses with 401/403 status codes
   - Mock malformed data responses
   - Mock network failures

4. **Test Data Transformation**
   - Verify transformer errors are caught
   - Verify data is cleared on transformation failure

5. **Test Pagination**
   - Verify pagination works with missing data
   - Verify total defaults to 0

## Related Files

- `client/src/hooks/useQualityData.js` - Hook implementation
- `client/src/components/quality/IQCInspection.js` - IQC module
- `client/src/components/quality/OQCInspection.js` - OQC module
- `client/src/components/quality/FQCInspection.js` - FQC module
- `client/src/components/quality/PQCInspection.js` - PQC module

## Version History

- **v2.2.0** (2025-12-31): Refactored pagination handling - parameters now passed directly to `loadData()` for cleaner state management and to prevent infinite loops
- **v2.1.0** (2025-12-31): Added API function validation to prevent undefined/invalid function errors
- **v2.0.0** (2025-12-31): Enhanced error handling and authentication validation
- **v1.0.0** (2025-12-26): Initial implementation

---

**Last Updated**: 2025-12-31  
**Maintained By**: MES Development Team
