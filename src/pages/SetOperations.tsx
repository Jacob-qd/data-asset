import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Play, Eye, Trash2, ChevronRight, ArrowRightLeft, Users, Filter, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tasksData = [
  { id: "PSI-2026-001", name: "金融机构客户重叠分析", type: "交集", status: "已完成", parties: ["银行A", "银行B"], resultSize: "1.2M", duration: "15min", createdAt: "2026-04-20" },
  { id: "PSI-2026-002", name: "医保用户交叉验证", type: "交集", status: "进行中", parties: ["医院A", "社保中心"], resultSize: "-", duration: "-", createdAt: "2026-04-21" },
  { id: "PSI-2026-003", name: "电商用户去重", type: "并集", status: "已完成", parties: ["电商A", "电商B", "电商C"], resultSize: "8.5M", duration: "42min", createdAt: "2026-04-18" },
  { id: "PSI-2026-004", name: "黑名单差集比对", type: "差集", status: "待执行", parties: ["风控A", "征信B"], resultSize: "-", duration: "-", createdAt: "2026-04-22" },
  { id: "PSI-2026-005", name: "供应链供应商全集", type: "并集", status: "已完成", parties: ["厂商A", "厂商B"], resultSize: "320K", duration: "8min", createdAt: "2026-04-15" },
];

export default function SetOperations() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = tasksData.filter(t => {
    const matchSearch = t.name.includes(search) || t.id.includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
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
          <BreadcrumbItem><BreadcrumbLink>集合运算</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">集合运算（PSI）</h1>
          <p className="text-sm text-gray-500 mt-1.5">隐私求交（PSI）、并集、差集运算，支持多方数据安全碰撞</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Plus className="mr-2 h-4 w-4" />新建运算任务</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>新建运算任务</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>任务名称</label><Input placeholder="输入任务名称" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>运算类型</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="交集">隐私求交（交集）</SelectItem>
                      <SelectItem value="并集">并集运算</SelectItem>
                      <SelectItem value="差集">差集运算</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label>参与方数量</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择数量" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2方</SelectItem>
                      <SelectItem value="3">3方</SelectItem>
                      <SelectItem value="multi">多方（4+）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><label>匹配字段</label><Input placeholder="如：手机号、身份证号、用户ID" /></div>
              <div className="space-y-2"><label>参与方数据源</label><Input placeholder="选择各参与方的数据集" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label>加密协议</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择协议" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecdh">ECDH-PSI</SelectItem>
                      <SelectItem value="kkrt">KKRT16</SelectItem>
                      <SelectItem value="rr22">RR22</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label>结果输出</label>
                  <Select><SelectTrigger><SelectValue placeholder="选择输出" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardinality">仅基数（数量）</SelectItem>
                      <SelectItem value="intersection">交集元素</SelectItem>
                      <SelectItem value="both">基数+元素</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">创建任务</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList>
          <TabsTrigger value="operations"><ArrowRightLeft className="h-4 w-4 mr-1" />集合运算</TabsTrigger>
          <TabsTrigger value="conditions"><Filter className="h-4 w-4 mr-1" />条件运算</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="mt-4 space-y-4">

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">交集任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">24</div><div className="text-xs text-gray-500">本月完成</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">并集任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">8</div><div className="text-xs text-gray-500">本月完成</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">差集任务</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">3</div><div className="text-xs text-gray-500">本月完成</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input placeholder="搜索任务ID/名称" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="运算类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="交集">交集</SelectItem>
                <SelectItem value="并集">并集</SelectItem>
                <SelectItem value="差集">差集</SelectItem>
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
                <TableHead>运算类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>参与方</TableHead>
                <TableHead>结果规模</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[t.status]}`}>{t.status}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span className="text-xs">{t.parties.join(", ")}</span></div>
                  </TableCell>
                  <TableCell>{t.resultSize}</TableCell>
                  <TableCell>{t.duration}</TableCell>
                  <TableCell className="text-xs">{t.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {t.status === "已完成" && <Button size="sm" className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"><Archive className="w-3 h-3" />归档</Button>}
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
        </TabsContent>

        <TabsContent value="conditions" className="mt-4 space-y-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3"><div className="text-sm font-medium text-gray-700">条件集合运算任务</div></CardHeader>
            <CardContent>
              <Table className="unified-table"><TableHeader><TableRow className="bg-gray-50/80">{["任务ID","任务名称","条件表达式","运算类型","状态","操作"].map(h=><TableHead key={h} className="text-xs font-semibold text-gray-600 py-3.5 px-4">{h}</TableHead>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-50">{[
                {id:"CND-001",name:"活跃用户ID求交",expr:"last_login >= '2026-01-01' AND status = 'active'",type:"条件交集",status:"已完成"},
                {id:"CND-002",name:"高价值客户匹配",expr:"total_amount > 100000 AND vip_level >= 3",type:"条件交集",status:"已完成"},
                {id:"CND-003",name:"合规用户筛选",expr:"age >= 18 AND consent = true",type:"条件交集",status:"运行中"},
                {id:"CND-004",name:"设备去重",expr:"device_type IN ('iOS','Android') AND region = 'CN'",type:"条件差集",status:"已完成"},
                {id:"CND-005",name:"新客标签匹配",expr:"register_date >= '2026-04-01' AND tag IS NOT NULL",type:"条件交集",status:"待运行"},
              ].map((t)=>(<TableRow key={t.id} className="hover:bg-indigo-50/30 transition-colors"><TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{t.id}</TableCell><TableCell className="py-3.5 px-4 font-medium text-sm">{t.name}</TableCell><TableCell className="py-3.5 px-4"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t.expr}</code></TableCell><TableCell className="py-3.5 px-4"><Badge variant="outline">{t.type}</Badge></TableCell><TableCell className="py-3.5 px-4"><Badge className={t.status==="已完成"?"bg-emerald-50 text-emerald-700":t.status==="运行中"?"bg-blue-50 text-blue-700":"bg-gray-100 text-gray-500"}>{t.status}</Badge></TableCell><TableCell className="py-3.5 px-4"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8"><Play className="h-4 w-4"/></Button></div></TableCell></TableRow>))}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
