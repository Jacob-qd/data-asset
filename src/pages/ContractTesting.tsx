import { useState } from "react";
import {
  Beaker, Plus, Search, Play, CheckCircle2, XCircle, Clock,
  ChevronRight, Terminal, FileCode, Bug, AlertTriangle, RotateCcw,
  Code, ListChecks, X, Eye, Pencil, Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
type TestCase = {
  id: string;
  name: string;
  contract: string;
  type: string;
  status: string;
  duration: string;
  runTime: string;
  result: string;
};

type TestSuite = {
  id: string;
  name: string;
  cases: number;
  passed: number;
  failed: number;
  coverage: string;
  lastRun: string;
};

/* ─── Mock Data ─── */
const initialTestCases: TestCase[] = [
  { id: "TC-001", name: "存证合约-正常存证", contract: "数据资产存证合约", type: "功能测试", status: "passed", duration: "0.23s", runTime: "2025-04-22 10:00:00", result: "交易成功上链，哈希匹配" },
  { id: "TC-002", name: "存证合约-重复存证", contract: "数据资产存证合约", type: "异常测试", status: "passed", duration: "0.18s", runTime: "2025-04-22 10:01:00", result: "正确拒绝重复存证请求" },
  { id: "TC-003", name: "授权合约-正常授权", contract: "数据授权合约", type: "功能测试", status: "passed", duration: "0.31s", runTime: "2025-04-22 10:02:00", result: "授权关系建立成功" },
  { id: "TC-004", name: "授权合约-越权访问", contract: "数据授权合约", type: "安全测试", status: "failed", duration: "0.15s", runTime: "2025-04-22 10:03:00", result: "越权检查未生效，需修复" },
  { id: "TC-005", name: "溯源合约-查询性能", contract: "数据溯源合约", type: "性能测试", status: "passed", duration: "1.25s", runTime: "2025-04-22 10:04:00", result: "1000条记录查询耗时1.25s" },
  { id: "TC-006", name: "溯源合约-跨链查询", contract: "数据溯源合约", type: "集成测试", status: "passed", duration: "2.56s", runTime: "2025-04-22 10:05:00", result: "跨链溯源查询成功" },
];

const initialTestSuites: TestSuite[] = [
  { id: "TS-001", name: "存证合约完整测试套件", cases: 12, passed: 11, failed: 1, coverage: "92%", lastRun: "2025-04-22" },
  { id: "TS-002", name: "授权合约完整测试套件", cases: 8, passed: 7, failed: 1, coverage: "88%", lastRun: "2025-04-22" },
  { id: "TS-003", name: "溯源合约完整测试套件", cases: 15, passed: 15, failed: 0, coverage: "95%", lastRun: "2025-04-22" },
];

/* ─── Fields ─── */
const testCaseFields: FieldConfig[] = [
  { key: "name", label: "用例名称", type: "text", required: true },
  { key: "contract", label: "合约", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "功能测试", value: "功能测试" },
    { label: "异常测试", value: "异常测试" },
    { label: "安全测试", value: "安全测试" },
    { label: "性能测试", value: "性能测试" },
    { label: "集成测试", value: "集成测试" },
  ]},
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "通过", value: "passed" },
    { label: "失败", value: "failed" },
    { label: "执行中", value: "running" },
  ]},
  { key: "duration", label: "耗时", type: "text", required: true },
  { key: "runTime", label: "执行时间", type: "text", required: true },
  { key: "result", label: "执行结果", type: "textarea", required: true },
];

const testSuiteFields: FieldConfig[] = [
  { key: "name", label: "套件名称", type: "text", required: true },
  { key: "cases", label: "用例数", type: "number", required: true },
  { key: "passed", label: "通过数", type: "number", required: true },
  { key: "failed", label: "失败数", type: "number", required: true },
  { key: "coverage", label: "覆盖率", type: "text", required: true, placeholder: "例如: 92%" },
  { key: "lastRun", label: "最近执行", type: "text", required: true },
];

const testCaseDetailFields = [
  { key: "id", label: "用例ID" },
  { key: "name", label: "用例名称" },
  { key: "contract", label: "合约" },
  { key: "type", label: "类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "duration", label: "耗时" },
  { key: "runTime", label: "执行时间", type: "date" as const },
  { key: "result", label: "执行结果" },
];

const testSuiteDetailFields = [
  { key: "id", label: "套件ID" },
  { key: "name", label: "套件名称" },
  { key: "cases", label: "用例数" },
  { key: "passed", label: "通过" },
  { key: "failed", label: "失败" },
  { key: "coverage", label: "覆盖率", type: "badge" as const },
  { key: "lastRun", label: "最近执行", type: "date" as const },
];

/* ─── Helpers ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    passed: { text: "通过", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    running: { text: "执行中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.running;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function generateCaseId(cases: TestCase[]): string {
  const maxNum = cases.reduce((max, tc) => {
    const match = tc.id.match(/TC-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `TC-${String(maxNum + 1).padStart(3, "0")}`;
}

function generateSuiteId(suites: TestSuite[]): string {
  const maxNum = suites.reduce((max, ts) => {
    const match = ts.id.match(/TS-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `TS-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Main ─── */
export default function ContractTesting() {
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [testSuites, setTestSuites] = useState<TestSuite[]>(initialTestSuites);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("cases");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogEntity, setDialogEntity] = useState<"case" | "suite">("case");

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCase, setDetailCase] = useState<TestCase | null>(null);
  const [detailSuite, setDetailSuite] = useState<TestSuite | null>(null);

  const filteredCases = testCases.filter(t => t.name.includes(search) || t.contract.includes(search));
  const filteredSuites = testSuites.filter(s => s.name.includes(search));
  const passedCount = testCases.filter(t => t.status === "passed").length;

  /* ─── Case handlers ─── */
  const handleCreateCase = () => {
    setDialogEntity("case");
    setDialogMode("create");
    setDialogData({
      name: "",
      contract: "",
      type: "功能测试",
      status: "passed",
      duration: "",
      runTime: new Date().toISOString().replace("T", " ").slice(0, 19),
      result: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditCase = (tc: TestCase) => {
    setDialogEntity("case");
    setDialogMode("edit");
    setDialogData({
      name: tc.name,
      contract: tc.contract,
      type: tc.type,
      status: tc.status,
      duration: tc.duration,
      runTime: tc.runTime,
      result: tc.result,
    });
    setEditingId(tc.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDeleteCase = (tc: TestCase) => {
    setDialogEntity("case");
    setDialogMode("delete");
    setEditingId(tc.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const openCaseDetail = (tc: TestCase) => {
    setDetailCase(tc);
    setDetailSuite(null);
    setDetailOpen(true);
  };

  /* ─── Suite handlers ─── */
  const handleCreateSuite = () => {
    setDialogEntity("suite");
    setDialogMode("create");
    setDialogData({
      name: "",
      cases: 0,
      passed: 0,
      failed: 0,
      coverage: "",
      lastRun: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditSuite = (ts: TestSuite) => {
    setDialogEntity("suite");
    setDialogMode("edit");
    setDialogData({
      name: ts.name,
      cases: ts.cases,
      passed: ts.passed,
      failed: ts.failed,
      coverage: ts.coverage,
      lastRun: ts.lastRun,
    });
    setEditingId(ts.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDeleteSuite = (ts: TestSuite) => {
    setDialogEntity("suite");
    setDialogMode("delete");
    setEditingId(ts.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const openSuiteDetail = (ts: TestSuite) => {
    setDetailSuite(ts);
    setDetailCase(null);
    setDetailOpen(true);
  };

  /* ─── Submit ─── */
  const handleSubmit = (data: Record<string, any>) => {
    if (dialogEntity === "case") {
      if (dialogMode === "create") {
        const id = generateCaseId(testCases);
        const newCase: TestCase = {
          id,
          name: data.name,
          contract: data.contract,
          type: data.type,
          status: data.status,
          duration: data.duration,
          runTime: data.runTime,
          result: data.result,
        };
        setTestCases((prev) => [...prev, newCase]);
      } else if (dialogMode === "edit" && editingId) {
        setTestCases((prev) =>
          prev.map((tc) =>
            tc.id === editingId
              ? {
                  ...tc,
                  name: data.name,
                  contract: data.contract,
                  type: data.type,
                  status: data.status,
                  duration: data.duration,
                  runTime: data.runTime,
                  result: data.result,
                }
              : tc
          )
        );
      }
    } else {
      if (dialogMode === "create") {
        const id = generateSuiteId(testSuites);
        const newSuite: TestSuite = {
          id,
          name: data.name,
          cases: Number(data.cases),
          passed: Number(data.passed),
          failed: Number(data.failed),
          coverage: data.coverage,
          lastRun: data.lastRun,
        };
        setTestSuites((prev) => [...prev, newSuite]);
      } else if (dialogMode === "edit" && editingId) {
        setTestSuites((prev) =>
          prev.map((ts) =>
            ts.id === editingId
              ? {
                  ...ts,
                  name: data.name,
                  cases: Number(data.cases),
                  passed: Number(data.passed),
                  failed: Number(data.failed),
                  coverage: data.coverage,
                  lastRun: data.lastRun,
                }
              : ts
          )
        );
      }
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      if (dialogEntity === "case") {
        setTestCases((prev) => prev.filter((tc) => tc.id !== editingId));
      } else {
        setTestSuites((prev) => prev.filter((ts) => ts.id !== editingId));
      }
    }
    setDialogOpen(false);
  };

  const detailData = detailCase
    ? { ...detailCase, status: detailCase.status === "passed" ? "通过" : detailCase.status === "failed" ? "失败" : "执行中" }
    : detailSuite
    ? { ...detailSuite }
    : {};

  const detailTitle = detailCase
    ? `用例详情 - ${detailCase.name}`
    : detailSuite
    ? `套件详情 - ${detailSuite.name}`
    : "详情";

  const dialogTitle = dialogMode === "delete"
    ? (dialogEntity === "case"
        ? `${testCases.find((c) => c.id === editingId)?.name || "测试用例"}`
        : `${testSuites.find((s) => s.id === editingId)?.name || "测试套件"}`)
    : (dialogEntity === "case" ? "测试用例" : "测试套件");

  const currentFields = dialogEntity === "case" ? testCaseFields : testSuiteFields;
  const currentDetailFields = detailCase ? testCaseDetailFields : testSuiteDetailFields;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约测试</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">智能合约自动化测试平台，支持功能/性能/安全/集成测试</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Play className="w-4 h-4" /> 执行测试
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "测试用例", value: testCases.length, icon: <ListChecks className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "通过", value: passedCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "失败", value: testCases.filter(t => t.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
          { label: "测试套件", value: testSuites.length, icon: <Beaker className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreateCase}>
              <Plus className="w-4 h-4" /> 新建用例
            </Button>
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
                {filteredCases.map(tc => (
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
                        <Button size="sm" variant="ghost" onClick={() => openCaseDetail(tc)}><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditCase(tc)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCase(tc)}><Trash className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="suites" className="pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索套件" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreateSuite}>
              <Plus className="w-4 h-4" /> 新建套件
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filteredSuites.map((suite) => (
              <div key={suite.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-[#1e293b]">
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
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Play className="w-4 h-4" /> 执行套件</Button>
                  <Button size="sm" variant="outline" onClick={() => openSuiteDetail(suite)}><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditSuite(suite)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteSuite(suite)}><Trash className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={detailTitle}
        data={detailData}
        fields={currentDetailFields}
        onEdit={
          detailCase
            ? () => handleEditCase(detailCase)
            : detailSuite
            ? () => handleEditSuite(detailSuite)
            : undefined
        }
        onDelete={
          detailCase
            ? () => handleDeleteCase(detailCase)
            : detailSuite
            ? () => handleDeleteSuite(detailSuite)
            : undefined
        }
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        fields={currentFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
