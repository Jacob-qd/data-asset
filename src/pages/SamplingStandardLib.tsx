import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight, Plus, Search, BookOpen, Filter, CheckCircle, Hash, FileText, Eye, AlertTriangle, Link2,
} from "lucide-react";

const standards = [
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

export default function SamplingStandardLib() {
  const [search, setSearch] = useState("");
  const [detailStd, setDetailStd] = useState<typeof standards[0] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newStd, setNewStd] = useState({ name: "", batchSize: "", sampleCode: "", sampleSize: "", ac: "", re: "", aql: "1.0", level: "II", type: "一般检验", desc: "" });

  const filtered = standards.filter((s) => s.name.includes(search) || s.id.includes(search));

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
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />添加标准
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><BookOpen className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">标准总数</p><p className="text-lg font-bold">{standards.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已启用</p><p className="text-lg font-bold">{standards.filter((s) => s.status === "已启用").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Hash className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">AQL覆盖</p><p className="text-lg font-bold">1.0, 2.5, 4.0</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Filter className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">检验水平</p><p className="text-lg font-bold">I, II, III</p></div></CardContent></Card>
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
                  <Button size="sm" variant="ghost" onClick={() => setDetailStd(s)}><Eye className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailStd} onOpenChange={() => setDetailStd(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>标准详情 - {detailStd?.id}</DialogTitle></DialogHeader>
          {detailStd && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "标准名称", value: detailStd.name },
                  { label: "批量范围", value: detailStd.batchSize },
                  { label: "样本量字码", value: detailStd.sampleCode },
                  { label: "样本量", value: detailStd.sampleSize },
                  { label: "允收数(Ac)", value: detailStd.ac },
                  { label: "拒收数(Re)", value: detailStd.re },
                  { label: "AQL", value: detailStd.aql },
                  { label: "检验水平", value: detailStd.level },
                  { label: "检验类型", value: detailStd.type },
                  { label: "状态", value: detailStd.status },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-500">说明</div>
                <div className="text-sm text-gray-700 mt-1">{detailStd.desc}</div>
              </div>
              {detailStd.affectedRules && detailStd.affectedRules.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">变更影响提醒</span>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">此标准变更将影响以下 {detailStd.affectedRules.length} 条抽样规则，请确认是否需要同步更新：</p>
                  <div className="flex flex-wrap gap-2">
                    {detailStd.affectedRules.map((ruleId) => (
                      <Badge key={ruleId} variant="outline" className="text-xs bg-white border-amber-300 text-amber-700 gap-1">
                        <Link2 className="w-3 h-3" />{ruleId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">应用此标准</Button>
                <Button variant="outline">复制标准</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Standard Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>添加抽样标准</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "标准名称", key: "name", placeholder: "如：GB/T 2828.1-2012 一般检验水平II" },
              { label: "批量范围", key: "batchSize", placeholder: "如：26~50" },
              { label: "样本量字码", key: "sampleCode", placeholder: "如：D" },
              { label: "样本量", key: "sampleSize", placeholder: "如：8", type: "number" },
              { label: "允收数(Ac)", key: "ac", placeholder: "如：0", type: "number" },
              { label: "拒收数(Re)", key: "re", placeholder: "如：1", type: "number" },
              { label: "AQL", key: "aql", placeholder: "如：1.0" },
              { label: "检验水平", key: "level", placeholder: "如：II" },
              { label: "检验类型", key: "type", placeholder: "如：一般检验" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <Input
                  value={newStd[field.key as keyof typeof newStd]}
                  onChange={(e) => setNewStd({ ...newStd, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  className="h-9"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">说明</label>
              <Input value={newStd.desc} onChange={(e) => setNewStd({ ...newStd, desc: e.target.value })} placeholder="标准适用场景说明" className="h-9" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setAddOpen(false)}>保存标准</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
