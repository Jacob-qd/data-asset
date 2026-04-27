import { useState } from "react";
import {
  Scale, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight,
  Users, Vote, FileText, Settings, ShieldCheck, Activity, Gavel, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Proposals ─── */
const proposalsData = [
  { id: "GP-001", title: "增加金融联盟链共识节点", type: "节点治理", status: "voting", proposer: "中国银行", votes: { for: 3, against: 1, abstain: 0 }, threshold: "3/5", createTime: "2025-04-20", deadline: "2025-04-27", desc: " proposal to add 2 new consensus nodes to improve network throughput" },
  { id: "GP-002", title: "修改政务数据链出块间隔", type: "参数治理", status: "passed", proposer: "市大数据局", votes: { for: 4, against: 0, abstain: 0 }, threshold: "3/4", createTime: "2025-04-15", deadline: "2025-04-22", desc: "将出块间隔从3秒调整为2秒，提升交易处理效率" },
  { id: "GP-003", title: "医疗数据链准入新组织", type: "成员治理", status: "rejected", proposer: "市卫健委", votes: { for: 1, against: 2, abstain: 1 }, threshold: "2/3", createTime: "2025-04-10", deadline: "2025-04-17", desc: "接纳某私立医院加入医疗数据共享联盟链" },
  { id: "GP-004", title: "升级存证公证链合约版本", type: "合约治理", status: "voting", proposer: "公证处", votes: { for: 2, against: 0, abstain: 1 }, threshold: "3/4", createTime: "2025-04-22", deadline: "2025-04-29", desc: "将存证合约升级至v2.0，支持批量存证功能" },
  { id: "GP-005", title: "调整跨链桥手续费", type: "参数治理", status: "passed", proposer: "联盟管理员", votes: { for: 5, against: 0, abstain: 0 }, threshold: "3/5", createTime: "2025-04-01", deadline: "2025-04-08", desc: "将跨链资产转移手续费从0.1%调整为0.05%" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    voting: { text: "投票中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    passed: { text: "已通过", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected: { text: "已驳回", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    executed: { text: "已执行", class: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  };
  const c = config[status] || config.voting;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function GovernanceChain() {
  const [search, setSearch] = useState("");
  const [detailProp, setDetailProp] = useState<typeof proposalsData[0] | null>(null);

  const filtered = proposalsData.filter(p => p.title.includes(search) || p.type.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">治理链</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">链上治理提案管理，支持投票表决与参数升级</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Plus className="w-4 h-4" /> 发起提案</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "提案总数", value: proposalsData.length, icon: <Scale className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已通过", value: proposalsData.filter(p => p.status === "passed").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "投票中", value: proposalsData.filter(p => p.status === "voting").length, icon: <Vote className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "已驳回", value: proposalsData.filter(p => p.status === "rejected").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="搜索提案/类型" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["提案ID", "标题", "类型", "发起人", "状态", "赞成", "反对", "弃权", "阈值", "截止时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(prop => (
              <tr key={prop.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{prop.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{prop.title}</td>
                <td className="px-4 py-3"><Badge variant="outline">{prop.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.proposer}</td>
                <td className="px-4 py-3"><StatusBadge status={prop.status} /></td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{prop.votes.for}</td>
                <td className="px-4 py-3 text-red-600 font-medium">{prop.votes.against}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.votes.abstain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.threshold}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{prop.deadline}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setDetailProp(prop)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailProp} onOpenChange={() => setDetailProp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-500" />提案详情 - {detailProp?.title}</DialogTitle>
          </DialogHeader>
          {detailProp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "提案ID", value: detailProp.id },
                  { label: "标题", value: detailProp.title },
                  { label: "类型", value: detailProp.type },
                  { label: "发起人", value: detailProp.proposer },
                  { label: "状态", value: detailProp.status },
                  { label: "阈值", value: detailProp.threshold },
                  { label: "创建时间", value: detailProp.createTime },
                  { label: "截止时间", value: detailProp.deadline },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">投票情况</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-emerald-600">赞成 {detailProp.votes.for}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(detailProp.votes.for / (detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-red-600">反对 {detailProp.votes.against}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-red-500" style={{ width: `${(detailProp.votes.against / (detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">弃权 {detailProp.votes.abstain}</span></div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-slate-400" style={{ width: `${(detailProp.votes.abstain / (detailProp.votes.for + detailProp.votes.against + detailProp.votes.abstain)) * 100}%` }} /></div>
                  </div>
                </div>
              </div>
              {detailProp.status === "voting" && (
                <div className="flex gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"><CheckCircle2 className="w-4 h-4" /> 赞成</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2"><XCircle className="w-4 h-4" /> 反对</Button>
                  <Button variant="outline" className="gap-2"><Clock className="w-4 h-4" /> 弃权</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
