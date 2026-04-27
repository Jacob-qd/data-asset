import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  ChevronRight, Plus, Search, FlaskConical, Package, Trash2, Clock, CheckCircle, AlertTriangle, Eye, Thermometer, CalendarDays,
} from "lucide-react";

const samples = [
  { id: "SP-001", name: "用户画像数据样本A", source: "ods_user_info", batchNo: "B20260424001", samplingMethod: "随机抽样", samplingDate: "2026-04-24", storageLocation: "冷库-01", storageTemp: "4°C", status: "留样中", retentionDays: 90, inspector: "张三", expireDate: "2026-07-23", observeRecords: 3 },
  { id: "SP-002", name: "订单明细样本B", source: "dwd_order_detail", batchNo: "B20260424002", samplingMethod: "分层抽样", samplingDate: "2026-04-24", storageLocation: "常温库-03", storageTemp: "25°C", status: "留样中", retentionDays: 30, inspector: "李四", expireDate: "2026-05-24", observeRecords: 1 },
  { id: "SP-003", name: "设备ID验证样本C", source: "device_info", batchNo: "B20260423001", samplingMethod: "系统抽样", samplingDate: "2026-04-23", storageLocation: "冷库-02", storageTemp: "4°C", status: "待观察", retentionDays: 60, inspector: "王五", expireDate: "2026-06-22", observeRecords: 0 },
  { id: "SP-004", name: "特征工程输出样本D", source: "credit_features", batchNo: "B20260422001", samplingMethod: "随机抽样", samplingDate: "2026-04-22", storageLocation: "常温库-01", storageTemp: "25°C", status: "已销毁", retentionDays: 0, inspector: "赵六", expireDate: "2026-04-25", observeRecords: 5 },
  { id: "SP-005", name: "模型预测样本E", source: "model_prediction", batchNo: "B20260421001", samplingMethod: "整群抽样", samplingDate: "2026-04-21", storageLocation: "冷库-01", storageTemp: "4°C", status: "观察完成", retentionDays: 90, inspector: "钱七", expireDate: "2026-07-20", observeRecords: 4 },
];

const statusColor: Record<string, string> = {
  "留样中": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待观察": "bg-blue-50 text-blue-700 border-blue-100",
  "观察完成": "bg-purple-50 text-purple-700 border-purple-100",
  "已销毁": "bg-gray-100 text-gray-500 border-gray-200",
};

const observeRecords = [
  { id: 1, sampleId: "SP-001", date: "2026-04-24", item: "外观", result: "正常", note: "样本完整性良好" },
  { id: 2, sampleId: "SP-001", date: "2026-04-25", item: "数据一致性", result: "正常", note: "与源数据一致" },
  { id: 3, sampleId: "SP-001", date: "2026-04-26", item: "字段完整性", result: "正常", note: "字段无缺失" },
];

export default function SampleManagement() {
  const [search, setSearch] = useState("");
  const [detailSample, setDetailSample] = useState<typeof samples[0] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newSample, setNewSample] = useState({ name: "", source: "", batchNo: "", samplingMethod: "随机抽样", storageLocation: "", storageTemp: "", retentionDays: 30 });

  const filtered = samples.filter((s) => s.name.includes(search) || s.id.includes(search) || s.batchNo.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>样品管理</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">样品管理</h1>
          <p className="text-sm text-gray-500 mt-1.5">取样/留样/样品销毁管理，支持定期/不定期观察检验</p>
        </div>
        <Button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />登记样品
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Package className="h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-500">样品总数</p><p className="text-lg font-bold">{samples.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><FlaskConical className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">留样中</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "留样中").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">待观察</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "待观察").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-purple-600" /><div><p className="text-sm text-gray-500">观察完成</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "观察完成").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Trash2 className="h-5 w-5 text-gray-500" /><div><p className="text-sm text-gray-500">已销毁</p><p className="text-lg font-bold">{samples.filter((s) => s.status === "已销毁").length}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部样品</TabsTrigger>
          <TabsTrigger value="retention">留样中</TabsTrigger>
          <TabsTrigger value="observe">观察检验</TabsTrigger>
          <TabsTrigger value="destroyed">已销毁</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Input placeholder="搜索样品名称/批次号/ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "数据源", "批次号", "取样方式", "取样日期", "存放位置", "温度", "留样天数", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.source}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.samplingMethod}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.samplingDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.storageLocation}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm"><Badge variant="outline" className="gap-1"><Thermometer className="w-3 h-3" />{s.storageTemp}</Badge></TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.retentionDays}天</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Button size="sm" variant="ghost" onClick={() => setDetailSample(s)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "存放位置", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "留样中").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.storageLocation}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Button size="sm" variant="ghost" onClick={() => setDetailSample(s)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="observe" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "观察记录数", "取样日期", "到期日", "状态", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "待观察" || s.status === "观察完成").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{s.observeRecords}条</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.samplingDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Button size="sm" variant="ghost" onClick={() => setDetailSample(s)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="destroyed" className="mt-4">
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["样品ID", "样品名称", "批次号", "销毁日期", "销毁人", "状态"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((s) => s.status === "已销毁").map((s) => (
                  <TableRow key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{s.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.batchNo}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.expireDate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{s.inspector}</TableCell>
                    <TableCell className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[s.status]}`}>{s.status}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailSample} onOpenChange={() => setDetailSample(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>样品详情 - {detailSample?.id}</DialogTitle></DialogHeader>
          {detailSample && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "样品名称", value: detailSample.name },
                  { label: "数据源", value: detailSample.source },
                  { label: "批次号", value: detailSample.batchNo },
                  { label: "取样方式", value: detailSample.samplingMethod },
                  { label: "取样日期", value: detailSample.samplingDate },
                  { label: "存放位置", value: detailSample.storageLocation },
                  { label: "存储温度", value: detailSample.storageTemp },
                  { label: "留样天数", value: detailSample.retentionDays },
                  { label: "到期日", value: detailSample.expireDate },
                  { label: "状态", value: detailSample.status },
                  { label: "取样人", value: detailSample.inspector },
                  { label: "观察记录", value: detailSample.observeRecords + "条" },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              {detailSample.observeRecords > 0 && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium mb-2">观察检验记录</div>
                  <div className="space-y-2">
                    {observeRecords.filter((r) => r.sampleId === detailSample.id).map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{rec.date}</span>
                          <Badge variant="outline">{rec.item}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-50 text-emerald-700">{rec.result}</Badge>
                          <span className="text-xs text-gray-500">{rec.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailSample(null)}>关闭</Button>
                {detailSample.status !== "已销毁" && (
                  <>
                    <Button variant="outline" className="gap-1"><CalendarDays className="w-4 h-4" />添加观察</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-1"><Trash2 className="w-4 h-4" />销毁样品</Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Sample Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>登记样品</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: "样品名称", key: "name", placeholder: "如：用户画像数据样本A" },
              { label: "数据源", key: "source", placeholder: "如：ods_user_info" },
              { label: "批次号", key: "batchNo", placeholder: "如：B20260424001" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <Input value={newSample[field.key as keyof typeof newSample] as string} onChange={(e) => setNewSample({ ...newSample, [field.key]: e.target.value })} placeholder={field.placeholder} className="h-9" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">取样方式</label>
              <select value={newSample.samplingMethod} onChange={(e) => setNewSample({ ...newSample, samplingMethod: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm">
                <option>随机抽样</option><option>分层抽样</option><option>系统抽样</option><option>整群抽样</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
                <Input value={newSample.storageLocation} onChange={(e) => setNewSample({ ...newSample, storageLocation: e.target.value })} placeholder="如：冷库-01" className="h-9" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">存储温度</label>
                <Input value={newSample.storageTemp} onChange={(e) => setNewSample({ ...newSample, storageTemp: e.target.value })} placeholder="如：4°C" className="h-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">留样天数</label>
              <Input type="number" value={newSample.retentionDays} onChange={(e) => setNewSample({ ...newSample, retentionDays: parseInt(e.target.value) })} placeholder="如：30" className="h-9" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setAddOpen(false)}>保存登记</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
