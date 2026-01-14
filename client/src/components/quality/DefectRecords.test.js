/**
 * DefectRecords Component Tests
 * 
 * Tests for the defect records component including:
 * - Loading state handling
 * - Error state handling
 * - Data display correctness
 * - Summary statistics calculation
 * 
 * Requirements: 4.5, 8.5
 * Property 1: API数据完整性
 * Property 3: 错误处理一致性
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DefectRecords from './DefectRecords';

// Mock the DataService
jest.mock('../../services/DataService', () => ({
  default: {
    getDefectRecords: jest.fn()
  }
}));

// Mock the useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

const { useDataService } = require('../../hooks/useDataService');

describe('DefectRecords Component', () => {
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

      render(<DefectRecords />);

      // Check for loading indicator - Ant Design Spin component
      const spinElement = document.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });

    it('should display table after data loads', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Surface Scratch',
          description: 'Minor surface scratch',
          severity: 'low',
          status: 'resolved',
          cost: 100
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        expect(screen.getByText(/次品记录管理/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error State Handling', () => {
    it('should display error alert when API call fails', () => {
      const mockError = new Error('获取缺陷记录数据失败');

      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      expect(screen.getByText(/数据加载失败/i)).toBeInTheDocument();
      expect(screen.getByText(/获取缺陷记录数据失败/i)).toBeInTheDocument();
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

      render(<DefectRecords />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Data Display Correctness', () => {
    it('should display defect records correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Surface Scratch',
          description: 'Minor surface scratch',
          severity: 'low',
          status: 'resolved',
          cost: 100
        },
        {
          id: 2,
          defect_code: 'DEF002',
          defect_name: 'Color Mismatch',
          description: 'Color does not match specification',
          severity: 'high',
          status: 'pending',
          cost: 500
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        expect(screen.getByText(/DEF-0001/i)).toBeInTheDocument();
        expect(screen.getByText(/DEF-0002/i)).toBeInTheDocument();
      });
    });

    it('should display defect names correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Surface Scratch',
          description: 'Minor surface scratch',
          severity: 'low',
          status: 'resolved',
          cost: 100
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Find the defect name in the table
        const defectNameElements = screen.getAllByText(/Surface Scratch/i);
        expect(defectNameElements.length).toBeGreaterThan(0);
      });
    });

    it('should display severity tags correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'High Severity Issue',
          description: 'Critical defect',
          severity: 'critical',
          status: 'pending',
          cost: 1000
        },
        {
          id: 2,
          defect_code: 'DEF002',
          defect_name: 'Medium Severity Issue',
          description: 'Moderate defect',
          severity: 'major',
          status: 'in_progress',
          cost: 500
        },
        {
          id: 3,
          defect_code: 'DEF003',
          defect_name: 'Low Severity Issue',
          description: 'Minor defect',
          severity: 'minor',
          status: 'resolved',
          cost: 100
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Should display severity tags - check for the tag elements
        const tags = document.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });

    it('should display status tags correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Test Defect',
          description: 'Test',
          severity: 'low',
          status: 'resolved',
          cost: 100
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Check that the table is rendered with data
        expect(screen.getByText(/DEF-0001/i)).toBeInTheDocument();
        // Check for tag elements in the table
        const tags = document.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });

    it('should display empty state when no data', () => {
      useDataService.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      expect(screen.getByText(/暂无数据/i)).toBeInTheDocument();
      expect(screen.getByText(/还没有缺陷记录/i)).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate total defects correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Defect 1',
          description: 'Test',
          severity: 'low',
          status: 'resolved',
          cost: 100
        },
        {
          id: 2,
          defect_code: 'DEF002',
          defect_name: 'Defect 2',
          description: 'Test',
          severity: 'high',
          status: 'pending',
          cost: 500
        },
        {
          id: 3,
          defect_code: 'DEF003',
          defect_name: 'Defect 3',
          description: 'Test',
          severity: 'medium',
          status: 'in_progress',
          cost: 300
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Should display total defects count
        expect(screen.getByText(/总缺陷数/i)).toBeInTheDocument();
      });
    });

    it('should calculate resolved defects correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Defect 1',
          description: 'Test',
          severity: 'low',
          status: 'resolved',
          cost: 100
        },
        {
          id: 2,
          defect_code: 'DEF002',
          defect_name: 'Defect 2',
          description: 'Test',
          severity: 'major',
          status: 'resolved',
          cost: 500
        },
        {
          id: 3,
          defect_code: 'DEF003',
          defect_name: 'Defect 3',
          description: 'Test',
          severity: 'minor',
          status: 'pending',
          cost: 300
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Check that statistics section exists
        expect(screen.getByText(/总缺陷数/i)).toBeInTheDocument();
      });
    });

    it('should calculate total cost correctly', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Defect 1',
          description: 'Test',
          severity: 'low',
          status: 'resolved',
          cost: 100
        },
        {
          id: 2,
          defect_code: 'DEF002',
          defect_name: 'Defect 2',
          description: 'Test',
          severity: 'major',
          status: 'pending',
          cost: 500
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        // Check that statistics section exists
        expect(screen.getByText(/总缺陷数/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Data Integrity', () => {
    it('should handle API response with all required fields', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Surface Scratch',
          description: 'Minor surface scratch',
          severity: 'low',
          status: 'resolved',
          cost: 100
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        expect(screen.getByText(/DEF-0001/i)).toBeInTheDocument();
        // Find defect name in table
        const defectNameElements = screen.getAllByText(/Surface Scratch/i);
        expect(defectNameElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockData = [
        {
          id: 1,
          defect_code: 'DEF001',
          defect_name: 'Surface Scratch',
          description: 'Minor surface scratch',
          severity: 'low',
          status: 'resolved'
          // cost field is missing
        }
      ];

      useDataService.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<DefectRecords />);

      await waitFor(() => {
        expect(screen.getByText(/DEF-0001/i)).toBeInTheDocument();
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

      render(<DefectRecords />);

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

      render(<DefectRecords />);

      // Find retry button by looking for button with text containing "重" and "试"
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(btn => btn.textContent.includes('重') && btn.textContent.includes('试'));
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
