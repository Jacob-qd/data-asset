import { useState, type ReactNode } from "react";
import {
  Server, Plus, Search, Activity, Cpu, MemoryStick, HardDrive,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Settings, Power,
  Monitor, ChevronRight, X, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

/* ─── Mock Hosts Data ─── */
const initialHosts: Host[] = [
  { id: "H-001", name: "区块链主机-01", ip: "192.168.10.101", os: "Ubuntu 22.04", cpuCores: 32, memory: 128, disk: 2048, status: "online", region: "北京-华北", nodeCount: 4, uptime: "99.99%", agentVersion: "v3.2.1" },
  { id: "H-002", name: "区块链主机-02", ip: "192.168.10.102", os: "CentOS 8.5", cpuCores: 24, memory: 64, disk: 1024, status: "online", region: "上海-华东", nodeCount: 3, uptime: "99.95%", agentVersion: "v3.2.1" },
  { id: "H-003", name: "区块链主机-03", ip: "192.168.10.103", os: "Ubuntu 22.04", cpuCores: 16, memory: 32, disk: 512, status: "warning", region: "广州-华南", nodeCount: 2, uptime: "98.50%", agentVersion: "v3.1.8" },
  { id: "H-004", name: "区块链主机-04", ip: "192.168.10.104", os: "Ubuntu 22.04", cpuCores: 48, memory: 256, disk: 4096, status: "online", region: "深圳-华南", nodeCount: 6, uptime: "99.97%", agentVersion: "v3.2.1" },
  { id: "H-005", name: "区块链主机-05", ip: "192.168.10.105", os: "CentOS 8.5", cpuCores: 8, memory: 16, disk: 256, status: "offline", region: "成都-西南", nodeCount: 0, uptime: "95.20%", agentVersion: "v3.0.5" },
];

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

export default function BlockchainHostManage() {
  const [hosts, setHosts] = useState<Host[]>(initialHosts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = hosts.filter(h =>
    h.name.includes(search) || h.ip.includes(search) || h.region.includes(search)
  );

  const onlineCount = hosts.filter(h => h.status === "online").length;
  const warningCount = hosts.filter(h => h.status === "warning").length;
  const offlineCount = hosts.filter(h => h.status === "offline").length;
  const totalNodes = hosts.reduce((sum, h) => sum + h.nodeCount, 0);

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
      />
    </div>
  );
}
