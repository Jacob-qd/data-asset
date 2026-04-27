import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Play, Eye, Trash2, ChevronRight, BarChart3, Users } from "lucide-react";

const statsData = [
  { id: "STAT-2026-001", name: "区域销售总额统计", metrics: "求和", status: "已完成", parties: ["零售A", "零售B"], result: "￥2.3亿", duration: "12min", createdAt: "2026-04-20" },
  { id: "STAT-2026-002", name: "客户平均消费分析", metrics: "均值", status: "进行中", parties: ["电商A", "电商B", "电商C"], result: "-", duration: "-", createdAt: "2026-04-21" },
  { id: "STAT-2026-003", name: "库存方差分析", metrics: "方差", status: "已完成", parties: ["仓储A", "仓储B"], result: "σ²=1450", duration: "8min", createdAt: "2026-04-18" },
  { id: "STAT-2026-004", name: "用户留存率统计", metrics: "计数", status: "待执行", parties: ["平台A", "平台B"], result: "-", duration: "-", createdAt: "2026-04-22" },
  { id: "STAT-2026-005", name: "贷款违约率分析", metrics: "分组统计", status: "已完成", parties: ["银行A", "银行B", "征信C"], result: "3.2%", duration: "25min", createdAt: "2026-04-15" },
];

export default function JointStatistics() {
  const [search, setSearch] = useState("");
  const [metricFilter, setMetricFilter] = useState("all");

  const filtered = statsData.filter(s => {
    const matchSearch = s.name.includes(search) || s.id.includes(search);
    const matchMetric = metricFilter === "all" || s.metrics === metricFilter;
    return matchSearch && matchMetric;
  });

  const statusColor: Record<string, string> = {
    "已完成": "bg-green-100 text-green-700",
    "进行中": "bg-blue-100 text-blue-700",
    "待执行": "bg-gray-100 text-gray-700",
    "失败": "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>联合统计</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">联合统计</h1>
          <p className="text-sm text-gray-500 mt-1.5">多方数据的联合统计分析：求和、均值、方差、计数、分组统计</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建统计任务</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>新建联合统计任务</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>任务名称</label><Input placeholder="输入任务名称" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>统计指标</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择指标" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">求和</SelectItem>
                      <SelectItem value="avg">均值</SelectItem>
                      <SelectItem value="var">方差</SelectItem>
                      <SelectItem value="count">计数</SelectItem>
                      <SelectItem value="max">最大值</SelectItem>
                      <SelectItem value="min">最小值</SelectItem>
                      <SelectItem value="group">分组统计</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label>分组字段（可选）</label><Input placeholder="如：地区、行业" /></div>
              </div>
              <div className="space-y-2"><label>统计字段</label><Input placeholder="如：销售额、用户数" /></div>
              <div className="space-y-2"><label>参与方数据源</label><Input placeholder="选择各参与方的数据集" /></div>
              <div className="space-y-2"><label>聚合方式</label>
                <Select><SelectTrigger><SelectValue placeholder="选择方式" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">明文聚合</SelectItem>
                    <SelectItem value="mpc">MPC安全聚合</SelectItem>
                    <SelectItem value="dp">差分隐私聚合</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">创建任务</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">求和任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">18</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">均值任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">计数任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">9</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">分组统计</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">6</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索任务ID/名称" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={metricFilter} onValueChange={setMetricFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="统计指标" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="求和">求和</SelectItem>
                <SelectItem value="均值">均值</SelectItem>
                <SelectItem value="方差">方差</SelectItem>
                <SelectItem value="计数">计数</SelectItem>
                <SelectItem value="分组统计">分组统计</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"><Search className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>任务ID</TableHead>
                <TableHead>任务名称</TableHead>
                <TableHead>统计指标</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>参与方</TableHead>
                <TableHead>统计结果</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.metrics}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span className="text-xs">{s.parties.join(", ")}</span></div>
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">{s.result}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="h-4 w-4" /></Button>
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
