import { useState } from "react";
import { Search, Plus, Eye, CheckCircle, XCircle, RotateCcw, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import StatusTag from "@/components/StatusTag";
import Modal from "@/components/Modal";
import { DetailDrawer } from "@/components/DetailDrawer";
import { cn } from "@/lib/utils";

interface AuditRecord {
  id: string; taskName: string; ruleName: string; submitter: string;
  submitTime: string; auditor: string; status: "pending" | "approved" | "rejected" | "withdrawn";
  auditTime: string; comment: string; samplingRatio: string; dataVolume: string;
}

const mockAudits: AuditRecord[] = [
  { id: "SA-001", taskName: "用户行为抽样-0415", ruleName: "随机抽样-20%", submitter: "张三", submitTime: "2026-04-21 09:00", auditor: "-", status: "pending", auditTime: "-", comment: "", samplingRatio: "20%", dataVolume: "1.2M" },
  { id: "SA-002", taskName: "订单分层抽样", ruleName: "分层抽样-按地区", submitter: "李四", submitTime: "2026-04-21 08:30", auditor: "王经理", status: "approved", auditTime: "2026-04-21 09:15", comment: "抽样比例合理，同意执行", samplingRatio: "15%", dataVolume: "856K" },
  { id: "SA-003", taskName: "全量系统抽样", ruleName: "系统抽样-间隔100", submitter: "王五", submitTime: "2026-04-20 16:00", auditor: "赵总监", status: "rejected", auditTime: "2026-04-20 17:00", comment: "抽样间隔过大，建议调整为50", samplingRatio: "10%", dataVolume: "2.1M" },
  { id: "SA-004", taskName: "用户画像聚类抽样", ruleName: "聚类抽样-3组", submitter: "赵六", submitTime: "2026-04-20 14:00", auditor: "-", status: "withdrawn", auditTime: "-", comment: "提交人主动撤回", samplingRatio: "25%", dataVolume: "640K" },
  { id: "SA-005", taskName: "交易多阶段抽样", ruleName: "多阶段抽样", submitter: "钱七", submitTime: "2026-04-19 10:00", auditor: "王经理", status: "approved", auditTime: "2026-04-19 11:00", comment: "符合规范，批准执行", samplingRatio: "12%", dataVolume: "3.4M" },
  { id: "SA-006", taskName: "日志条件抽样", ruleName: "条件抽样-ERROR", submitter: "孙八", submitTime: "2026-04-19 09:00", auditor: "赵总监", status: "approved", auditTime: "2026-04-19 09:30", comment: "条件设置合理", samplingRatio: "5%", dataVolume: "120K" },
  { id: "SA-007", taskName: "商品字段抽样", ruleName: "字段抽样-部分", submitter: "周九", submitTime: "2026-04-18 15:00", auditor: "-", status: "pending", auditTime: "-", comment: "", samplingRatio: "30%", dataVolume: "480K" },
  { id: "SA-008", taskName: "用户分层抽样V2", ruleName: "分层抽样-RFM", submitter: "吴十", submitTime: "2026-04-18 11:00", auditor: "王经理", status: "approved", auditTime: "2026-04-18 12:00", comment: "RFM分层合理，批准", samplingRatio: "18%", dataVolume: "920K" },
  { id: "SA-009", taskName: "支付系统抽样", ruleName: "随机抽样-10%", submitter: "郑一", submitTime: "2026-04-17 16:00", auditor: "赵总监", status: "rejected", auditTime: "2026-04-17 17:30", comment: "需补充数据脱敏说明", samplingRatio: "10%", dataVolume: "1.8M" },
  { id: "SA-010", taskName: "物流轨迹抽样", ruleName: "系统抽样-间隔50", submitter: "冯二", submitTime: "2026-04-17 10:00", auditor: "王经理", status: "approved", auditTime: "2026-04-17 11:00", comment: "符合物流数据分析需求", samplingRatio: "8%", dataVolume: "2.6M" },
  { id: "SA-011", taskName: "评价文本抽样", ruleName: "条件抽样-评分<3", submitter: "陈三", submitTime: "2026-04-16 14:00", auditor: "-", status: "pending", auditTime: "-", comment: "", samplingRatio: "15%", dataVolume: "75K" },
  { id: "SA-012", taskName: "广告点击抽样", ruleName: "随机抽样-5%", submitter: "褚四", submitTime: "2026-04-16 09:00", auditor: "赵总监", status: "approved", auditTime: "2026-04-16 10:00", comment: "抽样比例适当", samplingRatio: "5%", dataVolume: "5.2M" },
  { id: "SA-013", taskName: "库存数据抽样", ruleName: "分层抽样-按仓库", submitter: "卫五", submitTime: "2026-04-15 16:00", auditor: "王经理", status: "withdrawn", auditTime: "-", comment: "业务需求变更", samplingRatio: "20%", dataVolume: "340K" },
  { id: "SA-014", taskName: "客服对话抽样", ruleName: "聚类抽样-2组", submitter: "蒋六", submitTime: "2026-04-15 11:00", auditor: "赵总监", status: "approved", auditTime: "2026-04-15 14:00", comment: "用于服务质量分析，批准", samplingRatio: "22%", dataVolume: "180K" },
  { id: "SA-015", taskName: "设备信息抽样", ruleName: "字段抽样-设备ID", submitter: "沈七", submitTime: "2026-04-14 10:00", auditor: "王经理", status: "approved", auditTime: "2026-04-14 11:00", comment: "设备分析需求合理", samplingRatio: "100%", dataVolume: "890K" },
];

export default function SamplingAudit() {
  const [audits, setAudits] = useState<AuditRecord[]>(mockAudits);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<AuditRecord | null>(null);
  const [auditAction, setAuditAction] = useState<"approve" | "reject">("approve");
  const [auditComment, setAuditComment] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailAudit, setDetailAudit] = useState<AuditRecord | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    taskName: "",
    ruleName: "",
    samplingRatio: "",
    dataVolume: "",
    submitter: "",
  });

  const filtered = audits.filter((a) => {
    const ms = a.taskName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || a.status === statusFilter;
    return ms && mf;
  });

  const statusCards = [
    { key: "pending", label: "待审核", count: audits.filter((a) => a.status === "pending").length, color: "bg-amber-50 text-amber-600", icon: Clock },
    { key: "approved", label: "已通过", count: audits.filter((a) => a.status === "approved").length, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
    { key: "rejected", label: "已驳回", count: audits.filter((a) => a.status === "rejected").length, color: "bg-red-50 text-red-600", icon: XCircle },
    { key: "withdrawn", label: "已撤回", count: audits.filter((a) => a.status === "withdrawn").length, color: "bg-slate-50 text-slate-600", icon: RotateCcw },
  ];

  const handleAuditConfirm = () => {
    if (!currentAudit) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setAudits((prev) =>
      prev.map((a) =>
        a.id === currentAudit.id
          ? {
              ...a,
              status: auditAction === "approve" ? "approved" : "rejected",
              auditor: "当前用户",
              auditTime: timeStr,
              comment: auditComment,
            }
          : a
      )
    );
    setShowAuditModal(false);
    setAuditComment("");
    setCurrentAudit(null);
  };

  const handleSubmitAudit = () => {
    if (!submitForm.taskName || !submitForm.ruleName || !submitForm.samplingRatio || !submitForm.dataVolume || !submitForm.submitter) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newId = `SA-${String(audits.length + 1).padStart(3, "0")}`;
    const newAudit: AuditRecord = {
      id: newId,
      taskName: submitForm.taskName,
      ruleName: submitForm.ruleName,
      submitter: submitForm.submitter,
      submitTime: timeStr,
      auditor: "-",
      status: "pending",
      auditTime: "-",
      comment: "",
      samplingRatio: submitForm.samplingRatio,
      dataVolume: submitForm.dataVolume,
    };
    setAudits((prev) => [newAudit, ...prev]);
    setShowSubmitModal(false);
    setSubmitForm({ taskName: "", ruleName: "", samplingRatio: "", dataVolume: "", submitter: "" });
  };

  const columns = [
    { key: "id", title: "审核ID", cell: (a: AuditRecord) => <span className="font-mono text-xs text-slate-500">{a.id}</span> },
    { key: "task", title: "抽样任务", cell: (a: AuditRecord) => <span className="font-medium text-slate-800">{a.taskName}</span> },
    { key: "rule", title: "规则", cell: (a: AuditRecord) => <Badge variant="outline" className="text-xs">{a.ruleName}</Badge> },
    { key: "submitter", title: "提交人", cell: (a: AuditRecord) => <span className="text-xs text-slate-500">{a.submitter}</span> },
    { key: "status", title: "审核状态", cell: (a: AuditRecord) => <StatusTag status={a.status === "pending" ? "warning" : a.status === "approved" ? "success" : a.status === "rejected" ? "danger" : "info"} text={a.status === "pending" ? "待审核" : a.status === "approved" ? "已通过" : a.status === "rejected" ? "已驳回" : "已撤回"} /> },
    { key: "auditor", title: "审核人", cell: (a: AuditRecord) => <span className="text-xs text-slate-500">{a.auditor}</span> },
    { key: "time", title: "提交时间", cell: (a: AuditRecord) => <span className="text-xs text-slate-500">{a.submitTime}</span> },
    { key: "actions", title: "操作", cell: (a: AuditRecord) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setDetailAudit(a); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"><Eye className="w-3.5 h-3.5" /></button>
        {a.status === "pending" && <button onClick={() => { setCurrentAudit(a); setShowAuditModal(true); setAuditAction("approve"); setAuditComment(""); }} className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500"><Check className="w-3.5 h-3.5" /></button>}
        {a.status === "pending" && <button onClick={() => { setCurrentAudit(a); setShowAuditModal(true); setAuditAction("reject"); setAuditComment(""); }} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><X className="w-3.5 h-3.5" /></button>}
      </div>
    )},
  ];

  const detailFields = [
    { key: "id", label: "审核ID" },
    { key: "taskName", label: "抽样任务" },
    { key: "ruleName", label: "规则", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "submitter", label: "提交人" },
    { key: "submitTime", label: "提交时间", type: "date" as const },
    { key: "auditor", label: "审核人" },
    { key: "auditTime", label: "审核时间", type: "date" as const },
    { key: "samplingRatio", label: "抽样比例", type: "badge" as const },
    { key: "dataVolume", label: "数据量", type: "badge" as const },
    { key: "comment", label: "审核意见" },
  ];

  const detailData = detailAudit
    ? {
        ...detailAudit,
        status:
          detailAudit.status === "pending"
            ? "待审核"
            : detailAudit.status === "approved"
            ? "已通过"
            : detailAudit.status === "rejected"
            ? "已驳回"
            : "已撤回",
      }
    : {};

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {statusCards.map((s) => (
          <div key={s.key} className={cn("rounded-xl p-5 border", s.color.split(" ")[0].replace("bg-","border-").replace("50","200"))}>
            <div className="flex items-center justify-between"><span className={cn("text-sm", s.color.split(" ")[1])}>{s.label}</span><s.icon className={cn("w-5 h-5", s.color.split(" ")[1])} /></div>
            <div className={cn("text-2xl font-bold mt-2", s.color.split(" ")[1])}>{s.count}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索审核ID或任务名" className="pl-9 w-64" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600"><option value="all">全部状态</option><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已驳回</option><option value="withdrawn">已撤回</option></select>
        </div>
        <Button className="gap-2" onClick={() => setShowSubmitModal(true)}><Plus className="w-4 h-4" />提交审核</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><DataTable rowKey={(r: any) => r.id} columns={columns} data={filtered} /></div>

      <Modal open={showAuditModal} onClose={() => setShowAuditModal(false)} title={auditAction === "approve" ? "审核通过" : "审核驳回"}>
        {currentAudit && <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-500">抽样任务</div><div className="text-sm font-medium text-slate-800">{currentAudit.taskName}</div></div>
          <div><label className="text-sm font-medium text-slate-700">审核意见</label><textarea value={auditComment} onChange={(e) => setAuditComment(e.target.value)} placeholder={auditAction === "approve" ? "输入通过理由（可选）" : "输入驳回原因（必填）"} className="mt-1 w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowAuditModal(false)}>取消</Button><Button onClick={handleAuditConfirm} className={auditAction === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}>{auditAction === "approve" ? "通过" : "驳回"}</Button></div>
        </div>}
      </Modal>

      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="提交审核">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">抽样任务</label>
            <Input value={submitForm.taskName} onChange={(e) => setSubmitForm((p) => ({ ...p, taskName: e.target.value }))} placeholder="输入任务名称" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">规则</label>
            <Input value={submitForm.ruleName} onChange={(e) => setSubmitForm((p) => ({ ...p, ruleName: e.target.value }))} placeholder="输入规则名称" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">抽样比例</label>
              <Input value={submitForm.samplingRatio} onChange={(e) => setSubmitForm((p) => ({ ...p, samplingRatio: e.target.value }))} placeholder="如 20%" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">数据量</label>
              <Input value={submitForm.dataVolume} onChange={(e) => setSubmitForm((p) => ({ ...p, dataVolume: e.target.value }))} placeholder="如 1.2M" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">提交人</label>
            <Input value={submitForm.submitter} onChange={(e) => setSubmitForm((p) => ({ ...p, submitter: e.target.value }))} placeholder="输入提交人姓名" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>取消</Button>
            <Button onClick={handleSubmitAudit}>提交</Button>
          </div>
        </div>
      </Modal>

      <DetailDrawer
        open={showDetail}
        onOpenChange={setShowDetail}
        title="审核详情"
        data={detailData || {}}
        fields={detailFields}
      />
    </div>
  );
}
