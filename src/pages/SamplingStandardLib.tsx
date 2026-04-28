import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import {
  ChevronRight, Plus, Search, BookOpen, Filter, CheckCircle, Hash, FileText, Eye, AlertTriangle, Link2, Pencil, Trash2, Power, PowerOff,
} from "lucide-react";

interface Standard {
  id: string;
  name: string;
  batchSize: string;
  sampleCode: string;
  sampleSize: number;
  ac: number;
  re: number;
  aql: string;
  status: string;
  level: string;
  type: string;
  desc: string;
  affectedRules?: string[];
  updatedAt?: string;
}

const initialStandards: Standard[] = [
  { id: "STD-001", name: "GB/T 2828.1-2012 一般检验水平I", batchSize: "2~8", sampleCode: "A", sampleSize: 2, ac: 0, re: 1, aql: "1.0", status: "已启用", level: "I", type: "一般检验", desc: "适用于破坏性检验或检验费用较高的场景", affectedRules: ["RULE-003", "RULE-007"], updatedAt: "2024-06-01" },
  { id: "STD-002", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "9~15", sampleCode: "B", sampleSize: 3, ac: 0, re: 1, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景", affectedRules: ["RULE-001", "RULE-002", "RULE-004", "RULE-005", "RULE-006"], updatedAt: "2025-01-15" },
  { id: "STD-003", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "16~25", sampleCode: "C", sampleSize: 5, ac: 0, re: 1, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-004", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "26~50", sampleCode: "D", sampleSize: 8, ac: 0, re: 1, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-005", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "51~90", sampleCode: "E", sampleSize: 13, ac: 1, re: 2, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-006", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "91~150", sampleCode: "F", sampleSize: 20, ac: 1, re: 2, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-007", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "151~280", sampleCode: "G", sampleSize: 32, ac: 2, re: 3, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-008", name: "GB/T 2828.1-2012 一般检验水平II", batchSize: "281~500", sampleCode: "H", sampleSize: 50, ac: 3, re: 4, aql: "1.0", status: "已启用", level: "II", type: "一般检验", desc: "正常检验水平，适用于大多数常规检验场景" },
  { id: "STD-009", name: "AQL=2.5 加严检验", batchSize: "501~1200", sampleCode: "J", sampleSize: 80, ac: 5, re: 6, aql: "2.5", status: "已启用", level: "加严", type: "加严检验", desc: "当连续批质量下降时采用的加严检验方案", affectedRules: ["RULE-008"], updatedAt: "2024-03-10" },
  { id: "STD-010", name: "AQL=4.0 放宽检验", batchSize: "1201~3200", sampleCode: "K", sampleSize: 125, ac: 10, re: 11, aql: "4.0", status: "已启用", level: "放宽", type: "放宽检验", desc: "当连续批质量稳定且优良时采用的放宽检验方案", affectedRules: [], updatedAt: "2024-09-20" },
];

const statusColor: Record<string, string> = {
  "已启用": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "已禁用": "bg-gray-100 text-gray-500 border-gray-200",
};

const standardFields: FieldConfig[] = [
  { key: "name", label: "标准名称", type: "text", required: true },
  { key: "batchSize", label: "批量范围", type: "text", required: true },
  { key: "sampleCode", label: "样本量字码", type: "text", required: true },
  { key: "sampleSize", label: "样本量", type: "number", required: true },
  { key: "ac", label: "允收数", type: "number", required: true },
  { key: "re", label: "拒收数", type: "number", required: true },
  { key: "aql", label: "AQL", type: "text", required: true },
  { key: "level", label: "检验水平", type: "select", required: true, options: [
    { label: "I", value: "I" },
    { label: "II", value: "II" },
    { label: "III", value: "III" },
    { label: "加严", value: "加严" },
    { label: "放宽", value: "放宽" },
  ]},
  { key: "type", label: "检验类型", type: "select", required: true, options: [
    { label: "一般检验", value: "一般检验" },
    { label: "加严检验", value: "加严检验" },
    { label: "放宽检验", value: "放宽检验" },
    { label: "特宽检验", value: "特宽检验" },
    { label: "单次抽样", value: "单次抽样" },
    { label: "双次抽样", value: "双次抽样" },
  ]},
  { key: "desc", label: "说明", type: "textarea" },
];

const detailFields = [
  { key: "id", label: "标准ID" },
  { key: "name", label: "标准名称" },
  { key: "batchSize", label: "批量范围" },
  { key: "sampleCode", label: "样本量字码", type: "badge" as const },
  { key: "sampleSize", label: "样本量" },
  { key: "ac", label: "允收数(Ac)" },
  { key: "re", label: "拒收数(Re)" },
  { key: "aql", label: "AQL", type: "badge" as const },
  { key: "level", label: "检验水平" },
  { key: "type", label: "检验类型" },
  { key: "status", label: "状态" },
  { key: "desc", label: "说明" },
  { key: "affectedRules", label: "引用规则", type: "list" as const },
  { key: "updatedAt", label: "更新时间", type: "date" as const },
];

let nextId = 11;

export default function SamplingStandardLib() {
  const [standards, setStandards] = useState<Standard[]>(initialStandards);
  const [search, setSearch] = useState("");
  const [detailStd, setDetailStd] = useState<Standard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedStd, setSelectedStd] = useState<Standard | null>(null);

  const filtered = standards.filter((s) => s.name.includes(search) || s.id.includes(search));

  const handleAdd = () => {
    setSelectedStd(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (std: Standard) => {
    setSelectedStd(std);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (std: Standard) => {
    setSelectedStd(std);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleToggleStatus = (std: Standard) => {
    setStandards((prev) =>
      prev.map((s) =>
        s.id === std.id
          ? { ...s, status: s.status === "已启用" ? "已禁用" : "已启用" }
          : s
      )
    );
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newStd = {
        id: `STD-${String(nextId).padStart(3, "0")}`,
        name: data.name as string,
        batchSize: data.batchSize as string,
        sampleCode: data.sampleCode as string,
        sampleSize: Number(data.sampleSize),
        ac: Number(data.ac),
        re: Number(data.re),
        aql: data.aql as string,
        level: data.level as string,
        type: data.type as string,
        desc: (data.desc as string) || "",
        status: "已启用" as string,
        affectedRules: [] as string[],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      nextId++;
      setStandards((prev) => [...prev, newStd]);
    } else if (dialogMode === "edit" && selectedStd) {
      setStandards((prev) =>
        prev.map((s) =>
          s.id === selectedStd.id
            ? {
                ...s,
                ...data,
                sampleSize: Number(data.sampleSize),
                ac: Number(data.ac),
                re: Number(data.re),
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : s
        )
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedStd) {
      setStandards((prev) => prev.filter((s) => s.id !== selectedStd.id));
      if (detailStd?.id === selectedStd.id) {
        setDetailStd(null);
      }
    }
  };

  const enabledCount = standards.filter((s) => s.status === "已启用").length;
  const aqlValues = Array.from(new Set(standards.map((s) => s.aql))).sort();
  const levelValues = Array.from(new Set(standards.map((s) => s.level))).sort();

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样标准库</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">抽样标准库</h1>
          <p className="text-sm text-gray-500 mt-1.5">基于GB/T 2828.1-2012 建立抽样标准库，支持批量大小/检查水平/AQL配置</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />添加标准
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BookOpen className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">标准总数</p><p className="text-lg font-bold">{standards.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已启用</p><p className="text-lg font-bold">{enabledCount}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Hash className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">AQL覆盖</p><p className="text-lg font-bold">{aqlValues.join(", ") || "-"}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Filter className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">检验水平</p><p className="text-lg font-bold">{levelValues.join(", ") || "-"}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FileText className="h-5 w-5 text-cyan-600" /><div><p className="text-sm text-gray-500">来源标准</p><p className="text-lg font-bold">GB/T 2828.1</p></div></CardContent></Card>
      </div>

      <div className="flex gap-3 items-center">
        <Input placeholder="搜索标准名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table className="unified-table">
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-b border-gray-100">
              {["标准ID", "标准名称", "批量范围", "样本量字码", "样本量", "允收数(Ac)", "拒收数(Re)", "AQL", "引用规则", "状态", "操作"].map((h) => (
                <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{s.batchSize}</TableCell>
                <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{s.sampleCode}</Badge></TableCell>
                <TableCell className="py-3.5 px-4 font-semibold text-sm">{s.sampleSize}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm text-emerald-600">{s.ac}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm text-red-600">{s.re}</TableCell>
                <TableCell className="py-3.5 px-4"><Badge className="bg-blue-50 text-blue-700">{s.aql}</Badge></TableCell>
                <TableCell className="py-3.5 px-4 text-gray-500">
                  {s.affectedRules && s.affectedRules.length > 0 ? (
                    <Badge variant="outline" className="text-xs gap-1"><Link2 className="w-3 h-3" />{s.affectedRules.length}条</Badge>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />{s.status}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetailStd(s)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(s)}>
                      {s.status === "已启用" ? <PowerOff className="w-4 h-4 text-amber-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DetailDrawer
        open={!!detailStd}
        onOpenChange={(open) => !open && setDetailStd(null)}
        title={`标准详情 - ${detailStd?.id || ""}`}
        data={detailStd || {}}
        fields={detailFields}
        onEdit={detailStd ? () => { handleEdit(detailStd); } : undefined}
        onDelete={detailStd ? () => { handleDelete(detailStd); } : undefined}
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="抽样标准"
        fields={standardFields}
        data={dialogMode === "edit" ? selectedStd || undefined : undefined}
        onSubmit={handleSubmit}
        onDelete={dialogMode === "delete" ? handleConfirmDelete : undefined}
        mode={dialogMode}
      />
    </div>
  );
}
