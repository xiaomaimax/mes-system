/**
 * VirtualScrollList - 虚拟滚动列表组件
 * 
 * 功能：
 * - 处理大量数据的渲染优化
 * - 只渲染可见区域的项目
 * - 支持动态高度和固定高度
 * - 提供滚动位置管理
 * 
 * Requirements: 10.2
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Spin } from 'antd';
import './VirtualScrollList.css';

/**
 * 虚拟滚动列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.items - 数据项列表
 * @param {Function} props.renderItem - 渲染单个项目的函数
 * @param {number} props.itemHeight - 单个项目的高度（像素）
 * @param {number} props.containerHeight - 容器高度（像素）
 * @param {number} props.overscan - 预渲染的项目数量（默认5）
 * @param {boolean} props.loading - 是否正在加载
 * @param {Function} props.onScroll - 滚动事件回调
 * @param {string} props.className - 自定义CSS类名
 */
const VirtualScrollList = ({
  items = [],
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  loading = false,
  onScroll,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 计算可见区域的项目索引范围
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 计算可见项目列表
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange]);

  // 计算总高度和偏移量
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(e, {
        scrollTop: newScrollTop,
        visibleRange,
        totalHeight
      });
    }
  }, [onScroll, visibleRange, totalHeight]);

  // 滚动到指定项目
  const scrollToItem = useCallback((index) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    scrollToItem(items.length - 1);
  }, [scrollToItem, items.length]);

  // 暴露滚动方法给父组件
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollToItem = scrollToItem;
      containerRef.current.scrollToTop = scrollToTop;
      containerRef.current.scrollToBottom = scrollToBottom;
    }
  }, [scrollToItem, scrollToTop, scrollToBottom]);

  if (loading) {
    return (
      <div 
        className={`virtual-scroll-container ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="virtual-scroll-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div 
        className={`virtual-scroll-container ${className}`}
        style={{ height: containerHeight }}
      >
        <div className="virtual-scroll-empty">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* 总高度占位符 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见项目容器 */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.originalIndex}
              style={{ height: itemHeight }}
              className="virtual-scroll-item"
            >
              {renderItem(item, item.originalIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollList;