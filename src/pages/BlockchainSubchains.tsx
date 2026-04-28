import { useState } from "react";
import {
  Network,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Trash2,
  ChevronRight,
  Server,
  Users,
  Blocks,
  Settings,
  X,
  Layers,
  Eye,
  Pencil,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface Subchain {
  id: string;
  name: string;
  desc: string;
  status: string;
  parentChain: string;
  members: string[];
  nodes: number;
  blockHeight: number;
  txCount: number;
  createTime: string;
  creator: string;
  isolation: string;
}

/* ─── Mock Subchains ─── */
const initialSubchains: Subchain[] = [
  {
    id: "SC-001",
    name: "政务数据子链",
    desc: "政府部门间的数据共享与业务协同",
    status: "running",
    parentChain: "主联盟链",
    members: ["市政府", "公安局", "税务局", "人社局"],
    nodes: 6,
    blockHeight: 152340,
    txCount: 45210,
    createTime: "2025-01-15 09:00:00",
    creator: "管理员",
    isolation: "成员范围隔离",
  },
  {
    id: "SC-002",
    name: "金融风控子链",
    desc: "金融机构间的风控数据共享",
    status: "running",
    parentChain: "主联盟链",
    members: ["人民银行", "工商银行", "建设银行", "招商银行"],
    nodes: 8,
    blockHeight: 89120,
    txCount: 23450,
    createTime: "2025-02-01 14:00:00",
    creator: "管理员",
    isolation: "业务隔离",
  },
  {
    id: "SC-003",
    name: "医疗健康子链",
    desc: "医疗机构间的患者数据共享",
    status: "paused",
    parentChain: "主联盟链",
    members: ["中心医院", "人民医院", "中医院"],
    nodes: 5,
    blockHeight: 45230,
    txCount: 12340,
    createTime: "2025-03-10 10:00:00",
    creator: "管理员",
    isolation: "业务隔离",
  },
  {
    id: "SC-004",
    name: "供应链子链",
    desc: "供应链上下游企业数据追溯",
    status: "running",
    parentChain: "主联盟链",
    members: ["核心企业", "供应商A", "供应商B", "物流公司", "零售商"],
    nodes: 7,
    blockHeight: 67890,
    txCount: 34560,
    createTime: "2025-03-20 16:00:00",
    creator: "管理员",
    isolation: "成员范围隔离",
  },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    running: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    paused: { text: "已暂停", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    stopped: { text: "已停止", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.stopped;
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>{c.text}</span>;
}

/* ─── Fields ─── */
const subchainFields: FieldConfig[] = [
  { key: "name", label: "子链名称", type: "text", required: true },
  { key: "desc", label: "描述", type: "textarea", required: true },
  { key: "status", label: "状态", type: "select", required: true, options: [
    { label: "运行中", value: "running" },
    { label: "已暂停", value: "paused" },
    { label: "已停止", value: "stopped" },
  ]},
  { key: "parentChain", label: "父链", type: "text", required: true },
  { key: "members", label: "成员（逗号分隔）", type: "textarea", required: true, placeholder: "市政府,公安局,税务局" },
  { key: "nodes", label: "节点数", type: "number", required: true },
  { key: "blockHeight", label: "区块高度", type: "number", required: true },
  { key: "txCount", label: "交易数", type: "number", required: true },
  { key: "createTime", label: "创建时间", type: "text", required: true },
  { key: "creator", label: "创建者", type: "text", required: true },
  { key: "isolation", label: "隔离方式", type: "select", required: true, options: [
    { label: "成员范围隔离", value: "成员范围隔离" },
    { label: "业务隔离", value: "业务隔离" },
  ]},
];

const detailFields = [
  { key: "id", label: "子链编号" },
  { key: "name", label: "子链名称" },
  { key: "desc", label: "描述" },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "parentChain", label: "父链", type: "badge" as const },
  { key: "members", label: "成员", type: "list" as const },
  { key: "nodes", label: "节点数" },
  { key: "blockHeight", label: "区块高度" },
  { key: "txCount", label: "交易数" },
  { key: "createTime", label: "创建时间", type: "date" as const },
  { key: "creator", label: "创建者" },
  { key: "isolation", label: "隔离方式", type: "badge" as const },
];

function generateId(subchains: Subchain[]): string {
  const maxNum = subchains.reduce((max, s) => {
    const match = s.id.match(/SC-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `SC-${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Main ─── */
export default function BlockchainSubchains() {
  const [subchains, setSubchains] = useState<Subchain[]>(initialSubchains);
  const [search, setSearch] = useState("");

  // CrudDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [dialogData, setDialogData] = useState<Record<string, any> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  // DetailDrawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSubchain, setDetailSubchain] = useState<Subchain | null>(null);

  const filtered = subchains.filter((s) =>
    s.name.includes(search) || s.id.includes(search)
  );

  const handleCreate = () => {
    setDialogMode("create");
    setDialogData({
      name: "",
      desc: "",
      status: "running",
      parentChain: "主联盟链",
      members: "",
      nodes: 4,
      blockHeight: 0,
      txCount: 0,
      createTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      creator: "管理员",
      isolation: "成员范围隔离",
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (subchain: Subchain) => {
    setDialogMode("edit");
    setDialogData({
      name: subchain.name,
      desc: subchain.desc,
      status: subchain.status,
      parentChain: subchain.parentChain,
      members: subchain.members.join(","),
      nodes: subchain.nodes,
      blockHeight: subchain.blockHeight,
      txCount: subchain.txCount,
      createTime: subchain.createTime,
      creator: subchain.creator,
      isolation: subchain.isolation,
    });
    setEditingId(subchain.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = (subchain: Subchain) => {
    setDialogMode("delete");
    setEditingId(subchain.id);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const members = typeof data.members === "string"
      ? data.members.split(",").map((m: string) => m.trim()).filter(Boolean)
      : data.members || [];

    if (dialogMode === "create") {
      const id = generateId(subchains);
      const newSubchain: Subchain = {
        id,
        name: data.name,
        desc: data.desc,
        status: data.status,
        parentChain: data.parentChain,
        members,
        nodes: Number(data.nodes),
        blockHeight: Number(data.blockHeight),
        txCount: Number(data.txCount),
        createTime: data.createTime,
        creator: data.creator,
        isolation: data.isolation,
      };
      setSubchains((prev) => [...prev, newSubchain]);
    } else if (dialogMode === "edit" && editingId) {
      setSubchains((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: data.name,
                desc: data.desc,
                status: data.status,
                parentChain: data.parentChain,
                members,
                nodes: Number(data.nodes),
                blockHeight: Number(data.blockHeight),
                txCount: Number(data.txCount),
                createTime: data.createTime,
                creator: data.creator,
                isolation: data.isolation,
              }
            : s
        )
      );
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingId) {
      setSubchains((prev) => prev.filter((s) => s.id !== editingId));
    }
    setDialogOpen(false);
  };

  const openDetail = (subchain: Subchain) => {
    setDetailSubchain(subchain);
    setDetailOpen(true);
  };

  const setStatus = (id: string, status: string) => {
    setSubchains((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const detailData = detailSubchain
    ? {
        ...detailSubchain,
        blockHeight: detailSubchain.blockHeight.toLocaleString(),
        txCount: detailSubchain.txCount.toLocaleString(),
      }
    : {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">应用子链管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">基于联盟链创建业务隔离或成员范围隔离的子链</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          创建子链
        </button>
      </div>

      {/* Search */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="搜索子链名称、编号..." value={search} onChange={(e) => setSearch(e.target.value)} className={cn("w-full pl-9 pr-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} />
        </div>
      </div>

      {/* Subchain Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((sc) => (
          <div
            key={sc.id}
            onClick={() => openDetail(sc)}
            className={cn(
              "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sc.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500 font-mono">{sc.id}</span>
                    <StatusBadge status={sc.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                {sc.status !== "running" && (
                  <Button size="sm" variant="ghost" title="启动" onClick={() => setStatus(sc.id, "running")}>
                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                  </Button>
                )}
                {sc.status === "running" && (
                  <Button size="sm" variant="ghost" title="暂停" onClick={() => setStatus(sc.id, "paused")}>
                    <Pause className="w-3.5 h-3.5 text-amber-500" />
                  </Button>
                )}
                {sc.status !== "stopped" && (
                  <Button size="sm" variant="ghost" title="停止" onClick={() => setStatus(sc.id, "stopped")}>
                    <Square className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openDetail(sc)}><Eye className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(sc)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(sc)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{sc.desc}</p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.blockHeight.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">区块高度</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.txCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">交易数</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] text-center">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{sc.nodes}</div>
                <div className="text-[10px] text-slate-500">节点数</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{sc.members.length} 成员</span>
              <span>{sc.isolation}</span>
              <span>{sc.createTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DetailDrawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={`子链详情 - ${detailSubchain?.name || ""}`}
        data={detailData}
        fields={detailFields}
        onEdit={detailSubchain ? () => handleEdit(detailSubchain) : undefined}
        onDelete={detailSubchain ? () => handleDelete(detailSubchain) : undefined}
      />

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "delete" ? `${subchains.find((s) => s.id === editingId)?.name || "子链"}` : "子链"}
        fields={subchainFields}
        data={dialogData}
        mode={dialogMode}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
