/**
 * EmployeeStorageStatus - 员工数据存储状态显示组件
 * 
 * 功能：
 * - 显示存储状态和健康信息
 * - 提供数据管理操作界面
 * - 错误提示和用户指导
 * - 数据导入导出功能
 * 
 * Requirements: 6.3, 7.4, 7.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Alert, 
  Progress, 
  Button, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  Modal, 
  Upload, 
  message,
  Tooltip,
  Divider,
  Tag
} from 'antd';
import {
  DatabaseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import EmployeePersistence from '../../utils/EmployeePersistence.js';
import EmployeeDataExporter from '../../utils/EmployeeDataExporter.js';

const { Dragger } = Upload;

/**
 * 员工存储状态组件
 */
const EmployeeStorageStatus = ({ onDataChange }) => {
  const [storageHealth, setStorageHealth] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  /**
   * 加载存储状态信息
   */
  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      
      const [health, stats] = await Promise.all([
        EmployeePersistence.getStorageHealth(),
        EmployeePersistence.getEmployeeStats()
      ]);
      
      setStorageHealth(health);
      setEmployeeStats(stats);
      
    } catch (error) {
      console.error('加载存储信息失败:', error);
      safeMessage.error('加载存储信息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = async () => {
    await loadStorageInfo();
    safeMessage.success('存储信息已刷新');
  };

  /**
   * 清除所有数据
   */
  const handleClearData = async () => {
    try {
      const success = await EmployeePersistence.clearAllEmployees();
      if (success) {
        safeMessage.success('所有员工数据已清除');
        await loadStorageInfo();
        onDataChange && onDataChange();
      } else {
        safeMessage.error('清除数据失败');
      }
    } catch (error) {
      console.error('清除数据失败:', error);
      safeMessage.error('清除数据失败: ' + error.message);
    }
    setClearModalVisible(false);
  };

  /**
   * 导出数据
   */
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const result = await EmployeeDataExporter.exportEmployees(format, { pretty: true });
      
      if (result.success) {
        safeMessage.success(`成功导出 ${result.recordCount} 条员工数据`);
      } else {
        safeMessage.error('导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      safeMessage.error('导出失败: ' + error.message);
    } finally {
      setExporting(false);
      setExportModalVisible(false);
    }
  };

  /**
   * 下载模板
   */
  const handleDownloadTemplate = async (format) => {
    try {
      const result = await EmployeeDataExporter.getExportTemplate(format);
      if (result.success) {
        safeMessage.success('模板下载成功');
      } else {
        safeMessage.error('模板下载失败');
      }
    } catch (error) {
      console.error('模板下载失败:', error);
      safeMessage.error('模板下载失败: ' + error.message);
    }
  };

  /**
   * 导入数据
   */
  const handleImport = async (file, options = {}) => {
    try {
      setImporting(true);
      
      const result = await EmployeeDataExporter.importEmployees(file, {
        strategy: 'merge',
        skipDuplicates: false,
        ...options
      });
      
      if (result.success) {
        let successMsg = `成功导入 ${result.processed} 条员工数据`;
        if (result.skipped > 0) {
          successMsg += `，跳过 ${result.skipped} 条`;
        }
        
        safeMessage.success(successMsg);
        
        if (result.warnings.length > 0) {
          Modal.info({
            title: '导入警告',
            content: (
              <div>
                <p>数据导入成功，但有以下警告：</p>
                <ul>
                  {result.warnings.slice(0, 10).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                  {result.warnings.length > 10 && (
                    <li>...还有 {result.warnings.length - 10} 个警告</li>
                  )}
                </ul>
              </div>
            )
          });
        }
        
        await loadStorageInfo();
        onDataChange && onDataChange();
        
      } else {
        safeMessage.error('导入失败');
      }
      
    } catch (error) {
      console.error('导入失败:', error);
      safeMessage.error('导入失败: ' + error.message);
    } finally {
      setImporting(false);
      setImportModalVisible(false);
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleOutlined />;
      case 'degraded': return <WarningOutlined />;
      case 'error': return <ExclamationCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  /**
   * 渲染存储类型标签
   */
  const renderStorageTypeTag = (storageType) => {
    const typeConfig = {
      localStorage: { color: 'green', text: '本地存储' },
      sessionStorage: { color: 'orange', text: '会话存储' },
      memory: { color: 'red', text: '内存模式' },
      unknown: { color: 'default', text: '未知' }
    };
    
    const config = typeConfig[storageType] || typeConfig.unknown;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 渲染警告列表
   */
  const renderWarnings = (warnings) => {
    if (!warnings || warnings.length === 0) return null;
    
    return (
      <Alert
        type="warning"
        showIcon
        message="存储警告"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  /**
   * 渲染建议列表
   */
  const renderRecommendations = (recommendations) => {
    if (!recommendations || recommendations.length === 0) return null;
    
    return (
      <Alert
        type="info"
        showIcon
        message="优化建议"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadStorageInfo();
  }, []);

  if (loading) {
    return (
      <Card loading={true} title="存储状态">
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            员工数据存储状态
            <Tooltip title="点击刷新存储信息">
              <Button 
                type="text" 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                size="small"
              />
            </Tooltip>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              导出数据
            </Button>
            <Button 
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              导入数据
            </Button>
          </Space>
        }
      >
        {/* 存储健康状态 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="存储状态"
                value={storageHealth?.status || '未知'}
                prefix={getStatusIcon(storageHealth?.status)}
                valueStyle={{ 
                  color: storageHealth?.status === 'healthy' ? '#3f8600' : 
                         storageHealth?.status === 'degraded' ? '#cf1322' : '#666'
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="存储类型"
                value={renderStorageTypeTag(storageHealth?.storageType)}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="员工总数"
                value={employeeStats?.total || 0}
                suffix="人"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="数据完整性"
                value={storageHealth?.dataIntegrity || '未知'}
                valueStyle={{ 
                  color: storageHealth?.dataIntegrity === 'good' ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* 存储使用情况 */}
        {employeeStats?.storage && (
          <div style={{ marginBottom: 24 }}>
            <h4>存储使用情况</h4>
            <Progress
              percent={Math.round(employeeStats.storage.usage.percentage)}
              status={employeeStats.storage.usage.isNearLimit ? 'exception' : 'normal'}
              format={percent => `${percent}%`}
            />
            <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
              存储类型: {employeeStats.storage.type} | 
              可用: {employeeStats.storage.available ? '是' : '否'}
            </div>
          </div>
        )}

        {/* 部门统计 */}
        {employeeStats?.departments && Object.keys(employeeStats.departments).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4>部门分布</h4>
            <Row gutter={8}>
              {Object.entries(employeeStats.departments).map(([dept, count]) => (
                <Col key={dept} span={6}>
                  <Tag color="blue">{dept}: {count}人</Tag>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 警告信息 */}
        {renderWarnings(storageHealth?.warnings)}

        {/* 优化建议 */}
        {renderRecommendations(storageHealth?.recommendations)}

        {/* 数据管理操作 */}
        <Divider />
        <div>
          <h4>数据管理</h4>
          <Space>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => setClearModalVisible(true)}
            >
              清除所有数据
            </Button>
            <Button onClick={handleRefresh}>
              刷新状态
            </Button>
          </Space>
        </div>
      </Card>

      {/* 导出数据模态框 */}
      <Modal
        title="导出员工数据"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={500}
      >
        <div>
          <p>选择导出格式：</p>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              block 
              loading={exporting}
              onClick={() => handleExport('json')}
            >
              导出为 JSON 格式
            </Button>
            <Button 
              block 
              loading={exporting}
              onClick={() => handleExport('csv')}
            >
              导出为 CSV 格式
            </Button>
          </Space>
          
          <Divider />
          
          <p>下载导入模板：</p>
          <Space>
            <Button onClick={() => handleDownloadTemplate('json')}>
              JSON 模板
            </Button>
            <Button onClick={() => handleDownloadTemplate('csv')}>
              CSV 模板
            </Button>
          </Space>
        </div>
      </Modal>

      {/* 导入数据模态框 */}
      <Modal
        title="导入员工数据"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <div>
          <Alert
            type="info"
            message="导入说明"
            description={
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                <li>支持 JSON 和 CSV 格式文件</li>
                <li>文件大小不超过 10MB</li>
                <li>重复数据将被更新，新数据将被添加</li>
                <li>建议先下载模板了解数据格式</li>
              </ul>
            }
            style={{ marginBottom: 16 }}
          />
          
          <Dragger
            name="file"
            multiple={false}
            accept=".json,.csv"
            beforeUpload={(file) => {
              handleImport(file);
              return false; // 阻止自动上传
            }}
            disabled={importing}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              {importing ? '正在导入...' : '点击或拖拽文件到此区域上传'}
            </p>
            <p className="ant-upload-hint">
              支持 JSON 和 CSV 格式文件
            </p>
          </Dragger>
        </div>
      </Modal>

      {/* 清除数据确认模态框 */}
      <Modal
        title="确认清除数据"
        open={clearModalVisible}
        onOk={handleClearData}
        onCancel={() => setClearModalVisible(false)}
        okText="确认清除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Alert
          type="warning"
          message="警告"
          description="此操作将永久删除所有员工数据，且无法恢复。请确认您真的要执行此操作。"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <p>当前员工数据：<strong>{employeeStats?.total || 0}</strong> 条</p>
        <p>建议在清除前先导出数据作为备份。</p>
      </Modal>
    </div>
  );
};

export default EmployeeStorageStatus;