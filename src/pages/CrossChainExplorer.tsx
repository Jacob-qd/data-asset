import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe, Search, ArrowLeftRight, CheckCircle2, XCircle, Clock,
  ChevronRight, Plus, Eye, Pencil, Trash, ShieldCheck, RotateCcw,
  Upload, FileSpreadsheet, AlertTriangle, PlayCircle, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  stage: "source_confirmed" | "relayer_processing" | "target_confirmed";
  timeoutAt: string;
  overdue: boolean;
  spvProof?: string;
}

interface RelayerPerf {
  id: string;
  name: string;
  txCount: number;
  successRate: number;
  avgSpeed: string;
  rank: number;
}

interface BatchJob {
  id: string;
  filename: string;
  total: number;
  completed: number;
  failed: number;
  status: "running" | "completed" | "failed";
  progress: number;
}

/* ─── Mock Cross-Chain Transactions ─── */
const initialCrossTxData: CrossTx[] = [
  { id: "CTX-001", type: "资产转移", sourceChain: "金融联盟链", targetChain: "政务数据链", asset: "数据凭证#8923", amount: "1", status: "completed", sourceTx: "0xabc1...def2", targetTx: "0xghi3...jkl4", time: "2025-04-22 10:00:00", relayer: "中继节点-01", stage: "target_confirmed", timeoutAt: "2025-04-22 10:10:00", overdue: false, spvProof: "0x7a3f...e9d2" },
  { id: "CTX-002", type: "数据同步", sourceChain: "医疗数据链", targetChain: "存证公证链", asset: "医疗记录#4521", amount: "-", status: "completed", sourceTx: "0xdef5...ghi6", targetTx: "0xjkl7...mno8", time: "2025-04-22 10:05:00", relayer: "中继节点-02", stage: "target_confirmed", timeoutAt: "2025-04-22 10:15:00", overdue: false, spvProof: "0x2b8c...f1a5" },
  { id: "CTX-003", type: "资产转移", sourceChain: "供应链金融链", targetChain: "金融联盟链", asset: "应收账款#1203", amount: "50000", status: "pending", sourceTx: "0xghi9...jkl0", targetTx: "-", time: "2025-04-22 10:10:00", relayer: "中继节点-03", stage: "relayer_processing", timeoutAt: "2025-04-22 10:20:00", overdue: false },
  { id: "CTX-004", type: "消息传递", sourceChain: "政务数据链", targetChain: "医疗数据链", asset: "授权消息#3321", amount: "-", status: "failed", sourceTx: "0xjkl1...mno2", targetTx: "-", time: "2025-04-22 10:15:00", relayer: "中继节点-01", stage: "source_confirmed", timeoutAt: "2025-04-22 10:25:00", overdue: true },
  { id: "CTX-005", type: "资产转移", sourceChain: "存证公证链", targetChain: "金融联盟链", asset: "存证凭证#6678", amount: "1", status: "completed", sourceTx: "0xmno3...pqr4", targetTx: "0xstu5...vwx6", time: "2025-04-22 10:20:00", relayer: "中继节点-02", stage: "target_confirmed", timeoutAt: "2025-04-22 10:30:00", overdue: false, spvProof: "0x9d4e...c2b1" },
];

const initialRelayerPerf: RelayerPerf[] = [
  { id: "RP-01", name: "中继节点-01", txCount: 4520, successRate: 99.8, avgSpeed: "1.2s", rank: 1 },
  { id: "RP-02", name: "中继节点-02", txCount: 3890, successRate: 99.5, avgSpeed: "1.5s", rank: 2 },
  { id: "RP-03", name: "中继节点-03", txCount: 2100, successRate: 98.2, avgSpeed: "2.1s", rank: 3 },
  { id: "RP-04", name: "中继节点-04", txCount: 1200, successRate: 97.5, avgSpeed: "2.8s", rank: 4 },
];

const initialBatches: BatchJob[] = [
  { id: "BJ-001", filename: "batch_transfer_0422.csv", total: 100, completed: 78, failed: 2, status: "running", progress: 78 },
  { id: "BJ-002", filename: "sync_data_0421.csv", total: 50, completed: 50, failed: 0, status: "completed", progress: 100 },
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

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    source_confirmed: "源链已确认",
    relayer_processing: "中继处理中",
    target_confirmed: "目标链已确认",
  };
  return <Badge variant="outline" className="text-xs">{map[stage] || stage}</Badge>;
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

function generateId() {
  return Date.now().toString(36).toUpperCase();
}

export default function CrossChainExplorer() {
  const [crossTxs, setCrossTxs] = useState<CrossTx[]>(initialCrossTxData);
  const [search, setSearch] = useState("");
  const [relayerPerf] = useState<RelayerPerf[]>(initialRelayerPerf);
  const [batches, setBatches] = useState<BatchJob[]>(initialBatches);
  const [autoRetry, setAutoRetry] = useState(true);
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [selectedRetryTx, setSelectedRetryTx] = useState<CrossTx | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [selectedProofTx, setSelectedProofTx] = useState<CrossTx | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying" | "verified" | "failed">("idle");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<CrossTx | null>(null);

  const filtered = crossTxs.filter(t => t.id.includes(search) || t.asset.includes(search));

  // Real-time status updates every 5s
  const refreshStatus = useCallback(() => {
    setCrossTxs(prev => prev.map(tx => {
      if (tx.status === "completed" || tx.status === "failed") return tx;
      const stages: ("source_confirmed" | "relayer_processing" | "target_confirmed")[] = ["source_confirmed", "relayer_processing", "target_confirmed"];
      const currentIdx = stages.indexOf(tx.stage);
      const now = new Date();
      const timeout = new Date(tx.timeoutAt);
      const isOverdue = now > timeout;

      if (isOverdue && !tx.overdue) {
        if (autoRetry && tx.status === "pending") {
          return { ...tx, overdue: true, stage: "source_confirmed" };
        }
        return { ...tx, overdue: true, status: "failed" as const };
      }

      if (tx.status === "pending" && Math.random() > 0.6 && currentIdx < stages.length - 1) {
        const nextStage = stages[currentIdx + 1];
        return { ...tx, stage: nextStage, status: nextStage === "target_confirmed" ? "completed" as const : tx.status };
      }
      return tx;
    }));
  }, [autoRetry]);

  useEffect(() => {
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  // Batch progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatches(prev => prev.map(b => {
        if (b.status !== "running") return b;
        if (b.progress >= 100) return { ...b, status: "completed" as const, progress: 100 };
        const next = Math.min(100, b.progress + Math.floor(Math.random() * 5) + 1);
        const completed = Math.floor((next / 100) * b.total);
        return { ...b, progress: next, completed };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      const id = `CTX-${generateId()}`;
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
        stage: data.status === "completed" ? "target_confirmed" : data.status === "failed" ? "source_confirmed" : "source_confirmed",
        timeoutAt: new Date(Date.now() + 10 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19),
        overdue: false,
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

  const handleRetry = (tx: CrossTx) => {
    setSelectedRetryTx(tx);
    setRetryDialogOpen(true);
  };

  const confirmRetry = () => {
    if (selectedRetryTx) {
      setCrossTxs(prev => prev.map(tx => tx.id === selectedRetryTx.id ? {
        ...tx,
        status: "pending",
        stage: "source_confirmed",
        overdue: false,
        timeoutAt: new Date(Date.now() + 10 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19),
      } : tx));
    }
    setRetryDialogOpen(false);
  };

  const openProof = (tx: CrossTx) => {
    setSelectedProofTx(tx);
    setVerifyStatus("idle");
    setProofDialogOpen(true);
  };

  const handleVerifyProof = () => {
    setVerifyStatus("verifying");
    setTimeout(() => {
      setVerifyStatus(Math.random() > 0.1 ? "verified" : "failed");
    }, 1500);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      const newBatch: BatchJob = {
        id: `BJ-${generateId()}`,
        filename: file.name,
        total: Math.floor(Math.random() * 200) + 50,
        completed: 0,
        failed: 0,
        status: "running",
        progress: 0,
      };
      setBatches(prev => [...prev, newBatch]);
      setBatchDialogOpen(false);
    }
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setBatchDialogOpen(true)}>
            <Upload className="w-4 h-4" /> 批量跨链
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
            <Plus className="w-4 h-4" /> 新增交易
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "跨链交易", value: crossTxs.length, icon: <ArrowLeftRight className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "已完成", value: crossTxs.filter(t => t.status === "completed").length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "进行中", value: crossTxs.filter(t => t.status === "pending").length, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "失败/超时", value: crossTxs.filter(t => t.status === "failed" || t.overdue).length, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-4 border border-slate-200 dark:border-slate-700", s.color)}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <Card className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 中继节点性能排名</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排名</TableHead>
                <TableHead>节点</TableHead>
                <TableHead>处理笔数</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>平均速度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relayerPerf.map(rp => (
                <TableRow key={rp.id}>
                  <TableCell>
                    {rp.rank === 1 ? <Badge className="bg-amber-100 text-amber-700">#1</Badge> : rp.rank === 2 ? <Badge className="bg-slate-100 text-slate-600">#2</Badge> : <span className="text-xs text-slate-500">#{rp.rank}</span>}
                  </TableCell>
                  <TableCell className="font-medium">{rp.name}</TableCell>
                  <TableCell>{rp.txCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rp.successRate}%` }} />
                      </div>
                      <span className="text-xs">{rp.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{rp.avgSpeed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> 批量任务进度
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">自动重试</span>
              <Button variant={autoRetry ? "default" : "outline"} size="sm" className={autoRetry ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={() => setAutoRetry(!autoRetry)}>
                {autoRetry ? "已开启" : "已关闭"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务ID</TableHead>
                <TableHead>文件名</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>完成/失败</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.filename}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", b.status === "completed" ? "bg-emerald-500" : b.status === "failed" ? "bg-red-500" : "bg-blue-500")} style={{ width: `${b.progress}%` }} />
                      </div>
                      <span className="text-xs">{b.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{b.completed} / {b.failed}</TableCell>
                  <TableCell>
                    {b.status === "completed" && <Badge className="bg-emerald-100 text-emerald-700">已完成</Badge>}
                    {b.status === "running" && <Badge className="bg-blue-100 text-blue-700">进行中</Badge>}
                    {b.status === "failed" && <Badge className="bg-red-100 text-red-700">失败</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="搜索跨链交易ID/资产" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1e293b]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-[#273548]">
            <tr>
              {["交易ID", "类型", "源链", "目标链", "资产", "状态", "阶段", "源链交易", "目标链交易", "时间", "操作"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className={cn("border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#273548]/50", tx.overdue && "bg-red-50/50")}>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {tx.id}
                  {tx.overdue && <AlertTriangle className="inline w-3 h-3 text-red-500 ml-1" />}
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{tx.type}</Badge></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.sourceChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.targetChain}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.asset}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="px-4 py-3"><StageBadge stage={tx.stage} /></td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.sourceTx}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{tx.targetTx}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{tx.time}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(tx)}><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(tx)}><Pencil className="w-4 h-4" /></Button>
                    {tx.status === "failed" && (
                      <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700" onClick={() => handleRetry(tx)} title="重试">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    {tx.spvProof && (
                      <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700" onClick={() => openProof(tx)} title="SPV证明">
                        <ShieldCheck className="w-4 h-4" />
                      </Button>
                    )}
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

      {/* Retry Dialog */}
      <Dialog open={retryDialogOpen} onOpenChange={setRetryDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>重试跨链交易</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 py-2">确认重新提交交易 <strong>{selectedRetryTx?.id}</strong>？这将重置超时计时器并重新发起跨链流程。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetryDialogOpen(false)}>取消</Button>
            <Button onClick={confirmRetry}><RotateCcw className="w-4 h-4 mr-1" />确认重试</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SPV Proof Dialog */}
      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> SPV 跨链证明</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs break-all text-slate-700 border border-slate-200">
              {selectedProofTx?.spvProof || "无证明数据"}
            </div>
            <div className="text-sm text-slate-600">
              交易: {selectedProofTx?.id}<br/>
              源链: {selectedProofTx?.sourceChain} → 目标链: {selectedProofTx?.targetChain}
            </div>
            {verifyStatus === "verified" && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> 验证通过</div>
            )}
            {verifyStatus === "failed" && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium"><XCircle className="w-4 h-4" /> 验证失败</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofDialogOpen(false)}>关闭</Button>
            <Button onClick={handleVerifyProof} disabled={verifyStatus === "verifying"}>
              {verifyStatus === "verifying" ? "验证中..." : "验证证明"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Upload Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> 批量跨链</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
              onClick={handleFileUpload}
            >
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">点击上传 CSV 文件</p>
              <p className="text-xs text-slate-500 mt-1">支持格式: sourceChain,targetChain,asset,amount</p>
              {uploadedFile && <p className="text-xs text-emerald-600 mt-2">已选择: {uploadedFile}</p>}
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBatchDialogOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
