/**
 * PropTypes工具库
 * 为所有组件提供统一的PropTypes定义
 */

import PropTypes from 'prop-types';

/**
 * 通用PropTypes定义
 */
export const commonPropTypes = {
  // 基本类型
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  
  // 数值
  count: PropTypes.number,
  quantity: PropTypes.number,
  price: PropTypes.number,
  percentage: PropTypes.number,
  
  // 布尔值
  isActive: PropTypes.bool,
  isLoading: PropTypes.bool,
  isVisible: PropTypes.bool,
  disabled: PropTypes.bool,
  
  // 日期
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  
  // 数组
  data: PropTypes.array,
  items: PropTypes.array,
  list: PropTypes.array,
  options: PropTypes.array,
  
  // 对象
  config: PropTypes.object,
  metadata: PropTypes.object,
  extra: PropTypes.object,
  
  // 函数
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onAdd: PropTypes.func,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  
  // React元素
  children: PropTypes.node,
  icon: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  
  // 样式
  style: PropTypes.object,
  className: PropTypes.string,
  
  // 其他
  placeholder: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any
};

/**
 * 数据模型PropTypes
 */
export const dataPropTypes = {
  // 用户
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    isActive: PropTypes.bool
  }),
  
  // 生产订单
  productionOrder: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    order_number: PropTypes.string,
    product_code: PropTypes.string,
    product_name: PropTypes.string,
    planned_quantity: PropTypes.number,
    status: PropTypes.string,
    created_at: PropTypes.string
  }),
  
  // 生产任务
  productionTask: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    task_number: PropTypes.string,
    order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    created_at: PropTypes.string
  }),
  
  // 设备
  equipment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    equipment_code: PropTypes.string,
    equipment_name: PropTypes.string,
    status: PropTypes.string,
    production_line_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  
  // 库存
  inventory: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    material_code: PropTypes.string,
    material_name: PropTypes.string,
    current_stock: PropTypes.number,
    min_stock: PropTypes.number,
    max_stock: PropTypes.number,
    unit: PropTypes.string
  }),
  
  // 质量检验
  inspection: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inspected_quantity: PropTypes.number,
    qualified_quantity: PropTypes.number,
    defective_quantity: PropTypes.number,
    quality_rate: PropTypes.number,
    status: PropTypes.string
  })
};

/**
 * 表格PropTypes
 */
export const tablePropTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string,
      dataIndex: PropTypes.string,
      render: PropTypes.func,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['left', 'center', 'right'])
    })
  ),
  
  dataSource: PropTypes.arrayOf(PropTypes.object),
  
  pagination: PropTypes.shape({
    current: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
    onChange: PropTypes.func
  }),
  
  loading: PropTypes.bool,
  
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  
  onRow: PropTypes.func,
  
  rowSelection: PropTypes.shape({
    selectedRowKeys: PropTypes.array,
    onChange: PropTypes.func
  })
};

/**
 * 表单PropTypes
 */
export const formPropTypes = {
  form: PropTypes.object,
  
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string,
      required: PropTypes.bool,
      placeholder: PropTypes.string,
      options: PropTypes.array
    })
  ),
  
  onSubmit: PropTypes.func,
  
  onCancel: PropTypes.func,
  
  loading: PropTypes.bool,
  
  initialValues: PropTypes.object
};

/**
 * 模态框PropTypes
 */
export const modalPropTypes = {
  visible: PropTypes.bool,
  
  title: PropTypes.string,
  
  onOk: PropTypes.func,
  
  onCancel: PropTypes.func,
  
  okText: PropTypes.string,
  
  cancelText: PropTypes.string,
  
  loading: PropTypes.bool,
  
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  
  centered: PropTypes.bool
};

/**
 * 标签页PropTypes
 */
export const tabsPropTypes = {
  activeKey: PropTypes.string,
  
  onChange: PropTypes.func,
  
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.node,
      children: PropTypes.node,
      disabled: PropTypes.bool
    })
  ),
  
  type: PropTypes.oneOf(['line', 'card', 'editable-card']),
  
  tabPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
};

/**
 * 按钮PropTypes
 */
export const buttonPropTypes = {
  type: PropTypes.oneOf(['primary', 'default', 'dashed', 'text', 'link']),
  
  size: PropTypes.oneOf(['large', 'middle', 'small']),
  
  danger: PropTypes.bool,
  
  disabled: PropTypes.bool,
  
  loading: PropTypes.bool,
  
  onClick: PropTypes.func,
  
  icon: PropTypes.node,
  
  children: PropTypes.node
};

/**
 * 消息PropTypes
 */
export const messagePropTypes = {
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  
  message: PropTypes.string,
  
  description: PropTypes.string,
  
  closable: PropTypes.bool,
  
  onClose: PropTypes.func
};

/**
 * 创建组件PropTypes的辅助函数
 */
export function createComponentPropTypes(customProps = {}) {
  return {
    ...commonPropTypes,
    ...customProps
  };
}

/**
 * 创建数据列表组件PropTypes的辅助函数
 */
export function createListComponentPropTypes(dataType = 'object') {
  return {
    data: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    error: PropTypes.string,
    onRefresh: PropTypes.func,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    ...tablePropTypes
  };
}

/**
 * 创建表单组件PropTypes的辅助函数
 */
export function createFormComponentPropTypes(customFields = {}) {
  return {
    ...formPropTypes,
    ...customFields
  };
}

export default {
  commonPropTypes,
  dataPropTypes,
  tablePropTypes,
  formPropTypes,
  modalPropTypes,
  tabsPropTypes,
  buttonPropTypes,
  messagePropTypes,
  createComponentPropTypes,
  createListComponentPropTypes,
  createFormComponentPropTypes
};
