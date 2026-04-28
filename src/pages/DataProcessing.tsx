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
  Search, Play, Pause, Plus, Trash2, Edit3, Eye, Wand2,
  Settings, Clock, CheckCircle2, AlertTriangle, XCircle,
  RotateCcw, Copy, Download, Filter, Layers, FileText, History,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

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

const initialProcessTasks: ProcessTask[] = [
  { id: "PP-2024-001", name: "客户数据脱敏", source: "mysql.user_profiles", method: "数据脱敏", status: "completed", progress: 100, records: 2400000, createdAt: "2024-04-15 09:00", duration: "3分20秒", config: "手机号掩码、姓名哈希、地址截断" },
  { id: "PP-2024-002", name: "交易数据标准化", source: "csv.transactions", method: "标准化", status: "running", progress: 67, records: 12000000, createdAt: "2024-04-15 10:30", duration: "-", config: "金额归一化、时间戳统一编码" },
  { id: "PP-2024-003", name: "用户标签编码", source: "mysql.user_tags", method: "编码转换", status: "pending", progress: 0, records: 850000, createdAt: "2024-04-15 14:00", duration: "-", config: "One-Hot编码、标签映射表" },
  { id: "PP-2024-004", name: "缺失值填充", source: "csv.risk_data", method: "缺失值处理", status: "failed", progress: 12, records: 120000, createdAt: "2024-04-14 16:00", duration: "45秒", config: "均值填充、异常值标记" },
  { id: "PP-2024-005", name: "特征工程-用户画像", source: "mysql.features", method: "特征工程", status: "completed", progress: 100, records: 5600000, createdAt: "2024-04-13 09:00", duration: "8分15秒", config: "衍生特征、交叉特征、时间特征" },
  { id: "PP-2024-006", name: "数据合并-多源融合", source: "mysql.multi_source", method: "数据合并", status: "running", progress: 45, records: 8900000, createdAt: "2024-04-16 10:00", duration: "-", config: "主键关联、冲突处理、去重" },
  { id: "PP-2024-007", name: "日志数据清洗", source: "elasticsearch.logs", method: "数据脱敏", status: "pending", progress: 0, records: 45000000, createdAt: "2024-04-17 08:00", duration: "-", config: "IP脱敏、UA解析、时间格式化" },
  { id: "PP-2024-008", name: "评分卡数据标准化", source: "csv.scorecards", method: "标准化", status: "completed", progress: 100, records: 320000, createdAt: "2024-04-12 14:00", duration: "2分10秒", config: "WOE编码、IV计算、分箱" },
  { id: "PP-2024-009", name: "商品分类编码", source: "mysql.products", method: "编码转换", status: "已暂停", progress: 78, records: 1200000, createdAt: "2024-04-18 09:30", duration: "4分30秒", config: "层级编码、属性提取、向量化" },
  { id: "PP-2024-010", name: "风控特征工程", source: "mysql.risk_features", method: "特征工程", status: "completed", progress: 100, records: 7800000, createdAt: "2024-04-11 11:00", duration: "12分45秒", config: "滑动窗口统计、比率特征、趋势特征" },
];

const initialTemplates: ProcessTemplate[] = [
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

const methodOptions = [
  { label: "数据脱敏", value: "数据脱敏" },
  { label: "标准化", value: "标准化" },
  { label: "编码转换", value: "编码转换" },
  { label: "缺失值处理", value: "缺失值处理" },
  { label: "特征工程", value: "特征工程" },
  { label: "数据合并", value: "数据合并" },
];

const crudFields: FieldConfig[] = [
  { key: "name", label: "任务名称", type: "text", required: true, placeholder: "如：客户数据脱敏" },
  { key: "source", label: "数据源", type: "text", required: true, placeholder: "如：mysql.user_profiles" },
  { key: "method", label: "处理方式", type: "select", options: methodOptions, required: true },
  { key: "config", label: "处理配置", type: "textarea", placeholder: "描述具体的处理步骤和参数..." },
];

const detailFields = [
  { key: "id", label: "任务ID", type: "text" as const },
  { key: "name", label: "任务名称", type: "text" as const },
  { key: "source", label: "数据源", type: "text" as const },
  { key: "method", label: "处理方式", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "records", label: "记录数", type: "text" as const },
  { key: "createdAt", label: "创建时间", type: "date" as const },
  { key: "duration", label: "耗时", type: "text" as const },
  { key: "config", label: "处理配置", type: "text" as const },
];

export default function DataProcessing() {
  const [processTasks, setProcessTasks] = useState<ProcessTask[]>(initialProcessTasks);
  const [templates] = useState<ProcessTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcessTask | null>(null);

  const filtered = processTasks.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (task: ProcessTask) => {
    setSelectedItem(task);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (task: ProcessTask) => {
    setSelectedItem(task);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (task: ProcessTask) => {
    setSelectedItem(task);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newTask: ProcessTask = {
        id: `PP-${Date.now().toString(36).toUpperCase()}`,
        name: data.name,
        source: data.source,
        method: data.method,
        status: "pending",
        progress: 0,
        records: 0,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        duration: "-",
        config: data.config || "未配置",
      };
      setProcessTasks(prev => [newTask, ...prev]);
    } else if (dialogMode === "edit" && selectedItem) {
      setProcessTasks(prev => prev.map(t => t.id === selectedItem.id ? { ...t, ...data } : t));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setProcessTasks(prev => prev.filter(t => t.id !== selectedItem.id));
      setDrawerOpen(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setProcessTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      let nextStatus = t.status;
      if (t.status === "pending") nextStatus = "running";
      else if (t.status === "running") nextStatus = "paused";
      else if (t.status === "paused") nextStatus = "running";
      else if (t.status === "failed") nextStatus = "pending";
      else if (t.status === "completed") nextStatus = "pending";
      return { ...t, status: nextStatus };
    }));
  };

  const handleCopy = (task: ProcessTask) => {
    const newTask: ProcessTask = {
      ...task,
      id: `PP-${Date.now().toString(36).toUpperCase()}`,
      name: `${task.name} (复制)`,
      status: "pending",
      progress: 0,
      duration: "-",
    };
    setProcessTasks(prev => [newTask, ...prev]);
  };

  const handleUseTemplate = (tp: ProcessTemplate) => {
    setSelectedItem({
      id: "",
      name: tp.name,
      source: "",
      method: tp.method,
      status: "pending",
      progress: 0,
      records: 0,
      createdAt: "",
      duration: "-",
      config: tp.description,
    });
    setDialogMode("create");
    setDialogOpen(true);
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(d)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(d)}><Copy className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}>{d.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                          {d.status === "failed" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(d.id)}><RotateCcw className="h-4 w-4" /></Button>}
                          {d.status === "completed" && <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(d)}><Trash2 className="h-4 w-4" /></Button>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(d)}><Eye className="h-4 w-4" /></Button>
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

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="预处理任务"
        fields={crudFields}
        data={selectedItem || undefined}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="预处理任务详情"
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={() => { if (selectedItem) handleEdit(selectedItem); }}
        onDelete={() => { if (selectedItem) handleDelete(selectedItem); }}
      />
    </div>
  );
}
