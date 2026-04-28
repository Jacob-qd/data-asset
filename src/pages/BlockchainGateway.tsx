import { useState, useEffect, useRef, useMemo } from "react";
import {
  Scan, Plus, Search, Activity, Server, Link2, ShieldCheck,
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, Settings,
  RefreshCw, Globe, Clock, X, Pencil, Trash2, Eye, HeartPulse,
  Zap, Gauge, KeyRound, Lock, Unlock, BarChart3, Play, Filter,
  Wifi, WifiOff, Timer, ArrowUpDown
} from "lucide-react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface HealthStatus {
  lastHeartbeat: string;
  latencyMs: number;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  connections: number;
}

interface RateLimit {
  id: string;
  scope: "global" | "endpoint" | "user";
  target: string;
  qps: number;
  burst: number;
  strategy: "token_bucket" | "leaky_bucket" | "fixed_window";
  alertThreshold: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: ("read" | "write" | "admin")[];
  status: "active" | "revoked";
  createdAt: string;
  calls: number;
  errors: number;
}

interface RequestLog {
  id: string;
  time: string;
  ip: string;
  endpoint: string;
  method: string;
  params: string;
  responseTime: number;
  statusCode: number;
  userAgent: string;
}

/* ─── Mock Gateways ─── */
const initialGatewaysData: Gateway[] = [
  { id: "GW-001", name: "API网关-01", type: "REST API", network: "金融联盟链", endpoint: "https://api.chain01.example.com", status: "online", tps: 1200, latency: "15ms", requests: 34567890, auth: "OAuth2+TLS", region: "北京" },
  { id: "GW-002", name: "SDK网关-01", type: "SDK", network: "政务数据链", endpoint: "sdk://gateway.chain02.example.com", status: "online", tps: 800, latency: "22ms", requests: 12345678, auth: "mTLS+国密", region: "上海" },
  { id: "GW-003", name: "事件网关-01", type: "Event Stream", network: "供应链金融链", endpoint: "wss://events.chain03.example.com", status: "warning", tps: 300, latency: "65ms", requests: 5678901, auth: "JWT+TLS", region: "广州" },
  { id: "GW-004", name: "API网关-02", type: "REST API", network: "医疗数据链", endpoint: "https://api.chain04.example.com", status: "online", tps: 1500, latency: "12ms", requests: 45678901, auth: "OAuth2+TLS", region: "深圳" },
  { id: "GW-005", name: "文件网关-01", type: "File Gateway", network: "存证公证链", endpoint: "https://files.chain05.example.com", status: "offline", tps: 0, latency: "-", requests: 1234567, auth: "API Key", region: "成都" },
];

const healthMap: Record<string, HealthStatus> = {
  "GW-001": { lastHeartbeat: "2025-04-28T10:30:00Z", latencyMs: 15, uptime: "99.99%", cpuUsage: 45, memoryUsage: 62, connections: 1240 },
  "GW-002": { lastHeartbeat: "2025-04-28T10:29:55Z", latencyMs: 22, uptime: "99.95%", cpuUsage: 38, memoryUsage: 55, connections: 890 },
  "GW-003": { lastHeartbeat: "2025-04-28T10:28:00Z", latencyMs: 65, uptime: "98.50%", cpuUsage: 78, memoryUsage: 82, connections: 450 },
  "GW-004": { lastHeartbeat: "2025-04-28T10:30:02Z", latencyMs: 12, uptime: "99.97%", cpuUsage: 52, memoryUsage: 48, connections: 1580 },
  "GW-005": { lastHeartbeat: "2025-04-28T09:00:00Z", latencyMs: 0, uptime: "95.20%", cpuUsage: 0, memoryUsage: 0, connections: 0 },
};

const initialRateLimits: Record<string, RateLimit[]> = {
  "GW-001": [
    { id: "RL-001", scope: "global", target: "*", qps: 5000, burst: 8000, strategy: "token_bucket", alertThreshold: 80 },
    { id: "RL-002", scope: "endpoint", target: "/api/v1/invoke", qps: 2000, burst: 3000, strategy: "token_bucket", alertThreshold: 75 },
    { id: "RL-003", scope: "user", target: "user_001", qps: 100, burst: 150, strategy: "leaky_bucket", alertThreshold: 90 },
  ],
  "GW-002": [
    { id: "RL-004", scope: "global", target: "*", qps: 3000, burst: 5000, strategy: "fixed_window", alertThreshold: 85 },
  ],
};

const initialApiKeys: Record<string, ApiKey[]> = {
  "GW-001": [
    { id: "AK-001", name: "交易服务密钥", key: "gw001_xxxxxxxxxxxxxxxx", permissions: ["read", "write"], status: "active", createdAt: "2024-06-01", calls: 1250000, errors: 320 },
    { id: "AK-002", name: "只读监控密钥", key: "gw001_yyyyyyyyyyyyyyyy", permissions: ["read"], status: "active", createdAt: "2024-08-15", calls: 456000, errors: 12 },
    { id: "AK-003", name: "管理员密钥", key: "gw001_zzzzzzzzzzzzzzzz", permissions: ["read", "write", "admin"], status: "revoked", createdAt: "2024-01-10", calls: 89000, errors: 0 },
  ],
  "GW-004": [
    { id: "AK-004", name: "医疗数据密钥", key: "gw004_aaaaaaaaaaaaaaaa", permissions: ["read", "write"], status: "active", createdAt: "2024-11-01", calls: 678000, errors: 45 },
  ],
};

function generateMockLogs(gatewayId: string): RequestLog[] {
  const logs: RequestLog[] = [];
  const endpoints = ["/api/v1/invoke", "/api/v1/query", "/api/v1/block", "/api/v1/chaincode", "/health"];
  const methods = ["POST", "GET", "POST", "GET", "GET"];
  const baseTime = new Date("2025-04-28T08:00:00Z").getTime();
  for (let i = 0; i < 100; i++) {
    const idx = i % endpoints.length;
    const statusCode = Math.random() > 0.95 ? (Math.random() > 0.5 ? 429 : 500) : 200;
    logs.push({
      id: `REQ-${gatewayId}-${Date.now().toString(36).toUpperCase()}-${i}`,
      time: new Date(baseTime + i * 120000).toISOString(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      endpoint: endpoints[idx],
      method: methods[idx],
      params: JSON.stringify({ channel: "ch1", chaincode: "cc1" }),
      responseTime: Math.floor(Math.random() * 200) + 10,
      statusCode,
      userAgent: "Mozilla/5.0 (custom client)",
    });
  }
  return logs;
}

const logMap: Record<string, RequestLog[]> = {};
initialGatewaysData.forEach(gw => {
  logMap[gw.id] = generateMockLogs(gw.id);
});

/* ─── Helpers ─── */
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

/* ─── Main ─── */
export default function BlockchainGateway() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGatewaysData);
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete" | null>(null);
  const [selectedGw, setSelectedGw] = useState<Gateway | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  const [rateLimits, setRateLimits] = useState<Record<string, RateLimit[]>>(initialRateLimits);
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey[]>>(initialApiKeys);

  // Health check state
  const [pingResult, setPingResult] = useState<{ success: boolean; latency: number; message: string } | null>(null);
  const [pinging, setPinging] = useState(false);

  // Rate limit dialog
  const [rateLimitOpen, setRateLimitOpen] = useState(false);
  const [rateLimitForm, setRateLimitForm] = useState<Partial<RateLimit>>({ scope: "global", strategy: "token_bucket", qps: 1000, burst: 1500, alertThreshold: 80 });

  // API key dialog
  const [keyOpen, setKeyOpen] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: "", permissions: [] as ("read" | "write" | "admin")[] });

  // Log filter
  const [logFilter, setLogFilter] = useState({ endpoint: "", status: "", timeFrom: "", timeTo: "" });
  const [replayOpen, setReplayOpen] = useState(false);
  const [replayLog, setReplayLog] = useState<RequestLog | null>(null);

  const filtered = gateways.filter(g => g.name.includes(search) || g.network.includes(search) || g.type.includes(search));
  const onlineCount = gateways.filter(g => g.status === "online").length;

  const currentHealth = selectedGw ? healthMap[selectedGw.id] : null;
  const currentRateLimits = selectedGw ? (rateLimits[selectedGw.id] || []) : [];
  const currentApiKeys = selectedGw ? (apiKeys[selectedGw.id] || []) : [];
  const currentLogs = selectedGw ? (logMap[selectedGw.id] || []) : [];

  const filteredLogs = useMemo(() => {
    return currentLogs.filter(log => {
      if (logFilter.endpoint && !log.endpoint.includes(logFilter.endpoint)) return false;
      if (logFilter.status && log.statusCode !== parseInt(logFilter.status)) return false;
      if (logFilter.timeFrom && new Date(log.time) < new Date(logFilter.timeFrom)) return false;
      if (logFilter.timeTo && new Date(log.time) > new Date(logFilter.timeTo)) return false;
      return true;
    });
  }, [currentLogs, logFilter]);

  // Charts
  const latencyChartRef = useRef<HTMLDivElement>(null);
  const latencyChartInstance = useRef<echarts.ECharts | null>(null);
  const keyChartRef = useRef<HTMLDivElement>(null);
  const keyChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!latencyChartRef.current || !selectedGw || detailTab !== "health") return;
    latencyChartInstance.current?.dispose();
    latencyChartInstance.current = echarts.init(latencyChartRef.current);
    const data = Array.from({ length: 24 }, (_, i) => {
      const base = selectedGw.status === "online" ? 15 : selectedGw.status === "warning" ? 65 : 0;
      return [ `${i}:00`, base + Math.floor(Math.random() * 20) - 10 ];
    });
    latencyChartInstance.current.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: { type: "category", data: data.map(d => d[0]), axisLabel: { fontSize: 10 } },
      yAxis: { type: "value", name: "ms" },
      series: [{ data: data.map(d => d[1]), type: "line", smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: "#10b981" } }],
    });
    const handleResize = () => latencyChartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      latencyChartInstance.current?.dispose();
    };
  }, [selectedGw, detailTab]);

  useEffect(() => {
    if (!keyChartRef.current || !selectedGw || detailTab !== "keys") return;
    keyChartInstance.current?.dispose();
    keyChartInstance.current = echarts.init(keyChartRef.current);
    const keys = currentApiKeys;
    keyChartInstance.current.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
      xAxis: { type: "category", data: keys.map(k => k.name), axisLabel: { fontSize: 10, rotate: 20 } },
      yAxis: { type: "value", name: "调用次数" },
      series: [
        { name: "调用", data: keys.map(k => k.calls), type: "bar", itemStyle: { color: "#6366f1" } },
        { name: "错误", data: keys.map(k => k.errors), type: "bar", itemStyle: { color: "#ef4444" } },
      ],
    });
    const handleResize = () => keyChartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      keyChartInstance.current?.dispose();
    };
  }, [selectedGw, detailTab, currentApiKeys]);

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
    setDetailTab("overview");
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newId = `GW-${String(gateways.length + 1).padStart(3, "0")}`;
      const newGw: Gateway = {
        id: newId, name: data.name, type: data.type, network: data.network,
        endpoint: data.endpoint, status: data.status, tps: Number(data.tps) || 0,
        latency: data.latency, requests: Number(data.requests) || 0,
        auth: data.auth, region: data.region,
      };
      setGateways(prev => [...prev, newGw]);
    } else if (dialogMode === "edit" && selectedGw) {
      setGateways(prev => prev.map(g => g.id === selectedGw.id ? {
        ...g, name: data.name, type: data.type, network: data.network,
        endpoint: data.endpoint, status: data.status, tps: Number(data.tps) || 0,
        latency: data.latency, requests: Number(data.requests) || 0,
        auth: data.auth, region: data.region,
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

  const handlePing = async () => {
    if (!selectedGw) return;
    setPinging(true);
    await new Promise(r => setTimeout(r, 800));
    const success = selectedGw.status !== "offline";
    setPingResult({
      success,
      latency: success ? Math.floor(Math.random() * 30) + 5 : 0,
      message: success ? `连通性测试成功，延迟 ${Math.floor(Math.random() * 30) + 5}ms` : "连通性测试失败：连接超时",
    });
    setPinging(false);
  };

  const handleCreateRateLimit = () => {
    if (!selectedGw || !rateLimitForm.scope || !rateLimitForm.target || !rateLimitForm.strategy) return;
    const newRl: RateLimit = {
      id: `RL-${Date.now().toString(36).toUpperCase()}`,
      scope: rateLimitForm.scope as RateLimit["scope"],
      target: rateLimitForm.target || "*",
      qps: rateLimitForm.qps || 1000,
      burst: rateLimitForm.burst || 1500,
      strategy: rateLimitForm.strategy as RateLimit["strategy"],
      alertThreshold: rateLimitForm.alertThreshold || 80,
    };
    setRateLimits(prev => ({ ...prev, [selectedGw.id]: [...(prev[selectedGw.id] || []), newRl] }));
    setRateLimitOpen(false);
    setRateLimitForm({ scope: "global", strategy: "token_bucket", qps: 1000, burst: 1500, alertThreshold: 80 });
  };

  const handleDeleteRateLimit = (id: string) => {
    if (!selectedGw) return;
    setRateLimits(prev => ({ ...prev, [selectedGw.id]: (prev[selectedGw.id] || []).filter(r => r.id !== id) }));
  };

  const handleCreateKey = () => {
    if (!selectedGw || !keyForm.name.trim() || keyForm.permissions.length === 0) return;
    const newKey: ApiKey = {
      id: `AK-${Date.now().toString(36).toUpperCase()}`,
      name: keyForm.name,
      key: `${selectedGw.id.toLowerCase()}_${Array.from({ length: 16 }, () => Math.floor(Math.random() * 36).toString(36)).join("")}`,
      permissions: keyForm.permissions,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      calls: 0,
      errors: 0,
    };
    setApiKeys(prev => ({ ...prev, [selectedGw.id]: [...(prev[selectedGw.id] || []), newKey] }));
    setKeyOpen(false);
    setKeyForm({ name: "", permissions: [] });
  };

  const handleRevokeKey = (id: string) => {
    if (!selectedGw) return;
    setApiKeys(prev => ({
      ...prev,
      [selectedGw.id]: (prev[selectedGw.id] || []).map(k => k.id === id ? { ...k, status: "revoked" as const } : k),
    }));
  };

  const handleReplay = (log: RequestLog) => {
    setReplayLog(log);
    setReplayOpen(true);
  };

  const strategyLabel = (s: string) => ({ token_bucket: "令牌桶", leaky_bucket: "漏桶", fixed_window: "固定窗口" }[s] || s);

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

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`网关详情 - ${selectedGw?.name}`}
        data={selectedGw || {}}
        fields={detailFields}
        onEdit={() => selectedGw && handleEdit(selectedGw)}
        onDelete={() => selectedGw && handleDelete(selectedGw)}
      >
        {selectedGw && (
          <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="health">健康检查</TabsTrigger>
              <TabsTrigger value="ratelimit">限流配置</TabsTrigger>
              <TabsTrigger value="keys">API密钥</TabsTrigger>
              <TabsTrigger value="logs">请求日志</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">性能指标</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">当前TPS</span><span>{selectedGw.tps}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">延迟</span><span>{selectedGw.latency}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">总请求</span><span>{selectedGw.requests.toLocaleString()}</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">接入信息</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">端点</span><span className="text-xs truncate max-w-[150px]">{selectedGw.endpoint}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">认证</span><span>{selectedGw.auth}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">区域</span><span>{selectedGw.region}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      {selectedGw.status === "online" ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                      <div>
                        <div className="text-sm font-medium">心跳状态</div>
                        <div className="text-xs text-slate-500">{selectedGw.status === "online" ? "正常" : selectedGw.status === "warning" ? "异常" : "离线"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">当前延迟</div>
                        <div className="text-xs text-slate-500">{currentHealth?.latencyMs || 0}ms</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-sm font-medium">连接数</div>
                        <div className="text-xs text-slate-500">{currentHealth?.connections || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {currentHealth && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded"><span className="text-slate-500">CPU使用率:</span> <span>{currentHealth.cpuUsage}%</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded"><span className="text-slate-500">内存使用率:</span> <span>{currentHealth.memoryUsage}%</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded"><span className="text-slate-500">运行时间:</span> <span>{currentHealth.uptime}</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded"><span className="text-slate-500">最后心跳:</span> <span>{new Date(currentHealth.lastHeartbeat).toLocaleString()}</span></div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handlePing} disabled={pinging} className="gap-2">
                  <HeartPulse className="w-4 h-4" /> {pinging ? "测试中..." : "连通性测试"}
                </Button>
              </div>
              {pingResult && (
                <div className={`p-3 rounded text-sm ${pingResult.success ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                  {pingResult.message}
                </div>
              )}
              <div className="text-sm font-medium mt-2">24小时延迟趋势</div>
              <div ref={latencyChartRef} style={{ height: 200 }} />
            </TabsContent>

            <TabsContent value="ratelimit" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">限流规则</h3>
                <Button size="sm" onClick={() => setRateLimitOpen(true)}><Plus className="w-4 h-4" /> 添加规则</Button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-[#273548]">
                    <tr>
                      {["范围", "目标", "QPS", "Burst", "策略", "告警阈值", "操作"].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRateLimits.map(rl => (
                      <tr key={rl.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-2"><Badge variant="outline">{rl.scope === "global" ? "全局" : rl.scope === "endpoint" ? "端点" : "用户"}</Badge></td>
                        <td className="px-4 py-2 text-slate-600">{rl.target}</td>
                        <td className="px-4 py-2">{rl.qps}</td>
                        <td className="px-4 py-2">{rl.burst}</td>
                        <td className="px-4 py-2">{strategyLabel(rl.strategy)}</td>
                        <td className="px-4 py-2">{rl.alertThreshold}%</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="ghost" className="text-red-600 h-7" onClick={() => handleDeleteRateLimit(rl.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="keys" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">API密钥</h3>
                <Button size="sm" onClick={() => setKeyOpen(true)}><KeyRound className="w-4 h-4" /> 创建密钥</Button>
              </div>
              <div ref={keyChartRef} style={{ height: 180 }} />
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-[#273548]">
                    <tr>
                      {["名称", "密钥", "权限", "状态", "调用次数", "错误率", "操作"].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentApiKeys.map(k => (
                      <tr key={k.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-2 font-medium">{k.name}</td>
                        <td className="px-4 py-2 font-mono text-xs">{k.key.slice(0, 12)}...{k.key.slice(-4)}</td>
                        <td className="px-4 py-2"><div className="flex gap-1">{k.permissions.map(p => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}</div></td>
                        <td className="px-4 py-2"><Badge variant={k.status === "active" ? "default" : "outline"} className="text-[10px]">{k.status === "active" ? "有效" : "已撤销"}</Badge></td>
                        <td className="px-4 py-2">{k.calls.toLocaleString()}</td>
                        <td className="px-4 py-2">{k.calls > 0 ? ((k.errors / k.calls) * 100).toFixed(2) : "0.00"}%</td>
                        <td className="px-4 py-2">
                          {k.status === "active" && (
                            <Button size="sm" variant="ghost" className="text-red-600 h-7" onClick={() => handleRevokeKey(k.id)}><Lock className="w-3 h-3" /> 撤销</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4 mt-4">
              <div className="flex flex-wrap gap-2">
                <Input placeholder="端点" className="w-40 h-8 text-xs" value={logFilter.endpoint} onChange={e => setLogFilter({ ...logFilter, endpoint: e.target.value })} />
                <Select value={logFilter.status} onValueChange={v => setLogFilter({ ...logFilter, status: v })}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="状态码" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="429">429</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="datetime-local" className="w-44 h-8 text-xs" value={logFilter.timeFrom} onChange={e => setLogFilter({ ...logFilter, timeFrom: e.target.value })} />
                <Input type="datetime-local" className="w-44 h-8 text-xs" value={logFilter.timeTo} onChange={e => setLogFilter({ ...logFilter, timeTo: e.target.value })} />
                <Button size="sm" variant="outline" className="h-8" onClick={() => setLogFilter({ endpoint: "", status: "", timeFrom: "", timeTo: "" })}><Filter className="w-3 h-3" /> 重置</Button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-[#273548] sticky top-0">
                    <tr>
                      {["时间", "IP", "方法", "端点", "参数", "响应时间", "状态码", "操作"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(log.time).toLocaleString()}</td>
                        <td className="px-3 py-2">{log.ip}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{log.method}</Badge></td>
                        <td className="px-3 py-2">{log.endpoint}</td>
                        <td className="px-3 py-2 max-w-[100px] truncate">{log.params}</td>
                        <td className="px-3 py-2">{log.responseTime}ms</td>
                        <td className="px-3 py-2"><Badge variant={log.statusCode === 200 ? "default" : "destructive"} className="text-[10px]">{log.statusCode}</Badge></td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="ghost" className="h-6" onClick={() => handleReplay(log)}><Play className="w-3 h-3" /> 重放</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DetailDrawer>

      {/* Rate Limit Dialog */}
      <Dialog open={rateLimitOpen} onOpenChange={setRateLimitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加限流规则</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">范围</label>
              <Select value={rateLimitForm.scope} onValueChange={(v: any) => setRateLimitForm({ ...rateLimitForm, scope: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">全局</SelectItem>
                  <SelectItem value="endpoint">端点</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">目标</label>
              <Input placeholder="* 或具体端点/用户ID" value={rateLimitForm.target} onChange={e => setRateLimitForm({ ...rateLimitForm, target: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">QPS</label>
                <Input type="number" value={rateLimitForm.qps} onChange={e => setRateLimitForm({ ...rateLimitForm, qps: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Burst</label>
                <Input type="number" value={rateLimitForm.burst} onChange={e => setRateLimitForm({ ...rateLimitForm, burst: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">策略</label>
              <Select value={rateLimitForm.strategy} onValueChange={(v: any) => setRateLimitForm({ ...rateLimitForm, strategy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="token_bucket">令牌桶</SelectItem>
                  <SelectItem value="leaky_bucket">漏桶</SelectItem>
                  <SelectItem value="fixed_window">固定窗口</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">告警阈值 (%)</label>
              <Input type="number" min={1} max={100} value={rateLimitForm.alertThreshold} onChange={e => setRateLimitForm({ ...rateLimitForm, alertThreshold: parseInt(e.target.value) || 80 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateLimitOpen(false)}>取消</Button>
            <Button onClick={handleCreateRateLimit}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={keyOpen} onOpenChange={setKeyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>创建API密钥</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <Input value={keyForm.name} onChange={e => setKeyForm({ ...keyForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">权限</label>
              <div className="flex gap-4">
                {(["read", "write", "admin"] as const).map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.includes(p)}
                      onChange={e => setKeyForm({ ...keyForm, permissions: e.target.checked ? [...keyForm.permissions, p] : keyForm.permissions.filter(x => x !== p) })}
                      className="rounded"
                    />
                    {p === "read" ? "读取" : p === "write" ? "写入" : "管理"}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyOpen(false)}>取消</Button>
            <Button onClick={handleCreateKey} disabled={!keyForm.name.trim() || keyForm.permissions.length === 0}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replay Dialog */}
      <Dialog open={replayOpen} onOpenChange={setReplayOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>请求重放</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="text-sm"><span className="text-slate-500">端点:</span> {replayLog?.method} {replayLog?.endpoint}</div>
            <div className="text-sm"><span className="text-slate-500">参数:</span></div>
            <pre className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs">{replayLog?.params}</pre>
            <div className="text-sm"><span className="text-slate-500">原始响应时间:</span> {replayLog?.responseTime}ms</div>
            <div className="text-sm"><span className="text-slate-500">原始状态码:</span> {replayLog?.statusCode}</div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded text-sm text-emerald-700">
              重放请求已发送，新响应时间: {Math.floor(Math.random() * 50) + 10}ms，状态码: 200
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplayOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
