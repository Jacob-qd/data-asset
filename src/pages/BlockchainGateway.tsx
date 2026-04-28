import { useState } from "react";
import {
  Scan, Plus, Search, Activity, Server, Link2, ShieldCheck,
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, Settings,
  RefreshCw, Globe, Clock, X, Pencil, Trash2, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface Gateway {
  id: string;
  name: string;
  type: string;
  network: string;
  endpoint: string;
  status: string;
  tps: number;
  latency: string;
  requests: number;
  auth: string;
  region: string;
}

/* ─── Mock Gateways ─── */
const initialGatewaysData: Gateway[] = [
  { id: "GW-001", name: "API网关-01", type: "REST API", network: "金融联盟链", endpoint: "https://api.chain01.example.com", status: "online", tps: 1200, latency: "15ms", requests: 34567890, auth: "OAuth2+TLS", region: "北京" },
  { id: "GW-002", name: "SDK网关-01", type: "SDK", network: "政务数据链", endpoint: "sdk://gateway.chain02.example.com", status: "online", tps: 800, latency: "22ms", requests: 12345678, auth: "mTLS+国密", region: "上海" },
  { id: "GW-003", name: "事件网关-01", type: "Event Stream", network: "供应链金融链", endpoint: "wss://events.chain03.example.com", status: "warning", tps: 300, latency: "65ms", requests: 5678901, auth: "JWT+TLS", region: "广州" },
  { id: "GW-004", name: "API网关-02", type: "REST API", network: "医疗数据链", endpoint: "https://api.chain04.example.com", status: "online", tps: 1500, latency: "12ms", requests: 45678901, auth: "OAuth2+TLS", region: "深圳" },
  { id: "GW-005", name: "文件网关-01", type: "File Gateway", network: "存证公证链", endpoint: "https://files.chain05.example.com", status: "offline", tps: 0, latency: "-", requests: 1234567, auth: "API Key", region: "成都" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    online: { text: "在线", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    warning: { text: "警告", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    offline: { text: "离线", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.offline;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

const gatewayFields: FieldConfig[] = [
  { key: "name", label: "网关名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "REST API", value: "REST API" },
    { label: "SDK", value: "SDK" },
    { label: "Event Stream", value: "Event Stream" },
    { label: "File Gateway", value: "File Gateway" },
  ]},
  { key: "network", label: "所属网络", type: "text", required: true },
  { key: "endpoint", label: "接入端点", type: "text", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "在线", value: "online" },
    { label: "警告", value: "warning" },
    { label: "离线", value: "offline" },
  ]},
  { key: "tps", label: "TPS", type: "number", required: true },
  { key: "latency", label: "延迟", type: "text", required: true },
  { key: "auth", label: "认证方式", type: "text", required: true },
  { key: "region", label: "区域", type: "text", required: true },
  { key: "requests", label: "总请求量", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "网关ID" },
  { key: "name", label: "网关名称" },
  { key: "type", label: "类型", type: "badge" as const },
  { key: "network", label: "所属网络" },
  { key: "endpoint", label: "接入端点" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "tps", label: "TPS" },
  { key: "latency", label: "延迟" },
  { key: "auth", label: "认证方式" },
  { key: "region", label: "区域" },
  { key: "requests", label: "总请求量" },
];

export default function BlockchainGateway() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGatewaysData);
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedGw, setSelectedGw] = useState<Gateway | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = gateways.filter(g => g.name.includes(search) || g.network.includes(search) || g.type.includes(search));
  const onlineCount = gateways.filter(g => g.status === "online").length;

  const handleCreate = () => {
    setSelectedGw(null);
    setDialogMode("create");
  };

  const handleEdit = (gw: Gateway) => {
    setSelectedGw(gw);
    setDialogMode("edit");
    setDrawerOpen(false);
  };

  const handleDelete = (gw: Gateway) => {
    setSelectedGw(gw);
    setDialogMode("delete");
  };

  const handleView = (gw: Gateway) => {
    setSelectedGw(gw);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newId = `GW-${String(gateways.length + 1).padStart(3, "0")}`;
      const newGw: Gateway = {
        id: newId,
        name: data.name,
        type: data.type,
        network: data.network,
        endpoint: data.endpoint,
        status: data.status,
        tps: Number(data.tps) || 0,
        latency: data.latency,
        requests: Number(data.requests) || 0,
        auth: data.auth,
        region: data.region,
      };
      setGateways(prev => [...prev, newGw]);
    } else if (dialogMode === "edit" && selectedGw) {
      setGateways(prev => prev.map(g => g.id === selectedGw.id ? {
        ...g,
        name: data.name,
        type: data.type,
        network: data.network,
        endpoint: data.endpoint,
        status: data.status,
        tps: Number(data.tps) || 0,
        latency: data.latency,
        requests: Number(data.requests) || 0,
        auth: data.auth,
        region: data.region,
      } : g));
    }
    setDialogMode(null);
    setSelectedGw(null);
  };

  const handleConfirmDelete = () => {
    if (selectedGw) {
      setGateways(prev => prev.filter(g => g.id !== selectedGw.id));
    }
    setDialogMode(null);
    setSelectedGw(null);
    setDrawerOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">网关管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链访问网关，配置API/SDK/事件流接入点</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}><Plus className="w-4 h-4" /> 创建网关</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "网关总数", value: gateways.length, icon: <Scan className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "在线网关", value: onlineCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总请求量", value: gateways.reduce((s, g) => s + g.requests, 0).toLocaleString(), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "总TPS", value: gateways.reduce((s, g) => s + g.tps, 0), icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索网关名称/网络/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setSearch("")}><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["网关名称", "类型", "所属网络", "接入端点", "状态", "TPS", "延迟", "认证方式", "区域", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(gw => (
              <tr key={gw.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{gw.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{gw.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{gw.network}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{gw.endpoint}</td>
                <td className="px-4 py-3"><StatusBadge status={gw.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{gw.tps}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{gw.latency}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{gw.auth}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{gw.region}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(gw)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(gw)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(gw)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CrudDialog
        open={dialogMode === "create" || dialogMode === "edit"}
        onOpenChange={(open) => { if (!open) setDialogMode(null); }}
        title="网关"
        fields={gatewayFields}
        data={selectedGw ? { ...selectedGw, tps: String(selectedGw.tps), requests: String(selectedGw.requests) } : undefined}
        onSubmit={handleSubmit}
        mode={dialogMode === "edit" ? "edit" : "create"}
      />

      <CrudDialog
        open={dialogMode === "delete"}
        onOpenChange={(open) => { if (!open) setDialogMode(null); }}
        title={selectedGw?.name || "网关"}
        fields={[]}
        mode="delete"
        onSubmit={() => {}}
        onDelete={handleConfirmDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`网关详情 - ${selectedGw?.name}`}
        data={selectedGw || {}}
        fields={detailFields}
        onEdit={() => selectedGw && handleEdit(selectedGw)}
        onDelete={() => selectedGw && handleDelete(selectedGw)}
      />
    </div>
  );
}
