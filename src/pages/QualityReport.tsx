import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight, Search, BarChart3, Download, FileText, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Clock, Eye,
} from "lucide-react";

const reports = [
  { id: "QR-001", name: "2026年Q1数据质检报告", period: "2026-01-01 ~ 2026-03-31", tasks: 156, samples: 456789, inspected: 15230, misjudged: 123, missed: 45, accuracy: "98.9%", falseRate: "0.81%", missRate: "0.30%", status: "已生成", generatedAt: "2026-04-01 10:00", trend: "up", weekData: [96.5, 97.2, 98.1, 98.5, 98.9] },
  { id: "QR-002", name: "2026年3月用户画像质检", period: "2026-03-01 ~ 2026-03-31", tasks: 45, samples: 125600, inspected: 5230, misjudged: 28, missed: 12, accuracy: "99.2%", falseRate: "0.54%", missRate: "0.23%", status: "已生成", generatedAt: "2026-04-01 14:30", trend: "up", weekData: [98.5, 98.8, 99.0, 99.1, 99.2] },
  { id: "QR-003", name: "2026年Q1特征工程质检", period: "2026-01-01 ~ 2026-03-31", tasks: 78, samples: 890000, inspected: 8900, misjudged: 156, missed: 89, accuracy: "97.3%", falseRate: "1.75%", missRate: "1.00%", status: "已生成", generatedAt: "2026-04-02 09:15", trend: "down", weekData: [98.2, 97.8, 97.5, 97.2, 97.3] },
  { id: "QR-004", name: "2026年4月订单数据质检", period: "2026-04-01 ~ 2026-04-24", tasks: 32, samples: 342100, inspected: 3200, misjudged: 45, missed: 23, accuracy: "97.9%", falseRate: "1.41%", missRate: "0.72%", status: "生成中", generatedAt: "-", trend: "stable", weekData: [97.5, 97.6, 97.8, 97.9, 97.9] },
];

const statusColor: Record<string, string> = {
  "已生成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "生成中": "bg-blue-50 text-blue-700 border-blue-100",
};

export default function QualityReport() {
  const [search, setSearch] = useState("");
  const [detailReport, setDetailReport] = useState<typeof reports[0] | null>(null);

  const filtered = reports.filter((r) => r.name.includes(search) || r.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>质检报告</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">质检报告</h1>
          <p className="text-sm text-gray-500 mt-1.5">生成质检报告，包含误判量/漏判量/误判率/漏判率/准确率</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200">
          <BarChart3 className="mr-2 h-4 w-4" />生成报告
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">报告总数</p><p className="text-lg font-bold">{reports.length}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">平均准确率</p><p className="text-lg font-bold text-emerald-600">98.3%</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">平均误判率</p><p className="text-lg font-bold text-amber-600">1.13%</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">平均漏判率</p><p className="text-lg font-bold text-blue-600">0.56%</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">总质检样本</p><p className="text-lg font-bold">{reports.reduce((s, r) => s + r.samples, 0).toLocaleString()}</p></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">总质检任务</p><p className="text-lg font-bold">{reports.reduce((s, r) => s + r.tasks, 0)}</p></CardContent></Card>
      </div>

      <div className="flex gap-3 items-center">
        <Input placeholder="搜索报告名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table className="unified-table">
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-b border-gray-100">
              {["报告ID", "报告名称", "质检周期", "任务数", "样本量", "误判量", "漏判量", "误判率", "漏判率", "准确率", "状态", "操作"].map((h) => (
                <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {filtered.map((r) => (
              <TableRow key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{r.id}</TableCell>
                <TableCell className="py-3.5 px-4 font-medium text-sm">{r.name}</TableCell>
                <TableCell className="py-3.5 px-4 text-xs text-gray-500">{r.period}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{r.tasks}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{r.samples.toLocaleString()}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm text-amber-600">{r.misjudged}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm text-blue-600">{r.missed}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{r.falseRate}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{r.missRate}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm font-medium text-emerald-600">{r.accuracy}</TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[r.status]}`}>{r.status}</span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetailReport(r)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailReport} onOpenChange={() => setDetailReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>报告详情 - {detailReport?.id}</DialogTitle></DialogHeader>
          {detailReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "报告名称", value: detailReport.name },
                  { label: "质检周期", value: detailReport.period },
                  { label: "任务数", value: detailReport.tasks },
                  { label: "样本量", value: detailReport.samples.toLocaleString() },
                  { label: "检查数", value: detailReport.inspected.toLocaleString() },
                  { label: "误判量", value: detailReport.misjudged },
                  { label: "漏判量", value: detailReport.missed },
                  { label: "准确率", value: detailReport.accuracy },
                  { label: "生成时间", value: detailReport.generatedAt },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium mb-3">准确率趋势（近5周）</div>
                <div className="flex items-end gap-2 h-24">
                  {detailReport.weekData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-500">{val}%</div>
                      <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(val / 100) * 80}px` }} />
                      <div className="text-xs text-gray-400">W{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium mb-2">核心指标</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-emerald-50">
                    <div className="text-2xl font-bold text-emerald-600">{detailReport.accuracy}</div>
                    <div className="text-xs text-gray-500 mt-1">准确率</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50">
                    <div className="text-2xl font-bold text-amber-600">{detailReport.falseRate}</div>
                    <div className="text-xs text-gray-500 mt-1">误判率</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{detailReport.missRate}</div>
                    <div className="text-xs text-gray-500 mt-1">漏判率</div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailReport(null)}>关闭</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"><Download className="w-4 h-4" />下载报告</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
