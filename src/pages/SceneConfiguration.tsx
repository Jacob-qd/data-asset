import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Plus, Search, Eye } from "lucide-react";

const scenes = [
  { id: "SC-001", name: "金融风控场景", description: "信贷审批、反欺诈", status: "已启用", assets: "12" },
  { id: "SC-002", name: "精准营销场景", description: "用户画像、推荐系统", status: "已启用", assets: "8" },
  { id: "SC-003", name: "医疗科研场景", description: "疾病预测、药物发现", status: "草稿", assets: "0" },
];

export default function SceneConfiguration() {
  const [search, setSearch] = useState("");
  const filtered = scenes.filter(s => s.name.includes(search) || s.id.includes(search));
  const statusColor: Record<string, string> = { "已启用": "bg-green-100 text-green-700", "草稿": "bg-gray-100 text-gray-700" };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>资产运营</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>场景配置</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">场景配置</h1>
        <Dialog>
          <DialogTrigger asChild><Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建场景</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>新建应用场景</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>场景名称</label><Input placeholder="输入场景名称" /></div>
              <div className="space-y-2"><label>场景描述</label><Input placeholder="描述场景用途" /></div>
              <div className="space-y-2"><label>关联资产</label><Input placeholder="选择关联的数据资产" /></div>
              <Button className="w-full">创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3"><Input placeholder="搜索场景" value={search} onChange={e => setSearch(e.target.value)} className="w-64" /></CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow><TableHead>场景ID</TableHead><TableHead>场景名称</TableHead><TableHead>描述</TableHead><TableHead>状态</TableHead><TableHead>资产数</TableHead><TableHead>操作</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{s.description}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                  <TableCell>{s.assets}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
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
