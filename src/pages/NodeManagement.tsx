import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Plus, Power, PowerOff, Eye, Server } from "lucide-react";

const nodes = [
  { id: "NODE-001", name: "计算节点-A1", ip: "192.168.1.10", port: "8080", status: "运行中", type: "计算节点", region: "北京" },
  { id: "NODE-002", name: "计算节点-B1", ip: "192.168.1.11", port: "8080", status: "运行中", type: "计算节点", region: "上海" },
  { id: "NODE-003", name: "协调节点-C1", ip: "192.168.1.20", port: "9090", status: "离线", type: "协调节点", region: "深圳" },
  { id: "NODE-004", name: "存储节点-D1", ip: "192.168.1.30", port: "7070", status: "运行中", type: "存储节点", region: "杭州" },
];

export default function NodeManagement() {
  const [search, setSearch] = useState("");
  const filtered = nodes.filter(n => n.name.includes(search) || n.id.includes(search));
  const statusColor: Record<string, string> = { "运行中": "bg-green-100 text-green-700", "离线": "bg-red-100 text-red-700", "维护中": "bg-amber-100 text-amber-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>节点管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">节点管理</h1>
        <Dialog>
          <DialogTrigger asChild><Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />添加节点</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>添加节点</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>节点名称</label><Input placeholder="输入名称" /></div>
                <div className="space-y-2"><label>节点类型</label><Input placeholder="计算/协调/存储" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>IP地址</label><Input placeholder="192.168.1.x" /></div>
                <div className="space-y-2"><label>端口</label><Input placeholder="8080" /></div>
              </div>
              <div className="space-y-2"><label>所在城市</label><Input placeholder="北京/上海" /></div>
              <Button className="w-full">添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">总节点</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{nodes.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">运行中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{nodes.filter(n => n.status === "运行中").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">离线</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{nodes.filter(n => n.status === "离线").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">计算节点</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{nodes.filter(n => n.type === "计算节点").length}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索节点" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>节点ID</TableHead><TableHead>节点名称</TableHead><TableHead>IP:端口</TableHead>
                <TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>区域</TableHead><TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(n => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{n.id}</TableCell>
                  <TableCell className="font-medium">{n.name}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{n.ip}:{n.port}</TableCell>
                  <TableCell><Badge variant="outline">{n.type}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[n.status]}`}>{n.status}</span></TableCell>
                  <TableCell>{n.region}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {n.status === "运行中" ? <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><PowerOff className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><Power className="h-4 w-4" /></Button>}
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
