import { useState } from "react";
import {
  GitBranch, Plus, Search, Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, ArrowUpCircle, RotateCcw, FileCode, Tag, User,
  GitCommit, Diff, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Contract Versions ─── */
const contractVersionsData = [
  {
    id: "SC-001",
    name: "数据资产存证合约",
    versions: [
      { version: "v2.0.0", status: "current", deployTime: "2025-04-15", deployer: "管理员", changes: "新增批量存证接口，优化gas消耗", audit: "已通过", size: "12.5KB" },
      { version: "v1.2.0", status: "deprecated", deployTime: "2025-02-10", deployer: "管理员", changes: "修复重入漏洞，增强权限校验", audit: "已通过", size: "11.8KB" },
      { version: "v1.1.0", status: "deprecated", deployTime: "2024-11-20", deployer: "管理员", changes: "增加事件日志，优化存储结构", audit: "已通过", size: "10.2KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-08-01", deployer: "管理员", changes: "初始版本，基础存证功能", audit: "已通过", size: "9.1KB" },
    ],
  },
  {
    id: "SC-002",
    name: "数据授权合约",
    versions: [
      { version: "v1.1.0", status: "current", deployTime: "2025-03-20", deployer: "管理员", changes: "支持多级授权与委托，增加授权期限", audit: "已通过", size: "15.3KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-15", deployer: "管理员", changes: "初始版本，基础授权功能", audit: "已通过", size: "12.1KB" },
    ],
  },
  {
    id: "SC-003",
    name: "数据溯源合约",
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-04-01", deployer: "管理员", changes: "支持跨链溯源查询，优化查询性能", audit: "已通过", size: "18.7KB" },
      { version: "v1.1.0", status: "deprecated", deployTime: "2025-01-10", deployer: "管理员", changes: "增加血缘关系图谱存储", audit: "已通过", size: "16.4KB" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-07-20", deployer: "管理员", changes: "初始版本，基础溯源功能", audit: "已通过", size: "14.2KB" },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    current: { text: "当前版本", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    deprecated: { text: "已废弃", class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    pending: { text: "待部署", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  };
  const c = config[status] || config.deprecated;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function ContractVersions() {
  const [search, setSearch] = useState("");
  const [detailContract, setDetailContract] = useState<typeof contractVersionsData[0] | null>(null);

  const filtered = contractVersionsData.filter(c => c.name.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约版本管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">管理智能合约版本迭代，追踪变更历史与审计状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Plus className="w-4 h-4" /> 发布新版本</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "合约总数", value: contractVersionsData.length, icon: <FileCode className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "当前版本", value: contractVersionsData.length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "历史版本", value: contractVersionsData.reduce((s, c) => s + c.versions.length - 1, 0), icon: <GitBranch className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "审计通过", value: contractVersionsData.reduce((s, c) => s + c.versions.filter(v => v.audit === "已通过").length, 0), icon: <Tag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
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
          <Input placeholder="搜索合约名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(contract => (
          <div key={contract.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <div className="px-4 py-3 bg-slate-50 dark:bg-[#273548] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-slate-900 dark:text-slate-100">{contract.name}</span>
                <Badge variant="outline">{contract.id}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setDetailContract(contract)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {["版本", "状态", "部署时间", "部署人", "变更说明", "审计", "大小", "操作"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.versions.map((v, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{v.version}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployTime}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.deployer}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{v.changes}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{v.audit}</Badge></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"><FileCode className="w-4 h-4" /></Button>
                          {v.status === "deprecated" && <Button size="sm" variant="ghost"><RotateCcw className="w-4 h-4" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!detailContract} onOpenChange={() => setDetailContract(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GitBranch className="w-5 h-5 text-indigo-500" />版本历史 - {detailContract?.name}</DialogTitle>
          </DialogHeader>
          {detailContract && (
            <div className="space-y-4 pt-2">
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
                {detailContract.versions.map((v, i) => (
                  <div key={i} className="relative">
                    <div className={cn("absolute -left-[29px] w-4 h-4 rounded-full border-2", v.status === "current" ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600")} />
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">{v.version}</span>
                          <StatusBadge status={v.status} />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{v.deployTime}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{v.changes}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.deployer}</span>
                        <span className="flex items-center gap-1"><FileCode className="w-3 h-3" />{v.size}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{v.audit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
