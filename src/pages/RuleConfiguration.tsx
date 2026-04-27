import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, Eye, Settings } from "lucide-react";

const rules = [
  { id: "RL-001", name: "收益分配规则-标准版", type: "分配规则", status: "已启用", updateTime: "2026-04-01" },
  { id: "RL-002", name: "收益分配规则-高级版", type: "分配规则", status: "草稿", updateTime: "2026-04-20" },
  { id: "RL-003", name: "积分计算规则", type: "计算规则", status: "已启用", updateTime: "2026-03-15" },
];

export default function RuleConfiguration() {
  const [search, setSearch] = useState("");
  const filtered = rules.filter(r => r.name.includes(search) || r.id.includes(search));
  const statusColor: Record<string, string> = { "已启用": "bg-green-100 text-green-700", "草稿": "bg-gray-100 text-gray-700", "已停用": "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>资产运营</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>规则配置</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">规则配置</h1>
        <Dialog>
          <DialogTrigger asChild><Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建规则</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>新建规则</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>规则名称</label><Input placeholder="输入规则名称" /></div>
              <div className="space-y-2"><label>规则类型</label><Input placeholder="分配/计算/计费" /></div>
              <div className="space-y-2"><label>规则内容</label><Input placeholder="输入规则公式或描述" /></div>
              <Button className="w-full">创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索规则" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>规则ID</TableHead><TableHead>规则名称</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>更新时间</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{r.id}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[r.status]}`}>{r.status}</span></TableCell>
                  <TableCell className="text-xs">{r.updateTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
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
