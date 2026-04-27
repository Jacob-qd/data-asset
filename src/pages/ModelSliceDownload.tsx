import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Download, Search, Eye, FileArchive, Server, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SliceModel {
  id: string;
  modelName: string;
  modelType: string;
  status: string;
  sliceFormat: string;
  fileSize: string;
  createdAt: string;
  nodeName: string;
}

const sliceModels: SliceModel[] = [
  { id: "SLICE-2026-001", modelName: "信用评分模型V1", modelType: "逻辑回归", status: "可下载", sliceFormat: "ONNX", fileSize: "2.3MB", createdAt: "2026-04-24", nodeName: "节点A" },
  { id: "SLICE-2026-002", modelName: "反欺诈模型XGB", modelType: "XGBoost", status: "可下载", sliceFormat: "PMML", fileSize: "5.1MB", createdAt: "2026-04-23", nodeName: "节点B" },
  { id: "SLICE-2026-003", modelName: "用户画像KMeans", modelType: "KMeans", status: "需授权", sliceFormat: "JSON", fileSize: "1.8MB", createdAt: "2026-04-22", nodeName: "节点A" },
  { id: "SLICE-2026-004", modelName: "风险评估评分卡", modelType: "评分卡", status: "可下载", sliceFormat: "ONNX", fileSize: "3.2MB", createdAt: "2026-04-21", nodeName: "节点C" },
];

const statusColor: Record<string, string> = {
  "可下载": "bg-green-100 text-green-700",
  "需授权": "bg-amber-100 text-amber-700",
  "已下载": "bg-blue-100 text-blue-700",
  "处理中": "bg-purple-100 text-purple-700",
};

export default function ModelSliceDownload() {
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");

  const filtered = sliceModels.filter(d => {
    const matchSearch = d.modelName.includes(search) || d.id.includes(search);
    const matchFormat = formatFilter === "all" || d.sliceFormat === formatFilter;
    return matchSearch && matchFormat;
  });

  const stats = {
    total: sliceModels.length,
    downloadable: sliceModels.filter(d => d.status === "可下载").length,
    needAuth: sliceModels.filter(d => d.status === "需授权").length,
    downloaded: sliceModels.filter(d => d.status === "已下载").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/privacy">隐私计算</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink href="/privacy/models">模型管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>下载切片模型</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">下载切片模型</h1>
          <p className="text-sm text-gray-500 mt-1.5">模型保留成果后下载切片模型，可直接用于上传Service平台进行在线推理</p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">使用说明</p>
            <p className="text-sm text-blue-700 mt-1">模型保留成果之后，下载的切片模型结果可直接用于上传Service平台，用于后续在线推理。只有状态为"已保留成果"的模型才支持下载切片。</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">切片总数</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">可下载</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{stats.downloadable}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">需授权</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-600">{stats.needAuth}</div></CardContent>
        </Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">已下载</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{stats.downloaded}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex gap-3 items-center">
            <Input placeholder="搜索模型名称或ID" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="格式筛选" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部格式</SelectItem>
                <SelectItem value="ONNX">ONNX</SelectItem>
                <SelectItem value="PMML">PMML</SelectItem>
                <SelectItem value="JSON">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-lg"><Search className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="unified-table">
            <TableHeader>
              <TableRow>
                <TableHead>切片ID</TableHead>
                <TableHead>模型名称</TableHead>
                <TableHead>模型类型</TableHead>
                <TableHead>格式</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>所属节点</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{d.id}</TableCell>
                  <TableCell className="font-medium">{d.modelName}</TableCell>
                  <TableCell>{d.modelType}</TableCell>
                  <TableCell><Badge variant="outline">{d.sliceFormat}</Badge></TableCell>
                  <TableCell>{d.fileSize}</TableCell>
                  <TableCell className="flex items-center gap-1"><Server className="h-3 w-3" />{d.nodeName}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${statusColor[d.status]}`}>{d.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"><Eye className="h-4 w-4" /></Button>
                      {d.status === "可下载" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" title="下载切片模型">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : d.status === "需授权" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" title="申请授权">
                              <FileArchive className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-xl border-0 shadow-2xl">
                            <DialogHeader><DialogTitle>申请下载授权</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                              <p className="text-sm text-gray-500">该切片模型需要资源拥有方授权后才能下载。请填写申请理由：</p>
                              <Input placeholder="申请下载理由" />
                              <Button className="w-full">提交授权申请</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : null}
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
