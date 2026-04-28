import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Monitor, Cpu, MemoryStick, Wifi, AlertTriangle, Clock, Eye, Activity, Server, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import type { FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

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

interface AlertLog {
  id: string;
  taskId: string;
  time: string;
  level: string;
  type: string;
  detail: string;
  status: string;
}

const statusColor: Record<string, string> = {
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
};

const alertLevelColor: Record<string, string> = {
  "警告": "bg-amber-50 text-amber-700 border-amber-100",
  "严重": "bg-red-50 text-red-700 border-red-100",
};

const taskFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "status", label: "状态", type: "select", options: [
    { label: "运行中", value: "运行中" },
    { label: "待执行", value: "待执行" },
    { label: "已完成", value: "已完成" },
    { label: "已暂停", value: "已暂停" },
    { label: "执行失败", value: "执行失败" },
    { label: "已终止", value: "已终止" },
  ]},
  { key: "cpu", label: "CPU使用率", type: "text" },
  { key: "memory", label: "内存使用率", type: "text" },
  { key: "network", label: "网络使用率", type: "text" },
  { key: "startTime", label: "开始时间", type: "text" },
  { key: "duration", label: "持续时间", type: "text" },
];

const alertFields: FieldConfig[] = [
  { key: "taskId", label: "任务ID", type: "text", required: true },
  { key: "time", label: "时间", type: "text", required: true },
  { key: "level", label: "级别", type: "select", options: [
    { label: "信息", value: "信息" },
    { label: "警告", value: "警告" },
    { label: "严重", value: "严重" },
    { label: "紧急", value: "紧急" },
  ]},
  { key: "type", label: "类型", type: "select", options: [
    { label: "网络流量异常", value: "网络流量异常" },
    { label: "CPU过载", value: "CPU过载" },
    { label: "内存不足", value: "内存不足" },
    { label: "磁盘空间不足", value: "磁盘空间不足" },
    { label: "任务执行超时", value: "任务执行超时" },
    { label: "节点离线", value: "节点离线" },
  ]},
  { key: "detail", label: "详情", type: "text" },
  { key: "status", label: "状态", type: "select", options: [
    { label: "已处理", value: "已处理" },
    { label: "待处理", value: "待处理" },
    { label: "处理中", value: "处理中" },
    { label: "已忽略", value: "已忽略" },
  ]},
];

export default function SecretMonitor() {
  const [monitorTasks, setMonitorTasks] = useState<MonitorTask[]>([
    { id: "MT-001", name: "PSI-用户ID隐私求交", cpu: 78, memory: 65, network: 45, status: "运行中", startTime: "2026-04-24 10:00", duration: "12分30秒", alerts: 0 },
    { id: "MT-002", name: "PIR-用户关键词查询", cpu: 45, memory: 32, network: 89, status: "运行中", startTime: "2026-04-24 10:05", duration: "5分20秒", alerts: 1 },
    { id: "MT-003", name: "MPC-信用评分计算", cpu: 92, memory: 88, network: 23, status: "运行中", startTime: "2026-04-24 09:30", duration: "25分10秒", alerts: 2 },
    { id: "MT-004", name: "PSI-订单ID多方求交", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-005", name: "PIR-设备ID关键词查询", cpu: 0, memory: 0, network: 0, status: "待执行", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-006", name: "TEE-安全推理批次3", cpu: 67, memory: 72, network: 34, status: "运行中", startTime: "2026-04-24 09:15", duration: "18分45秒", alerts: 0 },
    { id: "MT-007", name: "HE-加密矩阵运算", cpu: 0, memory: 0, network: 0, status: "已完成", startTime: "2026-04-24 08:00", duration: "30分00秒", alerts: 0 },
    { id: "MT-008", name: "ZKP-证明参数调优", cpu: 0, memory: 0, network: 0, status: "已暂停", startTime: "2026-04-24 07:30", duration: "-", alerts: 1 },
    { id: "MT-009", name: "MPC-跨域特征聚合", cpu: 85, memory: 76, network: 56, status: "运行中", startTime: "2026-04-24 08:45", duration: "22分15秒", alerts: 1 },
    { id: "MT-010", name: "PSI-基因ID隐私求交", cpu: 0, memory: 0, network: 0, status: "执行失败", startTime: "2026-04-24 07:00", duration: "-", alerts: 3 },
    { id: "MT-011", name: "PIR-医疗关键词查询", cpu: 0, memory: 0, network: 0, status: "已终止", startTime: "-", duration: "-", alerts: 0 },
    { id: "MT-012", name: "TEE-安全训练批次2", cpu: 55, memory: 48, network: 42, status: "运行中", startTime: "2026-04-24 09:50", duration: "8分10秒", alerts: 0 },
  ]);

  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([
    { id: "AL-001", taskId: "MT-002", time: "2026-04-24 10:08", level: "警告", type: "网络流量异常", detail: "PIR查询网络流量超过阈值 85MB/s", status: "已处理" },
    { id: "AL-002", taskId: "MT-003", time: "2026-04-24 09:45", level: "严重", type: "CPU过载", detail: "MPC任务CPU使用率达到92%，触发扩容", status: "已处理" },
    { id: "AL-003", taskId: "MT-003", time: "2026-04-24 09:50", level: "警告", type: "内存不足", detail: "内存使用率88%，建议优化任务配置", status: "待处理" },
    { id: "AL-004", taskId: "MT-009", time: "2026-04-24 09:00", level: "严重", type: "磁盘空间不足", detail: "存储使用率达到95%，请清理临时文件", status: "处理中" },
    { id: "AL-005", taskId: "MT-008", time: "2026-04-24 07:35", level: "信息", type: "任务执行超时", detail: "ZKP证明生成超过预期时间", status: "已忽略" },
    { id: "AL-006", taskId: "MT-010", time: "2026-04-24 07:05", level: "紧急", type: "节点离线", detail: "计算节点C连接中断，任务执行失败", status: "待处理" },
    { id: "AL-007", taskId: "MT-006", time: "2026-04-24 09:20", level: "警告", type: "CPU过载", detail: "TEE推理任务CPU使用率达到67%", status: "已处理" },
    { id: "AL-008", taskId: "MT-009", time: "2026-04-24 08:50", level: "警告", type: "网络流量异常", detail: "跨域特征聚合网络流量超过阈值 60MB/s", status: "已处理" },
    { id: "AL-009", taskId: "MT-012", time: "2026-04-24 09:55", level: "信息", type: "内存不足", detail: "安全训练任务内存使用率达到48%", status: "处理中" },
    { id: "AL-010", taskId: "MT-007", time: "2026-04-24 08:30", level: "严重", type: "任务执行超时", detail: "加密矩阵运算耗时超过预期", status: "已处理" },
  ]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<MonitorTask | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertLog | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");

  const filteredTasks = monitorTasks.filter((d) => d.name.includes(search) || d.id.includes(search));

  const handleCreateTask = () => {
    setSelectedTask(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditTask = (task: MonitorTask) => {
    setSelectedTask(task);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteTask = (task: MonitorTask) => {
    setSelectedTask(task);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleViewTask = (task: MonitorTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleTaskSubmit = (data: Partial<MonitorTask>) => {
    if (dialogMode === "create") {
      const newTask: MonitorTask = {
        id: `MT-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        cpu: Number(data.cpu) || 0,
        memory: Number(data.memory) || 0,
        network: Number(data.network) || 0,
        status: data.status || "待执行",
        startTime: data.startTime || "-",
        duration: data.duration || "-",
        alerts: 0,
      };
      setMonitorTasks([...monitorTasks, newTask]);
    } else if (dialogMode === "edit" && selectedTask) {
      setMonitorTasks(monitorTasks.map((t) => (t.id === selectedTask.id ? { ...t, ...data } : t)));
    }
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskDelete = () => {
    if (selectedTask) {
      setMonitorTasks(monitorTasks.filter((t) => t.id !== selectedTask.id));
      setAlertLogs(alertLogs.filter((a) => a.taskId !== selectedTask.id));
    }
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleCreateAlert = () => {
    setSelectedAlert(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditAlert = (alert: AlertLog) => {
    setSelectedAlert(alert);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteAlert = (alert: AlertLog) => {
    setSelectedAlert(alert);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleViewAlert = (alert: AlertLog) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const handleAlertSubmit = (data: Partial<AlertLog>) => {
    if (dialogMode === "create") {
      const newAlert: AlertLog = {
        id: `AL-${Date.now().toString(36).toUpperCase()}`,
        taskId: data.taskId || "",
        time: data.time || "",
        level: data.level || "警告",
        type: data.type || "",
        detail: data.detail || "",
        status: data.status || "待处理",
      };
      setAlertLogs([...alertLogs, newAlert]);
    } else if (dialogMode === "edit" && selectedAlert) {
      setAlertLogs(alertLogs.map((a) => (a.id === selectedAlert.id ? { ...a, ...data } : a)));
    }
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  const handleAlertDelete = () => {
    if (selectedAlert) {
      setAlertLogs(alertLogs.filter((a) => a.id !== selectedAlert.id));
    }
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/secret">密态计算</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>密态监控</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">密态监控</h1>
          <p className="text-sm text-gray-500 mt-1.5">任务执行实时监控（CPU/内存/网络流量）、任务异常告警、执行日志追踪</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Monitor className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">监控任务</p>
              <p className="text-lg font-bold">{monitorTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-500">平均CPU</p>
              <p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.cpu, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <MemoryStick className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-sm text-gray-500">平均内存</p>
              <p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.memory, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Wifi className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">平均网络</p>
              <p className="text-lg font-bold">{Math.round(monitorTasks.filter((t) => t.status === "运行中").reduce((s, t) => s + t.network, 0) / monitorTasks.filter((t) => t.status === "运行中").length || 1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">告警数</p>
              <p className="text-lg font-bold">{alertLogs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">
            <Monitor className="h-4 w-4 mr-1" />
            任务监控
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-1" />
            告警管理
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-1" />
            执行日志
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="搜索任务名称或ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm"
            />
            <Button onClick={handleCreateTask} size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建任务
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filteredTasks.map((t) => (
              <Card key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer" onClick={() => handleViewTask(t)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.id} | {t.status}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[t.status]}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
                      {t.status}
                    </span>
                  </div>
                  {t.status === "运行中" && (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>CPU</span>
                          <span>{t.cpu}%</span>
                        </div>
                        <Progress value={t.cpu} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>内存</span>
                          <span>{t.memory}%</span>
                        </div>
                        <Progress value={t.memory} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>网络</span>
                          <span>{t.network}%</span>
                        </div>
                        <Progress value={t.network} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />
                        {t.duration} | 告警: {t.alerts}
                      </div>
                    </div>
                  )}
                  {t.status === "待执行" && (
                    <div className="text-center py-4 text-gray-400">
                      <Server className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">任务等待调度</p>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleViewTask(t)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditTask(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(t)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Button onClick={handleCreateAlert} size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建告警
            </Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["告警ID", "时间", "任务", "级别", "类型", "详情", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {alertLogs.map((a) => (
                  <TableRow key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{a.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.time}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.taskId}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${alertLevelColor[a.level]}`}>{a.level}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{a.type}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{a.detail}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "已处理" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewAlert(a)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAlert(a)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(a)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              执行日志追踪
            </h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:00:00]</span>
                <span className="text-emerald-600">[INFO]</span>
                <span>任务 MT-001 启动成功，分配资源: CPU 4核, 内存 8GB</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:00:05]</span>
                <span className="text-emerald-600">[INFO]</span>
                <span>PSI协议初始化完成，开始数据预处理</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:02:30]</span>
                <span className="text-emerald-600">[INFO]</span>
                <span>哈希计算完成，开始比对阶段</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:05:00]</span>
                <span className="text-blue-600">[PROGRESS]</span>
                <span>比对进度 45%，已匹配 380,000 / 845,000</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:08:12]</span>
                <span className="text-amber-600">[WARN]</span>
                <span>网络流量达到 85MB/s，触发流量告警 AL-001</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:10:00]</span>
                <span className="text-emerald-600">[INFO]</span>
                <span>比对进度 67%，已匹配 566,000 / 845,000</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-gray-400">[2026-04-24 10:12:30]</span>
                <span className="text-emerald-600">[INFO]</span>
                <span>任务完成，总匹配 845,230 条，耗时 12分30秒</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={activeTab === "tasks" ? "监控任务" : "告警记录"}
        fields={activeTab === "tasks" ? taskFields : alertFields}
        data={activeTab === "tasks" ? selectedTask || {} : selectedAlert || {}}
        mode={dialogMode}
        onSubmit={activeTab === "tasks" ? handleTaskSubmit : handleAlertSubmit}
        onDelete={activeTab === "tasks" ? handleTaskDelete : handleAlertDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={activeTab === "tasks" ? "监控任务详情" : "告警记录详情"}
        data={activeTab === "tasks" ? selectedTask || {} : selectedAlert || {}}
        fields={
          activeTab === "tasks"
            ? [
                { key: "name", label: "任务名称" },
                { key: "id", label: "任务ID" },
                { key: "status", label: "状态", type: "badge" as const },
                { key: "cpu", label: "CPU使用率" },
                { key: "memory", label: "内存使用率" },
                { key: "network", label: "网络使用率" },
                { key: "startTime", label: "开始时间" },
                { key: "duration", label: "持续时间" },
                { key: "alerts", label: "告警数" },
              ]
            : [
                { key: "id", label: "告警ID" },
                { key: "taskId", label: "任务ID" },
                { key: "time", label: "时间" },
                { key: "level", label: "级别", type: "badge" as const },
                { key: "type", label: "类型" },
                { key: "detail", label: "详情" },
                { key: "status", label: "状态", type: "badge" as const },
              ]
        }
        onEdit={() => {
          setDrawerOpen(false);
          if (activeTab === "tasks" && selectedTask) {
            handleEditTask(selectedTask);
          } else if (activeTab === "alerts" && selectedAlert) {
            handleEditAlert(selectedAlert);
          }
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (activeTab === "tasks" && selectedTask) {
            handleDeleteTask(selectedTask);
          } else if (activeTab === "alerts" && selectedAlert) {
            handleDeleteAlert(selectedAlert);
          }
        }}
      />
    </div>
  );
}
