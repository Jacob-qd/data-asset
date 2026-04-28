import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Play,
  Pencil,
  Activity,
  CheckCircle2,
  BarChart3,
  Zap,
  BrainCircuit,
  FileText,
  Clock,
} from "lucide-react";

interface PredictionTask {
  id: string;
  name: string;
  model: string;
  dataset: string;
  status: string;
  accuracy: string;
  createdTime: string;
  description: string;
}

interface PredictionModel {
  id: string;
  name: string;
  type: string;
  version: string;
  accuracy: string;
  status: string;
  createdAt: string;
}

interface PredictionResult {
  id: string;
  taskName: string;
  model: string;
  dataset: string;
  result: string;
  accuracy: string;
  createdAt: string;
}

const initialTasks: PredictionTask[] = [
  {
    id: "PRED-2024-001",
    name: "信用评分批量预测",
    model: "credit_model_v3",
    dataset: "客户信用数据集_2024Q1",
    status: "completed",
    accuracy: "92.5",
    createdTime: "2024-04-10 09:30",
    description: "使用联邦信用评分模型对新增客户进行信用风险预测",
  },
  {
    id: "PRED-2024-002",
    name: "客户流失预警预测",
    model: "churn_predictor",
    dataset: "用户行为数据集_2024Q2",
    status: "running",
    accuracy: "-",
    createdTime: "2024-04-15 14:00",
    description: "基于联邦学习客户流失预测模型，识别高风险流失用户",
  },
  {
    id: "PRED-2024-003",
    name: "企业信贷风险评估",
    model: "risk_assessment",
    dataset: "企业经营数据集_A",
    status: "pending",
    accuracy: "-",
    createdTime: "2024-04-16 08:15",
    description: "多源企业数据联合风控评估预测任务",
  },
  {
    id: "PRED-2024-004",
    name: "欺诈交易实时检测",
    model: "credit_model_v3",
    dataset: "交易流水数据集_B",
    status: "completed",
    accuracy: "89.3",
    createdTime: "2024-04-12 11:20",
    description: "实时交易异常检测与欺诈风险预测",
  },
  {
    id: "PRED-2024-005",
    name: "保险产品推荐预测",
    model: "churn_predictor",
    dataset: "保险产品用户画像",
    status: "failed",
    accuracy: "-",
    createdTime: "2024-04-14 16:45",
    description: "个性化保险产品推荐联邦预测任务",
  },
  {
    id: "PRED-2024-006",
    name: "反洗钱风险预测",
    model: "risk_assessment",
    dataset: "跨境交易数据集_C",
    status: "completed",
    accuracy: "94.1",
    createdTime: "2024-04-11 10:00",
    description: "跨境交易反洗钱风险联合预测分析",
  },
];

const initialModels: PredictionModel[] = [
  {
    id: "MD-PRED-001",
    name: "信用评分模型_v3.0",
    type: "credit_model_v3",
    version: "v3.0",
    accuracy: "92.5",
    status: "published",
    createdAt: "2024-04-10 09:00",
  },
  {
    id: "MD-PRED-002",
    name: "客户流失预测器_v2.1",
    type: "churn_predictor",
    version: "v2.1",
    accuracy: "88.7",
    status: "published",
    createdAt: "2024-04-08 15:30",
  },
  {
    id: "MD-PRED-003",
    name: "风险评估模型_v1.5",
    type: "risk_assessment",
    version: "v1.5",
    accuracy: "94.1",
    status: "published",
    createdAt: "2024-04-05 11:00",
  },
];

const initialResults: PredictionResult[] = [
  {
    id: "RES-2024-001",
    taskName: "信用评分批量预测",
    model: "信用评分模型_v3.0",
    dataset: "客户信用数据集_2024Q1",
    result: "100,000 条",
    accuracy: "92.5",
    createdAt: "2024-04-10 09:45",
  },
  {
    id: "RES-2024-002",
    taskName: "欺诈交易实时检测",
    model: "信用评分模型_v3.0",
    dataset: "交易流水数据集_B",
    result: "50,000 条",
    accuracy: "89.3",
    createdAt: "2024-04-12 11:35",
  },
  {
    id: "RES-2024-003",
    taskName: "反洗钱风险预测",
    model: "风险评估模型_v1.5",
    dataset: "跨境交易数据集_C",
    result: "25,000 条",
    accuracy: "94.1",
    createdAt: "2024-04-11 10:15",
  },
];

const modelOptions = [
  { label: "信用评分模型 (credit_model_v3)", value: "credit_model_v3" },
  { label: "客户流失预测 (churn_predictor)", value: "churn_predictor" },
  { label: "风险评估模型 (risk_assessment)", value: "risk_assessment" },
];

const modelLabelMap: Record<string, string> = {
  credit_model_v3: "信用评分模型",
  churn_predictor: "客户流失预测",
  risk_assessment: "风险评估模型",
};

const statusColor: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  published: "bg-green-50 text-green-700 border-green-200",
  unpublished: "bg-gray-50 text-gray-600 border-gray-200",
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: "已完成",
    running: "进行中",
    pending: "待执行",
    failed: "失败",
    published: "已发布",
    unpublished: "未发布",
  };
  return map[status] || status;
};

export default function FederatedPrediction() {
  const [tasks, setTasks] = useState<PredictionTask[]>(initialTasks);
  const [models] = useState<PredictionModel[]>(initialModels);
  const [results, setResults] = useState<PredictionResult[]>(initialResults);

  const [taskSearch, setTaskSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<PredictionTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const filteredTasks = tasks.filter(
    (d) =>
      d.name.includes(taskSearch) ||
      d.id.includes(taskSearch) ||
      d.dataset.includes(taskSearch)
  );

  const filteredModels = models.filter(
    (m) => m.name.includes(modelSearch) || m.id.includes(modelSearch)
  );

  const filteredResults = results.filter(
    (r) =>
      r.taskName.includes(resultSearch) ||
      r.id.includes(resultSearch) ||
      r.model.includes(resultSearch)
  );

  const taskFields: FieldConfig[] = [
    { key: "name", label: "任务名称", type: "text", required: true },
    {
      key: "model",
      label: "预测模型",
      type: "select",
      options: modelOptions,
      required: true,
    },
    { key: "dataset", label: "数据集", type: "text", required: true },
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
    { key: "accuracy", label: "准确率 (%)", type: "text" },
    { key: "description", label: "描述", type: "textarea" },
  ];

  const handleTaskSubmit = (data: Record<string, string>) => {
    if (taskDialogMode === "create") {
      const newTask: PredictionTask = {
        id: `PRED-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        model: data.model || "credit_model_v3",
        dataset: data.dataset || "",
        status: data.status || "pending",
        accuracy: data.accuracy || "-",
        createdTime: new Date().toISOString().replace("T", " ").slice(0, 16),
        description: data.description || "",
      };
      setTasks((prev) => [newTask, ...prev]);
    } else if (taskDialogMode === "edit" && selectedTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                ...data,
              }
            : t
        )
      );
    }
  };

  const handleTaskDelete = () => {
    if (selectedTask) {
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setTaskDrawerOpen(false);
    }
  };

  const openTaskCreate = () => {
    setSelectedTask(null);
    setTaskDialogMode("create");
    setTaskDialogOpen(true);
  };

  const openTaskEdit = (task: PredictionTask) => {
    setSelectedTask(task);
    setTaskDialogMode("edit");
    setTaskDialogOpen(true);
  };

  const openTaskDelete = (task: PredictionTask) => {
    setSelectedTask(task);
    setTaskDialogMode("delete");
    setTaskDialogOpen(true);
  };

  const openTaskDrawer = (task: PredictionTask) => {
    setSelectedTask(task);
    setTaskDrawerOpen(true);
  };

  const handleRunTask = (task: PredictionTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: "running", accuracy: "-" }
          : t
      )
    );
  };

  const handleCompleteTask = (task: PredictionTask) => {
    const acc = (Math.random() * 10 + 85).toFixed(1);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: "completed", accuracy: acc }
          : t
      )
    );
    const newResult: PredictionResult = {
      id: `RES-${Date.now().toString(36).toUpperCase()}`,
      taskName: task.name,
      model: modelLabelMap[task.model] || task.model,
      dataset: task.dataset,
      result: `${Math.floor(Math.random() * 90000 + 10000)} 条`,
      accuracy: acc,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setResults((prev) => [newResult, ...prev]);
  };

  const avgAccuracy = () => {
    const completed = tasks.filter((t) => t.status === "completed" && t.accuracy !== "-");
    if (completed.length === 0) return "-";
    const sum = completed.reduce((acc, t) => acc + parseFloat(t.accuracy), 0);
    return (sum / completed.length).toFixed(1);
  };

  const todayCount = () => {
    const today = new Date().toISOString().slice(0, 10);
    return results.filter((r) => r.createdAt.startsWith(today)).length;
  };

  const taskDetailFields = [
    { key: "id", label: "任务ID" },
    { key: "name", label: "任务名称" },
    { key: "model", label: "预测模型" },
    { key: "dataset", label: "数据集" },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "accuracy", label: "准确率 (%)" },
    { key: "createdTime", label: "创建时间", type: "date" as const },
    { key: "description", label: "描述" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            联邦预测
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            联邦学习模型预测任务管理与结果分析
          </p>
        </div>
        {activeTab === "tasks" && (
          <Button
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            onClick={openTaskCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            新建预测任务
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">进行中任务</p>
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
              <p className="text-sm text-gray-500">已完成任务</p>
              <p className="text-lg font-bold">
                {tasks.filter((d) => d.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-sm text-gray-500">平均准确率</p>
              <p className="text-lg font-bold">{avgAccuracy()}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">今日预测次数</p>
              <p className="text-lg font-bold">{todayCount()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            预测任务
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <FileText className="w-4 h-4" />
            模型列表
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            预测结果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="搜索任务名称、ID或数据集"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-80 h-9"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {[
                    "任务ID",
                    "名称",
                    "模型",
                    "数据集",
                    "状态",
                    "准确率",
                    "创建时间",
                    "操作",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold text-gray-600 py-3.5 px-4"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredTasks.map((d) => (
                  <TableRow
                    key={d.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">
                      {d.id}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">
                      {d.name}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant="outline" className="text-xs">
                        {modelLabelMap[d.model] || d.model}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-600 max-w-[160px] truncate">
                      {d.dataset}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge className={statusColor[d.status]}>
                        {statusLabel(d.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">
                      {d.accuracy !== "-" ? `${d.accuracy}%` : "-"}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">
                      {d.createdTime}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openTaskDrawer(d)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openTaskEdit(d)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {d.status === "pending" || d.status === "failed" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleRunTask(d)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : d.status === "running" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => handleCompleteTask(d)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => openTaskDelete(d)}
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

        <TabsContent value="models" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="搜索模型名称或ID"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-80 h-9"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {[
                    "模型ID",
                    "名称",
                    "类型",
                    "版本",
                    "准确率",
                    "状态",
                    "创建时间",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold text-gray-600 py-3.5 px-4"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredModels.map((m) => (
                  <TableRow
                    key={m.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">
                      {m.id}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">
                      {m.name}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant="outline" className="text-xs">
                        {modelLabelMap[m.type] || m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">
                      {m.version}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">
                      {m.accuracy}%
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge className={statusColor[m.status]}>
                        {statusLabel(m.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">
                      {m.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="搜索任务名称、模型或结果ID"
              value={resultSearch}
              onChange={(e) => setResultSearch(e.target.value)}
              className="w-80 h-9"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {[
                    "结果ID",
                    "任务名称",
                    "模型",
                    "数据集",
                    "预测结果",
                    "准确率",
                    "完成时间",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold text-gray-600 py-3.5 px-4"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filteredResults.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">
                      {r.id}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">
                      {r.taskName}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge variant="outline" className="text-xs">
                        {r.model}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-600 max-w-[160px] truncate">
                      {r.dataset}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-sm font-medium">
                      {r.result}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">
                      {r.accuracy}%
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {r.createdAt}
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
        title="预测任务"
        fields={taskFields}
        data={selectedTask || undefined}
        mode={taskDialogMode}
        onSubmit={handleTaskSubmit}
        onDelete={handleTaskDelete}
      />

      <DetailDrawer
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
        title="预测任务详情"
        data={selectedTask || {}}
        fields={taskDetailFields}
        onEdit={
          selectedTask
            ? () => {
                setTaskDrawerOpen(false);
                openTaskEdit(selectedTask);
              }
            : undefined
        }
        onDelete={
          selectedTask
            ? () => {
                setTaskDrawerOpen(false);
                openTaskDelete(selectedTask);
              }
            : undefined
        }
      />
    </div>
  );
}
