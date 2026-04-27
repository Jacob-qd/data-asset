import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Search, Play, Pause, Plus, Trash2, Edit3, Eye, Wand2,
  Settings, Clock, CheckCircle2, AlertTriangle, XCircle,
  RotateCcw, Copy, Download, Filter, Layers, FileText, History,
} from "lucide-react";

interface ProcessTask {
  id: string;
  name: string;
  source: string;
  method: string;
  status: string;
  progress: number;
  records: number;
  createdAt: string;
  duration: string;
  config: string;
}

interface ProcessTemplate {
  id: string;
  name: string;
  method: string;
  description: string;
  records: number;
}

const processTasks: ProcessTask[] = [
  { id: "PP-2024-001", name: "客户数据脱敏", source: "mysql.user_profiles", method: "数据脱敏", status: "completed", progress: 100, records: 2400000, createdAt: "2024-04-15 09:00", duration: "3分20秒", config: "手机号掩码、姓名哈希、地址截断" },
  { id: "PP-2024-002", name: "交易数据标准化", source: "csv.transactions", method: "标准化", status: "running", progress: 67, records: 12000000, createdAt: "2024-04-15 10:30", duration: "-", config: "金额归一化、时间戳统一编码" },
  { id: "PP-2024-003", name: "用户标签编码", source: "mysql.user_tags", method: "编码转换", status: "pending", progress: 0, records: 850000, createdAt: "2024-04-15 14:00", duration: "-", config: "One-Hot编码、标签映射表" },
  { id: "PP-2024-004", name: "缺失值填充", source: "csv.risk_data", method: "缺失值处理", status: "failed", progress: 12, records: 120000, createdAt: "2024-04-14 16:00", duration: "45秒", config: "均值填充、异常值标记" },
];

const templates: ProcessTemplate[] = [
  { id: "TP-001", name: "PII脱敏模板", method: "数据脱敏", description: "手机号/身份证/姓名等PII字段自动脱敏", records: 0 },
  { id: "TP-002", name: "数值标准化模板", method: "标准化", description: "Z-Score归一化、Min-Max缩放", records: 0 },
  { id: "TP-003", name: "分类编码模板", method: "编码转换", description: "LabelEncoder + One-Hot自动选择", records: 0 },
  { id: "TP-004", name: "数据清洗模板", method: "缺失值处理", description: "缺失值检测+填充+异常值标记", records: 0 },
];

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: "已完成", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  running: { label: "执行中", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
  pending: { label: "待执行", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  failed: { label: "失败", color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  paused: { label: "已暂停", color: "bg-gray-50 text-gray-600 border-gray-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

export default function DataProcessing() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [selectedItem, setSelectedItem] = useState<ProcessTask | null>(null);

  const [formName, setFormName] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formMethod, setFormMethod] = useState("数据脱敏");
  const [formConfig, setFormConfig] = useState("");

  const filtered = processTasks.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setFormName(""); setFormSource(""); setFormMethod("数据脱敏"); setFormConfig("");
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formSource) return;
    processTasks.unshift({
      id: `PP-2024-${String(processTasks.length + 1).padStart(3, '0')}`,
      name: formName, source: formSource, method: formMethod,
      status: "pending", progress: 0, records: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-", config: formConfig || "未配置",
    });
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };
  const confirmDelete = () => {
    const idx = processTasks.findIndex(t => t.id === deleteId);
    if (idx >= 0) processTasks.splice(idx, 1);
    setDeleteOpen(false);
    if (selectedItem?.id === deleteId) setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const t = processTasks.find(x => x.id === id);
    if (!t) return;
    if (t.status === "pending") t.status = "running";
    else if (t.status === "running") t.status = "paused";
    else if (t.status === "paused") t.status = "running";
    else if (t.status === "failed") t.status = "pending";
    else if (t.status === "completed") t.status = "pending";
  };

  const handleCopy = (task: ProcessTask) => {
    processTasks.unshift({ ...task, id: `PP-2024-${String(processTasks.length + 1).padStart(3, '0')}`, name: `${task.name} (复制)`, status: "pending", progress: 0, duration: "-" });
  };

  const handleUseTemplate = (tp: ProcessTemplate) => {
    setFormName(tp.name);
    setFormMethod(tp.method);
    setFormConfig(tp.description);
    setFormSource("");
    setCreateOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">数据预处理</h1>
          <p className="text-sm text-gray-500 mt-1.5">数据清洗、转换、脱敏、编码</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建处理任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Wand2 className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">处理任务</p><p className="text-lg font-bold">{processTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{processTasks.filter(d => d.status === "completed").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Layers className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总处理量</p><p className="text-lg font-bold">{(processTasks.reduce((s, d) => s + d.records, 0) / 1000000).toFixed(1)}M</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Settings className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">模板数</p><p className="text-lg font-bold">{templates.length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><Wand2 className="w-4 h-4" />处理任务</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><Layers className="w-4 h-4" />处理模板</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" />执行历史</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "名称", "数据源", "处理方式", "状态", "进度", "记录数", "耗时", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map(d => {
                  const s = statusMap[d.status];
                  return (
                    <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                      <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                      <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-xs">{d.source}</TableCell>
                      <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.method}</Badge></TableCell>
                      <TableCell className="py-3.5 px-4"><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                      <TableCell className="py-3.5 px-4"><div className="w-16"><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.progress}%` }} /></div><span className="text-xs">{d.progress}%</span></div></TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">{d.records.toLocaleString()}</TableCell>
                      <TableCell className="py-3.5 px-4 text-xs text-gray-500">{d.duration}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)}><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>{d.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                          {d.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}><RotateCcw className="h-4 w-4" /></Button>}
                          {d.status === "completed" && <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.map(tp => (
              <Card key={tp.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{tp.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">{tp.method}</Badge>
                    </div>
                    <Layers className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{tp.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleUseTemplate(tp)}>使用模板</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs"><Settings className="w-3 h-3 mr-1" />配置</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "名称", "处理方式", "状态", "完成时间", "处理记录数", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {processTasks.filter(t => t.status === "completed" || t.status === "failed").map(d => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.method}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={d.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>{d.status === "completed" ? "成功" : "失败"}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{d.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{d.records.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">新建处理任务</h2>
            <p className="text-sm text-gray-500 mb-4">配置数据源、处理方式和处理参数</p>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">任务名称 <span className="text-red-500">*</span></label><Input placeholder="如：客户数据脱敏" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">数据源 <span className="text-red-500">*</span></label><Input placeholder="如：mysql.user_profiles" value={formSource} onChange={e => setFormSource(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">处理方式</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formMethod} onChange={e => setFormMethod(e.target.value)}>
                  <option value="数据脱敏">数据脱敏</option><option value="标准化">标准化</option><option value="编码转换">编码转换</option><option value="缺失值处理">缺失值处理</option><option value="特征工程">特征工程</option><option value="数据合并">数据合并</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">处理配置</label>
                <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={formConfig} onChange={e => setFormConfig(e.target.value)} placeholder="描述具体的处理步骤和参数..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={!formName || !formSource}>创建任务</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>任务详情</SheetTitle><SheetDescription>查看处理任务完整信息</SheetDescription></SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务ID</span><span className="text-sm font-mono">{selectedItem.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务名称</span><span className="text-sm font-medium">{selectedItem.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">数据源</span><span className="text-sm font-mono">{selectedItem.source}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">处理方式</span><Badge variant="outline">{selectedItem.method}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">记录数</span><span className="text-sm">{selectedItem.records.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedItem.createdAt}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">耗时</span><span className="text-sm">{selectedItem.duration}</span></div>
                <div className="pt-2"><span className="text-sm text-gray-500">处理配置</span><p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedItem.config}</p></div>
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
