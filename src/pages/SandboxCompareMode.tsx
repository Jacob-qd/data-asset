import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, GitCompare, ArrowRightLeft, BarChart3, FileSearch, CheckCircle, XCircle, AlertTriangle, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import type { FieldConfig } from "@/components/CrudDialog";

type CompareTask = {
  id: string;
  name: string;
  sourceVersion: string;
  targetVersion: string;
  total: number;
  changed: number;
  unchanged: number;
  added: number;
  deleted: number;
};

const compareFields: FieldConfig[] = [
  { key: "id", label: "任务ID", type: "text", required: true, placeholder: "如 CMP-001" },
  { key: "name", label: "任务名称", type: "text", required: true },
  { key: "sourceVersion", label: "源版本", type: "text", required: true, placeholder: "如 v1.0" },
  { key: "targetVersion", label: "目标版本", type: "text", required: true, placeholder: "如 v2.0" },
  { key: "total", label: "总记录", type: "number", required: true },
  { key: "changed", label: "变更记录", type: "number", required: true },
  { key: "unchanged", label: "未变更", type: "number", required: true },
  { key: "added", label: "新增", type: "number", required: true },
  { key: "deleted", label: "删除", type: "number", required: true },
];

const detailFields = [
  { key: "id", label: "任务ID" },
  { key: "name", label: "任务名称" },
  { key: "sourceVersion", label: "源版本", type: "badge" as const },
  { key: "targetVersion", label: "目标版本", type: "badge" as const },
  { key: "total", label: "总记录" },
  { key: "changed", label: "变更记录" },
  { key: "unchanged", label: "未变更" },
  { key: "added", label: "新增" },
  { key: "deleted", label: "删除" },
];

const diffData = [
  { row: 1, user_id: "10001", name_before: "张三", name_after: "张三", age_before: "28", age_after: "28", income_before: "8000", income_after: "8500", changed: true, fields: ["income"] },
  { row: 2, user_id: "10002", name_before: "李四", name_after: "李四", age_before: "35", age_after: "35", income_before: "12000", income_after: "12000", changed: false, fields: [] },
  { row: 3, user_id: "10003", name_before: "王五", name_after: "王五", age_before: "22", age_after: "25", income_before: "5000", income_after: "5800", changed: true, fields: ["age", "income"] },
  { row: 4, user_id: "10004", name_before: "赵六", name_after: "赵六", age_before: "41", age_after: "41", income_before: "20000", income_after: "20000", changed: false, fields: [] },
  { row: 5, user_id: "10005", name_before: "钱七", name_after: "钱七", age_before: "19", age_after: "19", income_before: "3500", income_after: "3500", changed: false, fields: [] },
];

const fieldDiffs = [
  { field: "income", changed: 45230, pct: "3.6%", type: "数值修改" },
  { field: "age", changed: 12340, pct: "0.98%", type: "缺失值填充" },
  { field: "phone", changed: 8900, pct: "0.71%", type: "格式标准化" },
  { field: "address", changed: 22764, pct: "1.81%", type: "文本清洗" },
];

export default function SandboxCompareMode() {
  const [compareTasks, setCompareTasks] = useState<CompareTask[]>([
    { id: "CMP-001", name: "用户画像-v1→v2", sourceVersion: "v1.0", targetVersion: "v2.0", total: 1256789, changed: 89234, unchanged: 1167555, added: 4567, deleted: 5433 },
  ]);

  const [viewMode, setViewMode] = useState<"side" | "diff">("side");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<CompareTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeTask = compareTasks[0];

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (item: CompareTask) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleView = (item: CompareTask) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (item: CompareTask) => {
    setSelectedItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      setCompareTasks([...compareTasks, data as CompareTask]);
    } else if (dialogMode === "edit" && selectedItem) {
      setCompareTasks(compareTasks.map(t => t.id === selectedItem.id ? { ...data, id: selectedItem.id } as CompareTask : t));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setCompareTasks(compareTasks.filter(t => t.id !== selectedItem.id));
    }
  };

  const stats = activeTask || { total: 0, changed: 0, unchanged: 0, added: 0, deleted: 0 };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/sandbox">数据沙箱</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>对比模式</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">对比模式</h1>
          <p className="text-sm text-gray-500 mt-1.5">原始数据与处理后数据的差异对比视图，追踪每一次数据变更</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button size="sm" variant={viewMode === "side" ? "default" : "outline"} onClick={() => setViewMode("side")} className={viewMode === "side" ? "bg-indigo-600" : ""}><GitCompare className="h-4 w-4 mr-1" />并排对比</Button>
            <Button size="sm" variant={viewMode === "diff" ? "default" : "outline"} onClick={() => setViewMode("diff")} className={viewMode === "diff" ? "bg-indigo-600" : ""}><ArrowRightLeft className="h-4 w-4 mr-1" />差异模式</Button>
          </div>
          <Button onClick={handleCreate} className="gap-2"><Plus className="h-4 w-4" />新建对比任务</Button>
        </div>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><CardTitle className="text-base">对比任务列表</CardTitle></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-100">
                {["任务ID", "任务名称", "源版本", "目标版本", "总记录", "变更", "未变更", "新增", "删除", "操作"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {compareTasks.map((t) => (
                <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                  <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                  <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                  <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{t.sourceVersion}</Badge></TableCell>
                  <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{t.targetVersion}</Badge></TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{t.total.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-blue-600">{t.changed.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{t.unchanged.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-emerald-600">+{t.added.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-red-600">-{t.deleted.toLocaleString()}</TableCell>
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

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">总记录</p><p className="text-lg font-bold">{stats.total.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">变更记录</p><p className="text-lg font-bold text-blue-600">{stats.changed.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">新增记录</p><p className="text-lg font-bold text-emerald-600">+{stats.added.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">删除记录</p><p className="text-lg font-bold text-red-600">-{stats.deleted.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">变更率</p><p className="text-lg font-bold text-amber-600">{stats.total > 0 ? ((stats.changed / stats.total) * 100).toFixed(2) : "0.00"}%</p></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b"><CardTitle className="text-base">字段变更统计</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-100">
                {["字段名", "变更类型", "变更记录数", "变更占比"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {fieldDiffs.map((f) => (
                <TableRow key={f.field} className="hover:bg-indigo-50/30 transition-colors">
                  <TableCell className="py-3.5 px-4 font-medium text-sm">{f.field}</TableCell>
                  <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{f.type}</Badge></TableCell>
                  <TableCell className="py-3.5 px-4 text-sm">{f.changed.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm text-amber-600">{f.pct}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-base">数据对比详情（样本）</CardTitle>
            {viewMode === "side" && <Badge className="bg-blue-50 text-blue-700">并排模式</Badge>}
            {viewMode === "diff" && <Badge className="bg-amber-50 text-amber-700">差异模式</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-100">
                {viewMode === "side"
                  ? ["行号", "user_id", "name(前)", "name(后)", "age(前)", "age(后)", "income(前)", "income(后)", "状态"].map((h) => <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>)
                  : ["行号", "user_id", "name", "age", "income", "变更字段", "状态"].map((h) => <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>)
                }
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {diffData.map((d) => (
                <TableRow key={d.row} className={d.changed ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-indigo-50/30 transition-colors"}>
                  {viewMode === "side" ? (
                    <>
                      <TableCell className="py-3.5 px-4 text-sm">{d.row}</TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-xs">{d.user_id}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">{d.name_before}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">{d.name_after}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.age_before !== d.age_after ? "bg-amber-100 font-semibold" : ""}`}>{d.age_before}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.age_before !== d.age_after ? "bg-amber-100 font-semibold" : ""}`}>{d.age_after}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.income_before !== d.income_after ? "bg-amber-100 font-semibold" : ""}`}>{d.income_before}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.income_before !== d.income_after ? "bg-amber-100 font-semibold" : ""}`}>{d.income_after}</TableCell>
                      <TableCell className="py-3.5 px-4">{d.changed ? <XCircle className="h-4 w-4 text-amber-500" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="py-3.5 px-4 text-sm">{d.row}</TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-xs">{d.user_id}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">{d.name_after}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.age_before !== d.age_after ? "bg-amber-100 font-semibold text-amber-800" : ""}`}>{d.age_after}</TableCell>
                      <TableCell className={`py-3.5 px-4 text-sm ${d.income_before !== d.income_after ? "bg-amber-100 font-semibold text-amber-800" : ""}`}>{d.income_after}</TableCell>
                      <TableCell className="py-3.5 px-4 text-xs">{d.fields.join(", ") || "-"}</TableCell>
                      <TableCell className="py-3.5 px-4">{d.changed ? <Badge className="bg-amber-50 text-amber-700 text-xs">已变更</Badge> : <Badge className="bg-emerald-50 text-emerald-700 text-xs">一致</Badge>}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="对比任务"
        fields={compareFields}
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
