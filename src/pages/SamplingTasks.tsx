import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Plus,
  Search,
  Play,
  Square,
  RotateCw,
  Eye,
  Trash2,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Terminal,
  BarChart3,
  FileSpreadsheet,
  FileJson,
  Table2,
  Check,
  X,
  Filter,
  ChevronDown,
  ShieldCheck,
  Box,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */

interface SamplingTask {
  id: string;
  name: string;
  ruleId: string;
  ruleName: string;
  dataSource: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  dataVolume: string;
  rowCount: number;
  startTime?: string;
  endTime?: string;
  duration?: string;
  creator: string;
  priority: "high" | "normal" | "low";
  schedule: string;
  logs: TaskLog[];
  timeline: TimelineStep[];
  resultColumns?: string[];
  resultPreview?: Record<string, unknown>[];
  qcStatus?: "pending" | "passed" | "failed" | "not_triggered";
  sentToSandbox?: boolean;
}

interface TaskLog {
  level: "ERROR" | "WARNING" | "INFO" | "DEBUG";
  message: string;
  timestamp: string;
}

interface TimelineStep {
  label: string;
  status: "done" | "active" | "pending" | "error";
  time?: string;
  detail?: string;
}

type LogLevel = "ALL" | "ERROR" | "WARNING" | "INFO" | "DEBUG";

/* ───────────────────────────────────────────────
   Helper: Status mapping
   ─────────────────────────────────────────────── */

const TASK_STATUS: Record<string, { tag: "success" | "danger" | "warning" | "info" | "disabled"; text: string; color: string }> = {
  pending: { tag: "warning", text: "待执行", color: "#F59E0B" },
  running: { tag: "info", text: "执行中", color: "#6366F1" },
  completed: { tag: "success", text: "已完成", color: "#10B981" },
  failed: { tag: "danger", text: "失败", color: "#EF4444" },
  cancelled: { tag: "disabled", text: "已取消", color: "#64748B" },
};

const DATA_SOURCES = [
  "企业工商库",
  "信用数据库",
  "医疗档案库",
  "交通流量库",
  "教育资源库",
  "社保数据库",
  "金融交易库",
  "环境监测库",
  "电商交易库",
  "物流追踪库",
] as const;

const RULES_LIST = [
  { id: "SR-001", name: "企业工商信息随机抽样" },
  { id: "SR-002", name: "信用评分数据分层抽样" },
  { id: "SR-003", name: "医疗档案系统抽样" },
  { id: "SR-004", name: "交通流量全量抽样" },
  { id: "SR-005", name: "教育数据分层抽样" },
  { id: "SR-006", name: "社保数据随机抽样" },
  { id: "SR-007", name: "金融交易分层抽样" },
  { id: "SR-008", name: "环境监测系统抽样" },
  { id: "SR-009", name: "电商交易聚类抽样" },
  { id: "SR-010", name: "物流追踪多阶段抽样" },
  { id: "SR-011", name: "企业异常条件抽样" },
  { id: "SR-012", name: "医疗字段抽样模板" },
  { id: "SR-013", name: "信用报告系统抽样" },
  { id: "SR-014", name: "教育课程随机抽样" },
  { id: "SR-015", name: "噪声数据条件抽样" },
  { id: "SR-016", name: "用户行为分层抽样" },
  { id: "SR-017", name: "仓库库存聚类抽样" },
  { id: "SR-018", name: "养老金多阶段抽样模板" },
] as const;

const CREATORS = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "冯十二"] as const;

/* ───────────────────────────────────────────────
   Mock Timeline & Logs
   ─────────────────────────────────────────────── */

function makeTimeline(status: string): TimelineStep[] {
  if (status === "pending") return [
    { label: "任务创建", status: "done", time: "10:00:00", detail: "任务已创建" },
    { label: "等待调度", status: "active", detail: "等待资源分配" },
    { label: "执行抽样", status: "pending" },
    { label: "结果输出", status: "pending" },
    { label: "任务完成", status: "pending" },
  ];
  if (status === "running") return [
    { label: "任务创建", status: "done", time: "09:30:00", detail: "任务已创建" },
    { label: "等待调度", status: "done", time: "09:30:05", detail: "调度成功" },
    { label: "执行抽样", status: "active", time: "09:30:10", detail: "正在读取数据..." },
    { label: "结果输出", status: "pending" },
    { label: "任务完成", status: "pending" },
  ];
  if (status === "completed") return [
    { label: "任务创建", status: "done", time: "08:00:00", detail: "任务已创建" },
    { label: "等待调度", status: "done", time: "08:00:03", detail: "调度成功" },
    { label: "执行抽样", status: "done", time: "08:00:15", detail: "抽样完成，10000条" },
    { label: "结果输出", status: "done", time: "08:00:45", detail: "结果写入 /data/output/task_001.csv" },
    { label: "任务完成", status: "done", time: "08:01:00", detail: "耗时 60s" },
  ];
  if (status === "failed") return [
    { label: "任务创建", status: "done", time: "07:30:00", detail: "任务已创建" },
    { label: "等待调度", status: "done", time: "07:30:02", detail: "调度成功" },
    { label: "执行抽样", status: "error", time: "07:30:08", detail: "数据源连接超时" },
    { label: "结果输出", status: "pending" },
    { label: "任务完成", status: "pending" },
  ];
  return [
    { label: "任务创建", status: "done", time: "06:00:00", detail: "任务已创建" },
    { label: "等待调度", status: "done", time: "06:00:01", detail: "调度成功" },
    { label: "执行抽样", status: "done", time: "06:00:10", detail: "已开始执行" },
    { label: "结果输出", status: "done", time: "06:00:50", detail: "部分结果已输出" },
    { label: "任务完成", status: "done", time: "06:01:00", detail: "任务已取消" },
  ];
}

function makeLogs(status: string): TaskLog[] {
  const base: TaskLog[] = [
    { level: "INFO", message: "任务初始化完成", timestamp: "2026-04-20 08:00:00" },
    { level: "INFO", message: "正在连接数据源...", timestamp: "2026-04-20 08:00:01" },
    { level: "INFO", message: "数据源连接成功", timestamp: "2026-04-20 08:00:02" },
    { level: "DEBUG", message: "SQL: SELECT * FROM enterprise_info WHERE RANDOM() < 0.1", timestamp: "2026-04-20 08:00:03" },
    { level: "INFO", message: "开始读取数据...", timestamp: "2026-04-20 08:00:05" },
    { level: "DEBUG", message: "已读取 1000/10000 条数据", timestamp: "2026-04-20 08:00:10" },
    { level: "DEBUG", message: "已读取 5000/10000 条数据", timestamp: "2026-04-20 08:00:25" },
    { level: "INFO", message: "数据读取完成，共 10000 条", timestamp: "2026-04-20 08:00:30" },
  ];
  if (status === "completed") {
    return [
      ...base,
      { level: "INFO", message: "抽样算法执行中...", timestamp: "2026-04-20 08:00:32" },
      { level: "DEBUG", message: "抽样比例: 10%, 种子值: 42", timestamp: "2026-04-20 08:00:33" },
      { level: "INFO", message: "抽样完成，抽取 1000 条记录", timestamp: "2026-04-20 08:00:40" },
      { level: "INFO", message: "正在写入结果文件...", timestamp: "2026-04-20 08:00:42" },
      { level: "INFO", message: "结果文件写入成功: /data/output/task_001.csv", timestamp: "2026-04-20 08:00:45" },
      { level: "INFO", message: "任务执行完成，总耗时: 45s", timestamp: "2026-04-20 08:00:46" },
    ];
  }
  if (status === "failed") {
    return [
      ...base.slice(0, 3),
      { level: "ERROR", message: "连接数据源失败: Connection timeout after 30000ms", timestamp: "2026-04-20 07:30:08" },
      { level: "WARNING", message: "正在尝试重连...", timestamp: "2026-04-20 07:30:10" },
      { level: "WARNING", message: "重连失败，已达到最大重试次数", timestamp: "2026-04-20 07:30:20" },
      { level: "ERROR", message: "任务执行失败，请检查数据源配置", timestamp: "2026-04-20 07:30:21" },
    ];
  }
  if (status === "running") {
    return [
      ...base,
      { level: "INFO", message: "抽样算法执行中...", timestamp: "2026-04-20 09:30:12" },
      { level: "DEBUG", message: "当前进度: 65%", timestamp: "2026-04-20 09:30:15" },
      { level: "INFO", message: "正在处理第 6500 条记录...", timestamp: "2026-04-20 09:30:18" },
    ];
  }
  return base;
}

const RESULT_COLUMNS = ["id", "name", "source", "category", "score", "status", "region", "amount", "created_at"];

function makeResultPreview(): Record<string, unknown>[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: 100000 + i,
    name: `Record_${100000 + i}`,
    source: DATA_SOURCES[i % DATA_SOURCES.length],
    category: ["A", "B", "C", "D"][i % 4],
    score: Math.round(60 + Math.random() * 40),
    status: ["active", "pending", "inactive"][i % 3],
    region: ["华东", "华北", "华南", "西南"][i % 4],
    amount: Math.round(1000 + Math.random() * 50000),
    created_at: `2026-04-${String(10 + (i % 10)).padStart(2, "0")}`,
  }));
}

/* ───────────────────────────────────────────────
   Mock Data — 24 tasks
   ─────────────────────────────────────────────── */

const MOCK_TASKS: SamplingTask[] = [
  { id: "ST-001", name: "企业工商数据抽样-20260420", ruleId: "SR-001", ruleName: "企业工商信息随机抽样", dataSource: "企业工商库", status: "completed", progress: 100, dataVolume: "12.5 MB", rowCount: 12500, startTime: "2026-04-20 08:00", endTime: "2026-04-20 08:01", duration: "60s", creator: "张三", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-002", name: "信用评分数据抽样-20260420", ruleId: "SR-002", ruleName: "信用评分数据分层抽样", dataSource: "信用数据库", status: "running", progress: 65, dataVolume: "8.2 MB", rowCount: 8200, startTime: "2026-04-20 09:30", creator: "李四", priority: "high", schedule: "immediate", logs: makeLogs("running"), timeline: makeTimeline("running") },
  { id: "ST-003", name: "医疗档案数据抽样-20260420", ruleId: "SR-003", ruleName: "医疗档案系统抽样", dataSource: "医疗档案库", status: "failed", progress: 30, dataVolume: "-", rowCount: 0, startTime: "2026-04-20 07:30", duration: "21s", creator: "王五", priority: "normal", schedule: "immediate", logs: makeLogs("failed"), timeline: makeTimeline("failed") },
  { id: "ST-004", name: "交通流量数据抽样-20260419", ruleId: "SR-004", ruleName: "交通流量全量抽样", dataSource: "交通流量库", status: "completed", progress: 100, dataVolume: "45.8 MB", rowCount: 45800, startTime: "2026-04-19 14:00", endTime: "2026-04-19 14:28", duration: "28m", creator: "赵六", priority: "low", schedule: "once", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-005", name: "教育数据抽样-20260420", ruleId: "SR-005", ruleName: "教育数据分层抽样", dataSource: "教育资源库", status: "running", progress: 42, dataVolume: "3.1 MB", rowCount: 3100, startTime: "2026-04-20 10:00", creator: "钱七", priority: "normal", schedule: "immediate", logs: makeLogs("running"), timeline: makeTimeline("running") },
  { id: "ST-006", name: "社保数据抽样-20260419", ruleId: "SR-006", ruleName: "社保数据随机抽样", dataSource: "社保数据库", status: "completed", progress: 100, dataVolume: "22.3 MB", rowCount: 22300, startTime: "2026-04-19 16:00", endTime: "2026-04-19 16:22", duration: "22m", creator: "孙八", priority: "normal", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-007", name: "金融交易抽样-20260420", ruleId: "SR-007", ruleName: "金融交易分层抽样", dataSource: "金融交易库", status: "pending", progress: 0, dataVolume: "-", rowCount: 0, creator: "周九", priority: "high", schedule: "once", logs: makeLogs("pending"), timeline: makeTimeline("pending") },
  { id: "ST-008", name: "环境监测抽样-20260420", ruleId: "SR-008", ruleName: "环境监测系统抽样", dataSource: "环境监测库", status: "pending", progress: 0, dataVolume: "-", rowCount: 0, creator: "吴十", priority: "normal", schedule: "recurring", logs: makeLogs("pending"), timeline: makeTimeline("pending") },
  { id: "ST-009", name: "电商交易聚类抽样-20260420", ruleId: "SR-009", ruleName: "电商交易聚类抽样", dataSource: "电商交易库", status: "completed", progress: 100, dataVolume: "18.7 MB", rowCount: 18700, startTime: "2026-04-20 06:00", endTime: "2026-04-20 06:15", duration: "15m", creator: "郑十一", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-010", name: "物流追踪多阶段抽样-20260419", ruleId: "SR-010", ruleName: "物流追踪多阶段抽样", dataSource: "物流追踪库", status: "completed", progress: 100, dataVolume: "31.2 MB", rowCount: 31200, startTime: "2026-04-19 20:00", endTime: "2026-04-19 20:45", duration: "45m", creator: "冯十二", priority: "low", schedule: "once", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-011", name: "企业异常数据抽样-20260420", ruleId: "SR-011", ruleName: "企业异常条件抽样", dataSource: "企业工商库", status: "pending", progress: 0, dataVolume: "-", rowCount: 0, creator: "张三", priority: "high", schedule: "immediate", logs: makeLogs("pending"), timeline: makeTimeline("pending") },
  { id: "ST-012", name: "医疗字段抽样-20260418", ruleId: "SR-012", ruleName: "医疗字段抽样模板", dataSource: "医疗档案库", status: "completed", progress: 100, dataVolume: "5.6 MB", rowCount: 5600, startTime: "2026-04-18 12:00", endTime: "2026-04-18 12:08", duration: "8m", creator: "王五", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-013", name: "信用报告抽样-20260418", ruleId: "SR-013", ruleName: "信用报告系统抽样", dataSource: "信用数据库", status: "completed", progress: 100, dataVolume: "15.3 MB", rowCount: 15300, startTime: "2026-04-18 09:00", endTime: "2026-04-18 09:18", duration: "18m", creator: "李四", priority: "normal", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-014", name: "教育课程抽样-20260417", ruleId: "SR-014", ruleName: "教育课程随机抽样", dataSource: "教育资源库", status: "completed", progress: 100, dataVolume: "2.8 MB", rowCount: 2800, startTime: "2026-04-17 15:00", endTime: "2026-04-17 15:05", duration: "5m", creator: "钱七", priority: "low", schedule: "once", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-015", name: "噪声超标数据抽样-20260417", ruleId: "SR-015", ruleName: "噪声数据条件抽样", dataSource: "环境监测库", status: "completed", progress: 100, dataVolume: "1.2 MB", rowCount: 1200, startTime: "2026-04-17 22:00", endTime: "2026-04-17 22:02", duration: "2m", creator: "吴十", priority: "normal", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-016", name: "用户行为分层抽样-20260416", ruleId: "SR-016", ruleName: "用户行为分层抽样", dataSource: "电商交易库", status: "completed", progress: 100, dataVolume: "9.5 MB", rowCount: 9500, startTime: "2026-04-16 11:00", endTime: "2026-04-16 11:12", duration: "12m", creator: "郑十一", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-017", name: "仓库库存聚类抽样-20260416", ruleId: "SR-017", ruleName: "仓库库存聚类抽样", dataSource: "物流追踪库", status: "failed", progress: 15, dataVolume: "-", rowCount: 0, startTime: "2026-04-16 08:00", duration: "5s", creator: "冯十二", priority: "high", schedule: "once", logs: makeLogs("failed"), timeline: makeTimeline("failed") },
  { id: "ST-018", name: "养老金多阶段抽样-20260415", ruleId: "SR-018", ruleName: "养老金多阶段抽样模板", dataSource: "社保数据库", status: "completed", progress: 100, dataVolume: "28.6 MB", rowCount: 28600, startTime: "2026-04-15 14:00", endTime: "2026-04-15 14:35", duration: "35m", creator: "孙八", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-019", name: "企业工商数据抽样-20260415", ruleId: "SR-001", ruleName: "企业工商信息随机抽样", dataSource: "企业工商库", status: "completed", progress: 100, dataVolume: "11.8 MB", rowCount: 11800, startTime: "2026-04-15 10:00", endTime: "2026-04-15 10:55", duration: "55m", creator: "张三", priority: "normal", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-020", name: "信用评分数据抽样-20260415", ruleId: "SR-002", ruleName: "信用评分数据分层抽样", dataSource: "信用数据库", status: "completed", progress: 100, dataVolume: "7.9 MB", rowCount: 7900, startTime: "2026-04-15 16:00", endTime: "2026-04-15 16:20", duration: "20m", creator: "李四", priority: "normal", schedule: "once", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-021", name: "医疗档案数据抽样-20260414", ruleId: "SR-003", ruleName: "医疗档案系统抽样", dataSource: "医疗档案库", status: "completed", progress: 100, dataVolume: "19.4 MB", rowCount: 19400, startTime: "2026-04-14 09:00", endTime: "2026-04-14 09:25", duration: "25m", creator: "王五", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-022", name: "交通流量数据抽样-20260414", ruleId: "SR-004", ruleName: "交通流量全量抽样", dataSource: "交通流量库", status: "cancelled", progress: 45, dataVolume: "20.5 MB", rowCount: 20500, startTime: "2026-04-14 12:00", endTime: "2026-04-14 12:30", duration: "30m", creator: "赵六", priority: "low", schedule: "once", logs: makeLogs("cancelled"), timeline: makeTimeline("cancelled") },
  { id: "ST-023", name: "教育数据抽样-20260414", ruleId: "SR-005", ruleName: "教育数据分层抽样", dataSource: "教育资源库", status: "pending", progress: 0, dataVolume: "-", rowCount: 0, creator: "钱七", priority: "normal", schedule: "immediate", logs: makeLogs("pending"), timeline: makeTimeline("pending") },
  { id: "ST-024", name: "金融交易抽样-20260413", ruleId: "SR-007", ruleName: "金融交易分层抽样", dataSource: "金融交易库", status: "completed", progress: 100, dataVolume: "35.2 MB", rowCount: 35200, startTime: "2026-04-13 08:00", endTime: "2026-04-13 08:50", duration: "50m", creator: "周九", priority: "high", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-025", name: "环境监测抽样-20260413", ruleId: "SR-008", ruleName: "环境监测系统抽样", dataSource: "环境监测库", status: "completed", progress: 100, dataVolume: "6.7 MB", rowCount: 6700, startTime: "2026-04-13 18:00", endTime: "2026-04-13 18:10", duration: "10m", creator: "吴十", priority: "normal", schedule: "recurring", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
  { id: "ST-026", name: "电商交易聚类抽样-20260413", ruleId: "SR-009", ruleName: "电商交易聚类抽样", dataSource: "电商交易库", status: "completed", progress: 100, dataVolume: "17.1 MB", rowCount: 17100, startTime: "2026-04-13 11:00", endTime: "2026-04-13 11:18", duration: "18m", creator: "郑十一", priority: "normal", schedule: "immediate", logs: makeLogs("completed"), timeline: makeTimeline("completed"), resultColumns: RESULT_COLUMNS, resultPreview: makeResultPreview() },
];

/* ───────────────────────────────────────────────
   Animated Progress Bar
   ─────────────────────────────────────────────── */

function AnimatedProgressBar({
  value,
  status,
  showValue = false,
}: {
  value: number;
  status: string;
  showValue?: boolean;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const barRef = useCallback((node: HTMLDivElement | null) => {
    if (node) requestAnimationFrame(() => setAnimatedWidth(value));
  }, [value]);

  const colorMap: Record<string, string> = {
    completed: "bg-emerald-500",
    running: "bg-primary-500",
    failed: "bg-red-500",
    pending: "bg-amber-400",
    cancelled: "bg-slate-400",
  };

  return (
    <div className="flex items-center gap-2" ref={barRef}>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorMap[status] || "bg-slate-400")}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-slate-500 font-mono w-8 text-right">{value}%</span>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Vertical Stepper (Task Timeline)
   ─────────────────────────────────────────────── */

function TaskTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors",
                step.status === "done" && "bg-emerald-500 border-emerald-500 text-white",
                step.status === "active" && "bg-primary-500 border-primary-500 text-white ring-2 ring-primary-200",
                step.status === "error" && "bg-red-500 border-red-500 text-white",
                step.status === "pending" && "bg-white dark:bg-[#1E293B] border-slate-300 dark:border-slate-600"
              )}
            >
              {step.status === "done" ? (
                <Check className="w-3.5 h-3.5" />
              ) : step.status === "error" ? (
                <X className="w-3.5 h-3.5" />
              ) : step.status === "active" ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[24px]",
                  step.status === "done" ? "bg-emerald-300" : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            )}
          </div>
          <div className={cn("pb-3", step.status === "pending" && "opacity-50")}>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{step.label}</div>
            {step.detail && <div className="text-xs text-slate-400 mt-0.5">{step.detail}</div>}
            {step.time && <div className="text-xs text-slate-400 font-mono mt-0.5">{step.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Color-coded Log Viewer
   ─────────────────────────────────────────────── */

function LogViewer({ logs }: { logs: TaskLog[] }) {
  const [filterLevel, setFilterLevel] = useState<LogLevel>("ALL");

  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    ERROR: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
    WARNING: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    INFO: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    DEBUG: { bg: "bg-slate-50 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
  };

  const filteredLogs = filterLevel === "ALL" ? logs : logs.filter((l) => l.level === filterLevel);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">日志级别:</span>
        {(["ALL", "ERROR", "WARNING", "INFO", "DEBUG"] as LogLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={cn(
              "px-2 py-0.5 rounded text-xs font-medium transition-colors",
              filterLevel === level
                ? "bg-primary-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
            )}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="bg-[#0F172A] rounded-lg overflow-hidden max-h-[360px] overflow-y-auto">
        <div className="p-3 space-y-1">
          {filteredLogs.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-4">该级别无日志</div>
          )}
          {filteredLogs.map((log, i) => (
            <div key={i} className={cn("flex items-start gap-2 text-xs py-1 px-2 rounded", levelColors[log.level].bg)}>
              <span className={cn("font-mono font-semibold shrink-0 mt-0.5", levelColors[log.level].text)}>
                [{log.level}]
              </span>
              <span className="text-slate-300 flex-1 break-all">{log.message}</span>
              <span className="text-slate-500 font-mono shrink-0 text-[10px]">{log.timestamp.split(" ")[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Stat Card (simple version)
   ─────────────────────────────────────────────── */

function TaskStatCard({
  title,
  value,
  icon,
  color,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [animated, setAnimated] = useState(false);
  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setAnimated(true);
            const numericValue = value;
            const duration = 1000;
            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              setDisplayValue(Math.round(numericValue * eased));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  }, [value, delay]);

  const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
    primary: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800", dot: "bg-indigo-500" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
    red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800", dot: "bg-red-500" },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-lg border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        c.bg,
        c.border,
        !animated && "opacity-0 translate-y-2",
        animated && "opacity-100 translate-y-0"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.bg)}>
          <span className={c.text}>{icon}</span>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</div>
          <div className={cn("text-2xl font-bold font-mono", c.text)}>
            {displayValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Export Button Component
   ─────────────────────────────────────────────── */

function ExportButtons({ onExport }: { onExport: (format: string) => void }) {
  const formats = [
    { key: "csv", label: "CSV", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "excel", label: "Excel", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { key: "json", label: "JSON", icon: <FileJson className="w-3.5 h-3.5" /> },
    { key: "parquet", label: "Parquet", icon: <Table2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">导出:</span>
      {formats.map((f) => (
        <Button
          key={f.key}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={() => onExport(f.key)}
        >
          {f.icon}
          {f.label}
        </Button>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Field Select helper
   ─────────────────────────────────────────────── */

function FieldSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 px-3 rounded-md border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all",
        className
      )}
    >
      <option value="">{placeholder || "全部"}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/* ───────────────────────────────────────────────
   Main Component
   ─────────────────────────────────────────────── */

export default function SamplingTasks() {
  const [tasks, setTasks] = useState<SamplingTask[]>(MOCK_TASKS);
  const [filtered, setFiltered] = useState<SamplingTask[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<SamplingTask | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "logs" | "results" | "stats">("overview");
  const [resultPage, setResultPage] = useState(1);
  const resultPageSize = 10;

  // New task wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardRule, setWizardRule] = useState("");
  const [wizardSchedule, setWizardSchedule] = useState("immediate");
  const [wizardCron, setWizardCron] = useState("");
  const [wizardPriority, setWizardPriority] = useState<"high" | "normal" | "low">("normal");
  const [wizardName, setWizardName] = useState("");

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<SamplingTask | null>(null);

  // Sandbox send confirm
  const [sandboxDialogOpen, setSandboxDialogOpen] = useState(false);
  const [sandboxDialogTask, setSandboxDialogTask] = useState<SamplingTask | null>(null);
  const [sentToSandboxIds, setSentToSandboxIds] = useState<Set<string>>(new Set());

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // ── Stats ──────────────────────────

  const stats = {
    pending: tasks.filter((t) => t.status === "pending").length,
    running: tasks.filter((t) => t.status === "running").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  // ── Filtering ──────────────────────

  const applyFilters = useCallback(
    (q: string, s: string, t: string, d: string, c: string) => {
      let result = tasks;
      if (q) {
        const lower = q.toLowerCase();
        result = result.filter(
          (r) =>
            r.name.toLowerCase().includes(lower) ||
            r.id.toLowerCase().includes(lower) ||
            r.dataSource.toLowerCase().includes(lower) ||
            r.ruleName.toLowerCase().includes(lower)
        );
      }
      if (s) result = result.filter((r) => r.status === s);
      if (t) result = result.filter((r) => r.ruleName === t);
      if (d) {
        const now = new Date("2026-04-20");
        if (d === "today") result = result.filter((r) => r.startTime?.startsWith("2026-04-20"));
        if (d === "yesterday") result = result.filter((r) => r.startTime?.startsWith("2026-04-19"));
        if (d === "week") {
          const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
          result = result.filter((r) => r.startTime && new Date(r.startTime) >= weekAgo);
        }
        if (d === "month") {
          const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
          result = result.filter((r) => r.startTime && new Date(r.startTime) >= monthAgo);
        }
        if (d === "quarter") {
          const quarterAgo = new Date(now); quarterAgo.setDate(quarterAgo.getDate() - 90);
          result = result.filter((r) => r.startTime && new Date(r.startTime) >= quarterAgo);
        }
      }
      if (c) result = result.filter((r) => r.creator === c);
      setFiltered(result);
    },
    [tasks]
  );

  const handleSearch = (v: string) => {
    setSearchQuery(v);
    applyFilters(v, filterStatus, filterType, filterDateRange, filterCreator);
  };

  const handleFilterChange = (type: string, value: string) => {
    let nextStatus = filterStatus, nextType = filterType, nextDate = filterDateRange, nextCreator = filterCreator;
    if (type === "status") nextStatus = value;
    if (type === "type") nextType = value;
    if (type === "date") nextDate = value;
    if (type === "creator") nextCreator = value;
    setFilterStatus(nextStatus);
    setFilterType(nextType);
    setFilterDateRange(nextDate);
    setFilterCreator(nextCreator);
    applyFilters(searchQuery, nextStatus, nextType, nextDate, nextCreator);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setFilterType("");
    setFilterDateRange("");
    setFilterCreator("");
    setFiltered(tasks);
    setShowFilters(false);
  };

  // ── Actions ────────────────────────

  const openDetail = (task: SamplingTask) => {
    setDetailTask(task);
    setDetailTab("overview");
    setResultPage(1);
    setDetailOpen(true);
  };

  const executeTask = (task: SamplingTask) => {
    const next = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: "running" as const, progress: 0, startTime: new Date().toISOString().slice(0, 16).replace("T", " ") }
        : t
    );
    setTasks(next);
    setFiltered(next);
  };

  const cancelTask = (task: SamplingTask) => {
    const next = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: "cancelled" as const, endTime: new Date().toISOString().slice(0, 16).replace("T", " ") }
        : t
    );
    setTasks(next);
    setFiltered(next);
  };

  const retryTask = (task: SamplingTask) => {
    const next = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: "pending" as const, progress: 0, startTime: undefined, endTime: undefined, duration: undefined }
        : t
    );
    setTasks(next);
    setFiltered(next);
  };

  const confirmDelete = (task: SamplingTask) => {
    setDeleteTask(task);
    setDeleteOpen(true);
  };

  const executeDelete = () => {
    if (!deleteTask) return;
    const next = tasks.filter((t) => t.id !== deleteTask.id);
    setTasks(next);
    setFiltered(next);
    setDeleteOpen(false);
    setDeleteTask(null);
  };

  const batchDelete = () => {
    const next = tasks.filter((t) => !selectedIds.has(t.id));
    setTasks(next);
    setFiltered(next);
    setSelectedIds(new Set());
    setBatchMode(false);
  };

  const createTask = () => {
    if (!wizardRule) return;
    const rule = RULES_LIST.find((r) => r.id === wizardRule);
    if (!rule) return;
    const newTask: SamplingTask = {
      id: `ST-${String(tasks.length + 1).padStart(3, "0")}`,
      name: wizardName || `${rule.name}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
      ruleId: rule.id,
      ruleName: rule.name,
      dataSource: "企业工商库",
      status: wizardSchedule === "immediate" ? "running" : "pending",
      progress: wizardSchedule === "immediate" ? 10 : 0,
      dataVolume: "-",
      rowCount: 0,
      startTime: wizardSchedule === "immediate" ? new Date().toISOString().slice(0, 16).replace("T", " ") : undefined,
      creator: "管理员",
      priority: wizardPriority,
      schedule: wizardSchedule,
      logs: makeLogs(wizardSchedule === "immediate" ? "running" : "pending"),
      timeline: makeTimeline(wizardSchedule === "immediate" ? "running" : "pending"),
    };
    const next = [newTask, ...tasks];
    setTasks(next);
    setFiltered(next);
    setWizardOpen(false);
    setWizardStep(0);
    setWizardRule("");
    setWizardName("");
    setWizardSchedule("immediate");
    setWizardPriority("normal");
  };

  const handleExport = (format: string) => {
    if (!detailTask) return;
    if (format === "csv") {
      const headers = detailTask.resultColumns || [];
      const rows = detailTask.resultPreview || [];
      const csv = [
        headers.join(","),
        ...rows.map(row => headers.map(h => String(row[h] || "")).join(","))
      ].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${detailTask.id}_结果_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
    } else {
      alert(`导出 ${format.toUpperCase()} 格式功能开发中`);
    }
  };

  const triggerQC = (task: SamplingTask) => {
    const next = tasks.map((t) =>
      t.id === task.id
        ? { ...t, qcStatus: "pending" as const }
        : t
    );
    setTasks(next);
    setFiltered(next);
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, qcStatus: "passed" as const }
            : t
        )
      );
      setFiltered((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, qcStatus: "passed" as const }
            : t
        )
      );
    }, 3000);
  };

  const openSandboxConfirm = (task: SamplingTask) => {
    setSandboxDialogTask(task);
    setSandboxDialogOpen(true);
  };

  const executeSendToSandbox = () => {
    if (!sandboxDialogTask) return;
    const taskId = sandboxDialogTask.id;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);

    const updateTask = (t: SamplingTask) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        timeline: [
          ...t.timeline,
          { label: "发送到沙箱", status: "done" as const, time: timeStr, detail: "样本数据集已成功发送到沙箱环境" },
        ],
        sentToSandbox: true,
      };
    };

    setTasks((prev) => prev.map(updateTask));
    setFiltered((prev) => prev.map(updateTask));
    setSentToSandboxIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
    setSandboxDialogOpen(false);
    setSandboxDialogTask(null);
    setToastMsg({ text: `任务 "${sandboxDialogTask.name}" 已成功发送到沙箱`, type: "success" });
  };

  // ── Table columns ──────────────────

  const columns = [
    {
      key: "name",
      title: "任务名称",
      render: (row: SamplingTask) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            {row.name}
            {sentToSandboxIds.has(row.id) && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                已入沙箱
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">{row.id}</div>
        </div>
      ),
    },
    {
      key: "ruleName",
      title: "使用规则",
      width: "160px",
      render: (row: SamplingTask) => (
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm">{row.ruleName}</span>
        </div>
      ),
    },
    {
      key: "dataSource",
      title: "数据源",
      width: "120px",
      render: (row: SamplingTask) => (
        <span className="text-sm text-slate-600">{row.dataSource}</span>
      ),
    },
    {
      key: "status",
      title: "状态",
      width: "100px",
      render: (row: SamplingTask) => {
        const st = TASK_STATUS[row.status];
        return <StatusTag status={st.tag} text={st.text} />;
      },
    },
    {
      key: "qcStatus",
      title: "质检",
      width: "90px",
      render: (row: SamplingTask) => {
        if (row.status !== "completed") return <span className="text-xs text-slate-300">-</span>;
        const qc = row.qcStatus || "not_triggered";
        const colors: Record<string, string> = {
          passed: "bg-emerald-50 text-emerald-700 border-emerald-200",
          failed: "bg-red-50 text-red-700 border-red-200",
          pending: "bg-blue-50 text-blue-700 border-blue-200",
          not_triggered: "bg-slate-50 text-slate-400 border-slate-200",
        };
        const labels: Record<string, string> = {
          passed: "已通过",
          failed: "不通过",
          pending: "质检中",
          not_triggered: "待触发",
        };
        return (
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", colors[qc])}>
            {labels[qc]}
          </span>
        );
      },
    },
    {
      key: "progress",
      title: "进度",
      width: "140px",
      render: (row: SamplingTask) => <AnimatedProgressBar value={row.progress} status={row.status} showValue />,
    },
    {
      key: "dataVolume",
      title: "数据量",
      width: "100px",
      render: (row: SamplingTask) => (
        <span className="text-sm font-mono text-slate-600">{row.dataVolume}</span>
      ),
    },
    {
      key: "startTime",
      title: "开始时间",
      width: "130px",
      render: (row: SamplingTask) => (
        <span className="text-xs text-slate-500">{row.startTime || "-"}</span>
      ),
    },
    {
      key: "duration",
      title: "耗时",
      width: "70px",
      render: (row: SamplingTask) => (
        <span className="text-xs text-slate-500 font-mono">{row.duration || "-"}</span>
      ),
    },
    {
      key: "priority",
      title: "优先级",
      width: "70px",
      render: (row: SamplingTask) => {
        const colors: Record<string, string> = {
          high: "text-red-500 bg-red-50",
          normal: "text-blue-500 bg-blue-50",
          low: "text-slate-500 bg-slate-100",
        };
        const labels: Record<string, string> = { high: "高", normal: "中", low: "低" };
        return (
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[row.priority])}>
            {labels[row.priority]}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "操作",
      width: "160px",
      render: (_row: SamplingTask, idx: number) => {
        const task = filtered[idx];
        return (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetail(task); }} title="查看详情">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            </Button>
            {task.status === "pending" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); executeTask(task); }} title="执行">
                <Play className="w-3.5 h-3.5 text-emerald-500" />
              </Button>
            )}
            {task.status === "running" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); cancelTask(task); }} title="取消">
                <Square className="w-3.5 h-3.5 text-amber-500" />
              </Button>
            )}
            {task.status === "failed" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); retryTask(task); }} title="重试">
                <RotateCw className="w-3.5 h-3.5 text-primary-500" />
              </Button>
            )}
            {task.status === "completed" && (!task.qcStatus || task.qcStatus === "not_triggered") && (
              <Button size="sm" className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={(e) => { e.stopPropagation(); triggerQC(task); }} title="触发质检">
                <ShieldCheck className="w-3 h-3" />质检
              </Button>
            )}
            {task.status === "completed" && !sentToSandboxIds.has(task.id) && (
              <Button size="sm" className="h-7 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={(e) => { e.stopPropagation(); openSandboxConfirm(task); }} title="发送到沙箱">
                <Upload className="w-3 h-3" />发送到沙箱
              </Button>
            )}
            {task.status === "completed" && sentToSandboxIds.has(task.id) && (
              <Button size="sm" className="h-7 px-2 text-xs bg-slate-200 text-slate-500 cursor-not-allowed gap-1" disabled title="已发送到沙箱">
                <Box className="w-3 h-3" />已发送到沙箱
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); confirmDelete(task); }} title="删除">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </Button>
          </div>
        );
      },
    },
  ];

  // ── Render ─────────────────────────

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">抽样任务管理</h1>
          <p className="text-sm text-slate-500 mt-1">抽样任务列表，任务状态监控、执行历史、结果查看</p>
        </div>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-primary-500 hover:bg-primary-600 text-white"
          onClick={() => {
            setWizardOpen(true);
            setWizardStep(0);
            setWizardRule("");
            setWizardName("");
            setWizardSchedule("immediate");
            setWizardPriority("normal");
          }}
        >
          <Plus className="w-4 h-4" />
          新建任务
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TaskStatCard title="待执行" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="amber" delay={0} />
        <TaskStatCard title="执行中" value={stats.running} icon={<Play className="w-5 h-5" />} color="primary" delay={100} />
        <TaskStatCard title="已完成" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} color="emerald" delay={200} />
        <TaskStatCard title="失败" value={stats.failed} icon={<AlertCircle className="w-5 h-5" />} color="red" delay={300} />
      </div>

      {/* Search + Advanced Filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索任务名称、编号、数据源..."
              className="pl-9 pr-4 h-9 text-sm dark:bg-[#1E293B] dark:border-[#334155] dark:text-slate-200"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            高级筛选
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={resetFilters}>
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </Button>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500">已选 {selectedIds.size} 项</span>
              <Button variant="outline" size="sm" className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50" onClick={batchDelete}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                批量删除
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleExport("csv")}>
                <Download className="w-3.5 h-3.5 mr-1" />
                批量导出
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedIds(new Set()); setBatchMode(false); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155] animate-slideDown">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">任务状态</label>
                <FieldSelect value={filterStatus} onChange={(v) => handleFilterChange("status", v)} options={["pending", "running", "completed", "failed", "cancelled"]} placeholder="全部状态" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">关联规则</label>
                <FieldSelect value={filterType} onChange={(v) => handleFilterChange("type", v)} options={RULES_LIST.map((r) => r.name)} placeholder="全部规则" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">日期范围</label>
                <FieldSelect value={filterDateRange} onChange={(v) => handleFilterChange("date", v)} options={["today", "yesterday", "week", "month", "quarter"]} placeholder="全部时间" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">创建人</label>
                <FieldSelect value={filterCreator} onChange={(v) => handleFilterChange("creator", v)} options={[...CREATORS]} placeholder="全部创建人" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        selectable
      />

      {/* ─── Task Detail Drawer ─── */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTask ? `${detailTask.name}` : "任务详情"}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <ExportButtons onExport={handleExport} />
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>
              关闭
            </Button>
          </div>
        }
      >
        {detailTask && (
          <div className="space-y-5">
            {/* Detail Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1E293B] rounded-lg">
              {([
                { key: "overview", label: "概览", icon: <BarChart3 className="w-3.5 h-3.5" /> },
                { key: "logs", label: "执行日志", icon: <Terminal className="w-3.5 h-3.5" /> },
                { key: "results", label: "结果预览", icon: <Table2 className="w-3.5 h-3.5" /> },
                { key: "stats", label: "统计", icon: <BarChart3 className="w-3.5 h-3.5" /> },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center",
                    detailTab === tab.key
                      ? "bg-white dark:bg-[#273548] text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Overview Tab ─── */}
            {detailTab === "overview" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const st = TASK_STATUS[detailTask.status];
                    return <StatusTag status={st.tag} text={st.text} />;
                  })()}
                  <AnimatedProgressBar value={detailTask.progress} status={detailTask.status} showValue />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg">
                  <div>
                    <div className="text-xs text-slate-400">任务编号</div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-200">{detailTask.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">使用规则</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{detailTask.ruleName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">数据源</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{detailTask.dataSource}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">数据量</div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-200">{detailTask.dataVolume} ({detailTask.rowCount.toLocaleString()} 行)</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">开始时间</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{detailTask.startTime || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">结束时间</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{detailTask.endTime || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">耗时</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{detailTask.duration || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">优先级</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                      {{ high: "高", normal: "中", low: "低" }[detailTask.priority]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">调度方式</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                      {{ immediate: "立即执行", once: "定时执行", recurring: "周期性" }[detailTask.schedule]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">创建人</div>
                    <div className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">{detailTask.creator[0]}</div>
                      {detailTask.creator}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">执行进度</h4>
                  <TaskTimeline steps={detailTask.timeline} />
                </div>
              </div>
            )}

            {/* ─── Logs Tab ─── */}
            {detailTab === "logs" && (
              <div className="animate-fadeIn">
                <LogViewer logs={detailTask.logs} />
              </div>
            )}

            {/* ─── Results Tab ─── */}
            {detailTab === "results" && (
              <div className="space-y-3 animate-fadeIn">
                {detailTask.resultPreview && detailTask.resultPreview.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        共 {detailTask.rowCount.toLocaleString()} 行，第 {resultPage} / {Math.ceil((detailTask.resultPreview?.length || 0) / resultPageSize)} 页
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#334155]">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 dark:bg-[#1E293B] text-slate-500 sticky top-0">
                          <tr>
                            {detailTask.resultColumns?.map((col) => (
                              <th key={col} className="px-3 py-2 text-left font-medium border-b border-slate-200 dark:border-[#334155] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detailTask.resultPreview
                            .slice((resultPage - 1) * resultPageSize, resultPage * resultPageSize)
                            .map((row, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-[#334155]/50 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                              {detailTask.resultColumns?.map((col) => (
                                <td key={col} className="px-3 py-2 whitespace-nowrap">
                                  {typeof row[col] === "number" ? (
                                    <span className="font-mono">{String(row[col])}</span>
                                  ) : (
                                    <span>{String(row[col])}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={resultPage <= 1}
                        onClick={() => setResultPage((p) => p - 1)}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <span className="text-xs text-slate-500">
                        {resultPage} / {Math.ceil((detailTask.resultPreview?.length || 0) / resultPageSize)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={resultPage >= Math.ceil((detailTask.resultPreview?.length || 0) / resultPageSize)}
                        onClick={() => setResultPage((p) => p + 1)}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">任务尚未完成，暂无结果数据</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Stats Tab ─── */}
            {detailTab === "stats" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg text-center">
                    <div className="text-xs text-slate-400">数据总量</div>
                    <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">{detailTask.dataVolume}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{detailTask.rowCount.toLocaleString()} 行</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg text-center">
                    <div className="text-xs text-slate-400">执行耗时</div>
                    <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">{detailTask.duration || "-"}</div>
                    <div className="text-xs text-slate-400 mt-0.5">总时间</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg text-center">
                    <div className="text-xs text-slate-400">处理速度</div>
                    <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                      {detailTask.duration && detailTask.rowCount > 0
                        ? `${Math.round(detailTask.rowCount / (parseInt(detailTask.duration) || 1)).toLocaleString()}`
                        : "-"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">行/秒</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">资源消耗</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">CPU 使用率</span>
                        <span className="text-slate-700 font-mono">45%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: "45%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">内存使用</span>
                        <span className="text-slate-700 font-mono">2.3 GB / 8 GB</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: "28.75%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">磁盘 I/O</span>
                        <span className="text-slate-700 font-mono">150 MB/s</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: "60%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">网络带宽</span>
                        <span className="text-slate-700 font-mono">85 MB/s</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: "42.5%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ─── New Task Wizard ─── */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建抽样任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {["选择规则", "配置调度"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    i < wizardStep && "bg-emerald-500 text-white",
                    i === wizardStep && "bg-primary-500 text-white",
                    i > wizardStep && "bg-slate-200 text-slate-500"
                  )}
                >
                  {i < wizardStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium", i <= wizardStep ? "text-slate-700" : "text-slate-400")}>{step}</span>
                {i < 1 && <div className={cn("w-8 h-0.5 rounded", i < wizardStep ? "bg-emerald-500" : "bg-slate-200")} />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Rule */}
          {wizardStep === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  任务名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={wizardName}
                  onChange={(e) => setWizardName(e.target.value)}
                  placeholder="请输入任务名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  选择抽样规则 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {RULES_LIST.map((rule) => (
                    <button
                      key={rule.id}
                      onClick={() => setWizardRule(rule.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        wizardRule === rule.id
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                          : "border-slate-200 dark:border-[#334155] hover:border-primary-300"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        wizardRule === rule.id ? "border-primary-500 bg-primary-500" : "border-slate-300"
                      )}>
                        {wizardRule === rule.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{rule.name}</div>
                        <div className="text-xs text-slate-400">{rule.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">优先级</label>
                <div className="flex gap-2">
                  {([
                    { key: "high", label: "高", color: "border-red-300 text-red-600 hover:bg-red-50", active: "bg-red-500 text-white border-red-500" },
                    { key: "normal", label: "中", color: "border-blue-300 text-blue-600 hover:bg-blue-50", active: "bg-blue-500 text-white border-blue-500" },
                    { key: "low", label: "低", color: "border-slate-300 text-slate-600 hover:bg-slate-50", active: "bg-slate-500 text-white border-slate-500" },
                  ] as const).map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setWizardPriority(p.key)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                        wizardPriority === p.key ? p.active : p.color
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">调度方式</label>
                <div className="space-y-2">
                  {[
                    { key: "immediate", label: "立即执行", desc: "任务创建后立即开始执行" },
                    { key: "once", label: "定时执行", desc: "在指定时间执行一次" },
                    { key: "recurring", label: "周期性执行", desc: "按Cron表达式周期性执行" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        wizardSchedule === opt.key
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-slate-200 dark:border-[#334155] hover:border-primary-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="wizardSchedule"
                        value={opt.key}
                        checked={wizardSchedule === opt.key}
                        onChange={(e) => setWizardSchedule(e.target.value)}
                        className="text-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{opt.label}</div>
                        <div className="text-xs text-slate-400">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {wizardSchedule === "recurring" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cron 表达式</label>
                  <Input
                    value={wizardCron}
                    onChange={(e) => setWizardCron(e.target.value)}
                    placeholder="0 0 2 * * ?"
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">示例: 0 0 2 * * ? 表示每天凌晨2点执行</p>
                </div>
              )}
              {wizardSchedule === "once" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">执行时间</label>
                  <Input type="datetime-local" defaultValue="2026-04-21T02:00" className="font-mono" />
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-slate-50 dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-[#334155]">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">任务摘要</h4>
                <div className="space-y-1 text-xs text-slate-500">
                  <div>任务名称: <span className="text-slate-700 dark:text-slate-300">{wizardName || "-"}</span></div>
                  <div>使用规则: <span className="text-slate-700 dark:text-slate-300">{RULES_LIST.find((r) => r.id === wizardRule)?.name || "-"}</span></div>
                  <div>优先级: <span className="text-slate-700 dark:text-slate-300">{{ high: "高", normal: "中", low: "低" }[wizardPriority]}</span></div>
                  <div>调度方式: <span className="text-slate-700 dark:text-slate-300">{{ immediate: "立即执行", once: "定时执行", recurring: "周期性" }[wizardSchedule]}</span></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex items-center justify-between w-full sm:justify-between">
            <div>
              {wizardStep > 0 && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setWizardStep(wizardStep - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setWizardOpen(false)}>
                取消
              </Button>
              {wizardStep < 1 ? (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={() => {
                  if (wizardStep === 0 && !wizardRule) return;
                  if (wizardStep === 0 && !wizardName.trim()) return;
                  setWizardStep(wizardStep + 1);
                }}>
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={createTask}>
                  创建任务
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
      </Dialog>

      {/* ─── Sandbox Confirm Modal ─── */}
      <Modal
        open={sandboxDialogOpen}
        onClose={() => setSandboxDialogOpen(false)}
        title="确认发送到沙箱"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSandboxDialogOpen(false)}>
              取消
            </Button>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={executeSendToSandbox}>
              <Upload className="w-3.5 h-3.5" />
              确认发送
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <Box className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              确定要将任务 <strong>"{sandboxDialogTask?.name}"</strong> 的样本数据集发送到沙箱吗？
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <div>任务编号: <span className="text-slate-700 dark:text-slate-300">{sandboxDialogTask?.id}</span></div>
              <div>数据源: <span className="text-slate-700 dark:text-slate-300">{sandboxDialogTask?.dataSource}</span></div>
              <div>数据量: <span className="text-slate-700 dark:text-slate-300">{sandboxDialogTask?.dataVolume} ({sandboxDialogTask?.rowCount.toLocaleString()} 行)</span></div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Delete Confirm Modal ─── */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="确认删除"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-1" onClick={executeDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              确认删除
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              确定要删除任务 <strong>"{deleteTask?.name}"</strong> 吗？
            </p>
            <p className="text-xs text-slate-400 mt-1">此操作不可恢复。</p>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm animate-fadeIn",
            toastMsg.type === "success" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
          )}>
            <CheckCircle className="w-4 h-4" />
            {toastMsg.text}
          </div>
        </div>
      )}
    </div>
  );
}
