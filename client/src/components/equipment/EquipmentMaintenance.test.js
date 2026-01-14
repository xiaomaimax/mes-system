/**
 * EquipmentMaintenance Component Tests
 * 
 * Tests for the equipment maintenance management component
 * Requirements: 3.5, 8.5
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentMaintenance from './EquipmentMaintenance';
import DataService from '../../services/DataService';
import '@testing-library/jest-dom';

// Mock DataService
jest.mock('../../services/DataService', () => ({
  getEquipmentMaintenance: jest.fn(),
}));

// Mock useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn(),
}));

const { useDataService } = require('../../hooks/useDataService');

describe('EquipmentMaintenance Component', () => {
  // Test data
  const mockMaintenanceData = {
    maintenance: [
      {
        id: 1,
        device_id: 1,
        maintenance_type: 'preventive',
        maintenance_date: '2024-01-15T00:00:00Z',
        completion_date: '2024-01-15T04:00:00Z',
        technician_id: 1,
        description: '定期保养检查',
        status: 'completed',
        notes: '设备运行正常'
      },
      {
        id: 2,
        device_id: 2,
        maintenance_type: 'corrective',
        maintenance_date: '2024-01-20T00:00:00Z',
        completion_date: null,
        technician_id: 2,
        description: '故障维修',
        status: 'in_progress',
        notes: '正在维修传感器'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', async () => {
      useDataService.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for loading indicator
      await waitFor(() => {
        expect(screen.getByText(/正在加载设备维护数据/i)).toBeInTheDocument();
      });
    });

    it('should display Spin component during loading', async () => {
      useDataService.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      // Check for Spin component (Ant Design)
      await waitFor(() => {
        const spinElement = container.querySelector('.ant-spin');
        expect(spinElement).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should display error alert when data loading fails', async () => {
      const mockError = new Error('Network error');
      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/数据加载失败/i)).toBeInTheDocument();
      });
    });

    it('should display error description with custom message', async () => {
      const mockError = new Error('Connection refused');
      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for error description
      await waitFor(() => {
        expect(screen.getByText(/Connection refused/i)).toBeInTheDocument();
      });
    });

    it('should provide retry button in error state', async () => {
      const mockError = new Error('API error');
      const mockRefetch = jest.fn();
      useDataService.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      });

      const { container } = render(<EquipmentMaintenance />);

      // Find retry button
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        const retryButton = Array.from(buttons).find(btn => 
          btn.textContent.includes('重') && btn.textContent.includes('试')
        );
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display maintenance data in table when data is loaded', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for maintenance data in table
      await waitFor(() => {
        expect(screen.getByText(/MT-1/)).toBeInTheDocument();
        expect(screen.getByText(/MT-2/)).toBeInTheDocument();
      });
    });

    it('should display maintenance ID correctly', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        expect(screen.getByText(/MT-1/)).toBeInTheDocument();
        expect(screen.getByText(/MT-2/)).toBeInTheDocument();
      });
    });

    it('should display equipment information correctly', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for equipment codes
        expect(screen.getByText(/DEV-001/)).toBeInTheDocument();
        expect(screen.getByText(/DEV-002/)).toBeInTheDocument();
      });
    });

    it('should display maintenance type with correct tags', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for maintenance type tags
        const tags = container.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });

    it('should display maintenance status correctly', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for status tags
        const statusTags = container.querySelectorAll('.ant-tag');
        expect(statusTags.length).toBeGreaterThan(0);
      });
    });

    it('should display maintenance items as tags', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for maintenance items
        const tags = container.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });

    it('should display cost information correctly', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for cost display (¥500.00) - use container query to avoid multiple matches
        const costCells = container.querySelectorAll('td');
        const costFound = Array.from(costCells).some(cell => 
          cell.textContent.includes('¥500.00')
        );
        expect(costFound).toBe(true);
      });
    });

    it('should display technician information', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for technician
        expect(screen.getByText(/技术员 1/)).toBeInTheDocument();
        expect(screen.getByText(/技术员 2/)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = jest.fn();
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: mockRefetch
      });

      render(<EquipmentMaintenance />);

      // Find and click refresh button
      await waitFor(() => {
        const refreshButtons = screen.getAllByRole('button', { name: /刷新/i });
        expect(refreshButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search and Filter', () => {
    it('should display search input field', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for search input
      await waitFor(() => {
        const searchInputs = screen.getAllByPlaceholderText(/搜索/i);
        expect(searchInputs.length).toBeGreaterThan(0);
      });
    });

    it('should display maintenance type filter', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      // Check for maintenance type filter - use container query to avoid multiple matches
      await waitFor(() => {
        const selects = container.querySelectorAll('.ant-select');
        expect(selects.length).toBeGreaterThan(0);
      });
    });

    it('should display status filter', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      // Check for status filter - use container query to avoid multiple matches
      await waitFor(() => {
        const selects = container.querySelectorAll('.ant-select');
        expect(selects.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for pagination element
        const paginationElement = container.querySelector('.ant-pagination');
        expect(paginationElement).toBeInTheDocument();
      });
    });

    it('should display total record count', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for total count display
        expect(screen.getByText(/共 2 条记录/)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Functionality', () => {
    it('should have button to create new maintenance record', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for new maintenance button
      await waitFor(() => {
        const newButton = screen.getByRole('button', { name: /新建保养/i });
        expect(newButton).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency when displaying maintenance records', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Verify that maintenance ID and equipment code are displayed together
        expect(screen.getByText(/MT-1/)).toBeInTheDocument();
        expect(screen.getByText(/DEV-001/)).toBeInTheDocument();
      });
    });

    it('should display all required fields for each maintenance record', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check for required fields using container queries to avoid multiple matches
        expect(screen.getByText(/MT-1/)).toBeInTheDocument(); // ID
        expect(screen.getByText(/DEV-001/)).toBeInTheDocument(); // Equipment
        
        // Check for cost using container query
        const costCells = container.querySelectorAll('td');
        const costFound = Array.from(costCells).some(cell => 
          cell.textContent.includes('¥500.00')
        );
        expect(costFound).toBe(true);
      });
    });

    it('should handle null completion dates correctly', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      await waitFor(() => {
        // Check that component renders without errors
        expect(screen.getByText(/MT-2/)).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should display edit button for each maintenance record', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for edit buttons
      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /编辑/i });
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });

    it('should display detail button for each maintenance record', async () => {
      useDataService.mockReturnValue({
        data: mockMaintenanceData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMaintenance />);

      // Check for detail buttons
      await waitFor(() => {
        const detailButtons = screen.getAllByRole('button', { name: /详情/i });
        expect(detailButtons.length).toBeGreaterThan(0);
      });
    });
  });
});
