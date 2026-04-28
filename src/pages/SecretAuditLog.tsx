import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as echarts from "echarts";
import {
  Shield,
  ClipboardList,
  Search,
  Download,
  CheckCircle2,
  Fingerprint,
  Clock,
  FileText,
  Eye,
  Link2,
  Filter,
  RotateCcw,
  FileBarChart,
  Radio,
  Pause,
  Play,
  AlertTriangle,
  ChevronRight,
  XCircle,
  Ban,
} from "lucide-react";

/* ─────────────── Types ─────────────── */
type OpType = "CREATE" | "UPDATE" | "DELETE" | "EXECUTE" | "LOGIN" | "LOGOUT" | "EXPORT" | "IMPORT";
type ResourceType = "Project" | "Task" | "Key" | "Party" | "DataSource" | "Service";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type AuditStatus = "Success" | "Failed" | "Blocked";

interface AuditLog {
  id: string;
  type: string;
  opType: OpType;
  resourceType: ResourceType;
  object: string;
  operator: string;
  result: AuditStatus;
  time: string;
  ip: string;
  detail: string;
  riskLevel: RiskLevel;
}

interface EvidenceItem {
  id: string;
  hash: string;
  time: string;
  content: string;
  blockchain: string;
  status: "confirmed" | "pending";
  txHash: string;
}

interface TraceLog {
  id: string;
  operation: string;
  object: string;
  steps: string;
  duration: string;
  startTime: string;
  endTime: string;
  detailSteps: TraceStep[];
}

interface TraceStep {
  name: string;
  status: "completed" | "in_progress" | "failed" | "pending";
  timestamp: string;
  executor: string;
  detail: string;
}

interface AnomalyItem {
  id: string;
  type: string;
  description: string;
  severity: RiskLevel;
  detectedAt: string;
  operator: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
}

/* ─────────────── Mock Data ─────────────── */
const initialAuditLogs: AuditLog[] = [
  { id: "AUD-001", type: "项目创建", opType: "CREATE", resourceType: "Project", object: "项目 SC-2024-001", operator: "管理员A", result: "Success", time: "2024-04-15 09:30:12", ip: "192.168.1.100", detail: "创建密态计算项目\"金融风险评估\"", riskLevel: "Low" },
  { id: "AUD-002", type: "任务执行", opType: "EXECUTE", resourceType: "Task", object: "任务 TS-2024-045", operator: "系统", result: "Success", time: "2024-04-15 10:15:33", ip: "-", detail: "PSI任务执行完成，匹配记录12,847条", riskLevel: "Low" },
  { id: "AUD-003", type: "密钥轮换", opType: "UPDATE", resourceType: "Key", object: "密钥 KEY-003", operator: "管理员B", result: "Success", time: "2024-04-14 16:45:01", ip: "192.168.1.105", detail: "联邦学习梯度密钥自动轮换", riskLevel: "Medium" },
  { id: "AUD-004", type: "成员变更", opType: "UPDATE", resourceType: "Party", object: "项目 SC-2024-002", operator: "管理员A", result: "Success", time: "2024-04-14 14:20:18", ip: "192.168.1.100", detail: "添加参与方D到项目", riskLevel: "Low" },
  { id: "AUD-005", type: "任务取消", opType: "DELETE", resourceType: "Task", object: "任务 TS-2024-044", operator: "用户C", result: "Success", time: "2024-04-14 11:10:05", ip: "192.168.1.110", detail: "用户手动取消正在执行的PIR任务", riskLevel: "Medium" },
  { id: "AUD-006", type: "数据导出", opType: "EXPORT", resourceType: "DataSource", object: "数据源 DS-2024-012", operator: "用户D", result: "Blocked", time: "2024-04-14 08:22:47", ip: "192.168.1.112", detail: "未授权导出敏感数据表，已被安全策略拦截", riskLevel: "Critical" },
  { id: "AUD-007", type: "系统登录", opType: "LOGIN", resourceType: "Service", object: "统一认证服务", operator: "管理员A", result: "Success", time: "2024-04-15 09:00:03", ip: "192.168.1.100", detail: "通过MFA双因素认证登录", riskLevel: "Low" },
  { id: "AUD-008", type: "服务删除", opType: "DELETE", resourceType: "Service", object: "服务 SVC-2024-009", operator: "用户E", result: "Failed", time: "2024-04-13 17:45:21", ip: "192.168.1.115", detail: "尝试删除运行中的计算服务，操作失败", riskLevel: "High" },
  { id: "AUD-009", type: "数据导入", opType: "IMPORT", resourceType: "DataSource", object: "数据集 DS-2024-013", operator: "管理员B", result: "Success", time: "2024-04-13 14:10:55", ip: "192.168.1.105", detail: "导入脱敏后的测试数据集", riskLevel: "Low" },
  { id: "AUD-010", type: "系统登出", opType: "LOGOUT", resourceType: "Service", object: "统一认证服务", operator: "用户C", result: "Success", time: "2024-04-14 18:30:00", ip: "192.168.1.110", detail: "正常登出", riskLevel: "Low" },
];

const evidenceData: EvidenceItem[] = [
  { id: "EVD-001", hash: "0x8f3a2b...c4d5e6f", time: "2024-04-15 10:15:33", content: "PSI任务执行结果存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0xabc123...def456" },
  { id: "EVD-002", hash: "0x1a2b3c...4d5e6f7", time: "2024-04-15 09:30:12", content: "项目创建存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0x789abc...012def" },
  { id: "EVD-003", hash: "0x9e8d7c...6b5a4f3", time: "2024-04-14 16:45:01", content: "密钥轮换存证", blockchain: "0x7a8b9c...d0e1f2a", status: "confirmed", txHash: "0x345678...9abcdef" },
  { id: "EVD-004", hash: "0x2f4e6d...8c0a1b3", time: "2024-04-14 14:20:18", content: "成员变更存证", blockchain: "0x7a8b9c...d0e1f2a", status: "pending", txHash: "0xpending...000000" },
];

const traceLogsData: TraceLog[] = [
  {
    id: "TRC-001", operation: "任务全生命周期", object: "TS-2024-045", steps: "创建→配置→提交→执行→完成→结果存证", duration: "45分钟", startTime: "2024-04-15 09:30", endTime: "2024-04-15 10:15",
    detailSteps: [
      { name: "initiated", status: "completed", timestamp: "2024-04-15 09:30:00", executor: "用户A", detail: "用户提交任务创建请求" },
      { name: "validated", status: "completed", timestamp: "2024-04-15 09:30:05", executor: "系统", detail: "参数校验通过，权限检查通过" },
      { name: "executed", status: "completed", timestamp: "2024-04-15 09:30:12", executor: "计算节点1", detail: "任务开始执行，PSI协议启动" },
      { name: "logged", status: "completed", timestamp: "2024-04-15 10:15:33", executor: "审计系统", detail: "任务执行完成，生成审计日志 AUD-002" },
      { name: "verified", status: "completed", timestamp: "2024-04-15 10:15:40", executor: "存证系统", detail: "结果哈希上链确认，EVD-001" },
    ],
  },
  {
    id: "TRC-002", operation: "密钥使用追溯", object: "KEY-003", steps: "创建→分发→加密→解密→轮换→归档", duration: "180天", startTime: "2023-10-15", endTime: "2024-04-14",
    detailSteps: [
      { name: "initiated", status: "completed", timestamp: "2023-10-15 10:00:00", executor: "管理员B", detail: "生成新的联邦学习梯度密钥" },
      { name: "validated", status: "completed", timestamp: "2023-10-15 10:00:03", executor: "系统", detail: "密钥强度校验通过（AES-256）" },
      { name: "executed", status: "completed", timestamp: "2023-10-15 10:05:00", executor: "密钥管理系统", detail: "密钥分发给参与方A、B、C" },
      { name: "logged", status: "completed", timestamp: "2024-04-14 16:45:01", executor: "审计系统", detail: "自动轮换触发，生成日志 AUD-003" },
      { name: "verified", status: "completed", timestamp: "2024-04-14 16:45:10", executor: "存证系统", detail: "旧密钥归档，新密钥激活" },
    ],
  },
  {
    id: "TRC-003", operation: "数据授权追溯", object: "DS-2024-012", steps: "授权申请→审批→授权生效→数据使用→授权到期→回收", duration: "30天", startTime: "2024-03-15", endTime: "2024-04-14",
    detailSteps: [
      { name: "initiated", status: "completed", timestamp: "2024-03-15 09:00:00", executor: "用户C", detail: "提交数据授权申请" },
      { name: "validated", status: "completed", timestamp: "2024-03-15 14:30:00", executor: "审批人A", detail: "审批通过，有效期30天" },
      { name: "executed", status: "completed", timestamp: "2024-03-15 14:35:00", executor: "系统", detail: "授权生效，生成访问令牌" },
      { name: "logged", status: "completed", timestamp: "2024-04-14 08:22:47", executor: "审计系统", detail: "检测到未授权导出尝试，已拦截" },
      { name: "verified", status: "in_progress", timestamp: "2024-04-14 14:20:00", executor: "安全运营", detail: "授权到期回收中..." },
    ],
  },
];

const anomalyData: AnomalyItem[] = [
  { id: "ANM-001", type: "异常登录时间", description: "检测到管理员A在非工作时间（03:15）从陌生IP登录", severity: "High", detectedAt: "2024-04-15 03:16:00", operator: "管理员A", status: "open" },
  { id: "ANM-002", type: "高频操作", description: "用户D在5分钟内发起47次数据导出请求", severity: "Critical", detectedAt: "2024-04-14 08:25:12", operator: "用户D", status: "investigating" },
  { id: "ANM-003", type: "权限提升尝试", description: "用户E尝试通过API接口提升自身权限至管理员级别", severity: "Critical", detectedAt: "2024-04-13 17:40:00", operator: "用户E", status: "resolved" },
  { id: "ANM-004", type: "异常数据访问", description: "系统服务账号访问了超出权限范围的数据源", severity: "Medium", detectedAt: "2024-04-12 11:30:00", operator: "系统", status: "dismissed" },
  { id: "ANM-005", type: "会话劫持风险", description: "检测到同一账号在地理位置相距1000公里的两处同时活跃", severity: "High", detectedAt: "2024-04-10 09:45:00", operator: "管理员B", status: "open" },
];

const opTypeOptions: { label: string; value: OpType }[] = [
  { label: "CREATE", value: "CREATE" },
  { label: "UPDATE", value: "UPDATE" },
  { label: "DELETE", value: "DELETE" },
  { label: "EXECUTE", value: "EXECUTE" },
  { label: "LOGIN", value: "LOGIN" },
  { label: "LOGOUT", value: "LOGOUT" },
  { label: "EXPORT", value: "EXPORT" },
  { label: "IMPORT", value: "IMPORT" },
];

/* ─────────────── Helpers ─────────────── */
const riskColor: Record<RiskLevel, string> = {
  Low: "bg-green-50 text-green-700 border-green-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  High: "bg-orange-50 text-orange-700 border-orange-100",
  Critical: "bg-red-50 text-red-700 border-red-100",
};

const statusColor: Record<AuditStatus, string> = {
  Success: "bg-green-50 text-green-700",
  Failed: "bg-red-50 text-red-700",
  Blocked: "bg-gray-50 text-gray-700",
};

const opTypeLabelMap: Record<string, string> = {
  CREATE: "创建", UPDATE: "更新", DELETE: "删除", EXECUTE: "执行",
  LOGIN: "登录", LOGOUT: "登出", EXPORT: "导出", IMPORT: "导入",
};

/* ─────────────── Component ─────────────── */
export default function SecretAuditLog() {
  /* ── State ── */
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /* Filters */
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterOpTypes, setFilterOpTypes] = useState<OpType[]>([]);
  const [filterOperator, setFilterOperator] = useState("");
  const [filterResourceType, setFilterResourceType] = useState<string>("ALL");
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filtersApplied, setFiltersApplied] = useState(false);

  /* Detail drawer */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  /* Trace detail */
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<TraceLog | null>(null);

  /* Export */
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [exportScope, setExportScope] = useState<"filtered" | "all" | "selected">("filtered");

  /* Report generation */
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<"compliance" | "statistics" | "risk">("compliance");
  const [reportRange, setReportRange] = useState("7d");
  const [reportPreview, setReportPreview] = useState(false);
  const reportChartRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  /* Real-time streaming */
  const [isRealtime, setIsRealtime] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const realtimeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  /* ── Derived ── */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterStartDate || filterEndDate) count++;
    if (filterOpTypes.length > 0) count++;
    if (filterOperator) count++;
    if (filterResourceType !== "ALL") count++;
    if (filterRiskLevel !== "ALL") count++;
    if (filterStatus !== "ALL") count++;
    return count;
  }, [filterStartDate, filterEndDate, filterOpTypes, filterOperator, filterResourceType, filterRiskLevel, filterStatus]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch = log.id.includes(searchQuery) || log.type.includes(searchQuery) || log.operator.includes(searchQuery);
      if (!filtersApplied) return matchSearch;

      const matchStart = !filterStartDate || log.time >= filterStartDate + " 00:00:00";
      const matchEnd = !filterEndDate || log.time <= filterEndDate + " 23:59:59";
      const matchOpType = filterOpTypes.length === 0 || filterOpTypes.includes(log.opType);
      const matchOperator = !filterOperator || log.operator.includes(filterOperator);
      const matchResource = filterResourceType === "ALL" || log.resourceType === filterResourceType;
      const matchRisk = filterRiskLevel === "ALL" || log.riskLevel === filterRiskLevel;
      const matchStatus = filterStatus === "ALL" || log.result === filterStatus;

      return matchSearch && matchStart && matchEnd && matchOpType && matchOperator && matchResource && matchRisk && matchStatus;
    });
  }, [auditLogs, searchQuery, filtersApplied, filterStartDate, filterEndDate, filterOpTypes, filterOperator, filterResourceType, filterRiskLevel, filterStatus]);

  /* ── Handlers ── */
  const applyFilters = () => setFiltersApplied(true);
  const resetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterOpTypes([]);
    setFilterOperator("");
    setFilterResourceType("ALL");
    setFilterRiskLevel("ALL");
    setFilterStatus("ALL");
    setFiltersApplied(false);
  };

  const toggleRowSelect = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleViewTrace = (trace: TraceLog) => {
    setSelectedTrace(trace);
    setTraceDrawerOpen(true);
  };

  /* Export */
  const handleExport = () => {
    let data: AuditLog[] = [];
    if (exportScope === "selected") {
      data = auditLogs.filter((l) => selectedRows.has(l.id));
    } else if (exportScope === "filtered") {
      data = filteredLogs;
    } else {
      data = auditLogs;
    }

    if (exportFormat === "csv") {
      const headers = ["ID", "类型", "操作类型", "资源类型", "对象", "操作人", "结果", "时间", "IP", "详情", "风险等级"];
      const rows = data.map((l) => [l.id, l.type, l.opType, l.resourceType, l.object, l.operator, l.result, l.time, l.ip, l.detail, l.riskLevel]);
      const content = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob(["PDF export mock content"], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportOpen(false);
  };

  /* Report generation */
  const generateReport = () => {
    setReportOpen(false);
    setReportPreview(true);
  };

  useEffect(() => {
    if (!reportPreview) return;
    const charts: echarts.ECharts[] = [];

    if (reportChartRefs[0].current) {
      const c = echarts.init(reportChartRefs[0].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "10%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: ["管理员A", "管理员B", "用户C", "用户D", "用户E", "系统"] },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: [45, 32, 18, 8, 5, 62], itemStyle: { color: "#6366F1" }, barWidth: "40%" }],
      });
      charts.push(c);
    }
    if (reportChartRefs[1].current) {
      const c = echarts.init(reportChartRefs[1].current);
      c.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        series: [{ type: "pie", radius: ["40%", "70%"], label: { show: true, formatter: "{b}\n{d}%" }, data: [
          { value: 42, name: "CREATE", itemStyle: { color: "#3B82F6" } },
          { value: 28, name: "UPDATE", itemStyle: { color: "#10B981" } },
          { value: 12, name: "DELETE", itemStyle: { color: "#EF4444" } },
          { value: 8, name: "EXECUTE", itemStyle: { color: "#8B5CF6" } },
          { value: 6, name: "LOGIN", itemStyle: { color: "#F59E0B" } },
          { value: 4, name: "其他", itemStyle: { color: "#94A3B8" } },
        ] }],
      });
      charts.push(c);
    }
    if (reportChartRefs[2].current) {
      const c = echarts.init(reportChartRefs[2].current);
      c.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "10%", top: "10%", containLabel: true },
        xAxis: { type: "category", data: ["4/9", "4/10", "4/11", "4/12", "4/13", "4/14", "4/15"] },
        yAxis: { type: "value" },
        series: [{ type: "line", data: [2, 1, 3, 4, 2, 5, 1], smooth: true, itemStyle: { color: "#EF4444" }, lineStyle: { color: "#EF4444" }, areaStyle: { color: "rgba(239,68,68,0.15)" } }],
      });
      charts.push(c);
    }

    const handleResize = () => charts.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      charts.forEach((c) => c.dispose());
    };
  }, [reportPreview]);

  /* Real-time streaming */
  const addSimulatedLog = useCallback(() => {
    if (isPaused) return;
    const types: OpType[] = ["CREATE", "UPDATE", "DELETE", "EXECUTE", "LOGIN", "LOGOUT"];
    const resources: ResourceType[] = ["Project", "Task", "Key", "Party", "DataSource", "Service"];
    const risks: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
    const statuses: AuditStatus[] = ["Success", "Success", "Success", "Failed", "Blocked"];
    const operators = ["管理员A", "管理员B", "用户C", "用户D", "系统"];
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      type: opTypeLabelMap[types[Math.floor(Math.random() * types.length)]],
      opType: types[Math.floor(Math.random() * types.length)],
      resourceType: resources[Math.floor(Math.random() * resources.length)],
      object: `对象 ${Date.now().toString(36).toUpperCase().slice(0, 6)}`,
      operator: operators[Math.floor(Math.random() * operators.length)],
      result: statuses[Math.floor(Math.random() * statuses.length)],
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      ip: `192.168.1.${100 + Math.floor(Math.random() * 50)}`,
      detail: "实时流式日志条目（模拟）",
      riskLevel: risks[Math.floor(Math.random() * risks.length)],
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [isPaused]);

  useEffect(() => {
    if (isRealtime) {
      realtimeTimer.current = setInterval(addSimulatedLog, 3000);
    } else if (realtimeTimer.current) {
      clearInterval(realtimeTimer.current);
      realtimeTimer.current = null;
    }
    return () => {
      if (realtimeTimer.current) {
        clearInterval(realtimeTimer.current);
        realtimeTimer.current = null;
      }
    };
  }, [isRealtime, addSimulatedLog]);

  /* Auto-scroll on new logs when realtime is active */
  useEffect(() => {
    if (isRealtime && !isPaused && tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [auditLogs.length, isRealtime, isPaused]);

  /* ── Render helpers ── */
  const renderStepStatusIcon = (status: TraceStep["status"]) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === "in_progress") return <Clock className="w-4 h-4 text-amber-600 animate-spin" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  const renderStepStatusBadge = (status: TraceStep["status"]) => {
    if (status === "completed") return <Badge className="bg-green-50 text-green-700 text-xs">已完成</Badge>;
    if (status === "failed") return <Badge className="bg-red-50 text-red-700 text-xs">失败</Badge>;
    if (status === "in_progress") return <Badge className="bg-amber-50 text-amber-700 text-xs">进行中</Badge>;
    return <Badge className="bg-gray-50 text-gray-700 text-xs">待处理</Badge>;
  };

  return (
    <div className="space-y-6 animate-fadeIn p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">审计存证</h1>
          <p className="text-sm text-gray-500 mt-1.5">审计日志、区块链存证与操作追溯</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setExportOpen(true)}>
            <Download className="w-3.5 h-3.5" />
            导出日志
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setReportOpen(true)}>
            <FileBarChart className="w-3.5 h-3.5" />
            生成报告
          </Button>
          <Button
            size="sm"
            className={`gap-1 ${isRealtime ? "bg-red-600 hover:bg-red-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
            onClick={() => setIsRealtime((v) => !v)}
          >
            <Radio className={`w-3.5 h-3.5 ${isRealtime ? "animate-pulse" : ""}`} />
            {isRealtime ? "停止实时" : "实时模式"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{auditLogs.length.toLocaleString()}</div>
              <div className="text-xs text-gray-500">审计日志总数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">486</div>
              <div className="text-xs text-gray-500">区块链存证</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">152</div>
              <div className="text-xs text-gray-500">操作追溯</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-xs text-gray-500">存证验证通过率</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索审计日志或存证..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">开始日期</label>
            <Input type="date" className="h-9 text-sm w-40" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">结束日期</label>
            <Input type="date" className="h-9 text-sm w-40" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">操作类型</label>
            <div className="border rounded-md p-1.5 max-h-[80px] overflow-y-auto w-40 space-y-1">
              {opTypeOptions.map((opt) => {
                const selected = filterOpTypes.includes(opt.value);
                return (
                  <div key={opt.value} className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer text-xs ${selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                    onClick={() => setFilterOpTypes((prev) => selected ? prev.filter((v) => v !== opt.value) : [...prev, opt.value])}>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                      {selected && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">操作人</label>
            <Input placeholder="用户名" className="h-9 text-sm w-32" value={filterOperator} onChange={(e) => setFilterOperator(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">资源类型</label>
            <select className="h-9 px-2 text-sm border rounded-md bg-white w-32" value={filterResourceType} onChange={(e) => setFilterResourceType(e.target.value)}>
              <option value="ALL">全部</option>
              <option value="Project">Project</option>
              <option value="Task">Task</option>
              <option value="Key">Key</option>
              <option value="Party">Party</option>
              <option value="DataSource">DataSource</option>
              <option value="Service">Service</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">风险等级</label>
            <select className="h-9 px-2 text-sm border rounded-md bg-white w-28" value={filterRiskLevel} onChange={(e) => setFilterRiskLevel(e.target.value)}>
              <option value="ALL">全部</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">状态</label>
            <select className="h-9 px-2 text-sm border rounded-md bg-white w-28" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">全部</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} 个筛选
              </Badge>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={resetFilters}>
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={applyFilters}>
              <Filter className="w-3.5 h-3.5" />
              应用筛选
            </Button>
          </div>
        </div>
      </div>

      {/* Realtime controls */}
      {isRealtime && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs text-gray-600">实时流式接收中（每3秒更新）</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setIsPaused((v) => !v)}>
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? "继续" : "暂停"}
          </Button>
        </div>
      )}

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit" className="gap-2"><ClipboardList className="w-4 h-4" />审计日志</TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2"><Shield className="w-4 h-4" />区块链存证</TabsTrigger>
          <TabsTrigger value="trace" className="gap-2"><Link2 className="w-4 h-4" />操作追溯</TabsTrigger>
          <TabsTrigger value="anomaly" className="gap-2"><AlertTriangle className="w-4 h-4" />异常检测</TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">审计日志列表</CardTitle>
              {selectedRows.size > 0 && (
                <Badge variant="secondary" className="text-xs">已选择 {selectedRows.size} 条</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div ref={tableRef} className={isRealtime ? "max-h-[500px] overflow-y-auto" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input type="checkbox" className="rounded border-gray-300" onChange={(e) => {
                          if (e.target.checked) setSelectedRows(new Set(filteredLogs.map((l) => l.id)));
                          else setSelectedRows(new Set());
                        }} checked={filteredLogs.length > 0 && selectedRows.size === filteredLogs.length} />
                      </TableHead>
                      <TableHead>日志ID</TableHead>
                      <TableHead>操作类型</TableHead>
                      <TableHead>操作对象</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>结果</TableHead>
                      <TableHead>风险等级</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>IP地址</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className={isRealtime && log.id.startsWith("AUD-") && log.time > "2024-04-15" ? "bg-indigo-50/50 animate-pulse" : ""}>
                        <TableCell>
                          <input type="checkbox" className="rounded border-gray-300" checked={selectedRows.has(log.id)} onChange={() => toggleRowSelect(log.id)} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.type}</Badge>
                          <div className="text-[10px] text-gray-400 mt-0.5">{log.opType}</div>
                        </TableCell>
                        <TableCell className="font-medium text-xs">
                          {log.object}
                          <div className="text-[10px] text-gray-400 mt-0.5">{log.resourceType}</div>
                        </TableCell>
                        <TableCell>{log.operator}</TableCell>
                        <TableCell>
                          {log.result === "Success" ? (
                            <Badge className={`${statusColor.Success} gap-1`}><CheckCircle2 className="w-3 h-3" />成功</Badge>
                          ) : log.result === "Failed" ? (
                            <Badge className={`${statusColor.Failed} gap-1`}><XCircle className="w-3 h-3" />失败</Badge>
                          ) : (
                            <Badge className={`${statusColor.Blocked} gap-1`}><Ban className="w-3 h-3" />拦截</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${riskColor[log.riskLevel]}`}>{log.riskLevel}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{log.time}</TableCell>
                        <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(log)}><Eye className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredLogs.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">暂无符合条件的日志</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">区块链存证记录</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>存证ID</TableHead>
                    <TableHead>存证哈希</TableHead>
                    <TableHead>存证内容</TableHead>
                    <TableHead>存证时间</TableHead>
                    <TableHead>区块链地址</TableHead>
                    <TableHead>交易哈希</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidenceData.filter((e) => e.id.includes(searchQuery)).map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-mono text-xs">{ev.id}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.hash}</TableCell>
                      <TableCell className="font-medium text-xs">{ev.content}</TableCell>
                      <TableCell className="text-xs text-gray-500">{ev.time}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.blockchain}</TableCell>
                      <TableCell className="font-mono text-xs">{ev.txHash}</TableCell>
                      <TableCell>
                        {ev.status === "confirmed" ? (
                          <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />已确认</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 gap-1"><Clock className="w-3 h-3" />待确认</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Fingerprint className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trace Tab */}
        <TabsContent value="trace">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">操作追溯</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>追溯ID</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>流程步骤</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>结束时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traceLogsData.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell className="font-mono text-xs">{tr.id}</TableCell>
                      <TableCell><Badge variant="outline">{tr.operation}</Badge></TableCell>
                      <TableCell className="font-medium text-xs">{tr.object}</TableCell>
                      <TableCell className="text-xs max-w-[300px]">{tr.steps}</TableCell>
                      <TableCell>{tr.duration}</TableCell>
                      <TableCell className="text-xs text-gray-500">{tr.startTime}</TableCell>
                      <TableCell className="text-xs text-gray-500">{tr.endTime}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleViewTrace(tr)}>
                          <Eye className="w-3.5 h-3.5" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Tab */}
        <TabsContent value="anomaly">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">异常检测</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>异常ID</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>严重级别</TableHead>
                    <TableHead>检测时间</TableHead>
                    <TableHead>相关操作人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalyData.map((anm) => (
                    <TableRow key={anm.id}>
                      <TableCell className="font-mono text-xs">{anm.id}</TableCell>
                      <TableCell><Badge variant="outline">{anm.type}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[300px]">{anm.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${riskColor[anm.severity]}`}>{anm.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{anm.detectedAt}</TableCell>
                      <TableCell>{anm.operator}</TableCell>
                      <TableCell>
                        {anm.status === "open" ? <Badge className="bg-red-50 text-red-700 text-xs">待处理</Badge> :
                         anm.status === "investigating" ? <Badge className="bg-amber-50 text-amber-700 text-xs">调查中</Badge> :
                         anm.status === "resolved" ? <Badge className="bg-green-50 text-green-700 text-xs">已解决</Badge> :
                         <Badge className="bg-gray-50 text-gray-700 text-xs">已忽略</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Search className="w-3.5 h-3.5" />
                          调查
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DetailDrawer for audit log */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedLog ? `日志详情 - ${selectedLog.id}` : "日志详情"}
        data={selectedLog || {}}
        fields={[
          { key: "id", label: "日志ID", type: "text" as const },
          { key: "type", label: "操作类型", type: "badge" as const },
          { key: "opType", label: "操作编码", type: "badge" as const },
          { key: "resourceType", label: "资源类型", type: "badge" as const },
          { key: "object", label: "操作对象", type: "text" as const },
          { key: "operator", label: "操作人", type: "text" as const },
          { key: "result", label: "执行结果", type: "badge" as const },
          { key: "riskLevel", label: "风险等级", type: "badge" as const },
          { key: "time", label: "操作时间", type: "date" as const },
          { key: "ip", label: "IP地址", type: "text" as const },
          { key: "detail", label: "详情", type: "text" as const },
        ]}
      />

      {/* Trace Detail Drawer */}
      {traceDrawerOpen && selectedTrace && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex justify-end" onClick={() => setTraceDrawerOpen(false)}>
          <div className="bg-white w-full max-w-lg h-full shadow-xl animate-slideInRight overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">操作追溯详情 - {selectedTrace.id}</h2>
                <Button variant="ghost" size="icon" onClick={() => setTraceDrawerOpen(false)}><XCircle className="w-5 h-5" /></Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedTrace.operation} · {selectedTrace.object}</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Lifecycle timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">操作全生命周期</h3>
                <div className="space-y-0">
                  {selectedTrace.detailSteps.map((step, index) => (
                    <div key={step.name} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border flex items-center justify-center">
                          {renderStepStatusIcon(step.status)}
                        </div>
                        {index < selectedTrace.detailSteps.length - 1 && (
                          <div className={`w-0.5 flex-1 my-1 ${step.status === "completed" ? "bg-green-200" : "bg-gray-200"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {step.name === "initiated" ? "发起操作" :
                             step.name === "validated" ? "校验验证" :
                             step.name === "executed" ? "执行处理" :
                             step.name === "logged" ? "日志记录" :
                             step.name === "verified" ? "结果核验" : step.name}
                          </span>
                          {renderStepStatusBadge(step.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{step.timestamp} · {step.executor}</p>
                        <p className="text-xs text-gray-600 mt-1 bg-slate-50 rounded p-2">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related operations */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">关联操作</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 rounded p-3">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono">AUD-{Math.floor(Math.random() * 900 + 10)}</span>
                    <span>前置操作：权限校验通过</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 rounded p-3">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono">AUD-{Math.floor(Math.random() * 900 + 10)}</span>
                    <span>后置操作：结果通知推送</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {exportOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExportOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">导出日志</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">导出范围</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportScope" checked={exportScope === "filtered"} onChange={() => setExportScope("filtered")} />
                    <span className="text-sm">当前筛选结果（{filteredLogs.length} 条）</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportScope" checked={exportScope === "all"} onChange={() => setExportScope("all")} />
                    <span className="text-sm">全部日志（{auditLogs.length} 条）</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportScope" checked={exportScope === "selected"} onChange={() => setExportScope("selected")} />
                    <span className="text-sm">选中行（{selectedRows.size} 条）</span>
                  </label>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">导出格式</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportFormat" checked={exportFormat === "csv"} onChange={() => setExportFormat("csv")} />
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div><p className="text-sm font-medium">CSV</p><p className="text-xs text-gray-500">逗号分隔值</p></div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportFormat" checked={exportFormat === "json"} onChange={() => setExportFormat("json")} />
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <div><p className="text-sm font-medium">JSON</p><p className="text-xs text-gray-500">结构化数据</p></div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="exportFormat" checked={exportFormat === "pdf"} onChange={() => setExportFormat("pdf")} />
                    <FileText className="w-5 h-5 text-red-500" />
                    <div><p className="text-sm font-medium">PDF</p><p className="text-xs text-gray-500">便携式文档格式</p></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Config Dialog */}
      {reportOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">生成审计报告</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">报告类型</label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as typeof reportType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">合规摘要</SelectItem>
                    <SelectItem value="statistics">操作统计</SelectItem>
                    <SelectItem value="risk">风险分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">时间范围</label>
                <Select value={reportRange} onValueChange={setReportRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">最近24小时</SelectItem>
                    <SelectItem value="7d">最近7天</SelectItem>
                    <SelectItem value="30d">最近30天</SelectItem>
                    <SelectItem value="90d">最近90天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setReportOpen(false)}>取消</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={generateReport}>
                <FileBarChart className="w-4 h-4 mr-1" />
                生成报告
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview */}
      {reportPreview && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setReportPreview(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">审计报告预览</h3>
                <p className="text-sm text-gray-500">{reportType === "compliance" ? "合规摘要报告" : reportType === "statistics" ? "操作统计报告" : "风险分析报告"} · {reportRange === "24h" ? "最近24小时" : reportRange === "7d" ? "最近7天" : reportRange === "30d" ? "最近30天" : "最近90天"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  const blob = new Blob(["PDF report mock content"], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `audit_report_${new Date().toISOString().slice(0, 10)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download className="w-3.5 h-3.5" />
                  下载报告
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setReportPreview(false)}><XCircle className="w-5 h-5" /></Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-900">{auditLogs.length}</div><div className="text-xs text-gray-500">总操作数</div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{(auditLogs.filter((l) => l.result === "Success").length / auditLogs.length * 100).toFixed(1)}%</div><div className="text-xs text-gray-500">成功率</div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{auditLogs.filter((l) => l.riskLevel === "High" || l.riskLevel === "Critical").length}</div><div className="text-xs text-gray-500">高风险操作</div></CardContent></Card>
              </div>
              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Top 操作人</h4>
                  <div ref={reportChartRefs[0]} style={{ height: 260 }} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">操作类型分布</h4>
                  <div ref={reportChartRefs[1]} style={{ height: 260 }} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-2">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">风险趋势（7天）</h4>
                  <div ref={reportChartRefs[2]} style={{ height: 260 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
