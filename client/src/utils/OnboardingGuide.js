/**
 * OnboardingGuide - 新手引导系统
 * 
 * 功能：
 * - 为首次登录的用户提供交互式引导
 * - 帮助用户理解系统的主要功能和流程
 * - 支持跳过、暂停和重新开始
 * - 记录用户的引导完成状态
 */

class OnboardingGuide {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.steps = [];
    this.overlay = null;
    this.tooltip = null;
    this.storageKey = 'mes_onboarding_completed';
    this.userTypeKey = 'mes_user_type';
    this._instanceId = Date.now() + Math.random(); // 唯一实例ID
    console.log(`[OnboardingGuide] 构造函数执行，实例ID: ${this._instanceId}`);
  }

  /**
   * 初始化引导系统（单例模式）
   */
  static initialize() {
    // 如果已经有实例在运行，直接返回
    if (window.__onboardingGuideInstance) {
      console.log('[OnboardingGuide] 已存在实例，返回现有实例');
      console.log('[OnboardingGuide] 现有实例ID:', window.__onboardingGuideInstance._instanceId);
      return window.__onboardingGuideInstance;
    }
    
    console.log('[OnboardingGuide] 创建新实例');
    const instance = new OnboardingGuide();
    window.__onboardingGuideInstance = instance;
    console.log('[OnboardingGuide] 新实例已设置为全局实例，ID:', instance._instanceId);
    
    // 检查用户是否已完成引导
    const completed = localStorage.getItem(instance.storageKey);
    console.log('[OnboardingGuide] 引导完成状态:', completed);
    
    if (!completed) {
      // 首次登录，显示引导
      console.log('[OnboardingGuide] 首次登录，1秒后启动引导');
      setTimeout(() => {
        console.log('[OnboardingGuide] 准备启动引导...');
        instance.start();
      }, 1000);
    } else {
      console.log('[OnboardingGuide] 用户已完成引导，不自动启动');
    }
    
    return instance;
  }

  /**
   * 定义引导步骤
   */
  defineSteps() {
    this.steps = [
      {
        id: 'welcome',
        title: '欢迎使用 MES 系统',
        description: '这是一个为制造企业设计的智能执行系统。我们将为您介绍系统的主要功能。',
        target: null,
        position: 'center',
        action: 'next'
      },
      {
        id: 'sidebar',
        title: '功能菜单',
        description: '左侧菜单包含系统的所有主要功能模块。您可以点击任何菜单项来访问相应的功能。',
        target: 'aside.ant-layout-sider',
        position: 'right',
        action: 'next'
      },
      {
        id: 'dashboard',
        title: '仪表板',
        description: '首页显示关键业务指标和实时数据。这是您了解生产状态的最快方式。',
        target: '[role="menuitem"]:first-child',
        position: 'right',
        action: 'next'
      },
      {
        id: 'production',
        title: '生产管理',
        description: '管理生产计划、任务分配和进度跟踪。这是日常工作的核心模块。',
        target: '[role="menuitem"]:nth-child(4)',
        position: 'right',
        action: 'next'
      },
      {
        id: 'quality',
        title: '质量管理',
        description: '记录和监控产品质量数据，确保产品符合标准。',
        target: '[role="menuitem"]:nth-child(6)',
        position: 'right',
        action: 'next'
      },
      {
        id: 'inventory',
        title: '库存管理',
        description: '管理原材料和成品库存，优化库存结构。',
        target: '[role="menuitem"]:nth-child(7)',
        position: 'right',
        action: 'next'
      },
      {
        id: 'reports',
        title: '报表分析',
        description: '查看各种业务报表和数据分析，支持决策制定。',
        target: '[role="menuitem"]:nth-child(10)',
        position: 'right',
        action: 'next'
      },
      {
        id: 'help',
        title: '获取帮助',
        description: '每个页面都有帮助按钮。点击它可以获得该功能的详细说明。',
        target: null,
        position: 'center',
        action: 'next'
      },
      {
        id: 'complete',
        title: '开始使用',
        description: '现在您已经了解了系统的基本功能。开始探索吧！如需帮助，请点击任何页面的帮助按钮。',
        target: null,
        position: 'center',
        action: 'complete'
      }
    ];
  }

  /**
   * 开始引导
   */
  start() {
    // 检查是否是当前活跃的实例
    if (window.__onboardingGuideInstance !== this) {
      console.warn('[OnboardingGuide] start() - 这不是活跃实例，忽略调用');
      return;
    }
    
    console.log('[OnboardingGuide] start() 被调用，实例ID:', this._instanceId);
    this.defineSteps();
    this.currentStep = 0;
    this.isActive = true;
    this.showStep(0);
  }

  /**
   * 显示当前步骤
   */
  showStep(stepIndex) {
    // 检查是否是当前活跃的实例
    if (window.__onboardingGuideInstance !== this) {
      console.warn('[OnboardingGuide] 这不是活跃实例，忽略 showStep 调用');
      return;
    }
    
    // 防止重复调用
    if (this._isShowingStep) {
      console.log('[OnboardingGuide] showStep 正在执行中，忽略重复调用');
      return;
    }
    
    this._isShowingStep = true;
    
    console.log(`[OnboardingGuide] ===== showStep 开始 =====`);
    console.log(`[OnboardingGuide] showStep 被调用，stepIndex: ${stepIndex}`);
    console.log(`[OnboardingGuide] this.currentStep: ${this.currentStep}`);
    console.log(`[OnboardingGuide] this.isActive: ${this.isActive}`);
    console.log(`[OnboardingGuide] 实例ID: ${this._instanceId}`);
    
    if (stepIndex >= this.steps.length) {
      console.log('[OnboardingGuide] 已到达最后一步，调用 complete()');
      this._isShowingStep = false;
      this.complete();
      return;
    }

    const step = this.steps[stepIndex];
    this.currentStep = stepIndex;
    
    console.log(`[OnboardingGuide] 当前步骤: ${stepIndex + 1}/${this.steps.length}, 标题: ${step.title}`);

    // 移除所有旧的提示框（可能有多个）
    const allTooltips = document.querySelectorAll('.onboarding-tooltip');
    console.log(`[OnboardingGuide] 找到 ${allTooltips.length} 个旧提示框，准备移除`);
    allTooltips.forEach((tooltip, index) => {
      console.log(`[OnboardingGuide] 移除提示框 ${index + 1}`);
      tooltip.remove();
    });
    
    // 移除所有旧的覆盖层（可能有多个）
    const allOverlays = document.querySelectorAll('.onboarding-overlay');
    console.log(`[OnboardingGuide] 找到 ${allOverlays.length} 个旧覆盖层，准备移除`);
    allOverlays.forEach((overlay, index) => {
      console.log(`[OnboardingGuide] 移除覆盖层 ${index + 1}`);
      overlay.remove();
    });
    
    this.tooltip = null;
    this.overlay = null;
    
    // 等待一下，确保 DOM 更新完成
    console.log('[OnboardingGuide] 等待 DOM 更新...');
    setTimeout(() => {
      // 再次检查是否是活跃实例
      if (window.__onboardingGuideInstance !== this) {
        console.warn('[OnboardingGuide] 实例已被替换，取消创建元素');
        this._isShowingStep = false;
        return;
      }
      
      console.log('[OnboardingGuide] DOM 更新完成，开始创建新元素');
      
      // 先创建提示框（这样在覆盖层中可以检查 this.tooltip）
      console.log('[OnboardingGuide] 创建新提示框');
      this.createTooltip(step);
      
      // 再创建覆盖层
      console.log('[OnboardingGuide] 创建新覆盖层');
      this.createOverlay(step);
      
      console.log('[OnboardingGuide] ===== showStep 完成 =====');
      
      // 释放锁
      this._isShowingStep = false;
      
      // 验证提示框是否真的在 DOM 中
      setTimeout(() => {
        const checkTooltips = document.querySelectorAll('.onboarding-tooltip');
        console.log(`[OnboardingGuide] 验证：DOM 中现在有 ${checkTooltips.length} 个提示框`);
        if (checkTooltips.length > 0) {
          console.log(`[OnboardingGuide] 提示框内容:`, checkTooltips[0].innerText.substring(0, 50));
        }
        
        // 如果发现有多个提示框，只保留最后一个
        if (checkTooltips.length > 1) {
          console.warn(`[OnboardingGuide] 警告：发现 ${checkTooltips.length} 个提示框，移除多余的`);
          for (let i = 0; i < checkTooltips.length - 1; i++) {
            checkTooltips[i].remove();
          }
        }
      }, 100);
    }, 50);
  }

  /**
   * 创建覆盖层
   */
  createOverlay(step) {
    console.log('[OnboardingGuide] 创建覆盖层，target:', step.target);
    
    // 移除旧的覆盖层
    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      transition: all 0.3s ease;
    `;

    // 如果有目标元素，创建高亮区域
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      console.log(`[OnboardingGuide] 查找覆盖层目标元素: ${step.target}, 找到: ${!!targetElement}`);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const padding = 8;

        console.log(`[OnboardingGuide] 创建高亮框: top=${rect.top}, left=${rect.left}, width=${rect.width}, height=${rect.height}`);

        // 创建高亮框
        const highlight = document.createElement('div');
        highlight.style.cssText = `
          position: fixed;
          top: ${rect.top - padding}px;
          left: ${rect.left - padding}px;
          width: ${rect.width + padding * 2}px;
          height: ${rect.height + padding * 2}px;
          border: 2px solid #1890ff;
          border-radius: 4px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
          z-index: 9999;
          pointer-events: none;
          transition: all 0.3s ease;
        `;

        this.overlay.appendChild(highlight);
      } else {
        console.warn(`[OnboardingGuide] 警告：找不到覆盖层目标元素 "${step.target}"`);
      }
    } else {
      console.log('[OnboardingGuide] 无目标元素，使用全屏覆盖层');
    }

    // 点击覆盖层关闭引导（但不包括提示框）
    this.overlay.addEventListener('click', (e) => {
      // 检查点击是否在提示框内
      if (this.tooltip && this.tooltip.contains(e.target)) {
        return; // 不处理提示框内的点击
      }
      this.skip();
    });

    document.body.appendChild(this.overlay);
    console.log('[OnboardingGuide] 覆盖层已添加到 DOM');
  }

  /**
   * 创建提示框
   */
  createTooltip(step) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'onboarding-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;

    // 创建内容
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="margin-bottom: 12px;">
        <h3 style="margin: 0 0 8px 0; color: #1890ff; font-size: 16px; font-weight: 600;">
          ${step.title}
        </h3>
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
          ${step.description}
        </p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
        <div style="font-size: 12px; color: #999;">
          步骤 ${this.currentStep + 1} / ${this.steps.length}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="onboarding-btn-skip" style="
            padding: 6px 12px;
            border: 1px solid #d9d9d9;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #666;
            transition: all 0.2s;
          ">跳过</button>
          ${step.action === 'complete' 
            ? `<button class="onboarding-btn-complete" style="
              padding: 6px 12px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s;
            ">完成</button>`
            : `<button class="onboarding-btn-next" style="
              padding: 6px 12px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s;
            ">下一步</button>`
          }
        </div>
      </div>
    `;

    this.tooltip.appendChild(content);
    
    // 先添加到 DOM，然后绑定事件
    document.body.appendChild(this.tooltip);
    
    // 设置位置（在添加到 DOM 后）
    this.positionTooltip(step);

    // 绑定事件（在添加到 DOM 后）- 使用箭头函数确保 this 上下文正确
    const skipBtn = this.tooltip.querySelector('.onboarding-btn-skip');
    const nextBtn = this.tooltip.querySelector('.onboarding-btn-next');
    const completeBtn = this.tooltip.querySelector('.onboarding-btn-complete');

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[OnboardingGuide] 跳过按钮被点击');
        this.skip();
      });
      skipBtn.addEventListener('mouseover', () => {
        skipBtn.style.background = '#f5f5f5';
      });
      skipBtn.addEventListener('mouseout', () => {
        skipBtn.style.background = 'white';
      });
    }

    if (nextBtn) {
      // 保存 this 引用
      const self = this;
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('[OnboardingGuide] 下一步按钮被点击，当前步骤:', self.currentStep);
        console.log('[OnboardingGuide] this 上下文:', self);
        try {
          self.next();
          console.log('[OnboardingGuide] next() 方法执行完成');
        } catch (error) {
          console.error('[OnboardingGuide] next() 方法执行失败:', error);
        }
      });
      nextBtn.addEventListener('mouseover', () => {
        nextBtn.style.background = '#40a9ff';
      });
      nextBtn.addEventListener('mouseout', () => {
        nextBtn.style.background = '#1890ff';
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[OnboardingGuide] 完成按钮被点击');
        this.complete();
      });
      completeBtn.addEventListener('mouseover', () => {
        completeBtn.style.background = '#40a9ff';
      });
      completeBtn.addEventListener('mouseout', () => {
        completeBtn.style.background = '#1890ff';
      });
    }
    
    console.log(`[OnboardingGuide] 提示框创建完成，步骤 ${this.currentStep + 1}/${this.steps.length}`);
  }

  /**
   * 定位提示框
   */
  positionTooltip(step) {
    console.log(`[OnboardingGuide] 定位提示框，position: ${step.position}, target: ${step.target}`);
    
    if (step.position === 'center') {
      // 居中显示
      console.log('[OnboardingGuide] 使用居中定位');
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
    } else if (step.target) {
      const targetElement = document.querySelector(step.target);
      console.log(`[OnboardingGuide] 查找目标元素: ${step.target}, 找到: ${!!targetElement}`);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 200;
        const padding = 16;

        console.log(`[OnboardingGuide] 目标元素位置: top=${rect.top}, left=${rect.left}, width=${rect.width}, height=${rect.height}`);

        if (step.position === 'right') {
          this.tooltip.style.left = (rect.right + padding) + 'px';
          this.tooltip.style.top = (rect.top - tooltipHeight / 2 + rect.height / 2) + 'px';
          console.log(`[OnboardingGuide] 使用右侧定位: left=${rect.right + padding}px, top=${rect.top - tooltipHeight / 2 + rect.height / 2}px`);
        } else if (step.position === 'left') {
          this.tooltip.style.right = (window.innerWidth - rect.left + padding) + 'px';
          this.tooltip.style.top = (rect.top - tooltipHeight / 2 + rect.height / 2) + 'px';
          console.log(`[OnboardingGuide] 使用左侧定位`);
        } else if (step.position === 'bottom') {
          this.tooltip.style.left = (rect.left - tooltipWidth / 2 + rect.width / 2) + 'px';
          this.tooltip.style.top = (rect.bottom + padding) + 'px';
          console.log(`[OnboardingGuide] 使用底部定位`);
        }

        // 确保提示框不超出视口
        setTimeout(() => {
          const tooltipRect = this.tooltip.getBoundingClientRect();
          if (tooltipRect.right > window.innerWidth) {
            this.tooltip.style.left = (window.innerWidth - tooltipWidth - padding) + 'px';
            console.log('[OnboardingGuide] 调整位置：防止超出右边界');
          }
          if (tooltipRect.left < 0) {
            this.tooltip.style.left = padding + 'px';
            console.log('[OnboardingGuide] 调整位置：防止超出左边界');
          }
        }, 0);
      } else {
        // 找不到目标元素，回退到居中显示
        console.warn(`[OnboardingGuide] 警告：找不到目标元素 "${step.target}"，回退到居中显示`);
        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
      }
    }
  }

  /**
   * 下一步
   */
  next() {
    // 检查是否是当前活跃的实例
    if (window.__onboardingGuideInstance !== this) {
      console.warn('[OnboardingGuide] next() - 这不是活跃实例，忽略调用');
      return;
    }
    
    console.log('[OnboardingGuide] next() 被调用，当前步骤:', this.currentStep);
    console.log('[OnboardingGuide] 实例ID:', this._instanceId);
    console.log('[OnboardingGuide] 准备显示步骤:', this.currentStep + 1);
    this.showStep(this.currentStep + 1);
  }

  /**
   * 跳过引导
   */
  skip() {
    if (confirm('确定要跳过引导吗？')) {
      this.complete();
    }
  }

  /**
   * 完成引导
   */
  complete() {
    this.isActive = false;
    this.removeTooltip();
    this.removeOverlay();
    
    // 标记为已完成
    localStorage.setItem(this.storageKey, 'true');
    
    console.log('✅ 新手引导已完成');
  }

  /**
   * 重新开始引导
   */
  restart() {
    localStorage.removeItem(this.storageKey);
    this.start();
  }

  /**
   * 移除提示框
   */
  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  /**
   * 移除覆盖层
   */
  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    console.log('[OnboardingGuide] 销毁实例');
    this.removeTooltip();
    this.removeOverlay();
    this.isActive = false;
    
    // 清理全局实例引用
    if (window.__onboardingGuideInstance === this) {
      console.log('[OnboardingGuide] 清理全局实例引用');
      window.__onboardingGuideInstance = null;
    }
  }
}

export default OnboardingGuide;
