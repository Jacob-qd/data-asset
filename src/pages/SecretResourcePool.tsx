import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus, Search, HardDrive, Cpu, MemoryStick, TrendingUp, Trash2, Eye,
  FileCheck, ArrowRight, Server, Zap, RotateCcw, Settings, SlidersHorizontal,
  Pencil, AlertTriangle,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Resource {
  id: string;
  name: string;
  type: string;
  cpu: number;
  totalCpu: number;
  memory: number;
  totalMemory: number;
  storage: number;
  totalStorage: number;
  status: string;
  owner: string;
  usage: number;
  description?: string;
}

interface UsageRanking {
  user: string;
  tasks: number;
  cpuHours: number;
  memoryHours: number;
  rank: number;
}

interface ResourceRequest {
  id: string;
  user: string;
  type: string;
  spec: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

interface QuotaPolicy {
  id: string;
  name: string;
  user: string;
  maxCpu: number;
  maxMemory: number;
  maxStorage: number;
  maxTasks: number;
  period: string;
}

interface SchedulePolicy {
  id: string;
  name: string;
  strategy: string;
  priority: string;
  enabled: boolean;
  description?: string;
}

const initialResources: Resource[] = [
  { id: "RP-001", name: "密态计算节点A", type: "计算节点", cpu: 12, totalCpu: 16, memory: 24, totalMemory: 32, storage: 600, totalStorage: 1024, status: "运行中", owner: "张三", usage: 75, description: "主要计算节点" },
  { id: "RP-002", name: "密态计算节点B", type: "计算节点", cpu: 8, totalCpu: 16, memory: 16, totalMemory: 32, storage: 450, totalStorage: 1024, status: "运行中", owner: "李四", usage: 50, description: "次要计算节点" },
  { id: "RP-003", name: "密态计算节点C", type: "计算节点", cpu: 2, totalCpu: 8, memory: 4, totalMemory: 16, storage: 120, totalStorage: 512, status: "闲置", owner: "王五", usage: 15, description: "备用节点" },
  { id: "RP-004", name: "存储资源池-SSD", type: "存储池", cpu: 0, totalCpu: 0, memory: 0, totalMemory: 0, storage: 800, totalStorage: 2048, status: "运行中", owner: "系统", usage: 39, description: "高速存储池" },
  { id: "RP-005", name: "GPU加速节点", type: "GPU节点", cpu: 4, totalCpu: 8, memory: 12, totalMemory: 16, storage: 300, totalStorage: 512, status: "运行中", owner: "赵六", usage: 65, description: "GPU加速计算" },
  { id: "RP-006", name: "网络加速节点", type: "网络节点", cpu: 2, totalCpu: 4, memory: 8, totalMemory: 16, storage: 100, totalStorage: 256, status: "运行中", owner: "孙七", usage: 45, description: "网络加速节点" },
  { id: "RP-007", name: "安全隔离节点", type: "安全节点", cpu: 4, totalCpu: 8, memory: 16, totalMemory: 32, storage: 200, totalStorage: 512, status: "运行中", owner: "周八", usage: 55, description: "安全隔离计算" },
  { id: "RP-008", name: "备份存储池", type: "备份节点", cpu: 0, totalCpu: 0, memory: 0, totalMemory: 0, storage: 1500, totalStorage: 4096, status: "闲置", owner: "系统", usage: 20, description: "备份存储池" },
  { id: "RP-009", name: "GPU训练节点", type: "GPU节点", cpu: 8, totalCpu: 16, memory: 32, totalMemory: 64, storage: 500, totalStorage: 1024, status: "运行中", owner: "吴九", usage: 80, description: "GPU训练专用" },
  { id: "RP-010", name: "密态计算节点D", type: "计算节点", cpu: 6, totalCpu: 16, memory: 20, totalMemory: 32, storage: 350, totalStorage: 1024, status: "待释放", owner: "郑十", usage: 40, description: "待释放节点" },
];

const initialRanking: UsageRanking[] = [
  { user: "张三", tasks: 12, cpuHours: 120, memoryHours: 240, rank: 1 },
  { user: "李四", tasks: 8, cpuHours: 85, memoryHours: 160, rank: 2 },
  { user: "赵六", tasks: 6, cpuHours: 60, memoryHours: 96, rank: 3 },
  { user: "王五", tasks: 3, cpuHours: 20, memoryHours: 40, rank: 4 },
  { user: "孙七", tasks: 10, cpuHours: 95, memoryHours: 180, rank: 5 },
  { user: "周八", tasks: 7, cpuHours: 70, memoryHours: 130, rank: 6 },
  { user: "吴九", tasks: 5, cpuHours: 50, memoryHours: 100, rank: 7 },
  { user: "郑十", tasks: 4, cpuHours: 35, memoryHours: 70, rank: 8 },
];

const initialRequests: ResourceRequest[] = [
  { id: "REQ-001", user: "张三", type: "计算节点", spec: "8核16GB 500GB", time: "2026-04-24 10:00", status: "pending", reason: "新增项目需要" },
  { id: "REQ-002", user: "李四", type: "存储池", spec: "1TB SSD", time: "2026-04-24 09:30", status: "approved", reason: "数据增长" },
  { id: "REQ-003", user: "王五", type: "GPU节点", spec: "8核16GB 512GB", time: "2026-04-23 16:00", status: "rejected", reason: "预算不足" },
  { id: "REQ-004", user: "赵六", type: "网络节点", spec: "4核8GB 256GB", time: "2026-04-22 11:00", status: "approved", reason: "网络加速需求" },
  { id: "REQ-005", user: "孙七", type: "安全节点", spec: "8核16GB 512GB", time: "2026-04-22 09:00", status: "pending", reason: "安全隔离需求" },
  { id: "REQ-006", user: "周八", type: "备份节点", spec: "2TB HDD", time: "2026-04-21 15:00", status: "approved", reason: "备份存储扩容" },
  { id: "REQ-007", user: "吴九", type: "计算节点", spec: "16核32GB 1TB", time: "2026-04-21 10:00", status: "rejected", reason: "超出配额限制" },
  { id: "REQ-008", user: "郑十", type: "GPU节点", spec: "16核64GB 1TB", time: "2026-04-20 14:00", status: "approved", reason: "模型训练需求" },
];

const initialQuotas: QuotaPolicy[] = [
  { id: "QP-001", name: "张三配额", user: "张三", maxCpu: 16, maxMemory: 32, maxStorage: 1024, maxTasks: 20, period: "每月" },
  { id: "QP-002", name: "李四配额", user: "李四", maxCpu: 12, maxMemory: 24, maxStorage: 512, maxTasks: 15, period: "每月" },
  { id: "QP-003", name: "默认配额", user: "所有用户", maxCpu: 8, maxMemory: 16, maxStorage: 256, maxTasks: 10, period: "每月" },
  { id: "QP-004", name: "王五配额", user: "王五", maxCpu: 10, maxMemory: 20, maxStorage: 512, maxTasks: 12, period: "每周" },
  { id: "QP-005", name: "赵六配额", user: "赵六", maxCpu: 20, maxMemory: 48, maxStorage: 2048, maxTasks: 25, period: "每季度" },
  { id: "QP-006", name: "孙七配额", user: "孙七", maxCpu: 6, maxMemory: 12, maxStorage: 256, maxTasks: 8, period: "每日" },
  { id: "QP-007", name: "周八配额", user: "周八", maxCpu: 14, maxMemory: 28, maxStorage: 1024, maxTasks: 18, period: "每月" },
  { id: "QP-008", name: "吴九配额", user: "吴九", maxCpu: 24, maxMemory: 64, maxStorage: 4096, maxTasks: 30, period: "每年" },
];

const initialSchedules: SchedulePolicy[] = [
  { id: "SP-001", name: "公平调度策略", strategy: "Fair Share", priority: "中", enabled: true, description: "按用户权重公平分配资源" },
  { id: "SP-002", name: "优先级调度", strategy: "Priority", priority: "高", enabled: true, description: "高优先级任务优先执行" },
  { id: "SP-003", name: "时间片轮转", strategy: "Round Robin", priority: "低", enabled: false, description: "均匀分配时间片" },
  { id: "SP-004", name: "先进先出调度", strategy: "FIFO", priority: "紧急", enabled: true, description: "按提交顺序依次执行" },
  { id: "SP-005", name: "回填调度", strategy: "Backfill", priority: "中", enabled: false, description: "利用空闲资源回填小任务" },
  { id: "SP-006", name: "组调度", strategy: "Gang Scheduling", priority: "高", enabled: true, description: "相关任务同时调度执行" },
  { id: "SP-007", name: " Deadline调度", strategy: "Priority", priority: "紧急", enabled: true, description: "截止期限驱动调度" },
  { id: "SP-008", name: "资源感知调度", strategy: "Fair Share", priority: "低", enabled: false, description: "根据资源负载动态调整" },
];

const resourceFields: FieldConfig[] = [
  { key: "name", label: "资源名称", type: "text", required: true },
  { key: "type", label: "资源类型", type: "select", required: true, options: [
    { label: "计算节点", value: "计算节点" },
    { label: "存储池", value: "存储池" },
    { label: "GPU节点", value: "GPU节点" },
    { label: "网络节点", value: "网络节点" },
    { label: "安全节点", value: "安全节点" },
    { label: "备份节点", value: "备份节点" },
  ]},
  { key: "totalCpu", label: "总CPU(核)", type: "number", required: true },
  { key: "totalMemory", label: "总内存(GB)", type: "number", required: true },
  { key: "totalStorage", label: "总存储(GB)", type: "number", required: true },
  { key: "owner", label: "负责人", type: "text", required: true },
  { key: "description", label: "描述", type: "textarea" },
];

const requestFields: FieldConfig[] = [
  { key: "user", label: "申请人", type: "text", required: true },
  { key: "type", label: "资源类型", type: "select", required: true, options: [
    { label: "计算节点", value: "计算节点" },
    { label: "存储池", value: "存储池" },
    { label: "GPU节点", value: "GPU节点" },
    { label: "网络节点", value: "网络节点" },
    { label: "安全节点", value: "安全节点" },
    { label: "备份节点", value: "备份节点" },
  ]},
  { key: "spec", label: "申请规格", type: "text", required: true, placeholder: "例如: 8核16GB 500GB" },
  { key: "reason", label: "申请原因", type: "textarea" },
];

const quotaFields: FieldConfig[] = [
  { key: "name", label: "配额名称", type: "text", required: true },
  { key: "user", label: "用户", type: "text", required: true },
  { key: "maxCpu", label: "最大CPU(核)", type: "number", required: true },
  { key: "maxMemory", label: "最大内存(GB)", type: "number", required: true },
  { key: "maxStorage", label: "最大存储(GB)", type: "number", required: true },
  { key: "maxTasks", label: "最大任务数", type: "number", required: true },
  { key: "period", label: "周期", type: "select", required: true, options: [
    { label: "每日", value: "每日" },
    { label: "每周", value: "每周" },
    { label: "每月", value: "每月" },
    { label: "每季度", value: "每季度" },
    { label: "每年", value: "每年" },
  ]},
];

const scheduleFields: FieldConfig[] = [
  { key: "name", label: "策略名称", type: "text", required: true },
  { key: "strategy", label: "调度策略", type: "select", required: true, options: [
    { label: "Fair Share", value: "Fair Share" },
    { label: "Priority", value: "Priority" },
    { label: "Round Robin", value: "Round Robin" },
    { label: "FIFO", value: "FIFO" },
    { label: "Backfill", value: "Backfill" },
    { label: "Gang Scheduling", value: "Gang Scheduling" },
  ]},
  { key: "priority", label: "优先级", type: "select", required: true, options: [
    { label: "紧急", value: "紧急" },
    { label: "高", value: "高" },
    { label: "中", value: "中" },
    { label: "低", value: "低" },
  ]},
  { key: "description", label: "描述", type: "textarea" },
];

const statusColor: Record<string, string> = {
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "闲置": "bg-slate-50 text-slate-600 border-slate-200",
  "待释放": "bg-amber-50 text-amber-700 border-amber-100",
  "已释放": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function SecretResourcePool() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [ranking, setRanking] = useState<UsageRanking[]>(initialRanking);
  const [requests, setRequests] = useState<ResourceRequest[]>(initialRequests);
  const [quotas, setQuotas] = useState<QuotaPolicy[]>(initialQuotas);
  const [schedules, setSchedules] = useState<SchedulePolicy[]>(initialSchedules);

  const [search, setSearch] = useState("");
  const [quotaSearch, setQuotaSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogType, setDialogType] = useState<"resource" | "request" | "quota" | "schedule">("resource");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<"resource" | "request" | "quota" | "schedule">("resource");

  const filtered = resources.filter((r) => r.name.includes(search) || r.id.includes(search));
  const filteredQuotas = quotas.filter((q) => q.name.includes(quotaSearch) || q.user.includes(quotaSearch));

  const openDialog = (type: typeof dialogType, mode: typeof dialogMode, item?: any) => {
    setDialogType(type);
    setDialogMode(mode);
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const openDrawer = (type: typeof drawerType, item: any) => {
    setDrawerType(type);
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const handleResourceSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newResource: Resource = {
        id: `RP-${String(resources.length + 1).padStart(3, "0")}`,
        ...data,
        cpu: 0,
        memory: 0,
        storage: 0,
        status: "闲置",
        usage: 0,
      };
      setResources([...resources, newResource]);
    } else if (dialogMode === "edit" && selectedItem) {
      setResources(resources.map(r => r.id === selectedItem.id ? { ...r, ...data } : r));
    }
  };

  const handleRequestSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newRequest: ResourceRequest = {
        id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
        ...data,
        time: new Date().toLocaleString("zh-CN"),
        status: "pending",
      };
      setRequests([...requests, newRequest]);
    }
  };

  const handleQuotaSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newQuota: QuotaPolicy = {
        id: `QP-${String(quotas.length + 1).padStart(3, "0")}`,
        ...data,
      };
      setQuotas([...quotas, newQuota]);
    } else if (dialogMode === "edit" && selectedItem) {
      setQuotas(quotas.map(q => q.id === selectedItem.id ? { ...q, ...data } : q));
    }
  };

  const handleScheduleSubmit = (data: any) => {
    if (dialogMode === "create") {
      const newSchedule: SchedulePolicy = {
        id: `SP-${String(schedules.length + 1).padStart(3, "0")}`,
        ...data,
        enabled: true,
      };
      setSchedules([...schedules, newSchedule]);
    } else if (dialogMode === "edit" && selectedItem) {
      setSchedules(schedules.map(s => s.id === selectedItem.id ? { ...s, ...data } : s));
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    switch (dialogType) {
      case "resource": setResources(resources.filter(r => r.id !== selectedItem.id)); break;
      case "request": setRequests(requests.filter(r => r.id !== selectedItem.id)); break;
      case "quota": setQuotas(quotas.filter(q => q.id !== selectedItem.id)); break;
      case "schedule": setSchedules(schedules.filter(s => s.id !== selectedItem.id)); break;
    }
    setDialogOpen(false);
  };

  const approveRequest = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
  };

  const rejectRequest = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: "rejected" as const } : r));
  };

  const releaseResource = (id: string) => {
    setResources(resources.map(r => {
      if (r.id !== id) return r;
      return { ...r, status: "待释放" as const, cpu: 0, memory: 0, usage: 0 };
    }));
  };

  const recycleResource = (id: string) => {
    setResources(resources.map(r => {
      if (r.id !== id) return r;
      return { ...r, status: "已释放" as const, cpu: 0, memory: 0, storage: 0, usage: 0 };
    }));
  };

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const getDialogFields = () => {
    switch (dialogType) {
      case "resource": return resourceFields;
      case "request": return requestFields;
      case "quota": return quotaFields;
      case "schedule": return scheduleFields;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "resource": return "资源";
      case "request": return "资源申请";
      case "quota": return "配额策略";
      case "schedule": return "调度策略";
    }
  };

  const getDrawerFields = () => {
    switch (drawerType) {
      case "resource":
        return [
          { key: "id", label: "资源ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "type", label: "类型", type: "badge" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "cpu", label: "已用CPU", type: "text" as const },
          { key: "totalCpu", label: "总CPU", type: "text" as const },
          { key: "memory", label: "已用内存", type: "text" as const },
          { key: "totalMemory", label: "总内存", type: "text" as const },
          { key: "storage", label: "已用存储", type: "text" as const },
          { key: "totalStorage", label: "总存储", type: "text" as const },
          { key: "owner", label: "负责人", type: "text" as const },
          { key: "usage", label: "利用率", type: "text" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
      case "request":
        return [
          { key: "id", label: "申请ID", type: "text" as const },
          { key: "user", label: "申请人", type: "text" as const },
          { key: "type", label: "资源类型", type: "badge" as const },
          { key: "spec", label: "规格", type: "text" as const },
          { key: "time", label: "申请时间", type: "date" as const },
          { key: "status", label: "状态", type: "badge" as const },
          { key: "reason", label: "原因", type: "text" as const },
        ];
      case "quota":
        return [
          { key: "id", label: "配额ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "user", label: "用户", type: "text" as const },
          { key: "maxCpu", label: "最大CPU", type: "text" as const },
          { key: "maxMemory", label: "最大内存", type: "text" as const },
          { key: "maxStorage", label: "最大存储", type: "text" as const },
          { key: "maxTasks", label: "最大任务数", type: "text" as const },
          { key: "period", label: "周期", type: "badge" as const },
        ];
      case "schedule":
        return [
          { key: "id", label: "策略ID", type: "text" as const },
          { key: "name", label: "名称", type: "text" as const },
          { key: "strategy", label: "策略", type: "badge" as const },
          { key: "priority", label: "优先级", type: "badge" as const },
          { key: "enabled", label: "状态", type: "badge" as const },
          { key: "description", label: "描述", type: "text" as const },
        ];
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">资源与调度</h1>
          <p className="text-sm text-gray-500 mt-1.5">资源池、配额策略、调度策略管理</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={() => openDialog("resource", "create")}>
          <Plus className="mr-2 h-4 w-4" />申请资源
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Server className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">资源总数</p><p className="text-lg font-bold">{resources.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">总CPU</p><p className="text-lg font-bold">{resources.reduce((s, r) => s + r.totalCpu, 0)}核</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><MemoryStick className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总内存</p><p className="text-lg font-bold">{resources.reduce((s, r) => s + r.totalMemory, 0)}GB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><HardDrive className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">总存储</p><p className="text-lg font-bold">{(resources.reduce((s, r) => s + r.totalStorage, 0) / 1024).toFixed(1)}TB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-cyan-600" /><div><p className="text-sm text-gray-500">平均利用率</p><p className="text-lg font-bold">{Math.round(resources.reduce((s, r) => s + r.usage, 0) / resources.length)}%</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources"><Server className="h-4 w-4 mr-1" />资源管理</TabsTrigger>
          <TabsTrigger value="ranking"><TrendingUp className="h-4 w-4 mr-1" />使用排行</TabsTrigger>
          <TabsTrigger value="approval"><FileCheck className="h-4 w-4 mr-1" />申请审批</TabsTrigger>
          <TabsTrigger value="quotas"><SlidersHorizontal className="h-4 w-4 mr-1" />配额策略</TabsTrigger>
          <TabsTrigger value="schedules"><Settings className="h-4 w-4 mr-1" />调度策略</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索资源名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Card key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.id} | {r.type}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[r.status]}`}>{r.status}</span>
                  </div>
                  {r.type !== "存储池" && (
                    <>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>CPU</span><span>{r.cpu}/{r.totalCpu}核</span></div>
                          <Progress value={(r.cpu / r.totalCpu) * 100} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>内存</span><span>{r.memory}/{r.totalMemory}GB</span></div>
                          <Progress value={(r.memory / r.totalMemory) * 100} className="h-1.5" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1"><span>存储</span><span>{r.storage}/{r.totalStorage}GB</span></div>
                    <Progress value={(r.storage / r.totalStorage) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">负责人: {r.owner}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" onClick={() => openDrawer("resource", r)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" onClick={() => openDialog("resource", "edit", r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="释放资源" onClick={() => releaseResource(r.id)}><RotateCcw className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="回收资源" onClick={() => recycleResource(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["排名", "用户", "执行任务数", "CPU使用时长(小时)", "内存使用时长(小时)", "综合评分"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {ranking.map((u) => (
                  <TableRow key={u.user} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${u.rank === 1 ? "bg-amber-100 text-amber-700" : u.rank === 2 ? "bg-gray-200 text-gray-700" : u.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{u.rank}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{u.user}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.tasks}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.cpuHours}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.memoryHours}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={u.rank === 1 ? 100 : u.rank === 2 ? 70 : u.rank === 3 ? 50 : 25} className="h-1.5 w-16" />
                        <span className="text-xs">{u.rank === 1 ? "高" : u.rank === 2 ? "中高" : "中"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">共 {requests.length} 条申请记录</p>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("request", "create")}><Plus className="w-4 h-4" />提交申请</Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["申请ID", "申请人", "资源类型", "申请规格", "申请时间", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{req.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{req.user}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{req.type}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{req.spec}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{req.time}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === "approved" ? "bg-emerald-50 text-emerald-700" : req.status === "pending" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                        {req.status === "approved" ? "已通过" : req.status === "pending" ? "待审批" : "已驳回"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("request", req)}><Eye className="w-4 h-4" /></Button>
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" className="h-7 text-xs bg-emerald-600" onClick={() => approveRequest(req.id)}><FileCheck className="h-3 w-3 mr-1" />通过</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectRequest(req.id)}>驳回</Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("request", "delete", req)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="quotas" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索配额..." className="pl-9" value={quotaSearch} onChange={(e) => setQuotaSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("quota", "create")}><Plus className="w-4 h-4" />新建配额</Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>配额ID</TableHead><TableHead>名称</TableHead><TableHead>用户</TableHead>
                  <TableHead>最大CPU</TableHead><TableHead>最大内存</TableHead><TableHead>最大存储</TableHead>
                  <TableHead>最大任务</TableHead><TableHead>周期</TableHead><TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotas.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.id}</TableCell>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>{q.user}</TableCell>
                    <TableCell>{q.maxCpu}核</TableCell>
                    <TableCell>{q.maxMemory}GB</TableCell>
                    <TableCell>{q.maxStorage}GB</TableCell>
                    <TableCell>{q.maxTasks}</TableCell>
                    <TableCell><Badge variant="outline">{q.period}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("quota", q)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("quota", "edit", q)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("quota", "delete", q)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">共 {schedules.length} 条调度策略</p>
            <Button variant="outline" className="gap-2" onClick={() => openDialog("schedule", "create")}><Plus className="w-4 h-4" />新建策略</Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>策略ID</TableHead><TableHead>名称</TableHead><TableHead>调度策略</TableHead>
                  <TableHead>优先级</TableHead><TableHead>状态</TableHead><TableHead>描述</TableHead><TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="outline">{s.strategy}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{s.priority}</Badge></TableCell>
                    <TableCell>{s.enabled ? <Badge className="bg-green-50 text-green-700">已启用</Badge> : <Badge className="bg-gray-50 text-gray-700">已禁用</Badge>}</TableCell>
                    <TableCell className="text-xs text-gray-500">{s.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer("schedule", s)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog("schedule", "edit", s)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${s.enabled ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`} onClick={() => toggleSchedule(s.id)}>
                          {s.enabled ? <Zap className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => openDialog("schedule", "delete", s)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={dialogOpen && dialogMode !== "delete"}
        onOpenChange={setDialogOpen}
        title={getDialogTitle()}
        fields={getDialogFields()}
        data={selectedItem}
        onSubmit={(data) => {
          switch (dialogType) {
            case "resource": handleResourceSubmit(data); break;
            case "request": handleRequestSubmit(data); break;
            case "quota": handleQuotaSubmit(data); break;
            case "schedule": handleScheduleSubmit(data); break;
          }
        }}
        mode={dialogMode}
      />

      {dialogMode === "delete" && dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />确认删除
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                确定要删除 <strong>{selectedItem?.name || selectedItem?.id}</strong> 吗？此操作不可撤销。
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerType === "resource" ? "资源详情" : drawerType === "request" ? "申请详情" : drawerType === "quota" ? "配额详情" : "策略详情"}
        data={drawerItem || {}}
        fields={getDrawerFields()}
        onEdit={() => {
          setDrawerOpen(false);
          openDialog(drawerType, "edit", drawerItem);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          openDialog(drawerType, "delete", drawerItem);
        }}
      />
    </div>
  );
}
