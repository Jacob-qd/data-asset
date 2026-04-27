import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, Plus, Search, Eye, Trash2, Play, Pause, Copy, Hash, Tag, Bell, BarChart3, Cpu, ShieldCheck, CheckCircle, AlertTriangle, Zap, Layers, FileCheck, ArrowRight, Download, XCircle, RotateCcw, Filter } from "lucide-react";

interface PSITask {
  id: string;
  name: string;
  protocol: string;
  hashing: string;
  outputMode: string;
  status: string;
  progress: number;
  matchedCount: number;
  totalA: number;
  totalB: number;
  createdAt: string;
  duration: string;
  notifyStatus: string;
  tagField?: string;
}

const psiTasks: PSITask[] = [
  { id: "PSI-2026-001", name: "用户ID隐私求交", protocol: "OPRF-based", hashing: "Cuckoo", outputMode: "带标签输出", status: "执行中", progress: 67, matchedCount: 845230, totalA: 1256789, totalB: 980345, createdAt: "2026-04-24 10:00", duration: "12分30秒", notifyStatus: "待触达", tagField: "label_value" },
  { id: "PSI-2026-002", name: "设备ID求交统计", protocol: "哈希PSI", hashing: "Simple", outputMode: "仅统计", status: "已完成", progress: 100, matchedCount: 623400, totalA: 890000, totalB: 756000, createdAt: "2026-04-24 09:00", duration: "8分15秒", notifyStatus: "已触达" },
  { id: "PSI-2026-003", name: "订单ID多方求交", protocol: "多方PSI", hashing: "Cuckoo", outputMode: "带标签输出", status: "待执行", progress: 0, matchedCount: 0, totalA: 5689200, totalB: 3421000, createdAt: "2026-04-24 14:00", duration: "-", notifyStatus: "待触达", tagField: "order_status" },
  { id: "PSI-2026-004", name: "用户标签求交", protocol: "OPRF-based", hashing: "Cuckoo", outputMode: "带标签输出", status: "已完成", progress: 100, matchedCount: 2894500, totalA: 3200000, totalB: 3100000, createdAt: "2026-04-23 16:00", duration: "25分10秒", notifyStatus: "已触达", tagField: "user_tag" },
];

const protocols = [
  { name: "OPRF-based", fullName: "OPRF-based PSI", desc: "基于不经意伪随机函数，安全性最高", security: "高", efficiency: "中", recommend: true },
  { name: "哈希PSI", fullName: "哈希PSI", desc: "基于哈希函数比对，速度快", security: "中", efficiency: "高", recommend: false },
  { name: "多方PSI", fullName: "多方PSI", desc: "支持三方及以上参与方求交", security: "高", efficiency: "低", recommend: false },
];

const hashingMethods = [
  { name: "Cuckoo", fullName: "Cuckoo Hashing", desc: "布谷鸟哈希，优化大数据集求交效率", params: "stash_size=4, num_hash=3", recommend: true },
  { name: "Simple", fullName: "Simple Hashing", desc: "简单哈希，适用于小数据集", params: "num_bins=1000", recommend: false },
];

const statusColor: Record<string, string> = {
  "执行中": "bg-blue-50 text-blue-700 border-blue-100",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
  "已暂停": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function SecretPSI() {
  const [search, setSearch] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("OPRF-based");
  const [selectedHashing, setSelectedHashing] = useState("Cuckoo");
  const [outputMode, setOutputMode] = useState("labeled");
  const [notifyEnabled, setNotifyEnabled] = useState(true);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTask, setExportTask] = useState<PSITask | null>(null);
  const [exportFormat, setExportFormat] = useState("csv");

  // Form
  const [formName, setFormName] = useState("");
  const [formTagField, setFormTagField] = useState("");
  const [selectedItem, setSelectedItem] = useState<PSITask | null>(null);

  const filtered = psiTasks.filter((d) => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setFormName("");
    setFormTagField("");
    setSelectedProtocol("OPRF-based");
    setSelectedHashing("Cuckoo");
    setOutputMode("labeled");
    setNotifyEnabled(true);
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formName) return;
    const newTask: PSITask = {
      id: `PSI-2026-${String(psiTasks.length + 1).padStart(3, '0')}`,
      name: formName,
      protocol: selectedProtocol,
      hashing: selectedHashing,
      outputMode: outputMode === "labeled" ? "带标签输出" : "仅统计",
      status: "待执行",
      progress: 0,
      matchedCount: 0,
      totalA: 0,
      totalB: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-",
      notifyStatus: notifyEnabled ? "待触达" : "已关闭",
      tagField: outputMode === "labeled" ? (formTagField || "label_value") : undefined,
    };
    psiTasks.unshift(newTask);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    const idx = psiTasks.findIndex(t => t.id === deleteId);
    if (idx >= 0) psiTasks.splice(idx, 1);
    setDeleteOpen(false);
    if (selectedItem && selectedItem.id === deleteId) setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const t = psiTasks.find(x => x.id === id);
    if (!t) return;
    if (t.status === "待执行") t.status = "执行中";
    else if (t.status === "执行中") t.status = "已暂停";
    else if (t.status === "已暂停") t.status = "执行中";
    else if (t.status === "已完成") t.status = "待执行";
  };

  const handleCopy = (task: PSITask) => {
    const copy: PSITask = {
      ...task,
      id: `PSI-2026-${String(psiTasks.length + 1).padStart(3, '0')}`,
      name: `${task.name} (复制)`,
      status: "待执行",
      progress: 0,
      matchedCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-",
    };
    psiTasks.unshift(copy);
  };

  const handleExport = (task: PSITask) => {
    setExportTask(task);
    setExportFormat("csv");
    setExportOpen(true);
  };

  const handleReach = (id: string) => {
    const t = psiTasks.find(x => x.id === id);
    if (t) t.notifyStatus = "已触达";
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">隐私求交(PSI)</h1>
          <p className="text-sm text-gray-500 mt-1.5">支持OPRF/哈希/多方PSI协议，数据不出域安全求交</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建求交任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Layers className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">求交任务</p><p className="text-lg font-bold">{psiTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Zap className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{psiTasks.filter((d) => d.status === "已完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Hash className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总匹配量</p><p className="text-lg font-bold">{(psiTasks.reduce((s, d) => s + d.matchedCount, 0)).toLocaleString()}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Bell className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">待触达</p><p className="text-lg font-bold">{psiTasks.filter((d) => d.notifyStatus === "待触达").length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks"><Layers className="h-4 w-4 mr-1" />求交任务</TabsTrigger>
          <TabsTrigger value="statistics"><BarChart3 className="h-4 w-4 mr-1" />统计任务</TabsTrigger>
          <TabsTrigger value="labels"><Tag className="h-4 w-4 mr-1" />标签任务</TabsTrigger>
          <TabsTrigger value="report"><BarChart3 className="h-4 w-4 mr-1" />交集统计报告</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["任务ID", "任务名称", "协议", "Hashing", "输出模式", "进度", "A方/B方", "匹配量", "耗时", "通知", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((d) => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.protocol}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.hashing}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.outputMode}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="w-16"><Progress value={d.progress} className="h-1.5" /><span className="text-xs">{d.progress}%</span></div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.totalA.toLocaleString()} / {d.totalB.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{d.matchedCount > 0 ? d.matchedCount.toLocaleString() : "-"}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{d.duration}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.notifyStatus === "已触达" ? "bg-emerald-50 text-emerald-700" : d.notifyStatus === "已关闭" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}>{d.notifyStatus}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)} title="复制任务"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>
                          {d.status === "执行中" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        {d.status === "已完成" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(d)}><Download className="h-4 w-4" /></Button>}
                        {d.status === "已完成" && d.notifyStatus === "待触达" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleReach(d.id)}><Bell className="h-3 w-3 mr-1" />触达</Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-4 space-y-4">
          <div className="flex gap-3 items-center"><Input placeholder="搜索任务ID或名称" className="w-64 h-9" /></div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">{["任务ID","任务名称","交集数量","A方样本","B方样本","状态","操作"].map((h)=><TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {psiTasks.filter((t)=>t.status==="已完成").map((t)=>(
                  <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{t.matchedCount.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{t.totalA.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{t.totalB.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className="bg-emerald-50 text-emerald-700">{t.status}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(t); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><BarChart3 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="mt-4 space-y-4">
          <div className="flex gap-3 items-center"><Input placeholder="搜索任务ID或名称" className="w-64 h-9" /></div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">{["任务ID","任务名称","标签字段","匹配样本","状态","操作"].map((h)=><TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {psiTasks.filter((t)=>t.status==="已完成" && t.outputMode==="带标签输出").map((t)=>(
                  <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline">{t.tagField || "label_value"}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{t.matchedCount.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className="bg-emerald-50 text-emerald-700">{t.status}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(t); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(t)}><Download className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-600" />交集统计分布</h3>
              <div className="space-y-4">
                {psiTasks.filter((t) => t.status === "已完成").map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between text-sm mb-1"><span>{t.name}</span><span className="font-semibold">{(t.matchedCount / t.totalA * 100).toFixed(1)}%</span></div>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white" style={{ width: `${(t.matchedCount / t.totalA) * 100}%` }}>交集 {(t.matchedCount / 10000).toFixed(0)}万</div>
                      <div className="h-full bg-gray-300" style={{ width: `${((t.totalA - t.matchedCount) / t.totalA) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>A方: {t.totalA.toLocaleString()}</span>
                      <span>B方: {t.totalB.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 gap-2 w-full" variant="outline" onClick={() => { setExportFormat("pdf"); setExportOpen(true); }}><Download className="w-4 h-4" />导出报告</Button>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" />各方贡献率</h3>
              <div className="space-y-3">
                {psiTasks.filter((t) => t.status === "已完成").map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">协议: {t.protocol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{t.matchedCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">交集</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">新建隐私求交任务</h2>
            <p className="text-sm text-gray-500 mb-4">配置PSI协议、Hashing方法和输出模式</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">任务名称 <span className="text-red-500">*</span></label>
                <Input placeholder="输入任务名称" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">选择协议</label>
                <RadioGroup value={selectedProtocol} onValueChange={setSelectedProtocol} className="grid grid-cols-1 gap-2">
                  {protocols.map((p) => (
                    <div key={p.name} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedProtocol === p.name ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setSelectedProtocol(p.name)}>
                      <RadioGroupItem value={p.name} id={p.name} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor={p.name} className="font-medium text-sm">{p.fullName}</label>
                          {p.recommend && <Badge className="bg-indigo-100 text-indigo-700 text-xs">推荐</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600"><span>安全等级: {p.security}</span><span>效率: {p.efficiency}</span></div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hashing配置</label>
                <RadioGroup value={selectedHashing} onValueChange={setSelectedHashing} className="grid grid-cols-1 gap-2">
                  {hashingMethods.map((h) => (
                    <div key={h.name} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedHashing === h.name ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setSelectedHashing(h.name)}>
                      <RadioGroupItem value={h.name} id={h.name} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label htmlFor={h.name} className="font-medium text-sm">{h.fullName}</label>
                          {h.recommend && <Badge className="bg-indigo-100 text-indigo-700 text-xs">推荐</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{h.desc}</p>
                        <p className="text-xs text-gray-600 mt-0.5">参数: {h.params}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">输出模式</label>
                <div className="flex gap-4">
                  <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${outputMode === "labeled" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setOutputMode("labeled")}>
                    <Tag className="h-4 w-4 text-indigo-600 mb-1" />
                    <p className="text-sm font-medium">带标签输出</p>
                    <p className="text-xs text-gray-500">输出交集+指定标签字段</p>
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${outputMode === "stats" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setOutputMode("stats")}>
                    <Hash className="h-4 w-4 text-indigo-600 mb-1" />
                    <p className="text-sm font-medium">仅统计</p>
                    <p className="text-xs text-gray-500">只返回交集数量</p>
                  </div>
                </div>
              </div>
              {outputMode === "labeled" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">标签字段</label>
                  <Input placeholder="如：user_tag, label_value" value={formTagField} onChange={e => setFormTagField(e.target.value)} />
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-t">
                <div><p className="text-sm font-medium">触达通知</p><p className="text-xs text-gray-500">求交完成后通知结果方</p></div>
                <Switch checked={notifyEnabled} onCheckedChange={setNotifyEnabled} />
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
          <SheetHeader>
            <SheetTitle>任务详情</SheetTitle>
            <SheetDescription>查看PSI任务完整信息</SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务ID</span><span className="text-sm font-mono">{selectedItem.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务名称</span><span className="text-sm font-medium">{selectedItem.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">协议</span><Badge variant="outline">{selectedItem.protocol}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">Hashing</span><span className="text-sm">{selectedItem.hashing}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">输出模式</span><span className="text-sm">{selectedItem.outputMode}</span></div>
                {selectedItem.tagField && <div className="flex justify-between"><span className="text-sm text-gray-500">标签字段</span><Badge variant="outline">{selectedItem.tagField}</Badge></div>}
                <div className="flex justify-between"><span className="text-sm text-gray-500">A方样本</span><span className="text-sm">{selectedItem.totalA.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">B方样本</span><span className="text-sm">{selectedItem.totalB.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">匹配量</span><span className="text-sm font-semibold text-emerald-600">{selectedItem.matchedCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedItem.createdAt}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">耗时</span><span className="text-sm">{selectedItem.duration}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-500">进度</span>
                  <div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedItem.progress}%` }} /></div><span className="text-xs">{selectedItem.progress}%</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleToggleStatus(selectedItem.id)}>
                  {selectedItem.status === "执行中" ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />启动</>}
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleCopy(selectedItem)}><Copy className="w-4 h-4" />复制</Button>
                {selectedItem.status === "已完成" && <Button className="gap-2 col-span-2" variant="outline" onClick={() => handleExport(selectedItem)}><Download className="w-4 h-4" />导出结果</Button>}
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={confirmDelete}>确认删除</Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {exportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExportOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-1">导出结果</h2>
            <p className="text-sm text-gray-500 mb-4">选择导出格式</p>
            <div className="space-y-2">
              {["csv", "json", "parquet", "xlsx"].map(fmt => (
                <div key={fmt} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${exportFormat === fmt ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setExportFormat(fmt)}>
                  <div className={`w-4 h-4 rounded-full border ${exportFormat === fmt ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`} />
                  <span className="text-sm font-medium uppercase">{fmt}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
              <Button onClick={() => setExportOpen(false)}>导出</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
