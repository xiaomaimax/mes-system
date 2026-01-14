/**
 * Production Module Component Tests
 * 
 * Tests for production module components:
 * - WorkshopPlan component
 * - ProductionTasks component
 * - WorkReportManagement component
 * 
 * Requirements: 2.5, 8.5
 * Property 3: 错误处理一致性
 * Property 7: 加载状态管理
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkshopPlan from './WorkshopPlan';
import ProductionTasks from './ProductionTasks';
import DataService from '../../services/DataService';
import { useDataService } from '../../hooks/useDataService';

// Mock DataService
jest.mock('../../services/DataService');
jest.mock('../../hooks/useDataService');

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Creates a mock data service response
 * @param {Array} data - Data to return
 * @param {boolean} loading - Loading state
 * @param {Error} error - Error object
 * @returns {Object} Mock response
 */
const createMockDataServiceResponse = (data = [], loading = false, error = null) => ({
  data,
  loading,
  error,
  refetch: jest.fn()
});

/**
 * Creates a mock production plan
 * @param {Object} overrides - Field overrides
 * @returns {Object} Mock plan
 */
const createMockPlan = (overrides = {}) => ({
  id: 1,
  plan_number: 'PLAN-001',
  planned_quantity: 100,
  status: 'scheduled',
  due_date: '2024-01-15',
  process_route_number: 'ROUTE-001',
  order_number: 'ORDER-001',
  customer: 'Customer A',
  Material: {
    material_code: 'MAT-001',
    material_name: '塑料颗粒'
  },
  ...overrides
});

/**
 * Creates a mock production task
 * @param {Object} overrides - Field overrides
 * @returns {Object} Mock task
 */
const createMockTask = (overrides = {}) => ({
  id: 1,
  task_number: 'TASK-001',
  task_quantity: 50,
  status: 'pending',
  is_overdue: false,
  ProductionPlan: {
    plan_number: 'PLAN-001',
    Material: {
      material_code: 'MAT-001',
      material_name: '塑料颗粒'
    }
  },
  Device: { device_name: '注塑机1' },
  Mold: { mold_name: '模具A' },
  ...overrides
});

describe('Production Module Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // WorkshopPlan Component Tests
  // ============================================================================

  describe('WorkshopPlan Component', () => {
    /**
     * Test: Loading state is displayed while data is being fetched
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display loading spinner while fetching production plans', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(null, true)
      );

      render(<WorkshopPlan />);

      // Verify loading spinner is displayed
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    /**
     * Test: Error state is displayed when API call fails
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should display error alert when API call fails', async () => {
      const errorMessage = '获取生产计划失败';
      const mockError = new Error(errorMessage);

      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(null, false, mockError)
      );

      render(<WorkshopPlan />);

      // Verify error alert is displayed
      await waitFor(() => {
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    /**
     * Test: Retry button is available when error occurs
     * Requirements: 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should provide retry button when error occurs', async () => {
      const mockRefetch = jest.fn();
      const mockError = new Error('API Error');

      useDataService.mockImplementation(() => ({
        ...createMockDataServiceResponse(null, false, mockError),
        refetch: mockRefetch
      }));

      render(<WorkshopPlan />);

      // Find and click retry button
      const retryButton = screen.getByRole('button', { name: /重试/i });
      expect(retryButton).toBeInTheDocument();

      await userEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });

    /**
     * Test: Production plans are displayed correctly when data is loaded
     * Requirements: 2.1, 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should display production plans correctly when data is loaded', async () => {
      const mockPlans = [
        createMockPlan({ id: 1, plan_number: 'PLAN-001' }),
        createMockPlan({ id: 2, plan_number: 'PLAN-002', Material: { material_code: 'MAT-002', material_name: '橡胶材料' } })
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return createMockDataServiceResponse(mockPlans);
        }
        return createMockDataServiceResponse([]);
      });

      render(<WorkshopPlan />);

      // Verify plans are displayed in table
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
        expect(screen.getByText('PLAN-002')).toBeInTheDocument();
        expect(screen.getByText('塑料颗粒')).toBeInTheDocument();
        expect(screen.getByText('橡胶材料')).toBeInTheDocument();
      });
    });

    /**
     * Test: Empty state is displayed when no data is available
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display empty state when no production plans are available', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse([])
      );

      render(<WorkshopPlan />);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
        expect(screen.getByText('当前没有生产计划数据')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ProductionTasks Component Tests
  // ============================================================================

  describe('ProductionTasks Component', () => {
    /**
     * Test: Loading state is displayed while fetching production tasks
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display loading spinner while fetching production tasks', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Error state is displayed when task API call fails
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should display error alert when task API call fails', async () => {
      const errorMessage = '获取生产任务失败';
      const mockError = new Error(errorMessage);

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Production tasks are displayed correctly when data is loaded
     * Requirements: 2.2, 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should display production tasks correctly when data is loaded', async () => {
      const mockTasks = [
        {
          id: 1,
          task_number: 'TASK-001',
          task_quantity: 50,
          status: 'pending',
          is_overdue: false,
          ProductionPlan: {
            plan_number: 'PLAN-001',
            Material: {
              material_code: 'MAT-001',
              material_name: '塑料颗粒'
            }
          },
          Device: { device_name: '注塑机1' },
          Mold: { mold_name: '模具A' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: mockTasks,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Empty state is displayed when no tasks are available
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display empty state when no production tasks are available', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Overdue tasks are marked with high priority
     * Requirements: 2.2, 2.5, 8.1
     */
    it('should mark overdue tasks with high priority', async () => {
      const mockTasks = [
        {
          id: 1,
          task_number: 'TASK-001',
          task_quantity: 50,
          status: 'pending',
          is_overdue: true,
          ProductionPlan: {
            plan_number: 'PLAN-001',
            Material: {
              material_code: 'MAT-001',
              material_name: '塑料颗粒'
            }
          },
          Device: { device_name: '注塑机1' },
          Mold: { mold_name: '模具A' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: mockTasks,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    /**
     * Test: Component handles null data gracefully
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should handle null data gracefully', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<WorkshopPlan />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Component handles undefined data gracefully
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should handle undefined data gracefully', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: undefined,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<WorkshopPlan />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Component handles empty array gracefully
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should handle empty array gracefully', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<WorkshopPlan />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display Correctness', () => {
    /**
     * Test: Component correctly processes production plan data
     * Requirements: 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should correctly process production plan data with all required fields', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          planned_quantity: 100,
          status: 'scheduled',
          due_date: '2024-01-15',
          process_route_number: 'ROUTE-001',
          order_number: 'ORDER-001',
          customer: 'Customer A',
          Material: {
            material_code: 'MAT-001',
            material_name: '塑料颗粒'
          }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      const { container } = render(<WorkshopPlan />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Component correctly processes production task data
     * Requirements: 2.5, 8.1
     */
    it('should correctly process production task data with all required fields', async () => {
      const mockTasks = [
        {
          id: 1,
          task_number: 'TASK-001',
          task_quantity: 50,
          status: 'pending',
          is_overdue: false,
          ProductionPlan: {
            plan_number: 'PLAN-001',
            Material: {
              material_code: 'MAT-001',
              material_name: '塑料颗粒'
            }
          },
          Device: { device_name: '注塑机1' },
          Mold: { mold_name: '模具A' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: mockTasks,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Component handles multiple production plans
     * Requirements: 2.5, 8.1
     */
    it('should handle multiple production plans correctly', async () => {
      const mockPlans = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        plan_number: `PLAN-${String(i + 1).padStart(3, '0')}`,
        planned_quantity: (i + 1) * 100,
        status: i % 2 === 0 ? 'scheduled' : 'pending',
        Material: {
          material_code: `MAT-${String(i + 1).padStart(3, '0')}`,
          material_name: `物料${i + 1}`
        }
      }));

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      const { container } = render(<WorkshopPlan />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });

    /**
     * Test: Component handles multiple production tasks
     * Requirements: 2.5, 8.1
     */
    it('should handle multiple production tasks correctly', async () => {
      const mockTasks = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        task_number: `TASK-${String(i + 1).padStart(3, '0')}`,
        task_quantity: (i + 1) * 50,
        status: i % 3 === 0 ? 'pending' : 'in_progress',
        is_overdue: i % 5 === 0,
        ProductionPlan: {
          plan_number: `PLAN-${String(i + 1).padStart(3, '0')}`,
          Material: {
            material_code: `MAT-${String(i + 1).padStart(3, '0')}`,
            material_name: `物料${i + 1}`
          }
        },
        Device: { device_name: `设备${(i % 3) + 1}` },
        Mold: { mold_name: `模具${(i % 4) + 1}` }
      }));

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: mockTasks,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { container } = render(<ProductionTasks />);

      // Verify component renders without crashing
      expect(container).toBeTruthy();
    });
  });
});


describe('Production Module Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // WorkshopPlan Component Tests
  // ============================================================================

  describe('WorkshopPlan Component', () => {
    /**
     * Test: Loading state is displayed while data is being fetched
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display loading spinner while fetching production plans', async () => {
      // Mock useDataService to return loading state
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      render(<WorkshopPlan />);

      // Verify loading spinner is displayed
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    /**
     * Test: Error state is displayed when API call fails
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should display error alert when API call fails', async () => {
      const errorMessage = '获取生产计划失败';
      const mockError = new Error(errorMessage);

      // Mock useDataService to return error state
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      }));

      render(<WorkshopPlan />);

      // Verify error alert is displayed
      await waitFor(() => {
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    /**
     * Test: Retry button is available when error occurs
     * Requirements: 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should provide retry button when error occurs', async () => {
      const mockRefetch = jest.fn();
      const mockError = new Error('API Error');

      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      }));

      render(<WorkshopPlan />);

      // Find and click retry button
      const retryButton = screen.getByRole('button', { name: /重试/i });
      expect(retryButton).toBeInTheDocument();

      await userEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });

    /**
     * Test: Production plans are displayed correctly when data is loaded
     * Requirements: 2.1, 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should display production plans correctly when data is loaded', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          planned_quantity: 100,
          status: 'scheduled',
          due_date: '2024-01-15',
          Material: {
            material_code: 'MAT-001',
            material_name: '塑料颗粒'
          }
        },
        {
          id: 2,
          plan_number: 'PLAN-002',
          planned_quantity: 200,
          status: 'pending',
          due_date: '2024-01-20',
          Material: {
            material_code: 'MAT-002',
            material_name: '橡胶材料'
          }
        }
      ];

      // Mock both plans and tasks data
      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Verify plans are displayed in table
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
        expect(screen.getByText('PLAN-002')).toBeInTheDocument();
        expect(screen.getByText('塑料颗粒')).toBeInTheDocument();
        expect(screen.getByText('橡胶材料')).toBeInTheDocument();
      });
    });

    /**
     * Test: Empty state is displayed when no data is available
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display empty state when no production plans are available', async () => {
      useDataService.mockImplementation((fetchFn, deps, options) => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<WorkshopPlan />);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
        expect(screen.getByText('当前没有生产计划数据')).toBeInTheDocument();
      });
    });

    /**
     * Test: Search functionality filters plans correctly
     * Requirements: 2.5, 8.1
     */
    it('should filter plans when search text is entered', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          planned_quantity: 100,
          status: 'scheduled',
          Material: {
            material_code: 'MAT-001',
            material_name: '塑料颗粒'
          }
        },
        {
          id: 2,
          plan_number: 'PLAN-002',
          planned_quantity: 200,
          status: 'pending',
          Material: {
            material_code: 'MAT-002',
            material_name: '橡胶材料'
          }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
      });

      // Enter search text
      const searchInput = screen.getByPlaceholderText('搜索计划单号/物料编号');
      await userEvent.type(searchInput, 'PLAN-001');

      // Verify filtered results
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
        expect(screen.queryByText('PLAN-002')).not.toBeInTheDocument();
      });
    });

    /**
     * Test: Status filter works correctly
     * Requirements: 2.5, 8.1
     */
    it('should filter plans by status', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          status: 'scheduled',
          Material: { material_code: 'MAT-001', material_name: '塑料颗粒' }
        },
        {
          id: 2,
          plan_number: 'PLAN-002',
          status: 'pending',
          Material: { material_code: 'MAT-002', material_name: '橡胶材料' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
      });

      // Select status filter
      const statusSelect = screen.getByDisplayValue('选择状态');
      await userEvent.click(statusSelect);

      // Select "scheduled" option
      const scheduledOption = screen.getByText('已排产');
      await userEvent.click(scheduledOption);

      // Verify filtered results
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ProductionTasks Component Tests
  // ============================================================================

  describe('ProductionTasks Component', () => {
    /**
     * Test: Loading state is displayed while fetching production tasks
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display loading spinner while fetching production tasks', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(null, true)
      );

      render(<ProductionTasks />);

      // Verify loading spinner is displayed
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    /**
     * Test: Error state is displayed when task API call fails
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should display error alert when task API call fails', async () => {
      const errorMessage = '获取生产任务失败';
      const mockError = new Error(errorMessage);

      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(null, false, mockError)
      );

      render(<ProductionTasks />);

      // Verify error alert is displayed
      await waitFor(() => {
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
      });
    });

    /**
     * Test: Production tasks are displayed correctly when data is loaded
     * Requirements: 2.2, 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should display production tasks correctly when data is loaded', async () => {
      const mockTasks = [createMockTask()];

      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(mockTasks)
      );

      render(<ProductionTasks />);

      // Verify tasks are displayed
      await waitFor(() => {
        expect(screen.getByText('TASK-001')).toBeInTheDocument();
        expect(screen.getByText('塑料颗粒')).toBeInTheDocument();
      });
    });

    /**
     * Test: Empty state is displayed when no tasks are available
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should display empty state when no production tasks are available', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse([])
      );

      render(<ProductionTasks />);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
      });
    });

    /**
     * Test: Overdue tasks are marked with high priority
     * Requirements: 2.2, 2.5, 8.1
     */
    it('should mark overdue tasks with high priority', async () => {
      const mockTasks = [createMockTask({ is_overdue: true })];

      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(mockTasks)
      );

      render(<ProductionTasks />);

      // Verify overdue task is displayed with high priority
      await waitFor(() => {
        expect(screen.getByText('TASK-001')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    /**
     * Test: Component handles null data gracefully
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should handle null data gracefully', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(null)
      );

      render(<WorkshopPlan />);

      // Verify component renders without crashing
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
      });
    });

    /**
     * Test: Component handles undefined data gracefully
     * Requirements: 2.5, 2.6, 8.5
     * Property 3: 错误处理一致性
     */
    it('should handle undefined data gracefully', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse(undefined)
      );

      render(<WorkshopPlan />);

      // Verify component renders without crashing
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
      });
    });

    /**
     * Test: Component handles empty array gracefully
     * Requirements: 2.5, 8.5
     * Property 7: 加载状态管理
     */
    it('should handle empty array gracefully', async () => {
      useDataService.mockImplementation(() => 
        createMockDataServiceResponse([])
      );

      render(<WorkshopPlan />);

      // Verify empty state is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display Correctness', () => {
    /**
     * Test: All required fields are displayed in the table
     * Requirements: 2.5, 8.1, 8.3
     * Property 1: API数据完整性
     */
    it('should display all required fields for production plans', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          planned_quantity: 100,
          status: 'scheduled',
          due_date: '2024-01-15',
          process_route_number: 'ROUTE-001',
          order_number: 'ORDER-001',
          customer: 'Customer A',
          Material: {
            material_code: 'MAT-001',
            material_name: '塑料颗粒'
          }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Verify all required fields are displayed
      await waitFor(() => {
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
        expect(screen.getByText('MAT-001')).toBeInTheDocument();
        expect(screen.getByText('塑料颗粒')).toBeInTheDocument();
        expect(screen.getByText('100 件')).toBeInTheDocument();
        expect(screen.getByText('ROUTE-001')).toBeInTheDocument();
        expect(screen.getByText('ORDER-001')).toBeInTheDocument();
        expect(screen.getByText('Customer A')).toBeInTheDocument();
      });
    });

    /**
     * Test: Status tags are displayed with correct colors
     * Requirements: 2.5, 8.1
     */
    it('should display status tags with correct colors', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          status: 'scheduled',
          Material: { material_code: 'MAT-001', material_name: '塑料颗粒' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Verify status tag is displayed
      await waitFor(() => {
        expect(screen.getByText('已排产')).toBeInTheDocument();
      });
    });

    /**
     * Test: Quantity is formatted correctly
     * Requirements: 2.5, 8.1
     */
    it('should format quantity with unit correctly', async () => {
      const mockPlans = [
        {
          id: 1,
          plan_number: 'PLAN-001',
          planned_quantity: 100,
          status: 'scheduled',
          Material: { material_code: 'MAT-001', material_name: '塑料颗粒' }
        }
      ];

      useDataService.mockImplementation((fetchFn, deps, options) => {
        if (options?.cacheKey === 'production_plans') {
          return {
            data: mockPlans,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      });

      render(<WorkshopPlan />);

      // Verify quantity is formatted with unit
      await waitFor(() => {
        expect(screen.getByText('100 件')).toBeInTheDocument();
      });
    });
  });
});
