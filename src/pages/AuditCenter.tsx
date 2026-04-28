import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  Search,
  Shield,
  Clock,
  Eye,
  FileCode,
  Database,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  Server,
  Cpu,
  Layers,
  Globe,
  Activity,
  Filter,
  FileText,
  HardDrive,
  Lock,
  Play,
  RotateCw,
  Trash2,
  GitBranch,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  FileSearch,
  Calendar,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type AuditLevel = "正常" | "警告" | "异常";

type AuditRecord = {
  id: string;
  source: string;
  time: string;
  user: string;
  action: string;
  target: string;
  result: string;
  level: AuditLevel;
  ip: string;
  detail: string;
};

type TraceStep = {
  module: string;
  operation: string;
  time: string;
  status: string;
  hash: string;
  user: string;
};

type TraceData = {
  dataId: string;
  dataName: string;
  steps: TraceStep[];
};

type NotarizationRecord = {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  moduleSource: string;
  operationType: string;
  dataHash: string;
  status: string;
};

/* ─── Mock Data ─── */
const allAudits: AuditRecord[] = [
  // 平台审计
  { id: "AUD-001", source: "平台", time: "2026-04-27 14:30:00", user: "张三", action: "创建项目", target: "金融风控联合建模", result: "成功", level: "正常", ip: "192.168.1.100", detail: "创建隐私计算项目，包含3个参与方" },
  { id: "AUD-002", source: "平台", time: "2026-04-27 14:25:00", user: "李四", action: "审批通过", target: "资源申请-客户画像", result: "成功", level: "正常", ip: "192.168.1.101", detail: "审批通过GPU资源申请，配额8卡" },
  { id: "AUD-013", source: "平台", time: "2026-04-27 09:15:00", user: "管理员", action: "用户授权", target: "角色-数据分析师", result: "成功", level: "正常", ip: "192.168.1.105", detail: "为新入职数据分析师分配权限组" },
  // 沙箱审计
  { id: "AUD-003", source: "沙箱", time: "2026-04-27 14:20:00", user: "王五", action: "数据访问", target: "ods_user_info", result: "成功", level: "正常", ip: "192.168.1.102", detail: "SELECT * FROM ods_user_info LIMIT 1000" },
  { id: "AUD-004", source: "沙箱", time: "2026-04-27 14:15:00", user: "赵六", action: "脚本执行", target: "feature_engineer.py", result: "成功", level: "正常", ip: "192.168.1.103", detail: "执行特征工程脚本，处理568,920行数据" },
  { id: "AUD-005", source: "沙箱", time: "2026-04-27 14:10:00", user: "钱七", action: "数据导出", target: "dwd_order_detail", result: "成功", level: "警告", ip: "192.168.1.104", detail: "导出处理结果 245MB CSV文件" },
  { id: "AUD-014", source: "沙箱", time: "2026-04-27 11:30:00", user: "王五", action: "模型训练", target: "xgboost_v3", result: "成功", level: "正常", ip: "192.168.1.102", detail: "训练XGBoost模型，AUC达到0.89" },
  // 隐私计算审计
  { id: "AUD-006", source: "隐私计算", time: "2026-04-27 14:05:00", user: "张三", action: "启动PSI任务", target: "客户ID比对", result: "成功", level: "正常", ip: "192.168.1.100", detail: "启动隐私求交任务，参与方：A银行+B保险" },
  { id: "AUD-007", source: "隐私计算", time: "2026-04-27 14:00:00", user: "李四", action: "模型发布", target: "scorecard_v2", result: "成功", level: "正常", ip: "192.168.1.101", detail: "发布评分卡模型到模型市场，版本v2.0.0" },
  { id: "AUD-008", source: "隐私计算", time: "2026-04-27 13:55:00", user: "王五", action: "联邦训练", target: "LR-Credit-2026Q1", result: "失败", level: "异常", ip: "192.168.1.102", detail: "联邦训练因参与方C超时断开而失败" },
  { id: "AUD-015", source: "隐私计算", time: "2026-04-27 10:00:00", user: "李四", action: "安全聚合", target: "梯度聚合轮次#5", result: "成功", level: "正常", ip: "192.168.1.101", detail: "完成联邦学习第5轮梯度安全聚合" },
  // 系统审计
  { id: "AUD-009", source: "系统", time: "2026-04-27 13:50:00", user: "系统", action: "自动备份", target: "区块链节点数据", result: "成功", level: "正常", ip: "127.0.0.1", detail: "完成全量备份，耗时45分钟，大小12.5GB" },
  { id: "AUD-010", source: "系统", time: "2026-04-27 13:45:00", user: "系统", action: "安全扫描", target: "全平台", result: "成功", level: "警告", ip: "127.0.0.1", detail: "发现3个中危漏洞，已生成修复建议" },
  { id: "AUD-016", source: "系统", time: "2026-04-27 08:00:00", user: "系统", action: "日志归档", target: "审计日志", result: "成功", level: "正常", ip: "127.0.0.1", detail: "归档2026年Q1审计日志至冷存储" },
  // 任务审计
  { id: "AUD-011", source: "任务", time: "2026-04-27 13:40:00", user: "张三", action: "任务重跑", target: "TSK-20260427001", result: "成功", level: "正常", ip: "192.168.1.100", detail: "抽样任务失败后手动重跑，现已成功" },
  { id: "AUD-012", source: "任务", time: "2026-04-27 13:35:00", user: "李四", action: "任务删除", target: "TSK-20260423005", result: "成功", level: "正常", ip: "192.168.1.101", detail: "删除过期任务，释放存储空间" },
  { id: "AUD-017", source: "任务", time: "2026-04-27 12:00:00", user: "系统", action: "任务调度", target: "TSK-20260427010", result: "成功", level: "正常", ip: "127.0.0.1", detail: "定时触发每日数据质量检测任务" },
  // 抽样管理审计
  { id: "AUD-018", source: "抽样管理", time: "2026-04-27 10:00:00", user: "张三", action: "创建抽样任务", target: "客户信用评估", result: "成功", level: "正常", ip: "192.168.1.100", detail: "创建分层抽样任务，样本量10,000" },
  { id: "AUD-019", source: "抽样管理", time: "2026-04-27 10:15:00", user: "系统", action: "执行抽样", target: "客户信用评估", result: "成功", level: "正常", ip: "127.0.0.1", detail: "自动执行抽样，生成训练集/测试集" },
  // 区块链审计
  { id: "AUD-020", source: "区块链", time: "2026-04-27 15:05:00", user: "系统", action: "上链存证", target: "联邦任务结果", result: "成功", level: "正常", ip: "127.0.0.1", detail: "将隐私计算任务结果哈希上链，区块高度#128471" },
];

const traceExample: TraceData = {
  dataId: "TRACE-2024-001",
  dataName: "客户信用评估数据集",
  steps: [
    { module: "抽样管理", operation: "创建抽样任务", time: "2026-04-24 10:00", status: "已完成", hash: "0xabc123...", user: "张三" },
    { module: "抽样管理", operation: "执行抽样", time: "2026-04-24 10:15", status: "已完成", hash: "0xdef456...", user: "系统" },
    { module: "沙箱", operation: "接收样本数据", time: "2026-04-24 10:20", status: "已完成", hash: "0xghi789...", user: "系统" },
    { module: "沙箱", operation: "数据加工", time: "2026-04-24 11:00", status: "已完成", hash: "0xjkl012...", user: "李四" },
    { module: "沙箱", operation: "模型训练", time: "2026-04-24 14:00", status: "已完成", hash: "0xmno345...", user: "李四" },
    { module: "隐私计算", operation: "发布联邦任务", time: "2026-04-24 15:00", status: "已完成", hash: "0xpqr678...", user: "王五" },
    { module: "区块链", operation: "上链存证", time: "2026-04-24 15:05", status: "已确认", hash: "0xstu901...", user: "系统" },
  ],
};

const notarizationRecords: NotarizationRecord[] = [
  { id: "NOT-001", txHash: "0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", blockNumber: 128471, timestamp: "2026-04-27 15:05:00", moduleSource: "隐私计算", operationType: "联邦任务结果存证", dataHash: "0xstu901...", status: "已确认" },
  { id: "NOT-002", txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2", blockNumber: 128470, timestamp: "2026-04-27 15:00:00", moduleSource: "沙箱", operationType: "模型训练存证", dataHash: "0xmno345...", status: "已确认" },
  { id: "NOT-003", txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3", blockNumber: 128465, timestamp: "2026-04-27 14:30:00", moduleSource: "平台", operationType: "项目创建存证", dataHash: "0xabc111...", status: "已确认" },
  { id: "NOT-004", txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4", blockNumber: 128460, timestamp: "2026-04-27 14:00:00", moduleSource: "抽样管理", operationType: "抽样结果存证", dataHash: "0xdef222...", status: "已确认" },
  { id: "NOT-005", txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5", blockNumber: 128455, timestamp: "2026-04-27 13:30:00", moduleSource: "系统", operationType: "安全扫描存证", dataHash: "0xghi333...", status: "已确认" },
  { id: "NOT-006", txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6", blockNumber: 128450, timestamp: "2026-04-27 13:00:00", moduleSource: "任务", operationType: "任务执行存证", dataHash: "0xjkl444...", status: "已确认" },
  { id: "NOT-007", txHash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7", blockNumber: 128445, timestamp: "2026-04-27 12:30:00", moduleSource: "隐私计算", operationType: "PSI结果存证", dataHash: "0xpqr555...", status: "已确认" },
  { id: "NOT-008", txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8", blockNumber: 128440, timestamp: "2026-04-27 12:00:00", moduleSource: "沙箱", operationType: "数据导出存证", dataHash: "0xstu666...", status: "已确认" },
];

const sourceIcon: Record<string, React.ElementType> = {
  "平台": Server,
  "沙箱": Database,
  "隐私计算": Lock,
  "系统": Cpu,
  "任务": Play,
  "抽样管理": Layers,
  "区块链": LinkIcon,
};

const sourceColor: Record<string, string> = {
  "平台": "bg-blue-50 text-blue-700 border-blue-200",
  "沙箱": "bg-amber-50 text-amber-700 border-amber-200",
  "隐私计算": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "系统": "bg-slate-50 text-slate-700 border-slate-200",
  "任务": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "抽样管理": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "区块链": "bg-violet-50 text-violet-700 border-violet-200",
};

const levelColor: Record<string, string> = {
  "正常": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "警告": "bg-amber-50 text-amber-700 border-amber-100",
  "异常": "bg-red-50 text-red-700 border-red-100",
};

const moduleIcon: Record<string, React.ElementType> = {
  "抽样管理": Layers,
  "沙箱": Database,
  "隐私计算": Lock,
  "区块链": LinkIcon,
};

const moduleColor: Record<string, string> = {
  "抽样管理": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "沙箱": "bg-amber-50 text-amber-700 border-amber-200",
  "隐私计算": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "区块链": "bg-violet-50 text-violet-700 border-violet-200",
};

export default function AuditCenter() {
  const [activeTab, setActiveTab] = useState("audit-log");

  // Audit log state
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  // Trace state
  const [traceInput, setTraceInput] = useState("");
  const [showTrace, setShowTrace] = useState(false);

  // Evidence verification state
  const [verificationResult, setVerificationResult] = useState<"match" | "mismatch" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notarization query state
  const [notarizationSearch, setNotarizationSearch] = useState("");
  const [notarizationModuleFilter, setNotarizationModuleFilter] = useState("all");
  const [notarizationTimeFilter, setNotarizationTimeFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const filteredAudits = allAudits.filter((a) => {
    const matchSearch =
      !search ||
      [a.user, a.action, a.target, a.detail, a.id].some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const matchSource = sourceFilter === "all" || a.source === sourceFilter;
    const matchLevel = levelFilter === "all" || a.level === levelFilter;
    const matchAction = actionFilter === "all" || a.action.includes(actionFilter);
    const matchTime =
      timeFilter === "all" ||
      (timeFilter === "today" && a.time.startsWith(today)) ||
      (timeFilter === "week" && new Date(a.time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchSearch && matchSource && matchLevel && matchAction && matchTime;
  });

  const todayAudits = allAudits.filter((a) => a.time.startsWith(today)).length;
  const alertCount = allAudits.filter((a) => a.level === "异常" || a.level === "警告").length;
  const notarizedCount = notarizationRecords.length;
  const pendingAlerts = allAudits.filter((a) => a.level === "异常").length;

  const filteredNotarizations = notarizationRecords.filter((n) => {
    const matchSearch =
      !notarizationSearch ||
      [n.id, n.txHash, n.dataHash, n.operationType].some((s) =>
        s.toLowerCase().includes(notarizationSearch.toLowerCase())
      );
    const matchModule = notarizationModuleFilter === "all" || n.moduleSource === notarizationModuleFilter;
    const matchTime =
      notarizationTimeFilter === "all" ||
      (notarizationTimeFilter === "today" && n.timestamp.startsWith(today)) ||
      (notarizationTimeFilter === "week" && new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchSearch && matchModule && matchTime;
  });

  const handleFileUpload = () => {
    // Simulate verification
    setTimeout(() => {
      setVerificationResult(Math.random() > 0.3 ? "match" : "mismatch");
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredAudits, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `audit_export_${new Date().toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>平台管理</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>统一审计中心</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            统一审计中心
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            汇聚平台、沙箱、隐私计算、系统、任务全维度审计日志，支持跨源检索、全链路溯源与区块链存证核验
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日审计记录数</p>
              <p className="text-2xl font-bold">{todayAudits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">异常/告警数</p>
              <p className="text-2xl font-bold">{alertCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已存证上链数</p>
              <p className="text-2xl font-bold">{notarizedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理告警数</p>
              <p className="text-2xl font-bold">{pendingAlerts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="audit-log" className="gap-2">
            <FileText className="h-4 w-4" />
            审计日志
          </TabsTrigger>
          <TabsTrigger value="trace" className="gap-2">
            <GitBranch className="h-4 w-4" />
            全链路溯源
          </TabsTrigger>
          <TabsTrigger value="verify" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            证据核验
          </TabsTrigger>
          <TabsTrigger value="notarization" className="gap-2">
            <FileSearch className="h-4 w-4" />
            存证查询
          </TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索审计ID/用户/操作/对象/详情"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="审计源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="平台">平台</SelectItem>
                <SelectItem value="沙箱">沙箱</SelectItem>
                <SelectItem value="隐私计算">隐私计算</SelectItem>
                <SelectItem value="系统">系统</SelectItem>
                <SelectItem value="任务">任务</SelectItem>
                <SelectItem value="抽样管理">抽样管理</SelectItem>
                <SelectItem value="区块链">区块链</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="操作类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                <SelectItem value="创建">创建</SelectItem>
                <SelectItem value="执行">执行</SelectItem>
                <SelectItem value="审批">审批</SelectItem>
                <SelectItem value="删除">删除</SelectItem>
                <SelectItem value="启动">启动</SelectItem>
                <SelectItem value="发布">发布</SelectItem>
                <SelectItem value="备份">备份</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">近7天</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="事件级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="警告">警告</SelectItem>
                <SelectItem value="异常">异常</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              导出
            </Button>
          </div>

          {/* Audit Table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600">审计ID</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">来源</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">时间</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">用户</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">操作</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">操作对象</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">级别</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">结果</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((a) => {
                  const Icon = sourceIcon[a.source] || Activity;
                  return (
                    <TableRow key={a.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs text-gray-500">{a.id}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                            sourceColor[a.source]
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {a.source}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{a.time}</TableCell>
                      <TableCell className="font-medium">{a.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">{a.target}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs border",
                            levelColor[a.level]
                          )}
                        >
                          {a.level}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-xs font-medium",
                          a.result === "成功" ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {a.result}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{a.ip}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredAudits.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无匹配的审计记录</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Full Traceability Tab */}
        <TabsContent value="trace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                数据全链路溯源
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="输入数据ID或任务ID进行溯源"
                    value={traceInput}
                    onChange={(e) => setTraceInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (traceInput.trim()) {
                      setShowTrace(true);
                    }
                  }}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  查询溯源
                </Button>
              </div>

              {/* Quick Example */}
              {!showTrace && (
                <div className="text-sm text-gray-500">
                  示例ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">TRACE-2024-001</code>
                </div>
              )}

              {/* Trace Result */}
              {showTrace && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-indigo-900">
                      {traceExample.dataName}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {traceExample.dataId}
                    </Badge>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8 space-y-6">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

                    {traceExample.steps.map((step, index) => {
                      const Icon = moduleIcon[step.module] || Activity;
                      const isLast = index === traceExample.steps.length - 1;
                      return (
                        <div key={index} className="relative">
                          {/* Dot */}
                          <div
                            className={cn(
                              "absolute -left-5 w-3 h-3 rounded-full border-2",
                              step.status === "已确认"
                                ? "bg-violet-500 border-violet-500"
                                : "bg-indigo-500 border-indigo-500"
                            )}
                          />

                          {/* Card */}
                          <Card className="border-gray-100 shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-9 h-9 rounded-lg flex items-center justify-center",
                                      moduleColor[step.module].split(" ")[0]
                                    )}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{step.module}</span>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          moduleColor[step.module]
                                        )}
                                      >
                                        {step.operation}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {step.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" />
                                        {step.user}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    className={cn(
                                      step.status === "已确认"
                                        ? "bg-violet-50 text-violet-700 border-violet-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    )}
                                  >
                                    {step.status}
                                  </Badge>
                                  <p className="text-xs text-gray-400 mt-1 font-mono">
                                    {step.hash}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Arrow */}
                          {!isLast && (
                            <div className="flex justify-center my-2">
                              <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Verification Tab */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                证据核验
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  isDragging
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  点击或拖拽文件到此处进行核验
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  支持 PDF、ZIP、CSV 等格式，文件大小不超过 100MB
                </p>
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <Card
                  className={cn(
                    "border-2",
                    verificationResult === "match"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {verificationResult === "match" ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                          <div>
                            <h3 className="font-bold text-emerald-900">核验通过</h3>
                            <p className="text-sm text-emerald-700">
                              文件哈希与区块链存证记录一致
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-red-600" />
                          <div>
                            <h3 className="font-bold text-red-900">核验失败</h3>
                            <p className="text-sm text-red-700">
                              文件哈希与区块链存证记录不匹配
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Blockchain Record */}
                    <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        对应区块链记录
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">交易哈希</span>
                          <p className="font-mono text-xs text-gray-700 mt-0.5">
                            0x8f3a2b1c...d9e0f1
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">区块高度</span>
                          <p className="font-mono text-xs text-gray-700 mt-0.5">
                            #128471
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">存证时间</span>
                          <p className="text-xs text-gray-700 mt-0.5">
                            2026-04-27 15:05:00
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">数据哈希</span>
                          <p className="font-mono text-xs text-gray-700 mt-0.5">
                            {verificationResult === "match"
                              ? "0xstu901... (匹配)"
                              : "0xstu901... (不匹配)"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">模块来源</span>
                          <p className="text-xs text-gray-700 mt-0.5">隐私计算</p>
                        </div>
                        <div>
                          <span className="text-gray-400">操作类型</span>
                          <p className="text-xs text-gray-700 mt-0.5">
                            联邦任务结果存证
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notarization Query Tab */}
        <TabsContent value="notarization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-violet-600" />
                存证查询
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索存证ID/交易哈希/数据哈希"
                    value={notarizationSearch}
                    onChange={(e) => setNotarizationSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={notarizationModuleFilter}
                  onValueChange={setNotarizationModuleFilter}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="模块来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部模块</SelectItem>
                    <SelectItem value="平台">平台</SelectItem>
                    <SelectItem value="沙箱">沙箱</SelectItem>
                    <SelectItem value="隐私计算">隐私计算</SelectItem>
                    <SelectItem value="系统">系统</SelectItem>
                    <SelectItem value="任务">任务</SelectItem>
                    <SelectItem value="抽样管理">抽样管理</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={notarizationTimeFilter}
                  onValueChange={setNotarizationTimeFilter}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="week">近7天</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notarization Table */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-600">
                        存证ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        交易哈希
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        区块高度
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        时间戳
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        模块来源
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        操作类型
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        数据哈希
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        状态
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotarizations.map((n) => (
                      <TableRow key={n.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs text-gray-500">
                          {n.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500 max-w-[150px] truncate">
                          {n.txHash}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-700">
                          #{n.blockNumber}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {n.timestamp}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              sourceColor[n.moduleSource]
                            )}
                          >
                            {n.moduleSource}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-700">
                          {n.operationType}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">
                          {n.dataHash}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {n.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredNotarizations.length === 0 && (
                  <div className="py-12 text-center text-gray-400">
                    <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无匹配的存证记录</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
