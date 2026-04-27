import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight, Search, BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus, Eye, RotateCcw, Flag,
} from "lucide-react";

const problemTypes = [
  { type: "缺失值", count: 156, trend: "down", pct: "28.5%", severity: "中", responsible: "数据采集团队", status: "整改中", deadline: "2026-05-10" },
  { type: "格式异常", count: 89, trend: "up", pct: "16.2%", severity: "低", responsible: "ETL团队", status: "待分配", deadline: "2026-05-15" },
  { type: "重复记录", count: 67, trend: "stable", pct: "12.2%", severity: "中", responsible: "数据仓库团队", status: "整改完成", deadline: "2026-04-30" },
  { type: "值域越界", count: 123, trend: "up", pct: "22.4%", severity: "高", responsible: "算法团队", status: "整改中", deadline: "2026-05-08" },
  { type: "类型错误", count: 45, trend: "down", pct: "8.2%", severity: "低", responsible: "ETL团队", status: "整改完成", deadline: "2026-04-25" },
  { type: "编码不一致", count: 34, trend: "stable", pct: "6.2%", severity: "低", responsible: "数据标准组", status: "待分配", deadline: "2026-05-20" },
  { type: "时间异常", count: 28, trend: "up", pct: "5.1%", severity: "中", responsible: "数据采集团队", status: "整改中", deadline: "2026-05-05" },
  { type: "主键冲突", count: 7, trend: "down", pct: "1.2%", severity: "高", responsible: "数据仓库团队", status: "整改完成", deadline: "2026-04-20" },
];

const trackingRecords = [
  { id: "TK-001", type: "缺失值", desc: "用户年龄段字段大面积缺失", responsible: "张三", startDate: "2026-04-01", deadline: "2026-05-10", progress: 65, status: "整改中", action: "补充埋点采集逻辑" },
  { id: "TK-002", type: "值域越界", desc: "信用评分出现负值和超过850的记录", responsible: "李四", startDate: "2026-04-05", deadline: "2026-05-08", progress: 40, status: "整改中", action: "增加入参校验规则" },
  { id: "TK-003", type: "重复记录", desc: "订单表存在重复下单记录", responsible: "王五", startDate: "2026-04-10", deadline: "2026-04-30", progress: 100, status: "整改完成", action: "增加唯一索引+去重任务" },
  { id: "TK-004", type: "格式异常", desc: "手机号字段存在空格和横杠", responsible: "赵六", startDate: "2026-04-12", deadline: "2026-05-15", progress: 0, status: "待分配", action: "标准化清洗规则" },
  { id: "TK-005", type: "类型错误", desc: "金额字段出现字符串类型", responsible: "钱七", startDate: "2026-04-08", deadline: "2026-04-25", progress: 100, status: "整改完成", action: "Schema校验+类型转换" },
];

const severityColor: Record<string, string> = {
  "高": "bg-red-50 text-red-700 border-red-100",
  "中": "bg-amber-50 text-amber-700 border-amber-100",
  "低": "bg-blue-50 text-blue-700 border-blue-100",
};

const statusColor: Record<string, string> = {
  "整改中": "bg-amber-50 text-amber-700 border-amber-100",
  "整改完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待分配": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProblemStatistics() {
  const [search, setSearch] = useState("");
  const [detailProblem, setDetailProblem] = useState<typeof problemTypes[0] | null>(null);
  const [detailTrack, setDetailTrack] = useState<typeof trackingRecords[0] | null>(null);

  const filtered = problemTypes.filter((p) => p.type.includes(search));
  const totalProblems = problemTypes.reduce((s, p) => s + p.count, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>问题统计</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">问题统计</h1>
          <p className="text-sm text-gray-500 mt-1.5">质检问题分类统计、问题趋势分析、问题整改跟踪</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-500" /><div><p className="text-sm text-gray-500">问题总数</p><p className="text-lg font-bold">{totalProblems}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-red-500" /><div><p className="text-sm text-gray-500">上升趋势</p><p className="text-lg font-bold">{problemTypes.filter((p) => p.trend === "up").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-5 w-5 text-emerald-500" /><div><p className="text-sm text-gray-500">下降趋势</p><p className="text-lg font-bold">{problemTypes.filter((p) => p.trend === "down").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-500" /><div><p className="text-sm text-gray-500">整改完成</p><p className="text-lg font-bold">{trackingRecords.filter((r) => r.status === "整改完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-amber-500" /><div><p className="text-sm text-gray-500">整改中</p><p className="text-lg font-bold">{trackingRecords.filter((r) => r.status === "整改中").length}</p></div></CardContent></Card>
      </div>

      <div className="space-y-6">
        {/* 问题分类统计 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">问题分类统计</h2>
            <Input placeholder="搜索问题类型" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["问题类型", "问题数", "占比", "趋势", "严重等级", "责任人", "状态", "截止日", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <TableRow key={p.type} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{p.type}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm font-semibold">{p.count}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{p.pct}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      {p.trend === "up" ? <TrendingUp className="w-4 h-4 text-red-500" /> : p.trend === "down" ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-gray-400" />}
                    </TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityColor[p.severity]}`}>{p.severity}</span></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{p.responsible}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[p.status]}`}>{p.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{p.deadline}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Button size="sm" variant="ghost" onClick={() => setDetailProblem(p)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* 整改跟踪 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">整改跟踪</h2>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["跟踪ID", "问题类型", "整改描述", "责任人", "开始日期", "截止日", "进度", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {trackingRecords.map((r) => (
                  <TableRow key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{r.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{r.type}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500 max-w-[200px] truncate">{r.desc}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{r.responsible}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{r.startDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{r.deadline}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${r.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{r.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[r.status]}`}>{r.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetailTrack(r)}><Eye className="w-4 h-4" /></Button>
                        {r.status !== "整改完成" && <Button size="sm" variant="ghost"><RotateCcw className="w-4 h-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* Problem Detail Dialog */}
      <Dialog open={!!detailProblem} onOpenChange={() => setDetailProblem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>问题详情 - {detailProblem?.type}</DialogTitle></DialogHeader>
          {detailProblem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "问题类型", value: detailProblem.type },
                  { label: "问题数", value: detailProblem.count },
                  { label: "占比", value: detailProblem.pct },
                  { label: "趋势", value: detailProblem.trend === "up" ? "上升" : detailProblem.trend === "down" ? "下降" : "平稳" },
                  { label: "严重等级", value: detailProblem.severity },
                  { label: "责任人", value: detailProblem.responsible },
                  { label: "状态", value: detailProblem.status },
                  { label: "截止日", value: detailProblem.deadline },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailProblem(null)}>关闭</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"><Flag className="w-4 h-4" />分配整改</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Track Detail Dialog */}
      <Dialog open={!!detailTrack} onOpenChange={() => setDetailTrack(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>整改详情 - {detailTrack?.id}</DialogTitle></DialogHeader>
          {detailTrack && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "问题类型", value: detailTrack.type },
                  { label: "整改描述", value: detailTrack.desc },
                  { label: "责任人", value: detailTrack.responsible },
                  { label: "开始日期", value: detailTrack.startDate },
                  { label: "截止日", value: detailTrack.deadline },
                  { label: "当前进度", value: detailTrack.progress + "%" },
                  { label: "状态", value: detailTrack.status },
                  { label: "整改措施", value: detailTrack.action },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">进度</div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${detailTrack.progress}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">{detailTrack.progress}%</div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailTrack(null)}>关闭</Button>
                {detailTrack.status !== "整改完成" && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"><CheckCircle className="w-4 h-4" />标记完成</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
