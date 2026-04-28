import { useState, useRef, useEffect, useCallback } from "react";
import {
  Cpu,
  Network,
  HardDrive,
  Database,
  Blocks,
  Save,
  Activity,
  Shield,
  History,
  Upload,
  Download,
  FileJson,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GitCompare,
  RotateCcw,
  Layers,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as echarts from "echarts";

/* ─── Types ─── */
interface ConfigVersion {
  id: string;
  version: string;
  author: string;
  time: string;
  changes: string[];
  config: Record<string, any>;
}

interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, any>;
}

interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

/* ─── Helpers ─── */
function generateId() {
  return Date.now().toString(36).toUpperCase();
}

/* ─── Mock Data ─── */
const initialVersions: ConfigVersion[] = [
  {
    id: "V-001",
    version: "v1.0.0",
    author: "张三",
    time: "2025-04-20 10:00:00",
    changes: ["初始配置创建"],
    config: { algorithm: "PBFT", blockInterval: 5 },
  },
  {
    id: "V-002",
    version: "v1.1.0",
    author: "李四",
    time: "2025-04-21 14:30:00",
    changes: ["调整出块间隔为3秒", "增加视图切换超时"],
    config: { algorithm: "PBFT", blockInterval: 3 },
  },
  {
    id: "V-003",
    version: "v1.2.0",
    author: "王五",
    time: "2025-04-22 09:15:00",
    changes: ["切换为Raft算法", "调整网络端口"],
    config: { algorithm: "Raft", blockInterval: 3 },
  },
];

const templates: ConfigTemplate[] = [
  {
    id: generateId(),
    name: "高性能共识模板",
    description: "适用于高并发场景，优化出块和交易处理参数",
    category: "共识",
    config: { algorithm: "HotStuff", blockInterval: 1, blockSize: 500, maxTxPerBlock: 2000 },
  },
  {
    id: generateId(),
    name: "安全增强模板",
    description: "加强加密和权限控制，适合金融场景",
    category: "加密",
    config: { encryptionAlgorithm: "AES-256-GCM", tlsVersion: "TLS 1.3" },
  },
  {
    id: generateId(),
    name: "存储优化模板",
    description: "优化RocksDB和LevelDB参数，提升读写性能",
    category: "存储",
    config: { stateEngine: "RocksDB", stateCache: "1024", stateWriteBuf: "128" },
  },
  {
    id: generateId(),
    name: "P2P网络模板",
    description: "优化节点间通信，支持大规模组网",
    category: "网络",
    config: { maxConnections: "500", connectionTimeout: "60", maxPacketSize: "20" },
  },
];

/* ─── Validation Engine ─── */
function validateConfig(config: Record<string, any>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (config.blockInterval !== undefined && config.blockInterval < 1) {
    issues.push({ field: "blockInterval", message: "出块间隔不能小于1秒", severity: "error" });
  }
  if (config.blockInterval !== undefined && config.blockInterval > 60) {
    issues.push({ field: "blockInterval", message: "出块间隔大于60秒可能影响用户体验", severity: "warning" });
  }
  if (config.blockSize !== undefined && config.blockSize > 1024) {
    issues.push({ field: "blockSize", message: "区块大小超过1MB可能导致网络延迟", severity: "warning" });
  }
  if (config.maxTxPerBlock !== undefined && config.maxTxPerBlock > 5000) {
    issues.push({ field: "maxTxPerBlock", message: "每区块交易数过多可能影响性能", severity: "warning" });
  }
  if (config.p2pPort !== undefined && (parseInt(config.p2pPort) < 1024 || parseInt(config.p2pPort) > 65535)) {
    issues.push({ field: "p2pPort", message: "端口号必须在1024-65535之间", severity: "error" });
  }
  if (config.maxConnections !== undefined && parseInt(config.maxConnections) > 1000) {
    issues.push({ field: "maxConnections", message: "最大连接数超过1000可能消耗大量内存", severity: "warning" });
  }
  if (config.stateCache !== undefined && parseInt(config.stateCache) < 64) {
    issues.push({ field: "stateCache", message: "缓存大小小于64MB可能影响性能", severity: "warning" });
  }
  return issues;
}

function analyzeImpact(issues: ValidationIssue[]): { errors: number; warnings: number; effects: string[] } {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const effects: string[] = [];
  if (errors > 0) effects.push("配置包含错误，无法保存");
  if (warnings > 0) effects.push("配置包含警告，建议优化后再保存");
  if (errors === 0 && warnings === 0) effects.push("配置验证通过，可以安全保存");
  return { errors, warnings, effects };
}

/* ─── Consensus Config ─── */
function ConsensusConfig({
  onValidate,
}: {
  onValidate: (issues: ValidationIssue[]) => void;
}) {
  const [config, setConfig] = useState({
    algorithm: "PBFT",
    blockInterval: 5,
    blockSize: 200,
    maxTxPerBlock: 1000,
    heartbeatInterval: 2,
    viewChangeTimeout: 10,
    raftElectionTimeout: 3,
    pbftViewChangeTimeout: 15,
  });

  const handleChange = (key: keyof typeof config, value: string | number) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      onValidate(validateConfig(next));
      return next;
    });
  };

  const handleSave = () => {
    const issues = validateConfig(config);
    onValidate(issues);
    if (issues.some((i) => i.severity === "error")) {
      alert("配置验证未通过，请先修复错误");
      return;
    }
    console.log("Consensus config saved:", config);
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

      {/* Advanced Consensus Params */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          高级共识参数
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">PBFT ViewChange超时(ms)</label>
            <input
              type="number"
              value={config.pbftViewChangeTimeout}
              onChange={(e) => handleChange("pbftViewChangeTimeout", Number(e.target.value))}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Raft选举超时(秒)</label>
            <input
              type="number"
              value={config.raftElectionTimeout}
              onChange={(e) => handleChange("raftElectionTimeout", Number(e.target.value))}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Network Config ─── */
function NetworkConfig({
  onValidate,
}: {
  onValidate: (issues: ValidationIssue[]) => void;
}) {
  const [config, setConfig] = useState({
    p2pPort: "16789",
    rpcPort: "8545",
    channelPort: "20200",
    maxConnections: "200",
    connectionTimeout: "30",
    maxPacketSize: "10",
    p2pConnectionLimit: "500",
    bandwidthLimit: "100",
    natTraversal: "启用",
    enableUPnP: "启用",
  });

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      onValidate(validateConfig(next));
      return next;
    });
  };

  const handleSave = () => {
    const issues = validateConfig(config);
    onValidate(issues);
    if (issues.some((i) => i.severity === "error")) {
      alert("配置验证未通过，请先修复错误");
      return;
    }
    console.log("Network config saved:", config);
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

      {/* Advanced P2P Config */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          P2P高级配置
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">连接限制</label>
            <input
              type="text"
              value={config.p2pConnectionLimit}
              onChange={(e) => handleChange("p2pConnectionLimit", e.target.value)}
              className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">带宽限制(Mbps)</label>
            <input
              type="text"
              value={config.bandwidthLimit}
              onChange={(e) => handleChange("bandwidthLimit", e.target.value)}
              className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">NAT穿透</label>
            <select
              value={config.natTraversal}
              onChange={(e) => handleChange("natTraversal", e.target.value)}
              className={cn("w-full px-2.5 py-1.5 rounded border text-xs", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            >
              <option>启用</option>
              <option>禁用</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Storage Config ─── */
function StorageConfig({
  onValidate,
}: {
  onValidate: (issues: ValidationIssue[]) => void;
}) {
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
    rocksdbWriteBuffer: "128",
    rocksdbMaxOpenFiles: "5000",
    leveldbCache: "256",
    leveldbBlockSize: "16",
  });

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      onValidate(validateConfig(next));
      return next;
    });
  };

  const handleSave = () => {
    const issues = validateConfig(config);
    onValidate(issues);
    if (issues.some((i) => i.severity === "error")) {
      alert("配置验证未通过，请先修复错误");
      return;
    }
    console.log("Storage config saved:", config);
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

      {/* Advanced Storage Params */}
      <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          高级存储参数
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">RocksDB写缓冲区大小(MB)</label>
            <input
              type="text"
              value={config.rocksdbWriteBuffer}
              onChange={(e) => handleChange("rocksdbWriteBuffer", e.target.value)}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">RocksDB最大打开文件数</label>
            <input
              type="text"
              value={config.rocksdbMaxOpenFiles}
              onChange={(e) => handleChange("rocksdbMaxOpenFiles", e.target.value)}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">LevelDB缓存大小(MB)</label>
            <input
              type="text"
              value={config.leveldbCache}
              onChange={(e) => handleChange("leveldbCache", e.target.value)}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">LevelDB块大小(KB)</label>
            <input
              type="text"
              value={config.leveldbBlockSize}
              onChange={(e) => handleChange("leveldbBlockSize", e.target.value)}
              className={cn("w-full px-3 py-2 rounded-lg border text-sm", "bg-white border-slate-200 dark:bg-[#0F172A] dark:border-[#334155] dark:text-slate-100")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Crypto Config ─── */
function CryptoConfig({
  onValidate,
}: {
  onValidate: (issues: ValidationIssue[]) => void;
}) {
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

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      onValidate(validateConfig(next));
      return next;
    });
  };

  const handleSave = () => {
    const issues = validateConfig(config);
    onValidate(issues);
    if (issues.some((i) => i.severity === "error")) {
      alert("配置验证未通过，请先修复错误");
      return;
    }
    console.log("Crypto config saved:", config);
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

/* ─── Version History ─── */
function VersionHistory({
  versions,
  onRollback,
}: {
  versions: ConfigVersion[];
  onRollback: (v: ConfigVersion) => void;
}) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffData, setDiffData] = useState<{ left: ConfigVersion; right: ConfigVersion } | null>(null);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const doCompare = () => {
    if (compareIds.length !== 2) return;
    const left = versions.find((v) => v.id === compareIds[0])!;
    const right = versions.find((v) => v.id === compareIds[1])!;
    setDiffData({ left, right });
    setDiffOpen(true);
  };

  const getDiff = (left: Record<string, any>, right: Record<string, any>) => {
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return Array.from(allKeys).map((key) => ({
      key,
      left: left[key],
      right: right[key],
      changed: left[key] !== right[key],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <History className="w-4 h-4 text-blue-600" />
          配置版本历史
        </h3>
        <Button
          size="sm"
          variant="outline"
          disabled={compareIds.length !== 2}
          onClick={doCompare}
          className="gap-1.5"
        >
          <GitCompare className="w-3.5 h-3.5" />
          对比选中版本
        </Button>
      </div>

      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">选择</TableHead>
              <TableHead>版本</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>变更内容</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={compareIds.includes(v.id)}
                    onChange={() => toggleCompare(v.id)}
                    className="rounded border-slate-300"
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{v.version}</TableCell>
                <TableCell>{v.author}</TableCell>
                <TableCell className="text-xs text-slate-500">{v.time}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {v.changes.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => onRollback(v)} className="gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    回滚
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diff Dialog */}
      <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              版本对比
            </DialogTitle>
          </DialogHeader>
          {diffData && (
            <div className="space-y-4 py-2">
              <div className="flex gap-4 text-sm">
                <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold">{diffData.left.version}</p>
                  <p className="text-xs text-slate-500">{diffData.left.author} · {diffData.left.time}</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold">{diffData.right.version}</p>
                  <p className="text-xs text-slate-500">{diffData.right.author} · {diffData.right.time}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配置项</TableHead>
                    <TableHead>{diffData.left.version}</TableHead>
                    <TableHead>{diffData.right.version}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDiff(diffData.left.config, diffData.right.config).map((d) => (
                    <TableRow key={d.key} className={d.changed ? "bg-amber-50/50" : ""}>
                      <TableCell className="font-mono text-xs">{d.key}</TableCell>
                      <TableCell className={d.changed ? "text-red-600" : ""}>{String(d.left ?? "-")}</TableCell>
                      <TableCell className={d.changed ? "text-emerald-600" : ""}>{String(d.right ?? "-")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiffOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Import/Export ─── */
function ImportExportPanel({
  onImport,
}: {
  onImport: (config: Record<string, any>) => void;
}) {
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = { exportedAt: new Date().toISOString(), config: { algorithm: "PBFT", blockInterval: 5 } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blockchain-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportYAML = () => {
    const yaml = `# Blockchain Config\nexportedAt: ${new Date().toISOString()}\nconfig:\n  algorithm: PBFT\n  blockInterval: 5\n`;
    const blob = new Blob([yaml], { type: "application/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blockchain-config-${Date.now()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || "");
        const data = file.name.endsWith(".yaml") || file.name.endsWith(".yml")
          ? { config: { imported: true, raw: text } }
          : JSON.parse(text);
        setPreviewData(data.config || data);
        setPreviewOpen(true);
      } catch {
        alert("文件解析失败");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImportConfirm = () => {
    if (previewData) {
      onImport(previewData);
      setPreviewOpen(false);
      setPreviewData(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-blue-600" />
          配置导入/导出
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
          <h4 className="text-xs font-semibold mb-3">导出配置</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportJSON} className="gap-1.5">
              <FileJson className="w-3.5 h-3.5" />
              导出JSON
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportYAML} className="gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              导出YAML
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border p-4 transition-colors",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]",
            dragOver && "border-blue-500 bg-blue-50/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <h4 className="text-xs font-semibold mb-3">导入配置</h4>
          <div className="flex flex-col items-center justify-center gap-2 py-4 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-700">
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-xs text-slate-500">拖拽文件到此处或点击上传</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              选择文件
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>配置预览</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs overflow-auto max-h-[300px]">
              {previewData ? JSON.stringify(previewData, null, 2) : ""}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImportConfirm}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Validation Panel ─── */
function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
  const [expanded, setExpanded] = useState(true);
  const impact = analyzeImpact(issues);

  return (
    <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold">配置验证</span>
          {issues.length > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {impact.errors} 错误 / {impact.warnings} 警告
            </Badge>
          )}
          {issues.length === 0 && (
            <Badge variant="default" className="text-[10px] bg-emerald-600">
              验证通过
            </Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {issues.length > 0 ? (
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-xs",
                    issue.severity === "error"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  )}
                >
                  {issue.severity === "error" ? <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-medium">{issue.field}</p>
                    <p>{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>所有配置项验证通过</span>
            </div>
          )}

          {/* Impact Analysis */}
          <div className={cn("rounded-lg p-3", "bg-slate-50 dark:bg-slate-800")}>
            <h5 className="text-xs font-semibold mb-2">影响分析</h5>
            <ul className="space-y-1">
              {impact.effects.map((e, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Templates Panel ─── */
function TemplatesPanel({
  onApply,
}: {
  onApply: (template: ConfigTemplate) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const categories = ["全部", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = selectedCategory === "全部" ? templates : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          配置模板库
        </h3>
        <div className="flex gap-1">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={selectedCategory === c ? "default" : "outline"}
              onClick={() => setSelectedCategory(c)}
              className="text-xs"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className={cn("rounded-xl border p-4", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{t.name}</h4>
              <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t.description}</p>
            <pre className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] overflow-auto max-h-[80px] mb-3">
              {JSON.stringify(t.config, null, 2)}
            </pre>
            <Button size="sm" className="w-full gap-1.5" onClick={() => onApply(t)}>
              <Zap className="w-3.5 h-3.5" />
              快速应用
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainCore() {
  const [activeTab, setActiveTab] = useState<
    "consensus" | "network" | "storage" | "crypto" | "history" | "importExport" | "templates"
  >("consensus");
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [versions, setVersions] = useState<ConfigVersion[]>(initialVersions);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<ConfigVersion | null>(null);
  const impactChartRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { key: "consensus" as const, label: "共识配置", icon: <Cpu className="w-4 h-4" /> },
    { key: "network" as const, label: "网络配置", icon: <Network className="w-4 h-4" /> },
    { key: "storage" as const, label: "存储配置", icon: <HardDrive className="w-4 h-4" /> },
    { key: "crypto" as const, label: "加密配置", icon: <Shield className="w-4 h-4" /> },
    { key: "history" as const, label: "版本历史", icon: <History className="w-4 h-4" /> },
    { key: "importExport" as const, label: "导入/导出", icon: <Upload className="w-4 h-4" /> },
    { key: "templates" as const, label: "模板库", icon: <Layers className="w-4 h-4" /> },
  ];

  const handleValidate = useCallback((issues: ValidationIssue[]) => {
    setValidationIssues(issues);
  }, []);

  const handleRollback = (v: ConfigVersion) => {
    setRollbackVersion(v);
    setRollbackOpen(true);
  };

  const confirmRollback = () => {
    if (rollbackVersion) {
      const newVersion: ConfigVersion = {
        id: generateId(),
        version: `v1.${versions.length}.0`,
        author: "当前用户",
        time: new Date().toISOString().replace("T", " ").slice(0, 19),
        changes: [`回滚到 ${rollbackVersion.version}`],
        config: rollbackVersion.config,
      };
      setVersions((prev) => [newVersion, ...prev]);
      setRollbackOpen(false);
      setRollbackVersion(null);
    }
  };

  const handleImport = (config: Record<string, any>) => {
    const newVersion: ConfigVersion = {
      id: generateId(),
      version: `v1.${versions.length}.0`,
      author: "当前用户",
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      changes: ["从文件导入配置"],
      config,
    };
    setVersions((prev) => [newVersion, ...prev]);
    alert("配置导入成功");
  };

  const handleApplyTemplate = (template: ConfigTemplate) => {
    const newVersion: ConfigVersion = {
      id: generateId(),
      version: `v1.${versions.length}.0`,
      author: "当前用户",
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      changes: [`应用模板: ${template.name}`],
      config: template.config,
    };
    setVersions((prev) => [newVersion, ...prev]);
    alert(`模板 "${template.name}" 已应用`);
  };

  /* Impact chart */
  useEffect(() => {
    if (activeTab !== "history" || !impactChartRef.current) return;
    const chart = echarts.init(impactChartRef.current);
    const option: echarts.EChartsOption = {
      title: { text: "版本变更趋势", left: "center", textStyle: { fontSize: 14 } },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: versions.map((v) => v.version).reverse() },
      yAxis: { type: "value", name: "变更数" },
      series: [
        {
          data: versions.map((v) => v.changes.length).reverse(),
          type: "bar",
          itemStyle: { color: "#3b82f6" },
        },
      ],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [activeTab, versions]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">链核心管理</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">组网通信、存储管理、数据安全服务、共识管理等核心组件配置</p>
      </div>

      <ValidationPanel issues={validationIssues} />

      {/* Tabs */}
      <div className={cn("rounded-xl border overflow-hidden", "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]")}>
        <div className="flex border-b border-slate-200 dark:border-[#334155] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap",
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
          {activeTab === "consensus" && <ConsensusConfig onValidate={handleValidate} />}
          {activeTab === "network" && <NetworkConfig onValidate={handleValidate} />}
          {activeTab === "storage" && <StorageConfig onValidate={handleValidate} />}
          {activeTab === "crypto" && <CryptoConfig onValidate={handleValidate} />}
          {activeTab === "history" && (
            <div className="space-y-4">
              <VersionHistory versions={versions} onRollback={handleRollback} />
              <div ref={impactChartRef} className="w-full h-64 rounded-xl border border-slate-200 dark:border-[#334155]" />
            </div>
          )}
          {activeTab === "importExport" && <ImportExportPanel onImport={handleImport} />}
          {activeTab === "templates" && <TemplatesPanel onApply={handleApplyTemplate} />}
        </div>
      </div>

      {/* Rollback Confirm Dialog */}
      <Dialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="w-5 h-5" />
              确认回滚
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              确定要回滚到版本 <strong>{rollbackVersion?.version}</strong> 吗？当前配置将被覆盖。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackOpen(false)}>取消</Button>
            <Button onClick={confirmRollback}>确认回滚</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
