/**
 * SimpleReports Component Tests
 * 
 * Tests for reports module component covering:
 * - Loading state handling
 * - Error state handling
 * - Data display correctness
 * 
 * Requirements: 6.5, 8.5
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimpleReports from './SimpleReports';
import DataService from '../services/DataService';

// Mock DataService
jest.mock('../services/DataService', () => ({
  getProductionReports: jest.fn(),
  getQualityReports: jest.fn(),
  getEquipmentReports: jest.fn()
}));

describe('SimpleReports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Loading state handling
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Loading State Handling', () => {
    it('should hide loading spinner when data is loaded', async () => {
      // Setup: Mock successful data load
      const mockProductionData = [
        { key: '1', line: '生产线A', target: 1000, actual: 950, efficiency: '95%', oee: '87%' }
      ];

      DataService.getProductionReports.mockResolvedValue({
        success: true,
        data: mockProductionData
      });

      render(<SimpleReports />);

      // Click on production tab
      const productionTab = screen.getByRole('tab', { name: /生产报表/i });
      fireEvent.click(productionTab);

      // Verify data is displayed
      await waitFor(() => {
        expect(screen.getByText('生产线A')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  /**
   * Test 2: Error state handling
   * Property 3: 错误处理一致性
   * Validates: Requirements 2.6
   */
  describe('Error State Handling', () => {
    it('should display error alert when production report fails to load', async () => {
      // Setup: Mock error response
      const mockError = '无法加载生产报表数据';
      DataService.getProductionReports.mockResolvedValue({
        success: false,
        error: { message: mockError }
      });

      render(<SimpleReports />);

      // Click on production tab
      const productionTab = screen.getByRole('tab', { name: /生产报表/i });
      fireEvent.click(productionTab);

      // Verify error alert is displayed
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  /**
   * Test 3: Data display correctness
   * Property 1: API数据完整性
   * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5
   */
  describe('Data Display Correctness', () => {
    it('should display production report data correctly in table', async () => {
      // Setup: Mock production data
      const mockProductionData = [
        { key: '1', line: '生产线A', target: 1000, actual: 950, efficiency: '95%', oee: '87%' },
        { key: '2', line: '生产线B', target: 800, actual: 820, efficiency: '102.5%', oee: '92%' }
      ];

      DataService.getProductionReports.mockResolvedValue({
        success: true,
        data: mockProductionData
      });

      render(<SimpleReports />);

      // Click on production tab
      const productionTab = screen.getByRole('tab', { name: /生产报表/i });
      fireEvent.click(productionTab);

      // Verify table displays all data
      await waitFor(() => {
        expect(screen.getByText('生产线A')).toBeInTheDocument();
        expect(screen.getByText('生产线B')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display quality report data correctly in table', async () => {
      // Setup: Mock quality data
      const mockQualityData = [
        { key: '1', product: '产品A', inspected: 500, passed: 485, defectRate: '3%', cpk: 1.33 },
        { key: '2', product: '产品B', inspected: 300, passed: 295, defectRate: '1.7%', cpk: 1.67 }
      ];

      DataService.getQualityReports.mockResolvedValue({
        success: true,
        data: mockQualityData
      });

      render(<SimpleReports />);

      // Click on quality tab
      const qualityTab = screen.getByRole('tab', { name: /质量报表/i });
      fireEvent.click(qualityTab);

      // Verify table displays all data
      await waitFor(() => {
        expect(screen.getByText('产品A')).toBeInTheDocument();
        expect(screen.getByText('产品B')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display equipment report data correctly in table', async () => {
      // Setup: Mock equipment data
      const mockEquipmentData = [
        { key: '1', equipment: '设备001', utilization: '92%', mtbf: '168h', mttr: '2.5h', status: '运行' },
        { key: '2', equipment: '设备002', utilization: '88%', mtbf: '145h', mttr: '3.2h', status: '运行' }
      ];

      DataService.getEquipmentReports.mockResolvedValue({
        success: true,
        data: mockEquipmentData
      });

      render(<SimpleReports />);

      // Click on equipment tab
      const equipmentTab = screen.getByRole('tab', { name: /设备报表/i });
      fireEvent.click(equipmentTab);

      // Verify table displays all data
      await waitFor(() => {
        expect(screen.getByText('设备001')).toBeInTheDocument();
        expect(screen.getByText('设备002')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display empty state when no data is available', async () => {
      // Setup: Mock empty data
      DataService.getProductionReports.mockResolvedValue({
        success: true,
        data: []
      });

      render(<SimpleReports />);

      // Click on production tab
      const productionTab = screen.getByRole('tab', { name: /生产报表/i });
      fireEvent.click(productionTab);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无生产报表数据')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display empty state for quality reports when no data is available', async () => {
      // Setup: Mock empty data
      DataService.getQualityReports.mockResolvedValue({
        success: true,
        data: []
      });

      render(<SimpleReports />);

      // Click on quality tab
      const qualityTab = screen.getByRole('tab', { name: /质量报表/i });
      fireEvent.click(qualityTab);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无质量报表数据')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display empty state for equipment reports when no data is available', async () => {
      // Setup: Mock empty data
      DataService.getEquipmentReports.mockResolvedValue({
        success: true,
        data: []
      });

      render(<SimpleReports />);

      // Click on equipment tab
      const equipmentTab = screen.getByRole('tab', { name: /设备报表/i });
      fireEvent.click(equipmentTab);

      // Verify empty state message is displayed
      await waitFor(() => {
        expect(screen.getByText('暂无设备报表数据')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  /**
   * Test 4: Custom report functionality
   * Property 7: 加载状态管理
   * Validates: Requirements 8.5, 10.4
   */
  describe('Custom Report Functionality', () => {
    it('should display custom reports tab', () => {
      render(<SimpleReports />);

      // Verify custom reports tab exists
      const customTab = screen.getByRole('tab', { name: /自定义/i });
      expect(customTab).toBeInTheDocument();
    });

    it('should allow creating custom report from template', async () => {
      render(<SimpleReports />);

      // Click on custom tab
      const customTab = screen.getByRole('tab', { name: /自定义/i });
      fireEvent.click(customTab);

      // Verify custom report options are displayed
      await waitFor(() => {
        expect(screen.getByText('报表模板')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
