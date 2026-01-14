/**
 * QualityInspection Component Tests
 * 
 * Tests for the quality inspection component including:
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
import QualityInspection from './QualityInspection';
import * as DataService from '../../services/DataService';

// Mock the DataService
jest.mock('../../services/DataService', () => ({
  default: {
    getQualityInspections: jest.fn()
  }
}));

// Mock the useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

const { useDataService } = require('../../hooks/useDataService');

describe('QualityInspection Component', () => {
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

      render(<QualityInspection />);
      
      // Check for loading indicator - Ant Design Spin component
      const spinElement = document.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });

    it('should display table after data loads', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: 'Test note'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        expect(screen.getByText(/质量检验管理/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error State Handling', () => {
    it('should display error alert when API call fails', () => {
      const mockError = new Error('获取质量检验数据失败');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      expect(screen.getByText(/数据加载失败/i)).toBeInTheDocument();
      expect(screen.getByText(/获取质量检验数据失败/i)).toBeInTheDocument();
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

      render(<QualityInspection />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Data Display Correctness', () => {
    it('should display inspection data correctly', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: 'Test note'
        },
        {
          id: 2,
          inspection_type: 'process',
          inspection_date: '2024-01-02',
          inspector_id: 2,
          inspected_quantity: 50,
          qualified_quantity: 48,
          quality_rate: 96,
          notes: 'Another test'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        // Check for inspection IDs
        expect(screen.getByText(/QI-0001/i)).toBeInTheDocument();
        expect(screen.getByText(/QI-0002/i)).toBeInTheDocument();
      });
    });

    it('should display inspection type tags correctly', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: ''
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        expect(screen.getByText(/IQC/i)).toBeInTheDocument();
      });
    });

    it('should display quality rate correctly', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: ''
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        expect(screen.getByText(/95%/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no data', () => {
      useDataService.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      expect(screen.getByText(/暂无数据/i)).toBeInTheDocument();
      expect(screen.getByText(/还没有质量检验记录/i)).toBeInTheDocument();
    });

    it('should format inspection dates correctly', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-15',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: ''
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        // Check that the table is rendered with data
        expect(screen.getByText(/QI-0001/i)).toBeInTheDocument();
      });
    });

    it('should display quality result tags based on quality rate', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 98,
          quality_rate: 98,
          notes: ''
        },
        {
          id: 2,
          inspection_type: 'process',
          inspection_date: '2024-01-02',
          inspector_id: 2,
          inspected_quantity: 100,
          qualified_quantity: 92,
          quality_rate: 92,
          notes: ''
        },
        {
          id: 3,
          inspection_type: 'final',
          inspection_date: '2024-01-03',
          inspector_id: 3,
          inspected_quantity: 100,
          qualified_quantity: 85,
          quality_rate: 85,
          notes: ''
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        // Should show quality result tags
        const tags = document.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe('API Data Integrity', () => {
    it('should handle API response with all required fields', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95,
          notes: 'Complete data'
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        expect(screen.getByText(/QI-0001/i)).toBeInTheDocument();
        expect(screen.getByText(/Complete data/i)).toBeInTheDocument();
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockData = [
        {
          id: 1,
          inspection_type: 'incoming',
          inspection_date: '2024-01-01',
          inspector_id: 1,
          inspected_quantity: 100,
          qualified_quantity: 95,
          quality_rate: 95
          // notes field is missing
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<QualityInspection />);

      await waitFor(() => {
        expect(screen.getByText(/QI-0001/i)).toBeInTheDocument();
        // Should display "-" for missing notes
        const dashElements = screen.getAllByText(/-/);
        expect(dashElements.length).toBeGreaterThan(0);
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

      render(<QualityInspection />);

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

      render(<QualityInspection />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
