import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  Search, Play, Pause, Plus, Trash2, Edit3,
  RotateCcw, FlaskConical, BookOpen, Clock, CheckCircle2,
  AlertTriangle, XCircle, Eye, Sparkles, BarChart3,
} from "lucide-react";

const initialAlgorithms = [
  { id: "ALG-001", name: "XGBoost分类器", framework: "xgboost", version: "2.0.3", status: "active", accuracy: "0.923", created: "2024-01-15" },
  { id: "ALG-002", name: "LightGBM回归", framework: "lightgbm", version: "4.1.0", status: "active", accuracy: "0.887", created: "2024-02-01" },
  { id: "ALG-003", name: "神经网络MLP", framework: "pytorch", version: "2.1.0", status: "draft", accuracy: "-", created: "2024-02-10" },
  { id: "ALG-004", name: "随机森林", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.901", created: "2024-01-20" },
  { id: "ALG-005", name: "逻辑回归", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.856", created: "2024-01-25" },
  { id: "ALG-006", name: "CatBoost", framework: "catboost", version: "1.2.0", status: "active", accuracy: "0.915", created: "2024-02-05" },
  { id: "ALG-007", name: "Transformer", framework: "pytorch", version: "2.1.0", status: "draft", accuracy: "-", created: "2024-02-15" },
  { id: "ALG-008", name: "K-Means聚类", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.812", created: "2024-01-28" },
  { id: "ALG-009", name: "时间序列模型", framework: "pytorch", version: "2.1.0", status: "archived", accuracy: "0.789", created: "2023-12-10" },
  { id: "ALG-010", name: "梯度提升树", framework: "xgboost", version: "2.0.3", status: "active", accuracy: "0.934", created: "2024-02-20" },
];

const initialTrainTasks = [
  { id: "TR-001", name: "信用评分训练", algorithm: "ALG-001", status: "completed", epoch: 100, loss: "0.023", time: "45m", started: "2024-04-15 09:00" },
  { id: "TR-002", name: "流失预测训练", algorithm: "ALG-002", status: "running", epoch: 67, loss: "0.041", time: "-", started: "2024-04-15 10:30" },
  { id: "TR-003", name: "异常检测训练", algorithm: "ALG-004", status: "failed", epoch: 12, loss: "0.156", time: "8m", started: "2024-04-15 11:00" },
  { id: "TR-004", name: "神经网络训练", algorithm: "ALG-003", status: "pending", epoch: 0, loss: "-", time: "-", started: "-" },
  { id: "TR-005", name: "逻辑回归训练", algorithm: "ALG-005", status: "completed", epoch: 100, loss: "0.035", time: "22m", started: "2024-04-15 08:00" },
  { id: "TR-006", name: "CatBoost训练", algorithm: "ALG-006", status: "running", epoch: 45, loss: "0.028", time: "-", started: "2024-04-15 12:00" },
  { id: "TR-007", name: "聚类分析训练", algorithm: "ALG-008", status: "paused", epoch: 30, loss: "0.062", time: "15m", started: "2024-04-15 07:30" },
  { id: "TR-008", name: "Transformer训练", algorithm: "ALG-007", status: "pending", epoch: 0, loss: "-", time: "-", started: "-" },
  { id: "TR-009", name: "时间序列训练", algorithm: "ALG-009", status: "failed", epoch: 5, loss: "0.189", time: "3m", started: "2024-04-15 06:00" },
  { id: "TR-010", name: "梯度提升训练", algorithm: "ALG-010", status: "completed", epoch: 100, loss: "0.019", time: "55m", started: "2024-04-15 05:00" },
];

const algFields: FieldConfig[] = [
  { key: "name", label: "算法名称", type: "text", required: true },
  { key: "framework", label: "框架", type: "select", required: true, options: [
    { label: "XGBoost", value: "xgboost" },
    { label: "LightGBM", value: "lightgbm" },
    { label: "PyTorch", value: "pytorch" },
    { label: "Scikit-learn", value: "sklearn" },
  ]},
  { key: "version", label: "版本", type: "text", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已激活", value: "active" },
    { label: "草稿", value: "draft" },
    { label: "已归档", value: "archived" },
    { label: "测试中", value: "testing" },
    { label: "已弃用", value: "deprecated" },
    { label: "审核中", value: "reviewing" },
  ]},
  { key: "accuracy", label: "准确率", type: "text" },
  { key: "created", label: "创建时间", type: "text" },
];

const taskFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "algorithm", label: "选择算法", type: "select", required: true, options: [] },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已完成", value: "completed" },
    { label: "训练中", value: "running" },
    { label: "失败", value: "failed" },
    { label: "暂停", value: "paused" },
    { label: "待执行", value: "pending" },
  ]},
  { key: "epoch", label: "轮次", type: "number" },
  { key: "loss", label: "损失", type: "text" },
  { key: "time", label: "耗时", type: "text" },
  { key: "started", label: "开始时间", type: "text" },
];

const algDetailFields = [
  { key: "id", label: "算法ID" },
  { key: "name", label: "算法名称" },
  { key: "framework", label: "框架", type: "badge" as const },
  { key: "version", label: "版本" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "accuracy", label: "准确率" },
  { key: "created", label: "创建时间", type: "date" as const },
];

const taskDetailFields = [
  { key: "id", label: "任务ID" },
  { key: "name", label: "任务名称" },
  { key: "algorithm", label: "算法", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "epoch", label: "轮次" },
  { key: "loss", label: "损失" },
  { key: "time", label: "耗时" },
  { key: "started", label: "开始时间", type: "date" as const },
];

export default function SandboxModelTrain() {
  const [algorithms, setAlgorithms] = useState(initialAlgorithms);
  const [trainTasks, setTrainTasks] = useState(initialTrainTasks);
  const [searchAlg, setSearchAlg] = useState("");
  const [searchTask, setSearchTask] = useState("");

  const [algDialogOpen, setAlgDialogOpen] = useState(false);
  const [algDialogMode, setAlgDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedAlg, setSelectedAlg] = useState<any>(null);
  const [algDrawerOpen, setAlgDrawerOpen] = useState(false);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const filteredAlgs = algorithms.filter(a => a.name.includes(searchAlg) || a.id.includes(searchAlg));
  const filteredTasks = trainTasks.filter(t => t.name.includes(searchTask) || t.id.includes(searchTask));

  const getTaskAlgOptions = () => {
    return algorithms
      .filter(a => a.status === "active")
      .map(a => ({ label: `${a.name} (${a.id})`, value: a.id }));
  };

  const handleAddAlg = () => {
    setSelectedAlg(null);
    setAlgDialogMode("create");
    setAlgDialogOpen(true);
  };

  const handleEditAlg = (a: any) => {
    setSelectedAlg(a);
    setAlgDialogMode("edit");
    setAlgDialogOpen(true);
  };

  const handleViewAlg = (a: any) => {
    setSelectedAlg(a);
    setAlgDrawerOpen(true);
  };

  const handleDeleteAlgPrompt = (a: any) => {
    setSelectedAlg(a);
    setAlgDialogMode("delete");
    setAlgDialogOpen(true);
  };

  const handleSaveAlg = (data: Record<string, any>) => {
    if (algDialogMode === "edit" && selectedAlg) {
      setAlgorithms(prev => prev.map(a => a.id === selectedAlg.id ? { ...a, ...data } : a));
    } else {
      const newId = `ALG-${String(algorithms.length + 1).padStart(3, '0')}`;
      setAlgorithms(prev => [...prev, { id: newId, accuracy: "-", created: new Date().toISOString().split('T')[0], ...data } as any]);
    }
  };

  const handleConfirmDeleteAlg = () => {
    if (selectedAlg) {
      setAlgorithms(prev => prev.filter(a => a.id !== selectedAlg.id));
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogMode("create");
    setTaskDialogOpen(true);
  };

  const handleEditTask = (t: any) => {
    setSelectedTask(t);
    setTaskDialogMode("edit");
    setTaskDialogOpen(true);
  };

  const handleViewTask = (t: any) => {
    setSelectedTask(t);
    setTaskDrawerOpen(true);
  };

  const handleDeleteTaskPrompt = (t: any) => {
    setSelectedTask(t);
    setTaskDialogMode("delete");
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (data: Record<string, any>) => {
    if (taskDialogMode === "edit" && selectedTask) {
      setTrainTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, ...data } : t));
    } else {
      const newId = `TR-${String(trainTasks.length + 1).padStart(3, '0')}`;
      setTrainTasks(prev => [...prev, { id: newId, epoch: 0, loss: "-", time: "-", started: "-", ...data } as any]);
    }
  };

  const handleConfirmDeleteTask = () => {
    if (selectedTask) {
      setTrainTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    }
  };

  const handleStartTask = (id: string) => {
    setTrainTasks(prev => prev.map(t => t.id === id && t.status === "pending" ? { ...t, status: "running" } : t));
  };

  const handlePauseTask = (id: string) => {
    setTrainTasks(prev => prev.map(t => t.id === id && t.status === "running" ? { ...t, status: "paused" } : t));
  };

  const handleStopTask = (id: string) => {
    setTrainTasks(prev => prev.map(t => t.id === id ? { ...t, status: "failed" } : t));
  };

  const handleRestartTask = (id: string) => {
    setTrainTasks(prev => prev.map(t => t.id === id ? { ...t, status: "running", epoch: 0 } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">模型开发</h1>
          <p className="text-sm text-gray-500 mt-1">算法管理、训练任务、模型评估</p>
        </div>
      </div>

      <Tabs defaultValue="algorithms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="algorithms" className="gap-2"><BookOpen className="w-4 h-4" />算法库</TabsTrigger>
          <TabsTrigger value="training" className="gap-2"><FlaskConical className="w-4 h-4" />训练任务</TabsTrigger>
          <TabsTrigger value="evaluation" className="gap-2"><BarChart3 className="w-4 h-4" />模型评估</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithms" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索算法..." className="pl-9" value={searchAlg} onChange={e => setSearchAlg(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={handleAddAlg}><Plus className="w-4 h-4" />添加算法</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">算法列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>算法ID</TableHead><TableHead>名称</TableHead><TableHead>框架</TableHead><TableHead>版本</TableHead><TableHead>状态</TableHead><TableHead>准确率</TableHead><TableHead>创建时间</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlgs.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge variant="outline">{a.framework}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{a.version}</TableCell>
                      <TableCell>
                        {a.status === "active" ? <Badge className="bg-green-50 text-green-700">已激活</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">草稿</Badge>}
                      </TableCell>
                      <TableCell className={a.accuracy !== "-" ? "text-green-600" : "text-gray-400"}>{a.accuracy}</TableCell>
                      <TableCell className="text-xs text-gray-500">{a.created}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewAlg(a)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditAlg(a)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteAlgPrompt(a)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索任务..." className="pl-9" value={searchTask} onChange={e => setSearchTask(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={handleAddTask}><Plus className="w-4 h-4" />新建任务</Button>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">训练任务列表</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>任务ID</TableHead><TableHead>任务名称</TableHead><TableHead>算法</TableHead><TableHead>状态</TableHead><TableHead>轮次</TableHead><TableHead>损失</TableHead><TableHead>耗时</TableHead><TableHead>操作</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="font-mono text-xs">{t.algorithm}</TableCell>
                      <TableCell>
                        {t.status === "completed" ? <Badge className="bg-green-50 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />完成</Badge> :
                         t.status === "running" ? <Badge className="bg-blue-50 text-blue-700 gap-1"><Sparkles className="w-3 h-3" />训练中</Badge> :
                         t.status === "failed" ? <Badge className="bg-red-50 text-red-700 gap-1"><XCircle className="w-3 h-3" />失败</Badge> :
                         t.status === "paused" ? <Badge className="bg-amber-50 text-amber-700 gap-1"><Pause className="w-3 h-3" />暂停</Badge> :
                         <Badge className="bg-gray-50 text-gray-700">待执行</Badge>}
                      </TableCell>
                      <TableCell>{t.epoch}/100</TableCell>
                      <TableCell>{t.loss}</TableCell>
                      <TableCell>{t.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {t.status === "pending" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartTask(t.id)}><Play className="w-4 h-4" /></Button>}
                          {t.status === "running" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePauseTask(t.id)}><Pause className="w-4 h-4" /></Button>}
                          {(t.status === "running" || t.status === "paused") && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStopTask(t.id)}><XCircle className="w-4 h-4" /></Button>}
                          {t.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRestartTask(t.id)}><RotateCcw className="w-4 h-4" /></Button>}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewTask(t)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(t)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTaskPrompt(t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">模型评估</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">选择训练完成的任务查看评估结果</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrudDialog
        open={algDialogOpen}
        onOpenChange={setAlgDialogOpen}
        title={selectedAlg?.name || "算法"}
        fields={algFields}
        data={selectedAlg || {}}
        mode={algDialogMode}
        onSubmit={handleSaveAlg}
        onDelete={handleConfirmDeleteAlg}
      />

      <CrudDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        title={selectedTask?.name || "任务"}
        fields={taskFields.map(f => f.key === "algorithm" ? { ...f, options: getTaskAlgOptions() } : f)}
        data={selectedTask || {}}
        mode={taskDialogMode}
        onSubmit={handleSaveTask}
        onDelete={handleConfirmDeleteTask}
      />

      <DetailDrawer
        open={algDrawerOpen}
        onOpenChange={setAlgDrawerOpen}
        title="算法详情"
        data={selectedAlg || {}}
        fields={algDetailFields}
        onEdit={() => { setAlgDrawerOpen(false); handleEditAlg(selectedAlg); }}
        onDelete={() => { setAlgDrawerOpen(false); handleDeleteAlgPrompt(selectedAlg); }}
      />

      <DetailDrawer
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
        title="任务详情"
        data={selectedTask || {}}
        fields={taskDetailFields}
        onEdit={() => { setTaskDrawerOpen(false); handleEditTask(selectedTask); }}
        onDelete={() => { setTaskDrawerOpen(false); handleDeleteTaskPrompt(selectedTask); }}
      />
    </div>
  );
}
