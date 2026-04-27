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
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Subchains ─── */
const subchainsData = [
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
    members: [ "中心医院", "人民医院", "中医院"],
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

/* ─── Create Modal ─── */
function CreateModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[520px] bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] shadow-xl animate-scaleIn">
        <div className="p-5 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">创建应用子链</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            {["基本信息", "成员配置", "确认创建"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium", step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500")}>
                  {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-xs", step === i + 1 ? "font-medium text-slate-800 dark:text-slate-100" : "text-slate-500")}>{s}</span>
              </div>
            ))}
          </div>
          {step === 1 && (
            <div className="space-y-3">
              <div><label className="block text-xs text-slate-500 mb-1">子链名称</label><input className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} placeholder="输入子链名称" /></div>
              <div><label className="block text-xs text-slate-500 mb-1">描述</label><textarea className={cn("w-full px-3 py-2 rounded-lg border text-sm h-20", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")} placeholder="子链用途描述" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-500 mb-1">隔离方式</label><select className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}><option>成员范围隔离</option><option>业务隔离</option></select></div>
                <div><label className="block text-xs text-slate-500 mb-1">父链</label><select className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}><option>主联盟链</option></select></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">选择参与子链的组织成员（至少2个）：</p>
              {["市政府", "公安局", "税务局", "人社局", "人民银行", "工商银行"].map((m) => (
                <label key={m} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-[#334155] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#273548]">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{m}</span>
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">子链创建成功</p>
              <p className="text-xs text-slate-500 mt-1">子链将在1-2分钟内完成初始化</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-2">
          {step < 3 ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400">取消</button>
              <button onClick={() => setStep(step + 1)} className="px-4 py-2 rounded-lg text-xs bg-primary-600 text-white hover:bg-primary-700">{step === 2 ? "确认创建" : "下一步"}</button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs bg-primary-600 text-white hover:bg-primary-700">完成</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainSubchains() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = subchainsData.filter((s) => s.name.includes(search) || s.id.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">应用子链管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">基于联盟链创建业务隔离或成员范围隔离的子链</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700">
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
          <div key={sc.id} className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
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
              <div className="flex gap-1">
                {sc.status === "running" ? (
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]" title="暂停"><Pause className="w-3.5 h-3.5 text-amber-500" /></button>
                ) : (
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]" title="启动"><Play className="w-3.5 h-3.5 text-emerald-500" /></button>
                )}
                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]" title="删除"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
