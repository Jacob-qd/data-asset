import { useState } from "react";
import {
  Cpu,
  Network,
  HardDrive,
  Database,
  Blocks,
  Save,
  Activity,
  Shield,
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

  const handleSave = () => {
    console.log("Consensus config saved:", config);
  };

  const handleChange = (key: keyof typeof config, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-blue-600" />
          共识参数配置
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
        >
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
                value={config[field.key as keyof typeof config] as string}
                onChange={(e) => handleChange(field.key as keyof typeof config, e.target.value)}
                className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              >
                {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="number"
                value={config[field.key as keyof typeof config] as number}
                onChange={(e) => handleChange(field.key as keyof typeof config, Number(e.target.value))}
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
  const [config, setConfig] = useState({
    p2pPort: "16789",
    rpcPort: "8545",
    channelPort: "20200",
    maxConnections: "200",
    connectionTimeout: "30",
    maxPacketSize: "10",
  });

  const handleSave = () => {
    console.log("Network config saved:", config);
  };

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-violet-600" />
          网络配置
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
        >
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "P2P监听端口", key: "p2pPort", desc: "节点间P2P通信端口" },
          { label: "RPC服务端口", key: "rpcPort", desc: "JSON-RPC服务端口" },
          { label: "Channel端口", key: "channelPort", desc: "Channel协议端口" },
          { label: "最大连接数", key: "maxConnections", desc: "P2P最大连接节点数" },
          { label: "连接超时(秒)", key: "connectionTimeout", desc: "P2P连接超时时间" },
          { label: "数据包大小限制(MB)", key: "maxPacketSize", desc: "单个数据包最大大小" },
        ].map((field) => (
          <div key={field.key} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
            <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
            <input
              type="text"
              value={config[field.key as keyof typeof config]}
              onChange={(e) => handleChange(field.key as keyof typeof config, e.target.value)}
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
  const [config, setConfig] = useState({
    stateEngine: "RocksDB",
    stateCache: "512",
    stateWriteBuf: "64",
    stateMaxFiles: "1000",
    stateCompress: "Snappy",
    stateDir: "/data/state",
    histEngine: "LevelDB",
    histCache: "1024",
    histDir: "/data/history",
    idxTx: "启用",
    idxBlock: "启用",
    idxAddr: "启用",
  });

  const handleSave = () => {
    console.log("Storage config saved:", config);
  };

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-emerald-600" />
          存储与数据库配置
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
        >
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
            { label: "存储引擎", key: "stateEngine" },
            { label: "缓存大小(MB)", key: "stateCache" },
            { label: "写缓冲区大小(MB)", key: "stateWriteBuf" },
            { label: "最大打开文件数", key: "stateMaxFiles" },
            { label: "压缩类型", key: "stateCompress" },
            { label: "数据目录", key: "stateDir" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input
                type="text"
                value={config[f.key as keyof typeof config]}
                onChange={(e) => handleChange(f.key as keyof typeof config, e.target.value)}
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
            { label: "存储引擎", key: "histEngine" },
            { label: "区块缓存数", key: "histCache" },
            { label: "数据目录", key: "histDir" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <input
                type="text"
                value={config[f.key as keyof typeof config]}
                onChange={(e) => handleChange(f.key as keyof typeof config, e.target.value)}
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
            { label: "交易索引", key: "idxTx" },
            { label: "区块高度索引", key: "idxBlock" },
            { label: "地址索引", key: "idxAddr" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] text-slate-500 mb-1">{f.label}</label>
              <select
                value={config[f.key as keyof typeof config]}
                onChange={(e) => handleChange(f.key as keyof typeof config, e.target.value)}
                className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              >
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

/* ─── Crypto Config ─── */
function CryptoConfig() {
  const [config, setConfig] = useState({
    encryptionAlgorithm: "AES-256-GCM",
    hashAlgorithm: "SHA3-256",
    keyLength: "256",
    signatureAlgorithm: "ECDSA",
    tlsVersion: "TLS 1.3",
    certPath: "/etc/ssl/certs",
    keyStoreType: "PKCS#12",
    enableHardwareAcceleration: "启用",
  });

  const handleSave = () => {
    console.log("Crypto config saved:", config);
  };

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-amber-600" />
          加密配置
        </h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700"
        >
          <Save className="w-3 h-3" />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "加密算法", key: "encryptionAlgorithm", desc: "对称加密算法" },
          { label: "哈希算法", key: "hashAlgorithm", desc: "哈希摘要算法" },
          { label: "密钥长度(bit)", key: "keyLength", desc: "加密密钥长度" },
          { label: "签名算法", key: "signatureAlgorithm", desc: "数字签名算法" },
          { label: "TLS版本", key: "tlsVersion", desc: "传输层安全协议版本" },
          { label: "证书路径", key: "certPath", desc: "SSL证书存储路径" },
          { label: "密钥库类型", key: "keyStoreType", desc: "密钥存储格式" },
          { label: "硬件加速", key: "enableHardwareAcceleration", desc: "是否启用硬件加速", type: "select" },
        ].map((field) => (
          <div key={field.key} className={cn("p-4 rounded-xl border", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
            <p className="text-[10px] text-slate-500 mb-2">{field.desc}</p>
            {field.type === "select" ? (
              <select
                value={config[field.key as keyof typeof config]}
                onChange={(e) => handleChange(field.key as keyof typeof config, e.target.value)}
                className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              >
                <option>启用</option>
                <option>禁用</option>
              </select>
            ) : (
              <input
                type="text"
                value={config[field.key as keyof typeof config]}
                onChange={(e) => handleChange(field.key as keyof typeof config, e.target.value)}
                className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainCore() {
  const [activeTab, setActiveTab] = useState<"consensus" | "network" | "storage" | "crypto">("consensus");

  const tabs = [
    { key: "consensus" as const, label: "共识配置", icon: <Cpu className="w-4 h-4" /> },
    { key: "network" as const, label: "网络配置", icon: <Network className="w-4 h-4" /> },
    { key: "storage" as const, label: "存储配置", icon: <HardDrive className="w-4 h-4" /> },
    { key: "crypto" as const, label: "加密配置", icon: <Shield className="w-4 h-4" /> },
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
          {activeTab === "crypto" && <CryptoConfig />}
        </div>
      </div>
    </div>
  );
}
