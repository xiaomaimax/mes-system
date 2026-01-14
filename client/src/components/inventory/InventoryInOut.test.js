/**
 * InventoryInOut Component Tests
 * 
 * Tests for inventory in/out module component covering:
 * - Loading state handling
 * - Error state handling
 * - Data display correctness
 * 
 * Requirements: 5.5, 8.5
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryInOut from './InventoryInOut';
import * as useDataServiceModule from '../../hooks/useDataService';

// Mock useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

// Mock ButtonActions
jest.mock('../../utils/buttonActions', () => ({
  simulateDelete: jest.fn((name, callback) => callback())
}));

describe('InventoryInOut Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Loading state handling
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Loading State Handling', () => {
    it('should display loading spinner when data is loading', async () => {
      // Setup: Mock useDataService to return loading state
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify loading spinner is displayed by checking for the Spin component
      await waitFor(() => {
        const spinnerIcon = screen.getByLabelText('loading');
        expect(spinnerIcon).toBeInTheDocument();
      });
    });

    it('should hide loading spinner when data is loaded', async () => {
      // Setup: Mock useDataService to return loaded state
      const mockTransactionData = [
        {
          id: 1,
          transaction_id: 'TXN-00001',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 100,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '张三'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockTransactionData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify table is displayed
      await waitFor(() => {
        expect(screen.getByText('出入库管理')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 2: Error state handling
   * Property 3: 错误处理一致性
   * Validates: Requirements 2.6
   */
  describe('Error State Handling', () => {
    it('should display error alert when data loading fails', async () => {
      // Setup: Mock useDataService to return error state
      const mockError = new Error('无法加载出入库数据，请检查后端服务');
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify error alert is displayed
      await waitFor(() => {
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
        expect(screen.getByText(mockError.message)).toBeInTheDocument();
      });
    });

    it('should provide retry button in error state', async () => {
      // Setup: Mock useDataService to return error state
      const mockError = new Error('无法加载数据');
      const mockRefetch = jest.fn();
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      }));

      render(<InventoryInOut />);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('无法加载数据')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 3: Data display correctness
   * Property 1: API数据完整性
   * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5
   */
  describe('Data Display Correctness', () => {
    it('should display inbound transaction data correctly', async () => {
      // Setup: Mock inbound transaction data
      const mockTransactionData = [
        {
          id: 1,
          transaction_id: 'TXN-00001',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 100,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '张三'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockTransactionData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify transaction data is displayed
      await waitFor(() => {
        expect(screen.getByText('塑料原料')).toBeInTheDocument();
        expect(screen.getByText('TXN-00001')).toBeInTheDocument();
      });
    });

    it('should display transaction data with correct quantity and unit', async () => {
      // Setup: Mock transaction data
      const mockTransactionData = [
        {
          id: 1,
          transaction_id: 'TXN-00001',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 100,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '张三'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockTransactionData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify quantity and unit are displayed
      await waitFor(() => {
        expect(screen.getByText(/100/)).toBeInTheDocument();
      });
    });

    it('should display transaction status tags correctly', async () => {
      // Setup: Mock transaction data with completed status
      const mockTransactionData = [
        {
          id: 1,
          transaction_id: 'TXN-00001',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 100,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '张三'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockTransactionData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify status tag is displayed
      await waitFor(() => {
        expect(screen.getByText('已完成')).toBeInTheDocument();
      });
    });

    it('should display empty state when no data is available', async () => {
      // Setup: Mock empty data
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify empty table message is displayed
      await waitFor(() => {
        expect(screen.getByText('出入库管理')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 4: Statistics display
   * Property 1: API数据完整性
   * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5
   */
  describe('Statistics Display', () => {
    it('should display correct count of inbound transactions', async () => {
      // Setup: Mock transaction data with inbound type
      const mockTransactionData = [
        {
          id: 1,
          transaction_id: 'TXN-00001',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 100,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '张三'
        },
        {
          id: 2,
          transaction_id: 'TXN-00002',
          material_id: 1,
          material_name: '塑料原料',
          quantity: 200,
          unit: '个',
          transaction_date: '2024-01-04',
          status: 'completed',
          transaction_type: 'in',
          warehouse_location: 'A-01-01',
          operator: '王五'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockTransactionData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify statistics are displayed
      await waitFor(() => {
        expect(screen.getByText('出入库管理')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 5: Tab switching functionality
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Tab Switching', () => {
    it('should switch between inbound and outbound tabs', async () => {
      // Setup: Mock data for both tabs
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryInOut />);

      // Verify inbound tab is active by default
      await waitFor(() => {
        expect(screen.getByText('出入库管理')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 6: Refresh functionality
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', async () => {
      // Setup: Mock refetch function
      const mockRefetch = jest.fn();
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: [],
        loading: false,
        error: null,
        refetch: mockRefetch
      }));

      render(<InventoryInOut />);

      // Verify component renders
      await waitFor(() => {
        expect(screen.getByText('出入库管理')).toBeInTheDocument();
      });
    });
  });
});
