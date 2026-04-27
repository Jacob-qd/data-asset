import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Play, Pause, Square, Clock, Cpu, MemoryStick, HardDrive, Zap, CheckCircle, AlertTriangle, Server, FileCheck, ArrowRight } from "lucide-react";

const runTasks = [
  { id: "RT-001", name: "全量数据清洗-用户画像", script: "data_clean.py", status: "执行中", progress: 67, cpu: "78%", memory: "12.5GB", storage: "500GB", startTime: "2026-04-24 10:00", estEnd: "2026-04-24 15:30", output: "已处理 845,230 / 1,256,789 行", records: "1,256,789" },
  { id: "RT-002", name: "特征工程-信用评分", script: "feature_engineer.py", status: "排队中", progress: 0, cpu: "--", memory: "--", storage: "200GB", startTime: "--", estEnd: "--", output: "等待依赖任务完成", records: "568,920" },
  { id: "RT-003", name: "数据对齐-多方ID", script: "id_alignment.py", status: "已完成", progress: 100, cpu: "45%", memory: "8.2GB", storage: "300GB", startTime: "2026-04-24 08:00", estEnd: "2026-04-24 11:45", output: "对齐完成，匹配率 98.7%", records: "2,340,000" },
  { id: "RT-004", name: "模型训练-评分卡", script: "scorecard_train.py", status: "已暂停", progress: 35, cpu: "--", memory: "--", storage: "1TB", startTime: "2026-04-24 09:00", estEnd: "--", output: "用户手动暂停", records: "1,256,789" },
];

const statusColor: Record<string, string> = {
  "执行中": "bg-blue-50 text-blue-700 border-blue-100",
  "排队中": "bg-slate-50 text-slate-600 border-slate-200",
  "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "已暂停": "bg-amber-50 text-amber-700 border-amber-100",
  "执行失败": "bg-red-50 text-red-700 border-red-100",
};

export default function SandboxRunEnv() {
  const [search, setSearch] = useState("");
  const filtered = runTasks.filter((t) => t.name.includes(search) || t.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/sandbox">数据沙箱</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>运行环境</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">运行环境</h1>
          <p className="text-sm text-gray-500 mt-1.5">全量数据运行环境，调试通过的代码在此执行，原始数据不出库</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">全量数据模式</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Server className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">CPU</p><p className="text-lg font-bold">16核</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><MemoryStick className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">内存</p><p className="text-lg font-bold">32GB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><HardDrive className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">存储</p><p className="text-lg font-bold">1TB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Zap className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">运行中任务</p><p className="text-lg font-bold">{runTasks.filter((t) => t.status === "执行中").length}</p></div></CardContent></Card>
      </div>

      <div className="flex gap-3 items-center">
        <Input placeholder="搜索任务名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
          <CheckCircle className="h-3.5 w-3.5" />
          环境就绪
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
          <FileCheck className="h-3.5 w-3.5" />
          数据已隔离
        </div>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table className="unified-table">
          <TableHeader>
            <TableRow className="bg-gray-50/80 border-b border-gray-100">
              {["任务ID", "任务名称", "脚本", "进度", "CPU", "内存", "数据量", "开始时间", "预计完成", "状态", "操作"].map((h) => (
                <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell>
                <TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell>
                <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{t.script}</Badge></TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="w-20"><Progress value={t.progress} className="h-1.5" /><span className="text-xs text-gray-500">{t.progress}%</span></div>
                </TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{t.cpu}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{t.memory}</TableCell>
                <TableCell className="py-3.5 px-4 text-sm">{t.records}</TableCell>
                <TableCell className="py-3.5 px-4 text-xs text-gray-500">{t.startTime}</TableCell>
                <TableCell className="py-3.5 px-4 text-xs text-gray-500">{t.estEnd}</TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[t.status]}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />{t.status}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex gap-1">
                    {t.status === "执行中" ? (
                      <><Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Pause className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Square className="h-4 w-4" /></Button></>
                    ) : t.status === "排队中" ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><ArrowRight className="h-4 w-4" /></Button>
                    ) : t.status === "已暂停" ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Play className="h-4 w-4" /></Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
