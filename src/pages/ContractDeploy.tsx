import { useState } from "react";
import {
  Rocket, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight,
  Server, FileCode, Tag, Settings, RefreshCw, Upload, Eye,
  Copy, Terminal, X, AlertTriangle, Pencil, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */
interface DeployTask {
  id: string;
  contract: string;
  version: string;
  network: string;
  channel: string;
  targetNodes: string[];
  status: string;
  deployTime: string;
  deployer: string;
  txHash: string;
  gasUsed: string;
}

/* ─── Mock Deploy Tasks ─── */
const initialDeployTasksData: DeployTask[] = [
  { id: "DP-001", contract: "数据资产存证合约", version: "v2.0.0", network: "金融联盟链", channel: "金融交易通道", targetNodes: ["共识节点-01", "共识节点-02", "共识节点-03"], status: "success", deployTime: "2025-04-15 10:30:00", deployer: "管理员", txHash: "0x7a8b...c3d4", gasUsed: "0.0023 ETH" },
  { id: "DP-002", contract: "数据授权合约", version: "v1.1.0", network: "政务数据链", channel: "政务数据共享通道", targetNodes: ["共识节点-04", "共识节点-05"], status: "success", deployTime: "2025-03-20 14:00:00", deployer: "管理员", txHash: "0x9c1d...e2f3", gasUsed: "0.0018 ETH" },
  { id: "DP-003", contract: "数据溯源合约", version: "v1.2.0", network: "医疗数据链", channel: "医疗数据通道", targetNodes: ["共识节点-06", "共识节点-07", "共识节点-08"], status: "failed", deployTime: "2025-04-01 09:15:00", deployer: "管理员", txHash: "0x3e4f...a5b6", gasUsed: "0.0012 ETH" },
  { id: "DP-004", contract: "供应链金融合约", version: "v1.0.0", network: "供应链金融链", channel: "供应链金融通道", targetNodes: ["共识节点-09"], status: "pending", deployTime: "2025-04-25 11:00:00", deployer: "管理员", txHash: "-", gasUsed: "-" },
  { id: "DP-005", contract: "存证公证合约", version: "v1.1.0", network: "存证公证链", channel: "存证公证通道", targetNodes: ["共识节点-10", "共识节点-11"], status: "success", deployTime: "2025-04-10 16:45:00", deployer: "管理员", txHash: "0x1b2c...d3e4", gasUsed: "0.0021 ETH" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    success: { text: "成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    pending: { text: "部署中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[status] || config.pending;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

const formFields: FieldConfig[] = [
  { key: "id", label: "任务ID", type: "text", required: true, placeholder: "如 DP-006" },
  { key: "contract", label: "合约名称", type: "text", required: true },
  { key: "version", label: "版本", type: "text", required: true, placeholder: "如 v1.0.0" },
  { key: "network", label: "目标网络", type: "text", required: true },
  { key: "channel", label: "通道", type: "text", required: true },
  { key: "targetNodes", label: "目标节点", type: "text", required: true, placeholder: "用逗号分隔多个节点" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "成功", value: "success" },
    { label: "失败", value: "failed" },
    { label: "部署中", value: "pending" },
  ]},
  { key: "deployTime", label: "部署时间", type: "text", placeholder: "如 2025-04-15 10:30:00" },
  { key: "deployer", label: "部署人", type: "text" },
  { key: "txHash", label: "交易哈希", type: "text" },
  { key: "gasUsed", label: "Gas消耗", type: "text" },
];

const detailFields = [
  { key: "id", label: "任务ID", type: "text" as const },
  { key: "contract", label: "合约名称", type: "text" as const },
  { key: "version", label: "版本", type: "badge" as const },
  { key: "network", label: "目标网络", type: "text" as const },
  { key: "channel", label: "通道", type: "text" as const },
  { key: "targetNodes", label: "目标节点", type: "list" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "deployTime", label: "部署时间", type: "date" as const },
  { key: "deployer", label: "部署人", type: "text" as const },
  { key: "txHash", label: "交易哈希", type: "text" as const },
  { key: "gasUsed", label: "Gas消耗", type: "text" as const },
];

export default function ContractDeploy() {
  const [tasks, setTasks] = useState<DeployTask[]>(initialDeployTasksData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<DeployTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = tasks.filter(d => d.contract.includes(search) || d.network.includes(search) || d.id.includes(search));

  const openCreate = () => {
    setDialogMode("create");
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: DeployTask) => {
    setDialogMode("edit");
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const openView = (task: DeployTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const openDelete = (task: DeployTask) => {
    setDialogMode("delete");
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const processed = {
      ...data,
      targetNodes: typeof data.targetNodes === "string"
        ? data.targetNodes.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
        : data.targetNodes || [],
    };

    if (dialogMode === "create") {
      setTasks(prev => [...prev, processed as DeployTask]);
    } else if (dialogMode === "edit" && selectedTask) {
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? processed as DeployTask : t));
    }
  };

  const handleDelete = () => {
    if (selectedTask) {
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    }
  };

  const stats = [
    { label: "部署任务", value: tasks.length, icon: <Rocket className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "部署成功", value: tasks.filter(d => d.status === "success").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "部署失败", value: tasks.filter(d => d.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
    { label: "进行中", value: tasks.filter(d => d.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
  ];

  const dialogData = selectedTask
    ? { ...selectedTask, targetNodes: selectedTask.targetNodes.join(", ") }
    : undefined;

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约安装部署</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">部署智能合约到目标网络与节点，管理部署任务状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={openCreate}>
          <Rocket className="w-4 h-4" /> 部署合约
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="搜索合约/网络/通道" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setSearch("")}>
          <RefreshCw className="w-4 h-4" /> 刷新
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["任务ID", "合约名称", "版本", "目标网络", "通道", "目标节点", "状态", "部署时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr key={task.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{task.id}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{task.contract}</td>
                <td className="px-4 py-3"><Badge variant="outline">{task.version}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.network}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.channel}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.targetNodes.length}个节点</td>
                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.deployTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openView(task)} title="查看">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(task)} title="编辑">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDelete(task)} title="删除">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedTask ? selectedTask.contract : "部署任务"}
        fields={formFields}
        data={dialogData}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`部署详情 - ${selectedTask?.id || ""}`}
        data={selectedTask || {}}
        fields={detailFields}
        onEdit={selectedTask ? () => { setDrawerOpen(false); openEdit(selectedTask); } : undefined}
        onDelete={selectedTask ? () => { setDrawerOpen(false); openDelete(selectedTask); } : undefined}
      />
    </div>
  );
}
