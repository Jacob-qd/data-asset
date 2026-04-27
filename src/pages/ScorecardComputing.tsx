import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Play, Eye, Trash2, ChevronRight, CreditCard } from "lucide-react";

const scorecardData = [
  { id: "SC-2026-001", name: "个人信贷评分卡", model: "逻辑回归", status: "已发布", scoreRange: "300-850", parties: ["银行A", "征信B"], createdAt: "2026-04-01" },
  { id: "SC-2026-002", name: "小微企业信用评分", model: "XGBoost", status: "训练中", scoreRange: "0-100", parties: ["银行A", "税务B", "工商C"], createdAt: "2026-04-10" },
  { id: "SC-2026-003", name: "反欺诈风险评分", model: "神经网络", status: "已发布", scoreRange: "0-1000", parties: ["支付A", "支付B", "风控C"], createdAt: "2026-03-20" },
  { id: "SC-2026-004", name: "保险理赔风险评分", model: "逻辑回归", status: "待发布", scoreRange: "0-100", parties: ["保险A", "保险B"], createdAt: "2026-04-15" },
];

export default function ScorecardComputing() {
  const [search, setSearch] = useState("");

  const filtered = scorecardData.filter(s => s.name.includes(search) || s.id.includes(search));

  const statusColor: Record<string, string> = {
    "已发布": "bg-green-100 text-green-700",
    "训练中": "bg-blue-100 text-blue-700",
    "待发布": "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>评分卡计算</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">评分卡计算</h1>
          <p className="text-sm text-gray-500 mt-1.5">基于隐私计算的评分卡模型推理与实时评分</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建评分卡</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>新建评分卡模型</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>评分卡名称</label><Input placeholder="输入名称" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>模型类型</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lr">逻辑回归</SelectItem>
                      <SelectItem value="xgb">XGBoost</SelectItem>
                      <SelectItem value="nn">神经网络</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label>评分范围</label><Input placeholder="如：300-850" /></div>
              </div>
              <div className="space-y-2"><label>特征变量</label><Input placeholder="输入特征字段" /></div>
              <div className="space-y-2"><label>参与方数据源</label><Input placeholder="选择数据源" /></div>
              <Button className="w-full">创建评分卡</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">评分卡总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{scorecardData.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已发布</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{scorecardData.filter(s => s.status === "已发布").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">今日评分次数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">12.5K</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">平均响应</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">45ms</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索评分卡ID/名称" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"><Search className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>评分卡ID</TableHead>
                <TableHead>评分卡名称</TableHead>
                <TableHead>模型类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>评分范围</TableHead>
                <TableHead>参与方</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.model}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                  <TableCell>{s.scoreRange}</TableCell>
                  <TableCell className="text-xs">{s.parties.join(", ")}</TableCell>
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
