import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Search, Plus, Eye, Trash2, Play, Pause, Download, ChevronRight, KeyRound, BookOpen, FileSearch, Settings, CheckCircle2, XCircle, RotateCcw, Copy } from "lucide-react";

interface PIRTask {
  id: string;
  name: string;
  queryMode: string;
  obfuscation: number;
  status: string;
  querier: string;
  targetTable: string;
  queryCount: number;
  resultCount: number;
  latency: string;
  createdAt: string;
  duration: string;
}

const pirTasks: PIRTask[] = [
  { id: "PIR-2026-001", name: "用户画像查询", queryMode: "单条查询", obfuscation: 100, status: "已完成", querier: "银行A", targetTable: "user_profiles", queryCount: 1, resultCount: 8, latency: "120ms", createdAt: "2026-04-24 10:00", duration: "120ms" },
  { id: "PIR-2026-002", name: "交易记录检索", queryMode: "批量查询", obfuscation: 500, status: "执行中", querier: "银行B", targetTable: "transactions", queryCount: 50, resultCount: 0, latency: "-", createdAt: "2026-04-24 11:00", duration: "-" },
  { id: "PIR-2026-003", name: "设备归属查询", queryMode: "单条查询", obfuscation: 50, status: "待执行", querier: "运营商A", targetTable: "device_registry", queryCount: 1, resultCount: 0, latency: "-", createdAt: "2026-04-24 14:00", duration: "-" },
  { id: "PIR-2026-004", name: "信用评级查询", queryMode: "单条查询", obfuscation: 200, status: "已完成", querier: "银行C", targetTable: "credit_scores", queryCount: 1, resultCount: 5, latency: "95ms", createdAt: "2026-04-23 16:00", duration: "95ms" },
];

const statusColor: Record<string, string> = {
  "执行中": "bg-blue-50 text-blue-700 border-blue-100",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
  "已暂停": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function SecretPIR() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const [formName, setFormName] = useState("");
  const [formMode, setFormMode] = useState("single");
  const [formObfuscation, setFormObfuscation] = useState(100);
  const [formTable, setFormTable] = useState("");
  const [formQuerier, setFormQuerier] = useState("");
  const [selectedItem, setSelectedItem] = useState<PIRTask | null>(null);

  const filtered = pirTasks.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setFormName(""); setFormMode("single"); setFormObfuscation(100); setFormTable(""); setFormQuerier("");
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formTable) return;
    const newTask: PIRTask = {
      id: `PIR-2026-${String(pirTasks.length + 1).padStart(3, '0')}`,
      name: formName,
      queryMode: formMode === "single" ? "单条查询" : "批量查询",
      obfuscation: formObfuscation,
      status: "待执行",
      querier: formQuerier || "当前用户",
      targetTable: formTable,
      queryCount: formMode === "single" ? 1 : 0,
      resultCount: 0,
      latency: "-",
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      duration: "-",
    };
    pirTasks.unshift(newTask);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };
  const confirmDelete = () => {
    const idx = pirTasks.findIndex(t => t.id === deleteId);
    if (idx >= 0) pirTasks.splice(idx, 1);
    setDeleteOpen(false);
    if (selectedItem?.id === deleteId) setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const t = pirTasks.find(x => x.id === id);
    if (!t) return;
    if (t.status === "待执行") t.status = "执行中";
    else if (t.status === "执行中") t.status = "已暂停";
    else if (t.status === "已暂停") t.status = "执行中";
    else if (t.status === "已完成") t.status = "待执行";
  };

  const handleCopy = (task: PIRTask) => {
    pirTasks.unshift({ ...task, id: `PIR-2026-${String(pirTasks.length + 1).padStart(3, '0')}`, name: `${task.name} (复制)`, status: "待执行", resultCount: 0, latency: "-", duration: "-" });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">隐匿查询(PIR)</h1>
          <p className="text-sm text-gray-500 mt-1.5">查询方不暴露查询条件，服务端不泄露全量数据</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建查询任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><KeyRound className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">查询任务</p><p className="text-lg font-bold">{pirTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{pirTasks.filter(d => d.status === "已完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FileSearch className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总查询</p><p className="text-lg font-bold">{pirTasks.reduce((s, d) => s + d.queryCount, 0).toLocaleString()}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Settings className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">平均延迟</p><p className="text-lg font-bold">107ms</p></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tasks"><KeyRound className="h-4 w-4 mr-1" />查询任务</TabsTrigger>
          <TabsTrigger value="demo"><BookOpen className="h-4 w-4 mr-1" />查询演示</TabsTrigger>
          <TabsTrigger value="results"><FileSearch className="h-4 w-4 mr-1" />查询结果</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-9" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["任务ID", "任务名称", "查询模式", "混淆值", "状态", "查询方", "目标表", "查询数", "结果数", "延迟", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <TableRow key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{d.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{d.queryMode}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.obfuscation}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge className={statusColor[d.status]}>{d.status}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.querier}</TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs">{d.targetTable}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{d.queryCount}</TableCell>
                    <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{d.resultCount || "-"}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{d.latency}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)} title="复制"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>{d.status === "执行中" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                        {d.status === "已完成" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(d); setExportOpen(true); }}><Download className="h-4 w-4" /></Button>}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4">查询参数配置</h3>
              <div className="space-y-3">
                <div className="space-y-1"><label className="text-sm font-medium">查询模式</label>
                  <div className="flex gap-3">
                    <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${formMode === "single" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setFormMode("single")}>
                      <p className="text-sm font-medium">单条查询</p><p className="text-xs text-gray-500">查询单个Key对应Value</p>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${formMode === "batch" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setFormMode("batch")}>
                      <p className="text-sm font-medium">批量查询</p><p className="text-xs text-gray-500">一次查询多条记录</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1"><label className="text-sm font-medium">混淆值大小</label>
                  <Input type="number" value={formObfuscation} onChange={e => setFormObfuscation(Number(e.target.value))} />
                  <p className="text-xs text-gray-500">混淆值越大，安全性越高，但查询效率越低</p>
                </div>
                <div className="space-y-1"><label className="text-sm font-medium">目标数据表</label>
                  <Input placeholder="如：user_profiles" value={formTable} onChange={e => setFormTable(e.target.value)} />
                </div>
                <Button className="w-full" onClick={() => { setFormObfuscation(100); setFormTable("user_profiles"); setFormMode("single"); alert("演示配置已保存为模板"); }}>保存为模板</Button>
              </div>
            </Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-semibold mb-4">查询效果预览</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">服务端视角（不泄露查询条件）</p>
                  <p className="text-sm">服务端收到 <span className="font-semibold">{formObfuscation}</span> 个混淆查询，无法区分真实查询</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">查询方视角（不暴露查询内容）</p>
                  <p className="text-sm">查询方只获取目标记录，服务端不知道查询了哪条</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-600 mb-1">安全等级评估</p>
                  <p className="text-sm font-medium">{formObfuscation >= 500 ? "高安全" : formObfuscation >= 100 ? "中安全" : "基础安全"}</p>
                  <p className="text-xs text-gray-500">混淆值 {formObfuscation} / 查询效率 {formObfuscation >= 500 ? "较慢" : formObfuscation >= 100 ? "适中" : "较快"}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "任务名称", "查询Key", "返回字段", "数据值", "查询时间", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {pirTasks.filter(t => t.status === "已完成").map(t => (
                  <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs">****{t.id.slice(-4)}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs">{t.resultCount} 个字段</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">[加密返回]</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{t.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(t); setDetailOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(t); setExportOpen(true); }}><Download className="h-4 w-4" /></Button>
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
            <h2 className="text-lg font-semibold mb-1">新建PIR查询任务</h2>
            <p className="text-sm text-gray-500 mb-4">配置查询模式、混淆值和目标表</p>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">任务名称 <span className="text-red-500">*</span></label><Input placeholder="输入任务名称" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">查询模式</label>
                <div className="flex gap-3">
                  <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${formMode === "single" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setFormMode("single")}>
                    <p className="text-sm font-medium">单条查询</p><p className="text-xs text-gray-500">查询单个Key对应Value</p>
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border cursor-pointer ${formMode === "batch" ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setFormMode("batch")}>
                    <p className="text-sm font-medium">批量查询</p><p className="text-xs text-gray-500">一次查询多条记录</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">混淆值大小</label><Input type="number" value={formObfuscation} onChange={e => setFormObfuscation(Number(e.target.value))} /><p className="text-xs text-gray-500">建议：单条查询100-200，批量查询500+</p></div>
              <div className="space-y-2"><label className="text-sm font-medium">目标数据表 <span className="text-red-500">*</span></label><Input placeholder="如：user_profiles" value={formTable} onChange={e => setFormTable(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">查询方</label><Input placeholder="如：银行A" value={formQuerier} onChange={e => setFormQuerier(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
              <Button onClick={handleSave} disabled={!formName || !formTable}>创建任务</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>任务详情</SheetTitle><SheetDescription>查看PIR查询任务完整信息</SheetDescription></SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务ID</span><span className="text-sm font-mono">{selectedItem.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">任务名称</span><span className="text-sm font-medium">{selectedItem.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">查询模式</span><Badge variant="outline">{selectedItem.queryMode}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">混淆值</span><span className="text-sm">{selectedItem.obfuscation}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">目标表</span><span className="text-sm font-mono">{selectedItem.targetTable}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">查询方</span><span className="text-sm">{selectedItem.querier}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">查询数</span><span className="text-sm">{selectedItem.queryCount}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">结果数</span><span className="text-sm font-semibold text-emerald-600">{selectedItem.resultCount}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">延迟</span><span className="text-sm">{selectedItem.latency}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">创建时间</span><span className="text-sm">{selectedItem.createdAt}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleToggleStatus(selectedItem.id)}>{selectedItem.status === "执行中" ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />启动</>}</Button>
                <Button variant="outline" className="gap-2" onClick={() => handleCopy(selectedItem)}><Copy className="w-4 h-4" />复制</Button>
                {selectedItem.status === "已完成" && <Button className="gap-2 col-span-2" variant="outline" onClick={() => setExportOpen(true)}><Download className="w-4 h-4" />导出结果</Button>}
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

      {/* Export Dialog */}
      {exportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setExportOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold mb-1">导出结果</h2>
            <p className="text-sm text-gray-500 mb-4">选择导出格式</p>
            <div className="space-y-2">
              {["csv", "json", "parquet"].map(fmt => (
                <div key={fmt} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${exportFormat === fmt ? "border-indigo-300 bg-indigo-50" : "border-gray-200"}`} onClick={() => setExportFormat(fmt)}>
                  <div className={`w-4 h-4 rounded-full border ${exportFormat === fmt ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`} /><span className="text-sm font-medium uppercase">{fmt}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4"><Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button><Button onClick={() => setExportOpen(false)}>导出</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
