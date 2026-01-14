/**
 * VirtualTable - 虚拟滚动表格组件
 * 
 * 功能：
 * - 支持大量数据的表格渲染
 * - 虚拟滚动优化性能
 * - 支持列配置和排序
 * - 支持行选择和操作
 * 
 * Requirements: 10.2
 */

import React, { useMemo, useCallback } from 'react';
import { Table, Checkbox } from 'antd';
import VirtualScrollList from './VirtualScrollList';
import './VirtualTable.css';

/**
 * 虚拟表格组件
 * @param {Object} props - 组件属性
 * @param {Array} props.dataSource - 数据源
 * @param {Array} props.columns - 列配置
 * @param {number} props.rowHeight - 行高度
 * @param {number} props.height - 表格高度
 * @param {boolean} props.loading - 加载状态
 * @param {Object} props.rowSelection - 行选择配置
 * @param {Function} props.onRow - 行事件处理
 * @param {string} props.rowKey - 行键字段名
 * @param {Object} props.pagination - 分页配置
 */
const VirtualTable = ({
  dataSource = [],
  columns = [],
  rowHeight = 54,
  height = 400,
  loading = false,
  rowSelection,
  onRow,
  rowKey = 'id',
  pagination,
  ...restProps
}) => {
  // 如果数据量较小，使用普通表格
  const useVirtualScroll = dataSource.length > 100;

  // 渲染表格行
  const renderRow = useCallback((record, index) => {
    const rowProps = onRow ? onRow(record, index) : {};
    const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
    
    return (
      <div
        key={key}
        className="virtual-table-row"
        {...rowProps}
      >
        {rowSelection && (
          <div className="virtual-table-cell virtual-table-selection">
            <Checkbox
              checked={rowSelection.selectedRowKeys?.includes(key)}
              onChange={(e) => {
                if (rowSelection.onChange) {
                  const selectedKeys = [...(rowSelection.selectedRowKeys || [])];
                  if (e.target.checked) {
                    selectedKeys.push(key);
                  } else {
                    const keyIndex = selectedKeys.indexOf(key);
                    if (keyIndex > -1) {
                      selectedKeys.splice(keyIndex, 1);
                    }
                  }
                  rowSelection.onChange(selectedKeys, selectedKeys.map(k => 
                    dataSource.find(item => 
                      (typeof rowKey === 'function' ? rowKey(item) : item[rowKey]) === k
                    )
                  ));
                }
              }}
            />
          </div>
        )}
        {columns.map((column, colIndex) => {
          const { dataIndex, key: colKey, render, width, align = 'left' } = column;
          const cellKey = colKey || dataIndex || colIndex;
          let cellValue = dataIndex ? record[dataIndex] : record;
          
          if (render) {
            cellValue = render(cellValue, record, index);
          }
          
          return (
            <div
              key={cellKey}
              className="virtual-table-cell"
              style={{ 
                width: width || 'auto',
                textAlign: align,
                flex: width ? 'none' : 1
              }}
            >
              {cellValue}
            </div>
          );
        })}
      </div>
    );
  }, [columns, rowSelection, onRow, rowKey, dataSource]);

  // 渲染表格头部
  const renderHeader = useMemo(() => (
    <div className="virtual-table-header">
      {rowSelection && (
        <div className="virtual-table-cell virtual-table-selection">
          <Checkbox
            indeterminate={
              rowSelection.selectedRowKeys?.length > 0 && 
              rowSelection.selectedRowKeys.length < dataSource.length
            }
            checked={
              rowSelection.selectedRowKeys?.length === dataSource.length &&
              dataSource.length > 0
            }
            onChange={(e) => {
              if (rowSelection.onChange) {
                if (e.target.checked) {
                  const allKeys = dataSource.map(item => 
                    typeof rowKey === 'function' ? rowKey(item) : item[rowKey]
                  );
                  rowSelection.onChange(allKeys, dataSource);
                } else {
                  rowSelection.onChange([], []);
                }
              }
            }}
          />
        </div>
      )}
      {columns.map((column, index) => {
        const { title, width, align = 'left', key: colKey, dataIndex } = column;
        const cellKey = colKey || dataIndex || index;
        
        return (
          <div
            key={cellKey}
            className="virtual-table-cell virtual-table-header-cell"
            style={{ 
              width: width || 'auto',
              textAlign: align,
              flex: width ? 'none' : 1
            }}
          >
            {title}
          </div>
        );
      })}
    </div>
  ), [columns, rowSelection, dataSource, rowKey]);

  // 如果不需要虚拟滚动，使用普通表格
  if (!useVirtualScroll) {
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        onRow={onRow}
        rowKey={rowKey}
        pagination={pagination}
        scroll={{ y: height }}
        {...restProps}
      />
    );
  }

  // 使用虚拟滚动表格
  return (
    <div className="virtual-table-container">
      {renderHeader}
      <VirtualScrollList
        items={dataSource}
        renderItem={renderRow}
        itemHeight={rowHeight}
        containerHeight={height - 54} // 减去表头高度
        loading={loading}
        className="virtual-table-body"
      />
      {pagination && (
        <div className="virtual-table-pagination">
          {/* 这里可以添加分页组件 */}
        </div>
      )}
    </div>
  );
};

export default VirtualTable;