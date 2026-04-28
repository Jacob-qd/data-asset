import { useState, useRef, useEffect, useCallback } from "react";
import {
  Beaker, Plus, Search, Play, CheckCircle2, XCircle, Clock,
  ChevronRight, Terminal, FileCode, Bug, AlertTriangle, RotateCcw,
  Code, ListChecks, X, Eye, Pencil, Trash, BarChart3, FileText,
  Download, Flame, GitBranch, Cpu, Activity, GitCommit, Wifi,
  Pause, Loader2, Database, Users, Globe, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import * as echarts from "echarts";

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
  gasUsed?: number;
  events?: string[];
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

type TestExecution = {
  id: string;
  caseId: string;
  status: "running" | "passed" | "failed";
  startTime: string;
  endTime?: string;
  gasUsed: number;
  events: string[];
  logs: string[];
};

type MockAccount = {
  id: string;
  address: string;
  balance: string;
  label: string;
};

type MockState = {
  blockHeight: number;
  timestamp: number;
  chainId: string;
};

type CIPipeline = {
  id: string;
  name: string;
  status: "idle" | "running" | "success" | "failed";
  lastTrigger: string;
  branch: string;
  commit: string;
};

/* ─── Helpers ─── */
function generateId() {
  return Date.now().toString(36).toUpperCase();
}

/* ─── Mock Data ─── */
const initialTestCases: TestCase[] = [
  { id: "TC-001", name: "存证合约-正常存证", contract: "数据资产存证合约", type: "功能测试", status: "passed", duration: "0.23s", runTime: "2025-04-22 10:00:00", result: "交易成功上链，哈希匹配", gasUsed: 42000, events: ["AttestationCreated", "HashVerified"] },
  { id: "TC-002", name: "存证合约-重复存证", contract: "数据资产存证合约", type: "异常测试", status: "passed", duration: "0.18s", runTime: "2025-04-22 10:01:00", result: "正确拒绝重复存证请求", gasUsed: 21000, events: ["AttestationRejected"] },
  { id: "TC-003", name: "授权合约-正常授权", contract: "数据授权合约", type: "功能测试", status: "passed", duration: "0.31s", runTime: "2025-04-22 10:02:00", result: "授权关系建立成功", gasUsed: 55000, events: ["AuthorizationGranted", "PermissionSet"] },
  { id: "TC-004", name: "授权合约-越权访问", contract: "数据授权合约", type: "安全测试", status: "failed", duration: "0.15s", runTime: "2025-04-22 10:03:00", result: "越权检查未生效，需修复", gasUsed: 18000, events: ["UnauthorizedAccess"] },
  { id: "TC-005", name: "溯源合约-查询性能", contract: "数据溯源合约", type: "性能测试", status: "passed", duration: "1.25s", runTime: "2025-04-22 10:04:00", result: "1000条记录查询耗时1.25s", gasUsed: 120000, events: ["TraceQueryCompleted"] },
  { id: "TC-006", name: "溯源合约-跨链查询", contract: "数据溯源合约", type: "集成测试", status: "passed", duration: "2.56s", runTime: "2025-04-22 10:05:00", result: "跨链溯源查询成功", gasUsed: 230000, events: ["CrossChainTrace", "BridgeValidated"] },
];

const initialTestSuites: TestSuite[] = [
  { id: "TS-001", name: "存证合约完整测试套件", cases: 12, passed: 11, failed: 1, coverage: "92%", lastRun: "2025-04-22" },
  { id: "TS-002", name: "授权合约完整测试套件", cases: 8, passed: 7, failed: 1, coverage: "88%", lastRun: "2025-04-22" },
  { id: "TS-003", name: "溯源合约完整测试套件", cases: 15, passed: 15, failed: 0, coverage: "95%", lastRun: "2025-04-22" },
];

const initialMockAccounts: MockAccount[] = [
  { id: generateId(), address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", balance: "1000 ETH", label: "管理员" },
  { id: generateId(), address: "0x8ba1f109551bD432803012645Hac136c8", balance: "500 ETH", label: "测试用户A" },
  { id: generateId(), address: "0xdAC17F958D2ee523a2206206994597C13D", balance: "200 ETH", label: "测试用户B" },
];

const initialMockState: MockState = {
  blockHeight: 1234567,
  timestamp: Date.now(),
  chainId: "0x539",
};

const initialPipelines: CIPipeline[] = [
  { id: "CI-001", name: "合约测试流水线", status: "success", lastTrigger: "2025-04-22 10:00:00", branch: "main", commit: "a1b2c3d" },
  { id: "CI-002", name: "安全审计流水线", status: "running", lastTrigger: "2025-04-22 11:30:00", branch: "feature/auth", commit: "e4f5g6h" },
  { id: "CI-003", name: "性能基准流水线", status: "failed", lastTrigger: "2025-04-22 09:15:00", branch: "develop", commit: "i7j8k9l" },
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
    idle: { text: "空闲", class: "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
    success: { text: "成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
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

/* ─── Test Execution Engine ─── */
function TestExecutionEngine({
  testCases,
  testSuites,
  onUpdateCase,
  onUpdateSuite,
}: {
  testCases: TestCase[];
  testSuites: TestSuite[];
  onUpdateCase: (id: string, data: Partial<TestCase>) => void;
  onUpdateSuite: (id: string, data: Partial<TestSuite>) => void;
}) {
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [runningSuiteId, setRunningSuiteId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedExec, setSelectedExec] = useState<TestExecution | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const runCase = async (tc: TestCase) => {
    setRunningCaseId(tc.id);
    setProgress(0);
    setLogs([]);
    const execId = generateId();

    const exec: TestExecution = {
      id: execId,
      caseId: tc.id,
      status: "running",
      startTime: new Date().toISOString(),
      gasUsed: 0,
      events: [],
      logs: [],
    };
    setExecutions((prev) => [exec, ...prev]);
    onUpdateCase(tc.id, { status: "running" });

    const steps = [
      () => addLog(`开始执行测试用例: ${tc.name}`),
      () => addLog(`加载合约: ${tc.contract}`),
      () => addLog("部署测试环境..."),
      () => addLog("执行交易调用..."),
      () => addLog("验证返回结果..."),
      () => addLog("清理测试环境..."),
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
      steps[i]();
      setProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    const passed = Math.random() > 0.2;
    const gasUsed = tc.gasUsed || Math.floor(20000 + Math.random() * 100000);
    const events = tc.events || ["TestEvent"];

    setExecutions((prev) =>
      prev.map((e) =>
        e.id === execId
          ? { ...e, status: passed ? "passed" : "failed", endTime: new Date().toISOString(), gasUsed, events, logs }
          : e
      )
    );
    onUpdateCase(tc.id, {
      status: passed ? "passed" : "failed",
      duration: `${(0.1 + Math.random() * 2).toFixed(2)}s`,
      runTime: new Date().toISOString().replace("T", " ").slice(0, 19),
      gasUsed,
      events,
    });
    addLog(`测试用例执行${passed ? "通过" : "失败"}，Gas消耗: ${gasUsed}`);
    setRunningCaseId(null);
    setProgress(0);
  };

  const runSuite = async (suite: TestSuite) => {
    setRunningSuiteId(suite.id);
    setProgress(0);
    setLogs([]);
    addLog(`开始执行测试套件: ${suite.name}`);

    const total = suite.cases;
    const suiteCases = testCases.filter((c) => c.contract.includes(suite.name.replace("完整测试套件", "")));

    for (let i = 0; i < total; i++) {
      const tc = suiteCases[i] || testCases[i % testCases.length];
      addLog(`[${i + 1}/${total}] 执行: ${tc.name}`);
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    const passed = Math.floor(total * (0.7 + Math.random() * 0.3));
    const failed = total - passed;
    addLog(`套件执行完成: 通过 ${passed}, 失败 ${failed}`);

    onUpdateSuite(suite.id, { passed, failed, lastRun: new Date().toISOString().split("T")[0] });
    setRunningSuiteId(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-500" />
              执行单条用例
            </CardTitle>
            <CardDescription className="text-xs">选择测试用例并执行</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {testCases.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="text-xs">{tc.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={runningCaseId === tc.id}
                    onClick={() => runCase(tc)}
                    className="gap-1 text-xs"
                  >
                    {runningCaseId === tc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    执行
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-500" />
              执行测试套件
            </CardTitle>
            <CardDescription className="text-xs">运行完整测试套件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {testSuites.map((suite) => (
                <div key={suite.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="text-xs">{suite.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={runningSuiteId === suite.id}
                    onClick={() => runSuite(suite)}
                    className="gap-1 text-xs"
                  >
                    {runningSuiteId === suite.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    执行套件
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Logs */}
      {(runningCaseId || runningSuiteId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              执行进度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500">{progress}% 完成</p>
            <div
              ref={logRef}
              className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono h-40 overflow-y-auto space-y-1"
            >
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">执行历史</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>执行ID</TableHead>
                <TableHead>用例ID</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>Gas消耗</TableHead>
                <TableHead>事件</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="font-mono text-xs">{ex.id.slice(0, 8)}</TableCell>
                  <TableCell>{ex.caseId}</TableCell>
                  <TableCell><StatusBadge status={ex.status} /></TableCell>
                  <TableCell>{ex.gasUsed.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ex.events.map((ev, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{ev}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedExec(ex)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Execution Detail Dialog */}
      <Dialog open={!!selectedExec} onOpenChange={() => setSelectedExec(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>执行详情</DialogTitle>
          </DialogHeader>
          {selectedExec && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <p className="text-[10px] text-slate-500">状态</p>
                  <p className="text-sm font-medium"><StatusBadge status={selectedExec.status} /></p>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <p className="text-[10px] text-slate-500">Gas消耗</p>
                  <p className="text-sm font-medium">{selectedExec.gasUsed.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">事件</p>
                <div className="flex flex-wrap gap-1">
                  {selectedExec.events.map((ev, i) => (
                    <Badge key={i} variant="outline">{ev}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">日志</p>
                <div className="p-2 rounded bg-slate-900 text-slate-100 text-xs font-mono max-h-[150px] overflow-y-auto">
                  {selectedExec.logs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Test Report Generation ─── */
function TestReportPanel({ testCases, testSuites }: { testCases: TestCase[]; testSuites: TestSuite[] }) {
  const [reportOpen, setReportOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const totalCases = testCases.length;
  const passedCases = testCases.filter((t) => t.status === "passed").length;
  const failedCases = testCases.filter((t) => t.status === "failed").length;
  const passRate = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
  const avgGas = testCases.reduce((sum, t) => sum + (t.gasUsed || 0), 0) / (totalCases || 1);

  const exportHTML = () => {
    if (!reportRef.current) return;
    const html = `
<html><head><title>测试报告</title></head><body>
${reportRef.current.innerHTML}
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" />
          测试报告
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setReportOpen(true)} className="gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            预览报告
          </Button>
          <Button size="sm" variant="outline" onClick={exportHTML} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            导出HTML
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "通过率", value: `${passRate}%`, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
          { label: "失败数", value: failedCases, icon: <XCircle className="w-4 h-4 text-red-500" /> },
          { label: "平均Gas", value: Math.round(avgGas).toLocaleString(), icon: <Flame className="w-4 h-4 text-orange-500" /> },
          { label: "套件数", value: testSuites.length, icon: <ListChecks className="w-4 h-4 text-indigo-500" /> },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{s.label}</span>
                {s.icon}
              </div>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">失败详情</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用例ID</TableHead>
                <TableHead>用例名称</TableHead>
                <TableHead>合约</TableHead>
                <TableHead>结果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.filter((t) => t.status === "failed").map((tc) => (
                <TableRow key={tc.id}>
                  <TableCell className="font-mono text-xs">{tc.id}</TableCell>
                  <TableCell>{tc.name}</TableCell>
                  <TableCell>{tc.contract}</TableCell>
                  <TableCell className="text-red-600">{tc.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>测试报告预览</DialogTitle>
          </DialogHeader>
          <div ref={reportRef} className="space-y-6 py-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">智能合约测试报告</h2>
              <p className="text-sm text-slate-500">生成时间: {new Date().toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "总用例数", value: totalCases },
                { label: "通过率", value: `${passRate}%` },
                { label: "失败数", value: failedCases },
                { label: "平均Gas", value: Math.round(avgGas).toLocaleString() },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Gas分析</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用例</TableHead>
                    <TableHead>Gas消耗</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((tc) => (
                    <TableRow key={tc.id}>
                      <TableCell>{tc.name}</TableCell>
                      <TableCell>{(tc.gasUsed || 0).toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={tc.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">覆盖率</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>套件</TableHead>
                    <TableHead>覆盖率</TableHead>
                    <TableHead>通过/失败</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testSuites.map((ts) => (
                    <TableRow key={ts.id}>
                      <TableCell>{ts.name}</TableCell>
                      <TableCell>{ts.coverage}</TableCell>
                      <TableCell>{ts.passed}/{ts.failed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>关闭</Button>
            <Button onClick={exportHTML}>导出HTML</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Coverage Visualization ─── */
function CoverageVisualization({ testSuites }: { testSuites: TestSuite[] }) {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const trendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heatmapRef.current || !trendRef.current) return;

    const heatmapChart = echarts.init(heatmapRef.current);
    const trendChart = echarts.init(trendRef.current);

    const coverageData = testSuites.map((s) => ({
      name: s.name,
      function: parseInt(s.coverage),
      branch: Math.max(0, parseInt(s.coverage) - 5),
      line: Math.max(0, parseInt(s.coverage) - 2),
    }));

    const heatmapOption: echarts.EChartsOption = {
      title: { text: "代码覆盖率热力图", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["函数覆盖率", "分支覆盖率", "行覆盖率"] },
      yAxis: { type: "category", data: coverageData.map((d) => d.name) },
      visualMap: { min: 0, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 0, inRange: { color: ["#fee2e2", "#86efac", "#22c55e"] } },
      series: [
        {
          type: "heatmap",
          data: coverageData.flatMap((d, i) => [
            [0, i, d.function],
            [1, i, d.branch],
            [2, i, d.line],
          ]),
          label: { show: true, formatter: (params: any) => `${params.value[2]}%` },
        },
      ],
    };

    const trendOption: echarts.EChartsOption = {
      title: { text: "覆盖率趋势", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["4-18", "4-19", "4-20", "4-21", "4-22"] },
      yAxis: { type: "value", name: "覆盖率(%)", max: 100 },
      series: [
        {
          name: "平均覆盖率",
          type: "line",
          data: [82, 85, 88, 90, parseInt(testSuites[0]?.coverage || "0")],
          smooth: true,
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(59,130,246,0.3)" }, { offset: 1, color: "rgba(59,130,246,0.05)" }]) },
          lineStyle: { color: "#3b82f6" },
          itemStyle: { color: "#3b82f6" },
        },
      ],
    };

    heatmapChart.setOption(heatmapOption);
    trendChart.setOption(trendOption);

    return () => {
      heatmapChart.dispose();
      trendChart.dispose();
    };
  }, [testSuites]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          覆盖率可视化
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div ref={heatmapRef} className="w-full h-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]" />
        <div ref={trendRef} className="w-full h-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">覆盖率详情</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>测试套件</TableHead>
                <TableHead>函数覆盖率</TableHead>
                <TableHead>分支覆盖率</TableHead>
                <TableHead>行覆盖率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testSuites.map((ts) => {
                const base = parseInt(ts.coverage);
                return (
                  <TableRow key={ts.id}>
                    <TableCell>{ts.name}</TableCell>
                    <TableCell>{base}%</TableCell>
                    <TableCell>{Math.max(0, base - 5)}%</TableCell>
                    <TableCell>{Math.max(0, base - 2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Mock Data Management ─── */
function MockDataPanel() {
  const [accounts, setAccounts] = useState<MockAccount[]>(initialMockAccounts);
  const [mockState, setMockState] = useState<MockState>(initialMockState);
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ address: "", balance: "", label: "" });

  const handleAddAccount = () => {
    if (!newAccount.address) return;
    setAccounts((prev) => [
      ...prev,
      { id: generateId(), address: newAccount.address, balance: newAccount.balance || "0 ETH", label: newAccount.label || "未命名" },
    ]);
    setNewAccount({ address: "", balance: "", label: "" });
    setNewAccountOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-blue-600" />
          Mock数据管理
        </h3>
        <Button size="sm" onClick={() => setNewAccountOpen(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          新建Mock账户
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mock账户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono">{acc.address}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{acc.balance}</Badge>
                      <Badge variant="outline" className="text-[10px]">{acc.label}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteAccount(acc.id)}>
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Mock区块链状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">区块高度</label>
              <Input
                type="number"
                value={mockState.blockHeight}
                onChange={(e) => setMockState((prev) => ({ ...prev, blockHeight: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">时间戳</label>
              <Input
                type="number"
                value={mockState.timestamp}
                onChange={(e) => setMockState((prev) => ({ ...prev, timestamp: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Chain ID</label>
              <Input
                value={mockState.chainId}
                onChange={(e) => setMockState((prev) => ({ ...prev, chainId: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Account Dialog */}
      <Dialog open={newAccountOpen} onOpenChange={setNewAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建Mock账户</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">地址</label>
              <Input value={newAccount.address} onChange={(e) => setNewAccount((p) => ({ ...p, address: e.target.value }))} placeholder="0x..." />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">余额</label>
              <Input value={newAccount.balance} onChange={(e) => setNewAccount((p) => ({ ...p, balance: e.target.value }))} placeholder="例如: 100 ETH" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">标签</label>
              <Input value={newAccount.label} onChange={(e) => setNewAccount((p) => ({ ...p, label: e.target.value }))} placeholder="账户标签" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAccountOpen(false)}>取消</Button>
            <Button onClick={handleAddAccount}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── CI/CD Integration ─── */
function CICDIntegration() {
  const [pipelines, setPipelines] = useState<CIPipeline[]>(initialPipelines);
  const [connectOpen, setConnectOpen] = useState(false);
  const [newPipeline, setNewPipeline] = useState({ name: "", branch: "main" });
  const ciChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ciChartRef.current) return;
    const chart = echarts.init(ciChartRef.current);
    const option: echarts.EChartsOption = {
      title: { text: "CI执行状态分布", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: [
            { value: pipelines.filter((p) => p.status === "success").length, name: "成功", itemStyle: { color: "#22c55e" } },
            { value: pipelines.filter((p) => p.status === "failed").length, name: "失败", itemStyle: { color: "#ef4444" } },
            { value: pipelines.filter((p) => p.status === "running").length, name: "运行中", itemStyle: { color: "#3b82f6" } },
            { value: pipelines.filter((p) => p.status === "idle").length, name: "空闲", itemStyle: { color: "#94a3b8" } },
          ],
        },
      ],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [pipelines]);

  const handleConnect = () => {
    if (!newPipeline.name) return;
    const pipeline: CIPipeline = {
      id: generateId(),
      name: newPipeline.name,
      status: "idle",
      lastTrigger: "-",
      branch: newPipeline.branch,
      commit: "-",
    };
    setPipelines((prev) => [...prev, pipeline]);
    setNewPipeline({ name: "", branch: "main" });
    setConnectOpen(false);
  };

  const triggerPipeline = (id: string) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "running", lastTrigger: new Date().toISOString().replace("T", " ").slice(0, 19) }
          : p
      )
    );
    setTimeout(() => {
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: Math.random() > 0.3 ? "success" : "failed", commit: Math.random().toString(36).slice(2, 8) }
            : p
        )
      );
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-blue-600" />
          CI/CD集成
        </h3>
        <Button size="sm" onClick={() => setConnectOpen(true)} className="gap-1.5">
          <Wifi className="w-3.5 h-3.5" />
          连接流水线
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">流水线总数</span>
              <GitBranch className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{pipelines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">运行中</span>
              <Loader2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{pipelines.filter((p) => p.status === "running").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">成功率</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {pipelines.length > 0
                ? Math.round((pipelines.filter((p) => p.status === "success").length / pipelines.length) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">流水线列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>分支</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最近触发</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        <GitCommit className="w-3 h-3 mr-1" />
                        {p.branch}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-xs text-slate-500">{p.lastTrigger}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" disabled={p.status === "running"} onClick={() => triggerPipeline(p.id)}>
                        <Play className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div ref={ciChartRef} className="w-full h-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]" />
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>连接CI流水线</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">流水线名称</label>
              <Input value={newPipeline.name} onChange={(e) => setNewPipeline((p) => ({ ...p, name: e.target.value }))} placeholder="例如: 合约测试流水线" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">默认分支</label>
              <Input value={newPipeline.branch} onChange={(e) => setNewPipeline((p) => ({ ...p, branch: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>取消</Button>
            <Button onClick={handleConnect}>连接</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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

  const filteredCases = testCases.filter((t) => t.name.includes(search) || t.contract.includes(search));
  const filteredSuites = testSuites.filter((s) => s.name.includes(search));
  const passedCount = testCases.filter((t) => t.status === "passed").length;

  const handleUpdateCase = (id: string, data: Partial<TestCase>) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, ...data } : tc)));
  };

  const handleUpdateSuite = (id: string, data: Partial<TestSuite>) => {
    setTestSuites((prev) => prev.map((ts) => (ts.id === id ? { ...ts, ...data } : ts)));
  };

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
          { label: "失败", value: testCases.filter((t) => t.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
          { label: "测试套件", value: testSuites.length, icon: <Beaker className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-7">
          <TabsTrigger value="cases">测试用例</TabsTrigger>
          <TabsTrigger value="suites">测试套件</TabsTrigger>
          <TabsTrigger value="execution">执行引擎</TabsTrigger>
          <TabsTrigger value="reports">测试报告</TabsTrigger>
          <TabsTrigger value="coverage">覆盖率</TabsTrigger>
          <TabsTrigger value="mock">Mock数据</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="搜索用例/合约" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreateCase}>
              <Plus className="w-4 h-4" /> 新建用例
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#273548]">
                <tr>
                  {["用例ID", "用例名称", "合约", "类型", "状态", "耗时", "执行时间", "操作"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((tc) => (
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
              <Input placeholder="搜索套件" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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

        <TabsContent value="execution" className="pt-4">
          <TestExecutionEngine
            testCases={testCases}
            testSuites={testSuites}
            onUpdateCase={handleUpdateCase}
            onUpdateSuite={handleUpdateSuite}
          />
        </TabsContent>

        <TabsContent value="reports" className="pt-4">
          <TestReportPanel testCases={testCases} testSuites={testSuites} />
        </TabsContent>

        <TabsContent value="coverage" className="pt-4">
          <CoverageVisualization testSuites={testSuites} />
        </TabsContent>

        <TabsContent value="mock" className="pt-4">
          <MockDataPanel />
        </TabsContent>

        <TabsContent value="cicd" className="pt-4">
          <CICDIntegration />
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
