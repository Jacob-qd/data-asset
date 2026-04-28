import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight, Monitor, Cpu, MemoryStick, Wifi, AlertTriangle, Clock, Eye, Activity, Server,
  Plus, Pencil, Trash2, Download, RefreshCw, Filter, CheckCircle, BarChart3, TrendingUp,
  Zap, Shield, HardDrive, ArrowUpRight, ArrowDownRight, X, Search, BellRing, Layers
} from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

/* ── Types ── */
interface MonitorTask {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  network: number;
  status: string;
  startTime: string;
  duration: string;
  alerts: number;
}

interface AlertLog {
  id: string;
  taskId: string;
  time: string;
  level: string;
  type: string;
  detail: string;
  status: string;
  escalationTime?: string;
  escalatedTo?: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  duration: string;
  level: string;
  status: "enabled" | "disabled";
}

interface LogEntry {
  id: string;
  time: string;
  level: "INFO" | "WARN" | "ERROR" | "PROGRESS";
  taskId?: string;
  message: string;
}

interface PerformancePoint {
  time: string;
  cpu: number;
  memory: number;
  network: number;
}

/* ── Helpers ── */
const statusColor: Record<string, string> = {
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
  "已暂停": "bg-amber-50 text-amber-700 border-amber-100",
  "执行失败": "bg-red-50 text-red-700 border-red-100",
  "已终止": "bg-gray-50 text-gray-600 border-gray-200",
};

const alertLevelColor: Record<string, string> = {
  "警告": "bg-amber-50 text-amber-700 border-amber-100",
  "严重": "bg-red-50 text-red-700 border-red-100",
  "紧急": "bg-red-100 text-red-800 border-red-200",
  "信息": "bg-blue-50 text-blue-700 border-blue-100",
};

const logLevelColor: Record<string, string> = {
  "INFO": "text-emerald-600",
  "WARN": "text-amber-600",
  "ERROR": "text-red-600",
  "PROGRESS": "text-blue-600",
};

const logLevelBadge: Record<string, string> = {
  "INFO": "bg-emerald-50 text-emerald-700",
  "WARN": "bg-amber-50 text-amber-700",
  "ERROR": "bg-red-50 text-red-700",
  "PROGRESS": "bg-blue-50 text-blue-700",
};

/* ── Mock performance history generator ── */
function generateHistory(baseCpu: number, baseMem: number, baseNet: number, points: number): PerformancePoint[] {
  const arr: PerformancePoint[] = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000);
    arr.push({
      time: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
      cpu: Math.max(0, Math.min(100, Math.round(baseCpu + (Math.random() - 0.5) * 20))),
      memory: Math.max(0, Math.min(100, Math.round(baseMem + (Math.random() - 0.5) * 15))),
      network: Math.max(0, Math.min(100, Math.round(baseNet + (Math.random() - 0.5) * 25))),
    });
  }
  return arr;
}

/* ── Mock logs ── */
const initialLogs: LogEntry[] = [
  { id: "L-001", time: "2026-04-24 10:00:00", level: "INFO", taskId: "MT-001", message: "任务 MT-001 启动成功，分配资源: CPU 4核, 内存 8GB" },
  { id: "L-002", time: "2026-04-24 10:00:05", level: "INFO", taskId: "MT-001", message: "PSI协议初始化完成，开始数据预处理" },
  { id: "L-003", time: "2026-04-24 10:02:30", level: "INFO", taskId: "MT-001", message: "哈希计算完成，开始比对阶段" },
  { id: "L-004", time: "2026-04-24 10:05:00", level: "PROGRESS", taskId: "MT-001", message: "比对进度 45%，已匹配 380,000 / 845,000" },
  { id: "L-005", time: "2026-04-24 10:08:12", level: "WARN", taskId: "MT-002", message: "网络流量达到 85MB/s，触发流量告警 AL-001" },
  { id: "L-006", time: "2026-04-24 10:10:00", level: "INFO", taskId: "MT-001", message: "比对进度 67%，已匹配 566,000 / 845,000" },
  { id: "L-007", time: "2026-04-24 10:12:30", level: "INFO", taskId: "MT-001", message: "任务完成，总匹配 845,230 条，耗时 12分30秒" },
  { id: "L-008", time: "2026-04-24 09:45:00", level: "ERROR", taskId: "MT-003", message: "MPC任务CPU使用率达到92%，触发扩容策略" },
  { id: "L-009", time: "2026-04-24 09:50:00", level: "WARN", taskId: "MT-003", message: "内存使用率88%，建议优化任务配置" },
  { id: "L-010", time: "2026-04-24 09:30:00", level: "INFO", taskId: "MT-003", message: "MPC-信用评分计算 任务启动" },
  { id: "L-011", time: "2026-04-24 09:15:00", level: "INFO", taskId: "MT-006", message: "TEE-安全推理批次3 启动" },
  { id: "L-012", time: "2026-04-24 09:20:00", level: "WARN", taskId: "MT-006", message: "TEE推理任务CPU使用率达到67%" },
  { id: "L-013", time: "2026-04-24 08:45:00", level: "INFO", taskId: "MT-009", message: "MPC-跨域特征聚合 启动" },
  { id: "L-014", time: "2026-04-24 08:50:00", level: "WARN", taskId: "MT-009", message: "跨域特征聚合网络流量超过阈值 60MB/s" },
  { id: "L-015", time: "2026-04-24 08:00:00", level: "INFO", taskId: "MT-007", message: "HE-加密矩阵运算 启动" },
  { id: "L-016", time: "2026-04-24 08:30:00", level: "ERROR", taskId: "MT-007", message: "加密矩阵运算耗时超过预期" },
];

/* ── Alert rules fields ── */
const alertRuleFields: FieldConfig[] = [
  { key: "name", label: "规则名称", type: "text", required: true },
  { key: "metric", label: "指标", type: "select", options: [
    { label: "CPU使用率", value: "CPU使用率" },
    { label: "内存使用率", value: "内存使用率" },
    { label: "网络流量", value: "网络流量" },
  ]},
  { key: "threshold", label: "阈值(%)", type: "number" },
  { key: "duration", label: "持续时间", type: "text" },
  { key: "level", label: "级别", type: "select", options: [
    { label: "信息", value: "信息" },
    { label: "警告", value: "警告" },
    { label: "严重", value: "严重" },
    { label: "紧急", value: "紧急" },
  ]},
];

/* ── Sparkline component ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      grid: { top: 2, right: 2, bottom: 2, left: 2 },
      xAxis: { show: false, type: "category", data: data.map((_, i) => i) },
      yAxis: { show: false, type: "value", min: 0, max: 100 },
      series: [{
        type: "line",
        data,
        smooth: true,
        symbol: "none",
        lineStyle: { color, width: 1.5 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: color + "40" },
          { offset: 1, color: color + "00" },
        ]}},
      }],
    });
    return () => chart.dispose();
  }, [data, color]);
  return <div ref={ref} style={{ width: "100%", height: 40 }} />;
}

/* ── AreaChart component for tasks ── */
function TaskAreaChart({ data, metric, color }: { data: PerformancePoint[]; metric: "cpu" | "memory" | "network"; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis", formatter: (params: any) => {
        const p = params[0];
        return `${p.axisValue}<br/>${metric.toUpperCase()}: ${p.value}%`;
      }},
      grid: { top: 10, right: 10, bottom: 20, left: 40 },
      xAxis: { type: "category", data: data.map((d) => d.time), axisLabel: { fontSize: 10, color: "#94a3b8" } },
      yAxis: { type: "value", max: 100, axisLabel: { fontSize: 10, color: "#94a3b8" }, splitLine: { lineStyle: { color: "#f1f5f9" } } },
      series: [{
        type: "line",
        data: data.map((d) => d[metric]),
        smooth: true,
        symbol: "none",
        lineStyle: { color, width: 2 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: color + "50" },
          { offset: 1, color: color + "05" },
        ]}},
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [data, metric, color]);
  return <div ref={ref} style={{ width: "100%", height: 160 }} />;
}

/* ── TrendChart component ── */
function TrendChart({ data }: { data: { day: string; cpu: number; memory: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["平均CPU", "平均内存"], bottom: 0, textStyle: { fontSize: 12 } },
      grid: { top: 16, right: 16, bottom: 40, left: 48 },
      xAxis: { type: "category", data: data.map((d) => d.day), axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", name: "%", axisLabel: { fontSize: 11 } },
      series: [
        { name: "平均CPU", type: "line", data: data.map((d) => d.cpu), smooth: true, itemStyle: { color: "#3b82f6" }, areaStyle: { opacity: 0.1 } },
        { name: "平均内存", type: "line", data: data.map((d) => d.memory), smooth: true, itemStyle: { color: "#8b5cf6" }, areaStyle: { opacity: 0.1 } },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [data]);
  return <div ref={ref} style={{ width: "100%", height: 280 }} />;
}

/* ── Main Component ── */
export default function SecretMonitor() {
  /* ── Existing state ── */
  const [monitorTasks, setMonitorTasks] = useState<MonitorTask[]>([
    { id: "MT-001", name: "PSI-用户ID隐私求交", cpu: 78, memory: 65, network: 45, status: "运行中", startTime: "2026-04-24 10:00", duration: "12分30秒", alerts: 0 },
    { id: "MT-002", name: "PIR-用户关键词查询", cpu: 45, memory: 32, network: 89, status: "运行中", startTime: "2026-04-24 10:05", duration: "5分20秒", alerts: 1 },
    { id: "MT-003", name: "MPC-信用评分计算", cpu: 92, memory: 88, network: 23, status: "运行中", startTime: "2026-04-24 09:30", duration: "25分10秒", alerts: 2 },
    { id: "MT-004", name: "PSI-订单ID多方求交", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-005", name: "PIR-设备ID关键词查询", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-006", name: "TEE-安全推理批次3", cpu: 67, memory: 72, network: 34, status: "运行中", startTime: "2026-04-24 09:15", duration: "18分45秒", alerts: 0 },
    { id: "MT-007", name: "HE-加密矩阵运算", cpu: 0, memory: 0, network: 0, status: "已完成", startTime: "2026-04-24 08:00", duration: "30分00秒", alerts: 0 },
    { id: "MT-008", name: "ZKP-证明参数调优", cpu: 0, memory: 0, network: 0, status: "已暂停", startTime: "2026-04-24 07:30", duration: "-", alerts: 1 },
    { id: "MT-009", name: "MPC-跨域特征聚合", cpu: 85, memory: 76, network: 56, status: "运行中", startTime: "2026-04-24 08:45", duration: "22分15秒", alerts: 1 },
    { id: "MT-010", name: "PSI-基因ID隐私求交", cpu: 0, memory: 0, network: 0, status: "执行失败", startTime: "2026-04-24 07:00", duration: "-", alerts: 3 },
    { id: "MT-011", name: "PIR-医疗关键词查询", cpu: 0, memory: 0, network: 0, status: "已终止", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-012", name: "TEE-安全训练批次2", cpu: 55, memory: 48, network: 42, status: "运行中", startTime: "2026-04-24 09:50", duration: "8分10秒", alerts: 0 },
  ]);

  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([
    { id: "AL-001", taskId: "MT-002", time: "2026-04-24 10:08", level: "警告", type: "网络流量异常", detail: "PIR查询网络流量超过阈值 85MB/s", status: "已处理", escalationTime: "2026-04-24 10:18", escalatedTo: "运维组" },
    { id: "AL-002", taskId: "MT-003", time: "2026-04-24 09:45", level: "严重", type: "CPU过载", detail: "MPC任务CPU使用率达到92%，触发扩容", status: "已处理", escalationTime: "2026-04-24 09:55", escalatedTo: "SRE值班" },
    { id: "AL-003", taskId: "MT-003", time: "2026-04-24 09:50", level: "警告", type: "内存不足", detail: "内存使用率88%，建议优化任务配置", status: "待处理" },
    { id: "AL-004", taskId: "MT-009", time: "2026-04-24 09:00", level: "严重", type: "磁盘空间不足", detail: "存储使用率达到95%，请清理临时文件", status: "处理中", escalationTime: "2026-04-24 09:10", escalatedTo: "运维组" },
    { id: "AL-005", taskId: "MT-008", time: "2026-04-24 07:35", level: "信息", type: "任务执行超时", detail: "ZKP证明生成超过预期时间", status: "已忽略" },
    { id: "AL-006", taskId: "MT-010", time: "2026-04-24 07:05", level: "紧急", type: "节点离线", detail: "计算节点C连接中断，任务执行失败", status: "待处理", escalationTime: "2026-04-24 07:15", escalatedTo: "值班经理" },
    { id: "AL-007", taskId: "MT-006", time: "2026-04-24 09:20", level: "警告", type: "CPU过载", detail: "TEE推理任务CPU使用率达到67%", status: "已处理" },
    { id: "AL-008", taskId: "MT-009", time: "2026-04-24 08:50", level: "警告", type: "网络流量异常", detail: "跨域特征聚合网络流量超过阈值 60MB/s", status: "已处理" },
    { id: "AL-009", taskId: "MT-012", time: "2026-04-24 09:55", level: "信息", type: "内存不足", detail: "安全训练任务内存使用率达到48%", status: "处理中" },
    { id: "AL-010", taskId: "MT-007", time: "2026-04-24 08:30", level: "严重", type: "任务执行超时", detail: "加密矩阵运算耗时超过预期", status: "已处理", escalationTime: "2026-04-24 08:40", escalatedTo: "SRE值班" },
  ]);

  /* ── New state ── */
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    { id: "AR-001", name: "CPU高负载告警", metric: "CPU使用率", threshold: 80, duration: "5分钟", level: "严重", status: "enabled" },
    { id: "AR-002", name: "内存不足告警", metric: "内存使用率", threshold: 85, duration: "3分钟", level: "严重", status: "enabled" },
    { id: "AR-003", name: "网络流量异常", metric: "网络流量", threshold: 70, duration: "2分钟", level: "警告", status: "enabled" },
    { id: "AR-004", name: "任务执行超时", metric: "CPU使用率", threshold: 95, duration: "10分钟", level: "紧急", status: "disabled" },
    { id: "AR-005", name: "磁盘空间告警", metric: "内存使用率", threshold: 90, duration: "5分钟", level: "警告", status: "enabled" },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [logLevelFilter, setLogLevelFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
  const [logTimeFilter, setLogTimeFilter] = useState<"all" | "1h" | "6h" | "24h">("all");
  const [logKeyword, setLogKeyword] = useState("");
  const [logAutoRefresh, setLogAutoRefresh] = useState(false);

  const [timeRange, setTimeRange] = useState<"5min" | "15min" | "1hour">("5min");
  const [performanceData, setPerformanceData] = useState<Record<string, PerformancePoint[]>>(() => {
    const map: Record<string, PerformancePoint[]> = {};
    monitorTasks.forEach((t) => {
      if (t.status === "运行中") {
        map[t.id] = generateHistory(t.cpu, t.memory, t.network, 5);
      }
    });
    return map;
  });

  const [alertStatusFilter, setAlertStatusFilter] = useState<"all" | "待处理" | "处理中" | "已处理" | "已忽略">("all");
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<MonitorTask | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertLog | null>(null);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [dialogType, setDialogType] = useState<"task" | "alert" | "rule">("task");

  /* ── System metrics ── */
  const runningTasks = monitorTasks.filter((t) => t.status === "运行中");
  const avgCpu = Math.round(runningTasks.reduce((s, t) => s + t.cpu, 0) / (runningTasks.length || 1));
  const avgMem = Math.round(runningTasks.reduce((s, t) => s + t.memory, 0) / (runningTasks.length || 1));
  const avgNet = Math.round(runningTasks.reduce((s, t) => s + t.network, 0) / (runningTasks.length || 1));
  const pendingAlerts = alertLogs.filter((a) => a.status === "待处理" || a.status === "处理中").length;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - pendingAlerts * 8 - avgCpu * 0.1 - avgMem * 0.1)));
  const nodesOnline = 8;
  const nodesOffline = 2;
  const tasksPerHour = 24;
  const dataProcessed = "1.2TB";

  /* ── Real-time update ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitorTasks((prev) =>
        prev.map((t) => {
          if (t.status !== "运行中") return t;
          return {
            ...t,
            cpu: Math.max(0, Math.min(100, t.cpu + Math.round((Math.random() - 0.5) * 6))),
            memory: Math.max(0, Math.min(100, t.memory + Math.round((Math.random() - 0.5) * 4))),
            network: Math.max(0, Math.min(100, t.network + Math.round((Math.random() - 0.5) * 8))),
          };
        })
      );

      setPerformanceData((prev) => {
        const next: Record<string, PerformancePoint[]> = {};
        Object.entries(prev).forEach(([taskId, points]) => {
          const task = monitorTasks.find((t) => t.id === taskId);
          if (!task || task.status !== "运行中") return;
          const now = new Date();
          const newPoint: PerformancePoint = {
            time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
            cpu: task.cpu,
            memory: task.memory,
            network: task.network,
          };
          const maxPoints = timeRange === "5min" ? 5 : timeRange === "15min" ? 15 : 60;
          next[taskId] = [...points.slice(-maxPoints + 1), newPoint];
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [monitorTasks, timeRange]);

  /* ── Log auto-refresh ── */
  useEffect(() => {
    if (!logAutoRefresh) return;
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLogs((prev) => [
        {
          id: `L-${Date.now()}`,
          time,
          level: Math.random() > 0.8 ? "WARN" : "INFO",
          message: `自动刷新日志 - 系统状态正常 [${time}]`,
        },
        ...prev,
      ]);
    }, 10000);
    return () => clearInterval(interval);
  }, [logAutoRefresh]);

  /* ── Handlers ── */
  const filteredTasks = monitorTasks.filter((d) => d.name.includes(search) || d.id.includes(search));

  const handleCreateTask = () => {
    setDialogType("task");
    setSelectedTask(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditTask = (task: MonitorTask) => {
    setDialogType("task");
    setSelectedTask(task);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteTask = (task: MonitorTask) => {
    setDialogType("task");
    setSelectedTask(task);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleViewTask = (task: MonitorTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleTaskSubmit = (data: Partial<MonitorTask>) => {
    if (dialogMode === "create") {
      const newTask: MonitorTask = {
        id: `MT-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        cpu: Number(data.cpu) || 0,
        memory: Number(data.memory) || 0,
        network: Number(data.network) || 0,
        status: data.status || "待执行",
        startTime: data.startTime || "-",
        duration: data.duration || "-",
        alerts: 0,
      };
      setMonitorTasks([...monitorTasks, newTask]);
    } else if (dialogMode === "edit" && selectedTask) {
      setMonitorTasks(monitorTasks.map((t) => (t.id === selectedTask.id ? { ...t, ...data } : t)));
    }
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = () => {
    if (selectedTask) {
      setMonitorTasks(monitorTasks.filter((t) => t.id !== selectedTask.id));
      setAlertLogs(alertLogs.filter((a) => a.taskId !== selectedTask.id));
    }
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleCreateAlert = () => {
    setDialogType("alert");
    setSelectedAlert(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditAlert = (alert: AlertLog) => {
    setDialogType("alert");
    setSelectedAlert(alert);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteAlert = (alert: AlertLog) => {
    setDialogType("alert");
    setSelectedAlert(alert);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleViewAlert = (alert: AlertLog) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const handleAlertSubmit = (data: Partial<AlertLog>) => {
    if (dialogMode === "create") {
      const newAlert: AlertLog = {
        id: `AL-${Date.now().toString(36).toUpperCase()}`,
        taskId: data.taskId || "",
        time: data.time || "",
        level: data.level || "警告",
        type: data.type || "",
        detail: data.detail || "",
        status: data.status || "待处理",
      };
      setAlertLogs([...alertLogs, newAlert]);
    } else if (dialogMode === "edit" && selectedAlert) {
      setAlertLogs(alertLogs.map((a) => (a.id === selectedAlert.id ? { ...a, ...data } : a)));
    }
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  const handleAlertDelete = () => {
    if (selectedAlert) {
      setAlertLogs(alertLogs.filter((a) => a.id !== selectedAlert.id));
    }
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  /* ── Alert Rule handlers ── */
  const handleCreateRule = () => {
    setDialogType("rule");
    setSelectedRule(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setDialogType("rule");
    setSelectedRule(rule);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteRule = (rule: AlertRule) => {
    setDialogType("rule");
    setSelectedRule(rule);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleRuleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newRule: AlertRule = {
        id: `AR-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        metric: data.metric || "CPU使用率",
        threshold: Number(data.threshold) || 80,
        duration: data.duration || "5分钟",
        level: data.level || "警告",
        status: "enabled",
      };
      setAlertRules([...alertRules, newRule]);
    } else if (dialogMode === "edit" && selectedRule) {
      setAlertRules(alertRules.map((r) => (r.id === selectedRule.id ? { ...r, ...data, threshold: Number(data.threshold) || r.threshold } : r)));
    }
    setDialogOpen(false);
    setSelectedRule(null);
  };

  const handleRuleDelete = () => {
    if (selectedRule) {
      setAlertRules(alertRules.filter((r) => r.id !== selectedRule.id));
    }
    setDialogOpen(false);
    setSelectedRule(null);
  };

  const toggleRuleStatus = (rule: AlertRule) => {
    setAlertRules(alertRules.map((r) => (r.id === rule.id ? { ...r, status: r.status === "enabled" ? "disabled" : "enabled" } : r)));
  };

  const testRule = (rule: AlertRule) => {
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newAlert: AlertLog = {
      id: `AL-${Date.now().toString(36).toUpperCase()}`,
      taskId: "MT-TEST",
      time,
      level: rule.level,
      type: `${rule.metric}超过阈值`,
      detail: `测试触发：${rule.name} - ${rule.metric} > ${rule.threshold}%`,
      status: "待处理",
    };
    setAlertLogs([newAlert, ...alertLogs]);
  };

  /* ── Batch acknowledge ── */
  const batchAcknowledge = () => {
    setAlertLogs(alertLogs.map((a) => (selectedAlertIds.includes(a.id) ? { ...a, status: "已处理" } : a)));
    setSelectedAlertIds([]);
  };

  /* ── Log export ── */
  const exportLogs = () => {
    const content = filteredLogs.map((l) => `[${l.time}] [${l.level}] ${l.taskId ? `(${l.taskId}) ` : ""}${l.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Filtered alerts ── */
  const filteredAlerts = alertLogs.filter((a) => {
    if (alertStatusFilter !== "all" && a.status !== alertStatusFilter) return false;
    return true;
  });

  /* ── Filtered logs ── */
  const filteredLogs = logs.filter((l) => {
    if (logLevelFilter !== "ALL" && l.level !== logLevelFilter) return false;
    if (logKeyword && !l.message.includes(logKeyword) && !l.taskId?.includes(logKeyword)) return false;
    if (logTimeFilter !== "all") {
      const logTime = new Date(l.time.replace(" ", "T")).getTime();
      const now = Date.now();
      const hours = logTimeFilter === "1h" ? 1 : logTimeFilter === "6h" ? 6 : 24;
      if (now - logTime > hours * 3600000) return false;
    }
    return true;
  });

  /* ── Performance analysis data ── */
  const taskPerformance = monitorTasks
    .filter((t) => t.status === "运行中" || t.status === "已完成")
    .map((t) => ({
      id: t.id,
      name: t.name,
      avgCpu: t.cpu || Math.round(Math.random() * 60 + 20),
      avgMem: t.memory || Math.round(Math.random() * 50 + 20),
      totalTime: t.duration,
      efficiency: Math.round(Math.random() * 40 + 60),
    }));

  const trendData = [
    { day: "04-18", cpu: 45, memory: 52 },
    { day: "04-19", cpu: 52, memory: 58 },
    { day: "04-20", cpu: 48, memory: 55 },
    { day: "04-21", cpu: 60, memory: 62 },
    { day: "04-22", cpu: 55, memory: 60 },
    { day: "04-23", cpu: 58, memory: 65 },
    { day: "04-24", cpu: avgCpu, memory: avgMem },
  ];

  const slowTasks = [...taskPerformance].sort((a, b) => b.avgCpu - a.avgCpu).slice(0, 5);

  /* ── Fields for CRUD ── */
  const taskFields: FieldConfig[] = [
    { key: "name", label: "任务名称", type: "text", required: true },
    { key: "status", label: "状态", type: "select", options: [
      { label: "运行中", value: "运行中" },
      { label: "待执行", value: "待执行" },
      { label: "已完成", value: "已完成" },
      { label: "已暂停", value: "已暂停" },
      { label: "执行失败", value: "执行失败" },
      { label: "已终止", value: "已终止" },
    ]},
    { key: "cpu", label: "CPU使用率", type: "number" },
    { key: "memory", label: "内存使用率", type: "number" },
    { key: "network", label: "网络使用率", type: "number" },
    { key: "startTime", label: "开始时间", type: "text" },
    { key: "duration", label: "持续时间", type: "text" },
  ];

  const alertFields: FieldConfig[] = [
    { key: "taskId", label: "任务ID", type: "text", required: true },
    { key: "time", label: "时间", type: "text", required: true },
    { key: "level", label: "级别", type: "select", options: [
      { label: "信息", value: "信息" },
      { label: "警告", value: "警告" },
      { label: "严重", value: "严重" },
      { label: "紧急", value: "紧急" },
    ]},
    { key: "type", label: "类型", type: "select", options: [
      { label: "网络流量异常", value: "网络流量异常" },
      { label: "CPU过载", value: "CPU过载" },
      { label: "内存不足", value: "内存不足" },
      { label: "磁盘空间不足", value: "磁盘空间不足" },
      { label: "任务执行超时", value: "任务执行超时" },
      { label: "节点离线", value: "节点离线" },
    ]},
    { key: "detail", label: "详情", type: "text" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "已处理", value: "已处理" },
      { label: "待处理", value: "待处理" },
      { label: "处理中", value: "处理中" },
      { label: "已忽略", value: "已忽略" },
    ]},
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* ── Breadcrumb ── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/secret">密态计算</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>密态监控</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">密态监控</h1>
          <p className="text-sm text-gray-500 mt-1.5">任务执行实时监控（CPU/内存/网络流量）、任务异常告警、执行日志追踪</p>
        </div>
      </div>

      {/* ── System Overview Dashboard ── */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Monitor className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">监控任务</p>
              <p className="text-lg font-bold">{monitorTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-500">平均CPU</p>
              <p className="text-lg font-bold">{avgCpu}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <MemoryStick className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-sm text-gray-500">平均内存</p>
              <p className="text-lg font-bold">{avgMem}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Wifi className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">平均网络</p>
              <p className="text-lg font-bold">{avgNet}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">告警数</p>
              <p className="text-lg font-bold">{alertLogs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── System Health Dashboard Row ── */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-gray-500">系统健康分</span>
              </div>
              <span className={`text-lg font-bold ${healthScore >= 80 ? "text-emerald-600" : healthScore >= 60 ? "text-amber-600" : "text-red-600"}`}>{healthScore}</span>
            </div>
            <Progress value={healthScore} className="h-2" />
            <p className="text-xs text-gray-400 mt-1">基于告警和资源使用率计算</p>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-500">节点状态</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{nodesOnline} <span className="text-xs text-gray-400 font-normal">在线</span></p>
                <p className="text-xs text-red-500">{nodesOffline} 离线</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-500">任务吞吐</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{tasksPerHour} <span className="text-xs text-gray-400 font-normal">任务/小时</span></p>
                <p className="text-xs text-emerald-600 flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +12%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-violet-600" />
                <span className="text-sm text-gray-500">数据处理量</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{dataProcessed}</p>
                <p className="text-xs text-gray-400">今日累计</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">
            <Monitor className="h-4 w-4 mr-1" />
            任务监控
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-1" />
            告警管理
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-1" />
            执行日志
          </TabsTrigger>
          <TabsTrigger value="rules">
            <BellRing className="h-4 w-4 mr-1" />
            告警规则
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4 mr-1" />
            性能分析
          </TabsTrigger>
        </TabsList>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="mt-4 space-y-4">
          {/* Performance dashboard with sparklines */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">实时 CPU</span>
                  <span className="text-lg font-bold text-emerald-600">{avgCpu}%</span>
                </div>
                <Sparkline data={runningTasks.map((t) => t.cpu)} color="#10b981" />
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">实时 内存</span>
                  <span className="text-lg font-bold text-violet-600">{avgMem}%</span>
                </div>
                <Sparkline data={runningTasks.map((t) => t.memory)} color="#8b5cf6" />
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">实时 网络</span>
                  <span className="text-lg font-bold text-amber-600">{avgNet}%</span>
                </div>
                <Sparkline data={runningTasks.map((t) => t.network)} color="#f59e0b" />
              </CardContent>
            </Card>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">时间范围:</span>
            {(["5min", "15min", "1hour"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={timeRange === r ? "default" : "outline"}
                onClick={() => setTimeRange(r)}
                className="h-7 text-xs"
              >
                {r === "5min" ? "最近5分钟" : r === "15min" ? "最近15分钟" : "最近1小时"}
              </Button>
            ))}
          </div>

          {/* Real-time area charts */}
          <div className="grid grid-cols-2 gap-4">
            {runningTasks.map((task) => (
              <Card key={task.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{task.name}</p>
                      <p className="text-xs text-gray-500">{task.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor[task.status]}`}>{task.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <TaskAreaChart data={performanceData[task.id] || []} metric="cpu" color="#10b981" />
                    <TaskAreaChart data={performanceData[task.id] || []} metric="memory" color="#8b5cf6" />
                    <TaskAreaChart data={performanceData[task.id] || []} metric="network" color="#f59e0b" />
                  </div>
                  <div className="flex justify-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />CPU</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />内存</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />网络</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Task cards */}
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="搜索任务名称或ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm"
            />
            <Button onClick={handleCreateTask} size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建任务
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filteredTasks.map((t) => (
              <Card key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer" onClick={() => handleViewTask(t)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.id} | {t.status}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[t.status]}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
                      {t.status}
                    </span>
                  </div>
                  {t.status === "运行中" && (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>CPU</span>
                          <span>{t.cpu}%</span>
                        </div>
                        <Progress value={t.cpu} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>内存</span>
                          <span>{t.memory}%</span>
                        </div>
                        <Progress value={t.memory} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>网络</span>
                          <span>{t.network}%</span>
                        </div>
                        <Progress value={t.network} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />
                        {t.duration} | 告警: {t.alerts}
                      </div>
                    </div>
                  )}
                  {t.status === "待执行" && (
                    <div className="text-center py-4 text-gray-400">
                      <Server className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">任务等待调度</p>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleViewTask(t)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditTask(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(t)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Alerts Tab (Enhanced) ── */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">状态筛选:</span>
              {(["all", "待处理", "处理中", "已处理", "已忽略"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={alertStatusFilter === s ? "default" : "outline"}
                  onClick={() => setAlertStatusFilter(s)}
                  className="h-7 text-xs"
                >
                  {s === "all" ? "全部" : s}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {selectedAlertIds.length > 0 && (
                <Button size="sm" variant="outline" onClick={batchAcknowledge} className="h-9">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  批量确认 ({selectedAlertIds.length})
                </Button>
              )}
              <Button onClick={handleCreateAlert} size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-1" />
                新建告警
              </Button>
            </div>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  <TableHead className="w-10 py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedAlertIds.length === filteredAlerts.length && filteredAlerts.length > 0}
                      onChange={(e) => setSelectedAlertIds(e.target.checked ? filteredAlerts.map((a) => a.id) : [])}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  {["告警ID", "时间", "任务", "级别", "类型", "详情", "状态", "升级信息", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredAlerts.map((a) => (
                  <TableRow key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedAlertIds.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAlertIds([...selectedAlertIds, a.id]);
                          else setSelectedAlertIds(selectedAlertIds.filter((id) => id !== a.id));
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{a.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.time}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.taskId}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${alertLevelColor[a.level]}`}>{a.level}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.type}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.detail}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "已处理" ? "bg-emerald-50 text-emerald-700" : a.status === "已忽略" ? "bg-gray-50 text-gray-600" : "bg-amber-50 text-amber-700"}`}>{a.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">
                      {a.escalationTime ? (
                        <div>
                          <p>{a.escalationTime}</p>
                          <p className="text-gray-400">→ {a.escalatedTo}</p>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewAlert(a)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAlert(a)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(a)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Logs Tab (Enhanced) ── */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">级别:</span>
                {(["ALL", "INFO", "WARN", "ERROR"] as const).map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={logLevelFilter === l ? "default" : "outline"}
                    onClick={() => setLogLevelFilter(l)}
                    className="h-7 text-xs"
                  >
                    {l}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">时间:</span>
                {(["all", "1h", "6h", "24h"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={logTimeFilter === t ? "default" : "outline"}
                    onClick={() => setLogTimeFilter(t)}
                    className="h-7 text-xs"
                  >
                    {t === "all" ? "全部" : t === "1h" ? "1小时" : t === "6h" ? "6小时" : "24小时"}
                  </Button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索日志关键词..."
                  value={logKeyword}
                  onChange={(e) => setLogKeyword(e.target.value)}
                  className="w-48 h-8 text-sm"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => setLogAutoRefresh(!logAutoRefresh)} className={`h-8 text-xs ${logAutoRefresh ? "bg-blue-50 text-blue-700" : ""}`}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${logAutoRefresh ? "animate-spin" : ""}`} />
                自动刷新
              </Button>
              <Button size="sm" variant="outline" onClick={exportLogs} className="h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                导出
              </Button>
            </div>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <span className="text-xs text-gray-400 font-mono whitespace-nowrap mt-0.5">[{log.time}]</span>
                  <Badge className={`text-xs px-1.5 py-0.5 ${logLevelBadge[log.level]} border-0`}>{log.level}</Badge>
                  {log.taskId && <span className="text-xs text-gray-400 font-mono mt-0.5">({log.taskId})</span>}
                  <span className="text-xs text-gray-700">{log.message}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">暂无匹配日志</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ── Alert Rules Tab ── */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">告警规则配置</h3>
            <Button onClick={handleCreateRule} size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建规则
            </Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["规则ID", "规则名称", "指标", "阈值", "持续时间", "级别", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {alertRules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{rule.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm font-medium">{rule.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{rule.metric}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{rule.threshold}%</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{rule.duration}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${alertLevelColor[rule.level]}`}>{rule.level}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.status === "enabled"}
                          onCheckedChange={() => toggleRuleStatus(rule)}
                        />
                        <span className={`text-xs ${rule.status === "enabled" ? "text-emerald-600" : "text-gray-400"}`}>
                          {rule.status === "enabled" ? "启用" : "禁用"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => testRule(rule)} title="测试规则">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Performance Analysis Tab ── */}
        <TabsContent value="analysis" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  资源使用趋势
                </h3>
                <TrendChart data={trendData} />
              </CardContent>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-red-600" />
                  Top 5 高负载任务
                </h3>
                <div className="space-y-3">
                  {slowTasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{task.name}</span>
                          <span className="text-gray-500">CPU {task.avgCpu}% | 内存 {task.avgMem}%</span>
                        </div>
                        <Progress value={task.avgCpu} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">任务性能对比</h3>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow className="bg-gray-50/80 border-b border-gray-100">
                    {["任务名称", "平均CPU", "平均内存", "总耗时", "效率评分"].map((h) => (
                      <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {taskPerformance.map((t) => (
                    <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                      <TableCell className="py-3 px-4 text-sm font-medium">{t.name}</TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={t.avgCpu} className="w-16 h-1.5" />
                          <span className="text-xs">{t.avgCpu}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={t.avgMem} className="w-16 h-1.5" />
                          <span className="text-xs">{t.avgMem}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-500">{t.totalTime}</TableCell>
                      <TableCell className="py-3 px-4">
                        <span className={`text-xs font-bold ${t.efficiency >= 80 ? "text-emerald-600" : t.efficiency >= 60 ? "text-amber-600" : "text-red-600"}`}>
                          {t.efficiency}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── CRUD Dialog ── */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogType === "task"
            ? "监控任务"
            : dialogType === "alert"
            ? "告警记录"
            : "告警规则"
        }
        fields={
          dialogType === "task"
            ? taskFields
            : dialogType === "alert"
            ? alertFields
            : alertRuleFields
        }
        data={
          dialogType === "task"
            ? selectedTask || {}
            : dialogType === "alert"
            ? selectedAlert || {}
            : selectedRule || {}
        }
        mode={dialogMode}
        onSubmit={
          dialogType === "task"
            ? handleTaskSubmit
            : dialogType === "alert"
            ? handleAlertSubmit
            : handleRuleSubmit
        }
        onDelete={
          dialogType === "task"
            ? handleTaskDelete
            : dialogType === "alert"
            ? handleAlertDelete
            : handleRuleDelete
        }
      />

      {/* ── Detail Drawer ── */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedAlert ? "告警记录详情" : "监控任务详情"}
        data={selectedAlert || selectedTask || {}}
        fields={
          selectedAlert
            ? [
                { key: "id", label: "告警ID" },
                { key: "taskId", label: "任务ID" },
                { key: "time", label: "时间" },
                { key: "level", label: "级别", type: "badge" },
                { key: "type", label: "类型" },
                { key: "detail", label: "详情" },
                { key: "status", label: "状态", type: "badge" },
                ...(selectedAlert?.escalationTime
                  ? [
                      { key: "escalationTime", label: "升级时间" },
                      { key: "escalatedTo", label: "升级对象" },
                    ]
                  : []),
                ...(selectedAlert && selectedAlert.taskId
                  ? [
                      {
                        key: "_metrics",
                        label: "告警时任务指标",
                        type: "list" as const,
                      },
                    ]
                  : []),
              ]
            : [
                { key: "name", label: "任务名称" },
                { key: "id", label: "任务ID" },
                { key: "status", label: "状态", type: "badge" as const },
                { key: "cpu", label: "CPU使用率" },
                { key: "memory", label: "内存使用率" },
                { key: "network", label: "网络使用率" },
                { key: "startTime", label: "开始时间" },
                { key: "duration", label: "持续时间" },
                { key: "alerts", label: "告警数" },
              ]
        }
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedAlert) {
            handleEditAlert(selectedAlert);
          } else if (selectedTask) {
            handleEditTask(selectedTask);
          }
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedAlert) {
            handleDeleteAlert(selectedAlert);
          } else if (selectedTask) {
            handleDeleteTask(selectedTask);
          }
        }}
      />
    </div>
  );
}
