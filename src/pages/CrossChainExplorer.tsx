import { useState } from "react";
import {
  Globe, Search, ArrowLeftRight, CheckCircle2, XCircle, Clock,
  ChevronRight, ShieldCheck, Network, Activity, Hash, Server, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Cross-Chain Transactions ─── */
const crossTxData = [
  { id: "CTX-001", type: "资产转移", sourceChain: "金融联盟链", targetChain: "政务数据链", asset: "数据凭证#8923", amount: "1", status: "completed", sourceTx: "0xabc1...def2", targetTx: "0xghi3...jkl4", time: "2025-04-22 10:00:00", relayer: "中继节点-01" },
  { id: "CTX-002", type: "数据同步", sourceChain: "医疗数据链", targetChain: "存证公证链", asset: "医疗记录#4521", amount: "-", status: "completed", sourceTx: "0xdef5...ghi6", targetTx: "0xjkl7...mno8", time: "2025-04-22 10:05:00", relayer: "中继节点-02" },
  { id: "CTX-003", type: "资产转移", sourceChain: "供应链金融链", targetChain: "金融联盟链", asset: "应收账款#1203", amount: "50000", status: "pending", sourceTx: "0xghi9...jkl0", targetTx: "-", time: "2025-04-22 10:10:00", relayer: "中继节点-03" },
  { id: "CTX-004", type: "消息传递", sourceChain: "政务数据链", targetChain: "医疗数据链", asset: "授权消息#3321", amount: "-", status: "failed", sourceTx: "0xjkl1...mno2", targetTx: "-", time: "2025-04-22 10:15:00", relayer: "中继节点-01" },
  { id: "CTX-005", type: "资产转移", sourceChain: "存证公证链", targetChain: "金融联盟链", asset: "存证凭证#6678", amount: "1", status: "completed", sourceTx: "0xmno3...pqr4", targetTx: "0xstu5...vwx6", time: "2025-04-22 10:20:00", relayer: "中继节点-02" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    completed: { text: "已完成", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending: { text: "进行中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.pending;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function CrossChainExplorer() {
  const [search, setSearch] = useState("");
  const [detailTx, setDetailTx] = useState<typeof crossTxData[0] | null>(null);

  const filtered = crossTxData.filter(t => t.id.includes(search) || t.asset.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">跨链浏览器</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">浏览跨链交易记录，追踪资产跨链流转全生命周期</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "跨链交易", value: crossTxData.length, icon: <ArrowLeftRight className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已完成", value: crossTxData.filter(t => t.status === "completed").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "进行中", value: crossTxData.filter(t => t.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "失败", value: crossTxData.filter(t => t.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="搜索跨链交易ID/资产" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["交易ID", "类型", "源链", "目标链", "资产", "状态", "源链交易", "目标链交易", "时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.id}</td>
                <td className="px-4 py-3"><Badge variant="outline">{tx.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.sourceChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.targetChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.asset}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.sourceTx}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.targetTx}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.time}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setDetailTx(tx)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailTx} onOpenChange={() => setDetailTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500" />跨链交易详情 - {detailTx?.id}</DialogTitle>
          </DialogHeader>
          {detailTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "交易ID", value: detailTx.id },
                  { label: "类型", value: detailTx.type },
                  { label: "源链", value: detailTx.sourceChain },
                  { label: "目标链", value: detailTx.targetChain },
                  { label: "资产", value: detailTx.asset },
                  { label: "状态", value: detailTx.status },
                  { label: "时间", value: detailTx.time },
                  { label: "中继节点", value: detailTx.relayer },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">跨链流程</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" />源链锁定</div>
                  <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" />中继验证</div>
                  <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                  <div className={cn("flex items-center gap-1", detailTx.status === "completed" ? "text-emerald-600" : detailTx.status === "failed" ? "text-red-600" : "text-slate-600")}>
                    {detailTx.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : detailTx.status === "failed" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    目标链释放
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
