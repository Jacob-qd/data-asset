import { useState } from "react";
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  ChevronRight,
  RefreshCw,
  Settings,
  Plus,
  Search,
  Monitor,
  BarChart3,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Nodes Data ─── */
const nodesData = [
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

/* ─── Node Detail Drawer ─── */
function NodeDetailDrawer({ node, onClose }: { node: typeof nodesData[0]; onClose: () => void }) {
  const metrics = [
    { label: "CPU 使用率", value: `${node.cpu}%`, color: node.cpu > 70 ? "#EF4444" : node.cpu > 50 ? "#F59E0B" : "#10B981" },
    { label: "内存使用率", value: `${node.memory}%`, color: node.memory > 70 ? "#EF4444" : node.memory > 50 ? "#F59E0B" : "#10B981" },
    { label: "磁盘使用率", value: `${node.disk}%`, color: node.disk > 80 ? "#EF4444" : node.disk > 60 ? "#F59E0B" : "#10B981" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[420px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] overflow-y-auto animate-slideInRight">
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">节点详情</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Card */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              node.status === "online" ? "bg-emerald-50 text-emerald-600" :
              node.status === "warning" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
            )}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{node.name}</div>
              <div className="mt-1"><NodeStatusBadge status={node.status} /></div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "节点ID", value: node.id },
              { label: "角色", value: node.role },
              { label: "IP 地址", value: node.ip },
              { label: "地区", value: node.region },
              { label: "版本", value: node.version },
              { label: "运行时间", value: node.uptime },
              { label: "网络延迟", value: node.latency },
              { label: "最新区块", value: node.lastBlock.toLocaleString() },
            ].map((field) => (
              <div key={field.label} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                <div className="text-xs text-slate-500 dark:text-slate-400">{field.label}</div>
                <div className="text-sm text-slate-800 dark:text-slate-100 mt-0.5">{field.value}</div>
              </div>
            ))}
          </div>

          {/* Resource Usage */}
          {node.status !== "offline" && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">资源使用率</h3>
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">{m.label}</span>
                      <span className="text-sm font-medium" style={{ color: m.color }}>{m.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: m.value, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 dark:border-[#334155] dark:text-slate-400 dark:hover:bg-[#273548]">
              <RefreshCw className="w-4 h-4" />
              重启节点
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 dark:border-[#334155] dark:text-slate-400 dark:hover:bg-[#273548]">
              <Settings className="w-4 h-4" />
              配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainNodes() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("全部");
  const [detailNode, setDetailNode] = useState<typeof nodesData[0] | null>(null);

  const roles = ["全部", "共识节点", "存储节点", "观察节点"];

  const stats = {
    total: nodesData.length,
    online: nodesData.filter((n) => n.status === "online").length,
    warning: nodesData.filter((n) => n.status === "warning").length,
    offline: nodesData.filter((n) => n.status === "offline").length,
  };

  const filtered = nodesData.filter((n) => {
    if (roleFilter !== "全部" && n.role !== roleFilter) return false;
    if (search && !n.name.includes(search) && !n.ip.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">节点管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">联盟链节点监控、配置与运维管理</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          添加节点
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
            onClick={() => setDetailNode(node)}
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
              <NodeStatusBadge status={node.status} />
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

      {detailNode && <NodeDetailDrawer node={detailNode} onClose={() => setDetailNode(null)} />}
    </div>
  );
}
