import { useState, useRef, useEffect } from "react";
import {
  Rocket, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight,
  Server, FileCode, Tag, Settings, RefreshCw, Upload, Eye,
  Copy, Terminal, X, AlertTriangle, Pencil, Trash2, ChevronLeft,
  ScrollText, RotateCcw, Play, Loader2, Check, AlertCircle,
  Network, Boxes, Flame, UserCircle, FileCheck, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ─── Types ─── */
interface DeployTask {
  id: string;
  contract: string;
  version: string;
  network: string;
  channel: string;
  targetNodes: string[];
  status: string;
  stage: string;
  deployTime: string;
  deployer: string;
  txHash: string;
  gasUsed: number;
  gasLimit: number;
  duration: string;
  nodeStatuses: Record<string, string>;
}

interface DeployLog {
  time: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface AvailableContract {
  id: string;
  name: string;
  version: string;
  language: string;
  abi: { name: string; type: string }[];
}

interface NetworkConfig {
  name: string;
  channels: string[];
}

/* ─── Mock Data ─── */
const availableContracts: AvailableContract[] = [
  { id: "CON-001", name: "数据资产存证合约", version: "v2.0.0", language: "Solidity", abi: [
    { name: "owner", type: "address" },
    { name: "tokenName", type: "string" },
    { name: "initialSupply", type: "uint256" },
  ]},
  { id: "CON-002", name: "数据授权合约", version: "v1.1.0", language: "Solidity", abi: [
    { name: "admin", type: "address" },
    { name: "duration", type: "uint256" },
  ]},
  { id: "CON-003", name: "数据溯源合约", version: "v1.2.0", language: "Go", abi: [
    { name: "registryAddress", type: "address" },
    { name: "version", type: "string" },
  ]},
  { id: "CON-004", name: "供应链金融合约", version: "v1.0.0", language: "Solidity", abi: [
    { name: "bank", type: "address" },
    { name: "interestRate", type: "uint256" },
    { name: "minAmount", type: "uint256" },
  ]},
  { id: "CON-005", name: "存证公证合约", version: "v1.1.0", language: "Solidity", abi: [
    { name: "notary", type: "address" },
    { name: "fee", type: "uint256" },
  ]},
];

const networks: NetworkConfig[] = [
  { name: "金融联盟链", channels: ["金融交易通道", "资产清算通道", "风控通道"] },
  { name: "政务数据链", channels: ["政务数据共享通道", "身份认证通道", "电子证照通道"] },
  { name: "医疗数据链", channels: ["医疗数据通道", "医保结算通道", "药品溯源通道"] },
  { name: "供应链金融链", channels: ["供应链金融通道", "应收账款通道", "保理融资通道"] },
  { name: "存证公证链", channels: ["存证公证通道", "电子合同通道", "司法存证通道"] },
];

const availableNodes = [
  "共识节点-01", "共识节点-02", "共识节点-03", "共识节点-04",
  "共识节点-05", "共识节点-06", "共识节点-07", "共识节点-08",
  "共识节点-09", "共识节点-10", "共识节点-11", "共识节点-12",
];

const deployerAccounts = [
  { id: "ACC-001", name: "管理员", address: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b" },
  { id: "ACC-002", name: "部署员A", address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" },
  { id: "ACC-003", name: "部署员B", address: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b" },
];

/* ─── Mock Deploy Tasks ─── */
const initialDeployTasksData: DeployTask[] = [
  { id: "DP-001", contract: "数据资产存证合约", version: "v2.0.0", network: "金融联盟链", channel: "金融交易通道", targetNodes: ["共识节点-01", "共识节点-02", "共识节点-03"], status: "success", stage: "completed", deployTime: "2025-04-15 10:30:00", deployer: "管理员", txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c", gasUsed: 2300000, gasLimit: 3000000, duration: "15s", nodeStatuses: { "共识节点-01": "success", "共识节点-02": "success", "共识节点-03": "success" } },
  { id: "DP-002", contract: "数据授权合约", version: "v1.1.0", network: "政务数据链", channel: "政务数据共享通道", targetNodes: ["共识节点-04", "共识节点-05"], status: "success", stage: "completed", deployTime: "2025-03-20 14:00:00", deployer: "管理员", txHash: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e", gasUsed: 1800000, gasLimit: 2500000, duration: "12s", nodeStatuses: { "共识节点-04": "success", "共识节点-05": "success" } },
  { id: "DP-003", contract: "数据溯源合约", version: "v1.2.0", network: "医疗数据链", channel: "医疗数据通道", targetNodes: ["共识节点-06", "共识节点-07", "共识节点-08"], status: "failed", stage: "failed", deployTime: "2025-04-01 09:15:00", deployer: "管理员", txHash: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a", gasUsed: 1200000, gasLimit: 2000000, duration: "8s", nodeStatuses: { "共识节点-06": "failed", "共识节点-07": "failed", "共识节点-08": "failed" } },
  { id: "DP-004", contract: "供应链金融合约", version: "v1.0.0", network: "供应链金融链", channel: "供应链金融通道", targetNodes: ["共识节点-09"], status: "pending", stage: "deploying", deployTime: "2025-04-25 11:00:00", deployer: "管理员", txHash: "-", gasUsed: 0, gasLimit: 5000000, duration: "-", nodeStatuses: { "共识节点-09": "pending" } },
  { id: "DP-005", contract: "存证公证合约", version: "v1.1.0", network: "存证公证链", channel: "存证公证通道", targetNodes: ["共识节点-10", "共识节点-11"], status: "success", stage: "completed", deployTime: "2025-04-10 16:45:00", deployer: "管理员", txHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e", gasUsed: 2100000, gasLimit: 2800000, duration: "18s", nodeStatuses: { "共识节点-10": "success", "共识节点-11": "success" } },
];

/* ─── Helper Components ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    success: { text: "成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    pending: { text: "部署中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    rolling_back: { text: "回滚中", class: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    rolled_back: { text: "已回滚", class: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
  };
  const c = config[status] || config.pending;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

function StageBadge({ stage }: { stage: string }) {
  const config: Record<string, { text: string; class: string; icon: React.ReactNode }> = {
    compiling: { text: "编译中", class: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <FileCode className="w-3 h-3" /> },
    deploying: { text: "部署中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Rocket className="w-3 h-3" /> },
    confirming: { text: "确认中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Clock className="w-3 h-3" /> },
    completed: { text: "已完成", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3 h-3" /> },
    "rolling-back": { text: "回滚中", class: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: <RotateCcw className="w-3 h-3" /> },
  };
  const c = config[stage] || config.deploying;
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.icon}{c.text}</span>;
}

function NodeStatusBadge({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === "pending") return <Clock className="w-4 h-4 text-blue-500" />;
  if (status === "rolling_back") return <RotateCcw className="w-4 h-4 text-orange-500" />;
  return <AlertCircle className="w-4 h-4 text-gray-400" />;
}

function GasBar({ used, limit }: { used: number; limit: number }) {
  if (!limit) return <span className="text-xs text-slate-400">-</span>;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500">{pct}%</span>
    </div>
  );
}

/* ─── Wizard Steps ─── */
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              i < current ? "bg-emerald-500 text-white" :
              i === current ? "bg-indigo-600 text-white" :
              "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            )}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-xs mt-1 font-medium",
              i === current ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
            )}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 transition-colors",
              i < current ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function ContractDeploy() {
  const [tasks, setTasks] = useState<DeployTask[]>(initialDeployTasksData);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<DeployTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedContract, setSelectedContract] = useState<AvailableContract | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [constructorArgs, setConstructorArgs] = useState<Record<string, string>>({});
  const [gasLimit, setGasLimit] = useState(3000000);
  const [selectedDeployer, setSelectedDeployer] = useState("");
  const [checks, setChecks] = useState({ balance: true, permission: true, networkStatus: true });
  const [wizardSubmitting, setWizardSubmitting] = useState(false);

  // Logs state
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsTask, setLogsTask] = useState<DeployTask | null>(null);
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Rollback state
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackTask, setRollbackTask] = useState<DeployTask | null>(null);
  const [rollbackProgress, setRollbackProgress] = useState(0);
  const [rollbackResult, setRollbackResult] = useState<"" | "success" | "partial" | "failed">("");

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

  const openWizard = () => {
    setWizardOpen(true);
    setWizardStep(0);
    setSelectedContract(null);
    setSelectedNetwork("");
    setSelectedChannel("");
    setSelectedNodes([]);
    setConstructorArgs({});
    setGasLimit(3000000);
    setSelectedDeployer("");
    setChecks({ balance: true, permission: true, networkStatus: true });
    setWizardSubmitting(false);
  };

  const openLogs = (task: DeployTask) => {
    setLogsTask(task);
    setLogsOpen(true);
    // Generate mock logs based on task status
    const mockLogs: DeployLog[] = [
      { time: "10:00:00", message: `开始部署: ${task.contract} ${task.version} → ${task.network}/${task.channel}`, type: "info" },
      { time: "10:00:01", message: "编译合约代码...", type: task.stage === "completed" || task.status === "success" ? "success" : task.status === "failed" ? "error" : "info" },
      { time: "10:00:03", message: "打包部署包...", type: task.stage === "completed" || task.status === "success" ? "success" : task.status === "failed" ? "error" : "info" },
      { time: "10:00:05", message: "签名交易...", type: task.stage === "completed" || task.status === "success" ? "success" : task.status === "failed" ? "error" : "info" },
      { time: "10:00:08", message: "提交到排序服务...", type: task.stage === "completed" || task.status === "success" ? "success" : task.status === "failed" ? "error" : "info" },
    ];
    if (task.status === "failed") {
      mockLogs.push(
        { time: "10:00:10", message: "等待区块确认...", type: "error" },
        { time: "10:00:12", message: "部署失败！Gas不足，无法完成交易确认", type: "error" },
        { time: "10:00:12", message: "故障排查建议: 1) 提高Gas限制 2) 检查账户余额 3) 确认网络状态正常", type: "warning" }
      );
    } else if (task.status === "success" || task.stage === "completed") {
      mockLogs.push(
        { time: "10:00:12", message: "等待区块确认...", type: "success" },
        { time: "10:00:15", message: `部署成功！合约地址: ${task.txHash.slice(0, 42)}...`, type: "success" }
      );
    } else {
      mockLogs.push(
        { time: "10:00:10", message: "等待区块确认...", type: "info" },
        { time: "10:00:10", message: "正在部署到目标节点...", type: "info" }
      );
    }
    setLogs(mockLogs);
  };

  const openRollback = (task: DeployTask) => {
    setRollbackTask(task);
    setRollbackOpen(true);
    setRollbackProgress(0);
    setRollbackResult("");
  };

  const executeRollback = () => {
    setRollbackProgress(0);
    const interval = setInterval(() => {
      setRollbackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const result = Math.random() > 0.3 ? "success" : Math.random() > 0.5 ? "partial" : "failed";
          setRollbackResult(result);
          if (result === "success" || result === "partial") {
            setTasks(prev => prev.map(t => t.id === rollbackTask?.id ? { ...t, status: "rolled_back", stage: "rolling-back" } : t));
          }
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const copyTxHash = (hash: string) => {
    if (hash && hash !== "-") navigator.clipboard.writeText(hash);
  };

  const canProceedStep1 = selectedContract !== null;
  const canProceedStep2 = selectedNetwork && selectedChannel && selectedNodes.length > 0;
  const canProceedStep3 = selectedDeployer && gasLimit > 0;
  const criticalChecksPass = checks.balance && checks.permission && checks.networkStatus;

  const handleWizardNext = () => {
    if (wizardStep === 3) {
      setWizardSubmitting(true);
      setTimeout(() => {
        const newTask: DeployTask = {
          id: Date.now().toString(36).toUpperCase(),
          contract: selectedContract!.name,
          version: selectedContract!.version,
          network: selectedNetwork,
          channel: selectedChannel,
          targetNodes: selectedNodes,
          status: "pending",
          stage: "deploying",
          deployTime: new Date().toLocaleString("zh-CN"),
          deployer: deployerAccounts.find(a => a.id === selectedDeployer)?.name || "管理员",
          txHash: "-",
          gasUsed: 0,
          gasLimit,
          duration: "-",
          nodeStatuses: Object.fromEntries(selectedNodes.map(n => [n, "pending"])),
        };
        setTasks(prev => [newTask, ...prev]);
        setWizardSubmitting(false);
        setWizardOpen(false);
      }, 1500);
    } else {
      setWizardStep(wizardStep + 1);
    }
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const stats = [
    { label: "部署任务", value: tasks.length, icon: <Rocket className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "部署成功", value: tasks.filter(d => d.status === "success").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "部署失败", value: tasks.filter(d => d.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
    { label: "进行中", value: tasks.filter(d => d.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
  ];

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
      { label: "已回滚", value: "rolled_back" },
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
    { key: "stage", label: "部署阶段", type: "badge" as const },
    { key: "deployTime", label: "部署时间", type: "date" as const },
    { key: "deployer", label: "部署人", type: "text" as const },
    { key: "txHash", label: "交易哈希", type: "text" as const },
    { key: "gasUsed", label: "Gas消耗", type: "text" as const },
    { key: "gasLimit", label: "Gas限制", type: "text" as const },
    { key: "duration", label: "耗时", type: "text" as const },
  ];

  const wizardSteps = ["选择合约", "网络与节点", "配置参数", "确认部署"];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">合约安装部署</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">部署智能合约到目标网络与节点，管理部署任务状态</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={openWizard}>
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
              {["任务ID", "合约名称", "版本", "目标网络", "通道", "目标节点", "阶段", "状态", "Gas使用", "耗时", "部署时间", "操作"].map(h => (
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 dark:text-slate-400">{task.targetNodes.length}个节点</span>
                    <div className="flex gap-0.5 ml-1">
                      {task.targetNodes.map(n => (
                        <NodeStatusBadge key={n} status={task.nodeStatuses[n] || "pending"} />
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><StageBadge stage={task.stage} /></td>
                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-3">
                  <GasBar used={task.gasUsed} limit={task.gasLimit} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.duration}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.deployTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openLogs(task)} title="部署日志">
                      <ScrollText className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openView(task)} title="查看">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(task)} title="编辑">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {(task.status === "success" || task.status === "failed") && (
                      <Button size="sm" variant="ghost" onClick={() => openRollback(task)} title="回滚">
                        <RotateCcw className="w-4 h-4 text-orange-500" />
                      </Button>
                    )}
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

      {/* Deploy Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              部署向导
            </DialogTitle>
          </DialogHeader>

          <StepIndicator steps={wizardSteps} current={wizardStep} />

          {wizardStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">选择要部署的合约</h3>
              <div className="grid gap-3">
                {availableContracts.map(contract => (
                  <div
                    key={contract.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedContract?.id === contract.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                    onClick={() => setSelectedContract(contract)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{contract.name}</div>
                          <div className="text-xs text-slate-500">{contract.language}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{contract.version}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">目标网络</label>
                <Select value={selectedNetwork} onValueChange={(v) => { setSelectedNetwork(v); setSelectedChannel(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择网络" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map(n => (
                      <SelectItem key={n.name} value={n.name}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNetwork && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">通道</label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择通道" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.find(n => n.name === selectedNetwork)?.channels.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">目标节点</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg border-slate-200 dark:border-slate-700">
                  {availableNodes.map(node => (
                    <label key={node} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNodes.includes(node)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNodes(prev => [...prev, node]);
                          } else {
                            setSelectedNodes(prev => prev.filter(n => n !== node));
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{node}</span>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-slate-500">已选择 {selectedNodes.length} 个节点</div>
              </div>
            </div>
          )}

          {wizardStep === 2 && selectedContract && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">构造函数参数</label>
                <div className="space-y-2">
                  {selectedContract.abi.map(arg => (
                    <div key={arg.name} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-32">{arg.name}</span>
                      <Badge variant="secondary" className="text-xs">{arg.type}</Badge>
                      <Input
                        placeholder={`输入 ${arg.type} 值`}
                        value={constructorArgs[arg.name] || ""}
                        onChange={e => setConstructorArgs(prev => ({ ...prev, [arg.name]: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gas 限制</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={gasLimit}
                    onChange={e => setGasLimit(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => setGasLimit(Math.floor(Math.random() * 2000000) + 2000000)}>
                    <Flame className="w-4 h-4 mr-1" /> 自动估算
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">部署账户</label>
                <Select value={selectedDeployer} onValueChange={setSelectedDeployer}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部署账户" />
                  </SelectTrigger>
                  <SelectContent>
                    {deployerAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.address.slice(0, 20)}...)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">预部署检查</label>
                <div className="space-y-2">
                  {[
                    { key: "balance", label: "账户余额检查", desc: "确保账户有足够余额支付Gas费用" },
                    { key: "permission", label: "权限检查", desc: "验证部署账户具有部署权限" },
                    { key: "networkStatus", label: "网络状态", desc: "检查目标网络连接正常" },
                  ].map(check => (
                    <div key={check.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{check.label}</div>
                        <div className="text-xs text-slate-500">{check.desc}</div>
                      </div>
                      <button
                        onClick={() => setChecks(prev => ({ ...prev, [check.key]: !prev[check.key as keyof typeof prev] }))}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          checks[check.key as keyof typeof checks] ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                        )}
                      >
                        {checks[check.key as keyof typeof checks] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && selectedContract && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">部署摘要</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">合约:</div>
                  <div className="font-medium">{selectedContract.name} {selectedContract.version}</div>
                  <div className="text-slate-500">网络/通道:</div>
                  <div className="font-medium">{selectedNetwork} / {selectedChannel}</div>
                  <div className="text-slate-500">目标节点:</div>
                  <div className="font-medium">{selectedNodes.join(", ")}</div>
                  <div className="text-slate-500">Gas限制:</div>
                  <div className="font-medium">{gasLimit.toLocaleString()}</div>
                  <div className="text-slate-500">部署账户:</div>
                  <div className="font-medium">{deployerAccounts.find(a => a.id === selectedDeployer)?.name}</div>
                </div>
              </div>

              {!criticalChecksPass && (
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-300">警告: 部分预部署检查未通过</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">建议解决检查项问题后再继续部署，以避免部署失败。</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {wizardStep > 0 && (
                <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
                </Button>
              )}
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={
                (wizardStep === 0 && !canProceedStep1) ||
                (wizardStep === 1 && !canProceedStep2) ||
                (wizardStep === 2 && !canProceedStep3) ||
                (wizardStep === 3 && (!criticalChecksPass || wizardSubmitting))
              }
              onClick={handleWizardNext}
            >
              {wizardSubmitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> 部署中...</> :
               wizardStep === 3 ? <><Rocket className="w-4 h-4 mr-1" /> 确认部署</> :
               <>下一步 <ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deployment Logs Dialog */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              部署日志 - {logsTask?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm max-h-[60vh] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-slate-500">[{log.time}]</span>{" "}
                <span className={cn(
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "error" ? "text-red-400" :
                  log.type === "warning" ? "text-amber-400" :
                  "text-slate-300"
                )}>{log.message}</span>
                {log.type === "success" && <span className="text-emerald-400 ml-1">✓</span>}
                {log.type === "error" && <span className="text-red-400 ml-1">✗</span>}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              回滚部署
            </DialogTitle>
          </DialogHeader>

          {rollbackResult === "" && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">影响分析</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <div>• 合约: {rollbackTask?.contract} {rollbackTask?.version}</div>
                  <div>• 网络: {rollbackTask?.network}/{rollbackTask?.channel}</div>
                  <div>• 节点: {rollbackTask?.targetNodes.join(", ")}</div>
                  <div>• 交易哈希将被标记为已回滚</div>
                  <div>• 依赖此合约的业务流程可能受影响</div>
                </div>
              </div>

              {rollbackProgress > 0 && rollbackProgress < 100 && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">回滚进度</div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${rollbackProgress}%` }} />
                  </div>
                  <div className="text-xs text-slate-500">{rollbackProgress}%</div>
                </div>
              )}
            </div>
          )}

          {rollbackResult !== "" && (
            <div className={cn(
              "p-4 rounded-lg border text-center",
              rollbackResult === "success" ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" :
              rollbackResult === "partial" ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" :
              "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            )}>
              <div className={cn(
                "text-lg font-bold mb-1",
                rollbackResult === "success" ? "text-emerald-700 dark:text-emerald-300" :
                rollbackResult === "partial" ? "text-amber-700 dark:text-amber-300" :
                "text-red-700 dark:text-red-300"
              )}>
                {rollbackResult === "success" ? "回滚成功" :
                 rollbackResult === "partial" ? "部分回滚" :
                 "回滚失败"}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {rollbackResult === "success" ? "所有节点已成功回滚到部署前状态。" :
                 rollbackResult === "partial" ? "部分节点回滚失败，请手动检查并处理。" :
                 "回滚操作失败，请检查网络状态后重试。"}
              </div>
            </div>
          )}

          <DialogFooter>
            {rollbackResult === "" && rollbackProgress === 0 && (
              <>
                <Button variant="outline" onClick={() => setRollbackOpen(false)}>取消</Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={executeRollback}>
                  <RotateCcw className="w-4 h-4 mr-1" /> 确认回滚
                </Button>
              </>
            )}
            {rollbackResult !== "" && (
              <Button variant="outline" onClick={() => setRollbackOpen(false)}>关闭</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedTask ? selectedTask.contract : "部署任务"}
        fields={formFields}
        data={selectedTask ? { ...selectedTask, targetNodes: selectedTask.targetNodes.join(", ") } : undefined}
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
