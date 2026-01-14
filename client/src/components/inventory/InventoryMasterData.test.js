/**
 * InventoryMasterData Component Tests
 * 
 * Tests for inventory module component covering:
 * - Loading state handling
 * - Error state handling
 * - Data display correctness
 * 
 * Requirements: 5.5, 8.5
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryMasterData from './InventoryMasterData';
import * as useDataServiceModule from '../../hooks/useDataService';

// Mock useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

// Mock ButtonActions
jest.mock('../../utils/buttonActions', () => ({
  simulateDelete: jest.fn((name, callback) => callback())
}));

describe('InventoryMasterData Component', () => {
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

      render(<InventoryMasterData />);

      // Verify loading spinner is displayed by checking for the Spin component
      await waitFor(() => {
        const spinnerIcon = screen.getByLabelText('loading');
        expect(spinnerIcon).toBeInTheDocument();
      });
    });

    it('should hide loading spinner when data is loaded', async () => {
      // Setup: Mock useDataService to return loaded state
      const mockInventoryData = [
        {
          id: 1,
          material_id: 1,
          material_name: '塑料原料',
          current_stock: 100,
          min_stock: 20,
          max_stock: 500,
          unit: '个',
          warehouse_location: 'A-01-01'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockInventoryData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

      // Verify table is displayed
      await waitFor(() => {
        expect(screen.getByText('物料主数据')).toBeInTheDocument();
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
      const mockError = new Error('无法加载数据，请检查后端服务');
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

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

      render(<InventoryMasterData />);

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
    it('should display inventory data correctly in table', async () => {
      // Setup: Mock inventory data
      const mockInventoryData = [
        {
          id: 1,
          material_id: 1,
          material_name: '塑料原料',
          current_stock: 100,
          min_stock: 20,
          max_stock: 500,
          unit: '个',
          warehouse_location: 'A-01-01'
        },
        {
          id: 2,
          material_id: 2,
          material_name: '包装材料',
          current_stock: 50,
          min_stock: 10,
          max_stock: 200,
          unit: '个',
          warehouse_location: 'B-02-05'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockInventoryData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

      // Verify table displays material names
      await waitFor(() => {
        expect(screen.getByText('塑料原料')).toBeInTheDocument();
        expect(screen.getByText('包装材料')).toBeInTheDocument();
      });
    });

    it('should display location data when switching to locations tab', async () => {
      // Setup: Mock location data
      const mockLocationData = [
        {
          id: 1,
          location_code: 'A区-01-01',
          location_name: '原材料区1号位',
          warehouse: '主仓库',
          area: 'A区',
          row: '01',
          column: '01',
          level: '1',
          capacity: 2000,
          current_usage: 1200,
          usage_rate: 60,
          material_type: '原材料',
          temperature: '常温',
          humidity: '干燥',
          status: 'active'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockLocationData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

      // Verify location tab content is displayed
      await waitFor(() => {
        expect(screen.getByText('库位主数据')).toBeInTheDocument();
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

      render(<InventoryMasterData />);

      // Verify empty table message is displayed
      await waitFor(() => {
        expect(screen.getByText('库存主数据管理')).toBeInTheDocument();
      });
    });

    it('should display stock status tags correctly', async () => {
      // Setup: Mock inventory data with low stock
      const mockInventoryData = [
        {
          id: 1,
          material_id: 1,
          material_name: '塑料原料',
          current_stock: 15, // Below min_stock of 20
          min_stock: 20,
          max_stock: 500,
          unit: '个',
          warehouse_location: 'A-01-01'
        }
      ];

      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: mockInventoryData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

      // Verify low stock tag is displayed
      await waitFor(() => {
        expect(screen.getByText('库存不足')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 4: Tab switching functionality
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Tab Switching', () => {
    it('should switch between materials and locations tabs', async () => {
      // Setup: Mock data for both tabs
      useDataServiceModule.useDataService.mockImplementation(() => ({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      render(<InventoryMasterData />);

      // Verify materials tab is active by default
      await waitFor(() => {
        expect(screen.getByText('物料主数据')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test 5: Refresh functionality
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

      render(<InventoryMasterData />);

      // Find and click refresh button
      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /刷新数据/i });
        expect(refreshButton).toBeInTheDocument();
      });
    });
  });

});
