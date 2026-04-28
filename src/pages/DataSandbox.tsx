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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const FILE_TREE: FileNode[] = [
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

const LOGS: LogEntry[] = [
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
      // Comment
      if (remaining.startsWith("--")) {
        tokens.push({ text: remaining, type: "comment" });
        break;
      }
      // String literal
      const strMatch = remaining.match(/^('(?:''|[^'])*')/);
      if (strMatch) {
        tokens.push({ text: strMatch[1], type: "string" });
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }
      // Number
      const numMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numMatch) {
        tokens.push({ text: numMatch[1], type: "number" });
        remaining = remaining.slice(numMatch[1].length);
        continue;
      }
      // Word
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
      // Whitespace or symbol - take one char
      tokens.push({ text: remaining[0], type: "plain" });
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} className="flex">
        {tokens.map((t, i) => {
          let colorClass = "text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]";
          if (t.type === "keyword") colorClass = "text-[#C084FC] font-bold";
          else if (t.type === "function") colorClass = "text-[#60A5FA]";
          else if (t.type === "string") colorClass = "text-[#4ADE80]";
          else if (t.type === "number") colorClass = "text-[#F472B6]";
          else if (t.type === "comment") colorClass = "text-slate-500 dark:text-slate-500 dark:text-[#64748B] italic";
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

/** File Tree recursive renderer */
function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

  return (
    <div>
      <button
        className="flex items-center gap-1 w-full px-2 py-1 text-xs text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] rounded transition-colors text-left"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren ? setExpanded(!expanded) : undefined}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" /> : <ChevronRight className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
        ) : (
          <span className="w-3" />
        )}
        {node.type === "folder" ? (
          expanded ? <FolderOpen className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Folder className="w-3.5 h-3.5 text-[#F59E0B]" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && expanded && (
        <div className="transition-all duration-200">
          {node.children!.map((child) => (
            <FileTreeNode key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function DataSandbox() {
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
  const [sqlContent] = useState(SAMPLE_SQL);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG" | "SUCCESS">("ALL");
  const [dagNodes, , onDAGNodesChange] = useNodesState(initialDAGNodes);
  const [dagEdges, setDAGEdges, onDAGEdgesChange] = useEdgesState(initialDAGEdges);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [sandboxSearch, setSandboxSearch] = useState("");

  const onConnect = useCallback(
    (params: Edge | Connection) => setDAGEdges((eds) => addEdge(params, eds)),
    [setDAGEdges]
  );

  const filteredLogs = useMemo(
    () => logFilter === "ALL" ? LOGS : LOGS.filter((l) => l.level === logFilter),
    [logFilter]
  );

  const sortedResultRows = useMemo(() => {
    if (sortCol === null) return QUERY_RESULT.rows;
    const rows = [...QUERY_RESULT.rows];
    rows.sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [sortCol, sortAsc]);

  const filteredSandboxes = useMemo(
    () => sandboxSearch
      ? SANDBOXES.filter((s) => s.name.includes(sandboxSearch))
      : SANDBOXES,
    [sandboxSearch]
  );

  const selectedTableData = useMemo(
    () => DB_TABLES.find((t) => t.name === selectedTable),
    [selectedTable]
  );

  /* ---- status bar state ---- */
  const [cursorLine, setCursorLine] = useState(18);
  const [cursorCol, setCursorCol] = useState(7);

  /* Auto-move cursor for demo */
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
      case "已归档": return "bg-[#F1F5F9] dark:bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#64748B]";
      default: return "bg-[#F1F5F9] dark:bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#64748B]";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-50 dark:bg-[#0B1120] animate-fadeIn" style={{ margin: "-24px" }}>
      {/* ========== TOOLBAR ========== */}
      <div className="h-12 bg-white dark:bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] flex items-center px-3 gap-2 shrink-0">
        {/* Sandbox selector */}
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#6366F1]" />
          <select
            value={activeSandbox.id}
            onChange={(e) => {
              const sb = SANDBOXES.find((s) => s.id === e.target.value);
              if (sb) setActiveSandbox(sb);
            }}
            className="bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
          >
            {SANDBOXES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeSandbox.status === "running" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]"}`}>
            {activeSandbox.status === "running" ? "运行中" : "已停止"}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] mx-1" />

        {/* Run button */}
        <Button size="sm" className="h-8 gap-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs">
          <Play className="w-3.5 h-3.5" />
          执行
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] hover:text-white">
          <Save className="w-3.5 h-3.5" />
          保存
        </Button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] mx-1" />

        {/* Version selector */}
        <select className="bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1]">
          <option>v2.1.0 (当前)</option>
          <option>v2.0.0</option>
          <option>v1.0.0</option>
        </select>

        <div className="flex-1" />

        {/* Settings + Fullscreen + Manage sandboxes */}
        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] hover:text-white" onClick={() => setShowSandboxModal(true)}>
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
          className="shrink-0 border-r border-slate-200 dark:border-slate-200 dark:border-[#334155] bg-white dark:bg-white dark:bg-[#0F172A] flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: leftCollapsed ? 36 : 250 }}
        >
          {/* Collapse toggle */}
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="h-7 flex items-center justify-center border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] transition-colors"
          >
            {leftCollapsed ? (
              <PanelLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
            ) : (
              <div className="flex items-center justify-between w-full px-2">
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("files"); }} className={`p-0.5 rounded ${leftTab === "files" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("tables"); }} className={`p-0.5 rounded ${leftTab === "tables" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setLeftTab("functions"); }} className={`p-0.5 rounded ${leftTab === "functions" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <FunctionSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ChevronLeft className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
              </div>
            )}
          </button>

          {!leftCollapsed && (
            <div className="flex-1 overflow-auto p-2">
              {/* Tab: File Tree */}
              {leftTab === "files" && (
                <div className="animate-fadeIn">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-2 px-1">项目文件</div>
                  {FILE_TREE.map((node) => (
                    <FileTreeNode key={node.name} node={node} />
                  ))}
                </div>
              )}

              {/* Tab: Tables */}
              {leftTab === "tables" && (
                <div className="animate-fadeIn">
                  <div className="relative mb-2">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="搜索表名..."
                      className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] text-xs rounded-md pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-1 px-1">数据表</div>
                  {DB_TABLES.map((table) => (
                    <div key={table.name}>
                      <button
                        onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                        className={`flex items-center gap-1 w-full px-1 py-1 text-xs rounded transition-colors text-left ${selectedTable === table.name ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]"}`}
                      >
                        {selectedTable === table.name ? (
                          <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
                        )}
                        <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span className="truncate flex-1">{table.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B]">{table.columnCount}字段</span>
                      </button>
                      {selectedTable === table.name && (
                        <div className="ml-4 border-l border-slate-200 dark:border-slate-200 dark:border-[#334155] pl-2 py-1 animate-fadeIn">
                          {table.columns.map((col) => (
                            <div key={col.name} className="flex items-center gap-1 py-0.5 text-[11px]">
                              {col.isPk && <Key className="w-3 h-3 text-[#F59E0B]" />}
                              {col.isIndex && !col.isPk && <Pin className="w-3 h-3 text-[#8B5CF6]" />}
                              {!col.isPk && !col.isIndex && <Columns3 className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />}
                              <span className="text-[#A5B4FC]">{col.name}</span>
                              <span className="text-slate-500 dark:text-slate-500 dark:text-[#64748B]">{col.type}</span>
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
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-2 px-1">系统函数</div>
                  <div className="space-y-0.5">
                    {SYSTEM_FUNCTIONS.map((fn) => (
                      <div key={fn.name} className="px-2 py-1 rounded hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] cursor-pointer group">
                        <div className="text-xs font-mono text-[#60A5FA]">{fn.sig}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B] group-hover:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">{fn.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 dark:text-[#64748B] uppercase tracking-wider mt-4 mb-2 px-1">自定义函数</div>
                  <div className="space-y-0.5">
                    {CUSTOM_FUNCTIONS.map((fn) => (
                      <div key={fn.name} className="px-2 py-1 rounded hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] cursor-pointer group">
                        <div className="text-xs font-mono text-[#C084FC]">{fn.sig}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B] group-hover:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">{fn.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---- CENTER PANEL ---- */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-50 dark:bg-[#0B1120]">
          {/* Center tabs */}
          <div className="h-8 bg-white dark:bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] flex items-center px-1 gap-0.5 shrink-0">
            <button
              onClick={() => setCenterTab("sql")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-t transition-colors ${centerTab === "sql" ? "text-[#60A5FA] border-b-2 border-[#6366F1] bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}
            >
              <FileText className="w-3.5 h-3.5" />
              user_rfm_model.sql
            </button>
            <button
              onClick={() => setCenterTab("dag")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-t transition-colors ${centerTab === "dag" ? "text-[#60A5FA] border-b-2 border-[#6366F1] bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}
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
                <div className="flex-1 overflow-auto font-mono text-sm leading-6 p-4">
                  {highlightSQL(sqlContent)}
                </div>
                {/* Editor bottom toolbar */}
                <div className="h-7 bg-white dark:bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-200 dark:border-[#334155] flex items-center px-3 gap-4 text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748B] shrink-0">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    已连接
                  </span>
                  <span>UTF-8</span>
                  <span>SQL</span>
                  <span>{cursorLine}:{cursorCol}</span>
                  <div className="flex-1" />
                  <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> 已保存</span>
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
                  fitView
                  style={{ background: "#0B1120" }}
                >
                  <Background color="#334155" gap={20} size={1} />
                  <Controls className="!bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] !border-slate-200 dark:border-slate-200 dark:border-[#334155] !text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]" />
                  <MiniMap className="!bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]" nodeColor={(n) => {
                    if (n.type === "source") return "#10B981";
                    if (n.type === "process") return "#6366F1";
                    if (n.type === "target") return "#F59E0B";
                    return "#8B5CF6";
                  }} maskColor="rgba(15, 23, 42, 0.7)" />
                </ReactFlow>
                {/* DAG Toolbar */}
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-slate-200 dark:border-[#334155] bg-white dark:bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]">
                    <Plus className="w-3 h-3 mr-1" />节点
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-slate-200 dark:border-[#334155] bg-white dark:bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]">
                    <LayoutTemplate className="w-3 h-3 mr-1" />自动布局
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-200 dark:border-slate-200 dark:border-[#334155] bg-white dark:bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]">
                    <Check className="w-3 h-3 mr-1" />验证
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT PANEL ---- */}
        <div
          className="shrink-0 border-l border-slate-200 dark:border-slate-200 dark:border-[#334155] bg-white dark:bg-white dark:bg-[#0F172A] flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: rightCollapsed ? 36 : 300 }}
        >
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="h-7 flex items-center justify-center border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] transition-colors"
          >
            {rightCollapsed ? (
              <PanelRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
            ) : (
              <div className="flex items-center justify-between w-full px-2">
                <ChevronLeft className="w-3 h-3 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("results"); }} className={`p-0.5 rounded ${rightTab === "results" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("logs"); }} className={`p-0.5 rounded ${rightTab === "logs" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
                    <Bug className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setRightTab("models"); }} className={`p-0.5 rounded ${rightTab === "models" ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-[#60A5FA]" : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"}`}>
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
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748B]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {QUERY_RESULT.executionTime}s</span>
                    <span className="flex items-center gap-1"><Table2 className="w-3 h-3" /> {QUERY_RESULT.rowCount} 行</span>
                  </div>
                  {/* Result table */}
                  <div className="overflow-auto max-h-[calc(100%-2rem)]">
                    <table className="w-full text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] sticky top-0">
                        <tr>
                          {QUERY_RESULT.columns.map((col, i) => (
                            <th
                              key={col}
                              className="px-2 py-1.5 text-left text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] font-semibold border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] cursor-pointer hover:text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] select-none whitespace-nowrap"
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
                        {sortedResultRows.map((row, ri) => (
                          <tr key={ri} className="border-b border-slate-200 dark:border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]/50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2 py-1 text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] whitespace-nowrap font-mono">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Logs */}
              {rightTab === "logs" && (
                <div className="animate-fadeIn">
                  {/* Log filter buttons */}
                  <div className="flex gap-0.5 p-1.5 border-b border-slate-200 dark:border-slate-200 dark:border-[#334155] flex-wrap">
                    {(["ALL", "INFO", "SUCCESS", "WARN", "ERROR", "DEBUG"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setLogFilter(level)}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                          logFilter === level
                            ? "bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]"
                            : "text-slate-500 dark:text-slate-500 dark:text-[#64748B] hover:text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]"
                        }`}
                      >
                        {level === "ALL" ? "全部" : level}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 space-y-1">
                    {filteredLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5 text-[11px] font-mono">
                        <span className="text-slate-500 dark:text-slate-500 dark:text-[#64748B] shrink-0">[{log.time}]</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {logLevelIcon(log.level)}
                          <span className={logLevelColor(log.level)}>{log.level}</span>
                        </span>
                        <span className="text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] break-all">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Model Management */}
              {rightTab === "models" && (
                <div className="animate-fadeIn p-2 space-y-2">
                  {MODELS.map((model) => (
                    <div key={model.id} className="bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-slate-200 dark:border-[#334155] p-3 hover:border-slate-300 dark:border-slate-300 dark:border-[#475569] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1]">{model.name}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${modelStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B] mt-0.5">{model.type} · {model.version}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] mt-1 line-clamp-2">{model.description}</div>
                      {model.metrics && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(model.metrics).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-white dark:bg-[#0F172A] text-[#60A5FA]">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B]">
                        <span>运行 {model.runCount} 次</span>
                        <span>{model.lastRunAt}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" className="h-6 text-[10px] bg-[#6366F1] hover:bg-[#4F46E5] text-white px-2">
                          <Play className="w-2.5 h-2.5 mr-1" />运行
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] px-2">
                          <GitBranchIcon className="w-2.5 h-2.5 mr-1" />对比
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] px-2">
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
      <div className="h-6 bg-white dark:bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-200 dark:border-[#334155] flex items-center px-3 gap-4 text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748B] shrink-0">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          数据库已连接
        </span>
        <span>行数: {QUERY_RESULT.rowCount}</span>
        <span>耗时: {QUERY_RESULT.executionTime}s</span>
        <div className="flex-1" />
        <span>行 {cursorLine}, 列 {cursorCol}</span>
        <span>UTF-8</span>
      </div>

      {/* ========== SANDBOX LIST MODAL ========== */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSandboxModal(false)}>
          <div
            className="bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-200 dark:border-[#334155] rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-200 dark:border-[#334155]">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-800 dark:text-[#F1F5F9]">沙箱管理</h3>
              <button onClick={() => setShowSandboxModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors">
                <X className="w-4 h-4 text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-200 dark:border-[#334155]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#64748B]" />
                <input
                  type="text"
                  value={sandboxSearch}
                  onChange={(e) => setSandboxSearch(e.target.value)}
                  placeholder="搜索沙箱名称..."
                  className="w-full bg-white dark:bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#6366F1]"
                />
              </div>
            </div>

            {/* Sandbox table */}
            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-100 dark:bg-[#1E293B]">
                  <tr className="border-b border-slate-200 dark:border-slate-200 dark:border-[#334155]">
                    {["沙箱名称", "状态", "类型", "资源规格", "创建人", "创建时间", "到期时间", "操作"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSandboxes.map((sb) => (
                    <tr key={sb.id} className="border-b border-slate-200 dark:border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548]/50 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] font-medium">{sb.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sb.status === "running" ? "bg-[#064E3B] text-[#10B981]" : "bg-slate-200 dark:bg-slate-200 dark:bg-[#334155] text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]"}`}>
                          {sb.status === "running" ? "运行中" : "已停止"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sb.type === "production" ? "bg-[#312E81] text-[#818CF8]" : "bg-[#1E3A5F] text-[#60A5FA]"}`}>
                          {sb.type === "production" ? "生产" : "开发"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 dark:text-slate-400 dark:text-[#94A3B8] font-mono text-[11px]">{sb.cpu}/{sb.memory}/{sb.storage}</td>
                      <td className="px-3 py-2.5 text-slate-400 dark:text-slate-400 dark:text-[#94A3B8]">{sb.owner}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-500 dark:text-[#64748B] text-[11px]">{sb.createdAt}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-500 dark:text-[#64748B] text-[11px]">{sb.expiresAt}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {sb.status === "running" ? (
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors" title="暂停">
                              <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                            </button>
                          ) : (
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors" title="重启">
                              <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                            </button>
                          )}
                          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors" title="删除">
                            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548] transition-colors"
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
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-200 dark:border-[#334155] flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-slate-200 dark:border-[#334155] text-slate-500 dark:text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-100 dark:bg-[#273548]" onClick={() => setShowSandboxModal(false)}>
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
