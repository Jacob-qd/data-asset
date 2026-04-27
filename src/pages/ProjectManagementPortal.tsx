import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, Eye, CheckCircle, Clock } from "lucide-react";

const projects = [
  { id: "PRJ-001", name: "数据资产化项目-A", status: "实施中", manager: "张三", startDate: "2026-01-01", endDate: "2026-06-30", progress: 60 },
  { id: "PRJ-002", name: "隐私计算平台建设", status: "待确认", manager: "李四", startDate: "2026-03-01", endDate: "2026-09-30", progress: 0 },
  { id: "PRJ-003", name: "联邦学习联合建模", status: "已结束", manager: "王五", startDate: "2025-09-01", endDate: "2026-03-01", progress: 100 },
];

export default function ProjectManagementPortal() {
  const [search, setSearch] = useState("");
  const filtered = projects.filter(p => p.name.includes(search) || p.id.includes(search));
  const statusColor: Record<string, string> = { "实施中": "bg-blue-100 text-blue-700", "待确认": "bg-gray-100 text-gray-700", "已结束": "bg-green-100 text-green-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/workbench">工作台</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>项目管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">项目管理</h1>
        <Dialog>
          <DialogTrigger asChild><Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建项目</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>新建项目</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>项目名称</label><Input placeholder="输入项目名称" /></div>
              <div className="space-y-2"><label>项目经理</label><Input placeholder="输入项目经理" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>开始日期</label><Input type="date" /></div>
                <div className="space-y-2"><label>结束日期</label><Input type="date" /></div>
              </div>
              <Button className="w-full">创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索项目" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>项目ID</TableHead><TableHead>项目名称</TableHead><TableHead>状态</TableHead><TableHead>经理</TableHead><TableHead>周期</TableHead><TableHead>进度</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[p.status]}`}>{p.status}</span></TableCell>
                  <TableCell>{p.manager}</TableCell>
                  <TableCell className="text-xs">{p.startDate} ~ {p.endDate}</TableCell>
                  <TableCell>
                    <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.progress}%` }} /></div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {p.status === "待确认" && <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><CheckCircle className="h-4 w-4" /></Button>}
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
