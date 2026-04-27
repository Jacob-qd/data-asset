import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronRight, Search, FileCode, Rocket, Beaker, ShoppingCart, GitBranch, Eye, CheckCircle2, XCircle,
  Clock, ArrowRight, RotateCw, Download, Tag, GitCommit, Users, Code, Terminal, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── 合约全生命周期数据 ─── */
const contracts = [
  {
    id: "SC-001",
    name: "数据资产存证合约",
    currentStage: "market",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-01-15", actor: "合约开发组", detail: "完成基础存证功能开发，支持单条/批量上链" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-01-20", actor: "QA团队", detail: "6个测试用例全部通过，覆盖率92%" },
      { stage: "deploy", name: "安装部署", status: "completed", time: "2025-02-01", actor: "运维组", detail: "部署到金融联盟链3个共识节点，部署成功" },
      { stage: "audit", name: "安全审计", status: "completed", time: "2025-02-10", actor: "安全审计组", detail: "通过第三方安全审计，无高危漏洞" },
      { stage: "market", name: "市场发布", status: "current", time: "2025-02-15", actor: "产品组", detail: "已上架智能合约市场，下载量12,560次" },
    ],
    versions: [
      { version: "v2.0.0", status: "current", deployTime: "2025-04-15", changes: "新增批量存证接口，优化gas消耗", audit: "已通过" },
      { version: "v1.2.0", status: "deprecated", deployTime: "2025-02-10", changes: "修复重入漏洞", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-08-01", changes: "初始版本", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-001", network: "金融联盟链", channel: "金融交易通道", status: "success", time: "2025-04-15" },
      { id: "DP-002", network: "政务数据链", channel: "政务数据共享通道", status: "success", time: "2025-03-20" },
    ],
    tests: [
      { id: "TC-001", name: "正常存证", status: "passed", time: "0.23s" },
      { id: "TC-002", name: "重复存证拒绝", status: "passed", time: "0.18s" },
      { id: "TC-003", name: "批量存证", status: "passed", time: "1.25s" },
    ],
  },
  {
    id: "SC-002",
    name: "数据授权合约",
    currentStage: "deploy",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-03-01", actor: "合约开发组", detail: "支持多级授权与期限管理" },
      { stage: "test", name: "合约测试", status: "completed", time: "2025-03-10", actor: "QA团队", detail: "8个测试用例，覆盖率88%" },
      { stage: "deploy", name: "安装部署", status: "current", time: "2025-03-20", actor: "运维组", detail: "部署到政务数据链，等待确认" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待安排审计时间" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待审计通过后上架" },
    ],
    versions: [
      { version: "v1.1.0", status: "current", deployTime: "2025-03-20", changes: "支持多级授权与委托", audit: "已通过" },
      { version: "v1.0.0", status: "deprecated", deployTime: "2024-09-15", changes: "基础授权功能", audit: "已通过" },
    ],
    deploys: [
      { id: "DP-003", network: "政务数据链", channel: "政务数据共享通道", status: "success", time: "2025-03-20" },
    ],
    tests: [
      { id: "TC-004", name: "正常授权", status: "passed", time: "0.31s" },
      { id: "TC-005", name: "越权访问", status: "failed", time: "0.15s" },
    ],
  },
  {
    id: "SC-003",
    name: "跨链资产桥合约",
    currentStage: "test",
    stages: [
      { stage: "dev", name: "合约开发", status: "completed", time: "2025-02-01", actor: "合约开发组", detail: "支持HTLC协议的跨链资产锁定与释放" },
      { stage: "test", name: "合约测试", status: "current", time: "2025-04-01", actor: "QA团队", detail: "集成测试中，跨链延迟偏高" },
      { stage: "deploy", name: "安装部署", status: "pending", time: "-", actor: "运维组", detail: "等待测试通过后部署" },
      { stage: "audit", name: "安全审计", status: "pending", time: "-", actor: "安全审计组", detail: "待部署完成后审计" },
      { stage: "market", name: "市场发布", status: "pending", time: "-", actor: "产品组", detail: "等待全部通过后上架" },
    ],
    versions: [
      { version: "v1.2.0", status: "current", deployTime: "2025-04-01", changes: "支持跨链溯源查询", audit: "已通过" },
    ],
    deploys: [],
    tests: [
      { id: "TC-006", name: "锁定释放", status: "passed", time: "2.56s" },
      { id: "TC-007", name: "超时回退", status: "running", time: "-" },
    ],
  },
];

const stageConfig: Record<string, { label: string; icon: typeof FileCode; color: string }> = {
  dev: { label: "开发", icon: Code, color: "bg-blue-500" },
  test: { label: "测试", icon: Beaker, color: "bg-amber-500" },
  deploy: { label: "部署", icon: Rocket, color: "bg-indigo-500" },
  audit: { label: "审计", icon: CheckCircle2, color: "bg-purple-500" },
  market: { label: "市场", icon: ShoppingCart, color: "bg-emerald-500" },
};

export default function ContractLifecycle() {
  const [search, setSearch] = useState("");
  const [detailContract, setDetailContract] = useState<typeof contracts[0] | null>(null);

  const filtered = contracts.filter((c) => c.name.includes(search) || c.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>区块链可信存证</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>合约生命周期</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">合约全生命周期视图</h1>
          <p className="text-sm text-gray-500 mt-1.5">追踪智能合约从开发→测试→部署→审计→市场的完整生命周期状态</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FileCode className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">合约总数</p><p className="text-2xl font-bold">{contracts.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Code className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">开发中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "dev").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Beaker className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">测试中</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "test").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Rocket className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">已部署</p><p className="text-2xl font-bold">{contracts.filter(c => ["deploy","audit","market"].includes(c.currentStage)).length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><ShoppingCart className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已上架</p><p className="text-2xl font-bold">{contracts.filter(c => c.currentStage === "market").length}</p></div></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="搜索合约名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-4">
        {filtered.map((contract) => (
          <Card key={contract.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="font-medium text-gray-900">{contract.name}</span>
                  <span className="ml-2 font-mono text-xs text-gray-500">{contract.id}</span>
                </div>
                <Badge variant="outline">{stageConfig[contract.currentStage].label}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => setDetailContract(contract)}><Eye className="w-4 h-4 mr-1" />详情</Button>
            </CardHeader>
            <CardContent className="p-5">
              {/* Lifecycle Pipeline */}
              <div className="flex items-center mb-5">
                {contract.stages.map((s, i, arr) => {
                  const cfg = stageConfig[s.stage];
                  const Icon = cfg.icon;
                  return (
                    <div key={s.stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white transition-all", s.status === "completed" ? cfg.color : s.status === "current" ? cfg.color + " animate-pulse" : "bg-gray-200 text-gray-400")}>
                          {s.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={cn("text-xs font-medium mt-1.5", s.status === "pending" ? "text-gray-400" : "text-gray-900")}>{s.name}</span>
                        <span className="text-[10px] text-gray-400">{s.time !== "-" ? s.time : "待定"}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex-1 h-0.5 mx-2 bg-gray-200 relative">
                          <div className={cn("absolute top-0 left-0 h-full transition-all", s.status === "completed" ? "bg-emerald-500 w-full" : "w-0")} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current stage detail */}
              {contract.stages.find(s => s.status === "current") && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-700">当前阶段</span>
                    <span className="text-xs text-gray-600">{contract.stages.find(s => s.status === "current")?.detail}</span>
                  </div>
                  <div className="text-xs text-gray-500">负责人: {contract.stages.find(s => s.status === "current")?.actor}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailContract} onOpenChange={() => setDetailContract(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileCode className="w-5 h-5 text-indigo-500" />{detailContract?.name}</DialogTitle>
          </DialogHeader>
          {detailContract && (
            <Tabs defaultValue="versions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="versions"><GitBranch className="w-4 h-4 mr-1" />版本历史</TabsTrigger>
                <TabsTrigger value="deploys"><Rocket className="w-4 h-4 mr-1" />部署记录</TabsTrigger>
                <TabsTrigger value="tests"><Beaker className="w-4 h-4 mr-1" />测试报告</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="mt-4 space-y-2">
                {detailContract.versions.map((v, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-sm">{v.version}</span>
                      <Badge className={v.status === "current" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}>{v.status === "current" ? "当前" : "已废弃"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{v.deployTime}</span>
                      <span>{v.changes}</span>
                      <Badge variant="secondary">{v.audit}</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="deploys" className="mt-4 space-y-2">
                {detailContract.deploys.length > 0 ? detailContract.deploys.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-indigo-500" />
                      <span className="font-mono text-xs">{d.id}</span>
                      <span className="text-sm">{d.network}</span>
                      <Badge variant="outline">{d.channel}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <Badge className="bg-emerald-50 text-emerald-700">{d.status === "success" ? "成功" : "失败"}</Badge>
                      <span>{d.time}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-8">暂无部署记录</p>
                )}
              </TabsContent>

              <TabsContent value="tests" className="mt-4 space-y-2">
                {detailContract.tests.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      {t.status === "passed" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : t.status === "failed" ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-blue-500" />}
                      <span className="text-sm">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={t.status === "passed" ? "bg-emerald-50 text-emerald-700" : t.status === "failed" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}>{t.status === "passed" ? "通过" : t.status === "failed" ? "失败" : "进行中"}</Badge>
                      <span className="text-xs text-gray-500">{t.time}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
