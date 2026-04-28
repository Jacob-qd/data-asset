import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Blocks,
  Server,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  Zap,
  HardDrive,
  Network,
  ShieldCheck,
  FileText,
  ChevronRight,
  Plus,
  FileSignature,
  Eye,
  Bell,
  CheckCheck,
  Filter,
  FileCode2,
  StickyNote,
  Cog,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type FieldConfig, CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

/* ─── Types ─── */
type AlertLevel = "critical" | "warning" | "info" | "notice" | "debug" | "emergency" | "fatal";
type AlertStatus = "unhandled" | "handled" | "processing" | "escalated" | "ignored";
type TimeRange = "5m" | "15m" | "1h";
type OpType = "deploy" | "call" | "notary" | "trace";

interface AlertRecord {
  id: string;
  level: AlertLevel;
  content: string;
  time: string;
  status: AlertStatus;
}

interface ActivityItem {
  id: string;
  time: string;
  type: OpType;
  actor: string;
  target: string;
  status: "success" | "failed" | "pending";
}

/* ─── Mock Data ─── */
const chainStats = [
  { label: "区块高度", value: "4,285,691", change: "+1,248", icon: <Blocks className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  { label: "交易总数", value: "2,847,391", change: "+3,521", icon: <Zap className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "共识节点", value: "10", change: "9正常 1警告", icon: <Server className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/30" },
  { label: "当前TPS", value: "2,847", change: "峰值3,500", icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
];

const componentStatus = [
  { name: "共识服务", status: "normal", latency: "12ms", uptime: "99.98%", detail: "PBFT共识运行正常" },
  { name: "网络通信", status: "normal", latency: "8ms", uptime: "99.95%", detail: "P2P网络连接稳定" },
  { name: "存储引擎", status: "normal", latency: "25ms", uptime: "99.92%", detail: "LevelDB读写正常" },
  { name: "状态数据库", status: "warning", latency: "45ms", uptime: "98.50%", detail: "内存使用率82%" },
  { name: "交易池", status: "normal", latency: "3ms", uptime: "99.99%", detail: "待处理交易:156" },
  { name: "区块生成", status: "normal", latency: "5ms", uptime: "99.97%", detail: "出块间隔:5s" },
  { name: "加密服务", status: "normal", latency: "2ms", uptime: "100%", detail: "SM2/SM3运行正常" },
  { name: "证书管理", status: "normal", latency: "1ms", uptime: "100%", detail: "证书未过期" },
];

const tpsHistory = [
  { time: "00:00", value: 1200 },
  { time: "02:00", value: 980 },
  { time: "04:00", value: 850 },
  { time: "06:00", value: 1500 },
  { time: "08:00", value: 2800 },
  { time: "10:00", value: 3500 },
  { time: "12:00", value: 3200 },
  { time: "14:00", value: 2847 },
  { time: "16:00", value: 2600 },
  { time: "18:00", value: 2100 },
  { time: "20:00", value: 1800 },
  { time: "22:00", value: 1400 },
];

const alertFields: FieldConfig[] = [
  { key: "id", label: "告警编号", type: "text", required: true, placeholder: "例如：ALT-006" },
  { key: "level", label: "级别", type: "select", required: true, options: [
    { label: "严重", value: "critical" },
    { label: "警告", value: "warning" },
    { label: "信息", value: "info" },
    { label: "提示", value: "notice" },
    { label: "调试", value: "debug" },
    { label: "紧急", value: "emergency" },
  ]},
  { key: "content", label: "内容", type: "textarea", required: true, placeholder: "告警内容描述" },
  { key: "time", label: "时间", type: "text", required: true, placeholder: "2025-04-22 14:30:00" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "未处理", value: "unhandled" },
    { label: "处理中", value: "processing" },
    { label: "已处理", value: "handled" },
    { label: "已忽略", value: "ignored" },
    { label: "已升级", value: "escalated" },
  ]},
];

const detailFields = [
  { key: "id", label: "告警编号", type: "text" as const },
  { key: "level", label: "级别", type: "badge" as const },
  { key: "content", label: "内容", type: "text" as const },
  { key: "time", label: "时间", type: "date" as const },
  { key: "status", label: "状态", type: "badge" as const },
];

/* ─── Helper ─── */
function getLevelLabel(level: AlertLevel): string {
  const map: Record<string, string> = {
    critical: "严重", warning: "警告", info: "信息", notice: "提示",
    debug: "调试", emergency: "紧急", fatal: "致命",
  };
  return map[level] || level;
}

function getLevelBadgeClass(level: AlertLevel): string {
  const map: Record<string, string> = {
    critical: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    notice: "bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400",
    debug: "bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
    emergency: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    fatal: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  return map[level] || map.info;
}

function getStatusLabel(status: AlertStatus): string {
  const map: Record<string, string> = {
    handled: "已处理", unhandled: "未处理", processing: "处理中",
    escalated: "已升级", ignored: "已忽略",
  };
  return map[status] || status;
}

function getOpTypeLabel(type: OpType): string {
  const map: Record<string, string> = {
    deploy: "合约部署", call: "合约调用", notary: "存证", trace: "溯源",
  };
  return map[type] || type;
}

function getOpTypeColor(type: OpType): string {
  const map: Record<string, string> = {
    deploy: "text-violet-600 bg-violet-50 dark:bg-violet-900/30",
    call: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
    notary: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
    trace: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
  };
  return map[type] || map.call;
}

function getStatusDot(status: string): string {
  const map: Record<string, string> = {
    success: "bg-emerald-500",
    failed: "bg-red-500",
    pending: "bg-amber-500",
  };
  return map[status] || "bg-slate-400";
}

function generateId(): string {
  return Date.now().toString(36).toUpperCase();
}

/* ─── Component ─── */
export default function BlockchainOverview() {
  /* ── State ── */
  const [alerts, setAlerts] = useState<AlertRecord[]>([
    { id: "ALT-001", level: "warning", content: "状态数据库内存使用率超过80%", time: "2025-04-22 14:30:00", status: "unhandled" },
    { id: "ALT-002", level: "info", content: "节点node-04网络延迟升高至45ms", time: "2025-04-22 13:15:00", status: "handled" },
    { id: "ALT-003", level: "critical", content: "存储节点-03离线超过10分钟", time: "2025-04-22 12:48:00", status: "handled" },
    { id: "ALT-004", level: "info", content: "智能合约DataSharing完成升级", time: "2025-04-22 11:20:00", status: "handled" },
    { id: "ALT-005", level: "warning", content: "交易池待处理交易数超过阈值", time: "2025-04-22 10:05:00", status: "handled" },
    { id: "ALT-006", level: "critical", content: "共识节点-02 CPU使用率超过90%", time: "2025-04-22 09:30:00", status: "processing" },
    { id: "ALT-007", level: "notice", content: "节点node-08磁盘空间使用率85%", time: "2025-04-22 08:45:00", status: "unhandled" },
    { id: "ALT-008", level: "info", content: "系统备份任务完成", time: "2025-04-22 08:00:00", status: "handled" },
    { id: "ALT-009", level: "warning", content: "跨链路由延迟超过3秒", time: "2025-04-22 07:30:00", status: "escalated" },
    { id: "ALT-010", level: "debug", content: "日志清理任务执行完成", time: "2025-04-22 06:00:00", status: "ignored" },
  ]);

  const [perfTimeRange, setPerfTimeRange] = useState<TimeRange>("5m");
  const [perfData, setPerfData] = useState({
    tps: Array.from({ length: 60 }, (_, i) => ({
      time: `${String(Math.floor(i / 12)).padStart(2, "0")}:${String((i % 12) * 5).padStart(2, "0")}`,
      value: 2000 + Math.random() * 1000,
    })),
    blockTime: Array.from({ length: 60 }, (_, i) => ({
      time: `${String(Math.floor(i / 12)).padStart(2, "0")}:${String((i % 12) * 5).padStart(2, "0")}`,
      value: 4 + Math.random() * 2,
    })),
    confirmTime: Array.from({ length: 60 }, (_, i) => ({
      time: `${String(Math.floor(i / 12)).padStart(2, "0")}:${String((i % 12) * 5).padStart(2, "0")}`,
      value: 1 + Math.random() * 3,
    })),
  });

  const [nodeHealth, setNodeHealth] = useState({ online: 42, offline: 3, error: 2 });

  const [trafficData, setTrafficData] = useState({
    inbound: Array.from({ length: 60 }, (_, i) => ({
      time: `${String(Math.floor(i / 12)).padStart(2, "0")}:${String((i % 12) * 5).padStart(2, "0")}`,
      value: 50 + Math.random() * 100,
    })),
    outbound: Array.from({ length: 60 }, (_, i) => ({
      time: `${String(Math.floor(i / 12)).padStart(2, "0")}:${String((i % 12) * 5).padStart(2, "0")}`,
      value: 30 + Math.random() * 80,
    })),
  });

  const [onChainStats] = useState({
    todayTx: "12,847",
    activeAccounts: "3,521",
    contractCalls: "8,932",
  });

  const [contractDist] = useState([
    { name: "Solidity", value: 45 },
    { name: "Go", value: 30 },
    { name: "Java", value: 15 },
    { name: "Other", value: 10 },
  ]);

  const [notaryTrend] = useState([
    { day: "04-16", value: 1200 },
    { day: "04-17", value: 1350 },
    { day: "04-18", value: 1180 },
    { day: "04-19", value: 1520 },
    { day: "04-20", value: 1680 },
    { day: "04-21", value: 1450 },
    { day: "04-22", value: 1720 },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: generateId(), time: "14:32:15", type: "deploy", actor: "0x7a3f...9c2b", target: "SupplyChain", status: "success" },
    { id: generateId(), time: "14:28:42", type: "call", actor: "0x4d2e...1a8f", target: "DataSharing", status: "success" },
    { id: generateId(), time: "14:25:10", type: "notary", actor: "0x9b1c...3e7d", target: "DocHash#4421", status: "success" },
    { id: generateId(), time: "14:20:55", type: "trace", actor: "0x2f8a...5c1e", target: "Product#8823", status: "pending" },
    { id: generateId(), time: "14:15:33", type: "call", actor: "0x6e4b...7d2a", target: "TokenERC20", status: "success" },
    { id: generateId(), time: "14:10:18", type: "deploy", actor: "0x3c9d...8f4b", target: "InsuranceClaim", status: "failed" },
    { id: generateId(), time: "14:05:47", type: "notary", actor: "0x1a7e...6c3f", target: "DocHash#4420", status: "success" },
    { id: generateId(), time: "14:01:22", type: "trace", actor: "0x5d2b...9e1c", target: "Product#8822", status: "success" },
    { id: generateId(), time: "13:55:09", type: "call", actor: "0x8f3c...2a7d", target: "DataSharing", status: "success" },
    { id: generateId(), time: "13:50:44", type: "deploy", actor: "0x4e1a...7b3c", target: "CrossChainBridge", status: "success" },
  ]);

  const [alertFilterLevel, setAlertFilterLevel] = useState<string>("all");
  const [alertFilterStatus, setAlertFilterStatus] = useState<string>("all");
  const [alertFilterTime, setAlertFilterTime] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any>>({});
  const [dialogTitle, setDialogTitle] = useState("告警");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<AlertRecord | null>(null);

  /* ── Chart Refs ── */
  const perfChartRef = useRef<HTMLDivElement>(null);
  const nodeHealthRef = useRef<HTMLDivElement>(null);
  const trafficChartRef = useRef<HTMLDivElement>(null);
  const contractDistRef = useRef<HTMLDivElement>(null);
  const notaryTrendRef = useRef<HTMLDivElement>(null);
  const alertTrendRef = useRef<HTMLDivElement>(null);

  const perfChartInst = useRef<echarts.ECharts | null>(null);
  const nodeHealthInst = useRef<echarts.ECharts | null>(null);
  const trafficChartInst = useRef<echarts.ECharts | null>(null);
  const contractDistInst = useRef<echarts.ECharts | null>(null);
  const notaryTrendInst = useRef<echarts.ECharts | null>(null);
  const alertTrendInst = useRef<echarts.ECharts | null>(null);

  /* ── Dialog helpers ── */
  const openCreate = () => {
    setDialogMode("create");
    setDialogData({});
    setDialogTitle("告警");
    setDialogOpen(true);
  };

  const openEdit = (alert: AlertRecord) => {
    setDialogMode("edit");
    setDialogData(alert);
    setDialogTitle(`告警 ${alert.id}`);
    setDialogOpen(true);
  };

  const openView = (alert: AlertRecord) => {
    setDrawerData(alert);
    setDrawerOpen(true);
  };

  const openDelete = (alert: AlertRecord) => {
    setDialogMode("delete");
    setDialogData(alert);
    setDialogTitle(`告警 ${alert.id}`);
    setDialogOpen(true);
  };

  const handleCreate = (data: Record<string, any>) => {
    const newAlert: AlertRecord = {
      id: data.id || `ALT-${String(Date.now()).slice(-3)}`,
      level: data.level as AlertLevel,
      content: data.content,
      time: data.time,
      status: data.status as AlertStatus,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleEdit = (data: Record<string, any>) => {
    const originalId = dialogData.id as string;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === originalId
          ? {
              ...a,
              id: data.id,
              level: data.level as AlertLevel,
              content: data.content,
              time: data.time,
              status: data.status as AlertStatus,
            }
          : a
      )
    );
  };

  const handleDelete = () => {
    const id = dialogData.id as string;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDialogSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      handleCreate(data);
    } else if (dialogMode === "edit") {
      handleEdit(data);
    }
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.status === "unhandled" ? { ...a, status: "handled" as AlertStatus } : a
      )
    );
  };

  /* ── Real-time intervals ── */
  useEffect(() => {
    const perfInterval = setInterval(() => {
      setPerfData((prev) => {
        const newTps = [...prev.tps.slice(1), {
          time: new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          value: 2000 + Math.random() * 1000,
        }];
        const newBlockTime = [...prev.blockTime.slice(1), {
          time: newTps[newTps.length - 1].time,
          value: 4 + Math.random() * 2,
        }];
        const newConfirmTime = [...prev.confirmTime.slice(1), {
          time: newTps[newTps.length - 1].time,
          value: 1 + Math.random() * 3,
        }];
        return { tps: newTps, blockTime: newBlockTime, confirmTime: newConfirmTime };
      });
      setNodeHealth({
        online: 40 + Math.floor(Math.random() * 5),
        offline: Math.floor(Math.random() * 3),
        error: Math.floor(Math.random() * 3),
      });
      setTrafficData((prev) => ({
        inbound: [...prev.inbound.slice(1), {
          time: new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          value: 50 + Math.random() * 100,
        }],
        outbound: [...prev.outbound.slice(1), {
          time: new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          value: 30 + Math.random() * 80,
        }],
      }));
    }, 5000);

    const activityInterval = setInterval(() => {
      const types: OpType[] = ["deploy", "call", "notary", "trace"];
      const statuses: Array<"success" | "failed" | "pending"> = ["success", "success", "success", "pending", "failed"];
      const newActivity: ActivityItem = {
        id: generateId(),
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        type: types[Math.floor(Math.random() * types.length)],
        actor: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
        target: ["SupplyChain", "DataSharing", "TokenERC20", "DocHash#" + Math.floor(Math.random() * 9999), "Product#" + Math.floor(Math.random() * 9999)][Math.floor(Math.random() * 5)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 10000);

    return () => {
      clearInterval(perfInterval);
      clearInterval(activityInterval);
    };
  }, []);

  /* ── ECharts init ── */
  useEffect(() => {
    if (perfChartRef.current && !perfChartInst.current) {
      perfChartInst.current = echarts.init(perfChartRef.current);
    }
    if (nodeHealthRef.current && !nodeHealthInst.current) {
      nodeHealthInst.current = echarts.init(nodeHealthRef.current);
    }
    if (trafficChartRef.current && !trafficChartInst.current) {
      trafficChartInst.current = echarts.init(trafficChartRef.current);
    }
    if (contractDistRef.current && !contractDistInst.current) {
      contractDistInst.current = echarts.init(contractDistRef.current);
    }
    if (notaryTrendRef.current && !notaryTrendInst.current) {
      notaryTrendInst.current = echarts.init(notaryTrendRef.current);
    }
    if (alertTrendRef.current && !alertTrendInst.current) {
      alertTrendInst.current = echarts.init(alertTrendRef.current);
    }

    return () => {
      perfChartInst.current?.dispose();
      nodeHealthInst.current?.dispose();
      trafficChartInst.current?.dispose();
      contractDistInst.current?.dispose();
      notaryTrendInst.current?.dispose();
      alertTrendInst.current?.dispose();
      perfChartInst.current = null;
      nodeHealthInst.current = null;
      trafficChartInst.current = null;
      contractDistInst.current = null;
      notaryTrendInst.current = null;
      alertTrendInst.current = null;
    };
  }, []);

  /* ── ECharts updates ── */
  useEffect(() => {
    if (perfChartInst.current) {
      perfChartInst.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["TPS", "出块时间(s)", "确认时间(s)"], textStyle: { fontSize: 10 } },
        grid: { left: 40, right: 20, top: 30, bottom: 20 },
        xAxis: { type: "category", data: perfData.tps.map((d) => d.time), axisLabel: { fontSize: 9 } },
        yAxis: [{ type: "value", name: "TPS", axisLabel: { fontSize: 9 } }, { type: "value", name: "时间(s)", axisLabel: { fontSize: 9 } }],
        series: [
          { name: "TPS", type: "line", data: perfData.tps.map((d) => Math.round(d.value)), smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: "#3b82f6" } },
          { name: "出块时间(s)", type: "line", yAxisIndex: 1, data: perfData.blockTime.map((d) => Number(d.value.toFixed(2))), smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: "#8b5cf6" } },
          { name: "确认时间(s)", type: "line", yAxisIndex: 1, data: perfData.confirmTime.map((d) => Number(d.value.toFixed(2))), smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: "#10b981" } },
        ],
      });
    }
  }, [perfData]);

  useEffect(() => {
    if (nodeHealthInst.current) {
      nodeHealthInst.current.setOption({
        tooltip: { trigger: "item" },
        legend: { show: false },
        series: [{
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { show: true, fontSize: 10 },
          data: [
            { value: nodeHealth.online, name: "在线", itemStyle: { color: "#10b981" } },
            { value: nodeHealth.offline, name: "离线", itemStyle: { color: "#6b7280" } },
            { value: nodeHealth.error, name: "异常", itemStyle: { color: "#ef4444" } },
          ],
        }],
      });
    }
  }, [nodeHealth]);

  useEffect(() => {
    if (trafficChartInst.current) {
      trafficChartInst.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["入站", "出站"], textStyle: { fontSize: 10 } },
        grid: { left: 40, right: 20, top: 30, bottom: 20 },
        xAxis: { type: "category", data: trafficData.inbound.map((d) => d.time), axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", name: "MB/s", axisLabel: { fontSize: 9 } },
        series: [
          { name: "入站", type: "line", data: trafficData.inbound.map((d) => Number(d.value.toFixed(1))), smooth: true, itemStyle: { color: "#3b82f6" } },
          { name: "出站", type: "line", data: trafficData.outbound.map((d) => Number(d.value.toFixed(1))), smooth: true, itemStyle: { color: "#f59e0b" } },
        ],
      });
    }
  }, [trafficData]);

  useEffect(() => {
    if (contractDistInst.current) {
      contractDistInst.current.setOption({
        tooltip: { trigger: "item" },
        legend: { orient: "vertical", left: "left", textStyle: { fontSize: 10 } },
        series: [{
          type: "pie",
          radius: "60%",
          data: contractDist.map((d) => ({
            value: d.value,
            name: d.name,
            itemStyle: {
              color: d.name === "Solidity" ? "#3b82f6" : d.name === "Go" ? "#06b6d4" : d.name === "Java" ? "#f59e0b" : "#8b5cf6",
            },
          })),
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" } },
        }],
      });
    }
  }, [contractDist]);

  useEffect(() => {
    if (notaryTrendInst.current) {
      notaryTrendInst.current.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 40, right: 20, top: 20, bottom: 20 },
        xAxis: { type: "category", data: notaryTrend.map((d) => d.day), axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [{
          data: notaryTrend.map((d) => d.value),
          type: "line",
          smooth: true,
          areaStyle: { opacity: 0.2 },
          itemStyle: { color: "#10b981" },
        }],
      });
    }
  }, [notaryTrend]);

  useEffect(() => {
    if (alertTrendInst.current) {
      const days = ["04-16", "04-17", "04-18", "04-19", "04-20", "04-21", "04-22"];
      const criticalData = [2, 1, 3, 2, 4, 1, 2];
      const warningData = [5, 3, 4, 6, 5, 4, 3];
      const infoData = [8, 6, 7, 5, 6, 8, 5];
      const noticeData = [3, 4, 2, 3, 4, 3, 2];
      alertTrendInst.current.setOption({
        tooltip: { trigger: "axis" },
        legend: { data: ["严重", "警告", "信息", "提示"], textStyle: { fontSize: 10 } },
        grid: { left: 40, right: 20, top: 30, bottom: 20 },
        xAxis: { type: "category", data: days, axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [
          { name: "严重", type: "bar", stack: "total", data: criticalData, itemStyle: { color: "#ef4444" } },
          { name: "警告", type: "bar", stack: "total", data: warningData, itemStyle: { color: "#f59e0b" } },
          { name: "信息", type: "bar", stack: "total", data: infoData, itemStyle: { color: "#3b82f6" } },
          { name: "提示", type: "bar", stack: "total", data: noticeData, itemStyle: { color: "#6b7280" } },
        ],
      });
    }
  }, []);

  /* ── Filtered alerts ── */
  const filteredAlerts = alerts.filter((a) => {
    if (alertFilterLevel !== "all" && a.level !== alertFilterLevel) return false;
    if (alertFilterStatus !== "all" && a.status !== alertFilterStatus) return false;
    if (alertFilterTime !== "all") {
      const hour = parseInt(a.time.split(" ")[1]?.split(":")[0] || "0", 10);
      if (alertFilterTime === "today" && hour < 8) return false;
      if (alertFilterTime === "morning" && (hour < 6 || hour >= 12)) return false;
      if (alertFilterTime === "afternoon" && (hour < 12 || hour >= 18)) return false;
      if (alertFilterTime === "evening" && hour < 18) return false;
    }
    return true;
  });

  const alertCounts = {
    critical: alerts.filter((a) => a.level === "critical").length,
    severe: alerts.filter((a) => a.level === "emergency" || a.level === "fatal").length,
    warning: alerts.filter((a) => a.level === "warning").length,
    info: alerts.filter((a) => a.level === "info" || a.level === "notice").length,
  };

  const pendingCount = alerts.filter((a) => a.status === "unhandled").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">区块链运维监控</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">核心组件关键数据监控与运维管理</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            网络正常运行
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {chainStats.map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{s.value}</div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">{s.label}</span>
                <span className="text-[10px] text-emerald-600">{s.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 1. Real-time Performance Dashboard ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            实时性能监控
          </h2>
          <Tabs value={perfTimeRange} onValueChange={(v) => setPerfTimeRange(v as TimeRange)}>
            <TabsList className="h-7">
              <TabsTrigger value="5m" className="text-xs px-2">近5分钟</TabsTrigger>
              <TabsTrigger value="15m" className="text-xs px-2">近15分钟</TabsTrigger>
              <TabsTrigger value="1h" className="text-xs px-2">近1小时</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardContent className="pt-4">
              <div ref={perfChartRef} className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-violet-600" />
                节点健康拓扑
              </div>
              <div ref={nodeHealthRef} className="h-40 w-full" />
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500">在线 {nodeHealth.online}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-[10px] text-slate-500">离线 {nodeHealth.offline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-slate-500">异常 {nodeHealth.error}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-600" />
              网络流量监控
            </div>
            <div ref={trafficChartRef} className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* ── 2. On-chain Data Overview ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          链上数据概览
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{onChainStats.todayTx}</div>
              <span className="text-[10px] text-slate-500">今日交易数</span>
            </div>
          </div>
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-50 text-violet-600 dark:bg-violet-900/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{onChainStats.activeAccounts}</div>
              <span className="text-[10px] text-slate-500">今日活跃账户</span>
            </div>
          </div>
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{onChainStats.contractCalls}</div>
              <span className="text-[10px] text-slate-500">今日合约调用</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-600" />
                智能合约语言分布
              </div>
              <div ref={contractDistRef} className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-emerald-600" />
                存证数据增长趋势（7天）
              </div>
              <div ref={notaryTrendRef} className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── 3. Quick Actions Zone ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-600" />
          快捷操作
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "部署合约", desc: "创建并部署智能合约", icon: <Plus className="w-5 h-5" />, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600", href: "#/blockchain/contracts" },
            { label: "创建存证", desc: "发起新的数据存证", icon: <FileSignature className="w-5 h-5" />, bg: "bg-emerald-50 dark:bg-emerald-900/30", color: "text-emerald-600", href: "#/blockchain/notary" },
            { label: "查看节点", desc: "浏览节点状态信息", icon: <Eye className="w-5 h-5" />, bg: "bg-violet-50 dark:bg-violet-900/30", color: "text-violet-600", href: "#/blockchain/nodes" },
            { label: "配置告警", desc: "设置告警规则策略", icon: <Bell className="w-5 h-5" />, bg: "bg-amber-50 dark:bg-amber-900/30", color: "text-amber-600", href: "#/blockchain/ops" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => { window.location.hash = action.href; }}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors hover:opacity-90",
                "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]",
                "group"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", action.bg, action.color)}>
                {action.icon}
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{action.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Alert Workbench ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          告警工作台
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-900/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{alertCounts.critical}</div>
              <span className="text-[10px] text-slate-500">严重告警</span>
            </div>
          </div>
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600 dark:bg-orange-900/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{alertCounts.severe}</div>
              <span className="text-[10px] text-slate-500">紧急告警</span>
            </div>
          </div>
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{alertCounts.warning}</div>
              <span className="text-[10px] text-slate-500">警告告警</span>
            </div>
          </div>
          <div className={cn("rounded-xl border p-4 flex items-center gap-3", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{alertCounts.info}</div>
              <span className="text-[10px] text-slate-500">信息提示</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                告警趋势（7天）
              </div>
              <div ref={alertTrendRef} className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                告警筛选
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">告警级别</label>
                  <select
                    value={alertFilterLevel}
                    onChange={(e) => setAlertFilterLevel(e.target.value)}
                    className="w-full text-xs border rounded-md px-2 py-1 bg-white dark:bg-[#1E293B] dark:border-[#334155]"
                  >
                    <option value="all">全部级别</option>
                    <option value="critical">严重</option>
                    <option value="warning">警告</option>
                    <option value="info">信息</option>
                    <option value="notice">提示</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">处理状态</label>
                  <select
                    value={alertFilterStatus}
                    onChange={(e) => setAlertFilterStatus(e.target.value)}
                    className="w-full text-xs border rounded-md px-2 py-1 bg-white dark:bg-[#1E293B] dark:border-[#334155]"
                  >
                    <option value="all">全部状态</option>
                    <option value="unhandled">未处理</option>
                    <option value="processing">处理中</option>
                    <option value="handled">已处理</option>
                    <option value="escalated">已升级</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">时间范围</label>
                  <select
                    value={alertFilterTime}
                    onChange={(e) => setAlertFilterTime(e.target.value)}
                    className="w-full text-xs border rounded-md px-2 py-1 bg-white dark:bg-[#1E293B] dark:border-[#334155]"
                  >
                    <option value="all">全部时间</option>
                    <option value="today">今日</option>
                    <option value="morning">上午</option>
                    <option value="afternoon">下午</option>
                    <option value="evening">晚上</option>
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={handleAcknowledgeAll}
                  disabled={pendingCount === 0}
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  全部确认 ({pendingCount})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle: TPS Chart + Component Status */}
      <div className="grid grid-cols-5 gap-4">
        {/* TPS Chart */}
        <div className={cn("col-span-2 rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              TPS 趋势
            </h3>
            <span className="text-[10px] text-slate-500">近24小时</span>
          </div>
          <div className="h-32 flex items-end gap-1">
            {tpsHistory.map((d) => (
              <div key={d.time} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500/80 rounded-t-sm transition-all"
                  style={{ height: `${(d.value / 4000) * 100}%` }}
                />
                <span className="text-[9px] text-slate-400">{d.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Component Status */}
        <div className={cn("col-span-3 rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-violet-600" />
              核心组件状态
            </h3>
            <Link to="/blockchain/ops" className="text-[10px] text-primary-600 flex items-center gap-0.5">
              运维详情 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {componentStatus.map((c) => (
              <div key={c.name} className={cn(
                "p-2.5 rounded-lg border",
                c.status === "normal"
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                  : "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {c.status === "normal" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{c.latency}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Alerts + Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Alerts */}
        <div className={cn("col-span-2 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <div className="p-4 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              告警事件
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openCreate}>
                + 新增告警
              </Button>
              <Link to="/blockchain/ops" className="text-[10px] text-primary-600 flex items-center gap-0.5">
                告警管理 <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="px-4 pb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#334155]">
                  <th className="text-left py-2 font-medium">级别</th>
                  <th className="text-left py-2 font-medium">内容</th>
                  <th className="text-left py-2 font-medium">时间</th>
                  <th className="text-center py-2 font-medium">状态</th>
                  <th className="text-center py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 dark:border-[#334155] last:border-0">
                    <td className="py-2">
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", getLevelBadgeClass(a.level))}>
                        {getLevelLabel(a.level)}
                      </span>
                    </td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{a.content}</td>
                    <td className="py-2 text-slate-500">{a.time}</td>
                    <td className="py-2 text-center">
                      {a.status === "handled" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500 inline" />
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                          onClick={() => openView(a)}
                        >
                          查看
                        </button>
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                          onClick={() => openEdit(a)}
                        >
                          编辑
                        </button>
                        <button
                          className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                          onClick={() => openDelete(a)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Nav */}
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">功能导航</h3>
          <div className="space-y-1.5">
            {[
              { label: "联盟和节点管理", path: "/blockchain/nodes", icon: <Server className="w-4 h-4" />, desc: "联盟链与节点" },
              { label: "区块链浏览器", path: "/blockchain/explorer", icon: <Blocks className="w-4 h-4" />, desc: "区块与交易" },
              { label: "链核心管理", path: "/blockchain/core", icon: <Cpu className="w-4 h-4" />, desc: "共识、网络、存储" },
              { label: "智能合约管理", path: "/blockchain/contracts", icon: <FileText className="w-4 h-4" />, desc: "合约开发部署" },
              { label: "应用子链管理", path: "/blockchain/subchains", icon: <Network className="w-4 h-4" />, desc: "子链创建管理" },
              { label: "系统管理", path: "/blockchain/system", icon: <ShieldCheck className="w-4 h-4" />, desc: "用户、安全、权限" },
              { label: "运维监控", path: "/blockchain/ops", icon: <HardDrive className="w-4 h-4" />, desc: "日志、告警、备份" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors group"
              >
                <span className="text-slate-400 group-hover:text-primary-600">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Recent Activity Feed ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-600" />
            最近链上活动
          </h2>
          <Badge variant="outline" className="text-[10px]">自动刷新</Badge>
        </div>
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">时间</TableHead>
                  <TableHead className="text-xs">操作类型</TableHead>
                  <TableHead className="text-xs">发起者</TableHead>
                  <TableHead className="text-xs">目标</TableHead>
                  <TableHead className="text-xs text-center">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((act) => (
                  <TableRow key={act.id}>
                    <TableCell className="text-xs text-slate-500">{act.time}</TableCell>
                    <TableCell>
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", getOpTypeColor(act.type))}>
                        {getOpTypeLabel(act.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-300">{act.actor}</TableCell>
                    <TableCell className="text-xs text-slate-700 dark:text-slate-300">{act.target}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("inline-block w-2 h-2 rounded-full", getStatusDot(act.status))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        fields={alertFields}
        data={dialogData}
        onSubmit={handleDialogSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`告警详情 — ${drawerData?.id || ""}`}
        data={drawerData ? {
          ...drawerData,
          level: getLevelLabel(drawerData.level),
          status: getStatusLabel(drawerData.status),
        } : {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (drawerData) openEdit(drawerData);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (drawerData) openDelete(drawerData);
        }}
      />
    </div>
  );
}
