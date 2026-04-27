import { useState } from "react";
import {
  Server, Plus, Search, Activity, Cpu, MemoryStick, HardDrive,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Settings, Power,
  Monitor, ChevronRight, X, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Hosts Data ─── */
const hostsData = [
  { id: "H-001", name: "区块链主机-01", ip: "192.168.10.101", os: "Ubuntu 22.04", cpuCores: 32, memory: 128, disk: 2048, status: "online", region: "北京-华北", nodeCount: 4, uptime: "99.99%", agentVersion: "v3.2.1" },
  { id: "H-002", name: "区块链主机-02", ip: "192.168.10.102", os: "CentOS 8.5", cpuCores: 24, memory: 64, disk: 1024, status: "online", region: "上海-华东", nodeCount: 3, uptime: "99.95%", agentVersion: "v3.2.1" },
  { id: "H-003", name: "区块链主机-03", ip: "192.168.10.103", os: "Ubuntu 22.04", cpuCores: 16, memory: 32, disk: 512, status: "warning", region: "广州-华南", nodeCount: 2, uptime: "98.50%", agentVersion: "v3.1.8" },
  { id: "H-004", name: "区块链主机-04", ip: "192.168.10.104", os: "Ubuntu 22.04", cpuCores: 48, memory: 256, disk: 4096, status: "online", region: "深圳-华南", nodeCount: 6, uptime: "99.97%", agentVersion: "v3.2.1" },
  { id: "H-005", name: "区块链主机-05", ip: "192.168.10.105", os: "CentOS 8.5", cpuCores: 8, memory: 16, disk: 256, status: "offline", region: "成都-西南", nodeCount: 0, uptime: "95.20%", agentVersion: "v3.0.5" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; icon: React.ReactNode; class: string }> = {
    online: { text: "在线", icon: <CheckCircle2 className="w-3 h-3" />, class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    warning: { text: "警告", icon: <AlertTriangle className="w-3 h-3" />, class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    offline: { text: "离线", icon: <XCircle className="w-3 h-3" />, class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.offline;
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.icon}{c.text}</span>;
}

export default function BlockchainHostManage() {
  const [search, setSearch] = useState("");
  const [detailHost, setDetailHost] = useState<typeof hostsData[0] | null>(null);

  const filtered = hostsData.filter(h =>
    h.name.includes(search) || h.ip.includes(search) || h.region.includes(search)
  );

  const onlineCount = hostsData.filter(h => h.status === "online").length;
  const warningCount = hostsData.filter(h => h.status === "warning").length;
  const offlineCount = hostsData.filter(h => h.status === "offline").length;
  const totalNodes = hostsData.reduce((sum, h) => sum + h.nodeCount, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">主机管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链节点主机资源，监控主机健康状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
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
                    <Button size="sm" variant="ghost" onClick={() => setDetailHost(host)}><Monitor className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost"><Terminal className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost"><Settings className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailHost} onOpenChange={() => setDetailHost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              主机详情 - {detailHost?.name}
            </DialogTitle>
          </DialogHeader>
          {detailHost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "主机ID", value: detailHost.id },
                  { label: "IP地址", value: detailHost.ip },
                  { label: "操作系统", value: detailHost.os },
                  { label: "区域", value: detailHost.region },
                  { label: "CPU", value: `${detailHost.cpuCores}核` },
                  { label: "内存", value: `${detailHost.memory}GB` },
                  { label: "磁盘", value: `${detailHost.disk}GB` },
                  { label: "运行时间", value: detailHost.uptime },
                  { label: "Agent版本", value: detailHost.agentVersion },
                  { label: "节点数量", value: `${detailHost.nodeCount}个` },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-3">资源使用率</div>
                <div className="space-y-3">
                  {[
                    { label: "CPU使用率", value: 42, color: "bg-indigo-500" },
                    { label: "内存使用率", value: 58, color: "bg-emerald-500" },
                    { label: "磁盘使用率", value: 67, color: "bg-amber-500" },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-600 dark:text-slate-400">{r.label}</span><span className="text-slate-900 dark:text-slate-100">{r.value}%</span></div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className={cn("h-full rounded-full", r.color)} style={{ width: `${r.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Power className="w-4 h-4" /> 重启主机</Button>
                <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 更新Agent</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
