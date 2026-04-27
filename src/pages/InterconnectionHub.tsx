import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, Search, Link2, Globe, Server, ShieldCheck, Activity, Zap, Radio } from "lucide-react";

interface PlatformNode {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: string;
  protocol: string;
  lastPing: string;
  tasks: number;
}

const platforms: PlatformNode[] = [
  { id: "IC-001", name: "InsightOne-节点A", type: "同构平台", endpoint: "https://mpc-nodeA.example.com", status: "已连接", protocol: "InsightStudio v2", lastPing: "2秒前", tasks: 12 },
  { id: "IC-002", name: "FATE-联邦节点", type: "异构平台", endpoint: "https://fate-node.example.com", status: "已连接", protocol: "FATE v1.11", lastPing: "5秒前", tasks: 8 },
  { id: "IC-003", name: "SecretFlow-节点", type: "异构平台", endpoint: "https://sf-node.example.com", status: "待认证", protocol: "SecretFlow v1.5", lastPing: "-", tasks: 0 },
  { id: "IC-004", name: "隐语-测试节点", type: "异构平台", endpoint: "https://yinyu-node.example.com", status: "已断开", protocol: "隐语协议 v1", lastPing: "1小时前", tasks: 3 },
];

const statusColor: Record<string, string> = {
  "已连接": "bg-green-100 text-green-700",
  "待认证": "bg-amber-100 text-amber-700",
  "已断开": "bg-red-100 text-red-700",
  "连接中": "bg-blue-100 text-blue-700",
};

export default function InterconnectionHub() {
  const [search, setSearch] = useState("");

  const filtered = platforms.filter(d => d.name.includes(search) || d.id.includes(search));

  const stats = {
    total: platforms.length,
    connected: platforms.filter(d => d.status === "已连接").length,
    hetero: platforms.filter(d => d.type === "异构平台").length,
    totalTasks: platforms.reduce((sum, d) => sum + d.tasks, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>互联互通</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">互联互通中心</h1>
            <Badge className="bg-blue-100 text-blue-700">InsightStudio</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">支持与异构隐私计算平台之间的互联互通，实现资源与价值跨平台的互联互通，解决"计算孤岛"难题</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />添加平台节点</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>添加平台节点</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>节点名称</label><Input placeholder="输入节点名称" /></div>
              <div className="space-y-2"><label>平台类型</label>
                <Input placeholder="同构/异构平台" />
              </div>
              <div className="space-y-2"><label>接入地址</label><Input placeholder="https://" /></div>
              <div className="space-y-2"><label>通信协议</label><Input placeholder="InsightStudio / FATE / SecretFlow" /></div>
              <Button className="w-full">添加节点</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium text-gray-500">节点总数</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Link2 className="h-4 w-4 text-green-600" />
            <CardTitle className="text-sm font-medium text-gray-500">已连接</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{stats.connected}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Server className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm font-medium text-gray-500">异构平台</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-purple-600">{stats.hetero}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-sm font-medium text-gray-500">跨平台任务</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-600">{stats.totalTasks}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nodes" className="w-full">
        <TabsList>
          <TabsTrigger value="nodes"><Server className="h-4 w-4 mr-1" /> 平台节点</TabsTrigger>
          <TabsTrigger value="tasks"><Activity className="h-4 w-4 mr-1" /> 跨平台任务</TabsTrigger>
          <TabsTrigger value="protocols"><Radio className="h-4 w-4 mr-1" /> 协议管理</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex gap-3">
                <Input placeholder="搜索节点名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>节点ID</TableHead>
                    <TableHead>节点名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>接入地址</TableHead>
                    <TableHead>协议</TableHead>
                    <TableHead>最后心跳</TableHead>
                    <TableHead>任务数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>
                        <Badge variant={d.type === "同构平台" ? "default" : "outline"}>{d.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{d.endpoint}</TableCell>
                      <TableCell>{d.protocol}</TableCell>
                      <TableCell className="text-xs">{d.lastPing}</TableCell>
                      <TableCell>{d.tasks}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {d.status === "待认证" ? (
                            <Button size="sm" variant="outline"><ShieldCheck className="h-3 w-3 mr-1" />认证</Button>
                          ) : d.status === "已断开" ? (
                            <Button size="sm" variant="outline">重连</Button>
                          ) : (
                            <Button size="sm" variant="ghost">查看</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">跨平台联合任务</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>任务名称</TableHead>
                    <TableHead>参与平台</TableHead>
                    <TableHead>任务类型</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-gray-500">XPT-001</TableCell>
                    <TableCell className="font-medium">跨平台隐私求交</TableCell>
                    <TableCell>InsightOne + FATE</TableCell>
                    <TableCell>PSI</TableCell>
                    <TableCell><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">执行成功</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-gray-500">XPT-002</TableCell>
                    <TableCell className="font-medium">跨平台联邦建模</TableCell>
                    <TableCell>InsightOne + SecretFlow</TableCell>
                    <TableCell>纵向联邦</TableCell>
                    <TableCell><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">运行中</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-gray-500">XPT-003</TableCell>
                    <TableCell className="font-medium">联合统计分析</TableCell>
                    <TableCell>FATE + 隐语</TableCell>
                    <TableCell>联合统计</TableCell>
                    <TableCell><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">待执行</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" />InsightStudio v2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">洞见自研互联互通协议，支持同构平台之间的全功能互通</p>
                <Badge className="mt-2 bg-green-100 text-green-700">已启用</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Server className="h-5 w-5 text-blue-600" />FATE 适配器</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">微众银行FATE框架适配器，支持联邦学习场景互通</p>
                <Badge className="mt-2 bg-green-100 text-green-700">已启用</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Server className="h-5 w-5 text-purple-600" />SecretFlow 适配器</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">蚂蚁集团SecretFlow框架适配器，支持MPC场景互通</p>
                <Badge className="mt-2 bg-amber-100 text-amber-700">配置中</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
