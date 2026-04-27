import { useState } from "react";
import {
  FileCode,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Code,
  Copy,
  X,
  ShieldCheck,
  Users,
  Database,
  Fingerprint,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Contracts ─── */
const contractsData = [
  {
    id: "SC-2025-001",
    name: "数据资产存证合约",
    type: "存证合约",
    status: "active",
    version: "v1.2.0",
    deployTime: "2025-01-15 09:30:00",
    deployer: "管理员",
    address: "0x7a6c3e...b2d8f0",
    language: "Solidity",
    calls: 156832,
    lastCall: "2025-04-22 14:32:18",
    desc: "实现数据资产的哈希上链存证，支持数据完整性校验",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataNotary {
    struct NotaryRecord {
        bytes32 dataHash;
        uint256 timestamp;
        address operator;
        string assetId;
    }
    
    mapping(string => NotaryRecord) public records;
    
    event Notarized(string assetId, bytes32 dataHash, uint256 timestamp);
    
    function notarize(string memory assetId, bytes32 dataHash) public {
        records[assetId] = NotaryRecord({
            dataHash: dataHash,
            timestamp: block.timestamp,
            operator: msg.sender,
            assetId: assetId
        });
        emit Notarized(assetId, dataHash, block.timestamp);
    }
    
    function verify(string memory assetId, bytes32 dataHash) public view returns (bool) {
        return records[assetId].dataHash == dataHash;
    }
}`,
  },
  {
    id: "SC-2025-002",
    name: "数据确权合约",
    type: "确权合约",
    status: "active",
    version: "v2.0.1",
    deployTime: "2025-02-01 14:00:00",
    deployer: "管理员",
    address: "0x8b7d4f...c3e9a1",
    language: "Solidity",
    calls: 89341,
    lastCall: "2025-04-22 13:15:42",
    desc: "实现数据资产的确权登记和权属转让",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataOwnership {
    struct Ownership {
        address owner;
        uint256 registerTime;
        string rights;
    }
    
    mapping(string => Ownership) public ownerships;
    
    event Registered(string assetId, address owner);
    event Transferred(string assetId, address from, address to);
    
    function register(string memory assetId, string memory rights) public {
        ownerships[assetId] = Ownership({
            owner: msg.sender,
            registerTime: block.timestamp,
            rights: rights
        });
        emit Registered(assetId, msg.sender);
    }
    
    function transfer(string memory assetId, address newOwner) public {
        require(ownerships[assetId].owner == msg.sender, "Not owner");
        address oldOwner = ownerships[assetId].owner;
        ownerships[assetId].owner = newOwner;
        emit Transferred(assetId, oldOwner, newOwner);
    }
}`,
  },
  {
    id: "SC-2025-003",
    name: "数据流转溯源合约",
    type: "溯源合约",
    status: "active",
    version: "v1.0.5",
    deployTime: "2025-03-10 10:00:00",
    deployer: "管理员",
    address: "0x9c5e2a...d4f0b8",
    language: "Solidity",
    calls: 45210,
    lastCall: "2025-04-22 11:20:56",
    desc: "记录数据资产的全生命周期流转轨迹",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataTrace {
    struct TraceNode {
        string stage;
        address actor;
        uint256 timestamp;
        string action;
        string detail;
    }
    
    mapping(string => TraceNode[]) public traces;
    
    event TraceAdded(string assetId, string stage, address actor);
    
    function addTrace(string memory assetId, string memory stage, string memory action, string memory detail) public {
        traces[assetId].push(TraceNode({
            stage: stage,
            actor: msg.sender,
            timestamp: block.timestamp,
            action: action,
            detail: detail
        }));
        emit TraceAdded(assetId, stage, msg.sender);
    }
    
    function getTrace(string memory assetId) public view returns (TraceNode[] memory) {
        return traces[assetId];
    }
}`,
  },
  {
    id: "SC-2025-004",
    name: "授权管理合约",
    type: "授权合约",
    status: "paused",
    version: "v1.1.0",
    deployTime: "2025-01-20 16:00:00",
    deployer: "管理员",
    address: "0x1d3f7b...e5a2c9",
    language: "Solidity",
    calls: 32156,
    lastCall: "2025-04-21 18:00:00",
    desc: "管理数据资产的访问授权和使用权限",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Authorization {
    struct Auth {
        address grantee;
        uint256 expireTime;
        string permissions;
        bool active;
    }
    
    mapping(string => Auth[]) public auths;
    
    event Authorized(string assetId, address grantee);
    event Revoked(string assetId, address grantee);
    
    function authorize(string memory assetId, address grantee, uint256 duration, string memory permissions) public {
        auths[assetId].push(Auth({
            grantee: grantee,
            expireTime: block.timestamp + duration,
            permissions: permissions,
            active: true
        }));
        emit Authorized(assetId, grantee);
    }
    
    function checkAuth(string memory assetId, address grantee) public view returns (bool) {
        for (uint i = 0; i < auths[assetId].length; i++) {
            if (auths[assetId][i].grantee == grantee && auths[assetId][i].active && auths[assetId][i].expireTime > block.timestamp) {
                return true;
            }
        }
        return false;
    }
}`,
  },
  {
    id: "SC-2025-005",
    name: "数据共享合约",
    type: "共享合约",
    status: "active",
    version: "v1.0.0",
    deployTime: "2025-04-01 09:00:00",
    deployer: "管理员",
    address: "0x2e4a8c...f6b3d0",
    language: "Solidity",
    calls: 12345,
    lastCall: "2025-04-22 09:48:12",
    desc: "实现数据资产的安全共享和收益分配",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataSharing {
    struct Share {
        address sharer;
        address recipient;
        uint256 price;
        bool paid;
    }
    
    mapping(string => Share[]) public shares;
    
    event Shared(string assetId, address recipient, uint256 price);
    
    function shareData(string memory assetId, address recipient, uint256 price) public payable {
        require(msg.value >= price, "Insufficient payment");
        shares[assetId].push(Share({
            sharer: msg.sender,
            recipient: recipient,
            price: price,
            paid: true
        }));
        emit Shared(assetId, recipient, price);
    }
}`,
  },
];

/* ─── Status Badge ─── */
function ContractStatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; class: string }> = {
    active: { text: "运行中", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    paused: { text: "已暂停", class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    inactive: { text: "已停用", class: "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.class)}>
      {c.text}
    </span>
  );
}

/* ─── Detail Drawer ─── */
function ContractDetailDrawer({ contract, onClose }: { contract: typeof contractsData[0]; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"info" | "code">("info");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[560px] bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] overflow-hidden animate-slideInRight flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{contract.name}</h2>
            <span className="text-xs text-slate-500 font-mono">{contract.id}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#334155]">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#334155]">
          {[
            { key: "info" as const, label: "基本信息", icon: <Eye className="w-4 h-4" /> },
            { key: "code" as const, label: "合约代码", icon: <Code className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3 text-sm transition-colors border-b-2",
                activeTab === tab.key
                  ? "text-primary-600 border-primary-600 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 flex items-center justify-center">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{contract.name}</div>
                  <div className="mt-1"><ContractStatusBadge status={contract.status} /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "合约地址", value: contract.address },
                  { label: "合约版本", value: contract.version },
                  { label: "开发语言", value: contract.language },
                  { label: "部署时间", value: contract.deployTime },
                  { label: "部署人", value: contract.deployer },
                  { label: "调用次数", value: contract.calls.toLocaleString() },
                  { label: "最后调用", value: contract.lastCall },
                  { label: "合约类型", value: contract.type },
                ].map((field) => (
                  <div key={field.label} className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{field.label}</div>
                    <div className="text-sm text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{field.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">功能描述</div>
                <p className="text-sm text-slate-700 dark:text-slate-300 p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A]">
                  {contract.desc}
                </p>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre">{contract.code}</pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-[#334155] flex gap-2">
          {contract.status === "active" ? (
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-200 text-sm text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/20">
              <Pause className="w-4 h-4" />
              暂停合约
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-200 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
              <Play className="w-4 h-4" />
              恢复运行
            </button>
          )}
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 dark:border-[#334155] dark:text-slate-400 dark:hover:bg-[#273548]">
            <RotateCcw className="w-4 h-4" />
            升级合约
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainContracts() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [detailContract, setDetailContract] = useState<typeof contractsData[0] | null>(null);

  const types = ["全部", "存证合约", "确权合约", "溯源合约", "授权合约", "共享合约"];

  const filtered = contractsData.filter((c) => {
    if (typeFilter !== "全部" && c.type !== typeFilter) return false;
    if (search && !c.name.includes(search) && !c.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">合约管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">智能合约部署、调用与版本管理</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          部署合约
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "合约总数", value: contractsData.length, icon: <FileCode className="w-4 h-4" />, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/30" },
          { label: "运行中", value: contractsData.filter((c) => c.status === "active").length, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "已暂停", value: contractsData.filter((c) => c.status === "paused").length, icon: <Pause className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "总调用次数", value: contractsData.reduce((acc, c) => acc + c.calls, 0).toLocaleString(), icon: <Zap className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
        ].map((s) => (
          <div key={s.label} className={cn(
            "rounded-xl border p-4 flex items-center gap-3",
            "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
          )}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
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
              placeholder="搜索合约名称、编号..."
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
            <span className="text-xs text-slate-500">类型:</span>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors",
                  typeFilter === t
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#334155]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((contract) => (
          <div
            key={contract.id}
            onClick={() => setDetailContract(contract)}
            className={cn(
              "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  contract.status === "active"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                )}>
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{contract.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500">{contract.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{contract.version}</span>
                  </div>
                </div>
              </div>
              <ContractStatusBadge status={contract.status} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
              {contract.desc}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <span className="font-mono">{contract.address}</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {contract.calls.toLocaleString()} 次调用
              </span>
            </div>
          </div>
        ))}
      </div>

      {detailContract && <ContractDetailDrawer contract={detailContract} onClose={() => setDetailContract(null)} />}
    </div>
  );
}
