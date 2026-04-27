import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, Eye, FileCheck } from "lucide-react";

const items = [
  { id: "REG-001", asset: "客户画像数据集", type: "数据", applicant: "张三", status: "已登记", time: "2026-04-20" },
  { id: "REG-002", asset: "风控评分模型", type: "模型", applicant: "李四", status: "审核中", time: "2026-04-22" },
  { id: "REG-003", asset: "交易流水接口", type: "API", applicant: "王五", status: "已登记", time: "2026-04-18" },
];

export default function AssetRegistration() {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => i.asset.includes(search) || i.id.includes(search));
  const statusColor: Record<string, string> = { "已登记": "bg-green-100 text-green-700", "审核中": "bg-amber-100 text-amber-700", "草稿": "bg-gray-100 text-gray-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/workbench">工作台</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>资产登记</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">数据资产登记</h1>
        <Dialog>
          <DialogTrigger asChild><Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />登记资产</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>登记数据资产</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>资产名称</label><Input placeholder="输入资产名称" /></div>
              <div className="space-y-2"><label>资产类型</label><Input placeholder="数据/模型/API/报告" /></div>
              <div className="space-y-2"><label>资产描述</label><Input placeholder="描述资产内容" /></div>
              <Button className="w-full">提交登记</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索资产" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>登记号</TableHead><TableHead>资产名称</TableHead><TableHead>类型</TableHead><TableHead>申请人</TableHead><TableHead>状态</TableHead><TableHead>登记时间</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{i.id}</TableCell>
                  <TableCell className="font-medium">{i.asset}</TableCell>
                  <TableCell><Badge variant="outline">{i.type}</Badge></TableCell>
                  <TableCell>{i.applicant}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[i.status]}`}>{i.status}</span></TableCell>
                  <TableCell className="text-xs">{i.time}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><FileCheck className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
