import { useState } from "react";
import {
  Shield, Plus, Search, Users, Database,
  Clock, CheckCircle, Eye, Edit2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

interface SecretProject {
  id: string;
  name: string;
  description: string;
  algorithm: "MPC" | "HE" | "ZKP" | "TEE";
  status: "planning" | "running" | "completed" | "failed";
  creator: string;
  createTime: string;
  memberCount: number;
  dataSourceCount: number;
  taskCount: number;
}

const initialProjects: SecretProject[] = [
  { id: "SCP-2026-001", name: "联合风控建模", description: "多方安全计算联合信用评估模型训练", algorithm: "MPC", status: "running", creator: "张三", createTime: "2026-04-10", memberCount: 5, dataSourceCount: 3, taskCount: 12 },
  { id: "SCP-2026-002", name: "医疗数据融合", description: "同态加密医疗数据分析与统计", algorithm: "HE", status: "running", creator: "李四", createTime: "2026-04-08", memberCount: 8, dataSourceCount: 5, taskCount: 8 },
  { id: "SCP-2026-003", name: "身份隐私验证", description: "零知识证明身份验证系统", algorithm: "ZKP", status: "completed", creator: "王五", createTime: "2026-04-05", memberCount: 3, dataSourceCount: 2, taskCount: 6 },
  { id: "SCP-2026-004", name: "安全图像识别", description: "TEE环境图像隐私计算推理", algorithm: "TEE", status: "planning", creator: "赵六", createTime: "2026-04-15", memberCount: 4, dataSourceCount: 2, taskCount: 0 },
  { id: "SCP-2026-005", name: "跨机构统计", description: "MPC跨机构金融数据统计分析", algorithm: "MPC", status: "running", creator: "钱七", createTime: "2026-04-12", memberCount: 6, dataSourceCount: 4, taskCount: 15 },
  { id: "SCP-2026-006", name: "基因数据计算", description: "同态加密基因序列比对分析", algorithm: "HE", status: "failed", creator: "孙八", createTime: "2026-04-01", memberCount: 7, dataSourceCount: 3, taskCount: 4 },
  { id: "SCP-2026-007", name: "隐私投票系统", description: "零知识证明匿名投票", algorithm: "ZKP", status: "completed", creator: "周九", createTime: "2026-03-28", memberCount: 2, dataSourceCount: 1, taskCount: 3 },
  { id: "SCP-2026-008", name: "密钥管理优化", description: "TEE密钥安全生成与分发", algorithm: "TEE", status: "planning", creator: "吴十", createTime: "2026-04-18", memberCount: 3, dataSourceCount: 2, taskCount: 0 },
  { id: "SCP-2026-009", name: "供应链协同", description: "MPC供应链多方数据协同", algorithm: "MPC", status: "running", creator: "郑一", createTime: "2026-04-14", memberCount: 10, dataSourceCount: 6, taskCount: 20 },
  { id: "SCP-2026-010", name: "隐私推荐引擎", description: "同态加密推荐算法", algorithm: "HE", status: "running", creator: "冯二", createTime: "2026-04-11", memberCount: 4, dataSourceCount: 3, taskCount: 9 },
  { id: "SCP-2026-011", name: "年龄验证", description: "零知识证明年龄验证服务", algorithm: "ZKP", status: "completed", creator: "陈三", createTime: "2026-03-20", memberCount: 2, dataSourceCount: 1, taskCount: 2 },
  { id: "SCP-2026-012", name: "安全日志分析", description: "TEE日志隐私计算分析", algorithm: "TEE", status: "planning", creator: "褚四", createTime: "2026-04-19", memberCount: 3, dataSourceCount: 2, taskCount: 0 },
];

const algorithmColors: Record<string, string> = {
  MPC: "bg-blue-500/15 text-blue-500",
  HE: "bg-purple-500/15 text-purple-500",
  ZKP: "bg-emerald-500/15 text-emerald-500",
  TEE: "bg-amber-500/15 text-amber-500",
};

const algorithmLabels: Record<string, string> = {
  MPC: "安全多方计算", HE: "同态加密", ZKP: "零知识证明", TEE: "可信执行环境",
};

const statusOptions = [
  { label: "规划中", value: "planning" },
  { label: "进行中", value: "running" },
  { label: "已完成", value: "completed" },
  { label: "失败", value: "failed" },
];

const algorithmOptions = [
  { label: "安全多方计算", value: "MPC" },
  { label: "同态加密", value: "HE" },
  { label: "零知识证明", value: "ZKP" },
  { label: "可信执行环境", value: "TEE" },
];

const fields: FieldConfig[] = [
  { key: "name", label: "项目名称", type: "text", required: true },
  { key: "description", label: "项目描述", type: "textarea" },
  { key: "algorithm", label: "算法类型", type: "select", options: algorithmOptions, required: true },
  { key: "status", label: "状态", type: "select", options: statusOptions, required: true },
  { key: "creator", label: "创建者", type: "text", required: true },
  { key: "createTime", label: "创建时间", type: "text", required: true },
  { key: "memberCount", label: "成员数", type: "number", required: true },
  { key: "dataSourceCount", label: "数据源数", type: "number", required: true },
  { key: "taskCount", label: "任务数", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "项目ID" },
  { key: "name", label: "项目名称" },
  { key: "description", label: "项目描述" },
  { key: "algorithm", label: "算法类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "creator", label: "创建者" },
  { key: "createTime", label: "创建时间", type: "date" as const },
  { key: "memberCount", label: "成员数" },
  { key: "dataSourceCount", label: "数据源数" },
  { key: "taskCount", label: "任务数" },
];

export default function SecretProjects() {
  const [projects, setProjects] = useState<SecretProject[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [algoFilter, setAlgoFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedProject, setSelectedProject] = useState<SecretProject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchAlgo = algoFilter === "all" || p.algorithm === algoFilter;
    return matchSearch && matchStatus && matchAlgo;
  });

  const stats = [
    { label: "项目总数", value: projects.length, icon: Shield, color: "text-blue-500" },
    { label: "进行中", value: projects.filter((p) => p.status === "running").length, icon: Clock, color: "text-amber-500" },
    { label: "已完成", value: projects.filter((p) => p.status === "completed").length, icon: CheckCircle, color: "text-emerald-500" },
    { label: "今日新建", value: 2, icon: Plus, color: "text-purple-500" },
  ];

  const handleCreate = () => {
    setSelectedProject(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (project: SecretProject) => {
    setSelectedProject(project);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (project: SecretProject) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const handleDelete = (project: SecretProject) => {
    setSelectedProject(project);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newProject: SecretProject = {
        id: `SCP-${Date.now().toString(36).toUpperCase()}`,
        name: data.name || "",
        description: data.description || "",
        algorithm: data.algorithm || "MPC",
        status: data.status || "planning",
        creator: data.creator || "",
        createTime: data.createTime || new Date().toISOString().split("T")[0],
        memberCount: Number(data.memberCount) || 0,
        dataSourceCount: Number(data.dataSourceCount) || 0,
        taskCount: Number(data.taskCount) || 0,
      };
      setProjects([...projects, newProject]);
    } else if (dialogMode === "edit" && selectedProject) {
      const updated = projects.map((p) =>
        p.id === selectedProject.id
          ? {
              ...p,
              name: data.name || p.name,
              description: data.description || p.description,
              algorithm: data.algorithm || p.algorithm,
              status: data.status || p.status,
              creator: data.creator || p.creator,
              createTime: data.createTime || p.createTime,
              memberCount: Number(data.memberCount) ?? p.memberCount,
              dataSourceCount: Number(data.dataSourceCount) ?? p.dataSourceCount,
              taskCount: Number(data.taskCount) ?? p.taskCount,
            }
          : p
      );
      setProjects(updated);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
    }
  };

  const columns = [
    { key: "id", title: "项目ID", cell: (p: SecretProject) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: "name", title: "项目名称", cell: (p: SecretProject) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: "algorithm", title: "算法类型", cell: (p: SecretProject) => <Badge className={cn(algorithmColors[p.algorithm], "font-medium")}>{algorithmLabels[p.algorithm]}</Badge> },
    { key: "status", title: "状态", cell: (p: SecretProject) => <StatusTag status={p.status === "planning" ? "info" : p.status === "running" ? "warning" : p.status === "completed" ? "success" : "danger"} text={p.status === "planning" ? "规划中" : p.status === "running" ? "进行中" : p.status === "completed" ? "已完成" : "失败"} /> },
    { key: "members", title: "成员/数据源", cell: (p: SecretProject) => <div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.memberCount}</span><span className="flex items-center gap-1"><Database className="w-3 h-3" />{p.dataSourceCount}</span></div> },
    { key: "creator", title: "创建者", cell: (p: SecretProject) => <span className="text-xs text-slate-500">{p.creator}</span> },
    { key: "time", title: "创建时间", cell: (p: SecretProject) => <span className="text-xs text-slate-500">{p.createTime}</span> },
    { key: "actions", title: "操作", cell: (p: SecretProject) => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleView(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Eye className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  const selectedForDetail = selectedProject
    ? {
        ...selectedProject,
        algorithm: algorithmLabels[selectedProject.algorithm] || selectedProject.algorithm,
        status:
          selectedProject.status === "planning"
            ? "规划中"
            : selectedProject.status === "running"
            ? "进行中"
            : selectedProject.status === "completed"
            ? "已完成"
            : "失败",
      }
    : {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索项目ID或名称" className="pl-9 w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
            <option value="all">全部状态</option><option value="planning">规划中</option><option value="running">进行中</option><option value="completed">已完成</option><option value="failed">失败</option>
          </select>
          <select value={algoFilter} onChange={(e) => setAlgoFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600">
            <option value="all">全部算法</option><option value="MPC">MPC</option><option value="HE">HE</option><option value="ZKP">ZKP</option><option value="TEE">TEE</option>
          </select>
        </div>
        <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />新建项目</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} />
      </div>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="密态项目"
        fields={fields}
        data={selectedProject || {}}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="密态项目详情"
        data={selectedForDetail}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedProject) handleEdit(selectedProject);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedProject) handleDelete(selectedProject);
        }}
      />
    </div>
  );
}
