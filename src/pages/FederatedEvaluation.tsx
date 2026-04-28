import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Play,
  Pause,
  BarChart3,
  CheckCircle2,
  Activity,
  Users,
  GitCompare,
  TrendingUp,
  Award,
  Pencil,
} from "lucide-react";

interface EvaluationTask {
  id: string;
  name: string;
  model: string;
  evaluationType: string;
  status: string;
  auc: number;
  ks: number;
  psi: number;
  accuracy: number;
  participants: number;
  createdTime: string;
}

const initialTasks: EvaluationTask[] = [
  {
    id: "FEV-2024-001",
    name: "信用评分模型交叉验证",
    model: "联邦逻辑回归_v2.1",
    evaluationType: "cross_validation",
    status: "completed",
    auc: 0.956,
    ks: 0.482,
    psi: 0.023,
    accuracy: 0.923,
    participants: 4,
    createdTime: "2024-04-10 09:30",
  },
  {
    id: "FEV-2024-002",
    name: "反欺诈模型Holdout测试",
    model: "联邦XGBoost_v1.8",
    evaluationType: "holdout",
    status: "running",
    auc: 0.0,
    ks: 0.0,
    psi: 0.0,
    accuracy: 0.0,
    participants: 3,
    createdTime: "2024-04-15 10:00",
  },
  {
    id: "FEV-2024-003",
    name: "推荐系统联邦评估",
    model: "联邦神经网络_v3.0",
    evaluationType: "federated",
    status: "pending",
    auc: 0.0,
    ks: 0.0,
    psi: 0.0,
    accuracy: 0.0,
    participants: 5,
    createdTime: "2024-04-16 08:00",
  },
  {
    id: "FEV-2024-004",
    name: "医疗影像分类评估",
    model: "联邦CNN_v1.2",
    evaluationType: "cross_validation",
    status: "completed",
    auc: 0.891,
    ks: 0.356,
    psi: 0.041,
    accuracy: 0.845,
    participants: 6,
    createdTime: "2024-04-12 14:00",
  },
  {
    id: "FEV-2024-005",
    name: "营销响应模型评估",
    model: "联邦LightGBM_v2.0",
    evaluationType: "holdout",
    status: "completed",
    auc: 0.934,
    ks: 0.421,
    psi: 0.018,
    accuracy: 0.912,
    participants: 4,
    createdTime: "2024-04-18 11:00",
  },
  {
    id: "FEV-2024-006",
    name: "风控模型联邦验证",
    model: "联邦逻辑回归_v2.1",
    evaluationType: "federated",
    status: "failed",
    auc: 0.0,
    ks: 0.0,
    psi: 0.0,
    accuracy: 0.0,
    participants: 3,
    createdTime: "2024-04-20 09:00",
  },
];

const statusColor: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: "已完成",
    running: "进行中",
    pending: "待执行",
    failed: "失败",
  };
  return map[status] || status;
};

const evalTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    cross_validation: "交叉验证",
    holdout: "留出法",
    federated: "联邦评估",
  };
  return map[type] || type;
};

export default function FederatedEvaluation() {
  const [tasks, setTasks] = useState<EvaluationTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("tasks");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<EvaluationTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((d) => {
      const matchesSearch =
        d.name.includes(search) || d.id.includes(search) || d.model.includes(search);
      const matchesStatus = statusFilter ? d.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const completedTasks = tasks.filter((d) => d.status === "completed");
  const avgAuc = completedTasks.length
    ? (completedTasks.reduce((sum, t) => sum + t.auc, 0) / completedTasks.length).toFixed(3)
    : "0.000";

  const fields: FieldConfig[] = [
    { key: "name", label: "评估名称", type: "text", required: true },
    {
      key: "model",
      label: "评估模型",
      type: "select",
      options: [
        { label: "联邦逻辑回归_v2.1", value: "联邦逻辑回归_v2.1" },
        { label: "联邦XGBoost_v1.8", value: "联邦XGBoost_v1.8" },
        { label: "联邦神经网络_v3.0", value: "联邦神经网络_v3.0" },
        { label: "联邦CNN_v1.2", value: "联邦CNN_v1.2" },
        { label: "联邦LightGBM_v2.0", value: "联邦LightGBM_v2.0" },
      ],
    },
    {
      key: "evaluationType",
      label: "评估类型",
      type: "select",
      options: [
        { label: "交叉验证", value: "cross_validation" },
        { label: "留出法", value: "holdout" },
        { label: "联邦评估", value: "federated" },
      ],
    },
    {
      key: "status",
      label: "状态",
      type: "select",
      options: [
        { label: "待执行", value: "pending" },
        { label: "进行中", value: "running" },
        { label: "已完成", value: "completed" },
        { label: "失败", value: "failed" },
      ],
    },
    { key: "participants", label: "参与方数量", type: "number" },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newTask: EvaluationTask = {
        id: `FEV-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        model: data.model || "联邦逻辑回归_v2.1",
        evaluationType: data.evaluationType || "cross_validation",
        status: data.status || "pending",
        auc: 0,
        ks: 0,
        psi: 0,
        accuracy: 0,
        participants: Number(data.participants) || 3,
        createdTime: new Date().toISOString().replace("T", " ").slice(0, 16),
      };
      setTasks((prev) => [newTask, ...prev]);
    } else if (dialogMode === "edit" && selectedTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                ...data,
                participants: Number(data.participants) || t.participants,
              }
            : t
        )
      );
    }
  };

  const handleDelete = () => {
    if (selectedTask) {
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setDrawerOpen(false);
    }
  };

  const openCreate = () => {
    setSelectedTask(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const openEdit = (task: EvaluationTask) => {
    setSelectedTask(task);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const openDelete = (task: EvaluationTask) => {
    setSelectedTask(task);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const openDrawer = (task: EvaluationTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleRun = (task: EvaluationTask) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== task.id) return t;
        if (t.status === "pending" || t.status === "failed") {
          return { ...t, status: "running" };
        }
        if (t.status === "running") {
          return {
            ...t,
            status: "completed",
            auc: 0.85 + Math.random() * 0.12,
            ks: 0.3 + Math.random() * 0.2,
            psi: Math.random() * 0.05,
            accuracy: 0.82 + Math.random() * 0.1,
          };
        }
        return t;
      })
    );
  };

  const detailFields = [
    { key: "id", label: "评估ID" },
    { key: "name", label: "评估名称" },
    { key: "model", label: "评估模型", type: "badge" as const },
    { key: "evaluationType", label: "评估类型", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "auc", label: "AUC" },
    { key: "ks", label: "KS值" },
    { key: "psi", label: "PSI" },
    { key: "accuracy", label: "准确率" },
    { key: "participants", label: "参与方数量" },
    { key: "createdTime", label: "创建时间", type: "date" as const },
  ];

  const getMetricBarColor = (value: number) => {
    if (value >= 0.9) return "bg-emerald-500";
    if (value >= 0.8) return "bg-blue-500";
    if (value >= 0.7) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联邦评估</h1>
          <p className="text-sm text-gray-500 mt-1.5">联邦学习模型评估与性能分析</p>
        </div>
        <Button
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建评估
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">进行中评估</p>
              <p className="text-lg font-bold">
                {tasks.filter((d) => d.status === "running").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-500">已完成评估</p>
              <p className="text-lg font-bold">
                {tasks.filter((d) => d.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">平均AUC</p>
              <p className="text-lg font-bold">{avgAuc}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-sm text-gray-500">参与方数量</p>
              <p className="text-lg font-bold">
                {Math.max(...tasks.map((t) => t.participants), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            评估任务
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <Activity className="w-4 h-4" />
            评估指标
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompare className="w-4 h-4" />
            对比分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="搜索评估名称、ID或模型"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-gray-200 bg-white"
            >
              <option value="">全部状态</option>
              <option value="pending">待执行</option>
              <option value="running">进行中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {[
                    "评估ID",
                    "评估名称",
                    "模型",
                    "评估类型",
                    "AUC",
                    "KS",
                    "PSI",
                    "准确率",
                    "状态",
                    "参与方",
                    "操作",
                  ].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredTasks.map((d) => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.model}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant="outline" className="text-xs">
                        {evalTypeLabel(d.evaluationType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold">
                      {d.status === "completed" ? d.auc.toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      {d.status === "completed" ? d.ks.toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      {d.status === "completed" ? d.psi.toFixed(3) : "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">
                      {d.status === "completed" ? `${(d.accuracy * 100).toFixed(1)}%` : "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge className={statusColor[d.status]}>{statusLabel(d.status)}</Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{d.participants}方</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDrawer(d)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRun(d)}>
                          {d.status === "running" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => openDelete(d)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {completedTasks.map((task) => (
              <Card key={task.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{task.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {task.model}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">AUC</span>
                      <span className="font-semibold">{task.auc.toFixed(3)}</span>
                    </div>
                    <Progress value={task.auc * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">KS值</span>
                      <span className="font-semibold">{task.ks.toFixed(3)}</span>
                    </div>
                    <Progress value={task.ks * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">准确率</span>
                      <span className="font-semibold">{(task.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={task.accuracy * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">PSI</span>
                      <span className="font-semibold">{task.psi.toFixed(3)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getMetricBarColor(1 - task.psi * 10)}`}
                        style={{ width: `${Math.min((1 - task.psi) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {task.participants} 参与方
                    <span className="mx-1">·</span>
                    <TrendingUp className="h-3 w-3" />
                    {evalTypeLabel(task.evaluationType)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {completedTasks.length === 0 && (
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">暂无已完成评估指标</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compare" className="mt-4 space-y-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {[
                    "评估名称",
                    "模型",
                    "评估类型",
                    "AUC",
                    "KS",
                    "PSI",
                    "准确率",
                    "参与方",
                    "综合评分",
                  ].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {completedTasks
                  .sort((a, b) => b.auc - a.auc)
                  .map((task, idx) => {
                    const score = (task.auc * 0.4 + task.ks * 0.3 + task.accuracy * 0.3) * 100;
                    return (
                      <TableRow key={task.id} className="hover:bg-indigo-50/30 transition-colors">
                        <TableCell className="py-3.5 px-4 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <Award className="h-4 w-4 text-amber-500" />}
                            {task.name}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-xs">{task.model}</TableCell>
                        <TableCell className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {evalTypeLabel(task.evaluationType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">
                          {task.auc.toFixed(3)}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">{task.ks.toFixed(3)}</TableCell>
                        <TableCell className="py-3.5 px-4">{task.psi.toFixed(3)}</TableCell>
                        <TableCell className="py-3.5 px-4 font-semibold">
                          {(task.accuracy * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-sm">{task.participants}方</TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={score} className="h-1.5" />
                            </div>
                            <span className="text-xs font-semibold">{score.toFixed(1)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {completedTasks.length > 0 && (
              <>
                <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">AUC排名</h4>
                  <div className="space-y-2">
                    {[...completedTasks]
                      .sort((a, b) => b.auc - a.auc)
                      .slice(0, 3)
                      .map((task, idx) => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                idx === 0
                                  ? "bg-amber-500"
                                  : idx === 1
                                    ? "bg-gray-400"
                                    : "bg-orange-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-sm truncate max-w-[140px]">{task.name}</span>
                          </div>
                          <span className="text-sm font-semibold">{task.auc.toFixed(3)}</span>
                        </div>
                      ))}
                  </div>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">准确率排名</h4>
                  <div className="space-y-2">
                    {[...completedTasks]
                      .sort((a, b) => b.accuracy - a.accuracy)
                      .slice(0, 3)
                      .map((task, idx) => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                idx === 0
                                  ? "bg-amber-500"
                                  : idx === 1
                                    ? "bg-gray-400"
                                    : "bg-orange-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-sm truncate max-w-[140px]">{task.name}</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {(task.accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">KS值排名</h4>
                  <div className="space-y-2">
                    {[...completedTasks]
                      .sort((a, b) => b.ks - a.ks)
                      .slice(0, 3)
                      .map((task, idx) => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                idx === 0
                                  ? "bg-amber-500"
                                  : idx === 1
                                    ? "bg-gray-400"
                                    : "bg-orange-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-sm truncate max-w-[140px]">{task.name}</span>
                          </div>
                          <span className="text-sm font-semibold">{task.ks.toFixed(3)}</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </>
            )}
          </div>

          {completedTasks.length === 0 && (
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <GitCompare className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">暂无已完成评估可供对比</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CrudDialog
        key={selectedTask ? `eval-${selectedTask.id}` : "eval-new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="联邦评估任务"
        fields={fields}
        data={selectedTask || undefined}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="联邦评估任务详情"
        data={selectedTask || {}}
        fields={detailFields}
        onEdit={
          selectedTask
            ? () => {
                setDrawerOpen(false);
                openEdit(selectedTask);
              }
            : undefined
        }
        onDelete={
          selectedTask
            ? () => {
                setDrawerOpen(false);
                openDelete(selectedTask);
              }
            : undefined
        }
      />
    </div>
  );
}
