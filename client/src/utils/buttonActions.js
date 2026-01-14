import { message, Modal, notification } from 'antd';

// 确保message API可用的安全包装器
const safeMessage = {
  success: (content, duration) => {
    try {
      if (message && typeof message.success === 'function') {
        return message.success(content, duration);
      } else {
        console.log('✅', content);
      }
    } catch (error) {
      console.warn('调用message.success时出错:', error);
      console.log('✅', content);
    }
  },
  error: (content, duration) => {
    try {
      if (message && typeof message.error === 'function') {
        return message.error(content, duration);
      } else {
        console.error('❌', content);
      }
    } catch (error) {
      console.warn('调用message.error时出错:', error);
      console.error('❌', content);
    }
  },
  warning: (content, duration) => {
    try {
      if (message && typeof message.warning === 'function') {
        return message.warning(content, duration);
      } else {
        console.warn('⚠️', content);
      }
    } catch (error) {
      console.warn('调用message.warning时出错:', error);
      console.warn('⚠️', content);
    }
  },
  loading: (content, duration) => {
    try {
      if (message && typeof message.loading === 'function') {
        return message.loading(content, duration);
      } else {
        console.log('⏳', content);
      }
    } catch (error) {
      console.warn('调用message.loading时出错:', error);
      console.log('⏳', content);
    }
  }
};

/**
 * 通用按钮功能处理工具
 * 为所有模块提供统一的按钮交互功能
 */

export class ButtonActions {
  
  // 通用成功消息
  static showSuccess(msg) {
    safeMessage.success(msg);
  }

  // 通用警告消息
  static showWarning(msg) {
    safeMessage.warning(msg);
  }

  // 通用错误消息
  static showError(msg) {
    safeMessage.error(msg);
  }

  // 通用信息消息
  static showInfo(msg) {
    message.info(msg);
  }

  // 通用确认对话框
  static showConfirm(title, content, onOk, onCancel) {
    Modal.confirm({
      title,
      content,
      onOk,
      onCancel,
      okText: '确定',
      cancelText: '取消'
    });
  }

  // 通用通知
  static showNotification(type, title, description) {
    notification[type]({
      message: title,
      description,
      duration: 4.5,
    });
  }

  // 模拟数据保存
  static simulateSave(itemName, callback) {
    const loading = safeMessage.loading(`正在保存${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}保存成功！`);
      if (callback) callback();
    }, 1500);
  }

  // 模拟数据删除
  static simulateDelete(itemName, callback) {
    Modal.confirm({
      title: `确认删除${itemName}？`,
      content: '删除后无法恢复，请确认是否继续？',
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const loading = safeMessage.loading(`正在删除${itemName}...`, 0);
        setTimeout(() => {
          loading();
          safeMessage.success(`${itemName}删除成功！`);
          if (callback) callback();
        }, 1000);
      }
    });
  }

  // 模拟数据提交
  static simulateSubmit(itemName, callback) {
    const loading = safeMessage.loading(`正在提交${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}提交成功！`);
      if (callback) callback();
    }, 1200);
  }

  // 模拟数据导出
  static simulateExport(itemName, format = 'Excel') {
    const loading = safeMessage.loading(`正在导出${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}导出成功！文件格式：${format}`);
      // 模拟文件下载
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${itemName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
    }, 2000);
  }

  // 模拟数据导入
  static simulateImport(itemName, callback) {
    const loading = safeMessage.loading(`正在导入${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}导入成功！共导入 ${Math.floor(Math.random() * 50) + 10} 条记录`);
      if (callback) callback();
    }, 2500);
  }

  // 模拟审批操作
  static simulateApproval(itemName, action = '审批', callback) {
    Modal.confirm({
      title: `确认${action}${itemName}？`,
      content: `请确认是否${action}该${itemName}？`,
      okText: `确定${action}`,
      cancelText: '取消',
      onOk() {
        const loading = safeMessage.loading(`正在${action}${itemName}...`, 0);
        setTimeout(() => {
          loading();
          safeMessage.success(`${itemName}${action}成功！`);
          if (callback) callback();
        }, 1000);
      }
    });
  }

  // 模拟打印操作
  static simulatePrint(itemName) {
    const loading = safeMessage.loading(`正在准备打印${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}打印任务已发送到打印机！`);
      // 模拟打印预览
      window.print();
    }, 1000);
  }

  // 模拟刷新数据
  static simulateRefresh(itemName, callback) {
    const loading = safeMessage.loading(`正在刷新${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}数据已刷新！`);
      if (callback) callback();
    }, 800);
  }

  // 模拟搜索操作
  static simulateSearch(keyword, callback) {
    if (!keyword || keyword.trim() === '') {
      safeMessage.warning('请输入搜索关键词！');
      return;
    }
    
    const loading = safeMessage.loading('正在搜索...', 0);
    setTimeout(() => {
      loading();
      const resultCount = Math.floor(Math.random() * 20) + 1;
      safeMessage.success(`搜索完成！找到 ${resultCount} 条相关记录`);
      if (callback) callback(resultCount);
    }, 1200);
  }

  // 模拟状态切换
  static simulateStatusChange(itemName, newStatus, callback) {
    const loading = safeMessage.loading(`正在更新${itemName}状态...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}状态已更新为：${newStatus}`);
      if (callback) callback();
    }, 800);
  }

  // 模拟发送操作
  static simulateSend(itemName, target, callback) {
    Modal.confirm({
      title: `确认发送${itemName}？`,
      content: `将${itemName}发送到：${target}`,
      okText: '确定发送',
      cancelText: '取消',
      onOk() {
        const loading = safeMessage.loading(`正在发送${itemName}...`, 0);
        setTimeout(() => {
          loading();
          safeMessage.success(`${itemName}发送成功！`);
          if (callback) callback();
        }, 1500);
      }
    });
  }

  // 模拟复制操作
  static simulateCopy(itemName, callback) {
    const loading = safeMessage.loading(`正在复制${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}复制成功！`);
      if (callback) callback();
    }, 500);
  }

  // 模拟重置操作
  static simulateReset(itemName, callback) {
    Modal.confirm({
      title: `确认重置${itemName}？`,
      content: '重置后将清空所有数据，请确认是否继续？',
      okText: '确定重置',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const loading = safeMessage.loading(`正在重置${itemName}...`, 0);
        setTimeout(() => {
          loading();
          safeMessage.success(`${itemName}重置成功！`);
          if (callback) callback();
        }, 1000);
      }
    });
  }

  // 模拟启动/停止操作
  static simulateToggle(itemName, isRunning, callback) {
    const action = isRunning ? '停止' : '启动';
    const loading = safeMessage.loading(`正在${action}${itemName}...`, 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`${itemName}${action}成功！`);
      if (callback) callback(!isRunning);
    }, 1000);
  }

  // 模拟配置保存
  static simulateConfigSave(configName, callback) {
    const loading = safeMessage.loading(`正在保存${configName}配置...`, 0);
    setTimeout(() => {
      loading();
      notification.success({
        message: '配置保存成功',
        description: `${configName}配置已保存，将在下次重启后生效。`,
        duration: 4.5,
      });
      if (callback) callback();
    }, 1500);
  }

  // 模拟测试连接
  static simulateTestConnection(serviceName, callback) {
    const loading = safeMessage.loading(`正在测试${serviceName}连接...`, 0);
    setTimeout(() => {
      loading();
      const isSuccess = Math.random() > 0.2; // 80% 成功率
      if (isSuccess) {
        safeMessage.success(`${serviceName}连接测试成功！`);
      } else {
        safeMessage.error(`${serviceName}连接测试失败，请检查配置！`);
      }
      if (callback) callback(isSuccess);
    }, 2000);
  }

  // 模拟同步操作
  static simulateSync(itemName, callback) {
    const loading = safeMessage.loading(`正在同步${itemName}...`, 0);
    setTimeout(() => {
      loading();
      const syncCount = Math.floor(Math.random() * 100) + 10;
      notification.success({
        message: '同步完成',
        description: `${itemName}同步成功！共同步 ${syncCount} 条记录。`,
        duration: 4.5,
      });
      if (callback) callback(syncCount);
    }, 3000);
  }

  // 模拟生成报告
  static simulateGenerateReport(reportName, callback) {
    const loading = safeMessage.loading(`正在生成${reportName}...`, 0);
    setTimeout(() => {
      loading();
      notification.success({
        message: '报告生成成功',
        description: `${reportName}已生成完成，可以查看或下载。`,
        duration: 4.5,
      });
      if (callback) callback();
    }, 3000);
  }

  // 模拟发送通知
  static simulateSendNotification(title, recipients, callback) {
    const loading = safeMessage.loading('正在发送通知...', 0);
    setTimeout(() => {
      loading();
      safeMessage.success(`通知已发送给 ${recipients} 位用户！`);
      if (callback) callback();
    }, 1500);
  }

  // 模拟备份操作
  static simulateBackup(itemName, callback) {
    const loading = safeMessage.loading(`正在备份${itemName}...`, 0);
    setTimeout(() => {
      loading();
      notification.success({
        message: '备份完成',
        description: `${itemName}备份成功！备份文件已保存到服务器。`,
        duration: 4.5,
      });
      if (callback) callback();
    }, 4000);
  }

  // 模拟恢复操作
  static simulateRestore(itemName, callback) {
    Modal.confirm({
      title: `确认恢复${itemName}？`,
      content: '恢复操作将覆盖当前数据，请确认是否继续？',
      okText: '确定恢复',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const loading = safeMessage.loading(`正在恢复${itemName}...`, 0);
        setTimeout(() => {
          loading();
          notification.success({
            message: '恢复完成',
            description: `${itemName}恢复成功！数据已恢复到备份时的状态。`,
            duration: 4.5,
          });
          if (callback) callback();
        }, 3000);
      }
    });
  }
}

// 导出默认实例
export default ButtonActions;