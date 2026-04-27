import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, GitCompare, ArrowRightLeft, BarChart3, FileSearch, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const diffData = [
  { row: 1, user_id: "10001", name_before: "张三", name_after: "张三", age_before: "28", age_after: "28", income_before: "8000", income_after: "8500", changed: true, fields: ["income"] },
  { row: 2, user_id: "10002", name_before: "李四", name_after: "李四", age_before: "35", age_after: "35", income_before: "12000", income_after: "12000", changed: false, fields: [] },
  { row: 3, user_id: "10003", name_before: "王五", name_after: "王五", age_before: "22", age_after: "25", income_before: "5000", income_after: "5800", changed: true, fields: ["age", "income"] },
  { row: 4, user_id: "10004", name_before: "赵六", name_after: "赵六", age_before: "41", age_after: "41", income_before: "20000", income_after: "20000", changed: false, fields: [] },
  { row: 5, user_id: "10005", name_before: "钱七", name_after: "钱七", age_before: "19", age_after: "19", income_before: "3500", income_after: "3500", changed: false, fields: [] },
];

const stats = {
  total: 1256789,
  changed: 89234,
  unchanged: 1167555,
  added: 4567,
  deleted: 5433,
};

const fieldDiffs = [
  { field: "income", changed: 45230, pct: "3.6%", type: "数值修改" },
  { field: "age", changed: 12340, pct: "0.98%", type: "缺失值填充" },
  { field: "phone", changed: 8900, pct: "0.71%", type: "格式标准化" },
  { field: "address", changed: 22764, pct: "1.81%", type: "文本清洗" },
];

export default function SandboxCompareMode() {
  const [viewMode, setViewMode] = useState<"side" | "diff">("side");

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
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === "side" ? "default" : "outline"} onClick={() => setViewMode("side")} className={viewMode === "side" ? "bg-indigo-600" : ""}><GitCompare className="h-4 w-4 mr-1" />并排对比</Button>
          <Button size="sm" variant={viewMode === "diff" ? "default" : "outline"} onClick={() => setViewMode("diff")} className={viewMode === "diff" ? "bg-indigo-600" : ""}><ArrowRightLeft className="h-4 w-4 mr-1" />差异模式</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">总记录</p><p className="text-lg font-bold">{stats.total.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">变更记录</p><p className="text-lg font-bold text-blue-600">{stats.changed.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">新增记录</p><p className="text-lg font-bold text-emerald-600">+{stats.added.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">删除记录</p><p className="text-lg font-bold text-red-600">-{stats.deleted.toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">变更率</p><p className="text-lg font-bold text-amber-600">{((stats.changed / stats.total) * 100).toFixed(2)}%</p></CardContent></Card>
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
    </div>
  );
}
