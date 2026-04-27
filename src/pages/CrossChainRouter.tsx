import { useState } from "react";
import {
  ArrowLeftRight, Plus, Search, Link2, Globe, CheckCircle2, XCircle, Clock,
  ChevronRight, Settings, RefreshCw, ShieldCheck, Network, Activity,
  Server, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Cross-Chain Routes ─── */
const routesData = [
  { id: "RT-001", name: "金融-政务跨链桥", sourceChain: "金融联盟链", targetChain: "政务数据链", protocol: "HTLC", status: "active", latency: "2.5s", txCount: 12345, successRate: "99.8%", relayers: 3, createTime: "2024-09-01" },
  { id: "RT-002", name: "医疗-存证跨链桥", sourceChain: "医疗数据链", targetChain: "存证公证链", protocol: "侧链中继", status: "active", latency: "3.2s", txCount: 5678, successRate: "99.5%", relayers: 2, createTime: "2024-10-15" },
  { id: "RT-003", name: "供应链-金融跨链桥", sourceChain: "供应链金融链", targetChain: "金融联盟链", protocol: "公证人机制", status: "inactive", latency: "-", txCount: 0, successRate: "-", relayers: 0, createTime: "2024-11-20" },
  { id: "RT-004", name: "政务-存证跨链桥", sourceChain: "政务数据链", targetChain: "存证公证链", protocol: "HTLC", status: "active", latency: "1.8s", txCount: 8912, successRate: "99.9%", relayers: 2, createTime: "2024-12-01" },
  { id: "RT-005", name: "医疗-金融跨链桥", sourceChain: "医疗数据链", targetChain: "金融联盟链", protocol: "侧链中继", status: "active", latency: "2.9s", txCount: 3456, successRate: "99.2%", relayers: 2, createTime: "2025-01-10" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    active: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    inactive: { text: "已停用", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    maintenance: { text: "维护中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.inactive;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function CrossChainRouter() {
  const [search, setSearch] = useState("");
  const [detailRoute, setDetailRoute] = useState<typeof routesData[0] | null>(null);

  const filtered = routesData.filter(r => r.name.includes(search) || r.sourceChain.includes(search) || r.targetChain.includes(search));
  const activeCount = routesData.filter(r => r.status === "active").length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">跨链路由</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">配置跨链互操作路由，管理中继节点与跨链协议</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Plus className="w-4 h-4" /> 创建路由</Button>
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

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索路由/源链/目标链" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
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
                  <Button size="sm" variant="ghost" onClick={() => setDetailRoute(route)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailRoute} onOpenChange={() => setDetailRoute(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="w-5 h-5 text-indigo-500" />路由详情 - {detailRoute?.name}</DialogTitle>
          </DialogHeader>
          {detailRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "路由ID", value: detailRoute.id },
                  { label: "路由名称", value: detailRoute.name },
                  { label: "源链", value: detailRoute.sourceChain },
                  { label: "目标链", value: detailRoute.targetChain },
                  { label: "跨链协议", value: detailRoute.protocol },
                  { label: "状态", value: detailRoute.status },
                  { label: "延迟", value: detailRoute.latency },
                  { label: "跨链交易数", value: detailRoute.txCount.toLocaleString() },
                  { label: "成功率", value: detailRoute.successRate },
                  { label: "中继节点", value: detailRoute.relayers },
                  { label: "创建时间", value: detailRoute.createTime },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><ShieldCheck className="w-4 h-4" /> 测试连通</Button>
                <Button variant="outline" className="gap-2"><Settings className="w-4 h-4" /> 配置参数</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}