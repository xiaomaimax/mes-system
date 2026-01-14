/**
 * UI反馈组件测试
 * 
 * 测试UI反馈组件的基本功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import DataSourceIndicator from '../DataSourceIndicator';
import ProgressIndicator, { PROGRESS_STATUS } from '../ProgressIndicator';
import StorageStatsDisplay from '../StorageStatsDisplay';
import EnhancedLoading, { LOADING_TYPES } from '../EnhancedLoading';

// Mock Ant Design components
jest.mock('antd', () => ({
  Tag: ({ children, color, icon }) => (
    <span data-testid="tag" data-color={color}>
      {icon && <span data-testid="icon">{icon}</span>}
      {children}
    </span>
  ),
  Tooltip: ({ children, title }) => (
    <div data-testid="tooltip" title={title}>
      {children}
    </div>
  ),
  Badge: ({ count, status, color }) => (
    <span data-testid="badge" data-count={count} data-status={status} data-color={color} />
  ),
  Progress: ({ percent, strokeColor, size }) => (
    <div data-testid="progress" data-percent={percent} data-color={strokeColor} data-size={size} />
  ),
  Spin: ({ spinning, tip, children }) => (
    <div data-testid="spin" data-spinning={spinning} data-tip={tip}>
      {children}
    </div>
  ),
  Card: ({ title, children, extra }) => (
    <div data-testid="card">
      {title && <div data-testid="card-title">{title}</div>}
      {extra && <div data-testid="card-extra">{extra}</div>}
      {children}
    </div>
  ),
  Space: ({ children }) => <div data-testid="space">{children}</div>,
  Button: ({ children, onClick, loading, icon }) => (
    <button data-testid="button" onClick={onClick} disabled={loading}>
      {icon && <span data-testid="button-icon">{icon}</span>}
      {children}
    </button>
  ),
  Alert: ({ message, type, showIcon }) => (
    <div data-testid="alert" data-type={type} data-show-icon={showIcon}>
      {message}
    </div>
  ),
  Statistic: ({ title, value, prefix }) => (
    <div data-testid="statistic">
      <div data-testid="statistic-title">{title}</div>
      <div data-testid="statistic-value">
        {prefix && <span data-testid="statistic-prefix">{prefix}</span>}
        {value}
      </div>
    </div>
  ),
  Row: ({ children }) => <div data-testid="row">{children}</div>,
  Col: ({ children }) => <div data-testid="col">{children}</div>,
  Modal: ({ title, open, children, onCancel }) => 
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onCancel}>关闭</button>
        {children}
      </div>
    ) : null,
  Descriptions: ({ children, column, size, bordered }) => (
    <div data-testid="descriptions" data-column={column} data-size={size} data-bordered={bordered}>
      {children}
    </div>
  ),
  Skeleton: ({ active, paragraph, title }) => (
    <div data-testid="skeleton" data-active={active}>
      {title && <div data-testid="skeleton-title" />}
      {paragraph && <div data-testid="skeleton-paragraph" />}
    </div>
  ),
  Typography: {
    Text: ({ children, type, style }) => (
      <span data-testid="text" data-type={type} style={style}>
        {children}
      </span>
    )
  },
  message: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock icons
jest.mock('@ant-design/icons', () => ({
  CloudOutlined: () => <span data-testid="cloud-icon">Cloud</span>,
  DatabaseOutlined: () => <span data-testid="database-icon">Database</span>,
  ThunderboltOutlined: () => <span data-testid="thunder-icon">Thunder</span>,
  ExclamationCircleOutlined: () => <span data-testid="exclamation-icon">Exclamation</span>,
  SyncOutlined: ({ spin }) => <span data-testid="sync-icon" data-spin={spin}>Sync</span>,
  CheckCircleOutlined: () => <span data-testid="check-icon">Check</span>,
  ClockCircleOutlined: () => <span data-testid="clock-icon">Clock</span>,
  LoadingOutlined: ({ spin }) => <span data-testid="loading-icon" data-spin={spin}>Loading</span>,
  SaveOutlined: () => <span data-testid="save-icon">Save</span>,
  ReloadOutlined: () => <span data-testid="reload-icon">Reload</span>,
  DeleteOutlined: () => <span data-testid="delete-icon">Delete</span>,
  InfoCircleOutlined: () => <span data-testid="info-icon">Info</span>,
  ClearOutlined: () => <span data-testid="clear-icon">Clear</span>,
  WarningOutlined: () => <span data-testid="warning-icon">Warning</span>,
  BarChartOutlined: () => <span data-testid="chart-icon">Chart</span>
}));

// Mock utils
jest.mock('../../../utils/EmployeePersistence', () => ({
  getEmployeeStatsOptimized: jest.fn().mockResolvedValue({
    total: 10,
    departments: { '生产部': 5, '质量部': 3, '设备部': 2 },
    positions: { '操作员': 6, '检验员': 2, '维修员': 2 },
    lastUpdate: '2026-01-12T10:00:00.000Z',
    cacheStatus: 'cached'
  }),
  getStorageHealth: jest.fn().mockResolvedValue({
    status: 'healthy',
    storageType: 'localStorage',
    dataIntegrity: 'good',
    warnings: [],
    recommendations: []
  }),
  clearAllEmployees: jest.fn().mockResolvedValue(true),
  optimizeData: jest.fn().mockResolvedValue({
    success: true,
    spaceSaved: 1024,
    message: '优化完成'
  })
}));

jest.mock('../../../utils/PersistenceManager', () => ({
  getStorageInfo: jest.fn().mockReturnValue({
    storageType: 'localStorage',
    usage: {
      used: 500,
      total: 5000,
      percentage: 10,
      isNearLimit: false
    },
    stats: {
      totalSize: 1024
    }
  })
}));

describe('DataSourceIndicator', () => {
  test('renders local storage indicator', () => {
    render(<DataSourceIndicator source="local" showLabel={true} />);
    
    expect(screen.getByTestId('tag')).toBeInTheDocument();
    expect(screen.getByText('本地存储')).toBeInTheDocument();
    expect(screen.getByTestId('database-icon')).toBeInTheDocument();
  });

  test('renders server storage indicator', () => {
    render(<DataSourceIndicator source="server" showLabel={true} />);
    
    expect(screen.getByText('服务器')).toBeInTheDocument();
    expect(screen.getByTestId('cloud-icon')).toBeInTheDocument();
  });

  test('shows sync status', () => {
    render(<DataSourceIndicator source="local" syncStatus="syncing" showLabel={true} />);
    
    expect(screen.getByText('本地存储')).toBeInTheDocument();
    expect(screen.getByText('同步中')).toBeInTheDocument();
  });

  test('shows tooltip when enabled', () => {
    render(<DataSourceIndicator source="local" showTooltip={true} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
});

describe('ProgressIndicator', () => {
  test('renders progress indicator when visible', () => {
    render(
      <ProgressIndicator
        visible={true}
        operation="save"
        progress={50}
        status={PROGRESS_STATUS.RUNNING}
        message="保存中..."
        showPercentage={true}
      />
    );
    
    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(
      <ProgressIndicator
        visible={false}
        operation="save"
        progress={50}
        status={PROGRESS_STATUS.RUNNING}
      />
    );
    
    expect(screen.queryByTestId('progress')).not.toBeInTheDocument();
  });

  test('shows success status', () => {
    render(
      <ProgressIndicator
        visible={true}
        operation="save"
        progress={100}
        status={PROGRESS_STATUS.SUCCESS}
        message="保存成功"
      />
    );
    
    expect(screen.getByText('保存成功')).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  test('shows error status', () => {
    render(
      <ProgressIndicator
        visible={true}
        operation="save"
        progress={0}
        status={PROGRESS_STATUS.ERROR}
        message="保存失败"
      />
    );
    
    expect(screen.getByText('保存失败')).toBeInTheDocument();
  });
});

describe('EnhancedLoading', () => {
  test('renders spin loading type', () => {
    render(
      <EnhancedLoading
        loading={true}
        type={LOADING_TYPES.SPIN}
        message="加载中..."
      />
    );
    
    expect(screen.getByTestId('spin')).toBeInTheDocument();
    expect(screen.getByTestId('spin')).toHaveAttribute('data-tip', '加载中...');
  });

  test('renders skeleton loading type', () => {
    render(
      <EnhancedLoading
        loading={true}
        type={LOADING_TYPES.SKELETON}
        skeletonRows={3}
      />
    );
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  test('does not render when not loading', () => {
    render(
      <EnhancedLoading
        loading={false}
        type={LOADING_TYPES.SPIN}
        message="加载中..."
      >
        <div data-testid="content">Content</div>
      </EnhancedLoading>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('spin')).not.toBeInTheDocument();
  });

  test('shows data source when enabled', () => {
    render(
      <EnhancedLoading
        loading={true}
        type={LOADING_TYPES.CUSTOM}
        dataSource="local"
        showDataSource={true}
      />
    );
    
    expect(screen.getByTestId('tag')).toBeInTheDocument();
  });
});

describe('StorageStatsDisplay', () => {
  test('renders storage statistics', async () => {
    render(<StorageStatsDisplay showActions={true} showDetails={true} />);
    
    // Wait for async data loading
    await waitFor(() => {
      expect(screen.getByText('存储统计')).toBeInTheDocument();
    });
    
    // Check if statistics are displayed
    await waitFor(() => {
      expect(screen.getByText('员工总数')).toBeInTheDocument();
      expect(screen.getByText('部门数量')).toBeInTheDocument();
      expect(screen.getByText('职位数量')).toBeInTheDocument();
    });
  });

  test('renders action buttons when enabled', async () => {
    render(<StorageStatsDisplay showActions={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('刷新')).toBeInTheDocument();
      expect(screen.getByText('优化')).toBeInTheDocument();
      expect(screen.getByText('详情')).toBeInTheDocument();
      expect(screen.getByText('清理')).toBeInTheDocument();
    });
  });

  test('opens detail modal when detail button clicked', async () => {
    render(<StorageStatsDisplay showActions={true} />);
    
    await waitFor(() => {
      const detailButton = screen.getByText('详情');
      fireEvent.click(detailButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('存储详细信息')).toBeInTheDocument();
    });
  });

  test('renders compact mode', async () => {
    render(<StorageStatsDisplay compact={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('员工')).toBeInTheDocument();
      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
    });
  });
});

describe('Integration Tests', () => {
  test('components work together', async () => {
    const TestComponent = () => {
      const [loading, setLoading] = React.useState(false);
      const [progress, setProgress] = React.useState(0);
      
      const handleSave = () => {
        setLoading(true);
        setProgress(0);
        
        // Simulate progress
        const timer = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(timer);
              setLoading(false);
              return 100;
            }
            return prev + 20;
          });
        }, 100);
      };
      
      return (
        <div>
          <DataSourceIndicator source="local" showLabel={true} />
          <ProgressIndicator
            visible={loading}
            operation="save"
            progress={progress}
            status={loading ? PROGRESS_STATUS.RUNNING : PROGRESS_STATUS.SUCCESS}
            message={loading ? "保存中..." : "保存完成"}
          />
          <button data-testid="save-button" onClick={handleSave}>
            保存
          </button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Check initial state
    expect(screen.getByText('本地存储')).toBeInTheDocument();
    
    // Trigger save
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('保存中...')).toBeInTheDocument();
    });
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('保存完成')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});