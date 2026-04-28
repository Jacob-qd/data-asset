import { useState, useEffect, useRef, useMemo } from "react";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash,
  Play,
  Square,
  RotateCw,
  ArrowUpCircle,
  Archive,
  Tag,
  Filter,
  Monitor,
  Layers,
  Activity,
  Wifi,
  HardDrive,
  Clock,
  Box,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import DataTable from "@/components/DataTable";
import * as echarts from "echarts";

/* ─── Types ─── */
interface Node {
  id: string;
  name: string;
  role: string;
  status: "online" | "warning" | "offline";
  ip: string;
  region: string;
  cpu: number;
  memory: number;
  disk: number;
  latency: string;
  uptime: string;
  lastBlock: number;
  version: string;
  tags: string[];
  groupId?: string;
  cpuHistory: number[];
  memHistory: number[];
  diskHistory: number[];
  netHistory: number[];
}

interface NodeGroup {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
}

interface LogEntry {
  time: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
}

interface Peer {
  id: string;
  address: string;
  latency: string;
  status: string;
}

/* ─── Helpers ─── */
function generateId() {
  return Date.now().toString(36).toUpperCase();
}

function drift(value: number, min: number, max: number, delta: number) {
  const next = value + (Math.random() - 0.5) * delta * 2;
  return Math.max(min, Math.min(max, Math.round(next)));
}

function genHistory(base: number, len: number, min: number, max: number) {
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v = drift(v, min, max, 5);
    arr.push(v);
  }
  return arr;
}

function genLogs(nodeName: string): LogEntry[] {
  const levels: LogEntry["level"][] = ["DEBUG", "INFO", "WARN", "ERROR"];
  const templates = [
    "区块同步完成",
    "接收到新区块",
    "网络连接稳定",
    "内存使用率上升",
    "磁盘空间检查通过",
    "交易验证成功",
    "共识算法运行中",
    "节点心跳检测正常",
    "发现新对等节点",
    "配置重新加载完成",
    "警告: 响应时间延长",
    "错误: 连接超时",
  ];
  const logs: LogEntry[] = [];
  const now = new Date();
  for (let i = 0; i < 100; i++) {
    const t = new Date(now.getTime() - i * 60000);
    logs.push({
      time: t.toLocaleString("zh-CN"),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: `[${nodeName}] ${templates[Math.floor(Math.random() * templates.length)]} #${1000 + i}`,
    });
  }
  return logs.reverse();
}

function genPeers(): Peer[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `peer-${String(i + 1).padStart(2, "0")}`,
    address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${30000 + i}`,
    latency: `${Math.floor(Math.random() * 50 + 5)}ms`,
    status: Math.random() > 0.2 ? "online" : "offline",
  }));
}

/* ─── Mock Nodes Data ─── */
const initialNodes: Node[] = [
  { id: "node-01", name: "共识节点-01", role: "共识节点", status: "online", ip: "192.168.10.11", region: "北京", cpu: 42, memory: 58, disk: 67, latency: "12ms", uptime: "99.98%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "consensus"], groupId: "g1", cpuHistory: genHistory(42, 20, 10, 90), memHistory: genHistory(58, 20, 20, 90), diskHistory: genHistory(67, 20, 30, 95), netHistory: genHistory(30, 20, 5, 80) },
  { id: "node-02", name: "共识节点-02", role: "共识节点", status: "online", ip: "192.168.10.12", region: "北京", cpu: 38, memory: 52, disk: 61, latency: "15ms", uptime: "99.95%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "consensus"], groupId: "g1", cpuHistory: genHistory(38, 20, 10, 90), memHistory: genHistory(52, 20, 20, 90), diskHistory: genHistory(61, 20, 30, 95), netHistory: genHistory(25, 20, 5, 80) },
  { id: "node-03", name: "共识节点-03", role: "共识节点", status: "online", ip: "192.168.10.13", region: "上海", cpu: 45, memory: 60, disk: 70, latency: "11ms", uptime: "99.99%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "consensus"], groupId: "g1", cpuHistory: genHistory(45, 20, 10, 90), memHistory: genHistory(60, 20, 20, 90), diskHistory: genHistory(70, 20, 30, 95), netHistory: genHistory(28, 20, 5, 80) },
  { id: "node-04", name: "共识节点-04", role: "共识节点", status: "warning", ip: "192.168.10.14", region: "上海", cpu: 78, memory: 82, disk: 75, latency: "45ms", uptime: "98.50%", lastBlock: 4285690, version: "v2.4.0", tags: ["prod", "consensus", "deprecated"], groupId: "g1", cpuHistory: genHistory(78, 20, 10, 90), memHistory: genHistory(82, 20, 20, 90), diskHistory: genHistory(75, 20, 30, 95), netHistory: genHistory(45, 20, 5, 80) },
  { id: "node-05", name: "共识节点-05", role: "共识节点", status: "online", ip: "192.168.10.15", region: "广州", cpu: 35, memory: 48, disk: 55, latency: "18ms", uptime: "99.92%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "consensus"], groupId: "g1", cpuHistory: genHistory(35, 20, 10, 90), memHistory: genHistory(48, 20, 20, 90), diskHistory: genHistory(55, 20, 30, 95), netHistory: genHistory(22, 20, 5, 80) },
  { id: "node-06", name: "存储节点-01", role: "存储节点", status: "online", ip: "192.168.20.21", region: "北京", cpu: 28, memory: 65, disk: 82, latency: "20ms", uptime: "99.85%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "storage"], groupId: "g2", cpuHistory: genHistory(28, 20, 10, 90), memHistory: genHistory(65, 20, 20, 90), diskHistory: genHistory(82, 20, 30, 95), netHistory: genHistory(35, 20, 5, 80) },
  { id: "node-07", name: "存储节点-02", role: "存储节点", status: "online", ip: "192.168.20.22", region: "上海", cpu: 32, memory: 70, disk: 88, latency: "22ms", uptime: "99.80%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "storage"], groupId: "g2", cpuHistory: genHistory(32, 20, 10, 90), memHistory: genHistory(70, 20, 20, 90), diskHistory: genHistory(88, 20, 30, 95), netHistory: genHistory(38, 20, 5, 80) },
  { id: "node-08", name: "存储节点-03", role: "存储节点", status: "offline", ip: "192.168.20.23", region: "广州", cpu: 0, memory: 0, disk: 0, latency: "-", uptime: "95.20%", lastBlock: 4285000, version: "v2.3.5", tags: ["prod", "storage", "maintenance"], groupId: "g2", cpuHistory: genHistory(0, 20, 0, 0), memHistory: genHistory(0, 20, 0, 0), diskHistory: genHistory(0, 20, 0, 0), netHistory: genHistory(0, 20, 0, 0) },
  { id: "node-09", name: "观察节点-01", role: "观察节点", status: "online", ip: "192.168.30.31", region: "深圳", cpu: 15, memory: 30, disk: 40, latency: "25ms", uptime: "99.90%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "observer"], groupId: "g3", cpuHistory: genHistory(15, 20, 10, 90), memHistory: genHistory(30, 20, 20, 90), diskHistory: genHistory(40, 20, 30, 95), netHistory: genHistory(15, 20, 5, 80) },
  { id: "node-10", name: "观察节点-02", role: "观察节点", status: "online", ip: "192.168.30.32", region: "杭州", cpu: 18, memory: 35, disk: 45, latency: "30ms", uptime: "99.88%", lastBlock: 4285691, version: "v2.4.1", tags: ["prod", "observer"], groupId: "g3", cpuHistory: genHistory(18, 20, 10, 90), memHistory: genHistory(35, 20, 20, 90), diskHistory: genHistory(45, 20, 30, 95), netHistory: genHistory(18, 20, 5, 80) },
];

const initialGroups: NodeGroup[] = [
  { id: "g1", name: "共识集群", description: "负责区块共识的核心节点集群", nodeIds: ["node-01", "node-02", "node-03", "node-04", "node-05"] },
  { id: "g2", name: "存储集群", description: "负责数据存储与归档的节点集群", nodeIds: ["node-06", "node-07", "node-08"] },
  { id: "g3", name: "观察集群", description: "只读观察节点，不参与共识", nodeIds: ["node-09", "node-10"] },
];

const AVAILABLE_VERSIONS = ["v2.4.1", "v2.4.0", "v2.3.5", "v2.3.4", "v2.3.3"];

/* ─── Status Badge ─── */
function NodeStatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; icon: React.ReactNode; class: string }> = {
    online: { text: "运行中", icon: <CheckCircle2 className="w-3 h-3" />, class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    warning: { text: "警告", icon: <AlertTriangle className="w-3 h-3" />, class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    offline: { text: "离线", icon: <XCircle className="w-3 h-3" />, class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.offline;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {c.icon}
      {c.text}
    </span>
  );
}

/* ─── Mini Progress Bar ─── */
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <span className="text-xs text-slate-400">-</span>;
  const w = 60, h = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

/* ─── ECharts Line Chart Component ─── */
function LineChart({ option }: { option: echarts.EChartsOption }) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (ref.current) {
      inst.current = echarts.init(ref.current);
      inst.current.setOption(option);
      const ro = new ResizeObserver(() => inst.current?.resize());
      ro.observe(ref.current);
      return () => {
        ro.disconnect();
        inst.current?.dispose();
        inst.current = null;
      };
    }
  }, [option]);
  return <div ref={ref} className="w-full h-48" />;
}

/* ─── Fields ─── */
const nodeFields: FieldConfig[] = [
  { key: "name", label: "节点名称", type: "text", required: true },
  { key: "role", label: "角色", type: "select", required: true, options: [
    { label: "共识节点", value: "共识节点" },
    { label: "存储节点", value: "存储节点" },
    { label: "观察节点", value: "观察节点" },
    { label: "排序节点", value: "排序节点" },
    { label: "锚定节点", value: "锚定节点" },
    { label: "网关节点", value: "网关节点" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "online" },
    { label: "警告", value: "warning" },
    { label: "离线", value: "offline" },
  ]},
  { key: "ip", label: "IP 地址", type: "text", required: true },
  { key: "region", label: "地区", type: "text", required: true },
  { key: "cpu", label: "CPU 使用率", type: "number", required: true },
  { key: "memory", label: "内存使用率", type: "number", required: true },
  { key: "disk", label: "磁盘使用率", type: "number", required: true },
  { key: "latency", label: "网络延迟", type: "text", required: true },
  { key: "uptime", label: "运行时间", type: "text", required: true },
  { key: "lastBlock", label: "最新区块", type: "number", required: true },
  { key: "version", label: "版本", type: "text", required: true },
  { key: "tags", label: "标签", type: "text", required: false, placeholder: "逗号分隔" },
];

const groupFields: FieldConfig[] = [
  { key: "name", label: "组名称", type: "text", required: true },
  { key: "description", label: "描述", type: "textarea", required: false },
];

function generateNodeId(nodes: Node[]): string {
  const maxNum = nodes.reduce((max, n) => {
    const match = n.id.match(/node-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `node-${String(maxNum + 1).padStart(2, "0")}`;
}

/* ─── Main ─── */
export default function BlockchainNodes() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [groups, setGroups] = useState<NodeGroup[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("全部");
  const [groupFilter, setGroupFilter] = useState("全部");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewTab, setViewTab] = useState<"nodes" | "groups">("nodes");

  // CRUD dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [groupDialogData, setGroupDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Lifecycle dialogs
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState<"start" | "stop" | "restart">("start");
  const [lifecycleNodeId, setLifecycleNodeId] = useState<string | null>(null);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeNodeId, setUpgradeNodeId] = useState<string | null>(null);
  const [upgradeVersion, setUpgradeVersion] = useState("v2.4.1");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);

  const [retireOpen, setRetireOpen] = useState(false);
  const [retireNodeId, setRetireNodeId] = useState<string | null>(null);

  // Batch tag dialog
  const [batchTagOpen, setBatchTagOpen] = useState(false);
  const [batchTagMode, setBatchTagMode] = useState<"add" | "remove">("add");
  const [batchTagValue, setBatchTagValue] = useState("");

  // Node detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailNode, setDetailNode] = useState<Node | null>(null);
  const [detailTab, setDetailTab] = useState("basic");

  // Group detail
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<NodeGroup | null>(null);

  // Logs filter
  const [logLevel, setLogLevel] = useState<"ALL" | "DEBUG" | "INFO" | "WARN" | "ERROR">("ALL");
  const [logSearch, setLogSearch] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  const roles = ["全部", "共识节点", "存储节点", "观察节点", "排序节点", "锚定节点", "网关节点"];

  const stats = {
    total: nodes.length,
    online: nodes.filter((n) => n.status === "online").length,
    warning: nodes.filter((n) => n.status === "warning").length,
    offline: nodes.filter((n) => n.status === "offline").length,
  };

  /* ─── Real-time Metrics Simulation ─── */
  useEffect(() => {
    const id = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.status !== "online") return n;
          const cpu = drift(n.cpu, 5, 95, 8);
          const memory = drift(n.memory, 10, 92, 5);
          const disk = Math.min(100, drift(n.disk, 20, 100, 1));
          const net = drift(n.netHistory[n.netHistory.length - 1] ?? 30, 5, 100, 10);
          const cpuHistory = [...n.cpuHistory.slice(1), cpu];
          const memHistory = [...n.memHistory.slice(1), memory];
          const diskHistory = [...n.diskHistory.slice(1), disk];
          const netHistory = [...n.netHistory.slice(1), net];
          const status = cpu > 90 || memory > 85 ? "warning" : "online";
          return { ...n, cpu, memory, disk, status, cpuHistory, memHistory, diskHistory, netHistory };
        })
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* ─── Filtered Nodes ─── */
  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      if (roleFilter !== "全部" && n.role !== roleFilter) return false;
      if (groupFilter !== "全部" && n.groupId !== groupFilter) return false;
      if (search && !n.name.includes(search) && !n.ip.includes(search) && !n.tags.some((t) => t.includes(search))) return false;
      return true;
    });
  }, [nodes, roleFilter, groupFilter, search]);

  /* ─── Detail Data ─── */
  const detailData = useMemo<Record<string, any>>(() => {
    if (!detailNode) return {};
    return {
      ...detailNode,
      status: detailNode.status === "online" ? "运行中" : detailNode.status === "warning" ? "警告" : "离线",
      cpu: `${detailNode.cpu}%`,
      memory: `${detailNode.memory}%`,
      disk: `${detailNode.disk}%`,
      lastBlock: detailNode.lastBlock.toLocaleString(),
      tags: detailNode.tags.join(", "),
    };
  }, [detailNode]);

  const detailFields = [
    { key: "id", label: "节点ID", type: "text" as const },
    { key: "name", label: "节点名称", type: "text" as const },
    { key: "role", label: "角色", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "ip", label: "IP 地址", type: "text" as const },
    { key: "region", label: "地区", type: "text" as const },
    { key: "version", label: "版本", type: "text" as const },
    { key: "uptime", label: "运行时间", type: "text" as const },
    { key: "latency", label: "网络延迟", type: "text" as const },
    { key: "lastBlock", label: "最新区块", type: "text" as const },
    { key: "cpu", label: "CPU 使用率", type: "text" as const },
    { key: "memory", label: "内存使用率", type: "text" as const },
    { key: "disk", label: "磁盘使用率", type: "text" as const },
    { key: "tags", label: "标签", type: "text" as const },
  ];

  /* ─── Handlers ─── */
  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "",
      role: "共识节点",
      status: "online",
      ip: "",
      region: "",
      cpu: 0,
      memory: 0,
      disk: 0,
      latency: "0ms",
      uptime: "100%",
      lastBlock: 0,
      version: "v2.4.1",
      tags: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (node: Node) => {
    setDialogMode("edit");
    setDialogData({
      name: node.name,
      role: node.role,
      status: node.status,
      ip: node.ip,
      region: node.region,
      cpu: node.cpu,
      memory: node.memory,
      disk: node.disk,
      latency: node.latency,
      uptime: node.uptime,
      lastBlock: node.lastBlock,
      version: node.version,
      tags: node.tags.join(","),
    });
    setEditingId(node.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (node: Node) => {
    setDialogMode("delete");
    setEditingId(node.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const parseTags = (s: string) => s.split(",").map((t: string) => t.trim()).filter(Boolean);
    if (dialogMode === "create") {
      const id = generateNodeId(nodes);
      const newNode: Node = {
        id,
        name: data.name,
        role: data.role,
        status: data.status,
        ip: data.ip,
        region: data.region,
        cpu: Number(data.cpu),
        memory: Number(data.memory),
        disk: Number(data.disk),
        latency: data.latency,
        uptime: data.uptime,
        lastBlock: Number(data.lastBlock),
        version: data.version,
        tags: parseTags(data.tags || ""),
        cpuHistory: genHistory(Number(data.cpu), 20, 0, 100),
        memHistory: genHistory(Number(data.memory), 20, 0, 100),
        diskHistory: genHistory(Number(data.disk), 20, 0, 100),
        netHistory: genHistory(30, 20, 0, 100),
      };
      setNodes((prev) => [...prev, newNode]);
    } else if (dialogMode === "edit" && editingId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? {
                ...n,
                name: data.name,
                role: data.role,
                status: data.status,
                ip: data.ip,
                region: data.region,
                cpu: Number(data.cpu),
                memory: Number(data.memory),
                disk: Number(data.disk),
                latency: data.latency,
                uptime: data.uptime,
                lastBlock: Number(data.lastBlock),
                version: data.version,
                tags: parseTags(data.tags || ""),
              }
            : n
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setNodes((prev) => prev.filter((n) => n.id !== editingId));
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(editingId); return s; });
    }
    setDialogOpen(false);
  };

  const openDetail = (node: Node) => {
    setDetailNode(node);
    setDetailOpen(true);
    setDetailTab("basic");
  };

  /* ─── Lifecycle ─── */
  const openLifecycle = (node: Node, action: "start" | "stop" | "restart") => {
    setLifecycleNodeId(node.id);
    setLifecycleAction(action);
    setLifecycleOpen(true);
  };

  const confirmLifecycle = () => {
    if (!lifecycleNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== lifecycleNodeId) return n;
        if (lifecycleAction === "start") return { ...n, status: "online" };
        if (lifecycleAction === "stop") return { ...n, status: "offline" };
        if (lifecycleAction === "restart") {
          setTimeout(() => {
            setNodes((p) => p.map((nn) => (nn.id === lifecycleNodeId ? { ...nn, status: "online" } : nn)));
          }, 2000);
          return { ...n, status: "offline" };
        }
        return n;
      })
    );
    setLifecycleOpen(false);
  };

  const openUpgrade = (node: Node) => {
    setUpgradeNodeId(node.id);
    setUpgradeVersion(node.version);
    setUpgradeProgress(0);
    setUpgrading(false);
    setUpgradeOpen(true);
  };

  const confirmUpgrade = () => {
    if (!upgradeNodeId) return;
    setUpgrading(true);
    setUpgradeProgress(0);
    const interval = setInterval(() => {
      setUpgradeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setNodes((prev) => prev.map((n) => (n.id === upgradeNodeId ? { ...n, version: upgradeVersion } : n)));
          setUpgrading(false);
          setUpgradeOpen(false);
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  const openRetire = (node: Node) => {
    setRetireNodeId(node.id);
    setRetireOpen(true);
  };

  const confirmRetire = () => {
    if (!retireNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== retireNodeId));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(retireNodeId); return s; });
    setRetireOpen(false);
  };

  /* ─── Batch Operations ─── */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n.id)));
    }
  };

  const batchStart = () => {
    setNodes((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, status: "online" } : n)));
  };

  const batchStop = () => {
    setNodes((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, status: "offline" } : n)));
  };

  const batchRestart = () => {
    setNodes((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, status: "offline" } : n)));
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, status: "online" } : n)));
      setSelectedIds(new Set());
    }, 2000);
  };

  const batchDelete = () => {
    setNodes((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  const openBatchTag = (mode: "add" | "remove") => {
    setBatchTagMode(mode);
    setBatchTagValue("");
    setBatchTagOpen(true);
  };

  const confirmBatchTag = () => {
    const tag = batchTagValue.trim();
    if (!tag) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (!selectedIds.has(n.id)) return n;
        if (batchTagMode === "add") {
          return n.tags.includes(tag) ? n : { ...n, tags: [...n.tags, tag] };
        } else {
          return { ...n, tags: n.tags.filter((t) => t !== tag) };
        }
      })
    );
    setBatchTagOpen(false);
  };

  /* ─── Group Handlers ─── */
  const handleCreateGroup = () => {
    setGroupDialogMode("create");
    setGroupDialogData({ name: "", description: "" });
    setEditingGroupId(null);
    setGroupDialogOpen(true);
  };

  const handleEditGroup = (group: NodeGroup) => {
    setGroupDialogMode("edit");
    setGroupDialogData({ name: group.name, description: group.description });
    setEditingGroupId(group.id);
    setGroupDialogOpen(true);
  };

  const handleDeleteGroup = (group: NodeGroup) => {
    setGroupDialogMode("delete");
    setEditingGroupId(group.id);
    setGroupDialogOpen(true);
  };

  const handleSubmitGroup = (data: Record<string, any>) => {
    if (groupDialogMode === "create") {
      const id = `g${Date.now().toString(36).toUpperCase()}`;
      setGroups((prev) => [...prev, { id, name: data.name, description: data.description || "", nodeIds: [] }]);
    } else if (groupDialogMode === "edit" && editingGroupId) {
      setGroups((prev) => prev.map((g) => (g.id === editingGroupId ? { ...g, name: data.name, description: data.description || "" } : g)));
    }
    setGroupDialogOpen(false);
  };

  const handleConfirmDeleteGroup = () => {
    if (editingGroupId) {
      setGroups((prev) => prev.filter((g) => g.id !== editingGroupId));
      setNodes((prev) => prev.map((n) => (n.groupId === editingGroupId ? { ...n, groupId: undefined } : n)));
    }
    setGroupDialogOpen(false);
  };

  const openGroupDetail = (group: NodeGroup) => {
    setDetailGroup(group);
    setGroupDetailOpen(true);
  };

  /* ─── Chart Options ─── */
  const perfChartOption = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    if (!detailNode) return {};
    return {
      tooltip: { trigger: "axis" },
      legend: { data: ["CPU", "内存", "磁盘", "网络"], bottom: 0 },
      grid: { left: "3%", right: "4%", bottom: "15%", top: "10%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: hours },
      yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
      series: [
        { name: "CPU", type: "line", smooth: true, data: detailNode.cpuHistory.length >= 24 ? detailNode.cpuHistory.slice(-24) : [...Array(24 - detailNode.cpuHistory.length).fill(detailNode.cpu), ...detailNode.cpuHistory], itemStyle: { color: "#EF4444" } },
        { name: "内存", type: "line", smooth: true, data: detailNode.memHistory.length >= 24 ? detailNode.memHistory.slice(-24) : [...Array(24 - detailNode.memHistory.length).fill(detailNode.memory), ...detailNode.memHistory], itemStyle: { color: "#3B82F6" } },
        { name: "磁盘", type: "line", smooth: true, data: detailNode.diskHistory.length >= 24 ? detailNode.diskHistory.slice(-24) : [...Array(24 - detailNode.diskHistory.length).fill(detailNode.disk), ...detailNode.diskHistory], itemStyle: { color: "#10B981" } },
        { name: "网络", type: "line", smooth: true, data: detailNode.netHistory.length >= 24 ? detailNode.netHistory.slice(-24) : [...Array(24 - detailNode.netHistory.length).fill(detailNode.netHistory[detailNode.netHistory.length - 1] ?? 0), ...detailNode.netHistory], itemStyle: { color: "#F59E0B" } },
      ],
    };
  }, [detailNode]);

  /* ─── Logs ─── */
  const nodeLogs = useMemo(() => {
    if (!detailNode) return [];
    return genLogs(detailNode.name);
  }, [detailNode?.id]);

  const filteredLogs = useMemo(() => {
    return nodeLogs.filter((l) => {
      if (logLevel !== "ALL" && l.level !== logLevel) return false;
      if (logSearch && !l.message.includes(logSearch)) return false;
      return true;
    });
  }, [nodeLogs, logLevel, logSearch]);

  useEffect(() => {
    if (detailTab === "logs") {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, detailTab]);

  /* ─── Peers ─── */
  const peers = useMemo(() => {
    if (!detailNode) return [];
    return genPeers();
  }, [detailNode?.id]);

  /* ─── Table Columns ─── */
  const nodeColumns = [
    {
      key: "select",
      title: (
        <Checkbox
          checked={filtered.length > 0 && selectedIds.size === filtered.length}
          onCheckedChange={toggleSelectAll}
        />
      ),
      width: "40px",
      render: (row: Node) => (
        <Checkbox
          checked={selectedIds.has(row.id)}
          onCheckedChange={() => toggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "name",
      title: "节点名称",
      render: (row: Node) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            row.status === "online" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
            row.status === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30" :
            "bg-red-50 text-red-600 dark:bg-red-900/30"
          )}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <NodeStatusBadge status={row.status} />
              {row.cpu > 90 && <Badge variant="destructive" className="text-[10px] px-1 py-0">CPU高</Badge>}
              {row.memory > 85 && <Badge variant="destructive" className="text-[10px] px-1 py-0">内存高</Badge>}
            </div>
          </div>
        </div>
      ),
    },
    { key: "role", title: "角色" },
    { key: "region", title: "地区" },
    {
      key: "cpu",
      title: "CPU",
      render: (row: Node) => (
        <div className="flex items-center gap-2">
          <MiniBar value={row.cpu} color={row.cpu > 70 ? "#EF4444" : "#10B981"} />
          <span className="text-xs text-slate-600 dark:text-slate-400 w-8">{row.cpu}%</span>
          <Sparkline data={row.cpuHistory} color={row.cpu > 70 ? "#EF4444" : "#10B981"} />
        </div>
      ),
    },
    {
      key: "memory",
      title: "内存",
      render: (row: Node) => (
        <div className="flex items-center gap-2">
          <MiniBar value={row.memory} color={row.memory > 70 ? "#EF4444" : "#3B82F6"} />
          <span className="text-xs text-slate-600 dark:text-slate-400 w-8">{row.memory}%</span>
        </div>
      ),
    },
    {
      key: "disk",
      title: "磁盘",
      render: (row: Node) => (
        <div className="flex items-center gap-2">
          <MiniBar value={row.disk} color={row.disk > 80 ? "#EF4444" : "#10B981"} />
          <span className="text-xs text-slate-600 dark:text-slate-400 w-8">{row.disk}%</span>
        </div>
      ),
    },
    { key: "latency", title: "延迟" },
    { key: "version", title: "版本" },
    {
      key: "actions",
      title: "操作",
      width: "220px",
      render: (row: Node) => (
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          {row.status === "offline" ? (
            <Button size="sm" variant="ghost" onClick={() => openLifecycle(row, "start")} title="启动"><Play className="w-3.5 h-3.5 text-emerald-600" /></Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => openLifecycle(row, "stop")} title="停止"><Square className="w-3.5 h-3.5 text-amber-600" /></Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => openLifecycle(row, "restart")} title="重启"><RotateCw className="w-3.5 h-3.5 text-blue-600" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openUpgrade(row)} title="升级"><ArrowUpCircle className="w-3.5 h-3.5 text-purple-600" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openRetire(row)} title="退役"><Archive className="w-3.5 h-3.5 text-slate-600" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openDetail(row)} title="查看"><Eye className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} title="编辑"><Pencil className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(row)} title="删除"><Trash className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">节点管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">联盟链节点监控、配置与运维管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "nodes" | "groups")}>
            <TabsList>
              <TabsTrigger value="nodes">节点</TabsTrigger>
              <TabsTrigger value="groups">分组</TabsTrigger>
            </TabsList>
          </Tabs>
          {viewTab === "nodes" && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增节点
            </button>
          )}
          {viewTab === "groups" && (
            <button
              onClick={handleCreateGroup}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增分组
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "节点总数", value: stats.total, icon: <Server className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
          { label: "运行中", value: stats.online, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "警告", value: stats.warning, icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "离线", value: stats.offline, icon: <XCircle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
        ].map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={cn(
        "rounded-xl border p-4",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索节点名称、IP地址、标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg border text-sm",
                "bg-white border-slate-200 text-slate-800",
                "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              )}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">角色:</span>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors",
                  roleFilter === r
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {viewTab === "nodes" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">分组:</span>
              {["全部", ...groups.map((g) => g.id)].map((gId) => (
                <button
                  key={gId}
                  onClick={() => setGroupFilter(gId)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs transition-colors",
                    groupFilter === gId
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                  )}
                >
                  {gId === "全部" ? "全部" : groups.find((g) => g.id === gId)?.name || gId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Batch Toolbar */}
      {viewTab === "nodes" && selectedIds.size > 0 && (
        <div className={cn(
          "rounded-xl border p-3 flex items-center gap-2 flex-wrap",
          "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800"
        )}>
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            已选择 {selectedIds.size} 个节点
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={batchStart}><Play className="w-3.5 h-3.5 mr-1" />批量启动</Button>
          <Button size="sm" variant="outline" onClick={batchStop}><Square className="w-3.5 h-3.5 mr-1" />批量停止</Button>
          <Button size="sm" variant="outline" onClick={batchRestart}><RotateCw className="w-3.5 h-3.5 mr-1" />批量重启</Button>
          <Button size="sm" variant="outline" onClick={() => openBatchTag("add")}><Tag className="w-3.5 h-3.5 mr-1" />添加标签</Button>
          <Button size="sm" variant="outline" onClick={() => openBatchTag("remove")}><Tag className="w-3.5 h-3.5 mr-1" />移除标签</Button>
          <Button size="sm" variant="destructive" onClick={batchDelete}><Trash className="w-3.5 h-3.5 mr-1" />批量删除</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}><X className="w-3.5 h-3.5 mr-1" />清空</Button>
        </div>
      )}

      {/* Nodes Table */}
      {viewTab === "nodes" && (
        <DataTable
          columns={nodeColumns as any}
          data={filtered}
          rowKey={(row) => row.id}
          pagination
          pageSize={10}
          onRowClick={(row) => openDetail(row)}
        />
      )}

      {/* Groups View */}
      {viewTab === "groups" && (
        <div className="grid grid-cols-3 gap-4">
          {groups.map((group) => {
            const groupNodes = nodes.filter((n) => group.nodeIds.includes(n.id));
            const onlineCount = groupNodes.filter((n) => n.status === "online").length;
            const avgCpu = groupNodes.length > 0 ? Math.round(groupNodes.reduce((s, n) => s + n.cpu, 0) / groupNodes.length) : 0;
            return (
              <div
                key={group.id}
                className={cn(
                  "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
                  "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
                )}
                onClick={() => { setGroupFilter(group.id); setViewTab("nodes"); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{group.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{group.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => openGroupDetail(group)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditGroup(group)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteGroup(group)}><Trash className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 dark:bg-[#334155]/50 p-2">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{groupNodes.length}</div>
                    <div className="text-[10px] text-slate-400">节点总数</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-[#334155]/50 p-2">
                    <div className="text-lg font-bold text-emerald-600">{onlineCount}</div>
                    <div className="text-[10px] text-slate-400">在线</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-[#334155]/50 p-2">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{avgCpu}%</div>
                    <div className="text-[10px] text-slate-400">平均CPU</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Node Detail Drawer with Tabs ─── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle>节点详情 - {detailNode?.name || ""}</SheetTitle>
          </SheetHeader>
          <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="perf">性能监控</TabsTrigger>
              <TabsTrigger value="logs">节点日志</TabsTrigger>
              <TabsTrigger value="chain">区块链数据</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-4 pr-4">
                  {detailFields.map((field, index) => (
                    <div key={field.key}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</p>
                        {field.type === "badge" ? (
                          <Badge variant="outline" className="font-normal">{detailData[field.key]}</Badge>
                        ) : (
                          <span className="text-sm">{detailData[field.key]}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="perf" className="mt-4">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-4 pr-4">
                  <div className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary-500" />
                      24小时性能趋势
                    </h3>
                    <LineChart option={perfChartOption as echarts.EChartsOption} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "CPU", value: detailNode ? `${detailNode.cpu}%` : "-", icon: <Monitor className="w-4 h-4" />, color: "text-red-500" },
                      { label: "内存", value: detailNode ? `${detailNode.memory}%` : "-", icon: <Box className="w-4 h-4" />, color: "text-blue-500" },
                      { label: "磁盘", value: detailNode ? `${detailNode.disk}%` : "-", icon: <HardDrive className="w-4 h-4" />, color: "text-emerald-500" },
                      { label: "网络", value: detailNode ? `${detailNode?.netHistory[detailNode.netHistory.length - 1] ?? 0}%` : "-", icon: <Wifi className="w-4 h-4" />, color: "text-amber-500" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-[#334155]", m.color)}>
                          {m.icon}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{m.value}</div>
                          <div className="text-[10px] text-slate-400">{m.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value as any)}
                    className="h-8 px-2 text-xs rounded-md border border-slate-200 dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300"
                  >
                    <option value="ALL">全部级别</option>
                    <option value="DEBUG">DEBUG</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                  <input
                    type="text"
                    placeholder="搜索日志关键词..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className={cn(
                      "flex-1 h-8 px-3 text-xs rounded-md border",
                      "bg-white border-slate-200 text-slate-800",
                      "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    )}
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-1 pr-2">
                    {filteredLogs.map((log, i) => (
                      <div
                        key={i}
                        className={cn(
                          "text-xs font-mono px-2 py-1.5 rounded border",
                          log.level === "ERROR" ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400" :
                          log.level === "WARN" ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400" :
                          log.level === "DEBUG" ? "bg-slate-50 border-slate-100 text-slate-600 dark:bg-[#334155]/30 dark:border-[#334155] dark:text-slate-400" :
                          "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400"
                        )}
                      >
                        <span className="opacity-60">[{log.time}]</span>{" "}
                        <span className="font-semibold">{log.level}</span>{" "}
                        {log.message}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="chain" className="mt-4">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]">
                      <div className="text-[10px] text-slate-400 mb-1">当前区块高度</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{detailNode?.lastBlock.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]">
                      <div className="text-[10px] text-slate-400 mb-1">网络高度</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{(detailNode ? detailNode.lastBlock + Math.floor(Math.random() * 5) : 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">同步状态</span>
                      <Badge variant="outline">{detailNode && detailNode.status === "online" ? "已同步" : "同步中"}</Badge>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: detailNode && detailNode.status === "online" ? "100%" : "85%" }} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {detailNode && detailNode.status === "online" ? "100% 同步完成" : "85% 同步中..."}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">连接的对等节点</div>
                    <div className="space-y-2">
                      {peers.map((peer) => (
                        <div key={peer.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-slate-50 dark:bg-[#334155]/50">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", peer.status === "online" ? "bg-emerald-500" : "bg-red-500")} />
                            <span className="font-mono text-slate-700 dark:text-slate-300">{peer.address}</span>
                          </div>
                          <span className="text-slate-400">{peer.latency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => { if (detailNode) handleEdit(detailNode); }}>
                编辑
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => { if (detailNode) handleDelete(detailNode); }}>
                删除
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Group Detail Drawer */}
      {detailGroup && (
        <DetailDrawer
          open={groupDetailOpen}
          onOpenChange={setGroupDetailOpen}
          title={`分组详情 - ${detailGroup.name}`}
          data={{
            ...detailGroup,
            nodeIds: detailGroup.nodeIds.length > 0 ? detailGroup.nodeIds.map((id) => nodes.find((n) => n.id === id)?.name || id).join(", ") : "无节点",
          }}
          fields={[
            { key: "id", label: "分组ID", type: "text" as const },
            { key: "name", label: "名称", type: "text" as const },
            { key: "description", label: "描述", type: "text" as const },
            { key: "nodeIds", label: "节点", type: "text" as const },
          ]}
          onEdit={() => { if (detailGroup) handleEditGroup(detailGroup); }}
          onDelete={() => { if (detailGroup) handleDeleteGroup(detailGroup); }}
        />
      )}

      {/* CrudDialog for Nodes */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${nodes.find((n) => n.id === editingId)?.name || "节点"}` : "节点"}
        fields={nodeFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* CrudDialog for Groups */}
      <CrudDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        title={groupDialogMode === "delete" ? `${groups.find((g) => g.id === editingGroupId)?.name || "分组"}` : "分组"}
        fields={groupFields}
        data={groupDialogData}
        mode={groupDialogMode}
        onSubmit={handleSubmitGroup}
        onDelete={handleConfirmDeleteGroup}
      />

      {/* Lifecycle Confirmation Dialog */}
      <Dialog open={lifecycleOpen} onOpenChange={setLifecycleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              确认{lifecycleAction === "start" ? "启动" : lifecycleAction === "stop" ? "停止" : "重启"}节点
            </DialogTitle>
            <DialogDescription>
              确定要对节点 <strong>{nodes.find((n) => n.id === lifecycleNodeId)?.name}</strong> 执行
              {lifecycleAction === "start" ? "启动" : lifecycleAction === "stop" ? "停止" : "重启"}操作吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLifecycleOpen(false)}>取消</Button>
            <Button onClick={confirmLifecycle}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>升级节点</DialogTitle>
            <DialogDescription>
              选择目标版本升级 <strong>{nodes.find((n) => n.id === upgradeNodeId)?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <select
              value={upgradeVersion}
              onChange={(e) => setUpgradeVersion(e.target.value)}
              disabled={upgrading}
              className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-300"
            >
              {AVAILABLE_VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {upgrading && (
              <div>
                <div className="text-xs text-slate-500 mb-1">升级进度: {upgradeProgress}%</div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${upgradeProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)} disabled={upgrading}>取消</Button>
            <Button onClick={confirmUpgrade} disabled={upgrading}>开始升级</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire Dialog */}
      <Dialog open={retireOpen} onOpenChange={setRetireOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Archive className="w-5 h-5" />
              确认退役节点
            </DialogTitle>
            <DialogDescription>
              确定要退役节点 <strong>{nodes.find((n) => n.id === retireNodeId)?.name}</strong> 吗？
              退役前请确保已完成数据迁移，此操作将移除该节点。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetireOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmRetire}>确认退役</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Tag Dialog */}
      <Dialog open={batchTagOpen} onOpenChange={setBatchTagOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{batchTagMode === "add" ? "批量添加标签" : "批量移除标签"}</DialogTitle>
            <DialogDescription>
              对选中的 {selectedIds.size} 个节点执行标签操作
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="输入标签名称..."
              value={batchTagValue}
              onChange={(e) => setBatchTagValue(e.target.value)}
              className={cn(
                "w-full h-9 px-3 text-sm rounded-md border",
                "bg-white border-slate-200 text-slate-800",
                "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              )}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchTagOpen(false)}>取消</Button>
            <Button onClick={confirmBatchTag}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
