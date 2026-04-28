import { useState } from "react";
import {
  Globe, Search, ArrowLeftRight, CheckCircle2, XCircle, Clock,
  ChevronRight, Plus, Eye, Pencil, Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface CrossTx {
  id: string;
  type: string;
  sourceChain: string;
  targetChain: string;
  asset: string;
  amount: string;
  status: string;
  sourceTx: string;
  targetTx: string;
  time: string;
  relayer: string;
}

/* ─── Mock Cross-Chain Transactions ─── */
const initialCrossTxData: CrossTx[] = [
  { id: "CTX-001", type: "资产转移", sourceChain: "金融联盟链", targetChain: "政务数据链", asset: "数据凭证#8923", amount: "1", status: "completed", sourceTx: "0xabc1...def2", targetTx: "0xghi3...jkl4", time: "2025-04-22 10:00:00", relayer: "中继节点-01" },
  { id: "CTX-002", type: "数据同步", sourceChain: "医疗数据链", targetChain: "存证公证链", asset: "医疗记录#4521", amount: "-", status: "completed", sourceTx: "0xdef5...ghi6", targetTx: "0xjkl7...mno8", time: "2025-04-22 10:05:00", relayer: "中继节点-02" },
  { id: "CTX-003", type: "资产转移", sourceChain: "供应链金融链", targetChain: "金融联盟链", asset: "应收账款#1203", amount: "50000", status: "pending", sourceTx: "0xghi9...jkl0", targetTx: "-", time: "2025-04-22 10:10:00", relayer: "中继节点-03" },
  { id: "CTX-004", type: "消息传递", sourceChain: "政务数据链", targetChain: "医疗数据链", asset: "授权消息#3321", amount: "-", status: "failed", sourceTx: "0xjkl1...mno2", targetTx: "-", time: "2025-04-22 10:15:00", relayer: "中继节点-01" },
  { id: "CTX-005", type: "资产转移", sourceChain: "存证公证链", targetChain: "金融联盟链", asset: "存证凭证#6678", amount: "1", status: "completed", sourceTx: "0xmno3...pqr4", targetTx: "0xstu5...vwx6", time: "2025-04-22 10:20:00", relayer: "中继节点-02" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    completed: { text: "已完成", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending: { text: "进行中", class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    failed: { text: "失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.pending;
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

/* ─── Fields ─── */
const crossTxFields: FieldConfig[] = [
  { key: "type", label: "类型", type: "select", required: true, options: [
    { label: "资产转移", value: "资产转移" },
    { label: "数据同步", value: "数据同步" },
    { label: "消息传递", value: "消息传递" },
  ]},
  { key: "sourceChain", label: "源链", type: "text", required: true },
  { key: "targetChain", label: "目标链", type: "text", required: true },
  { key: "asset", label: "资产", type: "text", required: true },
  { key: "amount", label: "数量", type: "text", required: false, placeholder: "无数量填 -" },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "已完成", value: "completed" },
    { label: "进行中", value: "pending" },
    { label: "失败", value: "failed" },
  ]},
  { key: "sourceTx", label: "源链交易", type: "text", required: true },
  { key: "targetTx", label: "目标链交易", type: "text", required: false, placeholder: "无交易填 -" },
  { key: "time", label: "时间", type: "text", required: true },
  { key: "relayer", label: "中继节点", type: "text", required: true },
];

const detailFields = [
  { key: "id", label: "交易ID" },
  { key: "type", label: "类型", type: "badge" as const },
  { key: "sourceChain", label: "源链" },
  { key: "targetChain", label: "目标链" },
  { key: "asset", label: "资产" },
  { key: "amount", label: "数量" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "sourceTx", label: "源链交易" },
  { key: "targetTx", label: "目标链交易" },
  { key: "time", label: "时间", type: "date" as const },
  { key: "relayer", label: "中继节点" },
];

function generateId(txs: CrossTx[]): string {
  const maxNum = txs.reduce((max, tx) => {
    const match = tx.id.match(/CTX-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `CTX-${String(maxNum + 1).padStart(3, "0")}`;
}

export default function CrossChainExplorer() {
  const [crossTxs, setCrossTxs] = useState<CrossTx[]>(initialCrossTxData);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<CrossTx | null>(null);

  const filtered = crossTxs.filter(t => t.id.includes(search) || t.asset.includes(search));

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      type: "资产转移",
      sourceChain: "",
      targetChain: "",
      asset: "",
      amount: "",
      status: "pending",
      sourceTx: "",
      targetTx: "",
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      relayer: "",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (tx: CrossTx) => {
    setDialogMode("edit");
    setDialogData({
      type: tx.type,
      sourceChain: tx.sourceChain,
      targetChain: tx.targetChain,
      asset: tx.asset,
      amount: tx.amount,
      status: tx.status,
      sourceTx: tx.sourceTx,
      targetTx: tx.targetTx,
      time: tx.time,
      relayer: tx.relayer,
    });
    setEditingId(tx.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (tx: CrossTx) => {
    setDialogMode("delete");
    setEditingId(tx.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const id = generateId(crossTxs);
      const newTx: CrossTx = {
        id,
        type: data.type,
        sourceChain: data.sourceChain,
        targetChain: data.targetChain,
        asset: data.asset,
        amount: data.amount || "-",
        status: data.status,
        sourceTx: data.sourceTx,
        targetTx: data.targetTx || "-",
        time: data.time,
        relayer: data.relayer,
      };
      setCrossTxs((prev) => [...prev, newTx]);
    } else if (dialogMode === "edit" && editingId) {
      setCrossTxs((prev) =>
        prev.map((tx) =>
          tx.id === editingId
            ? {
                ...tx,
                type: data.type,
                sourceChain: data.sourceChain,
                targetChain: data.targetChain,
                asset: data.asset,
                amount: data.amount || "-",
                status: data.status,
                sourceTx: data.sourceTx,
                targetTx: data.targetTx || "-",
                time: data.time,
                relayer: data.relayer,
              }
            : tx
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setCrossTxs((prev) => prev.filter((tx) => tx.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (tx: CrossTx) => {
    setDetailTx(tx);
    setDetailOpen(true);
  };

  const detailData = detailTx
    ? {
        ...detailTx,
        status:
          detailTx.status === "completed"
            ? "已完成"
            : detailTx.status === "pending"
            ? "进行中"
            : "失败",
      }
    : {};

  return (
    <div className="p-6 space-y-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">跨链浏览器</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">浏览跨链交易记录，追踪资产跨链流转全生命周期</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 新增交易
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "跨链交易", value: crossTxs.length, icon: <ArrowLeftRight className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已完成", value: crossTxs.filter(t => t.status === "completed").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "进行中", value: crossTxs.filter(t => t.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "失败", value: crossTxs.filter(t => t.status === "failed").length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="搜索跨链交易ID/资产" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["交易ID", "类型", "源链", "目标链", "资产", "状态", "源链交易", "目标链交易", "时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.id}</td>
                <td className="px-4 py-3"><Badge variant="outline">{tx.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.sourceChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.targetChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.asset}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.sourceTx}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.targetTx}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.time}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(tx)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(tx)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(tx)}><Trash className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`跨链交易详情 - ${detailTx?.id || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailTx ? () => handleEdit(detailTx) : undefined}
        onDelete={detailTx ? () => handleDelete(detailTx) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${crossTxs.find((t) => t.id === editingId)?.id || "交易"}` : "跨链交易"}
        fields={crossTxFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
