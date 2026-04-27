import { useState } from "react";
import {
  Network, Plus, Search, Server, Link2, Activity, ShieldCheck,
  CheckCircle2, XCircle, Clock, ChevronRight, Settings, RefreshCw,
  Users, Database, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Networks ─── */
const networksData = [
  { id: "NW-001", name: "金融联盟链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 12, orgs: 5, tps: 3200, blockHeight: 4285691, createTime: "2024-06-15", admin: "金融联盟管理员" },
  { id: "NW-002", name: "政务数据链", type: "联盟链", consensus: "Raft", status: "running", nodes: 8, orgs: 4, tps: 1500, blockHeight: 2156032, createTime: "2024-08-20", admin: "政务联盟管理员" },
  { id: "NW-003", name: "供应链金融链", type: "联盟链", consensus: "PBFT", status: "stopped", nodes: 6, orgs: 3, tps: 0, blockHeight: 892341, createTime: "2024-10-10", admin: "供应链管理员" },
  { id: "NW-004", name: "医疗数据链", type: "联盟链", consensus: "PBFT", status: "running", nodes: 10, orgs: 6, tps: 2800, blockHeight: 1567234, createTime: "2024-11-05", admin: "医疗联盟管理员" },
  { id: "NW-005", name: "存证公证链", type: "公有链", consensus: "PoA", status: "running", nodes: 15, orgs: 8, tps: 4500, blockHeight: 5623412, createTime: "2024-03-01", admin: "公证联盟管理员" },
];

const orgsData = [
  { name: "中国银行", role: "创始成员", joinTime: "2024-06-15", nodeCount: 3, status: "active" },
  { name: "工商银行", role: "成员", joinTime: "2024-07-01", nodeCount: 2, status: "active" },
  { name: "建设银行", role: "成员", joinTime: "2024-07-15", nodeCount: 2, status: "active" },
  { name: "农业银行", role: "成员", joinTime: "2024-08-01", nodeCount: 2, status: "active" },
  { name: "交通银行", role: "观察成员", joinTime: "2024-09-01", nodeCount: 1, status: "active" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    running: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    stopped: { text: "已停止", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    initializing: { text: "初始化中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.stopped;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function BlockchainNetwork() {
  const [search, setSearch] = useState("");
  const [detailNet, setDetailNet] = useState<typeof networksData[0] | null>(null);

  const filtered = networksData.filter(n => n.name.includes(search) || n.type.includes(search));
  const runningCount = networksData.filter(n => n.status === "running").length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">区块链网络</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理区块链网络实例，配置共识机制与网络参数</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Plus className="w-4 h-4" /> 创建网络</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "网络总数", value: networksData.length, icon: <Network className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "运行中", value: runningCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总节点数", value: networksData.reduce((s, n) => s + n.nodes, 0), icon: <Server className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "总TPS", value: networksData.reduce((s, n) => s + n.tps, 0), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
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
          <Input placeholder="搜索网络名称/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["网络名称", "类型", "共识机制", "状态", "节点数", "组织数", "TPS", "区块高度", "创建时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(net => (
              <tr key={net.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{net.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{net.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.consensus}</td>
                <td className="px-4 py-3"><StatusBadge status={net.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.nodes}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.orgs}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.tps.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.blockHeight.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{net.createTime}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setDetailNet(net)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailNet} onOpenChange={() => setDetailNet(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-500" />
              网络详情 - {detailNet?.name}
            </DialogTitle>
          </DialogHeader>
          {detailNet && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="orgs">参与组织</TabsTrigger>
                <TabsTrigger value="config">网络配置</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "网络ID", value: detailNet.id },
                    { label: "网络名称", value: detailNet.name },
                    { label: "类型", value: detailNet.type },
                    { label: "共识机制", value: detailNet.consensus },
                    { label: "状态", value: detailNet.status },
                    { label: "节点数量", value: `${detailNet.nodes}个` },
                    { label: "组织数量", value: `${detailNet.orgs}个` },
                    { label: "当前TPS", value: detailNet.tps.toLocaleString() },
                    { label: "区块高度", value: detailNet.blockHeight.toLocaleString() },
                    { label: "创建时间", value: detailNet.createTime },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="orgs" className="pt-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-[#273548]">
                      <tr>
                        {["组织名称", "角色", "加入时间", "节点数", "状态"].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orgsData.map((org, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{org.name}</td>
                          <td className="px-4 py-2"><Badge variant="secondary">{org.role}</Badge></td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.joinTime}</td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.nodeCount}</td>
                          <td className="px-4 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="config" className="pt-4 space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3">共识配置</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">共识算法</span><span className="text-slate-900 dark:text-slate-100">{detailNet.consensus}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">出块间隔</span><span className="text-slate-900 dark:text-slate-100">2秒</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">区块大小</span><span className="text-slate-900 dark:text-slate-100">2MB</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">确认阈值</span><span className="text-slate-900 dark:text-slate-100">2/3</span></div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="text-sm font-medium mb-3">网络参数</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">网络ID (ChainID)</span><span className="text-slate-900 dark:text-slate-100">{detailNet.id.replace("NW-", "")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">P2P端口</span><span className="text-slate-900 dark:text-slate-100">30303</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">RPC端口</span><span className="text-slate-900 dark:text-slate-100">8545</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">TLS加密</span><span className="text-emerald-600">已启用</span></div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
