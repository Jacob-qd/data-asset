import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Search, Plus, Eye, Trash2, Play, Pause, Download, BrainCircuit, Users, CheckCircle2, BarChart3, Copy, FileText, RotateCcw, Pencil } from "lucide-react";

interface FLTask {
  id: string;
  name: string;
  algorithmType: string;
  strategy: string;
  parties: number;
  status: string;
  progress: number;
  round: number;
  totalRounds: number;
  accuracy: string;
  createdAt: string;
  lastUpdate: string;
  participants: string[];
}

interface Model {
  id: string;
  name: string;
  task: string;
  accuracy: string;
  auc: string;
  f1: string;
  status: string;
  createdAt: string;
}

interface Party {
  id: string;
  name: string;
  type: string;
  role: string;
  contact: string;
  status: string;
  createdAt: string;
}

const initialTasks: FLTask[] = [
  { id: "FL-2024-001", name: "信用评分联邦训练", algorithmType: "横向联邦学习", strategy: "FedAvg", parties: 4, status: "completed", progress: 100, round: 100, totalRounds: 100, accuracy: "0.923", createdAt: "2024-04-10 09:00", lastUpdate: "2024-04-10 14:30", participants: ["银行A", "银行B", "银行C", "协调方"] },
  { id: "FL-2024-002", name: "反欺诈模型训练", algorithmType: "纵向联邦学习", strategy: "SecureAggregation", parties: 3, status: "running", progress: 65, round: 65, totalRounds: 100, accuracy: "0.876", createdAt: "2024-04-15 10:00", lastUpdate: "2024-04-15 12:30", participants: ["银行A", "电商A", "协调方"] },
  { id: "FL-2024-003", name: "推荐系统联邦训练", algorithmType: "联邦迁移学习", strategy: "FedProx", parties: 5, status: "pending", progress: 0, round: 0, totalRounds: 80, accuracy: "-", createdAt: "2024-04-16 08:00", lastUpdate: "-", participants: ["平台A", "平台B", "平台C", "平台D", "协调方"] },
  { id: "FL-2024-004", name: "医疗影像分类", algorithmType: "横向联邦学习", strategy: "FedAvg+Momentum", parties: 6, status: "failed", progress: 23, round: 23, totalRounds: 150, accuracy: "0.712", createdAt: "2024-04-12 14:00", lastUpdate: "2024-04-12 15:20", participants: ["医院A", "医院B", "医院C", "医院D", "医院E", "协调方"] },
  { id: "FL-2024-005", name: "舆情情感分析", algorithmType: "横向联邦学习", strategy: "FedAvg", parties: 4, status: "completed", progress: 100, round: 50, totalRounds: 50, accuracy: "0.891", createdAt: "2024-04-08 09:00", lastUpdate: "2024-04-08 12:00", participants: ["媒体A", "媒体B", "媒体C", "协调方"] },
  { id: "FL-2024-006", name: "保险定价模型", algorithmType: "纵向联邦学习", strategy: "SecureAggregation", parties: 3, status: "running", progress: 45, round: 45, totalRounds: 80, accuracy: "0.834", createdAt: "2024-04-18 10:00", lastUpdate: "2024-04-18 11:30", participants: ["保险A", "医院A", "协调方"] },
  { id: "FL-2024-007", name: "供应链预测", algorithmType: "联邦迁移学习", strategy: "FedProx", parties: 5, status: "pending", progress: 0, round: 0, totalRounds: 120, accuracy: "-", createdAt: "2024-04-19 08:00", lastUpdate: "-", participants: ["厂商A", "厂商B", "物流A", "零售A", "协调方"] },
  { id: "FL-2024-008", name: "风控模型训练", algorithmType: "横向联邦学习", strategy: "SCAFFOLD", parties: 4, status: "completed", progress: 100, round: 80, totalRounds: 80, accuracy: "0.912", createdAt: "2024-04-05 14:00", lastUpdate: "2024-04-05 18:00", participants: ["金融A", "金融B", "金融C", "协调方"] },
  { id: "FL-2024-009", name: "药物分子筛选", algorithmType: "纵向联邦学习", strategy: "FedAvg+Momentum", parties: 3, status: "paused", progress: 60, round: 60, totalRounds: 100, accuracy: "0.765", createdAt: "2024-04-20 09:00", lastUpdate: "2024-04-20 11:00", participants: ["药企A", "研究院A", "协调方"] },
  { id: "FL-2024-010", name: "客户流失预测", algorithmType: "横向联邦学习", strategy: "FedAvg", parties: 3, status: "completed", progress: 100, round: 60, totalRounds: 60, accuracy: "0.887", createdAt: "2024-04-07 10:00", lastUpdate: "2024-04-07 14:30", participants: ["电信A", "电信B", "协调方"] },
];

const initialModels: Model[] = [
  { id: "MD-001", name: "信用评分模型_v1.0", task: "FL-2024-001", accuracy: "0.923", auc: "0.956", f1: "0.891", status: "published", createdAt: "2024-04-10 14:30" },
  { id: "MD-002", name: "反欺诈模型_v0.8", task: "FL-2024-002", accuracy: "0.876", auc: "0.923", f1: "0.845", status: "training", createdAt: "2024-04-15 12:30" },
  { id: "MD-003", name: "情感分析模型_v1.2", task: "FL-2024-005", accuracy: "0.891", auc: "0.934", f1: "0.867", status: "published", createdAt: "2024-04-08 12:00" },
  { id: "MD-004", name: "风控模型_v2.0", task: "FL-2024-008", accuracy: "0.912", auc: "0.948", f1: "0.903", status: "published", createdAt: "2024-04-05 18:00" },
  { id: "MD-005", name: "客户流失模型_v1.1", task: "FL-2024-010", accuracy: "0.887", auc: "0.921", f1: "0.856", status: "published", createdAt: "2024-04-07 14:30" },
  { id: "MD-006", name: "保险定价模型_v0.5", task: "FL-2024-006", accuracy: "0.834", auc: "0.895", f1: "0.812", status: "training", createdAt: "2024-04-18 11:30" },
];

const initialParties: Party[] = [
  { id: "P-001", name: "银行A", type: "数据参与方", role: "商业银行", contact: "zhangsan@banka.com", status: "active", createdAt: "2024-01-15 09:00" },
  { id: "P-002", name: "银行B", type: "数据参与方", role: "商业银行", contact: "lisi@bankb.com", status: "active", createdAt: "2024-01-15 10:00" },
  { id: "P-003", name: "银行C", type: "数据参与方", role: "商业银行", contact: "wangwu@bankc.com", status: "active", createdAt: "2024-01-16 09:00" },
  { id: "P-004", name: "电商A", type: "数据参与方", role: "电商平台", contact: "zhaoliu@eshop.com", status: "active", createdAt: "2024-01-20 14:00" },
  { id: "P-005", name: "平台A", type: "数据参与方", role: "互联网平台", contact: "sunba@platform.com", status: "active", createdAt: "2024-02-01 08:00" },
  { id: "P-006", name: "平台B", type: "数据参与方", role: "互联网平台", contact: "zhoujiu@platform.com", status: "active", createdAt: "2024-02-01 09:00" },
  { id: "P-007", name: "医院A", type: "数据参与方", role: "三甲医院", contact: "wushi@hospital.com", status: "active", createdAt: "2024-02-10 10:00" },
  { id: "P-008", name: "医院B", type: "数据参与方", role: "三甲医院", contact: "zhengshi@hospital.com", status: "active", createdAt: "2024-02-10 11:00" },
  { id: "P-009", name: "保险A", type: "数据参与方", role: "保险公司", contact: "liushi@insurance.com", status: "active", createdAt: "2024-02-15 09:00" },
  { id: "P-010", name: "协调方", type: "协调节点", role: "联邦学习协调器", contact: "admin@coordinator.com", status: "active", createdAt: "2024-01-01 00:00" },
];

const statusColor: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
};

const partyStatusColor: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: "已完成",
    running: "训练中",
    pending: "待执行",
    paused: "已暂停",
    failed: "失败",
    published: "已发布",
    training: "训练中",
    active: "正常",
    inactive: "停用",
  };
  return map[status] || status;
};

export default function FederatedLearning() {
  const [tasks, setTasks] = useState<FLTask[]>(initialTasks);
  const [models, setModels] = useState<Model[]>(initialModels);
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [taskSearch, setTaskSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<FLTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [modelDialogMode, setModelDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelDrawerOpen, setModelDrawerOpen] = useState(false);

  const [partyDialogOpen, setPartyDialogOpen] = useState(false);
  const [partyDialogMode, setPartyDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partyDrawerOpen, setPartyDrawerOpen] = useState(false);

  const filteredTasks = tasks.filter(d => d.name.includes(taskSearch) || d.id.includes(taskSearch));
  const filteredModels = models.filter(m => m.name.includes(modelSearch) || m.id.includes(modelSearch));
  const filteredParties = parties.filter(p => p.name.includes(partySearch) || p.id.includes(partySearch) || p.role.includes(partySearch));

  const taskFields: FieldConfig[] = [
    { key: "name", label: "任务名称", type: "text", required: true },
    { key: "algorithmType", label: "算法类型", type: "select", options: [
      { label: "横向联邦学习", value: "横向联邦学习" },
      { label: "纵向联邦学习", value: "纵向联邦学习" },
      { label: "联邦迁移学习", value: "联邦迁移学习" },
      { label: "联邦强化学习", value: "联邦强化学习" },
      { label: "联邦元学习", value: "联邦元学习" },
      { label: "分层联邦学习", value: "分层联邦学习" },
    ]},
    { key: "strategy", label: "聚合策略", type: "select", options: [
      { label: "FedAvg", value: "FedAvg" },
      { label: "FedProx", value: "FedProx" },
      { label: "SecureAggregation", value: "SecureAggregation" },
      { label: "FedAvg+Momentum", value: "FedAvg+Momentum" },
      { label: "SCAFFOLD", value: "SCAFFOLD" },
      { label: "FedOpt", value: "FedOpt" },
    ]},
    { key: "participants", label: "参与方", type: "multiselect", options: parties.filter(p => p.status === "active").map(p => ({ label: `${p.name} (${p.role})`, value: p.name })), required: true },
    { key: "totalRounds", label: "训练轮数", type: "number" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "待执行", value: "pending" },
      { label: "训练中", value: "running" },
      { label: "已暂停", value: "paused" },
      { label: "已完成", value: "completed" },
      { label: "失败", value: "failed" },
      { label: "已取消", value: "cancelled" },
    ]},
  ];

  const modelFields: FieldConfig[] = [
    { key: "name", label: "模型名称", type: "text", required: true },
    { key: "task", label: "关联任务", type: "select", options: tasks.map(t => ({ label: `${t.name} (${t.id})`, value: t.id })) },
    { key: "accuracy", label: "准确率", type: "text" },
    { key: "auc", label: "AUC", type: "text" },
    { key: "f1", label: "F1值", type: "text" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "已发布", value: "published" },
      { label: "训练中", value: "training" },
      { label: "待评估", value: "pending_eval" },
      { label: "已归档", value: "archived" },
      { label: "已废弃", value: "deprecated" },
      { label: "验证中", value: "validating" },
    ]},
  ];

  const partyFields: FieldConfig[] = [
    { key: "name", label: "参与方名称", type: "text", required: true },
    { key: "type", label: "类型", type: "select", options: [
      { label: "数据参与方", value: "数据参与方" },
      { label: "协调节点", value: "协调节点" },
    ]},
    { key: "role", label: "角色", type: "text", required: true },
    { key: "contact", label: "联系人", type: "text" },
    { key: "status", label: "状态", type: "select", options: [
      { label: "正常", value: "active" },
      { label: "停用", value: "inactive" },
    ]},
  ];

  const handleTaskSubmit = (data: Record<string, any>) => {
    const participantNames = (data.participants || "").split(",").filter(Boolean);
    const partyCount = participantNames.length;

    if (taskDialogMode === "create") {
      const newTask: FLTask = {
        id: `FL-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        algorithmType: data.algorithmType || "横向联邦学习",
        strategy: data.strategy || "FedAvg",
        parties: partyCount,
        status: data.status || "pending",
        progress: 0,
        round: 0,
        totalRounds: Number(data.totalRounds) || 100,
        accuracy: "-",
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        lastUpdate: "-",
        participants: participantNames,
      };
      setTasks(prev => [newTask, ...prev]);
    } else if (taskDialogMode === "edit" && selectedTask) {
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
        ...t,
        ...data,
        parties: partyCount,
        participants: participantNames,
      } : t));
    }
  };

  const handleTaskDelete = () => {
    if (selectedTask) {
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setTaskDrawerOpen(false);
    }
  };

  const handleModelSubmit = (data: Record<string, any>) => {
    if (modelDialogMode === "create") {
      const newModel: Model = {
        id: `MD-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        task: data.task || tasks[0]?.id || "",
        accuracy: data.accuracy || "-",
        auc: data.auc || "-",
        f1: data.f1 || "-",
        status: data.status || "training",
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setModels(prev => [newModel, ...prev]);
    } else if (modelDialogMode === "edit" && selectedModel) {
      setModels(prev => prev.map(m => m.id === selectedModel.id ? { ...m, ...data } : m));
    }
  };

  const handleModelDelete = () => {
    if (selectedModel) {
      setModels(prev => prev.filter(m => m.id !== selectedModel.id));
      setModelDrawerOpen(false);
    }
  };

  const handlePartySubmit = (data: Record<string, any>) => {
    if (partyDialogMode === "create") {
      const newParty: Party = {
        id: `P-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        type: data.type || "数据参与方",
        role: data.role || "",
        contact: data.contact || "",
        status: data.status || "active",
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setParties(prev => [newParty, ...prev]);
    } else if (partyDialogMode === "edit" && selectedParty) {
      setParties(prev => prev.map(p => p.id === selectedParty.id ? { ...p, ...data } : p));
    }
  };

  const handlePartyDelete = () => {
    if (selectedParty) {
      setParties(prev => prev.filter(p => p.id !== selectedParty.id));
      setPartyDrawerOpen(false);
    }
  };

  const openTaskCreate = () => {
    setSelectedTask(null);
    setTaskDialogMode("create");
    setTaskDialogOpen(true);
  };

  const openTaskEdit = (task: FLTask) => {
    setSelectedTask(task);
    setTaskDialogMode("edit");
    setTaskDialogOpen(true);
  };

  const openTaskDelete = (task: FLTask) => {
    setSelectedTask(task);
    setTaskDialogMode("delete");
    setTaskDialogOpen(true);
  };

  const openTaskDrawer = (task: FLTask) => {
    setSelectedTask(task);
    setTaskDrawerOpen(true);
  };

  const openModelCreate = () => {
    setSelectedModel(null);
    setModelDialogMode("create");
    setModelDialogOpen(true);
  };

  const openModelEdit = (model: Model) => {
    setSelectedModel(model);
    setModelDialogMode("edit");
    setModelDialogOpen(true);
  };

  const openModelDelete = (model: Model) => {
    setSelectedModel(model);
    setModelDialogMode("delete");
    setModelDialogOpen(true);
  };

  const openModelDrawer = (model: Model) => {
    setSelectedModel(model);
    setModelDrawerOpen(true);
  };

  const openPartyCreate = () => {
    setSelectedParty(null);
    setPartyDialogMode("create");
    setPartyDialogOpen(true);
  };

  const openPartyEdit = (party: Party) => {
    setSelectedParty(party);
    setPartyDialogMode("edit");
    setPartyDialogOpen(true);
  };

  const openPartyDelete = (party: Party) => {
    setSelectedParty(party);
    setPartyDialogMode("delete");
    setPartyDialogOpen(true);
  };

  const openPartyDrawer = (party: Party) => {
    setSelectedParty(party);
    setPartyDrawerOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus = t.status === "pending" ? "running" :
        t.status === "running" ? "paused" :
        t.status === "paused" ? "running" :
        t.status === "failed" ? "pending" :
        t.status === "completed" ? "pending" : t.status;
      return { ...t, status: nextStatus };
    }));
  };

  const handleCopy = (task: FLTask) => {
    const newTask: FLTask = {
      ...task,
      id: `FL-${Date.now().toString(36).toUpperCase()}`,
      name: `${task.name} (复制)`,
      status: "pending",
      progress: 0,
      round: 0,
      accuracy: "-",
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastUpdate: "-",
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const taskDetailFields = [
    { key: "id", label: "任务ID", type: "text" as const },
    { key: "name", label: "任务名称", type: "text" as const },
    { key: "algorithmType", label: "算法类型", type: "badge" as const },
    { key: "strategy", label: "聚合策略", type: "text" as const },
    { key: "parties", label: "参与方数", type: "text" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "progress", label: "进度", type: "text" as const },
    { key: "round", label: "当前轮次", type: "text" as const },
    { key: "totalRounds", label: "总轮次", type: "text" as const },
    { key: "accuracy", label: "准确率", type: "text" as const },
    { key: "createdAt", label: "创建时间", type: "date" as const },
    { key: "lastUpdate", label: "最后更新", type: "date" as const },
    { key: "participants", label: "参与机构", type: "list" as const },
  ];

  const modelDetailFields = [
    { key: "id", label: "模型ID", type: "text" as const },
    { key: "name", label: "模型名称", type: "text" as const },
    { key: "task", label: "关联任务", type: "text" as const },
    { key: "accuracy", label: "准确率", type: "text" as const },
    { key: "auc", label: "AUC", type: "text" as const },
    { key: "f1", label: "F1值", type: "text" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "createdAt", label: "创建时间", type: "date" as const },
  ];

  const partyDetailFields = [
    { key: "id", label: "参与方ID", type: "text" as const },
    { key: "name", label: "参与方名称", type: "text" as const },
    { key: "type", label: "类型", type: "badge" as const },
    { key: "role", label: "角色", type: "text" as const },
    { key: "contact", label: "联系人", type: "text" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "createdAt", label: "创建时间", type: "date" as const },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联邦学习</h1>
          <p className="text-sm text-gray-500 mt-1.5">分布式模型训练，原始数据不出域</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={activeTab === "models" ? openModelCreate : activeTab === "parties" ? openPartyCreate : openTaskCreate}>
          <Plus className="mr-2 h-4 w-4" />{activeTab === "models" ? "新建模型" : activeTab === "parties" ? "新建参与方" : "新建训练任务"}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BrainCircuit className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">训练任务</p><p className="text-lg font-bold">{tasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{tasks.filter(d => d.status === "completed").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Users className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">参与机构</p><p className="text-lg font-bold">{parties.filter(p => p.status === "active").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">最佳准确率</p><p className="text-lg font-bold">92.3%</p></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><BrainCircuit className="w-4 h-4" />训练任务</TabsTrigger>
          <TabsTrigger value="models" className="gap-2"><FileText className="w-4 h-4" />模型仓库</TabsTrigger>
          <TabsTrigger value="parties" className="gap-2"><Users className="w-4 h-4" />参与方管理</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={taskSearch} onChange={e => setTaskSearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "名称", "算法类型", "聚合策略", "参与方", "进度", "轮次", "准确率", "状态", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredTasks.map(d => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.algorithmType}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.strategy}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{d.parties}方</TableCell>
                    <TableCell className="py-3.5 px-4"><div className="w-16"><Progress value={d.progress} className="h-1.5" /><span className="text-xs">{d.progress}%</span></div></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.round}/{d.totalRounds}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{d.accuracy}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={statusColor[d.status]}>{statusLabel(d.status)}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTaskDrawer(d)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTaskEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>{d.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                        {d.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}><RotateCcw className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openTaskDelete(d)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索模型名称" value={modelSearch} onChange={e => setModelSearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["模型ID", "名称", "关联任务", "准确率", "AUC", "F1值", "状态", "创建时间", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredModels.map(m => (
                  <TableRow key={m.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs">{m.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{m.name}</TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs">{m.task}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{m.accuracy}</TableCell>
                    <TableCell className="py-3.5 px-4">{m.auc}</TableCell>
                    <TableCell className="py-3.5 px-4">{m.f1}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={m.status === "published" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}>{statusLabel(m.status)}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{m.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModelDrawer(m)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModelEdit(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openModelDelete(m)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="parties" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索参与方名称、ID或角色" value={partySearch} onChange={e => setPartySearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["参与方ID", "名称", "类型", "角色", "联系人", "状态", "创建时间", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredParties.map(p => (
                  <TableRow key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{p.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{p.type}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{p.role}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{p.contact}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={partyStatusColor[p.status]}>{statusLabel(p.status)}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{p.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPartyDrawer(p)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPartyEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => openPartyDelete(p)}><Trash2 className="h-4 w-4" /></Button>
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
        key={selectedTask ? `task-${selectedTask.id}` : "task-new"}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        title="联邦学习任务"
        fields={taskFields}
        data={selectedTask ? { ...selectedTask, participants: selectedTask.participants.join(",") } : undefined}
        mode={taskDialogMode}
        onSubmit={handleTaskSubmit}
        onDelete={handleTaskDelete}
      />

      <CrudDialog
        key={selectedModel ? `model-${selectedModel.id}` : "model-new"}
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        title="联邦学习模型"
        fields={modelFields}
        data={selectedModel || undefined}
        mode={modelDialogMode}
        onSubmit={handleModelSubmit}
        onDelete={handleModelDelete}
      />

      <CrudDialog
        key={selectedParty ? `party-${selectedParty.id}` : "party-new"}
        open={partyDialogOpen}
        onOpenChange={setPartyDialogOpen}
        title="参与方"
        fields={partyFields}
        data={selectedParty || undefined}
        mode={partyDialogMode}
        onSubmit={handlePartySubmit}
        onDelete={handlePartyDelete}
      />

      <DetailDrawer
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
        title="联邦学习任务详情"
        data={selectedTask || {}}
        fields={taskDetailFields}
        onEdit={() => { if (selectedTask) { setTaskDrawerOpen(false); openTaskEdit(selectedTask); } }}
        onDelete={() => { if (selectedTask) { setTaskDrawerOpen(false); openTaskDelete(selectedTask); } }}
      />

      <DetailDrawer
        open={modelDrawerOpen}
        onOpenChange={setModelDrawerOpen}
        title="联邦学习模型详情"
        data={selectedModel || {}}
        fields={modelDetailFields}
        onEdit={() => { if (selectedModel) { setModelDrawerOpen(false); openModelEdit(selectedModel); } }}
        onDelete={() => { if (selectedModel) { setModelDrawerOpen(false); openModelDelete(selectedModel); } }}
      />

      <DetailDrawer
        open={partyDrawerOpen}
        onOpenChange={setPartyDrawerOpen}
        title="参与方详情"
        data={selectedParty || {}}
        fields={partyDetailFields}
        onEdit={() => { if (selectedParty) { setPartyDrawerOpen(false); openPartyEdit(selectedParty); } }}
        onDelete={() => { if (selectedParty) { setPartyDrawerOpen(false); openPartyDelete(selectedParty); } }}
      />
    </div>
  );
}