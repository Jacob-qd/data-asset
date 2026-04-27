import { useState } from "react";
import {
  Rocket, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight,
  Server, FileCode, Tag, Settings, RefreshCw, Upload, Eye,
  Copy, Terminal, X, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Deploy Tasks ─── */
const deployTasksData = [
  { id: "DP-001", contract: "数据资产存证合约", version: "v2.0.0", network: "金融联盟链", channel: "金融交易通道", targetNodes: ["共识节点-01", "共识节点-02", "共识节点-03"], status: "success", deployTime: "2025-04-15 10:30:00", deployer: "管理员", txHash: "0x7a8b...c3d4", gasUsed: "0.0023 ETH" },
  { id: "DP-002", contract: "数据授权合约", version: "v1.1.0", network: "政务数据链", channel: "政务数据共享通道", targetNodes: ["共识节点-04", "共识节点-05"], status: "success", deployTime: "2025-03-20 14:00:00", deployer: "管理员", txHash: "0x9c1d...e2f3", gasUsed: "0.0018 ETH" },
  { id: "DP-003", contract: "数据溯源合约", version: "v1.2.0", network: "医疗数据链", channel: "医疗数据通道", targetNodes: ["共识节点-06", "共识节点-07", "共识节点-08"], status: "failed", deployTime: "2025-04-01 09:15:00", deployer: "管理员", txHash: "0x3e4f...a5b6", gasUsed: "0.0012 ETH" },
  { id: "DP-004", contract: "供应链金融合约", version: "v1.0.0", network: "供应链金融链", channel: "供应链金融通道", targetNodes: ["共识节点-09"], status: "pending", deployTime: "2025-04-25 11:00:00", deployer: "管理员", txHash: "-", gasUsed: "-" },
  { id: "DP-005", contract: "存证公证合约", version: "v1.1.0", network: "存证公证链", channel: "存证公证通道", targetNodes: ["共识节点-10", "共识节点-11"], status: "success", deployTime: "2025-04-10 16:45:00", deployer: "管理员", txHash: "0x1b2c...d3e4", gasUsed: "0.0021 ETH" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    success: { text: "成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    pending: { text: "部署中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.pending;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function ContractDeploy() {
  const [search, setSearch] = useState("");
  const [detailTask, setDetailTask] = useState<typeof deployTasksData[0] | null>(null);

  const filtered = deployTasksData.filter(d => d.contract.includes(search) || d.network.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约安装部署</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">部署智能合约到目标网络与节点，管理部署任务状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Rocket className="w-4 h-4" /> 部署合约</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "部署任务", value: deployTasksData.length, icon: <Rocket className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "部署成功", value: deployTasksData.filter(d => d.status === "success").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "部署失败", value: deployTasksData.filter(d => d.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
          { label: "进行中", value: deployTasksData.filter(d => d.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
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
          <Input placeholder="搜索合约/网络/通道" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> 刷新</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["任务ID", "合约名称", "版本", "目标网络", "通道", "目标节点", "状态", "部署时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr key={task.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{task.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{task.contract}</td>
                <td className="px-4 py-3"><Badge variant="outline">{task.version}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.network}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.channel}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.targetNodes.length}个节点</td>
                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.deployTime}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => setDetailTask(task)}><ChevronRight className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailTask} onOpenChange={() => setDetailTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Rocket className="w-5 h-5 text-indigo-500" />部署详情 - {detailTask?.id}</DialogTitle>
          </DialogHeader>
          {detailTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "任务ID", value: detailTask.id },
                  { label: "合约名称", value: detailTask.contract },
                  { label: "版本", value: detailTask.version },
                  { label: "目标网络", value: detailTask.network },
                  { label: "通道", value: detailTask.channel },
                  { label: "状态", value: detailTask.status },
                  { label: "部署时间", value: detailTask.deployTime },
                  { label: "部署人", value: detailTask.deployer },
                  { label: "交易哈希", value: detailTask.txHash },
                  { label: "Gas消耗", value: detailTask.gasUsed },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">目标节点</div>
                <div className="flex flex-wrap gap-2">
                  {detailTask.targetNodes.map((node, i) => (
                    <Badge key={i} variant="secondary" className="gap-1"><Server className="w-3 h-3" />{node}</Badge>
                  ))}
                </div>
              </div>
              {detailTask.status === "failed" && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-medium mb-1"><AlertTriangle className="w-4 h-4" />失败原因</div>
                  <p className="text-xs text-red-600 dark:text-red-300">节点共识超时，部署交易未在指定时间内获得足够背书签名</p>
                </div>
              )}
              <div className="flex gap-2">
                {detailTask.status === "failed" && <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><RefreshCw className="w-4 h-4" /> 重新部署</Button>}
                <Button variant="outline" className="gap-2"><Terminal className="w-4 h-4" /> 查看日志</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
