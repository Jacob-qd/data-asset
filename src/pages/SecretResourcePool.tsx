import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, HardDrive, Cpu, MemoryStick, TrendingUp, Trash2, Eye, FileCheck, ArrowRight, Server, Zap, RotateCcw } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  cpu: number;
  totalCpu: number;
  memory: number;
  totalMemory: number;
  storage: number;
  totalStorage: number;
  status: string;
  owner: string;
  usage: number;
}

const resources: Resource[] = [
  { id: "RP-001", name: "密态计算节点A", type: "计算节点", cpu: 12, totalCpu: 16, memory: 24, totalMemory: 32, storage: 600, totalStorage: 1024, status: "运行中", owner: "张三", usage: 75 },
  { id: "RP-002", name: "密态计算节点B", type: "计算节点", cpu: 8, totalCpu: 16, memory: 16, totalMemory: 32, storage: 450, totalStorage: 1024, status: "运行中", owner: "李四", usage: 50 },
  { id: "RP-003", name: "密态计算节点C", type: "计算节点", cpu: 2, totalCpu: 8, memory: 4, totalMemory: 16, storage: 120, totalStorage: 512, status: "闲置", owner: "王五", usage: 15 },
  { id: "RP-004", name: "存储资源池-SSD", type: "存储池", cpu: 0, totalCpu: 0, memory: 0, totalMemory: 0, storage: 800, totalStorage: 2048, status: "运行中", owner: "系统", usage: 39 },
  { id: "RP-005", name: "GPU加速节点", type: "GPU节点", cpu: 4, totalCpu: 8, memory: 12, totalMemory: 16, storage: 300, totalStorage: 512, status: "运行中", owner: "赵六", usage: 65 },
];

const usageRanking = [
  { user: "张三", tasks: 12, cpuHours: 120, memoryHours: 240, rank: 1 },
  { user: "李四", tasks: 8, cpuHours: 85, memoryHours: 160, rank: 2 },
  { user: "赵六", tasks: 6, cpuHours: 60, memoryHours: 96, rank: 3 },
  { user: "王五", tasks: 3, cpuHours: 20, memoryHours: 40, rank: 4 },
];

const statusColor: Record<string, string> = {
  "运行中": "bg-blue-50 text-blue-700 border-blue-100",
  "闲置": "bg-slate-50 text-slate-600 border-slate-200",
  "待释放": "bg-amber-50 text-amber-700 border-amber-100",
  "已释放": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function SecretResourcePool() {
  const [search, setSearch] = useState("");
  const filtered = resources.filter((r) => r.name.includes(search) || r.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/secret">密态计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>密态资源池</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">密态资源池</h1>
          <p className="text-sm text-gray-500 mt-1.5">资源配额管理、资源申请审批、使用排行、资源释放回收</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />申请资源
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Server className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">资源总数</p><p className="text-lg font-bold">{resources.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Cpu className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">总CPU</p><p className="text-lg font-bold">{resources.reduce((s, r) => s + r.totalCpu, 0)}核</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><MemoryStick className="h-5 w-5 text-violet-600" /><div><p className="text-sm text-gray-500">总内存</p><p className="text-lg font-bold">{resources.reduce((s, r) => s + r.totalMemory, 0)}GB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><HardDrive className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-500">总存储</p><p className="text-lg font-bold">{(resources.reduce((s, r) => s + r.totalStorage, 0) / 1024).toFixed(1)}TB</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-cyan-600" /><div><p className="text-sm text-gray-500">平均利用率</p><p className="text-lg font-bold">{Math.round(resources.reduce((s, r) => s + r.usage, 0) / resources.length)}%</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources"><Server className="h-4 w-4 mr-1" />资源管理</TabsTrigger>
          <TabsTrigger value="ranking"><TrendingUp className="h-4 w-4 mr-1" />使用排行</TabsTrigger>
          <TabsTrigger value="approval"><FileCheck className="h-4 w-4 mr-1" />申请审批</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索资源名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Card key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.id} | {r.type}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[r.status]}`}>{r.status}</span>
                  </div>
                  {r.type !== "存储池" && (
                    <>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>CPU</span><span>{r.cpu}/{r.totalCpu}核</span></div>
                          <Progress value={(r.cpu / r.totalCpu) * 100} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>内存</span><span>{r.memory}/{r.totalMemory}GB</span></div>
                          <Progress value={(r.memory / r.totalMemory) * 100} className="h-1.5" />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1"><span>存储</span><span>{r.storage}/{r.totalStorage}GB</span></div>
                    <Progress value={(r.storage / r.totalStorage) * 100} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">负责人: {r.owner}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="释放资源"><RotateCcw className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="回收资源"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["排名", "用户", "执行任务数", "CPU使用时长(小时)", "内存使用时长(小时)", "综合评分"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {usageRanking.map((u) => (
                  <TableRow key={u.user} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${u.rank === 1 ? "bg-amber-100 text-amber-700" : u.rank === 2 ? "bg-gray-200 text-gray-700" : u.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{u.rank}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{u.user}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.tasks}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.cpuHours}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{u.memoryHours}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={u.rank === 1 ? 100 : u.rank === 2 ? 70 : u.rank === 3 ? 50 : 25} className="h-1.5 w-16" />
                        <span className="text-xs">{u.rank === 1 ? "高" : u.rank === 2 ? "中高" : "中"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["申请ID", "申请人", "资源类型", "申请规格", "申请时间", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {[
                  { id: "REQ-001", user: "张三", type: "计算节点", spec: "8核16GB 500GB", time: "2026-04-24 10:00", status: "待审批" },
                  { id: "REQ-002", user: "李四", type: "存储池", spec: "1TB SSD", time: "2026-04-24 09:30", status: "已通过" },
                  { id: "REQ-003", user: "王五", type: "GPU节点", spec: "8核16GB 512GB", time: "2026-04-23 16:00", status: "已驳回" },
                ].map((req) => (
                  <TableRow key={req.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{req.id}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{req.user}</TableCell>
                    <TableCell className="py-3.5 px-4"><Badge variant="outline" className="text-xs">{req.type}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{req.spec}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{req.time}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === "已通过" ? "bg-emerald-50 text-emerald-700" : req.status === "待审批" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>{req.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      {req.status === "待审批" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 text-xs bg-emerald-600"><FileCheck className="h-3 w-3 mr-1" />通过</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">驳回</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
