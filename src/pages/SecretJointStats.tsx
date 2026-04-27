import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart3, Play, Pause, RotateCcw, FileOutput,
  Eye, Plus, Search, Filter, TrendingUp,
  Users, CheckCircle2, Clock, AlertTriangle,
  BarChart4, Settings, Download, Trash2, Copy,
} from "lucide-react";

interface StatsTask {
  id: string;
  name: string;
  status: string;
  metrics: string;
  groupBy: string;
  aggMethod: string;
  parties: number;
  createTime: string;
  completeTime: string;
  resultSize: string;
}

const statsTasks: StatsTask[] = [
  { id: "JS-2024-001", name: "金融客户联合画像统计", status: "completed", metrics: "年龄分布、收入层级、风险偏好", groupBy: "地域、行业", aggMethod: "COUNT, AVG, PERCENTILE", parties: 3, createTime: "2024-04-15 09:30", completeTime: "2024-04-15 10:15", resultSize: "2.4 MB" },
  { id: "JS-2024-002", name: "医疗数据联合流行病学分析", status: "running", metrics: "发病率、治愈率、存活率", groupBy: "年龄段、性别", aggMethod: "SUM, RATE, CONFIDENCE", parties: 5, createTime: "2024-04-16 14:00", completeTime: "-", resultSize: "-" },
  { id: "JS-2024-003", name: "电商联合消费行为统计", status: "pending", metrics: "客单价、复购率、品类偏好", groupBy: "用户等级、渠道", aggMethod: "AVG, COUNT_DISTINCT, TOPN", parties: 4, createTime: "2024-04-17 11:20", completeTime: "-", resultSize: "-" },
  { id: "JS-2024-004", name: "政务数据联合人口统计", status: "completed", metrics: "人口结构、就业分布、教育水平", groupBy: "行政区划", aggMethod: "COUNT, RATIO, PERCENTILE", parties: 6, createTime: "2024-04-10 08:00", completeTime: "2024-04-10 09:45", resultSize: "8.1 MB" },
  { id: "JS-2024-005", name: "保险联合风险评估统计", status: "failed", metrics: "赔付率、风险评分、保额分布", groupBy: "险种、区域", aggMethod: "AVG, STD, PERCENTILE", parties: 3, createTime: "2024-04-14 16:30", completeTime: "2024-04-14 16:35", resultSize: "-" },
];

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: "已完成", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  running: { label: "执行中", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
  pending: { label: "待执行", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  failed: { label: "执行失败", color: "bg-red-50 text-red-700 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const templates = [
  { id: "TP-001", name: "人口统计模板", metrics: "人口结构、就业分布", groupBy: "行政区划", aggMethod: "COUNT, RATIO", parties: 6 },
  { id: "TP-002", name: "金融分析模板", metrics: "收入层级、风险偏好", groupBy: "地域、行业", aggMethod: "AVG, PERCENTILE", parties: 3 },
];

export default function SecretJointStats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StatsTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const [formName, setFormName] = useState("");
  const [formMetrics, setFormMetrics] = useState("");
  const [formGroupBy, setFormGroupBy] = useState("");
  const [formAgg, setFormAgg] = useState("");
  const [formParties, setFormParties] = useState(2);

  const filteredTasks = statsTasks.filter((task) => {
    const matchSearch = task.name.includes(searchQuery) || task.id.includes(searchQuery);
    const matchStatus = statusFilter === "all" || task.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    setFormName(""); setFormMetrics(""); setFormGroupBy(""); setFormAgg(""); setFormParties(2);
    setCreateOpen(true);
  };

  const handleSave = () => {
    if (!formName) return;
    statsTasks.unshift({
      id: `JS-2024-${String(statsTasks.length + 1).padStart(3, '0')}`,
      name: formName, status: "pending",
      metrics: formMetrics || "未配置",
      groupBy: formGroupBy || "未配置",
      aggMethod: formAgg || "COUNT",
      parties: formParties,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      completeTime: "-", resultSize: "-",
    });
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => { setDeleteId(id); setDeleteOpen(true); };
  const confirmDelete = () => {
    const idx = statsTasks.findIndex(t => t.id === deleteId);
    if (idx >= 0) statsTasks.splice(idx, 1);
    setDeleteOpen(false);
    if (selectedItem?.id === deleteId) setDetailOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const t = statsTasks.find(x => x.id === id);
    if (!t) return;
    if (t.status === "pending") t.status = "running";
    else if (t.status === "running") t.status = "paused";
    else if (t.status === "paused") t.status = "running";
    else if (t.status === "failed") t.status = "pending";
  };

  const handleCopy = (task: StatsTask) => {
    statsTasks.unshift({ ...task, id: `JS-2024-${String(statsTasks.length + 1).padStart(3, '0')}`, name: `${task.name} (复制)`, status: "pending", completeTime: "-", resultSize: "-" });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联合统计</h1>
          <p className="text-sm text-gray-500 mt-1.5">多方协同计算统计指标，数据不出域</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />创建统计任务
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="w-5 h-5 text-blue-600" /><div><div className="text-2xl font-bold text-gray-900">{statsTasks.length}</div><div className="text-xs text-gray-500">统计任务</div></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-600" /><div><div className="text-2xl font-bold text-gray-900">{statsTasks.filter(t => t.status === "completed").length}</div><div className="text-xs text-gray-500">已完成</div></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Users className="w-5 h-5 text-amber-600" /><div><div className="text-2xl font-bold text-gray-900">{(statsTasks.reduce((s, t) => s + t.parties, 0) / statsTasks.length).toFixed(1)}</div><div className="text-xs text-gray-500">平均参与方</div></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="w-5 h-5 text-purple-600" /><div><div className="text-2xl font-bold text-gray-900">98.5%</div><div className="text-xs text-gray-500">任务成功率</div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><BarChart3 className="w-4 h-4" />统计任务</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><Settings className="w-4 h-4" />模板配置</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><BarChart4 className="w-4 h-4" />执行历史</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="搜索任务ID或名称..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="running">执行中</SelectItem>
                <SelectItem value="pending">待执行</SelectItem>
                <SelectItem value="failed">执行失败</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3"><CardTitle className="text-base">统计任务列表</CardTitle></CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    {["任务ID", "名称", "状态", "统计指标", "分组字段", "聚合方式", "参与方", "创建时间", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {filteredTasks.map((task) => {
                    const s = statusMap[task.status];
                    return (
                      <TableRow key={task.id} className="hover:bg-indigo-50/30 transition-colors">
                        <TableCell className="font-mono text-xs text-gray-500">{task.id}</TableCell>
                        <TableCell className="font-medium text-sm">{task.name}</TableCell>
                        <TableCell><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                        <TableCell className="text-xs max-w-[180px] truncate">{task.metrics}</TableCell>
                        <TableCell className="text-xs">{task.groupBy}</TableCell>
                        <TableCell className="text-xs font-mono">{task.aggMethod}</TableCell>
                        <TableCell>{task.parties} 方</TableCell>
                        <TableCell className="text-xs text-gray-500">{task.createTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {task.status === "pending" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(task.id)}><Play className="w-4 h-4" /></Button>}
                            {task.status === "running" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(task.id)}><Pause className="w-4 h-4" /></Button>}
                            {task.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(task.id)}><RotateCcw className="w-4 h-4" /></Button>}
                            {task.status === "completed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(task); setExportOpen(true); }}><FileOutput className="w-4 h-4" /></Button>}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(task); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(task)}><Copy className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">统计模板库</h3>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />新建模板</Button>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["模板ID", "名称", "统计指标", "分组字段", "聚合方式", "参与方数", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(tp => (
                  <TableRow key={tp.id} className="hover:bg-indigo-50/30">
                    <TableCell className="font-mono text-xs">{tp.id}</TableCell>
                    <TableCell className="font-medium">{tp.name}</TableCell>
                    <TableCell className="text-xs">{tp.metrics}</TableCell>
                    <TableCell className="text-xs">{tp.groupBy}</TableCell>
                    <TableCell className="text-xs font-mono">{tp.aggMethod}</TableCell>
                    <TableCell>{tp.parties} 方</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => { setFormName(tp.name); setFormMetrics(tp.metrics); setFormGroupBy(tp.groupBy); setFormAgg(tp.aggMethod); setFormParties(tp.parties); setCreateOpen(true); }}>使用模板</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  {["任务ID", "名称", "状态", "完成时间", "结果大小", "参与方", "操作"].map(h => <TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsTasks.filter(t => t.status === "completed" || t.status === "failed").map(t => (
                  <TableRow key={t.id} className="hover:bg-indigo-50/30">
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell><Badge className={t.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>{t.status === "completed" ? "成功" : "失败"}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">{t.completeTime}</TableCell>
                    <TableCell>{t.resultSize || "-"}</TableCell>
                    <TableCell>{t.parties} 方</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem(t); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        {t.status === "completed" && <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>}
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
            <h2 className="text-lg font-semibold mb-1">创建统计任务</h2>
            <p className="text-sm text-gray-500 mb-4">配置统计指标、分组和聚合方式</p>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">任务名称 <span className="text-red-500">*</span></label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="如：人口结构统计" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">统计指标</label><Input value={formMetrics} onChange={e => setFormMetrics(e.target.value)} placeholder="如：年龄分布、收入层级" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">分组字段</label><Input value={formGroupBy} onChange={e => setFormGroupBy(e.target.value)} placeholder="如：地域、行业" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">聚合方式</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formAgg} onChange={e => setFormAgg(e.target.value)}>
                  <option value="">请选择</option><option value="COUNT">COUNT</option><option value="AVG">AVG</option><option value="SUM">SUM</option><option value="STD">STD</option><option value="PERCENTILE">PERCENTILE</option><option value="COUNT_DISTINCT">COUNT_DISTINCT</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">参与方数</label>
                <Input type="number" min={2} max={10} value={formParties} onChange={e => setFormParties(Number(e.target.value))} />
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
          <SheetHeader><SheetTitle>任务详情</SheetTitle><SheetDescription>查看统计任务完整信息</SheetDescription></SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                {[
                  ["任务ID", selectedItem.id], ["任务名称", selectedItem.name], ["统计指标", selectedItem.metrics],
                  ["分组字段", selectedItem.groupBy], ["聚合方式", selectedItem.aggMethod], ["参与方数", `${selectedItem.parties} 方`],
                  ["创建时间", selectedItem.createTime], ["完成时间", selectedItem.completeTime],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between"><span className="text-sm text-gray-500">{label}</span><span className="text-sm">{val}</span></div>
                ))}
                <div className="flex justify-between"><span className="text-sm text-gray-500">结果大小</span><span className="text-sm font-semibold">{selectedItem.resultSize || "-"}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => handleToggleStatus(selectedItem.id)}>{selectedItem.status === "running" ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />启动</>}</Button>
                <Button variant="outline" className="gap-2 text-red-500" onClick={() => handleDelete(selectedItem.id)}><Trash2 className="w-4 h-4" />删除</Button>
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button>
              <Button onClick={() => setExportOpen(false)}><Download className="w-4 h-4 mr-2" />导出</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
