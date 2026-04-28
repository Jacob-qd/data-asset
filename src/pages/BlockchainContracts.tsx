import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FileCode, Plus, Search, CheckCircle2, Pause, Zap, Eye, Code,
  Pencil, Trash2, X, Play, AlertTriangle, Copy, Download, ChevronDown,
  ChevronUp, Terminal, Cpu, TrendingUp, TrendingDown, Minus, GitBranch,
  Hammer, Settings, ArrowUpRight, UserCheck, Flame, ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CrudDialog, type FieldConfig } from "@/components/CrudDialog";
import { DetailDrawer } from "@/components/DetailDrawer";
import DataTable from "@/components/DataTable";
import * as echarts from "echarts";

/* ─── Types ─── */
interface CompilationError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

interface GasEstimate {
  functionName: string;
  estimated: number;
  min: number;
  max: number;
  change?: number;
}

interface CompilationResult {
  compilerVersion: string;
  status: "success" | "failed";
  abi: any[];
  bytecode: string;
  gasEstimates: GasEstimate[];
  errors: CompilationError[];
  warnings: CompilationError[];
  steps: { name: string; done: boolean }[];
}

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
  compilation?: CompilationResult;
  owner: string;
}

interface DependencyNode {
  id: string;
  name: string;
  category: number;
}

interface DependencyLink {
  source: string;
  target: string;
  function: string;
}

/* ─── Mock Data Helpers ─── */
const genId = () => Date.now().toString(36).toUpperCase();

const mockAbi = [
  { inputs: [], name: "notarize", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "assetId", type: "string" }, { internalType: "bytes32", name: "dataHash", type: "bytes32" }], name: "notarize", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "assetId", type: "string" }, { internalType: "bytes32", name: "dataHash", type: "bytes32" }], name: "verify", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "string", name: "", type: "string" }], name: "records", outputs: [{ internalType: "bytes32", name: "dataHash", type: "bytes32" }, { internalType: "uint256", name: "timestamp", type: "uint256" }, { internalType: "address", name: "operator", type: "address" }, { internalType: "string", name: "assetId", type: "string" }], stateMutability: "view", type: "function" },
];

const mockGasEstimates: GasEstimate[] = [
  { functionName: "notarize", estimated: 45231, min: 42300, max: 48100 },
  { functionName: "verify", estimated: 2310, min: 2100, max: 2500 },
  { functionName: "constructor", estimated: 125430, min: 120000, max: 131000 },
];

const mockCompilation: CompilationResult = {
  compilerVersion: "Solidity 0.8.19",
  status: "success",
  abi: mockAbi,
  bytecode: "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063...",
  gasEstimates: mockGasEstimates,
  errors: [],
  warnings: [
    { line: 12, column: 5, message: "Unused local variable", severity: "warning" },
    { line: 23, column: 3, message: "Function can be declared view", severity: "warning" },
  ],
  steps: [
    { name: "Parsing", done: true },
    { name: "Compiling", done: true },
    { name: "Optimizing", done: true },
    { name: "Generating artifacts", done: true },
  ],
};

const dependencyData: { nodes: DependencyNode[]; links: DependencyLink[] } = {
  nodes: [
    { id: "SC-2025-001", name: "数据资产存证合约", category: 0 },
    { id: "SC-2025-002", name: "数据确权合约", category: 1 },
    { id: "SC-2025-003", name: "数据流转溯源合约", category: 1 },
    { id: "SC-2025-004", name: "授权管理合约", category: 1 },
    { id: "SC-2025-005", name: "数据共享合约", category: 2 },
  ],
  links: [
    { source: "SC-2025-002", target: "SC-2025-001", function: "verify" },
    { source: "SC-2025-003", target: "SC-2025-002", function: "transfer" },
    { source: "SC-2025-004", target: "SC-2025-002", function: "checkAuth" },
    { source: "SC-2025-005", target: "SC-2025-004", function: "authorize" },
    { source: "SC-2025-003", target: "SC-2025-001", function: "notarize" },
  ],
};

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
    compilation: mockCompilation,
    owner: "0x7a6c3e...b2d8f0",
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
    compilation: { ...mockCompilation, gasEstimates: mockGasEstimates.map(g => ({ ...g, estimated: g.estimated + 2000, change: 2000 })) },
    owner: "0x8b7d4f...c3e9a1",
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
    owner: "0x9c5e2a...d4f0b8",
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
    owner: "0x1d3f7b...e5a2c9",
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
    owner: "0x2e4a8c...f6b3d0",
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

/* ─── Compilation Dialog ─── */
function CompilationDialog({
  open,
  onOpenChange,
  contract,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onSave: (contractId: string, result: CompilationResult) => void;
}) {
  const [compilerVersion, setCompilerVersion] = useState("Solidity 0.8.19");
  const [compiling, setCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [showAbi, setShowAbi] = useState(false);

  const steps = ["Parsing", "Compiling", "Optimizing", "Generating artifacts"];

  const startCompilation = useCallback(() => {
    setCompiling(true);
    setProgress(0);
    setCurrentStep(0);
    setResult(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min((step / steps.length) * 100, 100));
      setCurrentStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setCompiling(false);
        const mockResult: CompilationResult = {
          compilerVersion,
          status: "success",
          abi: contract?.compilation?.abi || mockAbi,
          bytecode: "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063...",
          gasEstimates: contract?.compilation?.gasEstimates || mockGasEstimates,
          errors: [],
          warnings: [
            { line: 12, column: 5, message: "Unused local variable", severity: "warning" },
          ],
          steps: steps.map((s, i) => ({ name: s, done: i < steps.length })),
        };
        setResult(mockResult);
      }
    }, 600);
  }, [compilerVersion, contract]);

  const handleSave = () => {
    if (result && contract) {
      onSave(contract.id, result);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hammer className="w-5 h-5" />
            编译合约 — {contract?.name}
          </DialogTitle>
          <DialogDescription>选择编译器版本并启动编译流程</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>编译器版本</Label>
            <select
              value={compilerVersion}
              onChange={(e) => setCompilerVersion(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155]"
            >
              <option>Solidity 0.8.19</option>
              <option>Solidity 0.8.20</option>
              <option>Solidity 0.8.21</option>
              <option>Go 1.20</option>
              <option>Java 17</option>
            </select>
          </div>

          {!result && !compiling && (
            <Button onClick={startCompilation} className="w-full">
              <Hammer className="w-4 h-4 mr-1" />
              开始编译
            </Button>
          )}

          {compiling && (
            <div className="space-y-3">
              <Progress value={progress} />
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                      i < currentStep ? "bg-emerald-500 text-white" : i === currentStep ? "bg-primary-500 text-white animate-pulse" : "bg-slate-200 text-slate-500"
                    )}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span className={cn(i < currentStep && "text-emerald-600", i === currentStep && "font-medium")}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">编译成功</span>
              </div>

              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    警告 ({result.warnings.length})
                  </h4>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                      <span className="font-mono text-amber-700">Line {w.line}:{w.column}</span> — {w.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => setShowAbi(!showAbi)}
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary-600"
                >
                  {showAbi ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  ABI
                </button>
                {showAbi && (
                  <pre className="text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto font-mono">
                    {JSON.stringify(result.abi, null, 2)}
                  </pre>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Bytecode</h4>
                <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded break-all">
                  {result.bytecode.slice(0, 80)}...{result.bytecode.slice(-20)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Gas 估算</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left">函数</th>
                        <th className="px-3 py-2 text-right">估算</th>
                        <th className="px-3 py-2 text-right">最小</th>
                        <th className="px-3 py-2 text-right">最大</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.gasEstimates.map((g) => (
                        <tr key={g.functionName} className="border-t">
                          <td className="px-3 py-2 font-mono">{g.functionName}</td>
                          <td className="px-3 py-2 text-right">{g.estimated.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{g.min.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{g.max.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                保存编译结果
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── ABI Dialog ─── */
function AbiDialog({
  open,
  onOpenChange,
  contract,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onSave: (contractId: string, abi: any[]) => void;
}) {
  const [abiText, setAbiText] = useState("");
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    if (contract?.compilation?.abi) {
      setAbiText(JSON.stringify(contract.compilation.abi, null, 2));
    } else {
      setAbiText("[]");
    }
  }, [contract]);

  const handleCopy = () => {
    navigator.clipboard.writeText(abiText);
  };

  const handleDownload = () => {
    const blob = new Blob([abiText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contract?.name || "contract"}_abi.json`;
    a.click();
  };

  const handleSave = () => {
    try {
      const abi = JSON.parse(abiText);
      if (contract) onSave(contract.id, abi);
      onOpenChange(false);
    } catch {
      alert("JSON 格式错误");
    }
  };

  const abi = useMemo(() => {
    try {
      return JSON.parse(abiText);
    } catch {
      return [];
    }
  }, [abiText]);

  const readFunctions = abi.filter((item: any) => item.type === "function" && (item.stateMutability === "view" || item.stateMutability === "pure"));
  const writeFunctions = abi.filter((item: any) => item.type === "function" && item.stateMutability !== "view" && item.stateMutability !== "pure");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            ABI 管理 — {contract?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5 mr-1" />
              复制
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5 mr-1" />
              下载 JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInterface(!showInterface)}>
              <Terminal className="w-3.5 h-3.5 mr-1" />
              {showInterface ? "隐藏接口" : "生成接口"}
            </Button>
          </div>

          {!showInterface ? (
            <textarea
              value={abiText}
              onChange={(e) => setAbiText(e.target.value)}
              className="w-full h-64 px-3 py-2 rounded-lg border text-xs font-mono bg-slate-900 text-slate-300 border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              spellCheck={false}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  读取函数
                </h4>
                <div className="space-y-2">
                  {readFunctions.map((fn: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3 text-sm">
                      <div className="font-mono font-medium">{fn.name}()</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {fn.inputs?.length > 0 ? `参数: ${fn.inputs.map((inp: any) => `${inp.type} ${inp.name}`).join(", ")}` : "无参数"}
                      </div>
                      {fn.outputs?.length > 0 && (
                        <div className="text-xs text-emerald-600 mt-1">
                          返回: {fn.outputs.map((out: any) => out.type).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                  {readFunctions.length === 0 && <div className="text-xs text-slate-400">无读取函数</div>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Pencil className="w-4 h-4 text-amber-500" />
                  写入函数
                </h4>
                <div className="space-y-2">
                  {writeFunctions.map((fn: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3 text-sm">
                      <div className="font-mono font-medium">{fn.name}()</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {fn.inputs?.length > 0 ? `参数: ${fn.inputs.map((inp: any) => `${inp.type} ${inp.name}`).join(", ")}` : "无参数"}
                      </div>
                    </div>
                  ))}
                  {writeFunctions.length === 0 && <div className="text-xs text-slate-400">无写入函数</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>保存 ABI</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Pause/Resume Dialog ─── */
function PauseResumeDialog({
  open,
  onOpenChange,
  contract,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onConfirm: (contractId: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const isPause = contract?.status === "active";

  const handleConfirm = () => {
    if (contract && reason.trim()) {
      onConfirm(contract.id, reason.trim());
      onOpenChange(false);
      setReason("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPause ? <Pause className="w-5 h-5 text-amber-500" /> : <Play className="w-5 h-5 text-emerald-500" />}
            {isPause ? "暂停合约" : "恢复合约"} — {contract?.name}
          </DialogTitle>
          <DialogDescription>
            {isPause ? "暂停将阻止新的调用，请填写原因。" : "恢复合约将重新允许调用，请填写原因。"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isPause ? "暂停原因" : "恢复原因"} <span className="text-red-500">*</span></Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`请输入${isPause ? "暂停" : "恢复"}原因...`}
              className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleConfirm} disabled={!reason.trim()}>
            确认{isPause ? "暂停" : "恢复"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Destroy Dialog ─── */
function DestroyDialog({
  open,
  onOpenChange,
  contract,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onConfirm: (contractId: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    if (open) { setStep(0); setConfirmName(""); }
  }, [open]);

  const steps = [
    "您即将永久销毁此合约，此操作不可撤销。",
    "合约销毁后，所有关联数据将无法恢复。",
    `请输入合约名称 "${contract?.name}" 以确认销毁：`,
  ];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else if (contract && confirmName === contract.name) {
      onConfirm(contract.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Flame className="w-5 h-5" />
            销毁合约 — {contract?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(
                "h-2 flex-1 rounded-full",
                i <= step ? "bg-red-500" : "bg-slate-200"
              )} />
            ))}
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">{steps[step]}</p>
          </div>
          {step === 2 && (
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`输入 "${contract?.name}"`}
              className="mt-2"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            variant="destructive"
            onClick={handleNext}
            disabled={step === 2 && confirmName !== contract?.name}
          >
            {step < 2 ? "下一步" : "确认销毁"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Transfer Ownership Dialog ─── */
function TransferOwnershipDialog({
  open,
  onOpenChange,
  contract,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onConfirm: (contractId: string, newOwner: string) => void;
}) {
  const [newOwner, setNewOwner] = useState("");

  const handleConfirm = () => {
    if (contract && newOwner.trim()) {
      onConfirm(contract.id, newOwner.trim());
      onOpenChange(false);
      setNewOwner("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            转让所有权 — {contract?.name}
          </DialogTitle>
          <DialogDescription>请输入新所有者地址</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>当前所有者</Label>
            <div className="text-sm font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">{contract?.owner}</div>
          </div>
          <div className="space-y-2">
            <Label>新所有者地址 <span className="text-red-500">*</span></Label>
            <Input
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleConfirm} disabled={!newOwner.trim()}>
            确认转让
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Dependency Graph Component ─── */
function DependencyGraph({ onNodeClick }: { onNodeClick: (id: string) => void }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === "node") return params.data.name;
          if (params.dataType === "edge") return `${params.data.function}()`;
          return "";
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          animation: true,
          roam: true,
          label: { show: true, position: "bottom", fontSize: 11 },
          force: { repulsion: 200, edgeLength: 120 },
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: [0, 8],
          data: dependencyData.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            symbolSize: n.category === 0 ? 50 : 40,
            itemStyle: {
              color: n.category === 0 ? "#10B981" : n.category === 1 ? "#3B82F6" : "#F59E0B",
            },
          })),
          links: dependencyData.links.map((l) => ({
            source: l.source,
            target: l.target,
            function: l.function,
            lineStyle: { curveness: 0.1 },
            label: { show: true, formatter: `${l.function}()`, fontSize: 9, color: "#64748B" },
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);
    chartInstance.current.on("click", (params: any) => {
      if (params.dataType === "node") {
        onNodeClick(params.data.id);
      }
    });

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [onNodeClick]);

  return <div ref={chartRef} className="w-full h-[400px]" />;
}

/* ─── Gas Analysis Component ─── */
function GasAnalysis({ contract }: { contract: Contract | null }) {
  const gasData = contract?.compilation?.gasEstimates || [];

  const columns = [
    { key: "functionName", title: "函数", render: (row: GasEstimate) => <span className="font-mono text-xs">{row.functionName}</span> },
    { key: "estimated", title: "估算 Gas", render: (row: GasEstimate) => row.estimated.toLocaleString() },
    { key: "min", title: "最小 Gas", render: (row: GasEstimate) => <span className="text-slate-500">{row.min.toLocaleString()}</span> },
    { key: "max", title: "最大 Gas", render: (row: GasEstimate) => <span className="text-slate-500">{row.max.toLocaleString()}</span> },
    {
      key: "change",
      title: "变化",
      render: (row: GasEstimate) => {
        if (row.change === undefined) return <Minus className="w-4 h-4 text-slate-400" />;
        if (row.change > 0) return <div className="flex items-center gap-1 text-red-500 text-xs"><TrendingUp className="w-3.5 h-3.5" />+{row.change.toLocaleString()}</div>;
        if (row.change < 0) return <div className="flex items-center gap-1 text-emerald-500 text-xs"><TrendingDown className="w-3.5 h-3.5" />{row.change.toLocaleString()}</div>;
        return <Minus className="w-4 h-4 text-slate-400" />;
      },
    },
  ];

  const suggestions = [
    "Use calldata instead of memory for external function parameters",
    "Mark pure/view functions as external when possible",
    "Use immutable variables instead of storage for constants",
    "Pack struct variables to reduce storage slots",
    "Use unchecked blocks for safe arithmetic operations",
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={gasData}
        rowKey={(row) => row.functionName}
        pagination={false}
      />
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-1">
          <Zap className="w-4 h-4 text-amber-500" />
          Gas 优化建议
        </h4>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
              <span className="text-amber-600 font-medium">{i + 1}.</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Contract Detail Sheet with Tabs ─── */
function ContractDetailSheet({
  open,
  onOpenChange,
  contract,
  onEdit,
  onDelete,
  onCompile,
  onAbi,
  onPauseResume,
  onDestroy,
  onTransfer,
  onUpgrade,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onEdit: () => void;
  onDelete: () => void;
  onCompile: () => void;
  onAbi: () => void;
  onPauseResume: () => void;
  onDestroy: () => void;
  onTransfer: () => void;
  onUpgrade: () => void;
  onNavigate: (id: string) => void;
}) {
  if (!contract) return null;

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
    { key: "owner", label: "所有者" },
  ];

  const drawerData = {
    ...contract,
    status:
      contract.status === "active"
        ? "运行中"
        : contract.status === "paused"
          ? "已暂停"
          : "已停用",
    calls: contract.calls.toLocaleString(),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            {contract.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onCompile}>
              <Hammer className="w-3.5 h-3.5 mr-1" />
              编译
            </Button>
            <Button variant="outline" size="sm" onClick={onAbi}>
              <Code className="w-3.5 h-3.5 mr-1" />
              ABI
            </Button>
            <Button variant="outline" size="sm" onClick={onPauseResume}>
              {contract.status === "active" ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              {contract.status === "active" ? "暂停" : "恢复"}
            </Button>
            <Button variant="outline" size="sm" onClick={onTransfer}>
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              转让所有权
            </Button>
            <Button variant="outline" size="sm" onClick={onUpgrade}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              升级
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDestroy}>
              <Flame className="w-3.5 h-3.5 mr-1" />
              销毁
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1" />
              编辑
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              删除
            </Button>
          </div>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="gas">Gas分析</TabsTrigger>
              <TabsTrigger value="deps">依赖图</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-4 pr-2">
                {detailFields.map((field, index) => {
                  const rawValue = drawerData[field.key as keyof typeof drawerData];
                  const value = typeof rawValue === "string" ? rawValue : String(rawValue ?? "-");
                  return (
                    <div key={field.key} className="space-y-1">
                      {index > 0 && <div className="border-t border-slate-100 dark:border-[#334155] mb-3" />}
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{field.label}</p>
                      {field.type === "badge" ? (
                        <Badge variant="outline" className="font-normal">{value || "-"}</Badge>
                      ) : (
                        <span className="text-sm text-slate-800 dark:text-slate-200">{value || "-"}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="gas" className="mt-4">
              <GasAnalysis contract={contract} />
            </TabsContent>

            <TabsContent value="deps" className="mt-4">
              <DependencyGraph onNodeClick={(id) => { onOpenChange(false); onNavigate(id); }} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main ─── */
export default function BlockchainContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [compileOpen, setCompileOpen] = useState(false);
  const [abiOpen, setAbiOpen] = useState(false);
  const [pauseResumeOpen, setPauseResumeOpen] = useState(false);
  const [destroyOpen, setDestroyOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

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
    setDetailOpen(true);
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
        owner: data.address || genId(),
      };
      setContracts([...contracts, newContract]);
    } else if (dialogMode === "edit" && selectedContract) {
      setContracts(
        contracts.map((c) =>
          c.id === selectedContract.id
            ? { ...c, ...data, calls: Number(data.calls) || c.calls }
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

  const handleSaveCompilation = (contractId: string, result: CompilationResult) => {
    setContracts(contracts.map((c) =>
      c.id === contractId ? { ...c, compilation: result } : c
    ));
  };

  const handleSaveAbi = (contractId: string, abi: any[]) => {
    setContracts(contracts.map((c) =>
      c.id === contractId
        ? { ...c, compilation: { ...(c.compilation || mockCompilation), abi } }
        : c
    ));
  };

  const handlePauseResume = (contractId: string, _reason: string) => {
    setContracts(contracts.map((c) =>
      c.id === contractId
        ? { ...c, status: c.status === "active" ? "paused" : "active" }
        : c
    ));
  };

  const handleDestroy = (contractId: string) => {
    setContracts(contracts.filter((c) => c.id !== contractId));
  };

  const handleTransfer = (contractId: string, newOwner: string) => {
    setContracts(contracts.map((c) =>
      c.id === contractId ? { ...c, owner: newOwner } : c
    ));
  };

  const handleUpgrade = (contract: Contract) => {
    navigate(`/contract-deploy?contract=${contract.id}`);
  };

  const handleNavigate = (id: string) => {
    const target = contracts.find((c) => c.id === id);
    if (target) {
      setSelectedContract(target);
      setDetailOpen(true);
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
        { label: "Java", value: "Java" },
      ],
      required: true,
    },
    { key: "calls", label: "调用次数", type: "number" },
    { key: "lastCall", label: "最后调用", type: "text" },
    { key: "desc", label: "功能描述", type: "textarea" },
    { key: "code", label: "合约代码", type: "textarea" },
  ];

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
            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-[#334155] flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); handleView(contract); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Eye className="w-3.5 h-3.5" />
                查看
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(contract); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(contract); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleViewCode(contract); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Code className="w-3.5 h-3.5" />
                代码
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedContract(contract); setCompileOpen(true); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Hammer className="w-3.5 h-3.5" />
                编译
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedContract(contract); setAbiOpen(true); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#334155]"
              >
                <Terminal className="w-3.5 h-3.5" />
                ABI
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContract(contract);
                  if (contract.status === "active") {
                    setPauseResumeOpen(true);
                  } else {
                    handlePauseResume(contract.id, "手动恢复");
                  }
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  contract.status === "active"
                    ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                )}
              >
                {contract.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {contract.status === "active" ? "暂停" : "恢复"}
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

      {/* Contract Detail Sheet with Tabs */}
      <ContractDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contract={selectedContract}
        onEdit={() => {
          setDetailOpen(false);
          if (selectedContract) handleEdit(selectedContract);
        }}
        onDelete={() => {
          setDetailOpen(false);
          if (selectedContract) handleDelete(selectedContract);
        }}
        onCompile={() => { setCompileOpen(true); }}
        onAbi={() => { setAbiOpen(true); }}
        onPauseResume={() => {
          if (selectedContract?.status === "active") {
            setPauseResumeOpen(true);
          } else if (selectedContract) {
            handlePauseResume(selectedContract.id, "手动恢复");
          }
        }}
        onDestroy={() => { setDestroyOpen(true); }}
        onTransfer={() => { setTransferOpen(true); }}
        onUpgrade={() => { if (selectedContract) handleUpgrade(selectedContract); }}
        onNavigate={handleNavigate}
      />

      {/* Compilation Dialog */}
      <CompilationDialog
        open={compileOpen}
        onOpenChange={setCompileOpen}
        contract={selectedContract}
        onSave={handleSaveCompilation}
      />

      {/* ABI Dialog */}
      <AbiDialog
        open={abiOpen}
        onOpenChange={setAbiOpen}
        contract={selectedContract}
        onSave={handleSaveAbi}
      />

      {/* Pause/Resume Dialog */}
      <PauseResumeDialog
        open={pauseResumeOpen}
        onOpenChange={setPauseResumeOpen}
        contract={selectedContract}
        onConfirm={handlePauseResume}
      />

      {/* Destroy Dialog */}
      <DestroyDialog
        open={destroyOpen}
        onOpenChange={setDestroyOpen}
        contract={selectedContract}
        onConfirm={handleDestroy}
      />

      {/* Transfer Ownership Dialog */}
      <TransferOwnershipDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        contract={selectedContract}
        onConfirm={handleTransfer}
      />

      {/* Code Viewer */}
      {codeViewerOpen && selectedContract && (
        <ContractCodeViewer contract={selectedContract} onClose={() => setCodeViewerOpen(false)} />
      )}
    </div>
  );
}
