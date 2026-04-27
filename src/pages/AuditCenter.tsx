import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronRight, Search, Shield, Clock, Eye, FileCode, Database, Download, Upload,
  UserCheck, AlertTriangle, Server, Cpu, Layers, Globe, Activity, Filter, FileText,
  HardDrive, Lock, Play, RotateCw, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── 统一审计数据源 ─── */
const allAudits = [
  // 平台审计
  { id: "AUD-001", source: "平台", time: "2026-04-24 14:30:00", user: "张三", action: "创建项目", target: "金融风控联合建模", result: "成功", level: "正常", ip: "192.168.1.100", detail: "创建隐私计算项目，包含3个参与方" },
  { id: "AUD-002", source: "平台", time: "2026-04-24 14:25:00", user: "李四", action: "审批通过", target: "资源申请-客户画像", result: "成功", level: "正常", ip: "192.168.1.101", detail: "审批通过GPU资源申请，配额8卡" },
  // 沙箱审计
  { id: "AUD-003", source: "沙箱", time: "2026-04-24 14:20:00", user: "王五", action: "数据访问", target: "ods_user_info", result: "成功", level: "正常", ip: "192.168.1.102", detail: "SELECT * FROM ods_user_info LIMIT 1000" },
  { id: "AUD-004", source: "沙箱", time: "2026-04-24 14:15:00", user: "赵六", action: "脚本执行", target: "feature_engineer.py", result: "成功", level: "正常", ip: "192.168.1.103", detail: "执行特征工程脚本，处理568,920行数据" },
  { id: "AUD-005", source: "沙箱", time: "2026-04-24 14:10:00", user: "钱七", action: "数据导出", target: "dwd_order_detail", result: "成功", level: "警告", ip: "192.168.1.104", detail: "导出处理结果 245MB CSV文件" },
  // 隐私计算审计
  { id: "AUD-006", source: "隐私计算", time: "2026-04-24 14:05:00", user: "张三", action: "启动PSI任务", target: "客户ID比对", result: "成功", level: "正常", ip: "192.168.1.100", detail: "启动隐私求交任务，参与方：A银行+B保险" },
  { id: "AUD-007", source: "隐私计算", time: "2026-04-24 14:00:00", user: "李四", action: "模型发布", target: "scorecard_v2", result: "成功", level: "正常", ip: "192.168.1.101", detail: "发布评分卡模型到模型市场，版本v2.0.0" },
  { id: "AUD-008", source: "隐私计算", time: "2026-04-24 13:55:00", user: "王五", action: "联邦训练", target: "LR-Credit-2026Q1", result: "失败", level: "异常", ip: "192.168.1.102", detail: "联邦训练因参与方C超时断开而失败" },
  // 系统审计
  { id: "AUD-009", source: "系统", time: "2026-04-24 13:50:00", user: "系统", action: "自动备份", target: "区块链节点数据", result: "成功", level: "正常", ip: "127.0.0.1", detail: "完成全量备份，耗时45分钟，大小12.5GB" },
  { id: "AUD-010", source: "系统", time: "2026-04-24 13:45:00", user: "系统", action: "安全扫描", target: "全平台", result: "成功", level: "警告", ip: "127.0.0.1", detail: "发现3个中危漏洞，已生成修复建议" },
  // 任务审计
  { id: "AUD-011", source: "任务", time: "2026-04-24 13:40:00", user: "张三", action: "任务重跑", target: "TSK-20260424001", result: "成功", level: "正常", ip: "192.168.1.100", detail: "抽样任务失败后手动重跑，现已成功" },
  { id: "AUD-012", source: "任务", time: "2026-04-24 13:35:00", user: "李四", action: "任务删除", target: "TSK-20260423005", result: "成功", level: "正常", ip: "192.168.1.101", detail: "删除过期任务，释放存储空间" },
];

const sourceIcon: Record<string, typeof Server> = {
  "平台": Server,
  "沙箱": Database,
  "隐私计算": Lock,
  "系统": Cpu,
  "任务": Play,
};

const sourceColor: Record<string, string> = {
  "平台": "bg-blue-50 text-blue-700 border-blue-200",
  "沙箱": "bg-amber-50 text-amber-700 border-amber-200",
  "隐私计算": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "系统": "bg-slate-50 text-slate-700 border-slate-200",
  "任务": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const levelColor: Record<string, string> = {
  "正常": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "警告": "bg-amber-50 text-amber-700 border-amber-100",
  "异常": "bg-red-50 text-red-700 border-red-100",
};

export default function AuditCenter() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = allAudits.filter((a) => {
    const matchSearch = !search || [a.user, a.action, a.target, a.detail].some((s) => s.includes(search));
    const matchSource = sourceFilter === "all" || a.source === sourceFilter;
    const matchLevel = levelFilter === "all" || a.level === levelFilter;
    return matchSearch && matchSource && matchLevel;
  });

  const totalBySource = (source: string) => allAudits.filter((a) => a.source === source).length;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>平台管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>统一审计中心</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">统一审计中心</h1>
          <p className="text-sm text-gray-500 mt-1.5">汇聚平台、沙箱、隐私计算、系统、任务全维度审计日志，支持跨源检索与追踪</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />导出审计报告</Button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Shield className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">审计总数</p><p className="text-2xl font-bold">{allAudits.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Server className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">平台操作</p><p className="text-2xl font-bold">{totalBySource("平台")}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Database className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">沙箱操作</p><p className="text-2xl font-bold">{totalBySource("沙箱")}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Lock className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">隐私计算</p><p className="text-2xl font-bold">{totalBySource("隐私计算")}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-5 w-5 text-slate-600" /><div><p className="text-sm text-gray-500">系统事件</p><p className="text-2xl font-bold">{totalBySource("系统")}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-500" /><div><p className="text-sm text-gray-500">异常事件</p><p className="text-2xl font-bold">{allAudits.filter((a) => a.level === "异常").length}</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索用户/操作/对象/详情" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="审计源" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            <SelectItem value="平台">平台</SelectItem>
            <SelectItem value="沙箱">沙箱</SelectItem>
            <SelectItem value="隐私计算">隐私计算</SelectItem>
            <SelectItem value="系统">系统</SelectItem>
            <SelectItem value="任务">任务</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="事件级别" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部级别</SelectItem>
            <SelectItem value="正常">正常</SelectItem>
            <SelectItem value="警告">警告</SelectItem>
            <SelectItem value="异常">异常</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" />更多筛选</Button>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline"><Clock className="h-4 w-4 mr-1" />时间线</TabsTrigger>
          <TabsTrigger value="table"><Table className="h-4 w-4 mr-1" />表格视图</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-0 relative pl-6 border-l-2 border-gray-200">
            {filtered.map((audit, i) => {
              const Icon = sourceIcon[audit.source] || Activity;
              return (
                <div key={audit.id} className="relative pb-6">
                  <div className={cn("absolute -left-[25px] w-4 h-4 rounded-full border-2 flex items-center justify-center", audit.level === "异常" ? "bg-red-500 border-red-500" : audit.level === "警告" ? "bg-amber-500 border-amber-500" : "bg-indigo-500 border-indigo-500")}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", sourceColor[audit.source])}>
                          <Icon className="w-3 h-3" />{audit.source}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{audit.action}</span>
                        <Badge variant="outline" className="text-xs">{audit.target}</Badge>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{audit.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{audit.detail}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>用户: {audit.user}</span>
                      <span>IP: {audit.ip}</span>
                      <span className={cn("px-2 py-0.5 rounded-full border", levelColor[audit.level])}>{audit.level}</span>
                      <span className={cn("text-xs", audit.result === "成功" ? "text-emerald-600" : "text-red-600")}>{audit.result}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["审计ID", "来源", "时间", "用户", "操作", "操作对象", "级别", "结果", "IP"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a) => {
                  const Icon = sourceIcon[a.source] || Activity;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.id}</td>
                      <td className="px-4 py-3"><span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border", sourceColor[a.source])}><Icon className="w-3 h-3" />{a.source}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.time}</td>
                      <td className="px-4 py-3 font-medium">{a.user}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{a.action}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{a.target}</td>
                      <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs border", levelColor[a.level])}>{a.level}</span></td>
                      <td className={cn("px-4 py-3 text-xs font-medium", a.result === "成功" ? "text-emerald-600" : "text-red-600")}>{a.result}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
