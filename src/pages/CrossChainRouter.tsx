import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftRight, Plus, Search, CheckCircle2, RefreshCw, Server,
  Eye, Pencil, Trash2, Activity, Route, Zap, Settings, PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

interface Route {
  id: string;
  name: string;
  sourceChain: string;
  targetChain: string;
  protocol: string;
  status: string;
  latency: string;
  txCount: number;
  successRate: string;
  relayers: number;
  createTime: string;
}

interface RouteHealth {
  routeId: string;
  status: "green" | "yellow" | "red";
  ping: number;
  lastCheck: string;
  packetLoss: number;
}

interface SimResult {
  sourceChain: string;
  targetChain: string;
  asset: string;
  amount: string;
  estimatedTime: string;
  estimatedFee: string;
  path: string[];
}

interface FailoverRule {
  id: string;
  primaryRoute: string;
  backupRoute: string;
  autoSwitch: boolean;
  threshold: number;
}

const initialRoutesData: Route[] = [
  { id: "RT-001", name: "金融-政务跨链桥", sourceChain: "金融联盟链", targetChain: "政务数据链", protocol: "HTLC", status: "active", latency: "2.5s", txCount: 12345, successRate: "99.8%", relayers: 3, createTime: "2024-09-01" },
  { id: "RT-002", name: "医疗-存证跨链桥", sourceChain: "医疗数据链", targetChain: "存证公证链", protocol: "侧链中继", status: "active", latency: "3.2s", txCount: 5678, successRate: "99.5%", relayers: 2, createTime: "2024-10-15" },
  { id: "RT-003", name: "供应链-金融跨链桥", sourceChain: "供应链金融链", targetChain: "金融联盟链", protocol: "公证人机制", status: "inactive", latency: "-", txCount: 0, successRate: "-", relayers: 0, createTime: "2024-11-20" },
  { id: "RT-004", name: "政务-存证跨链桥", sourceChain: "政务数据链", targetChain: "存证公证链", protocol: "HTLC", status: "active", latency: "1.8s", txCount: 8912, successRate: "99.9%", relayers: 2, createTime: "2024-12-01" },
  { id: "RT-005", name: "医疗-金融跨链桥", sourceChain: "医疗数据链", targetChain: "金融联盟链", protocol: "侧链中继", status: "active", latency: "2.9s", txCount: 3456, successRate: "99.2%", relayers: 2, createTime: "2025-01-10" },
  { id: "RT-006", name: "金融-医疗跨链桥", sourceChain: "金融联盟链", targetChain: "医疗数据链", protocol: "多签", status: "maintenance", latency: "-", txCount: 0, successRate: "-", relayers: 0, createTime: "2025-02-01" },
  { id: "RT-007", name: "政务-供应链跨链桥", sourceChain: "政务数据链", targetChain: "供应链金融链", protocol: "哈希锁定", status: "active", latency: "3.5s", txCount: 2345, successRate: "98.9%", relayers: 2, createTime: "2025-02-15" },
  { id: "RT-008", name: "存证-供应链跨链桥", sourceChain: "存证公证链", targetChain: "供应链金融链", protocol: "HTLC", status: "active", latency: "2.1s", txCount: 6789, successRate: "99.7%", relayers: 3, createTime: "2025-03-01" },
  { id: "RT-009", name: "医疗-政务跨链桥", sourceChain: "医疗数据链", targetChain: "政务数据链", protocol: "中继链", status: "initializing", latency: "-", txCount: 0, successRate: "-", relayers: 0, createTime: "2025-03-15" },
  { id: "RT-010", name: "金融-存证跨链桥", sourceChain: "金融联盟链", targetChain: "存证公证链", protocol: "公证人机制", status: "error", latency: "-", txCount: 0, successRate: "-", relayers: 0, createTime: "2025-03-20" },
];

const initialHealth: RouteHealth[] = [
  { routeId: "RT-001", status: "green", ping: 120, lastCheck: "2025-04-28 10:00:00", packetLoss: 0 },
  { routeId: "RT-002", status: "green", ping: 180, lastCheck: "2025-04-28 10:00:01", packetLoss: 0.1 },
  { routeId: "RT-004", status: "green", ping: 95, lastCheck: "2025-04-28 10:00:02", packetLoss: 0 },
  { routeId: "RT-005", status: "yellow", ping: 350, lastCheck: "2025-04-28 10:00:03", packetLoss: 2.5 },
  { routeId: "RT-007", status: "green", ping: 210, lastCheck: "2025-04-28 10:00:04", packetLoss: 0.3 },
  { routeId: "RT-008", status: "green", ping: 110, lastCheck: "2025-04-28 10:00:05", packetLoss: 0 },
  { routeId: "RT-010", status: "red", ping: 5000, lastCheck: "2025-04-28 09:59:00", packetLoss: 100 },
];

const initialFailover: FailoverRule[] = [
  { id: "FO-001", primaryRoute: "RT-001", backupRoute: "RT-004", autoSwitch: true, threshold: 3 },
  { id: "FO-002", primaryRoute: "RT-002", backupRoute: "RT-005", autoSwitch: false, threshold: 5 },
  { id: "FO-003", primaryRoute: "RT-008", backupRoute: "RT-007", autoSwitch: true, threshold: 2 },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    active: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    inactive: { text: "已停用", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    maintenance: { text: "维护中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    error: { text: "故障", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    initializing: { text: "初始化", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.inactive;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function HealthDot({ status }: { status: string }) {
  const colors = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("w-2.5 h-2.5 rounded-full", colors[status as keyof typeof colors] || "bg-gray-400")} />
      <span className="text-xs">
        {status === "green" ? "健康" : status === "yellow" ? "警告" : status === "red" ? "故障" : "未知"}
      </span>
    </span>
  );
}

const crudFields: FieldConfig[] = [
  { key: "id", label: "路由ID", type: "text", required: true },
  { key: "name", label: "路由名称", type: "text", required: true },
  { key: "sourceChain", label: "源链", type: "text", required: true },
  { key: "targetChain", label: "目标链", type: "text", required: true },
  { key: "protocol", label: "协议", type: "select", required: true, options: [
    { label: "HTLC", value: "HTLC" },
    { label: "侧链中继", value: "侧链中继" },
    { label: "公证人机制", value: "公证人机制" },
    { label: "多签", value: "多签" },
    { label: "哈希锁定", value: "哈希锁定" },
    { label: "中继链", value: "中继链" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "active" },
    { label: "已停用", value: "inactive" },
    { label: "维护中", value: "maintenance" },
    { label: "初始化中", value: "initializing" },
    { label: "故障", value: "error" },
    { label: "待激活", value: "pending" },
  ]},
  { key: "latency", label: "延迟", type: "text" },
  { key: "txCount", label: "跨链交易数", type: "number" },
  { key: "successRate", label: "成功率", type: "text" },
  { key: "relayers", label: "中继节点", type: "number" },
  { key: "createTime", label: "创建时间", type: "text" },
];

const detailFields = [
  { key: "id", label: "路由ID", type: "text" as const },
  { key: "name", label: "路由名称", type: "text" as const },
  { key: "sourceChain", label: "源链", type: "text" as const },
  { key: "targetChain", label: "目标链", type: "text" as const },
  { key: "protocol", label: "跨链协议", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "latency", label: "延迟", type: "text" as const },
  { key: "txCount", label: "跨链交易数", type: "text" as const },
  { key: "successRate", label: "成功率", type: "text" as const },
  { key: "relayers", label: "中继节点", type: "text" as const },
  { key: "createTime", label: "创建时间", type: "date" as const },
];

function generateId() {
  return Date.now().toString(36).toUpperCase();
}

export default function CrossChainRouter() {
  const [routesData, setRoutesData] = useState<Route[]>(initialRoutesData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [health, setHealth] = useState<RouteHealth[]>(initialHealth);
  const [simOpen, setSimOpen] = useState(false);
  const [simForm, setSimForm] = useState({ sourceChain: "", targetChain: "", asset: "", amount: "" });
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [failoverRules, setFailoverRules] = useState<FailoverRule[]>(initialFailover);
  const [failoverOpen, setFailoverOpen] = useState(false);

  const filtered = routesData.filter(r => r.name.includes(search) || r.sourceChain.includes(search) || r.targetChain.includes(search));
  const activeCount = routesData.filter(r => r.status === "active").length;

  const autoPingRoutes = useCallback(() => {
    setHealth(prev => prev.map(h => {
      const variance = Math.floor(Math.random() * 40) - 20;
      const newPing = Math.max(10, h.ping + variance);
      let newStatus: "green" | "yellow" | "red" = h.status;
      if (newPing < 200) newStatus = "green";
      else if (newPing < 500) newStatus = "yellow";
      else newStatus = "red";
      return { ...h, ping: newPing, status: newStatus, lastCheck: new Date().toISOString().replace("T", " ").slice(0, 19) };
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(autoPingRoutes, 10000);
    return () => clearInterval(interval);
  }, [autoPingRoutes]);

  const handleCreate = () => {
    setSelectedRoute(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (route: Route) => {
    setSelectedRoute(route);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (route: Route) => {
    setSelectedRoute(route);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (route: Route) => {
    setSelectedRoute(route);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const processed = {
      ...data,
      txCount: Number(data.txCount) || 0,
      relayers: Number(data.relayers) || 0,
    };
    if (dialogMode === "create") {
      setRoutesData([...routesData, processed as Route]);
    } else if (dialogMode === "edit" && selectedRoute) {
      setRoutesData(routesData.map(r => r.id === selectedRoute.id ? { ...processed, id: selectedRoute.id } as Route : r));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedRoute) {
      setRoutesData(routesData.filter(r => r.id !== selectedRoute.id));
    }
  };

  const handleSimulate = () => {
    setSimLoading(true);
    setTimeout(() => {
      setSimResult({
        sourceChain: simForm.sourceChain,
        targetChain: simForm.targetChain,
        asset: simForm.asset,
        amount: simForm.amount,
        estimatedTime: `${(Math.random() * 5 + 1).toFixed(1)}s`,
        estimatedFee: `${(Math.random() * 0.01).toFixed(4)} ${simForm.asset}`,
        path: [simForm.sourceChain, "中继节点-A", simForm.targetChain],
      });
      setSimLoading(false);
    }, 1500);
  };

  const toggleFailover = (id: string) => {
    setFailoverRules(rules => rules.map(r => r.id === id ? { ...r, autoSwitch: !r.autoSwitch } : r));
  };

  const optimizationData = routesData
    .filter(r => r.status === "active" && r.latency !== "-")
    .map(r => {
      const healthRec = health.find(h => h.routeId === r.id);
      return {
        ...r,
        score: healthRec ? (healthRec.status === "green" ? 100 : healthRec.status === "yellow" ? 70 : 30) : 50,
      };
    })
    .sort((a, b) => b.score - a.score);

  const bestRoute = optimizationData[0];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">跨链路由</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">配置跨链互操作路由，管理中继节点与跨链协议</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setSimOpen(true)}><PlayCircle className="w-4 h-4" /> 路由模拟</Button>
          <Button variant="outline" className="gap-2" onClick={() => setFailoverOpen(true)}><Settings className="w-4 h-4" /> 故障切换</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}><Plus className="w-4 h-4" /> 创建路由</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "路由总数", value: routesData.length, icon: <ArrowLeftRight className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "运行中", value: activeCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总跨链交易", value: routesData.reduce((s, r) => s + r.txCount, 0).toLocaleString(), icon: <ArrowLeftRight className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "中继节点", value: routesData.reduce((s, r) => s + r.relayers, 0), icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Card className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" /> 路由健康检查</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>路由</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>延迟</TableHead>
                <TableHead>丢包率</TableHead>
                <TableHead>最后检查</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health.map(h => {
                const route = routesData.find(r => r.id === h.routeId);
                return (
                  <TableRow key={h.routeId}>
                    <TableCell className="font-medium">{route?.name || h.routeId}</TableCell>
                    <TableCell><HealthDot status={h.status} /></TableCell>
                    <TableCell>{h.ping}ms</TableCell>
                    <TableCell>{h.packetLoss}%</TableCell>
                    <TableCell className="text-xs text-slate-500">{h.lastCheck}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" /> 路由优化
            {bestRoute && <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-200">推荐: {bestRoute.name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排名</TableHead>
                <TableHead>路由名称</TableHead>
                <TableHead>延迟</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>综合评分</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimizationData.map((r, idx) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {idx === 0 ? <Badge className="bg-amber-100 text-amber-700">#1</Badge> : idx === 1 ? <Badge className="bg-slate-100 text-slate-600">#2</Badge> : <span className="text-xs text-slate-500">#{idx + 1}</span>}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.latency}</TableCell>
                  <TableCell>{r.successRate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="text-xs font-medium">{r.score}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索路由/源链/目标链" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => { setSearch(""); }}><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["路由名称", "源链", "目标链", "协议", "状态", "延迟", "跨链交易", "成功率", "中继数", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(route => (
              <tr key={route.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{route.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.sourceChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.targetChain}</td>
                <td className="px-4 py-3"><Badge variant="outline">{route.protocol}</Badge></td>
                <td className="px-4 py-3"><StatusBadge status={route.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.latency}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.txCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.successRate}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{route.relayers}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleView(route)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(route)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(route)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
        title={dialogMode === "delete" ? selectedRoute?.name || "" : "路由"}
        fields={crudFields}
        data={selectedRoute || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`路由详情 - ${selectedRoute?.name || ""}`}
        data={selectedRoute || {}}
        fields={detailFields}
        onEdit={() => { if (selectedRoute) { setDrawerOpen(false); handleEdit(selectedRoute); } }}
        onDelete={() => { if (selectedRoute) { setDrawerOpen(false); handleDelete(selectedRoute); } }}
      />

      {/* Route Simulation Dialog */}
      <Dialog open={simOpen} onOpenChange={setSimOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Route className="w-5 h-5" /> 路由模拟</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">源链</label><Input value={simForm.sourceChain} onChange={e => setSimForm({ ...simForm, sourceChain: e.target.value })} placeholder="金融联盟链" /></div>
              <div><label className="text-sm font-medium">目标链</label><Input value={simForm.targetChain} onChange={e => setSimForm({ ...simForm, targetChain: e.target.value })} placeholder="政务数据链" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">资产</label><Input value={simForm.asset} onChange={e => setSimForm({ ...simForm, asset: e.target.value })} placeholder="ETH" /></div>
              <div><label className="text-sm font-medium">数量</label><Input value={simForm.amount} onChange={e => setSimForm({ ...simForm, amount: e.target.value })} placeholder="1.0" /></div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSimulate} disabled={simLoading}>
              {simLoading ? "计算中..." : "开始模拟"}
            </Button>
            {simResult && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">预计时间</span><span className="font-medium">{simResult.estimatedTime}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">预计手续费</span><span className="font-medium">{simResult.estimatedFee}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">路径预览</span><span className="font-medium">{simResult.path.join(" → ")}</span></div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSimOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failover Config Dialog */}
      <Dialog open={failoverOpen} onOpenChange={setFailoverOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> 故障切换配置</DialogTitle></DialogHeader>
          <div className="py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>主路由</TableHead>
                  <TableHead>备份路由</TableHead>
                  <TableHead>自动切换</TableHead>
                  <TableHead>阈值(次)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failoverRules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell>{routesData.find(r => r.id === rule.primaryRoute)?.name || rule.primaryRoute}</TableCell>
                    <TableCell>{routesData.find(r => r.id === rule.backupRoute)?.name || rule.backupRoute}</TableCell>
                    <TableCell>
                      <Button variant={rule.autoSwitch ? "default" : "outline"} size="sm" className={rule.autoSwitch ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => toggleFailover(rule.id)}>
                        {rule.autoSwitch ? "已启用" : "已禁用"}
                      </Button>
                    </TableCell>
                    <TableCell>{rule.threshold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setFailoverOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
