import { useState } from "react";
import {
  Cpu,
  Network,
  HardDrive,
  Database,
  Blocks,
  Zap,
  Settings,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Sliders,
  Server,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Consensus Config ─── */
function ConsensusConfig() {
  const [config, setConfig] = useState({
    algorithm: "PBFT",
    blockInterval: 5,
    blockSize: 200,
    maxTxPerBlock: 1000,
    heartbeatInterval: 2,
    viewChangeTimeout: 10,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-blue-600" />
          共识参数配置
        </h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "共识算法", key: "algorithm", type: "select", options: ["PBFT", "Raft", "HotStuff"], desc: "拜占庭容错共识算法" },
          { label: "出块间隔(秒)", key: "blockInterval", type: "number", desc: "区块生成时间间隔" },
          { label: "区块大小(KB)", key: "blockSize", type: "number", desc: "单个区块最大容量" },
          { label: "最大交易数/块", key: "maxTxPerBlock", type: "number", desc: "每区块最大交易数量" },
          { label: "心跳间隔(秒)", key: "heartbeatInterval", type: "number", desc: "节点心跳检测间隔" },
          { label: "视图切换超时(秒)", key: "viewChangeTimeout", type: "number", desc: "主节点切换超时时间" },
        ].map((field) => (
          <div key={field.key} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
            <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
            {field.type === "select" ? (
              <select
                value={config[field.key as keyof typeof config]}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              >
                {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="number"
                value={config[field.key as keyof typeof config]}
                onChange={(e) => setConfig({ ...config, [field.key]: Number(e.target.value) })}
                className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Network Config ─── */
function NetworkConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-violet-600" />
          网络配置
        </h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "P2P监听端口", value: "16789", desc: "节点间P2P通信端口" },
          { label: "RPC服务端口", value: "8545", desc: "JSON-RPC服务端口" },
          { label: "Channel端口", value: "20200", desc: "Channel协议端口" },
          { label: "最大连接数", value: "200", desc: "P2P最大连接节点数" },
          { label: "连接超时(秒)", value: "30", desc: "P2P连接超时时间" },
          { label: "数据包大小限制(MB)", value: "10", desc: "单个数据包最大大小" },
        ].map((field) => (
          <div key={field.label} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
            <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
            <input
              type="text"
              defaultValue={field.value}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Storage Config ─── */
function StorageConfig() {
  const [dbType, setDbType] = useState("leveldb");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-emerald-600" />
          存储与数据库配置
        </h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      {/* State DB */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          状态数据库
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "存储引擎", value: "RocksDB", key: "stateEngine" },
            { label: "缓存大小(MB)", value: "512", key: "stateCache" },
            { label: "写缓冲区大小(MB)", value: "64", key: "stateWriteBuf" },
            { label: "最大打开文件数", value: "1000", key: "stateMaxFiles" },
            { label: "压缩类型", value: "Snappy", key: "stateCompress" },
            { label: "数据目录", value: "/data/state", key: "stateDir" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={f.value}
                className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* History DB */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Blocks className="w-3.5 h-3.5" />
          历史数据库
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "存储引擎", value: "LevelDB", key: "histEngine" },
            { label: "区块缓存数", value: "1024", key: "histCache" },
            { label: "数据目录", value: "/data/history", key: "histDir" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={f.value}
                className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Index DB */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          索引数据库
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "交易索引", value: "启用", key: "idxTx" },
            { label: "区块高度索引", value: "启用", key: "idxBlock" },
            { label: "地址索引", value: "启用", key: "idxAddr" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <select className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                <option>启用</option>
                <option>禁用</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Transaction Pool ─── */
function TxPoolConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-600" />
          交易池与区块生成
        </h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Transaction Pool */}
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">交易池配置</h4>
          <div className="space-y-3">
            {[
              { label: "交易池容量", value: "100000", desc: "交易池最大容纳交易数" },
              { label: "交易超时(分钟)", value: "30", desc: "交易在池中最大等待时间" },
              { label: " Gas价格下限", value: "1", desc: "交易最低Gas价格" },
              { label: "Gas上限", value: "30000000", desc: "单笔交易最大Gas消耗" },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between">
                  <label className="text-[10px] text-slate-500">{f.label}</label>
                  <span className="text-[10px] text-slate-400">{f.desc}</span>
                </div>
                <input
                  type="text"
                  defaultValue={f.value}
                  className={cn("w-full mt-1 px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Block Generation */}
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">区块生成配置</h4>
          <div className="space-y-3">
            {[
              { label: "出块间隔(秒)", value: "5", desc: "共识出块时间间隔" },
              { label: "最大区块大小(MB)", value: "2", desc: "区块数据大小限制" },
              { label: "最大Gas/区块", value: "15000000", desc: "区块Gas消耗上限" },
              { label: "空块生成", value: "启用", desc: "无交易时是否生成空块" },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between">
                  <label className="text-[10px] text-slate-500">{f.label}</label>
                  <span className="text-[10px] text-slate-400">{f.desc}</span>
                </div>
                {f.label === "空块生成" ? (
                  <select className={cn("w-full mt-1 px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}>
                    <option>启用</option>
                    <option>禁用</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    defaultValue={f.value}
                    className={cn("w-full mt-1 px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* State Machine */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          状态机管理
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "状态模式", value: "MPT", desc: "Merkle Patricia Trie" },
            { label: "状态根计算", value: "实时", desc: "每区块更新状态根" },
            { label: "历史状态保留", value: "全部", desc: "保留所有历史状态" },
            { label: "状态裁剪", value: "禁用", desc: "自动裁剪旧状态" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input
                type="text"
                defaultValue={f.value}
                className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              />
              <p className="text-[9px] text-slate-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainCore() {
  const [activeTab, setActiveTab] = useState<"consensus" | "network" | "storage" | "txpool">("consensus");

  const tabs = [
    { key: "consensus" as const, label: "共识参数", icon: <Cpu className="w-4 h-4" /> },
    { key: "network" as const, label: "网络配置", icon: <Network className="w-4 h-4" /> },
    { key: "storage" as const, label: "存储与数据库", icon: <HardDrive className="w-4 h-4" /> },
    { key: "txpool" as const, label: "交易池与区块", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">链核心管理</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">组网通信、存储管理、数据安全服务、共识管理等核心组件配置</p>
      </div>

      {/* Tabs */}
      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="flex border-b border-slate-200 dark:border-[#334155]">
          {tabs.map((tab) => (
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
        <div className="p-5">
          {activeTab === "consensus" && <ConsensusConfig />}
          {activeTab === "network" && <NetworkConfig />}
          {activeTab === "storage" && <StorageConfig />}
          {activeTab === "txpool" && <TxPoolConfig />}
        </div>
      </div>
    </div>
  );
}
