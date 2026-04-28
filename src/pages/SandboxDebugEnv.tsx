import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Play, Save, Trash2, Terminal, FileCode, Clock, Cpu, MemoryStick, HardDrive, CheckCircle, AlertTriangle, Plus, Eye, Pencil } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";

type DebugScript = {
  id: string;
  name: string;
  type: string;
  status: string;
  lastRun: string;
  duration: string;
  cpu: string;
  memory: string;
  log: string;
};

const pythonCode = `# 数据清洗 - 调试环境\nimport pandas as pd\nimport numpy as np\n\n# 加载样本数据（仅1000行）\ndf = pd.read_csv("sample://ods_user_info.csv", nrows=1000)\n\n# 查看数据概览\nprint(f"数据形状: {df.shape}")\nprint(f"\\n列信息:")\nprint(df.info())\n\n# 缺失值处理\ndf['age'] = df['age'].fillna(df['age'].median())\nprint(f"\\n缺失值处理完成")\n\n# 异常值检测\nq1 = df['age'].quantile(0.25)\nq3 = df['age'].quantile(0.75)\niqr = q3 - q1\noutliers = df[(df['age'] < q1 - 1.5*iqr) | (df['age'] > q3 + 1.5*iqr)]\nprint(f"异常值数量: {len(outliers)}")\n\nprint(f"\\n调试执行成功！数据已清洗完成")`;

const statusColor: Record<string, string> = {
  "已通过": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "调试失败": "bg-red-50 text-red-700 border-red-100",
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
};

const typeOptions = ["Python", "SQL"];
const statusOptions = ["已通过", "调试失败", "运行中", "待执行"];

const scriptFields: FieldConfig[] = [
  { key: "id", label: "脚本ID", type: "text", required: true, placeholder: "如 DS-001" },
  { key: "name", label: "脚本名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: typeOptions.map(s => ({ label: s, value: s })) },
  { key: "status", label: "状态", type: "select", required: true, options: statusOptions.map(s => ({ label: s, value: s })) },
  { key: "lastRun", label: "最后执行", type: "text", placeholder: "如 2026-04-24 14:30" },
  { key: "duration", label: "执行耗时", type: "text", placeholder: "如 2.3s" },
  { key: "cpu", label: "CPU", type: "text", placeholder: "如 12%" },
  { key: "memory", label: "内存", type: "text", placeholder: "如 256MB" },
  { key: "log", label: "日志", type: "textarea", placeholder: "调试输出日志" },
];

const detailFields = [
  { key: "id", label: "脚本ID" },
  { key: "name", label: "脚本名称" },
  { key: "type", label: "类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "lastRun", label: "最后执行" },
  { key: "duration", label: "执行耗时" },
  { key: "cpu", label: "CPU" },
  { key: "memory", label: "内存" },
  { key: "log", label: "日志" },
];

export default function SandboxDebugEnv() {
  const [debugScripts, setDebugScripts] = useState<DebugScript[]>([
    { id: "DS-001", name: "数据清洗脚本", type: "Python", status: "已通过", lastRun: "2026-04-24 14:30", duration: "2.3s", cpu: "12%", memory: "256MB", log: "✓ 数据加载成功\n✓ 缺失值处理完成\n✓ 异常值检测通过\n✓ 调试执行成功" },
    { id: "DS-002", name: "特征衍生脚本", type: "Python", status: "调试失败", lastRun: "2026-04-24 13:15", duration: "1.8s", cpu: "8%", memory: "128MB", log: "✓ 数据加载成功\n✗ 字段 age_range 不存在\n⚠ 建议检查数据源字段名" },
    { id: "DS-003", name: "数据对齐检查", type: "SQL", status: "已通过", lastRun: "2026-04-24 12:00", duration: "5.1s", cpu: "25%", memory: "512MB", log: "✓ ID对齐率: 98.7%\n✓ 重复ID: 23条\n✓ 缺失ID: 156条\n✓ 对齐检查通过" },
    { id: "DS-004", name: "统计描述脚本", type: "Python", status: "运行中", lastRun: "2026-04-24 14:35", duration: "--", cpu: "45%", memory: "384MB", log: "⏳ 数据加载中...\n⏳ 计算描述统计..." },
  ]);

  const [activeScriptId, setActiveScriptId] = useState<string>(debugScripts[0]?.id || "");
  const [output, setOutput] = useState(debugScripts[0]?.log || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<DebugScript | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeScript = debugScripts.find(s => s.id === activeScriptId) || debugScripts[0];

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: DebugScript) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: DebugScript) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: DebugScript) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newScripts = [...debugScripts, data as DebugScript];
      setDebugScripts(newScripts);
      if (!activeScriptId) {
        setActiveScriptId(data.id);
        setOutput(data.log);
      }
    } else if (dialogMode === "edit" && selectedItem) {
      setDebugScripts(debugScripts.map(s => s.id === selectedItem.id ? { ...data, id: selectedItem.id } as DebugScript : s));
      if (activeScriptId === selectedItem.id) {
        setOutput(data.log || "");
      }
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      const newScripts = debugScripts.filter(s => s.id !== selectedItem.id);
      setDebugScripts(newScripts);
      if (activeScriptId === selectedItem.id && newScripts.length > 0) {
        setActiveScriptId(newScripts[0].id);
        setOutput(newScripts[0].log);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/sandbox">数据沙箱</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>调试环境</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">调试环境</h1>
          <p className="text-sm text-gray-500 mt-1.5">代码调试专用环境，支持Python/SQL脚本编写与调试，仅加载样本数据（≤1000行），与运行环境隔离</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">样本数据模式</Badge>
          <Button onClick={handleCreate} className="gap-2"><Plus className="h-4 w-4" />新建脚本</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">CPU</p><p className="text-lg font-bold">4核</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><MemoryStick className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">内存</p><p className="text-lg font-bold">8GB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><HardDrive className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">数据量</p><p className="text-lg font-bold">≤1000行</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Terminal className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">状态</p><p className="text-lg font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" />就绪</p></div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><CardTitle className="text-base">调试脚本列表</CardTitle></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-100">
                {["脚本ID", "脚本名称", "类型", "执行耗时", "CPU", "内存", "最后执行", "状态", "操作"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {debugScripts.map((s) => (
                <TableRow
                  key={s.id}
                  className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${activeScriptId === s.id ? "bg-indigo-50/50" : ""}`}
                  onClick={() => { setActiveScriptId(s.id); setOutput(s.log); }}
                >
                  <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                  <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                  <TableCell className="py-3.5 px-4"><Badge variant="outline">{s.type}</Badge></TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{s.duration}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{s.cpu}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{s.memory}</TableCell>
                  <TableCell className="py-3.5 px-4 text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{s.lastRun}</TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />{s.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(s); }} className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(s); }} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1"><FileCode className="h-4 w-4 text-blue-600" />{activeScript?.name || "脚本"}.{activeScript?.type === "Python" ? "py" : "sql"}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs"><Save className="h-3 w-3 mr-1" />保存</Button>
                <Button size="sm" className="h-7 text-xs bg-indigo-600"><Play className="h-3 w-3 mr-1" />运行</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-10 bg-gray-50 border-r py-3 pr-1 text-right text-xs text-gray-400 font-mono select-none leading-6">1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11<br/>12<br/>13<br/>14<br/>15<br/>16<br/>17<br/>18<br/>19<br/>20</div>
              <pre className="flex-1 p-3 text-sm font-mono text-gray-800 leading-6 overflow-x-auto bg-[#fafafa]">{pythonCode}</pre>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm flex items-center gap-1"><Terminal className="h-4 w-4 text-emerald-600" />调试输出</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap leading-6 bg-gray-50 rounded-lg p-3">
              {output}
            </pre>
          </CardContent>
        </Card>
      </div>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="调试脚本"
        fields={scriptFields}
        data={selectedItem || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedItem?.name || "脚本详情"}
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={() => { if (selectedItem) { setDrawerOpen(false); handleEdit(selectedItem); } }}
        onDelete={() => { if (selectedItem) { setDrawerOpen(false); handleDelete(selectedItem); } }}
      />
    </div>
  );
}
