import { useState } from "react";
import {
  Beaker, Plus, Search, Play, CheckCircle2, XCircle, Clock,
  ChevronRight, Terminal, FileCode, Bug, AlertTriangle, RotateCcw,
  Code, ListChecks, X, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Mock Test Cases ─── */
const testCasesData = [
  { id: "TC-001", name: "存证合约-正常存证", contract: "数据资产存证合约", type: "功能测试", status: "passed", duration: "0.23s", runTime: "2025-04-22 10:00:00", result: "交易成功上链，哈希匹配" },
  { id: "TC-002", name: "存证合约-重复存证", contract: "数据资产存证合约", type: "异常测试", status: "passed", duration: "0.18s", runTime: "2025-04-22 10:01:00", result: "正确拒绝重复存证请求" },
  { id: "TC-003", name: "授权合约-正常授权", contract: "数据授权合约", type: "功能测试", status: "passed", duration: "0.31s", runTime: "2025-04-22 10:02:00", result: "授权关系建立成功" },
  { id: "TC-004", name: "授权合约-越权访问", contract: "数据授权合约", type: "安全测试", status: "failed", duration: "0.15s", runTime: "2025-04-22 10:03:00", result: "越权检查未生效，需修复" },
  { id: "TC-005", name: "溯源合约-查询性能", contract: "数据溯源合约", type: "性能测试", status: "passed", duration: "1.25s", runTime: "2025-04-22 10:04:00", result: "1000条记录查询耗时1.25s" },
  { id: "TC-006", name: "溯源合约-跨链查询", contract: "数据溯源合约", type: "集成测试", status: "passed", duration: "2.56s", runTime: "2025-04-22 10:05:00", result: "跨链溯源查询成功" },
];

const testSuitesData = [
  { name: "存证合约完整测试套件", cases: 12, passed: 11, failed: 1, coverage: "92%", lastRun: "2025-04-22" },
  { name: "授权合约完整测试套件", cases: 8, passed: 7, failed: 1, coverage: "88%", lastRun: "2025-04-22" },
  { name: "溯源合约完整测试套件", cases: 15, passed: 15, failed: 0, coverage: "95%", lastRun: "2025-04-22" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    passed: { text: "通过", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    running: { text: "执行中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.running;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

export default function ContractTesting() {
  const [search, setSearch] = useState("");
  const [detailCase, setDetailCase] = useState<typeof testCasesData[0] | null>(null);

  const filtered = testCasesData.filter(t => t.name.includes(search) || t.contract.includes(search));
  const passedCount = testCasesData.filter(t => t.status === "passed").length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约测试</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">智能合约自动化测试平台，支持功能/性能/安全/集成测试</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Play className="w-4 h-4" /> 执行测试</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "测试用例", value: testCasesData.length, icon: <ListChecks className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "通过", value: passedCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "失败", value: testCasesData.filter(t => t.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
          { label: "测试套件", value: testSuitesData.length, icon: <Beaker className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cases">测试用例</TabsTrigger>
          <TabsTrigger value="suites">测试套件</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索用例/合约" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["用例ID", "用例名称", "合约", "类型", "状态", "耗时", "执行时间", "操作"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tc => (
                  <tr key={tc.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tc.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{tc.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tc.contract}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{tc.type}</Badge></td>
                    <td className="px-4 py-3"><StatusBadge status={tc.status} /></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tc.duration}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tc.runTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetailCase(tc)}><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Play className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="suites" className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            {testSuitesData.map((suite, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-[#1e293b]">
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{suite.name}</span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">用例数</span><span className="text-slate-900 dark:text-slate-100">{suite.cases}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">通过</span><span className="text-emerald-600">{suite.passed}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">失败</span><span className="text-red-600">{suite.failed}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">覆盖率</span><span className="text-slate-900 dark:text-slate-100">{suite.coverage}</span></div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: suite.coverage }} />
                </div>
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Play className="w-4 h-4" /> 执行套件</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detailCase} onOpenChange={() => setDetailCase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Beaker className="w-5 h-5 text-indigo-500" />用例详情 - {detailCase?.name}</DialogTitle>
          </DialogHeader>
          {detailCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "用例ID", value: detailCase.id },
                  { label: "用例名称", value: detailCase.name },
                  { label: "合约", value: detailCase.contract },
                  { label: "类型", value: detailCase.type },
                  { label: "状态", value: detailCase.status },
                  { label: "耗时", value: detailCase.duration },
                  { label: "执行时间", value: detailCase.runTime },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-sm font-medium mb-2">执行结果</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{detailCase.result}</p>
              </div>
              {detailCase.status === "failed" && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-medium mb-1"><Bug className="w-4 h-4" />错误详情</div>
                  <code className="text-xs text-red-600 dark:text-red-300 block mt-1">Revert(0x08c379a0): AccessControl: account 0x1234... is missing role 0x01</code>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Play className="w-4 h-4" /> 重新执行</Button>
                <Button variant="outline" className="gap-2"><Terminal className="w-4 h-4" /> 查看日志</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
