import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Bell, BellRing, BellOff, Eye } from "lucide-react";

const alerts = [
  { id: "ALT-001", name: "CPU使用率过高", level: "警告", threshold: "> 80%", status: "已触发", time: "2026-04-24 10:00" },
  { id: "ALT-002", name: "节点离线", level: "严重", threshold: "= 离线", status: "已触发", time: "2026-04-24 09:30" },
  { id: "ALT-003", name: "存储空间不足", level: "警告", threshold: "> 85%", status: "未触发", time: "-" },
  { id: "ALT-004", name: "任务失败率过高", level: "严重", threshold: "> 20%", status: "未触发", time: "-" },
];

export default function AlertManagement() {
  const [search, setSearch] = useState("");
  const filtered = alerts.filter(a => a.name.includes(search) || a.id.includes(search));
  const levelColor: Record<string, string> = { "严重": "bg-red-100 text-red-700", "警告": "bg-amber-100 text-amber-700", "提示": "bg-blue-100 text-blue-700" };
  const statusColor: Record<string, string> = { "已触发": "bg-red-100 text-red-700", "未触发": "bg-green-100 text-green-700", "已屏蔽": "bg-gray-100 text-gray-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>预警管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">预警管理</h1>
        <Button><BellRing className="mr-2 h-4 w-4" />新建规则</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">预警规则</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{alerts.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">已触发</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{alerts.filter(a => a.status === "已触发").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">严重告警</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{alerts.filter(a => a.level === "严重").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">今日告警</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">5</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索规则" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>规则ID</TableHead><TableHead>规则名称</TableHead><TableHead>级别</TableHead><TableHead>阈值</TableHead><TableHead>状态</TableHead><TableHead>触发时间</TableHead><TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${levelColor[a.level]}`}>{a.level}</span></TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{a.threshold}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[a.status]}`}>{a.status}</span></TableCell>
                  <TableCell className="text-xs">{a.time}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><BellOff className="h-4 w-4" /></Button>
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
