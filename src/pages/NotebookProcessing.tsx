import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, Search, Play, Save, FileCode, Terminal, BookOpen, Clock, Cpu } from "lucide-react";

interface Notebook {
  id: string;
  name: string;
  resource: string;
  kernel: string;
  status: string;
  lastRun: string;
  cellCount: number;
}

const notebooks: Notebook[] = [
  { id: "NB-2026-001", name: "数据清洗-用户画像", resource: "user_profile_v2", kernel: "Python 3.10", status: "运行中", lastRun: "2026-04-24 10:23", cellCount: 12 },
  { id: "NB-2026-002", name: "特征工程-信用评估", resource: "credit_data_2026", kernel: "Python 3.10", status: "已保存", lastRun: "2026-04-23 16:45", cellCount: 24 },
  { id: "NB-2026-003", name: "缺失值处理", resource: "loan_application_q1", kernel: "Python 3.10", status: "待执行", lastRun: "2026-04-22 09:12", cellCount: 8 },
  { id: "NB-2026-004", name: "异常检测脚本", resource: "transaction_data", kernel: "Python 3.10", status: "执行成功", lastRun: "2026-04-21 14:30", cellCount: 18 },
];

const statusColor: Record<string, string> = {
  "运行中": "bg-blue-100 text-blue-700",
  "已保存": "bg-green-100 text-green-700",
  "待执行": "bg-gray-100 text-gray-700",
  "执行成功": "bg-green-100 text-green-700",
  "执行失败": "bg-red-100 text-red-700",
};

const codeTemplate = `# 数据处理 Notebook 示例
import pandas as pd
import numpy as np

# 1. 加载数据资源
df = pd.read_csv("resource://user_profile_v2")

# 2. 数据概览
print(f"数据形状: {df.shape}")
print(f"列信息:")
print(df.info())

# 3. 缺失值处理
df = df.fillna(df.mean())

# 4. 重复数据删除
df = df.drop_duplicates()

# 5. 保存处理结果
df.to_csv("resource://user_profile_v2_cleaned")`;

export default function NotebookProcessing() {
  const [search, setSearch] = useState("");

  const filtered = notebooks.filter(d => d.name.includes(search) || d.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink href="/privacy/data-processing">数据处理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>Notebook专家模式</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notebook 专家模式</h1>
          <p className="text-sm text-gray-500 mt-1.5">基于 Jupyter Notebook 的交互式数据处理，支持 Python 编写自定义数据清洗、转换、统计、可视化</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建Notebook</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>新建 Notebook</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>Notebook名称</label><Input placeholder="输入名称" /></div>
              <div className="space-y-2"><label>选择数据资源</label><Input placeholder="选择要处理的资源" /></div>
              <div className="space-y-2"><label>内核版本</label>
                <Input defaultValue="Python 3.10 (Privacy)" disabled />
              </div>
              <Button className="w-full">创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Notebook总数</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{notebooks.length}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">运行中</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{notebooks.filter(d => d.status === "运行中").length}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">执行成功</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{notebooks.filter(d => d.status === "执行成功").length}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">代码单元格</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-purple-600">{notebooks.reduce((sum, d) => sum + d.cellCount, 0)}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list"><BookOpen className="h-4 w-4 mr-1" /> Notebook列表</TabsTrigger>
          <TabsTrigger value="editor"><Terminal className="h-4 w-4 mr-1" /> 代码编辑器</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex gap-3">
                <Input placeholder="搜索Notebook名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
                <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"><Search className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="unified-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>数据资源</TableHead>
                    <TableHead>内核</TableHead>
                    <TableHead>单元格数</TableHead>
                    <TableHead>最后执行</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell><Badge variant="outline">{d.resource}</Badge></TableCell>
                      <TableCell className="flex items-center gap-1"><Cpu className="h-3 w-3" />{d.kernel}</TableCell>
                      <TableCell>{d.cellCount}</TableCell>
                      <TableCell className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{d.lastRun}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8"><Play className="h-3 w-3 mr-1" />运行</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Save className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">数据清洗-用户画像.ipynb</CardTitle>
                  <Badge variant="outline">Python 3.10</Badge>
                  <Badge className="bg-green-100 text-green-700">已连接</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Play className="h-3 w-3 mr-1" />全部运行</Button>
                  <Button variant="outline" size="sm"><Save className="h-3 w-3 mr-1" />保存</Button>
                  <Button size="sm" variant="default">+ 添加单元格</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-12 bg-gray-50 border-r py-4 text-right pr-2 text-xs text-gray-400 select-none font-mono">
                  1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11<br/>12<br/>13<br/>14<br/>15<br/>16<br/>17<br/>18
                </div>
                <pre className="flex-1 p-4 text-sm font-mono text-gray-800 overflow-x-auto" style={{background: '#fafafa'}}>
                  {codeTemplate}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
