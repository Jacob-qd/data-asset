import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Eye, RotateCcw, Trash2 } from "lucide-react";

const tasks = [
  { id: "TM-001", name: "联邦训练-金融风控", type: "联邦学习", status: "运行中", node: "Node-A1", start: "09:00", duration: "2h 30m" },
  { id: "TM-002", name: "PSI求交-客户比对", type: "PSI", status: "排队", node: "Node-B1", start: "-", duration: "-" },
  { id: "TM-003", name: "联合统计-销售汇总", type: "联合统计", status: "已完成", node: "Node-A2", start: "08:00", duration: "45m" },
  { id: "TM-004", name: "评分卡推理", type: "评分卡", status: "失败", node: "Node-C1", start: "07:30", duration: "5m" },
];

export default function TaskMonitoring() {
  const [search, setSearch] = useState("");
  const filtered = tasks.filter(t => t.name.includes(search) || t.id.includes(search));
  const statusColor: Record<string, string> = { "运行中": "bg-blue-100 text-blue-700", "排队": "bg-gray-100 text-gray-700", "已完成": "bg-green-100 text-green-700", "失败": "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>任务监控</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">任务监控</h1>
        <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />刷新</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">总任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{tasks.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">运行中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === "运行中").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">已完成</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === "已完成").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">失败</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{tasks.filter(t => t.status === "失败").length}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索任务" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>任务ID</TableHead><TableHead>任务名称</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>节点</TableHead><TableHead>开始时间</TableHead><TableHead>耗时</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[t.status]}`}>{t.status}</span></TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{t.node}</TableCell>
                  <TableCell className="text-xs">{t.start}</TableCell>
                  <TableCell>{t.duration}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"><Trash2 className="h-4 w-4" /></Button>
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
