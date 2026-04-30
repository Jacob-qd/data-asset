import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2, XCircle, Eye, FileText, ShieldCheck,
  ThumbsUp, ThumbsDown, AlertTriangle, Clock, Download,
  Plus, Pencil, Trash,
} from "lucide-react";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import PageHeader from "@/components/PageHeader";
import PageSearchBar from "@/components/PageSearchBar";
import ActionButtons from "@/components/ActionButtons";

/* ─── Types ─── */
interface ReviewItem {
  id: string;
  name: string;
  type: string;
  submitter: string;
  reviewer: string;
  status: string;
  submitTime: string;
  description: string;
  sensitivity: string;
  dataScope: string;
}

/* ─── Mock Data ─── */
const initialReviewItems: ReviewItem[] = [
  { id: "REV-001", name: "信用评分模型_v2.1", type: "模型", submitter: "李四", reviewer: "审核员A", status: "pending", submitTime: "2024-04-15 10:00", description: "基于XGBoost的信用评分模型，AUC=0.923", sensitivity: "高", dataScope: "全量客户数据" },
  { id: "REV-002", name: "零售客户画像", type: "分析报告", submitter: "张三", reviewer: "审核员B", status: "approved", submitTime: "2024-04-14 15:30", description: "客户分群分析报告，包含RFM分析", sensitivity: "中", dataScope: "零售业务数据" },
  { id: "REV-003", name: "异常检测模型", type: "模型", submitter: "王五", reviewer: "审核员A", status: "rejected", submitTime: "2024-04-14 09:00", description: "交易异常检测模型，误报率偏高", sensitivity: "高", dataScope: "交易流水数据" },
  { id: "REV-004", name: "供应链预测_v1.0", type: "模型", submitter: "赵六", reviewer: "审核员B", status: "pending", submitTime: "2024-04-15 08:00", description: "需求预测模型，MAPE=12.3%", sensitivity: "低", dataScope: "供应链数据" },
  { id: "REV-005", name: "流失预警模型", type: "模型", submitter: "张三", reviewer: "审核员A", status: "approved", submitTime: "2024-04-13 14:00", description: "用户流失预测模型，召回率0.87", sensitivity: "中", dataScope: "用户行为数据" },
  { id: "REV-006", name: "推荐系统API", type: "API服务", submitter: "李四", reviewer: "审核员B", status: "pending", submitTime: "2024-04-15 11:00", description: "实时推荐API服务，QPS=5000", sensitivity: "中", dataScope: "用户行为数据" },
  { id: "REV-007", name: "销售可视化看板", type: "可视化看板", submitter: "赵六", reviewer: "审核员A", status: "approved", submitTime: "2024-04-14 16:00", description: "销售业绩实时监控看板", sensitivity: "低", dataScope: "销售数据" },
  { id: "REV-008", name: "数据清洗算法包", type: "算法包", submitter: "王五", reviewer: "审核员B", status: "rejected", submitTime: "2024-04-13 10:00", description: "通用数据清洗算法集合", sensitivity: "低", dataScope: "通用" },
  { id: "REV-009", name: "用户画像数据产品", type: "数据产品", submitter: "张三", reviewer: "审核员A", status: "pending", submitTime: "2024-04-15 09:30", description: "标准化用户画像标签产品", sensitivity: "高", dataScope: "全量客户数据" },
  { id: "REV-010", name: "风控规则引擎", type: "模型", submitter: "李四", reviewer: "审核员B", status: "approved", submitTime: "2024-04-12 14:00", description: "实时风控规则引擎，响应时间<50ms", sensitivity: "极高", dataScope: "交易流水数据" },
];

/* ─── Fields ─── */
const reviewFields: FieldConfig[] = [
  { key: "id", label: "审查ID", type: "text", required: true },
  { key: "name", label: "名称", type: "text", required: true },
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "模型", value: "模型" },
    { label: "分析报告", value: "分析报告" },
    { label: "数据产品", value: "数据产品" },
    { label: "API服务", value: "API服务" },
    { label: "可视化看板", value: "可视化看板" },
    { label: "算法包", value: "算法包" },
  ] },
  { key: "submitter", label: "提交人", type: "text", required: true },
  { key: "reviewer", label: "审核人", type: "text", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "待审核", value: "pending" },
    { label: "已通过", value: "approved" },
    { label: "已驳回", value: "rejected" },
    { label: "审核中", value: "reviewing" },
    { label: "已撤销", value: "revoked" },
    { label: "待补充", value: "supplement" },
  ] },
  { key: "submitTime", label: "提交时间", type: "text", required: true },
  { key: "sensitivity", label: "敏感度", type: "select", required: true, options: [
    { label: "极高", value: "极高" },
    { label: "高", value: "高" },
    { label: "中", value: "中" },
    { label: "低", value: "低" },
    { label: "公开", value: "公开" },
    { label: "内部", value: "内部" },
  ] },
  { key: "dataScope", label: "数据范围", type: "text", required: true },
  { key: "description", label: "描述", type: "textarea", required: true },
];

const detailFields = [
  { key: "id", label: "审查ID" },
  { key: "name", label: "名称" },
  { key: "type", label: "类型", type: "badge" as const },
  { key: "submitter", label: "提交人" },
  { key: "reviewer", label: "审核人" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "submitTime", label: "提交时间", type: "date" as const },
  { key: "sensitivity", label: "敏感度", type: "badge" as const },
  { key: "dataScope", label: "数据范围" },
  { key: "description", label: "描述" },
];

export default function SandboxResultReview() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialReviewItems);
  const [search, setSearch] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ReviewItem | null>(null);

  const filtered = reviewItems.filter(r => r.name.includes(search) || r.id.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({ id: "", name: "", type: "模型", submitter: "", reviewer: "", status: "pending", submitTime: "", description: "", sensitivity: "中", dataScope: "" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: ReviewItem) => {
    setDialogMode("edit");
    setDialogData({ ...item });
    setEditingId(item.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (item: ReviewItem) => {
    setDialogMode("delete");
    setEditingId(item.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newItem: ReviewItem = {
        id: data.id,
        name: data.name,
        type: data.type,
        submitter: data.submitter,
        reviewer: data.reviewer,
        status: data.status,
        submitTime: data.submitTime,
        description: data.description,
        sensitivity: data.sensitivity,
        dataScope: data.dataScope,
      };
      setReviewItems(prev => [...prev, newItem]);
    } else if (dialogMode === "edit" && editingId) {
      setReviewItems(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, ...data }
            : item
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setReviewItems(prev => prev.filter(item => item.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (item: ReviewItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleApprove = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    setDetailOpen(false);
  };

  const handleReject = (id: string) => {
    setRejectReason("");
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (detailItem) {
      setReviewItems(prev => prev.map(r => r.id === detailItem.id ? { ...r, status: "rejected" } : r));
    }
    setRejectOpen(false);
    setDetailOpen(false);
  };

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "待审核", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", icon: <Clock className="w-3 h-3" /> },
    approved: { label: "已通过", color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "已驳回", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", icon: <XCircle className="w-3 h-3" /> },
    reviewing: { label: "审核中", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", icon: <Eye className="w-3 h-3" /> },
    revoked: { label: "已撤销", color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800", icon: <AlertTriangle className="w-3 h-3" /> },
    supplement: { label: "待补充", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", icon: <FileText className="w-3 h-3" /> },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="结果审查"
        actions={
          <>
            <Button variant="outline" className="gap-2 dark:border-gray-700 dark:text-gray-300"><Download className="w-4 h-4" />导出</Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate}><Plus className="w-4 h-4" />新建</Button>
          </>
        }
      />

      <PageSearchBar
        value={search}
        onChange={setSearch}
        placeholder="搜索审查项..."
        onReset={() => setSearch("")}
        className="max-w-sm"
      />

      <Card className="dark:bg-[#1e293b] dark:border-gray-700">
        <CardHeader className="pb-3"><CardTitle className="text-base dark:text-gray-100">审查列表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-400">审查ID</TableHead>
                <TableHead className="dark:text-gray-400">名称</TableHead>
                <TableHead className="dark:text-gray-400">类型</TableHead>
                <TableHead className="dark:text-gray-400">提交人</TableHead>
                <TableHead className="dark:text-gray-400">审核人</TableHead>
                <TableHead className="dark:text-gray-400">状态</TableHead>
                <TableHead className="dark:text-gray-400">提交时间</TableHead>
                <TableHead className="dark:text-gray-400">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const s = statusMap[item.status];
                return (
                  <TableRow key={item.id} className="dark:border-gray-700">
                    <TableCell className="font-mono text-xs dark:text-gray-400">{item.id}</TableCell>
                    <TableCell className="font-medium dark:text-gray-200">{item.name}</TableCell>
                    <TableCell><Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{item.type}</Badge></TableCell>
                    <TableCell className="dark:text-gray-300">{item.submitter}</TableCell>
                    <TableCell className="dark:text-gray-300">{item.reviewer}</TableCell>
                    <TableCell><Badge variant="outline" className={`gap-1 ${s.color}`}>{s.icon}{s.label}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">{item.submitTime}</TableCell>
                    <TableCell>
                      <ActionButtons
                        buttons={[
                          { key: "view", icon: <Eye className="w-4 h-4" />, label: "查看", onClick: () => openDetail(item) },
                          { key: "edit", icon: <Pencil className="w-4 h-4" />, label: "编辑", onClick: () => handleEdit(item) },
                          { key: "delete", icon: <Trash className="w-4 h-4" />, label: "删除", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleDelete(item) },
                          ...(item.status === "pending" ? [
                            { key: "approve", icon: <ThumbsUp className="w-4 h-4" />, label: "通过", className: "text-green-600", onClick: () => handleApprove(item.id) },
                            { key: "reject", icon: <ThumbsDown className="w-4 h-4" />, label: "驳回", className: "text-red-600", onClick: () => { setDetailItem(item); handleReject(item.id); } },
                          ] : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`审查详情 - ${detailItem?.name || ""}`}
        data={detailItem || {}}
        fields={detailFields}
        onEdit={detailItem ? () => handleEdit(detailItem) : undefined}
        onDelete={detailItem ? () => handleDelete(detailItem) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${reviewItems.find((r) => r.id === editingId)?.name || "审查项"}` : "审查项"}
        fields={reviewFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm dark:bg-[#1e293b] dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">驳回原因</DialogTitle>
            <DialogDescription className="dark:text-gray-400">请输入驳回理由</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="说明驳回原因..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="dark:border-gray-700 dark:text-gray-300">取消</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
