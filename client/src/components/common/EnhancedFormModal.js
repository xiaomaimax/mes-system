/**
 * EnhancedFormModal - 增强的表单Modal组件
 * 
 * 功能：
 * - 表单验证反馈
 * - 自动保存草稿
 * - 快捷键支持 (Ctrl+S 保存, Esc 取消)
 * - 字段级错误提示
 * - 表单脏值检测
 * - 离开前确认
 * - 进度指示器集成
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Form, Button, Space, Alert, Tooltip, Spin, message, Divider } from 'antd';
import { SaveOutlined, ClearOutlined, UndoOutlined, HistoryOutlined } from '@ant-design/icons';
import ProgressIndicator, { PROGRESS_STATUS } from './ProgressIndicator';

const EnhancedFormModal = ({
  title = '表单',
  visible = false,
  onOk = null,
  onCancel = null,
  form = null,
  loading = false,
  children = null,
  width = 800,
  destroyOnClose = true,
  okText = '保存',
  cancelText = '取消',
  enableDraftSave = true,
  draftStorageKey = 'form_draft',
  enableKeyboardShortcuts = true,
  enableFieldValidation = true,
  showProgress = false,
  progress = 0,
  progressStatus = PROGRESS_STATUS.IDLE,
  progressMessage = '',
  onFieldChange = null,
  onDraftSave = null,
  onDraftLoad = null,
  onDraftClear = null,
  validateTrigger = 'onChange',
  scrollToFirstError = true,
  preserveValues = false
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enableDraftSave);
  
  const draftSaveTimerRef = useRef(null);
  const initialValuesRef = useRef(null);
  const AUTO_SAVE_DELAY = 3000; // 3秒自动保存
  
  // 检查是否有草稿
  useEffect(() => {
    if (enableDraftSave && visible) {
      const savedDraft = localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setDraftData(draft);
          setHasDraft(true);
          setShowDraftAlert(true);
        } catch (error) {
          console.warn('加载草稿失败:', error);
        }
      }
    }
  }, [visible, enableDraftSave, draftStorageKey]);
  
  // 保存草稿到localStorage
  const saveDraft = useCallback(() => {
    if (!enableDraftSave || !form) return;
    
    try {
      const values = form.getFieldsValue();
      const draft = {
        data: values,
        timestamp: new Date().toISOString(),
        version: 1
      };
      
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setDraftData(draft);
      setHasDraft(true);
      
      if (onDraftSave) {
        onDraftSave(draft);
      }
      
      console.log('草稿已保存');
    } catch (error) {
      console.warn('保存草稿失败:', error);
    }
  }, [enableDraftSave, form, draftStorageKey, onDraftSave]);
  
  // 加载草稿
  const loadDraft = useCallback(() => {
    if (!draftData || !form) return;
    
    try {
      form.setFieldsValue(draftData.data);
      setIsDirty(true);
      setShowDraftAlert(false);
      
      if (onDraftLoad) {
        onDraftLoad(draftData);
      }
      
      message.success('草稿已加载');
    } catch (error) {
      console.warn('加载草稿失败:', error);
      message.error('加载草稿失败');
    }
  }, [draftData, form, onDraftLoad]);
  
  // 清除草稿
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftStorageKey);
      setDraftData(null);
      setHasDraft(false);
      setShowDraftAlert(false);
      
      if (onDraftClear) {
        onDraftClear();
      }
      
      message.success('草稿已清除');
    } catch (error) {
      console.warn('清除草稿失败:', error);
    }
  }, [draftStorageKey, onDraftClear]);
  
  // 处理表单值变化
  const handleFormChange = useCallback(() => {
    if (!form) return;
    
    setIsDirty(true);
    
    // 自动保存草稿
    if (autoSaveEnabled && enableDraftSave) {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);
      }
      
      draftSaveTimerRef.current = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
    }
    
    // 字段级验证
    if (enableFieldValidation) {
      form.validateFields({ validateOnly: true })
        .then(() => {
          setFieldErrors({});
        })
        .catch((errorInfo) => {
          const errors = {};
          errorInfo.errorFields.forEach(field => {
            errors[field.name.join('.')] = field.errors[0];
          });
          setFieldErrors(errors);
        });
    }
    
    if (onFieldChange) {
      onFieldChange(form.getFieldsValue());
    }
  }, [form, autoSaveEnabled, enableDraftSave, enableFieldValidation, saveDraft, onFieldChange]);
  
  // 快捷键处理
  useEffect(() => {
    if (!enableKeyboardShortcuts || !visible) return;
    
    const handleKeyDown = (e) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onOk) {
          onOk();
        }
      }
      
      // Esc 取消
      if (e.key === 'Escape') {
        if (isDirty) {
          Modal.confirm({
            title: '确认取消',
            content: '表单有未保存的更改，确定要取消吗？',
            okText: '确定',
            cancelText: '继续编辑',
            onOk: () => {
              if (onCancel) {
                onCancel();
              }
            }
          });
        } else {
          if (onCancel) {
            onCancel();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, visible, isDirty, onOk, onCancel]);
  
  // 处理Modal关闭
  const handleCancel = useCallback(() => {
    if (isDirty) {
      Modal.confirm({
        title: '确认取消',
        content: '表单有未保存的更改，确定要取消吗？',
        okText: '确定',
        cancelText: '继续编辑',
        onOk: () => {
          if (!preserveValues) {
            form?.resetFields();
          }
          if (onCancel) {
            onCancel();
          }
        }
      });
    } else {
      if (!preserveValues) {
        form?.resetFields();
      }
      if (onCancel) {
        onCancel();
      }
    }
  }, [isDirty, form, preserveValues, onCancel]);
  
  // 处理Modal打开
  const handleModalOpen = useCallback((open) => {
    if (open) {
      setIsDirty(false);
      setFieldErrors({});
      initialValuesRef.current = form?.getFieldsValue();
    }
  }, [form]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, []);
  
  // 渲染草稿提示
  const renderDraftAlert = () => {
    if (!showDraftAlert || !hasDraft) return null;
    
    return (
      <Alert
        message="检测到未保存的草稿"
        description={`上次保存时间: ${new Date(draftData?.timestamp).toLocaleString()}`}
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
        action={
          <Space size="small">
            <Button size="small" type="primary" onClick={loadDraft}>
              加载草稿
            </Button>
            <Button size="small" onClick={clearDraft}>
              放弃
            </Button>
          </Space>
        }
      />
    );
  };
  
  // 渲染字段错误提示
  const renderFieldErrors = () => {
    const errorCount = Object.keys(fieldErrors).length;
    if (errorCount === 0) return null;
    
    return (
      <Alert
        message={`表单有 ${errorCount} 个错误`}
        type="error"
        showIcon
        style={{ marginBottom: '16px' }}
        action={
          <Button size="small" onClick={() => {
            if (form && scrollToFirstError) {
              form.scrollToField(Object.keys(fieldErrors)[0]);
            }
          }}>
            定位到第一个错误
          </Button>
        }
      />
    );
  };
  
  // 渲染进度指示器
  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <ProgressIndicator
          visible={true}
          operation="save"
          progress={progress}
          status={progressStatus}
          message={progressMessage}
          showPercentage={true}
          showIcon={true}
          showMessage={true}
          size="small"
        />
      </div>
    );
  };
  
  // 渲染Modal底部按钮
  const renderFooter = () => {
    return (
      <Space>
        <Tooltip title="Ctrl+S 保存">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={onOk}
            disabled={!isDirty && !loading}
          >
            {loading ? '保存中...' : okText}
          </Button>
        </Tooltip>
        
        {enableDraftSave && (
          <Tooltip title="自动保存草稿">
            <Button
              icon={<HistoryOutlined />}
              type={autoSaveEnabled ? 'primary' : 'default'}
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            >
              {autoSaveEnabled ? '自动保存' : '手动保存'}
            </Button>
          </Tooltip>
        )}
        
        {isDirty && (
          <Tooltip title="清除更改">
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                form?.resetFields();
                setIsDirty(false);
                setFieldErrors({});
              }}
            >
              重置
            </Button>
          </Tooltip>
        )}
        
        <Tooltip title="Esc 取消">
          <Button onClick={handleCancel}>
            {cancelText}
          </Button>
        </Tooltip>
      </Space>
    );
  };
  
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={onOk}
      width={width}
      destroyOnClose={destroyOnClose}
      footer={renderFooter()}
      confirmLoading={loading}
      okText={okText}
      cancelText={cancelText}
      onOpenChange={handleModalOpen}
    >
      <Spin spinning={loading} tip="处理中...">
        {renderDraftAlert()}
        {renderFieldErrors()}
        {renderProgress()}
        
        {children}
      </Spin>
    </Modal>
  );
};

export default EnhancedFormModal;
