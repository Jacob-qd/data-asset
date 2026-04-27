import { useState } from "react";
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
  FileText,
  Fingerprint,
  Calendar,
  User,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Data ─── */
const notaryTypes = ["全部", "数据存证", "流转存证", "授权存证", "合约存证"];
const notaryStatus = ["全部", "存证成功", "存证中", "存证失败"];

const notaryRecords = [
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

/* ─── Detail Drawer ─── */
function DetailDrawer({ record, onClose }: { record: typeof notaryRecords[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[480px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] overflow-y-auto animate-slideInRight">
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">存证详情</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
            {record.status === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : record.status === "pending" ? (
              <Clock className="w-8 h-8 text-amber-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {record.status === "success" ? "存证成功" : record.status === "pending" ? "存证中" : "存证失败"}
              </div>
              <div className="text-xs text-slate-500">{record.time}</div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {[
              { label: "存证编号", value: record.id, icon: <Fingerprint className="w-4 h-4" /> },
              { label: "资产名称", value: record.assetName, icon: <FileText className="w-4 h-4" /> },
              { label: "存证类型", value: record.type, icon: <ShieldCheck className="w-4 h-4" /> },
              { label: "操作人", value: record.operator, icon: <User className="w-4 h-4" /> },
              { label: "区块高度", value: record.blockHeight ? record.blockHeight.toLocaleString() : "待确认", icon: <FileCheck className="w-4 h-4" /> },
              { label: "交易哈希", value: record.txHash, icon: <Fingerprint className="w-4 h-4" /> },
              { label: "数据哈希", value: record.dataHash, icon: <Fingerprint className="w-4 h-4" /> },
              { label: "存证时间", value: record.time, icon: <Calendar className="w-4 h-4" /> },
            ].map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5">{field.icon}</span>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{field.label}</div>
                  <div className="text-sm text-slate-800 dark:text-slate-100 font-mono mt-0.5">{field.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Verify Button */}
          {record.status === "success" && (
            <button className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              "bg-primary-600 text-white hover:bg-primary-700"
            )}>
              <ExternalLink className="w-4 h-4" />
              链上验证
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── New Notary Modal ─── */
function NewNotaryModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ assetName: "", type: "数据存证", desc: "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[520px] bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] shadow-xl overflow-hidden animate-scaleIn">
        <div className="p-5 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">新建存证</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["选择资产", "确认信息", "提交存证"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium",
                  step > i + 1 ? "bg-emerald-500 text-white" :
                  step === i + 1 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-xs", step === i + 1 ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-500")}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">数据资产</label>
                <input
                  type="text"
                  placeholder="搜索数据资产..."
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                    "bg-white border-slate-200 text-slate-800",
                    "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">存证类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                    "bg-white border-slate-200 text-slate-800",
                    "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100"
                  )}
                >
                  {notaryTypes.filter((t) => t !== "全部").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">资产名称</span>
                <span className="text-slate-800 dark:text-slate-100 font-medium">{formData.assetName || "企业信用评价数据集"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">存证类型</span>
                <span className="text-slate-800 dark:text-slate-100 font-medium">{formData.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">数据哈希</span>
                <span className="text-slate-800 dark:text-slate-100 font-mono text-xs">sha256:8f7e2d1c...b4a593</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">预估Gas</span>
                <span className="text-slate-800 dark:text-slate-100 font-medium">0.002 ETH</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">存证提交成功</h3>
              <p className="text-sm text-slate-500 mt-1">交易已提交至区块链网络，预计 3-5 秒确认</p>
              <div className="mt-4 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0F172A] p-3 rounded-lg inline-block">
                交易哈希: 0x9f8e3c...d5b7a2
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-2">
          {step < 3 ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155] transition-colors">
                取消
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                {step === 2 ? "提交存证" : "下一步"}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors">
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainNotary() {
  const [selectedType, setSelectedType] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");
  const [search, setSearch] = useState("");
  const [detailRecord, setDetailRecord] = useState<typeof notaryRecords[0] | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = notaryRecords.filter((r) => {
    if (selectedType !== "全部" && r.type !== selectedType) return false;
    if (selectedStatus !== "全部") {
      const s = selectedStatus === "存证成功" ? "success" : selectedStatus === "存证中" ? "pending" : "failed";
      if (r.status !== s) return false;
    }
    if (search && !r.assetName.includes(search) && !r.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">存证管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">数据资产上链存证、验证与查询</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
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
              {filtered.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors cursor-pointer"
                  onClick={() => setDetailRecord(record)}
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
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailRecord(record); }}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      查看
                    </button>
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
              第 {page} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#334155]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {detailRecord && <DetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />}

      {/* New Notary Modal */}
      {showNewModal && <NewNotaryModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
