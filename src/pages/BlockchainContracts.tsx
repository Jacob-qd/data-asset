import { useState } from "react";
import {
  FileCode,
  Plus,
  Search,
  CheckCircle2,
  Pause,
  Zap,
  Eye,
  Code,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";

/* ─── Types ─── */
interface Contract {
  id: string;
  name: string;
  type: string;
  status: string;
  version: string;
  deployTime: string;
  deployer: string;
  address: string;
  language: string;
  calls: number;
  lastCall: string;
  desc: string;
  code: string;
}

/* ─── Initial Data ─── */
const initialContracts: Contract[] = [
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
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract DataNotary {\n    struct NotaryRecord {\n        bytes32 dataHash;\n        uint256 timestamp;\n        address operator;\n        string assetId;\n    }\n    \n    mapping(string => NotaryRecord) public records;\n    \n    event Notarized(string assetId, bytes32 dataHash, uint256 timestamp);\n    \n    function notarize(string memory assetId, bytes32 dataHash) public {\n        records[assetId] = NotaryRecord({\n            dataHash: dataHash,\n            timestamp: block.timestamp,\n            operator: msg.sender,\n            assetId: assetId\n        });\n        emit Notarized(assetId, dataHash, block.timestamp);\n    }\n    \n    function verify(string memory assetId, bytes32 dataHash) public view returns (bool) {\n        return records[assetId].dataHash == dataHash;\n    }\n}`,
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
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract DataOwnership {\n    struct Ownership {\n        address owner;\n        uint256 registerTime;\n        string rights;\n    }\n    \n    mapping(string => Ownership) public ownerships;\n    \n    event Registered(string assetId, address owner);\n    event Transferred(string assetId, address from, address to);\n    \n    function register(string memory assetId, string memory rights) public {\n        ownerships[assetId] = Ownership({\n            owner: msg.sender,\n            registerTime: block.timestamp,\n            rights: rights\n        });\n        emit Registered(assetId, msg.sender);\n    }\n    \n    function transfer(string memory assetId, address newOwner) public {\n        require(ownerships[assetId].owner == msg.sender, "Not owner");\n        address oldOwner = ownerships[assetId].owner;\n        ownerships[assetId].owner = newOwner;\n        emit Transferred(assetId, oldOwner, newOwner);\n    }\n}`,
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
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract DataTrace {\n    struct TraceNode {\n        string stage;\n        address actor;\n        uint256 timestamp;\n        string action;\n        string detail;\n    }\n    \n    mapping(string => TraceNode[]) public traces;\n    \n    event TraceAdded(string assetId, string stage, address actor);\n    \n    function addTrace(string memory assetId, string memory stage, string memory action, string memory detail) public {\n        traces[assetId].push(TraceNode({\n            stage: stage,\n            actor: msg.sender,\n            timestamp: block.timestamp,\n            action: action,\n            detail: detail\n        }));\n        emit TraceAdded(assetId, stage, msg.sender);\n    }\n    \n    function getTrace(string memory assetId) public view returns (TraceNode[] memory) {\n        return traces[assetId];\n    }\n}`,
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
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Authorization {\n    struct Auth {\n        address grantee;\n        uint256 expireTime;\n        string permissions;\n        bool active;\n    }\n    \n    mapping(string => Auth[]) public auths;\n    \n    event Authorized(string assetId, address grantee);\n    event Revoked(string assetId, address grantee);\n    \n    function authorize(string memory assetId, address grantee, uint256 duration, string memory permissions) public {\n        auths[assetId].push(Auth({\n            grantee: grantee,\n            expireTime: block.timestamp + duration,\n            permissions: permissions,\n            active: true\n        }));\n        emit Authorized(assetId, grantee);\n    }\n    \n    function checkAuth(string memory assetId, address grantee) public view returns (bool) {\n        for (uint i = 0; i < auths[assetId].length; i++) {\n            if (auths[assetId][i].grantee == grantee && auths[assetId][i].active && auths[assetId][i].expireTime > block.timestamp) {\n                return true;\n            }\n        }\n        return false;\n    }\n}`,
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
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract DataSharing {\n    struct Share {\n        address sharer;\n        address recipient;\n        uint256 price;\n        bool paid;\n    }\n    \n    mapping(string => Share[]) public shares;\n    \n    event Shared(string assetId, address recipient, uint256 price);\n    \n    function shareData(string memory assetId, address recipient, uint256 price) public payable {\n        require(msg.value >= price, "Insufficient payment");\n        shares[assetId].push(Share({\n            sharer: msg.sender,\n            recipient: recipient,\n            price: price,\n            paid: true\n        }));\n        emit Shared(assetId, recipient, price);\n    }\n}`,
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

/* ─── Code Viewer ─── */
function ContractCodeViewer({ contract, onClose }: { contract: Contract; onClose: () => void }) {
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre">{contract.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BlockchainContracts() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);

  const types = ["全部", "存证合约", "确权合约", "溯源合约", "授权合约", "共享合约"];

  const filtered = contracts.filter((c) => {
    if (typeFilter !== "全部" && c.type !== typeFilter) return false;
    if (search && !c.name.includes(search) && !c.id.includes(search)) return false;
    return true;
  });

  const handleCreate = () => {
    setSelectedContract(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setSelectedContract(contract);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setDrawerOpen(true);
  };

  const handleViewCode = (contract: Contract) => {
    setSelectedContract(contract);
    setCodeViewerOpen(true);
  };

  const handleSubmit = (data: Record<string, any>) => {
    if (dialogMode === "create") {
      const newId = `SC-2025-${String(contracts.length + 1).padStart(3, "0")}`;
      const newContract: Contract = {
        id: newId,
        name: data.name || "",
        type: data.type || "存证合约",
        status: data.status || "active",
        version: data.version || "v1.0.0",
        deployTime: data.deployTime || new Date().toLocaleString("zh-CN"),
        deployer: data.deployer || "管理员",
        address: data.address || "",
        language: data.language || "Solidity",
        calls: Number(data.calls) || 0,
        lastCall: data.lastCall || "-",
        desc: data.desc || "",
        code: data.code || "",
      };
      setContracts([...contracts, newContract]);
    } else if (dialogMode === "edit" && selectedContract) {
      setContracts(
        contracts.map((c) =>
          c.id === selectedContract.id
            ? {
                ...c,
                ...data,
                calls: Number(data.calls) || c.calls,
              }
            : c
        )
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedContract) {
      setContracts(contracts.filter((c) => c.id !== selectedContract.id));
    }
  };

  const dialogFields: FieldConfig[] = [
    { key: "name", label: "合约名称", type: "text", required: true },
    {
      key: "type",
      label: "合约类型",
      type: "select",
      options: types.filter((t) => t !== "全部").map((t) => ({ label: t, value: t })),
      required: true,
    },
    {
      key: "status",
      label: "状态",
      type: "select",
      options: [
        { label: "运行中", value: "active" },
        { label: "已暂停", value: "paused" },
        { label: "已停用", value: "inactive" },
      ],
      required: true,
    },
    { key: "version", label: "版本", type: "text", required: true },
    { key: "deployTime", label: "部署时间", type: "text" },
    { key: "deployer", label: "部署人", type: "text" },
    { key: "address", label: "合约地址", type: "text" },
    {
      key: "language",
      label: "开发语言",
      type: "select",
      options: [
        { label: "Solidity", value: "Solidity" },
        { label: "Vyper", value: "Vyper" },
        { label: "Go", value: "Go" },
      ],
      required: true,
    },
    { key: "calls", label: "调用次数", type: "number" },
    { key: "lastCall", label: "最后调用", type: "text" },
    { key: "desc", label: "功能描述", type: "textarea" },
    { key: "code", label: "合约代码", type: "textarea" },
  ];

  const detailFields = [
    { key: "id", label: "合约编号" },
    { key: "name", label: "合约名称" },
    { key: "type", label: "合约类型", type: "badge" as const },
    { key: "status", label: "状态", type: "badge" as const },
    { key: "version", label: "版本" },
    { key: "address", label: "合约地址" },
    { key: "language", label: "开发语言", type: "badge" as const },
    { key: "deployTime", label: "部署时间", type: "date" as const },
    { key: "deployer", label: "部署人" },
    { key: "calls", label: "调用次数" },
    { key: "lastCall", label: "最后调用", type: "date" as const },
    { key: "desc", label: "功能描述" },
  ];

  const drawerData = selectedContract
    ? {
        ...selectedContract,
        status:
          selectedContract.status === "active"
            ? "运行中"
            : selectedContract.status === "paused"
              ? "已暂停"
              : "已停用",
        calls: selectedContract.calls.toLocaleString(),
      }
    : {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">合约管理</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">智能合约部署、调用与版本管理</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          部署合约
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "合约总数",
            value: contracts.length,
            icon: <FileCode className="w-4 h-4" />,
            color: "text-violet-600",
            bg: "bg-violet-50 dark:bg-violet-900/30",
          },
          {
            label: "运行中",
            value: contracts.filter((c) => c.status === "active").length,
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/30",
          },
          {
            label: "已暂停",
            value: contracts.filter((c) => c.status === "paused").length,
            icon: <Pause className="w-4 h-4" />,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/30",
          },
          {
            label: "总调用次数",
            value: contracts.reduce((acc, c) => acc + c.calls, 0).toLocaleString(),
            icon: <Zap className="w-4 h-4" />,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/30",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl border p-4 flex items-center gap-3",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
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
      <div
        className={cn(
          "rounded-xl border p-4",
          "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
        )}
      >
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
            onClick={() => handleView(contract)}
            className={cn(
              "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
              "bg-white border-slate-200 dark:bg-[#1E293B] dark:border-[#334155]"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    contract.status === "active"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                  )}
                >
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{contract.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#334155] text-slate-500">
                      {contract.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{contract.version}</span>
                  </div>
                </div>
              </div>
              <ContractStatusBadge status={contract.status} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{contract.desc}</p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <span className="font-mono">{contract.address}</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {contract.calls.toLocaleString()} 次调用
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-[#334155]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(contract);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Eye className="w-3.5 h-3.5" />
                查看
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(contract);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(contract);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCode(contract);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Code className="w-3.5 h-3.5" />
                代码
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CrudDialog */}
      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "create" ? "合约" : selectedContract?.name || "合约"}
        fields={dialogFields}
        data={selectedContract || undefined}
        onSubmit={handleSubmit}
        onDelete={handleConfirmDelete}
        mode={dialogMode}
      />

      {/* DetailDrawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedContract?.name || "合约详情"}
        data={drawerData}
        fields={detailFields}
        onEdit={() => {
          setDrawerOpen(false);
          if (selectedContract) handleEdit(selectedContract);
        }}
        onDelete={() => {
          setDrawerOpen(false);
          if (selectedContract) handleDelete(selectedContract);
        }}
      />

      {/* Code Viewer */}
      {codeViewerOpen && selectedContract && (
        <ContractCodeViewer contract={selectedContract} onClose={() => setCodeViewerOpen(false)} />
      )}
    </div>
  );
}
