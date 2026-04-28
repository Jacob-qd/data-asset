import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  Monitor, Activity, Server, Network, AlertTriangle, CheckCircle2,
  Clock, BarChart3, Cpu, HardDrive, Wifi, Zap, ChevronDown, RefreshCw,
  FileCode, Database, ArrowUpRight, ArrowDownRight, X, Plus, Search, Settings,
  Eye, GripVertical, TrendingUp, TrendingDown, Minus, LayoutDashboard,
  Edit3, Save, Trash2, Copy, ChevronUp, Bell, Brain, Target,
  Layers, HelpCircle, FileText, AlertCircle, Info, Link
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";
import * as echarts from "echarts";

/* ─── Types ─── */
interface AlertEvent {
  id: string;
  level: string;
  title: string;
  metric: string;
  time: string;
  status: string;
  node?: string;
  relatedAlerts?: string[];
  rootCause?: string;
  impact?: string;
  suggestions?: string[];
}

interface NodeMetric {
  name: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  status: string;
}

interface DashboardCard {
  id: string;
  type: string;
  title: string;
  dataSource: string;
}

interface DashboardTab {
  id: string;
  name: string;
  layout: DashboardCard[];
}

interface BaselineConfig {
  tps: number;
  latency: number;
  errorRate: number;
}

interface BaselineHistory {
  id: string;
  time: string;
  field: string;
  oldValue: number;
  newValue: number;
}

interface PredictionCard {
  id: string;
  title: string;
  value: string;
  days: number;
  icon: ReactNode;
  color: string;
}

/* ─── Helpers ─── */
function genId() {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).toUpperCase().slice(2, 5);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("zh-CN", { hour12: false });
}

function formatDateTime(d: Date) {
  return d.toLocaleString("zh-CN", { hour12: false });
}

/* ─── Mock Network Metrics ─── */
const metricsData = {
  tps: 5200,
  blockHeight: 4285691,
  pendingTx: 124,
  activeNodes: 42,
  avgBlockTime: "2.1s",
  totalTx: 156789012,
};

const nodeMetrics: NodeMetric[] = [
  { name: "共识节点-01", cpu: 42, memory: 58, disk: 67, network: 320, status: "online" },
  { name: "共识节点-02", cpu: 38, memory: 52, disk: 61, network: 280, status: "online" },
  { name: "共识节点-03", cpu: 45, memory: 60, disk: 70, network: 350, status: "online" },
  { name: "共识节点-04", cpu: 78, memory: 82, disk: 75, network: 450, status: "warning" },
  { name: "共识节点-05", cpu: 35, memory: 48, disk: 55, network: 250, status: "online" },
];

const initialAlerts: AlertEvent[] = [
  { id: "AL-001", level: "critical", title: "共识节点-04 CPU使用率过高", metric: "CPU 78%", time: "2025-04-22 10:30:00", status: "unresolved", node: "共识节点-04", relatedAlerts: ["AL-002"], rootCause: "高CPU可能由智能合约部署导致", impact: "影响金融联盟链通道", suggestions: ["检查近期合约部署", "扩容节点资源", "启用负载均衡"] },
  { id: "AL-002", level: "warning", title: "存储节点-02 磁盘空间不足", metric: "磁盘 88%", time: "2025-04-22 09:15:00", status: "unresolved", node: "存储节点-02", relatedAlerts: ["AL-001"], rootCause: "区块数据增长过快", impact: "影响数据持久化", suggestions: ["清理历史数据", "扩容存储", "启用归档"] },
  { id: "AL-003", level: "info", title: "金融联盟链出块时间波动", metric: "出块 3.5s", time: "2025-04-22 08:00:00", status: "resolved", node: "金融联盟链", relatedAlerts: [], rootCause: "网络抖动", impact: "影响交易确认速度", suggestions: ["监控网络延迟", "检查节点连接"] },
  { id: "AL-004", level: "critical", title: "跨链桥延迟异常", metric: "延迟 8.2s", time: "2025-04-22 07:30:00", status: "resolved", node: "跨链桥", relatedAlerts: [], rootCause: "目标链拥堵", impact: "影响跨链交易", suggestions: ["调整跨链频率", "通知目标链运维"] },
];

/* ─── Chart Data Generators ─── */
function generateTimeSeriesData(points: number, baseValue: number, variance: number) {
  const data = [];
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 5000);
    const val = baseValue + (Math.random() - 0.5) * variance * 2;
    data.push([formatTime(t), Math.max(0, Math.round(val))]);
  }
  return data;
}

function generateBoxplotData(count: number) {
  const data = [];
  const categories = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const t = new Date(now.getTime() - (count - 1 - i) * 300000);
    categories.push(formatTime(t));
    const min = Math.round(50 + Math.random() * 30);
    const q1 = Math.round(min + Math.random() * 40);
    const median = Math.round(q1 + Math.random() * 40);
    const q3 = Math.round(median + Math.random() * 40);
    const max = Math.round(q3 + Math.random() * 30);
    data.push([min, q1, median, q3, max]);
  }
  return { categories, data };
}

function generatePredictionData(points: number) {
  const historical = [];
  const predicted = [];
  const upper = [];
  const lower = [];
  const now = new Date();
  let base = 70;
  for (let i = 20; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    base = base + (Math.random() - 0.45) * 3;
    historical.push([formatTime(t), Math.round(base)]);
  }
  for (let i = 1; i <= points; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    base = base + 1.5 + (Math.random() - 0.5) * 0.5;
    const val = Math.round(base);
    const ci = 5 + i * 0.5;
    predicted.push([formatTime(t), val]);
    upper.push([formatTime(t), Math.round(val + ci)]);
    lower.push([formatTime(t), Math.round(val - ci)]);
  }
  return { historical, predicted, upper, lower };
}

function generateResourceHistory(points: number, baseValue: number, variance: number) {
  const data = [];
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    data.push([formatTime(t), Math.round(baseValue + (Math.random() - 0.5) * variance * 2)]);
  }
  return data;
}

/* ─── UI Components ─── */
function AlertBadge({ level }: { level: string }) {
  const config: Record<string, { text: string; class: string }> = {
    critical: { text: "严重", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    warning: { text: "警告", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    info: { text: "提示", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[level] || config.info;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    resolved: { text: "已恢复", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    unresolved: { text: "未恢复", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.unresolved;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
    </div>
  );
}

function DeviationBadge({ actual, baseline }: { actual: number; baseline: number }) {
  if (baseline === 0) return null;
  const dev = Math.abs((actual - baseline) / baseline * 100);
  let color = "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  let text = "正常";
  if (dev > 10 && dev <= 30) {
    color = "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    text = `偏离 ${dev.toFixed(1)}%`;
  } else if (dev > 30) {
    color = "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    text = `偏离 ${dev.toFixed(1)}%`;
  }
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", color)}>{text}</span>;
}

/* ─── Alert Fields ─── */
const alertFields: FieldConfig[] = [
  { key: "id", label: "告警ID", type: "text", required: true },
  { key: "level", label: "级别", type: "select", required: true, options: [
    { label: "严重", value: "critical" },
    { label: "警告", value: "warning" },
    { label: "提示", value: "info" },
  ]},
  { key: "title", label: "标题", type: "text", required: true },
  { key: "metric", label: "指标", type: "text", required: true },
  { key: "time", label: "时间", type: "text", required: true, placeholder: "YYYY-MM-DD HH:mm:ss" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "未恢复", value: "unresolved" },
    { label: "已恢复", value: "resolved" },
  ]},
];

const detailFields = [
  { key: "id", label: "告警ID" },
  { key: "level", label: "级别", type: "badge" as const },
  { key: "title", label: "标题" },
  { key: "metric", label: "指标" },
  { key: "time", label: "时间", type: "date" as const },
  { key: "status", label: "状态", type: "badge" as const },
];

/* ─── Main Component ─── */
export default function BlockchainMonitoring() {
  /* -- Existing State -- */
  const [alerts, setAlerts] = useState<AlertEvent[]>(initialAlerts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* -- Performance Charts State -- */
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("1h");
  const [refreshKey, setRefreshKey] = useState(0);

  /* -- Node Resource State -- */
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  /* -- Dashboard State -- */
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState("default");
  const [dashboardTabs, setDashboardTabs] = useState<DashboardTab[]>([
    {
      id: "default",
      name: "默认仪表盘",
      layout: [
        { id: genId(), type: "tps", title: "TPS 实时监控", dataSource: "tps" },
        { id: genId(), type: "blockTime", title: "出块时间", dataSource: "blockTime" },
      ],
    },
    { id: "custom-1", name: "自定义-1", layout: [] },
    { id: "custom-2", name: "自定义-2", layout: [] },
  ]);
  const [addChartOpen, setAddChartOpen] = useState(false);
  const [newChartType, setNewChartType] = useState("tps");
  const [newChartDataSource, setNewChartDataSource] = useState("tps");

  /* -- Baseline State -- */
  const [baselineOpen, setBaselineOpen] = useState(false);
  const [baseline, setBaseline] = useState<BaselineConfig>({ tps: 5000, latency: 20, errorRate: 0.1 });
  const [baselineHistory, setBaselineHistory] = useState<BaselineHistory[]>([
    { id: genId(), time: "2025-04-21 10:00:00", field: "TPS", oldValue: 4500, newValue: 5000 },
    { id: genId(), time: "2025-04-20 14:30:00", field: "延迟", oldValue: 25, newValue: 20 },
  ]);
  const [tempBaseline, setTempBaseline] = useState<BaselineConfig>({ tps: 5000, latency: 20, errorRate: 0.1 });

  /* -- Prediction State -- */
  const [predictionSensitivity, setPredictionSensitivity] = useState(50);
  const [predictionCards] = useState<PredictionCard[]>([
    { id: genId(), title: "磁盘已满预测", value: "预计 7 天后磁盘满", days: 7, icon: <HardDrive className="w-5 h-5" />, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
    { id: genId(), title: "内存耗尽预测", value: "预计 14 天后内存告警", days: 14, icon: <Cpu className="w-5 h-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
    { id: genId(), title: "TPS 下降预测", value: "预计 3 天后 TPS < 4000", days: 3, icon: <TrendingDown className="w-5 h-5" />, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  ]);

  /* -- Alert Correlation State -- */
  const [selectedAlertForCorrelation, setSelectedAlertForCorrelation] = useState<AlertEvent | null>(null);
  const [correlationOpen, setCorrelationOpen] = useState(false);

  /* -- Refs for charts -- */
  const tpsChartRef = useRef<HTMLDivElement>(null);
  const blockTimeChartRef = useRef<HTMLDivElement>(null);
  const confirmTimeChartRef = useRef<HTMLDivElement>(null);
  const pendingTxChartRef = useRef<HTMLDivElement>(null);
  const nodeComparisonChartRef = useRef<HTMLDivElement>(null);
  const predictionChartRef = useRef<HTMLDivElement>(null);
  const dashboardChartRefs = useRef<Record<string, HTMLDivElement>>({});
  const nodeResourceChartRefs = useRef<Record<string, HTMLDivElement>>({});

  /* -- ECharts instances -- */
  const chartInstances = useRef<Record<string, echarts.ECharts>>({});

  /* -- Derived data -- */
  const filteredAlerts = alerts.filter(a =>
    a.title.includes(search) || a.id.includes(search) || a.metric.includes(search)
  );

  const criticalCount = alerts.filter(a => a.level === "critical").length;
  const warningCount = alerts.filter(a => a.level === "warning").length;
  const unresolvedCount = alerts.filter(a => a.status === "unresolved").length;
  const resolvedCount = alerts.filter(a => a.status === "resolved").length;

  const currentDashboard = dashboardTabs.find(t => t.id === activeDashboardTab) || dashboardTabs[0];

  /* -- Chart initialization helpers -- */
  const initChart = useCallback((key: string, el: HTMLDivElement | null, option: echarts.EChartsOption) => {
    if (!el) return;
    if (chartInstances.current[key]) {
      chartInstances.current[key].dispose();
    }
    const instance = echarts.init(el);
    instance.setOption(option);
    chartInstances.current[key] = instance;
  }, []);

  const disposeChart = useCallback((key: string) => {
    if (chartInstances.current[key]) {
      chartInstances.current[key].dispose();
      delete chartInstances.current[key];
    }
  }, []);

  /* -- Refresh interval -- */
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -- Resize handler -- */
  useEffect(() => {
    const handleResize = () => {
      Object.values(chartInstances.current).forEach(inst => inst.resize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -- Performance Charts -- */
  useEffect(() => {
    const points = timeRange === "1h" ? 720 : timeRange === "6h" ? 720 : timeRange === "24h" ? 288 : 168;
    const baseVal = timeRange === "1h" ? 5200 : timeRange === "6h" ? 5100 : timeRange === "24h" ? 5000 : 4800;

    // TPS Line Chart
    const tpsData = generateTimeSeriesData(points, baseVal, 500);
    initChart("tps", tpsChartRef.current, {
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: tpsData.map(d => d[0]) },
      yAxis: { type: "value", name: "TPS" },
      series: [
        {
          name: "TPS",
          type: "line",
          smooth: true,
          data: tpsData.map(d => d[1]),
          areaStyle: { opacity: 0.1 },
          lineStyle: { color: "#6366f1" },
          itemStyle: { color: "#6366f1" },
          markLine: {
            data: [{ yAxis: baseline.tps, label: { formatter: "基线: {c}" } }],
            lineStyle: { type: "dashed", color: "#ef4444" },
          },
        },
      ],
    });

    // Block Time Line Chart
    const blockData = generateTimeSeriesData(points, 2.1, 0.5);
    initChart("blockTime", blockTimeChartRef.current, {
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: blockData.map(d => d[0]) },
      yAxis: { type: "value", name: "秒" },
      series: [
        {
          name: "出块时间",
          type: "line",
          smooth: true,
          data: blockData.map(d => d[1]),
          lineStyle: { color: "#10b981" },
          itemStyle: { color: "#10b981" },
          markLine: {
            data: [{ yAxis: baseline.latency / 10, label: { formatter: "基线: {c}s" } }],
            lineStyle: { type: "dashed", color: "#ef4444" },
          },
        },
      ],
    });

    // Confirmation Time Boxplot
    const boxData = generateBoxplotData(12);
    initChart("confirmTime", confirmTimeChartRef.current, {
      tooltip: { trigger: "item" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", data: boxData.categories },
      yAxis: { type: "value", name: "ms" },
      series: [
        {
          name: "确认时间分布",
          type: "boxplot",
          data: boxData.data,
          itemStyle: { color: "#8b5cf6", borderColor: "#8b5cf6" },
        },
      ],
    });

    // Pending TX Area Chart
    const pendingData = generateTimeSeriesData(points, 120, 30);
    initChart("pendingTx", pendingTxChartRef.current, {
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: pendingData.map(d => d[0]) },
      yAxis: { type: "value", name: "数量" },
      series: [
        {
          name: "待处理交易",
          type: "line",
          smooth: true,
          areaStyle: { opacity: 0.3, color: "#f59e0b" },
          data: pendingData.map(d => d[1]),
          lineStyle: { color: "#f59e0b" },
          itemStyle: { color: "#f59e0b" },
        },
      ],
    });

    return () => {
      disposeChart("tps");
      disposeChart("blockTime");
      disposeChart("confirmTime");
      disposeChart("pendingTx");
    };
  }, [timeRange, refreshKey, baseline, initChart, disposeChart]);

  /* -- Node Comparison Chart -- */
  useEffect(() => {
    initChart("nodeComparison", nodeComparisonChartRef.current, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["CPU", "内存", "磁盘", "网络"] },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", data: nodeMetrics.map(n => n.name) },
      yAxis: { type: "value", name: "% / KB/s" },
      series: [
        { name: "CPU", type: "bar", data: nodeMetrics.map(n => n.cpu), itemStyle: { color: "#6366f1" } },
        { name: "内存", type: "bar", data: nodeMetrics.map(n => n.memory), itemStyle: { color: "#10b981" } },
        { name: "磁盘", type: "bar", data: nodeMetrics.map(n => n.disk), itemStyle: { color: "#f59e0b" } },
        { name: "网络", type: "bar", data: nodeMetrics.map(n => n.network / 5), itemStyle: { color: "#3b82f6" } },
      ],
    });
    return () => disposeChart("nodeComparison");
  }, [initChart, disposeChart]);

  /* -- Node Resource Charts -- */
  useEffect(() => {
    if (expandedNode) {
      const node = nodeMetrics.find(n => n.name === expandedNode);
      if (node) {
        const cpuData = generateResourceHistory(24, node.cpu, 10);
        const memData = generateResourceHistory(24, node.memory, 8);
        const diskData = generateResourceHistory(24, node.disk, 5);
        const netData = generateResourceHistory(24, node.network, 50);

        initChart(`${expandedNode}-cpu`, nodeResourceChartRefs.current[`${expandedNode}-cpu`], {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: cpuData.map(d => d[0]) },
          yAxis: { type: "value", name: "%", max: 100 },
          series: [{ name: "CPU", type: "line", smooth: true, data: cpuData.map(d => d[1]), lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" }, areaStyle: { opacity: 0.1 } }],
        });

        initChart(`${expandedNode}-mem`, nodeResourceChartRefs.current[`${expandedNode}-mem`], {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: memData.map(d => d[0]) },
          yAxis: { type: "value", name: "%", max: 100 },
          series: [{ name: "内存", type: "line", smooth: true, data: memData.map(d => d[1]), lineStyle: { color: "#10b981" }, itemStyle: { color: "#10b981" }, areaStyle: { opacity: 0.1 } }],
        });

        initChart(`${expandedNode}-disk`, nodeResourceChartRefs.current[`${expandedNode}-disk`], {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: diskData.map(d => d[0]) },
          yAxis: { type: "value", name: "%", max: 100 },
          series: [{ name: "磁盘", type: "line", smooth: true, data: diskData.map(d => d[1]), lineStyle: { color: "#f59e0b" }, itemStyle: { color: "#f59e0b" }, areaStyle: { opacity: 0.1 } }],
        });

        initChart(`${expandedNode}-net`, nodeResourceChartRefs.current[`${expandedNode}-net`], {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: netData.map(d => d[0]) },
          yAxis: { type: "value", name: "KB/s" },
          series: [{ name: "网络", type: "line", smooth: true, data: netData.map(d => d[1]), lineStyle: { color: "#3b82f6" }, itemStyle: { color: "#3b82f6" }, areaStyle: { opacity: 0.1 } }],
        });
      }
    }
    return () => {
      if (expandedNode) {
        disposeChart(`${expandedNode}-cpu`);
        disposeChart(`${expandedNode}-mem`);
        disposeChart(`${expandedNode}-disk`);
        disposeChart(`${expandedNode}-net`);
      }
    };
  }, [expandedNode, initChart, disposeChart]);

  /* -- Prediction Chart -- */
  useEffect(() => {
    const data = generatePredictionData(12);
    initChart("prediction", predictionChartRef.current, {
      tooltip: { trigger: "axis" },
      legend: { data: ["历史", "预测", "置信区间"] },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false },
      yAxis: { type: "value", name: "%" },
      series: [
        { name: "历史", type: "line", data: data.historical.map(d => d[1]), lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" } },
        { name: "预测", type: "line", data: [...Array(data.historical.length - 1).fill(null), data.historical[data.historical.length - 1][1], ...data.predicted.map(d => d[1])], lineStyle: { color: "#10b981", type: "dashed" }, itemStyle: { color: "#10b981" } },
        { name: "置信区间", type: "line", data: [...Array(data.historical.length - 1).fill(null), data.historical[data.historical.length - 1][1], ...data.upper.map(d => d[1])], lineStyle: { opacity: 0 }, areaStyle: { opacity: 0.1, color: "#10b981" }, symbol: "none", stack: "ci" },
        { name: "置信区间", type: "line", data: [...Array(data.historical.length - 1).fill(null), data.historical[data.historical.length - 1][1], ...data.lower.map(d => d[1])], lineStyle: { opacity: 0 }, areaStyle: { opacity: 0.1, color: "#fff" }, symbol: "none", stack: "ci2" },
      ],
    });
    return () => disposeChart("prediction");
  }, [refreshKey, initChart, disposeChart]);

  /* -- Dashboard Charts -- */
  useEffect(() => {
    currentDashboard.layout.forEach(card => {
      const el = dashboardChartRefs.current[card.id];
      if (!el) return;
      
      const points = 60;
      let option: echarts.EChartsOption;
      
      if (card.type === "tps") {
        const data = generateTimeSeriesData(points, 5200, 300);
        option = {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: data.map(d => d[0]) },
          yAxis: { type: "value", name: "TPS" },
          series: [{ name: "TPS", type: "line", smooth: true, data: data.map(d => d[1]), lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" }, areaStyle: { opacity: 0.1 } }],
        };
      } else if (card.type === "blockTime") {
        const data = generateTimeSeriesData(points, 2.1, 0.3);
        option = {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: data.map(d => d[0]) },
          yAxis: { type: "value", name: "秒" },
          series: [{ name: "出块时间", type: "line", smooth: true, data: data.map(d => d[1]), lineStyle: { color: "#10b981" }, itemStyle: { color: "#10b981" } }],
        };
      } else if (card.type === "confirmTime") {
        const boxData = generateBoxplotData(8);
        option = {
          tooltip: { trigger: "item" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: boxData.categories },
          yAxis: { type: "value", name: "ms" },
          series: [{ name: "确认时间", type: "boxplot", data: boxData.data, itemStyle: { color: "#8b5cf6" } }],
        };
      } else {
        const data = generateTimeSeriesData(points, 120, 20);
        option = {
          tooltip: { trigger: "axis" },
          grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
          xAxis: { type: "category", data: data.map(d => d[0]) },
          yAxis: { type: "value", name: "数量" },
          series: [{ name: "待处理交易", type: "line", smooth: true, areaStyle: { opacity: 0.3, color: "#f59e0b" }, data: data.map(d => d[1]), lineStyle: { color: "#f59e0b" }, itemStyle: { color: "#f59e0b" } }],
        };
      }
      
      initChart(`dashboard-${card.id}`, el, option);
    });
    
    return () => {
      currentDashboard.layout.forEach(card => {
        disposeChart(`dashboard-${card.id}`);
      });
    };
  }, [currentDashboard.layout, refreshKey, initChart, disposeChart]);

  /* -- Handlers -- */
  const handleCreate = () => {
    setSelectedAlert(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (alert: AlertEvent) => {
    setSelectedAlert(alert);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (alert: AlertEvent) => {
    setSelectedAlert(alert);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (alert: AlertEvent) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setAlerts([...alerts, { ...data, id: `AL-${genId()}` } as AlertEvent]);
    } else if (dialogMode === "edit" && selectedAlert) {
      setAlerts(alerts.map(a => a.id === selectedAlert.id ? { ...data, id: selectedAlert.id } as AlertEvent : a));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAlert) {
      setAlerts(alerts.filter(a => a.id !== selectedAlert.id));
    }
  };

  const handleAddChart = () => {
    const newCard: DashboardCard = {
      id: genId(),
      type: newChartType,
      title: newChartType === "tps" ? "TPS 监控" : newChartType === "blockTime" ? "出块时间" : newChartType === "confirmTime" ? "确认时间分布" : "待处理交易",
      dataSource: newChartDataSource,
    };
    setDashboardTabs(tabs => tabs.map(t => t.id === activeDashboardTab ? { ...t, layout: [...t.layout, newCard] } : t));
    setAddChartOpen(false);
  };

  const handleRemoveChart = (cardId: string) => {
    setDashboardTabs(tabs => tabs.map(t => t.id === activeDashboardTab ? { ...t, layout: t.layout.filter(c => c.id !== cardId) } : t));
    disposeChart(`dashboard-${cardId}`);
  };

  const handleMoveChart = (index: number, direction: "up" | "down") => {
    const layout = [...currentDashboard.layout];
    if (direction === "up" && index > 0) {
      [layout[index], layout[index - 1]] = [layout[index - 1], layout[index]];
    } else if (direction === "down" && index < layout.length - 1) {
      [layout[index], layout[index + 1]] = [layout[index + 1], layout[index]];
    }
    setDashboardTabs(tabs => tabs.map(t => t.id === activeDashboardTab ? { ...t, layout } : t));
  };

  const handleSaveBaseline = () => {
    const now = formatDateTime(new Date());
    const newHistory: BaselineHistory[] = [];
    if (tempBaseline.tps !== baseline.tps) {
      newHistory.push({ id: genId(), time: now, field: "TPS", oldValue: baseline.tps, newValue: tempBaseline.tps });
    }
    if (tempBaseline.latency !== baseline.latency) {
      newHistory.push({ id: genId(), time: now, field: "延迟", oldValue: baseline.latency, newValue: tempBaseline.latency });
    }
    if (tempBaseline.errorRate !== baseline.errorRate) {
      newHistory.push({ id: genId(), time: now, field: "错误率", oldValue: baseline.errorRate, newValue: tempBaseline.errorRate });
    }
    setBaselineHistory([...newHistory, ...baselineHistory]);
    setBaseline(tempBaseline);
    setBaselineOpen(false);
  };

  const handleShowCorrelation = (alert: AlertEvent) => {
    setSelectedAlertForCorrelation(alert);
    setCorrelationOpen(true);
  };

  const sortedNodesByCpu = [...nodeMetrics].sort((a, b) => b.cpu - a.cpu);
  const sortedNodesByMemory = [...nodeMetrics].sort((a, b) => b.memory - a.memory);

  const chartTypeOptions = [
    { value: "tps", label: "TPS 折线图" },
    { value: "blockTime", label: "出块时间折线图" },
    { value: "confirmTime", label: "确认时间箱线图" },
    { value: "pendingTx", label: "待处理交易面积图" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">区块链监控</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">实时监控区块链网络健康状态、性能指标与告警事件</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw className="w-4 h-4" /> 刷新
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: "当前TPS", value: metricsData.tps.toLocaleString(), icon: <Zap className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20", change: "+5.2%", up: true },
          { label: "区块高度", value: metricsData.blockHeight.toLocaleString(), icon: <Database className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20", change: "+128", up: true },
          { label: "待处理交易", value: metricsData.pendingTx, icon: <Clock className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20", change: "-12", up: true },
          { label: "活跃节点", value: metricsData.activeNodes, icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20", change: "0", up: true },
          { label: "平均出块", value: metricsData.avgBlockTime, icon: <Activity className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20", change: "-0.1s", up: true },
          { label: "总交易数", value: metricsData.totalTx.toLocaleString(), icon: <BarChart3 className="w-5 h-5 text-rose-500" />, color: "bg-rose-50 dark:bg-rose-900/20", change: "+12.5K", up: true },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
            <div className={cn("text-xs mt-1 flex items-center gap-0.5", s.up ? "text-emerald-600" : "text-red-600")}>
              {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-6">
          <TabsTrigger value="performance">性能监控</TabsTrigger>
          <TabsTrigger value="nodes">节点监控</TabsTrigger>
          <TabsTrigger value="network">网络性能</TabsTrigger>
          <TabsTrigger value="alerts">告警事件</TabsTrigger>
          <TabsTrigger value="dashboard">仪表盘</TabsTrigger>
          <TabsTrigger value="predictions">预测分析</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 pt-4">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">时间范围:</span>
              {(["1h", "6h", "24h", "7d"] as const).map(r => (
                <Button
                  key={r}
                  size="sm"
                  variant={timeRange === r ? "default" : "outline"}
                  onClick={() => setTimeRange(r)}
                  className={timeRange === r ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                >
                  {r === "1h" ? "1小时" : r === "6h" ? "6小时" : r === "24h" ? "24小时" : "7天"}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <DeviationBadge actual={metricsData.tps} baseline={baseline.tps} />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setBaselineOpen(true)}>
                <Target className="w-4 h-4" /> 基线配置
              </Button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>TPS 实时监控</span>
                  <Badge variant="secondary">{metricsData.tps} TPS</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={tpsChartRef} className="w-full h-64" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>出块时间</span>
                  <Badge variant="secondary">{metricsData.avgBlockTime}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={blockTimeChartRef} className="w-full h-64" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">交易确认时间分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={confirmTimeChartRef} className="w-full h-64" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>待处理交易数</span>
                  <Badge variant="secondary">{metricsData.pendingTx}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={pendingTxChartRef} className="w-full h-64" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4 pt-4">
          {/* Node Resource Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["节点名称", "CPU", "内存", "磁盘", "网络IO", "状态", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodeMetrics.map((node, i) => (
                  <>
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50 cursor-pointer" onClick={() => setExpandedNode(expandedNode === node.name ? null : node.name)}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {expandedNode === node.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {node.name}
                      </td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.cpu} color={node.cpu > 70 ? "bg-red-500" : "bg-indigo-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.cpu}%</span></div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.memory} color={node.memory > 80 ? "bg-red-500" : "bg-emerald-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.memory}%</span></div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.disk} color={node.disk > 80 ? "bg-red-500" : "bg-amber-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.disk}%</span></div></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{node.network} KB/s</td>
                      <td className="px-4 py-3">
                        {node.status === "online" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setExpandedNode(expandedNode === node.name ? null : node.name); }}>
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    {expandedNode === node.name && (
                      <tr key={`${i}-charts`}>
                        <td colSpan={7} className="px-4 py-4 bg-slate-50 dark:bg-[#273548]/30">
                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">CPU 使用率 (24h)</CardTitle></CardHeader>
                              <CardContent><div ref={el => { if (el) nodeResourceChartRefs.current[`${node.name}-cpu`] = el; }} className="w-full h-48" /></CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">内存使用率 (24h)</CardTitle></CardHeader>
                              <CardContent><div ref={el => { if (el) nodeResourceChartRefs.current[`${node.name}-mem`] = el; }} className="w-full h-48" /></CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">磁盘使用率 (24h)</CardTitle></CardHeader>
                              <CardContent><div ref={el => { if (el) nodeResourceChartRefs.current[`${node.name}-disk`] = el; }} className="w-full h-48" /></CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium">网络IO (24h)</CardTitle></CardHeader>
                              <CardContent><div ref={el => { if (el) nodeResourceChartRefs.current[`${node.name}-net`] = el; }} className="w-full h-48" /></CardContent>
                            </Card>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Node Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">节点资源对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={nodeComparisonChartRef} className="w-full h-80" />
            </CardContent>
          </Card>

          {/* TopN Ranking */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">CPU 使用 TopN</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>排名</TableHead>
                      <TableHead>节点</TableHead>
                      <TableHead>使用率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNodesByCpu.map((node, i) => (
                      <TableRow key={node.name}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{node.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MiniBar value={node.cpu} color={node.cpu > 70 ? "bg-red-500" : "bg-indigo-500"} />
                            <span className="text-xs">{node.cpu}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">内存使用 TopN</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>排名</TableHead>
                      <TableHead>节点</TableHead>
                      <TableHead>使用率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNodesByMemory.map((node, i) => (
                      <TableRow key={node.name}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{node.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MiniBar value={node.memory} color={node.memory > 80 ? "bg-red-500" : "bg-emerald-500"} />
                            <span className="text-xs">{node.memory}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "网络延迟", value: "15ms", sub: "P50延迟", icon: <Wifi className="w-4 h-4 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "吞吐量", value: "5.2K TPS", sub: "当前峰值", icon: <Zap className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "区块利用率", value: "78%", sub: "平均填充率", icon: <Database className="w-4 h-4 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "共识成功率", value: "99.98%", sub: "近24小时", icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "分叉率", value: "0.001%", sub: "近24小时", icon: <Network className="w-4 h-4 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "合约调用", value: "12.5K/min", sub: "当前速率", icon: <FileCode className="w-4 h-4 text-rose-500" />, color: "bg-rose-50 dark:bg-rose-900/20" },
            ].map((m, i) => (
              <div key={i} className={cn("rounded-xl border border-slate-200 dark:border-slate-700 p-4", m.color)}>
                <div className="flex items-center gap-2 mb-2">{m.icon}<span className="text-sm text-slate-600 dark:text-slate-400">{m.label}</span></div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{m.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.sub}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索告警标题/ID/指标" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />严重 {criticalCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />警告 {warningCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />已恢复 {resolvedCount}</span>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
                <Plus className="w-4 h-4" /> 新建告警
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["告警ID", "级别", "标题", "指标", "时间", "状态", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{alert.id}</td>
                    <td className="px-4 py-3"><AlertBadge level={alert.level} /></td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{alert.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{alert.metric}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{alert.time}</td>
                    <td className="px-4 py-3"><StatusBadge status={alert.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleView(alert)}><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(alert)}><Settings className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(alert)}><X className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleShowCorrelation(alert)}><Network className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dashboardTabs.map(tab => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={activeDashboardTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveDashboardTab(tab.id)}
                  className={activeDashboardTab === tab.id ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                >
                  {tab.name}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditingDashboard(!isEditingDashboard)}>
                {isEditingDashboard ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditingDashboard ? "保存布局" : "编辑仪表盘"}
              </Button>
              {isEditingDashboard && (
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setAddChartOpen(true)}>
                  <Plus className="w-4 h-4" /> 添加图表
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentDashboard.layout.map((card, index) => (
              <Card key={card.id} className={cn("relative", isEditingDashboard && "ring-2 ring-indigo-500/50")}>
                {isEditingDashboard && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMoveChart(index, "up")} disabled={index === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMoveChart(index, "down")} disabled={index === currentDashboard.layout.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => handleRemoveChart(card.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isEditingDashboard && <GripVertical className="w-4 h-4 text-slate-400" />}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={el => { if (el) dashboardChartRefs.current[card.id] = el; }} className="w-full h-64" />
                </CardContent>
              </Card>
            ))}
            {currentDashboard.layout.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-slate-400">
                <LayoutDashboard className="w-12 h-12 mb-4" />
                <p>仪表盘为空，点击"添加图表"开始配置</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4 pt-4">
          {/* Prediction Cards */}
          <div className="grid grid-cols-3 gap-4">
            {predictionCards.map(card => (
              <Card key={card.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-lg", card.color)}>{card.icon}</div>
                    <Badge variant="outline">{card.days} 天后</Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">趋势预测与置信区间</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={predictionChartRef} className="w-full h-80" />
            </CardContent>
          </Card>

          {/* Prediction Stats & Config */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">预测准确率统计</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "磁盘容量预测", accuracy: 94 },
                    { label: "内存使用预测", accuracy: 89 },
                    { label: "TPS 趋势预测", accuracy: 82 },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${stat.accuracy}%` }} />
                        </div>
                        <span className="text-sm font-medium">{stat.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">预测敏感度配置</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">敏感度</span>
                    <span className="text-sm font-medium">{predictionSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={predictionSensitivity}
                    onChange={e => setPredictionSensitivity(Number(e.target.value))}
                    className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>保守</span>
                    <span>平衡</span>
                    <span>激进</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Baseline Dialog */}
      <Dialog open={baselineOpen} onOpenChange={setBaselineOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>性能基线配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">TPS 基线</label>
              <Input type="number" value={tempBaseline.tps} onChange={e => setTempBaseline({ ...tempBaseline, tps: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">延迟基线 (ms)</label>
              <Input type="number" value={tempBaseline.latency} onChange={e => setTempBaseline({ ...tempBaseline, latency: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">错误率基线 (%)</label>
              <Input type="number" step="0.01" value={tempBaseline.errorRate} onChange={e => setTempBaseline({ ...tempBaseline, errorRate: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">调整历史</label>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead>字段</TableHead>
                      <TableHead>旧值</TableHead>
                      <TableHead>新值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baselineHistory.map(h => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs">{h.time}</TableCell>
                        <TableCell>{h.field}</TableCell>
                        <TableCell>{h.oldValue}</TableCell>
                        <TableCell>{h.newValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBaselineOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveBaseline}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Chart Dialog */}
      <Dialog open={addChartOpen} onOpenChange={setAddChartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加图表</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">图表类型</label>
              <select
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] px-3 py-2 text-sm"
                value={newChartType}
                onChange={e => setNewChartType(e.target.value)}
              >
                {chartTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">数据源</label>
              <select
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] px-3 py-2 text-sm"
                value={newChartDataSource}
                onChange={e => setNewChartDataSource(e.target.value)}
              >
                <option value="tps">TPS</option>
                <option value="blockTime">出块时间</option>
                <option value="confirmTime">确认时间</option>
                <option value="pendingTx">待处理交易</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChartOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddChart}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Correlation Dialog */}
      <Dialog open={correlationOpen} onOpenChange={setCorrelationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>告警关联分析 - {selectedAlertForCorrelation?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAlertForCorrelation?.relatedAlerts && selectedAlertForCorrelation.relatedAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" /> 关联告警
                </h4>
                <div className="space-y-2">
                  {selectedAlertForCorrelation.relatedAlerts.map(relId => {
                    const relAlert = alerts.find(a => a.id === relId);
                    if (!relAlert) return null;
                    return (
                      <div key={relId} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#273548]/50">
                        <div className="flex items-center gap-2">
                          <AlertBadge level={relAlert.level} />
                          <span className="text-sm">{relAlert.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{relAlert.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedAlertForCorrelation?.rootCause && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> 根因分析
                </h4>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
                  {selectedAlertForCorrelation.rootCause}
                </div>
              </div>
            )}
            {selectedAlertForCorrelation?.impact && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> 影响分析
                </h4>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-800 dark:text-red-300">
                  {selectedAlertForCorrelation.impact}
                </div>
              </div>
            )}
            {selectedAlertForCorrelation?.suggestions && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> 建议操作
                </h4>
                <div className="space-y-2">
                  {selectedAlertForCorrelation.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing CRUD Dialogs */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedAlert?.title || "告警事件"}
        fields={alertFields}
        data={selectedAlert || {}}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`告警详情 - ${selectedAlert?.title}`}
        data={selectedAlert || {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedAlert) handleEdit(selectedAlert);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedAlert) handleDelete(selectedAlert);
        }}
      />
    </div>
  );
}


