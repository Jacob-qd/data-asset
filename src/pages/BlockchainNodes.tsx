import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface Node {
  id: string;
  name: string;
  role: string;
  status: string;
  ip: string;
  region: string;
  cpu: number;
  memory: number;
  disk: number;
  latency: string;
  uptime: string;
  lastBlock: number;
  version: string;
}

/* ─── Mock Nodes Data ─── */
const initialNodes: Node[] = [
  { id: "node-01", name: "共识节点-01", role: "共识节点", status: "online", ip: "192.168.10.11", region: "北京", cpu: 42, memory: 58, disk: 67, latency: "12ms", uptime: "99.98%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-02", name: "共识节点-02", role: "共识节点", status: "online", ip: "192.168.10.12", region: "北京", cpu: 38, memory: 52, disk: 61, latency: "15ms", uptime: "99.95%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-03", name: "共识节点-03", role: "共识节点", status: "online", ip: "192.168.10.13", region: "上海", cpu: 45, memory: 60, disk: 70, latency: "11ms", uptime: "99.99%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-04", name: "共识节点-04", role: "共识节点", status: "warning", ip: "192.168.10.14", region: "上海", cpu: 78, memory: 82, disk: 75, latency: "45ms", uptime: "98.50%", lastBlock: 4285690, version: "v2.4.0" },
  { id: "node-05", name: "共识节点-05", role: "共识节点", status: "online", ip: "192.168.10.15", region: "广州", cpu: 35, memory: 48, disk: 55, latency: "18ms", uptime: "99.92%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-06", name: "存储节点-01", role: "存储节点", status: "online", ip: "192.168.20.21", region: "北京", cpu: 28, memory: 65, disk: 82, latency: "20ms", uptime: "99.85%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-07", name: "存储节点-02", role: "存储节点", status: "online", ip: "192.168.20.22", region: "上海", cpu: 32, memory: 70, disk: 88, latency: "22ms", uptime: "99.80%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-08", name: "存储节点-03", role: "存储节点", status: "offline", ip: "192.168.20.23", region: "广州", cpu: 0, memory: 0, disk: 0, latency: "-", uptime: "95.20%", lastBlock: 4285000, version: "v2.3.5" },
  { id: "node-09", name: "观察节点-01", role: "观察节点", status: "online", ip: "192.168.30.31", region: "深圳", cpu: 15, memory: 30, disk: 40, latency: "25ms", uptime: "99.90%", lastBlock: 4285691, version: "v2.4.1" },
  { id: "node-10", name: "观察节点-02", role: "观察节点", status: "online", ip: "192.168.30.32", region: "杭州", cpu: 18, memory: 35, disk: 45, latency: "30ms", uptime: "99.88%", lastBlock: 4285691, version: "v2.4.1" },
];

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
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
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
];

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
];

function generateId(nodes: Node[]): string {
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("全部");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailNode, setDetailNode] = useState<Node | null>(null);

  const roles = ["全部", "共识节点", "存储节点", "观察节点"];

  const stats = {
    total: nodes.length,
    online: nodes.filter((n) => n.status === "online").length,
    warning: nodes.filter((n) => n.status === "warning").length,
    offline: nodes.filter((n) => n.status === "offline").length,
  };

  const filtered = nodes.filter((n) => {
    if (roleFilter !== "全部" && n.role !== roleFilter) return false;
    if (search && !n.name.includes(search) && !n.ip.includes(search)) return false;
    return true;
  });

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
    if (dialogMode === "create") {
      const id = generateId(nodes);
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
    }
    setDialogOpen(false);
  };

  const openDetail = (node: Node) => {
    setDetailNode(node);
    setDetailOpen(true);
  };

  const detailData = detailNode
    ? {
        ...detailNode,
        status: detailNode.status === "online" ? "运行中" : detailNode.status === "warning" ? "警告" : "离线",
        cpu: `${detailNode.cpu}%`,
        memory: `${detailNode.memory}%`,
        disk: `${detailNode.disk}%`,
        lastBlock: detailNode.lastBlock.toLocaleString(),
      }
    : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">节点管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">联盟链节点监控、配置与运维管理</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增节点
        </button>
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
              placeholder="搜索节点名称、IP地址..."
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
        </div>
      </div>

      {/* Node Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((node) => (
          <div
            key={node.id}
            onClick={() => openDetail(node)}
            className={cn(
              "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  node.status === "online" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                  node.status === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30" :
                  "bg-red-50 text-red-600 dark:bg-red-900/30"
                )}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{node.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500">{node.role}</span>
                    <span className="text-[10px] text-slate-400">{node.region}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NodeStatusBadge status={node.status} />
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => openDetail(node)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(node)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(node)}><Trash className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>

            {node.status !== "offline" && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-1">CPU</div>
                  <MiniBar value={node.cpu} color={node.cpu > 70 ? "#EF4444" : "#10B981"} />
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.cpu}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-1">内存</div>
                  <MiniBar value={node.memory} color={node.memory > 70 ? "#EF4444" : "#10B981"} />
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.memory}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-1">磁盘</div>
                  <MiniBar value={node.disk} color={node.disk > 80 ? "#EF4444" : "#10B981"} />
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.disk}%</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <span className="font-mono">{node.ip}</span>
              <span>延迟: {node.latency}</span>
              <span>可用性: {node.uptime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`节点详情 - ${detailNode?.name || ""}`}
        data={detailNode || {}}
        fields={detailFields}
        onEdit={() => { if (detailNode) handleEdit(detailNode); }}
        onDelete={() => { if (detailNode) handleDelete(detailNode); }}
      />

      {/* CrudDialog */}
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
    </div>
  );
}
