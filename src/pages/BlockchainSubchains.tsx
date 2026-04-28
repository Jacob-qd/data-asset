import { useState, useRef, useEffect } from "react";
import {
  Network, Plus, Search, CheckCircle2, XCircle, Pause, Play, Trash2, ChevronRight,
  Server, Users, Blocks, Settings, X, Layers, Eye, Pencil, Square, ArrowRight,
  Rocket, Shield, Activity, BarChart3, TrendingUp, Cpu, HardDrive, Wifi,
  ArrowLeftRight, Anchor, Monitor, AlertTriangle, Check, Clock, RefreshCw,
  Undo2, FileCheck, Globe, History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

/* ─── Types ─── */
interface Subchain {
  id: string;
  name: string;
  desc: string;
  status: string;
  parentChain: string;
  members: string[];
  nodes: number;
  blockHeight: number;
  txCount: number;
  createTime: string;
  creator: string;
  isolation: string;
  version: string;
  tps: number;
}

interface CrossChannel {
  id: string;
  name: string;
  fromChain: string;
  toChain: string;
  status: string;
  latency: number;
}

interface CrossTx {
  id: string;
  channelId: string;
  fromChain: string;
  toChain: string;
  status: string;
  payload: string;
  createTime: string;
  confirmTime?: string;
}

interface AnchorRecord {
  id: string;
  subchainId: string;
  period: number;
  content: string;
  status: string;
  lastAnchorTime: string;
  anchorCount: number;
}

interface AnchorHistory {
  id: string;
  anchorId: string;
  height: number;
  hash: string;
  time: string;
  status: string;
}

/* ─── Mock Subchains ─── */
const initialSubchains: Subchain[] = [
  {
    id: "SC-001", name: "政务数据子链", desc: "政府部门间的数据共享与业务协同",
    status: "running", parentChain: "主联盟链", members: ["市政府", "公安局", "税务局", "人社局"],
    nodes: 6, blockHeight: 152340, txCount: 45210, createTime: "2025-01-15 09:00:00",
    creator: "管理员", isolation: "成员范围隔离", version: "v1.2.0", tps: 120,
  },
  {
    id: "SC-002", name: "金融风控子链", desc: "金融机构间的风控数据共享",
    status: "running", parentChain: "主联盟链", members: ["人民银行", "工商银行", "建设银行", "招商银行"],
    nodes: 8, blockHeight: 89120, txCount: 23450, createTime: "2025-02-01 14:00:00",
    creator: "管理员", isolation: "业务隔离", version: "v1.3.0", tps: 200,
  },
  {
    id: "SC-003", name: "医疗健康子链", desc: "医疗机构间的患者数据共享",
    status: "paused", parentChain: "主联盟链", members: ["中心医院", "人民医院", "中医院"],
    nodes: 5, blockHeight: 45230, txCount: 12340, createTime: "2025-03-10 10:00:00",
    creator: "管理员", isolation: "业务隔离", version: "v1.1.0", tps: 85,
  },
  {
    id: "SC-004", name: "供应链子链", desc: "供应链上下游企业数据追溯",
    status: "running", parentChain: "主联盟链", members: ["核心企业", "供应商A", "供应商B", "物流公司", "零售商"],
    nodes: 7, blockHeight: 67890, txCount: 34560, createTime: "2025-03-20 16:00:00",
    creator: "管理员", isolation: "成员范围隔离", version: "v1.2.1", tps: 150,
  },
];

const initialChannels: CrossChannel[] = [
  { id: "CH-001", name: "政务-金融通道", fromChain: "SC-001", toChain: "SC-002", status: "active", latency: 120 },
  { id: "CH-002", name: "医疗-政务通道", fromChain: "SC-003", toChain: "SC-001", status: "active", latency: 95 },
  { id: "CH-003", name: "供应链-金融通道", fromChain: "SC-004", toChain: "SC-002", status: "inactive", latency: 0 },
];

const initialCrossTxs: CrossTx[] = [
  { id: "CTX-001", channelId: "CH-001", fromChain: "SC-001", toChain: "SC-002", status: "confirmed", payload: "企业征信数据同步", createTime: "2025-04-25 10:00:00", confirmTime: "2025-04-25 10:00:03" },
  { id: "CTX-002", channelId: "CH-002", fromChain: "SC-003", toChain: "SC-001", status: "pending", payload: "医保结算请求", createTime: "2025-04-25 10:05:00" },
  { id: "CTX-003", channelId: "CH-001", fromChain: "SC-002", toChain: "SC-001", status: "confirmed", payload: "风控预警推送", createTime: "2025-04-25 09:30:00", confirmTime: "2025-04-25 09:30:02" },
];

const initialAnchors: AnchorRecord[] = [
  { id: "AN-001", subchainId: "SC-001", period: 300, content: "区块哈希根+状态根", status: "active", lastAnchorTime: "2025-04-25 10:00:00", anchorCount: 1523 },
  { id: "AN-002", subchainId: "SC-002", period: 180, content: "区块哈希根", status: "active", lastAnchorTime: "2025-04-25 10:03:00", anchorCount: 2891 },
  { id: "AN-003", subchainId: "SC-003", period: 600, content: "交易默克尔根", status: "paused", lastAnchorTime: "2025-04-25 09:00:00", anchorCount: 452 },
];

const initialAnchorHistory: AnchorHistory[] = [
  { id: "AH-001", anchorId: "AN-001", height: 152340, hash: "0x7a3f...9e2c", time: "2025-04-25 10:00:00", status: "success" },
  { id: "AH-002", anchorId: "AN-001", height: 152339, hash: "0x8b4e...1d5a", time: "2025-04-25 09:55:00", status: "success" },
  { id: "AH-003", anchorId: "AN-002", height: 89120, hash: "0x2c1a...7f8b", time: "2025-04-25 10:03:00", status: "success" },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    running: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    paused: { text: "已暂停", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    stopped: { text: "已停止", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    active: { text: "活跃", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    inactive: { text: "未激活", class: "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
    confirmed: { text: "已确认", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending: { text: " pending", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    success: { text: "成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  };
  const c = config[status] || config.stopped;
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

/* ─── ECharts Components ─── */
function TpsChart({ data }: { data: { time: string; tps: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      grid: { top: 16, right: 16, bottom: 32, left: 48 },
      xAxis: { type: "category", data: data.map(d => d.time), axisLabel: { fontSize: 10 } },
      yAxis: { type: "value", name: "TPS", axisLabel: { fontSize: 10 } },
      series: [{
        type: "line",
        data: data.map(d => d.tps),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#3b82f6", width: 2 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: "#3b82f650" },
          { offset: 1, color: "#3b82f605" },
        ]}},
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [data]);
  return <div ref={ref} style={{ width: "100%", height: 200 }} />;
}

function BlockHeightChart({ data }: { data: { time: string; height: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      grid: { top: 16, right: 16, bottom: 32, left: 64 },
      xAxis: { type: "category", data: data.map(d => d.time), axisLabel: { fontSize: 10 } },
      yAxis: { type: "value", name: "区块高度", axisLabel: { fontSize: 10 } },
      series: [{
        type: "bar",
        data: data.map(d => d.height),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#10b981" },
            { offset: 1, color: "#059669" },
          ]),
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: "50%",
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [data]);
  return <div ref={ref} style={{ width: "100%", height: 200 }} />;
}

function ResourceUsageChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["CPU", "内存", "磁盘", "网络"], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { top: 16, right: 16, bottom: 40, left: 48 },
      xAxis: { type: "category", data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"], axisLabel: { fontSize: 10 } },
      yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%", fontSize: 10 } },
      series: [
        { name: "CPU", type: "line", data: [25, 30, 45, 60, 55, 40], smooth: true, itemStyle: { color: "#3b82f6" } },
        { name: "内存", type: "line", data: [40, 42, 50, 58, 55, 48], smooth: true, itemStyle: { color: "#8b5cf6" } },
        { name: "磁盘", type: "line", data: [60, 61, 62, 63, 64, 65], smooth: true, itemStyle: { color: "#10b981" } },
        { name: "网络", type: "line", data: [10, 15, 35, 45, 30, 20], smooth: true, itemStyle: { color: "#f59e0b" } },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: 200 }} />;
}

/* ─── Fields ─── */
const subchainFields: FieldConfig[] = [
  { key: "name", label: "子链名称", type: "text", required: true },
  { key: "desc", label: "描述", type: "textarea", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "running" },
    { label: "已暂停", value: "paused" },
    { label: "已停止", value: "stopped" },
  ]},
  { key: "parentChain", label: "父链", type: "text", required: true },
  { key: "members", label: "成员（逗号分隔）", type: "textarea", required: true, placeholder: "市政府,公安局,税务局" },
  { key: "nodes", label: "节点数", type: "number", required: true },
  { key: "blockHeight", label: "区块高度", type: "number", required: true },
  { key: "txCount", label: "交易数", type: "number", required: true },
  { key: "createTime", label: "创建时间", type: "text", required: true },
  { key: "creator", label: "创建者", type: "text", required: true },
  { key: "isolation", label: "隔离方式", type: "select", required: true, options: [
    { label: "成员范围隔离", value: "成员范围隔离" },
    { label: "业务隔离", value: "业务隔离" },
  ]},
  { key: "version", label: "版本", type: "text", required: true },
  { key: "tps", label: "TPS", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "子链编号" },
  { key: "name", label: "子链名称" },
  { key: "desc", label: "描述" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "parentChain", label: "父链", type: "badge" as const },
  { key: "members", label: "成员", type: "list" as const },
  { key: "nodes", label: "节点数" },
  { key: "blockHeight", label: "区块高度" },
  { key: "txCount", label: "交易数" },
  { key: "createTime", label: "创建时间", type: "date" as const },
  { key: "creator", label: "创建者" },
  { key: "isolation", label: "隔离方式", type: "badge" as const },
  { key: "version", label: "版本", type: "badge" as const },
  { key: "tps", label: "当前TPS" },
];

function generateId(subchains: Subchain[]): string {
  const maxNum = subchains.reduce((max, s) => {
    const match = s.id.match(/SC-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `SC-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Main ─── */
export default function BlockchainSubchains() {
  const [subchains, setSubchains] = useState<Subchain[]>(initialSubchains);
  const [channels, setChannels] = useState<CrossChannel[]>(initialChannels);
  const [crossTxs, setCrossTxs] = useState<CrossTx[]>(initialCrossTxs);
  const [anchors, setAnchors] = useState<AnchorRecord[]>(initialAnchors);
  const [anchorHistory, setAnchorHistory] = useState<AnchorHistory[]>(initialAnchorHistory);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("subchains");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubchain, setDetailSubchain] = useState<Subchain | null>(null);

  // Deployment wizard state
  const [deployOpen, setDeployOpen] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployConfig, setDeployConfig] = useState({
    name: "", desc: "", parentChain: "主联盟链", isolation: "成员范围隔离",
    consensus: "PBFT", blockInterval: 2, blockSize: 1000,
    members: "", nodes: 4,
  });

  // Upgrade dialog state
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<Subchain | null>(null);
  const [newVersion, setNewVersion] = useState("");
  const [compatCheck, setCompatCheck] = useState<"idle" | "checking" | "compatible" | "incompatible">("idle");

  // Cross-tx dialog state
  const [crossTxOpen, setCrossTxOpen] = useState(false);
  const [crossTxForm, setCrossTxForm] = useState({ channelId: "", payload: "" });

  // Anchor dialog state
  const [anchorOpen, setAnchorOpen] = useState(false);
  const [anchorForm, setAnchorForm] = useState({ subchainId: "", period: 300, content: "区块哈希根" });

  const filtered = subchains.filter((s) =>
    s.name.includes(search) || s.id.includes(search)
  );

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "", desc: "", status: "running", parentChain: "主联盟链", members: "",
      nodes: 4, blockHeight: 0, txCount: 0,
      createTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      creator: "管理员", isolation: "成员范围隔离", version: "v1.0.0", tps: 0,
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (subchain: Subchain) => {
    setDialogMode("edit");
    setDialogData({
      name: subchain.name, desc: subchain.desc, status: subchain.status,
      parentChain: subchain.parentChain, members: subchain.members.join(","),
      nodes: subchain.nodes, blockHeight: subchain.blockHeight, txCount: subchain.txCount,
      createTime: subchain.createTime, creator: subchain.creator, isolation: subchain.isolation,
      version: subchain.version, tps: subchain.tps,
    });
    setEditingId(subchain.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (subchain: Subchain) => {
    setDialogMode("delete");
    setEditingId(subchain.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const members = typeof data.members === "string"
      ? data.members.split(",").map((m: string) => m.trim()).filter(Boolean)
      : data.members || [];

    if (dialogMode === "create") {
      const id = generateId(subchains);
      const newSubchain: Subchain = {
        id, name: data.name, desc: data.desc, status: data.status,
        parentChain: data.parentChain, members,
        nodes: Number(data.nodes), blockHeight: Number(data.blockHeight),
        txCount: Number(data.txCount), createTime: data.createTime,
        creator: data.creator, isolation: data.isolation,
        version: data.version || "v1.0.0", tps: Number(data.tps) || 0,
      };
      setSubchains((prev) => [...prev, newSubchain]);
    } else if (dialogMode === "edit" && editingId) {
      setSubchains((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s, name: data.name, desc: data.desc, status: data.status,
                parentChain: data.parentChain, members,
                nodes: Number(data.nodes), blockHeight: Number(data.blockHeight),
                txCount: Number(data.txCount), createTime: data.createTime,
                creator: data.creator, isolation: data.isolation,
                version: data.version || s.version, tps: Number(data.tps) || s.tps,
              }
            : s
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setSubchains((prev) => prev.filter((s) => s.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (subchain: Subchain) => {
    setDetailSubchain(subchain);
    setDetailOpen(true);
  };

  const setStatus = (id: string, status: string) => {
    setSubchains((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Deployment wizard
  const deploySteps = ["基础配置", "共识配置", "成员配置", "确认部署"];
  const handleDeploy = () => {
    const id = generateId(subchains);
    const members = deployConfig.members.split(",").map((m: string) => m.trim()).filter(Boolean);
    const newSubchain: Subchain = {
      id, name: deployConfig.name, desc: deployConfig.desc,
      status: "running", parentChain: deployConfig.parentChain, members,
      nodes: Number(deployConfig.nodes), blockHeight: 0, txCount: 0,
      createTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      creator: "管理员", isolation: deployConfig.isolation,
      version: "v1.0.0", tps: 0,
    };
    setSubchains((prev) => [...prev, newSubchain]);
    setDeployOpen(false);
    setDeployStep(0);
    setDeployConfig({ name: "", desc: "", parentChain: "主联盟链", isolation: "成员范围隔离", consensus: "PBFT", blockInterval: 2, blockSize: 1000, members: "", nodes: 4 });
  };

  // Upgrade
  const openUpgrade = (sc: Subchain) => {
    setUpgradeTarget(sc);
    setNewVersion("");
    setCompatCheck("idle");
    setUpgradeOpen(true);
  };

  const checkCompatibility = () => {
    setCompatCheck("checking");
    setTimeout(() => {
      setCompatCheck(Math.random() > 0.3 ? "compatible" : "incompatible");
    }, 1000);
  };

  const handleUpgrade = () => {
    if (!upgradeTarget) return;
    setSubchains(prev => prev.map(s => s.id === upgradeTarget.id ? { ...s, version: newVersion } : s));
    setUpgradeOpen(false);
    setUpgradeTarget(null);
  };

  const handleRollback = (sc: Subchain) => {
    const prevVersion = sc.version.replace(/\d+$/, (m) => String(Math.max(0, parseInt(m) - 1)));
    setSubchains(prev => prev.map(s => s.id === sc.id ? { ...s, version: prevVersion } : s));
  };

  // Cross-tx
  const handleCreateCrossTx = () => {
    const channel = channels.find(c => c.id === crossTxForm.channelId);
    if (!channel) return;
    const newTx: CrossTx = {
      id: `CTX-${Date.now().toString(36).toUpperCase()}`,
      channelId: crossTxForm.channelId,
      fromChain: channel.fromChain,
      toChain: channel.toChain,
      status: "pending",
      payload: crossTxForm.payload,
      createTime: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    setCrossTxs([newTx, ...crossTxs]);
    setCrossTxOpen(false);
    setCrossTxForm({ channelId: "", payload: "" });
  };

  // Anchor
  const handleCreateAnchor = () => {
    const newAnchor: AnchorRecord = {
      id: `AN-${Date.now().toString(36).toUpperCase()}`,
      subchainId: anchorForm.subchainId,
      period: Number(anchorForm.period),
      content: anchorForm.content,
      status: "active",
      lastAnchorTime: new Date().toLocaleString("zh-CN", { hour12: false }),
      anchorCount: 0,
    };
    setAnchors([newAnchor, ...anchors]);
    setAnchorOpen(false);
    setAnchorForm({ subchainId: "", period: 300, content: "区块哈希根" });
  };

  // Mock monitoring data
  const tpsData = [
    { time: "00:00", tps: 80 }, { time: "04:00", tps: 95 }, { time: "08:00", tps: 150 },
    { time: "12:00", tps: 200 }, { time: "16:00", tps: 180 }, { time: "20:00", tps: 120 },
  ];
  const blockHeightData = [
    { time: "00:00", height: 152000 }, { time: "04:00", height: 152080 },
    { time: "08:00", height: 152160 }, { time: "12:00", height: 152240 },
    { time: "16:00", height: 152320 }, { time: "20:00", height: 152400 },
  ];

  const detailData = detailSubchain
    ? {
        ...detailSubchain,
        blockHeight: detailSubchain.blockHeight.toLocaleString(),
        txCount: detailSubchain.txCount.toLocaleString(),
      }
    : {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">应用子链管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">基于联盟链创建业务隔离或成员范围隔离的子链</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5 text-sm" onClick={() => setDeployOpen(true)}>
            <Rocket className="w-4 h-4" /> 部署向导
          </Button>
          <Button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> 创建子链
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="subchains" className="gap-1"><Layers className="w-4 h-4" /> 子链列表</TabsTrigger>
          <TabsTrigger value="cross" className="gap-1"><ArrowLeftRight className="w-4 h-4" /> 跨链通信</TabsTrigger>
          <TabsTrigger value="anchor" className="gap-1"><Anchor className="w-4 h-4" /> 锚定配置</TabsTrigger>
          <TabsTrigger value="monitor" className="gap-1"><Monitor className="w-4 h-4" /> 监控面板</TabsTrigger>
        </TabsList>

        {/* Subchains Tab */}
        <TabsContent value="subchains" className="mt-4 space-y-4">
          {/* Search */}
          <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="搜索子链名称、编号..." value={search} onChange={(e) => setSearch(e.target.value)} className={cn("w-full pl-9 pr-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
            </div>
          </div>

          {/* Subchain Cards */}
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((sc) => (
              <div
                key={sc.id}
                onClick={() => openDetail(sc)}
                className={cn(
                  "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
                  "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sc.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500 font-mono">{sc.id}</span>
                        <StatusBadge status={sc.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {sc.status !== "running" && (
                      <Button size="sm" variant="ghost" title="启动" onClick={() => setStatus(sc.id, "running")}>
                        <Play className="w-3.5 h-3.5 text-emerald-500" />
                      </Button>
                    )}
                    {sc.status === "running" && (
                      <Button size="sm" variant="ghost" title="暂停" onClick={() => setStatus(sc.id, "paused")}>
                        <Pause className="w-3.5 h-3.5 text-amber-500" />
                      </Button>
                    )}
                    {sc.status !== "stopped" && (
                      <Button size="sm" variant="ghost" title="停止" onClick={() => setStatus(sc.id, "stopped")}>
                        <Square className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" title="升级" onClick={() => openUpgrade(sc)}>
                      <Rocket className="w-3.5 h-3.5 text-indigo-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDetail(sc)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(sc)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(sc)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{sc.desc}</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.blockHeight.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">区块高度</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.txCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">交易数</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.nodes}</div>
                    <div className="text-[10px] text-slate-500">节点数</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#334155]">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sc.members.length} 成员</span>
                  <span>{sc.isolation}</span>
                  <span>{sc.version}</span>
                  <span>{sc.createTime}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Cross-Subchain Communication Tab */}
        <TabsContent value="cross" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">跨子链通信</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setCrossTxOpen(true)}>
                <ArrowLeftRight className="w-4 h-4" /> 发起跨链交易
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> 通信通道</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["通道ID", "名称", "源链", "目标链", "状态", "延迟(ms)"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.map(ch => (
                      <TableRow key={ch.id}>
                        <TableCell className="font-mono text-xs">{ch.id}</TableCell>
                        <TableCell className="text-sm">{ch.name}</TableCell>
                        <TableCell className="text-xs">{ch.fromChain}</TableCell>
                        <TableCell className="text-xs">{ch.toChain}</TableCell>
                        <TableCell><StatusBadge status={ch.status} /></TableCell>
                        <TableCell className="text-sm">{ch.latency > 0 ? ch.latency : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> 跨链交易记录</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["交易ID", "通道", "内容", "状态", "创建时间"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crossTxs.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                        <TableCell className="text-xs">{tx.channelId}</TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{tx.payload}</TableCell>
                        <TableCell><StatusBadge status={tx.status} /></TableCell>
                        <TableCell className="text-xs">{tx.createTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anchor Tab */}
        <TabsContent value="anchor" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">锚定配置</h2>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setAnchorOpen(true)}>
              <Anchor className="w-4 h-4" /> 新建锚定
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Anchor className="w-4 h-4 text-indigo-500" /> 锚定配置列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["锚定ID", "子链", "周期(s)", "内容", "状态", "锚定次数"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anchors.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">{a.id}</TableCell>
                        <TableCell className="text-sm">{a.subchainId}</TableCell>
                        <TableCell className="text-sm">{a.period}</TableCell>
                        <TableCell className="text-xs">{a.content}</TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                        <TableCell className="text-sm">{a.anchorCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><HistoryIcon className="w-4 h-4 text-emerald-500" /> 锚定历史</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["历史ID", "锚定", "高度", "哈希", "时间", "状态"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anchorHistory.map(h => (
                      <TableRow key={h.id}>
                        <TableCell className="font-mono text-xs">{h.id}</TableCell>
                        <TableCell className="text-xs">{h.anchorId}</TableCell>
                        <TableCell className="text-sm">{h.height}</TableCell>
                        <TableCell className="font-mono text-xs">{h.hash}</TableCell>
                        <TableCell className="text-xs">{h.time}</TableCell>
                        <TableCell><StatusBadge status={h.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="mt-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "平均TPS", value: "138", icon: <TrendingUp className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "总区块高度", value: "357,580", icon: <Blocks className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "在线节点", value: "26/26", icon: <Server className="w-5 h-5 text-violet-500" />, color: "bg-violet-50 dark:bg-violet-900/20" },
              { label: "资源使用率", value: "62%", icon: <Cpu className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
            ].map((s, i) => (
              <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> TPS 趋势</CardTitle>
              </CardHeader>
              <CardContent><TpsChart data={tpsData} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Blocks className="w-4 h-4 text-emerald-500" /> 区块高度增长</CardTitle>
              </CardHeader>
              <CardContent><BlockHeightChart data={blockHeightData} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4 text-amber-500" /> 资源使用趋势</CardTitle>
              </CardHeader>
              <CardContent><ResourceUsageChart /></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4 text-violet-500" /> 节点状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {subchains.flatMap(sc =>
                  Array.from({ length: sc.nodes }, (_, i) => ({
                    id: `${sc.id}-N${i + 1}`,
                    name: `${sc.name}-节点${i + 1}`,
                    status: sc.status === "running" ? "online" : sc.status === "paused" ? "paused" : "offline",
                    cpu: Math.floor(Math.random() * 40) + 20,
                    memory: Math.floor(Math.random() * 30) + 40,
                  }))
                ).slice(0, 8).map(node => (
                  <div key={node.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{node.name}</span>
                      <span className={cn("w-2 h-2 rounded-full", node.status === "online" ? "bg-emerald-500" : node.status === "paused" ? "bg-amber-500" : "bg-red-500")} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">CPU</span><span>{node.cpu}%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${node.cpu}%` }} /></div>
                      <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">内存</span><span>{node.memory}%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: `${node.memory}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`子链详情 - ${detailSubchain?.name || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailSubchain ? () => handleEdit(detailSubchain) : undefined}
        onDelete={detailSubchain ? () => handleDelete(detailSubchain) : undefined}
      >
        {detailSubchain && (
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => openUpgrade(detailSubchain)}>
                <Rocket className="w-3.5 h-3.5" /> 升级
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleRollback(detailSubchain)}>
                <Undo2 className="w-3.5 h-3.5" /> 回滚
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-sm font-medium mb-2">实时监控</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">当前TPS</div>
                  <div className="text-lg font-bold">{detailSubchain.tps}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">版本</div>
                  <div className="text-lg font-bold">{detailSubchain.version}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${subchains.find((s) => s.id === editingId)?.name || "子链"}` : "子链"}
        fields={subchainFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Deployment Wizard Dialog */}
      <Dialog open={deployOpen} onOpenChange={setDeployOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Rocket className="w-5 h-5 text-indigo-500" />子链部署向导</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-6">
              {deploySteps.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    i < deployStep ? "bg-emerald-500 text-white" :
                    i === deployStep ? "bg-indigo-600 text-white" :
                    "bg-slate-200 text-slate-500 dark:bg-slate-700"
                  )}>
                    {i < deployStep ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn("ml-2 text-sm", i === deployStep ? "font-medium text-indigo-600" : "text-slate-500")}>{step}</span>
                  {i < deploySteps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 mx-2" />}
                </div>
              ))}
            </div>
            <Progress value={((deployStep + 1) / deploySteps.length) * 100} className="mb-6" />

            {deployStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">子链名称 <span className="text-red-500">*</span></label><Input value={deployConfig.name} onChange={e => setDeployConfig({ ...deployConfig, name: e.target.value })} placeholder="输入子链名称" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">描述 <span className="text-red-500">*</span></label><Textarea value={deployConfig.desc} onChange={e => setDeployConfig({ ...deployConfig, desc: e.target.value })} placeholder="输入子链描述" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">父链</label><Input value={deployConfig.parentChain} onChange={e => setDeployConfig({ ...deployConfig, parentChain: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">隔离方式</label>
                  <Select value={deployConfig.isolation} onValueChange={v => setDeployConfig({ ...deployConfig, isolation: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="成员范围隔离">成员范围隔离</SelectItem>
                      <SelectItem value="业务隔离">业务隔离</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {deployStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">共识算法</label>
                  <Select value={deployConfig.consensus} onValueChange={v => setDeployConfig({ ...deployConfig, consensus: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PBFT">PBFT</SelectItem>
                      <SelectItem value="Raft">Raft</SelectItem>
                      <SelectItem value="Tendermint">Tendermint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">出块间隔(秒)</label><Input type="number" value={deployConfig.blockInterval} onChange={e => setDeployConfig({ ...deployConfig, blockInterval: Number(e.target.value) })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">区块大小(交易数)</label><Input type="number" value={deployConfig.blockSize} onChange={e => setDeployConfig({ ...deployConfig, blockSize: Number(e.target.value) })} /></div>
              </div>
            )}

            {deployStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">成员列表（逗号分隔）</label><Textarea value={deployConfig.members} onChange={e => setDeployConfig({ ...deployConfig, members: e.target.value })} placeholder="成员A,成员B,成员C" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">节点数</label><Input type="number" value={deployConfig.nodes} onChange={e => setDeployConfig({ ...deployConfig, nodes: Number(e.target.value) })} /></div>
              </div>
            )}

            {deployStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                  <div className="text-sm font-medium mb-2">配置确认</div>
                  {[
                    { label: "子链名称", value: deployConfig.name },
                    { label: "描述", value: deployConfig.desc },
                    { label: "父链", value: deployConfig.parentChain },
                    { label: "隔离方式", value: deployConfig.isolation },
                    { label: "共识算法", value: deployConfig.consensus },
                    { label: "出块间隔", value: `${deployConfig.blockInterval}秒` },
                    { label: "区块大小", value: `${deployConfig.blockSize}笔` },
                    { label: "成员", value: deployConfig.members || "-" },
                    { label: "节点数", value: deployConfig.nodes },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (deployStep > 0) setDeployStep(deployStep - 1); else setDeployOpen(false); }}>
              {deployStep > 0 ? "上一步" : "取消"}
            </Button>
            {deployStep < deploySteps.length - 1 ? (
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setDeployStep(deployStep + 1)}>下一步</Button>
            ) : (
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={handleDeploy}>
                <Rocket className="w-4 h-4" /> 确认部署
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Rocket className="w-5 h-5 text-indigo-500" />子链升级</DialogTitle>
          </DialogHeader>
          {upgradeTarget && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                <div className="text-xs text-slate-500">目标子链</div>
                <div className="text-sm font-medium">{upgradeTarget.name} ({upgradeTarget.id})</div>
                <div className="text-xs text-slate-500 mt-1">当前版本: {upgradeTarget.version}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">新版本号</label>
                <Input value={newVersion} onChange={e => { setNewVersion(e.target.value); setCompatCheck("idle"); }} placeholder="例如: v1.3.0" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={checkCompatibility} disabled={!newVersion || compatCheck === "checking"}>
                  <FileCheck className="w-3.5 h-3.5" /> 兼容性检查
                </Button>
              </div>
              {compatCheck === "checking" && <div className="text-sm text-slate-500 flex items-center gap-1"><RefreshCw className="w-4 h-4 animate-spin" /> 检查中...</div>}
              {compatCheck === "compatible" && <div className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 兼容，可以升级</div>}
              {compatCheck === "incompatible" && <div className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> 不兼容，请检查版本</div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleUpgrade} disabled={compatCheck !== "compatible"}>确认升级</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cross-Tx Dialog */}
      <Dialog open={crossTxOpen} onOpenChange={setCrossTxOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="w-5 h-5 text-blue-500" />发起跨链交易</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择通道 <span className="text-red-500">*</span></label>
              <Select value={crossTxForm.channelId} onValueChange={v => setCrossTxForm({ ...crossTxForm, channelId: v })}>
                <SelectTrigger><SelectValue placeholder="选择通信通道" /></SelectTrigger>
                <SelectContent>
                  {channels.filter(c => c.status === "active").map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.fromChain} → {c.toChain})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">交易内容 <span className="text-red-500">*</span></label>
              <Textarea value={crossTxForm.payload} onChange={e => setCrossTxForm({ ...crossTxForm, payload: e.target.value })} placeholder="输入跨链交易内容" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrossTxOpen(false)}>取消</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateCrossTx} disabled={!crossTxForm.channelId || !crossTxForm.payload}>发起交易</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anchor Dialog */}
      <Dialog open={anchorOpen} onOpenChange={setAnchorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Anchor className="w-5 h-5 text-indigo-500" />新建锚定配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">目标子链 <span className="text-red-500">*</span></label>
              <Select value={anchorForm.subchainId} onValueChange={v => setAnchorForm({ ...anchorForm, subchainId: v })}>
                <SelectTrigger><SelectValue placeholder="选择子链" /></SelectTrigger>
                <SelectContent>
                  {subchains.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.id})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">锚定周期(秒)</label>
              <Input type="number" value={anchorForm.period} onChange={e => setAnchorForm({ ...anchorForm, period: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">锚定内容</label>
              <Select value={anchorForm.content} onValueChange={v => setAnchorForm({ ...anchorForm, content: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="区块哈希根">区块哈希根</SelectItem>
                  <SelectItem value="状态根">状态根</SelectItem>
                  <SelectItem value="交易默克尔根">交易默克尔根</SelectItem>
                  <SelectItem value="区块哈希根+状态根">区块哈希根+状态根</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnchorOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreateAnchor} disabled={!anchorForm.subchainId}>创建锚定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
