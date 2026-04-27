import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Eye, Trash2, Play, Pause, Download, ChevronRight, BrainCircuit, Users, CheckCircle2, Clock, AlertTriangle, XCircle, RotateCcw, BarChart3, Copy, FileText, Globe, Settings } from "lucide-react";

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

const flTasks: FLTask[] = [
  { id: "FL-2024-001", name: "信用评分联邦训练", algorithmType: "横向联邦学习", strategy: "FedAvg", parties: 4, status: "completed", progress: 100, round: 100, totalRounds: 100, accuracy: "0.923", createdAt: "2024-04-10 09:00", lastUpdate: "2024-04-10 14:30", participants: ["银行A", "银行B", "银行C", "协调方"] },
  { id: "FL-2024-002", name: "反欺诈模型训练", algorithmType: "纵向联邦学习", strategy: "SecureAggregation", parties: 3, status: "running", progress: 65, round: 65, totalRounds: 100, accuracy: "0.876", createdAt: "2024-04-15 10:00", lastUpdate: "2024-04-15 12:30", participants: ["银行A", "电商A", "协调方"] },
  { id: "FL-2024-003", name: "推荐系统联邦训练", algorithmType: "联邦迁移学习", strategy: "FedProx", parties: 5, status: "pending", progress: 0, round: 0, totalRounds: 80, accuracy: "-", createdAt: "2024-04-16 08:00", lastUpdate: "-", participants: ["平台A", "平台B", "平台C", "平台D", "协调方"] },
  { id: "FL-2024-004", name: "医疗影像分类", algorithmType: "横向联邦学习", strategy: "FedAvg+Momentum", parties: 6, status: "failed", progress: 23, round: 23, totalRounds: 150, accuracy: "0.712", createdAt: "2024-04-12 14:00", lastUpdate: "2024-04-12 15:20", participants: ["医院A", "医院B", "医院C", "医院D", "医院E", "协调方"] },
];

const modelStore = [
  { id: "MD-001", name: "信用评分模型_v1.0", task: "FL-2024-001", accuracy: "0.923", auc: "0.956", f1: "0.891", status: "published", createdAt: "2024-04-10 14:30" },
  { id: "MD-002", name: "反欺诈模型_v0.8", task: "FL-2024-002", accuracy: "0.876", auc: "0.923", f1: "0.845", status: "training", createdAt: "2024-04-15 12:30" },
];

const statusColor: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function FederatedLearning() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [selectedItem, setSelectedItem] = useState<FLTask | null>(null);

  const [formName, setFormName] = useState("");
  const [formAlg, setFormAlg] = useState("横向联邦学习");
  const [formStrategy, setFormStrategy] = useState("FedAvg");
  const [formRounds, setFormRounds] = useState(100);
  const [formParties, setFormParties] = useState(3);

  const filtered = flTasks.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setFormName(""); setFormAlg("横向联邦学习"); setFormStrategy("FedAvg"); setFormRounds(100); setFormParties(3);
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formName) return;
    const newTask: FLTask = {
      id: `FL-2024-${String(flTasks.length + 1).padStart(3, '0')}`,
      name: formName, algorithmType: formAlg, strategy: formStrategy,
      parties: formParties, status: "pending", progress: 0,
      round: 0, totalRounds: formRounds, accuracy: "-",
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastUpdate: "-",
      participants: Array.from({ length: formParties }, (_, i) => i === formParties - 1 ? "协调方" : `参与方${String.fromCharCode(65 + i)}`),
    };
    flTasks.unshift(newTask);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };
  const confirmDelete = () => {
    const idx = flTasks.findIndex(t => t.id === deleteId);
    if (idx >= 0) flTasks.splice(idx, 1);
    setDeleteOpen(false);
    if (selectedItem?.id === deleteId) setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const t = flTasks.find(x => x.id === id);
    if (!t) return;
    if (t.status === "pending") t.status = "running";
    else if (t.status === "running") t.status = "paused";
    else if (t.status === "paused") t.status = "running";
    else if (t.status === "failed") t.status = "pending";
    else if (t.status === "completed") t.status = "pending";
  };

  const handleCopy = (task: FLTask) => {
    flTasks.unshift({ ...task, id: `FL-2024-${String(flTasks.length + 1).padStart(3, '0')}`, name: `${task.name} (复制)`, status: "pending", progress: 0, round: 0, accuracy: "-" });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联邦学习</h1>
          <p className="text-sm text-gray-500 mt-1.5">分布式模型训练，原始数据不出域</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建训练任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BrainCircuit className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">训练任务</p><p className="text-lg font-bold">{flTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{flTasks.filter(d => d.status === "completed").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Users className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">参与机构</p><p className="text-lg font-bold">{new Set(flTasks.flatMap(d => d.participants)).size}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">最佳准确率</p><p className="text-lg font-bold">92.3%</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><BrainCircuit className="w-4 h-4" />训练任务</TabsTrigger>
          <TabsTrigger value="models" className="gap-2"><FileText className="w-4 h-4" />模型仓库</TabsTrigger>
          <TabsTrigger value="parties" className="gap-2"><Users className="w-4 h-4" />参与方管理</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "名称", "算法类型", "聚合策略", "参与方", "进度", "轮次", "准确率", "状态", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.algorithmType}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.strategy}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{d.parties}方</TableCell>
                    <TableCell className="py-3.5 px-4"><div className="w-16"><Progress value={d.progress} className="h-1.5" /><span className="text-xs">{d.progress}%</span></div></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.round}/{d.totalRounds}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{d.accuracy}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={statusColor[d.status]}>{d.status === "completed" ? "已完成" : d.status === "running" ? "训练中" : d.status === "pending" ? "待执行" : d.status === "paused" ? "已暂停" : "失败"}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>{d.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                        {d.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}><RotateCcw className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4"><Input placeholder="搜索模型名称" className="w-64 h-9" /></div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["模型ID", "名称", "关联任务", "准确率", "AUC", "F1值", "状态", "创建时间", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {modelStore.map(m => (
                  <TableRow key={m.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs">{m.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{m.name}</TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs">{m.task}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{m.accuracy}</TableCell>
                    <TableCell className="py-3.5 px-4">{m.auc}</TableCell>
                    <TableCell className="py-3.5 px-4">{m.f1}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={m.status === "published" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}>{m.status === "published" ? "已发布" : "训练中"}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{m.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="parties" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-semibold mb-4">参与方管理</h3>
            <div className="grid grid-cols-3 gap-4">
              {Array.from(new Set(flTasks.flatMap(d => d.participants))).map((party, idx) => (
                <Card key={idx} className="border border-gray-100"><CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-600" /></div>
                  <div><p className="text-sm font-medium">{party}</p><p className="text-xs text-gray-500">{idx === Array.from(new Set(flTasks.flatMap(d => d.participants))).length - 1 ? "协调节点" : "数据参与方"}</p></div>
                </CardContent></Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">新建联邦学习任务</h2>
            <p className="text-sm text-gray-500 mb-4">配置算法类型、聚合策略和训练参数</p>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">任务名称 <span className="text-red-500">*</span></label><Input placeholder="输入任务名称" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">算法类型</label>
                <RadioGroup value={formAlg} onValueChange={setFormAlg} className="grid grid-cols-1 gap-2">
                  {["横向联邦学习", "纵向联邦学习", "联邦迁移学习"].map(alg => (
                    <div key={alg} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${formAlg === alg ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setFormAlg(alg)}>
                      <RadioGroupItem value={alg} id={alg} /><label htmlFor={alg} className="text-sm font-medium">{alg}</label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">聚合策略</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formStrategy} onChange={e => setFormStrategy(e.target.value)}>
                  <option value="FedAvg">FedAvg</option><option value="FedProx">FedProx</option><option value="SecureAggregation">SecureAggregation</option><option value="FedAvg+Momentum">FedAvg+Momentum</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">训练轮数</label><Input type="number" value={formRounds} onChange={e => setFormRounds(Number(e.target.value))} min={10} max={500} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">参与方数</label><Input type="number" value={formParties} onChange={e => setFormParties(Number(e.target.value))} min={2} max={20} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={!formName}>创建任务</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>任务详情</SheetTitle><SheetDescription>查看联邦学习任务完整信息</SheetDescription></SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务ID</span><span className="text-sm font-mono">{selectedItem.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务名称</span><span className="text-sm font-medium">{selectedItem.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">算法类型</span><Badge variant="outline">{selectedItem.algorithmType}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">聚合策略</span><span className="text-sm">{selectedItem.strategy}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">参与方</span><span className="text-sm">{selectedItem.parties} 方</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">训练轮次</span><span className="text-sm">{selectedItem.round} / {selectedItem.totalRounds}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">准确率</span><span className="text-sm font-semibold text-emerald-600">{selectedItem.accuracy}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedItem.createdAt}</span></div>
                <div className="pt-2"><span className="text-sm text-gray-500">参与机构</span><div className="flex flex-wrap gap-1 mt-1">{selectedItem.participants.map((p, i) => <Badge key={i} variant="outline" className="text-xs">{p}</Badge>)}</div></div>
                <div className="flex justify-between items-center pt-1"><span className="text-sm text-gray-500">进度</span>
                  <div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedItem.progress}%` }} /></div><span className="text-xs">{selectedItem.progress}%</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleToggleStatus(selectedItem.id)}>{selectedItem.status === "running" ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />启动</>}</Button>
                <Button variant="outline" className="gap-2" onClick={() => handleCopy(selectedItem)}><Copy className="w-4 h-4" />复制</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-2">确认删除</h2>
            <p className="text-sm text-gray-500 mb-4">删除任务 {deleteId} 后不可恢复，确认继续？</p>
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button><Button variant="destructive" onClick={confirmDelete}>确认删除</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
