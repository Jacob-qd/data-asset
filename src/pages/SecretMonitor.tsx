import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Monitor, Cpu, MemoryStick, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock, Eye, BarChart3, Activity, Zap, Server } from "lucide-react";

interface MonitorTask {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  network: number;
  status: string;
  startTime: string;
  duration: string;
  alerts: number;
}

const monitorTasks: MonitorTask[] = [
  { id: "MT-001", name: "PSI-用户ID隐私求交", cpu: 78, memory: 65, network: 45, status: "运行中", startTime: "2026-04-24 10:00", duration: "12分30秒", alerts: 0 },
  { id: "MT-002", name: "PIR-用户关键词查询", cpu: 45, memory: 32, network: 89, status: "运行中", startTime: "2026-04-24 10:05", duration: "5分20秒", alerts: 1 },
  { id: "MT-003", name: "MPC-信用评分计算", cpu: 92, memory: 88, network: 23, status: "运行中", startTime: "2026-04-24 09:30", duration: "25分10秒", alerts: 2 },
  { id: "MT-004", name: "PSI-订单ID多方求交", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
  { id: "MT-005", name: "PIR-设备ID关键词查询", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
];

const alertLogs = [
  { id: "AL-001", taskId: "MT-002", time: "2026-04-24 10:08", level: "警告", type: "网络流量异常", detail: "PIR查询网络流量超过阈值 85MB/s", status: "已处理" },
  { id: "AL-002", taskId: "MT-003", time: "2026-04-24 09:45", level: "严重", type: "CPU过载", detail: "MPC任务CPU使用率达到92%，触发扩容", status: "已处理" },
  { id: "AL-003", taskId: "MT-003", time: "2026-04-24 09:50", level: "警告", type: "内存不足", detail: "内存使用率88%，建议优化任务配置", status: "待处理" },
];

const statusColor: Record<string, string> = {
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
};

const alertLevelColor: Record<string, string> = {
  "警告": "bg-amber-50 text-amber-700 border-amber-100",
  "严重": "bg-red-50 text-red-700 border-red-100",
};

export default function SecretMonitor() {
  const [search, setSearch] = useState("");
  const filtered = monitorTasks.filter((d) => d.name.includes(search) || d.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/secret">密态计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>密态监控</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">密态监控</h1>
          <p className="text-sm text-gray-500 mt-1.5">任务执行实时监控（CPU/内存/网络流量）、任务异常告警、执行日志追踪</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Monitor className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">监控任务</p><p className="text-lg font-bold">{monitorTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">平均CPU</p><p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.cpu, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><MemoryStick className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">平均内存</p><p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.memory, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Wifi className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">平均网络</p><p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.network, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-500" /><div><p className="text-sm text-gray-500">告警数</p><p className="text-lg font-bold">{alertLogs.length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks"><Monitor className="h-4 w-4 mr-1" />任务监控</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="h-4 w-4 mr-1" />告警管理</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="h-4 w-4 mr-1" />执行日志</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.id} | {t.status}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[t.status]}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />{t.status}
                    </span>
                  </div>
                  {t.status === "运行中" && (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span>CPU</span><span>{t.cpu}%</span></div>
                        <Progress value={t.cpu} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span>内存</span><span>{t.memory}%</span></div>
                        <Progress value={t.memory} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span>网络</span><span>{t.network}%</span></div>
                        <Progress value={t.network} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />{t.duration} | 告警: {t.alerts}
                      </div>
                    </div>
                  )}
                  {t.status === "待执行" && (
                    <div className="text-center py-4 text-gray-400">
                      <Server className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">任务等待调度</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["告警ID", "时间", "任务", "级别", "类型", "详情", "状态"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {alertLogs.map((a) => (
                  <TableRow key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{a.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.time}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.taskId}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${alertLevelColor[a.level]}`}>{a.level}</span></TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.type}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.detail}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "已处理" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.status}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-600" />执行日志追踪</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:00:00]</span><span className="text-emerald-600">[INFO]</span><span>任务 MT-001 启动成功，分配资源: CPU 4核, 内存 8GB</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:00:05]</span><span className="text-emerald-600">[INFO]</span><span>PSI协议初始化完成，开始数据预处理</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:02:30]</span><span className="text-emerald-600">[INFO]</span><span>哈希计算完成，开始比对阶段</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:05:00]</span><span className="text-blue-600">[PROGRESS]</span><span>比对进度 45%，已匹配 380,000 / 845,000</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:08:12]</span><span className="text-amber-600">[WARN]</span><span>网络流量达到 85MB/s，触发流量告警 AL-001</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:10:00]</span><span className="text-emerald-600">[INFO]</span><span>比对进度 67%，已匹配 566,000 / 845,000</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><span className="text-gray-400">[2026-04-24 10:12:30]</span><span className="text-emerald-600">[INFO]</span><span>任务完成，总匹配 845,230 条，耗时 12分30秒</span></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
