import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Plus, Search, Eye, Pencil, Trash } from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
interface MaskingRule {
  id: string;
  name: string;
  fieldType: string;
  method: string;
  strength: string;
  pattern: string;
  status: string;
  description: string;
}

/* ─── Mock Data ─── */
const initialData: MaskingRule[] = [
  { id: "MR-001", name: "手机号掩码", fieldType: "手机号", method: "mask", strength: "高", pattern: "(\d{3})\d{4}(\d{4})", status: "active", description: "保留前3位和后4位，中间用*代替" },
  { id: "MR-002", name: "姓名脱敏", fieldType: "姓名", method: "mask", strength: "中", pattern: "^(\S)\S+(\S)$", status: "active", description: "保留姓氏和名字最后一个字" },
  { id: "MR-003", name: "身份证号哈希", fieldType: "身份证", method: "hash", strength: "高", pattern: "sha256", status: "active", description: "使用SHA256哈希算法进行不可逆转换" },
  { id: "MR-004", name: "邮箱替换", fieldType: "邮箱", method: "replace", strength: "中", pattern: "***@domain", status: "active", description: "用户名部分替换为***，保留域名" },
  { id: "MR-005", name: "地址模糊", fieldType: "地址", method: "fuzz", strength: "低", pattern: "保留省市区，模糊街道", status: "inactive", description: "保留省级、市级、区级信息，街道地址模糊处理" },
];

/* ─── Fields ─── */
const ruleFields: FieldConfig[] = [
  { key: "id", label: "规则ID", type: "text", required: true },
  { key: "name", label: "规则名称", type: "text", required: true },
  { key: "fieldType", label: "字段类型", type: "select", required: true, options: [{ label: "手机号", value: "手机号" }, { label: "姓名", value: "姓名" }, { label: "身份证", value: "身份证" }, { label: "邮箱", value: "邮箱" }, { label: "地址", value: "地址" }, { label: "银行卡", value: "银行卡" }] },
  { key: "method", label: "脱敏方式", type: "select", required: true, options: [{ label: "掩码", value: "mask" }, { label: "哈希", value: "hash" }, { label: "替换", value: "replace" }, { label: "模糊", value: "fuzz" }, { label: "截断", value: "truncate" }] },
  { key: "strength", label: "强度", type: "select", required: true, options: [{ label: "高", value: "高" }, { label: "中", value: "中" }, { label: "低", value: "低" }] },
  { key: "pattern", label: "匹配模式", type: "text", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
  { key: "description", label: "描述", type: "textarea", required: true },
];

const detailFields = [
  { key: "id", label: "规则ID" },
  { key: "name", label: "规则名称" },
  { key: "fieldType", label: "字段类型", type: "badge" as const },
  { key: "method", label: "脱敏方式", type: "badge" as const },
  { key: "strength", label: "强度", type: "badge" as const },
  { key: "pattern", label: "匹配模式" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "description", label: "描述" },
];

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const methodText = (method: string) => {
  const map: Record<string, string> = { hash: "哈希", mask: "掩码", replace: "替换", fuzz: "模糊", truncate: "截断" };
  return map[method] || method;
};

export default function DataMaskingRules() {
  const [data, setData] = useState<MaskingRule[]>(initialData);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<MaskingRule | null>(null);

  const filtered = data.filter(d => d.name.includes(search) || d.id.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({ id: "", name: "", fieldType: "手机号", method: "mask", strength: "中", pattern: "", status: "active", description: "" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: MaskingRule) => {
    setDialogMode("edit");
    setDialogData({ ...item });
    setEditingId(item.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (item: MaskingRule) => {
    setDialogMode("delete");
    setEditingId(item.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (dialogMode === "create") {
      const newItem: MaskingRule = {
        id: formData.id,
        name: formData.name,
        fieldType: formData.fieldType,
        method: formData.method,
        strength: formData.strength,
        pattern: formData.pattern,
        status: formData.status,
        description: formData.description,
      };
      setData(prev => [...prev, newItem]);
    } else if (dialogMode === "edit" && editingId) {
      setData(prev =>
        prev.map(d =>
          d.id === editingId
            ? { ...d, ...formData }
            : d
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setData(prev => prev.filter(d => d.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (item: MaskingRule) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/sandbox">数据沙箱</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>脱敏规则</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">脱敏规则</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">数据脱敏规则配置管理</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />新建
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="dark:bg-[#1e293b] dark:border-gray-700"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold dark:text-gray-100">{data.length}</div></CardContent></Card>
        <Card className="dark:bg-[#1e293b] dark:border-gray-700"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">启用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600 dark:text-green-400">{data.filter(d => d.status === "active").length}</div></CardContent></Card>
        <Card className="dark:bg-[#1e293b] dark:border-gray-700"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">停用</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{data.filter(d => d.status === "inactive").length}</div></CardContent></Card>
        <Card className="dark:bg-[#1e293b] dark:border-gray-700"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">高敏感</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.filter(d => d.strength === "高").length}</div></CardContent></Card>
      </div>

      <Card className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索关键词" value={search} onChange={e => setSearch(e.target.value)} className="w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-gray-300 text-gray-600 dark:text-gray-300 rounded-lg"><Search className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-400">ID</TableHead>
                <TableHead className="dark:text-gray-400">名称</TableHead>
                <TableHead className="dark:text-gray-400">字段类型</TableHead>
                <TableHead className="dark:text-gray-400">脱敏方式</TableHead>
                <TableHead className="dark:text-gray-400">强度</TableHead>
                <TableHead className="dark:text-gray-400">匹配模式</TableHead>
                <TableHead className="dark:text-gray-400">状态</TableHead>
                <TableHead className="dark:text-gray-400">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id} className="dark:border-gray-700">
                  <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{d.id}</TableCell>
                  <TableCell className="font-medium dark:text-gray-200">{d.name}</TableCell>
                  <TableCell><Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{d.fieldType}</Badge></TableCell>
                  <TableCell><Badge className={cn("text-xs", d.method === "hash" ? "bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : d.method === "mask" ? "bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : d.method === "replace" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}>{methodText(d.method)}</Badge></TableCell>
                  <TableCell><Badge className={cn("text-xs", d.strength === "高" ? "bg-red-500/10 text-red-600 dark:bg-red-900/30 dark:text-red-400" : d.strength === "中" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}>{d.strength}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{d.pattern}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status === "active" ? "启用" : "停用"}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-all duration-200" onClick={() => openDetail(d)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-lg transition-all duration-200" onClick={() => handleEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-all duration-200" onClick={() => handleDelete(d)}><Trash className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`规则详情 - ${detailItem?.name || ""}`}
        data={detailItem || {}}
        fields={detailFields}
        onEdit={detailItem ? () => handleEdit(detailItem) : undefined}
        onDelete={detailItem ? () => handleDelete(detailItem) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${data.find((d) => d.id === editingId)?.name || "脱敏规则"}` : "脱敏规则"}
        fields={ruleFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
