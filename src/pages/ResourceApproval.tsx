import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, CheckCircle, XCircle, Eye, FileText } from "lucide-react";

const approvals = [
  { id: "APR-001", resource: "客户画像数据集", applicant: "张三", approver: "李四", status: "待审批", applyTime: "2026-04-24 10:00" },
  { id: "APR-002", resource: "交易流水数据", applicant: "王五", approver: "赵六", status: "已通过", applyTime: "2026-04-23 09:30" },
  { id: "APR-003", resource: "征信评分数据", applicant: "李四", approver: "钱七", status: "已拒绝", applyTime: "2026-04-22 14:00" },
];

export default function ResourceApproval() {
  const [search, setSearch] = useState("");
  const filtered = approvals.filter(a => a.resource.includes(search) || a.id.includes(search));

  const statusColor: Record<string, string> = {
    "待审批": "bg-amber-100 text-amber-700",
    "已通过": "bg-green-100 text-green-700",
    "已拒绝": "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>资源审批</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">资源审批</h1>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">待审批</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{approvals.filter(a => a.status === "待审批").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已通过</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{approvals.filter(a => a.status === "已通过").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已拒绝</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{approvals.filter(a => a.status === "已拒绝").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总计</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-gray-600">{approvals.length}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <Input placeholder="搜索审批单" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>审批单ID</TableHead><TableHead>申请资源</TableHead><TableHead>申请人</TableHead>
                <TableHead>审批人</TableHead><TableHead>状态</TableHead><TableHead>申请时间</TableHead><TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.resource}</TableCell>
                  <TableCell>{a.applicant}</TableCell>
                  <TableCell>{a.approver}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[a.status]}`}>{a.status}</span></TableCell>
                  <TableCell className="text-xs">{a.applyTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {a.status === "待审批" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
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
