import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ReactNode } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Connection,
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as echarts from "echarts";
import {
  Play,
  Save,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Database,
  Table2,
  FunctionSquare,
  Columns3,
  Key,
  Pin,
  Search,
  X,
  PanelLeft,
  PanelRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
  Plus,
  LayoutTemplate,
  Check,
  Square,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Cpu,
  HardDrive,
  MemoryStick,
  Timer,
  Zap,
  FilePlus,
  FolderPlus,
  Upload,
  Download,
  History,
  GitCompare,
  Undo,
  BarChart3,
  LineChart,
  PieChart,
  MoreVertical,
  GripVertical,
  Copy,
  Type,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Loader2,
  StopCircle,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Sandbox {
  id: string;
  name: string;
  status: "running" | "stopped";
  type: "development" | "production";
  cpu: string;
  memory: string;
  storage: string;
  createdAt: string;
  expiresAt: string;
  owner: string;
}

interface TableCol {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
  isPk?: boolean;
  isIndex?: boolean;
}

interface DBTable {
  name: string;
  columnCount: number;
  columns: TableCol[];
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface LogEntry {
  time: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS" | "DEBUG";
  message: string;
}

interface ModelItem {
  id: string;
  name: string;
  type: "SQL模型" | "Python模型" | "配置模型";
  version: string;
  status: "已发布" | "草稿" | "已归档";
  description: string;
  createdAt: string;
  lastRunAt: string;
  runCount: number;
  metrics?: Record<string, string>;
}

interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  executionTime: number;
  rowCount: number;
}

interface ScriptTab {
  id: string;
  name: string;
  content: string;
  modified: boolean;
  language: "sql" | "python" | "markdown";
}

interface ExecutionRecord {
  id: string;
  sql: string;
  time: string;
  duration: number;
  rows: number;
  status: "success" | "error" | "cancelled";
}

interface ExecutionPlanNode {
  id: string;
  type: string;
  scanType: string;
  estimatedRows: number;
  cost: number;
  details: string;
}

interface VersionRecord {
  id: string;
  timestamp: string;
  author: string;
  summary: string;
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const SANDBOXES: Sandbox[] = [
  { id: "sb-1", name: "沙箱-企业工商分析", status: "running", type: "development", cpu: "4核", memory: "8GB", storage: "500GB", createdAt: "2026-04-10", expiresAt: "2026-05-10", owner: "张三" },
  { id: "sb-2", name: "沙箱-金融风控建模", status: "running", type: "production", cpu: "8核", memory: "16GB", storage: "1TB", createdAt: "2026-04-08", expiresAt: "2026-07-08", owner: "李四" },
  { id: "sb-3", name: "沙箱-用户画像分析", status: "stopped", type: "development", cpu: "2核", memory: "4GB", storage: "100GB", createdAt: "2026-04-05", expiresAt: "2026-04-12", owner: "王五" },
  { id: "sb-4", name: "沙箱-医疗数据分析", status: "running", type: "development", cpu: "4核", memory: "8GB", storage: "500GB", createdAt: "2026-04-12", expiresAt: "2026-05-12", owner: "赵六" },
  { id: "sb-5", name: "沙箱-供应链预测", status: "stopped", type: "production", cpu: "8核", memory: "16GB", storage: "1TB", createdAt: "2026-04-01", expiresAt: "2026-06-01", owner: "钱七" },
  { id: "sb-6", name: "沙箱-推荐系统", status: "running", type: "development", cpu: "4核", memory: "8GB", storage: "500GB", createdAt: "2026-04-14", expiresAt: "2026-05-14", owner: "孙八" },
  { id: "sb-7", name: "沙箱-销量预测", status: "running", type: "production", cpu: "8核", memory: "16GB", storage: "1TB", createdAt: "2026-04-15", expiresAt: "2026-07-15", owner: "周九" },
  { id: "sb-8", name: "沙箱-异常检测", status: "stopped", type: "development", cpu: "2核", memory: "4GB", storage: "100GB", createdAt: "2026-04-16", expiresAt: "2026-05-16", owner: "吴十" },
  { id: "sb-9", name: "沙箱-NLP分析", status: "running", type: "development", cpu: "4核", memory: "8GB", storage: "500GB", createdAt: "2026-04-17", expiresAt: "2026-05-17", owner: "郑十一" },
  { id: "sb-10", name: "沙箱-时间序列", status: "running", type: "production", cpu: "8核", memory: "16GB", storage: "1TB", createdAt: "2026-04-18", expiresAt: "2026-07-18", owner: "王十二" },
];

const INITIAL_FILE_TREE: FileNode[] = [
  {
    name: "models",
    type: "folder",
    children: [
      { name: "user_rfm_model.sql", type: "file" },
      { name: "order_analysis.sql", type: "file" },
      { name: "product_recommend.sql", type: "file" },
      { name: "credit_score_model.py", type: "file" },
      { name: "churn_prediction.py", type: "file" },
    ],
  },
  {
    name: "scripts",
    type: "folder",
    children: [
      { name: "data_clean.sql", type: "file" },
      { name: "etl_process.sql", type: "file" },
      { name: "daily_report.sql", type: "file" },
    ],
  },
  {
    name: "views",
    type: "folder",
    children: [
      { name: "user_summary_view.sql", type: "file" },
      { name: "order_summary_view.sql", type: "file" },
    ],
  },
  { name: "README.md", type: "file" },
  { name: "config.yaml", type: "file" },
];

const DB_TABLES: DBTable[] = [
  {
    name: "ods_user_info",
    columnCount: 128,
    columns: [
      { name: "id", type: "BIGINT", nullable: false, description: "主键ID", isPk: true },
      { name: "name", type: "VARCHAR(100)", nullable: true, description: "用户名" },
      { name: "phone", type: "VARCHAR(20)", nullable: true, description: "手机号", isIndex: true },
      { name: "email", type: "VARCHAR(100)", nullable: true, description: "邮箱" },
      { name: "age", type: "INT", nullable: true, description: "年龄" },
      { name: "gender", type: "TINYINT", nullable: true, description: "性别" },
      { name: "created_at", type: "DATETIME", nullable: false, description: "创建时间" },
    ],
  },
  {
    name: "dwd_order_detail",
    columnCount: 56,
    columns: [
      { name: "order_id", type: "BIGINT", nullable: false, description: "订单ID", isPk: true },
      { name: "user_id", type: "BIGINT", nullable: false, description: "用户ID", isIndex: true },
      { name: "amount", type: "DECIMAL(18,2)", nullable: false, description: "订单金额" },
      { name: "order_date", type: "DATE", nullable: false, description: "订单日期" },
      { name: "status", type: "TINYINT", nullable: false, description: "订单状态" },
      { name: "product_id", type: "BIGINT", nullable: false, description: "商品ID" },
    ],
  },
  {
    name: "ads_user_portrait",
    columnCount: 32,
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, description: "用户ID", isPk: true },
      { name: "rfm_segment", type: "VARCHAR(50)", nullable: true, description: "RFM分层" },
      { name: "lifetime_value", type: "DECIMAL(18,2)", nullable: true, description: "生命周期价值" },
      { name: "preference_tags", type: "JSON", nullable: true, description: "偏好标签" },
    ],
  },
  {
    name: "dim_product_info",
    columnCount: 24,
    columns: [
      { name: "product_id", type: "BIGINT", nullable: false, description: "商品ID", isPk: true },
      { name: "product_name", type: "VARCHAR(200)", nullable: false, description: "商品名称" },
      { name: "category", type: "VARCHAR(100)", nullable: false, description: "品类" },
      { name: "price", type: "DECIMAL(18,2)", nullable: false, description: "价格" },
    ],
  },
  {
    name: "ods_log_event",
    columnCount: 18,
    columns: [
      { name: "event_id", type: "BIGINT", nullable: false, description: "事件ID", isPk: true },
      { name: "user_id", type: "BIGINT", nullable: false, description: "用户ID", isIndex: true },
      { name: "event_type", type: "VARCHAR(50)", nullable: false, description: "事件类型" },
      { name: "event_time", type: "DATETIME", nullable: false, description: "事件时间" },
    ],
  },
  {
    name: "dws_user_summary",
    columnCount: 45,
    columns: [
      { name: "user_id", type: "BIGINT", nullable: false, description: "用户ID", isPk: true },
      { name: "total_orders", type: "INT", nullable: false, description: "总订单数" },
      { name: "total_amount", type: "DECIMAL(18,2)", nullable: false, description: "总金额" },
      { name: "avg_order_value", type: "DECIMAL(18,2)", nullable: false, description: "平均订单金额" },
      { name: "last_order_date", type: "DATE", nullable: true, description: "最后订单日期" },
      { name: "register_days", type: "INT", nullable: false, description: "注册天数" },
    ],
  },
  {
    name: "ads_sales_daily",
    columnCount: 28,
    columns: [
      { name: "stat_date", type: "DATE", nullable: false, description: "统计日期", isPk: true },
      { name: "gmv", type: "DECIMAL(18,2)", nullable: false, description: "GMV" },
      { name: "order_count", type: "INT", nullable: false, description: "订单数" },
      { name: "buyer_count", type: "INT", nullable: false, description: "买家数" },
      { name: "new_buyer_count", type: "INT", nullable: false, description: "新买家数" },
    ],
  },
  {
    name: "dim_region_info",
    columnCount: 12,
    columns: [
      { name: "region_id", type: "INT", nullable: false, description: "地区ID", isPk: true },
      { name: "region_name", type: "VARCHAR(100)", nullable: false, description: "地区名称" },
      { name: "parent_id", type: "INT", nullable: true, description: "父级ID" },
      { name: "region_level", type: "TINYINT", nullable: false, description: "地区级别" },
    ],
  },
  {
    name: "dwd_payment_detail",
    columnCount: 22,
    columns: [
      { name: "payment_id", type: "BIGINT", nullable: false, description: "支付ID", isPk: true },
      { name: "order_id", type: "BIGINT", nullable: false, description: "订单ID", isIndex: true },
      { name: "payment_amount", type: "DECIMAL(18,2)", nullable: false, description: "支付金额" },
      { name: "payment_method", type: "VARCHAR(50)", nullable: false, description: "支付方式" },
      { name: "payment_status", type: "TINYINT", nullable: false, description: "支付状态" },
      { name: "payment_time", type: "DATETIME", nullable: true, description: "支付时间" },
    ],
  },
  {
    name: "ods_inventory",
    columnCount: 36,
    columns: [
      { name: "sku_id", type: "BIGINT", nullable: false, description: "SKU ID", isPk: true },
      { name: "warehouse_id", type: "INT", nullable: false, description: "仓库ID" },
      { name: "quantity", type: "INT", nullable: false, description: "库存数量" },
      { name: "available_qty", type: "INT", nullable: false, description: "可用数量" },
      { name: "reserved_qty", type: "INT", nullable: false, description: "预留数量" },
      { name: "last_update_time", type: "DATETIME", nullable: false, description: "最后更新时间" },
    ],
  },
];

const SYSTEM_FUNCTIONS = [
  { name: "AVG", sig: "AVG(x)", desc: "平均值" },
  { name: "COUNT", sig: "COUNT(*)", desc: "计数" },
  { name: "MAX", sig: "MAX(x)", desc: "最大值" },
  { name: "MIN", sig: "MIN(x)", desc: "最小值" },
  { name: "SUM", sig: "SUM(x)", desc: "求和" },
  { name: "STD", sig: "STD(x)", desc: "标准差" },
  { name: "VARIANCE", sig: "VARIANCE(x)", desc: "方差" },
  { name: "DATEDIFF", sig: "DATEDIFF(a,b)", desc: "日期差" },
  { name: "DATE_SUB", sig: "DATE_SUB(d,n)", desc: "日期减" },
  { name: "CURRENT_DATE", sig: "CURRENT_DATE", desc: "当前日期" },
  { name: "CASE", sig: "CASE WHEN ... END", desc: "条件判断" },
  { name: "COALESCE", sig: "COALESCE(a,b,...)", desc: "首个非空值" },
];

const CUSTOM_FUNCTIONS = [
  { name: "rfm_score", sig: "rfm_score(r,f,m)", desc: "计算RFM综合评分" },
  { name: "user_segment", sig: "user_segment(score)", desc: "用户分层计算" },
  { name: "credit_rating", sig: "credit_rating(x)", desc: "信用评级函数" },
  { name: "churn_probability", sig: "churn_probability(user_id)", desc: "流失概率预测" },
  { name: "ltv_predict", sig: "ltv_predict(user_id,months)", desc: "客户生命周期价值预测" },
  { name: "anomaly_score", sig: "anomaly_score(record)", desc: "异常分数计算" },
  { name: "fraud_detect", sig: "fraud_detect(transaction)", desc: "欺诈检测评分" },
  { name: "sentiment_analysis", sig: "sentiment_analysis(text)", desc: "情感分析" },
];

const INITIAL_LOGS: LogEntry[] = [
  { time: "14:32:18", level: "INFO", message: "开始执行 SQL 查询..." },
  { time: "14:32:18", level: "INFO", message: "解析 CTE: user_rfm" },
  { time: "14:32:19", level: "INFO", message: "扫描表 dwd_order_detail，匹配分区 365 个" },
  { time: "14:32:19", level: "DEBUG", message: "分区裁剪后实际扫描: 124 个分区" },
  { time: "14:32:20", level: "INFO", message: "聚合计算完成，生成 125,678 行中间结果" },
  { time: "14:32:20", level: "WARN", message: "检测到 NULL 值: 1,234 行 monetary 字段为 NULL，已使用 COALESCE 处理" },
  { time: "14:32:21", level: "INFO", message: "CASE 表达式计算完成" },
  { time: "14:32:21", level: "INFO", message: "ORDER BY + LIMIT 应用完成" },
  { time: "14:32:21", level: "SUCCESS", message: "查询执行完成，耗时 2.89s，返回 1000 行" },
  { time: "14:32:22", level: "DEBUG", message: "内存峰值: 2.4GB" },
];

const MODELS: ModelItem[] = [
  { id: "m1", name: "user_rfm_model", type: "SQL模型", version: "v2.1.0", status: "已发布", description: "用户RFM分层模型，基于订单数据计算最近一次消费、消费频率、消费金额", createdAt: "2026-03-15", lastRunAt: "2026-04-15 14:32", runCount: 156, metrics: { accuracy: "94.2%", coverage: "98.5%", avgExecTime: "2.89s" } },
  { id: "m2", name: "credit_score_v3", type: "Python模型", version: "v3.0.1", status: "已发布", description: "信用评分模型V3，集成XGBoost和LightGBM双模型融合", createdAt: "2026-03-20", lastRunAt: "2026-04-14 09:15", runCount: 89, metrics: { auc: "0.923", ks: "0.456", psi: "0.032" } },
  { id: "m3", name: "churn_predictor", type: "Python模型", version: "v1.2.0", status: "草稿", description: "用户流失预测模型，基于用户行为特征", createdAt: "2026-04-01", lastRunAt: "2026-04-10 16:45", runCount: 23, metrics: { accuracy: "87.5%", recall: "82.1%", f1: "84.7%" } },
  { id: "m4", name: "product_recommend", type: "配置模型", version: "v1.0.0", status: "已发布", description: "商品推荐规则配置，基于协同过滤结果", createdAt: "2026-02-10", lastRunAt: "2026-04-15 08:00", runCount: 312, metrics: { precision: "12.5%", recall: "8.3%", coverage: "95.2%" } },
  { id: "m5", name: "data_quality_check", type: "SQL模型", version: "v1.1.0", status: "已归档", description: "数据质量检查规则集", createdAt: "2026-01-05", lastRunAt: "2026-03-20 11:00", runCount: 500, metrics: { passRate: "96.8%", ruleCount: "42" } },
  { id: "m6", name: "sales_forecast", type: "Python模型", version: "v2.0.0", status: "已发布", description: "销量预测模型，基于时间序列分析", createdAt: "2026-02-20", lastRunAt: "2026-04-15 10:00", runCount: 120, metrics: { mape: "8.3%", rmse: "1250", coverage: "99.1%" } },
  { id: "m7", name: "anomaly_detector", type: "Python模型", version: "v1.5.0", status: "草稿", description: "异常检测模型，基于孤立森林算法", createdAt: "2026-03-25", lastRunAt: "2026-04-12 14:30", runCount: 45, metrics: { precision: "91.2%", recall: "88.7%", f1: "89.9%" } },
  { id: "m8", name: "inventory_optimization", type: "配置模型", version: "v1.2.0", status: "已发布", description: "库存优化配置规则", createdAt: "2026-01-15", lastRunAt: "2026-04-14 16:00", runCount: 230, metrics: { turnoverRate: "12.5", stockoutRate: "2.1%", excessRate: "5.3%" } },
  { id: "m9", name: "nlp_sentiment", type: "Python模型", version: "v1.0.0", status: "草稿", description: "NLP情感分析模型，基于BERT", createdAt: "2026-04-05", lastRunAt: "2026-04-15 09:00", runCount: 18, metrics: { accuracy: "93.1%", f1: "92.8%", latency: "45ms" } },
  { id: "m10", name: "customer_segmentation", type: "SQL模型", version: "v3.0.0", status: "已发布", description: "客户分群模型，基于K-Means聚类", createdAt: "2026-02-01", lastRunAt: "2026-04-15 11:30", runCount: 180, metrics: { silhouette: "0.68", coverage: "97.2%", stability: "0.91" } },
];

const SAMPLE_SQL = `-- 用户RFM模型计算\nWITH user_rfm AS (\n  SELECT\n    user_id,\n    DATEDIFF(CURRENT_DATE, MAX(order_date)) AS recency,\n    COUNT(DISTINCT order_id) AS frequency,\n    SUM(amount) AS monetary\n  FROM dwd_order_detail\n  WHERE order_date >= DATE_SUB(CURRENT_DATE, 365)\n  GROUP BY user_id\n)\nSELECT\n  user_id,\n  recency,\n  frequency,\n  monetary,\n  CASE\n    WHEN recency <= 30 AND frequency >= 10 THEN '高价值客户'\n    WHEN recency <= 90 AND frequency >= 5 THEN '潜力客户'\n    WHEN recency <= 180 THEN '一般客户'\n    ELSE '流失客户'\n  END AS user_segment\nFROM user_rfm\nORDER BY monetary DESC\nLIMIT 1000;`;

const QUERY_RESULT: QueryResult = {
  columns: ["user_id", "recency", "frequency", "monetary", "user_segment"],
  rows: [
    [10001, 5, 45, 128500.0, "高价值客户"],
    [10002, 12, 32, 95600.5, "高价值客户"],
    [10003, 2, 67, 89300.0, "高价值客户"],
    [10004, 28, 18, 72300.75, "潜力客户"],
    [10005, 8, 22, 68900.0, "高价值客户"],
    [10006, 45, 12, 51200.25, "潜力客户"],
    [10007, 60, 8, 42300.0, "一般客户"],
    [10008, 150, 3, 18900.5, "一般客户"],
    [10009, 200, 1, 5200.0, "流失客户"],
    [10010, 300, 2, 3100.75, "流失客户"],
  ],
  executionTime: 2.89,
  rowCount: 1000,
};

const MOCK_EXECUTION_HISTORY: ExecutionRecord[] = [
  { id: "1", sql: "SELECT * FROM dwd_order_detail LIMIT 100", time: "2026-04-18 14:30", duration: 1.23, rows: 100, status: "success" },
  { id: "2", sql: "SELECT user_id, SUM(amount) FROM dwd_order_detail GROUP BY user_id", time: "2026-04-18 14:25", duration: 3.45, rows: 5000, status: "success" },
  { id: "3", sql: "SELECT * FROM ads_user_portrait WHERE rfm_segment = '高价值客户'", time: "2026-04-18 14:20", duration: 0.89, rows: 1200, status: "success" },
  { id: "4", sql: "UPDATE dim_product_info SET price = price * 1.1", time: "2026-04-18 14:15", duration: 0, rows: 0, status: "error" },
  { id: "5", sql: "SELECT COUNT(*) FROM ods_log_event WHERE event_time > '2026-04-01'", time: "2026-04-18 14:10", duration: 5.67, rows: 1, status: "success" },
];

const MOCK_EXECUTION_PLAN: ExecutionPlanNode[] = [
  { id: "1", type: "Sort", scanType: "QuickSort", estimatedRows: 1000, cost: 1200, details: "ORDER BY monetary DESC" },
  { id: "2", type: "Limit", scanType: "Limit", estimatedRows: 1000, cost: 50, details: "LIMIT 1000" },
  { id: "3", type: "Project", scanType: "Projection", estimatedRows: 125678, cost: 5000, details: "CASE expression, column selection" },
  { id: "4", type: "Aggregate", scanType: "HashAggregate", estimatedRows: 125678, cost: 15000, details: "GROUP BY user_id, COUNT, SUM" },
  { id: "5", type: "Filter", scanType: "PartitionPruning", estimatedRows: 5000000, cost: 3000, details: "order_date >= DATE_SUB(CURRENT_DATE, 365)" },
  { id: "6", type: "Scan", scanType: "TableScan", estimatedRows: 5000000, cost: 25000, details: "dwd_order_detail (365 partitions, 124 matched)" },
];

const MOCK_VERSIONS: VersionRecord[] = [
  { id: "v1", timestamp: "2026-04-18 10:00", author: "张三", summary: "初始版本", content: "SELECT * FROM dwd_order_detail LIMIT 100;" },
  { id: "v2", timestamp: "2026-04-18 12:00", author: "李四", summary: "添加RFM计算逻辑", content: "SELECT user_id, SUM(amount) FROM dwd_order_detail GROUP BY user_id;" },
  { id: "v3", timestamp: "2026-04-18 14:00", author: "张三", summary: "优化查询性能", content: SAMPLE_SQL },
];

/* ------------------------------------------------------------------ */
/*  SQL Syntax Highlighter                                             */
/* ------------------------------------------------------------------ */
const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "INSERT", "UPDATE", "DELETE",
  "CREATE", "DROP", "ALTER", "TABLE", "INDEX", "VIEW", "WITH", "AS", "JOIN",
  "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING",
  "LIMIT", "OFFSET", "UNION", "ALL", "DISTINCT", "COUNT", "SUM", "AVG", "MAX",
  "MIN", "CASE", "WHEN", "THEN", "ELSE", "END", "IS", "NULL", "IN", "EXISTS",
  "BETWEEN", "LIKE", "ASC", "DESC", "CTE", "RECURSIVE", "WINDOW", "OVER",
  "PARTITION", "ROWS", "RANGE", "CURRENT_DATE", "DATEDIFF", "DATE_SUB",
  "COALESCE", "CAST", "CONVERT",
];

const SQL_FUNCTIONS = [
  "COUNT", "SUM", "AVG", "MAX", "MIN", "STD", "VARIANCE", "DATEDIFF",
  "DATE_SUB", "CURRENT_DATE", "COALESCE", "CAST", "CONVERT", "CONCAT",
  "SUBSTRING", "TRIM", "UPPER", "LOWER", "ROUND", "FLOOR", "CEIL",
];

function highlightSQL(sql: string): ReactNode[] {
  const lines = sql.split("\n");
  return lines.map((line, lineIdx) => {
    const tokens: { text: string; type: string }[] = [];
    let remaining = line;
    while (remaining.length > 0) {
      if (remaining.startsWith("--")) {
        tokens.push({ text: remaining, type: "comment" });
        break;
      }
      const strMatch = remaining.match(/^(('(?:''|[^'])*'))/);
      if (strMatch) {
        tokens.push({ text: strMatch[1], type: "string" });
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }
      const numMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numMatch) {
        tokens.push({ text: numMatch[1], type: "number" });
        remaining = remaining.slice(numMatch[1].length);
        continue;
      }
      const wordMatch = remaining.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      if (wordMatch) {
        const word = wordMatch[1];
        const upper = word.toUpperCase();
        if (SQL_KEYWORDS.includes(upper)) {
          tokens.push({ text: word, type: "keyword" });
        } else if (SQL_FUNCTIONS.includes(upper)) {
          tokens.push({ text: word, type: "function" });
        } else {
          tokens.push({ text: word, type: "identifier" });
        }
        remaining = remaining.slice(word.length);
        continue;
      }
      tokens.push({ text: remaining[0], type: "plain" });
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} className="flex">
        {tokens.map((t, i) => {
          let colorClass = "text-slate-500 dark:text-[#CBD5E1]";
          if (t.type === "keyword") colorClass = "text-[#C084FC] font-bold";
          else if (t.type === "function") colorClass = "text-[#60A5FA]";
          else if (t.type === "string") colorClass = "text-[#4ADE80]";
          else if (t.type === "number") colorClass = "text-[#F472B6]";
          else if (t.type === "comment") colorClass = "text-slate-500 dark:text-[#64748B] italic";
          else if (t.type === "identifier") colorClass = "text-[#A5B4FC]";
          return (
            <span key={i} className={colorClass}>
              {t.text}
            </span>
          );
        })}
      </div>
    );
  });
}

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                   */
/* ------------------------------------------------------------------ */
function genId(): string {
  return Date.now().toString(36).toUpperCase();
}

function getFileIcon(filename: string) {
  if (filename.endsWith(".sql")) return <FileCode className="w-3.5 h-3.5 text-[#60A5FA]" />;
  if (filename.endsWith(".py")) return <FileCode className="w-3.5 h-3.5 text-[#F59E0B]" />;
  if (filename.endsWith(".md")) return <FileText className="w-3.5 h-3.5 text-[#A5B4FC]" />;
  if (filename.endsWith(".csv")) return <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />;
  if (filename.endsWith(".json")) return <FileJson className="w-3.5 h-3.5 text-[#F472B6]" />;
  return <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function detectCycles(nodes: Node[], edges: Edge[]): string[] | null {
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);
    for (const neighbor of adj[nodeId]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        path.push(neighbor);
        return true;
      }
    }
    path.pop();
    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        const cycleStart = path.findIndex((id) => id === path[path.length - 1]);
        return path.slice(cycleStart);
      }
    }
  }
  return null;
}

function findOrphanNodes(nodes: Node[], edges: Edge[]): string[] {
  const hasIncoming = new Set<string>();
  const hasOutgoing = new Set<string>();
  edges.forEach((e) => {
    hasIncoming.add(e.target);
    hasOutgoing.add(e.source);
  });
  return nodes
    .filter((n) => {
      const type = n.type || "process";
      if (type === "source") return hasOutgoing.has(n.id) === false;
      if (type === "target") return hasIncoming.has(n.id) === false;
      return !hasIncoming.has(n.id) && !hasOutgoing.has(n.id);
    })
    .map((n) => n.id);
}

/* ------------------------------------------------------------------ */
/*  DAG Custom Nodes                                                   */
/* ------------------------------------------------------------------ */
function SourceNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-md border-2 border-[#10B981] bg-[#064E3B] text-white text-xs font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Left} className="!bg-[#10B981]" />
      {data.label as string}
      <Handle type="source" position={Position.Right} className="!bg-[#10B981]" />
    </div>
  );
}

function ProcessNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-md border-2 border-[#6366F1] bg-[#312E81] text-white text-xs font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Left} className="!bg-[#6366F1]" />
      {data.label as string}
      <Handle type="source" position={Position.Right} className="!bg-[#6366F1]" />
    </div>
  );
}

function TargetNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-md border-2 border-[#F59E0B] bg-[#78350F] text-white text-xs font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Left} className="!bg-[#F59E0B]" />
      {data.label as string}
      <Handle type="source" position={Position.Right} className="!bg-[#F59E0B]" />
    </div>
  );
}

function CTENode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-md border-2 border-[#8B5CF6] bg-[#4C1D95] text-white text-xs font-medium min-w-[100px] text-center">
      <Handle type="target" position={Position.Left} className="!bg-[#8B5CF6]" />
      {data.label as string}
      <Handle type="source" position={Position.Right} className="!bg-[#8B5CF6]" />
    </div>
  );
}

const dagNodeTypes = {
  source: SourceNode,
  process: ProcessNode,
  target: TargetNode,
  cte: CTENode,
};

const initialDAGNodes: Node[] = [
  { id: "n1", type: "source", position: { x: 50, y: 80 }, data: { label: "ods_orders" } },
  { id: "n2", type: "source", position: { x: 50, y: 180 }, data: { label: "ods_user_info" } },
  { id: "n3", type: "process", position: { x: 250, y: 130 }, data: { label: "dwd_order_detail" } },
  { id: "n4", type: "cte", position: { x: 450, y: 100 }, data: { label: "user_rfm (CTE)" } },
  { id: "n5", type: "target", position: { x: 650, y: 130 }, data: { label: "ads_user_portrait" } },
];

const initialDAGEdges: Edge[] = [
  { id: "e1", source: "n1", target: "n3", animated: true, style: { stroke: "#6366F1" } },
  { id: "e2", source: "n2", target: "n3", animated: true, style: { stroke: "#6366F1" } },
  { id: "e3", source: "n3", target: "n4", animated: true, style: { stroke: "#8B5CF6" } },
  { id: "e4", source: "n4", target: "n5", animated: true, style: { stroke: "#F59E0B" } },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** File Tree recursive renderer with context menu */
function FileTreeNode({
  node,
  depth = 0,
  onContextMenu,
}: {
  node: FileNode;
  depth?: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode, path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

  return (
    <div>
      <button
        className="flex items-center gap-1 w-full px-2 py-1 text-xs text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded transition-colors text-left"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren ? setExpanded(!expanded) : undefined}
        onContextMenu={(e) => onContextMenu(e, node, node.name)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="w-3 h-3 text-slate-500 dark:text-[#64748B]" /> : <ChevronRight className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />
        ) : (
          <span className="w-3" />
        )}
        {node.type === "folder" ? (
          expanded ? <FolderOpen className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Folder className="w-3.5 h-3.5 text-[#F59E0B]" />
        ) : (
          getFileIcon(node.name)
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && expanded && (
        <div className="transition-all duration-200">
          {node.children!.map((child) => (
            <FileTreeNode key={child.name} node={child} depth={depth + 1} onContextMenu={onContextMenu} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Editable Code Editor with syntax highlighting overlay */
function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlighted = language === "sql" ? highlightSQL(value) : <div className="text-slate-500 dark:text-[#CBD5E1]">{value}</div>;

  return (
    <div className="relative flex-1 overflow-hidden font-mono text-sm leading-6">
      <pre
        ref={preRef}
        className="absolute inset-0 m-0 p-4 overflow-auto pointer-events-none"
        aria-hidden="true"
      >
        {highlighted}
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none focus:outline-none font-mono text-sm leading-6"
        style={{ tabSize: 2 }}
      />
    </div>
  );
}

/** Diff viewer */
function DiffViewer({ oldText, newText }: { oldText: string; newText: string }) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="font-mono text-xs space-y-0">
      {Array.from({ length: maxLines }).map((_, i) => {
        const oldLine = oldLines[i] || "";
        const newLine = newLines[i] || "";
        const isChanged = oldLine !== newLine;
        const isAdded = !oldLine && newLine;
        const isRemoved = oldLine && !newLine;

        return (
          <div key={i} className={`flex ${isChanged ? "bg-yellow-500/10" : ""}`}>
            <span className="w-8 text-right text-slate-500 dark:text-[#64748B] shrink-0 select-none">{i + 1}</span>
            <span className={`w-6 text-center shrink-0 select-none ${isRemoved ? "text-red-500 bg-red-500/10" : isAdded ? "text-green-500 bg-green-500/10" : ""}`}>
              {isRemoved ? "-" : isAdded ? "+" : " "}
            </span>
            <span className={`flex-1 ${isRemoved ? "text-red-400" : isAdded ? "text-green-400" : "text-slate-500 dark:text-[#CBD5E1]"}`}>
              {isChanged && !isAdded && !isRemoved ? (
                <>
                  <span className="text-red-400 line-through">{oldLine}</span>
                  <span className="text-slate-500 dark:text-[#64748B] mx-1">→</span>
                  <span className="text-green-400">{newLine}</span>
                </>
              ) : (
                newLine || oldLine
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function DataSandbox() {
  /* ---- Existing state ---- */
  const [activeSandbox, setActiveSandbox] = useState(SANDBOXES[0]);
  const [leftTab, setLeftTab] = useState<"files" | "tables" | "functions">("files");
  const [centerTab, setCenterTab] = useState<"sql" | "dag">("sql");
  const [rightTab, setRightTab] = useState<"results" | "logs" | "models">("results");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showNewSandboxModal, setShowNewSandboxModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState("");
  const [newSandboxType, setNewSandboxType] = useState<"development" | "production">("development");
  const [newSandboxCpu, setNewSandboxCpu] = useState("4核");
  const [newSandboxMemory, setNewSandboxMemory] = useState("8GB");
  const [newSandboxStorage, setNewSandboxStorage] = useState("500GB");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dagNodes, setDagNodes, onDAGNodesChange] = useNodesState(initialDAGNodes);
  const [dagEdges, setDagEdges, onDAGEdgesChange] = useEdgesState(initialDAGEdges);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [sandboxSearch, setSandboxSearch] = useState("");
  const [cursorLine, setCursorLine] = useState(18);
  const [cursorCol, setCursorCol] = useState(7);

  /* ---- New state: Editable Code Editor with Tabs ---- */
  const [tabs, setTabs] = useState<ScriptTab[]>([
    { id: "tab-1", name: "user_rfm_model.sql", content: SAMPLE_SQL, modified: false, language: "sql" },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, modified: true } : t))
    );
    setAutoSaveStatus("unsaved");
  }, []);

  useEffect(() => {
    if (autoSaveStatus === "unsaved") {
      const timer = setTimeout(() => {
        setAutoSaveStatus("saving");
        setTimeout(() => {
          setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, modified: false } : t)));
          setAutoSaveStatus("saved");
        }, 800);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus, activeTabId]);

  const addNewTab = useCallback(() => {
    const id = `tab-${genId()}`;
    const newTab: ScriptTab = {
      id,
      name: `未命名脚本${tabs.length + 1}.sql`,
      content: "",
      modified: false,
      language: "sql",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  }, [tabs.length]);

  const closeTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.modified) {
        if (!window.confirm(`"${tab.name}" 有未保存的更改，确定要关闭吗？`)) return;
      }
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
    },
    [tabs, activeTabId]
  );

  /* ---- New state: Query Execution ---- */
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [lastExecutionTime, setLastExecutionTime] = useState<number | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>(MOCK_EXECUTION_HISTORY);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [showExecutionPlan, setShowExecutionPlan] = useState(false);
  const executionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const executeQuery = useCallback(() => {
    setIsExecuting(true);
    setExecutionProgress(0);
    setLastExecutionTime(null);

    let progress = 0;
    executionTimerRef.current = setInterval(() => {
      progress += 10;
      setExecutionProgress(progress);
      if (progress >= 100) {
        if (executionTimerRef.current) clearInterval(executionTimerRef.current);
        setIsExecuting(false);
        const duration = +(Math.random() * 5 + 0.5).toFixed(2);
        setLastExecutionTime(duration);
        const newRecord: ExecutionRecord = {
          id: genId(),
          sql: activeTab.content.slice(0, 50) + "...",
          time: new Date().toLocaleString("zh-CN"),
          duration,
          rows: Math.floor(Math.random() * 10000),
          status: "success",
        };
        setExecutionHistory((prev) => [newRecord, ...prev].slice(0, 20));
      }
    }, 200);
  }, [activeTab]);

  const cancelExecution = useCallback(() => {
    if (executionTimerRef.current) clearInterval(executionTimerRef.current);
    setIsExecuting(false);
    setExecutionProgress(0);
    const newRecord: ExecutionRecord = {
      id: genId(),
      sql: activeTab.content.slice(0, 50) + "...",
      time: new Date().toLocaleString("zh-CN"),
      duration: 0,
      rows: 0,
      status: "cancelled",
    };
    setExecutionHistory((prev) => [newRecord, ...prev].slice(0, 20));
  }, [activeTab]);

  /* ---- New state: Results Panel ---- */
  const [resultsSearch, setResultsSearch] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [chartXCol, setChartXCol] = useState<string>("");
  const [chartYCol, setChartYCol] = useState<string>("");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const filteredResultRows = useMemo(() => {
    let rows = [...QUERY_RESULT.rows];
    if (sortCol !== null) {
      rows.sort((a, b) => {
        const av = a[sortCol];
        const bv = b[sortCol];
        if (typeof av === "number" && typeof bv === "number") {
          return sortAsc ? av - bv : bv - av;
        }
        return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    if (resultsSearch) {
      const search = resultsSearch.toLowerCase();
      rows = rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(search)));
    }
    return rows;
  }, [sortCol, sortAsc, resultsSearch]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResultRows.slice(start, start + pageSize);
  }, [filteredResultRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredResultRows.length / pageSize);

  const exportResults = useCallback((format: "csv" | "json") => {
    let content = "";
    let mimeType = "";
    let filename = "";
    if (format === "csv") {
      content = [QUERY_RESULT.columns.join(","), ...QUERY_RESULT.rows.map((r) => r.join(","))].join("\n");
      mimeType = "text/csv";
      filename = "query_results.csv";
    } else {
      content = JSON.stringify(
        QUERY_RESULT.rows.map((r) =>
          Object.fromEntries(QUERY_RESULT.columns.map((c, i) => [c, r[i]]))
        ),
        null,
        2
      );
      mimeType = "application/json";
      filename = "query_results.json";
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    if (showChart && chartRef.current && chartXCol && chartYCol) {
      const xIdx = QUERY_RESULT.columns.indexOf(chartXCol);
      const yIdx = QUERY_RESULT.columns.indexOf(chartYCol);
      if (xIdx >= 0 && yIdx >= 0) {
        if (chartInstanceRef.current) chartInstanceRef.current.dispose();
        chartInstanceRef.current = echarts.init(chartRef.current);
        const data = QUERY_RESULT.rows.map((r) => ({ name: String(r[xIdx]), value: Number(r[yIdx]) }));
        const option: echarts.EChartsOption =
          chartType === "pie"
            ? {
                tooltip: { trigger: "item" },
                series: [
                  {
                    type: "pie",
                    radius: "50%",
                    data,
                  },
                ],
              }
            : {
                tooltip: { trigger: "axis" },
                xAxis: { type: "category", data: data.map((d) => d.name) },
                yAxis: { type: "value" },
                series: [{ type: chartType, data: data.map((d) => d.value) }],
              };
        chartInstanceRef.current.setOption(option);
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [showChart, chartType, chartXCol, chartYCol]);

  /* ---- New state: Logs ---- */
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS">("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [executionSummary, setExecutionSummary] = useState({
    duration: 2.89,
    rowsScanned: 5000000,
    rowsWritten: 1000,
    errors: 0,
  });

  useEffect(() => {
    if (!isExecuting) return;
    const interval = setInterval(() => {
      const levels: LogEntry["level"][] = ["INFO", "DEBUG", "WARN", "SUCCESS"];
      const messages = [
        "正在读取数据分区...",
        "执行聚合操作...",
        "优化查询计划...",
        "写入临时结果...",
        "清理内存缓存...",
      ];
      const newLog: LogEntry = {
        time: new Date().toLocaleTimeString("zh-CN"),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      };
      setLogs((prev) => [...prev, newLog]);
      setExecutionSummary((prev) => ({
        ...prev,
        rowsScanned: prev.rowsScanned + Math.floor(Math.random() * 10000),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isExecuting]);

  const filteredLogs = useMemo(() => {
    let result = logFilter === "ALL" ? logs : logs.filter((l) => l.level === logFilter);
    if (logSearch) {
      result = result.filter((l) => l.message.toLowerCase().includes(logSearch.toLowerCase()));
    }
    return result;
  }, [logs, logFilter, logSearch]);

  const exportLogs = useCallback(() => {
    const content = logs.map((l) => `[${l.time}] ${l.level}: ${l.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "execution_logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  /* ---- New state: DAG ---- */
  const [selectedDAGNode, setSelectedDAGNode] = useState<string | null>(null);
  const [dagNodeConfig, setDagNodeConfig] = useState<Record<string, { sql?: string; condition?: string; joinType?: string }>>({});
  const [dagValidationError, setDagValidationError] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState<{ sourceId: string } | null>(null);
  const [showDagSaveDialog, setShowDagSaveDialog] = useState(false);
  const [showDagLoadDialog, setShowDagLoadDialog] = useState(false);
  const [dagJsonText, setDagJsonText] = useState("");

  const onConnect = useCallback(
    (params: Edge | Connection) => setDagEdges((eds) => addEdge(params, eds)),
    [setDagEdges]
  );

  const addDAGNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const id = `n-${genId()}`;
      const labelMap: Record<string, string> = {
        source: "新表",
        process: "SQL转换",
        join: "Join操作",
        filter: "Filter条件",
        aggregate: "聚合",
        target: "输出表",
      };
      const newNode: Node = {
        id,
        type: type === "join" || type === "filter" || type === "aggregate" ? "process" : type,
        position,
        data: { label: labelMap[type] || type },
      };
      setDagNodes((prev) => [...prev, newNode]);
    },
    [setDagNodes]
  );

  const validateDAG = useCallback(() => {
    const cycle = detectCycles(dagNodes, dagEdges);
    if (cycle) {
      setDagValidationError(`检测到循环依赖: ${cycle.join(" → ")}`);
      return;
    }
    const orphans = findOrphanNodes(dagNodes, dagEdges);
    if (orphans.length > 0) {
      setDagValidationError(`检测到孤立节点: ${orphans.join(", ")}`);
      return;
    }
    setDagValidationError(null);
  }, [dagNodes, dagEdges]);

  const generateSQLFromDAG = useCallback(() => {
    const sql = `-- 自动生成的SQL\nWITH generated_cte AS (\n  SELECT * FROM dag_source\n)\nSELECT * FROM generated_cte;`;
    const id = `tab-${genId()}`;
    setTabs((prev) => [...prev, { id, name: `dag_generated_${genId()}.sql`, content: sql, modified: false, language: "sql" }]);
    setActiveTabId(id);
    setCenterTab("sql");
  }, []);

  const saveDAG = useCallback(() => {
    const data = { nodes: dagNodes, edges: dagEdges };
    setDagJsonText(JSON.stringify(data, null, 2));
    setShowDagSaveDialog(true);
  }, [dagNodes, dagEdges]);

  const loadDAG = useCallback(() => {
    try {
      const data = JSON.parse(dagJsonText);
      if (data.nodes && data.edges) {
        setDagNodes(data.nodes);
        setDagEdges(data.edges);
        setShowDagLoadDialog(false);
        setDagJsonText("");
      }
    } catch {
      alert("无效的JSON格式");
    }
  }, [dagJsonText, setDagNodes, setDagEdges]);

  /* ---- New state: File Management ---- */
  const [fileTree, setFileTree] = useState<FileNode[]>(INITIAL_FILE_TREE);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);
  const [renameTarget, setRenameTarget] = useState<FileNode | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleFileContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const deleteFileNode = useCallback((node: FileNode) => {
    const deleteRecursive = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((n) => n.name !== node.name)
        .map((n) => (n.children ? { ...n, children: deleteRecursive(n.children) } : n));
    };
    setFileTree((prev) => deleteRecursive(prev));
    setContextMenu(null);
  }, []);

  const renameFileNode = useCallback((node: FileNode, newName: string) => {
    const renameRecursive = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((n) => {
        if (n.name === node.name) return { ...n, name: newName };
        if (n.children) return { ...n, children: renameRecursive(n.children) };
        return n;
      });
    };
    setFileTree((prev) => renameRecursive(prev));
    setRenameTarget(null);
    setRenameValue("");
  }, []);

  const copyPath = useCallback((node: FileNode) => {
    navigator.clipboard.writeText(node.name);
    setContextMenu(null);
  }, []);

  const downloadFile = useCallback((node: FileNode) => {
    const blob = new Blob([`-- ${node.name}\nSELECT 1;`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = node.name;
    a.click();
    URL.revokeObjectURL(url);
    setContextMenu(null);
  }, []);

  const uploadFile = useCallback(() => {
    const name = `uploaded_${genId()}.csv`;
    setFileTree((prev) => [...prev, { name, type: "file" }]);
  }, []);

  const newFolder = useCallback(() => {
    const name = `newfolder_${genId()}`;
    setFileTree((prev) => [...prev, { name, type: "folder", children: [] }]);
  }, []);

  /* ---- New state: Version Control ---- */
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [compareVersion, setCompareVersion] = useState<VersionRecord | null>(null);

  const restoreVersion = useCallback((version: VersionRecord) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, content: version.content, modified: true } : t))
    );
    setShowVersionHistory(false);
  }, [activeTabId]);

  /* ---- Auto-move cursor for demo ---- */
  useEffect(() => {
    const iv = setInterval(() => {
      setCursorLine((l) => (l >= 20 ? 1 : l + 1));
      setCursorCol((c) => (c >= 40 ? 1 : c + 3));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  /* ---- render helpers ---- */
  const logLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR": return <AlertCircle className="w-3 h-3 text-[#EF4444]" />;
      case "WARN": return <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />;
      case "SUCCESS": return <CheckCircle2 className="w-3 h-3 text-[#10B981]" />;
      case "DEBUG": return <Bug className="w-3 h-3 text-[#8B5CF6]" />;
      default: return <Info className="w-3 h-3 text-[#3B82F6]" />;
    }
  };

  const logLevelColor = (level: string) => {
    switch (level) {
      case "ERROR": return "text-[#EF4444]";
      case "WARN": return "text-[#F59E0B]";
      case "SUCCESS": return "text-[#10B981]";
      case "DEBUG": return "text-[#8B5CF6]";
      default: return "text-[#3B82F6]";
    }
  };

  const modelStatusColor = (status: string) => {
    switch (status) {
      case "已发布": return "bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669]";
      case "草稿": return "bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#2563EB]";
      case "已归档": return "bg-[#F1F5F9] dark:bg-[#334155] text-slate-500 dark:text-[#64748B]";
      default: return "bg-[#F1F5F9] dark:bg-[#334155] text-slate-500 dark:text-[#64748B]";
    }
  };

  const filteredSandboxes = useMemo(
    () => (sandboxSearch ? SANDBOXES.filter((s) => s.name.includes(sandboxSearch)) : SANDBOXES),
    [sandboxSearch]
  );

  const selectedTableData = useMemo(() => DB_TABLES.find((t) => t.name === selectedTable), [selectedTable]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-[#0B1120] animate-fadeIn" style={{ margin: "-24px" }}>
      {/* ========== TOOLBAR ========== */}
      <div className="h-12 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#334155] flex items-center px-3 gap-2 shrink-0">
        {/* Sandbox selector */}
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#6366F1]" />
          <select
            value={activeSandbox.id}
            onChange={(e) => {
              const sb = SANDBOXES.find((s) => s.id === e.target.value);
              if (sb) setActiveSandbox(sb);
            }}
            className="bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
          >
            {SANDBOXES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeSandbox.status === "running" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-[#94A3B8]"}`}>
            {activeSandbox.status === "running" ? "运行中" : "已停止"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-[#334155] mx-1" />

        {/* Run button */}
        {isExecuting ? (
          <Button size="sm" className="h-8 gap-1 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs" onClick={cancelExecution}>
            <StopCircle className="w-3.5 h-3.5" />
            取消
          </Button>
        ) : (
          <Button size="sm" className="h-8 gap-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs" onClick={executeQuery}>
            <Play className="w-3.5 h-3.5" />
            执行
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-white">
          <Save className="w-3.5 h-3.5" />
          保存
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-white" onClick={addNewTab}>
          <FilePlus className="w-3.5 h-3.5" />
          新建脚本
        </Button>

        <div className="w-px h-6 bg-slate-200 dark:bg-[#334155] mx-1" />

        {/* Auto-save indicator */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#64748B]">
          {autoSaveStatus === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
          {autoSaveStatus === "saved" && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
          {autoSaveStatus === "unsaved" && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
          <span>
            {autoSaveStatus === "saving" ? "保存中..." : autoSaveStatus === "saved" ? "已保存" : "未保存"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-[#334155] mx-1" />

        {/* Execution history toggle */}
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-white" onClick={() => setShowExecutionHistory(!showExecutionHistory)}>
          <History className="w-3.5 h-3.5" />
          执行历史
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-white" onClick={() => setShowExecutionPlan(!showExecutionPlan)}>
          <Eye className="w-3.5 h-3.5" />
          执行计划
        </Button>

        <div className="flex-1" />

        {/* Settings + Fullscreen + Manage sandboxes */}
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-white" onClick={() => setShowSandboxModal(true)}>
          <LayoutTemplate className="w-3.5 h-3.5" />
          管理沙箱
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B] hover:text-slate-700 dark:hover:text-white px-2" onClick={() => setShowSettingsPanel(!showSettingsPanel)}>
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* ========== MAIN 3-PANEL LAYOUT ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- LEFT PANEL ---- */}
        <div
          className="shrink-0 border-r border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: leftCollapsed ? 36 : 250 }}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="h-7 flex items-center justify-center border-b border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            {leftCollapsed ? (
              <PanelLeft className="w-3.5 h-3.5 text-slate-500 dark:text-[#64748B]" />
            ) : (
              <div className="flex items-center justify-between w-full px-2">
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("files"); }} className={`p-0.5 rounded ${leftTab === "files" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("tables"); }} className={`p-0.5 rounded ${leftTab === "tables" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("functions"); }} className={`p-0.5 rounded ${leftTab === "functions" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <FunctionSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ChevronLeft className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />
              </div>
            )}
          </button>

          {!leftCollapsed && (
            <div className="flex-1 overflow-auto p-2">
              {/* Tab: File Tree */}
              {leftTab === "files" && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-[#64748B] uppercase tracking-wider">项目文件</div>
                    <div className="flex gap-1">
                      <button onClick={newFolder} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]" title="新建文件夹">
                        <FolderPlus className="w-3 h-3" />
                      </button>
                      <button onClick={uploadFile} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]" title="上传文件">
                        <Upload className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {fileTree.map((node) => (
                    <FileTreeNode key={node.name} node={node} onContextMenu={handleFileContextMenu} />
                  ))}
                </div>
              )}

              {/* Tab: Tables */}
              {leftTab === "tables" && (
                <div className="animate-fadeIn">
                  <div className="relative mb-2">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="搜索表名..."
                      className="w-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-1 px-1">数据表</div>
                  {DB_TABLES.map((table) => (
                    <div key={table.name}>
                      <button
                        onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                        className={`flex items-center gap-1 w-full px-1 py-1 text-xs rounded transition-colors text-left ${selectedTable === table.name ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]"}`}
                      >
                        {selectedTable === table.name ? (
                          <ChevronDown className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />
                        )}
                        <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span className="truncate flex-1">{table.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{table.columnCount}字段</span>
                      </button>
                      {selectedTable === table.name && (
                        <div className="ml-4 border-l border-slate-200 dark:border-[#334155] pl-2 py-1 animate-fadeIn">
                          {table.columns.map((col) => (
                            <div key={col.name} className="flex items-center gap-1 py-0.5 text-[11px]">
                              {col.isPk && <Key className="w-3 h-3 text-[#F59E0B]" />}
                              {col.isIndex && !col.isPk && <Pin className="w-3 h-3 text-[#8B5CF6]" />}
                              {!col.isPk && !col.isIndex && <Columns3 className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />}
                              <span className="text-[#A5B4FC]">{col.name}</span>
                              <span className="text-slate-500 dark:text-[#64748B]">{col.type}</span>
                              {col.nullable && <span className="text-[#EF4444] text-[10px]">N</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Functions */}
              {leftTab === "functions" && (
                <div className="animate-fadeIn">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-2 px-1">系统函数</div>
                  <div className="space-y-0.5">
                    {SYSTEM_FUNCTIONS.map((fn) => (
                      <div key={fn.name} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer group">
                        <div className="text-xs font-mono text-[#60A5FA]">{fn.sig}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#64748B] group-hover:text-slate-400 dark:group-hover:text-[#94A3B8]">{fn.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-[#64748B] uppercase tracking-wider mt-4 mb-2 px-1">自定义函数</div>
                  <div className="space-y-0.5">
                    {CUSTOM_FUNCTIONS.map((fn) => (
                      <div key={fn.name} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer group">
                        <div className="text-xs font-mono text-[#C084FC]">{fn.sig}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#64748B] group-hover:text-slate-400 dark:group-hover:text-[#94A3B8]">{fn.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---- CENTER PANEL ---- */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0B1120]">
          {/* Center tabs */}
          <div className="h-8 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#334155] flex items-center px-1 gap-0.5 shrink-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-t transition-colors shrink-0 ${
                  activeTabId === tab.id
                    ? "text-[#60A5FA] border-b-2 border-[#6366F1] bg-slate-100 dark:bg-[#1E293B]"
                    : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{tab.name}</span>
                {tab.modified && <span className="text-[#F59E0B]">●</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#334155]"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
            <button
              onClick={addNewTab}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setCenterTab("sql")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-t transition-colors ${centerTab === "sql" ? "text-[#60A5FA] border-b-2 border-[#6366F1] bg-slate-100 dark:bg-[#1E293B]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}
            >
              <FileText className="w-3.5 h-3.5" />
              SQL
            </button>
            <button
              onClick={() => setCenterTab("dag")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-t transition-colors ${centerTab === "dag" ? "text-[#60A5FA] border-b-2 border-[#6366F1] bg-slate-100 dark:bg-[#1E293B]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}
            >
              <Zap className="w-3.5 h-3.5" />
              DAG视图
            </button>
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-hidden">
            {centerTab === "sql" ? (
              <div className="h-full flex flex-col animate-fadeIn">
                {/* SQL Editor */}
                <CodeEditor
                  value={activeTab?.content || ""}
                  onChange={(v) => updateTabContent(activeTabId, v)}
                  language={activeTab?.language || "sql"}
                />
                {/* Execution progress bar */}
                {isExecuting && (
                  <div className="h-1 bg-slate-200 dark:bg-[#334155]">
                    <div
                      className="h-full bg-[#6366F1] transition-all duration-200"
                      style={{ width: `${executionProgress}%` }}
                    />
                  </div>
                )}
                {/* Editor bottom toolbar */}
                <div className="h-7 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#334155] flex items-center px-3 gap-4 text-[11px] text-slate-500 dark:text-[#64748B] shrink-0">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    已连接
                  </span>
                  <span>UTF-8</span>
                  <span>{activeTab?.language.toUpperCase()}</span>
                  <span>{cursorLine}:{cursorCol}</span>
                  {lastExecutionTime !== null && (
                    <span className="flex items-center gap-1 text-[#10B981]">
                      <Timer className="w-3 h-3" />
                      {lastExecutionTime}s
                    </span>
                  )}
                  <div className="flex-1" />
                  <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {autoSaveStatus === "saved" ? "已保存" : autoSaveStatus === "saving" ? "保存中..." : "未保存"}</span>
                  <button
                    onClick={() => setShowVersionHistory(true)}
                    className="flex items-center gap-1 hover:text-[#6366F1]"
                  >
                    <History className="w-3 h-3" />
                    历史版本
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full animate-fadeIn" style={{ position: "relative" }}>
                <ReactFlow
                  nodes={dagNodes}
                  edges={dagEdges}
                  onNodesChange={onDAGNodesChange}
                  onEdgesChange={onDAGEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={dagNodeTypes}
                  onNodeClick={(_, node) => {
                    if (connectMode) {
                      if (connectMode.sourceId !== node.id) {
                        setDagEdges((eds) => addEdge({ source: connectMode.sourceId, target: node.id, sourceHandle: null, targetHandle: null }, eds));
                      }
                      setConnectMode(null);
                    } else {
                      setSelectedDAGNode(node.id);
                    }
                  }}
                  onPaneClick={() => {
                    setSelectedDAGNode(null);
                    setConnectMode(null);
                  }}
                  fitView
                  style={{ background: "#0B1120" }}
                >
                  <Background color="#334155" gap={20} size={1} />
                  <Controls className="!bg-slate-100 dark:bg-[#1E293B] !border-slate-200 dark:!border-[#334155] !text-slate-500 dark:!text-[#CBD5E1]" />
                  <MiniMap className="!bg-slate-100 dark:bg-[#1E293B]" nodeColor={(n) => {
                    if (n.type === "source") return "#10B981";
                    if (n.type === "process") return "#6366F1";
                    if (n.type === "target") return "#F59E0B";
                    return "#8B5CF6";
                  }} maskColor="rgba(15, 23, 42, 0.7)" />
                </ReactFlow>
                {/* DAG Toolbar */}
                <div className="absolute top-3 right-3 flex gap-1 z-10 flex-wrap max-w-[200px] justify-end">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("source", { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 })}>
                    <Plus className="w-3 h-3 mr-1" />源表
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("process", { x: Math.random() * 200 + 250, y: Math.random() * 200 + 50 })}>
                    <Plus className="w-3 h-3 mr-1" />SQL转换
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("join", { x: Math.random() * 200 + 250, y: Math.random() * 200 + 50 })}>
                    <Plus className="w-3 h-3 mr-1" />Join
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("filter", { x: Math.random() * 200 + 250, y: Math.random() * 200 + 50 })}>
                    <Filter className="w-3 h-3 mr-1" />Filter
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("aggregate", { x: Math.random() * 200 + 250, y: Math.random() * 200 + 50 })}>
                    <Plus className="w-3 h-3 mr-1" />聚合
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => addDAGNode("target", { x: Math.random() * 200 + 450, y: Math.random() * 200 + 50 })}>
                    <Plus className="w-3 h-3 mr-1" />输出
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={validateDAG}>
                    <Check className="w-3 h-3 mr-1" />验证
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={generateSQLFromDAG}>
                    <FileCode className="w-3 h-3 mr-1" />生成SQL
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={saveDAG}>
                    <Save className="w-3 h-3 mr-1" />保存
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#1E293B]" onClick={() => setShowDagLoadDialog(true)}>
                    <Upload className="w-3 h-3 mr-1" />加载
                  </Button>
                </div>
                {/* DAG Validation Error */}
                {dagValidationError && (
                  <div className="absolute bottom-3 left-3 right-3 z-10 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-2 rounded">
                    {dagValidationError}
                    <button onClick={() => setDagValidationError(null)} className="ml-2 text-red-500 hover:text-red-400">
                      <X className="w-3 h-3 inline" />
                    </button>
                  </div>
                )}
                {/* Selected Node Config Panel */}
                {selectedDAGNode && (
                  <div className="absolute top-3 left-3 z-10 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg p-3 w-64 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">节点配置</span>
                      <button onClick={() => setSelectedDAGNode(null)} className="text-slate-400 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-[#64748B] block mb-1">SQL 配置</label>
                        <textarea
                          value={dagNodeConfig[selectedDAGNode]?.sql || ""}
                          onChange={(e) => setDagNodeConfig((prev) => ({ ...prev, [selectedDAGNode]: { ...prev[selectedDAGNode], sql: e.target.value } }))}
                          className="w-full h-20 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded p-2 focus:outline-none focus:border-[#6366F1] resize-none"
                          placeholder="输入SQL..."
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] w-full"
                        onClick={() => {
                          const node = dagNodes.find((n) => n.id === selectedDAGNode);
                          if (node) {
                            setConnectMode({ sourceId: node.id });
                            setSelectedDAGNode(null);
                          }
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />连接输出
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT PANEL ---- */}
        <div
          className="shrink-0 border-l border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: rightCollapsed ? 36 : 300 }}
        >
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="h-7 flex items-center justify-center border-b border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            {rightCollapsed ? (
              <PanelRight className="w-3.5 h-3.5 text-slate-500 dark:text-[#64748B]" />
            ) : (
              <div className="flex items-center justify-between w-full px-2">
                <ChevronLeft className="w-3 h-3 text-slate-500 dark:text-[#64748B]" />
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("results"); }} className={`p-0.5 rounded ${rightTab === "results" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("logs"); }} className={`p-0.5 rounded ${rightTab === "logs" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Bug className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("models"); }} className={`p-0.5 rounded ${rightTab === "models" ? "bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Database className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </button>

          {!rightCollapsed && (
            <div className="flex-1 overflow-auto">
              {/* Tab: Results */}
              {rightTab === "results" && (
                <div className="animate-fadeIn">
                  {/* Stats */}
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-200 dark:border-[#334155] text-[11px] text-slate-500 dark:text-[#64748B] flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lastExecutionTime ?? QUERY_RESULT.executionTime}s</span>
                    <span className="flex items-center gap-1"><Table2 className="w-3 h-3" /> {filteredResultRows.length} 行</span>
                    <span className="flex items-center gap-1"><Columns3 className="w-3 h-3" /> {QUERY_RESULT.columns.length} 列</span>
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(filteredResultRows.length * QUERY_RESULT.columns.length * 8)}</span>
                  </div>
                  {/* Search + Export + Chart */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-[#334155]">
                    <div className="relative flex-1">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#64748B]" />
                      <input
                        type="text"
                        value={resultsSearch}
                        onChange={(e) => { setResultsSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="搜索结果..."
                        className="w-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md pl-6 pr-2 py-1 focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>
                    <button onClick={() => exportResults("csv")} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]" title="导出CSV">
                      <Download className="w-3 h-3" />
                    </button>
                    <button onClick={() => exportResults("json")} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]" title="导出JSON">
                      <FileJson className="w-3 h-3" />
                    </button>
                    <button onClick={() => setShowChart(!showChart)} className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] ${showChart ? "text-[#6366F1]" : "text-slate-500 dark:text-[#64748B]"}`} title="图表">
                      <BarChart3 className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Chart config */}
                  {showChart && (
                    <div className="p-2 border-b border-slate-200 dark:border-[#334155] space-y-2">
                      <div className="flex gap-1">
                        <select
                          value={chartXCol}
                          onChange={(e) => setChartXCol(e.target.value)}
                          className="flex-1 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded px-2 py-1"
                        >
                          <option value="">选择X轴</option>
                          {QUERY_RESULT.columns.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={chartYCol}
                          onChange={(e) => setChartYCol(e.target.value)}
                          className="flex-1 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded px-2 py-1"
                        >
                          <option value="">选择Y轴</option>
                          {QUERY_RESULT.columns.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setChartType("bar")} className={`flex-1 p-1 rounded text-xs ${chartType === "bar" ? "bg-[#6366F1] text-white" : "bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1]"}`}>
                          <BarChart3 className="w-3 h-3 inline mr-1" />柱状
                        </button>
                        <button onClick={() => setChartType("line")} className={`flex-1 p-1 rounded text-xs ${chartType === "line" ? "bg-[#6366F1] text-white" : "bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1]"}`}>
                          <LineChart className="w-3 h-3 inline mr-1" />折线
                        </button>
                        <button onClick={() => setChartType("pie")} className={`flex-1 p-1 rounded text-xs ${chartType === "pie" ? "bg-[#6366F1] text-white" : "bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1]"}`}>
                          <PieChart className="w-3 h-3 inline mr-1" />饼图
                        </button>
                      </div>
                      <div ref={chartRef} className="w-full h-48" />
                    </div>
                  )}
                  {/* Result table */}
                  <div className="overflow-auto max-h-[calc(100%-2rem)]">
                    <table className="w-full text-[11px]">
                      <thead className="bg-slate-100 dark:bg-[#1E293B] sticky top-0">
                        <tr>
                          {QUERY_RESULT.columns.map((col, i) => (
                            <th
                              key={col}
                              className="px-2 py-1.5 text-left text-slate-400 dark:text-[#94A3B8] font-semibold border-b border-slate-200 dark:border-[#334155] cursor-pointer hover:text-slate-500 dark:text-[#CBD5E1] select-none whitespace-nowrap"
                              onClick={() => handleSort(i)}
                            >
                              <span className="flex items-center gap-0.5">
                                {col}
                                {sortCol === i && (sortAsc ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((row, ri) => (
                          <tr key={ri} className="border-b border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B]/50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2 py-1 text-slate-500 dark:text-[#CBD5E1] whitespace-nowrap font-mono">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between p-2 border-t border-slate-200 dark:border-[#334155] text-[10px] text-slate-500 dark:text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded px-1 py-0.5"
                      >
                        {[50, 100, 200, 500].map((s) => (
                          <option key={s} value={s}>{s}/页</option>
                        ))}
                      </select>
                      <span>{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredResultRows.length)} / {filteredResultRows.length}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30">
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span className="px-1">{currentPage}/{totalPages || 1}</span>
                      <button onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))} disabled={currentPage >= totalPages} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] disabled:opacity-30">
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Logs */}
              {rightTab === "logs" && (
                <div className="animate-fadeIn">
                  {/* Execution Summary Card */}
                  <div className="grid grid-cols-2 gap-1 p-2 border-b border-slate-200 dark:border-[#334155]">
                    <div className="bg-slate-100 dark:bg-[#1E293B] rounded p-1.5 text-center">
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B]">耗时</div>
                      <div className="text-xs font-mono text-[#60A5FA]">{executionSummary.duration}s</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#1E293B] rounded p-1.5 text-center">
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B]">扫描行数</div>
                      <div className="text-xs font-mono text-[#10B981]">{executionSummary.rowsScanned.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#1E293B] rounded p-1.5 text-center">
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B]">写入行数</div>
                      <div className="text-xs font-mono text-[#F59E0B]">{executionSummary.rowsWritten.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#1E293B] rounded p-1.5 text-center">
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B]">错误</div>
                      <div className="text-xs font-mono text-[#EF4444]">{executionSummary.errors}</div>
                    </div>
                  </div>
                  {/* Log filter + search + export */}
                  <div className="flex gap-0.5 p-1.5 border-b border-slate-200 dark:border-[#334155] flex-wrap items-center">
                    <div className="flex gap-0.5 flex-wrap flex-1">
                      {(["ALL", "INFO", "SUCCESS", "WARN", "ERROR", "DEBUG"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setLogFilter(level)}
                          className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                            logFilter === level
                              ? "bg-slate-100 dark:bg-[#273548] text-slate-500 dark:text-[#CBD5E1]"
                              : "text-slate-500 dark:text-[#64748B] hover:text-slate-400 dark:text-[#94A3B8]"
                          }`}
                        >
                          {level === "ALL" ? "全部" : level}
                        </button>
                      ))}
                    </div>
                    <button onClick={exportLogs} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 dark:text-[#64748B]" title="导出日志">
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-1.5 border-b border-slate-200 dark:border-[#334155]">
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#64748B]" />
                      <input
                        type="text"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="搜索日志..."
                        className="w-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md pl-6 pr-2 py-1 focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    {filteredLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5 text-[11px] font-mono">
                        <span className="text-slate-500 dark:text-[#64748B] shrink-0">[{log.time}]</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {logLevelIcon(log.level)}
                          <span className={logLevelColor(log.level)}>{log.level}</span>
                        </span>
                        <span className="text-slate-500 dark:text-[#CBD5E1] break-all">
                          {logSearch ? (
                            <span dangerouslySetInnerHTML={{
                              __html: log.message.replace(
                                new RegExp(`(${logSearch})`, "gi"),
                                '<mark class="bg-yellow-500/30 text-yellow-200">$1</mark>'
                              )
                            }} />
                          ) : (
                            log.message
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Model Management */}
              {rightTab === "models" && (
                <div className="animate-fadeIn p-2 space-y-2">
                  {MODELS.map((model) => (
                    <div key={model.id} className="bg-slate-100 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155] p-3 hover:border-slate-300 dark:hover:border-[#475569] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">{model.name}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${modelStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B] mt-0.5">{model.type} · {model.version}</div>
                      <div className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-1 line-clamp-2">{model.description}</div>
                      {model.metrics && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(model.metrics).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0F172A] text-[#60A5FA]">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 dark:text-[#64748B]">
                        <span>运行 {model.runCount} 次</span>
                        <span>{model.lastRunAt}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" className="h-6 text-[10px] bg-[#6366F1] hover:bg-[#4F46E5] text-white px-2">
                          <Play className="w-2.5 h-2.5 mr-1" />运行
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548] px-2">
                          <GitBranchIcon className="w-2.5 h-2.5 mr-1" />对比
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548] px-2">
                          <Zap className="w-2.5 h-2.5 mr-1" />部署
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========== BOTTOM STATUS BAR ========== */}
      <div className="h-6 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#334155] flex items-center px-3 gap-4 text-[10px] text-slate-500 dark:text-[#64748B] shrink-0">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          数据库已连接
        </span>
        <span>行数: {filteredResultRows.length}</span>
        <span>耗时: {lastExecutionTime ?? QUERY_RESULT.executionTime}s</span>
        <div className="flex-1" />
        <span>行 {cursorLine}, 列 {cursorCol}</span>
        <span>UTF-8</span>
      </div>

      {/* ========== CONTEXT MENU ========== */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-lg shadow-lg py-1 w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => { setRenameTarget(contextMenu.node); setRenameValue(contextMenu.node.name); setContextMenu(null); }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]"
          >
            <Type className="w-3 h-3" />重命名
          </button>
          <button
            onClick={() => deleteFileNode(contextMenu.node)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-slate-100 dark:hover:bg-[#273548]"
          >
            <Trash2 className="w-3 h-3" />删除
          </button>
          <button
            onClick={() => copyPath(contextMenu.node)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]"
          >
            <Copy className="w-3 h-3" />复制路径
          </button>
          <button
            onClick={() => downloadFile(contextMenu.node)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]"
          >
            <Download className="w-3 h-3" />下载
          </button>
        </div>
      )}

      {/* ========== RENAME DIALOG ========== */}
      {renameTarget && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] mb-3">重命名</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1] mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setRenameTarget(null)}>取消</Button>
              <Button size="sm" className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={() => renameFileNode(renameTarget, renameValue)}>确定</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EXECUTION HISTORY SIDEBAR ========== */}
      {showExecutionHistory && (
        <div className="fixed right-0 top-12 bottom-6 w-80 bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-[#334155] shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-[#334155]">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">执行历史 (最近20条)</h3>
            <button onClick={() => setShowExecutionHistory(false)} className="text-slate-400 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {executionHistory.map((record) => (
              <div key={record.id} className="p-2 rounded bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs">
                <div className="flex items-center gap-1 mb-1">
                  {record.status === "success" && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                  {record.status === "error" && <AlertCircle className="w-3 h-3 text-[#EF4444]" />}
                  {record.status === "cancelled" && <StopCircle className="w-3 h-3 text-[#F59E0B]" />}
                  <span className="text-slate-500 dark:text-[#CBD5E1] font-mono truncate">{record.sql}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#64748B]">
                  <span>{record.time}</span>
                  <span>{record.duration > 0 ? `${record.duration}s` : "已取消"}</span>
                  <span>{record.rows} 行</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== EXECUTION PLAN SIDEBAR ========== */}
      {showExecutionPlan && (
        <div className="fixed right-0 top-12 bottom-6 w-80 bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-[#334155] shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-[#334155]">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">执行计划</h3>
            <button onClick={() => setShowExecutionPlan(false)} className="text-slate-400 dark:text-[#64748B] hover:text-slate-500 dark:text-[#CBD5E1]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {MOCK_EXECUTION_PLAN.map((node) => (
              <div key={node.id} className="p-2 rounded bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px]">{node.type}</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-[#64748B]">Cost: {node.cost}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mb-1">{node.details}</div>
                <div className="flex gap-2 text-[10px] text-slate-500 dark:text-[#64748B]">
                  <span>扫描: {node.scanType}</span>
                  <span>预估: {node.estimatedRows.toLocaleString()} 行</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== VERSION HISTORY DIALOG ========== */}
      {showVersionHistory && (
        <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">版本历史 - {activeTab?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {MOCK_VERSIONS.map((version) => (
                <Card key={version.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{version.id}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{version.timestamp}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{version.author}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setCompareVersion(version)}>
                          <GitCompare className="w-3 h-3 mr-1" />对比
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => restoreVersion(version)}>
                          <Undo className="w-3 h-3 mr-1" />恢复
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-[#CBD5E1]">{version.summary}</div>
                    {compareVersion?.id === version.id && (
                      <div className="mt-2 border border-slate-200 dark:border-[#334155] rounded p-2">
                        <div className="text-[10px] text-slate-500 dark:text-[#64748B] mb-1">与当前版本对比</div>
                        <DiffViewer oldText={version.content} newText={activeTab?.content || ""} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ========== DAG SAVE/LOAD DIALOGS ========== */}
      {showDagSaveDialog && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] mb-3">保存 DAG</h3>
            <textarea
              value={dagJsonText}
              readOnly
              className="w-full h-40 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none font-mono resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowDagSaveDialog(false)}>关闭</Button>
              <Button size="sm" className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={() => {
                const blob = new Blob([dagJsonText], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `dag_${genId()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>下载</Button>
            </div>
          </div>
        </div>
      )}

      {showDagLoadDialog && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9] mb-3">加载 DAG</h3>
            <textarea
              value={dagJsonText}
              onChange={(e) => setDagJsonText(e.target.value)}
              placeholder="粘贴DAG JSON..."
              className="w-full h-40 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none font-mono resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowDagLoadDialog(false)}>取消</Button>
              <Button size="sm" className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={loadDAG}>加载</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== SANDBOX LIST MODAL ========== */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSandboxModal(false)}>
          <div
            className="bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#334155]">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">沙箱管理</h3>
              <button onClick={() => setShowSandboxModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors">
                <X className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-[#334155]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-[#64748B]" />
                <input
                  type="text"
                  value={sandboxSearch}
                  onChange={(e) => setSandboxSearch(e.target.value)}
                  placeholder="搜索沙箱名称..."
                  className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#6366F1]"
                />
              </div>
            </div>

            {/* Sandbox table */}
            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-[#1E293B]">
                  <tr className="border-b border-slate-200 dark:border-[#334155]">
                    {["沙箱名称", "状态", "类型", "资源规格", "创建人", "创建时间", "到期时间", "操作"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-slate-400 dark:text-[#94A3B8] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSandboxes.map((sb) => (
                    <tr key={sb.id} className="border-b border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100 dark:hover:bg-[#273548]/50 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 dark:text-[#CBD5E1] font-medium">{sb.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sb.status === "running" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-[#94A3B8]"}`}>
                          {sb.status === "running" ? "运行中" : "已停止"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sb.type === "production" ? "bg-[#312E81] text-[#818CF8]" : "bg-[#1E3A5F] text-[#60A5FA]"}`}>
                          {sb.type === "production" ? "生产" : "开发"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 dark:text-[#94A3B8] font-mono text-[11px]">{sb.cpu}/{sb.memory}/{sb.storage}</td>
                      <td className="px-3 py-2.5 text-slate-400 dark:text-[#94A3B8]">{sb.owner}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-[#64748B] text-[11px]">{sb.createdAt}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-[#64748B] text-[11px]">{sb.expiresAt}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {sb.status === "running" ? (
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors" title="暂停">
                              <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                            </button>
                          ) : (
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors" title="重启">
                              <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                            </button>
                          )}
                          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors" title="删除">
                            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors"
                            title="进入"
                            onClick={() => {
                              setActiveSandbox(sb);
                              setShowSandboxModal(false);
                            }}
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]" onClick={() => setShowSandboxModal(false)}>
                关闭
              </Button>
              <Button size="sm" className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={() => { setShowNewSandboxModal(true); setShowSandboxModal(false); }}>
                <Plus className="w-3.5 h-3.5 mr-1" />新建沙箱
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== NEW SANDBOX MODAL ========== */}
      {showNewSandboxModal && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNewSandboxModal(false)}>
          <div
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-lg flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#334155]">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F1F5F9]">新建沙箱</h3>
              <button onClick={() => setShowNewSandboxModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#273548] transition-colors">
                <X className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1.5">沙箱名称</label>
                <input
                  type="text"
                  value={newSandboxName}
                  onChange={(e) => setNewSandboxName(e.target.value)}
                  placeholder="输入沙箱名称..."
                  className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1.5">环境类型</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSandboxType("development")}
                    className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                      newSandboxType === "development"
                        ? "border-[#6366F1] bg-[rgba(99,102,241,0.1)]"
                        : "border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">开发环境</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">用于数据探索和模型开发</div>
                  </button>
                  <button
                    onClick={() => setNewSandboxType("production")}
                    className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                      newSandboxType === "production"
                        ? "border-[#6366F1] bg-[rgba(99,102,241,0.1)]"
                        : "border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A]"
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">生产环境</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">用于生产级任务调度</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1.5">CPU</label>
                  <select
                    value={newSandboxCpu}
                    onChange={(e) => setNewSandboxCpu(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                  >
                    <option>2核</option>
                    <option>4核</option>
                    <option>8核</option>
                    <option>16核</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1.5">内存</label>
                  <select
                    value={newSandboxMemory}
                    onChange={(e) => setNewSandboxMemory(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                  >
                    <option>4GB</option>
                    <option>8GB</option>
                    <option>16GB</option>
                    <option>32GB</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-[#94A3B8] block mb-1.5">存储</label>
                  <select
                    value={newSandboxStorage}
                    onChange={(e) => setNewSandboxStorage(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                  >
                    <option>100GB</option>
                    <option>500GB</option>
                    <option>1TB</option>
                    <option>2TB</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#0F172A] rounded-lg p-3 border border-slate-200 dark:border-[#334155]">
                <h4 className="text-xs font-medium text-slate-600 dark:text-[#94A3B8] mb-2">资源配置预览</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-mono font-bold text-[#6366F1]">{newSandboxCpu}</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B]">CPU</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-[#3B82F6]">{newSandboxMemory}</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B]">内存</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-[#10B981]">{newSandboxStorage}</div>
                    <div className="text-[10px] text-slate-400 dark:text-[#64748B]">存储</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273548]" onClick={() => setShowNewSandboxModal(false)}>
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                onClick={() => {
                  if (newSandboxName.trim()) {
                    setActiveSandbox({
                      id: `sb-${Date.now()}`,
                      name: newSandboxName,
                      status: "running",
                      type: newSandboxType,
                      cpu: newSandboxCpu,
                      memory: newSandboxMemory,
                      storage: newSandboxStorage,
                      createdAt: new Date().toISOString().split("T")[0],
                      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                      owner: "管理员",
                    });
                    setNewSandboxName("");
                    setShowNewSandboxModal(false);
                  }
                }}
                disabled={!newSandboxName.trim()}
              >
                创建沙箱
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Lucide doesn't export GitBranch - use a local SVG helper */
function GitBranchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}
