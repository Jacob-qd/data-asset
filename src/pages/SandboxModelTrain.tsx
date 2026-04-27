import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Play, Pause, Plus, Trash2, Edit3, Settings,
  RotateCcw, FlaskConical, BookOpen, Clock, CheckCircle2,
  AlertTriangle, XCircle, Eye, Sparkles, BarChart3,
} from "lucide-react";

const algorithms = [
  { id: "ALG-001", name: "XGBoost分类器", framework: "xgboost", version: "2.0.3", status: "active", accuracy: "0.923", created: "2024-01-15" },
  { id: "ALG-002", name: "LightGBM回归", framework: "lightgbm", version: "4.1.0", status: "active", accuracy: "0.887", created: "2024-02-01" },
  { id: "ALG-003", name: "神经网络MLP", framework: "pytorch", version: "2.1.0", status: "draft", accuracy: "-", created: "2024-02-10" },
  { id: "ALG-004", name: "随机森林", framework: "sklearn", version: "1.3.2", status: "active", accuracy: "0.901", created: "2024-01-20" },
];

const trainTasks = [
  { id: "TR-001", name: "信用评分训练", algorithm: "ALG-001", status: "completed", epoch: 100, loss: "0.023", time: "45m", started: "2024-04-15 09:00" },
  { id: "TR-002", name: "流失预测训练", algorithm: "ALG-002", status: "running", epoch: 67, loss: "0.041", time: "-", started: "2024-04-15 10:30" },
  { id: "TR-003", name: "异常检测训练", algorithm: "ALG-004", status: "failed", epoch: 12, loss: "0.156", time: "8m", started: "2024-04-15 11:00" },
  { id: "TR-004", name: "神经网络训练", algorithm: "ALG-003", status: "pending", epoch: 0, loss: "-", time: "-", started: "-" },
];

export default function SandboxModelTrain() {
  const [searchAlg, setSearchAlg] = useState("");
  const [searchTask, setSearchTask] = useState("");
  const [algOpen, setAlgOpen] = useState(false);
  const [editAlg, setEditAlg] = useState<any>(null);
  const [algName, setAlgName] = useState("");
  const [algFramework, setAlgFramework] = useState("");
  const [algVersion, setAlgVersion] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [taskName, setTaskName] = useState("");
  const [taskAlg, setTaskAlg] = useState("");

  const filteredAlgs = algorithms.filter(a => a.name.includes(searchAlg) || a.id.includes(searchAlg));
  const filteredTasks = trainTasks.filter(t => t.name.includes(searchTask) || t.id.includes(searchTask));

  const handleAddAlg = () => {
    setEditAlg(null);
    setAlgName(""); setAlgFramework("xgboost"); setAlgVersion("");
    setAlgOpen(true);
  };

  const handleEditAlg = (a: any) => {
    setEditAlg(a);
    setAlgName(a.name); setAlgFramework(a.framework); setAlgVersion(a.version);
    setAlgOpen(true);
  };

  const handleSaveAlg = () => {
    if (editAlg) {
      editAlg.name = algName; editAlg.framework = algFramework; editAlg.version = algVersion;
    } else {
      algorithms.push({ id: `ALG-${String(algorithms.length + 1).padStart(3, '0')}`, name: algName, framework: algFramework, version: algVersion, status: "draft", accuracy: "-", created: new Date().toISOString().split('T')[0] });
    }
    setAlgOpen(false);
  };

  const handleDeleteAlg = (id: string) => {
    const idx = algorithms.findIndex(a => a.id === id);
    if (idx >= 0) algorithms.splice(idx, 1);
  };

  const handleAddTask = () => {
    setEditTask(null);
    setTaskName(""); setTaskAlg("");
    setTaskOpen(true);
  };

  const handleEditTask = (t: any) => {
    setEditTask(t);
    setTaskName(t.name); setTaskAlg(t.algorithm);
    setTaskOpen(true);
  };

  const handleSaveTask = () => {
    if (editTask) {
      editTask.name = taskName; editTask.algorithm = taskAlg;
    } else {
      trainTasks.push({ id: `TR-${String(trainTasks.length + 1).padStart(3, '0')}`, name: taskName, algorithm: taskAlg, status: "pending", epoch: 0, loss: "-", time: "-", started: "-" });
    }
    setTaskOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    const idx = trainTasks.findIndex(t => t.id === id);
    if (idx >= 0) trainTasks.splice(idx, 1);
  };

  const handleStartTask = (id: string) => {
    const t = trainTasks.find(x => x.id === id);
    if (t && t.status === "pending") t.status = "running";
  };

  const handlePauseTask = (id: string) => {
    const t = trainTasks.find(x => x.id === id);
    if (t && t.status === "running") t.status = "paused";
  };

  const handleStopTask = (id: string) => {
    const t = trainTasks.find(x => x.id === id);
    if (t) t.status = "failed";
  };

  const handleRestartTask = (id: string) => {
    const t = trainTasks.find(x => x.id === id);
    if (t) { t.status = "running"; t.epoch = 0; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型开发</h1>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditAlg(a)}><Settings className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteAlg(a.id)}><Trash2 className="w-4 h-4" /></Button>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(t)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTask(t.id)}><Trash2 className="w-4 h-4" /></Button>
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

      {/* Algorithm Dialog */}
      <Dialog open={algOpen} onOpenChange={setAlgOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editAlg ? "编辑算法" : "添加算法"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><label className="text-sm font-medium">算法名称</label><Input value={algName} onChange={e => setAlgName(e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">框架</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={algFramework} onChange={e => setAlgFramework(e.target.value)}>
                <option value="xgboost">XGBoost</option><option value="lightgbm">LightGBM</option><option value="pytorch">PyTorch</option><option value="sklearn">Scikit-learn</option>
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">版本</label><Input value={algVersion} onChange={e => setAlgVersion(e.target.value)} placeholder="如：2.0.3" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlgOpen(false)}>取消</Button>
            <Button onClick={handleSaveAlg} disabled={!algName || !algVersion}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editTask ? "编辑任务" : "新建任务"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><label className="text-sm font-medium">任务名称</label><Input value={taskName} onChange={e => setTaskName(e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">选择算法</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskAlg} onChange={e => setTaskAlg(e.target.value)}>
                <option value="">请选择</option>
                {algorithms.filter(a => a.status === "active").map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>取消</Button>
            <Button onClick={handleSaveTask} disabled={!taskName || !taskAlg}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
