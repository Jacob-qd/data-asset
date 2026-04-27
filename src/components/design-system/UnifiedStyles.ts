// ============================================
// 数据资产管理平台 - 统一设计系统
// Unified Design System for All Pages
// ============================================

// ----- 颜色系统 (Color System) -----
export const colors = {
  // 主题色 (Primary)
  primary: {
    50:  '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // 状态色 (Status)
  status: {
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    error:   { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    info:    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    neutral: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
    purple:  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  },
  // 灰度 (Grayscale)
  gray: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

// ----- 状态映射 (Status Mapping) -----
export const statusMap: Record<string, { label: string; className: string }> = {
  // 进行中类
  '进行中':    { label: '进行中',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100' },
  '运行中':    { label: '运行中',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100' },
  '预测中':    { label: '预测中',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100' },
  '执行中':    { label: '执行中',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100' },
  '连接中':    { label: '连接中',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100' },
  // 完成类
  '已完成':    { label: '已完成',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  '执行成功':  { label: '执行成功',  className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  '已保存':    { label: '已保存',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  '已连接':    { label: '已连接',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  '可下载':    { label: '可下载',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  '已通过':    { label: '已通过',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100' },
  // 待处理类
  '待执行':    { label: '待执行',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200' },
  '待审批':    { label: '待审批',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100' },
  '待发布':    { label: '待发布',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100' },
  '待认证':    { label: '待认证',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100' },
  // 停止/断开类
  '已停止':    { label: '已停止',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200' },
  '已断开':    { label: '已断开',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100' },
  '已拒绝':    { label: '已拒绝',    className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100' },
  '执行失败':  { label: '执行失败',  className: 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100' },
};

export const getStatusStyle = (status: string): string => {
  return statusMap[status]?.className || 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200';
};

// ----- 通用样式类 (Common CSS Classes) -----
export const styles = {
  // 页面容器
  pageContainer: 'p-6 space-y-6 max-w-[1440px] mx-auto',

  // 页面标题区
  pageHeader: {
    wrapper: 'flex items-center justify-between',
    title: 'text-2xl font-bold text-gray-900 tracking-tight',
    subtitle: 'text-sm text-gray-500 mt-1.5',
    actions: 'flex items-center gap-3',
  },

  // 统计卡片
  statCard: {
    wrapper: 'grid grid-cols-4 gap-4',
    card: 'bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200',
    header: 'pb-2 pt-5 px-5',
    title: 'text-sm font-medium text-gray-500',
    value: 'text-3xl font-bold tracking-tight',
    colorVariants: [
      'text-gray-900',      // 总数
      'text-blue-600',      // 进行中
      'text-emerald-600',   // 已完成
      'text-violet-600',    // 其他
    ],
  },

  // 搜索区域
  searchArea: {
    wrapper: 'flex gap-3 items-center flex-wrap',
    input: 'w-64 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200 rounded-lg text-sm',
    button: 'h-9 px-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg',
    select: 'w-40 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm',
  },

  // 表格
  table: {
    wrapper: 'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden',
    cardHeader: 'pb-3 pt-4 px-5 border-b border-gray-50',
    // 表头
    header: 'bg-gray-50/80 border-b border-gray-100',
    headerCell: 'text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4',
    // 表体
    body: 'divide-y divide-gray-50',
    row: 'hover:bg-indigo-50/30 transition-colors duration-150 group',
    cell: 'py-3.5 px-4 text-sm text-gray-700',
    cellMono: 'py-3.5 px-4 text-sm font-mono text-gray-500',
    cellMedium: 'py-3.5 px-4 text-sm font-medium text-gray-900',
    cellSmall: 'py-3.5 px-4 text-xs text-gray-500',
    // 操作列
    actions: 'flex items-center gap-1',
  },

  // 按钮
  button: {
    primary: 'h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200',
    secondary: 'h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200',
    ghost: 'h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200',
    ghostDanger: 'h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200',
    ghostSuccess: 'h-8 w-8 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200',
    iconSm: 'h-4 w-4',
  },

  // Dialog弹窗
  dialog: {
    content: 'sm:max-w-lg rounded-xl border-0 shadow-2xl',
    header: 'pb-4 pt-6 px-6 border-b border-gray-50',
    title: 'text-lg font-semibold text-gray-900',
    body: 'py-5 px-6 space-y-4',
    footer: 'flex justify-end gap-3 pb-6 px-6 pt-2',
  },

  // 面包屑
  breadcrumb: {
    link: 'text-sm text-gray-500 hover:text-indigo-600 transition-colors',
    active: 'text-sm font-medium text-gray-900',
    separator: 'h-4 w-4 text-gray-300',
  },

  // 输入框
  input: {
    base: 'h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-lg text-sm transition-all',
    label: 'block text-sm font-medium text-gray-700 mb-1.5',
  },
};
