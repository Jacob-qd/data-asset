import { useState } from "react";
import { HardDrive, Plus, Search, Server, Cpu, MemoryStick, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import Drawer from "@/components/Drawer";
import { cn } from "@/lib/utils";

const resources = [
  { node: "Node-A", cpu: { used: 16, total: 32 }, memory: { used: 64, total: 128 }, gpu: { used: 2, total: 4 }, disk: "512GB/2TB", bandwidth: "1Gbps", status: "active" },
  { node: "Node-B", cpu: { used: 10, total: 32 }, memory: { used: 48, total: 128 }, gpu: { used: 1, total: 4 }, disk: "800GB/2TB", bandwidth: "1Gbps", status: "active" },
  { node: "Node-C", cpu: { used: 25, total: 32 }, memory: { used: 109, total: 128 }, gpu: { used: 4, total: 4 }, disk: "1.2TB/2TB", bandwidth: "10Gbps", status: "warning" },
  { node: "Node-D", cpu: { used: 8, total: 16 }, memory: { used: 32, total: 64 }, gpu: { used: 0, total: 2 }, disk: "300GB/1TB", bandwidth: "1Gbps", status: "active" },
  { node: "Node-E", cpu: { used: 0, total: 32 }, memory: { used: 0, total: 128 }, gpu: { used: 0, total: 4 }, disk: "0/2TB", bandwidth: "-", status: "offline" },
  { node: "Node-F", cpu: { used: 18, total: 32 }, memory: { used: 74, total: 128 }, gpu: { used: 2, total: 4 }, disk: "600GB/2TB", bandwidth: "1Gbps", status: "active" },
];

const quotas = [
  { project: "联合风控建模", party: "阿里云", cpu: "16/32核", memory: "64/128GB", gpu: "2/4卡", disk: "500GB/1TB" },
  { project: "医疗数据融合", party: "腾讯云", cpu: "8/32核", memory: "32/128GB", gpu: "1/4卡", disk: "300GB/1TB" },
  { project: "跨机构统计", party: "华为云", cpu: "24/32核", memory: "96/128GB", gpu: "4/4卡", disk: "800GB/1TB" },
  { project: "供应链协同", party: "微众银行", cpu: "12/32核", memory: "48/128GB", gpu: "2/4卡", disk: "400GB/1TB" },
  { project: "推荐引擎", party: "百度智能云", cpu: "8/16核", memory: "32/64GB", gpu: "1/2卡", disk: "200GB/500GB" },
];

const reservations = [
  { id: "RS-001", project: "联合风控", resource: "GPU", amount: "2卡", start: "2026-04-21 08:00", end: "2026-04-21 18:00", status: "active" },
  { id: "RS-002", project: "医疗数据", resource: "CPU", amount: "16核", start: "2026-04-21 10:00", end: "2026-04-21 20:00", status: "active" },
  { id: "RS-003", project: "跨机构统计", resource: "内存", amount: "64GB", start: "2026-04-20 08:00", end: "2026-04-20 18:00", status: "expired" },
  { id: "RS-004", project: "供应链", resource: "GPU", amount: "1卡", start: "2026-04-22 08:00", end: "2026-04-22 18:00", status: "pending" },
];

export default function PrivacyResources() {
  const [activeTab, setActiveTab] = useState<"pool" | "quota" | "reservation" | "strategy">("pool");
  const [showDrawer, setShowDrawer] = useState(false);

  const stats = [
    { label: "总CPU核数", value: "160核", icon: Cpu, color: "text-blue-500" },
    { label: "总内存", value: "608GB", icon: MemoryStick, color: "text-purple-500" },
    { label: "GPU分配", value: "8/22卡", icon: Server, color: "text-amber-500" },
    { label: "活跃预留", value: "2", icon: HardDrive, color: "text-emerald-500" },
  ];

  const resCols = [
    { key: "node", title: "节点", cell: (r: typeof resources[0]) => <span className="font-medium text-slate-800">{r.node}</span> },
    { key: "cpu", title: "CPU", cell: (r: typeof resources[0]) => <div className="w-20"><div className="flex justify-between text-xs text-slate-500"><span>{r.cpu.used}/{r.cpu.total}核</span></div><div className="h-1.5 bg-slate-100 rounded-full"><div className={cn("h-full rounded-full", r.cpu.used / r.cpu.total > 0.8 ? "bg-red-500" : "bg-blue-500")} style={{ width: `${(r.cpu.used / r.cpu.total) * 100}%` }} /></div></div> },
    { key: "memory", title: "内存", cell: (r: typeof resources[0]) => <div className="w-20"><div className="flex justify-between text-xs text-slate-500"><span>{r.memory.used}/{r.memory.total}G</span></div><div className="h-1.5 bg-slate-100 rounded-full"><div className={cn("h-full rounded-full", r.memory.used / r.memory.total > 0.8 ? "bg-red-500" : "bg-purple-500")} style={{ width: `${(r.memory.used / r.memory.total) * 100}%` }} /></div></div> },
    { key: "gpu", title: "GPU", cell: (r: typeof resources[0]) => <span className="text-xs text-slate-500">{r.gpu.used}/{r.gpu.total}卡</span> },
    { key: "disk", title: "磁盘", cell: (r: typeof resources[0]) => <span className="text-xs text-slate-500">{r.disk}</span> },
    { key: "status", title: "状态", cell: (r: typeof resources[0]) => <Badge className={cn("text-xs", r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : r.status === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600")}>{r.status === "active" ? "正常" : r.status === "warning" ? "警告" : "离线"}</Badge> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (<div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div><div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div></div>))}
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {[{k:"pool",l:"资源池"},{k:"quota",l:"配额管理"},{k:"reservation",l:"预留管理"},{k:"strategy",l:"调度策略"}].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)} className={"px-4 py-2 rounded-md text-sm font-medium transition-colors " + (activeTab === t.k ? "bg-primary-50 text-primary-600" : "text-slate-500")}>{t.l}</button>
        ))}
      </div>

      {activeTab === "pool" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={resCols} data={resources} /></div>}

      {activeTab === "quota" && <div className="space-y-4">
        <div className="flex justify-end"><Button onClick={() => setShowDrawer(true)} className="gap-2"><Plus className="w-4 h-4" />设置配额</Button></div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">项目</th><th className="text-left py-3 px-4 text-slate-500 font-medium">参与方</th><th className="text-left py-3 px-4 text-slate-500 font-medium">CPU</th><th className="text-left py-3 px-4 text-slate-500 font-medium">内存</th><th className="text-left py-3 px-4 text-slate-500 font-medium">GPU</th><th className="text-left py-3 px-4 text-slate-500 font-medium">磁盘</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{quotas.map((q, i) => (
              <tr key={i} className="hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{q.project}</td><td className="py-3 px-4 text-xs">{q.party}</td><td className="py-3 px-4 text-xs font-mono">{q.cpu}</td><td className="py-3 px-4 text-xs font-mono">{q.memory}</td><td className="py-3 px-4 text-xs font-mono">{q.gpu}</td><td className="py-3 px-4 text-xs font-mono">{q.disk}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {activeTab === "reservation" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">预留ID</th><th className="text-left py-3 px-4 text-slate-500 font-medium">项目</th><th className="text-left py-3 px-4 text-slate-500 font-medium">资源</th><th className="text-left py-3 px-4 text-slate-500 font-medium">数量</th><th className="text-left py-3 px-4 text-slate-500 font-medium">开始时间</th><th className="text-left py-3 px-4 text-slate-500 font-medium">结束时间</th><th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{reservations.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50"><td className="py-3 px-4 font-mono text-xs text-slate-500">{r.id}</td><td className="py-3 px-4 text-slate-700">{r.project}</td><td className="py-3 px-4"><Badge variant="outline">{r.resource}</Badge></td><td className="py-3 px-4 text-xs">{r.amount}</td><td className="py-3 px-4 text-xs text-slate-500">{r.start}</td><td className="py-3 px-4 text-xs text-slate-500">{r.end}</td><td className="py-3 px-4"><Badge className={cn("text-xs", r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : r.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-slate-100 text-slate-500")}>{r.status === "active" ? "生效中" : r.status === "pending" ? "待生效" : "已过期"}</Badge></td></tr>
          ))}</tbody>
        </table>
      </div>}

      {activeTab === "strategy" && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left py-3 px-4 text-slate-500 font-medium">策略名称</th><th className="text-left py-3 px-4 text-slate-500 font-medium">类型</th><th className="text-left py-3 px-4 text-slate-500 font-medium">参数</th><th className="text-left py-3 px-4 text-slate-500 font-medium">状态</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {[{n:"FIFO调度",t:"FIFO",p:"先进先出",s:"active"},{n:"优先级调度",t:"Priority",p:"高优先级优先",s:"active"},{n:"资源感知调度",t:"Resource-Aware",p:"根据资源使用情况动态分配",s:"active"}].map((s, i) => (
              <tr key={i} className="hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-800">{s.n}</td><td className="py-3 px-4"><Badge variant="outline">{s.t}</Badge></td><td className="py-3 px-4 text-xs text-slate-500">{s.p}</td><td className="py-3 px-4"><Badge className="bg-emerald-500/10 text-emerald-600 text-xs">启用</Badge></td></tr>
            ))}
          </tbody>
        </table>
      </div>}

      <Drawer open={showDrawer} onClose={() => setShowDrawer(false)} title="设置配额" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700">项目</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>联合风控建模</option><option>医疗数据融合</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">参与方</label><select className="mt-1 w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"><option>阿里云</option><option>腾讯云</option></select></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">CPU限制(核)</label><Input placeholder="32" className="mt-1" /></div><div><label className="text-sm font-medium text-slate-700">内存限制(GB)</label><Input placeholder="128" className="mt-1" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-slate-700">GPU限制(卡)</label><Input placeholder="4" className="mt-1" /></div><div><label className="text-sm font-medium text-slate-700">磁盘限制(GB)</label><Input placeholder="1024" className="mt-1" /></div></div>
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setShowDrawer(false)}>取消</Button><Button onClick={() => setShowDrawer(false)}>保存</Button></div>
        </div>
      </Drawer>
    </div>
  );
}
