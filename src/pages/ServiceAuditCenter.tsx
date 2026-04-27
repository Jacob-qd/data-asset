import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, CheckCircle, XCircle, Eye } from "lucide-react";

const items = [
  { id: "SA-001", service: "信贷评分API发布", applicant: "张三", type: "服务发布", status: "待审批" },
  { id: "SA-002", service: "反欺诈模型上线", applicant: "李四", type: "模型发布", status: "已通过" },
  { id: "SA-003", service: "数据接口扩容", applicant: "王五", type: "资源申请", status: "已拒绝" },
];

export default function ServiceAuditCenter() {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => i.service.includes(search) || i.id.includes(search));
  const statusColor: Record<string, string> = { "待审批": "bg-amber-100 text-amber-700", "已通过": "bg-green-100 text-green-700", "已拒绝": "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>数据服务</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>审核中心</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">审核中心</h1>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">待审批</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">1</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已通过</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">1</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总计</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-600">3</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索关键词" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>单号</TableHead><TableHead>服务/申请</TableHead><TableHead>申请人</TableHead><TableHead>类型</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{i.id}</TableCell>
                  <TableCell className="font-medium">{i.service}</TableCell>
                  <TableCell>{i.applicant}</TableCell>
                  <TableCell><Badge variant="outline">{i.type}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[i.status]}`}>{i.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {i.status === "待审批" && <><Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><CheckCircle className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><XCircle className="h-4 w-4" /></Button></>}
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
