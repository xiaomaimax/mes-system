/**
 * UIFeedbackDemo - UI反馈组件演示
 * 
 * 用于测试和演示UI反馈功能
 */

import React, { useState } from 'react';
import { Card, Button, Space, Row, Col, Divider, Switch, InputNumber } from 'antd';
import { PlayCircleOutlined, PauseOutlined, ReloadOutlined } from '@ant-design/icons';

import DataSourceIndicator from '../common/DataSourceIndicator';
import ProgressIndicator, { FloatingProgress, InlineProgress, PROGRESS_STATUS } from '../common/ProgressIndicator';
import StorageStatsDisplay, { StorageStatusIndicator } from '../common/StorageStatsDisplay';
import EnhancedLoading, { DataLoadingWrapper, LOADING_TYPES } from '../common/EnhancedLoading';
import useUIFeedback, { OPERATION_TYPES } from '../../hooks/useUIFeedback';

const UIFeedbackDemo = () => {
  const [demoState, setDemoState] = useState({
    dataSource: 'local',
    syncStatus: 'synced',
    showProgress: false,
    progress: 0,
    showFloating: false,
    showLoading: false,
    loadingType: LOADING_TYPES.SPIN,
    progressDuration: 2000
  });

  // UI反馈Hook演示
  const uiFeedback = useUIFeedback({
    autoHideSuccess: true,
    showMessages: false, // 关闭消息以避免干扰演示
    trackProgress: true,
    trackDataSource: true
  });

  // 模拟保存操作
  const simulateSave = async () => {
    try {
      await uiFeedback.executeAsync(
        async () => {
          // 模拟异步操作
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ success: true });
            }, demoState.progressDuration);
          });
        },
        OPERATION_TYPES.SAVE,
        '正在保存数据...',
        '数据保存成功',
        '数据保存失败'
      );
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 模拟加载操作
  const simulateLoad = async () => {
    try {
      await uiFeedback.executeAsync(
        async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: [], total: 0 });
            }, demoState.progressDuration);
          });
        },
        OPERATION_TYPES.LOAD,
        '正在加载数据...',
        '数据加载成功',
        '数据加载失败'
      );
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  // 模拟错误操作
  const simulateError = async () => {
    try {
      await uiFeedback.executeAsync(
        async () => {
          return new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('模拟的网络错误'));
            }, 1000);
          });
        },
        OPERATION_TYPES.SYNC,
        '正在同步数据...',
        '数据同步成功',
        '数据同步失败'
      );
    } catch (error) {
      console.error('同步失败:', error);
    }
  };

  // 切换进度演示
  const toggleProgress = () => {
    if (demoState.showProgress) {
      setDemoState(prev => ({ ...prev, showProgress: false, progress: 0 }));
    } else {
      setDemoState(prev => ({ ...prev, showProgress: true, progress: 0 }));
      
      // 模拟进度更新
      const timer = setInterval(() => {
        setDemoState(prev => {
          const newProgress = prev.progress + 10;
          if (newProgress >= 100) {
            clearInterval(timer);
            return { ...prev, progress: 100, showProgress: false };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>UI反馈组件演示</h2>
      
      {/* 数据来源指示器演示 */}
      <Card title="数据来源指示器" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <h4>基本用法</h4>
            <Space direction="vertical">
              <DataSourceIndicator source="local" showLabel={true} />
              <DataSourceIndicator source="server" showLabel={true} />
              <DataSourceIndicator source="cache" showLabel={true} />
              <DataSourceIndicator source="memory" showLabel={true} />
            </Space>
          </Col>
          
          <Col span={8}>
            <h4>带同步状态</h4>
            <Space direction="vertical">
              <DataSourceIndicator source="local" syncStatus="synced" showLabel={true} />
              <DataSourceIndicator source="local" syncStatus="syncing" showLabel={true} />
              <DataSourceIndicator source="local" syncStatus="pending" showLabel={true} />
            </Space>
          </Col>
          
          <Col span={8}>
            <h4>带数据统计</h4>
            <Space direction="vertical">
              <DataSourceIndicator 
                source="local" 
                showLabel={true} 
                showCount={true} 
                count={25}
                lastUpdate="2026-01-12T10:30:00.000Z"
                showLastUpdate={true}
              />
              <StorageStatusIndicator showLabel={true} showStats={true} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 进度指示器演示 */}
      <Card title="进度指示器" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <h4>基本进度</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <ProgressIndicator
                visible={demoState.showProgress}
                operation="save"
                progress={demoState.progress}
                status={demoState.progress >= 100 ? PROGRESS_STATUS.SUCCESS : PROGRESS_STATUS.RUNNING}
                message={demoState.progress >= 100 ? "保存完成" : "保存中..."}
                showPercentage={true}
                showIcon={true}
              />
              
              <Button onClick={toggleProgress} icon={<PlayCircleOutlined />}>
                {demoState.showProgress ? '停止进度' : '开始进度'}
              </Button>
            </Space>
          </Col>
          
          <Col span={12}>
            <h4>内联进度</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InlineProgress
                visible={uiFeedback.isBusy}
                operation={uiFeedback.operation}
                progress={uiFeedback.progress}
                status={uiFeedback.isError ? PROGRESS_STATUS.ERROR : 
                        uiFeedback.isSuccess ? PROGRESS_STATUS.SUCCESS :
                        PROGRESS_STATUS.RUNNING}
                message={uiFeedback.message}
                compact={true}
              />
              
              <Space>
                <Button onClick={simulateSave} loading={uiFeedback.isSaving}>
                  模拟保存
                </Button>
                <Button onClick={simulateLoad} loading={uiFeedback.isLoading}>
                  模拟加载
                </Button>
                <Button onClick={simulateError} loading={uiFeedback.isSyncing}>
                  模拟错误
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 加载状态演示 */}
      <Card title="加载状态" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <h4>旋转加载</h4>
            <EnhancedLoading
              loading={demoState.showLoading && demoState.loadingType === LOADING_TYPES.SPIN}
              type={LOADING_TYPES.SPIN}
              message="加载中..."
              dataSource="local"
              showDataSource={true}
            >
              <div style={{ height: '100px', backgroundColor: '#f5f5f5', padding: '20px' }}>
                内容区域
              </div>
            </EnhancedLoading>
          </Col>
          
          <Col span={8}>
            <h4>骨架屏</h4>
            <EnhancedLoading
              loading={demoState.showLoading && demoState.loadingType === LOADING_TYPES.SKELETON}
              type={LOADING_TYPES.SKELETON}
              skeletonRows={3}
            />
          </Col>
          
          <Col span={8}>
            <h4>自定义加载</h4>
            <EnhancedLoading
              loading={demoState.showLoading && demoState.loadingType === LOADING_TYPES.CUSTOM}
              type={LOADING_TYPES.CUSTOM}
              message="正在处理数据..."
              detail="请稍候..."
              dataSource="server"
              showDataSource={true}
              showProgress={true}
              progress={50}
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Space>
          <span>加载类型:</span>
          <Button 
            type={demoState.loadingType === LOADING_TYPES.SPIN ? 'primary' : 'default'}
            onClick={() => setDemoState(prev => ({ ...prev, loadingType: LOADING_TYPES.SPIN }))}
          >
            旋转
          </Button>
          <Button 
            type={demoState.loadingType === LOADING_TYPES.SKELETON ? 'primary' : 'default'}
            onClick={() => setDemoState(prev => ({ ...prev, loadingType: LOADING_TYPES.SKELETON }))}
          >
            骨架屏
          </Button>
          <Button 
            type={demoState.loadingType === LOADING_TYPES.CUSTOM ? 'primary' : 'default'}
            onClick={() => setDemoState(prev => ({ ...prev, loadingType: LOADING_TYPES.CUSTOM }))}
          >
            自定义
          </Button>
          
          <Switch 
            checked={demoState.showLoading}
            onChange={(checked) => setDemoState(prev => ({ ...prev, showLoading: checked }))}
            checkedChildren="显示"
            unCheckedChildren="隐藏"
          />
        </Space>
      </Card>

      {/* 存储统计演示 */}
      <Card title="存储统计" size="small" style={{ marginBottom: '16px' }}>
        <StorageStatsDisplay
          refreshInterval={0} // 关闭自动刷新以避免演示干扰
          showActions={true}
          showDetails={true}
          compact={false}
        />
      </Card>

      {/* 数据加载包装器演示 */}
      <Card title="数据加载包装器" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <h4>正常状态</h4>
            <DataLoadingWrapper
              loading={false}
              error={null}
              empty={false}
              dataSource="local"
            >
              <div style={{ padding: '20px', backgroundColor: '#f0f2f5' }}>
                正常的数据内容
              </div>
            </DataLoadingWrapper>
          </Col>
          
          <Col span={8}>
            <h4>加载状态</h4>
            <DataLoadingWrapper
              loading={true}
              error={null}
              empty={false}
              dataSource="server"
              loadingProps={{
                type: LOADING_TYPES.SKELETON,
                skeletonRows: 2
              }}
            >
              <div>这里的内容在加载时不会显示</div>
            </DataLoadingWrapper>
          </Col>
          
          <Col span={8}>
            <h4>空数据状态</h4>
            <DataLoadingWrapper
              loading={false}
              error={null}
              empty={true}
              emptyText="暂无数据"
              dataSource="local"
            />
          </Col>
        </Row>
      </Card>

      {/* 浮动进度提示 */}
      <FloatingProgress
        visible={uiFeedback.isBusy}
        operation={uiFeedback.operation}
        progress={uiFeedback.progress}
        status={uiFeedback.isError ? PROGRESS_STATUS.ERROR : 
                uiFeedback.isSuccess ? PROGRESS_STATUS.SUCCESS :
                PROGRESS_STATUS.RUNNING}
        message={uiFeedback.message}
        position="bottomRight"
        autoHide={true}
        hideDelay={2000}
      />

      {/* 控制面板 */}
      <Card title="控制面板" size="small">
        <Space>
          <span>进度持续时间:</span>
          <InputNumber
            value={demoState.progressDuration}
            onChange={(value) => setDemoState(prev => ({ ...prev, progressDuration: value }))}
            min={500}
            max={10000}
            step={500}
            formatter={value => `${value}ms`}
            parser={value => value.replace('ms', '')}
          />
          
          <Button onClick={uiFeedback.reset} icon={<ReloadOutlined />}>
            重置状态
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default UIFeedbackDemo;