import { useState, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Database,
  Tag,
  History,
  Save,
  Trash2,
  Play,
  Pause,
  Check,
  AlertCircle,
  FileCode,
  TrendingUp,
  TrendingDown,
  Filter,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type TxStatus = "pending" | "confirmed" | "finalized";

type InternalTx = {
  id: string;
  from: string;
  to: string;
  value: string;
  functionName: string;
  gasUsed: number;
  status: "success" | "failed";
  depth: number;
  children: InternalTx[];
};

type EventLog = {
  index: number;
  address: string;
  name: string;
  params: { name: string; value: string; type: string }[];
};

type Transaction = {
  hash: string;
  blockHeight: number;
  from: string;
  to: string;
  type: string;
  status: "success" | "failed";
  value: string;
  gas: number;
  gasLimit: number;
  gasPrice: string;
  nonce: number;
  timestamp: string;
  inputData: string;
  txStatus: TxStatus;
  eventLogs: EventLog[];
  internalTxs: InternalTx[];
};

type BlockItem = {
  height: number;
  hash: string;
  prevHash: string;
  txCount: number;
  timestamp: string;
  size: string;
  miner: string;
  gasUsed: number;
  gasLimit: number;
};

type SearchHistoryItem = {
  id: string;
  name: string;
  filters: AdvancedFilters;
  timestamp: string;
};

type AdvancedFilters = {
  blockFrom: string;
  blockTo: string;
  dateFrom: string;
  dateTo: string;
  txType: string;
  valueMin: string;
  valueMax: string;
  gasMin: string;
  gasMax: string;
  addressFrom: string;
  addressTo: string;
};

type AddressInfo = {
  address: string;
  type: "eoa" | "contract";
  balance: string;
  txIn: number;
  txOut: number;
  txTotal: number;
  code?: string;
  tags: string[];
};

/* ─── Mock Block Data ─── */
const blockData: BlockItem[] = Array.from({ length: 20 }, (_, i) => {
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
const txData: Transaction[] = Array.from({ length: 15 }, (_, i) => {
  const statuses: TxStatus[] = ["pending", "confirmed", "finalized"];
  const txStatus = statuses[i % 3];
  const hash = `0x${(i * 123456789 + 98765).toString(16).slice(0, 16)}...`;
  const from = `0x${(i * 111111 + 22222).toString(16).slice(0, 12)}...`;
  const to = `0x${(i * 333333 + 44444).toString(16).slice(0, 12)}...`;
  return {
    hash,
    blockHeight: 4285691 - Math.floor(i / 3),
    from,
    to,
    type: ["存证", "授权", "流转", "合约调用", "合约部署"][i % 5],
    status: i < 13 ? "success" : "failed",
    value: (Math.random() * 10).toFixed(4),
    gas: Math.floor(21000 + Math.random() * 100000),
    gasLimit: 300000,
    gasPrice: (Math.random() * 50 + 10).toFixed(2),
    nonce: i * 3 + 1,
    timestamp: new Date(Date.now() - i * 8000).toLocaleString("zh-CN"),
    inputData: `0x${Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    txStatus,
    eventLogs: [
      {
        index: 0,
        address: to,
        name: "Transfer",
        params: [
          { name: "from", value: from, type: "address" },
          { name: "to", value: to, type: "address" },
          { name: "value", value: (Math.random() * 1000).toFixed(0), type: "uint256" },
        ],
      },
      {
        index: 1,
        address: to,
        name: "Approval",
        params: [
          { name: "owner", value: from, type: "address" },
          { name: "spender", value: to, type: "address" },
          { name: "value", value: (Math.random() * 500).toFixed(0), type: "uint256" },
        ],
      },
    ],
    internalTxs: generateInternalTxs(i, 0),
  };
});

function generateInternalTxs(seed: number, depth: number): InternalTx[] {
  if (depth >= 2) return [];
  const count = seed % 3 === 0 ? 2 : seed % 3 === 1 ? 1 : 0;
  return Array.from({ length: count }, (_, j) => {
    const id = Date.now().toString(36).toUpperCase() + `-${seed}-${depth}-${j}`;
    const fromAddr = `0x${((seed + j) * 111111 + 22222).toString(16).slice(0, 12)}...`;
    const toAddr = `0x${((seed + j + 1) * 333333 + 44444).toString(16).slice(0, 12)}...`;
    return {
      id,
      from: fromAddr,
      to: toAddr,
      value: (Math.random() * 2).toFixed(4),
      functionName: ["transfer", "approve", "swap", "mint"][(seed + j) % 4],
      gasUsed: Math.floor(5000 + Math.random() * 50000),
      status: (seed + j) % 5 === 0 ? "failed" : "success",
      depth,
      children: generateInternalTxs(seed + j + 1, depth + 1),
    };
  });
}

/* ─── Mock Address Data ─── */
const addressData: Record<string, AddressInfo> = {};
txData.forEach((tx, i) => {
  if (!addressData[tx.from]) {
    addressData[tx.from] = {
      address: tx.from,
      type: i % 7 === 0 ? "contract" : "eoa",
      balance: (Math.random() * 1000).toFixed(4),
      txIn: 0,
      txOut: 0,
      txTotal: 0,
      code: i % 7 === 0 ? `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Contract${i} {\n  mapping(address => uint256) public balances;\n  \n  function transfer(address to, uint256 amount) public {\n    require(balances[msg.sender] >= amount);\n    balances[msg.sender] -= amount;\n    balances[to] += amount;\n  }\n}` : undefined,
      tags: i % 7 === 0 ? ["合约"] : [],
    };
  }
  if (!addressData[tx.to]) {
    addressData[tx.to] = {
      address: tx.to,
      type: i % 5 === 0 ? "contract" : "eoa",
      balance: (Math.random() * 1000).toFixed(4),
      txIn: 0,
      txOut: 0,
      txTotal: 0,
      code: i % 5 === 0 ? `// Contract code for ${tx.to}\npragma solidity ^0.8.0;` : undefined,
      tags: i % 5 === 0 ? ["交易所"] : [],
    };
  }
  addressData[tx.from].txOut++;
  addressData[tx.from].txTotal++;
  addressData[tx.to].txIn++;
  addressData[tx.to].txTotal++;
});

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

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: TxStatus }) {
  const config = {
    pending: { bg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Pending" },
    confirmed: { bg: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Confirmed" },
    finalized: { bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Finalized" },
  };
  const c = config[status];
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", c.bg)}>
      {c.label}
    </span>
  );
}

/* ─── Transaction Status Tracker ─── */
function StatusTracker({ status }: { status: TxStatus }) {
  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "confirmed", label: "Confirmed" },
    { key: "finalized", label: "Finalized" },
  ];
  const currentIndex = status === "pending" ? 0 : status === "confirmed" ? 1 : 2;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        {steps.map((step, i) => (
          <div key={step.key} className={cn(
            "flex items-center gap-1",
            i <= currentIndex ? "text-slate-800 dark:text-slate-100" : "text-slate-400"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
              i <= currentIndex
                ? "bg-primary-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400"
            )}>
              {i < currentIndex ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className="font-medium">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Internal Transaction Node ─── */
function InternalTxNode({ node }: { node: InternalTx }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
        style={{ marginLeft: node.depth * 20 }}
      >
        {hasChildren && (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <div className="flex-1 min-w-0 grid grid-cols-5 gap-2 text-xs">
          <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{node.from}</span>
          <span className="font-mono text-slate-600 dark:text-slate-400 truncate">{node.to}</span>
          <span className="text-slate-700 dark:text-slate-300">{node.value} ETH</span>
          <span className="text-primary-600 dark:text-primary-400">{node.functionName}()</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">{node.gasUsed.toLocaleString()}</span>
            {node.status === "success" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <InternalTxNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Transaction Detail Dialog ─── */
function TransactionDetailDialog({ tx, onClose, onAddressClick }: { tx: Transaction; onClose: () => void; onAddressClick: (addr: string) => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "internal">("overview");
  const [inputExpanded, setInputExpanded] = useState(false);

  const totalFee = (parseFloat(tx.gasPrice) * tx.gas / 1e9).toFixed(6);
  const totalInternalValue = useMemo(() => {
    const sum = (nodes: InternalTx[]): number => nodes.reduce((acc: number, n) => acc + parseFloat(n.value) + sum(n.children), 0);
    return sum(tx.internalTxs).toFixed(4);
  }, [tx.internalTxs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col animate-slideIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">交易详情</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#334155] px-4">
          {[
            { key: "overview" as const, label: "概览" },
            { key: "logs" as const, label: `事件日志 (${tx.eventLogs.length})` },
            { key: "internal" as const, label: `内部交易 (${tx.internalTxs.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm border-b-2 transition-colors",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "overview" && (
            <>
              <StatusTracker status={tx.txStatus} />

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">交易哈希</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono text-slate-800 dark:text-slate-100">{tx.hash}</span>
                    <CopyButton text={tx.hash} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">状态</span>
                  <StatusBadge status={tx.txStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">区块高度</span>
                  <span className="text-sm font-mono text-slate-800 dark:text-slate-100">{tx.blockHeight.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">时间戳</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tx.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Nonce</span>
                  <span className="text-sm font-mono text-slate-800 dark:text-slate-100">{tx.nonce}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">发送方</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddressClick(tx.from)}
                      className="text-sm font-mono text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {tx.from}
                    </button>
                    <CopyButton text={tx.from} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">接收方</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddressClick(tx.to)}
                      className="text-sm font-mono text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {tx.to}
                    </button>
                    <CopyButton text={tx.to} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">转账金额</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{tx.value} ETH</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gas 使用量</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tx.gas.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gas 限制</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tx.gasLimit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gas 价格</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tx.gasPrice} Gwei</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">总手续费</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{totalFee} ETH</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">输入数据</span>
                  <button
                    onClick={() => setInputExpanded(!inputExpanded)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    {inputExpanded ? "收起" : "展开"}
                  </button>
                </div>
                <div className={cn(
                  "text-xs font-mono text-slate-600 dark:text-slate-400 break-all",
                  !inputExpanded && "line-clamp-2"
                )}>
                  {tx.inputData}
                </div>
              </div>
            </>
          )}

          {activeTab === "logs" && (
            <div className="space-y-3">
              {tx.eventLogs.map((log) => (
                <div key={log.index} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{log.name}</span>
                    <span className="text-xs text-slate-500">索引: {log.index}</span>
                  </div>
                  <div className="text-xs text-slate-500">合约: {log.address}</div>
                  <div className="space-y-1">
                    {log.params.map((param) => (
                      <div key={param.name} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{param.name} ({param.type}):</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "internal" && (
            <div className="space-y-2">
              {tx.internalTxs.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">无内部交易</div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>总计: {tx.internalTxs.length} 笔内部交易</span>
                    <span>总价值: {totalInternalValue} ETH</span>
                  </div>
                  <div className="space-y-1">
                    {tx.internalTxs.map((node) => (
                      <InternalTxNode key={node.id} node={node} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Address Detail Dialog ─── */
function AddressDetailDialog({ address, onClose, onTxClick }: { address: string; onClose: () => void; onTxClick: (tx: Transaction) => void }) {
  const info = addressData[address] || {
    address,
    type: "eoa",
    balance: "0.0000",
    txIn: 0,
    txOut: 0,
    txTotal: 0,
    tags: [],
  };
  const [activeTab, setActiveTab] = useState<"overview" | "in" | "out">("overview");
  const [tags, setTags] = useState(info.tags);
  const [newTag, setNewTag] = useState("");

  const relatedTxs = txData.filter((tx) => tx.from === address || tx.to === address);
  const inTxs = relatedTxs.filter((tx) => tx.to === address);
  const outTxs = relatedTxs.filter((tx) => tx.from === address);

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] overflow-hidden flex flex-col animate-slideIn">
        <div className="p-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">地址详情</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-[#334155] px-4">
          {[
            { key: "overview" as const, label: "概览" },
            { key: "in" as const, label: `转入 (${inTxs.length})` },
            { key: "out" as const, label: `转出 (${outTxs.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm border-b-2 transition-colors",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "overview" && (
            <>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">地址</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono text-slate-800 dark:text-slate-100">{info.address}</span>
                    <CopyButton text={info.address} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">类型</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium",
                    info.type === "contract"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/30"
                  )}>
                    {info.type === "contract" ? "合约账户" : "外部账户"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">余额</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{info.balance} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">交易数</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600"><TrendingUp className="w-3 h-3 inline" /> {info.txIn}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-red-600"><TrendingDown className="w-3 h-3 inline" /> {info.txOut}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{info.txTotal}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">标签</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-900/30">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && <span className="text-xs text-slate-400">暂无标签</span>}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="添加标签..."
                    className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-2 py-1 rounded bg-primary-500 text-white text-xs hover:bg-primary-600"
                  >
                    <Tag className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {info.code && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">合约代码</div>
                  <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#0B1120] p-2 rounded overflow-auto max-h-48">
                    {info.code}
                  </pre>
                </div>
              )}
            </>
          )}

          {(activeTab === "in" || activeTab === "out") && (
            <div className="space-y-2">
              {(activeTab === "in" ? inTxs : outTxs).length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">暂无交易</div>
              ) : (
                (activeTab === "in" ? inTxs : outTxs).map((tx) => (
                  <button
                    key={tx.hash}
                    onClick={() => onTxClick(tx)}
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">{tx.hash}</span>
                      <span className="text-xs text-slate-500">{tx.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>区块: {tx.blockHeight.toLocaleString()}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{tx.value} ETH</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Export Dialog ─── */
function ExportDialog({ onClose, dataType, data }: { onClose: () => void; dataType: "blocks" | "transactions"; data: unknown[] }) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [scope, setScope] = useState<"page" | "all" | "selected">("page");
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const startExport = () => {
    setExporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setExporting(false);
          setDone(true);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const download = () => {
    const content = format === "json"
      ? JSON.stringify(data, null, 2)
      : data.map((row) => Object.values(row as Record<string, unknown>).join(",")).join("\n");
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${dataType}-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#334155] p-6 animate-slideIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">导出数据</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">格式</label>
            <div className="flex gap-2">
              {(["csv", "json"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                    format === f
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "border-slate-200 text-slate-600 dark:border-[#334155] dark:text-slate-400"
                  )}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">范围</label>
            <div className="flex gap-2">
              {([
                { key: "page" as const, label: "当前页" },
                { key: "all" as const, label: "全部" },
                { key: "selected" as const, label: "选中项" },
              ]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScope(s.key)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                    scope === s.key
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "border-slate-200 text-slate-600 dark:border-[#334155] dark:text-slate-400"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {exporting && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>导出中...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              导出完成
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!done ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 dark:border-[#334155] dark:text-slate-400 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={startExport}
                  disabled={exporting}
                  className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
                >
                  {exporting ? "导出中..." : "开始导出"}
                </button>
              </>
            ) : (
              <button
                onClick={download}
                className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 flex items-center justify-center gap-1"
              >
                <Download className="w-4 h-4" />
                下载文件
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Block Detail Drawer ─── */
function BlockDetailDrawer({ block, onClose, onTxClick, onAddressClick }: { block: BlockItem; onClose: () => void; onTxClick: (tx: Transaction) => void; onAddressClick: (addr: string) => void }) {
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

          {blockTxs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                交易列表 ({blockTxs.length})
              </h3>
              <div className="space-y-2">
                {blockTxs.map((tx) => (
                  <button
                    key={tx.hash}
                    onClick={() => onTxClick(tx)}
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors text-left"
                  >
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
                      <span>
                        从:{" "}
                        <span
                          className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onAddressClick(tx.from); }}
                        >
                          {tx.from}
                        </span>
                      </span>
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>
                        到:{" "}
                        <span
                          className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onAddressClick(tx.to); }}
                        >
                          {tx.to}
                        </span>
                      </span>
                    </div>
                  </button>
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
  const [detailBlock, setDetailBlock] = useState<BlockItem | null>(null);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [detailAddress, setDetailAddress] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([
    {
      id: Date.now().toString(36).toUpperCase(),
      name: "最近大额转账",
      filters: { blockFrom: "", blockTo: "", dateFrom: "", dateTo: "", txType: "转账", valueMin: "1", valueMax: "", gasMin: "", gasMax: "", addressFrom: "", addressTo: "" },
      timestamp: new Date(Date.now() - 86400000).toLocaleString("zh-CN"),
    },
  ]);

  const [filters, setFilters] = useState<AdvancedFilters>({
    blockFrom: "",
    blockTo: "",
    dateFrom: "",
    dateTo: "",
    txType: "全部",
    valueMin: "",
    valueMax: "",
    gasMin: "",
    gasMax: "",
    addressFrom: "",
    addressTo: "",
  });

  const pageSize = 10;
  const paginatedBlocks = blockData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(blockData.length / pageSize);

  const filteredTxData = useMemo(() => {
    return txData.filter((tx) => {
      if (search && !tx.hash.includes(search) && !tx.from.includes(search) && !tx.to.includes(search)) return false;
      if (filters.txType !== "全部" && tx.type !== filters.txType) return false;
      if (filters.valueMin && parseFloat(tx.value) < parseFloat(filters.valueMin)) return false;
      if (filters.valueMax && parseFloat(tx.value) > parseFloat(filters.valueMax)) return false;
      if (filters.gasMin && tx.gas < parseInt(filters.gasMin)) return false;
      if (filters.gasMax && tx.gas > parseInt(filters.gasMax)) return false;
      if (filters.addressFrom && !tx.from.includes(filters.addressFrom)) return false;
      if (filters.addressTo && !tx.to.includes(filters.addressTo)) return false;
      return true;
    });
  }, [search, filters]);

  const saveSearch = () => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(36).toUpperCase(),
      name: `搜索 ${searchHistory.length + 1}`,
      filters: { ...filters },
      timestamp: new Date().toLocaleString("zh-CN"),
    };
    setSearchHistory([newItem, ...searchHistory]);
    setShowHistory(false);
  };

  const applyHistory = (item: SearchHistoryItem) => {
    setFilters(item.filters);
    setShowHistory(false);
  };

  const deleteHistory = (id: string) => {
    setSearchHistory(searchHistory.filter((h) => h.id !== id));
  };

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
            placeholder="输入区块高度、区块哈希、交易哈希、地址查询..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-12 pr-24 py-3 rounded-xl border text-sm",
              "bg-slate-50 border-slate-200 text-slate-800",
              "dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155] text-slate-400"
              title="搜索历史"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className={cn(
                "p-1.5 rounded-lg text-slate-400",
                advancedOpen ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30" : "hover:bg-slate-100 dark:hover:bg-[#334155]"
              )}
              title="高级搜索"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Search History Dropdown */}
          {showHistory && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="p-2 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">搜索历史</span>
              </div>
              {searchHistory.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">暂无历史记录</div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#273548] cursor-pointer"
                    >
                      <button
                        onClick={() => applyHistory(item)}
                        className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300"
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.timestamp}</div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHistory(item.id); }}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Search Panel */}
        {advancedOpen && (
          <div className="max-w-2xl mx-auto mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">区块高度范围</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="从"
                    value={filters.blockFrom}
                    onChange={(e) => setFilters({ ...filters, blockFrom: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="到"
                    value={filters.blockTo}
                    onChange={(e) => setFilters({ ...filters, blockTo: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">时间范围</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">交易类型</label>
                <select
                  value={filters.txType}
                  onChange={(e) => setFilters({ ...filters, txType: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {["全部", "转账", "合约部署", "合约调用"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">金额范围 (ETH)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={filters.valueMin}
                    onChange={(e) => setFilters({ ...filters, valueMin: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="最大"
                    value={filters.valueMax}
                    onChange={(e) => setFilters({ ...filters, valueMax: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Gas 范围</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={filters.gasMin}
                    onChange={(e) => setFilters({ ...filters, gasMin: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="最大"
                    value={filters.gasMax}
                    onChange={(e) => setFilters({ ...filters, gasMax: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">发送方地址</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={filters.addressFrom}
                  onChange={(e) => setFilters({ ...filters, addressFrom: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">接收方地址</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={filters.addressTo}
                  onChange={(e) => setFilters({ ...filters, addressTo: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveSearch}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600"
              >
                <Save className="w-3 h-3" />
                保存搜索
              </button>
            </div>
          </div>
        )}
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">共 {blockData.length} 个区块</span>
                <button
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#273548]"
                >
                  <Download className="w-3 h-3" />
                  导出
                </button>
              </div>

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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">共 {filteredTxData.length} 笔交易</span>
                <button
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#273548]"
                >
                  <Download className="w-3 h-3" />
                  导出
                </button>
              </div>

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
                    {filteredTxData.map((tx) => (
                      <tr
                        key={tx.hash}
                        className="border-b border-slate-100 dark:border-[#334155] last:border-0 hover:bg-slate-50 dark:hover:bg-[#273548] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-xs text-primary-600 dark:text-primary-400">
                          <button
                            onClick={() => setDetailTx(tx)}
                            className="hover:underline text-left"
                          >
                            <div className="flex items-center gap-1">
                              {tx.hash}
                              <CopyButton text={tx.hash} />
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {tx.blockHeight.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">
                          <button
                            onClick={() => setDetailAddress(tx.from)}
                            className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
                          >
                            {tx.from}
                          </button>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">
                          <button
                            onClick={() => setDetailAddress(tx.to)}
                            className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
                          >
                            {tx.to}
                          </button>
                        </td>
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

      {/* Overlays */}
      {detailBlock && (
        <BlockDetailDrawer
          block={detailBlock}
          onClose={() => setDetailBlock(null)}
          onTxClick={(tx) => setDetailTx(tx)}
          onAddressClick={(addr) => setDetailAddress(addr)}
        />
      )}

      {detailTx && (
        <TransactionDetailDialog
          tx={detailTx}
          onClose={() => setDetailTx(null)}
          onAddressClick={(addr) => setDetailAddress(addr)}
        />
      )}

      {detailAddress && (
        <AddressDetailDialog
          address={detailAddress}
          onClose={() => setDetailAddress(null)}
          onTxClick={(tx) => setDetailTx(tx)}
        />
      )}

      {exportOpen && (
        <ExportDialog
          onClose={() => setExportOpen(false)}
          dataType={activeTab}
          data={activeTab === "blocks" ? blockData : filteredTxData}
        />
      )}
    </div>
  );
}
