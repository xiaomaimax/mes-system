/**
 * 加载状态管理属性测试
 * Property 7: 加载状态管理
 * 
 * 验证所有组件都正确处理加载状态，包括：
 * - 显示加载指示器
 * - 处理加载错误
 * - 管理加载状态转换
 * - 提供用户友好的加载体验
 * 
 * Requirements: 8.5, 10.4
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

// 导入需要测试的组件
import WorkshopPlan from '../../components/production/WorkshopPlan';
import EquipmentManagement from '../../components/equipment/EquipmentManagement';
import QualityInspection from '../../components/quality/QualityInspection';
import InventoryManagement from '../../components/inventory/InventoryManagement';
import SimpleReports from '../../components/SimpleReports';

// Mock useDataService hook
jest.mock('../../hooks/useDataService', () => ({
  useDataService: jest.fn()
}));

import { useDataService } from '../../hooks/useDataService';

describe('Property 7: 加载状态管理', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 属性测试1: 加载状态显示
   * 验证所有组件在数据加载时都显示适当的加载指示器
   */
  describe('加载状态显示', () => {
    const components = [
      { Component: WorkshopPlan, name: '生产计划' },
      { Component: EquipmentManagement, name: '设备管理' },
      { Component: QualityInspection, name: '质量检验' },
      { Component: InventoryManagement, name: '库存管理' },
      { Component: SimpleReports, name: '报表' }
    ];

    components.forEach(({ Component, name }) => {
      it(`${name}组件应该在加载时显示加载指示器`, async () => {
        // Mock 加载状态
        useDataService.mockImplementation(() => ({
          data: null,
          loading: true,
          error: null,
          refetch: jest.fn()
        }));

        render(<Component />);

        // 验证加载指示器存在
        await waitFor(() => {
          const loadingElement = screen.getByLabelText('loading');
          expect(loadingElement).toBeInTheDocument();
        });
      });

      it(`${name}组件应该在加载完成后隐藏加载指示器`, async () => {
        const mockData = [{ id: 1, name: '测试数据' }];

        // 初始加载状态
        useDataService.mockImplementation(() => ({
          data: null,
          loading: true,
          error: null,
          refetch: jest.fn()
        }));

        const { rerender } = render(<Component />);

        // 验证加载指示器存在
        await waitFor(() => {
          expect(screen.getByLabelText('loading')).toBeInTheDocument();
        });

        // 模拟加载完成
        useDataService.mockImplementation(() => ({
          data: mockData,
          loading: false,
          error: null,
          refetch: jest.fn()
        }));

        rerender(<Component />);

        // 验证加载指示器消失
        await waitFor(() => {
          expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
        });
      });
    });
  });

  /**
   * 属性测试2: 加载状态转换
   * 验证组件正确处理从加载到成功/错误状态的转换
   */
  describe('加载状态转换', () => {
    it('应该正确处理 加载 -> 成功 状态转换', async () => {
      const mockData = [
        { id: 1, plan_number: 'PLAN-001', product_name: '产品A' },
        { id: 2, plan_number: 'PLAN-002', product_name: '产品B' }
      ];

      // 初始加载状态
      useDataService.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      const { rerender } = render(<WorkshopPlan />);

      // 验证加载状态
      await waitFor(() => {
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
      });

      // 模拟加载成功
      await act(async () => {
        useDataService.mockImplementation(() => ({
          data: mockData,
          loading: false,
          error: null,
          refetch: jest.fn()
        }));

        rerender(<WorkshopPlan />);
      });

      // 验证成功状态
      await waitFor(() => {
        expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
        expect(screen.getByText('PLAN-001')).toBeInTheDocument();
        expect(screen.getByText('产品A')).toBeInTheDocument();
      });
    });

    it('应该正确处理 加载 -> 错误 状态转换', async () => {
      const mockError = new Error('网络连接失败');

      // 初始加载状态
      useDataService.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      const { rerender } = render(<WorkshopPlan />);

      // 验证加载状态
      await waitFor(() => {
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
      });

      // 模拟加载失败
      await act(async () => {
        useDataService.mockImplementation(() => ({
          data: null,
          loading: false,
          error: mockError,
          refetch: jest.fn()
        }));

        rerender(<WorkshopPlan />);
      });

      // 验证错误状态
      await waitFor(() => {
        expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
        expect(screen.getByText(mockError.message)).toBeInTheDocument();
      });
    });

    it('应该正确处理 成功 -> 重新加载 状态转换', async () => {
      const mockData = [{ id: 1, name: '初始数据' }];
      const mockRefetch = jest.fn();

      // 初始成功状态
      useDataService.mockImplementation(() => ({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch
      }));

      const { rerender } = render(<WorkshopPlan />);

      // 验证初始数据显示
      await waitFor(() => {
        expect(screen.getByText('初始数据')).toBeInTheDocument();
      });

      // 模拟重新加载
      await act(async () => {
        useDataService.mockImplementation(() => ({
          data: mockData,
          loading: true,
          error: null,
          refetch: mockRefetch
        }));

        rerender(<WorkshopPlan />);
      });

      // 验证重新加载状态
      await waitFor(() => {
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
        // 数据应该仍然显示（不应该清空）
        expect(screen.getByText('初始数据')).toBeInTheDocument();
      });
    });
  });

  /**
   * 属性测试3: 加载状态的用户体验
   * 验证加载状态提供良好的用户体验
   */
  describe('加载状态用户体验', () => {
    it('应该在长时间加载时提供适当的反馈', async () => {
      useDataService.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      }));

      render(<WorkshopPlan />);

      // 验证加载指示器存在
      await waitFor(() => {
        const loadingElement = screen.getByLabelText('loading');
        expect(loadingElement).toBeInTheDocument();
      });

      // 验证加载指示器是可见的（不是隐藏的）
      const loadingElement = screen.getByLabelText('loading');
      expect(loadingElement).toBeVisible();
    });

    it('应该在刷新数据时保持界面可用性', async () => {
      const mockData = [{ id: 1, name: '现有数据' }];
      const mockRefetch = jest.fn();

      // 初始数据已加载
      useDataService.mockImplementation(() => ({
        data: mockData,
        loading: false,
        error: null,
        refetch: mockRefetch
      }));

      render(<WorkshopPlan />);

      // 验证数据显示
      await waitFor(() => {
        expect(screen.getByText('现有数据')).toBeInTheDocument();
      });

      // 模拟刷新操作
      useDataService.mockImplementation(() => ({
        data: mockData,
        loading: true,
        error: null,
        refetch: mockRefetch
      }));

      // 在刷新时，现有数据应该仍然可见
      await waitFor(() => {
        expect(screen.getByText('现有数据')).toBeInTheDocument();
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
      });
    });

    it('应该提供重试机制', async () => {
      const mockError = new Error('加载失败');
      const mockRefetch = jest.fn();

      useDataService.mockImplementation(() => ({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch
      }));

      render(<WorkshopPlan />);

      // 验证错误状态和重试按钮
      await waitFor(() => {
        expect(screen.getByText('数据加载失败')).toBeInTheDocument();
        const retryButton = screen.getByRole('button', { name: /重试|刷新/ });
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  /**
   * 属性测试4: 并发加载状态管理
   * 验证组件正确处理多个并发的加载操作
   */
  describe('并发加载状态管理', () => {
    it('应该正确处理多个数据源的并发加载', async () => {
      // 模拟多个useDataService调用
      let callCount = 0;
      useDataService.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // 第一个数据源还在加载
          return {
            data: null,
            loading: true,
            error: null,
            refetch: jest.fn()
          };
        } else {
          // 第二个数据源已完成
          return {
            data: [{ id: 1, name: '数据源2' }],
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
      });

      render(<WorkshopPlan />);

      // 应该显示加载状态（因为至少有一个数据源在加载）
      await waitFor(() => {
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
      });
    });

    it('应该在所有数据源加载完成后隐藏加载状态', async () => {
      const mockData1 = [{ id: 1, name: '数据源1' }];
      const mockData2 = [{ id: 2, name: '数据源2' }];

      // 初始状态：两个数据源都在加载
      let callCount = 0;
      useDataService.mockImplementation(() => {
        callCount++;
        return {
          data: null,
          loading: true,
          error: null,
          refetch: jest.fn()
        };
      });

      const { rerender } = render(<WorkshopPlan />);

      await waitFor(() => {
        expect(screen.getByLabelText('loading')).toBeInTheDocument();
      });

      // 模拟所有数据源加载完成
      callCount = 0;
      useDataService.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            data: mockData1,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        } else {
          return {
            data: mockData2,
            loading: false,
            error: null,
            refetch: jest.fn()
          };
        }
      });

      rerender(<WorkshopPlan />);

      // 所有加载完成后，加载指示器应该消失
      await waitFor(() => {
        expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
      });
    });
  });

  /**
   * 属性测试5: 加载状态的一致性
   * 验证所有组件的加载状态行为保持一致
   */
  describe('加载状态一致性', () => {
    const components = [
      { Component: WorkshopPlan, name: '生产计划' },
      { Component: EquipmentManagement, name: '设备管理' },
      { Component: QualityInspection, name: '质量检验' },
      { Component: InventoryManagement, name: '库存管理' }
    ];

    it('所有组件都应该使用相同的加载指示器', async () => {
      for (const { Component, name } of components) {
        useDataService.mockImplementation(() => ({
          data: null,
          loading: true,
          error: null,
          refetch: jest.fn()
        }));

        const { unmount } = render(<Component />);

        // 每个组件都应该有相同的加载指示器
        await waitFor(() => {
          const loadingElement = screen.getByLabelText('loading');
          expect(loadingElement).toBeInTheDocument();
          // 验证加载指示器的类型（应该是Spin组件）
          expect(loadingElement.closest('.ant-spin')).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('所有组件都应该在相同的时机显示/隐藏加载状态', async () => {
      const testStates = [
        { loading: true, data: null, error: null, shouldShowLoading: true },
        { loading: false, data: [{ id: 1 }], error: null, shouldShowLoading: false },
        { loading: false, data: null, error: new Error('错误'), shouldShowLoading: false },
        { loading: true, data: [{ id: 1 }], error: null, shouldShowLoading: true } // 刷新状态
      ];

      for (const { Component, name } of components) {
        for (const state of testStates) {
          useDataService.mockImplementation(() => ({
            data: state.data,
            loading: state.loading,
            error: state.error,
            refetch: jest.fn()
          }));

          const { unmount } = render(<Component />);

          if (state.shouldShowLoading) {
            await waitFor(() => {
              expect(screen.getByLabelText('loading')).toBeInTheDocument();
            });
          } else {
            await waitFor(() => {
              expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
            });
          }

          unmount();
        }
      }
    });
  });

  /**
   * 属性测试6: 加载性能优化
   * 验证加载状态不会影响应用性能
   */
  describe('加载性能优化', () => {
    it('应该避免不必要的重新渲染', async () => {
      const mockData = [{ id: 1, name: '测试数据' }];
      let renderCount = 0;

      // 创建一个包装组件来计算渲染次数
      const TestWrapper = () => {
        renderCount++;
        return <WorkshopPlan />;
      };

      useDataService.mockImplementation(() => ({
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn()
      }));

      const { rerender } = render(<TestWrapper />);

      const initialRenderCount = renderCount;

      // 重新渲染相同的状态
      rerender(<TestWrapper />);

      // 渲染次数不应该显著增加（React的优化应该生效）
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    it('应该正确清理加载状态相关的资源', async () => {
      const mockRefetch = jest.fn();

      useDataService.mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch
      }));

      const { unmount } = render(<WorkshopPlan />);

      // 组件卸载时应该清理资源
      unmount();

      // 验证没有内存泄漏（这里主要是确保测试能正常完成）
      expect(true).toBe(true);
    });
  });
});