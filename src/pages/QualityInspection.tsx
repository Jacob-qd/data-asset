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
  ChevronRight, Search, ShieldCheck, CheckCircle, XCircle, Eye, Ban, Clock, BarChart3, AlertTriangle, FileCheck, Play,
} from "lucide-react";

const inspectItems = [
  { id: "QI-001", taskName: "用户画像数据质检", dataSource: "ods_user_info", sampleSize: 1256, inspectCount: 89, defectCount: 3, defectRate: "3.37%", status: "已通过", inspector: "审核员A", inspectTime: "2026-04-24 14:30", details: "缺失值3处，字段格式异常0处", issues: [{ type: "缺失值", count: 3, severity: "低" }, { type: "格式异常", count: 0, severity: "-" }], suggestion: "补充缺失的用户年龄段信息" },
  { id: "QI-002", taskName: "订单数据完整性检查", dataSource: "dwd_order_detail", sampleSize: 5689, inspectCount: 245, defectCount: 12, defectRate: "4.90%", status: "待审核", inspector: "-", inspectTime: "-", details: "待人工复核异常记录", issues: [{ type: "重复记录", count: 8, severity: "中" }, { type: "空值", count: 4, severity: "低" }], suggestion: "去重后重新执行抽样任务" },
  { id: "QI-003", taskName: "设备ID一致性验证", dataSource: "device_info", sampleSize: 890, inspectCount: 45, defectCount: 0, defectRate: "0.00%", status: "已通过", inspector: "审核员B", inspectTime: "2026-04-24 13:15", details: "全部通过，无异常", issues: [], suggestion: "无需整改" },
  { id: "QI-004", taskName: "特征工程输出质检", dataSource: "credit_features", sampleSize: 3200, inspectCount: 156, defectCount: 28, defectRate: "17.95%", status: "已驳回", inspector: "审核员A", inspectTime: "2026-04-24 12:45", details: "WOE分箱异常28处，需重新配置", issues: [{ type: "WOE异常", count: 28, severity: "高" }], suggestion: "检查WOE分箱单调性设置，重新执行特征工程" },
  { id: "QI-005", taskName: "模型预测结果质检", dataSource: "model_prediction", sampleSize: 5000, inspectCount: 200, defectCount: 5, defectRate: "2.50%", status: "待审核", inspector: "-", inspectTime: "-", details: "5条预测概率异常值待确认", issues: [{ type: "概率越界", count: 3, severity: "中" }, { type: "类型错误", count: 2, severity: "低" }], suggestion: "确认模型输出范围是否在[0,1]区间" },
];

const statusColor: Record<string, string> = {
  "已通过": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "待审核": "bg-blue-50 text-blue-700 border-blue-100",
  "已驳回": "bg-red-50 text-red-700 border-red-100",
};

export default function QualityInspection() {
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<typeof inspectItems[0] | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const filtered = inspectItems.filter((i) => i.taskName.includes(search) || i.id.includes(search));

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">首页</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>抽样管理</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink>质检审核</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">质检审核</h1>
          <p className="text-sm text-gray-500 mt-1.5">对抽样数据进行人工质检审核，支持通过/不通过判定</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">质检任务</p><p className="text-lg font-bold">{inspectItems.length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-gray-500">已通过</p><p className="text-lg font-bold">{inspectItems.filter((i) => i.status === "已通过").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-500">待审核</p><p className="text-lg font-bold">{inspectItems.filter((i) => i.status === "待审核").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-5 w-5 text-red-500" /><div><p className="text-sm text-gray-500">已驳回</p><p className="text-lg font-bold">{inspectItems.filter((i) => i.status === "已驳回").length}</p></div></CardContent></Card>
        <Card className="bg-white rounded-xl border border-gray-100 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-500" /><div><p className="text-sm text-gray-500">平均缺陷率</p><p className="text-lg font-bold">5.74%</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending"><Clock className="h-4 w-4 mr-1" />待审核</TabsTrigger>
          <TabsTrigger value="all"><ShieldCheck className="h-4 w-4 mr-1" />全部记录</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["质检ID", "任务名称", "数据源", "样本量", "缺陷数", "缺陷率", "详情", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.filter((i) => i.status === "待审核").map((item) => (
                  <TableRow key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{item.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{item.taskName}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{item.dataSource}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{item.sampleSize.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm text-red-600 font-medium">{item.defectCount}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{item.defectRate}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500 max-w-[200px] truncate">{item.details}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetailItem(item)}><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><CheckCircle className="w-3.5 h-3.5" />通过</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1"><Ban className="w-3.5 h-3.5" />驳回</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="flex gap-3 mb-4">
            <Input placeholder="搜索任务名称或ID" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm" />
          </div>
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table className="unified-table">
              <TableHeader>
                <TableRow className="bg-gray-50/80 border-b border-gray-100">
                  {["质检ID", "任务名称", "数据源", "样本量", "缺陷数", "缺陷率", "状态", "审核人", "审核时间", "操作"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wider py-3.5 px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-gray-500">{item.id}</TableCell>
                    <TableCell className="py-3.5 px-4 font-medium text-sm">{item.taskName}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{item.dataSource}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{item.sampleSize.toLocaleString()}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm text-red-600 font-medium">{item.defectCount}</TableCell>
                    <TableCell className="py-3.5 px-4 text-sm">{item.defectRate}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[item.status]}`}>{item.status}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{item.inspector}</TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-gray-500">{item.inspectTime}</TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Button size="sm" variant="ghost" onClick={() => setDetailItem(item)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>质检详情 - {detailItem?.id}</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "任务名称", value: detailItem.taskName },
                  { label: "数据源", value: detailItem.dataSource },
                  { label: "样本量", value: detailItem.sampleSize.toLocaleString() },
                  { label: "检查数", value: detailItem.inspectCount },
                  { label: "缺陷数", value: detailItem.defectCount },
                  { label: "缺陷率", value: detailItem.defectRate },
                  { label: "审核人", value: detailItem.inspector },
                  { label: "审核时间", value: detailItem.inspectTime },
                  { label: "状态", value: detailItem.status },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium mb-2">问题明细</div>
                {detailItem.issues.length > 0 ? (
                  <div className="space-y-2">
                    {detailItem.issues.map((issue, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.severity === "高" ? "destructive" : issue.severity === "中" ? "default" : "secondary"}>{issue.severity}</Badge>
                          <span className="text-sm text-gray-700">{issue.type}</span>
                        </div>
                        <span className="text-sm font-medium">{issue.count}处</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">无异常问题</p>
                )}
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium mb-1">整改建议</div>
                <p className="text-sm text-gray-600">{detailItem.suggestion}</p>
              </div>
              {detailItem.status === "待审核" && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDetailItem(null)}>取消</Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-1"><Ban className="w-4 h-4" />驳回</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><CheckCircle className="w-4 h-4" />通过</Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
