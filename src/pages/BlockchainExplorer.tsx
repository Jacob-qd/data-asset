import { useState } from "react";
import {
  Search,
  Blocks,
  ArrowLeftRight,
  Clock,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
  X,
  BarChart3,
  Hash,
  Layers,
  Zap,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Block Data ─── */
const blockData = Array.from({ length: 20 }, (_, i) => {
  const height = 4285691 - i;
  return {
    height,
    hash: `0x${(height * 123456789).toString(16).slice(0, 12)}...${(height * 987654321).toString(16).slice(-6)}`,
    prevHash: `0x${((height - 1) * 123456789).toString(16).slice(0, 12)}...`,
    txCount: [98, 134, 156, 143, 189, 167, 112, 145, 178, 132, 156, 143, 189, 167, 112, 145, 178, 132, 156, 143][i],
    timestamp: new Date(Date.now() - i * 5000).toLocaleString("zh-CN"),
    size: `${(0.8 + Math.random() * 0.8).toFixed(1)} MB`,
    miner: `节点-${(i % 5) + 1}`,
    gasUsed: Math.floor(8000000 + Math.random() * 4000000),
    gasLimit: 15000000,
  };
});

/* ─── Mock Transaction Data ─── */
const txData = Array.from({ length: 15 }, (_, i) => ({
  hash: `0x${(i * 123456789 + 98765).toString(16).slice(0, 16)}...`,
  blockHeight: 4285691 - Math.floor(i / 3),
  from: `0x${(i * 111111 + 22222).toString(16).slice(0, 12)}...`,
  to: `0x${(i * 333333 + 44444).toString(16).slice(0, 12)}...`,
  type: ["存证", "授权", "流转", "合约调用", "确权"][i % 5],
  status: i < 13 ? "success" : "failed",
  value: (Math.random() * 10).toFixed(4),
  gas: Math.floor(21000 + Math.random() * 100000),
  timestamp: new Date(Date.now() - i * 8000).toLocaleString("zh-CN"),
}));

/* ─── Copy Button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors"
      title="复制"
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
    </button>
  );
}

/* ─── Block Detail Drawer ─── */
function BlockDetailDrawer({ block, onClose }: { block: typeof blockData[0]; onClose: () => void }) {
  const blockTxs = txData.filter((tx) => tx.blockHeight === block.height);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[520px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] overflow-y-auto animate-slideInRight">
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">区块详情</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Block Info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
              <Hash className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
                #{block.height.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {block.timestamp}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {[
              { label: "区块哈希", value: block.hash },
              { label: "父区块哈希", value: block.prevHash },
              { label: "打包节点", value: block.miner },
              { label: "区块大小", value: block.size },
              { label: "Gas 使用", value: `${block.gasUsed.toLocaleString()} / ${block.gasLimit.toLocaleString()}` },
              { label: "交易数量", value: `${block.txCount} 笔` },
            ].map((field) => (
              <div key={field.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#334155] last:border-0">
                <span className="text-xs text-slate-500">{field.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-800 dark:text-slate-100 font-mono">{field.value}</span>
                  <CopyButton text={field.value} />
                </div>
              </div>
            ))}
          </div>

          {/* Transaction List */}
          {blockTxs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                交易列表 ({blockTxs.length})
              </h3>
              <div className="space-y-2">
                {blockTxs.map((tx) => (
                  <div key={tx.hash} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">{tx.hash}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px]",
                        tx.status === "success"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30"
                      )}>
                        {tx.status === "success" ? "成功" : "失败"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>从: {tx.from}</span>
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>到: {tx.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainExplorer() {
  const [activeTab, setActiveTab] = useState<"blocks" | "transactions">("blocks");
  const [search, setSearch] = useState("");
  const [detailBlock, setDetailBlock] = useState<typeof blockData[0] | null>(null);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const paginatedBlocks = blockData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(blockData.length / pageSize);

  // Chain stats
  const stats = {
    blockHeight: 4285691,
    txCount: 2847391,
    tps: 2847,
    nodes: 10,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">区块浏览器</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          查询区块链上的区块、交易和链上数据
        </p>
      </div>

      {/* Search Bar */}
      <div className={cn(
        "rounded-xl border p-4",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="输入区块高度、区块哈希、交易哈希查询..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-12 pr-4 py-3 rounded-xl border text-sm",
              "bg-slate-50 border-slate-200 text-slate-800",
              "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            )}
          />
        </div>
      </div>

      {/* Chain Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "区块高度", value: stats.blockHeight.toLocaleString(), icon: <Blocks className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
          { label: "交易总数", value: stats.txCount.toLocaleString(), icon: <ArrowLeftRight className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "当前 TPS", value: stats.tps.toLocaleString(), icon: <Zap className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "共识节点", value: stats.nodes.toString(), icon: <Server className="w-4 h-4" />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/30" },
        ].map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={cn(
        "rounded-xl border overflow-hidden",
        "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
      )}>
        <div className="flex border-b border-slate-200 dark:border-[#334155]">
          {[
            { key: "blocks" as const, label: "区块列表", icon: <Blocks className="w-4 h-4" /> },
            { key: "transactions" as const, label: "交易列表", icon: <ArrowLeftRight className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-sm transition-colors border-b-2",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium bg-primary-50/50 dark:bg-primary-900/10"
                  : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "blocks" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                      <th className="text-left py-3 px-3 font-medium text-xs">高度</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">区块哈希</th>
                      <th className="text-right py-3 px-3 font-medium text-xs">交易数</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">打包节点</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">时间</th>
                      <th className="text-right py-3 px-3 font-medium text-xs">大小</th>
                      <th className="text-center py-3 px-3 font-medium text-xs">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlocks.map((block) => (
                      <tr
                        key={block.height}
                        className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-primary-600 dark:text-primary-400 font-medium">
                          {block.height.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            {block.hash}
                            <CopyButton text={block.hash} />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                          {block.txCount}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{block.miner}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{block.timestamp}</td>
                        <td className="py-3 px-3 text-right text-xs text-slate-500">{block.size}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setDetailBlock(block)}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-[#334155]">
                <span className="text-xs text-slate-500">
                  共 {blockData.length} 个区块
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
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 dark:border-[#334155]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "transactions" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#334155]">
                      <th className="text-left py-3 px-3 font-medium text-xs">交易哈希</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">区块</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">类型</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">发送方</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">接收方</th>
                      <th className="text-center py-3 px-3 font-medium text-xs">状态</th>
                      <th className="text-right py-3 px-3 font-medium text-xs">Gas</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txData.map((tx) => (
                      <tr
                        key={tx.hash}
                        className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-xs text-primary-600 dark:text-primary-400">
                          <div className="flex items-center gap-1">
                            {tx.hash}
                            <CopyButton text={tx.hash} />
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {tx.blockHeight.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">{tx.from}</td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">{tx.to}</td>
                        <td className="py-3 px-3 text-center">
                          {tx.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 inline" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-xs text-slate-500">{tx.gas.toLocaleString()}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {detailBlock && <BlockDetailDrawer block={detailBlock} onClose={() => setDetailBlock(null)} />}
    </div>
  );
}
