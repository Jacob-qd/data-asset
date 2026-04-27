import { useState } from "react";
import {
  Monitor, Activity, Server, Network, AlertTriangle, CheckCircle2,
  Clock, BarChart3, Cpu, HardDrive, Wifi, Zap, ChevronDown, RefreshCw,
  FileCode, Database, ArrowUpRight, ArrowDownRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Network Metrics ─── */
const metricsData = {
  tps: 5200,
  blockHeight: 4285691,
  pendingTx: 124,
  activeNodes: 42,
  avgBlockTime: "2.1s",
  totalTx: 156789012,
};

const nodeMetrics = [
  { name: "共识节点-01", cpu: 42, memory: 58, disk: 67, network: 320, status: "online" },
  { name: "共识节点-02", cpu: 38, memory: 52, disk: 61, network: 280, status: "online" },
  { name: "共识节点-03", cpu: 45, memory: 60, disk: 70, network: 350, status: "online" },
  { name: "共识节点-04", cpu: 78, memory: 82, disk: 75, network: 450, status: "warning" },
  { name: "共识节点-05", cpu: 35, memory: 48, disk: 55, network: 250, status: "online" },
];

const alertsData = [
  { id: "AL-001", level: "critical", title: "共识节点-04 CPU使用率过高", metric: "CPU 78%", time: "2025-04-22 10:30:00", status: "unresolved" },
  { id: "AL-002", level: "warning", title: "存储节点-02 磁盘空间不足", metric: "磁盘 88%", time: "2025-04-22 09:15:00", status: "unresolved" },
  { id: "AL-003", level: "info", title: "金融联盟链出块时间波动", metric: "出块 3.5s", time: "2025-04-22 08:00:00", status: "resolved" },
  { id: "AL-004", level: "critical", title: "跨链桥延迟异常", metric: "延迟 8.2s", time: "2025-04-22 07:30:00", status: "resolved" },
];

function AlertBadge({ level }: { level: string }) {
  const config: Record<string, { text: string; class: string }> = {
    critical: { text: "严重", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    warning: { text: "警告", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    info: { text: "提示", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[level] || config.info;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-[#334155] overflow-hidden">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function BlockchainMonitoring() {
  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">区块链监控</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">实时监控区块链网络健康状态、性能指标与告警事件</p>
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {[
          { label: "当前TPS", value: metricsData.tps.toLocaleString(), icon: <Zap className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20", change: "+5.2%", up: true },
          { label: "区块高度", value: metricsData.blockHeight.toLocaleString(), icon: <Database className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20", change: "+128", up: true },
          { label: "待处理交易", value: metricsData.pendingTx, icon: <Clock className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20", change: "-12", up: true },
          { label: "活跃节点", value: metricsData.activeNodes, icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20", change: "0", up: true },
          { label: "平均出块", value: metricsData.avgBlockTime, icon: <Activity className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20", change: "-0.1s", up: true },
          { label: "总交易数", value: metricsData.totalTx.toLocaleString(), icon: <BarChart3 className="w-5 h-5 text-rose-500" />, color: "bg-rose-50 dark:bg-rose-900/20", change: "+12.5K", up: true },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
            <div className={cn("text-xs mt-1 flex items-center gap-0.5", s.up ? "text-emerald-600" : "text-red-600")}>
              {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="nodes">节点监控</TabsTrigger>
          <TabsTrigger value="network">网络性能</TabsTrigger>
          <TabsTrigger value="alerts">告警事件</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4 pt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["节点名称", "CPU", "内存", "磁盘", "网络IO", "状态"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodeMetrics.map((node, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{node.name}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.cpu} color={node.cpu > 70 ? "bg-red-500" : "bg-indigo-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.cpu}%</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.memory} color={node.memory > 80 ? "bg-red-500" : "bg-emerald-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.memory}%</span></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={node.disk} color={node.disk > 80 ? "bg-red-500" : "bg-amber-500"} /><span className="text-xs text-slate-600 dark:text-slate-400">{node.disk}%</span></div></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{node.network} KB/s</td>
                    <td className="px-4 py-3">
                      {node.status === "online" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="network" className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "网络延迟", value: "15ms", sub: "P50延迟", icon: <Wifi className="w-4 h-4 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "吞吐量", value: "5.2K TPS", sub: "当前峰值", icon: <Zap className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "区块利用率", value: "78%", sub: "平均填充率", icon: <Database className="w-4 h-4 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "共识成功率", value: "99.98%", sub: "近24小时", icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "分叉率", value: "0.001%", sub: "近24小时", icon: <Network className="w-4 h-4 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "合约调用", value: "12.5K/min", sub: "当前速率", icon: <FileCode className="w-4 h-4 text-rose-500" />, color: "bg-rose-50 dark:bg-rose-900/20" },
            ].map((m, i) => (
              <div key={i} className={cn("rounded-xl border border-slate-200 dark:border-slate-700 p-4", m.color)}>
                <div className="flex items-center gap-2 mb-2">{m.icon}<span className="text-sm text-slate-600 dark:text-slate-400">{m.label}</span></div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{m.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.sub}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="pt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["告警ID", "级别", "标题", "指标", "时间", "状态"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alertsData.map(alert => (
                  <tr key={alert.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{alert.id}</td>
                    <td className="px-4 py-3"><AlertBadge level={alert.level} /></td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{alert.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{alert.metric}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{alert.time}</td>
                    <td className="px-4 py-3">
                      {alert.status === "resolved" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />已恢复</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="w-3 h-3" />未恢复</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
