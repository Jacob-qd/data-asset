import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Search, Upload, Eye, Download, Trash2, Play, Clock, Package } from "lucide-react";

const algorithms = [
  { id: "ALG-001", name: "联邦逻辑回归", category: "联邦学习", version: "v2.1.0", author: "张三", status: "已发布", downloads: 128 },
  { id: "ALG-002", name: "隐私求交ECDH", category: "PSI", version: "v1.5.0", author: "李四", status: "已发布", downloads: 85 },
  { id: "ALG-003", name: "差分隐私均值", category: "联合统计", version: "v1.0.0", author: "王五", status: "审核中", downloads: 0 },
  { id: "ALG-004", name: "评分卡WOE转换", category: "评分卡", version: "v3.0.0", author: "赵六", status: "已发布", downloads: 210 },
];

const computeTasks = [
  { id: "CMP-001", algorithm: "联邦逻辑回归", version: "v2.1.0", inputData: "credit_data_v3", status: "运行中", startTime: "2026-04-24 10:00:00", duration: "2h 15m" },
  { id: "CMP-002", algorithm: "隐私求交ECDH", version: "v1.5.0", inputData: "user_id_list", status: "已完成", startTime: "2026-04-24 09:30:00", duration: "45m" },
  { id: "CMP-003", algorithm: "差分隐私均值", version: "v1.0.0", inputData: "salary_stats", status: "已完成", startTime: "2026-04-24 08:00:00", duration: "1h 20m" },
  { id: "CMP-004", algorithm: "评分卡WOE转换", version: "v3.0.0", inputData: "feature_engineering", status: "失败", startTime: "2026-04-24 07:00:00", duration: "15m" },
  { id: "CMP-005", algorithm: "联邦逻辑回归", version: "v2.1.0", inputData: "marketing_data", status: "运行中", startTime: "2026-04-24 11:00:00", duration: "1h 30m" },
  { id: "CMP-006", algorithm: "隐私求交ECDH", version: "v1.5.0", inputData: "device_id_map", status: "待运行", startTime: "-", duration: "-" },
];

export default function AlgorithmManagement() {
  const [searchLib, setSearchLib] = useState("");
  const [searchTask, setSearchTask] = useState("");

  const filteredAlg = algorithms.filter(a => a.name.includes(searchLib) || a.id.includes(searchLib));
  const filteredTask = computeTasks.filter(t => t.algorithm.includes(searchTask) || t.id.includes(searchTask));

  const statusColor: Record<string, string> = {
    "已发布": "bg-emerald-100 text-emerald-700",
    "审核中": "bg-amber-100 text-amber-700",
    "草稿": "bg-gray-100 text-gray-700",
  };

  const taskStatusColor: Record<string, string> = {
    "运行中": "bg-blue-50 text-blue-700 border-blue-100",
    "已完成": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "失败": "bg-red-50 text-red-700 border-red-100",
    "待运行": "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>算法管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">算法管理</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Upload className="mr-2 h-4 w-4" />上传算法</Button>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList>
          <TabsTrigger value="library"><Package className="h-4 w-4 mr-1" />算法库</TabsTrigger>
          <TabsTrigger value="compute"><Play className="h-4 w-4 mr-1" />计算任务</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4 space-y-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <Input placeholder="搜索算法ID/名称" value={searchLib} onChange={e => setSearchLib(e.target.value)} className="w-64" />
            </CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>算法ID</TableHead><TableHead>算法名称</TableHead><TableHead>分类</TableHead>
                    <TableHead>版本</TableHead><TableHead>作者</TableHead><TableHead>状态</TableHead><TableHead>下载量</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlg.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{a.id}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{a.version}</TableCell>
                      <TableCell>{a.author}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[a.status]}`}>{a.status}</span></TableCell>
                      <TableCell>{a.downloads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compute" className="mt-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">运行中</p><p className="text-2xl font-bold text-blue-600">{computeTasks.filter(t => t.status === "运行中").length}</p></CardContent></Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">已完成</p><p className="text-2xl font-bold text-emerald-600">{computeTasks.filter(t => t.status === "已完成").length}</p></CardContent></Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">失败</p><p className="text-2xl font-bold text-red-600">{computeTasks.filter(t => t.status === "失败").length}</p></CardContent></Card>
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4"><p className="text-sm text-gray-500">待运行</p><p className="text-2xl font-bold text-gray-600">{computeTasks.filter(t => t.status === "待运行").length}</p></CardContent></Card>
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <Input placeholder="搜索算法包或任务ID" value={searchTask} onChange={e => setSearchTask(e.target.value)} className="w-64" />
            </CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead><TableHead>算法包</TableHead><TableHead>版本</TableHead><TableHead>输入数据</TableHead>
                    <TableHead>状态</TableHead><TableHead>开始时间</TableHead><TableHead>耗时</TableHead><TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTask.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.algorithm}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">{t.version}</TableCell>
                      <TableCell className="text-gray-500">{t.inputData}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs border ${taskStatusColor[t.status]}`}>{t.status}</span></TableCell>
                      <TableCell className="text-xs text-gray-500">{t.startTime}</TableCell>
                      <TableCell className="text-xs text-gray-500">{t.duration}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                          {t.status === "待运行" && <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"><Play className="h-4 w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
