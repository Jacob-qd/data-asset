import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Filter } from "lucide-react";

const logs = [
  { id: "LOG-001", user: "张三", action: "创建项目", target: "金融风控联合建模", result: "成功", time: "2026-04-24 10:00:00", ip: "192.168.1.100" },
  { id: "LOG-002", user: "李四", action: "审批通过", target: "资源申请-客户画像", result: "成功", time: "2026-04-24 09:30:00", ip: "192.168.1.101" },
  { id: "LOG-003", user: "王五", action: "启动任务", target: "PSI求交-客户比对", result: "失败", time: "2026-04-24 08:45:00", ip: "192.168.1.102" },
  { id: "LOG-004", user: "赵六", action: "下载报告", target: "Q1隐私计算报告", result: "成功", time: "2026-04-23 17:00:00", ip: "192.168.1.103" },
];

export default function PlatformAuditLog() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = logs.filter(l => {
    const matchSearch = l.user.includes(search) || l.action.includes(search) || l.target.includes(search);
    const matchStatus = statusFilter === "all" || l.result === statusFilter;
    return matchSearch && matchStatus;
  });
  const resultColor: Record<string, string> = { "成功": "bg-green-100 text-green-700", "失败": "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>平台管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>审计日志</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">平台审计日志</h1>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">今日操作</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">128</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">成功</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">120</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">失败</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">用户数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">12</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索用户/操作/对象" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="结果" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="成功">成功</SelectItem>
                <SelectItem value="失败">失败</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" />筛选</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>日志ID</TableHead><TableHead>用户</TableHead><TableHead>操作</TableHead><TableHead>操作对象</TableHead><TableHead>结果</TableHead><TableHead>时间</TableHead><TableHead>IP</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{l.id}</TableCell>
                  <TableCell>{l.user}</TableCell>
                  <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                  <TableCell className="font-medium">{l.target}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${resultColor[l.result]}`}>{l.result}</span></TableCell>
                  <TableCell className="text-xs">{l.time}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{l.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
