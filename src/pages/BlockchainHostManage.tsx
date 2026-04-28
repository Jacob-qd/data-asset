import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import {
  Server, Plus, Search, Activity, Cpu, MemoryStick, HardDrive,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Settings, Power,
  Monitor, ChevronRight, X, Terminal, ArrowUpRight, Download,
  Play, Clock, FileText, Hash, Wifi, Disc, BarChart3, Layers,
  Map, Zap, Loader2, ShieldCheck, Eye
} from "lucide-react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";

/* ─── Types ─── */
interface Host {
  id: string;
  name: string;
  ip: string;
  os: string;
  cpuCores: number;
  memory: number;
  disk: number;
  status: string;
  region: string;
  nodeCount: number;
  uptime: string;
  agentVersion: string;
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
}

interface DiskIO {
  device: string;
  readSpeed: number;
  writeSpeed: number;
  readOps: number;
  writeOps: number;
}

interface RemoteCommand {
  id: string;
  command: string;
  status: "running" | "success" | "failed";
  output: string;
  startTime: string;
  endTime?: string;
}

interface NodeMapping {
  id: string;
  name: string;
  type: "peer" | "orderer" | "ca";
  status: string;
  cpuUsage: number;
  memoryUsage: number;
}

/* ─── Mock Hosts Data ─── */
const initialHosts: Host[] = [
  { id: "H-001", name: "区块链主机-01", ip: "192.168.10.101", os: "Ubuntu 22.04", cpuCores: 32, memory: 128, disk: 2048, status: "online", region: "北京-华北", nodeCount: 4, uptime: "99.99%", agentVersion: "v3.2.1" },
  { id: "H-002", name: "区块链主机-02", ip: "192.168.10.102", os: "CentOS 8.5", cpuCores: 24, memory: 64, disk: 1024, status: "online", region: "上海-华东", nodeCount: 3, uptime: "99.95%", agentVersion: "v3.2.1" },
  { id: "H-003", name: "区块链主机-03", ip: "192.168.10.103", os: "Ubuntu 22.04", cpuCores: 16, memory: 32, disk: 512, status: "warning", region: "广州-华南", nodeCount: 2, uptime: "98.50%", agentVersion: "v3.1.8" },
  { id: "H-004", name: "区块链主机-04", ip: "192.168.10.104", os: "Ubuntu 22.04", cpuCores: 48, memory: 256, disk: 4096, status: "online", region: "深圳-华南", nodeCount: 6, uptime: "99.97%", agentVersion: "v3.2.1" },
  { id: "H-005", name: "区块链主机-05", ip: "192.168.10.105", os: "CentOS 8.5", cpuCores: 8, memory: 16, disk: 256, status: "offline", region: "成都-西南", nodeCount: 0, uptime: "95.20%", agentVersion: "v3.0.5" },
];

const hostProcesses: Record<string, ProcessInfo[]> = {
  "H-001": [
    { pid: 10234, name: "peer", cpu: 12.5, memory: 4096, user: "fabric" },
    { pid: 10256, name: "orderer", cpu: 8.3, memory: 2048, user: "fabric" },
    { pid: 10301, name: "couchdb", cpu: 5.1, memory: 1024, user: "couchdb" },
    { pid: 10420, name: "chaincode", cpu: 3.2, memory: 512, user: "fabric" },
    { pid: 10500, name: "dockerd", cpu: 2.8, memory: 768, user: "root" },
  ],
  "H-002": [
    { pid: 20101, name: "peer", cpu: 10.2, memory: 3072, user: "fabric" },
    { pid: 20130, name: "orderer", cpu: 6.5, memory: 1536, user: "fabric" },
    { pid: 20200, name: "couchdb", cpu: 4.1, memory: 896, user: "couchdb" },
    { pid: 20310, name: "chaincode", cpu: 2.5, memory: 384, user: "fabric" },
    { pid: 20400, name: "dockerd", cpu: 2.1, memory: 512, user: "root" },
  ],
  "H-003": [
    { pid: 30101, name: "peer", cpu: 25.5, memory: 2048, user: "fabric" },
    { pid: 30130, name: "orderer", cpu: 15.3, memory: 1024, user: "fabric" },
    { pid: 30200, name: "couchdb", cpu: 8.1, memory: 512, user: "couchdb" },
    { pid: 30310, name: "chaincode", cpu: 5.2, memory: 256, user: "fabric" },
    { pid: 30400, name: "dockerd", cpu: 3.8, memory: 384, user: "root" },
  ],
  "H-004": [
    { pid: 40101, name: "peer", cpu: 9.2, memory: 5120, user: "fabric" },
    { pid: 40130, name: "orderer", cpu: 7.5, memory: 3072, user: "fabric" },
    { pid: 40200, name: "couchdb", cpu: 4.8, memory: 1536, user: "couchdb" },
    { pid: 40310, name: "chaincode", cpu: 3.1, memory: 768, user: "fabric" },
    { pid: 40400, name: "dockerd", cpu: 2.5, memory: 1024, user: "root" },
  ],
};

const hostDiskIO: Record<string, DiskIO[]> = {
  "H-001": [
    { device: "sda", readSpeed: 120, writeSpeed: 85, readOps: 1250, writeOps: 980 },
    { device: "sdb", readSpeed: 80, writeSpeed: 110, readOps: 890, writeOps: 1120 },
  ],
  "H-002": [
    { device: "sda", readSpeed: 95, writeSpeed: 70, readOps: 1050, writeOps: 820 },
  ],
  "H-003": [
    { device: "sda", readSpeed: 150, writeSpeed: 130, readOps: 1580, writeOps: 1420 },
  ],
  "H-004": [
    { device: "sda", readSpeed: 200, writeSpeed: 180, readOps: 2100, writeOps: 1950 },
    { device: "sdb", readSpeed: 180, writeSpeed: 160, readOps: 1850, writeOps: 1720 },
    { device: "nvme0n1", readSpeed: 850, writeSpeed: 720, readOps: 8500, writeOps: 7800 },
  ],
};

const hostNodes: Record<string, NodeMapping[]> = {
  "H-001": [
    { id: "N-001", name: "peer0.org1", type: "peer", status: "running", cpuUsage: 12, memoryUsage: 15 },
    { id: "N-002", name: "peer1.org1", type: "peer", status: "running", cpuUsage: 10, memoryUsage: 14 },
    { id: "N-003", name: "orderer0", type: "orderer", status: "running", cpuUsage: 8, memoryUsage: 10 },
    { id: "N-004", name: "ca.org1", type: "ca", status: "running", cpuUsage: 3, memoryUsage: 5 },
  ],
  "H-002": [
    { id: "N-005", name: "peer0.org2", type: "peer", status: "running", cpuUsage: 11, memoryUsage: 13 },
    { id: "N-006", name: "orderer1", type: "orderer", status: "running", cpuUsage: 7, memoryUsage: 9 },
    { id: "N-007", name: "ca.org2", type: "ca", status: "running", cpuUsage: 2, memoryUsage: 4 },
  ],
  "H-003": [
    { id: "N-008", name: "peer0.org3", type: "peer", status: "warning", cpuUsage: 25, memoryUsage: 28 },
    { id: "N-009", name: "orderer2", type: "orderer", status: "running", cpuUsage: 15, memoryUsage: 18 },
  ],
  "H-004": [
    { id: "N-010", name: "peer0.org4", type: "peer", status: "running", cpuUsage: 9, memoryUsage: 12 },
    { id: "N-011", name: "peer1.org4", type: "peer", status: "running", cpuUsage: 8, memoryUsage: 11 },
    { id: "N-012", name: "peer0.org5", type: "peer", status: "running", cpuUsage: 10, memoryUsage: 13 },
    { id: "N-013", name: "orderer3", type: "orderer", status: "running", cpuUsage: 7, memoryUsage: 8 },
    { id: "N-014", name: "ca.org4", type: "ca", status: "running", cpuUsage: 3, memoryUsage: 4 },
    { id: "N-015", name: "ca.org5", type: "ca", status: "running", cpuUsage: 2, memoryUsage: 3 },
  ],
};

const agentLogs: Record<string, string[]> = {
  "H-001": [
    "[2025-04-28 10:00:01] INFO: Agent started, version v3.2.1",
    "[2025-04-28 10:00:02] INFO: Connected to control plane",
    "[2025-04-28 10:05:15] INFO: Health check passed",
    "[2025-04-28 10:10:22] INFO: Metrics reported",
    "[2025-04-28 10:15:00] INFO: Health check passed",
  ],
  "H-002": [
    "[2025-04-28 10:00:05] INFO: Agent started, version v3.2.1",
    "[2025-04-28 10:00:06] INFO: Connected to control plane",
    "[2025-04-28 10:08:10] INFO: Health check passed",
  ],
  "H-003": [
    "[2025-04-28 10:00:10] WARN: Agent version v3.1.8 is outdated",
    "[2025-04-28 10:00:11] INFO: Connected to control plane",
    "[2025-04-28 10:12:30] WARN: High CPU usage detected: 78%",
    "[2025-04-28 10:15:00] WARN: High memory usage detected: 82%",
  ],
  "H-004": [
    "[2025-04-28 10:00:00] INFO: Agent started, version v3.2.1",
    "[2025-04-28 10:00:01] INFO: Connected to control plane",
    "[2025-04-28 10:10:00] INFO: Health check passed",
  ],
};

const commandHistory: Record<string, RemoteCommand[]> = {
  "H-001": [
    { id: "CMD-001", command: "df -h", status: "success", output: "Filesystem      Size  Used Avail Use%\n/dev/sda1       2.0T  800G  1.2T  40%", startTime: "2025-04-28 09:00:00", endTime: "2025-04-28 09:00:02" },
    { id: "CMD-002", command: "systemctl status docker", status: "success", output: "docker.service - Docker Application Container Engine\nLoaded: loaded\nActive: active (running)", startTime: "2025-04-28 09:30:00", endTime: "2025-04-28 09:30:01" },
  ],
  "H-002": [
    { id: "CMD-003", command: "ps aux --sort=-%cpu | head -5", status: "success", output: "USER       PID %CPU %MEM\nfabric   20101 10.2  4.8\nfabric   20130  6.5  2.4", startTime: "2025-04-28 08:00:00", endTime: "2025-04-28 08:00:01" },
  ],
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; icon: ReactNode; class: string }> = {
    online: { text: "在线", icon: <CheckCircle2 className="w-3 h-3" />, class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    warning: { text: "警告", icon: <AlertTriangle className="w-3 h-3" />, class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    offline: { text: "离线", icon: <XCircle className="w-3 h-3" />, class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.offline;
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.icon}{c.text}</span>;
}

const hostFields: FieldConfig[] = [
  { key: "id", label: "主机ID", type: "text", required: true },
  { key: "name", label: "主机名称", type: "text", required: true },
  { key: "ip", label: "IP地址", type: "text", required: true },
  { key: "os", label: "操作系统", type: "select", required: true, options: [
    { label: "Ubuntu 22.04", value: "Ubuntu 22.04" },
    { label: "CentOS 8.5", value: "CentOS 8.5" },
  ]},
  { key: "cpuCores", label: "CPU核数", type: "number", required: true },
  { key: "memory", label: "内存(GB)", type: "number", required: true },
  { key: "disk", label: "磁盘(GB)", type: "number", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "在线", value: "online" },
    { label: "警告", value: "warning" },
    { label: "离线", value: "offline" },
  ]},
  { key: "region", label: "区域", type: "text", required: true },
  { key: "nodeCount", label: "节点数", type: "number", required: true },
  { key: "uptime", label: "运行时间", type: "text", required: true },
  { key: "agentVersion", label: "Agent版本", type: "text", required: true },
];

const detailFields = [
  { key: "id", label: "主机ID" },
  { key: "name", label: "主机名称" },
  { key: "ip", label: "IP地址" },
  { key: "os", label: "操作系统", type: "badge" as const },
  { key: "cpuCores", label: "CPU核数" },
  { key: "memory", label: "内存(GB)" },
  { key: "disk", label: "磁盘(GB)" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "region", label: "区域" },
  { key: "nodeCount", label: "节点数" },
  { key: "uptime", label: "运行时间" },
  { key: "agentVersion", label: "Agent版本", type: "badge" as const },
];

/* ─── Main ─── */
export default function BlockchainHostManage() {
  const [hosts, setHosts] = useState<Host[]>(initialHosts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  // Command state
  const [cmdHistory, setCmdHistory] = useState<Record<string, RemoteCommand[]>>(commandHistory);
  const [selectedCmd, setSelectedCmd] = useState<RemoteCommand | null>(null);
  const [cmdResultOpen, setCmdResultOpen] = useState(false);
  const [runningCmd, setRunningCmd] = useState(false);

  // Agent upgrade state
  const [upgradeVersion, setUpgradeVersion] = useState("v3.2.2");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeHosts, setUpgradeHosts] = useState<string[]>([]);
  const [agentLogOpen, setAgentLogOpen] = useState(false);

  // Node detail
  const [nodeDetailOpen, setNodeDetailOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeMapping | null>(null);

  const filtered = hosts.filter(h =>
    h.name.includes(search) || h.ip.includes(search) || h.region.includes(search)
  );

  const onlineCount = hosts.filter(h => h.status === "online").length;
  const warningCount = hosts.filter(h => h.status === "warning").length;
  const offlineCount = hosts.filter(h => h.status === "offline").length;
  const totalNodes = hosts.reduce((sum, h) => sum + h.nodeCount, 0);

  const currentProcesses = selectedHost ? (hostProcesses[selectedHost.id] || []) : [];
  const currentDiskIO = selectedHost ? (hostDiskIO[selectedHost.id] || []) : [];
  const currentNodes = selectedHost ? (hostNodes[selectedHost.id] || []) : [];
  const currentAgentLogs = selectedHost ? (agentLogs[selectedHost.id] || []) : [];
  const currentCmdHistory = selectedHost ? (cmdHistory[selectedHost.id] || []) : [];

  // Charts
  const cpuChartRef = useRef<HTMLDivElement>(null);
  const memChartRef = useRef<HTMLDivElement>(null);
  const diskChartRef = useRef<HTMLDivElement>(null);
  const netChartRef = useRef<HTMLDivElement>(null);
  const chartInstances = useRef<Record<string, echarts.ECharts | null>>({});

  function generate24hData(base: number, variance: number): number[] {
    return Array.from({ length: 24 }, (_, i) => Math.max(0, base + Math.random() * variance * 2 - variance));
  }

  useEffect(() => {
    if (!selectedHost || detailTab !== "monitoring") return;
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const cpuData = generate24hData(selectedHost.status === "warning" ? 65 : 35, 15);
    const memData = generate24hData(selectedHost.status === "warning" ? 75 : 50, 10);
    const diskData = generate24hData(40, 8);
    const netData = generate24hData(20, 10);

    const configs = [
      { ref: cpuChartRef, name: "cpu", title: "CPU使用率 (%)", data: cpuData, color: "#ef4444" },
      { ref: memChartRef, name: "mem", title: "内存使用率 (%)", data: memData, color: "#3b82f6" },
      { ref: diskChartRef, name: "disk", title: "磁盘使用率 (%)", data: diskData, color: "#10b981" },
      { ref: netChartRef, name: "net", title: "网络IO (MB/s)", data: netData, color: "#f59e0b" },
    ];

    configs.forEach(cfg => {
      if (!cfg.ref.current) return;
      chartInstances.current[cfg.name]?.dispose();
      const inst = echarts.init(cfg.ref.current);
      chartInstances.current[cfg.name] = inst;
      inst.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
        xAxis: { type: "category", data: hours, axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", name: cfg.title.split(" ")[1] || "" },
        series: [{ data: cfg.data, type: "line", smooth: true, areaStyle: { opacity: 0.15 }, itemStyle: { color: cfg.color }, lineStyle: { width: 2 } }],
      });
    });

    const handleResize = () => Object.values(chartInstances.current).forEach(i => i?.resize());
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      Object.values(chartInstances.current).forEach(i => i?.dispose());
    };
  }, [selectedHost, detailTab]);

  const handleCreate = () => {
    setSelectedHost(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (host: Host) => {
    setSelectedHost(host);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (host: Host) => {
    setSelectedHost(host);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (host: Host) => {
    setSelectedHost(host);
    setDrawerOpen(true);
    setDetailTab("overview");
  };

  const handleSubmit = (data: Record<string, any>) => {
    const processed = {
      ...data,
      cpuCores: Number(data.cpuCores),
      memory: Number(data.memory),
      disk: Number(data.disk),
      nodeCount: Number(data.nodeCount),
    };
    if (dialogMode === "create") {
      setHosts([...hosts, processed as Host]);
    } else if (dialogMode === "edit" && selectedHost) {
      setHosts(hosts.map(h => h.id === selectedHost.id ? { ...processed, id: selectedHost.id } as Host : h));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedHost) {
      setHosts(hosts.filter(h => h.id !== selectedHost.id));
    }
  };

  const executePresetCmd = async (cmd: string) => {
    if (!selectedHost) return;
    setRunningCmd(true);
    const newCmd: RemoteCommand = {
      id: `CMD-${Date.now().toString(36).toUpperCase()}`,
      command: cmd,
      status: "running",
      output: "",
      startTime: new Date().toISOString(),
    };
    setCmdHistory(prev => ({
      ...prev,
      [selectedHost.id]: [...(prev[selectedHost.id] || []), newCmd],
    }));

    await new Promise(r => setTimeout(r, 1500));

    let output = "";
    if (cmd.includes("df")) {
      output = `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       ${selectedHost.disk}G  ${Math.floor(selectedHost.disk * 0.4)}G  ${Math.floor(selectedHost.disk * 0.6)}G  40% /`;
    } else if (cmd.includes("systemctl")) {
      output = `${selectedHost.status === "online" ? "Active: active (running)" : "Active: inactive (dead)"}\nLoaded: loaded (/lib/systemd/system/docker.service; enabled)`;
    } else if (cmd.includes("ps")) {
      output = currentProcesses.slice(0, 5).map(p => `${p.user}\t${p.pid}\t${p.cpu}%\t${p.memory}MB\t${p.name}`).join("\n");
    } else {
      output = `Command executed successfully on ${selectedHost.name}\nExit code: 0`;
    }

    const completedCmd = { ...newCmd, status: "success" as const, output, endTime: new Date().toISOString() };
    setCmdHistory(prev => ({
      ...prev,
      [selectedHost.id]: (prev[selectedHost.id] || []).map(c => c.id === newCmd.id ? completedCmd : c),
    }));
    setSelectedCmd(completedCmd);
    setCmdResultOpen(true);
    setRunningCmd(false);
  };

  const handleBatchUpgrade = () => {
    setHosts(prev => prev.map(h => upgradeHosts.includes(h.id) ? { ...h, agentVersion: upgradeVersion } : h));
    setUpgradeOpen(false);
    setUpgradeHosts([]);
  };

  const nodeTypeIcon = (type: string) => {
    switch (type) {
      case "peer": return <Server className="w-4 h-4 text-indigo-500" />;
      case "orderer": return <Layers className="w-4 h-4 text-amber-500" />;
      case "ca": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  // Scheduling suggestions
  const schedulingSuggestions = useMemo(() => {
    if (!selectedHost) return [];
    const suggestions: string[] = [];
    const avgCpu = currentProcesses.reduce((s, p) => s + p.cpu, 0);
    if (selectedHost.status === "warning") {
      suggestions.push("当前主机负载较高，建议将部分节点迁移至 H-004 (负载最低)");
    }
    if (selectedHost.memory < 64) {
      suggestions.push("内存容量较小，建议限制同时运行的 chaincode 容器数量");
    }
    if (selectedHost.nodeCount >= 5) {
      suggestions.push("节点密度较高，建议分散部署以提高可用性");
    }
    if (avgCpu > 50) {
      suggestions.push("CPU使用率偏高，建议扩容或增加主机资源");
    }
    return suggestions;
  }, [selectedHost, currentProcesses]);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">主机管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链节点主机资源，监控主机健康状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 注册主机
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "在线主机", value: onlineCount, icon: <Server className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "警告主机", value: warningCount, icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "离线主机", value: offlineCount, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
          { label: "运行节点", value: totalNodes, icon: <Cpu className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索主机名称/IP/区域" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
        <Button variant="outline" className="gap-2" onClick={() => setUpgradeOpen(true)}><Download className="w-4 h-4" /> 批量升级</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["主机名称", "IP地址", "操作系统", "配置", "状态", "区域", "节点数", "Agent版本", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(host => (
              <tr key={host.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{host.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{host.ip}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{host.os}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Cpu className="w-3 h-3" /> {host.cpuCores}核
                    <MemoryStick className="w-3 h-3 ml-1" /> {host.memory}G
                    <HardDrive className="w-3 h-3 ml-1" /> {host.disk}G
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={host.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{host.region}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{host.nodeCount}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{host.agentVersion}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(host)}><Monitor className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(host)}><Settings className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(host)}><X className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`主机详情 - ${selectedHost?.name}`}
        data={selectedHost || {}}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedHost) handleEdit(selectedHost);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedHost) handleDelete(selectedHost);
        }}
      >
        {selectedHost && (
          <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="monitoring">监控图表</TabsTrigger>
              <TabsTrigger value="agent">Agent管理</TabsTrigger>
              <TabsTrigger value="remote">远程操作</TabsTrigger>
              <TabsTrigger value="mapping">节点映射</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">硬件配置</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">CPU</span><span>{selectedHost.cpuCores} 核</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">内存</span><span>{selectedHost.memory} GB</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">磁盘</span><span>{selectedHost.disk} GB</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">运行状态</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">状态</span><StatusBadge status={selectedHost.status} /></div>
                      <div className="flex justify-between"><span className="text-slate-500">可用性</span><span>{selectedHost.uptime}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Agent版本</span><span>{selectedHost.agentVersion}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs font-medium mb-1">CPU 24h趋势</div><div ref={cpuChartRef} style={{ height: 180 }} /></div>
                <div><div className="text-xs font-medium mb-1">内存 24h趋势</div><div ref={memChartRef} style={{ height: 180 }} /></div>
                <div><div className="text-xs font-medium mb-1">磁盘 24h趋势</div><div ref={diskChartRef} style={{ height: 180 }} /></div>
                <div><div className="text-xs font-medium mb-1">网络IO 24h趋势</div><div ref={netChartRef} style={{ height: 180 }} /></div>
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">进程 Top5 (CPU)</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-[#273548]">
                        <tr><th className="px-3 py-2 text-left">PID</th><th className="px-3 py-2 text-left">名称</th><th className="px-3 py-2 text-left">用户</th><th className="px-3 py-2 text-left">CPU%</th><th className="px-3 py-2 text-left">内存(MB)</th></tr>
                      </thead>
                      <tbody>
                        {currentProcesses.slice(0, 5).map(p => (
                          <tr key={p.pid} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-3 py-2 font-mono">{p.pid}</td>
                            <td className="px-3 py-2">{p.name}</td>
                            <td className="px-3 py-2">{p.user}</td>
                            <td className="px-3 py-2">{p.cpu}%</td>
                            <td className="px-3 py-2">{p.memory}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">磁盘IO</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-[#273548]">
                        <tr><th className="px-3 py-2 text-left">设备</th><th className="px-3 py-2 text-left">读取(MB/s)</th><th className="px-3 py-2 text-left">写入(MB/s)</th><th className="px-3 py-2 text-left">读IOPS</th><th className="px-3 py-2 text-left">写IOPS</th></tr>
                      </thead>
                      <tbody>
                        {currentDiskIO.map(dio => (
                          <tr key={dio.device} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-3 py-2 font-mono">{dio.device}</td>
                            <td className="px-3 py-2">{dio.readSpeed}</td>
                            <td className="px-3 py-2">{dio.writeSpeed}</td>
                            <td className="px-3 py-2">{dio.readOps}</td>
                            <td className="px-3 py-2">{dio.writeOps}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agent" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Agent信息</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">当前版本</span><Badge variant="outline">{selectedHost.agentVersion}</Badge></div>
                  <div className="flex justify-between"><span className="text-slate-500">最新版本</span><Badge variant="default">v3.2.2</Badge></div>
                  <div className="flex justify-between"><span className="text-slate-500">升级状态</span><span>{selectedHost.agentVersion === "v3.2.2" ? "已是最新" : "可升级"}</span></div>
                  <div className="flex gap-2 mt-2">
                    <Select value={upgradeVersion} onValueChange={setUpgradeVersion}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v3.2.2">v3.2.2 (最新)</SelectItem>
                        <SelectItem value="v3.2.1">v3.2.1</SelectItem>
                        <SelectItem value="v3.1.8">v3.1.8</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => { setUpgradeHosts([selectedHost.id]); setUpgradeOpen(true); }}><Download className="w-4 h-4" /> 升级</Button>
                    <Button size="sm" variant="outline" onClick={() => setAgentLogOpen(true)}><FileText className="w-4 h-4" /> 查看日志</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="remote" className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={runningCmd} onClick={() => executePresetCmd("df -h")}><Disc className="w-4 h-4" /> 检查磁盘</Button>
                <Button size="sm" variant="outline" disabled={runningCmd} onClick={() => executePresetCmd("systemctl restart docker")}><RefreshCw className="w-4 h-4" /> 重启服务</Button>
                <Button size="sm" variant="outline" disabled={runningCmd} onClick={() => executePresetCmd("ps aux --sort=-%cpu | head -5")}><Monitor className="w-4 h-4" /> 查看进程</Button>
                <Button size="sm" variant="outline" disabled={runningCmd} onClick={() => executePresetCmd("free -h")}><MemoryStick className="w-4 h-4" /> 查看内存</Button>
              </div>
              {runningCmd && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> 命令执行中...</div>}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">命令历史</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded border overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-[#273548]">
                        <tr><th className="px-3 py-2 text-left">命令</th><th className="px-3 py-2 text-left">状态</th><th className="px-3 py-2 text-left">开始时间</th><th className="px-3 py-2 text-left">操作</th></tr>
                      </thead>
                      <tbody>
                        {currentCmdHistory.slice().reverse().map(cmd => (
                          <tr key={cmd.id} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-3 py-2 font-mono">{cmd.command}</td>
                            <td className="px-3 py-2"><Badge variant={cmd.status === "success" ? "default" : cmd.status === "running" ? "secondary" : "destructive"} className="text-[10px]">{cmd.status === "success" ? "成功" : cmd.status === "running" ? "执行中" : "失败"}</Badge></td>
                            <td className="px-3 py-2">{new Date(cmd.startTime).toLocaleString()}</td>
                            <td className="px-3 py-2">
                              <Button size="sm" variant="ghost" className="h-6" onClick={() => { setSelectedCmd(cmd); setCmdResultOpen(true); }}><Eye className="w-3 h-3" /> 结果</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">节点分布</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {currentNodes.map(node => (
                      <div
                        key={node.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => { setSelectedNode(node); setNodeDetailOpen(true); }}
                      >
                        <div className="flex items-center gap-2">
                          {nodeTypeIcon(node.type)}
                          <span className="text-sm font-medium">{node.name}</span>
                          <Badge variant={node.status === "running" ? "default" : "secondary"} className="text-[10px] ml-auto">{node.status === "running" ? "运行中" : "警告"}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 flex gap-3">
                          <span>CPU: {node.cpuUsage}%</span>
                          <span>内存: {node.memoryUsage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {schedulingSuggestions.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> 资源调度建议</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {schedulingSuggestions.map((s, i) => (
                        <li key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>

      {/* Command Result Dialog */}
      <Dialog open={cmdResultOpen} onOpenChange={setCmdResultOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>命令执行结果</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="text-sm"><span className="text-slate-500">命令:</span> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{selectedCmd?.command}</code></div>
            <div className="text-sm"><span className="text-slate-500">状态:</span> <Badge variant={selectedCmd?.status === "success" ? "default" : "destructive"}>{selectedCmd?.status}</Badge></div>
            <div className="text-sm"><span className="text-slate-500">执行时间:</span> {selectedCmd?.startTime && new Date(selectedCmd.startTime).toLocaleString()}</div>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-[300px] overflow-y-auto">{selectedCmd?.output || "无输出"}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCmdResultOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Log Dialog */}
      <Dialog open={agentLogOpen} onOpenChange={setAgentLogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Agent日志 - {selectedHost?.name}</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1 py-4">
              {currentAgentLogs.map((log, i) => (
                <div key={i} className={`text-xs font-mono ${log.includes("WARN") ? "text-amber-600" : log.includes("ERROR") ? "text-red-600" : "text-slate-600 dark:text-slate-400"}`}>
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentLogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Agent批量升级</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">目标版本</label>
              <Select value={upgradeVersion} onValueChange={setUpgradeVersion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="v3.2.2">v3.2.2 (最新)</SelectItem>
                  <SelectItem value="v3.2.1">v3.2.1</SelectItem>
                  <SelectItem value="v3.1.8">v3.1.8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">选择主机</label>
              <div className="border rounded-md p-2 space-y-1 max-h-[200px] overflow-y-auto">
                {hosts.map(h => {
                  const selected = upgradeHosts.includes(h.id);
                  return (
                    <div key={h.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                      onClick={() => setUpgradeHosts(selected ? upgradeHosts.filter(id => id !== h.id) : [...upgradeHosts, h.id])}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span>{h.name} ({h.agentVersion})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>取消</Button>
            <Button onClick={handleBatchUpgrade} disabled={upgradeHosts.length === 0}>升级 {upgradeHosts.length} 台主机</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Detail Dialog */}
      <Dialog open={nodeDetailOpen} onOpenChange={setNodeDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>节点详情</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2">
              {selectedNode && nodeTypeIcon(selectedNode.type)}
              <span className="text-lg font-medium">{selectedNode?.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">类型:</span> {selectedNode?.type === "peer" ? "Peer" : selectedNode?.type === "orderer" ? "Orderer" : "CA"}</div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">状态:</span> {selectedNode?.status === "running" ? "运行中" : "警告"}</div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">CPU使用率:</span> {selectedNode?.cpuUsage}%</div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded"><span className="text-slate-500">内存使用率:</span> {selectedNode?.memoryUsage}%</div>
            </div>
            <div className="text-sm"><span className="text-slate-500">所在主机:</span> {selectedHost?.name}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNodeDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedHost?.name || "主机"}
        fields={hostFields}
        data={selectedHost || {}}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />
    </div>
  );
}
