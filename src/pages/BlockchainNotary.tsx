import { useState, useEffect } from "react";
import {
  Search,
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  FileText,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/components/CrudDialog";
import { CrudDialog } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface NotaryRecord {
  id: string;
  assetName: string;
  type: string;
  status: string;
  txHash: string;
  operator: string;
  time: string;
  blockHeight: number;
  dataHash: string;
}

/* ─── Constants ─── */
const notaryTypes = ["全部", "数据存证", "流转存证", "授权存证", "合约存证"];
const notaryStatus = ["全部", "存证成功", "存证中", "存证失败"];

const initialRecords: NotaryRecord[] = [
  { id: "NT-20250422001", assetName: "企业信用评价数据集", type: "数据存证", status: "success", txHash: "0x8f7e2d...c4b9a1", operator: "张三", time: "2025-04-22 14:32:18", blockHeight: 4285691, dataHash: "sha256:a1b2c3d4e5f6..." },
  { id: "NT-20250422002", assetName: "交通流量数据", type: "流转存证", status: "success", txHash: "0x7a6c3e...b2d8f0", operator: "李四", time: "2025-04-22 13:15:42", blockHeight: 4285685, dataHash: "sha256:b2c3d4e5f6a7..." },
  { id: "NT-20250422003", assetName: "医疗健康档案", type: "数据存证", status: "pending", txHash: "-", operator: "王五", time: "2025-04-22 12:48:33", blockHeight: 0, dataHash: "sha256:c3d4e5f6a7b8..." },
  { id: "NT-20250422004", assetName: "环境监测数据", type: "授权存证", status: "success", txHash: "0x6b5d2f...a1e7c9", operator: "赵六", time: "2025-04-22 11:20:56", blockHeight: 4285678, dataHash: "sha256:d4e5f6a7b8c9..." },
  { id: "NT-20250422005", assetName: "教育资源数据集", type: "数据存证", status: "success", txHash: "0x5c4e1a...09f6b8", operator: "张三", time: "2025-04-22 10:05:21", blockHeight: 4285665, dataHash: "sha256:e5f6a7b8c9d0..." },
  { id: "NT-20250422006", assetName: "金融风控数据", type: "合约存证", status: "success", txHash: "0x4d3f09...e8a5c7", operator: "李四", time: "2025-04-22 09:48:12", blockHeight: 4285659, dataHash: "sha256:f6a7b8c9d0e1..." },
  { id: "NT-20250422007", assetName: "城市人口数据", type: "流转存证", status: "failed", txHash: "-", operator: "王五", time: "2025-04-22 08:30:45", blockHeight: 0, dataHash: "sha256:a7b8c9d0e1f2..." },
  { id: "NT-20250422008", assetName: "工商注册信息", type: "数据存证", status: "success", txHash: "0x3e2e8f...d7b4a6", operator: "赵六", time: "2025-04-22 07:15:30", blockHeight: 4285642, dataHash: "sha256:b8c9d0e1f2a3..." },
  { id: "NT-20250422009", assetName: "气象观测数据", type: "授权存证", status: "success", txHash: "0x2f1d7e...c6a3b5", operator: "张三", time: "2025-04-21 22:48:56", blockHeight: 4285580, dataHash: "sha256:c9d0e1f2a3b4..." },
  { id: "NT-20250422010", assetName: "物流轨迹数据", type: "数据存证", status: "pending", txHash: "-", operator: "李四", time: "2025-04-21 20:12:33", blockHeight: 0, dataHash: "sha256:d0e1f2a3b4c5..." },
];

const dialogFields: FieldConfig[] = [
  { key: "id", label: "存证编号", type: "text", required: true },
  { key: "assetName", label: "资产名称", type: "text", required: true },
  {
    key: "type",
    label: "存证类型",
    type: "select",
    required: true,
    options: notaryTypes.filter((t) => t !== "全部").map((t) => ({ label: t, value: t })),
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "存证成功", value: "success" },
      { label: "存证中", value: "pending" },
      { label: "存证失败", value: "failed" },
    ],
  },
  { key: "txHash", label: "交易哈希", type: "text", placeholder: "0x... 或 -" },
  { key: "operator", label: "操作人", type: "text", required: true },
  { key: "time", label: "时间", type: "text", required: true, placeholder: "YYYY-MM-DD HH:mm:ss" },
  { key: "blockHeight", label: "区块高度", type: "number", placeholder: "0" },
  { key: "dataHash", label: "数据哈希", type: "text", placeholder: "sha256:..." },
];

const detailFields = [
  { key: "id", label: "存证编号" },
  { key: "assetName", label: "资产名称" },
  { key: "type", label: "存证类型", type: "badge" as const },
  { key: "status", label: "状态", type: "badge" as const },
  { key: "txHash", label: "交易哈希" },
  { key: "operator", label: "操作人" },
  { key: "blockHeight", label: "区块高度" },
  { key: "dataHash", label: "数据哈希" },
  { key: "time", label: "存证时间" },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    success: { text: "存证成功", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending: { text: "存证中", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    failed: { text: "存证失败", class: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {c.text}
    </span>
  );
}

/* ─── Main ─── */
export default function BlockchainNotary() {
  const [records, setRecords] = useState<NotaryRecord[]>(initialRecords);
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view" | "delete">("create");
  const [dialogData, setDialogData] = useState<NotaryRecord | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<NotaryRecord | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, selectedType, selectedStatus]);

  const filtered = records.filter((r) => {
    if (selectedType !== "全部" && r.type !== selectedType) return false;
    if (selectedStatus !== "全部") {
      const s = selectedStatus === "存证成功" ? "success" : selectedStatus === "存证中" ? "pending" : "failed";
      if (r.status !== s) return false;
    }
    if (search && !r.assetName.includes(search) && !r.id.includes(search)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setDialogMode("create");
    setDialogData(null);
    setDialogOpen(true);
  };

  const openEdit = (record: NotaryRecord) => {
    setDialogMode("edit");
    setDialogData(record);
    setDialogOpen(true);
  };

  const openDelete = (record: NotaryRecord) => {
    setDialogMode("delete");
    setDialogData(record);
    setDialogOpen(true);
  };

  const openView = (record: NotaryRecord) => {
    setDrawerRecord(record);
    setDrawerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    const processed: NotaryRecord = {
      ...(data as NotaryRecord),
      blockHeight: Number(data.blockHeight) || 0,
    };
    if (dialogMode === "create") {
      setRecords([processed, ...records]);
    } else if (dialogMode === "edit" && dialogData) {
      setRecords(records.map((r) => (r.id === dialogData.id ? { ...processed, id: dialogData.id } : r)));
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (dialogData) {
      setRecords(records.filter((r) => r.id !== dialogData.id));
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">存证管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">数据资产上链存证、验证与查询</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建存证
        </button>
      </div>

      {/* Filters */}
      <div className={cn(
        "rounded-xl border p-4",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索存证编号、资产名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg border text-sm",
                "bg-white border-slate-200 text-slate-800",
                "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              )}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">类型:</span>
            {notaryTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors",
                  selectedType === t
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">状态:</span>
            {notaryStatus.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors",
                  selectedStatus === s
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 dark:border-[#334155] dark:text-slate-400 dark:hover:bg-[#273548]">
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        "rounded-xl border overflow-hidden",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                <th className="text-left py-3 px-4 font-medium text-xs">存证编号</th>
                <th className="text-left py-3 px-4 font-medium text-xs">资产名称</th>
                <th className="text-left py-3 px-4 font-medium text-xs">类型</th>
                <th className="text-left py-3 px-4 font-medium text-xs">状态</th>
                <th className="text-left py-3 px-4 font-medium text-xs">交易哈希</th>
                <th className="text-left py-3 px-4 font-medium text-xs">操作人</th>
                <th className="text-right py-3 px-4 font-medium text-xs">时间</th>
                <th className="text-center py-3 px-4 font-medium text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors cursor-pointer"
                  onClick={() => openView(record)}
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">{record.id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{record.assetName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {record.type}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{record.txHash}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{record.operator}</td>
                  <td className="py-3 px-4 text-right text-xs text-slate-500">{record.time}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openView(record); }}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        查看
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(record); }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDelete(record); }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#334155]">
          <span className="text-xs text-slate-500">
            共 {filtered.length} 条记录
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 dark:border-[#334155]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 dark:border-[#334155]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CRUD Dialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="存证"
        fields={dialogFields}
        data={dialogData || undefined}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        mode={dialogMode}
      />

      {/* Detail Drawer */}
      {drawerRecord && (
        <DetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="存证详情"
          data={drawerRecord}
          fields={detailFields}
          onEdit={() => {
            setDrawerOpen(false);
            openEdit(drawerRecord);
          }}
          onDelete={() => {
            setDrawerOpen(false);
            openDelete(drawerRecord);
          }}
        />
      )}
    </div>
  );
}
