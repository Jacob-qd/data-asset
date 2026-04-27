import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FolderGit2, Plus, Search, Users, Calendar, ChevronRight, FileText, Settings, Eye, Play, Trash2 } from "lucide-react";

const projectsData = [
  { id: "PJ-2026-001", name: "金融风控联合建模", status: "进行中", type: "联邦学习", parties: ["银行A", "保险B", "征信C"], creator: "张三", createdAt: "2026-01-15", progress: 78 },
  { id: "PJ-2026-002", name: "医疗数据隐私求交", status: "已完成", type: "PSI", parties: ["医院A", "医院B", "研究院"], creator: "李四", createdAt: "2026-02-20", progress: 100 },
  { id: "PJ-2026-003", name: "供应链联合统计", status: "待启动", type: "联合统计", parties: ["供应商A", "物流B"], creator: "王五", createdAt: "2026-03-10", progress: 0 },
  { id: "PJ-2026-004", name: "反欺诈评分卡", status: "进行中", type: "评分卡", parties: ["支付A", "银行B"], creator: "赵六", createdAt: "2026-03-25", progress: 45 },
  { id: "PJ-2026-005", name: "跨境贸易数据融合", status: "已暂停", type: "联邦学习", parties: ["外贸A", "海关B", "税务C"], creator: "钱七", createdAt: "2026-04-01", progress: 30 },
  { id: "PJ-2026-006", name: "精准营销用户画像", status: "进行中", type: "联邦学习", parties: ["电商A", "广告B"], creator: "孙八", createdAt: "2026-04-12", progress: 62 },
];

export default function ModelingProjects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = projectsData.filter(p => {
    const matchSearch = p.name.includes(search) || p.id.includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const statusColor: Record<string, string> = {
    "进行中": "bg-blue-100 text-blue-700",
    "已完成": "bg-green-100 text-green-700",
    "待启动": "bg-gray-100 text-gray-700",
    "已暂停": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>建模项目</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">建模项目管理</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建项目</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>新建建模项目</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>项目名称</label><Input placeholder="输入项目名称" /></div>
                <div className="space-y-2"><label>项目类型</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="联邦学习">联邦学习</SelectItem>
                      <SelectItem value="PSI">隐私求交</SelectItem>
                      <SelectItem value="联合统计">联合统计</SelectItem>
                      <SelectItem value="评分卡">评分卡计算</SelectItem>
                      <SelectItem value="MPC">安全多方计算</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><label>项目描述</label><Input placeholder="描述项目目标和背景" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>参与方</label><Input placeholder="选择参与机构" /></div>
                <div className="space-y-2"><label>数据授权</label><Input placeholder="选择授权数据集" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>算法模板</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择算法" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lr">联邦逻辑回归</SelectItem>
                      <SelectItem value="xgb">联邦XGBoost</SelectItem>
                      <SelectItem value="nn">联邦神经网络</SelectItem>
                      <SelectItem value="kmeans">联邦K-Means</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label>安全参数</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择安全等级" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1">Level 1 - 基础加密</SelectItem>
                      <SelectItem value="L2">Level 2 - 差分隐私</SelectItem>
                      <SelectItem value="L3">Level 3 - 同态加密</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-2">创建项目</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部项目</TabsTrigger>
          <TabsTrigger value="running">进行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="pending">待启动</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex gap-3">
              <Input placeholder="搜索项目ID/名称" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="待启动">待启动</SelectItem>
                  <SelectItem value="已暂停">已暂停</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="联邦学习">联邦学习</SelectItem>
                  <SelectItem value="PSI">PSI</SelectItem>
                  <SelectItem value="联合统计">联合统计</SelectItem>
                  <SelectItem value="评分卡">评分卡</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"><Search className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="unified-table">
              <TableHeader>
                <TableRow>
                  <TableHead>项目ID</TableHead>
                  <TableHead>项目名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>参与方</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>创建人/时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-gray-500">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                    <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[p.status]}`}>{p.status}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{p.parties.join(", ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{p.progress}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{p.creator}</div>
                      <div className="text-xs text-gray-500">{p.createdAt}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
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

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">项目总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{projectsData.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">进行中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{projectsData.filter(p => p.status === "进行中").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已完成</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{projectsData.filter(p => p.status === "已完成").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">参与机构</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">12</div></CardContent></Card>
      </div>
    </div>
  );
}
