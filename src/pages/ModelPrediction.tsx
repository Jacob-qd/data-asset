import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Play, Search, Eye, Download, Save, BarChart3 } from "lucide-react";

interface PredictionTask {
  id: string;
  taskName: string;
  modelName: string;
  predictResource: string;
  involvedNodes: string;
  status: string;
  resultCount: number;
  createdAt: string;
  accuracy: string;
}

const predictionTasks: PredictionTask[] = [
  { id: "PRED-2026-001", taskName: "信用评分批量预测", modelName: "信用评分模型V1", predictResource: "credit_test_data", involvedNodes: "节点A,节点B", status: "已完成", resultCount: 15000, createdAt: "2026-04-24", accuracy: "94.2%" },
  { id: "PRED-2026-002", taskName: "反欺诈实时预测", modelName: "反欺诈模型XGB", predictResource: "fraud_test_2026Q1", involvedNodes: "节点A,节点C", status: "已完成", resultCount: 8200, createdAt: "2026-04-23", accuracy: "91.8%" },
  { id: "PRED-2026-003", taskName: "用户分群预测", modelName: "用户画像KMeans", predictResource: "user_active_april", involvedNodes: "节点B", status: "预测中", resultCount: 0, createdAt: "2026-04-22", accuracy: "-" },
  { id: "PRED-2026-004", taskName: "风险评估预测", modelName: "风险评估评分卡", predictResource: "loan_apply_2026", involvedNodes: "节点A,节点B,节点C", status: "待执行", resultCount: 0, createdAt: "2026-04-21", accuracy: "-" },
];

const statusColor: Record<string, string> = {
  "预测中": "bg-blue-100 text-blue-700",
  "已完成": "bg-green-100 text-green-700",
  "待执行": "bg-gray-100 text-gray-700",
  "执行失败": "bg-red-100 text-red-700",
};

export default function ModelPrediction() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = predictionTasks.filter(d => {
    const matchSearch = d.taskName.includes(search) || d.id.includes(search);
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>模型预测</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">模型预测</h1>
          <p className="text-sm text-gray-500 mt-1.5">选择已保留成果的模型，配置预测数据集进行批量预测，支持结果下载与保存为新资源</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"><Play className="mr-2 h-4 w-4" />新建预测任务</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl border-0 shadow-2xl">
            <DialogHeader><DialogTitle>新建模型预测任务</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><label>任务名称</label><Input placeholder="输入预测任务名称" /></div>
              <div className="space-y-2"><label>选择模型</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择已保留成果的模型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m1">信用评分模型V1</SelectItem>
                    <SelectItem value="m2">反欺诈模型XGB</SelectItem>
                    <SelectItem value="m3">用户画像KMeans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><label>预测数据集</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择预测数据集（字段需与训练一致）" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="r1">credit_test_data</SelectItem>
                    <SelectItem value="r2">fraud_test_2026Q1</SelectItem>
                    <SelectItem value="r3">user_active_april</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                注意：每个资源只能选择对应节点的本地资源，且字段应与模型训练时使用的资源保持一致
              </div>
              <Button className="w-full">开始预测</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">预测任务总数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{predictionTasks.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">预测中</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{predictionTasks.filter(d => d.status === "预测中").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已完成</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{predictionTasks.filter(d => d.status === "已完成").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">总预测样本数</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">{predictionTasks.reduce((sum, d) => sum + d.resultCount, 0).toLocaleString()}</div></CardContent></Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3 items-center">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="状态筛选" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="预测中">预测中</SelectItem>
                <SelectItem value="已完成">已完成</SelectItem>
                <SelectItem value="待执行">待执行</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>任务ID</TableHead>
                <TableHead>任务名称</TableHead>
                <TableHead>模型名称</TableHead>
                <TableHead>预测数据集</TableHead>
                <TableHead>参与节点</TableHead>
                <TableHead>预测样本数</TableHead>
                <TableHead>准确率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.taskName}</TableCell>
                  <TableCell><Badge variant="outline">{d.modelName}</Badge></TableCell>
                  <TableCell>{d.predictResource}</TableCell>
                  <TableCell className="text-xs">{d.involvedNodes}</TableCell>
                  <TableCell>{d.resultCount > 0 ? d.resultCount.toLocaleString() : "-"}</TableCell>
                  <TableCell>{d.accuracy}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {d.status === "已完成" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8"><Save className="h-3 w-3 mr-1" />保存资源</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        </>
                      )}
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
