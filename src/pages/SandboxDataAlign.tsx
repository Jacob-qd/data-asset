import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Play, GitCompare, Hash, Key, Split, CheckCircle, AlertTriangle, Clock, Users, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";

type AlignTask = {
  id: string;
  name: string;
  method: string;
  status: string;
  totalA: number;
  totalB: number;
  matched: number;
  unmatched: number;
  dupA: number;
  dupB: number;
  duration: string;
};

type MethodConfig = {
  method: string;
  desc: string;
  complexity: string;
  collision: string;
};

const statusColor: Record<string, string> = {
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "执行中": "bg-blue-50 text-blue-700 border-blue-100",
  "待执行": "bg-slate-50 text-slate-600 border-slate-200",
};

const methodOptions = ["SM3哈希", "MD5哈希", "OTE对齐", "主键拆分"];
const statusOptions = ["已完成", "执行中", "待执行"];

const alignFields: FieldConfig[] = [
  { key: "id", label: "任务ID", type: "text", required: true, placeholder: "如 DA-001" },
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "method", label: "对齐方法", type: "select", required: true, options: methodOptions.map(m => ({ label: m, value: m })) },
  { key: "status", label: "状态", type: "select", required: true, options: statusOptions.map(s => ({ label: s, value: s })) },
  { key: "totalA", label: "A方总量", type: "number", required: true },
  { key: "totalB", label: "B方总量", type: "number", required: true },
  { key: "matched", label: "匹配量", type: "number", required: true },
  { key: "unmatched", label: "未匹配量", type: "number", required: true },
  { key: "dupA", label: "重复A", type: "number", required: true },
  { key: "dupB", label: "重复B", type: "number", required: true },
  { key: "duration", label: "耗时", type: "text", required: true, placeholder: "如 12分30秒" },
];

const detailFields = [
  { key: "id", label: "任务ID" },
  { key: "name", label: "任务名称" },
  { key: "method", label: "对齐方法", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "totalA", label: "A方总量" },
  { key: "totalB", label: "B方总量" },
  { key: "matched", label: "匹配量" },
  { key: "unmatched", label: "未匹配量" },
  { key: "dupA", label: "重复A" },
  { key: "dupB", label: "重复B" },
  { key: "duration", label: "耗时" },
];

export default function SandboxDataAlign() {
  const [alignTasks, setAlignTasks] = useState<AlignTask[]>([
    { id: "DA-001", name: "用户ID对齐-机构A+B", method: "SM3哈希", status: "已完成", totalA: 1256789, totalB: 980345, matched: 845230, unmatched: 411559, dupA: 23, dupB: 156, duration: "12分30秒" },
    { id: "DA-002", name: "订单ID对齐-三方", method: "OTE对齐", status: "执行中", totalA: 5689200, totalB: 3421000, matched: 2894500, unmatched: 0, dupA: 0, dupB: 0, duration: "45分12秒" },
    { id: "DA-003", name: "设备ID对齐-机构B+C", method: "MD5哈希", status: "已完成", totalA: 890000, totalB: 756000, matched: 623400, unmatched: 266600, dupA: 45, dupB: 89, duration: "8分15秒" },
  ]);

  const [methodConfig, setMethodConfig] = useState<MethodConfig[]>([
    { method: "SM3哈希", desc: "国密SM3哈希算法，安全性高，适合敏感ID", complexity: "O(n)", collision: "极低" },
    { method: "MD5哈希", desc: "标准MD5哈希，速度快，适合非敏感ID", complexity: "O(n)", collision: "低" },
    { method: "OTE对齐", desc: "不经意传输扩展，最安全但速度较慢", complexity: "O(n log n)", collision: "无" },
    { method: "主键拆分", desc: "按主键前缀拆分后分别对齐，适合大数据", complexity: "O(n/k)", collision: "低" },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<AlignTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: AlignTask) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: AlignTask) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: AlignTask) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setAlignTasks([...alignTasks, data as AlignTask]);
    } else if (dialogMode === "edit" && selectedItem) {
      setAlignTasks(alignTasks.map(t => t.id === selectedItem.id ? { ...data, id: selectedItem.id } as AlignTask : t));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setAlignTasks(alignTasks.filter(t => t.id !== selectedItem.id));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/sandbox">数据沙箱</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>数据对齐</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">数据对齐</h1>
          <p className="text-sm text-gray-500 mt-1.5">ID对齐工具，支持Hash/SM3/OTE对齐方式，主键拆分配置</p>
        </div>
        <Button onClick={handleCreate} className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建对齐任务</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><GitCompare className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">对齐任务</p><p className="text-lg font-bold">{alignTasks.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已完成</p><p className="text-lg font-bold">{alignTasks.filter((t) => t.status === "已完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Users className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总匹配量</p><p className="text-lg font-bold">{(alignTasks.reduce((s, t) => s + t.matched, 0)).toLocaleString()}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Hash className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">平均匹配率</p><p className="text-lg font-bold">{alignTasks.length > 0 ? ((alignTasks.reduce((s, t) => s + t.matched / t.totalA, 0) / alignTasks.length) * 100).toFixed(1) : "0.0"}%</p></div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Key className="h-5 w-5 text-indigo-600" />对齐方法配置</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {methodConfig.map((m) => (
              <div key={m.method} className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer">
                <h4 className="font-semibold text-sm mb-1">{m.method}</h4>
                <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>复杂度: {m.complexity}</div>
                  <div>碰撞率: {m.collision}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><CardTitle className="text-base">对齐任务列表</CardTitle></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-100">
                {["任务ID", "任务名称", "对齐方法", "A方总量", "B方总量", "匹配量", "匹配率", "重复A", "重复B", "耗时", "状态", "操作"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {alignTasks.map((t) => (
                <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                  <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                  <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                  <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{t.method}</Badge></TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{t.totalA.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{t.totalB.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 font-semibold text-emerald-600">{t.matched.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="w-16"><Progress value={t.totalA > 0 ? (t.matched / t.totalA) * 100 : 0} className="h-1.5" /><span className="text-xs">{t.totalA > 0 ? ((t.matched / t.totalA) * 100).toFixed(1) : "0.0"}%</span></div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-amber-600">{t.dupA}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-amber-600">{t.dupB}</TableCell>
                  <TableCell className="py-3.5 px-4 text-xs text-gray-500">{t.duration}</TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[t.status]}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />{t.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(t)} className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="对齐任务"
        fields={alignFields}
        data={selectedItem || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedItem?.name || "任务详情"}
        data={selectedItem || {}}
        fields={detailFields}
        onEdit={() => { if (selectedItem) { setDrawerOpen(false); handleEdit(selectedItem); } }}
        onDelete={() => { if (selectedItem) { setDrawerOpen(false); handleDelete(selectedItem); } }}
      />
    </div>
  );
}
