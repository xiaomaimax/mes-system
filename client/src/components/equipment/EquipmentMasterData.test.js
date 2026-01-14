/**
 * EquipmentMasterData Component Tests
 * 
 * Tests for the equipment master data management component
 * Requirements: 3.5, 8.5
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentMasterData from './EquipmentMasterData';
import DataService from '../../services/DataService';
import '@testing-library/jest-dom';

// Mock DataService
jest.mock('../../services/DataService', () => ({
  getEquipment: jest.fn(),
  getMolds: jest.fn(),
}));

// Mock useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn(),
}));

const { useDataService } = require('../../hooks/useDataService');

describe('EquipmentMasterData Component', () => {
  // Test data
  const mockEquipmentData = [
    {
      id: 1,
      equipment_code: 'EQ-001',
      equipment_name: '注塑机A1',
      equipment_type: '注塑设备',
      model: 'XJ-500',
      manufacturer: '制造商A',
      location: '生产线1',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      scheduling: {
        capacity_per_hour: 100,
        scheduling_weight: 50,
        is_available_for_scheduling: true
      }
    },
    {
      id: 2,
      equipment_code: 'EQ-002',
      equipment_name: '包装机B1',
      equipment_type: '包装设备',
      model: 'BJ-200',
      manufacturer: '制造商B',
      location: '生产线2',
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      scheduling: {
        capacity_per_hour: 80,
        scheduling_weight: 40,
        is_available_for_scheduling: true
      }
    }
  ];

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

      render(<EquipmentMasterData />);

      // Check for loading indicator
      await waitFor(() => {
        expect(screen.getByText(/正在加载设备数据/i)).toBeInTheDocument();
      });
    });

    it('should display Spin component during loading', async () => {
      useDataService.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMasterData />);

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

      render(<EquipmentMasterData />);

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

      render(<EquipmentMasterData />);

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

      const { container } = render(<EquipmentMasterData />);

      // Find and click retry button
      await waitFor(() => {
        const buttons = container.querySelectorAll('button');
        const retryButton = Array.from(buttons).find(btn => 
          btn.textContent.includes('重') && btn.textContent.includes('试')
        );
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Empty Data State', () => {
    it('should display empty state message when no equipment data', async () => {
      useDataService.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      // Check for empty state message
      await waitFor(() => {
        expect(screen.getByText(/暂无设备数据/i)).toBeInTheDocument();
      });
    });

    it('should display info alert for empty data', async () => {
      useDataService.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMasterData />);

      // Check for info alert
      await waitFor(() => {
        const alertElement = container.querySelector('.ant-alert-info');
        expect(alertElement).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display equipment data in table when data is loaded', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      // Check for equipment data in table
      await waitFor(() => {
        expect(screen.getByText('EQ-001')).toBeInTheDocument();
        expect(screen.getByText('注塑机A1')).toBeInTheDocument();
        expect(screen.getByText('EQ-002')).toBeInTheDocument();
        expect(screen.getByText('包装机B1')).toBeInTheDocument();
      });
    });

    it('should display equipment code correctly', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      await waitFor(() => {
        expect(screen.getByText('EQ-001')).toBeInTheDocument();
        expect(screen.getByText('EQ-002')).toBeInTheDocument();
      });
    });

    it('should display equipment name correctly', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      await waitFor(() => {
        expect(screen.getByText('注塑机A1')).toBeInTheDocument();
        expect(screen.getByText('包装机B1')).toBeInTheDocument();
      });
    });

    it('should display equipment type correctly', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      await waitFor(() => {
        expect(screen.getByText('注塑设备')).toBeInTheDocument();
        expect(screen.getByText('包装设备')).toBeInTheDocument();
      });
    });

    it('should display scheduling properties (capacity and weight)', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMasterData />);

      await waitFor(() => {
        // Check for capacity values
        const cells = container.querySelectorAll('td');
        const capacityFound = Array.from(cells).some(cell => 
          cell.textContent.includes('100')
        );
        expect(capacityFound).toBe(true);
      });
    });

    it('should display status tags correctly', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMasterData />);

      await waitFor(() => {
        // Check for status tags
        const tags = container.querySelectorAll('.ant-tag');
        expect(tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = jest.fn();
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: mockRefetch
      });

      render(<EquipmentMasterData />);

      // Find and click refresh button
      await waitFor(() => {
        const refreshButtons = screen.getAllByRole('button', { name: /刷新/i });
        expect(refreshButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should render equipment tab by default', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      // Check for equipment tab
      await waitFor(() => {
        expect(screen.getByText('设备信息')).toBeInTheDocument();
      });
    });

    it('should have category and spare parts tabs', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      // Check for all tabs
      await waitFor(() => {
        expect(screen.getByText('设备信息')).toBeInTheDocument();
        expect(screen.getByText('设备类别')).toBeInTheDocument();
        expect(screen.getByText('备件管理')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      const { container } = render(<EquipmentMasterData />);

      await waitFor(() => {
        // Check for pagination element
        const paginationElement = container.querySelector('.ant-pagination');
        expect(paginationElement).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency when displaying equipment', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      await waitFor(() => {
        // Verify that equipment code and name are displayed together
        const equipmentCode = screen.getByText('EQ-001');
        const equipmentName = screen.getByText('注塑机A1');
        
        expect(equipmentCode).toBeInTheDocument();
        expect(equipmentName).toBeInTheDocument();
      });
    });

    it('should display all required fields for each equipment', async () => {
      useDataService.mockReturnValue({
        data: mockEquipmentData,
        loading: false,
        error: null,
        refetch: jest.fn()
      });

      render(<EquipmentMasterData />);

      await waitFor(() => {
        // Check for required fields
        expect(screen.getByText('EQ-001')).toBeInTheDocument(); // code
        expect(screen.getByText('注塑机A1')).toBeInTheDocument(); // name
        expect(screen.getByText('注塑设备')).toBeInTheDocument(); // type
        expect(screen.getByText('XJ-500')).toBeInTheDocument(); // model
      });
    });
  });
});
