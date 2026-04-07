import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Button, message, Modal, Progress } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const ImportExportButton = ({ module, moduleName, onRefresh }) => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState('xlsx');

  // 处理文件选择
  const handleFileSelect = (file) => {
    const isExcel = file.type === 'application/vnd.ms-excel' ||
                   file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isCSV = file.type === 'text/csv' || file.type === 'application/csv';

    if (!isExcel && !isCSV) {
      message.error('仅支持 Excel (.xlsx, .xls) 和 CSV 文件');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      message.error('文件大小不能超过 10MB');
      return false;
    }

    setImportFile(file);
    return false; // 阻止自动上传
  };

  // 上传导入文件
  const handleImport = async () => {
    if (!importFile) {
      message.warning('请先选择文件');
      return;
    }

    setImporting(true);
    setImportProgress(0);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await axios.post(
        `/api/import-export/${module}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setImportProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        message.success(
          `${response.data.message} (成功: ${response.data.importedCount}, 失败: ${response.data.failedCount})`
        );
        setImportModalVisible(false);
        setImportFile(null);
        setImportProgress(0);
        if (onRefresh) onRefresh();
      } else {
        message.error(response.data.message || '导入失败');
      }
    } catch (error) {
      console.error('导入错误:', error);
      message.error(error.response?.data?.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        `/api/import-export/${module}/export/template`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${module}_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('模板下载成功');
    } catch (error) {
      console.error('模板下载错误:', error);
      message.error('模板下载失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);

    try {
      const response = await axios.get(
        `/api/import-export/${module}/export?format=${exportFormat}`,
        { responseType: 'blob' },
        {
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setExportProgress(percentCompleted);
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${module}_export_${Date.now()}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('导出成功');
      setExportModalVisible(false);
      setExportProgress(0);
    } catch (error) {
      console.error('导出错误:', error);
      message.error(error.response?.data?.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* 导入按钮 */}
      <Upload
        beforeUpload={handleFileSelect}
        showUploadList={false}
        accept=".xlsx,.xls,.csv"
        disabled={importing}
      >
        <Button
          icon={<UploadOutlined />}
          loading={importing}
          onClick={() => setImportModalVisible(true)}
        >
          导入
        </Button>
      </Upload>

      {/* 导出按钮 */}
      <Button
        icon={<DownloadOutlined />}
        onClick={() => setExportModalVisible(true)}
        loading={exporting}
      >
        导出
      </Button>

      {/* 导入模态框 */}
      <Modal
        title={`导入 ${moduleName}`}
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setImportFile(null);
          setImportProgress(0);
        }}
        footer={[
          <Button key="template" onClick={handleDownloadTemplate} icon={<FileExcelOutlined />}>
            下载模板
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setImportModalVisible(false);
              setImportFile(null);
              setImportProgress(0);
            }}
          >
            取消
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleImport}
            loading={importing}
            disabled={!importFile}
          >
            开始导入
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          {importFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <div style={{ fontWeight: 500 }}>{importFile.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {(importFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              请选择要导入的文件
            </div>
          )}
        </div>

        {importing && (
          <div style={{ marginTop: 16 }}>
            <Progress
              percent={importProgress}
              status="active"
              strokeColor="#52c41a"
            />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              {importProgress < 100 ? '正在导入...' : '导入完成！'}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <strong>支持格式：</strong>
            <span>Excel (.xlsx, .xls), CSV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <strong>文件大小限制：</strong>
            <span>最大 10MB</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <strong>建议：</strong>
            <span>先下载模板，填写数据后再导入</span>
          </div>
        </div>
      </Modal>

      {/* 导出模态框 */}
      <Modal
        title={`导出 ${moduleName}`}
        open={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false);
          setExportProgress(0);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setExportModalVisible(false);
              setExportProgress(0);
            }}
          >
            取消
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            导出数据
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>选择导出格式：</strong>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="exportFormat"
                value="xlsx"
                checked={exportFormat === 'xlsx'}
                onChange={(e) => setExportFormat(e.target.value)}
              />
              <FileExcelOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <span>Excel (.xlsx)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value)}
              />
              <FileTextOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <span>CSV (.csv)</span>
            </label>
          </div>
        </div>

        {exporting && (
          <div style={{ marginTop: 16 }}>
            <Progress
              percent={exportProgress}
              status="active"
              strokeColor="#52c41a"
            />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              {exportProgress < 100 ? '正在导出...' : '导出完成！'}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <strong>注意：</strong>
            <span>最多导出 10,000 条记录</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImportExportButton;
