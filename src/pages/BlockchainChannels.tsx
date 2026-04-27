import { useState } from "react";
import {
  Layers, Plus, Search, Lock, Unlock, Users, Activity,
  CheckCircle2, XCircle, ChevronRight, Settings, RefreshCw,
  FileCode, Database, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Channels ─── */
const channelsData = [
  { id: "CH-001", name: "金融交易通道", network: "金融联盟链", orgs: ["中国银行", "工商银行", "建设银行"], status: "active", txCount: 452310, chaincodes: 4, createTime: "2024-06-20", policy: "3/3签名", privacy: "private" },
  { id: "CH-002", name: "政务数据共享通道", network: "政务数据链", orgs: ["市大数据局", "市公安局", "市卫健委", "市人社局"], status: "active", txCount: 128560, chaincodes: 2, createTime: "2024-08-25", policy: "2/4签名", privacy: "private" },
  { id: "CH-003", name: "供应链金融通道", network: "供应链金融链", orgs: ["核心企业", "供应商A", "供应商B"], status: "inactive", txCount: 34520, chaincodes: 1, createTime: "2024-10-15", policy: "2/3签名", privacy: "public" },
  { id: "CH-004", name: "医疗数据通道", network: "医疗数据链", orgs: ["三甲医院", "疾控中心", "医保局"], status: "active", txCount: 89230, chaincodes: 3, createTime: "2024-11-10", policy: "2/3签名", privacy: "private" },
  { id: "CH-005", name: "存证公证通道", network: "存证公证链", orgs: ["公证处", "法院", "仲裁委", "律所"], status: "active", txCount: 567890, chaincodes: 2, createTime: "2024-03-10", policy: "3/4签名", privacy: "public" },
];

function StatusBadge({ status, privacy }: { status: string; privacy: string }) {
  const config: Record<string, { text: string; class: string }> = {
    active: { text: "已激活", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    inactive: { text: "未激活", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    pending: { text: "配置中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {privacy === "private" ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      {c.text}
    </span>
  );
}

export default function BlockchainChannels() {
  const [search, setSearch] = useState("");
  const [detailCh, setDetailCh] = useState<typeof channelsData[0] | null>(null);

  const filtered = channelsData.filter(c => c.name.includes(search) || c.network.includes(search));
  const activeCount = channelsData.filter(c => c.status === "active").length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">通道管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理Fabric通道生命周期，配置通道策略与隐私设置</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Plus className="w-4 h-4" /> 创建通道</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "通道总数", value: channelsData.length, icon: <Layers className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已激活", value: activeCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "总交易数", value: channelsData.reduce((s, c) => s + c.txCount, 0).toLocaleString(), icon: <Activity className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "智能合约", value: channelsData.reduce((s, c) => s + c.chaincodes, 0), icon: <FileCode className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
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
          <Input placeholder="搜索通道名称/所属网络" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["通道名称", "所属网络", "参与组织", "状态", "交易数", "合约数", "背书策略", "创建时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(ch => (
              <tr key={ch.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{ch.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.network}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{ch.orgs.length}个组织</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={ch.status} privacy={ch.privacy} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.txCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.chaincodes}</td>
                <td className="px-4 py-3"><Badge variant="outline">{ch.policy}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ch.createTime}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setDetailCh(ch)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailCh} onOpenChange={() => setDetailCh(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500" />通道详情 - {detailCh?.name}</DialogTitle>
          </DialogHeader>
          {detailCh && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="orgs">参与组织</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "通道ID", value: detailCh.id },
                    { label: "通道名称", value: detailCh.name },
                    { label: "所属网络", value: detailCh.network },
                    { label: "状态", value: detailCh.status },
                    { label: "隐私类型", value: detailCh.privacy === "private" ? "私有通道" : "公共通道" },
                    { label: "背书策略", value: detailCh.policy },
                    { label: "交易总数", value: detailCh.txCount.toLocaleString() },
                    { label: "合约数量", value: detailCh.chaincodes },
                    { label: "创建时间", value: detailCh.createTime },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="orgs" className="pt-4">
                <div className="space-y-2">
                  {detailCh.orgs.map((org, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{org}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
