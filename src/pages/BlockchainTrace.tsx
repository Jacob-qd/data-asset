import { useState } from "react";
import {
  Search,
  Link2,
  ArrowRight,
  FileText,
  User,
  Calendar,
  Fingerprint,
  CheckCircle2,
  Circle,
  ChevronRight,
  ShieldCheck,
  Database,
  Share2,
  Lock,
  Clock,
  Plus,
  Eye,
  Pencil,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface TraceNode {
  stage: string;
  actor: string;
  time: string;
  action: string;
  txHash: string;
  status: string;
  detail: string;
}

interface TraceChain {
  assetId: string;
  assetName: string;
  currentHolder: string;
  traceCount: number;
  nodes: TraceNode[];
}

/* ─── Mock Trace Data ─── */
const initialTraceChains: TraceChain[] = [
  {
    assetId: "DA-2025-001",
    assetName: "企业信用评价数据集",
    currentHolder: "金融风控中心",
    traceCount: 6,
    nodes: [
      { stage: "数据生成", actor: "数据采集团", time: "2025-01-15 09:00:00", action: "原始数据采集", txHash: "0x1a2b...3c4d", status: "completed", detail: "从企业信用信息公示系统采集原始数据" },
      { stage: "质量审核", actor: "数据治理组", time: "2025-01-16 14:30:00", action: "数据质量审核", txHash: "0x2b3c...4d5e", status: "completed", detail: "通过数据质量检测，准确率99.2%" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-01-17 10:15:00", action: "上链存证登记", txHash: "0x3c4d...5e6f", status: "completed", detail: "完成数据资产上链存证，分配DID标识" },
      { stage: "授权共享", actor: "授权中心", time: "2025-02-01 16:45:00", action: "授权金融风控中心使用", txHash: "0x4d5e...6f7a", status: "completed", detail: "签订数据使用协议，授权期限1年" },
      { stage: "数据使用", actor: "金融风控中心", time: "2025-02-10 08:20:00", action: "数据查询调用", txHash: "0x5e6f...7a8b", status: "completed", detail: "调用数据用于风控模型训练" },
      { stage: "结果反馈", actor: "金融风控中心", time: "2025-04-22 14:32:00", action: "使用结果上报", txHash: "0x6f7a...8b9c", status: "completed", detail: "上报数据使用效果和反馈评价" },
    ],
  },
  {
    assetId: "DA-2025-002",
    assetName: "交通流量数据",
    currentHolder: "智慧交通中心",
    traceCount: 4,
    nodes: [
      { stage: "数据生成", actor: "交通监测组", time: "2025-03-01 00:00:00", action: "传感器数据采集", txHash: "0x7a8b...9c0d", status: "completed", detail: "全市交通传感器实时数据采集" },
      { stage: "数据清洗", actor: "数据处理组", time: "2025-03-01 06:00:00", action: "数据清洗加工", txHash: "0x8b9c...0d1e", status: "completed", detail: "完成数据清洗和格式标准化" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-03-02 09:30:00", action: "上链存证登记", txHash: "0x9c0d...1e2f", status: "completed", detail: "完成数据资产上链存证" },
      { stage: "开放共享", actor: "智慧交通中心", time: "2025-03-05 10:00:00", action: "数据授权开放", txHash: "0x0d1e...2f3a", status: "completed", detail: "授权5家研究机构使用" },
    ],
  },
  {
    assetId: "DA-2025-003",
    assetName: "医疗健康档案",
    currentHolder: "医疗数据中心",
    traceCount: 5,
    nodes: [
      { stage: "数据生成", actor: "医疗机构", time: "2025-02-10 08:00:00", action: "诊疗数据采集", txHash: "0x1e2f...3a4b", status: "completed", detail: "各医疗机构诊疗数据汇总" },
      { stage: "脱敏处理", actor: "隐私计算组", time: "2025-02-11 14:00:00", action: "数据脱敏处理", txHash: "0x2f3a...4b5c", status: "completed", detail: "对个人敏感信息进行脱敏" },
      { stage: "资产登记", actor: "资产管理员", time: "2025-02-12 09:00:00", action: "上链存证登记", txHash: "0x3a4b...5c6d", status: "completed", detail: "完成数据资产上链存证" },
      { stage: "授权使用", actor: "授权中心", time: "2025-03-01 11:00:00", action: "授权科研使用", txHash: "0x4b5c...6d7e", status: "completed", detail: "授权医学研究院进行科研分析" },
      { stage: "流转跟踪", actor: "医学研究院", time: "2025-04-20 16:30:00", action: "数据流转记录", txHash: "0x5c6d...7e8f", status: "completed", detail: "数据流转使用记录上链" },
    ],
  },
];

/* ─── Fields ─── */
const traceFields: FieldConfig[] = [
  { key: "assetName", label: "资产名称", type: "text", required: true },
  { key: "currentHolder", label: "当前持有方", type: "text", required: true },
  { key: "traceCount", label: "溯源节点数", type: "number", required: true },
  { key: "nodes", label: "溯源节点 (JSON)", type: "textarea", required: true, placeholder: '[{"stage":"...","actor":"...","time":"...","action":"...","txHash":"...","status":"completed","detail":"..."}]' },
];

const detailFields = [
  { key: "assetId", label: "资产编号" },
  { key: "assetName", label: "资产名称" },
  { key: "currentHolder", label: "当前持有方" },
  { key: "traceCount", label: "溯源节点数" },
];

function generateAssetId(chains: TraceChain[]): string {
  const maxNum = chains.reduce((max, ch) => {
    const match = ch.assetId.match(/DA-2025-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `DA-2025-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Trace Timeline ─── */
function TraceTimeline({ nodes, expanded }: { nodes: TraceNode[]; expanded: boolean }) {
  const displayNodes = expanded ? nodes : nodes.slice(0, 3);

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-[#334155]" />

      <div className="space-y-0">
        {displayNodes.map((node, i) => (
          <div key={i} className="relative pb-6 last:pb-0">
            {/* Dot */}
            <div className={cn(
              "absolute left-[-17px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10",
              node.status === "completed"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-slate-300 bg-white dark:bg-[#1E293B]"
            )}>
              {node.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <Circle className="w-3 h-3 text-slate-400" />
              )}
            </div>

            <div className={cn(
              "rounded-lg border p-4 transition-all",
              "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155]"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {node.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {node.action}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{node.txHash}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {node.detail}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {node.actor}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {node.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainTrace() {
  const [traceChains, setTraceChains] = useState<TraceChain[]>(initialTraceChains);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("DA-2025-001");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailChain, setDetailChain] = useState<TraceChain | null>(null);

  const filtered = traceChains.filter(
    (c) =>
      c.assetName.includes(search) ||
      c.assetId.includes(search)
  );

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      assetName: "",
      currentHolder: "",
      traceCount: 1,
      nodes: JSON.stringify([
        {
          stage: "数据生成",
          actor: "",
          time: new Date().toISOString().replace("T", " ").slice(0, 19),
          action: "原始数据采集",
          txHash: "0x...",
          status: "completed",
          detail: "",
        },
      ], null, 2),
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (chain: TraceChain) => {
    setDialogMode("edit");
    setDialogData({
      assetName: chain.assetName,
      currentHolder: chain.currentHolder,
      traceCount: chain.traceCount,
      nodes: JSON.stringify(chain.nodes, null, 2),
    });
    setEditingId(chain.assetId);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (chain: TraceChain) => {
    setDialogMode("delete");
    setEditingId(chain.assetId);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    let parsedNodes: TraceNode[] = [];
    try {
      parsedNodes = JSON.parse(data.nodes || "[]");
    } catch {
      parsedNodes = [];
    }

    if (dialogMode === "create") {
      const assetId = generateAssetId(traceChains);
      const newChain: TraceChain = {
        assetId,
        assetName: data.assetName,
        currentHolder: data.currentHolder,
        traceCount: Number(data.traceCount),
        nodes: parsedNodes,
      };
      setTraceChains((prev) => [...prev, newChain]);
    } else if (dialogMode === "edit" && editingId) {
      setTraceChains((prev) =>
        prev.map((chain) =>
          chain.assetId === editingId
            ? {
                ...chain,
                assetName: data.assetName,
                currentHolder: data.currentHolder,
                traceCount: Number(data.traceCount),
                nodes: parsedNodes,
              }
            : chain
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setTraceChains((prev) => prev.filter((chain) => chain.assetId !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (chain: TraceChain) => {
    setDetailChain(chain);
    setDetailOpen(true);
  };

  const detailData = detailChain
    ? {
        assetId: detailChain.assetId,
        assetName: detailChain.assetName,
        currentHolder: detailChain.currentHolder,
        traceCount: detailChain.traceCount,
      }
    : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">溯源追踪</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            基于区块链的数据资产全生命周期溯源查询
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" /> 创建溯源
        </Button>
      </div>

      {/* Search */}
      <div className={cn(
        "rounded-xl border p-4",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="输入资产编号或资产名称查询溯源..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm",
              "bg-white border-slate-200 text-slate-800",
              "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            )}
          />
        </div>
      </div>

      {/* Trace Cards */}
      <div className="space-y-4">
        {filtered.map((chain) => (
          <div
            key={chain.assetId}
            className={cn(
              "rounded-xl border overflow-hidden",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
            {/* Card Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
              onClick={() => setExpandedId(expandedId === chain.assetId ? null : chain.assetId)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {chain.assetName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 dark:bg-[#334155] dark:text-slate-400 font-mono">
                      {chain.assetId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      当前持有: {chain.currentHolder}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {chain.traceCount} 个溯源节点
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => openDetail(chain)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(chain)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(chain)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-slate-400 transition-transform",
                  expandedId === chain.assetId && "rotate-90"
                )} />
              </div>
            </div>

            {/* Expanded Timeline */}
            {expandedId === chain.assetId && (
              <div className="px-4 pb-5 border-t border-slate-100 dark:border-[#334155]">
                {/* Legend */}
                <div className="flex items-center gap-4 py-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-50" />
                    已完成
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50" />
                    进行中
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-blue-500" />
                    数据上链
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-violet-500" />
                    流转授权
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-500" />
                    安全存证
                  </span>
                </div>

                <TraceTimeline
                  nodes={chain.nodes}
                  expanded={true}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">未找到匹配的溯源记录</p>
          <p className="text-xs text-slate-400 mt-1">请检查输入的资产编号或名称</p>
        </div>
      )}

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`溯源详情 - ${detailChain?.assetName || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailChain ? () => handleEdit(detailChain) : undefined}
        onDelete={detailChain ? () => handleDelete(detailChain) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${traceChains.find((c) => c.assetId === editingId)?.assetName || "溯源记录"}` : "溯源记录"}
        fields={traceFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
