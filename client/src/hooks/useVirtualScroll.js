/**
 * useVirtualScroll - 虚拟滚动状态管理Hook
 * 
 * 功能：
 * - 管理虚拟滚动的状态
 * - 提供滚动位置控制
 * - 处理大量数据的性能优化
 * 
 * Requirements: 10.2
 */

import { useState, useCallback, useMemo, useRef } from 'react';

/**
 * 虚拟滚动Hook
 * @param {Object} options - 配置选项
 * @param {Array} options.items - 数据项列表
 * @param {number} options.itemHeight - 单个项目高度
 * @param {number} options.containerHeight - 容器高度
 * @param {number} options.overscan - 预渲染项目数量
 * @returns {Object} 虚拟滚动状态和方法
 */
const useVirtualScroll = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
} = {}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 计算可见区域
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 计算可见项目
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange]);

  // 计算布局信息
  const layoutInfo = useMemo(() => ({
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.startIndex * itemHeight,
    visibleCount: visibleRange.endIndex - visibleRange.startIndex + 1
  }), [items.length, itemHeight, visibleRange]);

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // 滚动到指定项目
  const scrollToItem = useCallback((index) => {
    if (containerRef.current) {
      const targetScrollTop = Math.max(0, Math.min(
        index * itemHeight,
        layoutInfo.totalHeight - containerHeight
      ));
      containerRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight, layoutInfo.totalHeight, containerHeight]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    scrollToItem(items.length - 1);
  }, [scrollToItem, items.length]);

  // 获取当前可见的第一个项目索引
  const getFirstVisibleIndex = useCallback(() => {
    return Math.floor(scrollTop / itemHeight);
  }, [scrollTop, itemHeight]);

  // 获取当前可见的最后一个项目索引
  const getLastVisibleIndex = useCallback(() => {
    return Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );
  }, [scrollTop, containerHeight, itemHeight, items.length]);

  // 检查项目是否可见
  const isItemVisible = useCallback((index) => {
    const firstVisible = getFirstVisibleIndex();
    const lastVisible = getLastVisibleIndex();
    return index >= firstVisible && index <= lastVisible;
  }, [getFirstVisibleIndex, getLastVisibleIndex]);

  // 获取滚动进度（0-1）
  const getScrollProgress = useCallback(() => {
    const maxScrollTop = Math.max(0, layoutInfo.totalHeight - containerHeight);
    return maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
  }, [scrollTop, layoutInfo.totalHeight, containerHeight]);

  return {
    // 状态
    scrollTop,
    visibleRange,
    visibleItems,
    layoutInfo,
    containerRef,
    
    // 事件处理
    handleScroll,
    
    // 滚动控制
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    
    // 查询方法
    getFirstVisibleIndex,
    getLastVisibleIndex,
    isItemVisible,
    getScrollProgress,
    
    // 配置信息
    config: {
      itemHeight,
      containerHeight,
      overscan,
      totalItems: items.length
    }
  };
};

export default useVirtualScroll;