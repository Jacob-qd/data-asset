import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Plus, Search, Eye, Globe, Lock, Unlock, Copy } from "lucide-react";

interface Service {
  id: string;
  serviceName: string;
  modelName: string;
  apiEndpoint: string;
  computeEncrypt: boolean;
  resultEncrypt: boolean;
  status: string;
  callCount: number;
  createdAt: string;
}

const services: Service[] = [
  { id: "SVC-2026-001", serviceName: "信用评分API", modelName: "信用评分模型V1", apiEndpoint: "/api/v1/score/predict", computeEncrypt: true, resultEncrypt: true, status: "运行中", callCount: 12580, createdAt: "2026-04-24" },
  { id: "SVC-2026-002", serviceName: "反欺诈检测服务", modelName: "反欺诈模型XGB", apiEndpoint: "/api/v1/fraud/detect", computeEncrypt: true, resultEncrypt: false, status: "运行中", callCount: 8932, createdAt: "2026-04-23" },
  { id: "SVC-2026-003", serviceName: "用户分群服务", modelName: "用户画像KMeans", apiEndpoint: "/api/v1/cluster/predict", computeEncrypt: false, resultEncrypt: true, status: "已停止", callCount: 3201, createdAt: "2026-04-22" },
  { id: "SVC-2026-004", serviceName: "风险评估服务", modelName: "风险评估评分卡", apiEndpoint: "/api/v1/risk/evaluate", computeEncrypt: true, resultEncrypt: true, status: "待发布", callCount: 0, createdAt: "2026-04-21" },
];

const statusColor: Record<string, string> = {
  "运行中": "bg-green-100 text-green-700",
  "已停止": "bg-gray-100 text-gray-700",
  "待发布": "bg-amber-100 text-amber-700",
  "发布失败": "bg-red-100 text-red-700",
};

export default function PublishService() {
  const [search, setSearch] = useState("");

  const filtered = services.filter(d => d.serviceName.includes(search) || d.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>发布服务</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">发布服务</h1>
          <p className="text-sm text-gray-500 mt-1.5">将模型发布为在线API服务，配置计算加密、结果加密等安全选项</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Globe className="mr-2 h-4 w-4" />发布新服务</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>发布模型服务</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>服务名称</label><Input placeholder="输入服务名称" /></div>
              <div className="space-y-2"><label>服务描述</label><Input placeholder="输入服务描述" /></div>
              <div className="space-y-2"><label>选择模型</label><Input placeholder="选择已保留成果的模型" /></div>
              <div className="space-y-2"><label>API地址</label><Input placeholder="/api/v1/custom/predict" /></div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <label className="font-medium">计算加密</label>
                  <p className="text-xs text-gray-500">对输入数据进行加密后再计算</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <label className="font-medium">结果加密</label>
                  <p className="text-xs text-gray-500">对返回结果进行加密保护</p>
                </div>
                <Switch />
              </div>
              <Button className="w-full">发布服务</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">服务总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{services.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">运行中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{services.filter(d => d.status === "运行中").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总调用次数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{services.reduce((sum, d) => sum + d.callCount, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">加密保护</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">{services.filter(d => d.computeEncrypt && d.resultEncrypt).length}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索服务名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>服务ID</TableHead>
                <TableHead>服务名称</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>API端点</TableHead>
                <TableHead>计算加密</TableHead>
                <TableHead>结果加密</TableHead>
                <TableHead>调用次数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.serviceName}</TableCell>
                  <TableCell><Badge variant="outline">{d.modelName}</Badge></TableCell>
                  <TableCell className="font-mono text-xs flex items-center gap-1">
                    {d.apiEndpoint}
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                  </TableCell>
                  <TableCell>{d.computeEncrypt ? <Lock className="h-4 w-4 text-green-600" /> : <Unlock className="h-4 w-4 text-gray-400" />}</TableCell>
                  <TableCell>{d.resultEncrypt ? <Lock className="h-4 w-4 text-green-600" /> : <Unlock className="h-4 w-4 text-gray-400" />}</TableCell>
                  <TableCell>{d.callCount.toLocaleString()}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
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
