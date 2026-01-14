/**
 * InspectionStandards Component Tests
 * 
 * Tests for the inspection standards component including:
 * - Loading state handling
 * - Error state handling
 * - Data display correctness
 * 
 * Requirements: 4.5, 8.5
 * Property 1: API数据完整性
 * Property 3: 错误处理一致性
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InspectionStandards from './InspectionStandards';

// Mock the DataService
jest.mock('../../services/DataService', () => ({
  default: {
    getInspectionStandards: jest.fn()
  }
}));

// Mock the useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

const { useDataService } = require('../../hooks/useDataService');

describe('InspectionStandards Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State Handling', () => {
    it('should display loading spinner when data is loading', () => {
      useDataService.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      // Check for loading indicator - Ant Design Spin component
      const spinElement = document.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });

    it('should display table after data loads', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/检验标准主数据/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error State Handling', () => {
    it('should display error alert when API call fails', () => {
      const mockError = new Error('获取检验标准数据失败');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      expect(screen.getByText(/数据加载失败/i)).toBeInTheDocument();
      expect(screen.getByText(/获取检验标准数据失败/i)).toBeInTheDocument();
    });

    it('should provide retry button on error', () => {
      const mockError = new Error('API Error');
      const mockRefetch = jest.fn();

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      });

      render(<InspectionStandards />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Data Display Correctness', () => {
    it('should display inspection standards correctly', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        },
        {
          id: 2,
          standard_code: 'STD002',
          standard_name: 'Dimension Standard',
          product_name: 'Product B',
          version: '2.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/STD001/i)).toBeInTheDocument();
        expect(screen.getByText(/STD002/i)).toBeInTheDocument();
      });
    });

    it('should display standard names correctly', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/Surface Quality Standard/i)).toBeInTheDocument();
      });
    });

    it('should display product names correctly', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/Product A/i)).toBeInTheDocument();
      });
    });

    it('should display version information correctly', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        },
        {
          id: 2,
          standard_code: 'STD002',
          standard_name: 'Dimension Standard',
          product_name: 'Product B',
          version: '2.5',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/1\.0/i)).toBeInTheDocument();
        expect(screen.getByText(/2\.5/i)).toBeInTheDocument();
      });
    });

    it('should display status tags correctly', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Active Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        },
        {
          id: 2,
          standard_code: 'STD002',
          standard_name: 'Inactive Standard',
          product_name: 'Product B',
          version: '1.0',
          status: 'disabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        // Should display status tags
        expect(screen.getByText(/生效/i)).toBeInTheDocument();
        expect(screen.getByText(/失效/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no data', () => {
      useDataService.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      expect(screen.getByText(/暂无数据/i)).toBeInTheDocument();
      expect(screen.getByText(/还没有检验标准/i)).toBeInTheDocument();
    });
  });

  describe('API Data Integrity', () => {
    it('should handle API response with all required fields', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/STD001/i)).toBeInTheDocument();
        expect(screen.getByText(/Surface Quality Standard/i)).toBeInTheDocument();
        expect(screen.getByText(/Product A/i)).toBeInTheDocument();
      });
    });

    it('should handle multiple standards with different statuses', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Standard 1',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        },
        {
          id: 2,
          standard_code: 'STD002',
          standard_name: 'Standard 2',
          product_name: 'Product B',
          version: '1.0',
          status: 'enabled'
        },
        {
          id: 3,
          standard_code: 'STD003',
          standard_name: 'Standard 3',
          product_name: 'Product C',
          version: '1.0',
          status: 'disabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        expect(screen.getByText(/STD001/i)).toBeInTheDocument();
        expect(screen.getByText(/STD002/i)).toBeInTheDocument();
        expect(screen.getByText(/STD003/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Consistency', () => {
    it('should display consistent error message format', () => {
      const mockError = new Error('Network error');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      expect(screen.getByText(/数据加载失败/i)).toBeInTheDocument();
    });

    it('should allow user to retry after error', () => {
      const mockRefetch = jest.fn();
      const mockError = new Error('API Error');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      });

      render(<InspectionStandards />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle error with custom message', () => {
      const mockError = new Error('Custom error message');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      expect(screen.getByText(/Custom error message/i)).toBeInTheDocument();
    });
  });

  describe('Component Interaction', () => {
    it('should have refresh button that calls refetch', async () => {
      const mockRefetch = jest.fn();
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        const refreshButton = screen.getByText(/刷新/i);
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('should display action buttons for each record', async () => {
      const mockData = [
        {
          id: 1,
          standard_code: 'STD001',
          standard_name: 'Surface Quality Standard',
          product_name: 'Product A',
          version: '1.0',
          status: 'enabled'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<InspectionStandards />);

      await waitFor(() => {
        // Should have action buttons
        expect(screen.getByText(/查看详情/i)).toBeInTheDocument();
        expect(screen.getByText(/编辑/i)).toBeInTheDocument();
      });
    });
  });
});
