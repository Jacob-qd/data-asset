import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, CheckCircle2, XCircle, Eye, FileText, ShieldCheck,
  ThumbsUp, ThumbsDown, AlertTriangle, Clock, Download,
} from "lucide-react";

const reviewItems = [
  { id: "REV-001", name: "信用评分模型_v2.1", type: "模型", submitter: "李四", reviewer: "审核员A", status: "pending", submitTime: "2024-04-15 10:00", description: "基于XGBoost的信用评分模型，AUC=0.923", sensitivity: "高", dataScope: "全量客户数据" },
  { id: "REV-002", name: "零售客户画像", type: "分析报告", submitter: "张三", reviewer: "审核员B", status: "approved", submitTime: "2024-04-14 15:30", description: "客户分群分析报告，包含RFM分析", sensitivity: "中", dataScope: "零售业务数据" },
  { id: "REV-003", name: "异常检测模型", type: "模型", submitter: "王五", reviewer: "审核员A", status: "rejected", submitTime: "2024-04-14 09:00", description: "交易异常检测模型，误报率偏高", sensitivity: "高", dataScope: "交易流水数据" },
  { id: "REV-004", name: "供应链预测_v1.0", type: "模型", submitter: "赵六", reviewer: "审核员B", status: "pending", submitTime: "2024-04-15 08:00", description: "需求预测模型，MAPE=12.3%", sensitivity: "低", dataScope: "供应链数据" },
  { id: "REV-005", name: "流失预警模型", type: "模型", submitter: "张三", reviewer: "审核员A", status: "approved", submitTime: "2024-04-13 14:00", description: "用户流失预测模型，召回率0.87", sensitivity: "中", dataScope: "用户行为数据" },
];

export default function SandboxResultReview() {
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = reviewItems.filter(r => r.name.includes(search) || r.id.includes(search));

  const handleView = (item: any) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleApprove = (id: string) => {
    const item = reviewItems.find(r => r.id === id);
    if (item) item.status = "approved";
    setDetailOpen(false);
  };

  const handleReject = (id: string) => {
    setRejectReason("");
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (selectedItem) {
      selectedItem.status = "rejected";
    }
    setRejectOpen(false);
    setDetailOpen(false);
  };

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "待审核", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3 h-3" /> },
    approved: { label: "已通过", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "已驳回", color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-3 h-3" /> },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">结果审查</h1>
          <p className="text-sm text-gray-500 mt-1">模型与报告的审批管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />导出</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索审查项..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">审查列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>审查ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>提交人</TableHead>
                <TableHead>审核人</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const s = statusMap[item.status];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                    <TableCell>{item.submitter}</TableCell>
                    <TableCell>{item.reviewer}</TableCell>
                    <TableCell><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">{item.submitTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(item)}><Eye className="w-4 h-4" /></Button>
                        {item.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleApprove(item.id)}><ThumbsUp className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setSelectedItem(item); handleReject(item.id); }}><ThumbsDown className="w-4 h-4" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>审查详情</SheetTitle>
            <SheetDescription>查看审查项详细信息</SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <div className="space-y-5 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-500">审查ID</span><span className="text-sm font-mono">{selectedItem.id}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">名称</span><span className="text-sm font-medium">{selectedItem.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">类型</span><Badge variant="outline">{selectedItem.type}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">提交人</span><span className="text-sm">{selectedItem.submitter}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">审核人</span><span className="text-sm">{selectedItem.reviewer}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">提交时间</span><span className="text-sm">{selectedItem.submitTime}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">敏感度</span><Badge className={selectedItem.sensitivity === "高" ? "bg-red-50 text-red-700" : selectedItem.sensitivity === "中" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}>{selectedItem.sensitivity}</Badge></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">数据范围</span><span className="text-sm">{selectedItem.dataScope}</span></div>
                <div className="pt-2"><span className="text-sm text-gray-500">描述</span><p className="text-sm mt-1">{selectedItem.description}</p></div>
              </div>
              {selectedItem.status === "pending" && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedItem.id)}>
                    <ThumbsUp className="w-4 h-4" />通过
                  </Button>
                  <Button variant="destructive" className="gap-2" onClick={() => handleReject(selectedItem.id)}>
                    <ThumbsDown className="w-4 h-4" />驳回
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>驳回原因</DialogTitle>
            <DialogDescription>请输入驳回理由</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="说明驳回原因..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
